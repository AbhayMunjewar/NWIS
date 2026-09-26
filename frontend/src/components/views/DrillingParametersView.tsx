import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart, ComposedChart, Bar, ReferenceLine } from 'recharts';
import { REALTIME_STREAM } from '../../data/mockData';

const PARAMS = [
  { key: 'rop', label: 'ROP (m/hr)', color: '#3a7bd5', unit: 'm/hr' },
  { key: 'torque', label: 'Torque (kN·m)', color: '#f59e0b', unit: 'kN·m' },
  { key: 'wob', label: 'WOB (kN)', color: '#22c55e', unit: 'kN' },
  { key: 'rpm', label: 'RPM', color: '#8b5cf6', unit: 'rev/min' },
  { key: 'spp', label: 'SPP (psi)', color: '#06b6d4', unit: 'psi' },
  { key: 'hookload', label: 'Hookload (MT)', color: '#f97316', unit: 'MT' },
  { key: 'gasUnits', label: 'Gas Units', color: '#ef4444', unit: 'units' },
  { key: 'flowRate', label: 'Flow Rate (LPM)', color: '#14b8a6', unit: 'LPM' },
];

const DrillingParametersView: React.FC = () => {
  const [selectedParams, setSelectedParams] = useState<string[]>(['rop', 'torque', 'wob', 'hookload']);
  const [timeRange, setTimeRange] = useState<'30' | '60'>('60');

  const data = REALTIME_STREAM.slice(timeRange === '30' ? -30 : 0).map((p, i) => ({
    time: `${i}m`,
    rop: p.rop,
    torque: p.torque,
    wob: p.wob,
    rpm: p.rpm,
    spp: p.spp,
    hookload: p.hookload,
    gasUnits: p.gasUnits,
    flowRate: p.flowRate,
    depth: p.depth,
    label: p.label,
  }));

  const toggleParam = (key: string) => {
    setSelectedParams(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  return (
    <div className="fade-in">
      <div className="view-header">
        <h1 className="view-header__title">Drilling Parameters — Multi-Track Monitor</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="view-header__badge view-header__badge--live">● Streaming</span>
        </div>
      </div>

      {/* Parameter Toggles */}
      <div className="card mb-4">
        <div className="card__body" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginRight: 4 }}>Tracks:</span>
          {PARAMS.map(p => (
            <button
              key={p.key}
              onClick={() => toggleParam(p.key)}
              style={{
                padding: '4px 10px', borderRadius: 12, border: '1px solid',
                borderColor: selectedParams.includes(p.key) ? p.color : 'var(--border-primary)',
                background: selectedParams.includes(p.key) ? `${p.color}15` : 'transparent',
                color: selectedParams.includes(p.key) ? p.color : 'var(--text-tertiary)',
                fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)',
                transition: 'all 0.15s'
              }}
            >
              {p.label}
            </button>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
            {(['30', '60'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                style={{
                  padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border-primary)',
                  background: timeRange === t ? 'var(--accent-blue)' : 'transparent',
                  color: timeRange === t ? '#fff' : 'var(--text-tertiary)',
                  fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-sans)'
                }}
              >
                {t}m
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Individual Track Charts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {selectedParams.map(key => {
          const param = PARAMS.find(p => p.key === key)!;
          return (
            <div key={key} className="card">
              <div className="card__header">
                <span className="card__title">
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: param.color, display: 'inline-block' }} />
                  {param.label}
                </span>
                <span className="provenance-tag">1-min resolution</span>
              </div>
              <div className="card__body">
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 6, fontSize: 11 }}
                    />
                    <Area type="monotone" dataKey={key} stroke={param.color} fill={`${param.color}15`} strokeWidth={2} name={param.label} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>

      {/* Raw Data Table */}
      <div className="card mt-4">
        <div className="card__header">
          <span className="card__title"><Activity size={14} /> Raw Data — Last 10 Records</span>
          <span className="provenance-tag">DERIVED</span>
        </div>
        <div className="card__body--flush" style={{ maxHeight: 250, overflowY: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Depth (m)</th>
                <th>ROP</th>
                <th>WOB</th>
                <th>Torque</th>
                <th>RPM</th>
                <th>SPP</th>
                <th>Gas</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(-10).reverse().map((row, i) => (
                <tr key={i}>
                  <td>{row.time}</td>
                  <td>{row.depth.toFixed(1)}</td>
                  <td>{row.rop.toFixed(1)}</td>
                  <td>{row.wob.toFixed(1)}</td>
                  <td style={{ color: row.torque > 15 ? 'var(--accent-amber)' : 'inherit' }}>{row.torque.toFixed(1)}</td>
                  <td>{row.rpm.toFixed(0)}</td>
                  <td>{row.spp.toFixed(0)}</td>
                  <td style={{ color: row.gasUnits > 100 ? 'var(--accent-red)' : 'inherit' }}>{row.gasUnits.toFixed(0)}</td>
                  <td>
                    <span className={`badge badge--${row.label === 'normal' ? 'normal' : 'critical'}`}>{row.label}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DrillingParametersView;
