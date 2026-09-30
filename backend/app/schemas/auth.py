from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from datetime import datetime

class LoginRequest(BaseModel):
    username: str
    password: Optional[str] = None
    role_code: Optional[str] = None  # Used in demo selector mode

class PermissionMatrixResponse(BaseModel):
    dashboard_permissions: Dict[str, str]
    action_permissions: List[str]

class UserResponse(BaseModel):
    id: int
    username: str
    full_name: str
    email: str
    role_code: str
    role_display_name: str
    default_landing_page: str
    dashboard_permissions: Dict[str, str]
    action_permissions: List[str]
    is_demo_account: bool

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class SystemInfoResponse(BaseModel):
    system_name: str
    version: str
    environment: str
    demo_mode: bool
    status: str
    server_time: datetime

class ActiveWellResponse(BaseModel):
    well_id: str
    well_name: str
    field_name: str
    status: str
    depth_m: Optional[float] = None
    formation: Optional[str] = None
    data_status: str
