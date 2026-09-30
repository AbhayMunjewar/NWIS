import React, { useState } from 'react';
import type { AlertDetail } from '../../types/risk';
import { X, ShieldAlert, Bot, FileText, Activity, ExternalLink, AlertTriangle, Layers, Clock, CheckCircle } from 'lucide-react';

interface Props {
  detail: AlertDetail | null;
  onClose: () => void;
  roleCode?: string;
  onAcknowledge: (alertId: string) => void;
  onResolve: (alertId: string, note: string) => void;
  onNavigateToLive: (wellId: string) => void;
  onNavigateToGis: (wellId: string) => void;
  onNavigateToAssistant?: () => void;
  canAcknowledge: boolean;
  canResolve: boolean;
}

export const AlertDetailDrawer: React.FC<Props> = ({
  detail,
  onClose,
  onAcknowledge,
  onResolve,
  onNavigateToLive,
  onNavigateToGis,
  onNavigateToAssistant,
  canAcknowledge,
  canResolve
}) => {
  const [resolutionNote, setResolutionNote] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [_aiCopied, _setAiCopied] = useState(false);

  if (!detail) return null;

  const { alert, trigger_condition, observed_parameters, evidence_layers, historical_context: _historical_context, source_traceability, audit_history } = detail;

  const handleAskAI = () => {
    const aiQuestion = `Explain the active ${alert.alert_type} on well ${alert.well_name} (${alert.well_id}) at depth ${alert.current_depth_m}m in ${alert.formation}. Condition: ${trigger_condition}. What are the immediate engineering mitigations and historical evidence?`;
    sessionStorage.setItem('pending_ai_question', aiQuestion);
    onClose();
    if (onNavigateToAssistant) {
      onNavigateToAssistant();
    } else if (typeof window !== 'undefined') {
      window.location.href = '/assistant';
    }
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionNote.trim()) return;
    onResolve(alert.alert_id, resolutionNote);
    setShowResolveModal(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end animate-fade-in">
      <div className="w-full max-w-2xl bg-white border-l border-slate-200 h-full overflow-y-auto flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs text-slate-600">{alert.alert_id}</span>
                <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded border ${alert.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-950 border-rose-300' : 'bg-amber-100 text-amber-950 border-amber-300'}`}>
                  {alert.severity}
                </span>
                <span className="px-2 py-0.5 text-[10px] rounded bg-slate-100 border border-slate-300 text-slate-800 font-extrabold">
                  {alert.status}
                </span>
              </div>
              <h2 className="text-base font-extrabold text-slate-900 mt-0.5">{alert.alert_type}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors border border-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Quick Context Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold">
            <div>
              <span className="text-slate-600 block text-[11px] font-extrabold uppercase">Well</span>
              <strong className="text-slate-900 font-extrabold">{alert.well_name}</strong>
            </div>
            <div>
              <span className="text-slate-600 block text-[11px] font-extrabold uppercase">Depth</span>
              <strong className="text-slate-900 font-extrabold">{alert.current_depth_m} m</strong>
            </div>
            <div>
              <span className="text-slate-600 block text-[11px] font-extrabold uppercase">Formation</span>
              <strong className="text-slate-900 font-extrabold">{alert.formation}</strong>
            </div>
            <div>
              <span className="text-slate-600 block text-[11px] font-extrabold uppercase">Timestamp</span>
              <strong className="text-slate-900 font-extrabold text-[11px]">{new Date(alert.timestamp).toLocaleTimeString()}</strong>
            </div>
          </div>

          {/* Trigger Condition */}
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
            <h4 className="text-xs font-extrabold text-rose-950 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
              Trigger Condition & Short Reason
            </h4>
            <p className="text-xs text-rose-950 font-bold">{alert.short_reason}</p>
            <p className="text-[11px] text-slate-700 mt-1 font-semibold">Condition: {trigger_condition}</p>
          </div>

          {/* Observed Drilling Parameters */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-[#0F2C59] uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-700" />
              Observed Telemetry Parameters
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {observed_parameters.map((p, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-600 block text-[11px] font-bold">{p.name}</span>
                    <strong className="text-slate-900 font-black">{p.value}</strong>
                    <span className="text-slate-600 text-[10px] font-bold ml-1.5">Baseline: {p.baseline}</span>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded border ${p.status.includes('ELEVATED') || p.status.includes('DECREASED') ? 'bg-amber-100 text-amber-950 border-amber-300' : 'bg-slate-100 text-slate-800 border-slate-300'}`}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 7 Evidence Layers Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-[#0F2C59] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-700" />
              Evidence-First Reasoning Breakdown
            </h4>

            <div className="space-y-2 text-xs">
              {/* Layer 1: Observed Data */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <span className="font-extrabold text-[#0F2C59] block mb-1 text-[11px] uppercase tracking-wider">1. Observed Telemetry Data</span>
                <ul className="list-disc list-inside text-slate-800 font-semibold space-y-1">
                  {evidence_layers.observed_data.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Layer 2: Derived Features */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <span className="font-extrabold text-purple-950 block mb-1 text-[11px] uppercase tracking-wider">2. Derived Features</span>
                <ul className="list-disc list-inside text-slate-800 font-semibold space-y-1">
                  {evidence_layers.derived_features.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Layer 3: Anomaly Engine */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <span className="font-extrabold text-amber-950 block mb-1 text-[11px] uppercase tracking-wider">3. Anomaly Detection Output</span>
                <p className="text-slate-900 font-semibold">{evidence_layers.anomaly_output}</p>
              </div>

              {/* Layer 4: Risk Engine Output */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <span className="font-extrabold text-rose-950 block mb-1 text-[11px] uppercase tracking-wider">4. Risk Engine Assessment</span>
                <p className="text-slate-900 font-semibold">{evidence_layers.risk_engine_output}</p>
              </div>

              {/* Layer 5: Engineering Interpretation */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <span className="font-extrabold text-emerald-950 block mb-1 text-[11px] uppercase tracking-wider">5. Human Engineering Interpretation</span>
                <p className="text-slate-900 font-bold">{evidence_layers.engineering_interpretation}</p>
              </div>

              {/* Layer 6: Historical Evidence Matches */}
              {evidence_layers.historical_evidence && evidence_layers.historical_evidence.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <span className="font-extrabold text-blue-950 block mb-1 text-[11px] uppercase tracking-wider">6. Historical Incident Matches</span>
                  {evidence_layers.historical_evidence.map((h, i) => (
                    <div key={i} className="mt-1.5 p-2.5 bg-white border border-slate-200 rounded text-[11px] space-y-1 shadow-2xs font-semibold">
                      <div className="flex justify-between font-extrabold text-slate-900">
                        <span>{h.well_name} — {h.hazard_type}</span>
                        <span className="text-slate-600 font-bold">{h.depth_m} m</span>
                      </div>
                      <p className="text-slate-700">Root Cause: {h.root_cause}</p>
                      <p className="text-emerald-800 font-bold">Mitigation: {h.mitigation_applied}</p>
                      {h.source_document && (
                        <p className="text-slate-600 font-bold text-[10px] flex items-center gap-1">
                          <FileText className="w-3 h-3 text-slate-500" />
                          Source: {h.source_document}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Layer 7: Unavailable Information */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <span className="font-extrabold text-slate-700 block mb-1 text-[11px] uppercase tracking-wider">7. Unavailable Information</span>
                <ul className="list-disc list-inside text-slate-700 font-semibold space-y-1">
                  {evidence_layers.unavailable_information.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Source Document Traceability */}
          {source_traceability && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
              <h4 className="font-extrabold text-[#0F2C59] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-700" />
                Source Document Traceability
              </h4>
              <div className="grid grid-cols-2 gap-2 text-slate-700 font-semibold">
                <div>Source Type: <strong className="text-slate-900 font-bold">{source_traceability.source_type}</strong></div>
                <div>Document: <strong className="text-slate-900 font-bold">{source_traceability.document}</strong></div>
                <div>Section: <strong className="text-slate-900 font-bold">{source_traceability.section}</strong></div>
                <div>Depth Range: <strong className="text-slate-900 font-bold">{source_traceability.depth_range}</strong></div>
              </div>
            </div>
          )}

          {/* Audit Trail */}
          {audit_history && audit_history.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-[#0F2C59] uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                Audit Trail
              </h4>
              <div className="space-y-1.5 text-xs">
                {audit_history.map((log) => (
                  <div key={log.audit_id} className="bg-slate-50 border border-slate-200 p-2.5 rounded text-[11px] flex justify-between font-semibold">
                    <div>
                      <span className="font-extrabold text-slate-900">{log.action}</span>
                      <p className="text-slate-700 mt-0.5">{log.details}</p>
                    </div>
                    <span className="text-slate-600 font-bold text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 sticky bottom-0 space-y-3">
          {/* Quick AI Handoff & Navigation */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleAskAI}
              className="flex-1 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-950 border border-purple-300 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <Bot className="w-4 h-4 text-purple-700" />
              <span>Ask AI About This Risk</span>
            </button>

            <button
              onClick={() => onNavigateToLive(alert.well_id)}
              className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#0F2C59]" />
              Live Drilling
            </button>

            <button
              onClick={() => onNavigateToGis(alert.well_id)}
              className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
              Nearby Wells
            </button>
          </div>

          {/* Action Buttons for Authorized Roles */}
          <div className="flex gap-2">
            {canAcknowledge && alert.status === 'ACTIVE' && (
              <button
                onClick={() => onAcknowledge(alert.alert_id)}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md"
              >
                <CheckCircle className="w-4 h-4" />
                Acknowledge Alert
              </button>
            )}

            {canResolve && alert.status !== 'RESOLVED' && (
              <button
                onClick={() => setShowResolveModal(true)}
                className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md"
              >
                <CheckCircle className="w-4 h-4" />
                Resolve Alert
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Resolution Note Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleResolveSubmit} className="bg-white border border-slate-200 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-extrabold text-slate-900">Resolve Risk Alert {alert.alert_id}</h3>
            <p className="text-xs text-slate-700 font-semibold">
              Provide an engineering resolution note detailing operational actions applied.
            </p>
            <textarea
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="e.g. Glycol spotting pill pumped, mud weight raised to 1.25 g/cc EMW. Hole clean."
              rows={3}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-900 font-semibold placeholder-slate-500 focus:outline-none focus:border-[#0F2C59] focus:bg-white transition-colors"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowResolveModal(false)}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-lg text-xs font-bold shadow-2xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-lg text-xs shadow-md"
              >
                Submit Resolution
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

