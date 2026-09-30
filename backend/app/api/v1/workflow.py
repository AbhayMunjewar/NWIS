"""
Workflow API endpoints for NWIS end-to-end operational workflow.
Manages the lifecycle:
  1. Geologist Pre-Drill Analysis → Report Generation
  2. Report Handoff to Drilling Engineer
  3. Drilling Engineer reviews & starts Live Drilling
  4. Operator Real-Time Monitoring → Anomaly Escalation
  5. Drilling Engineer → AI RAG Review
"""

from fastapi import APIRouter, Header, Query, Body, HTTPException
from typing import Optional, Dict, Any, List
from datetime import datetime
import uuid

from app.core.security import decode_access_token

router = APIRouter()

# -------------------------------------------------------------------
# In-memory workflow state store (per-well)
# -------------------------------------------------------------------
_workflow_state: Dict[str, Dict[str, Any]] = {}

def _get_or_init_state(well_id: str) -> Dict[str, Any]:
    if well_id not in _workflow_state:
        _workflow_state[well_id] = {
            "well_id": well_id,
            "phase": "PRE_DRILL",
            "pre_drill_report": None,
            "drilling_started": False,
            "monitoring_active": False,
            "escalated_alerts": [],
            "ai_reviews": [],
            "audit_log": [],
        }
    return _workflow_state[well_id]


def _log_audit(state: Dict, action: str, actor: str, role: str, details: str = ""):
    state["audit_log"].append({
        "id": f"AUD-{uuid.uuid4().hex[:8].upper()}",
        "action": action,
        "actor": actor,
        "role": role,
        "details": details,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    })


def _get_user(authorization: Optional[str]):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        payload = decode_access_token(token)
        if payload:
            return payload
    return {"sub": "demo_user", "role_code": "DRILLING_ENGINEER", "full_name": "Demo User"}


# -------------------------------------------------------------------
# 1. GET /workflow/state - Get current workflow state for a well
# -------------------------------------------------------------------
@router.get("/state")
def get_workflow_state(
    well_id: str = Query("DUL_92"),
    authorization: Optional[str] = Header(None)
):
    _get_user(authorization)
    state = _get_or_init_state(well_id)
    return state


# -------------------------------------------------------------------
# 2. POST /workflow/pre-drill-report - Geologist submits pre-drill report
# -------------------------------------------------------------------
@router.post("/pre-drill-report")
def submit_pre_drill_report(
    payload: Dict[str, Any] = Body(...),
    authorization: Optional[str] = Header(None)
):
    user = _get_user(authorization)
    role = user.get("role_code", payload.get("role", "GEOLOGIST"))
    well_id = payload.get("well_id", "DUL_92")

    state = _get_or_init_state(well_id)

    report = {
        "report_id": f"PDR-{uuid.uuid4().hex[:8].upper()}",
        "well_id": well_id,
        "generated_by": user.get("full_name", payload.get("author", "Geologist")),
        "role": role,
        "title": payload.get("title", "Pre-Drill Analysis Report"),
        "summary": payload.get("summary", "Comprehensive pre-drill geological analysis"),
        "target_well": payload.get("target_well", well_id),
        "offset_wells_analyzed": payload.get("offset_wells", ["DUL_88", "DUL_99", "NHK_45"]),
        "formations_reviewed": payload.get("formations", [
            "Tipam Sandstone", "Surma Group", "Barail Group", "Kopili Formation"
        ]),
        "identified_hazards": payload.get("hazards", [
            {
                "hazard_type": "Stuck Pipe",
                "formation": "Barail Group",
                "depth_range": "1800m - 2500m",
                "severity": "HIGH",
                "description": "Reactive Smectite/Illite shale — high swelling potential. Historical stuck pipe at 2,210m in DUL-92.",
                "recommended_monitoring": ["Torque", "ROP", "SPP", "ECD"]
            },
            {
                "hazard_type": "Gas Kick",
                "formation": "Kopili Formation",
                "depth_range": "2500m - 3000m",
                "severity": "CRITICAL",
                "description": "Overpressured marine shale with gas influx history. SICP 350 psi recorded in DUL-88.",
                "recommended_monitoring": ["Mud Weight", "Flow Out", "Pit Volume", "Gas Units"]
            }
        ]),
        "monitoring_parameters": payload.get("parameters", [
            "Rotational Torque (kN·m)", "Rate of Penetration (m/hr)", "Standpipe Pressure (psi)",
            "Weight on Bit (kN)", "Mud Weight (g/cc)", "Flow Rate In/Out (LPM)",
            "Hook Load (kN)", "Gas Units (ppm)"
        ]),
        "recommendations": payload.get("recommendations", [
            "Maintain mud weight ≥ 1.22 g/cc through Barail interval",
            "Monitor torque trend — alert threshold at +30% from baseline",
            "Prepare 50 bbl Glycol spotting pill as contingency",
            "Run wiper trips every 150m through reactive shale interval",
            "Increase flow rate monitoring sensitivity through Kopili zone"
        ]),
        "status": "SUBMITTED",
        "recipient_role": "DRILLING_ENGINEER",
        "submitted_at": datetime.utcnow().isoformat() + "Z",
        "reviewed_by": None,
        "reviewed_at": None,
    }

    state["pre_drill_report"] = report
    state["phase"] = "REPORT_SUBMITTED"
    _log_audit(state, "PRE_DRILL_REPORT_SUBMITTED", report["generated_by"], role,
               f"Pre-Drill Analysis Report {report['report_id']} submitted for {well_id}")

    return {"status": "success", "report": report}


