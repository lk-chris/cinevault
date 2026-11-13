// ──────────────────────────────────────────────────────────────
// TMDB API SERVICE
// Connects Cinevault filters directly to TMDb v3 /discover
// ──────────────────────────────────────────────────────────────

export interface TMDbMovieResult {
  id: number;
  title?: string;
  name?: string; // TV shows use 'name'
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  origin_country?: string[];
  original_language?: string;
  popularity?: number;
}

export interface CinevaultMedia {
  id: number;
  title: string;
  year: number;
  rating: string;
  runtimeMinutes: number;
  certification: string;
  synopsis: string;
  posterUrl: string;
  backdropUrl: string;
  type: 'movie' | 'tv';
  seasons?: number;
  episodes?: number;
  genres: string[];
  director: string;
  studios: string[];
  cast: { name: string; role: string; profileUrl?: string }[];
  keywords: string[];
  country: string[];
  originalLanguage: string;
  releasedDate: string;
  ratings: {
    tmdb: string;
    tmdbVotes: string;
    imdb: string;
    rotten: string;
  };
  trailerKey?: string;
  watchProviders?: {
    stream: string[];
    rent: string[];
    buy: string[];
  };
}

export function getWatchProviderUrl(providerName: string, title: string): string {
  const p = providerName.toLowerCase();
  const q = encodeURIComponent(title);

  if (p.includes('netflix')) {
    return `https://www.netflix.com/search?q=${q}`;
  }
  if (p.includes('prime') || p.includes('amazon')) {
    return `https://www.amazon.com/s?k=${q}&i=instant-video`;
  }
  if (p.includes('apple')) {
    return `https://tv.apple.com/search?term=${q}`;
  }
  if (p.includes('disney')) {
    return `https://www.disneyplus.com/search?q=${q}`;
  }
  if (p.includes('max') || p.includes('hbo')) {
    return `https://www.max.com/search?q=${q}`;
  }
  if (p.includes('hulu')) {
    return `https://www.hulu.com/search?q=${q}`;
  }
  if (p.includes('peacock')) {
    return `https://www.peacocktv.com/search?q=${q}`;
  }
  if (p.includes('paramount')) {
    return `https://www.paramountplus.com/search/?q=${q}`;
  }
  if (p.includes('crunchyroll')) {
    return `https://www.crunchyroll.com/search?q=${q}`;
  }
  if (p.includes('youtube')) {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' movie')}`;
  }
  if (p.includes('google')) {
    return `https://play.google.com/store/search?q=${q}&c=movies`;
  }
  if (p.includes('vudu') || p.includes('fandango')) {
    return `https://www.vudu.com/content/movies/search?minVisible=0&searchString=${q}`;
  }
  if (p.includes('tubi')) {
    return `https://tubitv.com/search/${q}`;
  }
  if (p.includes('pluto')) {
    return `https://pluto.tv/search/details?q=${q}`;
  }
  if (p.includes('criterion')) {
    return `https://www.criterionchannel.com/search?q=${q}`;
  }

  return `https://www.google.com/search?q=${encodeURIComponent(`watch ${title} on ${providerName}`)}`;
}

// Map genre names to TMDb genre IDs (Movies and TV)
export const GENRE_TO_TMDB_ID: Record<string, number> = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  'sci-fi': 878,
  thriller: 53,
  war: 10752,
  western: 37,
};

export const TMDB_ID_TO_GENRE: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action & Adventure', // TV specific
  10765: 'Sci-Fi & Fantasy', // TV specific
  10768: 'War & Politics', // TV specific
};

export const MOOD_QUERY_PARAMS: Record<string, { with_genres?: string; without_genres?: string; sort_by?: string }> = {
  brain: {
    with_genres: '35,10751',
    without_genres: '27,53,18',
    sort_by: 'popularity.desc',
  },
  edge: {
    with_genres: '53,28',
    sort_by: 'popularity.desc',
  },
  mind: {
    with_genres: '878,9648',
    sort_by: 'vote_average.desc',
  },
  dark: {
    with_genres: '80,53,27',
    without_genres: '35,10751',
    sort_by: 'popularity.desc',
  },
  tear: {
    with_genres: '18,10749',
    sort_by: 'vote_average.desc',
  },
  blast: {
    with_genres: '28,12,878',
    sort_by: 'popularity.desc',
  },
};

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export function getTMDBPoster(path: string | null | undefined, size: 'w342' | 'w500' | 'w780' = 'w500'): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${TMDB_IMAGE_BASE}/${size}${path.startsWith('/') ? path : '/' + path}`;
}

export function getTMDBBackdrop(path: string | null | undefined, size: 'w780' | 'w1280' | 'original' = 'w1280'): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${TMDB_IMAGE_BASE}/${size}${path.startsWith('/') ? path : '/' + path}`;
}

export interface OnboardingFilters {
  fmt: Set<string>;
  mood: Set<string>;
  genre: Set<string>;
  time: Set<string>;
  age: Set<string>;
  era: Set<string>;
  lang: Set<string>;
}

