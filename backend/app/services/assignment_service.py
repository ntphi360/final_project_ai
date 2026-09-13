from datetime import datetime, time, timedelta

from sqlalchemy import Select, case, func, or_, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, joinedload

from app.models.assignment import Assignment, AssignmentStatus
from app.models.case import Case
from app.models.officer import Officer
from app.models.user import User
from app.schemas.assignment import (
    AssignmentCreate,
    AssignmentDetail,
    AssignmentFilters,
    AssignmentRead,
    AssignmentSkipped,
    AssignmentNotificationResult,
    AssignmentSummaryResponse,
)
from app.services.notification_service import saveNotificationLogs, sendAssignmentNotification


class AssignmentNotFoundError(Exception):
    pass


class AssignmentStateError(Exception):
    pass


class AssignmentActorError(Exception):
    pass


class CaseNotFoundError(Exception):
    def __init__(self, caseIds: list[int]):
        self.caseIds = caseIds


class OfficerNotFoundError(Exception):
    def __init__(self, officerId: int):
        self.officerId = officerId


def createAssignments(
    db: Session,
    data: AssignmentCreate,
    assignerId: int,
) -> tuple[list[AssignmentRead], list[AssignmentSkipped], list[AssignmentNotificationResult]]:
    _requireActiveOfficer(db=db, officerId=assignerId)
    _requireActiveOfficer(db=db, officerId=data.assignee_id)

    uniqueCaseIds = list(dict.fromkeys(data.case_ids))
    cases = list(
        db.scalars(select(Case).where(Case.id.in_(uniqueCaseIds))).all()
    )
    foundCaseIds = {case.id for case in cases}
    missingCaseIds = [caseId for caseId in uniqueCaseIds if caseId not in foundCaseIds]
    if missingCaseIds:
        raise CaseNotFoundError(missingCaseIds)

    pendingCaseIds = set(
        db.scalars(
            select(Assignment.case_id).where(
                Assignment.case_id.in_(uniqueCaseIds),
                Assignment.assignee_id == data.assignee_id,
                Assignment.status == AssignmentStatus.PENDING.value,
            )
        ).all()
    )

    now = datetime.now()
    createdAssignments: list[Assignment] = []
    skipped = [
        AssignmentSkipped(
            case_id=caseId,
            reason="Đã tồn tại giao việc đang chờ phản hồi cho cán bộ này",
        )
        for caseId in uniqueCaseIds
        if caseId in pendingCaseIds
    ]

    for caseId in uniqueCaseIds:
        if caseId in pendingCaseIds:
            continue
        assignment = Assignment(
            case_id=caseId,
            assigner_id=assignerId,
            assignee_id=data.assignee_id,
            title=data.title,
            content=data.content,
            status=AssignmentStatus.PENDING.value,
            send_email=data.send_email,
            send_sms=data.send_sms,
            assigned_at=now,
        )
        db.add(assignment)
        createdAssignments.append(assignment)

    try:
        db.flush()
        createdIds = [assignment.id for assignment in createdAssignments]
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise

    if not createdIds:
        return [], skipped, []

    statement = _assignmentSelect().where(Assignment.id.in_(createdIds))
    savedAssignments = list(db.scalars(statement).unique().all())
    savedById = {assignment.id: assignment for assignment in savedAssignments}
    notificationResults: list[AssignmentNotificationResult] = []
    for assignmentId in createdIds:
        assignment = savedById[assignmentId]
        try:
            recipient = db.scalar(select(User).where(User.officer_id == assignment.assignee_id))
            result = sendAssignmentNotification(assignment, recipient)
            saveNotificationLogs(db, assignment, recipient, result)
        except Exception:
            db.rollback()
            result = {
                "assignment_id": assignmentId,
                "email": _notificationFailure("RESEND") if assignment.send_email else None,
                "sms": _notificationFailure("TEXTBEE") if assignment.send_sms else None,
            }
        notificationResults.append(AssignmentNotificationResult.model_validate(result))

    return (
        [toAssignmentRead(savedById[id]) for id in createdIds],
        skipped,
        notificationResults,
    )


