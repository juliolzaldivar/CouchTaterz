/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TvShow, StreamingService, ShowStatus } from '../types';
import { Sparkles, Loader2, X, Film, AlertCircle, Plus, Star, Tv } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AddShowModalProps {
  onClose: () => void;
  onAddShow: (newShow: TvShow) => void;
}

const STREAMING_SERVICES: StreamingService[] = [
  'HBO', 'Disney+', 'Prime Video', 'Netflix', 'Hulu', 'Paramount+', 'Apple TV', 'Peacock', 'AMC+', 'Other'
];

export const AddShowModal: React.FC<AddShowModalProps> = ({ onClose, onAddShow }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enrichSteps, setEnrichSteps] = useState<string>('');
  
  // Enriched show preview
  const [previewShow, setPreviewShow] = useState<Partial<TvShow> | null>(null);
  const [bannerImage, setBannerImage] = useState('');

  // Custom user choices on adding
  const [status, setStatus] = useState<ShowStatus>('Watching');
  const [userScore, setUserScore] = useState<number | null>(null);
  const [userNotes, setUserNotes] = useState('');

  const runSteps = async () => {
    const steps = [
      "Contacting major networks...",
      "Searching database catalogs...",
      "Fetching Rotten Tomatoes reviews...",
      "Checking next-airing schedule...",
      "Assembling visual cards..."
    ];
    for (const step of steps) {
      setEnrichSteps(step);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  };

  const handleSearchAndEnrich = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setPreviewShow(null);

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

      const showDetails = await response.json();
      await stepsPromise; // wait for visual steps to finish

      setPreviewShow(showDetails);
      setBannerImage(showDetails.bannerImage || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80');
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
      bannerImage: bannerImage.trim() || previewShow.bannerImage || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80',
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
              <p className="text-xs text-slate-500">Scan metadata and schedules automatically with AI</p>
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
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Initial Search Form */}
          {!previewShow && !isLoading && (
            <form onSubmit={handleSearchAndEnrich} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Show Title</label>
                <div className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., Shogun, Succession, Shingeki no Kyojin..."
                    className="w-full bg-[#0F1115] text-slate-100 px-4 py-3.5 rounded-2xl border border-white/10 focus:outline-none focus:border-blue-500 placeholder-slate-500 text-sm"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!query.trim()}
                    className="absolute right-2 top-2 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Scan
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
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Why use AI scan?</h4>
                <ul className="text-xs text-slate-500 space-y-1.5 list-disc pl-4 leading-relaxed">
                  <li>Detects Rotten Tomatoes scores automatically.</li>
                  <li>Determines where to stream (HBO, Netflix, etc.).</li>
                  <li>Retrieves upcoming episode titles, seasons, and scheduled dates.</li>
                  <li>Injects the cast, directors, overview synopsis, and gorgeous banner imagery.</li>
                </ul>
              </div>
            </form>
          )}

          {/* AI Gathering Data Loader */}
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
              
              {/* Show Metadata Summary Card */}
              <div className="relative rounded-2xl overflow-hidden bg-[#0F1115] border border-white/5 p-4 flex gap-4">
                {bannerImage && (
                  <img 
                    src={bannerImage} 
                    alt={previewShow.title} 
                    className="w-20 h-28 rounded-xl object-cover border border-white/5 bg-[#262A33]"
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
                    <span>RT Score: <strong className="text-rose-400">{previewShow.rottenTomatoesScore}%</strong></span>
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
                        className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                          status === st 
                            ? 'bg-blue-600 border-blue-500 text-white' 
                            : 'bg-[#0F1115] border-white/5 text-slate-400 hover:bg-[#262A33] hover:text-white'
                        }`}
                      >
                        {st === 'Watching' ? 'Active' : st === 'Backlog' ? 'Queue' : st}
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
                onClick={() => setPreviewShow(null)}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:text-white hover:bg-[#262A33] transition"
              >
                Back
              </button>
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
              <Sparkles className="w-3.5 h-3.5" />
              Scan & Preview
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
