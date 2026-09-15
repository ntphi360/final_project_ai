from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DashboardSummaryResponse(BaseModel):
    total_cases: int
    processing_cases: int
    completed_cases: int
    overdue_cases: int

    model_config = ConfigDict(from_attributes=True)


class StatusDistributionResponse(BaseModel):
    status: str
    count: int

    model_config = ConfigDict(from_attributes=True)


class FieldDistributionResponse(BaseModel):
    field_name: str
    count: int

    model_config = ConfigDict(from_attributes=True)


class RecentCaseResponse(BaseModel):
    id: int
    case_code: str
    procedure_name: str
    field_name: str
    department_name: str
    officer_name: str | None
    received_at: datetime
    deadline_at: datetime
    completed_at: datetime | None
    status: str

    model_config = ConfigDict(from_attributes=True)


class DashboardCaseItem(RecentCaseResponse):
    remaining_seconds: int
    is_overdue: bool


class CaseTrendResponse(BaseModel):
    period: str
    received: int
    completed: int


class DepartmentStatisticsResponse(BaseModel):
    department_name: str
    total_cases: int
    processing_cases: int
    completed_cases: int
    completion_rate: float


class OfficerWorkloadResponse(BaseModel):
    officer_id: int | None
    officer_name: str
    department_name: str
    processing_cases: int
    completed_cases: int
    total_cases: int
