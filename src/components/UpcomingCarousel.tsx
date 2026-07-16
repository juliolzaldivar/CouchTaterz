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
  const [teasers, setTeasers] = useState<Record<string, string>>({});
  const [loadingTeasers, setLoadingTeasers] = useState<Record<string, boolean>>({});

  // Helper to parse date string without timezone shift (timezone-safe)
  const parseAirDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // 0-based
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return new Date(dateStr);
  };

  // Filter shows that are favorites OR are followed and currently airing (not concluded and has nextEpisode)
  // and whose next episode is airing in no more than 30 days, EXCEPT those hidden by the user.
  // BUT: If a show has been favorited (marked with the star icon), we always include/assign it to the banner 
  // (unless it is explicitly hidden by the user).
  const upcomingShows = shows
    .filter(s => {
      if (s.isBannerHidden) return false;

      // If a show is marked as favorite (star icon selected), it is ALWAYS assigned to the banner.
      if (s.isFavorite) return true;

      const isEligible = s.status === 'Watching';
      if (!isEligible || !s.nextEpisode || s.concluded) return false;

      const airDateStr = s.nextEpisode.airDate;
      if (!airDateStr) return false;

      const airTime = parseAirDate(airDateStr).getTime();
      
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
      const thirtyDaysTime = thirtyDaysLater.setHours(23, 59, 59, 999);

      return airTime <= thirtyDaysTime;
    })
    .sort((a, b) => {
      // Favorites first
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      
      // Then sort by date
      if (a.nextEpisode && b.nextEpisode) {
        return parseAirDate(a.nextEpisode.airDate).getTime() - parseAirDate(b.nextEpisode.airDate).getTime();
      }
      if (a.nextEpisode) return -1;
      if (b.nextEpisode) return 1;
      return 0;
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
  const activeShow = upcomingShows[safeActiveIndex];
  const activeShowId = activeShow?.id;
  const activeShowSeason = activeShow?.nextEpisode?.season;
  const activeShowEpisode = activeShow?.nextEpisode?.episode;

  // Fetch next episode summary teaser from next-episode.net
  useEffect(() => {
    if (!activeShow || !activeShow.nextEpisode) return;
    const cacheKey = `${activeShow.id}-${activeShow.nextEpisode.season}-${activeShow.nextEpisode.episode}`;
    
    if (teasers[cacheKey] !== undefined || loadingTeasers[cacheKey]) return;

    setLoadingTeasers(prev => ({ ...prev, [cacheKey]: true }));
    
    fetch('/api/next-episode-teaser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: activeShow.title,
        season: activeShow.nextEpisode.season,
        episode: activeShow.nextEpisode.episode,
        genres: activeShow.genres,
        overview: activeShow.overview,
      }),
    })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP error ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setTeasers(prev => ({ ...prev, [cacheKey]: data.teaser || "No upcoming episode teaser available." }));
      })
      .catch(err => {
        console.error('Error fetching teaser:', err);
        const fallbackText = activeShow.overview || "No upcoming episode teaser available.";
        setTeasers(prev => ({ ...prev, [cacheKey]: fallbackText }));
      })
      .finally(() => {
        setLoadingTeasers(prev => ({ ...prev, [cacheKey]: false }));
      });
  }, [safeActiveIndex, activeShowId, activeShowSeason, activeShowEpisode]);

  const cleanTeaserText = (text: string) => {
    if (!text) return '';
    let clean = text;
    
    // Robust removal of next-episode.net prefixes
    clean = clean.replace(/^According to next-episode\.net's (teaser|episodic preview|listing|preview)( for Season \d+, Episode \d+ of "[^"]+")?[\s,:]*/i, '');
    clean = clean.replace(/^According to next-episode\.net's\s*/i, '');
    clean = clean.replace(/^Inspired by next-episode\.net[\s,:]*/i, '');
    
    if (clean.length > 0) {
      clean = clean.charAt(0).toUpperCase() + clean.slice(1);
    }
    return clean;
  };

  const handlePrev = () => {
    setActiveIndex(prev => (prev - 1 + upcomingShows.length) % upcomingShows.length);
  };

  const handleNext = () => {
    setActiveIndex(prev => (prev + 1) % upcomingShows.length);
  };

  const hiddenShowsCount = shows.filter(s => s.isBannerHidden).length;

  if (upcomingShows.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-[#1A1D23] border border-white/5 p-8 text-center min-h-[180px] flex flex-col justify-center items-center space-y-3">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(30,30,30,0.5),transparent_60%)]" />
        <div className="p-3 bg-[#0F1115]/80 rounded-full border border-white/5 text-slate-400 z-10">
          <Calendar className="w-6 h-6" />
        </div>
        <div className="z-10 max-w-md">
          <h4 className="text-sm font-semibold text-slate-200">No Upcoming Episodes Scheduled</h4>
          <p className="text-xs text-slate-500 mt-1">
            All your tracked shows are currently completed or in between seasons. Select the Star ⭐ icon on any show below to assign it here as a custom banner!
          </p>
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
            animate={{ opacity: 0.35, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full h-full object-cover filter brightness-50"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>
        {/* Cinematic shadows */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1115] via-[#0F1115]/50 to-[#0F1115]/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F1115] via-[#0F1115]/40 to-transparent" />
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
      <div className="absolute inset-0 z-10 pt-6 px-6 pb-8 md:pt-8 md:px-8 md:pb-10 flex flex-col justify-between">
        {/* Top bar of slide */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-lg border backdrop-blur-md ${colors.bg} ${colors.text} ${colors.border}`}>
              {currentShow.streamingService}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg bg-emerald-950/50 text-emerald-300 border border-emerald-800/30 backdrop-blur-md">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              {currentShow.isFavorite ? 'SPOTLIGHT' : 'UP NEXT'}
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
                className="flex items-center justify-center p-2 rounded-xl bg-[#0F1115]/60 hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 border border-white/5 hover:border-rose-800/40 backdrop-blur-md transition-all cursor-pointer"
                title="Hide this show's banner"
              >
                <EyeOff className="w-4 h-4" />
              </button>
            )}

            {/* Indicators */}
            {upcomingShows.length > 1 && (
              <div className="flex items-center gap-1 bg-[#0F1115]/40 backdrop-blur-md rounded-full px-2 py-1 border border-white/5">
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
        <div className="space-y-3 max-w-2xl mt-10">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center flex-wrap gap-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {countdownText}{airDate ? ` — ${airDate.toLocaleDateString('en-US', {weekday: 'long', month: 'short', day: 'numeric'})}` : ''}
              </span>
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-md">
              {currentShow.title}
            </h2>
          </div>

          <p className="text-xs md:text-sm text-slate-300 line-clamp-2 md:line-clamp-3 leading-relaxed drop-shadow-sm font-medium">
            {currentShow.nextEpisode ? (
              <>
                Next up: <span className="text-white font-bold">Season {currentShow.nextEpisode.season}, Episode {currentShow.nextEpisode.episode} — &ldquo;{currentShow.nextEpisode.title}&rdquo;</span>.{' '}
                {loadingTeasers[`${currentShow.id}-${currentShow.nextEpisode.season}-${currentShow.nextEpisode.episode}`] ? (
                  <span className="text-slate-400 italic animate-pulse">Retrieving next-episode.net teaser...</span>
                ) : (
                  cleanTeaserText(teasers[`${currentShow.id}-${currentShow.nextEpisode.season}-${currentShow.nextEpisode.episode}`]) || currentShow.overview
                )}
              </>
            ) : (
              <>
                <span className="text-white font-bold">Featured Spotlight</span>. {currentShow.overview}
              </>
            )}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Streaming:</span>
            <span className="text-xs font-bold text-slate-200">{currentShow.streamingService}</span>
            <div className="w-1 h-1 bg-[#262A33] rounded-full" />
            <span className="text-[10px] text-slate-500 font-bold uppercase">Genres:</span>
            <span className="text-xs text-slate-300 font-medium">{currentShow.genres.join(', ')}</span>
            {currentShow.nextEpisode && (
              <>
                <div className="w-1 h-1 bg-[#262A33] rounded-full" />
                <span className="text-[10px] text-slate-500 font-bold uppercase">Teaser:</span>
                <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-blue-400 animate-pulse" /> next-episode.net
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
