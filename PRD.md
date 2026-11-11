# Cinevault — Product Requirement Document (PRD)

**Project Name:** Cinevault  
**Version:** 1.0.0  
**Target Platform:** Web (Desktop & Mobile Responsive)  
**Tech Stack Recommended:** React 19 / Next.js / Vite, TypeScript, Tailwind CSS, Lucide Icons, TMDb API (+ optional OMDb for Rotten Tomatoes/IMDb ratings)

---

## 1. Executive Summary & Vision

Cinevault is a cinematic, modern web application designed to solve the **"What should we watch tonight?"** decision fatigue. 

Inspired by the dark-mode aesthetic of platforms like Phonofilm and Letterboxd, Cinevault pairs high-impact visuals (backdrop hero banners, rich horizontal content carousels, cast portraits, and multi-source ratings) with a **dynamic 4-step onboarding recommendation engine**.

Instead of endlessly scrolling through generic catalog grids, users answer a quick 15-second "Tonight's Vibe" questionnaire. Cinevault translates those answers into real-time discovery queries using **The Movie Database (TMDb) API**, instantly curating a tailored feed of movies, series, or anime.

---

## 2. Target Personas & Use Cases

1. **The Solo Cinephile:** Looking for high-rated, dark & gritty, or mind-bending movies (often indie/hidden gems or R-rated psychological thrillers) with detailed cast, director, and studio metadata.
2. **The "Brain-Off" Evening Viewer:** Tired after work, needs a fast, under-90-minute comedy or popcorn action movie with no complex setup.
3. **The Date-Night Couple:** Needs a mutual compromise — captivating, witty, or thrilling without uncomfortable scenes (PG-13 or balanced drama/romance).
4. **The Family / Weekend Watcher:** Needs strict family-friendly filtering (G / PG / PG-13 only) with universal appeal and zero explicit content.

---

## 3. UI/UX Design System (Phonofilm Reference)

### 3.1 Color Palette
* **Canvas Background:** Deep Void `#0A0A0C`
* **Surface / Container Background:** `#141519`
* **Elevated / Interactive Surface:** `#1C1D22` (hover: `#2A2B32`)
* **Accent Primary:** Electric Amber `#F59E0B` (glow: `rgba(245, 158, 11, 0.35)`)
* **Borders / Separators:** `rgba(255, 255, 255, 0.08)`
* **Text Colors:**
  * Primary: `#FFFFFF`
  * Secondary / Meta: `#9CA3AF` (Gray-400)
  * Subtle / Placeholders: `#6B7280` (Gray-500)
  * Amber Accent Text: `#F59E0B`

### 3.2 Visual Treatment & Component Guidelines
* **Backdrop Imagery:** Full-bleed cinematic backdrops with radial and linear gradient fades (`to-bottom`, `to-right`) into `#0A0A0C`.
* **Poster Aspect Ratio:** Strict `2:3` aspect ratio for movie/TV cards.
* **Border Radii:** Rounded cards (`rounded-2xl`), pill action buttons (`rounded-full`), avatars (`rounded-xl` / `rounded-full`).
* **Hover Micro-Interactions:** 
  * Cards elevate subtly (`group-hover:scale-105` or inner image zoom `scale-110`).
  * Circular Play button (top-left) fades in on card hover.
  * Vertical quick-action stack (top-right: Bookmark, Eye/Watched, Download) translates into view on hover.

---

## 4. Feature Specifications & Core Modules

### Module 1: "Tonight's Vibe" Onboarding Wizard

A high-converting, Pinterest/TikTok-style interactive questionnaire presented on first load (or triggered via a "Change Tonight's Vibe" pill button on the dashboard).

#### Step 1: Media Format
* Options:
  * 🎬 **Movie** (Feature film, standalone experience)
  * 📺 **TV Show / Series** (Multi-season or ongoing story)
  * ⏱️ **Limited / Miniseries** (Self-contained 4–8 episode binge)
  * 🎨 **Anime & Animation** (Japanese anime or animated features)
  * 📖 **Documentary** (Real-world, true crime, biography)

#### Step 2: Desired Vibe & Mood
* Options:
  * 🛋️ **Brain-Off / Low-Energy** (Comfort comedies, easy popcorn entertainment)
  * ⚡ **Edge-of-Your-Seat** (High suspense, survival, action thrillers)
  * 🌀 **Mind-Bending & Twists** (Sci-fi puzzles, psychological mysteries)
  * 🖤 **Dark & Gritty** (Neo-noir, crime syndicates, visceral psychological horror)
  * 😢 **Tearjerker & Deep** (Emotional drama, moving romance)
  * 🍿 **Blockbuster Spectacular** (High adrenaline, massive production spectacle)

#### Step 3: Time Budget / Runtime
* Options:
  * ⚡ **Quick Watch:** Under 90 minutes
  * ⏱️ **Standard Movie:** 90 – 120 minutes
  * 🌌 **Epic Experience:** 2.5 hours+ (150+ minutes)
  * ♾️ **Any Runtime / Don't Care**

