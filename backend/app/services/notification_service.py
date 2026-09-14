from html import escape
from typing import Any

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.assignment import Assignment
from app.models.notification_log import NotificationLog
from app.models.user import User
from app.services.email_service import sendEmail
from app.services.sms_service import normalizeVietnamPhone, sendSms


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


def _missing(provider: str, error: str) -> dict[str, Any]:
    return {"success": False, "provider": provider, "message_id": None, "error": error}
