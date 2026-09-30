import React from 'react';
import { Layers, FileText, ArrowRight } from 'lucide-react';
import type { FormationLiveContext } from '../../types/live';
import { Badge } from '../common/Badge';

interface FormationContextPanelProps {
  context: FormationLiveContext | undefined;
}

export const FormationContextPanel: React.FC<FormationContextPanelProps> = ({ context }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 text-xs shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 font-extrabold text-[#0F2C59] uppercase tracking-wider text-xs">
          <Layers size={18} className="text-amber-600" />
          <span>Geological & Stratigraphic Formation Context</span>
        </div>
        <Badge variant="full" size="sm">OBSERVED LOG INTERVAL</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current Formation Details */}
        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div>
            <span className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wider">Observed Formation</span>
            <div className="text-base font-extrabold text-slate-900 mt-0.5">
              {context ? context.current_formation : 'Barail Group Sandstone'}
            </div>
            <div className="text-xs font-semibold text-emerald-800 mt-0.5">
              Lithology: <strong className="text-slate-900 font-extrabold">{context?.lithology || 'Reactive Shale'}</strong>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wider block">Interval Top</span>
              <span className="font-extrabold text-slate-900">{context ? `${context.top_depth_m} m` : '1800 m'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wider block">Interval Bottom</span>
              <span className="font-extrabold text-slate-900">{context ? `${context.bottom_depth_m} m` : '2499.75 m'}</span>
            </div>
          </div>
        </div>

        {/* Formation Transition & Well Log Curve Availability */}
        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wider flex items-center gap-1">
              <ArrowRight size={14} className="text-[#0F2C59]" />
              <span>Stratigraphic Formation Transition</span>
            </span>
            <div className="text-xs text-slate-700 font-medium">
              Crossed Top: <strong className="text-[#0F2C59] font-extrabold">Kopili Formation</strong> → <strong className="text-amber-900 font-extrabold">Barail Group</strong> at <strong className="text-slate-900 font-extrabold">1,800m depth</strong>
            </div>
          </div>

          <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-lg space-y-1 text-xs">
            <div className="font-extrabold text-[#0F2C59] flex items-center gap-1.5">
              <FileText size={15} />
              <span>Available Well-Log Curves</span>
            </div>
            <div className="text-slate-700 font-medium text-xs">
              Curves: <strong className="text-slate-900 font-bold">Gamma Ray (GR), Deep Resistivity (RES), Bulk Density (RHOB), Neutron Porosity (NPHI), Sonic Travel Time (DTC)</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

