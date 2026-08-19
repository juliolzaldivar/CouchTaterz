/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TvShow, UserPreferences, StreamingService, User } from '../types';
import { normalizeShowTitle, getCanonicalShowTitle } from '../utils/titleUtils';
import { 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Sliders, 
  Plus, 
  Loader2, 
  ThumbsUp, 
  Heart, 
  Award, 
  Check, 
  Film, 
  User as UserIcon, 
  UserCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SERVICE_COLORS } from './ShowCard';

interface RecommendationsCarouselProps {
  shows: TvShow[];
  preferences: UserPreferences;
  onSavePreferences: (updatedPrefs: UserPreferences) => void;
  onAddRecommendedShow: (show: TvShow) => void;
  currentUser?: User | null;
  theme?: 'dark' | 'light';
}

export const RecommendationsCarousel: React.FC<RecommendationsCarouselProps> = ({
  shows,
  preferences,
  onSavePreferences,
  onAddRecommendedShow,
  currentUser,
  theme = 'dark',
}) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isEditingTaste, setIsEditingTaste] = useState(false);

  // Taste profile form states
  const [prefGenres, setPrefGenres] = useState(preferences.genres.join(', '));
  const [prefActors, setPrefActors] = useState(preferences.actors.join(', '));
  const [prefDirectors, setPrefDirectors] = useState(preferences.directors.join(', '));

  // Determine if we should open the taste profile on load (first-time access)
  useEffect(() => {
    const key = currentUser?.id 
      ? `coughtater_seen_taste_profile_${currentUser.id}` 
      : `coughtater_seen_taste_profile_generic`;
    const hasSeen = localStorage.getItem(key) === 'true';
    if (!hasSeen) {
      setIsEditingTaste(true);
      localStorage.setItem(key, 'true');
    }
  }, [currentUser?.id]);

  // Sync state with preferences when they change
  useEffect(() => {
    setPrefGenres(preferences.genres.join(', '));
    setPrefActors(preferences.actors.join(', '));
    setPrefDirectors(preferences.directors.join(', '));
  }, [preferences]);

  // State to track if we've already run a recommendation query
  const [hasGenerated, setHasGenerated] = useState(false);

  // Automatically rotate recommendations if we have any
  useEffect(() => {
    if (recommendations.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % recommendations.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [recommendations.length]);

  const generateRecommendations = async (customPrefs?: UserPreferences) => {
    setIsLoading(true);
    setHasGenerated(true);
    try {
      const activePrefs = customPrefs || preferences;
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shows,
          preferences: activePrefs,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const existingTitles = new Set((shows || []).map(s => normalizeShowTitle(s.title)));
        const filtered = Array.isArray(data) ? data.filter((rec: any) => !existingTitles.has(normalizeShowTitle(rec.title))) : [];
        setRecommendations(filtered);
        setActiveIndex(0);
      } else {
        console.error('Failed to retrieve AI recommendations');
      }
    } catch (err) {
      console.error('Error generating AI suggestions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTasteProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserPreferences = {
      genres: prefGenres.split(',').map((g) => g.trim()).filter((g) => g !== ''),
      actors: prefActors.split(',').map((a) => a.trim()).filter((a) => a !== ''),
      directors: prefDirectors.split(',').map((d) => d.trim()).filter((d) => d !== ''),
    };
    onSavePreferences(updated);
    setIsEditingTaste(false);
    // Regenerate recommendations with new profile
    generateRecommendations(updated);
  };

  const handleAddShowToWatchlist = (rec: any) => {
    const newShow: TvShow = {
      id: `rec-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
      title: getCanonicalShowTitle(rec.title),
      streamingService: (rec.streamingService || 'Other') as StreamingService,
      genres: rec.genres || ['Drama'],
      status: 'Watching',
      latestWatched: { season: 1, episode: 0, title: 'Not Started' },
      nextEpisode: rec.nextEpisode || null,
      rottenTomatoesScore: rec.rottenTomatoesScore || 85,
      userScore: null,
      userNotes: '',
      overview: rec.overview || '',
      directors: rec.directors || [],
      actors: rec.actors || [],
      bannerImage: rec.bannerImage || 'https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
      bannerPosition: rec.bannerPosition || 'center 25%',
      concluded: rec.concluded ?? false,
      createdAt: new Date().toISOString(),
    };

    onAddRecommendedShow(newShow);
    // Remove the added show from the current carousel suggestions
    setRecommendations((prev) => prev.filter((r) => r.title !== rec.title));
    setActiveIndex(0);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + recommendations.length) % recommendations.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % recommendations.length);
  };

  // Helper to determine the aesthetic colors for recommendations
  const currentRec = recommendations[activeIndex];
  const colors = currentRec
    ? SERVICE_COLORS[currentRec.streamingService as StreamingService] || SERVICE_COLORS['Other']
    : SERVICE_COLORS['Other'];

  return (
    <div className="space-y-3">
      {/* Title Header with Profile Config toggle */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
            AI-POWERED RECOMMENDATIONS
          </h3>
        </div>
        
        <button
          onClick={() => setIsEditingTaste(!isEditingTaste)}
          className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold border rounded-lg transition-all ${
            isEditingTaste
              ? 'bg-blue-600 text-white border-transparent shadow'
              : 'bg-[#1A1D23] border-white/5 text-slate-400 hover:text-white hover:bg-[#262A33]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{isEditingTaste ? 'Close Taste Profile' : 'Taste Preferences'}</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* Profile Editor View */}
        {isEditingTaste ? (
          <motion.div
            key="taste-profile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`rounded-3xl p-6 overflow-hidden space-y-4 shadow-xl border ${
              theme === 'dark' ? 'bg-[#16181D] border-white/5' : 'bg-white border-slate-200 text-slate-900 shadow-md'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-xl ${
                theme === 'dark' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/10' : 'bg-blue-50 text-blue-600 border border-blue-200'
              }`}>
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <h4 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Your Entertainment Taste Profile</h4>
                <p className={`text-[11px] font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>Guide Spudz with your specific entertainment criteria</p>
              </div>
            </div>

            <form onSubmit={handleSaveTasteProfile} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Genres */}
                <div className="space-y-1.5">
                  <label className={`text-[10px] font-black uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>
                    Favorite Genres
                  </label>
                  <input
                    type="text"
                    value={prefGenres}
                    onChange={(e) => setPrefGenres(e.target.value)}
                    placeholder="e.g. Sci-Fi, Mystery, Comedy"
                    className={`w-full border rounded-xl p-2.5 focus:outline-none focus:border-blue-500 font-semibold ${
                      theme === 'dark' ? 'bg-[#1F2128] border-white/10 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                  <span className={`text-[9px] block leading-tight ${theme === 'dark' ? 'text-slate-600' : 'text-slate-500'}`}>Comma-separated genres</span>
                </div>

                {/* Actors */}
                <div className="space-y-1.5">
                  <label className={`text-[10px] font-black uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>
                    Favorite Actors
                  </label>
                  <input
                    type="text"
                    value={prefActors}
                    onChange={(e) => setPrefActors(e.target.value)}
                    placeholder="e.g. Jeremy Allen White, Pedro Pascal"
                    className={`w-full border rounded-xl p-2.5 focus:outline-none focus:border-blue-500 font-semibold ${
                      theme === 'dark' ? 'bg-[#1F2128] border-white/10 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                  <span className={`text-[9px] block leading-tight ${theme === 'dark' ? 'text-slate-600' : 'text-slate-500'}`}>Actors to search for</span>
                </div>

                {/* Directors */}
                <div className="space-y-1.5">
                  <label className={`text-[10px] font-black uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>
                    Favorite Directors / Writers
                  </label>
                  <input
                    type="text"
                    value={prefDirectors}
                    onChange={(e) => setPrefDirectors(e.target.value)}
                    placeholder="e.g. Christopher Nolan, Sam Esmail"
                    className={`w-full border rounded-xl p-2.5 focus:outline-none focus:border-blue-500 font-semibold ${
                      theme === 'dark' ? 'bg-[#1F2128] border-white/10 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                  <span className={`text-[9px] block leading-tight ${theme === 'dark' ? 'text-slate-600' : 'text-slate-500'}`}>Showrunners or directors</span>
                </div>
              </div>

              <div className={`flex justify-end gap-2 pt-2 border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'}`}>
                <button
                  type="button"
                  onClick={() => setIsEditingTaste(false)}
                  className={`px-4 py-2 rounded-xl font-bold transition ${
                    theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition shadow"
                >
                  Save Profile & Suggest Shows
                </button>
              </div>
            </form>
          </motion.div>
        ) : isLoading ? (
          /* Loading State */
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`rounded-3xl p-12 text-center min-h-[220px] flex flex-col justify-center items-center space-y-4 ${
              theme === 'dark' ? 'bg-[#1A1D23] border border-white/5' : 'bg-white border border-slate-200 shadow-sm'
            }`}
          >
            <div className="p-3 bg-blue-500/10 rounded-full text-blue-500 border border-blue-500/20 animate-spin">
              <Loader2 className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h4 className={`text-sm font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>Analyzing Your Watchlist & Tastes...</h4>
              <p className={`text-xs max-w-sm mx-auto ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>
                Gemini is checking your favorite genres, actor profiles, review notes, and scores to assemble a bespoke recommendations deck.
              </p>
            </div>
          </motion.div>
        ) : !hasGenerated || recommendations.length === 0 ? (
          /* Empty / Ask Scout Call to Action */
          <motion.div
            key="ask-scout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`relative overflow-hidden rounded-3xl p-8 text-center min-h-[220px] flex flex-col justify-center items-center space-y-4 shadow-xl ${
              theme === 'dark' ? 'bg-[#1A1D23] border border-white/5' : 'bg-white border border-slate-200/90 shadow-sm'
            }`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_60%)] pointer-events-none" />
            <div className={`p-3.5 rounded-full border text-blue-500 shadow-md ${
              theme === 'dark' ? 'bg-[#0F1115]/80 border-white/5' : 'bg-blue-50 border-blue-200'
            }`}>
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="max-w-md space-y-1 z-10">
              <h4 className={`text-sm font-bold uppercase tracking-wide ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>Ask Spudz Suggestions</h4>
              <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>
                Connect your unique watchlists, ratings, custom notes, and favorite director preferences with Gemini Flash to generate 5 real, customized television suggestions.
              </p>
            </div>
            <button
              onClick={() => generateRecommendations()}
              className="z-10 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center gap-2 transition hover:scale-[1.02] shadow-lg border border-blue-500/20 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Taste recommendations</span>
            </button>
          </motion.div>
        ) : (
          /* Carousel Show suggestions display */
          <motion.div
            key="carousel-deck"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative overflow-hidden rounded-3xl bg-[#1A1D23] border border-white/5 h-[340px] md:h-[280px] group/carousel"
          >
            {/* Background Banner Image */}
            <div className="absolute inset-0 w-full h-full">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentRec.title}
                  src={currentRec.bannerImage}
                  alt={currentRec.title}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 0.35, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full object-cover filter brightness-[0.45]"
                  style={{ objectPosition: currentRec.bannerPosition || 'center 25%' }}
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F1115] via-[#0F1115]/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0F1115]/95 via-[#0F1115]/75 to-transparent" />
            </div>

            {/* Slide Navigation Buttons */}
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-[#0F1115]/70 hover:bg-[#0F1115] border border-white/5 text-slate-400 hover:text-white transition opacity-0 group-hover/carousel:opacity-100"
              aria-label="Previous recommendation"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-[#0F1115]/70 hover:bg-[#0F1115] border border-white/5 text-slate-400 hover:text-white transition opacity-0 group-hover/carousel:opacity-100"
              aria-label="Next recommendation"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Slide Content overlay */}
            <div className="absolute inset-0 z-10 p-6 md:p-8 flex flex-col justify-between">
              {/* Top Row: Service details & Match percentage */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-lg border ${colors.bg} ${colors.text} ${colors.border}`}>
                    {currentRec.streamingService}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-blue-950/80 text-blue-300 border border-blue-800/30">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    {currentRec.matchingScore}% MATCH
                  </span>
                </div>

                {/* Score indicators */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-lg bg-slate-900/80 border border-white/5 text-rose-400">
                    <Award className="w-3.5 h-3.5" />
                    <span>RT: {currentRec.rottenTomatoesScore != null ? `${currentRec.rottenTomatoesScore}%` : 'TBD'}</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1 text-[9px] text-slate-500">
                    <span>{activeIndex + 1} of {recommendations.length}</span>
                  </div>
                </div>
              </div>

              {/* Bottom text: Title, customized reason, cast & Add button */}
              <div className="space-y-3.5 max-w-3xl">
                <div className="space-y-1">
                  <h4 className="text-xl md:text-2xl font-black text-white tracking-tight drop-shadow-md">
                    {currentRec.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {currentRec.genres.map((g: string, gIdx: number) => (
                      <span key={`${g}-${gIdx}`} className="px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold text-slate-300 bg-slate-900/50 rounded border border-white/5">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Custom AI Reasoning */}
                <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-500/20">
                  <p className="text-xs md:text-xs text-blue-200 leading-relaxed font-medium">
                    <span className="font-extrabold text-blue-400 uppercase tracking-widest text-[9px] block mb-0.5">Ask Spudz Reason:</span>
                    &ldquo;{currentRec.reason}&rdquo;
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  {/* Cast / Crew summary */}
                  <div className="text-[10px] text-slate-400 line-clamp-1">
                    <span className="font-bold uppercase text-slate-500">Starring:</span> {currentRec.actors?.slice(0, 3).join(', ')}
                  </div>

                  {/* Add to Watchlist Action */}
                  <button
                    onClick={() => handleAddShowToWatchlist(currentRec)}
                    className="self-end sm:self-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg border border-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Track This Show</span>
                  </button>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
