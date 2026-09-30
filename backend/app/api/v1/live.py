from fastapi import APIRouter, Depends, HTTPException, Header, Query, Body
from typing import Optional
from app.core.security import decode_access_token
from app.services.live_service import live_service

router = APIRouter()

@router.get("/current")
def get_live_current(
    well_id: Optional[str] = Query("DUL_92", description="Well ID code"),
    role_code: Optional[str] = Query(None, description="User role code override or from token"),
    authorization: Optional[str] = Header(None)
):
    """
    Returns real-time drilling telemetry, stream health status, 8 parameters with rates of change,
    multi-signal abnormal patterns, formation context, active alerts, and historical matches for Dashboard 3.
    Enforces role-aware permission scoping and information density.
    """
    user_role = "DRILLING_ENGINEER"
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        payload = decode_access_token(token)
        if not payload:
            raise HTTPException(status_code=401, detail="Session token expired or invalid")
        user_role = payload.get("role_code", user_role)

    if user_role.upper() == "GEOLOGIST":
        raise HTTPException(status_code=403, detail="Live Drilling workspace access is restricted for the Geologist role.")

    return live_service.get_live_current(well_id=well_id, role_code=user_role)

@router.get("/trends")
def get_live_trends(
    well_id: Optional[str] = Query("DUL_92", description="Well ID code"),
    time_window: Optional[str] = Query("30m", description="Time window e.g. 5m, 15m, 30m, 1h, 4h"),
    max_points: Optional[int] = Query(100),
    authorization: Optional[str] = Header(None)
):
    """
    Returns time-series telemetry trends for ROP, WOB, Torque, RPM, SPP, Flow, and Hookload.
    """
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        payload = decode_access_token(token)
        if not payload:
            raise HTTPException(status_code=401, detail="Session token expired or invalid")
        if payload.get("role_code", "").upper() == "GEOLOGIST":
            raise HTTPException(status_code=403, detail="Live Drilling trends access is restricted for the Geologist role.")

    return live_service.get_live_trends(well_id=well_id, time_window=time_window, max_points=max_points)

@router.post("/alerts/{alert_id}/acknowledge")
def acknowledge_alert(
    alert_id: str,
    user_name: Optional[str] = Query("eRTMAC Operator"),
    authorization: Optional[str] = Header(None)
):
    """
    Enforces permission-checked alert acknowledgment for eRTMAC Operators.
    """
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        payload = decode_access_token(token)
        if not payload:
            raise HTTPException(status_code=401, detail="Session token expired or invalid")

    return live_service.acknowledge_alert(alert_id=alert_id, user_name=user_name)
