import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SCREENS, ALL_LABELS } from '../constants/vibeData';
import VibeHeader from '../components/vibe/VibeHeader';
import PosterTile from '../components/vibe/PosterTile';
import TimeSvgTile from '../components/vibe/TimeSvgTile';
import PillSelector from '../components/vibe/PillSelector';
import VibeBottomBar from '../components/vibe/VibeBottomBar';

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

  const handleConfirmReset = () => {
    setShowResetConfirm(false);
    resetVibe();
  };

  return (
    <div className="min-h-screen bg-bg text-white flex flex-col">
      {/* Sticky Top Header */}
      <VibeHeader />

      {/* Main scrolling content (pushes smoothly under sticky header) */}
      <div className="w-full max-w-[760px] mx-auto px-[18px] pt-6 pb-[160px] flex-1">
        {/* heading */}
        <h1 className="text-[clamp(28px,6.5vw,42px)] font-bold leading-[1.05] tracking-tight mb-2">
          {sc ? sc.h : "Here's your vibe for tonight"}
        </h1>
        <p className="text-t2 text-base mb-6">
          {sc
            ? sc.s
            : hasCurated
            ? "We'll curate your feed from these picks."
            : "You haven't set your vibe yet. Get started below."}
        </p>

        {sc ? (
          /* Step content */
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
        ) : !hasCurated ? (
          /* Empty state when no vibe set */
          <div>
            <button
              onClick={() => {
                setCur(0);
                window.scrollTo(0, 0);
              }}
              className="py-3 px-6 rounded-full bg-am text-[#111] font-bold text-sm cursor-pointer hover:brightness-110 active:scale-95 transition-all"
            >
              Get started
            </button>
          </div>
        ) : (
          /* Original Summary chips layout */
          <div>
            <div className="flex flex-wrap gap-2.5 mb-6">
              {["fmt", "mood", "genre", "time", "age", "era", "lang"].flatMap(k =>
                Array.from(sel[k] || []).map(v => (
                  <span
                    key={`${k}-${v}`}
                    className="py-2.5 px-[18px] rounded-full bg-am/[0.12] text-am border border-am/30 text-[15px]"
                  >
                    {ALL_LABELS[v] || v}
                  </span>
                ))
              )}
            </div>

            {/* CTA for reset feed beneath it, no SVG in the button */}
            <div className="pt-2">
              <button
                onClick={() => setShowResetConfirm(true)}
                className="py-2.5 px-5 rounded-full bg-s2 border border-white/[0.08] text-sm text-gray-300 hover:text-white hover:border-white/20 font-mono transition-colors cursor-pointer"
              >
                Reset feed
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
            className="w-full max-w-[420px] bg-s1 rounded-2xl p-6 border border-white/[0.1] shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white mb-2">
              Reset your feed?
            </h3>
            <p className="text-sm text-t2 leading-relaxed mb-6">
              This will clear all your active preferences and return you to step one with a clean slate.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-full bg-s2 border border-white/[0.08] text-xs font-mono text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-5 py-2 rounded-full bg-am text-[#111] text-xs font-bold font-mono hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-am/10"
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
