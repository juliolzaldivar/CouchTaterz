/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TvShow, StreamingService, ShowStatus, User, WatchedEpisode } from '../types';
import { getNormalizedGenres } from '../utils/genreUtils';
import { getShowBannerImage } from '../utils/showBanners';
import { 
  getMaxAiredSeason, 
  getMaxAiredEpisodeForSeason, 
  clampProgressToAired, 
  hasFutureNextEpisode,
  getTodayDateString,
  getTitleForEpisode as getTitleForEpHelper 
} from '../utils/airedEpisodes';
import { 
  Play, 
  Plus, 
  Minus, 
  Star, 
  Edit2, 
  Trash2, 
  Tv, 
  Calendar,
  Bell, 
  CheckCircle, 
  BookOpen, 
  ChevronDown,
  ChevronUp,
  Image,
  Link,
  Sparkles,
  Check,
  X,
  Share2,
  Send,
  Smartphone,
  Bot,
  RotateCcw,
  Crown,
  MessageSquare,
  Quote,
  Eye,
  EyeOff,
  Flame,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ShowMerchModal, AmazonShoppingBagIcon } from './ShowMerchModal';


interface ShowCardProps {
  show: TvShow;
  onUpdateShow: (updatedShow: TvShow) => void;
  onDeleteShow: (id: string) => void;
  isFriendView?: boolean;
  onAddToMyQueue?: (show: TvShow) => void;
  isAlreadyInCollection?: boolean;
  currentUserShows?: TvShow[];
  subscribedServices?: StreamingService[];
  currentUser?: User | null;
  allUsers?: User[];
  ownerName?: string;
  ownerNames?: string[];
  familyDetails?: { ownerName: string; status: ShowStatus; userScore: number | null; userNotes: string; latestWatched: WatchedEpisode }[];
  highlightStatusPrompt?: boolean;
  onDismissHighlight?: () => void;
  onboardingStep?: number | null;
  onboardingTargetShowId?: string | null;
  onboardingHighlight?: boolean;
  theme?: 'dark' | 'light';
  friendsList?: string[];
  onOpenStoryCard?: (show: TvShow, reason?: 'completed' | 'high_rating' | 'manual') => void;
  onRequireAuth?: (actionTitle: string, pendingAction: () => void) => void;
  onOpenTaterzAiRecap?: (show: TvShow) => void;
}

export const SERVICE_COLORS: Record<StreamingService, { bg: string; text: string; border: string; accent: string }> = {
  'HBO': { 
    bg: 'bg-indigo-900/40 hover:bg-indigo-900/60', 
    text: 'text-indigo-200', 
    border: 'border-indigo-700/50',
    accent: 'bg-indigo-600'
  },
  'Netflix': { 
    bg: 'bg-red-950/40 hover:bg-red-950/60', 
    text: 'text-red-200', 
    border: 'border-red-800/50',
    accent: 'bg-red-600'
  },
  'Disney+': { 
    bg: 'bg-blue-950/40 hover:bg-blue-950/60', 
    text: 'text-blue-200', 
    border: 'border-blue-800/50',
    accent: 'bg-blue-600'
  },
  'Prime Video': { 
    bg: 'bg-cyan-950/40 hover:bg-cyan-950/60', 
    text: 'text-cyan-200', 
    border: 'border-cyan-800/50',
    accent: 'bg-cyan-500'
  },
  'Hulu': { 
    bg: 'bg-emerald-950/40 hover:bg-emerald-950/60', 
    text: 'text-emerald-200', 
    border: 'border-emerald-800/50',
    accent: 'bg-emerald-500'
  },
  'Paramount+': { 
    bg: 'bg-sky-950/40 hover:bg-sky-950/60', 
    text: 'text-sky-200', 
    border: 'border-sky-800/50',
    accent: 'bg-sky-500'
  },
  'Apple TV': { 
    bg: 'bg-neutral-900/50 hover:bg-neutral-900/70', 
    text: 'text-neutral-200', 
    border: 'border-neutral-700/50',
    accent: 'bg-neutral-200 text-black'
  },
  'Peacock': { 
    bg: 'bg-amber-950/40 hover:bg-amber-950/60', 
    text: 'text-amber-200', 
    border: 'border-amber-800/50',
    accent: 'bg-amber-500'
  },
  'AMC+': { 
    bg: 'bg-yellow-950/40 hover:bg-yellow-950/60', 
    text: 'text-yellow-200', 
    border: 'border-yellow-800/50',
    accent: 'bg-yellow-500'
  },
  'Starz': { 
    bg: 'bg-amber-950/40 hover:bg-amber-950/60', 
    text: 'text-amber-100', 
    border: 'border-amber-700/50',
    accent: 'bg-amber-500'
  },
  'Other': { 
    bg: 'bg-gray-900/40 hover:bg-gray-900/60', 
    text: 'text-gray-200', 
    border: 'border-gray-700/50',
    accent: 'bg-gray-600'
  }
};

import { 
  REGISTRATION_LINKS, 
  MOBILE_SCHEMES, 
  DESKTOP_LOGIN_LINKS, 
  getStreamingServiceLink 
} from '../utils/streamingLinks';
export { 
  REGISTRATION_LINKS, 
  MOBILE_SCHEMES, 
  DESKTOP_LOGIN_LINKS, 
  getStreamingServiceLink 
};

const STATUS_ICONS: Record<ShowStatus, React.ReactNode> = {
  'Watching': <Play className="w-3.5 h-3.5 mr-1" />,
  'Backlog': <BookOpen className="w-3.5 h-3.5 mr-1" />,
  'Completed': <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-400" />,
  'Dropped': <Minus className="w-3.5 h-3.5 mr-1 text-rose-400" />
};

