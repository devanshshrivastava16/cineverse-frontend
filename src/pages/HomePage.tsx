import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, Info, Star } from 'lucide-react';
import { tmdbAPI, watchlistAPI } from '../services/api';

export interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
}

const HomePage: React.FC = () => {
  const [trendingList, setTrendingList] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  // Fetch data for the hero banner when the page loads
  useEffect(() => {
    const loadTrending = async () => {
      try {
        const response = await tmdbAPI.getTrendingMovies();
        const trending = response.data.results || [];
        setTrendingList(trending.slice(0, 5)); // Keep top 5 for hero rotation
      } catch (err) {
        console.error("Failed to load hero movie", err);
      }
    };
    loadTrending();
  }, []);

  // Auto-change hero movie every 8 seconds
  useEffect(() => {
    if (trendingList.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % trendingList.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [trendingList]);

  const heroMovie = trendingList[currentIndex];

  const handleAddToWatchlistHero = async () => {
    if (!heroMovie) return;
    try {
      await watchlistAPI.addToWatchlist({ tmdbId: heroMovie.id, mediaType: heroMovie.title ? 'movie' : 'tv' });
      alert('Added to Watchlist!');
    } catch (error) {
      console.error("Failed to add to watchlist:", error);
      alert('Failed to add to watchlist or already in watchlist.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      {/* 1. HERO SECTION (Parallax & Auto-changing) */}
      <div 
        className="relative w-full h-[85vh] bg-fixed bg-cover bg-center transition-all duration-1000 ease-in-out" 
        style={{ 
          backgroundImage: heroMovie?.backdrop_path 
            ? `url('https://image.tmdb.org/t/p/original${heroMovie.backdrop_path}')`
            : "url('https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=2000&auto=format&fit=crop')" // Space placeholder
        }}
      >
        {/* Gradients for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent"></div>

        {/* Hero Content (Keyed by ID to trigger CSS animation on change) */}
        {heroMovie && (
          <div 
            key={heroMovie.id}
            className="absolute bottom-0 left-0 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-32 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-red-600 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded tracking-wider">
                TRENDING NOW
              </span>
              <span className="flex items-center gap-1 text-yellow-500 font-semibold text-sm">
                <Star fill="currentColor" size={14} /> 
                {heroMovie.vote_average?.toFixed(1) || 'NR'}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-3xl drop-shadow-lg">
              {heroMovie.title || heroMovie.name}
            </h1>
            
            <p className="text-sm md:text-lg text-gray-200 max-w-2xl line-clamp-3 md:line-clamp-4 drop-shadow-md">
              {heroMovie.overview}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <button 
                onClick={() => navigate(`/movie/${heroMovie.id}`)}
                className="flex items-center gap-2 bg-white text-black hover:bg-gray-200 px-6 sm:px-8 py-3 rounded-lg font-bold transition-all"
              >
                <Play fill="currentColor" size={20} /> Play
              </button>
              <button 
                onClick={handleAddToWatchlistHero}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white border border-white/30 px-6 sm:px-8 py-3 rounded-lg font-bold backdrop-blur-md transition-all"
              >
                <Plus size={20} /> Watchlist
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. MOVIE SECTIONS (Horizontal Rows) */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 flex flex-col gap-8 md:gap-12">
        <MovieRow title="Trending Movies" apiCall={tmdbAPI.getTrendingMovies} mediaType="movie" />
        <MovieRow title="Trending TV Shows" apiCall={tmdbAPI.getTrendingTV} mediaType="tv" />
        <MovieRow title="Top Rated Movies" apiCall={tmdbAPI.getTopRatedMovies} mediaType="movie" />
        <MovieRow title="Top Rated TV Shows" apiCall={tmdbAPI.getTopRatedTV} mediaType="tv" />
        
        {/* Placeholders for Network specific trends - reusing APIs until backend endpoints are added */}
        <MovieRow title="Trending on Netflix" apiCall={tmdbAPI.getTrendingTV} mediaType="tv" />
        <MovieRow title="Trending on Amazon Prime" apiCall={tmdbAPI.getTrendingMovies} mediaType="movie" />
      </div>
    </div>
  );
};

// Reusable Row Component
const MovieRow = ({ title, apiCall, mediaType }: { title: string, apiCall: () => Promise<any>, mediaType: 'movie'|'tv' }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        setLoading(true);
        const response = await apiCall();
        const data = response.data.results || [];
        setMovies(data);
        setError(null);
      } catch (err) {
        console.error(`Failed to fetch movies for ${title}:`, err);
        setError(`Failed to load ${title}`);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };
    loadMovies();
  }, [title, apiCall]);

  if (error) return null; // Silently fail rows with errors to keep UI clean

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-lg md:text-xl font-bold text-white tracking-wide flex items-center gap-2">
        {title}
      </h3>
      
      {/* Horizontal Scroll Container */}
      <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x group">
        {loading ? (
          // Skeleton Loaders
          [...Array(6)].map((_, i) => (
            <div key={i} className="min-w-[140px] md:min-w-[200px] aspect-[2/3] bg-white/5 animate-pulse rounded-xl"></div>
          ))
        ) : (
          movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} mediaType={mediaType} />
          ))
        )}
      </div>
    </div>
  );
};

// Movie Card Component with Glassmorphism Hover Effects
const MovieCard = ({ movie, mediaType }: { movie: Movie, mediaType: 'movie'|'tv' }) => {
  const navigate = useNavigate();
  
  // Extract year for display
  const dateStr = movie.release_date || movie.first_air_date;
  const year = dateStr ? dateStr.substring(0, 4) : '';

  const handleClick = () => {
    navigate(`/${mediaType}/${movie.id}`);
  };

  const handleAddToWatchlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await watchlistAPI.addToWatchlist({ tmdbId: movie.id, mediaType });
      alert('Added to Watchlist!');
    } catch (error) {
      console.error("Failed to add to watchlist:", error);
      alert('Failed to add to watchlist or already in watchlist.');
    }
  };

  return (
    <div className="relative min-w-[140px] md:min-w-[200px] aspect-[2/3] rounded-xl overflow-hidden snap-start cursor-pointer group bg-gray-900 border border-white/5 transition-transform duration-300 hover:scale-[1.05] hover:z-20 shadow-lg">
      
      {/* Poster Image */}
      {movie.poster_path ? (
        <img 
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
          alt={movie.title || movie.name} 
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center p-4 text-center text-sm text-gray-500">
          {movie.title || movie.name}
        </div>
      )}

      {/* Hover Overlay (Glassmorphism) */}
      <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 backdrop-blur-[2px]">
        
        {/* Rating Badge (Top Right) */}
        {movie.vote_average && (
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1 text-xs font-bold text-yellow-500 border border-white/10">
            <Star fill="currentColor" size={10} />
            {movie.vote_average.toFixed(1)}
          </div>
        )}

        <h4 className="text-white font-bold text-sm md:text-base truncate mb-1">
          {movie.title || movie.name}
        </h4>
        <p className="text-gray-400 text-xs mb-3">{year}</p>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); handleClick(); }}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 rounded flex items-center justify-center gap-1 transition-colors"
          >
            <Info size={14} /> Details
          </button>
          <button 
            onClick={handleAddToWatchlist}
            className="w-8 h-8 flex-shrink-0 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded flex items-center justify-center transition-colors backdrop-blur-sm"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;