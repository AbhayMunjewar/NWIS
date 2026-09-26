import React, { useState } from 'react';
import { MapPin, Filter, Info } from 'lucide-react';
import { WELLS } from '../../data/mockData';

const GISMapView: React.FC = () => {
  const [radius, setRadius] = useState(50);
  const [selectedField, setSelectedField] = useState('All');

  const fields = ['All', ...new Set(WELLS.map(w => w.field))];
  const filteredWells = selectedField === 'All' ? WELLS : WELLS.filter(w => w.field === selectedField);

  // Center around Duliajan
  const centerLat = 26.857;
  const centerLng = 95.340;

  return (
    <div className="fade-in">
      <div className="view-header">
        <h1 className="view-header__title">Offset Well Map — GIS View</h1>
        <span className="view-header__badge view-header__badge--analysis">Spatial Analysis</span>
      </div>

      <div className="grid-3-1">
        {/* Map Area (SVG-based for no external dependency) */}
        <div className="card" style={{ minHeight: 500 }}>
          <div className="card__header">
            <span className="card__title"><MapPin size={14} /> Upper Assam Shelf Basin — Well Locations</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select
                value={selectedField}
                onChange={e => setSelectedField(e.target.value)}
                style={{
                  background: 'var(--bg-input)', border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)', padding: '4px 8px', borderRadius: 4, fontSize: 11,
                  fontFamily: 'var(--font-sans)'
                }}
              >
                {fields.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div className="card__body--flush" style={{ position: 'relative', height: 450, background: 'var(--bg-primary)', overflow: 'hidden' }}>
            {/* SVG Map */}
            <svg width="100%" height="100%" viewBox="0 0 600 450" style={{ display: 'block' }}>
              {/* Grid lines */}
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <React.Fragment key={`grid-${i}`}>
                  <line x1={0} y1={i * 56.25} x2={600} y2={i * 56.25} stroke="var(--border-primary)" strokeWidth={0.5} strokeDasharray="4 4" />
                  <line x1={i * 75} y1={0} x2={i * 75} y2={450} stroke="var(--border-primary)" strokeWidth={0.5} strokeDasharray="4 4" />
                </React.Fragment>
              ))}

              {/* Wells */}
              {filteredWells.map(well => {
                // Simple projection: scale lat/lng to SVG coords
                const x = ((well.lng - 94.0) / 2.0) * 600;
                const y = 450 - ((well.lat - 26.5) / 1.2) * 450;
                const isDrilling = well.id === 'DUL_104';
                const isOffset = well.status === 'Offset Reference';

                return (
                  <g key={well.id} style={{ cursor: 'pointer' }}>
                    {/* Radius ring for active well */}
                    {isDrilling && (
                      <circle cx={x} cy={y} r={radius} fill="none" stroke="var(--accent-blue)" strokeWidth={1} strokeDasharray="4 4" opacity={0.4} />
                    )}
                    {/* Well marker */}
                    <circle
                      cx={x} cy={y}
                      r={isDrilling ? 8 : 5}
                      fill={isDrilling ? 'var(--accent-blue)' : isOffset ? 'var(--accent-amber)' : 'var(--accent-green)'}
                      stroke={isDrilling ? 'var(--accent-blue)' : 'var(--border-secondary)'}
                      strokeWidth={isDrilling ? 2 : 1}
                      opacity={0.9}
                    />
                    {isDrilling && (
                      <circle cx={x} cy={y} r={12} fill="none" stroke="var(--accent-blue)" strokeWidth={1} opacity={0.3}>
                        <animate attributeName="r" from="8" to="20" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                    {/* Label */}
                    <text x={x + (isDrilling ? 12 : 8)} y={y + 3} fill="var(--text-secondary)" fontSize={isDrilling ? 11 : 9} fontFamily="var(--font-sans)">
                      {well.name.split('-').pop()}
                    </text>
                  </g>
                );
              })}

              {/* Legend */}
              <g transform="translate(10, 410)">
                <circle cx={5} cy={5} r={4} fill="var(--accent-blue)" />
                <text x={14} y={8} fill="var(--text-tertiary)" fontSize={9}>Active Drilling</text>
                <circle cx={100} cy={5} r={4} fill="var(--accent-amber)" />
                <text x={109} y={8} fill="var(--text-tertiary)" fontSize={9}>Offset Reference</text>
                <circle cx={200} cy={5} r={4} fill="var(--accent-green)" />
                <text x={209} y={8} fill="var(--text-tertiary)" fontSize={9}>Producing</text>
              </g>
            </svg>

            {/* Radius Slider Overlay */}
            <div style={{
              position: 'absolute', bottom: 12, right: 12, background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)', borderRadius: 6, padding: '8px 12px',
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 11
            }}>
              <span style={{ color: 'var(--text-tertiary)' }}>Radius:</span>
              <input
                type="range" min={20} max={120} value={radius}
                onChange={e => setRadius(Number(e.target.value))}
                style={{ width: 80, accentColor: 'var(--accent-blue)' }}
              />
              <span className="text-mono" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{((radius / 120) * 10).toFixed(1)}km</span>
            </div>
          </div>
        </div>

        {/* Well List Panel */}
        <div className="card">
          <div className="card__header">
            <span className="card__title"><Filter size={14} /> Well Registry</span>
            <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{filteredWells.length} wells</span>
          </div>
          <div className="card__body--flush" style={{ maxHeight: 450, overflowY: 'auto' }}>
            {filteredWells.map(well => (
              <div key={well.id} style={{
                padding: '10px 16px', borderBottom: '1px solid var(--border-primary)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                cursor: 'pointer', transition: 'background 0.15s'
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-tertiary)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{well.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{well.field} · {well.targetDepth}m TD</div>
                </div>
                <span className={`badge badge--${well.status === 'Drilling' ? 'info' : well.status === 'Producing' ? 'normal' : 'warning'}`}>
                  {well.status === 'Drilling' ? '● Drilling' : well.status === 'Producing' ? 'Producing' : 'Offset'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GISMapView;
