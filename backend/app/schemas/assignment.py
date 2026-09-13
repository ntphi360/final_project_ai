from datetime import date, datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field, field_validator


def toCamel(value: str) -> str:
    parts = value.split("_")
    return parts[0] + "".join(part.capitalize() for part in parts[1:])


class CamelModel(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        alias_generator=toCamel,
    )


class AssignmentStatusValue(StrEnum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"


class AssignmentCreate(CamelModel):
    case_ids: list[int] = Field(min_length=1)
    assignee_id: int = Field(gt=0)
    title: str = Field(min_length=1, max_length=255)
    content: str = Field(min_length=1)
    send_email: bool = False
    send_sms: bool = False

    @field_validator("case_ids")
    @classmethod
    def validateCaseIds(cls, value: list[int]) -> list[int]:
        if any(caseId <= 0 for caseId in value):
            raise ValueError("caseIds chỉ được chứa số nguyên dương")
        return value

    @field_validator("title", "content")
    @classmethod
    def trimRequiredText(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Không được để trống")
        return value


class AssignmentReject(CamelModel):
    reason: str = Field(min_length=1, max_length=500)

    @field_validator("reason")
    @classmethod
    def trimReason(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Lý do từ chối không được để trống")
        return value


class AssignmentRead(CamelModel):
    id: int
    case_id: int
    case_code: str
    procedure_name: str
    field_name: str
    department_id: int | None
    department_name: str
    assigner_id: int
    assigner_name: str
    assignee_id: int
    assignee_name: str
    title: str
    content: str
    status: AssignmentStatusValue
    send_email: bool
    send_sms: bool
    assigned_at: datetime
    accepted_at: datetime | None
    rejected_at: datetime | None
    rejection_reason: str | None
    created_at: datetime
    updated_at: datetime


class AssignmentCaseDetail(CamelModel):
    id: int
    case_code: str
    procedure_id: int | None
    procedure_name: str
    field_name: str
    department_id: int | None
    department_name: str
    agency_name: str | None
    applicant_name: str | None
    phone_number: str | None
    officer_id: int | None
    officer_name: str | None
    received_at: datetime
    deadline_at: datetime
    completed_at: datetime | None
    status: str


class AssignmentOfficerDetail(CamelModel):
    id: int
    full_name: str
    phone_number: str | None
    email: str | None


class AssignmentDetail(AssignmentRead):
    case: AssignmentCaseDetail
    assigner: AssignmentOfficerDetail
    assignee: AssignmentOfficerDetail


class AssignmentSkipped(CamelModel):
    case_id: int
    reason: str


class AssignmentCreateResponse(CamelModel):
    created_count: int
    skipped_count: int
    assignments: list[AssignmentRead]
    skipped: list[AssignmentSkipped]


class AssignmentListResponse(CamelModel):
    items: list[AssignmentRead]
    page: int
    page_size: int
    total: int
    total_pages: int


class AssignmentSummaryResponse(CamelModel):
    total: int
    pending: int
    accepted: int
    rejected: int


class AssignmentFilters(BaseModel):
    status: AssignmentStatusValue | None = None
    assigner_id: int | None = None
    assignee_id: int | None = None
    department_id: int | None = None
    search: str | None = None
    from_date: date | None = None
    to_date: date | None = None
