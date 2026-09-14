from typing import Any

from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType

from app.config import settings


async def sendEmail(
    recipientEmail: str,
    subject: str,
    htmlContent: str,
) -> dict[str, Any]:
    if not settings.mail_username or not settings.mail_password or not settings.mail_from:
        return _failure("Chưa cấu hình Gmail SMTP.")

    try:
        configuration = ConnectionConfig(
            MAIL_USERNAME=settings.mail_username,
            MAIL_PASSWORD=settings.mail_password,
            MAIL_FROM=settings.mail_from,
            MAIL_FROM_NAME=settings.mail_from_name,
            MAIL_PORT=settings.mail_port,
            MAIL_SERVER=settings.mail_server,
            MAIL_STARTTLS=settings.mail_starttls,
            MAIL_SSL_TLS=settings.mail_ssl_tls,
            USE_CREDENTIALS=settings.mail_use_credentials,
            VALIDATE_CERTS=settings.mail_validate_certs,
        )
        message = MessageSchema(
            subject=subject,
            recipients=[recipientEmail],
            body=htmlContent,
            subtype=MessageType.html,
        )
        await FastMail(configuration).send_message(message)
        return {
            "success": True,
            "provider": "GMAIL_SMTP",
            "message_id": None,
            "error": None,
        }
    except Exception as exc:
        return _failure(_safeError(exc))


def _failure(message: str) -> dict[str, Any]:
    return {
        "success": False,
        "provider": "GMAIL_SMTP",
        "message_id": None,
        "error": message,
    }


def _safeError(exc: Exception) -> str:
    message = str(exc) or "Gmail SMTP không thể gửi email."
    if settings.mail_password:
        message = message.replace(settings.mail_password, "***")
    return message[:1000]
