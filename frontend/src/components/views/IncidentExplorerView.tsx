import React, { useState } from 'react';
import { History, DollarSign, Clock, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { DRILLING_EVENTS } from '../../data/mockData';

const IncidentExplorerView: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const totalNPT = DRILLING_EVENTS.reduce((acc, e) => acc + e.nptHours, 0);
  const totalCost = DRILLING_EVENTS.reduce((acc, e) => acc + e.costLossINR, 0);

  const nptByType = DRILLING_EVENTS.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + e.nptHours;
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.entries(nptByType).map(([type, hours]) => ({ type, hours }));

  const costByField = DRILLING_EVENTS.reduce((acc, e) => {
    acc[e.field] = (acc[e.field] || 0) + e.costLossINR;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(costByField).map(([field, cost]) => ({ name: field, value: cost }));
  const PIE_COLORS = ['#3a7bd5', '#f59e0b', '#ef4444', '#22c55e', '#8b5cf6'];

  return (
    <div className="fade-in">
      <div className="view-header">
        <h1 className="view-header__title">NPT Incident Explorer & Financial Loss Tracker</h1>
        <span className="view-header__badge view-header__badge--analysis">Historical Analysis</span>
      </div>

      {/* Summary KPIs */}
      <div className="metrics-grid mb-4" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="metric-tile metric-tile--critical">
          <div className="metric-tile__label"><AlertTriangle size={14} /> Total Incidents</div>
          <div className="metric-tile__value">{DRILLING_EVENTS.length}</div>
        </div>
        <div className="metric-tile metric-tile--warning">
          <div className="metric-tile__label"><Clock size={14} /> Total NPT</div>
          <div className="metric-tile__value">{totalNPT} <span className="metric-tile__unit">hours</span></div>
        </div>
        <div className="metric-tile metric-tile--critical">
          <div className="metric-tile__label"><DollarSign size={14} /> Total Cost Loss</div>
          <div className="metric-tile__value">₹{(totalCost / 1e6).toFixed(1)}M</div>
        </div>
        <div className="metric-tile metric-tile--info">
          <div className="metric-tile__label"><History size={14} /> Avg NPT/Incident</div>
          <div className="metric-tile__value">{(totalNPT / DRILLING_EVENTS.length).toFixed(1)} <span className="metric-tile__unit">hrs</span></div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid-2 mb-4">
        <div className="card">
          <div className="card__header">
            <span className="card__title"><Clock size={14} /> NPT Hours by Incident Type</span>
          </div>
          <div className="card__body">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 6, fontSize: 11 }} />
                <Bar dataKey="hours" fill="var(--accent-amber)" radius={[4, 4, 0, 0]} name="NPT Hours" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card__header">
            <span className="card__title"><DollarSign size={14} /> Cost Distribution by Field</span>
          </div>
          <div className="card__body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 6, fontSize: 11 }} formatter={(val: number) => `₹${(val / 1e6).toFixed(1)}M`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Incident Details */}
      <div className="card">
        <div className="card__header">
          <span className="card__title"><History size={14} /> Incident Audit Trail</span>
          <span className="provenance-tag">SOURCE_EXTRACTED</span>
        </div>
        <div className="card__body--flush">
          {DRILLING_EVENTS.map(evt => (
            <div key={evt.id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
              <div
                style={{
                  padding: '12px 16px', cursor: 'pointer', display: 'flex',
                  justifyContent: 'space-between', alignItems: 'center',
                  transition: 'background 0.15s'
                }}
                onClick={() => setExpandedId(expandedId === evt.id ? null : evt.id)}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-tertiary)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className={`badge badge--${evt.severity === 'Critical' ? 'critical' : evt.severity === 'High' ? 'warning' : 'info'}`}>
                    {evt.severity}
                  </span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{evt.type}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                      {evt.wellId.replace('_', '-')} · {evt.formation} · {evt.depth}m
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div className="text-mono" style={{ fontSize: 12, fontWeight: 600 }}>{evt.nptHours}h NPT</div>
                    <div style={{ fontSize: 10, color: 'var(--accent-red)' }}>₹{(evt.costLossINR / 1e6).toFixed(1)}M</div>
                  </div>
                  {expandedId === evt.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {expandedId === evt.id && (
                <div style={{ padding: '0 16px 16px', background: 'var(--bg-secondary)' }}>
                  <div className="incident-stepper">
                    <div className="incident-step">
                      <div className="incident-step__marker" style={{ background: 'var(--accent-red)', color: '#fff' }}>1</div>
                      <div className="incident-step__line" />
                      <div className="incident-step__content">
                        <div className="incident-step__title">Root Cause</div>
                        <div className="incident-step__detail">{evt.rootCause}</div>
                      </div>
                    </div>
                    <div className="incident-step">
                      <div className="incident-step__marker" style={{ background: 'var(--accent-amber)', color: '#fff' }}>2</div>
                      <div className="incident-step__line" />
                      <div className="incident-step__content">
                        <div className="incident-step__title">Duration</div>
                        <div className="incident-step__detail">
                          {new Date(evt.startTime).toLocaleString()} → {new Date(evt.endTime).toLocaleString()} ({evt.nptHours} hours)
                        </div>
                      </div>
                    </div>
                    <div className="incident-step">
                      <div className="incident-step__marker" style={{ background: 'var(--accent-green)', color: '#fff' }}>3</div>
                      <div className="incident-step__content">
                        <div className="incident-step__title">Mitigation Applied</div>
                        <div className="incident-step__detail">{evt.mitigation}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IncidentExplorerView;