# -------------------------------------------------------------------
# 3. POST /workflow/review-report - Drilling Engineer reviews & signs off
# -------------------------------------------------------------------
@router.post("/review-report")
def review_pre_drill_report(
    payload: Dict[str, Any] = Body(...),
    authorization: Optional[str] = Header(None)
):
    user = _get_user(authorization)
    role = user.get("role_code", payload.get("role", "DRILLING_ENGINEER"))
    well_id = payload.get("well_id", "DUL_92")
    action = payload.get("action", "APPROVE")  # APPROVE or REQUEST_REVISION

    state = _get_or_init_state(well_id)

    if not state["pre_drill_report"]:
        raise HTTPException(status_code=400, detail="No pre-drill report to review")

    state["pre_drill_report"]["reviewed_by"] = user.get("full_name", "Drilling Engineer")
    state["pre_drill_report"]["reviewed_at"] = datetime.utcnow().isoformat() + "Z"
    state["pre_drill_report"]["review_notes"] = payload.get("notes", "")

    if action == "APPROVE":
        state["pre_drill_report"]["status"] = "APPROVED"
        state["phase"] = "REPORT_APPROVED"
        _log_audit(state, "PRE_DRILL_REPORT_APPROVED", state["pre_drill_report"]["reviewed_by"], role,
                   f"Report approved — drilling operations can begin for {well_id}")
    else:
        state["pre_drill_report"]["status"] = "REVISION_REQUESTED"
        state["phase"] = "REVISION_REQUESTED"
        _log_audit(state, "REVISION_REQUESTED", state["pre_drill_report"]["reviewed_by"], role,
                   payload.get("notes", "Revision requested"))

    return {"status": "success", "report": state["pre_drill_report"], "phase": state["phase"]}


# -------------------------------------------------------------------
# 4. POST /workflow/start-drilling - Drilling Engineer starts live drilling
# -------------------------------------------------------------------
@router.post("/start-drilling")
def start_drilling(
    payload: Dict[str, Any] = Body(...),
    authorization: Optional[str] = Header(None)
):
    user = _get_user(authorization)
    role = user.get("role_code", payload.get("role", "DRILLING_ENGINEER"))
    well_id = payload.get("well_id", "DUL_92")

    state = _get_or_init_state(well_id)

    if state["phase"] not in ("REPORT_APPROVED", "DRILLING_ACTIVE", "MONITORING_ACTIVE"):
        raise HTTPException(status_code=400, detail="Pre-drill report must be approved before starting drilling")

    state["drilling_started"] = True
    state["monitoring_active"] = True
    state["phase"] = "DRILLING_ACTIVE"
    state["drilling_started_at"] = datetime.utcnow().isoformat() + "Z"
    state["drilling_started_by"] = user.get("full_name", "Drilling Engineer")

    _log_audit(state, "DRILLING_STARTED", state["drilling_started_by"], role,
               f"Live drilling started for {well_id} — real-time monitoring engaged")

    return {"status": "success", "phase": state["phase"], "well_id": well_id}


