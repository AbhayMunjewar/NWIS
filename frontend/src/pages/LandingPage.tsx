import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Compass, 
  Activity, 
  MapPin, 
  AlertTriangle, 
  History, 
  Bot, 
  ArrowRight, 
  Layers, 
  Zap, 
  Lock, 
  UserCheck,
  KeyRound,
  LayoutDashboard,
  X
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import type { UserRole } from '../types';
import { ROLE_DISPLAY_NAMES, ROLE_DEFAULT_LANDING } from '../lib/rbac';
import { Badge } from '../components/common/Badge';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user, logout } = useAuth();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('DRILLING_ENGINEER');
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'entity' | 'credentials'>('entity');
  const [loggingInRole, setLoggingInRole] = useState<UserRole | null>(null);

  // Direct entity login handler from modal window
  const handleEntityLogin = async (roleCode: UserRole, targetPath?: string) => {
    setLoggingInRole(roleCode);
    setIsSubmitting(true);
    try {
      const defaultLanding = await login(roleCode);
      const destination = targetPath || defaultLanding || ROLE_DEFAULT_LANDING[roleCode] || '/dashboard';
      setIsLoginModalOpen(false);
      navigate(destination);
    } catch (err) {
      console.error('Entity login error:', err);
    } finally {
      setIsSubmitting(false);
      setLoggingInRole(null);
    }
  };

  // Credentials login handler from modal window
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const defaultLanding = await login(selectedRole, usernameInput || undefined);
      const destination = defaultLanding || ROLE_DEFAULT_LANDING[selectedRole] || '/dashboard';
      setIsLoginModalOpen(false);
      navigate(destination);
    } catch (err) {
      console.error('Credentials login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased flex flex-col justify-between select-none relative">
      {/* 1. Official Government Tricolor Top Bar */}
      <div className="fixed top-0 left-0 right-0 gov-tricolor-bar z-50"></div>

      {/* 2. Top Header Navigation Banner */}
      <header className="bg-white border-b border-slate-200 sticky top-1 z-40 shadow-xs">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img 
              src="/logo.png" 
              alt="Government of India - eRTMAC-NWIS Logo" 
              className="h-10 sm:h-12 md:h-14 object-contain max-w-[420px] sm:max-w-none" 
            />
          </div>

          <div className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
              <span className="font-bold text-[#0F2C59]">NATIONAL DRILLING INTELLIGENCE PORTAL</span>
            </div>
            <div className="border-l border-slate-300 h-5"></div>
            <span className="text-slate-600 font-mono text-[11px] bg-slate-100 px-3 py-1 rounded border border-slate-200">
              OIL INDIA LIMITED
            </span>
          </div>

          {/* TOP RIGHT CORNER: LOGIN BUTTON */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(user.defaultLandingPage || '/dashboard')}
                  className="px-4 py-2 bg-[#0F2C59] hover:bg-[#16385C] text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-2"
                >
                  <LayoutDashboard size={14} className="text-amber-400" />
                  <span>Dashboard ({user.roleDisplayName})</span>
                </button>
                <button
                  onClick={() => logout()}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all border border-slate-300"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-5 py-2.5 bg-[#0F2C59] hover:bg-[#16385C] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 font-mono uppercase tracking-wider hover:scale-105 active:scale-95"
              >
                <Lock size={14} className="text-amber-400" />
                <span>Portal Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 3. Main Hero Section */}
      <section className="bg-gradient-to-b from-white via-slate-50 to-[#F8FAFC] border-b border-slate-200 py-12 md:py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Hero Text & Call-To-Action */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0F2C59]/10 border border-[#0F2C59]/20 text-[#0F2C59] text-xs font-mono font-bold">
                <Compass size={15} />
                <span>eRTMAC — Real-Time Monitoring & Analytics Center</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F2C59] tracking-tight leading-tight">
                Nearby Wells Intelligence System (eRTMAC-NWIS)
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
                National Decision-Support Platform empowering Drilling Engineers, Geologists, ERTMAC Operators, and Management with early hazard warnings, offset well spatial intelligence, and operational evidence reasoning.
              </p>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-[#0F2C59]/30 transition-all">
                  <span className="text-slate-500 uppercase block text-[10px] font-bold">Indexed Wells</span>
                  <strong className="text-xl text-[#0F2C59] font-bold">21 Wells</strong>
                </div>
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-[#0F2C59]/30 transition-all">
                  <span className="text-slate-500 uppercase block text-[10px] font-bold">Detection Accuracy</span>
                  <strong className="text-xl text-emerald-600 font-bold">99.8%</strong>
                </div>
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-[#0F2C59]/30 transition-all">
                  <span className="text-slate-500 uppercase block text-[10px] font-bold">Lead Warning</span>
                  <strong className="text-xl text-amber-600 font-bold">15.0m</strong>
                </div>
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-[#0F2C59]/30 transition-all">
                  <span className="text-slate-500 uppercase block text-[10px] font-bold">Evidence Framework</span>
                  <strong className="text-xl text-purple-700 font-bold">7-Layer</strong>
                </div>
              </div>

              {/* Action CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-7 py-4 bg-[#0F2C59] hover:bg-[#16385C] text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-3 font-mono uppercase tracking-wider"
                >
                  <Lock size={16} className="text-amber-400" />
                  <span>Open Entity Login Portal</span>
                  <ArrowRight size={16} />
                </button>
                <a
                  href="#features"
                  className="px-7 py-4 bg-white hover:bg-slate-100 text-[#0F2C59] border border-slate-300 rounded-xl text-sm font-bold transition-all shadow-xs flex items-center gap-2"
                >
                  <span>Explore Capabilities</span>
                </a>
              </div>
            </div>

            {/* Right Hero Graphic Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 group">
                <img 
                  src="/hero_banner.png" 
                  alt="eRTMAC-NWIS Subsea Drilling & Telemetry Showcase" 
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white text-xs font-mono space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400">● REAL-TIME TELEMETRY SYSTEM</span>
                    <span className="bg-emerald-950/90 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700 text-[10px]">
                      MONITORING ACTIVE
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-200">
                    Upper Assam Shelf • Barail Shale Formation • Depth: 2,210m MD
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Real-Time Operations Summary Grid */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="text-xs font-mono font-bold text-[#0F2C59] uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full border border-slate-200 inline-block mb-1">
                BASIN INTELLIGENCE OVERVIEW
              </div>
              <h2 className="text-2xl font-extrabold text-[#0F2C59]">Active Drilling Telemetry Overview</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Box 1: Current Active Rig Context */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-slate-500 font-bold">Active Well Context</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono text-[10px] font-bold">OPERATIONAL</span>
              </div>
              <h3 className="text-lg font-bold text-[#0F2C59]">Duliajan-92 (DUL-92)</h3>
              <div className="space-y-1.5 text-xs text-slate-600 font-mono">
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span>Target Depth:</span>
                  <strong className="text-slate-900">3,520m MD</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span>Current Depth:</span>
                  <strong className="text-slate-900">2,210m MD</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span>Target Formation:</span>
                  <strong className="text-slate-900">Barail Shale Top</strong>
                </div>
                <div className="flex justify-between">
                  <span>Field / Basin:</span>
                  <strong className="text-slate-900">Upper Assam Shelf</strong>
                </div>
              </div>
            </div>

            {/* Box 2: Early Warning Engine */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-slate-500 font-bold">Early Hazard Status</span>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-mono text-[10px] font-bold font-semibold">EARLY WARNING</span>
              </div>
              <h3 className="text-lg font-bold text-[#0F2C59]">Stuck-Pipe Anomaly (15m Lead)</h3>
              <div className="space-y-1.5 text-xs text-slate-600 font-mono">
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span>Hazard Status:</span>
                  <strong className="text-amber-700">CRITICAL LEVEL</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span>Contributing Signal 1:</span>
                  <strong className="text-slate-900">Torque Spike (79.6 kNm)</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span>Contributing Signal 2:</span>
                  <strong className="text-slate-900">ROP Decay (4.0 m/hr)</strong>
                </div>
                <div className="flex justify-between">
                  <span>SPP Pack-Off:</span>
                  <strong className="text-slate-900">2,327 psi</strong>
                </div>
              </div>
            </div>

            {/* Box 3: Spatial Offset Similarity Engine */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-slate-500 font-bold">Spatial Alignment</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-mono text-[10px] font-bold font-semibold">OFFSET MATCH</span>
              </div>
              <h3 className="text-lg font-bold text-[#0F2C59]">Top 5 Offset Well Matches</h3>
              <div className="space-y-1 text-xs text-slate-600 font-mono">
                <div className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-200">
                  <span>1. MOR_25 (Moram Field)</span>
                  <span className="text-emerald-700 font-bold">96.4% Match</span>
                </div>
                <div className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-200">
                  <span>2. 15_9-23 (Offshore Volve)</span>
                  <span className="text-emerald-700 font-bold">92.8% Match</span>
                </div>
                <div className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-200">
                  <span>3. DUL_104 (Upper Assam)</span>
                  <span className="text-emerald-700 font-bold">89.1% Match</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 4-Step Technical Workflow Pipeline Section */}
      <section className="py-14 bg-[#F8FAFC] border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-3xl mx-auto">
            <span className="text-xs font-mono font-bold text-[#0F2C59] uppercase tracking-wider bg-slate-200/80 px-3 py-1 rounded-full border border-slate-300">
              DECISION SUPPORT ENGINE WORKFLOW
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2C59]">
              How eRTMAC-NWIS Prevents Drilling Hazards
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Continuous 4-stage operational telemetry pipeline operating from rig site to regional command center.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3 relative overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#0F2C59] text-amber-400 font-mono text-xs font-bold flex items-center justify-center">
                01
              </div>
              <h3 className="text-base font-bold text-[#0F2C59]">Spatial GIS Matching</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Calculates spatial feature alignment across 21 offset wells to retrieve historical lithology and pore pressure curves.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3 relative overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#0F2C59] text-amber-400 font-mono text-xs font-bold flex items-center justify-center">
                02
              </div>
              <h3 className="text-base font-bold text-[#0F2C59]">Live Sensor Ingestion</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Streams high-frequency sensors (WOB, RPM, Torque, SPP, Mud Density) with sub-second latency.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3 relative overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#0F2C59] text-amber-400 font-mono text-xs font-bold flex items-center justify-center">
                03
              </div>
              <h3 className="text-base font-bold text-[#0F2C59]">Multivariate Detection</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Evaluates real-time anomaly scores to detect pipe entrapment and gas kick indicators up to 15.0m prior to occurrence.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3 relative overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#0F2C59] text-amber-400 font-mono text-xs font-bold flex items-center justify-center">
                04
              </div>
              <h3 className="text-base font-bold text-[#0F2C59]">Evidence & Mitigation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generates actionable mitigation protocols, historical report evidence quotes, and assistant recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Core Capabilities Showcase (6 Modules) */}
      <section id="features" className="py-14 bg-white border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-3xl mx-auto">
            <span className="text-xs font-mono font-bold text-[#0F2C59] uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              OPERATIONAL CAPABILITIES
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2C59]">
              Unified 6-Dashboard Operational Architecture
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Purpose-built decision-support workspace integrating spatial GIS, real-time sensor streams, hazard scoring, and historical evidence documents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: Operations */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-xs space-y-3 hover:border-[#0F2C59]/40 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#0F2C59] text-white flex items-center justify-center font-bold">
                <Activity size={20} />
              </div>
              <h3 className="text-base font-bold text-[#0F2C59]">1. Operations & Command Center</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Unified real-time KPI matrix, current active well context, operational status summary, and role-scoped command options.
              </p>
            </div>

            {/* Feature 2: GIS */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-xs space-y-3 hover:border-[#0F2C59]/40 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#0F2C59] text-white flex items-center justify-center font-bold">
                <MapPin size={20} />
              </div>
              <h3 className="text-base font-bold text-[#0F2C59]">2. Nearby Wells GIS Map</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Interactive Leaflet spatial map featuring spatial distance feature vectors and Top 5 similar offset well rankings.
              </p>
            </div>

            {/* Feature 3: Live Drilling */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-xs space-y-3 hover:border-[#0F2C59]/40 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#0F2C59] text-white flex items-center justify-center font-bold">
                <Zap size={20} />
              </div>
              <h3 className="text-base font-bold text-[#0F2C59]">3. Live Drilling & Early Warnings</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Early hazard indicators providing up to 15.0m lead warning prior to pipe entrapment or gas influx.
              </p>
            </div>

            {/* Feature 4: Risk & Alerts */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-xs space-y-3 hover:border-[#0F2C59]/40 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#0F2C59] text-white flex items-center justify-center font-bold">
                <AlertTriangle size={20} />
              </div>
              <h3 className="text-base font-bold text-[#0F2C59]">4. Risk & Operational Alerts</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Multivariate anomaly scoring with multi-layer evidence reasoning and recommended mitigation protocols.
              </p>
            </div>

            {/* Feature 5: Historical */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-xs space-y-3 hover:border-[#0F2C59]/40 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#0F2C59] text-white flex items-center justify-center font-bold">
                <History size={20} />
              </div>
              <h3 className="text-base font-bold text-[#0F2C59]">5. Historical Wells & Records</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Comprehensive registry of 21 wells, report PDF documents, depth-indexed wireline log curves, and directional trajectories.
              </p>
            </div>

            {/* Feature 6: AI Assistant */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-xs space-y-3 hover:border-[#0F2C59]/40 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#0F2C59] text-white flex items-center justify-center font-bold">
                <Bot size={20} />
              </div>
              <h3 className="text-base font-bold text-[#0F2C59]">6. AI Engineering Assistant</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Decision support system connected to drilling research papers, incident reports, and historical mitigation procedures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Official Footer */}
      <footer className="bg-[#0A2540] text-slate-300 py-8 border-t border-[#1E3A5F]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-xs">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-[#1E3A5F] pb-6">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="Logo" className="h-10 object-contain bg-white p-1 rounded-lg" />
              <div>
                <div className="font-bold text-white text-sm">eRTMAC-NWIS Portal</div>
                <div className="text-[11px] text-slate-400">Government of India • Oil India Limited</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-slate-400 text-center md:text-right font-medium text-[11px]">
            <div>
              Authoritative Security Context: Role-Based RBAC Enforced
            </div>
            <div>
              © {new Date().getFullYear()} Government of India. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 8. POPUP MODAL WINDOW FOR ENTITY LOGIN (OPENED FROM TOP RIGHT HEADER) */}
      {/* ========================================================================= */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#0F2C59]/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#0F2C59]"></div>

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Lock size={18} className="text-[#0F2C59]" />
                  <h2 className="text-lg font-extrabold text-[#0F2C59]">Official Entity Portal Sign In</h2>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Select role identity to enter respective dashboard</p>
              </div>

              <div className="flex items-center gap-3">
                {/* Login Mode Toggle */}
                <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex text-[11px] font-mono">
                  <button
                    onClick={() => setActiveTab('entity')}
                    className={`px-2.5 py-1 rounded transition-colors ${activeTab === 'entity' ? 'bg-[#0F2C59] text-white font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Portals
                  </button>
                  <button
                    onClick={() => setActiveTab('credentials')}
                    className={`px-2.5 py-1 rounded transition-colors ${activeTab === 'credentials' ? 'bg-[#0F2C59] text-white font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Credentials
                  </button>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setIsLoginModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* TAB 1: QUICK ENTITY LOGIN (4 ENTITIES) */}
            {activeTab === 'entity' ? (
              <div className="space-y-3">
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0F2C59] font-mono uppercase tracking-wider text-[10px]">
                      AUTHORITATIVE OPERATIONAL ENTITIES
                    </span>
                    <Badge variant="demo" size="sm">SELECT TO LOGIN</Badge>
                  </div>
                  <p className="text-slate-700 text-[11px] leading-relaxed font-medium">
                    Click an operational entity role to sign in and immediately launch its target dashboard.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {/* Entity 1: Drilling Engineer */}
                  <button
                    onClick={() => handleEntityLogin('DRILLING_ENGINEER', '/dashboard')}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl border bg-slate-50 border-slate-200 hover:bg-[#0F2C59] hover:border-[#0F2C59] hover:text-white text-slate-800 transition-all text-xs group shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9.5 h-9.5 rounded-lg bg-[#0F2C59] group-hover:bg-amber-500 text-amber-400 group-hover:text-[#0F2C59] flex items-center justify-center font-bold shrink-0 transition-colors shadow-xs">
                        <UserCheck size={18} />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-sm">Drilling Engineer</div>
                        <div className="text-[11px] text-slate-500 group-hover:text-slate-200 mt-0.5">
                          Drilling operations & hydraulics monitoring
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-right">
                      {loggingInRole === 'DRILLING_ENGINEER' ? (
                        <span className="text-[10px] font-mono bg-amber-500 text-[#0F2C59] px-2.5 py-1 rounded font-bold animate-pulse">
                          Connecting...
                        </span>
                      ) : (
                        <span className="w-7 h-7 rounded-full bg-slate-200/60 group-hover:bg-amber-500 text-[#0F2C59] group-hover:text-[#0F2C59] flex items-center justify-center transition-colors">
                          <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Entity 2: Geologist */}
                  <button
                    onClick={() => handleEntityLogin('GEOLOGIST', '/dashboard')}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl border bg-slate-50 border-slate-200 hover:bg-[#0F2C59] hover:border-[#0F2C59] hover:text-white text-slate-800 transition-all text-xs group shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9.5 h-9.5 rounded-lg bg-[#0F2C59] group-hover:bg-amber-500 text-amber-400 group-hover:text-[#0F2C59] flex items-center justify-center font-bold shrink-0 transition-colors shadow-xs">
                        <Layers size={18} />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-sm">Geologist</div>
                        <div className="text-[11px] text-slate-500 group-hover:text-slate-200 mt-0.5">
                          Geological formation & spatial GIS mapping
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-right">
                      {loggingInRole === 'GEOLOGIST' ? (
                        <span className="text-[10px] font-mono bg-amber-500 text-[#0F2C59] px-2.5 py-1 rounded font-bold animate-pulse">
                          Connecting...
                        </span>
                      ) : (
                        <span className="w-7 h-7 rounded-full bg-slate-200/60 group-hover:bg-amber-500 text-[#0F2C59] group-hover:text-[#0F2C59] flex items-center justify-center transition-colors">
                          <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Entity 3: eRTMAC Operator */}
                  <button
                    onClick={() => handleEntityLogin('ERTMAC_OPERATOR', '/live')}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl border bg-slate-50 border-slate-200 hover:bg-[#0F2C59] hover:border-[#0F2C59] hover:text-white text-slate-800 transition-all text-xs group shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9.5 h-9.5 rounded-lg bg-[#0F2C59] group-hover:bg-amber-500 text-amber-400 group-hover:text-[#0F2C59] flex items-center justify-center font-bold shrink-0 transition-colors shadow-xs">
                        <Activity size={18} />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-sm">eRTMAC Operator</div>
                        <div className="text-[11px] text-slate-500 group-hover:text-slate-200 mt-0.5">
                          Real-time telemetry & hazard intervention
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-right">
                      {loggingInRole === 'ERTMAC_OPERATOR' ? (
                        <span className="text-[10px] font-mono bg-amber-500 text-[#0F2C59] px-2.5 py-1 rounded font-bold animate-pulse">
                          Connecting...
                        </span>
                      ) : (
                        <span className="w-7 h-7 rounded-full bg-slate-200/60 group-hover:bg-amber-500 text-[#0F2C59] group-hover:text-[#0F2C59] flex items-center justify-center transition-colors">
                          <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Entity 4: Management Supervisor */}
                  <button
                    onClick={() => handleEntityLogin('MANAGEMENT_SUPERVISOR', '/dashboard')}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl border bg-slate-50 border-slate-200 hover:bg-[#0F2C59] hover:border-[#0F2C59] hover:text-white text-slate-800 transition-all text-xs group shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9.5 h-9.5 rounded-lg bg-[#0F2C59] group-hover:bg-amber-500 text-amber-400 group-hover:text-[#0F2C59] flex items-center justify-center font-bold shrink-0 transition-colors shadow-xs">
                        <Shield size={18} />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-sm">Management / Supervisor</div>
                        <div className="text-[11px] text-slate-500 group-hover:text-slate-200 mt-0.5">
                          Executive oversight & strategic analytics
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-right">
                      {loggingInRole === 'MANAGEMENT_SUPERVISOR' ? (
                        <span className="text-[10px] font-mono bg-amber-500 text-[#0F2C59] px-2.5 py-1 rounded font-bold animate-pulse">
                          Connecting...
                        </span>
                      ) : (
                        <span className="w-7 h-7 rounded-full bg-slate-200/60 group-hover:bg-amber-500 text-[#0F2C59] group-hover:text-[#0F2C59] flex items-center justify-center transition-colors">
                          <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              /* TAB 2: CREDENTIALS FORM */
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 mb-1 font-bold">
                    Select Entity Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#0F2C59]"
                  >
                    {(Object.keys(ROLE_DISPLAY_NAMES) as UserRole[]).map((r) => (
                      <option key={r} value={r}>
                        {ROLE_DISPLAY_NAMES[r]} ({r})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 mb-1 font-bold">
                    Username / Employee ID
                  </label>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="e.g. DE-10492"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0F2C59]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 mb-1 font-bold">
                    Password / Security Token
                  </label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0F2C59]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#0F2C59] hover:bg-[#16385C] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 font-mono uppercase tracking-wider"
                >
                  <KeyRound size={16} />
                  <span>{isSubmitting ? 'Authenticating...' : 'Authenticate & Launch Dashboard'}</span>
                </button>
              </form>
            )}


          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
