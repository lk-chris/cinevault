import type { Sel } from '../types';
import { TMDB_ID_TO_GENRE } from './tmdb';
import { DEFAULT_TMDB_KEY } from '../constants/vibeData';

export interface AIParsedVibe {
  fmt: string[];
  mood: string[];
  genre: string[];
  time: string[];
  age: string[];
  era: string[];
  lang: string[];
  explanation: string;
  suggestedTitles?: string[];
}

export interface AIResponse {
  filters: Sel;
  explanation: string;
  suggestedTitles: string[];
  raw: AIParsedVibe;
}

export const DEFAULT_GEMINI_KEY = 'AIzaSyA9rc7xZL6oxMHkdnNm55aSTlAyH9SOetM';

const SYSTEM_INSTRUCTION = `You are Cinevault AI, an expert cinematic curator.
Your task is to parse a user's natural language request into Cinevault's filter schema.
Allowed values for each filter:
- fmt: 'movie' (Feature film), 'tv' (TV show or animated series), 'mini' (Limited series), 'anime' (STRICTLY Japanese anime only), 'doc' (Documentary).
  CRITICAL: For Western cartoons, preschool shows, Disney, Pixar, DreamWorks, or kids animated franchises (like Paw Patrol, Bluey, SpongeBob, Peppa Pig, Minions, Toy Story), NEVER choose 'anime'. Use 'tv' or 'movie' and add 'Animation' to genre! Only use 'anime' if the user explicitly mentions Japanese anime or manga.
- mood: 'brain' (Comfort / comedy / easy popcorn / preschool), 'edge' (Suspense / action / thriller), 'mind' (Sci-fi / mystery / cerebral), 'dark' (Noir / crime / gritty drama), 'tear' (Emotional / drama / romance), 'blast' (High-octane blockbusters)
- genre: Action, Adventure, Animation, Comedy, Crime, Documentary, Drama, Family, Fantasy, History, Horror, Music, Mystery, Romance, Sci-Fi, Thriller, War, Western
- time: 'q' (<=90 min), 's' (90-125 min), 'e' (>=145 min), 'any' (Any runtime)
- age: 'kids' (G or PG, preschool, young family), 'fam' (PG-13, teens), 'date' (Date night), 'solo' (R or TV-MA, mature)
- era: 'n' (2024-2026 new releases), 'a' (2010s hits), 'b' (2000s nostalgia), 'c' (90s classics), 'g' (Golden age)
- lang: 'en' (English/Hollywood), 'ko' (Korean), 'ja' (Japanese), 'int' (International subtitled)

If the user references a specific franchise, show, movie, or character (e.g. "something like Paw Patrol", "movies like Knives Out", "shows like Stranger Things"), ALWAYS provide 4 to 6 real, directly comparable titles in suggestedTitles.
Output explanation must be one concise, encouraging sentence.
Always output valid JSON conforming to the schema.`;

/**
 * Generic Title Reference Extractor
 * Identifies if the user is asking for titles similar to an existing movie, show, or anime.
 */
