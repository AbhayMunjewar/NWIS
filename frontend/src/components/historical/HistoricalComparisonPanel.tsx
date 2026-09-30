import React from 'react';
import type { HistoricalComparison } from '../../types/historical';
import { Scale, CheckCircle2 } from 'lucide-react';

interface Props {
  comparison: HistoricalComparison | null;
}

export const HistoricalComparisonPanel: React.FC<Props> = ({ comparison }) => {
  if (!comparison) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-600 font-semibold text-center shadow-xs">
        Select a historical well to inspect offset comparison details.
      </div>
    );
  }

  const { current_well, historical_well, relevance_factors, comparison_notes } = comparison;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-[#0F2C59]" />
          <h3 className="text-sm font-extrabold text-[#0F2C59]">Offset Well Evidence Comparison Engine</h3>
        </div>
        <span className="text-xs text-slate-600 font-bold">Evidence-Based Matching</span>
      </div>

      {/* Side by Side Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current Well */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
          <span className="text-[10px] font-extrabold text-[#0F2C59] uppercase tracking-wider block">GLOBAL CURRENT WELL</span>
          <h4 className="text-base font-extrabold text-slate-900">{current_well.well_name}</h4>
          <p className="text-xs text-slate-600 font-bold">ID: {current_well.well_id} • {current_well.field}</p>
          <p className="text-xs text-slate-800 font-semibold">Target Depth: <strong className="text-slate-900 font-black">{current_well.target_depth_m} m</strong></p>
          <span className="inline-block px-2 py-0.5 text-[10px] font-extrabold rounded bg-cyan-100 text-cyan-950 border border-cyan-300">
            {current_well.status}
          </span>
        </div>

        {/* Historical Well */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
          <span className="text-[10px] font-extrabold text-purple-900 uppercase tracking-wider block">COMPARED HISTORICAL OFFSET WELL</span>
          <h4 className="text-base font-extrabold text-slate-900">{historical_well.well_name}</h4>
          <p className="text-xs text-slate-600 font-bold">ID: {historical_well.well_id} • {historical_well.field}</p>
          <p className="text-xs text-slate-800 font-semibold">Target Depth: <strong className="text-slate-900 font-black">{historical_well.target_depth_m} m</strong></p>
          <span className="inline-block px-2 py-0.5 text-[10px] font-extrabold rounded bg-purple-100 text-purple-950 border border-purple-300">
            {historical_well.status}
          </span>
        </div>
      </div>

      {/* Relevance Factors */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
        <h5 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          Traceable Relevance Factors
        </h5>
        <ul className="list-disc list-inside text-slate-800 font-semibold space-y-1">
          {relevance_factors.map((rf, idx) => (
            <li key={idx}>{rf}</li>
          ))}
        </ul>
      </div>

      {/* Engineering Recommendation Note */}
      <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 font-semibold leading-relaxed shadow-2xs">
        <strong>Engineering Comparison Interpretation:</strong> {comparison_notes}
      </div>
    </div>
  );
};
