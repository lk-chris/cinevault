import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type {
  CinevaultMedia,
  OnboardingFilters,
  Tab,
  FeedView,
  CategoryFilter,
  SortFilter,
  Sel
} from '../types';
import {
  initSel,
  SCREENS,
  DEFAULT_TMDB_KEY
} from '../constants/vibeData';
import {
  fetchDiscoverMovies,
  fetchTMDbDetails,
  CURATED_MEDIA_CATALOG
} from '../services/tmdb';

interface AppContextType {
  apiKey: string;
  sel: Sel;
  setSel: React.Dispatch<React.SetStateAction<Sel>>;
  cur: number;
  setCur: React.Dispatch<React.SetStateAction<number>>;
  toggleSel: (gKey: string, optId: string, max: number) => void;
  stepValid: () => boolean;
  goText: () => string;
  nextStep: (onComplete?: () => void) => void;
  backStep: () => void;
  skipStep: () => void;
  feedItems: CinevaultMedia[];
  feedLoading: boolean;
  loadFeed: (customFilters?: Sel, customCat?: CategoryFilter, customSort?: SortFilter) => Promise<void>;
  feedView: FeedView;
  setFeedView: React.Dispatch<React.SetStateAction<FeedView>>;
  categoryFilter: CategoryFilter;
  setCategoryFilter: React.Dispatch<React.SetStateAction<CategoryFilter>>;
  sortFilter: SortFilter;
  setSortFilter: React.Dispatch<React.SetStateAction<SortFilter>>;
  mediaRegistry: Map<number, CinevaultMedia>;
  getMediaById: (id: number) => CinevaultMedia | undefined;
  enrichMedia: (id: number) => Promise<CinevaultMedia | undefined>;
  wl: Set<number>;
  toggleWl: (id: number, e?: React.MouseEvent) => void;
  wd: Set<number>;
  toggleWd: (id: number, e?: React.MouseEvent) => void;
  lk: Set<number>;
  toggleLk: (id: number) => void;
  watchSt: Record<number, string>;
  setWatchStatus: (id: number, status: string) => void;
  rates: Record<number, number>;
  setRating: (id: number, rate: number) => void;
  revs: Record<number, string[]>;
  addReview: (id: number, text: string) => void;
  toast: (msg: string) => void;
  toastMsg: string | null;
  sheetContent: React.ReactNode | null;
  setSheetContent: React.Dispatch<React.SetStateAction<React.ReactNode | null>>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [apiKey] = useState<string>(() => {
    return localStorage.getItem('cinevault_tmdb_key') || import.meta.env.VITE_TMDB_API_KEY || DEFAULT_TMDB_KEY;
  });

  // ─── ONBOARDING STATE ───
  const [cur, setCur] = useState(0);
  const [sel, setSel] = useState<Sel>(initSel);

  // ─── FEED STATE ───
  const [feedView, setFeedView] = useState<FeedView>("grid");
  const [feedItems, setFeedItems] = useState<CinevaultMedia[]>(CURATED_MEDIA_CATALOG);
  const [feedLoading, setFeedLoading] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [sortFilter, setSortFilter] = useState<SortFilter>('popularity.desc');

  // Media Registry for Watchlist & Watched items
  const [mediaRegistry, setMediaRegistry] = useState<Map<number, CinevaultMedia>>(() => {
    const map = new Map<number, CinevaultMedia>();
    CURATED_MEDIA_CATALOG.forEach(m => map.set(m.id, m));
    return map;
  });

  // Watchlist & Watched persistence
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

  useEffect(() => {
    try {
      localStorage.setItem('cinevault_wl', JSON.stringify(Array.from(wl)));
    } catch (e) {
      console.error(e);
    }
  }, [wl]);

  useEffect(() => {
    try {
      localStorage.setItem('cinevault_wd', JSON.stringify(Array.from(wd)));
    } catch (e) {
      console.error(e);
    }
  }, [wd]);

  // Detail item interaction states
  const [lk, setLk] = useState<Set<number>>(() => new Set());
  const [watchSt, setWatchSt] = useState<Record<number, string>>({});
  const [rates, setRates] = useState<Record<number, number>>({});
  const [revs, setRevs] = useState<Record<number, string[]>>({});

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

