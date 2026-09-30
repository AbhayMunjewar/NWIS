import React from 'react';
import { Search, RefreshCw } from 'lucide-react';

interface Props {
  selectedWell: string;
  setSelectedWell: (w: string) => void;
  selectedSeverity: string;
  setSelectedSeverity: (s: string) => void;
  selectedStatus: string;
  setSelectedStatus: (st: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onRefresh: () => void;
  allWells: { wellId: string; wellName: string }[];
}

export const RiskFilterBar: React.FC<Props> = ({
  selectedWell,
  setSelectedWell,
  selectedSeverity,
  setSelectedSeverity,
  selectedStatus,
  setSelectedStatus,
  searchQuery,
  setSearchQuery,
  onRefresh,
  allWells
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
      <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Alert ID, Well, Risk Type, Formation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0F2C59] font-medium shadow-2xs"
          />
        </div>

        {/* Filter Well */}
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-slate-700 font-bold whitespace-nowrap">Well:</label>
          <select
            value={selectedWell}
            onChange={(e) => setSelectedWell(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#0F2C59] shadow-2xs"
          >
            <option value="ALL">All Authorized Wells</option>
            {allWells.map((w) => (
              <option key={w.wellId} value={w.wellId}>
                {w.wellName}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Severity */}
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-slate-700 font-bold whitespace-nowrap">Severity:</label>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#0F2C59] shadow-2xs"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>

        {/* Filter Status */}
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-slate-700 font-bold whitespace-nowrap">Status:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#0F2C59] shadow-2xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>
        </div>
      </div>

      <button
        onClick={onRefresh}
        className="px-3.5 py-2 bg-[#0F2C59] hover:bg-[#16385C] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Refresh</span>
      </button>
    </div>
  );
};
