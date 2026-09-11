"""convert case text columns to unicode

Revision ID: b58ef2319bcd
Revises: db6f0c28c9e3
Create Date: 2026-09-11 23:46:53.555570
"""

from typing import Sequence, Union

from alembic import op
from sqlalchemy.dialects import mssql


# revision identifiers, used by Alembic.
revision: str = "b58ef2319bcd"
down_revision: Union[str, Sequence[str], None] = "db6f0c28c9e3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "cases",
        "procedure_name",
        existing_type=mssql.VARCHAR(length=255),
        type_=mssql.NVARCHAR(length=255),
        existing_nullable=False,
    )

    op.alter_column(
        "cases",
        "field_name",
        existing_type=mssql.VARCHAR(length=255),
        type_=mssql.NVARCHAR(length=255),
        existing_nullable=False,
    )

    op.alter_column(
        "cases",
        "department_name",
        existing_type=mssql.VARCHAR(length=255),
        type_=mssql.NVARCHAR(length=255),
        existing_nullable=False,
    )

    op.alter_column(
        "cases",
        "agency_name",
        existing_type=mssql.VARCHAR(length=255),
        type_=mssql.NVARCHAR(length=255),
        existing_nullable=True,
    )

    op.alter_column(
        "cases",
        "applicant_name",
        existing_type=mssql.VARCHAR(length=255),
        type_=mssql.NVARCHAR(length=255),
        existing_nullable=True,
    )

    op.alter_column(
        "cases",
        "officer_name",
        existing_type=mssql.VARCHAR(length=255),
        type_=mssql.NVARCHAR(length=255),
        existing_nullable=True,
    )

    op.alter_column(
        "cases",
        "status",
        existing_type=mssql.VARCHAR(length=100),
        type_=mssql.NVARCHAR(length=100),
        existing_nullable=False,
    )


def downgrade() -> None:
    op.alter_column(
        "cases",
        "status",
        existing_type=mssql.NVARCHAR(length=100),
        type_=mssql.VARCHAR(length=100),
        existing_nullable=False,
    )

    op.alter_column(
        "cases",
        "officer_name",
        existing_type=mssql.NVARCHAR(length=255),
        type_=mssql.VARCHAR(length=255),
        existing_nullable=True,
    )

    op.alter_column(
        "cases",
        "applicant_name",
        existing_type=mssql.NVARCHAR(length=255),
        type_=mssql.VARCHAR(length=255),
        existing_nullable=True,
    )

    op.alter_column(
        "cases",
        "agency_name",
        existing_type=mssql.NVARCHAR(length=255),
        type_=mssql.VARCHAR(length=255),
        existing_nullable=True,
    )

    op.alter_column(
        "cases",
        "department_name",
        existing_type=mssql.NVARCHAR(length=255),
        type_=mssql.VARCHAR(length=255),
        existing_nullable=False,
    )

    op.alter_column(
        "cases",
        "field_name",
        existing_type=mssql.NVARCHAR(length=255),
        type_=mssql.VARCHAR(length=255),
        existing_nullable=False,
    )

    op.alter_column(
        "cases",
        "procedure_name",
        existing_type=mssql.NVARCHAR(length=255),
        type_=mssql.VARCHAR(length=255),
        existing_nullable=False,
    )