import React from 'react';
import type { AlertItem, RiskSeverity } from '../../types/risk';
import { CheckCircle, ShieldAlert, Eye, Check, CheckSquare } from 'lucide-react';

interface Props {
  alerts: AlertItem[];
  globalWellId: string;
  roleCode?: string;
  onSelectAlert: (alertId: string) => void;
  onAcknowledgeAlert: (alertId: string) => void;
  onResolveAlert: (alertId: string, note?: string) => void;
  canAcknowledge: boolean;
  canResolve: boolean;
}

export const ActiveAlertsTable: React.FC<Props> = ({
  alerts,
  globalWellId,
  onSelectAlert,
  onAcknowledgeAlert,
  onResolveAlert,
  canAcknowledge,
  canResolve
}) => {
  const getSeverityBadge = (severity: RiskSeverity) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-300 font-bold';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
      default:
        return 'bg-blue-100 text-blue-900 border-blue-300 font-bold';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-rose-50 text-rose-700 border-rose-300 font-bold animate-pulse';
      case 'ACKNOWLEDGED':
        return 'bg-amber-50 text-amber-800 border-amber-300 font-bold';
      case 'RESOLVED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300 font-medium';
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-700 shadow-xs">
        <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-[#0F2C59]">No active alerts</h3>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          All risk parameters are within normal thresholds for selected filters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <h3 className="text-sm font-extrabold text-[#0F2C59]">Active Risk Alerts</h3>
          <span className="px-2.5 py-0.5 text-xs rounded-full bg-slate-200 text-slate-800 font-mono font-bold">
            {alerts.length} Records
          </span>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Decision Support System • Human Verification Required
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
              <th className="py-3.5 px-4">Alert ID / Well</th>
              <th className="py-3.5 px-4">Risk Type</th>
              <th className="py-3.5 px-4">Severity</th>
              <th className="py-3.5 px-4">Depth & Formation</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Evidence / Reason</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs font-medium">
            {alerts.map((item) => {
              const isOtherWell = item.well_id.replace('-', '_').toUpperCase() !== globalWellId.replace('-', '_').toUpperCase();

              return (
                <tr
                  key={item.alert_id}
                  className="hover:bg-slate-50 transition-colors group cursor-pointer"
                  onClick={() => onSelectAlert(item.alert_id)}
                >
                  {/* Alert ID / Well */}
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-[#0F2C59]">{item.alert_id}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-slate-800 font-bold">{item.well_name}</span>
                      {isOtherWell && (
                        <span className="px-1.5 py-0.5 text-[10px] rounded bg-purple-50 text-purple-900 border border-purple-200 font-bold">
                          Inspect Well
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Risk Type */}
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {item.alert_type}
                  </td>

                  {/* Severity */}
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 text-[10px] rounded-md border ${getSeverityBadge(item.severity)}`}>
                      {item.severity}
                    </span>
                  </td>

                  {/* Depth & Formation */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#0F2C59]">{item.current_depth_m} m</div>
                    <div className="text-[11px] text-slate-600 font-medium">{item.formation}</div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 text-[10px] rounded-md border ${getStatusBadge(item.status)}`}>
                      {item.status}
                    </span>
                    {item.acknowledged_by && (
                      <div className="text-[10px] text-slate-500 mt-1 font-mono">Ack: {item.acknowledged_by}</div>
                    )}
                  </td>

                  {/* Evidence / Reason */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="text-slate-700 font-medium line-clamp-2">{item.short_reason}</p>
                    <span className="text-[10px] text-emerald-700 font-bold mt-0.5 block">
                      Evidence: {item.evidence_availability}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onSelectAlert(item.alert_id)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-[#0F2C59] border border-slate-300 rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Detail</span>
                    </button>

                    {canAcknowledge && item.status === 'ACTIVE' && (
                      <button
                        onClick={() => onAcknowledgeAlert(item.alert_id)}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-[#0F2C59] rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Ack</span>
                      </button>
                    )}

                    {canResolve && item.status !== 'RESOLVED' && (
                      <button
                        onClick={() => onResolveAlert(item.alert_id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-xs"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Resolve</span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
