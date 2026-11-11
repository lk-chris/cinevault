import React from 'react';
import { List, LayoutGrid } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { HEAD } from '../../constants/vibeData';
import type { Tab } from '../../types';

interface FeedHeaderProps {
  tab: Tab;
  titleCount: number;
}

export default function FeedHeader({ tab, titleCount }: FeedHeaderProps) {
  const {
    feedLoading,
    feedView,
    setFeedView,
    categoryFilter,
    setCategoryFilter,
    sortFilter,
    setSortFilter,
  } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-[#0A0A0C]/95 backdrop-blur-md border-b border-white/[0.08] px-4 pt-[max(14px,env(safe-area-inset-top))] pb-3">
      <div className="max-w-[1100px] mx-auto space-y-2.5">
        {/* Line 1: CineVault brand */}
        <div>
          <span className="text-xl font-light tracking-tight">
            Cine<b className="text-am font-bold">Vault</b>
          </span>
        </div>

        {/* Line 2: Tab Heading & Count */}
        <div className="flex items-baseline gap-2.5">
          <h2 className="text-2xl font-bold tracking-tight text-white m-0">
            {HEAD[tab]}
          </h2>
          <span className="font-mono text-xs text-t2">
            {feedLoading ? 'Searching...' : `${titleCount} ${titleCount === 1 ? 'title' : 'titles'}`}
          </span>
        </div>

        {/* Line 3: Format category filters (only on Tonight tab) */}
        {tab === "tonight" && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'all', label: 'All' },
              { id: 'movie', label: 'Movies' },
              { id: 'tv', label: 'TV Shows' },
              { id: 'anime', label: 'Anime' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id as any)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border whitespace-nowrap ${
                  categoryFilter === cat.id
                    ? "bg-am text-[#111] border-am font-semibold"
                    : "bg-s1 border-white/[0.08] text-t2 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Line 4: Sort dropdown & Grid/List view toggle spaced between on extreme ends of the line */}
        <div className="flex items-center justify-between gap-3 pt-0.5">
          {/* Extreme Left: Sort selector */}
          {tab === "tonight" ? (
            <div className="flex items-center gap-1.5 font-mono text-xs text-t2">
              <span>Sort:</span>
              <select
                value={sortFilter}
                onChange={e => setSortFilter(e.target.value as any)}
                className="bg-s1 border border-white/[0.08] rounded-full px-2.5 py-1 text-xs text-white focus:outline-none focus:border-am cursor-pointer"
              >
                <option value="popularity.desc">Popularity</option>
                <option value="vote_average.desc">Highest Rated</option>
                <option value="primary_release_date.desc">Newest Releases</option>
              </select>
            </div>
          ) : (
            <div />
          )}

          {/* Extreme Right: View toggle (List / Grid) */}
          <div className="inline-flex p-[1px] rounded-full border border-white/[0.08] bg-s1">
            <button
              onClick={() => setFeedView("list")}
              aria-label="List view"
              className={`w-8 h-8 rounded-full grid place-items-center transition-colors ${
                feedView === "list" ? "bg-[#f4efe6] text-[#111]" : "text-t2 hover:text-white"
              }`}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setFeedView("grid")}
              aria-label="Grid view"
              className={`w-8 h-8 rounded-full grid place-items-center transition-colors ${
                feedView === "grid" ? "bg-[#f4efe6] text-[#111]" : "text-t2 hover:text-white"
              }`}
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