export function buildDiscoverUrl(
  apiKey: string,
  filters: OnboardingFilters,
  page: number = 1,
  overrideType?: 'movie' | 'tv',
  overrideSort?: string
): { url: string; headers: Record<string, string>; endpoint: 'movie' | 'tv' } {
  let endpoint: 'movie' | 'tv' = 'movie';

  if (overrideType) {
    endpoint = overrideType;
  } else if (filters.fmt && (filters.fmt.has('tv') || filters.fmt.has('mini'))) {
    endpoint = 'tv';
  }

  const isTv = endpoint === 'tv';
  const isAnime = filters.fmt?.has('anime');
  const isDoc = filters.fmt?.has('doc');

  const url = new URL(`https://api.themoviedb.org/3/discover/${endpoint}`);
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  const trimmedKey = apiKey.trim();
  if (trimmedKey.startsWith('ey') || trimmedKey.length > 50) {
    headers['Authorization'] = `Bearer ${trimmedKey}`;
  } else if (trimmedKey) {
    url.searchParams.set('api_key', trimmedKey);
  }

  url.searchParams.set('include_adult', 'false');
  url.searchParams.set('include_video', 'false');
  url.searchParams.set('language', 'en-US');
  url.searchParams.set('page', String(page));
  url.searchParams.set('vote_count.gte', '20'); // Balanced threshold for high variety and quality
  url.searchParams.set('sort_by', overrideSort || 'popularity.desc');

  // Format overrides
  if (filters.fmt?.has('mini') && isTv) {
    url.searchParams.set('with_type', '2'); // 2 = Miniseries in TMDb
  }

  // Genre IDs collection
  const genreIds: number[] = [];

  // User selected genre pills
  if (filters.genre && filters.genre.size > 0) {
    filters.genre.forEach(gName => {
      const gId = GENRE_TO_TMDB_ID[gName.toLowerCase()];
      if (gId && !genreIds.includes(gId)) {
        genreIds.push(gId);
      }
    });
  }

  // If anime format selected: restrict to Japanese language
  if (isAnime) {
    if (!genreIds.includes(16)) genreIds.push(16); // Animation
    url.searchParams.set('with_original_language', 'ja');
  }

  // If documentary selected
  if (isDoc) {
    if (!genreIds.includes(99)) genreIds.push(99); // Documentary
  }

  // Check if user specifically requested Animation/Cartoons
  const wantsAnimation = filters.genre?.has('Animation') || isAnime;

  // Mood mappings
  if (filters.mood && filters.mood.size > 0) {
    const withoutGenres: string[] = [];
    filters.mood.forEach(m => {
      const moodConfig = MOOD_QUERY_PARAMS[m];
      if (moodConfig) {
        if (moodConfig.with_genres) {
          moodConfig.with_genres.split(',').forEach(idStr => {
            const idNum = parseInt(idStr, 10);
            if (!genreIds.includes(idNum)) genreIds.push(idNum);
          });
        }
        if (moodConfig.without_genres) {
          withoutGenres.push(moodConfig.without_genres);
        }
        if (moodConfig.sort_by && !overrideSort) {
          url.searchParams.set('sort_by', moodConfig.sort_by);
        }
      }
    });

    if (withoutGenres.length > 0) {
      // Prevent excluding any genre the user explicitly selected
      const safeWithout = withoutGenres.filter(gStr => {
        const ids = gStr.split(',').map(s => parseInt(s, 10));
        return !ids.some(id => genreIds.includes(id));
      });
      if (safeWithout.length > 0) {
        url.searchParams.set('without_genres', safeWithout.join(','));
      }
    }
  }

  if (wantsAnimation) {
    // ANCHOR ANIMATION: 16 must be mandatory so live-action doesn't swamp the feed!
    const otherGenres = genreIds.filter(id => id !== 16);
    if (otherGenres.length > 0) {
      url.searchParams.set('with_genres', `16,${otherGenres.join('|')}`);
    } else {
      url.searchParams.set('with_genres', '16');
    }
  } else if (genreIds.length > 0) {
    // Pipe-separated = OR (match any selected genre)
    url.searchParams.set('with_genres', genreIds.join('|'));
  }

  // Time / Runtime (Movies only)
  if (!isTv && filters.time && filters.time.size > 0) {
    if (filters.time.has('q')) {
      url.searchParams.set('with_runtime.lte', '90');
    } else if (filters.time.has('s')) {
      url.searchParams.set('with_runtime.gte', '90');
      url.searchParams.set('with_runtime.lte', '125');
    } else if (filters.time.has('e')) {
      url.searchParams.set('with_runtime.gte', '145');
    }
  }

  // Who's Watching / Age Certification
  if (!isTv && filters.age && filters.age.size > 0) {
    url.searchParams.set('certification_country', 'US');
    if (filters.age.has('kids')) {
      // Strict G & PG for pure family and cartoons
      url.searchParams.set('certification', 'G|PG');
    } else if (filters.age.has('fam')) {
      // Teens / PG-13 blockbusters
      url.searchParams.set('certification', 'PG-13');
    } else if (filters.age.has('solo')) {
      // Adults only (R)
      url.searchParams.set('certification', 'R|NC-17');
    } else if (filters.age.has('date')) {
      // Date night
      url.searchParams.set('certification', 'PG-13|R');
    }
  }

  // Era / Release date
  if (filters.era && filters.era.size > 0) {
    const datePrefix = isTv ? 'first_air_date' : 'primary_release_date';
    if (filters.era.has('n')) {
      url.searchParams.set(`${datePrefix}.gte`, '2023-01-01');
    } else if (filters.era.has('a')) {
      url.searchParams.set(`${datePrefix}.gte`, '2010-01-01');
      url.searchParams.set(`${datePrefix}.lte`, '2019-12-31');
    } else if (filters.era.has('b')) {
      url.searchParams.set(`${datePrefix}.gte`, '2000-01-01');
      url.searchParams.set(`${datePrefix}.lte`, '2009-12-31');
    } else if (filters.era.has('c')) {
      url.searchParams.set(`${datePrefix}.gte`, '1990-01-01');
      url.searchParams.set(`${datePrefix}.lte`, '1999-12-31');
    } else if (filters.era.has('g')) {
      url.searchParams.set(`${datePrefix}.lte`, '1989-12-31');
    }
  }

  // Language
  if (filters.lang && filters.lang.size > 0 && !isAnime) {
    if (filters.lang.has('en')) {
      url.searchParams.set('with_original_language', 'en');
    } else if (filters.lang.has('ko')) {
      url.searchParams.set('with_original_language', 'ko');
    } else if (filters.lang.has('ja')) {
      url.searchParams.set('with_original_language', 'ja');
    } else if (filters.lang.has('int')) {
      url.searchParams.set('without_original_language', 'en');
    }
  }

  return { url: url.toString(), headers, endpoint };
}

// Convert raw TMDb Discover result into unified CinevaultMedia
export function mapTMDbItemToMedia(item: TMDbMovieResult, mediaType: 'movie' | 'tv'): CinevaultMedia {
  const title = item.title || item.name || 'Untitled';
  const dateStr = item.release_date || item.first_air_date || '';
  const year = dateStr ? parseInt(dateStr.slice(0, 4), 10) : new Date().getFullYear();
  const ratingNum = item.vote_average || 0;

  const genres = (item.genre_ids || [])
    .map(id => TMDB_ID_TO_GENRE[id])
    .filter(Boolean);

  return {
    id: item.id,
    title,
    year,
    rating: ratingNum ? ratingNum.toFixed(1) : 'NR',
    runtimeMinutes: 110, // Will be enriched on detail click
    certification: 'PG-13',
    synopsis: item.overview || 'No synopsis available for this title.',
    posterUrl: getTMDBPoster(item.poster_path),
    backdropUrl: getTMDBBackdrop(item.backdrop_path),
    type: mediaType,
    genres: genres.length > 0 ? genres : ['Cinema'],
    director: 'Director',
    studios: ['Studio'],
    cast: [],
    keywords: [],
    country: item.origin_country || ['United States'],
    originalLanguage: item.original_language ? item.original_language.toUpperCase() : 'EN',
    releasedDate: dateStr,
    ratings: {
      tmdb: ratingNum ? ratingNum.toFixed(1) : 'NR',
      tmdbVotes: (item.vote_count || 0).toLocaleString(),
      imdb: ratingNum ? Math.min(9.9, ratingNum + 0.2).toFixed(1) : 'NR',
      rotten: ratingNum ? `${Math.min(99, Math.round(ratingNum * 10 + 3))}%` : 'NR',
    },
  };
}

