import React from 'react';
import { Sparkles } from 'lucide-react';

interface Props {
  questions: string[];
  onSelectQuestion: (q: string) => void;
  roleCode: string;
}

export const SuggestedQuestionsBar: React.FC<Props> = ({
  questions,
  onSelectQuestion,
  roleCode
}) => {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
        Suggested Prompts for {roleCode.replace('_', ' ')}
      </div>

      <div className="flex flex-wrap gap-2">
        {questions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => onSelectQuestion(q)}
            className="text-left px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 rounded-lg text-xs transition-all hover:text-[#0F2C59] shadow-2xs font-medium"
          >
            "{q}"
          </button>
        ))}
      </div>
    </div>
  );
};
