import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  X, 
  Download, 
  Share2, 
  Sparkles, 
  Star, 
  Copy, 
  Check, 
  Tv, 
  Edit3, 
  Layers, 
  Calendar, 
  Film, 
  Crown, 
  MessageSquare,
  UserPlus,
  MessageCircle,
  Smartphone,
  RectangleVertical,
  Square,
  Quote,
  Trophy,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { toPng } from 'html-to-image';
import QRCode from 'qrcode';
import { TvShow, User } from '../types';
import { getTitleForEpisode, getMaxAiredEpisodeForSeason } from '../utils/airedEpisodes';
import { getEpisodeAirDate } from '../utils/showSchedules';
import { getShowBannerImage, getShowFallbackBanner } from '../utils/showBanners';

export type CardFormat = 'story' | 'portrait' | 'square';

export interface CardImageOption {
  id: string;
  url: string;
  thumbnail: string;
  label: string;
  source: string;
  category: 'default' | 'episode' | 'backdrop';
}

interface SocialStoryCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  show: TvShow | null;
  currentUser: User | null;
  boardId?: string;
  triggerReason?: 'completed' | 'high_rating' | 'manual' | 'episode_review';
  allUsers?: User[];
  friendsList?: string[];
  theme?: 'dark' | 'light';
  initialFormat?: CardFormat;
}

type CardTheme = 'neon' | 'cyberpunk' | 'twilight' | 'emerald' | 'sunset';
type ModalTab = 'story' | 'invite';

// Utility to get critic review score descriptor and color (IGN style)
const getScoreDescriptor = (score: number | undefined | null): { label: string; color: string } => {
  if (score == null) return { label: 'REVIEW', color: '#22c55e' };
  if (score >= 10) return { label: 'MASTERPIECE', color: '#22c55e' };
  if (score >= 9) return { label: 'AMAZING', color: '#22c55e' };
  if (score >= 8) return { label: 'GREAT', color: '#22c55e' };
  if (score >= 7) return { label: 'GOOD', color: '#10b981' };
  if (score >= 6) return { label: 'OKAY', color: '#eab308' };
  if (score >= 5) return { label: 'MEDIOCRE', color: '#f59e0b' };
  if (score >= 4) return { label: 'BAD', color: '#ef4444' };
  return { label: 'POOR', color: '#ef4444' };
};

// Utility to convert image URL to base64 Data URL via server proxy to prevent CORS export breaks
const convertToBase64DataUrl = async (imgUrl: string): Promise<string> => {
  if (!imgUrl || typeof imgUrl !== 'string') return '';
  const cleanUrl = imgUrl.trim();
  if (!cleanUrl) return '';
  if (cleanUrl.startsWith('data:')) return cleanUrl;

  const proxyUrl = cleanUrl.startsWith('http')
    ? `/api/image-proxy?url=${encodeURIComponent(cleanUrl)}`
    : cleanUrl;

  try {
    const res = await fetch(proxyUrl);
    if (res.ok) {
      const blob = await res.blob();
      // Guard against tiny empty images (e.g. 1x1 blank responses < 300 bytes)
      if (blob.size < 300) {
        console.warn('Image proxy returned tiny/empty payload for:', cleanUrl);
        return '';
      }
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string) || cleanUrl);
        reader.onerror = () => resolve(cleanUrl);
        reader.readAsDataURL(blob);
      });
    }
  } catch (err) {
    console.warn('Image conversion to base64 failed:', err);
  }
  return cleanUrl;
};

