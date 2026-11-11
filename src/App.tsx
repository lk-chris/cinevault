import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Check, ArrowRight, ArrowLeft, Star, Bookmark, Eye,
  LayoutGrid, List, Moon, SlidersHorizontal, Play,
  ChevronRight, Heart, Share2, Key, RefreshCw, X, Sparkles,
  ExternalLink, Film, Tv
} from 'lucide-react';
import {
  CinevaultMedia,
  OnboardingFilters,
  fetchDiscoverMovies,
  fetchTMDbDetails,
  validateTMDbKey,
  CURATED_MEDIA_CATALOG
} from './services/tmdb';

// ──────────────────────────────────────────────────────────────
// ONBOARDING CONFIG & CONSTANTS
// ──────────────────────────────────────────────────────────────
const GENRES_LIST = [
  "Action","Adventure","Animation","Comedy","Crime","Documentary",
  "Drama","Family","Fantasy","History","Horror","Music",
  "Mystery","Romance","Sci-Fi","Thriller","War","Western"
];

const CARD_POSTERS: Record<string, string> = {
  // Step 1: Format
  movie: 'https://image.tmdb.org/t/p/w780/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', // Oppenheimer
  tv: 'https://image.tmdb.org/t/p/w780/ggFHVNu6YYI5L9pCfOacjizRGt.jpg', // Breaking Bad
  mini: 'https://image.tmdb.org/t/p/w780/hlLXt2tOPT6RRnjiUmoxyG1LTFi.jpg', // Chernobyl
  anime: 'https://image.tmdb.org/t/p/w780/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg', // Spirited Away
  doc: 'https://image.tmdb.org/t/p/w780/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', // Interstellar

  // Step 2: Mood
  brain: 'https://image.tmdb.org/t/p/w780/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg', // Deadpool & Wolverine
  edge: 'https://image.tmdb.org/t/p/w780/62HCnUTziyWcpDaBO2i1DX17ljH.jpg', // Top Gun: Maverick
  mind: 'https://image.tmdb.org/t/p/w780/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg', // Inception
  dark: 'https://image.tmdb.org/t/p/w780/74xTEgt7R36Fpooo50r9T25onhq.jpg', // The Batman
  tear: 'https://image.tmdb.org/t/p/w780/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg', // Titanic
  blast: 'https://image.tmdb.org/t/p/w780/or06FN3Dka5tukK1e9sl16pB3iy.jpg', // Avengers: Endgame

  // Step 5: Who's watching
  solo: 'https://image.tmdb.org/t/p/w780/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg', // Blade Runner 2049
  date: 'https://image.tmdb.org/t/p/w780/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg', // Titanic
  fam: 'https://image.tmdb.org/t/p/w780/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg'  // Inside Out 2
};

