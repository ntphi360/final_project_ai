import logging

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, joinedload

from app.models.case import Case
from app.models.officer import Officer
from app.schemas.case import (
    CaseActionRequest,
    CaseActionResponse,
    CaseBulkActionRequest,
    CaseBulkActionResponse,
)
from app.services.notification_service import sendCaseConfirmationNotification


logger = logging.getLogger(__name__)

PROCESSING_STATUS = "Đang xử lý"
FOLLOWING_STATUS = "Chờ xác nhận"
CONFIRMED_STATUS = "Đã xác nhận"


class CaseActionNotFoundError(Exception):
    pass


class CaseActionStateError(Exception):
    pass


async def applyCaseAction(
    db: Session,
    caseId: int,
    data: CaseActionRequest,
) -> CaseActionResponse:
    caseRecord = _getCaseForAction(db=db, caseId=caseId)
    if caseRecord is None:
        raise CaseActionNotFoundError

    _validateAction(caseRecord, data.action)
    isConfirm = data.action == "CONFIRM"
    sendEmailNotification = isConfirm and data.send_email
    sendSmsNotification = isConfirm and data.send_sms
    note = data.note.strip() if data.note and data.note.strip() else None

    logger.info(
        "%s case=%s officer=%s send_email=%s send_sms=%s",
        "Confirm" if isConfirm else "Follow",
        caseRecord.case_code,
        caseRecord.officer.full_name if caseRecord.officer else caseRecord.officer_name,
        str(sendEmailNotification).lower(),
        str(sendSmsNotification).lower(),
    )

    caseRecord.status = CONFIRMED_STATUS if isConfirm else FOLLOWING_STATUS
    caseRecord.is_following = not isConfirm
    try:
        db.add(caseRecord)
        db.commit()
        db.refresh(caseRecord)
    except SQLAlchemyError:
        db.rollback()
        logger.exception("Cập nhật trạng thái thất bại cho case=%s", caseRecord.case_code)
        raise

    notifications = {"email": None, "sms": None}
    if isConfirm and (sendEmailNotification or sendSmsNotification):
        notifications = await sendCaseConfirmationNotification(
            caseRecord=caseRecord,
            recipient=(
                caseRecord.officer.user
                if caseRecord.officer and caseRecord.officer.user
                else None
            ),
            sendEmailNotification=sendEmailNotification,
            sendSmsNotification=sendSmsNotification,
            note=note,
        )

    return CaseActionResponse(
        case_id=caseRecord.id,
        case_code=caseRecord.case_code,
        status=caseRecord.status,
        is_following=caseRecord.is_following,
        success=True,
        note=note,
        email=notifications["email"],
        sms=notifications["sms"],
    )


async def applyCaseBulkAction(
    db: Session,
    data: CaseBulkActionRequest,
) -> CaseBulkActionResponse:
    results: list[CaseActionResponse] = []
    actionData = CaseActionRequest(
        action=data.action,
        send_email=data.send_email,
        send_sms=data.send_sms,
        note=data.note,
    )

    for caseId in dict.fromkeys(data.case_ids):
        try:
            result = await applyCaseAction(db=db, caseId=caseId, data=actionData)
        except CaseActionNotFoundError:
            result = _skippedResult(caseId, "Không tìm thấy hồ sơ.")
        except CaseActionStateError as exc:
            result = _skippedResult(caseId, str(exc))
        except Exception:
            db.rollback()
            logger.exception("Không thể xử lý case_id=%s trong batch", caseId)
            result = CaseActionResponse(
                case_id=caseId,
                success=False,
                reason="Không thể cập nhật hồ sơ.",
            )
        results.append(result)

    return CaseBulkActionResponse(
        success_count=sum(result.success for result in results),
        skipped_count=sum(result.skipped for result in results),
        failed_notification_count=sum(
            delivery is not None and not delivery.success
            for result in results
            for delivery in (result.email, result.sms)
        ),
        results=results,
    )


def _getCaseForAction(db: Session, caseId: int) -> Case | None:
    return db.scalar(
        select(Case)
        .options(joinedload(Case.officer).joinedload(Officer.user))
        .where(Case.id == caseId)
        .with_for_update()
    )


def _validateAction(caseRecord: Case, action: str) -> None:
    if action == "CONFIRM" and caseRecord.status == CONFIRMED_STATUS:
        raise CaseActionStateError("Hồ sơ đã được xác nhận trước đó.")
    if action == "FOLLOW" and caseRecord.status != PROCESSING_STATUS:
        raise CaseActionStateError(
            "Chỉ hồ sơ đang xử lý mới có thể chuyển sang theo dõi thêm."
        )


def _skippedResult(caseId: int, reason: str) -> CaseActionResponse:
    return CaseActionResponse(
        case_id=caseId,
        success=False,
        skipped=True,
        reason=reason,
    )
