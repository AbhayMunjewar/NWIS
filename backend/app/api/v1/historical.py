import os
from fastapi import APIRouter, Depends, HTTPException, Header, Query
from fastapi.responses import FileResponse
from typing import Optional, Dict, Any
from app.core.security import decode_access_token
from app.services.historical_service import historical_service

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
def get_historical_summary(
    field: Optional[str] = Query(None, description="Field name filter"),
    authorization: Optional[str] = Header(None)
):
    """
    Returns high-level summary of historical wells, total events, fields count, and data freshness.
    """
    get_current_user_payload(authorization)
    return historical_service.get_historical_summary(field=field)

@router.get("/wells")
def get_historical_wells(
    search: Optional[str] = Query(None, description="Search term for well ID, name or field"),
    field: Optional[str] = Query("ALL", description="Filter by field"),
    status: Optional[str] = Query("ALL", description="Filter by status"),
    formation: Optional[str] = Query("ALL", description="Filter by target formation"),
    authorization: Optional[str] = Header(None)
):
    """
    Returns list of historical wells matching query filters.
    """
    get_current_user_payload(authorization)
    return historical_service.get_historical_wells(search=search, field=field, status=status, formation=formation)

@router.get("/wells/{well_id}")
def get_well_detail(
    well_id: str,
    authorization: Optional[str] = Header(None)
):
    """
    Returns comprehensive historical well detail, including formations, events, casing, mud program, and verified original PDF documents.
    """
    get_current_user_payload(authorization)
    return historical_service.get_well_detail(well_id=well_id)

@router.get("/wells/{well_id}/formations")
def get_well_formations(
    well_id: str,
    authorization: Optional[str] = Header(None)
):
    """
    Returns formation stratigraphy intervals for a historical well.
    """
    get_current_user_payload(authorization)
    detail = historical_service.get_well_detail(well_id=well_id)
    return detail.get("formations", [])

@router.get("/wells/{well_id}/logs")
def get_well_logs(
    well_id: str,
    authorization: Optional[str] = Header(None)
):
    """
    Returns depth-indexed well log curves (GR, RES, RHOB, NPHI, DTC).
    """
    get_current_user_payload(authorization)
    return historical_service.get_well_logs(well_id=well_id)

@router.get("/wells/{well_id}/trajectory")
def get_well_trajectory(
    well_id: str,
    authorization: Optional[str] = Header(None)
):
    """
    Returns survey trajectory points (MD, TVD, inclination, azimuth, Easting, Northing).
    """
    get_current_user_payload(authorization)
    return historical_service.get_well_trajectory(well_id=well_id)

@router.get("/events")
def get_events(
    well_id: Optional[str] = Query(None),
    event_type: Optional[str] = Query("ALL"),
    severity: Optional[str] = Query("ALL"),
    authorization: Optional[str] = Header(None)
):
    """
    Returns list of historical drilling incidents.
    """
    get_current_user_payload(authorization)
    return historical_service.get_events(well_id=well_id, event_type=event_type, severity=severity)

@router.get("/comparison")
def get_historical_comparison(
    current_well_id: str = Query("DUL_99"),
    historical_well_id: str = Query("DUL_92"),
    authorization: Optional[str] = Header(None)
):
    """
    Returns evidence-based side-by-side comparison of Current Well vs Historical Well.
    """
    get_current_user_payload(authorization)
    return historical_service.get_historical_comparison(
        current_well_id=current_well_id,
        historical_well_id=historical_well_id
    )

@router.get("/documents")
def get_documents(
    well_id: Optional[str] = Query(None, description="Filter by Well ID"),
    doc_type: Optional[str] = Query(None, description="Filter by document type"),
    search: Optional[str] = Query(None, description="Search query"),
    authorization: Optional[str] = Header(None)
):
    """
    Returns list of verified original historical documents in repository.
    """
    get_current_user_payload(authorization)
    return historical_service.get_documents(well_id=well_id, doc_type=doc_type, search=search)

@router.get("/documents/{doc_id}")
def get_document_detail(
    doc_id: str,
    authorization: Optional[str] = Header(None)
):
    """
    Returns metadata for a specific historical document.
    """
    get_current_user_payload(authorization)
    try:
        return historical_service.get_document_detail(doc_id=doc_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/documents/{doc_id}/file")
def stream_document_file(
    doc_id: str,
    authorization: Optional[str] = Header(None)
):
    """
    Streams the original verified PDF document file directly to browser PDF viewer.
    """
    get_current_user_payload(authorization)
    file_path = historical_service.get_document_file_path(doc_id=doc_id)
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"PDF document for {doc_id} not found on disk.")
    
    file_name = os.path.basename(file_path)
    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=file_name,
        content_disposition_type="inline"
    )


# =============================================================================
# PRE-DRILL ANALYSIS — 3 Research Track Endpoints
# =============================================================================

@router.get("/wells/{well_id}/nearby")
def get_nearby_wells(
    well_id: str,
    radius_km: float = Query(5.0, description="Search radius in km"),
    authorization: Optional[str] = Header(None)
):
    """
    Track 1 — GIS Nearby Wells: Returns offset wells within radius of target well
    with Haversine distance, bearing, and event counts.
    """
    get_current_user_payload(authorization)
    return historical_service.get_nearby_wells(well_id=well_id, radius_km=radius_km)


@router.get("/wells/{well_id}/predrill-events")
def get_predrill_events(
    well_id: str,
    radius_km: float = Query(5.0, description="Search radius for offset wells in km"),
    authorization: Optional[str] = Header(None)
):
    """
    Track 2 — Historical Wells: Returns aggregated drilling incidents from target
    and offset wells with NPT, cost, severity breakdown, and linked documents.
    """
    get_current_user_payload(authorization)
    return historical_service.get_predrill_events(well_id=well_id, radius_km=radius_km)


@router.get("/wells/{well_id}/geological-data")
def get_geological_data(
    well_id: str,
    authorization: Optional[str] = Header(None)
):
    """
    Track 3 — Geological Data: Returns formation stratigraphy with hazard flags,
    mud program, casing records, and formation correlation across offset wells.
    """
    get_current_user_payload(authorization)
    return historical_service.get_geological_data(well_id=well_id)

