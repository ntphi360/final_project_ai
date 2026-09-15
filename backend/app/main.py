from fastapi import Depends, FastAPI
from sqlalchemy import text
from starlette.middleware.cors import CORSMiddleware

from app.database.database import engine
from app.auth_dependencies import requireRoles
from app.routers.auth import router as authRouter
from app.routers.ai import router as aiRouter
from app.routers.assignment import router as assignmentRouter
from app.routers.catalog import router as catalogRouter
from app.routers.case import router as caseRouter
from app.routers.dashboard import router as dashboardRouter
from app.routers.import_case import router as importCaseRouter
from app.routers.officer import router as officerRouter
from app.routers.user import router as userRouter

app = FastAPI(
    title="Case Monitoring API",
    version="1.0.0"
)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



app.include_router(authRouter)
app.include_router(userRouter)
app.include_router(caseRouter)
app.include_router(aiRouter)
app.include_router(importCaseRouter)
app.include_router(catalogRouter)
app.include_router(officerRouter)
app.include_router(dashboardRouter)
app.include_router(assignmentRouter)


@app.get("/")
def root():
    return {
        "message": "FastAPI đang hoạt động"
    }


@app.get("/api/database/test", dependencies=[Depends(requireRoles("ADMIN"))])
def testDatabase():
    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT DB_NAME()")
        )

        databaseName = result.scalar()

    return {
        "status": "success",
        "database": databaseName
    }