def getAssignments(
    db: Session,
    filters: AssignmentFilters,
    page: int,
    pageSize: int,
) -> tuple[list[AssignmentRead], int]:
    conditions = _buildFilterConditions(filters)
    total = db.scalar(
        select(func.count(Assignment.id))
        .join(Assignment.case)
        .where(*conditions)
    ) or 0

    statement = (
        _assignmentSelect()
        .join(Assignment.case)
        .where(*conditions)
        .order_by(Assignment.assigned_at.desc(), Assignment.id.desc())
        .offset((page - 1) * pageSize)
        .limit(pageSize)
    )
    assignments = list(db.scalars(statement).unique().all())
    return [toAssignmentRead(item) for item in assignments], total


def getMyAssignments(
    db: Session,
    assigneeId: int,
    filters: AssignmentFilters,
    page: int,
    pageSize: int,
) -> tuple[list[AssignmentRead], int]:
    _requireActiveOfficer(db=db, officerId=assigneeId)
    filters.assignee_id = assigneeId
    return getAssignments(db=db, filters=filters, page=page, pageSize=pageSize)


def getAssignmentById(db: Session, assignmentId: int) -> AssignmentDetail:
    assignment = db.scalar(
        _assignmentSelect().where(Assignment.id == assignmentId)
    )
    if assignment is None:
        raise AssignmentNotFoundError
    return toAssignmentDetail(assignment)


def acceptAssignment(
    db: Session,
    assignmentId: int,
    assigneeId: int,
) -> AssignmentRead:
    assignment = _getAssignmentForUpdate(db=db, assignmentId=assignmentId)
    _requireAssignee(assignment=assignment, assigneeId=assigneeId)
    _requirePending(assignment)

    assignment.status = AssignmentStatus.ACCEPTED.value
    assignment.accepted_at = datetime.now()
    assignment.rejected_at = None
    assignment.rejection_reason = None
    _commitAssignment(db=db, assignment=assignment)
    return getAssignmentById(db=db, assignmentId=assignmentId)


def rejectAssignment(
    db: Session,
    assignmentId: int,
    assigneeId: int,
    reason: str,
) -> AssignmentRead:
    assignment = _getAssignmentForUpdate(db=db, assignmentId=assignmentId)
    _requireAssignee(assignment=assignment, assigneeId=assigneeId)
    _requirePending(assignment)

    assignment.status = AssignmentStatus.REJECTED.value
    assignment.rejected_at = datetime.now()
    assignment.rejection_reason = reason
    assignment.accepted_at = None
    _commitAssignment(db=db, assignment=assignment)
    return getAssignmentById(db=db, assignmentId=assignmentId)


def getAssignmentSummary(
    db: Session,
    assignerId: int | None = None,
    assigneeId: int | None = None,
) -> AssignmentSummaryResponse:
    conditions = []
    if assignerId is not None:
        conditions.append(Assignment.assigner_id == assignerId)
    if assigneeId is not None:
        conditions.append(Assignment.assignee_id == assigneeId)

    row = db.execute(
        select(
            func.count(Assignment.id),
            func.sum(
                case(
                    (Assignment.status == AssignmentStatus.PENDING.value, 1),
                    else_=0,
                )
            ),
            func.sum(
                case(
                    (Assignment.status == AssignmentStatus.ACCEPTED.value, 1),
                    else_=0,
                )
            ),
            func.sum(
                case(
                    (Assignment.status == AssignmentStatus.REJECTED.value, 1),
                    else_=0,
                )
            ),
        ).where(*conditions)
    ).one()
    return AssignmentSummaryResponse(
        total=row[0],
        pending=row[1] or 0,
        accepted=row[2] or 0,
        rejected=row[3] or 0,
    )


