import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Play, Plus, Check, Star, MessageSquare } from 'lucide-react';
import { tmdbAPI, watchlistAPI, watchedAPI, reviewAPI } from '../services/api';

interface MovieData {
  id: number;
  title: string;
  release_date: string;
  genres: Array<{ id: number; name: string }>;
  runtime: number;
  vote_average: number;
  tagline: string;
  overview: string;
  director?: string;
  writer?: string;
  backdrop_path: string;
  poster_path: string;
  videos?: {
    results: Array<{
      key: string;
      site: string;
      type: string;
    }>;
  };
  credits?: any;
}

interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

interface Crew {
  id: number;
  name: string;
  job: string;
  department: string;
}

export default function MovieDetails() {
  const { id } = useParams<{ id: string }>();
  const location = useParams<{ '*': string }>();
  const pathname = window.location.pathname;
  const mediaType = pathname.includes('/tv/') ? 'tv' : 'movie';
  const [movie, setMovie] = useState<MovieData | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [director, setDirector] = useState<string>('N/A');
  const [writer, setWriter] = useState<string>('N/A');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const detailsRes = mediaType === 'tv' 
          ? await tmdbAPI.getTVDetails(parseInt(id))
          : await tmdbAPI.getMovieDetails(parseInt(id));
        
        const movieData = detailsRes.data;
        setMovie(movieData);
        
        // Cast is included in the movie details response under credits.cast
        const castData = movieData.credits?.cast?.slice(0, 5) || [];
        setCast(castData);
        
        // Extract director and writer from crew
        const crew: Crew[] = movieData.credits?.crew || [];
        const directorData = crew.find((member: Crew) => member.job === 'Director');
        const writerData = crew.find((member: Crew) => member.job === 'Writer' || member.job === 'Screenplay');
        
        setDirector(directorData?.name || 'N/A');
        setWriter(writerData?.name || 'N/A');
        setError(null);

        // Fetch user's watchlist and watched history to set initial state
        try {
          const [watchlistRes, watchedRes] = await Promise.all([
            watchlistAPI.getWatchlist(),
            watchedAPI.getWatched()
          ]);
          
          const inWatchlist = watchlistRes.data.some((item: any) => item.tmdbId === parseInt(id) && item.mediaType === mediaType);
          const inWatched = watchedRes.data.some((item: any) => item.tmdbId === parseInt(id) && item.mediaType === mediaType);
          
          setIsInWatchlist(inWatchlist);
          setIsWatched(inWatched);
        } catch (err) {
          console.error('Failed to fetch user lists:', err);
        }
      } catch (err) {
        console.error('Failed to load details:', err);
        if (err instanceof Error) {
          console.error('Error details:', err.message);
        }
        setError('Failed to load details');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id, mediaType]);

  const handleWatchlistToggle = async () => {
    if (!id) return;
    try {
      if (isInWatchlist) {
        await watchlistAPI.removeFromWatchlist({ tmdbId: parseInt(id), mediaType });
        setIsInWatchlist(false);
      } else {
        await watchlistAPI.addToWatchlist({ tmdbId: parseInt(id), mediaType });
        setIsInWatchlist(true);
      }
    } catch (err) {
      console.error('Failed to update watchlist:', err);
      alert('Failed to update watchlist. Please try again.');
    }
  };

  const handleWatchedToggle = async () => {
    if (!id) return;
    try {
      if (isWatched) {
        await watchedAPI.removeFromWatched({ tmdbId: parseInt(id), mediaType });
        setIsWatched(false);
      } else {
        await watchedAPI.markAsWatched({ tmdbId: parseInt(id), mediaType });
        setIsWatched(true);
      }
    } catch (err) {
      console.error('Failed to update watched status:', err);
      alert('Failed to update watched status. Please try again.');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || userRating === 0) return;
    
    try {
      await reviewAPI.submitReview({
        tmdbId: parseInt(id),
        mediaType,
        rating: userRating,
        reviewText,
      });
      alert('Review submitted successfully!');
      setReviewText('');
      setUserRating(0);
    } catch (err) {
      console.error('Failed to submit review:', err);
      alert('Failed to submit review.');
    }
  };

  const handleWatchTrailer = async () => {
    if (!id || !movie) return;
    try {
      let videos = movie?.videos?.results || [];
      
      // If videos are not already appended to movie details, fetch them explicitly
      if (videos.length === 0) {
        const res = await tmdbAPI.getMovieVideos(parseInt(id));
        videos = res.data?.results || [];
      }
      
      // Find an official trailer, or fallback to any YouTube video attached to the movie
      const trailer = videos.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube')
                   || videos.find((v: any) => v.site === 'YouTube');
      
      if (trailer) {
        window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank', 'noopener,noreferrer');
        return;
      }
    } catch (err) {
      console.warn('Failed to fetch trailer from API, falling back to search.', err);
    }

    // Fallback: If no trailer is found or the backend endpoint is missing, search YouTube directly.
    const searchQuery = encodeURIComponent(`${movie.title} official trailer`);
    window.open(`https://www.youtube.com/results?search_query=${searchQuery}`, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <p>Loading movie details...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <p>{error || 'Movie not found'}</p>
      </div>
    );
  }

  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : 'N/A';
  const year = new Date(movie.release_date).getFullYear();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-red-500/30">
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[85vh] flex items-end pb-12 pt-32">
        {/* Backdrop & Gradients */}
        <div className="absolute inset-0 z-0">
          <img 
            src={movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : 'placeholder.jpg'} 
            alt="Backdrop" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-10 items-start">
          {/* Poster */}
          <div className="w-48 md:w-72 flex-shrink-0 rounded-xl overflow-hidden shadow-2xl border border-white/10 shadow-black/50 hidden sm:block transition-transform duration-300 hover:scale-[1.02]">
            <img src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'placeholder.jpg'} alt={movie.title} className="w-full h-auto object-cover" />
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col gap-6 pt-4">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-2">{movie.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm md:text-base text-gray-300 font-medium">
                <span>{year}</span>
                <span>•</span>
                <span>{movie.genres.map(g => g.name).join(', ')}</span>
                <span>•</span>
                <span>{runtime}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-yellow-500">
                  <Star fill="currentColor" size={16} /> {movie.vote_average.toFixed(1)}/10
                </span>
              </div>
            </div>

            <p className="text-lg text-gray-200 max-w-3xl leading-relaxed">
              {movie.overview}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <button 
                onClick={handleWatchTrailer}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-red-600/20"
              >
                <Play fill="currentColor" size={20} />
                Watch Trailer
              </button>
              
              <button 
                onClick={handleWatchlistToggle}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all border border-white/10 ${
                  isInWatchlist ? 'bg-white/20 text-white' : 'bg-white/5 hover:bg-white/10 text-gray-200'
                } backdrop-blur-md`}
              >
                {isInWatchlist ? <Check size={20} /> : <Plus size={20} />}
                Watchlist
              </button>

              <button 
                onClick={handleWatchedToggle}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all border border-white/10 ${
                  isWatched ? 'bg-green-600/20 text-green-400 border-green-500/30' : 'bg-white/5 hover:bg-white/10 text-gray-200'
                } backdrop-blur-md`}
              >
                <Check size={20} />
                {isWatched ? 'Watched' : 'Mark Watched'}
              </button>
            </div>

            {/* Credits Section */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-6 border-t border-white/10 pt-6 text-sm">
              <div>
                <p className="text-gray-400 mb-1">Director</p>
                <p className="font-semibold text-gray-100">{director}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Writer</p>
                <p className="font-semibold text-gray-100">{writer}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CAST SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-white/5">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Cast</h2>
          <button className="text-red-500 hover:text-red-400 text-sm font-medium transition-colors">View All</button>
        </div>
        
        {/* Horizontal Scroll Container */}
        <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide snap-x">
          {cast.length > 0 ? (
            cast.map((actor) => (
              <div key={actor.id} className="flex flex-col items-center gap-3 min-w-[120px] snap-start group cursor-pointer">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-transparent group-hover:border-red-500 transition-all duration-300 relative bg-gray-700">
                  {actor.profile_path ? (
                    <img src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`} alt={actor.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                  )}
                </div>
                <div className="text-center">
                  <p className="font-medium text-sm text-gray-200 group-hover:text-white transition-colors">{actor.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{actor.character}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400">Cast information not available</p>
          )}
        </div>
      </section>

      {/* 3. REVIEWS & RATINGS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-white/5">
        <h2 className="text-2xl font-bold mb-8">Community Reviews</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Review Submission Form (Conditional) */}
          <div className="lg:col-span-1">
            {isWatched ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare size={18} /> Write a Review
                </h3>
                <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
                  {/* Star Rating Input */}
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setUserRating(star)}
                        className={`transition-colors ${userRating >= star ? 'text-yellow-500' : 'text-gray-600 hover:text-gray-400'}`}
                      >
                        <Star fill={userRating >= star ? 'currentColor' : 'none'} size={24} />
                      </button>
                    ))}
                  </div>
                  
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="What did you think of the movie?"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none h-24"
                    required
                  />
                  <button 
                    type="submit"
                    className="bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Submit Review
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center backdrop-blur-sm flex flex-col items-center justify-center min-h-[250px]">
                <Check size={40} className="text-gray-600 mb-3" />
                <h3 className="font-semibold text-gray-300 mb-2">Want to review this?</h3>
                <p className="text-sm text-gray-500">Mark this movie as watched to share your thoughts with the community.</p>
              </div>
            )}
          </div>

          {/* Display Existing Reviews */}
          <div className="lg:col-span-2 flex flex-col gap-4">
             {/* Mock Review Card */}
             <div className="bg-transparent border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center font-bold">
                      JS
                    </div>
                    <div>
                      <p className="font-medium text-sm">john_smith</p>
                      <p className="text-xs text-gray-500">2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star fill="currentColor" size={14} />
                    <span className="text-sm font-medium text-white">5</span>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  An absolute masterpiece of modern cinema. The visual effects combined with Hans Zimmer's score create an unforgettable experience.
                </p>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}