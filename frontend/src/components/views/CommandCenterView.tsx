import React from 'react';
import {
  Gauge, Activity, Droplets, RotateCw, AlertTriangle,
  Layers, TrendingUp, ArrowUpRight, Thermometer, Zap
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart, ReferenceLine } from 'recharts';
import { CURRENT_WELL, KPI_DATA, FORMATIONS, REALTIME_STREAM, DRILLING_EVENTS } from '../../data/mockData';

const CommandCenterView: React.FC = () => {
  const depthPercent = (CURRENT_WELL.currentDepth / CURRENT_WELL.targetDepth) * 100;

  const metrics = [
    { label: 'ROP', value: KPI_DATA.avgROP.toFixed(1), unit: 'm/hr', icon: <TrendingUp size={14} />, status: 'normal' },
    { label: 'WOB', value: KPI_DATA.currentWOB.toFixed(1), unit: 'kN', icon: <Gauge size={14} />, status: 'normal' },
    { label: 'Torque', value: KPI_DATA.maxTorque.toFixed(1), unit: 'kN·m', icon: <RotateCw size={14} />, status: 'normal' },
    { label: 'RPM', value: KPI_DATA.currentRPM, unit: 'rev/min', icon: <Activity size={14} />, status: 'normal' },
    { label: 'SPP', value: KPI_DATA.currentSPP, unit: 'psi', icon: <Zap size={14} />, status: 'info' },
    { label: 'Flow Rate', value: KPI_DATA.flowRate, unit: 'LPM', icon: <Droplets size={14} />, status: 'normal' },
    { label: 'Hookload', value: KPI_DATA.hookload.toFixed(1), unit: 'MT', icon: <ArrowUpRight size={14} />, status: 'normal' },
    { label: 'Mud Weight', value: KPI_DATA.mudWeight.toFixed(2), unit: 'g/cc', icon: <Thermometer size={14} />, status: 'info' },
    { label: 'Pit Gain', value: KPI_DATA.pitGain.toFixed(1), unit: 'bbl', icon: <AlertTriangle size={14} />, status: KPI_DATA.pitGain > 5 ? 'critical' : 'normal' },
    { label: 'Gas Units', value: KPI_DATA.gasUnits, unit: 'units', icon: <Layers size={14} />, status: KPI_DATA.gasUnits > 100 ? 'warning' : 'normal' },
  ];

  const chartData = REALTIME_STREAM.slice(-30).map((p, i) => ({
    time: `${i}m`,
    rop: p.rop,
    torque: p.torque,
    wob: p.wob,
    hookload: p.hookload,
    gasUnits: p.gasUnits,
  }));

  return (
    <div className="fade-in">
      <div className="view-header">
        <h1 className="view-header__title">Real-Time Operations Command Center</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="view-header__badge view-header__badge--live">● Live</span>
          <span className="provenance-tag">WITSML Feed</span>
        </div>
      </div>

      {/* Well Status Banner */}
      <div className="card mb-4" style={{ borderLeft: '3px solid var(--accent-blue)' }}>
        <div className="card__body" style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-heading)' }}>{CURRENT_WELL.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Duliajan Field · Upper Assam Shelf</div>
              </div>
              <div className="navbar__divider" />
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.4 }}>Current Formation</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-amber)' }}>{CURRENT_WELL.currentFormation}</div>
              </div>
              <div className="navbar__divider" />
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.4 }}>Day</div>
                <div className="text-mono" style={{ fontSize: 14, fontWeight: 600 }}>{CURRENT_WELL.daysSinceSpud}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Hole Progress</div>
                <div className="text-mono" style={{ fontSize: 16, fontWeight: 700 }}>{CURRENT_WELL.currentDepth}m <span style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 400 }}>/ {CURRENT_WELL.targetDepth}m</span></div>
              </div>
              <div style={{ width: 120 }}>
                <div className="progress-bar">
                  <div className="progress-bar__fill progress-bar__fill--blue" style={{ width: `${depthPercent}%` }} />
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textAlign: 'right', marginTop: 2 }}>{depthPercent.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="metrics-grid mb-4">
        {metrics.map((m, i) => (
          <div key={i} className={`metric-tile metric-tile--${m.status}`}>
            <div className="metric-tile__label">{m.icon} {m.label}</div>
            <div className="metric-tile__value">{m.value} <span className="metric-tile__unit">{m.unit}</span></div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid-2 mb-4">
        {/* ROP & Torque Chart */}
        <div className="card">
          <div className="card__header">
            <span className="card__title"><Activity size={14} /> ROP & Torque — Last 30 Minutes</span>
            <span className="provenance-tag">Real-Time</span>
          </div>
          <div className="card__body">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 6, fontSize: 11 }}
                  labelStyle={{ color: 'var(--text-tertiary)' }}
                />
                <Line yAxisId="left" type="monotone" dataKey="rop" stroke="#3a7bd5" strokeWidth={2} dot={false} name="ROP (m/hr)" />
                <Line yAxisId="right" type="monotone" dataKey="torque" stroke="#f59e0b" strokeWidth={2} dot={false} name="Torque (kN·m)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gas & Pit Gain Chart */}
        <div className="card">
          <div className="card__header">
            <span className="card__title"><AlertTriangle size={14} /> Gas Units & Pit Gain</span>
            <span className="provenance-tag">Monitoring</span>
          </div>
          <div className="card__body">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 6, fontSize: 11 }}
                  labelStyle={{ color: 'var(--text-tertiary)' }}
                />
                <ReferenceLine y={100} stroke="var(--accent-amber)" strokeDasharray="5 5" label={{ value: 'Gas Threshold', fill: 'var(--text-tertiary)', fontSize: 10 }} />
                <Area type="monotone" dataKey="gasUnits" stroke="#ef4444" fill="rgba(239, 68, 68, 0.15)" strokeWidth={2} name="Gas (units)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Formation Strip & Recent Events */}
      <div className="grid-2">
        {/* Formation Column */}
        <div className="card">
          <div className="card__header">
            <span className="card__title"><Layers size={14} /> Formation Column — Upper Assam Shelf</span>
          </div>
          <div className="card__body--compact">
            <div className="formation-strip">
              {FORMATIONS.map((f) => {
                const isCurrent = CURRENT_WELL.currentDepth >= f.topDepth && CURRENT_WELL.currentDepth <= f.bottomDepth;
                return (
                  <div key={f.id} className={`formation-band ${f.cssClass}`} style={isCurrent ? { outline: '1px solid var(--accent-blue)', outlineOffset: -1 } : {}}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="formation-band__name">{f.name}</span>
                      {isCurrent && <span className="badge badge--info" style={{ fontSize: 8 }}>DRILLING</span>}
                    </div>
                    <span className="formation-band__depth">{f.topDepth}–{f.bottomDepth}m</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="card">
          <div className="card__header">
            <span className="card__title"><AlertTriangle size={14} /> Recent Drilling Incidents</span>
            <span className="badge badge--critical">{DRILLING_EVENTS.length} Events</span>
          </div>
          <div className="card__body" style={{ maxHeight: 300, overflowY: 'auto' }}>
            {DRILLING_EVENTS.slice(0, 4).map((evt) => (
              <div key={evt.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className={`badge badge--${evt.severity === 'Critical' ? 'critical' : evt.severity === 'High' ? 'warning' : 'info'}`}>{evt.severity}</span>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{evt.type}</span>
                  </div>
                  <span className="text-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{evt.depth}m</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>{evt.field} · {evt.formation} · {evt.nptHours}h NPT</div>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>₹{(evt.costLossINR / 1e6).toFixed(1)}M loss</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandCenterView;
