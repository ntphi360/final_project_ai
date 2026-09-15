from pydantic import BaseModel


class AIExpertPredictions(BaseModel):
    PROC: float
    PRIOR: float
    CAT_RATIO: float
    XGB_LOG: float


class AIPredictionResponse(BaseModel):
    case_id: str
    predicted_processing_hours: float
    model_version: str
    experts: AIExpertPredictions | None = None
