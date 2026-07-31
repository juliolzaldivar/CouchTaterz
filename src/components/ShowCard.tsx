/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TvShow, StreamingService, ShowStatus, User, WatchedEpisode } from '../types';
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
  Award,
  ChevronDown,
  ChevronUp,
  Image,
  Link,
  Sparkles,
  Check,
  X,
  Share2,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ShowCardProps {
  show: TvShow;
  onUpdateShow: (updatedShow: TvShow) => void;
  onDeleteShow: (id: string) => void;
  isFriendView?: boolean;
  onAddToMyQueue?: (show: TvShow) => void;
  isAlreadyInCollection?: boolean;
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
  'Other': { 
    bg: 'bg-gray-900/40 hover:bg-gray-900/60', 
    text: 'text-gray-200', 
    border: 'border-gray-700/50',
    accent: 'bg-gray-600'
  }
};

export const REGISTRATION_LINKS: Record<StreamingService, string> = {
  'Netflix': 'https://www.netflix.com/signup',
  'HBO': 'https://www.max.com/',
  'Disney+': 'https://www.disneyplus.com/',
  'Prime Video': 'https://www.amazon.com/amazonprime',
  'Hulu': 'https://signup.hulu.com/',
  'Apple TV': 'https://tv.apple.com/',
  'Paramount+': 'https://www.paramountplus.com/',
  'Peacock': 'https://www.peacocktv.com/',
  'AMC+': 'https://www.amcplus.com/',
  'Other': 'https://www.google.com'
};

export const MOBILE_SCHEMES: Record<StreamingService, string> = {
  'HBO': 'https://play.max.com/',
  'Netflix': 'https://www.netflix.com/',
  'Disney+': 'https://www.disneyplus.com/',
  'Prime Video': 'https://www.amazon.com/gp/video/signin',
  'Hulu': 'https://www.hulu.com/',
  'Apple TV': 'https://tv.apple.com/',
  'Paramount+': 'https://www.paramountplus.com/',
  'Peacock': 'https://www.peacocktv.com/',
  'AMC+': 'https://www.amcplus.com/',
  'Other': 'https://www.google.com'
};

export const DESKTOP_LOGIN_LINKS: Record<StreamingService, string> = {
  'HBO': 'https://play.max.com/login',
  'Netflix': 'https://www.netflix.com/login',
  'Disney+': 'https://www.disneyplus.com/login',
  'Prime Video': 'https://www.amazon.com/gp/video/signin',
  'Hulu': 'https://www.hulu.com/signin',
  'Apple TV': 'https://tv.apple.com/signin',
  'Paramount+': 'https://www.paramountplus.com/signin/',
  'Peacock': 'https://www.peacocktv.com/signin',
  'AMC+': 'https://www.amcplus.com/login',
  'Other': 'https://www.google.com'
};

