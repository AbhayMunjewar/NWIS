import React, { useState, useEffect } from 'react';
import type { ReportAvailabilityResult } from '../../types/reports';
import { checkReportAvailabilityApi } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { Play, Calendar, Layers, Database } from 'lucide-react';

interface Props {
  selectedReportTypeId: string;
  globalWellId: string;
  globalWellName: string;
  token?: string;
  onGenerate: (wellId: string, dateRange: string, depthStart?: number, depthEnd?: number) => void;
  generating: boolean;
}

export const ReportGenerationForm: React.FC<Props> = ({
  selectedReportTypeId,
  globalWellId,
  globalWellName,
  token,
  onGenerate,
  generating
}) => {
  const { user } = useAuth();
  const isGeologist = user?.roleCode === 'GEOLOGIST';

  const [targetWellId, setTargetWellId] = useState<string>(globalWellId);
  const [targetFormation, setTargetFormation] = useState<string>('Barail Group Shale / Sandstone (Primary)');
  const [dateRange] = useState<string>('Last 24 Hours');
  const [depthStart, setDepthStart] = useState<number>(2100.0);
  const [depthEnd, setDepthEnd] = useState<number>(2210.0);
  const [researchQuestion, setResearchQuestion] = useState<string>(
    'Geological evaluation of Barail Group shale hydration risk, lithology transitions, and formation log deflections.'
  );

  // Offset Wells Selection
  const [offsetWells, setOffsetWells] = useState<Record<string, boolean>>({
    DUL_88: true,
    DUL_99: true,
    NHK_45: true,
    MOR_25: false
  });

  // Well Logs Selection
  const [selectedLogs, setSelectedLogs] = useState<Record<string, boolean>>({
    GR: true,
    RHOB: true,
    NPHI: true,
    DTC: true,
    RDEP: true,
    CALI: true
  });

  // Content Options Selection
  const [contentOptions, setContentOptions] = useState<Record<string, boolean>>({
    formation_tops: true,
    lithology: true,
    formation_intervals: true,
    geological_correlation: true,
    historical_events: !isGeologist,
    historical_documents: !isGeologist,
    log_plots: true,
    formation_correlation: true,
    comparison_tables: true,
    historical_evidence: !isGeologist,
    geological_interpretation: true,
    source_references: true,
    data_limitations: true
  });

  const [availability, setAvailability] = useState<ReportAvailabilityResult | null>(null);
  const [checking, setChecking] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setChecking(true);
    checkReportAvailabilityApi(targetWellId, selectedReportTypeId, dateRange, token).then((res) => {
      if (isMounted) {
        setAvailability(res);
        setChecking(false);
      }
    });
    return () => { isMounted = false; };
  }, [targetWellId, selectedReportTypeId, dateRange, token]);

  const toggleOffsetWell = (key: string) => {
    setOffsetWells(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleLog = (key: string) => {
    setSelectedLogs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleContent = (key: string) => {
    setContentOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(targetWellId, dateRange, depthStart, depthEnd);
  };

  const allContentOptions = [
    { key: 'formation_tops', label: 'Formation Tops' },
    { key: 'lithology', label: 'Lithology' },
    { key: 'formation_intervals', label: 'Formation Intervals' },
    { key: 'geological_correlation', label: 'Geological Correlation' },
    { key: 'historical_events', label: 'Historical Events', restricted: true },
    { key: 'historical_documents', label: 'Historical Reports', restricted: true },
    { key: 'log_plots', label: 'Log Plots' },
    { key: 'formation_correlation', label: 'Formation Correlation' },
    { key: 'comparison_tables', label: 'Comparison Tables' },
    { key: 'historical_evidence', label: 'Historical Evidence', restricted: true },
    { key: 'geological_interpretation', label: 'Geological Interpretation' },
    { key: 'source_references', label: 'Source References' },
    { key: 'data_limitations', label: 'Data Limitations' }
  ];

  const visibleContentOptions = isGeologist
    ? allContentOptions.filter(opt => !opt.restricted)
    : allContentOptions;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h3 className="text-xs font-extrabold text-[#0F2C59] tracking-tight flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#0F2C59]" />
          <span>Geological Report Parameters & Scope Configuration</span>
        </h3>
        <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-blue-100 border border-blue-300 text-blue-900 font-bold">
          Report Type: {selectedReportTypeId}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Core Parameters Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
          {/* 1. Target Well */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 font-mono block">
              1. Target Well Scope
            </label>
            <select
              value={targetWellId}
              onChange={(e) => setTargetWellId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#0F2C59] shadow-2xs"
            >
              <option value={globalWellId}>Current Operational Well ({globalWellName})</option>
              <option value="DUL_92">Historical Well: Duliajan-92 (DUL-92)</option>
              <option value="DUL_88">Historical Well: Duliajan-88 (DUL-88)</option>
              <option value="DUL_99">Historical Well: Duliajan-99 (DUL-99)</option>
              <option value="NHK_45">Offset Reference: Nahorkatiya-45</option>
            </select>
          </div>

          {/* 2. Target Formation */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 font-mono block">
              2. Target Formation Scope
            </label>
            <select
              value={targetFormation}
              onChange={(e) => setTargetFormation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#0F2C59] shadow-2xs"
            >
              <option value="Barail Group Shale / Sandstone (Primary)">Barail Group Shale / Sandstone</option>
              <option value="Tipam Group Sandstone">Tipam Group Sandstone</option>
              <option value="Surma Group Sandstone">Surma Group Sandstone</option>
              <option value="Kopili Formation Shale">Kopili Formation Shale</option>
              <option value="All Formations">All Stratigraphic Formations</option>
            </select>
          </div>

          {/* 3. Start Depth */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 font-mono block">
              3. Start Depth (MD meters)
            </label>
            <input
              type="number"
              value={depthStart}
              onChange={(e) => setDepthStart(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#0F2C59] shadow-2xs"
            />
          </div>

          {/* 4. End Depth */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 font-mono block">
              4. End Depth (MD meters)
            </label>
            <input
              type="number"
              value={depthEnd}
              onChange={(e) => setDepthEnd(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#0F2C59] shadow-2xs"
            />
          </div>
        </div>

        {/* 5. Research Purpose / Question & Offset Comparison Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div className="md:col-span-2 space-y-1">
            <label className="text-[11px] font-bold text-slate-700 font-mono block">
              5. Report Purpose / Research Question
            </label>
            <input
              type="text"
              value={researchQuestion}
              onChange={(e) => setResearchQuestion(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#0F2C59] shadow-2xs"
              placeholder="Specify geological research question..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 font-mono block">
              6. Comparison / Offset Wells
            </label>
            <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-50 border border-slate-300 rounded-xl">
              {Object.keys(offsetWells).map((wellKey) => (
                <label key={wellKey} className="flex items-center gap-1 text-[11px] font-mono font-bold cursor-pointer text-slate-800">
                  <input
                    type="checkbox"
                    checked={offsetWells[wellKey]}
                    onChange={() => toggleOffsetWell(wellKey)}
                    className="accent-[#0F2C59] rounded"
                  />
                  <span>{wellKey}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 7. Well Logs to Include */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <label className="text-[11px] font-black text-[#0F2C59] uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-blue-700" />
            7. Wireline Well Logs to Include in Report
          </label>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {[
              { key: 'GR', label: 'GR (Gamma Ray)' },
              { key: 'RHOB', label: 'RHOB (Bulk Density)' },
              { key: 'NPHI', label: 'NPHI (Neutron Porosity)' },
              { key: 'DTC', label: 'DTC (Compressional Sonic)' },
              { key: 'RDEP', label: 'RDEP (Deep Resistivity)' },
              { key: 'CALI', label: 'CALI (Caliper Log)' }
            ].map((log) => (
              <label key={log.key} className="flex items-center gap-1.5 p-1.5 bg-white border border-slate-300 rounded-lg text-[11px] font-mono font-extrabold cursor-pointer hover:bg-blue-50/50">
                <input
                  type="checkbox"
                  checked={selectedLogs[log.key]}
                  onChange={() => toggleLog(log.key)}
                  className="accent-[#0F2C59] rounded"
                />
                <span className="text-[#0F2C59]">{log.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 8. Report Content Options */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <label className="text-[11px] font-black text-[#0F2C59] uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-700" />
            8. Report Content & Geological Features Options
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {visibleContentOptions.map((opt) => (
              <label key={opt.key} className="flex items-center gap-1.5 p-1.5 bg-white border border-slate-300 rounded-lg text-[11px] font-mono font-bold cursor-pointer hover:bg-emerald-50/50">
                <input
                  type="checkbox"
                  checked={contentOptions[opt.key]}
                  onChange={() => toggleContent(opt.key)}
                  className="accent-[#0F2C59] rounded"
                />
                <span className="text-slate-800">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Pre-check & Submission Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
            <span className="text-slate-700 font-bold">Pre-Generation Check:</span>
            {checking ? (
              <span className="text-[#0F2C59] font-bold animate-pulse">Checking logs...</span>
            ) : availability ? (
              <>
                {!isGeologist && (
                  <span className={`px-2.5 py-0.5 rounded-md border font-bold flex items-center gap-1 ${
                    availability.telemetry_available ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-slate-100 text-slate-500 border-slate-300'
                  }`}>
                    Telemetry {availability.telemetry_available ? '✓' : '—'}
                  </span>
                )}

                {!isGeologist && (
                  <span className={`px-2.5 py-0.5 rounded-md border font-bold flex items-center gap-1 ${
                    availability.risk_data_available ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-slate-100 text-slate-500 border-slate-300'
                  }`}>
                    Risk Engine {availability.risk_data_available ? '✓' : '—'}
                  </span>
                )}

                <span className={`px-2.5 py-0.5 rounded-md border font-bold flex items-center gap-1 ${
                  availability.historical_events_available ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-slate-100 text-slate-500 border-slate-300'
                }`}>
                  {isGeologist ? 'Wireline Logs' : 'Historical Logs'} {availability.historical_events_available ? '✓' : '—'}
                </span>

                {isGeologist && (
                  <span className="px-2.5 py-0.5 rounded-md border font-bold flex items-center gap-1 bg-emerald-50 text-emerald-900 border-emerald-300">
                    Stratigraphy Engine ✓
                  </span>
                )}
              </>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={generating}
            className="w-full md:w-auto px-6 py-2.5 bg-[#0F2C59] hover:bg-[#16385C] text-white font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current text-amber-400" />
            <span>{generating ? 'Compiling Geological Report...' : 'Compile & Generate Report'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
