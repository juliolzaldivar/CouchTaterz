/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { TvShow, Board, StreamingService, ShowStatus, User, UserPreferences, AppNotification, TaterzAIIntent } from './types';
import { ShowCard } from './components/ShowCard';
import { UpcomingCarousel } from './components/UpcomingCarousel';
import { AddShowModal } from './components/AddShowModal';
import { ChatAgent } from './components/ChatAgent';
import { AskTaterzAIModal } from './components/AskTaterzAIModal';
import { ShareBoardModal } from './components/ShareBoardModal';
import { ManageActiveShowsModal } from './components/ManageActiveShowsModal';
import { RecommendationsCarousel } from './components/RecommendationsCarousel';
import { ShowCalendarModal } from './components/ShowCalendarModal';
import { StreamingStatsModal } from './components/StreamingStatsModal';
import { LoginPage } from './components/LoginPage';
import { PreferencesModal } from './components/PreferencesModal';
import { QueueOnboardingModal } from './components/QueueOnboardingModal';
import { OnboardingWalkthrough } from './components/OnboardingWalkthrough';
import { UserAdminModal } from './components/UserAdminModal';
import { AdminImpersonationBar } from './components/AdminImpersonationBar';
import { SocialStoryCardModal } from './components/SocialStoryCardModal';
import { SoftGateAuthModal } from './components/SoftGateAuthModal';
import { TaterzAvatarBuilderModal } from './components/TaterzAvatarBuilderModal';
import { ProductGuidePage } from './components/ProductGuidePage';
import { logOutUser } from './firebase';
import { 
  getFriendsData, 
  fetchFriendsDataAsync, 
  respondToFriendRequest, 
  autoConnectUsers, 
  JULIO_USER_ID, 
  FriendsData, 
  FriendRequestDetail 
} from './utils/friendsStorage';
import { normalizeShowTitle, isSameShowTitle, getCanonicalShowTitle } from './utils/titleUtils';
import { JULIO_OFFICIAL_AVATAR } from './utils/taterAvatarUtils';

// Helper checks for Julio and user equality
const isUserJulio = (user?: { id?: string; email?: string; name?: string; isAdmin?: boolean; isPro?: boolean } | null) => {
  if (!user) return false;
  const email = user.email?.trim().toLowerCase();
  if (email === 'juliozaldivar@gmail.com' || email === 'julio@couchtaterz.com' || email === 'julio@taterz.com') return true;
  if (user.id === 'default' || user.id === 'user-julio') return true;
  if (user.name?.trim().toLowerCase() === 'julio' && (!user.id || user.id === 'default' || user.id === 'user-julio' || user.id.startsWith('user-julio-'))) return true;
  return false;
};

const isUserSelf = (
  target: { id?: string; email?: string; name?: string } | null | undefined,
  current: { id?: string; email?: string; name?: string } | null
) => {
  if (!target || !current) return false;
  if (target.id && current.id && target.id === current.id) return true;
  if (target.email && current.email && target.email.toLowerCase() === current.email.toLowerCase()) return true;
  if (isUserJulio(target) && isUserJulio(current)) return true;
  return false;
};
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
  UserPlus,
  Compass, 
  Filter,
  SlidersHorizontal,
  Bot,
  Check,
  CheckCircle2,
  Calendar as CalendarIcon,
  BarChart3,
  Archive,
  Clock,
  LogOut,
  ArrowLeft,
  User as UserIcon,
  Star,
  ChevronUp,
  X,
  Reply,
  Send,
  Shield,
  LogIn,
  UserCheck,
  Bell,
  Radio,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { getNormalizedGenres } from './utils/genreUtils';
import { getShowBannerImage } from './utils/showBanners';
export { getNormalizedGenres, getShowBannerImage };

