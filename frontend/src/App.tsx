import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import { CurrentWellProvider } from './lib/wellContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';

import { LandingPage } from './pages/LandingPage';
import { OperationsDashboard } from './pages/OperationsDashboard';
import { GisMapDashboard } from './pages/GisMapDashboard';
import { LiveDrillingDashboard } from './pages/LiveDrillingDashboard';
import { RiskAlertsDashboard } from './pages/RiskAlertsDashboard';
import { HistoricalWellsDashboard } from './pages/HistoricalWellsDashboard';
import { AiAssistantDashboard } from './pages/AiAssistantDashboard';
import { ReportsWorkspace } from './pages/ReportsWorkspace';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CurrentWellProvider>
        <BrowserRouter>
          <Routes>
            {/* Single Combined Public Landing & Entity Login Page Route */}
            <Route path="/" element={<LandingPage />} />

            {/* Redirect legacy /login route to single main Landing Page */}
            <Route path="/login" element={<Navigate to="/" replace />} />

            {/* Protected NWIS Application Shell Routes */}
            <Route element={<AppShell />}>
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute dashboardKey="dashboard">
                    <OperationsDashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/map"
                element={
                  <ProtectedRoute dashboardKey="map">
                    <GisMapDashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/live"
                element={
                  <ProtectedRoute dashboardKey="live">
                    <LiveDrillingDashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/alerts"
                element={
                  <ProtectedRoute dashboardKey="alerts">
                    <RiskAlertsDashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/historical"
                element={
                  <ProtectedRoute dashboardKey="historical">
                    <HistoricalWellsDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/wells" element={<Navigate to="/historical" replace />} />
              
              <Route
                path="/assistant"
                element={
                  <ProtectedRoute dashboardKey="assistant">
                    <AiAssistantDashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/reports"
                element={
                  <ProtectedRoute dashboardKey="reports">
                    <ReportsWorkspace />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Catch-all redirect to Landing Page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CurrentWellProvider>
    </AuthProvider>
  );
};

export default App;

