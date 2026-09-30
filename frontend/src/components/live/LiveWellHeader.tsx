import React from 'react';
import { Activity, Compass } from 'lucide-react';
import type { LiveCurrentResponse } from '../../types/live';
import { Badge } from '../common/Badge';

interface LiveWellHeaderProps {
  data: LiveCurrentResponse | null;
  permLevel: string;
}

export const LiveWellHeader: React.FC<LiveWellHeaderProps> = ({
  data,
  permLevel
}) => {
  const meta = data?.well_meta;
  const freshness = data?.freshness;
  const formation = data?.formation_context;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 space-y-5 shadow-xs">
      {/* Top Header Title & Badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-blue-100 border border-blue-300 text-blue-900 shrink-0 shadow-2xs">
            <Activity size={24} className="text-blue-900" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Live Drilling & Real-Time Monitoring
              </h1>
              <Badge variant={permLevel === 'FULL' ? 'full' : permLevel === 'USE' ? 'use' : 'view'}>
                {permLevel} ACCESS
              </Badge>
              <Badge variant="neutral" size="sm">
                {freshness?.status || 'HISTORICAL LOG DATASET'}
              </Badge>
            </div>
            <p className="text-sm text-slate-900 font-semibold mt-1 leading-snug">
              Real-time drilling parameters, trends, abnormal patterns and operational context
            </p>
          </div>
        </div>

        {/* Global Current Well Context */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl shrink-0 shadow-2xs">
          <Compass size={16} className="text-[#0F2C59]" />
          <span className="text-slate-600 font-semibold text-xs">Active Well:</span>
          <span className="text-slate-900 font-extrabold text-xs">
            {meta ? `${meta.well_name} (${meta.well_id})` : 'No active well'}
          </span>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {/* Current Depth */}
        <div className="bg-blue-50/80 p-3.5 rounded-xl border border-blue-200 shadow-2xs">
          <span className="text-[10px] text-blue-900 uppercase font-extrabold tracking-wider block">Current Depth</span>
          <div className="text-xl font-extrabold text-[#0F2C59] mt-1">
            {meta ? `${meta.current_depth_m} m` : 'N/A'}
          </div>
          <span className="text-xs text-slate-600 font-medium block mt-0.5">Target: {meta?.target_depth_m}m</span>
        </div>

        {/* Depth Progress */}
        <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200 shadow-2xs">
          <span className="text-[10px] text-emerald-950 uppercase font-extrabold tracking-wider block">Depth Progress</span>
          <div className="text-xl font-extrabold text-emerald-900 mt-1">
            {meta ? `${meta.depth_progress_pct}%` : 'N/A'}
          </div>
          <div className="w-full bg-emerald-200/80 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${meta?.depth_progress_pct || 0}%` }}
            />
          </div>
        </div>

        {/* Current Formation */}
        <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 shadow-2xs">
          <span className="text-[10px] text-amber-950 uppercase font-extrabold tracking-wider block">Current Formation</span>
          <div className="text-xs font-extrabold text-amber-950 truncate mt-1">
            {formation ? formation.current_formation : 'Barail Group'}
          </div>
          <span className="text-[11px] text-slate-700 font-medium block truncate mt-0.5">{formation?.lithology || 'Reactive Shale'}</span>
        </div>

        {/* Well Lifecycle Status */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-600 uppercase font-extrabold tracking-wider block">Well Lifecycle</span>
          <div className="text-xs font-extrabold text-slate-900 mt-1">
            {meta ? meta.well_status.toUpperCase() : 'ACTIVE'}
          </div>
          <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">MASTER CATALOG</span>
        </div>

        {/* Operational Status */}
        <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200/80 shadow-2xs">
          <span className="text-[10px] text-emerald-950 uppercase font-extrabold tracking-wider block">Operational State</span>
          <div className="text-xs font-extrabold text-emerald-800 mt-1 truncate">
            {meta ? meta.operational_status : 'DRILLING'}
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">ACTIVE TELEMETRY</span>
        </div>

        {/* Data Provenance & Freshness */}
        <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-200/80 shadow-2xs">
          <span className="text-[10px] text-blue-950 uppercase font-extrabold tracking-wider block">Classification</span>
          <div className="text-xs font-extrabold text-[#0F2C59] mt-1 truncate">
            {freshness?.source_classification || 'OIL_AUTHORIZED'}
          </div>
          <span className="text-[10px] text-slate-600 font-semibold block mt-0.5">PROCESSED_DATASET</span>
        </div>
      </div>
    </div>
  );
};

