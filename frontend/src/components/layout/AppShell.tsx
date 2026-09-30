import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppShell: React.FC = () => {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F8FAFC] text-slate-800 font-sans antialiased">
      {/* Official Government Tricolor Top Bar */}
      <div className="gov-tricolor-bar shrink-0"></div>

      {/* Top Banner Header with Official Logo */}
      <div className="bg-white border-b border-slate-200 px-6 py-2 flex items-center justify-between shadow-xs shrink-0 z-20">
        <div className="flex items-center gap-4">
          <img 
            src="/logo.png" 
            alt="Government of India - eRTMAC-NWIS Logo" 
            className="h-10 sm:h-12 md:h-14 object-contain max-w-[480px] sm:max-w-none" 
          />
        </div>
        <div className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <span className="font-bold text-[#0F2C59]">NATIONAL DRILLING INTELLIGENCE PORTAL</span>
          </div>
          <div className="border-l border-slate-300 h-5"></div>
          <span className="text-slate-600 font-mono text-[11px] bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
            OIL INDIA LIMITED
          </span>
        </div>
      </div>

      {/* Main Shell Container */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Persistent Left Sidebar */}
        <Sidebar />

        {/* Right Content Area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-[#F8FAFC]">
          {/* Sub Header / Control Bar */}
          <Header />

          {/* Main Dashboard Content */}
          <main className="flex-1 overflow-y-auto p-6 bg-slate-100 text-slate-900">
            <div className="max-w-[1600px] mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
