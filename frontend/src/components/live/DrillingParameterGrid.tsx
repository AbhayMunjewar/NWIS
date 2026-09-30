import React from 'react';
import { TrendingUp, TrendingDown, Minus, Activity, ShieldCheck } from 'lucide-react';
import type { ParametersMap, ParameterDetail } from '../../types/live';
import { Badge } from '../common/Badge';

interface DrillingParameterGridProps {
  parameters: ParametersMap | undefined;
  detailLevel?: 'DETAILED' | 'CONTEXT' | 'SUMMARY';
}

export const DrillingParameterGrid: React.FC<DrillingParameterGridProps> = ({
  parameters,
  detailLevel = 'DETAILED'
}) => {
  if (!parameters) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-xs font-semibold text-slate-500 shadow-xs">
        Telemetry parameter stream unavailable
      </div>
    );
  }

  // Define parameter list
  const paramList: { key: keyof ParametersMap; label: string }[] = [
    { key: 'depth', label: 'Current Depth' },
    { key: 'rop', label: 'ROP (Penetration Rate)' },
    { key: 'wob', label: 'WOB (Weight on Bit)' },
    { key: 'torque', label: 'Rotational Torque' },
    { key: 'rpm', label: 'Top Drive RPM' },
    { key: 'spp', label: 'Standpipe Pressure (SPP)' },
    { key: 'flow_rate', label: 'Mud Flow Rate (In)' },
    { key: 'hookload', label: 'Hookload' }
  ];

  // Geologist CONTEXT mode: Only Depth and ROP context
  const itemsToRender = detailLevel === 'CONTEXT' ? paramList.slice(0, 2) : paramList;

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 font-extrabold text-[#0F2C59] uppercase tracking-wider text-xs">
          <Activity size={18} className="text-[#0F2C59]" />
          <span>Real-Time Sensor Telemetry Channels ({itemsToRender.length})</span>
        </div>
        <Badge variant={detailLevel === 'DETAILED' ? 'full' : 'use'} size="sm">
          VALIDATED SENSOR STREAM
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {itemsToRender.map(({ key, label }) => {
          const item: ParameterDetail = parameters[key];
          if (!item) return null;

          const isUp = item.trend === 'UP';
          const isDown = item.trend === 'DOWN';

          return (
            <div
              key={key}
              className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5 relative shadow-xs hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wider truncate max-w-[170px]">
                  {label}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 border border-emerald-300 text-emerald-950 font-extrabold flex items-center gap-1">
                  <ShieldCheck size={12} />
                  <span>VALID</span>
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {item.value} <span className="text-xs font-semibold text-slate-500">{item.unit}</span>
                </div>

                <div className={`flex items-center gap-1 text-xs font-extrabold ${isUp ? 'text-emerald-700' : isDown ? 'text-rose-700' : 'text-slate-600'}`}>
                  {isUp ? <TrendingUp size={16} /> : isDown ? <TrendingDown size={16} /> : <Minus size={16} />}
                  <span>{item.change >= 0 ? `+${item.change}` : item.change}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>Prev: <strong className="text-slate-900 font-bold">{item.previous_value} {item.unit}</strong></span>
                <span>d/dt: <strong className="text-slate-900 font-bold">{item.rate_of_change_per_min} /min</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

