import React from 'react';
import { MapPin, Activity, AlertTriangle, History, Bot, ArrowRight, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { canAccessDashboard, getDashboardPermission } from '../../lib/rbac';
import { Badge } from '../common/Badge';

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const actions = [
    { label: 'View Nearby Wells', route: '/map', key: 'map', icon: MapPin, desc: 'Spatial offset well map & proximity radiuses' },
    { label: 'Open Live Drilling', route: '/live', key: 'live', icon: Activity, desc: 'Live sensor telemetry & standpipe pressure streams' },
    { label: 'View Risk & Alerts', route: '/alerts', key: 'alerts', icon: AlertTriangle, desc: 'Automated hazard detection & escalation logs' },
    { label: 'Search Historical Events', route: '/historical', key: 'historical', icon: History, desc: 'Historical NPT records & WCR technical PDFs' },
    { label: 'Ask AI Assistant', route: '/assistant', key: 'assistant', icon: Bot, desc: 'RAG drilling copilot & SPE paper retrieval' }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="text-sm font-extrabold text-[#0F2C59] uppercase tracking-wider flex items-center gap-2">
          <span>Quick Decision-Support Navigation</span>
        </div>
        <Badge variant="neutral" size="sm">ROLE-AWARE ACTIONS</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          const perm = getDashboardPermission(user?.roleCode, act.key);
          const hasAccess = canAccessDashboard(user?.roleCode, act.key);

          return (
            <button
              key={act.key}
              onClick={() => hasAccess && navigate(act.route)}
              disabled={!hasAccess}
              className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all group shadow-2xs ${
                hasAccess
                  ? 'bg-slate-50 border-slate-200 hover:bg-blue-50/50 hover:border-blue-300 cursor-pointer'
                  : 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <Icon size={18} className={hasAccess ? 'text-[#0F2C59] group-hover:text-blue-700' : 'text-slate-400'} />
                  {perm && (
                    <Badge size="sm" variant={perm === 'FULL' ? 'full' : perm === 'USE' ? 'use' : 'view'}>
                      {perm}
                    </Badge>
                  )}
                </div>

                <div className="font-extrabold text-xs text-slate-900 group-hover:text-[#0F2C59] transition-colors">
                  {act.label}
                </div>

                <div className="text-xs text-slate-600 font-medium mt-1 leading-snug line-clamp-2">
                  {act.desc}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-[#0F2C59] pt-2 border-t border-slate-200">
                <span>{hasAccess ? 'Navigate' : 'Restricted'}</span>
                {hasAccess ? <ArrowRight size={14} /> : <Lock size={14} className="text-slate-400" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

