import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Compass, AlertCircle, RefreshCw, Info } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useCurrentWell } from '../lib/wellContext';
import { getDashboardPermission } from '../lib/rbac';
import { fetchOperationsSummaryApi } from '../lib/api';
import { Badge } from '../components/common/Badge';

import { CurrentWellHeader } from '../components/operations/CurrentWellHeader';
import { OperationalMetricGrid } from '../components/operations/OperationalMetricGrid';
import { RiskStatusCard } from '../components/operations/RiskStatusCard';
import { ActiveAlertsPanel } from '../components/operations/ActiveAlertsPanel';
import { FormationContextCard } from '../components/operations/FormationContextCard';
import { NearbyWellSummary } from '../components/operations/NearbyWellSummary';
import { HistoricalEventsPanel } from '../components/operations/HistoricalEventsPanel';
import { OperationalKpiPanel } from '../components/operations/OperationalKpiPanel';
import { QuickActions } from '../components/operations/QuickActions';
import { PreDrillHandoffPanel, ManagementKnowledgeQueuePanel, OperatorEscalationPanel } from '../components/common/WorkflowPanels';

type DetailLevel = 'DETAILED' | 'CONTEXT' | 'SUMMARY';

export const OperationsDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const { currentWell } = useCurrentWell();
  const permLevel = getDashboardPermission(user?.roleCode, 'dashboard');
  const isReadOnly = permLevel === 'VIEW';

  const [summaryData, setSummaryData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const roleCode = user?.roleCode || 'DRILLING_ENGINEER';

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const wellId = currentWell?.wellId || 'DUL_92';
      const data = await fetchOperationsSummaryApi(wellId, token || undefined, roleCode);
      setSummaryData(data);
    } catch (err) {
      console.error('Failed to load operations summary:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentWell?.wellId, token, roleCode]);

  // Define detail levels per role according to Information Detail Model
  const getRoleDetailConfig = (role: string): Record<string, DetailLevel> => {
    switch (role) {
      case 'GEOLOGIST':
        return {
          currentWell: 'DETAILED',
          operationalParameters: 'CONTEXT',
          riskInfo: 'CONTEXT',
          activeAlerts: 'CONTEXT',
          formationContext: 'DETAILED',
          nearbyWells: 'DETAILED',
          historicalEvents: 'DETAILED',
          kpis: 'CONTEXT',
          freshness: 'CONTEXT'
        };
      case 'ERTMAC_OPERATOR':
        return {
          currentWell: 'DETAILED',
          operationalParameters: 'DETAILED',
          riskInfo: 'DETAILED',
          activeAlerts: 'DETAILED',
          formationContext: 'CONTEXT',
          nearbyWells: 'CONTEXT',
          historicalEvents: 'CONTEXT',
          kpis: 'DETAILED',
          freshness: 'DETAILED'
        };
      case 'MANAGEMENT_SUPERVISOR':
        return {
          currentWell: 'SUMMARY',
          operationalParameters: 'SUMMARY',
          riskInfo: 'SUMMARY',
          activeAlerts: 'SUMMARY',
          formationContext: 'SUMMARY',
          nearbyWells: 'SUMMARY',
          historicalEvents: 'SUMMARY',
          kpis: 'SUMMARY',
          freshness: 'SUMMARY'
        };
      case 'DRILLING_ENGINEER':
      default:
        return {
          currentWell: 'DETAILED',
          operationalParameters: 'DETAILED',
          riskInfo: 'DETAILED',
          activeAlerts: 'DETAILED',
          formationContext: 'CONTEXT',
          nearbyWells: 'DETAILED',
          historicalEvents: 'DETAILED',
          kpis: 'DETAILED',
          freshness: 'DETAILED'
        };
    }
  };

  const detailConfig = getRoleDetailConfig(roleCode);

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 border border-blue-300 text-blue-900 shadow-2xs">
              <LayoutDashboard size={22} className="text-blue-900" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Operations / Command Overview
                </h1>
                <Badge variant={permLevel === 'FULL' ? 'full' : permLevel === 'USE' ? 'use' : 'view'}>
                  {permLevel} ACCESS
                </Badge>
              </div>
              <p className="text-sm text-slate-900 font-semibold mt-1 leading-snug">
                Role-aware operational overview and decision-support context for the active well.
              </p>
            </div>
          </div>
        </div>

        {/* Right Header Metadata & Manual Refresh */}
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-800 transition-colors shadow-2xs font-semibold"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-[#0F2C59]' : 'text-slate-500'} />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh Summary'}</span>
          </button>

          <div className="flex items-center gap-2 bg-white border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-mono shadow-2xs">
            <Compass size={14} className="text-[#0F2C59]" />
            <span className="text-slate-500">Context:</span>
            <span className="text-[#0F2C59] font-bold">
              {currentWell ? currentWell.wellName : 'No active well selected'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Read-Only Mode Banner */}
      {isReadOnly && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg flex items-center gap-3 text-xs text-amber-900 shadow-2xs">
          <AlertCircle size={16} className="shrink-0 text-amber-700" />
          <span>
            <strong>Read-Only Access Mode:</strong> Viewing Operations / Command overview as <span className="font-mono font-bold underline">{user?.roleDisplayName}</span>. Operational parameter edits and alert escalation controls are restricted.
          </span>
        </div>
      )}

      {/* 3. Role-Aware Information Hierarchy Banner */}
      <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-xs text-slate-800 shadow-2xs font-medium">
        <div className="flex items-center gap-2">
          <Info size={15} className="text-[#0F2C59] shrink-0" />
          <span>
            {roleCode === 'DRILLING_ENGINEER' && 'Drilling Engineer View (DETAILED Parameters & Engineering Events): Detailed telemetry, stuck-pipe/kick risks, offset well events.'}
            {roleCode === 'GEOLOGIST' && 'Geologist View (DETAILED Formation & Geology): Prominent stratigraphy tops, lithology, and nearby offset logs.'}
            {roleCode === 'ERTMAC_OPERATOR' && 'eRTMAC Operator View (DETAILED Monitoring & Live Parameters): Prominent live telemetry streams, active alerts, and immediate anomalies.'}
            {roleCode === 'MANAGEMENT_SUPERVISOR' && 'Management View (SUMMARY Executive Overview): Prominent high-level well status, major risks, progress KPIs, and basin NPT.'}
          </span>
        </div>
        <Badge variant="neutral" size="sm">{roleCode}</Badge>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-xs font-mono text-slate-400 space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto"></div>
          <span>Loading Authoritative Operational Datasets...</span>
        </div>
      ) : (
        <>
          {/* Render layout prioritized by Role */}

          {/* GEOLOGIST ROLE: Prominently prioritize Formation & Geological Context + Nearby Offset Wells + Historical Events */}
          {roleCode === 'GEOLOGIST' && (
            <div className="space-y-6">
              <CurrentWellHeader
                wellMeta={summaryData?.well_meta}
                latestParams={summaryData?.latest_params}
                freshness={summaryData?.freshness}
                detailLevel={detailConfig.currentWell}
              />

              {/* Step 1: Pre-Drill Analysis & Report Generation */}
              <PreDrillHandoffPanel wellId={currentWell?.wellId} roleCode={roleCode} />
              
              {/* Geological Focus Grid: Geological Context & Nearby Offset Wells */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormationContextCard formationContext={summaryData?.formation_context} />
                <NearbyWellSummary nearbyWells={summaryData?.nearby_wells} />
              </div>

              {/* Historical Incidents & Event Summary Data */}
              <HistoricalEventsPanel events={summaryData?.recent_historical_events} detailLevel={detailConfig.historicalEvents} />

              {/* Supporting Operational Context */}
              <OperationalMetricGrid latestParams={summaryData?.latest_params} detailLevel={detailConfig.operationalParameters} />
            </div>
          )}

          {/* eRTMAC OPERATOR ROLE: Prominently prioritize Active Alerts, Risk Status & Telemetry Grid */}
          {roleCode === 'ERTMAC_OPERATOR' && (
            <div className="space-y-6">
              <CurrentWellHeader
                wellMeta={summaryData?.well_meta}
                latestParams={summaryData?.latest_params}
                freshness={summaryData?.freshness}
                detailLevel={detailConfig.currentWell}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RiskStatusCard riskSummary={summaryData?.risk_summary} detailLevel={detailConfig.riskInfo} />
                <ActiveAlertsPanel alerts={summaryData?.active_alerts} />
              </div>

              <OperationalMetricGrid latestParams={summaryData?.latest_params} detailLevel={detailConfig.operationalParameters} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormationContextCard formationContext={summaryData?.formation_context} />
                <NearbyWellSummary nearbyWells={summaryData?.nearby_wells} />
              </div>

              <HistoricalEventsPanel events={summaryData?.recent_historical_events} />
              <OperatorEscalationPanel roleCode={roleCode} alerts={summaryData?.active_alerts} />
              <OperationalKpiPanel kpiSummary={summaryData?.kpi_summary} />
              <QuickActions />
            </div>
          )}

          {/* MANAGEMENT ROLE: High-Level Executive Overview */}
          {roleCode === 'MANAGEMENT_SUPERVISOR' && (
            <div className="space-y-6">
              <CurrentWellHeader
                wellMeta={summaryData?.well_meta}
                latestParams={summaryData?.latest_params}
                freshness={summaryData?.freshness}
                detailLevel={detailConfig.currentWell}
              />

              {/* Steps 12 - 14: Pending Institutional Knowledge Approval Queue */}
              <ManagementKnowledgeQueuePanel roleCode={roleCode} />

              <OperationalKpiPanel kpiSummary={summaryData?.kpi_summary} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RiskStatusCard riskSummary={summaryData?.risk_summary} detailLevel={detailConfig.riskInfo} />
                <ActiveAlertsPanel alerts={summaryData?.active_alerts} />
              </div>

              <OperationalMetricGrid latestParams={summaryData?.latest_params} detailLevel={detailConfig.operationalParameters} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <NearbyWellSummary nearbyWells={summaryData?.nearby_wells} />
                <HistoricalEventsPanel events={summaryData?.recent_historical_events} />
              </div>

              <QuickActions />
            </div>
          )}

          {/* DRILLING ENGINEER ROLE (DEFAULT): Detailed Engineering View */}
          {roleCode === 'DRILLING_ENGINEER' && (
            <div className="space-y-6">
              <CurrentWellHeader
                wellMeta={summaryData?.well_meta}
                latestParams={summaryData?.latest_params}
                freshness={summaryData?.freshness}
                detailLevel={detailConfig.currentWell}
              />

              {/* Step 1 & 2: Pre-Drill Geological Package Sign-Off */}
              <PreDrillHandoffPanel wellId={currentWell?.wellId} roleCode={roleCode} />

              <OperationalMetricGrid latestParams={summaryData?.latest_params} detailLevel={detailConfig.operationalParameters} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RiskStatusCard riskSummary={summaryData?.risk_summary} detailLevel={detailConfig.riskInfo} />
                <ActiveAlertsPanel alerts={summaryData?.active_alerts} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormationContextCard formationContext={summaryData?.formation_context} />
                <NearbyWellSummary nearbyWells={summaryData?.nearby_wells} />
              </div>

              <HistoricalEventsPanel events={summaryData?.recent_historical_events} />
              <OperationalKpiPanel kpiSummary={summaryData?.kpi_summary} />
              <QuickActions />
            </div>
          )}
        </>
      )}
    </div>
  );
};
