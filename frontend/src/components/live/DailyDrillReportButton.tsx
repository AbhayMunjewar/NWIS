import React, { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { useCurrentWell } from '../../lib/wellContext';
import { submitDailyDrillReportApi } from '../../lib/api';
import {
  FileText, CheckCircle2, Loader2, ClipboardList,
  ArrowRight
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface DailyDrillReportButtonProps {
  wellId: string;
}

export const DailyDrillReportButton: React.FC<DailyDrillReportButtonProps> = ({ wellId }) => {
  const { token } = useAuth();
  const { currentWell } = useCurrentWell();

  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [reportMeta, setReportMeta] = useState<any>(null);

  const activeWellId = wellId || currentWell?.wellId || 'DUL_92';
  const wellName = currentWell?.wellName || activeWellId;

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await submitDailyDrillReportApi(activeWellId, token || undefined);
      setReportMeta(result?.metadata || null);
      setGenerated(true);
      
      // Update session storage so the Reports Workspace can pick this up as a NEW report
      if (result?.metadata?.report_id) {
        sessionStorage.setItem('nwis_latest_new_report_id', result.metadata.report_id);
      }
    } catch (err) {
      console.error('Failed to generate daily drill report:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-100 border border-blue-300 text-blue-900">
            <ClipboardList size={18} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Daily Drill Report</h3>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Generate & store a shift report for {wellName}
            </p>
          </div>
        </div>
        <Badge variant="use" size="sm">OPERATOR ACTION</Badge>
      </div>

      {/* Status / Action */}
      {generated && reportMeta ? (
        <div className="space-y-3">
          {/* Success confirmation */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            <div className="text-xs space-y-1">
              <div className="font-extrabold text-emerald-900">
                Daily Drill Report Generated & Stored Successfully
              </div>
              <div className="text-emerald-800 font-medium">
                Report <strong className="font-extrabold">{reportMeta.report_id}</strong> has been saved to the Reports Workspace and is visible to Operator and Management roles.
              </div>
            </div>
          </div>

          {/* Report card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Report ID</span>
                <div className="font-extrabold text-slate-900">{reportMeta.report_id}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Type</span>
                <div className="font-extrabold text-slate-900">{reportMeta.title || 'Daily Drilling Report'}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Well</span>
                <div className="font-extrabold text-slate-900">{reportMeta.well_id}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Generated At</span>
                <div className="font-extrabold text-slate-900">{new Date(reportMeta.generated_at).toLocaleString()}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1.5 border-t border-slate-200 mt-1.5">
              <FileText size={12} className="text-blue-600" />
              <span className="text-slate-700 font-medium">
                Stored in <strong className="text-blue-800">Reports Workspace</strong>
              </span>
              <ArrowRight size={10} className="text-slate-400" />
              <span className="text-slate-700 font-medium">
                Accessible by <strong className="text-blue-800">Operator</strong> & <strong className="text-blue-800">Management</strong>
              </span>
            </div>
          </div>

          {/* Generate another */}
          <button
            onClick={() => { setGenerated(false); setReportMeta(null); }}
            className="text-xs text-blue-700 hover:text-blue-900 font-bold underline transition-colors"
          >
            Generate Another Report
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 font-medium leading-relaxed">
            Click below to generate the official <strong>Daily Drilling Report (DDR)</strong> for the current shift.
            The report will be automatically stored in the <strong>Reports Workspace</strong> and visible to both Operator and Management roles.
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full py-3 bg-[#0F2C59] hover:bg-[#16385C] text-white font-bold text-sm rounded-lg shadow-md transition-all flex items-center justify-center gap-2.5 disabled:opacity-60"
          >
            {generating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generating Daily Drill Report...
              </>
            ) : (
              <>
                <ClipboardList size={16} />
                Generate & Submit Daily Drill Report
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
