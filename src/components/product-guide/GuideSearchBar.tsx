import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, BookOpen, Tv, Layers, Users, Sparkles, Plus, Calendar, Shield, Sliders, Moon, CornerDownLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface GuideTopic {
  id: string;
  sectionId: string;
  title: string;
  category: string;
  snippet: string;
  keywords: string[];
  icon: React.ElementType;
  badge: string;
}

export const GUIDE_TOPICS: GuideTopic[] = [
  {
    id: 'global-search',
    sectionId: 'navigation',
    title: 'Global Catalog Search ("+ Add Shows")',
    category: '1. Adding Shows',
    snippet: 'Search millions of streaming titles with real-time auto-suggestions, Rotten Tomatoes scores, and provider badges.',
    keywords: ['search', 'catalog', 'add shows', 'modal', 'tmdb', 'rotten tomatoes', 'scores', 'streaming', 'titles'],
    icon: Search,
    badge: 'Section 1'
  },
  {
    id: 'buddys-picks',
    sectionId: 'navigation',
    title: "Buddy's Picks & Friend Borrowing",
    category: '1. Adding Shows',
    snippet: "Browse friend-vetted favorites scored by your inner circle and 1-click borrow them into your queue.",
    keywords: ['buddy', 'picks', 'borrow', 'friends', 'recommendations', 'inner circle', 'social discovery'],
    icon: Sparkles,
    badge: 'Section 1'
  },
  {
    id: 'binge-buddies-dropdown',
    sectionId: 'navigation',
    title: 'Binge Buddies Header Dropdown',
    category: '1. Adding Shows',
    snippet: "Switch to any friend's live board and click '+' on any card to instantly copy shows into your queue.",
    keywords: ['dropdown', 'switch', 'friends', 'dashboard', 'copy show', 'header', 'binge buddies'],
    icon: Users,
    badge: 'Section 1'
  },
  {
    id: 'air-date-radar',
    sectionId: 'navigation',
    title: 'Air Date Radar & Calendar Sync (ICS)',
    category: '1. Adding Shows',
    snippet: 'Track upcoming episode releases, countdown clocks, ICS calendar export for Apple/Google/Outlook, and interactive month grid.',
    keywords: ['air date', 'radar', 'calendar', 'ics', 'google calendar', 'apple calendar', 'countdown', 'schedule', 'episodes'],
    icon: Calendar,
    badge: 'Section 1'
  },
  {
    id: 'theme-toggle',
    sectionId: 'navigation',
    title: 'OLED Dark & Light Theme Modes',
    category: '1. Adding Shows',
    snippet: 'Seamlessly switch between deep OLED Dark mode and high-contrast Classic Light theme.',
    keywords: ['theme', 'dark mode', 'light mode', 'oled', 'contrast', 'appearance'],
    icon: Moon,
    badge: 'Section 1'
  },
  {
    id: 'dynamic-hero-banner',
    sectionId: 'dashboard',
    title: 'Dynamic Hero Air Banner',
    category: '2. Dashboard & Queues',
    snippet: 'Auto-populated spotlight banner with cinematic backdrop and 1-click episode watch (+1) progress advance.',
    keywords: ['hero', 'banner', 'air banner', 'spotlight', 'mark watched', 'severance', 'backdrop', 'cinematic'],
    icon: Tv,
    badge: 'Section 2'
  },
  {
    id: 'queue-pipelines',
    sectionId: 'dashboard',
    title: 'Queue Pipelines (Watching, Up Next, Watched)',
    category: '2. Dashboard & Queues',
    snippet: 'Manage your active viewing, queued backlog, and completed history with distinct color-coded badges and progress bars.',
    keywords: ['queues', 'watching', 'up next', 'watched', 'pipeline', 'tiers', 'status', 'backlog', 'completed'],
    icon: Layers,
    badge: 'Section 2'
  },
  {
    id: 'provider-filters',
    sectionId: 'dashboard',
    title: 'Streaming Service Provider Filters',
    category: '2. Dashboard & Queues',
    snippet: 'Filter visible show cards by Apple TV+, HBO Max, Hulu, Netflix, Prime Video, and Disney+.',
    keywords: ['filter', 'providers', 'streaming services', 'apple tv', 'netflix', 'hulu', 'max', 'disney', 'prime'],
    icon: Sliders,
    badge: 'Section 2'
  },
  {
    id: 'show-cards-controls',
    sectionId: 'showcards',
    title: 'Show Card Actions & Episode Stepper',
    category: '3. Show Cards & Spudz AI',
    snippet: 'Manage episode incrementers (+/-), tier dropdowns, 10-star rating system, and private notes.',
    keywords: ['show cards', 'counter', 'increment', 'decrement', 'rating', 'stars', 'episode stepper', 'card actions'],
    icon: Tv,
    badge: 'Section 3'
  },
  {
    id: 'spoiler-shielding',
    sectionId: 'showcards',
    title: 'Spoiler Shielding & Masked Synopses',
    category: '3. Show Cards & Spudz AI',
    snippet: 'Intelligently masks episode synopses and major plot details until manually unmasked with 1 click.',
    keywords: ['spoilers', 'spoiler shielding', 'masking', 'synopsis', 'plot twists', 'fenced', 'shield'],
    icon: Shield,
    badge: 'Section 3'
  },
  {
    id: 'spudz-ai-companion',
    sectionId: 'showcards',
    title: 'Spudz AI Smart TV Companion',
    category: '3. Show Cards & Spudz AI',
    snippet: 'AI-driven mood recommendations, personalized tags, and watch-next advice based on viewing habits.',
    keywords: ['spudz', 'ai', 'recommendations', 'mood', 'smart tags', 'companion', 'gemini'],
    icon: Sparkles,
    badge: 'Section 3'
  },
  {
    id: 'binge-buddies-network',
    sectionId: 'buddies',
    title: 'Binge Buddies Social Network & Friend Codes',
    category: '4. Binge Buddies',
    snippet: 'Share unique 6-digit friend codes, view live activity feeds, and manage your streaming circle.',
    keywords: ['friend code', 'buddies network', 'social', 'activity feed', 'vip tier', 'invite', 'buddies'],
    icon: Users,
    badge: 'Section 4'
  },
  {
    id: 'backlog-matching',
    sectionId: 'buddies',
    title: 'Backlog Cross-Referencing & Matching',
    category: '4. Binge Buddies',
    snippet: 'Instantly discover overlap between your unqueued wishlist and what friends are watching or have completed.',
    keywords: ['backlog', 'matching', 'overlap', 'shared shows', 'watch party', 'cross reference'],
    icon: Sparkles,
    badge: 'Section 4'
  },
  {
    id: 'taste-calibration',
    sectionId: 'profile',
    title: 'AI Taste Calibration & Profile Preferences',
    category: '5. Profile & AI Taste',
    snippet: 'Fine-tune favorite genres, storytelling tones, and active subscriptions to optimize Spudz AI matchmaking.',
    keywords: ['profile', 'taste', 'calibration', 'genres', 'tones', 'subscriptions', 'tuning', 'score', 'ai recommendations'],
    icon: Sliders,
    badge: 'Section 5'
  }
];

