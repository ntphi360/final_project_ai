from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ImportCaseResult(BaseModel):
    total_records: int
    inserted_records: int
    updated_records: int
    error_records: int
    completed_records: int
    processing_records: int
    skipped_records: int = 0
    unmapped_relation_records: int = 0
    field_mismatch_records: int = 0


class ImportHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    file_name: str
    total_rows: int
    created_rows: int
    updated_rows: int
    skipped_rows: int
    error_rows: int
    status: str
    imported_at: datetime


class ImportHistoryDetailResponse(ImportHistoryResponse):
    error_message: str | None
    created_at: datetime
