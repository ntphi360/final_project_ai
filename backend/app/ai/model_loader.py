from __future__ import annotations

import json
import math
import warnings
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any

import joblib
from catboost import CatBoostRegressor
from xgboost import XGBRegressor


BACKEND_DIR = Path(__file__).resolve().parents[2]
MODEL_DIR = BACKEND_DIR / "ai_models" / "v3"

CATBOOST_FILES = (
    "cat_ratio_seed_42.cbm",
    "cat_ratio_seed_3407.cbm",
    "cat_ratio_seed_2026.cbm",
)
XGBOOST_FILES = (
    "xgb_log_seed_42.json",
    "xgb_log_seed_3407.json",
    "xgb_log_seed_2026.json",
)
REQUIRED_FILES = (
    "model_bundle.json",
    "historical_priors.joblib",
    "ordinal_encoder.joblib",
    *CATBOOST_FILES,
    *XGBOOST_FILES,
)


class AIArtifactError(RuntimeError):
    pass


@dataclass(frozen=True)
class ModelBundle:
    model_version: str
    metadata: dict[str, Any]
    features: tuple[str, ...]
    categorical_features: tuple[str, ...]
    catboost_models: tuple[CatBoostRegressor, ...]
    xgboost_models: tuple[XGBRegressor, ...]
    procedure_stats: dict[str, float]
    global_median: float
    prior_stats: dict[str, Any]
    numeric_medians: dict[str, float]
    ordinal_encoder: Any
    weights: dict[str, float]
    uncertainty: dict[str, float]
    loaded_artifacts: tuple[str, ...]
    compatibility_warnings: tuple[str, ...]


def _requireArtifacts() -> None:
    if not MODEL_DIR.is_dir():
        raise AIArtifactError(f"Missing AI artifact directory: {MODEL_DIR}")
    for filename in REQUIRED_FILES:
        if not (MODEL_DIR / filename).is_file():
            raise AIArtifactError(f"Missing AI artifact: {filename}")


def _loadMetadata() -> dict[str, Any]:
    try:
        return json.loads((MODEL_DIR / "model_bundle.json").read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise AIArtifactError("Invalid AI artifact: model_bundle.json") from exc


def _validateMetadata(metadata: dict[str, Any]) -> None:
    if metadata.get("architecture") != "Hybrid Mixture-of-Experts":
        raise AIArtifactError("Invalid AI metadata: architecture")
    if metadata.get("selected_meta_model") != "STATIC_ENSEMBLE":
        raise AIArtifactError("Invalid AI metadata: selected_meta_model")
    if metadata.get("experts") != ["PROC", "PRIOR", "CAT_RATIO", "XGB_LOG"]:
        raise AIArtifactError("Invalid AI metadata: experts")
    features = metadata.get("features")
    if not isinstance(features, list) or not features:
        raise AIArtifactError("Invalid AI metadata: features")
    weights = metadata.get("final_static_weights")
    if not isinstance(weights, dict) or set(weights) != {"PROC", "PRIOR", "CAT_RATIO", "XGB_LOG"}:
        raise AIArtifactError("Invalid AI metadata: final_static_weights")
    if not all(math.isfinite(float(value)) and float(value) >= 0 for value in weights.values()):
        raise AIArtifactError("Invalid AI metadata: ensemble weight")
    if not math.isclose(sum(float(value) for value in weights.values()), 1.0, abs_tol=1e-9):
        raise AIArtifactError("Invalid AI metadata: ensemble weights must sum to 1")


@lru_cache(maxsize=1)
def getModelBundle() -> ModelBundle:
    _requireArtifacts()
    metadata = _loadMetadata()
    _validateMetadata(metadata)

    try:
        priors = joblib.load(MODEL_DIR / "historical_priors.joblib")
        with warnings.catch_warnings(record=True) as caughtWarnings:
            warnings.simplefilter("always")
            encoder = joblib.load(MODEL_DIR / "ordinal_encoder.joblib")
    except Exception as exc:
        raise AIArtifactError("Invalid AI statistics or encoder artifact") from exc

    requiredPriorKeys = {"procedure_map", "global_median", "hierarchical_prior", "numeric_medians"}
    if not isinstance(priors, dict) or not requiredPriorKeys.issubset(priors):
        raise AIArtifactError("Invalid AI artifact: historical_priors.joblib")

    features = tuple(str(feature) for feature in metadata["features"])
    categoricalFeatures = tuple(str(feature) for feature in getattr(encoder, "feature_names_in_", ()))
    if not categoricalFeatures or features[: len(categoricalFeatures)] != categoricalFeatures:
        raise AIArtifactError("AI encoder features do not match model metadata")

    catboostModels: list[CatBoostRegressor] = []
    expectedCatIterations = int(metadata["cat_final_iterations"])
    for filename in CATBOOST_FILES:
        model = CatBoostRegressor()
        model.load_model(str(MODEL_DIR / filename))
        if tuple(model.feature_names_) != features:
            raise AIArtifactError(f"AI feature mismatch: {filename}")
        if model.tree_count_ != expectedCatIterations:
            raise AIArtifactError(f"AI iteration mismatch: {filename}")
        catboostModels.append(model)

    xgboostModels: list[XGBRegressor] = []
    expectedXgbIterations = int(metadata["xgb_final_iterations"])
    for filename in XGBOOST_FILES:
        model = XGBRegressor()
        model.load_model(str(MODEL_DIR / filename))
        if model.get_booster().num_features() != len(features):
            raise AIArtifactError(f"AI feature mismatch: {filename}")
        if model.get_booster().num_boosted_rounds() != expectedXgbIterations:
            raise AIArtifactError(f"AI iteration mismatch: {filename}")
        xgboostModels.append(model)

    return ModelBundle(
        model_version=str(metadata.get("version", "v3")).lower(),
        metadata=metadata,
        features=features,
        categorical_features=categoricalFeatures,
        catboost_models=tuple(catboostModels),
        xgboost_models=tuple(xgboostModels),
        procedure_stats={str(key): float(value) for key, value in priors["procedure_map"].items()},
        global_median=float(priors["global_median"]),
        prior_stats=priors["hierarchical_prior"],
        numeric_medians={str(key): float(value) for key, value in priors["numeric_medians"].items()},
        ordinal_encoder=encoder,
        weights={key: float(value) for key, value in metadata["final_static_weights"].items()},
        uncertainty={key: float(value) for key, value in metadata.get("uncertainty", {}).items()},
        loaded_artifacts=REQUIRED_FILES,
        compatibility_warnings=tuple(str(item.message) for item in caughtWarnings),
    )
