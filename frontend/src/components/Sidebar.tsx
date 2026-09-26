import React from 'react';
import {
  LayoutDashboard, MapPin, Activity, AlertTriangle, History,
  GitCompare, Layers, FileText, Bot, Database, ShieldCheck,
  ChevronLeft, ChevronRight
} from 'lucide-react';

export type ViewId = 'command' | 'map' | 'parameters' | 'hazards' | 'incidents'
  | 'comparison' | 'geology' | 'documents' | 'copilot' | 'datasources' | 'admin';

interface SidebarProps {
  activeView: ViewId;
  setActiveView: (v: ViewId) => void;
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}

const MENU_ITEMS: { id: ViewId; label: string; icon: React.ReactNode }[] = [
  { id: 'command', label: 'Command Center', icon: <LayoutDashboard size={18} /> },
  { id: 'map', label: 'Well Map (GIS)', icon: <MapPin size={18} /> },
  { id: 'parameters', label: 'Drilling Parameters', icon: <Activity size={18} /> },
  { id: 'hazards', label: 'Hazard Detector', icon: <AlertTriangle size={18} /> },
  { id: 'incidents', label: 'Incident Explorer', icon: <History size={18} /> },
  { id: 'comparison', label: 'Well Comparison', icon: <GitCompare size={18} /> },
  { id: 'geology', label: 'Geology & Strata', icon: <Layers size={18} /> },
  { id: 'documents', label: 'Documents (RAG)', icon: <FileText size={18} /> },
  { id: 'copilot', label: 'AI Copilot', icon: <Bot size={18} /> },
  { id: 'datasources', label: 'Data Sources', icon: <Database size={18} /> },
  { id: 'admin', label: 'Admin & RBAC', icon: <ShieldCheck size={18} /> },
];

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, collapsed, setCollapsed }) => {
  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`} id="main-sidebar">
      <nav className="sidebar__nav">
        {MENU_ITEMS.map((item) => (
          <div
            key={item.id}
            className={`sidebar__item ${activeView === item.id ? 'sidebar__item--active' : ''}`}
            onClick={() => setActiveView(item.id)}
            title={collapsed ? item.label : undefined}
            id={`sidebar-${item.id}`}
          >
            <span className="sidebar__icon">{item.icon}</span>
            <span className="sidebar__label">{item.label}</span>
          </div>
        ))}
      </nav>
      <div className="sidebar__toggle" onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </div>
    </aside>
  );
};

export default Sidebar;
