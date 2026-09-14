"""replace Resend provider with Gmail SMTP

Revision ID: b7d3e5f9a012
Revises: a6c2d4e8f901
Create Date: 2026-09-14 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op


revision: str = "b7d3e5f9a012"
down_revision: Union[str, Sequence[str], None] = "a6c2d4e8f901"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint(
        "ck_notification_logs_provider",
        "notification_logs",
        type_="check",
    )
    op.create_check_constraint(
        "ck_notification_logs_provider",
        "notification_logs",
        "provider IN ('RESEND', 'GMAIL_SMTP', 'TEXTBEE')",
    )


def downgrade() -> None:
    op.drop_constraint(
        "ck_notification_logs_provider",
        "notification_logs",
        type_="check",
    )
    op.create_check_constraint(
        "ck_notification_logs_provider",
        "notification_logs",
        "provider IN ('RESEND', 'TEXTBEE')",
    )