export const getStreamingServiceLink = (service: StreamingService): string => {
  if (typeof window === 'undefined') return DESKTOP_LOGIN_LINKS[service] || 'https://www.google.com';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile) {
    return MOBILE_SCHEMES[service] || DESKTOP_LOGIN_LINKS[service] || 'https://www.google.com';
  }
  return DESKTOP_LOGIN_LINKS[service] || 'https://www.google.com';
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
  theme = 'dark'
}) => {
  const [showSubscribeTooltip, setShowSubscribeTooltip] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState(show.bannerImage || '');
  const [bannerPositionInput, setBannerPositionInput] = useState(show.bannerPosition || 'center 25%');
  const [notes, setNotes] = useState(show.userNotes);
  const [customScore, setCustomScore] = useState<number>(show.userScore || 5);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExpanderDeleteConfirm, setShowExpanderDeleteConfirm] = useState(false);
  const [recapText, setRecapText] = useState<string>('');
  const [isLoadingRecap, setIsLoadingRecap] = useState<boolean>(false);
  const [fetchedRecapKey, setFetchedRecapKey] = useState<string>('');

  const [isSharing, setIsSharing] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [sharingStates, setSharingStates] = useState<Record<string, 'idle' | 'sending' | 'sent'>>({});

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
    try {
      const notification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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

  // Sync episode title when season/episode changes or if missing/generic
  useEffect(() => {
    const s = show.latestWatched.season;
    const e = show.latestWatched.episode;
    const k1 = `S${s}E${e}`;
    const k2 = `${s}-${e}`;
    const mappedTitle = show.episodes?.[k1] || show.episodes?.[k2];

    if (mappedTitle && show.latestWatched.title !== mappedTitle) {
      onUpdateShow({
        ...show,
        latestWatched: {
          ...show.latestWatched,
          title: mappedTitle
        }
      });
      return;
    }

    const currentTitle = show.latestWatched.title;
    const isGeneric = !currentTitle || currentTitle === "Episode 1" || currentTitle === `Episode ${e}`;

    if (isGeneric && !mappedTitle) {
      fetch('/api/episode-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: show.title, season: s, episode: e })
      })
        .then(res => res.json())
        .then(data => {
          if (data.title) {
            const newEpisodesMap = data.episodes ? { ...(show.episodes || {}), ...data.episodes } : show.episodes;
            const newTitle = data.title || mappedTitle || currentTitle || `Episode ${e}`;
            const titleChanged = newTitle !== currentTitle;
            const episodesAdded = data.episodes && Object.keys(newEpisodesMap).length > Object.keys(show.episodes || {}).length;

            if (titleChanged || episodesAdded) {
              onUpdateShow({
                ...show,
                episodes: newEpisodesMap,
                latestWatched: {
                  ...show.latestWatched,
                  title: newTitle
                }
              });
            }
          }
        })
        .catch(() => {});
    }
  }, [show.id, show.title, show.latestWatched.season, show.latestWatched.episode]);

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
  const isNextEpFuture = Boolean(
    show.nextEpisode && (
      !show.nextEpisode.airDate ||
      new Date(show.nextEpisode.airDate).getTime() > Date.now() ||
      show.nextEpisode.airDate >= new Date().toISOString().split('T')[0]
    )
  );

  // Maximum season that has actually aired episodes or is tracked
  const maxSeasons = Math.max(1, show.totalSeasons || 1, show.latestWatched.season);

  // Maximum episode count in the current selected season (guaranteed >= 1 and accommodates current user progress)
  const seasonEpisodeCount = (show.episodesPerSeason && show.episodesPerSeason[show.latestWatched.season - 1]) || 10;
  const maxEpisodesInSeason = Math.max(1, seasonEpisodeCount, show.latestWatched.episode);

  const getTitleForEpisode = (season: number, episode: number): string => {
    if (episode <= 0) return "Not Started";
    const k1 = `S${season}E${episode}`;
    const k2 = `${season}-${episode}`;
    return show.episodes?.[k1] || show.episodes?.[k2] || `Episode ${episode}`;
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
    if (show.latestWatched.episode >= maxEpisodesInSeason) return;
    const nextEp = show.latestWatched.episode + 1;
    const s = show.latestWatched.season;
    const isCompletedNow = Boolean(nextEp === maxEpisodesInSeason && s >= maxSeasons && show.concluded && !show.nextEpisode);
    const updated = {
      ...show,
      latestWatched: {
        ...show.latestWatched,
        episode: nextEp,
        title: getTitleForEpisode(s, nextEp)
      },
      status: isCompletedNow ? ('Completed' as ShowStatus) : show.status
    };
    onUpdateShow(updated);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFriendView) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const targetEpisode = Math.max(0, Math.min(maxEpisodesInSeason, Math.round(percentage * maxEpisodesInSeason)));
    const s = show.latestWatched.season;
    const isCompletedNow = Boolean(targetEpisode === maxEpisodesInSeason && s >= maxSeasons && show.concluded && !show.nextEpisode);
    
    const updated = {
      ...show,
      latestWatched: {
        ...show.latestWatched,
        episode: targetEpisode,
        title: getTitleForEpisode(s, targetEpisode)
      },
      status: isCompletedNow ? ('Completed' as ShowStatus) : show.status
    };
    onUpdateShow(updated);
  };

  const handleDecrementEpisode = () => {
    if (show.latestWatched.episode <= 0) return;
    const nextEp = show.latestWatched.episode - 1;
    const s = show.latestWatched.season;
    const updated = {
      ...show,
      latestWatched: {
        ...show.latestWatched,
        episode: nextEp,
        title: getTitleForEpisode(s, nextEp)
      }
    };
    onUpdateShow(updated);
  };

  const handleIncrementSeason = () => {
    if (show.latestWatched.season >= maxSeasons) return;
    const nextSeason = show.latestWatched.season + 1;
    const updated = {
      ...show,
      latestWatched: {
        season: nextSeason,
        episode: 1,
        title: getTitleForEpisode(nextSeason, 1)
      }
    };
    onUpdateShow(updated);
  };

  const handleDecrementSeason = () => {
    if (show.latestWatched.season <= 1) return;
    const prevSeason = show.latestWatched.season - 1;
    const updated = {
      ...show,
      latestWatched: {
        season: prevSeason,
        episode: 1,
        title: getTitleForEpisode(prevSeason, 1)
      }
    };
    onUpdateShow(updated);
  };

  const handleSaveNotes = () => {
    onUpdateShow({
      ...show,
      userNotes: notes,
      userScore: customScore
    });
    setIsEditingNotes(false);
  };

  const handleStatusChange = (status: ShowStatus) => {
    let updatedWatched = show.latestWatched;
    if (status === 'Completed') {
      const finalS = maxSeasons;
      let finalE = (show.episodesPerSeason && show.episodesPerSeason[finalS - 1]) || 10;
      if (isNextEpFuture && show.nextEpisode && show.nextEpisode.season === finalS) {
        finalE = Math.max(1, show.nextEpisode.episode - 1);
      }
      updatedWatched = {
        season: finalS,
        episode: finalE,
        title: getTitleForEpisode(finalS, finalE)
      };
    }
    onUpdateShow({
      ...show,
      status,
      latestWatched: updatedWatched
    });
  };

  const handleScoreChange = (score: number) => {
    setCustomScore(score);
    onUpdateShow({
      ...show,
      userScore: score
    });
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
          : 'bg-white text-slate-900 shadow-sm hover:shadow-md'
      } ${
        isOnboardingHighlightActive
          ? 'relative z-50 ring-2 sm:ring-4 ring-purple-500/80 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.6)]'
          : highlightStatusPrompt
            ? 'relative z-50 ring-2 ring-purple-500 border-purple-500 shadow-2xl shadow-purple-500/20'
            : theme === 'dark'
              ? 'relative border-white/5 hover:border-white/10'
              : 'relative border-neutral-200/90 hover:border-neutral-300'
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



        {show.bannerImage ? (
          <img 
            src={show.bannerImage} 
            alt={show.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            style={{ objectPosition: show.bannerPosition || 'center 25%' }}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neutral-850 to-neutral-900 flex items-center justify-center">
            <Tv className="w-12 h-12 text-slate-600" />
          </div>
        )}
        
        {/* Gradients to blend content */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1115] via-[#0F1115]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F1115]/70 to-transparent" />

        {/* Streaming Badge */}
        <div className="absolute top-4 left-4 z-20 group/badge">
          <div className="relative">
            <span className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-colors flex items-center gap-1.5 ${colors.bg} ${colors.text} ${colors.border}`}>
              <span 
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  (subscribedServices?.includes(show.streamingService) ?? false)
                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse' 
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
              {(show.streamingService === 'Other' || (subscribedServices?.includes(show.streamingService) ?? false)) && (
                <a
                  href={getStreamingServiceLink(show.streamingService)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="p-2 md:p-1 rounded-lg border border-white/5 bg-[#0F1115] text-slate-400 hover:text-white transition-colors duration-150 cursor-pointer flex items-center justify-center min-w-[34px] min-h-[34px] md:min-w-0 md:min-h-0"
                  title={`Open ${show.title} in ${show.streamingService}`}
                >
                  <Play className="w-4.5 h-4.5 md:w-3 md:h-3 fill-current" />
                </a>
              )}

              {!isFriendView && (
                <>
                  {/* Edit Image URL Button - Only show for Julio/admin */}
                  {(currentUser?.name?.trim().toLowerCase() === 'julio' || currentUser?.email?.toLowerCase() === 'juliozaldivar@gmail.com' || currentUser?.id === 'default' || currentUser?.id === 'user-julio') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageUrlInput(show.bannerImage || '');
                        setBannerPositionInput(show.bannerPosition || 'center 25%');
                        setIsEditingImage(true);
                        handleInteractionClick();
                      }}
                      className="p-2 md:p-1 rounded-lg border border-white/5 bg-[#0F1115] text-slate-400 hover:text-white transition-colors duration-150 cursor-pointer flex items-center justify-center min-w-[34px] min-h-[34px] md:min-w-0 md:min-h-0"
                      title="Change Show Cover Image"
                    >
                      <Image className="w-4.5 h-4.5 md:w-3 md:h-3" />
                    </button>
                  )}

                  {/* Share / Notify Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShareMessage('');
                      setSharingStates({});
                      setIsSharing(true);
                      handleInteractionClick();
                    }}
                    className="p-2 md:p-1 rounded-lg border border-white/5 bg-[#0F1115] text-slate-400 hover:text-white transition-colors duration-150 cursor-pointer flex items-center justify-center min-w-[34px] min-h-[34px] md:min-w-0 md:min-h-0"
                    title="Share show with other CouchTaterz"
                  >
                    <Share2 className="w-4.5 h-4.5 md:w-3 md:h-3" />
                  </button>

                   {/* Favorite Toggle Button */}
                  <button
                    id={`show-card-${show.id}-star`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateShow({
                        ...show,
                        isFavorite: !show.isFavorite,
                        isBannerHidden: !show.isFavorite ? false : show.isBannerHidden
                      });
                    }}
                    className={`p-2 md:p-1 rounded-lg border transition-colors duration-150 cursor-pointer flex items-center justify-center min-w-[34px] min-h-[34px] md:min-w-0 md:min-h-0 ${
                      show.isFavorite 
                        ? 'text-amber-400 border-amber-500/30 bg-amber-500/15' 
                        : 'text-slate-400 hover:text-white border-white/5 bg-[#0F1115]'
                    }`}
                    title={show.isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Star className={`w-4.5 h-4.5 md:w-3 md:h-3 ${show.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>

                  {/* Instant Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(true);
                    }}
                    className="p-2 md:p-1.5 rounded-lg bg-[#0F1115] hover:bg-rose-600/35 text-slate-400 hover:text-rose-400 border border-white/5 transition-colors duration-150 cursor-pointer min-w-[34px] min-h-[34px] md:min-w-0 md:min-h-0 flex items-center justify-center"
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
            {show.genres.map((g, gIdx) => (
              <span key={`${g}-${gIdx}`} className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold text-slate-300 bg-[#0F1115]/85 rounded border border-white/5 shrink-0">
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
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 28 }}
            className="overflow-hidden bg-[#111319] border-b border-white/5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500/10 rounded-lg">
                    <Share2 className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-xs font-black text-slate-200 uppercase tracking-wider">
                    Share with other CouchTaterz
                  </span>
                </div>
                <button
                  onClick={() => setIsSharing(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Share message input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Add a Personal Note
                </label>
                <textarea
                  rows={3}
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  placeholder="Why should other CouchTaterz watch this? Recommend your favorite episodes or write an encouraging note..."
                  className="w-full bg-[#181B22] text-slate-100 text-xs px-3 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 placeholder-slate-500 resize-none leading-relaxed transition-all"
                />
              </div>

              {/* Select User list */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Select CouchTaterz to Notify
                </label>
                <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {allUsers && allUsers.filter(u => u.id !== currentUser?.id).length > 0 ? (
                    allUsers
                      .filter(u => u.id !== currentUser?.id)
                      .map((user, uIdx) => (
                        <button
                          key={`${user.id}-${uIdx}`}
                          onClick={() => handleSendShare(user.id)}
                          disabled={sharingStates[user.id] === 'sending' || sharingStates[user.id] === 'sent'}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all duration-200 ${
                            sharingStates[user.id] === 'sent'
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              : 'bg-[#181B22] hover:bg-[#202530] border-white/5 text-slate-200 hover:text-white cursor-pointer active:scale-[0.99]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={user.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.name}`}
                              alt={user.name}
                              className="w-6 h-6 rounded-full border border-white/10 bg-[#0F1115]"
                            />
                            <span className="font-semibold">{user.name}</span>
                          </div>
                          <span className="text-[10px] uppercase font-black tracking-widest flex items-center gap-1.5">
                            {sharingStates[user.id] === 'sending' ? (
                              'Sending...'
                            ) : sharingStates[user.id] === 'sent' ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                Sent!
                              </>
                            ) : (
                              <>
                                <Send className="w-3 h-3 text-amber-400" />
                                Send
                              </>
                            )}
                          </span>
                        </button>
                      ))
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-6 bg-[#181B22]/50 rounded-xl border border-dashed border-white/5">
                      No other CouchTaterz registered yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Footer action */}
              <div className="flex justify-end pt-2 border-t border-white/5">
                <button
                  onClick={() => setIsSharing(false)}
                  className="px-4 py-2 bg-[#1C2028] text-slate-300 rounded-xl text-xs font-bold hover:bg-[#262C38] hover:text-white transition cursor-pointer"
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
        
        {/* Status Tracker & Quick Bump Episodes / Friend Add to Queue Button */}
        {isFriendView ? (
          <div className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-center items-center text-center space-y-3 ${
            onboardingStep === 3 && onboardingHighlight
              ? 'bg-purple-950/25 border-purple-500/45 ring-2 ring-purple-500/45 shadow-lg shadow-purple-950/30'
              : theme === 'dark' 
                ? 'bg-[#0F1115]/85 border-amber-500/20 shadow-lg shadow-amber-500/[0.02]'
                : 'bg-amber-50/60 border-amber-500/30 shadow-sm text-slate-900'
          }`}>
            {onboardingStep === 3 && onboardingHighlight && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`w-full p-3 backdrop-blur-md rounded-xl shadow-xl border border-purple-500/40 text-left flex items-start gap-2 mb-1 ${
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
            <div className={`text-[11px] font-bold tracking-wide uppercase flex items-center gap-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-700'}`}>
              <CheckCircle className="w-3.5 h-3.5 text-amber-500" />
              Status: Friend's Library
            </div>
            {isAlreadyInCollection ? (
              <div className={`w-full py-2.5 px-4 border rounded-xl text-emerald-500 text-xs font-bold flex items-center justify-center gap-1.5 shadow-inner ${
                theme === 'dark' ? 'bg-[#101F1C] border-emerald-500/20' : 'bg-emerald-50 border-emerald-300'
              }`}>
                <Check className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
                In your collection
              </div>
            ) : (
              <button
                onClick={() => onAddToMyQueue && onAddToMyQueue(show)}
                className={`w-full py-2.5 px-4 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-[0.98] transition-all cursor-pointer bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 ${
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
                <span>Add to Up Next</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {isNextEpFuture && show.nextEpisode ? (
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
                <span className="shrink-0 font-bold">Next Airing: {formatAirDate(show.nextEpisode.airDate)}</span>
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
                  theme === 'dark' ? 'bg-[#15171C] border-white/5' : 'bg-neutral-100 border-neutral-200'
                }`}>
                  {(['Watching', 'Backlog', 'Completed'] as ShowStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(st)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap ${
                        show.status === st
                          ? st === 'Completed'
                            ? 'bg-emerald-600 text-white shadow-sm font-extrabold'
                            : st === 'Backlog'
                              ? 'bg-amber-600 text-white shadow-sm font-extrabold'
                              : 'bg-blue-600 text-white shadow-sm font-extrabold'
                          : theme === 'dark'
                            ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                      } ${
                        onboardingStep === 1 && onboardingHighlight && st === 'Watching'
                          ? 'ring-2 ring-purple-500 text-purple-300 bg-purple-500/20 relative z-10'
                          : ''
                      }`}
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
                  ))}
                </div>
              </div>
            </div>

            {/* Unified Watched Progress Block */}
            <div className={`p-3 rounded-2xl border space-y-2.5 transition-all duration-300 ${
              onboardingStep === 2 && isTargetShow
                ? 'bg-purple-950/30 border-purple-500/70 ring-2 ring-purple-500/60 shadow-xl shadow-purple-950/40 relative z-20'
                : theme === 'dark' ? 'bg-[#15171C]/50 border-white/5' : 'bg-neutral-100/70 border-neutral-200'
            }`}>
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className={`uppercase tracking-wider text-[10px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Watched Progress</span>
                <span className={`font-extrabold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                  S{show.latestWatched.season} • {show.latestWatched.episode === 0 ? 'Not Started' : `E${show.latestWatched.episode}`}{' '}
                  <span className={`font-medium text-[10px] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
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
                <div className={`text-[11px] font-medium truncate flex items-center gap-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span className={`font-extrabold text-[10px] uppercase shrink-0 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                    {show.latestWatched.episode === 0 ? "Status:" : "Current:"}
                  </span>
                  <span className="font-medium truncate">"{show.latestWatched.title}"</span>
                </div>
              )}

              {/* Interactive Progress Bar Track */}
              <div 
                onClick={handleProgressBarClick}
                className={`w-full h-2 rounded-full overflow-hidden border relative group ${
                  theme === 'dark' ? 'bg-[#1C1F26] border-white/5' : 'bg-neutral-200 border-neutral-300/80'
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

              {/* Stepper Toolbar */}
              {!isFriendView && (
                <div className={`flex items-center justify-between pt-1 text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  {/* Episode Stepper */}
                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] uppercase font-extrabold mr-0.5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Ep:</span>
                    <button 
                      onClick={handleDecrementEpisode}
                      disabled={show.latestWatched.episode <= 0}
                      className={`p-1 rounded-md transition disabled:opacity-20 cursor-pointer ${
                        theme === 'dark' ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-black/10 text-slate-600 hover:text-slate-900'
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
                      className={`p-1.5 rounded-lg transition disabled:opacity-20 cursor-pointer flex items-center justify-center ${
                        onboardingStep === 2 && isTargetShow 
                          ? 'ring-4 ring-purple-400 bg-purple-600 text-white animate-bounce shadow-lg shadow-purple-500/60 scale-125 z-30 font-black' 
                          : theme === 'dark' ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-black/10 text-slate-600 hover:text-slate-900'
                      }`}
                      title="Increment Episode"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>

                  <div className={`w-[1px] h-3.5 ${theme === 'dark' ? 'bg-white/10' : 'bg-neutral-300'}`} />

                  {/* Season Stepper */}
                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] uppercase font-extrabold mr-0.5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Season:</span>
                    <button 
                      onClick={handleDecrementSeason}
                      disabled={show.latestWatched.season <= 1}
                      className={`p-1 rounded-md transition disabled:opacity-20 cursor-pointer ${
                        theme === 'dark' ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-black/10 text-slate-600 hover:text-slate-900'
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
                        theme === 'dark' ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-black/10 text-slate-600 hover:text-slate-900'
                      }`}
                      title="Increment Season"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Ratings & Review Notes Block */}
        <div className="space-y-2">
          {/* Rating Scores Integrated Section */}
          <div className={`flex flex-wrap items-center justify-between p-2.5 rounded-xl border text-xs gap-2 ${
            theme === 'dark' ? 'bg-[#15171C]/50 border-white/5' : 'bg-neutral-100/70 border-neutral-200'
          }`}>
            {/* Rotten Tomatoes score */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Award className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className={`text-[10px] font-bold uppercase ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>RT:</span>
              <span className="text-xs font-black text-rose-500">
                {show.rottenTomatoesScore != null ? `${show.rottenTomatoesScore}%` : 'TBD'}
              </span>
            </div>

            {/* User score */}
            {(!familyDetails || familyDetails.length === 0) && (
              <div className="flex items-center gap-1 shrink-0 flex-wrap">
                <span className={`text-[10px] font-bold uppercase shrink-0 mr-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{isFriendView ? "Friend:" : "You:"}</span>
                <div className="flex items-center gap-0.5 shrink-0">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                    <button
                      key={star}
                      type="button"
                      disabled={isFriendView}
                      onClick={() => handleScoreChange(star)}
                      className={`transition-colors p-px text-amber-400 ${isFriendView ? "cursor-default" : ""}`}
                      style={{ color: star <= (show.userScore || 0) ? '#fbbf24' : (theme === 'dark' ? '#334155' : '#cbd5e1') }}
                    >
                      <Star className="w-2.5 h-2.5 fill-current" />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-black text-amber-500 ml-0.5">{(show.userScore || "—")}</span>
              </div>
            )}
          </div>

          {/* User Review Text / Notes */}
          {(!familyDetails || familyDetails.length === 0) ? (
            <div className={`text-xs rounded-xl p-3 border relative ${
              theme === 'dark' ? 'text-slate-300 bg-[#0F1115]/40 border-white/5' : 'text-slate-800 bg-neutral-50 border-neutral-200'
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
                        : 'bg-white text-slate-900 border-neutral-300 focus:border-blue-500'
                    }`}
                  />
                  <div className="flex justify-end gap-1.5">
                    <button 
                      onClick={() => setIsEditingNotes(false)}
                      className={`px-2 py-1 text-[10px] rounded font-bold ${
                        theme === 'dark' ? 'text-slate-400 hover:bg-[#262A33]' : 'text-slate-600 hover:bg-neutral-200'
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
                  <p className={`leading-relaxed pr-1 flex-1 whitespace-pre-wrap break-words italic ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
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
                          : 'text-slate-500 hover:text-slate-900 bg-neutral-200/50 md:bg-transparent hover:bg-neutral-200 md:hover:bg-transparent'
                      }`}
                      title="Edit Notes"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className={`space-y-2.5 p-4 rounded-2xl border ${
              theme === 'dark' ? 'bg-[#0F1115]/50 border-purple-500/10' : 'bg-purple-50/50 border-purple-200/60'
            }`}>
              <span className={`text-[10px] font-extrabold uppercase tracking-widest block mb-1 ${
                theme === 'dark' ? 'text-purple-300' : 'text-purple-700'
              }`}>
                Who's Watching What ({familyDetails.length})
              </span>
              <div className={`divide-y space-y-2.5 ${theme === 'dark' ? 'divide-white/5' : 'divide-purple-200/50'}`}>
                {familyDetails.map((detail, idx) => (
                  <div key={`${detail.ownerName}-${idx}`} className="pt-2.5 first:pt-0 flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-extrabold ${theme === 'dark' ? 'text-purple-200' : 'text-purple-900'}`}>{detail.ownerName}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                          detail.status === 'Completed'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : detail.status === 'Backlog'
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                        }`}>
                          {detail.status === 'Watching' ? 'Watching' : detail.status === 'Backlog' ? 'Up Next' : detail.status === 'Completed' ? 'Watched' : detail.status}
                        </span>
                        <span className={`font-semibold text-[10px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>S{detail.latestWatched.season}E{detail.latestWatched.episode}</span>
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
                        theme === 'dark' ? 'text-slate-300 border-purple-500/20' : 'text-slate-700 border-purple-300'
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

        {/* Collapsible Meta Data Section: Recap or Details */}
        <div className={`border-t pt-2.5 ${theme === 'dark' ? 'border-white/5' : 'border-neutral-200'}`}>
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
                ? show.status === 'Watching'
                  ? 'bg-blue-500/10 border-blue-500/25 text-blue-500'
                  : theme === 'dark' ? 'bg-white/5 border-white/10 text-slate-200' : 'bg-neutral-100 border-neutral-300 text-slate-800'
                : theme === 'dark' 
                  ? 'bg-[#15171C]/60 hover:bg-[#1C1F26] border-white/5 text-slate-400 hover:text-white'
                  : 'bg-neutral-100 hover:bg-neutral-200/80 border-neutral-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            {show.status === 'Watching' ? (
              <span className="font-extrabold uppercase tracking-wider text-[10px] flex items-center gap-1.5 text-blue-500">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Episode Recap
              </span>
            ) : (
              <span className="font-extrabold uppercase tracking-wider text-[10px]">Cast, Crew & Details</span>
            )}
            {isExpanded ? <ChevronUp className="w-4 h-4 opacity-80" /> : <ChevronDown className="w-4 h-4 opacity-60" />}
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden space-y-3 pt-3 text-xs"
              >
                {show.status === 'Watching' ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase flex items-center gap-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>
                        <Sparkles className="w-3 h-3 text-blue-500 animate-pulse" /> Season {show.latestWatched.season}, Episode {show.latestWatched.episode} Recap
                      </span>
                      <span className={`text-[8px] font-extrabold border px-1.5 py-0.5 rounded tracking-wider uppercase ${
                        theme === 'dark' ? 'bg-[#20252E] text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-200'
                      }`}>
                        TVmaze Verified
                      </span>
                    </div>
                    {isLoadingRecap ? (
                      <div className={`text-xs py-2.5 flex items-center gap-2 animate-pulse px-3 rounded-xl border ${
                        theme === 'dark' ? 'text-slate-400 bg-[#20252E]/30 border-white/5' : 'text-slate-600 bg-neutral-100 border-neutral-200'
                      }`}>
                        <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                        <span>Retrieving recap from TVmaze...</span>
                      </div>
                    ) : (
                      <p className={`leading-relaxed text-xs italic p-3 rounded-xl border ${
                        theme === 'dark' ? 'text-slate-300 bg-[#20252E]/50 border-white/5' : 'text-slate-700 bg-neutral-50 border-neutral-200'
                      }`}>
                        "{recapText || "No recap summary available. Try changing your watched progress or reload."}"
                      </p>
                    )}
                  </div>
                ) : (
                  <>
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
                  </>
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

      </div>
    </div>
  );
};
