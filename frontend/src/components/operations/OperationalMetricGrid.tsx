import React from 'react';
import { Activity, Gauge, Zap, Flame, RotateCw, ShieldCheck, Droplet, Anchor } from 'lucide-react';

interface MetricItem {
  label: string;
  value: string | number | null;
  unit: string;
  icon: React.ElementType;
}

interface OperationalMetricGridProps {
  latestParams: any;
  detailLevel?: 'DETAILED' | 'CONTEXT' | 'SUMMARY';
}

export const OperationalMetricGrid: React.FC<OperationalMetricGridProps> = ({
  latestParams,
  detailLevel = 'DETAILED'
}) => {
  const p = latestParams || {};

  const allMetrics: MetricItem[] = [
    { label: 'Current Depth', value: p.depth_m !== undefined ? p.depth_m : null, unit: 'm', icon: Activity },
    { label: 'Rate of Penetration (ROP)', value: p.rop_m_hr !== undefined ? p.rop_m_hr : null, unit: 'm/hr', icon: Gauge },
    { label: 'Weight on Bit (WOB)', value: p.wob_kN !== undefined ? p.wob_kN : null, unit: 'kN', icon: Zap },
    { label: 'Surface Torque', value: p.torque_kNm !== undefined ? p.torque_kNm : null, unit: 'kN·m', icon: Flame },
    { label: 'Rotary Speed (RPM)', value: p.rpm !== undefined ? p.rpm : null, unit: 'rpm', icon: RotateCw },
    { label: 'Standpipe Pressure (SPP)', value: p.standpipe_pressure_psi !== undefined ? p.standpipe_pressure_psi : null, unit: 'psi', icon: ShieldCheck },
    { label: 'Mud Flow Rate In', value: p.flow_in_lpm !== undefined ? p.flow_in_lpm : null, unit: 'L/min', icon: Droplet },
    { label: 'Hookload', value: p.hookload !== undefined && p.hookload !== null ? p.hookload : null, unit: 'tonnes', icon: Anchor }
  ];

  // Geologist CONTEXT mode: Compact background context (Depth & ROP only)
  if (detailLevel === 'CONTEXT') {
    const depthVal = p.depth_m !== undefined ? `${p.depth_m.toFixed(1)} m` : '—';
    const ropVal = p.rop_m_hr !== undefined ? `${p.rop_m_hr.toFixed(1)} m/hr` : '—';

    return (
      <div className="bg-blue-50/80 border border-blue-200/80 rounded-xl p-3.5 flex items-center justify-between text-xs font-sans shadow-2xs">
        <div className="flex items-center gap-2 text-slate-700">
          <Activity size={16} className="text-[#0F2C59] shrink-0" />
          <span className="font-bold text-[#0F2C59]">Operational Drilling Context:</span>
          <span>Depth: <strong className="text-slate-900 font-extrabold">{depthVal}</strong></span>
          <span className="text-slate-500">•</span>
          <span>ROP: <strong className="text-slate-900 font-extrabold">{ropVal}</strong></span>
        </div>
        <span className="text-[10px] text-blue-900 font-bold uppercase tracking-wide bg-blue-100/70 px-2 py-0.5 rounded border border-blue-200">
          SUPPORTING CONTEXT FOR GEOLOGY
        </span>
      </div>
    );
  }

  // Management SUMMARY mode: High-level metric summary
  if (detailLevel === 'SUMMARY') {
    const summaryMetrics = allMetrics.slice(0, 4); // Depth, ROP, WOB, Torque

    return (
      <div className="space-y-2">
        <div className="text-xs uppercase tracking-wider text-slate-700 font-bold flex items-center justify-between">
          <span className="flex items-center gap-2 text-[#0F2C59]">
            <Activity size={15} className="text-[#0F2C59]" />
            <span>High-Level Operational Parameters Summary</span>
          </span>
          <span className="text-[10px] text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            MANAGEMENT SUMMARY
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {summaryMetrics.map((m, idx) => {
            const Icon = m.icon;
            const isAvailable = m.value !== null;
            const valDisplay = isAvailable ? (typeof m.value === 'number' ? m.value.toFixed(1) : m.value) : '—';

            return (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
                <div className="text-xs font-semibold text-slate-600 flex items-center justify-between">
                  <span>{m.label}</span>
                  <Icon size={14} className="text-[#0F2C59]" />
                </div>
                <div className="text-lg font-extrabold text-slate-900 mt-1">
                  {valDisplay} <span className="text-xs font-semibold text-slate-500">{isAvailable ? m.unit : ''}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Engineering / Operator DETAILED mode: Full 8-metric grid
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-wider text-slate-800 font-bold flex items-center gap-2">
          <Activity size={15} className="text-[#0F2C59]" />
          <span>Operational Telemetry Parameters</span>
        </h3>
        <span className="text-[11px] text-slate-600 font-medium">
          Detailed time-series in Live Drilling (/live)
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {allMetrics.map((m, idx) => {
          const Icon = m.icon;
          const isAvailable = m.value !== null;
          const valDisplay = isAvailable ? (typeof m.value === 'number' ? m.value.toFixed(1) : m.value) : '—';

          return (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-600 mb-2">
                <span className="text-xs font-semibold text-slate-700 truncate">{m.label}</span>
                <Icon size={16} className="text-[#0F2C59] shrink-0" />
              </div>

              <div>
                <div className="text-xl font-extrabold text-slate-900">
                  {valDisplay} <span className="text-xs font-semibold text-slate-500">{isAvailable ? m.unit : ''}</span>
                </div>
                
                <div className="mt-2 flex items-center justify-between text-[11px] font-medium">
                  <span className={isAvailable ? 'text-emerald-700 font-semibold flex items-center gap-1' : 'text-slate-500'}>
                    {isAvailable && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                    {isAvailable ? 'Connected' : 'Unavailable'}
                  </span>
                  {isAvailable && <span className="text-slate-500 text-[10px]">Telemetry Log</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

