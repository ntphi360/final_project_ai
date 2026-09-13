from __future__ import annotations

from datetime import datetime
from enum import StrEnum

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, Index, Integer, String, Unicode, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class UserRole(StrEnum):
    ADMIN = "ADMIN"
    SUPERVISOR = "SUPERVISOR"
    OFFICER = "OFFICER"
    VIEWER = "VIEWER"


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint(
            "role IN ('ADMIN', 'SUPERVISOR', 'OFFICER', 'VIEWER')",
            name="ck_users_role",
        ),
        Index(
            "uq_users_officer_id",
            "officer_id",
            unique=True,
            mssql_where=text("officer_id IS NOT NULL"),
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    full_name: Mapped[str] = mapped_column(Unicode(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    phone_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(Unicode(20), nullable=False, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)
    officer_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("officers.id", name="fk_users_officer_id"),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now, server_default=text("GETDATE()"), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now,
        onupdate=datetime.now,
        server_default=text("GETDATE()"),
        nullable=False,
    )

    officer: Mapped["Officer | None"] = relationship(back_populates="user")

    @property
    def officer_name(self) -> str | None:
        return self.officer.full_name if self.officer is not None else None
