from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CaseProcedureResponse(BaseModel):
    id: int
    name: str
    field_id: int

    model_config = ConfigDict(from_attributes=True)


class CaseDepartmentResponse(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class CaseOfficerResponse(BaseModel):
    id: int
    full_name: str

    model_config = ConfigDict(from_attributes=True)


class CaseResponse(BaseModel):
    id: int
    procedure_id: int | None
    department_id: int | None
    officer_id: int | None
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

    procedure: CaseProcedureResponse | None
    department: CaseDepartmentResponse | None
    officer: CaseOfficerResponse | None

    model_config = ConfigDict(from_attributes=True)
