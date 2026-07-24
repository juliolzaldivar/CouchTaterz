/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TvShow, Board, StreamingService, ShowStatus, User, UserPreferences, AppNotification } from './types';
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
import { QueueOnboardingModal } from './components/QueueOnboardingModal';
import { OnboardingWalkthrough } from './components/OnboardingWalkthrough';
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
  ArrowLeft,
  User as UserIcon,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

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
      const isPrimaryUser = currentUser.email?.toLowerCase() === 'juliozaldivar@gmail.com';
      if (isPrimaryUser && currentUser.id !== 'default') {
        const correctedUser = { ...currentUser, id: 'default', name: 'Julio' };
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
  const searchBarRef = useRef<HTMLDivElement>(null);
  const [isManageActiveOpen, setIsManageActiveOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [showQueueOnboarding, setShowQueueOnboarding] = useState(false);
  const [showFirstStatusPrompt, setShowFirstStatusPrompt] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<number | null>(null);
  const [autoDeleteOnboardingShow, setAutoDeleteOnboardingShow] = useState(true);
  const [onboardingTargetShowId, setOnboardingTargetShowId] = useState<string | null>(null);
  const [isNewlyRegisteredUser, setIsNewlyRegisteredUser] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Clean up legacy new user keys from localStorage to prevent issues on existing accounts
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('coughtater_is_new_user_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFamily, setSearchFamily] = useState(false);
  const [familyBoards, setFamilyBoards] = useState<Record<string, Board>>({});
  const [isLoadingFamilyBoards, setIsLoadingFamilyBoards] = useState(false);
  const [selectedService, setSelectedService] = useState<StreamingService | 'All'>('All');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'library' | 'queue'>('active');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'airingNext' | 'recent' | 'rtScore' | 'userScore' | 'title' | 'category'>('airingNext');
  const [showStarterAlert, setShowStarterAlert] = useState(false);
  const lastBoardIdRef = useRef<string | null>(null);

  const [showWorkflowGuide, setShowWorkflowGuide] = useState<boolean>(true);

  // Sync workflow guide display state whenever currentUser shifts or logs in/out
  useEffect(() => {
    if (!currentUser) {
      setShowWorkflowGuide(false);
      return;
    }
    try {
      const key = `coughtater_show_workflow_guide_${currentUser.id}`;
      const saved = localStorage.getItem(key);
      // Default to showing it if not explicitly set to 'false'
      setShowWorkflowGuide(saved !== 'false');
    } catch {
      setShowWorkflowGuide(true);
    }
  }, [currentUser?.id]);

  const handleDismissWorkflowGuide = () => {
    setShowWorkflowGuide(false);
    if (currentUser) {
      try {
        const key = `coughtater_show_workflow_guide_${currentUser.id}`;
        localStorage.setItem(key, 'false');
      } catch (e) {
        console.error(e);
      }
    }
  };

  const isAnyFilterActive = searchQuery.trim() !== '' || selectedService !== 'All' || selectedGenre !== 'All';

  const handleResetAllFilters = () => {
    setSearchQuery('');
    setSelectedService('All');
    setSelectedGenre('All');
  };

  const [completedShowToast, setCompletedShowToast] = useState<{ id: string; title: string; bannerImage: string } | null>(null);

  const triggerCompletionConfetti = (show: TvShow) => {
    const trigger = typeof confetti === 'function' ? confetti : (confetti as any).default;
    if (!trigger) {
      console.warn('Confetti function not available, triggering fallback toast');
      setCompletedShowToast({
        id: show.id,
        title: show.title,
        bannerImage: show.bannerImage
      });
      return;
    }

    // 1. Center main burst
    trigger({
      particleCount: 140,
      spread: 90,
      origin: { y: 0.65 },
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6']
    });

    // 2. Left side burst
    setTimeout(() => {
      trigger({
        particleCount: 70,
        angle: 60,
        spread: 60,
        origin: { x: 0.1, y: 0.75 },
        colors: ['#3B82F6', '#10B981', '#F59E0B']
      });
    }, 150);

    // 3. Right side burst
    setTimeout(() => {
      trigger({
        particleCount: 70,
        angle: 120,
        spread: 60,
        origin: { x: 0.9, y: 0.75 },
        colors: ['#3B82F6', '#EC4899', '#8B5CF6']
      });
    }, 300);

    setCompletedShowToast({
      id: show.id,
      title: show.title,
      bannerImage: show.bannerImage
    });
  };

  useEffect(() => {
    if (completedShowToast) {
      const timer = setTimeout(() => {
        setCompletedShowToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [completedShowToast]);

  // State to track dismissed upcoming backlog show alerts
  const [dismissedActivationIds, setDismissedActivationIds] = useState<string[]>([]);

  // Sync dismissed activation IDs when board changes
  useEffect(() => {
    if (!board) return;
    try {
      const saved = localStorage.getItem(`dismissed_activation_shows_${board.id}`);
      setDismissedActivationIds(saved ? JSON.parse(saved) : []);
    } catch {
      setDismissedActivationIds([]);
    }
  }, [board?.id]);

  // Sync all family boards from the backend when family search is toggled
  useEffect(() => {
    if (searchFamily) {
      setIsLoadingFamilyBoards(true);
      fetch('/api/boards?all=true')
        .then(res => {
          if (res.ok) return res.json();
          throw new Error();
        })
        .then((data: Record<string, Board>) => {
          setFamilyBoards(data);
          setIsLoadingFamilyBoards(false);
        })
        .catch(err => {
          console.error("Failed to load family boards:", err);
          setIsLoadingFamilyBoards(false);
        });
    }
  }, [searchFamily]);

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
      if (boardId !== lastBoardIdRef.current) {
        if (boardId !== currentUser.id) {
          setActiveTab('all');
        } else {
          const isNewUser = isNewlyRegisteredUser;
          const hasSeenOnboarding = localStorage.getItem(`seen_queue_onboarding_${currentUser.id}`) === 'true';
          const hasStarterPack = localStorage.getItem(`coughtater_starter_pack_${currentUser.id}`) !== 'false';
          if (showStarterAlert || (isNewUser && !hasSeenOnboarding && hasStarterPack)) {
            setActiveTab('queue');
          } else {
            setActiveTab('active');
          }
        }
        lastBoardIdRef.current = boardId;
      }
    }
  }, [boardId, currentUser, showStarterAlert]);

  // Set default sorting based on the active tab
  useEffect(() => {
    if (activeTab === 'active') {
      setSortBy('airingNext');
    } else if (activeTab === 'library') {
      setSortBy('title');
    } else {
      setSortBy('rtScore');
    }
  }, [activeTab]);

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
        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
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
        } else {
          console.log("Skipping parse: response is not valid JSON or request failed", res.status);
        }
      } catch (err) {
        console.warn("Transient: Failed to load board data from server:", err);
      }
    };
    fetchBoard();
  }, [boardId, currentUser]);

  // Poll for board/notifications updates every 10 seconds
  useEffect(() => {
    if (!currentUser || !boardId) return;
    
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/boards?id=${boardId}`);
        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          const data = await res.json();
          setBoard(prevBoard => {
            if (!prevBoard) return data;
            const hasNotifChanges = JSON.stringify(prevBoard.notifications || []) !== JSON.stringify(data.notifications || []);
            if (data.updatedAt !== prevBoard.updatedAt || hasNotifChanges) {
              const localKey = `couchtater_board_${boardId}`;
              localStorage.setItem(localKey, JSON.stringify(data));
              return data;
            }
            return prevBoard;
          });
        }
      } catch (err) {
        console.warn("Transient: Failed to poll board updates:", err);
      }
    }, 10000);

    return () => clearInterval(interval);
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

    // Progress Step 5 to Step 6 when a show is added
    if (onboardingStep === 5) {
      setOnboardingStep(6);
      setActiveTab('active');
      setSearchFamily(false);
      setTimeout(() => {
        const element = searchBarRef.current;
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }

    const exists = board.shows.some(s => s.title.toLowerCase().trim() === newShow.title.toLowerCase().trim());
    let updatedShows;
    if (exists) {
      updatedShows = board.shows.map(s => 
        s.title.toLowerCase().trim() === newShow.title.toLowerCase().trim()
          ? { 
              ...s, 
              title: newShow.title,
              streamingService: newShow.streamingService,
              genres: newShow.genres,
              rottenTomatoesScore: newShow.rottenTomatoesScore,
              overview: newShow.overview,
              directors: newShow.directors,
              actors: newShow.actors,
              bannerImage: newShow.bannerImage,
              concluded: newShow.concluded,
              totalSeasons: newShow.totalSeasons,
              episodesPerSeason: newShow.episodesPerSeason,
              nextEpisode: newShow.nextEpisode
            }
          : s
      );
    } else {
      updatedShows = [newShow, ...board.shows];
    }
    saveBoardToServer(updatedShows);
  };

  // Update show details (e.g. progress bump, user ratings, status swap)
  const handleUpdateShow = (updatedShow: TvShow) => {
    if (!board) return;
    
    const prevShow = board.shows.find(s => s.id === updatedShow.id);

    // Onboarding Step 1: Click Watching on the first show card
    if (onboardingStep === 1 && updatedShow.status === 'Watching' && prevShow && prevShow.status === 'Backlog') {
      setOnboardingTargetShowId(updatedShow.id);
      setOnboardingStep(2);
    }

    // Onboarding Step 3: Increment episode progress on the targeted show
    if (onboardingStep === 3 && updatedShow.id === onboardingTargetShowId && prevShow) {
      const prevEp = prevShow.latestWatched?.episode || 0;
      const newEp = updatedShow.latestWatched?.episode || 0;
      const prevSeas = prevShow.latestWatched?.season || 0;
      const newSeas = updatedShow.latestWatched?.season || 0;
      if (newEp > prevEp || newSeas > prevSeas) {
        setOnboardingStep(4);
      }
    }
    
    // Auto-dismiss the onboarding first status prompt if they change status of any show
    if (prevShow && prevShow.status !== updatedShow.status && showFirstStatusPrompt) {
      if (currentUser) {
        localStorage.setItem(`seen_first_status_prompt_${currentUser.id}`, 'true');
      }
      setIsNewlyRegisteredUser(false);
      setShowFirstStatusPrompt(false);
    }

    if (prevShow && prevShow.status !== 'Completed' && updatedShow.status === 'Completed') {
      triggerCompletionConfetti(updatedShow);
    }

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
  const handleLogin = (loggedBoard: Board, options?: { showStarterPackAlert?: boolean; isNewAccount?: boolean }) => {
    if (loggedBoard.owner) {
      setCurrentUser(loggedBoard.owner);
      localStorage.setItem('coughtater_user', JSON.stringify(loggedBoard.owner));
      if (options?.isNewAccount) {
        setIsNewlyRegisteredUser(true);
        localStorage.setItem(`coughtater_starter_pack_${loggedBoard.owner.id}`, options?.showStarterPackAlert ? 'true' : 'false');
      } else {
        setIsNewlyRegisteredUser(false);
        localStorage.removeItem(`coughtater_is_new_user_${loggedBoard.owner.id}`);
      }
    }
    setBoard(loggedBoard);
    setBoardId(loggedBoard.id);
    setSearchFamily(false);
    const params = new URLSearchParams(window.location.search);
    params.set('board', loggedBoard.id);
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);

    if (options?.showStarterPackAlert) {
      setActiveTab('queue');
      setSortBy('rtScore');
    } else if (options?.isNewAccount) {
      setActiveTab('queue');
    } else {
      setActiveTab('active');
    }
  };

  // Auto-dismiss starter pack alert after 3.5 seconds (now non-blocking, shown as a toast)
  useEffect(() => {
    if (showStarterAlert) {
      const timer = setTimeout(() => {
        setShowStarterAlert(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [showStarterAlert]);

  // Trigger interactive onboarding instead of slide modal when they visit queue for the first time
  useEffect(() => {
    if (currentUser && activeTab === 'queue' && onboardingStep === null) {
      const isNewUser = isNewlyRegisteredUser;
      const hasSeen = localStorage.getItem(`seen_queue_onboarding_${currentUser.id}`) === 'true';
      if (isNewUser && !hasSeen) {
        setOnboardingStep(1);
      }
    }
  }, [currentUser, activeTab, isNewlyRegisteredUser, onboardingStep]);

  const handleSkipOnboarding = () => {
    if (currentUser) {
      localStorage.setItem(`seen_queue_onboarding_${currentUser.id}`, 'true');
      localStorage.setItem(`seen_first_status_prompt_${currentUser.id}`, 'true');
    }
    setOnboardingStep(null);
    setIsNewlyRegisteredUser(false);
    setShowFirstStatusPrompt(false);
  };

  const handleCompleteInteractiveOnboarding = (keepShow: boolean) => {
    if (!currentUser || !board) return;
    
    localStorage.setItem(`seen_queue_onboarding_${currentUser.id}`, 'true');
    localStorage.setItem(`seen_first_status_prompt_${currentUser.id}`, 'true');
    
    if (!keepShow && onboardingTargetShowId) {
      handleDeleteShow(onboardingTargetShowId);
    }
    
    setOnboardingStep(null);
    setIsNewlyRegisteredUser(false);
    setShowFirstStatusPrompt(false);
    
    const trigger = typeof confetti === 'function' ? confetti : (confetti as any).default;
    if (trigger) {
      trigger({
        particleCount: 180,
        spread: 100,
        origin: { y: 0.6 }
      });
    }
  };

  // Auto-progress Step 2 -> Step 3 when Watching tab is activated
  useEffect(() => {
    if (onboardingStep === 2 && activeTab === 'active') {
      setOnboardingStep(3);
    }
  }, [activeTab, onboardingStep]);

  // Auto-progress Step 4 -> Step 5 when Add Show modal is opened
  useEffect(() => {
    if (onboardingStep === 4 && isAddOpen) {
      setOnboardingStep(5);
    }
  }, [isAddOpen, onboardingStep]);

  // Auto-progress Step 8 -> Step 9 when returning to My Board from Buddy Picks
  useEffect(() => {
    if (onboardingStep === 8 && !searchFamily) {
      setActiveTab('queue'); // Return to the queue tab to celebrate
      if (autoDeleteOnboardingShow) {
        // Automatically delete the show and complete onboarding immediately
        handleCompleteInteractiveOnboarding(false);
      } else {
        const trigger = typeof confetti === 'function' ? confetti : (confetti as any).default;
        if (trigger) {
          trigger({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 }
          });
        }
        setOnboardingStep(9);
      }
    }
  }, [searchFamily, onboardingStep, autoDeleteOnboardingShow]);

  // Onboarding Step Scrolling effects
  useEffect(() => {
    if (onboardingStep === null) return;

    const safeScrollTo = (
      selector: string,
      retries = 20,
      delay = 100,
      options?: { mobileAlign?: 'top' | 'bottom' | 'center'; duration?: number; twoStage?: boolean }
    ) => {
      let count = 0;
      let lastTop = -1;
      let stableCount = 0;

      const attempt = () => {
        const elements = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
        const element = elements.find(el => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        }) || elements[0];

        if (element) {
          const elementRect = element.getBoundingClientRect();
          const absoluteElementTop = elementRect.top + window.scrollY;

          // If the element is currently hidden or has zero dimension, wait and retry
          if (elementRect.height === 0 || elementRect.width === 0) {
            if (count < retries) {
              count++;
              setTimeout(attempt, delay);
            }
            return;
          }

          const viewportHeight = window.innerHeight;
          const isMobile = window.innerWidth < 768;
          
          const performScroll = (startY: number, endY: number, dur: number, onDone?: () => void) => {
            const difference = endY - startY;
            const startTime = performance.now();

            const stepScroll = (currentTime: number) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / dur, 1);
              
              // Easing function: easeInOutCubic
              const ease = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

              window.scrollTo(0, startY + difference * ease);

              if (progress < 1) {
                requestAnimationFrame(stepScroll);
              } else if (onDone) {
                onDone();
              }
            };

            requestAnimationFrame(stepScroll);
          };

          const duration = options?.duration !== undefined ? options.duration : 1200;

          if (isMobile && options?.twoStage) {
            // First stage: Scroll to the TOP of the card to show the beautiful title card/photo
            const stage1Y = Math.max(0, absoluteElementTop - 20);
            
            performScroll(window.scrollY, stage1Y, duration, () => {
              // Wait for 1000ms so user can see and digest the top photo, then continue down to the status controls
              setTimeout(() => {
                const currentRect = element.getBoundingClientRect();
                const currentAbsoluteTop = currentRect.top + window.scrollY;
                const modalHeight = 240;
                const margin = 20;
                const targetBottomFromTop = viewportHeight - modalHeight - margin;
                let stage2Y = (currentAbsoluteTop + currentRect.height) - targetBottomFromTop;

                // Safety fallback: allow the top (banner image) to go off-screen up to 180px
                const maxScrollY = currentAbsoluteTop - 30 + 180;
                if (stage2Y > maxScrollY) {
                  stage2Y = maxScrollY;
                }

                performScroll(window.scrollY, Math.max(0, stage2Y), 1000);
              }, 1000);
            });
          } else {
            // Standard single-stage scroll
            let targetScrollY = 0;

            if (isMobile) {
              if (options?.mobileAlign === 'top') {
                targetScrollY = absoluteElementTop - 20;
              } else if (options?.mobileAlign === 'center') {
                const visibleHeight = viewportHeight - 240; // visible area above modal
                targetScrollY = absoluteElementTop - (visibleHeight / 2) + (elementRect.height / 2);
              } else {
                const modalHeight = 240;
                const margin = 20;
                const targetBottomFromTop = viewportHeight - modalHeight - margin;
                targetScrollY = (absoluteElementTop + elementRect.height) - targetBottomFromTop;

                const maxScrollY = absoluteElementTop - 30 + 180;
                if (targetScrollY > maxScrollY) {
                  targetScrollY = maxScrollY;
                }
              }
            } else {
              targetScrollY = absoluteElementTop - (viewportHeight / 2) + (elementRect.height / 2);
            }

            const scrollToY = Math.max(0, targetScrollY);

            if (duration > 0) {
              performScroll(window.scrollY, scrollToY, duration);
            } else {
              window.scrollTo({
                top: scrollToY,
                behavior: 'smooth'
              });
            }
          }

          // Track if the position is shifting/animating (e.g. Framer Motion layout transition).
          // If the absolute top changes by more than 2px, reset stableCount. Otherwise increment.
          if (Math.abs(absoluteElementTop - lastTop) > 2) {
            lastTop = absoluteElementTop;
            stableCount = 0;
          } else {
            stableCount++;
          }

          // Continue scrolling to follow transition until the position stabilizes (3 consecutive matches) or we run out of retries.
          if (stableCount < 3 && count < retries) {
            count++;
            setTimeout(attempt, delay);
          }
        } else if (count < retries) {
          count++;
          setTimeout(attempt, delay);
        }
      };
      // Brief timeout to ensure DOM settles and layout reflows get underway
      setTimeout(attempt, 300);
    };

    switch (onboardingStep) {
      case 1:
        // Scroll to the first show card, showing the top photo first, then smoothly continuing down to the status buttons
        safeScrollTo('[id^="show-card-"]', 15, 150, { twoStage: true, duration: 1500 });
        break;
      case 2:
        // Scroll to category tabs slowly so user can see where it went
        safeScrollTo('#category-tabs-container', 15, 150, { duration: 1500 });
        break;
      case 3:
        // Scroll to the target show card, showing the top first, then smoothly continuing down to the logging controls
        if (onboardingTargetShowId) {
          safeScrollTo(`#show-card-${onboardingTargetShowId}`, 15, 150, { twoStage: true, duration: 1500 });
        }
        break;
      case 4:
        // Scroll to desktop or mobile Add Show button so the user can easily find and tap it
        safeScrollTo('#add-show-button-desktop, #add-show-button-mobile', 15, 150, { mobileAlign: 'top', duration: 1500 });
        break;
      case 5: {
        // The Add Show modal is now open; its internal search field will auto-focus and scroll itself into view
        break;
      }
      case 6:
      case 8:
        // Scroll to scope tabs container
        safeScrollTo('#scope-tabs-container', 15, 150, { duration: 1500 });
        break;
      case 7: {
        // Scroll to the first buddy card, showing the top photo first, then smoothly continuing down to the "Add to Up Next" button
        safeScrollTo('[id^="show-card-"]', 15, 150, { twoStage: true, duration: 1500 });
        break;
      }
      default:
        break;
    }
  }, [onboardingStep, onboardingTargetShowId]);

  const handleDismissFirstStatusPrompt = () => {
    if (currentUser) {
      localStorage.setItem(`seen_first_status_prompt_${currentUser.id}`, 'true');
    }
    setIsNewlyRegisteredUser(false);
    setShowFirstStatusPrompt(false);
  };

  // Synchronized effect to check if we should show the first status prompt
  useEffect(() => {
    if (currentUser && board && activeTab === 'queue') {
      const isNewUser = isNewlyRegisteredUser;
      const hasSeenOnboarding = localStorage.getItem(`seen_queue_onboarding_${currentUser.id}`) === 'true';
      const hasStarterPack = localStorage.getItem(`coughtater_starter_pack_${currentUser.id}`) !== 'false';
      const hasSeenPrompt = localStorage.getItem(`seen_first_status_prompt_${currentUser.id}`) === 'true';
      
      const queueShows = board.shows.filter(s => s.status === 'Backlog');
      if (isNewUser && hasSeenOnboarding && hasStarterPack && !hasSeenPrompt && queueShows.length > 0) {
        setShowFirstStatusPrompt(true);
      } else {
        setShowFirstStatusPrompt(false);
      }
    } else {
      setShowFirstStatusPrompt(false);
    }
  }, [currentUser, board, activeTab, showQueueOnboarding, isNewlyRegisteredUser]);

  const handleCloseOnboarding = () => {
    if (currentUser) {
      localStorage.setItem(`seen_queue_onboarding_${currentUser.id}`, 'true');
    }
    setShowQueueOnboarding(false);
    setTimeout(() => {
      const el = document.getElementById('backlog-queue-area');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
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

  // Dismiss notification
  const handleDismissNotification = async (notifId: string) => {
    if (!board) return;

    // Immediately record in localStorage to ensure it is never shown again, bypassing any polling delay
    try {
      const dismissed = localStorage.getItem(`dismissed_notifications_${board.id}`);
      const dismissedIds = dismissed ? JSON.parse(dismissed) : [];
      if (!dismissedIds.includes(notifId)) {
        localStorage.setItem(`dismissed_notifications_${board.id}`, JSON.stringify([...dismissedIds, notifId]));
      }
    } catch (e) {
      console.error("Failed to save dismissed notification locally:", e);
    }

    const updatedNotifs = (board.notifications || []).filter(n => n.id !== notifId);
    setBoard({
      ...board,
      notifications: updatedNotifs
    });

    try {
      await fetch('/api/notifications/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardId: board.id,
          notificationId: notifId
        })
      });
    } catch (err) {
      console.error("Failed to dismiss notification on server:", err);
    }
  };

  // Accept a shared show recommendation
  const handleAcceptRecommendation = async (notif: AppNotification) => {
    if (!board) return;
    
    const exists = board.shows.some(s => s.title.toLowerCase().trim() === notif.show.title.toLowerCase().trim());
    if (exists) {
      alert(`"${notif.show.title}" is already in your collection!`);
      handleDismissNotification(notif.id);
      return;
    }

    const newShow: TvShow = {
      ...notif.show,
      id: `show-${Date.now()}`,
      status: 'Backlog',
      userScore: null,
      userNotes: '',
      isFavorite: false,
      createdAt: new Date().toISOString()
    };

    const updatedShows = [newShow, ...board.shows];
    await saveBoardToServer(updatedShows);
    await handleDismissNotification(notif.id);
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
          id: `show-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
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
          setCurrentUserShows(updatedShows);
          if (onboardingStep === 7) {
            setOnboardingStep(8);
          }
        }
      }
    } catch (err) {
      console.error("Failed to copy show to your queue:", err);
      alert("Could not copy show. Please try again.");
    }
  };

  // Compute list of shows to filter based on search scope
  const showsToSearch = useMemo(() => {
    if (!searchFamily || !board) {
      const myName = board?.owner?.name || currentUser?.name || 'My Tracker';
      return (board?.shows || []).map(s => ({ ...s, ownerName: myName, ownerNames: [myName] }));
    }

    const allShows: (TvShow & { ownerName: string })[] = [];
    const seenShowBoardKeys = new Set<string>();

    Object.entries(familyBoards).forEach(([bId, b]) => {
      if (b && Array.isArray(b.shows)) {
        const ownerName = b.owner?.name || allUsers.find(u => u.id === b.id)?.name || (b.id === 'default' ? 'Julio' : b.name) || `Board ${b.id}`;
        b.shows.forEach(s => {
          const key = `${bId}-${s.id}`;
          if (!seenShowBoardKeys.has(key)) {
            seenShowBoardKeys.add(key);
            allShows.push({ ...s, ownerName });
          }
        });
      }
    });

    // Fallback: If current board is not yet in familyBoards, ensure we include its shows too
    if (board && !familyBoards[board.id]) {
      const myName = board.owner?.name || currentUser?.name || 'My Tracker';
      board.shows.forEach(s => {
        const key = `${board.id}-${s.id}`;
        if (!seenShowBoardKeys.has(key)) {
          seenShowBoardKeys.add(key);
          allShows.push({ ...s, ownerName: myName });
        }
      });
    }

    // Now group/consolidate shows by title (case-insensitive, trimmed)
    const groupedMap = new Map<string, (TvShow & { ownerName: string })[]>();
    allShows.forEach(s => {
      const normTitle = s.title.toLowerCase().trim();
      const list = groupedMap.get(normTitle) || [];
      list.push(s);
      groupedMap.set(normTitle, list);
    });

    const consolidatedShows: any[] = [];

    groupedMap.forEach((instances) => {
      // Find the most comprehensive / active instance as base or simply the first one
      const first = instances[0];
      const ownerNames = Array.from(new Set(instances.map(i => i.ownerName)));
      const familyDetails = instances.map(i => ({
        ownerName: i.ownerName,
        status: i.status,
        userScore: i.userScore,
        userNotes: i.userNotes,
        latestWatched: i.latestWatched
      }));

      consolidatedShows.push({
        ...first,
        ownerName: ownerNames.join(', '),
        ownerNames,
        familyDetails
      });
    });

    return consolidatedShows;
  }, [searchFamily, familyBoards, board, currentUser, allUsers]);

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

  // Compute list of unique genres present in the searched shows list
  const allGenres = ['All', ...Array.from(new Set(showsToSearch.flatMap(s => s.genres)))].sort();

  // Filter & Sort shows
  const filteredShows = showsToSearch
    .filter(s => {
      const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.actors.some(a => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            s.directors.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesService = selectedService === 'All' || s.streamingService === selectedService;
      const matchesGenre = selectedGenre === 'All' || s.genres.includes(selectedGenre);
      
      let matchesTab = true;
      if (searchQuery.trim() === '') {
        if (activeTab === 'all') {
          matchesTab = true;
        } else if (activeTab === 'active') {
          matchesTab = s.status === 'Watching';
        } else if (activeTab === 'library') {
          matchesTab = s.status === 'Completed' || s.status === 'Dropped' || (s.isFavorite === true && s.status !== 'Watching' && s.status !== 'Backlog');
        } else if (activeTab === 'queue') {
          matchesTab = s.status === 'Backlog';
        }
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
        return (b.rottenTomatoesScore ?? -1) - (a.rottenTomatoesScore ?? -1);
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

  // Helper to calculate days until an episode airs
  const getDaysUntilEpisode = (airDateStr: string): number => {
    const parts = airDateStr.split('-');
    let airTime = NaN;
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        airTime = new Date(year, month, day).getTime();
      }
    } else {
      airTime = new Date(airDateStr).getTime();
    }

    if (isNaN(airTime)) return -1;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = airTime - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Find shows in Backlog (Queue) with upcoming episodes in the next 30 days
  const matchingBacklogShows = !isFriendView && board
    ? board.shows.filter(s => {
        if (s.status !== 'Backlog' || !s.nextEpisode || !s.nextEpisode.airDate) return false;
        if (dismissedActivationIds.includes(s.id)) return false;

        const diffDays = getDaysUntilEpisode(s.nextEpisode.airDate);
        return diffDays >= 0 && diffDays <= 30;
      })
    : [];

  const handleActivateShow = (show: TvShow) => {
    const updatedShow = { ...show, status: 'Watching' as const };
    handleUpdateShow(updatedShow);
  };

  const handleActivateAllShows = () => {
    if (!board) return;
    const showIdsToActivate = matchingBacklogShows.map(s => s.id);
    const updatedShows = board.shows.map(s => {
      if (showIdsToActivate.includes(s.id)) {
        return { ...s, status: 'Watching' as const };
      }
      return s;
    });
    saveBoardToServer(updatedShows);
  };

  const handleDismissActivationAlert = () => {
    if (!board) return;
    const newDismissedIds = [...dismissedActivationIds, ...matchingBacklogShows.map(s => s.id)];
    const uniqueDismissedIds = Array.from(new Set(newDismissedIds));
    setDismissedActivationIds(uniqueDismissedIds);
    localStorage.setItem(`dismissed_activation_shows_${board.id}`, JSON.stringify(uniqueDismissedIds));
  };

  // Filter out any notifications that have been dismissed locally to avoid polling race conditions or "pestering"
  const activeNotifications = board?.notifications
    ? board.notifications.filter(n => {
        try {
          const dismissed = localStorage.getItem(`dismissed_notifications_${board.id}`);
          const dismissedIds = dismissed ? JSON.parse(dismissed) : [];
          return !dismissedIds.includes(n.id);
        } catch {
          return true;
        }
      })
    : [];

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
                    className="bg-blue-600 border border-blue-500 text-white text-[10px] font-bold rounded-xl pl-6 pr-6 py-1 appearance-none cursor-pointer focus:outline-none focus:ring-0 shadow-md hover:bg-blue-500 hover:border-blue-400 transition-colors"
                  >
                    <option value={currentUser.id} className={theme === 'dark' ? 'bg-[#1A1D23] text-slate-100' : 'bg-white text-neutral-800'}>
                      {isFriendView ? "Back to My Board" : "My Watch Buddies"}
                    </option>
                     {allUsers
                       .filter(u => u.id !== currentUser.id)
                       .map((u, idx) => (
                         <option key={`${u.id}-${idx}`} value={u.id} className={theme === 'dark' ? 'bg-[#1A1D23] text-slate-100' : 'bg-white text-neutral-800'}>
                           {u.name}'s Shows
                         </option>
                       ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-white/90">
                    <Users className="w-2.5 h-2.5" />
                  </div>
                  <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-white/90">
                    <ChevronDown className="w-2 h-2" />
                  </div>
                </div>
              )}

              {/* Collaboration/Share button (hidden for now) */}
              {false && (
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
              )}
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
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Stop Scrolling. Start Watching.</p>
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
                title="Ask Spudz"
              >
                <Bot className={`w-4 h-4 ${(isAiSidebarOpen || isChatOpen) ? 'animate-pulse' : ''}`} />
              </button>

              {/* View Calendar Trigger */}
              <button
                onClick={() => setIsCalendarOpen(true)}
                className={`p-2.5 rounded-2xl border transition hover:scale-105 cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-[#262A33] border-white/5 text-blue-400 hover:bg-[#1C2028]'
                    : 'bg-neutral-100 border-neutral-200 text-blue-600 hover:bg-neutral-200'
                }`}
                title="View Calendar of Airing Episodes"
              >
                <CalendarIcon className="w-4 h-4" />
              </button>

              {/* Add Show Trigger - Desktop only inside the header */}
              {!isFriendView && !searchFamily && (
                <button
                  id="add-show-button-desktop"
                  onClick={() => setIsAddOpen(true)}
                  className={`hidden sm:flex px-4 py-2.5 rounded-2xl font-bold text-xs items-center justify-center gap-1.5 transition hover:scale-[1.02] cursor-pointer ${
                    onboardingStep === 4
                      ? 'ring-4 ring-purple-400 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-purple-500/40 relative z-50 animate-pulse border border-purple-400'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-950/20 border border-blue-500/25'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Show</span>
                </button>
              )}
            </div>
          </header>

          {/* Mobile-only Add Show Button (outside the header container) */}
          {!isFriendView && !searchFamily && (
            <button
              id="add-show-button-mobile"
              onClick={() => setIsAddOpen(true)}
              className={`flex sm:hidden w-full px-4 py-3 rounded-2xl font-bold text-xs items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer ${
                onboardingStep === 4
                  ? 'ring-4 ring-purple-400 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-purple-500/40 relative z-50 animate-pulse border border-purple-400'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-950/20 border border-blue-500/25'
              }`}
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
                    Viewing Watch Buddy's Collection ({board.owner?.name || 'Buddy'})
                  </p>
                  <p className={`mt-0.5 transition-all duration-300 ${theme === 'dark' ? 'text-slate-400' : 'text-blue-700/80'} hidden sm:block`}>
                    You can copy any show from this board to your personal Up Next area by clicking "Add to Up Next".
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
        <section id="upcoming-carousel-section" className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5 text-slate-500" />
              <span>
                {isFriendView 
                  ? "Check Out What Your Friend's Are Watching" 
                  : `${board.owner?.name || 'Julio'}'s New Episodes & Active Content`}
              </span>
            </h3>
            <button
              onClick={() => setIsManageActiveOpen(true)}
              className="text-[10px] font-bold bg-[#1A1D23] hover:bg-[#262A33] text-slate-400 hover:text-white border border-white/5 rounded px-2.5 py-1 transition flex items-center gap-1 cursor-pointer"
            >
              <span>
                {board.shows.filter(s => {
                  const isEligible = s.status === 'Watching';
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

            {/* Elegant, dismissible Workflow Quick-Start Guide */}
            <AnimatePresence>
              {showWorkflowGuide && (
                <motion.div
                  initial={{ opacity: 0, y: -15, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -15, height: 0 }}
                  className="relative overflow-hidden p-5 rounded-3xl border border-blue-500/15 bg-[#171B24]/95 backdrop-blur-md shadow-xl transition-all duration-300"
                  id="onboarding-workflow-guide-panel"
                >
                  {/* Accent lights */}
                  <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <button
                    type="button"
                    onClick={handleDismissWorkflowGuide}
                    className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-white/5 cursor-pointer z-10"
                    title="Hide guide permanently"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                      <Sparkles className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="space-y-3.5 flex-1 pr-6">
                      <div>
                        <h4 className="text-xs font-black text-slate-200 uppercase tracking-widest flex items-center gap-2">
                          <span>CouchTaterz Watchlist Pipeline Guide</span>
                          <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[8px] font-black uppercase tracking-wider">Onboarding</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                          Track and route your shows instantly across three streamlined pipelines using the <strong className="text-white">STATUS</strong> controls located on any Show Card:
                        </p>
                        
                        {/* Visual inline representation of the status switch */}
                        <div className="mt-2.5 flex items-center gap-2 bg-[#0F1115]/40 border border-white/5 rounded-xl px-3 py-1.5 w-fit">
                          <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">STATUS:</span>
                          <div className="inline-flex gap-0.5 bg-[#15171C] p-0.5 rounded-lg border border-white/5 shadow-inner">
                            <span className="px-2 py-0.5 text-[9px] font-black rounded-md bg-blue-600 text-white shadow-sm">Watching</span>
                            <span className="px-2 py-0.5 text-[9px] font-extrabold rounded-md text-slate-500">Up Next</span>
                            <span className="px-2 py-0.5 text-[9px] font-extrabold rounded-md text-slate-500">Watched</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-0.5">
                        <div className="space-y-1 p-3 bg-blue-950/20 border border-blue-500/10 rounded-2xl">
                          <div className="flex items-center gap-1.5 text-blue-400 text-[10px] font-black uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            Watching View
                          </div>
                          <p className="text-[10px] text-slate-400 leading-normal font-medium">
                            Your current watch rotation. Shows real-time episode check-ins, air dates, and live countdowns.
                          </p>
                        </div>

                        <div className="space-y-1 p-3 bg-amber-950/20 border border-amber-500/10 rounded-2xl">
                          <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-black uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Up Next View
                          </div>
                          <p className="text-[10px] text-slate-400 leading-normal font-medium">
                            Your backlog/watchlist. Drop upcoming, planned, or recommended shows here until you are ready to start.
                          </p>
                        </div>

                        <div className="space-y-1 p-3 bg-emerald-950/20 border border-emerald-500/10 rounded-2xl">
                          <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Watched View
                          </div>
                          <p className="text-[10px] text-slate-400 leading-normal font-medium">
                            Archived sanctuary for fully completed seasons, drops, or top-rated favorites. Keeps your workspace pristine.
                          </p>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                        <span className="text-orange-400">💡 Pro-Tip:</span> Move shows instantly between these pipelines by toggling their Status controls on any Show Card below!
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Elegant Streaming Services Quick Filter Ribbon */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Streaming Service Coverage</span>
                <span className="sm:hidden text-[8px] font-black uppercase tracking-widest text-slate-500/80 animate-pulse">Swipe for more →</span>
              </div>
              
              <div className="relative w-full">
                {/* Left gradient mask overlay */}
                <div className={`absolute left-0 top-0 bottom-1.5 w-6 pointer-events-none z-10 bg-gradient-to-r transition-all duration-300 ${
                  theme === 'dark' ? 'from-[#0F1115] to-transparent' : 'from-neutral-50 to-transparent'
                }`} />

                {/* Right gradient mask overlay */}
                <div className={`absolute right-0 top-0 bottom-1.5 w-8 pointer-events-none z-10 bg-gradient-to-l transition-all duration-300 ${
                  theme === 'dark' ? 'from-[#0F1115] to-transparent' : 'from-neutral-50 to-transparent'
                }`} />

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 px-1 scrollbar-none snap-x">
                  <button
                    onClick={() => setSelectedService('All')}
                    className={`px-2.5 py-1 rounded-lg font-extrabold text-[10px] uppercase tracking-wide border shrink-0 snap-start transition-all duration-200 ${
                      selectedService === 'All'
                        ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
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
                        className={`px-2.5 py-1 rounded-lg font-extrabold text-[10px] uppercase tracking-wide border shrink-0 snap-start transition-all duration-200 flex items-center gap-1 ${
                          isActive
                             ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                            : theme === 'dark'
                              ? 'bg-[#1A1D23] border-white/5 text-slate-400 hover:text-white hover:bg-[#262A33]'
                              : 'bg-white border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                        }`}
                      >
                        <span>{service}</span>
                        {count > 0 && (
                          <span className={`text-[8px] font-black rounded px-1 py-0.2 ${isActive ? 'bg-blue-700 text-white' : 'bg-[#0F1115] text-slate-500'}`}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                  {/* Hide stats button for now */}
                </div>
              </div>
            </div>

            {/* Elegant Main Workspace Category Tabs */}
            <div 
              id="category-tabs-container"
              className={`p-1 bg-[#1A1D23]/95 backdrop-blur-md rounded-3xl border shadow-inner transition-all duration-300 flex items-center gap-1 w-full overflow-x-auto sm:overflow-x-visible scrollbar-none snap-x scroll-smooth ${
              searchFamily ? 'relative' : 'sticky top-3 z-30'
            } ${
              onboardingStep === 2
                ? 'border-purple-500 ring-2 ring-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.4)] relative z-50 bg-[#1A1D23]'
                : 'border-white/5'
            }`}>
              {(() => {
                const tabSourceShows = searchFamily ? showsToSearch : board.shows;
                const mainWorkflowTabs = [
                  { id: 'active', label: 'Watching', icon: <Tv className="w-3.5 h-3.5 shrink-0" />, count: tabSourceShows.filter(s => s.status === 'Watching').length },
                  { id: 'queue', label: 'Up Next', icon: <Clock className="w-3.5 h-3.5 shrink-0" />, count: tabSourceShows.filter(s => s.status === 'Backlog').length },
                  { id: 'library', label: 'Watched', icon: <Archive className="w-3.5 h-3.5 shrink-0" />, count: tabSourceShows.filter(s => s.status === 'Completed' || s.status === 'Dropped' || (s.isFavorite === true && s.status !== 'Watching' && s.status !== 'Backlog')).length }
                ] as { id: 'active' | 'queue' | 'library'; label: string; icon: React.ReactNode; count: number }[];

                return (
                  <>
                    {/* The 3 main workflow tabs (Core Action Pipeline) - Pushed to take up 90% on mobile to keep them extremely prominent and clear */}
                    <div className="flex-none w-[90%] sm:w-auto sm:flex-1 grid grid-cols-3 gap-1 shrink-0 snap-start">
                      {mainWorkflowTabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        const isWatchingOnboardingHighlight = onboardingStep === 2 && tab.id === 'active';
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
                            className={`relative py-2.5 sm:py-3 px-1 rounded-2xl text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-2 z-10 ${
                              isWatchingOnboardingHighlight 
                                ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-[#1A1D23] animate-pulse bg-purple-950/40 text-purple-200' 
                                : ''
                            }`}
                          >
                            {isActive && (
                              <motion.div
                                layoutId="activeWorkspaceTab"
                                className={`absolute inset-0 rounded-2xl -z-10 shadow-lg ${
                                  searchFamily
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
                            <span className={`flex items-center gap-1 sm:gap-1.5 ${isActive ? 'text-white font-extrabold' : 'text-slate-400 hover:text-slate-200'}`}>
                              <span className="hidden sm:inline-flex">{tab.icon}</span>
                              <span className="hidden sm:inline">{tab.label}</span>
                              <span className="sm:hidden">{tab.id === 'active' ? 'Watching' : tab.id === 'library' ? 'Watched' : 'Next'}</span>
                            </span>
                            <span className={`px-1.5 py-0.5 text-[9px] rounded-full font-black transition-colors duration-300 ${
                              isActive 
                                ? (searchFamily ? 'bg-purple-700 text-white' : tab.id === 'active' ? 'bg-blue-700 text-white' : tab.id === 'library' ? 'bg-emerald-700 text-white' : 'bg-amber-700 text-white') 
                                : (searchFamily ? 'bg-purple-950/30 text-purple-400 border border-purple-500/10' : 'bg-[#0F1115] text-slate-500')
                            }`}>
                              {tab.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Deemphasized separation: elegant vertical divider line */}
                    <div className="w-px h-5 bg-white/10 shrink-0 self-center mx-1 snap-start" />

                    {/* "All" utility tab - styled as a compact, neutral index pill, peeking on mobile */}
                    <button
                      onClick={() => {
                        setActiveTab('all');
                        setSortBy('rtScore');
                      }}
                      className={`relative py-2 px-3 sm:px-4 rounded-xl text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 z-10 border shrink-0 snap-end ${
                        activeTab === 'all'
                          ? 'bg-[#1F232D] border-white/10 text-slate-200 shadow-md'
                          : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <Compass className={`w-3.5 h-3.5 shrink-0 hidden sm:block ${activeTab === 'all' ? 'text-purple-400 animate-[spin_8s_linear_infinite]' : 'text-slate-600'}`} />
                      <span className={`${activeTab === 'all' ? 'font-black' : 'font-medium'}`}>All</span>
                      <span className={`px-1 py-0.5 text-[8px] rounded-md font-extrabold transition-colors duration-300 ${
                        activeTab === 'all' 
                          ? 'bg-purple-950/40 text-purple-400 border border-purple-500/15' 
                          : 'bg-[#0F1115] text-slate-600 border border-white/5'
                      }`}>
                        {tabSourceShows.length}
                      </span>
                    </button>
                  </>
                );
              })()}
            </div>

             {/* Filter controls & Search bar */}
            <div ref={searchBarRef} className={`p-4 rounded-3xl border space-y-4 transition-all duration-500 ${
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
                    placeholder="Search across all shows (Watching, Up Next, Watched)..."
                    className={`w-full pl-10 pr-10 py-3 rounded-2xl text-xs border focus:outline-none transition-all duration-300 ${
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
                  {searchQuery && (
                    <button
                      id="clear-search-query-button"
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors duration-150"
                      aria-label="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
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

              {/* Search Scope Toggle (Subtle & Compact) */}
              {!isFriendView && (
                <div 
                  id="scope-tabs-container"
                  className="flex items-center gap-2 text-[11px] font-medium text-slate-400 px-1 pt-1 select-none"
                >
                  <span className="opacity-75">Scope:</span>
                  <div className="inline-flex items-center gap-1 bg-neutral-950/30 p-0.5 rounded-lg border border-white/5">
                    <button
                      type="button"
                      onClick={() => {
                        setSearchFamily(false);
                        if (activeTab === 'all') {
                          setActiveTab('active');
                        }
                      }}
                      className={`px-2 py-0.5 rounded-md transition-all duration-150 cursor-pointer ${
                        !searchFamily 
                          ? 'bg-[#2E333F] text-white font-semibold shadow-sm' 
                          : 'text-slate-400 hover:text-slate-200'
                      } ${
                        onboardingStep === 8
                          ? 'ring-2 ring-purple-400 bg-purple-900/40 text-purple-100 animate-pulse border border-purple-500 relative z-50'
                          : ''
                      }`}
                    >
                      My Board
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchFamily(true);
                        setActiveTab('all');
                        if (onboardingStep === 6) {
                          setOnboardingStep(7);
                        }
                        setTimeout(() => {
                          searchBarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 100);
                      }}
                      className={`px-2 py-0.5 rounded-md transition-all duration-150 cursor-pointer flex items-center gap-1 ${
                        searchFamily 
                          ? 'bg-purple-950/60 text-purple-300 border border-purple-500/20 font-semibold shadow-sm' 
                          : 'text-slate-400 hover:text-slate-200'
                      } ${
                        onboardingStep === 6
                          ? 'ring-2 ring-purple-400 bg-[#581c87] text-white animate-pulse border border-purple-500 relative z-50'
                          : ''
                      }`}
                    >
                      <span>Buddy Picks</span>
                    </button>
                  </div>
                  {searchFamily && isLoadingFamilyBoards && (
                    <span className="text-slate-500 animate-pulse text-[10px] ml-1">Syncing trackers...</span>
                  )}
                </div>
              )}

              {/* Dynamic Active Filters Ribbon */}
              {isAnyFilterActive && (
                <div className="flex flex-wrap items-center gap-2 pt-2 pb-1.5 border-t border-neutral-800/10 dark:border-white/5">
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-500">Active Filters:</span>
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {searchQuery.trim() !== '' && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/15">
                        <span>Query: "{searchQuery}"</span>
                        <button onClick={() => setSearchQuery('')} className="hover:text-blue-300 transition font-black text-xs cursor-pointer ml-0.5" aria-label="Clear query">×</button>
                      </span>
                    )}
                    {selectedService !== 'All' && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
                        <span>Service: {selectedService}</span>
                        <button onClick={() => setSelectedService('All')} className="hover:text-indigo-300 transition font-black text-xs cursor-pointer ml-0.5" aria-label="Clear service">×</button>
                      </span>
                    )}
                    {selectedGenre !== 'All' && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/15">
                        <span>Category: {selectedGenre}</span>
                        <button onClick={() => setSelectedGenre('All')} className="hover:text-purple-300 transition font-black text-xs cursor-pointer ml-0.5" aria-label="Clear category">×</button>
                      </span>
                    )}
                    <button
                      onClick={handleResetAllFilters}
                      className="text-[10px] font-black uppercase text-rose-400 hover:text-rose-300 transition duration-150 cursor-pointer ml-1 underline underline-offset-2"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>
              )}

              {/* Sorting and result summary count */}
              <div className="flex items-center justify-between pt-1 border-t border-neutral-800/10 dark:border-white/5 text-xs">
                <span className="text-slate-500 font-medium">
                  Showing {filteredShows.length} of {showsToSearch.length} shows
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
            <div id="backlog-queue-area" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 py-1 bg-transparent rounded-2xl border border-transparent select-none transition-all duration-500">
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
                  <h2 className={`text-sm sm:text-base font-black tracking-wide uppercase transition-colors duration-500 ${
                    activeTab === 'all'
                      ? 'text-purple-400'
                      : activeTab === 'active' 
                      ? 'text-blue-400' 
                      : activeTab === 'library'
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }`}>
                    {searchQuery.trim() !== '' ? 'Global Search Results' : (
                      <>
                        {activeTab === 'all' && 'Full Board Directory'}
                        {activeTab === 'active' && 'Watching'}
                        {activeTab === 'library' && 'Watched'}
                        {activeTab === 'queue' && 'Up Next'}
                      </>
                    )}
                  </h2>
                  <p className="text-[10px] text-slate-500">
                    {searchQuery.trim() !== '' ? 'Searching across all shows (Watching, Up Next, Watched).' : (
                      <>
                        {activeTab === 'all' && 'An all-inclusive overview of every single show tracked on this board.'}
                        {activeTab === 'active' && 'Real-time tracking of current seasons, release timers, and episode recaps.'}
                        {activeTab === 'library' && 'A curated sanctuary for library series, dropped shows, and top favorites.'}
                        {activeTab === 'queue' && 'Shows scheduled for later. Switch status to move shows to Watching.'}
                      </>
                    )}
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
                    title="Open Ask Spudz Chat"
                  >
                    <Bot className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span>Ask Spudz</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tater Recommendations Alert */}
            <AnimatePresence>
              {activeNotifications.length > 0 && (
                <div className="space-y-4 mb-6">
                  {activeNotifications.map((notif) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                      className="overflow-hidden"
                    >
                      <div className={`p-4 sm:p-5 border rounded-2xl relative overflow-hidden transition-all shadow-md ${
                        theme === 'dark'
                          ? 'bg-[#1A1D23] border-amber-500/25 shadow-amber-950/5'
                          : 'bg-white border-amber-200 shadow-amber-100/50'
                      }`}>
                        {/* Amber Tint Overlay */}
                        <div className={`absolute inset-0 pointer-events-none z-0 bg-gradient-to-r ${
                          theme === 'dark'
                            ? 'from-amber-500/10 via-amber-500/5 to-transparent'
                            : 'from-amber-50 to-transparent'
                        }`} />

                        {/* Show Banner Image Layer fading in from right */}
                        {notif.show.bannerImage && (
                          <div className="absolute right-0 top-0 bottom-0 w-2/5 sm:w-1/2 pointer-events-none overflow-hidden z-0">
                            <img
                              src={notif.show.bannerImage}
                              alt={notif.show.title}
                              className="w-full h-full object-cover opacity-30 md:opacity-40 transition-opacity"
                              referrerPolicy="no-referrer"
                            />
                            <div className={`absolute inset-0 bg-gradient-to-r ${
                              theme === 'dark'
                                ? 'from-[#1A1D23] via-[#1A1D23]/40 to-transparent'
                                : 'from-white via-white/40 to-transparent'
                            }`} />
                          </div>
                        )}

                        <div className="absolute top-0 right-0 p-3 z-10">
                          <button 
                            onClick={() => handleDismissNotification(notif.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100'
                            }`}
                            title="Dismiss Alert"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="flex items-start gap-4 pr-6 relative z-10">
                          <img
                            src={notif.senderAvatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${notif.senderName}`}
                            alt={notif.senderName}
                            className="w-10 h-10 rounded-full border border-amber-500/30 shrink-0 mt-0.5 bg-[#0F1115]"
                          />
                          <div className="flex-1 space-y-3">
                            <div>
                              <h3 className={`text-xs font-black uppercase tracking-wider ${
                                theme === 'dark' ? 'text-amber-400' : 'text-amber-700'
                              }`}>
                                New Recommendation from {notif.senderName}!
                              </h3>
                              <p className={`text-[12px] font-bold leading-relaxed mt-1 ${
                                theme === 'dark' ? 'text-slate-200' : 'text-neutral-800'
                              }`}>
                                "{notif.senderName}" recommended the show <span className="text-amber-400 underline font-extrabold">{notif.show.title}</span> to you.
                              </p>
                              {notif.message && (
                                <p className={`text-[11px] italic mt-1.5 p-2 bg-black/30 rounded-lg ${
                                  theme === 'dark' ? 'text-slate-300' : 'text-neutral-600'
                                }`}>
                                  "{notif.message}"
                                </p>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAcceptRecommendation(notif)}
                                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition cursor-pointer"
                              >
                                Add to Up Next
                              </button>
                              <button
                                onClick={() => handleDismissNotification(notif.id)}
                                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
                              >
                                Dismiss
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>

            {/* Upcoming Backlog Episode Activation Alert */}
            <AnimatePresence>
              {matchingBacklogShows.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                  className="overflow-hidden"
                >
                  <div className={`p-4 sm:p-5 border rounded-2xl relative overflow-hidden transition-all shadow-md ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-[#1A1D23]/30 border-amber-500/25 shadow-amber-950/5'
                      : 'bg-gradient-to-r from-amber-50 to-white border-amber-200 shadow-amber-100/50'
                  }`}>
                    <div className="absolute top-0 right-0 p-3 z-10">
                      <button 
                        onClick={handleDismissActivationAlert}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100'
                        }`}
                        title="Dismiss Alert"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-start gap-4 pr-6">
                      <div className={`p-2.5 border rounded-xl shrink-0 mt-0.5 ${
                        theme === 'dark'
                          ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                          : 'bg-amber-100 border-amber-200 text-amber-700'
                      }`}>
                        <Sparkles className="w-5 h-5 animate-pulse" />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div>
                          <h3 className={`text-xs font-black uppercase tracking-wider ${
                            theme === 'dark' ? 'text-amber-400' : 'text-amber-700'
                          }`}>
                            Upcoming Backlog Episodes Alert!
                          </h3>
                          <p className={`text-[11px] font-medium leading-relaxed mt-1 ${
                            theme === 'dark' ? 'text-slate-300' : 'text-neutral-600'
                          }`}>
                            You have {matchingBacklogShows.length} {matchingBacklogShows.length === 1 ? 'show' : 'shows'} in your <span className="font-bold underline decoration-amber-500/40">Up Next</span> with new episodes airing in the next 30 days! Would you like to activate them for tracking?
                          </p>
                        </div>

                        {/* List of shows */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {matchingBacklogShows.map((show, idx) => {
                            const diffDays = getDaysUntilEpisode(show.nextEpisode!.airDate);
                            return (
                              <div 
                                key={`${show.id}-${idx}`} 
                                className={`flex items-center justify-between gap-3 p-3 border rounded-xl text-left ${
                                  theme === 'dark'
                                    ? 'bg-[#14161C]/80 border-white/5'
                                    : 'bg-white border-neutral-100 shadow-sm'
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className={`text-[11px] font-bold truncate ${theme === 'dark' ? 'text-slate-100' : 'text-neutral-800'}`}>{show.title}</div>
                                  <div className="text-[10px] text-amber-500 font-semibold truncate mt-0.5">
                                    {show.nextEpisode?.title} ({diffDays === 0 ? 'Today!' : diffDays === 1 ? 'Tomorrow' : `in ${diffDays} days`})
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleActivateShow(show)}
                                  className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition shrink-0 cursor-pointer shadow-sm ${
                                    theme === 'dark'
                                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 hover:shadow-amber-500/10'
                                      : 'bg-amber-600 hover:bg-amber-500 text-white hover:shadow-amber-600/10'
                                  }`}
                                >
                                  Activate
                                </button>
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <button
                            onClick={handleActivateAllShows}
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition shadow-md shrink-0 cursor-pointer ${
                              theme === 'dark'
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-950/20'
                                : 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white shadow-amber-100'
                            }`}
                          >
                            Move All to Watching
                          </button>
                          <button
                            onClick={handleDismissActivationAlert}
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition border shrink-0 cursor-pointer ${
                              theme === 'dark'
                                ? 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-white/5'
                                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-200'
                            }`}
                          >
                            Keep in Up Next
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* TV Shows Bento Grid */}
            {searchFamily && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky top-3 z-30 mb-6 p-4 rounded-2xl bg-gradient-to-r from-purple-950/95 via-purple-900/80 to-[#14161C]/95 border border-purple-500/30 shadow-2xl shadow-purple-950/40 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300"
                id="family-picks-onboarding-banner"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-black text-purple-300 uppercase tracking-wider">Viewing Buddy Picks</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      You are viewing shows tracked by your watch buddies. Click <span className="text-orange-400 font-extrabold">+ Add to Up Next</span> on any card to import it directly to your page!
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSearchFamily(false);
                    setActiveTab('active');
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold uppercase tracking-widest text-[10px] rounded-xl transition shadow-lg shadow-purple-950/30 active:scale-[0.98] shrink-0 cursor-pointer flex items-center gap-1.5"
                  id="family-picks-back-btn"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to My Watchlist</span>
                </button>
              </motion.div>
            )}

            {filteredShows.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {filteredShows.map((show, idx) => {
                  const myName = board.owner?.name || currentUser?.name || 'My Tracker';
                  const belongsToOther = show.ownerNames ? !show.ownerNames.includes(myName) : show.ownerName !== myName;
                  return (
                    <ShowCard
                      key={searchFamily ? `consolidated-${show.id}-${show.title.toLowerCase().trim()}-${idx}` : `${show.ownerName}-${show.id}-${show.title.toLowerCase().trim()}-${idx}`}
                      show={show}
                      onUpdateShow={handleUpdateShow}
                      onDeleteShow={handleDeleteShow}
                      isFriendView={isFriendView || searchFamily || belongsToOther}
                      onAddToMyQueue={handleAddToMyQueue}
                      isAlreadyInCollection={currentUserShows.some(s => s.title.toLowerCase().trim() === show.title.toLowerCase().trim())}
                      subscribedServices={currentUserPrefs?.services || []}
                      currentUser={currentUser}
                      allUsers={allUsers}
                      ownerName={searchFamily ? undefined : (isFriendView ? show.ownerName : undefined)}
                      ownerNames={searchFamily ? show.ownerNames : undefined}
                      familyDetails={searchFamily ? show.familyDetails : undefined}
                      highlightStatusPrompt={activeTab === 'queue' && idx === 0 && (showFirstStatusPrompt || onboardingStep === 1)}
                      onDismissHighlight={handleDismissFirstStatusPrompt}
                      onboardingStep={onboardingStep}
                      onboardingTargetShowId={onboardingTargetShowId}
                      onboardingHighlight={
                        (onboardingStep === 1 && idx === 0 && activeTab === 'queue') ||
                        (onboardingStep === 3 && show.id === onboardingTargetShowId) ||
                        (onboardingStep === 7 && idx === 0 && searchFamily)
                      }
                    />
                  );
                })}
              </div>
            ) : (
              <div className="rounded-3xl border border-white/5 bg-[#14161C]/60 backdrop-blur-md p-10 text-center space-y-6" id="empty-watchlist-state">
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-neutral-900 border border-white/5 flex items-center justify-center mx-auto text-neutral-400">
                    <Tv className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-slate-100 tracking-tight">No matching shows found</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                    We couldn't find any shows matching your current filter. Start tracking your next favorite show now!
                  </p>
                </div>

                {/* Elegant Two-Column CTAs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
                  {/* Option A: Buddy Picks */}
                  {!searchFamily && !isFriendView ? (
                    <button
                      id="empty-state-family-picks-btn"
                      onClick={() => {
                        setSearchFamily(true);
                        setActiveTab('all');
                        setTimeout(() => {
                          searchBarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 100);
                      }}
                      className="group relative text-left p-5 bg-gradient-to-b from-purple-950/15 to-purple-950/5 hover:from-purple-950/25 hover:to-purple-950/10 border border-purple-500/15 hover:border-purple-500/30 rounded-2xl transition-all duration-300 shadow-lg shadow-purple-950/10 active:scale-[0.98] cursor-pointer flex flex-col justify-between h-full"
                    >
                      <div className="space-y-2">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <h5 className="text-xs font-black text-purple-300 uppercase tracking-wider">Buddy Picks</h5>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Add some from your watch buddies' watchlists. One click imports their picks directly!
                        </p>
                      </div>
                      <div className="pt-4 flex items-center gap-1 text-[10px] font-black uppercase text-purple-400 tracking-widest">
                        <span>Explore Buddy Picks</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </button>
                  ) : (
                    <div className="group text-left p-5 bg-[#1E222B]/30 border border-white/5 rounded-2xl flex flex-col justify-between h-full" id="empty-state-family-picks-active">
                      <div className="space-y-2">
                        <div className="w-8 h-8 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-400">
                          <Users className="w-4 h-4" />
                        </div>
                        <h5 className="text-xs font-black text-slate-400 uppercase tracking-wider">Buddy Picks Watching</h5>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          You are currently viewing buddy-wide recommendations.
                        </p>
                      </div>
                      <button
                        onClick={() => setSearchFamily(false)}
                        className="mt-4 text-left text-[10px] font-black uppercase text-slate-400 hover:text-slate-200 tracking-widest cursor-pointer inline-flex items-center gap-1"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to My Board</span>
                      </button>
                    </div>
                  )}

                  {/* Option B: Add Your Own */}
                  <button
                    id="empty-state-add-show-btn"
                    onClick={() => setIsAddOpen(true)}
                    className="group relative text-left p-5 bg-gradient-to-b from-blue-950/15 to-blue-950/5 hover:from-blue-950/25 hover:to-blue-950/10 border border-blue-500/15 hover:border-blue-500/30 rounded-2xl transition-all duration-300 shadow-lg shadow-blue-950/10 active:scale-[0.98] cursor-pointer flex flex-col justify-between h-full"
                  >
                    <div className="space-y-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <h5 className="text-xs font-black text-blue-300 uppercase tracking-wider">Add Your Own</h5>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Search millions of titles manually to start tracking status, seasons, and episodes.
                      </p>
                    </div>
                    <div className="pt-4 flex items-center gap-1 text-[10px] font-black uppercase text-blue-400 tracking-widest">
                      <span>+ Add Show</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                </div>

                {/* Clear filters if active */}
                {(searchQuery.trim() !== '' || selectedService !== 'All' || selectedGenre !== 'All') && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedService('All');
                        setSelectedGenre('All');
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-widest bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer border border-white/5"
                    >
                      Clear Active Filters
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* AI Scout Sidebar panel (Fixed right on desktop) */}
          <div ref={chatAgentRef} className={`${isAiSidebarOpen ? 'md:col-span-1 block' : 'hidden'} h-full`}>
            {/* Desktop Side Panel */}
            <div className="hidden md:block sticky top-6 h-fit max-h-[calc(100vh-100px)] md:max-h-[840px]">
              <ChatAgent shows={board.shows} preferences={currentUserPrefs} onClose={() => setIsAiSidebarOpen(false)} currentUser={currentUser} />
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
                  <ChatAgent shows={board.shows} preferences={currentUserPrefs} onClose={() => setIsChatOpen(false)} currentUser={currentUser} />
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
            currentUser={currentUser}
          />
        </section>
      </div>

      {/* Floating Action Buttons for all screens (Mobile & Desktop) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3.5 items-end">
        {/* AI Scout Button */}
        <div className="relative flex items-center group">
          <span className="absolute right-14 scale-0 group-hover:scale-100 transition-all duration-150 origin-right whitespace-nowrap px-2.5 py-1.5 rounded-xl bg-slate-950/90 text-[10px] font-black tracking-widest uppercase text-emerald-400 border border-emerald-500/10 shadow-2xl">
            Ask SPUDZ
          </span>
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
            className={`p-3.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center border cursor-pointer ${
              isAiSidebarOpen || isChatOpen
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-emerald-500/20'
                : 'bg-emerald-600 text-white border-emerald-500/20 shadow-emerald-950/40'
            }`}
            title="Chat with Spudz Agent"
          >
            <Bot className={`w-4 h-4 ${(isAiSidebarOpen || isChatOpen) ? '' : 'animate-pulse'}`} />
          </button>
        </div>

        {/* Add Show Button */}
        {!isFriendView && (
          <div className="relative flex items-center group">
            <span className="absolute right-14 scale-0 group-hover:scale-100 transition-all duration-150 origin-right whitespace-nowrap px-2.5 py-1.5 rounded-xl bg-slate-950/90 text-[10px] font-black tracking-widest uppercase text-blue-400 border border-blue-500/10 shadow-2xl">
              Search & Add Show
            </span>
            <button
              onClick={() => setIsAddOpen(true)}
              className="p-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-2xl shadow-blue-950/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center border border-blue-500/20 cursor-pointer"
              title="Search & Add a Show"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Modals Container */}
      <AnimatePresence>
        {isAddOpen && (
          <AddShowModal
            onClose={() => setIsAddOpen(false)}
            onAddShow={handleAddShow}
            onboardingStep={onboardingStep}
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
            showWorkflowGuide={showWorkflowGuide}
            onToggleWorkflowGuide={(show) => {
              setShowWorkflowGuide(show);
              if (currentUser) {
                try {
                  const key = `coughtater_show_workflow_guide_${currentUser.id}`;
                  localStorage.setItem(key, show ? 'true' : 'false');
                } catch (e) {
                  console.error(e);
                }
              }
            }}
          />
        )}
        {showQueueOnboarding && (
          <QueueOnboardingModal
            isOpen={showQueueOnboarding}
            onClose={handleCloseOnboarding}
            hasRecommendations={localStorage.getItem(`coughtater_starter_pack_${currentUser?.id}`) !== 'false'}
          />
        )}
        {onboardingStep !== null && (
          <>
            {/* Spotlight Onboarding Dimming Backdrop */}
            <div className="fixed inset-0 bg-[#06080F]/65 backdrop-blur-[1px] pointer-events-auto z-40 transition-all duration-300" />
            
            <OnboardingWalkthrough
              step={onboardingStep}
              setStep={setOnboardingStep}
              userName={currentUser?.name || 'Friend'}
              targetShowTitle={board?.shows.find(s => s.id === onboardingTargetShowId)?.title || null}
              onSkip={() => handleCompleteInteractiveOnboarding(!autoDeleteOnboardingShow)}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              searchFamily={searchFamily}
              setSearchFamily={setSearchFamily}
              onKeepTargetShow={() => handleCompleteInteractiveOnboarding(true)}
              onDeleteTargetShow={() => handleCompleteInteractiveOnboarding(false)}
              autoDeleteShow={autoDeleteOnboardingShow}
              setAutoDeleteShow={setAutoDeleteOnboardingShow}
            />
          </>
        )}

        {/* Celebratory Completion Achievement Toast */}
        {completedShowToast && (
          <motion.div
            key="completion-toast"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 left-6 right-6 md:left-auto md:right-24 z-50 max-w-sm bg-[#161920]/95 backdrop-blur-xl border border-emerald-500/35 rounded-3xl p-4 shadow-[0_20px_50px_rgba(16,185,129,0.22)] select-none flex gap-4 overflow-hidden"
          >
            {/* Ambient backdrop glows */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

            {/* Banner/Cover Thumbnail */}
            {completedShowToast.bannerImage && (
              <div className="w-14 h-20 rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-md relative">
                <img
                  src={completedShowToast.bannerImage}
                  alt={completedShowToast.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
            )}

            {/* Info */}
            <div className="flex-1 pr-4 flex flex-col justify-center">
              <span className="inline-flex items-center gap-1 text-[9px] font-black tracking-widest text-emerald-400 uppercase">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                Show Completed!
              </span>
              <h4 className="text-xs font-black text-white mt-1 line-clamp-1">
                {completedShowToast.title}
              </h4>
              <p className="text-[10px] text-slate-400 leading-normal mt-1">
                Officially added to your <span className="text-emerald-400 font-bold">Library</span> pipeline! Keep on munching those couch taters! 🥔🏆✨
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setCompletedShowToast(null)}
              className="absolute top-3 right-3 text-slate-500 hover:text-slate-200 hover:bg-white/5 p-1 rounded-lg transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
        {/* Hidden stats functionality for now */}
      </AnimatePresence>

    </div>
  );
}
