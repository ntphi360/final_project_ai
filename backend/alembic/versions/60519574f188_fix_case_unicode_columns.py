from typing import Sequence, Union

from alembic import op
from sqlalchemy.dialects import mssql


revision: str = "60519574f188"
down_revision: Union[str, Sequence[str], None] = "b58ef2319bcd"
branch_labels = None
depends_on = None


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
        "status",
        existing_type=mssql.VARCHAR(length=100),
        type_=mssql.NVARCHAR(length=100),
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


def downgrade() -> None:
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
        "status",
        existing_type=mssql.NVARCHAR(length=100),
        type_=mssql.VARCHAR(length=100),
        existing_nullable=False,
    )

    op.alter_column(
        "cases",
        "procedure_name",
        existing_type=mssql.NVARCHAR(length=255),
        type_=mssql.VARCHAR(length=255),
        existing_nullable=False,
    )