export function extractReferenceTitle(prompt: string): string | null {
  const p = prompt.trim();

  // 1. Explicit quotes: "Inception" or 'Kaiju No. 8'
  const quoteMatch = p.match(/["']([^"']{2,60})["']/);
  if (quoteMatch && quoteMatch[1]) {
    return quoteMatch[1].trim();
  }

  // 2. Similarity and affinity patterns
  const patterns = [
    /(?:like|similar to|in the style of|loved|love|finished|fans of|recommendations for|recommendation for|watch next after|watch after|movies like|shows like|anime like|series like|films like|something like|anything like)\s+([^,?.!]+?)(?:\s+(?:do you|what|can you|that|where|with|under|less|more|or|and|for|please|\?|\.|\!|\,)|$)/i,
    /(?:i like|i love|i loved|i enjoyed|i watched)\s+([^,?.!]+?)(?:\s+(?:do you|what|can you|that|where|with|under|less|more|or|and|for|please|\?|\.|\!|\,)|$)/i,
  ];

  for (const pat of patterns) {
    const match = p.match(pat);
    if (match && match[1]) {
      const candidate = match[1].replace(/['"]/g, '').trim();
      const stopWords = /^(movie|movies|show|shows|anime|film|films|series|something|anything|what|good|great|nothing|any|recommendations?)$/i;
      if (candidate.length >= 2 && !stopWords.test(candidate)) {
        return candidate;
      }
    }
  }

  // 3. Short standalone title search (e.g., user directly entered "Interstellar" or "Succession")
  const words = p.split(/\s+/);
  const isGenericVibe = /^(short|funny|sad|dark|action|comedy|horror|drama|date night|family|mind bending|scifi|sci-fi|romantic|thriller|quick|epic)$/i.test(p);
  const hasTimeOrConstraint = /under|hours|minutes|tonight|date night|family safe|with subtitles/i.test(p);
  if (words.length <= 4 && !isGenericVibe && !hasTimeOrConstraint) {
    const candidate = p.replace(/[?.!]$/, '').trim();
    if (candidate.length >= 2) return candidate;
  }

  return null;
}

/**
 * Dynamic Universal Franchise & Recommendation Resolver
 * Queries TMDb's live multi-search and recommendation endpoints to dynamically resolve
 * ANY movie, TV series, or anime referenced by the user.
 */
export async function resolveDynamicRecommendations(
  titleQuery: string,
  tmdbApiKey: string = DEFAULT_TMDB_KEY
): Promise<{
  matchedTitle: string;
  mediaType: 'movie' | 'tv';
  isAnime: boolean;
  genres: string[];
  suggestedTitles: string[];
} | null> {
  const trimmedKey = tmdbApiKey.trim() || DEFAULT_TMDB_KEY;
  const isBearer = trimmedKey.startsWith('ey') || trimmedKey.length > 50;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (isBearer) headers['Authorization'] = `Bearer ${trimmedKey}`;

  try {
    const searchUrl = isBearer
      ? `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(titleQuery)}&include_adult=false&language=en-US`
      : `https://api.themoviedb.org/3/search/multi?api_key=${encodeURIComponent(trimmedKey)}&query=${encodeURIComponent(titleQuery)}&include_adult=false&language=en-US`;

    const res = await fetch(searchUrl, { headers });
    if (!res.ok) return null;
    const data = await res.json();
    const hits = (data.results || []).filter(
      (h: any) => h && h.poster_path && (h.media_type === 'movie' || h.media_type === 'tv')
    );
    if (hits.length === 0) return null;

    const top = hits[0];
    const type: 'movie' | 'tv' = top.media_type === 'tv' ? 'tv' : 'movie';
    const isAnime = top.original_language === 'ja' && ((top.genre_ids || []).includes(16) || (top.overview || '').toLowerCase().includes('anime'));
    const matchedName = top.name || top.title || titleQuery;

    // Fetch official TMDb recommendations for this title
    const recsUrl = isBearer
      ? `https://api.themoviedb.org/3/${type}/${top.id}/recommendations?language=en-US`
      : `https://api.themoviedb.org/3/${type}/${top.id}/recommendations?api_key=${encodeURIComponent(trimmedKey)}&language=en-US`;

    let recTitles: string[] = [];
    try {
      const recsRes = await fetch(recsUrl, { headers });
      if (recsRes.ok) {
        const recsData = await recsRes.json();
        recTitles = (recsData.results || [])
          .filter((r: any) => r && r.poster_path)
          .slice(0, 5)
          .map((r: any) => r.name || r.title)
          .filter(Boolean);
      }
    } catch {}

    // Map genre IDs to human-readable genres
    const genreNames = (top.genre_ids || [])
      .map((id: number) => TMDB_ID_TO_GENRE[id])
      .filter(Boolean);

    return {
      matchedTitle: matchedName,
      mediaType: type,
      isAnime,
      genres: genreNames,
      suggestedTitles: [matchedName, ...recTitles]
    };
  } catch (err) {
    console.warn('Failed dynamic recommendation resolution:', err);
    return null;
  }
}

/**
 * Intelligent Semantic Attribute Fallback Parser
 * Handles non-title vibe requests ("short funny comedy for date night", "mind-bending sci-fi", etc.)
 */
function parsePromptLocally(prompt: string): AIParsedVibe {
  const p = prompt.toLowerCase();

  const fmt = new Set<string>();
  const mood = new Set<string>();
  const genre = new Set<string>();
  const time = new Set<string>();
  const age = new Set<string>();
  const era = new Set<string>();
  const lang = new Set<string>();
  let suggestedTitles: string[] = [];
  let explanation = "Here's what I picked up from your vibe.";

  // 1. Format
  if (/anime|manga|ghibli/.test(p)) {
    fmt.add('anime');
    genre.add('Animation');
    lang.add('ja');
  } else if (/cartoon|animation|animated|disney|pixar/.test(p)) {
    genre.add('Animation');
    if (/show|series|episode/.test(p)) fmt.add('tv');
    else fmt.add('movie');
  } else if (/series|tv show|tv series|binge|episodes/.test(p)) {
    fmt.add('tv');
  } else if (/mini ?series|limited series/.test(p)) {
    fmt.add('mini');
  } else if (/doc|documentary|true crime|true story/.test(p)) {
    fmt.add('doc');
  } else {
    fmt.add('movie');
  }

  // 3. Mood
  if (/dark|gritty|noir|intense|grim/.test(p)) {
    mood.add('dark');
    genre.add('Crime');
    genre.add('Thriller');
  }
  if (/mind|puzzle|twist|cerebral|trippy|complex/.test(p)) {
    mood.add('mind');
    genre.add('Mystery');
    genre.add('Sci-Fi');
  }
  if (/funny|laugh|comedy|hilarious|cozy|chill|comfort|easy|brain-off/.test(p)) {
    mood.add('brain');
    genre.add('Comedy');
  }
  if (/thriller|suspense|edge|tense|heart-pounding/.test(p)) {
    mood.add('edge');
    genre.add('Thriller');
  }
  if (/cry|sad|tearjerker|emotional|heartbreak/.test(p)) {
    mood.add('tear');
    genre.add('Drama');
  }
  if (/action|blockbuster|explosion|adrenaline|superhero/.test(p)) {
    mood.add('blast');
    genre.add('Action');
  }

  // 4. Genres
  if (/horror|scary|creepy|spooky|gory/.test(p)) genre.add('Horror');
  if (/romance|romantic|love story|chick flick/.test(p)) genre.add('Romance');
  if (/sci-?fi|space|alien|future|cyber/.test(p)) genre.add('Sci-Fi');
  if (/adventure|quest|journey|treasure/.test(p)) genre.add('Adventure');
  if (/fantasy|magic|dragons|wizard/.test(p)) genre.add('Fantasy');
  if (/history|historical|period piece|biopic/.test(p)) genre.add('History');
  if (/war|military|battle|wwii|soldier/.test(p)) genre.add('War');
  if (/western|cowboy/.test(p)) genre.add('Western');

  // 5. Age & Audience
  if (/kids|children|preschool|toddler|family safe|g-rated/.test(p)) {
    age.add('kids');
    genre.add('Family');
    genre.add('Animation');
  } else if (/family|teen|pg-13/.test(p)) {
    age.add('fam');
  } else if (/date|partner|girlfriend|boyfriend|couple/.test(p)) {
    age.add('date');
  } else if (/adult|mature|r-rated|solo|unrestricted/.test(p)) {
    age.add('solo');
  }

  // 6. Runtime
  if (/short|quick|under 90|not too long|under an hour/.test(p)) {
    time.add('q');
  } else if (/epic|long|3 hours|marathon/.test(p)) {
    time.add('e');
  } else if (/standard|2 hours|regular/.test(p)) {
    time.add('s');
  } else {
    time.add('any');
  }

  // 7. Era
  if (/new|recent|latest|2024|2025|2026/.test(p)) {
    era.add('n');
  } else if (/90s|nineties/.test(p)) {
    era.add('c');
  } else if (/2000s|nostalgia/.test(p)) {
    era.add('b');
  } else if (/classic|old school|vintage|golden age/.test(p)) {
    era.add('g');
  }

  // 8. Language
  if (/korean|k-drama/.test(p)) {
    lang.add('ko');
  } else if (/japanese|anime/.test(p)) {
    lang.add('ja');
  } else if (/international|subtitled|foreign|french|spanish|german/.test(p)) {
    lang.add('int');
  } else {
    lang.add('en');
  }

  // Generate encouraging explanation
  const gList = Array.from(genre).slice(0, 3).join(', ');
  explanation = gList
    ? `Curated top ${gList} titles matching your vibe.`
    : "Curated tailored picks based on your request.";

  return {
    fmt: Array.from(fmt),
    mood: Array.from(mood),
    genre: Array.from(genre),
    time: Array.from(time),
    age: Array.from(age),
    era: Array.from(era),
    lang: Array.from(lang),
    explanation,
    suggestedTitles,
  };
}

export async function parseVibePromptWithAI(
  userPrompt: string,
  apiKey: string = DEFAULT_GEMINI_KEY,
  tmdbApiKey: string = DEFAULT_TMDB_KEY
): Promise<AIResponse> {
  const trimmedKey = (apiKey || DEFAULT_GEMINI_KEY).trim();
  const workerUrl = (import.meta as any).env?.VITE_WORKER_URL;

  // ─── 1. TRY SAME-ORIGIN CLOUDFLARE ENDPOINT (/api/ai-vibe) ───
  try {
    const res = await fetch('/api/ai-vibe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userPrompt.trim() }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.filters) {
        return {
          filters: {
            fmt: new Set(data.filters.fmt || ['movie']),
            mood: new Set(data.filters.mood || []),
            genre: new Set(data.filters.genre || []),
            time: new Set(data.filters.time || ['any']),
            age: new Set(data.filters.age || []),
            era: new Set(data.filters.era || []),
            lang: new Set(data.filters.lang || []),
          },
          explanation: data.explanation || 'Curated using Cinevault AI.',
          suggestedTitles: Array.isArray(data.suggestedTitles) ? data.suggestedTitles : [],
          raw: data.filters,
        };
      }
    }
  } catch (e) {
    // Continue to external worker URL or fallback
  }

  // ─── 2. TRY EXTERNAL CLOUDFLARE WORKER IF CONFIGURED ───
  if (workerUrl) {
    try {
      const res = await fetch(`${workerUrl.replace(/\/$/, '')}/api/ai-vibe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.filters) {
          return {
            filters: {
              fmt: new Set(data.filters.fmt || ['movie']),
              mood: new Set(data.filters.mood || []),
              genre: new Set(data.filters.genre || []),
              time: new Set(data.filters.time || ['any']),
              age: new Set(data.filters.age || []),
              era: new Set(data.filters.era || []),
              lang: new Set(data.filters.lang || []),
            },
            explanation: data.explanation || 'Curated using Cinevault AI.',
            suggestedTitles: Array.isArray(data.suggestedTitles) ? data.suggestedTitles : [],
            raw: data.filters,
          };
        }
      }
    } catch (workerErr) {
      console.warn('Cloudflare Worker call failed, trying direct Gemini or dynamic resolver:', workerErr);
    }
  }

  // ─── 3. TRY DIRECT GEMINI API CALL ───
  if (trimmedKey && !trimmedKey.startsWith('AIzaSyA9rc7x')) {
    const models = ['gemini-3.5-flash-lite', 'gemini-3.8-flash'];
    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${trimmedKey}`;

        const requestBody = {
          contents: [{ role: 'user', parts: [{ text: userPrompt.trim() }] }],
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                fmt: { type: 'ARRAY', items: { type: 'STRING' } },
                mood: { type: 'ARRAY', items: { type: 'STRING' } },
                genre: { type: 'ARRAY', items: { type: 'STRING' } },
                time: { type: 'ARRAY', items: { type: 'STRING' } },
                age: { type: 'ARRAY', items: { type: 'STRING' } },
                era: { type: 'ARRAY', items: { type: 'STRING' } },
                lang: { type: 'ARRAY', items: { type: 'STRING' } },
                explanation: { type: 'STRING' },
                suggestedTitles: { type: 'ARRAY', items: { type: 'STRING' } },
              },
              required: ['fmt', 'genre', 'age', 'lang', 'explanation'],
            },
          },
        };

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (res.ok) {
          const data = await res.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed: AIParsedVibe = JSON.parse(rawText);
            const filters: Sel = {
              fmt: new Set(parsed.fmt && parsed.fmt.length > 0 ? parsed.fmt : ['movie']),
              mood: new Set(parsed.mood || []),
              genre: new Set(parsed.genre || []),
              time: new Set(parsed.time && parsed.time.length > 0 ? parsed.time : ['any']),
              age: new Set(parsed.age || []),
              era: new Set(parsed.era || []),
              lang: new Set(parsed.lang || []),
            };

            return {
              filters,
              explanation: parsed.explanation || 'Curated using Cinevault AI.',
              suggestedTitles: Array.isArray(parsed.suggestedTitles) ? parsed.suggestedTitles : [],
              raw: parsed,
            };
          }
        }
      } catch (err) {
        console.warn(`Direct Gemini call failed on ${model}:`, err);
      }
    }
  }

  // ─── 4. DYNAMIC TMDB FRANCHISE & RECOMMENDATION RESOLUTION ───
  // Works universally for ANY movie, TV series, or anime referenced by the user
  const refTitle = extractReferenceTitle(userPrompt);
  if (refTitle) {
    const dynamicRecs = await resolveDynamicRecommendations(refTitle, tmdbApiKey);
    if (dynamicRecs && dynamicRecs.suggestedTitles.length > 0) {
      const filters: Sel = {
        fmt: new Set([dynamicRecs.isAnime ? 'anime' : dynamicRecs.mediaType]),
        mood: new Set(dynamicRecs.isAnime ? ['blast', 'edge'] : []),
        genre: new Set(dynamicRecs.genres),
        time: new Set(['any']),
        age: new Set([]),
        era: new Set(['n']),
        lang: new Set(dynamicRecs.isAnime ? ['ja'] : ['en']),
      };

      const explanation = `Curated titles similar to ${dynamicRecs.matchedTitle} with matching tone and style.`;

      return {
        filters,
        explanation,
        suggestedTitles: dynamicRecs.suggestedTitles,
        raw: {
          fmt: Array.from(filters.fmt),
          mood: Array.from(filters.mood),
          genre: Array.from(filters.genre),
          time: Array.from(filters.time),
          age: Array.from(filters.age),
          era: Array.from(filters.era),
          lang: Array.from(filters.lang),
          explanation,
          suggestedTitles: dynamicRecs.suggestedTitles,
        },
      };
    }
  }

  // ─── 5. HIGH-PRECISION SEMANTIC ATTRIBUTE FALLBACK ───
  // Handles non-franchise vibe requests ("Something short and funny", "Mind-bending thriller", etc.)
  const localParsed = parsePromptLocally(userPrompt);
  const filters: Sel = {
    fmt: new Set(localParsed.fmt),
    mood: new Set(localParsed.mood),
    genre: new Set(localParsed.genre),
    time: new Set(localParsed.time),
    age: new Set(localParsed.age),
    era: new Set(localParsed.era),
    lang: new Set(localParsed.lang),
  };

  return {
    filters,
    explanation: localParsed.explanation,
    suggestedTitles: localParsed.suggestedTitles || [],
    raw: localParsed,
  };
}
