import React from 'react';
import { Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TOTAL_STEPS, SCREENS } from '../../constants/vibeData';

interface VibeHeaderProps {
  onUseAi?: () => void;
}

export default function VibeHeader({ onUseAi }: VibeHeaderProps) {
  const { cur, skipStep, hasCurated } = useApp();
  const sc = cur < SCREENS.length ? SCREENS[cur] : null;

  return (
    <header className="sticky top-0 z-30 bg-[#0A0A0C]/95 backdrop-blur-md border-b border-white/[0.08] px-[18px] pt-[max(14px,env(safe-area-inset-top))] pb-3">
      <div className="w-full max-w-[760px] mx-auto">
        <div className="flex items-center justify-between">
          <div className="text-xl font-light tracking-tight">
            Cine<b className="text-am font-bold">Vault</b>
          </div>
          <div className="flex items-center gap-3">
            {onUseAi && (
              <button
                onClick={onUseAi}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-am py-1 px-3 rounded-full border border-am/30 bg-am/10 hover:bg-am/20 hover:border-am transition-colors cursor-pointer"
              >
                <Sparkles size={12} className="text-am" />
                <span>Use AI</span>
              </button>
            )}
            {sc && (
              <button
                onClick={skipStep}
                className="text-t2 text-sm py-1 px-3 rounded-full hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                Skip
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar Segments */}
        <div className="flex gap-1.5 mt-3">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => {
            const isFilled = sc ? i < sc.step : hasCurated;
            return (
              <i
                key={i}
                className={`flex-1 h-1 rounded-full not-italic transition-colors ${
                  isFilled ? "bg-am" : "bg-s2"
                }`}
              />
            );
          })}
        </div>
      </div>
    </header>
  );
}