const normalizeClientBoardId = (id: string): string => {
  if (!id) return 'default';
  const clean = id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
  if (clean === 'julio' || clean === 'user-julio' || clean === 'default') return 'default';
  if (clean === 'ejc' || clean === 'user-ejc' || clean === 'user-ejc-2841') return 'user-ejc-2841';
  if (clean === 'stef' || clean === 'user-stef' || clean === 'user-stef-4912') return 'user-stef-4912';
  if (clean === 'kris' || clean === 'user-kris' || clean === 'user-kris-5139') return 'user-kris-5139';
  if (clean === 'rafael' || clean === 'user-rafael' || clean === 'user-rafael-9639') return 'user-rafael-9639';
  if (clean === 'annadee' || clean === 'lily' || clean === 'user-lily-9367') return 'user-lily-9367';
  if (clean === 'julian' || clean === 'user-julian-7667') return 'user-julian-7667';
  if (clean === 'lilyann' || clean === 'user-lilyann-4290') return 'user-lilyann-4290';
  if (clean === 'greg' || clean === 'user-greg' || clean === 'user-greg-3842') return 'user-greg-3842';
  if (clean === 'hyunjin' || clean === 'user-hyunjin' || clean === 'user-hyunjin-6821') return 'user-hyunjin-6821';
  if (clean === 'doug' || clean === 'user-doug' || clean === 'doug-briskie' || clean === 'user-doug-briskie' || clean === 'user-doug-briskie-5088' || clean === 'user-doug-5821') return 'user-doug-5821';
  return clean;
};

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

  const [adminImpersonator, setAdminImpersonator] = useState<User | null>(() => {
    const saved = localStorage.getItem('coughtater_admin_impersonator');
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
    const pathname = window.location.pathname;
    if (pathname.startsWith('/list/')) {
      const extracted = pathname.split('/list/')[1]?.split('/')[0]?.split('?')[0];
      if (extracted) return normalizeClientBoardId(extracted);
    }
    if (pathname.startsWith('/p/')) {
      const extracted = pathname.split('/p/')[1]?.split('/')[0]?.split('?')[0];
      if (extracted) return normalizeClientBoardId(extracted);
    }
    const params = new URLSearchParams(window.location.search);
    const queryBoard = params.get('board') || params.get('list');
    if (queryBoard) {
      return normalizeClientBoardId(queryBoard);
    }
    const saved = localStorage.getItem('coughtater_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u && u.id) return normalizeClientBoardId(u.id);
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
      const isJulioAccount = !adminImpersonator && (currentUser.email?.toLowerCase().trim() === 'juliozaldivar@gmail.com' || currentUser.id === 'default' || currentUser.id === 'user-julio');
      const isLegacyEjc = currentUser.id === 'user-ejc' || currentUser.id === 'ejc';
      const isLegacyStef = currentUser.id === 'user-stef' || currentUser.id === 'stef';
      const isLegacyKris = currentUser.id === 'user-kris' || currentUser.id === 'kris' || currentUser.id === 'user-kris-vance';
      const isLegacyRafael = currentUser.id === 'user-rafael' || currentUser.id === 'rafael' || currentUser.id === 'user-rafael-gomez';
      const isLegacyGreg = currentUser.id === 'user-greg' || (currentUser.id !== 'user-greg-3842' && currentUser.email?.toLowerCase() === 'greg@taterz.com');
      const isLegacyHyunjin = currentUser.id === 'user-hyunjin' || (currentUser.id !== 'user-hyunjin-6821' && (currentUser.email?.toLowerCase() === 'hyunjin@taterz.com' || currentUser.name?.toLowerCase().trim() === 'hyunjin'));
      const isLegacyJulian = currentUser.id === 'user-julian' || (currentUser.id !== 'user-julian-7667' && currentUser.email?.toLowerCase() === 'julian@taterz.com');
      const isLegacyLilyann = currentUser.id === 'user-lilyann' || (currentUser.id !== 'user-lilyann-4290' && currentUser.email?.toLowerCase() === 'lilyann@taterz.com');
      const isLegacyDoug = currentUser.id === 'user-doug' || currentUser.id === 'doug' || currentUser.id === 'user-doug-briskie-5088' || currentUser.id === 'user-doug-briskie' || (currentUser.id !== 'user-doug-5821' && (currentUser.email?.toLowerCase() === 'doug.briskie@icloud.com' || currentUser.email?.toLowerCase() === 'doug@coughtater.com' || currentUser.name?.toLowerCase().trim() === 'doug' || currentUser.name?.toLowerCase().trim() === 'doug briskie'));

      if (isJulioAccount) {
        localStorage.setItem('couchtaterz_is_pro', 'true');
        const hasLegacyPotatoAvatar = currentUser.avatarUrl?.startsWith('data:image') || currentUser.avatarUrl?.includes('seed=Julio');
        if (currentUser.id !== 'default' || !currentUser.isPro || !currentUser.isAdmin || !currentUser.avatarUrl || hasLegacyPotatoAvatar) {
          const correctedUser = {
            ...currentUser,
            id: 'default',
            name: currentUser.name || 'Julio',
            email: currentUser.email || 'julio@couchtaterz.com',
            avatarUrl: JULIO_OFFICIAL_AVATAR,
            isPro: true,
            isAdmin: true
          };
          setCurrentUser(correctedUser);
          localStorage.setItem('coughtater_user', JSON.stringify(correctedUser));
          setBoardId('default');
        }
      } else if (isLegacyEjc) {
        const correctedUser = { ...currentUser, id: 'user-ejc-2841', name: currentUser.name || 'EJC', email: 'ejc@taterz.com' };
        setCurrentUser(correctedUser);
        localStorage.setItem('coughtater_user', JSON.stringify(correctedUser));
        setBoardId('user-ejc-2841');
      } else if (isLegacyStef) {
        const correctedUser = { ...currentUser, id: 'user-stef-4912', name: currentUser.name || 'Stef', email: 'stef@taterz.com' };
        setCurrentUser(correctedUser);
        localStorage.setItem('coughtater_user', JSON.stringify(correctedUser));
        setBoardId('user-stef-4912');
      } else if (isLegacyGreg) {
        const correctedUser = { ...currentUser, id: 'user-greg-3842', name: currentUser.name || 'Greg', email: 'greg@taterz.com' };
        setCurrentUser(correctedUser);
        localStorage.setItem('coughtater_user', JSON.stringify(correctedUser));
        setBoardId('user-greg-3842');
      } else if (isLegacyHyunjin) {
        const correctedUser = { ...currentUser, id: 'user-hyunjin-6821', name: currentUser.name || 'Hyunjin', email: 'hyunjin@taterz.com' };
        setCurrentUser(correctedUser);
        localStorage.setItem('coughtater_user', JSON.stringify(correctedUser));
        setBoardId('user-hyunjin-6821');
      } else if (isLegacyJulian) {
        const correctedUser = { ...currentUser, id: 'user-julian-7667' };
        setCurrentUser(correctedUser);
        localStorage.setItem('coughtater_user', JSON.stringify(correctedUser));
        setBoardId('user-julian-7667');
      } else if (isLegacyRafael) {
        const correctedUser = { ...currentUser, id: 'user-rafael-9639' };
        setCurrentUser(correctedUser);
        localStorage.setItem('coughtater_user', JSON.stringify(correctedUser));
        setBoardId('user-rafael-9639');
      } else if (isLegacyKris) {
        const correctedUser = { ...currentUser, id: 'user-kris-5139' };
        setCurrentUser(correctedUser);
        localStorage.setItem('coughtater_user', JSON.stringify(correctedUser));
        setBoardId('user-kris-5139');
      } else if (isLegacyLilyann) {
        const correctedUser = { ...currentUser, id: 'user-lilyann-4290' };
        setCurrentUser(correctedUser);
        localStorage.setItem('coughtater_user', JSON.stringify(correctedUser));
        setBoardId('user-lilyann-4290');
      } else if (isLegacyDoug) {
        const correctedUser = {
          ...currentUser,
          id: 'user-doug-5821',
          name: currentUser.name || 'Doug Briskie',
          email: 'doug.briskie@icloud.com',
          avatarUrl: currentUser.avatarUrl || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=DougBriskie'
        };
        setCurrentUser(correctedUser);
        localStorage.setItem('coughtater_user', JSON.stringify(correctedUser));
        setBoardId('user-doug-5821');
      }
    }
  }, [currentUser, adminImpersonator]);

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
      let isMounted = true;
      fetch(`/api/boards?id=${currentUser.id}`)
        .then(res => {
          if (res.ok) return res.json();
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        })
        .then((data: Board) => {
          if (isMounted && data) {
            if (Array.isArray(data.shows)) {
              setCurrentUserShows(data.shows);
            }
            if (data.preferences) {
              setCurrentUserPrefs(data.preferences);
            }
            // Auto-heal / sync custom avatar from server & Firestore if available
            if (data.owner?.avatarUrl && data.owner.avatarUrl !== currentUser.avatarUrl && !currentUser.avatarUrl) {
              const updatedUser = { ...currentUser, avatarUrl: data.owner.avatarUrl };
              setCurrentUser(updatedUser);
              localStorage.setItem('coughtater_user', JSON.stringify(updatedUser));
            }
          }
        })
        .catch(err => {
          if (isMounted) {
            console.error("Failed to fetch current user's shows and preferences:", err?.message || err);
          }
        });

      return () => {
        isMounted = false;
      };
    }
  }, [currentUser, boardId, board]);

  useEffect(() => {
    if (!currentUser) return;

    let lastPingTime = Date.now();
    let isInitialLoginSent = false;

    const sendPresence = (isLogin = false) => {
      const now = Date.now();
      const elapsedSeconds = Math.min(Math.max(Math.round((now - lastPingTime) / 1000), 1), 60);
      lastPingTime = now;

      fetch('/api/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          activeSeconds: isLogin ? 0 : elapsedSeconds,
          isLogin: isLogin || !isInitialLoginSent
        })
      }).catch(() => {});
      isInitialLoginSent = true;
    };

    const fetchUsers = () => {
      fetch(`/api/users?currentUserId=${encodeURIComponent(currentUser.id)}&email=${encodeURIComponent(currentUser.email || '')}&name=${encodeURIComponent(currentUser.name || '')}`)
        .then(res => {
          const contentType = res.headers.get('content-type');
          if (res.ok && contentType && contentType.includes('application/json')) {
            return res.json();
          }
          return null;
        })
        .then(data => {
          if (Array.isArray(data)) {
            const seen = new Set<string>();
            const unique = data.filter((u: any) => u && u.id && !seen.has(u.id) && seen.add(u.id));
            setAllUsers(unique);
          }
        })
        .catch(() => {});
    };

    sendPresence(true);
    fetchUsers();

    // Poll presence and users every 10 seconds for live active status and time tracking (only when tab is visible)
    const interval = setInterval(() => {
      if (!document.hidden) {
        sendPresence(false);
        fetchUsers();
      }
    }, 10000);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        lastPingTime = Date.now();
        sendPresence(false);
        fetchUsers();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentUser]);

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Friends & Binge Buddies state
  const [friendsState, setFriendsState] = useState<FriendsData>(() => 
    getFriendsData(currentUser?.id || JULIO_USER_ID)
  );
  const [inviteConnectedToast, setInviteConnectedToast] = useState<string | null>(null);
  const [replyMessages, setReplyMessages] = useState<Record<string, string>>({});

  // Notification Reply States
  const [replyingNotifId, setReplyingNotifId] = useState<string | null>(null);
  const [notifReplyTextMap, setNotifReplyTextMap] = useState<Record<string, string>>({});
  const [isSendingReplyMap, setIsSendingReplyMap] = useState<Record<string, boolean>>({});
  const [replySentSuccessMap, setReplySentSuccessMap] = useState<Record<string, string>>({});

  // Sync friends state when currentUser changes (syncing local + server)
  useEffect(() => {
    if (currentUser) {
      setFriendsState(getFriendsData(currentUser.id));
      fetchFriendsDataAsync(currentUser.id).then(serverData => {
        setFriendsState(serverData);
      });
    }
  }, [currentUser]);

  // Compute pending incoming requests list with full details
  const pendingIncomingRequests = useMemo(() => {
    if (!friendsState || !Array.isArray(friendsState.pendingReceived)) return [];
    return friendsState.pendingReceived.map(item => {
      if (typeof item === 'string') {
        const foundUser = allUsers.find(u => u.id === item);
        return {
          fromUserId: item,
          fromUserName: foundUser?.name || 'A CouchTaterz Member',
          fromUserAvatar: foundUser?.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${item}`,
          message: undefined
        };
      } else {
        const foundUser = allUsers.find(u => u.id === item.fromUserId);
        return {
          fromUserId: item.fromUserId,
          fromUserName: item.fromUserName || foundUser?.name || 'A CouchTaterz Member',
          fromUserAvatar: item.fromUserAvatar || foundUser?.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${item.fromUserId}`,
          message: item.message,
          sentAt: item.sentAt
        };
      }
    });
  }, [friendsState, allUsers]);

  const handleAcceptBuddyRequest = async (fromUserId: string, fromUserName: string) => {
    if (!currentUser) return;
    const replyMsg = replyMessages[fromUserId];
    respondToFriendRequest(currentUser.id, fromUserId, 'accept', replyMsg);
    const updated = await fetchFriendsDataAsync(currentUser.id);
    setFriendsState(updated);
    setInviteConnectedToast(`🎉 You are now Binge Buddies with ${fromUserName}!`);
    setTimeout(() => setInviteConnectedToast(null), 5000);
  };

  const handleDeclineBuddyRequest = async (fromUserId: string, fromUserName: string) => {
    if (!currentUser) return;
    const replyMsg = replyMessages[fromUserId];
    respondToFriendRequest(currentUser.id, fromUserId, 'reject', replyMsg);
    const updated = await fetchFriendsDataAsync(currentUser.id);
    setFriendsState(updated);
  };

  // Handle URL invite link parameter (?inviteFrom=userId or ?inviteCode=userId)
  useEffect(() => {
    if (!currentUser) return;

    const params = new URLSearchParams(window.location.search);
    const inviteFrom = params.get('inviteFrom') || params.get('inviteCode');

    if (inviteFrom && inviteFrom !== currentUser.id) {
      autoConnectUsers(currentUser.id, inviteFrom);
      const updated = getFriendsData(currentUser.id);
      setFriendsState(updated);

      // Clean invite URL parameters without removing the board parameter
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('inviteFrom');
        url.searchParams.delete('inviteCode');
        url.searchParams.delete('inviterName');
        window.history.replaceState({}, document.title, url.toString());
      } catch (e) {}

      const inviterName = params.get('inviterName') || allUsers.find(u => u.id === inviteFrom)?.name || 'a CouchTaterz friend';
      setInviteConnectedToast(`🎉 Connected with ${inviterName}! You are now Binge Buddies on CouchTaterz.`);
      setTimeout(() => setInviteConnectedToast(null), 5000);
    }
  }, [currentUser, allUsers]);

  // Modals / Panels
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addModalInitialTab, setAddModalInitialTab] = useState<'search' | 'buddies'>('search');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isBuddyMenuOpen, setIsBuddyMenuOpen] = useState(false);
  const buddyMenuRef = useRef<HTMLDivElement>(null);
  const [isChatOpen, setIsChatOpen] = useState(false); // Mobile chat panel toggle
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false); // Desktop sidebar toggle
  const chatAgentRef = useRef<HTMLDivElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const [isManageActiveOpen, setIsManageActiveOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [showQueueOnboarding, setShowQueueOnboarding] = useState(false);

  // AskTaterz AI Engine Modal State
  const [isTaterzAiOpen, setIsTaterzAiOpen] = useState(false);
  const [taterzAiIntent, setTaterzAiIntent] = useState<TaterzAIIntent>('general_chat');
  const [taterzAiShow, setTaterzAiShow] = useState<TvShow | undefined>(undefined);

  const handleOpenTaterzAiRecap = (show: TvShow) => {
    setTaterzAiShow(show);
    setTaterzAiIntent('recap');
    setIsTaterzAiOpen(true);
  };

  const handleOpenTaterzAiGroup = () => {
    setTaterzAiShow(undefined);
    setTaterzAiIntent('group_recommendation');
    setIsTaterzAiOpen(true);
  };

  const handleOpenTaterzAiGeneral = () => {
    setTaterzAiShow(undefined);
    setTaterzAiIntent('general_chat');
    setIsTaterzAiOpen(true);
  };

  // 9:16 Social Story Card Generator State
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [storyModalShow, setStoryModalShow] = useState<TvShow | null>(null);
  const [storyTriggerReason, setStoryTriggerReason] = useState<'completed' | 'high_rating' | 'manual'>('manual');

  // Soft-gate Auth Modal State
  const [isSoftGateOpen, setIsSoftGateOpen] = useState(false);
  const [softGateActionTitle, setSoftGateActionTitle] = useState('interact with watch lists');
  const [pendingGuestAction, setPendingGuestAction] = useState<((loggedInUser?: User) => void) | null>(null);

  // Custom Taterz Avatar Studio State
  const [isAvatarStudioOpen, setIsAvatarStudioOpen] = useState(false);

  // Feature Guide & Field Manual Modal State
  const [isFeatureGuideOpen, setIsFeatureGuideOpen] = useState<boolean>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return (
        params.get('guide') === 'true' || 
        window.location.hash === '#guide' || 
        window.location.pathname.startsWith('/guide') ||
        window.location.pathname.startsWith('/help') ||
        window.location.pathname.startsWith('/docs')
      );
    } catch (e) {
      return false;
    }
  });

  // Auto-open guide if ?guide=true, #guide, /guide, /help, /docs in URL
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const isGuideRoute = 
        params.get('guide') === 'true' || 
        window.location.hash === '#guide' || 
        window.location.pathname.startsWith('/guide') ||
        window.location.pathname.startsWith('/help') ||
        window.location.pathname.startsWith('/docs');
      if (isGuideRoute) {
        setIsFeatureGuideOpen(true);
      }
    } catch (e) {}
  }, []);

  const handleNavigateFromGuide = (target: 'add_show' | 'calendar' | 'spudz_ai' | 'buddies' | 'avatar' | 'stats' | 'preferences') => {
    setIsFeatureGuideOpen(false);
    if (target === 'add_show') {
      setAddModalInitialTab('search');
      setIsAddOpen(true);
    } else if (target === 'calendar') {
      setIsCalendarOpen(true);
    } else if (target === 'spudz_ai') {
      handleOpenTaterzAiGeneral();
    } else if (target === 'buddies') {
      setIsShareOpen(true);
    } else if (target === 'avatar') {
      setIsAvatarStudioOpen(true);
    } else if (target === 'stats') {
      setIsStatsOpen(true);
    } else if (target === 'preferences') {
      setIsPreferencesOpen(true);
    }
  };

  const handleOpenStoryCard = (show: TvShow, reason: 'completed' | 'high_rating' | 'manual' = 'manual') => {
    setStoryModalShow(show);
    setStoryTriggerReason(reason);
    setIsStoryModalOpen(true);
  };

  const handleRequireAuth = (actionTitle: string, actionFn: (loggedInUser?: User) => void) => {
    const activeUser = currentUser || (() => {
      try {
        const saved = localStorage.getItem('coughtater_user');
        return saved ? JSON.parse(saved) : null;
      } catch (e) { return null; }
    })();

    if (activeUser) {
      if (!currentUser) setCurrentUser(activeUser);
      actionFn(activeUser);
      return;
    }
    setSoftGateActionTitle(actionTitle);
    setPendingGuestAction(() => (loggedInUser?: User) => actionFn(loggedInUser));
    setIsSoftGateOpen(true);
  };

  const handleSoftGateSuccessLogin = async (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('coughtater_user', JSON.stringify(user));
    setIsSoftGateOpen(false);
    
    let myBoard: Board | null = null;
    try {
      const res = await fetch(`/api/boards?id=${user.id}`);
      if (res.ok) {
        myBoard = await res.json();
      }
    } catch (e) {}

    if (!myBoard) {
      myBoard = {
        id: user.id,
        name: `${user.name}'s Collection`,
        shows: [],
        owner: user,
        updatedAt: new Date().toISOString()
      };
      try {
        await fetch('/api/boards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(myBoard),
        });
      } catch (e) {}
    }

    // Load user's shows into currentUserShows state
    setCurrentUserShows(myBoard.shows || []);

    const viewingFriendBoard = !!(boardId && boardId !== user.id);

    if (viewingFriendBoard) {
      // User signed up while visiting a friend's public binge list
      // Stay on friend's board, keep currentUser logged in, and defer onboarding
      setIsNewlyRegisteredUser(true);
      localStorage.setItem(`coughtater_starter_pack_${user.id}`, 'true');
      localStorage.removeItem(`seen_queue_onboarding_${user.id}`);
    } else {
      handleLogin(myBoard, { isNewAccount: true });
    }

    if (pendingGuestAction) {
      const actionToRun = pendingGuestAction;
      setPendingGuestAction(null);
      setTimeout(() => {
        actionToRun(user);
      }, 150);
    }
  };
  const [showFirstStatusPrompt, setShowFirstStatusPrompt] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<number | null>(null);
  const [autoDeleteOnboardingShow, setAutoDeleteOnboardingShow] = useState(false);
  const [onboardingTargetShowId, setOnboardingTargetShowId] = useState<string | null>(null);
  const [isNewlyRegisteredUser, setIsNewlyRegisteredUser] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Lock body scroll whenever any modal or panel overlay is active to eliminate background thrashing/flicker
  const isAnyModalOpen = isAddOpen || isShareOpen || isManageActiveOpen || isCalendarOpen || isStatsOpen || isPreferencesOpen || isAdminOpen || showQueueOnboarding || isAvatarStudioOpen || isStoryModalOpen || isSoftGateOpen;

  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAnyModalOpen]);

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
    const handleClickOutside = (e: MouseEvent) => {
      if (buddyMenuRef.current && !buddyMenuRef.current.contains(e.target as Node)) {
        setIsBuddyMenuOpen(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFamily, setSearchFamily] = useState(false);
  const [familyBoards, setFamilyBoards] = useState<Record<string, Board>>({});
  const [isLoadingFamilyBoards, setIsLoadingFamilyBoards] = useState(false);
  const [selectedService, setSelectedService] = useState<StreamingService | 'All'>('All');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'library' | 'queue'>('active');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  
  type SortOption = 'airingNext' | 'recent' | 'rtScore' | 'userScore' | 'title' | 'category';
  const DEFAULT_SECTION_SORTS: Record<'all' | 'active' | 'library' | 'queue', SortOption> = {
    active: 'airingNext',
    queue: 'airingNext',
    library: 'title',
    all: 'airingNext'
  };

  const [sectionSorts, setSectionSorts] = useState<Record<'all' | 'active' | 'library' | 'queue', SortOption>>(() => {
    try {
      const saved = localStorage.getItem('couchtaterz_section_sorts');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_SECTION_SORTS, ...parsed };
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_SECTION_SORTS;
  });

  const sortBy = sectionSorts[activeTab] || DEFAULT_SECTION_SORTS[activeTab] || 'airingNext';

  const setSortBy = (newSort: SortOption) => {
    setSectionSorts(prev => {
      const updated = { ...prev, [activeTab]: newSort };
      try {
        localStorage.setItem('couchtaterz_section_sorts', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
  };
  const [showStarterAlert, setShowStarterAlert] = useState(false);
  const lastBoardIdRef = useRef<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Global keyboard shortcut ('/' or 'Cmd/Ctrl+K') to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Back to top scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scroll overflow detection for Streaming Services Coverage ribbon
  const serviceRibbonRef = useRef<HTMLDivElement>(null);
  const [canScrollServiceLeft, setCanScrollServiceLeft] = useState(false);
  const [canScrollServiceRight, setCanScrollServiceRight] = useState(false);

  const checkServiceScroll = useCallback(() => {
    const el = serviceRibbonRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollServiceLeft(scrollLeft > 8);
    setCanScrollServiceRight(scrollLeft + clientWidth < scrollWidth - 8);
  }, []);

  useEffect(() => {
    checkServiceScroll();
    const timer = setTimeout(checkServiceScroll, 100);
    const el = serviceRibbonRef.current;
    if (el) {
      const observer = new ResizeObserver(() => checkServiceScroll());
      observer.observe(el);
      window.addEventListener('resize', checkServiceScroll);
      return () => {
        clearTimeout(timer);
        observer.disconnect();
        window.removeEventListener('resize', checkServiceScroll);
      };
    }
    return () => clearTimeout(timer);
  }, [checkServiceScroll, board?.shows]);

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
        bannerImage: getShowBannerImage(show)
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
      bannerImage: getShowBannerImage(show)
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

  // Sync all family boards from the backend whenever user logs in or switches account
  const lastFamilyBoardsFetchRef = useRef<number>(0);
  useEffect(() => {
    let isMounted = true;
    let retryTimer: NodeJS.Timeout;

    const loadFamilyBoards = (attempt = 1) => {
      if (!currentUser) return;
      // Debounce if fetched within the last 8 seconds
      const now = Date.now();
      if (now - lastFamilyBoardsFetchRef.current < 8000 && attempt === 1) {
        return;
      }
      lastFamilyBoardsFetchRef.current = now;
      setIsLoadingFamilyBoards(true);

      fetch('/api/boards?all=true')
        .then(res => {
          if (res.ok) return res.json();
          if (res.status === 429) {
            // Transient rate limit backoff
            return null;
          }
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        })
        .then((data: Record<string, Board> | null) => {
          if (isMounted && data && typeof data === 'object') {
            setFamilyBoards(data);
            setIsLoadingFamilyBoards(false);
            if (boardId && data[boardId]) {
              setBoard(prev => {
                if (!prev || prev.id === boardId) return data[boardId];
                return prev;
              });
            }
          } else if (isMounted) {
            setIsLoadingFamilyBoards(false);
          }
        })
        .catch(err => {
          if (!isMounted) return;
          if (attempt < 3) {
            retryTimer = setTimeout(() => {
              if (isMounted) loadFamilyBoards(attempt + 1);
            }, attempt * 2000);
          } else {
            console.warn("Family boards sync note:", err?.message || err);
            setIsLoadingFamilyBoards(false);
          }
        });
    };

    if (currentUser) {
      loadFamilyBoards(1);
    }

    return () => {
      isMounted = false;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [currentUser?.id]);

  // Load board code from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryBoard = params.get('board') || params.get('list');
    if (queryBoard) {
      const cleanCode = normalizeClientBoardId(queryBoard);
      if (cleanCode && cleanCode !== boardId) {
        setBoardId(cleanCode);
      }
    } else if (!boardId && currentUser) {
      setBoardId(currentUser.id);
    }
  }, [currentUser, boardId]);

  // Default to 'active' ('Watching') if visiting a friend's board or own board
  useEffect(() => {
    if (boardId) {
      if (boardId !== lastBoardIdRef.current) {
        if (!currentUser || boardId !== currentUser.id) {
          setActiveTab('active');
        } else {
          const isNewUser = isNewlyRegisteredUser;
          const hasSeenOnboarding = localStorage.getItem(`seen_queue_onboarding_${currentUser.id}`) === 'true';
          if (showStarterAlert || (isNewUser && !hasSeenOnboarding)) {
            setActiveTab('queue');
          } else {
            setActiveTab('active');
          }
        }
        lastBoardIdRef.current = boardId;
      }
    }
  }, [boardId, currentUser, showStarterAlert]);

  // Sync / Fetch active board data safely without overwriting friend boards
  useEffect(() => {
    if (!boardId) return;

    // Check memory (familyBoards) or disk cache first for instant synchronous board update
    if (familyBoards[boardId] && (!board || board.id !== boardId)) {
      setBoard(familyBoards[boardId]);
    } else {
      const localKey = `couchtater_board_${boardId}`;
      const localSaved = localStorage.getItem(localKey);
      if (localSaved && (!board || board.id !== boardId)) {
        try {
          const parsed = JSON.parse(localSaved);
          if (parsed && parsed.shows) {
            setBoard(parsed);
          }
        } catch (e) {}
      }
    }

    let isSubscribed = true;

    const fetchBoard = async () => {
      try {
        const localKey = `couchtater_board_${boardId}`;
        const localSaved = localStorage.getItem(localKey);

        const res = await fetch(`/api/boards?id=${encodeURIComponent(boardId)}`);
        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (!isSubscribed) return;

          let finalBoard = data;
          if (localSaved) {
            try {
              const localParsed = JSON.parse(localSaved);
              const localTime = new Date(localParsed.updatedAt || 0).getTime();
              const serverTime = new Date(data.updatedAt || 0).getTime();
              if (localTime > serverTime && localParsed.shows) {
                finalBoard = localParsed;
              }
            } catch (e) {}
          }

          setBoard(finalBoard);
          localStorage.setItem(localKey, JSON.stringify(finalBoard));
          setFamilyBoards(prev => ({ ...prev, [boardId]: finalBoard }));
        } else {
          // Fallback if requested board fails to return OK
          if (!board) {
            const fallbackRes = await fetch('/api/boards?id=default');
            if (fallbackRes.ok && isSubscribed) {
              const fallbackData = await fallbackRes.json();
              setBoard(fallbackData);
            }
          }
        }
      } catch (err) {
        console.warn("Transient: Failed to load board data from server:", err);
        if (!board) {
          try {
            const fallbackRes = await fetch('/api/boards?id=default');
            if (fallbackRes.ok && isSubscribed) {
              const fallbackData = await fallbackRes.json();
              setBoard(fallbackData);
            }
          } catch (e) {}
        }
      }
    };

    fetchBoard();

    return () => {
      isSubscribed = false;
    };
  }, [boardId, currentUser]);

  // Poll for board/notifications updates every 15 seconds (only when active tab)
  useEffect(() => {
    if (!boardId) return;
    
    const interval = setInterval(async () => {
      if (document.hidden) return;
      try {
        const res = await fetch(`/api/boards?id=${boardId}`);
        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          const data = await res.json();
          setBoard(prevBoard => {
            if (!prevBoard) return data;

            const serverTime = new Date(data.updatedAt || 0).getTime();
            const localTime = new Date(prevBoard.updatedAt || 0).getTime();
            const hasNotifChanges = JSON.stringify(prevBoard.notifications || []) !== JSON.stringify(data.notifications || []);

            // Strictly accept server state only if it is NEWER than local optimistic state
            if (serverTime > localTime) {
              const localKey = `couchtater_board_${boardId}`;
              localStorage.setItem(localKey, JSON.stringify(data));
              return data;
            } else if (hasNotifChanges) {
              // Update notifications without overwriting local show state/progress
              const updated = { ...prevBoard, notifications: data.notifications || [] };
              const localKey = `couchtater_board_${boardId}`;
              localStorage.setItem(localKey, JSON.stringify(updated));
              return updated;
            }
            return prevBoard;
          });
        }
      } catch (err) {
        console.warn("Transient: Failed to poll board updates:", err);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [boardId, currentUser]);

  // Auto-highlight and scroll to target show when ?show= parameter is present in URL
  useEffect(() => {
    if (!board || !Array.isArray(board.shows)) return;
    const params = new URLSearchParams(window.location.search);
    const targetShowId = params.get('show');
    if (!targetShowId) return;

    const matched = board.shows.find(s => s.id === targetShowId || s.id.toLowerCase().includes(targetShowId.toLowerCase()) || s.title.toLowerCase().includes(targetShowId.toLowerCase()));
    if (matched) {
      if (matched.status === 'Watching') {
        setActiveTab('active');
      } else if (matched.status === 'Completed') {
        setActiveTab('library');
      } else if (matched.status === 'Backlog') {
        setActiveTab('queue');
      } else {
        setActiveTab('active');
      }
      setTimeout(() => {
        const el = document.getElementById(`show-card-${matched.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-4', 'ring-purple-500', 'ring-offset-2', 'ring-offset-slate-900', 'transition-all');
          setTimeout(() => {
            el.classList.remove('ring-4', 'ring-purple-500', 'ring-offset-2', 'ring-offset-slate-900', 'transition-all');
          }, 3500);
        }
      }, 350);
    }
  }, [board]);

  // Sync board updates back to server
  const saveBoardToServer = async (updatedShows: TvShow[], customName?: string, deletedShowId?: string) => {
    if (!board) return;
    try {
      const nowIso = new Date().toISOString();
      const updatedBoard: Board & { deletedShowId?: string } = {
        ...board,
        name: customName || board.name,
        shows: updatedShows,
        updatedAt: nowIso,
        ...(deletedShowId ? { deletedShowId } : {})
      };
      
      // Optimistic update
      setBoard(updatedBoard);

      // Instantly cache locally so progress is never lost
      localStorage.setItem(`couchtater_board_${boardId}`, JSON.stringify(updatedBoard));

      const res = await fetch('/api/boards', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Email': currentUser?.email || '',
          'X-User-Id': currentUser?.id || ''
        },
        body: JSON.stringify(updatedBoard),
      });

      if (res.ok) {
        const savedData = await res.json();
        if (savedData && savedData.updatedAt) {
          setBoard(prevBoard => {
            if (!prevBoard) return savedData;
            const serverTime = new Date(savedData.updatedAt).getTime();
            const localTime = new Date(prevBoard.updatedAt).getTime();
            if (serverTime >= localTime) {
              localStorage.setItem(`couchtater_board_${boardId}`, JSON.stringify(savedData));
              return savedData;
            }
            return prevBoard;
          });
        }
      }
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
      headers: { 
        'Content-Type': 'application/json',
        'X-User-Email': currentUser?.email || '',
        'X-User-Id': currentUser?.id || ''
      },
      body: JSON.stringify(updatedBoard),
    }).catch(err => console.error("Failed to save board preferences:", err));
  };

  const handleUpdateProfileAndPreferences = (updatedUser: User, updatedPrefs: UserPreferences) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('coughtater_user', JSON.stringify(updatedUser));
    setCurrentUserPrefs(updatedPrefs);

    if (!board) return;

    // Sync shows isFavorite flag with updatedPrefs.favoriteShows
    const updatedFavSet = new Set((updatedPrefs.favoriteShows || [])
      .filter(s => typeof s === 'string')
      .map(s => normalizeShowTitle(s)));
    const updatedShows = (board.shows || []).map(show => {
      if (!show || typeof show.title !== 'string') return show;
      const isFav = updatedFavSet.has(normalizeShowTitle(show.title));
      if (show.isFavorite !== isFav) {
        return { ...show, isFavorite: isFav };
      }
      return show;
    });

    const updatedBoard: Board = {
      ...board,
      shows: updatedShows,
      owner: updatedUser,
      preferences: updatedPrefs,
      updatedAt: new Date().toISOString()
    };
    setBoard(updatedBoard);

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
        const seen = new Set<string>();
        const unique = data.filter((u: any) => u && u.id && !seen.has(u.id) && seen.add(u.id));
        setAllUsers(unique);
      }
    })
    .catch(err => console.error("Failed to save profile & preferences:", err));
  };

  // Add a new show
  const handleAddShow = (rawNewShow: TvShow) => {
    if (!board) return;

    const canonicalTitle = getCanonicalShowTitle(rawNewShow.title, board.shows);
    const newShow = { ...rawNewShow, title: canonicalTitle };

    // Progress Step 3 to Step 4 when a show is added
    if (onboardingStep === 3) {
      setOnboardingTargetShowId(newShow.id);
      setOnboardingStep(4);
      setActiveTab('active');
      setSearchFamily(false);
    }

    const exists = board.shows.some(s => isSameShowTitle(s.title, newShow.title));
    let updatedShows;
    if (exists) {
      updatedShows = board.shows.map(s => 
        isSameShowTitle(s.title, newShow.title)
          ? { 
              ...s, 
              title: canonicalTitle,
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
      setActiveTab('active');
    }

    // Onboarding Step 2: Increment episode progress on the targeted show
    if (onboardingStep === 2 && updatedShow.id === onboardingTargetShowId && prevShow) {
      const prevEp = prevShow.latestWatched?.episode || 0;
      const newEp = updatedShow.latestWatched?.episode || 0;
      const prevSeas = prevShow.latestWatched?.season || 0;
      const newSeas = updatedShow.latestWatched?.season || 0;
      if (newEp > prevEp || newSeas > prevSeas) {
        setTimeout(() => {
          setOnboardingStep(3);
        }, 1400);
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

    const showWithTimestamp: TvShow = {
      ...updatedShow,
      updatedAt: updatedShow.updatedAt || new Date().toISOString()
    };

    const updatedShows = board.shows.map(s => s.id === updatedShow.id ? showWithTimestamp : s);
    saveBoardToServer(updatedShows);
  };

  // Delete a show
  const handleDeleteShow = (id: string) => {
    if (!board) return;

    const updatedShows = board.shows.filter(s => s.id !== id);
    saveBoardToServer(updatedShows, undefined, id);
  };

  // Change board / join family board
  const handleJoinBoard = (newCode: string) => {
    setIsBuddyMenuOpen(false);

    // Synchronously set board state immediately from memory or disk cache for instant feedback
    let cachedBoard: Board | null = familyBoards[newCode] || null;
    if (!cachedBoard) {
      const localKey = `couchtater_board_${newCode}`;
      const localSaved = localStorage.getItem(localKey);
      if (localSaved) {
        try {
          const parsed = JSON.parse(localSaved);
          if (parsed && parsed.shows) {
            cachedBoard = parsed;
          }
        } catch (e) {}
      }
    }

    if (cachedBoard) {
      setBoard(cachedBoard);
    } else {
      // Create instant target board object so UI turns into Friend View immediately without lagging on previous board
      const targetUser = allUsers.find(u => u.id === newCode || (u as any).id === newCode);
      setBoard({
        id: newCode,
        name: targetUser?.name ? `${targetUser.name}'s Collection` : 'Watch Buddy Collection',
        shows: [],
        owner: targetUser || {
          id: newCode,
          name: targetUser?.name || 'Buddy',
          email: '',
          avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${newCode}`,
          createdAt: new Date().toISOString()
        },
        preferences: { genres: [], actors: [], directors: [] },
        updatedAt: new Date().toISOString()
      });
    }

    // Set tab appropriately to 'active' (Watching)
    setActiveTab('active');

    setSearchFamily(false);
    setBoardId(newCode);

    const params = new URLSearchParams(window.location.search);
    params.set('board', newCode);
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  };

  // Sync body class with theme
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    } else {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    }
  }, [theme]);

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
        localStorage.setItem(`coughtater_starter_pack_${loggedBoard.owner.id}`, 'true');
        localStorage.removeItem(`seen_queue_onboarding_${loggedBoard.owner.id}`);
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

    if (options?.showStarterPackAlert || options?.isNewAccount) {
      setActiveTab('queue');
      if (options?.showStarterPackAlert) setSortBy('rtScore');
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

  // Trigger interactive onboarding when new user visits for the first time on their own board
  useEffect(() => {
    if (currentUser && onboardingStep === null) {
      const isNewUser = isNewlyRegisteredUser;
      const hasSeen = localStorage.getItem(`seen_queue_onboarding_${currentUser.id}`) === 'true';
      if (isNewUser && !hasSeen) {
        if (!boardId || boardId === currentUser.id) {
          setActiveTab('queue');
          setOnboardingStep(1);
        }
      }
    }
  }, [currentUser, isNewlyRegisteredUser, onboardingStep, boardId]);

  // Enforce What's Next (queue) tab during Onboarding Step 1 & ensure Backlog show exists
  useEffect(() => {
    if (currentUser && board && onboardingStep === 1) {
      if (activeTab !== 'queue') {
        setActiveTab('queue');
      }
      const backlogShows = board.shows.filter(s => s.status === 'Backlog');
      if (backlogShows.length === 0 && board.shows.length > 0) {
        const targetShow = board.shows.find(s => s.title.toLowerCase().includes('severance')) || board.shows[board.shows.length - 1];
        if (targetShow) {
          const updatedShows = board.shows.map(s => s.id === targetShow.id ? { ...s, status: 'Backlog' as const } : s);
          setBoard(prev => prev ? { ...prev, shows: updatedShows } : prev);
          saveBoardToServer(updatedShows);
        }
      }
    }
  }, [currentUser, board, onboardingStep, activeTab]);

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
    
    setOnboardingTargetShowId(null);
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



  // Onboarding Step Scrolling effects
  useEffect(() => {
    if (onboardingStep === null) return;

    const safeScrollTo = (
      selector: string,
      retries = 20,
      delay = 100,
      options?: { mobileAlign?: 'top' | 'bottom' | 'center'; duration?: number; twoStage?: boolean; alignTop?: boolean; offset?: number }
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

            if (options?.alignTop) {
              const offset = options.offset !== undefined ? options.offset : 12;
              targetScrollY = absoluteElementTop - offset;
            } else if (isMobile) {
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
      case 1: {
        // Scroll target show card flush underneath top category nav
        const cardSel = onboardingTargetShowId ? `#show-card-${onboardingTargetShowId}` : '[id^="show-card-"]';
        safeScrollTo(cardSel, 15, 150, { alignTop: true, offset: 64, duration: 600 });
        break;
      }
      case 2: {
        // Scroll target show card higher up on mobile so the + button in the stepper toolbar is well above the purple bottom modal
        const cardSel = onboardingTargetShowId ? `#show-card-${onboardingTargetShowId}` : '[id^="show-card-"]';
        const isMobile = window.innerWidth < 768 || window.innerHeight < 820;
        const offset = isMobile ? -170 : 10;
        safeScrollTo(cardSel, 15, 150, { alignTop: true, offset, duration: 600 });
        break;
      }
      case 3: {
        // Always scroll to top on step 3 without scrolling down
        const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
        scrollToTop();
        setTimeout(scrollToTop, 100);
        setTimeout(scrollToTop, 350);
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
    logOutUser().catch(() => {});
    setCurrentUser(null);
    setBoard(null);
    setBoardId('default');
    setAdminImpersonator(null);
    localStorage.removeItem('coughtater_user');
    localStorage.removeItem('couchtater_user_email');
    localStorage.removeItem('coughtater_admin_impersonator');
    const params = new URLSearchParams(window.location.search);
    params.delete('board');
    window.history.replaceState({}, '', `${window.location.pathname}`);
  };

  // Handle Admin Impersonation (Option A)
  const handleImpersonateUser = (targetUser: any) => {
    if (!targetUser || !targetUser.id) return;
    
    // Remember the original admin
    let adminToSave = adminImpersonator;
    if (!adminToSave && currentUser && isUserJulio(currentUser)) {
      adminToSave = {
        id: 'default',
        name: currentUser.name || 'Julio',
        email: currentUser.email || 'julio@couchtaterz.com',
        avatarUrl: JULIO_OFFICIAL_AVATAR,
        isPro: true,
        isAdmin: true,
        createdAt: currentUser.createdAt || new Date().toISOString()
      };
      setAdminImpersonator(adminToSave);
      localStorage.setItem('coughtater_admin_impersonator', JSON.stringify(adminToSave));
    }
    
    const targetUserId = normalizeClientBoardId(targetUser.id);
    const updatedTarget: User = {
      ...targetUser,
      id: targetUserId,
      name: targetUser.name || 'Tester',
      email: targetUser.email || `${targetUserId}@taterz.com`,
      avatarUrl: targetUser.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${targetUser.name || targetUserId}`,
      createdAt: targetUser.createdAt || new Date().toISOString()
    };
    setCurrentUser(updatedTarget);
    localStorage.setItem('coughtater_user', JSON.stringify(updatedTarget));
    setBoardId(targetUserId);
  };

  const handleExitImpersonation = () => {
    const adminUser: User = adminImpersonator || {
      id: 'default',
      name: 'Julio',
      email: 'julio@couchtaterz.com',
      avatarUrl: JULIO_OFFICIAL_AVATAR,
      isPro: true,
      isAdmin: true,
      createdAt: new Date().toISOString()
    };
    
    setCurrentUser(adminUser);
    localStorage.setItem('coughtater_user', JSON.stringify(adminUser));
    localStorage.removeItem('coughtater_admin_impersonator');
    setAdminImpersonator(null);
    setBoardId('default');
  };

  // Handle delete profile and start over
  const handleDeleteProfileAndStartOver = async (password?: string) => {
    if (!currentUser) return;
    const isJulio = currentUser.id === 'default' || currentUser.id === 'user-julio' || currentUser.name?.trim().toLowerCase() === 'julio' || currentUser.email?.toLowerCase() === 'juliozaldivar@gmail.com';

    if (isJulio && password !== '3713') {
      alert("Incorrect password. Julio's profile is protected from deletion.");
      return;
    }

    try {
      await fetch(`/api/boards?id=${currentUser.id}${password ? `&password=${encodeURIComponent(password)}` : ''}`, {
        method: 'DELETE'
      });
      localStorage.removeItem(`couchtater_board_${currentUser.id}`);
      localStorage.removeItem(`coughtater_friends_${currentUser.id}`);
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
    if (!board || !notif.show) return;
    
    const exists = board.shows.some(s => isSameShowTitle(s.title, notif.show!.title));
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

  // Reply to a notification from another tater
  const handleSendReplyToNotif = async (notif: AppNotification) => {
    const replyText = (notifReplyTextMap[notif.id] || '').trim();
    if (!replyText || !currentUser) return;

    setIsSendingReplyMap(prev => ({ ...prev, [notif.id]: true }));

    // Find target user ID to send reply to
    let targetUserId = notif.senderId;
    if (!targetUserId) {
      const found = allUsers.find(u => u.name?.trim().toLowerCase() === notif.senderName?.trim().toLowerCase());
      targetUserId = found?.id || 'user-julio';
    }

    const isGuest = currentUser.id === 'guest-demo' || currentUser.id.startsWith('guest') || currentUser.email?.includes('guest');

    if (isGuest) {
      setTimeout(() => {
        setIsSendingReplyMap(prev => ({ ...prev, [notif.id]: false }));
        setReplySentSuccessMap(prev => ({ ...prev, [notif.id]: `Reply sent to ${notif.senderName}! (Demo Mode)` }));
        setTimeout(() => {
          handleDismissNotification(notif.id);
          setReplyingNotifId(null);
          setNotifReplyTextMap(prev => ({ ...prev, [notif.id]: '' }));
          setReplySentSuccessMap(prev => ({ ...prev, [notif.id]: '' }));
        }, 1200);
      }, 400);
      return;
    }

    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId,
          notification: {
            id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            senderId: currentUser.id,
            senderName: currentUser.name || 'Binge Buddy',
            senderAvatarUrl: currentUser.avatarUrl,
            message: replyText,
            createdAt: new Date().toISOString()
          }
        })
      });

      if (res.ok) {
        setIsSendingReplyMap(prev => ({ ...prev, [notif.id]: false }));
        setReplySentSuccessMap(prev => ({ ...prev, [notif.id]: `Reply sent to ${notif.senderName}!` }));
        setTimeout(() => {
          handleDismissNotification(notif.id);
          setReplyingNotifId(null);
          setNotifReplyTextMap(prev => ({ ...prev, [notif.id]: '' }));
          setReplySentSuccessMap(prev => ({ ...prev, [notif.id]: '' }));
        }, 1200);
      } else {
        throw new Error("Failed to send reply");
      }
    } catch (err) {
      console.error("Error sending reply:", err);
      setIsSendingReplyMap(prev => ({ ...prev, [notif.id]: false }));
      alert(`Failed to send reply to ${notif.senderName}. Please try again.`);
    }
  };

  // Copy show to current user's queue board
  const handleAddToMyQueue = async (friendShow: TvShow, userOverride?: User) => {
    const activeUser = userOverride || currentUser || (() => {
      try {
        const saved = localStorage.getItem('coughtater_user');
        return saved ? JSON.parse(saved) : null;
      } catch (e) { return null; }
    })();

    if (!activeUser) {
      handleRequireAuth(`Add "${friendShow.title}" to your Up Next queue`, (newUser) => {
        handleAddToMyQueue(friendShow, newUser);
      });
      return;
    }
    try {
      let myBoard: Board;
      const res = await fetch(`/api/boards?id=${activeUser.id}`);
      if (res.ok) {
        myBoard = await res.json();
      } else {
        myBoard = {
          id: activeUser.id,
          name: `${activeUser.name}'s Collection`,
          shows: [],
          owner: activeUser,
          updatedAt: new Date().toISOString()
        };
      }
      
      // Avoid duplicates by title match
      const exists = myBoard.shows.some(s => isSameShowTitle(s.title, friendShow.title));
      if (exists) {
        alert(`"${friendShow.title}" is already in your collection!`);
        return;
      }

      const clonedShow: TvShow = {
        ...friendShow,
        id: `show-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
        status: 'Backlog',
        latestWatched: { season: 1, episode: 0, title: 'Not Started' },
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
        if (boardId === currentUser.id) {
          setBoard(updatedBoard);
        }
        if (onboardingStep === 3) {
          setOnboardingTargetShowId(clonedShow.id);
          setOnboardingStep(4);
          setSearchFamily(false);
        }
      }
    } catch (err) {
      console.error("Failed to copy show to your queue:", err);
      alert("Could not copy show. Please try again.");
    }
  };

  // Compute list of connected Watch Buddies for current user
  const connectedBuddies = useMemo(() => {
    if (!currentUser) return [];
    const isCurrentUserJulio = isUserJulio(currentUser);

    return allUsers.filter(u => {
      if (isUserSelf(u, currentUser)) return false;
      if (isCurrentUserJulio && isUserJulio(u)) return false;
      return (!isCurrentUserJulio && isUserJulio(u)) || friendsState.friends.includes(u.id);
    });
  }, [allUsers, currentUser, friendsState]);

  // Compute list of shows to filter based on search scope
  const showsToSearch = useMemo(() => {
    if (!searchFamily || !board) {
      const myName = board?.owner?.name || currentUser?.name || 'My Tracker';
      return (board?.shows || []).map(s => ({ ...s, ownerName: myName, ownerNames: [myName] }));
    }

    const isCurrentUserJulio = isUserJulio(currentUser);

    const allShows: (TvShow & { ownerName: string })[] = [];
    const seenShowBoardKeys = new Set<string>();

    Object.entries(familyBoards).forEach(([bId, b]) => {
      if (b && Array.isArray(b.shows)) {
        // Exclude current user's own board from Buddy Picks
        const isMyBoard = isUserSelf(b.owner, currentUser) || bId === board.id || bId === currentUser?.id;
        if (isMyBoard) return;

        // Exclude Julio's board if current user is Julio
        const isJulioBoard = isUserJulio(b.owner) || bId === JULIO_USER_ID || bId === 'default' || bId === 'user-julio' || (b.name && b.name.toLowerCase().includes('julio'));
        if (isCurrentUserJulio && isJulioBoard) return;

        const isConnectedBuddy = friendsState.friends.includes(bId) || (b.owner?.id && friendsState.friends.includes(b.owner.id));

        if (!isJulioBoard && !isConnectedBuddy) {
          return;
        }

        const ownerName = b.owner?.name || allUsers.find(u => u.id === b.id)?.name || (isJulioBoard ? 'Julio' : b.name) || `Board ${b.id}`;
        b.shows.forEach(s => {
          const key = `${bId}-${s.id}`;
          if (!seenShowBoardKeys.has(key)) {
            seenShowBoardKeys.add(key);
            allShows.push({ ...s, ownerName });
          }
        });
      }
    });

    // Now group/consolidate shows by title (case-insensitive, normalized)
    const groupedMap = new Map<string, (TvShow & { ownerName: string })[]>();
    allShows.forEach(s => {
      const normTitle = normalizeShowTitle(s.title);
      const list = groupedMap.get(normTitle) || [];
      list.push(s);
      groupedMap.set(normTitle, list);
    });

    const consolidatedShows: any[] = [];

    groupedMap.forEach((instances) => {
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
  }, [searchFamily, familyBoards, board, currentUser, allUsers, friendsState]);

  const buddyShowsForModal = useMemo(() => {
    if (!board) return [];
    const isCurrentUserJulio = isUserJulio(currentUser);

    const list: { show: TvShow; ownerName: string }[] = [];
    const seenPerOwner = new Set<string>();

    Object.entries(familyBoards).forEach(([bId, fBoard]) => {
      if (bId === board.id) return;
      if (isUserSelf(fBoard.owner, currentUser)) return;

      const isJulioBoard = isUserJulio(fBoard.owner) || bId === JULIO_USER_ID || bId === 'default' || bId === 'user-julio' || (fBoard.name && fBoard.name.toLowerCase().includes('julio'));
      if (isCurrentUserJulio && isJulioBoard) return;

      const isConnectedBuddy = friendsState.friends.includes(bId) || (fBoard.owner?.id && friendsState.friends.includes(fBoard.owner.id));

      if (!isJulioBoard && !isConnectedBuddy) {
        return;
      }

      const owner = fBoard.owner;
      let ownerName = owner?.name;
      if (!ownerName) {
        const matchedUser = allUsers.find(u => u.id === bId || (owner?.id && u.id === owner.id));
        if (matchedUser) {
          ownerName = matchedUser.name;
        } else if (isJulioBoard) {
          ownerName = 'Julio';
        } else {
          ownerName = fBoard.name.replace(/['’]s Collection/i, '').replace(/Family Board \([^)]+\)/i, '').trim() || 'Julio';
        }
      }

      if (Array.isArray(fBoard.shows)) {
        fBoard.shows.forEach(s => {
          const normTitle = normalizeShowTitle(s.title);
          const ownerKey = `${ownerName.toLowerCase().trim()}_${normTitle}`;
          if (!seenPerOwner.has(ownerKey)) {
            seenPerOwner.add(ownerKey);
            list.push({ show: s, ownerName });
          }
        });
      }
    });

    return list;
  }, [familyBoards, board, allUsers, friendsState, currentUser]);

  if (isFeatureGuideOpen) {
    const handleCloseGuide = () => {
      setIsFeatureGuideOpen(false);
      try {
        if (window.location.pathname.startsWith('/guide') || window.location.pathname.startsWith('/help') || window.location.pathname.startsWith('/docs') || window.location.search.includes('guide=true')) {
          window.history.pushState({}, '', '/');
        }
      } catch (e) {
        // ignore
      }
    };

    return (
      <ProductGuidePage
        onBack={handleCloseGuide}
        onNavigateTo={(target) => {
          handleCloseGuide();
          handleNavigateFromGuide(target);
        }}
        onLaunchApp={handleCloseGuide}
        isLoggedIn={!!currentUser}
      />
    );
  }

  const isSharedRoute = window.location.pathname.startsWith('/list/') || window.location.pathname.startsWith('/p/') || window.location.search.includes('board=') || window.location.search.includes('list=') || boardId !== 'default';
  if (!currentUser && boardId === 'default' && !isSharedRoute) {
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

  // Compute list of unique normalized genres present in the searched shows list with 'All' at the front
  const ALL_PREFERRED_GENRES_ORDER = ['Action', 'Animation', 'Comedy', 'Drama', 'Dystopian', 'Fantasy', 'Horror', 'Mystery', 'Sci-Fi', 'Thriller', 'Western'];

  const presentNormalizedGenres = new Set<string>();
  showsToSearch.forEach(s => {
    getNormalizedGenres(s).forEach(g => presentNormalizedGenres.add(g));
  });

  const sortedGenreList = Array.from(presentNormalizedGenres).sort((a, b) => {
    const idxA = ALL_PREFERRED_GENRES_ORDER.indexOf(a);
    const idxB = ALL_PREFERRED_GENRES_ORDER.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  const allGenres = ['All', ...sortedGenreList];

  // Filter & Sort shows
  const filteredShows = showsToSearch
    .filter(s => {
      const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.actors.some(a => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            s.directors.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesService = selectedService === 'All' || s.streamingService === selectedService;
      
      const normalizedGenres = getNormalizedGenres(s);
      const matchesGenre = selectedGenre === 'All' || normalizedGenres.some(g => {
        const gLower = g.toLowerCase();
        const selLower = selectedGenre.toLowerCase();
        return gLower === selLower || gLower.includes(selLower) || selLower.includes(gLower);
      });
      
      let matchesTab = true;
      // Filter by active tab only if no query, genre, or service filter is active.
      // Selecting a Category (e.g. Horror) or Service searches across all shows in your collection regardless of tab!
      if (searchQuery.trim() === '' && selectedGenre === 'All' && selectedService === 'All') {
        if (activeTab === 'all') {
          matchesTab = true;
        } else if (activeTab === 'active') {
          matchesTab = s.status === 'Watching';
        } else if (activeTab === 'library') {
          matchesTab = s.status === 'Completed' || s.status === 'Dropped';
        } else if (activeTab === 'queue') {
          matchesTab = s.status === 'Backlog';
        }
      }

      return matchesSearch && matchesService && matchesGenre && matchesTab;
    })
    .sort((a, b) => {
      if (onboardingStep === 1 || onboardingStep === 2) {
        const targetId = onboardingTargetShowId || (board?.shows.find(s => s.status === 'Backlog')?.id);
        if (targetId) {
          if (a.id === targetId && b.id !== targetId) return -1;
          if (b.id === targetId && a.id !== targetId) return 1;
        }
      }
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
    'HBO', 'Disney+', 'Prime Video', 'Netflix', 'Hulu', 'Paramount+', 'Apple TV', 'Peacock', 'AMC+', 'Starz'
  ];

  const isFriendView = !currentUser || !!(boardId && !isUserSelf({ id: boardId }, currentUser));

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
      
      {/* Admin Impersonation Mode Bar (Option A - active during impersonation) */}
      {adminImpersonator !== null && currentUser && (
        <AdminImpersonationBar
          currentUser={currentUser}
          adminImpersonator={adminImpersonator}
          allUsers={allUsers}
          onSwitchTester={handleImpersonateUser}
          onExitTestMode={handleExitImpersonation}
          onOpenAdminModal={() => setIsAdminOpen(true)}
          theme={theme}
        />
      )}

      {/* Master Container */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 space-y-6">
        
        {!currentUser && (
          <div className="sticky top-3 z-50 bg-gradient-to-r from-purple-950/95 via-indigo-950/95 to-slate-900/95 backdrop-blur-md border border-purple-500/40 rounded-2xl p-3.5 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-purple-200">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <p className="font-extrabold text-white text-xs sm:text-sm">
                  Viewing {board?.owner?.name || board?.name || 'Shared'}'s Public Binge List
                </p>
                <p className="text-[10px] sm:text-xs text-purple-300/80">
                  Join their Binge Buddies on CouchTaterz to vote, rate, and sync watch lists!
                </p>
              </div>
            </div>
            <button
              onClick={() => handleRequireAuth('Join Binge Buddies', () => {})}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-black text-xs shadow-md transition-all cursor-pointer hover:scale-105 shrink-0"
            >
              1-Tap Sign In / Join
            </button>
          </div>
        )}
        
        {/* Top Header Group */}
        <div className="space-y-3">
          {/* Top Utility Bar (Board switcher, Collab, Member status) */}
          <div className="flex flex-row items-center justify-between gap-2 px-1 sm:px-2 text-[11px] text-slate-500 dark:text-slate-400">
            {/* Board Selector & Invite Buddy Tool on Left */}
            <div className="flex items-center gap-1.5 shrink min-w-0">
              {/* Custom Board / Watch Buddies Selector with Sticky Top Invite Action */}
              <div className="relative shrink min-w-0" ref={buddyMenuRef}>
                <button
                  onClick={() => setIsBuddyMenuOpen(!isBuddyMenuOpen)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] sm:text-[11px] font-extrabold rounded-xl px-2.5 py-1 sm:py-1.5 flex items-center gap-1.5 shadow-md border border-blue-500 transition-colors cursor-pointer max-w-[130px] xs:max-w-[190px] sm:max-w-none"
                  title="Switch TV Shows View or Invite Buddies"
                >
                  <Users className="w-3 h-3 text-white/90 shrink-0" />
                  <span className="truncate">
                    {isFriendView ? (
                      boardId === JULIO_USER_ID ? "Julio's Shows" : `${allUsers.find(u => u.id === boardId)?.name || 'Buddy'}'s Shows`
                    ) : (
                      "Binge Buddies"
                    )}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-white/80 shrink-0 transition-transform ${isBuddyMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Custom Popover Dropdown Menu with Sticky Invite Header */}
                <AnimatePresence>
                  {isBuddyMenuOpen && (
                    <motion.div
                      key="buddy-menu-popover"
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className={`absolute left-0 top-full mt-1.5 w-64 xs:w-72 max-w-[calc(100vw-2rem)] border rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col text-xs transition-colors ${
                        theme === 'dark' ? 'bg-[#141720] border-white/10 text-white' : 'bg-neutral-200 border-neutral-300 text-neutral-950'
                      }`}
                    >
                      {/* Sticky Top Header: Invite & Add Buddy Action */}
                      <div className={`p-2 border-b sticky top-0 z-10 shadow-sm ${
                        theme === 'dark' ? 'bg-[#1B1F2C] border-white/10' : 'bg-neutral-300 border-neutral-300'
                      }`}>
                        <button
                          onClick={() => {
                            setIsBuddyMenuOpen(false);
                            setIsShareOpen(true);
                          }}
                          className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-purple-950/50 border border-purple-400/30 active:scale-[0.98]"
                        >
                          <UserPlus className="w-3.5 h-3.5 text-purple-200" />
                          <span>+ Add & Manage Buddies</span>
                        </button>
                      </div>

                      {/* Scrollable List of Boards / Buddies */}
                      <div className="max-h-60 overflow-y-auto p-1.5 space-y-1 scrollbar-thin">
                        {currentUser && (
                          <button
                            onClick={() => {
                              handleJoinBoard(currentUser.id);
                              setIsBuddyMenuOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center justify-between cursor-pointer ${
                              !isFriendView
                                ? theme === 'dark'
                                  ? 'bg-blue-600/20 text-blue-300 font-extrabold border border-blue-500/30'
                                  : 'bg-blue-100 text-blue-950 font-extrabold border border-blue-300 shadow-2xs'
                                : theme === 'dark'
                                  ? 'hover:bg-white/5 text-slate-300'
                                  : 'hover:bg-neutral-300 text-neutral-900 font-bold'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <div className="relative shrink-0">
                                <img
                                  src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${currentUser.name}`}
                                  alt={currentUser.name}
                                  className={`w-4 h-4 rounded-full border shrink-0 object-cover ${theme === 'dark' ? 'border-blue-500/30' : 'border-blue-500'}`}
                                />
                                <span
                                  className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-[#141720] absolute -bottom-0.5 -right-0.5 shadow-[0_0_4px_rgba(16,185,129,0.9)]"
                                  title="Active now (Logged in)"
                                />
                              </div>
                              <span className="truncate">My TV Shows</span>
                            </div>
                            {!isFriendView && <Check className={`w-3.5 h-3.5 shrink-0 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`} />}
                          </button>
                        )}

                        {/* Section Header */}
                        <div className={`px-2 pt-2.5 pb-1 flex items-center justify-between text-[10px] uppercase tracking-wider font-black border-t mt-1 ${
                          theme === 'dark' ? 'text-slate-400 border-white/5' : 'text-neutral-900 border-neutral-300'
                        }`}>
                          <span className="flex items-center gap-1.5">
                            <Users className={`w-3 h-3 shrink-0 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-700'}`} />
                            Binge Buddies
                          </span>
                          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black shrink-0 ${
                            theme === 'dark' ? 'bg-purple-500/15 text-purple-300 border-purple-500/20' : 'bg-purple-200 text-purple-950 border-purple-300'
                          }`}>
                            {connectedBuddies.length}
                          </span>
                        </div>

                        {/* List of Buddies */}
                        {connectedBuddies.map((u, idx) => {
                          const isSelected = isFriendView && boardId === u.id;
                          const isJulio = u.id === JULIO_USER_ID || u.id === 'default' || u.id === 'user-julio';
                          const isOnline = isUserSelf(u, currentUser) || (u as any).isOnline === true;
                            return (
                              <button
                                key={`${u.id}-${idx}`}
                                onClick={() => {
                                  handleJoinBoard(u.id);
                                  setIsBuddyMenuOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center justify-between cursor-pointer ${
                                  isSelected
                                    ? theme === 'dark'
                                      ? 'bg-purple-600/20 text-purple-300 font-extrabold border border-purple-500/30'
                                      : 'bg-purple-100 text-purple-950 font-extrabold border border-purple-300 shadow-2xs'
                                    : theme === 'dark'
                                      ? 'hover:bg-white/5 text-slate-300 font-medium'
                                      : 'hover:bg-neutral-300 text-neutral-900 font-bold'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <div className="relative shrink-0">
                                    <img
                                      src={u.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${u.name}`}
                                      alt={u.name}
                                      className={`w-4 h-4 rounded-full border shrink-0 object-cover ${theme === 'dark' ? 'border-white/10' : 'border-neutral-400'}`}
                                    />
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full absolute -bottom-0.5 -right-0.5 ${
                                        isOnline
                                          ? 'bg-emerald-500 ring-1 ring-[#141720] shadow-[0_0_4px_rgba(16,185,129,0.9)]'
                                          : 'bg-slate-400 ring-1 ring-white'
                                      }`}
                                      title={isOnline ? "Active now" : "Offline"}
                                    />
                                  </div>
                                  <span className="truncate">
                                    {isJulio ? "Julio's Shows" : `${u.name}'s Shows`}
                                  </span>
                                  {isJulio && (
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                                      theme === 'dark'
                                        ? 'bg-purple-500/20 text-purple-300'
                                        : 'bg-purple-200 text-purple-950 border border-purple-300'
                                    }`}>
                                      Host
                                    </span>
                                  )}
                                </div>
                                {isSelected && <Check className={`w-3.5 h-3.5 shrink-0 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-700'}`} />}
                              </button>
                            );
                          })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Active Session info on Right */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 ml-auto shrink-0">
              {currentUser ? (
                <>
                  <button
                    onClick={() => setIsPreferencesOpen(true)}
                    className="flex items-center gap-1.5 cursor-pointer hover:opacity-85 active:scale-98 transition-all group"
                    title="View & Edit Preferences / Profile (Online)"
                  >
                    <div className="relative shrink-0">
                      <img
                        src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${currentUser.name}`}
                        alt={currentUser.name}
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-blue-500/30 group-hover:border-blue-400 transition-colors object-cover shrink-0"
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-[#0F1115] absolute -bottom-0.5 -right-0.5 shadow-[0_0_4px_rgba(16,185,129,0.9)]"
                        title="Active now (Logged in)"
                      />
                    </div>
                    <span className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors max-w-[100px] sm:max-w-none truncate">{currentUser.name}</span>
                  </button>

                  {/* CouchTaterz Manual / Product Guide Trigger */}
                  <button
                    onClick={() => setIsFeatureGuideOpen(true)}
                    className="p-1 sm:p-1.5 rounded-xl hover:bg-white/5 dark:hover:bg-white/10 text-slate-400 hover:text-blue-400 transition-all cursor-pointer shrink-0 flex items-center justify-center border border-transparent hover:border-blue-500/30"
                    title="CouchTaterz User Guide & Feature Manual"
                  >
                    <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>

                  <span className="text-slate-300 dark:text-slate-800">|</span>

                  <button
                    onClick={handleLogout}
                    className="hover:text-rose-500 font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                    title="Sign Out of CouchTaterz"
                  >
                    <LogOut className="w-3 h-3" />
                    <span className="hidden sm:inline">Sign Out</span>
                    <span className="sm:hidden">Out</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsFeatureGuideOpen(true)}
                    className="p-1 sm:p-1.5 rounded-xl text-slate-400 hover:text-blue-400 transition-all cursor-pointer shrink-0 flex items-center justify-center"
                    title="CouchTaterz User Guide & Feature Manual"
                  >
                    <BookOpen className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      window.location.href = '/';
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
                    title="Sign in to CouchTaterz"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Navigation / Header */}
          <header className={`flex flex-row items-center justify-between gap-4 p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border transition-all ${
            theme === 'dark' ? 'bg-[#1A1D23] border-white/5' : 'bg-white border-neutral-200/80 shadow-sm'
          }`}>
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center shadow-md shadow-blue-600/25 text-white shrink-0">
                <Tv className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-base sm:text-lg font-black tracking-tight uppercase leading-none">
                  <span className="text-blue-500">COUCH</span>
                  <span className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>TATERZ</span>
                </h1>
                <p className="text-[9.5px] sm:text-[10.5px] font-extrabold tracking-[0.2em] text-slate-400 uppercase mt-1 leading-none whitespace-nowrap">
                  YOUR BINGE BUDDY
                </p>
              </div>
            </div>

            {/* Core Tools Panel */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* User Admin Trigger - Shield Only (No Text) */}
              {isUserJulio(currentUser) && (
                <button
                  onClick={() => setIsAdminOpen(true)}
                  className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer shadow-md ${
                    theme === 'dark'
                      ? 'bg-gradient-to-br from-indigo-500/25 via-purple-600/30 to-violet-700/30 border-purple-400/50 text-purple-300 hover:text-white hover:border-purple-300 hover:shadow-purple-500/25'
                      : 'bg-gradient-to-br from-indigo-500 via-purple-600 to-violet-700 border-purple-400 text-white hover:opacity-90 shadow-purple-500/30'
                  }`}
                  title="Central User Administration & Community Insights Dashboard"
                >
                  <Shield className="w-4 h-4 text-purple-300 dark:text-purple-200" />
                </button>
              )}

              {/* Toggle Theme */}
              <button
                onClick={toggleTheme}
                className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border transition hover:scale-105 cursor-pointer ${
                  theme === 'dark' 
                    ? 'bg-[#262A33] border-white/5 text-slate-400 hover:bg-[#1A1D23] hover:text-slate-300' 
                    : 'bg-neutral-100 border-neutral-200 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-800'
                }`}
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-slate-300" /> : <Moon className="w-4 h-4 text-neutral-600" />}
              </button>

              {/* View Calendar Trigger */}
              <button
                onClick={() => setIsCalendarOpen(true)}
                className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border transition hover:scale-105 cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-[#262A33] border-white/5 text-blue-400 hover:bg-[#1C2028]'
                    : 'bg-neutral-100 border-neutral-200 text-blue-600 hover:bg-neutral-200'
                }`}
                title="View Calendar of Airing Episodes"
              >
                <CalendarIcon className="w-4 h-4" />
              </button>

              {/* Add Show Trigger - Desktop */}
              {!isFriendView && (
                <button
                  id="add-show-button-desktop"
                  onClick={() => {
                    setAddModalInitialTab('search');
                    setIsAddOpen(true);
                  }}
                  className={`hidden sm:flex px-4 py-2.5 rounded-2xl font-bold text-xs items-center justify-center gap-1.5 transition hover:scale-[1.02] cursor-pointer ${
                    onboardingStep === 3
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

          {/* Mobile-only Action Button (Next Row) */}
          {!isFriendView && (
            <div className="flex sm:hidden w-full gap-2 mt-2">
              <button
                id="add-show-button-mobile"
                onClick={() => {
                  setAddModalInitialTab('search');
                  setIsAddOpen(true);
                }}
                className={`w-full px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer ${
                  onboardingStep === 3
                    ? 'ring-4 ring-purple-400 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-purple-500/40 relative z-50 animate-pulse border border-purple-400'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-950/20 border border-blue-500/25'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Show</span>
              </button>
            </div>
          )}
        </div>

        {/* Friend View Banner */}
        {isFriendView && currentUser && (
          <div className={`sticky top-0 z-40 py-2 -mx-4 px-4 md:-mx-8 md:px-8 transition-colors duration-300 ${
            theme === 'dark' ? 'bg-[#0F1115]' : 'bg-neutral-50'
          }`}>
            <div className={`rounded-3xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between shadow-lg transition-all duration-300 ${
              isScrolled 
                ? 'p-3 gap-2.5 text-[11px] sm:text-xs' 
                : 'p-4 gap-4 text-xs'
            } ${
              theme === 'dark' 
                ? 'bg-gradient-to-r from-purple-950/90 via-purple-900/75 to-[#14161C]/95 border-purple-500/30 shadow-purple-950/30' 
                : 'bg-purple-50 border-purple-200/80'
            }`}>
              <div className="flex items-center gap-3 text-left">
                <div className={`shrink-0 transition-all duration-300 ${
                  isScrolled ? 'p-1.5 rounded-lg' : 'p-2 rounded-xl'
                } ${
                  theme === 'dark' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-purple-100 text-purple-700'
                }`}>
                  <Users className={isScrolled ? "w-4 h-4" : "w-5 h-5"} />
                </div>
                <div>
                  <p className={`font-bold leading-snug ${theme === 'dark' ? 'text-purple-200' : 'text-purple-950'}`}>
                    Viewing Binge Buddy's Collection ({board?.owner?.name || allUsers.find(u => u.id === boardId)?.name || 'Buddy'})
                  </p>
                  <p className={`mt-0.5 transition-all duration-300 ${theme === 'dark' ? 'text-slate-400' : 'text-purple-800/80'} hidden sm:block`}>
                    You can copy any show from this board to your personal Up Next area by clicking "Add to Up Next".
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleJoinBoard(currentUser.id)}
                className={`w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white font-extrabold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0 shadow-sm ${
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
              className={`text-[10px] font-bold rounded px-2.5 py-1 transition flex items-center gap-1 cursor-pointer border ${
                theme === 'dark'
                  ? 'bg-[#1A1D23] hover:bg-[#262A33] text-slate-400 hover:text-white border-white/5'
                  : 'bg-slate-300 hover:bg-slate-400 text-[#1A1D23] hover:text-black border-slate-400 shadow-2xs'
              }`}
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
                  key="workflow-guide-panel"
                  initial={{ opacity: 0, y: -15, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -15, height: 0 }}
                  className={`relative overflow-hidden p-5 rounded-3xl border shadow-xl transition-colors duration-200 ${
                    theme === 'dark'
                      ? 'border-blue-500/15 bg-[#171B24] text-slate-200'
                      : 'border-blue-200 bg-white text-neutral-800 shadow-sm'
                  }`}
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
                          Track and route your shows instantly across three streamlined pipelines using the <span className="hidden sm:inline"><strong className="text-white">STATUS</strong> </span>controls located on any Show Card:
                        </p>
                        
                        {/* Visual inline representation of the status switch */}
                        <div className="mt-2.5 flex items-center gap-2 bg-[#0F1115]/40 border border-white/5 rounded-xl px-2.5 sm:px-3 py-1.5 w-fit max-w-full">
                          <span className="hidden sm:inline-block text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">STATUS:</span>
                          <div className="inline-flex gap-0.5 bg-[#15171C] p-0.5 rounded-lg border border-white/5 shadow-inner shrink-0">
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

                      <div className="pt-1 border-t border-white/5">
                        <div className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                          <span className="text-orange-400">💡 Pro-Tip:</span> Move shows instantly between pipelines using the Status controls on any Show Card!
                        </div>
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
                {canScrollServiceRight && (
                  <span className="sm:hidden text-[8px] font-black uppercase tracking-widest text-slate-500/80 animate-pulse">Swipe for more →</span>
                )}
              </div>
              
              <div className="relative w-full">
                {/* Left gradient mask overlay - visible only when there is content scrolled off to the left */}
                {canScrollServiceLeft && (
                  <div className={`absolute left-0 top-0 bottom-1.5 w-6 pointer-events-none z-10 bg-gradient-to-r transition-opacity duration-300 ${
                    theme === 'dark' ? 'from-[#0F1115] to-transparent' : 'from-neutral-50 to-transparent'
                  }`} />
                )}

                {/* Right gradient mask overlay - visible only when there is content beyond view on the right */}
                {canScrollServiceRight && (
                  <div className={`absolute right-0 top-0 bottom-1.5 w-8 pointer-events-none z-10 bg-gradient-to-l transition-opacity duration-300 ${
                    theme === 'dark' ? 'from-[#0F1115] to-transparent' : 'from-neutral-50 to-transparent'
                  }`} />
                )}

                <div 
                  ref={serviceRibbonRef}
                  onScroll={checkServiceScroll}
                  className="flex items-center gap-1.5 overflow-x-auto pb-1.5 px-1 scrollbar-none snap-x"
                >
                  <button
                    onClick={() => setSelectedService('All')}
                    className={`px-2.5 py-1 rounded-lg font-extrabold text-[10px] uppercase tracking-wide border shrink-0 snap-start transition-all duration-200 cursor-pointer ${
                      selectedService === 'All'
                        ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                        : theme === 'dark' 
                          ? 'bg-[#1A1D23] border-white/10 text-slate-300 hover:text-white hover:bg-[#262A33]' 
                          : 'bg-white border-neutral-300 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 shadow-2xs'
                    }`}
                  >
                    All Services
                  </button>
                  {activeStreamingServices.map((service, srvIdx) => {
                    const isActive = selectedService === service;
                    const count = board.shows.filter(s => s.streamingService === service).length;
                    return (
                      <button
                        key={`srv-filter-${service}-${srvIdx}`}
                        onClick={() => setSelectedService(service)}
                        className={`px-2.5 py-1 rounded-lg font-extrabold text-[10px] uppercase tracking-wide border shrink-0 snap-start transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                          isActive
                             ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                            : theme === 'dark'
                              ? 'bg-[#1A1D23] border-white/10 text-slate-300 hover:text-white hover:bg-[#262A33]'
                              : 'bg-white border-neutral-300 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 shadow-2xs'
                        }`}
                      >
                        <span>{service}</span>
                        {count > 0 && (
                          <span className={`text-[9px] font-black rounded-md px-1.5 py-0.2 transition-colors ${
                            isActive 
                              ? 'bg-black/30 text-white border border-white/20' 
                              : theme === 'dark'
                                ? 'bg-slate-800 text-slate-100 border border-slate-700'
                                : 'bg-neutral-200 text-neutral-900 border border-neutral-300'
                          }`}>
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
              className={`p-1 rounded-3xl border transition-colors duration-150 flex items-center gap-1 w-full overflow-x-auto sm:overflow-x-visible scrollbar-none snap-x scroll-smooth ${
              searchFamily ? 'relative' : (onboardingStep === 1 || onboardingStep === 2 ? 'sticky top-3 z-50' : 'sticky top-3 z-30')
            } ${
              onboardingStep === 1 || onboardingStep === 2
                ? (activeTab === 'active' 
                    ? 'border-blue-500 ring-2 ring-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)] '
                    : 'border-amber-500 ring-2 ring-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.3)] ') + (theme === 'dark' ? 'bg-[#1A1D23]' : 'bg-white')
                : searchFamily || activeTab === 'all'
                ? theme === 'dark' ? 'bg-[#1A1D23] border-purple-500/30 shadow-[0_4px_20px_-4px_rgba(168,85,247,0.15)]' : 'bg-white border-purple-200 shadow-sm'
                : activeTab === 'active'
                ? theme === 'dark' ? 'bg-[#1A1D23] border-blue-500/30 shadow-[0_4px_20px_-4px_rgba(37,99,235,0.15)]' : 'bg-white border-blue-200 shadow-sm'
                : activeTab === 'queue'
                ? theme === 'dark' ? 'bg-[#1A1D23] border-amber-500/30 shadow-[0_4px_20px_-4px_rgba(217,119,6,0.15)]' : 'bg-white border-amber-200 shadow-sm'
                : theme === 'dark' ? 'bg-[#1A1D23] border-emerald-500/30 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.15)]' : 'bg-white border-emerald-200 shadow-sm'
            }`}>
              {(() => {
                const tabSourceShows = searchFamily ? showsToSearch : board.shows;
                const mainWorkflowTabs = [
                  { id: 'active', label: 'Watching', icon: <Tv className="w-3.5 h-3.5 shrink-0" />, count: tabSourceShows.filter(s => s.status === 'Watching').length },
                  { id: 'queue', label: 'Up Next', icon: <Clock className="w-3.5 h-3.5 shrink-0" />, count: tabSourceShows.filter(s => s.status === 'Backlog').length },
                  { id: 'library', label: 'Watched', icon: <Archive className="w-3.5 h-3.5 shrink-0" />, count: tabSourceShows.filter(s => s.status === 'Completed' || s.status === 'Dropped').length }
                ] as { id: 'active' | 'queue' | 'library'; label: string; icon: React.ReactNode; count: number }[];

                return (
                  <>
                    {/* The 3 main workflow tabs (Core Action Pipeline) - flex-1 min-w-0 to stay perfectly sized within viewport */}
                    <div className="flex-1 min-w-0 grid grid-cols-3 gap-1 shrink-0">
                      {mainWorkflowTabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        const isWatchingOnboardingHighlight = onboardingStep === 2 && tab.id === 'active';
                        return (
                          <button
                            key={tab.id}
                            onClick={() => {
                              if (activeTab === tab.id) {
                                const sectionLabel = document.getElementById('backlog-queue-area');
                                if (sectionLabel) {
                                  sectionLabel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                } else {
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }
                              } else {
                                setActiveTab(tab.id);
                              }
                            }}
                            className={`relative py-2 sm:py-3 px-1 rounded-2xl text-[10px] sm:text-[11px] font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1 sm:gap-2 z-10 whitespace-nowrap ${
                              isWatchingOnboardingHighlight 
                                ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-[#1A1D23]' 
                                : ''
                            } ${
                              isActive
                                ? searchFamily
                                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/20'
                                  : tab.id === 'active' 
                                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/20' 
                                  : tab.id === 'library'
                                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/20'
                                  : 'bg-amber-600 text-white shadow-lg shadow-amber-950/20'
                                : theme === 'dark'
                                  ? 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                  : 'bg-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                            }`}
                          >
                            <span className={`flex items-center gap-1 sm:gap-1.5 whitespace-nowrap ${
                              isActive 
                                ? 'text-white font-extrabold' 
                                : theme === 'dark'
                                  ? 'text-slate-400 hover:text-slate-200'
                                  : 'text-neutral-600 hover:text-neutral-900'
                            }`}>
                              <span className="hidden sm:inline-flex">{tab.icon}</span>
                              <span className="hidden sm:inline">{tab.label}</span>
                              <span className="sm:hidden">{tab.id === 'active' ? 'Watching' : tab.id === 'library' ? 'Watched' : 'Up Next'}</span>
                            </span>
                            <span className={`px-1.5 py-0.5 text-[9px] rounded-full font-black shrink-0 transition-colors duration-300 ${
                              isActive 
                                ? 'bg-black/25 text-white border border-white/20 shadow-2xs' 
                                : searchFamily
                                  ? (theme === 'dark' ? 'bg-purple-950/60 text-purple-200 border border-purple-500/30' : 'bg-purple-100 text-purple-900 border border-purple-300')
                                  : (theme === 'dark' ? 'bg-slate-800 text-slate-100 border border-slate-700' : 'bg-neutral-200 text-neutral-900 border border-neutral-300')
                            }`}>
                              {tab.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Deemphasized separation: elegant vertical divider line */}
                    <div className="hidden sm:block w-px h-5 bg-white/10 shrink-0 self-center mx-1" />

                    {/* "All" utility tab - hidden on tight mobile displays to maximize the main categories */}
                    <button
                      onClick={() => {
                        if (activeTab === 'all') {
                          const sectionLabel = document.getElementById('backlog-queue-area');
                          if (sectionLabel) {
                            sectionLabel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          } else {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        } else {
                          setActiveTab('all');
                        }
                      }}
                      className={`relative py-2 px-3 sm:px-4 rounded-xl text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer hidden sm:flex items-center justify-center gap-1.5 z-10 border shrink-0 ${
                        activeTab === 'all'
                          ? theme === 'dark' ? 'bg-[#1F232D] border-white/10 text-slate-200 shadow-md' : 'bg-neutral-100 border-neutral-300 text-neutral-900 shadow-sm'
                          : theme === 'dark' ? 'bg-transparent border-transparent text-slate-500 hover:text-slate-300' : 'bg-transparent border-transparent text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      <Compass className={`w-3.5 h-3.5 shrink-0 hidden sm:block ${activeTab === 'all' ? 'text-purple-400 animate-[spin_8s_linear_infinite]' : 'text-slate-600'}`} />
                      <span className={`${activeTab === 'all' ? 'font-black' : 'font-medium'}`}>All</span>
                      <span className={`px-1 py-0.5 text-[8px] rounded-md font-extrabold transition-colors duration-300 ${
                        activeTab === 'all' 
                          ? 'bg-black/25 text-white border border-white/20' 
                          : (theme === 'dark' ? 'bg-slate-800 text-slate-100 border border-slate-700' : 'bg-neutral-200 text-neutral-900 border border-neutral-300')
                      }`}>
                        {tabSourceShows.length}
                      </span>
                    </button>
                  </>
                );
              })()}
            </div>

             {/* Filter controls & Search bar */}
            <div ref={searchBarRef} className={`p-4 rounded-3xl border space-y-3 transition-all duration-500 ${
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
              {/* Search Scope Toggle (High Clarity & Responsive) */}
              {!isFriendView && (
                <div 
                  id="scope-tabs-container"
                  className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium px-1 pb-1 select-none"
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-700'
                    }`}>Scope:</span>
                    <div className={`inline-flex items-center p-0.5 rounded-xl border shadow-inner ${
                      theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-slate-200/90 border-slate-300'
                    }`}>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchFamily(false);
                          if (activeTab === 'all') {
                            setActiveTab('active');
                          }
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                          !searchFamily 
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30' 
                            : theme === 'dark'
                              ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                              : 'text-slate-700 hover:text-slate-950 hover:bg-white/70'
                        }`}
                      >
                        <UserIcon className="w-3.5 h-3.5" />
                        <span>My Shows</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSearchFamily(true);
                          setActiveTab('all');
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                          searchFamily 
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30' 
                            : theme === 'dark'
                              ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                              : 'text-slate-700 hover:text-slate-950 hover:bg-white/70'
                        } ${
                          onboardingStep === 3 && !searchFamily
                            ? 'ring-2 ring-purple-400 bg-[#581c87] text-white animate-pulse border border-purple-500 relative z-50'
                            : ''
                        }`}
                      >
                        <Users className={`w-3.5 h-3.5 ${searchFamily ? 'text-white' : 'text-purple-500 dark:text-purple-400'}`} />
                        <span>Buddy Picks</span>
                      </button>
                    </div>
                    {searchFamily && isLoadingFamilyBoards && (
                      <span className={`animate-pulse text-[10px] font-semibold ml-1 ${
                        theme === 'dark' ? 'text-purple-300' : 'text-purple-700'
                      }`}>
                        Syncing...
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search query input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search across ${
                      searchFamily
                        ? 'Buddy Picks'
                        : isFriendView
                          ? (boardId === JULIO_USER_ID ? "Julio's Shows" : `${allUsers.find(u => u.id === boardId)?.name || 'Buddy'}'s Shows`)
                          : 'My Shows'
                    }...`}
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
                  {!searchQuery && (
                    <kbd className="hidden md:inline-block absolute right-3.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] text-slate-500 bg-white/5 rounded border border-white/10 font-mono pointer-events-none">
                      ⌘K
                    </kbd>
                  )}
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
                <div className="flex gap-2 min-w-[140px] sm:min-w-0">
                  {/* Sort By Dropdown Selector */}
                  <div className="relative flex-1 sm:w-auto sm:min-w-[140px]">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className={`w-full border text-xs font-semibold rounded-2xl px-3.5 py-3 appearance-none cursor-pointer pr-8 ${
                        theme === 'dark' 
                          ? 'bg-[#262A33] border-white/10 text-slate-200 hover:border-white/20' 
                          : 'bg-neutral-100 border-neutral-200 text-neutral-700'
                      }`}
                    >
                      <option value="airingNext">Airing Next</option>
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

                  {/* Mobile-Only Category Filter Dropdown (shown on small screens for easy tap navigation) */}
                  <div className="relative flex-1 sm:hidden">
                    <select
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                      className={`w-full border text-xs font-semibold rounded-2xl px-3.5 py-3 appearance-none cursor-pointer pr-8 transition-all ${
                        selectedGenre !== 'All'
                          ? 'bg-blue-600/25 border-blue-500 text-blue-200 font-bold ring-1 ring-blue-500/40'
                          : theme === 'dark' 
                            ? 'bg-[#262A33] border-white/10 text-slate-200 hover:border-white/20' 
                            : 'bg-neutral-100 border-neutral-200 text-neutral-700'
                      }`}
                    >
                      <option value="All" className={theme === 'dark' ? 'bg-[#1A1D23] text-slate-100' : 'bg-white text-neutral-800'}>
                        All Categories
                      </option>
                      {allGenres.filter(g => g !== 'All').map((g, gOptIdx) => (
                        <option key={`genre-opt-${g}-${gOptIdx}`} value={g} className={theme === 'dark' ? 'bg-[#1A1D23] text-slate-100' : 'bg-white text-neutral-800'}>{g}</option>
                      ))}
                    </select>
                    <div className={`pointer-events-none absolute inset-y-0 right-3 flex items-center ${
                      selectedGenre !== 'All' ? 'text-blue-400 font-bold' : 'text-slate-500'
                    }`}>
                      <Filter className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop/Tablet Quick Category Chips Ribbon (shown on sm: screens for 1-click filtering) */}
              {allGenres.length > 1 && (
                <div className="pt-1 pb-0.5 hidden sm:block">
                  <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 shrink-0 mr-1">Categories:</span>
                    {allGenres.map((genre, gChipIdx) => {
                      const isSelected = selectedGenre === genre;
                      return (
                        <button
                          key={`genre-chip-${genre}-${gChipIdx}`}
                          type="button"
                          onClick={() => setSelectedGenre(genre)}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wide transition-all duration-150 cursor-pointer shrink-0 border ${
                            isSelected
                              ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-950/40 scale-105'
                              : theme === 'dark'
                                ? 'bg-[#222630] border-white/5 text-slate-400 hover:text-white hover:bg-[#2C313E] hover:border-white/10'
                                : 'bg-neutral-100 border-neutral-200 text-neutral-600 hover:bg-neutral-200'
                          }`}
                        >
                          {genre === 'All' ? 'All Categories' : genre}
                        </button>
                      );
                    })}
                  </div>
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
            <div id="backlog-queue-area" className="scroll-mt-20 sm:scroll-mt-24 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 py-1 bg-transparent rounded-2xl border border-transparent select-none transition-all duration-500">
              <div className="flex items-start sm:items-center gap-3">
                <div className={`w-1 h-7 rounded-full transition-all duration-500 shrink-0 mt-0.5 sm:mt-0 ${
                  activeTab === 'all'
                    ? 'bg-purple-500 shadow-[0_0_12px_rgba(147,51,234,0.6)]'
                    : activeTab === 'active' 
                    ? 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]' 
                    : activeTab === 'library'
                    ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]'
                    : 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                }`} />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
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
                  </div>

                  {/* Category Filter Status & Count Line above description */}
                  <div className={`flex items-center gap-1.5 mt-0.5 text-[11px] font-semibold flex-wrap ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}>
                    <span>
                      {(() => {
                        const scopeName = searchFamily
                          ? 'Buddy Picks'
                          : isFriendView
                            ? (boardId === JULIO_USER_ID ? "Julio's Shows" : `${allUsers.find(u => u.id === boardId)?.name || 'Buddy'}'s Shows`)
                            : 'My Shows';
                        const statusName = searchQuery.trim() !== ''
                          ? ''
                          : activeTab === 'all'
                            ? 'All Shows'
                            : activeTab === 'active'
                              ? 'Watching'
                              : activeTab === 'library'
                                ? 'Watched'
                                : 'Up Next';
                        
                        const statusAndScope = statusName ? `${statusName} (${scopeName})` : scopeName;

                        return selectedGenre !== 'All' 
                          ? `${selectedGenre} in ${statusAndScope}`
                          : `All Categories in ${statusAndScope}`;
                      })()}
                    </span>
                    {selectedService !== 'All' && (
                      <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}>({selectedService})</span>
                    )}
                    <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-400'}>•</span>
                    <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>{filteredShows.length} {filteredShows.length === 1 ? 'show' : 'shows'}</span>
                  </div>

                  <p className={`text-[10px] mt-2 font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    {searchQuery.trim() !== '' 
                      ? `Searching across all shows for "${searchQuery}".`
                      : activeTab === 'all' ? 'An all-inclusive overview of every single show tracked on this board.'
                      : activeTab === 'active' ? 'Real-time tracking of current seasons, release timers, and episode recaps.'
                      : activeTab === 'library' ? 'A curated sanctuary for library series and completed shows.'
                      : 'Shows scheduled for later. Switch status to move shows to Watching.'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                {activeTab === 'active' && (
                  <button
                    onClick={() => setIsCalendarOpen(true)}
                    className="px-3 py-1.5 text-[10px] font-black rounded-xl bg-blue-600 hover:bg-blue-500 text-white border border-blue-500/80 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <CalendarIcon className="w-3.5 h-3.5 text-white" />
                    <span>Interactive Calendar View</span>
                  </button>
                )}

                {/* Desktop AI Sidebar Toggle Button when closed */}
                {!isAiSidebarOpen && (
                  <button
                    onClick={handleOpenTaterzAiGeneral}
                    className={`hidden md:flex px-3 py-1.5 text-[10px] font-black border rounded-xl transition items-center gap-1.5 cursor-pointer shadow-sm ${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-amber-500/15 to-yellow-500/15 hover:from-amber-500/25 hover:to-yellow-500/25 text-amber-300 border-amber-500/25 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                        : 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500/80 shadow-md shadow-amber-500/20'
                    }`}
                    title="Ask Spudz"
                  >
                    <Bot className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-amber-400' : 'text-white'}`} />
                    <span>Ask Spudz</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tater Recommendations, Alerts & Direct Messages */}
            <AnimatePresence>
              {activeNotifications.length > 0 && (
                <div className="space-y-4 mb-6">
                  {activeNotifications.map((notif, nIdx) => {
                    const isSystemAlert = notif.senderId === 'system-alerts' || notif.type === 'alert' || (notif.senderName && notif.senderName.toLowerCase().includes('alert'));
                    const isShowRec = !isSystemAlert && !!notif.show;
                    return (
                      <motion.div
                        key={notif.id ? `notif-${notif.id}-${nIdx}` : `notif-idx-${nIdx}`}
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                        className="overflow-hidden"
                      >
                        <div className={`p-4 sm:p-5 border rounded-2xl relative overflow-hidden transition-all shadow-md ${
                          isSystemAlert
                            ? (theme === 'dark'
                                ? 'bg-[#151922] border-sky-500/30 shadow-sky-950/10'
                                : 'bg-sky-50/90 border-sky-200 shadow-sky-100/50')
                            : isShowRec
                            ? (theme === 'dark'
                                ? 'bg-[#1A1D23] border-amber-500/25 shadow-amber-950/5'
                                : 'bg-white border-amber-200 shadow-amber-100/50')
                            : (theme === 'dark'
                                ? 'bg-[#181524] border-purple-500/30 shadow-purple-950/10'
                                : 'bg-purple-50/80 border-purple-200 shadow-purple-100/50')
                        }`}>
                          {/* Tint Overlay */}
                          <div className={`absolute inset-0 pointer-events-none z-0 bg-gradient-to-r ${
                            isSystemAlert
                              ? (theme === 'dark'
                                  ? 'from-sky-500/10 via-sky-500/5 to-transparent'
                                  : 'from-sky-100/60 to-transparent')
                              : isShowRec
                              ? (theme === 'dark'
                                  ? 'from-amber-500/10 via-amber-500/5 to-transparent'
                                  : 'from-amber-50 to-transparent')
                              : (theme === 'dark'
                                  ? 'from-purple-500/15 via-purple-500/5 to-transparent'
                                  : 'from-purple-100/50 to-transparent')
                          }`} />

                          {/* Show Banner Image Layer fading in from right (only for show recommendations or alerts with show) */}
                          {notif.show && (
                            <div className="absolute right-0 top-0 bottom-0 w-2/5 sm:w-1/2 pointer-events-none overflow-hidden z-0">
                              <img
                                src={getShowBannerImage(notif.show)}
                                alt={notif.show.title || 'Show'}
                                className="w-full h-full object-cover opacity-25 md:opacity-35 transition-opacity"
                                referrerPolicy="no-referrer"
                              />
                              <div className={`absolute inset-0 bg-gradient-to-r ${
                                theme === 'dark'
                                  ? (isSystemAlert ? 'from-[#151922] via-[#151922]/50 to-transparent' : 'from-[#1A1D23] via-[#1A1D23]/40 to-transparent')
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
                            {isSystemAlert ? (
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                                theme === 'dark' 
                                  ? 'bg-sky-500/20 text-sky-400 border-sky-500/40 shadow-sm shadow-sky-950/40' 
                                  : 'bg-sky-100 text-sky-600 border-sky-300 shadow-sm'
                              }`}>
                                <Bell className="w-5 h-5 animate-pulse" />
                              </div>
                            ) : (
                              <img
                                src={notif.senderAvatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(notif.senderName || 'Buddy')}`}
                                alt={notif.senderName}
                                className={`w-10 h-10 rounded-full border shrink-0 mt-0.5 bg-[#0F1115] ${
                                  isShowRec ? 'border-amber-500/30' : 'border-purple-500/40'
                                }`}
                              />
                            )}
                            <div className="flex-1 space-y-3">
                              {isSystemAlert ? (
                                <>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                        theme === 'dark' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'bg-sky-100 text-sky-800 border border-sky-200'
                                      }`}>
                                        <Radio className="w-3 h-3 text-sky-400" />
                                        <span>Air Date Alert</span>
                                      </span>
                                    </div>
                                    <p className={`text-[13px] font-bold leading-relaxed mt-1.5 ${
                                      theme === 'dark' ? 'text-slate-100' : 'text-neutral-900'
                                    }`}>
                                      {notif.message ? (
                                        notif.message.replace(/^🔔\s*/, '')
                                      ) : notif.show ? (
                                        <>Reminder: New episode of <span className="text-sky-400 underline font-extrabold">{notif.show.title}</span> is scheduled to air soon!</>
                                      ) : (
                                        'You have an upcoming air date alert.'
                                      )}
                                    </p>
                                  </div>

                                  <div className="flex gap-2 flex-wrap items-center pt-0.5">
                                    <button
                                      onClick={() => handleDismissNotification(notif.id)}
                                      className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                                        theme === 'dark'
                                          ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-sm shadow-sky-950/30'
                                          : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm'
                                      }`}
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Dismiss Alert</span>
                                    </button>
                                  </div>
                                </>
                              ) : notif.show ? (
                                <>
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

                                  <div className="flex gap-2 flex-wrap items-center">
                                    <button
                                      onClick={() => handleAcceptRecommendation(notif)}
                                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition cursor-pointer shadow-sm active:scale-95"
                                    >
                                      Add to Up Next
                                    </button>
                                    <button
                                      onClick={() => setReplyingNotifId(replyingNotifId === notif.id ? null : notif.id)}
                                      className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                                    >
                                      <Reply className="w-3.5 h-3.5" />
                                      <span>Reply</span>
                                    </button>
                                    <button
                                      onClick={() => handleDismissNotification(notif.id)}
                                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer active:scale-95"
                                    >
                                      Dismiss
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div>
                                    <h3 className={`text-xs font-black uppercase tracking-wider ${
                                      theme === 'dark' ? 'text-purple-300' : 'text-purple-800'
                                    }`}>
                                      Direct Message from {notif.senderName}!
                                    </h3>
                                    <p className={`text-[12px] font-bold leading-relaxed mt-1 p-2.5 bg-purple-950/40 border border-purple-500/20 rounded-xl ${
                                      theme === 'dark' ? 'text-purple-100' : 'text-purple-950'
                                    }`}>
                                      "{notif.message}"
                                    </p>
                                  </div>

                                  <div className="flex gap-2 flex-wrap items-center">
                                    <button
                                      onClick={() => setReplyingNotifId(replyingNotifId === notif.id ? null : notif.id)}
                                      className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold rounded-xl transition cursor-pointer shadow-sm flex items-center gap-1.5 active:scale-95"
                                    >
                                      <Reply className="w-3.5 h-3.5" />
                                      <span>Reply</span>
                                    </button>
                                    <button
                                      onClick={() => handleDismissNotification(notif.id)}
                                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer active:scale-95"
                                    >
                                      Mark as Read
                                    </button>
                                  </div>
                                </>
                              )}

                              {/* Animated Inline Reply Box (only for user recommendations and direct messages) */}
                              <AnimatePresence>
                                {!isSystemAlert && replyingNotifId === notif.id && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: 10 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={`p-3 rounded-xl border text-xs overflow-hidden ${
                                      isShowRec
                                        ? (theme === 'dark' ? 'bg-[#12141A] border-amber-500/30' : 'bg-amber-50/90 border-amber-200')
                                        : (theme === 'dark' ? 'bg-[#12101D] border-purple-500/30' : 'bg-purple-50 border-purple-200')
                                    }`}
                                  >
                                    <form
                                      onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSendReplyToNotif(notif);
                                      }}
                                      className="space-y-2.5"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className={`font-bold flex items-center gap-1.5 text-[11px] ${
                                          isShowRec
                                            ? (theme === 'dark' ? 'text-amber-300' : 'text-amber-900')
                                            : (theme === 'dark' ? 'text-purple-300' : 'text-purple-900')
                                        }`}>
                                          <Reply className="w-3.5 h-3.5" />
                                          <span>Replying to <strong className="font-extrabold">{notif.senderName}</strong></span>
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => setReplyingNotifId(null)}
                                          className={`p-1 rounded-lg transition cursor-pointer ${
                                            theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
                                          }`}
                                          title="Close Reply"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>

                                      {replySentSuccessMap[notif.id] ? (
                                        <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-2">
                                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                          <span>{replySentSuccessMap[notif.id]}</span>
                                        </div>
                                      ) : (
                                        <div className="flex gap-2 items-center">
                                          <input
                                            type="text"
                                            value={notifReplyTextMap[notif.id] || ''}
                                            onChange={(e) => setNotifReplyTextMap(prev => ({ ...prev, [notif.id]: e.target.value }))}
                                            placeholder={`Type your reply to ${notif.senderName}...`}
                                            autoFocus
                                            className={`flex-1 px-3 py-2 text-xs rounded-xl border outline-none transition ${
                                              theme === 'dark'
                                                ? 'bg-[#1A1E29] border-white/10 text-white placeholder-slate-500 focus:border-purple-500'
                                                : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-purple-500 shadow-inner'
                                            }`}
                                          />
                                          <button
                                            type="submit"
                                            disabled={!(notifReplyTextMap[notif.id] || '').trim() || isSendingReplyMap[notif.id]}
                                            className={`px-3.5 py-2 font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm disabled:opacity-50 ${
                                              isShowRec
                                                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                                                : 'bg-purple-600 hover:bg-purple-500 text-white'
                                            }`}
                                          >
                                            <Send className="w-3.5 h-3.5" />
                                            <span>{isSendingReplyMap[notif.id] ? 'Sending...' : 'Send'}</span>
                                          </button>
                                        </div>
                                      )}
                                    </form>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>

            {/* Incoming Watch Buddy Request Alert Banner */}
            <AnimatePresence>
              {pendingIncomingRequests.length > 0 && (
                <motion.div
                  key="pending-incoming-requests-banner"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                  className="overflow-hidden"
                >
                  <div className={`p-4 sm:p-5 border rounded-2xl relative overflow-hidden transition-all shadow-xl ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-purple-950/80 via-purple-900/40 to-[#14161F] border-purple-500/35 shadow-purple-950/30'
                      : 'bg-gradient-to-r from-purple-50 via-indigo-50/50 to-white border-purple-200 shadow-purple-100/50'
                  }`}>
                    <div className="flex items-start gap-3.5 sm:gap-4">
                      <div className={`p-2.5 border rounded-2xl shrink-0 mt-0.5 shadow-sm ${
                        theme === 'dark'
                          ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                          : 'bg-purple-100 border-purple-200 text-purple-700'
                      }`}>
                        <UserPlus className="w-5 h-5 animate-pulse" />
                      </div>
                      <div className="flex-1 space-y-3.5 min-w-0">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className={`text-xs font-black uppercase tracking-wider ${
                              theme === 'dark' ? 'text-purple-300' : 'text-purple-800'
                            }`}>
                              Incoming Binge Buddy Request
                            </h3>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/30">
                              {pendingIncomingRequests.length} pending
                            </span>
                          </div>
                          <p className={`text-xs font-medium leading-relaxed mt-1 ${
                            theme === 'dark' ? 'text-slate-200' : 'text-neutral-700'
                          }`}>
                            Accepting allows you to share watchlist picks and see each other's TV shows, reviews and recommendations!
                          </p>
                        </div>

                        {/* Requests List */}
                        <div className="space-y-3">
                          {pendingIncomingRequests.map((req, reqIdx) => (
                            <div 
                              key={req.fromUserId ? `req-${req.fromUserId}-${reqIdx}` : `req-idx-${reqIdx}`}
                              className={`p-4 sm:p-4.5 rounded-2xl border flex flex-col gap-3.5 transition shadow-md ${
                                theme === 'dark'
                                  ? 'bg-[#161822] border-purple-500/30 text-slate-100'
                                  : 'bg-white border-purple-100 shadow-sm text-neutral-900'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={req.fromUserAvatar}
                                  alt={req.fromUserName}
                                  className="w-11 h-11 rounded-2xl border-2 border-purple-500/40 bg-purple-500/10 object-cover shrink-0 shadow-sm"
                                />
                                <div className="min-w-0 flex-1">
                                  <h4 className={`text-sm sm:text-base font-black truncate ${theme === 'dark' ? 'text-white' : 'text-neutral-900'}`}>
                                    {req.fromUserName}
                                  </h4>
                                  <p className={`text-xs font-bold leading-snug ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>
                                    Wants to connect as a Binge Buddy
                                  </p>
                                </div>
                              </div>

                              {req.message && (
                                <div className={`p-3 rounded-xl text-xs font-medium border flex items-start gap-2 shadow-inner ${
                                  theme === 'dark' 
                                    ? 'bg-purple-950/60 text-purple-100 border-purple-500/35' 
                                    : 'bg-purple-50 text-purple-950 border-purple-200'
                                }`}>
                                  <MessageSquare className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                                  <span className="leading-relaxed">"{req.message}"</span>
                                </div>
                              )}

                              {/* Optional Reply Message Input */}
                              <input
                                type="text"
                                value={replyMessages[req.fromUserId] || ''}
                                onChange={e => setReplyMessages(prev => ({ ...prev, [req.fromUserId]: e.target.value }))}
                                placeholder={`Type an optional reply message to ${req.fromUserName}...`}
                                className={`w-full text-xs px-3.5 py-2.5 rounded-xl border focus:outline-none focus:border-purple-400 transition min-h-[42px] ${
                                  theme === 'dark' 
                                    ? 'bg-[#0E1017] text-white border-purple-500/30 placeholder-slate-400' 
                                    : 'bg-neutral-50 text-neutral-900 border-neutral-200 placeholder-neutral-400'
                                }`}
                              />

                              {/* Action Buttons: Accept / Deny - Mobile Ergonomic Stack */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                                <button
                                  onClick={() => handleAcceptBuddyRequest(req.fromUserId, req.fromUserName)}
                                  className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition shadow-md shadow-blue-950/40 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Accept Connection</span>
                                </button>
                                <button
                                  onClick={() => handleDeclineBuddyRequest(req.fromUserId, req.fromUserName)}
                                  className={`w-full min-h-[44px] py-2.5 px-4 rounded-xl font-bold text-xs transition border cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98] ${
                                    theme === 'dark'
                                      ? 'bg-[#222632] hover:bg-rose-600/80 text-slate-200 hover:text-white border-white/10'
                                      : 'bg-neutral-100 hover:bg-rose-600 text-neutral-700 hover:text-white border-neutral-200'
                                  }`}
                                >
                                  Decline
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Upcoming Backlog Episode Activation Alert */}
            <AnimatePresence>
              {matchingBacklogShows.length > 0 && (
                <motion.div
                  key="matching-backlog-alert-banner"
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
                className="sticky top-3 z-30 mb-6 p-4 rounded-2xl bg-[#14161C] border border-purple-500/30 shadow-2xl shadow-purple-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-200"
                id="family-picks-onboarding-banner"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-black text-purple-300 uppercase tracking-wider">Viewing Buddy Picks</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      You are viewing shows tracked by your binge buddies. Click <span className="text-orange-400 font-extrabold">+ Add to Up Next</span> on any card to import it directly to your page!
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
                      currentUserShows={currentUserShows}
                      subscribedServices={currentUserPrefs?.services || []}
                      currentUser={currentUser}
                      allUsers={allUsers}
                      friendsList={friendsState.friends}
                      ownerName={searchFamily ? undefined : (isFriendView ? (show.ownerName || board?.owner?.name || allUsers.find(u => u.id === boardId)?.name || 'Buddy') : undefined)}
                      ownerNames={searchFamily ? show.ownerNames : undefined}
                      familyDetails={searchFamily ? show.familyDetails : undefined}
                      onboardingStep={onboardingStep}
                      onboardingTargetShowId={onboardingTargetShowId}
                      onboardingHighlight={
                        (onboardingStep === 1 && idx === 0 && activeTab === 'queue') ||
                        (onboardingStep === 2 && show.id === onboardingTargetShowId) ||
                        (onboardingStep === 3 && searchFamily)
                      }
                      theme={theme}
                      onOpenStoryCard={handleOpenStoryCard}
                      onRequireAuth={handleRequireAuth}
                      onOpenTaterzAiRecap={handleOpenTaterzAiRecap}
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
                          Add some from your binge buddies' watchlists. One click imports their picks directly!
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
                      <span>Add Show</span>
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
              <ChatAgent shows={board.shows} preferences={currentUserPrefs} onClose={() => setIsAiSidebarOpen(false)} currentUser={currentUser} theme={theme} />
            </div>
          </div>

          {/* Mobile Sheet Panel drawer */}
          <AnimatePresence>
            {isChatOpen && (
              <div key="chat-mobile-sheet-overlay" className="fixed inset-0 z-50 bg-black/85 md:hidden flex justify-end">
                <motion.div
                  key="chat-mobile-sheet-panel"
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25 }}
                  className={`w-[85vw] h-full border-l ${
                    theme === 'dark' ? 'bg-[#1A1D23] border-white/5' : 'bg-white border-slate-200 shadow-2xl'
                  }`}
                >
                  <ChatAgent shows={board.shows} preferences={currentUserPrefs} onClose={() => setIsChatOpen(false)} currentUser={currentUser} theme={theme} />
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

      {/* Floating Action Buttons for all screens (Mobile, Tablet & Desktop) - hidden when any modal is active so they never block modal close buttons or actions */}
      {!(isAddOpen || isShareOpen || isCalendarOpen || isPreferencesOpen || isManageActiveOpen || isStatsOpen || showQueueOnboarding || isChatOpen) && (
        <div className="fixed bottom-6 right-6 z-30 flex flex-col gap-3.5 items-end pointer-events-auto">
          {/* AI Companion Floating Action Button */}
          <div className="relative flex items-center group">
            <span className="absolute right-14 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 whitespace-nowrap px-2.5 py-1.5 rounded-xl bg-slate-950/90 text-[10px] font-black tracking-widest uppercase text-amber-300 border border-amber-500/20 shadow-2xl">
              ASK SPUDZ
            </span>
            <button
              onClick={handleOpenTaterzAiGeneral}
              className={`p-3.5 rounded-full transition-all duration-150 flex items-center justify-center border shadow-xl backdrop-blur-md cursor-pointer hover:scale-105 active:scale-95 ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-300 border-amber-500/30 shadow-[0_0_18px_rgba(245,158,11,0.25)]'
                  : 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-[0_4px_16px_rgba(245,158,11,0.3)]'
              }`}
              title="Ask Spudz"
            >
              <Bot className={`w-5 h-5 ${theme === 'dark' ? 'text-amber-400' : 'text-white'}`} />
            </button>
          </div>

          {/* Add Show Button */}
          {!isFriendView && (
            <div className="relative flex items-center group">
              <span className="absolute right-14 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 whitespace-nowrap px-2.5 py-1.5 rounded-xl bg-slate-950/90 text-[10px] font-black tracking-widest uppercase text-blue-400 border border-blue-500/10 shadow-2xl">
                Search & Add Show
              </span>
              <button
                onClick={() => setIsAddOpen(true)}
                className="p-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-2xl shadow-blue-950/40 transition-colors duration-150 flex items-center justify-center border border-blue-500/20 cursor-pointer"
                title="Search & Add a Show"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modals Container */}
      <AnimatePresence>
        {isAddOpen && (
          <AddShowModal
            key="add-show-modal"
            onClose={() => setIsAddOpen(false)}
            onAddShow={handleAddShow}
            onboardingStep={onboardingStep}
            buddyShows={buddyShowsForModal}
            initialTab={addModalInitialTab}
            allUsers={allUsers}
            currentUser={currentUser}
            existingShows={board?.shows || []}
            theme={theme}
          />
        )}
        {isShareOpen && (
          <ShareBoardModal
            key="share-board-modal"
            currentBoardId={boardId}
            currentUser={currentUser}
            allUsers={allUsers}
            onJoinBoard={handleJoinBoard}
            onClose={() => setIsShareOpen(false)}
            onFriendsUpdated={() => {
              setFriendsState(getFriendsData(currentUser?.id || JULIO_USER_ID));
            }}
            onOpenGroupWatchAi={handleOpenTaterzAiGroup}
            theme={theme}
          />
        )}
        {isTaterzAiOpen && (
          <AskTaterzAIModal
            key="ask-taterz-ai-modal"
            isOpen={isTaterzAiOpen}
            onClose={() => setIsTaterzAiOpen(false)}
            shows={board?.shows || []}
            preferences={currentUserPrefs}
            buddies={
              (friendsState.friends || []).map((fId) => {
                const uObj = allUsers.find((u) => u.id === fId);
                return {
                  id: fId,
                  name: uObj?.name || 'Binge Buddy',
                  avatarUrl: uObj?.avatarUrl,
                  topShows: [
                    { title: 'Shogun', rating: 10, streamingService: 'Hulu' },
                    { title: 'The Bear', rating: 9, streamingService: 'Hulu' }
                  ]
                };
              })
            }
            initialIntent={taterzAiIntent}
            initialShowForRecap={taterzAiShow}
            theme={theme}
          />
        )}
        {isManageActiveOpen && (
          <ManageActiveShowsModal
            key="manage-active-shows-modal"
            shows={board?.shows || []}
            onUpdateShow={handleUpdateShow}
            onDeleteShow={handleDeleteShow}
            onClose={() => setIsManageActiveOpen(false)}
            theme={theme}
          />
        )}
        {isCalendarOpen && (
          <ShowCalendarModal
            key="show-calendar-modal"
            shows={board?.shows || []}
            onUpdateShow={handleUpdateShow}
            onClose={() => setIsCalendarOpen(false)}
            theme={theme}
          />
        )}
        {isPreferencesOpen && (
          <PreferencesModal
            key="preferences-modal"
            currentUser={currentUser}
            preferences={board?.preferences || currentUserPrefs || { genres: [], actors: [], directors: [] }}
            existingShows={board?.shows || []}
            onSave={handleUpdateProfileAndPreferences}
            onDelete={handleDeleteProfileAndStartOver}
            onClose={() => setIsPreferencesOpen(false)}
            showWorkflowGuide={showWorkflowGuide}
            theme={theme}
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
        {currentUser && isUserJulio(currentUser) && isAdminOpen && (
          <UserAdminModal
            key="user-admin-modal"
            isOpen={isAdminOpen}
            onClose={() => setIsAdminOpen(false)}
            currentUser={currentUser}
            theme={theme}
            onInspectUserLibrary={(targetUserId) => {
              handleJoinBoard(targetUserId);
              setIsAdminOpen(false);
            }}
            onImpersonateUser={handleImpersonateUser}
            onDeleteUserProfile={(targetUserId) => {
              if (boardId === targetUserId) {
                handleJoinBoard(currentUser.id);
              }
              const fetchUsers = () => {
                fetch(`/api/users?currentUserId=${encodeURIComponent(currentUser.id)}&email=${encodeURIComponent(currentUser.email || '')}&name=${encodeURIComponent(currentUser.name || '')}`)
                  .then(res => res.ok ? res.json() : null)
                  .then(data => {
                    if (Array.isArray(data)) {
                      const seen = new Set<string>();
                      const unique = data.filter((u: any) => u && u.id && !seen.has(u.id) && seen.add(u.id));
                      setAllUsers(unique);
                    }
                  })
                  .catch(() => {});
              };
              fetchUsers();
            }}
          />
        )}
        {showQueueOnboarding && (
          <QueueOnboardingModal
            key="queue-onboarding-modal"
            isOpen={showQueueOnboarding}
            onClose={handleCloseOnboarding}
            hasRecommendations={localStorage.getItem(`coughtater_starter_pack_${currentUser?.id}`) !== 'false'}
            theme={theme}
          />
        )}
        {onboardingStep !== null && !isAddOpen && (
          <div key="onboarding-walkthrough-overlay-container">
            {/* Spotlight Onboarding Dimming Backdrop */}
            <div className="fixed inset-0 bg-[#06080F]/80 pointer-events-auto z-40 transition-all duration-300" />
            
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
          </div>
        )}

        {/* Auto-Connect Toast */}
        {inviteConnectedToast && (
          <motion.div
            key="invite-toast"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 left-6 right-6 md:left-6 md:right-auto z-50 max-w-sm bg-[#161920]/95 backdrop-blur-xl border border-blue-500/35 rounded-3xl p-4 shadow-[0_20px_50px_rgba(59,130,246,0.22)] select-none flex items-center justify-between gap-3 overflow-hidden"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/30">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-white leading-snug">
                {inviteConnectedToast}
              </p>
            </div>
            <button
              onClick={() => setInviteConnectedToast(null)}
              className="text-slate-500 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
        {completedShowToast && (
          <motion.div
            key="completion-toast"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 left-6 right-6 md:left-6 md:right-auto z-50 max-w-sm bg-[#161920]/95 backdrop-blur-xl border border-emerald-500/35 rounded-3xl p-4 shadow-[0_20px_50px_rgba(16,185,129,0.22)] select-none flex gap-4 overflow-hidden"
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
                Officially added to your <span className="text-emerald-400 font-bold">Library</span> pipeline! Keep on streaming with CouchTaterz! 🥔🏆✨
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

      {/* 9:16 Social Story Card Modal */}
      <SocialStoryCardModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
        show={storyModalShow}
        currentUser={currentUser}
        boardId={boardId}
        triggerReason={storyTriggerReason}
      />

      {/* Soft Gate Auth Modal for Guest Users */}
      <SoftGateAuthModal
        isOpen={isSoftGateOpen}
        onClose={() => setIsSoftGateOpen(false)}
        onSuccessLogin={handleSoftGateSuccessLogin}
        ownerName={board?.owner?.name || board?.name || 'a Binge Buddy'}
        actionTitle={softGateActionTitle}
      />

      {/* Custom Tater Avatar Creator Studio Modal */}
      <TaterzAvatarBuilderModal
        isOpen={isAvatarStudioOpen}
        onClose={() => setIsAvatarStudioOpen(false)}
        currentAvatarUrl={currentUser?.avatarUrl}
        onSaveAvatar={(newAvatarUrl) => {
          if (currentUser) {
            const updatedUser = { ...currentUser, avatarUrl: newAvatarUrl };
            setCurrentUser(updatedUser);
            localStorage.setItem(`couchtaterz_user_${updatedUser.id}`, JSON.stringify(updatedUser));
            localStorage.setItem('couchtaterz_active_user', JSON.stringify(updatedUser));
            localStorage.setItem('coughtater_user', JSON.stringify(updatedUser));

            // Immediately update local allUsers list so that community lists, chat, and headers reflect change immediately
            setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? { ...u, avatarUrl: newAvatarUrl } : u));

            // Sync user profile directly to persistent cloud storage
            fetch('/api/users/profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                avatarUrl: newAvatarUrl
              })
            }).catch(err => console.error("Failed to sync profile avatar:", err));

            if (board) {
              const updatedBoard = {
                ...board,
                owner: updatedUser,
                updatedAt: new Date().toISOString()
              };
              setBoard(updatedBoard);
              fetch('/api/boards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedBoard),
              }).catch(err => console.error("Failed to sync board avatar:", err));
            }
          }
        }}
        isPro={localStorage.getItem('couchtaterz_is_pro') === 'true'}
      />
    </div>
  );
}
