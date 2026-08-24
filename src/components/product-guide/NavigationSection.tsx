import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Users, Sparkles, Check, BookmarkPlus, 
  ArrowRight, Tv, Calendar, Moon, Sun, ChevronLeft, ChevronRight, ChevronDown, Clock, Star, Play,
  LayoutList, CalendarDays, Download, ExternalLink, Filter, UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { JULIO_OFFICIAL_AVATAR } from '../../utils/taterAvatarUtils';
import { generateIcsContent, downloadIcsFile, generateGoogleCalendarUrl, generateOutlookCalendarUrl, CalendarEventInfo } from '../../utils/calendarSync';

interface NavigationSectionProps {
  demoTheme: 'dark' | 'light';
  setDemoTheme: (theme: 'dark' | 'light') => void;
  addShowTab: 'search' | 'buddy_picks';
  setAddShowTab: (tab: 'search' | 'buddy_picks') => void;
  demoSearchQuery: string;
  setDemoSearchQuery: (q: string) => void;
  addedShowsList: string[];
  setAddedShowsList: React.Dispatch<React.SetStateAction<string[]>>;
  showNotification: (msg: string) => void;
  handleActionClick: (target: any) => void;
  activeCalendarMonth: number;
  setActiveCalendarMonth: (m: number) => void;
  selectedCalendarDay: number;
  setSelectedCalendarDay: (d: number) => void;
}

