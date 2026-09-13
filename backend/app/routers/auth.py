from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth_dependencies import getCurrentUser
from app.core.security import TokenConfigurationError, createAccessToken, verifyPassword
from app.database.database import getDb
from app.models.user import User
from app.schemas.auth import LoginRequest, LoginResponse
from app.schemas.user import UserResponse
from app.services.user_service import getUserByEmail


router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/login", response_model=LoginResponse)
def login(data: LoginRequest, db: Session = Depends(getDb)):
    user = getUserByEmail(db, data.email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email hoặc mật khẩu không đúng.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Tài khoản đã bị khóa.")
    if not verifyPassword(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email hoặc mật khẩu không đúng.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        token = createAccessToken(user.id, user.role)
    except TokenConfigurationError as exc:
        raise HTTPException(status_code=500, detail="Máy chủ chưa được cấu hình JWT.") from exc
    return LoginResponse(access_token=token, user=user)


@router.get("/me", response_model=UserResponse)
def getMe(currentUser: User = Depends(getCurrentUser)):
    return currentUser
