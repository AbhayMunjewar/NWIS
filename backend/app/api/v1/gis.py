from fastapi import APIRouter, Depends, HTTPException, Header, Query
from typing import Optional, List
from app.core.security import decode_access_token
from app.services.gis_service import gis_service

router = APIRouter()

@router.get("/wells")
def get_nearby_wells(
    center_well_id: Optional[str] = Query("DUL_92", description="Global active or center well ID"),
    radius_km: Optional[float] = Query(50.0, description="Spatial search radius in kilometers"),
    field: Optional[str] = Query(None, description="Filter by oil field name"),
    formation: Optional[str] = Query(None, description="Filter by formation name"),
    status: Optional[str] = Query(None, description="Filter by well status"),
    hazard_type: Optional[str] = Query(None, description="Filter by historical hazard type"),
    min_depth: Optional[float] = Query(None, description="Minimum depth filter in meters"),
    max_depth: Optional[float] = Query(None, description="Maximum depth filter in meters"),
    authorization: Optional[str] = Header(None)
):
    """
    Returns spatial nearby wells within radius with geographic distances, formation overlaps,
    and historical hazard event counts for Dashboard 2. Enforces RBAC token verification.
    """
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        payload = decode_access_token(token)
        if not payload:
            raise HTTPException(status_code=401, detail="Session token expired or invalid")

    return gis_service.get_nearby_wells(
        center_well_id=center_well_id,
        radius_km=radius_km,
        field=field,
        formation=formation,
        status=status,
        hazard_type=hazard_type,
        min_depth=min_depth,
        max_depth=max_depth
    )

@router.get("/wells/{well_id}")
def get_well_details(
    well_id: str,
    center_well_id: Optional[str] = Query("DUL_92"),
    authorization: Optional[str] = Header(None)
):
    """
    Returns full details for a selected GIS well.
    """
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        payload = decode_access_token(token)
        if not payload:
            raise HTTPException(status_code=401, detail="Session token expired or invalid")

    return gis_service.get_well_details(well_id=well_id, center_well_id=center_well_id)

@router.get("/wells/{well_id}/trajectory")
def get_well_trajectory(
    well_id: str,
    max_points: Optional[int] = Query(100),
    authorization: Optional[str] = Header(None)
):
    """
    Returns trajectory survey points for a selected well.
    """
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        payload = decode_access_token(token)
        if not payload:
            raise HTTPException(status_code=401, detail="Session token expired or invalid")

    return gis_service.get_well_trajectory(well_id=well_id, max_points=max_points)
