import React from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Bell, 
  User as UserIcon, 
  Compass, 
  Eye,
  Activity
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useCurrentWell } from '../../lib/wellContext';
import { getDashboardPermission, ROUTE_KEY_MAP } from '../../lib/rbac';

export const Header: React.FC = () => {
  const { user } = useAuth();
  const { currentWell, availableWells, selectWell } = useCurrentWell();
  const location = useLocation();

  const currentRouteKey = ROUTE_KEY_MAP[location.pathname] || 'dashboard';
  const currentPermLevel = getDashboardPermission(user?.roleCode, currentRouteKey);
  const isReadOnlyMode = currentPermLevel === 'VIEW';

  return (
    <header className="h-13 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 select-none text-slate-800 shadow-xs">
      {/* Left: Current Well Context Selector & Indicator */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-[#0F2C59] border border-[#0F2C59] rounded-lg px-3 py-1.5 text-xs shadow-xs text-white">
          <Compass size={15} className="text-amber-400 shrink-0" />
          <span className="text-amber-300 font-mono text-[11px] uppercase tracking-wider font-bold">Active Operational Well:</span>
          
          <select
            value={currentWell?.wellId ?? ''}
            onChange={(e) => selectWell(e.target.value || null)}
            className="bg-[#0F2C59] text-white font-bold text-xs focus:outline-none cursor-pointer border-none py-0 pl-1 pr-6"
          >
            {availableWells.map(w => (
              <option key={w.wellId} value={w.wellId} className="bg-[#0F2C59] text-white font-bold">
                {w.wellName} ({w.targetFormation})
              </option>
            ))}
          </select>
        </div>

        {/* Current Well Status Tag */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-700 font-medium">
          <Activity size={14} className="text-emerald-600" />
          <span className="text-slate-500 font-mono text-[11px]">Status:</span>
          <span className="text-[#0F2C59] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded text-[11px] font-bold">
            {currentWell ? currentWell.status : 'No active well selected'}
          </span>
        </div>
      </div>

      {/* Right: Security & Session Context */}
      <div className="flex items-center gap-3">
        {/* Read Only Indicator */}
        {isReadOnlyMode && (
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-300 text-amber-900 px-2.5 py-1 rounded text-xs font-mono font-bold shadow-2xs">
            <Eye size={13} className="text-amber-700" />
            <span>READ ONLY ACCESS</span>
          </div>
        )}

        {/* System Notifications Indicator */}
        <button
          title="Official Notifications"
          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center text-[#0F2C59] transition-colors relative shadow-2xs"
        >
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white"></span>
        </button>

        {/* User / Session Badge */}
        <div className="flex items-center gap-2.5 bg-slate-100 border border-slate-300 rounded-lg px-3 py-1 text-xs text-slate-800 shadow-2xs">
          <div className="w-6 h-6 rounded-full bg-[#0F2C59] text-amber-400 flex items-center justify-center font-bold">
            <UserIcon size={13} />
          </div>
          <div className="text-left">
            <div className="text-[#0F2C59] font-bold leading-none">{user?.fullName}</div>
            <div className="text-[10px] text-slate-600 font-semibold leading-tight mt-0.5">{user?.roleDisplayName}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
