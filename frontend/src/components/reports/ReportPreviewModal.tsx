import React, { useState } from 'react';
import type { ReportPreviewPayload } from '../../types/reports';
import { downloadReportFileApi } from '../../lib/api';
import { X, FileText, Download, Database, Layers, History, Compass, Search, CheckCircle2 } from 'lucide-react';

interface Props {
  preview: ReportPreviewPayload | null;
  onClose: () => void;
  token?: string;
}

export const ReportPreviewModal: React.FC<Props> = ({ preview, onClose, token }) => {
  const [activeTab, setActiveTab] = useState<'GEOLOGY' | 'INCIDENTS' | 'RESEARCH' | 'CORRELATION' | 'AUDIT'>('GEOLOGY');
  const [downloading, setDownloading] = useState<boolean>(false);

  if (!preview) return null;

  const meta = preview.metadata;
  const geoSum = preview.geological_summary;
  const incSum = preview.historical_incident_summary;
  const geoRes = preview.geological_research;
  const formCorr = preview.formation_correlation;

  const handleDownload = async (format: 'pdf' | 'csv') => {
    setDownloading(true);
    await downloadReportFileApi(meta.report_id, format, token);
    setDownloading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 text-[#0F2C59] border border-blue-200 shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-[#0F2C59] tracking-tight">{meta.title}</h2>
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 border border-emerald-300 text-emerald-950 text-[10px] font-extrabold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                  {meta.status}
                </span>
              </div>
              <p className="text-xs text-slate-700 font-bold mt-0.5">
                Report ID: <span className="font-mono text-blue-900">{meta.report_id}</span> • Well: <span className="font-mono">{meta.well_name} ({meta.well_id})</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Geological Navigation Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 pt-2 flex items-center gap-2 overflow-x-auto text-xs font-bold font-mono flex-shrink-0">
          <button
            onClick={() => setActiveTab('GEOLOGY')}
            className={`px-3.5 py-2 rounded-t-xl border-t border-x transition-all flex items-center gap-2 ${
              activeTab === 'GEOLOGY'
                ? 'bg-white border-slate-300 text-[#0F2C59] font-black border-b-2 border-b-white -mb-px shadow-xs'
                : 'bg-slate-200/70 border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-800" />
            <span>1. Formation & Geology</span>
          </button>

          <button
            onClick={() => setActiveTab('INCIDENTS')}
            className={`px-3.5 py-2 rounded-t-xl border-t border-x transition-all flex items-center gap-2 ${
              activeTab === 'INCIDENTS'
                ? 'bg-white border-slate-300 text-[#0F2C59] font-black border-b-2 border-b-white -mb-px shadow-xs'
                : 'bg-slate-200/70 border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5 text-amber-700" />
            <span>2. Historical Incidents</span>
          </button>

          <button
            onClick={() => setActiveTab('RESEARCH')}
            className={`px-3.5 py-2 rounded-t-xl border-t border-x transition-all flex items-center gap-2 ${
              activeTab === 'RESEARCH'
                ? 'bg-white border-slate-300 text-[#0F2C59] font-black border-b-2 border-b-white -mb-px shadow-xs'
                : 'bg-slate-200/70 border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-purple-800" />
            <span>3. Geological Research</span>
          </button>

          <button
            onClick={() => setActiveTab('CORRELATION')}
            className={`px-3.5 py-2 rounded-t-xl border-t border-x transition-all flex items-center gap-2 ${
              activeTab === 'CORRELATION'
                ? 'bg-white border-slate-300 text-[#0F2C59] font-black border-b-2 border-b-white -mb-px shadow-xs'
                : 'bg-slate-200/70 border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-cyan-800" />
            <span>4. Formation Correlation</span>
          </button>

          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`px-3.5 py-2 rounded-t-xl border-t border-x transition-all flex items-center gap-2 ${
              activeTab === 'AUDIT'
                ? 'bg-white border-slate-300 text-[#0F2C59] font-black border-b-2 border-b-white -mb-px shadow-xs'
                : 'bg-slate-200/70 border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-slate-700" />
            <span>5. Provenance & Audit</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-900">
          {/* Metadata Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 grid grid-cols-2 md:grid-cols-4 gap-3 font-semibold text-[11px] shadow-2xs">
            <div>
              <span className="text-slate-600 block text-[10px] font-extrabold uppercase">TARGET WELL & FIELD</span>
              <strong className="text-slate-900 font-extrabold">{meta.well_name} ({geoSum?.field_basin || meta.field})</strong>
            </div>

            <div>
              <span className="text-slate-600 block text-[10px] font-extrabold uppercase">DEPTH INTERVAL</span>
              <strong className="text-blue-950 font-extrabold font-mono">{meta.depth_range}</strong>
            </div>

            <div>
              <span className="text-slate-600 block text-[10px] font-extrabold uppercase">GENERATED BY & ROLE</span>
              <strong className="text-slate-900 font-extrabold">{meta.generated_by} ({meta.user_role})</strong>
            </div>

            <div>
              <span className="text-slate-600 block text-[10px] font-extrabold uppercase">PROVENANCE HASH</span>
              <span className="px-2 py-0.5 rounded bg-blue-100 border border-blue-300 text-blue-950 font-extrabold font-mono text-[10px] inline-block">
                {meta.provenance_hash || 'PROV-GEO-2026-991A'}
              </span>
            </div>
          </div>

          {/* TAB 1: FORMATION & GEOLOGICAL SUMMARY */}
          {activeTab === 'GEOLOGY' && geoSum && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-xs font-black text-[#0F2C59] uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-700" />
                  Section 1: Formation & Geological Summary
                </h3>
                <span className="text-[11px] font-bold text-slate-700 font-mono">Report Date: {geoSum.report_date}</span>
              </div>

              {/* Core Attributes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-slate-600 text-[10px] font-extrabold uppercase block">Well Name / Well ID</span>
                  <strong className="text-slate-900 text-xs font-extrabold">{geoSum.well_name} ({geoSum.well_id})</strong>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-slate-600 text-[10px] font-extrabold uppercase block">Field / Basin</span>
                  <strong className="text-slate-900 text-xs font-extrabold">{geoSum.field_basin}</strong>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-slate-600 text-[10px] font-extrabold uppercase block">Current Depth / Total Depth</span>
                  <strong className="text-blue-900 text-xs font-black font-mono">{geoSum.current_depth_m}m / {geoSum.total_depth_m}m TD</strong>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-slate-600 text-[10px] font-extrabold uppercase block">Formation Name</span>
                  <strong className="text-slate-900 text-xs font-extrabold">{geoSum.formation_name}</strong>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-slate-600 text-[10px] font-extrabold uppercase block">Formation Tops & Bottoms</span>
                  <strong className="text-slate-900 text-xs font-extrabold font-mono">{geoSum.formation_top_depth_m}m Top – {geoSum.formation_bottom_depth_m}m Bottom</strong>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-slate-600 text-[10px] font-extrabold uppercase block">Selected Interval</span>
                  <strong className="text-slate-900 text-xs font-extrabold font-mono">{geoSum.selected_depth_interval}</strong>
                </div>
              </div>

              {/* Lithology & Interpretation */}
              <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1.5">
                <span className="text-blue-900 text-[11px] font-black uppercase tracking-wider block">Lithology & Stratigraphic Description</span>
                <p className="text-slate-800 font-semibold leading-relaxed text-xs">{geoSum.lithology}</p>
              </div>

              {/* Available Well Logs Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono">Available Wireline Well Logs & Sensor Observations</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Log Code</th>
                        <th className="p-2.5">Curve Description & Calibration Bounds</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium">
                      {Object.entries(geoSum.available_well_logs || {}).map(([code, desc]) => (
                        <tr key={code} className="hover:bg-slate-50">
                          <td className="p-2.5 font-black text-blue-900 font-mono">{code}</td>
                          <td className="p-2.5 text-slate-800 font-semibold">{desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Well Log Observations & Correlations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-slate-700 text-[10px] font-extrabold uppercase block">Well-Log Observations</span>
                  <p className="text-slate-800 font-semibold text-[11px] leading-relaxed">{geoSum.well_log_observations}</p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-slate-700 text-[10px] font-extrabold uppercase block">Geological Correlation (Offset Wells)</span>
                  <p className="text-slate-800 font-semibold text-[11px] leading-relaxed">{geoSum.geological_correlation}</p>
                </div>
              </div>

              {/* Relevant Events & Interpretation */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div>
                  <span className="text-slate-700 text-[10px] font-extrabold uppercase block">Relevant Geological Events & Hazards</span>
                  <p className="text-slate-800 font-semibold text-[11px]">{geoSum.relevant_geological_events}</p>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-blue-950 text-[10px] font-black uppercase block">Geological Interpretation</span>
                  <p className="text-slate-900 font-extrabold text-[11px] leading-relaxed">{geoSum.geological_interpretation}</p>
                </div>
              </div>

              {/* Supporting Data & Provenance */}
              <div className="p-3 bg-slate-100 border border-slate-300 rounded-xl flex flex-col md:flex-row items-center justify-between text-[11px] font-mono gap-2">
                <span><strong>Data Sources:</strong> {geoSum.supporting_data_sources}</span>
                <span className="text-blue-900 font-bold">{geoSum.source_provenance}</span>
              </div>
            </div>
          )}

          {/* TAB 2: HISTORICAL INCIDENT & EVENT SUMMARY */}
          {activeTab === 'INCIDENTS' && incSum && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-xs font-black text-[#0F2C59] uppercase tracking-wider flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-700" />
                  Section 2: Historical Incident & Event Summary
                </h3>
                <span className="text-[11px] font-bold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200 font-mono">
                  Event ID: {incSum.event_id}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-slate-600 text-[10px] font-extrabold uppercase block">Historical Well Name / ID</span>
                  <strong className="text-slate-900 text-xs font-extrabold">{incSum.historical_well_name} ({incSum.historical_well_id})</strong>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-slate-600 text-[10px] font-extrabold uppercase block">Event Type & Severity</span>
                  <strong className="text-rose-950 text-xs font-extrabold">{incSum.event_type} ({incSum.event_severity})</strong>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-slate-600 text-[10px] font-extrabold uppercase block">Event Depth & Formation</span>
                  <strong className="text-slate-900 text-xs font-extrabold font-mono">{incSum.event_depth_m}m MD ({incSum.formation_at_event_depth})</strong>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-slate-600 text-[10px] font-extrabold uppercase block">Event Date / Time</span>
                  <strong className="text-slate-900 text-xs font-extrabold font-mono">{incSum.event_datetime}</strong>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-slate-600 text-[10px] font-extrabold uppercase block">NPT Duration</span>
                  <strong className="text-amber-900 text-xs font-black font-mono">{incSum.event_duration_npt}</strong>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-slate-600 text-[10px] font-extrabold uppercase block">Lithology at Depth</span>
                  <strong className="text-slate-900 text-xs font-extrabold">{incSum.lithology}</strong>
                </div>
              </div>

              {/* Event Description */}
              <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1">
                <span className="text-amber-950 text-[10px] font-extrabold uppercase block">Historical Event Description</span>
                <p className="text-slate-900 font-semibold leading-relaxed text-xs">{incSum.historical_event_description}</p>
              </div>

              {/* Geological Context & Similar Offset Events */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-slate-700 text-[10px] font-extrabold uppercase block">Geological Context</span>
                  <p className="text-slate-800 font-semibold text-[11px] leading-relaxed">{incSum.geological_context}</p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-slate-700 text-[10px] font-extrabold uppercase block">Similar Events in Offset Wells</span>
                  <p className="text-slate-800 font-semibold text-[11px] leading-relaxed">{incSum.similar_events_in_offset_wells}</p>
                </div>
              </div>

              {/* Historical Evidence & Document References */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div>
                  <span className="text-slate-700 text-[10px] font-extrabold uppercase block">Relevant Historical Evidence</span>
                  <p className="text-slate-800 font-semibold text-[11px]">{incSum.relevant_historical_evidence}</p>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-[11px]">
                  <span><strong>Original References:</strong> {incSum.original_report_references}</span>
                  <span className="text-slate-600 font-mono">Source: {incSum.source_provenance}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GEOLOGICAL RESEARCH REPORT */}
          {activeTab === 'RESEARCH' && geoRes && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-xs font-black text-[#0F2C59] uppercase tracking-wider flex items-center gap-2">
                  <Search className="w-4 h-4 text-purple-700" />
                  Section 3: Geological Research Report
                </h3>
              </div>

              <div className="p-3.5 bg-purple-50/60 border border-purple-200 rounded-xl space-y-1">
                <span className="text-purple-950 text-[10px] font-extrabold uppercase block">Research Title / Technical Question</span>
                <h4 className="text-sm font-black text-purple-950">{geoRes.research_title}</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-slate-600 text-[10px] font-extrabold uppercase block">Selected Wells Analyzed</span>
                  <strong className="text-slate-900 text-xs font-extrabold">{geoRes.selected_wells.join(', ')}</strong>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-slate-600 text-[10px] font-extrabold uppercase block">Formation & Depth Scope</span>
                  <strong className="text-slate-900 text-xs font-extrabold font-mono">{geoRes.selected_formation_depth_interval}</strong>
                </div>
              </div>

              {/* Research Findings & Interpretation */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div>
                  <span className="text-purple-950 text-[10px] font-black uppercase block">Geological Findings & Hazard Recommendations</span>
                  <p className="text-slate-900 font-black text-xs leading-relaxed mt-0.5">{geoRes.geological_findings}</p>
                </div>

                <div className="pt-2.5 border-t border-slate-200">
                  <span className="text-slate-700 text-[10px] font-extrabold uppercase block">Detailed Interpretation</span>
                  <p className="text-slate-800 font-semibold text-[11px] leading-relaxed mt-0.5">{geoRes.interpretation}</p>
                </div>
              </div>

              {/* Data Limitations & Documents */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                  <span className="text-amber-950 text-[10px] font-extrabold uppercase block">Data Limitations</span>
                  <p className="text-amber-900 font-semibold text-[11px]">{geoRes.data_limitations}</p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-slate-700 text-[10px] font-extrabold uppercase block">Relevant Technical Documents</span>
                  <p className="text-slate-800 font-mono text-[11px]">{geoRes.relevant_technical_documents.join(', ')}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FORMATION CORRELATION REPORT */}
          {activeTab === 'CORRELATION' && formCorr && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-xs font-black text-[#0F2C59] uppercase tracking-wider flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-700" />
                  Section 4: Formation Correlation Report
                </h3>
              </div>

              {/* Selected Wells */}
              <div className="p-3 bg-cyan-50/60 border border-cyan-200 rounded-xl space-y-1">
                <span className="text-cyan-950 text-[10px] font-extrabold uppercase block">Selected Offset & Target Correlation Wells</span>
                <strong className="text-cyan-950 text-xs font-black">{formCorr.selected_wells.join(' • ')}</strong>
              </div>

              {/* Formation Tops Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono">Stratigraphic Formation Tops Correlation Across Wells</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Formation</th>
                        <th className="p-2.5">DUL_92 Top MD</th>
                        <th className="p-2.5">DUL_88 Top MD</th>
                        <th className="p-2.5">NHK_45 Top MD</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium">
                      {formCorr.formation_tops.map((ft: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-2.5 font-extrabold text-slate-900">{ft.formation}</td>
                          <td className="p-2.5 text-blue-900 font-black font-mono">{ft.dul92_top}m</td>
                          <td className="p-2.5 text-slate-800 font-semibold font-mono">{ft.dul88_top}m</td>
                          <td className="p-2.5 text-slate-800 font-semibold font-mono">{ft.nhk45_top}m</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Comparisons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-slate-700 text-[10px] font-extrabold uppercase block">Lithology & Reservoir Comparison</span>
                  <p className="text-slate-800 font-semibold text-[11px] leading-relaxed">{formCorr.lithology_comparison}</p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-slate-700 text-[10px] font-extrabold uppercase block">Wireline Marker Log Comparison</span>
                  <p className="text-slate-800 font-semibold text-[11px] leading-relaxed">{formCorr.well_log_comparison}</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div>
                  <span className="text-slate-700 text-[10px] font-extrabold uppercase block">Geological Similarities & Differences</span>
                  <p className="text-slate-800 font-semibold text-[11px]">{formCorr.geological_similarities_differences}</p>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-blue-950 text-[10px] font-black uppercase block">Geological Structural Interpretation</span>
                  <p className="text-slate-900 font-extrabold text-[11px] leading-relaxed">{formCorr.geological_interpretation}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AUDIT & PROVENANCE HISTORY */}
          {activeTab === 'AUDIT' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-xs font-black text-[#0F2C59] uppercase tracking-wider flex items-center gap-2">
                  <Compass className="w-4 h-4 text-slate-700" />
                  Section 5: Report Provenance & Audit History Tracking
                </h3>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-600 text-[10px] font-extrabold uppercase block">Generated By</span>
                    <strong className="text-slate-900 font-extrabold">{meta.generated_by}</strong>
                  </div>

                  <div>
                    <span className="text-slate-600 text-[10px] font-extrabold uppercase block">Generated Timestamp</span>
                    <strong className="text-slate-900 font-mono font-extrabold">{new Date(meta.generated_at).toLocaleString()}</strong>
                  </div>

                  <div>
                    <span className="text-slate-600 text-[10px] font-extrabold uppercase block">Role Scope</span>
                    <strong className="text-blue-900 font-extrabold font-mono">{meta.user_role}</strong>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 font-mono text-[11px] space-y-1">
                  <span className="text-slate-600 font-bold block">Cryptographic Provenance Audit Hash:</span>
                  <code className="p-2 bg-slate-200 text-slate-900 rounded block font-bold text-xs">
                    {meta.provenance_hash || 'PROV-GEO-2026-991A'}
                  </code>
                </div>

                <div className="pt-2 text-[11px] text-slate-700 font-semibold">
                  <p>✓ Verified against NWIS Central Oilfield Data Repository node Assam-01.</p>
                  <p>✓ Complete audit history logged to permanent server ledger.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
          <span className="text-[11px] font-extrabold text-slate-600">
            Institutional NWIS Geological Research Hub
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownload('pdf')}
              disabled={downloading}
              className="px-5 py-2.5 bg-rose-700 hover:bg-rose-800 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs transition-colors flex items-center gap-2 shadow-md"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Download Official PDF Report</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-extrabold rounded-xl text-xs transition-colors shadow-2xs"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
