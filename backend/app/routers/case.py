from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.database import getDb
from app.schemas.case import CaseDetailResponse, CaseResponse
from app.services.case_service import (
    getCaseById,
    getCases,
    getCompletedCases,
    getProcessingCases,
)


router = APIRouter(
    prefix="/api/cases",
    tags=["Cases"],
)

PaginationSkip = Annotated[int, Query(ge=0)]
PaginationLimit = Annotated[int, Query(ge=1, le=100)]


@router.get("", response_model=list[CaseResponse])
def listCases(
    db: Session = Depends(getDb),
    skip: PaginationSkip = 0,
    limit: PaginationLimit = 20,
):
    return getCases(db=db, skip=skip, limit=limit)


@router.get("/processing", response_model=list[CaseResponse])
def listProcessingCases(
    db: Session = Depends(getDb),
    skip: PaginationSkip = 0,
    limit: PaginationLimit = 20,
):
    return getProcessingCases(db=db, skip=skip, limit=limit)


@router.get("/completed", response_model=list[CaseResponse])
def listCompletedCases(
    db: Session = Depends(getDb),
    skip: PaginationSkip = 0,
    limit: PaginationLimit = 20,
):
    return getCompletedCases(db=db, skip=skip, limit=limit)


@router.get("/{case_id}", response_model=CaseDetailResponse)
def getCaseDetail(case_id: int, db: Session = Depends(getDb)):
    case = getCaseById(db=db, caseId=case_id)
    if case is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy hồ sơ",
        )
    return case
