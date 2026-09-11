from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class DepartmentField(Base):
    __tablename__ = "department_fields"

    department_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("departments.id"),
        primary_key=True,
    )
    field_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("fields.id"),
        primary_key=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now,
        nullable=False,
    )

    department: Mapped[Department] = relationship(
        back_populates="department_fields",
    )
    field: Mapped[Field] = relationship(
        back_populates="department_fields",
    )
