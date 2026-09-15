from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, time, timedelta
from typing import Any

from sqlalchemy.sql import Select

from app.models.case import Case


@dataclass(frozen=True)
class CaseQueryFilters:
    date_from: date | None = None
    date_to: date | None = None
    field_name: str | None = None
    department_name: str | None = None
    officer_id: int | None = None


def applyCaseFilters(
    statement: Select[Any],
    filters: CaseQueryFilters | None,
    dateColumn=Case.received_at,
) -> Select[Any]:
    if filters is None:
        return statement

    conditions = []
    if filters.date_from is not None:
        conditions.append(
            dateColumn >= datetime.combine(filters.date_from, time.min)
        )
    if filters.date_to is not None:
        exclusiveEnd = datetime.combine(filters.date_to, time.min) + timedelta(days=1)
        conditions.append(dateColumn < exclusiveEnd)
    if filters.field_name:
        conditions.append(Case.field_name == filters.field_name)
    if filters.department_name:
        conditions.append(Case.department_name == filters.department_name)
    if filters.officer_id is not None:
        conditions.append(Case.officer_id == filters.officer_id)

    return statement.where(*conditions) if conditions else statement
