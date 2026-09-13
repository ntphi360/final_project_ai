from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Unicode
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Case(Base):
    __tablename__ = "cases"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    procedure_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey(
            "procedures.id",
            name="fk_cases_procedure_id",
        ),
        nullable=True,
        index=True,
    )

    department_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey(
            "departments.id",
            name="fk_cases_department_id",
        ),
        nullable=True,
        index=True,
    )

    officer_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey(
            "officers.id",
            name="fk_cases_officer_id",
        ),
        nullable=True,
        index=True,
    )

    case_code: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )

    procedure_name: Mapped[str] = mapped_column(
        Unicode(255),
        nullable=False,
    )

    field_name: Mapped[str] = mapped_column(
        Unicode(255),
        nullable=False,
    )

    department_name: Mapped[str] = mapped_column(
        Unicode(255),
        nullable=False,
    )

    agency_name: Mapped[str | None] = mapped_column(
        Unicode(255),
        nullable=True,
    )

    applicant_name: Mapped[str | None] = mapped_column(
        Unicode(255),
        nullable=True,
    )

    phone_number: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    officer_name: Mapped[str | None] = mapped_column(
        Unicode(255),
        nullable=True,
    )

    received_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
    )

    deadline_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
    )

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        Unicode(100),
        nullable=False,
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

    procedure: Mapped["Procedure | None"] = relationship(
        back_populates="cases",
    )

    department: Mapped["Department | None"] = relationship(
        back_populates="cases",
    )

    officer: Mapped["Officer | None"] = relationship(
        back_populates="cases",
    )
    assignments: Mapped[list["Assignment"]] = relationship(
        back_populates="case",
    )
