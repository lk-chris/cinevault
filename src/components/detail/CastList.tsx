import React from 'react';
import { ini } from '../../constants/vibeData';
import type { CinevaultMedia } from '../../types';

interface CastListProps {
  media: CinevaultMedia;
}

export default function CastList({ media }: CastListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr] gap-8 mt-7">
      {/* Director / Showrunner */}
      <div>
        <div className="text-sm font-semibold pl-2 border-l-[3px] border-white leading-none mt-7 mb-3">
          {media.type === "tv" ? "Creator / Showrunner" : "Director"}
        </div>
        <div className="w-[120px]">
          <div className="aspect-square rounded-xl bg-s2 border border-white/[0.08] grid place-items-center font-bold text-[22px] text-white/85">
            {ini(media.director)}
          </div>
          <div className="text-xs font-semibold leading-snug mt-1.5 truncate">{media.director}</div>
          <div className="text-[11px] text-t2 font-mono">{media.type === "tv" ? "Creator" : "Director"}</div>
        </div>
      </div>

      {/* Studios */}
      <div className="md:row-start-1 md:col-start-2">
        <div className="text-sm font-semibold pl-2 border-l-[3px] border-white leading-none mt-7 mb-3">Studios</div>
        <div className="space-y-2">
          {media.studios.slice(0, 3).map((stu, si) => (
            <div key={si} className="flex items-center gap-2.5 p-2 bg-s1 rounded-xl text-xs border border-white/[0.06]">
              <i className="flex-shrink-0 w-8 h-8 rounded-full bg-[#f4efe6] text-[#111] grid place-items-center font-bold text-[13px] not-italic">
                {stu[0]}
              </i>
              <span className="truncate">{stu}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actors */}
      <div className="md:row-start-2 md:col-start-1">
        <div className="text-sm font-semibold pl-2 border-l-[3px] border-white leading-none mt-7 mb-3">Cast</div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {media.cast.slice(0, 5).map((actor, k) => (
            <div key={k}>
              <div className="aspect-square rounded-xl bg-s2 border border-white/[0.08] overflow-hidden grid place-items-center font-bold text-[20px] text-white/85">
                {actor.profileUrl ? (
                  <img src={actor.profileUrl} alt={actor.name} className="w-full h-full object-cover object-center" />
                ) : (
                  <span>{ini(actor.name)}</span>
                )}
              </div>
              <div className="text-xs font-semibold leading-snug mt-1.5 truncate">{actor.name}</div>
              <div className="text-[11px] text-t2 font-mono truncate">{actor.role}</div>
            </div>
          ))}
          {media.cast.length > 5 && (
            <div className="aspect-square rounded-xl bg-s2 border border-white/[0.08] grid place-items-center font-mono text-[13px] text-t2">
              +{media.cast.length - 5} more
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
