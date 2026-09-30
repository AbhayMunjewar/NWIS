"""
Reports API endpoints for NWIS / eRTMAC Platform.
Provides routes for report catalog, data availability checks, report generation,
preview payloads, CSV/PDF file downloads, and report regeneration.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Header, Response
from pydantic import BaseModel
from typing import Optional, List, Any, Dict

from app.core.security import decode_access_token
from app.services.reports_service import (
    get_permitted_report_types,
    check_report_availability,
    generate_report,
    get_report_history,
    get_report_preview,
    generate_report_csv,
    generate_report_pdf_bytes
)

router = APIRouter()


def get_current_user_payload(authorization: Optional[str] = Header(None)) -> Optional[Dict[str, Any]]:
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        payload = decode_access_token(token)
        if not payload:
            raise HTTPException(status_code=401, detail="Session token expired or invalid")
        return payload
    return None


class ReportGenerateRequest(BaseModel):
    report_type: str
    well_id: str
    date_range: str = "Last 24 Hours"
    depth_start: Optional[float] = None
    depth_end: Optional[float] = None


@router.get("/types")
def list_report_types(authorization: Optional[str] = Header(None)):
    """Return permitted report catalog for current authenticated role."""
    user = get_current_user_payload(authorization)
    role = user.get("role_code", user.get("role", "DRILLING_ENGINEER")) if user else "DRILLING_ENGINEER"
    return get_permitted_report_types(role)


@router.get("/availability-check")
def check_availability(
    well_id: str = Query("DUL_92"),
    report_type: str = Query("DAILY_DRILLING"),
    date_range: str = Query("Last 24 Hours"),
    authorization: Optional[str] = Header(None)
):
    """Perform pre-check on data availability for selected well and report parameters."""
    get_current_user_payload(authorization)
    return check_report_availability(well_id, report_type, date_range)


@router.post("/generate")
def create_report(
    req: ReportGenerateRequest,
    authorization: Optional[str] = Header(None)
):
    """Generate a new report artifact and store preview metadata."""
    user = get_current_user_payload(authorization)
    user_name = user.get("display_name", "Authorized User") if user else "Authorized User"
    user_role = user.get("role_code", user.get("role", "DRILLING_ENGINEER")) if user else "DRILLING_ENGINEER"

    try:
        payload = generate_report(
            report_type=req.report_type,
            well_id=req.well_id,
            date_range=req.date_range,
            user_name=user_name,
            user_role=user_role,
            depth_start=req.depth_start,
            depth_end=req.depth_end
        )
        return payload
    except PermissionError as pe:
        raise HTTPException(status_code=403, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation error: {str(e)}")


@router.get("/history")
def list_history(authorization: Optional[str] = Header(None)):
    """Return report history authorized for current role."""
    user = get_current_user_payload(authorization)
    user_role = user.get("role_code", user.get("role", "DRILLING_ENGINEER")) if user else "DRILLING_ENGINEER"
    return get_report_history(user_role)


@router.get("/{report_id}/preview")
def preview_report(
    report_id: str,
    authorization: Optional[str] = Header(None)
):
    """Return complete structured report preview payload."""
    user = get_current_user_payload(authorization)
    user_role = user.get("role_code", user.get("role", "DRILLING_ENGINEER")) if user else "DRILLING_ENGINEER"
    try:
        return get_report_preview(report_id, user_role)
    except PermissionError as pe:
        raise HTTPException(status_code=403, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))


@router.get("/{report_id}/download")
def download_report(
    report_id: str,
    format: str = Query("pdf"),
    authorization: Optional[str] = Header(None)
):
    """Download generated report file in PDF format."""
    user = get_current_user_payload(authorization)
    user_role = user.get("role_code", user.get("role", "DRILLING_ENGINEER")) if user else "DRILLING_ENGINEER"
    try:
        if format.lower() == "csv":
            csv_content = generate_report_csv(report_id, user_role)
            return Response(
                content=csv_content,
                media_type="text/csv",
                headers={
                    "Content-Disposition": f"attachment; filename={report_id}.csv"
                }
            )
        else:
            # Generate authentic binary PDF document using ReportLab
            pdf_bytes = generate_report_pdf_bytes(report_id, user_role)
            return Response(
                content=pdf_bytes,
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f"attachment; filename={report_id}_Geological_Report.pdf"
                }
            )
    except PermissionError as pe:
        raise HTTPException(status_code=403, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))


@router.post("/{report_id}/regenerate")
def regenerate_report(
    report_id: str,
    authorization: Optional[str] = Header(None)
):
    """Regenerate report artifact with current data snapshot."""
    user = get_current_user_payload(authorization)
    user_name = user.get("display_name", "Authorized User") if user else "Authorized User"
    user_role = user.get("role_code", user.get("role", "DRILLING_ENGINEER")) if user else "DRILLING_ENGINEER"
    try:
        preview = get_report_preview(report_id, user_role)
        meta = preview["metadata"]
        new_payload = generate_report(
            report_type=meta["report_type"],
            well_id=meta["well_id"],
            date_range=meta["reporting_period"],
            user_name=user_name,
            user_role=user_role
        )
        return new_payload
    except PermissionError as pe:
        raise HTTPException(status_code=403, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))


# ==============================================================================
# END-TO-END WORKFLOW ENDPOINTS (PRE-DRILL, NEW SOLUTION, MANAGEMENT REVIEW)
# ==============================================================================

class PreDrillRequest(BaseModel):
    well_id: str
    target_formations: List[str]
    expected_hazards: List[str]
    offset_wells: List[str]
    recommended_baselines: Dict[str, Any]
    notes: str

class EngineeringSolutionRequest(BaseModel):
    well_id: str
    depth_m: float
    formation: str
    anomaly_type: str
    observed_parameters: str
    diagnosis: str
    proposed_solution: str
    action_taken: str
    outcome: str
    lessons_learned: str

@router.post("/predrill")
def submit_predrill_report(req: PreDrillRequest, authorization: Optional[str] = Header(None)):
    user = get_current_user_payload(authorization)
    geologist = user.get("display_name", "Lead Geologist") if user else "Lead Geologist"
    from app.services.reports_service import create_predrill_report
    return create_predrill_report(
        well_id=req.well_id,
        geologist=geologist,
        target_formations=req.target_formations,
        expected_hazards=req.expected_hazards,
        offset_wells=req.offset_wells,
        recommended_baselines=req.recommended_baselines,
        notes=req.notes
    )

@router.get("/predrill")
def list_predrill_reports(well_id: Optional[str] = None):
    from app.services.reports_service import get_predrill_reports
    return get_predrill_reports(well_id=well_id)

@router.post("/predrill/{predrill_id}/acknowledge")
def ack_predrill_report(predrill_id: str, authorization: Optional[str] = Header(None)):
    user = get_current_user_payload(authorization)
    engineer_name = user.get("display_name", "Senior Drilling Engineer") if user else "Senior Drilling Engineer"
    from app.services.reports_service import acknowledge_predrill_report
    try:
        return acknowledge_predrill_report(predrill_id, engineer_name)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))

@router.post("/engineering-solution")
def submit_engineering_solution(req: EngineeringSolutionRequest, authorization: Optional[str] = Header(None)):
    user = get_current_user_payload(authorization)
    engineer_name = user.get("display_name", "Drilling Engineer") if user else "Drilling Engineer"
    from app.services.reports_service import create_engineering_solution
    return create_engineering_solution(
        well_id=req.well_id,
        depth_m=req.depth_m,
        formation=req.formation,
        anomaly_type=req.anomaly_type,
        observed_parameters=req.observed_parameters,
        diagnosis=req.diagnosis,
        proposed_solution=req.proposed_solution,
        action_taken=req.action_taken,
        outcome=req.outcome,
        lessons_learned=req.lessons_learned,
        engineer_name=engineer_name
    )

class DailyDrillReportRequest(BaseModel):
    well_id: str
    operator_notes: str = ""
    shift_summary: str = "Day Shift"

@router.post("/daily-drill")
def submit_daily_drill_report(req: DailyDrillReportRequest, authorization: Optional[str] = Header(None)):
    """Operator generates a Daily Drilling Report — auto-stored in report history for Operator & Management."""
    user = get_current_user_payload(authorization)
    operator_name = user.get("display_name", "eRTMAC Operator") if user else "eRTMAC Operator"
    user_role = user.get("role_code", "ERTMAC_OPERATOR") if user else "ERTMAC_OPERATOR"

    try:
        payload = generate_report(
            report_type="DAILY_DRILLING",
            well_id=req.well_id,
            date_range="Last 24 Hours",
            user_name=operator_name,
            user_role=user_role
        )
        # Override metadata to tag as operator-generated
        if "metadata" in payload:
            payload["metadata"]["generated_by"] = f"{operator_name} (Operator)"
            payload["metadata"]["user_role"] = user_role
            payload["metadata"]["operator_notes"] = req.operator_notes
            payload["metadata"]["shift_summary"] = req.shift_summary
            payload["metadata"]["submission_source"] = "LIVE_DASHBOARD_OPERATOR"
        return payload
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Daily drill report generation error: {str(e)}")


@router.get("/pending-knowledge-queue")
def list_pending_knowledge_queue():
    from app.services.reports_service import get_pending_knowledge_queue
    return get_pending_knowledge_queue()

@router.post("/engineering-solution/{solution_id}/approve")
def approve_solution(solution_id: str, authorization: Optional[str] = Header(None)):
    user = get_current_user_payload(authorization)
    manager_name = user.get("display_name", "Operations Manager") if user else "Operations Manager"
    from app.services.reports_service import approve_knowledge_solution
    try:
        return approve_knowledge_solution(solution_id, manager_name)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))

