import React from 'react';
import { MapPin, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { getDashboardPermission } from '../../lib/rbac';

interface NearbyWellSummaryProps {
  nearbyWells: any[];
  detailLevel?: 'DETAILED' | 'CONTEXT' | 'SUMMARY';
}

export const NearbyWellSummary: React.FC<NearbyWellSummaryProps> = ({
  nearbyWells,
  detailLevel = 'DETAILED'
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canViewMap = getDashboardPermission(user?.roleCode, 'map') !== 'NONE';
  const count = nearbyWells ? nearbyWells.length : 0;
  const nptOffsets = nearbyWells ? nearbyWells.filter(w => w.historical_events_count > 0).length : 0;

  // Management SUMMARY mode: High-level executive banner
  if (detailLevel === 'SUMMARY') {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 border border-blue-300 text-blue-900">
            <MapPin size={18} />
          </div>
          <div>
            <div className="font-extrabold text-slate-900">Nearby Offset Wells Summary</div>
            <div className="text-slate-600 text-[11px] mt-0.5 font-medium">
              <strong className="text-slate-900">{count} relevant offset wells</strong> within radius • <strong className="text-amber-700">{nptOffsets} offset(s)</strong> with historical NPT
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/map')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[#0F2C59] font-extrabold transition-colors text-xs shrink-0 shadow-2xs"
        >
          <span>View GIS Map</span>
          <ChevronRight size={14} />
        </button>
      </div>
    );
  }

  // eRTMAC Operator CONTEXT mode: Compact list of closest offsets
  if (detailLevel === 'CONTEXT') {
    const compactList = nearbyWells ? nearbyWells.slice(0, 2) : [];

    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#0F2C59] uppercase tracking-wider">
            <MapPin size={15} className="text-[#0F2C59]" />
            <span>Closest Operational Offset Context</span>
          </div>

          <button
            onClick={() => navigate('/map')}
            className="text-[11px] text-[#0F2C59] hover:text-blue-700 font-bold flex items-center gap-1 transition-colors"
          >
            <span>View All ({count})</span>
            <ChevronRight size={13} />
          </button>
        </div>

        <div className="space-y-2 text-xs">
          {compactList.map((w, i) => (
            <div
              key={w.well_id || i}
              onClick={() => navigate('/map')}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between cursor-pointer hover:border-slate-300 hover:bg-slate-100/80 transition-all shadow-2xs"
            >
              <div>
                <span className="font-extrabold text-slate-900">{w.well_name || w.well_id}</span>
                <span className="text-[11px] text-slate-600 ml-2 font-medium">• {w.distance_km} km away</span>
              </div>
              <span className="text-[10px] text-amber-700 font-bold">{w.historical_events_count} NPT Events</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Engineer / Geologist DETAILED mode: Full 5-well list table
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3.5">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 font-mono text-xs font-extrabold text-[#0F2C59] uppercase tracking-wider">
          <MapPin size={17} className="text-[#0F2C59]" />
          <span>Nearby Offset Wells Summary ({count})</span>
        </div>

        {canViewMap && (
          <button
            onClick={() => navigate('/map')}
            className="text-xs text-[#0F2C59] hover:text-[#16385C] font-mono font-bold flex items-center gap-1 transition-colors"
          >
            <span>Open GIS Map</span>
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {!nearbyWells || nearbyWells.length === 0 ? (
        <div className="py-6 text-center text-xs font-mono text-slate-500 bg-slate-50 rounded-xl border border-slate-200 font-medium">
          No nearby offset wells available in radius
        </div>
      ) : (
        <div className="space-y-2.5">
          {nearbyWells.map((w, i) => (
            <div
              key={w.well_id || i}
              onClick={() => canViewMap && navigate('/map')}
              className={`p-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100/80 rounded-xl flex items-center justify-between text-xs font-mono transition-all shadow-2xs group ${canViewMap ? 'cursor-pointer' : ''}`}
            >
              <div>
                <div className="font-extrabold text-[#0F2C59] group-hover:text-blue-900 transition-colors text-sm">
                  {w.well_name || w.well_id}
                </div>
                <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                  {w.field} • Target Depth: {w.target_depth_m}m
                </div>
              </div>

              <div className="flex items-center gap-3 text-right">
                <div>
                  <div className="text-[#0F2C59] font-black text-xs">{w.distance_km} km away</div>
                  <div className="text-[10px] text-amber-700 font-bold">
                    {w.historical_events_count} NPT Events
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-[#0F2C59] shrink-0" />
              </div>
            </div>
          ))}

          <div className="p-2.5 text-[10px] font-mono text-slate-600 bg-slate-50 rounded-lg border border-slate-200 flex justify-between font-medium">
            <span>Relevance basis: Great-circle spatial distance</span>
            <span>Similarity analysis not available</span>
          </div>
        </div>
      )}
    </div>
  );
};
