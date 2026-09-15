from datetime import date
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.database import getDb
from app.auth_dependencies import requireRoles
from app.schemas.dashboard import (
    DashboardCaseItem,
    DashboardSummaryResponse,
    DepartmentStatisticsResponse,
    FieldDistributionResponse,
    CaseTrendResponse,
    OfficerWorkloadResponse,
    RecentCaseResponse,
    StatusDistributionResponse,
)
from app.services.dashboard_service import (
    getCaseTrends,
    getDepartmentStatistics,
    getDashboardSummary,
    getFieldDistribution,
    getNearDeadlineCases,
    getOfficerWorkloads,
    getOverdueCases,
    getRecentCases,
    getStatusDistribution,
)
from app.services.case_filter_service import CaseQueryFilters


router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"],
    dependencies=[Depends(requireRoles("ADMIN", "SUPERVISOR", "OFFICER", "VIEWER"))],
)

DashboardSkip = Annotated[int, Query(ge=0)]
DashboardLimit = Annotated[int, Query(ge=1, le=100)]
NearDeadlineHours = Annotated[int, Query(ge=1)]
ReportGranularity = Annotated[Literal["day", "month", "year"], Query()]


def getReportFilters(
    date_from: Annotated[date | None, Query()] = None,
    date_to: Annotated[date | None, Query()] = None,
    field_name: Annotated[str | None, Query(min_length=1)] = None,
    department_name: Annotated[str | None, Query(min_length=1)] = None,
    officer_id: Annotated[int | None, Query(ge=1)] = None,
) -> CaseQueryFilters:
    if date_from is not None and date_to is not None and date_from > date_to:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Từ ngày không được lớn hơn đến ngày",
        )
    return CaseQueryFilters(
        date_from=date_from,
        date_to=date_to,
        field_name=field_name,
        department_name=department_name,
        officer_id=officer_id,
    )


@router.get("/summary", response_model=DashboardSummaryResponse)
def getSummary(
    db: Session = Depends(getDb),
    filters: CaseQueryFilters = Depends(getReportFilters),
):
    return getDashboardSummary(db=db, filters=filters)


@router.get(
    "/status-distribution",
    response_model=list[StatusDistributionResponse],
)
def getCaseStatusDistribution(
    db: Session = Depends(getDb),
    filters: CaseQueryFilters = Depends(getReportFilters),
):
    return getStatusDistribution(db=db, filters=filters)


@router.get(
    "/field-distribution",
    response_model=list[FieldDistributionResponse],
)
def getCaseFieldDistribution(
    db: Session = Depends(getDb),
    filters: CaseQueryFilters = Depends(getReportFilters),
):
    return getFieldDistribution(db=db, filters=filters)


@router.get("/monthly-trends", response_model=list[CaseTrendResponse])
def getCaseMonthlyTrends(
    db: Session = Depends(getDb),
    granularity: ReportGranularity = "month",
    filters: CaseQueryFilters = Depends(getReportFilters),
):
    return getCaseTrends(db=db, granularity=granularity, filters=filters)


@router.get(
    "/department-statistics",
    response_model=list[DepartmentStatisticsResponse],
)
def getCaseDepartmentStatistics(
    db: Session = Depends(getDb),
    filters: CaseQueryFilters = Depends(getReportFilters),
):
    return getDepartmentStatistics(db=db, filters=filters)


@router.get(
    "/officer-workloads",
    response_model=list[OfficerWorkloadResponse],
)
def getCaseOfficerWorkloads(
    db: Session = Depends(getDb),
    filters: CaseQueryFilters = Depends(getReportFilters),
):
    return getOfficerWorkloads(db=db, filters=filters)


@router.get("/recent-cases", response_model=list[RecentCaseResponse])
def listRecentCases(
    db: Session = Depends(getDb),
    limit: DashboardLimit = 10,
):
    return getRecentCases(db=db, limit=limit)


@router.get("/overdue", response_model=list[DashboardCaseItem])
def listOverdueCases(
    db: Session = Depends(getDb),
    skip: DashboardSkip = 0,
    limit: DashboardLimit = 20,
):
    return getOverdueCases(db=db, skip=skip, limit=limit)


@router.get("/near-deadline", response_model=list[DashboardCaseItem])
def listNearDeadlineCases(
    db: Session = Depends(getDb),
    hours: NearDeadlineHours = 24,
    skip: DashboardSkip = 0,
    limit: DashboardLimit = 20,
):
    return getNearDeadlineCases(
        db=db,
        hours=hours,
        skip=skip,
        limit=limit,
    )
