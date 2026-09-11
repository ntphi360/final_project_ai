from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CaseResponse(BaseModel):
    id: int
    case_code: str
    procedure_name: str
    field_name: str
    department_name: str
    agency_name: str | None
    applicant_name: str | None
    phone_number: str | None
    officer_name: str | None
    received_at: datetime
    deadline_at: datetime
    completed_at: datetime | None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CaseDetailResponse(CaseResponse):
    """Schema chi tiết, tách riêng để có thể mở rộng mà không đổi API danh sách."""

    model_config = ConfigDict(from_attributes=True)
