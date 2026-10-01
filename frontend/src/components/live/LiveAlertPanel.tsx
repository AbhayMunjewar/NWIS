import React, { useState } from 'react';
import { Bell, CheckCircle2, UserCheck } from 'lucide-react';
import type { LiveAlertItem } from '../../types/live';
import { Badge } from '../common/Badge';

interface LiveAlertPanelProps {
  alerts: LiveAlertItem[] | undefined;
  roleCode?: string;
  onAcknowledgeAlert?: (alertId: string) => void;
}

export const LiveAlertPanel: React.FC<LiveAlertPanelProps> = ({
  alerts,
  roleCode = 'DRILLING_ENGINEER',
  onAcknowledgeAlert
}) => {
  const [ackingId, setAckingId] = useState<string | null>(null);

  const canAcknowledge = roleCode === 'ERTMAC_OPERATOR' || roleCode === 'DRILLING_ENGINEER';

  const handleAck = async (alertId: string) => {
    setAckingId(alertId);
    try {
      const resp = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/live/alerts/${alertId}/acknowledge?user_name=${roleCode}`, {
        method: 'POST'
      });
      if (resp.ok) {
        if (onAcknowledgeAlert) onAcknowledgeAlert(alertId);
      }
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    } finally {
      setAckingId(null);
    }
  };

  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 text-xs text-center space-y-2 shadow-xs">
        <div className="flex items-center justify-center gap-2 text-emerald-800 font-extrabold">
          <CheckCircle2 size={20} />
          <span>No Active Operational Alerts</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 text-xs shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 font-extrabold text-[#0F2C59] uppercase tracking-wider text-xs">
          <Bell size={18} className="text-amber-600" />
          <span>Active Operational Alerts & Warnings ({alerts.length})</span>
        </div>
        <Badge variant="critical" size="sm">LIVE ALERT FEED</Badge>
      </div>

      <div className="space-y-3">
        {alerts.map((alt) => {
          const isAcked = alt.status === 'ACKNOWLEDGED';
          return (
            <div
              key={alt.alert_id}
              className={`border rounded-xl p-4 space-y-2.5 transition-all shadow-2xs ${
                isAcked
                  ? 'bg-slate-50 border-slate-200'
                  : 'bg-rose-50/80 border-rose-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-sm">{alt.alert_type}</span>
                  <span className="text-xs text-slate-600 font-semibold">({alt.alert_id})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={alt.severity === 'Critical' ? 'critical' : 'warning'} size="sm">
                    {alt.severity.toUpperCase()}
                  </Badge>
                  <Badge variant={isAcked ? 'use' : 'critical'} size="sm">
                    {alt.status}
                  </Badge>
                </div>
              </div>

              <div className="text-slate-800 text-xs font-medium leading-relaxed">
                <div>Reason: <strong className="text-slate-900 font-bold">{alt.reason}</strong></div>
                <div className="text-slate-600 text-xs mt-0.5">Evidence: {alt.evidence}</div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>Depth: <strong className="text-[#0F2C59] font-bold">{alt.depth_m}m</strong> • Time: {alt.timestamp}</span>

                {isAcked ? (
                  <span className="text-emerald-800 font-extrabold flex items-center gap-1">
                    <UserCheck size={14} />
                    <span>Ack by {alt.acknowledged_by || 'Operator'}</span>
                  </span>
                ) : canAcknowledge ? (
                  <button
                    onClick={() => handleAck(alt.alert_id)}
                    disabled={ackingId === alt.alert_id}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-[#0F2C59] font-extrabold transition-colors text-xs shadow-2xs"
                  >
                    {ackingId === alt.alert_id ? 'Acknowledging...' : 'Acknowledge Alert'}
                  </button>
                ) : (
                  <span className="text-slate-500 italic">Read-Only</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

