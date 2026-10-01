import React, { useState } from 'react';
import type { ChatMessage } from '../../types/assistant';
import { Bot, User, FileText, Layers, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

// Formatted inline text renderer (handles **bold**, *italic*, <br>, line breaks)
const renderInlineText = (text: string): React.ReactNode[] => {
  const parts = text.split(/(<br\s*\/?>|\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
  return parts.map((part, idx) => {
    if (!part) return null;
    if (/^<br\s*\/?>$/i.test(part)) {
      return <br key={idx} />;
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return <strong key={idx} className="font-extrabold text-slate-950">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2 && !part.startsWith('**')) {
      return <em key={idx} className="italic text-slate-800">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return <code key={idx} className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-900 font-mono text-[11px] font-bold">{part.slice(1, -1)}</code>;
    }
    return part;
  });
};

// Markdown block parser for Assistant responses
const FormattedMarkdown: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let tableRows: string[][] = [];
  let inTable = false;
  let listItems: string[] = [];
  let inList = false;

  const flushTable = (key: string) => {
    if (tableRows.length === 0) return;
    const headerRow = tableRows[0];
    const bodyRows = tableRows.slice(1).filter(row => !row.every(cell => /^[-:\s]+$/.test(cell)));

    elements.push(
      <div key={key} className="my-3 overflow-x-auto rounded-xl border border-slate-200 shadow-2xs bg-white">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-950 font-extrabold">
              {headerRow.map((cell, idx) => (
                <th key={idx} className="px-3.5 py-2.5 border-r border-slate-200 last:border-r-0 whitespace-nowrap">
                  {renderInlineText(cell.trim())}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150">
            {bodyRows.map((row, rIdx) => (
              <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50 hover:bg-slate-100/60'}>
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-3.5 py-2 border-r border-slate-200 last:border-r-0 text-slate-900 font-medium">
                    {renderInlineText(cell.trim())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
    inTable = false;
  };

  const flushList = (key: string) => {
    if (listItems.length === 0) return;
    elements.push(
      <ul key={key} className="my-2 space-y-1.5 pl-2">
        {listItems.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2 text-slate-900 font-medium leading-relaxed">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
            <span>{renderInlineText(item)}</span>
          </li>
        ))}
      </ul>
    );
    listItems = [];
    inList = false;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Table detection
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (inList) flushList(`list-${index}`);
      inTable = true;
      const cells = trimmed.split('|').slice(1, -1);
      tableRows.push(cells);
      return;
    } else if (inTable) {
      flushTable(`table-${index}`);
    }

    // List detection
    if (/^[-*•]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
      inList = true;
      const content = trimmed.replace(/^([-*•]|\d+\.)\s+/, '');
      listItems.push(content);
      return;
    } else if (inList) {
      flushList(`list-${index}`);
    }

    // Empty line
    if (!trimmed) {
      return;
    }

    // Horizontal Rule
    if (/^---+$|^==+=$/.test(trimmed)) {
      elements.push(<hr key={`hr-${index}`} className="my-3 border-slate-200" />);
      return;
    }

    // Headers
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${index}`} className="text-xs font-black text-slate-950 uppercase tracking-wide mt-3 mb-1 flex items-center gap-1.5">
          {renderInlineText(trimmed.slice(4))}
        </h3>
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${index}`} className="text-sm font-extrabold text-[#0F2C59] tracking-tight mt-4 mb-2 pb-1 border-b border-slate-200 flex items-center gap-2">
          {renderInlineText(trimmed.slice(3))}
        </h2>
      );
      return;
    }
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${index}`} className="text-base font-black text-slate-950 tracking-tight mt-4 mb-2">
          {renderInlineText(trimmed.slice(2))}
        </h1>
      );
      return;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote key={`bq-${index}`} className="my-2.5 p-3 bg-blue-50/90 border-l-4 border-blue-600 rounded-r-xl text-blue-950 text-xs font-semibold shadow-2xs leading-relaxed">
          {renderInlineText(trimmed.slice(2))}
        </blockquote>
      );
      return;
    }

    // Regular paragraph
    elements.push(
      <p key={`p-${index}`} className="text-slate-900 font-medium leading-relaxed my-1">
        {renderInlineText(line)}
      </p>
    );
  });

  if (inTable) flushTable(`table-end`);
  if (inList) flushList(`list-end`);

  return <div className="space-y-1">{elements}</div>;
};

interface Props {
  message: ChatMessage;
}

export const AssistantChatMessage: React.FC<Props> = ({ message }) => {
  const [showEvidence, setShowEvidence] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const isUser = message.sender === 'user';
  const payload = message.responsePayload;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getAnswerTypeBadge = (type?: string) => {
    switch (type) {
      case 'FACTUAL':
        return 'bg-blue-100 text-blue-950 border-blue-300';
      case 'HISTORICAL':
        return 'bg-purple-100 text-purple-950 border-purple-300';
      case 'CURRENT_STATE':
        return 'bg-emerald-100 text-emerald-950 border-emerald-300';
      case 'COMPARATIVE':
        return 'bg-amber-100 text-amber-950 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-900 border-slate-300';
    }
  };

  return (
    <div className={`flex gap-3 text-xs ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      {!isUser && (
        <div className="p-2 rounded-xl bg-purple-50 text-purple-950 border border-purple-200 h-fit flex-shrink-0 shadow-2xs">
          <Bot className="w-5 h-5" />
        </div>
      )}

      <div className={`max-w-4xl rounded-2xl p-4 space-y-3 ${
        isUser
          ? 'bg-[#0F2C59] text-white rounded-tr-none shadow-md font-semibold'
          : 'bg-white border border-slate-200 text-slate-900 shadow-xs rounded-tl-none'
      }`}>
        {/* User Message Header / Assistant Header */}
        <div className={`flex items-center justify-between text-[10px] border-b pb-2 ${
          isUser ? 'text-slate-200 border-blue-900' : 'text-slate-600 border-slate-200'
        }`}>
          <span className="font-extrabold flex items-center gap-1.5">
            {isUser ? 'User' : 'AI Engineering Assistant'}
            <span className="opacity-75">• {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </span>

          {!isUser && payload && (
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded border ${getAnswerTypeBadge(payload.answer_type)}`}>
                {payload.answer_type}
              </span>
              {payload.evidence_sufficiency !== 'N/A' && (
                <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-emerald-100 text-emerald-950 border border-emerald-300">
                  {payload.evidence_sufficiency} EVIDENCE
                </span>
              )}
            </div>
          )}
        </div>

        {/* Formatted Text Content */}
        <div className={`leading-relaxed text-xs space-y-2.5 ${isUser ? 'text-white font-semibold' : 'text-slate-900'}`}>
          {isUser ? (
            <div className="whitespace-pre-wrap">{message.text}</div>
          ) : (
            <FormattedMarkdown text={message.text} />
          )}
        </div>

        {/* Evidence Breakdown Accordion for Assistant Messages */}
        {!isUser && payload && payload.evidence && (
          (payload.evidence.current_observation?.length > 0) ||
          (payload.evidence.historical_evidence?.length > 0) ||
          (payload.evidence.document_evidence?.length > 0) ||
          (payload.evidence.engineering_interpretation)
        ) && (
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
            <button
              onClick={() => setShowEvidence(!showEvidence)}
              className="w-full px-3 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-[11px] font-extrabold text-slate-900 hover:bg-slate-200 transition-colors"
            >
              <span className="flex items-center gap-1.5 text-[#0F2C59]">
                <Layers className="w-3.5 h-3.5 text-purple-700" />
                Evidence & Traceability Breakdown
              </span>
              {showEvidence ? <ChevronUp className="w-3.5 h-3.5 text-slate-700" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-700" />}
            </button>

            {showEvidence && (
              <div className="p-3 space-y-3 text-[11px] divide-y divide-slate-200">
                {/* Current Observations */}
                {payload.evidence.current_observation && payload.evidence.current_observation.length > 0 && (
                  <div className="pt-2">
                    <span className="font-extrabold text-[#0F2C59] uppercase tracking-wider block mb-1">Current Telemetry Observations:</span>
                    <ul className="list-disc list-inside text-slate-800 font-semibold space-y-0.5">
                      {payload.evidence.current_observation.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Historical Incident Matches */}
                {payload.evidence.historical_evidence && payload.evidence.historical_evidence.length > 0 && (
                  <div className="pt-2">
                    <span className="font-extrabold text-purple-950 uppercase tracking-wider block mb-1">Historical Incident Evidence:</span>
                    {payload.evidence.historical_evidence.map((h, i) => (
                      <div key={i} className="bg-white border border-slate-200 p-2.5 rounded-lg mt-1 space-y-0.5 text-slate-800 shadow-2xs font-semibold">
                        <div className="flex justify-between font-extrabold text-slate-900">
                          <span>{h.well_name} — {h.hazard_type}</span>
                          <span className="text-slate-600 font-bold">{h.depth_m}m</span>
                        </div>
                        <p className="text-slate-700">Cause: {h.root_cause}</p>
                        <p className="text-emerald-800 font-bold">Mitigation: {h.mitigation_applied}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Document RAG Chunks */}
                {payload.evidence.document_evidence && payload.evidence.document_evidence.length > 0 && (
                  <div className="pt-2">
                    <span className="font-extrabold text-amber-900 uppercase tracking-wider block mb-1">Retrieved WCR / Technical Document Chunks:</span>
                    {payload.evidence.document_evidence.map((d, i) => (
                      <div key={i} className="bg-white border border-slate-200 p-2.5 rounded-lg mt-1 space-y-1 shadow-2xs">
                        <div className="flex items-center justify-between font-extrabold text-slate-900">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3 text-amber-700" />
                            {d.document_name} ({d.section})
                          </span>
                          <span className="text-slate-600 font-bold">Page {d.page}</span>
                        </div>
                        <p className="text-slate-800 font-medium italic">{d.text_chunk}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Human Engineering Interpretation */}
                {payload.evidence.engineering_interpretation && (
                  <div className="pt-2">
                    <span className="font-extrabold text-emerald-800 uppercase tracking-wider block mb-1">Human Engineering Decision Support:</span>
                    <p className="text-slate-900 font-bold">{payload.evidence.engineering_interpretation}</p>
                  </div>
                )}

                {/* Limitations */}
                {payload.evidence.limitations && payload.evidence.limitations.length > 0 && (
                  <div className="pt-2">
                    <span className="font-extrabold text-slate-700 uppercase tracking-wider block mb-1">Known Limitations & Data Availability:</span>
                    <ul className="list-disc list-inside text-slate-700 font-semibold space-y-0.5">
                      {payload.evidence.limitations.map((lim, i) => (
                        <li key={i}>{lim}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Source Citations Pill Footer */}
        {!isUser && payload && payload.sources && payload.sources.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 text-[10px]">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-600 font-extrabold">Citations:</span>
              {payload.sources.map((s, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-800 font-bold flex items-center gap-1">
                  <FileText className="w-3 h-3 text-[#0F2C59]" />
                  {s.document} ({s.section})
                </span>
              ))}
            </div>

            <button
              onClick={handleCopy}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-md font-bold flex items-center gap-1 transition-colors shadow-2xs"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3 text-slate-700" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}
      </div>

      {isUser && (
        <div className="p-2 rounded-xl bg-blue-50 text-blue-950 border border-blue-200 h-fit flex-shrink-0 shadow-2xs">
          <User className="w-5 h-5" />
        </div>
      )}
    </div>
  );
};

