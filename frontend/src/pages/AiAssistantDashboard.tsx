import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../lib/auth';
import { useCurrentWell } from '../lib/wellContext';
import { getDashboardPermission } from '../lib/rbac';
import { Badge } from '../components/common/Badge';
import { Bot, Send, RotateCcw, ShieldAlert, Compass } from 'lucide-react';

import type { ChatMessage, AssistantQueryResponse } from '../types/assistant';
import { sendAssistantQueryApi } from '../lib/api';

import { AssistantChatMessage } from '../components/assistant/AssistantChatMessage';

export const AiAssistantDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const { currentWell } = useCurrentWell();

  const permLevel = getDashboardPermission(user?.roleCode, 'assistant');
  const userRole = user?.roleCode || 'DRILLING_ENGINEER';

  const globalWellId = currentWell ? currentWell.wellId : 'DUL_92';
  const globalWellName = currentWell ? currentWell.wellName : 'Duliajan-92';

  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [activeRiskContext, setActiveRiskContext] = useState<string>('Stuck Pipe Risk');

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'msg-welcome',
          sender: 'assistant',
          timestamp: new Date().toISOString(),
          text: `**Welcome to the NWIS AI Engineering Assistant.**\n\nI am your evidence-based decision-support copilot for drilling operations on **${globalWellName}** (${globalWellId}). Ask questions regarding current telemetry parameters, nearby offset wells, historical NPT incidents, or technical WCR PDF documents.\n\n*Server-side authorization and traceable evidence retrieval are enforced.*`,
          responsePayload: {
            query: 'System Welcome',
            role: userRole,
            well_id: globalWellId,
            answer_type: 'FACTUAL',
            answer: 'Welcome to NWIS AI Assistant.',
            evidence_sufficiency: 'SUFFICIENT',
            evidence: {
              current_observation: [`Active Well: ${globalWellName} (${globalWellId})`, 'Depth: 2,210.0m in Barail Group Sandstone'],
              historical_evidence: [],
              document_evidence: [],
              analytics_output: 'Decision-Support Mode Active',
              engineering_interpretation: 'Human decision required. No autonomous rig controls.',
              limitations: []
            },
            sources: [],
            data_freshness: 'HISTORICAL LOG DATASET',
            source_classification: 'OIL_AUTHORIZED',
            timestamp: new Date().toISOString(),
            suggested_followups: []
          }
        }
      ]);
    }
  }, [globalWellName, globalWellId, userRole]);

  // Scroll to bottom when messages update
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Handle Query Submission
  const handleSendQuery = async (queryText: string) => {
    if (!queryText.trim() || loading) return;

    const userMsgId = `msg-user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      timestamp: new Date().toISOString(),
      text: queryText
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const responsePayload: AssistantQueryResponse = await sendAssistantQueryApi(
        queryText,
        userRole,
        {
          well_id: globalWellId,
          risk_type: activeRiskContext
        },
        token || undefined
      );

      const assistantMsg: ChatMessage = {
        id: `msg-ast-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        text: responsePayload.answer,
        responsePayload
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Failed to execute assistant query:', err);
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        text: 'Unable to retrieve evidence. Please check backend network connection.',
        error: 'Network Error'
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Check for auto-handoff question from Alert Drawer
  useEffect(() => {
    const pending = sessionStorage.getItem('pending_ai_question');
    if (pending) {
      sessionStorage.removeItem('pending_ai_question');
      setInputQuery(pending);
      // Small timeout to allow state initialization before sending
      setTimeout(() => {
        handleSendQuery(pending);
      }, 100);
    }
  }, []);

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleResetContext = () => {
    setActiveRiskContext('Stuck Pipe Risk');
  };

  return (
    <div className="flex flex-col gap-3 min-h-full">
      {/* Top Consolidated Assistant Header & Context Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex-shrink-0 space-y-3">
        {/* Title & Safeguard Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-100 border border-purple-300 text-purple-900 shadow-2xs">
              <Bot size={22} className="text-purple-900" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  AI Engineering Assistant
                </h1>
                <Badge variant={permLevel === 'FULL' ? 'full' : permLevel === 'USE' ? 'use' : 'view'}>
                  {permLevel} ACCESS ({userRole})
                </Badge>
              </div>
              <p className="text-sm text-slate-900 font-semibold mt-1 leading-snug">
                Evidence-based decision-support using real-time telemetry, offset wells & WCR documents
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-950 flex items-center gap-1.5 font-bold text-[11px]">
              <ShieldAlert size={13} className="text-blue-700" />
              <span>Decision-Support Only (Human-in-the-Loop)</span>
            </div>

            <div className="px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-extrabold text-[11px] flex items-center gap-1.5">
              <Compass size={13} className="text-cyan-700" />
              <span>Current Well: <strong className="text-[#0F2C59] font-black">{globalWellName}</strong></span>
            </div>
          </div>
        </div>

        {/* Active Context Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-slate-800 font-semibold">
            <span className="text-slate-600 text-[11px] font-extrabold uppercase tracking-wider">Active Context:</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-900 font-extrabold">
              {globalWellName} <span className="text-slate-600 text-[10px]">({globalWellId})</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-50 border border-cyan-200 text-cyan-950 font-bold">
              Data Source: <strong>Live Dataset</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-950 font-bold">
              Active Risk: <strong>{activeRiskContext}</strong>
            </span>
          </div>

          <button
            onClick={handleResetContext}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition-colors shadow-2xs"
          >
            <RotateCcw className="w-3 h-3 text-slate-700" />
            Reset Context
          </button>
        </div>
      </div>

      {/* Primary Large Chat Messages Stream Container */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 min-h-[460px] max-h-[620px] overflow-y-auto space-y-4 shadow-xs">
        {messages.map((msg) => (
          <AssistantChatMessage key={msg.id} message={msg} />
        ))}

        {loading && (
          <div className="flex items-center gap-3 text-xs text-purple-950 font-bold bg-purple-50 border border-purple-200 p-3.5 rounded-xl w-fit animate-pulse shadow-2xs">
            <Bot className="w-4 h-4 text-purple-700 animate-spin" />
            <span>Retrieving RAG document chunks, telemetry parameters, and offset incident history...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Prompt Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex-shrink-0">
        <div className="flex items-center gap-2">
          <textarea
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendQuery(inputQuery);
              }
            }}
            placeholder={`Ask AI Assistant about ${globalWellName}, offset incidents, WCR reports or formation hazards... (Press Enter to send)`}
            rows={2}
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-semibold placeholder-slate-500 focus:outline-none focus:border-[#0F2C59] focus:bg-white transition-colors resize-none"
          />

          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleSendQuery(inputQuery)}
              disabled={loading || !inputQuery.trim()}
              className="px-5 py-2.5 bg-[#0F2C59] hover:bg-[#1E3A8A] disabled:opacity-50 text-white font-extrabold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md"
            >
              <Send className="w-4 h-4" />
              Send
            </button>

            <button
              onClick={handleClearChat}
              title="Clear Conversation"
              className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 hover:text-slate-900 rounded-lg text-xs transition-colors flex items-center justify-center shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

