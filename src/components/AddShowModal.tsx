/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { TvShow, StreamingService, ShowStatus } from '../types';
import { Search, Loader2, X, Film, AlertCircle, Plus, Star, Tv, ChevronDown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AddShowModalProps {
  onClose: () => void;
  onAddShow: (newShow: TvShow) => void;
  onboardingStep?: number | null;
}

const STREAMING_SERVICES: StreamingService[] = [
  'HBO', 'Disney+', 'Prime Video', 'Netflix', 'Hulu', 'Paramount+', 'Apple TV', 'Peacock', 'AMC+', 'Other'
];

export const AddShowModal: React.FC<AddShowModalProps> = ({ onClose, onAddShow, onboardingStep = null }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enrichSteps, setEnrichSteps] = useState<string>('');
  
  // Enriched show preview
  const [previewShow, setPreviewShow] = useState<Partial<TvShow> | null>(null);
  const [bannerImage, setBannerImage] = useState('');
  const [bannerPosition, setBannerPosition] = useState('center 25%');
  const [searchResults, setSearchResults] = useState<Partial<TvShow>[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // Custom user choices on adding
  const [status, setStatus] = useState<ShowStatus>('Watching');
  const [userScore, setUserScore] = useState<number | null>(null);
  const [userNotes, setUserNotes] = useState('');

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (el) {
      const canScrollDown = el.scrollHeight > el.clientHeight && (el.scrollTop + el.clientHeight < el.scrollHeight - 16);
      setShowScrollIndicator(canScrollDown);
    }
  };

  useEffect(() => {
    if (previewShow) {
      const timer = setTimeout(() => {
        checkScroll();
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setShowScrollIndicator(false);
    }
  }, [previewShow, selectedIndex]);

  useEffect(() => {
    if (!previewShow && !isLoading) {
      const timer = setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          searchInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [previewShow, isLoading]);

  const selectShowAtIndex = (index: number) => {
    if (index < 0 || index >= searchResults.length) return;
    setSelectedIndex(index);
    const selectedShow = searchResults[index];
    setPreviewShow(selectedShow);
    setBannerImage(selectedShow.bannerImage || 'https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypROD7P.jpg');
    setBannerPosition(selectedShow.bannerPosition || 'center 25%');
  };

  const handleBack = () => {
    setPreviewShow(null);
    setSearchResults([]);
    setSelectedIndex(0);
  };

  const runSteps = async () => {
    const steps = [
      "Searching Couchtaterz board libraries first...",
      "Contacting TMDB global database...",
      "Extracting description and categories...",
      "Fetching show images and air dates...",
      "Assembling visual cards..."
    ];
    for (const step of steps) {
      setEnrichSteps(step);
      await new Promise(resolve => setTimeout(resolve, 60));
    }
  };

  const handleSearchAndEnrich = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setPreviewShow(null);
    setSearchResults([]);
    setSelectedIndex(0);

    // Run parallel steps loader
    const stepsPromise = runSteps();

    try {
      const response = await fetch('/api/enrich-show', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: query }),
      });

      if (!response.ok) {
        throw new Error("Failed to scan show. Please try another search.");
      }

      const showDetailsList = await response.json() as Partial<TvShow>[];
      await stepsPromise; // wait for visual steps to finish

      if (showDetailsList && showDetailsList.length > 0) {
        setSearchResults(showDetailsList);
        setSelectedIndex(0);
        const firstShow = showDetailsList[0];
        setPreviewShow(firstShow);
        setBannerImage(firstShow.bannerImage || 'https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypROD7P.jpg');
        setBannerPosition(firstShow.bannerPosition || 'center 25%');
      } else {
        throw new Error("No show results found. Please try another search.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while searching.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAdd = () => {
    if (!previewShow) return;

    const fullShow: TvShow = {
      id: `show-${Date.now()}`,
      title: previewShow.title || query,
      streamingService: (previewShow.streamingService as StreamingService) || 'Other',
      genres: previewShow.genres || ['Drama'],
      status: status,
      latestWatched: {
        season: 1,
        episode: 1,
        title: "Episode 1"
      },
      nextEpisode: previewShow.nextEpisode || null,
      rottenTomatoesScore: previewShow.rottenTomatoesScore || 85,
      userScore: userScore,
      userNotes: userNotes,
      overview: previewShow.overview || 'No description available.',
      directors: previewShow.directors || [],
      actors: previewShow.actors || [],
      bannerImage: bannerImage.trim() || previewShow.bannerImage || 'https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
      bannerPosition: bannerPosition,
      concluded: previewShow.concluded !== undefined ? previewShow.concluded : false,
      totalSeasons: previewShow.totalSeasons || 1,
      episodesPerSeason: previewShow.episodesPerSeason || [10],
      createdAt: new Date().toISOString()
    };

    onAddShow(fullShow);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-[#1A1D23] border border-white/5 shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#262A33] rounded-xl text-slate-200 border border-white/5">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Add TV Show to Follow</h3>
              <p className="text-xs text-slate-500">Scan metadata and schedules automatically from TMDB</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-[#262A33] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div 
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin scrollbar-thumb-white/10"
        >
          {/* Initial Search Form */}
          {!previewShow && !isLoading && (
            <form onSubmit={handleSearchAndEnrich} className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Show Title</label>
                  {onboardingStep === 5 && (
                    <motion.span 
                      initial={{ opacity: 0, x: 5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-[10px] text-purple-400 font-extrabold flex items-center gap-1 animate-pulse"
                    >
                      <Sparkles className="w-3 h-3 text-purple-400" /> Type "The Simpsons"
                    </motion.span>
                  )}
                </div>
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={onboardingStep === 5 ? "" : "e.g., Shogun, Succession, Shingeki no Kyojin..."}
                    className={`w-full bg-[#0F1115] text-slate-100 px-4 py-3.5 rounded-2xl border transition-all duration-300 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 ${
                      onboardingStep === 5
                        ? 'border-purple-500 ring-4 ring-purple-500/30 shadow-lg shadow-purple-950/40'
                        : 'border-white/10'
                    }`}
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!query.trim()}
                    className="absolute right-2 top-2 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <Search className="w-3.5 h-3.5" />
                    TMDB Search
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3.5 rounded-2xl bg-rose-950/20 text-rose-300 border border-rose-900/30 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <div className="rounded-2xl bg-[#0F1115]/50 border border-white/5 p-4 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Why search TMDB?</h4>
                <ul className="text-xs text-slate-500 space-y-1.5 list-disc pl-4 leading-relaxed">
                  <li>Detects Rotten Tomatoes/rating scores automatically.</li>
                  <li>Determines where to stream (HBO, Netflix, etc.).</li>
                  <li>Retrieves upcoming episode titles, seasons, and scheduled dates.</li>
                  <li>Injects the cast, directors, overview synopsis, and gorgeous banner imagery.</li>
                </ul>
              </div>
            </form>
          )}

          {/* TMDB Gathering Data Loader */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
              <Loader2 className="w-10 h-10 text-slate-400 animate-spin" />
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-slate-200">Scouting Show Details</h4>
                <p className="text-xs text-slate-500 italic max-w-xs">{enrichSteps || "Checking global television registries..."}</p>
              </div>
            </div>
          )}

          {/* Enriched Show Preview & Customization Form */}
          {previewShow && !isLoading && (
            <div className="space-y-6">
              
              {/* Multi-match scrolling/selection */}
              {searchResults.length > 1 && (
                <div className="p-4 bg-blue-500/5 border border-blue-500/15 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Tv className="w-3.5 h-3.5 text-blue-400" />
                      Not the correct show? Try other matches:
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold bg-white/5 px-2.5 py-0.5 rounded-full">
                      {selectedIndex + 1} of {searchResults.length}
                    </span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {searchResults.map((show, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => selectShowAtIndex(idx)}
                        className={`shrink-0 px-3 py-1.5 text-xs rounded-xl border transition-all ${
                          selectedIndex === idx
                            ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold shadow-sm shadow-blue-500/10'
                            : 'bg-[#0F1115] border-white/5 text-slate-400 hover:bg-[#262A33] hover:text-white'
                        }`}
                      >
                        {show.title}
                      </button>
                    ))}
                  </div>

                  {/* Fast cycling action row */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <span className="text-[10px] text-slate-500">
                      Use buttons or click a title above to switch.
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => selectShowAtIndex((selectedIndex - 1 + searchResults.length) % searchResults.length)}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#262A33] border border-white/5 hover:bg-[#343A46] text-slate-300 transition"
                      >
                        ← Prev Match
                      </button>
                      <button
                        type="button"
                        onClick={() => selectShowAtIndex((selectedIndex + 1) % searchResults.length)}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-600/30 border border-blue-500/30 hover:bg-blue-600/50 text-blue-200 transition"
                      >
                        Next Match →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Show Metadata Summary Card */}
              <div className="relative rounded-2xl overflow-hidden bg-[#0F1115] border border-white/5 p-4 flex gap-4">
                {bannerImage && (
                  <img 
                    src={bannerImage} 
                    alt={previewShow.title} 
                    className="w-20 h-28 rounded-xl object-cover border border-white/5 bg-[#262A33]"
                    style={{ objectPosition: bannerPosition }}
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="flex-1 space-y-2">
                  <div>
                    <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider rounded bg-[#262A33] text-slate-300 border border-white/5 uppercase">
                      {previewShow.streamingService || 'Other'}
                    </span>
                    <h4 className="text-base font-bold text-white mt-1 leading-tight">{previewShow.title}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{previewShow.genres?.join(', ')}</p>
                  </div>
                  
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {previewShow.overview}
                  </p>

                  <div className="flex items-center gap-3 text-[10px] text-slate-500 font-semibold">
                    <span>RT Score: <strong className="text-rose-400">{previewShow.rottenTomatoesScore != null ? `${previewShow.rottenTomatoesScore}%` : 'TBD'}</strong></span>
                    <span>•</span>
                    <span>Status: <strong>{previewShow.concluded ? 'Concluded' : 'Active / Running'}</strong></span>
                  </div>
                </div>
              </div>

              {/* User Custom Options Form */}
              <div className="space-y-4 pt-2 border-t border-white/5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Track Details</h4>
                                {/* Watch Status */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-500 font-medium">Your initial status</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Watching', 'Backlog', 'Completed'] as ShowStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatus(st)}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1 ${
                          status === st 
                            ? 'bg-blue-600 border-blue-500 text-white' 
                            : 'bg-[#0F1115] border-white/5 text-slate-400 hover:bg-[#262A33] hover:text-white'
                        } ${
                          onboardingStep === 5 && st === 'Watching'
                            ? 'ring-2 ring-purple-500 shadow-lg relative z-10'
                            : ''
                        }`}
                      >
                        {onboardingStep === 5 && st === 'Watching' && (
                          <motion.span
                            animate={{ x: [-2, 2, -2] }}
                            transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
                            className="text-purple-400 font-black text-xs inline-block"
                          >
                            ➜
                          </motion.span>
                        )}
                        <span>{st === 'Watching' ? 'Watching' : st === 'Backlog' ? 'Up Next' : st === 'Completed' ? 'Watched' : st}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Cover Image URL */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs text-slate-500 font-medium">Custom Cover Image URL</label>
                  <input
                    type="text"
                    value={bannerImage}
                    onChange={(e) => setBannerImage(e.target.value)}
                    placeholder="Enter custom cover image URL (e.g., Unsplash, Imgur)..."
                    className="w-full bg-[#0F1115] text-slate-100 p-3 rounded-2xl border border-white/10 focus:outline-none focus:border-blue-500 text-xs"
                  />
                </div>

                {/* Banner position alignment */}
                <div className="space-y-1.5 pt-2 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-center text-xs">
                    <label className="text-slate-400 font-bold flex items-center gap-1.5">
                      <span className="p-1 bg-purple-500/10 rounded-lg text-purple-400 shrink-0">
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      </span>
                      Face Focus Vertical Position
                    </label>
                    <span className="text-blue-400 font-extrabold text-[11px]">
                      {(() => {
                        const match = bannerPosition.match(/center\s+(\d+)%/);
                        return match ? `${match[1]}%` : '25%';
                      })()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={(() => {
                        const match = bannerPosition.match(/center\s+(\d+)%/);
                        return match ? parseInt(match[1]) : 25;
                      })()}
                      onChange={(e) => {
                        setBannerPosition(`center ${e.target.value}%`);
                      }}
                      className="w-full accent-blue-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="flex gap-1 justify-between text-[9px] text-slate-500 font-semibold uppercase tracking-wider">
                    <span>Top (0% - fits faces)</span>
                    <span>Center (50%)</span>
                    <span>Bottom (100%)</span>
                  </div>
                </div>

                {/* Score slider */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-xs">
                    <label className="text-slate-500 font-medium">Your Custom Rating (optional)</label>
                    <span className="text-amber-400 font-bold">{userScore ? `${userScore}/10` : 'Not Rated'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 py-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setUserScore(star)}
                        className={`transition-colors p-1 ${
                          star <= (userScore || 0) ? 'text-amber-400 scale-110' : 'text-neutral-700 hover:text-neutral-500'
                        }`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Private review notes */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-500 font-medium">Personal Review / Tracker Notes</label>
                  <textarea
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    placeholder="Log why you're watching, what episode you're on, or your first impressions..."
                    className="w-full bg-[#0F1115] text-slate-100 p-3 rounded-2xl border border-white/10 focus:outline-none focus:border-blue-500 min-h-20 text-xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scroll Indicator Overlay */}
        <AnimatePresence>
          {showScrollIndicator && onboardingStep !== 5 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={() => {
                scrollContainerRef.current?.scrollTo({
                  top: scrollContainerRef.current.scrollTop + 150,
                  behavior: 'smooth'
                });
              }}
              className="absolute bottom-[92px] left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-extrabold shadow-xl shadow-blue-500/20 border border-blue-400/20 cursor-pointer animate-bounce backdrop-blur-sm"
            >
              <span>More Options Below</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/5 flex items-center justify-end gap-3 bg-[#0F1115]/20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-slate-400 hover:text-white hover:bg-[#262A33] transition"
          >
            Cancel
          </button>
          
          {previewShow ? (
            <>
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:text-white hover:bg-[#262A33] transition"
              >
                Back
              </button>
              {searchResults.length > 1 && (
                <button
                  type="button"
                  onClick={() => selectShowAtIndex((selectedIndex + 1) % searchResults.length)}
                  className="px-4 py-2.5 rounded-xl border border-blue-500/25 text-xs font-bold text-blue-400 hover:text-white hover:bg-blue-600/10 transition"
                >
                  Next Match
                </button>
              )}
              <button
                type="button"
                onClick={handleConfirmAdd}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add to Watchlist
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={!query.trim() || isLoading}
              onClick={handleSearchAndEnrich}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1 disabled:opacity-50 disabled:pointer-events-none"
            >
              <Search className="w-3.5 h-3.5" />
              Search & Preview
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
