import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, Heart, Share2, MoreHorizontal, 
  ChevronDown, MessageSquarePlus, X, Star, Film, Send
} from 'lucide-react';
import { communityAPI, tmdbAPI } from '../services/api';

// --- Types ---
interface TaggedMedia {
  title: string;
  year: string;
  rating: number;
  poster: string;
}

interface Comment {
  id: number;
  userId: number;
  username: string;
  commentText: string;
  createdAt: string;
}

interface Post {
  id: number;
  userId: number;
  username: string;
  content: string;
  taggedTmdbId?: number;
  taggedMediaType?: 'movie' | 'tv';
  createdAt: string;
  likeCount: number;
  commentCount: number;
  isLiked?: boolean; // Client-side state
  mediaDetails?: TaggedMedia; // Hydrated TMDB data
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState('Top');

  // Fetch and hydrate posts
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch raw posts from backend
        // In production: const response = await communityAPI.getAllPosts(0, 10);
        // Mocking the response based on the UI image for immediate render if API is down
        const mockRawPosts: Post[] = [
          {
            id: 1, userId: 101, username: 'MovieLover_21',
            content: "Just watched Dune: Part Two and it was absolutely INCREDIBLE! The visuals, the story, the soundtrack! \n\nWhat did you all think? 🔥",
            taggedTmdbId: 693134, taggedMediaType: 'movie',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            likeCount: 128, commentCount: 45
          },
          {
            id: 2, userId: 102, username: 'Cinephile',
            content: "Oppenheimer is a cinematic masterpiece. Nolan never disappoints! 🎬🤯",
            taggedTmdbId: 872585, taggedMediaType: 'movie',
            createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            likeCount: 96, commentCount: 32
          }
        ];

        // 2. Hydrate with TMDB data
        const hydratedPosts = await Promise.all(
          mockRawPosts.map(async (post) => {
            if (post.taggedTmdbId && post.taggedMediaType) {
              try {
                // Uncomment to use real TMDB API
                // const tmdbRes = post.taggedMediaType === 'movie' 
                //  ? await tmdbAPI.getMovieDetails(post.taggedTmdbId) 
                //  : await tmdbAPI.getTVDetails(post.taggedTmdbId);
                
                // Mock TMDB data for the UI
                const isDune = post.taggedTmdbId === 693134;
                post.mediaDetails = {
                  title: isDune ? 'Dune: Part Two' : 'Oppenheimer',
                  year: isDune ? '2024' : '2023',
                  rating: isDune ? 8.3 : 8.1,
                  poster: isDune 
                    ? 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=200&auto=format&fit=crop' 
                    : 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=200&auto=format&fit=crop'
                };
              } catch (e) {
                console.error("Failed to hydrate TMDB data", e);
              }
            }
            return post;
          })
        );