interface GuideSearchBarProps {
  onSelectTopic: (sectionId: string) => void;
  variant?: 'hero' | 'header';
}

export const GuideSearchBar: React.FC<GuideSearchBarProps> = ({ onSelectTopic, variant = 'hero' }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Global hotkey: Cmd+K / Ctrl+K or / to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter topics based on query
  const filteredTopics = useMemo(() => {
    if (!query.trim()) return GUIDE_TOPICS;
    const lower = query.toLowerCase().trim();
    return GUIDE_TOPICS.filter(t => 
      t.title.toLowerCase().includes(lower) ||
      t.category.toLowerCase().includes(lower) ||
      t.snippet.toLowerCase().includes(lower) ||
      t.keywords.some(k => k.toLowerCase().includes(lower))
    );
  }, [query]);

  // Handle keyboard navigation in result list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filteredTopics.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredTopics.length) % (filteredTopics.length || 1));
    } else if (e.key === 'Enter' && filteredTopics[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredTopics[selectedIndex].sectionId);
    }
  };

  const handleSelect = (sectionId: string) => {
    onSelectTopic(sectionId);
    setIsOpen(false);
    setQuery('');
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (variant === 'header') {
    return (
      <div className="relative" ref={containerRef}>
        <button
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/40 text-xs text-slate-300 hover:text-white transition flex items-center gap-2 shadow-sm cursor-pointer active:scale-95 group"
          title="Search Guide (⌘K)"
        >
          <Search className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
          <span className="hidden md:inline font-medium text-slate-400 group-hover:text-slate-200">
            Search guide...
          </span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold text-slate-400 bg-slate-950 rounded border border-slate-800">
            ⌘K
          </kbd>
        </button>

        {/* Header Dropdown Results Modal */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-x-4 top-20 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[480px] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-2xl"
            >
              <div className="p-3 border-b border-slate-800 flex items-center gap-2.5 bg-slate-950/80">
                <Search className="w-4 h-4 text-blue-400 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search topics, features, shortcuts..."
                  className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-hidden font-medium"
                  autoFocus
                />
                {query && (
                  <button onClick={() => setQuery('')} className="text-slate-400 hover:text-white p-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="max-h-[360px] overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
                {filteredTopics.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No matching topics found for "{query}".
                  </div>
                ) : (
                  filteredTopics.map((topic, idx) => {
                    const Icon = topic.icon;
                    const isSelected = idx === selectedIndex;
                    return (
                      <div
                        key={topic.id}
                        onClick={() => handleSelect(topic.sectionId)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`p-2.5 rounded-xl cursor-pointer transition flex items-start gap-3 ${
                          isSelected
                            ? 'bg-blue-600/20 border border-blue-500/40 text-white'
                            : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-blue-400'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-white truncate">
                              {topic.title}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-blue-300 shrink-0">
                              {topic.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {topic.snippet}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-2 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-[10px] text-slate-400 px-3">
                <span>Navigate with <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300">↑</kbd> <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300">↓</kbd></span>
                <span className="flex items-center gap-1">Press <CornerDownLeft className="w-3 h-3 text-blue-400" /> to jump</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Hero variant (large, prominent search bar in hero section)
  return (
    <div className="w-full max-w-2xl mx-auto relative z-50" ref={containerRef}>
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-sm opacity-30 group-hover:opacity-60 transition duration-300" />
        
        <div className="relative bg-slate-900/90 border border-slate-700/80 hover:border-blue-500/50 rounded-2xl p-2 sm:p-2.5 flex items-center gap-3 shadow-xl backdrop-blur-xl transition">
          <Search className="w-5 h-5 text-blue-400 shrink-0 ml-2" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setSelectedIndex(0);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search guide topics (e.g. 'Air Date Radar', 'Spoilers', 'Buddy's Picks', 'ICS')..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-400 focus:outline-hidden font-medium"
          />
          {query ? (
            <button
              onClick={() => {
                setQuery('');
                setIsOpen(false);
              }}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[10px] font-extrabold text-slate-400 bg-slate-950 rounded-lg border border-slate-800 mr-1.5 shrink-0">
              ⌘K
            </kbd>
          )}
        </div>
      </div>

      {/* Hero Dropdown Results Box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.99 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-2 bg-slate-900/98 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl z-50 text-left"
          >
            <div className="p-2 border-b border-slate-800/80 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400 px-3">
              <span className="font-semibold text-slate-300">
                {query ? `Search results for "${query}" (${filteredTopics.length})` : 'Popular Topics & Quick Jump'}
              </span>
              <span className="text-[10px]">Click any item to jump</span>
            </div>

            <div className="max-h-[380px] overflow-y-auto p-2 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
              {filteredTopics.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No matching topics found for "{query}". Try searching for "radar", "spoilers", "ratings", or "friends".
                </div>
              ) : (
                filteredTopics.map((topic, idx) => {
                  const Icon = topic.icon;
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={topic.id}
                      onClick={() => handleSelect(topic.sectionId)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`p-3 rounded-xl cursor-pointer transition flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-blue-600/20 border border-blue-500/40 text-white'
                          : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2.5 rounded-xl shrink-0 ${
                          isSelected ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'bg-slate-800 text-blue-400'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-white truncate">
                              {topic.title}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-blue-300 shrink-0">
                              {topic.badge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                            {topic.snippet}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className={`w-4 h-4 shrink-0 transition-transform ${
                        isSelected ? 'text-blue-400 translate-x-0.5' : 'text-slate-600'
                      }`} />
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
