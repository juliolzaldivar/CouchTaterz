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
  onboardingHighlight = false
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

  const maxSeasons = Math.max(
    show.totalSeasons || 1,
    show.latestWatched.season,
    show.nextEpisode?.season || 1,
    5
  );
  const maxEpisodesInSeason = (show.episodesPerSeason && show.episodesPerSeason[show.latestWatched.season - 1]) || Math.max(show.latestWatched.episode, show.nextEpisode?.season === show.latestWatched.season ? (show.nextEpisode?.episode || 1) : 1, 10);

  const handleIncrementEpisode = () => {
    if (show.latestWatched.episode >= maxEpisodesInSeason) return;
    const nextEpisode = show.latestWatched.episode + 1;
    const updated = {
      ...show,
      latestWatched: {
        ...show.latestWatched,
        episode: nextEpisode
      },
      status: nextEpisode === maxEpisodesInSeason ? ('Completed' as ShowStatus) : show.status
    };
    onUpdateShow(updated);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFriendView) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const targetEpisode = Math.max(1, Math.min(maxEpisodesInSeason, Math.round(percentage * maxEpisodesInSeason)));
    
    const updated = {
      ...show,
      latestWatched: {
        ...show.latestWatched,
        episode: targetEpisode
      },
      status: targetEpisode === maxEpisodesInSeason ? ('Completed' as ShowStatus) : show.status
    };
    onUpdateShow(updated);
  };

  const handleDecrementEpisode = () => {
    if (show.latestWatched.episode <= 1) return;
    const updated = {
      ...show,
      latestWatched: {
        ...show.latestWatched,
        episode: show.latestWatched.episode - 1
      }
    };
    onUpdateShow(updated);
  };

  const handleIncrementSeason = () => {
    if (show.latestWatched.season >= maxSeasons) return;
    const updated = {
      ...show,
      latestWatched: {
        season: show.latestWatched.season + 1,
        episode: 1,
        title: `Episode 1`
      }
    };
    onUpdateShow(updated);
  };

  const handleDecrementSeason = () => {
    if (show.latestWatched.season <= 1) return;
    const updated = {
      ...show,
      latestWatched: {
        season: show.latestWatched.season - 1,
        episode: 1,
        title: `Episode 1`
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
    onUpdateShow({
      ...show,
      status
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
    <motion.div 
      id={`show-card-${show.id}`}
      layout
      className={`group flex flex-col rounded-3xl bg-[#1A1D23] border overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 ${
        isOnboardingHighlightActive
          ? 'relative z-50 ring-4 ring-purple-500/80 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.6)]'
          : highlightStatusPrompt
            ? 'relative z-50 ring-2 ring-purple-500 border-purple-500 shadow-2xl shadow-purple-500/20'
            : 'relative border-white/5 hover:border-white/10'
      }`}
    >
      {/* Visual Header / Banner */}
      <div id={`show-card-${show.id}-banner`} className="relative h-44 w-full overflow-hidden">
        {isEditingImage ? (
          <div 
            className="absolute inset-0 z-20 bg-[#0F1115]/95 backdrop-blur-md p-4 flex flex-col justify-center space-y-2"
            onClick={(e) => e.stopPropagation()}
          >
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Link className="w-3 h-3 text-blue-500" />
              Change Cover Image URL
            </label>
            <input
              type="text"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              placeholder="Paste custom image URL here..."
              className="w-full bg-[#1A1D23] text-slate-100 text-xs px-2.5 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500 placeholder-slate-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveImage();
                if (e.key === 'Escape') setIsEditingImage(false);
              }}
            />

            {/* Vertical position adjuster */}
            <div className="flex flex-col space-y-0.5 pt-1">
              <div className="flex justify-between items-center">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Face Focus Vertical position
                </label>
                <span className="text-[10px] font-black text-blue-400">
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
                  className="w-full accent-blue-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
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
                className="px-2 py-1 text-[10px] text-slate-400 hover:bg-[#262A33] rounded font-bold cursor-pointer transition"
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
        <div 
          className="absolute top-4 left-4 z-20"
          onMouseEnter={() => {
            const hasService = subscribedServices?.includes(show.streamingService) ?? false;
            if (!hasService) setShowSubscribeTooltip(true);
          }}
          onMouseLeave={() => setShowSubscribeTooltip(false)}
        >
          <div className="relative">
            <span className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border backdrop-blur-md transition-colors flex items-center gap-1.5 ${colors.bg} ${colors.text} ${colors.border}`}>
              <span 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  (subscribedServices?.includes(show.streamingService) ?? false)
                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse' 
                    : 'bg-slate-500'
                }`} 
              />
              <span>{show.streamingService}</span>
            </span>

            {/* Subscribe Tooltip Popover */}
            {!(subscribedServices?.includes(show.streamingService) ?? false) && showSubscribeTooltip && (
              <div 
                className="absolute left-0 top-full mt-2 w-56 p-3 bg-[#1A1D23] border border-white/10 rounded-2xl shadow-xl z-50 text-left"
                onMouseEnter={() => setShowSubscribeTooltip(true)}
                onMouseLeave={() => setShowSubscribeTooltip(false)}
              >
                <p className="text-[11px] text-slate-300 font-medium mb-2 leading-normal">
                  You aren't subscribed to <span className="text-white font-extrabold">{show.streamingService}</span>. Would you like to subscribe?
                </p>
                <div className="flex gap-1.5">
                  <a
                    href={REGISTRATION_LINKS[show.streamingService] || 'https://www.google.com'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowSubscribeTooltip(false)}
                    className="flex-1 py-1 px-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-lg text-center transition cursor-pointer"
                  >
                    Yes
                  </a>
                  <button
                    onClick={() => setShowSubscribeTooltip(false)}
                    className="flex-1 py-1 px-2 bg-[#252932] hover:bg-[#313642] text-slate-400 hover:text-white text-[10px] font-bold rounded-lg transition cursor-pointer"
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
                  className="p-2 md:p-1 rounded-lg border border-white/5 bg-[#0F1115]/90 text-slate-400 hover:text-white backdrop-blur-md transition-all cursor-pointer flex items-center justify-center min-w-[34px] min-h-[34px] md:min-w-0 md:min-h-0"
                  title={`Open ${show.title} in ${show.streamingService}`}
                >
                  <Play className="w-4.5 h-4.5 md:w-3 md:h-3 fill-current" />
                </a>
              )}

              {!isFriendView && (
                <>
                  {/* Edit Image URL Button - Only show for Julian/Julio */}
                  {(currentUser?.name?.trim().toLowerCase() === 'julio' || currentUser?.name?.trim().toLowerCase() === 'julian' || currentUser?.email?.toLowerCase() === 'juliozaldivar@gmail.com') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageUrlInput(show.bannerImage || '');
                        setBannerPositionInput(show.bannerPosition || 'center 25%');
                        setIsEditingImage(true);
                        handleInteractionClick();
                      }}
                      className="p-2 md:p-1 rounded-lg border border-white/5 bg-[#0F1115]/90 text-slate-400 hover:text-white backdrop-blur-md transition-all cursor-pointer flex items-center justify-center min-w-[34px] min-h-[34px] md:min-w-0 md:min-h-0"
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
                    className="p-2 md:p-1 rounded-lg border border-white/5 bg-[#0F1115]/90 text-slate-400 hover:text-white backdrop-blur-md transition-all cursor-pointer flex items-center justify-center min-w-[34px] min-h-[34px] md:min-w-0 md:min-h-0"
                    title="Share show with other Taterz"
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
                    className={`p-2 md:p-1 rounded-lg border backdrop-blur-md transition-all cursor-pointer flex items-center justify-center min-w-[34px] min-h-[34px] md:min-w-0 md:min-h-0 ${
                      show.isFavorite 
                        ? 'text-amber-400 border-amber-500/30 bg-amber-500/15' 
                        : 'text-slate-400 hover:text-white border-white/5 bg-[#0F1115]/90'
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
                    className="p-2 md:p-1.5 rounded-lg bg-[#0F1115]/90 hover:bg-rose-600/35 text-slate-400 hover:text-rose-400 border border-white/5 backdrop-blur-md transition cursor-pointer min-w-[34px] min-h-[34px] md:min-w-0 md:min-h-0 flex items-center justify-center"
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
                    Share with other Taterz
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
                  placeholder="Why should other Taterz watch this? Recommend your favorite episodes or write an encouraging note..."
                  className="w-full bg-[#181B22] text-slate-100 text-xs px-3 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 placeholder-slate-500 resize-none leading-relaxed transition-all"
                />
              </div>

              {/* Select User list */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Select Taterz to Notify
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
                      No other Taterz registered yet.
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
            onboardingStep === 7 && onboardingHighlight
              ? 'bg-purple-950/25 border-purple-500/45 ring-2 ring-purple-500/45 shadow-lg shadow-purple-950/30'
              : 'bg-[#0F1115]/85 border-amber-500/20 shadow-lg shadow-amber-500/[0.02]'
          }`}>
            {onboardingStep === 7 && onboardingHighlight && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg border border-purple-500 text-left flex items-start gap-2 text-white mb-1"
              >
                <div className="p-1 bg-purple-500/20 rounded-lg text-amber-300 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h6 className="text-[10px] font-black uppercase tracking-wider text-purple-100">Step 7 of 9</h6>
                  <p className="text-[11px] text-purple-100/95 leading-relaxed font-semibold">
                    Tap <span className="text-amber-300 font-extrabold">Add to Up Next</span> to copy this show into your queue!
                  </p>
                </div>
              </motion.div>
            )}
            <div className="text-[11px] font-bold text-slate-400 tracking-wide uppercase flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-amber-500" />
              Status: Friend's Library
            </div>
            {isAlreadyInCollection ? (
              <div className="w-full py-2.5 px-4 bg-[#101F1C] border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 shadow-inner">
                <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                In your collection
              </div>
            ) : (
              <button
                onClick={() => onAddToMyQueue && onAddToMyQueue(show)}
                className={`w-full py-2.5 px-4 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-[0.98] transition-all cursor-pointer bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 ${
                  onboardingStep === 7 && onboardingHighlight
                    ? 'ring-4 ring-purple-500/80 animate-pulse relative z-20'
                    : ''
                }`}
              >
                {onboardingStep === 7 && onboardingHighlight && (
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
          <div className={`space-y-3 p-4 rounded-2xl border transition-all duration-300 ${
            highlightStatusPrompt || isOnboardingHighlightActive
              ? 'bg-purple-950/25 border-purple-500/40 ring-2 ring-purple-500/45 shadow-lg shadow-purple-950/30 relative z-10' 
              : 'bg-[#0F1115]/50 border-white/5'
          }`}>
              {/* Onboarding and Prompts inside card body */}
              {onboardingStep === 3 && isTargetShow && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg border border-purple-500 text-left flex items-start gap-2 text-white"
                >
                  <div className="p-1 bg-purple-500/20 rounded-lg text-amber-300 shrink-0">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h6 className="text-[10px] font-black uppercase tracking-wider text-purple-100">Step 3 of 9</h6>
                    <p className="text-[11px] text-purple-100/95 leading-relaxed font-semibold">
                      Tap the <span className="bg-purple-850 text-white px-1.5 py-0.5 rounded text-[10px] font-black shadow-sm">+</span> button next to <span className="text-amber-300 font-extrabold">E{show.latestWatched.episode}</span> to log your first watched episode!
                    </p>
                  </div>
                </motion.div>
              )}
              {highlightStatusPrompt && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-[#151821]/95 backdrop-blur-md rounded-xl shadow-xl border border-purple-500/40 text-left flex items-start gap-2 text-slate-200 relative z-10"
              >
                <div className="p-1 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <div className="space-y-1 pr-4">
                  <h6 className="text-[10px] font-black uppercase tracking-wider text-purple-400">Quick Start!</h6>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                    Set your first status here! Tap <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shadow-sm">Watching</span> to move this show to your active watchlist.
                  </p>
                </div>
                {onDismissHighlight && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismissHighlight();
                    }}
                    className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded-md transition text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </motion.div>
            )}
            {/* Status Segmented Controls */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Status:</span>
                <div className="flex gap-0.5 bg-[#15171C] p-0.5 rounded-lg border border-white/5">
                  {(['Watching', 'Backlog', 'Completed'] as ShowStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(st)}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                        show.status === st
                          ? st === 'Completed'
                            ? 'bg-emerald-600 text-white shadow-sm font-extrabold'
                            : st === 'Backlog'
                              ? 'bg-amber-600 text-white shadow-sm font-extrabold'
                              : 'bg-blue-600 text-white shadow-sm font-extrabold'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                      } ${
                        onboardingStep === 1 && onboardingHighlight && st === 'Watching'
                          ? 'ring-2 ring-purple-500 bg-blue-600 text-white scale-105 relative z-10'
                          : ''
                      }`}
                    >
                      {onboardingStep === 1 && onboardingHighlight && st === 'Watching' && (
                        <motion.span
                          animate={{ x: [-2, 2, -2] }}
                          transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
                          className="text-purple-300 font-black text-[10px] inline-block"
                        >
                          ➜
                        </motion.span>
                      )}
                      <span>{st === 'Watching' ? 'Watching' : st === 'Backlog' ? 'Up Next' : st === 'Completed' ? 'Watched' : st}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Next episode status */}
              <div className="text-xs">
                {show.status === 'Completed' ? (
                  <span className="text-emerald-500 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    Watched
                  </span>
                ) : show.concluded ? (
                  <span className="text-slate-500 font-medium">Concluded</span>
                ) : show.nextEpisode ? (
                  <div className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg text-left flex items-center gap-2 shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <div className="flex flex-col leading-none py-0.5">
                      <span className="text-[11px] font-extrabold text-emerald-300 mb-0.5">
                        S{show.nextEpisode.season}E{show.nextEpisode.episode}
                      </span>
                      <span className="text-[10px] font-medium text-emerald-400/80">
                        {formatAirDate(show.nextEpisode.airDate)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-500 font-medium">Next Episode: TBD</span>
                )}
              </div>
            </div>

            {/* Episode Counter Controls */}
            <div className="flex items-center justify-between pt-2.5 border-t border-white/5">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Watched Progress</span>
              </div>
              
              <div className="flex items-center gap-1 bg-[#262A33] border border-white/5 rounded-xl p-1">
                <button 
                  onClick={handleDecrementEpisode}
                  disabled={show.latestWatched.episode <= 1}
                  className={`p-1.5 rounded-lg transition ${
                    show.latestWatched.episode <= 1 
                      ? "text-slate-600 opacity-30 cursor-not-allowed" 
                      : "text-slate-400 hover:text-white hover:bg-[#1A1D23] cursor-pointer"
                  }`}
                  title="Decrement Episode"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold text-slate-300 min-w-[36px] text-center px-1">
                  E{show.latestWatched.episode}
                  {show.episodesPerSeason?.[show.latestWatched.season - 1] ? `/${show.episodesPerSeason[show.latestWatched.season - 1]}` : ""}
                </span>
                <button 
                  onClick={handleIncrementEpisode}
                  disabled={show.latestWatched.episode >= maxEpisodesInSeason}
                  className={`p-1.5 rounded-lg transition ${
                    show.latestWatched.episode >= maxEpisodesInSeason 
                      ? "text-slate-600 opacity-30 cursor-not-allowed" 
                      : "text-slate-400 hover:text-white hover:bg-[#1A1D23] cursor-pointer"
                  } ${
                    onboardingStep === 3 && isTargetShow
                      ? 'ring-4 ring-purple-400 bg-[#581c87] border-purple-400 text-white animate-pulse shadow-lg shadow-purple-500/40 relative z-20 scale-110 font-bold'
                      : ''
                  }`}
                  title="Increment Episode"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                
                <div className="w-[1px] h-4 bg-[#1A1D23] mx-1" />
                
                <button 
                  onClick={handleDecrementSeason}
                  disabled={show.latestWatched.season <= 1}
                  className={`p-1.5 rounded-lg transition ${
                    show.latestWatched.season <= 1 
                    ? "text-slate-600 opacity-30 cursor-not-allowed" 
                    : "text-slate-400 hover:text-white hover:bg-[#1A1D23] cursor-pointer"
                  }`}
                  title="Decrement Season"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold text-slate-300 min-w-[36px] text-center px-1">
                  S{show.latestWatched.season}
                  {show.totalSeasons ? `/${show.totalSeasons}` : ""}
                </span>
                <button 
                  onClick={handleIncrementSeason}
                  disabled={show.latestWatched.season >= maxSeasons}
                  className={`p-1.5 rounded-lg transition ${
                    show.latestWatched.season >= maxSeasons 
                      ? "text-slate-600 opacity-30 cursor-not-allowed" 
                      : "text-slate-400 hover:text-white hover:bg-[#1A1D23] cursor-pointer"
                  }`}
                  title="Increment Season"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Visual Season Progress Bar Track */}
            <div className="space-y-1.5 pt-2.5 border-t border-white/5 select-none">
              <div className="flex items-center justify-between text-[9px] font-black uppercase text-slate-500 tracking-wider">
                <span>Season {show.latestWatched.season} Progress</span>
                <span className="text-slate-400 font-extrabold">{Math.min(100, Math.round((show.latestWatched.episode / maxEpisodesInSeason) * 100))}%</span>
              </div>
              <div 
                onClick={handleProgressBarClick}
                className={`w-full h-3.5 flex items-center group relative ${isFriendView ? 'cursor-default' : 'cursor-pointer'}`}
                title={isFriendView ? `Season progress: ${Math.min(100, Math.round((show.latestWatched.episode / maxEpisodesInSeason) * 100))}%` : "Click progress track to set episode / complete show!"}
              >
                {/* Background track */}
                <div className="w-full h-1.5 bg-[#1C1F26] rounded-full overflow-hidden border border-white/[0.03] group-hover:h-2 transition-all relative">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ease-out ${
                      show.status === 'Completed' 
                        ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' 
                        : show.status === 'Backlog'
                        ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                        : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]'
                    }`}
                    style={{ width: `${Math.min(100, Math.round((show.latestWatched.episode / maxEpisodesInSeason) * 100))}%` }}
                  />
                </div>
                {/* Visual thumb helper on hover */}
                {!isFriendView && (
                  <div 
                    className="absolute w-2.5 h-2.5 bg-white rounded-full border border-slate-900 shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{ left: `calc(${Math.min(100, (show.latestWatched.episode / maxEpisodesInSeason) * 100)}% - 5px)` }}
                  />
                )}
              </div>
              {!isFriendView && (
                <div className="flex items-center justify-between text-[8px] text-slate-600 font-bold tracking-wider uppercase select-none">
                  <span>S{show.latestWatched.season}E1</span>
                  <span>Click bar to jump to episode</span>
                  <span>S{show.latestWatched.season}E{maxEpisodesInSeason}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Ratings & Review Notes Block */}
        <div className="space-y-2">
          {/* Rating Scores Integrated Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-[#15171C]/60 p-3 rounded-2xl border border-white/5">
            {/* Rotten Tomatoes score */}
            <div className="flex items-center justify-between sm:justify-start gap-2 flex-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-rose-500" />
                <span>RT<span className="inline md:hidden xl:inline"> Score</span>:</span>
              </span>
              <span className="text-xs font-black text-rose-400">
                {show.rottenTomatoesScore != null ? `${show.rottenTomatoesScore}%` : 'TBD'}
              </span>
            </div>

            {/* Divider line for mobile */}
            {(!familyDetails || familyDetails.length === 0) && (
              <div className="h-[1px] w-full bg-white/5 sm:hidden" />
            )}

            {/* User score */}
            {(!familyDetails || familyDetails.length === 0) && (
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{isFriendView ? "Friend:" : "You:"}</span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                    <button
                      key={star}
                      type="button"
                      disabled={isFriendView}
                      onClick={() => handleScoreChange(star)}
                      className={`transition-colors p-px text-amber-400 ${isFriendView ? "cursor-default" : ""}`}
                      style={{ color: star <= (show.userScore || 0) ? '#fbbf24' : '#404040' }}
                    >
                      <Star className="w-2.5 h-2.5 fill-current" />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-black text-amber-400">{(show.userScore || "—")}/10</span>
              </div>
            )}
          </div>

          {/* User Review Text / Notes */}
          {(!familyDetails || familyDetails.length === 0) ? (
            <div className="text-xs text-slate-300 italic bg-[#0F1115]/40 rounded-xl p-3 border border-white/5 relative">
              {isEditingNotes && !isFriendView ? (
                <div className="space-y-2">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="What's your current vibe check of this show?"
                    className="w-full bg-[#1A1D23] text-slate-100 p-2.5 rounded-lg border border-white/10 focus:outline-none min-h-16"
                  />
                  <div className="flex justify-end gap-1.5">
                    <button 
                      onClick={() => setIsEditingNotes(false)}
                      className="px-2 py-1 text-[10px] text-slate-400 hover:bg-[#262A33] rounded font-bold"
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
                <div className="flex justify-between items-center group/notes">
                  <p className="line-clamp-2 text-slate-400 leading-relaxed pr-2 flex-1">
                    {show.userNotes || (isFriendView ? "No review thoughts added by friend yet." : "No review thoughts added yet. Hit edit to log a review!")}
                  </p>
                  {!isFriendView && (
                    <button 
                      onClick={() => {
                        setIsEditingNotes(true);
                        handleInteractionClick();
                      }}
                      className="ml-1 text-slate-400 hover:text-white p-2.5 opacity-100 md:opacity-0 md:group-hover/notes:opacity-100 bg-white/5 md:bg-transparent hover:bg-white/10 md:hover:bg-transparent rounded-xl transition-all min-w-[36px] min-h-[36px] flex items-center justify-center shrink-0 cursor-pointer"
                      title="Edit Notes"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2.5 bg-[#0F1115]/50 p-4 rounded-2xl border border-purple-500/10">
              <span className="text-[10px] text-purple-300 font-extrabold uppercase tracking-widest block mb-1">
                Who's Watching What ({familyDetails.length})
              </span>
              <div className="divide-y divide-white/5 space-y-2.5">
                {familyDetails.map((detail, idx) => (
                  <div key={`${detail.ownerName}-${idx}`} className="pt-2.5 first:pt-0 flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-purple-200">{detail.ownerName}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                          detail.status === 'Completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : detail.status === 'Backlog'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {detail.status === 'Watching' ? 'Watching' : detail.status === 'Backlog' ? 'Up Next' : detail.status === 'Completed' ? 'Watched' : detail.status}
                        </span>
                        <span className="text-slate-400 font-semibold text-[10px]">S{detail.latestWatched.season}E{detail.latestWatched.episode}</span>
                      </div>
                    </div>
                    {detail.userScore && (
                      <div className="flex items-center gap-1 text-[11px] text-amber-400">
                        <span className="opacity-75">Score:</span>
                        <span className="font-bold">{detail.userScore}/10</span>
                      </div>
                    )}
                    {detail.userNotes && (
                      <p className="text-[11px] text-slate-400 italic leading-relaxed pl-2 border-l border-purple-500/20 mt-0.5">
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
        <div className="border-t border-white/5 pt-2.5">
          <button
            onClick={() => {
              const nextState = !isExpanded;
              setIsExpanded(nextState);
              if (nextState) {
                handleInteractionClick();
              }
            }}
            className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-white transition py-1"
          >
            {show.status === 'Watching' ? (
              <span className="font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1 text-blue-400">
                <Sparkles className="w-3 h-3" /> Previous Episode Recap
              </span>
            ) : (
              <span className="font-semibold uppercase tracking-wider text-[10px]">Cast, Crew & Details</span>
            )}
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
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
                      <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-blue-500 animate-pulse" /> Season {show.latestWatched.season}, Episode {show.latestWatched.episode} Recap
                      </span>
                      <span className="text-[8px] font-extrabold bg-[#20252E] text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded tracking-wider uppercase">
                        TVmaze Verified
                      </span>
                    </div>
                    {isLoadingRecap ? (
                      <div className="text-slate-400 text-xs py-2.5 flex items-center gap-2 animate-pulse bg-[#20252E]/30 px-3 rounded-xl border border-white/5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                        <span>Retrieving recap from TVmaze...</span>
                      </div>
                    ) : (
                      <p className="text-slate-300 leading-relaxed text-xs italic bg-[#20252E]/50 p-3 rounded-xl border border-white/5">
                        "{recapText || "No recap summary available. Try changing your watched progress or reload."}"
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Overview */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">
                        {show.nextEpisode?.overview || show.nextEpisode?.summary ? "Upcoming Episode Summary" : "Overview"}
                      </span>
                      <p className="text-slate-400 leading-relaxed text-xs">
                        {show.nextEpisode?.overview || show.nextEpisode?.summary || show.overview}
                      </p>
                    </div>

                    {/* Directors */}
                    {show.directors && show.directors.length > 0 && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Creators & Showrunners</span>
                        <span className="text-slate-300 font-medium">{show.directors.join(', ')}</span>
                      </div>
                    )}

                    {/* Actors */}
                    {show.actors && show.actors.length > 0 && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Cast</span>
                        <span className="text-slate-300 font-medium">{show.actors.slice(0, 4).join(', ')}</span>
                      </div>
                    )}
                  </>
                )}

                {/* Delete button inside expander */}
                {!isFriendView && (
                  <div className="flex justify-end pt-2">
                    {showExpanderDeleteConfirm ? (
                      <div className="flex items-center gap-2 bg-[#111319] border border-rose-500/30 px-3 py-1.5 rounded-xl shadow-md animate-in fade-in slide-in-from-right-3 duration-150">
                        <span className="text-[10px] font-black uppercase text-rose-400 tracking-wider">Confirm Delete?</span>
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
                          className="px-2.5 py-1 text-[10px] font-bold uppercase rounded bg-white/10 hover:bg-white/15 text-slate-300 transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setShowExpanderDeleteConfirm(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-450 hover:bg-rose-950/20 hover:text-rose-400 transition text-[11px] font-bold cursor-pointer"
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
    </motion.div>
  );
};
