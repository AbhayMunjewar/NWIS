from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.core.security import create_access_token, decode_access_token
from app.schemas.auth import LoginRequest, TokenResponse, UserResponse
from app.models.user import User, Role, RoleDashboardPermission, AuditLog, RoleActionPermission

router = APIRouter()

ROLE_DISPLAY_NAMES = {
    "DRILLING_ENGINEER": "Drilling Engineer",
    "GEOLOGIST": "Geologist",
    "ERTMAC_OPERATOR": "eRTMAC Operator",
    "MANAGEMENT_SUPERVISOR": "Management / Supervisor"
}

ROLE_DEFAULT_LANDING = {
    "DRILLING_ENGINEER": "/dashboard",
    "GEOLOGIST": "/dashboard",
    "ERTMAC_OPERATOR": "/live",
    "MANAGEMENT_SUPERVISOR": "/dashboard"
}

DEFAULT_RBAC_MATRIX = {
    "DRILLING_ENGINEER": {
        "dashboard": "FULL",
        "map": "FULL",
        "live": "FULL",
        "alerts": "FULL",
        "historical": "FULL",
        "assistant": "FULL",
        "reports": "FULL"
    },
    "GEOLOGIST": {
        "dashboard": "FULL",
        "map": "NONE",
        "live": "NONE",
        "alerts": "NONE",
        "historical": "NONE",
        "assistant": "FULL",
        "reports": "FULL"
    },
    "ERTMAC_OPERATOR": {
        "dashboard": "FULL",
        "map": "USE",
        "live": "FULL",
        "alerts": "FULL",
        "historical": "NONE",
        "assistant": "USE",
        "reports": "USE"
    },
    "MANAGEMENT_SUPERVISOR": {
        "dashboard": "FULL",
        "map": "VIEW",
        "live": "NONE",
        "alerts": "NONE",
        "historical": "VIEW",
        "assistant": "USE",
        "reports": "FULL"
    }
}

DEFAULT_ACTION_PERMISSIONS = {
    "DRILLING_ENGINEER": ["VIEW_RISK", "INVESTIGATE_RISK", "ACKNOWLEDGE_ALERT", "ESCALATE_ALERT", "ADD_ENGINEERING_NOTE", "EXPORT_REPORT"],
    "GEOLOGIST": ["VIEW_RISK", "INVESTIGATE_RISK", "ADD_GEOLOGICAL_NOTE", "VIEW_HISTORICAL_EVENT", "EXPORT_REPORT"],
    "ERTMAC_OPERATOR": ["VIEW_RISK", "ACKNOWLEDGE_ALERT", "ESCALATE_ALERT", "UPDATE_INVESTIGATION"],
    "MANAGEMENT_SUPERVISOR": ["VIEW_RISK", "VIEW_HISTORICAL_EVENT", "EXPORT_REPORT"]
}

DEMO_USERS = {
    "DRILLING_ENGINEER": {
        "id": 1,
        "username": "drilling_eng_demo",
        "full_name": "Senior Drilling Engineer (Demo)",
        "email": "drilling.eng@nwis.internal",
        "role_code": "DRILLING_ENGINEER"
    },
    "GEOLOGIST": {
        "id": 2,
        "username": "geologist_demo",
        "full_name": "Lead Operations Geologist (Demo)",
        "email": "geologist@nwis.internal",
        "role_code": "GEOLOGIST"
    },
    "ERTMAC_OPERATOR": {
        "id": 3,
        "username": "ertmac_operator_demo",
        "full_name": "eRTMAC System Operator (Demo)",
        "email": "ertmac.op@nwis.internal",
        "role_code": "ERTMAC_OPERATOR"
    },
    "MANAGEMENT_SUPERVISOR": {
        "id": 4,
        "username": "management_demo",
        "full_name": "Drilling Operations Manager (Demo)",
        "email": "manager@nwis.internal",
        "role_code": "MANAGEMENT_SUPERVISOR"
    }
}

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    role_code = request.role_code or "DRILLING_ENGINEER"
    
    # Standardize role code
    role_code = role_code.upper()
    if role_code not in ROLE_DISPLAY_NAMES:
        raise HTTPException(status_code=400, detail=f"Invalid role code. Must be one of {list(ROLE_DISPLAY_NAMES.keys())}")

    user_info = DEMO_USERS.get(role_code)
    
    # Audit log entry
    log_entry = AuditLog(
        username=user_info["username"],
        role_code=role_code,
        action="LOGIN",
        resource="/api/v1/auth/login",
        details="Successful demo authentication"
    )
    db.add(log_entry)
    db.commit()

    token = create_access_token(subject=user_info["username"], role=role_code)

    user_resp = UserResponse(
        id=user_info["id"],
        username=user_info["username"],
        full_name=user_info["full_name"],
        email=user_info["email"],
        role_code=role_code,
        role_display_name=ROLE_DISPLAY_NAMES[role_code],
        default_landing_page=ROLE_DEFAULT_LANDING[role_code],
        dashboard_permissions=DEFAULT_RBAC_MATRIX[role_code],
        action_permissions=DEFAULT_ACTION_PERMISSIONS[role_code],
        is_demo_account=True
    )

    return TokenResponse(access_token=token, token_type="bearer", user=user_resp)

@router.get("/me", response_model=UserResponse)
def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthenticated session")
    
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Session expired or invalid token")
    
    role_code = payload.get("role", "DRILLING_ENGINEER")
    user_info = DEMO_USERS.get(role_code, DEMO_USERS["DRILLING_ENGINEER"])

    return UserResponse(
        id=user_info["id"],
        username=user_info["username"],
        full_name=user_info["full_name"],
        email=user_info["email"],
        role_code=role_code,
        role_display_name=ROLE_DISPLAY_NAMES[role_code],
        default_landing_page=ROLE_DEFAULT_LANDING[role_code],
        dashboard_permissions=DEFAULT_RBAC_MATRIX[role_code],
        action_permissions=DEFAULT_ACTION_PERMISSIONS[role_code],
        is_demo_account=True
    )

@router.get("/roles")
def get_supported_roles():
    return [
        {
            "role_code": code,
            "display_name": name,
            "default_landing": ROLE_DEFAULT_LANDING[code],
            "description": f"Role identity for {name}"
        }
        for code, name in ROLE_DISPLAY_NAMES.items()
    ]

@router.post("/logout")
def logout(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        payload = decode_access_token(token)
        if payload:
            db.add(AuditLog(
                username=payload.get("sub", "user"),
                role_code=payload.get("role", "UNKNOWN"),
                action="LOGOUT",
                resource="/api/v1/auth/logout",
                details="Session logged out"
            ))
            db.commit()
    return {"status": "success", "message": "Logged out successfully"}
