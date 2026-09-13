from typing import Any

import resend

from app.config import settings


# def sendEmail(recipientEmail: str, subject: str, htmlContent: str) -> dict[str, Any]:
#     if not settings.resend_api_key or not settings.resend_from_email:
#         return _failure("Chưa cấu hình Resend.")
#     try:
#         resend.api_key = settings.resend_api_key
#         response = resend.Emails.send(
#             {
#                 "from": settings.resend_from_email,
#                 "to": [recipientEmail],
#                 "subject": subject,
#                 "html": htmlContent,
#             }
#         )
#         messageId = response.get("id") if isinstance(response, dict) else getattr(response, "id", None)
#         return {
#             "success": True,
#             "provider": "RESEND",
#             "message_id": str(messageId) if messageId else None,
#             "error": None,
#         }
#     except Exception as exc:
#         return _failure(_safeError(exc, settings.resend_api_key))
#
#
def sendEmail(recipientEmail: str, subject: str, htmlContent: str) -> dict[str, Any]:
    if not settings.resend_api_key or not settings.resend_from_email:
        return _failure("Chưa cấu hình Resend.")

    try:
        resend.api_key = settings.resend_api_key

        print("Resend FROM:", settings.resend_from_email)
        print("Resend TO:", recipientEmail)

        response = resend.Emails.send(
            {
                "from": settings.resend_from_email,
                "to": [recipientEmail],
                "subject": subject,
                "html": htmlContent,
            }
        )

        print("RESEND RESPONSE:", response)

        messageId = (
            response.get("id")
            if isinstance(response, dict)
            else getattr(response, "id", None)
        )

        return {
            "success": True,
            "provider": "RESEND",
            "message_id": str(messageId) if messageId else None,
            "error": None,
        }

    except Exception as exc:
        error = _safeError(exc, settings.resend_api_key)

        print("RESEND ERROR TYPE:", type(exc).__name__)
        print("RESEND ERROR:", error)

        return _failure(error)



def _failure(message: str) -> dict[str, Any]:
    return {"success": False, "provider": "RESEND", "message_id": None, "error": message}


def _safeError(exc: Exception, secret: str | None) -> str:
    message = str(exc) or "Resend không thể gửi email."
    if secret:
        message = message.replace(secret, "***")
    return message[:1000]

