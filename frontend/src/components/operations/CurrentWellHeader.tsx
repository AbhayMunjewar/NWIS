import React from 'react';
import { Compass, Clock } from 'lucide-react';
import { Badge } from '../common/Badge';

interface CurrentWellHeaderProps {
  wellMeta: any;
  latestParams: any;
  freshness: any;
  detailLevel?: 'DETAILED' | 'CONTEXT' | 'SUMMARY';
}

export const CurrentWellHeader: React.FC<CurrentWellHeaderProps> = ({
  wellMeta,
  latestParams,
  freshness,
  detailLevel = 'DETAILED'
}) => {
  if (!wellMeta) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 text-center text-xs text-slate-600 font-medium shadow-xs">
        No active well selected
      </div>
    );
  }

  const currentDepth = latestParams?.depth_m ?? null;
  const targetDepth = wellMeta?.target_depth_m ?? null;
  const formation = latestParams?.formation || wellMeta?.target_formation || 'Not available';
  
  // Explicitly separate Lifecycle Status from Operational Status
  const lifecycleStatus = wellMeta?.lifecycle_status || wellMeta?.status || 'Producing';
  const operationalStatus = wellMeta?.operational_status || (latestParams ? 'DRILLING / ACTIVE MONITORING' : 'Awaiting Telemetry Stream');
  
  const lastUpdate = freshness?.last_update ? new Date(freshness.last_update).toLocaleString() : 'Not available';
  const sourceClass = freshness?.source_classification || 'OIL_AUTHORIZED';
  const freshnessStatus = freshness?.status || 'HISTORICAL LOG DATASET';

  // Executive SUMMARY mode for Management
  if (detailLevel === 'SUMMARY') {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0F2C59] text-amber-400 font-bold shadow-xs flex items-center justify-center shrink-0">
            <Compass size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                {wellMeta.well_name || wellMeta.well_id}
              </h2>
              <Badge variant="info" size="sm">{operationalStatus}</Badge>
            </div>
            <div className="text-xs text-slate-600 font-medium mt-0.5">
              {wellMeta.field || 'Upper Assam Field'} • Target Depth: {targetDepth ? `${targetDepth}m` : 'N/A'} • Lifecycle: {lifecycleStatus}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
            <span className="text-slate-500 text-[10px] uppercase block font-extrabold">Current Depth</span>
            <span className="text-slate-900 font-black">{currentDepth ? `${currentDepth.toFixed(1)} m` : 'N/A'}</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
            <span className="text-slate-500 text-[10px] uppercase block font-extrabold">Formation</span>
            <span className="text-[#0F2C59] font-black">{formation}</span>
          </div>
        </div>
      </div>
    );
  }

  // Standard DETAILED mode for Drilling Engineer, Geologist, Operator
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0F2C59] text-amber-400 font-bold shadow-xs flex items-center justify-center shrink-0">
            <Compass size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-extrabold text-[#0F2C59] tracking-tight">
                {wellMeta.well_name || wellMeta.well_id}
              </h2>
              <Badge variant="neutral" size="sm">ID: {wellMeta.well_id}</Badge>
              <Badge variant="info" size="sm">OPERATIONAL: {operationalStatus}</Badge>
              <Badge variant="neutral" size="sm">LIFECYCLE: {lifecycleStatus}</Badge>
            </div>
            <div className="text-xs text-slate-600 font-medium mt-1 flex items-center gap-2">
              <span>{wellMeta.field || 'Upper Assam Field'}</span>
              <span>•</span>
              <span>{wellMeta.basin || 'Upper Assam Shelf'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <Badge variant="demo" size="sm">SOURCE: {sourceClass}</Badge>
          <div className="bg-slate-100 border border-slate-300 rounded-md px-2.5 py-1 text-[11px] text-slate-800 font-semibold flex items-center gap-1.5 shadow-2xs">
            <Clock size={12} className="text-[#0F2C59]" />
            <span>Record Timestamp: {lastUpdate}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <div className="text-slate-600 text-[10px] uppercase tracking-wider font-extrabold">Current Depth</div>
          <div className="text-lg font-black text-[#0F2C59] mt-0.5">
            {currentDepth !== null ? `${currentDepth.toFixed(1)} m` : 'Not available'}
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <div className="text-slate-600 text-[10px] uppercase tracking-wider font-extrabold">Target Depth</div>
          <div className="text-lg font-black text-[#0F2C59] mt-0.5">
            {targetDepth !== null ? `${targetDepth.toFixed(1)} m` : 'Not available'}
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <div className="text-slate-600 text-[10px] uppercase tracking-wider font-extrabold">Current Formation</div>
          <div className="text-lg font-black text-[#0F2C59] mt-0.5 truncate">
            {formation}
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <div className="text-slate-600 text-[10px] uppercase tracking-wider font-extrabold">Data Provenance</div>
          <div className="text-xs font-bold text-slate-800 mt-1 truncate">
            {freshnessStatus}
          </div>
        </div>
      </div>
    </div>
  );
};
