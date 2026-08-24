import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Sparkles,
  Bot,
  Tv,
  Flame,
  ShieldCheck,
  Share2,
  Calendar,
  Award,
  Search,
  Users,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Zap,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  Layers,
  MessageSquare,
  Heart,
  Clock,
  Compass,
  Eye,
  EyeOff,
  Palette,
  ShoppingBag,
  BarChart3,
  Keyboard,
  Filter,
  Check,
  Copy,
  Star,
  Film,
  Sliders,
  X,
  Play,
  BookmarkPlus,
  TrendingUp,
  Share,
  Coffee,
  Smartphone,
  ChevronDown,
  CheckCheck,
  RefreshCw,
  ThumbsUp,
  AlertTriangle,
  Wand2,
  Plus,
  Trophy,
  Radio,
  ArrowUpRight
} from 'lucide-react';

export interface FeatureGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'dark' | 'light';
  onNavigateTo?: (target: 'add_show' | 'calendar' | 'spudz_ai' | 'buddies' | 'avatar' | 'stats' | 'preferences') => void;
}

interface SpotlightFeature {
  id: string;
  category: 'core' | 'ai' | 'social' | 'tools' | 'protips';
  headline: string;
  subheadline: string;
  pillBadge: string;
  accentColor: string; // Tailwind color class family
  valueMetric: string;
  painPoint: string;
  superpower: string;
  julioVerdict: string;
  bulletPoints: {
    icon: React.ElementType;
    title: string;
    description: string;
    tag?: string;
  }[];
  actionTarget?: 'add_show' | 'calendar' | 'spudz_ai' | 'buddies' | 'avatar' | 'stats' | 'preferences';
  actionLabel: string;
  actionIcon: React.ElementType;
}

