import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import type { CinevaultMedia } from '../../types';

interface RelatedTitlesProps {
  titles: CinevaultMedia[];
}

export default function RelatedTitles({ titles }: RelatedTitlesProps) {
  const navigate = useNavigate();

  if (titles.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="text-sm font-semibold pl-2 border-l-[3px] border-white leading-none mt-8 mb-3">
        More like this
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-x-2.5 gap-y-3.5">
        {titles.map((other) => (
          <div
            key={other.id}
            className="cursor-pointer group"
            onClick={() => {
              navigate(`/title/${other.id}`);
              window.scrollTo(0, 0);
            }}
          >
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-s2 border border-white/[0.08] group-hover:border-white/20 transition-all">
              {other.posterUrl ? (
                <img
                  src={other.posterUrl}
                  alt={other.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-s3 grid place-items-center p-2 text-center text-xs font-bold">
                  {other.title}
                </div>
              )}
            </div>
            <h4 className="text-[13px] font-semibold mt-2 mx-0.5 truncate m-0 group-hover:text-am transition-colors">
              {other.title}
            </h4>
            <div className="flex gap-1.5 mx-0.5 mt-1">
              <span className="inline-flex items-center gap-1 h-[22px] px-2 rounded-full bg-s1 border border-white/[0.08] font-mono text-[10px]">
                <Star size={11} fill="var(--am)" stroke="var(--am)" />
                {other.rating}
              </span>
              <span className="inline-flex items-center h-[22px] px-2 rounded-full bg-s1 border border-white/[0.08] font-mono text-[10px] text-t2">
                {other.year}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
