from __future__ import annotations

import math
from typing import Any

import numpy as np

from app.ai.feature_builder import buildFeatureFrame
from app.ai.model_loader import ModelBundle, getModelBundle


# The export does not declare these coefficients. They were recovered exactly by
# matching the hierarchical prior against all 299 exported held-out predictions.
DEPARTMENT_SMOOTHING = 30.0
PROCEDURE_SMOOTHING = 12.0
PROCEDURE_OFFICER_SMOOTHING = 8.0


def predictCase(caseData: Any) -> dict[str, Any]:
    bundle = getModelBundle()
    featureFrame = buildFeatureFrame(caseData, bundle)
    row = featureFrame.iloc[0]

    procedureName = str(row["Tên thủ tục hành chính"])
    departmentName = str(row["Phòng ban"])
    officerName = str(row["Cán bộ xử lý hiện tại"])

    procPrediction = _predictProcedure(bundle, procedureName)
    priorPrediction = _predictPrior(bundle, procedureName, departmentName, officerName)
    catRatioPrediction = _predictCatRatio(bundle, featureFrame)
    xgbLogPrediction = _predictXgbLog(bundle, featureFrame)

    experts = {
        "PROC": procPrediction,
        "PRIOR": priorPrediction,
        "CAT_RATIO": catRatioPrediction,
        "XGB_LOG": xgbLogPrediction,
    }
    for name, value in experts.items():
        if not math.isfinite(value):
            raise ValueError(f"Non-finite AI prediction: {name}")
        experts[name] = max(0.0, float(value))

    finalPrediction = sum(experts[name] * bundle.weights[name] for name in bundle.weights)
    if not math.isfinite(finalPrediction):
        raise ValueError("Non-finite AI prediction: final")

    return {
        "predicted_processing_hours": max(0.0, float(finalPrediction)),
        "experts": experts,
        "weights": dict(bundle.weights),
        "model_version": bundle.model_version,
    }


def _predictProcedure(bundle: ModelBundle, procedureName: str) -> float:
    return bundle.procedure_stats.get(procedureName, bundle.global_median)


def _predictPrior(
    bundle: ModelBundle,
    procedureName: str,
    departmentName: str,
    officerName: str,
) -> float:
    stats = bundle.prior_stats
    globalPrior = float(stats["global"])

    departmentCount = float(stats["dept_n"].get(departmentName, 0))
    departmentMedian = float(stats["dept_med"].get(departmentName, globalPrior))
    departmentPrior = (
        departmentCount * departmentMedian + DEPARTMENT_SMOOTHING * globalPrior
    ) / (departmentCount + DEPARTMENT_SMOOTHING)

    procedureCount = float(stats["proc_n"].get(procedureName, 0))
    procedureMedian = float(stats["proc_med"].get(procedureName, departmentPrior))
    procedurePrior = (
        procedureCount * procedureMedian + PROCEDURE_SMOOTHING * departmentPrior
    ) / (procedureCount + PROCEDURE_SMOOTHING)

    pair = (procedureName, officerName)
    pairCount = float(stats["po_n"].get(pair, 0))
    pairMedian = float(stats["po_med"].get(pair, procedurePrior))
    return (
        pairCount * pairMedian + PROCEDURE_OFFICER_SMOOTHING * procedurePrior
    ) / (pairCount + PROCEDURE_OFFICER_SMOOTHING)


def _predictCatRatio(bundle: ModelBundle, featureFrame) -> float:
    ratios = [max(0.0, float(model.predict(featureFrame)[0])) for model in bundle.catboost_models]
    return float(np.mean(ratios) * float(featureFrame.iloc[0]["sla_hours"]))


def _predictXgbLog(bundle: ModelBundle, featureFrame) -> float:
    categorical = list(bundle.categorical_features)
    encodedCategorical = bundle.ordinal_encoder.transform(featureFrame[categorical])
    encodedByName = {
        name: encodedCategorical[:, index]
        for index, name in enumerate(categorical)
    }
    columns = []
    for feature in bundle.features:
        if feature in encodedByName:
            columns.append(encodedByName[feature])
        else:
            columns.append(featureFrame[feature].to_numpy(dtype=np.float32))
    modelInput = np.column_stack(columns).astype(np.float32, copy=False)

    predictions = []
    for model in bundle.xgboost_models:
        logPrediction = float(model.predict(modelInput)[0])
        predictions.append(max(0.0, math.expm1(logPrediction)))
    return float(np.mean(predictions))
