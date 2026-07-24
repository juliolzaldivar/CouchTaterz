/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { TvShow, StreamingService } from '../types';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Tv, 
  Clock, 
  ExternalLink, 
  Check, 
  Play, 
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SERVICE_COLORS } from './ShowCard';

interface ShowCalendarModalProps {
  shows: TvShow[];
  onUpdateShow: (updatedShow: TvShow) => void;
  onClose: () => void;
}

export const ShowCalendarModal: React.FC<ShowCalendarModalProps> = ({
  shows,
  onUpdateShow,
  onClose
}) => {
  // Ref for details panel to support auto-scrolling on mobile
  const detailsRef = React.useRef<HTMLDivElement>(null);

  // Use today as default initialization date
  const today = useMemo(() => new Date(), []);
  
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-indexed
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  );
  
  // Filtering Options
  const [serviceFilter, setServiceFilter] = useState<StreamingService | 'All'>('All');

  // Parse episode air dates into a structured map for fast lookup: "YYYY-MM-DD" -> TvShow[]
  const showsByDate = useMemo(() => {
    const map: Record<string, TvShow[]> = {};
    
    shows.forEach((show) => {
      // Filter out shows without nextEpisode or with concluded status
      if (!show.nextEpisode || !show.nextEpisode.airDate || show.concluded) {
        return;
      }
      
      // Respect active watchlist status only
      if (show.status !== 'Watching') {
        return;
      }
      
      // Respect streaming service filters
      if (serviceFilter !== 'All' && show.streamingService !== serviceFilter) {
        return;
      }

      // Standardize date to YYYY-MM-DD
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
        if (!map[dateStr]) {
          map[dateStr] = [];
        }
        map[dateStr].push(show);
      }
    });

    return map;
  }, [shows, serviceFilter]);

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
    
    // Determine the reference time to search from
    let refTime = todayTime;
    let isCurrentDateARelease = false;

    if (selectedDateKey) {
      const parts = selectedDateKey.split('-');
      if (parts.length === 3) {
        const selectedTime = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime();
        
        // Only use the selected date if it's today or in the future
        if (selectedTime >= todayTime) {
          refTime = selectedTime;
          // Check if the currently selected date is a release date
          if (showsByDate[selectedDateKey] && showsByDate[selectedDateKey].length > 0) {
            isCurrentDateARelease = true;
          }
        }
      }
    }

    let nearestDateStr: string | null = null;
    let nearestTime = Infinity;

    // First, try to find a release date either strictly after or starting from refTime
    Object.keys(showsByDate).forEach((dateKey) => {
      const dateParts = dateKey.split('-');
      if (dateParts.length === 3) {
        const time = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2])).getTime();
        
        const isEligible = isCurrentDateARelease ? (time > refTime) : (time >= refTime);
        
        if (isEligible && time < nearestTime) {
          nearestTime = time;
          nearestDateStr = dateKey;
        }
      }
    });

    // If we didn't find any upcoming release (we are at the end of the list), wrap around to the first upcoming release from today onwards
    if (!nearestDateStr) {
      nearestTime = Infinity;
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
    }

    // If we found a future/upcoming date, navigate to it!
    if (nearestDateStr) {
      const [y, m, d] = (nearestDateStr as string).split('-');
      const targetYear = Number(y);
      const targetMonth = Number(m) - 1; // 0-indexed
      
      setCurrentYear(targetYear);
      setCurrentMonth(targetMonth);
      setSelectedDateKey(nearestDateStr);
    }
  };

  // Check if there are any shows airing in the current visible month
  const hasAiringShowsInVisibleMonth = useMemo(() => {
    const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-`;
    return Object.keys(showsByDate).some((key) => key.startsWith(monthPrefix));
  }, [currentYear, currentMonth, showsByDate]);

  // List of unique streaming services among shows to filter
  const streamingServices: StreamingService[] = [
    'HBO', 'Disney+', 'Prime Video', 'Netflix', 'Hulu', 'Paramount+', 'Apple TV', 'Peacock', 'AMC+', 'Other'
  ];

  // Selected date's airing shows
  const selectedDateShows = selectedDateKey ? showsByDate[selectedDateKey] || [] : [];

  // Scroll to details on mobile when a date with shows is selected
  React.useEffect(() => {
    if (selectedDateKey && showsByDate[selectedDateKey]?.length > 0) {
      if (window.innerWidth < 768) {
        const timer = setTimeout(() => {
          detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
        return () => clearTimeout(timer);
      }
    }
  }, [selectedDateKey, showsByDate]);

  // Helper to mark episode as watched from calendar and advance/conclude progress
  const handleMarkWatched = (show: TvShow) => {
    if (!show.nextEpisode) return;
    
    const wasNext = show.nextEpisode;
    
    // Bump latest watched to this episode
    const updatedLatest = {
      season: wasNext.season,
      episode: wasNext.episode,
      title: wasNext.title
    };

    // Calculate a plausible next episode, or ask AI agent / or default to next episode number
    const updatedNext = {
      season: wasNext.season,
      episode: wasNext.episode + 1,
      title: `Episode ${wasNext.episode + 1}`,
      // Increment date by exactly 7 days for weekly shows, or mark as TBD
      airDate: show.concluded ? '' : new Date(new Date(wasNext.airDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    const updatedShow: TvShow = {
      ...show,
      latestWatched: updatedLatest,
      nextEpisode: updatedNext,
    };

    onUpdateShow(updatedShow);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-5xl rounded-3xl bg-[#14161C] border border-white/5 text-slate-100 shadow-2xl overflow-hidden flex flex-col h-[90vh] md:h-[80vh]"
        id="tv-calendar-modal"
      >
        {/* Header */}
        <div className="py-2.5 px-4 border-b border-white/5 flex items-center justify-between bg-[#181B22] shrink-0">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-blue-400 shrink-0" />
            <h3 className="text-xs md:text-sm font-black tracking-tight uppercase text-white">
              CouchTaterz Release Calendar
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#252932] hover:bg-[#313642] text-slate-400 hover:text-white transition"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dedicated Row for Jump to Next Release */}
        <div className="py-2 px-4 border-b border-white/5 bg-[#171A21] flex items-center shrink-0">
          <button
            onClick={handleJumpToNextAiring}
            className="w-full py-1.5 px-3 text-[10px] font-extrabold bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-950/20"
            title="Locate the closest upcoming release across all months"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Jump to Next Release</span>
          </button>
        </div>

        {/* Filters and Stats bar */}
        <div className="py-2 px-4 border-b border-white/5 bg-[#121419] flex flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>

            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value as StreamingService | 'All')}
              className="bg-[#1E2128] border border-white/5 hover:border-white/10 text-slate-300 font-bold text-[10px] rounded-xl px-2.5 py-1 focus:outline-none transition cursor-pointer"
            >
              <option value="All">All Platforms</option>
              {streamingServices.map((service) => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>

          <div className="text-[10px] text-slate-400 font-bold">
            Total: <span className="text-white bg-blue-600/20 border border-blue-500/20 px-1.5 py-0.5 rounded">{Object.values(showsByDate).flat().length}</span>
          </div>
        </div>

        {/* Content body divided into Grid layout (Calendar Left, Details Right) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
          {/* Left panel: Calendar Grid */}
          <div className="w-full md:flex-1 p-3 md:p-4 flex flex-col space-y-3 md:border-r border-white/5 md:overflow-y-auto shrink-0 md:shrink">
            {/* Calendar controller header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h4 className="text-xs md:text-sm font-black text-white uppercase tracking-tight">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </h4>
                {!hasAiringShowsInVisibleMonth && (
                  <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    No Airings
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 bg-[#1E2128] border border-white/5 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 md:p-1.5 hover:bg-[#2C323D] text-slate-400 hover:text-white rounded-lg transition"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentMonth(today.getMonth());
                    setCurrentYear(today.getFullYear());
                  }}
                  className="px-2 md:px-2.5 py-1 text-[9px] md:text-[10px] font-black hover:bg-[#2C323D] text-slate-300 hover:text-white rounded-lg transition uppercase tracking-wider"
                  title="Back to current month"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 md:p-1.5 hover:bg-[#2C323D] text-slate-400 hover:text-white rounded-lg transition"
                  title="Next Month"
                >
                  <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
              </div>
            </div>

            {/* Calendar grid */}
            <div className="flex-1 flex flex-col">
              {/* Day names headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-[9px] md:text-[10px] font-extrabold uppercase tracking-widest text-slate-500 pb-1.5 border-b border-white/5">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-7 gap-1 pt-1.5 flex-1">
                {/* Offset / Padding for starting day of the month */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[40px] sm:min-h-[48px] md:min-h-[64px] rounded-xl bg-transparent opacity-10 border border-transparent" />
                ))}

                {/* Days of current month */}
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
                      className={`min-h-[40px] sm:min-h-[48px] md:min-h-[64px] rounded-xl p-1 md:p-1.5 flex flex-col justify-between items-start transition-all border text-left cursor-pointer group relative ${
                        isToday 
                          ? 'border-blue-500/50 bg-blue-500/5 shadow-[0_0_12px_rgba(59,130,246,0.1)]' 
                          : isSelected
                          ? 'border-white/30 bg-[#252932]'
                          : 'border-white/5 bg-[#171A21] hover:bg-[#1C1F28] hover:border-white/10'
                      }`}
                    >
                      {/* Day digit */}
                      <span className={`text-[9px] md:text-[10px] font-bold ${
                        isToday ? 'text-blue-400 bg-blue-500/20 px-1 rounded' : isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                      }`}>
                        {dayNum}
                      </span>

                      {/* Episode items list dot/mini-badges inside cell */}
                      <div className="w-full flex flex-row flex-wrap gap-0.5 mt-0.5 overflow-hidden max-h-[14px] md:max-h-[36px]">
                        {dayShows.slice(0, 4).map((show, sIdx) => {
                          const svcColor = SERVICE_COLORS[show.streamingService] || SERVICE_COLORS['Other'];
                          return (
                            <div 
                              key={`${show.id}-${sIdx}`} 
                              className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${svcColor.accent} shadow-sm shrink-0`}
                              title={`${show.title} - S${show.nextEpisode?.season}E${show.nextEpisode?.episode}`}
                            />
                          );
                        })}
                        {dayShows.length > 4 && (
                          <div className="text-[6px] md:text-[7px] text-slate-500 font-black leading-none shrink-0">+{dayShows.length - 4}</div>
                        )}
                      </div>

                      {/* Hover text label for desktop */}
                      {dayShows.length > 0 && (
                        <div className="absolute right-1 top-1 w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right panel: Details of Selected Date */}
          <div ref={detailsRef} className="w-full md:w-80 bg-[#121419] p-4 md:p-5 flex flex-col space-y-4 md:overflow-y-auto border-t md:border-t-0 border-white/5 shrink-0">
            <div className="border-b border-white/5 pb-3">
              <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" /> Releases Airing On
              </h4>
              <p className="text-xs font-black text-white mt-1">
                {selectedDateKey ? (() => {
                  const [y, m, d] = selectedDateKey.split('-');
                  return `${MONTH_NAMES[Number(m) - 1]} ${Number(d)}, ${y}`;
                })() : 'Select a date'}
              </p>
            </div>

            {selectedDateShows.length === 0 ? (
              <div className="flex-1 flex flex-col justify-center items-center text-center p-6 space-y-3">
                <Tv className="w-10 h-10 text-slate-700 animate-pulse" />
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  No shows or upcoming episodes scheduled to release on this day.
                </p>
                <p className="text-[10px] text-slate-600 leading-relaxed">
                  Pick highlighted days or change filters to discover more releases.
                </p>
              </div>
            ) : (
              <div className="flex-1 space-y-4">
                {selectedDateShows.map((show, sIdx) => {
                  const colors = SERVICE_COLORS[show.streamingService] || SERVICE_COLORS['Other'];
                  return (
                    <div 
                      key={`${show.id}-${sIdx}`}
                      className="p-3.5 rounded-2xl bg-[#1A1D23] border border-white/5 hover:border-white/10 transition flex flex-col gap-3"
                    >
                      {/* Card layout inside detail */}
                      <div className="flex items-start gap-3">
                        <img 
                          src={show.bannerImage} 
                          alt={show.title}
                          className="w-16 h-10 rounded-lg object-cover bg-slate-800 border border-white/5"
                          style={{ objectPosition: show.bannerPosition || 'center 25%' }}
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-bold text-white truncate leading-snug">{show.title}</h5>
                          <span className={`inline-block px-1.5 py-0.5 mt-1 text-[8px] font-black uppercase tracking-wider rounded border ${colors.bg} ${colors.text} ${colors.border}`}>
                            {show.streamingService}
                          </span>
                        </div>
                      </div>

                      {/* Episode specifics */}
                      <div className="p-2.5 rounded-xl bg-[#20242D] border border-white/5 text-[11px] space-y-1.5">
                        <div className="font-extrabold text-blue-400">
                          Season {show.nextEpisode?.season}, Episode {show.nextEpisode?.episode}
                        </div>
                        <div className="font-medium text-slate-200">
                          "{show.nextEpisode?.title}"
                        </div>
                        {show.nextEpisode?.airDate && (
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3 text-slate-500" /> Airing: {show.nextEpisode.airDate}
                          </div>
                        )}
                      </div>

                      {/* Detailed Actions */}
                      <div className="flex items-center gap-2 pt-1.5">
                        <button
                          onClick={() => handleMarkWatched(show)}
                          className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[10px] rounded-xl flex items-center justify-center gap-1 transition"
                          title="Click to bump watched progress to this episode"
                        >
                          <Check className="w-3 h-3" />
                          <span>Mark Watched</span>
                        </button>

                        <button
                          onClick={() => {
                            // Find corresponding service URL or fall back
                            const serviceUrls: Record<StreamingService, string> = {
                              'Netflix': 'https://www.netflix.com',
                              'HBO': 'https://www.max.com',
                              'Disney+': 'https://www.disneyplus.com',
                              'Prime Video': 'https://www.amazon.com/primevideo',
                              'Hulu': 'https://www.hulu.com',
                              'Paramount+': 'https://www.paramountplus.com',
                              'Apple TV': 'https://tv.apple.com',
                              'Peacock': 'https://www.peacocktv.com',
                              'AMC+': 'https://www.amcplus.com',
                              'Other': 'https://google.com'
                            };
                            window.open(serviceUrls[show.streamingService] || 'https://google.com', '_blank');
                          }}
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/5 transition flex items-center justify-center"
                          title={`Launch ${show.streamingService}`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#14161C] border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Automatic timezone alignment enabled</span>
          </div>
          <span>CouchTaterz Release Tracker</span>
        </div>
      </motion.div>
    </div>
  );
};
