import type { Sel } from '../types';

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
Output explanation must be one concise, encouraging sentence (e.g., "Found fun animated rescue adventures and preschool shows like Paw Patrol.").
Always output valid JSON conforming to the schema.`;

export async function parseVibePromptWithAI(
  userPrompt: string,
  apiKey: string = DEFAULT_GEMINI_KEY
): Promise<AIResponse> {
  const trimmedKey = (apiKey || DEFAULT_GEMINI_KEY).trim();
  if (!trimmedKey) {
    throw new Error('Gemini API key is required');
  }

  const models = ['gemini-3.5-flash-lite', 'gemini-3.8-flash'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${trimmedKey}`;

      const requestBody = {
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt.trim() }],
          },
        ],
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }],
        },
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

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`Gemini model ${model} failed with ${res.status}:`, errText);
        lastError = new Error(`HTTP ${res.status}: ${errText}`);
        continue;
      }

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error('Gemini returned empty response');
      }

      const parsed: AIParsedVibe = JSON.parse(rawText);

      // Convert arrays to Set format required by Cinevault's Sel state
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
    } catch (err: any) {
      console.warn(`Error using ${model}:`, err);
      lastError = err;
    }
  }

  throw lastError || new Error('Failed to generate vibe with AI.');
}
