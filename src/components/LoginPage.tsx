/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Board, User, StreamingService, TvShow } from '../types';
import { 
  Tv, 
  User as UserIcon, 
  Mail, 
  ArrowRight, 
  Check, 
  Sparkles, 
  Plus, 
  ChevronRight, 
  ChevronLeft, 
  Loader2, 
  Chrome, 
  ShieldAlert,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoginPageProps {
  onLogin: (board: Board, options?: { showStarterPackAlert?: boolean }) => void;
}

const GENRE_OPTIONS = [
  'Action', 'Comedy', 'Drama', 'Sci-Fi', 'Horror', 'Thriller', 'Mystery', 'Dystopian', 'Western', 'Animation', 'Spy Thriller'
];

const SERVICE_OPTIONS: StreamingService[] = [
  'Netflix', 'HBO', 'Disney+', 'Prime Video', 'Hulu', 'Apple TV', 'Paramount+', 'Peacock', 'AMC+', 'Other'
];

const BACKGROUND_IMAGES = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuG_1v8qSY_Jr5OTI94uFnIsSsd_eqokq2cHQQ7Bv43w&s=10", // The Americans
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6pzwPlJXnQcGY8BkO_z2ph4-asGzeaLDUAmNU8UM3AQ&s=10", // Slow Horses
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTL0jIu8CIbj8o9aY4whwMucEGJiJyuGdigiZNpE6gY&s", // Pluribus
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTswcn_b-V5fpk75yok8qb1V2FYN1hxRhA7MmxYTwDI6A&s=10", // Sons of Anarchy
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUqC_tu3W9jV36t_xdOh0sOMI-jwEnqhIA_sxBz_jqCg&s=10", // Lioness
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuw1an2kM_Fwjs1wYUwMz29mirossFh-Whe4ZELKv-dg&s=10", // The Great
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuy7sVt3veocWTt6fy6G1M7hpuOBMxf-Tj3FiZ3FZEvA&s", // Daredevil: Born Again
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCstQAdMI7ojIlAQaEbEhOg-ljIY3zm8bSKRIl9XoRdA&s=10", // The Office
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPWsAbgnSfrZMMc7-OGQUKy3FsMXw01oW5B-k-5Qc-Ag&s=10", // The Walking Dead
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLSxpFNAmFk_IZGbaryDs3GkM5lnyWEjGt6USNocYJPA&s=10", // The Bear
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkoc8QUr2WysQmIUEQD-xsTyn1fW-Co-YZAH0-ghs-Kg&s", // From
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStX3K4wUFwD4FHp7pQNkFl4hfNP6-a5xquJ1TIs_3PZw&s=10", // Rick and Morty
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7pIsFmg12Cv_3Q1P2kWK4ZGsDo8XeF-UkErBVCSjvFg&s=10", // House of the Dragon
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTouf15_KKf6F8ypTOh3XUFpq8rcBfo05msEXy01cMYXQ&s", // Shogun
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQL5_s11y4oGepKQoldiMgqXpN0FLBskXiEqFtLEzo9Gw&s=10", // Peaky Blinders
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSm_kxJfnMuGgFwNjzqp4TMcCkho15qhOvEr7yTOt3I3Q&s=10", // Shameless
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGow7p2r8x9pAV8hTP2OzWwWNDhQa96bWgImV_ucRIDw&s=10", // Silo
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4Qf7wolgUB7X37sMbkSd93bUJlubb_qNmozDnQtHp4Q&s=10", // Stranger Things
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcAtds1wdUIPpEjgpHKayk2vNk27yaBo8KEsvpA8zwMg&s=10", // Supernatural
  "https://images.squarespace-cdn.com/content/v1/51b3dc8ee4b051b96ceb10de/a3d300bb-f1b7-4fca-b376-03273a92de3e/X-MEN+%2797+Star+is+%2522Amazed+Disney+Greenlit%2522+Season+2+Because+It%E2%80%99s+%2522Very%2C+Very+Dark%2522+and+%2522A+Lot+of+People+Die%2522.jpg?format=2500w", // X-Men '97
  "https://m.media-amazon.com/images/S/pv-target-images/738a33dbb22b100bca29e782cf83abc2b99a17d16efa5f852107d51f2f1d0768.jpg", // Foundation
  "https://s10019.cdn.ncms.io/wp-content/uploads/2025/03/The-Last-Of-Us-S2_HO_KA_16x9_v03.jpg.jpeg", // The Last Of Us
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNACrAMoLkgMH0e47maB2DZ7OeMG3ZWBtuheU7rgkUdg&s=10", // Severance
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYxCCGjsy6Qz-8QFXGNNbWfyTcAbLe7J3A1DSnch1l5A&s=10", // The Mandalorian
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  // Auth view mode: 'login' | 'signup' | 'google-sim'
  const [viewMode, setViewMode] = useState<'login' | 'signup' | 'google-sim'>('login');
  
  // Login input
  const [loginEmail, setLoginEmail] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Google Simulation State
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [googleStep, setGoogleStep] = useState<1 | 2>(1);

  // Onboarding Wizard State
  const [wizardStep, setWizardStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    genres: [] as string[],
    services: [] as StreamingService[],
    starterPack: true
  });
  const [wizardError, setWizardError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Fetch registered users (family members) on load
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const data = await res.json();
          setUsers(data || []);
        }
      } catch (err) {
        console.error("Failed to load users list:", err);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const [collectionBanners, setCollectionBanners] = useState<string[]>([]);

  // Fetch show banner images from actual show collection on mount
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch('/api/login-banners');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setCollectionBanners(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch custom collection banners:", err);
      }
    };
    fetchBanners();
  }, []);

  // Handle logging in with an existing user
  const handleSelectUser = async (userId: string) => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const res = await fetch(`/api/boards?id=${userId}`);
      if (res.ok) {
        const boardData = await res.json();
        onLogin(boardData);
      } else {
        setLoginError("Could not retrieve profile board data. Please try again.");
      }
    } catch (err) {
      setLoginError("Connection issue. Please verify your internet.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Login by manually typing email or name
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) return;

    setIsLoggingIn(true);
    setLoginError(null);

    const emailClean = loginEmail.trim().toLowerCase();
    
    // Check if user already exists
    const existingUser = users.find(u => u.email.toLowerCase() === emailClean || u.name.toLowerCase() === emailClean);
    
    if (existingUser) {
      handleSelectUser(existingUser.id);
    } else {
      // Prompt user to sign up instead
      setLoginError("Account not found. Select 'Join as New Member' to set up a new profile!");
      setIsLoggingIn(false);
    }
  };

  // Google Sign-In Simulation Success Handler
  const handleGoogleSignInSuccess = async (name: string, email: string) => {
    setIsLoggingIn(true);
    const emailClean = email.trim().toLowerCase();
    
    // Check if already registered
    const existingUser = users.find(u => u.email.toLowerCase() === emailClean);
    if (existingUser) {
      handleSelectUser(existingUser.id);
    } else {
      // Proceed to onboarding with details pre-populated!
      setFormData(prev => ({
        ...prev,
        name: name,
        email: email,
      }));
      setViewMode('signup');
      setWizardStep(2); // Jump past name step straight to genres!
      setIsLoggingIn(false);
    }
  };

  const handleGoogleSimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (googleStep === 1) {
      if (!googleEmail.includes('@') || !googleEmail.includes('.')) {
        setLoginError("Please enter a valid email address");
        return;
      }
      // Extract a name suggestion from email
      const namePart = googleEmail.split('@')[0];
      const suggestedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      setGoogleName(suggestedName);
      setGoogleStep(2);
    } else {
      if (!googleName.trim()) return;
      setViewMode('login');
      handleGoogleSignInSuccess(googleName.trim(), googleEmail.trim());
    }
  };

  // Toggle selection in multi-select fields
  const handleToggleGenre = (genre: string) => {
    setFormData(prev => {
      const exists = prev.genres.includes(genre);
      return {
        ...prev,
        genres: exists ? prev.genres.filter(g => g !== genre) : [...prev.genres, genre]
      };
    });
  };

  const handleToggleService = (service: StreamingService) => {
    setFormData(prev => {
      const exists = prev.services.includes(service);
      return {
        ...prev,
        services: exists ? prev.services.filter(s => s !== service) : [...prev.services, service]
      };
    });
  };

  // Process and create the user's board
  const handleCompleteOnboarding = async () => {
    if (!formData.name.trim()) {
      setWizardError("Your name is required to set up a collection.");
      setWizardStep(1);
      return;
    }

    setIsRegistering(true);
    setWizardError(null);

    try {
      // Generate unique clean board and user IDs
      const cleanName = formData.name.trim().replace(/[^a-zA-Z0-9 ]/g, '');
      const uniqueId = `user-${cleanName.toLowerCase().replace(/\s+/g, '-')}-${Math.floor(1000 + Math.random() * 9000)}`;
      const userEmail = formData.email.trim() || `${uniqueId}@coughtater.com`;

      // Create User Object
      const newUser: User = {
        id: uniqueId,
        name: formData.name.trim(),
        email: userEmail,
        avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(formData.name.trim())}`,
        createdAt: new Date().toISOString()
      };

      // Select initial starter pack shows if checked
      let starterShows: TvShow[] = [];
      if (formData.starterPack) {
        // Fetch default shows or select ones that match their genre preferences
        try {
          const res = await fetch('/api/boards?id=default');
          if (res.ok) {
            const defaultBoard = await res.json();
            const defaultShows: TvShow[] = defaultBoard.shows || [];
            
            // Filter shows by matching genres
            const matching = defaultShows.filter(show => 
              show.genres.some(genre => formData.genres.includes(genre))
            );

            // If we have matches, take up to 4. Otherwise, take top 3 default shows.
            if (matching.length >= 2) {
              starterShows = matching.slice(0, 4).map(s => ({
                ...s,
                id: `show-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                status: 'Backlog', // Start fresh in backlog
                latestWatched: { season: 1, episode: 1, title: 'Episode 1' },
                userScore: null,
                userNotes: '',
                createdAt: new Date().toISOString()
              }));
            } else {
              starterShows = defaultShows.slice(0, 3).map(s => ({
                ...s,
                id: `show-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                status: 'Backlog',
                latestWatched: { season: 1, episode: 1, title: 'Episode 1' },
                userScore: null,
                userNotes: '',
                createdAt: new Date().toISOString()
              }));
            }
          }
        } catch (e) {
          console.error("Could not fetch starter pack template shows", e);
        }
      }

      // Create Board Object
      const newBoard: Board = {
        id: uniqueId,
        name: `${formData.name.trim()}'s Collection`,
        shows: starterShows,
        preferences: {
          genres: formData.genres,
          actors: [],
          directors: [],
          services: formData.services
        },
        owner: newUser,
        updatedAt: new Date().toISOString()
      };

      // Save to server
      const saveRes = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBoard)
      });

      if (saveRes.ok) {
        onLogin(newBoard, { showStarterPackAlert: !!formData.starterPack });
      } else {
        setWizardError("Server rejected profile registration. Try a different name.");
      }
    } catch (err) {
      setWizardError("Network connection error. Could not setup profile.");
    } finally {
      setIsRegistering(false);
    }
  };

  const nextWizardStep = () => {
    if (wizardStep === 1) {
      if (!formData.name.trim()) {
        setWizardError("Your name is the only required field!");
        return;
      }
      setWizardError(null);
    }
    if (wizardStep === 2 && formData.genres.length === 0) {
      setWizardError("Please select at least one genre to personalize your feed.");
      return;
    }
    setWizardError(null);
    setWizardStep(prev => prev + 1);
  };

  const prevWizardStep = () => {
    setWizardError(null);
    setWizardStep(prev => prev - 1);
  };

  // Combine custom collection images with high-quality fallbacks
  const activeImages = collectionBanners.length > 0
    ? [...collectionBanners, ...BACKGROUND_IMAGES]
    : BACKGROUND_IMAGES;

  return (
    <div id="login-screen-root" className="min-h-screen bg-[#0B0D11] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Tiled TV Show Backdrop Grid */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Animated, tilted, high-density bento poster wall with subtle drifting and zoom animation */}
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-6 origin-center h-[130%] w-[130%] opacity-[0.42]"
          animate={{
            x: ["-10%", "-6%", "-12%", "-10%"],
            y: ["-10%", "-14%", "-8%", "-10%"],
            rotate: [-12, -10, -14, -12],
            scale: [1.35, 1.4, 1.32, 1.35]
          }}
          transition={{
            duration: 40,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        >
          {Array.from({ length: 30 }).map((_, idx) => {
            const img = activeImages[idx % activeImages.length];
            return (
              <div 
                key={idx}
                className="aspect-[2/3] w-full rounded-2xl overflow-hidden border border-slate-800 bg-[#131720] shadow-2xl relative"
              >
                <img 
                  src={img} 
                  alt="" 
                  className="w-full h-full object-cover filter brightness-75 contrast-125"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              </div>
            );
          })}
        </motion.div>

        {/* Robust, overlapping cinematic vignetting overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D11] via-transparent to-[#0B0D11] opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D11] via-transparent to-[#0B0D11] opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0D11]/85 via-transparent to-[#0B0D11]/85 opacity-90" />
        <div className="absolute inset-0 bg-[#0B0D11]/40 mix-blend-multiply" />
      </div>

      {/* Dynamic atmospheric background glow */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-blue-900/5 blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#131720]/80 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative z-10"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3.5 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-2xl shadow-lg shadow-blue-500/10 mb-4 ring-1 ring-blue-400/20">
            <Tv className="w-8 h-8 text-white stroke-[2.2]" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            CouchTaterz
          </h1>
          <p className="text-slate-400 text-sm mt-1.5 font-medium">
            Your Ultimate TV Fandom & Queue Tracker
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* LOGIN MODE */}
          {viewMode === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              {/* Existing Family / Friends profiles */}
              {!loadingUsers && users.length > 0 && (
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    Who's Watching?
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {users.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleSelectUser(user.id)}
                        disabled={isLoggingIn}
                        className="flex flex-col items-center p-3 bg-slate-900/40 hover:bg-slate-900 border border-slate-800/50 hover:border-blue-500/40 rounded-2xl transition-all duration-300 group"
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800 border-2 border-slate-700 group-hover:border-blue-400 transition-colors relative mb-2 flex items-center justify-center">
                          {user.avatarUrl ? (
                            <img 
                              src={user.avatarUrl} 
                              alt={user.name} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <UserIcon className="w-5 h-5 text-slate-500" />
                          )}
                        </div>
                        <span className="text-xs font-medium text-slate-300 group-hover:text-blue-400 transition-colors truncate max-w-full">
                          {user.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Login/Signup separator */}
              {!loadingUsers && users.length > 0 && (
                <div className="flex items-center gap-3 my-2">
                  <div className="h-[1px] flex-1 bg-slate-800" />
                  <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500">Or Get Started</span>
                  <div className="h-[1px] flex-1 bg-slate-800" />
                </div>
              )}

              {/* Login Actions */}
              <div className="space-y-4">
                {loginError && (
                  <div className="flex items-start gap-2 text-xs text-rose-400 bg-rose-500/5 border border-rose-500/15 p-3 rounded-xl">
                    <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  {/* Google Sign-In button */}
                  <button
                    type="button"
                    onClick={() => {
                      setLoginError(null);
                      setGoogleEmail('');
                      setGoogleStep(1);
                      setViewMode('google-sim');
                    }}
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-800 hover:border-slate-700 font-bold rounded-xl text-sm flex items-center justify-center gap-2.5 shadow-lg active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <Chrome className="w-4.5 h-4.5 text-blue-500 fill-blue-500/10" />
                    <span>Sign in with Google</span>
                  </button>

                  {/* Join as a New Member button */}
                  <button
                    type="button"
                    onClick={() => {
                      setWizardStep(1);
                      setFormData({
                        name: '',
                        email: '',
                        genres: [],
                        services: [],
                        starterPack: true
                      });
                      setViewMode('signup');
                    }}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/10 active:scale-[0.99] transition-all cursor-pointer border border-blue-500/25"
                  >
                    <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
                    <span>Join as a New Member</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* SIGNUP / ONBOARDING WIZARD */}
          {viewMode === 'signup' && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              {/* Wizard Steps indicator */}
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4].map((stepNum) => (
                    <div
                      key={stepNum}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        stepNum === wizardStep 
                          ? 'w-6 bg-blue-500' 
                          : stepNum < wizardStep 
                            ? 'w-2 bg-blue-500/50' 
                            : 'w-2 bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                  Step {wizardStep} of 4
                </span>
              </div>

              {/* Wizard Content */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold text-slate-200">Set Up Your Member Profile</h2>
                    <p className="text-xs text-slate-400">Join the TV fandom board! All you need is a display name.</p>
                  </div>

                  <div className="space-y-3.5 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                        Your Name <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Sarah"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full pl-11 pr-4 py-3 bg-slate-900/50 hover:bg-slate-900 focus:bg-slate-950 border border-slate-800 focus:border-blue-500/50 rounded-xl text-sm placeholder-slate-600 focus:outline-none transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                        Email Address <span className="text-slate-600">(Optional)</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="email"
                          placeholder="e.g. sarah@gmail.com"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full pl-11 pr-4 py-3 bg-slate-900/50 hover:bg-slate-900 focus:bg-slate-950 border border-slate-800 focus:border-blue-500/50 rounded-xl text-sm placeholder-slate-600 focus:outline-none transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold text-slate-200">Curate Your Vibe</h2>
                    <p className="text-xs text-slate-400">Select at least one genre you enjoy watching. We use this to curate your starter pack!</p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 max-h-56 overflow-y-auto pr-1">
                    {GENRE_OPTIONS.map((genre) => {
                      const isSelected = formData.genres.includes(genre);
                      return (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => handleToggleGenre(genre)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                            isSelected 
                              ? 'bg-blue-500/15 border-blue-500/40 text-blue-300 shadow-sm shadow-blue-500/5' 
                              : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-400'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                          {genre}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold text-slate-200">Your Streaming Channels</h2>
                    <p className="text-xs text-slate-400">Select the streaming platforms you actively use (optional).</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 max-h-56 overflow-y-auto pr-1">
                    {SERVICE_OPTIONS.map((service) => {
                      const isSelected = formData.services.includes(service);
                      return (
                        <button
                          key={service}
                          type="button"
                          onClick={() => handleToggleService(service)}
                          className={`p-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between ${
                            isSelected 
                              ? 'bg-blue-500/10 border-blue-500/30 text-blue-300' 
                              : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 text-slate-400'
                          }`}
                        >
                          <span>{service}</span>
                          {isSelected ? (
                            <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          ) : (
                            <span className="w-4 h-4 rounded-full border border-slate-700" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {wizardStep === 4 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold text-slate-200">Configure Dashboard</h2>
                    <p className="text-xs text-slate-400">How would you like to initialize your collection board?</p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, starterPack: true }))}
                      className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all ${
                        formData.starterPack
                          ? 'bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/20'
                          : 'bg-slate-900/40 border-slate-850 hover:border-slate-800'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 mt-0.5 shrink-0">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                          Instant Starter Pack
                          {formData.starterPack && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-md font-semibold uppercase tracking-wider">Active</span>}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">Pre-populates your feed with 3 popular shows matching your genre tastes to start tracking immediately.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, starterPack: false }))}
                      className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all ${
                        !formData.starterPack
                          ? 'bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/20'
                          : 'bg-slate-900/40 border-slate-850 hover:border-slate-800'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-slate-800 text-slate-400 mt-0.5 shrink-0">
                        <Tv className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                          Fresh Blank Canvas
                          {!formData.starterPack && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-md font-semibold uppercase tracking-wider">Active</span>}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">Start with a clean tracking board so you can lookup and add exact shows yourself.</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {wizardError && (
                <div className="flex items-start gap-2 text-xs text-rose-400 bg-rose-500/5 border border-rose-500/10 p-3 rounded-xl">
                  <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{wizardError}</span>
                </div>
              )}

              {/* Wizard navigation */}
              <div className="flex items-center justify-between gap-3 pt-2">
                {wizardStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevWizardStep}
                    disabled={isRegistering}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all disabled:opacity-45"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setViewMode('login')}
                    className="px-4 py-2.5 text-slate-400 hover:text-slate-300 font-semibold text-xs flex items-center gap-1 transition-all"
                  >
                    Cancel
                  </button>
                )}

                {wizardStep < 4 ? (
                  <button
                    type="button"
                    onClick={nextWizardStep}
                    className="px-5 py-2.5 bg-slate-200 hover:bg-white text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 transition-all ml-auto"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCompleteOnboarding}
                    disabled={isRegistering}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-blue-500/10 transition-all ml-auto border border-blue-500/25 cursor-pointer"
                  >
                    {isRegistering ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Complete Setup
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* GOOGLE SIMULATION DIALOG */}
          {viewMode === 'google-sim' && (
            <motion.div
              key="google-sim"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-center space-y-3">
                <div className="inline-flex items-center justify-center p-2.5 bg-slate-800 rounded-xl mb-1 text-blue-500">
                  <Chrome className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-sm font-bold text-slate-200">Google Authentication Integration</h3>
                <p className="text-xs text-slate-400">Sign in securely using any Google account or Gmail address.</p>
              </div>

              <form onSubmit={handleGoogleSimSubmit} className="space-y-4">
                {googleStep === 1 ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                      Google Account Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. jennifer@gmail.com"
                        value={googleEmail}
                        onChange={(e) => setGoogleEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-blue-500/40 rounded-xl text-sm focus:outline-none placeholder-slate-700 text-slate-200"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 animate-fade-in">
                    <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                      Confirm Display Name
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Jennifer"
                        value={googleName}
                        onChange={(e) => setGoogleName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-blue-500/40 rounded-xl text-sm focus:outline-none placeholder-slate-700 text-slate-200"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (googleStep === 2) {
                        setGoogleStep(1);
                      } else {
                        setViewMode('login');
                      }
                    }}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800/80 text-slate-400 hover:text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1 transition-all"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition-all ml-auto shadow-lg shadow-blue-500/5 border border-blue-500/25"
                  >
                    {googleStep === 1 ? 'Continue' : 'Sign In Now'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