# -------------------------------------------------------------------
# 5. POST /workflow/escalate-alert - Operator escalates anomaly to DE
# -------------------------------------------------------------------
@router.post("/escalate-alert")
def escalate_alert(
    payload: Dict[str, Any] = Body(...),
    authorization: Optional[str] = Header(None)
):
    user = _get_user(authorization)
    role = user.get("role_code", payload.get("role", "ERTMAC_OPERATOR"))
    well_id = payload.get("well_id", "DUL_92")

    state = _get_or_init_state(well_id)

    escalation = {
        "escalation_id": f"ESC-{uuid.uuid4().hex[:8].upper()}",
        "alert_id": payload.get("alert_id", "ALT-INC-DUL92-01"),
        "alert_type": payload.get("alert_type", "Anomaly Detected"),
        "severity": payload.get("severity", "HIGH"),
        "description": payload.get("description", "Anomaly detected in real-time monitoring"),
        "observed_values": payload.get("observed_values", {}),
        "escalated_by": user.get("full_name", "eRTMAC Operator"),
        "escalated_to": "DRILLING_ENGINEER",
        "escalated_at": datetime.utcnow().isoformat() + "Z",
        "status": "PENDING_REVIEW",
        "de_reviewed": False,
        "ai_reviewed": False,
        "message_read": False,
        "read_at": None,
        "de_acknowledged": False,
    }

    state["escalated_alerts"].append(escalation)
    state["phase"] = "ALERT_ESCALATED"
    _log_audit(state, "ALERT_ESCALATED", escalation["escalated_by"], role,
               f"Alert {escalation['alert_id']} escalated to Drilling Engineer — {escalation['description']}")

    return {"status": "success", "escalation": escalation}


# -------------------------------------------------------------------
# 6. POST /workflow/ai-review - DE sends risk to AI RAG for review
# -------------------------------------------------------------------
@router.post("/ai-review")
def submit_ai_review(
    payload: Dict[str, Any] = Body(...),
    authorization: Optional[str] = Header(None)
):
    user = _get_user(authorization)
    role = user.get("role_code", payload.get("role", "DRILLING_ENGINEER"))
    well_id = payload.get("well_id", "DUL_92")
    escalation_id = payload.get("escalation_id", "")

    state = _get_or_init_state(well_id)

    # Mark the escalation as DE-reviewed
    for esc in state["escalated_alerts"]:
        if esc["escalation_id"] == escalation_id:
            esc["de_reviewed"] = True
            esc["ai_reviewed"] = True
            esc["status"] = "AI_REVIEW_REQUESTED"
            break

    review = {
        "review_id": f"AIR-{uuid.uuid4().hex[:8].upper()}",
        "escalation_id": escalation_id,
        "well_id": well_id,
        "query": payload.get("query", "Analyze this risk alert with historical evidence"),
        "submitted_by": user.get("full_name", "Drilling Engineer"),
        "submitted_at": datetime.utcnow().isoformat() + "Z",
        "status": "SUBMITTED_TO_AI",
    }

    state["ai_reviews"].append(review)
    _log_audit(state, "AI_REVIEW_REQUESTED", review["submitted_by"], role,
               f"Risk escalation {escalation_id} forwarded to AI RAG for evidence-based analysis")

    return {"status": "success", "review": review}


# -------------------------------------------------------------------
# 7. GET /workflow/pending-escalations - DE polls for new unread alerts
# -------------------------------------------------------------------
@router.get("/pending-escalations")
def get_pending_escalations(
    well_id: str = Query("DUL_92"),
    authorization: Optional[str] = Header(None)
):
    _get_user(authorization)
    state = _get_or_init_state(well_id)
    pending = [e for e in state["escalated_alerts"] if not e.get("message_read", False)]
    return {
        "well_id": well_id,
        "pending_count": len(pending),
        "escalations": pending,
    }


# -------------------------------------------------------------------
# 8. POST /workflow/acknowledge-escalation - DE acknowledges an alert
# -------------------------------------------------------------------
@router.post("/acknowledge-escalation")
def acknowledge_escalation(
    payload: Dict[str, Any] = Body(...),
    authorization: Optional[str] = Header(None)
):
    user = _get_user(authorization)
    role = user.get("role_code", "DRILLING_ENGINEER")
    well_id = payload.get("well_id", "DUL_92")
    escalation_id = payload.get("escalation_id", "")

    state = _get_or_init_state(well_id)

    for esc in state["escalated_alerts"]:
        if esc["escalation_id"] == escalation_id:
            esc["message_read"] = True
            esc["read_at"] = datetime.utcnow().isoformat() + "Z"
            esc["de_acknowledged"] = True
            esc["status"] = "ACKNOWLEDGED_BY_DE"
            break
    else:
        raise HTTPException(status_code=404, detail=f"Escalation {escalation_id} not found")

    _log_audit(state, "ESCALATION_ACKNOWLEDGED", user.get("full_name", "Drilling Engineer"), role,
               f"Escalation {escalation_id} acknowledged by Drilling Engineer")

    return {"status": "success", "escalation_id": escalation_id}


# -------------------------------------------------------------------
# 9. GET /workflow/audit-log - Full workflow audit trail
# -------------------------------------------------------------------
@router.get("/audit-log")
def get_audit_log(
    well_id: str = Query("DUL_92"),
    authorization: Optional[str] = Header(None)
):
    _get_user(authorization)
    state = _get_or_init_state(well_id)
    return state["audit_log"]
