/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TvShow, Board, StreamingService } from "../src/types";
import { SHOW_SCHEDULES, normalizeTitle, resolveNextUpcomingEpisode, ShowScheduleData } from "./showSchedules";
import { KNOWN_DEAD_BANNERS, KNOWN_SHOW_BANNERS } from "../src/utils/showBanners";
import { boundShowEpisodes } from "./storageOptimizer";

export interface MetadataChangeRecord {
  showTitle: string;
  field: 'card_image' | 'air_date' | 'streaming_channel' | 'episode_title';
  oldValue: string | null;
  newValue: string;
  detail?: string;
  timestamp: string;
}

export interface AuditResult {
  id: string;
  timestamp: string;
  durationMs: number;
  totalShowsAudited: number;
  titlesUpdated: Array<{
    showTitle: string;
    episodeKey: string;
    oldTitle: string;
    newTitle: string;
  }>;
  airDatesUpdated: Array<{
    showTitle: string;
    oldAirDate: string | null;
    newAirDate: string;
    oldAirTime?: string | null;
    newAirTime?: string;
    episode: string;
  }>;
  bannersUpdated: Array<{
    showTitle: string;
    oldBanner: string;
    newBanner: string;
    source?: string;
  }>;
  channelsUpdated: Array<{
    showTitle: string;
    oldChannel: string | null;
    newChannel: string;
    source?: string;
  }>;
  changes: MetadataChangeRecord[];
  summary: {
    titlesCount: number;
    airDatesCount: number;
    bannersCount: number;
    channelsCount: number;
    showsModified: number;
  };
}

// Patterns that classify an episode title as provisional/temporary
const TEMP_TITLE_PATTERNS = [
  /^tba$/i,
  /^tbd$/i,
  /^tbc$/i,
  /^to be announced$/i,
  /^to be confirmed$/i,
  /^untitled$/i,
  /^untitled\s*episode/i,
  /^episode\s*#?\d+$/i,
  /^ep\.?\s*\d+$/i,
  /^season\s*\d+\s*(premiere|finale)$/i,
  /^season\s*(premiere|finale)$/i,
  /^series\s*(premiere|finale)$/i
];

export function isTemporaryEpisodeTitle(title: string | undefined | null): boolean {
  if (!title) return true;
  const clean = title.trim();
  if (clean.length === 0) return true;
  return TEMP_TITLE_PATTERNS.some((pat) => pat.test(clean));
}

export function isPlaceholderOrDeadBanner(url: string | undefined | null): boolean {
  if (!url) return true;
  const clean = url.trim();
  if (!clean.startsWith("http")) return true;
  if (KNOWN_DEAD_BANNERS.has(clean)) return true;
  if (clean.includes("652279")) return true; // Known dead TVmaze asset
  if (clean.includes("images.unsplash.com")) return true; // Generic stock photo
  if (clean.toLowerCase().includes("placeholder") || clean.toLowerCase().includes("dummy")) return true;
  return false;
}

// Industry-standard canonical streaming channel normalization
export const STREAMING_CHANNEL_NORMALIZATION: Record<string, StreamingService> = {
  "apple": "Apple TV",
  "apple tv": "Apple TV",
  "apple tv+": "Apple TV",
  "apple tv plus": "Apple TV",
  "appletv": "Apple TV",
  "apple tv app": "Apple TV",
  "hbo": "HBO",
  "hbo max": "HBO",
  "max": "HBO",
  "home box office": "HBO",
  "netflix": "Netflix",
  "disney": "Disney+",
  "disney+": "Disney+",
  "disney plus": "Disney+",
  "disneyplus": "Disney+",
  "amazon": "Prime Video",
  "amazon prime": "Prime Video",
  "amazon prime video": "Prime Video",
  "prime video": "Prime Video",
  "prime": "Prime Video",
  "hulu": "Hulu",
  "paramount": "Paramount+",
  "paramount+": "Paramount+",
  "paramount plus": "Paramount+",
  "amc": "AMC+",
  "amc+": "AMC+",
  "amc plus": "AMC+",
  "amc networks": "AMC+",
  "peacock": "Peacock",
  "fx": "Hulu",
  "showtime": "Paramount+",
  "starz": "Starz",
  "cbs": "Paramount+",
  "nbc": "Peacock",
  "the cw": "Other"
};

