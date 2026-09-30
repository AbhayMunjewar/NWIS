from fastapi import APIRouter, HTTPException, Query, Header
from typing import Dict, Any, Optional

from app.services.ml_service import ml_service
from app.core.security import decode_access_token


def get_current_user_payload(authorization: Optional[str] = Header(None)) -> Optional[Dict[str, Any]]:
    """Decode JWT from Authorization header. Returns claims dict or None."""
    if not authorization:
        return None
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    return decode_access_token(token)


router = APIRouter(tags=["ML / Analytics Engine"])

@router.get("/status")
def get_ml_registry_status(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Returns model registry status, trained versions, metrics, and health."""
    get_current_user_payload(authorization)
    return ml_service.get_model_registry_status()

@router.get("/similarity/{well_id}")
def get_well_similarity(well_id: str, authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Returns ranked similar historical wells with matched/unmatched factors & feature distances."""
    get_current_user_payload(authorization)
    return ml_service.get_well_similarity(well_id=well_id)

@router.post("/formation/predict")
def predict_formation(
    payload: Dict[str, Any],
    authorization: Optional[str] = Header(None)
) -> Dict[str, Any]:
    """Predicts geological formation using Random Forest model trained on GroupKFold log data."""
    get_current_user_payload(authorization)
    well_id = payload.get("well_id", "DUL_92")
    depth_m = payload.get("depth_m", 2210.0)
    log_values = payload.get("log_values", {})
    return ml_service.predict_formation(well_id=well_id, depth_m=depth_m, log_values=log_values)

@router.get("/anomalies/{well_id}")
def get_anomalies(
    well_id: str,
    depth_m: float = Query(2210.0, description="Current depth in meters"),
    authorization: Optional[str] = Header(None)
) -> Dict[str, Any]:
    """Returns Isolation Forest multivariate, torque, and ROP anomaly scores."""
    get_current_user_payload(authorization)
    return ml_service.get_anomalies(well_id=well_id, depth_m=depth_m)

@router.get("/early-warnings/{well_id}")
def get_early_warnings(well_id: str, authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Returns active Early Warnings with lead distance, observed signals, and historical evidence."""
    get_current_user_payload(authorization)
    return ml_service.get_early_warnings(well_id=well_id)

@router.get("/evaluation-report")
def get_evaluation_report(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Returns GroupKFold CV geological evaluation report and retrospective incident overlap analysis."""
    get_current_user_payload(authorization)
    return {
        "geology_evaluation": ml_service.geology_report,
        "anomaly_evaluation": ml_service.anomaly_report
    }
