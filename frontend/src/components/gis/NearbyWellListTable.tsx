import React, { useState } from 'react';
import { Layers, Eye, ShieldAlert, CheckCircle2, ChevronRight, Sliders } from 'lucide-react';
import type { GisWell } from '../../types/gis';
import { Badge } from '../common/Badge';

interface NearbyWellListTableProps {
  wells: GisWell[];
  selectedWell: GisWell | null;
  onSelectWell: (well: GisWell) => void;
  roleCode?: string;
  detailLevel?: 'DETAILED' | 'CONTEXT' | 'SUMMARY';
}

export const NearbyWellListTable: React.FC<NearbyWellListTableProps> = ({
  wells,
  selectedWell,
  onSelectWell,
  detailLevel = 'DETAILED'
}) => {
  const [mgmtExpanded, setMgmtExpanded] = useState<boolean>(false);

  if (!wells || wells.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-2 shadow-xs">
        <div className="text-slate-900 text-sm font-extrabold">No nearby wells match selected filter criteria</div>
        <p className="text-slate-600 text-xs font-medium">Try increasing the search radius or resetting field/formation filters.</p>
      </div>
    );
  }

  // Management SUMMARY mode (with optional Expand Technical Audit toggle)
  if (detailLevel === 'SUMMARY' && !mgmtExpanded) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 text-xs shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 font-extrabold text-[#0F2C59] uppercase tracking-wider text-xs">
            <Layers size={18} className="text-[#0F2C59]" />
            <span>Executive Offset Overview ({wells.length} Wells)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMgmtExpanded(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[#0F2C59] text-xs font-extrabold transition-colors shadow-2xs"
            >
              <Sliders size={14} />
              <span>Expand Technical Data Audit</span>
            </button>
            <Badge variant="view" size="sm">MANAGEMENT SUMMARY</Badge>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[10px] text-slate-600 uppercase tracking-wider font-extrabold border-b border-slate-200 bg-slate-50">
                <th className="py-2.5 px-3">Well Name</th>
                <th className="py-2.5 px-3">Distance</th>
                <th className="py-2.5 px-3">Field</th>
                <th className="py-2.5 px-3">Target Depth</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {wells.map((w) => {
                const isSelected = selectedWell?.well_id === w.well_id;
                return (
                  <tr
                    key={w.well_id}
                    onClick={() => onSelectWell(w)}
                    className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/80 border-l-4 border-[#0F2C59]' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-extrabold text-slate-900 flex items-center gap-2">
                      <span>{w.well_name}</span>
                      {w.is_current_well && <span className="text-[10px] bg-amber-100 text-amber-950 px-2 py-0.5 rounded-md border border-amber-300 font-extrabold">CENTER</span>}
                    </td>
                    <td className="py-3 px-3 text-emerald-800 font-extrabold">{w.distance_km} km</td>
                    <td className="py-3 px-3 text-slate-700 font-semibold">{w.field}</td>
                    <td className="py-3 px-3 font-semibold">{w.target_depth_m ? `${w.target_depth_m}m` : 'N/A'}</td>
                    <td className="py-3 px-3">
                      <Badge variant="use" size="sm">{w.status.toUpperCase()}</Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button className="text-[#0F2C59] hover:text-blue-700 font-extrabold flex items-center gap-1 justify-end text-xs ml-auto">
                        <span>Inspect</span>
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // eRTMAC Operator CONTEXT mode: Compact operational list
  if (detailLevel === 'CONTEXT') {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 text-xs shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 font-extrabold text-[#0F2C59] uppercase tracking-wider text-xs">
            <Layers size={18} className="text-[#0F2C59]" />
            <span>Operationally Relevant Offsets ({wells.length})</span>
          </div>
          <Badge variant="use" size="sm">OPERATOR CONTEXT</Badge>
        </div>

        <div className="space-y-2.5">
          {wells.map((w) => {
            const isSelected = selectedWell?.well_id === w.well_id;
            return (
              <div
                key={w.well_id}
                onClick={() => onSelectWell(w)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between shadow-2xs ${
                  isSelected
                    ? 'bg-blue-50/80 border-[#0F2C59] ring-1 ring-[#0F2C59]/30'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">{w.well_name}</span>
                    <span className="text-xs text-[#0F2C59] font-bold">({w.distance_km} km)</span>
                    {w.is_current_well && (
                      <span className="text-[10px] bg-amber-100 text-amber-950 px-2 py-0.5 rounded-md border border-amber-300 font-extrabold">ACTIVE CENTER</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-600 font-medium mt-0.5">
                    Field: {w.field} • Status: {w.status}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {w.historical_events_count > 0 && (
                    <span className="px-2.5 py-1 rounded-lg bg-rose-100 border border-rose-300 text-rose-950 text-xs font-extrabold flex items-center gap-1">
                      <ShieldAlert size={14} />
                      <span>{w.historical_events_count} Incident(s)</span>
                    </span>
                  )}
                  <button className="text-[#0F2C59] hover:text-blue-700 font-extrabold flex items-center gap-1 text-xs">
                    <Eye size={14} />
                    <span>View</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Engineer, Geologist, or Management (Expanded Technical Audit mode)
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 text-xs shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 font-extrabold text-[#0F2C59] uppercase tracking-wider text-xs">
          <Layers size={18} className="text-[#0F2C59]" />
          <span>Nearby Offset Wells Spatial Audit ({wells.length} Records)</span>
        </div>

        <div className="flex items-center gap-2">
          {detailLevel === 'SUMMARY' && mgmtExpanded && (
            <button
              onClick={() => setMgmtExpanded(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-extrabold transition-colors"
            >
              <span>Collapse to Executive Summary</span>
            </button>
          )}
          <Badge variant="full" size="sm">DETAILED AUDIT</Badge>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-[10px] text-slate-600 uppercase tracking-wider font-extrabold border-b border-slate-200 bg-slate-50">
              <th className="py-2.5 px-3">Well ID</th>
              <th className="py-2.5 px-3">Well Name</th>
              <th className="py-2.5 px-3">Geo Distance</th>
              <th className="py-2.5 px-3">Field</th>
              <th className="py-2.5 px-3">Target Depth</th>
              <th className="py-2.5 px-3">Formation Overlap</th>
              <th className="py-2.5 px-3">Incidents</th>
              <th className="py-2.5 px-3">Trajectory</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {wells.map((w) => {
              const isSelected = selectedWell?.well_id === w.well_id;
              return (
                <tr
                  key={w.well_id}
                  onClick={() => onSelectWell(w)}
                  className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50/80 border-l-4 border-[#0F2C59]' : ''
                  }`}
                >
                  <td className="py-3 px-3 font-extrabold text-slate-900">{w.well_id}</td>
                  <td className="py-3 px-3 font-extrabold text-[#0F2C59] flex items-center gap-2">
                    <span>{w.well_name}</span>
                    {w.is_current_well && (
                      <span className="text-[10px] bg-amber-100 text-amber-950 px-2 py-0.5 rounded-md border border-amber-300 font-extrabold">CENTER</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-emerald-800 font-extrabold">{w.distance_km} km</td>
                  <td className="py-3 px-3 text-slate-700 font-semibold">{w.field}</td>
                  <td className="py-3 px-3 font-semibold">{w.target_depth_m ? `${w.target_depth_m}m` : 'N/A'}</td>
                  <td className="py-3 px-3">
                    {w.formation_overlap ? (
                      <span className="text-emerald-800 font-extrabold flex items-center gap-1 text-xs">
                        <CheckCircle2 size={14} />
                        <span>Overlap</span>
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs font-semibold">No overlap</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {w.historical_events_count > 0 ? (
                      <span className="text-rose-700 font-extrabold flex items-center gap-1 text-xs">
                        <ShieldAlert size={14} />
                        <span>{w.historical_events_count}</span>
                      </span>
                    ) : (
                      <span className="text-slate-500 font-semibold">0</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {w.has_trajectory ? (
                      <Badge variant="use" size="sm">AVAILABLE</Badge>
                    ) : (
                      <span className="text-slate-500 text-[10px] font-semibold">NO TRAJECTORY</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button className="text-[#0F2C59] hover:text-blue-700 font-extrabold inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-300 shadow-2xs">
                      <span>Inspect</span>
                      <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

