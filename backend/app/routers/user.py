from collections.abc import Callable

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth_dependencies import requireRoles
from app.database.database import getDb
from app.models.user import User
from app.schemas.user import UserCreate, UserPasswordReset, UserResponse, UserStatusUpdate, UserUpdate
from app.services.user_service import (
    SelfLockError,
    UserEmailExistsError,
    UserNotFoundError,
    UserOfficerError,
    createUser,
    getUserById,
    getUsers,
    resetUserPassword,
    setUserStatus,
    updateUser,
)


adminOnly = requireRoles("ADMIN")
router = APIRouter(prefix="/api/users", tags=["Users"], dependencies=[Depends(adminOnly)])


@router.get("", response_model=list[UserResponse])
def listUsers(db: Session = Depends(getDb)):
    return getUsers(db)


@router.get("/{user_id}", response_model=UserResponse)
def getUser(user_id: int, db: Session = Depends(getDb)):
    user = getUserById(db, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
    return user


@router.post("", response_model=UserResponse, status_code=201)
def addUser(data: UserCreate, db: Session = Depends(getDb)):
    return _handleWrite(lambda: createUser(db, data))


@router.put("/{user_id}", response_model=UserResponse)
def editUser(user_id: int, data: UserUpdate, db: Session = Depends(getDb)):
    return _handleWrite(lambda: updateUser(db, user_id, data))


@router.patch("/{user_id}/status", response_model=UserResponse)
def changeUserStatus(
    user_id: int,
    data: UserStatusUpdate,
    db: Session = Depends(getDb),
    currentUser: User = Depends(adminOnly),
):
    return _handleWrite(lambda: setUserStatus(db, user_id, data.is_active, currentUser.id))


@router.post("/{user_id}/reset-password", response_model=UserResponse)
def resetPassword(user_id: int, data: UserPasswordReset, db: Session = Depends(getDb)):
    return _handleWrite(lambda: resetUserPassword(db, user_id, data.new_password))


def _handleWrite(operation: Callable):
    try:
        return operation()
    except UserNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng") from exc
    except UserEmailExistsError as exc:
        raise HTTPException(status_code=409, detail="Email đã tồn tại trong hệ thống") from exc
    except UserOfficerError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except SelfLockError as exc:
        raise HTTPException(status_code=400, detail="Bạn không thể khóa tài khoản đang đăng nhập.") from exc