#### Step 4: Company & Content Rating (Age Filter)
* Options:
  * 👤 **Solo / Adults Only** (Allows R, NC-17, Mature TV-MA)
  * 🥂 **Date Night** (PG-13 / R thrilling or romantic)
  * 👨‍👩‍👧‍👦 **Family / Kids Safe** (Strictly G, PG, PG-13; excludes graphic violence or explicit themes)

#### Step 5: Era & Language Flavors (Optional / Multi-select)
* **Eras:** New Releases (2025–2026), 2010s Hits, 2000s Nostalgia, 90s Classics, Golden Age Classics.
* **Languages:** Hollywood / English, Korean (K-Cinema/K-Drama), Japanese (Anime/J-Films), International Subtitled.

*Action:* Clicking **"Curate My Feed →"** instantly compiles these filters into a TMDb API request and navigates the user to the customized Home Dashboard.

---

### Module 2: Navigation & Catalog Dashboard

#### 2.1 Sticky Top Navigation Bar
* **Logo:** `Cine`**`Vault`** with amber branding.
* **Category Switcher Pills:** `Movie` | `TV Show` | `Anime` | `Asian`.
* **Global Search Bar:** Real-time search with debounced autocomplete (title, actor, director).
* **Profile / Watchlist Button:** Quick access to saved titles.

#### 2.2 Active Vibe Header
* Displays active filter chips: e.g. `Tonight's Vibe: Mind-Bending • Standard (90-120m) • PG-13`.
* Includes a **"Reset / Change Vibe"** link to re-open the wizard.

#### 2.3 Horizontal Content Rails (Carousels)
1. **"Curated For Tonight" Rail:** The direct output of the onboarding wizard.
2. **"Latest >" Rail:** New arrivals with filter pills (`Movie`, `TV Show`, `Anime`, `Asian`).
3. **"Trending This Week >" Rail:** Global popular releases.
4. **"Critically Acclaimed Hidden Gems >" Rail:** High rating (7.5+), lower vote count (<2000).
5. **"Top Box Office / Fan Favorites >" Rail:** Highest popularity & vote count.

#### 2.4 Movie Card Component (Reference Screenshot 2)
* Poster image in 2:3 aspect ratio with rounded corners.
* **Hover Elements:**
  * Top-Left: Amber play button circle.
  * Top-Right: Quick action vertical toolbar:
    * 🔖 Bookmark (Add to Watchlist)
    * 👁️ Eye icon (Mark as Watched)
    * 📥 Download / Stream options shortcut
* **Under-Card Info:**
  * Title (font-semibold, single line truncated)
  * Row: Status badge (`Added` in amber) • Star rating (`★ 7.8`) • Year pill (`2026`)

---

### Module 3: Movie / TV Detail View (Reference Screenshot 1)

Presented as an immersive overlay modal or dedicated route:

#### 3.1 Hero Section
* Full-width backdrop image with gradient overlay fading to `#0A0A0C`.
* Top-left `X` close / back navigation.
* Title in bold typography (3xl–5xl).
* Synopsis / Logline (clamped to 3–4 lines with read-more toggle).
* Metadata line: `[ R ]` age badge • `★ 7.8 TMDb` • `Year: 2026` • `1h 38m` • `Genres: Horror • Psychological`.
* **Action Buttons:**
  * ▶ **Stream / Watch Options** (Primary white button: triggers "Where to Watch" modal powered by JustWatch/TMDb).
  * ⚡ **Fast Cloud / Quick Preview** (Secondary outlined amber button).
  * 🎬 **Trailer** (Dark surface button: opens YouTube trailer modal via TMDb key).
  * 🔖 **Bookmark / Watchlist** toggle.
  * 👍 **Like / Favorite** toggle.
  * ↗ **Share** button.
* **Watch Status Dropdown:** `Plan to Watch` | `Watching` | `Completed` | `Dropped`.

#### 3.2 Metadata & Production Details
* **Keywords / Tags:** Dynamic tag chips (e.g. `late night watchers`, `fever`, `mind games`).
* **Country of Origin:** e.g. `United States, Iceland`.
* **Director Card:** Director portrait avatar, name, and "Director" label.
* **Studios Card:** Production company logos and studio names (e.g. `Kaleidoscope Film`, `A24`).
* **Cast Carousel:** Headshot cards with actor real name and character name, plus a `+X More` overflow button.

#### 3.3 Multi-Source Ratings Grid
* **TMDb Score:** e.g. `7.8 / 10` (with total vote count).
* **IMDb Score:** e.g. `8.2 / 10` (fetched via OMDb or linked to IMDb ID).
* **Rotten Tomatoes:** e.g. `88%` Tomatometer score.
* **Letterboxd Indicator:** Score & community view metrics.
* *Footnote:* "Scores reliably aggregated across the web."

#### 3.4 Community & Personal Review Module
* **"Rate this title":** Interactive 5-star rating selector with instant state feedback.
* **"Share your thoughts":** Textarea for user review with a "Post Review" button.
* *Storage:* Persisted in Supabase / LocalStorage.

