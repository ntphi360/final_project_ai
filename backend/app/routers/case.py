import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.ai.feature_builder import AIFeatureError
from app.ai.model_loader import AIArtifactError
from app.ai.predictor import predictCase
from app.database.database import getDb
from app.auth_dependencies import requireRoles
from app.schemas.case import (
    CaseDetailResponse,
    CaseResponse,
    ProcessingCaseResponse,
)
from app.services.ai_service import buildCaseDataForPrediction
from app.services.case_service import (
    getCaseById,
    getCases,
    getCompletedCases,
    getProcessingCases,
)


logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/cases",
    tags=["Cases"],
    dependencies=[Depends(requireRoles("ADMIN", "SUPERVISOR", "OFFICER", "VIEWER"))],
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


@router.get("/processing", response_model=list[ProcessingCaseResponse])
def listProcessingCases(
    db: Session = Depends(getDb),
    skip: PaginationSkip = 0,
    limit: PaginationLimit = 20,
) -> list[ProcessingCaseResponse]:
    cases = getProcessingCases(db=db, skip=skip, limit=limit)
    responses: list[ProcessingCaseResponse] = []
    artifactAvailable = True

    for caseRecord in cases:
        predictionHours: float | None = None
        modelVersion: str | None = None

        if artifactAvailable:
            try:
                caseData = buildCaseDataForPrediction(
                    db=db,
                    caseRecord=caseRecord,
                )
                result = predictCase(caseData)
                predictionHours = result["predicted_processing_hours"]
                modelVersion = result["model_version"]
            except AIFeatureError as exc:
                logger.warning(
                    "Feature AI không hợp lệ cho hồ sơ %s: %s",
                    caseRecord.case_code,
                    exc,
                )
            except AIArtifactError:
                logger.exception(
                    "Artifact AI V3 không khả dụng khi dự đoán hồ sơ %s",
                    caseRecord.case_code,
                )
                artifactAvailable = False
            except Exception:
                logger.exception(
                    "Inference AI V3 thất bại cho hồ sơ %s",
                    caseRecord.case_code,
                )

        response = ProcessingCaseResponse.model_validate(caseRecord)
        responses.append(
            response.model_copy(
                update={
                    "predicted_processing_hours": predictionHours,
                    "model_version": modelVersion,
                }
            )
        )

    return responses


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
