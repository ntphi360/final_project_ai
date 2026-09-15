from app.routers.ai import router as aiRouter
from app.routers.catalog import router as catalogRouter
from app.routers.case import router as caseRouter
from app.routers.dashboard import router as dashboardRouter
from app.routers.import_case import router as importCaseRouter
from app.routers.officer import router as officerRouter

__all__ = [
    "aiRouter",
    "caseRouter",
    "importCaseRouter",
    "catalogRouter",
    "officerRouter",
    "dashboardRouter",
]
