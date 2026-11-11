import React from 'react';
import type { CinevaultMedia } from '../../types';

interface RatingGridProps {
  ratings: CinevaultMedia['ratings'];
}

export default function RatingGrid({ ratings }: RatingGridProps) {
  return (
    <div>
      <div className="text-sm font-semibold pl-2 border-l-[3px] border-white leading-none mt-8 mb-3">
        How it's rated
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2">
        <div className="p-3 rounded-xl bg-s1 border border-white/[0.08]">
          <b className="text-2xl font-semibold leading-none block text-[#2dd4bf]">
            {ratings.tmdb}
            <small className="text-[11px] text-t2 font-normal"> /10</small>
          </b>
          <span className="block mt-1.5 font-mono text-[10px] text-t2 uppercase tracking-[0.06em]">
            Audience score
          </span>
        </div>

        <div className="p-3 rounded-xl bg-s1 border border-white/[0.08]">
          <b className="text-2xl font-semibold leading-none block text-white">
            {ratings.tmdbVotes}
          </b>
          <span className="block mt-1.5 font-mono text-[10px] text-t2 uppercase tracking-[0.06em]">
            Audience votes
          </span>
        </div>

        {ratings.imdb && ratings.imdb !== 'NR' && (
          <div className="p-3 rounded-xl bg-s1 border border-white/[0.08]">
            <b className="text-2xl font-semibold leading-none block text-am">
              {ratings.imdb}
              <small className="text-[11px] text-t2 font-normal"> /10</small>
            </b>
            <span className="block mt-1.5 font-mono text-[10px] text-t2 uppercase tracking-[0.06em]">
              IMDb
            </span>
          </div>
        )}

        {ratings.rotten && ratings.rotten !== 'NR' && (
          <div className="p-3 rounded-xl bg-s1 border border-white/[0.08]">
            <b className="text-2xl font-semibold leading-none block text-[#f2683c]">
              {ratings.rotten}
            </b>
            <span className="block mt-1.5 font-mono text-[10px] text-t2 uppercase tracking-[0.06em]">
              Rotten Tomatoes
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
