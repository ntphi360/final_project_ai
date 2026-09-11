from fastapi import FastAPI
from sqlalchemy import text

from app.database.database import engine
from app.routers.catalog import router as catalogRouter
from app.routers.case import router as caseRouter
from app.routers.import_case import router as importCaseRouter

app = FastAPI(
    title="AI Case Monitoring API",
    version="1.0.0"
)

app.include_router(caseRouter)
app.include_router(importCaseRouter)
app.include_router(catalogRouter)


@app.get("/")
def root():
    return {
        "message": "FastAPI đang hoạt động"
    }


@app.get("/api/database/test")
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
