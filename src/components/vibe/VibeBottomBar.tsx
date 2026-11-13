import React from 'react';
import { ArrowLeft, ArrowRight, Moon, Bookmark, Eye, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { SCREENS } from '../../constants/vibeData';

interface VibeBottomBarProps {
  onContinue: () => void;
}

export default function VibeBottomBar({ onContinue }: VibeBottomBarProps) {
  const navigate = useNavigate();
  const { cur, backStep, stepValid, goText, wl, wd, setCur, hasCurated } = useApp();

  const isSummary = cur >= SCREENS.length;
  const showActionRow = !isSummary || hasCurated;

  return (
    <div className="fixed left-0 right-0 bottom-0 z-40 bg-[#141519]/[0.98] border-t border-white/[0.08] backdrop-blur-md">
      {/* Onboarding Action Row: Back & Continue */}
      {showActionRow && (
        <div className="w-full max-w-[760px] mx-auto px-4 py-2.5 flex items-center justify-between">
          {cur > 0 ? (
            <button
              onClick={backStep}
              className="py-2.5 px-5 rounded-full bg-s2 border border-white/[0.08] text-sm text-white hover:bg-s3 transition-colors flex items-center gap-1.5 active:scale-95"
            >
              <ArrowLeft size={16} /> Back
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onContinue}
            disabled={!stepValid()}
            className={`py-2.5 px-7 rounded-full font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 active:scale-95 ${
              stepValid()
                ? "bg-am text-[#111] hover:brightness-110 shadow-lg shadow-am/10 cursor-pointer"
                : "bg-s2 text-[#6B7280] cursor-not-allowed"
            }`}
          >
            {goText()} <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Persistent Bottom Nav below action row */}
      <nav className="flex justify-around border-t border-white/[0.06] py-1.5 pb-[calc(6px+env(safe-area-inset-bottom,0px))]">
        <button
          onClick={() => navigate('/tonight')}
          className="relative flex flex-col items-center gap-0.5 font-mono text-[10px] min-w-[60px] text-t2 hover:text-white transition-colors"
        >
          <Moon size={19} />
          Tonight
        </button>

        <button
          onClick={() => navigate('/watchlist')}
          className="relative flex flex-col items-center gap-0.5 font-mono text-[10px] min-w-[60px] text-t2 hover:text-white transition-colors"
        >
          <Bookmark size={19} />
          {wl.size > 0 && (
            <i className="absolute -top-1 left-[calc(50%+5px)] min-w-4 h-4 px-1 rounded-full bg-am text-[#111] font-mono font-medium text-[9px] leading-4 text-center not-italic">
              {wl.size}
            </i>
          )}
          Watchlist
        </button>

        <button
          onClick={() => navigate('/watched')}
          className="relative flex flex-col items-center gap-0.5 font-mono text-[10px] min-w-[60px] text-t2 hover:text-white transition-colors"
        >
          <Eye size={19} />
          {wd.size > 0 && (
            <i className="absolute -top-1 left-[calc(50%+5px)] min-w-4 h-4 px-1 rounded-full bg-white/20 text-white font-mono font-medium text-[9px] leading-4 text-center not-italic">
              {wd.size}
            </i>
          )}
          Watched
        </button>

        <button
          onClick={() => {
            setCur(SCREENS.length);
            window.scrollTo(0, 0);
          }}
          className="flex flex-col items-center gap-0.5 font-mono text-[10px] min-w-[60px] text-am font-medium transition-colors"
        >
          <SlidersHorizontal size={19} />
          Vibe
        </button>
      </nav>
    </div>
  );
}
