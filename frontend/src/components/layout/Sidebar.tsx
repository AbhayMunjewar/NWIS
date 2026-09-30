import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MapPin, 
  Activity, 
  AlertTriangle, 
  History, 
  Bot, 
  FileText,
  Shield,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { getDashboardPermission } from '../../lib/rbac';
import { Badge } from '../common/Badge';

interface NavItem {
  key: string;
  path: string;
  label: string;
  icon: React.ElementType;
  isPrimary: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', path: '/dashboard', label: 'Operations / Command', icon: LayoutDashboard, isPrimary: true },
  { key: 'map', path: '/map', label: 'Nearby Wells / GIS', icon: MapPin, isPrimary: true },
  { key: 'live', path: '/live', label: 'Live Drilling', icon: Activity, isPrimary: true },
  { key: 'alerts', path: '/alerts', label: 'Risk & Alerts', icon: AlertTriangle, isPrimary: true },
  { key: 'historical', path: '/historical', label: 'Historical Wells & Events', icon: History, isPrimary: true },
  { key: 'assistant', path: '/assistant', label: 'AI Engineering Assistant', icon: Bot, isPrimary: true },
  { key: 'reports', path: '/reports', label: 'Reports Workspace', icon: FileText, isPrimary: false }
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="w-64 bg-[#0F2C59] border-r border-[#0A2540] flex flex-col h-full select-none shrink-0 shadow-lg text-slate-100">
      {/* Brand Sub Header */}
      <div className="p-4 border-b border-[#1E3A5F] bg-[#0A2540] flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-amber-500 text-[#0F2C59] flex items-center justify-center font-bold shadow-xs">
          <Shield size={20} />
        </div>
        <div>
          <div className="text-sm font-extrabold text-white tracking-wide leading-none">
            eRTMAC-NWIS
          </div>
          <div className="text-[10px] text-amber-300 font-mono mt-1 tracking-wider uppercase font-semibold">
            Govt. Portal Module
          </div>
        </div>
      </div>

      {/* Navigation Matrix */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {/* Primary Dashboards */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center justify-between">
            <span>Core Operations</span>
          </div>
          
          <nav className="space-y-1.5">
            {NAV_ITEMS.filter(item => item.isPrimary).map((item) => {
              const Icon = item.icon;
              const perm = getDashboardPermission(user?.roleCode, item.key);

              if (perm === 'NONE') return null;

              return (
                <NavLink
                  key={item.key}
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all group
                    ${isActive 
                      ? 'bg-amber-500 text-[#0F2C59] shadow-md ring-2 ring-amber-400/40' 
                      : 'text-slate-100 hover:bg-[#183960] hover:text-white'}
                  `}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon size={17} className="group-hover:scale-110 transition-transform shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {perm && (
                    <Badge
                      size="sm"
                      variant={perm === 'FULL' ? 'full' : perm === 'USE' ? 'use' : 'view'}
                    >
                      {perm}
                    </Badge>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Supporting Workspaces */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
            Supporting Workspaces
          </div>
          
          <nav className="space-y-1.5">
            {NAV_ITEMS.filter(item => !item.isPrimary).map((item) => {
              const Icon = item.icon;
              const perm = getDashboardPermission(user?.roleCode, item.key);

              if (perm === 'NONE') return null;

              return (
                <NavLink
                  key={item.key}
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all group
                    ${isActive 
                      ? 'bg-amber-500 text-[#0F2C59] shadow-md ring-2 ring-amber-400/40' 
                      : 'text-slate-100 hover:bg-[#183960] hover:text-white'}
                  `}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon size={17} className="group-hover:scale-110 transition-transform shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {perm && (
                    <Badge size="sm" variant={perm === 'FULL' ? 'full' : perm === 'USE' ? 'use' : 'view'}>
                      {perm}
                    </Badge>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Role Footer Banner & Single Clean Sign Out Button */}
      <div className="p-3 border-t border-[#1E3A5F] bg-[#0A2540] text-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="truncate">
            <div className="text-[10px] text-slate-300 font-mono uppercase tracking-wider font-semibold">Active Logged Entity</div>
            <div className="font-extrabold text-white truncate text-xs">{user?.roleDisplayName}</div>
          </div>
          <Badge size="sm" variant="demo">ACTIVE</Badge>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <LogOut size={15} />
          <span>Sign Out of Portal</span>
        </button>
      </div>
    </aside>
  );
};