export const SocialStoryCardModal: React.FC<SocialStoryCardModalProps> = ({
  isOpen,
  onClose,
  show,
  currentUser,
  boardId = 'default',
  triggerReason = 'manual',
  initialFormat = 'story',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<ModalTab>('story');
  const [cardFormat, setCardFormat] = useState<CardFormat>(initialFormat);
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>('neon');
  const [customQuote, setCustomQuote] = useState<string>('');
  const [isEditingQuote, setIsEditingQuote] = useState<boolean>(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [bannerDataUrl, setBannerDataUrl] = useState<string>('');
  const [avatarDataUrl, setAvatarDataUrl] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedInviteLink, setCopiedInviteLink] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent || '');

  // Alternative Official Images & Episode Stills State
  const [selectedImageOption, setSelectedImageOption] = useState<CardImageOption | null>(null);
  const [availableImages, setAvailableImages] = useState<CardImageOption[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState<boolean>(false);

  // Generate URLs
  const username = currentUser?.id || boardId || 'default';
  const displayName = currentUser?.name || 'CouchTater';
  const showParam = show?.id ? `?show=${encodeURIComponent(show.id)}` : '';
  const shareUrl = `${window.location.origin}/p/${encodeURIComponent(username)}${showParam}`;
  const inviteUrl = `${window.location.origin}/?inviteFrom=${encodeURIComponent(username)}${show?.id ? `&show=${encodeURIComponent(show.id)}` : ''}`;

  // Current episode context for stills search
  const epSeason = show?.latestWatched?.season || 1;
  const epNumber = show?.latestWatched?.episode || 0;

  // All available episode reviews logged for this show
  const availableEpisodeReviews = useMemo(() => {
    if (!show?.episodeReviews) return [];
    return Object.entries(show.episodeReviews)
      .filter(([_, rev]) => typeof rev === 'string' && rev.trim().length > 0)
      .map(([key, review]) => {
        const match = key.match(/S(\d+)E(\d+)/i);
        const season = match ? parseInt(match[1], 10) : 1;
        const episode = match ? parseInt(match[2], 10) : 0;
        return { key, season, episode, review: review as string };
      })
      .sort((a, b) => b.season - a.season || b.episode - a.episode);
  }, [show?.episodeReviews]);

  // Default reviewed episode key (prioritize latest watched if reviewed, or first logged review)
  const defaultEpKey = useMemo(() => {
    const watchedEp = show?.latestWatched?.episode || 0;
    const watchedSeason = show?.latestWatched?.season || 1;
    const key = watchedEp >= 1 ? `S${watchedSeason}E${watchedEp}` : '';
    if (key && (show?.episodeReviews?.[key] || show?.episodeScores?.[key])) return key;
    if (availableEpisodeReviews.length > 0) return availableEpisodeReviews[0].key;
    const scoreKeys = Object.keys(show?.episodeScores || {});
    if (scoreKeys.length > 0) return scoreKeys[0];
    return key || 'S1E1';
  }, [show, availableEpisodeReviews]);

  const [activeReviewEpKey, setActiveReviewEpKey] = useState<string>(defaultEpKey);

  useEffect(() => {
    setActiveReviewEpKey(defaultEpKey);
  }, [defaultEpKey]);

  const parsedEp = useMemo(() => {
    const match = activeReviewEpKey.match(/S(\d+)E(\d+)/i);
    if (match) {
      return { season: parseInt(match[1], 10), episode: parseInt(match[2], 10) };
    }
    return {
      season: show?.latestWatched?.season || 1,
      episode: show?.latestWatched?.episode || 0
    };
  }, [activeReviewEpKey, show]);

  // Track whether user explicitly selected an episode review vs general tagline/notes
  const [isEpisodeReviewSelected, setIsEpisodeReviewSelected] = useState<boolean>(() => {
    return triggerReason === 'episode_review' || Boolean(show?.latestWatched?.episode && show?.episodeReviews?.[`S${show?.latestWatched?.season || 1}E${show?.latestWatched?.episode}`]);
  });

  // Default quote / tagline based on episode review, triggerReason, or show notes
  useEffect(() => {
    if (!show) return;
    const watchedEp = show.latestWatched?.episode || 0;
    const currentEpKey = watchedEp >= 1 ? `S${show.latestWatched?.season || 1}E${watchedEp}` : '';
    const currentEpReview = currentEpKey ? show.episodeReviews?.[currentEpKey] : undefined;
    const firstReview = availableEpisodeReviews[0];

    if (triggerReason === 'episode_review') {
      setIsEpisodeReviewSelected(true);
      if (currentEpReview && currentEpReview.trim()) {
        setActiveReviewEpKey(currentEpKey);
        setCustomQuote(`"${currentEpReview.trim()}"`);
      } else if (firstReview) {
        setActiveReviewEpKey(firstReview.key);
        setCustomQuote(`"${firstReview.review.trim()}"`);
      } else {
        setActiveReviewEpKey(currentEpKey || 'S1E1');
        setCustomQuote(`"Just watched S${show.latestWatched?.season || 1}E${watchedEp}! Incredible episode."`);
      }
    } else if (currentEpReview && currentEpReview.trim()) {
      setIsEpisodeReviewSelected(true);
      setActiveReviewEpKey(currentEpKey);
      setCustomQuote(`"${currentEpReview.trim()}"`);
    } else if (show.userNotes && show.userNotes.trim()) {
      setIsEpisodeReviewSelected(false);
      setCustomQuote(`"${show.userNotes.trim()}"`);
    } else if (triggerReason === 'completed' || show.status === 'Completed') {
      setIsEpisodeReviewSelected(false);
      setCustomQuote(`"Just completed watching ${show.title}! Absolute masterpiece."`);
    } else if (triggerReason === 'high_rating' || (show.userScore && show.userScore >= 9)) {
      setIsEpisodeReviewSelected(false);
      setCustomQuote(`"Giving ${show.title} a ★ ${show.userScore || 10}/10 score! Don't miss this show."`);
    } else {
      setIsEpisodeReviewSelected(false);
      setCustomQuote(`"Currently watching ${show.title} on CouchTaterz!"`);
    }
  }, [show, triggerReason, availableEpisodeReviews]);

  // Load and convert poster/banner and avatar images to base64 Data URLs
  useEffect(() => {
    if (!show) return;
    const rawBanner = selectedImageOption?.url || getShowBannerImage(show);

    convertToBase64DataUrl(rawBanner)
      .then((b64) => setBannerDataUrl(b64 || rawBanner));

    if (currentUser?.avatarUrl) {
      convertToBase64DataUrl(currentUser.avatarUrl).then((b64) => setAvatarDataUrl(b64 || currentUser.avatarUrl));
    } else {
      setAvatarDataUrl('');
    }
  }, [show, currentUser, selectedImageOption]);

  // Fetch official episodic stills & series backdrops
  useEffect(() => {
    if (!isOpen || !show) return;

    const rawBanner = getShowBannerImage(show);
    const defaultOption: CardImageOption = {
      id: 'default-banner',
      url: rawBanner,
      thumbnail: rawBanner,
      label: 'Series Poster',
      source: 'Official Poster',
      category: 'default',
    };

    setSelectedImageOption(defaultOption);
    setAvailableImages([defaultOption]);
    setIsLoadingImages(true);

    const s = epSeason || 1;
    const e = epNumber && epNumber > 0 ? epNumber : 1;

    fetch(`/api/episode-images?title=${encodeURIComponent(show.title)}&season=${s}&episode=${e}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        const options: CardImageOption[] = [defaultOption];
        const seenUrls = new Set<string>([rawBanner]);

        if (Array.isArray(data.episodeStills)) {
          data.episodeStills.forEach((still: any, idx: number) => {
            if (still.url && !seenUrls.has(still.url)) {
              seenUrls.add(still.url);
              options.push({
                id: still.id || `ep-still-${idx + 1}`,
                url: still.url,
                thumbnail: still.thumbnail || still.url,
                label: still.label || `Scene Still ${idx + 1}`,
                source: still.source || 'Episode Still',
                category: 'episode',
              });
            }
          });
        }

        if (Array.isArray(data.showBackdrops)) {
          data.showBackdrops.forEach((bd: any, idx: number) => {
            if (bd.url && !seenUrls.has(bd.url)) {
              seenUrls.add(bd.url);
              options.push({
                id: bd.id || `backdrop-${idx + 1}`,
                url: bd.url,
                thumbnail: bd.thumbnail || bd.url,
                label: bd.label || `Show Backdrop ${idx + 1}`,
                source: bd.source || 'Show Backdrop',
                category: 'backdrop',
              });
            }
          });
        }

        setAvailableImages(options);
      })
      .catch((err) => {
        console.warn('Failed to load episodic stills:', err);
      })
      .finally(() => {
        setIsLoadingImages(false);
      });
  }, [isOpen, show?.id, show?.title, epSeason, epNumber]);

  // Generate QR Code data URL based on active mode
  useEffect(() => {
    const targetUrl = activeTab === 'invite' ? inviteUrl : shareUrl;
    QRCode.toDataURL(targetUrl, {
      width: 256,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('Failed to generate QR code:', err));
  }, [shareUrl, inviteUrl, activeTab]);

  if (!isOpen || !show) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectImage = async (option: CardImageOption) => {
    setSelectedImageOption(option);
    showToast(`Artwork updated: ${option.label}`);
    const b64 = await convertToBase64DataUrl(option.url);
    setBannerDataUrl(b64 || option.url);
  };

  const handleResetToDefaultImage = async () => {
    if (!show) return;
    const rawBanner = getShowBannerImage(show);
    const defaultOption: CardImageOption = {
      id: 'default-banner',
      url: rawBanner,
      thumbnail: rawBanner,
      label: 'Series Poster',
      source: 'Official Poster',
      category: 'default',
    };
    setSelectedImageOption(defaultOption);
    showToast('Reset to series poster');
    const b64 = await convertToBase64DataUrl(rawBanner);
    setBannerDataUrl(b64 || rawBanner);
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

  const currentEpSeason = parsedEp.season;
  const currentEpNumber = parsedEp.episode;
  const currentEpKey = `S${currentEpSeason}E${currentEpNumber}`;
  const currentEpAltPaddedKey = `S${String(currentEpSeason).padStart(2, '0')}E${String(currentEpNumber).padStart(2, '0')}`;
  const currentEpLegacyKey = `${currentEpSeason}-${currentEpNumber}`;
  const currentEpReview = show.episodeReviews?.[currentEpKey] || show.episodeReviews?.[currentEpAltPaddedKey] || show.episodeReviews?.[currentEpLegacyKey];
  const currentEpScore = show.episodeScores?.[currentEpKey] ?? show.episodeScores?.[currentEpAltPaddedKey] ?? show.episodeScores?.[currentEpLegacyKey];
  const rawScore = currentEpScore != null ? currentEpScore : (show.userScore != null ? show.userScore : 10);
  const scoreVal = rawScore;
  const scoreDescriptor = getScoreDescriptor(scoreVal);
  const isFeaturedEpReview = Boolean(
    (currentEpReview &&
    currentEpReview.trim() &&
    customQuote.toLowerCase().includes(currentEpReview.trim().toLowerCase())) ||
    Boolean(currentEpScore && activeTab === 'story')
  );

  // Episode Review Card Mode:
  // Triggered via 'episode_review', or having an episode review selected/featured.
  const isEpisodeReviewMode = Boolean(
    activeTab !== 'invite' && (
      triggerReason === 'episode_review' ||
      isEpisodeReviewSelected ||
      isFeaturedEpReview ||
      (currentEpScore != null && Boolean(currentEpReview))
    )
  );

  // On episode review cards:
  // 1. RT score is dropped
  // 2. Series score replaces the platform cell at bottom right
  // 3. Episode review is moved to the top right corner of the show/card image
  const showSeriesScoreOnPoster = Boolean(show.userScore && !isEpisodeReviewMode);
  const showRtScoreOnPoster = Boolean(show.rottenTomatoesScore && !isEpisodeReviewMode);

  const currentEpResolvedTitle = getTitleForEpisode(show, currentEpSeason, currentEpNumber);
  const currentEpName = (currentEpResolvedTitle && currentEpResolvedTitle !== 'Not Started' && !/^Episode \d+$/i.test(currentEpResolvedTitle))
    ? currentEpResolvedTitle
    : (show.latestWatched?.title && show.latestWatched.title !== 'Not Started' && !/^Episode \d+$/i.test(show.latestWatched.title) ? show.latestWatched.title : '');

  // Season & Episode Progress Calculations for visual progress bar
  const currentWatchedEp = show.latestWatched?.episode || 0;
  const maxEpisodesInSeason = getMaxAiredEpisodeForSeason(show, currentEpSeason);
  const isCaughtUp = currentWatchedEp > 0 && currentWatchedEp >= maxEpisodesInSeason;
  const isSeriesCompleted = show.status === 'Completed';
  const progressPercent = isSeriesCompleted
    ? 100
    : maxEpisodesInSeason > 0
      ? Math.min(100, Math.round((currentWatchedEp / maxEpisodesInSeason) * 100))
      : 0;

  // Helpers for format-specific filenames and labels
  const getFormatLabel = (fmt: CardFormat) => {
    switch (fmt) {
      case 'portrait': return '4:5 Feed Post';
      case 'square': return '1:1 Square';
      case 'story': default: return '9:16 Story';
    }
  };

  const quoteText = activeTab === 'invite'
    ? `"Join me on CouchTaterz so we can track ${show.title} together!"`
    : customQuote;

  // Dynamic typography scale so reviews of any length (e.g. South Park) are never cut off or clamped
  const getQuoteTypography = (text: string, format: CardFormat) => {
    const len = text.length;
    if (format === 'square') {
      if (len > 180) return 'text-[7.5px] sm:text-[8px] leading-tight';
      if (len > 110) return 'text-[8px] sm:text-[8.5px] leading-snug';
      return 'text-[8.5px] sm:text-[9.5px] leading-snug';
    }
    if (format === 'portrait') {
      if (len > 180) return 'text-[8px] sm:text-[8.5px] leading-tight';
      if (len > 110) return 'text-[8.5px] sm:text-[9px] leading-snug';
      return 'text-[9px] sm:text-[10px] leading-snug';
    }
    // story 9:16
    if (len > 220) return 'text-[8.5px] sm:text-[9px] leading-tight';
    if (len > 130) return 'text-[9px] sm:text-[9.5px] leading-snug';
    if (len > 70) return 'text-[9.5px] sm:text-[10.5px] leading-snug';
    return 'text-[10.5px] sm:text-[11.5px] leading-relaxed';
  };

  const getFormatSuffix = (fmt: CardFormat) => {
    switch (fmt) {
      case 'portrait': return 'feed-4x5';
      case 'square': return 'square-1x1';
      case 'story': default: return 'story-9x16';
    }
  };

  // Export as high-res PNG image with native mobile Photo Library integration
  const handleDownloadPng = async () => {
    if (!cardRef.current || !show) return;
    setIsExporting(true);
    try {
      const isMobileDevice = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent || '');

      // 1. Ensure banner image is converted to a base64 Data URL to prevent CORS canvas blanking
      let activeBanner = bannerDataUrl;
      if (!activeBanner || !activeBanner.startsWith('data:')) {
        const candidateUrl = selectedImageOption?.url || getShowBannerImage(show);
        const converted = await convertToBase64DataUrl(candidateUrl);
        if (converted && converted.startsWith('data:')) {
          activeBanner = converted;
          setBannerDataUrl(converted);
        }
      }

      // 2. Ensure avatar image is converted to base64 Data URL if present
      if (currentUser?.avatarUrl && (!avatarDataUrl || !avatarDataUrl.startsWith('data:'))) {
        const convertedAvatar = await convertToBase64DataUrl(currentUser.avatarUrl);
        if (convertedAvatar && convertedAvatar.startsWith('data:')) {
          setAvatarDataUrl(convertedAvatar);
        }
      }

      // 3. Allow React to flush any state updates to DOM and ensure images decode
      await new Promise((r) => setTimeout(r, 60));

      const cardImages = Array.from(cardRef.current.querySelectorAll('img'));
      await Promise.all(
        cardImages.map((img) => {
          if (img.complete && img.naturalWidth > 0) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            setTimeout(resolve, 1000);
          });
        })
      );

      // 4. Set safe pixelRatio:
      // Mobile Safari crashes/blanks out when pixelRatio exceeds hardware canvas memory (>16MP).
      // pixelRatio 2.0 on mobile yields sharp ~700x1200 exports while staying 100% reliable.
      const pixelRatio = isMobileDevice ? 2.0 : (cardFormat === 'story' ? 3.0 : 2.5);

      // 5. iOS Safari WebKit SVG foreignObject rasterizer warmup pass
      if (isMobileDevice) {
        try {
          await toPng(cardRef.current, { cacheBust: false, skipFonts: true, pixelRatio: 1 });
        } catch {}
        await new Promise((r) => setTimeout(r, 50));
      }

      let dataUrl = await toPng(cardRef.current, {
        quality: 0.98,
        pixelRatio,
        skipFonts: true,
        cacheBust: false,
        backgroundColor: '#0c0e14',
      });

      // 6. Verification check: if output was blank or corrupted (< 2000 bytes), run fallback pass
      if (!dataUrl || dataUrl === 'data:,' || dataUrl.length < 2000) {
        console.warn('Initial card capture returned blank/small payload, executing fallback pass...');
        await new Promise((r) => setTimeout(r, 100));
        dataUrl = await toPng(cardRef.current, {
          quality: 0.95,
          pixelRatio: 1.5,
          skipFonts: true,
          cacheBust: true,
          backgroundColor: '#0c0e14',
        });
      }

      const suffix = getFormatSuffix(cardFormat);
      const fileName = `${show.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-couchtaterz-${suffix}.png`;

      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], fileName, { type: 'image/png' });

      // Automatically copy to clipboard for quick paste on iOS / Android
      try {
        if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        }
      } catch {}

      // On iOS and Android, web browsers cannot directly write to the Camera Roll / Photos app via <a download>.
      // The native Web Share API with files: [file] provides the OS "Save Image" button to save directly into Photos.
      if (isMobileDevice && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: `${show.title} - CouchTaterz Card`,
            text: `Save this review card to your photos or share with friends:`,
            files: [file],
          });
          showToast('Tap "Save Image" in the share sheet to store in Photos!');
          return;
        } catch (shareErr: any) {
          if (shareErr?.name === 'AbortError') {
            // User dismissed share sheet; continue to provide direct file download fallback
          } else {
            console.warn('Mobile web share error, falling back to download:', shareErr);
          }
        }
      }

      // High-performance blob URL download (reliable across mobile browsers and desktop without data URI memory caps)
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = fileName;
      link.href = blobUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);

      if (isMobileDevice) {
        showToast('Downloaded to device Files/Downloads! Use "Share Card" to save to Photos.');
      } else {
        showToast(`${getFormatLabel(cardFormat)} saved to downloads!`);
      }
    } catch (err) {
      console.error('Failed to export card image:', err);
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
      const pixelRatio = cardFormat === 'story' ? 3.375 : 3.0;
      const dataUrl = await toPng(cardRef.current, { quality: 0.95, pixelRatio, cacheBust: false });
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const suffix = getFormatSuffix(cardFormat);
      const file = new File([blob], `${show.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-couchtaterz-${suffix}.png`, { type: 'image/png' });

      const targetUrl = activeTab === 'invite' ? inviteUrl : shareUrl;
      const cleanQuote = customQuote ? customQuote.replace(/^["']|["']$/g, '').trim() : '';
      const shareTitle = activeTab === 'invite' 
        ? `Watch ${show.title} with me on CouchTaterz!` 
        : isEpisodeReviewMode
        ? `${displayName}'s Review: ${show.title} S${currentEpSeason}E${currentEpNumber}`
        : `${displayName}'s CouchTaterz Card`;
      const shareText = activeTab === 'invite'
        ? `Hey! Join me as a Binge Buddy on CouchTaterz so we can track ${show.title} and swap recommendations:`
        : isEpisodeReviewMode && cleanQuote
        ? `${displayName}'s Take on ${show.title} S${currentEpSeason}E${currentEpNumber}${currentEpName ? ` "${currentEpName}"` : ''}:\n"${cleanQuote}"\n\nTrack ${show.title} on CouchTaterz:`
        : `Check out ${show.title} on CouchTaterz!`;

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          files: [file],
          url: targetUrl,
        });
        showToast('Shared successfully!');
      } else if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: targetUrl,
        });
        showToast('Link shared!');
      } else {
        await navigator.clipboard.writeText(targetUrl);
        setCopiedLink(true);
        showToast('Share link copied to clipboard!');
        setTimeout(() => setCopiedLink(false), 2500);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
        const fallbackUrl = activeTab === 'invite' ? inviteUrl : shareUrl;
        showToast('Copying share link instead...');
        navigator.clipboard.writeText(fallbackUrl);
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

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedInviteLink(true);
    showToast('Personal Invite Link copied to clipboard!');
    setTimeout(() => setCopiedInviteLink(false), 2500);
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
    if (!airDateStr) {
      if (show.reviewUpdatedAt || show.statusUpdatedAt) {
        const updateDate = (show.reviewUpdatedAt || show.statusUpdatedAt)!.split('T')[0];
        return `Watched: ${formatAirDate(updateDate)}`;
      }
      return 'Episode Air Date';
    }
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

  const shouldShowNextEpNotification = Boolean(
    show.nextEpisode && !show.concluded
  );

  // Resolve canonical episode air date for the reviewed episode (if in episode review mode)
  const canonicalReviewedEp = getEpisodeAirDate(show.title, currentEpSeason, currentEpNumber);
  const reviewedEpAirDate = canonicalReviewedEp?.airDate || 
    (show.nextEpisode?.season === currentEpSeason && show.nextEpisode?.episode === currentEpNumber 
      ? show.nextEpisode.airDate 
      : undefined);

  // Air Date Banner display fields: split into its own box reflecting the reviewed episode or next episode
  const displayAirSeason = isEpisodeReviewMode ? currentEpSeason : show.nextEpisode?.season;
  const displayAirEpisode = isEpisodeReviewMode ? currentEpNumber : show.nextEpisode?.episode;
  const displayAirTitle = isEpisodeReviewMode ? currentEpName : (show.nextEpisode?.title || '');
  const displayAirDate = isEpisodeReviewMode 
    ? (reviewedEpAirDate || (show.nextEpisode?.season === currentEpSeason && show.nextEpisode?.episode === currentEpNumber ? show.nextEpisode.airDate : undefined))
    : show.nextEpisode?.airDate;

  const shouldShowAirDateBanner = isEpisodeReviewMode
    ? false // Cleanly integrated into the Episode Take banner header so review text has full height
    : Boolean(shouldShowNextEpNotification && show.nextEpisode);

  // Action badge text based on status or user rating
  const getHeaderBadge = () => {
    if (activeTab === 'invite') {
      return 'BUDDY INVITATION';
    }
    if (isEpisodeReviewMode) {
      return 'EPISODE REVIEW';
    }
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

  // Pre-filled SMS / WhatsApp message string
  const inviteSmsBody = `Hey! Check out ${show.title} with me on CouchTaterz! Join as my Binge Buddy here: ${inviteUrl}`;

  // Handle Text/SMS with Card Image
  const handleSendSmsWithCard = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const pixelRatio = cardFormat === 'story' ? 3.375 : 3.0;
      const dataUrl = await toPng(cardRef.current, { quality: 0.95, pixelRatio, cacheBust: false });
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const suffix = getFormatSuffix(cardFormat);
      const file = new File([blob], `${show.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-invite-${suffix}.png`, { type: 'image/png' });

      // Automatically copy image to clipboard so it's ready to paste into any chat or text
      try {
        if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
        }
      } catch {
        // clipboard image write fallback
      }

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Watch ${show.title} on CouchTaterz!`,
          text: inviteSmsBody,
          files: [file],
        });
        showToast('Invite Card & text ready to send!');
      } else {
        showToast('Card image copied! Paste it in your text message.');
        window.location.href = `sms:?&body=${encodeURIComponent(inviteSmsBody)}`;
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing SMS with image:', err);
        window.location.href = `sms:?&body=${encodeURIComponent(inviteSmsBody)}`;
      }
    } finally {
      setIsExporting(false);
    }
  };

  // Handle WhatsApp with Card Image
  const handleSendWhatsAppWithCard = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const pixelRatio = cardFormat === 'story' ? 3.375 : 3.0;
      const dataUrl = await toPng(cardRef.current, { quality: 0.95, pixelRatio, cacheBust: false });
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const suffix = getFormatSuffix(cardFormat);
      const file = new File([blob], `${show.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-invite-${suffix}.png`, { type: 'image/png' });

      try {
        if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
        }
      } catch {
        // clipboard fallback
      }

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Watch ${show.title} on CouchTaterz!`,
          text: inviteSmsBody,
          files: [file],
        });
        showToast('Invite Card ready to send!');
      } else {
        showToast('Card image copied! Paste it in WhatsApp.');
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(inviteSmsBody)}`, '_blank');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(inviteSmsBody)}`, '_blank');
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 font-black px-4 py-2.5 rounded-2xl shadow-2xl text-xs flex items-center gap-2 animate-bounce border border-emerald-400">
          <Check className="w-4 h-4 stroke-[2.5]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="relative w-full max-w-xl bg-[#0F1117] border border-white/10 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 md:p-6 shadow-2xl space-y-3.5 sm:space-y-4 my-auto max-h-[94vh] overflow-y-auto text-slate-100">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 sm:pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-purple-500/20 via-pink-500/20 to-amber-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0">
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-white tracking-tight flex items-center gap-1.5">
                <span>Social Share Card</span>
                <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[9px] font-extrabold uppercase border border-purple-500/30">
                  {cardFormat === 'story' ? '9:16 Story' : cardFormat === 'portrait' ? '4:5 Feed Post' : '1:1 Square'}
                </span>
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400">
                {cardFormat === 'story'
                  ? 'Optimized for Instagram Stories, TikTok & Reels (1080×1920)'
                  : cardFormat === 'portrait'
                  ? 'Optimized for Instagram Feed Posts & Threads (1080×1350)'
                  : 'Optimized for photo feeds, Discord, X & carousels (1080×1080)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* 2-Segment Mode Selector Bar: Social Story vs Invite Friend */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#161822] rounded-2xl border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('story')}
            className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'story'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Social Share Card</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('invite')}
            className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'invite'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite a Friend</span>
          </button>
        </div>

        {/* Format & Theme Toolbar */}
        <div className="space-y-2">
          {/* Aspect Ratio / Format Selector */}
          <div className="bg-[#161822] p-1.5 rounded-xl sm:rounded-2xl border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 pl-1.5 shrink-0">
              <span className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-wider">
                Card Size:
              </span>
              <span className="text-[9px] font-mono font-bold text-purple-400 hidden sm:inline">
                {cardFormat === 'story' ? '1080×1920' : cardFormat === 'portrait' ? '1080×1350' : '1080×1080'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 flex-1 sm:max-w-xs">
              <button
                type="button"
                onClick={() => setCardFormat('story')}
                className={`py-1.5 px-2 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  cardFormat === 'story'
                    ? 'bg-white text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                title="9:16 Vertical Story (IG Stories, TikTok, Reels)"
              >
                <Smartphone className="w-3 h-3 shrink-0" />
                <span>Story</span>
                <span className={`text-[8.5px] px-1 py-0.2 rounded font-mono ${
                  cardFormat === 'story' ? 'bg-slate-200 text-slate-900 font-black' : 'bg-white/10 text-slate-400'
                }`}>
                  9:16
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCardFormat('portrait')}
                className={`py-1.5 px-2 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  cardFormat === 'portrait'
                    ? 'bg-white text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                title="4:5 Portrait Post (Instagram & Threads Feeds)"
              >
                <RectangleVertical className="w-3 h-3 shrink-0" />
                <span>Feed</span>
                <span className={`text-[8.5px] px-1 py-0.2 rounded font-mono ${
                  cardFormat === 'portrait' ? 'bg-slate-200 text-slate-900 font-black' : 'bg-white/10 text-slate-400'
                }`}>
                  4:5
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCardFormat('square')}
                className={`py-1.5 px-2 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  cardFormat === 'square'
                    ? 'bg-white text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                title="1:1 Square Card (Photos, Discord, X, Carousels)"
              >
                <Square className="w-3 h-3 shrink-0" />
                <span>Square</span>
                <span className={`text-[8.5px] px-1 py-0.2 rounded font-mono ${
                  cardFormat === 'square' ? 'bg-slate-200 text-slate-900 font-black' : 'bg-white/10 text-slate-400'
                }`}>
                  1:1
                </span>
              </button>
            </div>
          </div>

          {/* Theme Selector Controls (Available for both Story & Invite cards) */}
          <div className="flex items-center gap-2 bg-[#161822] p-1.5 sm:p-2 px-2.5 sm:px-3 rounded-xl sm:rounded-2xl border border-white/5 overflow-x-auto no-scrollbar scrollbar-none">
            <span className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-wider pl-0.5 shrink-0">Theme:</span>
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {(['neon', 'cyberpunk', 'twilight', 'emerald', 'sunset'] as CardTheme[]).map((themeName) => (
                <button
                  key={themeName}
                  onClick={() => setSelectedTheme(themeName)}
                  className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-extrabold capitalize transition-all cursor-pointer whitespace-nowrap ${
                    selectedTheme === themeName
                      ? 'bg-white text-slate-950 shadow-md scale-100'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {themeName}
                </button>
              ))}
            </div>
          </div>

          {/* Episode Stills & Official Artwork Selector */}
          <div className="bg-[#161822] p-2 sm:p-2.5 px-2.5 sm:px-3 rounded-xl sm:rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <Camera className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-black text-slate-300 uppercase tracking-wider truncate">
                  Episode Stills & Artwork:
                </span>
                {availableImages.length > 1 && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold shrink-0">
                    {availableImages.length} available
                  </span>
                )}
                {currentEpSeason && currentEpNumber > 0 && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/5 text-slate-400 border border-white/10 font-bold shrink-0">
                    S{currentEpSeason}E{currentEpNumber}
                  </span>
                )}
              </div>

              {selectedImageOption && selectedImageOption.category !== 'default' && (
                <button
                  type="button"
                  onClick={handleResetToDefaultImage}
                  className="text-[10px] text-purple-400 hover:text-purple-300 font-bold underline cursor-pointer shrink-0"
                >
                  Reset to Poster
                </button>
              )}
            </div>

            {/* Horizontal Carousel of Official Stills & Artwork */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar scrollbar-none">
              {availableImages.map((img) => {
                const isSelected = selectedImageOption?.id === img.id || (!selectedImageOption && img.category === 'default');
                return (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => handleSelectImage(img)}
                    title={`${img.label} • ${img.source}`}
                    className={`relative group shrink-0 w-20 sm:w-24 aspect-[16/9] rounded-lg overflow-hidden border transition-all cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-purple-400 border-white/40 scale-[1.02] shadow-md shadow-purple-500/25'
                        : 'border-white/10 opacity-70 hover:opacity-100 hover:border-white/30'
                    }`}
                  >
                    <img
                      src={img.thumbnail}
                      alt={img.label}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = getShowFallbackBanner(show, e.currentTarget.src);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                    {/* Category indicator badge */}
                    <span className="absolute top-1 left-1 px-1 py-0.2 rounded text-[7px] sm:text-[7.5px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-slate-200 border border-white/10 leading-none">
                      {img.category === 'episode' ? 'Still' : img.category === 'backdrop' ? 'Backdrop' : 'Poster'}
                    </span>

                    {/* Active checkmark */}
                    {isSelected && (
                      <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-purple-500 text-white flex items-center justify-center shadow">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}

                    {/* Title label caption */}
                    <span className="absolute bottom-1 left-1 right-1 text-[7.5px] sm:text-[8px] font-bold text-white truncate text-left drop-shadow leading-tight">
                      {img.label}
                    </span>
                  </button>
                );
              })}

              {isLoadingImages && (
                <>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="shrink-0 w-20 sm:w-24 aspect-[16/9] rounded-lg bg-white/5 animate-pulse border border-white/5 flex items-center justify-center"
                    >
                      <Camera className="w-3.5 h-3.5 text-white/20" />
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        {/* TAB 1: SOCIAL STORY EXPORT CONTROLS */}
        {activeTab === 'story' && (
          <div className="space-y-3">
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
                {availableEpisodeReviews.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setActiveReviewEpKey(item.key);
                      setIsEpisodeReviewSelected(true);
                      setCustomQuote(`"${item.review.trim()}"`);
                    }}
                    className={`px-2 py-0.5 rounded-lg border font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer ${
                      isEpisodeReviewMode && activeReviewEpKey === item.key
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                    }`}
                  >
                    <Crown className="w-2.5 h-2.5 text-amber-400" />
                    <span>Use {item.key} Review</span>
                  </button>
                ))}
                {!availableEpisodeReviews.some(r => r.key === currentEpKey) && currentEpReview && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveReviewEpKey(currentEpKey);
                      setIsEpisodeReviewSelected(true);
                      setCustomQuote(`"${currentEpReview.trim()}"`);
                    }}
                    className={`px-2 py-0.5 rounded-lg border font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer ${
                      isEpisodeReviewMode && activeReviewEpKey === currentEpKey
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
                    onClick={() => {
                      setIsEpisodeReviewSelected(false);
                      setCustomQuote(`"${show.userNotes.trim()}"`);
                    }}
                    className={`px-2 py-0.5 rounded-lg border font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer ${
                      !isEpisodeReviewMode && customQuote === `"${show.userNotes.trim()}"`
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
                  onClick={() => {
                    setIsEpisodeReviewSelected(false);
                    setCustomQuote(`"Currently watching ${show.title} on CouchTaterz!"`);
                  }}
                  className={`px-2 py-0.5 rounded-lg border font-bold shrink-0 transition-all cursor-pointer ${
                    !isEpisodeReviewMode && customQuote === `"Currently watching ${show.title} on CouchTaterz!"`
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
                  className="w-full bg-[#161822] border border-purple-500/40 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none h-20"
                />
              ) : (
                <p className="text-xs text-slate-300 italic bg-[#161822]/80 p-2.5 rounded-xl border border-white/5 break-words">
                  {customQuote || 'No custom note added'}
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: INVITE A FRIEND CONTROLS */}
        {activeTab === 'invite' && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-[#241B3E] via-[#1A162B] to-[#11101C] border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  Friend Invite Card
                </span>
                <h4 className="text-sm font-black text-white leading-tight">
                  Invite Friends with this 9:16 Story Card!
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                Auto-Connect
              </span>
            </div>

            <p className="text-xs text-indigo-200/90 leading-relaxed">
              Send this 9:16 card to friends who aren't on CouchTaterz yet. When they scan the QR code or tap your link, they'll <strong className="text-white font-bold">automatically connect with you</strong> as a Binge Buddy!
            </p>

            {/* Invite URL Copy Field */}
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={inviteUrl}
                className="flex-1 text-xs px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-slate-200 font-mono select-all outline-none"
              />
              <button
                type="button"
                onClick={handleCopyInviteLink}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-all shadow-md active:scale-95"
              >
                {copiedInviteLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedInviteLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>

            {/* Quick Share Buttons: SMS & WhatsApp with Card Image Attachment */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleSendSmsWithCard}
                disabled={isExporting}
                className="py-2.5 px-3 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 border border-indigo-500/40 text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer text-center active:scale-95 disabled:opacity-50"
              >
                <MessageCircle className="w-3.5 h-3.5 text-indigo-200" />
                <span>Text / SMS + Card</span>
              </button>

              <button
                type="button"
                onClick={handleSendWhatsAppWithCard}
                disabled={isExporting}
                className="py-2.5 px-3 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 border border-emerald-500/40 text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer text-center active:scale-95 disabled:opacity-50"
              >
                <MessageSquare className="w-3.5 h-3.5 text-white" />
                <span>WhatsApp + Card</span>
              </button>
            </div>
          </div>
        )}

        {/* --- DYNAMIC SOCIAL CARD CANVAS PREVIEW (9:16, 4:5, 1:1) --- */}
        <div className="flex justify-center my-1 sm:my-2 overflow-hidden py-1">
          <div
            ref={cardRef}
            id="couchtaterz-story-card"
            className={`relative ${
              cardFormat === 'portrait'
                ? 'w-[310px] min-[360px]:w-[325px] min-[390px]:w-[350px] sm:w-[380px] aspect-[4/5] rounded-[24px] sm:rounded-[28px] px-3.5 py-2.5 sm:px-4 sm:py-3'
                : cardFormat === 'square'
                ? 'w-[290px] min-[360px]:w-[310px] min-[390px]:w-[335px] sm:w-[360px] aspect-[1/1] rounded-[24px] sm:rounded-[28px] p-3.5 sm:p-4'
                : 'w-[300px] min-[360px]:w-[320px] min-[390px]:w-[340px] sm:w-[360px] aspect-[9/16] rounded-[28px] sm:rounded-[32px] px-3.5 py-3 sm:px-5 sm:py-4'
            } ${currentTheme.background} border ${currentTheme.border} ${currentTheme.glow} flex flex-col justify-between overflow-hidden text-white font-sans select-none transition-all duration-300`}
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.08) 0%, transparent 70%)',
            }}
          >
            {/* Background Aesthetic Ambient Light Glows */}
            <div className={`absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br ${currentTheme.accentGradient} rounded-full blur-[80px] opacity-30 pointer-events-none`} />
            <div className={`absolute -bottom-16 -left-16 w-48 h-48 bg-gradient-to-tr ${currentTheme.accentGradient} rounded-full blur-[80px] opacity-30 pointer-events-none`} />

            {/* CARD TOP SECTION: USER & HEADER BADGE */}
            <div className="relative z-10 space-y-1.5 shrink-0">
              <div className="flex items-center justify-between">
                {/* User Avatar + Display Name */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 p-0.5 shadow-lg shrink-0">
                    {currentUser?.avatarUrl ? (
                      <img
                        src={avatarDataUrl || currentUser.avatarUrl}
                        alt={displayName}
                        className="w-full h-full rounded-full object-cover"
                        crossOrigin="anonymous"
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
                    <p className="text-[8px] sm:text-[8.5px] font-bold text-slate-400 tracking-wider uppercase">
                      {activeTab === 'invite' ? 'Inviting You to Connect' : 'Binge Buddy'}
                    </p>
                  </div>
                </div>

                {/* Event Status Header Badge */}
                <div className="text-right">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border text-[8px] sm:text-[8.5px] font-black uppercase tracking-widest shadow-sm backdrop-blur-md ${currentTheme.badgeBg} ${currentTheme.badgeText}`}>
                    <Sparkles className="w-2.5 h-2.5 shrink-0 opacity-80" />
                    <span>{getHeaderBadge()}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* CARD MIDDLE SECTION: ADAPTIVE LAYOUT BY FORMAT */}
            {cardFormat === 'square' ? (
              /* 1:1 SQUARE BALANCED SIDE-BY-SIDE LAYOUT */
              <div className="relative z-10 my-auto flex gap-2.5 items-stretch min-h-0">
                {/* Left: Poster Card */}
                <div className="w-[100px] xs:w-[110px] sm:w-[115px] aspect-[2/3] rounded-xl overflow-hidden border border-white/15 shadow-xl relative shrink-0 bg-slate-900 group">
                  <img
                    src={bannerDataUrl || selectedImageOption?.url || getShowBannerImage(show)}
                    alt={show.title}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const fallback = getShowFallbackBanner(show, target.src);
                      if (target.src !== fallback) {
                        target.src = fallback;
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                  {/* Rating Overlays & Episode Review Badge */}
                  {isEpisodeReviewMode ? (
                    <>
                      {/* Top Left Corner of Poster: Episode Pill */}
                      <div className="absolute top-1.5 left-1.5 z-10 max-w-[calc(100%-46px)]">
                        <div className="px-1.5 py-0.5 bg-black/85 border border-white/20 text-slate-200 font-bold text-[7.5px] rounded-lg shadow-md leading-none whitespace-nowrap truncate backdrop-blur-md flex items-center gap-1">
                          <span className="font-black text-amber-300 shrink-0">S{currentEpSeason}E{currentEpNumber}</span>
                          {currentEpName && (
                            <>
                              <span className="text-white/40 shrink-0">·</span>
                              <span className="text-slate-200 truncate">"{currentEpName}"</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Top Right Corner of Poster: Translucent Hexagon Score Badge */}
                      <div className="absolute top-1.5 right-1.5 z-10 flex flex-col items-end">
                        <div className="relative w-[38px] h-[44px] shrink-0">
                          <svg
                            viewBox="0 0 100 116"
                            className="w-full h-full drop-shadow-xl overflow-visible"
                          >
                            <polygon
                              points="50,3 97,28 97,88 50,113 3,88 3,28"
                              fill="rgba(10, 15, 25, 0.45)"
                              stroke={scoreDescriptor.color}
                              strokeWidth="3.5"
                              strokeLinejoin="round"
                            />
                            <text
                              x="50"
                              y="58"
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill="#ffffff"
                              fontWeight="900"
                              fontSize={scoreVal >= 10 ? '48' : '54'}
                              fontFamily="system-ui, -apple-system, sans-serif"
                              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.7))' }}
                            >
                              {scoreVal}
                            </text>
                          </svg>
                        </div>
                      </div>
                    </>
                  ) : (
                    (showSeriesScoreOnPoster || showRtScoreOnPoster) && (
                      <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 items-end z-10">
                        {showSeriesScoreOnPoster && (
                          <div className="px-1.5 py-0.5 bg-purple-600/90 border border-purple-400/40 text-white font-black text-[8.5px] rounded-lg shadow-md flex items-center gap-0.5 leading-none whitespace-nowrap backdrop-blur-md">
                            <Trophy className="w-2.5 h-2.5 text-amber-300 shrink-0" />
                            <span>Series {show.userScore}/10</span>
                          </div>
                        )}
                        {showRtScoreOnPoster && (
                          <div className="px-1.5 py-0.5 bg-red-600 text-white font-black text-[8.5px] rounded-lg shadow-md flex items-center gap-0.5 leading-none whitespace-nowrap">
                            <span className="text-[8.5px] leading-none shrink-0">🍅</span>
                            <span>{show.rottenTomatoesScore}%</span>
                          </div>
                        )}
                      </div>
                    )
                  )}

                  {/* Streaming Service Tag */}
                  <div className="absolute bottom-1.5 left-1.5 right-1.5">
                    <span className="px-1 py-0.5 rounded bg-white/20 backdrop-blur-md text-[7.5px] font-extrabold uppercase tracking-wider text-slate-100 border border-white/20 truncate block text-center">
                      {show.streamingService}
                    </span>
                  </div>
                </div>

                {/* Right: Show Info & Quote / Review */}
                <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5 space-y-1.5">
                  <div className="space-y-1">
                    <h2 className="text-sm sm:text-base font-black text-white tracking-tight leading-tight line-clamp-2 drop-shadow-sm">
                      {show.title}
                    </h2>

                    {/* Airing / Progress Pill */}
                    {shouldShowAirDateBanner ? (
                      <div className="px-2 py-1 rounded-lg border bg-emerald-950/80 border-emerald-500/40 text-emerald-300 text-[8.5px] font-bold leading-tight">
                        <span className="text-emerald-400 font-black uppercase text-[7.5px] block">
                          ● {getAiringStatusText(displayAirDate)}
                        </span>
                        <span className="text-white truncate block">
                          S{displayAirSeason}E{displayAirEpisode}{displayAirTitle ? ` "${displayAirTitle}"` : ''}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[8.5px] text-purple-300 font-semibold truncate">
                        <Tv className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">S{show.latestWatched?.season || 1} Ep {show.latestWatched?.episode || 0}{show.latestWatched?.title && show.latestWatched.title !== 'Not Started' ? ` · ${show.latestWatched.title}` : ''}</span>
                      </div>
                    )}
                  </div>

                  {/* Custom Quote / Invite Note Box */}
                  {(customQuote || (activeTab === 'invite')) && (
                    <div className={`p-2 rounded-xl border ${currentTheme.quoteBg} text-left space-y-1 shadow-inner backdrop-blur-sm`}>
                      {activeTab !== 'invite' && isEpisodeReviewMode && (
                        <div className="space-y-0.5 pb-0.5 border-b border-white/10">
                          <div className="flex items-center justify-between gap-1 flex-wrap">
                            <div className="flex items-center gap-1 text-[7.5px] sm:text-[8px] font-black uppercase tracking-widest text-amber-300">
                              <Quote className="w-2 h-2 text-amber-400 shrink-0 rotate-180" />
                              <span>EPISODE TAKE</span>
                            </div>
                            {displayAirDate && (
                              <span className="text-[7px] font-bold text-emerald-400 bg-emerald-950/60 px-1 py-0.2 rounded border border-emerald-500/30 leading-none">
                                {getAiringStatusText(displayAirDate)}
                              </span>
                            )}
                          </div>
                          {currentEpName && (
                            <div className="text-[9px] sm:text-[9.5px] font-bold text-white tracking-tight leading-snug line-clamp-1">
                              S{currentEpSeason}E{currentEpNumber} "{currentEpName}"
                            </div>
                          )}
                        </div>
                      )}
                      {activeTab === 'invite' && (
                        <div className="flex items-center gap-1 text-[7.5px] font-black uppercase tracking-wider text-indigo-300">
                          <Sparkles className="w-2 h-2 text-indigo-400 shrink-0" />
                          <span>FRIEND INVITATION</span>
                        </div>
                      )}
                      <div className="flex items-start gap-1 min-h-0 flex-1">
                        <Quote className="w-2.5 h-2.5 text-purple-400 shrink-0 mt-0.5 opacity-70 rotate-180" />
                        <p className={`${getQuoteTypography(quoteText, 'square')} font-medium italic leading-snug break-words text-slate-100 flex-1`}>
                          {quoteText}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* 9:16 STORY & 4:5 PORTRAIT VERTICAL STACKED LAYOUT */
              <div className={`relative z-10 ${
                cardFormat === 'story' 
                  ? 'flex-1 flex flex-col gap-2 py-0.5 min-h-0' 
                  : 'flex-1 flex flex-col gap-1.5 py-0.5 min-h-0'
              }`}>
                {/* Poster Container - Flexibly expands to fill remaining card space with cinematic artwork */}
                <div className={`relative overflow-hidden border border-white/15 shadow-2xl ${
                  cardFormat === 'portrait' 
                    ? 'rounded-xl min-h-[110px]' 
                    : 'rounded-2xl min-h-[130px]'
                } flex-1 bg-slate-900 group transition-all duration-200`}>
                  <img
                    src={bannerDataUrl || selectedImageOption?.url || getShowBannerImage(show)}
                    alt={show.title}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const fallback = getShowFallbackBanner(show, target.src);
                      if (target.src !== fallback) {
                        target.src = fallback;
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

                  {/* Rating Badge Overlay & Episode Review Badge */}
                  {isEpisodeReviewMode ? (
                    <>
                      {/* Top Left Corner of Poster: Episode Pill */}
                      <div className={`absolute ${cardFormat === 'portrait' ? 'top-1.5 left-1.5' : 'top-2 left-2'} z-10 max-w-[calc(100%-4.5rem)]`}>
                        <div className={`px-2 py-0.5 bg-black/85 border border-white/20 text-slate-200 font-bold ${
                          cardFormat === 'portrait' ? 'text-[7.5px] sm:text-[8px]' : 'text-[8px] sm:text-[9px]'
                        } rounded-lg shadow-lg leading-none whitespace-nowrap truncate backdrop-blur-md flex items-center gap-1.5`}>
                          <span className="font-black text-amber-300 shrink-0">S{currentEpSeason}E{currentEpNumber}</span>
                          {currentEpName && (
                            <>
                              <span className="text-white/40 shrink-0">·</span>
                              <span className="text-slate-200 truncate">"{currentEpName}"</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Top Right Corner of Poster: Translucent Hexagon Score Badge */}
                      <div className={`absolute ${cardFormat === 'portrait' ? 'top-1.5 right-1.5' : 'top-2 right-2'} z-10 flex flex-col items-end`}>
                        <div className={`relative ${
                          cardFormat === 'portrait' 
                            ? 'w-[44px] h-[51px] sm:w-[48px] sm:h-[56px]' 
                            : 'w-[50px] h-[58px] sm:w-[56px] sm:h-[65px]'
                        } shrink-0`}>
                          <svg
                            viewBox="0 0 100 116"
                            className="w-full h-full drop-shadow-xl overflow-visible"
                          >
                            <polygon
                              points="50,3 97,28 97,88 50,113 3,88 3,28"
                              fill="rgba(10, 15, 25, 0.45)"
                              stroke={scoreDescriptor.color}
                              strokeWidth="3.5"
                              strokeLinejoin="round"
                            />
                            <text
                              x="50"
                              y="58"
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill="#ffffff"
                              fontWeight="900"
                              fontSize={scoreVal >= 10 ? '48' : '54'}
                              fontFamily="system-ui, -apple-system, sans-serif"
                              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.7))' }}
                            >
                              {scoreVal}
                            </text>
                          </svg>
                        </div>
                      </div>
                    </>
                  ) : (
                    (showSeriesScoreOnPoster || showRtScoreOnPoster) && (
                      <div className={`absolute ${cardFormat === 'portrait' ? 'top-1.5 right-1.5' : 'top-2 right-2'} flex items-center gap-1.5 flex-nowrap z-10 max-w-[calc(100%-1rem)]`}>
                        {showSeriesScoreOnPoster && (
                          <div className={`px-2 py-0.5 ${cardFormat === 'portrait' ? 'sm:px-2 sm:py-0.5 text-[9px]' : 'sm:px-2.5 sm:py-1 text-[10px] sm:text-xs'} bg-purple-600/90 border border-purple-400/40 text-white font-black rounded-xl shadow-lg flex items-center gap-1 whitespace-nowrap shrink-0 leading-none backdrop-blur-md`}>
                            <Trophy className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-300 shrink-0" />
                            <span className="leading-none whitespace-nowrap">Series: {show.userScore}/10</span>
                          </div>
                        )}
                        {showRtScoreOnPoster && (
                          <div className={`px-2 py-0.5 ${cardFormat === 'portrait' ? 'sm:px-2 sm:py-0.5 text-[9px]' : 'sm:px-2.5 sm:py-1 text-[10px] sm:text-xs'} bg-red-600 text-white font-black rounded-xl shadow-lg flex items-center gap-1 whitespace-nowrap shrink-0 leading-none`}>
                            <span className="text-[10px] sm:text-[11px] leading-none shrink-0 inline-block select-none">🍅</span>
                            <span className="leading-none whitespace-nowrap">{show.rottenTomatoesScore}%</span>
                          </div>
                        )}
                      </div>
                    )
                  )}

                  {/* Title & Service Tag on Poster */}
                  <div className={`absolute ${cardFormat === 'portrait' ? 'bottom-1.5 left-2 right-2 space-y-0.5' : 'bottom-2 left-2.5 right-2.5 space-y-0.5'}`}>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-1.5 py-0.5 rounded-md bg-white/15 backdrop-blur-md ${cardFormat === 'portrait' ? 'text-[7px] sm:text-[7.5px]' : 'text-[7.5px] sm:text-[8.5px]'} font-extrabold uppercase tracking-wider text-slate-200 border border-white/20 inline-block`}>
                        {show.streamingService}
                      </span>
                    </div>
                    <h2 className={`${cardFormat === 'portrait' ? 'text-xs sm:text-sm md:text-base line-clamp-1' : 'text-sm sm:text-base md:text-lg line-clamp-2'} font-black text-white tracking-tight leading-tight drop-shadow-md`}>
                      {show.title}
                    </h2>
                  </div>
                </div>

                {/* Green Air Date Reminder Banner - Dedicated split box for air date */}
                {shouldShowAirDateBanner && (
                  <div className={`${cardFormat === 'portrait' ? 'px-2 py-1' : 'px-2.5 py-1.5 space-y-0.5'} rounded-xl border shadow-md bg-emerald-950/80 border-emerald-500/40 text-emerald-300 backdrop-blur-md shrink-0`}>
                    {cardFormat === 'portrait' ? (
                      <div className="flex items-center justify-between gap-1 text-[7.5px] sm:text-[8px] font-bold">
                        <div className="flex items-center gap-1 text-emerald-400 font-black uppercase tracking-wider shrink-0">
                          <span className="relative flex h-1.5 w-1.5 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
                          </span>
                          <span>{getAiringStatusText(displayAirDate)}</span>
                        </div>
                        <div className="text-white font-extrabold truncate text-right">
                          S{displayAirSeason}E{displayAirEpisode}{displayAirTitle ? ` "${displayAirTitle}"` : ''}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-1 text-[8px] sm:text-[8.5px] font-black uppercase tracking-wider text-emerald-400">
                          <span className="relative flex h-1.5 w-1.5 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
                          </span>
                          <span>{getAiringStatusText(displayAirDate)}</span>
                        </div>
                        <div className="text-[10px] sm:text-[11px] font-bold text-white tracking-tight leading-snug break-words truncate">
                          S{displayAirSeason}E{displayAirEpisode}
                          {displayAirTitle ? ` "${displayAirTitle}"` : ''}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Custom Quote / Invite Note / Review Box - Dynamically hugs content height with no awkward bottom void */}
                {(customQuote || (activeTab === 'invite')) && (
                  <div className={`${
                    cardFormat === 'portrait' 
                      ? 'p-2 sm:p-2.5 rounded-xl space-y-1 max-h-[50%]' 
                      : 'p-2.5 sm:p-3 rounded-2xl space-y-1 sm:space-y-1.5 max-h-[52%]'
                  } border ${currentTheme.quoteBg} text-left shadow-inner backdrop-blur-md relative overflow-hidden shrink-0 flex flex-col justify-center`}>
                    {/* Show episode review header */}
                    {activeTab !== 'invite' && isEpisodeReviewMode && (
                      <div className="flex items-center justify-between gap-1.5 pb-1 border-b border-white/10 shrink-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <div className={`flex items-center gap-1 ${cardFormat === 'portrait' ? 'text-[7px] sm:text-[7.5px]' : 'text-[8px] sm:text-[8.5px]'} font-black uppercase tracking-widest text-amber-300`}>
                            <Quote className={`${cardFormat === 'portrait' ? 'w-2 h-2' : 'w-2.5 h-2.5'} text-amber-400 shrink-0 rotate-180`} />
                            <span>EPISODE TAKE</span>
                          </div>
                          {displayAirDate && (
                            <span className="text-[7px] sm:text-[7.5px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30 leading-none">
                              {getAiringStatusText(displayAirDate)}
                            </span>
                          )}
                        </div>
                        {currentEpName && (
                          <div className={`${cardFormat === 'portrait' ? 'text-[8px] sm:text-[8.5px]' : 'text-[9px] sm:text-[9.5px]'} font-bold text-slate-300 truncate max-w-[150px] sm:max-w-[200px]`}>
                            "{currentEpName}"
                          </div>
                        )}
                      </div>
                    )}
                    {activeTab !== 'invite' && !isEpisodeReviewMode && customQuote && (
                      <div className="flex items-center gap-1 text-[7px] sm:text-[7.5px] font-black uppercase tracking-widest text-purple-300 pb-0.5 shrink-0">
                        <Crown className="w-2.5 h-2.5 text-purple-400 shrink-0" />
                        <span>MY TAKE & RECOMMENDATION</span>
                      </div>
                    )}
                    {activeTab === 'invite' && (
                      <div className={`flex items-center gap-1 ${cardFormat === 'portrait' ? 'text-[7px] sm:text-[7.5px]' : 'text-[8px] sm:text-[8.5px]'} font-black uppercase tracking-wider text-indigo-300 pb-0.5 shrink-0`}>
                        <Sparkles className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
                        <span>FRIEND INVITATION</span>
                      </div>
                    )}
                    <div className="flex items-start gap-1.5 min-h-0">
                      <Quote className="w-2.5 h-2.5 text-purple-400 shrink-0 mt-0.5 opacity-70 rotate-180" />
                      <p className={`${getQuoteTypography(quoteText, cardFormat)} font-medium italic break-words text-slate-100 flex-1`}>
                        {quoteText}
                      </p>
                    </div>
                  </div>
                )}

                {/* Current Episode Title pill when no custom review is active (in 9:16 story format) */}
                {cardFormat === 'story' && !customQuote && activeTab !== 'invite' && show.latestWatched?.title && show.latestWatched.title !== 'Not Started' && (
                  <div className="flex items-center justify-center gap-1 text-center bg-white/5 border border-white/10 rounded-xl py-1 px-2.5 shrink-0">
                    <Tv className="w-2.5 h-2.5 text-purple-300 shrink-0" />
                    <span className="text-[8.5px] sm:text-[9px] font-semibold text-purple-200 truncate">
                      Latest Watched: <span className="font-extrabold text-white">S{show.latestWatched.season}E{show.latestWatched.episode} "{show.latestWatched.title}"</span>
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Visual Progress Bar & Tracker Micro Stats */}
            <div className={`relative z-10 bg-black/50 border border-white/10 ${
              cardFormat === 'portrait' 
                ? 'rounded-xl p-1.5 space-y-0.5 my-0.5' 
                : cardFormat === 'square' 
                ? 'rounded-xl p-1.5 space-y-1 my-1' 
                : customQuote
                ? 'rounded-xl p-2 sm:p-2.5 space-y-1 my-1'
                : 'rounded-2xl p-2.5 sm:p-3 space-y-1.5 my-1.5'
            } backdrop-blur-md shrink-0 shadow-lg`}>
              {/* Visual Progress Bar Track */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between text-[7px] sm:text-[7.5px] font-extrabold uppercase tracking-wider text-slate-400">
                  <span className="flex items-center gap-1 text-purple-300">
                    <Layers className="w-2 h-2 text-purple-400" />
                    <span>{isSeriesCompleted ? 'Series Finished' : isCaughtUp ? `Season ${currentEpSeason} Caught Up` : `Season ${currentEpSeason} Progress`}</span>
                  </span>
                  <span className="font-mono text-white font-black">
                    {isSeriesCompleted 
                      ? '100% Watched' 
                      : currentWatchedEp === 0
                      ? `0/${maxEpisodesInSeason} (0%)`
                      : `Ep ${currentWatchedEp}/${maxEpisodesInSeason} (${progressPercent}%)`}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/15 overflow-hidden border border-white/10 relative">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      isSeriesCompleted || isCaughtUp
                        ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                        : `bg-gradient-to-r ${currentTheme.accentGradient}`
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* 3-Tile Micro Stats */}
              <div className={`grid grid-cols-3 gap-1 ${cardFormat === 'portrait' || cardFormat === 'square' ? 'pt-0.5' : 'pt-1.5'} border-t border-white/10 text-center`}>
                <div className="space-y-0.5">
                  <div className="text-[6.5px] sm:text-[7px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-0.5">
                    <span>Tracked</span>
                  </div>
                  <div className="text-[8.5px] sm:text-[9px] font-black text-white truncate px-0.5">
                    S{show.latestWatched?.season || 1} · Ep {show.latestWatched?.episode || 0}
                  </div>
                </div>

                <div className="space-y-0.5 border-x border-white/10">
                  <div className="text-[6.5px] sm:text-[7px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-0.5">
                    <Calendar className="w-2 h-2 text-cyan-400" />
                    <span>Status</span>
                  </div>
                  <div className="text-[8.5px] sm:text-[9px] font-black text-white truncate px-0.5">
                    {show.concluded ? 'Concluded' : show.status === 'Completed' ? 'Finished' : 'Airing'}
                  </div>
                </div>

                {isEpisodeReviewMode ? (
                  /* Series Score replaces Platform in bottom right cell on Episode Review Card */
                  <div className="space-y-0.5">
                    <div className="text-[6.5px] sm:text-[7px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-0.5">
                      <Trophy className="w-2 h-2 text-purple-400" />
                      <span>Series Score</span>
                    </div>
                    <div className="text-[8.5px] sm:text-[9px] font-black text-white truncate px-0.5">
                      {show.userScore != null ? (
                        <span className="text-purple-300 font-black">{show.userScore}/10</span>
                      ) : (
                        <span className="text-slate-400 font-medium">Unrated</span>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Standard Platform cell for other cards */
                  <div className="space-y-0.5">
                    <div className="text-[6.5px] sm:text-[7px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-0.5">
                      <Film className="w-2 h-2 text-amber-400" />
                      <span>Platform</span>
                    </div>
                    <div className="text-[8.5px] sm:text-[9px] font-black text-white truncate px-0.5">
                      {show.streamingService}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CARD BOTTOM SECTION: HIGH-CONTRAST BRANDING & QR CODE */}
            <div className={`relative z-10 ${
              cardFormat === 'portrait' 
                ? 'bg-black/65 backdrop-blur-md rounded-xl px-2.5 py-1.5 border border-white/20 shadow-xl mt-0.5' 
                : cardFormat === 'square'
                ? 'bg-black/50 backdrop-blur-md rounded-xl px-2 py-1.5 border border-white/15 shadow-md mt-1'
                : 'bg-black/45 backdrop-blur-md rounded-2xl px-3.5 py-2 sm:py-2.5 border border-white/15 shadow-lg mt-1'
            } flex items-center justify-between shrink-0`}>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className={`${
                    cardFormat === 'portrait' ? 'w-7 h-7 sm:w-8 sm:h-8' : 'w-6.5 h-6.5 sm:w-7.5 sm:h-7.5'
                  } rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-600 flex items-center justify-center shadow-md shadow-blue-500/40 text-white shrink-0 border border-white/20`}>
                    <Tv className={`${cardFormat === 'portrait' ? 'w-3.5 h-3.5 sm:w-4 sm:h-4' : 'w-3.5 h-3.5 sm:w-4 sm:h-4'} stroke-[2.4]`} />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h1 className={`${
                      cardFormat === 'portrait' ? 'text-[11px] sm:text-xs' : 'text-[10px] sm:text-[11px]'
                    } font-black tracking-tight uppercase leading-none inline-flex items-center`}>
                      <span className="text-blue-400">COUCH</span>
                      <span className="text-white">TATERZ</span>
                      <span className="text-[6.5px] font-bold text-slate-300 ml-0.5 select-none relative -top-0.5 leading-none">™</span>
                    </h1>
                    <p className={`${
                      cardFormat === 'portrait' ? 'text-[7px] sm:text-[7.5px]' : 'text-[6.5px] sm:text-[7px]'
                    } font-black tracking-[0.16em] text-cyan-300 uppercase mt-0.5 leading-none whitespace-nowrap`}>
                      {activeTab === 'invite' ? 'SCAN TO CONNECT' : 'YOUR BINGE BUDDY'}
                    </p>
                  </div>
                </div>
                <p className={`${
                  cardFormat === 'portrait' ? 'text-[7.5px] sm:text-[8px]' : 'text-[7px] sm:text-[7.5px]'
                } font-bold text-slate-200 tracking-wide mt-0.5 leading-none`}>
                  couchtaterz.ai.studio{username && username.toLowerCase() !== 'default' ? `/p/${username}` : ''}
                </p>
              </div>

              {/* QR Code */}
              {qrCodeDataUrl && (
                <div className="bg-white p-1 rounded-xl shadow-xl border-2 border-white/90 shrink-0 flex items-center justify-center">
                  <img 
                    src={qrCodeDataUrl} 
                    alt="Scan QR" 
                    className={`${
                      cardFormat === 'portrait' 
                        ? 'w-8 h-8 sm:w-9 sm:h-9' 
                        : cardFormat === 'square'
                        ? 'w-7.5 h-7.5 sm:w-8 sm:h-8'
                        : 'w-8 h-8 sm:w-9 sm:h-9'
                    } rounded-md object-contain block`} 
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Action Buttons (Mobile-first, sticky-capable) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
          <button
            onClick={handleDownloadPng}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-purple-600/25 transition-all cursor-pointer disabled:opacity-50 active:scale-95 min-h-[44px]"
          >
            <Download className="w-4 h-4" />
            <span>
              {isExporting
                ? 'Generating PNG...'
                : isMobile
                ? `Save to Photos (${cardFormat === 'story' ? '9:16' : cardFormat === 'portrait' ? '4:5' : '1:1'})`
                : `Download ${cardFormat === 'story' ? '9:16' : cardFormat === 'portrait' ? '4:5' : '1:1'} PNG`}
            </span>
          </button>

          <button
            onClick={handleNativeShare}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-cyan-600/20 transition-all cursor-pointer disabled:opacity-50 active:scale-95 min-h-[44px]"
          >
            <Share2 className="w-4 h-4" />
            <span>{activeTab === 'invite' ? 'Share Invite Card' : 'Share Card'}</span>
          </button>

          <button
            onClick={activeTab === 'invite' ? handleCopyInviteLink : handleCopyLink}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 font-extrabold text-xs sm:text-sm transition-all cursor-pointer border border-white/10 active:scale-95 min-h-[44px]"
          >
            {(activeTab === 'invite' ? copiedInviteLink : copiedLink) ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span>{(activeTab === 'invite' ? copiedInviteLink : copiedLink) ? 'Link Copied!' : (activeTab === 'invite' ? 'Copy Invite Link' : 'Copy Share URL')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
