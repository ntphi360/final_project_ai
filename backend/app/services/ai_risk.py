import math
from datetime import datetime
from typing import Literal, TypedDict


RiskLevel = Literal["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]
TimeStatus = Literal["ON_TIME", "OVERDUE"]

PROCESSING_STATUS = "Đang xử lý"

MEDIUM_MIN_RATIO = 0.50
HIGH_MIN_RATIO = 0.75
VERY_HIGH_MIN_RATIO = 1.00

RISK_LABELS: dict[RiskLevel, str] = {
    "LOW": "Thấp",
    "MEDIUM": "Trung bình",
    "HIGH": "Cao",
    "VERY_HIGH": "Rất cao",
}


class CaseRiskMetrics(TypedDict):
    sla_hours: float | None
    risk_ratio: float | None
    risk_percentage: float | None
    risk_level: RiskLevel | None
    risk_label: str
    time_status: TimeStatus | None


def calculateCaseRisk(
    predictedProcessingHours: float | None,
    receivedAt: datetime | None,
    deadlineAt: datetime | None,
    status: str | None,
    currentTime: datetime | None = None,
) -> CaseRiskMetrics:
    slaHours = _calculateSlaHours(receivedAt, deadlineAt)
    timeStatus = _getTimeStatus(
        status=status,
        deadlineAt=deadlineAt,
        currentTime=currentTime,
    )
    isOverdue = timeStatus == "OVERDUE"

    if (
        predictedProcessingHours is None
        or not math.isfinite(predictedProcessingHours)
        or slaHours is None
        or slaHours <= 0
    ):
        return _unavailableRisk(slaHours, timeStatus, isOverdue)

    riskRatio = predictedProcessingHours / slaHours
    if not math.isfinite(riskRatio):
        return _unavailableRisk(slaHours, timeStatus, isOverdue)

    riskLevel: RiskLevel = "VERY_HIGH" if isOverdue else _classifyRiskRatio(riskRatio)
    return {
        "sla_hours": slaHours,
        "risk_ratio": riskRatio,
        "risk_percentage": riskRatio * 100.0,
        "risk_level": riskLevel,
        "risk_label": RISK_LABELS[riskLevel],
        "time_status": timeStatus,
    }


def _calculateSlaHours(
    receivedAt: datetime | None,
    deadlineAt: datetime | None,
) -> float | None:
    if not isinstance(receivedAt, datetime) or not isinstance(deadlineAt, datetime):
        return None
    try:
        slaHours = (deadlineAt - receivedAt).total_seconds() / 3600.0
    except (OverflowError, TypeError):
        return None
    return slaHours if math.isfinite(slaHours) else None


def _classifyRiskRatio(riskRatio: float) -> RiskLevel:
    if riskRatio < MEDIUM_MIN_RATIO:
        return "LOW"
    if riskRatio < HIGH_MIN_RATIO:
        return "MEDIUM"
    if riskRatio < VERY_HIGH_MIN_RATIO:
        return "HIGH"
    return "VERY_HIGH"


def _getTimeStatus(
    status: str | None,
    deadlineAt: datetime | None,
    currentTime: datetime | None,
) -> TimeStatus | None:
    if not isinstance(deadlineAt, datetime):
        return None

    comparisonTime = currentTime
    if comparisonTime is None:
        comparisonTime = datetime.now(tz=deadlineAt.tzinfo)

    try:
        isOverdue = status == PROCESSING_STATUS and comparisonTime > deadlineAt
    except TypeError:
        return None
    return "OVERDUE" if isOverdue else "ON_TIME"


def _unavailableRisk(
    slaHours: float | None,
    timeStatus: TimeStatus | None,
    isOverdue: bool,
) -> CaseRiskMetrics:
    riskLevel: RiskLevel | None = "VERY_HIGH" if isOverdue else None
    return {
        "sla_hours": slaHours,
        "risk_ratio": None,
        "risk_percentage": None,
        "risk_level": riskLevel,
        "risk_label": RISK_LABELS[riskLevel] if riskLevel else "Chưa có AI",
        "time_status": timeStatus,
    }
