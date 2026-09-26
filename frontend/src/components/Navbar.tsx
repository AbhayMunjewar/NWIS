import React, { useState, useEffect } from 'react';
import { Activity, ChevronDown, Radio } from 'lucide-react';
import { WELLS, CURRENT_WELL } from '../data/mockData';

interface NavbarProps {
  activeWellId: string;
  setActiveWellId: (id: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeWellId, setActiveWellId }) => {
  const [clock, setClock] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeWell = WELLS.find(w => w.id === activeWellId);

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar__brand">
        <div className="navbar__logo">OIL</div>
        <div>
          <div className="navbar__title">eRTMAC-NWIS</div>
          <div className="navbar__subtitle">Nearby Wells Intelligence System</div>
        </div>
      </div>

      <div className="navbar__divider" />

      <div className="navbar__well-selector">
        <Activity size={14} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
        <select
          value={activeWellId}
          onChange={(e) => setActiveWellId(e.target.value)}
          id="well-selector"
        >
          {WELLS.map(w => (
            <option key={w.id} value={w.id}>{w.name} — {w.field}</option>
          ))}
        </select>
        <ChevronDown size={12} style={{ color: 'var(--text-tertiary)' }} />
      </div>

      {activeWell && (
        <>
          <div className="navbar__divider" />
          <div className="navbar__indicator">
            <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>Depth:</span>
            <span className="text-mono" style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 12 }}>
              {CURRENT_WELL.currentDepth}m
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>/ {activeWell.targetDepth}m</span>
          </div>
        </>
      )}

      <div className="navbar__status">
        <div className="navbar__indicator">
          <div className="navbar__dot navbar__dot--live" />
          <span>Stream Live</span>
        </div>
        <div className="navbar__indicator">
          <Radio size={12} style={{ color: 'var(--accent-green)' }} />
          <span>WITSML</span>
        </div>
        <div className="navbar__clock">{clock}</div>
      </div>
    </nav>
  );
};

export default Navbar;
