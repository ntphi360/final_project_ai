from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class OfficerField(Base):
    __tablename__ = "officer_fields"

    officer_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("officers.id"),
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

    officer: Mapped[Officer] = relationship(
        back_populates="officer_assignments",
    )
    field: Mapped[Field] = relationship(
        back_populates="officer_assignments",
    )
