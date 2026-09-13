from datetime import date
from math import ceil
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.database import getDb
from app.schemas.assignment import (
    AssignmentCreate,
    AssignmentCreateResponse,
    AssignmentDetail,
    AssignmentFilters,
    AssignmentListResponse,
    AssignmentRead,
    AssignmentReject,
    AssignmentStatusValue,
    AssignmentSummaryResponse,
)
from app.services.assignment_service import (
    AssignmentActorError,
    AssignmentNotFoundError,
    AssignmentStateError,
    CaseNotFoundError,
    OfficerNotFoundError,
    acceptAssignment,
    createAssignments,
    getAssignmentById,
    getAssignments,
    getAssignmentSummary,
    getMyAssignments,
    rejectAssignment,
)


router = APIRouter(prefix="/api/assignments", tags=["Assignments"])

Page = Annotated[int, Query(ge=1)]


@router.post("", response_model=AssignmentCreateResponse, status_code=201)
def createAssignmentBatch(
    data: AssignmentCreate,
    assigner_id: Annotated[int, Query(alias="assignerId", gt=0)],
    db: Session = Depends(getDb),
):
    try:
        assignments, skipped = createAssignments(
            db=db,
            data=data,
            assignerId=assigner_id,
        )
    except OfficerNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy cán bộ có id {exc.officerId}",
        ) from exc
    except CaseNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "message": "Không tìm thấy một hoặc nhiều hồ sơ",
                "caseIds": exc.caseIds,
            },
        ) from exc

    return AssignmentCreateResponse(
        created_count=len(assignments),
        skipped_count=len(skipped),
        assignments=assignments,
        skipped=skipped,
    )


@router.get("/my", response_model=AssignmentListResponse)
def listMyAssignments(
    assignee_id: Annotated[int, Query(alias="assigneeId", gt=0)],
    assignment_status: Annotated[
        AssignmentStatusValue | None,
        Query(alias="status"),
    ] = None,
    search: str | None = None,
    from_date: Annotated[date | None, Query(alias="fromDate")] = None,
    to_date: Annotated[date | None, Query(alias="toDate")] = None,
    page: Page = 1,
    page_size: Annotated[int, Query(alias="pageSize", ge=1, le=100)] = 10,
    db: Session = Depends(getDb),
):
    filters = AssignmentFilters(
        status=assignment_status,
        search=search,
        from_date=from_date,
        to_date=to_date,
    )
    try:
        items, total = getMyAssignments(
            db=db,
            assigneeId=assignee_id,
            filters=filters,
            page=page,
            pageSize=page_size,
        )
    except OfficerNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy cán bộ có id {exc.officerId}",
        ) from exc
    return _listResponse(items, page, page_size, total)


@router.get("/summary", response_model=AssignmentSummaryResponse)
def getSummary(
    assigner_id: Annotated[int | None, Query(alias="assignerId", gt=0)] = None,
    assignee_id: Annotated[int | None, Query(alias="assigneeId", gt=0)] = None,
    db: Session = Depends(getDb),
):
    return getAssignmentSummary(
        db=db,
        assignerId=assigner_id,
        assigneeId=assignee_id,
    )


@router.get("", response_model=AssignmentListResponse)
def listAssignments(
    assignment_status: Annotated[
        AssignmentStatusValue | None,
        Query(alias="status"),
    ] = None,
    assigner_id: Annotated[int | None, Query(alias="assignerId", gt=0)] = None,
    assignee_id: Annotated[int | None, Query(alias="assigneeId", gt=0)] = None,
    department_id: Annotated[
        int | None,
        Query(alias="departmentId", gt=0),
    ] = None,
    search: str | None = None,
    from_date: Annotated[date | None, Query(alias="fromDate")] = None,
    to_date: Annotated[date | None, Query(alias="toDate")] = None,
    page: Page = 1,
    page_size: Annotated[int, Query(alias="pageSize", ge=1, le=100)] = 10,
    db: Session = Depends(getDb),
):
    filters = AssignmentFilters(
        status=assignment_status,
        assigner_id=assigner_id,
        assignee_id=assignee_id,
        department_id=department_id,
        search=search,
        from_date=from_date,
        to_date=to_date,
    )
    items, total = getAssignments(
        db=db,
        filters=filters,
        page=page,
        pageSize=page_size,
    )
    return _listResponse(items, page, page_size, total)


@router.get("/{assignment_id}", response_model=AssignmentDetail)
def getAssignmentDetail(
    assignment_id: int,
    db: Session = Depends(getDb),
):
    try:
        return getAssignmentById(db=db, assignmentId=assignment_id)
    except AssignmentNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy giao việc",
        ) from exc


@router.post("/{assignment_id}/accept", response_model=AssignmentRead)
def acceptAssignedTask(
    assignment_id: int,
    assignee_id: Annotated[int, Query(alias="assigneeId", gt=0)],
    db: Session = Depends(getDb),
):
    try:
        return acceptAssignment(
            db=db,
            assignmentId=assignment_id,
            assigneeId=assignee_id,
        )
    except AssignmentNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy giao việc",
        ) from exc
    except AssignmentStateError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Chỉ có thể nhận giao việc đang ở trạng thái PENDING",
        ) from exc
    except AssignmentActorError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ cán bộ nhận việc mới có thể xác nhận",
        ) from exc


@router.post("/{assignment_id}/reject", response_model=AssignmentRead)
def rejectAssignedTask(
    assignment_id: int,
    data: AssignmentReject,
    assignee_id: Annotated[int, Query(alias="assigneeId", gt=0)],
    db: Session = Depends(getDb),
):
    try:
        return rejectAssignment(
            db=db,
            assignmentId=assignment_id,
            assigneeId=assignee_id,
            reason=data.reason,
        )
    except AssignmentNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy giao việc",
        ) from exc
    except AssignmentStateError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Chỉ có thể từ chối giao việc đang ở trạng thái PENDING",
        ) from exc
    except AssignmentActorError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ cán bộ nhận việc mới có thể từ chối",
        ) from exc


def _listResponse(
    items: list[AssignmentRead],
    page: int,
    pageSize: int,
    total: int,
) -> AssignmentListResponse:
    return AssignmentListResponse(
        items=items,
        page=page,
        page_size=pageSize,
        total=total,
        total_pages=ceil(total / pageSize) if total else 0,
    )
