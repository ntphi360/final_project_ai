from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.department import Department
from app.models.department_field import DepartmentField
from app.models.field import Field
from app.models.procedure import Procedure


def getDepartments(db: Session) -> list[Department]:
    statement = (
        select(Department)
        .where(Department.is_active == 1)
        .order_by(Department.name, Department.id)
    )
    return list(db.scalars(statement).all())


def getFields(db: Session) -> list[Field]:
    statement = (
        select(Field)
        .where(Field.is_active == 1)
        .order_by(Field.name, Field.id)
    )
    return list(db.scalars(statement).all())


def getProcedures(db: Session) -> list[Procedure]:
    statement = (
        select(Procedure)
        .where(Procedure.is_active == 1)
        .order_by(Procedure.name, Procedure.id)
    )
    return list(db.scalars(statement).all())


def getProceduresByField(
    db: Session,
    fieldId: int,
) -> list[Procedure] | None:
    fieldStatement = select(Field.id).where(
        Field.id == fieldId,
        Field.is_active == 1,
    )
    if db.scalar(fieldStatement) is None:
        return None

    procedureStatement = (
        select(Procedure)
        .where(
            Procedure.field_id == fieldId,
            Procedure.is_active == 1,
        )
        .order_by(Procedure.name, Procedure.id)
    )
    return list(db.scalars(procedureStatement).all())


def getFieldsByDepartment(
    db: Session,
    departmentId: int,
) -> list[Field] | None:
    departmentStatement = select(Department.id).where(
        Department.id == departmentId,
        Department.is_active == 1,
    )
    if db.scalar(departmentStatement) is None:
        return None

    fieldStatement = (
        select(Field)
        .join(
            DepartmentField,
            DepartmentField.field_id == Field.id,
        )
        .where(
            DepartmentField.department_id == departmentId,
            Field.is_active == 1,
        )
        .order_by(Field.name, Field.id)
    )
    return list(db.scalars(fieldStatement).all())
