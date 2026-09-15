from datetime import datetime, time, timedelta
from typing import Any

from sqlalchemy import and_, case, func, or_, select
from sqlalchemy.orm import InstrumentedAttribute, Session, joinedload

from app.models.case import Case
from app.models.procedure import Procedure


def calculatePredictionRiskMetrics(
    receivedAt: datetime,
    deadlineAt: datetime,
    predictionHours: float | None,
) -> dict[str, float | None]:
    slaHours = (deadlineAt - receivedAt).total_seconds() / 3600.0
    riskRatio = (
        predictionHours / slaHours
        if predictionHours is not None and slaHours > 0
        else None
    )
    return {
        "sla_hours": slaHours,
        "risk_ratio": riskRatio,
        "risk_percentage": riskRatio * 100.0 if riskRatio is not None else None,
    }


def getCaseByCodeForPrediction(db: Session, caseCode: str) -> Case | None:
    statement = (
        select(Case)
        .options(
            joinedload(Case.procedure).joinedload(Procedure.field),
            joinedload(Case.department),
            joinedload(Case.officer),
        )
        .where(Case.case_code == caseCode)
    )
    return db.scalar(statement)


def buildCaseDataForPrediction(
    db: Session,
    caseRecord: Case,
) -> dict[str, Any]:
    procedureName = (
        caseRecord.procedure.name
        if caseRecord.procedure is not None
        else caseRecord.procedure_name
    )
    fieldName = (
        caseRecord.procedure.field.name
        if caseRecord.procedure is not None
        and caseRecord.procedure.field is not None
        else caseRecord.field_name
    )
    departmentName = (
        caseRecord.department.name
        if caseRecord.department is not None
        else caseRecord.department_name
    )
    officerName = (
        caseRecord.officer.full_name
        if caseRecord.officer is not None
        else caseRecord.officer_name
    )

    workloadFeatures = _getHistoricalWorkloadFeatures(
        db=db,
        caseRecord=caseRecord,
        procedureName=procedureName,
        departmentName=departmentName,
        officerName=officerName,
    )

    return {
        "Tên thủ tục hành chính": procedureName,
        "Tên lĩnh vực": fieldName,
        "Phòng ban": departmentName,
        "Cán bộ xử lý hiện tại": officerName,
        "Ngày tiếp nhận": caseRecord.received_at,
        "Ngày hẹn trả": caseRecord.deadline_at,
        **workloadFeatures,
    }


def _getHistoricalWorkloadFeatures(
    db: Session,
    caseRecord: Case,
    procedureName: str,
    departmentName: str,
    officerName: str | None,
) -> dict[str, int]:
    receivedAt = caseRecord.received_at
    dayStart = receivedAt.replace(
        hour=time.min.hour,
        minute=time.min.minute,
        second=time.min.second,
        microsecond=time.min.microsecond,
    )
    dayEnd = dayStart + timedelta(days=1)
    recentStart = receivedAt - timedelta(days=7)

    # Training features use cumulative counts in received-time order. The id
    # provides a deterministic tie-breaker for records with the same timestamp.
    isPrevious = or_(
        Case.received_at < receivedAt,
        and_(
            Case.received_at == receivedAt,
            Case.id < caseRecord.id,
        ),
    )
    isSameDayPrevious = and_(
        isPrevious,
        Case.received_at >= dayStart,
        Case.received_at < dayEnd,
    )
    isRecentPrevious = and_(
        isPrevious,
        Case.received_at >= recentStart,
    )

    dimensions = {
        "officer": _matches(Case.officer_name, officerName),
        "department": _matches(Case.department_name, departmentName),
        "procedure": _matches(Case.procedure_name, procedureName),
    }

    selectedColumns = []
    for dimension, matchesDimension in dimensions.items():
        selectedColumns.extend(
            (
                _countWhen(and_(isSameDayPrevious, matchesDimension)).label(
                    f"{dimension}_cases_before_today"
                ),
                _countWhen(and_(isPrevious, matchesDimension)).label(
                    f"{dimension}_cases_before_all"
                ),
                _countWhen(and_(isRecentPrevious, matchesDimension)).label(
                    f"{dimension}_cases_prev_7d"
                ),
            )
        )

    row = db.execute(select(*selectedColumns)).mappings().one()
    workload = {key: int(value) for key, value in row.items()}
    workload["total_same_day_workload"] = sum(
        workload[f"{dimension}_cases_before_today"]
        for dimension in dimensions
    )
    workload["total_recent_7d_workload"] = sum(
        workload[f"{dimension}_cases_prev_7d"]
        for dimension in dimensions
    )
    return workload


def _matches(
    column: InstrumentedAttribute[Any],
    value: str | None,
):
    if value is None:
        return column.is_(None)
    return column == value


def _countWhen(condition):
    return func.count(case((condition, 1)))