  // ─── FEED LOADER CONTROLLER ───
  const loadFeed = useCallback(async (
    customFilters: Sel = sel,
    customCat: CategoryFilter = categoryFilter,
    customSort: SortFilter = sortFilter
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

  // Initial feed load
  useEffect(() => {
    loadFeed();
  }, [apiKey, categoryFilter, sortFilter]);

  // ─── ONBOARDING HELPERS ───
  const toggleSel = (gKey: string, optId: string, max: number) => {
    setSel(prev => {
      const s = new Set(prev[gKey]);
      if (s.has(optId)) {
        s.delete(optId);
      } else if (max === 1) {
        s.clear();
        s.add(optId);
      } else if (s.size >= max) {
        toast(`You can pick up to ${max}`);
        return prev;
      } else {
        s.add(optId);
      }
      return { ...prev, [gKey]: s };
    });
  };

  const sc = cur < SCREENS.length ? SCREENS[cur] : null;

  const stepValid = () => {
    if (!sc) return true;
    return sc.groups.every(g => sel[g.key].size >= g.min);
  };

  const goText = () => {
    if (cur >= SCREENS.length) return "Open my feed";
    if (cur === SCREENS.length - 1) return "Curate my feed";
    return "Continue";
  };

  const nextStep = (onComplete?: () => void) => {
    if (cur < SCREENS.length) {
      setCur(c => c + 1);
    } else {
      if (onComplete) onComplete();
      loadFeed();
    }
    window.scrollTo(0, 0);
  };

  const backStep = () => {
    if (cur > 0) setCur(c => c - 1);
    window.scrollTo(0, 0);
  };

  const skipStep = () => {
    setCur(c => c + 1);
    window.scrollTo(0, 0);
  };

  // ─── DETAIL & REGISTRY HELPERS ───
  const getMediaById = (id: number): CinevaultMedia | undefined => {
    return mediaRegistry.get(id);
  };

  const enrichMedia = async (id: number): Promise<CinevaultMedia | undefined> => {
    const existing = mediaRegistry.get(id);
    if (!existing) return undefined;

    if (apiKey.trim() && (!existing.trailerKey || existing.cast.length === 0)) {
      try {
        const enriched = await fetchTMDbDetails(apiKey, existing.id, existing.type);
        const merged = { ...existing, ...enriched };
        setMediaRegistry(prev => {
          const next = new Map(prev);
          next.set(id, merged);
          return next;
        });
        return merged;
      } catch (e) {
        console.warn('Could not enrich TMDb details:', e);
      }
    }
    return existing;
  };

  const toggleWl = (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setWl(prev => {
      const n = new Set(prev);
      if (n.has(id)) {
        n.delete(id);
        toast("Removed from watchlist");
      } else {
        n.add(id);
        toast("Added to watchlist");
      }
      return n;
    });
  };

  const toggleWd = (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setWd(prev => {
      const n = new Set(prev);
      if (n.has(id)) {
        n.delete(id);
        toast("Unmarked");
      } else {
        n.add(id);
        toast("Marked as watched");
      }
      return n;
    });
  };

  const toggleLk = (id: number) => {
    setLk(p => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const setWatchStatus = (id: number, status: string) => {
    setWatchSt(p => {
      const u = { ...p };
      if (status) u[id] = status;
      else delete u[id];
      return u;
    });
    if (status === "Completed") {
      setWd(p => new Set(p).add(id));
    }
  };

  const setRating = (id: number, rate: number) => {
    setRates(p => ({ ...p, [id]: rate }));
  };

  const addReview = (id: number, text: string) => {
    const clean = text.trim().replace(/</g, "&lt;");
    if (!clean) return;
    setRevs(prev => ({
      ...prev,
      [id]: [clean, ...(prev[id] || [])]
    }));
    toast("Review posted");
  };

  const value: AppContextType = {
    apiKey,
    sel,
    setSel,
    cur,
    setCur,
    toggleSel,
    stepValid,
    goText,
    nextStep,
    backStep,
    skipStep,
    feedItems,
    feedLoading,
    loadFeed,
    feedView,
    setFeedView,
    categoryFilter,
    setCategoryFilter,
    sortFilter,
    setSortFilter,
    mediaRegistry,
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
    rates,
    setRating,
    revs,
    addReview,
    toast,
    toastMsg,
    sheetContent,
    setSheetContent,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
