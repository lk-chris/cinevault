import React, { useState } from 'react';
import { Sparkles, ArrowRight, Loader2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

interface AiPromptBarProps {
  onSuccess?: () => void;
  compact?: boolean;
}

const SAMPLE_PROMPTS = [
  "Cozy 90s rainy mystery like Knives Out under 2 hours",
  "Mind-bending sci-fi thriller that will keep me guessing",
  "Funny animated movie for family night with 8-year-old",
  "Edge-of-your-seat survival action with high ratings"
];

export default function AiPromptBar({ onSuccess, compact = false }: AiPromptBarProps) {
  const [prompt, setPrompt] = useState('');
  const { curateWithAI, aiLoading } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || aiLoading) return;
    const ok = await curateWithAI(prompt);
    if (ok) {
      if (onSuccess) onSuccess();
      navigate('/tonight');
    }
  };

  const handleSelectSample = async (sample: string) => {
    setPrompt(sample);
    const ok = await curateWithAI(sample);
    if (ok) {
      if (onSuccess) onSuccess();
      navigate('/tonight');
    }
  };

  return (
    <div className={`w-full rounded-2xl bg-gradient-to-r from-amber-500/[0.12] via-s1 to-amber-500/[0.06] border border-am/30 p-3.5 shadow-lg backdrop-blur-md transition-all ${compact ? 'text-xs' : 'text-sm'}`}>
      <div className="flex items-center gap-2 mb-2 text-am font-semibold text-xs tracking-wide">
        <Sparkles size={15} className="animate-spin text-am" style={{ animationDuration: '4s' }} />
        <span>CINEVAULT AI VIBE CURATOR</span>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Cozy 90s rainy mystery like Knives Out under 2 hours..."
          disabled={aiLoading}
          className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder:text-gray-500 text-xs sm:text-sm focus:outline-none focus:border-am focus:ring-1 focus:ring-am transition-all"
        />

        <button
          type="submit"
          disabled={!prompt.trim() || aiLoading}
          className="px-4 py-2.5 rounded-xl bg-am text-[#111] font-bold text-xs flex items-center gap-1.5 hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer shrink-0 shadow-md shadow-am/20"
        >
          {aiLoading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Thinking...</span>
            </>
          ) : (
            <>
              <span>Curate</span>
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </form>

      {/* Quick Suggestion Pills */}
      {!compact && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2.5">
          <span className="text-[11px] font-mono text-gray-400 shrink-0">Try:</span>
          {SAMPLE_PROMPTS.map((sp, idx) => (
            <button
              key={idx}
              type="button"
              disabled={aiLoading}
              onClick={() => handleSelectSample(sp)}
              className="text-[11px] whitespace-nowrap bg-white/[0.05] hover:bg-white/10 border border-white/10 hover:border-am/40 text-gray-300 hover:text-white px-2.5 py-1 rounded-full transition-colors cursor-pointer"
            >
              {sp}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
