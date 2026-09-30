import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { canAccessDashboard } from '../../lib/rbac';
import { AccessRestricted } from '../common/AccessRestricted';

interface ProtectedRouteProps {
  children: React.ReactNode;
  dashboardKey: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, dashboardKey }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white text-slate-700 text-xs font-medium">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#0F2C59] border-t-transparent animate-spin"></div>
          <span>Verifying session & access permissions...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const hasAccess = canAccessDashboard(user?.roleCode, dashboardKey);

  if (!hasAccess) {
    return <AccessRestricted requiredPermission="VIEW, USE or FULL" resourceName={`/ ${dashboardKey}`} />;
  }

  return <>{children}</>;
};
