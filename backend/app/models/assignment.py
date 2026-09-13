from __future__ import annotations

from datetime import datetime
from enum import StrEnum

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Unicode,
    UnicodeText,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class AssignmentStatus(StrEnum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"


class Assignment(Base):
    __tablename__ = "assignments"
    __table_args__ = (
        CheckConstraint(
            "status IN ('PENDING', 'ACCEPTED', 'REJECTED')",
            name="ck_assignments_status",
        ),
        Index(
            "uq_assignments_pending_case_assignee",
            "case_id",
            "assignee_id",
            unique=True,
            mssql_where=text("status = N'PENDING'"),
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )
    case_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("cases.id", name="fk_assignments_case_id"),
        nullable=False,
        index=True,
    )
    assigner_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("officers.id", name="fk_assignments_assigner_id"),
        nullable=False,
        index=True,
    )
    assignee_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("officers.id", name="fk_assignments_assignee_id"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(
        Unicode(255),
        nullable=False,
    )
    content: Mapped[str] = mapped_column(
        UnicodeText,
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        Unicode(20),
        default=AssignmentStatus.PENDING.value,
        nullable=False,
        index=True,
    )
    send_email: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    send_sms: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    assigned_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now,
        nullable=False,
        index=True,
    )
    accepted_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )
    rejected_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )
    rejection_reason: Mapped[str | None] = mapped_column(
        UnicodeText,
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now,
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now,
        onupdate=datetime.now,
        nullable=False,
    )

    case: Mapped["Case"] = relationship(back_populates="assignments")
    assigner: Mapped["Officer"] = relationship(
        back_populates="assigned_tasks",
        foreign_keys=[assigner_id],
    )
    assignee: Mapped["Officer"] = relationship(
        back_populates="received_tasks",
        foreign_keys=[assignee_id],
    )
