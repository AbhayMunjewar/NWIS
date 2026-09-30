import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { useCurrentWell } from '../../lib/wellContext';
import {
  fetchWorkflowStateApi,
  submitPreDrillReportApi,
  reviewPreDrillReportApi,
  startDrillingApi,
  escalateAlertApi,
  submitAiReviewApi,
  fetchReportHistoryApi
} from '../../lib/api';
import {
  FileText, CheckCircle2, XCircle, Play, AlertTriangle, Bot, ArrowRight,
  Send, Eye, Shield, Clock, ChevronDown, ChevronUp, Layers, Activity,
  Upload, RefreshCw, Zap, Bell
} from 'lucide-react';
import { Badge } from './Badge';
import { PreDrillAnalysisTabs } from '../predrill/PreDrillAnalysisPanels';
import { PreDrillReportPreviewModal } from '../predrill/PreDrillReportPreviewModal';

// =============================================================================
// 1. GEOLOGIST — Pre-Drill Analysis Panel
// =============================================================================
interface PreDrillPanelProps {
  wellId?: string;
  roleCode: string;
}

export const PreDrillHandoffPanel: React.FC<PreDrillPanelProps> = ({ wellId, roleCode }) => {
  const { token } = useAuth();
  const { currentWell } = useCurrentWell();
  const navigate = useNavigate();

  const [wfState, setWfState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [startingDrill, setStartingDrill] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [showReportDetail, setShowReportDetail] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const activeWellId = wellId || currentWell?.wellId || 'DUL_92';

  const loadState = async () => {
    setLoading(true);
    const state = await fetchWorkflowStateApi(activeWellId, token || undefined);
    setWfState(state);
    setLoading(false);
  };

  useEffect(() => {
    loadState();
  }, [activeWellId, token]);

  // -- GEOLOGIST: Submit pre-drill report after preview --
  const handleProceedReportSubmission = async (finalReportData: any) => {
    setSubmitting(true);
    try {
      await submitPreDrillReportApi(
        activeWellId,
        'Geologist (Demo)',
        finalReportData.title || `Pre-Drill Analysis Report — ${currentWell?.wellName || activeWellId}`,
        finalReportData.executive_summary || 'Comprehensive 3-track geologist pre-drill research package.',
        finalReportData.hazards || [],
        finalReportData.directives || [],
        token || undefined
      );

      // Persist to Reports Workspace DB
      try {
        await fetch('http://localhost:8000/api/v1/reports/predrill', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            well_id: activeWellId,
            target_formations: ['Tipam Group', 'Surma Group', 'Barail Group', 'Kopili Formation', 'Sylhet Limestone'],
            expected_hazards: (finalReportData.hazards || []).map((h: any) => `${h.hazard_type} in ${h.formation}`),
            offset_wells: (finalReportData.offset_wells || []).map((w: any) => w.well_id),
            recommended_baselines: {
              safe_mw_min: 1.20,
              safe_mw_max: 1.36,
              torque_threshold_pct: 30
            },
            notes: finalReportData.executive_summary
          })
        });

        // Store the latest new report ID in sessionStorage so Reports Workspace shows NEW tag
        const updatedHistory = await fetchReportHistoryApi(token || undefined);
        if (updatedHistory.length > 0) {
          sessionStorage.setItem('nwis_latest_new_report_id', updatedHistory[0].report_id);
        }
      } catch (err) {
        console.warn('Backend report workspace sync:', err);
      }

      await loadState();
      setShowPreviewModal(false);
    } catch (e) {
      console.error('Error submitting pre-drill report:', e);
    } finally {
      setSubmitting(false);
    }
  };

  // -- DRILLING ENGINEER: Review & approve report --
  const handleReviewReport = async (action: 'APPROVE' | 'REQUEST_REVISION') => {
    setReviewing(true);
    await reviewPreDrillReportApi(activeWellId, action, reviewNotes, token || undefined);
    await loadState();
    setReviewing(false);
    setReviewNotes('');
  };

  // -- DRILLING ENGINEER: Start drilling --
  const handleStartDrilling = async () => {
    setStartingDrill(true);
    await startDrillingApi(activeWellId, token || undefined);
    await loadState();
    setStartingDrill(false);
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-48 mb-3"></div>
        <div className="h-3 bg-slate-100 rounded w-72"></div>
      </div>
    );
  }

  const phase = wfState?.phase || 'PRE_DRILL';
  const report = wfState?.pre_drill_report;

  // ---- Phase-aware rendering based on role ----

  // GEOLOGIST VIEW: Show report generation controls
  if (roleCode === 'GEOLOGIST') {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Step 1 — Pre-Drill Analysis & Report</h3>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Analyze target well, offset wells, formations, and historical events before drilling begins
              </p>
            </div>
          </div>
          <Badge variant={phase === 'PRE_DRILL' ? 'view' : phase === 'REPORT_SUBMITTED' ? 'use' : 'full'} size="sm">
            {phase === 'PRE_DRILL' ? 'PENDING' : phase === 'REPORT_SUBMITTED' ? 'SUBMITTED' : phase === 'REPORT_APPROVED' ? 'APPROVED' : phase}
          </Badge>
        </div>

        {/* Workflow Progress Steps */}
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
          <span className={`px-2.5 py-1 rounded-lg border ${phase !== 'PRE_DRILL' ? 'bg-emerald-100 border-emerald-300 text-emerald-900' : 'bg-blue-100 border-blue-300 text-blue-900 animate-pulse'}`}>
            1. Analyze
          </span>
          <ArrowRight size={12} className="text-slate-400" />
          <span className={`px-2.5 py-1 rounded-lg border ${report ? 'bg-emerald-100 border-emerald-300 text-emerald-900' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
            2. Generate Report
          </span>
          <ArrowRight size={12} className="text-slate-400" />
          <span className={`px-2.5 py-1 rounded-lg border ${phase === 'REPORT_SUBMITTED' ? 'bg-amber-100 border-amber-300 text-amber-900 animate-pulse' : report?.status === 'APPROVED' ? 'bg-emerald-100 border-emerald-300 text-emerald-900' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
            3. Awaiting DE Review
          </span>
          <ArrowRight size={12} className="text-slate-400" />
          <span className={`px-2.5 py-1 rounded-lg border ${report?.status === 'APPROVED' ? 'bg-emerald-100 border-emerald-300 text-emerald-900' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
            4. Approved ✓
          </span>
        </div>

        {/* Pre-drill not started */}
        {phase === 'PRE_DRILL' && (
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5">
              <p className="text-xs text-blue-900 font-medium leading-relaxed">
                As the assigned <strong>Geologist</strong>, complete the 3-track pre-drill analysis for
                <strong> {currentWell?.wellName || activeWellId}</strong>: review GIS nearby wells, historical events, and geological data. Once all tracks are reviewed, submit the report.
              </p>
            </div>

            {/* Toggle Analysis Panel */}
            <button
              onClick={() => setShowAnalysis(!showAnalysis)}
              className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-extrabold text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Layers size={14} className="text-cyan-700" />
                Pre-Drill Research Panel — 3 Analysis Tracks
              </span>
              <div className="flex items-center gap-2">
                {analysisComplete && <Badge variant="full" size="sm">ALL REVIEWED</Badge>}
                {showAnalysis ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </button>

            {showAnalysis && (
              <PreDrillAnalysisTabs
                wellId={activeWellId}
                onAllComplete={() => setAnalysisComplete(true)}
              />
            )}

            <button
              onClick={() => setShowPreviewModal(true)}
              disabled={submitting}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Upload size={14} />
              <span>Preview & Submit Pre-Drill Analysis Package</span>
            </button>
          </div>
        )}

        {/* Pre-Drill Report Official Preview Modal */}
        {showPreviewModal && (
          <PreDrillReportPreviewModal
            wellId={activeWellId}
            wellName={currentWell?.wellName || activeWellId}
            onClose={() => setShowPreviewModal(false)}
            onProceedSubmit={handleProceedReportSubmission}
          />
        )}

        {/* Report submitted — waiting for DE review */}
        {report && (
          <div className="space-y-3">
            <button
              onClick={() => setShowReportDetail(!showReportDetail)}
              className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-bold text-slate-900 hover:bg-slate-100 transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-emerald-700" />
                <span>{report.title || 'Pre-Drill Analysis Report'}</span>
                <Badge variant={report.status === 'APPROVED' ? 'full' : report.status === 'SUBMITTED' ? 'use' : 'view'} size="sm">
                  {report.status}
                </Badge>
              </div>
              {showReportDetail ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showReportDetail && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 font-bold text-[10px] uppercase">Report ID</span>
                    <div className="font-extrabold text-slate-900">{report.report_id}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold text-[10px] uppercase">Submitted By</span>
                    <div className="font-extrabold text-slate-900">{report.generated_by}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold text-[10px] uppercase">Submitted At</span>
                    <div className="font-extrabold text-slate-900">{new Date(report.submitted_at).toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold text-[10px] uppercase">Recipient</span>
                    <div className="font-extrabold text-slate-900">Drilling Engineer</div>
                  </div>
                </div>

                {report.identified_hazards && (
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Identified Hazards</div>
                    <div className="space-y-1.5">
                      {report.identified_hazards.map((h: any, i: number) => (
                        <div key={i} className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs">
                          <div>
                            <span className="font-extrabold text-slate-900">{h.hazard_type}</span>
                            <span className="text-slate-600 ml-2">in {h.formation} ({h.depth_range})</span>
                          </div>
                          <Badge variant={h.severity === 'CRITICAL' ? 'full' : 'use'} size="sm">{h.severity}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {report.recommendations && (
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Recommendations</div>
                    <ul className="space-y-1">
                      {report.recommendations.map((r: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-slate-700 font-medium">
                          <CheckCircle2 size={12} className="text-emerald-600 mt-0.5 shrink-0" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {report.status === 'SUBMITTED' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900 flex items-center gap-2">
                    <Clock size={14} className="text-amber-700 shrink-0" />
                    <span className="font-bold">Awaiting review by the Drilling Engineer. Report has been delivered to their dashboard.</span>
                  </div>
                )}

                {report.status === 'APPROVED' && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-700 shrink-0" />
                    <span className="font-bold">Report approved by {report.reviewed_by} on {report.reviewed_at ? new Date(report.reviewed_at).toLocaleString() : '—'}. Drilling operations authorized.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // DRILLING ENGINEER VIEW: Show incoming report, review controls, and drill start
  if (roleCode === 'DRILLING_ENGINEER') {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 border border-blue-300 text-blue-900">
              <Shield size={18} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Workflow — Pre-Drill Report & Drilling Authorization</h3>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Review geological analysis, approve, and authorize live drilling operations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadState} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
              <RefreshCw size={13} className="text-slate-500" />
            </button>
            <Badge variant={phase === 'DRILLING_ACTIVE' ? 'full' : phase === 'REPORT_APPROVED' ? 'use' : report ? 'view' : 'neutral'} size="sm">
              {phase === 'PRE_DRILL' ? 'AWAITING REPORT' : phase === 'REPORT_SUBMITTED' ? 'REVIEW REQUIRED' : phase === 'REPORT_APPROVED' ? 'APPROVED' : phase === 'DRILLING_ACTIVE' ? 'DRILLING ACTIVE' : phase}
            </Badge>
          </div>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider flex-wrap">
          <span className={`px-2 py-1 rounded-lg border ${report ? 'bg-emerald-100 border-emerald-300 text-emerald-900' : 'bg-amber-100 border-amber-300 text-amber-900 animate-pulse'}`}>
            1. Geologist Report
          </span>
          <ArrowRight size={10} className="text-slate-400" />
          <span className={`px-2 py-1 rounded-lg border ${report?.status === 'APPROVED' ? 'bg-emerald-100 border-emerald-300 text-emerald-900' : report?.status === 'SUBMITTED' ? 'bg-blue-100 border-blue-300 text-blue-900 animate-pulse' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
            2. DE Review
          </span>
          <ArrowRight size={10} className="text-slate-400" />
          <span className={`px-2 py-1 rounded-lg border ${wfState?.drilling_started ? 'bg-emerald-100 border-emerald-300 text-emerald-900' : phase === 'REPORT_APPROVED' ? 'bg-blue-100 border-blue-300 text-blue-900 animate-pulse' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
            3. Start Drilling
          </span>
          <ArrowRight size={10} className="text-slate-400" />
          <span className={`px-2 py-1 rounded-lg border ${wfState?.monitoring_active ? 'bg-emerald-100 border-emerald-300 text-emerald-900' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
            4. Real-Time Monitoring
          </span>
          <ArrowRight size={10} className="text-slate-400" />
          <span className={`px-2 py-1 rounded-lg border ${(wfState?.escalated_alerts?.length || 0) > 0 ? 'bg-rose-100 border-rose-300 text-rose-900' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
            5. Alert Escalation
          </span>
          <ArrowRight size={10} className="text-slate-400" />
          <span className={`px-2 py-1 rounded-lg border ${(wfState?.ai_reviews?.length || 0) > 0 ? 'bg-purple-100 border-purple-300 text-purple-900' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
            6. AI RAG Review
          </span>
        </div>

        {/* Phase: Awaiting geologist report */}
        {phase === 'PRE_DRILL' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-center gap-3">
            <Clock size={16} className="text-amber-700 shrink-0" />
            <div>
              <strong>Awaiting Pre-Drill Analysis Report from Geologist.</strong>
              <p className="mt-0.5 font-medium">The Geologist must complete geological analysis and submit the report before drilling can be authorized.</p>
            </div>
          </div>
        )}

        {/* Phase: Report received — review controls */}
        {report && report.status === 'SUBMITTED' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-blue-900">
              <Bell size={14} className="text-blue-700" />
              <span>Incoming Pre-Drill Analysis Report — Action Required</span>
            </div>

            {/* Report summary card */}
            <div className="bg-white border border-blue-200 rounded-lg p-3.5 space-y-2.5 text-xs shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900">{report.title}</span>
                <Badge variant="use" size="sm">PENDING REVIEW</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div><span className="text-slate-500">From:</span> <strong className="text-slate-900">{report.generated_by}</strong></div>
                <div><span className="text-slate-500">Submitted:</span> <strong className="text-slate-900">{new Date(report.submitted_at).toLocaleString()}</strong></div>
                <div><span className="text-slate-500">Well:</span> <strong className="text-slate-900">{report.well_id}</strong></div>
              </div>

              {/* Hazards summary */}
              {report.identified_hazards && (
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Identified Hazards</div>
                  {report.identified_hazards.map((h: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-2">
                      <AlertTriangle size={12} className={h.severity === 'CRITICAL' ? 'text-rose-600' : 'text-amber-600'} />
                      <span className="font-bold text-slate-900">{h.hazard_type}</span>
                      <span className="text-slate-600">{h.formation} • {h.depth_range}</span>
                      <Badge variant={h.severity === 'CRITICAL' ? 'full' : 'use'} size="sm">{h.severity}</Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommendations */}
              {report.recommendations && (
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Key Recommendations</div>
                  {report.recommendations.slice(0, 3).map((r: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-slate-700 font-medium">
                      <CheckCircle2 size={11} className="text-emerald-600 mt-0.5 shrink-0" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Review controls */}
            <div className="space-y-2">
              <textarea
                value={reviewNotes}
                onChange={e => setReviewNotes(e.target.value)}
                placeholder="Add review notes (optional)..."
                className="w-full border border-blue-200 rounded-lg p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
                rows={2}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleReviewReport('APPROVE')}
                  disabled={reviewing}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 size={14} />
                  {reviewing ? 'Processing...' : 'Approve Report & Authorize Drilling'}
                </button>
                <button
                  onClick={() => handleReviewReport('REQUEST_REVISION')}
                  disabled={reviewing}
                  className="py-2.5 px-4 bg-white hover:bg-slate-50 text-rose-700 font-bold text-xs rounded-lg border border-rose-200 shadow-2xs transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <XCircle size={14} />
                  Request Revision
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Phase: Approved — start drilling */}
        {report?.status === 'APPROVED' && !wfState?.drilling_started && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs text-emerald-900">
              <CheckCircle2 size={14} className="text-emerald-700" />
              <strong>Pre-Drill Report Approved.</strong> Drilling operations are authorized for {currentWell?.wellName || activeWellId}.
            </div>
            <button
              onClick={handleStartDrilling}
              disabled={startingDrill}
              className="w-full py-3 bg-[#0F2C59] hover:bg-[#16385C] text-white font-bold text-sm rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Play size={16} />
              {startingDrill ? 'Initiating Live Drilling...' : 'Start Live Drilling & Engage Real-Time Monitoring'}
            </button>
          </div>
        )}

        {/* Phase: Drilling active */}
        {wfState?.drilling_started && (
          <div className="space-y-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-900">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </div>
                <strong>Live Drilling Active — Real-Time Monitoring Engaged</strong>
              </div>
              <button
                onClick={() => navigate('/live')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Activity size={12} />
                Open Live Dashboard
              </button>
            </div>

            {/* Escalated alerts from Operator */}
            {wfState?.escalated_alerts && wfState.escalated_alerts.length > 0 && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-rose-900">
                  <Zap size={14} className="text-rose-700" />
                  <span>Escalated Alerts from eRTMAC Operator ({wfState.escalated_alerts.length})</span>
                </div>
                {wfState.escalated_alerts.map((esc: any, i: number) => (
                  <div key={esc.escalation_id || i} className="bg-white border border-rose-200 rounded-lg p-3 text-xs space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={12} className="text-rose-600" />
                        <span className="font-extrabold text-slate-900">{esc.alert_type || esc.description}</span>
                      </div>
                      <Badge variant={esc.severity === 'CRITICAL' ? 'full' : 'use'} size="sm">{esc.severity}</Badge>
                    </div>
                    <div className="text-slate-600 font-medium">{esc.description}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">Escalated by: <strong className="text-slate-900">{esc.escalated_by}</strong> at {new Date(esc.escalated_at).toLocaleString()}</span>
                      {!esc.ai_reviewed ? (
                        <button
                          onClick={() => {
                            const query = `Analyze the escalated risk: "${esc.description}" (${esc.alert_type}, Severity: ${esc.severity}) for well ${activeWellId}. Provide historical evidence, root cause analysis, and recommended mitigation.`;
                            submitAiReviewApi(activeWellId, esc.escalation_id, query, token || undefined).then(() => {
                              // Navigate to AI assistant with the query
                              sessionStorage.setItem('pending_ai_question', query);
                              navigate('/assistant');
                            });
                          }}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                          <Bot size={12} />
                          Send to AI for Analysis
                        </button>
                      ) : (
                        <span className="text-xs text-purple-700 font-bold flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          Sent to AI RAG
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Audit trail */}
        {wfState?.audit_log && wfState.audit_log.length > 0 && (
          <WorkflowAuditLog auditLog={wfState.audit_log} />
        )}
      </div>
    );
  }

  return null;
};


// =============================================================================
// 2. OPERATOR — Alert Escalation Panel
// =============================================================================
interface OperatorEscalationProps {
  roleCode: string;
  alerts?: any[];
}

export const OperatorEscalationPanel: React.FC<OperatorEscalationProps> = ({ roleCode, alerts }) => {
  const { token } = useAuth();
  const { currentWell } = useCurrentWell();
  const [escalating, setEscalating] = useState<string | null>(null);
  const [escalatedIds, setEscalatedIds] = useState<Set<string>>(new Set());

  if (roleCode !== 'ERTMAC_OPERATOR') return null;

  const activeWellId = currentWell?.wellId || 'DUL_92';
  const activeAlerts = alerts || [];

  const handleEscalate = async (alert: any) => {
    setEscalating(alert.alert_id);
    await escalateAlertApi(
      activeWellId,
      alert.alert_id,
      alert.alert_type || alert.hazard_type,
      alert.severity,
      alert.short_reason || alert.reason || `${alert.alert_type} detected at ${alert.current_depth_m || alert.depth_m}m`,
      token || undefined
    );
    setEscalatedIds(prev => new Set([...prev, alert.alert_id]));
    setEscalating(null);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-rose-100 border border-rose-300 text-rose-900">
            <Bell size={18} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Real-Time Anomaly Escalation</h3>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Detected anomalies can be escalated to the Drilling Engineer for review
            </p>
          </div>
        </div>
        <Badge variant="use" size="sm">OPERATOR WORKFLOW</Badge>
      </div>

      {activeAlerts.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-500 font-medium">
          <Activity size={24} className="mx-auto text-slate-400 mb-2" />
          No active anomalies detected. Real-time monitoring in progress.
        </div>
      ) : (
        <div className="space-y-2.5">
          {activeAlerts.map((alert: any) => {
            const isEscalated = escalatedIds.has(alert.alert_id);
            return (
              <div
                key={alert.alert_id}
                className={`border rounded-xl p-3.5 text-xs space-y-2 shadow-2xs ${
                  isEscalated ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={13} className={alert.severity === 'CRITICAL' ? 'text-rose-600' : 'text-amber-600'} />
                    <span className="font-extrabold text-slate-900">{alert.alert_type || alert.hazard_type}</span>
                  </div>
                  <Badge variant={alert.severity === 'CRITICAL' ? 'full' : alert.severity === 'HIGH' ? 'use' : 'view'} size="sm">
                    {alert.severity}
                  </Badge>
                </div>
                <div className="text-slate-700 font-medium">{alert.short_reason || alert.reason}</div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    Depth: <strong className="text-slate-900">{alert.current_depth_m || alert.depth_m}m</strong> • {alert.formation}
                  </span>
                  {isEscalated ? (
                    <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      Escalated to Drilling Engineer
                    </span>
                  ) : (
                    <button
                      onClick={() => handleEscalate(alert)}
                      disabled={escalating === alert.alert_id}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <Send size={11} />
                      {escalating === alert.alert_id ? 'Escalating...' : 'Escalate to Drilling Engineer'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


// =============================================================================
// 3. MANAGEMENT — Knowledge Queue Panel (existing, kept)
// =============================================================================
interface ManagementKnowledgeQueuePanelProps {
  roleCode: string;
}

export const ManagementKnowledgeQueuePanel: React.FC<ManagementKnowledgeQueuePanelProps> = ({ roleCode }) => {
  if (roleCode !== 'MANAGEMENT_SUPERVISOR') return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-100 border border-amber-300 text-amber-900">
            <Eye size={18} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Management Oversight — Workflow Status</h3>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              High-level view of operational workflow phases and pending approvals
            </p>
          </div>
        </div>
        <Badge variant="view" size="sm">MANAGEMENT VIEW</Badge>
      </div>
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-700 font-medium">
        <div className="flex items-center gap-2 mb-2">
          <Shield size={14} className="text-slate-500" />
          <strong className="text-slate-900">Current Status:</strong> Operational workflow is active. All phases are tracked with full audit trail.
        </div>
        <p>The engineering solution pipeline and knowledge ingestion queue are monitored on the Reports workspace.</p>
      </div>
    </div>
  );
};


// =============================================================================
// 4. Shared — Workflow Audit Log
// =============================================================================
const WorkflowAuditLog: React.FC<{ auditLog: any[] }> = ({ auditLog }) => {
  const [expanded, setExpanded] = useState(false);

  if (!auditLog || auditLog.length === 0) return null;

  const displayLog = expanded ? auditLog : auditLog.slice(-3);

  return (
    <div className="border-t border-slate-200 pt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 hover:text-slate-700 transition-colors"
      >
        <Clock size={11} />
        Workflow Audit Trail ({auditLog.length} entries)
        {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
      </button>
      <div className="space-y-1.5">
        {displayLog.map((entry: any, i: number) => (
          <div key={entry.id || i} className="flex items-start gap-2.5 text-[11px] bg-slate-50 border border-slate-200 rounded-lg p-2.5">
            <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
              entry.action.includes('APPROVED') || entry.action.includes('STARTED') ? 'bg-emerald-500' :
              entry.action.includes('ESCALAT') ? 'bg-rose-500' :
              entry.action.includes('AI') ? 'bg-purple-500' : 'bg-blue-500'
            }`}></div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{entry.action.replace(/_/g, ' ')}</span>
                <span className="text-[10px] text-slate-500">{new Date(entry.timestamp).toLocaleString()}</span>
              </div>
              <div className="text-slate-600 font-medium mt-0.5">{entry.details}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">By: {entry.actor} ({entry.role})</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
