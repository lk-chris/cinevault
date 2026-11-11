import React from 'react';
import { Check } from 'lucide-react';
import { TIME_SVGS } from '../../constants/vibeData';
import type { StepOpt } from '../../types';

interface TimeSvgTileProps {
  opt: StepOpt;
  isSelected: boolean;
  onToggle: () => void;
}

export default function TimeSvgTile({ opt, isSelected, onToggle }: TimeSvgTileProps) {
  const svgIcon = TIME_SVGS[opt.id];

  return (
    <button
      onClick={onToggle}
      className={`relative text-left p-4 rounded-[20px] overflow-hidden flex flex-col justify-between border transition-all active:scale-[0.98] bg-s1 min-h-[140px] ${
        isSelected
          ? "border-am ring-2 ring-am ring-offset-2 ring-offset-[#0A0A0C] bg-[#1C1D22]"
          : "border-white/[0.08] hover:border-white/20 hover:bg-s2"
      }`}
    >
      <div className="flex items-start justify-between w-full">
        <div>{svgIcon}</div>
        <span
          className={`w-6 h-6 rounded-full grid place-items-center border transition-colors ${
            isSelected ? "bg-am border-am text-[#111]" : "bg-[#0A0A0C]/50 border-white/20 text-transparent"
          }`}
        >
          <Check size={14} strokeWidth={3} className={isSelected ? "opacity-100" : "opacity-0"} />
        </span>
      </div>

      <div>
        <b className="block text-base font-bold leading-tight text-white">{opt.label}</b>
        {opt.desc && (
          <small className="block text-[#9CA3AF] text-xs mt-1 leading-snug">
            {opt.desc}
          </small>
        )}
      </div>
    </button>
  );
}
