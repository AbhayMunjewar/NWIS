import React from 'react';
import { Database, CheckCircle, AlertCircle, Clock, Server, Activity } from 'lucide-react';
import { DATA_SOURCES } from '../../data/mockData';

const DataSourcesView: React.FC = () => {
  const onlineCount = DATA_SOURCES.filter(d => d.status === 'Online').length;

  return (
    <div className="fade-in">
      <div className="view-header">
        <h1 className="view-header__title">Data Source Health & Provenance Center</h1>
        <span className="view-header__badge view-header__badge--live">● Monitoring</span>
      </div>

      {/* Health Summary */}
      <div className="metrics-grid mb-4" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="metric-tile metric-tile--normal">
          <div className="metric-tile__label"><Server size={14} /> Total Sources</div>
          <div className="metric-tile__value">{DATA_SOURCES.length}</div>
        </div>
        <div className="metric-tile metric-tile--normal">
          <div className="metric-tile__label"><CheckCircle size={14} /> Online</div>
          <div className="metric-tile__value text-green">{onlineCount}</div>
        </div>
        <div className="metric-tile metric-tile--info">
          <div className="metric-tile__label"><Activity size={14} /> Avg Latency</div>
          <div className="metric-tile__value">
            {Math.round(DATA_SOURCES.reduce((a, d) => a + parseInt(d.latency), 0) / DATA_SOURCES.length)}
            <span className="metric-tile__unit">ms</span>
          </div>
        </div>
        <div className="metric-tile metric-tile--info">
          <div className="metric-tile__label"><Database size={14} /> Total Records</div>
          <div className="metric-tile__value">{DATA_SOURCES.reduce((a, d) => a + d.records, 0).toLocaleString()}</div>
        </div>
      </div>

      {/* Data Source Cards */}
      <div className="card">
        <div className="card__header">
          <span className="card__title"><Database size={14} /> Connected Data Sources</span>
        </div>
        <div className="card__body--flush">
          <table className="data-table">
            <thead>
              <tr>
                <th>Source Name</th>
                <th>Status</th>
                <th>Latency</th>
                <th>Records</th>
                <th>Last Sync</th>
                <th>Provenance</th>
              </tr>
            </thead>
            <tbody>
              {DATA_SOURCES.map((ds, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, color: 'var(--text-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Database size={13} style={{ color: 'var(--accent-blue)' }} />
                      {ds.name}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge--normal">
                      <CheckCircle size={10} /> {ds.status}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: parseInt(ds.latency) < 100 ? 'var(--accent-green)' : 'var(--accent-amber)' }}>
                      {ds.latency}
                    </span>
                  </td>
                  <td>{ds.records.toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={10} style={{ color: 'var(--text-muted)' }} />
                      {ds.lastSync}
                    </div>
                  </td>
                  <td>
                    <span className="provenance-tag">VERIFIED</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Provenance Key */}
      <div className="card mt-4">
        <div className="card__header">
          <span className="card__title">Data Provenance Classification</span>
        </div>
        <div className="card__body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { tag: 'SOURCE_EXTRACTED', desc: 'Directly extracted from original documents (PDFs, reports)', color: 'var(--accent-green)' },
              { tag: 'DERIVED', desc: 'Computed or synthesized from source data through processing pipeline', color: 'var(--accent-purple)' },
              { tag: 'REAL_TIME', desc: 'Live streaming data from WITSML/sensor feeds with <1 min delay', color: 'var(--accent-blue)' },
              { tag: 'AI_GENERATED', desc: 'AI/ML model predictions, pattern matching, or NLP extraction', color: 'var(--accent-amber)' },
              { tag: 'REFERENCE', desc: 'Industry standards, SPE papers, and geological reference data', color: 'var(--accent-cyan)' },
              { tag: 'VERIFIED', desc: 'Data validated against multiple sources and approved by SME', color: 'var(--text-primary)' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{
                  fontSize: 9, padding: '2px 6px', borderRadius: 3, fontWeight: 600,
                  background: `${item.color}15`, color: item.color, border: `1px solid ${item.color}30`,
                  whiteSpace: 'nowrap', flexShrink: 0, letterSpacing: 0.3
                }}>
                  {item.tag}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSourcesView;
