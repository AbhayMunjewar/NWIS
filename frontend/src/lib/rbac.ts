import type { UserRole, PermissionLevel, User } from '../types';

export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  DRILLING_ENGINEER: 'Drilling Engineer',
  GEOLOGIST: 'Geologist',
  ERTMAC_OPERATOR: 'eRTMAC Operator',
  MANAGEMENT_SUPERVISOR: 'Management / Supervisor'
};

export const ROLE_DEFAULT_LANDING: Record<UserRole, string> = {
  DRILLING_ENGINEER: '/dashboard',
  GEOLOGIST: '/dashboard',
  ERTMAC_OPERATOR: '/live',
  MANAGEMENT_SUPERVISOR: '/dashboard'
};

export const DEFAULT_RBAC_MATRIX: Record<UserRole, Record<string, PermissionLevel>> = {
  DRILLING_ENGINEER: {
    dashboard: 'FULL',
    map: 'FULL',
    live: 'FULL',
    alerts: 'FULL',
    historical: 'FULL',
    assistant: 'FULL',
    reports: 'FULL'
  },
  GEOLOGIST: {
    dashboard: 'FULL',
    map: 'NONE',
    live: 'NONE',
    alerts: 'NONE',
    historical: 'NONE',
    assistant: 'FULL',
    reports: 'FULL'
  },
  ERTMAC_OPERATOR: {
    dashboard: 'FULL',
    map: 'USE',
    live: 'FULL',
    alerts: 'FULL',
    historical: 'NONE',
    assistant: 'USE',
    reports: 'USE'
  },
  MANAGEMENT_SUPERVISOR: {
    dashboard: 'FULL',
    map: 'VIEW',
    live: 'NONE',
    alerts: 'NONE',
    historical: 'VIEW',
    assistant: 'USE',
    reports: 'FULL'
  }
};

export const ROUTE_KEY_MAP: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/map': 'map',
  '/live': 'live',
  '/alerts': 'alerts',
  '/historical': 'historical',
  '/assistant': 'assistant',
  '/reports': 'reports'
};

export function getRoleDisplayName(role?: UserRole | null): string {
  if (!role) return 'Unauthenticated';
  return ROLE_DISPLAY_NAMES[role] || role;
}

export function getDashboardPermission(role?: UserRole | null, dashboardKey?: string): PermissionLevel {
  if (!role || !dashboardKey) return 'NONE';
  const roleMatrix = DEFAULT_RBAC_MATRIX[role];
  if (!roleMatrix) return 'NONE';
  return roleMatrix[dashboardKey] || 'NONE';
}

export function canAccessDashboard(role?: UserRole | null, dashboardKey?: string): boolean {
  const level = getDashboardPermission(role, dashboardKey);
  return level === 'FULL' || level === 'USE' || level === 'VIEW';
}

export function hasActionPermission(user: User | null, actionCode: string): boolean {
  if (!user || !user.actionPermissions) return false;
  return user.actionPermissions.includes(actionCode);
}
