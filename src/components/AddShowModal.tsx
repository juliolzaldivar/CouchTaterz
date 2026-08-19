/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { TvShow, StreamingService, ShowStatus, User } from '../types';
import { getNormalizedGenres } from '../utils/genreUtils';
import { normalizeShowTitle, getCanonicalShowTitle } from '../utils/titleUtils';
import { Search, Loader2, X, Film, AlertCircle, Plus, Star, Tv, ChevronDown, Sparkles, SlidersHorizontal, Check, Info, ArrowLeft, Users, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface BuddyShowItem {
  show: TvShow;
  ownerName: string;
}

interface AddShowModalProps {
  onClose: () => void;
  onAddShow: (newShow: TvShow) => void;
  onboardingStep?: number | null;
  buddyShows?: BuddyShowItem[];
  initialTab?: 'search' | 'buddies';
  allUsers?: User[];
  currentUser?: User | null;
  existingShows?: TvShow[];
  theme?: 'dark' | 'light';
}

const DEFAULT_BUDDY_SHOWS: BuddyShowItem[] = [
  {
    ownerName: 'Julio',
    show: {
      id: 'shogun-2024',
      title: 'Shōgun',
      overview: 'When a mysterious European ship is found shipwrecked in a nearby fishing village, Lord Yoshii Toranaga discovers secrets that could tip the scales of power.',
      genres: ['Drama', 'History', 'Action'],
      bannerImage: 'https://image.tmdb.org/t/p/w1280/bwSmgmd90hCWwqOKQYTEraeOZhJ.jpg',
      bannerPosition: 'center 20%',
      streamingService: 'Hulu',
      userScore: 9.6,
      rottenTomatoesScore: 99,
      totalSeasons: 1,
      episodesPerSeason: [10],
      concluded: false,
      status: 'Watching',
      latestWatched: { season: 1, episode: 8, title: 'Abyss of Life' },
      nextEpisode: null,
      userNotes: 'Must watch epic!',
      createdAt: '2024-01-01T00:00:00.000Z',
      directors: ['Rachel Kondo', 'Justin Marks'],
      actors: ['Hiroyuki Sanada', 'Cosmo Jarvis', 'Anna Sawai'],
    }
  },
  {
    ownerName: 'Julio',
    show: {
      id: 'succession-2023',
      title: 'Succession',
      overview: 'The Roy family is known for controlling the biggest media and entertainment company in the world. However, their world changes when their father steps down.',
      genres: ['Drama'],
      bannerImage: 'https://image.tmdb.org/t/p/w1280/bcdUYUFk8GdpZJPiSAas9UeocLH.jpg',
      bannerPosition: 'center 25%',
      streamingService: 'HBO',
      userScore: 9.5,
      rottenTomatoesScore: 95,
      totalSeasons: 4,
      episodesPerSeason: [10, 10, 9, 10],
      concluded: true,
      status: 'Watching',
      latestWatched: { season: 4, episode: 10, title: 'With Open Eyes' },
      nextEpisode: null,
      userNotes: 'Masterpiece drama.',
      createdAt: '2024-01-01T00:00:00.000Z',
      directors: ['Jesse Armstrong'],
      actors: ['Brian Cox', 'Jeremy Strong', 'Sarah Snook'],
    }
  },
  {
    ownerName: 'Julio',
    show: {
      id: 'severance-2022',
      title: 'Severance',
      overview: 'Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives.',
      genres: ['Sci-Fi', 'Thriller', 'Mystery'],
      bannerImage: 'https://image.tmdb.org/t/p/w1280/ixgFmf1X59PUZam2qbAfskx2gQr.jpg',
      bannerPosition: 'center 30%',
      streamingService: 'Apple TV',
      userScore: 9.2,
      rottenTomatoesScore: 97,
      totalSeasons: 2,
      episodesPerSeason: [9, 10],
      concluded: false,
      status: 'Watching',
      latestWatched: { season: 2, episode: 1, title: 'Hello Ms. Cobel' },
      nextEpisode: null,
      userNotes: 'Mind blowing concept.',
      createdAt: '2024-01-01T00:00:00.000Z',
      directors: ['Dan Erickson'],
      actors: ['Adam Scott', 'Patricia Arquette', 'John Turturro'],
    }
  },
  {
    ownerName: 'Julio',
    show: {
      id: 'the-bear-2022',
      title: 'The Bear',
      overview: 'A young chef from the fine dining world returns to Chicago to run his family sandwich shop after a tragic loss.',
      genres: ['Drama', 'Comedy'],
      bannerImage: 'https://image.tmdb.org/t/p/w1280/aJtG4txtmiRHwAAqENQHZvBs6kY.jpg',
      bannerPosition: 'center 20%',
      streamingService: 'Hulu',
      userScore: 9.4,
      rottenTomatoesScore: 99,
      totalSeasons: 3,
      episodesPerSeason: [8, 10, 10],
      concluded: false,
      status: 'Watching',
      latestWatched: { season: 3, episode: 1, title: 'Tomorrow' },
      nextEpisode: null,
      userNotes: 'Fast paced and intense!',
      createdAt: '2024-01-01T00:00:00.000Z',
      directors: ['Christopher Storer'],
      actors: ['Jeremy Allen White', 'Ebon Moss-Bachrach', 'Ayo Edebiri'],
    }
  },
  {
    ownerName: 'Julio',
    show: {
      id: 'white-lotus-2021',
      title: 'The White Lotus',
      overview: 'A sharp social satire following the exploits of various employees and guests at an exclusive Hawaiian resort over the span of one highly eventful week.',
      genres: ['Comedy', 'Drama', 'Mystery'],
      bannerImage: 'https://image.tmdb.org/t/p/w1280/rCTLaPwuApDx8vLGjYZ9pRl7zRB.jpg',
      bannerPosition: 'center 25%',
      streamingService: 'HBO',
      userScore: 8.9,
      rottenTomatoesScore: 92,
      totalSeasons: 2,
      episodesPerSeason: [6, 7],
      concluded: false,
      status: 'Watching',
      latestWatched: { season: 2, episode: 7, title: 'Arrivederci' },
      nextEpisode: null,
      userNotes: 'Incredible soundtrack and mystery.',
      createdAt: '2024-01-01T00:00:00.000Z',
      directors: ['Mike White'],
      actors: ['Jennifer Coolidge', 'Jon Gries', 'Aubrey Plaza'],
    }
  },
  {
    ownerName: 'Julio',
    show: {
      id: 'arcane-2021',
      title: 'Arcane',
      overview: 'Set in the utopian region of Piltover and the oppressed underground of Zaun, the story follows the origins of two iconic League champions-and the power that will tear them apart.',
      genres: ['Animation', 'Sci-Fi', 'Action'],
      bannerImage: 'https://image.tmdb.org/t/p/w1280/q8eejQcg1bAqImEV8jh8RtBD4uH.jpg',
      bannerPosition: 'center 30%',
      streamingService: 'Netflix',
      userScore: 9.7,
      rottenTomatoesScore: 100,
      totalSeasons: 2,
      episodesPerSeason: [9, 9],
      concluded: true,
      status: 'Watching',
      latestWatched: { season: 2, episode: 9, title: 'The Dirt under Your Nails' },
      nextEpisode: null,
      userNotes: 'Breathtaking animation quality.',
      createdAt: '2024-01-01T00:00:00.000Z',
      directors: ['Christian Linke', 'Alex Yee'],
      actors: ['Hailee Steinfeld', 'Ella Purnell', 'Katie Leung'],
    }
  }
];

const STREAMING_SERVICES: StreamingService[] = [
  'HBO', 'Disney+', 'Prime Video', 'Netflix', 'Hulu', 'Paramount+', 'Apple TV', 'Peacock', 'AMC+', 'Starz', 'Other'
];

export const AddShowModal: React.FC<AddShowModalProps> = ({ 
  onClose, 
  onAddShow, 
  onboardingStep = null,
  buddyShows = [],
  initialTab = 'search',
  allUsers = [],
  currentUser = null,
  existingShows = [],
  theme = 'dark'
}) => {
  const [activeModalTab, setActiveModalTab] = useState<'search' | 'buddies'>(initialTab);

  useEffect(() => {
    setActiveModalTab(initialTab);
  }, [initialTab]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enrichSteps, setEnrichSteps] = useState<string>('');
  
  // Track added shows so buttons switch to "Added ✓" instantly
  const [addedShowTitles, setAddedShowTitles] = useState<Set<string>>(() => {
    const set = new Set<string>();
    (existingShows || []).forEach(s => set.add(normalizeShowTitle(s.title)));
    return set;
  });

  useEffect(() => {
    if (existingShows && existingShows.length > 0) {
      setAddedShowTitles(prev => {
        const next = new Set(prev);
        existingShows.forEach(s => next.add(normalizeShowTitle(s.title)));
        return next;
      });
    }
  }, [existingShows]);

  const [selectedBuddyOwner, setSelectedBuddyOwner] = useState<string | null>(null);

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

  // Admin status check (Julio / admin only for custom cover editing)
  const isAdmin = currentUser?.email?.trim().toLowerCase() === 'juliozaldivar@gmail.com';

  // Check if there are other active users in the group besides the current user
  const hasOtherActiveUsers = React.useMemo(() => {
    if (!allUsers || allUsers.length === 0) return false;
    return allUsers.some(u => {
      if (!currentUser) return true;
      const isSameId = u.id === currentUser.id;
      const isSameName = u.name?.toLowerCase().trim() === currentUser.name?.toLowerCase().trim();
      return !isSameId && !isSameName;
    });
  }, [allUsers, currentUser]);

  // Active tater names for recommendation filtering
  const activeUserNames = React.useMemo(() => {
    if (allUsers && allUsers.length > 0) {
      return new Set(allUsers.map(u => u.name.toLowerCase().trim()));
    }
    return null;
  }, [allUsers]);

  // Buddy Picks filter & sort state
  const [buddyFilter, setBuddyFilter] = useState<string>('all');
  const [buddySort, setBuddySort] = useState<'rating' | 'title' | 'service'>('rating');
  const [buddySearch, setBuddySearch] = useState<string>('');

  // Combine passed in buddyShows with DEFAULT_BUDDY_SHOWS:
  // Recommendations below should NOT include the current logged-in user's own picks
  const availableBuddyShows = React.useMemo(() => {
    const mergedMap = new Map<string, BuddyShowItem>();

    // Helper to check if recommendation owner is the current logged-in user
    const isOwnerCurrentUser = (ownerNameStr: string) => {
      if (!currentUser) return false;
      const cleanOwner = ownerNameStr.trim().toLowerCase();
      const cleanUser = currentUser.name?.trim().toLowerCase();

      if (cleanUser && cleanOwner === cleanUser) return true;

      const isJulioUser = currentUser.id === 'default' || 
                          currentUser.id === 'user-julio' || 
                          currentUser.email?.toLowerCase() === 'juliozaldivar@gmail.com' || 
                          cleanUser === 'julio';

      if (isJulioUser && (cleanOwner === 'julio' || cleanOwner === 'default' || cleanOwner === 'user-julio')) {
        return true;
      }
      return false;
    };

    // 1. Process buddyShows passed from active boards (e.g. Kris, Lilyann, AnnaDee, Julian, Rafael, Steve)
    (buddyShows || []).forEach(item => {
      if (isOwnerCurrentUser(item.ownerName)) return; // Exclude current user's own recommendations
      const lowerOwner = item.ownerName.toLowerCase().trim();
      if (!activeUserNames || activeUserNames.has(lowerOwner) || lowerOwner === 'julio') {
        const key = `${lowerOwner}_${item.show.title.toLowerCase().trim()}`;
        mergedMap.set(key, item);
      }
    });

    // 2. Include default starter buddy picks ONLY if owner is not current user
    DEFAULT_BUDDY_SHOWS.forEach(item => {
      if (isOwnerCurrentUser(item.ownerName)) return; // Exclude current user's own recommendations
      const lowerOwner = item.ownerName.toLowerCase().trim();
      if (!activeUserNames || activeUserNames.has(lowerOwner) || lowerOwner === 'julio') {
        const key = `${lowerOwner}_${item.show.title.toLowerCase().trim()}`;
        if (!mergedMap.has(key)) {
          mergedMap.set(key, item);
        }
      }
    });

    // Filter out shows already added to user's board so suggestions stay actionable
    return Array.from(mergedMap.values()).filter(item => {
      const titleClean = normalizeShowTitle(item.show.title);
      return !addedShowTitles.has(titleClean);
    });
  }, [buddyShows, activeUserNames, addedShowTitles, currentUser]);

  const buddyNames = Array.from(new Set(availableBuddyShows.map(item => item.ownerName)));

  const filteredBuddyShows = availableBuddyShows
    .filter(item => {
      if (buddyFilter !== 'all' && item.ownerName !== buddyFilter) return false;
      if (buddySearch.trim()) {
        const q = buddySearch.toLowerCase().trim();
        const matchTitle = item.show.title.toLowerCase().includes(q);
        const matchService = item.show.streamingService?.toLowerCase().includes(q);
        const matchGenre = item.show.genres?.some(g => g.toLowerCase().includes(q));
        const matchOwner = item.ownerName.toLowerCase().includes(q);
        return matchTitle || matchService || matchGenre || matchOwner;
      }
      return true;
    })
    .sort((a, b) => {
      if (buddySort === 'rating') {
        return (b.show.userScore || 0) - (a.show.userScore || 0);
      }
      if (buddySort === 'title') {
        return a.show.title.localeCompare(b.show.title);
      }
      if (buddySort === 'service') {
        return (a.show.streamingService || '').localeCompare(b.show.streamingService || '');
      }
      return 0;
    });

  const handleSelectBuddyShow = (item: BuddyShowItem) => {
    const s = item.show;
    setSelectedBuddyOwner(item.ownerName);
    setPreviewShow(s);
    setBannerImage(s.bannerImage || 'https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypROD7P.jpg');
    setBannerPosition(s.bannerPosition || 'center 25%');
    setSearchResults([s]);
    setSelectedIndex(0);
    setUserNotes('');
    setUserScore(null);
  };

  const handleDirectQuickAdd = (item: BuddyShowItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // When going through onboarding tutorial (onboardingStep !== null), do NOT allow direct quick-adds / multi-select.
    // Any click on a show must lead them to the full details page (previewShow) so they review the show details first.
    if (onboardingStep !== null && onboardingStep !== undefined) {
      handleSelectBuddyShow(item);
      return;
    }

    const normTitle = normalizeShowTitle(item.show.title);
    if (addedShowTitles.has(normTitle)) return;

    const fullShow: TvShow = {
      ...item.show,
      title: getCanonicalShowTitle(item.show.title, existingShows),
      id: `show-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      status: 'Watching',
      latestWatched: item.show.latestWatched || { season: 1, episode: 0, title: 'Not Started' },
      userScore: null,
      userNotes: '',
      createdAt: new Date().toISOString()
    };

    onAddShow(fullShow);
    setAddedShowTitles(prev => new Set(prev).add(normTitle));
  };

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
    setUserNotes('');
    setUserScore(null);
  };

  const handleBack = () => {
    setPreviewShow(null);
    setSearchResults([]);
    setSelectedIndex(0);
    setUserNotes('');
    setUserScore(null);
    setSelectedBuddyOwner(null);
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
    setUserNotes('');
    setUserScore(null);
    setSelectedBuddyOwner(null);

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

    const totSeasons = previewShow.totalSeasons || 1;
    const totEps = (previewShow.episodesPerSeason && previewShow.episodesPerSeason[totSeasons - 1]) || 10;

    let initialWatched = { season: 1, episode: 0, title: "Not Started" };
    if (status === 'Completed') {
      initialWatched = {
        season: totSeasons,
        episode: totEps,
        title: previewShow.episodes?.[`S${totSeasons}E${totEps}`] || `Episode ${totEps}`
      };
    }

    const fullShow: TvShow = {
      id: `show-${Date.now()}`,
      title: getCanonicalShowTitle(previewShow.title || query, existingShows),
      streamingService: (previewShow.streamingService as StreamingService) || 'Other',
      genres: getNormalizedGenres(previewShow),
      status: status,
      latestWatched: initialWatched,
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
    const normTitle = (previewShow.title || query).toLowerCase().trim();
    setAddedShowTitles(prev => new Set(prev).add(normTitle));

    if (activeModalTab === 'buddies' && (onboardingStep === null || onboardingStep === undefined)) {
      setPreviewShow(null);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2.5 sm:p-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-black/85 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`relative w-full max-w-lg overflow-hidden rounded-2xl sm:rounded-3xl border shadow-2xl flex flex-col max-h-[calc(100dvh-max(1.5rem,env(safe-area-inset-top)+1rem))] sm:max-h-[90vh] ${
          theme === 'dark' ? 'bg-[#1A1D23] border-white/10' : 'bg-white border-neutral-200'
        }`}
      >
        {/* Header */}
        <div className={`p-4 sm:p-6 border-b flex items-center justify-between gap-2 ${
          theme === 'dark' ? 'border-white/5' : 'border-neutral-200 bg-neutral-50/80'
        }`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`p-2 rounded-xl border shrink-0 ${
              theme === 'dark' ? 'bg-[#262A33] text-slate-200 border-white/5' : 'bg-blue-50 text-blue-600 border-blue-200'
            }`}>
              <Film className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className={`text-base sm:text-lg font-bold tracking-tight truncate ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>Add TV Show to Follow</h3>
              <p className={`text-[11px] sm:text-xs truncate ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}>Scan metadata and schedules automatically from TMDB</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-xl transition cursor-pointer shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95 ${
              theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-neutral-200/60'
            }`}
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div 
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 flex-1 scrollbar-thin scrollbar-thumb-white/10"
        >
          {/* Modal Tab Switcher (TMDB Search vs Buddy Picks) */}
          {!previewShow && !isLoading && (
            <div className={`grid grid-cols-2 gap-2 p-1.5 rounded-2xl border ${
              theme === 'dark' ? 'bg-[#0F1115] border-white/5' : 'bg-neutral-100 border-neutral-200'
            }`}>
              <button
                type="button"
                onClick={() => setActiveModalTab('search')}
                className={`py-2 px-3 text-xs font-extrabold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeModalTab === 'search'
                    ? theme === 'dark' 
                      ? 'bg-[#262A33] text-white shadow-md border border-white/10' 
                      : 'bg-white text-slate-900 shadow-md border border-neutral-300'
                    : theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-blue-500" />
                <span>Search Database</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab('buddies')}
                className={`py-2 px-3 text-xs font-extrabold rounded-xl transition flex items-center justify-center gap-1.5 relative cursor-pointer ${
                  activeModalTab === 'buddies'
                    ? 'bg-gradient-to-r from-purple-800 to-purple-700 text-purple-50 shadow-md border border-purple-500/40'
                    : theme === 'dark' ? 'text-purple-300 hover:text-purple-200' : 'text-purple-700 hover:text-purple-900'
                } ${
                  onboardingStep === 3
                    ? 'ring-2 ring-purple-400 animate-pulse bg-purple-900/40'
                    : ''
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>Buddy Picks</span>
                <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded-full ml-1">
                  {availableBuddyShows.length}
                </span>
              </button>
            </div>
          )}

          {/* Initial Search Form Tab */}
          {!previewShow && !isLoading && activeModalTab === 'search' && (
            <div className="space-y-6">
              <form onSubmit={handleSearchAndEnrich} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Show Title</label>
                    {onboardingStep === 3 && (
                      <motion.span 
                        initial={{ opacity: 0, x: 5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-[10px] text-purple-400 font-extrabold flex items-center gap-1 animate-pulse"
                      >
                        <Sparkles className="w-3 h-3 text-purple-400" /> Type title OR pick below!
                      </motion.span>
                    )}
                  </div>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={onboardingStep === 3 ? "Type title OR select from Binge Buddies below..." : "e.g., Shogun, Succession, Shingeki no Kyojin..."}
                      className={`w-full text-sm pl-10 pr-4 py-3.5 rounded-2xl border transition-all duration-300 focus:outline-none focus:border-blue-500 ${
                        theme === 'dark'
                          ? 'bg-[#0F1115] text-slate-100 placeholder-slate-500 border-white/10'
                          : 'bg-slate-50 text-slate-900 placeholder-slate-500 border-slate-300 shadow-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20'
                      } ${
                        onboardingStep === 3
                          ? 'border-purple-500 ring-4 ring-purple-500/30 shadow-lg shadow-purple-950/40'
                          : ''
                      }`}
                      autoFocus
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3.5 rounded-2xl bg-rose-950/20 text-rose-300 border border-rose-900/30 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}
              </form>

              {/* Quick Add from Binge Buddies Horizontal Strip */}
              {availableBuddyShows.length > 0 && (
                <div className={`space-y-3 pt-3 border-t transition-all ${
                  onboardingStep === 3
                    ? 'p-3 rounded-2xl bg-purple-950/25 border-purple-500/40 ring-2 ring-purple-400/80 shadow-lg shadow-purple-950/30'
                    : 'border-white/5'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-purple-300">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      <span>Quick Add from Binge Buddies</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveModalTab('buddies')}
                      className="text-[11px] font-extrabold text-purple-400 hover:text-purple-300 transition flex items-center gap-1 cursor-pointer"
                    >
                      View All ({availableBuddyShows.length}) →
                    </button>
                  </div>

                  <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                    {availableBuddyShows.slice(0, 5).map(({ show, ownerName }, idx) => {
                      const isAdded = addedShowTitles.has(normalizeShowTitle(show.title));
                      return (
                        <div
                          key={`quick-buddy-${show.id}-${ownerName}-${idx}`}
                          onClick={() => handleSelectBuddyShow({ show, ownerName })}
                          className={`shrink-0 w-36 p-2.5 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between space-y-2 shadow-sm ${
                            theme === 'dark'
                              ? 'bg-[#0F1115] hover:bg-[#1A1D24] border-purple-500/20 hover:border-purple-500/50'
                              : 'bg-white hover:bg-purple-50/50 border-purple-200 hover:border-purple-400'
                          } ${
                            onboardingStep === 3
                              ? 'border-purple-400/80 hover:border-purple-400 ring-2 ring-purple-400/60 scale-[1.02]'
                              : ''
                          }`}
                        >
                          <div className="relative h-20 rounded-xl overflow-hidden bg-slate-800">
                            <img
                              src={show.bannerImage}
                              alt={show.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              style={{ objectPosition: show.bannerPosition || 'center 25%' }}
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=1200&q=80';
                              }}
                            />
                            <span className="absolute top-1 right-1 bg-purple-950/85 text-purple-200 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md backdrop-blur-sm border border-purple-500/30">
                              {ownerName}
                            </span>
                          </div>
                          <div>
                            <h5 className={`text-xs font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{show.title}</h5>
                            <p className={`text-[10px] truncate ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{show.streamingService} • ★{show.userScore || 9.0}</p>
                          </div>
                          {isAdded ? (
                            <button
                              type="button"
                              disabled
                              onClick={(e) => e.stopPropagation()}
                              className="w-full py-1.5 text-[10px] font-black uppercase tracking-wider bg-emerald-950/80 text-emerald-400 rounded-xl border border-emerald-500/40 flex items-center justify-center gap-1 cursor-default opacity-90"
                            >
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Added</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => handleDirectQuickAdd({ show, ownerName }, e)}
                              className="w-full py-1.5 text-[10px] font-black uppercase tracking-wider bg-purple-600/30 hover:bg-purple-600 text-purple-200 rounded-xl border border-purple-500/30 transition group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center gap-1 cursor-pointer hover:scale-105 active:scale-95"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Show</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className={`rounded-2xl border p-4 space-y-2.5 ${
                theme === 'dark' ? 'bg-[#0F1115]/50 border-white/5' : 'bg-slate-50 border-slate-200'
              }`}>
                <h4 className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-700'}`}>Why search TMDB?</h4>
                <ul className={`text-xs space-y-1.5 list-disc pl-4 leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  <li>Detects Rotten Tomatoes/rating scores automatically.</li>
                  <li>Determines where to stream (HBO, Netflix, etc.).</li>
                  <li>Retrieves upcoming episode titles, seasons, and scheduled dates.</li>
                  <li>Injects the cast, directors, overview synopsis, and gorgeous banner imagery.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Buddy Picks Dedicated Tab View */}
          {!previewShow && !isLoading && activeModalTab === 'buddies' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/25 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-extrabold text-purple-200 uppercase tracking-wider">Binge Buddy Favorites</h4>
                  <p className="text-[11px] text-purple-100/80 leading-relaxed">
                    These shows are currently being tracked and recommended by your binge buddies (like Julio). Tap any show to add it directly to your board!
                  </p>
                </div>
              </div>

              {/* Search & Sort Bar (Clean Single-Row Mobile & Desktop Layout) */}
              <div className={`flex items-center gap-2 p-2 sm:p-2.5 rounded-2xl border shadow-inner ${
                theme === 'dark' ? 'bg-[#0F1115] border-white/10' : 'bg-slate-100 border-slate-200'
              }`}>
                {/* Search Input - Flex 1 */}
                <div className="relative flex-1 min-w-0">
                  <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={buddySearch}
                    onChange={(e) => setBuddySearch(e.target.value)}
                    placeholder="Search title, genre, buddy..."
                    className={`w-full text-xs font-medium pl-8 sm:pl-9 pr-7 py-2 rounded-xl border focus:outline-none focus:border-purple-500/70 focus:ring-1 focus:ring-purple-500/30 transition shadow-sm ${
                      theme === 'dark'
                        ? 'bg-[#151821] text-slate-100 placeholder-slate-400 border-white/10'
                        : 'bg-white text-slate-900 placeholder-slate-400 border-slate-300'
                    }`}
                  />
                  {buddySearch && (
                    <button
                      type="button"
                      onClick={() => setBuddySearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Sort Selector - Compact Inline */}
                <div className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl border text-xs shrink-0 ${
                  theme === 'dark' ? 'bg-[#151821] border-white/10 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                }`}>
                  <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="text-slate-400 font-semibold text-[11px] hidden md:inline">Sort:</span>
                  <select
                    value={buddySort}
                    onChange={(e) => setBuddySort(e.target.value as any)}
                    className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="rating" className={theme === 'dark' ? "bg-[#151821] text-slate-200" : "bg-white text-slate-800"}>Rating ★</option>
                    <option value="title" className={theme === 'dark' ? "bg-[#151821] text-slate-200" : "bg-white text-slate-800"}>Title A–Z</option>
                    <option value="service" className={theme === 'dark' ? "bg-[#151821] text-slate-200" : "bg-white text-slate-800"}>Service</option>
                  </select>
                </div>
              </div>

              {/* Watch Buddy Connections Horizontal Slide Ribbon */}
              {buddyNames.length > 0 && (
                <div className={`relative p-2 rounded-2xl border overflow-hidden shadow-inner ${
                  theme === 'dark' ? 'bg-[#0F1115] border-white/10' : 'bg-slate-100 border-slate-200'
                }`}>
                  {/* Gradient Overlay on right with pulsing arrow indicator */}
                  <div className={`absolute right-0 top-0 bottom-0 w-16 pointer-events-none z-10 flex items-center justify-end pr-2 ${
                    theme === 'dark'
                      ? 'bg-gradient-to-l from-[#0F1115] via-[#0F1115]/90 to-transparent'
                      : 'bg-gradient-to-l from-slate-100 via-slate-100/90 to-transparent'
                  }`}>
                    <div className="w-6 h-6 rounded-full bg-purple-500/25 border border-purple-500/40 flex items-center justify-center text-purple-200 shadow-md animate-pulse">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 px-2 pr-16 snap-x scroll-smooth">
                    <span className={`text-[10px] uppercase font-black tracking-wider shrink-0 flex items-center gap-1 mr-1 ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      <Users className="w-3.5 h-3.5 text-purple-400" />
                      <span>Binge Buddies:</span>
                    </span>

                    {/* All Picks Option */}
                    <button
                      type="button"
                      onClick={() => setBuddyFilter('all')}
                      className={`shrink-0 snap-start px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        buddyFilter === 'all'
                          ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-950/50 ring-1 ring-purple-400/40'
                          : theme === 'dark'
                            ? 'bg-[#151821] border-white/10 text-slate-300 hover:border-purple-500/40 hover:text-white'
                            : 'bg-white border-slate-300 text-slate-700 hover:border-purple-500/50 hover:text-slate-900 shadow-sm'
                      }`}
                    >
                      <span>All Picks</span>
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                        buddyFilter === 'all'
                          ? 'bg-purple-900/80 text-white'
                          : theme === 'dark' ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {availableBuddyShows.length}
                      </span>
                    </button>

                    {/* Individual Buddy Pills */}
                    {buddyNames.map(name => {
                      const count = availableBuddyShows.filter(i => i.ownerName === name).length;
                      const matchedUser = (allUsers || []).find(u => u.name.toLowerCase().trim() === name.toLowerCase().trim());
                      const avatarUrl = matchedUser?.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${name}`;
                      const isSelected = buddyFilter === name;

                      const isOnline = matchedUser
                        ? (currentUser ? (matchedUser.id === currentUser.id || matchedUser.email === currentUser.email) : false) || (matchedUser as any).isOnline === true
                        : (currentUser && currentUser.name?.toLowerCase().trim() === name.toLowerCase().trim());

                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setBuddyFilter(name)}
                          className={`shrink-0 snap-start px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                            isSelected
                              ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-950/50 ring-1 ring-purple-400/40'
                              : theme === 'dark'
                                ? 'bg-[#151821] border-white/10 text-slate-300 hover:border-purple-500/40 hover:text-white'
                                : 'bg-white border-slate-300 text-slate-700 hover:border-purple-500/50 hover:text-slate-900 shadow-sm'
                          }`}
                        >
                          <div className="relative shrink-0">
                            <img
                              src={avatarUrl}
                              alt={name}
                              className="w-4 h-4 rounded-full object-cover shrink-0 border border-white/20"
                            />
                            <span
                              className={`w-1.5 h-1.5 rounded-full absolute -bottom-0.5 -right-0.5 ${
                                isOnline
                                  ? 'bg-emerald-500 ring-1 ring-[#151821] shadow-[0_0_4px_rgba(16,185,129,0.9)]'
                                  : 'bg-slate-500/80 ring-1 ring-[#151821]'
                              }`}
                              title={isOnline ? "Active now" : "Offline"}
                            />
                          </div>
                          <span>{name}</span>
                          <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                            isSelected
                              ? 'bg-purple-900/80 text-white'
                              : theme === 'dark' ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Picks List */}
              {filteredBuddyShows.length === 0 ? (
                <div className="p-8 text-center bg-[#0F1115] rounded-2xl border border-white/5 space-y-2">
                  <p className="text-xs text-slate-400 font-medium">
                    {availableBuddyShows.length === 0
                      ? "You've added all available buddy picks to your board!"
                      : "No buddy picks match your filter."}
                  </p>
                  {availableBuddyShows.length > 0 && (
                    <button
                      type="button"
                      onClick={() => { setBuddyFilter('all'); setBuddySearch(''); }}
                      className="text-xs text-purple-400 hover:text-purple-300 font-bold underline cursor-pointer"
                    >
                      Reset filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredBuddyShows.map(({ show, ownerName }, idx) => {
                    const isAdded = addedShowTitles.has(normalizeShowTitle(show.title));
                    return (
                      <div
                        key={`modal-buddy-list-${show.id}-${ownerName}-${idx}`}
                        onClick={() => handleSelectBuddyShow({ show, ownerName })}
                        className="p-3.5 sm:p-4 rounded-2xl bg-[#0F1115] hover:bg-[#181B22] border border-purple-500/20 hover:border-purple-500/50 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 group shadow-md"
                      >
                        <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                          {/* Prominent Banner Image Column */}
                          <div className="relative w-28 h-20 sm:w-36 sm:h-24 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-white/10 shadow-sm">
                            <img
                              src={show.bannerImage}
                              alt={show.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              style={{ objectPosition: show.bannerPosition || 'center 25%' }}
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=1200&q=80';
                              }}
                            />
                            {/* Floating Buddy Badge overlay */}
                            <div className="absolute top-1.5 left-1.5 bg-black/75 backdrop-blur-md text-purple-300 text-[9px] font-black px-2 py-0.5 rounded-lg border border-purple-500/30 flex items-center gap-1 shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                              <span>{ownerName}'s Pick</span>
                            </div>
                          </div>

                          {/* Center Show Information Column */}
                          <div className="min-w-0 flex-1 flex flex-col justify-center space-y-1">
                            <h5 className="text-sm sm:text-base font-extrabold text-white group-hover:text-purple-200 transition-colors leading-tight">
                              {show.title}
                            </h5>

                            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400">
                              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 font-bold text-slate-200 text-[11px]">
                                {show.streamingService}
                              </span>
                              {show.genres && show.genres.length > 0 && (
                                <span className="text-slate-400 text-[11px] font-medium hidden sm:inline">
                                  • {show.genres.slice(0, 2).join(', ')}
                                </span>
                              )}
                              <span className="text-amber-400 font-extrabold text-[11px] flex items-center gap-0.5">
                                ★ {show.userScore || 9.0}
                              </span>
                            </div>

                            {(show.overview || show.userNotes) && (
                              <p className="text-xs text-slate-400 line-clamp-2 leading-snug pt-0.5">
                                {show.overview || show.userNotes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Actions Column on the Right */}
                        <div className="flex items-center sm:flex-col justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5 sm:border-none sm:self-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectBuddyShow({ show, ownerName });
                            }}
                            className="w-full sm:w-auto px-3 py-1.5 bg-[#262A33] hover:bg-[#323743] text-slate-300 font-extrabold text-xs rounded-xl border border-white/10 transition flex items-center justify-center gap-1.5 cursor-pointer"
                            title="View full show details, synopsis & cast"
                          >
                            <Info className="w-3.5 h-3.5 text-purple-400" />
                            <span>Details</span>
                          </button>

                          {isAdded ? (
                            <button
                              type="button"
                              disabled
                              onClick={(e) => e.stopPropagation()}
                              className="w-full sm:w-auto px-3.5 py-1.5 bg-emerald-950/80 text-emerald-400 font-extrabold text-xs rounded-xl border border-emerald-500/40 flex items-center justify-center gap-1.5 cursor-default opacity-90"
                            >
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Added</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => handleDirectQuickAdd({ show, ownerName }, e)}
                              className="w-full sm:w-auto px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl transition shadow-md shadow-purple-950/30 flex items-center justify-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
                              title="Quickly add to your board"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
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
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/5">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#262A33] text-slate-300 hover:text-white text-xs font-bold transition border border-white/5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-purple-400" />
                  <span>{activeModalTab === 'buddies' ? 'Back to Buddy Picks' : 'Back to Search'}</span>
                </button>
                {selectedBuddyOwner && activeModalTab === 'buddies' && (
                  <span className="text-[11px] font-extrabold px-2.5 py-1 bg-purple-950/80 text-purple-200 rounded-xl border border-purple-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                    <span>Picked by {selectedBuddyOwner}</span>
                  </span>
                )}
              </div>
              
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
                    className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl object-cover border border-white/5 bg-[#262A33] shrink-0"
                    style={{ objectPosition: bannerPosition }}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=1200&q=80';
                    }}
                  />
                )}
                <div className="flex-1 space-y-2 min-w-0">
                  <div>
                    <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider rounded bg-[#262A33] text-slate-300 border border-white/5 uppercase">
                      {previewShow.streamingService || 'Other'}
                    </span>
                    <h4 className="text-base font-bold text-white mt-1 leading-tight">{previewShow.title}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{previewShow.genres?.join(', ')}</p>
                  </div>
                  
                  <p className="text-xs text-slate-300 leading-relaxed max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                    {previewShow.overview || 'No synopsis available for this show.'}
                  </p>

                  <div className="flex items-center gap-3 text-[10px] text-slate-500 font-semibold">
                    <span>RT Score: <strong className="text-rose-400">{previewShow.rottenTomatoesScore != null ? `${previewShow.rottenTomatoesScore}%` : 'TBD'}</strong></span>
                    <span>•</span>
                    <span>Status: <strong>{previewShow.concluded ? 'Concluded' : 'Active / Running'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Status Segmented Control matching ShowCard */}
              <div className="bg-[#15171C] p-1 rounded-2xl border border-white/5 flex gap-1 w-full my-1">
                {(['Watching', 'Backlog', 'Completed'] as ShowStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      status === st 
                        ? st === 'Completed'
                          ? 'bg-emerald-600 text-white shadow-sm font-extrabold'
                          : st === 'Backlog'
                            ? 'bg-amber-600 text-white shadow-sm font-extrabold'
                            : 'bg-blue-600 text-white shadow-sm font-extrabold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    } ${
                      onboardingStep === 3 && st === 'Watching'
                        ? 'ring-2 ring-purple-500 shadow-lg relative z-10'
                        : ''
                    }`}
                  >
                    {onboardingStep === 3 && st === 'Watching' && (
                      <motion.span
                        animate={{ x: [-2, 2, -2] }}
                        transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
                        className="text-purple-300 font-black text-xs inline-block"
                      >
                        ➜
                      </motion.span>
                    )}
                    <span>{st === 'Watching' ? 'Watching' : st === 'Backlog' ? 'Up Next' : st === 'Completed' ? 'Watched' : st}</span>
                  </button>
                ))}
              </div>

              {/* User Custom Options Form */}
              <div className="space-y-4 pt-2 border-t border-white/5">

                {/* Custom Cover Options (Admin Only) */}
                {isAdmin && (
                  <>
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
                  </>
                )}

                {/* Buddy Review Banner (Reference only) */}
                {selectedBuddyOwner && (previewShow.userNotes || previewShow.userScore != null) && (
                  <div className="p-3 bg-purple-950/20 border border-purple-500/20 rounded-2xl space-y-1 my-1">
                    <div className="flex items-center justify-between text-xs text-purple-300 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-purple-400" />
                        {selectedBuddyOwner}'s Review & Rating
                      </span>
                      {previewShow.userScore != null && (
                        <span className="text-amber-400 font-black">★ {previewShow.userScore}/10</span>
                      )}
                    </div>
                    {previewShow.userNotes && (
                      <p className="text-xs text-slate-300 italic leading-relaxed">
                        "{previewShow.userNotes}"
                      </p>
                    )}
                  </div>
                )}

                {/* Score slider */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-xs">
                    <label className="text-slate-500 font-medium">Your Custom Rating (optional)</label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-amber-400 font-bold">{userScore ? `${userScore}/10` : 'Not Rated'}</span>
                      {userScore != null && (
                        <button
                          type="button"
                          onClick={() => setUserScore(null)}
                          className="text-[10px] text-slate-400 hover:text-amber-400 transition-colors underline cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 py-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setUserScore(prev => prev === star ? null : star)}
                        className={`transition-colors p-1 cursor-pointer ${
                          star <= (userScore || 0) ? 'text-amber-400 scale-110' : 'text-neutral-700 hover:text-neutral-500'
                        }`}
                        title={userScore === star ? "Click again to reset rating" : `Rate ${star}/10`}
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
        {(previewShow || query.trim()) && (
          <div className="p-4 sm:p-6 border-t border-white/5 bg-[#0F1115]/30">
            {previewShow ? (
              <div className="space-y-3">
                {/* Full-width primary Add to Watchlist action */}
                {addedShowTitles.has(normalizeShowTitle(previewShow.title || query)) ? (
                  <button
                    type="button"
                    disabled
                    className="w-full py-3 px-5 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 opacity-90 cursor-default shadow-md"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Added to Watchlist Board</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleConfirmAdd}
                    className="w-full py-3 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-950/40 hover:scale-[1.005] active:scale-[0.99]"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Add to Watchlist</span>
                  </button>
                )}

                {/* Secondary navigation and cancel row */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-400 hover:text-white hover:bg-[#262A33] transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#262A33] transition cursor-pointer"
                    >
                      {activeModalTab === 'buddies' ? 'Back to Buddy Picks' : 'Back to Search'}
                    </button>
                    {searchResults.length > 1 && (
                      <button
                        type="button"
                        onClick={() => selectShowAtIndex((selectedIndex + 1) % searchResults.length)}
                        className="px-3.5 py-1.5 rounded-xl border border-blue-500/25 text-xs font-semibold text-blue-400 hover:text-white hover:bg-blue-600/10 transition cursor-pointer"
                      >
                        Next Match ({selectedIndex + 1}/{searchResults.length})
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-slate-400 hover:text-white hover:bg-[#262A33] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!query.trim() || isLoading}
                  onClick={handleSearchAndEnrich}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Search className="w-3.5 h-3.5" />
                  Search & Preview
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
