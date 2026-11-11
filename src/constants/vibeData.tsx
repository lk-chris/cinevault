import React from 'react';
import type { ScreenDef, Sel, Tab } from '../types';

export const GENRES_LIST = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
  "Drama", "Family", "Fantasy", "History", "Horror", "Music",
  "Mystery", "Romance", "Sci-Fi", "Thriller", "War", "Western"
];

export const CARD_POSTERS: Record<string, string> = {
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
  kids: 'https://image.tmdb.org/t/p/w780/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg', // Inside Out 2 (G & PG)
  fam: 'https://image.tmdb.org/t/p/w780/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',  // Spider-Man (PG-13)
  date: 'https://image.tmdb.org/t/p/w780/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg', // Titanic
  solo: 'https://image.tmdb.org/t/p/w780/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg'  // Blade Runner 2049
};

export const TIME_SVGS: Record<string, React.ReactNode> = {
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

export const SCREENS: ScreenDef[] = [
  {
    h: "What are you watching tonight?",
    s: "Choose one.",
    step: 1,
    type: "tiles",
    layout: "posters",
    groups: [{
      key: "fmt", min: 1, max: 1, opts: [
        { id: "movie", label: "Movie", desc: "Feature film, one sitting" },
        { id: "tv",    label: "TV show", desc: "Multi-season or ongoing" },
        { id: "mini",  label: "Limited series", desc: "Self-contained, 4–8 episodes" },
        { id: "anime", label: "Anime & animation", desc: "Japanese anime or animated films" },
        { id: "doc",   label: "Documentary", desc: "True crime, biography, real world" },
      ]
    }]
  },
  {
    h: "What are you in the mood for?",
    s: "Pick up to 3. We'll tune tonight's feed to match.",
    step: 2,
    type: "tiles",
    layout: "posters",
    groups: [{
      key: "mood", min: 1, max: 3, opts: [
        { id: "brain", label: "Brain-off", desc: "Comfort comedies, easy popcorn" },
        { id: "edge",  label: "Edge of your seat", desc: "Suspense, survival, action" },
        { id: "mind",  label: "Mind-bending", desc: "Sci-fi puzzles and twists" },
        { id: "dark",  label: "Dark & gritty", desc: "Neo-noir, crime, horror" },
        { id: "tear",  label: "Tearjerker", desc: "Emotional drama, romance" },
        { id: "blast", label: "Blockbuster", desc: "Big adrenaline, big screens" },
      ]
    }]
  },
  {
    h: "Which genres do you like?",
    s: "Pick at least 3. The more you choose, the better your feed.",
    step: 3,
    type: "pills",
    groups: [{
      key: "genre", min: 3, max: 99, opts: GENRES_LIST.map(g => ({ id: g, label: g }))
    }]
  },
  {
    h: "How much time do you have?",
    s: "Choose one.",
    step: 4,
    type: "tiles",
    layout: "svg_time",
    groups: [{
      key: "time", min: 1, max: 1, opts: [
        { id: "q",   label: "Quick watch", desc: "Under 90 minutes" },
        { id: "s",   label: "Standard",    desc: "90 to 120 minutes" },
        { id: "e",   label: "Epic",        desc: "2.5 hours or more" },
        { id: "any", label: "Any runtime", desc: "No limit" },
      ]
    }]
  },
  {
    h: "Who's watching?",
    s: "We'll filter by content rating.",
    step: 5,
    type: "tiles",
    layout: "posters",
    groups: [{
      key: "age", min: 1, max: 1, opts: [
        { id: "kids", label: "Kids & Family (G & PG)", desc: "Pure cartoons & family safe, G & PG only" },
        { id: "fam",  label: "Teens & Family (PG-13)", desc: "PG-13 blockbusters, superhero & action" },
        { id: "date", label: "Date night",            desc: "PG-13 or R, thrilling or romantic" },
        { id: "solo", label: "Solo / adults only",     desc: "R and mature content (18+) allowed" },
      ]
    }]
  },
  {
    h: "Any era or language in mind?",
    s: "Optional. Skip it to see everything.",
    step: 6,
    type: "pills",
    groups: [
      {
        key: "era", label: "Era", min: 0, max: 99, opts: [
          { id: "n", label: "New releases (2024–2026)" },
          { id: "a", label: "2010s hits" },
          { id: "b", label: "2000s nostalgia" },
          { id: "c", label: "90s classics" },
          { id: "g", label: "Golden age classics" },
        ]
      },
      {
        key: "lang", label: "Language", min: 0, max: 99, opts: [
          { id: "en",  label: "Hollywood / English" },
          { id: "ko",  label: "Korean" },
          { id: "ja",  label: "Japanese" },
          { id: "int", label: "International subtitled" },
        ]
      },
    ]
  },
];

export const ALL_LABELS: Record<string, string> = {};
SCREENS.forEach(sc => sc.groups.forEach(g => g.opts.forEach(o => { ALL_LABELS[o.id] = o.label; })));

export const TOTAL_STEPS = 6;

export function initSel(): Sel {
  const s: Sel = {};
  SCREENS.forEach(sc => sc.groups.forEach(g => { s[g.key] = new Set(); }));
  return s;
}

export const fm = (m: number) => `${Math.floor(m / 60)}h ${m % 60}m`;
export const ini = (n: string) => n.split(" ").map(w => w[0]).join("").slice(0, 2);

export const DEFAULT_TMDB_KEY = 'a69878c434bec64f12cee0ffb2aff577';

export const HEAD: Record<Tab, string> = {
  tonight: "Tonight's shortlist",
  wl: "Your watchlist",
  wd: "Watched"
};

export const EMP: Record<string, [string, string]> = {
  wl: ["Nothing saved yet", "Tap the bookmark on any pick in tonight's feed to keep it here."],
  wd: ["Nothing watched yet", "Tap the eye on a title you've already seen."]
};
