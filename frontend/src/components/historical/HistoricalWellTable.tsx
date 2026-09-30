import React from 'react';
import type { HistoricalWell } from '../../types/historical';
import { Database, Eye, MapPin, Layers, AlertTriangle, FileText } from 'lucide-react';

interface Props {
  wells: HistoricalWell[];
  globalWellId: string;
  roleCode: string;
  onSelectWell: (wellId: string) => void;
}

export const HistoricalWellTable: React.FC<Props> = ({
  wells,
  globalWellId,
  roleCode,
  onSelectWell
}) => {
  if (wells.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-600 shadow-xs">
        <Database className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-60" />
        <h3 className="text-sm font-extrabold text-[#0F2C59]">No historical wells found</h3>
        <p className="text-xs text-slate-600 font-semibold mt-1">Try adjusting search filters or field selection.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#0F2C59]" />
          <h3 className="text-sm font-extrabold text-[#0F2C59]">Historical Well Records Registry</h3>
          <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 border border-slate-300 text-slate-800 font-extrabold">
            {wells.length} Wells
          </span>
        </div>
        <span className="text-xs text-slate-600 font-bold">
          Provenance: OIL_AUTHORIZED • Verified Log Records
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
              <th className="py-3 px-4">Well Name / ID</th>
              <th className="py-3 px-4">Field & Basin</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Target Depth</th>
              {roleCode === 'GEOLOGIST' && <th className="py-3 px-4">Formations</th>}
              {(roleCode === 'DRILLING_ENGINEER' || roleCode === 'ERTMAC_OPERATOR') && <th className="py-3 px-4">Historical Incidents</th>}
              <th className="py-3 px-4">Verified Reports</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs font-medium">
            {wells.map((well) => {
              const isGlobalCurrent = well.well_id.replace('-', '_').toUpperCase() === globalWellId.replace('-', '_').toUpperCase();
              const hasDocs = ['DUL_92', 'DUL_88', 'DUL_99', 'DUL_104'].includes(well.well_id.replace('-', '_').toUpperCase());
              const docCount = well.well_id.includes('104') || well.well_id.includes('92') || well.well_id.includes('88') || well.well_id.includes('99') ? 2 : 0;

              return (
                <tr
                  key={well.well_id}
                  onClick={() => onSelectWell(well.well_id)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  {/* Well Name / ID */}
                  <td className="py-3 px-4">
                    <div className="font-extrabold text-slate-900 flex items-center gap-2">
                      {well.well_name}
                      {isGlobalCurrent && (
                        <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-cyan-100 text-cyan-950 border border-cyan-300">
                          Active Current Well
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-600 font-bold">{well.well_id}</span>
                  </td>

                  {/* Field & Basin */}
                  <td className="py-3 px-4">
                    <div className="text-slate-900 font-extrabold">{well.field}</div>
                    <div className="text-[11px] text-slate-600 font-semibold">{well.basin}</div>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded border ${well.status.toLowerCase().includes('producing') ? 'bg-emerald-100 text-emerald-950 border-emerald-300' : 'bg-slate-100 text-slate-900 border-slate-300'
                      }`}>
                      {well.status}
                    </span>
                  </td>

                  {/* Target Depth */}
                  <td className="py-3 px-4 font-black text-slate-900">
                    {well.target_depth_m} m
                  </td>

                  {/* Formations (Geologist view) */}
                  {roleCode === 'GEOLOGIST' && (
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 text-[11px] font-extrabold rounded bg-purple-100 text-purple-950 border border-purple-300 flex items-center gap-1 w-fit">
                        <Layers className="w-3 h-3 text-purple-700" />
                        {well.formation_count} Intervals
                      </span>
                    </td>
                  )}

                  {/* Historical Incidents (Engineer / Operator view) */}
                  {(roleCode === 'DRILLING_ENGINEER' || roleCode === 'ERTMAC_OPERATOR') && (
                    <td className="py-3 px-4">
                      {well.event_count > 0 ? (
                        <span className="px-2 py-0.5 text-[11px] font-extrabold rounded bg-rose-100 text-rose-950 border border-rose-300 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3 text-rose-700" />
                          {well.event_count} Incident{well.event_count > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-slate-600 font-semibold text-[11px]">No Recorded Hazards</span>
                      )}
                    </td>
                  )}

                  {/* Verified Reports Indicator */}
                  <td className="py-3 px-4">
                    {hasDocs ? (
                      <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-rose-50 text-rose-900 border border-rose-200 flex items-center gap-1 w-fit">
                        <FileText className="w-3 h-3 text-rose-700" />
                        {docCount} PDF Report{docCount > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-slate-500 font-semibold text-[10px]">No Original Report</span>
                    )}
                  </td>

                  {/* Location */}
                  <td className="py-3 px-4 text-slate-700 font-bold text-[11px]">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {well.latitude.toFixed(3)}°, {well.longitude.toFixed(3)}°
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onSelectWell(well.well_id)}
                      className="px-2.5 py-1 bg-[#0F2C59] hover:bg-[#1E3A8A] text-white rounded-md text-xs font-bold inline-flex items-center gap-1 transition-colors shadow-2xs"
                    >
                      <Eye className="w-3 h-3" />
                      Inspect Well
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
