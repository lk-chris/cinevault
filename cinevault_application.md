import React, { useState, useEffect } from 'react';
import { 
  Search, Play, Bookmark, Eye, Download, ChevronRight, 
  Star, ThumbsUp, Share2, X, Check, ArrowRight
} from 'lucide-react';

// --- MOCK DATA ---
const mockMovies = [
  {
    id: "other-mommy-2026",
    title: "Other Mommy",
    year: 2026,
    rating: 4.4,
    ageRating: "R",
    runtime: "1h 38m",
    genres: ["Horror", "Psychological"],
    poster: "https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=400&q=80",
    backdrop: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    synopsis: "Behind a 6-year-old child's routine frame with mental problems, confronts a malevolence which comes out of her closet. The presence, whom she calls 'Other Mommy' becomes increasingly threatening to her and her family.",
    director: "Paul Vance",
    cast: ["Jessica Chastain", "Jon Bernthal", "Julian Hilliard"],
    ratings: { imdb: "5.3", tmdb: "4.4", rotten: "19%" }
  },
  {
    id: "the-odyssey-2026",
    title: "The Odyssey",
    year: 2026,
    rating: 8.8,
    ageRating: "R",
    runtime: "2h 15m",
    genres: ["Action", "Adventure"],
    poster: "https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?auto=format&fit=crop&w=400&q=80",
    backdrop: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
    synopsis: "A gritty retelling of the classic epic.",
    director: "Jane Doe",
    cast: ["Oscar Isaac", "Rebecca Ferguson"],
    ratings: { imdb: "8.5", tmdb: "8.8", rotten: "92%" }
  },
  {
    id: "heart-of-beast-2026",
    title: "Heart of the Beast",
    year: 2026,
    rating: 6.7,
    ageRating: "PG-13",
    runtime: "1h 50m",
    genres: ["Drama", "Thriller"],
    poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80",
    backdrop: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1200&q=80",
    synopsis: "A survival story set in the deep wilderness.",
    director: "John Smith",
    cast: ["Brad Pitt", "Tom Hardy"],
    ratings: { imdb: "6.9", tmdb: "6.7", rotten: "65%" }
  }
];

const PREFERENCE_OPTIONS = {
  genres: ["Action", "Horror", "Sci-Fi", "Comedy", "Romance", "Thriller", "Animation", "Drama"],
  eras: ["New Releases", "2010s", "2000s", "90s", "80s Classics"],
  moods: ["Dark & Gritty", "Lighthearted", "Mind-Bending", "Tearjerker", "Feel Good", "Adrenaline Rush"]
};

// --- COMPONENTS ---

