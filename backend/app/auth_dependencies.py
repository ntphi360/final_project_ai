from collections.abc import Callable
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import TokenConfigurationError, decodeAccessToken
from app.database.database import getDb
from app.models.user import User
from app.services.user_service import getUserById


bearerScheme = HTTPBearer(auto_error=False)


def getCurrentUser(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearerScheme)],
    db: Session = Depends(getDb),
) -> User:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Phiên đăng nhập không hợp lệ hoặc đã hết hạn.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise unauthorized
    try:
        payload = decodeAccessToken(credentials.credentials)
        userId = int(payload.get("sub", ""))
    except (TokenConfigurationError, TypeError, ValueError):
        raise unauthorized
    user = getUserById(db, userId)
    if user is None:
        raise unauthorized
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản đã bị khóa.",
        )
    return user


def requireRoles(*roles: str) -> Callable:
    allowedRoles = set(roles)

    def dependency(currentUser: User = Depends(getCurrentUser)) -> User:
        if currentUser.role not in allowedRoles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bạn không có quyền thực hiện thao tác này.",
            )
        return currentUser

    return dependency
