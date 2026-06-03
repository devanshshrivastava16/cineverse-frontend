import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Star, Film, Tv, Flame, Trophy } from 'lucide-react';
import { tmdbAPI } from '../services/api';

interface MediaBrowseProps {
  mediaType: 'movie' | 'tv';
  pageTitle: string;
}

interface MediaItem {
  id: number;
  title: string;
  poster: string;
  year: string;
  rating: number;
}

export default function MediaBrowse({ mediaType, pageTitle }: MediaBrowseProps) {
  const navigate = useNavigate();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'trending' | 'top-rated'>('trending');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMedia = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        let response;
        
        // Route the API call based on mediaType and activeFilter
        if (mediaType === 'movie') {
          response = activeFilter === 'trending' 
            ? await tmdbAPI.getTrendingMovies() 
            : await tmdbAPI.getTopRatedMovies();
        } else {
          response = activeFilter === 'trending' 
            ? await tmdbAPI.getTrendingTV() 
            : await tmdbAPI.getTopRatedTV();
        }

        const rawData = response.data.results || [];

        // Normalize TMDB data (movies use 'title'/'release_date', tv uses 'name'/'first_air_date')
        const normalizedData: MediaItem[] = rawData.map((item: any) => {
          const dateStr = item.release_date || item.first_air_date;
          return {
            id: item.id,
            title: item.title || item.name,
            poster: item.poster_path 
              ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
              : 'https://via.placeholder.com/500x750?text=No+Poster',
            year: dateStr ? dateStr.substring(0, 4) : 'N/A',
            rating: item.vote_average || 0,
          };
        });

        setItems(normalizedData);
      } catch (err) {
        console.error(`Failed to fetch ${mediaType} data:`, err);
        setError("Failed to load content. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedia();
  }, [mediaType, activeFilter]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 pt-24 sm:p-6 sm:pt-28 lg:p-8 lg:pt-32 font-sans">
      <div className="max-w-[1600px] mx-auto">
        
        {/* --- HEADER & FILTERS --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-600/20 rounded-xl flex items-center justify-center border border-red-500/30">
              {mediaType === 'movie' ? <Film className="text-red-500" /> : <Tv className="text-red-500" />}
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 bg-[#121212] p-1.5 rounded-xl border border-white/10 self-start md:self-auto">
            <button
              onClick={() => setActiveFilter('trending')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeFilter === 'trending'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Flame size={16} /> Trending
            </button>
            <button
              onClick={() => setActiveFilter('top-rated')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeFilter === 'top-rated'
                  ? 'bg-white/10 text-white border border-white/10 backdrop-blur-md'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Trophy size={16} /> Top Rated
            </button>
          </div>
        </div>

        {/* --- ERROR STATE --- */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-8">
            {error}
          </div>
        )}

        {/* --- CONTENT GRID --- */}
        {isLoading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse"></div>
                <div className="h-4 bg-white/5 rounded animate-pulse w-3/4 mt-1"></div>
                <div className="h-3 bg-white/5 rounded animate-pulse w-1/4"></div>
              </div>
            ))}
          </div>
        ) : (
          /* Media Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 animate-in fade-in duration-500">
            {items.map((item) => (
              <div 
                key={item.id} 
                onClick={() => navigate(`/${mediaType}/${item.id}`)}
                className="flex flex-col gap-3 group cursor-pointer"
              >
                {/* Poster Area */}
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-900 border border-white/5 shadow-lg">
                  <img 
                    src={item.poster} 
                    alt={item.title} 
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Rating Badge */}
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1 text-xs font-bold text-yellow-500 border border-white/10">
                    <Star fill="currentColor" size={10} />
                    {item.rating.toFixed(1)}
                  </div>

                  {/* Glassmorphic Hover Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                    <div className="w-12 h-12 rounded-full bg-red-600/90 flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-xl shadow-red-600/30">
                      <Play fill="currentColor" size={20} className="ml-1 text-white" />
                    </div>
                  </div>
                </div>

                {/* Info Area */}
                <div className="px-1">
                  <h3 className="font-semibold text-sm sm:text-base text-gray-100 truncate group-hover:text-red-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">{item.year}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}