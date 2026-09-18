import logging

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, joinedload

from app.core.cache import invalidateProcessingCache
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
    caseRecordId = caseRecord.id
    caseCode = caseRecord.case_code
    originalStatus = caseRecord.status
    originalIsFollowing = caseRecord.is_following

    logger.info(
        "%s case=%s officer=%s send_email=%s send_sms=%s",
        "Confirm" if isConfirm else "Follow",
        caseRecord.case_code,
        caseRecord.officer.full_name if caseRecord.officer else caseRecord.officer_name,
        str(sendEmailNotification).lower(),
        str(sendSmsNotification).lower(),
    )

    if not isConfirm:
        _persistCaseState(
            db=db,
            caseRecord=caseRecord,
            status=FOLLOWING_STATUS,
            isFollowing=True,
        )
        return CaseActionResponse(
            case_id=caseRecord.id,
            case_code=caseRecord.case_code,
            status=caseRecord.status,
            is_following=caseRecord.is_following,
            success=True,
            confirmed=None,
            note=note,
        )

    notifications = {"email": None, "sms": None}
    try:
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
    except Exception:
        logger.exception(
            "Gửi thông báo xác nhận thất bại cho case=%s",
            caseRecord.case_code,
        )
        notifications = {
            "email": (
                _notificationFailure("GMAIL_SMTP")
                if sendEmailNotification
                else None
            ),
            "sms": (
                _notificationFailure("TEXTBEE")
                if sendSmsNotification
                else None
            ),
        }

    notificationSucceeded = any(
        delivery is not None and delivery.get("status") == "SENT"
        for delivery in (notifications["email"], notifications["sms"])
    )
    if not notificationSucceeded:
        db.rollback()
        return CaseActionResponse(
            case_id=caseRecordId,
            case_code=caseCode,
            status=originalStatus,
            is_following=originalIsFollowing,
            success=False,
            confirmed=False,
            reason="Không có kênh thông báo nào gửi thành công.",
            note=note,
            email=notifications["email"],
            sms=notifications["sms"],
        )

    _persistCaseState(
        db=db,
        caseRecord=caseRecord,
        status=CONFIRMED_STATUS,
        isFollowing=False,
    )

    return CaseActionResponse(
        case_id=caseRecord.id,
        case_code=caseRecord.case_code,
        status=caseRecord.status,
        is_following=caseRecord.is_following,
        success=True,
        confirmed=True,
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
            result = _skippedResult(
                caseId,
                "Không tìm thấy hồ sơ.",
                confirmed=False if data.action == "CONFIRM" else None,
            )
        except CaseActionStateError as exc:
            result = _skippedResult(
                caseId,
                str(exc),
                confirmed=False if data.action == "CONFIRM" else None,
            )
        except Exception:
            db.rollback()
            logger.exception("Không thể xử lý case_id=%s trong batch", caseId)
            result = CaseActionResponse(
                case_id=caseId,
                success=False,
                confirmed=False if data.action == "CONFIRM" else None,
                reason="Không thể cập nhật hồ sơ.",
            )
        results.append(result)

    return CaseBulkActionResponse(
        total=len(results),
        success_count=sum(result.success for result in results),
        confirmed_count=sum(result.confirmed is True for result in results),
        not_confirmed_count=(
            sum(result.confirmed is False for result in results)
            if data.action == "CONFIRM"
            else 0
        ),
        skipped_count=sum(result.skipped for result in results),
        failed_notification_count=sum(
            delivery is not None and delivery.status == "FAILED"
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


def _persistCaseState(
    db: Session,
    caseRecord: Case,
    status: str,
    isFollowing: bool,
) -> None:
    caseRecord.status = status
    caseRecord.is_following = isFollowing
    try:
        db.add(caseRecord)
        db.commit()
        db.refresh(caseRecord)
        invalidateProcessingCache()
    except SQLAlchemyError:
        db.rollback()
        logger.exception("Cập nhật trạng thái thất bại cho case=%s", caseRecord.case_code)
        raise


def _skippedResult(
    caseId: int,
    reason: str,
    confirmed: bool | None = None,
) -> CaseActionResponse:
    return CaseActionResponse(
        case_id=caseId,
        success=False,
        confirmed=confirmed,
        skipped=True,
        reason=reason,
    )


def _notificationFailure(provider: str) -> dict:
    return {
        "status": "FAILED",
        "success": False,
        "provider": provider,
        "recipient": None,
        "message_id": None,
        "error": "Không thể xử lý gửi thông báo.",
    }
