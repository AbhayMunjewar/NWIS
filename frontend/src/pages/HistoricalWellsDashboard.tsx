import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { useCurrentWell } from '../lib/wellContext';
import { getDashboardPermission } from '../lib/rbac';
import { Badge } from '../components/common/Badge';
import { Database, Compass, Search, RefreshCw, AlertTriangle, Layers, Activity, CheckCircle2 } from 'lucide-react';

import type { HistoricalSummary, HistoricalWell, HistoricalEvent, WellDetail } from '../types/historical';
import {
  fetchHistoricalSummaryApi,
  fetchHistoricalWellsApi,
  fetchWellDetailApi,
  fetchHistoricalEventsApi,
  fetchHistoricalComparisonApi
} from '../lib/api';

import { HistoricalWellTable } from '../components/historical/HistoricalWellTable';
import { HistoricalWellDetailModal } from '../components/historical/HistoricalWellDetailModal';
import { HistoricalEventsPanel } from '../components/historical/HistoricalEventsPanel';
import { HistoricalComparisonPanel } from '../components/historical/HistoricalComparisonPanel';

export const HistoricalWellsDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const { currentWell } = useCurrentWell();

  const permLevel = getDashboardPermission(user?.roleCode, 'historical');
  const userRole = user?.roleCode || 'DRILLING_ENGINEER';

  // State
  const [summary, setSummary] = useState<HistoricalSummary | null>(null);
  const [wells, setWells] = useState<HistoricalWell[]>([]);
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [selectedWellId, setSelectedWellId] = useState<string | null>(null);
  const [wellDetail, setWellDetail] = useState<WellDetail | null>(null);
  const [comparisonData, setComparisonData] = useState<any>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedField, setSelectedField] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Management toggle
  const [showTechnicalDetail, setShowTechnicalDetail] = useState<boolean>(false);

  const globalWellId = currentWell ? currentWell.wellId : 'DUL_92';
  const globalWellName = currentWell ? currentWell.wellName : 'Duliajan-92';

  // Auto-open modal for current active well when navigating from Open Historical Context
  useEffect(() => {
    if (globalWellId) {
      setSelectedWellId(globalWellId);
    }
  }, [globalWellId]);

  const loadHistoricalData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumData, wellsData, eventsData, compData] = await Promise.all([
        fetchHistoricalSummaryApi(selectedField === 'ALL' ? undefined : selectedField, token || undefined),
        fetchHistoricalWellsApi(searchQuery, selectedField, selectedStatus, undefined, token || undefined),
        fetchHistoricalEventsApi(undefined, undefined, selectedSeverity, token || undefined),
        fetchHistoricalComparisonApi(globalWellId, globalWellId === 'DUL_92' ? 'DUL_88' : 'DUL_92', token || undefined)
      ]);

      setSummary(sumData);
      setWells(wellsData);
      setEvents(eventsData);
      setComparisonData(compData);
    } catch (err) {
      console.error('Failed to load historical data:', err);
      setError('Unable to load historical data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistoricalData();
  }, [selectedField, selectedStatus, selectedSeverity, globalWellId, token]);

  // Load Well Detail Modal
  useEffect(() => {
    if (selectedWellId) {
      fetchWellDetailApi(selectedWellId, token || undefined).then(setWellDetail);
    } else {
      setWellDetail(null);
    }
  }, [selectedWellId, token]);

  // Client-side search filtering
  const filteredWells = wells.filter(w => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      w.well_id.toLowerCase().includes(q) ||
      w.well_name.toLowerCase().includes(q) ||
      w.field.toLowerCase().includes(q) ||
      w.status.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-100 border border-cyan-300 text-cyan-900 shadow-2xs">
              <Database size={22} className="text-cyan-900" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Historical Wells & Events
                </h1>
                <Badge variant={permLevel === 'FULL' ? 'full' : permLevel === 'USE' ? 'use' : 'view'}>
                  {permLevel} ACCESS ({userRole})
                </Badge>
              </div>
              <p className="text-sm text-slate-900 font-semibold mt-1 leading-snug">
                Explore historical wells, drilling events, formations, trajectories and engineering evidence
              </p>
            </div>
          </div>
        </div>

        {/* Global Current Well Context */}
        <div className="flex items-center gap-3 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-2xs">
          <Compass size={14} className="text-cyan-700" />
          <span className="text-slate-600">Global Current Well:</span>
          <span className="text-slate-900 font-extrabold">
            {globalWellName}
          </span>
          <span className="text-[10px] px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700 font-bold">
            {globalWellId}
          </span>
        </div>
      </div>

      {/* Loading Progress Bar */}
      {loading && (
        <div className="h-1 w-full bg-cyan-100 overflow-hidden rounded-full">
          <div className="h-full bg-cyan-600 animate-pulse w-2/3"></div>
        </div>
      )}

      {/* Error State Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-950 text-xs font-semibold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadHistoricalData}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold shadow-2xs transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Summary Stats Banner */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-xs">
            <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">Historical Wells</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {summary.total_historical_wells}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-xs">
            <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">Drilling Incidents Logged</span>
            <div className="text-2xl font-black text-rose-700 mt-1">
              {summary.total_historical_events}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-xs">
            <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">Proven Reservoir Fields</span>
            <div className="text-2xl font-black text-[#0F2C59] mt-1">
              {summary.fields_count}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-xs">
            <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">Data Provenance</span>
            <div className="text-xs font-black text-emerald-800 mt-2">
              {summary.source_classification}
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Well ID, Name, Field, Status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 font-semibold placeholder-slate-500 focus:outline-none focus:border-[#0F2C59] focus:bg-white transition-colors"
            />
          </div>

          {/* Filter Field */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-slate-700 font-extrabold whitespace-nowrap">Field:</label>
            <select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#0F2C59]"
            >
              <option value="ALL">All Fields</option>
              {summary?.fields_list.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-slate-700 font-extrabold whitespace-nowrap">Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#0F2C59]"
            >
              <option value="ALL">All Statuses</option>
              <option value="Producing">Producing</option>
              <option value="Offset Reference">Offset Reference</option>
              <option value="Active Drilling">Active Drilling</option>
            </select>
          </div>

          {/* Filter Event Severity */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-slate-700 font-extrabold whitespace-nowrap">Incident Severity:</label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#0F2C59]"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
            </select>
          </div>
        </div>

        <button
          onClick={loadHistoricalData}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-colors shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-700" />
          Refresh
        </button>
      </div>

      {/* -------------------------------------------------------------
          ROLE-SPECIFIC DASHBOARD VIEW IMPLEMENTATIONS
      ------------------------------------------------------------- */}

      {/* ROLE 1: GEOLOGIST (FULL ACCESS - GEOLOGY & WELL LOGS PRIORITIZED) */}
      {userRole === 'GEOLOGIST' && (
        <div className="space-y-6">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-xs text-purple-950 flex items-center gap-3 shadow-2xs">
            <Layers className="w-5 h-5 text-purple-700 flex-shrink-0" />
            <div>
              <span className="font-extrabold text-purple-950">Geologist Historical Investigation Mode:</span>
              <p className="text-purple-900 font-semibold mt-0.5">
                Prioritizing stratigraphy formations, lithology correlation, wireline well log curves, and geological incident history. Operational drilling telemetry remains contextual.
              </p>
            </div>
          </div>

          <HistoricalWellTable
            wells={filteredWells}
            globalWellId={globalWellId}
            roleCode={userRole}
            onSelectWell={(id) => setSelectedWellId(id)}
          />

          <HistoricalEventsPanel
            events={events}
            onSelectWell={(id) => setSelectedWellId(id)}
          />
        </div>
      )}

      {/* ROLE 2: ERTMAC_OPERATOR (VIEW ACCESS - OPERATIONAL HISTORICAL CONTEXT) */}
      {userRole === 'ERTMAC_OPERATOR' && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-950 flex items-center gap-3 shadow-2xs">
            <Activity className="w-5 h-5 text-amber-700 flex-shrink-0" />
            <div>
              <span className="font-extrabold text-amber-950">Operator Historical Incident Lessons Console:</span>
              <p className="text-amber-900 font-semibold mt-0.5">
                Prioritizing operational NPT incidents, hazard depths, mitigations, and lessons learned from offset historical campaigns. Read-only access.
              </p>
            </div>
          </div>

          <HistoricalEventsPanel
            events={events}
            onSelectWell={(id) => setSelectedWellId(id)}
          />

          <HistoricalWellTable
            wells={filteredWells}
            globalWellId={globalWellId}
            roleCode={userRole}
            onSelectWell={(id) => setSelectedWellId(id)}
          />
        </div>
      )}

      {/* ROLE 3: MANAGEMENT / SUPERVISOR (VIEW ACCESS - EXECUTIVE SUMMARY) */}
      {userRole === 'MANAGEMENT_SUPERVISOR' && (
        <div className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />
              <div>
                <span className="font-extrabold text-emerald-950">Executive Management Historical Summary:</span>
                <p className="text-emerald-900 font-semibold mt-0.5">
                  High-level well status, major NPT events, financial impact, and offset field statistics. Raw telemetry curve clutter is hidden by default.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowTechnicalDetail(!showTechnicalDetail)}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
            >
              {showTechnicalDetail ? 'Hide Technical Inspection' : 'Expand Technical Inspection'}
            </button>
          </div>

          <HistoricalWellTable
            wells={filteredWells}
            globalWellId={globalWellId}
            roleCode={userRole}
            onSelectWell={(id) => setSelectedWellId(id)}
          />

          {showTechnicalDetail && (
            <div className="space-y-6 pt-4 border-t border-slate-200">
              <HistoricalEventsPanel
                events={events}
                onSelectWell={(id) => setSelectedWellId(id)}
              />
            </div>
          )}
        </div>
      )}

      {/* ROLE 4: DRILLING ENGINEER (FULL ACCESS - DETAILED ENGINEERING HISTORY) */}
      {(userRole === 'DRILLING_ENGINEER' || (!['GEOLOGIST', 'ERTMAC_OPERATOR', 'MANAGEMENT_SUPERVISOR'].includes(userRole))) && (
        <div className="space-y-6">
          <HistoricalWellTable
            wells={filteredWells}
            globalWellId={globalWellId}
            roleCode={userRole}
            onSelectWell={(id) => setSelectedWellId(id)}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HistoricalEventsPanel
              events={events}
              onSelectWell={(id) => setSelectedWellId(id)}
            />

            <HistoricalComparisonPanel
              comparison={comparisonData}
            />
          </div>
        </div>
      )}

      {/* Well Detail Modal */}
      {selectedWellId && (
        <HistoricalWellDetailModal
          wellId={selectedWellId}
          detail={wellDetail}
          globalWellId={globalWellId}
          globalWellName={globalWellName}
          roleCode={userRole}
          token={token || undefined}
          onClose={() => setSelectedWellId(null)}
        />
      )}
    </div>
  );
};

