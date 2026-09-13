"""add users table

Revision ID: f1a9c73e2b64
Revises: c4f8a21d9e73
Create Date: 2026-09-13 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f1a9c73e2b64"
down_revision: Union[str, Sequence[str], None] = "c4f8a21d9e73"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("full_name", sa.Unicode(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("phone_number", sa.String(length=20), nullable=True),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("role", sa.Unicode(length=20), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("1"), nullable=False),
        sa.Column("officer_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("GETDATE()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("GETDATE()"), nullable=False),
        sa.CheckConstraint(
            "role IN ('ADMIN', 'SUPERVISOR', 'OFFICER', 'VIEWER')",
            name="ck_users_role",
        ),
        sa.ForeignKeyConstraint(["officer_id"], ["officers.id"], name="fk_users_officer_id"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email", name="uq_users_email"),
    )
    op.create_index("ix_users_role", "users", ["role"], unique=False)
    op.create_index("ix_users_is_active", "users", ["is_active"], unique=False)
    op.create_index(
        "uq_users_officer_id",
        "users",
        ["officer_id"],
        unique=True,
        mssql_where=sa.text("officer_id IS NOT NULL"),
    )


def downgrade() -> None:
    op.drop_index("uq_users_officer_id", table_name="users")
    op.drop_index("ix_users_is_active", table_name="users")
    op.drop_index("ix_users_role", table_name="users")
    op.drop_table("users")
