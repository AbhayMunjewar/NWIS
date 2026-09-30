import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { Badge } from './Badge';

interface AccessRestrictedProps {
  requiredPermission?: string;
  resourceName?: string;
}

export const AccessRestricted: React.FC<AccessRestrictedProps> = ({
  requiredPermission = 'FULL or USE',
  resourceName = 'Dashboard Module'
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center mb-5 text-rose-700 shadow-2xs">
        <ShieldAlert size={32} />
      </div>
      
      <h2 className="text-xl font-extrabold text-[#0F2C59] mb-2">
        Access Restricted — Permission Required
      </h2>
      
      <p className="text-sm text-slate-700 font-semibold max-w-md mb-6 leading-relaxed">
        Your authenticated role <Badge variant="neutral">{user?.roleDisplayName || user?.roleCode}</Badge> does not have permission to access <span className="text-slate-900 font-extrabold">{resourceName}</span>.
      </p>

      <div className="bg-white border border-slate-200 rounded-xl p-4 max-w-md w-full mb-6 text-left text-xs font-semibold text-slate-700 space-y-2 shadow-xs">
        <div className="flex justify-between">
          <span className="text-slate-600 font-bold">Authenticated Identity:</span>
          <span className="text-slate-900 font-extrabold">{user?.username}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600 font-bold">Role Code:</span>
          <span className="text-slate-900 font-extrabold">{user?.roleCode}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600 font-bold">Required Level:</span>
          <span className="text-amber-800 font-black">{requiredPermission}</span>
        </div>
      </div>

      <button
        onClick={() => navigate(user?.defaultLandingPage || '/dashboard')}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F2C59] hover:bg-[#1E3A8A] text-white text-xs font-extrabold transition-colors shadow-md"
      >
        <ArrowLeft size={16} />
        Return to Default Landing Page ({user?.defaultLandingPage})
      </button>
    </div>
  );
};

