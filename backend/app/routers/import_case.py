import json

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.database.database import getDb
from app.schemas.import_case import (
    ImportCaseResult,
    ImportHistoryDetailResponse,
    ImportHistoryResponse,
)
from app.services.import_case_service import (
    ImportCaseDatabaseError,
    ImportCaseValidationError,
    getImportHistories,
    getImportHistoryById,
    importCases,
    recordFailedImport,
)


router = APIRouter(
    prefix="/api/import",
    tags=["Import cases"],
)


@router.get("/history", response_model=list[ImportHistoryResponse])
def listImportHistory(
    limit: int = Query(default=100, ge=1, le=100),
    db: Session = Depends(getDb),
):
    return getImportHistories(db=db, limit=limit)


@router.get("/history/{history_id}", response_model=ImportHistoryDetailResponse)
def getImportHistory(
    history_id: int,
    db: Session = Depends(getDb),
):
    history = getImportHistoryById(db=db, historyId=history_id)
    if history is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy lịch sử import",
        )
    return history


@router.post("/cases", response_model=ImportCaseResult)
def importCaseFile(
    file: UploadFile = File(...),
    db: Session = Depends(getDb),
):
    try:
        return importCases(db=db, file=file)
    except ImportCaseValidationError as exc:
        errorMessage = (
            exc.detail
            if isinstance(exc.detail, str)
            else json.dumps(exc.detail, ensure_ascii=False)
        )
        recordFailedImport(
            db=db,
            fileName=file.filename or "Không xác định",
            errorMessage=errorMessage,
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=exc.detail,
        ) from exc
    except ImportCaseDatabaseError as exc:
        recordFailedImport(
            db=db,
            fileName=file.filename or "Không xác định",
            errorMessage=str(exc),
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Không thể import hồ sơ do lỗi database",
        ) from exc
    except Exception as exc:
        recordFailedImport(
            db=db,
            fileName=file.filename or "Không xác định",
            errorMessage=str(exc),
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Không thể xử lý file import",
        ) from exc
