import React from 'react';
import { AlertTriangle, CheckCircle2, ExternalLink } from 'lucide-react';
import type { AbnormalPatternItem } from '../../types/live';
import { Badge } from '../common/Badge';
import { useNavigate } from 'react-router-dom';

interface AbnormalPatternPanelProps {
  patterns: AbnormalPatternItem[] | undefined;
}

export const AbnormalPatternPanel: React.FC<AbnormalPatternPanelProps> = ({ patterns }) => {
  const navigate = useNavigate();

  if (!patterns || patterns.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 text-xs text-center space-y-2 shadow-xs">
        <div className="flex items-center justify-center gap-2 text-emerald-800 font-extrabold">
          <CheckCircle2 size={20} />
          <span>No Abnormal Drilling Patterns Detected</span>
        </div>
        <p className="text-slate-600 text-xs font-medium">
          Multi-signal sensor telemetry indicates steady drilling performance within normal parameters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 text-xs shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 font-extrabold text-[#0F2C59] uppercase tracking-wider text-xs">
          <AlertTriangle size={18} className="text-rose-600" />
          <span>Multi-Signal Abnormal Pattern Detection ({patterns.length})</span>
        </div>
        <Badge variant="warning" size="sm">MULTI-SIGNAL DETECTED</Badge>
      </div>

      <div className="space-y-3">
        {patterns.map((pat) => (
          <div
            key={pat.pattern_id}
            className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 hover:border-slate-300 transition-colors shadow-2xs"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-sm">{pat.pattern_name}</span>
                <span className="text-xs text-slate-600 font-semibold">({pat.pattern_id})</span>
              </div>
              <Badge variant={pat.severity === 'High' ? 'critical' : 'warning'} size="sm">
                {pat.severity.toUpperCase()} SEVERITY
              </Badge>
            </div>

            {/* Evidence Breakdown */}
            <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wider block">Supporting Multi-Signal Evidence</span>
              <div className="space-y-1">
                {pat.evidence.map((ev, idx) => (
                  <div key={idx} className="text-slate-800 text-xs font-medium flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0"></span>
                    <span>{ev}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Implication & AI Assistant Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1 text-xs">
              <div className="text-amber-900 font-bold">
                Implication: <strong className="text-slate-900">{pat.drilling_implication}</strong>
              </div>

              <button
                onClick={() => navigate('/ai-assistant')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-[#0F2C59] text-white font-extrabold transition-colors text-xs shrink-0 shadow-2xs"
              >
                <span>Ask AI About Pattern</span>
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

