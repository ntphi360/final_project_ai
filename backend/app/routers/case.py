import logging
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.ai.feature_builder import AIFeatureError
from app.ai.model_loader import AIArtifactError
from app.ai.predictor import predictCase
from app.database.database import getDb
from app.auth_dependencies import requireRoles
from app.schemas.case import (
    CaseActionRequest,
    CaseActionResponse,
    CaseBulkActionRequest,
    CaseBulkActionResponse,
    CaseDetailResponse,
    CaseResponse,
    ProcessingCaseResponse,
)
from app.services.ai_service import buildCaseDataForPrediction
from app.services.ai_risk import calculateCaseRisk
from app.services.case_action_service import (
    CaseActionNotFoundError,
    CaseActionStateError,
    applyCaseAction,
    applyCaseBulkAction,
)
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
caseActors = requireRoles("ADMIN", "SUPERVISOR", "OFFICER")


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
    currentTime = datetime.now()

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

        response = CaseResponse.model_validate(caseRecord)
        riskMetrics = calculateCaseRisk(
            predictedProcessingHours=predictionHours,
            receivedAt=caseRecord.received_at,
            deadlineAt=caseRecord.deadline_at,
            status=caseRecord.status,
            currentTime=currentTime,
        )
        responses.append(
            ProcessingCaseResponse(
                **(
                    response.model_dump()
                    | {
                        "officer_phone_number": (
                            caseRecord.officer.user.phone_number
                            if caseRecord.officer and caseRecord.officer.user
                            else None
                        ),
                        "officer_email": (
                            caseRecord.officer.user.email
                            if caseRecord.officer and caseRecord.officer.user
                            else None
                        ),
                    }
                ),
                predicted_processing_hours=predictionHours,
                model_version=modelVersion,
                **riskMetrics,
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


@router.post(
    "/bulk-action",
    response_model=CaseBulkActionResponse,
    dependencies=[Depends(caseActors)],
)
async def updateCaseBatch(
    data: CaseBulkActionRequest,
    db: Session = Depends(getDb),
) -> CaseBulkActionResponse:
    return await applyCaseBulkAction(db=db, data=data)


@router.post(
    "/{case_id}/action",
    response_model=CaseActionResponse,
    dependencies=[Depends(caseActors)],
)
async def updateCaseAction(
    case_id: int,
    data: CaseActionRequest,
    db: Session = Depends(getDb),
) -> CaseActionResponse:
    try:
        return await applyCaseAction(db=db, caseId=case_id, data=data)
    except CaseActionNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy hồ sơ",
        ) from exc
    except CaseActionStateError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc


@router.get("/{case_id}", response_model=CaseDetailResponse)
def getCaseDetail(case_id: int, db: Session = Depends(getDb)):
    case = getCaseById(db=db, caseId=case_id)
    if case is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy hồ sơ",
        )
    response = CaseDetailResponse.model_validate(case)
    return response.model_copy(
        update={
            "officer_phone_number": (
                case.officer.user.phone_number
                if case.officer and case.officer.user
                else None
            ),
            "officer_email": (
                case.officer.user.email if case.officer and case.officer.user else None
            ),
        }
    )
