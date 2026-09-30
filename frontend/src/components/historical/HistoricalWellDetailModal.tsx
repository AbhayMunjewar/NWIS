import React, { useState, useEffect } from 'react';
import type { WellDetail, WellLogs, WellTrajectory, HistoricalComparison, HistoricalDocument } from '../../types/historical';
import { fetchWellLogsApi, fetchWellTrajectoryApi, fetchHistoricalComparisonApi } from '../../lib/api';
import { X, Database, Layers, Activity, Compass, AlertTriangle, FileText, Bot, Scale, FileCheck, Eye, Download, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { PdfViewerModal } from './PdfViewerModal';

interface Props {
  wellId: string;
  detail: WellDetail | null;
  globalWellId: string;
  globalWellName: string;
  roleCode?: string;
  token?: string;
  initialTab?: 'overview' | 'documents' | 'formations' | 'logs' | 'trajectory' | 'events' | 'casing' | 'comparison';
  onClose: () => void;
}

export const HistoricalWellDetailModal: React.FC<Props> = ({
  wellId,
  detail,
  globalWellId,
  globalWellName,
  token,
  initialTab = 'overview',
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'formations' | 'logs' | 'trajectory' | 'events' | 'casing' | 'comparison'>(initialTab);
  const [logs, setLogs] = useState<WellLogs | null>(null);
  const [trajectory, setTrajectory] = useState<WellTrajectory | null>(null);
  const [comparison, setComparison] = useState<HistoricalComparison | null>(null);
  const [similarityData, setSimilarityData] = useState<any>(null);
  const [selectedPdfDoc, setSelectedPdfDoc] = useState<HistoricalDocument | null>(null);
  const [aiCopied, setAiCopied] = useState(false);

  const tabsContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      tabsContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (wellId) {
      fetchWellLogsApi(wellId, token).then(setLogs);
      fetchWellTrajectoryApi(wellId, token).then(setTrajectory);
      fetchHistoricalComparisonApi(globalWellId, wellId, token).then(setComparison);
      fetch(`http://localhost:8000/api/v1/ml/similarity/${wellId}`)
        .then(r => r.json())
        .then(setSimilarityData)
        .catch(() => {});
    }
  }, [wellId, globalWellId, token]);

  if (!detail) return null;

  const { well, formations, events, casing, mud_program, source_traceability } = detail;

  const handleAskAI = () => {
    const aiContext = `
[HISTORICAL EVIDENCE ANALYSIS HANDOFF]
Historical Well: ${well.well_name} (${well.well_id})
Field: ${well.field} | Basin: ${well.basin} | Target Depth: ${well.target_depth_m} m
Status: ${well.status} | Spud Date: ${well.spud_date} | Completion: ${well.completion_date}

Formations Encountered:
${formations.map(f => `- ${f.formation_name}: ${f.top_depth_m}m - ${f.bottom_depth_m}m (${f.lithology})`).join('\n')}

Historical Drilling Incidents:
${events.map(e => `- Incident ${e.incident_id}: ${e.hazard_type} (${e.severity}) at ${e.depth_m}m in ${e.formation}.\n  Root Cause: ${e.root_cause}\n  Mitigation: ${e.mitigation_applied}\n  NPT: ${e.npt_hours} hrs | Source: ${e.source_document}`).join('\n')}

Casing & Mud Program:
${casing.map(c => `- Casing: ${c.casing_size} @ ${c.setting_depth}m (${c.grade})`).join('\n')}
${mud_program.map(m => `- Mud: ${m.fluid_type} @ ${m.depth_m}m (${m.mud_weight_gcc} g/cc)`).join('\n')}

Traceable Source: ${source_traceability?.document || 'WCR Records'} (${source_traceability?.section || 'N/A'})
`;

    navigator.clipboard.writeText(aiContext);
    setAiCopied(true);
    setTimeout(() => setAiCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-50 text-[#0F2C59] border border-cyan-200">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-[#0F2C59]">{well.well_name}</h2>
                <span className="px-2 py-0.5 text-xs rounded bg-slate-200 text-slate-900 font-extrabold">
                  {well.well_id}
                </span>
                <span className="px-2 py-0.5 text-xs rounded bg-emerald-100 text-emerald-950 border border-emerald-300 font-extrabold">
                  {well.status}
                </span>
              </div>
              <p className="text-xs text-slate-700 font-semibold mt-0.5">
                {well.field} • {well.basin} • Target Depth: <strong className="text-slate-900 font-black">{well.target_depth_m} m</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors border border-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs with Left/Right Scroll Arrow Controls */}
        <div className="relative border-b border-slate-200 bg-slate-50 flex items-center px-2">
          <button
            onClick={() => scrollTabs('left')}
            title="Scroll tabs left"
            className="p-1.5 rounded-lg text-slate-600 hover:text-[#0F2C59] hover:bg-slate-200 transition-colors z-10 shrink-0"
          >
            <ChevronLeft size={16} />
          </button>

          <div
            ref={tabsContainerRef}
            className="flex flex-1 overflow-x-auto text-xs font-extrabold scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent scroll-smooth no-scrollbar"
            style={{ scrollbarWidth: 'thin' }}
          >
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'overview' ? 'border-[#0F2C59] text-[#0F2C59] bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'documents' ? 'border-[#0F2C59] text-[#0F2C59] bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText size={14} className={detail.documents && detail.documents.length > 0 ? 'text-rose-600' : 'text-slate-500'} />
              Documents & Reports ({detail.documents ? detail.documents.length : 0})
            </button>
            <button
              onClick={() => setActiveTab('formations')}
              className={`py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'formations' ? 'border-[#0F2C59] text-[#0F2C59] bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Formations ({formations.length})
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'events' ? 'border-[#0F2C59] text-[#0F2C59] bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Historical Incidents ({events.length})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'logs' ? 'border-[#0F2C59] text-[#0F2C59] bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Well Logs Curves
            </button>
            <button
              onClick={() => setActiveTab('trajectory')}
              className={`py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'trajectory' ? 'border-[#0F2C59] text-[#0F2C59] bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Trajectory Survey
            </button>
            <button
              onClick={() => setActiveTab('casing')}
              className={`py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'casing' ? 'border-[#0F2C59] text-[#0F2C59] bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Casing & Mud
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`py-3 px-3.5 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'comparison' ? 'border-[#0F2C59] text-[#0F2C59] bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Offset Comparison
            </button>
          </div>

          <button
            onClick={() => scrollTabs('right')}
            title="Scroll tabs right"
            className="p-1.5 rounded-lg text-slate-600 hover:text-[#0F2C59] hover:bg-slate-200 transition-colors z-10 shrink-0"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <div>
                  <span className="text-slate-600 block text-[11px] font-extrabold uppercase">Spud Date</span>
                  <strong className="text-slate-900 font-extrabold">{well.spud_date}</strong>
                </div>
                <div>
                  <span className="text-slate-600 block text-[11px] font-extrabold uppercase">Completion Date</span>
                  <strong className="text-slate-900 font-extrabold">{well.completion_date}</strong>
                </div>
                <div>
                  <span className="text-slate-600 block text-[11px] font-extrabold uppercase">Total Depth</span>
                  <strong className="text-slate-900 font-extrabold">{well.target_depth_m} m</strong>
                </div>
                <div>
                  <span className="text-slate-600 block text-[11px] font-extrabold uppercase">Coordinates</span>
                  <strong className="text-slate-900 font-extrabold text-[11px]">{well.latitude.toFixed(3)}°, {well.longitude.toFixed(3)}°</strong>
                </div>
              </div>

              {/* Top 5 Ranked Similar Offset Wells Card */}
              {similarityData?.similar_wells && similarityData.similar_wells.length > 0 && (
                <div className="space-y-2 bg-purple-50/60 p-4 rounded-xl border border-purple-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-extrabold text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                      <span>🗺️ TOP 5 RANKED SIMILAR OFFSET WELLS FOR {well.well_name} (k-NN ML ENGINE)</span>
                    </div>
                    <span className="text-[10px] font-bold text-purple-900">Euclidean Distance Matrix</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-2">
                    {similarityData.similar_wells.slice(0, 5).map((sim: any, idx: number) => (
                      <div key={idx} className="p-3 bg-white border border-purple-200 rounded-lg flex flex-col gap-1 hover:border-purple-400 transition-colors shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-950 text-[10px] font-extrabold flex items-center justify-center border border-purple-300">
                              #{idx + 1}
                            </span>
                            <strong className="text-slate-900 text-xs font-extrabold">{sim.well_name} ({sim.well_id})</strong>
                          </div>
                          <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-emerald-100 text-emerald-950 border border-emerald-300">
                            {sim.similarity_score}% Match
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-700 font-bold flex items-center justify-between">
                          <span>Field: <strong className="text-slate-900 font-black">{sim.field}</strong></span>
                          <span>Target Depth: <strong className="text-slate-900 font-black">{sim.target_depth_m}m</strong></span>
                        </div>
                        <div className="text-[10px] text-slate-800 bg-slate-50 p-2 rounded border border-slate-200 space-y-0.5 mt-1 font-semibold">
                          <div className="text-[9px] text-slate-600 font-extrabold uppercase">Matched Factors</div>
                          {sim.matched_factors.map((mf: string, mfi: number) => (
                            <div key={mfi} className="text-emerald-800 flex items-center gap-1 font-bold">
                              <span>✓</span>
                              <span>{mf}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Major Highlights */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
                <h4 className="font-extrabold text-[#0F2C59] text-sm flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#0F2C59]" />
                  Historical Evidence & Documentation Status
                </h4>
                <p className="text-slate-800 font-semibold leading-relaxed">
                  Well {well.well_name} was spudded on {well.spud_date} in the {well.field} ({well.basin}). Target depth reached at {well.target_depth_m}m penetrating {formations.length} stratigraphy formations.
                </p>

                {/* Verified Document Availability Notice */}
                {detail.documents && detail.documents.length > 0 ? (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-950 font-semibold flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-blue-700 shrink-0" />
                      <span><strong>Verified Documentation:</strong> {detail.documents.length} original historical report(s) available for {well.well_name}.</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('documents')}
                      className="px-2.5 py-1 bg-[#0F2C59] hover:bg-[#1E3A8A] text-white rounded-md text-[11px] font-extrabold shrink-0 shadow-2xs"
                    >
                      View Reports ({detail.documents.length})
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-950 font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span><strong>Document Status:</strong> Original historical report not available in the connected repository. Structured operational logging data remains fully accessible.</span>
                  </div>
                )}
              </div>

              {source_traceability && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1 text-slate-700 font-semibold">
                  <span className="font-extrabold text-[#0F2C59] text-[11px] block uppercase tracking-wider">Traceable Source Metadata</span>
                  <p>Document: <strong className="text-slate-900 font-bold">{source_traceability.document}</strong></p>
                  <p>Source Type: <strong className="text-slate-900 font-bold">{source_traceability.source_type}</strong> ({source_traceability.section})</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DOCUMENTS & REPORTS */}
          {activeTab === 'documents' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-[#0F2C59] text-sm flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-rose-700" />
                  Original Existing Reports & PDF Documentation
                </h4>
                <span className="text-slate-600 font-bold text-[11px]">
                  {detail.documents ? detail.documents.length : 0} Verified Files
                </span>
              </div>

              {detail.documents && detail.documents.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {detail.documents.map((doc) => (
                    <div
                      key={doc.doc_id}
                      className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 shadow-2xs transition-colors"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-slate-900">{doc.doc_id}</span>
                          <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-rose-100 text-rose-950 border border-rose-300 uppercase">
                            {doc.file_format}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-blue-100 text-blue-950 border border-blue-300">
                            {doc.document_type}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-emerald-100 text-emerald-950 border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            {doc.ocr_status}
                          </span>
                        </div>

                        <h5 className="font-extrabold text-slate-900 text-sm">{doc.document_name}</h5>
                        <p className="text-slate-700 font-medium text-xs">{doc.summary}</p>

                        <div className="flex items-center gap-3 text-[11px] text-slate-600 font-bold">
                          <span>Classification: <strong className="text-slate-900 font-extrabold">{doc.source_classification}</strong></span>
                          <span>•</span>
                          <span>Associated Well: <strong className="text-slate-900 font-extrabold">{doc.associated_well}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setSelectedPdfDoc(doc)}
                          className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-colors shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-rose-700" />
                          VIEW PDF
                        </button>
                        <a
                          href={`http://localhost:8000${doc.download_url}`}
                          download
                          className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-lg transition-colors shadow-2xs"
                          title="Download Report"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 bg-white border border-amber-200 rounded-xl text-center space-y-2 shadow-xs">
                  <AlertTriangle className="w-10 h-10 text-amber-600 mx-auto opacity-80" />
                  <h4 className="text-sm font-extrabold text-slate-900">Original Historical Report Not Available</h4>
                  <p className="text-xs text-slate-700 font-semibold max-w-md mx-auto">
                    Original historical report not available in the connected repository. Structured operational logging data (Formations, Well Logs, Trajectory, Incidents, Casing & Mud) is displayed directly from verified data files.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FORMATIONS */}
          {activeTab === 'formations' && (
            <div className="space-y-4 text-xs">
              <h4 className="font-extrabold text-[#0F2C59] text-sm flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-700" />
                Penetrated Stratigraphy & Lithology Intervals
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-[11px] text-slate-700 font-extrabold uppercase">
                      <th className="py-2.5 px-3">Formation</th>
                      <th className="py-2.5 px-3">Top Depth</th>
                      <th className="py-2.5 px-3">Bottom Depth</th>
                      <th className="py-2.5 px-3">Lithology</th>
                      <th className="py-2.5 px-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs font-medium">
                    {formations.map((f, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-extrabold text-slate-900">{f.formation_name}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{f.top_depth_m} m</td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{f.bottom_depth_m} m</td>
                        <td className="py-2.5 px-3 font-extrabold text-purple-950">{f.lithology}</td>
                        <td className="py-2.5 px-3 text-slate-700 font-semibold">{f.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: EVENTS */}
          {activeTab === 'events' && (
            <div className="space-y-4 text-xs">
              <h4 className="font-extrabold text-[#0F2C59] text-sm flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Historical Drilling Incidents & Mitigation Evidence
              </h4>

              {events.length === 0 ? (
                <div className="p-6 bg-white border border-slate-200 rounded-xl text-center text-slate-600 font-semibold shadow-xs">
                  No historical incidents recorded for this well.
                </div>
              ) : (
                events.map((e) => (
                  <div key={e.incident_id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">{e.incident_id}</span>
                        <span className="font-extrabold text-rose-700 text-sm">{e.hazard_type}</span>
                        <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-rose-100 text-rose-950 border border-rose-300">
                          {e.severity}
                        </span>
                      </div>
                      <span className="font-extrabold text-slate-700">{e.depth_m} m ({e.formation})</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700 font-semibold">
                      <div>Start Depth: <strong className="text-slate-900 font-black">{e.start_depth} m</strong></div>
                      <div>End Depth: <strong className="text-slate-900 font-black">{e.end_depth} m</strong></div>
                      <div>NPT Hours: <strong className="text-rose-700 font-black">{e.npt_hours} hrs</strong></div>
                      <div>Est. Loss: <strong className="text-amber-800 font-black">₹{(e.cost_loss_inr / 100000).toFixed(1)} Lakhs</strong></div>
                    </div>

                    <div className="space-y-1.5 bg-slate-50 border border-slate-200 p-3 rounded-lg">
                      <span className="font-extrabold text-slate-700 block text-[11px] uppercase tracking-wider">Root Cause:</span>
                      <p className="text-slate-900 font-semibold">{e.root_cause}</p>

                      <span className="font-extrabold text-emerald-800 block text-[11px] uppercase tracking-wider mt-2">Mitigation Applied:</span>
                      <p className="text-emerald-900 font-bold">{e.mitigation_applied}</p>

                      <span className="text-[10px] text-slate-600 font-bold block mt-2">
                        Source Report: {e.source_document}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: WELL LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-[#0F2C59] text-sm flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#0F2C59]" />
                  Depth-Indexed Wireline / LWD Logs (GR, RES, RHOB)
                </h4>
                <span className="text-slate-600 font-bold text-[11px]">
                  Interval: 1,800m - 2,500m
                </span>
              </div>

              {logs && logs.points ? (
                <div className="bg-white border border-slate-200 rounded-xl p-4 overflow-x-auto shadow-xs">
                  <div className="grid grid-cols-5 gap-2 text-[11px] font-extrabold text-slate-700 border-b border-slate-200 pb-2 mb-2 uppercase">
                    <div>Depth (m)</div>
                    <div>Gamma Ray (GR API)</div>
                    <div>Resistivity (RES ohm.m)</div>
                    <div>Density (RHOB g/cc)</div>
                    <div>Sonic (DTC us/ft)</div>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-1 font-bold text-[11px]">
                    {logs.points.map((p, idx) => (
                      <div key={idx} className="grid grid-cols-5 gap-2 text-slate-900 py-1 hover:bg-slate-50 border-b border-slate-100">
                        <span className="text-[#0F2C59] font-black">{p.depth_m}</span>
                        <span>{p.GR}</span>
                        <span>{p.RES}</span>
                        <span>{p.RHOB}</span>
                        <span>{p.DTC}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-white border border-slate-200 rounded-xl text-center text-slate-600 font-semibold shadow-xs">
                  Loading well log curves...
                </div>
              )}
            </div>
          )}

          {/* TAB 5: TRAJECTORY */}
          {activeTab === 'trajectory' && (
            <div className="space-y-4 text-xs">
              <h4 className="font-extrabold text-[#0F2C59] text-sm flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#0F2C59]" />
                Directional Survey Trajectory
              </h4>

              {trajectory && trajectory.points ? (
                <div className="bg-white border border-slate-200 rounded-xl p-4 overflow-x-auto shadow-xs">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-700 font-extrabold uppercase">
                        <th className="py-2 px-3">MD (m)</th>
                        <th className="py-2 px-3">TVD (m)</th>
                        <th className="py-2 px-3">Inclination (°)</th>
                        <th className="py-2 px-3">Azimuth (°)</th>
                        <th className="py-2 px-3">Easting (m)</th>
                        <th className="py-2 px-3">Northing (m)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-bold text-slate-900">
                      {trajectory.points.map((tp, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-1.5 px-3 text-[#0F2C59] font-black">{tp.md_m}</td>
                          <td className="py-1.5 px-3">{tp.tvd_m}</td>
                          <td className="py-1.5 px-3">{tp.inclination_deg}°</td>
                          <td className="py-1.5 px-3">{tp.azimuth_deg}°</td>
                          <td className="py-1.5 px-3">{tp.easting_m}</td>
                          <td className="py-1.5 px-3">{tp.northing_m}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 bg-white border border-slate-200 rounded-xl text-center text-slate-600 font-semibold shadow-xs">
                  Loading trajectory survey data...
                </div>
              )}
            </div>
          )}

          {/* TAB 6: CASING & MUD */}
          {activeTab === 'casing' && (
            <div className="space-y-6 text-xs">
              {/* Casing Section */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-[#0F2C59] text-sm">Casing Program</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse bg-white border border-slate-200 rounded-xl overflow-hidden text-[11px] shadow-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-extrabold uppercase">
                        <th className="py-2 px-3">Size</th>
                        <th className="py-2 px-3">Setting Depth</th>
                        <th className="py-2 px-3">Grade</th>
                        <th className="py-2 px-3">Weight</th>
                        <th className="py-2 px-3">Shoe Depth</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-bold text-slate-900">
                      {casing.map((c, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-black text-slate-900">{c.casing_size}</td>
                          <td className="py-2 px-3">{c.setting_depth} m</td>
                          <td className="py-2 px-3">{c.grade}</td>
                          <td className="py-2 px-3">{c.weight}</td>
                          <td className="py-2 px-3">{c.shoe_depth} m</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mud Program */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-[#0F2C59] text-sm">Mud & Fluid System Program</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse bg-white border border-slate-200 rounded-xl overflow-hidden text-[11px] shadow-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-extrabold uppercase">
                        <th className="py-2 px-3">Depth</th>
                        <th className="py-2 px-3">Mud Weight</th>
                        <th className="py-2 px-3">Viscosity</th>
                        <th className="py-2 px-3">Fluid Type</th>
                        <th className="py-2 px-3">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-bold text-slate-900">
                      {mud_program.map((m, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-black text-slate-900">{m.depth_m} m</td>
                          <td className="py-2 px-3 font-black text-amber-800">{m.mud_weight_gcc} g/cc</td>
                          <td className="py-2 px-3">{m.viscosity_sec} s</td>
                          <td className="py-2 px-3 text-[#0F2C59] font-black">{m.fluid_type}</td>
                          <td className="py-2 px-3 text-slate-700 font-semibold">{m.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: OFFSET COMPARISON */}
          {activeTab === 'comparison' && (
            <div className="space-y-4 text-xs">
              <h4 className="font-extrabold text-[#0F2C59] text-sm flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-[#0F2C59]" />
                Side-by-Side Offset Comparison: Current Well ({globalWellName}) vs Historical ({well.well_name})
              </h4>

              {comparison ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-200 p-4 rounded-xl">
                    <div className="border-r border-slate-200 pr-3 space-y-1">
                      <span className="text-[10px] uppercase font-extrabold text-[#0F2C59] block">GLOBAL CURRENT WELL</span>
                      <h5 className="font-extrabold text-slate-900 text-sm">{globalWellName}</h5>
                      <p className="text-slate-600 font-bold text-[11px]">{comparison.current_well.well_id}</p>
                      <p className="text-slate-800 font-semibold">Target Depth: <strong className="text-slate-900 font-black">{comparison.current_well.target_depth_m} m</strong></p>
                    </div>

                    <div className="pl-1 space-y-1">
                      <span className="text-[10px] uppercase font-extrabold text-purple-900 block">SELECTED HISTORICAL WELL</span>
                      <h5 className="font-extrabold text-slate-900 text-sm">{well.well_name}</h5>
                      <p className="text-slate-600 font-bold text-[11px]">{well.well_id}</p>
                      <p className="text-slate-800 font-semibold">Target Depth: <strong className="text-slate-900 font-black">{well.target_depth_m} m</strong></p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                    <span className="font-extrabold text-slate-900 block text-[11px] uppercase tracking-wider">Relevance & Evidence Factors:</span>
                    <ul className="list-disc list-inside text-slate-800 font-semibold space-y-1">
                      {comparison.relevance_factors.map((rf, idx) => (
                        <li key={idx}>{rf}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 font-semibold leading-relaxed shadow-2xs">
                    <strong>Engineering Notes:</strong> {comparison.comparison_notes}
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-white border border-slate-200 rounded-xl text-center text-slate-600 font-semibold shadow-xs">
                  Loading offset comparison data...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
          <button
            onClick={handleAskAI}
            className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-950 border border-purple-300 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Bot className="w-4 h-4 text-purple-700" />
            {aiCopied ? 'Historical Context Copied for AI!' : 'Ask AI About This Evidence'}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-lg text-xs font-extrabold shadow-2xs"
          >
            Close Detail View
          </button>
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {selectedPdfDoc && (
        <PdfViewerModal
          document={selectedPdfDoc}
          onClose={() => setSelectedPdfDoc(null)}
        />
      )}
    </div>
  );
};