export function normalizeStreamingChannel(rawChannel?: string | null): StreamingService | null {
  if (!rawChannel) return null;
  const clean = rawChannel.trim().toLowerCase();
  if (STREAMING_CHANNEL_NORMALIZATION[clean]) {
    return STREAMING_CHANNEL_NORMALIZATION[clean];
  }
  for (const [key, normalized] of Object.entries(STREAMING_CHANNEL_NORMALIZATION)) {
    if (clean.includes(key)) {
      return normalized;
    }
  }
  return null;
}

/**
 * Normalizes title for robust dictionary lookups
 */
export function normalizeKey(title: string): string {
  if (!title) return "";
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(the|a|an)\b/gi, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

/**
 * Helper to create an empty AuditResult object
 */
export function createEmptyAuditResult(): AuditResult {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    durationMs: 0,
    totalShowsAudited: 0,
    titlesUpdated: [],
    airDatesUpdated: [],
    bannersUpdated: [],
    channelsUpdated: [],
    changes: [],
    summary: {
      titlesCount: 0,
      airDatesCount: 0,
      bannersCount: 0,
      channelsCount: 0,
      showsModified: 0
    }
  };
}

/**
 * Audits a single show against canonical schedules, metadata, and verified banners.
 * Returns true if any field was updated/corrected.
 */
