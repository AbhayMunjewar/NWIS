import React, { useEffect, useState } from 'react';
import { ShieldAlert, AlertTriangle, Zap, Clock, Target, Radio, ChevronDown, ChevronUp, Send, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useCurrentWell } from '../../lib/wellContext';
import { escalateAlertApi } from '../../lib/api';

interface EarlyWarning {
  warning_id: string;
  title: string;
  hazard_type: string;
  well_id: string;
  depth_m: number;
  formation: string;
  severity: string;
  status: string;
  first_detected_timestamp: string;
  last_updated_timestamp: string;
  duration_minutes: number;
  retrospective_lead_distance_m: string;
  lead_time_minutes: number;
  observed_signals: string[];
  method: string;
  historical_evidence: string;
  data_stream_mode: string;
  recommended_action: string;
}

interface EarlyWarningResponse {
  well_id: string;
  active_early_warnings_count: number;
  data_stream_mode: string;
  early_warnings: EarlyWarning[];
}

interface Props {
  wellId: string;
  roleCode?: string;
}

const SEVERITY_STYLES: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  CRITICAL: {
    bg: 'bg-rose-50',
    border: 'border-rose-300',
    text: 'text-rose-950',
    icon: 'text-rose-700'
  },
  HIGH_RISK: {
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    text: 'text-amber-950',
    icon: 'text-amber-700'
  },
  MEDIUM: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-300',
    text: 'text-yellow-950',
    icon: 'text-yellow-700'
  },
  LOW: {
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    text: 'text-blue-950',
    icon: 'text-blue-700'
  }
};

const HAZARD_ICONS: Record<string, React.ReactNode> = {
  'Stuck Pipe': <ShieldAlert size={20} />,
  'Gas Kick': <Zap size={20} />,
  'Mud Loss / Lost Circulation': <AlertTriangle size={20} />
};

