from fastapi import FastAPI
from sqlalchemy import text

from app.database.database import engine

app = FastAPI(
    title="AI Case Monitoring API",
    version="1.0.0"
)


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