// 1. Preference Selector (The TikTok/Pinterest Style Onboarding)
const PreferenceSelector = ({ onComplete }) => {
  const [selections, setSelections] = useState({ genres: [], eras: [], moods: [] });

  const toggleSelection = (category, item) => {
    setSelections(prev => {
      const isSelected = prev[category].includes(item);
      return {
        ...prev,
        [category]: isSelected 
          ? prev[category].filter(i => i !== item)
          : [...prev[category], item]
      };
    });
  };

  const SelectionGrid = ({ title, category, options }) => (
    <div className="mb-10">
      <h3 className="text-xl font-semibold mb-4 text-white">{title}</h3>
      <div className="flex flex-wrap gap-3">
        {options.map(option => {
          const isSelected = selections[category].includes(option);
          return (
            <button
              key={option}
              onClick={() => toggleSelection(category, option)}
              className={`px-5 py-3 rounded-full text-sm font-medium transition-all duration-200 border flex items-center gap-2
                ${isSelected 
                  ? 'bg-amber-500 border-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]' 
                  : 'bg-[#1C1D22] border-white/10 text-gray-300 hover:border-amber-500/50 hover:bg-[#2A2B32]'
                }`}
            >
              {isSelected && <Check size={16} />}
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white p-8 md:p-16 flex flex-col justify-center max-w-4xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">What are we watching tonight?</h1>
        <p className="text-gray-400 text-lg">Pick a few vibes to personalize your evening feed.</p>
      </div>

      <div className="flex-1">
        <SelectionGrid title="1. Select your favorite genres" category="genres" options={PREFERENCE_OPTIONS.genres} />
        <SelectionGrid title="2. Pick a mood" category="moods" options={PREFERENCE_OPTIONS.moods} />
        <SelectionGrid title="3. Choose an era" category="eras" options={PREFERENCE_OPTIONS.eras} />
      </div>

      <div className="mt-8 pt-8 border-t border-white/10 flex justify-end">
        <button 
          onClick={() => onComplete(selections)}
          className="bg-amber-500 hover:bg-amber-400 text-black font-bold py-4 px-8 rounded-full flex items-center gap-2 transition-transform hover:scale-105"
        >
          Curate My Feed <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

// 2. Movie Card Component
const MovieCard = ({ movie, onClick }) => {
  return (
    <div 
      className="relative group cursor-pointer w-48 md:w-56 flex-shrink-0 snap-start"
      onClick={() => onClick(movie)}
    >
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-3 border border-white/5 transition-all duration-300 group-hover:border-amber-500/50">
        <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-transparent to-transparent opacity-80" />
        
        {/* Top Left Play Button */}
        <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur border border-amber-500 flex items-center justify-center text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">
          <Play size={14} fill="currentColor" />
        </div>

        {/* Top Right Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
          <button className="w-8 h-8 rounded-full bg-black/60 backdrop-blur border border-white/10 flex items-center justify-center text-white hover:text-amber-500" onClick={(e)=>{e.stopPropagation()}}>
            <Bookmark size={14} />
          </button>
          <button className="w-8 h-8 rounded-full bg-black/60 backdrop-blur border border-white/10 flex items-center justify-center text-white hover:text-amber-500" onClick={(e)=>{e.stopPropagation()}}>
            <Eye size={14} />
          </button>
          <button className="w-8 h-8 rounded-full bg-black/60 backdrop-blur border border-white/10 flex items-center justify-center text-white hover:text-amber-500" onClick={(e)=>{e.stopPropagation()}}>
            <Download size={14} />
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-white font-semibold text-sm truncate">{movie.title}</h3>
        <div className="flex items-center gap-3 text-xs mt-1 text-gray-400">
          <span className="text-amber-500 font-medium">Added</span>
          <div className="flex items-center gap-1">
            <Star size={12} className="text-amber-500" fill="currentColor" />
            <span>{movie.rating}</span>
          </div>
          <span className="border border-white/20 rounded px-1.5 py-0.5">{movie.year}</span>
        </div>
      </div>
    </div>
  );
};

// 3. Detail View Component
const DetailView = ({ movie, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0C] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Backdrop Hero */}
      <div className="relative h-[60vh] md:h-[70vh] w-full">
        <div className="absolute inset-0">
          <img src={movie.backdrop} alt={movie.title} className="w-full h-full object-cover" />
          {/* Gradients for fading into background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0C] via-[#0A0A0C]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-transparent to-transparent" />
        </div>

        {/* Close Button */}
        <button onClick={onClose} className="absolute top-6 left-6 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition">
          <X size={20} />
        </button>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 max-w-4xl z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-4">{movie.title}</h1>
          <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6 max-w-2xl line-clamp-3">
            {movie.synopsis}
          </p>

          <div className="flex items-center gap-4 text-xs md:text-sm text-gray-400 mb-8 font-medium">
            <span className="border border-white/20 text-white px-2 py-1 rounded">{movie.ageRating}</span>
            <span>{movie.rating} ★ TMDb</span>
            <span>{movie.year}</span>
            <span>{movie.runtime}</span>
            <span>{movie.genres.join(" • ")}</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button className="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-gray-200 transition">
              <Play size={18} fill="currentColor" /> Stream
            </button>
            <button className="bg-amber-500/20 text-amber-500 border border-amber-500/50 px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-amber-500 hover:text-black transition">
              Fast Cloud
            </button>
            <button className="bg-[#1C1D22] text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-[#2A2B32] transition">
              <Play size={18} /> Trailer
            </button>
            
            <div className="flex items-center gap-2 ml-4">
              <button className="w-10 h-10 rounded-full bg-[#1C1D22] flex items-center justify-center text-white hover:text-amber-500 transition"><Bookmark size={18}/></button>
              <button className="w-10 h-10 rounded-full bg-[#1C1D22] flex items-center justify-center text-white hover:text-amber-500 transition"><ThumbsUp size={18}/></button>
              <button className="w-10 h-10 rounded-full bg-[#1C1D22] flex items-center justify-center text-white hover:text-amber-500 transition"><Share2 size={18}/></button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Sections Below Fold */}
      <div className="p-8 md:p-16 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2">
          <div className="mb-10">
            <h3 className="text-xl font-bold text-white mb-6 border-l-4 border-amber-500 pl-3">Cast & Crew</h3>
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-none">
              <div className="flex items-center gap-3 pr-6 border-r border-white/10">
                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center font-bold text-white">D</div>
                <div>
                  <p className="text-white text-sm font-medium">{movie.director}</p>
                  <p className="text-gray-500 text-xs">Director</p>
                </div>
              </div>
              {movie.cast.map((actor, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center font-bold text-white border border-white/5">{actor.charAt(0)}</div>
                  <div>
                    <p className="text-white text-sm font-medium whitespace-nowrap">{actor}</p>
                    <p className="text-gray-500 text-xs">Actor</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-6 border-l-4 border-amber-500 pl-3">Community Metrics</h3>
            <div className="flex gap-4">
              <div className="bg-[#1C1D22] p-4 rounded-2xl flex-1 border border-white/5">
                <p className="text-3xl font-bold text-white">{movie.ratings.tmdb}</p>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">TMDb Score</p>
              </div>
              <div className="bg-[#1C1D22] p-4 rounded-2xl flex-1 border border-white/5">
                <p className="text-3xl font-bold text-amber-500">{movie.ratings.imdb}</p>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">IMDb Score</p>
              </div>
              <div className="bg-[#1C1D22] p-4 rounded-2xl flex-1 border border-white/5">
                <p className="text-3xl font-bold text-red-500">{movie.ratings.rotten}</p>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Rotten Tomatoes</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-white mb-6 border-l-4 border-amber-500 pl-3">Your Review</h3>
          <div className="bg-[#1C1D22] rounded-2xl p-6 border border-white/5">
            <div className="flex justify-center gap-2 mb-4">
              {[1,2,3,4,5].map(star => (
                <Star key={star} size={28} className="text-gray-600 hover:text-amber-500 cursor-pointer transition" />
              ))}
            </div>
            <textarea 
              className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-amber-500 min-h-[100px]"
              placeholder="Share your thoughts..."
            ></textarea>
            <button className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg font-medium transition">
              Post Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 4. Main App Container
export default function App() {
  const [viewState, setViewState] = useState('onboarding'); // 'onboarding', 'feed'
  const [preferences, setPreferences] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Movie');

  const handlePreferencesComplete = (selections) => {
    setPreferences(selections);
    setViewState('feed');
  };

  if (viewState === 'onboarding') {
    return <PreferenceSelector onComplete={handlePreferencesComplete} />;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0C] font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-[#0A0A0C]/80 backdrop-blur-md border-b border-white/5 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="text-2xl font-black text-white tracking-tighter">Cine<span className="text-amber-500">Vault</span></div>
          <div className="hidden md:flex bg-[#1C1D22] p-1 rounded-full border border-white/5">
            {['Movie', 'TV Show', 'Anime', 'Asian'].map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition ${
                  activeCategory === cat 
                    ? 'bg-amber-500 text-black' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search titles..." 
              className="bg-[#1C1D22] text-white text-sm rounded-full pl-10 pr-4 py-2 border border-white/5 focus:outline-none focus:border-amber-500/50 w-64"
            />
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-purple-600 border-2 border-[#0A0A0C] shadow-[0_0_0_1px_rgba(255,255,255,0.2)] cursor-pointer"></div>
        </div>
      </nav>

      {/* Main Feed Content */}
      <main className="p-8 md:p-12">
        {preferences && (preferences.genres.length > 0 || preferences.moods.length > 0) && (
          <div className="mb-10 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3">
            <span className="text-amber-500 font-semibold text-sm">Tonight's Vibe:</span>
            <div className="flex gap-2">
              {[...preferences.genres, ...preferences.moods, ...preferences.eras].slice(0, 4).map(tag => (
                <span key={tag} className="text-xs text-amber-500/80 bg-amber-500/10 px-2 py-1 rounded">{tag}</span>
              ))}
            </div>
          </div>
        )}

        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6 cursor-pointer group">
            <h2 className="text-2xl font-bold text-white">Latest <span className="text-gray-500 font-normal group-hover:text-amber-500 transition">{'>'}</span></h2>
          </div>
          
          <div className="relative group/rail">
            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory pr-12">
              {mockMovies.map(movie => (
                <MovieCard key={movie.id} movie={movie} onClick={setSelectedMovie} />
              ))}
              {/* Duplicate for demo scrolling effect */}
              {mockMovies.map(movie => (
                <MovieCard key={movie.id + '-dup'} movie={{...movie, title: movie.title + " 2"}} onClick={setSelectedMovie} />
              ))}
            </div>
            
            <button className="absolute right-0 top-1/2 -translate-y-1/2 translate-y-[-12px] w-12 h-24 bg-black/60 backdrop-blur flex items-center justify-center text-white opacity-0 group-hover/rail:opacity-100 transition rounded-l-xl">
              <ChevronRight size={24} />
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Trending in {activeCategory} <span className="text-gray-500 font-normal">{'>'}</span></h2>
          <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory">
              {[...mockMovies].reverse().map(movie => (
                <MovieCard key={movie.id + '-trend'} movie={movie} onClick={setSelectedMovie} />
              ))}
          </div>
        </section>
      </main>

      {/* Detail Overlay */}
      {selectedMovie && (
        <DetailView movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </div>
  );
}