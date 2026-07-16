/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { TvShow, Board, StreamingService, ShowStatus, User, UserPreferences } from './types';
import { ShowCard } from './components/ShowCard';
import { UpcomingCarousel } from './components/UpcomingCarousel';
import { AddShowModal } from './components/AddShowModal';
import { ChatAgent } from './components/ChatAgent';
import { ShareBoardModal } from './components/ShareBoardModal';
import { ManageActiveShowsModal } from './components/ManageActiveShowsModal';
import { RecommendationsCarousel } from './components/RecommendationsCarousel';
import { ShowCalendarModal } from './components/ShowCalendarModal';
import { StreamingStatsModal } from './components/StreamingStatsModal';
import { LoginPage } from './components/LoginPage';
import { PreferencesModal } from './components/PreferencesModal';
import { 
  Tv, 
  Plus, 
  Search, 
  Users, 
  Sparkles, 
  Moon, 
  Sun, 
  MessageSquare, 
  ChevronRight, 
  ChevronDown,
  Share2,
  Compass, 
  Filter,
  SlidersHorizontal,
  Bot,
  Check,
  Calendar as CalendarIcon,
  BarChart3,
  Archive,
  Clock,
  LogOut,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('coughtater_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [board, setBoard] = useState<Board | null>(null);
  const [boardId, setBoardId] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    const queryBoard = params.get('board');
    if (queryBoard) {
      return queryBoard.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    }
    const saved = localStorage.getItem('coughtater_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u && u.id) return u.id;
      } catch (e) {}
    }
    return 'default';
  });

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentUserShows, setCurrentUserShows] = useState<TvShow[]>([]);
  const [currentUserPrefs, setCurrentUserPrefs] = useState<UserPreferences>({ genres: [], actors: [], directors: [], services: [] });

  // Self-heal corrupted user IDs from localStorage on load
  useEffect(() => {
    if (currentUser) {
      if (currentUser.name === 'Julio' && currentUser.id !== 'default') {
        const correctedUser = { ...currentUser, id: 'default' };
        setCurrentUser(correctedUser);
        localStorage.setItem('coughtater_user', JSON.stringify(correctedUser));
        setBoardId('default');
      } else if (currentUser.name === 'AnnaDee' && currentUser.id !== 'user-lily-9367') {
        const correctedUser = { ...currentUser, id: 'user-lily-9367' };
        setCurrentUser(correctedUser);
        localStorage.setItem('coughtater_user', JSON.stringify(correctedUser));
        setBoardId('user-lily-9367');
      }
    }
  }, [currentUser]);

  // Keep currentUserShows and currentUserPrefs in sync
  useEffect(() => {
    if (!currentUser) {
      setCurrentUserShows([]);
      setCurrentUserPrefs({ genres: [], actors: [], directors: [], services: [] });
      return;
    }

    if (boardId === currentUser.id && board) {
      setCurrentUserShows(board.shows);
      setCurrentUserPrefs(board.preferences || { genres: [], actors: [], directors: [], services: [] });
    } else {
      fetch(`/api/boards?id=${currentUser.id}`)
        .then(res => {
          if (res.ok) return res.json();
          throw new Error();
        })
        .then((data: Board) => {
          if (data) {
            if (Array.isArray(data.shows)) {
              setCurrentUserShows(data.shows);
            }
            if (data.preferences) {
              setCurrentUserPrefs(data.preferences);
            }
          }
        })
        .catch(err => {
          console.error("Failed to fetch current user's shows and preferences:", err);
        });
    }
  }, [currentUser, boardId, board]);

  useEffect(() => {
    if (!currentUser) return;
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAllUsers(data);
        }
      })
      .catch(err => console.error("Failed to load users:", err));
  }, [currentUser, boardId]);

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Modals / Panels
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); // Mobile chat panel toggle
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false); // Desktop sidebar toggle
  const chatAgentRef = useRef<HTMLDivElement>(null);
  const [isManageActiveOpen, setIsManageActiveOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<StreamingService | 'All'>('All');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'library' | 'queue'>('active');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'airingNext' | 'recent' | 'rtScore' | 'userScore' | 'title' | 'category'>('airingNext');
  const [showStarterAlert, setShowStarterAlert] = useState(false);

  // Load board code from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryBoard = params.get('board');
    if (queryBoard) {
      const cleanCode = queryBoard.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
      if (cleanCode) {
        setBoardId(cleanCode);
      }
    } else if (currentUser) {
      setBoardId(currentUser.id);
    }
  }, [currentUser]);

  // Default to 'View All' if visiting a friend's board, default to 'active' on own board
  useEffect(() => {
    if (currentUser && boardId) {
      if (boardId !== currentUser.id) {
        setActiveTab('all');
      } else {
        setActiveTab('active');
      }
    }
  }, [boardId, currentUser]);

  // Sync / Fetch board data
  useEffect(() => {
    if (!currentUser) return; // Wait until logged in
    const fetchBoard = async () => {
      try {
        const localKey = `couchtater_board_${boardId}`;
        const localSaved = localStorage.getItem(localKey);
        if (localSaved) {
          try {
            const parsed = JSON.parse(localSaved);
            if (parsed && parsed.shows) {
              setBoard(parsed);
            }
          } catch (e) {}
        }

        const res = await fetch(`/api/boards?id=${boardId}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.shows) {
            data.shows = data.shows.map((s: any) => {
              if (s.status === 'Dropped') {
                return { ...s, status: 'Backlog' as ShowStatus };
              }
              return s;
            });
          }
          
          let finalBoard = data;
          if (localSaved) {
            try {
              const parsedLocal = JSON.parse(localSaved);
              if (parsedLocal && parsedLocal.updatedAt && data.updatedAt) {
                const localTime = new Date(parsedLocal.updatedAt).getTime();
                const serverTime = new Date(data.updatedAt).getTime();
                if (localTime > serverTime) {
                  // Local modifications are newer! Sync them back to server
                  finalBoard = parsedLocal;
                  await fetch('/api/boards', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(parsedLocal),
                  });
                }
              }
            } catch (e) {}
          }
          
          setBoard(finalBoard);
          localStorage.setItem(localKey, JSON.stringify(finalBoard));
        }
      } catch (err) {
        console.error("Failed to load board data from server:", err);
      }
    };
    fetchBoard();
  }, [boardId, currentUser]);

  // Sync board updates back to server
  const saveBoardToServer = async (updatedShows: TvShow[], customName?: string) => {
    if (!board) return;
    try {
      const updatedBoard: Board = {
        ...board,
        name: customName || board.name,
        shows: updatedShows,
        updatedAt: new Date().toISOString()
      };
      
      // Optimistic update
      setBoard(updatedBoard);

      // Instantly cache locally so progress is never lost
      localStorage.setItem(`couchtater_board_${boardId}`, JSON.stringify(updatedBoard));

      await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBoard),
      });
    } catch (err) {
      console.error("Failed to save board updates to server:", err);
    }
  };

  const handleSavePreferences = (updatedPrefs: UserPreferences) => {
    if (!board) return;
    const updatedBoard: Board = {
      ...board,
      preferences: updatedPrefs,
      updatedAt: new Date().toISOString()
    };
    setBoard(updatedBoard);

    fetch('/api/boards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedBoard),
    }).catch(err => console.error("Failed to save board preferences:", err));
  };

  const handleUpdateProfileAndPreferences = (updatedUser: User, updatedPrefs: UserPreferences) => {
    if (!board) return;
    const updatedBoard: Board = {
      ...board,
      owner: updatedUser,
      preferences: updatedPrefs,
      updatedAt: new Date().toISOString()
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('coughtater_user', JSON.stringify(updatedUser));
    setBoard(updatedBoard);
    setCurrentUserPrefs(updatedPrefs);

    fetch('/api/boards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedBoard),
    })
    .then(() => {
      // Re-fetch users list to keep Visit dropdown in sync!
      return fetch('/api/users');
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        setAllUsers(data);
      }
    })
    .catch(err => console.error("Failed to save profile & preferences:", err));
  };

  // Add a new show
  const handleAddShow = (newShow: TvShow) => {
    if (!board) return;
    const updatedShows = [newShow, ...board.shows];
    saveBoardToServer(updatedShows);
  };

  // Update show details (e.g. progress bump, user ratings, status swap)
  const handleUpdateShow = (updatedShow: TvShow) => {
    if (!board) return;
    const updatedShows = board.shows.map(s => s.id === updatedShow.id ? updatedShow : s);
    saveBoardToServer(updatedShows);
  };

  // Delete a show
  const handleDeleteShow = (id: string) => {
    if (!board) return;
    const updatedShows = board.shows.filter(s => s.id !== id);
    saveBoardToServer(updatedShows);
  };

  // Change board / join family board
  const handleJoinBoard = (newCode: string) => {
    setBoardId(newCode);
    const params = new URLSearchParams(window.location.search);
    params.set('board', newCode);
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  };

  // Toggle theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Handle successful login
  const handleLogin = (loggedBoard: Board, options?: { showStarterPackAlert?: boolean }) => {
    if (loggedBoard.owner) {
      setCurrentUser(loggedBoard.owner);
      localStorage.setItem('coughtater_user', JSON.stringify(loggedBoard.owner));
    }
    setBoard(loggedBoard);
    setBoardId(loggedBoard.id);
    const params = new URLSearchParams(window.location.search);
    params.set('board', loggedBoard.id);
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);

    if (options?.showStarterPackAlert) {
      setActiveTab('queue');
      setSortBy('rtScore');
      setShowStarterAlert(true);
    }
  };

  // Handle logout
  const handleLogout = () => {
    setCurrentUser(null);
    setBoard(null);
    setBoardId('default');
    localStorage.removeItem('coughtater_user');
    const params = new URLSearchParams(window.location.search);
    params.delete('board');
    window.history.replaceState({}, '', `${window.location.pathname}`);
  };

  // Handle delete profile and start over
  const handleDeleteProfileAndStartOver = async () => {
    if (!currentUser) return;
    try {
      await fetch(`/api/boards?id=${currentUser.id}`, {
        method: 'DELETE'
      });
      localStorage.removeItem(`couchtater_board_${currentUser.id}`);
      handleLogout();
      setIsPreferencesOpen(false);
    } catch (err) {
      console.error("Failed to delete profile and start over:", err);
    }
  };

  // Copy show to current user's queue board
  const handleAddToMyQueue = async (friendShow: TvShow) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/boards?id=${currentUser.id}`);
      if (res.ok) {
        const myBoard: Board = await res.json();
        
        // Avoid duplicates by title match
        const exists = myBoard.shows.some(s => s.title.toLowerCase() === friendShow.title.toLowerCase());
        if (exists) {
          alert(`"${friendShow.title}" is already in your collection!`);
          return;
        }

        const clonedShow: TvShow = {
          ...friendShow,
          id: `show-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          status: 'Backlog',
          latestWatched: { season: 1, episode: 1, title: 'Episode 1' },
          userScore: null,
          userNotes: '',
          createdAt: new Date().toISOString()
        };

        const updatedShows = [clonedShow, ...myBoard.shows];
        const updatedBoard: Board = {
          ...myBoard,
          shows: updatedShows,
          updatedAt: new Date().toISOString()
        };

        const saveRes = await fetch('/api/boards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedBoard),
        });

        if (saveRes.ok) {
          alert(`"${friendShow.title}" has been successfully added to your queue area!`);
          setCurrentUserShows(updatedShows);
        }
      }
    } catch (err) {
      console.error("Failed to copy show to your queue:", err);
      alert("Could not copy show. Please try again.");
    }
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-[#0F1115] flex flex-col justify-center items-center text-center p-6 space-y-4">
        <Tv className="w-12 h-12 text-slate-700 animate-pulse" />
        <p className="text-slate-400 font-medium text-xs">Assembling your television dashboard...</p>
      </div>
    );
  }

  // Compute list of unique genres present in current followed shows
  const allGenres = ['All', ...Array.from(new Set(board.shows.flatMap(s => s.genres)))].sort();

  // Filter & Sort shows
  const filteredShows = board.shows
    .filter(s => {
      const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.actors.some(a => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            s.directors.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesService = selectedService === 'All' || s.streamingService === selectedService;
      const matchesGenre = selectedGenre === 'All' || s.genres.includes(selectedGenre);
      
      let matchesTab = true;
      if (activeTab === 'all') {
        matchesTab = true;
      } else if (activeTab === 'active') {
        matchesTab = s.status === 'Watching';
      } else if (activeTab === 'library') {
        matchesTab = s.status === 'Completed' || s.status === 'Dropped' || (s.isFavorite === true && s.status !== 'Watching' && s.status !== 'Backlog');
      } else if (activeTab === 'queue') {
        matchesTab = s.status === 'Backlog';
      }

      return matchesSearch && matchesService && matchesGenre && matchesTab;
    })
    .sort((a, b) => {
      if (sortBy === 'airingNext') {
        const getAirTime = (s: typeof a) => {
          if (s.concluded || !s.nextEpisode || !s.nextEpisode.airDate) {
            return Infinity;
          }
          const parts = s.nextEpisode.airDate.split('-');
          let airTime = Infinity;
          if (parts.length === 3) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const day = parseInt(parts[2], 10);
            if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
              airTime = new Date(year, month, day).getTime();
            }
          } else {
            const parsed = new Date(s.nextEpisode.airDate).getTime();
            if (!isNaN(parsed)) {
              airTime = parsed;
            }
          }

          // Filter out past air dates by comparing to start of today
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (airTime < today.getTime()) {
            return Infinity;
          }

          return airTime;
        };

        const timeA = getAirTime(a);
        const timeB = getAirTime(b);

        if (timeA !== timeB) {
          return timeA - timeB;
        }
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'recent') {
        return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
      }
      if (sortBy === 'rtScore') {
        return b.rottenTomatoesScore - a.rottenTomatoesScore;
      }
      if (sortBy === 'userScore') {
        return (b.userScore || 0) - (a.userScore || 0);
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'category') {
        const catA = a.genres[0] || '';
        const catB = b.genres[0] || '';
        if (catA !== catB) {
          return catA.localeCompare(catB);
        }
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  const activeStreamingServices: StreamingService[] = [
    'HBO', 'Disney+', 'Prime Video', 'Netflix', 'Hulu', 'Paramount+', 'Apple TV', 'Peacock', 'AMC+'
  ];

  const isFriendView = !!(board.owner && currentUser && board.owner.id !== currentUser.id);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${
      theme === 'dark' ? 'dark bg-[#0F1115] text-slate-100' : 'bg-neutral-50 text-neutral-900'
    }`}>
      
      {/* Master Container */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 space-y-6">
        
        {/* Top Header Group */}
        <div className="space-y-3">
          {/* Top Utility Bar (Board switcher, Collab, Member status) */}
          <div className="flex flex-row items-center justify-between gap-2.5 px-2 text-[11px] text-slate-500 dark:text-slate-400">
            {/* Board Selector & Collaboration Tools on Left */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Dashboard Selector */}
              {allUsers.length > 1 && (
                <div className="relative flex items-center">
                  <select
                    value={boardId}
                    onChange={(e) => handleJoinBoard(e.target.value)}
                    className={`border text-[10px] font-bold rounded-xl pl-6 pr-6 py-1 appearance-none cursor-pointer focus:outline-none focus:ring-0 ${
                      theme === 'dark' 
                        ? 'bg-transparent border-slate-800 text-slate-400 hover:text-slate-300 hover:border-slate-700' 
                        : 'bg-transparent border-neutral-300 text-neutral-600 hover:text-neutral-800 hover:border-neutral-400'
                    }`}
                  >
                    <option value={currentUser.id}>{isFriendView ? "Back to My Board" : "See Friends' Shows"}</option>
                    {allUsers
                      .filter(u => u.id !== currentUser.id)
                      .map(u => (
                        <option key={u.id} value={u.id}>Visit {u.name}'s Board</option>
                      ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-blue-400/80">
                    <Users className="w-2.5 h-2.5" />
                  </div>
                  <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-slate-500">
                    <ChevronDown className="w-2 h-2" />
                  </div>
                </div>
              )}

              {/* Collaboration/Share button */}
              <button
                onClick={() => setIsShareOpen(true)}
                className={`p-1.5 rounded-xl border transition hover:scale-[1.02] cursor-pointer ${
                  boardId === 'default' || boardId === currentUser.id
                    ? theme === 'dark'
                      ? 'bg-transparent border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      : 'bg-transparent border-neutral-300 text-neutral-500 hover:text-neutral-700 hover:border-neutral-400'
                    : theme === 'dark'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-[#1E3029]'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'
                }`}
                title={boardId === currentUser.id ? 'Personal Watchlist (Click to collaborate)' : `Collaborating on "${boardId}"`}
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Active Session info on Right */}
            <div className="flex items-center gap-1.5 sm:gap-3 ml-auto shrink-0">
              <button
                onClick={() => setIsPreferencesOpen(true)}
                className="flex items-center gap-1 cursor-pointer hover:opacity-85 active:scale-98 transition-all group"
                title="View & Edit Preferences / Profile"
              >
                <img
                  src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${currentUser.name}`}
                  alt={currentUser.name}
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-blue-500/30 group-hover:border-blue-400 transition-colors"
                />
                <span className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors max-w-[70px] sm:max-w-none truncate">{currentUser.name}</span>
              </button>

              <span className="text-slate-300 dark:text-slate-800">|</span>

              <button
                onClick={handleLogout}
                className="hover:text-rose-500 font-bold transition flex items-center gap-1 cursor-pointer"
                title="Sign Out of CouchTaterz"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden xs:inline">Sign Out</span>
                <span className="xs:hidden">Out</span>
              </button>
            </div>
          </div>

          {/* Navigation / Header */}
          <header className={`flex flex-row items-center justify-between gap-4 p-4 rounded-3xl border transition-all ${
            theme === 'dark' ? 'bg-[#1A1D23] border-white/5' : 'bg-white border-neutral-200/80 shadow-sm'
          }`}>
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl flex items-center justify-center transition ${
                theme === 'dark' ? 'bg-[#262A33] text-blue-500' : 'bg-neutral-100 text-neutral-800'
              }`}>
                <Tv className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base sm:text-lg font-black tracking-tighter uppercase text-blue-500">COUCH<span className={theme === 'dark' ? 'text-white' : 'text-neutral-900'}>TATERZ</span></h1>
                  <span className="hidden sm:inline px-1.5 py-0.5 text-[8px] font-extrabold bg-[#262A33] text-slate-400 border border-white/5 rounded tracking-widest uppercase">Sync v1.2</span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium">TV Show & Streaming Tracker</p>
              </div>
            </div>

            {/* Core Tools Panel - Highly focused and clutter-free */}
            <div className="flex items-center gap-2">
              {/* Toggle Theme */}
              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-2xl border transition hover:scale-105 cursor-pointer ${
                  theme === 'dark' 
                    ? 'bg-[#262A33] border-white/5 text-slate-400 hover:bg-[#1A1D23] hover:text-slate-300' 
                    : 'bg-neutral-100 border-neutral-200 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-800'
                }`}
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* AI Scout Toggle (Mobile and Desktop integrated) */}
              <button
                onClick={() => {
                  const isCurrentlyOpen = typeof window !== 'undefined' && window.innerWidth < 768 ? isChatOpen : isAiSidebarOpen;
                  const nextVal = !isCurrentlyOpen;
                  setIsAiSidebarOpen(nextVal);
                  setIsChatOpen(nextVal);
                  if (nextVal) {
                    setTimeout(() => {
                      chatAgentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 150);
                  }
                }}
                className={`p-2.5 rounded-2xl border transition hover:scale-105 cursor-pointer ${
                  isAiSidebarOpen || isChatOpen 
                    ? theme === 'dark'
                      ? 'bg-emerald-600/20 border-emerald-500/30 text-emerald-400'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : theme === 'dark'
                      ? 'bg-emerald-600/10 border-emerald-500/15 text-emerald-400 hover:bg-emerald-600/20'
                      : 'bg-neutral-100 border-neutral-200 text-emerald-600 hover:bg-neutral-200'
                }`}
                title="Toggle CouchTaterz AI Assistant"
              >
                <Bot className={`w-4 h-4 ${(isAiSidebarOpen || isChatOpen) ? 'animate-pulse' : ''}`} />
              </button>

              {/* View Calendar Trigger */}
              <button
                onClick={() => setIsCalendarOpen(true)}
                className={`px-3 py-2.5 rounded-2xl border transition hover:scale-[1.02] flex items-center gap-1.5 font-bold text-xs cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-[#262A33] border-white/5 text-blue-400 hover:bg-[#1C2028]'
                    : 'bg-neutral-100 border-neutral-200 text-blue-600 hover:bg-neutral-200'
                }`}
                title="View Calendar of Airing Episodes"
              >
                <CalendarIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Calendar</span>
              </button>

              {/* Add Show Trigger - Desktop only inside the header */}
              {!isFriendView && (
                <button
                  onClick={() => setIsAddOpen(true)}
                  className="hidden sm:flex px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs items-center justify-center gap-1.5 transition hover:scale-[1.02] shadow-lg shadow-blue-950/20 border border-blue-500/25 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Show</span>
                </button>
              )}
            </div>
          </header>

          {/* Mobile-only Add Show Button (outside the header container) */}
          {!isFriendView && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex sm:hidden w-full px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs items-center justify-center gap-1.5 transition active:scale-[0.98] shadow-lg shadow-blue-950/20 border border-blue-500/25 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Show</span>
            </button>
          )}
        </div>

        {/* Friend View Banner */}
        {isFriendView && (
          <div className={`sticky top-0 z-40 py-2 -mx-4 px-4 md:-mx-8 md:px-8 transition-colors duration-300 ${
            theme === 'dark' ? 'bg-[#0F1115]/95 backdrop-blur-md' : 'bg-neutral-50/95 backdrop-blur-md'
          }`}>
            <div className={`rounded-3xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between shadow-lg transition-all duration-300 ${
              isScrolled 
                ? 'p-3 gap-2.5 text-[11px] sm:text-xs' 
                : 'p-4 gap-4 text-xs'
            } ${
              theme === 'dark' 
                ? 'bg-blue-600/10 border-blue-500/20' 
                : 'bg-blue-50 border-blue-200/60'
            }`}>
              <div className="flex items-center gap-3 text-left">
                <div className={`shrink-0 transition-all duration-300 ${
                  isScrolled ? 'p-1.5 rounded-lg' : 'p-2 rounded-xl'
                } ${
                  theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                }`}>
                  <Users className={isScrolled ? "w-4 h-4" : "w-5 h-5"} />
                </div>
                <div>
                  <p className={`font-bold leading-snug ${theme === 'dark' ? 'text-slate-200' : 'text-blue-900'}`}>
                    Viewing Friend's Collection ({board.owner?.name || 'Friend'})
                  </p>
                  <p className={`mt-0.5 transition-all duration-300 ${theme === 'dark' ? 'text-slate-400' : 'text-blue-700/80'} hidden sm:block`}>
                    You can copy any show from this board to your personal queue area by clicking "Add to my queue".
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleJoinBoard(currentUser.id)}
                className={`w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0 shadow-sm ${
                  isScrolled ? 'px-3 py-1.5 text-[11px]' : 'px-4 py-2'
                }`}
              >
                <ArrowLeft className={isScrolled ? "w-3 h-3" : "w-3.5 h-3.5"} />
                <span>Back to My Board</span>
              </button>
            </div>
          </div>
        )}

        {/* Top Feature: Upcoming Episodes Billboard Carousel */}
        <section className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5 text-slate-500" />
              <span>{board.owner?.name || 'Julio'}'s New Episodes & Active Countdowns</span>
            </h3>
            <button
              onClick={() => setIsManageActiveOpen(true)}
              className="text-[10px] font-bold bg-[#1A1D23] hover:bg-[#262A33] text-slate-400 hover:text-white border border-white/5 rounded px-2.5 py-1 transition flex items-center gap-1 cursor-pointer"
            >
              <span>
                {board.shows.filter(s => {
                  const isEligible = s.isFavorite || (s.status === 'Watching');
                  if (!isEligible || !s.nextEpisode || s.concluded) return false;
                  
                  const airDateStr = s.nextEpisode.airDate;
                  if (!airDateStr) return false;
                  
                  const parts = airDateStr.split('-');
                  let airTime = 0;
                  if (parts.length === 3) {
                    airTime = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)).getTime();
                  } else {
                    airTime = new Date(airDateStr).getTime();
                  }
                  
                  const thirtyDaysLater = new Date();
                  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
                  const thirtyDaysTime = thirtyDaysLater.setHours(23, 59, 59, 999);
                  
                  return airTime <= thirtyDaysTime;
                }).length} Featured & Airing
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <UpcomingCarousel shows={board.shows} onUpdateShow={handleUpdateShow} />
        </section>

        {/* Dashboard Workspace Grid (Split column for Chat sidebar) */}
        <main className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* Main List Section (2 cols on Desktop, or 3 cols if sidebar is collapsed) */}
          <div className={`${isAiSidebarOpen ? 'md:col-span-2' : 'md:col-span-3'} space-y-6`}>
            
            {/* Elegant Streaming Services Quick Filter Ribbon */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">Streaming Service Coverage</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
                <button
                  onClick={() => setSelectedService('All')}
                  className={`px-4 py-2 rounded-2xl font-bold text-xs border shrink-0 snap-start transition ${
                    selectedService === 'All'
                      ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                      : theme === 'dark' 
                        ? 'bg-[#1A1D23] border-white/5 text-slate-400 hover:text-white hover:bg-[#262A33]' 
                        : 'bg-white border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  All Services
                </button>
                {activeStreamingServices.map((service) => {
                  const isActive = selectedService === service;
                  const count = board.shows.filter(s => s.streamingService === service).length;
                  return (
                    <button
                      key={service}
                      onClick={() => setSelectedService(service)}
                      className={`px-4 py-2 rounded-2xl font-bold text-xs border shrink-0 snap-start transition flex items-center gap-1.5 ${
                        isActive
                           ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                          : theme === 'dark'
                            ? 'bg-[#1A1D23] border-white/5 text-slate-400 hover:text-white hover:bg-[#262A33]'
                            : 'bg-white border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                      }`}
                    >
                      <span>{service}</span>
                      {count > 0 && (
                        <span className={`text-[10px] rounded px-1.5 py-0.5 ${isActive ? 'bg-blue-700 text-white' : 'bg-[#0F1115] text-slate-500'}`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
                {/* Hide stats button for now */}
              </div>
            </div>

            {/* Elegant Main Workspace Category Tabs */}
            <div className={`p-1 bg-[#1A1D23] rounded-3xl border border-white/5 shadow-inner ${
              isFriendView ? 'grid grid-cols-3 sm:flex gap-1.5' : 'flex gap-1.5'
            }`}>
              {([
                ...(isFriendView ? [{ id: 'all', label: 'View All', icon: <Compass className="w-3.5 h-3.5 shrink-0" />, count: board.shows.length }] : []),
                { id: 'active', label: 'Active Watchlist', icon: <Tv className="w-3.5 h-3.5 shrink-0" />, count: board.shows.filter(s => s.status === 'Watching').length },
                { id: 'queue', label: 'Queue Area', icon: <Clock className="w-3.5 h-3.5 shrink-0" />, count: board.shows.filter(s => s.status === 'Backlog').length },
                { id: 'library', label: 'Library & Favorites', icon: <Archive className="w-3.5 h-3.5 shrink-0" />, count: board.shows.filter(s => s.status === 'Completed' || s.status === 'Dropped' || (s.isFavorite === true && s.status !== 'Watching' && s.status !== 'Backlog')).length }
              ] as { id: 'all' | 'active' | 'queue' | 'library'; label: string; icon: React.ReactNode; count: number }[]).map((tab) => {
                const isActive = activeTab === tab.id;
                const isAllTab = tab.id === 'all';
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (tab.id === 'active') {
                        setSortBy('airingNext');
                      } else {
                        setSortBy('rtScore');
                      }
                    }}
                    className={`relative py-3 px-2 rounded-2xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-2 z-10 ${
                      isFriendView
                        ? isAllTab
                          ? 'col-span-3 w-full sm:flex-1'
                          : 'col-span-1 sm:flex-1'
                        : 'flex-1'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeWorkspaceTab"
                        className={`absolute inset-0 rounded-2xl -z-10 shadow-lg ${
                          tab.id === 'all'
                            ? 'bg-purple-600 shadow-purple-950/20'
                            : tab.id === 'active' 
                            ? 'bg-blue-600 shadow-blue-950/20' 
                            : tab.id === 'library'
                            ? 'bg-emerald-600 shadow-emerald-950/20'
                            : 'bg-amber-600 shadow-amber-950/20'
                        }`}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                    <span className={`flex items-center gap-1.5 ${isActive ? 'text-white font-extrabold' : 'text-slate-400 hover:text-slate-200'}`}>
                      {tab.icon}
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.id === 'all' ? 'All' : tab.id === 'active' ? 'Active' : tab.id === 'library' ? 'Library' : 'Queue'}</span>
                    </span>
                    <span className={`px-1.5 py-0.5 text-[9px] rounded-full font-black transition-colors duration-300 ${
                      isActive 
                        ? (tab.id === 'all' ? 'bg-purple-700 text-white' : tab.id === 'active' ? 'bg-blue-700 text-white' : tab.id === 'library' ? 'bg-emerald-700 text-white' : 'bg-amber-700 text-white') 
                        : 'bg-[#0F1115] text-slate-500'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

             {/* Filter controls & Search bar */}
            <div className={`p-4 rounded-3xl border space-y-4 transition-all duration-500 ${
              theme === 'dark' ? 'bg-[#1A1D23] border-white/5' : 'bg-white border-neutral-200 shadow-sm'
            } ${
              activeTab === 'all'
                ? 'shadow-[0_0_15px_rgba(147,51,234,0.03)] border-t-purple-500/20'
                : activeTab === 'active' 
                ? 'shadow-[0_0_15px_rgba(59,130,246,0.03)] border-t-blue-500/20' 
                : activeTab === 'library'
                ? 'shadow-[0_0_15px_rgba(16,185,129,0.03)] border-t-emerald-500/20'
                : 'shadow-[0_0_15px_rgba(245,158,11,0.03)] border-t-amber-500/20'
            }`}>
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search query input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search shows, actors, directors..."
                    className={`w-full pl-10 pr-4 py-3 rounded-2xl text-xs border focus:outline-none transition-all duration-300 ${
                      theme === 'dark' 
                        ? `bg-[#262A33] border-white/10 placeholder-slate-500 ${
                            activeTab === 'all'
                              ? 'focus:border-purple-500'
                              : activeTab === 'active' 
                              ? 'focus:border-blue-500' 
                              : activeTab === 'library' 
                              ? 'focus:border-emerald-500' 
                              : 'focus:border-amber-500'
                          }` 
                        : 'bg-neutral-100 border-neutral-200 focus:ring-1 focus:ring-neutral-300 placeholder-neutral-400'
                    }`}
                  />
                </div>

                {/* Compact Dropdown selectors */}
                <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                  {/* Sort By Dropdown Selector */}
                  <div className="relative min-w-[140px] flex-1 sm:flex-none">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className={`w-full border text-xs font-semibold rounded-2xl px-3.5 py-3 appearance-none cursor-pointer pr-8 ${
                        theme === 'dark' 
                          ? 'bg-[#262A33] border-white/10 text-slate-200' 
                          : 'bg-neutral-100 border-neutral-200 text-neutral-700'
                      }`}
                    >
                      {activeTab === 'active' && <option value="airingNext">Airing Next</option>}
                      <option value="recent">Added Date</option>
                      <option value="rtScore">RT Score</option>
                      <option value="userScore">Your Score</option>
                      <option value="title">Title (A-Z)</option>
                      <option value="category">Category (A-Z)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500">
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div className="relative min-w-[140px] flex-1 sm:flex-none">
                    <select
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                      className={`w-full border text-xs font-semibold rounded-2xl px-3.5 py-3 appearance-none cursor-pointer pr-8 ${
                        theme === 'dark' 
                          ? 'bg-[#262A33] border-white/10 text-slate-200' 
                          : 'bg-neutral-100 border-neutral-200 text-neutral-700'
                      }`}
                    >
                      <option value="All">All Categories</option>
                      {allGenres.filter(g => g !== 'All').map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500">
                      <Filter className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sorting and result summary count */}
              <div className="flex items-center justify-between pt-1 border-t border-neutral-800/10 dark:border-white/5 text-xs">
                <span className="text-slate-500 font-medium">
                  Showing {filteredShows.length} of {board.shows.length} shows
                </span>
                
                <div className="flex items-center gap-1.5 font-bold text-slate-500">
                  <span>Sorted by:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] border uppercase tracking-wider ${
                    theme === 'dark' ? 'bg-[#0F1115] border-white/5 text-slate-400' : 'bg-neutral-100 border-neutral-200 text-slate-600'
                  }`}>
                    {sortBy === 'airingNext' && 'Airing Next'}
                    {sortBy === 'recent' && 'Added'}
                    {sortBy === 'rtScore' && 'RT Score'}
                    {sortBy === 'userScore' && 'Your Score'}
                    {sortBy === 'title' && 'Title'}
                    {sortBy === 'category' && 'Category'}
                  </span>
                </div>
              </div>
            </div>

             {/* Category Header Indicator */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 py-1 bg-transparent rounded-2xl border border-transparent select-none transition-all duration-500">
              <div className="flex items-center gap-3">
                <div className={`w-1 h-6 rounded-full transition-all duration-500 ${
                  activeTab === 'all'
                    ? 'bg-purple-500 shadow-[0_0_12px_rgba(147,51,234,0.6)]'
                    : activeTab === 'active' 
                    ? 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]' 
                    : activeTab === 'library'
                    ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]'
                    : 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                }`} />
                <div>
                  <h2 className={`text-[10px] font-black tracking-wider uppercase transition-colors duration-500 ${
                    activeTab === 'all'
                      ? 'text-purple-400'
                      : activeTab === 'active' 
                      ? 'text-blue-400' 
                      : activeTab === 'library'
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }`}>
                    {activeTab === 'all' && 'Full Board Directory'}
                    {activeTab === 'active' && 'Active Watchlist Workspace'}
                    {activeTab === 'library' && 'Library, Completed & Favorites'}
                    {activeTab === 'queue' && 'The Backlog Queue Area'}
                  </h2>
                  <p className="text-[10px] text-slate-500">
                    {activeTab === 'all' && 'An all-inclusive overview of every single show tracked on this board.'}
                    {activeTab === 'active' && 'Real-time tracking of current seasons, release timers, and episode recaps.'}
                    {activeTab === 'library' && 'A curated sanctuary for completed series, dropped shows, and top favorites.'}
                    {activeTab === 'queue' && 'Shows scheduled for later. Tap play to move them to your Active Watchlist.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                {activeTab === 'active' && (
                  <button
                    onClick={() => setIsCalendarOpen(true)}
                    className={`px-3 py-1.5 text-[10px] font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/15'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-200'
                    }`}
                  >
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>Interactive Calendar View</span>
                  </button>
                )}

                {/* Desktop AI Sidebar Toggle Button when closed */}
                {!isAiSidebarOpen && (
                  <button
                    onClick={() => {
                      setIsAiSidebarOpen(true);
                      setTimeout(() => {
                        chatAgentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 150);
                    }}
                    className={`hidden md:flex px-3 py-1.5 text-[10px] font-black border rounded-xl transition items-center gap-1.5 cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border-emerald-500/15'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-emerald-600 border-neutral-200'
                    }`}
                    title="Open CouchTaterz Chat"
                  >
                    <Bot className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span>CouchTaterz</span>
                  </button>
                )}
              </div>
            </div>

            {/* TV Shows Bento Grid */}
            {filteredShows.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {filteredShows.map((show) => (
                  <ShowCard
                    key={show.id}
                    show={show}
                    onUpdateShow={handleUpdateShow}
                    onDeleteShow={handleDeleteShow}
                    isFriendView={isFriendView}
                    onAddToMyQueue={handleAddToMyQueue}
                    isAlreadyInCollection={isFriendView && currentUserShows.some(s => s.title.toLowerCase().trim() === show.title.toLowerCase().trim())}
                    subscribedServices={currentUserPrefs?.services || []}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-neutral-800 p-12 text-center space-y-4">
                <Tv className="w-10 h-10 text-neutral-600 mx-auto animate-pulse" />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-neutral-200">No matching shows found</h4>
                  <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                    Try adjusting your filters, clearing your search query, or use "Add Show" at the top to track a new one.
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* AI Scout Sidebar panel (Fixed right on desktop) */}
          <div ref={chatAgentRef} className={`${isAiSidebarOpen ? 'md:col-span-1 block' : 'hidden'} h-full`}>
            {/* Desktop Side Panel */}
            <div className="hidden md:block sticky top-6 h-fit max-h-[calc(100vh-100px)] md:max-h-[840px]">
              <ChatAgent shows={board.shows} onClose={() => setIsAiSidebarOpen(false)} />
            </div>
          </div>

          {/* Mobile Sheet Panel drawer */}
          <AnimatePresence>
            {isChatOpen && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md md:hidden flex justify-end">
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25 }}
                  className="w-[85vw] h-full bg-[#1A1D23] border-l border-white/5"
                >
                  <ChatAgent shows={board.shows} onClose={() => setIsChatOpen(false)} />
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </main>

        {/* AI Recommendations Section */}
        <section className="space-y-2">
          <RecommendationsCarousel
            shows={board.shows}
            preferences={board.preferences || { genres: [], actors: [], directors: [] }}
            onSavePreferences={handleSavePreferences}
            onAddRecommendedShow={handleAddShow}
          />
        </section>
      </div>

      {/* Floating Action Buttons for mobile */}
      <div className="fixed bottom-6 right-6 z-30 md:hidden flex flex-col gap-3 items-center">
        {!isFriendView && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="p-3 rounded-full bg-blue-600 text-white shadow-2xl shadow-blue-950/50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center border border-blue-500/20"
            title="Search & Add a Show"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => setIsChatOpen(true)}
          className="p-4 rounded-full bg-emerald-600 text-white shadow-2xl shadow-emerald-950/50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center border border-emerald-500/20"
          title="Chat with CouchTaterz"
        >
          <Bot className="w-5 h-5 animate-pulse" />
        </button>
      </div>

      {/* Modals Container */}
      <AnimatePresence>
        {isAddOpen && (
          <AddShowModal
            onClose={() => setIsAddOpen(false)}
            onAddShow={handleAddShow}
          />
        )}
        {isShareOpen && (
          <ShareBoardModal
            currentBoardId={boardId}
            onJoinBoard={handleJoinBoard}
            onClose={() => setIsShareOpen(false)}
          />
        )}
        {isManageActiveOpen && (
          <ManageActiveShowsModal
            shows={board.shows}
            onUpdateShow={handleUpdateShow}
            onDeleteShow={handleDeleteShow}
            onClose={() => setIsManageActiveOpen(false)}
          />
        )}
        {isCalendarOpen && (
          <ShowCalendarModal
            shows={board.shows}
            onUpdateShow={handleUpdateShow}
            onClose={() => setIsCalendarOpen(false)}
          />
        )}
        {isPreferencesOpen && (
          <PreferencesModal
            currentUser={currentUser}
            preferences={board.preferences || { genres: [], actors: [], directors: [] }}
            onSave={handleUpdateProfileAndPreferences}
            onDelete={handleDeleteProfileAndStartOver}
            onClose={() => setIsPreferencesOpen(false)}
          />
        )}
        {/* Hidden stats functionality for now */}
        {showStarterAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-slate-100"
            >
              {/* Background gradient light effects */}
              <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

              <div className="text-center space-y-4 relative z-10">
                <div className="inline-flex items-center justify-center p-3.5 bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 rounded-2xl shadow-xl shadow-amber-500/10 animate-pulse">
                  <Sparkles className="w-5 h-5 stroke-[2.2]" />
                </div>
                
                <h3 className="text-xl font-black tracking-tight text-white">
                  Welcome to CouchTaterz! 🎉
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed">
                  Your personalized <span className="text-amber-400 font-bold">Starter Pack</span> has been added directly to your <span className="text-blue-400 font-bold">Queue Area</span>!
                </p>

                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-left space-y-3">
                  <div className="flex gap-3">
                    <div className="p-1.5 h-fit rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">Starting in Queue</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Your shows are safely backlogged here so your Active Watchlist stays clean.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="p-1.5 h-fit rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                      <Tv className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">Start Tracking Anytime</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">You can move any show to your <span className="text-amber-400 font-bold">Active Watchlist</span> when you start watching. This unlocks real-time episode countdowns, calendar schedules, and smart tracking alerts!</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowStarterAlert(false)}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/5 active:scale-[0.99] cursor-pointer"
                >
                  Got it, let's explore!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
