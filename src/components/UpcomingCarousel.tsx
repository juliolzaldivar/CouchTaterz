/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TvShow } from '../types';
import { Calendar, ChevronLeft, ChevronRight, Play, Sparkles, EyeOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SERVICE_COLORS } from './ShowCard';

interface UpcomingCarouselProps {
  shows: TvShow[];
  onSelectShow?: (show: TvShow) => void;
  onUpdateShow?: (show: TvShow) => void;
}

export const UpcomingCarousel: React.FC<UpcomingCarouselProps> = ({ shows, onSelectShow, onUpdateShow }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Helper to parse date string safely (returns null if invalid or falsy)
  const parseAirDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // 0-based
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  };

  // Helper to format date string beautifully for display
  const formatAirDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '';
    const d = parseAirDate(dateStr);
    if (!d) return '';
    const shortMonth = d.toLocaleDateString('en-US', { month: 'short' });
    const twoDigitYear = String(d.getFullYear()).slice(-2);
    return `${shortMonth} ${d.getDate()} ${twoDigitYear}`;
  };

  // Filter shows that are favorites OR are followed and currently airing (not concluded and has nextEpisode)
  // and whose next episode is airing in no more than 30 days, EXCEPT those hidden by the user.
  // BUT: If a show has been favorited (marked with the star icon), we always include/assign it to the banner 
  // (unless it is explicitly hidden by the user).
  const getDiffDays = (show: typeof shows[0]) => {
    if (!show.nextEpisode || !show.nextEpisode.airDate) return null;
    const d = parseAirDate(show.nextEpisode.airDate);
    if (!d) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = d.getTime() - today.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  const getGroup = (show: typeof shows[0]) => {
    const diff = getDiffDays(show);
    if (diff !== null) {
      if (diff >= 0) return 1; // Group 1: Future airing
      return 2; // Group 2: Recently aired
    }
    return 3; // Group 3: Favorites/Others
  };

  const upcomingShows = shows
    .filter(s => {
      if (s.isBannerHidden) return false;

      // Only the content in active status (Watching) should create banners.
      if (s.status === 'Watching') return true;

      return false;
    })
    .sort((a, b) => {
      const groupA = getGroup(a);
      const groupB = getGroup(b);
      
      if (groupA !== groupB) {
        return groupA - groupB;
      }
      
      const diffA = getDiffDays(a);
      const diffB = getDiffDays(b);
      
      if (groupA === 1 && diffA !== null && diffB !== null) {
        // Group 1: Future airing (closest first, ascending)
        return diffA - diffB;
      }
      
      if (groupA === 2 && diffA !== null && diffB !== null) {
        // Group 2: Recently aired (closest to now first, descending, so -1 comes before -5)
        return diffB - diffA;
      }
      
      // Group 3: Favorites / Active shows / Starters without upcoming episodes (alphabetical by title)
      return a.title.localeCompare(b.title);
    });

  // Automatically rotate carousel items
  useEffect(() => {
    if (upcomingShows.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % upcomingShows.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [upcomingShows.length]);

  // Keep activeIndex within bounds if the list of upcoming shows shrinks
  useEffect(() => {
    if (activeIndex >= upcomingShows.length && upcomingShows.length > 0) {
      setActiveIndex(upcomingShows.length - 1);
    }
  }, [upcomingShows.length, activeIndex]);

  const safeActiveIndex = activeIndex >= upcomingShows.length ? 0 : activeIndex;

  const handlePrev = () => {
    setActiveIndex(prev => (prev - 1 + upcomingShows.length) % upcomingShows.length);
  };

  const handleNext = () => {
    setActiveIndex(prev => (prev + 1) % upcomingShows.length);
  };

  const hiddenShowsCount = shows.filter(s => s.isBannerHidden).length;

  if (upcomingShows.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-[#1A1D23] border border-white/5 p-8 text-center min-h-[220px] flex flex-col justify-center items-center space-y-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(30,30,30,0.5),transparent_60%)]" />
        <div className="p-3 bg-[#0F1115]/80 rounded-full border border-white/5 text-slate-400 z-10">
          <Calendar className="w-6 h-6" />
        </div>
        <div className="z-10 max-w-md space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-slate-200">No Banners Active</h4>
            <p className="text-xs text-slate-500 mt-1">
              Your featured carousel is currently empty.
            </p>
          </div>
          
          <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/25 text-[11px] text-slate-300 flex flex-col gap-2.5 max-w-sm mx-auto shadow-sm text-left">
            <p className="leading-normal">
              Move a show to <span className="text-blue-400 font-extrabold">Watching</span> or mark it as a <span className="text-amber-300 font-extrabold">Favorite</span> to generate its banner.
            </p>
          </div>

          {hiddenShowsCount > 0 && onUpdateShow && (
            <button
              onClick={() => {
                shows.forEach(s => {
                  if (s.isBannerHidden) {
                    onUpdateShow({ ...s, isBannerHidden: false });
                  }
                });
              }}
              className="mt-3 text-[10px] font-bold text-blue-400 hover:text-blue-300 underline cursor-pointer transition flex items-center gap-1 mx-auto bg-blue-500/5 px-2.5 py-1 rounded-lg border border-blue-500/10"
            >
              <RefreshCw className="w-3 h-3" />
              Reset hidden banners ({hiddenShowsCount})
            </button>
          )}
        </div>

      </div>
    );
  }

  const currentShow = upcomingShows[safeActiveIndex];
  const colors = SERVICE_COLORS[currentShow.streamingService] || SERVICE_COLORS['Other'];
  
  // Calculate relative time or human air date safely
  const airDate = currentShow.nextEpisode ? parseAirDate(currentShow.nextEpisode.airDate) : null;
  const now = new Date();
  const diffTime = airDate ? airDate.getTime() - now.getTime() : 0;
  const diffDays = airDate ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;
  
  let countdownText = '';
  if (currentShow.isFavorite && !airDate) {
    countdownText = '⭐ Featured Spotlight';
  } else if (!airDate) {
    countdownText = 'Release TBD';
  } else if (diffDays === 0) {
    countdownText = 'Airing Today!';
  } else if (diffDays === 1) {
    countdownText = 'Airing Tomorrow!';
  } else if (diffDays > 1) {
    countdownText = `In ${diffDays} days`;
  } else if (diffDays >= -7) {
    countdownText = `Aired ${Math.abs(diffDays)} days ago`;
  } else {
    countdownText = 'New Season Airing';
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#1A1D23] border border-white/5 h-[360px] md:h-[310px] group/carousel">
      {/* Background Banner Image */}
      <div className="absolute inset-0 w-full h-full">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentShow.id}
            src={currentShow.bannerImage}
            alt={currentShow.title}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.85, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full h-full object-cover filter brightness-[1.05] contrast-[1.05] saturate-[1.05]"
            style={{ objectPosition: currentShow.bannerPosition || 'center 25%' }}
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>
        {/* Cinematic targeted shadows to guarantee text legibility on the bottom-left while keeping the rest of the image bright and vivid */}
        {/* Bottom edge shadow (deep dark at the bottom, fades to clear at 60% height) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1115]/95 via-[#0F1115]/45 to-transparent pointer-events-none" />
        {/* Left edge shadow (deep dark on the left, fades to clear at 50% width) */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F1115]/95 via-[#0F1115]/40 to-transparent pointer-events-none" />
      </div>

      {/* Carousel Controls */}
      {upcomingShows.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-[#0F1115]/70 hover:bg-[#0F1115] border border-white/5 hover:border-white/10 text-slate-400 hover:text-white transition opacity-0 group-hover/carousel:opacity-100 focus:opacity-100"
            aria-label="Previous Show"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-[#0F1115]/70 hover:bg-[#0F1115] border border-white/5 hover:border-white/10 text-slate-400 hover:text-white transition opacity-0 group-hover/carousel:opacity-100 focus:opacity-100"
            aria-label="Next Show"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Content overlay */}
      <div className="absolute inset-0 z-10 pt-4 px-5 pb-5 md:pt-8 md:px-8 md:pb-8 flex flex-col justify-between">
        {/* Top bar of slide */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              {currentShow.isFavorite ? 'SPOTLIGHT' : 'UP NEXT'}
            </span>
            <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-lg border ${colors.bg} ${colors.text} ${colors.border}`}>
              {currentShow.streamingService}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Control to turn off this particular banner */}
            {onUpdateShow && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateShow({
                    ...currentShow,
                    isBannerHidden: true
                  });
                  // If we are at the last index, reset the active index
                  if (activeIndex >= upcomingShows.length - 1) {
                    setActiveIndex(Math.max(0, upcomingShows.length - 2));
                  }
                }}
                className="flex items-center justify-center p-1.5 rounded-lg bg-[#0F1115] hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 border border-white/5 hover:border-rose-800/40 transition-colors duration-150 cursor-pointer"
                title="Hide this show's banner"
              >
                <EyeOff className="w-3 h-3" />
              </button>
            )}

            {/* Indicators */}
            {upcomingShows.length > 1 && (
              <div className="flex items-center gap-1 bg-[#0F1115] rounded-full px-2 py-1 border border-white/5">
                {upcomingShows.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === safeActiveIndex ? 'w-4 bg-white' : 'w-1.5 bg-neutral-600'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Middle/Bottom block info */}
        <div className="max-w-2xl mt-4 md:mt-6">
          {/* Title & Countdown Group */}
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center flex-wrap gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{countdownText}</span>
              {airDate && (
                <>
                  <span className="text-slate-500">—</span>
                  <span className="text-white font-extrabold">
                    {airDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </span>
                </>
              )}
            </span>
            <h2 className="text-xl md:text-3xl font-black text-white tracking-tight drop-shadow-md line-clamp-1">
              {currentShow.title}
            </h2>
          </div>

          {/* Episode Pill & Description Group (Close together, separate from title) */}
          <div className="mt-4 md:mt-5 space-y-1.5 md:space-y-2">
            {currentShow.nextEpisode && (
              <p className="text-[11px] md:text-xs font-bold text-blue-400 flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg w-fit">
                <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5 animate-pulse" />
                <span>Next Episode: S{currentShow.nextEpisode.season}E{currentShow.nextEpisode.episode} &ldquo;{currentShow.nextEpisode.title}&rdquo;</span>
              </p>
            )}

            <p className="text-xs md:text-sm text-slate-300 line-clamp-2 leading-relaxed drop-shadow-sm font-medium">
              {(() => {
                const epSummary = currentShow.nextEpisode?.overview || currentShow.nextEpisode?.summary;
                const text = epSummary || currentShow.overview;
                return text.length > 180 ? `${text.slice(0, 180)}...` : text;
              })()}
            </p>
          </div>

          {/* Streaming & Genre Info */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-2 md:pt-3">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Streaming:</span>
            <span className="text-xs font-bold text-slate-200">{currentShow.streamingService}</span>
            <div className="w-1 h-1 bg-[#262A33] rounded-full" />
            <span className="text-[10px] text-slate-500 font-bold uppercase">Genres:</span>
            <span className="text-xs text-slate-300 font-medium">{currentShow.genres.join(', ')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
