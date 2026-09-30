import React from 'react';
import type { RiskTrends } from '../../types/risk';
import { BarChart3 } from 'lucide-react';

interface Props {
  trends: RiskTrends | null;
}

export const RiskTrendChart: React.FC<Props> = ({ trends }) => {
  if (!trends || !trends.points || trends.points.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-xs text-slate-500 text-center font-medium shadow-xs">
        Insufficient risk history for trend visualization.
      </div>
    );
  }

  const points = trends.points;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#0F2C59]" />
          <h3 className="text-sm font-extrabold text-[#0F2C59]">Depth / Time Risk Event Trend</h3>
        </div>
        <span className="text-xs text-slate-600 font-mono font-bold">{trends.well_id}</span>
      </div>

      <div className="grid grid-cols-5 gap-2 pt-2 text-center">
        {points.map((pt, i) => (
          <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between shadow-2xs">
            <span className="text-[11px] text-slate-700 font-mono font-bold">{pt.depth_m}m</span>
            <div className="my-2 flex flex-col gap-1 items-center">
              {pt.critical_count > 0 && (
                <span className="w-full bg-rose-600 text-white text-[10px] font-bold rounded-md py-0.5 shadow-2xs">
                  {pt.critical_count} Crit
                </span>
              )}
              {pt.high_count > 0 && (
                <span className="w-full bg-orange-600 text-white text-[10px] font-bold rounded-md py-0.5 shadow-2xs">
                  {pt.high_count} High
                </span>
              )}
              {pt.medium_count > 0 && (
                <span className="w-full bg-amber-500 text-[#0F2C59] text-[10px] font-bold rounded-md py-0.5 shadow-2xs">
                  {pt.medium_count} Med
                </span>
              )}
              {pt.low_count > 0 && (
                <span className="w-full bg-blue-600 text-white text-[10px] font-bold rounded-md py-0.5 shadow-2xs">
                  {pt.low_count} Low
                </span>
              )}
              {pt.critical_count === 0 && pt.high_count === 0 && pt.medium_count === 0 && pt.low_count === 0 && (
                <span className="text-[10px] text-emerald-700 font-bold py-1">Normal</span>
              )}
            </div>
            <span className="text-[10px] text-slate-500 font-medium">{pt.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
