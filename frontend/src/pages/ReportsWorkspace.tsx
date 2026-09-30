import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { useCurrentWell } from '../lib/wellContext';
import { getDashboardPermission } from '../lib/rbac';
import { Badge } from '../components/common/Badge';
import { FileText, Compass, ShieldAlert } from 'lucide-react';

import type { ReportHistoryItem, ReportPreviewPayload } from '../types/reports';
import {
  fetchReportHistoryApi,
  fetchReportPreviewApi,
  downloadReportFileApi,
  regenerateReportApi,
  submitPreDrillReportApi
} from '../lib/api';

import { ReportHistoryTable } from '../components/reports/ReportHistoryTable';
import { ReportPreviewModal } from '../components/reports/ReportPreviewModal';
import { PreDrillReportPreviewModal } from '../components/predrill/PreDrillReportPreviewModal';

const SESSION_NEW_REPORT_KEY = 'nwis_latest_new_report_id';

export const ReportsWorkspace: React.FC = () => {
  const { user, token } = useAuth();
  const { currentWell } = useCurrentWell();

  const permLevel = getDashboardPermission(user?.roleCode, 'reports');
  const userRole = user?.roleCode || 'DRILLING_ENGINEER';

  const globalWellId = currentWell ? currentWell.wellId : 'DUL_92';
  const globalWellName = currentWell ? currentWell.wellName : 'Duliajan-92';

  // State
  const [history, setHistory] = useState<ReportHistoryItem[]>([]);

  // Session-based latest new report tracking
  const [latestNewReportId, setLatestNewReportId] = useState<string | null>(() => {
    return sessionStorage.getItem(SESSION_NEW_REPORT_KEY);
  });

  // Preview Modal states
  const [activePreview, setActivePreview] = useState<ReportPreviewPayload | null>(null);
  const [showPreDrillModal, setShowPreDrillModal] = useState<boolean>(false);

  // Helper: mark a report as the latest session-new report
  const markAsLatestNew = (reportId: string) => {
    sessionStorage.setItem(SESSION_NEW_REPORT_KEY, reportId);
    setLatestNewReportId(reportId);
  };

  // Load history
  useEffect(() => {
    fetchReportHistoryApi(token || undefined).then(setHistory);
  }, [userRole, token]);

  // Listen for cross-tab/cross-role session storage updates (e.g. geologist generates, engineer sees NEW)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SESSION_NEW_REPORT_KEY) {
        setLatestNewReportId(e.newValue);
        // Refresh history to pick up the new report
        fetchReportHistoryApi(token || undefined).then(setHistory);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [token]);

  // Periodic poll to pick up reports generated from other dashboards (e.g. WorkflowPanels)
  useEffect(() => {
    const interval = setInterval(() => {
      const storedId = sessionStorage.getItem(SESSION_NEW_REPORT_KEY);
      if (storedId && storedId !== latestNewReportId) {
        setLatestNewReportId(storedId);
        fetchReportHistoryApi(token || undefined).then(setHistory);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [latestNewReportId, token]);




  const handlePreDrillProceed = async (finalReportData: any) => {
    await submitPreDrillReportApi(
      globalWellId,
      'Lead Operations Geologist (Demo)',
      finalReportData.title || 'Pre-Drill Subsurface Risk Evaluation & Handoff Report',
      finalReportData.executive_summary || 'Geological pre-drill evaluation report.',
      finalReportData.hazards || [],
      finalReportData.directives || [],
      token || undefined
    );
    const updatedHistory = await fetchReportHistoryApi(token || undefined);
    setHistory(updatedHistory);
    // Mark the newly generated report as "NEW" in this session
    if (updatedHistory.length > 0) {
      markAsLatestNew(updatedHistory[0].report_id);
    }
    setShowPreDrillModal(false);
  };

  const handlePreviewReport = async (reportId: string) => {
    try {
      const payload = await fetchReportPreviewApi(reportId, token || undefined);
      setActivePreview(payload);
    } catch (err) {
      console.error('Failed to load report preview:', err);
    }
  };

  const handleDownloadReport = async (reportId: string, format: 'pdf' | 'csv') => {
    await downloadReportFileApi(reportId, format, token || undefined);
  };

  const handleRegenerateReport = async (reportId: string) => {
    try {
      const payload = await regenerateReportApi(reportId, token || undefined);
      const updatedHistory = await fetchReportHistoryApi(token || undefined);
      setHistory(updatedHistory);
      setActivePreview(payload);
    } catch (err) {
      console.error('Regenerate report failed:', err);
    }
  };

  return (
    <div className="space-y-6 flex flex-col min-h-full">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 flex-shrink-0">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 border border-blue-300 text-blue-900 shadow-2xs">
              <FileText size={22} className="text-blue-900" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Supporting Workspace — Reports & Export Hub
                </h1>
                <Badge variant={permLevel === 'FULL' ? 'full' : permLevel === 'USE' ? 'use' : 'view'}>
                  {permLevel} ACCESS ({userRole})
                </Badge>
              </div>
              <p className="text-sm text-slate-900 font-semibold mt-1 leading-snug">
                Automated daily drilling report generation, hazard summary exports & audit logs
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white border border-slate-300 px-3.5 py-1.5 rounded-lg text-xs font-mono shadow-2xs">
          <Compass size={14} className="text-[#0F2C59]" />
          <span className="text-slate-500">Global Current Well:</span>
          <span className="text-[#0F2C59] font-bold">
            {globalWellName}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 font-bold border border-slate-200">
            {globalWellId}
          </span>
        </div>
      </div>

      {/* Role-Specific Access Indicator */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-950 flex items-center justify-between gap-3 flex-shrink-0 shadow-2xs font-medium">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-blue-700 flex-shrink-0" />
          <span>
            <strong className="text-blue-900 font-bold">Role-Aware Export Policy:</strong> Showing report types authorized for <span className="font-mono text-blue-900 font-bold underline">{userRole}</span>. Server-side data authorization enforced prior to file compilation.
          </span>
        </div>
        <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-blue-100 border border-blue-300 text-blue-900 font-bold shrink-0">
          Traceable Audit Enabled
        </span>
      </div>

      {/* Report Catalog has been removed per user request */}

      {/* Section 2: History & Archives */}
      <ReportHistoryTable
        history={
          userRole === 'GEOLOGIST'
            ? history.filter(item => item.user_role === 'GEOLOGIST' || ['PRE_DRILL_ANALYSIS', 'GEOLOGICAL_SUMMARY', 'GEOLOGICAL_RESEARCH', 'FORMATION_CORRELATION'].includes(item.report_type))
            : history
        }
        latestNewReportId={latestNewReportId}
        onPreview={handlePreviewReport}
        onDownload={handleDownloadReport}
        onRegenerate={handleRegenerateReport}
      />

      {/* Standard Preview Modal */}
      {activePreview && (
        <ReportPreviewModal
          preview={activePreview}
          onClose={() => setActivePreview(null)}
          token={token || undefined}
        />
      )}

      {/* Pre-Drill Report Preview Modal */}
      {showPreDrillModal && (
        <PreDrillReportPreviewModal
          wellId={globalWellId}
          wellName={globalWellName}
          onClose={() => setShowPreDrillModal(false)}
          onProceedSubmit={handlePreDrillProceed}
        />
      )}
    </div>
  );
};
