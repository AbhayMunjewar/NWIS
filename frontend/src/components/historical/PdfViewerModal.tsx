import React from 'react';
import type { HistoricalDocument } from '../../types/historical';
import { X, FileText, ExternalLink, Download, ShieldCheck, CheckCircle2, FileCheck } from 'lucide-react';

interface Props {
  document: HistoricalDocument | null;
  onClose: () => void;
}

export const PdfViewerModal: React.FC<Props> = ({ document: doc, onClose }) => {
  if (!doc) return null;

  const pdfUrl = doc.download_url.startsWith('http')
    ? doc.download_url
    : `http://localhost:8000${doc.download_url}`;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-extrabold text-[#0F2C59]">{doc.document_name}</h2>
                <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-rose-100 text-rose-950 border border-rose-300 uppercase">
                  {doc.file_format}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-blue-100 text-blue-950 border border-blue-300">
                  {doc.document_type}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-emerald-100 text-emerald-950 border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                  {doc.ocr_status}
                </span>
              </div>
              <p className="text-xs text-slate-700 font-semibold mt-0.5 flex items-center gap-3">
                <span>Well: <strong className="text-slate-900 font-black">{doc.associated_well}</strong></span>
                <span>•</span>
                <span>Classification: <strong className="text-slate-900 font-black">{doc.source_classification}</strong></span>
                <span>•</span>
                <span>{doc.report_type_label}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 transition-colors flex items-center gap-1 text-xs font-bold shadow-2xs"
              title="Open PDF in new browser tab"
            >
              <ExternalLink className="w-4 h-4 text-slate-700" />
              <span className="hidden sm:inline">Open New Tab</span>
            </a>
            <a
              href={pdfUrl}
              download={doc.document_name}
              className="p-2 rounded-lg bg-[#0F2C59] hover:bg-[#1E3A8A] text-white transition-colors flex items-center gap-1 text-xs font-bold shadow-2xs"
              title="Download PDF document"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 hover:text-slate-900 transition-colors"
              title="Close PDF Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Provenance & Security Banner */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 text-[11px] font-semibold text-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Traceable Original Document: Preserved without alteration from project data repository.</span>
          </div>
          <span className="text-[10px] text-slate-600 font-extrabold">
            {doc.doc_id}
          </span>
        </div>

        {/* PDF Embedded View */}
        <div className="flex-1 bg-slate-200 relative flex flex-col">
          <object
            data={pdfUrl}
            type="application/pdf"
            className="w-full h-full border-0 flex-1"
          >
            <iframe
              src={pdfUrl}
              title={doc.document_name}
              className="w-full h-full border-0"
            >
              <div className="p-8 text-center text-slate-700 my-auto">
                <FileCheck className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-sm text-slate-900 font-extrabold">PDF preview inline not supported by your browser.</p>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 px-4 py-2 bg-[#0F2C59] hover:bg-[#1E3A8A] text-white font-extrabold rounded-lg text-xs shadow-md"
                >
                  Click here to open {doc.document_name} PDF
                </a>
              </div>
            </iframe>
          </object>
        </div>
      </div>
    </div>
  );
};
