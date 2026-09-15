from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


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
    officer_phone_number: str | None = None
    officer_email: str | None = None
    received_at: datetime
    deadline_at: datetime
    completed_at: datetime | None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProcessingCaseResponse(CaseResponse):
    predicted_processing_hours: float | None = None
    model_version: str | None = None
    sla_hours: float | None
    risk_ratio: float | None = None
    risk_percentage: float | None = None
    risk_level: Literal["LOW", "MEDIUM", "HIGH", "VERY_HIGH"] | None = None
    risk_label: str = "Chưa có AI"
    time_status: Literal["ON_TIME", "OVERDUE"] | None = None


class CaseDetailResponse(CaseResponse):
    """Schema chi tiết, tách riêng để có thể mở rộng mà không đổi API danh sách."""

    procedure: CaseProcedureResponse | None
    department: CaseDepartmentResponse | None
    officer: CaseOfficerResponse | None

    model_config = ConfigDict(from_attributes=True)


class CaseActionRequest(BaseModel):
    action: Literal["CONFIRM", "FOLLOW"]
    send_email: bool = False
    send_sms: bool = False
    note: str | None = Field(default=None, max_length=500)


class CaseBulkActionRequest(CaseActionRequest):
    case_ids: list[int] = Field(min_length=1)


class CaseNotificationDeliveryResponse(BaseModel):
    success: bool
    provider: str
    recipient: str | None = None
    message_id: str | None = None
    error: str | None = None


class CaseActionResponse(BaseModel):
    case_id: int
    case_code: str | None = None
    status: str | None = None
    success: bool
    skipped: bool = False
    reason: str | None = None
    note: str | None = None
    email: CaseNotificationDeliveryResponse | None = None
    sms: CaseNotificationDeliveryResponse | None = None


class CaseBulkActionResponse(BaseModel):
    success_count: int
    skipped_count: int
    failed_notification_count: int
    results: list[CaseActionResponse]
