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
  fetchSpecificTitles,
  CURATED_MEDIA_CATALOG
} from '../services/tmdb';
import {
  parseVibePromptWithAI,
  DEFAULT_GEMINI_KEY
} from '../services/ai';

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
  hasCurated: boolean;
  resetVibe: (onComplete?: () => void) => void;
  feedItems: CinevaultMedia[];
  feedLoading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  loadFeed: (customFilters?: Sel, customCat?: CategoryFilter, customSort?: SortFilter) => Promise<void>;
  loadMoreFeed: () => Promise<void>;
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
  geminiKey: string;
  aiLoading: boolean;
  aiExplanation: string | null;
  curateWithAI: (prompt: string) => Promise<{ success: boolean; filters?: Sel; explanation?: string }>;
  clearAiExplanation: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

function serializeSel(s: Sel): string {
  const plain: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(s)) {
    plain[k] = Array.from(v || []);
  }
  return JSON.stringify(plain);
}

function deserializeSel(json: string | null): Sel {
  const base = initSel();
  if (!json) return base;
  try {
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed === 'object') {
      for (const [k, v] of Object.entries(parsed)) {
        if (Array.isArray(v)) {
          base[k] = new Set(v as string[]);
        }
      }
    }
  } catch (e) {
    console.error('Failed to parse saved vibe sel:', e);
  }
  return base;
}

