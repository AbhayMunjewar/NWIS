from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text
from datetime import datetime
from app.db.base import Base

class Role(Base):
    __tablename__ = "roles"

    code = Column(String(50), primary_key=True, index=True)
    display_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    role_code = Column(String(50), ForeignKey("roles.code"), nullable=False)
    is_active = Column(Boolean, default=True)
    is_demo_user = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class RoleDashboardPermission(Base):
    __tablename__ = "role_dashboard_permissions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    role_code = Column(String(50), ForeignKey("roles.code"), nullable=False)
    dashboard_key = Column(String(50), nullable=False)  # 'dashboard', 'map', 'live', 'alerts', 'historical', 'assistant', 'reports'
    permission_level = Column(String(20), nullable=False)  # 'FULL', 'USE', 'VIEW'

class RoleActionPermission(Base):
    __tablename__ = "role_action_permissions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    role_code = Column(String(50), ForeignKey("roles.code"), nullable=False)
    action_code = Column(String(100), nullable=False)  # e.g., 'ACKNOWLEDGE_ALERT', 'EXPORT_REPORT'
    granted = Column(Boolean, default=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), nullable=False)
    role_code = Column(String(50), nullable=False)
    action = Column(String(100), nullable=False)
    resource = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
