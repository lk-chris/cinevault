import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Eye, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { fm } from '../../constants/vibeData';
import type { CinevaultMedia } from '../../types';

interface MovieListCardProps {
  item: CinevaultMedia;
  isFirst: boolean;
}

export default function MovieListCard({ item, isFirst }: MovieListCardProps) {
  const navigate = useNavigate();
  const { wl, wd, toggleWl, toggleWd } = useApp();

  return (
    <div
      onClick={() => navigate(`/title/${item.id}`)}
      className={`flex gap-4 py-3.5 cursor-pointer group ${!isFirst ? "border-t border-white/[0.08]" : ""}`}
    >
      <div className="flex-shrink-0 w-[65px] h-[98px] rounded-xl overflow-hidden bg-s2 border border-white/[0.08]">
        {item.posterUrl ? (
          <img
            src={item.posterUrl}
            alt={item.title}
            className="w-full h-full object-cover object-center"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-s3 grid place-items-center text-[10px] p-1 text-center font-bold">
            {item.title}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-[17px] font-semibold leading-snug truncate m-0 group-hover:text-am transition-colors">
          {item.title}
        </h4>
        <div className="font-mono text-xs uppercase text-t2 mt-0.5">
          {item.year} · {item.type === "tv" ? (item.seasons ? `${item.seasons} season${item.seasons > 1 ? 's' : ''}` : 'TV Show') : fm(item.runtimeMinutes)} · {item.genres.slice(0, 2).join(', ')}
        </div>
        <p className="text-sm leading-relaxed text-t2 line-clamp-2 mt-2 mb-2.5 m-0">
          {item.synopsis}
        </p>
        <div className="flex items-center gap-1.5">
          <span className="px-[7px] py-0.5 border border-white/[0.08] rounded-md font-mono text-[11px]">
            {item.certification || 'PG-13'}
          </span>
          <span className="inline-flex items-center gap-1 font-mono text-[13px] ml-1">
            <Star size={14} fill="var(--am)" stroke="var(--am)" />{item.rating}
          </span>
          <span className="flex-1" />
          <button
            onClick={(e) => toggleWd(item.id, e)}
            className={`w-9 h-9 rounded-full border grid place-items-center transition-colors ${
              wd.has(item.id) ? "text-am border-am" : "border-white/[0.08] text-t2 hover:text-white"
            }`}
          >
            <Eye size={16} />
          </button>
          <button
            onClick={(e) => toggleWl(item.id, e)}
            className={`w-9 h-9 rounded-full border grid place-items-center transition-colors ${
              wl.has(item.id) ? "text-am border-am" : "border-white/[0.08] text-t2 hover:text-white"
            }`}
          >
            <Bookmark size={16} fill={wl.has(item.id) ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </div>
  );
}
