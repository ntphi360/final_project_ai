from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.database.database import getDb
from app.schemas.import_case import ImportCaseResult
from app.services.import_case_service import (
    ImportCaseDatabaseError,
    ImportCaseValidationError,
    importCases,
)


router = APIRouter(
    prefix="/api/import",
    tags=["Import cases"],
)


@router.post("/cases", response_model=ImportCaseResult)
def importCaseFile(
    file: UploadFile = File(...),
    db: Session = Depends(getDb),
):
    try:
        return importCases(db=db, file=file)
    except ImportCaseValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=exc.detail,
        ) from exc
    except ImportCaseDatabaseError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Không thể import hồ sơ do lỗi database",
        ) from exc