export function auditShow(show: TvShow, auditLog: AuditResult, tvmazeRecord?: any): boolean {
  if (!show || !show.title) return false;
  let modified = false;

  const rawTitle = show.title.trim();
  const scheduleKey = normalizeTitle(rawTitle);
  const normalizedKey = normalizeKey(rawTitle);
  const normTitle = scheduleKey;
  const scheduleData: ShowScheduleData | undefined = SHOW_SCHEDULES[scheduleKey] || SHOW_SCHEDULES[rawTitle.toLowerCase()];

  // ---------------------------------------------------------------------------
  // 1. AUDIT SHOW CARD IMAGE (Poster / Key Art Banner)
  // ---------------------------------------------------------------------------
  const officialBanner = KNOWN_SHOW_BANNERS[scheduleKey] || KNOWN_SHOW_BANNERS[rawTitle.toLowerCase()] || KNOWN_SHOW_BANNERS[normalizedKey];
  const currentBanner = (show.bannerImage || "").trim();

  let targetBanner: string | null = null;
  let bannerSource = "canonical";

  if (officialBanner && officialBanner !== currentBanner) {
    if (isPlaceholderOrDeadBanner(currentBanner) || currentBanner.includes("unsplash")) {
      targetBanner = officialBanner;
      bannerSource = "official_key_art";
    }
  } else if (!currentBanner || isPlaceholderOrDeadBanner(currentBanner)) {
    if (officialBanner) {
      targetBanner = officialBanner;
      bannerSource = "official_key_art";
    } else if (tvmazeRecord?.image?.original && !isPlaceholderOrDeadBanner(tvmazeRecord.image.original)) {
      targetBanner = tvmazeRecord.image.original;
      bannerSource = "tvmaze_hd";
    } else if (tvmazeRecord?.image?.medium && !isPlaceholderOrDeadBanner(tvmazeRecord.image.medium)) {
      targetBanner = tvmazeRecord.image.medium;
      bannerSource = "tvmaze_medium";
    }
  }

  if (targetBanner && targetBanner !== currentBanner) {
    auditLog.bannersUpdated.push({
      showTitle: show.title,
      oldBanner: currentBanner || "(empty)",
      newBanner: targetBanner,
      source: bannerSource
    });
    auditLog.changes.push({
      showTitle: show.title,
      field: 'card_image',
      oldValue: currentBanner || null,
      newValue: targetBanner,
      detail: `Upgraded card key art from ${bannerSource}`,
      timestamp: new Date().toISOString()
    });
    show.bannerImage = targetBanner;
    modified = true;
  }

  // ---------------------------------------------------------------------------
  // 2. AUDIT STREAMING CHANNEL / NETWORK
  // ---------------------------------------------------------------------------
  let canonicalChannel: string | null = null;
  let channelSource = "";

  if (scheduleData?.streamingService) {
    canonicalChannel = normalizeStreamingChannel(scheduleData.streamingService);
    channelSource = "curated_schedule";
  } else if (tvmazeRecord?.webChannel?.name) {
    canonicalChannel = normalizeStreamingChannel(tvmazeRecord.webChannel.name);
    channelSource = "tvmaze_web_channel";
  } else if (tvmazeRecord?.network?.name) {
    canonicalChannel = normalizeStreamingChannel(tvmazeRecord.network.name);
    channelSource = "tvmaze_network";
  }

  const currentChannel = show.streamingService ? normalizeStreamingChannel(show.streamingService) : null;
  const isGenericChannel = !currentChannel || currentChannel.toLowerCase() === "unknown" || currentChannel.toLowerCase() === "streaming" || currentChannel.toLowerCase() === "tv";

  if (canonicalChannel && (isGenericChannel || (currentChannel !== canonicalChannel && channelSource === "curated_schedule"))) {
    auditLog.channelsUpdated.push({
      showTitle: show.title,
      oldChannel: show.streamingService || null,
      newChannel: canonicalChannel,
      source: channelSource
    });
    auditLog.changes.push({
      showTitle: show.title,
      field: 'streaming_channel',
      oldValue: show.streamingService || null,
      newValue: canonicalChannel,
      detail: `Standardized streaming channel to ${canonicalChannel} (${channelSource})`,
      timestamp: new Date().toISOString()
    });
    show.streamingService = canonicalChannel as StreamingService;

    // Ensure it exists in services list for filter pills
    if (!Array.isArray(show.services)) {
      show.services = [canonicalChannel as StreamingService];
    } else if (!show.services.includes(canonicalChannel as StreamingService)) {
      show.services = Array.from(new Set([...show.services, canonicalChannel as StreamingService]));
    }
    modified = true;
  }

  // ---------------------------------------------------------------------------
  // 3. AUDIT EPISODE TITLES (Temporary vs Final Creative Titles)
  // ---------------------------------------------------------------------------
  if (!show.episodes) show.episodes = {};

  // Known catalog discrepancies / registry typos that must be corrected to canonical creative titles
  const KNOWN_TITLE_CORRECTIONS: Record<string, Record<string, string>> = {
    "southpark": {
      "S24E1": "The Pandemic Special",
      "S24E2": "South ParQ Vaccination Special",
      "S26E5": "DikinBaus Hot Dogs",
      "S29E1": "South American Biker Gangs"
    },
    "south park": {
      "S24E1": "The Pandemic Special",
      "S24E2": "South ParQ Vaccination Special",
      "S26E5": "DikinBaus Hot Dogs",
      "S29E1": "South American Biker Gangs"
    },
    "fearfactor": {
      "S2E1": "Get the Hell Out",
      "S2E2": "Tech-Hell"
    },
    "fear factor": {
      "S2E1": "Get the Hell Out",
      "S2E2": "Tech-Hell"
    },
    "daredevil": {
      "S1E1": "Heaven’s Half Hour",
      "S2E1": "The Northern Star"
    },
    "daredevil: born again": {
      "S1E1": "Heaven’s Half Hour",
      "S2E1": "The Northern Star"
    },
    "lioness": {
      "S3E1": "The Spider and the Fly",
      "S3E2": "Beware the Second Strike",
      "S3E3": "In the Shadows",
      "S3E4": "The Reckoning",
      "S3E5": "The Trap",
      "S3E6": "Extraction",
      "S3E7": "Zero Hour",
      "S3E8": "The Lion's Den"
    },
    "special ops: lioness": {
      "S3E1": "The Spider and the Fly",
      "S3E2": "Beware the Second Strike",
      "S3E3": "In the Shadows",
      "S3E4": "The Reckoning",
      "S3E5": "The Trap",
      "S3E6": "Extraction",
      "S3E7": "Zero Hour",
      "S3E8": "The Lion's Den"
    },
    "slow horses": {
      "S6E1": "Circle of Life",
      "S6E2": "Daddy Issues",
      "S6E3": "Resurrection",
      "S6E4": "Lost and Found",
      "S6E5": "Sayonara",
      "S6E6": "Judgment Day"
    }
  };

  const showSpecificCorrections = KNOWN_TITLE_CORRECTIONS[normTitle] || KNOWN_TITLE_CORRECTIONS[rawTitle.toLowerCase()];
  if (showSpecificCorrections) {
    for (const [key, correctTitle] of Object.entries(showSpecificCorrections)) {
      if (show.episodes[key] !== correctTitle) {
        const oldVal = show.episodes[key];
        show.episodes[key] = correctTitle;
        auditLog.titlesUpdated.push({
          showTitle: show.title,
          episodeKey: key,
          oldTitle: oldVal || "(empty)",
          newTitle: correctTitle
        });
        auditLog.changes.push({
          showTitle: show.title,
          field: 'episode_title',
          oldValue: oldVal || null,
          newValue: correctTitle,
          detail: `Corrected canonical episode title for ${key}`,
          timestamp: new Date().toISOString()
        });
        modified = true;
      }
    }
  }

  // Check against canonical schedule
  if (scheduleData && Array.isArray(scheduleData.episodes)) {
    for (const canonEp of scheduleData.episodes) {
      const epKey = `S${canonEp.season}E${canonEp.episode}`;
      const numKey = `${canonEp.season}-${canonEp.episode}`;
      const existingTitle = show.episodes[epKey];
      const canonTitle = (canonEp.title || "").trim();

      if (canonTitle && !isTemporaryEpisodeTitle(canonTitle)) {
        if (!existingTitle || isTemporaryEpisodeTitle(existingTitle) || existingTitle !== canonTitle) {
          show.episodes[epKey] = canonTitle;
          if (show.episodes[numKey]) delete show.episodes[numKey];
          auditLog.titlesUpdated.push({
            showTitle: show.title,
            episodeKey: epKey,
            oldTitle: existingTitle || "(empty)",
            newTitle: canonTitle
          });
          auditLog.changes.push({
            showTitle: show.title,
            field: 'episode_title',
            oldValue: existingTitle || null,
            newValue: canonTitle,
            detail: `Finalized canonical episode title for ${epKey}`,
            timestamp: new Date().toISOString()
          });
          modified = true;
        }
      }
    }
  }

  // Cross-check TVmaze embedded episodes if present
  if (Array.isArray(tvmazeRecord?._embedded?.episodes)) {
    for (const ep of tvmazeRecord._embedded.episodes) {
      if (ep.season > 0 && ep.number > 0 && ep.name) {
        const epKey = `S${ep.season}E${ep.number}`;
        const numKey = `${ep.season}-${ep.number}`;
        const existingTitle = show.episodes[epKey];
        let tvmazeTitle = String(ep.name).trim();

        // Apply known correction if TVMaze has a registry typo (e.g., DiKimble's -> DikinBaus)
        if (showSpecificCorrections && showSpecificCorrections[epKey]) {
          tvmazeTitle = showSpecificCorrections[epKey];
        }

        if (tvmazeTitle && !isTemporaryEpisodeTitle(tvmazeTitle)) {
          if (!existingTitle || isTemporaryEpisodeTitle(existingTitle)) {
            show.episodes[epKey] = tvmazeTitle;
            if (show.episodes[numKey]) delete show.episodes[numKey];
            auditLog.titlesUpdated.push({
              showTitle: show.title,
              episodeKey: epKey,
              oldTitle: existingTitle || "(empty)",
              newTitle: tvmazeTitle
            });
            auditLog.changes.push({
              showTitle: show.title,
              field: 'episode_title',
              oldValue: existingTitle || null,
              newValue: tvmazeTitle,
              detail: `Finalized episode title for ${epKey} from live TV registry`,
              timestamp: new Date().toISOString()
            });
            modified = true;
          }
        }
      }
    }
  }

  // Special catalog adjustments for known season distribution (e.g. South Park Season 24 = 2 specials)
  if (normTitle === "southpark" || rawTitle.toLowerCase().includes("south park")) {
    const canonicalSouthParkEps = [13, 18, 17, 17, 14, 17, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 10, 10, 10, 10, 10, 10, 10, 2, 6, 6, 5, 5, 6];
    if (!Array.isArray(show.episodesPerSeason) || show.episodesPerSeason.length !== canonicalSouthParkEps.length || show.episodesPerSeason[23] !== 2) {
      show.episodesPerSeason = canonicalSouthParkEps;
      show.totalSeasons = 29;
      modified = true;
    }
  }

  // Upgrade latestWatched.title if we now have the finalized creative title
  if (show.latestWatched && show.latestWatched.season && show.latestWatched.episode) {
    const k1 = `S${show.latestWatched.season}E${show.latestWatched.episode}`;
    const k2 = `${show.latestWatched.season}-${show.latestWatched.episode}`;
    const finalizedTitle = show.episodes[k1] || show.episodes[k2];
    if (finalizedTitle && !isTemporaryEpisodeTitle(finalizedTitle) && show.latestWatched.title !== finalizedTitle) {
      show.latestWatched.title = finalizedTitle;
      modified = true;
    }
  }

  // ---------------------------------------------------------------------------
  // 4. AUDIT AIR TIMES AND DATES (nextEpisode, airDate, airTime, concluded)
  // ---------------------------------------------------------------------------
  const todayStr = new Date().toISOString().split('T')[0];

  if (show.concluded || scheduleData?.concluded || tvmazeRecord?.status === "Ended" || tvmazeRecord?.status === "Canceled") {
    if (!show.concluded) {
      show.concluded = true;
      modified = true;
    }
    if (show.nextEpisode !== null) {
      show.nextEpisode = null;
      modified = true;
    }
  } else {
    // Resolve upcoming episode from schedule or live TVmaze
    const resolvedNext = resolveNextUpcomingEpisode(show);
    let candidateNext: { season: number; episode: number; title: string; airDate: string; overview?: string; airTime?: string } | null = resolvedNext;

    if (!candidateNext && Array.isArray(tvmazeRecord?._embedded?.episodes)) {
      const futureEps = tvmazeRecord._embedded.episodes
        .filter((e: any) => e.season > 0 && e.airdate && e.airdate >= todayStr)
        .sort((a: any, b: any) => a.airdate.localeCompare(b.airdate));

      if (futureEps.length > 0) {
        const next = futureEps[0];
        candidateNext = {
          season: next.season,
          episode: next.number,
          title: next.name || `Episode ${next.number}`,
          airDate: next.airdate,
          airTime: next.airtime || undefined
        };
      }
    }

    if (candidateNext) {
      const currentNext = show.nextEpisode;
      const episodeChanged = !currentNext || currentNext.season !== candidateNext.season || currentNext.episode !== candidateNext.episode;
      const airDateChanged = !currentNext || currentNext.airDate !== candidateNext.airDate;
      const titleChanged = !currentNext || currentNext.title !== candidateNext.title;
      const airTimeChanged = Boolean(candidateNext.airTime && (!currentNext || currentNext.airTime !== candidateNext.airTime));

      if (episodeChanged || airDateChanged || titleChanged || airTimeChanged) {
        auditLog.airDatesUpdated.push({
          showTitle: show.title,
          oldAirDate: currentNext?.airDate || null,
          newAirDate: candidateNext.airDate,
          oldAirTime: currentNext?.airTime || null,
          newAirTime: candidateNext.airTime || undefined,
          episode: `S${candidateNext.season}E${candidateNext.episode} ("${candidateNext.title}")`
        });
        auditLog.changes.push({
          showTitle: show.title,
          field: 'air_date',
          oldValue: currentNext?.airDate ? `${currentNext.airDate}${currentNext.airTime ? ` @ ${currentNext.airTime}` : ''}` : null,
          newValue: `${candidateNext.airDate}${candidateNext.airTime ? ` @ ${candidateNext.airTime}` : ''}`,
          detail: `Synchronized air schedule for S${candidateNext.season}E${candidateNext.episode}`,
          timestamp: new Date().toISOString()
        });

        show.nextEpisode = {
          ...candidateNext,
          airDate: candidateNext.airDate.match(/^(\d{4})-(\d{2})-(\d{2})/)?.[0] || candidateNext.airDate
        };
        modified = true;
      }
    } else if (scheduleData && scheduleData.concluded && !show.concluded) {
      show.concluded = true;
      show.nextEpisode = null;
      modified = true;
    }
  }

  // Enforce episode dictionary bounding to prevent catalog ballooning
  boundShowEpisodes(show);

  // Update audit tracking metadata on show
  (show as any).metadataAuditedAt = new Date().toISOString();
  (show as any).metadataAuditStatus = modified ? 'updated' : 'verified';

  return modified;
}

/**
 * Audits all shows in an array synchronously against local canonical databases.
 */
export function auditAllShows(shows: TvShow[]): { shows: TvShow[]; result: AuditResult } {
  const startTime = Date.now();
  const result = createEmptyAuditResult();
  result.totalShowsAudited = shows.length;

  let modifiedShowsCount = 0;
  for (const show of shows) {
    const wasModified = auditShow(show, result);
    if (wasModified) modifiedShowsCount++;
  }

  result.durationMs = Date.now() - startTime;
  result.summary = {
    titlesCount: result.titlesUpdated.length,
    airDatesCount: result.airDatesUpdated.length,
    bannersCount: result.bannersUpdated.length,
    channelsCount: result.channelsUpdated.length,
    showsModified: modifiedShowsCount
  };

  return { shows, result };
}