export const EarlyWarningBanner: React.FC<Props> = ({ wellId, roleCode }) => {
  const { token } = useAuth();
  const { currentWell } = useCurrentWell();
  const [data, setData] = useState<EarlyWarningResponse | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [escalatingId, setEscalatingId] = useState<string | null>(null);
  const [escalatedIds, setEscalatedIds] = useState<Set<string>>(new Set());

  const activeWellId = wellId || currentWell?.wellId || 'DUL_92';
  const isOperator = roleCode === 'ERTMAC_OPERATOR';

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/ml/early-warnings/${wellId}`)
      .then(r => r.json())
      .then(json => {
        if (!cancelled) {
          setData(json);
          // Auto-expand all warnings by default so solutions are immediately visible
          if (json.early_warnings && json.early_warnings.length > 0) {
            setExpandedIds(new Set(json.early_warnings.map((w: EarlyWarning) => w.warning_id)));
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [wellId]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSendToDe = async (ew: EarlyWarning) => {
    setEscalatingId(ew.warning_id);
    const richDescription = [
      `${ew.title} — ${ew.severity} at ${ew.depth_m}m (${ew.formation})`,
      `Signals: ${ew.observed_signals.join(' | ')}`,
      `Recommended: ${ew.recommended_action}`,
      `Evidence: ${ew.historical_evidence}`,
      `Method: ${ew.method}`,
      `Lead: ${ew.retrospective_lead_distance_m}, Warning Time: ${ew.lead_time_minutes} min`
    ].join('\n');

    await escalateAlertApi(
      activeWellId,
      ew.warning_id,
      ew.title,
      ew.severity === 'HIGH_RISK' ? 'CRITICAL' : ew.severity,
      richDescription,
      token || undefined
    );
    setEscalatedIds(prev => new Set([...prev, ew.warning_id]));
    setEscalatingId(null);
  };

  if (loading || !data || data.active_early_warnings_count === 0) return null;

  return (
    <div className="space-y-4">
      {data.early_warnings.map(ew => {
        const style = SEVERITY_STYLES[ew.severity] || SEVERITY_STYLES.MEDIUM;
        const isExpanded = expandedIds.has(ew.warning_id);
        const icon = HAZARD_ICONS[ew.hazard_type] || <AlertTriangle size={20} />;

        return (
          <div
            key={ew.warning_id}
            className={`${style.bg} ${style.border} border-2 rounded-xl overflow-hidden shadow-xs transition-all duration-200`}
          >
            {/* Banner Main Header & Quick Solution Preview */}
            <div className="p-4 md:p-5 space-y-3.5">
              <div
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() => toggleExpand(ew.warning_id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-white ${style.icon} border border-slate-200 shadow-2xs shrink-0`}>
                    {icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-base font-extrabold tracking-tight ${style.text}`}>
                        ⚠ {ew.title}
                      </span>
                      <span className={`px-2.5 py-0.5 text-xs font-extrabold rounded-md uppercase tracking-wider ${
                        ew.severity === 'CRITICAL'
                          ? 'bg-rose-600 text-white'
                          : ew.severity === 'HIGH_RISK'
                          ? 'bg-amber-600 text-white'
                          : 'bg-yellow-600 text-white'
                      }`}>
                        {ew.severity}
                      </span>
                      <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-md bg-purple-100 text-purple-900 border border-purple-300 uppercase">
                        {ew.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-700 font-medium flex-wrap">
                      <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-slate-200 font-bold">
                        <Target size={14} className="text-[#0F2C59]" />
                        {ew.depth_m}m — {ew.formation}
                      </span>
                      <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-slate-200 font-bold">
                        <Radio size={14} className="text-emerald-700" />
                        Lead: <strong className={style.text}>{ew.retrospective_lead_distance_m}</strong>
                      </span>
                      <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-slate-200 font-bold">
                        <Clock size={14} className="text-blue-700" />
                        {ew.lead_time_minutes} min warning time
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 text-xs font-bold rounded-lg bg-white border border-slate-300 text-slate-800 hidden sm:inline-block shadow-2xs">
                    {ew.data_stream_mode}
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleExpand(ew.warning_id); }}
                    className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    {isExpanded ? <ChevronUp size={20} className="text-slate-700" /> : <ChevronDown size={20} className="text-slate-700" />}
                  </button>
                </div>
              </div>

              {/* Prominent Solution Box (Always visible at header level) */}
              <div className="bg-emerald-100/90 border border-emerald-300 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-950 bg-emerald-200/90 px-2.5 py-0.5 rounded border border-emerald-400">
                      💡 RECOMMENDED MITIGATION / SOLUTION TO AVOID HAZARD
                    </span>
                    <span className="text-[11px] text-emerald-900 font-bold">Automated AI Decision Protocol</span>
                  </div>
                  <p className="text-xs font-extrabold text-emerald-950 mt-1 leading-relaxed">
                    {ew.recommended_action}
                  </p>
                </div>

                {/* Send to DE button — only for Operator */}
                {isOperator && (
                  escalatedIds.has(ew.warning_id) ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-extrabold bg-emerald-200 px-3.5 py-2 rounded-lg border border-emerald-400 shrink-0 shadow-2xs">
                      <CheckCircle2 size={14} />
                      Sent to Drilling Engineer
                    </div>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSendToDe(ew); }}
                      disabled={escalatingId === ew.warning_id}
                      className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-lg shadow-md transition-all shrink-0 disabled:opacity-60"
                    >
                      <Send size={13} />
                      {escalatingId === ew.warning_id ? 'Sending...' : 'Send to Drilling Engineer'}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="px-4 pb-4 space-y-3.5 border-t border-slate-200/80 pt-3.5 bg-white/70">
                {/* Observed Signals */}
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 mb-1.5">Observed Telemetry Signals</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {ew.observed_signals.map((sig, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-800 bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-rose-600 font-bold">●</span>
                        <span>{sig}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detection Method & Historical Evidence */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#0F2C59] mb-1">Detection Method</div>
                    <div className="text-xs font-semibold text-slate-800">{ew.method}</div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-900 mb-1">Historical Evidence</div>
                    <div className="text-xs font-semibold text-slate-800">{ew.historical_evidence}</div>
                  </div>
                </div>

                {/* Data Provenance & Safety Banner */}
                <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-extrabold rounded-lg bg-indigo-100 border border-indigo-300 text-indigo-950">
                      PROVENANCE: {ew.data_stream_mode}
                    </span>
                    <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 border border-slate-300 text-slate-700">
                      DECISION-SUPPORT ONLY • HUMAN-IN-THE-LOOP
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-600">
                    Lead Time: {ew.lead_time_minutes} min | Depth: {ew.depth_m}m
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

