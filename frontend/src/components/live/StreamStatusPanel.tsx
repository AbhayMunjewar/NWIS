import React, { useState } from 'react';
import { Wifi, Play, Pause } from 'lucide-react';
import type { StreamHealth } from '../../types/live';
import { Badge } from '../common/Badge';

interface StreamStatusPanelProps {
  health: StreamHealth | undefined;
  isSimulated?: boolean;
  onTogglePlayback?: (playing: boolean) => void;
  onSetSpeed?: (speed: number) => void;
}

export const StreamStatusPanel: React.FC<StreamStatusPanelProps> = ({
  health,
  isSimulated = true,
  onTogglePlayback,
  onSetSpeed
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1);

  const handleToggle = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    if (onTogglePlayback) onTogglePlayback(nextState);
  };

  const handleSpeedChange = (s: number) => {
    setSpeed(s);
    if (onSetSpeed) onSetSpeed(s);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 font-extrabold text-[#0F2C59] text-xs uppercase tracking-wider">
          <Wifi size={16} className="text-emerald-600" />
          <span>Real-Time Telemetry Stream Health</span>
        </div>

        <div className="flex items-center gap-2">
          {isSimulated && (
            <span className="px-2.5 py-1 rounded-lg bg-amber-100 border border-amber-300 text-amber-950 text-[10px] font-extrabold uppercase tracking-wide">
              SIMULATED DEMO STREAM
            </span>
          )}
          <Badge variant="use" size="sm">
            {health?.connection || 'CONNECTED'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 text-xs">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider block">Last Received</span>
          <span className="font-extrabold text-slate-900 mt-0.5 block">{health?.last_received_timestamp || '2023-12-05T03:59:00'}</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider block">Update Frequency</span>
          <span className="font-extrabold text-emerald-800 mt-0.5 block">{health?.update_frequency_sec || 60} seconds</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider block">Records Ingested</span>
          <span className="font-extrabold text-[#0F2C59] mt-0.5 block">{health?.records_received || 240} Records</span>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider block">Classification</span>
          <span className="font-extrabold text-slate-900 mt-0.5 block">{health?.source_classification || 'OIL_AUTHORIZED'}</span>
        </div>

        {/* Playback Controls */}
        <div className="col-span-2 sm:col-span-4 md:col-span-1 bg-slate-100 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between gap-1.5">
          <button
            onClick={handleToggle}
            className="p-2 rounded-lg bg-white hover:bg-slate-200 border border-slate-300 text-[#0F2C59] transition-colors shadow-2xs"
            title={isPlaying ? 'Pause Stream' : 'Resume Stream'}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>

          <div className="flex items-center gap-1 text-[11px]">
            {[1, 2, 5].map((s) => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                className={`px-2 py-1 rounded-md font-extrabold transition-colors ${
                  speed === s ? 'bg-[#0F2C59] text-white' : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