        setPosts(hydratedPosts);
      } catch (error) {
        console.error("Failed to fetch community posts", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleCreatePost = (newPost: Post) => {
    setPosts([newPost, ...posts]);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 pt-24 sm:p-6 sm:pt-28 lg:p-8 lg:pt-32 font-sans">
      <div className="max-w-[1400px] mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Community</h1>

          <div className="flex items-center gap-4">
            {/* Sort Dropdown */}
            <button className="flex items-center justify-between gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors">
              <span className="text-white font-medium">{sortBy}</span>
              <ChevronDown size={16} className="text-gray-400" />
            </button>
            
            {/* Create Post Button */}
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-red-600/20"
            >
              <MessageSquarePlus size={18} />
              Create Post
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- LEFT COLUMN: FEED --- */}
          <div className="lg:col-span-2 space-y-6">
            {isLoading ? (
              // Loading Skeletons
              [...Array(3)].map((_, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-white/10"></div>
                    <div className="space-y-2">
                      <div className="w-32 h-3 bg-white/10 rounded"></div>
                      <div className="w-20 h-2 bg-white/10 rounded"></div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="w-full h-3 bg-white/10 rounded"></div>
                    <div className="w-4/5 h-3 bg-white/10 rounded"></div>
                  </div>
                  <div className="w-full h-20 bg-white/10 rounded-lg"></div>
                </div>
              ))
            ) : (
              posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            )}
          </div>

          {/* --- RIGHT COLUMN: TRENDING SIDEBAR --- */}
          <div className="lg:col-span-1 hidden lg:block">
            <div className="bg-[#121212] border border-white/5 rounded-xl p-6 sticky top-24">
              <h2 className="text-lg font-bold mb-6">Trending Discussions</h2>
              
              <div className="space-y-5">
                {[
                  { title: "Best Sci-Fi Movies of All Time", posts: 348 },
                  { title: "Your Top 3 Christopher Nolan Films", posts: 189 },
                  { title: "What's Your Most Rewatched Movie?", posts: 157 },
                  { title: "Upcoming Movies You're Excited For", posts: 124 },
                ].map((topic, i) => (
                  <div key={i} className="group cursor-pointer flex gap-3 items-start">
                    <div className="mt-0.5 text-red-500 bg-red-500/10 p-1.5 rounded-md group-hover:bg-red-500/20 transition-colors">
                      <MessageSquarePlus size={16} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-200 group-hover:text-red-400 transition-colors line-clamp-2">
                        {topic.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">{topic.posts} posts</p>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">
                View All Posts
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- CREATE POST MODAL --- */}
      {isCreateModalOpen && (
        <CreatePostModal 
          onClose={() => setIsCreateModalOpen(false)} 
          onSubmit={handleCreatePost} 
        />
      )}
    </div>
  );
}

// --- Sub-Component: Post Card ---
function PostCard({ post }: { post: Post }) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  const timeAgo = (dateStr: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000 / 60 / 60);
    return diff > 0 ? `${diff}h ago` : 'Just now';
  };

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const handleLike = async () => {
    // Optimistic Update
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    
    // API Call
    try {
      await communityAPI.toggleLike(post.id);
    } catch (e) {
      // Keep optimistic update for UX if backend fails
      console.error("Failed to toggle like on backend, keeping local state", e);
    }
  };

  const handleToggleComments = async () => {
    setShowComments(!showComments);
    if (!showComments && comments.length === 0) {
      // Fetch comments (Mocking for now)
      // const res = await communityAPI.getComments(post.id);
      setComments([
        { id: 1, userId: 201, username: 'Sarah_Connor', commentText: 'Totally agree! Visuals were insane.', createdAt: new Date().toISOString() }
      ]);
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await communityAPI.addComment(post.id, { commentText: newComment });
      setComments([...comments, res.data]);
    } catch (error) {
      console.error("Failed to post comment, using mock data", error);
      const newCommentObj: Comment = {
        id: Date.now(),
        userId: 1,
        username: 'You',
        commentText: newComment,
        createdAt: new Date().toISOString()
      };
      setComments([...comments, newCommentObj]);
    } finally {
      setNewComment('');
    }
  };

  return (
    <div className="bg-[#121212] border border-white/5 rounded-xl p-5 sm:p-6 transition-colors hover:border-white/10">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-600 to-purple-800 flex items-center justify-center font-bold shadow-lg">
            {post.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-100">{post.username}</h3>
            <p className="text-xs text-gray-500">{timeAgo(post.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-gray-500 text-sm">
          <span className="hidden sm:inline">{formattedDate}</span>
          <button className="hover:text-white transition-colors"><MoreHorizontal size={18}/></button>
        </div>
      </div>

      {/* Post Content */}
      <p className="text-gray-200 text-sm sm:text-base leading-relaxed whitespace-pre-wrap mb-4">
        {post.content}
      </p>

      {/* Tagged Media Card */}
      {post.mediaDetails && (
        <div className="bg-black/40 border border-white/10 rounded-lg p-3 flex gap-4 mb-4 items-center cursor-pointer hover:bg-white/5 transition-colors max-w-sm">
          <div className="w-12 h-16 rounded overflow-hidden flex-shrink-0">
            <img src={post.mediaDetails.poster} alt={post.mediaDetails.title} className="w-full h-full object-cover" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-200 text-sm">{post.mediaDetails.title}</h4>
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
              <span>{post.mediaDetails.year}</span>
              <span className="flex items-center gap-1 text-yellow-500">
                <Star fill="currentColor" size={10} /> {post.mediaDetails.rating}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5 text-gray-400">
        <div className="flex items-center gap-6">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-2 text-sm transition-colors ${isLiked ? 'text-red-500' : 'hover:text-red-400'}`}
          >
            <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
            <span>{likeCount}</span>
          </button>
          
          <button 
            onClick={handleToggleComments}
            className={`flex items-center gap-2 text-sm transition-colors ${showComments ? 'text-white' : 'hover:text-white'}`}
          >
            <MessageCircle size={18} />
            <span>{post.commentCount + comments.length}</span>
          </button>
        </div>
        
        <button className="hover:text-white transition-colors"><Share2 size={18} /></button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-white/5 space-y-4 animate-in fade-in slide-in-from-top-2">
          {comments.map(c => (
            <div key={c.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-800 flex-shrink-0 flex items-center justify-center text-xs font-bold">
                {c.username.charAt(0)}
              </div>
              <div className="bg-white/5 rounded-lg p-3 flex-1">
                <h5 className="font-medium text-xs text-gray-300 mb-1">{c.username}</h5>
                <p className="text-sm text-gray-200">{c.commentText}</p>
              </div>
            </div>
          ))}
          
          <form onSubmit={submitComment} className="flex gap-2 mt-2">
            <input 
              type="text" 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-black/50 border border-white/10 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-red-500/50 transition-colors"
            />
            <button 
              type="submit"
              disabled={!newComment.trim()}
              className="w-9 h-9 rounded-full bg-red-600 hover:bg-red-700 disabled:bg-gray-800 text-white flex items-center justify-center transition-colors"
            >
              <Send size={14} className="ml-0.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// --- Sub-Component: Create Post Modal ---
function CreatePostModal({ onClose, onSubmit }: { onClose: () => void, onSubmit: (post: Post) => void }) {
  const [content, setContent] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [taggedTmdbId, setTaggedTmdbId] = useState<number | undefined>();
  const [taggedMediaType, setTaggedMediaType] = useState<'movie' | 'tv'>('movie');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const maxChars = 2000;

  const handleSubmit = async () => {
    if (!content.trim() || content.length > maxChars) return;
    setIsSubmitting(true);
    
    try {
      const res = await communityAPI.createPost({ 
        content, 
        taggedTmdbId, 
        taggedMediaType: taggedTmdbId ? taggedMediaType : undefined 
      });
      onSubmit(res.data);
    } catch (e) {
      console.error("Failed to create post, using mock data", e);
      const newPost: Post = {
        id: Date.now(),
        userId: 1,
        username: 'You',
        content,
        taggedTmdbId,
        taggedMediaType: taggedTmdbId ? taggedMediaType : undefined,
        createdAt: new Date().toISOString(),
        likeCount: 0,
        commentCount: 0,
        mediaDetails: taggedTmdbId ? {
          title: `Tagged Media (${taggedTmdbId})`,
          year: new Date().getFullYear().toString(),
          rating: 0,
          poster: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=200&auto=format&fit=crop'
        } : undefined
      };
      onSubmit(newPost);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-lg font-bold">Create Post</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-5">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts, recommendations, or opinions..."
            className="w-full h-32 bg-transparent resize-none focus:outline-none text-gray-200 placeholder-gray-500 text-base"
            maxLength={maxChars}
          />
          
          {/* Tagging Utility */}
          {!showTagInput ? (
            <button 
              onClick={() => setShowTagInput(true)}
              className="flex items-center gap-2 text-sm text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-full transition-colors mt-2"
            >
              <Film size={14} /> Tag Movie/Show
            </button>
          ) : (
            <div className="mt-3 flex items-center gap-3">
              <input
                type="number"
                value={taggedTmdbId || ''}
                onChange={(e) => setTaggedTmdbId(parseInt(e.target.value) || undefined)}
                placeholder="TMDB ID (e.g. 693134)"
                className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-red-500 text-white w-40"
              />
              <select
                value={taggedMediaType}
                onChange={(e) => setTaggedMediaType(e.target.value as 'movie' | 'tv')}
                className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-red-500 text-white"
              >
                <option value="movie">Movie</option>
                <option value="tv">TV Show</option>
              </select>
              <button 
                onClick={() => { setShowTagInput(false); setTaggedTmdbId(undefined); }}
                className="text-gray-400 hover:text-white transition-colors"
                title="Cancel Tagging"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-white/10 flex items-center justify-between bg-black/20">
          <span className={`text-xs ${content.length > maxChars - 100 ? 'text-red-400' : 'text-gray-500'}`}>
            {content.length} / {maxChars}
          </span>
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || content.length > maxChars || isSubmitting}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-800 disabled:text-gray-500 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
}