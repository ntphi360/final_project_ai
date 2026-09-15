import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.ai.feature_builder import AIFeatureError
from app.ai.model_loader import AIArtifactError
from app.ai.predictor import predictCase
from app.auth_dependencies import requireRoles
from app.database.database import getDb
from app.schemas.ai import AIPredictionResponse
from app.services.ai_service import (
    buildCaseDataForPrediction,
    getCaseByCodeForPrediction,
)


logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/ai",
    tags=["AI"],
    dependencies=[
        Depends(requireRoles("ADMIN", "SUPERVISOR", "OFFICER", "VIEWER"))
    ],
)


@router.get(
    "/predict/{case_id}",
    response_model=AIPredictionResponse,
    responses={
        404: {"description": "Không tìm thấy hồ sơ"},
        422: {"description": "Feature AI bị thiếu hoặc không hợp lệ"},
        503: {"description": "Artifact hoặc inference AI V3 không khả dụng"},
    },
)
def predictCaseById(
    case_id: str,
    db: Session = Depends(getDb),
) -> AIPredictionResponse:
    caseRecord = getCaseByCodeForPrediction(db=db, caseCode=case_id)
    if caseRecord is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy hồ sơ có mã {case_id}",
        )

    caseData = buildCaseDataForPrediction(db=db, caseRecord=caseRecord)
    try:
        result = predictCase(caseData)
    except AIFeatureError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Dữ liệu hồ sơ không hợp lệ cho AI: {exc}",
        ) from exc
    except AIArtifactError as exc:
        logger.exception("Không thể tải artifact AI V3")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Mô hình AI V3 hiện không khả dụng.",
        ) from exc
    except Exception as exc:
        logger.exception("Inference AI V3 thất bại cho hồ sơ %s", case_id)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Mô hình AI V3 không thể thực hiện dự đoán lúc này.",
        ) from exc

    return AIPredictionResponse(
        case_id=caseRecord.case_code,
        predicted_processing_hours=result["predicted_processing_hours"],
        model_version=result["model_version"],
        experts=result.get("experts"),
    )
