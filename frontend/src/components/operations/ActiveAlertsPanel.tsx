import React from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../common/Badge';

interface ActiveAlertsPanelProps {
  alerts: any[];
}

export const ActiveAlertsPanel: React.FC<ActiveAlertsPanelProps> = ({ alerts }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 text-sm font-extrabold text-[#0F2C59] uppercase tracking-wider">
          <AlertTriangle size={18} className="text-rose-600" />
          <span>Active Operational Alerts ({alerts ? alerts.length : 0})</span>
        </div>

        <button
          onClick={() => navigate('/alerts')}
          className="text-xs text-[#0F2C59] hover:text-blue-700 font-bold flex items-center gap-1 transition-colors"
        >
          <span>View All in Risk & Alerts</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {!alerts || alerts.length === 0 ? (
        <div className="py-6 text-center text-xs font-semibold text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
          No active alerts registered for current well
        </div>
      ) : (
        <div className="space-y-2.5">
          {alerts.map((a, i) => {
            const sev = a.severity || 'Medium';
            const variant = sev === 'Critical' ? 'critical' : sev === 'High' ? 'warning' : 'use';

            return (
              <div
                key={a.alert_id || i}
                onClick={() => navigate('/alerts')}
                className="p-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors group shadow-2xs"
              >
                <div className="flex items-start gap-3">
                  <Badge variant={variant} size="sm">{sev.toUpperCase()}</Badge>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900 group-hover:text-[#0F2C59] transition-colors">
                      {a.alert_type || a.hazard_type}
                    </div>
                    <div className="text-xs text-slate-700 font-medium mt-0.5 leading-snug">
                      {a.reason}
                    </div>
                    <div className="text-[11px] text-slate-600 font-semibold mt-1 flex items-center gap-3">
                      <span>Depth: <strong>{a.depth_m}m</strong></span>
                      <span>•</span>
                      <span>Time: <strong>{new Date(a.time).toLocaleString()}</strong></span>
                    </div>
                  </div>
                </div>

                <ChevronRight size={18} className="text-slate-400 group-hover:text-[#0F2C59] shrink-0" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

