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

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json().catch(() => ({}));
    const prompt = (body.prompt || '').trim();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const rawKey = env.GEMINI_API_KEY || '';
    const apiKey = (rawKey && !rawKey.startsWith('AIzaSyA9rc7x'))
      ? rawKey
      : atob('QVEuQWI4Uk42S182SVU1cmpCOHY0allGY3VRYjBHUjZRNGk1cnRyWmZyYXBhcEhfS015YkE=');

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

    const geminiBody = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
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

    const res = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
    });

    if (!res.ok) {
      const errText = await res.text();
      return new Response(
        JSON.stringify({ error: `Gemini API error: ${res.status}`, details: errText }),
        { status: res.status, headers: CORS_HEADERS }
      );
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return new Response(
        JSON.stringify({ error: 'Empty response from Gemini' }),
        { status: 502, headers: CORS_HEADERS }
      );
    }

    const parsed = JSON.parse(rawText);

    return new Response(
      JSON.stringify({
        success: true,
        filters: {
          fmt: parsed.fmt || ['movie'],
          mood: parsed.mood || [],
          genre: parsed.genre || [],
          time: parsed.time || ['any'],
          age: parsed.age || [],
          era: parsed.era || [],
          lang: parsed.lang || [],
        },
        explanation: parsed.explanation || 'Curated using Cinevault AI.',
        suggestedTitles: parsed.suggestedTitles || [],
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || 'Internal Server Error' }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
