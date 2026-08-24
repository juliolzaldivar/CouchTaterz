/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TvShow } from '../types';
import { getShowBannerImage } from '../utils/showBanners';
import { Calendar, ChevronLeft, ChevronRight, Play, Sparkles, RefreshCw, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SERVICE_COLORS } from './ShowCard';

interface UpcomingCarouselProps {
  shows: TvShow[];
  onSelectShow?: (show: TvShow) => void;
  onUpdateShow?: (show: TvShow) => void;
  theme?: 'dark' | 'light';
}

export const UpcomingCarousel: React.FC<UpcomingCarouselProps> = ({ shows, onSelectShow, onUpdateShow, theme = 'dark' }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Helper to parse date string safely (returns null if invalid or falsy)
  const parseAirDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    const cleanStr = dateStr.split('T')[0];
    const parts = cleanStr.split('-');
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
      <div className={`relative overflow-hidden rounded-3xl p-8 text-center min-h-[280px] md:min-h-[310px] flex flex-col justify-center items-center space-y-4 ${
        theme === 'dark' ? 'bg-[#1A1D23] border border-white/5' : 'bg-slate-900 border border-slate-200/90 shadow-sm'
      }`}>
        {/* Background Couch Image */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <img
            src="/couch-bg.svg"
            alt="Couch background"
            className="w-full h-full object-cover filter brightness-[0.9] contrast-[1.05]"
            style={{ objectPosition: 'center 40%' }}
            referrerPolicy="no-referrer"
          />
          {/* Same vignette treatment as active banners so instructions are clearly readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F1115]/95 via-[#0F1115]/70 to-[#0F1115]/50 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F1115]/95 via-[#0F1115]/60 to-[#0F1115]/50 pointer-events-none" />
        </div>

        <div className="p-3 rounded-full z-10 bg-[#0F1115]/90 border border-white/10 text-amber-400 shadow-xl">
          <Calendar className="w-6 h-6" />
        </div>

        <div className="z-10 max-w-md space-y-3">
          <div>
            <h4 className="text-base font-extrabold text-white drop-shadow-md">No Banners Active</h4>
            <p className="text-xs mt-1 text-slate-300 font-medium">
              Your featured carousel is currently empty.
            </p>
          </div>
          
          <div className="p-4 rounded-2xl text-[12px] flex flex-col gap-2.5 max-w-sm mx-auto shadow-2xl text-left bg-[#0F1115]/85 backdrop-blur-md border border-amber-500/30 text-slate-200">
            <p className="leading-relaxed">
              Move a show to <span className="text-blue-400 font-extrabold">Watching</span> to generate its banner.
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
              className="mt-3 text-[11px] font-bold text-blue-300 hover:text-blue-200 cursor-pointer transition flex items-center gap-1.5 mx-auto bg-[#0F1115]/90 px-3 py-1.5 rounded-xl border border-blue-500/30 backdrop-blur-sm shadow-md active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset hidden banners ({hiddenShowsCount})</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentShow = upcomingShows[safeActiveIndex];
  const colors = SERVICE_COLORS[currentShow.streamingService] || SERVICE_COLORS['Other'];
  
  // Calculate relative time or human air date safely
  const diffDays = getDiffDays(currentShow);
  const airDate = currentShow.nextEpisode ? parseAirDate(currentShow.nextEpisode.airDate) : null;
  
  // An episode is considered active/recent only if it is upcoming or aired within the last 30 days (1 month)
  const isRecentOrUpcoming = diffDays !== null ? diffDays >= -30 : false;
  
  let countdownText = '';
  if (currentShow.concluded) {
    countdownText = 'Currently Watching';
  } else if (diffDays === null || !isRecentOrUpcoming) {
    countdownText = currentShow.isFavorite ? '⭐ Featured Spotlight' : 'Currently Watching';
  } else if (diffDays > 1) {
    countdownText = `In ${diffDays} days`;
  } else if (diffDays === 1) {
    countdownText = 'Airing Tomorrow!';
  } else if (diffDays === 0) {
    countdownText = 'Airing Today!';
  } else if (diffDays >= -30) {
    const daysAgo = Math.abs(diffDays);
    countdownText = daysAgo === 0 ? 'Airing Today!' : `Aired ${daysAgo} ${daysAgo === 1 ? 'day' : 'days'} ago`;
  } else {
    countdownText = currentShow.isFavorite ? '⭐ Featured Spotlight' : 'Currently Watching';
  }

  return (
    <div className={`relative overflow-hidden rounded-3xl h-[395px] sm:h-[350px] md:h-[320px] group/carousel ${
      theme === 'dark' ? 'bg-[#1A1D23] border border-white/5' : 'bg-slate-900 border border-slate-200/90 shadow-sm'
    }`}>
      {/* Background Banner Image */}
      <div className="absolute inset-0 w-full h-full">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentShow.id}
            src={getShowBannerImage(currentShow)}
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
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1115]/98 via-[#0F1115]/50 to-transparent pointer-events-none" />
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
      <div className="absolute inset-0 z-10 pt-3.5 px-3.5 pb-5 sm:pt-6 sm:px-6 sm:pb-6 flex flex-col justify-between">
        {/* Top bar of slide */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className={`px-2 sm:px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-lg border truncate max-w-[120px] sm:max-w-none ${colors.bg} ${colors.text} ${colors.border}`}>
              {currentShow.streamingService}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Top Right Progress Counter */}
            {upcomingShows.length > 1 && (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#0F1115]/95 backdrop-blur-md border border-white/20 shadow-xl pointer-events-auto">
                <div className="flex items-center gap-1">
                  {upcomingShows.slice(0, 8).map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveIndex(i);
                      }}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        i === safeActiveIndex ? 'w-3.5 bg-amber-400 shadow-sm shadow-amber-400/50' : 'w-1.5 bg-white/30 hover:bg-white/60'
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-black text-slate-100 tracking-wider border-l border-white/20 pl-2 font-mono">
                  {safeActiveIndex + 1}<span className="text-slate-500 font-normal">/</span>{upcomingShows.length}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Middle/Bottom block info */}
        <div className="max-w-2xl mt-3 md:mt-6 mb-1">
          {/* Title & Countdown Group */}
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center flex-wrap gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{countdownText}</span>
              {airDate && isRecentOrUpcoming && !currentShow.concluded && (
                <>
                  <span className="text-slate-500">—</span>
                  <span className="text-white font-extrabold">
                    {airDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </span>
                </>
              )}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md leading-tight line-clamp-2">
              {currentShow.title}
            </h2>
          </div>

          {/* Episode Pill & Description Group */}
          <div className="mt-3 md:mt-5 space-y-1.5 md:space-y-2">
            {currentShow.nextEpisode && isRecentOrUpcoming && !currentShow.concluded && (
              <p className="text-[11px] md:text-xs font-bold text-blue-400 flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg w-fit">
                <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5 animate-pulse" />
                <span>
                  {diffDays >= 0 ? 'Next Episode:' : 'Recent Episode:'} S{currentShow.nextEpisode.season}E{currentShow.nextEpisode.episode} &ldquo;{currentShow.nextEpisode.title}&rdquo;
                </span>
              </p>
            )}

            <p className="text-xs md:text-sm text-slate-300 line-clamp-2 leading-relaxed drop-shadow-sm font-medium">
              {(() => {
                const epSummary = (isRecentOrUpcoming && !currentShow.concluded)
                  ? (currentShow.nextEpisode?.overview || currentShow.nextEpisode?.summary)
                  : null;
                const rawText = (epSummary || currentShow.overview || '').replace(/<[^>]*>?/gm, '').trim();
                const text = rawText || `${currentShow.title} — tracked on CouchTaterz.`;
                return text.length > 180 ? `${text.slice(0, 180)}...` : text;
              })()}
            </p>
          </div>

          {/* Genre Glass Micro-Badge */}
          {currentShow.genres && currentShow.genres.length > 0 && (
            <div className="flex items-center gap-2 pt-2.5 md:pt-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#0F1115]/90 backdrop-blur-md border border-white/20 text-xs font-semibold text-slate-100 shadow-lg max-w-full">
                <Tag className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="text-slate-200 font-bold truncate">{currentShow.genres.join(' • ')}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
