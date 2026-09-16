import math
from datetime import datetime
from typing import Literal, TypedDict


RiskLevel = Literal["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]
TimeStatus = Literal["ON_TIME", "OVERDUE"]

MEDIUM_MIN_RATIO = 0.50
HIGH_MIN_RATIO = 0.75
VERY_HIGH_MIN_RATIO = 1.00
AI_HIGH_MIN_RATIO = 1.00
AI_VERY_HIGH_MIN_RATIO = 1.20

RISK_PRIORITY: dict[RiskLevel, int] = {
    "LOW": 1,
    "MEDIUM": 2,
    "HIGH": 3,
    "VERY_HIGH": 4,
}

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
        deadlineAt=deadlineAt,
        currentTime=currentTime,
    )
    isOverdue = timeStatus == "OVERDUE"
    aiRiskFloor = _calculateAiRiskFloor(predictedProcessingHours, slaHours)
    deadlineRatio, deadlineRisk = _calculateDeadlineRisk(
        receivedAt=receivedAt,
        slaHours=slaHours,
        currentTime=currentTime,
    )
    riskLevel = _getFinalRisk(
        deadlineRisk=deadlineRisk,
        aiRiskFloor=aiRiskFloor,
        isOverdue=isOverdue,
    )

    return {
        "sla_hours": slaHours,
        "risk_ratio": deadlineRatio,
        "risk_percentage": (
            deadlineRatio * 100.0 if deadlineRatio is not None else None
        ),
        "risk_level": riskLevel,
        "risk_label": RISK_LABELS[riskLevel] if riskLevel else "Chưa có AI",
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


def _calculateAiRiskFloor(
    predictedProcessingHours: float | None,
    slaHours: float | None,
) -> RiskLevel | None:
    if (
        predictedProcessingHours is None
        or not math.isfinite(predictedProcessingHours)
        or slaHours is None
        or slaHours <= 0
    ):
        return None

    aiRatio = predictedProcessingHours / slaHours
    if not math.isfinite(aiRatio):
        return None
    if aiRatio >= AI_VERY_HIGH_MIN_RATIO:
        return "VERY_HIGH"
    if aiRatio >= AI_HIGH_MIN_RATIO:
        return "HIGH"
    return None


def _calculateDeadlineRisk(
    receivedAt: datetime | None,
    slaHours: float | None,
    currentTime: datetime | None,
) -> tuple[float | None, RiskLevel | None]:
    if (
        not isinstance(receivedAt, datetime)
        or slaHours is None
        or slaHours <= 0
    ):
        return None, None

    comparisonTime = currentTime
    if comparisonTime is None:
        comparisonTime = datetime.now(tz=receivedAt.tzinfo)

    try:
        elapsedHours = (comparisonTime - receivedAt).total_seconds() / 3600.0
        deadlineRatio = elapsedHours / slaHours
    except (OverflowError, TypeError):
        return None, None
    if not math.isfinite(deadlineRatio):
        return None, None
    return deadlineRatio, _classifyRiskRatio(deadlineRatio)


def _getFinalRisk(
    deadlineRisk: RiskLevel | None,
    aiRiskFloor: RiskLevel | None,
    isOverdue: bool,
) -> RiskLevel | None:
    if isOverdue:
        return "VERY_HIGH"

    availableRisks = [
        risk for risk in (deadlineRisk, aiRiskFloor) if risk is not None
    ]
    if not availableRisks:
        return None
    return max(availableRisks, key=RISK_PRIORITY.__getitem__)


def _getTimeStatus(
    deadlineAt: datetime | None,
    currentTime: datetime | None,
) -> TimeStatus | None:
    if not isinstance(deadlineAt, datetime):
        return None

    comparisonTime = currentTime
    if comparisonTime is None:
        comparisonTime = datetime.now(tz=deadlineAt.tzinfo)

    try:
        isOverdue = comparisonTime >= deadlineAt
    except TypeError:
        return None
    return "OVERDUE" if isOverdue else "ON_TIME"
