import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Eye, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { CinevaultMedia } from '../../types';

interface MovieGridCardProps {
  item: CinevaultMedia;
}

export default function MovieGridCard({ item }: MovieGridCardProps) {
  const navigate = useNavigate();
  const { wl, wd, toggleWl, toggleWd } = useApp();

  return (
    <div
      className="cursor-pointer group"
      onClick={() => navigate(`/title/${item.id}`)}
    >
      {/* 2:3 Vertical Movie Poster Card */}
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-s2 border border-white/[0.08] transition-all group-hover:border-white/20">
        {item.posterUrl ? (
          <img
            src={item.posterUrl}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-s3 grid place-items-center p-3 text-center font-bold text-sm text-gray-400">
            {item.title}
          </div>
        )}

        {/* Gradient shadow overlay for badge legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

        {/* Quick Action Buttons (Watchlist & Watched) */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
          <button
            onClick={(e) => toggleWl(item.id, e)}
            title={wl.has(item.id) ? "Remove from watchlist" : "Add to watchlist"}
            className={`w-[32px] h-[32px] rounded-full grid place-items-center backdrop-blur-md border transition-colors ${
              wl.has(item.id) ? "bg-am text-[#111] border-am" : "bg-[#0A0A0C]/70 border-white/[0.14] text-white hover:text-am"
            }`}
          >
            <Bookmark size={14} fill={wl.has(item.id) ? "currentColor" : "none"} />
          </button>
          <button
            onClick={(e) => toggleWd(item.id, e)}
            title={wd.has(item.id) ? "Unmark watched" : "Mark as watched"}
            className={`w-[32px] h-[32px] rounded-full grid place-items-center backdrop-blur-md border transition-colors ${
              wd.has(item.id) ? "bg-am text-[#111] border-am" : "bg-[#0A0A0C]/70 border-white/[0.14] text-white hover:text-am"
            }`}
          >
            <Eye size={14} />
          </button>
        </div>

        {/* Bottom tag: Media Type if TV */}
        {item.type === 'tv' && (
          <div className="absolute bottom-2 left-2 z-10">
            <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm border border-white/10 text-[10px] font-mono text-gray-300">
              TV
            </span>
          </div>
        )}
      </div>

      {/* Card Title & Meta */}
      <h4 className="mt-2.5 mx-0.5 text-[15px] font-semibold leading-snug truncate group-hover:text-am transition-colors">
        {item.title}
      </h4>
      <div className="flex gap-1.5 mx-0.5 mt-1">
        <span className="inline-flex items-center gap-1 h-[24px] px-2 rounded-full bg-s1 border border-white/[0.08] font-mono text-[11px]">
          <Star size={12} fill="var(--am)" stroke="var(--am)" />{item.rating}
        </span>
        <span className="inline-flex items-center h-[24px] px-2 rounded-full bg-s1 border border-white/[0.08] font-mono text-[11px] text-t2">
          {item.year}
        </span>
      </div>
    </div>
  );
}
