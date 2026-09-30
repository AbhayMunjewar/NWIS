import React from 'react';
import { ShieldAlert, TrendingUp } from 'lucide-react';
import { Badge } from '../common/Badge';

interface RiskStatusCardProps {
  riskSummary: any;
  detailLevel?: 'DETAILED' | 'CONTEXT' | 'SUMMARY';
}

export const RiskStatusCard: React.FC<RiskStatusCardProps> = ({
  riskSummary,
  detailLevel = 'DETAILED'
}) => {
  const rs = riskSummary || {};
  const isConnected = rs.analytics_connected ?? false;
  const status = isConnected ? (rs.status || 'NORMAL') : 'Analytics not connected';
  const trend = isConnected ? (rs.trend || 'STABLE') : 'Not available';
  const activeCount = isConnected ? (rs.active_risk_count ?? '0') : 'Not available';
  const criticalCount = isConnected ? (rs.critical_alert_count ?? '0') : 'Not available';

  const getStatusBadge = () => {
    if (!isConnected) return <Badge variant="neutral">NOT CONNECTED</Badge>;
    switch (status.toUpperCase()) {
      case 'CRITICAL':
        return <Badge variant="critical">CRITICAL RISK</Badge>;
      case 'HIGH':
        return <Badge variant="warning">HIGH RISK</Badge>;
      case 'MEDIUM':
        return <Badge variant="use">MEDIUM RISK</Badge>;
      case 'LOW':
      case 'NORMAL':
      default:
        return <Badge variant="full">NORMAL</Badge>;
    }
  };

  if (detailLevel === 'SUMMARY') {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <ShieldAlert size={22} className="text-amber-600 shrink-0" />
          <div>
            <div className="text-sm font-extrabold text-[#0F2C59]">Overall Well Risk Status</div>
            <div className="text-xs text-slate-700 font-medium mt-0.5">
              Active Risks: <span className="text-amber-700 font-extrabold">{activeCount}</span> • Critical Alerts: <span className="text-rose-700 font-extrabold">{criticalCount}</span>
            </div>
          </div>
        </div>
        {getStatusBadge()}
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 text-sm font-extrabold text-[#0F2C59] uppercase tracking-wider">
          <ShieldAlert size={18} className="text-amber-600" />
          <span>Overall Drilling Risk Status</span>
        </div>
        {getStatusBadge()}
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Risk Level State</div>
          <div className="font-extrabold text-slate-900 mt-1 text-sm">{status}</div>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Risk Trend</div>
          <div className="font-extrabold text-slate-900 mt-1 text-sm flex items-center gap-1.5">
            <TrendingUp size={14} className="text-slate-600" />
            <span>{trend}</span>
          </div>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Active Risk Hazards</div>
          <div className="font-extrabold text-amber-700 mt-1 text-sm">{activeCount}</div>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Critical Alerts</div>
          <div className="font-extrabold text-rose-700 mt-1 text-sm">{criticalCount}</div>
        </div>
      </div>
    </div>
  );
};

