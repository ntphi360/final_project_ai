from datetime import datetime, timedelta
from math import floor

from sqlalchemy import and_, case, func, select
from sqlalchemy.orm import Session

from app.models.case import Case


def getDashboardSummary(db: Session) -> dict[str, int]:
    currentDateTime = datetime.now()
    processingCondition = Case.completed_at.is_(None)
    completedCondition = Case.completed_at.is_not(None)
    overdueCondition = and_(
        processingCondition,
        Case.deadline_at < currentDateTime,
    )

    statement = select(
        func.count(Case.id).label("total_cases"),
        func.count(
            case((processingCondition, 1))
        ).label("processing_cases"),
        func.count(
            case((completedCondition, 1))
        ).label("completed_cases"),
        func.count(
            case((overdueCondition, 1))
        ).label("overdue_cases"),
    )
    result = db.execute(statement).mappings().one()
    return dict(result)


def getStatusDistribution(db: Session) -> list[dict[str, str | int]]:
    caseCount = func.count(Case.id)
    statement = (
        select(
            Case.status.label("status"),
            caseCount.label("count"),
        )
        .group_by(Case.status)
        .order_by(caseCount.desc(), Case.status)
    )
    return [dict(row) for row in db.execute(statement).mappings()]


def getFieldDistribution(db: Session) -> list[dict[str, str | int]]:
    caseCount = func.count(Case.id)
    statement = (
        select(
            Case.field_name.label("field_name"),
            caseCount.label("count"),
        )
        .group_by(Case.field_name)
        .order_by(caseCount.desc(), Case.field_name)
    )
    return [dict(row) for row in db.execute(statement).mappings()]


def getRecentCases(db: Session, limit: int = 10) -> list[Case]:
    statement = (
        select(Case)
        .order_by(Case.received_at.desc(), Case.id.desc())
        .limit(limit)
    )
    return list(db.scalars(statement).all())


def getOverdueCases(
    db: Session,
    skip: int = 0,
    limit: int = 20,
) -> list[dict[str, object]]:
    currentDateTime = datetime.now()
    statement = (
        select(Case)
        .where(
            Case.completed_at.is_(None),
            Case.deadline_at < currentDateTime,
        )
        .order_by(Case.deadline_at, Case.id)
        .offset(skip)
        .limit(limit)
    )
    cases = db.scalars(statement).all()
    return [
        _buildDashboardCaseItem(caseRecord, currentDateTime)
        for caseRecord in cases
    ]


def getNearDeadlineCases(
    db: Session,
    hours: int = 24,
    skip: int = 0,
    limit: int = 20,
) -> list[dict[str, object]]:
    currentDateTime = datetime.now()
    deadlineThreshold = currentDateTime + timedelta(hours=hours)
    statement = (
        select(Case)
        .where(
            Case.completed_at.is_(None),
            Case.deadline_at >= currentDateTime,
            Case.deadline_at <= deadlineThreshold,
        )
        .order_by(Case.deadline_at, Case.id)
        .offset(skip)
        .limit(limit)
    )
    cases = db.scalars(statement).all()
    return [
        _buildDashboardCaseItem(caseRecord, currentDateTime)
        for caseRecord in cases
    ]


def _buildDashboardCaseItem(
    caseRecord: Case,
    currentDateTime: datetime,
) -> dict[str, object]:
    return {
        "id": caseRecord.id,
        "case_code": caseRecord.case_code,
        "procedure_name": caseRecord.procedure_name,
        "field_name": caseRecord.field_name,
        "department_name": caseRecord.department_name,
        "officer_name": caseRecord.officer_name,
        "received_at": caseRecord.received_at,
        "deadline_at": caseRecord.deadline_at,
        "completed_at": caseRecord.completed_at,
        "status": caseRecord.status,
        "remaining_seconds": _calculateRemainingSeconds(
            deadlineAt=caseRecord.deadline_at,
            currentDateTime=currentDateTime,
        ),
        "is_overdue": (
            caseRecord.completed_at is None
            and caseRecord.deadline_at < currentDateTime
        ),
    }


def _calculateRemainingSeconds(
    deadlineAt: datetime,
    currentDateTime: datetime,
) -> int:
    return floor((deadlineAt - currentDateTime).total_seconds())
