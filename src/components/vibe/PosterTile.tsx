import React from 'react';
import { Check } from 'lucide-react';
import { CARD_POSTERS } from '../../constants/vibeData';
import type { StepOpt } from '../../types';

interface PosterTileProps {
  opt: StepOpt;
  isSelected: boolean;
  onToggle: () => void;
}

export default function PosterTile({ opt, isSelected, onToggle }: PosterTileProps) {
  const posterUrl = CARD_POSTERS[opt.id];

  return (
    <button
      onClick={onToggle}
      className={`relative text-left p-3.5 rounded-[20px] overflow-hidden flex flex-col justify-end border transition-all active:scale-[0.98] group bg-s2 aspect-[2/3] ${
        isSelected
          ? "border-am ring-2 ring-am ring-offset-2 ring-offset-[#0A0A0C]"
          : "border-white/[0.08] hover:border-white/25"
      }`}
    >
      {/* 2:3 Vertical Movie Poster Image */}
      {posterUrl ? (
        <img
          src={posterUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 bg-s3" />
      )}

      {/* Clean Dark Vignette Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C]/95 via-[#0A0A0C]/50 to-transparent pointer-events-none" />

      {/* Checkmark Indicator */}
      <span
        className={`absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full grid place-items-center border transition-colors ${
          isSelected
            ? "bg-am border-am text-[#111]"
            : "bg-[#0A0A0C]/65 border-white/30 text-transparent"
        }`}
      >
        <Check size={15} strokeWidth={3} className={isSelected ? "opacity-100" : "opacity-0"} />
      </span>

      {/* Label and description */}
      <div className="relative z-10">
        <b className="block text-base md:text-lg font-bold leading-tight drop-shadow">{opt.label}</b>
        {opt.desc && (
          <small className="block text-gray-300 text-xs mt-1 opacity-90 leading-snug drop-shadow line-clamp-2">
            {opt.desc}
          </small>
        )}
      </div>
    </button>
  );
}
