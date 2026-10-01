import React, { useEffect, useState, useCallback } from 'react';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useCurrentWell } from '../lib/wellContext';
import { getDashboardPermission } from '../lib/rbac';
import { LiveWellHeader } from '../components/live/LiveWellHeader';
import { StreamStatusPanel } from '../components/live/StreamStatusPanel';
import { DrillingParameterGrid } from '../components/live/DrillingParameterGrid';
import { LiveTrendChart } from '../components/live/LiveTrendChart';
import { FormationContextPanel } from '../components/live/FormationContextPanel';
import { AbnormalPatternPanel } from '../components/live/AbnormalPatternPanel';
import { LiveAlertPanel } from '../components/live/LiveAlertPanel';
import { HistoricalComparisonPanel } from '../components/live/HistoricalComparisonPanel';
import { EarlyWarningBanner } from '../components/live/EarlyWarningBanner';
import { IncomingAlertPopup } from '../components/live/IncomingAlertPopup';
import { DailyDrillReportButton } from '../components/live/DailyDrillReportButton';
import type { LiveCurrentResponse } from '../types/live';

export const LiveDrillingDashboard: React.FC = () => {
  const { user } = useAuth();
  const { currentWell, selectWell } = useCurrentWell();
  const permLevel = getDashboardPermission(user?.roleCode, 'live');
  const isReadOnly = permLevel === 'VIEW';
  const roleCode = user?.roleCode || 'DRILLING_ENGINEER';

  // State
  const [data, setData] = useState<LiveCurrentResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mgmtExpanded, setMgmtExpanded] = useState<boolean>(false);

  const activeWellId = currentWell?.wellId || 'DUL_92';

  // Fetch Live Current Telemetry Summary
  const fetchLiveSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/live/current?well_id=${activeWellId}&role_code=${roleCode}`);
      if (!resp.ok) {
        throw new Error(`Live telemetry service returned HTTP error ${resp.status}`);
      }
      const json: LiveCurrentResponse = await resp.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Failed to load live drilling telemetry');
    } finally {
      setLoading(false);
    }
  }, [activeWellId, roleCode]);

  useEffect(() => {
    fetchLiveSummary();
  }, [fetchLiveSummary]);

  const handleAlertAck = (alertId: string) => {
    if (!data) return;
    setData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        active_alerts: prev.active_alerts.map(a =>
          a.alert_id === alertId ? { ...a, status: 'ACKNOWLEDGED', acknowledged_by: user?.username } : a
        )
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Persistent Live Well Header */}
      <LiveWellHeader
        data={data}
        permLevel={permLevel}
      />

      {/* Offset Well Active Sensor Notice */}
      {currentWell && currentWell.wellId !== 'NHK_61' && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between text-xs text-amber-950 shadow-2xs">
          <div className="flex items-center gap-3">
            <AlertCircle size={18} className="shrink-0 text-amber-700" />
            <span className="font-medium">
              <strong className="text-amber-950 font-extrabold">Active Rig Telemetry Notice:</strong> Real-time sensor streaming is active for current drilling rig (Naharkatiya-61 / NHK-61). Offset inspection wells display historical reference telemetry.
            </span>
          </div>
          <button
            onClick={() => selectWell('NHK_61')}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold shrink-0 ml-3 shadow-2xs"
          >
            Switch to Active Rig (NHK-61)
          </button>
        </div>
      )}

      {/* Read-Only Mode Notice */}
      {isReadOnly && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3 text-xs text-blue-950 shadow-2xs">
          <AlertCircle size={18} className="shrink-0 text-[#0F2C59]" />
          <span className="font-medium">
            <strong className="font-extrabold text-[#0F2C59]">Read-Only Monitoring Mode:</strong> Observing live sensor telemetry streams as <span className="font-extrabold underline">{user?.roleDisplayName}</span>. Operational setpoints and alert overrides restricted.
          </span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-950 flex items-center justify-between shadow-2xs">
          <span>Live telemetry data could not be loaded: {error}</span>
          <button
            onClick={fetchLiveSummary}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-extrabold transition-colors shadow-2xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !data && (
        <div className="py-20 text-center text-xs font-semibold text-slate-600 bg-white rounded-xl border border-slate-200 shadow-xs">
          Loading real-time sensor stream and telemetry calculations...
        </div>
      )}

      {/* Dashboard 3 Layouts Per Role */}
      {data && (
        <div className="space-y-6">
          {/* Stream Status Health Panel */}
          <StreamStatusPanel health={data.stream_health} />

          {/* ML Early Warning Banners (Stuck Pipe / Gas Kick / Mud Loss) */}
          <EarlyWarningBanner wellId={activeWellId} roleCode={roleCode} />

          {/* ------------------------------------------------------------------ */}
          {/* 1. DRILLING ENGINEER LAYOUT (`DRILLING_ENGINEER`)                  */}
          {/* ------------------------------------------------------------------ */}
          {roleCode === 'DRILLING_ENGINEER' && (
            <div className="space-y-6">
              {/* Incoming Operator Alert Popup — polls for new escalations */}
              <IncomingAlertPopup wellId={activeWellId} />

              {/* 8 Drilling Parameter Cards */}
              <DrillingParameterGrid parameters={data.parameters} detailLevel="DETAILED" />

              {/* Time-Series Trend Charts */}
              <LiveTrendChart wellId={activeWellId} />

              {/* Multi-Signal Abnormal Pattern Detection */}
              <AbnormalPatternPanel patterns={data.abnormal_patterns} />

              {/* Live Alerts & Historical Offset Matches */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LiveAlertPanel
                  alerts={data.active_alerts}
                  roleCode={roleCode}
                  onAcknowledgeAlert={handleAlertAck}
                />
                <HistoricalComparisonPanel matches={data.historical_matches} />
              </div>

              {/* Geological Formation Context */}
              <FormationContextPanel
                context={data.formation_context}
              />
            </div>
          )}

          {/* ------------------------------------------------------------------ */}
          {/* 2. GEOLOGIST LAYOUT (`GEOLOGIST`)                                  */}
          {/* ------------------------------------------------------------------ */}
          {roleCode === 'GEOLOGIST' && (
            <div className="space-y-6">
              {/* Prominent Geological Stratigraphy & Log Curves */}
              <FormationContextPanel
                context={data.formation_context}
              />

              {/* Historical Offset Matches */}
              <HistoricalComparisonPanel matches={data.historical_matches} />

              {/* Time-Series Trend Charts */}
              <LiveTrendChart wellId={activeWellId} />

              {/* Supporting Operational Telemetry Context (Depth & ROP only) */}
              <DrillingParameterGrid parameters={data.parameters} detailLevel="CONTEXT" />
            </div>
          )}

          {/* ------------------------------------------------------------------ */}
          {/* 3. ERTMAC OPERATOR LAYOUT (`ERTMAC_OPERATOR`)                       */}
          {/* ------------------------------------------------------------------ */}
          {roleCode === 'ERTMAC_OPERATOR' && (
            <div className="space-y-6">
              {/* Active Alerts with Permission-Checked Acknowledgment */}
              <LiveAlertPanel
                alerts={data.active_alerts}
                roleCode={roleCode}
                onAcknowledgeAlert={handleAlertAck}
              />

              {/* 8 Drilling Parameter Cards */}
              <DrillingParameterGrid parameters={data.parameters} detailLevel="DETAILED" />

              {/* Abnormal Pattern Monitoring */}
              <AbnormalPatternPanel patterns={data.abnormal_patterns} />

              {/* Time-Series Trend Chart */}
              <LiveTrendChart wellId={activeWellId} />

              {/* Formation Context */}
              <FormationContextPanel
                context={data.formation_context}
              />

              {/* Daily Drill Report Generation */}
              <DailyDrillReportButton wellId={activeWellId} />
            </div>
          )}

          {/* ------------------------------------------------------------------ */}
          {/* 4. MANAGEMENT LAYOUT (`MANAGEMENT_SUPERVISOR`)                      */}
          {/* ------------------------------------------------------------------ */}
          {roleCode === 'MANAGEMENT_SUPERVISOR' && (
            <div className="space-y-6">
              {/* Executive Summary Card & Optional Technical Toggle */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 text-xs shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="font-extrabold text-[#0F2C59] text-sm">Executive Real-Time Operations Summary</div>
                  <button
                    onClick={() => setMgmtExpanded(!mgmtExpanded)}
                    className="text-xs text-[#0F2C59] hover:text-blue-700 font-extrabold flex items-center gap-1 transition-colors"
                  >
                    <span>{mgmtExpanded ? 'Collapse Technical Inspection' : 'Expand Technical Inspection'}</span>
                    {mgmtExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>

                <div className="text-slate-800 text-xs font-medium leading-relaxed space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>Active Well: <strong className="text-[#0F2C59] font-extrabold">{data.well_meta.well_name} ({data.well_meta.well_id})</strong> in {data.well_meta.field}</div>
                  <div>Current Depth: <strong className="text-slate-900 font-extrabold">{data.well_meta.current_depth_m} m</strong> • Target: <strong className="font-extrabold">{data.well_meta.target_depth_m} m</strong> ({data.well_meta.depth_progress_pct}% Progress)</div>
                  <div>Overall Operational Risk: <strong className="text-rose-700 font-extrabold">{data.risk_summary.status}</strong> • Critical Alerts: <strong className="text-amber-800 font-extrabold">{data.risk_summary.critical_alert_count} Active</strong></div>
                  <div>Observed Formation: <strong className="text-emerald-800 font-extrabold">{data.formation_context.current_formation}</strong> ({data.formation_context.lithology})</div>
                </div>
              </div>

              {/* Live Alerts Summary */}
              <LiveAlertPanel
                alerts={data.active_alerts}
                roleCode={roleCode}
                onAcknowledgeAlert={handleAlertAck}
              />

              {/* Time-Series Trend Charts */}
              <LiveTrendChart wellId={activeWellId} />

              {/* Optional Expanded Technical Inspection */}
              {mgmtExpanded && (
                <div className="space-y-6 pt-2 border-t border-slate-200 text-xs animate-fadeIn">
                  <div className="font-extrabold text-[#0F2C59] text-sm">Executive Expanded Technical Inspection</div>
                  <DrillingParameterGrid parameters={data.parameters} detailLevel="DETAILED" />
                  <AbnormalPatternPanel patterns={data.abnormal_patterns} />
                  <FormationContextPanel context={data.formation_context} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
