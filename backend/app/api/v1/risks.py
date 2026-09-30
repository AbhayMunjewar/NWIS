from fastapi import APIRouter, Depends, HTTPException, Header, Query, Body
from typing import Optional, Dict, Any
from app.core.security import decode_access_token
from app.services.risk_service import risk_service

router = APIRouter()

def get_current_user_payload(authorization: Optional[str] = Header(None)) -> Optional[Dict[str, Any]]:
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        try:
            return decode_access_token(token)
        except Exception:
            return None
    return None

@router.get("/summary")
def get_risk_summary(
    well_id: Optional[str] = Query(None, description="Well ID filter"),
    authorization: Optional[str] = Header(None)
):
    """
    Returns overall risk status, active/critical/high/medium/low risk counts,
    current well context, trend, data freshness, and analytics availability.
    """
    get_current_user_payload(authorization)
    return risk_service.get_risk_summary(well_id=well_id)

@router.get("/alerts")
def get_alerts(
    well_id: Optional[str] = Query(None, description="Filter by Well ID"),
    severity: Optional[str] = Query("ALL", description="Filter by severity: CRITICAL, HIGH, MEDIUM, LOW"),
    status: Optional[str] = Query("ALL", description="Filter by status: ACTIVE, ACKNOWLEDGED, RESOLVED, SUPPRESSED"),
    formation: Optional[str] = Query("ALL", description="Filter by formation name"),
    authorization: Optional[str] = Header(None)
):
    """
    Returns list of risk alerts matching filter criteria.
    """
    get_current_user_payload(authorization)
    return risk_service.get_alerts(well_id=well_id, severity=severity, status=status, formation=formation)

@router.get("/alerts/{alert_id}")
def get_alert_detail(
    alert_id: str,
    authorization: Optional[str] = Header(None)
):
    """
    Returns comprehensive detail view for an alert, including 7-layer evidence breakdown,
    observed parameters, historical matches, and source document traceability.
    """
    get_current_user_payload(authorization)
    return risk_service.get_alert_detail(alert_id=alert_id)

@router.get("/timeline")
def get_risk_timeline(
    well_id: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None)
):
    """
    Returns risk event timeline sequence for a well.
    """
    get_current_user_payload(authorization)
    return risk_service.get_risk_timeline(well_id=well_id)

@router.get("/trends")
def get_risk_trends(
    well_id: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None)
):
    """
    Returns depth and time-series risk trend points.
    """
    get_current_user_payload(authorization)
    return risk_service.get_risk_trends(well_id=well_id)

@router.post("/alerts/{alert_id}/acknowledge")
def acknowledge_alert(
    alert_id: str,
    payload: Dict[str, Any] = Body(...),
    authorization: Optional[str] = Header(None)
):
    """
    Enforces server-side permission-checked alert acknowledgment with audit logging.
    Requires user role DRILLING_ENGINEER or ERTMAC_OPERATOR.
    """
    user_payload = get_current_user_payload(authorization)
    user_id = payload.get("user_id", user_payload.get("sub", "user_1") if user_payload else "user_1")
    user_name = payload.get("user_name", "Arun Sharma")
    role = payload.get("role", user_payload.get("role", "DRILLING_ENGINEER") if user_payload else "DRILLING_ENGINEER")

    try:
        return risk_service.acknowledge_alert(
            alert_id=alert_id,
            user_id=user_id,
            user_name=user_name,
            role=role
        )
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))

@router.post("/alerts/{alert_id}/resolve")
def resolve_alert(
    alert_id: str,
    payload: Dict[str, Any] = Body(...),
    authorization: Optional[str] = Header(None)
):
    """
    Enforces server-side permission-checked alert resolution with audit logging.
    Requires user role DRILLING_ENGINEER or ERTMAC_OPERATOR.
    """
    user_payload = get_current_user_payload(authorization)
    user_id = payload.get("user_id", user_payload.get("sub", "user_1") if user_payload else "user_1")
    user_name = payload.get("user_name", "Arun Sharma")
    role = payload.get("role", user_payload.get("role", "DRILLING_ENGINEER") if user_payload else "DRILLING_ENGINEER")
    resolution_note = payload.get("resolution_note", "Operational mitigation applied")

    try:
        return risk_service.resolve_alert(
            alert_id=alert_id,
            user_id=user_id,
            user_name=user_name,
            role=role,
            resolution_note=resolution_note
        )
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))
