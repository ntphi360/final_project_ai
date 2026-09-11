from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.case import Case


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
            joinedload(Case.officer),
        )
        .where(Case.id == caseId)
    )
    return db.scalar(statement)


def getProcessingCases(
    db: Session,
    skip: int = 0,
    limit: int = 20,
) -> list[Case]:
    statement = (
        select(Case)
        .where(Case.completed_at.is_(None))
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
