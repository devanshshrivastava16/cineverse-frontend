import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, SlidersHorizontal, Star, X, ChevronDown, ChevronRight, Play } from 'lucide-react';
import { tmdbAPI } from '../services/api';

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  poster_path: string;
}

export default function SearchPage() {
  const navigate = useNavigate();
  
  // State management for filters and UI
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [mediaType, setMediaType] = useState<'movies' | 'tv'>('movies');
  const [currentPage, setCurrentPage] = useState(1);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch search results when query, media type, or page changes
  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim().length === 0) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        let response;
        if (mediaType === 'movies') {
          response = await tmdbAPI.searchMovies(searchQuery, currentPage);
        } else {
          response = await tmdbAPI.searchTV(searchQuery, currentPage);
        }
        
        setResults(response.data.results || []);
        setTotalPages(response.data.total_pages || 1);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to load search results');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the search to avoid too many API calls
    const debounceTimer = setTimeout(() => {
      performSearch();
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, mediaType, currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleMovieClick = (id: number) => {
    navigate(`/movie/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans">
      
      {/* --- TOP HEADER & SEARCH BAR --- */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center font-bold text-xl">C</div>
            <span className="text-xl font-bold hidden sm:block tracking-tight">CineVerse</span>
          </div>

          {/* Mobile Filter Toggle */}
          <button 
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="lg:hidden flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors"
          >
            <SlidersHorizontal size={16} />
            <span className="hidden sm:inline">Filters</span>
          </button>

          {/* Desktop Filter Button */}
          <div className="hidden lg:flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-sm text-gray-300">
             <SlidersHorizontal size={16} />
             Filters
          </div>
        </div>

        {/* Search Input (Full Width Below) */}
        <form onSubmit={handleSearch} className="w-full relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400 group-focus-within:text-red-600 transition-colors" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movies, TV shows, or people..."
            className="w-full bg-white/10 border-2 border-white/20 rounded-xl py-3 pl-12 pr-4 text-base text-white placeholder-gray-400 focus:outline-none focus:border-red-600 focus:bg-white/15 transition-all shadow-lg"
            autoFocus
          />
        </form>
      </header>

      {/* --- MAIN LAYOUT (Sidebar + Grid) --- */}
      <div className="flex flex-1 overflow-hidden relative max-w-[1600px] w-full mx-auto">
        
        {/* 1. FILTERS SIDEBAR */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-30 w-72 bg-[#0a0a0a] lg:bg-transparent border-r border-white/5 p-6 
          transform transition-transform duration-300 ease-in-out overflow-y-auto
          ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Filters</h2>
            <button className="text-red-500 text-sm hover:text-red-400 transition-colors">Clear All</button>
            <button className="lg:hidden text-gray-400" onClick={() => setIsMobileFilterOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Type Filter */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <label className="block text-sm font-medium text-gray-400 mb-3">Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input 
                    type="radio" 
                    name="type" 
                    checked={mediaType === 'movies'}
                    onChange={() => setMediaType('movies')}
                    className="accent-red-600 w-4 h-4" 
                  />
                  <span>Movies</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input 
                    type="radio" 
                    name="type" 
                    checked={mediaType === 'tv'}
                    onChange={() => setMediaType('tv')}
                    className="accent-red-600 w-4 h-4 bg-transparent border-gray-600" 
                  />
                  <span>TV Shows</span>
                </label>
              </div>
            </div>

            {/* Dropdown Filters (Genre, Year, Rating) */}
            {['Genre', 'Year', 'Rating'].map((filter) => (
              <div key={filter} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">{filter}</label>
                <button className="w-full flex items-center justify-between text-sm text-white bg-black/30 border border-white/10 rounded-lg p-2.5 hover:border-white/30 transition-colors">
                  <span>All {filter}s</span>
                  <ChevronDown size={16} className="text-gray-500" />
                </button>
              </div>
            ))}

            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-red-600/20 mt-4">
              Apply Filters
            </button>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {isMobileFilterOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setIsMobileFilterOpen(false)}
          />
        )}

        {/* 2. SEARCH RESULTS AREA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {searchQuery.trim().length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <SearchIcon className="w-16 h-16 text-gray-600 mb-4" />
              <h1 className="text-3xl font-bold mb-2">Start Searching</h1>
              <p className="text-gray-400 text-lg">Search for movies, TV shows, or people to get started</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold mb-1">Search Results for "{searchQuery}"</h1>
                <p className="text-sm text-gray-400">About {results.length} results</p>
              </div>

              {error && (
                <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-4 text-red-400 mb-6">
                  {error}
                </div>
              )}

              {loading && (
                <div className="flex items-center justify-center py-12">
                  <p className="text-gray-400">Loading search results...</p>
                </div>
              )}

              {!loading && results.length === 0 && searchQuery.trim().length > 0 && (
                <div className="flex items-center justify-center py-12">
                  <p className="text-gray-400">No results found for "{searchQuery}"</p>
                </div>
              )}

          {!loading && results.length > 0 && (
            <>
              {/* Results Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
                {results.map((movie) => {
                  const year = movie.release_date 
                    ? new Date(movie.release_date).getFullYear() 
                    : movie.first_air_date 
                    ? new Date(movie.first_air_date).getFullYear()
                    : 'N/A';
                  const title = movie.title || movie.name || 'Unknown';
                  
                  return (
                    <div key={movie.id} className="group flex flex-col gap-3 cursor-pointer">
                      {/* Poster Container */}
                      <div 
                        onClick={() => handleMovieClick(movie.id)}
                        className="relative aspect-[2/3] rounded-xl overflow-hidden bg-white/5 border border-white/10 shadow-lg hover:shadow-xl transition-shadow"
                      >
                        {movie.poster_path ? (
                          <img 
                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                            alt={title} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-400 text-sm">
                            No Image
                          </div>
                        )}
                        
                        {/* Hover Overlay */}
                        {movie.poster_path && (
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                            <div className="w-12 h-12 rounded-full bg-red-600/90 flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
                              <Play fill="currentColor" size={20} className="ml-1" />
                            </div>
                          </div>
                        )}
                        
                        {/* Quick Action Icon (Top Right) */}
                        <button className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/20 hover:bg-white/20 text-white">
                          <SlidersHorizontal size={14} />
                        </button>
                      </div>

                      {/* Movie Info */}
                      <div>
                        <h3 className="font-semibold text-sm sm:text-base text-gray-100 truncate group-hover:text-red-400 transition-colors">
                          {title}
                        </h3>
                        <div className="flex items-center justify-between mt-1 text-xs sm:text-sm text-gray-400">
                          <span>{year}</span>
                          <span className="flex items-center gap-1 text-yellow-500">
                            <Star fill="currentColor" size={12} /> {movie.vote_average.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 3. PAGINATION */}
              {totalPages > 1 && (
                <div className="mt-12 mb-8 flex items-center justify-center gap-2">
                  {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                        currentPage === page 
                          ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' 
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  {totalPages > 3 && currentPage < totalPages && (
                    <button 
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                    >
                      <ChevronRight size={18} />
                    </button>
                  )}
                </div>
              )}
            </>
          )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}