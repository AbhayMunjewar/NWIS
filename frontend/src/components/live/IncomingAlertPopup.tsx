import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { useCurrentWell } from '../../lib/wellContext';
import {
  fetchPendingEscalationsApi,
  acknowledgeEscalationApi,
  submitAiReviewApi
} from '../../lib/api';
import {
  AlertTriangle, Bot, CheckCircle2, X, Zap, Bell,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface IncomingAlertPopupProps {
  wellId: string;
}

export const IncomingAlertPopup: React.FC<IncomingAlertPopupProps> = ({ wellId }) => {
  const { token } = useAuth();
  const { currentWell } = useCurrentWell();
  const navigate = useNavigate();

  const [pendingAlerts, setPendingAlerts] = useState<any[]>([]);
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(new Set());
  const [aiSentIds, setAiSentIds] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState(true);
  const [lastPollCount, setLastPollCount] = useState(0);
  const [isNewAlert, setIsNewAlert] = useState(false);

  const activeWellId = wellId || currentWell?.wellId || 'DUL_92';

  // Poll for pending escalations every 10 seconds
  useEffect(() => {
    const poll = async () => {
      const result = await fetchPendingEscalationsApi(activeWellId, token || undefined);
      const escalations = result.escalations || [];
      setPendingAlerts(escalations);

      // Flash new alert animation if count increased
      if (escalations.length > lastPollCount && lastPollCount > 0) {
        setIsNewAlert(true);
        setTimeout(() => setIsNewAlert(false), 3000);
      }
      setLastPollCount(escalations.length);
    };

    poll(); // initial
    const interval = setInterval(poll, 10000);
    return () => clearInterval(interval);
  }, [activeWellId, token, lastPollCount]);

  const handleAcknowledge = async (escalationId: string) => {
    await acknowledgeEscalationApi(activeWellId, escalationId, token || undefined);
    setAcknowledgedIds(prev => new Set([...prev, escalationId]));
    // Remove from pending after short delay for visual feedback
    setTimeout(() => {
      setPendingAlerts(prev => prev.filter(a => a.escalation_id !== escalationId));
      setDismissedIds(prev => new Set([...prev, escalationId]));
    }, 1500);
  };

  const handleAiSolution = async (esc: any) => {
    const query = `Analyze the escalated risk: "${esc.description}" (${esc.alert_type}, Severity: ${esc.severity}) for well ${activeWellId}. Provide historical evidence, root cause analysis, and recommended mitigation.`;
    await submitAiReviewApi(activeWellId, esc.escalation_id, query, token || undefined);
    setAiSentIds(prev => new Set([...prev, esc.escalation_id]));

    // Also acknowledge it
    await acknowledgeEscalationApi(activeWellId, esc.escalation_id, token || undefined);
    setAcknowledgedIds(prev => new Set([...prev, esc.escalation_id]));

    // Navigate to AI assistant
    sessionStorage.setItem('pending_ai_question', query);
    navigate('/assistant');
  };

  const handleDismiss = (escalationId: string) => {
    setDismissedIds(prev => new Set([...prev, escalationId]));
  };

  // Filter out dismissed alerts
  const visibleAlerts = pendingAlerts.filter(a =>
    !dismissedIds.has(a.escalation_id) && !acknowledgedIds.has(a.escalation_id)
  );

  if (visibleAlerts.length === 0) return null;

  return (
    <div
      className={`bg-gradient-to-r from-rose-50 to-amber-50 border-2 rounded-2xl shadow-lg overflow-hidden transition-all duration-500 ${
        isNewAlert ? 'border-rose-500 ring-4 ring-rose-200 animate-pulse' : 'border-rose-300'
      }`}
    >
      {/* Header Bar */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-rose-600 to-rose-700 text-white hover:from-rose-700 hover:to-rose-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Zap size={18} />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-400" />
          </div>
          <span className="font-extrabold text-sm tracking-wide">
            INCOMING RISK ALERT FROM OPERATOR
          </span>
          <span className="px-2 py-0.5 bg-white/20 rounded-lg text-[10px] font-extrabold">
            {visibleAlerts.length} PENDING
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Bell size={14} className="opacity-80" />
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {/* Alert Cards */}
      {expanded && (
        <div className="p-4 space-y-3">
          {visibleAlerts.map((esc) => {
            const isAck = acknowledgedIds.has(esc.escalation_id);
            const isAiSent = aiSentIds.has(esc.escalation_id);

            return (
              <div
                key={esc.escalation_id}
                className={`relative bg-white border rounded-xl p-4 shadow-sm transition-all duration-300 ${
                  isAck
                    ? 'border-emerald-300 bg-emerald-50'
                    : esc.severity === 'CRITICAL'
                      ? 'border-rose-300 shadow-rose-100'
                      : 'border-amber-300 shadow-amber-100'
                }`}
              >
                {/* Dismiss X */}
                <button
                  onClick={() => handleDismiss(esc.escalation_id)}
                  className="absolute top-2.5 right-2.5 p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X size={13} />
                </button>

                {/* Alert Info */}
                <div className="space-y-2.5 pr-6">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle
                      size={16}
                      className={esc.severity === 'CRITICAL' ? 'text-rose-600' : 'text-amber-600'}
                    />
                    <span className="font-extrabold text-slate-900 text-sm">
                      {esc.alert_type}
                    </span>
                    <Badge
                      variant={esc.severity === 'CRITICAL' ? 'full' : 'use'}
                      size="sm"
                    >
                      {esc.severity}
                    </Badge>
                  </div>

                  {/* Rich Structured Alert Details */}
                  {(() => {
                    const lines = (esc.description || '').split('\n');
                    const titleLine = lines[0] || '';
                    const signalsLine = lines.find((l: string) => l.startsWith('Signals:'));
                    const recommendedLine = lines.find((l: string) => l.startsWith('Recommended:'));
                    const evidenceLine = lines.find((l: string) => l.startsWith('Evidence:'));
                    const methodLine = lines.find((l: string) => l.startsWith('Method:'));
                    const leadLine = lines.find((l: string) => l.startsWith('Lead:'));

                    const hasRichData = signalsLine || recommendedLine;

                    if (!hasRichData) {
                      return (
                        <p className="text-xs text-slate-700 font-medium leading-relaxed">
                          {esc.description}
                        </p>
                      );
                    }

                    const signals = signalsLine
                      ? signalsLine.replace('Signals: ', '').split(' | ')
                      : [];

                    return (
                      <div className="space-y-2.5">
                        {/* Title */}
                        <p className="text-xs text-slate-800 font-bold leading-relaxed">
                          {titleLine}
                        </p>

                        {/* Observed Signals */}
                        {signals.length > 0 && (
                          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 space-y-1.5">
                            <div className="text-[10px] font-extrabold uppercase tracking-wider text-rose-800">
                              Observed Telemetry Signals
                            </div>
                            <div className="grid grid-cols-1 gap-1">
                              {signals.map((sig: string, i: number) => (
                                <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                                  <span className="text-rose-600 font-bold">●</span>
                                  <span>{sig.trim()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Recommended Action */}
                        {recommendedLine && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                            <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 mb-1">
                              💡 Recommended Mitigation
                            </div>
                            <p className="text-xs font-bold text-emerald-950">
                              {recommendedLine.replace('Recommended: ', '')}
                            </p>
                          </div>
                        )}

                        {/* Evidence & Method */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {evidenceLine && (
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                              <div className="text-[10px] font-extrabold uppercase text-indigo-800 mb-0.5">Historical Evidence</div>
                              <div className="text-xs font-medium text-slate-800">{evidenceLine.replace('Evidence: ', '')}</div>
                            </div>
                          )}
                          {methodLine && (
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                              <div className="text-[10px] font-extrabold uppercase text-[#0F2C59] mb-0.5">Detection Method</div>
                              <div className="text-xs font-medium text-slate-800">{methodLine.replace('Method: ', '')}</div>
                            </div>
                          )}
                        </div>

                        {/* Lead Info */}
                        {leadLine && (
                          <div className="text-[10px] text-slate-600 font-semibold bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 inline-block">
                            📡 {leadLine}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <div className="flex items-center gap-4 text-[10px] text-slate-500 font-semibold">
                    <span>
                      Escalated by: <strong className="text-slate-800">{esc.escalated_by}</strong>
                    </span>
                    <span>
                      {new Date(esc.escalated_at).toLocaleString()}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2.5 pt-1">
                    {isAck ? (
                      <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                        <CheckCircle2 size={14} />
                        Acknowledged
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAcknowledge(esc.escalation_id)}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg border border-slate-300 flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <CheckCircle2 size={13} />
                        Acknowledge
                      </button>
                    )}

                    {isAiSent ? (
                      <span className="flex items-center gap-1.5 text-xs text-purple-700 font-bold">
                        <Bot size={14} />
                        Sent to AI RAG
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAiSolution(esc)}
                        className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Bot size={13} />
                        Get AI Solution
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
