import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, User as UserIcon } from 'lucide-react';

export interface User {
  id: string;
  username: string;
  profileImage?: string;
}

export interface NavbarProps {
  isAuthenticated: boolean;
  user?: User;
  onLogout?: () => void;
}

const NAV_LINKS = [
  { name: 'Movies', path: '/movies' },
  { name: 'TV Shows', path: '/tv-shows' },
  { name: 'Community', path: '/community' },
];

const DROPDOWN_LINKS = [
  { name: 'Watchlist', path: '/watchlist' },
  { name: 'Watched History', path: '/watched' },
  { name: 'Update Profile', path: '/profile' },
];

const Navbar: React.FC<NavbarProps> = ({ isAuthenticated, user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Visibility Rules
  const hiddenRoutes = ['/', '/login', '/signup'];
  const shouldHideNavbar = hiddenRoutes.includes(location.pathname);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  // Handle click outside and Escape key for dropdown
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    if (isDropdownOpen || isMobileMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isDropdownOpen, isMobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  if (shouldHideNavbar) return null;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left Side: Logo */}
          <Link 
            to="/home" 
            className="flex-shrink-0 flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded-md"
            aria-label="CineVerse Home"
          >
            <span className="text-3xl font-black tracking-tight">
              <span className="text-red-600">C</span>
              <span className="text-white">ineVerse</span>
            </span>
          </Link>

          {/* Center: Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className="relative px-1 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded-md"
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-indicator"
                      className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  {/* Hover Underline */}
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
                </Link>
              );
            })}
          </div>

          {/* Right Side: Search & Auth Actions (Desktop) */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/search" 
              className="text-gray-300 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded-full p-1"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </Link>

            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded-full overflow-hidden border border-white/10 hover:border-white/30 transition-colors"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                  aria-label="User profile menu"
                >
                  {user?.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt={user.username} 
                      className="w-10 h-10 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-zinc-800 flex items-center justify-center text-white font-semibold uppercase">
                      {user?.username?.charAt(0) || <UserIcon className="w-5 h-5" />}
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="absolute right-0 mt-3 w-48 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl py-2 overflow-hidden"
                    >
                      {DROPDOWN_LINKS.map((link) => (
                        <Link
                          key={link.name}
                          to={link.path}
                          className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-zinc-800 hover:text-red-500 transition-colors focus:outline-none focus:bg-zinc-800 focus:text-red-500"
                        >
                          {link.name}
                        </Link>
                      ))}
                      <div className="h-px bg-white/10 my-2" />
                      <button 
                        onClick={() => {
                          onLogout?.();
                          navigate('/login');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-zinc-800 hover:text-red-500 transition-colors focus:outline-none focus:bg-zinc-800 focus:text-red-500"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-red-600 text-white px-6 py-2 rounded-full font-medium hover:bg-red-700 hover:shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <Link to="/search" className="text-gray-300 hover:text-white" aria-label="Search">
              <Search className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded-md p-1"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 bg-zinc-950 md:hidden pt-24 px-6 flex flex-col"
          >
            <div className="flex flex-col space-y-6 flex-grow">
              {/* Primary Links */}
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-2xl font-bold tracking-wide transition-colors ${
                    location.pathname.startsWith(link.path) ? 'text-red-600' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <div className="h-px bg-white/10 my-4" />

              {/* Auth Links */}
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-4 mb-4">
                     {user?.profileImage ? (
                        <img src={user.profileImage} alt={user.username} className="w-12 h-12 rounded-full object-cover border border-white/10" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-white font-semibold uppercase text-xl">
                          {user?.username?.charAt(0) || <UserIcon className="w-6 h-6" />}
                        </div>
                      )}
                      <span className="text-xl font-semibold text-white">{user?.username}</span>
                  </div>
                  {DROPDOWN_LINKS.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      className="text-lg text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  ))}
                  <button 
                    onClick={() => {
                      onLogout?.();
                      navigate('/login');
                    }}
                    className="text-left text-lg text-red-500 hover:text-red-400 font-medium transition-colors mt-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="bg-red-600 text-white text-center px-6 py-4 rounded-full font-bold text-lg hover:bg-red-700 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all duration-300 mt-4"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
