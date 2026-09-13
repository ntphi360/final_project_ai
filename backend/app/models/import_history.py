from __future__ import annotations

from datetime import datetime
from enum import StrEnum

from sqlalchemy import CheckConstraint, DateTime, Integer, Unicode, UnicodeText, text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class ImportHistoryStatus(StrEnum):
    SUCCESS = "SUCCESS"
    PARTIAL = "PARTIAL"
    FAILED = "FAILED"


class ImportHistory(Base):
    __tablename__ = "import_histories"
    __table_args__ = (
        CheckConstraint(
            "status IN ('SUCCESS', 'PARTIAL', 'FAILED')",
            name="ck_import_histories_status",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    file_name: Mapped[str] = mapped_column(Unicode(512), nullable=False)
    total_rows: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_rows: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    updated_rows: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    skipped_rows: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    error_rows: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[str] = mapped_column(
        Unicode(20),
        default=ImportHistoryStatus.SUCCESS.value,
        nullable=False,
        index=True,
    )
    imported_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now,
        server_default=text("GETDATE()"),
        nullable=False,
        index=True,
    )
    error_message: Mapped[str | None] = mapped_column(UnicodeText, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now,
        server_default=text("GETDATE()"),
        nullable=False,
    )
