from fastapi import FastAPI

from app.api.health import router as healthRouter

app = FastAPI(
    title="AI Case Monitoring API",
    version="1.0.0"
)

app.include_router(
    healthRouter,
    prefix="/api",
    tags=["Health"]
)


@app.get("/")
def root():
    return {
        "message": "AI Case Monitoring API is running"
    }