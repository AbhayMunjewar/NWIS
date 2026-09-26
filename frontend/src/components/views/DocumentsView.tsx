import React, { useState } from 'react';
import { FileText, Search, ExternalLink, Download, BookOpen } from 'lucide-react';

interface Document {
  id: string;
  title: string;
  type: string;
  source: string;
  pages: number;
  date: string;
  relevance: number;
  tags: string[];
}

const DOCUMENTS: Document[] = [
  { id: 'DOC-01', title: 'DUL-92 Stuck Pipe Incident Report', type: 'Incident Report', source: 'OIL Internal', pages: 12, date: '2022-11-20', relevance: 95, tags: ['Stuck Pipe', 'Barail', 'Duliajan'] },
  { id: 'DOC-02', title: 'DUL-88 Gas Kick Well Control Report', type: 'Well Control', source: 'OIL Internal', pages: 18, date: '2022-12-10', relevance: 90, tags: ['Gas Kick', 'Kopili', 'Well Control'] },
  { id: 'DOC-03', title: 'DUL-99 Lost Circulation Treatment Report', type: 'Incident Report', source: 'OIL Internal', pages: 15, date: '2023-01-22', relevance: 88, tags: ['Lost Circ', 'Sylhet', 'LCM'] },
  { id: 'DOC-04', title: 'SPE Assam Basin Drilling Hazards Paper', type: 'SPE Paper', source: 'SPE Library', pages: 28, date: '2021-06-15', relevance: 85, tags: ['Hazards', 'Upper Assam', 'Formation'] },
  { id: 'DOC-05', title: 'DUL-104 Current Drilling Program', type: 'Drilling Program', source: 'OIL Internal', pages: 45, date: '2023-11-10', relevance: 100, tags: ['Active Well', 'Duliajan', 'Program'] },
  { id: 'DOC-06', title: 'Upper Assam Shelf Mud Program Guidelines', type: 'Best Practice', source: 'OIL Engineering', pages: 32, date: '2023-03-15', relevance: 78, tags: ['Mud', 'EMW', 'Guidelines'] },
  { id: 'DOC-07', title: 'Offset Well Analysis: Naharkatiya Field', type: 'Analysis', source: 'OIL Geology', pages: 22, date: '2023-04-20', relevance: 72, tags: ['Naharkatiya', 'Offset', 'Geology'] },
  { id: 'DOC-08', title: 'Well Trajectory Survey Standards — OIL', type: 'Standard', source: 'OIL SOP', pages: 16, date: '2022-08-10', relevance: 65, tags: ['Survey', 'MWD', 'Standards'] },
];

const DocumentsView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  const types = ['All', ...new Set(DOCUMENTS.map(d => d.type))];

  const filtered = DOCUMENTS.filter(d => {
    const matchesSearch = searchQuery === '' ||
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'All' || d.type === selectedType;
    return matchesSearch && matchesType;
  }).sort((a, b) => b.relevance - a.relevance);

  return (
    <div className="fade-in">
      <div className="view-header">
        <h1 className="view-header__title">Document Archive & RAG Knowledge Base</h1>
        <span className="view-header__badge view-header__badge--analysis">AI Search</span>
      </div>

      {/* Search Bar */}
      <div className="card mb-4">
        <div className="card__body" style={{ padding: '10px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
          <Search size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search documents, keywords, formations, incidents..."
            style={{
              flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)',
              fontSize: 14, fontFamily: 'var(--font-sans)', outline: 'none'
            }}
            id="document-search"
          />
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            style={{
              background: 'var(--bg-input)', border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)', padding: '4px 8px', borderRadius: 4, fontSize: 11,
              fontFamily: 'var(--font-sans)'
            }}
          >
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Results */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>
          {filtered.length} documents found {searchQuery && `for "${searchQuery}"`}
        </div>

        {filtered.map(doc => (
          <div key={doc.id} className="card" style={{ cursor: 'pointer', transition: 'border-color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent-blue)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-primary)')}
          >
            <div className="card__body" style={{ padding: '12px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 12, flex: 1 }}>
                  <div style={{
                    width: 36, height: 36, background: 'var(--bg-tertiary)', borderRadius: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <FileText size={18} style={{ color: 'var(--accent-blue)' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-heading)', marginBottom: 2 }}>{doc.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6 }}>
                      {doc.type} · {doc.source} · {doc.pages} pages · {doc.date}
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {doc.tags.map((tag, i) => (
                        <span key={i} className="provenance-tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Relevance</div>
                    <div className="text-mono" style={{ fontSize: 14, fontWeight: 700, color: doc.relevance > 85 ? 'var(--accent-green)' : 'var(--text-primary)' }}>{doc.relevance}%</div>
                  </div>
                  <ExternalLink size={14} style={{ color: 'var(--text-tertiary)' }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentsView;
