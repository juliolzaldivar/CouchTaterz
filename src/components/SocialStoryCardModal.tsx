import React, { useState, useRef, useEffect } from 'react';
import { X, Download, Share2, Sparkles, Star, Copy, Check, Tv, Edit3, Layers, Calendar, Film, Crown, MessageSquare } from 'lucide-react';
import { toPng } from 'html-to-image';
import QRCode from 'qrcode';
import { TvShow, User } from '../types';

interface SocialStoryCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  show: TvShow | null;
  currentUser: User | null;
  boardId?: string;
  triggerReason?: 'completed' | 'high_rating' | 'manual';
}

type CardTheme = 'neon' | 'cyberpunk' | 'twilight' | 'emerald' | 'sunset';

// Utility to convert image URL to base64 Data URL via server proxy to prevent CORS export breaks
const convertToBase64DataUrl = async (imgUrl: string): Promise<string> => {
  if (!imgUrl) return '';
  if (imgUrl.startsWith('data:')) return imgUrl;

  const proxyUrl = imgUrl.startsWith('http')
    ? `/api/image-proxy?url=${encodeURIComponent(imgUrl)}`
    : imgUrl;

  try {
    const res = await fetch(proxyUrl);
    if (res.ok) {
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string) || imgUrl);
        reader.onerror = () => resolve(imgUrl);
        reader.readAsDataURL(blob);
      });
    }
  } catch (err) {
    console.warn('Image conversion to base64 failed:', err);
  }
  return imgUrl;
};

