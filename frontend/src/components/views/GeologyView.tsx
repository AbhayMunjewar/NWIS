import React from 'react';
import { Layers, AlertTriangle, Info } from 'lucide-react';
import { FORMATIONS } from '../../data/mockData';

const GeologyView: React.FC = () => {
  const maxDepth = 3500;

  return (
    <div className="fade-in">
      <div className="view-header">
        <h1 className="view-header__title">Geology & Stratigraphic Correlation</h1>
        <span className="view-header__badge view-header__badge--analysis">Upper Assam Shelf</span>
      </div>

      <div className="grid-2-1">
        {/* Stratigraphic Column */}
        <div className="card">
          <div className="card__header">
            <span className="card__title"><Layers size={14} /> Stratigraphic Column — Depth Profile</span>
            <span className="provenance-tag">SPE Paper Reference</span>
          </div>
          <div className="card__body">
            <div style={{ display: 'flex', gap: 16 }}>
              {/* Depth Scale */}
              <div style={{ width: 50, position: 'relative', flexShrink: 0 }}>
                {[0, 500, 1000, 1500, 2000, 2500, 3000, 3500].map(d => (
                  <div
                    key={d}
                    style={{
                      position: 'absolute',
                      top: `${(d / maxDepth) * 100}%`,
                      right: 4,
                      fontSize: 9,
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                      transform: 'translateY(-50%)'
                    }}
                  >
                    {d}m
                  </div>
                ))}
              </div>

              {/* Formation Bars */}
              <div style={{ flex: 1, position: 'relative', minHeight: 500, background: 'var(--bg-primary)', borderRadius: 6, border: '1px solid var(--border-primary)', overflow: 'hidden' }}>
                {FORMATIONS.map(f => {
                  const top = (f.topDepth / maxDepth) * 100;
                  const height = ((f.bottomDepth - f.topDepth) / maxDepth) * 100;
                  return (
                    <div
                      key={f.id}
                      style={{
                        position: 'absolute',
                        top: `${top}%`,
                        left: 0,
                        right: 0,
                        height: `${height}%`,
                        background: `${f.color}15`,
                        borderLeft: `4px solid ${f.color}`,
                        borderBottom: '1px solid var(--border-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 16px',
                        transition: 'background 0.2s',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = `${f.color}25`)}
                      onMouseLeave={e => (e.currentTarget.style.background = `${f.color}15`)}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)' }}>{f.name}</div>
                        <div className="text-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{f.topDepth}–{f.bottomDepth}m</div>
                        <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                          {f.hazards.map((h, i) => (
                            <span key={i} style={{
                              fontSize: 9, padding: '1px 6px', borderRadius: 3,
                              background: h.includes('Stable') ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                              color: h.includes('Stable') ? 'var(--accent-green)' : 'var(--accent-amber)',
                              border: `1px solid ${h.includes('Stable') ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)'}`
                            }}>
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Current Depth Marker */}
                <div style={{
                  position: 'absolute', top: `${(2132 / maxDepth) * 100}%`, left: 0, right: 0,
                  height: 2, background: 'var(--accent-blue)', zIndex: 2
                }}>
                  <div style={{
                    position: 'absolute', right: 8, top: -10, fontSize: 10, fontWeight: 700,
                    color: 'var(--accent-blue)', background: 'var(--bg-primary)', padding: '1px 6px',
                    borderRadius: 3, border: '1px solid var(--accent-blue)'
                  }}>
                    ▼ 2,132m Current
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formation Details Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {FORMATIONS.map(f => (
            <div key={f.id} className="card" style={{ borderLeft: `3px solid ${f.color}` }}>
              <div className="card__body--compact">
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)', marginBottom: 4 }}>{f.name}</div>
                <div className="text-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 6 }}>{f.topDepth}–{f.bottomDepth}m</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {f.hazards.map((h, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-secondary)' }}>
                      {h.includes('Stable')
                        ? <span style={{ color: 'var(--accent-green)' }}>✓</span>
                        : <AlertTriangle size={10} style={{ color: 'var(--accent-amber)' }} />}
                      {h}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GeologyView;
