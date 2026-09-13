from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt

from app.config import settings


class TokenConfigurationError(RuntimeError):
    pass


def hashPassword(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verifyPassword(plainPassword: str, hashedPassword: str) -> bool:
    try:
        return bcrypt.checkpw(
            plainPassword.encode("utf-8"),
            hashedPassword.encode("utf-8"),
        )
    except (TypeError, ValueError):
        return False


def createAccessToken(userId: int, role: str) -> str:
    if not settings.jwt_secret_key:
        raise TokenConfigurationError("JWT_SECRET_KEY chưa được cấu hình")
    expiresAt = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    return jwt.encode(
        {"sub": str(userId), "role": role, "exp": expiresAt},
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )


def decodeAccessToken(token: str) -> dict:
    if not settings.jwt_secret_key:
        raise TokenConfigurationError("JWT_SECRET_KEY chưa được cấu hình")
    try:
        return jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
    except JWTError as exc:
        raise ValueError("Token không hợp lệ hoặc đã hết hạn") from exc
