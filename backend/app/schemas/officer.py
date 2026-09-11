from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.field import FieldResponse


class OfficerResponse(BaseModel):
    id: int
    full_name: str
    phone_number: str | None
    email: str | None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class OfficerWithFieldsResponse(OfficerResponse):
    fields: list[FieldResponse]


class OfficerFieldAssignmentResponse(BaseModel):
    officer_id: int
    field_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
