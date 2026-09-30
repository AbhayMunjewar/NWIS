import React from 'react';
import { Filter, RefreshCw } from 'lucide-react';
import type { GisFilterState } from '../../types/gis';

interface WellFilterBarProps {
  filters: GisFilterState;
  onChangeFilter: (key: keyof GisFilterState, value: any) => void;
  onReset: () => void;
  availableWells: { well_id: string; well_name: string }[];
  availableFields: string[];
  availableFormations: string[];
  availableStatuses: string[];
  availableHazards: string[];
}

export const WellFilterBar: React.FC<WellFilterBarProps> = ({
  filters,
  onChangeFilter,
  onReset,
  availableWells,
  availableFields,
  availableFormations,
  availableStatuses,
  availableHazards
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 text-xs shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 font-extrabold text-[#0F2C59] uppercase tracking-wider text-xs">
          <Filter size={18} className="text-[#0F2C59]" />
          <span>Spatial & Attribute Search Filters</span>
        </div>

        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 hover:text-slate-900 transition-colors text-xs font-bold"
        >
          <RefreshCw size={14} />
          <span>Reset Filters</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* 1. Center / Reference Well */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wider block">Center Well Context</label>
          <select
            value={filters.centerWellId}
            onChange={(e) => onChangeFilter('centerWellId', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-[#0F2C59] text-xs shadow-2xs"
          >
            {availableWells.map((w) => (
              <option key={w.well_id} value={w.well_id}>
                {w.well_name} ({w.well_id})
              </option>
            ))}
          </select>
        </div>

        {/* 2. Search Radius */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wider block">Search Radius</label>
          <select
            value={filters.radiusKm}
            onChange={(e) => onChangeFilter('radiusKm', Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-[#0F2C59] text-xs shadow-2xs"
          >
            <option value={5}>5 km Radius</option>
            <option value={10}>10 km Radius</option>
            <option value={25}>25 km Radius (Local)</option>
            <option value={50}>50 km Radius</option>
            <option value={100}>100 km Radius</option>
            <option value={200}>200 km Radius (Assam Fields)</option>
            <option value={500}>500 km Radius (Regional Offsets)</option>
          </select>
        </div>

        {/* 3. Field Filter */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wider block">Field</label>
          <select
            value={filters.field}
            onChange={(e) => onChangeFilter('field', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-[#0F2C59] text-xs shadow-2xs"
          >
            <option value="">All Fields</option>
            {availableFields.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        {/* 4. Formation Filter */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wider block">Formation</label>
          <select
            value={filters.formation}
            onChange={(e) => onChangeFilter('formation', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-[#0F2C59] text-xs shadow-2xs"
          >
            <option value="">All Formations</option>
            {availableFormations.map((fm) => (
              <option key={fm} value={fm}>{fm}</option>
            ))}
          </select>
        </div>

        {/* 5. Well Status */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wider block">Status</label>
          <select
            value={filters.status}
            onChange={(e) => onChangeFilter('status', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-[#0F2C59] text-xs shadow-2xs"
          >
            <option value="">All Statuses</option>
            {availableStatuses.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        {/* 6. Hazard Event Filter */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wider block">Recorded Hazard</label>
          <select
            value={filters.hazardType}
            onChange={(e) => onChangeFilter('hazardType', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-[#0F2C59] text-xs shadow-2xs"
          >
            <option value="">All Incident Hazards</option>
            {availableHazards.map((hz) => (
              <option key={hz} value={hz}>{hz}</option>
            ))}
          </select>
        </div>

        {/* 7. Min Depth */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wider block">Min Depth (m)</label>
          <input
            type="number"
            placeholder="e.g. 2000"
            value={filters.minDepth}
            onChange={(e) => onChangeFilter('minDepth', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-[#0F2C59] text-xs placeholder:text-slate-400 shadow-2xs"
          />
        </div>
      </div>
    </div>
  );
};

