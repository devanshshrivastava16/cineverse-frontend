import React from 'react';
import { Link } from 'react-router-dom';
import heroBg from '../assets/images/landingpage.png';

// --- Sub-Components for Clean Architecture ---

const NavBar: React.FC = () => (
  <nav className="relative z-20 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
    <div className="flex items-center gap-1">
      <span className="text-3xl font-bold tracking-tighter text-white">
        <span className="text-[#E50914]">C</span>ineVerse
      </span>
    </div>
    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
      <a href="#home" className="text-white hover:text-[#E50914] transition-colors">Home</a>
      <a href="#movies" className="hover:text-white transition-colors">Movies</a>
      <a href="#tvshows" className="hover:text-white transition-colors">TV Shows</a>
      <a href="#community" className="hover:text-white transition-colors">Community</a>
      <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
    </div>
    <Link to="/login" className="bg-[#E50914] hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium text-sm transition-colors shadow-[0_4px_14px_rgba(229,9,20,0.4)]">
      Sign In
    </Link>
  </nav>
);

const HeroContent: React.FC = () => (
  <main className="relative z-10 flex-grow flex flex-col justify-center px-8 max-w-7xl mx-auto w-full">
    <div className="max-w-2xl">
      <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6 text-white">
        Cinsover.<br />
        <span className="text-[#E50914]">Watch.</span> Review.<br />
        Repeat.
      </h1>
      
      <p className="text-lg text-gray-300 mb-8 max-w-lg leading-relaxed">
        Your ultimate destination for movies, TV shows, reviews, and a passionate community.
      </p>

      <div className="flex flex-wrap items-center gap-4">
        <Link to="/login" className="bg-[#E50914] hover:bg-red-700 text-white px-8 py-3 rounded-md font-semibold transition-transform hover:-translate-y-0.5 shadow-[0_4px_14px_rgba(229,9,20,0.4)] inline-block">
          Get Started
        </Link>
        <Link to="/home" className="bg-black/30 border border-gray-500 hover:border-white hover:bg-white/10 text-white px-8 py-3 rounded-md font-semibold transition-all backdrop-blur-sm inline-block">
          Explore Movies
        </Link>
      </div>
    </div>
  </main>
);

const FeatureBar: React.FC = () => {
  const features = [
    { 
      title: "Explore Millions", 
      subtitle: "of Movies & Shows", 
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /> 
    },
    { 
      title: "Build Watchlist", 
      subtitle: "Save your favorites", 
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /> 
    },
    { 
      title: "Write Reviews", 
      subtitle: "Share your thoughts", 
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /> 
    },
    { 
      title: "Join Community", 
      subtitle: "Connect with fanatics", 
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /> 
    }
  ];

  return (
    <div className="relative z-10 border-t border-gray-800/60 bg-[#0a0a0a]/70 backdrop-blur-md shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.8)]">
      <div className="max-w-7xl mx-auto px-8 py-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
              <div className="text-[#E50914]">
                <svg className="w-8 h-8 drop-shadow-[0_0_8px_rgba(229,9,20,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {feature.icon}
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{feature.title}</h3>
                <p className="text-xs text-gray-400">{feature.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Main Page Assembly ---

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black font-sans selection:bg-[#E50914] selection:text-white">
      <div className="relative min-h-screen w-full flex flex-col overflow-hidden">
        {/* Background Image Layer with Parallax Zoom Effect */}
        <img
          src={heroBg}
          alt="CineVerse Hero Background"
          className="absolute inset-0 w-full h-full object-cover object-center animate-slow-pan"
        />

        {/* Dark Overlay for Enhanced Text Readability (70% black opacity) */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/70 to-black/40"
          style={{ zIndex: 5 }}
        ></div>

        {/* Content Layer */}
        <div className="relative z-10 flex flex-col h-full">
          <NavBar />
          <HeroContent />
          <FeatureBar />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;