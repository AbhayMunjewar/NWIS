import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import { FORMATIONS, CURRENT_WELL, REALTIME_STREAM, DRILLING_EVENTS } from '../../data/mockData';

interface HazardAlert {
  id: string;
  type: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  formation: string;
  depth: string;
  description: string;
  recommendation: string;
  confidence: number;
  timestamp: string;
}

const HAZARD_ALERTS: HazardAlert[] = [
  {
    id: 'HA-001', type: 'Torque Spike Detected', severity: 'High',
    formation: 'Barail Group', depth: '2,120–2,150m',
    description: 'Torque readings elevated to 16-18 kN·m (normal: 10-12). Pattern matches pre-stuck pipe signature from DUL-92 at similar depth.',
    recommendation: 'Increase lubricant concentration. Execute high-vis sweep. Prepare Glycol spotting pill (50 bbl). Monitor overpull at connections.',
    confidence: 82, timestamp: '12 min ago'
  },
  {
    id: 'HA-002', type: 'Gas Influx Warning', severity: 'Medium',
    formation: 'Kopili Formation', depth: '2,500–2,700m (predicted)',
    description: 'Based on offset well DUL-88 data, gas kick probability increases significantly at Kopili top. Current mud weight 1.24 g/cc may be insufficient.',
    recommendation: 'Pre-weight mud to 1.28 g/cc before entering Kopili. Stage barite in active system. Alert well control crew.',
    confidence: 75, timestamp: 'Predictive'
  },
  {
    id: 'HA-003', type: 'Lost Circulation Risk', severity: 'Critical',
    formation: 'Sylhet Limestone', depth: '3,000–3,200m (predicted)',
    description: 'Offset well DUL-99 experienced 100% total loss at 3,210m in Sylhet karst zone. This is a confirmed high-risk zone.',
    recommendation: 'Pre-stage LCM materials (Nut Plug, Mica). Prepare Class-G cement for potential squeeze. Reduce flow rate approaching zone.',
    confidence: 91, timestamp: 'Predictive'
  },
  {
    id: 'HA-004', type: 'Hookload Anomaly', severity: 'Low',
    formation: 'Barail Group', depth: '2,130m',
    description: 'Hookload trending upward by 5 MT over last 20 minutes. Within normal variance but monitoring recommended.',
    recommendation: 'Continue monitoring. Compare with offset well hookload profiles. No immediate action required.',
    confidence: 45, timestamp: '5 min ago'
  },
];

const HazardDetectorView: React.FC = () => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');

  const filtered = selectedSeverity === 'All' ? HAZARD_ALERTS : HAZARD_ALERTS.filter(h => h.severity === selectedSeverity);

  const severityColor = (s: string) => {
    switch (s) {
      case 'Critical': return 'var(--accent-red)';
      case 'High': return 'var(--accent-amber)';
      case 'Medium': return 'var(--accent-blue)';
      default: return 'var(--text-tertiary)';
    }
  };

  return (
    <div className="fade-in">
      <div className="view-header">
        <h1 className="view-header__title">Drilling Hazard Detector & Early Warning</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="view-header__badge view-header__badge--live">● AI Active</span>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="metrics-grid mb-4" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="metric-tile metric-tile--critical">
          <div className="metric-tile__label"><XCircle size={14} /> Active Alerts</div>
          <div className="metric-tile__value">{HAZARD_ALERTS.length}</div>
        </div>
        <div className="metric-tile metric-tile--warning">
          <div className="metric-tile__label"><AlertTriangle size={14} /> High/Critical</div>
          <div className="metric-tile__value">{HAZARD_ALERTS.filter(h => h.severity === 'Critical' || h.severity === 'High').length}</div>
        </div>
        <div className="metric-tile metric-tile--info">
          <div className="metric-tile__label"><Clock size={14} /> Predictive Warnings</div>
          <div className="metric-tile__value">{HAZARD_ALERTS.filter(h => h.timestamp === 'Predictive').length}</div>
        </div>
        <div className="metric-tile metric-tile--normal">
          <div className="metric-tile__label"><TrendingUp size={14} /> Avg Confidence</div>
          <div className="metric-tile__value">{Math.round(HAZARD_ALERTS.reduce((a, h) => a + h.confidence, 0) / HAZARD_ALERTS.length)}%</div>
        </div>
      </div>

      {/* Filter */}
      <div className="tabs">
        {['All', 'Critical', 'High', 'Medium', 'Low'].map(s => (
          <div
            key={s}
            className={`tab ${selectedSeverity === s ? 'tab--active' : ''}`}
            onClick={() => setSelectedSeverity(s)}
          >
            {s} {s !== 'All' && `(${HAZARD_ALERTS.filter(h => h.severity === s).length})`}
          </div>
        ))}
      </div>

      {/* Hazard Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(alert => (
          <div key={alert.id} className="card" style={{ borderLeft: `3px solid ${severityColor(alert.severity)}` }}>
            <div className="card__body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ShieldAlert size={18} style={{ color: severityColor(alert.severity) }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-heading)' }}>{alert.type}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{alert.formation} · {alert.depth}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`badge badge--${alert.severity === 'Critical' ? 'critical' : alert.severity === 'High' ? 'warning' : alert.severity === 'Medium' ? 'info' : 'normal'}`}>
                    {alert.severity}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{alert.timestamp}</span>
                </div>
              </div>

              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.6 }}>
                {alert.description}
              </div>

              <div style={{
                background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
                borderRadius: 6, padding: '8px 12px', fontSize: 12
              }}>
                <div style={{ fontSize: 10, color: 'var(--accent-green)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4, letterSpacing: 0.4 }}>
                  ✓ Recommended Action
                </div>
                <div style={{ color: 'var(--text-primary)' }}>{alert.recommendation}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>AI Confidence:</div>
                <div style={{ flex: 1, maxWidth: 160 }}>
                  <div className="progress-bar">
                    <div
                      className={`progress-bar__fill progress-bar__fill--${alert.confidence > 80 ? 'green' : alert.confidence > 60 ? 'amber' : 'red'}`}
                      style={{ width: `${alert.confidence}%` }}
                    />
                  </div>
                </div>
                <span className="text-mono" style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{alert.confidence}%</span>
                <span className="provenance-tag" style={{ marginLeft: 'auto' }}>Offset Well Comparison + Pattern Match</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HazardDetectorView;
