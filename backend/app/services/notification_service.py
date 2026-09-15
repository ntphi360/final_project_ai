from html import escape
import logging
from typing import Any

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.assignment import Assignment
from app.models.case import Case
from app.models.notification_log import NotificationLog
from app.models.user import User
from app.services.email_service import sendEmail
from app.services.sms_service import normalizeVietnamPhone, sendSms


logger = logging.getLogger(__name__)


async def sendAssignmentNotification(
    assignment: Assignment,
    recipient: User | None,
) -> dict[str, Any]:
    results: dict[str, Any] = {
        "assignment_id": assignment.id,
        "email": None,
        "sms": None,
    }

    if assignment.send_email:
        if recipient is None or not recipient.email:
            results["email"] = _missing("GMAIL_SMTP", "Người nhận chưa có email.")
        else:
            results["email"] = await sendEmail(
                recipient.email,
                f"[Giao việc] Hồ sơ {assignment.case.case_code}",
                _emailContent(assignment),
            )

    if assignment.send_sms:
        if recipient is None or not recipient.phone_number:
            results["sms"] = _missing("TEXTBEE", "Người nhận chưa có số điện thoại.")
        else:
            results["sms"] = sendSms(recipient.phone_number, _smsContent(assignment))

    return results


async def sendCaseConfirmationNotification(
    caseRecord: Case,
    recipient: User | None,
    sendEmailNotification: bool,
    sendSmsNotification: bool,
    note: str | None,
) -> dict[str, Any]:
    results: dict[str, Any] = {"email": None, "sms": None}

    if sendEmailNotification:
        recipientEmail = recipient.email if recipient else None
        if not recipientEmail:
            logger.warning("Email case=%s thiếu email cán bộ nhận", caseRecord.case_code)
            results["email"] = _caseMissing(
                "GMAIL_SMTP",
                "Cán bộ xử lý chưa có email.",
            )
        else:
            logger.info("Email case=%s recipient=%s", caseRecord.case_code, recipientEmail)
            delivery = await sendEmail(
                recipientEmail,
                f"[Xác nhận hồ sơ] {caseRecord.case_code}",
                _caseConfirmationEmailContent(caseRecord, recipient, note),
            )
            results["email"] = _caseDelivery(delivery, recipientEmail)
            _logCaseDelivery(caseRecord.case_code, "Email", results["email"])

    if sendSmsNotification:
        recipientPhone = recipient.phone_number if recipient else None
        if not recipientPhone:
            logger.warning("SMS case=%s thiếu số điện thoại cán bộ nhận", caseRecord.case_code)
            results["sms"] = _caseMissing(
                "TEXTBEE",
                "Cán bộ xử lý chưa có số điện thoại.",
            )
        else:
            normalizedPhone = normalizeVietnamPhone(recipientPhone)
            logger.info(
                "SMS case=%s recipient=%s",
                caseRecord.case_code,
                normalizedPhone or recipientPhone,
            )
            delivery = sendSms(recipientPhone, _caseConfirmationSmsContent(caseRecord, note))
            results["sms"] = _caseDelivery(delivery, normalizedPhone or recipientPhone)
            _logCaseDelivery(caseRecord.case_code, "SMS", results["sms"])

    return results


def saveNotificationLogs(
    db: Session,
    assignment: Assignment,
    recipient: User | None,
    results: dict[str, Any],
) -> None:
    for channel, provider, recipientValue in (
        ("EMAIL", "GMAIL_SMTP", recipient.email if recipient else None),
        ("SMS", "TEXTBEE", normalizeVietnamPhone(recipient.phone_number) if recipient else None),
    ):
        result = results[channel.lower()]
        if result is None:
            continue
        db.add(
            NotificationLog(
                assignment_id=assignment.id,
                channel=channel,
                recipient=recipientValue or "Không có",
                provider=provider,
                success=result["success"],
                provider_message_id=result["message_id"],
                error_message=result["error"],
            )
        )
    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()


def _emailContent(assignment: Assignment) -> str:
    assignedAt = assignment.assigned_at.strftime("%d/%m/%Y %H:%M:%S")
    return f"""
    <p>Xin chào {escape(assignment.assignee.full_name)},</p>
    <p>Bạn vừa được giao xử lý hồ sơ:</p>
    <ul>
      <li><strong>Mã hồ sơ:</strong> {escape(assignment.case.case_code)}</li>
      <li><strong>Thủ tục:</strong> {escape(assignment.case.procedure_name)}</li>
      <li><strong>Người giao:</strong> {escape(assignment.assigner.full_name)}</li>
      <li><strong>Thời gian giao:</strong> {assignedAt}</li>
    </ul>
    <p><strong>Tiêu đề:</strong> {escape(assignment.title)}</p>
    <p><strong>Nội dung:</strong><br>{escape(assignment.content).replace(chr(10), '<br>')}</p>
    <p>Vui lòng đăng nhập hệ thống để xem chi tiết và xác nhận nhận việc hoặc từ chối.</p>
    <p>Email này chỉ dùng để thông báo. Việc xác nhận hoặc từ chối phải thực hiện trong hệ thống.</p>
    """


def _smsContent(assignment: Assignment) -> str:
    return (
        f"Ban vua duoc giao ho so {assignment.case.case_code} - "
        f"{assignment.case.procedure_name}. Vui long dang nhap he thong de xem va xac nhan nhan viec."
    )


def _caseConfirmationEmailContent(
    caseRecord: Case,
    recipient: User,
    note: str | None,
) -> str:
    noteContent = (
        f"<p><strong>Ghi chú:</strong><br>{escape(note).replace(chr(10), '<br>')}</p>"
        if note
        else ""
    )
    return f"""
    <p>Xin chào {escape(recipient.full_name)},</p>
    <p>Hồ sơ bạn đang phụ trách đã được xác nhận:</p>
    <ul>
      <li><strong>Mã hồ sơ:</strong> {escape(caseRecord.case_code)}</li>
      <li><strong>Thủ tục:</strong> {escape(caseRecord.procedure_name)}</li>
      <li><strong>Trạng thái:</strong> Đã xác nhận</li>
    </ul>
    {noteContent}
    <p>Vui lòng đăng nhập hệ thống để xem chi tiết.</p>
    """


def _caseConfirmationSmsContent(caseRecord: Case, note: str | None) -> str:
    message = f"Ho so {caseRecord.case_code} da duoc xac nhan."
    if note:
        message += f" Ghi chu: {note.strip()[:300]}"
    return message


def _caseDelivery(result: dict[str, Any], recipient: str) -> dict[str, Any]:
    return {**result, "recipient": recipient}


def _caseMissing(provider: str, error: str) -> dict[str, Any]:
    return {
        "success": False,
        "provider": provider,
        "recipient": None,
        "message_id": None,
        "error": error,
    }


def _logCaseDelivery(caseCode: str, channel: str, result: dict[str, Any]) -> None:
    if result["success"]:
        logger.info("%s case=%s gửi thành công", channel, caseCode)
    else:
        logger.warning("%s case=%s gửi thất bại", channel, caseCode)


def _missing(provider: str, error: str) -> dict[str, Any]:
    return {"success": False, "provider": provider, "message_id": None, "error": error}
