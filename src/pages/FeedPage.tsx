import React from 'react';
import { useApp } from '../context/AppContext';
import FeedHeader from '../components/feed/FeedHeader';
import MovieGridCard from '../components/feed/MovieGridCard';
import MovieListCard from '../components/feed/MovieListCard';
import EmptyState from '../components/feed/EmptyState';
import BottomNav from '../components/common/BottomNav';
import type { Tab, CinevaultMedia } from '../types';

interface FeedPageProps {
  tab: Tab;
}

export default function FeedPage({ tab }: FeedPageProps) {
  const {
    feedItems,
    feedLoading,
    feedView,
    wl,
    wd,
    mediaRegistry
  } = useApp();

  // Derive current items to display based on the active tab
  let currentList: CinevaultMedia[] = [];
  if (tab === "tonight") {
    currentList = feedItems;
  } else if (tab === "wl") {
    currentList = Array.from(wl)
      .map(id => mediaRegistry.get(id))
      .filter(Boolean) as CinevaultMedia[];
  } else if (tab === "wd") {
    currentList = Array.from(wd)
      .map(id => mediaRegistry.get(id))
      .filter(Boolean) as CinevaultMedia[];
  }

  return (
    <div className="min-h-screen bg-bg text-white pb-24">
      {/* Sticky Feed Header */}
      <FeedHeader tab={tab} titleCount={currentList.length} />

      {/* Main feed cards content */}
      <div className="max-w-[1100px] mx-auto px-4 pt-4">
        {feedLoading && currentList.length === 0 ? (
          /* Loading Skeleton State */
          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-x-3 gap-y-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] rounded-2xl bg-s2 border border-white/[0.04]" />
                <div className="h-4 bg-s2 rounded mt-2.5 w-3/4" />
                <div className="h-3 bg-s1 rounded mt-1.5 w-1/2" />
              </div>
            ))}
          </div>
        ) : currentList.length === 0 ? (
          /* Empty state */
          <EmptyState tab={tab} />
        ) : feedView === "grid" ? (
          /* GRID VIEW - 2:3 aspect ratio portrait cards */
          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-x-3 gap-y-4">
            {currentList.map(item => (
              <MovieGridCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          /* LIST VIEW */
          <div>
            {currentList.map((item, idx) => (
              <MovieListCard key={item.id} item={item} isFirst={idx === 0} />
            ))}
          </div>
        )}
      </div>

      {/* Persistent Bottom Nav */}
      <BottomNav />
    </div>
  );
}
