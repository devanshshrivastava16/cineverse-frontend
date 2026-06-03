import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

interface RegisterPageProps {
  onRegister?: (userData: any) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Register the user
      await authAPI.register({ username, email, password });
      
      // 2. Automatically log them in immediately after registration
      const loginResponse = await authAPI.login({ email, password });
      
      if (loginResponse.data.token) {
        localStorage.setItem('token', loginResponse.data.token);
        
        // Call the onRegister callback to update App state
        if (onRegister) {
          onRegister({
            username: loginResponse.data.username,
            email: loginResponse.data.email,
            role: loginResponse.data.role,
          });
        }
        
        // Redirect to home after successful registration
        navigate('/home');
      }
    } catch (err: any) {
      // Handle validation errors from the backend (e.g., email already exists)
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center font-sans selection:bg-[#E50914] selection:text-white">
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-black"></div>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-0"></div>

      {/* Register Card */}
      <div className="relative z-10 w-full max-w-md p-8 md:p-10 bg-[#0a0a0a]/80 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white mb-2">
            <span className="text-[#E50914]">C</span>ineVerse
          </h1>
          <p className="text-gray-400 font-medium">Join the ultimate movie community</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#141414] border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#E50914] transition-colors"
              placeholder="cinefanatic_99"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#141414] border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#E50914] transition-colors"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#141414] border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#E50914] transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#E50914] hover:bg-red-700 text-white font-bold py-3.5 rounded-lg transition-all shadow-[0_4px_14px_rgba(229,9,20,0.4)] hover:shadow-[0_6px_20px_rgba(229,9,20,0.6)] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-8 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-white hover:text-[#E50914] font-semibold transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;