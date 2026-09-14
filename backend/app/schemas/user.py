from datetime import datetime
import re

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.models.user import UserRole


class UserCreate(BaseModel):
    full_name: str = Field(min_length=1, max_length=255)
    email: str = Field(min_length=3, max_length=255)
    phone_number: str | None = Field(default=None, max_length=20)
    role: UserRole
    create_officer: bool = False
    officer_id: int | None = Field(default=None, gt=0)
    department_id: int | None = Field(default=None, gt=0)
    field_ids: list[int] = Field(default_factory=list)
    password: str = Field(min_length=8, max_length=72)

    @field_validator("full_name")
    @classmethod
    def trimName(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Không được để trống")
        return value

    @field_validator("email")
    @classmethod
    def validateEmail(cls, value: str) -> str:
        value = value.strip().lower()
        if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", value):
            raise ValueError("Email không đúng định dạng")
        return value

    @field_validator("password")
    @classmethod
    def validatePasswordBytes(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Mật khẩu không được vượt quá 72 byte")
        return value

    @field_validator("field_ids")
    @classmethod
    def validateFieldIds(cls, value: list[int]) -> list[int]:
        if any(fieldId <= 0 for fieldId in value):
            raise ValueError("field_ids chỉ được chứa số nguyên dương")
        return list(dict.fromkeys(value))

    @model_validator(mode="after")
    def validateOfficerCreation(self):
        if self.role != UserRole.OFFICER:
            self.create_officer = False
            self.officer_id = None
            self.department_id = None
            self.field_ids = []
            return self

        if self.create_officer:
            self.officer_id = None
            if self.department_id is None:
                raise ValueError("Phòng ban là bắt buộc khi tạo cán bộ mới")
            if not self.field_ids:
                raise ValueError("Phải chọn ít nhất một lĩnh vực phụ trách")
            return self

        self.department_id = None
        self.field_ids = []
        if self.officer_id is None:
            raise ValueError("Vai trò cán bộ xử lý bắt buộc liên kết cán bộ")
        return self


class UserUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=255)
    email: str | None = Field(default=None, min_length=3, max_length=255)
    phone_number: str | None = Field(default=None, max_length=20)
    role: UserRole | None = None
    officer_id: int | None = Field(default=None, gt=0)

    @field_validator("full_name")
    @classmethod
    def trimUpdateName(cls, value: str | None) -> str | None:
        return value.strip() if value is not None else None

    @field_validator("email")
    @classmethod
    def validateUpdateEmail(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip().lower()
        if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", value):
            raise ValueError("Email không đúng định dạng")
        return value


class UserStatusUpdate(BaseModel):
    is_active: bool


class UserPasswordReset(BaseModel):
    new_password: str = Field(min_length=8, max_length=72)

    @field_validator("new_password")
    @classmethod
    def validatePasswordBytes(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Mật khẩu không được vượt quá 72 byte")
        return value


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: str
    phone_number: str | None
    role: UserRole
    is_active: bool
    officer_id: int | None
    officer_name: str | None
    created_at: datetime
    updated_at: datetime
