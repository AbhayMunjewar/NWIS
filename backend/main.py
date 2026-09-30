from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import os

from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.api.v1 import auth, wells, system, operations, gis, live, risks, historical, assistant, reports, ml, workflow

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url="/api/v1/openapi.json"
)

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication & RBAC"])
app.include_router(wells.router, prefix="/api/v1/wells", tags=["Wells Context"])
app.include_router(operations.router, prefix="/api/v1/operations", tags=["Operations / Command"])
app.include_router(gis.router, prefix="/api/v1/gis", tags=["Nearby Wells / GIS"])
app.include_router(live.router, prefix="/api/v1/live", tags=["Live Drilling Telemetry"])
app.include_router(risks.router, prefix="/api/v1/risks", tags=["Risk & Alerts"])
app.include_router(historical.router, prefix="/api/v1/historical", tags=["Historical Wells & Events"])
app.include_router(assistant.router, prefix="/api/v1/assistant", tags=["AI Engineering Assistant"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["Reports & Export Workspace"])
app.include_router(ml.router, prefix="/api/v1/ml", tags=["ML / Analytics Engine"])
app.include_router(workflow.router, prefix="/api/v1/workflow", tags=["Operational Workflow"])
app.include_router(system.router, prefix="/api/v1/system", tags=["System Information"])

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "timestamp": datetime.utcnow().isoformat(),
        "database": "sqlite_connected"
    }

# Trigger uvicorn auto-reload for updated drilling events dataset
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


