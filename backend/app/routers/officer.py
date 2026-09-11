from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import getDb
from app.schemas.field import FieldResponse
from app.schemas.officer import (
    OfficerFieldAssignmentResponse,
    OfficerResponse,
    OfficerWithFieldsResponse,
)
from app.services.officer_service import (
    FieldNotFoundError,
    OfficerFieldNotFoundError,
    OfficerNotFoundError,
    assignOfficerToField,
    getFieldsByOfficer,
    getOfficerById,
    getOfficers,
    getOfficersByField,
    removeOfficerFromField,
)


router = APIRouter(
    prefix="/api/officers",
    tags=["Officers"],
)


@router.get("", response_model=list[OfficerResponse])
def listOfficers(db: Session = Depends(getDb)):
    return getOfficers(db=db)


@router.get("/field/{field_id}", response_model=list[OfficerResponse])
def listOfficersByField(
    field_id: int,
    db: Session = Depends(getDb),
):
    officers = getOfficersByField(db=db, fieldId=field_id)
    if officers is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy lĩnh vực",
        )
    return officers


@router.get(
    "/{officer_id}/fields",
    response_model=list[FieldResponse],
)
def listFieldsByOfficer(
    officer_id: int,
    db: Session = Depends(getDb),
):
    if getOfficerById(db=db, officerId=officer_id) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy cán bộ",
        )
    return getFieldsByOfficer(db=db, officerId=officer_id)


@router.post(
    "/{officer_id}/fields/{field_id}",
    response_model=OfficerFieldAssignmentResponse,
)
def assignFieldToOfficer(
    officer_id: int,
    field_id: int,
    db: Session = Depends(getDb),
):
    try:
        return assignOfficerToField(
            db=db,
            officerId=officer_id,
            fieldId=field_id,
        )
    except OfficerNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy cán bộ",
        ) from exc
    except FieldNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy lĩnh vực",
        ) from exc


@router.delete(
    "/{officer_id}/fields/{field_id}",
    response_model=dict[str, str],
)
def removeFieldFromOfficer(
    officer_id: int,
    field_id: int,
    db: Session = Depends(getDb),
):
    try:
        removeOfficerFromField(
            db=db,
            officerId=officer_id,
            fieldId=field_id,
        )
    except OfficerNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy cán bộ",
        ) from exc
    except FieldNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy lĩnh vực",
        ) from exc
    except OfficerFieldNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy phân công cán bộ theo lĩnh vực",
        ) from exc

    return {"message": "Đã gỡ phân công cán bộ khỏi lĩnh vực"}


@router.get("/{officer_id}", response_model=OfficerWithFieldsResponse)
def getOfficerDetail(
    officer_id: int,
    db: Session = Depends(getDb),
):
    officer = getOfficerById(db=db, officerId=officer_id)
    if officer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy cán bộ",
        )

    fields = getFieldsByOfficer(db=db, officerId=officer_id)
    return OfficerWithFieldsResponse(
        id=officer.id,
        full_name=officer.full_name,
        phone_number=officer.phone_number,
        email=officer.email,
        is_active=officer.is_active,
        fields=fields or [],
    )
