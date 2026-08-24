import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Tv,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Plus,
  BookmarkPlus,
  Users,
  Sparkles,
  ChevronUp,
  Layers,
  Compass
} from 'lucide-react';
import { NavigationSection } from './product-guide/NavigationSection';
import { ShowCardsSection } from './product-guide/ShowCardsSection';
import { DashboardSection } from './product-guide/DashboardSection';
import { BuddiesSection } from './product-guide/BuddiesSection';
import { ProfileSection } from './product-guide/ProfileSection';
import { GuideSearchBar } from './product-guide/GuideSearchBar';
import { JULIO_OFFICIAL_AVATAR } from '../utils/taterAvatarUtils';

export interface ProductGuidePageProps {
  onBack: () => void;
  onNavigateTo?: (target: 'add_show' | 'calendar' | 'spudz_ai' | 'buddies' | 'avatar' | 'stats' | 'preferences') => void;
  onLaunchApp?: () => void;
  initialSection?: string;
  isLoggedIn?: boolean;
}

// Self-updating reading progress bar that avoids triggering parent component re-renders on scroll
const ReadingProgressBar: React.FC = React.memo(() => {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    const updateProgress = () => {
      if (barRef.current) {
        const totalScrollable = document.documentElement.scrollHeight - window.innerHeight;
        const pct = totalScrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / totalScrollable) * 100)) : 0;
        barRef.current.style.width = `${pct}%`;
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateProgress();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="w-full h-1 bg-slate-900 overflow-hidden">
      <div
        ref={barRef}
        className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-400 will-change-[width]"
        style={{ width: '0%' }}
      />
    </div>
  );
});

ReadingProgressBar.displayName = 'ReadingProgressBar';

