from __future__ import annotations

import math
from collections.abc import Mapping
from datetime import datetime
from typing import Any

import numpy as np
import pandas as pd

from app.ai.model_loader import ModelBundle, getModelBundle


MISSING = object()
CATEGORICAL_ALIASES = {
    "Tên thủ tục hành chính": ("procedure_name", "procedureName"),
    "Tên lĩnh vực": ("field_name", "fieldName"),
    "Phòng ban": ("department_name", "departmentName"),
    "Cán bộ xử lý hiện tại": ("officer_name", "officerName"),
}
RECEIVED_AT_KEYS = ("Ngày tiếp nhận", "received_at", "receivedAt")
DEADLINE_AT_KEYS = ("Ngày hẹn trả", "deadline_at", "deadlineAt")


class AIFeatureError(ValueError):
    pass


def buildFeatureFrame(caseData: Any, bundle: ModelBundle | None = None) -> pd.DataFrame:
    modelBundle = bundle or getModelBundle()
    derived = _deriveDateFeatures(caseData)
    values: dict[str, Any] = {}
    missingFeatures: list[str] = []

    for feature in modelBundle.features:
        aliases = CATEGORICAL_ALIASES.get(feature, ())
        rawValue = _readValue(caseData, (feature, *aliases))
        if feature in modelBundle.categorical_features:
            if rawValue is MISSING:
                missingFeatures.append(feature)
                continue
            values[feature] = _categoricalValue(rawValue)
            continue

        if feature in derived:
            rawValue = derived[feature]
        if rawValue is MISSING:
            missingFeatures.append(feature)
            continue
        values[feature] = _numericValue(feature, rawValue, modelBundle.numeric_medians)

    if missingFeatures:
        raise AIFeatureError(f"Missing AI feature(s): {', '.join(missingFeatures)}")
    if values["sla_hours"] <= 0:
        raise AIFeatureError("Invalid AI feature: sla_hours must be greater than 0")

    return pd.DataFrame([values], columns=modelBundle.features)


def _deriveDateFeatures(caseData: Any) -> dict[str, float]:
    receivedValue = _readValue(caseData, RECEIVED_AT_KEYS)
    if receivedValue is MISSING or _isBlank(receivedValue):
        return {}

    receivedAt = _parseDateTime("received_at", receivedValue)
    dayOfWeek = receivedAt.weekday()
    acceptHour = receivedAt.hour + receivedAt.minute / 60.0
    derived = {
        "accept_hour": acceptHour,
        "accept_dayofweek": float(dayOfWeek),
        "accept_day": float(receivedAt.day),
        "accept_month": float(receivedAt.month),
        "accept_weekofyear": float(receivedAt.isocalendar().week),
        "is_weekend": float(dayOfWeek >= 5),
        "dow_sin": math.sin(2 * math.pi * dayOfWeek / 7),
        "dow_cos": math.cos(2 * math.pi * dayOfWeek / 7),
        "hour_sin": math.sin(2 * math.pi * acceptHour / 24),
        "hour_cos": math.cos(2 * math.pi * acceptHour / 24),
    }

    deadlineValue = _readValue(caseData, DEADLINE_AT_KEYS)
    if deadlineValue is not MISSING and not _isBlank(deadlineValue):
        deadlineAt = _parseDateTime("deadline_at", deadlineValue)
        slaHours = (deadlineAt - receivedAt).total_seconds() / 3600.0
        derived["sla_hours"] = slaHours
        derived["sla_log"] = math.log1p(slaHours) if slaHours > -1 else math.nan
    else:
        slaValue = _readValue(caseData, ("sla_hours",))
        if slaValue is not MISSING and not _isBlank(slaValue):
            try:
                slaHours = float(slaValue)
            except (TypeError, ValueError) as exc:
                raise AIFeatureError("Invalid AI feature: sla_hours") from exc
            derived["sla_hours"] = slaHours
            derived["sla_log"] = math.log1p(slaHours) if slaHours > -1 else math.nan
    return derived


def _readValue(caseData: Any, keys: tuple[str, ...]) -> Any:
    if isinstance(caseData, Mapping):
        for key in keys:
            if key in caseData:
                return caseData[key]
        return MISSING
    for key in keys:
        if hasattr(caseData, key):
            return getattr(caseData, key)
    return MISSING


def _parseDateTime(feature: str, value: Any) -> datetime:
    if isinstance(value, datetime):
        return value
    try:
        parsed = pd.to_datetime(value, errors="raise")
    except (TypeError, ValueError) as exc:
        raise AIFeatureError(f"Invalid AI feature: {feature}") from exc
    if isinstance(parsed, pd.Timestamp):
        return parsed.to_pydatetime()
    raise AIFeatureError(f"Invalid AI feature: {feature}")


def _categoricalValue(value: Any) -> str:
    if _isBlank(value):
        return "UNKNOWN"
    normalized = str(value).strip()
    return normalized or "UNKNOWN"


def _numericValue(feature: str, value: Any, medians: dict[str, float]) -> float:
    if value is None or value is pd.NA:
        if feature in medians:
            return medians[feature]
        raise AIFeatureError(f"Invalid AI feature: {feature}")
    try:
        numeric = float(value)
    except (TypeError, ValueError) as exc:
        raise AIFeatureError(f"Invalid AI feature: {feature}") from exc
    if not np.isfinite(numeric):
        if feature in medians:
            return medians[feature]
        raise AIFeatureError(f"Invalid AI feature: {feature}")
    return numeric


def _isBlank(value: Any) -> bool:
    if value is None or value is pd.NA:
        return True
    if isinstance(value, str):
        return not value.strip()
    return isinstance(value, (float, np.floating)) and math.isnan(float(value))