def toAssignmentRead(assignment: Assignment) -> AssignmentRead:
    return AssignmentRead(
        id=assignment.id,
        case_id=assignment.case_id,
        case_code=assignment.case.case_code,
        procedure_name=assignment.case.procedure_name,
        field_name=assignment.case.field_name,
        department_id=assignment.case.department_id,
        department_name=assignment.case.department_name,
        assigner_id=assignment.assigner_id,
        assigner_name=assignment.assigner.full_name,
        assignee_id=assignment.assignee_id,
        assignee_name=assignment.assignee.full_name,
        title=assignment.title,
        content=assignment.content,
        status=assignment.status,
        send_email=assignment.send_email,
        send_sms=assignment.send_sms,
        assigned_at=assignment.assigned_at,
        accepted_at=assignment.accepted_at,
        rejected_at=assignment.rejected_at,
        rejection_reason=assignment.rejection_reason,
        created_at=assignment.created_at,
        updated_at=assignment.updated_at,
    )


def toAssignmentDetail(assignment: Assignment) -> AssignmentDetail:
    caseItem = assignment.case
    return AssignmentDetail(
        **toAssignmentRead(assignment).model_dump(),
        case={
            "id": caseItem.id,
            "case_code": caseItem.case_code,
            "procedure_id": caseItem.procedure_id,
            "procedure_name": caseItem.procedure_name,
            "field_name": caseItem.field_name,
            "department_id": caseItem.department_id,
            "department_name": caseItem.department_name,
            "agency_name": caseItem.agency_name,
            "applicant_name": caseItem.applicant_name,
            "phone_number": caseItem.phone_number,
            "officer_id": caseItem.officer_id,
            "officer_name": caseItem.officer_name,
            "received_at": caseItem.received_at,
            "deadline_at": caseItem.deadline_at,
            "completed_at": caseItem.completed_at,
            "status": caseItem.status,
        },
        assigner=assignment.assigner,
        assignee=assignment.assignee,
    )


def _assignmentSelect() -> Select[tuple[Assignment]]:
    return select(Assignment).options(
        joinedload(Assignment.case),
        joinedload(Assignment.assigner),
        joinedload(Assignment.assignee),
    )


def _buildFilterConditions(filters: AssignmentFilters) -> list:
    conditions = []
    if filters.status is not None:
        conditions.append(Assignment.status == filters.status.value)
    if filters.assigner_id is not None:
        conditions.append(Assignment.assigner_id == filters.assigner_id)
    if filters.assignee_id is not None:
        conditions.append(Assignment.assignee_id == filters.assignee_id)
    if filters.department_id is not None:
        conditions.append(Case.department_id == filters.department_id)
    if filters.search:
        keyword = f"%{filters.search.strip()}%"
        conditions.append(
            or_(
                Case.case_code.like(keyword),
                Case.procedure_name.like(keyword),
                Assignment.assigner.has(Officer.full_name.like(keyword)),
                Assignment.assignee.has(Officer.full_name.like(keyword)),
            )
        )
    if filters.from_date is not None:
        conditions.append(
            Assignment.assigned_at >= datetime.combine(filters.from_date, time.min)
        )
    if filters.to_date is not None:
        conditions.append(
            Assignment.assigned_at
            < datetime.combine(filters.to_date + timedelta(days=1), time.min)
        )
    return conditions


def _requireActiveOfficer(db: Session, officerId: int) -> Officer:
    officer = db.scalar(
        select(Officer).where(
            Officer.id == officerId,
            Officer.is_active == 1,
        )
    )
    if officer is None:
        raise OfficerNotFoundError(officerId)
    return officer


def _getAssignmentForUpdate(db: Session, assignmentId: int) -> Assignment:
    assignment = db.scalar(
        select(Assignment)
        .where(Assignment.id == assignmentId)
        .with_for_update()
    )
    if assignment is None:
        raise AssignmentNotFoundError
    return assignment


def _requirePending(assignment: Assignment) -> None:
    if assignment.status != AssignmentStatus.PENDING.value:
        raise AssignmentStateError


def _requireAssignee(assignment: Assignment, assigneeId: int) -> None:
    if assignment.assignee_id != assigneeId:
        raise AssignmentActorError


def _commitAssignment(db: Session, assignment: Assignment) -> None:
    try:
        db.add(assignment)
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise


def _notificationFailure(provider: str) -> dict:
    return {
        "success": False,
        "provider": provider,
        "message_id": None,
        "error": "Không thể xử lý gửi thông báo.",
    }
