import React from 'react';
import { Layers, Info, BookOpen } from 'lucide-react';
import { Badge } from '../common/Badge';

interface FormationContextCardProps {
  formationContext: any;
}

export const FormationContextCard: React.FC<FormationContextCardProps> = ({ formationContext }) => {
  const fc = formationContext || {};
  const obs = fc.observed || {};
  const ref = fc.reference || {};

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 font-mono text-xs font-extrabold text-[#0F2C59] uppercase tracking-wider">
          <Layers size={17} className="text-[#0F2C59]" />
          <span>Current Formation & Geological Context</span>
        </div>
        <Badge variant="neutral" size="sm">
          {obs.data_provenance || 'OBSERVED_LOG_INTERVAL'}
        </Badge>
      </div>

      <div className="space-y-3.5 text-xs font-mono">
        {/* Section A: Current Observed Formation Information */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 shadow-2xs">
          <div className="text-[11px] text-[#0F2C59] font-extrabold uppercase tracking-wider flex items-center justify-between">
            <span>Current Observed Formation (Log Interval)</span>
            <Badge variant="full" size="sm">OBSERVED AT CURRENT DEPTH</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <span className="text-[10px] text-slate-600 font-bold uppercase block">Formation Name</span>
              <span className="font-black text-[#0F2C59] text-base">{obs.observed_formation || 'Barail Group'}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-600 font-bold uppercase block">Observed Log Interval</span>
              <span className="font-extrabold text-slate-900 text-sm">{obs.observed_top_m ?? 1800}m – {obs.observed_bottom_m ?? 2500}m</span>
            </div>
          </div>

          <div className="pt-1">
            <span className="text-[10px] text-slate-600 font-bold uppercase block">Observed Lithology</span>
            <span className="font-bold text-[#0F2C59] text-xs">{obs.observed_lithology || 'Smectite Shale & Sandstone'}</span>
          </div>
        </div>

        {/* Section B: Reference / Historical Geological Context (Explicitly Distinguished) */}
        {ref.reference_formation && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 shadow-2xs">
            <div className="text-[11px] text-slate-800 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen size={13} className="text-amber-600" />
              <span>Stratigraphic Reference Context (Upper Assam Catalog)</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <span className="text-[10px] text-slate-600 font-bold uppercase block">Reference Catalog Name</span>
                <span className="font-bold text-slate-900">{ref.reference_formation}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-600 font-bold uppercase block">Stratigraphic Reference Interval</span>
                <span className="font-bold text-slate-900">{ref.reference_top_m}m – {ref.reference_bottom_m}m</span>
              </div>
            </div>

            {ref.drilling_hazards && (
              <div className="pt-1 text-xs">
                <span className="text-[10px] text-slate-600 font-bold uppercase block mb-1">Known Reference Hazards</span>
                <span className="text-amber-950 bg-amber-50 border border-amber-200 p-2 rounded-lg font-bold block">{ref.drilling_hazards}</span>
              </div>
            )}
          </div>
        )}

        {/* Geological Note */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5 text-xs text-blue-950 font-sans leading-normal shadow-2xs font-medium">
          <Info size={15} className="shrink-0 mt-0.5 text-blue-700" />
          <span>
            <strong className="text-blue-900 font-bold">Geological Context Note:</strong> Observed log interval bounds describe logged borehole section. Historical stratigraphic reference bounds provide regional Upper Assam Basin baseline context.
          </span>
        </div>
      </div>
    </div>
  );
};
