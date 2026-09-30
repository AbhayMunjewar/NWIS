from fastapi import APIRouter
from datetime import datetime
from app.core.config import settings

router = APIRouter()

@router.get("/info")
def get_system_info():
    return {
        "system_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "demo_mode": settings.DEMO_MODE_ENABLED,
        "status": "OPERATIONAL_FOUNDATION",
        "server_time": datetime.utcnow()
    }
