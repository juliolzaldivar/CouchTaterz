/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { TvShow, StreamingService } from '../types';
import { getStreamingServiceLink } from '../utils/streamingLinks';
import { getShowBannerImage } from '../utils/showBanners';
import { isFutureAirDate } from '../utils/airedEpisodes';
import {
  generateGoogleCalendarUrl,
  generateOutlookCalendarUrl,
  generateIcsContent,
  downloadIcsFile,
  extractCalendarEvent,
  formatRelativeAirDate,
  CalendarEventInfo
} from '../utils/calendarSync';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Tv, 
  Clock, 
  ExternalLink, 
  Check, 
  Sparkles, 
  Filter,
  Download,
  CalendarDays,
  ListFilter,
  LayoutGrid,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SERVICE_COLORS } from './ShowCard';

interface ShowCalendarModalProps {
  shows: TvShow[];
  onUpdateShow: (updatedShow: TvShow) => void;
  onClose: () => void;
  isOpen?: boolean;
  theme?: 'dark' | 'light';
}

type CalendarViewMode = 'timeline' | 'matrix';

export const ShowCalendarModal: React.FC<ShowCalendarModalProps> = ({
  shows,
  onUpdateShow,
  onClose,
  theme = 'dark',
}) => {
  const today = useMemo(() => new Date(), []);
  
  // View mode: 'timeline' (List) vs 'matrix' (Month)
  const [viewMode, setViewMode] = useState<CalendarViewMode>('timeline');
  const [serviceFilter, setServiceFilter] = useState<StreamingService | 'All'>('All');
  
  // Calendar Month Matrix State
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-indexed
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  );

  // Open calendar dropdown state per show/episode
  const [activeCalendarMenuId, setActiveCalendarMenuId] = useState<string | null>(null);

  // Close sync dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.calendar-sync-dropdown-trigger') && !target.closest('.calendar-sync-dropdown-menu')) {
        setActiveCalendarMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter shows that have valid upcoming/active air dates and are in 'Watching' status
  const activeScheduledShows = useMemo(() => {
    return shows.filter((show) => {
      if (!show.nextEpisode || !show.nextEpisode.airDate || show.concluded) return false;
      if (show.status !== 'Watching') return false;
      if (serviceFilter !== 'All' && show.streamingService !== serviceFilter) return false;
      return true;
    });
  }, [shows, serviceFilter]);

  // Parse episode air dates into a structured map: "YYYY-MM-DD" -> TvShow[]
  const showsByDate = useMemo(() => {
    const map: Record<string, TvShow[]> = {};
    
    activeScheduledShows.forEach((show) => {
      if (!show.nextEpisode?.airDate) return;

      let dateStr = '';
      const parts = show.nextEpisode.airDate.split('-');
      if (parts.length === 3) {
        const y = parts[0];
        const m = parts[1].padStart(2, '0');
        const d = parts[2].padStart(2, '0');
        dateStr = `${y}-${m}-${d}`;
      } else {
        const parsed = new Date(show.nextEpisode.airDate);
        if (!isNaN(parsed.getTime())) {
          dateStr = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
        }
      }

      if (dateStr) {
        if (!map[dateStr]) map[dateStr] = [];
        map[dateStr].push(show);
      }
    });

    return map;
  }, [activeScheduledShows]);

  // Timeline Releases: sorted chronologically
  const sortedTimelineShows = useMemo(() => {
    return [...activeScheduledShows].sort((a, b) => {
      const dateA = a.nextEpisode?.airDate || '9999-99-99';
      const dateB = b.nextEpisode?.airDate || '9999-99-99';
      return dateA.localeCompare(dateB);
    });
  }, [activeScheduledShows]);

  // Grouped Timeline sections
  const timelineGroups = useMemo(() => {
    const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const oneDay = 1000 * 60 * 60 * 24;

    const thisWeek: TvShow[] = [];
    const nextWeek: TvShow[] = [];
    const upcomingLater: TvShow[] = [];
    const pastAired: TvShow[] = [];

    sortedTimelineShows.forEach((show) => {
      if (!show.nextEpisode?.airDate) return;
      const parts = show.nextEpisode.airDate.split('-');
      if (parts.length !== 3) {
        upcomingLater.push(show);
        return;
      }
      const targetTime = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime();
      const diffDays = Math.round((targetTime - todayZero) / oneDay);

      if (diffDays < 0) {
        pastAired.push(show);
      } else if (diffDays <= 6) {
        thisWeek.push(show);
      } else if (diffDays <= 13) {
        nextWeek.push(show);
      } else {
        upcomingLater.push(show);
      }
    });

    return {
      thisWeek,
      nextWeek,
      upcomingLater,
      pastAired
    };
  }, [sortedTimelineShows, today]);

  // Months name array
  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Total days in the selected month
  const totalDaysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth]);

  // Starting day of the week for the 1st of the month (0 = Sun, 6 = Sat)
  const firstDayOfWeek = useMemo(() => {
    return new Date(currentYear, currentMonth, 1).getDay();
  }, [currentYear, currentMonth]);

  // Navigate to previous month
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  // Navigate to next month
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  // Auto-jump to the nearest upcoming airing show across any month
  const handleJumpToNextAiring = () => {
    const todayTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    let nearestDateStr: string | null = null;
    let nearestTime = Infinity;

    Object.keys(showsByDate).forEach((dateKey) => {
      const dateParts = dateKey.split('-');
      if (dateParts.length === 3) {
        const time = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2])).getTime();
        if (time >= todayTime && time < nearestTime) {
          nearestTime = time;
          nearestDateStr = dateKey;
        }
      }
    });

    if (nearestDateStr) {
      const [y, m] = (nearestDateStr as string).split('-');
      setCurrentYear(Number(y));
      setCurrentMonth(Number(m) - 1);
      setSelectedDateKey(nearestDateStr);
    }
  };

  // Check if visible month has airings
  const hasAiringShowsInVisibleMonth = useMemo(() => {
    const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-`;
    return Object.keys(showsByDate).some((key) => key.startsWith(monthPrefix));
  }, [currentYear, currentMonth, showsByDate]);

  // Streaming services list for filter
  const streamingServices: StreamingService[] = [
    'HBO', 'Disney+', 'Prime Video', 'Netflix', 'Hulu', 'Paramount+', 'Apple TV', 'Peacock', 'AMC+', 'Starz', 'Other'
  ];

  // Selected date's airing shows for Matrix view
  const selectedDateShows = selectedDateKey ? showsByDate[selectedDateKey] || [] : [];

  // Helper to mark episode as watched from calendar
  const handleMarkWatched = (show: TvShow) => {
    if (!show.nextEpisode) return;
    if (isFutureAirDate(show.nextEpisode.airDate)) return;
    
    const wasNext = show.nextEpisode;
    const updatedLatest = {
      season: wasNext.season,
      episode: wasNext.episode,
      title: wasNext.title
    };

    const updatedNext = {
      season: wasNext.season,
      episode: wasNext.episode + 1,
      title: `Episode ${wasNext.episode + 1}`,
      airDate: show.concluded ? '' : new Date(new Date(wasNext.airDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    const updatedShow: TvShow = {
      ...show,
      latestWatched: updatedLatest,
      nextEpisode: updatedNext,
    };

    onUpdateShow(updatedShow);
  };

  // Master Export All Upcoming Schedule (.ics)
  const handleExportAllIcs = () => {
    const events: CalendarEventInfo[] = [];
    activeScheduledShows.forEach((s) => {
      const ev = extractCalendarEvent(s);
      if (ev) events.push(ev);
    });

    if (events.length === 0) return;
    const icsString = generateIcsContent(events);
    downloadIcsFile('couchtaterz_releases.ics', icsString);
  };

  // Single Episode Sync Handlers
  const handleSyncGoogle = (show: TvShow) => {
    const ev = extractCalendarEvent(show);
    if (!ev) return;
    const url = generateGoogleCalendarUrl(ev);
    window.open(url, '_blank', 'noopener,noreferrer');
    setActiveCalendarMenuId(null);
  };

  const handleSyncOutlook = (show: TvShow) => {
    const ev = extractCalendarEvent(show);
    if (!ev) return;
    const url = generateOutlookCalendarUrl(ev);
    window.open(url, '_blank', 'noopener,noreferrer');
    setActiveCalendarMenuId(null);
  };

  const handleSyncAppleIcs = (show: TvShow) => {
    const ev = extractCalendarEvent(show);
    if (!ev) return;
    const icsString = generateIcsContent([ev]);
    const cleanTitle = show.title.replace(/[^a-zA-Z0-9]/g, '_');
    downloadIcsFile(`${cleanTitle}_S${ev.season}E${ev.episode}.ics`, icsString);
    setActiveCalendarMenuId(null);
  };

  // Card component renderer for Timeline view
  const renderTimelineCard = (show: TvShow) => {
    const ep = show.nextEpisode;
    if (!ep) return null;
    const colors = SERVICE_COLORS[show.streamingService] || SERVICE_COLORS['Other'];
    const relativeTime = formatRelativeAirDate(ep.airDate || '');
    const isFuture = isFutureAirDate(ep.airDate);
    const cardId = `cal-card-${show.id}-${ep.season}-${ep.episode}`;
    const isMenuOpen = activeCalendarMenuId === cardId;

    return (
      <div 
        key={cardId}
        className={`p-3 sm:p-4 rounded-2xl border transition flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 relative ${
          theme === 'dark' 
            ? 'bg-[#181B22] border-white/10 hover:border-white/15 shadow-sm' 
            : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
        }`}
      >
        {/* 16:9 Thumbnail Banner */}
        <div className={`relative w-full sm:w-32 md:w-36 lg:w-40 aspect-video shrink-0 rounded-xl overflow-hidden border ${
          theme === 'dark' ? 'bg-[#0E1015] border-white/10' : 'bg-slate-100 border-slate-200'
        }`}>
          <img 
            src={getShowBannerImage(show)} 
            alt={show.title}
            className="w-full h-full object-cover"
            style={{ objectPosition: show.bannerPosition || 'center 25%' }}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          
          <div className="absolute bottom-1.5 left-1.5 pointer-events-none">
            <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider rounded border shadow-xs ${colors.bg} ${colors.text} ${colors.border}`}>
              {show.streamingService}
            </span>
          </div>
        </div>

        {/* Content Column */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-md uppercase tracking-wider ${
              theme === 'dark' ? 'bg-blue-500/15 text-blue-300 border border-blue-500/20' : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              Season {ep.season}, Ep {ep.episode}
            </span>

            <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-md flex items-center gap-1 ${
              relativeTime.isToday
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : relativeTime.isSoon
                ? theme === 'dark'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                : theme === 'dark'
                ? 'bg-slate-800 text-slate-300 border border-slate-700'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}>
              <Clock className="w-2.5 h-2.5" />
              <span>{relativeTime.label}</span>
            </span>
          </div>

          <h4 className={`text-sm sm:text-base font-black truncate leading-snug ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}>
            {show.title}
          </h4>

          <div className={`text-xs font-semibold truncate ${
            theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
          }`}>
            {ep.title && !ep.title.toLowerCase().startsWith('episode') ? `"${ep.title}"` : `Episode ${ep.episode}`}
          </div>

          {ep.overview && (
            <p className={`text-[11px] leading-relaxed line-clamp-2 ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
            }`}>
              {ep.overview}
            </p>
          )}
        </div>

        {/* Actions Column */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {!isFuture ? (
              <button
                type="button"
                onClick={() => handleMarkWatched(show)}
                className="py-1.5 px-3 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
                title="Mark this episode as watched and advance progress"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark Watched</span>
              </button>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActiveCalendarMenuId(isMenuOpen ? null : cardId)}
                  className={`calendar-sync-dropdown-trigger py-1.5 px-3 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 border ${
                    theme === 'dark'
                      ? 'bg-[#222733] hover:bg-[#2C3242] text-slate-200 border-white/10 hover:border-white/20'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  }`}
                  title="Add episode air date reminder to your calendar"
                >
                  <CalendarDays className="w-3.5 h-3.5 text-blue-400" />
                  <span>Add to Calendar</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className={`calendar-sync-dropdown-menu absolute right-0 top-full mt-1.5 w-48 rounded-xl border shadow-xl z-30 p-1 space-y-0.5 ${
                        theme === 'dark' ? 'bg-[#1E222B] border-white/10 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSyncGoogle(show)}
                        className={`w-full px-3 py-2 text-xs font-semibold rounded-lg text-left transition flex items-center justify-between cursor-pointer ${
                          theme === 'dark' ? 'hover:bg-white/10 hover:text-white' : 'hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <span>Google Calendar</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSyncAppleIcs(show)}
                        className={`w-full px-3 py-2 text-xs font-semibold rounded-lg text-left transition flex items-center justify-between cursor-pointer ${
                          theme === 'dark' ? 'hover:bg-white/10 hover:text-white' : 'hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <span>Apple Calendar (.ics)</span>
                        <Download className="w-3 h-3 text-slate-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSyncOutlook(show)}
                        className={`w-full px-3 py-2 text-xs font-semibold rounded-lg text-left transition flex items-center justify-between cursor-pointer ${
                          theme === 'dark' ? 'hover:bg-white/10 hover:text-white' : 'hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <span>Outlook Calendar</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                window.open(getStreamingServiceLink(show.streamingService, show.title), '_blank', 'noopener,noreferrer');
              }}
              className={`p-2 rounded-xl border transition flex items-center justify-center cursor-pointer ${
                theme === 'dark' 
                  ? 'bg-[#222733] hover:bg-[#2C3242] text-slate-300 hover:text-white border-white/10' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-200'
              }`}
              title={`Watch ${show.title} on ${show.streamingService}`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Compact, polished release card for Month Matrix Selected Date panel
  const renderMatrixDetailCard = (show: TvShow) => {
    const ep = show.nextEpisode;
    if (!ep) return null;
    const colors = SERVICE_COLORS[show.streamingService] || SERVICE_COLORS['Other'];
    const relativeTime = formatRelativeAirDate(ep.airDate || '');
    const isFuture = isFutureAirDate(ep.airDate);
    const cardId = `cal-matrix-card-${show.id}-${ep.season}-${ep.episode}`;
    const isMenuOpen = activeCalendarMenuId === cardId;

    return (
      <div 
        key={cardId}
        className={`p-2.5 sm:p-3 rounded-2xl border transition relative flex items-start gap-2.5 sm:gap-3 group ${
          theme === 'dark' 
            ? 'bg-[#181B22] border-white/10 hover:border-white/15 shadow-sm' 
            : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
        }`}
      >
        {/* Crisp 16:9 Thumbnail Banner */}
        <div className={`relative w-20 sm:w-24 aspect-[16/10] shrink-0 rounded-xl overflow-hidden border ${
          theme === 'dark' ? 'bg-[#0E1015] border-white/10' : 'bg-slate-100 border-slate-200'
        }`}>
          <img 
            src={getShowBannerImage(show)} 
            alt={show.title}
            className="w-full h-full object-cover"
            style={{ objectPosition: show.bannerPosition || 'center 25%' }}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-1 left-1 pointer-events-none">
            <span className={`px-1 py-0.5 text-[7px] sm:text-[8px] font-black uppercase tracking-wider rounded border ${colors.bg} ${colors.text} ${colors.border}`}>
              {show.streamingService}
            </span>
          </div>
        </div>

        {/* Content Column */}
        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center justify-between gap-1.5">
            <h4 className={`text-xs sm:text-sm font-black truncate leading-tight ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              {show.title}
            </h4>
            <span className={`px-1.5 py-0.5 text-[8px] sm:text-[9px] font-extrabold rounded-md uppercase tracking-wider shrink-0 ${
              theme === 'dark' ? 'bg-blue-500/15 text-blue-300 border border-blue-500/20' : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              S{ep.season}E{ep.episode}
            </span>
          </div>

          <div className={`text-[11px] font-semibold truncate ${
            theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
          }`}>
            {ep.title && !ep.title.toLowerCase().startsWith('episode') ? `"${ep.title}"` : `Episode ${ep.episode}`}
          </div>

          <div className="flex items-center gap-1.5 pt-0.5">
            <span className={`text-[10px] font-extrabold ${
              relativeTime.isToday
                ? 'text-emerald-400'
                : relativeTime.isSoon
                ? theme === 'dark' ? 'text-amber-300' : 'text-amber-700'
                : theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
            }`}>
              {relativeTime.label}
            </span>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-1.5 pt-1 flex-wrap">
            {!isFuture ? (
              <button
                type="button"
                onClick={() => handleMarkWatched(show)}
                className="py-1 px-2 font-bold text-[10px] sm:text-[11px] rounded-xl flex items-center gap-1 transition cursor-pointer active:scale-95 bg-blue-600 hover:bg-blue-500 text-white shadow-xs"
                title="Mark this episode as watched"
              >
                <Check className="w-3 h-3" />
                <span>Watched</span>
              </button>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setActiveCalendarMenuId(isMenuOpen ? null : cardId)}
                  className={`calendar-sync-dropdown-trigger py-1 px-2 font-bold text-[10px] rounded-xl flex items-center gap-1 transition cursor-pointer border ${
                    theme === 'dark'
                      ? 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/10'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                  title="Add to calendar"
                >
                  <CalendarDays className="w-3 h-3 text-blue-400" />
                  <span>Sync</span>
                  <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
                </button>

                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -2, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -2, scale: 0.96 }}
                      transition={{ duration: 0.12 }}
                      className={`calendar-sync-dropdown-menu absolute left-0 top-full mt-1 w-44 rounded-xl border shadow-xl z-30 p-1 space-y-0.5 ${
                        theme === 'dark' ? 'bg-[#1E222B] border-white/10 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSyncGoogle(show)}
                        className={`w-full px-2.5 py-1.5 text-[11px] font-semibold rounded-lg text-left transition flex items-center justify-between cursor-pointer ${
                          theme === 'dark' ? 'hover:bg-white/10 hover:text-white' : 'hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <span>Google Calendar</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSyncAppleIcs(show)}
                        className={`w-full px-2.5 py-1.5 text-[11px] font-semibold rounded-lg text-left transition flex items-center justify-between cursor-pointer ${
                          theme === 'dark' ? 'hover:bg-white/10 hover:text-white' : 'hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <span>Apple Calendar (.ics)</span>
                        <Download className="w-3 h-3 text-slate-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSyncOutlook(show)}
                        className={`w-full px-2.5 py-1.5 text-[11px] font-semibold rounded-lg text-left transition flex items-center justify-between cursor-pointer ${
                          theme === 'dark' ? 'hover:bg-white/10 hover:text-white' : 'hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <span>Outlook Calendar</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                window.open(getStreamingServiceLink(show.streamingService, show.title), '_blank', 'noopener,noreferrer');
              }}
              className={`p-1 rounded-xl border transition flex items-center justify-center cursor-pointer ${
                theme === 'dark' 
                  ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border-white/10' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-200'
              }`}
              title={`Watch ${show.title} on ${show.streamingService}`}
            >
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-black/85 backdrop-blur-sm overflow-hidden pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ duration: 0.2 }}
        className={`relative w-full max-w-5xl h-[100dvh] sm:h-[88vh] max-h-[860px] rounded-none sm:rounded-3xl border-0 sm:border shadow-2xl overflow-hidden flex flex-col ${
          theme === 'dark' ? 'bg-[#14161C] border-white/10 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
        id="tv-calendar-modal"
      >
        {/* Compact, Unified Header Bar (Brand Anchor + View Toggle + Close) */}
        <div className={`py-2 sm:py-3 px-3 sm:px-6 border-b flex items-center justify-between gap-1.5 sm:gap-2 shrink-0 ${
          theme === 'dark' ? 'bg-[#181B22] border-white/10' : 'bg-slate-50 border-slate-200'
        }`}>
          {/* Brand Anchor */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div className="p-1 sm:p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 shrink-0">
              <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5 truncate">
                <span className="text-[11px] sm:text-sm font-black text-blue-500 uppercase tracking-tight">COUCHTATERZ</span>
                <span className={`text-[11px] sm:text-sm font-bold uppercase tracking-tight ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  · Calendar
                </span>
              </div>
            </div>
          </div>

          {/* Right Action Switcher & Controls */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* View Mode Switcher */}
            <div className={`flex items-center p-0.5 rounded-xl border ${
              theme === 'dark' ? 'bg-[#121419] border-white/10' : 'bg-slate-200/80 border-slate-300'
            }`}>
              <button
                type="button"
                onClick={() => setViewMode('timeline')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold rounded-lg transition flex items-center gap-1 sm:gap-1.5 cursor-pointer ${
                  viewMode === 'timeline'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : theme === 'dark'
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="View agenda list"
              >
                <ListFilter className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>List</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('matrix')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold rounded-lg transition flex items-center gap-1 sm:gap-1.5 cursor-pointer ${
                  viewMode === 'matrix'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : theme === 'dark'
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="View month grid"
              >
                <LayoutGrid className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Month</span>
              </button>
            </div>

            {/* Master Export .ics Button */}
            {activeScheduledShows.length > 0 && (
              <button
                type="button"
                onClick={handleExportAllIcs}
                className={`flex items-center gap-1.5 p-1.5 sm:py-1.5 sm:px-3 text-xs font-bold rounded-xl border transition cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/10'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-xs'
                }`}
                title="Download .ics file containing all upcoming episode releases"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden md:inline">Export (.ics)</span>
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className={`p-1.5 sm:p-2 rounded-xl transition cursor-pointer active:scale-95 flex items-center justify-center border ${
                theme === 'dark' ? 'bg-[#252932] hover:bg-[#313642] text-slate-300 hover:text-white border-white/5' : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-200'
              }`}
              title="Close Calendar"
              aria-label="Close Calendar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Compact Sub-bar Controls: Platform Filter + Month Navigation */}
        <div className={`py-1.5 sm:py-2 px-3 sm:px-6 border-b flex flex-nowrap sm:flex-wrap items-center justify-between gap-1.5 sm:gap-2 shrink-0 ${
          theme === 'dark' ? 'bg-[#121419] border-white/5' : 'bg-slate-100/70 border-slate-200'
        }`}>
          {/* Platform Filter */}
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
            <Filter className="w-3 h-3 text-blue-500 shrink-0" />
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value as StreamingService | 'All')}
              className={`border font-bold text-[10px] sm:text-xs rounded-lg px-1.5 sm:px-2 py-1 focus:outline-none transition cursor-pointer max-w-[140px] sm:max-w-none truncate ${
                theme === 'dark' ? 'bg-[#1E2128] border-blue-500/20 text-slate-200 hover:border-blue-500/40' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
              }`}
            >
              <option value="All">All Platforms ({activeScheduledShows.length})</option>
              {streamingServices.map((service, srvIdx) => (
                <option key={`cal-srv-${service}-${srvIdx}`} value={service}>{service}</option>
              ))}
            </select>
          </div>

          {/* Month Controls (when in Month view) or Count summary */}
          {viewMode === 'matrix' ? (
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <div className={`flex items-center gap-0.5 border p-0.5 rounded-lg ${theme === 'dark' ? 'bg-[#1E2128] border-white/5' : 'bg-slate-200/70 border-slate-300'}`}>
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className={`p-1 rounded-md transition cursor-pointer ${theme === 'dark' ? 'hover:bg-[#2C323D] text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-600 hover:text-slate-900'}`}
                  title="Previous Month"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className={`px-1.5 sm:px-2 text-[11px] sm:text-xs font-black uppercase tracking-tight ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                  {MONTH_NAMES[currentMonth].slice(0, 3)} {currentYear}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className={`p-1 rounded-md transition cursor-pointer ${theme === 'dark' ? 'hover:bg-[#2C323D] text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-600 hover:text-slate-900'}`}
                  title="Next Month"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCurrentMonth(today.getMonth());
                  setCurrentYear(today.getFullYear());
                }}
                className={`px-1.5 sm:px-2 py-1 text-[9px] sm:text-[10px] font-black border rounded-lg transition uppercase tracking-wider cursor-pointer ${
                  theme === 'dark' 
                    ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border-blue-500/30' 
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300'
                }`}
                title="Back to current month"
              >
                Today
              </button>

              <button
                onClick={handleJumpToNextAiring}
                className="hidden sm:flex py-1 px-2.5 text-[11px] font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg items-center gap-1 transition cursor-pointer shadow-xs"
                title="Jump to the next upcoming scheduled release"
              >
                <Sparkles className="w-3 h-3" />
                <span>Next Release</span>
              </button>
            </div>
          ) : (
            <div className={`text-[11px] sm:text-xs font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Scheduled Airings: <span className="text-blue-400 font-extrabold">{activeScheduledShows.length}</span>
            </div>
          )}
        </div>

        {/* Viewport Content */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {viewMode === 'timeline' ? (
            /* ========================================================================= */
            /* TIMELINE / LIST VIEW (Agenda Stream)                                      */
            /* ========================================================================= */
            <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-5 max-w-4xl mx-auto w-full">
              {activeScheduledShows.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 space-y-3">
                  <Tv className={`w-10 sm:w-12 h-10 sm:h-12 ${theme === 'dark' ? 'text-slate-700' : 'text-slate-300'} animate-pulse`} />
                  <h4 className={`text-sm sm:text-base font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                    No upcoming air dates found
                  </h4>
                  <p className={`text-xs max-w-md ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>
                    Shows in your active watchlist will display their upcoming season and episode schedules here as new air dates are announced.
                  </p>
                </div>
              ) : (
                <>
                  {/* This Week Section */}
                  {timelineGroups.thisWeek.length > 0 && (
                    <div className="space-y-2 sm:space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <h4 className={`text-xs font-black uppercase tracking-wider ${
                          theme === 'dark' ? 'text-emerald-300' : 'text-emerald-800'
                        }`}>
                          Airing This Week ({timelineGroups.thisWeek.length})
                        </h4>
                      </div>
                      <div className="space-y-2 sm:space-y-2.5">
                        {timelineGroups.thisWeek.map((show) => renderTimelineCard(show))}
                      </div>
                    </div>
                  )}

                  {/* Next Week Section */}
                  {timelineGroups.nextWeek.length > 0 && (
                    <div className="space-y-2 sm:space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400" />
                        <h4 className={`text-xs font-black uppercase tracking-wider ${
                          theme === 'dark' ? 'text-blue-300' : 'text-blue-800'
                        }`}>
                          Airing Next Week ({timelineGroups.nextWeek.length})
                        </h4>
                      </div>
                      <div className="space-y-2 sm:space-y-2.5">
                        {timelineGroups.nextWeek.map((show) => renderTimelineCard(show))}
                      </div>
                    </div>
                  )}

                  {/* Coming Later Section */}
                  {timelineGroups.upcomingLater.length > 0 && (
                    <div className="space-y-2 sm:space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <h4 className={`text-xs font-black uppercase tracking-wider ${
                          theme === 'dark' ? 'text-amber-300' : 'text-amber-800'
                        }`}>
                          Coming Later ({timelineGroups.upcomingLater.length})
                        </h4>
                      </div>
                      <div className="space-y-2 sm:space-y-2.5">
                        {timelineGroups.upcomingLater.map((show) => renderTimelineCard(show))}
                      </div>
                    </div>
                  )}

                  {/* Past / Recent Episodes Section */}
                  {timelineGroups.pastAired.length > 0 && (
                    <div className="space-y-2 sm:space-y-2.5 pt-3 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-slate-500" />
                        <h4 className={`text-xs font-black uppercase tracking-wider ${
                          theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          Aired & Ready to Watch ({timelineGroups.pastAired.length})
                        </h4>
                      </div>
                      <div className="space-y-2 sm:space-y-2.5">
                        {timelineGroups.pastAired.map((show) => renderTimelineCard(show))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            /* ========================================================================= */
            /* MONTH MATRIX VIEW - MOBILE RESPONSIVE SPLIT (Zero Scroll Disconnect)     */
            /* ========================================================================= */
            <div className="flex-1 min-h-0 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/5 overflow-hidden">
              {/* Calendar Grid Pane (Mobile: Compact Fixed Top; Desktop: Expansive Left) */}
              <div className="p-2 sm:p-4 md:p-6 flex flex-col space-y-1.5 sm:space-y-3 shrink-0 md:flex-1 md:overflow-y-auto">
                {/* Day Names Header */}
                <div className={`grid grid-cols-7 gap-1 text-center text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest pb-1 border-b ${
                  theme === 'dark' ? 'text-slate-500 border-white/5' : 'text-slate-600 border-slate-200'
                }`}>
                  <div>Sun</div>
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                </div>

                {/* Days Matrix */}
                <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-7 sm:h-11 md:min-h-[50px] rounded-lg sm:rounded-xl bg-transparent opacity-10" />
                  ))}

                  {Array.from({ length: totalDaysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                    const isToday = today.getFullYear() === currentYear && today.getMonth() === currentMonth && today.getDate() === dayNum;
                    const isSelected = selectedDateKey === dateStr;
                    const dayShows = showsByDate[dateStr] || [];

                    return (
                      <button
                        key={dayNum}
                        type="button"
                        onClick={() => setSelectedDateKey(dateStr)}
                        className={`h-7 sm:h-11 md:min-h-[52px] rounded-lg sm:rounded-xl p-0.5 sm:p-1.5 flex flex-col justify-between items-start transition-all border text-left cursor-pointer group relative ${
                          isToday 
                            ? theme === 'dark'
                              ? 'border-blue-500/60 bg-blue-500/10 shadow-[0_0_10px_rgba(59,130,246,0.15)]' 
                              : 'border-blue-500 bg-blue-50/80 shadow-xs ring-1 ring-blue-400/40'
                            : isSelected
                            ? theme === 'dark'
                              ? 'border-blue-400/50 bg-blue-600/25 text-blue-200 ring-1 ring-blue-400/30'
                              : 'border-blue-600 bg-blue-600 text-white shadow-xs'
                            : theme === 'dark'
                              ? 'border-white/5 bg-[#171A21] hover:bg-[#1C1F28] hover:border-white/10'
                              : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <span className={`text-[8.5px] sm:text-[10px] font-bold leading-none ${
                          isToday 
                            ? theme === 'dark'
                              ? 'text-blue-400 bg-blue-500/20 px-0.5 rounded' 
                              : 'text-blue-700 bg-blue-200/70 px-0.5 rounded font-extrabold'
                            : isSelected 
                            ? 'text-white font-extrabold' 
                            : theme === 'dark'
                              ? 'text-slate-400 group-hover:text-slate-200'
                              : 'text-slate-700 group-hover:text-slate-900'
                        }`}>
                          {dayNum}
                        </span>

                        {/* Release Indicators (Dots on mobile, chips/dots on desktop) */}
                        <div className="w-full flex flex-row flex-wrap gap-0.5 sm:gap-1 mt-0.5 overflow-hidden max-h-[14px]">
                          {dayShows.slice(0, 3).map((s, sIdx) => {
                            const svcColor = SERVICE_COLORS[s.streamingService] || SERVICE_COLORS['Other'];
                            return (
                              <div 
                                key={`${s.id}-${sIdx}`} 
                                className={`w-1.5 h-1.5 rounded-full ${svcColor.accent} shadow-xs shrink-0`}
                                title={`${s.title} - S${s.nextEpisode?.season}E${s.nextEpisode?.episode}`}
                              />
                            );
                          })}
                          {dayShows.length > 3 && (
                            <div className={`text-[7px] sm:text-[8px] font-black leading-none shrink-0 ${
                              isSelected && theme === 'light' ? 'text-blue-100' : 'text-slate-500'
                            }`}>+{dayShows.length - 3}</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Date Releases Details Pane (Instant Visibility on Tap, Scrollable) */}
              <div className={`flex-1 min-h-0 md:w-84 lg:w-96 p-3 sm:p-4 flex flex-col space-y-2.5 overflow-y-auto shrink-0 ${
                theme === 'dark' ? 'bg-[#121419]' : 'bg-slate-50'
              }`}>
                {/* Date header label */}
                <div className={`border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'} pb-2 flex items-center justify-between gap-2 shrink-0`}>
                  <div>
                    <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      <Clock className="w-3 h-3 text-blue-500" /> Releases Scheduled For
                    </span>
                    <p className={`text-xs sm:text-sm font-black mt-0.5 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      {selectedDateKey ? (() => {
                        const [y, m, d] = selectedDateKey.split('-');
                        return `${MONTH_NAMES[Number(m) - 1]} ${Number(d)}, ${y}`;
                      })() : 'Select a date'}
                    </p>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 shrink-0">
                    {selectedDateShows.length} {selectedDateShows.length === 1 ? 'Release' : 'Releases'}
                  </span>
                </div>

                {/* Episode cards list for this date */}
                {selectedDateShows.length === 0 ? (
                  <div className="flex-1 flex flex-col justify-center items-center text-center p-4 space-y-2">
                    <Tv className={`w-8 h-8 ${theme === 'dark' ? 'text-slate-700' : 'text-slate-300'} animate-pulse`} />
                    <p className={`text-xs font-medium leading-relaxed ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>
                      No episodes scheduled for this date.
                    </p>
                    <button
                      type="button"
                      onClick={handleJumpToNextAiring}
                      className="px-2.5 py-1 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Jump to Nearest</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {selectedDateShows.map((show) => renderMatrixDetailCard(show))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className={`py-2 sm:py-2.5 px-3.5 sm:px-6 border-t flex items-center justify-between text-[10px] sm:text-[11px] font-medium shrink-0 ${
          theme === 'dark' ? 'bg-[#14161C] border-white/5 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
            <span className="truncate">Timezone synced with device</span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}>
              CouchTaterz TV Hub
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
