# Cinevault

A mobile-first, vibe-driven movie and TV discovery web application powered by **The Movie Database (TMDb) API**.

Live Application: [https://lk-chris.github.io/cinevault/](https://lk-chris.github.io/cinevault/)

---

## Features

- **Vibe-Driven Onboarding**: 6-step personalized curation flow tuning format, mood, genres, runtime, content rating, release era, and language.
- **TMDb Discover Integration**: Direct connection to TMDb's `/discover/movie` and `/discover/tv` endpoints.
- **2:3 Cinema Aspect Ratio Cards**: Accurate, undistorted vertical poster layout matching cinematic standards.
- **Real YouTube Trailers**: Embedded trailer playback inside interactive bottom sheets.
- **Where to Watch**: Instant streaming, rental, and digital purchase availability powered by JustWatch & TMDb.
- **Watchlist & Watched Tracking**: Local storage persistence with badge counters and quick bookmark actions.
- **Dark Cinema Aesthetic**: Modern dark theme (`#0A0A0C` background, `#141519` surfaces, `#F59E0B` amber accent).

---

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 8**
- **Tailwind CSS**
- **Lucide Icons**
- **TMDb v3 / v4 API**

---

## Development

```bash
# Clone the repository
git clone https://github.com/lk-chris/cinevault.git
cd cinevault

# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build
```

---

## License

This product uses the TMDb API but is not endorsed or certified by TMDb.
