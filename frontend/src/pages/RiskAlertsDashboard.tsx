import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useCurrentWell } from '../lib/wellContext';
import { getDashboardPermission } from '../lib/rbac';
import { Badge } from '../components/common/Badge';
import { ShieldAlert, AlertTriangle, Activity, Compass, CheckCircle2, Layers } from 'lucide-react';

import type { RiskSummary, AlertItem, AlertDetail, TimelineEvent, RiskTrends } from '../types/risk';
import {
  fetchRiskSummaryApi,
  fetchAlertsApi,
  fetchAlertDetailApi,
  fetchRiskTimelineApi,
  fetchRiskTrendsApi,
  acknowledgeAlertApi,
  resolveAlertApi,
  fetchWellsApi
} from '../lib/api';

import { RiskOverviewHeader } from '../components/alerts/RiskOverviewHeader';
import { RiskFilterBar } from '../components/alerts/RiskFilterBar';
import { ActiveAlertsTable } from '../components/alerts/ActiveAlertsTable';
import { AlertDetailDrawer } from '../components/alerts/AlertDetailDrawer';
import { RiskTimelinePanel } from '../components/alerts/RiskTimelinePanel';
import { RiskTrendChart } from '../components/alerts/RiskTrendChart';

export const RiskAlertsDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const { currentWell, selectWell } = useCurrentWell();
  const navigate = useNavigate();

  const permLevel = getDashboardPermission(user?.roleCode, 'alerts');
  const userRole = user?.roleCode || 'DRILLING_ENGINEER';

  // Permission checks
  const canAcknowledge = (userRole === 'DRILLING_ENGINEER' || userRole === 'ERTMAC_OPERATOR') && permLevel === 'FULL';
  const canResolve = (userRole === 'DRILLING_ENGINEER' || userRole === 'ERTMAC_OPERATOR') && permLevel === 'FULL';

  // State
  const [summary, setSummary] = useState<RiskSummary | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [alertDetail, setAlertDetail] = useState<AlertDetail | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [trends, setTrends] = useState<RiskTrends | null>(null);
  const [allWells, setAllWells] = useState<{ wellId: string; wellName: string }[]>([]);

  // Filter state
  const [selectedWellFilter, setSelectedWellFilter] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Management expand toggle
  const [showExecutiveTechnicalDetail, setShowExecutiveTechnicalDetail] = useState<boolean>(false);

  // Load wells list
  useEffect(() => {
    fetchWellsApi().then(wList => {
      setAllWells(wList.map(w => ({ wellId: w.wellId, wellName: w.wellName })));
    });
  }, []);

  // Load Risk Summary & Alerts
  const loadRiskData = async () => {
    setLoading(true);
    setError(null);
    try {
      const activeWellId = currentWell ? currentWell.wellId : 'DUL_92';
      const [sumData, alertData, timelineData, trendData] = await Promise.all([
        fetchRiskSummaryApi(selectedWellFilter === 'ALL' ? activeWellId : selectedWellFilter, token || undefined),
        fetchAlertsApi(
          selectedWellFilter === 'ALL' ? undefined : selectedWellFilter,
          selectedSeverity,
          selectedStatus,
          undefined,
          token || undefined
        ),
        fetchRiskTimelineApi(activeWellId, token || undefined),
        fetchRiskTrendsApi(activeWellId, token || undefined)
      ]);

      setSummary(sumData);
      setAlerts(alertData);
      setTimeline(timelineData);
      setTrends(trendData);
    } catch (err: any) {
      console.error('Error loading risk dashboard data:', err);
      setError('Unable to load risk information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRiskData();
  }, [currentWell, selectedWellFilter, selectedSeverity, selectedStatus, token]);

  // Load Alert Detail Drawer
  useEffect(() => {
    if (selectedAlertId) {
      fetchAlertDetailApi(selectedAlertId, token || undefined).then(detail => {
        setAlertDetail(detail);
      });
    } else {
      setAlertDetail(null);
    }
  }, [selectedAlertId, token]);

  // Acknowledge alert handler
  const handleAcknowledgeAlert = async (alertId: string) => {
    if (!canAcknowledge) return;
    try {
      await acknowledgeAlertApi(
        alertId,
        String(user?.id || 'usr_1'),
        user?.fullName || 'Arun Sharma',
        userRole,
        token || undefined
      );

      // Refresh list & detail
      loadRiskData();
      if (selectedAlertId === alertId) {
        const detail = await fetchAlertDetailApi(alertId, token || undefined);
        setAlertDetail(detail);
      }
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  // Resolve alert handler
  const handleResolveAlert = async (alertId: string, note?: string) => {
    if (!canResolve) return;
    try {
      await resolveAlertApi(
        alertId,
        String(user?.id || 'usr_1'),
        user?.fullName || 'Arun Sharma',
        userRole,
        note || 'Operational mitigation applied',
        token || undefined
      );

      // Refresh list & detail
      loadRiskData();
      if (selectedAlertId === alertId) {
        const detail = await fetchAlertDetailApi(alertId, token || undefined);
        setAlertDetail(detail);
      }
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  // Filter search client side
  const filteredAlerts = alerts.filter(a => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.alert_id.toLowerCase().includes(q) ||
      a.well_name.toLowerCase().includes(q) ||
      a.alert_type.toLowerCase().includes(q) ||
      a.formation.toLowerCase().includes(q) ||
      a.short_reason.toLowerCase().includes(q)
    );
  });

  const globalWellId = currentWell ? currentWell.wellId : 'DUL_92';
  const globalWellName = currentWell ? currentWell.wellName : 'Duliajan-92';

  return (
    <div className="space-y-6">
      {/* Loading Indicator bar when fetching */}
      {loading && (
        <div className="h-1 w-full bg-cyan-950 overflow-hidden rounded">
          <div className="h-full bg-cyan-400 animate-pulse w-2/3"></div>
        </div>
      )}

      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-100 border border-rose-300 text-rose-900 shadow-2xs">
              <ShieldAlert size={22} className="text-rose-900" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Risk & Alerts Monitoring
                </h1>
                <Badge variant={permLevel === 'FULL' ? 'full' : permLevel === 'USE' ? 'use' : 'view'}>
                  {permLevel} ACCESS ({userRole})
                </Badge>
              </div>
              <p className="text-sm text-slate-900 font-semibold mt-1 leading-snug">
                Evidence-based drilling risk monitoring, active alerts and historical context
              </p>
            </div>
          </div>
        </div>

        {/* Global Current Well Context */}
        <div className="flex items-center gap-3 bg-white border border-slate-300 px-3.5 py-1.5 rounded-lg text-xs font-mono shadow-2xs">
          <Compass size={14} className="text-[#0F2C59]" />
          <span className="text-slate-500">Global Current Well:</span>
          <span className="text-[#0F2C59] font-bold">
            {globalWellName}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 font-bold border border-slate-200">
            {globalWellId}
          </span>
        </div>
      </div>

      {/* Decision-Support & Non-Autonomous Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-950 flex items-center justify-between gap-3 shadow-2xs font-medium">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-blue-700 flex-shrink-0" />
          <span>
            <strong className="text-blue-900 font-bold">Decision-Support System:</strong> Automated hazard alerts provide evidence-based context. Operational decisions remain with the drilling team. No autonomous rig commands are executed.
          </span>
        </div>
        <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-blue-100 border border-blue-300 text-blue-900 font-bold shrink-0">
          Human-in-the-Loop
        </span>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl text-rose-950 text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-700" />
            <span className="font-bold">{error}</span>
          </div>
          <button
            onClick={loadRiskData}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold transition-all shadow-xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* -------------------------------------------------------------
          ROLE-SPECIFIC DASHBOARD VIEW IMPLEMENTATIONS
      ------------------------------------------------------------- */}

      {/* ROLE 1: GEOLOGIST (VIEW ACCESS - GEOLOGY PRIORITIZED) */}
      {userRole === 'GEOLOGIST' && (
        <div className="space-y-6">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-xs text-purple-950 flex items-center gap-3 shadow-2xs font-medium">
            <Layers className="w-5 h-5 text-purple-700 flex-shrink-0" />
            <div>
              <span className="font-bold text-purple-900">Geological Risk & Formation Context Mode:</span>
              <p className="text-purple-900/90 mt-0.5">
                Prioritizing lithology, stratigraphy intervals, nearby geological hazards, and formation-related abnormal behavior. Operational telemetry is provided as supporting context.
              </p>
            </div>
          </div>

          <RiskOverviewHeader
            summary={summary}
            globalWellName={globalWellName}
            globalWellId={globalWellId}
            roleCode={userRole}
          />

          <RiskFilterBar
            selectedWell={selectedWellFilter}
            setSelectedWell={setSelectedWellFilter}
            selectedSeverity={selectedSeverity}
            setSelectedSeverity={setSelectedSeverity}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onRefresh={loadRiskData}
            allWells={allWells}
          />

          <ActiveAlertsTable
            alerts={filteredAlerts}
            globalWellId={globalWellId}
            roleCode={userRole}
            onSelectAlert={(id) => setSelectedAlertId(id)}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onResolveAlert={(id, n) => handleResolveAlert(id, n)}
            canAcknowledge={false}
            canResolve={false}
          />
        </div>
      )}

      {/* ROLE 2: ERTMAC_OPERATOR (FULL ACCESS - REAL-TIME OPERATIONAL ALERTS) */}
      {userRole === 'ERTMAC_OPERATOR' && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-950 flex items-center gap-3 shadow-2xs font-medium">
            <Activity className="w-5 h-5 text-amber-700 flex-shrink-0" />
            <div>
              <span className="font-bold text-amber-900">Real-Time Operational Alerts Console:</span>
              <p className="text-amber-900/90 mt-0.5">
                Prioritizing active real-time operational alerts, telemetry stream freshness, parameter threshold spikes, and permission-checked alert lifecycle acknowledgment.
              </p>
            </div>
          </div>

          <RiskOverviewHeader
            summary={summary}
            globalWellName={globalWellName}
            globalWellId={globalWellId}
            roleCode={userRole}
          />

          <RiskFilterBar
            selectedWell={selectedWellFilter}
            setSelectedWell={setSelectedWellFilter}
            selectedSeverity={selectedSeverity}
            setSelectedSeverity={setSelectedSeverity}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onRefresh={loadRiskData}
            allWells={allWells}
          />

          <ActiveAlertsTable
            alerts={filteredAlerts}
            globalWellId={globalWellId}
            roleCode={userRole}
            onSelectAlert={(id) => setSelectedAlertId(id)}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onResolveAlert={(id, n) => handleResolveAlert(id, n)}
            canAcknowledge={canAcknowledge}
            canResolve={canResolve}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RiskTimelinePanel timeline={timeline} />
            <RiskTrendChart trends={trends} />
          </div>
        </div>
      )}

      {/* ROLE 3: MANAGEMENT / SUPERVISOR (VIEW ACCESS - EXECUTIVE SUMMARY) */}
      {userRole === 'MANAGEMENT_SUPERVISOR' && (
        <div className="space-y-6">
          <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-4 text-xs text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <span className="font-bold">Executive Management Risk Summary:</span>
                <p className="text-emerald-300/80 mt-0.5">
                  Showing overall risk status, affected wells, and major event summaries. Raw sensor noise is hidden by default.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowExecutiveTechnicalDetail(!showExecutiveTechnicalDetail)}
              className="px-3 py-1.5 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 rounded text-xs font-semibold"
            >
              {showExecutiveTechnicalDetail ? 'Hide Technical Details' : 'Expand Technical Inspection'}
            </button>
          </div>

          <RiskOverviewHeader
            summary={summary}
            globalWellName={globalWellName}
            globalWellId={globalWellId}
            roleCode={userRole}
          />

          <ActiveAlertsTable
            alerts={filteredAlerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH')}
            globalWellId={globalWellId}
            roleCode={userRole}
            onSelectAlert={(id) => setSelectedAlertId(id)}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onResolveAlert={(id, n) => handleResolveAlert(id, n)}
            canAcknowledge={false}
            canResolve={false}
          />

          {showExecutiveTechnicalDetail && (
            <div className="space-y-6 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-slate-200">Detailed Technical Telemetry & Timeline Inspection</h3>
              <RiskFilterBar
                selectedWell={selectedWellFilter}
                setSelectedWell={setSelectedWellFilter}
                selectedSeverity={selectedSeverity}
                setSelectedSeverity={setSelectedSeverity}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onRefresh={loadRiskData}
                allWells={allWells}
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RiskTimelinePanel timeline={timeline} />
                <RiskTrendChart trends={trends} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ROLE 4: DRILLING ENGINEER (FULL ACCESS - DETAILED ENGINEERING RISK) */}
      {(userRole === 'DRILLING_ENGINEER' || (!['GEOLOGIST', 'ERTMAC_OPERATOR', 'MANAGEMENT_SUPERVISOR'].includes(userRole))) && (
        <div className="space-y-6">
          <RiskOverviewHeader
            summary={summary}
            globalWellName={globalWellName}
            globalWellId={globalWellId}
            roleCode={userRole}
          />

          <RiskFilterBar
            selectedWell={selectedWellFilter}
            setSelectedWell={setSelectedWellFilter}
            selectedSeverity={selectedSeverity}
            setSelectedSeverity={setSelectedSeverity}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onRefresh={loadRiskData}
            allWells={allWells}
          />

          <ActiveAlertsTable
            alerts={filteredAlerts}
            globalWellId={globalWellId}
            roleCode={userRole}
            onSelectAlert={(id) => setSelectedAlertId(id)}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onResolveAlert={(id, n) => handleResolveAlert(id, n)}
            canAcknowledge={canAcknowledge}
            canResolve={canResolve}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RiskTimelinePanel timeline={timeline} />
            <RiskTrendChart trends={trends} />
          </div>
        </div>
      )}

      {/* Detail Drawer Modal */}
      {selectedAlertId && (
        <AlertDetailDrawer
          detail={alertDetail}
          onClose={() => setSelectedAlertId(null)}
          roleCode={userRole}
          onAcknowledge={handleAcknowledgeAlert}
          onResolve={handleResolveAlert}
          onNavigateToLive={(wId) => {
            if (wId) selectWell(wId);
            navigate('/live');
          }}
          onNavigateToGis={(wId) => {
            if (wId) selectWell(wId);
            navigate('/map');
          }}
          onNavigateToAssistant={() => navigate('/assistant')}
          canAcknowledge={canAcknowledge}
          canResolve={canResolve}
        />
      )}
    </div>
  );
};
