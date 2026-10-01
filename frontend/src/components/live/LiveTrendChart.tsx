import React, { useEffect, useState } from 'react';
import { LineChart, Clock } from 'lucide-react';
import type { TrendPoint, LiveTrendsResponse } from '../../types/live';

interface LiveTrendChartProps {
  wellId: string;
}

export const LiveTrendChart: React.FC<LiveTrendChartProps> = ({ wellId }) => {
  const [selectedParam, setSelectedParam] = useState<'rop' | 'wob' | 'torque' | 'rpm' | 'spp' | 'flow_rate' | 'hookload'>('torque');
  const [timeWindow, setTimeWindow] = useState<string>('30m');
  const [data, setData] = useState<LiveTrendsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTrends = async () => {
      setLoading(true);
      try {
        const resp = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/live/trends?well_id=${wellId}&time_window=${timeWindow}&max_points=80`);
        if (resp.ok) {
          const json = await resp.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to fetch trend data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, [wellId, timeWindow]);

  const paramConfigs: Record<string, { label: string; unit: string; color: string }> = {
    torque: { label: 'Rotational Torque', unit: 'kN.m', color: '#f43f5e' },
    rop: { label: 'Rate of Penetration (ROP)', unit: 'm/hr', color: '#10b981' },
    wob: { label: 'Weight on Bit (WOB)', unit: 'kN', color: '#f59e0b' },
    rpm: { label: 'Top Drive RPM', unit: 'rpm', color: '#06b6d4' },
    spp: { label: 'Standpipe Pressure (SPP)', unit: 'psi', color: '#a855f7' },
    flow_rate: { label: 'Mud Flow Rate', unit: 'lpm', color: '#6366f1' },
    hookload: { label: 'Hookload', unit: 'klbs', color: '#14b8a6' }
  };

  const currConfig = paramConfigs[selectedParam];
  const points: TrendPoint[] = data?.trends || [];

  // Extract min & max values for scale
  const values = points.map(p => Number(p[selectedParam]) || 0);
  const minVal = values.length > 0 ? Math.min(...values) : 0;
  const maxVal = values.length > 0 ? Math.max(...values) : 100;
  const range = maxVal - minVal || 1;

  // Generate SVG path points (width = 600, height = 180)
  const svgWidth = 600;
  const svgHeight = 180;
  const svgPoints = points.map((p, i) => {
    const x = (i / Math.max(points.length - 1, 1)) * svgWidth;
    const y = svgHeight - (((Number(p[selectedParam]) || 0) - minVal) / range) * (svgHeight - 20) - 10;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 text-xs shadow-xs">
      {/* Chart Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 font-extrabold text-[#0F2C59] uppercase tracking-wider text-xs">
          <LineChart size={18} className="text-[#0F2C59]" />
          <span>Real-Time Sensor Telemetry Time-Series Chart</span>
        </div>

        {/* Time Window Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <Clock size={14} className="text-slate-600 ml-1" />
          {['5m', '15m', '30m', '1h', '4h'].map((w) => (
            <button
              key={w}
              onClick={() => setTimeWindow(w)}
              className={`px-2.5 py-1 rounded-lg font-extrabold transition-colors ${
                timeWindow === w ? 'bg-[#0F2C59] text-white' : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Parameter Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-thin">
        {Object.keys(paramConfigs).map((k) => {
          const conf = paramConfigs[k];
          const isActive = selectedParam === k;
          return (
            <button
              key={k}
              onClick={() => setSelectedParam(k as any)}
              className={`px-3 py-1.5 rounded-lg font-extrabold shrink-0 transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span style={{ color: conf.color }}>● </span>
              {conf.label.split(' ')[0]}
            </button>
          );
        })}
      </div>

      {/* Main SVG Time-Series Display */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 font-semibold">
          Loading {currConfig.label} time-series data...
        </div>
      ) : points.length === 0 ? (
        <div className="py-16 text-center text-slate-500 font-semibold">
          No time-series telemetry data available for selected window
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-700 font-semibold">
            <div>
              Channel: <strong className="text-[#0F2C59] font-extrabold">{currConfig.label}</strong> ({currConfig.unit})
            </div>
            <div>
              Range: <strong className="text-slate-900 font-extrabold">{minVal.toFixed(1)} - {maxVal.toFixed(1)} {currConfig.unit}</strong>
            </div>
          </div>

          <div className="relative w-full h-[200px] bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center justify-center shadow-2xs">
            {/* SVG Grid Lines */}
            <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
              <line x1="0" y1="0" x2={svgWidth} y2="0" stroke="#cbd5e1" strokeDasharray="4,4" />
              <line x1="0" y1={svgHeight/2} x2={svgWidth} y2={svgHeight/2} stroke="#cbd5e1" strokeDasharray="4,4" />
              <line x1="0" y1={svgHeight} x2={svgWidth} y2={svgHeight} stroke="#cbd5e1" strokeDasharray="4,4" />

              {/* Trend Polyline */}
              <polyline
                fill="none"
                stroke={currConfig.color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={svgPoints}
              />
            </svg>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 font-medium pt-1">
            <span>Start: <strong>{points[0]?.timestamp || '00:00'}</strong></span>
            <span><strong>{points.length}</strong> Samples ({timeWindow} Window)</span>
            <span>Latest: <strong>{points[points.length - 1]?.timestamp || '03:59'}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};