export const SocialStoryCardModal: React.FC<SocialStoryCardModalProps> = ({
  isOpen,
  onClose,
  show,
  currentUser,
  boardId = 'default',
  triggerReason = 'manual',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>('neon');
  const [customQuote, setCustomQuote] = useState<string>('');
  const [isEditingQuote, setIsEditingQuote] = useState<boolean>(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [bannerDataUrl, setBannerDataUrl] = useState<string>('');
  const [avatarDataUrl, setAvatarDataUrl] = useState<string>('');
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Generate share URL
  const username = currentUser?.id || boardId || 'default';
  const displayName = currentUser?.name || 'CouchTater';
  const showParam = show?.id ? `?show=${encodeURIComponent(show.id)}` : '';
  const shareUrl = `${window.location.origin}/p/${encodeURIComponent(username)}${showParam}`;

  // Default quote / tagline based on episode review, triggerReason, or show notes
  useEffect(() => {
    if (!show) return;
    const watchedEp = show.latestWatched?.episode || 0;
    const currentEpKey = watchedEp >= 1 ? `S${show.latestWatched?.season || 1}E${watchedEp}` : '';
    const currentEpReview = currentEpKey ? show.episodeReviews?.[currentEpKey] : undefined;

    if (currentEpReview && currentEpReview.trim()) {
      setCustomQuote(`"${currentEpReview.trim()}"`);
    } else if (show.userNotes && show.userNotes.trim()) {
      setCustomQuote(`"${show.userNotes.trim()}"`);
    } else if (triggerReason === 'completed' || show.status === 'Completed') {
      setCustomQuote(`"Just completed watching ${show.title}! Absolute masterpiece."`);
    } else if (triggerReason === 'high_rating' || (show.userScore && show.userScore >= 9)) {
      setCustomQuote(`"Giving ${show.title} a ★ ${show.userScore || 10}/10 score! Don't miss this show."`);
    } else {
      setCustomQuote(`"Currently watching ${show.title} on CouchTaterz!"`);
    }
  }, [show, triggerReason]);

  // Load and convert poster/banner and avatar images to base64 Data URLs
  useEffect(() => {
    if (!show) return;
    setIsImageLoading(true);
    const rawBanner = show.bannerImage || '/fallback-tv.jpg';

    convertToBase64DataUrl(rawBanner)
      .then((b64) => setBannerDataUrl(b64 || rawBanner))
      .finally(() => setIsImageLoading(false));

    if (currentUser?.avatarUrl) {
      convertToBase64DataUrl(currentUser.avatarUrl).then((b64) => setAvatarDataUrl(b64 || currentUser.avatarUrl));
    } else {
      setAvatarDataUrl('');
    }
  }, [show, currentUser]);

  // Generate QR Code data URL
  useEffect(() => {
    QRCode.toDataURL(shareUrl, {
      width: 160,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('Failed to generate QR code:', err));
  }, [shareUrl]);

  if (!isOpen || !show) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Theme styling definitions
  const themeStyles: Record<CardTheme, {
    background: string;
    border: string;
    glow: string;
    accentGradient: string;
    badgeBg: string;
    badgeText: string;
    quoteBg: string;
  }> = {
    neon: {
      background: 'bg-[#0B0C10]',
      border: 'border-purple-500/40',
      glow: 'shadow-[0_0_50px_rgba(168,85,247,0.25)]',
      accentGradient: 'from-purple-500 via-indigo-500 to-pink-500',
      badgeBg: 'bg-purple-500/20 border-purple-400/40',
      badgeText: 'text-purple-300',
      quoteBg: 'bg-purple-950/40 border-purple-500/30 text-purple-100',
    },
    cyberpunk: {
      background: 'bg-[#070D18]',
      border: 'border-cyan-500/40',
      glow: 'shadow-[0_0_50px_rgba(6,182,212,0.25)]',
      accentGradient: 'from-cyan-400 via-blue-500 to-fuchsia-500',
      badgeBg: 'bg-cyan-500/20 border-cyan-400/40',
      badgeText: 'text-cyan-300',
      quoteBg: 'bg-cyan-950/40 border-cyan-500/30 text-cyan-100',
    },
    twilight: {
      background: 'bg-[#0E0F17]',
      border: 'border-blue-500/40',
      glow: 'shadow-[0_0_50px_rgba(59,130,246,0.25)]',
      accentGradient: 'from-blue-500 via-violet-600 to-purple-600',
      badgeBg: 'bg-blue-500/20 border-blue-400/40',
      badgeText: 'text-blue-300',
      quoteBg: 'bg-blue-950/40 border-blue-500/30 text-blue-100',
    },
    emerald: {
      background: 'bg-[#06120E]',
      border: 'border-emerald-500/40',
      glow: 'shadow-[0_0_50px_rgba(16,185,129,0.25)]',
      accentGradient: 'from-emerald-400 via-teal-500 to-cyan-500',
      badgeBg: 'bg-emerald-500/20 border-emerald-400/40',
      badgeText: 'text-emerald-300',
      quoteBg: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-100',
    },
    sunset: {
      background: 'bg-[#120B0B]',
      border: 'border-amber-500/40',
      glow: 'shadow-[0_0_50px_rgba(245,158,11,0.25)]',
      accentGradient: 'from-amber-500 via-orange-500 to-rose-500',
      badgeBg: 'bg-amber-500/20 border-amber-400/40',
      badgeText: 'text-amber-300',
      quoteBg: 'bg-amber-950/40 border-amber-500/30 text-amber-100',
    },
  };

  const currentTheme = themeStyles[selectedTheme];

  const currentEpSeason = show.latestWatched?.season || 1;
  const currentEpNumber = show.latestWatched?.episode || 0;
  const currentEpKey = `S${currentEpSeason}E${currentEpNumber}`;
  const currentEpReview = show.episodeReviews?.[currentEpKey];
  const isFeaturedEpReview = Boolean(
    currentEpReview &&
    currentEpReview.trim() &&
    customQuote.toLowerCase().includes(currentEpReview.trim().toLowerCase())
  );

  // Export as high-res PNG image
  const handleDownloadPng = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.98,
        pixelRatio: 2.5,
        cacheBust: false,
      });

      const link = document.createElement('a');
      link.download = `${show.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-couchtaterz-story.png`;
      link.href = dataUrl;
      link.click();
      showToast('Story Card saved to downloads!');
    } catch (err) {
      console.error('Failed to export Story Card image:', err);
      showToast('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Trigger Native Web Share or fallback copy link
  const handleNativeShare = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, { quality: 0.95, pixelRatio: 2, cacheBust: false });
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `${show.title}-couchtaterz-story.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${displayName}'s CouchTaterz Story`,
          text: `Check out ${show.title} on CouchTaterz!`,
          files: [file],
          url: shareUrl,
        });
        showToast('Shared successfully!');
      } else if (navigator.share) {
        await navigator.share({
          title: `${displayName}'s CouchTaterz Story`,
          text: `Check out ${show.title} on CouchTaterz!`,
          url: shareUrl,
        });
        showToast('Link shared!');
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopiedLink(true);
        showToast('Share link copied to clipboard!');
        setTimeout(() => setCopiedLink(false), 2500);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
        showToast('Copying share link instead...');
        navigator.clipboard.writeText(shareUrl);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    showToast('Share link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const getTodayDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatAirDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      const shortMonth = d.toLocaleDateString('en-US', { month: 'short' });
      const twoDigitYear = String(year).slice(-2);
      return `${shortMonth} ${day} '${twoDigitYear}`;
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const shortMonth = d.toLocaleDateString('en-US', { month: 'short' });
    const twoDigitYear = String(d.getFullYear()).slice(-2);
    return `${shortMonth} ${d.getDate()} '${twoDigitYear}`;
  };

  const getAiringStatusText = (airDateStr?: string) => {
    if (!airDateStr) return 'Next Episode:';
    const dateOnly = airDateStr.split('T')[0];
    const today = getTodayDateString();
    
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

    if (diffDays === 0) return `Airing Today! (${formatAirDate(airDateStr)})`;
    if (diffDays === 1) return `Airing Tomorrow! (${formatAirDate(airDateStr)})`;
    if (diffDays > 1) return `Next Airing: ${formatAirDate(airDateStr)}`;
    return `Aired: ${formatAirDate(airDateStr)}`;
  };

  // Check if show has an upcoming or recent next episode regardless of tracker progress
  const shouldShowNextEpNotification = Boolean(
    show.nextEpisode && !show.concluded
  );

  // Action badge text based on status or user rating
  const getHeaderBadge = () => {
    if (show.status === 'Completed' || triggerReason === 'completed') {
      return 'SERIES COMPLETED';
    }
    if (shouldShowNextEpNotification && show.nextEpisode) {
      return 'AIRING SOON';
    }
    if (triggerReason === 'high_rating' || (show.userScore && show.userScore >= 9)) {
      return 'HIGHLY RECOMMENDED';
    }
    return 'BINGE SPOTLIGHT';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-xl shadow-2xl text-xs flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="relative w-full max-w-xl bg-[#0F1117] border border-white/10 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 md:p-6 shadow-2xl space-y-3.5 sm:space-y-4 my-auto max-h-[92vh] overflow-y-auto text-slate-100">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 sm:pb-4">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-purple-500/20 via-pink-500/20 to-amber-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-white tracking-tight">9:16 Social Story Card</h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400">Formatted for Social Media & Stories</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Theme Selector Controls */}
        <div className="flex items-center gap-2 bg-[#161822] p-1.5 sm:p-2 px-2.5 sm:px-3 rounded-xl sm:rounded-2xl border border-white/5 overflow-x-auto no-scrollbar scrollbar-none">
          <span className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-wider pl-0.5 shrink-0">Theme:</span>
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {(['neon', 'cyberpunk', 'twilight', 'emerald', 'sunset'] as CardTheme[]).map((theme) => (
              <button
                key={theme}
                onClick={() => setSelectedTheme(theme)}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-extrabold capitalize transition-all cursor-pointer whitespace-nowrap ${
                  selectedTheme === theme
                    ? 'bg-white text-slate-950 shadow-md scale-100'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Quote / Review Input Toggle */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-400 flex items-center gap-1">
              <Edit3 className="w-3.5 h-3.5 text-purple-400" />
              <span>Story Quote / Episode Review:</span>
            </span>
            <button
              onClick={() => setIsEditingQuote(!isEditingQuote)}
              className="text-purple-400 hover:text-purple-300 font-extrabold text-[10px] underline cursor-pointer"
            >
              {isEditingQuote ? 'Done' : 'Edit Note'}
            </button>
          </div>

          {/* Quick preset selector pills if episode review or show notes exist */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[10px]">
            {currentEpReview && (
              <button
                type="button"
                onClick={() => setCustomQuote(`"${currentEpReview.trim()}"`)}
                className={`px-2 py-0.5 rounded-lg border font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer ${
                  isFeaturedEpReview
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                <Crown className="w-2.5 h-2.5 text-amber-400" />
                <span>Use S{currentEpSeason}E{currentEpNumber} Review</span>
              </button>
            )}
            {show.userNotes && (
              <button
                type="button"
                onClick={() => setCustomQuote(`"${show.userNotes.trim()}"`)}
                className={`px-2 py-0.5 rounded-lg border font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer ${
                  customQuote === `"${show.userNotes.trim()}"`
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                <MessageSquare className="w-2.5 h-2.5 text-purple-400" />
                <span>Use Show Note</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setCustomQuote(`"Currently watching ${show.title} on CouchTaterz!"`)}
              className={`px-2 py-0.5 rounded-lg border font-bold shrink-0 transition-all cursor-pointer ${
                customQuote === `"Currently watching ${show.title} on CouchTaterz!"`
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
              }`}
            >
              Tagline
            </button>
          </div>

          {isEditingQuote ? (
            <textarea
              value={customQuote}
              onChange={(e) => setCustomQuote(e.target.value)}
              placeholder="Add your note or review summary..."
              className="w-full bg-[#161822] border border-purple-500/40 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none h-16"
            />
          ) : (
            <p className="text-xs text-slate-300 italic bg-[#161822]/80 p-2.5 rounded-xl border border-white/5 truncate">
              {customQuote || 'No custom note added'}
            </p>
          )}
        </div>

        {/* --- 9:16 STORY CARD CANVAS PREVIEW --- */}
        <div className="flex justify-center my-2">
          <div
            ref={cardRef}
            id="couchtaterz-story-card"
            className={`relative w-[320px] xs:w-[350px] aspect-[9/16] ${currentTheme.background} border ${currentTheme.border} ${currentTheme.glow} rounded-[32px] p-5 flex flex-col justify-between overflow-hidden text-white font-sans select-none transition-all duration-300`}
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.08) 0%, transparent 70%)',
            }}
          >
            {/* Background Aesthetic Ambient Light Glows */}
            <div className={`absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br ${currentTheme.accentGradient} rounded-full blur-[80px] opacity-30 pointer-events-none`} />
            <div className={`absolute -bottom-16 -left-16 w-48 h-48 bg-gradient-to-tr ${currentTheme.accentGradient} rounded-full blur-[80px] opacity-30 pointer-events-none`} />

            {/* CARD TOP SECTION: USER & HEADER BADGE */}
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                {/* User Avatar + Display Name */}
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 p-0.5 shadow-lg">
                    {currentUser?.avatarUrl ? (
                      <img
                        src={avatarDataUrl || currentUser.avatarUrl}
                        alt={displayName}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-black text-purple-300">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white leading-tight tracking-tight">{displayName}</h4>
                    {username && username.toLowerCase() !== 'default' && (
                      <p className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">{username}</p>
                    )}
                  </div>
                </div>

                {/* Event Status Header Badge */}
                <div className="text-right">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest shadow-sm backdrop-blur-md ${currentTheme.badgeBg} ${currentTheme.badgeText}`}>
                    <Sparkles className="w-2.5 h-2.5 shrink-0 opacity-80" />
                    <span>{getHeaderBadge()}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* CARD MIDDLE SECTION: SHOW POSTER & DETAILS */}
            <div className="relative z-10 space-y-3 my-auto">
              {/* Poster Container */}
              <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl aspect-[16/10] bg-slate-900 group">
                <img
                  src={bannerDataUrl || show.bannerImage || '/fallback-tv.jpg'}
                  alt={show.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/fallback-tv.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* Rating Badge Overlay */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 flex-nowrap z-10 max-w-[calc(100%-1.5rem)]">
                  {show.userScore && (
                    <div className="px-2.5 py-1 bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 whitespace-nowrap shrink-0 leading-none">
                      <Star className="w-3.5 h-3.5 fill-current shrink-0" />
                      <span className="leading-none whitespace-nowrap">{show.userScore}/10</span>
                    </div>
                  )}
                  {show.rottenTomatoesScore && (
                    <div className="px-2.5 py-1 bg-red-600 text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 whitespace-nowrap shrink-0 leading-none">
                      <span className="text-xs leading-none shrink-0 inline-block select-none">🍅</span>
                      <span className="leading-none whitespace-nowrap">{show.rottenTomatoesScore}%</span>
                    </div>
                  )}
                </div>

                {/* Title & Service Tag on Poster */}
                <div className="absolute bottom-3 left-3 right-3 space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-white/15 backdrop-blur-md text-[9px] font-extrabold uppercase tracking-wider text-slate-200 border border-white/20 inline-block">
                      {show.streamingService}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white tracking-tight leading-tight drop-shadow-md line-clamp-2">
                    {show.title}
                  </h2>
                </div>
              </div>

              {/* Green Next Airing Date Reminder Banner */}
              {shouldShowNextEpNotification && show.nextEpisode && (
                <div className="px-3 py-2 rounded-xl border shadow-md bg-emerald-950/80 border-emerald-500/40 text-emerald-300 backdrop-blur-md space-y-0.5">
                  <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-emerald-400">
                    <span className="relative flex h-1.5 w-1.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
                    </span>
                    <span>{getAiringStatusText(show.nextEpisode.airDate)}</span>
                  </div>
                  <div className="text-xs font-bold text-white tracking-tight leading-snug break-words">
                    S{show.nextEpisode.season}E{show.nextEpisode.episode}
                    {show.nextEpisode.title ? ` "${show.nextEpisode.title}"` : ''}
                  </div>
                </div>
              )}

              {/* Custom Quote Box */}
              {customQuote && (
                <div className={`p-3 rounded-2xl border ${currentTheme.quoteBg} text-center space-y-1 shadow-inner backdrop-blur-sm relative overflow-hidden`}>
                  {isFeaturedEpReview && (
                    <div className="flex items-center justify-center gap-1 text-[8.5px] font-black uppercase tracking-wider text-amber-300 pb-0.5">
                      <Crown className="w-2.5 h-2.5 text-amber-400 shrink-0 fill-amber-400/20" />
                      <span>S{currentEpSeason}E{currentEpNumber} VIP REVIEW</span>
                    </div>
                  )}
                  <p className="text-[11px] font-medium italic leading-snug break-words">
                    {customQuote}
                  </p>
                </div>
              )}

              {/* Current Episode Title above Progress, Status & Platform */}
              {show.latestWatched?.title && show.latestWatched.title !== 'Not Started' && (
                <div className="flex items-center justify-center gap-1.5 text-center">
                  <Tv className="w-3 h-3 text-purple-300 shrink-0" />
                  <span className="text-[10px] font-semibold text-purple-200 truncate">
                    Current Ep: <span className="font-extrabold text-white">{show.latestWatched.title}</span>
                  </span>
                </div>
              )}

              {/* Micro Stats Bar */}
              <div className="grid grid-cols-3 gap-1.5 bg-black/40 border border-white/10 p-2 rounded-2xl text-center backdrop-blur-sm">
                <div className="space-y-0.5">
                  <div className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
                    <Layers className="w-2.5 h-2.5 text-purple-400" />
                    <span>Progress</span>
                  </div>
                  <div className="text-[11px] font-black text-white truncate px-1">
                    S{show.latestWatched?.season || 1} · Ep {show.latestWatched?.episode || 0}
                  </div>
                </div>

                <div className="space-y-0.5 border-x border-white/10">
                  <div className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
                    <Calendar className="w-2.5 h-2.5 text-cyan-400" />
                    <span>Status</span>
                  </div>
                  <div className="text-[11px] font-black text-white truncate px-1">
                    {show.concluded ? 'Concluded' : 'Airing'}
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
                    <Film className="w-2.5 h-2.5 text-amber-400" />
                    <span>Platform</span>
                  </div>
                  <div className="text-[11px] font-black text-white truncate px-1">
                    {show.streamingService}
                  </div>
                </div>
              </div>
            </div>

            {/* CARD BOTTOM SECTION: BRANDING, QR CODE & CTA */}
            <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center shadow-md shadow-blue-600/25 text-white shrink-0">
                    <Tv className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h1 className="text-xs font-black tracking-tight uppercase leading-none">
                      <span className="text-blue-500">COUCH</span>
                      <span className="text-white">TATERZ</span>
                    </h1>
                    <p className="text-[7.5px] font-extrabold tracking-[0.18em] text-slate-400 uppercase mt-0.5 leading-none whitespace-nowrap">
                      YOUR BINGE BUDDY
                    </p>
                  </div>
                </div>
                <p className="text-[8px] font-bold text-slate-400 tracking-wider">
                  couchtaterz.ai.studio{username && username.toLowerCase() !== 'default' ? `/p/${username}` : ''}
                </p>
              </div>

              {/* QR Code */}
              {qrCodeDataUrl && (
                <div className="bg-white p-1 rounded-xl shadow-md border border-white/20 shrink-0">
                  <img src={qrCodeDataUrl} alt="Scan QR" className="w-10 h-10 rounded-lg" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
          <button
            onClick={handleDownloadPng}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-purple-600/25 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating PNG...' : 'Download 9:16 PNG'}</span>
          </button>

          <button
            onClick={handleNativeShare}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs shadow-lg shadow-cyan-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Share2 className="w-4 h-4" />
            <span>Share to Story / Apps</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 font-extrabold text-xs transition-all cursor-pointer border border-white/10"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Share URL'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