export const FeatureGuideModal: React.FC<FeatureGuideModalProps> = ({
  isOpen,
  onClose,
  theme = 'dark',
  onNavigateTo,
}) => {
  const [activeTab, setActiveTab] = useState<string>('pipeline');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Interactive Mini-Demo States
  // 1. Pipeline Demo
  const [demoShowStage, setDemoShowStage] = useState<'watching' | 'backlog' | 'completed'>('watching');
  const [demoEpisodeTicker, setDemoEpisodeTicker] = useState<number>(4);

  // 2. Watercooler Spoiler Demo
  const [isDemoSpoilerOpen, setIsDemoSpoilerOpen] = useState<boolean>(false);
  const [demoStoryCardTheme, setDemoStoryCardTheme] = useState<'cyber' | 'warm' | 'noir'>('cyber');

  // 3. Spudz AI Simulator
  const [spudzPromptIndex, setSpudzPromptIndex] = useState<number>(0);
  const [isSpudzThinking, setIsSpudzThinking] = useState<boolean>(false);

  // 4. Potato Dress-Up Demo
  const [demoHat, setDemoHat] = useState<'crown' | 'glasses' | 'halo' | 'cap'>('glasses');
  const [demoItem, setDemoItem] = useState<'pizza' | 'remote' | 'soda' | 'popcorn'>('pizza');

  // 5. Calendar Demo Filter
  const [demoCalendarService, setDemoCalendarService] = useState<'all' | 'max' | 'apple' | 'netflix'>('all');

  const spotlightFeatures: SpotlightFeature[] = useMemo(() => [
    {
      id: 'pipeline',
      category: 'core',
      headline: 'The 3-Tier Watchlist Pipeline',
      subheadline: 'Eliminate the 45-minute nightly scroll and turn TV chaos into a clean, bingeable rotation.',
      pillBadge: 'Core Workflow',
      accentColor: 'blue',
      valueMetric: '⚡ Cuts Watch Paralysis by 90%',
      painPoint: 'Dumping 80 random shows into a flat list where you forget why you added them or what episode you paused on 6 months ago.',
      superpower: 'Three hyper-focused stages (Watching, Backlog, Trophy Case) with one-click progress counters and automatic air-date calculation.',
      julioVerdict: "Look, we've all added 30 shows after a couple drinks and then abandoned them all. The 3-Tier Pipeline forces honesty: what are you watching tonight, what's queued up next, and what earned a spot in the trophy case.",
      bulletPoints: [
        {
          icon: Play,
          title: 'Watching (Active Primetime)',
          description: 'Your immediate nightly rotation with live episode tickers, progress bars, and countdown clocks to next week’s drop.',
          tag: '1-Click +1 Ep'
        },
        {
          icon: BookmarkPlus,
          title: 'Backlog (The Deep Freezer)',
          description: 'Curated titles ready to binge once your current season wraps, paired with instant AI briefings before you press play.',
          tag: 'Clean Screen'
        },
        {
          icon: Trophy,
          title: 'Completed (The Trophy Case)',
          description: 'Your hall of fame with 1-10 scores, spice tags, final verdicts, and high-res social story cards for Instagram.',
          tag: 'Permanent Archive'
        }
      ],
      actionTarget: 'add_show',
      actionLabel: 'Add a Show to Pipeline',
      actionIcon: Plus
    },
    {
      id: 'watercooler',
      category: 'social',
      headline: 'Per-Episode Takes & Watercooler Log',
      subheadline: 'Log instant hot takes after every cliffhanger with zero fear of ruining plot twists for friends.',
      pillBadge: 'Crown Jewel',
      accentColor: 'amber',
      valueMetric: '🛡️ 100% Spoiler Protected',
      painPoint: 'Generic star ratings that judge 8 entire seasons as one number, plus accidentally getting spoiled by group chats or Twitter before you watch.',
      superpower: 'Log raw S1E1 reactions in seconds. Episodes ahead of your friends are automatically locked behind frosted spoiler blur shields.',
      julioVerdict: "I don't care about a bland 3-star rating from 2018. I want to read what my friend screamed at the screen during the S2 finale the minute the credits rolled. Episode takes are where the magic lives.",
      bulletPoints: [
        {
          icon: MessageSquare,
          title: 'Granular S{x}E{y} Takes',
          description: 'Document unfiltered episode reactions instantly. Press Cmd + Enter to save without taking your hands off the keyboard.',
          tag: 'Cmd+Enter Save'
        },
        {
          icon: ShieldCheck,
          title: 'Frosted Spoiler Blur Shields',
          description: 'Watercooler entries beyond a user’s current watched count stay blurred with a clear "Tap to Reveal" toggle.',
          tag: 'Safe Browsing'
        },
        {
          icon: Share2,
          title: '9:16 Instagram Story Generator',
          description: 'Convert any spicy take or season verdict into a gorgeous, high-resolution mobile story card ready for TikTok or IG.',
          tag: 'Viral Ready'
        }
      ],
      actionTarget: 'add_show',
      actionLabel: 'Browse & Log Takes',
      actionIcon: MessageSquare
    },
    {
      id: 'spudz_ai',
      category: 'ai',
      headline: 'Spudz AI — Sarcastic TV Genius',
      subheadline: 'Zero-spoiler episode catchups, pre-binge briefings, and the couple’s compromise matchmaking solver.',
      pillBadge: 'Gemini 3.7 Intelligence',
      accentColor: 'purple',
      valueMetric: '🧠 Ironclad Zero-Spoiler Fences',
      painPoint: 'Forgetting critical subplots after an 18-month hiatus between seasons, or spending an hour debating your partner on what to watch.',
      superpower: 'Spudz recaps strictly up to your exact current episode with zero future spoilers, plus analyzes friend boards to find consensus hits.',
      julioVerdict: "Spudz talks like a buddy who eats takeout on your carpet and has watched every prestige drama since 1999. He's funny, opinionated, and physically cannot spoil upcoming episodes.",
      bulletPoints: [
        {
          icon: Flame,
          title: 'Zero-Spoiler Episode Catch-Ups',
          description: 'Tell Spudz "I watched through S2E3" and get a punchy plot recap up to that second with an absolute embargo on future episodes.',
          tag: 'Ironclad Safe'
        },
        {
          icon: Users,
          title: 'Group Consensus Matchmaker',
          description: 'Spudz cross-analyzes all connected Binge Buddies’ ratings to find 3 shows that literally no one in the room will veto.',
          tag: 'No More Arguing'
        },
        {
          icon: Search,
          title: 'Natural Language Vibe Search',
          description: 'Search for "Grim 90s detective noir with cynical leads" or "brainless reality TV while folding laundry" and get instant matches.',
          tag: 'Vibe Match'
        }
      ],
      actionTarget: 'spudz_ai',
      actionLabel: 'Open Spudz AI Assistant',
      actionIcon: Bot
    },
    {
      id: 'buddies',
      category: 'social',
      headline: 'Binge Buddies & Cross-Board Espionage',
      subheadline: 'Peek at your friends’ live queues, steal their top-rated shows, and send 1-click recommendations.',
      pillBadge: 'Social Matrix',
      accentColor: 'emerald',
      valueMetric: '🤝 1-Tap Watchlist Cloning',
      painPoint: 'Asking in group chats for recommendations and receiving screenshots of iPhone notes that you lose track of immediately.',
      superpower: 'Link via custom URL or QR code. Browse friend boards, see what they rated 10/10, and clone titles directly into your Backlog with one tap.',
      julioVerdict: "Stop texting 'What should I watch?' every Friday. Link up with your friends, check their ratings, and steal their best finds in 2 seconds.",
      bulletPoints: [
        {
          icon: Users,
          title: 'Instant QR & Link Pairing',
          description: 'Generate your personal invite link or show your QR code to connect instantly without friction.',
          tag: 'Zero Sign-up Drag'
        },
        {
          icon: BookmarkPlus,
          title: '1-Click "Add to My Queue"',
          description: 'Steal any show from a buddy’s active rotation or trophy case directly into your own Backlog.',
          tag: 'Instant Clone'
        },
        {
          icon: Zap,
          title: 'Direct Recommendation Pings',
          description: 'Push curated show cards with personalized commentary directly into your friend’s CouchTaterz inbox.',
          tag: 'Social Hype'
        }
      ],
      actionTarget: 'buddies',
      actionLabel: 'Open Binge Buddies',
      actionIcon: Users
    },
    {
      id: 'calendar_radar',
      category: 'tools',
      headline: 'Airing Radar & Multi-Service Calendar',
      subheadline: 'Real-time air dates across HBO, Apple TV+, Netflix, Disney+, Hulu, and Prime in one unified timeline.',
      pillBadge: 'Schedule Sync',
      accentColor: 'indigo',
      valueMetric: '📅 1-Click iCal & Google Export',
      painPoint: 'Streaming platforms burying premiere dates and staggering episodes so you never know when season finales drop.',
      superpower: 'A single chronological release matrix with service filtering, countdown clocks, and instant export to your phone calendar (.ics).',
      julioVerdict: "Never miss a Sunday HBO premiere or Friday Apple TV drop again. One calendar, zero guesswork, synced directly to your phone.",
      bulletPoints: [
        {
          icon: Calendar,
          title: 'Chronological Release Matrix',
          description: 'Live countdowns for weekly drops, mid-season cliffhangers, and series finales filtered by your active streaming services.',
          tag: 'Live Countdowns'
        },
        {
          icon: ExternalLink,
          title: '1-Click Phone Calendar Sync',
          description: 'Export all your tracked upcoming air dates to Apple Calendar, Google Calendar, or Outlook with one tap.',
          tag: '.ICS Export'
        },
        {
          icon: Tv,
          title: 'Deep Streaming Launchers',
          description: 'Jump straight from your CouchTaterz board directly to the show’s page in Netflix, Max, or Apple TV+.',
          tag: 'No Clumsy Search'
        }
      ],
      actionTarget: 'calendar',
      actionLabel: 'Open Air Date Radar',
      actionIcon: Calendar
    },
    {
      id: 'avatar_studio',
      category: 'tools',
      headline: 'Spudz Avatar Studio & Binge Analytics',
      subheadline: 'Customize your potato drip, audit your streaming subscriptions, and generate custom merch.',
      pillBadge: 'VIP Studio',
      accentColor: 'pink',
      valueMetric: '🎨 Full Vector Potato Builder',
      painPoint: 'Boring generic user profiles that tell you nothing about your TV habits or how much money you waste on unused subscriptions.',
      superpower: 'Vector potato customizer with rare collectibles, streaming spend audits, and high-res mockups of personalized shirts and mugs.',
      julioVerdict: "Why settle for a plain avatar when your potato can wear 3D glasses, hold a slice of pepperoni pizza, and sport a Green Lantern ring while lounging on a velvet couch?",
      bulletPoints: [
        {
          icon: Palette,
          title: 'Vectorized Potato Customizer',
          description: 'Mix and match hats, sunglasses, snacks, and outfits that dynamically render across your story cards and quotes.',
          tag: '100% Unique'
        },
        {
          icon: BarChart3,
          title: 'Streaming Spend Auditor',
          description: 'Calculate your total hours watched, favorite genres, and audit which monthly streaming subscriptions you actually use.',
          tag: 'Save $$$'
        },
        {
          icon: ShoppingBag,
          title: 'Merch Preview Engine',
          description: 'Generate mockup t-shirts, coffee mugs, and stickers featuring your top episode quotes and avatar.',
          tag: 'Inside Joke Merch'
        }
      ],
      actionTarget: 'avatar',
      actionLabel: 'Open Avatar Studio',
      actionIcon: Palette
    },
    {
      id: 'protips',
      category: 'protips',
      headline: 'Power User Secrets & Speedruns',
      subheadline: 'The cheat sheet to operating CouchTaterz like an absolute television power wizard.',
      pillBadge: 'Pro Shortcuts',
      accentColor: 'yellow',
      valueMetric: '⌨️ Instant Cmd+Enter Saves',
      painPoint: 'Losing written reviews when a tab closes or clicking through multiple slow menus to mark an episode finished.',
      superpower: 'Real-time local draft auto-saving, fast keyboard hotkeys, and full-screen mobile PWA installation without app store friction.',
      julioVerdict: "Master these three shortcuts and you'll manage your entire watchlist in 10 seconds flat.",
      bulletPoints: [
        {
          icon: Keyboard,
          title: 'Cmd / Ctrl + Enter Instant Save',
          description: 'Commit takes and notes immediately without reaching for the mouse.',
          tag: 'Speed Save'
        },
        {
          icon: Smartphone,
          title: 'Full-Screen Mobile PWA',
          description: 'Add CouchTaterz to your iOS/Android home screen for a borderless, lightning-fast native experience.',
          tag: 'Zero App Store'
        },
        {
          icon: Sliders,
          title: 'Batch Active Show Manager',
          description: 'Prune dropped shows or archive completed seasons in under 5 seconds with the multi-select tool.',
          tag: 'Zero Clutter'
        }
      ],
      actionTarget: 'preferences',
      actionLabel: 'Open Settings & Preferences',
      actionIcon: Sliders
    }
  ], []);

  const currentFeature = useMemo(() => {
    return spotlightFeatures.find(f => f.id === activeTab) || spotlightFeatures[0];
  }, [spotlightFeatures, activeTab]);

  const filteredFeatures = useMemo(() => {
    if (!searchQuery.trim()) return spotlightFeatures;
    const q = searchQuery.toLowerCase().trim();
    return spotlightFeatures.filter(f =>
      f.headline.toLowerCase().includes(q) ||
      f.subheadline.toLowerCase().includes(q) ||
      f.painPoint.toLowerCase().includes(q) ||
      f.superpower.toLowerCase().includes(q) ||
      f.julioVerdict.toLowerCase().includes(q) ||
      f.bulletPoints.some(b => b.title.toLowerCase().includes(q) || b.description.toLowerCase().includes(q))
    );
  }, [spotlightFeatures, searchQuery]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const spudzPresets = [
    {
      title: 'Catch-Up Refresher (Severance S2E4)',
      q: 'Catch me up on Severance before I watch S2E5 tonight without spoiling anything!',
      a: 'Yo! Mark just accessed the encrypted sector with Dylan holding down the overtime switch. Helly’s Lumon heritage was revealed, and Cobel is spying from next door. Zero future spoilers ahead—hit play on Episode 5 with confidence, dude!'
    },
    {
      title: 'Partner Compromise Watcher',
      q: 'My partner loves True Detective and I want Sci-Fi. What do we watch together?',
      a: 'Lanterns (HBO 2026) is literally True Detective in outer space—gritty terrestrial homicide detectives with cosmic rings. If you want something currently streaming, put on Dark Matter on Apple TV+ right now. You’re welcome.'
    },
    {
      title: 'Quick Series Briefing (The Bear)',
      q: 'Give me the 10-second vibe check on The Bear Season 3.',
      a: 'Pure Michelin-star anxiety, gorgeous cinematography, and kitchen yelling turned into art. Binge rating: 9.2/10. Have a glass of water nearby.'
    }
  ];

  const handleTriggerSpudz = (index: number) => {
    setSpudzPromptIndex(index);
    setIsSpudzThinking(true);
    setTimeout(() => {
      setIsSpudzThinking(false);
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 20 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className={`relative w-full max-w-6xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
          theme === 'dark'
            ? 'bg-[#0E1118] border-slate-800/90 text-slate-100 shadow-slate-950/90'
            : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
        }`}
      >
        {/* TOP BRAND HEADER & SALES HERO */}
        <div className={`p-4 sm:p-6 border-b shrink-0 relative overflow-hidden ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-slate-900 via-slate-900/95 to-amber-950/30 border-slate-800'
            : 'bg-gradient-to-r from-slate-50 via-white to-amber-50/50 border-slate-200'
        }`}>
          {/* Ambient Lighting Accents */}
          <div className="absolute top-0 right-0 w-96 h-36 bg-amber-500/10 blur-3xl pointer-events-none -mr-20 -mt-10" />
          <div className="absolute bottom-0 left-1/4 w-72 h-20 bg-blue-500/10 blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-black uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>The CouchTaterz Superpower Manual</span>
                </span>
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Curated for High-Taste TV Binge Watchers
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2.5">
                <span>Everything You Need to Master Prestige Television</span>
              </h2>

              <p className={`text-xs sm:text-sm font-medium leading-relaxed ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Stop suffering through 45-minute scrolling paralysis and spoiler-filled group chats. Here is how CouchTaterz transforms your TV watching into pure entertainment joy.
              </p>
            </div>

            {/* Quick Search & Close */}
            <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
              <div className="relative min-w-[180px] sm:min-w-[220px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search superpowers..."
                  className={`w-full pl-9 pr-7 py-1.5 text-xs rounded-xl border font-medium outline-none transition ${
                    theme === 'dark'
                      ? 'bg-slate-950/80 border-slate-800 text-white placeholder-slate-500 focus:border-amber-500'
                      : 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500'
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                onClick={onClose}
                className={`p-2 rounded-2xl border transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-300'
                }`}
                title="Close Guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* VISUAL FEATURE NAVIGATION TABS */}
          <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none relative z-10">
            {spotlightFeatures.map((f) => {
              const isSelected = activeTab === f.id;
              let TabIcon = Layers;
              if (f.id === 'watercooler') TabIcon = MessageSquare;
              if (f.id === 'spudz_ai') TabIcon = Bot;
              if (f.id === 'buddies') TabIcon = Users;
              if (f.id === 'calendar_radar') TabIcon = Calendar;
              if (f.id === 'avatar_studio') TabIcon = Palette;
              if (f.id === 'protips') TabIcon = Zap;

              return (
                <button
                  key={f.id}
                  onClick={() => {
                    setActiveTab(f.id);
                    setSearchQuery('');
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer shrink-0 border ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 scale-[1.02]'
                      : theme === 'dark'
                      ? 'bg-slate-900/80 hover:bg-slate-800/90 text-slate-300 border-slate-800'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-sm'
                  }`}
                >
                  <TabIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : 'text-amber-400'}`} />
                  <span>{f.headline.split('—')[0].split('&')[0].trim()}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* MAIN BODY: FEATURE SPOTLIGHT SHOWCASE */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-8">
          {/* TOP FEATURE BANNER & VALUE BADGES */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: The Problem vs The Superpower (Sales Pitch) */}
            <div className="lg:col-span-7 space-y-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    {currentFeature.pillBadge}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCheck className="w-3 h-3" />
                    {currentFeature.valueMetric}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {currentFeature.headline}
                </h3>

                <p className={`text-sm leading-relaxed ${
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {currentFeature.subheadline}
                </p>
              </div>

              {/* High-Conversion "The Problem vs. CouchTaterz Superpower" Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* The Old Painful Way */}
                <div className={`p-3.5 rounded-2xl border space-y-2 ${
                  theme === 'dark' ? 'bg-red-950/15 border-red-500/20 text-red-200' : 'bg-red-50 border-red-200 text-red-900'
                }`}>
                  <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-red-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>The Old Way (Chaos)</span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">
                    {currentFeature.painPoint}
                  </p>
                </div>

                {/* The CouchTaterz Superpower */}
                <div className={`p-3.5 rounded-2xl border space-y-2 ${
                  theme === 'dark' ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}>
                  <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-400">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>CouchTaterz Superpower</span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-95">
                    {currentFeature.superpower}
                  </p>
                </div>
              </div>

              {/* Julio's Direct Commentary */}
              <div className={`p-4 rounded-2xl border relative overflow-hidden ${
                theme === 'dark'
                  ? 'bg-amber-950/20 border-amber-500/25 text-amber-100'
                  : 'bg-amber-50/90 border-amber-200 text-amber-950'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-amber-500/25 border border-amber-500/40 flex items-center justify-center font-black text-base text-amber-300 shrink-0">
                    🥔
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                        Julio's Raw Philosophy
                      </span>
                      <span className="text-[10px] text-slate-400">Founder Take</span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium italic leading-relaxed">
                      &ldquo;{currentFeature.julioVerdict}&rdquo;
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature Value Bullets */}
              <div className="space-y-2.5 pt-1">
                {currentFeature.bulletPoints.map((bp, idx) => {
                  const BPIcon = bp.icon;
                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl border flex items-start gap-3.5 transition ${
                        theme === 'dark'
                          ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0 mt-0.5">
                        <BPIcon className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-white">
                            {bp.title}
                          </h4>
                          {bp.tag && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold">
                              {bp.tag}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs leading-relaxed ${
                          theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          {bp.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Direct Feature CTA */}
              {currentFeature.actionTarget && onNavigateTo && (
                <div className="pt-3">
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateTo(currentFeature.actionTarget!);
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition cursor-pointer active:scale-95"
                  >
                    <currentFeature.actionIcon className="w-4 h-4 text-slate-950" />
                    <span>{currentFeature.actionLabel}</span>
                    <ArrowRight className="w-4 h-4 text-slate-950" />
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: LIVE INTERACTIVE PRODUCT PREVIEW / SANDBOX */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Interactive Live Preview</span>
                </span>
                <span className="text-[10px] text-slate-400">Click & Test Live</span>
              </div>

              {/* Dynamic Interactive Cards depending on active tab */}
              {activeTab === 'pipeline' && (
                <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                  {/* Pipeline Stage Switcher */}
                  <div className="flex items-center justify-between p-1 bg-slate-950 rounded-2xl border border-slate-800">
                    {(['watching', 'backlog', 'completed'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setDemoShowStage(st)}
                        className={`flex-1 py-1.5 rounded-xl text-[11px] font-black capitalize transition-all ${
                          demoShowStage === st
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {st === 'watching' ? '📺 Watching' : st === 'backlog' ? '⏳ Backlog' : '🏆 Trophy Case'}
                      </button>
                    ))}
                  </div>

                  {/* Simulated Show Card */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase">
                            Apple TV+
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">Sci-Fi • Mystery</span>
                        </div>
                        <h4 className="text-base font-black text-white mt-1">Severance (Season 2)</h4>
                      </div>
                      <span className="text-xs font-black text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                        <Star className="w-3 h-3 fill-amber-400" />
                        9.8
                      </span>
                    </div>

                    {/* Progress Bar & Interactive Ticker */}
                    {demoShowStage === 'watching' && (
                      <div className="space-y-2 pt-1 border-t border-slate-800/80">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                          <span>Episode Progress: S2E{demoEpisodeTicker} / 10</span>
                          <span className="text-emerald-400">{Math.round((demoEpisodeTicker / 10) * 100)}% Complete</span>
                        </div>

                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-emerald-400"
                            animate={{ width: `${(demoEpisodeTicker / 10) * 100}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-[10px] text-slate-400">Next Drop: Tonight 9:00 PM</span>
                          <button
                            onClick={() => setDemoEpisodeTicker(prev => (prev < 10 ? prev + 1 : 1))}
                            className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-md"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>+1 Ep (Watched S2E{demoEpisodeTicker})</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {demoShowStage === 'backlog' && (
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5">
                        <div className="font-bold text-amber-400 flex items-center gap-1">
                          <Bot className="w-3.5 h-3.5" />
                          <span>Spudz Pre-Binge Briefing Ready</span>
                        </div>
                        <p className="text-[11px] text-slate-300">
                          "Queued in your Backlog. Ready for this weekend once you finish The Bear. Binge difficulty: 10/10 workplace dread."
                        </p>
                      </div>
                    )}

                    {demoShowStage === 'completed' && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
                        <div className="font-bold text-amber-300 flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5" />
                          <span>Added to Trophy Case Hall of Fame</span>
                        </div>
                        <p className="text-[11px] text-slate-300">
                          Rated 10/10 • S2 Finale Masterpiece • Story Card Generated
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'watercooler' && (
                <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                  {/* Frosted Spoiler Shield Interactive Demo */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2 text-purple-400">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Julio's S1E1 Reaction:</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Lanterns (HBO)</span>
                    </div>

                    <div className="relative p-3 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden min-h-[75px] flex items-center justify-center">
                      <p className={`text-xs text-slate-200 leading-relaxed transition-all duration-300 ${
                        isDemoSpoilerOpen ? 'filter-none' : 'filter blur-sm select-none opacity-40'
                      }`}>
                        "Hal's kind of a dick. Loved the interrogation scene though—the chemistry between John Stewart and Jordan completely sells the True Detective in space vibe!"
                      </p>

                      {!isDemoSpoilerOpen && (
                        <button
                          onClick={() => setIsDemoSpoilerOpen(true)}
                          className="absolute inset-0 m-auto w-fit h-fit px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-lg flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Tap to Reveal Spoiler Take</span>
                        </button>
                      )}
                    </div>

                    {isDemoSpoilerOpen && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => setIsDemoSpoilerOpen(false)}
                          className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                        >
                          <EyeOff className="w-3 h-3" />
                          <span>Re-lock with Frosted Shield</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 9:16 Story Card Mockup */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-950 to-slate-900 border border-purple-500/20 text-center space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold px-1">
                      <span>9:16 Instagram Story Preview</span>
                      <span className="text-purple-400">Ready to Export</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-left space-y-1.5">
                      <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">CouchTaterz Verified Take</span>
                      <p className="text-xs font-serif italic text-white leading-relaxed">
                        &ldquo;Hal's kind of a dick. Loved the interrogation scene though...&rdquo;
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
                        <span>@julio • Lanterns S1E1</span>
                        <span>⭐ 9.5/10</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'spudz_ai' && (
                <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span className="flex items-center gap-1.5 text-purple-400">
                      <Bot className="w-4 h-4" />
                      <span>Ask Spudz Simulator</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Pick a prompt:</span>
                  </div>

                  {/* Prompt Preset Buttons */}
                  <div className="flex flex-col gap-1.5">
                    {spudzPresets.map((pr, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleTriggerSpudz(idx)}
                        className={`text-left p-2 rounded-xl text-[11px] font-bold transition flex items-center justify-between ${
                          spudzPromptIndex === idx
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                        }`}
                      >
                        <span>{pr.title}</span>
                        <ChevronRight className="w-3 h-3 opacity-70" />
                      </button>
                    ))}
                  </div>

                  {/* Spudz Chat Response Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 font-black text-xs flex items-center justify-center">
                        🥔
                      </div>
                      <span className="text-xs font-black text-amber-400">Spudz Replies:</span>
                    </div>

                    <div className="text-xs text-slate-200 leading-relaxed font-medium min-h-[60px]">
                      {isSpudzThinking ? (
                        <div className="flex items-center gap-2 py-4 text-slate-400">
                          <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
                          <span>Spudz is synthesizing with zero spoilers...</span>
                        </div>
                      ) : (
                        spudzPresets[spudzPromptIndex].a
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'buddies' && (
                <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                  {/* Friend Match Card */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 font-black flex items-center justify-center text-xs">
                          KZ
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-white">Kris's Active Queue</h5>
                          <span className="text-[10px] text-emerald-400 font-bold">96% Taste Consensus Match</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">
                        Binge Buddy
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-black uppercase text-amber-400">Kris Rated 10/10</span>
                        <h6 className="text-xs font-bold text-white">Dark Matter (Apple TV+)</h6>
                      </div>
                      <button
                        onClick={() => handleCopy('Dark Matter added to your Backlog!')}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black flex items-center gap-1 transition cursor-pointer"
                      >
                        <BookmarkPlus className="w-3 h-3" />
                        <span>Steal to Queue</span>
                      </button>
                    </div>

                    {copiedKey && (
                      <div className="text-center text-[10px] font-bold text-emerald-400 animate-fade-in">
                        ✓ {copiedKey}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'calendar_radar' && (
                <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span className="text-indigo-400 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>This Week’s Primetime Radar</span>
                    </span>
                    <span className="text-[10px] text-slate-400">2026 Season</span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { title: 'Severance (S2E5)', service: 'Apple TV+', time: 'Tonight 9:00 PM', status: 'Weekly Drop' },
                      { title: 'The Last of Us (S2E1)', service: 'Max (HBO)', time: 'Sunday 9:00 PM', status: 'Season Premiere' },
                      { title: 'The Bear (S3 Finale)', service: 'Hulu', time: 'In 3 Days', status: 'Finale' }
                    ].map((sh, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-blue-400">{sh.service}</span>
                            <span className="text-[10px] text-slate-500">• {sh.status}</span>
                          </div>
                          <h6 className="font-bold text-white">{sh.title}</h6>
                        </div>
                        <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-black">
                          {sh.time}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-[11px] text-indigo-200 flex items-center justify-between">
                    <span>Export to Apple/Google iCal</span>
                    <span className="font-black text-indigo-300">.ICS Ready →</span>
                  </div>
                </div>
              )}

              {activeTab === 'avatar_studio' && (
                <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                  {/* Interactive Potato Dress-up Sandbox */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center space-y-3">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-2 border-amber-500/30 flex flex-col items-center justify-center relative shadow-inner">
                      <span className="text-4xl select-none">🥔</span>
                      {demoHat === 'glasses' && <span className="absolute top-7 text-lg select-none">🕶️</span>}
                      {demoHat === 'crown' && <span className="absolute top-2 text-lg select-none">👑</span>}
                      {demoHat === 'halo' && <span className="absolute top-1 text-lg select-none">😇</span>}
                      {demoHat === 'cap' && <span className="absolute top-2 text-lg select-none">🧢</span>}

                      {demoItem === 'pizza' && <span className="absolute bottom-1 right-2 text-base select-none">🍕</span>}
                      {demoItem === 'remote' && <span className="absolute bottom-1 right-2 text-base select-none">📺</span>}
                      {demoItem === 'popcorn' && <span className="absolute bottom-1 right-2 text-base select-none">🍿</span>}
                      {demoItem === 'soda' && <span className="absolute bottom-1 right-2 text-base select-none">🥤</span>}
                    </div>

                    <span className="text-xs font-black text-amber-300">Custom Couch Potato Wardrobe</span>

                    {/* Accessories Selector */}
                    <div className="flex items-center gap-1.5 flex-wrap justify-center">
                      <span className="text-[10px] font-bold text-slate-400 mr-1">Headwear:</span>
                      {(['glasses', 'crown', 'halo', 'cap'] as const).map(h => (
                        <button
                          key={h}
                          onClick={() => setDemoHat(h)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize transition ${
                            demoHat === h ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {h}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap justify-center">
                      <span className="text-[10px] font-bold text-slate-400 mr-1">Snack:</span>
                      {(['pizza', 'remote', 'popcorn', 'soda'] as const).map(i => (
                        <button
                          key={i}
                          onClick={() => setDemoItem(i)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize transition ${
                            demoItem === i ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {i}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'protips' && (
                <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-4 h-4" />
                      <span>Speedrun Keyboard Shortcuts</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Tap to Copy</span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { key: 'Cmd / Ctrl + Enter', desc: 'Instantly save episode take or series review' },
                      { key: 'Click "+1 Ep"', desc: 'Fast-tick watched count on any active card' },
                      { key: 'PWA Install', desc: 'Install full-screen mobile app without app stores' },
                      { key: 'Shift + Delete', desc: 'Instant show removal without extra modal' }
                    ].map((sc, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleCopy(sc.key)}
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 flex items-center justify-between gap-3 text-xs cursor-pointer transition"
                      >
                        <div className="flex items-center gap-2">
                          <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono font-bold text-amber-300">
                            {sc.key}
                          </kbd>
                          <span className="text-[11px] text-slate-300">{sc.desc}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {copiedKey === sc.key ? <span className="text-emerald-400 font-bold">Copied!</span> : <Copy className="w-3 h-3" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* VALUE MATRIX COMPARISON TABLE: Why CouchTaterz Wins */}
          <div className={`p-6 rounded-3xl border space-y-4 ${
            theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="text-center space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                The Competitive Comparison
              </span>
              <h4 className="text-lg sm:text-xl font-black text-white">
                Why TV Fans Love CouchTaterz vs. Generic Watchlist Apps
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="text-xs font-black text-amber-400">🚀 Zero-Spoiler Intelligence</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Other apps spoil plot twists in generic review sections. CouchTaterz AI and frosted shields guarantee 100% spoiler safety up to your exact current episode.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="text-xs font-black text-blue-400">🎯 Granular Episode Takes</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Stop rating 6-season series with one generic star rating. Document your raw, funny episode reactions right after you finish watching.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="text-xs font-black text-emerald-400">🤝 Real Group Consensus</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Connect with Binge Buddies and let Spudz mathematically solve the Friday night argument by finding the 3 shows nobody will veto.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER ACTION BAR */}
        <div className={`p-4 px-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0 ${
          theme === 'dark' ? 'bg-slate-900/90 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-black">
              CouchTaterz 2026.8
            </span>
            <span className="text-[11px]">
              Crafted with love for couch potatoes who appreciate great TV.
            </span>
          </div>

          <div className="flex items-center gap-3">
            {currentFeature.actionTarget && onNavigateTo && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateTo(currentFeature.actionTarget!);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <span>{currentFeature.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
            >
              Back to My Board
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
