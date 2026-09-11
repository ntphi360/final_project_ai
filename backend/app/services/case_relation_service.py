import re
from dataclasses import dataclass
from typing import TypeVar

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, joinedload

from app.models.case import Case
from app.models.department import Department
from app.models.officer import Officer
from app.models.procedure import Procedure


ModelType = TypeVar("ModelType")


@dataclass
class CaseRelationLookups:
    proceduresByName: dict[str, list[Procedure]]
    departmentsByName: dict[str, list[Department]]
    officersByName: dict[str, list[Officer]]


def normalizeRelationText(value: str | None) -> str | None:
    if value is None:
        return None

    normalized = re.sub(r"\s+", " ", value).strip().casefold()
    return normalized or None


def loadCaseRelationLookups(db: Session) -> CaseRelationLookups:
    procedureStatement = select(Procedure).options(
        joinedload(Procedure.field)
    )
    procedures = db.scalars(procedureStatement).all()
    departments = db.scalars(select(Department)).all()
    officers = db.scalars(select(Officer)).all()

    proceduresByName: dict[str, list[Procedure]] = {}
    departmentsByName: dict[str, list[Department]] = {}
    officersByName: dict[str, list[Officer]] = {}

    for procedure in procedures:
        _appendToLookup(
            proceduresByName,
            procedure.name,
            procedure,
        )
    for department in departments:
        _appendToLookup(
            departmentsByName,
            department.name,
            department,
        )
    for officer in officers:
        _appendToLookup(
            officersByName,
            officer.full_name,
            officer,
        )

    return CaseRelationLookups(
        proceduresByName=proceduresByName,
        departmentsByName=departmentsByName,
        officersByName=officersByName,
    )


def resolveProcedure(
    lookups: CaseRelationLookups,
    procedureName: str | None,
    fieldName: str | None,
) -> Procedure | None:
    normalizedName = normalizeRelationText(procedureName)
    if normalizedName is None:
        return None

    candidates = lookups.proceduresByName.get(normalizedName, [])
    if len(candidates) == 1:
        return candidates[0]

    normalizedFieldName = normalizeRelationText(fieldName)
    if normalizedFieldName is None:
        return None

    matchingCandidates = [
        procedure
        for procedure in candidates
        if normalizeRelationText(procedure.field.name) == normalizedFieldName
    ]
    if len(matchingCandidates) == 1:
        return matchingCandidates[0]
    return None


def resolveDepartment(
    lookups: CaseRelationLookups,
    departmentName: str | None,
) -> Department | None:
    return _resolveUniqueByName(
        lookups.departmentsByName,
        departmentName,
    )


def resolveOfficer(
    lookups: CaseRelationLookups,
    officerName: str | None,
) -> Officer | None:
    return _resolveUniqueByName(
        lookups.officersByName,
        officerName,
    )


def backfillCaseRelations(db: Session) -> dict[str, int]:
    try:
        lookups = loadCaseRelationLookups(db)
        cases = db.scalars(select(Case).order_by(Case.id)).all()

        procedureMapped = 0
        departmentMapped = 0
        officerMapped = 0
        unmappedCases = 0
        fieldMismatchCases = 0

        for caseRecord in cases:
            procedure = resolveProcedure(
                lookups,
                procedureName=caseRecord.procedure_name,
                fieldName=caseRecord.field_name,
            )
            department = resolveDepartment(
                lookups,
                departmentName=caseRecord.department_name,
            )
            officer = resolveOfficer(
                lookups,
                officerName=caseRecord.officer_name,
            )

            if procedure is not None:
                caseRecord.procedure_id = procedure.id
                if (
                    normalizeRelationText(caseRecord.field_name)
                    != normalizeRelationText(procedure.field.name)
                ):
                    fieldMismatchCases += 1
            if department is not None:
                caseRecord.department_id = department.id
            if officer is not None:
                caseRecord.officer_id = officer.id

            procedureMapped += int(caseRecord.procedure_id is not None)
            departmentMapped += int(caseRecord.department_id is not None)
            officerMapped += int(caseRecord.officer_id is not None)

            officerExpected = (
                normalizeRelationText(caseRecord.officer_name) is not None
            )
            if (
                caseRecord.procedure_id is None
                or caseRecord.department_id is None
                or (officerExpected and caseRecord.officer_id is None)
            ):
                unmappedCases += 1

        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise

    return {
        "total_cases": len(cases),
        "procedure_mapped": procedureMapped,
        "department_mapped": departmentMapped,
        "officer_mapped": officerMapped,
        "unmapped_cases": unmappedCases,
        "field_mismatch_cases": fieldMismatchCases,
    }


def _appendToLookup(
    lookup: dict[str, list[ModelType]],
    name: str,
    record: ModelType,
) -> None:
    normalizedName = normalizeRelationText(name)
    if normalizedName is not None:
        lookup.setdefault(normalizedName, []).append(record)


def _resolveUniqueByName(
    lookup: dict[str, list[ModelType]],
    name: str | None,
) -> ModelType | None:
    normalizedName = normalizeRelationText(name)
    if normalizedName is None:
        return None

    candidates = lookup.get(normalizedName, [])
    if len(candidates) == 1:
        return candidates[0]
    return None
