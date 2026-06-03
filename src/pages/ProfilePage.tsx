import React, { useState, useEffect, useRef } from 'react';
import { Camera, Edit2, Save, X, User, Mail, Calendar, AlertCircle } from 'lucide-react';
import { userAPI } from '../services/api';

// Shape of the User Profile based on the API response
interface UserProfile {
  id: number;
  username: string;
  email: string;
  profileImageUrl: string | null;
  bio: string | null;
  role: string;
  createdAt: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', bio: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch Profile on Mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        // In production: const response = await userAPI.getProfile();
        
        // Mocking the successful response for UI development if API is offline
        const mockData: UserProfile = {
          id: 1,
          username: "john_doe",
          email: "john@example.com",
          profileImageUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
          bio: "Huge fan of Nolan and Villeneuve. Always looking for the next great sci-fi masterpiece.",
          role: "USER",
          createdAt: "2024-01-15T10:30:00"
        };
        
        setProfile(mockData);
        setEditForm({ username: mockData.username, bio: mockData.bio || '' });
      } catch (err) {
        console.error("Failed to load profile", err);
        setError("Failed to load profile data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Format the join date
  const formattedJoinDate = profile?.createdAt 
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Unknown';

  // 2. Handle Text Profile Updates (PUT)
  const handleSaveProfile = async () => {
    setError(null);
    setIsSaving(true);
    try {
      // Create payload (only send changed fields if desired, or both)
      const payload = {
        username: editForm.username !== profile?.username ? editForm.username : undefined,
        bio: editForm.bio !== profile?.bio ? editForm.bio : undefined
      };

      // In production: const response = await userAPI.updateProfile(payload);
      // setProfile(response.data);

      // Optimistic UI update for mock
      setProfile((prev) => prev ? { ...prev, username: editForm.username, bio: editForm.bio } : null);
      setIsEditing(false);
    } catch (err: any) {
      // Handle 400 - Username already taken
      if (err.response?.status === 400) {
        setError("That username is already taken. Please try another.");
      } else {
        setError("An error occurred while saving your profile.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Handle Profile Image Upload (POST multipart/form-data)
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional: Basic validation (size/type)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB");
      return;
    }

    setIsUploadingImage(true);
    setError(null);

    try {
      const response = await userAPI.uploadProfileImage(file);
      setProfile(response.data);
    } catch (err) {
      console.error("Failed to upload image", err);
      setError("Failed to upload profile picture.");
    } finally {
      setIsUploadingImage(false);
      // Reset input so the same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-4 sm:p-8 flex justify-center items-start pt-20">
        <div className="w-full max-w-3xl bg-[#121212] border border-white/10 rounded-2xl p-8 animate-pulse flex flex-col sm:flex-row gap-8">
          <div className="w-32 h-32 rounded-full bg-white/5 flex-shrink-0 mx-auto sm:mx-0" />
          <div className="flex-1 space-y-4">
            <div className="h-8 bg-white/5 rounded w-1/3" />
            <div className="h-4 bg-white/5 rounded w-1/4" />
            <div className="h-24 bg-white/5 rounded w-full mt-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-gray-400 mt-1">Manage your public information and account settings.</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center gap-3 animate-in fade-in">
            <AlertCircle size={18} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          
          {/* Decorative background blur */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 relative z-10">
            
            {/* LEFT: Avatar Upload Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                
                {/* Avatar Image */}
                <div className={`w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 shadow-xl transition-all duration-300 group-hover:border-red-500/50 ${isUploadingImage ? 'opacity-50' : ''}`}>
                  {profile?.profileImageUrl ? (
                    <img 
                      src={profile.profileImageUrl} 
                      alt={profile.username} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-gray-800 to-gray-700 flex items-center justify-center">
                      <User size={40} className="text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Upload Overlay */}
                <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]">
                  <Camera size={24} className="text-white mb-1" />
                  <span className="text-[10px] font-medium text-white uppercase tracking-wider">Change</span>
                </div>

                {/* Loading Spinner for Image */}
                {isUploadingImage && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-white/20 border-t-red-500 rounded-full animate-spin" />
                  </div>
                )}
              </div>
              
              {/* Hidden File Input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/jpeg, image/png, image/webp" 
                className="hidden" 
              />
            </div>

            {/* RIGHT: User Details & Edit Form */}
            <div className="flex-1">
              {!isEditing ? (
                /* --- DISPLAY MODE --- */
                <div className="animate-in fade-in">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-100">{profile?.username}</h2>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        <span className="flex items-center gap-1.5"><Mail size={14} /> {profile?.email}</span>
                        <span className="flex items-center gap-1.5"><Calendar size={14} /> Joined {formattedJoinDate}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">About Me</h3>
                    <p className="text-gray-200 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
                      {profile?.bio || <span className="text-gray-500 italic">No bio provided yet. Click edit to add one.</span>}
                    </p>
                  </div>
                </div>
              ) : (
                /* --- EDIT MODE --- */
                <div className="animate-in fade-in space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-colors"
                      placeholder="Enter username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Bio</label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      className="w-full h-32 bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-colors resize-none"
                      placeholder="Tell the community about your favorite movies..."
                      maxLength={500}
                    />
                    <div className="flex justify-end mt-1">
                      <span className="text-xs text-gray-500">{editForm.bio.length} / 500</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving || !editForm.username.trim()}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-800 disabled:text-gray-500 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
                    >
                      {isSaving ? (
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditForm({ username: profile?.username || '', bio: profile?.bio || '' });
                        setError(null);
                      }}
                      disabled={isSaving}
                      className="flex items-center gap-2 bg-transparent hover:bg-white/5 text-gray-300 px-4 py-2.5 rounded-lg font-medium transition-colors"
                    >
                      <X size={16} /> Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}