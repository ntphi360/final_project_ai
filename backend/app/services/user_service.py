from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.core.security import hashPassword, verifyPassword
from app.models.officer import Officer
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate


class UserNotFoundError(Exception):
    pass


class UserEmailExistsError(Exception):
    pass


class UserOfficerError(Exception):
    pass


class SelfLockError(Exception):
    pass


def getUsers(db: Session) -> list[User]:
    return list(db.scalars(
        select(User).options(joinedload(User.officer)).order_by(User.created_at.desc(), User.id.desc())
    ).all())


def getUserById(db: Session, userId: int) -> User | None:
    return db.scalar(
        select(User).options(joinedload(User.officer)).where(User.id == userId)
    )


def getUserByEmail(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(func.lower(User.email) == email.strip().lower()))


def authenticateUser(db: Session, email: str, password: str) -> User | None:
    user = getUserByEmail(db, email)
    if user is None or not verifyPassword(password, user.password_hash):
        return None
    return user


def createUser(db: Session, data: UserCreate) -> User:
    email = data.email.strip().lower()
    _ensureEmailAvailable(db, email)
    _validateOfficer(db, data.role.value, data.officer_id)
    user = User(
        full_name=data.full_name.strip(),
        email=email,
        phone_number=data.phone_number.strip() if data.phone_number else None,
        password_hash=hashPassword(data.password),
        role=data.role.value,
        officer_id=data.officer_id,
        is_active=True,
    )
    return _saveUser(db, user)


def updateUser(db: Session, userId: int, data: UserUpdate) -> User:
    user = _requireUser(db, userId)
    values = data.model_dump(exclude_unset=True)
    if "email" in values and values["email"] is not None:
        values["email"] = values["email"].strip().lower()
        _ensureEmailAvailable(db, values["email"], userId)
    if "full_name" in values and values["full_name"] is not None:
        values["full_name"] = values["full_name"].strip()
    nextRole = values.get("role", user.role)
    if isinstance(nextRole, UserRole):
        nextRole = nextRole.value
        values["role"] = nextRole
    nextOfficerId = values.get("officer_id", user.officer_id)
    _validateOfficer(db, nextRole, nextOfficerId, userId)
    for key, value in values.items():
        setattr(user, key, value)
    return _saveUser(db, user)


def setUserStatus(db: Session, userId: int, isActive: bool, currentUserId: int) -> User:
    user = _requireUser(db, userId)
    if user.id == currentUserId and not isActive:
        raise SelfLockError
    user.is_active = isActive
    return _saveUser(db, user)


def resetUserPassword(db: Session, userId: int, newPassword: str) -> User:
    user = _requireUser(db, userId)
    user.password_hash = hashPassword(newPassword)
    return _saveUser(db, user)


def _requireUser(db: Session, userId: int) -> User:
    user = getUserById(db, userId)
    if user is None:
        raise UserNotFoundError
    return user


def _ensureEmailAvailable(db: Session, email: str, excludeUserId: int | None = None) -> None:
    statement = select(User.id).where(func.lower(User.email) == email.lower())
    if excludeUserId is not None:
        statement = statement.where(User.id != excludeUserId)
    if db.scalar(statement) is not None:
        raise UserEmailExistsError


def _validateOfficer(
    db: Session,
    role: str,
    officerId: int | None,
    excludeUserId: int | None = None,
) -> None:
    if role in {UserRole.OFFICER.value, UserRole.SUPERVISOR.value} and officerId is None:
        raise UserOfficerError("Vai trò này bắt buộc liên kết với cán bộ")
    if officerId is None:
        return
    officer = db.scalar(select(Officer).where(Officer.id == officerId, Officer.is_active == 1))
    if officer is None:
        raise UserOfficerError("Không tìm thấy cán bộ đang hoạt động")
    statement = select(User.id).where(User.officer_id == officerId)
    if excludeUserId is not None:
        statement = statement.where(User.id != excludeUserId)
    if db.scalar(statement) is not None:
        raise UserOfficerError("Cán bộ đã được liên kết với tài khoản khác")


def _saveUser(db: Session, user: User) -> User:
    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except IntegrityError as exc:
        db.rollback()
        raise UserEmailExistsError from exc
    return getUserById(db, user.id)
