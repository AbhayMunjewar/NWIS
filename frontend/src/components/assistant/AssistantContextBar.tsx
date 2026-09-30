import React from 'react';
import { Compass, ShieldAlert, Layers, RotateCcw } from 'lucide-react';

interface Props {
  globalWellName: string;
  globalWellId: string;
  currentDepth: number;
  currentFormation: string;
  activeRisk?: string;
  onClearContext: () => void;
}

export const AssistantContextBar: React.FC<Props> = ({
  globalWellName,
  globalWellId,
  currentDepth,
  currentFormation,
  activeRisk,
  onClearContext
}) => {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex flex-wrap items-center gap-3">
        <div className="p-2 rounded-lg bg-cyan-100 text-cyan-900 border border-cyan-300 flex items-center gap-1.5">
          <Compass className="w-4 h-4" />
          <span className="font-extrabold text-slate-900">Active Investigation Context</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-slate-700">
          <span className="px-2 py-1 rounded-lg bg-white border border-slate-200 flex items-center gap-1 shadow-2xs">
            <strong className="text-slate-900">{globalWellName}</strong>
            <span className="text-slate-500 text-[10px]">({globalWellId})</span>
          </span>

          <span className="px-2 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
            Depth: <strong className="text-[#0F2C59]">{currentDepth} m</strong>
          </span>

          <span className="px-2 py-1 rounded-lg bg-white border border-slate-200 flex items-center gap-1 shadow-2xs">
            <Layers className="w-3 h-3 text-purple-600" />
            <strong className="text-purple-900">{currentFormation}</strong>
          </span>

          {activeRisk && (
            <span className="px-2 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-1 shadow-2xs">
              <ShieldAlert className="w-3 h-3 text-rose-600" />
              <strong>{activeRisk}</strong>
            </span>
          )}
        </div>
      </div>

      <button
        onClick={onClearContext}
        className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors shadow-2xs"
      >
        <RotateCcw className="w-3 h-3" />
        Reset Context
      </button>
    </div>
  );
};
