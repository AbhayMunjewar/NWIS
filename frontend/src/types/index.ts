export type UserRole = 
  | 'DRILLING_ENGINEER' 
  | 'GEOLOGIST' 
  | 'ERTMAC_OPERATOR' 
  | 'MANAGEMENT_SUPERVISOR';

export type PermissionLevel = 'FULL' | 'USE' | 'VIEW' | 'NONE';

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  roleCode: UserRole;
  roleDisplayName: string;
  defaultLandingPage: string;
  dashboardPermissions: Record<string, PermissionLevel>;
  actionPermissions: string[];
  isDemoAccount: boolean;
}

export interface WellContextState {
  wellId: string;
  wellName: string;
  fieldName: string;
  targetFormation: string;
  status: string;
  dataStatus: string;
}

export interface SystemInfo {
  systemName: string;
  version: string;
  environment: string;
  demoMode: boolean;
  status: string;
  serverTime: string;
}