#### 3.5 "More Like This" Recommendations
* Horizontal carousel displaying similar titles (fetched via TMDb `/movie/{id}/recommendations`).

---

## 5. Technical Architecture & API Mapping

### 5.1 Primary API: The Movie Database (TMDb v3)

| Frontend Feature | TMDb API Endpoint | Query Parameters / Implementation |
| :--- | :--- | :--- |
| **Movie Catalog** | `GET /3/discover/movie` | `include_adult=false&sort_by=popularity.desc` |
| **TV Catalog** | `GET /3/discover/tv` | `include_adult=false&sort_by=popularity.desc` |
| **Anime Tab** | `GET /3/discover/tv` | `with_genres=16&with_original_language=ja` |
| **Asian Tab** | `GET /3/discover/movie` or `/tv` | `with_origin_country=KR\|JP\|CN\|HK\|TW\|TH` |
| **Runtime Filter (<90m)** | `GET /3/discover/movie` | `with_runtime.lte=90` |
| **Runtime (90–120m)** | `GET /3/discover/movie` | `with_runtime.gte=90&with_runtime.lte=120` |
| **Runtime (Epic 150m+)** | `GET /3/discover/movie` | `with_runtime.gte=150` |
| **Family Safe (PG-13 max)** | `GET /3/discover/movie` | `certification_country=US&certification.lte=PG-13` |
| **Adults Only (R rating)** | `GET /3/discover/movie` | `certification_country=US&certification=R` |
| **Hidden Gems** | `GET /3/discover/movie` | `sort_by=vote_average.desc&vote_average.gte=7.5&vote_count.gte=150&vote_count.lte=2000` |
| **Where to Watch** | `GET /3/movie/{id}/watch/providers` | Returns JustWatch flatrate/rent/buy providers per country |
| **Cast & Crew** | `GET /3/movie/{id}/credits` | Returns cast array with `profile_path` and crew with `job='Director'` |
| **Trailers** | `GET /3/movie/{id}/videos` | Filter for `site === 'YouTube' && type === 'Trailer'` |
| **Similar Titles** | `GET /3/movie/{id}/recommendations` | Returns related titles for "More like this" |

### 5.2 Mood-to-TMDb Parameter Mapping

Because TMDb does not have an explicit `mood=` parameter, Cinevault maps moods using genre IDs and keywords:

```typescript
export const MOOD_QUERY_MAP = {
  "brain-off": {
    with_genres: "35,10751",        // Comedy, Family
    without_genres: "27,53,18",     // Exclude Horror, Thriller, Heavy Drama
    sort_by: "popularity.desc"
  },
  "edge-of-seat": {
    with_genres: "53,28",           // Thriller, Action
    sort_by: "popularity.desc"
  },
  "mind-bending": {
    with_genres: "878,9648",        // Sci-Fi, Mystery
    with_keywords: "9717|11579|1562", // Time travel, Plot twist, Psychological
    sort_by: "vote_average.desc"
  },
  "dark-gritty": {
    with_genres: "80,53,27",        // Crime, Thriller, Horror
    without_genres: "35,10751",     // Exclude Comedy, Family
    sort_by: "popularity.desc"
  },
  "tearjerker": {
    with_genres: "18,10749",        // Drama, Romance
    sort_by: "vote_average.desc"
  }
};
```

### 5.3 Multi-Platform Ratings (OMDb Hybrid Strategy)
* **TMDb Rating:** Native from `/movie/{id}` (`vote_average`, `vote_count`).
* **IMDb & Rotten Tomatoes Scores:**
  1. Retrieve `imdb_id` from TMDb `/movie/{id}/external_ids`.
  2. Query OMDb: `https://www.omdbapi.com/?i=${imdb_id}&apikey=${OMDB_KEY}`.
  3. Extract IMDb score and Rotten Tomatoes percentage from OMDb's `Ratings` array.
* **Letterboxd:** Displayed as an aggregated community rating or mocked placeholder if partner API access is unavailable.

### 5.4 Client Data Persistence
* **User Watchlists, "Watched" History, and Written Reviews:** Stored in LocalStorage or Supabase.

---

## 6. Implementation Milestones

* **Milestone 1 (UI & Scaffolding):** Scaffold React + Vite + Tailwind CSS in `C:\Users\niina\Desktop\Cinevault`. Build the 4-step Onboarding modal and responsive navigation shell.
* **Milestone 2 (Catalog Rails & Cards):** Implement the MovieCard component with hover actions, and build horizontal snap rails for Latest, Trending, and Filtered titles.
* **Milestone 3 (TMDb API Integration):** Connect live TMDb API calls to power the dynamic filters, search query autocomplete, and poster image CDNs.
* **Milestone 4 (Detail View & Player):** Build the full-screen Detail View overlay with cast avatars, studio metadata, YouTube trailer modal, and "Where to Watch" streaming provider drawer.
* **Milestone 5 (User Interactions):** Wire up Watchlist, Star Ratings, and review submissions with local persistence.
