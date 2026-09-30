import React from 'react';
import type { TimelineEvent } from '../../types/risk';
import { Clock, CheckCircle, AlertTriangle, Activity, ShieldAlert } from 'lucide-react';

interface Props {
  timeline: TimelineEvent[];
}

export const RiskTimelinePanel: React.FC<Props> = ({ timeline }) => {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-xs text-slate-500 text-center font-medium shadow-xs">
        No risk timeline records available for this well.
      </div>
    );
  }

  const getEventIcon = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      case 'HIGH':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'MEDIUM':
        return <Activity className="w-4 h-4 text-amber-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
        <Clock className="w-4 h-4 text-[#0F2C59]" />
        <h3 className="text-sm font-extrabold text-[#0F2C59]">Risk Sequence & State Timeline</h3>
      </div>

      <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {timeline.map((item, idx) => (
          <div key={idx} className="relative group">
            <div className="absolute -left-6 top-0.5 p-1 rounded-full bg-white border border-slate-300 shadow-2xs">
              {getEventIcon(item.severity)}
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs space-y-1 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[#0F2C59]">{item.event}</span>
                <span className="text-[10px] text-slate-500 font-mono font-bold">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Depth {item.depth_m}m
                </span>
              </div>
              <p className="text-slate-700 font-medium">{item.description}</p>
              <div className="flex justify-between items-center text-[10px] text-slate-600 pt-1.5 border-t border-slate-200 font-medium">
                <span>Actor: <strong className="text-slate-800 font-bold">{item.actor}</strong></span>
                <span className="font-mono font-bold text-[#0F2C59]">{item.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
