/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
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

// Aesthetic streaming service pill coloring matching the billboard showcase style
const getServiceBadgeStyle = (service: string) => {
  switch (service?.toUpperCase()) {
    case 'HBO':
    case 'MAX':
      return 'bg-[#1e153b] text-[#c7d2fe] border-[#4c3f91]/40';
    case 'NETFLIX':
      return 'bg-[#2a0d13] text-[#fca5a5] border-[#991b1b]/40';
    case 'DISNEY+':
    case 'DISNEY':
      return 'bg-[#0c1f44] text-[#93c5fd] border-[#1e40af]/40';
    case 'APPLE TV':
    case 'APPLE TV+':
      return 'bg-[#1c1c22] text-[#f1f5f9] border-[#475569]/40';
    case 'PRIME VIDEO':
    case 'AMAZON':
      return 'bg-[#0c2438] text-[#7dd3fc] border-[#0369a1]/40';
    case 'HULU':
      return 'bg-[#0d2618] text-[#86efac] border-[#166534]/40';
    case 'PEACOCK':
      return 'bg-[#221e0a] text-[#fde047] border-[#854d0e]/40';
    case 'PARAMOUNT+':
    case 'PARAMOUNT':
      return 'bg-[#0b1d3a] text-[#93c5fd] border-[#1d4ed8]/40';
    default:
      return 'bg-[#1e153b] text-[#c7d2fe] border-[#4c3f91]/40';
  }
};

