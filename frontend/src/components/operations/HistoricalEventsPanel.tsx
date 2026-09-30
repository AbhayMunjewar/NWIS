import React from 'react';
import { History, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../common/Badge';

interface HistoricalEventsPanelProps {
  events: any[];
  detailLevel?: 'DETAILED' | 'CONTEXT' | 'SUMMARY';
}

export const HistoricalEventsPanel: React.FC<HistoricalEventsPanelProps> = ({
  events,
  detailLevel = 'DETAILED'
}) => {
  const navigate = useNavigate();
  const count = events ? events.length : 0;
  const totalNpt = events ? events.reduce((acc, e) => acc + (e.npt_hours || 0), 0) : 0;
  const criticalCount = events ? events.filter(e => e.severity === 'Critical' || e.severity === 'High').length : 0;

  // Management SUMMARY mode: High-level NPT & major incident summary card
  if (detailLevel === 'SUMMARY') {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-[#0F2C59] shrink-0">
            <History size={20} />
          </div>
          <div>
            <div className="font-extrabold text-[#0F2C59] text-sm">Historical Offset Events & NPT Impact Summary</div>
            <div className="text-slate-700 font-medium text-xs mt-0.5">
              Total Recorded NPT: <strong className="text-amber-800 font-extrabold">{totalNpt} hours</strong> • <strong className="text-rose-800 font-extrabold">{criticalCount} Critical/High incidents</strong> recorded across basin
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/historical')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[#0F2C59] font-bold transition-colors text-xs shrink-0"
        >
          <span>Open Historical Module</span>
          <ChevronRight size={14} />
        </button>
      </div>
    );
  }

  // eRTMAC Operator CONTEXT mode: Compact list of major operational incidents
  if (detailLevel === 'CONTEXT') {
    const compactEvents = events ? events.slice(0, 2) : [];

    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-sm font-extrabold text-[#0F2C59] uppercase tracking-wider">
            <History size={18} className="text-[#0F2C59]" />
            <span>Relevant Historical Operational Context</span>
          </div>

          <button
            onClick={() => navigate('/historical')}
            className="text-xs text-[#0F2C59] hover:text-blue-700 font-bold flex items-center gap-1"
          >
            <span>View All ({count})</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="space-y-2 text-xs">
          {compactEvents.map((e, idx) => (
            <div
              key={e.incident_id || idx}
              onClick={() => navigate('/historical')}
              className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between cursor-pointer hover:border-slate-300 shadow-2xs"
            >
              <div>
                <span className="font-extrabold text-slate-900">{e.hazard_type}</span>
                <span className="text-xs text-slate-700 font-medium ml-2">• {e.well_id} ({e.formation}, {e.depth_m}m)</span>
              </div>
              <span className="text-xs text-amber-800 font-extrabold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{e.npt_hours}h NPT</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Engineer / Geologist DETAILED mode: Full incident audit table
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 text-sm font-extrabold text-[#0F2C59] uppercase tracking-wider">
          <History size={18} className="text-[#0F2C59]" />
          <span>Recent Offset Historical Events ({count})</span>
        </div>

        <button
          onClick={() => navigate('/historical')}
          className="text-xs text-[#0F2C59] hover:text-blue-700 font-bold flex items-center gap-1 transition-colors"
        >
          <span>View All in Historical Module</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {!events || events.length === 0 ? (
        <div className="py-6 text-center text-xs font-semibold text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
          No historical events available
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[10px] text-slate-600 uppercase tracking-wider font-extrabold border-b border-slate-200 bg-slate-50">
                <th className="py-2.5 px-3">Incident ID</th>
                <th className="py-2.5 px-3">Well</th>
                <th className="py-2.5 px-3">Formation</th>
                <th className="py-2.5 px-3">Depth</th>
                <th className="py-2.5 px-3">Hazard</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3 text-right">NPT Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {events.map((e, idx) => {
                const sev = e.severity || 'Medium';
                const variant = sev === 'Critical' ? 'critical' : sev === 'High' ? 'warning' : 'use';

                return (
                  <tr
                    key={e.incident_id || idx}
                    onClick={() => navigate('/historical')}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 font-extrabold text-slate-900">{e.incident_id}</td>
                    <td className="py-3 px-3 font-bold text-[#0F2C59]">{e.well_id}</td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{e.formation}</td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{e.depth_m}m</td>
                    <td className="py-3 px-3 font-extrabold text-slate-900">{e.hazard_type}</td>
                    <td className="py-3 px-3">
                      <Badge variant={variant} size="sm">{sev.toUpperCase()}</Badge>
                    </td>
                    <td className="py-3 px-3 text-right font-extrabold text-amber-800">{e.npt_hours}h</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

