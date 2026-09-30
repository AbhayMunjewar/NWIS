import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import {
  fetchNearbyWellsApi,
  fetchPredrillEventsApi,
  fetchGeologicalDataApi,
  fetchWellDetailApi
} from '../../lib/api';
import {
  MapPin, Layers, AlertTriangle, FileText,
  ChevronDown, ChevronUp,
  Ruler, BarChart3, Droplets, CircleDot,
  CheckCircle2, X, Box, ShieldAlert
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { LeafletWellMap } from '../gis/LeafletWellMap';
import { TrajectoryModal } from '../gis/TrajectoryModal';
import { HistoricalWellDetailModal } from '../historical/HistoricalWellDetailModal';
import { PdfViewerModal } from '../historical/PdfViewerModal';
import type { GisWell, CenterWell } from '../../types/gis';
import type { WellDetail, HistoricalDocument } from '../../types/historical';

// =============================================================================
// Track 1 — GIS Nearby Wells Panel
// =============================================================================
interface GISPanelProps {
  wellId: string;
  onComplete?: () => void;
}

export const GISNearbyWellsPanel: React.FC<GISPanelProps> = ({ wellId, onComplete }) => {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(150.0);
  const [sortField, setSortField] = useState<'distance_km' | 'event_count'>('distance_km');
  const [selectedWell, setSelectedWell] = useState<GisWell | null>(null);
  const [activeTrajectoryWell, setActiveTrajectoryWell] = useState<{ id: string; name: string } | null>(null);
  const [limitCount, setLimitCount] = useState<number | 'all'>(5);
  const [similarityData, setSimilarityData] = useState<any>(null);
  const [loadingSimilarity, setLoadingSimilarity] = useState(true);
  const [viewMode, setViewMode] = useState<'knn_cards' | 'table'>('knn_cards');

  // Well Detail Modal state for Historical Evidence & Well Summary options
  const [detailModalWellId, setDetailModalWellId] = useState<string | null>(null);
  const [detailModalTab, setDetailModalTab] = useState<'overview' | 'events' | 'documents'>('overview');
  const [wellDetailData, setWellDetailData] = useState<WellDetail | null>(null);

  const openWellDetail = async (id: string, tab: 'overview' | 'events' | 'documents') => {
    setDetailModalWellId(id);
    setDetailModalTab(tab);
    setWellDetailData(null);
    const detail = await fetchWellDetailApi(id, token || undefined);
    setWellDetailData(detail);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await fetchNearbyWellsApi(wellId, radius, token || undefined);
      setData(res);
      setLoading(false);
      if (res.total_nearby > 0 && onComplete) onComplete();
    };
    load();
  }, [wellId, radius, token]);

  useEffect(() => {
    const loadSim = async () => {
      setLoadingSimilarity(true);
      try {
        const res = await fetch(`http://localhost:8000/api/v1/ml/similarity/${wellId}`);
        if (res.ok) {
          const json = await res.json();
          setSimilarityData(json);
        }
      } catch (e) {
        console.warn('Failed to load k-NN similarity data', e);
      } finally {
        setLoadingSimilarity(false);
      }
    };
    loadSim();
  }, [wellId]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-slate-200 rounded w-48" />
        <div className="h-40 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  const wells = data?.nearby_wells || [];
  const target = data?.target_well || {};
  const sorted = [...wells].sort((a: any, b: any) =>
    sortField === 'distance_km' ? a.distance_km - b.distance_km : b.event_count - a.event_count
  );

  const displayedWells = limitCount === 'all' ? sorted : sorted.slice(0, limitCount);

  // Format center well data
  const centerWellObj: CenterWell = {
    well_id: target.well_id || wellId,
    well_name: target.well_name || wellId,
    field: target.field || 'Duliajan Field',
    latitude: target.latitude != null ? target.latitude : 26.8440,
    longitude: target.longitude != null ? target.longitude : 95.3280,
    target_depth_m: target.target_depth_m || 3900,
    status: target.status || 'Active Drilling'
  };

  // Map backend response wells to GisWell format expected by LeafletWellMap
  const gisFormattedWells: GisWell[] = [
    {
      well_id: centerWellObj.well_id,
      well_name: `${centerWellObj.well_name} (Target)`,
      field: centerWellObj.field,
      basin: 'Upper Assam Shelf',
      latitude: centerWellObj.latitude,
      longitude: centerWellObj.longitude,
      distance_km: 0,
      target_depth_m: 3900,
      status: 'Target Drilling',
      lifecycle_status: 'Target Drilling',
      spud_date: '2021-04-15',
      completion_date: '2021-08-20',
      formations: [],
      formation_names: [],
      formation_overlap: false,
      depth_overlap: false,
      historical_events: [],
      historical_events_count: 0,
      has_trajectory: true,
      has_logs: true,
      relevance_factors: ['Active Target Well'],
      data_provenance: 'OIL_AUTHORIZED',
      is_current_well: true
    },
    ...sorted.filter((w: any) => w.well_id !== centerWellObj.well_id).map((w: any) => ({
      well_id: w.well_id,
      well_name: w.well_name,
      field: w.field || 'Duliajan Field',
      basin: 'Upper Assam Shelf',
      latitude: w.latitude,
      longitude: w.longitude,
      distance_km: w.distance_km,
      target_depth_m: w.target_depth_m,
      status: w.status,
      lifecycle_status: w.status,
      spud_date: '2021-04-15',
      completion_date: '2021-08-20',
      formations: [],
      formation_names: [],
      formation_overlap: false,
      depth_overlap: false,
      historical_events: [],
      historical_events_count: w.event_count || 0,
      has_trajectory: true,
      has_logs: true,
      relevance_factors: [`${w.distance_km} km distance`],
      data_provenance: 'OIL_AUTHORIZED',
      is_current_well: false
    }))
  ];

  return (
    <div className="space-y-4">
      {/* Interactive Leaflet OpenStreetMap GIS Canvas */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-xl">
        <LeafletWellMap
          centerWell={centerWellObj}
          wells={gisFormattedWells}
          selectedWell={selectedWell}
          onSelectWell={(w) => setSelectedWell(w)}
          radiusKm={radius}
        />
      </div>

      {/* Selected Well Inspection Banner */}
      {selectedWell && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-3.5 text-xs text-slate-200 flex items-center justify-between shadow-md animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-extrabold text-sm">
              ●
            </div>
            <div>
              <div className="font-extrabold text-white text-sm flex items-center gap-2">
                {selectedWell.well_name}
                {selectedWell.is_current_well && (
                  <span className="bg-orange-500/20 text-orange-400 border border-orange-500/40 text-[9px] font-bold px-1.5 py-0.5 rounded">
                    ACTIVE DRILLING TARGET
                  </span>
                )}
                {selectedWell.historical_events_count > 0 && (
                  <span className="bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                    <AlertTriangle size={10} /> {selectedWell.historical_events_count} Incident(s)
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Field: <strong className="text-slate-200">{selectedWell.field}</strong> • Distance: <strong className="text-blue-400">{selectedWell.distance_km} km</strong> • Target Depth: <strong className="text-slate-200">{selectedWell.target_depth_m}m</strong> • Status: <strong className="text-emerald-400">{selectedWell.status}</strong>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTrajectoryWell({ id: selectedWell.well_id, name: selectedWell.well_name })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-[#0F2C59] text-white font-extrabold text-xs transition-colors shadow-sm"
            >
              <Box size={13} />
              <span>3D Model & Survey</span>
            </button>
            <button
              onClick={() => openWellDetail(selectedWell.well_id, 'events')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs transition-colors shadow-sm"
            >
              <AlertTriangle size={13} />
              <span>Historical Evidence</span>
            </button>
            <button
              onClick={() => openWellDetail(selectedWell.well_id, 'overview')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition-colors shadow-sm"
            >
              <FileText size={13} />
              <span>Well Summary</span>
            </button>
            <button
              onClick={() => setSelectedWell(null)}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Close inspection drawer"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Radius Control */}
      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
        <Ruler size={14} className="text-slate-500" />
        <span className="text-xs font-bold text-slate-700">Search Radius:</span>
        <input
          type="range" min={5} max={200} step={5} value={radius}
          onChange={e => setRadius(Number(e.target.value))}
          className="flex-1 accent-blue-600 h-1.5"
        />
        <span className="text-xs font-extrabold text-blue-700 min-w-[40px] text-right">{radius} km</span>
      </div>

      {/* Top 5 Ranked Similar Wells (k-NN Feature Distance Engine) */}
      <div className="space-y-3 bg-purple-50/50 p-4 rounded-xl border border-purple-200 shadow-2xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="text-xs text-purple-950 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
            <span>🗺️ TOP 5 RANKED SIMILAR OFFSET WELLS (k-NN ML ENGINE)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Euclidean Distance</span>
            <div className="flex items-center bg-white border border-purple-200 rounded-lg p-0.5 text-[10px] font-bold shadow-2xs">
              <button
                onClick={() => setViewMode('knn_cards')}
                className={`px-2.5 py-1 rounded transition-colors ${viewMode === 'knn_cards' ? 'bg-purple-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                ML Ranked Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded transition-colors ${viewMode === 'table' ? 'bg-purple-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Table View
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'knn_cards' ? (
          loadingSimilarity ? (
            <div className="text-slate-500 text-xs py-6 text-center animate-pulse font-semibold">Calculating k-NN feature similarity matrix...</div>
          ) : similarityData?.similar_wells && similarityData.similar_wells.length > 0 ? (
            <div className="space-y-2.5">
              {similarityData.similar_wells.slice(0, 5).map((sim: any, idx: number) => (
                <div key={idx} className="p-3.5 bg-white border border-purple-100 rounded-xl flex flex-col gap-1.5 hover:border-purple-300 transition-all shadow-2xs">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-950 font-extrabold text-[10px] flex items-center justify-center border border-purple-300 shadow-2xs">
                        #{idx + 1}
                      </span>
                      <strong className="text-slate-900 text-xs font-extrabold">{sim.well_name} ({sim.well_id})</strong>
                      <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-md bg-emerald-100 text-emerald-950 border border-emerald-300">
                        {sim.similarity_score}% Match
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => setActiveTrajectoryWell({ id: sim.well_id, name: sim.well_name })}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 hover:bg-[#0F2C59] text-white font-extrabold text-[10px] transition-colors shadow-2xs"
                      >
                        <Box size={11} />
                        <span>3D Model & Survey</span>
                      </button>
                      <button
                        onClick={() => openWellDetail(sim.well_id, 'events')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[10px] transition-colors shadow-2xs"
                      >
                        <AlertTriangle size={11} />
                        <span>Historical Evidence</span>
                      </button>
                      <button
                        onClick={() => openWellDetail(sim.well_id, 'overview')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] transition-colors shadow-2xs"
                      >
                        <FileText size={11} />
                        <span>Well Summary</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 font-medium flex items-center justify-between px-1 flex-wrap gap-2">
                    <span>Field: <strong className="text-slate-900 font-bold">{sim.field}</strong></span>
                    <span>Target Depth: <strong className="text-slate-900 font-bold">{sim.target_depth_m}m</strong></span>
                  </div>

                  {sim.matched_factors && sim.matched_factors.length > 0 && (
                    <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1 mt-0.5">
                      <div className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">Matched Factors</div>
                      {sim.matched_factors.map((mf: string, mfi: number) => (
                        <div key={mfi} className="text-emerald-800 font-bold flex items-center gap-1.5 text-[11px]">
                          <span className="text-emerald-600 font-black">✓</span>
                          <span>{mf}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-500 text-xs py-2 font-semibold">No similar wells index found.</div>
          )
        ) : null}
      </div>

      {/* Wells Table View (Visible when viewMode === 'table') */}
      {viewMode === 'table' && (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <MapPin size={13} className="text-blue-600" />
              <span className="text-xs font-extrabold text-slate-900">
                {limitCount === 'all' ? `All ${sorted.length} Nearby Wells` : `Top ${displayedWells.length} Nearest Wells (out of ${sorted.length} total)`}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Limit Toggle Buttons */}
              <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-[10px] font-bold">
                <button
                  onClick={() => setLimitCount(5)}
                  className={`px-2 py-0.5 rounded transition-colors ${limitCount === 5 ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  Top 5
                </button>
                <button
                  onClick={() => setLimitCount(10)}
                  className={`px-2 py-0.5 rounded transition-colors ${limitCount === 10 ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  Top 10
                </button>
                <button
                  onClick={() => setLimitCount('all')}
                  className={`px-2 py-0.5 rounded transition-colors ${limitCount === 'all' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  Show All ({sorted.length})
                </button>
              </div>

              {/* Sort Buttons */}
              <button onClick={() => setSortField('distance_km')} className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors ${sortField === 'distance_km' ? 'bg-blue-100 border-blue-300 text-blue-800' : 'bg-white border-slate-200 text-slate-500'}`}>
                By Distance
              </button>
              <button onClick={() => setSortField('event_count')} className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors ${sortField === 'event_count' ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-white border-slate-200 text-slate-500'}`}>
                By Events
              </button>
            </div>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-3 py-2 text-left">Well Name</th>
                <th className="px-3 py-2 text-left">Field</th>
                <th className="px-3 py-2 text-right">Distance</th>
                <th className="px-3 py-2 text-center">Bearing</th>
                <th className="px-3 py-2 text-right">Depth (m)</th>
                <th className="px-3 py-2 text-center">Status</th>
                <th className="px-3 py-2 text-center">Events</th>
                <th className="px-3 py-2 text-center">Quick Actions & Deep Analysis</th>
              </tr>
            </thead>
            <tbody>
              {displayedWells.map((w: any) => {
                const isSelectedRow = selectedWell?.well_id === w.well_id;
                return (
                  <tr
                    key={w.well_id}
                    onClick={() => {
                      const formatted = gisFormattedWells.find(gw => gw.well_id === w.well_id);
                      if (formatted) setSelectedWell(formatted);
                    }}
                    className={`border-b border-slate-100 cursor-pointer transition-colors ${
                      isSelectedRow ? 'bg-emerald-50 border-emerald-300 font-bold' : 'hover:bg-blue-50/40'
                    }`}
                  >
                    <td className="px-3 py-2.5 font-extrabold text-slate-900 flex items-center gap-2">
                      {isSelectedRow && <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />}
                      {w.well_name}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 font-medium">{w.field}</td>
                    <td className="px-3 py-2.5 text-right font-bold text-blue-700">{w.distance_km} km</td>
                    <td className="px-3 py-2.5 text-center font-bold text-slate-700">{w.bearing}</td>
                    <td className="px-3 py-2.5 text-right font-medium text-slate-700">{w.target_depth_m.toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-center">
                      <Badge variant={w.status === 'Producing' ? 'full' : 'view'} size="sm">{w.status}</Badge>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {w.event_count > 0 ? (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-extrabold">
                          <AlertTriangle size={11} /> {w.event_count}
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1 flex-wrap">
                        <button
                          onClick={() => setActiveTrajectoryWell({ id: w.well_id, name: w.well_name })}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-900 hover:bg-[#0F2C59] text-white font-extrabold text-[10px] transition-colors shadow-2xs"
                          title="View 3D Subsurface Model & Survey Trajectory Table"
                        >
                          <Box size={11} />
                          <span>3D Model</span>
                        </button>
                        <button
                          onClick={() => openWellDetail(w.well_id, 'events')}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[10px] transition-colors shadow-2xs"
                          title="View Historical Incidents & Evidence"
                        >
                          <AlertTriangle size={11} />
                          <span>Historical Evidence</span>
                        </button>
                        <button
                          onClick={() => openWellDetail(w.well_id, 'overview')}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] transition-colors shadow-2xs"
                          title="View Full Well Executive Summary & Lithology"
                        >
                          <FileText size={11} />
                          <span>Well Summary</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 3D Wellbore Trajectory & Survey Table Modal */}
      {activeTrajectoryWell && (
        <TrajectoryModal
          wellId={activeTrajectoryWell.id}
          wellName={activeTrajectoryWell.name}
          onClose={() => setActiveTrajectoryWell(null)}
        />
      )}

      {/* Historical Well Detail Modal for Evident and Summary */}
      {detailModalWellId && (
        <HistoricalWellDetailModal
          wellId={detailModalWellId}
          detail={wellDetailData}
          globalWellId={wellId}
          globalWellName={centerWellObj.well_name}
          token={token || undefined}
          initialTab={detailModalTab}
          onClose={() => setDetailModalWellId(null)}
        />
      )}
    </div>
  );
};


// =============================================================================
// Track 2 — Historical Wells Panel
// =============================================================================
interface HistoricalPanelProps {
  wellId: string;
  onComplete?: () => void;
}

export const HistoricalWellsPanel: React.FC<HistoricalPanelProps> = ({ wellId, onComplete }) => {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(150.0);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [selectedPdfDoc, setSelectedPdfDoc] = useState<HistoricalDocument | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await fetchPredrillEventsApi(wellId, radius, token || undefined);
      setData(res);
      setLoading(false);
      if (res.total_events > 0 && onComplete) onComplete();
    };
    load();
  }, [wellId, radius, token]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-slate-200 rounded w-48" />
        <div className="h-40 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  const events = data?.events || [];
  const formationMatrix = data?.formation_hazard_matrix || [];
  const ppfgWindow = data?.ppfg_window || [];
  const casingProgram = data?.recommended_casing_program || [];

  const costFormatted = (data?.total_cost_loss_inr || 0) >= 1e7
    ? `₹${((data?.total_cost_loss_inr || 0) / 1e7).toFixed(1)} Cr`
    : `₹${((data?.total_cost_loss_inr || 0) / 1e5).toFixed(1)} L`;

  return (
    <div className="space-y-5">
      {/* Search Radius & Subsurface Query Selector */}
      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
        <Ruler size={14} className="text-slate-500" />
        <span className="text-xs font-bold text-slate-700">Offset Search Radius:</span>
        <input
          type="range" min={5} max={200} step={5} value={radius}
          onChange={e => setRadius(Number(e.target.value))}
          className="flex-1 accent-amber-600 h-1.5"
        />
        <span className="text-xs font-extrabold text-amber-700 min-w-[45px] text-right">{radius} km</span>
      </div>

      {/* Aggregate Stats Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200 rounded-xl p-3.5 text-center shadow-2xs">
          <div className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Total Hazards</div>
          <div className="text-2xl font-black text-rose-900 mt-0.5">{data?.total_events || 0}</div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-3.5 text-center shadow-2xs">
          <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Total NPT</div>
          <div className="text-2xl font-black text-amber-900 mt-0.5">{data?.total_npt_hours || 0}<span className="text-sm font-bold ml-1">hrs</span></div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-3.5 text-center shadow-2xs">
          <div className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Cost Loss</div>
          <div className="text-2xl font-black text-purple-900 mt-0.5">{costFormatted}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-3.5 text-center shadow-2xs">
          <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Offset Wells</div>
          <div className="text-2xl font-black text-blue-900 mt-0.5">{(data?.offset_wells_analyzed?.length || 0) + 1}</div>
        </div>
      </div>

      {/* SECTION 1: Stratigraphic Formation Hazard Matrix */}
      {formationMatrix.length > 0 && (
        <div className="bg-slate-900 text-white rounded-xl p-4 border border-slate-800 shadow-md space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 text-amber-400">
              <Layers size={15} />
              <span>1. STRATIGRAPHIC FORMATION HAZARD MATRIX (GEOLOGIST PRE-ANALYSIS)</span>
            </div>
            <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
              Assam Shelf Basinal Correlation
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {formationMatrix.map((fm: any, fidx: number) => (
              <div key={fidx} className="bg-slate-800/90 border border-slate-700 rounded-xl p-3 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <strong className="text-xs font-black text-white">{fm.formation_name}</strong>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${
                      fm.risk_level === 'Critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' :
                      fm.risk_level === 'High' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                      'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
                    }`}>
                      {fm.risk_level} Risk
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    {fm.event_count} Historical Hazard(s) • <strong className="text-amber-300">{fm.total_npt_hours}h NPT</strong>
                  </div>
                </div>

                <div className="space-y-1 bg-slate-950/60 p-2 rounded-lg border border-slate-800 text-[10px]">
                  <div className="text-[9px] font-bold text-slate-400 uppercase">Primary Risks Identified:</div>
                  <div className="flex flex-wrap gap-1">
                    {fm.primary_hazards.map((haz: string, hidx: number) => (
                      <span key={hidx} className="bg-rose-500/10 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded font-bold">
                        ⚠️ {haz}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: Pore Pressure & Fracture Gradient (PPFG) Safe Mud Window */}
      {ppfgWindow.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 size={15} className="text-blue-600" />
              <span>2. PORE PRESSURE & FRACTURE GRADIENT (PPFG) SAFE MUD WEIGHT WINDOW</span>
            </div>
            <span className="text-[10px] font-bold text-slate-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
              Equivalent Mud Weight (g/cc)
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase">
                  <th className="p-2.5">Formation</th>
                  <th className="p-2.5">Depth Interval</th>
                  <th className="p-2.5 text-center">Pore Pressure</th>
                  <th className="p-2.5 text-center">Fracture Limit</th>
                  <th className="p-2.5 text-center">Safe Mud Weight</th>
                  <th className="p-2.5">Geological Risk Warning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {ppfgWindow.map((pp: any, ppidx: number) => (
                  <tr key={ppidx} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-2.5 font-extrabold text-slate-900">{pp.formation}</td>
                    <td className="p-2.5 text-slate-600">{pp.depth_interval}</td>
                    <td className="p-2.5 text-center font-bold text-rose-700">{pp.pore_pressure_emw} g/cc</td>
                    <td className="p-2.5 text-center font-bold text-purple-700">{pp.fracture_grad_emw} g/cc</td>
                    <td className="p-2.5 text-center">
                      <span className="bg-emerald-100 text-emerald-950 border border-emerald-300 font-black px-2 py-0.5 rounded text-[11px]">
                        {pp.safe_mw_min} – {pp.safe_mw_max} g/cc
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-700 font-bold text-[11px] flex items-center gap-1.5">
                      <AlertTriangle size={12} className="text-amber-600 shrink-0" />
                      <span>{pp.primary_risk}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: Detailed Offset Incident Evidence Log */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle size={15} className="text-amber-600" />
            <span>3. DETAILED OFFSET INCIDENT LOG & HISTORICAL EVIDENCE ({events.length})</span>
          </div>
        </div>

        <div className="space-y-2.5">
          {events.map((ev: any) => {
            const isExpanded = expandedEvent === ev.incident_id;
            return (
              <div key={ev.incident_id} className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <button
                  onClick={() => setExpandedEvent(isExpanded ? null : ev.incident_id)}
                  className="w-full flex items-center justify-between bg-white hover:bg-slate-50 transition-colors px-4 py-3 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg border ${ev.severity === 'Critical' ? 'bg-rose-100 border-rose-300 text-rose-700' : ev.severity === 'High' ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-yellow-100 border-yellow-300 text-yellow-700'}`}>
                      <AlertTriangle size={14} />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                        {ev.incident_id} — {ev.hazard_type}
                        <span className="text-[10px] font-bold text-slate-500">({ev.well_name})</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                        Field: {ev.field} • Formation: <strong className="text-slate-700">{ev.formation}</strong> • Depth: <strong className="text-blue-700">{ev.depth_m}m MD</strong>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={ev.severity === 'Critical' ? 'full' : ev.severity === 'High' ? 'use' : 'view'} size="sm">{ev.severity}</Badge>
                    <span className="text-[10px] font-bold text-amber-700">{ev.npt_hours} hr NPT</span>
                    {isExpanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 space-y-3 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Root Cause Analysis (RCA)</span>
                        <p className="text-slate-800 font-medium mt-1 leading-relaxed">{ev.root_cause}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Mitigation Applied</span>
                        <p className="text-slate-800 font-medium mt-1 leading-relaxed">{ev.mitigation_applied}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white border border-slate-200 rounded-lg p-2 text-center">
                        <div className="text-[9px] font-bold text-slate-500 uppercase">Depth Range</div>
                        <div className="font-bold text-slate-900">{ev.start_depth}–{ev.end_depth}m</div>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-lg p-2 text-center">
                        <div className="text-[9px] font-bold text-slate-500 uppercase">Cost Loss</div>
                        <div className="font-bold text-purple-900">₹{(ev.cost_loss_inr / 1e5).toFixed(1)} Lakhs</div>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-lg p-2 text-center">
                        <div className="text-[9px] font-bold text-slate-500 uppercase">Duration</div>
                        <div className="font-bold text-amber-800">{ev.npt_hours} hrs NPT</div>
                      </div>
                    </div>
                    {ev.linked_documents && ev.linked_documents.length > 0 && (
                      <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                        <div className="text-[10px] font-extrabold text-blue-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                          <FileText size={12} className="text-blue-700" />
                          <span>Linked Verified PDF Investigation Documents ({ev.linked_documents.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {ev.linked_documents.map((doc: any) => (
                            <button
                              key={doc.doc_id}
                              onClick={() => {
                                const docItem: HistoricalDocument = {
                                  doc_id: doc.doc_id,
                                  document_name: doc.document_name,
                                  document_type: doc.document_type || 'INCIDENT REPORT',
                                  file_format: 'PDF',
                                  relative_path: doc.file_path || '',
                                  download_url: `/api/v1/historical/documents/${doc.doc_id}/file`,
                                  associated_well: doc.associated_well || ev.well_name,
                                  associated_event_id: ev.incident_id,
                                  source_classification: 'OIL_AUTHORIZED',
                                  ocr_status: 'OCR Available',
                                  report_type_label: 'HISTORICAL INCIDENT REPORT',
                                  file_size_bytes: 5000,
                                  summary: ev.root_cause
                                };
                                setSelectedPdfDoc(docItem);
                              }}
                              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-900 bg-white hover:bg-blue-600 hover:text-white border border-blue-300 rounded-lg px-2.5 py-1.5 transition-colors shadow-2xs"
                            >
                              <FileText size={12} />
                              <span>{doc.document_name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: Recommended Pre-Drill Casing & Mud Program */}
      {casingProgram.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert size={15} className="text-emerald-700" />
              <span>4. RECOMMENDED CASING SEAT & MUD SYSTEM DESIGN PROGRAM</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded">
              Pre-Drill Operational Directives
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
            {casingProgram.map((cs: any, csidx: number) => (
              <div key={csidx} className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-xs font-black text-slate-900">{cs.section}</strong>
                    <span className="text-[10px] font-extrabold bg-blue-100 text-blue-900 border border-blue-200 px-1.5 py-0.5 rounded">
                      {cs.casing_size} Casing
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold mb-2">
                    Hole: {cs.hole_size} • Depth: {cs.depth_top_m}m – {cs.depth_bottom_m}m
                  </div>
                </div>

                <div className="space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-200 text-[10px]">
                  <div>Target Mud Density: <strong className="text-emerald-800 font-extrabold">{cs.mud_weight_gcc}</strong></div>
                  <div>Recommended Mud System: <strong className="text-slate-900 font-bold">{cs.mud_type}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Built-In PDF Viewer Modal */}
      {selectedPdfDoc && (
        <PdfViewerModal
          document={selectedPdfDoc}
          onClose={() => setSelectedPdfDoc(null)}
        />
      )}
    </div>
  );
};


// =============================================================================
// Track 3 — Geological Data Panel
// =============================================================================
interface GeologicalPanelProps {
  wellId: string;
  onComplete?: () => void;
}

export const GeologicalDataPanel: React.FC<GeologicalPanelProps> = ({ wellId, onComplete }) => {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await fetchGeologicalDataApi(wellId, token || undefined);
      setData(res);
      setLoading(false);
      if (res.formations?.length > 0 && onComplete) onComplete();
    };
    load();
  }, [wellId, token]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-slate-200 rounded w-48" />
        <div className="h-40 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  const formations = data?.formations || [];
  const mudProgram = data?.mud_program || [];
  const casingRecords = data?.casing_records || [];
  const correlation = data?.formation_correlation || { wells_compared: [], correlation_rows: [] };

  const stratColors: Record<string, string> = {
    'tipam': '#eab308',
    'girujan': '#a16207',
    'namsang': '#65a30d',
    'barail': '#dc2626',
    'kopili': '#7c3aed',
    'sylhet': '#0ea5e9'
  };

  const getStratColor = (name: string) => {
    const lower = name.toLowerCase();
    for (const [key, color] of Object.entries(stratColors)) {
      if (lower.includes(key)) return color;
    }
    return '#64748b';
  };

  return (
    <div className="space-y-5">
      {/* Stratigraphic Column + Formation Table side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Visual Stratigraphic Column */}
        <div className="bg-slate-900 rounded-xl p-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Layers size={12} /> Stratigraphic Column
          </div>
          <div className="space-y-1">
            {formations.map((f: any, i: number) => {
              const color = getStratColor(f.formation_name);
              const thickness = Math.max(28, Math.min(60, f.thickness_m / 15));
              return (
                <div key={i} className="relative rounded-lg overflow-hidden border border-slate-700" style={{ height: thickness, backgroundColor: color + '30' }}>
                  <div className="absolute inset-0 flex items-center justify-between px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-full rounded" style={{ backgroundColor: color }} />
                      <span className="text-[10px] font-bold text-white truncate">{f.formation_name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-bold text-slate-300">{f.top_depth_m}–{f.bottom_depth_m}m</span>
                      {f.hazard_flag && (
                        <div className="text-[8px] font-bold text-rose-400 flex items-center gap-0.5 justify-end">
                          <AlertTriangle size={8} /> {f.hazard_flag}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Formation Tops Table */}
        <div className="lg:col-span-2 border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
            <Layers size={13} className="text-cyan-600" /> Formation Tops & Lithology
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-3 py-2 text-left">Formation</th>
                <th className="px-3 py-2 text-right">Top (m)</th>
                <th className="px-3 py-2 text-right">Bottom (m)</th>
                <th className="px-3 py-2 text-right">Thickness (m)</th>
                <th className="px-3 py-2 text-left">Lithology</th>
                <th className="px-3 py-2 text-center">Hazard</th>
              </tr>
            </thead>
            <tbody>
              {formations.map((f: any, i: number) => (
                <tr key={i} className={`border-b border-slate-100 ${f.hazard_flag ? 'bg-rose-50/50' : 'hover:bg-slate-50'} transition-colors`}>
                  <td className="px-3 py-2.5 font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: getStratColor(f.formation_name) }} />
                    {f.formation_name}
                  </td>
                  <td className="px-3 py-2.5 text-right font-medium text-slate-700">{f.top_depth_m}</td>
                  <td className="px-3 py-2.5 text-right font-medium text-slate-700">{f.bottom_depth_m}</td>
                  <td className="px-3 py-2.5 text-right font-bold text-slate-900">{f.thickness_m}</td>
                  <td className="px-3 py-2.5 text-slate-600 font-medium">{f.lithology}</td>
                  <td className="px-3 py-2.5 text-center">
                    {f.hazard_flag ? (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-100 border border-rose-200 rounded-lg px-2 py-0.5 inline-flex items-center gap-1">
                        <AlertTriangle size={9} /> {f.hazard_flag}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mud Program & Casing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mud Program */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
            <Droplets size={13} className="text-blue-600" /> Mud Program ({mudProgram.length} records)
          </div>
          {mudProgram.length > 0 ? (
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-white border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-3 py-2 text-right">Depth (m)</th>
                  <th className="px-3 py-2 text-right">MW (g/cc)</th>
                  <th className="px-3 py-2 text-left">Fluid Type</th>
                </tr>
              </thead>
              <tbody>
                {mudProgram.map((m: any, i: number) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-blue-50/30 transition-colors">
                    <td className="px-3 py-2 text-right font-bold text-slate-900">{m.depth_m}</td>
                    <td className="px-3 py-2 text-right font-bold text-blue-700">{m.mud_weight_gcc}</td>
                    <td className="px-3 py-2 text-slate-600 font-medium">{m.fluid_type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-xs text-slate-400 font-medium">No mud program data available</div>
          )}
        </div>

        {/* Casing Records */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
            <CircleDot size={13} className="text-emerald-600" /> Casing Program ({casingRecords.length} strings)
          </div>
          {casingRecords.length > 0 ? (
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-white border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-3 py-2 text-left">Size</th>
                  <th className="px-3 py-2 text-right">Depth (m)</th>
                  <th className="px-3 py-2 text-left">Grade</th>
                  <th className="px-3 py-2 text-left">Weight</th>
                </tr>
              </thead>
              <tbody>
                {casingRecords.map((c: any, i: number) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-emerald-50/30 transition-colors">
                    <td className="px-3 py-2 font-extrabold text-slate-900">{c.casing_size}</td>
                    <td className="px-3 py-2 text-right font-bold text-emerald-700">{c.setting_depth}</td>
                    <td className="px-3 py-2 text-slate-700 font-medium">{c.grade}</td>
                    <td className="px-3 py-2 text-slate-600 font-medium">{c.weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-xs text-slate-400 font-medium">No casing records available</div>
          )}
        </div>
      </div>

      {/* Formation Correlation */}
      {correlation.correlation_rows.length > 0 && (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
            <BarChart3 size={13} className="text-purple-600" /> Formation Correlation Across Wells
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-3 py-2 text-left">Formation</th>
                {correlation.wells_compared.map((w: string) => (
                  <th key={w} className="px-3 py-2 text-right">{w}</th>
                ))}
                <th className="px-3 py-2 text-right">Variance (m)</th>
              </tr>
            </thead>
            <tbody>
              {correlation.correlation_rows.map((row: any, i: number) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-purple-50/30 transition-colors">
                  <td className="px-3 py-2.5 font-extrabold text-slate-900">{row.formation}</td>
                  {correlation.wells_compared.map((w: string) => (
                    <td key={w} className="px-3 py-2.5 text-right font-medium text-slate-700">
                      {row[w] != null ? `${row[w]}m` : '—'}
                    </td>
                  ))}
                  <td className="px-3 py-2.5 text-right">
                    <span className={`font-bold ${row.variance_m > 20 ? 'text-amber-700' : 'text-emerald-700'}`}>
                      ±{row.variance_m}m
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};


// =============================================================================
// Tab Container — Pre-Drill Analysis Tabs
// =============================================================================
interface PreDrillAnalysisTabsProps {
  wellId: string;
  onAllComplete?: () => void;
}

export const PreDrillAnalysisTabs: React.FC<PreDrillAnalysisTabsProps> = ({ wellId, onAllComplete }) => {
  const [activeTab, setActiveTab] = useState<'gis' | 'historical' | 'geological'>('gis');
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const markComplete = (tab: string) => {
    setCompleted(prev => {
      const next = new Set(prev);
      next.add(tab);
      if (next.size >= 3 && onAllComplete) onAllComplete();
      return next;
    });
  };

  const tabs = [
    { key: 'gis' as const, label: 'GIS Nearby Wells', icon: MapPin, color: 'blue' },
    { key: 'historical' as const, label: 'Historical Wells', icon: AlertTriangle, color: 'amber' },
    { key: 'geological' as const, label: 'Geological Data', icon: Layers, color: 'cyan' }
  ];

  return (
    <div className="space-y-3">
      {/* Tab Navigation */}
      <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-xl p-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          const isDone = completed.has(tab.key);
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                isActive
                  ? 'bg-white border border-slate-300 text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
              }`}
            >
              {isDone ? (
                <CheckCircle2 size={13} className="text-emerald-600" />
              ) : (
                <Icon size={13} className={isActive ? `text-${tab.color}-600` : ''} />
              )}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Completion Progress */}
      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
        <span>Research Progress:</span>
        <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${(completed.size / 3) * 100}%` }}
          />
        </div>
        <span className="text-emerald-700">{completed.size}/3 complete</span>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'gis' && (
          <GISNearbyWellsPanel wellId={wellId} onComplete={() => markComplete('gis')} />
        )}
        {activeTab === 'historical' && (
          <HistoricalWellsPanel wellId={wellId} onComplete={() => markComplete('historical')} />
        )}
        {activeTab === 'geological' && (
          <GeologicalDataPanel wellId={wellId} onComplete={() => markComplete('geological')} />
        )}
      </div>
    </div>
  );
};
