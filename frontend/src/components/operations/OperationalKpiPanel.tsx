import React from 'react';
import { BarChart2 } from 'lucide-react';
import { Badge } from '../common/Badge';

interface OperationalKpiPanelProps {
  kpiSummary: any;
  detailLevel?: 'DETAILED' | 'CONTEXT' | 'SUMMARY';
}

export const OperationalKpiPanel: React.FC<OperationalKpiPanelProps> = ({
  kpiSummary,
  detailLevel = 'DETAILED'
}) => {
  const k = kpiSummary || {};

  const currentDepth = k.current_depth_m ?? null;
  const targetDepth = k.target_depth_m ?? null;
  const progressPct = k.depth_progress_pct !== undefined && k.depth_progress_pct !== null ? k.depth_progress_pct : null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 text-sm font-extrabold text-[#0F2C59] uppercase tracking-wider">
          <BarChart2 size={18} className="text-[#0F2C59]" />
          <span>Operational KPIs & Basin Metrics</span>
        </div>
        <Badge variant="neutral" size="sm">KEY PERFORMANCE</Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-blue-50/80 p-3.5 rounded-xl border border-blue-200 shadow-2xs">
          <div className="text-[10px] text-blue-900 uppercase font-extrabold tracking-wider">Active Depth Progress</div>
          <div className="text-xl font-extrabold text-[#0F2C59] mt-1">
            {progressPct !== null ? `${progressPct}%` : '—'}
          </div>
          <div className="text-xs text-slate-700 font-medium mt-1">
            {currentDepth !== null && targetDepth !== null ? `${currentDepth}m / ${targetDepth}m` : 'Depth unavailable'}
          </div>
        </div>

        <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 shadow-2xs">
          <div className="text-[10px] text-amber-950 uppercase font-extrabold tracking-wider">Recorded NPT Loss</div>
          <div className="text-xl font-extrabold text-amber-900 mt-1">
            {k.total_npt_hours !== undefined ? `${k.total_npt_hours} hrs` : '—'}
          </div>
          <div className="text-xs text-amber-800 font-medium mt-1">Basin historical events</div>
        </div>

        <div className="bg-rose-50/80 p-3.5 rounded-xl border border-rose-200 shadow-2xs">
          <div className="text-[10px] text-rose-950 uppercase font-extrabold tracking-wider">Active Risk Hazards</div>
          <div className="text-xl font-extrabold text-rose-900 mt-1">
            {k.active_alerts_count !== undefined ? k.active_alerts_count : '—'}
          </div>
          <div className="text-xs text-rose-800 font-medium mt-1">Operational warnings</div>
        </div>

        {detailLevel !== 'SUMMARY' && (
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-[10px] text-slate-600 uppercase font-extrabold tracking-wider">Catalog Offset Coverage</div>
            <div className="text-xl font-extrabold text-slate-900 mt-1">
              {k.total_offset_wells !== undefined ? `${k.total_offset_wells} Wells` : '—'}
            </div>
            <div className="text-xs text-slate-600 font-medium mt-1">Reference catalog</div>
          </div>
        )}
      </div>
    </div>
  );
};

