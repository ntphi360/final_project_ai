from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.cache import DEPARTMENTS_CACHE_KEY, FIELDS_CACHE_KEY, cache
from app.database.database import getDb
from app.auth_dependencies import requireRoles
from app.schemas.department import DepartmentResponse
from app.schemas.field import FieldResponse
from app.schemas.procedure import ProcedureResponse
from app.services.catalog_service import (
    getDepartments,
    getFields,
    getFieldsByDepartment,
    getProcedures,
    getProceduresByField,
)


router = APIRouter(
    prefix="/api/catalog",
    tags=["Catalog"],
    dependencies=[Depends(requireRoles("ADMIN", "SUPERVISOR", "OFFICER", "VIEWER"))],
)

CATALOG_CACHE_TTL_SECONDS = 15 * 60


@router.get("/departments", response_model=list[DepartmentResponse])
def listDepartments(db: Session = Depends(getDb)):
    cachedDepartments = cache.get(DEPARTMENTS_CACHE_KEY)
    if cachedDepartments is not None:
        return cachedDepartments
    departments = [
        DepartmentResponse.model_validate(item)
        for item in getDepartments(db=db)
    ]
    cache.set(
        DEPARTMENTS_CACHE_KEY,
        departments,
        ttlSeconds=CATALOG_CACHE_TTL_SECONDS,
    )
    return departments


@router.get("/fields", response_model=list[FieldResponse])
def listFields(db: Session = Depends(getDb)):
    cachedFields = cache.get(FIELDS_CACHE_KEY)
    if cachedFields is not None:
        return cachedFields
    fields = [FieldResponse.model_validate(item) for item in getFields(db=db)]
    cache.set(
        FIELDS_CACHE_KEY,
        fields,
        ttlSeconds=CATALOG_CACHE_TTL_SECONDS,
    )
    return fields


@router.get("/procedures", response_model=list[ProcedureResponse])
def listProcedures(db: Session = Depends(getDb)):
    return getProcedures(db=db)


@router.get(
    "/fields/{field_id}/procedures",
    response_model=list[ProcedureResponse],
)
def listProceduresByField(
    field_id: int,
    db: Session = Depends(getDb),
):
    procedures = getProceduresByField(db=db, fieldId=field_id)
    if procedures is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy lĩnh vực",
        )
    return procedures


@router.get(
    "/departments/{department_id}/fields",
    response_model=list[FieldResponse],
)
def listFieldsByDepartment(
    department_id: int,
    db: Session = Depends(getDb),
):
    fields = getFieldsByDepartment(db=db, departmentId=department_id)
    if fields is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy phòng ban",
        )
    return fields
