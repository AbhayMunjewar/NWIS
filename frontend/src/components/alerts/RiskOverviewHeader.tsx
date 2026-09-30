import React from 'react';
import type { RiskSummary } from '../../types/risk';
import { ShieldAlert, AlertTriangle, Activity, Database, TrendingUp } from 'lucide-react';

interface Props {
  summary: RiskSummary | null;
  globalWellName: string;
  globalWellId: string;
  roleCode?: string;
}

export const RiskOverviewHeader: React.FC<Props> = ({
  summary,
  globalWellName,
  globalWellId
}) => {
  if (!summary) {
    return (
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-amber-950 flex items-center gap-3 shadow-2xs font-medium">
        <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-700" />
        <div>
          <span className="font-bold">Risk analytics unavailable</span>
          <p className="text-xs text-amber-900/80">Connect to telemetry stream to evaluate real-time hazards.</p>
        </div>
      </div>
    );
  }

  const getSeverityStyle = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-rose-50 border-rose-300 text-rose-950 shadow-2xs';
      case 'HIGH':
        return 'bg-orange-50 border-orange-300 text-orange-950 shadow-2xs';
      case 'MEDIUM':
        return 'bg-amber-50 border-amber-300 text-amber-950 shadow-2xs';
      case 'LOW':
        return 'bg-blue-50 border-blue-300 text-blue-950 shadow-2xs';
      default:
        return 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-2xs';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      {/* Top Banner Context */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-rose-100 border border-rose-200 text-rose-700 shadow-2xs">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-[#0F2C59]">Global Current Well: {globalWellName}</h2>
              <span className="px-2 py-0.5 text-xs rounded-md bg-slate-100 text-slate-800 font-mono font-bold border border-slate-300">
                {globalWellId}
              </span>
            </div>
            <p className="text-xs text-slate-600 flex items-center gap-3 mt-0.5 font-medium">
              <span>Depth: <strong className="text-[#0F2C59] font-bold">{summary.current_depth_m} m</strong></span>
              <span>•</span>
              <span>Formation: <strong className="text-[#0F2C59] font-bold">{summary.current_formation}</strong></span>
            </p>
          </div>
        </div>

        {/* Provenance and Freshness */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-50 border border-blue-200 text-blue-900 flex items-center gap-1.5 shadow-2xs">
            <Database className="w-3.5 h-3.5 text-blue-700" />
            {summary.data_freshness}
          </span>
          <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-2xs">
            {summary.source_classification}
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Overall Status */}
        <div className={`p-3 rounded-xl border flex flex-col justify-between ${getSeverityStyle(summary.overall_risk_status)}`}>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">Overall Status</span>
          <div className="text-xl font-black mt-1 flex items-center justify-between text-emerald-800">
            <span>{summary.overall_risk_status}</span>
            <Activity className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        {/* Active Risks */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between shadow-2xs">
          <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">Active Risks</span>
          <div className="text-2xl font-black text-[#0F2C59] mt-1">
            {summary.active_risk_count}
          </div>
        </div>

        {/* Critical Risks */}
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex flex-col justify-between shadow-2xs">
          <span className="text-[11px] font-extrabold text-rose-900 uppercase tracking-wider">Critical Risks</span>
          <div className="text-2xl font-black text-rose-700 mt-1">
            {summary.critical_risk_count}
          </div>
        </div>

        {/* High Risks */}
        <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 flex flex-col justify-between shadow-2xs">
          <span className="text-[11px] font-extrabold text-orange-900 uppercase tracking-wider">High Risks</span>
          <div className="text-2xl font-black text-orange-700 mt-1">
            {summary.high_risk_count}
          </div>
        </div>

        {/* Medium Risks */}
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex flex-col justify-between shadow-2xs">
          <span className="text-[11px] font-extrabold text-amber-900 uppercase tracking-wider">Medium Risks</span>
          <div className="text-2xl font-black text-amber-700 mt-1">
            {summary.medium_risk_count}
          </div>
        </div>

        {/* Risk Trend */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between shadow-2xs">
          <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">Risk Trend</span>
          <div className="text-sm font-black text-[#0F2C59] mt-1 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            {summary.risk_trend}
          </div>
        </div>
      </div>
    </div>
  );
};
