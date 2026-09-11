from pydantic import BaseModel, ConfigDict


class ProcedureResponse(BaseModel):
    id: int
    name: str
    field_id: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
