import React, { useState } from 'react';
import { Bot, Send, Sparkles } from 'lucide-react';
import { AI_MESSAGES } from '../../data/mockData';

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

const SAMPLE_QUESTIONS = [
  'What is the recommended mud weight for Kopili Formation?',
  'Compare DUL-92 and DUL-88 drilling performance',
  'Predict hazards at 2,500m depth in Duliajan field',
  'What caused the stuck pipe in DUL-92?',
];

const AICopilotView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(AI_MESSAGES);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Simulated AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        role: 'ai',
        text: `Based on eRTMAC-NWIS knowledge base analysis for your query "${input}":\n\nI've cross-referenced this against 18 offset wells, 5 incident reports, and SPE literature for Upper Assam Shelf operations.\n\n**Key Finding:** The data from nearby wells in Duliajan field suggests maintaining elevated mud weight (≥1.24 g/cc) through this interval. Offset well DUL-92 encountered difficulties at similar depth.\n\n*Sources: wells_master.csv, drilling_events.csv, SPE_Assam_Basin_Drilling_Hazards_Paper.pdf*`
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1200);
  };

  return (
    <div className="fade-in" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div className="view-header" style={{ flexShrink: 0 }}>
        <h1 className="view-header__title">AI Drilling Copilot — RAG Assistant</h1>
        <span className="view-header__badge view-header__badge--live">● Online</span>
      </div>

      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Messages */}
        <div className="copilot-messages" style={{ flex: 1 }}>
          {messages.map((msg, i) => (
            <div key={i} className={`copilot-msg copilot-msg--${msg.role}`}>
              {msg.role === 'ai' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: 10, color: 'var(--accent-purple)', fontWeight: 600 }}>
                  <Sparkles size={12} /> eRTMAC-NWIS AI
                </div>
              )}
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {msg.text.split('\n').map((line, j) => {
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <div key={j} style={{ fontWeight: 700, marginTop: 4 }}>{line.replace(/\*\*/g, '')}</div>;
                  }
                  if (line.startsWith('• ') || line.startsWith('- ')) {
                    return <div key={j} style={{ paddingLeft: 8, fontSize: 12 }}>{line}</div>;
                  }
                  if (line.startsWith('*') && line.endsWith('*')) {
                    return <div key={j} style={{ fontStyle: 'italic', color: 'var(--text-tertiary)', fontSize: 10, marginTop: 6 }}>{line.replace(/\*/g, '')}</div>;
                  }
                  return <div key={j}>{line}</div>;
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Questions */}
        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border-primary)', display: 'flex', gap: 6, overflowX: 'auto' }}>
          {SAMPLE_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => { setInput(q); }}
              style={{
                padding: '4px 10px', borderRadius: 12, border: '1px solid var(--border-primary)',
                background: 'transparent', color: 'var(--text-tertiary)', fontSize: 10,
                cursor: 'pointer', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap',
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-blue)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="copilot-input">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask about drilling hazards, formations, offset wells, or get recommendations..."
            id="copilot-input"
          />
          <button onClick={handleSend} id="copilot-send">
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AICopilotView;