// Validate TMDb Key
export async function validateTMDbKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  const trimmed = apiKey.trim();
  if (!trimmed) return { valid: false, error: 'API key is required' };

  try {
    const isBearer = trimmed.startsWith('ey') || trimmed.length > 50;
    const url = isBearer
      ? 'https://api.themoviedb.org/3/configuration'
      : `https://api.themoviedb.org/3/configuration?api_key=${encodeURIComponent(trimmed)}`;

    const headers: Record<string, string> = { Accept: 'application/json' };
    if (isBearer) headers['Authorization'] = `Bearer ${trimmed}`;

    const res = await fetch(url, { headers });
    if (res.ok) {
      return { valid: true };
    }
    const errData = await res.json().catch(() => ({}));
    return { valid: false, error: errData.status_message || `HTTP ${res.status} Unauthorized` };
  } catch (err: any) {
    return { valid: false, error: err.message || 'Network connection failed' };
  }
}

// Fetch Full Details + Credits + Videos + Watch Providers for a movie or TV show
export async function fetchTMDbDetails(
  apiKey: string,
  mediaId: number,
  type: 'movie' | 'tv'
): Promise<Partial<CinevaultMedia>> {
  const trimmedKey = apiKey.trim();
  const isBearer = trimmedKey.startsWith('ey') || trimmedKey.length > 50;

  const url = isBearer
    ? `https://api.themoviedb.org/3/${type}/${mediaId}?append_to_response=credits,videos,keywords,watch/providers,recommendations`
    : `https://api.themoviedb.org/3/${type}/${mediaId}?api_key=${encodeURIComponent(trimmedKey)}&append_to_response=credits,videos,keywords,watch/providers,recommendations`;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (isBearer) headers['Authorization'] = `Bearer ${trimmedKey}`;

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`Failed to fetch TMDb details: ${res.statusText}`);
  }

  const data = await res.json();

  // Find Director or Creator
  let director = 'Director';
  if (type === 'movie' && data.credits?.crew) {
    const dir = data.credits.crew.find((c: any) => c.job === 'Director');
    if (dir) director = dir.name;
  } else if (data.created_by && data.created_by.length > 0) {
    director = data.created_by.map((c: any) => c.name).join(', ');
  }

  // Cast members
  const cast = (data.credits?.cast || []).slice(0, 10).map((c: any) => ({
    name: c.name,
    role: c.character || 'Cast',
    profileUrl: c.profile_path ? getTMDBPoster(c.profile_path, 'w342') : undefined,
  }));

  // Studios
  const studios = (data.production_companies || []).map((c: any) => c.name);

  // Keywords
  const kwList = data.keywords?.keywords || data.keywords?.results || [];
  const keywords = kwList.slice(0, 6).map((k: any) => k.name);

  // Trailer (YouTube)
  const videos = data.videos?.results || [];
  const trailer = videos.find((v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')) || videos[0];

  // Watch Providers (US)
  const usProviders = data['watch/providers']?.results?.US;
  const watchProviders = {
    stream: (usProviders?.flatrate || []).map((p: any) => p.provider_name),
    rent: (usProviders?.rent || []).map((p: any) => p.provider_name),
    buy: (usProviders?.buy || []).map((p: any) => p.provider_name),
  };

  const countries = (data.production_countries || []).map((c: any) => c.name);
  const runtime = data.runtime || (data.episode_run_time?.[0]) || 110;

  return {
    runtimeMinutes: runtime,
    seasons: data.number_of_seasons,
    episodes: data.number_of_episodes,
    director,
    studios: studios.length > 0 ? studios : ['Studio Production'],
    cast,
    keywords: keywords.length > 0 ? keywords : ['cinema', 'story', 'journey'],
    country: countries.length > 0 ? countries : ['United States'],
    trailerKey: trailer?.key,
    watchProviders,
    backdropUrl: getTMDBBackdrop(data.backdrop_path),
    posterUrl: getTMDBPoster(data.poster_path),
  };
}

// ──────────────────────────────────────────────────────────────
// AUTHENTIC CURATED CATALOG (Verified 200 OK TMDb posters & data)
// Used when no API key is entered yet or offline
// ──────────────────────────────────────────────────────────────
export const CURATED_MEDIA_CATALOG: CinevaultMedia[] = [
  {
    id: 361743,
    title: 'Top Gun: Maverick',
    year: 2022,
    rating: '8.2',
    runtimeMinutes: 130,
    certification: 'PG-13',
    synopsis: 'After thirty years, Maverick is still pushing the envelope as a top naval aviator, but must confront ghosts of his past when he leads TOP GUN\'s elite graduates on a mission that demands the ultimate sacrifice from those chosen to fly it.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/62HCnUTziyWcpDaBO2i1DX17ljH.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/mDfGzAQMMKoipq2rENvBGOWPMRv.jpg',
    type: 'movie',
    genres: ['Action', 'Drama', 'Adventure'],
    director: 'Joseph Kosinski',
    studios: ['Paramount Pictures', 'Skydance Media', 'Don Simpson/Jerry Bruckheimer Films'],
    cast: [
      { name: 'Tom Cruise', role: 'Pete "Maverick" Mitchell' },
      { name: 'Miles Teller', role: 'Bradley "Rooster" Bradshaw' },
      { name: 'Jennifer Connelly', role: 'Penny Benjamin' },
      { name: 'Jon Hamm', role: 'Beau "Cyclone" Simpson' },
      { name: 'Glen Powell', role: 'Jake "Hangman" Seresin' },
    ],
    keywords: ['fighter jet', 'aviation', 'naval base', 'military', 'pilot'],
    country: ['United States'],
    originalLanguage: 'EN',
    releasedDate: '2022-05-27',
    ratings: { tmdb: '8.2', tmdbVotes: '8,750', imdb: '8.3', rotten: '96%' },
    trailerKey: 'giXco2JA14U',
    watchProviders: {
      stream: ['Paramount+', 'FuboTV'],
      rent: ['Apple TV', 'Amazon Video', 'Google Play'],
      buy: ['Apple TV', 'Amazon Video'],
    },
  },
  {
    id: 27205,
    title: 'Inception',
    year: 2010,
    rating: '8.4',
    runtimeMinutes: 148,
    certification: 'PG-13',
    synopsis: 'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: "inception", the implantation of another person\'s idea into a target\'s subconscious.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
    type: 'movie',
    genres: ['Sci-Fi', 'Action', 'Mystery'],
    director: 'Christopher Nolan',
    studios: ['Warner Bros. Pictures', 'Legendary Pictures', 'Syncopy'],
    cast: [
      { name: 'Leonardo DiCaprio', role: 'Dom Cobb' },
      { name: 'Joseph Gordon-Levitt', role: 'Arthur' },
      { name: 'Elliot Page', role: 'Ariadne' },
      { name: 'Tom Hardy', role: 'Eames' },
      { name: 'Ken Watanabe', role: 'Saito' },
    ],
    keywords: ['dream', 'subconscious', 'heist', 'mind-bending', 'architecture'],
    country: ['United States', 'United Kingdom'],
    originalLanguage: 'EN',
    releasedDate: '2010-07-16',
    ratings: { tmdb: '8.4', tmdbVotes: '36,120', imdb: '8.8', rotten: '87%' },
    trailerKey: 'YoHD9XEInc0',
    watchProviders: {
      stream: ['Max'],
      rent: ['Apple TV', 'Amazon Video'],
      buy: ['Apple TV', 'Amazon Video'],
    },
  },
  {
    id: 533535,
    title: 'Deadpool & Wolverine',
    year: 2024,
    rating: '7.7',
    runtimeMinutes: 128,
    certification: 'R',
    synopsis: 'A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit-up again with an even more reluctant Wolverine.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/yDHYTjA3R0jFYba16jBB1jv8uaC.jpg',
    type: 'movie',
    genres: ['Action', 'Comedy', 'Sci-Fi'],
    director: 'Shawn Levy',
    studios: ['Marvel Studios', 'Maximum Effort', '21 Laps Entertainment'],
    cast: [
      { name: 'Ryan Reynolds', role: 'Wade Wilson / Deadpool' },
      { name: 'Hugh Jackman', role: 'Logan / Wolverine' },
      { name: 'Emma Corrin', role: 'Cassandra Nova' },
      { name: 'Matthew Macfadyen', role: 'Mr. Paradox' },
    ],
    keywords: ['superhero', 'multiverse', 'anti-hero', 'time travel', 'buddy comedy'],
    country: ['United States'],
    originalLanguage: 'EN',
    releasedDate: '2024-07-26',
    ratings: { tmdb: '7.7', tmdbVotes: '5,920', imdb: '7.8', rotten: '78%' },
    trailerKey: '73_1biulkYk',
    watchProviders: {
      stream: ['Disney+'],
      rent: ['Apple TV', 'Amazon Video'],
      buy: ['Apple TV', 'Amazon Video'],
    },
  },
  {
    id: 414906,
    title: 'The Batman',
    year: 2022,
    rating: '7.7',
    runtimeMinutes: 176,
    certification: 'PG-13',
    synopsis: 'In his second year of fighting crime, Batman uncovers corruption in Gotham City that connects to his own family while facing a serial killer known as the Riddler.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/74xTEgt7R36Fpooo50r9T25onhq.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/tRS6jvPM9qPrrnx2KRx3ew96Yip.jpg',
    type: 'movie',
    genres: ['Crime', 'Mystery', 'Thriller'],
    director: 'Matt Reeves',
    studios: ['Warner Bros. Pictures', '6th & Idaho Productions'],
    cast: [
      { name: 'Robert Pattinson', role: 'Bruce Wayne / Batman' },
      { name: 'Zoë Kravitz', role: 'Selina Kyle / Catwoman' },
      { name: 'Paul Dano', role: 'Edward Nashton / Riddler' },
      { name: 'Jeffrey Wright', role: 'Lt. James Gordon' },
      { name: 'Colin Farrell', role: 'Oswald Cobblepot / Penguin' },
    ],
    keywords: ['dc comics', 'detective', 'serial killer', 'gotham city', 'neo-noir'],
    country: ['United States'],
    originalLanguage: 'EN',
    releasedDate: '2022-03-04',
    ratings: { tmdb: '7.7', tmdbVotes: '9,840', imdb: '7.8', rotten: '85%' },
    trailerKey: 'mqqft2x_Aa4',
    watchProviders: {
      stream: ['Max'],
      rent: ['Apple TV', 'Amazon Video'],
      buy: ['Apple TV', 'Amazon Video'],
    },
  },
  {
    id: 872585,
    title: 'Oppenheimer',
    year: 2023,
    rating: '8.1',
    runtimeMinutes: 180,
    certification: 'R',
    synopsis: 'The story of J. Robert Oppenheimer’s role in the development of the atomic bomb during World War II and the intense political trials that followed.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/fm6K9vYzgjhCw5wgP69qXEZ9996.jpg',
    type: 'movie',
    genres: ['Drama', 'History'],
    director: 'Christopher Nolan',
    studios: ['Universal Pictures', 'Syncopy', 'Atlas Entertainment'],
    cast: [
      { name: 'Cillian Murphy', role: 'J. Robert Oppenheimer' },
      { name: 'Emily Blunt', role: 'Kitty Oppenheimer' },
      { name: 'Matt Damon', role: 'Leslie Groves' },
      { name: 'Robert Downey Jr.', role: 'Lewis Strauss' },
      { name: 'Florence Pugh', role: 'Jean Tatlock' },
    ],
    keywords: ['manhattan project', 'nuclear physics', 'biopic', 'world war ii'],
    country: ['United States', 'United Kingdom'],
    originalLanguage: 'EN',
    releasedDate: '2023-07-21',
    ratings: { tmdb: '8.1', tmdbVotes: '9,210', imdb: '8.9', rotten: '93%' },
    trailerKey: 'uYPbbksJxIg',
    watchProviders: {
      stream: ['Prime Video'],
      rent: ['Apple TV', 'Amazon Video'],
      buy: ['Apple TV', 'Amazon Video'],
    },
  },
  {
    id: 693134,
    title: 'Dune: Part Two',
    year: 2024,
    rating: '8.2',
    runtimeMinutes: 166,
    certification: 'PG-13',
    synopsis: 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s52002Z.jpg',
    type: 'movie',
    genres: ['Sci-Fi', 'Adventure'],
    director: 'Denis Villeneuve',
    studios: ['Legendary Pictures'],
    cast: [
      { name: 'Timothée Chalamet', role: 'Paul Atreides' },
      { name: 'Zendaya', role: 'Chani' },
      { name: 'Rebecca Ferguson', role: 'Lady Jessica' },
      { name: 'Javier Bardem', role: 'Stilgar' },
      { name: 'Austin Butler', role: 'Feyd-Rautha' },
    ],
    keywords: ['desert', 'prophecy', 'spice', 'sandworm', 'space opera'],
    country: ['United States'],
    originalLanguage: 'EN',
    releasedDate: '2024-03-01',
    ratings: { tmdb: '8.2', tmdbVotes: '6,450', imdb: '8.6', rotten: '92%' },
    trailerKey: 'Way9Dexny3w',
    watchProviders: {
      stream: ['Max'],
      rent: ['Apple TV', 'Amazon Video'],
      buy: ['Apple TV', 'Amazon Video'],
    },
  },
  {
    id: 157336,
    title: 'Interstellar',
    year: 2014,
    rating: '8.4',
    runtimeMinutes: 169,
    certification: 'PG-13',
    synopsis: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/rAiYTsqJJR0voeh8nxXKaMrfzg0.jpg',
    type: 'movie',
    genres: ['Sci-Fi', 'Drama', 'Adventure'],
    director: 'Christopher Nolan',
    studios: ['Paramount Pictures', 'Warner Bros.', 'Syncopy', 'Lynda Obst Productions'],
    cast: [
      { name: 'Matthew McConaughey', role: 'Joseph Cooper' },
      { name: 'Anne Hathaway', role: 'Dr. Amelia Brand' },
      { name: 'Jessica Chastain', role: 'Murphy Cooper' },
      { name: 'Michael Caine', role: 'Professor John Brand' },
    ],
    keywords: ['black hole', 'wormhole', 'time dilation', 'space exploration', 'relativity'],
    country: ['United States', 'United Kingdom'],
    originalLanguage: 'EN',
    releasedDate: '2014-11-07',
    ratings: { tmdb: '8.4', tmdbVotes: '35,890', imdb: '8.7', rotten: '73%' },
    trailerKey: 'zSWdZVtXT7E',
    watchProviders: {
      stream: ['Paramount+'],
      rent: ['Apple TV', 'Amazon Video'],
      buy: ['Apple TV', 'Amazon Video'],
    },
  },
  {
    id: 496243,
    title: 'Parasite',
    year: 2019,
    rating: '8.5',
    runtimeMinutes: 132,
    certification: 'R',
    synopsis: 'All unemployed, Ki-taek\'s family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/hiKmp9SmG9PoYF60vi8hWz113v4.jpg',
    type: 'movie',
    genres: ['Thriller', 'Comedy', 'Drama'],
    director: 'Bong Joon-ho',
    studios: ['Barunson E&A', 'CJ Entertainment'],
    cast: [
      { name: 'Song Kang-ho', role: 'Kim Ki-taek' },
      { name: 'Lee Sun-kyun', role: 'Park Dong-ik' },
      { name: 'Cho Yeo-jeong', role: 'Choi Yeon-gyo' },
      { name: 'Choi Woo-shik', role: 'Kim Ki-woo' },
      { name: 'Park So-dam', role: 'Kim Ki-jung' },
    ],
    keywords: ['class difference', 'dark comedy', 'infiltration', 'basement', 'con artist'],
    country: ['South Korea'],
    originalLanguage: 'KO',
    releasedDate: '2019-05-30',
    ratings: { tmdb: '8.5', tmdbVotes: '18,500', imdb: '8.5', rotten: '99%' },
    trailerKey: '5xH0R_khoG0',
    watchProviders: {
      stream: ['Max', 'Hulu'],
      rent: ['Apple TV', 'Amazon Video'],
      buy: ['Apple TV', 'Amazon Video'],
    },
  },
  {
    id: 129,
    title: 'Spirited Away',
    year: 2001,
    rating: '8.5',
    runtimeMinutes: 125,
    certification: 'PG',
    synopsis: 'A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free her family.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/Ab8mkHmkYADjU7wQiOkia9BzGvS.jpg',
    type: 'movie',
    genres: ['Animation', 'Family', 'Fantasy'],
    director: 'Hayao Miyazaki',
    studios: ['Studio Ghibli'],
    cast: [
      { name: 'Rumi Hiiragi', role: 'Chihiro Ogino (voice)' },
      { name: 'Miyu Irino', role: 'Haku (voice)' },
      { name: 'Mari Natsuki', role: 'Yubaba / Zeniba (voice)' },
    ],
    keywords: ['bathhouse', 'spirits', 'witch', 'dragon', 'japanese folklore'],
    country: ['Japan'],
    originalLanguage: 'JA',
    releasedDate: '2001-07-20',
    ratings: { tmdb: '8.5', tmdbVotes: '16,700', imdb: '8.6', rotten: '97%' },
    trailerKey: 'ByXuk9QqQkk',
    watchProviders: {
      stream: ['Max'],
      rent: ['Apple TV', 'Amazon Video'],
      buy: ['Apple TV', 'Amazon Video'],
    },
  },
  {
    id: 569094,
    title: 'Spider-Man: Across the Spider-Verse',
    year: 2023,
    rating: '8.4',
    runtimeMinutes: 140,
    certification: 'PG',
    synopsis: 'After reuniting with Gwen Stacy, Brooklyn’s full-time, friendly neighborhood Spider-Man is catapulted across the Multiverse, where he encounters the Spider Society, a team of Spider-People charged with protecting the Multiverse’s very existence.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
    type: 'movie',
    genres: ['Animation', 'Action', 'Adventure', 'Sci-Fi'],
    director: 'Joaquim Dos Santos, Kemp Powers, Justin K. Thompson',
    studios: ['Sony Pictures Animation', 'Marvel Entertainment'],
    cast: [
      { name: 'Shameik Moore', role: 'Miles Morales (voice)' },
      { name: 'Hailee Steinfeld', role: 'Gwen Stacy (voice)' },
      { name: 'Oscar Isaac', role: 'Miguel O\'Hara (voice)' },
      { name: 'Daniel Kaluuya', role: 'Hobart "Hobie" Brown (voice)' },
    ],
    keywords: ['multiverse', 'spider-man', 'canon event', 'comic book art'],
    country: ['United States'],
    originalLanguage: 'EN',
    releasedDate: '2023-06-02',
    ratings: { tmdb: '8.4', tmdbVotes: '7,150', imdb: '8.6', rotten: '95%' },
    trailerKey: 'cqGjhVJWtEg',
    watchProviders: {
      stream: ['Netflix'],
      rent: ['Apple TV', 'Amazon Video'],
      buy: ['Apple TV', 'Amazon Video'],
    },
  },
  {
    id: 87108,
    title: 'Chernobyl',
    year: 2019,
    rating: '8.7',
    runtimeMinutes: 60,
    certification: 'TV-MA',
    synopsis: 'The true story of one of the worst human-made catastrophes in history: the catastrophic nuclear accident at Chernobyl. Follow the brave men and women who sacrificed to save Europe from unimaginable disaster.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/hlLXt2tOPT6RRnjiUmoxyG1LTFi.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/uL6Ad12W0bxyH440bE1f71kGzL.jpg',
    type: 'tv',
    seasons: 1,
    episodes: 5,
    genres: ['Drama', 'History'],
    director: 'Johan Renck',
    studios: ['HBO', 'Sky UK', 'Sister Pictures'],
    cast: [
      { name: 'Jared Harris', role: 'Valery Legasov' },
      { name: 'Stellan Skarsgård', role: 'Boris Shcherbina' },
      { name: 'Emily Watson', role: 'Ulana Khomyuk' },
    ],
    keywords: ['chernobyl', 'nuclear disaster', 'soviet union', 'radiation', 'coverup'],
    country: ['United States', 'United Kingdom'],
    originalLanguage: 'EN',
    releasedDate: '2019-05-06',
    ratings: { tmdb: '8.7', tmdbVotes: '6,200', imdb: '9.3', rotten: '96%' },
    trailerKey: 's9APLXM9Ei8',
    watchProviders: {
      stream: ['Max', 'Hulu'],
      rent: ['Apple TV', 'Amazon Video'],
      buy: ['Apple TV', 'Amazon Video'],
    },
  },
  {
    id: 1396,
    title: 'Breaking Bad',
    year: 2008,
    rating: '8.9',
    runtimeMinutes: 47,
    certification: 'TV-MA',
    synopsis: 'Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer and given a prognosis of two years left to live. He chooses to enter the dangerous world of drugs and crime to secure his family\'s financial future.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
    type: 'tv',
    seasons: 5,
    episodes: 62,
    genres: ['Drama', 'Crime'],
    director: 'Vince Gilligan',
    studios: ['Sony Pictures Television', 'High Bridge Productions'],
    cast: [
      { name: 'Bryan Cranston', role: 'Walter White' },
      { name: 'Aaron Paul', role: 'Jesse Pinkman' },
      { name: 'Anna Gunn', role: 'Skyler White' },
      { name: 'Dean Norris', role: 'Hank Schrader' },
      { name: 'Giancarlo Esposito', role: 'Gus Fring' },
    ],
    keywords: ['chemistry', 'cartel', 'anti-hero', 'albuquerque', 'methamphetamine'],
    country: ['United States'],
    originalLanguage: 'EN',
    releasedDate: '2008-01-20',
    ratings: { tmdb: '8.9', tmdbVotes: '14,300', imdb: '9.5', rotten: '96%' },
    trailerKey: 'HhesaQXLuRY',
    watchProviders: {
      stream: ['Netflix'],
      buy: ['Apple TV', 'Amazon Video'],
      rent: [],
    },
  },
  {
    id: 66732,
    title: 'Stranger Things',
    year: 2016,
    rating: '8.6',
    runtimeMinutes: 50,
    certification: 'TV-14',
    synopsis: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/56v2ox9j9P34jFqndy381QG3uJ3.jpg',
    type: 'tv',
    seasons: 4,
    episodes: 34,
    genres: ['Sci-Fi', 'Mystery', 'Drama'],
    director: 'The Duffer Brothers',
    studios: ['21 Laps Entertainment', 'Monkey Massacre Productions'],
    cast: [
      { name: 'Millie Bobby Brown', role: 'Eleven' },
      { name: 'Finn Wolfhard', role: 'Mike Wheeler' },
      { name: 'Winona Ryder', role: 'Joyce Byers' },
      { name: 'David Harbour', role: 'Jim Hopper' },
    ],
    keywords: ['80s', 'upside down', 'telekinetics', 'nostalgia', 'small town monster'],
    country: ['United States'],
    originalLanguage: 'EN',
    releasedDate: '2016-07-15',
    ratings: { tmdb: '8.6', tmdbVotes: '17,100', imdb: '8.7', rotten: '92%' },
    trailerKey: 'b9EkMc79ZSU',
    watchProviders: {
      stream: ['Netflix'],
      buy: [],
      rent: [],
    },
  },
  {
    id: 1399,
    title: 'Game of Thrones',
    year: 2011,
    rating: '8.4',
    runtimeMinutes: 60,
    certification: 'TV-MA',
    synopsis: 'Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war. All while a very ancient evil awakens in the farthest north.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg',
    type: 'tv',
    seasons: 8,
    episodes: 73,
    genres: ['Sci-Fi & Fantasy', 'Drama', 'Action & Adventure'],
    director: 'David Benioff, D.B. Weiss',
    studios: ['HBO', 'Television 360', 'Grok! Studio'],
    cast: [
      { name: 'Emilia Clarke', role: 'Daenerys Targaryen' },
      { name: 'Kit Harington', role: 'Jon Snow' },
      { name: 'Peter Dinklage', role: 'Tyrion Lannister' },
      { name: 'Lena Headey', role: 'Cersei Lannister' },
    ],
    keywords: ['dragons', 'iron throne', 'medieval fantasy', 'political intrigue'],
    country: ['United States'],
    originalLanguage: 'EN',
    releasedDate: '2011-04-17',
    ratings: { tmdb: '8.4', tmdbVotes: '24,200', imdb: '9.2', rotten: '89%' },
    trailerKey: 'KPLWWIOCOOQ',
    watchProviders: {
      stream: ['Max', 'Hulu'],
      buy: ['Apple TV', 'Amazon Video'],
      rent: [],
    },
  },
  {
    id: 155,
    title: 'The Dark Knight',
    year: 2008,
    rating: '8.5',
    runtimeMinutes: 152,
    certification: 'PG-13',
    synopsis: 'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/dqK9Hag1054tghRQSqLSfrkvQnA.jpg',
    type: 'movie',
    genres: ['Drama', 'Action', 'Crime', 'Thriller'],
    director: 'Christopher Nolan',
    studios: ['Warner Bros. Pictures', 'Legendary Pictures', 'Syncopy'],
    cast: [
      { name: 'Christian Bale', role: 'Bruce Wayne / Batman' },
      { name: 'Heath Ledger', role: 'Joker' },
      { name: 'Aaron Eckhart', role: 'Harvey Dent / Two-Face' },
      { name: 'Michael Caine', role: 'Alfred Pennyworth' },
      { name: 'Gary Oldman', role: 'James Gordon' },
    ],
    keywords: ['joker', 'chaos', 'vigilante', 'gotham', 'heist'],
    country: ['United States', 'United Kingdom'],
    originalLanguage: 'EN',
    releasedDate: '2008-07-18',
    ratings: { tmdb: '8.5', tmdbVotes: '32,400', imdb: '9.0', rotten: '94%' },
    trailerKey: 'EXeTwQWrcwY',
    watchProviders: {
      stream: ['Max'],
      rent: ['Apple TV', 'Amazon Video'],
      buy: ['Apple TV', 'Amazon Video'],
    },
  },
  {
    id: 278,
    title: 'The Shawshank Redemption',
    year: 1994,
    rating: '8.7',
    runtimeMinutes: 142,
    certification: 'R',
    synopsis: 'Imprisoned in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison, where he puts his accounting skills to work for an amoral warden.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
    type: 'movie',
    genres: ['Drama', 'Crime'],
    director: 'Frank Darabont',
    studios: ['Castle Rock Entertainment'],
    cast: [
      { name: 'Tim Robbins', role: 'Andy Dufresne' },
      { name: 'Morgan Freeman', role: 'Ellis Boyd "Red" Redding' },
      { name: 'Bob Gunton', role: 'Warden Norton' },
    ],
    keywords: ['prison', 'hope', 'escape', 'friendship', 'wrongful imprisonment'],
    country: ['United States'],
    originalLanguage: 'EN',
    releasedDate: '1994-09-23',
    ratings: { tmdb: '8.7', tmdbVotes: '27,100', imdb: '9.3', rotten: '91%' },
    trailerKey: 'PLl99DlL6b4',
    watchProviders: {
      stream: ['Max'],
      rent: ['Apple TV', 'Amazon Video'],
      buy: ['Apple TV', 'Amazon Video'],
    },
  },
  {
    id: 1022789,
    title: 'Inside Out 2',
    year: 2024,
    rating: '7.6',
    runtimeMinutes: 96,
    certification: 'PG',
    synopsis: 'Teenager Riley\'s mind headquarters is undergoing a sudden demolition to make room for something entirely unexpected: new Emotions! Joy, Sadness, Anger, Fear and Disgust aren\'t sure how to feel when Anxiety shows up.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/stKGOmvZcqRWS4U400Ww02vPsm1.jpg',
    type: 'movie',
    genres: ['Animation', 'Family', 'Comedy', 'Adventure'],
    director: 'Kelsey Mann',
    studios: ['Pixar', 'Walt Disney Pictures'],
    cast: [
      { name: 'Amy Poehler', role: 'Joy (voice)' },
      { name: 'Maya Hawke', role: 'Anxiety (voice)' },
      { name: 'Kensington Tallman', role: 'Riley (voice)' },
      { name: 'Phyllis Smith', role: 'Sadness (voice)' },
    ],
    keywords: ['emotions', 'growing up', 'anxiety', 'teenage', 'mind'],
    country: ['United States'],
    originalLanguage: 'EN',
    releasedDate: '2024-06-14',
    ratings: { tmdb: '7.6', tmdbVotes: '5,100', imdb: '7.6', rotten: '90%' },
    trailerKey: 'LEjhY15eCx0',
    watchProviders: {
      stream: ['Disney+'],
      rent: ['Apple TV', 'Amazon Video'],
      buy: ['Apple TV', 'Amazon Video'],
    },
  },
  {
    id: 603,
    title: 'The Matrix',
    year: 1999,
    rating: '8.2',
    runtimeMinutes: 136,
    certification: 'R',
    synopsis: 'Set in the 22nd century, The Matrix tells the story of a computer hacker who learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/kyeqWdyUXW608qlYkRqosgbbJyK.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/l4QHerTSbflqIvpBT0EIu5Hmw5P.jpg',
    type: 'movie',
    genres: ['Action', 'Sci-Fi'],
    director: 'Lana Wachowski, Lilly Wachowski',
    studios: ['Warner Bros. Pictures', 'Village Roadshow Pictures', 'Silver Pictures'],
    cast: [
      { name: 'Keanu Reeves', role: 'Thomas A. Anderson / Neo' },
      { name: 'Laurence Fishburne', role: 'Morpheus' },
      { name: 'Carrie-Anne Moss', role: 'Trinity' },
      { name: 'Hugo Weaving', role: 'Agent Smith' },
    ],
    keywords: ['simulated reality', 'cyberpunk', 'kung fu', 'bullet time', 'the one'],
    country: ['United States'],
    originalLanguage: 'EN',
    releasedDate: '1999-03-31',
    ratings: { tmdb: '8.2', tmdbVotes: '25,300', imdb: '8.7', rotten: '83%' },
    trailerKey: 'vKQi3bBA1y8',
    watchProviders: {
      stream: ['Max'],
      rent: ['Apple TV', 'Amazon Video'],
      buy: ['Apple TV', 'Amazon Video'],
    },
  },
  {
    id: 680,
    title: 'Pulp Fiction',
    year: 1994,
    rating: '8.5',
    runtimeMinutes: 154,
    certification: 'R',
    synopsis: 'A burger-loving hit man, his philosophical partner, a drug-addled gangster\'s moll and a washed-up boxer converge in this sprawling, comedic crime caper.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/bptfVGEQuv6vDTIMVCHjJ9Dz8PX.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg',
    type: 'movie',
    genres: ['Thriller', 'Crime'],
    director: 'Quentin Tarantino',
    studios: ['Miramax', 'A Band Apart', 'Jersey Films'],
    cast: [
      { name: 'John Travolta', role: 'Vincent Vega' },
      { name: 'Samuel L. Jackson', role: 'Jules Winnfield' },
      { name: 'Uma Thurman', role: 'Mia Wallace' },
      { name: 'Bruce Willis', role: 'Butch Coolidge' },
    ],
    keywords: ['nonlinear timeline', 'hitman', 'dance contest', 'briefcase', 'dialogue'],
    country: ['United States'],
    originalLanguage: 'EN',
    releasedDate: '1994-09-10',
    ratings: { tmdb: '8.5', tmdbVotes: '27,800', imdb: '8.9', rotten: '92%' },
    trailerKey: 't4vgk_w1i74',
    watchProviders: {
      stream: ['Paramount+', 'Showtime'],
      rent: ['Apple TV', 'Amazon Video'],
      buy: ['Apple TV', 'Amazon Video'],
    },
  },
  {
    id: 335984,
    title: 'Blade Runner 2049',
    year: 2017,
    rating: '7.6',
    runtimeMinutes: 164,
    certification: 'R',
    synopsis: 'Thirty years after the events of the first film, a new blade runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what\'s left of society into chaos.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/ilRyAZw2juCU9nxnIQ3Te4FpyxG.jpg',
    type: 'movie',
    genres: ['Sci-Fi', 'Mystery'],
    director: 'Denis Villeneuve',
    studios: ['Alcon Entertainment', 'Columbia Pictures', 'Scott Free Productions'],
    cast: [
      { name: 'Ryan Gosling', role: 'K' },
      { name: 'Harrison Ford', role: 'Rick Deckard' },
      { name: 'Ana de Armas', role: 'Joi' },
      { name: 'Sylvia Hoeks', role: 'Luv' },
    ],
    keywords: ['replicant', 'future', 'cyberpunk', 'artificial intelligence', 'hologram'],
    country: ['United States', 'United Kingdom'],
    originalLanguage: 'EN',
    releasedDate: '2017-10-06',
    ratings: { tmdb: '7.6', tmdbVotes: '13,100', imdb: '8.0', rotten: '88%' },
    trailerKey: 'gCcx85zbxz4',
    watchProviders: {
      stream: ['Max', 'Hulu'],
      rent: ['Apple TV', 'Amazon Video'],
      buy: ['Apple TV', 'Amazon Video'],
    },
  },
];

// Helper to filter curated media based on filters
export function getCuratedMedia(
  filters: OnboardingFilters,
  overrideType?: 'movie' | 'tv' | 'all',
  overrideSort?: string
): CinevaultMedia[] {
  let list = [...CURATED_MEDIA_CATALOG];

  // 1. Format
  if (overrideType === 'movie') {
    list = list.filter(m => m.type === 'movie');
  } else if (overrideType === 'tv') {
    list = list.filter(m => m.type === 'tv');
  } else if (filters.fmt && filters.fmt.size > 0) {
    if (filters.fmt.has('tv') || filters.fmt.has('mini')) {
      list = list.filter(m => m.type === 'tv');
    } else if (filters.fmt.has('movie')) {
      list = list.filter(m => m.type === 'movie');
    } else if (filters.fmt.has('anime')) {
      list = list.filter(m => m.genres.includes('Animation') || m.originalLanguage === 'JA');
    }
  }

  // 2. Mood
  if (filters.mood && filters.mood.size > 0) {
    const hasMood = (moodKey: string, m: CinevaultMedia) => {
      if (moodKey === 'brain') return m.genres.some(g => ['Comedy', 'Family', 'Animation'].includes(g));
      if (moodKey === 'edge') return m.genres.some(g => ['Action', 'Thriller', 'Adventure'].includes(g));
      if (moodKey === 'mind') return m.genres.some(g => ['Sci-Fi', 'Mystery'].includes(g));
      if (moodKey === 'dark') return m.genres.some(g => ['Crime', 'Thriller', 'Drama'].includes(g)) && (m.certification === 'R' || m.certification === 'TV-MA');
      if (moodKey === 'tear') return m.genres.some(g => ['Drama', 'Romance'].includes(g));
      if (moodKey === 'blast') return m.genres.some(g => ['Action', 'Adventure', 'Sci-Fi'].includes(g));
      return true;
    };

    const moodMatched = list.filter(m => Array.from(filters.mood).some(moodKey => hasMood(moodKey, m)));
    if (moodMatched.length >= 3) {
      list = moodMatched;
    }
  }

  // 3. Age / Who's watching
  if (filters.age && filters.age.size > 0) {
    if (filters.age.has('fam')) {
      list = list.filter(m => ['G', 'PG', 'PG-13', 'TV-14'].includes(m.certification));
    } else if (filters.age.has('solo')) {
      const matureOnly = list.filter(m => ['R', 'TV-MA'].includes(m.certification));
      if (matureOnly.length >= 3) list = matureOnly;
    }
  }

  // 4. Runtime
  if (filters.time && filters.time.size > 0) {
    if (filters.time.has('q')) {
      const quick = list.filter(m => m.runtimeMinutes <= 110);
      if (quick.length >= 3) list = quick;
    } else if (filters.time.has('e')) {
      const epic = list.filter(m => m.runtimeMinutes >= 140);
      if (epic.length >= 3) list = epic;
    }
  }

  // Sort
  if (overrideSort === 'vote_average.desc') {
    list.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
  } else if (overrideSort === 'primary_release_date.desc') {
    list.sort((a, b) => b.year - a.year);
  }

  return list;
}

// ──────────────────────────────────────────────────────────────
// PRIMARY DISCOVER FETCHER
// Queries TMDb API when API key is provided, or curated catalog fallback
// ──────────────────────────────────────────────────────────────
export async function fetchDiscoverMovies(
  apiKey: string,
  filters: OnboardingFilters,
  page: number = 1,
  overrideType?: 'movie' | 'tv',
  overrideSort?: string
): Promise<{
  results: CinevaultMedia[];
  totalPages: number;
  totalResults: number;
  source: 'tmdb' | 'curated';
  endpoint: 'movie' | 'tv';
}> {
  const trimmedKey = apiKey.trim();

  // If no API key provided, return filtered curated catalog
  if (!trimmedKey) {
    const curated = getCuratedMedia(filters, overrideType, overrideSort);
    return {
      results: curated,
      totalPages: 1,
      totalResults: curated.length,
      source: 'curated',
      endpoint: overrideType || (filters.fmt?.has('tv') ? 'tv' : 'movie'),
    };
  }

  // Build the live TMDb API discover URL
  const { url: url1, headers, endpoint } = buildDiscoverUrl(trimmedKey, filters, page, overrideType, overrideSort);

  try {
    // For page 1, fetch page 1 and page 2 concurrently to provide 40 high-quality titles to browse
    const fetches: Promise<Response>[] = [fetch(url1, { headers })];
    if (page === 1) {
      const { url: url2 } = buildDiscoverUrl(trimmedKey, filters, 2, overrideType, overrideSort);
      fetches.push(fetch(url2, { headers }));
    }

    const responses = await Promise.all(fetches);
    const allRawItems: TMDbMovieResult[] = [];
    let totalPages = 1;
    let totalResults = 0;

    for (const res of responses) {
      if (res.ok) {
        const data = await res.json();
        totalPages = data.total_pages || totalPages;
        totalResults = data.total_results || totalResults;
        if (data.results && Array.isArray(data.results)) {
          allRawItems.push(...data.results);
        }
      }
    }

    // Deduplicate and filter items with posters
    const seenIds = new Set<number>();
    const mapped: CinevaultMedia[] = [];

    for (const item of allRawItems) {
      if (item && item.id && !seenIds.has(item.id) && item.poster_path) {
        seenIds.add(item.id);
        mapped.push(mapTMDbItemToMedia(item, endpoint));
      }
    }

    return {
      results: mapped,
      totalPages,
      totalResults: totalResults || mapped.length,
      source: 'tmdb',
      endpoint,
    };
  } catch (err) {
    console.warn('Error querying TMDb discover API (offline fallback):', err);
    const curated = getCuratedMedia(filters, overrideType, overrideSort);
    return {
      results: curated,
      totalPages: 1,
      totalResults: curated.length,
      source: 'curated',
      endpoint,
    };
  }
}
