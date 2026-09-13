import re
from typing import Any

import requests

from app.config import settings


def normalizeVietnamPhone(phoneNumber: str | None) -> str | None:
    if not phoneNumber:
        return None
    normalized = re.sub(r"[\s.\-()]", "", phoneNumber.strip())
    if normalized.startswith("0"):
        normalized = "+84" + normalized[1:]
    elif normalized.startswith("84"):
        normalized = "+" + normalized
    if not re.fullmatch(r"\+84[35789]\d{8}", normalized):
        return None
    return normalized


def sendSms(recipientPhone: str, message: str) -> dict[str, Any]:
    normalizedPhone = normalizeVietnamPhone(recipientPhone)
    if normalizedPhone is None:
        return _failure("Số điện thoại không hợp lệ.")
    if not settings.textbee_api_key:
        return _failure("Chưa cấu hình TextBee.")

    body: dict[str, Any] = {"recipients": [normalizedPhone], "message": message}
    if settings.textbee_device_id:
        body["deviceId"] = settings.textbee_device_id

    try:
        response = requests.post(
            f"{settings.textbee_base_url.rstrip('/')}/gateway/send-sms",
            headers={"x-api-key": settings.textbee_api_key, "Content-Type": "application/json"},
            json=body,
            timeout=15,
        )
        try:
            responseData = response.json()
        except ValueError:
            responseData = {}
        if not response.ok:
            error = responseData.get("message") or responseData.get("error") or f"TextBee trả HTTP {response.status_code}."
            return _failure(_safeMessage(str(error)))
        messageId = responseData.get("smsBatchId") or responseData.get("id")
        return {
            "success": True,
            "provider": "TEXTBEE",
            "message_id": str(messageId) if messageId else None,
            "error": None,
        }
    except requests.RequestException as exc:
        return _failure(_safeMessage(str(exc) or "TextBee không thể gửi SMS."))
    except Exception as exc:
        return _failure(_safeMessage(str(exc) or "TextBee không thể gửi SMS."))


def _failure(message: str) -> dict[str, Any]:
    return {"success": False, "provider": "TEXTBEE", "message_id": None, "error": message}


def _safeMessage(message: str) -> str:
    if settings.textbee_api_key:
        message = message.replace(settings.textbee_api_key, "***")
    return message[:1000]
