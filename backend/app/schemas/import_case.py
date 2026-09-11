from pydantic import BaseModel


class ImportCaseResult(BaseModel):
    total_records: int
    inserted_records: int
    updated_records: int
    error_records: int
    completed_records: int
    processing_records: int
    unmapped_relation_records: int = 0
    field_mismatch_records: int = 0
