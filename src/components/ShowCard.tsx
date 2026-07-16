/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TvShow, StreamingService, ShowStatus } from '../types';
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
  Check
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
  'HBO': 'max://',
  'Netflix': 'netflix://',
  'Disney+': 'disneyplus://',
  'Prime Video': 'primevideo://',
  'Hulu': 'hulu://',
  'Apple TV': 'videos://',
  'Paramount+': 'paramountplus://',
  'Peacock': 'peacock://',
  'AMC+': 'amcplus://',
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
  subscribedServices = []
}) => {
  const [showSubscribeTooltip, setShowSubscribeTooltip] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState(show.bannerImage || '');
  const [notes, setNotes] = useState(show.userNotes);
  const [customScore, setCustomScore] = useState<number>(show.userScore || 5);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recapText, setRecapText] = useState<string>('');
  const [isLoadingRecap, setIsLoadingRecap] = useState<boolean>(false);
  const [fetchedRecapKey, setFetchedRecapKey] = useState<string>('');

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

  const maxSeasons = show.totalSeasons || Math.max(show.latestWatched.season, show.nextEpisode?.season || 1, 5);
  const maxEpisodesInSeason = show.episodesPerSeason?.[show.latestWatched.season - 1] || Math.max(show.latestWatched.episode, show.nextEpisode?.season === show.latestWatched.season ? (show.nextEpisode?.episode || 1) : 1, 10);

  const handleIncrementEpisode = () => {
    if (show.latestWatched.episode >= maxEpisodesInSeason) return;
    const updated = {
      ...show,
      latestWatched: {
        ...show.latestWatched,
        episode: show.latestWatched.episode + 1
      }
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
      bannerImage: imageUrlInput.trim() || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80'
    });
    setIsEditingImage(false);
  };

  return (
    <motion.div 
      id={`show-card-${show.id}`}
      layout
      className="relative group flex flex-col rounded-3xl bg-[#1A1D23] border border-white/5 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-white/10"
    >
      {/* Visual Header / Banner */}
      <div className="relative h-44 w-full overflow-hidden">
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
            <div className="flex justify-end gap-1.5">
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
        <div className="absolute top-4 right-4 z-10 flex gap-1.5 items-center">
          {/* Rotten Tomatoes */}
          <div className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-lg bg-[#0F1115]/90 text-rose-400 border border-white/5 backdrop-blur-md">
            <Award className="w-3 h-3" />
            <span>RT: {show.rottenTomatoesScore}%</span>
          </div>

          {/* Quick Play Link */}
          <a
            href={getStreamingServiceLink(show.streamingService)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="p-1 rounded-lg border border-white/5 bg-[#0F1115]/90 text-slate-400 hover:text-white backdrop-blur-md transition-all cursor-pointer flex items-center justify-center"
            title={`Open ${show.title} in ${show.streamingService}`}
          >
            <Play className="w-3 h-3 fill-current" />
          </a>

          {!isFriendView && (
            <>
              {/* Edit Image URL Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setImageUrlInput(show.bannerImage || '');
                  setIsEditingImage(true);
                }}
                className="p-1 rounded-lg border border-white/5 bg-[#0F1115]/90 text-slate-400 hover:text-white backdrop-blur-md transition-all cursor-pointer flex items-center justify-center"
                title="Change Show Cover Image"
              >
                <Image className="w-3 h-3" />
              </button>

              {/* Favorite Toggle Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateShow({
                    ...show,
                    isFavorite: !show.isFavorite,
                    isBannerHidden: !show.isFavorite ? false : show.isBannerHidden
                  });
                }}
                className={`p-1 rounded-lg border backdrop-blur-md transition-all cursor-pointer flex items-center justify-center ${
                  show.isFavorite 
                    ? 'text-amber-400 border-amber-500/30 bg-amber-500/15' 
                    : 'text-slate-400 hover:text-white border-white/5 bg-[#0F1115]/90'
                }`}
                title={show.isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Star className={`w-3 h-3 ${show.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>

              {/* Instant Delete Button */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                {showDeleteConfirm ? (
                  <div className="flex items-center gap-1 bg-[#0F1115]/95 border border-rose-500/30 rounded-lg p-1 shadow-lg backdrop-blur-md">
                    <button
                      onClick={() => {
                        onDeleteShow(show.id);
                        setShowDeleteConfirm(false);
                      }}
                      className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white text-[9px] font-black rounded transition cursor-pointer"
                    >
                      Delete?
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9px] font-bold rounded transition cursor-pointer"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(true);
                      // Auto-reset after 4 seconds
                      setTimeout(() => setShowDeleteConfirm(false), 4000);
                    }}
                    className="p-1.5 rounded-lg bg-[#0F1115]/90 hover:bg-rose-600 hover:text-white text-slate-400 border border-white/5 backdrop-blur-md transition cursor-pointer"
                    title="Delete Show"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Title and Genres overlay at bottom of banner */}
        <div className="absolute bottom-3 left-4 right-4 z-10">
          <h3 className="text-xl font-bold text-white tracking-tight leading-tight mb-1 drop-shadow-md">
            {show.title}
          </h3>
          <div className="flex flex-wrap gap-1">
            {show.genres.map((g) => (
              <span key={g} className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold text-slate-300 bg-[#0F1115]/80 rounded border border-white/5">
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        {/* Status Tracker & Quick Bump Episodes / Friend Add to Queue Button */}
        {isFriendView ? (
          <div className="bg-[#0F1115]/85 p-4 rounded-2xl border border-amber-500/20 shadow-lg shadow-amber-500/[0.02] flex flex-col justify-center items-center text-center space-y-3">
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
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-[0.98] transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                Add to my queue
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3 bg-[#0F1115]/50 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between">
              {/* Status Segmented Controls */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Status:</span>
                <div className="flex gap-0.5 bg-[#15171C] p-0.5 rounded-lg border border-white/5">
                  {(['Watching', 'Backlog', 'Completed'] as ShowStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(st)}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                        show.status === st
                          ? st === 'Completed'
                            ? 'bg-emerald-600 text-white shadow-sm font-extrabold'
                            : st === 'Backlog'
                              ? 'bg-amber-600 text-white shadow-sm font-extrabold'
                              : 'bg-blue-600 text-white shadow-sm font-extrabold'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      {st === 'Watching' ? 'Active' : st === 'Backlog' ? 'Queue' : st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Next episode status */}
              <div className="text-xs">
                {show.status === 'Completed' ? (
                  <span className="text-emerald-500 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    Completed
                  </span>
                ) : show.concluded ? (
                  <span className="text-slate-500 font-medium">Concluded</span>
                ) : show.nextEpisode ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    S{show.nextEpisode.season}E{show.nextEpisode.episode} : {formatAirDate(show.nextEpisode.airDate)}
                  </span>
                ) : (
                  <span className="text-slate-500 font-medium">Next Episode: TBD</span>
                )}
              </div>
            </div>

            {/* Episode Counter Controls */}
            <div className="flex items-center justify-between pt-1">
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
          </div>
        )}

        {/* User Ratings & Review Notes Block */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">{isFriendView ? "Friend's Score:" : "Your Score:"}</span>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                  <button
                    key={star}
                    type="button"
                    disabled={isFriendView}
                    onClick={() => handleScoreChange(star)}
                    className={`transition-colors p-0.5 text-amber-400 ${isFriendView ? "cursor-default" : ""}`}
                    style={{ color: star <= (show.userScore || 0) ? '#fbbf24' : '#404040' }}
                  >
                    <Star className="w-3 h-3 fill-current" />
                  </button>
                ))}
              </div>
            </div>
            <span className="text-xs font-bold text-amber-400">{(show.userScore || "—")}/10</span>
          </div>

          {/* User Review Text / Notes */}
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
              <div className="flex justify-between items-start group/notes">
                <p className="line-clamp-2 text-slate-400 leading-relaxed">
                  {show.userNotes || (isFriendView ? "No review thoughts added by friend yet." : "No review thoughts added yet. Hit edit to log a review!")}
                </p>
                {!isFriendView && (
                  <button 
                    onClick={() => setIsEditingNotes(true)}
                    className="ml-2 text-slate-500 hover:text-slate-300 p-1 opacity-0 group-hover/notes:opacity-100 transition-opacity"
                    title="Edit Notes"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Collapsible Meta Data Section: Recap or Details */}
        <div className="border-t border-white/5 pt-2.5">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
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
                        TVLine Verified
                      </span>
                    </div>
                    {isLoadingRecap ? (
                      <div className="text-slate-400 text-xs py-2.5 flex items-center gap-2 animate-pulse bg-[#20252E]/30 px-3 rounded-xl border border-white/5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                        <span>Retrieving recap from TVLine...</span>
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
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Overview</span>
                      <p className="text-slate-400 leading-relaxed text-xs">
                        {show.overview}
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
                    <button
                      onClick={() => {
                        if (confirm(`Remove "${show.title}" from your followed shows?`)) {
                          onDeleteShow(show.id);
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition text-[11px] font-bold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Show
                    </button>
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