const TIME_SVGS: Record<string, React.ReactNode> = {
  q: (
    <svg viewBox="0 0 48 48" className="w-10 h-10 text-am mb-2" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="24" cy="26" r="16" stroke="currentColor" strokeOpacity="0.3" />
      <path d="M24 10V6M20 6h8" />
      <path d="M35 15l2.5-2.5" />
      <path d="M24 18v8l6 3" stroke="#F59E0B" strokeWidth="2.5" />
      <path d="M16 22l-3 4h4l-2 5 6-7h-4l3-3" stroke="#F59E0B" fill="#F59E0B" fillOpacity="0.8" />
    </svg>
  ),
  s: (
    <svg viewBox="0 0 48 48" className="w-10 h-10 text-am mb-2" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeOpacity="0.3" />
      <circle cx="24" cy="24" r="3" fill="#F59E0B" />
      <path d="M24 12v12l7 4" stroke="#F59E0B" strokeWidth="2.5" />
      <circle cx="24" cy="8" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="40" cy="24" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="24" cy="40" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="8" cy="24" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  e: (
    <svg viewBox="0 0 48 48" className="w-10 h-10 text-am mb-2" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 8h20M14 40h20" stroke="currentColor" strokeWidth="2.5" />
      <path d="M17 8v6c0 5 3 8 7 10-4 2-7 5-7 10v6" stroke="currentColor" strokeOpacity="0.35" />
      <path d="M31 8v6c0 5-3 8-7 10 4 2 7 5 7 10v6" stroke="currentColor" strokeOpacity="0.35" />
      <path d="M20 35c0-3 2-5 4-5s4 2 4 5v5H20v-5z" fill="#F59E0B" fillOpacity="0.4" stroke="#F59E0B" />
      <circle cx="24" cy="16" r="1.5" fill="#F59E0B" stroke="none" />
      <circle cx="24" cy="21" r="1.2" fill="#F59E0B" stroke="none" />
    </svg>
  ),
  any: (
    <svg viewBox="0 0 48 48" className="w-10 h-10 text-am mb-2" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 30c-4.97 0-9-4.03-9-9s4.03-9 9-9c6 0 9 9 9 9s3-9 9-9c4.97 0 9 4.03 9 9s-4.03 9-9 9c-6 0-9-9-9-9s-3 9-9 9z"
        stroke="#F59E0B" strokeWidth="2.5" />
      <circle cx="15" cy="21" r="2.5" fill="#F59E0B" fillOpacity="0.6" stroke="none" />
      <circle cx="33" cy="21" r="2.5" fill="#F59E0B" fillOpacity="0.6" stroke="none" />
    </svg>
  )
};

interface StepOpt { id: string; label: string; desc?: string; }
interface StepGroup { key: string; label?: string; min: number; max: number; opts: StepOpt[]; }
interface ScreenDef { h: string; s: string; step: number; type: "tiles"|"pills"; layout?: "posters"|"svg_time"; groups: StepGroup[]; }

const SCREENS: ScreenDef[] = [
  { h: "What are you watching tonight?", s: "Choose one.", step: 1, type: "tiles", layout: "posters",
    groups: [{ key: "fmt", min: 1, max: 1, opts: [
      { id: "movie", label: "Movie", desc: "Feature film, one sitting" },
      { id: "tv",    label: "TV show", desc: "Multi-season or ongoing" },
      { id: "mini",  label: "Limited series", desc: "Self-contained, 4–8 episodes" },
      { id: "anime", label: "Anime & animation", desc: "Japanese anime or animated films" },
      { id: "doc",   label: "Documentary", desc: "True crime, biography, real world" },
    ]}]},
  { h: "What are you in the mood for?", s: "Pick up to 3. We'll tune tonight's feed to match.", step: 2, type: "tiles", layout: "posters",
    groups: [{ key: "mood", min: 1, max: 3, opts: [
      { id: "brain", label: "Brain-off", desc: "Comfort comedies, easy popcorn" },
      { id: "edge",  label: "Edge of your seat", desc: "Suspense, survival, action" },
      { id: "mind",  label: "Mind-bending", desc: "Sci-fi puzzles and twists" },
      { id: "dark",  label: "Dark & gritty", desc: "Neo-noir, crime, horror" },
      { id: "tear",  label: "Tearjerker", desc: "Emotional drama, romance" },
      { id: "blast", label: "Blockbuster", desc: "Big adrenaline, big screens" },
    ]}]},
  { h: "Which genres do you like?", s: "Pick at least 3. The more you choose, the better your feed.", step: 3, type: "pills",
    groups: [{ key: "genre", min: 3, max: 99, opts: GENRES_LIST.map(g => ({ id: g, label: g })) }]},
  { h: "How much time do you have?", s: "Choose one.", step: 4, type: "tiles", layout: "svg_time",
    groups: [{ key: "time", min: 1, max: 1, opts: [
      { id: "q",   label: "Quick watch", desc: "Under 90 minutes" },
      { id: "s",   label: "Standard",    desc: "90 to 120 minutes" },
      { id: "e",   label: "Epic",        desc: "2.5 hours or more" },
      { id: "any", label: "Any runtime", desc: "No limit" },
    ]}]},
  { h: "Who's watching?", s: "We'll filter by content rating.", step: 5, type: "tiles", layout: "posters",
    groups: [{ key: "age", min: 1, max: 1, opts: [
      { id: "solo", label: "Solo / adults only", desc: "R and mature content allowed" },
      { id: "date", label: "Date night",        desc: "PG-13 or R, thrilling or romantic" },
      { id: "fam",  label: "Family / kids safe", desc: "G, PG and PG-13 only" },
    ]}]},
  { h: "Any era or language in mind?", s: "Optional. Skip it to see everything.", step: 6, type: "pills",
    groups: [
      { key: "era", label: "Era", min: 0, max: 99, opts: [
        { id: "n", label: "New releases (2024–2026)" },
        { id: "a", label: "2010s hits" },
        { id: "b", label: "2000s nostalgia" },
        { id: "c", label: "90s classics" },
        { id: "g", label: "Golden age classics" },
      ]},
      { key: "lang", label: "Language", min: 0, max: 99, opts: [
        { id: "en",  label: "Hollywood / English" },
        { id: "ko",  label: "Korean" },
        { id: "ja",  label: "Japanese" },
        { id: "int", label: "International subtitled" },
      ]},
    ]},
];

const ALL_LABELS: Record<string,string> = {};
SCREENS.forEach(sc => sc.groups.forEach(g => g.opts.forEach(o => { ALL_LABELS[o.id] = o.label; })));
const TOTAL_STEPS = 6;
type Sel = Record<string, Set<string>>;

function initSel(): Sel {
  const s: Sel = {};
  SCREENS.forEach(sc => sc.groups.forEach(g => { s[g.key] = new Set(); }));
  return s;
}

const fm = (m: number) => `${Math.floor(m / 60)}h ${m % 60}m`;
const ini = (n: string) => n.split(" ").map(w => w[0]).join("").slice(0, 2);

type View = "onboarding" | "feed" | "detail";
type Tab = "tonight" | "wl" | "wd";

const DEFAULT_TMDB_KEY = 'a69878c434bec64f12cee0ffb2aff577';

export default function App() {
  // ─── API KEY & TMDB STATE ───
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('cinevault_tmdb_key') || import.meta.env.VITE_TMDB_API_KEY || DEFAULT_TMDB_KEY;
  });
  const [keyInput, setKeyInput] = useState<string>(apiKey);
  const [keyValidating, setKeyValidating] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);

  // ─── VIEW STATE ───
  const [view, setView] = useState<View>("onboarding");
  const [cur, setCur] = useState(0); // onboarding step index
  const [sel, setSel] = useState<Sel>(initSel);

  // ─── FEED STATE ───
  const [feedView, setFeedView] = useState<"grid"|"list">("grid");
  const [tab, setTab] = useState<Tab>("tonight");
  const [feedItems, setFeedItems] = useState<CinevaultMedia[]>(CURATED_MEDIA_CATALOG);
  const [feedLoading, setFeedLoading] = useState<boolean>(false);
  const [feedSource, setFeedSource] = useState<'tmdb' | 'curated'>('curated');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'movie' | 'tv' | 'anime'>('all');
  const [sortFilter, setSortFilter] = useState<'popularity.desc' | 'vote_average.desc' | 'primary_release_date.desc'>('popularity.desc');

  // Media Registry for Watchlist & Watched items so they persist even when query changes
  const [mediaRegistry, setMediaRegistry] = useState<Map<number, CinevaultMedia>>(() => {
    const map = new Map<number, CinevaultMedia>();
    CURATED_MEDIA_CATALOG.forEach(m => map.set(m.id, m));
    return map;
  });

  const [wl, setWl] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem('cinevault_wl');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [wd, setWd] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem('cinevault_wd');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Save watchlist & watched to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cinevault_wl', JSON.stringify(Array.from(wl)));
    } catch (e) { console.error(e); }
  }, [wl]);

  useEffect(() => {
    try {
      localStorage.setItem('cinevault_wd', JSON.stringify(Array.from(wd)));
    } catch (e) { console.error(e); }
  }, [wd]);

  // ─── DETAIL STATE ───
  const [selectedMedia, setSelectedMedia] = useState<CinevaultMedia | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [feedScrollY, setFeedScrollY] = useState(0);
  const [lk, setLk] = useState<Set<number>>(() => new Set());
  const [watchSt, setWatchSt] = useState<Record<number, string>>({});
  const [rates, setRates] = useState<Record<number, number>>({});
  const [revs, setRevs] = useState<Record<number, string[]>>({});
  const [synFull, setSynFull] = useState(false);
  const [revText, setRevText] = useState("");

  // ─── SHEET MODAL STATE ───
  const [sheetContent, setSheetContent] = useState<React.ReactNode | null>(null);

  // ─── TOAST NOTIFICATION ───
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const toast = useCallback((m: string) => {
    setToastMsg(m);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastMsg(null), 2000);
  }, []);

  // ═══════════════════════════════════
  // TMDB FETCH & QUERY CONTROLLER
  // ═══════════════════════════════════
  const loadFeed = useCallback(async (
    customFilters: Sel = sel,
    customCat: 'all' | 'movie' | 'tv' | 'anime' = categoryFilter,
    customSort = sortFilter
  ) => {
    setFeedLoading(true);
    try {
      const effectiveFilters: OnboardingFilters = {
        fmt: new Set(customFilters.fmt),
        mood: new Set(customFilters.mood),
        genre: new Set(customFilters.genre),
        time: new Set(customFilters.time),
        age: new Set(customFilters.age),
        era: new Set(customFilters.era),
        lang: new Set(customFilters.lang),
      };

      let overrideType: 'movie' | 'tv' | undefined = undefined;
      if (customCat === 'movie') overrideType = 'movie';
      if (customCat === 'tv') overrideType = 'tv';
      if (customCat === 'anime') {
        effectiveFilters.fmt.add('anime');
      }

      const res = await fetchDiscoverMovies(
        apiKey,
        effectiveFilters,
        1,
        overrideType,
        customSort
      );

      setFeedItems(res.results);
      setFeedSource(res.source);

      // Register fetched items in mediaRegistry
      setMediaRegistry(prev => {
        const next = new Map(prev);
        res.results.forEach(item => next.set(item.id, item));
        return next;
      });
    } catch (err: any) {
      console.error('Failed to load feed:', err);
      toast('Using curated feed preview');
    } finally {
      setFeedLoading(false);
    }
  }, [apiKey, sel, categoryFilter, sortFilter, toast]);

  // When switching to feed or changing category/sort, refresh feed
  useEffect(() => {
    if (view === "feed") {
      loadFeed();
    }
  }, [view, apiKey, categoryFilter, sortFilter]);

  // ═══════════════════════════════════
  // ONBOARDING HELPERS
  // ═══════════════════════════════════
  const sc = cur < SCREENS.length ? SCREENS[cur] : null;

  const toggle = (gKey: string, optId: string, max: number) => {
    setSel(prev => {
      const s = new Set(prev[gKey]);
      if (s.has(optId)) { s.delete(optId); }
      else if (max === 1) { s.clear(); s.add(optId); }
      else if (s.size >= max) { toast(`You can pick up to ${max}`); return prev; }
      else { s.add(optId); }
      return { ...prev, [gKey]: s };
    });
  };

  const stepValid = () => {
    if (!sc) return true;
    return sc.groups.every(g => sel[g.key].size >= g.min);
  };

  const goText = () => {
    if (cur >= SCREENS.length) return "Open my feed";
    if (cur === SCREENS.length - 1) return "Curate my feed";
    return "Continue";
  };

  const showFeed = (customTab: Tab = "tonight") => {
    setView("feed");
    setTab(customTab);
    scrollTo(0, 0);
  };

  const next = () => {
    if (cur < SCREENS.length) {
      setCur(c => c + 1);
    } else {
      showFeed();
      loadFeed();
    }
    scrollTo(0, 0);
  };

  const back = () => { if (cur > 0) setCur(c => c - 1); scrollTo(0, 0); };
  const skip = () => { setCur(c => c + 1); scrollTo(0, 0); };

  // ═══════════════════════════════════
  // DETAIL CONTROLLER (ENRICH WITH TMDB)
  // ═══════════════════════════════════
  const openDetail = async (media: CinevaultMedia) => {
    setFeedScrollY(window.scrollY);
    setSelectedMedia(media);
    setSynFull(false);
    setRevText("");
    setView("detail");
    scrollTo(0, 0);

    // If an API key is available and cast or trailer is missing, enrich from TMDb
    if (apiKey.trim() && (!media.trailerKey || media.cast.length === 0)) {
      setDetailLoading(true);
      try {
        const enriched = await fetchTMDbDetails(apiKey, media.id, media.type);
        setSelectedMedia(prev => prev ? { ...prev, ...enriched } : prev);
        setMediaRegistry(prev => {
          const next = new Map(prev);
          const current = next.get(media.id);
          if (current) next.set(media.id, { ...current, ...enriched });
          return next;
        });
      } catch (e) {
        console.warn('Could not enrich TMDb details:', e);
      } finally {
        setDetailLoading(false);
      }
    }
  };

  const closeDetail = () => {
    setView("feed");
    setTimeout(() => window.scrollTo(0, feedScrollY), 0);
  };

  const openVibe = () => {
    setView("onboarding");
    setCur(0);
    scrollTo(0, 0);
  };

  const toggleWl = (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setWl(prev => {
      const n = new Set(prev);
      if (n.has(id)) { n.delete(id); toast("Removed from watchlist"); }
      else { n.add(id); toast("Added to watchlist"); }
      return n;
    });
  };

  const toggleWd = (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setWd(prev => {
      const n = new Set(prev);
      if (n.has(id)) { n.delete(id); toast("Unmarked"); }
      else { n.add(id); toast("Marked as watched"); }
      return n;
    });
  };

  // ═══════════════════════════════════
  // API KEY SETTING DIALOG
  // ═══════════════════════════════════
  const handleSaveApiKey = async () => {
    const trimmed = keyInput.trim();
    if (!trimmed) {
      setApiKey('');
      localStorage.removeItem('cinevault_tmdb_key');
      setShowKeyModal(false);
      toast('Switched to Curated Preview feed');
      loadFeed();
      return;
    }

    setKeyValidating(true);
    setKeyError(null);

    const test = await validateTMDbKey(trimmed);
    setKeyValidating(false);

    if (test.valid) {
      setApiKey(trimmed);
      localStorage.setItem('cinevault_tmdb_key', trimmed);
      setShowKeyModal(false);
      toast('TMDb API Connected!');
      loadFeed();
    } else {
      setKeyError(test.error || 'Invalid TMDb API Key');
    }
  };

  // ═══════════════════════════════════
  // REUSABLE BOTTOM NAVIGATION BAR
  // ═══════════════════════════════════
  const renderBottomNav = (activeItem: "tonight" | "wl" | "wd" | "vibe") => (
    <nav className="fixed left-0 right-0 bottom-0 flex justify-around bg-[#141519]/[0.96] border-t border-white/[0.08] py-2 pb-[calc(8px+env(safe-area-inset-bottom,0px))] z-40 backdrop-blur-md">
      {([["tonight","Tonight",<Moon size={20}/>],["wl","Watchlist",<Bookmark size={20}/>],["wd","Watched",<Eye size={20}/>]] as [Tab,string,React.ReactNode][]).map(([k,lbl,icon]) => (
        <button key={k} onClick={() => showFeed(k)}
          className={`relative flex flex-col items-center gap-1 font-mono text-[11px] min-w-[64px] transition-colors ${activeItem === k ? "text-white font-medium" : "text-t2 hover:text-white"}`}>
          {icon}
          {k === "wl" && wl.size > 0 && (
            <i className="absolute -top-1 left-[calc(50%+5px)] min-w-4 h-4 px-1 rounded-full bg-am text-[#111] font-mono font-medium text-[10px] leading-4 text-center not-italic">{wl.size}</i>
          )}
          {k === "wd" && wd.size > 0 && (
            <i className="absolute -top-1 left-[calc(50%+5px)] min-w-4 h-4 px-1 rounded-full bg-white/20 text-white font-mono font-medium text-[10px] leading-4 text-center not-italic">{wd.size}</i>
          )}
          {lbl}
        </button>
      ))}
      <button onClick={openVibe} className={`flex flex-col items-center gap-1 font-mono text-[11px] min-w-[64px] transition-colors ${activeItem === "vibe" ? "text-am font-medium" : "text-t2 hover:text-white"}`}>
        <SlidersHorizontal size={20} />Vibe
      </button>
    </nav>
  );

  // ═══════════════════════════════════
  // RENDER: ONBOARDING / VIBE CREATOR
  // ═══════════════════════════════════
  const renderOnboarding = () => (
    <div className="min-h-screen bg-bg text-white flex flex-col">
      {/* Sticky Top Header: Brand, Skip, Progress Bar (locks to top while scrolling) */}
      <header className="sticky top-0 z-30 bg-[#0A0A0C]/95 backdrop-blur-md border-b border-white/[0.08] px-[18px] pt-[max(14px,env(safe-area-inset-top))] pb-3">
        <div className="w-full max-w-[760px] mx-auto">
          <div className="flex items-center justify-between">
            <div className="text-xl font-light tracking-tight">Cine<b className="text-am font-bold">Vault</b></div>
            {sc && (
              <button onClick={skip} className="text-t2 text-sm py-1 px-3 rounded-full hover:text-white hover:bg-white/[0.08] transition-colors">
                Skip
              </button>
            )}
          </div>

          {/* Progress Bar Segments */}
          <div className="flex gap-1.5 mt-3">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <i key={i} className={`flex-1 h-1 rounded-full not-italic transition-colors ${i < (sc ? sc.step : TOTAL_STEPS) ? "bg-am" : "bg-s2"}`} />
            ))}
          </div>
        </div>
      </header>

      {/* Main scrolling content (pushes smoothly under sticky header) */}
      <div className="w-full max-w-[760px] mx-auto px-[18px] pt-6 pb-[160px] flex-1">
        {/* heading */}
        <h1 className="text-[clamp(28px,6.5vw,42px)] font-bold leading-[1.05] tracking-tight mb-2">
          {sc ? sc.h : "Here's your vibe for tonight"}
        </h1>
        <p className="text-t2 text-base mb-6">
          {sc ? sc.s : "We'll curate your feed from these picks."}
        </p>

        {sc ? (
          /* Step content */
          <div className="space-y-6">
            {sc.groups.map(g => (
              <div key={g.key}>
                {g.label && <div className="text-t2 text-sm mb-2.5">{g.label}</div>}

                {/* POSTER TILES (Format, Mood, Who's watching) */}
                {sc.type === "tiles" && sc.layout === "posters" && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {g.opts.map((o) => {
                      const on = sel[g.key].has(o.id);
                      const posterUrl = CARD_POSTERS[o.id];

                      return (
                        <button
                          key={o.id}
                          onClick={() => toggle(g.key, o.id, g.max)}
                          className={`relative text-left p-3.5 rounded-[20px] overflow-hidden flex flex-col justify-end border transition-all active:scale-[0.98] group bg-s2 aspect-[2/3] ${
                            on
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
                          <span className={`absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full grid place-items-center border transition-colors ${
                            on ? "bg-am border-am text-[#111]" : "bg-[#0A0A0C]/65 border-white/30 text-transparent"
                          }`}>
                            <Check size={15} strokeWidth={3} className={on ? "opacity-100" : "opacity-0"} />
                          </span>

                          {/* Label and description */}
                          <div className="relative z-10">
                            <b className="block text-base md:text-lg font-bold leading-tight drop-shadow">{o.label}</b>
                            {o.desc && (
                              <small className="block text-gray-300 text-xs mt-1 opacity-90 leading-snug drop-shadow line-clamp-2">
                                {o.desc}
                              </small>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* SVG TIME TILES (Step 4 - How much time do you have?) */}
                {sc.type === "tiles" && sc.layout === "svg_time" && (
                  <div className="grid grid-cols-2 gap-3">
                    {g.opts.map((o) => {
                      const on = sel[g.key].has(o.id);
                      const svgIcon = TIME_SVGS[o.id];

                      return (
                        <button
                          key={o.id}
                          onClick={() => toggle(g.key, o.id, g.max)}
                          className={`relative text-left p-4 rounded-[20px] overflow-hidden flex flex-col justify-between border transition-all active:scale-[0.98] bg-s1 min-h-[140px] ${
                            on
                              ? "border-am ring-2 ring-am ring-offset-2 ring-offset-[#0A0A0C] bg-[#1C1D22]"
                              : "border-white/[0.08] hover:border-white/20 hover:bg-s2"
                          }`}
                        >
                          <div className="flex items-start justify-between w-full">
                            <div>{svgIcon}</div>
                            <span className={`w-6 h-6 rounded-full grid place-items-center border transition-colors ${
                              on ? "bg-am border-am text-[#111]" : "bg-[#0A0A0C]/50 border-white/20 text-transparent"
                            }`}>
                              <Check size={14} strokeWidth={3} className={on ? "opacity-100" : "opacity-0"} />
                            </span>
                          </div>

                          <div>
                            <b className="block text-base font-bold leading-tight text-white">{o.label}</b>
                            {o.desc && (
                              <small className="block text-[#9CA3AF] text-xs mt-1 leading-snug">
                                {o.desc}
                              </small>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* PILLS LAYOUT (Genres, Eras, Languages) */}
                {sc.type === "pills" && (
                  <div className="flex flex-wrap gap-2.5">
                    {g.opts.map(o => {
                      const on = sel[g.key].has(o.id);
                      return (
                        <button key={o.id} onClick={() => toggle(g.key, o.id, g.max)}
                          className={`inline-flex items-center h-12 px-[22px] rounded-full text-base font-medium transition-all active:scale-[0.96] border ${
                            on ? "bg-am border-am text-[#111] font-semibold" : "bg-s1 border-white/[0.08] text-gray-300 hover:bg-s3"
                          }`}>{o.label}</button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Summary chips */
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2.5">
              {["fmt","mood","genre","time","age","era","lang"].flatMap(k =>
                Array.from(sel[k]).map(v => (
                  <span key={`${k}-${v}`} className="py-2.5 px-[18px] rounded-full bg-am/[0.12] text-am border border-am/30 text-[15px]">
                    {ALL_LABELS[v] || v}
                  </span>
                ))
              )}
            </div>

            <div className="p-4 rounded-2xl bg-s1 border border-white/[0.08] flex items-center justify-between">
              <div>
                <b className="block text-sm font-semibold">TMDb Integration Active</b>
                <span className="text-xs text-t2">Your feed will query The Movie Database API based on these filters.</span>
              </div>
              <button
                onClick={() => setShowKeyModal(true)}
                className="py-1.5 px-3 rounded-full bg-s2 border border-white/10 text-xs font-mono text-am hover:bg-s3"
              >
                {apiKey ? 'API Key Set' : 'Configure Key'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Unified Fixed Bottom Bar (Action row + Nav bar, ZERO clipping) */}
      <div className="fixed left-0 right-0 bottom-0 z-40 bg-[#141519]/[0.98] border-t border-white/[0.08] backdrop-blur-md">
        {/* Onboarding Action Row: Back & Continue */}
        <div className="w-full max-w-[760px] mx-auto px-4 py-2.5 flex items-center justify-between">
          {cur > 0 ? (
            <button
              onClick={back}
              className="py-2.5 px-5 rounded-full bg-s2 border border-white/[0.08] text-sm text-white hover:bg-s3 transition-colors flex items-center gap-1.5 active:scale-95"
            >
              <ArrowLeft size={16} /> Back
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={next}
            disabled={!stepValid()}
            className={`py-2.5 px-7 rounded-full font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 active:scale-95 ${
              stepValid()
                ? "bg-am text-[#111] hover:brightness-110 shadow-lg shadow-am/10"
                : "bg-s2 text-[#6B7280] cursor-not-allowed"
            }`}
          >
            {goText()} <ArrowRight size={16} />
          </button>
        </div>

        {/* Persistent Bottom Nav below action row */}
        <nav className="flex justify-around border-t border-white/[0.06] py-1.5 pb-[calc(6px+env(safe-area-inset-bottom,0px))]">
          {([["tonight","Tonight",<Moon size={19}/>],["wl","Watchlist",<Bookmark size={19}/>],["wd","Watched",<Eye size={19}/>]] as [Tab,string,React.ReactNode][]).map(([k,lbl,icon]) => (
            <button
              key={k}
              onClick={() => showFeed(k)}
              className="relative flex flex-col items-center gap-0.5 font-mono text-[10px] min-w-[60px] text-t2 hover:text-white transition-colors"
            >
              {icon}
              {k === "wl" && wl.size > 0 && (
                <i className="absolute -top-1 left-[calc(50%+5px)] min-w-4 h-4 px-1 rounded-full bg-am text-[#111] font-mono font-medium text-[9px] leading-4 text-center not-italic">{wl.size}</i>
              )}
              {k === "wd" && wd.size > 0 && (
                <i className="absolute -top-1 left-[calc(50%+5px)] min-w-4 h-4 px-1 rounded-full bg-white/20 text-white font-mono font-medium text-[9px] leading-4 text-center not-italic">{wd.size}</i>
              )}
              {lbl}
            </button>
          ))}
          <button
            onClick={openVibe}
            className="flex flex-col items-center gap-0.5 font-mono text-[10px] min-w-[60px] text-am font-medium transition-colors"
          >
            <SlidersHorizontal size={19} />Vibe
          </button>
        </nav>
      </div>
    </div>
  );

  // ═══════════════════════════════════
  // RENDER: FEED
  // ═══════════════════════════════════
  const HEAD: Record<Tab, string> = { tonight: "Tonight's shortlist", wl: "Your watchlist", wd: "Watched" };
  const EMP: Record<string, [string, string]> = {
    wl: ["Nothing saved yet", "Tap the bookmark on any pick in tonight's feed to keep it here."],
    wd: ["Nothing watched yet", "Tap the eye on a title you've already seen."]
  };

  // Derive current items to display
  let currentList: CinevaultMedia[] = [];
  if (tab === "tonight") {
    currentList = feedItems;
  } else if (tab === "wl") {
    currentList = Array.from(wl).map(id => mediaRegistry.get(id)).filter(Boolean) as CinevaultMedia[];
  } else if (tab === "wd") {
    currentList = Array.from(wd).map(id => mediaRegistry.get(id)).filter(Boolean) as CinevaultMedia[];
  }

  // Active filters summary badges
  const activeVibePills = ["fmt", "mood", "genre", "time", "age"].flatMap(k =>
    Array.from(sel[k]).slice(0, 2).map(v => ALL_LABELS[v] || v)
  );

  const renderFeed = () => (
    <div className="min-h-screen bg-bg text-white pb-24">
      <div className="max-w-[1100px] mx-auto px-4 pt-5">
        {/* Top brand & TMDb Status Row */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-light tracking-tight">Cine<b className="text-am font-bold">Vault</b></span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-s1 border border-white/[0.08] text-t2 font-mono">
              TMDB Feed
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowKeyModal(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border transition-all ${
                apiKey
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/40"
                  : "bg-am/10 border-am/30 text-am hover:bg-am/20"
              }`}
            >
              <Key size={13} />
              {apiKey ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  TMDb Live
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-am" />
                  Connect TMDb
                </>
              )}
            </button>

            <button
              onClick={() => loadFeed()}
              disabled={feedLoading}
              title="Refresh feed"
              className="w-8 h-8 rounded-full bg-s1 border border-white/[0.08] grid place-items-center text-t2 hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={feedLoading ? "animate-spin text-am" : ""} />
            </button>
          </div>
        </div>

        {/* Tab Heading & Count */}
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div className="flex items-baseline gap-3">
            <h2 className="text-2xl font-bold tracking-tight m-0">{HEAD[tab]}</h2>
            <span className="font-mono text-[13px] text-t2">
              {feedLoading ? 'Searching...' : `${currentList.length} ${currentList.length === 1 ? 'title' : 'titles'}`}
            </span>
          </div>

          {/* View toggle (Grid / List) */}
          <div className="inline-flex p-[1px] rounded-full border border-white/[0.08] bg-s1">
            <button onClick={() => setFeedView("list")} className={`w-9 h-9 rounded-full grid place-items-center transition-colors ${feedView === "list" ? "bg-[#f4efe6] text-[#111]" : "text-t2"}`}>
              <List size={18} />
            </button>
            <button onClick={() => setFeedView("grid")} className={`w-9 h-9 rounded-full grid place-items-center transition-colors ${feedView === "grid" ? "bg-[#f4efe6] text-[#111]" : "text-t2"}`}>
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>

        {/* Tonight's active vibe pills bar (only in Tonight tab) */}
        {tab === "tonight" && (
          <div className="mt-3 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1">
            <div className="flex items-center gap-1.5 flex-nowrap">
              <span className="text-xs font-mono text-t2 mr-1">Vibe:</span>
              {activeVibePills.length > 0 ? (
                activeVibePills.map((pill, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-s1 border border-white/[0.08] text-gray-300 whitespace-nowrap">
                    {pill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-t2">All genres</span>
              )}
            </div>

            <button
              onClick={openVibe}
              className="flex items-center gap-1 text-xs text-am font-mono hover:underline whitespace-nowrap pl-2"
            >
              <SlidersHorizontal size={13} /> Edit vibe
            </button>
          </div>
        )}

        {/* In-feed Category & Sort filters (only in Tonight tab) */}
        {tab === "tonight" && (
          <div className="flex items-center justify-between gap-3 mt-3 mb-5 flex-wrap">
            {/* Format filters */}
            <div className="flex items-center gap-1.5">
              {[
                { id: 'all', label: 'All' },
                { id: 'movie', label: 'Movies' },
                { id: 'tv', label: 'TV Shows' },
                { id: 'anime', label: 'Anime' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id as any)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                    categoryFilter === cat.id
                      ? "bg-am text-[#111] border-am font-semibold"
                      : "bg-s1 border-white/[0.08] text-t2 hover:text-white"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Sort selector */}
            <div className="flex items-center gap-1.5 font-mono text-xs text-t2">
              <span>Sort:</span>
              <select
                value={sortFilter}
                onChange={e => setSortFilter(e.target.value as any)}
                className="bg-s1 border border-white/[0.08] rounded-full px-2.5 py-1 text-xs text-white focus:outline-none focus:border-am"
              >
                <option value="popularity.desc">Popularity</option>
                <option value="vote_average.desc">Highest Rated</option>
                <option value="primary_release_date.desc">Newest Releases</option>
              </select>
            </div>
          </div>
        )}

        {/* Loading Skeleton State */}
        {feedLoading && currentList.length === 0 ? (
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
          <div className="p-7 border border-dashed border-white/[0.08] rounded-2xl text-t2 text-sm">
            <b className="block text-white text-[17px] mb-1">{EMP[tab]?.[0] ?? "No titles found"}</b>
            <p className="m-0 mb-3">{EMP[tab]?.[1] ?? "Try adjusting your vibe filters or category selection."}</p>
            {tab === "tonight" && (
              <button
                onClick={openVibe}
                className="py-1.5 px-4 rounded-full bg-am text-[#111] font-bold text-xs"
              >
                Customize vibe
              </button>
            )}
          </div>
        ) : feedView === "grid" ? (
          /* GRID VIEW - 2:3 aspect ratio portrait cards */
          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-x-3 gap-y-4">
            {currentList.map(item => (
              <div key={item.id} className="cursor-pointer group" onClick={() => openDetail(item)}>
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
            ))}
          </div>
        ) : (
          /* LIST VIEW */
          <div>
            {currentList.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => openDetail(item)}
                className={`flex gap-4 py-3.5 cursor-pointer group ${idx > 0 ? "border-t border-white/[0.08]" : ""}`}
              >
                <div className="flex-shrink-0 w-[65px] h-[98px] rounded-xl overflow-hidden bg-s2 border border-white/[0.08]">
                  {item.posterUrl ? (
                    <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover object-center" loading="lazy" />
                  ) : (
                    <div className="w-full h-full bg-s3 grid place-items-center text-[10px] p-1 text-center font-bold">{item.title}</div>
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
            ))}
          </div>
        )}
      </div>

      {/* Persistent Bottom Nav */}
      {renderBottomNav(tab)}
    </div>
  );

  // ═══════════════════════════════════
  // RENDER: DETAIL VIEW
  // ═══════════════════════════════════
  const renderDetail = () => {
    if (!selectedMedia) return null;
    const item = selectedMedia;
    const i = item.id;

    const openTrailerSheet = () => {
      setSheetContent(
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold m-0">{item.title}</h3>
              <p className="text-xs font-mono text-t2 m-0">Official Trailer</p>
            </div>
            <button onClick={() => setSheetContent(null)} className="w-8 h-8 rounded-full bg-s2 grid place-items-center text-t2 hover:text-white">
              <X size={16} />
            </button>
          </div>

          {item.trailerKey ? (
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black mb-3 border border-white/10">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${item.trailerKey}?autoplay=1`}
                title={`${item.title} Trailer`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="aspect-video rounded-xl bg-gradient-to-br from-[#2b2b2f] to-[#050506] grid place-items-center mb-3">
              <div className="text-center p-4">
                <Play size={34} className="text-am mx-auto mb-2 opacity-80" />
                <p className="text-xs text-t2 m-0">Trailer video not attached. Add TMDb API key to fetch official trailers.</p>
              </div>
            </div>
          )}

          {item.trailerKey && (
            <div className="flex items-center justify-between text-xs text-t2 font-mono">
              <span>Source: YouTube</span>
              <a
                href={`https://www.youtube.com/watch?v=${item.trailerKey}`}
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

    const openWatchSheet = () => {
      const providers = item.watchProviders || {
        stream: ['Northlight+', 'Netflix'],
        rent: ['Apple TV', 'Amazon Video'],
        buy: ['Apple TV', 'Amazon Video'],
      };

      setSheetContent(
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold m-0">Where to watch</h3>
              <p className="text-xs font-mono text-t2 m-0">Streaming availability from JustWatch & TMDb</p>
            </div>
            <button onClick={() => setSheetContent(null)} className="w-8 h-8 rounded-full bg-s2 grid place-items-center text-t2 hover:text-white">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-3 mt-4">
            {providers.stream && providers.stream.length > 0 && (
              <div className="py-2 border-t border-white/[0.08]">
                <span className="text-xs font-mono text-am uppercase tracking-wider block mb-1">Stream</span>
                <div className="flex flex-wrap gap-1.5">
                  {providers.stream.map((s, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full bg-s2 border border-white/10 text-xs font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {providers.rent && providers.rent.length > 0 && (
              <div className="py-2 border-t border-white/[0.08]">
                <span className="text-xs font-mono text-t2 uppercase tracking-wider block mb-1">Rent</span>
                <div className="flex flex-wrap gap-1.5">
                  {providers.rent.map((s, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full bg-s2 border border-white/10 text-xs text-gray-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {providers.buy && providers.buy.length > 0 && (
              <div className="py-2 border-t border-white/[0.08]">
                <span className="text-xs font-mono text-t2 uppercase tracking-wider block mb-1">Buy</span>
                <div className="flex flex-wrap gap-1.5">
                  {providers.buy.map((s, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full bg-s2 border border-white/10 text-xs text-gray-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    };

    const handlePostReview = () => {
      const v = revText.trim();
      if (!v) { toast("Write something first"); return; }
      setRevs(prev => ({ ...prev, [i]: [v.replace(/</g, "&lt;"), ...(prev[i] || [])] }));
      setRevText("");
      toast("Review posted");
    };

    const moreTitles = feedItems.filter(y => y.id !== item.id).slice(0, 6);

    return (
      <div className="min-h-screen bg-bg text-white pb-12">
        <div className="max-w-[1100px] mx-auto px-4">
          {/* Top navigation row */}
          <div className="py-3 flex items-center justify-between">
            <button
              onClick={closeDetail}
              className="w-10 h-10 rounded-full bg-s1 border border-white/[0.08] grid place-items-center backdrop-blur-md hover:bg-s2 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>

            {detailLoading && (
              <span className="text-xs font-mono text-am flex items-center gap-1.5">
                <RefreshCw size={12} className="animate-spin" /> Fetching TMDb details...
              </span>
            )}
          </div>

          {/* Backdrop Hero Banner */}
          <div className="relative h-[clamp(240px,38vw,420px)] -mx-4 rounded-b-[24px] overflow-hidden bg-s2 mb-2 border-b border-white/[0.08]">
            {item.backdropUrl || item.posterUrl ? (
              <img
                src={item.backdropUrl || item.posterUrl}
                alt={item.title}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-s3 to-s1" />
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-black/30 pointer-events-none" />

            {/* Play Trailer Floating Button */}
            <button
              onClick={openTrailerSheet}
              className="absolute top-4 right-4 z-10 inline-flex items-center gap-2 h-10 px-[18px] rounded-full bg-[#0A0A0C]/75 backdrop-blur-lg border border-white/[0.14] font-mono text-sm text-white hover:bg-white/20 transition-colors shadow-lg"
            >
              <Play size={16} fill="currentColor" /> Play trailer
            </button>
          </div>

          {/* Title & Metadata */}
          <div className="max-w-[760px]">
            <h1 className="text-[30px] font-bold tracking-tight leading-[1.05] mt-4 mb-3 m-0">
              {item.title}
            </h1>

            <p className={`text-sm leading-relaxed text-t2 m-0 ${synFull ? "" : "line-clamp-4"}`}>
              {item.synopsis}
            </p>
            <button onClick={() => setSynFull(p => !p)} className="text-am font-mono text-xs mt-1 mb-4 block hover:underline">
              {synFull ? "Show less" : "Read more"}
            </button>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2.5 font-mono text-[13px] text-t2 mb-1.5">
              <span className="inline-flex items-center h-[22px] px-3 rounded-full bg-s1 border border-white/[0.08] text-xs text-t2">
                {item.type === "tv" ? "TV Show" : "Movie"}
              </span>
              <b className="inline-flex items-center gap-1 font-normal text-white text-[13px]">
                <Star size={14} fill="var(--am)" stroke="var(--am)" />{item.rating}
              </b>
              <i className="text-[#6B7280] not-italic">·</i>
              <span>{item.year}</span>
              <i className="text-[#6B7280] not-italic">·</i>
              <span>{item.type === "tv" ? (item.seasons ? `${item.seasons} season${item.seasons > 1 ? 's' : ''}` : 'TV Series') : fm(item.runtimeMinutes)}</span>
              {item.episodes && <><i className="text-[#6B7280] not-italic">·</i><span>{item.episodes} episodes</span></>}
            </div>

            <div className="font-mono text-[13px] text-t2 mt-1.5 mb-5">
              {item.genres.join(', ')}
            </div>

            {/* Where to Watch Button */}
            <button
              onClick={openWatchSheet}
              className="w-full h-[45px] rounded-full bg-white text-[#111] font-semibold text-sm inline-flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors mb-2.5 font-mono"
            >
              <Play size={16} fill="currentColor" /> Where to watch
            </button>

            {/* Watch status dropdown */}
            <label className="relative flex items-center gap-2.5 h-11 px-[18px] rounded-full bg-s1 border border-white/[0.08] font-mono text-sm my-2.5 cursor-pointer hover:border-white/20 transition-colors">
              <span>Watch status</span>
              <span className="ml-auto text-t2">{watchSt[i] || "Not set"}</span>
              <ChevronRight size={16} className="text-t2" />
              <select
                value={watchSt[i] || ""}
                onChange={e => {
                  const v = e.target.value;
                  setWatchSt(p => { const u = { ...p }; if (v) u[i] = v; else delete u[i]; return u; });
                  if (v === "Completed") setWd(p => new Set(p).add(i));
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              >
                <option value="">Not set</option>
                {["Plan to watch","Watching","Completed","Dropped"].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>

            {/* 4 action tiles */}
            <div className="grid grid-cols-4 gap-2 mt-2.5">
              <button
                onClick={() => toggleWl(i)}
                className={`flex flex-col items-center justify-center gap-1.5 h-16 rounded-2xl border font-mono text-xs transition-colors ${
                  wl.has(i) ? "text-am border-am bg-s1" : "text-white border-white/[0.08] bg-s1 hover:bg-s2"
                }`}
              >
                <Bookmark size={20} fill={wl.has(i) ? "currentColor" : "none"} />
                Watchlist
              </button>
              <button
                onClick={() => toggleWd(i)}
                className={`flex flex-col items-center justify-center gap-1.5 h-16 rounded-2xl border font-mono text-xs transition-colors ${
                  wd.has(i) ? "text-am border-am bg-s1" : "text-white border-white/[0.08] bg-s1 hover:bg-s2"
                }`}
              >
                <Eye size={20} />
                Watched
              </button>
              <button
                onClick={() => setLk(p => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n; })}
                className={`flex flex-col items-center justify-center gap-1.5 h-16 rounded-2xl border font-mono text-xs transition-colors ${
                  lk.has(i) ? "text-am border-am bg-s1" : "text-white border-white/[0.08] bg-s1 hover:bg-s2"
                }`}
              >
                <Heart size={20} fill={lk.has(i) ? "currentColor" : "none"} />
                Like
              </button>
              <button
                onClick={() => { navigator.clipboard?.writeText(window.location.href).catch(() => {}); toast("Link copied"); }}
                className="flex flex-col items-center justify-center gap-1.5 h-16 rounded-2xl bg-s1 border border-white/[0.08] text-white font-mono text-xs hover:bg-s2 transition-colors"
              >
                <Share2 size={20} />
                Share
              </button>
            </div>
          </div>

          {/* Key info definition list */}
          <dl className="m-0 mt-6 max-w-[760px]">
            {[
              ["Parental rating", item.certification || "PG-13"],
              ["Released", item.releasedDate || `${item.year}`],
              ["Original language", item.originalLanguage || "EN"],
            ].map(([dt, dd]) => (
              <div key={dt} className="grid grid-cols-[130px_1fr] gap-2.5 items-center py-[11px] border-t border-white/[0.08] font-mono text-xs">
                <dt className="m-0 text-[#6B7280] text-[10px] uppercase tracking-[0.08em]">{dt}</dt>
                <dd className="m-0 text-white">{dd}</dd>
              </div>
            ))}
            {item.keywords && item.keywords.length > 0 && (
              <div className="grid grid-cols-[130px_1fr] gap-2.5 items-center py-[11px] border-t border-white/[0.08] font-mono text-xs">
                <dt className="m-0 text-[#6B7280] text-[10px] uppercase tracking-[0.08em]">Keywords</dt>
                <dd className="m-0 flex flex-wrap gap-1.5">
                  {item.keywords.map((kw, kidx) => (
                    <span key={kidx} className="px-2.5 py-[3px] rounded-full bg-s2 border border-white/[0.08] text-[11px] text-t2">
                      {kw}
                    </span>
                  ))}
                </dd>
              </div>
            )}
            <div className="grid grid-cols-[130px_1fr] gap-2.5 items-center py-[11px] border-t border-white/[0.08] font-mono text-xs">
              <dt className="m-0 text-[#6B7280] text-[10px] uppercase tracking-[0.08em]">Country of origin</dt>
              <dd className="m-0 text-white">{item.country.join(', ')}</dd>
            </div>
          </dl>

          {/* Cast & Director Section */}
          <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr] gap-8 mt-7">
            <div>
              {/* Director */}
              <div className="text-sm font-semibold pl-2 border-l-[3px] border-white leading-none mt-7 mb-3">
                {item.type === "tv" ? "Creator / Showrunner" : "Director"}
              </div>
              <div className="w-[120px]">
                <div className="aspect-square rounded-xl bg-s2 border border-white/[0.08] grid place-items-center font-bold text-[22px] text-white/85">
                  {ini(item.director)}
                </div>
                <div className="text-xs font-semibold leading-snug mt-1.5 truncate">{item.director}</div>
                <div className="text-[11px] text-t2 font-mono">{item.type === "tv" ? "Creator" : "Director"}</div>
              </div>
            </div>

            {/* Studios */}
            <div className="md:row-start-1 md:col-start-2">
              <div className="text-sm font-semibold pl-2 border-l-[3px] border-white leading-none mt-7 mb-3">Studios</div>
              <div className="space-y-2">
                {item.studios.slice(0, 3).map((stu, si) => (
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
                {item.cast.slice(0, 5).map((actor, k) => (
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
                {item.cast.length > 5 && (
                  <div className="aspect-square rounded-xl bg-s2 border border-white/[0.08] grid place-items-center font-mono text-[13px] text-t2">
                    +{item.cast.length - 5} more
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ratings */}
          <div className="text-sm font-semibold pl-2 border-l-[3px] border-white leading-none mt-8 mb-3">How it's rated</div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2">
            <div className="p-3 rounded-xl bg-s1 border border-white/[0.08]">
              <b className="text-2xl font-semibold leading-none block text-[#2dd4bf]">{item.ratings.tmdb}<small className="text-[11px] text-t2 font-normal"> /10</small></b>
              <span className="block mt-1.5 font-mono text-[10px] text-t2 uppercase tracking-[0.06em]">TMDb score</span>
            </div>
            <div className="p-3 rounded-xl bg-s1 border border-white/[0.08]">
              <b className="text-2xl font-semibold leading-none block text-white">{item.ratings.tmdbVotes}</b>
              <span className="block mt-1.5 font-mono text-[10px] text-t2 uppercase tracking-[0.06em]">TMDb votes</span>
            </div>
            {item.ratings.imdb && item.ratings.imdb !== 'NR' && (
              <div className="p-3 rounded-xl bg-s1 border border-white/[0.08]">
                <b className="text-2xl font-semibold leading-none block text-am">{item.ratings.imdb}<small className="text-[11px] text-t2 font-normal"> /10</small></b>
                <span className="block mt-1.5 font-mono text-[10px] text-t2 uppercase tracking-[0.06em]">IMDb</span>
              </div>
            )}
            {item.ratings.rotten && item.ratings.rotten !== 'NR' && (
              <div className="p-3 rounded-xl bg-s1 border border-white/[0.08]">
                <b className="text-2xl font-semibold leading-none block text-[#f2683c]">{item.ratings.rotten}</b>
                <span className="block mt-1.5 font-mono text-[10px] text-t2 uppercase tracking-[0.06em]">Rotten Tomatoes</span>
              </div>
            )}
          </div>
          <div className="mt-2 font-mono text-[11px] text-[#6B7280]">
            Scores from TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.
          </div>

          {/* User Reviews Module */}
          <div className="text-sm font-semibold pl-2 border-l-[3px] border-white leading-none mt-8 mb-3">Reviews & Rating</div>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-3">
            <div className="bg-s1 rounded-2xl p-4 border border-white/[0.08]">
              <div className="text-sm font-semibold text-center">Rate this title</div>
              <div className="flex justify-center gap-1.5 mt-3">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setRates(p => ({ ...p, [i]: n }))}
                    className={`transition-colors ${(rates[i] || 0) >= n ? "text-am" : "text-s3 hover:text-am/50"}`}>
                    <Star size={30} fill="currentColor" />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-s1 rounded-2xl p-4 border border-white/[0.08]">
              <textarea
                value={revText}
                onChange={e => setRevText(e.target.value)}
                placeholder="Share your thoughts on this title..."
                className="w-full min-h-[76px] bg-bg border border-white/[0.08] rounded-xl p-2.5 text-white text-[13px] font-sans placeholder-[#6B7280] focus:outline-none focus:border-am resize-y"
              />
              <div className="flex justify-end mt-2.5">
                <button onClick={handlePostReview} className="h-8 px-4 rounded-full bg-s3 font-mono text-xs hover:bg-am hover:text-[#111] transition-colors font-medium">
                  Post review
                </button>
              </div>
              {(revs[i] || []).length > 0 && (
                <div className="space-y-2 mt-3">
                  {(revs[i] || []).map((t, ri) => (
                    <p key={ri} className="m-0 p-2.5 bg-bg rounded-xl text-[13px] text-gray-300 border border-white/[0.06]">{t}</p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* More like this Grid */}
          <div className="text-sm font-semibold pl-2 border-l-[3px] border-white leading-none mt-8 mb-3">More like this</div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-x-2.5 gap-y-3.5 mb-8">
            {moreTitles.map(other => (
              <div
                key={other.id}
                className="cursor-pointer group"
                onClick={() => { openDetail(other); }}
              >
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-s2 border border-white/[0.08] group-hover:border-white/20 transition-all">
                  {other.posterUrl ? (
                    <img src={other.posterUrl} alt={other.title} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full bg-s3 grid place-items-center p-2 text-center text-xs font-bold">{other.title}</div>
                  )}
                </div>
                <h4 className="text-[13px] font-semibold mt-2 mx-0.5 truncate m-0 group-hover:text-am transition-colors">
                  {other.title}
                </h4>
                <div className="flex gap-1.5 mx-0.5 mt-1">
                  <span className="inline-flex items-center gap-1 h-[22px] px-2 rounded-full bg-s1 border border-white/[0.08] font-mono text-[10px]">
                    <Star size={11} fill="var(--am)" stroke="var(--am)" />{other.rating}
                  </span>
                  <span className="inline-flex items-center h-[22px] px-2 rounded-full bg-s1 border border-white/[0.08] font-mono text-[10px] text-t2">
                    {other.year}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════
  // RENDER: BOTTOM SHEET MODAL
  // ═══════════════════════════════════
  const renderSheet = () => {
    if (!sheetContent) return null;
    return (
      <div id="sh" onClick={(e) => { if ((e.target as HTMLElement).id === "sh") setSheetContent(null); }}
        className="fixed inset-0 z-50 bg-black/75 flex items-end justify-center backdrop-blur-sm">
        <div className="w-full max-w-[540px] bg-s1 rounded-t-[24px] p-5 pb-[calc(24px+env(safe-area-inset-bottom,0px))] border border-white/[0.08] animate-in fade-in slide-in-from-bottom duration-200"
          onClick={e => e.stopPropagation()}>
          {sheetContent}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════
  // RENDER: TMDB API KEY SETTINGS MODAL
  // ═══════════════════════════════════
  const renderKeyModal = () => {
    if (!showKeyModal) return null;
    return (
      <div
        id="key-modal-bg"
        onClick={e => { if ((e.target as HTMLElement).id === 'key-modal-bg') setShowKeyModal(false); }}
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
      >
        <div className="w-full max-w-[480px] bg-[#141519] border border-white/10 rounded-3xl p-6 shadow-2xl relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-am/15 text-am grid place-items-center">
                <Key size={18} />
              </div>
              <h3 className="text-lg font-bold">The Movie Database (TMDb) API</h3>
            </div>
            <button
              onClick={() => setShowKeyModal(false)}
              className="w-8 h-8 rounded-full bg-s2 grid place-items-center text-t2 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-xs text-t2 leading-relaxed mb-4">
            Cinevault queries TMDb's <code className="text-gray-300">/discover/movie</code> and <code className="text-gray-300">/discover/tv</code> API live based on your vibe selections.
            Enter your TMDb v3 API Key or v4 Read Access Token below:
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-mono text-t2 mb-1.5">TMDb API Key / Access Token</label>
              <input
                type="text"
                value={keyInput}
                onChange={e => { setKeyInput(e.target.value); setKeyError(null); }}
                placeholder="e.g. 32-character key or Bearer token"
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-am"
              />
            </div>

            {keyError && (
              <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-xs">
                {keyError}
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-t2 font-mono pt-1">
              <a
                href="https://www.themoviedb.org/settings/api"
                target="_blank"
                rel="noreferrer"
                className="text-am hover:underline inline-flex items-center gap-1"
              >
                Get a free TMDb API key <ExternalLink size={11} />
              </a>
              {apiKey && (
                <button
                  onClick={() => { setKeyInput(''); setApiKey(''); localStorage.removeItem('cinevault_tmdb_key'); toast('API Key removed'); }}
                  className="text-red-400 hover:underline"
                >
                  Clear Key
                </button>
              )}
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="flex-1 py-2.5 rounded-full bg-s2 text-xs font-medium hover:bg-s3 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApiKey}
                disabled={keyValidating}
                className="flex-1 py-2.5 rounded-full bg-am text-[#111] font-bold text-xs hover:brightness-110 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {keyValidating ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" /> Verifying...
                  </>
                ) : (
                  'Test & Save'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════
  return (
    <>
      {view === "onboarding" && renderOnboarding()}
      {view === "feed" && renderFeed()}
      {view === "detail" && renderDetail()}
      {renderSheet()}
      {renderKeyModal()}

      {/* Toast Notification */}
      <div className={`fixed left-1/2 z-[60] bg-s3 border border-white/[0.08] py-2.5 px-[18px] rounded-full text-sm transition-all duration-300 pointer-events-none ${
        toastMsg ? "top-[max(18px,env(safe-area-inset-top))] -translate-x-1/2 translate-y-0 opacity-100" : "top-[max(18px,env(safe-area-inset-top))] -translate-x-1/2 -translate-y-20 opacity-0"
      }`}>
        {toastMsg}
      </div>
    </>
  );
}
