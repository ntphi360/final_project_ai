from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.field import Field
from app.models.officer import Officer
from app.models.officer_field import OfficerField


class OfficerNotFoundError(Exception):
    pass


class FieldNotFoundError(Exception):
    pass


class OfficerFieldNotFoundError(Exception):
    pass


def getOfficers(db: Session) -> list[Officer]:
    statement = (
        select(Officer)
        .where(Officer.is_active == 1)
        .order_by(Officer.full_name, Officer.id)
    )

    return list(db.scalars(statement).all())


def getOfficerById(
    db: Session,
    officerId: int,
) -> Officer | None:
    statement = select(Officer).where(
        Officer.id == officerId,
        Officer.is_active == 1,
    )

    return db.scalar(statement)


def getOfficersByField(
    db: Session,
    fieldId: int,
) -> list[Officer] | None:
    if _getActiveFieldById(db=db, fieldId=fieldId) is None:
        return None

    statement = (
        select(Officer)
        .join(
            OfficerField,
            OfficerField.officer_id == Officer.id,
        )
        .where(
            OfficerField.field_id == fieldId,
            Officer.is_active == 1,
        )
        .order_by(Officer.full_name, Officer.id)
    )

    return list(db.scalars(statement).all())


def getFieldsByOfficer(
    db: Session,
    officerId: int,
) -> list[Field]:
    statement = (
        select(Field)
        .join(
            OfficerField,
            OfficerField.field_id == Field.id,
        )
        .where(
            OfficerField.officer_id == officerId,
            Field.is_active == 1,
        )
        .order_by(Field.name, Field.id)
    )

    return list(db.scalars(statement).all())


def assignOfficerToField(
    db: Session,
    officerId: int,
    fieldId: int,
) -> OfficerField:
    _validateActiveOfficerAndField(
        db=db,
        officerId=officerId,
        fieldId=fieldId,
    )

    assignment = db.get(
        OfficerField,
        (officerId, fieldId),
    )

    if assignment is not None:
        return assignment

    assignment = OfficerField(
        officer_id=officerId,
        field_id=fieldId,
    )

    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    return assignment


def removeOfficerFromField(
    db: Session,
    officerId: int,
    fieldId: int,
) -> None:
    _validateActiveOfficerAndField(
        db=db,
        officerId=officerId,
        fieldId=fieldId,
    )

    assignment = db.get(
        OfficerField,
        (officerId, fieldId),
    )

    if assignment is None:
        raise OfficerFieldNotFoundError

    db.delete(assignment)
    db.commit()


def _getActiveFieldById(
    db: Session,
    fieldId: int,
) -> Field | None:
    statement = select(Field).where(
        Field.id == fieldId,
        Field.is_active == 1,
    )

    return db.scalar(statement)


def _validateActiveOfficerAndField(
    db: Session,
    officerId: int,
    fieldId: int,
) -> None:
    if getOfficerById(
        db=db,
        officerId=officerId,
    ) is None:
        raise OfficerNotFoundError

    if _getActiveFieldById(
        db=db,
        fieldId=fieldId,
    ) is None:
        raise FieldNotFoundError