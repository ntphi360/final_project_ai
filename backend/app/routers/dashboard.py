from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.database import getDb
from app.auth_dependencies import requireRoles
from app.schemas.dashboard import (
    DashboardCaseItem,
    DashboardSummaryResponse,
    DepartmentStatisticsResponse,
    FieldDistributionResponse,
    MonthlyCaseTrendResponse,
    OfficerWorkloadResponse,
    RecentCaseResponse,
    StatusDistributionResponse,
)
from app.services.dashboard_service import (
    getDepartmentStatistics,
    getDashboardSummary,
    getFieldDistribution,
    getMonthlyCaseTrends,
    getNearDeadlineCases,
    getOfficerWorkloads,
    getOverdueCases,
    getRecentCases,
    getStatusDistribution,
)


router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"],
    dependencies=[Depends(requireRoles("ADMIN", "SUPERVISOR", "OFFICER", "VIEWER"))],
)

DashboardSkip = Annotated[int, Query(ge=0)]
DashboardLimit = Annotated[int, Query(ge=1, le=100)]
NearDeadlineHours = Annotated[int, Query(ge=1)]


@router.get("/summary", response_model=DashboardSummaryResponse)
def getSummary(db: Session = Depends(getDb)):
    return getDashboardSummary(db=db)


@router.get(
    "/status-distribution",
    response_model=list[StatusDistributionResponse],
)
def getCaseStatusDistribution(db: Session = Depends(getDb)):
    return getStatusDistribution(db=db)


@router.get(
    "/field-distribution",
    response_model=list[FieldDistributionResponse],
)
def getCaseFieldDistribution(db: Session = Depends(getDb)):
    return getFieldDistribution(db=db)


@router.get("/monthly-trends", response_model=list[MonthlyCaseTrendResponse])
def getCaseMonthlyTrends(db: Session = Depends(getDb)):
    return getMonthlyCaseTrends(db=db)


@router.get(
    "/department-statistics",
    response_model=list[DepartmentStatisticsResponse],
)
def getCaseDepartmentStatistics(db: Session = Depends(getDb)):
    return getDepartmentStatistics(db=db)


@router.get(
    "/officer-workloads",
    response_model=list[OfficerWorkloadResponse],
)
def getCaseOfficerWorkloads(db: Session = Depends(getDb)):
    return getOfficerWorkloads(db=db)


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
