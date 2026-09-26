import React, { useState } from 'react';
import { GitCompare, ArrowRightLeft } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { WELLS, DRILLING_EVENTS } from '../../data/mockData';

const WellComparisonView: React.FC = () => {
  const [wellA, setWellA] = useState('DUL_92');
  const [wellB, setWellB] = useState('DUL_88');

  const wellAData = WELLS.find(w => w.id === wellA)!;
  const wellBData = WELLS.find(w => w.id === wellB)!;

  // Simulated comparison data
  const comparisonData = Array.from({ length: 20 }, (_, i) => ({
    depth: 2000 + i * 100,
    ropA: 12 + Math.random() * 5 + (i > 12 ? -3 : 0),
    ropB: 13 + Math.random() * 4 + (i > 10 ? -2 : 0),
    torqueA: 10 + Math.random() * 3 + (i > 8 ? 4 : 0),
    torqueB: 9 + Math.random() * 3 + (i > 10 ? 5 : 0),
  }));

  const comparisonMetrics = [
    { param: 'Target Depth', valA: `${wellAData.targetDepth}m`, valB: `${wellBData.targetDepth}m` },
    { param: 'Field', valA: wellAData.field, valB: wellBData.field },
    { param: 'Status', valA: wellAData.status, valB: wellBData.status },
    { param: 'Total NPT', valA: `${DRILLING_EVENTS.filter(e => e.wellId === wellA).reduce((a, e) => a + e.nptHours, 0)}h`, valB: `${DRILLING_EVENTS.filter(e => e.wellId === wellB).reduce((a, e) => a + e.nptHours, 0)}h` },
    { param: 'Total Cost Loss', valA: `₹${(DRILLING_EVENTS.filter(e => e.wellId === wellA).reduce((a, e) => a + e.costLossINR, 0) / 1e6).toFixed(1)}M`, valB: `₹${(DRILLING_EVENTS.filter(e => e.wellId === wellB).reduce((a, e) => a + e.costLossINR, 0) / 1e6).toFixed(1)}M` },
    { param: 'Incidents', valA: `${DRILLING_EVENTS.filter(e => e.wellId === wellA).length}`, valB: `${DRILLING_EVENTS.filter(e => e.wellId === wellB).length}` },
    { param: 'Latitude', valA: wellAData.lat.toFixed(3), valB: wellBData.lat.toFixed(3) },
    { param: 'Longitude', valA: wellAData.lng.toFixed(3), valB: wellBData.lng.toFixed(3) },
  ];

  return (
    <div className="fade-in">
      <div className="view-header">
        <h1 className="view-header__title">Offset Well Comparison</h1>
        <span className="view-header__badge view-header__badge--analysis">Benchmarking</span>
      </div>

      {/* Well Selectors */}
      <div className="card mb-4">
        <div className="card__body" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4 }}>Well A</div>
            <select value={wellA} onChange={e => setWellA(e.target.value)} style={{
              width: '100%', padding: '6px 10px', background: 'var(--bg-input)', border: '1px solid var(--accent-blue)',
              color: 'var(--text-primary)', borderRadius: 4, fontSize: 13, fontFamily: 'var(--font-sans)'
            }}>
              {WELLS.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <ArrowRightLeft size={20} style={{ color: 'var(--text-tertiary)', flexShrink: 0, marginTop: 16 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4 }}>Well B</div>
            <select value={wellB} onChange={e => setWellB(e.target.value)} style={{
              width: '100%', padding: '6px 10px', background: 'var(--bg-input)', border: '1px solid var(--accent-amber)',
              color: 'var(--text-primary)', borderRadius: 4, fontSize: 13, fontFamily: 'var(--font-sans)'
            }}>
              {WELLS.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="card mb-4">
        <div className="card__header">
          <span className="card__title"><GitCompare size={14} /> Parameter Comparison</span>
        </div>
        <div className="card__body--flush">
          <table className="data-table">
            <thead>
              <tr>
                <th>Parameter</th>
                <th style={{ color: 'var(--accent-blue)' }}>{wellAData.name}</th>
                <th style={{ color: 'var(--accent-amber)' }}>{wellBData.name}</th>
              </tr>
            </thead>
            <tbody>
              {comparisonMetrics.map((row, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', fontWeight: 500 }}>{row.param}</td>
                  <td>{row.valA}</td>
                  <td>{row.valB}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison Charts */}
      <div className="grid-2">
        <div className="card">
          <div className="card__header">
            <span className="card__title">ROP vs Depth Comparison</span>
          </div>
          <div className="card__body">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="depth" label={{ value: 'Depth (m)', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'ROP (m/hr)', angle: -90, position: 'insideLeft' }} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 6, fontSize: 11 }} />
                <Legend />
                <Line type="monotone" dataKey="ropA" stroke="#3a7bd5" strokeWidth={2} dot={false} name={wellAData.name} />
                <Line type="monotone" dataKey="ropB" stroke="#f59e0b" strokeWidth={2} dot={false} name={wellBData.name} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card__header">
            <span className="card__title">Torque vs Depth Comparison</span>
          </div>
          <div className="card__body">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="depth" label={{ value: 'Depth (m)', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Torque (kN·m)', angle: -90, position: 'insideLeft' }} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 6, fontSize: 11 }} />
                <Legend />
                <Line type="monotone" dataKey="torqueA" stroke="#3a7bd5" strokeWidth={2} dot={false} name={wellAData.name} />
                <Line type="monotone" dataKey="torqueB" stroke="#f59e0b" strokeWidth={2} dot={false} name={wellBData.name} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WellComparisonView;