export const NavigationSection: React.FC<NavigationSectionProps> = React.memo(({
  demoTheme,
  setDemoTheme,
  addShowTab,
  setAddShowTab,
  demoSearchQuery,
  setDemoSearchQuery,
  addedShowsList,
  setAddedShowsList,
  showNotification,
  handleActionClick,
  activeCalendarMonth,
  setActiveCalendarMonth,
  selectedCalendarDay,
  setSelectedCalendarDay
}) => {
  const [selectedStage, setSelectedStage] = useState<'Watching' | 'Up Next' | 'Watched'>('Watching');
  const [radarViewMode, setRadarViewMode] = useState<'calendar' | 'list'>('calendar');
  const [radarServiceFilter, setRadarServiceFilter] = useState<string>('All');
  const [activeSyncDropdownId, setActiveSyncDropdownId] = useState<string | null>(null);

  const catalogShows = [
    {
      id: 'sev',
      title: 'Severance',
      season: 'Season 2',
      platform: 'Apple TV+',
      platformColor: 'bg-slate-800 text-slate-200 border-slate-700',
      rtScore: '98%',
      genre: 'Sci-Fi / Thriller',
      posterInitials: 'SEV',
      posterBg: 'bg-gradient-to-br from-blue-600 to-indigo-900',
      summary: 'Mark leads a team of office workers whose memories have been surgically divided.'
    },
    {
      id: 'bear',
      title: 'The Bear',
      season: 'Season 3',
      platform: 'Hulu / FX',
      platformColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
      rtScore: '99%',
      genre: 'Culinary Drama',
      posterInitials: 'BEAR',
      posterBg: 'bg-gradient-to-br from-emerald-600 to-teal-900',
      summary: 'A young fine-dining chef comes home to run his family Italian beef sandwich shop.'
    },
    {
      id: 'shog',
      title: 'Shōgun',
      season: 'Season 1',
      platform: 'Hulu / FX',
      platformColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
      rtScore: '99%',
      genre: 'Historical Drama',
      posterInitials: 'SHOG',
      posterBg: 'bg-gradient-to-br from-purple-700 to-slate-900',
      summary: 'In feudal Japan, Lord Yoshii Toranaga fights for his life as enemies unite against him.'
    },
    {
      id: 'lotus',
      title: 'The White Lotus',
      season: 'Season 3',
      platform: 'HBO Max',
      platformColor: 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60',
      rtScore: '94%',
      genre: 'Satirical Comedy / Drama',
      posterInitials: 'LOTUS',
      posterBg: 'bg-gradient-to-br from-amber-600 to-pink-900',
      summary: 'A sharp social satire following the exploits of various guests and employees at a luxury resort.'
    }
  ];

  // Comprehensive synchronized air date drops shared between Calendar Grid & Chronological List
  const allReleases = useMemo(() => [
    // FEBRUARY 2026 (Month index 1)
    {
      id: 'sev-2',
      title: 'Severance',
      season: 2,
      episode: 2,
      episodeTitle: 'Hello, Innie',
      monthIndex: 1,
      day: 6,
      airDate: 'Friday, Feb 6',
      relativeTime: 'Past Release',
      isToday: false,
      isFuture: false,
      group: 'past',
      groupLabel: 'Past Broadcasts',
      platform: 'Apple TV+',
      platformColor: 'bg-slate-800 text-slate-200 border-slate-700',
      bannerImg: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNACrAMoLkgMH0e47maB2DZ7OeMG3ZWBtuheU7rgkUdg&s=10'
    },
    {
      id: 'sev-3',
      title: 'Severance',
      season: 2,
      episode: 3,
      episodeTitle: 'Who Is She?',
      monthIndex: 1,
      day: 13,
      airDate: 'Friday, Feb 13',
      relativeTime: 'Past Release',
      isToday: false,
      isFuture: false,
      group: 'past',
      groupLabel: 'Past Broadcasts',
      platform: 'Apple TV+',
      platformColor: 'bg-slate-800 text-slate-200 border-slate-700',
      bannerImg: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNACrAMoLkgMH0e47maB2DZ7OeMG3ZWBtuheU7rgkUdg&s=10'
    },
    {
      id: 'sev-4',
      title: 'Severance',
      season: 2,
      episode: 4,
      episodeTitle: 'Woe',
      monthIndex: 1,
      day: 20,
      airDate: 'Friday, Feb 20',
      relativeTime: 'Past Release',
      isToday: false,
      isFuture: false,
      group: 'past',
      groupLabel: 'Past Broadcasts',
      platform: 'Apple TV+',
      platformColor: 'bg-slate-800 text-slate-200 border-slate-700',
      bannerImg: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNACrAMoLkgMH0e47maB2DZ7OeMG3ZWBtuheU7rgkUdg&s=10'
    },
    {
      id: 'sev-5',
      title: 'Severance',
      season: 2,
      episode: 5,
      episodeTitle: 'The Grim Barbarity',
      monthIndex: 1,
      day: 28,
      airDate: 'Friday, Feb 28',
      relativeTime: 'Tonight at 9:00 PM',
      isToday: true,
      isFuture: true,
      group: 'thisWeek',
      groupLabel: 'Airing This Week',
      platform: 'Apple TV+',
      platformColor: 'bg-slate-800 text-slate-200 border-slate-700',
      bannerImg: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNACrAMoLkgMH0e47maB2DZ7OeMG3ZWBtuheU7rgkUdg&s=10'
    },

    // MARCH 2026 (Month index 2)
    {
      id: 'bear-7',
      title: 'The Bear',
      season: 3,
      episode: 7,
      episodeTitle: 'Legacy',
      monthIndex: 2,
      day: 4,
      airDate: 'Wednesday, Mar 4',
      relativeTime: 'In 3 Days',
      isToday: false,
      isFuture: true,
      group: 'thisWeek',
      groupLabel: 'Airing This Week',
      platform: 'Hulu',
      platformColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
      bannerImg: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLSxpFNAmFk_IZGbaryDs3GkM5lnyWEjGt6USNocYJPA&s=10'
    },
    {
      id: 'sev-6',
      title: 'Severance',
      season: 2,
      episode: 6,
      episodeTitle: 'Attitude Adjustment',
      monthIndex: 2,
      day: 6,
      airDate: 'Friday, Mar 6',
      relativeTime: 'Next Friday',
      isToday: false,
      isFuture: true,
      group: 'nextWeek',
      groupLabel: 'Airing Next Week',
      platform: 'Apple TV+',
      platformColor: 'bg-slate-800 text-slate-200 border-slate-700',
      bannerImg: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNACrAMoLkgMH0e47maB2DZ7OeMG3ZWBtuheU7rgkUdg&s=10'
    },
    {
      id: 'lotus-2',
      title: 'The White Lotus',
      season: 3,
      episode: 2,
      episodeTitle: 'Special Offerings',
      monthIndex: 2,
      day: 8,
      airDate: 'Sunday, Mar 8',
      relativeTime: 'Next Sunday (9:00 PM)',
      isToday: false,
      isFuture: true,
      group: 'nextWeek',
      groupLabel: 'Airing Next Week',
      platform: 'Max',
      platformColor: 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60',
      bannerImg: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4CAM-wqcRw4IGHQqCO8buc7syl9Xps3udfelzvffwiQ&s=10'
    },
    {
      id: 'sev-7',
      title: 'Severance',
      season: 2,
      episode: 7,
      episodeTitle: 'Chikhai Bardo',
      monthIndex: 2,
      day: 13,
      airDate: 'Friday, Mar 13',
      relativeTime: 'In 2 Weeks',
      isToday: false,
      isFuture: true,
      group: 'upcomingLater',
      groupLabel: 'Coming Later',
      platform: 'Apple TV+',
      platformColor: 'bg-slate-800 text-slate-200 border-slate-700',
      bannerImg: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNACrAMoLkgMH0e47maB2DZ7OeMG3ZWBtuheU7rgkUdg&s=10'
    },
    {
      id: 'shogun-8',
      title: 'Shōgun',
      season: 2,
      episode: 1,
      episodeTitle: 'A Tide of Shadows',
      monthIndex: 2,
      day: 17,
      airDate: 'Tuesday, Mar 17',
      relativeTime: 'In 2 Weeks',
      isToday: false,
      isFuture: true,
      group: 'upcomingLater',
      groupLabel: 'Coming Later',
      platform: 'Hulu',
      platformColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
      bannerImg: 'https://image.tmdb.org/t/p/w1280/6Tb87q9Tog30F5AAHh1gyDT2Vve.jpg'
    },
    {
      id: 'sev-8',
      title: 'Severance',
      season: 2,
      episode: 8,
      episodeTitle: 'Sweet Vitriol',
      monthIndex: 2,
      day: 20,
      airDate: 'Friday, Mar 20',
      relativeTime: 'In 3 Weeks',
      isToday: false,
      isFuture: true,
      group: 'upcomingLater',
      groupLabel: 'Coming Later',
      platform: 'Apple TV+',
      platformColor: 'bg-slate-800 text-slate-200 border-slate-700',
      bannerImg: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNACrAMoLkgMH0e47maB2DZ7OeMG3ZWBtuheU7rgkUdg&s=10'
    },
    {
      id: 'st-5',
      title: 'Stranger Things',
      season: 5,
      episode: 1,
      episodeTitle: 'The Crawl',
      monthIndex: 2,
      day: 26,
      airDate: 'Thursday, Mar 26',
      relativeTime: 'Next Month',
      isToday: false,
      isFuture: true,
      group: 'upcomingLater',
      groupLabel: 'Coming Later',
      platform: 'Netflix',
      platformColor: 'bg-red-950/80 text-red-300 border-red-800/60',
      bannerImg: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4Qf7wolgUB7X37sMbkSd93bUJlubb_qNmozDnQtHp4Q&s=10'
    },
    {
      id: 'sev-9',
      title: 'Severance',
      season: 2,
      episode: 9,
      episodeTitle: 'The Aftermath',
      monthIndex: 2,
      day: 27,
      airDate: 'Friday, Mar 27',
      relativeTime: 'Season Finale',
      isToday: false,
      isFuture: true,
      group: 'upcomingLater',
      groupLabel: 'Coming Later',
      platform: 'Apple TV+',
      platformColor: 'bg-slate-800 text-slate-200 border-slate-700',
      bannerImg: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNACrAMoLkgMH0e47maB2DZ7OeMG3ZWBtuheU7rgkUdg&s=10'
    }
  ], []);

  // Filter releases by active streaming service
  const filteredReleases = useMemo(() => {
    return allReleases.filter(item => 
      radarServiceFilter === 'All' || item.platform.toLowerCase().includes(radarServiceFilter.toLowerCase())
    );
  }, [allReleases, radarServiceFilter]);

  // Calendar calculations based on activeCalendarMonth (1 = Feb, 2 = Mar)
  const monthData = useMemo(() => {
    const monthNames = ['January', 'February', 'March', 'April', 'May'];
    const totalDaysMap = [31, 28, 31, 30, 31];
    // 2026 month start day-of-week offsets (0 = Monday, 6 = Sunday)
    // Jan 1: Thu (3), Feb 1: Sun (6), Mar 1: Sun (6), Apr 1: Wed (2), May 1: Fri (4)
    const monthOffsetMap = [3, 6, 6, 2, 4];

    const currentMonthIndex = Math.min(4, Math.max(0, activeCalendarMonth));
    const name = monthNames[currentMonthIndex];
    const totalDays = totalDaysMap[currentMonthIndex];
    const startOffset = monthOffsetMap[currentMonthIndex];

    // Releases in the active month
    const monthReleases = filteredReleases.filter(r => r.monthIndex === currentMonthIndex);
    const dayReleaseMap: Record<number, typeof allReleases> = {};
    monthReleases.forEach(r => {
      if (!dayReleaseMap[r.day]) {
        dayReleaseMap[r.day] = [];
      }
      dayReleaseMap[r.day].push(r);
    });

    return {
      name,
      totalDays,
      startOffset,
      monthReleases,
      dayReleaseMap
    };
  }, [activeCalendarMonth, filteredReleases]);

  // Active selected day's drops in the current month
  const selectedDayDrops = useMemo(() => {
    return monthData.dayReleaseMap[selectedCalendarDay] || [];
  }, [monthData, selectedCalendarDay]);

  const filteredCatalog = catalogShows.filter(s => 
    s.title.toLowerCase().includes(demoSearchQuery.toLowerCase()) ||
    s.genre.toLowerCase().includes(demoSearchQuery.toLowerCase()) ||
    s.platform.toLowerCase().includes(demoSearchQuery.toLowerCase())
  );

  const buddyPicks = [
    {
      friendName: 'Julio Zaldivar (JLZ)',
      friendHandle: '@julio_lz',
      avatarSeed: 'Julio',
      rating: '9.8',
      title: 'Severance (Season 2)',
      platform: 'Apple TV+',
      quote: 'The severed floor reveal in episode 3 is pure genius. Incredible cinematography and pacing.'
    },
    {
      friendName: 'AnnaDee',
      friendHandle: '@annadee',
      avatarSeed: 'AnnaDee',
      rating: '9.5',
      title: 'The Bear (Season 3)',
      platform: 'Hulu / FX',
      quote: 'Intense kitchen choreography. The episode 1 montage was breathtaking.'
    },
    {
      friendName: 'Rafael M.',
      friendHandle: '@rafael_m',
      avatarSeed: 'Rafael',
      rating: '9.2',
      title: 'The White Lotus (Season 3)',
      platform: 'HBO Max',
      quote: 'Thailand setting is gorgeous. Mike White delivered another sharp social masterpiece.'
    }
  ];

  const handleAddShowToBoard = (title: string, stage: string, friendSource?: string) => {
    if (!addedShowsList.includes(title)) {
      setAddedShowsList([...addedShowsList, title]);
    }
    const msg = friendSource
      ? `Borrowed "${title}" from ${friendSource} -> Added to ${stage}!`
      : `Added "${title}" directly to ${stage}!`;
    showNotification(msg);
  };

  // Master schedule ICS export for the guide
  const handleExportAllIcs = () => {
    const events: CalendarEventInfo[] = allReleases.map(r => ({
      showTitle: r.title,
      season: r.season,
      episode: r.episode,
      episodeTitle: r.episodeTitle,
      airDate: `2026-${String(r.monthIndex + 1).padStart(2, '0')}-${String(r.day).padStart(2, '0')}`,
      streamingService: r.platform,
      overview: `Episode ${r.episode} of ${r.title} (Season ${r.season}) on ${r.platform}`
    }));

    const icsString = generateIcsContent(events);
    downloadIcsFile('couchtaterz_tv_schedule.ics', icsString);
    showNotification('Downloaded full CouchTaterz TV release calendar (.ics) to your device!');
  };

  const handleSyncSingleEpisodeIcs = (show: typeof allReleases[0]) => {
    const event: CalendarEventInfo = {
      showTitle: show.title,
      season: show.season,
      episode: show.episode,
      episodeTitle: show.episodeTitle,
      airDate: `2026-${String(show.monthIndex + 1).padStart(2, '0')}-${String(show.day).padStart(2, '0')}`,
      streamingService: show.platform,
      overview: `Season ${show.season}, Episode ${show.episode}: "${show.episodeTitle}" airing on ${show.platform}`
    };
    const icsString = generateIcsContent([event]);
    const cleanTitle = show.title.replace(/[^a-zA-Z0-9]/g, '_');
    downloadIcsFile(`${cleanTitle}_S${show.season}E${show.episode}.ics`, icsString);
    showNotification(`Downloaded ${show.title} S${show.season}E${show.episode} (.ics) to your device!`);
    setActiveSyncDropdownId(null);
  };

  const handleSyncGoogle = (show: typeof allReleases[0]) => {
    const event: CalendarEventInfo = {
      showTitle: show.title,
      season: show.season,
      episode: show.episode,
      episodeTitle: show.episodeTitle,
      airDate: `2026-${String(show.monthIndex + 1).padStart(2, '0')}-${String(show.day).padStart(2, '0')}`,
      streamingService: show.platform,
      overview: `Season ${show.season}, Episode ${show.episode}: "${show.episodeTitle}" airing on ${show.platform}`
    };
    const url = generateGoogleCalendarUrl(event);
    window.open(url, '_blank', 'noopener,noreferrer');
    setActiveSyncDropdownId(null);
  };

  const handleSyncOutlook = (show: typeof allReleases[0]) => {
    const event: CalendarEventInfo = {
      showTitle: show.title,
      season: show.season,
      episode: show.episode,
      episodeTitle: show.episodeTitle,
      airDate: `2026-${String(show.monthIndex + 1).padStart(2, '0')}-${String(show.day).padStart(2, '0')}`,
      streamingService: show.platform,
      overview: `Season ${show.season}, Episode ${show.episode}: "${show.episodeTitle}" airing on ${show.platform}`
    };
    const url = generateOutlookCalendarUrl(event);
    window.open(url, '_blank', 'noopener,noreferrer');
    setActiveSyncDropdownId(null);
  };

  return (
    <section id="doc-section-navigation" className="space-y-10 scroll-mt-28">
      
      {/* SECTION TITLE & BADGE */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-black uppercase tracking-wider border border-blue-500/25">
          <Plus className="w-3.5 h-3.5 text-blue-400" />
          <span>Section 01 &bull; Discovery & Ingestion</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          1. Adding Content & Shows
        </h2>
        <p className="text-base text-slate-300 font-medium max-w-3xl leading-relaxed">
          Two primary discovery pathways allow you to curate and populate your active rotation without clutter: search millions of titles in the global catalog, or leverage your Binge Buddies network through two frictionless friend-vetted borrowing methods.
        </p>
      </div>

      {/* PRIMARY CARD: TWO CORE PATHWAYS & THREE DIRECT ENTRY POINTS */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl shadow-blue-950/20 space-y-7 backdrop-blur-xl">
        
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Plus className="w-4 h-4" />
              </div>
              <span>Two Core Pathways & Three Direct Entry Points</span>
            </h3>
            <button
              onClick={() => handleActionClick('add_show')}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-600/25 cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Launch Live "+ Add Shows" Modal</span>
            </button>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            CouchTaterz is designed for rapid, friction-free show discovery. You can curate your queue through two primary discovery pathways (featuring three direct entry points):
          </p>
        </div>

        {/* 3 ENTRY METHODS GRID WITH AUTHENTIC UI VISUAL PREVIEWS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* Pathway 1: Global Search */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/90 border border-slate-800/90 space-y-4 relative overflow-hidden group hover:border-blue-500/50 transition-all flex flex-col justify-between shadow-lg">
            
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-slate-200 font-black text-sm">
                  <div className="w-6 h-6 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center text-xs font-black">
                    1
                  </div>
                  <span className="flex items-center gap-1.5 text-white font-bold text-sm">
                    <Search className="w-4 h-4 text-blue-400" />
                    <span>Global Search</span>
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/25 font-bold">
                  Catalog Modal
                </span>
              </div>

              {/* Visual UI Preview: Blue Add Show Button & Search Box */}
              <div className="p-3.5 rounded-xl bg-slate-900/95 border border-slate-800 space-y-2.5 shadow-inner">
                <div className="flex items-center justify-between gap-2">
                  {/* Real Blue "+ Add Shows" Button Visual */}
                  <div className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30 ring-1 ring-blue-400/40">
                    <Plus className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                    <span>+ Add Shows</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    Header & Nav
                  </span>
                </div>

                {/* Simulated Search Input */}
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700/80 text-xs text-slate-300">
                  <Search className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="text-slate-200 font-medium">Severance</span>
                  <span className="w-1.5 h-3.5 bg-blue-400 animate-pulse rounded-xs" />
                  <span className="ml-auto text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30">
                    🍅 98%
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[9.5px] text-slate-400 font-medium">
                  <span className="text-slate-500">Filters:</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">Apple TV+</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">Max</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">Netflix</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Click <strong>"+ Add Shows"</strong> in the dashboard header or bottom nav. Search millions of titles with instant auto-suggestions, Rotten Tomatoes scores, and provider badges.
              </p>
            </div>

            <button
              onClick={() => handleActionClick('add_show')}
              className="w-full py-2 rounded-xl bg-blue-600/15 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              <span>Test Global Search Modal</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Pathway 2A: Buddy's Picks Tab */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/90 border border-slate-800/90 space-y-4 relative overflow-hidden group hover:border-purple-500/50 transition-all flex flex-col justify-between shadow-lg">
            
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-slate-200 font-black text-sm">
                  <div className="w-6 h-6 rounded-lg bg-purple-600/20 border border-purple-500/40 text-purple-400 flex items-center justify-center text-xs font-black">
                    2A
                  </div>
                  <span className="flex items-center gap-1.5 text-white font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Buddy's Picks Tab</span>
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/25 font-bold">
                  In-Modal Social
                </span>
              </div>

              {/* Visual UI Preview: Purple Buddy's Picks Tab with Avatars */}
              <div className="p-3.5 rounded-xl bg-slate-900/95 border border-slate-800 space-y-2.5 shadow-inner">
                <div className="flex items-center justify-between gap-2">
                  {/* Real Purple "Buddy's Picks" Tab Visual */}
                  <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 ring-1 ring-purple-400/40">
                    <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                    <span>Buddy's Picks (5)</span>
                  </div>
                  
                  {/* Friend Avatars Cluster */}
                  <div className="flex items-center -space-x-1.5">
                    <img 
                      src={JULIO_OFFICIAL_AVATAR} 
                      alt="Julio" 
                      className="w-5 h-5 rounded-full border border-slate-900 ring-1 ring-purple-400/50" 
                      referrerPolicy="no-referrer"
                    />
                    <img 
                      src="https://api.dicebear.com/7.x/pixel-art/svg?seed=AnnaDee" 
                      alt="AnnaDee" 
                      className="w-5 h-5 rounded-full border border-slate-900 ring-1 ring-purple-400/50" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="w-5 h-5 rounded-full bg-indigo-700 text-[8px] font-black text-white flex items-center justify-center border border-slate-900">
                      +3
                    </div>
                  </div>
                </div>

                {/* Friend Recommended Card Preview */}
                <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-950 border border-purple-500/25">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-8 rounded bg-slate-800 overflow-hidden shrink-0">
                      <img 
                        src="https://image.tmdb.org/t/p/w1280/6Tb87q9Tog30F5AAHh1gyDT2Vve.jpg" 
                        alt="Shogun"
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-white leading-tight">Shōgun</span>
                      <span className="text-[9px] text-purple-300 font-medium">★ 9.8 • Julio's Top Pick</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-600/30 text-purple-200 border border-purple-400/40 font-bold shrink-0">
                    + Borrow
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Inside the Add Shows modal, click the <strong>Buddy's Picks</strong> tab. Browse trusted titles curated and rated by your inner circle and 1-click borrow them into your queue.
              </p>
            </div>

            <button
              onClick={() => handleActionClick('add_show')}
              className="w-full py-2 rounded-xl bg-purple-600/15 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              <span>Explore Buddy's Picks</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Pathway 2B: Binge Buddies Dropdown */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/90 border border-slate-800/90 space-y-4 relative overflow-hidden group hover:border-sky-500/50 transition-all flex flex-col justify-between shadow-lg">
            
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-slate-200 font-black text-sm">
                  <div className="w-6 h-6 rounded-lg bg-sky-600/20 border border-sky-500/40 text-sky-400 flex items-center justify-center text-xs font-black">
                    2B
                  </div>
                  <span className="flex items-center gap-1.5 text-white font-bold text-sm">
                    <Users className="w-4 h-4 text-sky-400" />
                    <span>Binge Buddies Dropdown</span>
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/25 font-bold">
                  Top-Left Header
                </span>
              </div>

              {/* Visual UI Preview: Blue Binge Buddies Dropdown & Friend Switcher */}
              <div className="p-3.5 rounded-xl bg-slate-900/95 border border-slate-800 space-y-2.5 shadow-inner">
                {/* Real Blue "Binge Buddies" Dropdown Visual matching App.tsx */}
                <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-blue-600 border border-blue-500 text-white text-xs font-extrabold shadow-md">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-white/90" />
                    <span>Julio's Shows</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-white/80" />
                </div>

                {/* Dropdown Menu Preview */}
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-[10.5px]">
                  <div className="p-1.5 rounded-lg bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border border-purple-500/40 text-purple-200 font-extrabold flex items-center justify-center gap-1.5">
                    <UserPlus className="w-3 h-3 text-purple-300" />
                    <span>+ Add & Manage Buddies</span>
                  </div>
                  <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-blue-600/20 text-blue-200 font-semibold border border-blue-500/30">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Julio (JLZ)</span>
                      <span className="px-1 py-0.2 rounded bg-blue-600 text-white text-[8px] font-black">Host</span>
                    </div>
                    <span className="text-[9px] text-blue-300">Active</span>
                  </div>
                  <div className="flex items-center justify-between px-2 py-1 text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>AnnaDee's Shows</span>
                    </div>
                    <span className="text-[9px] text-slate-400">12 Shows</span>
                  </div>
                  <div className="flex items-center justify-between px-2 py-1 text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Rafael's Queue</span>
                    </div>
                    <span className="text-[9px] text-slate-500">14 Shows</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Switch to any connected friend's live board using the <strong>Binge Buddies</strong> dropdown in the top header. Click <strong>"+"</strong> directly on any show card to instantly copy it.
              </p>
            </div>

            <button
              onClick={() => handleActionClick('buddies')}
              className="w-full py-2 rounded-xl bg-sky-600/15 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              <span>Open Binge Buddies Roster</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

        </div>

        {/* CALLOUT: STREAMLINED QUEUE TARGETING */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white font-bold">Queue Targeting:</strong> When adding any title, choose which queue it lands in (<span className="text-blue-400 font-bold">Watching</span>, <span className="text-amber-400 font-bold">Up Next</span>, or <span className="text-emerald-400 font-bold">Watched</span>). <em>For an in-depth breakdown of tier filters, episode trackers, and air banner states, see Section 02 below.</em>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE ADD SHOW & BUDDY'S PICKS MODAL SIMULATOR */}
        {/* ========================================================================= */}
        <div className="pt-2 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Play className="w-3 h-3 text-blue-400 fill-blue-400" />
              <span>Interactive Sandbox: Add Show & Buddy's Picks Simulator</span>
            </span>
            <span className="text-[11px] text-blue-400 font-semibold hidden sm:inline">
              Click tabs & test adding shows below
            </span>
          </div>

          <div className="rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden">
            
            {/* Modal Simulator Header */}
            <div className="bg-slate-900/90 px-4 sm:px-6 py-3.5 border-b border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                  selectedStage === 'Watching' 
                    ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]' 
                    : selectedStage === 'Up Next'
                    ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                    : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                }`} />
                <span className="text-xs sm:text-sm font-black text-white">Add Title to Your Watchboard</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 hidden xs:inline">Target Queue:</span>
                <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-[11px]">
                  {(['Watching', 'Up Next', 'Watched'] as const).map(stage => {
                    const isSelected = selectedStage === stage;
                    const activeColorClass = 
                      stage === 'Watching'
                        ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/30 border border-blue-400/40'
                        : stage === 'Up Next'
                        ? 'bg-amber-600 text-white shadow-xs shadow-amber-500/30 border border-amber-400/40'
                        : 'bg-emerald-600 text-white shadow-xs shadow-emerald-500/30 border border-emerald-400/40';
                    return (
                      <button
                        key={stage}
                        onClick={() => setSelectedStage(stage)}
                        className={`px-2.5 py-0.5 rounded-md font-bold transition cursor-pointer ${
                          isSelected
                            ? activeColorClass
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                        }`}
                      >
                        {stage}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-900/50">
              <button
                onClick={() => setAddShowTab('search')}
                className={`flex-1 py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition cursor-pointer ${
                  addShowTab === 'search'
                    ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search Global Catalog</span>
              </button>

              <button
                onClick={() => setAddShowTab('buddy_picks')}
                className={`flex-1 py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition cursor-pointer ${
                  addShowTab === 'buddy_picks'
                    ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Buddy's Picks Tab</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black">
                  3 Rated
                </span>
              </button>
            </div>

            {/* Modal Tab Body */}
            <div className="p-4 sm:p-6 space-y-4">
              {addShowTab === 'search' ? (
                /* TAB 1: SEARCH GLOBAL CATALOG */
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={demoSearchQuery}
                      onChange={(e) => setDemoSearchQuery(e.target.value)}
                      placeholder="Type show title (e.g. Severance, The Bear, Shōgun)..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                    />
                    {demoSearchQuery && (
                      <button
                        onClick={() => setDemoSearchQuery('')}
                        className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-white cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Results List */}
                  <div className="space-y-2.5">
                    {filteredCatalog.length > 0 ? (
                      filteredCatalog.map(show => {
                        const isAdded = addedShowsList.includes(show.title);
                        return (
                          <div
                            key={show.id}
                            className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-14 rounded-lg ${show.posterBg} text-white font-black text-xs flex items-center justify-center shadow-md shrink-0`}>
                                {show.posterInitials}
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs sm:text-sm font-black text-white">{show.title}</span>
                                  <span className="text-[10px] text-slate-400 font-medium">({show.season})</span>
                                  <span className="text-[10px] text-rose-400 font-bold">🍅 {show.rtScore}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${show.platformColor}`}>
                                    {show.platform}
                                  </span>
                                  <span>&bull;</span>
                                  <span>{show.genre}</span>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleAddShowToBoard(show.title, selectedStage)}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                                isAdded
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : selectedStage === 'Watching'
                                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/25 active:scale-95'
                                  : selectedStage === 'Up Next'
                                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/25 active:scale-95'
                                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25 active:scale-95'
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>In {selectedStage}</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>+ Add to {selectedStage}</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-8 text-center text-xs text-slate-400 bg-slate-900/40 rounded-xl border border-dashed border-slate-800">
                        No shows match "{demoSearchQuery}". Try "Severance" or "Bear".
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* TAB 2: BUDDY'S PICKS */
                <div className="space-y-3">
                  <div className="text-xs text-slate-400">
                    Shows recommended and scored by your active Binge Buddies (1-click borrow):
                  </div>

                  <div className="space-y-2.5">
                    {buddyPicks.map((pick, idx) => {
                      const isAdded = addedShowsList.includes(pick.title);
                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 transition space-y-3"
                        >
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${pick.avatarSeed}`}
                                alt={pick.friendName}
                                className="w-7 h-7 rounded-full bg-slate-800 border border-amber-500/40"
                              />
                              <div>
                                <span className="text-xs font-bold text-white">{pick.friendName}</span>
                                <span className="text-[10px] text-slate-400 ml-1.5">{pick.friendHandle}</span>
                              </div>
                            </div>

                            <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 font-black text-xs border border-amber-500/30 flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span>{pick.rating} / 10</span>
                            </span>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
                            <div>
                              <div className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                                <span>{pick.title}</span>
                                <span className="text-[10px] text-slate-400 font-normal">({pick.platform})</span>
                              </div>
                              <p className="text-[11px] text-slate-300 italic mt-0.5">
                                "{pick.quote}"
                              </p>
                            </div>

                            <button
                              onClick={() => handleAddShowToBoard(pick.title, selectedStage, pick.friendName)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                                isAdded
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-md shadow-amber-600/20 active:scale-95'
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Borrowed</span>
                                </>
                              ) : (
                                <>
                                  <BookmarkPlus className="w-3.5 h-3.5" />
                                  <span>Borrow Pick ({selectedStage})</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Simulator Footer */}
            <div className="bg-slate-900/60 px-4 py-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Added to Queue in Simulator: {addedShowsList.length} items</span>
              <button
                onClick={() => handleActionClick('add_show')}
                className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Open Live Add Modal</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* SECONDARY CARD: NAVIGATION, RADAR CALENDAR & THEME CONTROLS */}
      <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 sm:p-7 shadow-xl space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Air Date Radar Calendar & Quick Controls</span>
            </h3>
            <p className="text-xs text-slate-300">
              Track upcoming premieres and weekly air dates across all your streaming platforms.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle: Calendar vs List */}
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setRadarViewMode('calendar')}
                className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                  radarViewMode === 'calendar'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Calendar Grid</span>
              </button>
              <button
                onClick={() => setRadarViewMode('list')}
                className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                  radarViewMode === 'list'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span>Chronological List</span>
              </button>
            </div>

            {/* Master Calendar Download Button replacing obsolete theme toggle */}
            <button
              onClick={handleExportAllIcs}
              className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 text-xs font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer shadow-xs transition active:scale-95"
              title="Download entire broadcast schedule to your calendar (.ics)"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Download Calendar (.ics)</span>
              <span className="sm:hidden">Export (.ics)</span>
            </button>
          </div>
        </div>

        {/* Informative Callout about the dual views & calendar download */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white font-bold">Dual Radar Layouts & Calendar Export:</strong> Switch seamlessly between the visual <strong className="text-blue-400">Month Matrix Grid</strong> to spot multi-day premiere clusters and the ordered <strong className="text-indigo-400">Chronological List View</strong>. Use the <strong className="text-emerald-400">Download Calendar (.ics)</strong> feature above to export the entire release calendar to Apple Calendar, or 1-click sync individual episodes directly to Google Calendar and Microsoft Outlook.
          </div>
        </div>

        {/* View Mode 1: Calendar Grid */}
        {radarViewMode === 'calendar' && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            {/* Header with Month Selector & Filter */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                  {monthData.name} 2026 Schedule
                </span>
                <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 text-[10px] font-extrabold border border-blue-500/20">
                  {monthData.monthReleases.length} {monthData.monthReleases.length === 1 ? 'Air Date' : 'Air Dates'}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Platform Filter Dropdown */}
                <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 text-[11px]">
                  <Filter className="w-3 h-3 text-blue-400 shrink-0" />
                  <select
                    value={radarServiceFilter}
                    onChange={(e) => setRadarServiceFilter(e.target.value)}
                    className="bg-transparent text-slate-200 font-bold focus:outline-hidden cursor-pointer"
                  >
                    <option value="All" className="bg-slate-900 text-white">All Platforms</option>
                    <option value="Apple TV+" className="bg-slate-900 text-white">Apple TV+</option>
                    <option value="Hulu" className="bg-slate-900 text-white">Hulu</option>
                    <option value="Max" className="bg-slate-900 text-white">Max</option>
                    <option value="Netflix" className="bg-slate-900 text-white">Netflix</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      const newMonth = Math.max(0, activeCalendarMonth - 1);
                      setActiveCalendarMonth(newMonth);
                      if (newMonth === 1) setSelectedCalendarDay(28);
                      else if (newMonth === 2) setSelectedCalendarDay(4);
                      else setSelectedCalendarDay(1);
                    }}
                    disabled={activeCalendarMonth <= 1}
                    className={`p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 transition ${
                      activeCalendarMonth <= 1 ? 'opacity-40 cursor-not-allowed' : 'hover:text-white cursor-pointer'
                    }`}
                    title="Previous Month"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      const newMonth = Math.min(2, activeCalendarMonth + 1);
                      setActiveCalendarMonth(newMonth);
                      if (newMonth === 1) setSelectedCalendarDay(28);
                      else if (newMonth === 2) setSelectedCalendarDay(4);
                      else setSelectedCalendarDay(1);
                    }}
                    disabled={activeCalendarMonth >= 2}
                    className={`p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 transition ${
                      activeCalendarMonth >= 2 ? 'opacity-40 cursor-not-allowed' : 'hover:text-white cursor-pointer'
                    }`}
                    title="Next Month"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Days Matrix (Accurate Monday-Sunday start) */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center text-[10px] sm:text-xs">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, idx) => (
                <div key={idx} className="font-bold text-slate-500 py-1">{d}</div>
              ))}

              {/* Blank offset tiles for month start alignment */}
              {[...Array(monthData.startOffset)].map((_, i) => (
                <div key={`blank-${i}`} className="h-9 sm:h-10 rounded-xl opacity-10 bg-slate-900/30" />
              ))}

              {/* Real month days */}
              {[...Array(monthData.totalDays)].map((_, i) => {
                const dayNum = i + 1;
                const dropsOnDay = monthData.dayReleaseMap[dayNum] || [];
                const hasAirEvent = dropsOnDay.length > 0;
                const isSelected = selectedCalendarDay === dayNum;
                const hasTodayDrop = dropsOnDay.some(d => d.isToday);

                return (
                  <button
                    key={dayNum}
                    onClick={() => setSelectedCalendarDay(dayNum)}
                    className={`h-9 sm:h-10 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center relative transition cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white font-black shadow-md shadow-blue-600/30 ring-2 ring-blue-400'
                        : hasAirEvent
                          ? hasTodayDrop
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                            : 'bg-blue-500/15 text-blue-300 border border-blue-500/30 hover:bg-blue-500/25'
                          : 'text-slate-400 hover:bg-slate-800/60'
                    }`}
                  >
                    <span>{dayNum}</span>
                    {hasAirEvent && !isSelected && (
                      <div className="flex items-center gap-0.5 absolute bottom-1">
                        {dropsOnDay.map((_, dotIdx) => (
                          <span
                            key={dotIdx}
                            className={`w-1.5 h-1.5 rounded-full ${
                              hasTodayDrop ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Day Details / Show Cards */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              {selectedDayDrops.length > 0 ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-slate-800">
                    <span className="font-extrabold text-white">
                      {monthData.name} {selectedCalendarDay}, 2026 &bull; {selectedDayDrops.length} Airing {selectedDayDrops.length === 1 ? 'Episode' : 'Episodes'}
                    </span>
                    <span className="text-[10px] text-blue-400 font-bold">Synchronized Broadcast Data</span>
                  </div>

                  {selectedDayDrops.map(show => (
                    <div
                      key={show.id}
                      className="p-3 rounded-xl border transition relative flex items-start gap-3 bg-[#181B22] border-white/10 hover:border-white/15 shadow-sm group"
                    >
                      {/* Crisp 16:10 Thumbnail Banner with platform pill */}
                      <div className="relative w-20 sm:w-24 aspect-[16/10] shrink-0 rounded-xl overflow-hidden border bg-[#0E1015] border-white/10">
                        <img
                          src={show.bannerImg}
                          alt={show.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute bottom-1 left-1 pointer-events-none">
                          <span className={`px-1 py-0.5 text-[7px] sm:text-[8px] font-black uppercase tracking-wider rounded border ${show.platformColor}`}>
                            {show.platform}
                          </span>
                        </div>
                      </div>

                      {/* Content Column */}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between gap-1.5">
                          <h4 className="text-xs sm:text-sm font-black truncate leading-tight text-white">
                            {show.title}
                          </h4>
                          <span className="px-1.5 py-0.5 text-[8px] sm:text-[9px] font-extrabold rounded-md uppercase tracking-wider shrink-0 bg-blue-500/15 text-blue-300 border border-blue-500/20">
                            S{show.season}E{show.episode}
                          </span>
                        </div>

                        <div className="text-[11px] font-semibold truncate text-slate-300">
                          "{show.episodeTitle}"
                        </div>

                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span className={`text-[10px] font-extrabold ${
                            show.isToday
                              ? 'text-emerald-400'
                              : show.group === 'thisWeek'
                              ? 'text-amber-300'
                              : 'text-slate-400'
                          }`}>
                            {show.relativeTime} &bull; {show.airDate}
                          </span>
                        </div>

                        {/* Action Row */}
                        <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                          {show.isToday ? (
                            <button
                              type="button"
                              onClick={() => showNotification(`Marked ${show.title} S${show.season}E${show.episode} as Watched!`)}
                              className="py-1 px-2 font-bold text-[10px] sm:text-[11px] rounded-xl flex items-center gap-1 transition cursor-pointer active:scale-95 bg-blue-600 hover:bg-blue-500 text-white shadow-xs"
                              title="Mark this episode as watched"
                            >
                              <Check className="w-3 h-3" />
                              <span>Watched</span>
                            </button>
                          ) : null}

                          {/* Interactive Sync Popover */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setActiveSyncDropdownId(activeSyncDropdownId === `cal-${show.id}` ? null : `cal-${show.id}`)}
                              className="py-1 px-2 font-bold text-[10px] rounded-xl flex items-center gap-1 transition cursor-pointer border bg-white/5 hover:bg-white/10 text-slate-200 border-white/10 active:scale-95"
                              title="Add to calendar"
                            >
                              <CalendarDays className="w-3 h-3 text-blue-400" />
                              <span>Sync</span>
                              <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
                            </button>

                            {activeSyncDropdownId === `cal-${show.id}` && (
                              <div className="absolute left-0 bottom-full mb-1.5 w-44 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1.5 z-40 space-y-1">
                                <button
                                  type="button"
                                  onClick={() => handleSyncSingleEpisodeIcs(show)}
                                  className="w-full text-left px-2 py-1.5 rounded-lg text-[10px] font-bold text-slate-200 hover:bg-slate-800 flex items-center gap-1.5 transition"
                                >
                                  <Download className="w-3 h-3 text-blue-400" />
                                  <span>Apple / File (.ics)</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSyncGoogle(show)}
                                  className="w-full text-left px-2 py-1.5 rounded-lg text-[10px] font-bold text-slate-200 hover:bg-slate-800 flex items-center gap-1.5 transition"
                                >
                                  <ExternalLink className="w-3 h-3 text-emerald-400" />
                                  <span>Google Calendar</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSyncOutlook(show)}
                                  className="w-full text-left px-2 py-1.5 rounded-lg text-[10px] font-bold text-slate-200 hover:bg-slate-800 flex items-center gap-1.5 transition"
                                >
                                  <ExternalLink className="w-3 h-3 text-sky-400" />
                                  <span>Microsoft Outlook</span>
                                </button>
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => showNotification(`Opening streaming portal for ${show.title} on ${show.platform}`)}
                            className="p-1 rounded-xl border transition flex items-center justify-center cursor-pointer bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border-white/10"
                            title={`Watch ${show.title} on ${show.platform}`}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>No broadcast drops on <strong className="text-white">{monthData.name} {selectedCalendarDay}</strong>.</span>
                    <span className="text-[10px] text-slate-500">Select highlighted dates below:</span>
                  </div>

                  {/* Quick-jump pills to active air dates in this month */}
                  {monthData.monthReleases.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] font-bold text-slate-400">Drops in {monthData.name}:</span>
                      {monthData.monthReleases.map(release => (
                        <button
                          key={release.id}
                          onClick={() => setSelectedCalendarDay(release.day)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer flex items-center gap-1 ${
                            selectedCalendarDay === release.day
                              ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-blue-500/50 hover:text-white'
                          }`}
                        >
                          <span>{monthData.name.slice(0, 3)} {release.day}:</span>
                          <span className="font-extrabold">{release.title} S{release.season}E{release.episode}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* View Mode 2: Chronological List */}
        {radarViewMode === 'list' && (
          <div className="p-3 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            {/* Sub-bar Controls mirroring ShowCalendarModal */}
            <div className="py-1.5 px-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 min-w-0">
                <Filter className="w-3 h-3 text-blue-400 shrink-0" />
                <select
                  value={radarServiceFilter}
                  onChange={(e) => setRadarServiceFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-[11px] font-bold rounded-lg px-2 py-1 focus:outline-hidden focus:border-blue-500 cursor-pointer"
                >
                  <option value="All">All Platforms ({allReleases.length})</option>
                  <option value="Apple TV+">Apple TV+</option>
                  <option value="Hulu">Hulu / FX</option>
                  <option value="Max">Max</option>
                  <option value="Netflix">Netflix</option>
                </select>
              </div>

              <div className="text-[11px] text-slate-400 font-bold">
                Scheduled Airings: <span className="text-blue-400 font-extrabold">{filteredReleases.length}</span>
              </div>
            </div>

            {/* List Rows Grouped by Timeline Buckets */}
            <div className="space-y-4">
              {(() => {
                const thisWeekShows = filteredReleases.filter(s => s.group === 'thisWeek');
                const nextWeekShows = filteredReleases.filter(s => s.group === 'nextWeek');
                const upcomingShows = filteredReleases.filter(s => s.group === 'upcomingLater');

                const renderShowCard = (show: typeof allReleases[0]) => (
                  <div
                    key={show.id}
                    className="p-2.5 sm:p-3 rounded-2xl border transition relative flex items-start gap-2.5 sm:gap-3 bg-[#181B22] border-white/10 hover:border-white/15 shadow-sm group"
                  >
                    {/* Crisp 16:10 Thumbnail Banner with overlaid platform pill */}
                    <div className="relative w-20 sm:w-24 aspect-[16/10] shrink-0 rounded-xl overflow-hidden border bg-[#0E1015] border-white/10">
                      <img
                        src={show.bannerImg}
                        alt={show.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-1 left-1 pointer-events-none">
                        <span className={`px-1 py-0.5 text-[7px] sm:text-[8px] font-black uppercase tracking-wider rounded border ${show.platformColor}`}>
                          {show.platform}
                        </span>
                      </div>
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-1.5">
                        <h4 className="text-xs sm:text-sm font-black truncate leading-tight text-white">
                          {show.title}
                        </h4>
                        <span className="px-1.5 py-0.5 text-[8px] sm:text-[9px] font-extrabold rounded-md uppercase tracking-wider shrink-0 bg-blue-500/15 text-blue-300 border border-blue-500/20">
                          S{show.season}E{show.episode}
                        </span>
                      </div>

                      <div className="text-[11px] font-semibold truncate text-slate-300">
                        "{show.episodeTitle}"
                      </div>

                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className={`text-[10px] font-extrabold ${
                          show.isToday
                            ? 'text-emerald-400'
                            : show.group === 'thisWeek'
                            ? 'text-amber-300'
                            : 'text-slate-400'
                        }`}>
                          {show.relativeTime} &bull; {show.airDate}
                        </span>
                      </div>

                      {/* Action Row */}
                      <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                        {show.isToday ? (
                          <button
                            type="button"
                            onClick={() => showNotification(`Marked ${show.title} S${show.season}E${show.episode} as Watched!`)}
                            className="py-1 px-2 font-bold text-[10px] sm:text-[11px] rounded-xl flex items-center gap-1 transition cursor-pointer active:scale-95 bg-blue-600 hover:bg-blue-500 text-white shadow-xs"
                            title="Mark this episode as watched"
                          >
                            <Check className="w-3 h-3" />
                            <span>Watched</span>
                          </button>
                        ) : null}

                        {/* Interactive Sync Popover */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setActiveSyncDropdownId(activeSyncDropdownId === `list-${show.id}` ? null : `list-${show.id}`)}
                            className="py-1 px-2 font-bold text-[10px] rounded-xl flex items-center gap-1 transition cursor-pointer border bg-white/5 hover:bg-white/10 text-slate-200 border-white/10 active:scale-95"
                            title="Add to calendar"
                          >
                            <CalendarDays className="w-3 h-3 text-blue-400" />
                            <span>Sync</span>
                            <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
                          </button>

                          {activeSyncDropdownId === `list-${show.id}` && (
                            <div className="absolute left-0 bottom-full mb-1.5 w-44 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1.5 z-40 space-y-1">
                              <button
                                type="button"
                                onClick={() => handleSyncSingleEpisodeIcs(show)}
                                className="w-full text-left px-2 py-1.5 rounded-lg text-[10px] font-bold text-slate-200 hover:bg-slate-800 flex items-center gap-1.5 transition"
                              >
                                <Download className="w-3 h-3 text-blue-400" />
                                <span>Apple / File (.ics)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSyncGoogle(show)}
                                className="w-full text-left px-2 py-1.5 rounded-lg text-[10px] font-bold text-slate-200 hover:bg-slate-800 flex items-center gap-1.5 transition"
                              >
                                <ExternalLink className="w-3 h-3 text-emerald-400" />
                                <span>Google Calendar</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSyncOutlook(show)}
                                className="w-full text-left px-2 py-1.5 rounded-lg text-[10px] font-bold text-slate-200 hover:bg-slate-800 flex items-center gap-1.5 transition"
                              >
                                <ExternalLink className="w-3 h-3 text-sky-400" />
                                <span>Microsoft Outlook</span>
                              </button>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => showNotification(`Opening streaming portal for ${show.title} on ${show.platform}`)}
                          className="p-1 rounded-xl border transition flex items-center justify-center cursor-pointer bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border-white/10"
                          title={`Watch ${show.title} on ${show.platform}`}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );

                return (
                  <>
                    {/* This Week Section */}
                    {thisWeekShows.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <h4 className="text-xs font-black uppercase tracking-wider text-emerald-300">
                            Airing This Week ({thisWeekShows.length})
                          </h4>
                        </div>
                        <div className="space-y-2">
                          {thisWeekShows.map(renderShowCard)}
                        </div>
                      </div>
                    )}

                    {/* Next Week Section */}
                    {nextWeekShows.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-400" />
                          <h4 className="text-xs font-black uppercase tracking-wider text-blue-300">
                            Airing Next Week ({nextWeekShows.length})
                          </h4>
                        </div>
                        <div className="space-y-2">
                          {nextWeekShows.map(renderShowCard)}
                        </div>
                      </div>
                    )}

                    {/* Coming Later Section */}
                    {upcomingShows.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                          <h4 className="text-xs font-black uppercase tracking-wider text-amber-300">
                            Coming Later ({upcomingShows.length})
                          </h4>
                        </div>
                        <div className="space-y-2">
                          {upcomingShows.map(renderShowCard)}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>Unified Cross-Service Radar (Month Matrix & Chronological List)</span>
          <button
            onClick={() => handleActionClick('calendar')}
            className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>Open Air Date Calendar</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

    </section>
  );
});

NavigationSection.displayName = 'NavigationSection';
