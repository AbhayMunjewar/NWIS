import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  KeyRound, 
  UserCheck, 
  Compass, 
  Lock,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import type { UserRole } from '../types';
import { ROLE_DISPLAY_NAMES } from '../lib/rbac';
import { Badge } from '../components/common/Badge';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [selectedRole, setSelectedRole] = useState<UserRole>('DRILLING_ENGINEER');
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loginMode, setLoginMode] = useState<'demo' | 'enterprise'>('demo');

  // Parse initial role query parameter if provided
  useEffect(() => {
    const roleParam = searchParams.get('role') as UserRole | null;
    if (roleParam && (Object.keys(ROLE_DISPLAY_NAMES) as UserRole[]).includes(roleParam)) {
      setSelectedRole(roleParam);
    }
  }, [searchParams]);

  // If already authenticated, redirect to default landing page
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.defaultLandingPage || '/dashboard');
    }
  }, [isAuthenticated, user, navigate]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const defaultLanding = await login(selectedRole, usernameInput || undefined);
      navigate(defaultLanding);
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoRoleSelect = async (role: UserRole) => {
    setSelectedRole(role);
    setIsSubmitting(true);
    try {
      const defaultLanding = await login(role);
      navigate(defaultLanding);
    } catch (err) {
      console.error('Demo login failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#F8FAFC] flex flex-col justify-between p-4 sm:p-6 select-none font-sans text-slate-800 antialiased">
      {/* Official Government Tricolor Top Bar */}
      <div className="fixed top-0 left-0 right-0 gov-tricolor-bar z-50"></div>

      {/* Top Branding Header with Official Logo */}
      <header className="max-w-6xl mx-auto w-full bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
        <img 
          src="/logo.png" 
          alt="Government of India - eRTMAC-NWIS Logo" 
          className="h-12 sm:h-14 md:h-16 object-contain" 
        />
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-[11px] font-mono font-bold rounded bg-[#0F2C59] text-white border border-[#1B3A60]">
            GOVERNMENT OF INDIA PORTAL
          </span>
          <Badge variant="demo">AUTHORIZED ACCESS</Badge>
        </div>
      </header>

      {/* Main Login Workspace */}
      <main className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center my-auto py-6">
        {/* Left Column: Institutional Product System Information */}
        <div className="md:col-span-6 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#0F2C59]/10 border border-[#0F2C59]/20 text-[#0F2C59] text-xs font-mono mb-3 font-bold">
              <Compass size={14} />
              <span>Oil India Limited</span>
            </div>

            <h1 className="text-3xl font-extrabold text-[#0F2C59] tracking-tight leading-tight">
              Nearby Wells Intelligence System (eRTMAC-NWIS)
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed mt-3 font-medium">
              National real-time offset well intelligence, early hazard warnings, geomechanical alignment, and AI decision-support platform for safe drilling operations.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-3 bg-white border border-slate-200 rounded-lg p-3.5 text-xs shadow-xs">
              <ShieldCheck size={20} className="text-[#0F2C59] shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-[#0F2C59]">Authoritative Role-Based Access</div>
                <div className="text-slate-600 mt-0.5">Role permissions enforced independently at API & database layer for Drilling Engineers, Geologists, Operators & Management.</div>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white border border-slate-200 rounded-lg p-3.5 text-xs shadow-xs">
              <Lock size={20} className="text-[#0F2C59] shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-[#0F2C59]">Shared Current Well Context</div>
                <div className="text-slate-600 mt-0.5">Unified application-level well context architecture across all primary operational modules.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Card */}
        <div className="md:col-span-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg font-bold text-[#0F2C59]">Official Portal Sign In</h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Select role identity or credentials</p>
              </div>

              {/* Mode Toggle */}
              <div className="bg-slate-100 p-1 rounded-md border border-slate-200 flex text-[11px] font-mono">
                <button
                  onClick={() => setLoginMode('demo')}
                  className={`px-2.5 py-1 rounded transition-colors ${loginMode === 'demo' ? 'bg-[#0F2C59] text-white font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Quick Role Select
                </button>
                <button
                  onClick={() => setLoginMode('enterprise')}
                  className={`px-2.5 py-1 rounded transition-colors ${loginMode === 'enterprise' ? 'bg-[#0F2C59] text-white font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Credentials Login
                </button>
              </div>
            </div>

            {/* DEMO ROLE SELECTOR MODE */}
            {loginMode === 'demo' ? (
              <div className="space-y-4">
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0F2C59] font-mono uppercase tracking-wider text-[10px]">
                      OFFICIAL ROLE DEMONSTRATION MODE
                    </span>
                    <Badge variant="demo" size="sm">AUTHORITATIVE</Badge>
                  </div>
                  <p className="text-slate-700 text-[11px] leading-relaxed font-medium">
                    Select an operational role to enter the portal with role-aware permissions and dashboard access.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {(Object.keys(ROLE_DISPLAY_NAMES) as UserRole[]).map((roleCode) => {
                    const isSelected = selectedRole === roleCode;
                    return (
                      <button
                        key={roleCode}
                        onClick={() => handleQuickDemoRoleSelect(roleCode)}
                        disabled={isSubmitting}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all text-xs ${
                          isSelected
                            ? 'bg-[#0F2C59] border-[#0F2C59] text-white shadow-md'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded flex items-center justify-center font-bold text-xs font-mono ${
                            isSelected ? 'bg-amber-500 text-[#0F2C59]' : 'bg-slate-200 text-slate-700'
                          }`}>
                            <UserCheck size={14} />
                          </div>
                          <div>
                            <div className="font-bold">{ROLE_DISPLAY_NAMES[roleCode]}</div>
                            <div className={`text-[10px] font-mono mt-0.5 ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                              Role ID: {roleCode}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono hidden sm:inline ${isSelected ? 'text-amber-300 font-bold' : 'text-slate-500'}`}>
                            Enter Portal
                          </span>
                          <ArrowRight size={14} className={isSelected ? 'text-amber-400' : 'text-[#0F2C59]'} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* ENTERPRISE LOGIN FORM */
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 mb-1.5 font-bold">
                    User Role Assignment
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#0F2C59]"
                  >
                    {(Object.keys(ROLE_DISPLAY_NAMES) as UserRole[]).map((r) => (
                      <option key={r} value={r}>
                        {ROLE_DISPLAY_NAMES[r]} ({r})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 mb-1.5 font-bold">
                    Username / Employee ID
                  </label>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="e.g. DE-10492"
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0F2C59]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 mb-1.5 font-bold">
                    Password / Identity Token
                  </label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0F2C59]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-[#0F2C59] hover:bg-[#1B365D] text-white font-bold text-xs rounded-md shadow-md transition-colors flex items-center justify-center gap-2 font-mono uppercase tracking-wider"
                >
                  <KeyRound size={14} />
                  <span>{isSubmitting ? 'Authenticating...' : 'Authenticate & Enter Portal'}</span>
                </button>
              </form>
            )}

            {/* Security Notice */}
            <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 font-mono flex items-center justify-between font-medium">
              <span>Security Level: Authoritative Backend</span>
              <span>Govt. of India Portal Standard</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full py-3 border-t border-slate-200 text-center text-xs text-slate-600 font-medium">
        © Government of India • Oil India Limited — eRTMAC-NWIS Nearby Wells Intelligence System
      </footer>
    </div>
  );
};
