import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, RotateCcw, SlidersHorizontal, AlertTriangle, X, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SCREENS, ALL_LABELS } from '../constants/vibeData';
import VibeHeader from '../components/vibe/VibeHeader';
import PosterTile from '../components/vibe/PosterTile';
import TimeSvgTile from '../components/vibe/TimeSvgTile';
import PillSelector from '../components/vibe/PillSelector';
import VibeBottomBar from '../components/vibe/VibeBottomBar';

const CATEGORY_NAMES: Record<string, string> = {
  fmt: "Format",
  mood: "Mood",
  genre: "Genres",
  time: "Runtime",
  age: "Audience",
  era: "Era",
  lang: "Language",
};

export default function VibePage() {
  const navigate = useNavigate();
  const { cur, setCur, sel, toggleSel, nextStep, hasCurated, resetVibe } = useApp();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const sc = cur < SCREENS.length ? SCREENS[cur] : null;

  const handleContinue = () => {
    nextStep(() => {
      navigate('/tonight');
    });
  };

  const handleStartCuration = () => {
    setCur(0);
    window.scrollTo(0, 0);
  };

  const handleConfirmReset = () => {
    setShowResetConfirm(false);
    resetVibe();
  };

  return (
    <div className="min-h-screen bg-bg text-white flex flex-col">
      {/* Sticky Top Header */}
      <VibeHeader />

      {/* Main scrolling content */}
      <div className="w-full max-w-[760px] mx-auto px-[18px] pt-6 pb-[160px] flex-1">
        {sc ? (
          /* ─── ONBOARDING STEPS (1 through 6) ─── */
          <>
            <h1 className="text-[clamp(28px,6.5vw,42px)] font-bold leading-[1.05] tracking-tight mb-2">
              {sc.h}
            </h1>
            <p className="text-t2 text-base mb-6">
              {sc.s}
            </p>

            <div className="space-y-6">
              {sc.groups.map(g => (
                <div key={g.key}>
                  {g.label && <div className="text-t2 text-sm mb-2.5">{g.label}</div>}

                  {/* POSTER TILES (Format, Mood, Who's watching) */}
                  {sc.type === "tiles" && sc.layout === "posters" && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {g.opts.map((o) => (
                        <PosterTile
                          key={o.id}
                          opt={o}
                          isSelected={sel[g.key].has(o.id)}
                          onToggle={() => toggleSel(g.key, o.id, g.max)}
                        />
                      ))}
                    </div>
                  )}

                  {/* SVG TIME TILES (Runtime) */}
                  {sc.type === "tiles" && sc.layout === "svg_time" && (
                    <div className="grid grid-cols-2 gap-3">
                      {g.opts.map((o) => (
                        <TimeSvgTile
                          key={o.id}
                          opt={o}
                          isSelected={sel[g.key].has(o.id)}
                          onToggle={() => toggleSel(g.key, o.id, g.max)}
                        />
                      ))}
                    </div>
                  )}

                  {/* PILLS LAYOUT (Genres, Eras, Languages) */}
                  {sc.type === "pills" && (
                    <PillSelector
                      opts={g.opts}
                      selectedSet={sel[g.key]}
                      onToggle={(id) => toggleSel(g.key, id, g.max)}
                    />
                  )}
                </div>
              ))}
            </div>
          </>
        ) : !hasCurated ? (
          /* ─── SUMMARY STATE A: NOT CURATED YET ─── */
          <div className="flex flex-col items-center justify-center text-center py-12 px-4">
            <div className="w-16 h-16 rounded-2xl bg-am/10 border border-am/25 grid place-items-center mb-5 text-am shadow-lg shadow-am/5">
              <Sparkles size={32} />
            </div>

            <h1 className="text-[clamp(26px,5.5vw,36px)] font-bold tracking-tight mb-3">
              Craft your vibe for tonight
            </h1>
            <p className="text-t2 text-sm sm:text-base max-w-[460px] leading-relaxed mb-8">
              You haven't set your vibe yet. Tell us what you're in the mood for, runtime preferences, and genres to get a personalized feed.
            </p>

            <button
              onClick={handleStartCuration}
              className="py-3.5 px-8 rounded-full bg-am text-[#111] font-bold text-sm inline-flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-am/15 cursor-pointer"
            >
              <SlidersHorizontal size={18} />
              <span>Get started</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          /* ─── SUMMARY STATE B: HAS ACTIVE PICKS ─── */
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-[clamp(26px,5.5vw,36px)] font-bold leading-[1.05] tracking-tight mb-2">
                  Here's your vibe for tonight
                </h1>
                <p className="text-t2 text-sm sm:text-base m-0">
                  Your feed is personalized from these selections.
                </p>
              </div>

              {/* Reset button trigger */}
              <button
                onClick={() => setShowResetConfirm(true)}
                className="self-start sm:self-center inline-flex items-center gap-2 px-4 py-2 rounded-full bg-s2 border border-white/[0.08] text-xs font-mono text-gray-300 hover:text-white hover:border-white/20 transition-all cursor-pointer active:scale-95"
              >
                <RotateCcw size={14} className="text-am" />
                <span>Reset feed</span>
              </button>
            </div>

            {/* Categorized picks display */}
            <div className="space-y-4 mb-8">
              {["fmt", "mood", "genre", "time", "age", "era", "lang"].map((k) => {
                const items = Array.from(sel[k] || []);
                if (items.length === 0) return null;
                return (
                  <div key={k} className="p-4 rounded-2xl bg-s1 border border-white/[0.06]">
                    <div className="text-[11px] font-mono text-[#6B7280] uppercase tracking-wider mb-2.5">
                      {CATEGORY_NAMES[k] || k}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {items.map((v) => (
                        <span
                          key={`${k}-${v}`}
                          className="py-1.5 px-3.5 rounded-full bg-am/[0.12] text-am border border-am/30 text-xs font-medium inline-flex items-center gap-1.5"
                        >
                          <Check size={12} strokeWidth={2.5} />
                          {ALL_LABELS[v] || v}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions callout */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleContinue}
                className="flex-1 py-3.5 px-6 rounded-full bg-am text-[#111] font-bold text-sm inline-flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-am/10 cursor-pointer"
              >
                <span>Open my feed</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => setShowResetConfirm(true)}
                className="py-3.5 px-6 rounded-full bg-s2 border border-white/[0.08] text-gray-300 hover:text-white hover:border-white/20 font-mono text-xs inline-flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <RotateCcw size={15} />
                <span>Reset & start over</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Resetting Feed */}
      {showResetConfirm && (
        <div
          id="confirm-reset-backdrop"
          onClick={(e) => {
            if ((e.target as HTMLElement).id === "confirm-reset-backdrop") {
              setShowResetConfirm(false);
            }
          }}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
        >
          <div
            className="w-full max-w-[440px] bg-s1 rounded-2xl p-6 border border-white/[0.1] shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 grid place-items-center text-am">
                <AlertTriangle size={20} />
              </div>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="w-8 h-8 rounded-full bg-s2 grid place-items-center text-t2 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <h3 className="text-lg font-bold text-white mb-2">
              Reset your feed vibe?
            </h3>
            <p className="text-sm text-t2 leading-relaxed mb-6">
              This will clear all your active preferences and return you to step one with a clean slate.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2.5 rounded-full bg-s2 border border-white/[0.08] text-xs font-mono text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-5 py-2.5 rounded-full bg-am text-[#111] text-xs font-bold font-mono hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-am/10"
              >
                Yes, reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unified Fixed Bottom Bar */}
      <VibeBottomBar onContinue={handleContinue} />
    </div>
  );
}
