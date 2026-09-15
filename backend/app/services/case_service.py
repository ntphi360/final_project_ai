from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.case import Case
from app.models.officer import Officer
from app.models.procedure import Procedure
from app.services.case_filter_service import CaseQueryFilters, applyCaseFilters


def getCases(db: Session, skip: int = 0, limit: int = 20) -> list[Case]:
    statement = (
        select(Case)
        .order_by(Case.id)
        .offset(skip)
        .limit(limit)
    )
    return list(db.scalars(statement).all())


def getCaseById(db: Session, caseId: int) -> Case | None:
    statement = (
        select(Case)
        .options(
            joinedload(Case.procedure),
            joinedload(Case.department),
            joinedload(Case.officer).joinedload(Officer.user),
        )
        .where(Case.id == caseId)
    )
    return db.scalar(statement)


def getProcessingCases(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    filters: CaseQueryFilters | None = None,
) -> list[Case]:
    statement = (
        select(Case)
        .options(
            joinedload(Case.procedure).joinedload(Procedure.field),
            joinedload(Case.department),
            joinedload(Case.officer).joinedload(Officer.user),
        )
        .where(Case.completed_at.is_(None))
    )
    statement = (
        applyCaseFilters(statement, filters)
        .order_by(Case.id)
        .offset(skip)
        .limit(limit)
    )
    return list(db.scalars(statement).all())


def getCompletedCases(
    db: Session,
    skip: int = 0,
    limit: int = 20,
) -> list[Case]:
    statement = (
        select(Case)
        .where(Case.completed_at.is_not(None))
        .order_by(Case.id)
        .offset(skip)
        .limit(limit)
    )
    return list(db.scalars(statement).all())
