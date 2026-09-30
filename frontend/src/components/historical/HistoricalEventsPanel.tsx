import React from 'react';
import type { HistoricalEvent } from '../../types/historical';
import { AlertTriangle, FileText, CheckCircle } from 'lucide-react';

interface Props {
  events: HistoricalEvent[];
  onSelectWell: (wellId: string) => void;
}

export const HistoricalEventsPanel: React.FC<Props> = ({ events, onSelectWell }) => {
  if (events.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-600 shadow-xs">
        <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-2 opacity-80" />
        <h3 className="text-sm font-extrabold text-[#0F2C59]">No historical incidents found</h3>
        <p className="text-xs text-slate-600 font-semibold mt-1">No recorded hazards match selected filter parameters.</p>
      </div>
    );
  }

  const getSeverityStyle = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-950 border-rose-300';
      case 'HIGH':
        return 'bg-amber-100 text-amber-950 border-amber-300';
      default:
        return 'bg-blue-100 text-blue-950 border-blue-300';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <h3 className="text-sm font-extrabold text-[#0F2C59]">Historical Operational Incidents & Hazards Database</h3>
          <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 border border-slate-300 text-slate-800 font-extrabold">
            {events.length} Incidents
          </span>
        </div>
        <span className="text-xs text-slate-600 font-bold">Traceable WCR Records</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((e) => (
          <div
            key={e.incident_id}
            onClick={() => onSelectWell(e.well_id)}
            className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer group space-y-3"
          >
            {/* Incident Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-slate-600">{e.incident_id}</span>
                  <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded border ${getSeverityStyle(e.severity)}`}>
                    {e.severity}
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 mt-0.5 group-hover:text-[#0F2C59] transition-colors">
                  {e.hazard_type} — {e.well_name}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-slate-900 block">{e.depth_m} m</span>
                <span className="text-[10px] text-slate-600 font-bold">{e.formation}</span>
              </div>
            </div>

            {/* Incident Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-600 text-[10px] font-extrabold block uppercase tracking-wider">Non-Productive Time</span>
                <strong className="text-rose-700 font-black">{e.npt_hours} hrs NPT</strong>
              </div>
              <div>
                <span className="text-slate-600 text-[10px] font-extrabold block uppercase tracking-wider">Est. Financial Impact</span>
                <strong className="text-amber-800 font-black">₹{(e.cost_loss_inr / 100000).toFixed(1)} Lakhs</strong>
              </div>
            </div>

            {/* Root Cause & Mitigation */}
            <div className="space-y-1.5 text-xs text-slate-800 font-medium">
              <div>
                <span className="font-extrabold text-slate-700 text-[11px] block">Root Cause:</span>
                <p className="line-clamp-2 text-slate-800">{e.root_cause}</p>
              </div>
              <div>
                <span className="font-extrabold text-emerald-800 text-[11px] block mt-1">Mitigation Applied:</span>
                <p className="line-clamp-2 text-emerald-900 font-semibold">{e.mitigation_applied}</p>
              </div>
            </div>

            {/* Footer Source Reference */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-600 font-bold">
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3 text-slate-500" />
                Doc: {e.source_document}
              </span>
              <span className="text-[#0F2C59] group-hover:underline font-extrabold">Inspect Well Evidence →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
