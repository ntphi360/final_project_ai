"""add assignments table

Revision ID: 8a7d3c1e5f90
Revises: 608303ca76c0
Create Date: 2026-09-13 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "8a7d3c1e5f90"
down_revision: Union[str, Sequence[str], None] = "608303ca76c0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "assignments",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("case_id", sa.Integer(), nullable=False),
        sa.Column("assigner_id", sa.Integer(), nullable=False),
        sa.Column("assignee_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.Unicode(length=255), nullable=False),
        sa.Column("content", sa.UnicodeText(), nullable=False),
        sa.Column(
            "status",
            sa.Unicode(length=20),
            server_default=sa.text("N'PENDING'"),
            nullable=False,
        ),
        sa.Column(
            "send_email",
            sa.Boolean(),
            server_default=sa.text("0"),
            nullable=False,
        ),
        sa.Column(
            "send_sms",
            sa.Boolean(),
            server_default=sa.text("0"),
            nullable=False,
        ),
        sa.Column(
            "assigned_at",
            sa.DateTime(),
            server_default=sa.text("GETDATE()"),
            nullable=False,
        ),
        sa.Column("accepted_at", sa.DateTime(), nullable=True),
        sa.Column("rejected_at", sa.DateTime(), nullable=True),
        sa.Column("rejection_reason", sa.UnicodeText(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("GETDATE()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            server_default=sa.text("GETDATE()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "status IN ('PENDING', 'ACCEPTED', 'REJECTED')",
            name="ck_assignments_status",
        ),
        sa.ForeignKeyConstraint(
            ["case_id"],
            ["cases.id"],
            name="fk_assignments_case_id",
        ),
        sa.ForeignKeyConstraint(
            ["assigner_id"],
            ["officers.id"],
            name="fk_assignments_assigner_id",
        ),
        sa.ForeignKeyConstraint(
            ["assignee_id"],
            ["officers.id"],
            name="fk_assignments_assignee_id",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_assignments_case_id", "assignments", ["case_id"])
    op.create_index("ix_assignments_assigner_id", "assignments", ["assigner_id"])
    op.create_index("ix_assignments_assignee_id", "assignments", ["assignee_id"])
    op.create_index("ix_assignments_status", "assignments", ["status"])
    op.create_index("ix_assignments_assigned_at", "assignments", ["assigned_at"])
    op.create_index(
        "uq_assignments_pending_case_assignee",
        "assignments",
        ["case_id", "assignee_id"],
        unique=True,
        mssql_where=sa.text("status = N'PENDING'"),
    )


def downgrade() -> None:
    op.drop_index(
        "uq_assignments_pending_case_assignee",
        table_name="assignments",
    )
    op.drop_index("ix_assignments_assigned_at", table_name="assignments")
    op.drop_index("ix_assignments_status", table_name="assignments")
    op.drop_index("ix_assignments_assignee_id", table_name="assignments")
    op.drop_index("ix_assignments_assigner_id", table_name="assignments")
    op.drop_index("ix_assignments_case_id", table_name="assignments")
    op.drop_table("assignments")
