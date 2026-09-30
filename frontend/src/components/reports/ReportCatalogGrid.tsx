import React from 'react';
import type { ReportTypeInfo } from '../../types/reports';
import { FileText, Activity, ShieldAlert, History, Layers, Clock, Database, Lock, Briefcase, Check, Eye, Sparkles } from 'lucide-react';

interface Props {
  catalog: ReportTypeInfo[];
  selectedTypeId: string;
  latestReportTypeId?: string;
  onSelectType: (typeId: string) => void;
  onOpenReport?: (typeId: string) => void;
}

export const ReportCatalogGrid: React.FC<Props> = ({ catalog, selectedTypeId, latestReportTypeId, onSelectType, onOpenReport }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText': return <FileText className="w-5 h-5 text-[#0F2C59]" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5 text-purple-700" />;
      case 'Activity': return <Activity className="w-5 h-5 text-emerald-700" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5 text-rose-700" />;
      case 'History': return <History className="w-5 h-5 text-amber-700" />;
      case 'Layers': return <Layers className="w-5 h-5 text-cyan-700" />;
      case 'Clock': return <Clock className="w-5 h-5 text-amber-600" />;
      case 'Database': return <Database className="w-5 h-5 text-indigo-700" />;
      case 'Lock': return <Lock className="w-5 h-5 text-rose-700" />;
      default: return <FileText className="w-5 h-5 text-[#0F2C59]" />;
    }
  };

  const handleCardClick = (typeId: string) => {
    onSelectType(typeId);
    if (onOpenReport) {
      onOpenReport(typeId);
    }
  };

  return (
    <div className="space-y-2.5">
      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
        Authorized Report Catalog ({catalog.length} Report Types Available — Click any report to view)
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {catalog.map((item) => {
          const isSelected = item.id === selectedTypeId;
          const isLatest = latestReportTypeId ? item.id === latestReportTypeId : item.id === 'DAILY_DRILLING';
          return (
            <div
              key={item.id}
              onClick={() => handleCardClick(item.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3.5 group relative ${isSelected
                ? 'bg-blue-50/60 border-2 border-[#0F2C59] ring-2 ring-[#0F2C59]/20 shadow-md'
                : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md'
                }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 shadow-2xs group-hover:bg-blue-100 transition-colors shrink-0">
                      {getIcon(item.icon)}
                    </div>
                    <span className="text-xs font-extrabold text-[#0F2C59] group-hover:text-blue-900 transition-colors truncate">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isLatest && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black font-mono tracking-wider flex items-center gap-1 shadow-2xs animate-pulse">
                        <Sparkles className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />
                        LATEST
                      </span>
                    )}
                    {isSelected && !isLatest && (
                      <span className="p-1 rounded-full bg-[#0F2C59] text-white">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-slate-200 text-[11px] font-mono text-slate-700">
                <span className="px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-300 text-slate-800 font-bold">
                  {item.category}
                </span>
                <div className="flex items-center gap-1.5 font-bold">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick(item.id);
                    }}
                    className="px-2.5 py-1 bg-[#0F2C59] hover:bg-[#183960] text-white rounded text-[10px] font-extrabold transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <Eye className="w-3 h-3 text-amber-400" />
                    <span>Open Report</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
