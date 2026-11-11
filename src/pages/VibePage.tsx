import React from 'react';
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
  const { cur, sel, toggleSel, nextStep } = useApp();

  const sc = cur < SCREENS.length ? SCREENS[cur] : null;

  const handleContinue = () => {
    nextStep(() => {
      navigate('/tonight');
    });
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
          {sc ? sc.s : "We'll curate your feed from these picks."}
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
        ) : (
          /* Summary chips */
          <div className="flex flex-wrap gap-2.5">
            {["fmt", "mood", "genre", "time", "age", "era", "lang"].flatMap(k =>
              Array.from(sel[k]).map(v => (
                <span
                  key={`${k}-${v}`}
                  className="py-2.5 px-[18px] rounded-full bg-am/[0.12] text-am border border-am/30 text-[15px]"
                >
                  {ALL_LABELS[v] || v}
                </span>
              ))
            )}
          </div>
        )}
      </div>

      {/* Unified Fixed Bottom Bar (Action row + Nav bar, ZERO clipping) */}
      <VibeBottomBar onContinue={handleContinue} />
    </div>
  );
}