const DEFAULT_RECOMMENDATIONS = [
  {
    title: "The Bear",
    streamingService: "Hulu",
    genres: ["Drama", "Comedy"],
    rottenTomatoesScore: 96,
    overview: "A young fine-dining chef comes home to Chicago to run his family Italian beef sandwich shop after a heartbreaking death in his family.",
    matchingScore: 97,
    reason: "A high-octane, emotionally raw culinary character study packed with blistering tension, kitchen obsession, and award-winning performances.",
    bannerImage: "https://image.tmdb.org/t/p/w1280/aJtG4txtmiRHwAAqENQHZvBs6kY.jpg",
    bannerPosition: "center 25%",
    directors: ["Christopher Storer", "Joanna Calo"],
    actors: ["Jeremy Allen White", "Ebon Moss-Bachrach", "Ayo Edebiri"],
    concluded: false,
    totalSeasons: 3,
    episodesPerSeason: [8, 10, 10],
    nextEpisode: null
  },
  {
    title: "Severance",
    streamingService: "Apple TV",
    genres: ["Sci-Fi", "Thriller", "Mystery"],
    rottenTomatoesScore: 97,
    overview: "Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives.",
    matchingScore: 98,
    reason: "A masterclass in dystopian psychological suspense with immaculate visual framing, mind-bending corporate satire, and relentless cliffhangers.",
    bannerImage: "https://image.tmdb.org/t/p/w1280/ixgFmf1X59PUZam2qbAfskx2gQr.jpg",
    bannerPosition: "center 25%",
    directors: ["Ben Stiller", "Aoife McArdle"],
    actors: ["Adam Scott", "Zach Cherry", "Britt Lower"],
    concluded: false,
    totalSeasons: 2,
    episodesPerSeason: [9, 10],
    nextEpisode: null
  },
  {
    title: "Silo",
    streamingService: "Apple TV",
    genres: ["Sci-Fi", "Drama", "Mystery"],
    rottenTomatoesScore: 94,
    overview: "In a ruined and toxic future, thousands live in a giant silo deep underground.",
    matchingScore: 93,
    reason: "Gripping world-building and claustrophobic subterranean intrigue anchored by Rebecca Ferguson's fierce performance.",
    bannerImage: "https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    bannerPosition: "center 25%",
    directors: ["Morten Tyldum"],
    actors: ["Rebecca Ferguson", "Common", "Tim Robbins"],
    concluded: false,
    totalSeasons: 2,
    episodesPerSeason: [10, 10],
    nextEpisode: null
  },
  {
    title: "Hacks",
    streamingService: "HBO",
    genres: ["Comedy", "Drama"],
    rottenTomatoesScore: 98,
    overview: "Explores a dark mentorship that forms between Deborah Vance, a legendary Las Vegas comedian, and an entitled comedy writer.",
    matchingScore: 95,
    reason: "Razor-sharp wit, generational clash comedy, and top-tier acting that balances caustic laughs with genuine emotional stakes.",
    bannerImage: "https://image.tmdb.org/t/p/w1280/bbAR4qKxjnjyKAt4YMrL725Mtfw.jpg",
    bannerPosition: "center 20%",
    directors: ["Lucia Aniello"],
    actors: ["Jean Smart", "Hannah Einbinder", "Carl Clemons-Hopkins"],
    concluded: false,
    totalSeasons: 3,
    episodesPerSeason: [10, 8, 9],
    nextEpisode: null
  },
  {
    title: "Tokyo Vice",
    streamingService: "HBO",
    genres: ["Drama", "Thriller", "Mystery"],
    rottenTomatoesScore: 92,
    overview: "A Western journalist working for a publication in Tokyo takes on one of the city's most powerful crime bosses.",
    matchingScore: 94,
    reason: "Following your 10/10 praise for Shōgun's cultural depth and nuanced power struggles, Tokyo Vice delivers that same staggering cinematic tension and moral ambiguity set against the neon underbelly of Tokyo.",
    bannerImage: "https://image.tmdb.org/t/p/w1280/fGhZTONMDkwSaE5V4FDxf26uenl.jpg",
    bannerPosition: "center 20%",
    directors: ["Michael Mann", "Josef Kubota Wladyka", "Alan Poul"],
    actors: ["Ansel Elgort", "Ken Watanabe", "Rachel Keller"],
    concluded: true,
    totalSeasons: 2,
    episodesPerSeason: [8, 10],
    nextEpisode: null
  }
];

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
  const [recommendations, setRecommendations] = useState<any[]>(() => {
    const existingTitles = new Set((shows || []).map(s => normalizeShowTitle(s.title)));
    const filtered = DEFAULT_RECOMMENDATIONS.filter(r => !existingTitles.has(normalizeShowTitle(r.title)));
    return filtered.length > 0 ? filtered : DEFAULT_RECOMMENDATIONS;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() => {
    // If Tokyo Vice is in the initial recommendations deck, default to it (e.g. index 4, "5 of 5")
    const existingTitles = new Set((shows || []).map(s => normalizeShowTitle(s.title)));
    const filtered = DEFAULT_RECOMMENDATIONS.filter(r => !existingTitles.has(normalizeShowTitle(r.title)));
    const deck = filtered.length > 0 ? filtered : DEFAULT_RECOMMENDATIONS;
    const tvIdx = deck.findIndex(r => r.title.toLowerCase().includes('tokyo vice'));
    return tvIdx >= 0 ? tvIdx : 0;
  });
  const [isEditingTaste, setIsEditingTaste] = useState(false);

  // Taste profile form states
  const [prefGenres, setPrefGenres] = useState(preferences.genres.join(', '));
  const [prefActors, setPrefActors] = useState(preferences.actors.join(', '));
  const [prefDirectors, setPrefDirectors] = useState(preferences.directors.join(', '));

  // State to track if we've already run a recommendation query
  const [hasGenerated, setHasGenerated] = useState(false);
  const inFlightRef = useRef(false);

  // Sync state with preferences when they change
  useEffect(() => {
    setPrefGenres(preferences.genres.join(', '));
    setPrefActors(preferences.actors.join(', '));
    setPrefDirectors(preferences.directors.join(', '));
  }, [preferences]);

  // Check if explicit custom taste preferences exist
  const hasExplicitPrefs = Boolean(
    (preferences?.genres && preferences.genres.length > 0) ||
    (preferences?.actors && preferences.actors.length > 0) ||
    (preferences?.directors && preferences.directors.length > 0)
  );

  // Automatically rotate recommendations if we have any
  useEffect(() => {
    if (recommendations.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % recommendations.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [recommendations.length]);

  // Automatically generate default recommendations examining user's library and reviews
  useEffect(() => {
    if (!hasGenerated && !inFlightRef.current && recommendations.length === 0) {
      generateRecommendations();
    }
  }, [hasGenerated, recommendations.length]);

  const generateRecommendations = async (customPrefs?: UserPreferences) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
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
          userEmail: currentUser?.email,
          userId: currentUser?.id
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const existingTitles = new Set((shows || []).map(s => normalizeShowTitle(s.title)));
        const filtered = Array.isArray(data) ? data.filter((rec: any) => !existingTitles.has(normalizeShowTitle(rec.title))) : [];
        setRecommendations(filtered.length > 0 ? filtered : (Array.isArray(data) ? data : []));
        setActiveIndex(0);
      } else {
        console.warn('AI recommendations service note: Using fallback curated suggestions.');
      }
    } catch (err) {
      console.warn('AI recommendations network note:', err);
    } finally {
      setIsLoading(false);
      inFlightRef.current = false;
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
  const currentRec = recommendations[activeIndex] || DEFAULT_RECOMMENDATIONS[0];
  const colors = currentRec
    ? SERVICE_COLORS[currentRec.streamingService as StreamingService] || SERVICE_COLORS['Other']
    : SERVICE_COLORS['Other'];
  const cleanReason = currentRec?.reason
    ? currentRec.reason.replace(/^["“\s]+|["”\s]+$/g, '')
    : "High-intensity storytelling matching your top-rated shows and nuanced character preferences.";

  return (
    <div className="space-y-3">
      {/* Title Header with Profile Config toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
              AI-POWERED RECOMMENDATIONS
            </h3>
          </div>

          {/* Taste Source Indicator */}
          {hasExplicitPrefs ? (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Custom Taste Profile
            </span>
          ) : shows && shows.length > 0 ? (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Auto-tuned from your {shows.length} library shows & reviews
            </span>
          ) : null}
        </div>
        
        <button
          onClick={() => setIsEditingTaste(!isEditingTaste)}
          className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold border rounded-lg transition-all cursor-pointer ${
            isEditingTaste
              ? 'bg-blue-600 text-white border-transparent shadow'
              : theme === 'dark'
                ? 'bg-[#1A1D23] border-white/5 text-slate-400 hover:text-white hover:bg-[#262A33]'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-sm'
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
        ) : !hasGenerated && recommendations.length === 0 ? (
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
              <h4 className={`text-sm font-bold uppercase tracking-wide ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>Spudz AI Suggestions</h4>
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
          /* Carousel Show suggestions display matching billboard showcase */
          <motion.div
            key="carousel-deck"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative overflow-hidden rounded-3xl bg-[#090C15] border border-slate-800/80 shadow-2xl p-6 sm:p-8 lg:p-10 group/carousel min-h-[350px] flex flex-col justify-between"
          >
            {/* Background Banner Image - Right aligned with smooth gradient feathering */}
            <div className="absolute top-0 right-0 bottom-0 w-full sm:w-[58%] lg:w-[50%] pointer-events-none overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentRec.title}
                  src={currentRec.bannerImage}
                  alt={currentRec.title}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 0.85, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full object-cover object-center"
                  style={{ objectPosition: currentRec.bannerPosition || 'center 20%' }}
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>
              {/* High-fidelity gradient masks: blends seamlessly into the dark background on the left and edges */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#090C15] via-[#090C15]/75 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090C15] via-transparent to-[#090C15]/30" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#090C15]/30 via-transparent to-[#090C15]/40" />
            </div>

            {/* Slide Navigation Buttons */}
            {recommendations.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white/75 hover:text-white border border-white/10 opacity-0 group-hover/carousel:opacity-100 transition-all cursor-pointer backdrop-blur-xs shadow-lg"
                  aria-label="Previous recommendation"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white/75 hover:text-white border border-white/10 opacity-0 group-hover/carousel:opacity-100 transition-all cursor-pointer backdrop-blur-xs shadow-lg"
                  aria-label="Next recommendation"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Slide Content */}
            <div className="relative z-10 flex flex-col justify-between space-y-4">
              {/* Top Row: Service details, Match percentage, RT score & Index */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {/* Streaming Service Badge */}
                  <span className={`px-3 py-1 text-xs font-black uppercase tracking-wider rounded-lg border shadow-xs ${getServiceBadgeStyle(currentRec.streamingService)}`}>
                    {currentRec.streamingService}
                  </span>

                  {/* Match Percentage Badge */}
                  <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-lg bg-[#0c1e3d] text-[#38bdf8] border border-[#1d4ed8]/40 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
                    <span>{currentRec.matchingScore}% MATCH</span>
                  </span>
                </div>

                {/* Rotten Tomatoes Badge & Slide Indicator */}
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-lg bg-[#2d0f1b] border border-[#9f1239]/40 text-[#fb7185] shadow-xs">
                    <Award className="w-3.5 h-3.5 text-[#fb7185]" />
                    <span>RT: {currentRec.rottenTomatoesScore != null ? `${currentRec.rottenTomatoesScore}%` : 'TBD'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-300 font-mono select-none transition-colors cursor-pointer"
                    title="Click to next recommendation"
                  >
                    {activeIndex + 1} of {recommendations.length}
                  </button>
                </div>
              </div>

              {/* Middle Section: Title, Genres & SPUDZ SAYS Callout */}
              <div className="max-w-2xl lg:max-w-3xl">
                {/* Title */}
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-3 mb-2.5 drop-shadow-sm">
                  {currentRec.title}
                </h2>

                {/* Genres */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {currentRec.genres?.map((g: string, gIdx: number) => (
                    <span
                      key={`${g}-${gIdx}`}
                      className="px-3 py-1 text-[11px] font-black uppercase tracking-wider bg-[#0c1220]/90 text-slate-300 rounded-lg border border-slate-700/60 shadow-xs"
                    >
                      {g}
                    </span>
                  ))}
                </div>

                {/* SPUDZ SAYS Callout */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#08152e]/60 border border-[#1e3a8a]/40 my-3.5 max-w-2xl shadow-xs">
                  <span className="font-black text-amber-400 uppercase tracking-widest text-[11px] block mb-1">
                    SPUDZ SAYS:
                  </span>
                  <p className="text-sm sm:text-[15px] text-slate-200 leading-relaxed font-normal">
                    &ldquo;{cleanReason}&rdquo;
                  </p>
                </div>

                {/* Track Show Action Button - Placed under Spudz says and above Starring line */}
                <div className="pt-0.5 pb-2">
                  <button
                    type="button"
                    onClick={() => handleAddShowToWatchlist(currentRec)}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-lg shadow-blue-600/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shrink-0 w-fit"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Track This Show</span>
                  </button>
                </div>
              </div>

              {/* Bottom Row: Starring Cast */}
              <div className="mt-1 pt-1">
                <div className="text-xs text-slate-300 font-medium">
                  <span className="font-black uppercase tracking-wider text-slate-500 mr-1.5">
                    STARRING:
                  </span>
                  <span>
                    {currentRec.actors && currentRec.actors.length > 0
                      ? currentRec.actors.slice(0, 3).join(', ')
                      : 'Ensemble Cast'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
