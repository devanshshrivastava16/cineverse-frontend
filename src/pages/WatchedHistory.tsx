import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ChevronDown, CheckCircle2, Star, Clapperboard } from 'lucide-react';
import { watchedAPI, tmdbAPI } from '../services/api';

// Define the shape of our hydrated Watched item for the UI
interface WatchedItem {
  id: number; // Database ID
  tmdbId: number;
  title: string;
  year: string;
  poster: string;
  rating: number;
  mediaType: 'movie' | 'tv';
  watchedAt: string; // The date the user watched it
}

export default function WatchedHistoryPage() {
  const navigate = useNavigate();
  const [watchedList, setWatchedList] = useState<WatchedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('Recently Watched');

  // Format date to match the mockup: "May 12, 2024"
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Recently';
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Fetch from Spring Boot DB, then hydrate with TMDB data
  useEffect(() => {
    const fetchAndHydrateWatched = async () => {
      try {
        setIsLoading(true);
        
        // 1. Get watched entries from backend
        // In production this returns: [{ id, tmdbId, mediaType, watchedAt, ... }]
        const response = await watchedAPI.getWatched();
        const rawWatched = response.data; 

        // 2. Fetch full details from TMDB for each item
        const hydratedData = await Promise.all(
          rawWatched.map(async (item: any) => {
            try {
              const tmdbRes = item.mediaType === 'movie' 
                ? await tmdbAPI.getMovieDetails(item.tmdbId)
                : await tmdbAPI.getTVDetails(item.tmdbId);
              
              const tmdbData = tmdbRes.data;
              const dateStr = tmdbData.release_date || tmdbData.first_air_date;

              return {
                id: item.id,
                tmdbId: item.tmdbId,
                mediaType: item.mediaType,
                title: tmdbData.title || tmdbData.name,
                year: dateStr ? dateStr.substring(0, 4) : 'N/A',
                rating: tmdbData.vote_average || 0,
                poster: tmdbData.poster_path 
                  ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`
                  : 'https://via.placeholder.com/500x750?text=No+Poster',
                watchedAt: item.watchedAt || new Date().toISOString(),
              };
            } catch (err) {
              console.error(`Failed to fetch details for TMDB ID: ${item.tmdbId}`, err);
              return null; // Skip if TMDB fails for a specific item
            }
          })
        );

        // Filter out any nulls from failed TMDB requests
        setWatchedList(hydratedData.filter(Boolean) as WatchedItem[]);
      } catch (error) {
        console.error("Failed to fetch watched history from API", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndHydrateWatched();
  }, []);

  const handleRemove = async (itemToRemove: WatchedItem, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigating to details page
    
    // 1. Optimistic UI Update
    setWatchedList((prev) => prev.filter((item) => item.id !== itemToRemove.id));
    
    // 2. API Call to backend
    try {
      await watchedAPI.removeFromWatched({ 
        tmdbId: itemToRemove.tmdbId, 
        mediaType: itemToRemove.mediaType 
      });
    } catch (error) {
      console.error("Failed to remove item from watched list", error);
      // Optional: Revert optimistic update here if the API call fails
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-[1600px] mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Watched History</h1>
            {!isLoading && watchedList.length > 0 && (
              <span className="text-sm text-gray-400 font-medium">
                {watchedList.length} {watchedList.length === 1 ? 'Title' : 'Titles'}
              </span>
            )}
          </div>

          {/* Sort Dropdown */}
          <button className="flex items-center justify-between gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors w-full sm:w-auto">
            <span className="text-gray-400">Sort by: <span className="text-white font-medium">{sortBy}</span></span>
            <ChevronDown size={16} className="text-gray-400" />
          </button>
        </div>

        {/* --- CONTENT --- */}
        {isLoading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse"></div>
                <div className="h-4 bg-white/5 rounded animate-pulse w-3/4 mt-1"></div>
                <div className="h-3 bg-white/5 rounded animate-pulse w-1/4"></div>
              </div>
            ))}
          </div>
        ) : watchedList.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
              <CheckCircle2 size={40} className="text-gray-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Your watched history is empty</h2>
            <p className="text-gray-400 max-w-md mb-8">
              Keep track of what you've seen by marking movies and shows as watched.
            </p>
            <button 
              onClick={() => navigate('/')}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-red-600/20"
            >
              Explore Movies
            </button>
          </div>
        ) : (
          /* Watched Grid */
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {watchedList.map((movie) => (
                <div 
                  key={movie.id} 
                  onClick={() => navigate(`/${movie.mediaType}/${movie.tmdbId}`)}
                  className="flex flex-col gap-3 group cursor-pointer"
                >
                  {/* Poster Area */}
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-900 border border-white/5 shadow-lg">
                    <img 
                      src={movie.poster} 
                      alt={movie.title} 
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* Watched Badge overlay */}
                    <div className="absolute top-2 left-2 bg-green-500/90 backdrop-blur-md w-7 h-7 rounded-full flex items-center justify-center border border-white/20 shadow-lg">
                      <CheckCircle2 size={16} className="text-white" />
                    </div>

                    {/* Dark Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[1px]" />
                  </div>

                  {/* Info & Actions Area */}
                  <div className="flex flex-col gap-1 px-1">
                    <h3 className="font-semibold text-sm sm:text-base text-gray-100 truncate group-hover:text-red-400 transition-colors">
                      {movie.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{movie.year}</span>
                      <span className="flex items-center gap-1 text-yellow-500 font-medium">
                        <Star fill="currentColor" size={12} />
                        {movie.rating ? movie.rating.toFixed(1) : 'NR'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-1 pt-2 border-t border-white/10">
                      <p className="text-[11px] text-gray-500">
                        Watched on <br/>
                        <span className="text-gray-300 font-medium">{formatDate(movie.watchedAt)}</span>
                      </p>
                      <button 
                        onClick={(e) => handleRemove(movie, e)}
                        className="text-gray-500 hover:text-red-500 transition-colors p-1.5 rounded-md hover:bg-white/5 flex-shrink-0"
                        title="Remove from history"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Banner matching the mockup */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left mt-12 backdrop-blur-sm">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                <Clapperboard size={28} className="text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-1">No more history to show</h3>
                <p className="text-gray-400 text-sm">
                  Keep watching amazing movies and shows!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}