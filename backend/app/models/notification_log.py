from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, Integer, String, Unicode, UnicodeText, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class NotificationLog(Base):
    __tablename__ = "notification_logs"
    __table_args__ = (
        CheckConstraint("channel IN ('EMAIL', 'SMS')", name="ck_notification_logs_channel"),
        CheckConstraint(
            "provider IN ('RESEND', 'GMAIL_SMTP', 'TEXTBEE')",
            name="ck_notification_logs_provider",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    assignment_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("assignments.id", name="fk_notification_logs_assignment_id"),
        nullable=False,
        index=True,
    )
    channel: Mapped[str] = mapped_column(Unicode(10), nullable=False, index=True)
    recipient: Mapped[str] = mapped_column(Unicode(255), nullable=False)
    provider: Mapped[str] = mapped_column(Unicode(20), nullable=False)
    success: Mapped[bool] = mapped_column(Boolean, nullable=False, index=True)
    provider_message_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    error_message: Mapped[str | None] = mapped_column(UnicodeText, nullable=True)
    sent_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now, server_default=text("GETDATE()"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now, server_default=text("GETDATE()"), nullable=False
    )

    assignment: Mapped["Assignment"] = relationship(back_populates="notification_logs")
