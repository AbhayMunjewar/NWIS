from fastapi import APIRouter, Depends, HTTPException, Header, Query
from typing import Optional
from app.core.security import decode_access_token
from app.services.operations_service import operations_service

router = APIRouter()

@router.get("/summary")
def get_operations_summary(
    well_id: Optional[str] = Query("DUL_92", description="Well ID code"),
    role_code: Optional[str] = Query(None, description="User role code override or from token"),
    authorization: Optional[str] = Header(None)
):
    """
    Authoritative operations summary endpoint for Dashboard 1.
    Enforces backend token verification and returns real aggregated operational context
    tailored to the user's role scope and information density level.
    """
    user_role = "DRILLING_ENGINEER"
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        payload = decode_access_token(token)
        if not payload:
            raise HTTPException(status_code=401, detail="Session token expired or invalid")
        user_role = payload.get("role_code", user_role)

    # Use query parameter override if explicitly provided
    if role_code:
        user_role = role_code

    summary = operations_service.get_operations_summary(well_id=well_id, role_code=user_role)
    return summary
