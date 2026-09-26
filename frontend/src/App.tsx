import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar, { type ViewId } from './components/Sidebar';
import CommandCenterView from './components/views/CommandCenterView';
import GISMapView from './components/views/GISMapView';
import DrillingParametersView from './components/views/DrillingParametersView';
import HazardDetectorView from './components/views/HazardDetectorView';
import IncidentExplorerView from './components/views/IncidentExplorerView';
import WellComparisonView from './components/views/WellComparisonView';
import GeologyView from './components/views/GeologyView';
import DocumentsView from './components/views/DocumentsView';
import AICopilotView from './components/views/AICopilotView';
import DataSourcesView from './components/views/DataSourcesView';
import AdminView from './components/views/AdminView';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewId>('command');
  const [activeWellId, setActiveWellId] = useState('DUL_104');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderView = () => {
    switch (activeView) {
      case 'command': return <CommandCenterView />;
      case 'map': return <GISMapView />;
      case 'parameters': return <DrillingParametersView />;
      case 'hazards': return <HazardDetectorView />;
      case 'incidents': return <IncidentExplorerView />;
      case 'comparison': return <WellComparisonView />;
      case 'geology': return <GeologyView />;
      case 'documents': return <DocumentsView />;
      case 'copilot': return <AICopilotView />;
      case 'datasources': return <DataSourcesView />;
      case 'admin': return <AdminView />;
      default: return <CommandCenterView />;
    }
  };

  return (
    <div className="app-shell">
      <Navbar activeWellId={activeWellId} setActiveWellId={setActiveWellId} />
      <div className="app-layout">
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
        <main className="main-content" id="main-content">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;
