import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000');

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ AUTHENTICATION ============

export const authAPI = {
  register: (data: { username: string; email: string; password: string }) =>
    apiClient.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),
};

// ============ USER MANAGEMENT ============

export const userAPI = {
  getProfile: () => apiClient.get('/users/me'),
  
  updateProfile: (data: { username?: string; bio?: string }) =>
    apiClient.put('/users/me', data),
  
  uploadProfileImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/users/me/profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ============ TMDB - MOVIES & TV SHOWS ============

export const tmdbAPI = {
  getTrendingMovies: () => apiClient.get('/tmdb/trending/movies'),
  getTrendingTV: () => apiClient.get('/tmdb/trending/tv'),
  getTopRatedMovies: () => apiClient.get('/tmdb/top-rated/movies'),
  getTopRatedTV: () => apiClient.get('/tmdb/top-rated/tv'),
  
  searchMovies: (query: string, page: number = 1) =>
    apiClient.get('/tmdb/search/movies', { params: { query, page } }),
  
  searchTV: (query: string, page: number = 1) =>
    apiClient.get('/tmdb/search/tv', { params: { query, page } }),
  
  getMovieDetails: (id: number) => apiClient.get(`/tmdb/movies/${id}`),
  getTVDetails: (id: number) => apiClient.get(`/tmdb/tv/${id}`),
  
  getSimilarMovies: (id: number) => apiClient.get(`/tmdb/movies/${id}/similar`),
  getSimilarTV: (id: number) => apiClient.get(`/tmdb/tv/${id}/similar`),
  
  getMovieVideos: (id: number) => apiClient.get(`/tmdb/movies/${id}/videos`),
  getTVVideos: (id: number) => apiClient.get(`/tmdb/tv/${id}/videos`),
};

// ============ WATCHLIST ============

export const watchlistAPI = {
  getWatchlist: () => apiClient.get('/watchlist'),
  
  addToWatchlist: (data: { tmdbId: number; mediaType: 'movie' | 'tv' }) =>
    apiClient.post('/watchlist', data),
  
  removeFromWatchlist: (data: { tmdbId: number; mediaType: 'movie' | 'tv' }) =>
    apiClient.delete('/watchlist', { data }),
};

// ============ WATCHED CONTENT ============

export const watchedAPI = {
  getWatched: () => apiClient.get('/watched'),
  
  markAsWatched: (data: { tmdbId: number; mediaType: 'movie' | 'tv' }) =>
    apiClient.post('/watched', data),
  
  removeFromWatched: (data: { tmdbId: number; mediaType: 'movie' | 'tv' }) =>
    apiClient.delete('/watched', { data }),
};

// ============ REVIEWS & RATINGS ============

export const reviewAPI = {
  submitReview: (data: {
    tmdbId: number;
    mediaType: 'movie' | 'tv';
    rating: number;
    reviewText?: string;
  }) => apiClient.post('/reviews', data),
  
  deleteReview: (id: number) => apiClient.delete(`/reviews/${id}`),
  
  getContentReviews: (tmdbId: number, mediaType: 'movie' | 'tv') =>
    apiClient.get('/reviews/content', { params: { tmdbId, mediaType } }),
  
  getMyReviews: () => apiClient.get('/reviews/me'),
};

// ============ COMMUNITY ============

export const communityAPI = {
  // Posts
  getAllPosts: (page: number = 0, size: number = 10) =>
    apiClient.get('/community/posts', { params: { page, size } }),
  
  getPost: (id: number) => apiClient.get(`/community/posts/${id}`),
  
  createPost: (data: {
    content: string;
    taggedTmdbId?: number;
    taggedMediaType?: 'movie' | 'tv';
  }) => apiClient.post('/community/posts', data),
  
  updatePost: (id: number, data: {
    content: string;
    taggedTmdbId?: number;
    taggedMediaType?: 'movie' | 'tv';
  }) => apiClient.put(`/community/posts/${id}`, data),
  
  deletePost: (id: number) => apiClient.delete(`/community/posts/${id}`),
  
  toggleLike: (id: number) => apiClient.post(`/community/posts/${id}/like`),
  
  // Comments
  getComments: (postId: number) =>
    apiClient.get(`/community/posts/${postId}/comments`),
  
  addComment: (postId: number, data: { commentText: string }) =>
    apiClient.post(`/community/posts/${postId}/comments`, data),
  
  deleteComment: (id: number) => apiClient.delete(`/community/comments/${id}`),
};

// ============ AI CHATBOT ============

export const chatAPI = {
  sendMessage: (message: string) =>
    apiClient.post('/chat', { message }),
};

export default apiClient;