export const ShowCard: React.FC<ShowCardProps> = ({ 
  show, 
  onUpdateShow, 
  onDeleteShow, 
  isFriendView = false, 
  onAddToMyQueue,
  isAlreadyInCollection = false,
  currentUserShows = [],
  subscribedServices = [],
  currentUser,
  allUsers = [],
  ownerName,
  ownerNames,
  familyDetails,
  highlightStatusPrompt = false,
  onDismissHighlight,
  onboardingStep = null,
  onboardingTargetShowId = null,
  onboardingHighlight = false,
  theme = 'dark',
  friendsList = [],
  onOpenStoryCard,
  onRequireAuth,
  onOpenTaterzAiRecap
}) => {
  const [showSubscribeTooltip, setShowSubscribeTooltip] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState(show.bannerImage || '');
  const [bannerPositionInput, setBannerPositionInput] = useState(show.bannerPosition || 'center 25%');
  const [notes, setNotes] = useState(show.userNotes || '');
  const [customScore, setCustomScore] = useState<number>(show.userScore || 5);

  const isVip = useMemo(() => {
    try {
      if (!currentUser) {
        return localStorage.getItem('couchtaterz_is_pro') === 'true' ||
               localStorage.getItem('couchtaterz_is_vip') === 'true' ||
               localStorage.getItem('couchtater_vip_unlocked') === 'true';
      }
      const email = currentUser.email?.trim().toLowerCase() || '';
      const id = currentUser.id || '';
      const name = currentUser.name?.trim().toLowerCase() || '';
      const isJulioOrAdmin = 
        email === 'juliozaldivar@gmail.com' || 
        email.includes('julio') ||
        id === 'default' || 
        id === 'user-julio' || 
        id.includes('julio') ||
        name === 'julio' || 
        name.includes('julio') ||
        name.includes('admin') ||
        Boolean((currentUser as any)?.isAdmin) ||
        Boolean((currentUser as any)?.isPro) ||
        Boolean((currentUser as any)?.isVip);

      return isJulioOrAdmin || 
             localStorage.getItem('couchtaterz_is_pro') === 'true' ||
             localStorage.getItem('couchtaterz_is_vip') === 'true' ||
             localStorage.getItem('couchtater_vip_unlocked') === 'true';
    } catch (e) {
      return false;
    }
  }, [currentUser]);

  const isEpisodeReviewEligible = (show.latestWatched?.episode || 0) >= 1;
  const currentEpKey = isEpisodeReviewEligible ? `S${show.latestWatched.season}E${show.latestWatched.episode}` : '';
  const currentEpReview = currentEpKey ? (show.episodeReviews?.[currentEpKey] || '') : '';
  const [epReviewInput, setEpReviewInput] = useState<string>(currentEpReview);
  const [isEpReviewOpen, setIsEpReviewOpen] = useState(false);
  const [epReviewSavedFeedback, setEpReviewSavedFeedback] = useState(false);
  const [selectedReviewEpKey, setSelectedReviewEpKey] = useState<string>(currentEpKey);
  const [unmaskedSpoilers, setUnmaskedSpoilers] = useState<Record<string, boolean>>({});
  const [showAllEpisodeReviewsDrawer, setShowAllEpisodeReviewsDrawer] = useState<boolean>(false);

  // All episode reviews logged for this show (filtering out any invalid episode 0 reviews)
  const allLoggedReviews = useMemo(() => {
    if (!show.episodeReviews || typeof show.episodeReviews !== 'object') return [];
    return Object.entries(show.episodeReviews)
      .filter(([key, review]) => {
        if (typeof review !== 'string' || review.trim().length === 0) return false;
        const match = key.match(/S(\d+)E(\d+)/i) || key.match(/(\d+)-(\d+)/);
        const episode = match ? parseInt(match[2], 10) : 1;
        return episode >= 1;
      })
      .map(([key, review]) => {
        const match = key.match(/S(\d+)E(\d+)/i) || key.match(/(\d+)-(\d+)/);
        const season = match ? parseInt(match[1], 10) : 1;
        const episode = match ? parseInt(match[2], 10) : 1;
        return { key, season, episode, review: (review as string).trim() };
      })
      .sort((a, b) => (b.season - a.season) || (b.episode - a.episode));
  }, [show.episodeReviews]);

  const toggleSpoilerReveal = (key: string) => {
    setUnmaskedSpoilers(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  useEffect(() => {
    if (currentEpKey) {
      const saved = show.episodeReviews?.[currentEpKey] || '';
      setEpReviewInput(saved);
      setSelectedReviewEpKey(currentEpKey);
    } else {
      setEpReviewInput('');
      setSelectedReviewEpKey('');
      setIsEpReviewOpen(false);
    }
  }, [show.id, currentEpKey]);

  const handleSaveEpReview = (textToSave?: string, targetKey?: string) => {
    const keyToUse = targetKey || selectedReviewEpKey || currentEpKey;
    if (!keyToUse) return;
    const text = (textToSave !== undefined ? textToSave : epReviewInput).slice(0, 280).trim();
    setEpReviewInput(text);
    const updatedReviews = {
      ...(show.episodeReviews || {}),
    };
    if (text) {
      updatedReviews[keyToUse] = text;
      try {
        localStorage.setItem(`couchtater_ep_review_${show.id}_${keyToUse}`, text);
      } catch (e) {}
    } else {
      delete updatedReviews[keyToUse];
      try {
        localStorage.removeItem(`couchtater_ep_review_${show.id}_${keyToUse}`);
      } catch (e) {}
    }
    onUpdateShow({
      ...show,
      episodeReviews: updatedReviews,
    });
    setEpReviewSavedFeedback(true);
    setTimeout(() => setEpReviewSavedFeedback(false), 2200);
  };

  const handleClearEpReview = (targetKey?: string) => {
    const keyToUse = targetKey || selectedReviewEpKey || currentEpKey;
    if (!keyToUse) return;
    setEpReviewInput('');
    const updatedReviews = {
      ...(show.episodeReviews || {}),
    };
    delete updatedReviews[keyToUse];
    try {
      localStorage.removeItem(`couchtater_ep_review_${show.id}_${keyToUse}`);
    } catch (e) {}
    onUpdateShow({
      ...show,
      episodeReviews: updatedReviews,
    });
    setEpReviewSavedFeedback(true);
    setTimeout(() => setEpReviewSavedFeedback(false), 2200);
  };

  useEffect(() => {
    setNotes(show.userNotes || '');
  }, [show.userNotes]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExpanderDeleteConfirm, setShowExpanderDeleteConfirm] = useState(false);
  const [showResetRatingConfirm, setShowResetRatingConfirm] = useState(false);
  const [recapText, setRecapText] = useState<string>('');
  const [isLoadingRecap, setIsLoadingRecap] = useState<boolean>(false);
  const [fetchedRecapKey, setFetchedRecapKey] = useState<string>('');

  const [isSharing, setIsSharing] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [sharingStates, setSharingStates] = useState<Record<string, 'idle' | 'sending' | 'sent'>>({});
  const [showMerchModal, setShowMerchModal] = useState<boolean>(false);

  const notifyTargetUsers = useMemo(() => {
    if (!allUsers || !currentUser) return [];
    const isJulioUser = (u: User) => u.id === 'default' || u.id === 'user-julio' || u.email?.toLowerCase() === 'juliozaldivar@gmail.com';
    const isCurrentUserJulio = isJulioUser(currentUser);

    return allUsers.filter(u => {
      if (u.id === currentUser.id) return false;
      const isConnected = (friendsList && Array.isArray(friendsList) && friendsList.includes(u.id)) || (!isCurrentUserJulio && isJulioUser(u));
      return isConnected;
    });
  }, [allUsers, currentUser, friendsList]);

  const isTargetShow = onboardingTargetShowId === show.id;
  const isOnboardingHighlightActive = onboardingHighlight;

  const handleInteractionClick = () => {
    if (onboardingStep === 2 || onboardingStep === 3) {
      return;
    }
    setTimeout(() => {
      const element = document.getElementById(`show-card-${show.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  const handleSendShare = async (targetUserId: string) => {
    setSharingStates(prev => ({ ...prev, [targetUserId]: 'sending' }));

    const isGuest = currentUser?.id === 'guest-demo' || currentUser?.id?.startsWith('guest') || currentUser?.email?.includes('guest');
    if (isGuest) {
      setTimeout(() => {
        setSharingStates(prev => ({ ...prev, [targetUserId]: 'sent' }));
      }, 400);
      return;
    }

    try {
      const notification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        senderId: currentUser?.id,
        senderName: currentUser?.name || 'A Fellow Tater',
        senderAvatarUrl: currentUser?.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${currentUser?.name || 'Tater'}`,
        show: show,
        message: shareMessage.trim() || undefined,
        createdAt: new Date().toISOString()
      };

      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId,
          notification
        })
      });

      if (res.ok) {
        setSharingStates(prev => ({ ...prev, [targetUserId]: 'sent' }));
      } else {
        throw new Error('Failed to send share notification');
      }
    } catch (err) {
      console.error(err);
      setSharingStates(prev => ({ ...prev, [targetUserId]: 'idle' }));
      alert('Failed to send notification. Please try again.');
    }
  };

  useEffect(() => {
    if (isExpanded && show.status === 'Watching') {
      const currentKey = `${show.latestWatched.season}-${show.latestWatched.episode}`;
      if (fetchedRecapKey !== currentKey) {
        setIsLoadingRecap(true);
        fetch('/api/episode-recap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: show.title,
            season: show.latestWatched.season,
            episode: show.latestWatched.episode,
            genres: show.genres,
            overview: show.overview
          })
        })
          .then(async res => {
            if (!res.ok) {
              const text = await res.text();
              throw new Error(text || `HTTP error ${res.status}`);
            }
            return res.json();
          })
          .then(data => {
            setRecapText(data.recap || "No recap summary available.");
            setFetchedRecapKey(currentKey);
            setIsLoadingRecap(false);
          })
          .catch(err => {
            console.error("Failed to fetch episode recap:", err);
            setRecapText("Could not generate episode recap.");
            setFetchedRecapKey(currentKey); // Set the key anyway to prevent infinite retry loops on error
            setIsLoadingRecap(false);
          });
      }
    }
  }, [isExpanded, show.status, show.title, show.latestWatched.season, show.latestWatched.episode, fetchedRecapKey]);

  const colors = SERVICE_COLORS[show.streamingService] || SERVICE_COLORS['Other'];

  const formatAirDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // 0-based
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      const shortMonth = d.toLocaleDateString('en-US', { month: 'short' });
      const twoDigitYear = String(year).slice(-2);
      return `${shortMonth} ${day} ${twoDigitYear}`;
    }
    const d = new Date(dateStr);
    const shortMonth = d.toLocaleDateString('en-US', { month: 'short' });
    const twoDigitYear = String(d.getFullYear()).slice(-2);
    return `${shortMonth} ${d.getDate()} ${twoDigitYear}`;
  };

  // Determine if nextEpisode is defined and represents an un-aired/upcoming episode
  const isNextEpFuture = hasFutureNextEpisode(show);

  // Maximum season that has actually aired episodes
  const maxSeasons = getMaxAiredSeason(show);

  // Maximum episode count in the current selected season that has actually aired
  const maxEpisodesInSeason = getMaxAiredEpisodeForSeason(show, show.latestWatched.season);

  const getTitleForEpisode = (season: number, episode: number): string => {
    return getTitleForEpHelper(show, season, episode);
  };

  // Series is only fully completed if the show has officially concluded AND has no upcoming episodes planned AND user is on the final season & episode
  const isSeriesFullyCompleted = Boolean(
    show.concluded && 
    !show.nextEpisode && 
    show.latestWatched.season >= maxSeasons &&
    show.latestWatched.episode >= maxEpisodesInSeason
  );

  // Show is "Caught Up" if user watched all aired episodes of the current season, but the show is ongoing or has upcoming episodes/seasons
  const isCaughtUp = show.latestWatched.episode > 0 && show.latestWatched.episode >= maxEpisodesInSeason && (
    !show.concluded || Boolean(show.nextEpisode) || show.latestWatched.season < maxSeasons
  );

  // Only show nextEpisode notification if user hasn't watched it yet AND either it's upcoming/today or aired within the last 30 days (1 month)
  const shouldShowNextEpNotification = (() => {
    if (!show.nextEpisode) return false;
    const hasNotWatched = show.latestWatched.season < show.nextEpisode.season ||
      (show.latestWatched.season === show.nextEpisode.season && show.latestWatched.episode < show.nextEpisode.episode);
    if (!hasNotWatched) return false;

    if (!show.nextEpisode.airDate) return true;

    const airDateStr = show.nextEpisode.airDate.split('T')[0];
    const todayStr = getTodayDateString();

    // If future or airing today, always show
    if (airDateStr >= todayStr) return true;

    // If in the past, only show if it aired within the last 30 days (1 month ago max)
    const airDateMs = new Date(show.nextEpisode.airDate).getTime();
    if (isNaN(airDateMs)) return true;

    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    return (Date.now() - airDateMs) <= thirtyDaysMs;
  })();

  const isDarkTheme = theme === 'dark';

  const caughtUpStyles = (() => {
    if (show.status === 'Completed') {
      return {
        pillBg: isDarkTheme ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/25' : 'bg-emerald-50 text-emerald-800 border-emerald-300',
        icon: 'text-emerald-400',
        dot: 'text-emerald-500/40',
        text: isDarkTheme ? 'text-emerald-400' : 'text-emerald-700',
        bar: 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
      };
    } else if (show.status === 'Backlog') {
      return {
        pillBg: isDarkTheme ? 'bg-amber-950/30 text-amber-300 border-amber-500/25' : 'bg-amber-50 text-amber-800 border-amber-300',
        icon: 'text-amber-400',
        dot: 'text-amber-500/40',
        text: isDarkTheme ? 'text-amber-400' : 'text-amber-700',
        bar: 'bg-gradient-to-r from-amber-500 to-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.5)]'
      };
    } else {
      // Watching section (Blue)
      return {
        pillBg: isDarkTheme ? 'bg-blue-950/30 text-blue-300 border-blue-500/25' : 'bg-blue-50 text-blue-800 border-blue-300',
        icon: 'text-blue-400',
        dot: 'text-blue-500/40',
        text: isDarkTheme ? 'text-blue-400' : 'text-blue-700',
        bar: 'bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_10px_rgba(56,189,248,0.5)]'
      };
    }
  })();

  const handleIncrementEpisode = () => {
    if (isFriendView || !currentUser) {
      if (!currentUser && onRequireAuth) onRequireAuth('Sign in to update progress', () => {});
      return;
    }
    if (show.latestWatched.episode >= maxEpisodesInSeason) return;
    const nextEp = show.latestWatched.episode + 1;
    const s = show.latestWatched.season;
    const clampedWatched = clampProgressToAired(show, s, nextEp);
    const isCompletedNow = Boolean(
      clampedWatched.episode === maxEpisodesInSeason && 
      s >= maxSeasons && 
      show.concluded && 
      !show.nextEpisode
    );
    const updated = {
      ...show,
      latestWatched: clampedWatched,
      status: isCompletedNow ? ('Completed' as ShowStatus) : show.status
    };
    onUpdateShow(updated);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFriendView || !currentUser) {
      if (!currentUser && onRequireAuth) onRequireAuth('Sign in to update progress', () => {});
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const totalInSeason = (show.episodesPerSeason && show.episodesPerSeason[show.latestWatched.season - 1]) || 10;
    const targetEpisodeRaw = Math.max(0, Math.min(totalInSeason, Math.round(percentage * totalInSeason)));
    const s = show.latestWatched.season;
    const clampedWatched = clampProgressToAired(show, s, targetEpisodeRaw);
    const isCompletedNow = Boolean(
      clampedWatched.episode === maxEpisodesInSeason && 
      s >= maxSeasons && 
      show.concluded && 
      !show.nextEpisode
    );
    
    const updated = {
      ...show,
      latestWatched: clampedWatched,
      status: isCompletedNow ? ('Completed' as ShowStatus) : show.status
    };
    onUpdateShow(updated);
  };

  const handleDecrementEpisode = () => {
    if (isFriendView || !currentUser) {
      if (!currentUser && onRequireAuth) onRequireAuth('Sign in to update progress', () => {});
      return;
    }
    if (show.latestWatched.episode <= 0) return;
    const nextEp = show.latestWatched.episode - 1;
    const s = show.latestWatched.season;
    const clampedWatched = clampProgressToAired(show, s, nextEp);
    const updated = {
      ...show,
      latestWatched: clampedWatched
    };
    onUpdateShow(updated);
  };

  const handleIncrementSeason = () => {
    if (isFriendView || !currentUser) {
      if (!currentUser && onRequireAuth) onRequireAuth('Sign in to update season', () => {});
      return;
    }
    if (show.latestWatched.season >= maxSeasons) return;
    const nextSeason = show.latestWatched.season + 1;
    const clampedWatched = clampProgressToAired(show, nextSeason, 1);
    const updated = {
      ...show,
      latestWatched: clampedWatched
    };
    onUpdateShow(updated);
  };

  const handleDecrementSeason = () => {
    if (isFriendView || !currentUser) {
      if (!currentUser && onRequireAuth) onRequireAuth('Sign in to update season', () => {});
      return;
    }
    if (show.latestWatched.season <= 1) return;
    const prevSeason = show.latestWatched.season - 1;
    const clampedWatched = clampProgressToAired(show, prevSeason, 1);
    const updated = {
      ...show,
      latestWatched: clampedWatched
    };
    onUpdateShow(updated);
  };

  const handleSaveNotes = () => {
    if (isFriendView || !currentUser) return;
    onUpdateShow({
      ...show,
      userNotes: notes
    });
    setIsEditingNotes(false);
  };

  const handleStatusChange = (status: ShowStatus) => {
    if (isFriendView || !currentUser) {
      if (!currentUser && onRequireAuth) {
        onRequireAuth('Sign in to CouchTaterz to update show status', () => {});
      }
      return;
    }
    let updatedWatched = show.latestWatched;
    if (status === 'Completed') {
      const finalS = getMaxAiredSeason(show);
      const finalE = getMaxAiredEpisodeForSeason(show, finalS);
      updatedWatched = clampProgressToAired(show, finalS, finalE);
    }
    const updated = {
      ...show,
      status,
      latestWatched: updatedWatched
    };
    onUpdateShow(updated);

    if (status === 'Completed' && onOpenStoryCard) {
      setTimeout(() => onOpenStoryCard(updated, 'completed'), 400);
    }
  };

  const handleScoreChange = (score: number | null) => {
    if (isFriendView || !currentUser) {
      if (!currentUser && onRequireAuth) {
        onRequireAuth('Sign in to rate TV shows', () => {});
      }
      return;
    }
    if (score !== null) {
      setCustomScore(score);
    }
    const updated = {
      ...show,
      userScore: score
    };
    onUpdateShow(updated);

    if (score !== null && score >= 9 && onOpenStoryCard) {
      setTimeout(() => onOpenStoryCard(updated, 'high_rating'), 400);
    }
  };

  const handleSaveImage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onUpdateShow({
      ...show,
      bannerImage: imageUrlInput.trim() || 'https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
      bannerPosition: bannerPositionInput
    });
    setIsEditingImage(false);
  };

  return (
    <div 
      id={`show-card-${show.id}`}
      className={`group flex flex-col rounded-3xl border overflow-hidden transition-colors duration-200 ${
        theme === 'dark'
          ? 'bg-[#1A1D23] text-slate-100 shadow-xl hover:shadow-2xl'
          : 'bg-[#F2F3F6] text-slate-900 shadow-sm hover:shadow-md'
      } ${
        isOnboardingHighlightActive
          ? 'relative z-50 ring-2 sm:ring-4 ring-purple-500/80 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.6)]'
          : highlightStatusPrompt
            ? 'relative z-50 ring-2 ring-purple-500 border-purple-500 shadow-2xl shadow-purple-500/20'
            : theme === 'dark'
              ? 'relative border-white/5 hover:border-white/10'
              : 'relative border-slate-300/80 hover:border-slate-400/80'
      }`}
    >
      {/* Visual Header / Banner */}
      <div id={`show-card-${show.id}-banner`} className="relative h-44 w-full overflow-hidden">
        {isEditingImage ? (
          <div 
            className={`absolute inset-0 z-20 p-4 flex flex-col justify-center space-y-2 ${
              theme === 'dark' ? 'bg-[#0F1115]/95 text-slate-100' : 'bg-white/95 text-slate-900 border-b border-neutral-200'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <label className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              <Link className="w-3 h-3 text-blue-500" />
              Change Cover Image URL
            </label>
            <input
              type="text"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              placeholder="Paste custom image URL here..."
              className={`w-full text-xs px-2.5 py-1.5 rounded-lg border focus:outline-none focus:border-blue-500 ${
                theme === 'dark'
                  ? 'bg-[#1A1D23] text-slate-100 border-white/10 placeholder-slate-500'
                  : 'bg-neutral-50 text-slate-900 border-neutral-200 placeholder-slate-400'
              }`}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveImage();
                if (e.key === 'Escape') setIsEditingImage(false);
              }}
            />

            {/* Vertical position adjuster */}
            <div className="flex flex-col space-y-0.5 pt-1">
              <div className="flex justify-between items-center">
                <label className={`text-[9px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  Face Focus Vertical position
                </label>
                <span className="text-[10px] font-black text-blue-500">
                  {(() => {
                    const match = bannerPositionInput.match(/center\s+(\d+)%/);
                    return match ? `${match[1]}%` : '25%';
                  })()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={(() => {
                    const match = bannerPositionInput.match(/center\s+(\d+)%/);
                    return match ? parseInt(match[1]) : 25;
                  })()}
                  onChange={(e) => {
                    setBannerPositionInput(`center ${e.target.value}%`);
                  }}
                  className="w-full accent-blue-500 h-1 bg-slate-400 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="flex gap-1 justify-between text-[8px] text-slate-500 font-bold uppercase tracking-wider">
                <span>Top (0%)</span>
                <span>Faces (25%)</span>
                <span>Bottom (100%)</span>
              </div>
            </div>

            <div className="flex justify-end gap-1.5 pt-1">
              <button
                onClick={() => setIsEditingImage(false)}
                className={`px-2 py-1 text-[10px] rounded font-bold cursor-pointer transition ${
                  theme === 'dark' ? 'text-slate-400 hover:bg-[#262A33]' : 'text-slate-600 hover:bg-neutral-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveImage()}
                className="px-2.5 py-1 text-[10px] bg-blue-600 text-white rounded font-bold hover:bg-blue-500 transition-colors cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        ) : null}



        {getShowBannerImage(show) ? (
          <img 
            src={getShowBannerImage(show)} 
            alt={show.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            style={{ objectPosition: show.bannerPosition || 'center 25%' }}
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=1280&auto=format&fit=crop';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neutral-850 to-neutral-900 flex items-center justify-center">
            <Tv className="w-12 h-12 text-slate-600" />
          </div>
        )}
        
        {/* Gradients to blend content */}
        <div className={`absolute inset-0 bg-gradient-to-t ${
          theme === 'dark' ? 'from-[#0F1115] via-[#0F1115]/40 to-transparent' : 'from-slate-950/85 via-slate-950/40 to-transparent'
        }`} />
        <div className={`absolute inset-0 bg-gradient-to-r ${
          theme === 'dark' ? 'from-[#0F1115]/70 to-transparent' : 'from-slate-950/60 to-transparent'
        }`} />

        {/* Streaming Badge */}
        <div className="absolute top-4 left-4 z-20 group/badge">
          <div className="relative">
            <span className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-colors flex items-center gap-1.5 ${colors.bg} ${colors.text} ${colors.border}`}>
              <span 
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  (subscribedServices?.includes(show.streamingService) ?? false)
                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' 
                    : 'bg-slate-500'
                }`} 
              />
              <span>{show.streamingService}</span>
            </span>

            {/* Subscribe Tooltip Popover - purely CSS-driven to prevent React re-render flickering */}
            {!(subscribedServices?.includes(show.streamingService) ?? false) && (
              <div 
                className="absolute left-0 top-full mt-2 w-56 p-3 bg-[#1A1D23] border border-white/10 rounded-2xl shadow-xl z-50 text-left opacity-0 pointer-events-none group-hover/badge:opacity-100 group-hover/badge:pointer-events-auto transition-opacity duration-150"
              >
                <p className="text-[11px] text-slate-300 font-medium mb-2 leading-normal">
                  You aren't subscribed to <span className="text-white font-extrabold">{show.streamingService}</span>. Would you like to subscribe?
                </p>
                <div className="flex gap-1.5">
                  <a
                    href={REGISTRATION_LINKS[show.streamingService] || 'https://www.google.com'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1 px-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-lg text-center transition-colors cursor-pointer"
                  >
                    Yes
                  </a>
                  <button
                    type="button"
                    className="flex-1 py-1 px-2 bg-[#252932] hover:bg-[#313642] text-slate-400 hover:text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    No
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scores and actions overlay */}
        <div className="absolute top-4 right-4 z-20 flex gap-2 md:gap-1.5 items-center">
          {showDeleteConfirm ? (
            <div 
              className="flex items-center gap-1.5 bg-[#0F1115]/95 border border-rose-500/40 p-1.5 rounded-xl shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 select-none"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-[10px] font-black uppercase text-rose-400 px-1.5 tracking-wider">Delete?</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteShow(show.id);
                  setShowDeleteConfirm(false);
                }}
                className="px-2 py-1 text-[10px] font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition cursor-pointer"
              >
                Yes
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                }}
                className="px-2 py-1 text-[10px] font-bold rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition cursor-pointer"
              >
                No
              </button>
            </div>
          ) : (
            <>
              {/* Quick Play Link */}
              <a
                href={getStreamingServiceLink(show.streamingService, show.title)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className={`p-2 md:p-1 rounded-lg border transition-colors duration-150 cursor-pointer flex items-center justify-center min-w-[34px] min-h-[34px] md:min-w-0 md:min-h-0 ${
                  theme === 'dark'
                    ? 'border-white/5 bg-[#0F1115] text-slate-400 hover:text-white'
                    : 'border-slate-200 bg-white/90 text-slate-700 hover:text-slate-950 shadow-sm backdrop-blur-sm'
                }`}
                title={`Watch ${show.title} on ${show.streamingService}`}
              >
                <Play className="w-4.5 h-4.5 md:w-3 md:h-3 fill-current" />
              </a>

              {!isFriendView && (
                <>
                  {/* Edit Image URL Button - Only show for Julio/admin */}
                  {currentUser?.email?.trim().toLowerCase() === 'juliozaldivar@gmail.com' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageUrlInput(show.bannerImage || '');
                        setBannerPositionInput(show.bannerPosition || 'center 25%');
                        setIsEditingImage(true);
                        handleInteractionClick();
                      }}
                      className={`p-2 md:p-1 rounded-lg border transition-colors duration-150 cursor-pointer flex items-center justify-center min-w-[34px] min-h-[34px] md:min-w-0 md:min-h-0 ${
                        theme === 'dark'
                          ? 'border-white/5 bg-[#0F1115] text-slate-400 hover:text-white'
                          : 'border-slate-200 bg-white/90 text-slate-700 hover:text-slate-950 shadow-sm backdrop-blur-sm'
                      }`}
                      title="Change Show Cover Image"
                    >
                      <Image className="w-4.5 h-4.5 md:w-3 md:h-3" />
                    </button>
                  )}

                  {/* 9:16 Social Story Card Generator Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenStoryCard) onOpenStoryCard(show, 'manual');
                    }}
                    className={`p-2 md:p-1 rounded-lg border transition-colors duration-150 cursor-pointer flex items-center justify-center min-w-[34px] min-h-[34px] md:min-w-0 md:min-h-0 ${
                      theme === 'dark'
                        ? 'border-white/5 bg-[#0F1115] text-slate-400 hover:text-white'
                        : 'border-slate-200 bg-white/90 text-slate-700 hover:text-slate-950 shadow-sm backdrop-blur-sm'
                    }`}
                    title="Generate 9:16 Story Card for Social Stories"
                  >
                    <Share2 className="w-4.5 h-4.5 md:w-3 md:h-3" />
                  </button>

                  {/* Share / Notify Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShareMessage('');
                      setSharingStates({});
                      setIsSharing(true);
                      handleInteractionClick();
                    }}
                    className={`p-2 md:p-1 rounded-lg border transition-colors duration-150 cursor-pointer flex items-center justify-center min-w-[34px] min-h-[34px] md:min-w-0 md:min-h-0 ${
                      theme === 'dark'
                        ? 'border-white/5 bg-[#0F1115] text-slate-400 hover:text-white'
                        : 'border-slate-200 bg-white/90 text-slate-700 hover:text-slate-950 shadow-sm backdrop-blur-sm'
                    }`}
                    title="Share show with other CouchTaterz"
                  >
                    <Send className="w-4.5 h-4.5 md:w-3 md:h-3" />
                  </button>

                  {/* Instant Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(true);
                    }}
                    className={`p-2 md:p-1.5 rounded-lg border transition-colors duration-150 cursor-pointer min-w-[34px] min-h-[34px] md:min-w-0 md:min-h-0 flex items-center justify-center ${
                      theme === 'dark'
                        ? 'bg-[#0F1115] hover:bg-rose-600/35 text-slate-400 hover:text-rose-400 border-white/5'
                        : 'bg-white/90 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border-slate-200 shadow-sm backdrop-blur-sm'
                    }`}
                    title="Delete Show"
                  >
                    <Trash2 className="w-4.5 h-4.5 md:w-3 md:h-3" />
                  </button>
                </>
              )}
            </>
          )}
        </div>

        {/* Title and Genres overlay at bottom of banner */}
        <div className="absolute bottom-3 left-4 right-4 z-10">
          <h3 className="text-xl font-bold text-white tracking-tight leading-tight mb-1.5 drop-shadow-md truncate flex items-center flex-wrap gap-1.5">
            <span>{show.title}</span>
            {ownerNames && ownerNames.length > 0 ? (
              ownerNames.map((name, idx) => (
                <span key={`${name}-${idx}`} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-purple-500/30 text-purple-200 border border-purple-500/40 backdrop-blur-sm shadow-sm select-none">
                  {name}
                </span>
              ))
            ) : ownerName ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-purple-500/30 text-purple-200 border border-purple-500/40 backdrop-blur-sm shadow-sm select-none">
                {ownerName}
              </span>
            ) : null}
          </h3>
          <div className="flex flex-nowrap gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
            {getNormalizedGenres(show).map((g, gIdx) => (
              <span key={`${g}-${gIdx}`} className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded border shrink-0 ${
                theme === 'dark'
                  ? 'text-slate-300 bg-[#0F1115]/85 border-white/5'
                  : 'text-white bg-slate-900/80 border-slate-700/50 shadow-sm backdrop-blur-sm'
              }`}>
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Share / Recommendations Sliding Drawer */}
      <AnimatePresence>
        {isSharing && (
          <motion.div
            key={`share-drawer-${show.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 28 }}
            className={`overflow-hidden border-b ${
              theme === 'dark' ? 'bg-[#111319] border-white/5' : 'bg-white border-slate-300/80 shadow-sm'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500/10 rounded-lg">
                    <Send className="w-4 h-4 text-amber-500" />
                  </div>
                  <span className={`text-xs font-black uppercase tracking-wider ${
                    theme === 'dark' ? 'text-slate-200' : 'text-slate-900'
                  }`}>
                    Share with other CouchTaterz
                  </span>
                </div>
                <button
                  onClick={() => setIsSharing(false)}
                  className={`p-1 rounded-lg cursor-pointer transition ${
                    theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Share message input */}
              <div className="space-y-1.5">
                <label className={`text-[10px] font-black uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-700'
                }`}>
                  Add a Personal Note
                </label>
                <textarea
                  rows={3}
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  placeholder="Why should other CouchTaterz watch this? Recommend your favorite episodes or write an encouraging note..."
                  className={`w-full text-xs px-3 py-2.5 rounded-xl border focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 resize-none leading-relaxed transition-all ${
                    theme === 'dark' 
                      ? 'bg-[#181B22] text-slate-100 border-white/10 placeholder-slate-500' 
                      : 'bg-slate-50 text-slate-900 border-slate-300 placeholder-slate-400 shadow-inner'
                  }`}
                />
              </div>

              {/* Select User list */}
              <div className="space-y-1.5">
                <label className={`text-[10px] font-black uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-700'
                }`}>
                  Select CouchTaterz to Notify
                </label>
                <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {notifyTargetUsers.length > 0 ? (
                    notifyTargetUsers
                      .map((user, uIdx) => (
                        <button
                          key={`${user.id}-${uIdx}`}
                          onClick={() => handleSendShare(user.id)}
                          disabled={sharingStates[user.id] === 'sending' || sharingStates[user.id] === 'sent'}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all duration-200 ${
                            sharingStates[user.id] === 'sent'
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              : theme === 'dark'
                                ? 'bg-[#181B22] hover:bg-[#202530] border-white/5 text-slate-200 hover:text-white cursor-pointer active:scale-[0.99]'
                                : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800 hover:text-slate-950 cursor-pointer shadow-2xs active:scale-[0.99]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={user.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.name}`}
                              alt={user.name}
                              className="w-6 h-6 rounded-full border border-slate-300 dark:border-white/10 bg-[#0F1115]"
                            />
                            <span className="font-semibold">{user.name}</span>
                          </div>
                          <span className="text-[10px] uppercase font-black tracking-widest flex items-center gap-1.5">
                            {sharingStates[user.id] === 'sending' ? (
                              'Sending...'
                            ) : sharingStates[user.id] === 'sent' ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                Sent!
                              </>
                            ) : (
                              <>
                                <Send className="w-3 h-3 text-amber-500" />
                                Send
                              </>
                            )}
                          </span>
                        </button>
                      ))
                  ) : (
                    <p className={`text-xs text-center py-6 rounded-xl border border-dashed ${
                      theme === 'dark' ? 'text-slate-500 bg-[#181B22]/50 border-white/5' : 'text-slate-500 bg-white/60 border-slate-300'
                    }`}>
                      No other CouchTaterz registered yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Footer action */}
              <div className={`flex justify-end pt-2 border-t ${
                theme === 'dark' ? 'border-white/5' : 'border-slate-300/80'
              }`}>
                <button
                  onClick={() => setIsSharing(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    theme === 'dark' 
                      ? 'bg-[#1C2028] text-slate-300 hover:bg-[#262C38] hover:text-white' 
                      : 'bg-slate-200 text-slate-800 hover:bg-slate-300 hover:text-slate-950'
                  }`}
                >
                  Close Share Panel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        {/* Friend View: Full-width Add to My Up Next / In Collection Action Banner */}
        {isFriendView && (
          <div className="w-full">
            {onboardingStep === 3 && onboardingHighlight && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`w-full p-3 backdrop-blur-md rounded-xl shadow-xl border border-purple-500/40 text-left flex items-start gap-2 mb-2 ${
                  theme === 'dark' ? 'bg-[#151821]/95 text-slate-200' : 'bg-white text-slate-900'
                }`}
              >
                <div className="p-1 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h6 className="text-[10px] font-black uppercase tracking-wider text-purple-400">Step 3 of 4</h6>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                    Tap <span className="text-amber-400 font-extrabold">Add to Up Next</span> to copy this show into your queue!
                  </p>
                </div>
              </motion.div>
            )}
            {isAlreadyInCollection ? (
              <div className={`w-full py-2.5 px-4 border rounded-xl text-emerald-400 text-xs font-bold flex items-center justify-center gap-2 shadow-inner ${
                theme === 'dark' ? 'bg-[#101F1C] border-emerald-500/20' : 'bg-emerald-50 border-emerald-300 text-emerald-800'
              }`}>
                <Check className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
                <span>In your collection</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onAddToMyQueue && onAddToMyQueue(show)}
                className={`w-full py-2.5 px-4 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] transition-all cursor-pointer bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 ${
                  onboardingStep === 3 && onboardingHighlight
                    ? 'ring-4 ring-purple-500/80 animate-pulse relative z-20'
                    : ''
                }`}
              >
                {onboardingStep === 3 && onboardingHighlight && (
                  <motion.span
                    animate={{ x: [-2, 2, -2] }}
                    transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
                    className="text-purple-950 font-black text-xs inline-block"
                  >
                    ➜
                  </motion.span>
                )}
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span className="tracking-wide uppercase text-[11px]">Add to Up Next</span>
              </button>
            )}
          </div>
        )}

        <div className="space-y-2">
          {shouldShowNextEpNotification && show.nextEpisode ? (
              <div className={`flex items-center gap-1.5 text-[11px] font-semibold min-w-0 w-full overflow-hidden px-2.5 py-1.5 rounded-xl border shadow-sm ${
                theme === 'dark' 
                  ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/25' 
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
              }`}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isFriendView) {
                      onUpdateShow({
                        ...show,
                        hasAirDateReminder: !show.hasAirDateReminder
                      });
                    }
                  }}
                  className={`p-1 rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                    show.hasAirDateReminder 
                      ? 'text-amber-400 bg-amber-500/20 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.35)]' 
                      : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent'
                  }`}
                  title={
                    show.hasAirDateReminder 
                      ? "Reminder active! You will get an alert the day before this episode airs." 
                      : "Click to get a text or email reminder the day before this show airs."
                  }
                >
                  <Bell className={`w-3.5 h-3.5 ${show.hasAirDateReminder ? 'fill-amber-400 text-amber-400' : 'text-slate-500'}`} />
                </button>
                <span className="shrink-0 font-bold">
                  {(() => {
                    if (!show.nextEpisode.airDate) return 'Next Episode:';
                    const dateOnly = show.nextEpisode.airDate.split('T')[0];
                    const today = getTodayDateString();
                    
                    // Local day difference
                    const parseDate = (s: string) => {
                      const parts = s.split('-');
                      if (parts.length === 3) {
                        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                      }
                      return new Date(s);
                    };
                    const dAir = parseDate(dateOnly);
                    const dToday = parseDate(today);
                    const diffDays = Math.round((dAir.getTime() - dToday.getTime()) / (1000 * 60 * 60 * 24));

                    if (diffDays === 0) return `Airing Today! (${formatAirDate(show.nextEpisode.airDate)})`;
                    if (diffDays === 1) return `Airing Tomorrow! (${formatAirDate(show.nextEpisode.airDate)})`;
                    if (diffDays > 1) return `Next Airing: ${formatAirDate(show.nextEpisode.airDate)}`;
                    return `Aired: ${formatAirDate(show.nextEpisode.airDate)}`;
                  })()}
                </span>
                <span className="text-emerald-500/40 shrink-0">•</span>
                <span className="truncate">
                  S{show.nextEpisode.season}E{show.nextEpisode.episode}
                  {show.nextEpisode.title ? ` "${show.nextEpisode.title}"` : ''}
                </span>
                {show.hasAirDateReminder && (
                  <span className="hidden lg:inline-block text-[9px] font-black uppercase tracking-wider text-amber-500 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded-full shrink-0 ml-auto">
                    Alert On
                  </span>
                )}
              </div>
            ) : isCaughtUp ? (
              <div className={`flex items-center gap-1.5 text-[11px] font-semibold min-w-0 w-full overflow-hidden px-2.5 py-1.5 rounded-xl border shadow-sm ${caughtUpStyles.pillBg}`}>
                <Sparkles className={`w-3.5 h-3.5 shrink-0 ${caughtUpStyles.icon}`} />
                <span className="shrink-0 font-bold">Caught Up!</span>
                <span className={`shrink-0 ${caughtUpStyles.dot}`}>•</span>
                <span className="truncate font-medium">
                  Season {show.latestWatched.season} complete
                </span>
              </div>
            ) : null}
            {(onboardingStep === 1 && onboardingHighlight) && (
              <div className="space-y-3 p-4 rounded-2xl border transition-all duration-300 bg-purple-950/25 border-purple-500/40 ring-2 ring-purple-500/45 shadow-lg shadow-purple-950/30 relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 backdrop-blur-md rounded-xl shadow-xl border border-purple-500/40 text-left flex items-start gap-2 ${
                    theme === 'dark' ? 'bg-[#151821]/95 text-slate-200' : 'bg-white text-slate-800'
                  }`}
                >
                  <div className="p-1 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400 shrink-0">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h6 className="text-[10px] font-black uppercase tracking-wider text-purple-400">Step 1 of 4</h6>
                    <p className="text-[11px] leading-relaxed font-medium">
                      Tap <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px] font-black uppercase shadow-sm">Watching</span> below to move this show to your active watchlist!
                    </p>
                  </div>
                </motion.div>
              </div>
            )}
            {(onboardingStep === 2 && isTargetShow) && (
              <div className={`space-y-3 p-4 rounded-2xl border transition-all duration-300 ${
                isOnboardingHighlightActive
                  ? 'bg-purple-950/25 border-purple-500/40 ring-2 ring-purple-500/45 shadow-lg shadow-purple-950/30 relative z-10' 
                  : theme === 'dark'
                    ? 'bg-[#0F1115]/50 border-white/5'
                    : 'bg-neutral-50/80 border-neutral-200'
              }`}>
                {/* Onboarding step 2 inside card body */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 backdrop-blur-md rounded-xl shadow-xl border border-purple-500/40 text-left flex items-start gap-2 ${
                    theme === 'dark' ? 'bg-[#151821]/95 text-slate-200' : 'bg-white text-slate-800'
                  }`}
                >
                  <div className="p-1 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400 shrink-0">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h6 className="text-[10px] font-black uppercase tracking-wider text-purple-400">Step 2 of 4</h6>
                    <p className="text-[11px] leading-relaxed font-medium">
                      Tap the <span className="bg-purple-600 text-white px-1.5 py-0.5 rounded text-[10px] font-black shadow-sm">+</span> button below to log your first watched episode!
                    </p>
                  </div>
                </motion.div>
              </div>
            )}

        {/* Status Segmented Controls */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 w-full">
                <div className={`flex gap-1 p-1 rounded-xl border flex-1 ${
                  theme === 'dark' ? 'bg-[#15171C] border-white/5' : 'bg-white border-slate-300/80 shadow-2xs'
                }`}>
                  {(['Watching', 'Backlog', 'Completed'] as ShowStatus[]).map((st) => {
                    const isReadOnly = isFriendView || !currentUser;
                    const isCurrent = show.status === st;
                    return (
                      <button
                        key={st}
                        onClick={() => {
                          if (isReadOnly) {
                            if (!currentUser && onRequireAuth) {
                              onRequireAuth('Sign in to CouchTaterz to update show status', () => {});
                            }
                            return;
                          }
                          handleStatusChange(st);
                        }}
                        disabled={isReadOnly && !!currentUser}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
                          isCurrent
                            ? st === 'Completed'
                              ? 'bg-emerald-600 text-white shadow-sm font-extrabold ring-1 ring-emerald-400/50'
                              : st === 'Backlog'
                                ? 'bg-amber-600 text-white shadow-sm font-extrabold ring-1 ring-amber-400/50'
                                : 'bg-blue-600 text-white shadow-sm font-extrabold ring-1 ring-blue-400/50'
                            : theme === 'dark'
                              ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                              : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/80'
                        } ${
                          isReadOnly
                            ? isCurrent
                              ? 'opacity-100 cursor-default'
                              : 'opacity-40 cursor-default'
                            : 'cursor-pointer'
                        } ${
                          onboardingStep === 1 && onboardingHighlight && st === 'Watching'
                            ? 'ring-2 ring-purple-500 text-purple-300 bg-purple-500/20 relative z-10'
                            : ''
                        }`}
                        title={
                          isReadOnly
                            ? `Status: ${show.status}${!currentUser ? ' (Click to sign in)' : ' (Read-only)'}`
                            : `Set status to ${st}`
                        }
                      >
                        {onboardingStep === 1 && onboardingHighlight && st === 'Watching' && (
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
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Unified Watched Progress Block */}
            <div className={`p-3 rounded-2xl border space-y-2.5 transition-all duration-300 ${
              onboardingStep === 2 && isTargetShow
                ? 'bg-purple-950/30 border-purple-500/70 ring-2 ring-purple-500/60 shadow-xl shadow-purple-950/40 relative z-20'
                : theme === 'dark' ? 'bg-[#15171C]/50 border-white/5' : 'bg-white border-slate-300/80 shadow-2xs'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] font-bold">
                <span className={`uppercase tracking-wider text-[10px] shrink-0 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-700 font-bold'}`}>Watched Progress</span>
                <span className={`font-extrabold shrink-0 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
                  S{show.latestWatched.season} • {show.latestWatched.episode === 0 ? 'Not Started' : `E${show.latestWatched.episode}`}{' '}
                  <span className={`font-medium text-[10px] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600 font-semibold'}`}>
                    ({maxEpisodesInSeason > 0 ? Math.min(100, Math.round((show.latestWatched.episode / maxEpisodesInSeason) * 100)) : 0}%)
                  </span>
                </span>
              </div>

              {isCaughtUp && (
                <div className={`text-[11px] font-semibold ${caughtUpStyles.text}`}>
                  Caught up on Season {show.latestWatched.season}
                </div>
              )}

              {show.latestWatched.title && (
                <div className={`text-[11px] font-medium truncate flex items-center gap-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-800 font-medium'}`}>
                  <span className={`font-extrabold text-[10px] uppercase shrink-0 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>
                    {show.latestWatched.episode === 0 ? "Status:" : "Current:"}
                  </span>
                  <span className="font-medium truncate">"{show.latestWatched.title}"</span>
                </div>
              )}

              {/* Interactive Progress Bar Track */}
              <div 
                onClick={handleProgressBarClick}
                className={`w-full h-2 rounded-full overflow-hidden border relative group ${
                  theme === 'dark' ? 'bg-[#1C1F26] border-white/5' : 'bg-slate-200 border-slate-300'
                } ${isFriendView ? 'cursor-default' : 'cursor-pointer'}`}
                title={isFriendView ? undefined : "Click progress track to set episode"}
              >
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    isCaughtUp
                      ? caughtUpStyles.bar
                      : show.status === 'Completed' 
                      ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' 
                      : show.status === 'Backlog'
                      ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                      : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]'
                  }`}
                  style={{ width: `${maxEpisodesInSeason > 0 ? Math.min(100, Math.round((show.latestWatched.episode / maxEpisodesInSeason) * 100)) : 0}%` }}
                />
              </div>

              {/* Stepper / Friend Watch Sync Toolbar */}
              {!isFriendView ? (
                <div className={`flex items-center justify-between pt-1 text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-slate-900 font-bold'}`}>
                  {/* Episode Stepper */}
                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] uppercase font-extrabold mr-0.5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>Ep:</span>
                    <button 
                      onClick={handleDecrementEpisode}
                      disabled={show.latestWatched.episode <= 0}
                      className={`p-1 rounded-md transition disabled:opacity-20 cursor-pointer ${
                        theme === 'dark' ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-700 hover:text-slate-950 bg-slate-200/50'
                      }`}
                      title="Decrement Episode"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-extrabold text-xs min-w-[28px] text-center">
                      E{show.latestWatched.episode}
                    </span>
                    <button 
                      onClick={handleIncrementEpisode}
                      disabled={show.latestWatched.episode >= maxEpisodesInSeason}
                      className={`p-1 rounded-md transition disabled:opacity-20 cursor-pointer ${
                        onboardingStep === 2 && isTargetShow 
                          ? 'ring-4 ring-purple-400 bg-purple-600 text-white animate-bounce shadow-lg shadow-purple-500/60 scale-125 z-30 font-black' 
                          : theme === 'dark' 
                          ? 'hover:bg-white/10' 
                          : 'hover:bg-slate-200 bg-slate-200/50'
                      }`}
                      title="Increment Episode"
                    >
                      <Plus className={`w-3.5 h-3.5 stroke-[2.5] ${
                        show.status === 'Watching'
                          ? 'text-blue-500 dark:text-blue-400'
                          : show.status === 'Backlog'
                          ? 'text-amber-500 dark:text-amber-400'
                          : 'text-emerald-500 dark:text-emerald-400'
                      }`} />
                    </button>
                  </div>

                  <div className={`w-[1px] h-3.5 ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-300'}`} />

                  {/* Season Stepper */}
                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] uppercase font-extrabold mr-0.5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>Season:</span>
                    <button 
                      onClick={handleDecrementSeason}
                      disabled={show.latestWatched.season <= 1}
                      className={`p-1 rounded-md transition disabled:opacity-20 cursor-pointer ${
                        theme === 'dark' ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-700 hover:text-slate-950 bg-slate-200/50'
                      }`}
                      title="Decrement Season"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-extrabold text-xs min-w-[28px] text-center">
                      S{show.latestWatched.season}
                    </span>
                    <button 
                      onClick={handleIncrementSeason}
                      disabled={show.latestWatched.season >= maxSeasons}
                      className={`p-1 rounded-md transition disabled:opacity-20 cursor-pointer ${
                        theme === 'dark' ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-700 hover:text-slate-950 bg-slate-200/50'
                      }`}
                      title="Increment Season"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Friend View: Clear progress status & watch sync comparison */
                <div className={`p-2 rounded-xl border flex flex-wrap items-center justify-between gap-1.5 text-xs ${
                  theme === 'dark' ? 'bg-[#151821] border-white/10' : 'bg-slate-100 border-slate-300'
                }`}>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-black uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                      {ownerName || 'Friend'}'s Spot:
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[11px] font-black ${
                      show.status === 'Completed'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : show.status === 'Backlog'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      S{show.latestWatched.season}E{show.latestWatched.episode}
                    </span>
                    <span className={`text-[10px] font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                      ({show.latestWatched.episode}/{maxEpisodesInSeason} eps)
                    </span>
                  </div>

                  {/* Sync status with visitor */}
                  {(() => {
                    const myShow = currentUserShows?.find(s => s.title.toLowerCase().trim() === show.title.toLowerCase().trim());
                    if (!myShow) return null;

                    const friendS = show.latestWatched.season;
                    const friendE = show.latestWatched.episode;
                    const myS = myShow.latestWatched?.season || 1;
                    const myE = myShow.latestWatched?.episode || 0;

                    const isSynced = friendS === myS && friendE === myE;
                    const isFriendAhead = friendS > myS || (friendS === myS && friendE > myE);

                    return (
                      <div className="flex items-center gap-1 text-[10px] font-bold">
                        <span className="text-slate-400">You: S{myS}E{myE}</span>
                        <span className="text-slate-600">·</span>
                        {isSynced ? (
                          <span className="text-emerald-400 font-extrabold">🍿 Synced!</span>
                        ) : isFriendAhead ? (
                          <span className="text-amber-400 font-extrabold">{ownerName || 'Friend'} ahead</span>
                        ) : (
                          <span className="text-blue-400 font-extrabold">You're ahead</span>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Episode Review & Watercooler Action Row */}
              <div className={`pt-2.5 border-t ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'} space-y-2`}>
                <div className="flex items-center justify-between gap-2">
                  {isEpisodeReviewEligible ? (
                    <button
                      type="button"
                      onClick={() => setIsEpReviewOpen(!isEpReviewOpen)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer text-left group min-w-0 ${
                        isEpReviewOpen 
                          ? 'bg-amber-500/25 border-amber-500/40 text-amber-300 shadow-sm' 
                          : currentEpReview
                          ? theme === 'dark'
                            ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/25 text-amber-300'
                            : 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900'
                          : theme === 'dark'
                          ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                          : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-[11px] font-extrabold uppercase tracking-wide truncate">
                        {isFriendView 
                          ? `${ownerName || 'Friend'}'s S${show.latestWatched.season}E${show.latestWatched.episode}` 
                          : currentEpReview 
                          ? `S${show.latestWatched.season}E${show.latestWatched.episode} Take` 
                          : `+ S${show.latestWatched.season}E${show.latestWatched.episode} Take`}
                      </span>
                      {isVip && (
                        <span className="flex items-center gap-0.5 px-1 py-0.2 rounded text-[8.5px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                          <Crown className="w-2.5 h-2.5" /> VIP
                        </span>
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 min-w-0">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-500/70 shrink-0" />
                      <span className="truncate">
                        {isFriendView
                          ? `${ownerName || 'Friend'} hasn't started yet`
                          : 'Watch Ep 1 to log take'}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* View all logged episode reviews button */}
                    <button
                      type="button"
                      onClick={() => setShowAllEpisodeReviewsDrawer(!showAllEpisodeReviewsDrawer)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                        showAllEpisodeReviewsDrawer
                          ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                          : theme === 'dark'
                          ? 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                      }`}
                      title="View all logged episode reviews for this show in the Watercooler Log"
                    >
                      <Quote className="w-3 h-3 text-blue-400" />
                      <span>Takes ({allLoggedReviews.length})</span>
                    </button>

                    {isEpisodeReviewEligible && onOpenStoryCard && isVip && (
                      <button
                        type="button"
                        onClick={() => {
                          if (!isEpReviewOpen) setIsEpReviewOpen(true);
                          onOpenStoryCard(show, 'manual');
                        }}
                        className="flex items-center justify-center p-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-[11px] font-extrabold transition-all cursor-pointer shadow-2xs shrink-0"
                        title="Share this episode review on 9:16 Social Story Card (VIP Feature)"
                      >
                        <Share2 className="w-3.5 h-3.5 text-purple-300" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Collapsed Episode Review Quote Preview Banner */}
                {isEpisodeReviewEligible && currentEpReview && !isEpReviewOpen && (
                  <div 
                    onClick={() => setIsEpReviewOpen(true)}
                    className={`w-full p-2.5 rounded-xl border transition-all cursor-pointer group flex items-start gap-2 ${
                      theme === 'dark'
                        ? 'bg-amber-500/[0.08] hover:bg-amber-500/[0.14] border-amber-500/20 text-amber-100'
                        : 'bg-amber-50/90 hover:bg-amber-100/90 border-amber-200 text-amber-950'
                    }`}
                  >
                    <Quote className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs italic font-medium line-clamp-2 leading-relaxed flex-1">
                      "{currentEpReview}"
                    </p>
                    <span className="text-[10px] uppercase font-bold text-amber-400/90 group-hover:text-amber-300 group-hover:underline shrink-0 self-center">
                      {isFriendView ? 'View' : 'Edit'}
                    </span>
                  </div>
                )}

                {/* All Episode Reviews Accordion / Watercooler Drawer */}
                <AnimatePresence>
                  {showAllEpisodeReviewsDrawer && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`overflow-hidden rounded-xl border p-3 space-y-2.5 text-xs ${
                        theme === 'dark' ? 'bg-[#12141A] border-blue-500/25 shadow-lg' : 'bg-blue-50/80 border-blue-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between border-b pb-2 border-white/10">
                        <div className="flex items-center gap-1.5">
                          <Quote className="w-3.5 h-3.5 text-blue-400" />
                          <span className={`text-xs font-black uppercase tracking-wider ${
                            theme === 'dark' ? 'text-blue-300' : 'text-blue-900'
                          }`}>
                            Episode Watercooler Log
                          </span>
                        </div>
                        <span className="text-[10.5px] font-bold text-blue-400/90 font-mono">
                          {allLoggedReviews.length} {allLoggedReviews.length === 1 ? 'take' : 'takes'} logged
                        </span>
                      </div>

                      {allLoggedReviews.length > 0 ? (
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                          {allLoggedReviews.map((rev) => {
                            // Check visitor's watched status to smart-mask spoilers
                            const myShow = currentUserShows?.find(s => s.title.toLowerCase().trim() === show.title.toLowerCase().trim());
                            const mySeason = myShow?.latestWatched?.season ?? (isFriendView ? 0 : show.latestWatched.season);
                            const myEpisode = myShow?.latestWatched?.episode ?? (isFriendView ? 0 : show.latestWatched.episode);

                            const isVisitorCaughtUp = !isFriendView || (!myShow ? true : (rev.season < mySeason || (rev.season === mySeason && rev.episode <= myEpisode)));
                            const isSpoilerMasked = isFriendView && myShow && !isVisitorCaughtUp && !unmaskedSpoilers[rev.key];

                            return (
                              <div 
                                key={rev.key}
                                className={`p-2.5 sm:p-3 rounded-xl border transition-all space-y-1.5 ${
                                  theme === 'dark' 
                                    ? 'bg-[#181B22] border-white/10 hover:border-white/15' 
                                    : 'bg-white border-slate-200 shadow-sm'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`px-2 py-0.5 text-[10px] font-black rounded-md ${
                                      rev.key === currentEpKey
                                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                        : 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
                                    }`}>
                                      {rev.key}
                                    </span>
                                    {rev.key === currentEpKey && (
                                      <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                                        {isFriendView ? `${ownerName || 'Friend'}'s Latest` : 'Latest Watched'}
                                      </span>
                                    )}
                                  </div>

                                  {isFriendView && myShow && !isVisitorCaughtUp && (
                                    <button
                                      type="button"
                                      onClick={() => toggleSpoilerReveal(rev.key)}
                                      className="flex items-center gap-1 text-[10px] font-bold text-amber-400 hover:text-amber-300 cursor-pointer px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20"
                                    >
                                      {isSpoilerMasked ? (
                                        <>
                                          <Eye className="w-3 h-3" />
                                          <span>Reveal</span>
                                        </>
                                      ) : (
                                        <>
                                          <EyeOff className="w-3 h-3 text-slate-400" />
                                          <span className="text-slate-400">Hide</span>
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>

                                {isSpoilerMasked ? (
                                  <div 
                                    onClick={() => toggleSpoilerReveal(rev.key)}
                                    className={`p-2.5 rounded-lg border border-dashed text-center cursor-pointer transition select-none ${
                                      theme === 'dark' 
                                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-200 hover:bg-amber-500/15' 
                                        : 'bg-amber-100/60 border-amber-300 text-amber-950 hover:bg-amber-100'
                                    }`}
                                  >
                                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
                                      <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                                      <span>Spoiler Shield: You're on S{mySeason}E{myEpisode}</span>
                                    </div>
                                    <span className="text-[10px] opacity-80 underline block mt-1 font-semibold">
                                      Tap to reveal {ownerName || 'friend'}'s review
                                    </span>
                                  </div>
                                ) : (
                                  <p className={`italic text-xs sm:text-[13px] leading-relaxed break-words font-medium ${
                                    theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                                  }`}>
                                    "{rev.review}"
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-4 px-3 rounded-lg border border-dashed border-white/10 space-y-1.5">
                          <p className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                            No episode reviews logged for this show yet.
                          </p>
                          {!isFriendView && (
                            <p className="text-[11px] text-amber-400 font-bold">
                              Click "+ S{show.latestWatched.season}E{show.latestWatched.episode} Review" above to log your first reaction!
                            </p>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Episode Review Input / Friend Take Inspection Drawer */}
                <AnimatePresence>
                  {isEpReviewOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden space-y-2.5 pt-1"
                    >
                      {isFriendView ? (
                        /* Read-only inspection of Friend's Take */
                        <div className={`p-3.5 rounded-xl border space-y-2.5 ${
                          theme === 'dark' ? 'bg-[#181A22] border-amber-500/30 shadow-md' : 'bg-amber-50/90 border-amber-300 shadow-sm'
                        }`}>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <MessageSquare className="w-4 h-4 text-amber-400" />
                              <span className="text-xs font-extrabold text-amber-400">
                                {ownerName || 'Friend'}'s S{show.latestWatched.season}E{show.latestWatched.episode} Take
                              </span>
                            </div>
                            {isVip && (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[9.5px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                <Crown className="w-3 h-3" /> VIP Take
                              </span>
                            )}
                          </div>

                          {currentEpReview ? (
                            <p className={`text-xs sm:text-sm italic leading-relaxed break-words font-medium ${
                              theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                            }`}>
                              "{currentEpReview}"
                            </p>
                          ) : (
                            <p className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                              {ownerName || 'Friend'} hasn't logged a written take for S{show.latestWatched.season}E{show.latestWatched.episode} yet.
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                            <span className="text-slate-400">
                              {allLoggedReviews.length > 0
                                ? `${allLoggedReviews.length} total episode ${allLoggedReviews.length === 1 ? 'take' : 'takes'} logged`
                                : 'No other episode reviews yet'}
                            </span>
                            {allLoggedReviews.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setShowAllEpisodeReviewsDrawer(true)}
                                className="text-amber-400 hover:text-amber-300 font-extrabold flex items-center gap-1 cursor-pointer"
                              >
                                <span>Browse All Takes ({allLoggedReviews.length}) →</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* Owner Edit Drawer */
                        <div className={`p-3 rounded-xl border space-y-2.5 ${
                          theme === 'dark' ? 'bg-[#151720] border-amber-500/30' : 'bg-amber-50/50 border-amber-200'
                        }`}>
                          {/* Quick Reaction Starters */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[10px] font-extrabold uppercase mr-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                              Quick Tags:
                            </span>
                            {[
                              '🤯 Cliffhanger twist!',
                              '🔥 Best episode yet',
                              '😭 Emotional ending',
                              '😴 Slow pacing',
                              '🍿 Peak cinema'
                            ].map((chip) => (
                              <button
                                key={chip}
                                type="button"
                                onClick={() => {
                                  const newText = epReviewInput ? `${epReviewInput} ${chip}` : chip;
                                  setEpReviewInput(newText.slice(0, 280));
                                }}
                                className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                                  theme === 'dark'
                                    ? 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-200'
                                    : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-800 shadow-2xs'
                                }`}
                              >
                                {chip}
                              </button>
                            ))}
                          </div>

                          <textarea
                            rows={3}
                            value={epReviewInput}
                            onChange={(e) => {
                              setEpReviewInput(e.target.value.slice(0, 280));
                            }}
                            onBlur={() => {
                              if (epReviewInput !== (show.episodeReviews?.[currentEpKey] || '')) {
                                handleSaveEpReview(epReviewInput);
                              }
                            }}
                            placeholder={`Write your take for S${show.latestWatched.season}E${show.latestWatched.episode}... (e.g. "Loved the plot twist in the final scene!")`}
                            className={`w-full text-xs sm:text-sm p-3 rounded-xl border transition-all resize-none focus:outline-none focus:ring-2 leading-relaxed ${
                              theme === 'dark'
                                ? 'bg-[#1C1F2B] border-amber-500/30 text-slate-100 placeholder-slate-500 focus:border-amber-400 focus:ring-amber-500/20'
                                : 'bg-white border-amber-300 text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:ring-amber-500/20'
                            }`}
                          />
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2">
                              <span className={`text-[11px] font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                                Reviewing S{show.latestWatched.season}E{show.latestWatched.episode}
                              </span>
                              {epReviewSavedFeedback && (
                                <span className="flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                                  <Check className="w-3 h-3 stroke-[3]" /> Saved!
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`font-mono text-[11px] ${epReviewInput.length >= 260 ? 'text-amber-400 font-bold' : theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                                {epReviewInput.length}/280
                              </span>
                              {(epReviewInput.length > 0 || !!show.episodeReviews?.[currentEpKey]) && (
                                <button
                                  type="button"
                                  onClick={() => handleClearEpReview()}
                                  className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 border border-rose-500/25 font-bold transition-all text-xs cursor-pointer"
                                  title="Clear this episode review"
                                >
                                  Clear
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleSaveEpReview(epReviewInput)}
                                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold transition-all text-xs cursor-pointer shadow-sm"
                              >
                                Save Review
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

        {/* User Ratings & Review Notes Block */}
        <div className="space-y-2">
          {/* Rating Scores Integrated Section */}
          <div className={`flex flex-wrap items-center justify-between p-2.5 rounded-xl border text-xs gap-2 ${
            theme === 'dark' ? 'bg-[#15171C]/50 border-white/5' : 'bg-white border-slate-300/80 shadow-2xs'
          }`}>
            {/* Rotten Tomatoes score */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`text-[10px] font-bold uppercase ${theme === 'dark' ? 'text-slate-400' : 'text-slate-700'}`}>RT:</span>
              <span className="text-xs font-black text-rose-500">
                {show.rottenTomatoesScore != null ? `${show.rottenTomatoesScore}%` : 'TBD'}
              </span>
            </div>

            {/* User score */}
            <div className="flex items-center gap-1 shrink-0 flex-wrap relative">
              <span className={`text-[10px] font-bold uppercase shrink-0 mr-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-700'}`}>{isFriendView ? "Friend:" : "You:"}</span>
              
              {showResetRatingConfirm ? (
                <div 
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded-xl border text-[10px] shadow-sm animate-in fade-in zoom-in-95 duration-150 select-none ${
                    theme === 'dark' ? 'bg-[#111319] border-amber-500/40 text-slate-200' : 'bg-amber-50 border-amber-300 text-slate-800'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="font-bold text-amber-500 uppercase tracking-wider text-[10px]">Reset rating?</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleScoreChange(null);
                      setShowResetRatingConfirm(false);
                    }}
                    className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-amber-500 hover:bg-amber-400 text-slate-950 transition cursor-pointer"
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowResetRatingConfirm(false);
                    }}
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded transition cursor-pointer ${
                      theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-slate-300' : 'bg-neutral-200 hover:bg-neutral-300 text-slate-700'
                    }`}
                  >
                    No
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-0.5 shrink-0">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                      <button
                        key={star}
                        type="button"
                        disabled={isFriendView}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (show.userScore === star) {
                            setShowResetRatingConfirm(true);
                          } else {
                            setShowResetRatingConfirm(false);
                            handleScoreChange(star);
                          }
                        }}
                        className={`transition-all p-px text-amber-400 ${isFriendView ? "cursor-default" : "cursor-pointer hover:scale-125"}`}
                        style={{ color: star <= (show.userScore || 0) ? '#fbbf24' : (theme === 'dark' ? '#334155' : '#cbd5e1') }}
                        title={show.userScore === star ? "Click again to reset rating" : `Rate ${star}/10`}
                      >
                        <Star className="w-2.5 h-2.5 fill-current" />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-black text-amber-500 ml-0.5">{(show.userScore || "—")}</span>
                </>
              )}
            </div>
          </div>

          {/* User Review Text / Notes */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-1">
              <span className={`text-[10px] font-extrabold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Series Review
              </span>
            </div>
            <div className={`text-xs rounded-xl p-3 border relative ${
              theme === 'dark' ? 'text-slate-300 bg-[#0F1115]/40 border-white/5' : 'text-slate-900 bg-white border-slate-300/80 shadow-2xs'
            }`}>
            {isEditingNotes && !isFriendView ? (
              <div className="space-y-2">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What's your current vibe check of this show?"
                  className={`w-full p-2.5 rounded-lg border focus:outline-none min-h-20 text-xs leading-relaxed ${
                    theme === 'dark'
                      ? 'bg-[#1A1D23] text-slate-100 border-white/10'
                      : 'bg-slate-50 text-slate-900 border-slate-300 focus:border-blue-500'
                  }`}
                />
                <div className="flex justify-end gap-1.5">
                  <button 
                    onClick={() => setIsEditingNotes(false)}
                    className={`px-2 py-1 text-[10px] rounded font-bold ${
                      theme === 'dark' ? 'text-slate-400 hover:bg-[#262A33]' : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveNotes}
                    className="px-2.5 py-1 text-[10px] bg-blue-600 text-white rounded font-bold hover:bg-blue-500 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start group/notes gap-2">
                <p className={`leading-relaxed pr-1 flex-1 whitespace-pre-wrap break-words italic ${theme === 'dark' ? 'text-slate-300' : 'text-slate-800 font-medium'}`}>
                  {show.userNotes || (isFriendView ? "No review thoughts added by friend yet." : "No review thoughts added yet. Hit edit to log a review!")}
                </p>
                {!isFriendView && (
                  <button 
                    onClick={() => {
                      setIsEditingNotes(true);
                      handleInteractionClick();
                    }}
                    className={`p-2 opacity-100 md:opacity-0 md:group-hover/notes:opacity-100 rounded-xl transition-all min-w-[32px] min-h-[32px] flex items-center justify-center shrink-0 cursor-pointer ${
                      theme === 'dark'
                        ? 'text-slate-400 hover:text-white bg-white/5 md:bg-transparent hover:bg-white/10 md:hover:bg-transparent'
                        : 'text-slate-600 hover:text-slate-950 bg-slate-100 md:bg-transparent hover:bg-slate-200 md:hover:bg-transparent'
                    }`}
                    title="Edit Notes"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

          {/* Family / Buddy Details Section ("Who's Watching What") */}
          {familyDetails && familyDetails.length > 0 && (
            <div className={`space-y-2.5 p-4 rounded-2xl border ${
              theme === 'dark' ? 'bg-[#0F1115]/50 border-purple-500/10' : 'bg-purple-50/80 border-purple-200 shadow-2xs'
            }`}>
              <span className={`text-[10px] font-extrabold uppercase tracking-widest block mb-1 ${
                theme === 'dark' ? 'text-purple-300' : 'text-purple-800'
              }`}>
                Who's Watching What ({familyDetails.length})
              </span>
              <div className={`divide-y space-y-2.5 ${theme === 'dark' ? 'divide-white/5' : 'divide-purple-200/50'}`}>
                {familyDetails.map((detail, idx) => (
                  <div key={`${detail.ownerName}-${idx}`} className="pt-2.5 first:pt-0 flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-extrabold ${theme === 'dark' ? 'text-purple-200' : 'text-purple-950'}`}>{detail.ownerName}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                          detail.status === 'Completed'
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                            : detail.status === 'Backlog'
                            ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                            : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                        }`}>
                          {detail.status === 'Watching' ? 'Watching' : detail.status === 'Backlog' ? 'Up Next' : detail.status === 'Completed' ? 'Watched' : detail.status}
                        </span>
                        <span className={`font-semibold text-[10px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-700'}`}>S{detail.latestWatched.season}E{detail.latestWatched.episode}</span>
                      </div>
                    </div>
                    {detail.userScore && (
                      <div className="flex items-center gap-1 text-[11px] text-amber-500">
                        <span className="opacity-75">Score:</span>
                        <span className="font-bold">{detail.userScore}/10</span>
                      </div>
                    )}
                    {detail.userNotes && (
                      <p className={`text-[11px] italic leading-relaxed pl-2 border-l mt-0.5 whitespace-pre-wrap break-words ${
                        theme === 'dark' ? 'text-slate-300 border-purple-500/20' : 'text-slate-800 border-purple-300 font-medium'
                      }`}>
                        "{detail.userNotes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Collapsible Meta Data Section: Details or Direct AI Action */}
        <div className={`border-t pt-2.5 ${theme === 'dark' ? 'border-white/5' : 'border-slate-300/80'}`}>
          {onOpenTaterzAiRecap ? (
            <div className="flex items-center gap-2 w-full">
              {(() => {
                let aiLabel = "Catch Up with AskTaterz";
                let AiIcon = Bot;
                let aiTooltip = `Catch up on S${show.latestWatched?.season || 1}E${show.latestWatched?.episode || 1} of ${show.title} with zero-spoiler AskTaterz recap`;

                if (show.status === 'Backlog') {
                  aiLabel = "Season Update";
                  AiIcon = Sparkles;
                  aiTooltip = `Get a zero-spoiler season update & premise briefing for ${show.title} before you watch`;
                } else if (show.status === 'Completed') {
                  aiLabel = "Series Refresher";
                  AiIcon = RotateCcw;
                  aiTooltip = `Get a complete series refresher & finale breakdown for ${show.title}`;
                }

                return (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInteractionClick();
                      onOpenTaterzAiRecap(show);
                    }}
                    className={`flex-1 min-w-0 flex items-center justify-start gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer group/aibtn ${
                      theme === 'dark'
                        ? 'bg-[#242832] hover:bg-[#2C313E] text-amber-300 border border-amber-500/35 hover:border-amber-400/70 shadow-sm'
                        : 'bg-[#E2E5EA] hover:bg-[#D5D9E2] text-amber-900 border border-amber-500/40 hover:border-amber-600/70 shadow-sm'
                    }`}
                    title={aiTooltip}
                  >
                    <AiIcon className={`w-4 h-4 shrink-0 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-700'}`} />
                    <span className="truncate">{aiLabel}</span>
                  </button>
                );
              })()}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                  handleInteractionClick();
                }}
                className={`px-3 py-2 rounded-xl border transition cursor-pointer flex items-center justify-center gap-1 text-xs font-bold shrink-0 ${
                  isExpanded
                    ? theme === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'bg-slate-200 border-slate-300 text-slate-900'
                    : theme === 'dark' ? 'bg-[#15171C]/60 hover:bg-[#1C1F26] border-white/10 text-slate-400 hover:text-white' : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                }`}
                title="Cast & Show Details"
              >
                <span className="text-[10px] uppercase tracking-wider font-extrabold">Details</span>
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                const nextState = !isExpanded;
                setIsExpanded(nextState);
                if (nextState) {
                  handleInteractionClick();
                }
              }}
              className={`w-full flex items-center justify-between text-xs transition px-2.5 py-1.5 rounded-xl border ${
                isExpanded
                  ? theme === 'dark' ? 'bg-white/5 border-white/10 text-slate-200' : 'bg-white border-slate-300/80 text-slate-900 font-bold shadow-2xs'
                  : theme === 'dark' 
                    ? 'bg-[#15171C]/60 hover:bg-[#1C1F26] border-white/5 text-slate-400 hover:text-white'
                    : 'bg-white hover:bg-slate-100 border-slate-300/80 text-slate-800 hover:text-slate-950 shadow-2xs'
              }`}
            >
              <span className="font-extrabold uppercase tracking-wider text-[10px]">Cast, Crew & Details</span>
              {isExpanded ? <ChevronUp className="w-4 h-4 opacity-80" /> : <ChevronDown className="w-4 h-4 opacity-60" />}
            </button>
          )}

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                key={`expanded-details-${show.id}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden space-y-3 pt-3 text-xs"
              >
                {/* Overview */}
                <div className="space-y-1">
                  <span className={`text-[10px] font-bold uppercase ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
                    {show.nextEpisode?.overview || show.nextEpisode?.summary ? "Upcoming Episode Summary" : "Overview"}
                  </span>
                  <p className={`leading-relaxed text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    {show.nextEpisode?.overview || show.nextEpisode?.summary || show.overview}
                  </p>
                </div>

                {/* Directors */}
                {show.directors && show.directors.length > 0 && (
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-[10px] font-bold uppercase ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>Creators & Showrunners</span>
                    <span className={`font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-800'}`}>{show.directors.join(', ')}</span>
                  </div>
                )}

                {/* Actors */}
                {show.actors && show.actors.length > 0 && (
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-[10px] font-bold uppercase ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>Cast</span>
                    <span className={`font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-800'}`}>{show.actors.slice(0, 4).join(', ')}</span>
                  </div>
                )}

                {/* Delete button inside expander */}
                {!isFriendView && (
                  <div className="flex justify-end pt-2">
                    {showExpanderDeleteConfirm ? (
                      <div className={`flex items-center gap-2 border px-3 py-1.5 rounded-xl shadow-md animate-in fade-in slide-in-from-right-3 duration-150 ${
                        theme === 'dark' ? 'bg-[#111319] border-rose-500/30' : 'bg-rose-50 border-rose-200'
                      }`}>
                        <span className="text-[10px] font-black uppercase text-rose-500 tracking-wider">Confirm Delete?</span>
                        <button
                          onClick={() => {
                            onDeleteShow(show.id);
                            setShowExpanderDeleteConfirm(false);
                          }}
                          className="px-2.5 py-1 text-[10px] font-black uppercase rounded bg-rose-600 hover:bg-rose-500 text-white transition cursor-pointer"
                        >
                          Yes, Delete
                        </button>
                        <button
                          onClick={() => setShowExpanderDeleteConfirm(false)}
                          className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded transition cursor-pointer ${
                            theme === 'dark' ? 'bg-white/10 hover:bg-white/15 text-slate-300' : 'bg-neutral-200 hover:bg-neutral-300 text-slate-700'
                          }`}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setShowExpanderDeleteConfirm(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition text-[11px] font-bold cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Show
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ShowMerchModal
          show={show}
          isOpen={showMerchModal}
          onClose={() => setShowMerchModal(false)}
          theme={theme}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
};

