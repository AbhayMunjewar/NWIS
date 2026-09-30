import React, { useState, useEffect } from 'react';
import {
  FileText, CheckCircle2, Edit3, X, ShieldCheck,
  AlertTriangle, Layers, MapPin, Plus, Trash2
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import {
  fetchNearbyWellsApi,
  fetchPredrillEventsApi,
  fetchGeologicalDataApi
} from '../../lib/api';

interface Props {
  wellId: string;
  wellName: string;
  onClose: () => void;
  onProceedSubmit: (finalReportData: any) => Promise<void>;
}

export const PreDrillReportPreviewModal: React.FC<Props> = ({
  wellId,
  wellName,
  onClose,
  onProceedSubmit
}) => {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Editable Form State (Option 2: Make Changes)
  const [reportTitle, setReportTitle] = useState(`Pre-Drill Geological & Hazard Analysis Report — ${wellName}`);
  const [executiveSummary, setExecutiveSummary] = useState(
    `Comprehensive 3-track pre-drill research package for ${wellName} (Duliajan Field). Evaluated 5 nearby offset wells, 18 regional historical hazard events (stuck pipe at 2,210m, gas kick at 2,842m), formation stratigraphy (Tipam, Barail, Kopili, Sylhet), and established safe PPFG mud weight windows.`
  );
  const [hazards, setHazards] = useState<any[]>([
    {
      hazard_type: 'Stuck Pipe',
      formation: 'Barail Group',
      depth_range: '1,800m - 2,500m',
      severity: 'HIGH',
      description: 'Reactive Smectite/Illite shale expansion — high swelling potential. Historical stuck pipe at 2,210m in DUL-92 with 36.5h NPT.',
      recommended_monitoring: 'Torque (+30% threshold), ROP, SPP, ECD'
    },
    {
      hazard_type: 'Gas Kick',
      formation: 'Kopili Formation',
      depth_range: '2,500m - 3,100m',
      severity: 'CRITICAL',
      description: 'Overpressured marine shale with high pressure gas influx history (SICP 350 psi in DUL-88). Mud weight window 1.32 - 1.36 g/cc.',
      recommended_monitoring: 'Mud Weight (API Barite), Flow Out, Pit Volume, Gas Units'
    },
    {
      hazard_type: 'Lost Circulation',
      formation: 'Sylhet Limestone',
      depth_range: '3,100m - 3,900m',
      severity: 'CRITICAL',
      description: 'Karst fracture network in limestone resulting in 100% total fluid loss (historical 44h NPT in DUL-99).',
      recommended_monitoring: 'Coarse LCM Pills, Standby Cement Squeeze, ECD control'
    }
  ]);

  const [directives, setDirectives] = useState<string[]>([
    'Maintain inhibitive KCl-Glycol mud weight ≥ 1.22 g/cc through Barail shale interval.',
    'Monitor torque trend — set early warning alert threshold at +30% above baseline.',
    'Pre-load 50 bbl Glycol spotting pill on active mud system as contingency.',
    'Execute wiper trips every 150m through reactive Barail shale stringers.',
    'Pre-load Coarse LCM (Nut Plug + Mica) prior to drilling into Sylhet Limestone contact.'
  ]);

  // Fetched 3-Track Subsurface Data
  const [nearbyWellsData, setNearbyWellsData] = useState<any>(null);
  const [predrillEventsData, setPredrillEventsData] = useState<any>(null);
  const [geologicalData, setGeologicalData] = useState<any>(null);

  useEffect(() => {
    const loadAllTracks = async () => {
      setLoading(true);
      try {
        const [nw, pe, geo] = await Promise.all([
          fetchNearbyWellsApi(wellId, 150.0, token || undefined),
          fetchPredrillEventsApi(wellId, 150.0, token || undefined),
          fetchGeologicalDataApi(wellId, token || undefined)
        ]);
        setNearbyWellsData(nw);
        setPredrillEventsData(pe);
        setGeologicalData(geo);
      } catch (e) {
        console.error('Failed to load 3-track data for preview', e);
      } finally {
        setLoading(false);
      }
    };
    loadAllTracks();
  }, [wellId, token]);

  const handleAddDirective = () => {
    setDirectives([...directives, 'New operational pre-drill guideline requirement']);
  };

  const handleRemoveDirective = (index: number) => {
    setDirectives(directives.filter((_, i) => i !== index));
  };

  const handleDirectiveChange = (index: number, val: string) => {
    const next = [...directives];
    next[index] = val;
    setDirectives(next);
  };

  const handleHazardDescriptionChange = (index: number, val: string) => {
    const next = [...hazards];
    next[index] = { ...next[index], description: val };
    setHazards(next);
  };

  // Option 1: Correct Report & Proceed Handler
  const handleProceed = async () => {
    setSubmitting(true);
    try {
      const finalReportData = {
        title: reportTitle,
        executive_summary: executiveSummary,
        hazards: hazards,
        directives: directives,
        offset_wells: nearbyWellsData?.nearby_wells || [],
        events: predrillEventsData?.events || [],
        formations: geologicalData?.formations || [],
        ppfg_window: predrillEventsData?.ppfg_window || [],
        casing_program: predrillEventsData?.recommended_casing_program || []
      };
      await onProceedSubmit(finalReportData);
    } catch (e) {
      console.error('Proceed submission error:', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Control Bar */}
        <div className="px-5 py-3.5 bg-[#0F2C59] text-white flex items-center justify-between border-b border-[#0A2540]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-extrabold text-white">
                  {isEditing ? 'Editing Pre-Drill Geological Package' : 'Pre-Drill Report Official PDF Preview'}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                  PDF Preview Mode
                </span>
                {isEditing && (
                  <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase animate-pulse">
                    ✏️ Editing Mode Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Target Well: <strong className="text-white">{wellName}</strong> • Field: <strong className="text-white">Duliajan Field</strong> • Author: <strong className="text-amber-300">{user?.roleDisplayName || 'Lead Geologist'}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Close Preview"
          >
            <X size={18} />
          </button>
        </div>

        {/* PDF Document Container Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 space-y-6">
          {loading ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="text-xs font-bold text-slate-600">Generating Official PDF Report Stream...</div>
            </div>
          ) : (
            <div className="bg-white border border-slate-300 rounded-xl shadow-lg p-6 sm:p-8 space-y-6 max-w-4xl mx-auto text-slate-900 font-sans">
              {/* Report Letterhead Header */}
              <div className="border-b-2 border-[#0F2C59] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#0F2C59] text-amber-400 font-black text-xl flex items-center justify-center border border-slate-700 shadow-md">
                    OIL
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl font-black text-[#0F2C59] uppercase tracking-tight">
                      OIL INDIA LIMITED
                    </h1>
                    <div className="text-[11px] font-extrabold text-slate-600 tracking-wider uppercase">
                      National Drilling Intelligence Portal • Pre-Drill Analysis Package
                    </div>
                  </div>
                </div>

                <div className="text-right text-xs font-medium text-slate-600">
                  <div>Report ID: <strong className="text-slate-900 font-mono">PRE-{wellId}-2026</strong></div>
                  <div>Generated: <strong className="text-slate-900">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</strong></div>
                  <div>Classification: <strong className="text-rose-700 font-extrabold">CONFIDENTIAL GEOLOGY</strong></div>
                </div>
              </div>

              {/* Title & Editable Header */}
              <div>
                {isEditing ? (
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-slate-500">Report Title</label>
                    <input
                      type="text"
                      value={reportTitle}
                      onChange={e => setReportTitle(e.target.value)}
                      className="w-full text-base font-extrabold text-[#0F2C59] border border-amber-400 rounded-lg p-2 bg-amber-50/40"
                    />
                  </div>
                ) : (
                  <h2 className="text-base sm:text-lg font-extrabold text-[#0F2C59] border-l-4 border-amber-500 pl-3">
                    {reportTitle}
                  </h2>
                )}
              </div>

              {/* Section 1: Executive Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="text-xs font-extrabold text-[#0F2C59] uppercase tracking-wider flex items-center gap-2">
                  <FileText size={14} className="text-blue-700" />
                  <span>Section 1: Executive Summary & Geologist Subsurface Evaluation</span>
                </div>

                {isEditing ? (
                  <textarea
                    rows={4}
                    value={executiveSummary}
                    onChange={e => setExecutiveSummary(e.target.value)}
                    className="w-full text-xs text-slate-800 border border-amber-400 rounded-lg p-2 bg-amber-50/30 focus:bg-white"
                  />
                ) : (
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {executiveSummary}
                  </p>
                )}
              </div>

              {/* Section 2: GIS Nearby Offset Wells Summary */}
              <div className="space-y-2">
                <div className="text-xs font-extrabold text-[#0F2C59] uppercase tracking-wider flex items-center gap-2">
                  <MapPin size={14} className="text-blue-600" />
                  <span>Section 2: Regional Offset Wells Spatial Analysis ({nearbyWellsData?.nearby_wells?.length || 0} Offset Wells)</span>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-extrabold text-slate-600 uppercase">
                        <th className="p-2">Well Name</th>
                        <th className="p-2">Field</th>
                        <th className="p-2 text-right">Distance</th>
                        <th className="p-2 text-center">Bearing</th>
                        <th className="p-2 text-right">Target Depth</th>
                        <th className="p-2 text-center">Status</th>
                        <th className="p-2 text-center">Incidents</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(nearbyWellsData?.nearby_wells || []).slice(0, 5).map((w: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50 font-medium text-slate-800">
                          <td className="p-2 font-extrabold text-slate-900">{w.well_name}</td>
                          <td className="p-2">{w.field}</td>
                          <td className="p-2 text-right font-bold text-blue-700">{w.distance_km} km</td>
                          <td className="p-2 text-center">{w.bearing}</td>
                          <td className="p-2 text-right">{w.target_depth_m}m</td>
                          <td className="p-2 text-center"><span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-950 font-extrabold text-[10px]">{w.status}</span></td>
                          <td className="p-2 text-center font-extrabold text-amber-700">{w.event_count || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 3: Stratigraphic Formation Tops & PPFG Window */}
              <div className="space-y-2">
                <div className="text-xs font-extrabold text-[#0F2C59] uppercase tracking-wider flex items-center gap-2">
                  <Layers size={14} className="text-purple-600" />
                  <span>Section 3: Stratigraphy & Pore Pressure Safe Mud Window (PPFG)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Formation Tops */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-100 px-3 py-1.5 text-[10px] font-extrabold text-slate-700 uppercase border-b border-slate-200">
                      Formation Tops & Lithology
                    </div>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-bold text-slate-500 uppercase">
                          <th className="p-1.5">Formation</th>
                          <th className="p-1.5 text-right">Top</th>
                          <th className="p-1.5 text-right">Bottom</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px] font-medium">
                        {(geologicalData?.formations || []).map((f: any, i: number) => (
                          <tr key={i}>
                            <td className="p-1.5 font-bold text-slate-900">{f.formation_name}</td>
                            <td className="p-1.5 text-right">{f.top_depth_m}m</td>
                            <td className="p-1.5 text-right">{f.bottom_depth_m}m</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* PPFG Mud Window */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-100 px-3 py-1.5 text-[10px] font-extrabold text-slate-700 uppercase border-b border-slate-200">
                      Safe Mud Density Bounds (g/cc)
                    </div>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-bold text-slate-500 uppercase">
                          <th className="p-1.5">Formation</th>
                          <th className="p-1.5 text-center">Pore Press.</th>
                          <th className="p-1.5 text-center">Safe Mud Wt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px] font-medium">
                        {(predrillEventsData?.ppfg_window || []).map((pp: any, i: number) => (
                          <tr key={i}>
                            <td className="p-1.5 font-bold text-slate-900">{pp.formation}</td>
                            <td className="p-1.5 text-center text-rose-700 font-bold">{pp.pore_pressure_emw} g/cc</td>
                            <td className="p-1.5 text-center">
                              <span className="bg-emerald-100 text-emerald-950 font-black px-1.5 py-0.5 rounded text-[10px]">
                                {pp.safe_mw_min} - {pp.safe_mw_max} g/cc
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Section 4: Expected Pre-Drill Hazard Risks */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-extrabold text-[#0F2C59] uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle size={14} className="text-amber-600" />
                    <span>Section 4: Key Pre-Drill Hazard Risks & Monitoring Criteria</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  {hazards.map((h: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 flex items-center gap-2">
                          ⚠️ {h.hazard_type} ({h.formation})
                        </span>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border ${
                          h.severity === 'CRITICAL' ? 'bg-rose-100 border-rose-300 text-rose-800' : 'bg-amber-100 border-amber-300 text-amber-800'
                        }`}>
                          {h.severity}
                        </span>
                      </div>
                      {isEditing ? (
                        <textarea
                          rows={2}
                          value={h.description}
                          onChange={(e) => handleHazardDescriptionChange(idx, e.target.value)}
                          className="w-full text-[11px] text-slate-800 border border-amber-400 rounded-lg p-2 bg-amber-50/30 font-medium"
                        />
                      ) : (
                        <p className="text-slate-700 text-[11px]">{h.description}</p>
                      )}
                      <div className="text-[10px] text-blue-900 font-bold">
                        Target Monitoring: {h.recommended_monitoring}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 5: Geologist Pre-Drill Directives */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-extrabold text-[#0F2C59] uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>Section 5: Recommended Geologist Directives & Field Safeguards</span>
                  </div>
                  {isEditing && (
                    <button
                      onClick={handleAddDirective}
                      className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded flex items-center gap-1 hover:bg-emerald-200"
                    >
                      <Plus size={10} /> Add Directive
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 text-xs">
                  {directives.map((dir: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-extrabold mt-0.5">✓</span>
                      {isEditing ? (
                        <div className="flex-1 flex items-center gap-2">
                          <input
                            type="text"
                            value={dir}
                            onChange={e => handleDirectiveChange(idx, e.target.value)}
                            className="flex-1 text-xs border border-amber-400 rounded p-1 bg-amber-50/30"
                          />
                          <button
                            onClick={() => handleRemoveDirective(idx)}
                            className="text-rose-600 hover:text-rose-800 p-1"
                            title="Delete Directive"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-800 font-medium">{dir}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Official Sign-Off Footer */}
              <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Authenticated Geological Package • eRTMAC National Portal</span>
                </div>
                <div>Status: <strong className="text-amber-700 font-bold">READY FOR DE SUBMISSION</strong></div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Footer Bar: 2 Primary Options */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300">Geologist Decision:</span>
            <span className="text-[11px] text-slate-400">Review generated package before committing to Drilling Engineer queue.</span>
          </div>

          <div className="flex items-center gap-3">
            {/* OPTION 2: Make Changes in Report */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-2 border shadow-sm ${
                isEditing
                  ? 'bg-amber-500 text-slate-950 border-amber-400 hover:bg-amber-400 font-extrabold'
                  : 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Edit3 size={15} />
              <span>{isEditing ? 'Done Editing (Save Changes)' : 'Option 2: ✏️ Make Changes in Report'}</span>
            </button>

            {/* OPTION 1: Correct Report & Proceed (Submit) */}
            <button
              onClick={handleProceed}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-colors flex items-center gap-2 shadow-md disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving to Reports Workspace & Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Option 1: ✅ Correct Report & Proceed (Submit to DE)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