function loadSavedMediaRegistry(): Map<number, CinevaultMedia> {
  const map = new Map<number, CinevaultMedia>();
  CURATED_MEDIA_CATALOG.forEach(m => map.set(m.id, m));
  try {
    const savedFeed = localStorage.getItem('cinevault_feed_items');
    if (savedFeed) {
      const parsedFeed: CinevaultMedia[] = JSON.parse(savedFeed);
      if (Array.isArray(parsedFeed)) {
        parsedFeed.forEach(m => {
          if (m && m.id) map.set(m.id, m);
        });
      }
    }
  } catch (e) {
    console.warn('Failed to parse cached feed items for registry:', e);
  }
  try {
    const savedReg = localStorage.getItem('cinevault_media_registry');
    if (savedReg) {
      const parsedReg: CinevaultMedia[] = JSON.parse(savedReg);
      if (Array.isArray(parsedReg)) {
        parsedReg.forEach(m => {
          if (m && m.id) map.set(m.id, m);
        });
      }
    }
  } catch (e) {
    console.warn('Failed to parse saved media registry:', e);
  }
  return map;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [apiKey] = useState<string>(() => {
    return localStorage.getItem('cinevault_tmdb_key') || import.meta.env.VITE_TMDB_API_KEY || DEFAULT_TMDB_KEY;
  });

  // ─── ONBOARDING / VIBE STATE ───
  const [sel, setSel] = useState<Sel>(() => {
    return deserializeSel(localStorage.getItem('cinevault_vibe_sel'));
  });

  const [cur, setCur] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('cinevault_vibe_cur');
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= SCREENS.length) {
          return parsed;
        }
      }
    } catch {}
    const savedSel = localStorage.getItem('cinevault_vibe_sel');
    if (savedSel) {
      const parsed = deserializeSel(savedSel);
      if (Object.values(parsed).some(s => s && s.size > 0)) {
        return SCREENS.length;
      }
    }
    return 0;
  });

  useEffect(() => {
    try {
      localStorage.setItem('cinevault_vibe_sel', serializeSel(sel));
    } catch (e) {
      console.warn('Failed to persist vibe selections:', e);
    }
  }, [sel]);

  useEffect(() => {
    try {
      localStorage.setItem('cinevault_vibe_cur', String(cur));
    } catch (e) {
      console.warn('Failed to persist vibe step:', e);
    }
  }, [cur]);

  // ─── FEED STATE ───
  const [feedView, setFeedView] = useState<FeedView>(() => {
    return (localStorage.getItem('cinevault_feed_view') as FeedView) || 'grid';
  });

  const [feedItems, setFeedItems] = useState<CinevaultMedia[]>(() => {
    try {
      const saved = localStorage.getItem('cinevault_feed_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved feed items:', e);
    }
    return CURATED_MEDIA_CATALOG;
  });

  const [feedLoading, setFeedLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [feedPage, setFeedPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>(() => {
    return (localStorage.getItem('cinevault_category_filter') as CategoryFilter) || 'all';
  });
  const [sortFilter, setSortFilter] = useState<SortFilter>(() => {
    return (localStorage.getItem('cinevault_sort_filter') as SortFilter) || 'popularity.desc';
  });

  useEffect(() => {
    try {
      localStorage.setItem('cinevault_feed_view', feedView);
    } catch (e) {
      console.warn(e);
    }
  }, [feedView]);

  useEffect(() => {
    try {
      localStorage.setItem('cinevault_feed_items', JSON.stringify(feedItems));
    } catch (e) {
      console.warn('Failed to persist feed items:', e);
    }
  }, [feedItems]);

  useEffect(() => {
    try {
      localStorage.setItem('cinevault_category_filter', categoryFilter);
    } catch (e) {
      console.warn(e);
    }
  }, [categoryFilter]);

  useEffect(() => {
    try {
      localStorage.setItem('cinevault_sort_filter', sortFilter);
    } catch (e) {
      console.warn(e);
    }
  }, [sortFilter]);

  // Media Registry for Watchlist & Watched items
  const [mediaRegistry, setMediaRegistry] = useState<Map<number, CinevaultMedia>>(loadSavedMediaRegistry);

  useEffect(() => {
    try {
      const items = Array.from(mediaRegistry.values()).slice(-120);
      localStorage.setItem('cinevault_media_registry', JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to persist media registry:', e);
    }
  }, [mediaRegistry]);

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
  const [lk, setLk] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem('cinevault_lk');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [watchSt, setWatchSt] = useState<Record<number, string>>(() => {
    try {
      const saved = localStorage.getItem('cinevault_watch_st');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [rates, setRates] = useState<Record<number, number>>(() => {
    try {
      const saved = localStorage.getItem('cinevault_rates');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [revs, setRevs] = useState<Record<number, string[]>>(() => {
    try {
      const saved = localStorage.getItem('cinevault_revs');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cinevault_lk', JSON.stringify(Array.from(lk)));
    } catch (e) {
      console.warn(e);
    }
  }, [lk]);

  useEffect(() => {
    try {
      localStorage.setItem('cinevault_watch_st', JSON.stringify(watchSt));
    } catch (e) {
      console.warn(e);
    }
  }, [watchSt]);

  useEffect(() => {
    try {
      localStorage.setItem('cinevault_rates', JSON.stringify(rates));
    } catch (e) {
      console.warn(e);
    }
  }, [rates]);

  useEffect(() => {
    try {
      localStorage.setItem('cinevault_revs', JSON.stringify(revs));
    } catch (e) {
      console.warn(e);
    }
  }, [revs]);

  // ─── AI VIBE STATE ───
  const [geminiKey] = useState<string>(() => {
    return localStorage.getItem('cinevault_gemini_key') || import.meta.env.VITE_GEMINI_API_KEY || DEFAULT_GEMINI_KEY;
  });
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(() => {
    return sessionStorage.getItem('cinevault_ai_explanation') || null;
  });

  const clearAiExplanation = useCallback(() => {
    setAiExplanation(null);
    sessionStorage.removeItem('cinevault_ai_explanation');
  }, []);

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
    setFeedPage(1);
    setHasMore(true);
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
      setHasMore(res.totalPages > 2 && res.results.length >= 10);

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

  const loadMoreFeed = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = feedPage + 2;
    try {
      const effectiveFilters: OnboardingFilters = {
        fmt: new Set(sel.fmt),
        mood: new Set(sel.mood),
        genre: new Set(sel.genre),
        time: new Set(sel.time),
        age: new Set(sel.age),
        era: new Set(sel.era),
        lang: new Set(sel.lang),
      };

      let overrideType: 'movie' | 'tv' | undefined = undefined;
      if (categoryFilter === 'movie') overrideType = 'movie';
      if (categoryFilter === 'tv') overrideType = 'tv';
      if (categoryFilter === 'anime') {
        effectiveFilters.fmt.add('anime');
      }

      const res = await fetchDiscoverMovies(
        apiKey,
        effectiveFilters,
        nextPage,
        overrideType,
        sortFilter
      );

      if (res.results.length === 0) {
        setHasMore(false);
      } else {
        setFeedItems(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newItems = res.results.filter(r => !existingIds.has(r.id));
          return [...prev, ...newItems];
        });
        setFeedPage(nextPage);
        setHasMore(nextPage < res.totalPages);

        setMediaRegistry(prev => {
          const next = new Map(prev);
          res.results.forEach(item => next.set(item.id, item));
          return next;
        });
      }
    } catch (e) {
      console.warn('Error loading more:', e);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, feedPage, sel, categoryFilter, sortFilter, apiKey]);

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
    if (cur < SCREENS.length - 1) {
      setCur(c => c + 1);
    } else if (cur === SCREENS.length - 1) {
      // User clicked "Curate my feed" on the final question step
      setCur(c => c + 1);
      loadFeed();
    } else {
      if (onComplete) onComplete();
      // Only trigger loadFeed if feedItems is currently empty so we don't wipe out AI-curated results
      if (feedItems.length === 0) {
        loadFeed();
      }
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

  const hasCurated = Object.values(sel).some(s => s && s.size > 0);

  const resetVibe = useCallback((onComplete?: () => void) => {
    const fresh = initSel();
    setSel(fresh);
    setCur(0);
    try {
      localStorage.removeItem('cinevault_vibe_sel');
      localStorage.removeItem('cinevault_vibe_cur');
      localStorage.removeItem('cinevault_feed_items');
      localStorage.removeItem('cinevault_category_filter');
      localStorage.removeItem('cinevault_sort_filter');
      localStorage.removeItem('cinevault_ai_messages');
    } catch (e) {
      console.warn('Failed to clear vibe storage:', e);
    }
    loadFeed(fresh, 'all', 'popularity.desc');
    clearAiExplanation();
    toast("Feed and vibe reset");
    if (onComplete) onComplete();
    window.scrollTo(0, 0);
  }, [clearAiExplanation, loadFeed, toast]);

  const curateWithAI = useCallback(async (prompt: string): Promise<{ success: boolean; filters?: Sel; explanation?: string }> => {
    if (!prompt.trim()) return { success: false };
    setAiLoading(true);
    try {
      toast("Asking Cinevault AI...");
      const res = await parseVibePromptWithAI(prompt, geminiKey);
      setSel(res.filters);
      setAiExplanation(res.explanation);
      try {
        sessionStorage.setItem('cinevault_ai_explanation', res.explanation);
      } catch {}
      setCur(SCREENS.length);

      // Search for specific reference titles if suggested by AI (e.g. for "Paw Patrol", "Interstellar")
      let specificItems: CinevaultMedia[] = [];
      if (res.suggestedTitles && res.suggestedTitles.length > 0) {
        try {
          specificItems = await fetchSpecificTitles(apiKey, res.suggestedTitles);
        } catch (e) {
          console.warn('Failed to fetch AI suggested titles:', e);
        }
      }

      await loadFeed(res.filters);

      // Prepend specific matching titles at the top of the feed
      if (specificItems.length > 0) {
        setFeedItems(prev => {
          const specificIds = new Set(specificItems.map(s => s.id));
          const rest = prev.filter(p => !specificIds.has(p.id));
          return [...specificItems, ...rest];
        });
        setMediaRegistry(prev => {
          const next = new Map(prev);
          specificItems.forEach(item => next.set(item.id, item));
          return next;
        });
      }

      toast("Feed curated by AI!");
      return { success: true, filters: res.filters, explanation: res.explanation };
    } catch (err: any) {
      console.error('AI curation failed:', err);
      toast(err.message || 'AI curation failed. Please try again.');
      return { success: false };
    } finally {
      setAiLoading(false);
    }
  }, [apiKey, geminiKey, loadFeed, toast]);

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
    hasCurated,
    resetVibe,
    feedItems,
    feedLoading,
    loadingMore,
    hasMore,
    loadFeed,
    loadMoreFeed,
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
    geminiKey,
    aiLoading,
    aiExplanation,
    curateWithAI,
    clearAiExplanation,
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
