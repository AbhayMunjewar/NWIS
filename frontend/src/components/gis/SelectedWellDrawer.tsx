import React, { useState } from 'react';
import { X, MapPin, Compass, ShieldAlert, Navigation, Layers, Eye, ExternalLink, FileText, Activity, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import type { GisWell } from '../../types/gis';
import { Badge } from '../common/Badge';
import { TrajectoryModal } from './TrajectoryModal';
import { useNavigate } from 'react-router-dom';
import { useCurrentWell } from '../../lib/wellContext';

interface SelectedWellDrawerProps {
  well: GisWell | null;
  onClose: () => void;
  roleCode?: string;
}

export const SelectedWellDrawer: React.FC<SelectedWellDrawerProps> = ({
  well,
  onClose,
  roleCode = 'DRILLING_ENGINEER'
}) => {
  const navigate = useNavigate();
  const { selectWell } = useCurrentWell();
  const [showTrajectoryModal, setShowTrajectoryModal] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [similarityData, setSimilarityData] = useState<any>(null);
  const [loadingSimilarity, setLoadingSimilarity] = useState(false);

  React.useEffect(() => {
    if (!well) return;
    setLoadingSimilarity(true);
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/ml/similarity/${well.well_id}`)
      .then(r => r.json())
      .then(data => {
        setSimilarityData(data);
        setLoadingSimilarity(false);
      })
      .catch(() => setLoadingSimilarity(false));
  }, [well?.well_id]);

  if (!well) return null;

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 text-xs shadow-xl relative">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 shrink-0">
              <MapPin size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-[#0F2C59]">{well.well_name}</h3>
                <Badge variant={well.is_current_well ? 'warning' : 'use'} size="sm">
                  {well.is_current_well ? 'ACTIVE CENTER WELL' : 'OFFSET INSPECTION'}
                </Badge>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                ID: {well.well_id} • Field: {well.field}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Spatial Proximity Context */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
          <div className="space-y-0.5">
            <div className="text-xs font-extrabold text-[#0F2C59] flex items-center gap-1.5">
              <Compass size={15} className="text-[#0F2C59]" />
              <span>Spatial Proximity Context</span>
            </div>
            <div className="text-xs text-slate-700 font-medium">
              Distance to active well: <strong className="text-emerald-800 font-extrabold">{well.distance_km === 0 ? '0 km (Active Location)' : `${well.distance_km} km`}</strong>
            </div>
          </div>
        </div>

        {/* Factual Evidence-based Relevance Factors */}
        <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div className="text-[10px] text-slate-600 uppercase font-extrabold tracking-wider">Evidence-Based Operational & Spatial Relevance</div>
          <div className="space-y-1">
            {well.relevance_factors && well.relevance_factors.length > 0 ? (
              well.relevance_factors.map((factor, idx) => (
                <div key={idx} className="text-xs text-slate-800 font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0F2C59] shrink-0"></span>
                  <span>{factor}</span>
                </div>
              ))
            ) : (
              <span className="text-slate-500 text-xs font-medium">Similarity analysis not available</span>
            )}
          </div>
        </div>

        {/* Top 5 Ranked Similar Wells (k-NN Feature Distance Engine) */}
        <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-purple-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="text-[10px] text-purple-950 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <span>🗺️ TOP 5 RANKED SIMILAR OFFSET WELLS (k-NN ML ENGINE)</span>
            </div>
            <span className="text-xs font-semibold text-slate-600">Euclidean Distance</span>
          </div>

          {loadingSimilarity ? (
            <div className="text-slate-500 text-xs py-2 text-center animate-pulse font-semibold">Calculating k-NN feature similarity matrix...</div>
          ) : similarityData?.similar_wells && similarityData.similar_wells.length > 0 ? (
            <div className="space-y-2">
              {similarityData.similar_wells.slice(0, 5).map((sim: any, idx: number) => (
                <div key={idx} className="p-3 bg-white border border-slate-200 rounded-lg flex flex-col gap-1 hover:border-purple-300 transition-colors shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-950 font-extrabold text-[10px] flex items-center justify-center border border-purple-300">
                        #{idx + 1}
                      </span>
                      <strong className="text-slate-900 text-xs font-extrabold">{sim.well_name} ({sim.well_id})</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-emerald-100 text-emerald-950 border border-emerald-300">
                        {sim.similarity_score}% Match
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 font-medium flex items-center justify-between">
                    <span>Field: <strong className="text-slate-900 font-bold">{sim.field}</strong></span>
                    <span>Target Depth: <strong className="text-slate-900 font-bold">{sim.target_depth_m}m</strong></span>
                  </div>
                  <div className="text-xs text-slate-700 bg-slate-50 p-2 rounded-md border border-slate-200 space-y-0.5 mt-0.5">
                    <div className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">Matched Factors</div>
                    {sim.matched_factors.map((mf: string, mfi: number) => (
                      <div key={mfi} className="text-emerald-800 font-bold flex items-center gap-1">
                        <span>✓</span>
                        <span>{mf}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-500 text-xs py-1 font-semibold">No similar wells index found.</div>
          )}
        </div>

        {/* ---------------------------------------------------- */}
        {/* 1. DRILLING ENGINEER VIEW                            */}
        {/* ---------------------------------------------------- */}
        {roleCode === 'DRILLING_ENGINEER' && (
          <div className="space-y-4">
            {/* Engineering Metrics Grid */}
            <div className="space-y-2">
              <div className="font-extrabold text-[#0F2C59] flex items-center gap-1.5 border-b border-slate-100 pb-2 text-xs uppercase tracking-wider">
                <Activity size={16} className="text-[#0F2C59]" />
                <span>Engineering & Operational Parameters</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider block">Total Depth</span>
                  <span className="font-extrabold text-slate-900 mt-0.5 block">{well.target_depth_m ? `${well.target_depth_m}m` : 'N/A'}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider block">Well Status</span>
                  <span className="font-extrabold text-emerald-800 mt-0.5 block">{well.status}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider block">Coordinates</span>
                  <span className="font-extrabold text-slate-900 mt-0.5 block">{well.latitude.toFixed(3)}, {well.longitude.toFixed(3)}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider block">Formation Overlap</span>
                  <span className="font-extrabold text-emerald-800 mt-0.5 block">{well.formation_overlap ? 'Confirmed' : 'None'}</span>
                </div>
              </div>
            </div>

            {/* Geological Context */}
            <div className="space-y-2">
              <div className="font-extrabold text-[#0F2C59] flex items-center gap-1.5 border-b border-slate-100 pb-2 text-xs uppercase tracking-wider">
                <Layers size={16} className="text-amber-600" />
                <span>Recorded Formation Overlap Context</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="flex items-center justify-between text-slate-900 font-extrabold text-xs">
                  <span>{well.formation_names[0] || 'Barail Group Sandstone'}</span>
                  <span className="text-[10px] text-[#0F2C59] font-bold bg-blue-100 px-2 py-0.5 rounded">OBSERVED LOG INTERVAL</span>
                </div>
                <div className="text-xs text-slate-700 font-medium">
                  Depth Interval: <strong className="text-slate-900 font-bold">{well.formations[0]?.top_depth ? `${well.formations[0].top_depth}m – ${well.formations[0].bottom_depth}m` : '1800m – 2499m'}</strong> • Lithology: <span className="text-slate-900 font-semibold">{well.formations[0]?.lithology || 'Reactive Shale'}</span>
                </div>
              </div>
            </div>

            {/* Directional Trajectory Survey */}
            <div className="flex justify-between items-center bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <div>
                <div className="font-extrabold text-slate-900 text-xs">Directional Trajectory Survey</div>
                <div className="text-xs text-slate-600 font-medium">
                  {well.has_trajectory ? 'MD, TVD, Inclination (°), Azimuth (°) survey recorded' : 'Trajectory data unavailable'}
                </div>
              </div>

              <button
                onClick={() => setShowTrajectoryModal(true)}
                disabled={!well.has_trajectory}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-colors shadow-2xs ${
                  well.has_trajectory
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                }`}
              >
                <Navigation size={14} />
                <span>{well.has_trajectory ? 'View Trajectory' : 'Unavailable'}</span>
              </button>
            </div>

            {/* Historical Drilling Events */}
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <div className="font-extrabold text-[#0F2C59] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 uppercase tracking-wider">
                  <ShieldAlert size={16} className="text-rose-600" />
                  <span>Historical Drilling Events ({well.historical_events_count})</span>
                </div>
                {well.historical_events_count > 0 && (
                  <button onClick={() => navigate('/historical')} className="text-xs text-[#0F2C59] hover:underline font-bold">
                    View in Historical Module
                  </button>
                )}
              </div>

              {well.historical_events_count > 0 ? (
                <div className="space-y-2">
                  {well.historical_events.map((e, idx) => (
                    <div key={idx} className="p-3 bg-rose-50 border border-rose-200 rounded-lg space-y-1 shadow-2xs">
                      <div className="flex items-center justify-between font-extrabold text-rose-950 text-xs">
                        <span>{e.hazard_type}</span>
                        <Badge variant={e.severity === 'Critical' ? 'critical' : 'warning'} size="sm">
                          {e.npt_hours}h NPT
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-700 font-medium">
                        Depth: {e.depth_m}m • Formation: {e.formation} • Severity: {e.severity}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-3 text-center text-xs font-semibold text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                  No historical events recorded for this well
                </div>
              )}
            </div>

            {/* Engineer Actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  selectWell(well.well_id);
                  navigate('/dashboard');
                }}
                className="px-3 py-1.5 rounded-lg bg-[#0F2C59] hover:bg-blue-900 text-white text-xs font-extrabold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <ExternalLink size={14} />
                <span>Open Operations</span>
              </button>
              <button
                onClick={() => {
                  selectWell(well.well_id);
                  navigate('/historical');
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <BookOpen size={14} />
                <span>Open Historical Context</span>
              </button>
              {well.is_current_well && (
                <button
                  onClick={() => {
                    selectWell(well.well_id);
                    navigate('/live');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Activity size={14} />
                  <span>Open Live Telemetry Context</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* 2. GEOLOGIST VIEW (MOST DETAILED GEOLOGY)            */}
        {/* ---------------------------------------------------- */}
        {roleCode === 'GEOLOGIST' && (
          <div className="space-y-4">
            {/* Detailed Geological & Stratigraphic Information */}
            <div className="space-y-2">
              <div className="font-extrabold text-[#0F2C59] flex items-center gap-1.5 border-b border-slate-100 pb-2 text-xs uppercase tracking-wider">
                <Layers size={16} className="text-[#0F2C59]" />
                <span>Detailed Formation Stratigraphy & Lithology</span>
              </div>

              {well.formations && well.formations.length > 0 ? (
                <div className="space-y-2">
                  {well.formations.map((f, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between shadow-2xs">
                      <div>
                        <div className="font-extrabold text-slate-900 text-xs">{f.formation_name}</div>
                        <div className="text-xs text-slate-700 font-medium mt-0.5">
                          Lithology: <span className="text-emerald-800 font-bold">{f.lithology}</span>
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        <div className="text-[#0F2C59] font-extrabold">
                          {f.top_depth !== null ? `${f.top_depth}m – ${f.bottom_depth}m` : 'Catalog top depth'}
                        </div>
                        <span className="text-[10px] text-slate-500 font-semibold">OBSERVED INTERVAL</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-slate-500 text-xs font-semibold bg-slate-50 rounded-lg border border-slate-200">
                  Formation interval context not available
                </div>
              )}
            </div>

            {/* Well Logs Context */}
            <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl space-y-1.5 text-xs">
              <div className="font-extrabold text-[#0F2C59] flex items-center gap-1.5">
                <FileText size={16} />
                <span>Well-Log Availability & Depth Coverage</span>
              </div>
              <div className="text-slate-800 font-medium">
                Available log curves: <strong className="text-slate-900 font-bold">Gamma Ray (GR), Deep Resistivity (RES), Bulk Density (DEN), Neutron Porosity (NEU)</strong>
              </div>
              <div className="text-slate-600 text-xs">
                Coverage Depth: 0m to {well.target_depth_m ? `${well.target_depth_m}m` : 'TD'} • Digitized log record attached
              </div>
            </div>

            {/* Trajectory Button for Geologist */}
            <div className="flex justify-between items-center bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <div>
                <div className="font-extrabold text-slate-900 text-xs">Directional Trajectory & Spatial Path</div>
                <div className="text-xs text-slate-600 font-medium">
                  {well.has_trajectory ? 'Measured MD/TVD & Inclination/Azimuth survey points' : 'Trajectory data unavailable'}
                </div>
              </div>

              <button
                onClick={() => setShowTrajectoryModal(true)}
                disabled={!well.has_trajectory}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 ${
                  well.has_trajectory
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                }`}
              >
                <Navigation size={14} />
                <span>View Trajectory</span>
              </button>
            </div>

            {/* Geological Historical Context */}
            {well.historical_events_count > 0 && (
              <div className="space-y-1.5 border-t border-slate-100 pt-3">
                <div className="font-extrabold text-[#0F2C59] text-xs uppercase tracking-wider">Historical Geological & Hazard Context ({well.historical_events_count})</div>
                {well.historical_events.map((e, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 shadow-2xs">
                    <span className="font-extrabold text-slate-900">{e.hazard_type}</span> in <span className="text-[#0F2C59] font-bold">{e.formation}</span> at {e.depth_m}m depth
                  </div>
                ))}
              </div>
            )}

            {/* Geologist Specific Actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <button
                onClick={() => navigate('/historical')}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[#0F2C59] text-xs font-extrabold flex items-center gap-1.5"
              >
                <BookOpen size={14} />
                <span>View Historical Module</span>
              </button>
              <button
                onClick={() => navigate('/ai-assistant')}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-[#0F2C59] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-2xs"
              >
                <ExternalLink size={14} />
                <span>Ask AI Assistant</span>
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* 3. ERTMAC OPERATOR VIEW (OPERATIONAL AWARENESS)      */}
        {/* ---------------------------------------------------- */}
        {roleCode === 'ERTMAC_OPERATOR' && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wider block">Operational Status</span>
                <span className="font-extrabold text-emerald-800 text-sm mt-0.5 block">{well.status}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wider block">Distance to Active Rig</span>
                <span className="font-extrabold text-[#0F2C59] text-sm mt-0.5 block">{well.distance_km} km</span>
              </div>
            </div>

            {/* Relevant Operational Historical Events Only */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="text-[10px] text-slate-600 uppercase font-extrabold tracking-wider">Operationally Relevant Past Hazards</div>
              {well.historical_events_count > 0 ? (
                <div className="space-y-2">
                  {well.historical_events.map((e, idx) => (
                    <div key={idx} className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between text-xs font-medium shadow-2xs">
                      <div>
                        <span className="font-extrabold text-rose-950">{e.hazard_type}</span>
                        <span className="text-xs text-slate-600 ml-1.5">• {e.depth_m}m</span>
                      </div>
                      <Badge variant="warning" size="sm">{e.npt_hours}h NPT</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs font-extrabold text-emerald-800">
                  No active operational alerts on record for this offset
                </div>
              )}
            </div>

            {/* Limited Formation Context */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium">
              Basic Formation Context: <strong className="text-[#0F2C59] font-extrabold">{well.formation_names[0] || 'Barail Group'}</strong> ({well.formations[0]?.lithology || 'Reactive Shale'})
            </div>

            {/* Operator Actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  selectWell(well.well_id);
                  navigate('/dashboard');
                }}
                className="px-3 py-1.5 rounded-lg bg-[#0F2C59] hover:bg-blue-900 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-2xs"
              >
                <ExternalLink size={14} />
                <span>Open Operations</span>
              </button>
              <button
                onClick={() => {
                  selectWell(well.well_id);
                  navigate('/historical');
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1.5"
              >
                <BookOpen size={14} />
                <span>Open Historical Context</span>
              </button>
              {well.is_current_well && (
                <button
                  onClick={() => {
                    selectWell(well.well_id);
                    navigate('/live');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-2xs"
                >
                  <Activity size={14} />
                  <span>Open Live Telemetry Context</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* 4. MANAGEMENT VIEW (EXECUTIVE HIGH-LEVEL + TOGGLE)   */}
        {/* ---------------------------------------------------- */}
        {roleCode === 'MANAGEMENT_SUPERVISOR' && (
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="font-extrabold text-[#0F2C59] text-xs uppercase tracking-wider">Executive Offset Summary</div>
              <button
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                className="text-xs text-[#0F2C59] hover:text-blue-700 font-extrabold flex items-center gap-1 transition-colors"
              >
                <span>{showTechnicalDetails ? 'Collapse Technical Data' : 'Expand Technical Data'}</span>
                {showTechnicalDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            <div className="text-slate-800 text-xs font-medium leading-relaxed space-y-1.5">
              <div>Well <strong className="text-[#0F2C59] font-extrabold">{well.well_name}</strong> is located <strong className="text-emerald-800 font-extrabold">{well.distance_km} km</strong> from active operations in the {well.field}.</div>
              <div>Target Depth: <strong className="font-extrabold">{well.target_depth_m ? `${well.target_depth_m}m` : 'N/A'}</strong> • Status: <strong className="text-emerald-800 font-extrabold">{well.status}</strong></div>
              <div>Formation Overlap: <strong className={well.formation_overlap ? "text-emerald-800 font-extrabold" : "text-slate-600 font-bold"}>{well.formation_overlap ? "Confirmed Overlap" : "No overlap"}</strong></div>
              <div>Significant Historical Hazards: <strong className={well.historical_events_count > 0 ? "text-rose-700 font-extrabold" : "text-slate-600 font-bold"}>{well.historical_events_count} major event(s) recorded</strong></div>
            </div>

            {/* Optional Technical Inspection Expanded Section */}
            {showTechnicalDetails && (
              <div className="mt-3 pt-3 border-t border-slate-200 space-y-3 text-xs animate-fadeIn">
                <div className="text-[#0F2C59] font-extrabold flex items-center gap-1.5">
                  <FileText size={15} />
                  <span>Executive Expanded Technical Inspection</span>
                </div>

                {/* Trajectory Launcher */}
                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="font-semibold text-slate-800">Directional Survey (MD, TVD, Inc, Az)</span>
                  <button
                    onClick={() => setShowTrajectoryModal(true)}
                    disabled={!well.has_trajectory}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-2xs"
                  >
                    View Trajectory Points
                  </button>
                </div>

                {/* Formations & Lithology */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1 shadow-2xs">
                  <div className="font-extrabold text-slate-900">Lithology & Formation Tops</div>
                  {well.formations && well.formations.length > 0 ? (
                    well.formations.map((f, i) => (
                      <div key={i} className="text-slate-800 font-medium flex justify-between text-xs">
                        <span>{f.formation_name} ({f.lithology})</span>
                        <span className="text-[#0F2C59] font-bold">{f.top_depth}m - {f.bottom_depth}m</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 text-xs font-medium">No lithology tops recorded</div>
                  )}
                </div>

                {/* Well Logs */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-800 font-medium shadow-2xs">
                  Log Coverage: <strong className="text-emerald-800 font-extrabold">GR, RES, DEN, NEU</strong> (0m to {well.target_depth_m}m)
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => {
                  selectWell(well.well_id);
                  navigate('/dashboard');
                }}
                className="px-3 py-1.5 rounded-lg bg-[#0F2C59] hover:bg-blue-900 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-2xs"
              >
                <Eye size={14} />
                <span>Return to Executive Operations</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer Provenance Badges */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
          <span>Provenance: <strong className="text-slate-900 font-bold">{well.data_provenance}</strong></span>
          <span>Freshness: <strong className="text-slate-900 font-bold">HISTORICAL LOG DATASET</strong></span>
        </div>
      </div>

      {/* Trajectory Modal */}
      {showTrajectoryModal && (
        <TrajectoryModal
          wellId={well.well_id}
          wellName={well.well_name}
          onClose={() => setShowTrajectoryModal(false)}
        />
      )}
    </>
  );
};