export const ProductGuidePage: React.FC<ProductGuidePageProps> = ({
  onBack,
  onNavigateTo,
  onLaunchApp,
  initialSection = 'navigation',
  isLoggedIn = false
}) => {
  const [activeNav, setActiveNav] = useState<string>(initialSection);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Guarantee body and html scrollability when Guide is rendered
  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevDocOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevDocOverflow;
    };
  }, []);

  // Efficient active section tracking via requestAnimationFrame and throttled updates
  useEffect(() => {
    const sectionIds = ['navigation', 'dashboard', 'showcards', 'buddies', 'profile'];
    let ticking = false;

    const checkActiveSection = () => {
      const offset = 220;
      const scrollY = window.scrollY;
      setShowBackToTop(prev => {
        const next = scrollY > 400;
        return prev !== next ? next : prev;
      });

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(`doc-section-${sectionIds[i]}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= offset) {
            setActiveNav(prev => (prev !== sectionIds[i] ? sectionIds[i] : prev));
            break;
          }
        }
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(checkActiveSection);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    checkActiveSection();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // SECTION 1 INTERACTIVE STATES (Navigation, Calendar & Show Adding)
  const [demoTheme, setDemoTheme] = useState<'dark' | 'light'>('dark');
  const [addShowTab, setAddShowTab] = useState<'search' | 'buddy_picks'>('search');
  const [demoSearchQuery, setDemoSearchQuery] = useState('');
  const [addedShowsList, setAddedShowsList] = useState<string[]>(['Severance']);
  const [activeCalendarMonth, setActiveCalendarMonth] = useState(1);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(28);

  // SECTION 2 INTERACTIVE STATES (Show Cards & AI Spud Assistant)
  const [demoCardTier, setDemoCardTier] = useState<'watching' | 'up_next' | 'watched'>('watching');
  const [demoCardEpisode, setDemoCardEpisode] = useState(4);
  const [demoCardRating, setDemoCardRating] = useState(9.5);
  const [isDemoCardSpoilerShielded, setIsDemoCardSpoilerShielded] = useState(true);
  const [spudsAiMode, setSpudsAiMode] = useState<'catchup' | 'recap' | 'compromise'>('catchup');
  const [isSpudsTyping, setIsSpudsTyping] = useState(false);
  const [demoCardActionNotice, setDemoCardActionNotice] = useState<string | null>(null);

  // SECTION 3 INTERACTIVE STATES (Dashboard & Queue Management)
  const [activeCategoryTab, setActiveCategoryTab] = useState<'watching' | 'up_next' | 'watched' | 'all'>('watching');
  const [selectedProviderFilter, setSelectedProviderFilter] = useState<string>('all');
  const [discoveryScope, setDiscoveryScope] = useState<'your_shows' | 'buddy_picks'>('your_shows');
  const [heroEpisodeWatched, setHeroEpisodeWatched] = useState(false);

  // SECTION 4 INTERACTIVE STATES (Social & Binge Buddies)
  const [isBuddyDropdownOpen, setIsBuddyDropdownOpen] = useState(false);
  const [selectedBuddyId, setSelectedBuddyId] = useState<string>('julio');
  const [buddiesModalTab, setBuddiesModalTab] = useState<'network' | 'buddies' | 'find' | 'invite'>('network');
  const [networkUserTier, setNetworkUserTier] = useState<'basic' | 'vip'>('vip');
  const [borrowSuccessShow, setBorrowSuccessShow] = useState<string | null>(null);
  const [findTatersQuery, setFindTatersQuery] = useState('');

  // SECTION 5 INTERACTIVE STATES (User Profile & Preferences - Default to Julio's JLZ Avatar)
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Sci-Fi', 'Prestige Drama', 'Psychological Thriller']);
  const [selectedTones, setSelectedTones] = useState<string[]>(['Mind-Bending', 'Witty & Sarcastic']);
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<Record<string, boolean>>({
    'Apple TV+': true,
    'HBO Max': true,
    'Netflix': true,
    'Hulu': true,
    'Prime Video': false,
    'Disney+': false
  });

  const handleCopy = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2500);
  }, []);

  const showNotification = useCallback((msg: string) => {
    setDemoCardActionNotice(msg);
    setTimeout(() => setDemoCardActionNotice(null), 3000);
  }, []);

  const scrollTo = useCallback((id: string) => {
    setActiveNav(id);
    const el = document.getElementById(`doc-section-${id}`);
    if (el) {
      const navOffset = 120;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleActionClick = useCallback((target: 'add_show' | 'calendar' | 'spudz_ai' | 'buddies' | 'avatar' | 'stats' | 'preferences') => {
    if (onNavigateTo) {
      onNavigateTo(target);
    } else if (onLaunchApp) {
      onLaunchApp();
    } else {
      onBack();
    }
  }, [onNavigateTo, onLaunchApp, onBack]);

  const navSections = useMemo(() => [
    { id: 'navigation', label: '1. Adding Content & Shows', short: '1. Adding Shows', icon: Plus },
    { id: 'dashboard', label: '2. Dashboard & Queues', short: '2. Dashboard', icon: BookmarkPlus },
    { id: 'showcards', label: '3. Show Cards & Spudz', short: '3. Show Cards', icon: Tv },
    { id: 'buddies', label: '4. Binge Buddies', short: '4. Buddies', icon: Users },
    { id: 'profile', label: '5. Profile & AI Taste', short: '5. Profile', icon: Sparkles },
  ], []);

  // Mock buddies data with DiceBear pixel art avatars and JLZ initials for Julio
  const buddiesList = useMemo(() => [
    {
      id: 'julio',
      name: 'Julio Zaldivar (JLZ)',
      shortName: 'Julio (JLZ)',
      initials: 'JLZ',
      avatarUrl: JULIO_OFFICIAL_AVATAR,
      avatarColor: 'bg-blue-600',
      currentlyWatching: 'Severance (Season 2)',
      platform: 'Apple TV+',
      progress: 'S2E4 / 10',
      progressPercent: 40,
      rating: '9.8',
      take: 'The Lumon severed floor reveal in episode 3 is absolute perfection.',
      sharedCount: 14,
      isHost: true
    },
    {
      id: 'sarah',
      name: 'Sarah M.',
      shortName: 'Sarah M.',
      initials: 'SM',
      avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Sarah',
      avatarColor: 'bg-purple-600',
      currentlyWatching: 'The Last of Us (Season 2)',
      platform: 'HBO Max',
      progress: 'S2E2 / 9',
      progressPercent: 22,
      rating: '9.4',
      take: 'Bella Ramsey and Pedro Pascal deliver an emotionally devastating premiere.',
      sharedCount: 9,
      isHost: false
    },
    {
      id: 'marcus',
      name: 'Marcus K.',
      shortName: 'Marcus K.',
      initials: 'MK',
      avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Marcus',
      avatarColor: 'bg-emerald-600',
      currentlyWatching: 'Slow Horses (Season 4)',
      platform: 'Apple TV+',
      progress: 'S4E6 / 6 (Completed)',
      progressPercent: 100,
      rating: '9.9',
      take: 'Gary Oldman as Jackson Lamb is the best television character of the decade.',
      sharedCount: 12,
      isHost: false
    }
  ], []);

  const currentBuddy = buddiesList.find(b => b.id === selectedBuddyId) || buddiesList[0];

  const allShowsCatalog = [
    { id: 'sev', title: 'Severance (Season 2)', service: 'Apple TV+', tier: 'watching', ep: 'S2E4', totalEp: 10, curEpNum: 4, rating: 9.8, img: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&q=80' },
    { id: 'tlou', title: 'The Last of Us (Season 2)', service: 'HBO Max', tier: 'up_next', ep: 'Queued', totalEp: 9, curEpNum: 0, rating: 9.4, img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80' },
    { id: 'sh', title: 'Slow Horses (Season 4)', service: 'Apple TV+', tier: 'watched', ep: 'Completed (6/6)', totalEp: 6, curEpNum: 6, rating: 9.9, img: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80' },
    { id: 'bear', title: 'The Bear (Season 3)', service: 'Hulu', tier: 'watching', ep: 'S3E6', totalEp: 10, curEpNum: 6, rating: 9.1, img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80' },
    { id: 'dip', title: 'The Diplomat (Season 2)', service: 'Netflix', tier: 'up_next', ep: 'Queued', totalEp: 6, curEpNum: 0, rating: 8.8, img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80' },
    { id: 'pkin', title: 'The Penguin', service: 'HBO Max', tier: 'watched', ep: 'Completed (8/8)', totalEp: 8, curEpNum: 8, rating: 9.3, img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&q=80' }
  ];

  const filteredShows = useMemo(() => {
    return allShowsCatalog.filter(s => {
      if (selectedProviderFilter !== 'all' && s.service !== selectedProviderFilter) return false;
      if (activeCategoryTab !== 'all' && s.tier !== activeCategoryTab) return false;
      return true;
    });
  }, [selectedProviderFilter, activeCategoryTab]);

  const tasteCalibrationScore = useMemo(() => {
    const base = 50;
    const genreScore = selectedGenres.length * 10;
    const toneScore = selectedTones.length * 8;
    return Math.min(99, base + genreScore + toneScore);
  }, [selectedGenres, selectedTones]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white flex flex-col relative overflow-x-clip">
      
      {/* Background Subtle Gradient Blobs matching Login/Landing Page */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/15 to-violet-600/15 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-[700px] right-0 w-[550px] h-[550px] bg-sky-500/10 blur-3xl pointer-events-none rounded-full" />

      {/* ========================================================================= */}
      {/* STICKY HEADER NAVIGATION BAR - RESPONSIVE & ALWAYS ACCESSIBLE */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/90 transition-all shadow-xl shadow-slate-950/50">
        
        {/* Reading Progress Line */}
        <ReadingProgressBar />

        {/* Primary Header Row */}
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3">
          
          {/* Logo & Return */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            <button
              onClick={onBack}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm border border-blue-400/40 shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 transition-all duration-200 cursor-pointer flex items-center gap-2 group shrink-0 hover:scale-105 active:scale-95"
              title="Return to CouchTaterz Application"
            >
              <ArrowLeft className="w-4 h-4 text-white group-hover:-translate-x-1 transition-transform" />
              <span className="font-black tracking-tight">Return to App</span>
            </button>

            <div className="h-6 w-px bg-slate-800 hidden sm:block" />

            {/* Exact App Logo Match */}
            <div 
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group shrink-0"
              onClick={scrollToTop}
              title="CouchTaterz: Guide & Manual"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center shadow-md shadow-blue-600/25 text-white shrink-0 group-hover:scale-105 transition-transform">
                <Tv className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="text-sm sm:text-lg font-black tracking-tight uppercase leading-none whitespace-nowrap">
                    <span className="text-blue-500">COUCH</span>
                    <span className="text-white">TATERZ</span>
                  </h1>
                  <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 text-[9px] sm:text-[10px] font-black uppercase tracking-wider border border-blue-500/30 whitespace-nowrap">
                    Guide & Manual
                  </span>
                </div>
                <p className="text-[8.5px] sm:text-[10.5px] font-extrabold tracking-[0.2em] text-slate-400 uppercase mt-0.5 sm:mt-1 leading-none whitespace-nowrap">
                  YOUR BINGE BUDDY
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar in Header */}
          <div className="flex items-center gap-2 shrink-0">
            <GuideSearchBar onSelectTopic={scrollTo} variant="header" />
          </div>
        </div>

        {/* Secondary Sticky Nav: Section Switcher Bar (Fully Visible on ALL Screens with smooth horizontal scrolling) */}
        <div className="border-t border-slate-800/80 bg-slate-950/80 px-2 sm:px-6 lg:px-8 py-1.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            
            <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0 hidden lg:flex font-semibold">
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              <span>Chapters:</span>
            </div>

            <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none py-0.5 w-full lg:w-auto snap-x">
              {navSections.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeNav === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => scrollTo(sec.id)}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 snap-start shrink-0 active:scale-95 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400 font-extrabold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 bg-slate-900/50 border border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="hidden md:inline">{sec.label}</span>
                    <span className="md:hidden">{sec.short}</span>
                  </button>
                );
              })}
            </nav>

            <button
              onClick={scrollToTop}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 shrink-0 transition cursor-pointer"
              title="Jump to Top"
            >
              <ChevronUp className="w-3.5 h-3.5 text-blue-400" />
              <span>Top</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* HERO DOCUMENTATION HEADER */}
      {/* ========================================================================= */}
      <section className="relative z-30 overflow-visible pt-10 sm:pt-14 pb-12 sm:pb-14 border-b border-slate-800/80 bg-gradient-to-b from-slate-900/60 via-slate-950 to-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 text-center space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs font-black shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>Official User Guide & Feature Manual</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.1]"
          >
            CouchTaterz: User Guide & Feature Manual
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto font-medium leading-relaxed"
          >
            A social, AI-powered TV tracker built to help you track watch progress, connect with friends, and discover personalized recommendations without spoilers.
          </motion.p>

          {/* Interactive Hero Search & Quick Jump Palette */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="pt-2 pb-1"
          >
            <GuideSearchBar onSelectTopic={scrollTo} variant="hero" />
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* MAIN DOCUMENTATION BODY - 5 CORE SECTIONS */}
      {/* ========================================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-20 flex-1 relative z-10 w-full">
        
        {/* SECTION 1: NAVIGATION & SHOW ADDING */}
        <div className="[content-visibility:auto] [contain-intrinsic-size:1px_700px]">
          <NavigationSection
            demoTheme={demoTheme}
            setDemoTheme={setDemoTheme}
            addShowTab={addShowTab}
            setAddShowTab={setAddShowTab}
            demoSearchQuery={demoSearchQuery}
            setDemoSearchQuery={setDemoSearchQuery}
            addedShowsList={addedShowsList}
            setAddedShowsList={setAddedShowsList}
            showNotification={showNotification}
            handleActionClick={handleActionClick}
            activeCalendarMonth={activeCalendarMonth}
            setActiveCalendarMonth={setActiveCalendarMonth}
            selectedCalendarDay={selectedCalendarDay}
            setSelectedCalendarDay={setSelectedCalendarDay}
          />
        </div>

        {/* SECTION 2: DASHBOARD & QUEUES */}
        <div className="[content-visibility:auto] [contain-intrinsic-size:1px_700px]">
          <DashboardSection
            heroEpisodeWatched={heroEpisodeWatched}
            setHeroEpisodeWatched={setHeroEpisodeWatched}
            selectedProviderFilter={selectedProviderFilter}
            setSelectedProviderFilter={setSelectedProviderFilter}
            discoveryScope={discoveryScope}
            setDiscoveryScope={setDiscoveryScope}
            activeCategoryTab={activeCategoryTab}
            setActiveCategoryTab={setActiveCategoryTab}
            filteredShows={filteredShows}
          />
        </div>

        {/* SECTION 3: SHOW CARDS & SPUDS AI */}
        <div className="[content-visibility:auto] [contain-intrinsic-size:1px_700px]">
          <ShowCardsSection
            demoCardEpisode={demoCardEpisode}
            setDemoCardEpisode={setDemoCardEpisode}
            demoCardRating={demoCardRating}
            setDemoCardRating={setDemoCardRating}
            demoCardTier={demoCardTier}
            setDemoCardTier={setDemoCardTier}
            isDemoCardSpoilerShielded={isDemoCardSpoilerShielded}
            setIsDemoCardSpoilerShielded={setIsDemoCardSpoilerShielded}
            demoCardActionNotice={demoCardActionNotice}
            showNotification={showNotification}
            spudsAiMode={spudsAiMode}
            setSpudsAiMode={setSpudsAiMode}
            isSpudsTyping={isSpudsTyping}
            setIsSpudsTyping={setIsSpudsTyping}
            handleActionClick={handleActionClick}
          />
        </div>

        {/* SECTION 4: BINGE BUDDIES & SOCIAL (Julio JLZ avatar updated) */}
        <div className="[content-visibility:auto] [contain-intrinsic-size:1px_700px]">
          <BuddiesSection
            isBuddyDropdownOpen={isBuddyDropdownOpen}
            setIsBuddyDropdownOpen={setIsBuddyDropdownOpen}
            selectedBuddyId={selectedBuddyId}
            setSelectedBuddyId={setSelectedBuddyId}
            buddiesList={buddiesList}
            currentBuddy={currentBuddy}
            borrowSuccessShow={borrowSuccessShow}
            setBorrowSuccessShow={setBorrowSuccessShow}
            buddiesModalTab={buddiesModalTab}
            setBuddiesModalTab={setBuddiesModalTab}
            networkUserTier={networkUserTier}
            setNetworkUserTier={setNetworkUserTier}
            findTatersQuery={findTatersQuery}
            setFindTatersQuery={setFindTatersQuery}
            copiedKey={copiedKey}
            handleCopy={handleCopy}
            handleActionClick={handleActionClick}
          />
        </div>

        {/* SECTION 5: PROFILE & AI TASTE (Julio JLZ signature configuration) */}
        <div className="[content-visibility:auto] [contain-intrinsic-size:1px_700px]">
          <ProfileSection
            tasteCalibrationScore={tasteCalibrationScore}
            selectedGenres={selectedGenres}
            setSelectedGenres={setSelectedGenres}
            selectedTones={selectedTones}
            selectedSubscriptions={selectedSubscriptions}
            setSelectedSubscriptions={setSelectedSubscriptions}
            handleActionClick={handleActionClick}
          />
        </div>

      </main>

      {/* Floating Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-40 p-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white shadow-2xl shadow-blue-600/40 border border-blue-400/30 transition-all cursor-pointer group flex items-center gap-2 text-xs font-bold"
            title="Back to Top"
          >
            <ChevronUp className="w-4 h-4 text-white group-hover:-translate-y-0.5 transition-transform" />
            <span className="hidden sm:inline">Top</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-10 text-center text-xs text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <div className="flex items-center justify-center gap-2 font-black text-slate-200">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white">
              <Tv className="w-3.5 h-3.5" />
            </div>
            <span>COUCHTATERZ</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 font-semibold">YOUR BINGE BUDDY</span>
          </div>
          <p>© {new Date().getFullYear()} CouchTaterz Inc. All rights reserved. Built for TV lovers everywhere.</p>
        </div>
      </footer>
    </div>
  );
};

