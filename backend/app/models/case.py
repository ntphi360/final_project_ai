from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Unicode
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Case(Base):
    __tablename__ = "cases"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    case_code: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True
    )

    procedure_name: Mapped[str] = mapped_column(
        Unicode(255),
        nullable=False
    )

    field_name: Mapped[str] = mapped_column(
        Unicode(255),
        nullable=False
    )

    department_name: Mapped[str] = mapped_column(
        Unicode(255),
        nullable=False
    )

    agency_name: Mapped[str | None] = mapped_column(
        Unicode(255),
        nullable=True
    )

    applicant_name: Mapped[str | None] = mapped_column(
        Unicode(255),
        nullable=True
    )

    phone_number: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True
    )

    officer_name: Mapped[str | None] = mapped_column(
        Unicode(255),
        nullable=True
    )

    received_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False
    )

    deadline_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False
    )

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )

    status: Mapped[str] = mapped_column(
        Unicode(100),
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now,
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now,
        onupdate=datetime.now,
        nullable=False
    )