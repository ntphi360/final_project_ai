"""add notification logs table

Revision ID: a6c2d4e8f901
Revises: f1a9c73e2b64
Create Date: 2026-09-13 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a6c2d4e8f901"
down_revision: Union[str, Sequence[str], None] = "f1a9c73e2b64"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "notification_logs",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("assignment_id", sa.Integer(), nullable=False),
        sa.Column("channel", sa.Unicode(length=10), nullable=False),
        sa.Column("recipient", sa.Unicode(length=255), nullable=False),
        sa.Column("provider", sa.Unicode(length=20), nullable=False),
        sa.Column("success", sa.Boolean(), nullable=False),
        sa.Column("provider_message_id", sa.String(length=255), nullable=True),
        sa.Column("error_message", sa.UnicodeText(), nullable=True),
        sa.Column("sent_at", sa.DateTime(), server_default=sa.text("GETDATE()"), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("GETDATE()"), nullable=False),
        sa.CheckConstraint("channel IN ('EMAIL', 'SMS')", name="ck_notification_logs_channel"),
        sa.CheckConstraint("provider IN ('RESEND', 'TEXTBEE')", name="ck_notification_logs_provider"),
        sa.ForeignKeyConstraint(
            ["assignment_id"], ["assignments.id"], name="fk_notification_logs_assignment_id"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_notification_logs_assignment_id", "notification_logs", ["assignment_id"])
    op.create_index("ix_notification_logs_channel", "notification_logs", ["channel"])
    op.create_index("ix_notification_logs_success", "notification_logs", ["success"])


def downgrade() -> None:
    op.drop_index("ix_notification_logs_success", table_name="notification_logs")
    op.drop_index("ix_notification_logs_channel", table_name="notification_logs")
    op.drop_index("ix_notification_logs_assignment_id", table_name="notification_logs")
    op.drop_table("notification_logs")
