from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.core.cache import OFFICERS_CACHE_KEY, cache, invalidateProcessingCache
from app.core.security import hashPassword, verifyPassword
from app.models.department import Department
from app.models.department_field import DepartmentField
from app.models.field import Field
from app.models.officer import Officer
from app.models.officer_field import OfficerField
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


def _userLoadOptions():
    return (
        joinedload(User.officer)
        .selectinload(Officer.officer_assignments)
        .joinedload(OfficerField.field)
        .selectinload(Field.department_fields)
        .joinedload(DepartmentField.department),
    )


def getUsers(db: Session) -> list[User]:
    return list(db.scalars(
        select(User).options(*_userLoadOptions()).order_by(User.created_at.desc(), User.id.desc())
    ).all())


def getUserById(db: Session, userId: int) -> User | None:
    return db.scalar(
        select(User).options(*_userLoadOptions()).where(User.id == userId)
    )


def getUserByEmail(db: Session, email: str) -> User | None:
    return db.scalar(
        select(User)
        .options(*_userLoadOptions())
        .where(func.lower(User.email) == email.strip().lower())
    )


def authenticateUser(db: Session, email: str, password: str) -> User | None:
    user = getUserByEmail(db, email)
    if user is None or not verifyPassword(password, user.password_hash):
        return None
    return user


def createUser(db: Session, data: UserCreate) -> User:
    email = data.email.strip().lower()
    _ensureEmailAvailable(db, email)
    phoneNumber = (data.phone_number or "").strip() or None

    try:
        officerId = None
        if data.role == UserRole.OFFICER:
            if data.create_officer:
                officerId = _createOfficerWithFields(
                    db=db,
                    fullName=data.full_name.strip(),
                    email=email,
                    phoneNumber=phoneNumber,
                    departmentId=data.department_id,
                    fieldIds=data.field_ids,
                )
            else:
                _validateOfficer(db, data.role.value, data.officer_id)
                officerId = data.officer_id

        user = User(
            full_name=data.full_name.strip(),
            email=email,
            phone_number=phoneNumber,
            password_hash=hashPassword(data.password),
            role=data.role.value,
            officer_id=officerId,
            is_active=True,
        )
        db.add(user)
        db.commit()
        userId = user.id
        invalidateProcessingCache()
        if data.create_officer:
            cache.delete(OFFICERS_CACHE_KEY)
    except IntegrityError as exc:
        db.rollback()
        if getUserByEmail(db, email) is not None:
            raise UserEmailExistsError from exc
        raise UserOfficerError("Cán bộ này đã được liên kết với tài khoản khác.") from exc
    except Exception:
        db.rollback()
        raise

    return getUserById(db, userId)


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
    if nextRole != UserRole.OFFICER.value:
        values["officer_id"] = None
    nextOfficerId = values.get("officer_id", user.officer_id)
    _validateOfficer(db, nextRole, nextOfficerId, userId)
    for key, value in values.items():
        setattr(user, key, value)
    savedUser = _saveUser(db, user)
    invalidateProcessingCache()
    return savedUser


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
    if role == UserRole.OFFICER.value and officerId is None:
        raise UserOfficerError("Vai trò cán bộ xử lý bắt buộc liên kết cán bộ")
    if officerId is None:
        return
    officer = db.scalar(select(Officer).where(Officer.id == officerId, Officer.is_active == 1))
    if officer is None:
        raise UserOfficerError("Không tìm thấy cán bộ đang hoạt động")
    statement = select(User.id).where(User.officer_id == officerId)
    if excludeUserId is not None:
        statement = statement.where(User.id != excludeUserId)
    if db.scalar(statement) is not None:
        raise UserOfficerError("Cán bộ này đã được liên kết với tài khoản khác.")


def _createOfficerWithFields(
    db: Session,
    fullName: str,
    email: str,
    phoneNumber: str | None,
    departmentId: int | None,
    fieldIds: list[int],
) -> int:
    if departmentId is None:
        raise UserOfficerError("Phòng ban là bắt buộc khi tạo cán bộ mới")
    departmentExists = db.scalar(
        select(Department.id).where(
            Department.id == departmentId,
            Department.is_active == 1,
        )
    )
    if departmentExists is None:
        raise UserOfficerError("Không tìm thấy phòng ban đang hoạt động")

    uniqueFieldIds = list(dict.fromkeys(fieldIds))
    if not uniqueFieldIds:
        raise UserOfficerError("Phải chọn ít nhất một lĩnh vực phụ trách")
    validFieldIds = set(
        db.scalars(
            select(Field.id)
            .join(DepartmentField, DepartmentField.field_id == Field.id)
            .where(
                DepartmentField.department_id == departmentId,
                Field.id.in_(uniqueFieldIds),
                Field.is_active == 1,
            )
        ).all()
    )
    if validFieldIds != set(uniqueFieldIds):
        raise UserOfficerError("Một hoặc nhiều lĩnh vực không thuộc phòng ban đã chọn")

    officer = Officer(
        full_name=fullName,
        phone_number=phoneNumber,
        email=email,
        is_active=True,
    )
    db.add(officer)
    db.flush()
    db.add_all(
        [OfficerField(officer_id=officer.id, field_id=fieldId) for fieldId in uniqueFieldIds]
    )
    return officer.id


def _saveUser(db: Session, user: User) -> User:
    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except IntegrityError as exc:
        db.rollback()
        raise UserEmailExistsError from exc
    return getUserById(db, user.id)
