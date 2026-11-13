import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star, Bookmark, Eye, Heart, Share2, Play, ChevronRight, X, ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fm } from '../constants/vibeData';
import DetailHeader from '../components/detail/DetailHeader';
import BackdropHero from '../components/detail/BackdropHero';
import CastList from '../components/detail/CastList';
import RatingGrid from '../components/detail/RatingGrid';
import ReviewSection from '../components/detail/ReviewSection';
import RelatedTitles from '../components/detail/RelatedTitles';
import { getWatchProviderUrl } from '../services/tmdb';
import type { CinevaultMedia } from '../types';

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const numId = Number(id);

  const {
    getMediaById,
    enrichMedia,
    wl,
    toggleWl,
    wd,
    toggleWd,
    lk,
    toggleLk,
    watchSt,
    setWatchStatus,
    setSheetContent,
    toast,
    feedItems,
  } = useApp();

  const [media, setMedia] = useState<CinevaultMedia | undefined>(() => getMediaById(numId));
  const [loading, setLoading] = useState(false);
  const [synFull, setSynFull] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const existing = getMediaById(numId);
    if (existing) {
      setMedia(existing);
    }

    setLoading(true);
    enrichMedia(numId).then(enriched => {
      if (enriched) {
        setMedia(enriched);
      }
      setLoading(false);
    });
  }, [numId]);

  if (!media) {
    return (
      <div className="min-h-screen bg-bg text-white p-6 flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold mb-2">Title not found</h2>
        <p className="text-sm text-t2 mb-4">This movie or show may no longer be in the catalogue.</p>
        <button
          onClick={() => navigate('/tonight')}
          className="px-5 py-2 rounded-full bg-am text-[#111] font-bold text-xs"
        >
          Back to Feed
        </button>
      </div>
    );
  }

  const openTrailerSheet = () => {
    setSheetContent(
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold m-0">{media.title}</h3>
            <p className="text-xs font-mono text-t2 m-0">Official Trailer</p>
          </div>
          <button
            onClick={() => setSheetContent(null)}
            className="w-8 h-8 rounded-full bg-s2 grid place-items-center text-t2 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {media.trailerKey ? (
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black mb-3 border border-white/10">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${media.trailerKey}?autoplay=1`}
              title={`${media.title} Trailer`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="aspect-video rounded-xl bg-gradient-to-br from-[#2b2b2f] to-[#050506] grid place-items-center mb-3">
            <div className="text-center p-4">
              <Play size={34} className="text-am mx-auto mb-2 opacity-80" />
              <p className="text-xs text-t2 m-0">Official trailer preview not available for this title.</p>
            </div>
          </div>
        )}

        {media.trailerKey && (
          <div className="flex items-center justify-between text-xs text-t2 font-mono">
            <span>Source: YouTube</span>
            <a
              href={`https://www.youtube.com/watch?v=${media.trailerKey}`}
              target="_blank"
              rel="noreferrer"
              className="text-am hover:underline inline-flex items-center gap-1"
            >
              Watch on YouTube <ExternalLink size={12} />
            </a>
          </div>
        )}
      </div>
    );
  };

  const providers = media?.watchProviders || {
    stream: ['Northlight+', 'Netflix'],
    rent: ['Apple TV', 'Amazon Video'],
    buy: ['Apple TV', 'Amazon Video'],
  };

  const openWatchSheet = () => {
    setSheetContent(
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold m-0">Where to Watch</h3>
            <p className="text-xs font-mono text-t2 m-0">{media.title}</p>
          </div>
          <button
            onClick={() => setSheetContent(null)}
            className="w-8 h-8 rounded-full bg-s2 grid place-items-center text-t2 hover:text-white cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          {providers.stream && providers.stream.length > 0 && (
            <div>
              <span className="block font-mono text-[10px] text-t2 uppercase tracking-[0.06em] mb-2">
                Stream Subscription
              </span>
              <div className="flex flex-wrap gap-2">
                {providers.stream.map(s => (
                  <a
                    key={s}
                    href={getWatchProviderUrl(s, media.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-s2 border border-white/10 hover:border-am/50 text-xs font-medium text-white flex items-center gap-2 transition-all hover:bg-white/[0.06] active:scale-95 group cursor-pointer"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform" />
                    <span>{s}</span>
                    <ExternalLink size={12} className="text-t2 group-hover:text-am transition-colors ml-0.5" />
                  </a>
                ))}
              </div>
            </div>
          )}
          {providers.rent && providers.rent.length > 0 && (
            <div>
              <span className="block font-mono text-[10px] text-t2 uppercase tracking-[0.06em] mb-2">
                Rent from $3.99
              </span>
              <div className="flex flex-wrap gap-2">
                {providers.rent.map(s => (
                  <a
                    key={s}
                    href={getWatchProviderUrl(s, media.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-s2 border border-white/10 hover:border-am/50 text-xs text-gray-300 hover:text-white flex items-center gap-1.5 transition-all hover:bg-white/[0.06] active:scale-95 group cursor-pointer"
                  >
                    <span>{s}</span>
                    <ExternalLink size={11} className="text-t2 group-hover:text-am transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}
          {providers.buy && providers.buy.length > 0 && (
            <div>
              <span className="block font-mono text-[10px] text-t2 uppercase tracking-[0.06em] mb-2">
                Buy from $9.99
              </span>
              <div className="flex flex-wrap gap-2">
                {providers.buy.map(s => (
                  <a
                    key={s}
                    href={getWatchProviderUrl(s, media.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-s2 border border-white/10 hover:border-am/50 text-xs text-gray-300 hover:text-white flex items-center gap-1.5 transition-all hover:bg-white/[0.06] active:scale-95 group cursor-pointer"
                  >
                    <span>{s}</span>
                    <ExternalLink size={11} className="text-t2 group-hover:text-am transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const moreTitles = feedItems.filter(y => y.id !== media.id).slice(0, 6);

  return (
    <div className="min-h-screen bg-bg text-white pb-12">
      {/* Sticky Detail Top Bar */}
      <DetailHeader title={media.title} loading={loading} />

      <div className="max-w-[1100px] mx-auto px-4">
        {/* Backdrop Hero Banner */}
        <BackdropHero
          title={media.title}
          backdropUrl={media.backdropUrl}
          posterUrl={media.posterUrl}
          onPlayTrailer={openTrailerSheet}
        />

        {/* Title & Metadata */}
        <div className="max-w-[760px]">
          <h1 className="text-[30px] font-bold tracking-tight leading-[1.05] mt-4 mb-3 m-0">
            {media.title}
          </h1>

          <p className={`text-sm leading-relaxed text-t2 m-0 ${synFull ? "" : "line-clamp-4"}`}>
            {media.synopsis}
          </p>
          <button
            onClick={() => setSynFull(p => !p)}
            className="text-am font-mono text-xs mt-1 mb-4 block hover:underline cursor-pointer"
          >
            {synFull ? "Show less" : "Read more"}
          </button>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2.5 font-mono text-[13px] text-t2 mb-1.5">
            <span className="inline-flex items-center h-[22px] px-3 rounded-full bg-s1 border border-white/[0.08] text-xs text-t2">
              {media.type === "tv" ? "TV Show" : "Movie"}
            </span>
            <b className="inline-flex items-center gap-1 font-normal text-white text-[13px]">
              <Star size={14} fill="var(--am)" stroke="var(--am)" />{media.rating}
            </b>
            <i className="text-[#6B7280] not-italic">·</i>
            <span>{media.year}</span>
            <i className="text-[#6B7280] not-italic">·</i>
            <span>
              {media.type === "tv"
                ? (media.seasons ? `${media.seasons} season${media.seasons > 1 ? 's' : ''}` : 'TV Series')
                : fm(media.runtimeMinutes)}
            </span>
            {media.episodes && (
              <>
                <i className="text-[#6B7280] not-italic">·</i>
                <span>{media.episodes} episodes</span>
              </>
            )}
          </div>

          <div className="font-mono text-[13px] text-t2 mt-1.5 mb-5">
            {media.genres.join(', ')}
          </div>

          {/* Where to Watch Button */}
          <button
            onClick={openWatchSheet}
            className="w-full h-[45px] rounded-full bg-white text-[#111] font-semibold text-sm inline-flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors mb-2.5 font-mono cursor-pointer"
          >
            <Play size={16} fill="currentColor" /> Where to watch
          </button>

          {/* Watch status dropdown */}
          <label className="relative flex items-center gap-2.5 h-11 px-[18px] rounded-full bg-s1 border border-white/[0.08] font-mono text-sm my-2.5 cursor-pointer hover:border-white/20 transition-colors">
            <span>Watch status</span>
            <span className="ml-auto text-t2">{watchSt[numId] || "Not set"}</span>
            <ChevronRight size={16} className="text-t2" />
            <select
              value={watchSt[numId] || ""}
              onChange={e => setWatchStatus(numId, e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            >
              <option value="">Not set</option>
              {["Plan to watch", "Watching", "Completed", "Dropped"].map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </label>

          {/* 4 action tiles */}
          <div className="grid grid-cols-4 gap-2 mt-2.5">
            <button
              onClick={() => toggleWl(numId)}
              className={`flex flex-col items-center justify-center gap-1.5 h-16 rounded-2xl border font-mono text-xs transition-colors cursor-pointer ${
                wl.has(numId) ? "text-am border-am bg-s1" : "text-white border-white/[0.08] bg-s1 hover:bg-s2"
              }`}
            >
              <Bookmark size={20} fill={wl.has(numId) ? "currentColor" : "none"} />
              Watchlist
            </button>
            <button
              onClick={() => toggleWd(numId)}
              className={`flex flex-col items-center justify-center gap-1.5 h-16 rounded-2xl border font-mono text-xs transition-colors cursor-pointer ${
                wd.has(numId) ? "text-am border-am bg-s1" : "text-white border-white/[0.08] bg-s1 hover:bg-s2"
              }`}
            >
              <Eye size={20} />
              Watched
            </button>
            <button
              onClick={() => toggleLk(numId)}
              className={`flex flex-col items-center justify-center gap-1.5 h-16 rounded-2xl border font-mono text-xs transition-colors cursor-pointer ${
                lk.has(numId) ? "text-am border-am bg-s1" : "text-white border-white/[0.08] bg-s1 hover:bg-s2"
              }`}
            >
              <Heart size={20} fill={lk.has(numId) ? "currentColor" : "none"} />
              Like
            </button>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href).catch(() => {});
                toast("Link copied");
              }}
              className="flex flex-col items-center justify-center gap-1.5 h-16 rounded-2xl bg-s1 border border-white/[0.08] text-white font-mono text-xs hover:bg-s2 transition-colors cursor-pointer"
            >
              <Share2 size={20} />
              Share
            </button>
          </div>
        </div>

        {/* Key info definition list */}
        <dl className="m-0 mt-6 max-w-[760px]">
          {[
            ["Parental rating", media.certification || "PG-13"],
            ["Released", media.releasedDate || `${media.year}`],
            ["Original language", media.originalLanguage || "EN"],
          ].map(([dt, dd]) => (
            <div key={dt} className="grid grid-cols-[130px_1fr] gap-2.5 items-center py-[11px] border-t border-white/[0.08] font-mono text-xs">
              <dt className="m-0 text-[#6B7280] text-[10px] uppercase tracking-[0.08em]">{dt}</dt>
              <dd className="m-0 text-white">{dd}</dd>
            </div>
          ))}
          {media.keywords && media.keywords.length > 0 && (
            <div className="grid grid-cols-[130px_1fr] gap-2.5 items-center py-[11px] border-t border-white/[0.08] font-mono text-xs">
              <dt className="m-0 text-[#6B7280] text-[10px] uppercase tracking-[0.08em]">Keywords</dt>
              <dd className="m-0 flex flex-wrap gap-1.5">
                {media.keywords.map((kw, kidx) => (
                  <span key={kidx} className="px-2.5 py-[3px] rounded-full bg-s2 border border-white/[0.08] text-[11px] text-t2">
                    {kw}
                  </span>
                ))}
              </dd>
            </div>
          )}
          <div className="grid grid-cols-[130px_1fr] gap-2.5 items-center py-[11px] border-t border-white/[0.08] font-mono text-xs">
            <dt className="m-0 text-[#6B7280] text-[10px] uppercase tracking-[0.08em]">Country of origin</dt>
            <dd className="m-0 text-white">{media.country.join(', ')}</dd>
          </div>
        </dl>

        {/* Cast & Studios */}
        <CastList media={media} />

        {/* Ratings */}
        <RatingGrid ratings={media.ratings} />

        {/* Reviews */}
        <ReviewSection mediaId={numId} />

        {/* More like this */}
        <RelatedTitles titles={moreTitles} />
      </div>
    </div>
  );
}
