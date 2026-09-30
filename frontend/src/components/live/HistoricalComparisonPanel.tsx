import React from 'react';
import { History, ChevronRight } from 'lucide-react';
import type { HistoricalMatchItem } from '../../types/live';
import { Badge } from '../common/Badge';
import { useNavigate } from 'react-router-dom';

interface HistoricalComparisonPanelProps {
  matches: HistoricalMatchItem[] | undefined;
}

export const HistoricalComparisonPanel: React.FC<HistoricalComparisonPanelProps> = ({ matches }) => {
  const navigate = useNavigate();

  if (!matches || matches.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 text-xs text-center space-y-2 shadow-xs">
        <div className="text-slate-700 font-extrabold">No Sufficient Historical Comparison Available</div>
        <p className="text-slate-600 text-xs font-medium">
          No offset wells in the regional database recorded incident hazards at the current depth interval.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 text-xs shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 font-extrabold text-[#0F2C59] uppercase tracking-wider text-xs">
          <History size={18} className="text-[#0F2C59]" />
          <span>Historical Offset Incident Evidence ({matches.length})</span>
        </div>

        <button
          onClick={() => navigate('/historical')}
          className="inline-flex items-center gap-1 text-xs text-[#0F2C59] hover:text-blue-700 font-extrabold"
        >
          <span>Open Historical Module</span>
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="space-y-3">
        {matches.map((m) => (
          <div
            key={m.incident_id}
            onClick={() => navigate('/historical')}
            className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 cursor-pointer hover:border-slate-300 transition-colors shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900">{m.hazard_type}</span>
                <span className="text-xs text-[#0F2C59] font-bold">• Well {m.well_id}</span>
              </div>
              <Badge variant="warning" size="sm">
                {m.npt_hours}h NPT LOSS
              </Badge>
            </div>

            <div className="text-xs text-slate-800 font-medium space-y-1">
              <div>Relevance Evidence: <strong className="text-amber-900 font-extrabold">{m.relevance}</strong></div>
              <div className="text-xs text-slate-600">Mitigation Applied: {m.mitigation_applied}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

