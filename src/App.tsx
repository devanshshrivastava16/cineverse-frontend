import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import LandingPage from './pages/LandingPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MovieDetails from './pages/MovieDetails'
import SearchPage from './pages/Search'
import CineBot from './pages/CineBot'
import Watchlist from './pages/Watchlist'
import WatchedHistory from './pages/WatchedHistory'
import CommunityPage from './pages/CommunityPage'
import ProfilePage from './pages/ProfilePage'
import MediaBrowse from './pages/MediaBrowse'
import { Bot, X } from 'lucide-react'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const handleLogin = (userData: any) => {
    setIsAuthenticated(true)
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <LandingPage />} />
        <Route path="/home" element={isAuthenticated ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={<RegisterPage onRegister={handleLogin} />} />
        <Route path="/movie/:id" element={isAuthenticated ? <MovieDetails /> : <Navigate to="/login" />} />
        <Route path="/tv/:id" element={isAuthenticated ? <MovieDetails /> : <Navigate to="/login" />} />
        <Route path="/search" element={isAuthenticated ? <SearchPage /> : <Navigate to="/login" />} />
        <Route path="/movies" element={isAuthenticated ? <MediaBrowse mediaType="movie" pageTitle="Movies" /> : <Navigate to="/login" />} />
        <Route path="/tv-shows" element={isAuthenticated ? <MediaBrowse mediaType="tv" pageTitle="TV Shows" /> : <Navigate to="/login" />} />
        <Route path="/watchlist" element={isAuthenticated ? <Watchlist /> : <Navigate to="/login" />} />
        <Route path="/watched" element={isAuthenticated ? <WatchedHistory /> : <Navigate to="/login" />} />
        <Route path="/community" element={isAuthenticated ? <CommunityPage /> : <Navigate to="/login" />} />
        <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>

      {/* Floating Chatbot Button */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start">
        {isChatOpen ? (
          <div className="mb-4 relative shadow-2xl rounded-2xl overflow-hidden animate-in slide-in-from-bottom-5 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] bg-[#0a0a0a] flex flex-col">
            <button 
              onClick={() => setIsChatOpen(false)}
              className="absolute top-5 right-5 z-50 text-gray-400 hover:text-white bg-black/50 rounded-full p-1 transition-colors"
              aria-label="Close Chat"
            >
              <X size={18} />
            </button>
            <div className="flex-1 overflow-hidden">
              <CineBot />
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-600/30 transition-transform hover:scale-110"
            aria-label="Open Chat"
          >
            <Bot size={28} />
          </button>
        )}
      </div>
    </Router>
  )
}

export default App
