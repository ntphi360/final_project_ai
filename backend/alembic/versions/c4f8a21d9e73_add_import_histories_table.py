"""add import histories table

Revision ID: c4f8a21d9e73
Revises: 8a7d3c1e5f90
Create Date: 2026-09-13 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c4f8a21d9e73"
down_revision: Union[str, Sequence[str], None] = "8a7d3c1e5f90"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "import_histories",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("file_name", sa.Unicode(length=512), nullable=False),
        sa.Column("total_rows", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("created_rows", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("updated_rows", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("skipped_rows", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("error_rows", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("status", sa.Unicode(length=20), nullable=False),
        sa.Column(
            "imported_at",
            sa.DateTime(),
            server_default=sa.text("GETDATE()"),
            nullable=False,
        ),
        sa.Column("error_message", sa.UnicodeText(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("GETDATE()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "status IN ('SUCCESS', 'PARTIAL', 'FAILED')",
            name="ck_import_histories_status",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_import_histories_status", "import_histories", ["status"])
    op.create_index(
        "ix_import_histories_imported_at",
        "import_histories",
        ["imported_at"],
    )


def downgrade() -> None:
    op.drop_index("ix_import_histories_imported_at", table_name="import_histories")
    op.drop_index("ix_import_histories_status", table_name="import_histories")
    op.drop_table("import_histories")
