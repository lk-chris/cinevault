import React from 'react';
import { Play } from 'lucide-react';

interface BackdropHeroProps {
  title: string;
  backdropUrl?: string;
  posterUrl?: string;
  onPlayTrailer: () => void;
}

export default function BackdropHero({
  title,
  backdropUrl,
  posterUrl,
  onPlayTrailer
}: BackdropHeroProps) {
  const imageUrl = backdropUrl || posterUrl;

  return (
    <div className="relative h-[clamp(240px,38vw,420px)] -mx-4 rounded-b-[24px] overflow-hidden bg-s2 mb-2 border-b border-white/[0.08]">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover object-center"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-s3 to-s1" />
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-black/30 pointer-events-none" />

      {/* Play Trailer Floating Button */}
      <button
        onClick={onPlayTrailer}
        className="absolute top-4 right-4 z-10 inline-flex items-center gap-2 h-10 px-[18px] rounded-full bg-[#0A0A0C]/75 backdrop-blur-lg border border-white/[0.14] font-mono text-sm text-white hover:bg-white/20 transition-colors shadow-lg"
      >
        <Play size={16} fill="currentColor" /> Play trailer
      </button>
    </div>
  );
}
