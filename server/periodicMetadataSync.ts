/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * CouchTaterz Automated Periodic Metadata Sync Engine
 * 
 * Senior Full-Stack Engineering Principles:
 * 1. Accuracy of Show Card Images (Poster / Key Art Banner)
 * 2. Accuracy of Air Times and Dates (Strict ISO YYYY-MM-DD + Air Time + Concluded Status)
 * 3. Accuracy of Streaming Channel (Standardized platform mapping & services)
 * 4. Accuracy of Episode Titles (Provisional vs Final Creative Episode Titles)
 * 
 * Operational Best Practices:
 * - Cadence: 6-hour full library cycle, 2-hour high-priority cycle for imminent airings.
 * - Startup: Staggered 45s initial delay prevents cold-start resource contention.
 * - Rate-Limiting: Polite 350ms delay between remote lookups; circuit breaker on 429/503.
 * - Zero-Data-Loss: User reviews, ratings, and notes are strictly immutable and safeguarded.
 * - Observability: File-backed audit log retention (data/metadata-audit-logs.json) with before/after diffs.
 */

import fs from "fs";
import path from "path";
import { Board, TvShow } from "../src/types";
import { auditShow, createEmptyAuditResult, AuditResult, MetadataChangeRecord, isTemporaryEpisodeTitle } from "./metadataAuditor";
import { recordShowsToLedger, applyReviewsLedgerToShows, isJulioAccountLedger } from "./reviewsLedger";

// File paths
const DB_FILE = path.join(process.cwd(), "data.json");
const AUDIT_LOGS_FILE = path.join(process.cwd(), "data", "metadata-audit-logs.json");

// Timing and Parameter Constants (Best Practices)
export const METADATA_SYNC_CONFIG = {
  FULL_AUDIT_INTERVAL_MS: 6 * 60 * 60 * 1000,    // 6 Hours (Production Full Library Audit)
  ACTIVE_SHOWS_INTERVAL_MS: 2 * 60 * 60 * 1000, // 2 Hours (Near-term upcoming / Watching shows)
  INITIAL_BOOT_DELAY_MS: 20 * 1000,             // 20 Seconds (Fast, local-only boot verification)
  INTER_REQUEST_DELAY_MS: 350,                  // 350ms (Polite API rate limit pacing)
  SHOW_CACHE_TTL_MS: 6 * 60 * 60 * 1000,        // 6 Hours (Show freshness threshold)
  REQUEST_TIMEOUT_MS: 3000,                     // 3 Seconds (Strict fetch timeout)
  MAX_AUDIT_LOGS_RETAINED: 50                   // Keep last 50 audit runs in ledger
};

export interface SyncTelemetry {
  isRunning: boolean;
  lastRunTime: string | null;
  nextRunTime: string | null;
  totalRunsCompleted: number;
  config: typeof METADATA_SYNC_CONFIG;
  cumulativeStats: {
    totalShowsAudited: number;
    totalImagesCorrected: number;
    totalAirDatesCorrected: number;
    totalChannelsCorrected: number;
    totalTitlesFinalized: number;
    totalShowsModified: number;
  };
  recentRuns: AuditResult[];
}

// In-Memory Telemetry & State
let isSyncRunning = false;
let lastRunTimestamp: string | null = null;
let nextRunTimestamp: string | null = null;
let fullSyncTimer: NodeJS.Timeout | null = null;
let activeSyncTimer: NodeJS.Timeout | null = null;
let initialBootTimer: NodeJS.Timeout | null = null;
let circuitBreakerUntilMs = 0;

let cumulativeStats = {
  totalShowsAudited: 0,
  totalImagesCorrected: 0,
  totalAirDatesCorrected: 0,
  totalChannelsCorrected: 0,
  totalTitlesFinalized: 0,
  totalShowsModified: 0
};

// Injection point for database sync functions (supplied by server.ts)
let dbWriterCallback: ((db: Record<string, Board>) => Promise<void> | void) | null = null;

export function registerDatabaseWriter(callback: (db: Record<string, Board>) => Promise<void> | void) {
  dbWriterCallback = callback;
}

/**
 * Load audit history from disk
 */
function loadAuditLogs(): AuditResult[] {
  try {
    if (fs.existsSync(AUDIT_LOGS_FILE)) {
      const raw = fs.readFileSync(AUDIT_LOGS_FILE, "utf8").trim();
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.slice(-METADATA_SYNC_CONFIG.MAX_AUDIT_LOGS_RETAINED);
    }
  } catch (e) {
    console.error("[MetadataSync] Failed to read audit logs:", e);
  }
  return [];
}

/**
 * Persist audit run to disk
 */
function persistAuditResult(result: AuditResult): void {
  try {
    const existing = loadAuditLogs();
    existing.push(result);
    const trimmed = existing.slice(-METADATA_SYNC_CONFIG.MAX_AUDIT_LOGS_RETAINED);
    
    const dir = path.dirname(AUDIT_LOGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const tempPath = `${AUDIT_LOGS_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempPath, JSON.stringify(trimmed, null, 2), "utf8");
    fs.renameSync(tempPath, AUDIT_LOGS_FILE);
  } catch (e) {
    console.error("[MetadataSync] Failed to persist audit logs:", e);
  }
}

/**
 * Fetch TVmaze metadata safely with strict timeout
 */
async function fetchTvmazeMetadata(title: string): Promise<any | null> {
  if (Date.now() < circuitBreakerUntilMs) {
    return null; // Circuit breaker active
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), METADATA_SYNC_CONFIG.REQUEST_TIMEOUT_MS);

  try {
    const url = `https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(title)}&embed[]=nextepisode&embed[]=episodes`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (res.status === 429 || res.status === 503) {
      console.warn(`[MetadataSync] Remote rate limit / 503 hit for "${title}". Activating 15m circuit breaker.`);
      circuitBreakerUntilMs = Date.now() + 15 * 60 * 1000;
      return null;
    }

    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    clearTimeout(timer);
  }
  return null;
}

/**
 * Sleep helper for polite rate limiting
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Core Metadata Audit Execution Engine
 */
export async function runPeriodicMetadataAudit(options: {
  force?: boolean;
  showTitle?: string;
  triggerSource?: 'cron' | 'manual' | 'boot' | 'active_queue';
} = {}): Promise<AuditResult> {
  if (isSyncRunning) {
    console.log("[MetadataSync] Sync is already in progress. Skipping duplicate run.");
    const empty = createEmptyAuditResult();
    empty.summary.showsModified = -1;
    return empty;
  }

  isSyncRunning = true;
  const startTime = Date.now();
  const triggerSource = options.triggerSource || 'cron';
  console.log(`\n[MetadataSync] === Starting Metadata Audit Run (${triggerSource.toUpperCase()}) ===`);

  const auditResult = createEmptyAuditResult();

  try {
    // 1. Read Database
    if (!fs.existsSync(DB_FILE)) {
      console.error("[MetadataSync] Database file not found. Aborting.");
      isSyncRunning = false;
      return auditResult;
    }

    let db: Record<string, Board> = {};
    try {
      db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
    } catch (err) {
      console.error("[MetadataSync] Failed to parse data.json:", err);
      isSyncRunning = false;
      return auditResult;
    }

    // Safeguard reviews to ledger before running audit
    try {
      recordShowsToLedger(db);
    } catch (e) {}

    // 2. Collect unique shows to audit
    const uniqueShowsMap = new Map<string, TvShow>();
    const showBoardsMap = new Map<string, Set<string>>(); // showKey -> Set of boardIds

    const getShowKey = (s: TvShow) => (s.id || s.title || "").toLowerCase().trim();

    for (const [boardId, board] of Object.entries(db)) {
      if (!board || !Array.isArray(board.shows)) continue;
      
      for (const show of board.shows) {
        if (!show || !show.title) continue;
        const key = getShowKey(show);

        // Filter by target show if specified
        if (options.showTitle && !show.title.toLowerCase().includes(options.showTitle.toLowerCase().trim())) {
          continue;
        }

        // For active_queue trigger, prioritize shows currently Watching or with upcoming airings
        if (triggerSource === 'active_queue') {
          const isWatching = show.status === 'Watching';
          const hasUpcoming = Boolean(show.nextEpisode?.airDate);
          if (!isWatching && !hasUpcoming) continue;
        }

        if (!uniqueShowsMap.has(key)) {
          uniqueShowsMap.set(key, { ...show });
        }
        if (!showBoardsMap.has(key)) {
          showBoardsMap.set(key, new Set());
        }
        showBoardsMap.get(key)!.add(boardId);
      }
    }

    const showsToAudit = Array.from(uniqueShowsMap.values());
    auditResult.totalShowsAudited = showsToAudit.length;
    console.log(`[MetadataSync] Identified ${showsToAudit.length} unique shows across all user boards.`);

    let modifiedShowsCount = 0;
    const modifiedShowKeys = new Set<string>();
    let remoteQueriesCount = 0;
    const isBootRun = triggerSource === 'boot';
    const MAX_REMOTE_QUERIES_PER_RUN = isBootRun ? 0 : (triggerSource === 'active_queue' ? 15 : (triggerSource === 'cron' ? 30 : 100));

    // 3. Process Shows with Polite Rate Limiting
    for (let i = 0; i < showsToAudit.length; i++) {
      const show = showsToAudit[i];
      const showKey = getShowKey(show);

      // Check TTL cache to prevent wasteful queries unless forced
      const lastAuditMs = show.metadataAuditedAt ? new Date(show.metadataAuditedAt).getTime() : 0;
      const isStale = (Date.now() - lastAuditMs) > METADATA_SYNC_CONFIG.SHOW_CACHE_TTL_MS;
      
      // On boot runs, never perform remote network requests. Audit against local canonical schedules and verified assets.
      const shouldAuditRemote = !isBootRun && (options.force || isStale || !show.bannerImage || isTemporaryEpisodeTitle(show.nextEpisode?.title));

      let tvmazeRecord = null;
      if (shouldAuditRemote && remoteQueriesCount < MAX_REMOTE_QUERIES_PER_RUN && Date.now() >= circuitBreakerUntilMs) {
        tvmazeRecord = await fetchTvmazeMetadata(show.title);
        remoteQueriesCount++;
        if (tvmazeRecord) {
          await sleep(METADATA_SYNC_CONFIG.INTER_REQUEST_DELAY_MS);
        }
      }

      // Execute 4-Pillar Verification Check
      const wasModified = auditShow(show, auditResult, tvmazeRecord);

      if (wasModified) {
        modifiedShowsCount++;
        modifiedShowKeys.add(showKey);
        uniqueShowsMap.set(showKey, show);
        console.log(`  [✓ Corrected] "${show.title}":`);
        const relevantChanges = auditResult.changes.filter(c => c.showTitle === show.title);
        relevantChanges.forEach(c => console.log(`      - ${c.field.toUpperCase()}: ${c.oldValue || '(empty)'} -> ${c.newValue}`));
      }
    }

    // 4. Update Boards & Persist Changes if any show was modified
    if (modifiedShowsCount > 0) {
      console.log(`\n[MetadataSync] ${modifiedShowsCount} shows updated. Propagating to ${showBoardsMap.size} user boards...`);

      for (const [boardId, board] of Object.entries(db)) {
        if (!board || !Array.isArray(board.shows)) continue;
        let boardChanged = false;

        board.shows = board.shows.map((s: TvShow) => {
          if (!s || !s.title) return s;
          const sKey = getShowKey(s);
          if (modifiedShowKeys.has(sKey)) {
            const updated = uniqueShowsMap.get(sKey);
            if (updated) {
              boardChanged = true;
              return {
                ...s,
                bannerImage: updated.bannerImage || s.bannerImage,
                streamingService: updated.streamingService || s.streamingService,
                services: updated.services || s.services,
                episodes: { ...(s.episodes || {}), ...(updated.episodes || {}) },
                nextEpisode: updated.nextEpisode !== undefined ? updated.nextEpisode : s.nextEpisode,
                concluded: updated.concluded !== undefined ? updated.concluded : s.concluded,
                totalSeasons: updated.totalSeasons || s.totalSeasons,
                episodesPerSeason: updated.episodesPerSeason || s.episodesPerSeason,
                latestWatched: (s.latestWatched && (updated.episodes || (s.episodes))) ? {
                  ...s.latestWatched,
                  title: (updated.episodes && (updated.episodes[`S${s.latestWatched.season}E${s.latestWatched.episode}`] || updated.episodes[`${s.latestWatched.season}-${s.latestWatched.episode}`])) ||
                         (s.episodes && (s.episodes[`S${s.latestWatched.season}E${s.latestWatched.episode}`] || s.episodes[`${s.latestWatched.season}-${s.latestWatched.episode}`])) ||
                         s.latestWatched.title
                } : s.latestWatched,
                metadataAuditedAt: updated.metadataAuditedAt || new Date().toISOString(),
                metadataAuditStatus: updated.metadataAuditStatus || 'verified'
              };
            }
          }
          return s;
        });

        if (boardChanged) {
          board.updatedAt = new Date().toISOString();
        }
      }

      // Re-apply ledger to protect user reviews for Julio's master collection
      for (const [boardId, board] of Object.entries(db)) {
        if (board && Array.isArray(board.shows)) {
          board.shows = applyReviewsLedgerToShows(board.shows, boardId);
          if (!isJulioAccountLedger(boardId) && !isJulioAccountLedger(board.owner)) {
            board.shows = board.shows.map((s: TvShow) => {
              const anyShow = s as any;
              if (anyShow.ownerName && typeof anyShow.ownerName === "string" && anyShow.ownerName.toLowerCase().includes("julio")) {
                anyShow.ownerName = board.owner?.name || "Buddy";
              }
              if (Array.isArray(anyShow.ownerNames)) {
                anyShow.ownerNames = anyShow.ownerNames.filter((n: string) => typeof n === "string" && !n.toLowerCase().includes("julio"));
                if (anyShow.ownerNames.length === 0) {
                  anyShow.ownerNames = [board.owner?.name || "Buddy"];
                }
              }
              return s;
            });
          }
        }
      }

      // Persist Database Safely
      if (dbWriterCallback) {
        await dbWriterCallback(db);
      } else {
        const tempDb = `${DB_FILE}.tmp.${Date.now()}`;
        fs.writeFileSync(tempDb, JSON.stringify(db, null, 2), "utf8");
        fs.renameSync(tempDb, DB_FILE);
      }
    }

    // 5. Finalize Metrics & Persist Audit Result
    auditResult.durationMs = Date.now() - startTime;
    auditResult.summary = {
      titlesCount: auditResult.titlesUpdated.length,
      airDatesCount: auditResult.airDatesUpdated.length,
      bannersCount: auditResult.bannersUpdated.length,
      channelsCount: auditResult.channelsUpdated.length,
      showsModified: modifiedShowsCount
    };

    lastRunTimestamp = auditResult.timestamp;
    nextRunTimestamp = new Date(Date.now() + METADATA_SYNC_CONFIG.FULL_AUDIT_INTERVAL_MS).toISOString();

    // Update cumulative telemetry
    cumulativeStats.totalShowsAudited += auditResult.totalShowsAudited;
    cumulativeStats.totalImagesCorrected += auditResult.summary.bannersCount;
    cumulativeStats.totalAirDatesCorrected += auditResult.summary.airDatesCount;
    cumulativeStats.totalChannelsCorrected += auditResult.summary.channelsCount;
    cumulativeStats.totalTitlesFinalized += auditResult.summary.titlesCount;
    cumulativeStats.totalShowsModified += auditResult.summary.showsModified;

    persistAuditResult(auditResult);

    console.log(`[MetadataSync] === Completed in ${auditResult.durationMs}ms ===`);
    console.log(`  - Shows Scanned:           ${auditResult.totalShowsAudited}`);
    console.log(`  - Card Images Upgraded:    ${auditResult.summary.bannersCount}`);
    console.log(`  - Air Dates/Times Synced:  ${auditResult.summary.airDatesCount}`);
    console.log(`  - Channels Standardized:   ${auditResult.summary.channelsCount}`);
    console.log(`  - Episode Titles Finalized:${auditResult.summary.titlesCount}`);
    console.log(`  - Next Scheduled Run:      ${nextRunTimestamp}\n`);

  } catch (err: any) {
    console.error("[MetadataSync] Critical error during metadata audit:", err);
  } finally {
    isSyncRunning = false;
  }

  return auditResult;
}

/**
 * Start the periodic background sync daemon
 */
export function startPeriodicMetadataSync(options: { runImmediately?: boolean } = {}) {
  // Clear any existing timers
  stopPeriodicMetadataSync();

  console.log(`[MetadataSync] Initializing periodic sync engine:`);
  console.log(`  - Full Library Cadence:  Every ${METADATA_SYNC_CONFIG.FULL_AUDIT_INTERVAL_MS / (60 * 60 * 1000)} hours`);
  console.log(`  - Active Queue Cadence:  Every ${METADATA_SYNC_CONFIG.ACTIVE_SHOWS_INTERVAL_MS / (60 * 60 * 1000)} hours`);
  console.log(`  - Initial Boot Delay:    ${METADATA_SYNC_CONFIG.INITIAL_BOOT_DELAY_MS / 1000}s`);
  console.log(`  - Polite API Pacing:     ${METADATA_SYNC_CONFIG.INTER_REQUEST_DELAY_MS}ms per request`);

  nextRunTimestamp = new Date(Date.now() + (options.runImmediately ? 0 : METADATA_SYNC_CONFIG.INITIAL_BOOT_DELAY_MS)).toISOString();

  // 1. Initial Staggered Boot Run (after 45s to avoid cold-start container thrashing)
  initialBootTimer = setTimeout(() => {
    runPeriodicMetadataAudit({ triggerSource: 'boot' }).catch(() => {});
  }, options.runImmediately ? 1000 : METADATA_SYNC_CONFIG.INITIAL_BOOT_DELAY_MS);

  // 2. Full Library Audit Timer (Every 6 Hours)
  fullSyncTimer = setInterval(() => {
    runPeriodicMetadataAudit({ triggerSource: 'cron' }).catch(() => {});
  }, METADATA_SYNC_CONFIG.FULL_AUDIT_INTERVAL_MS);

  // 3. Near-Term Active Queue Timer (Every 2 Hours)
  activeSyncTimer = setInterval(() => {
    runPeriodicMetadataAudit({ triggerSource: 'active_queue' }).catch(() => {});
  }, METADATA_SYNC_CONFIG.ACTIVE_SHOWS_INTERVAL_MS);
}

/**
 * Stop background daemon for clean shutdown
 */
export function stopPeriodicMetadataSync() {
  if (initialBootTimer) {
    clearTimeout(initialBootTimer);
    initialBootTimer = null;
  }
  if (fullSyncTimer) {
    clearInterval(fullSyncTimer);
    fullSyncTimer = null;
  }
  if (activeSyncTimer) {
    clearInterval(activeSyncTimer);
    activeSyncTimer = null;
  }
}

/**
 * Telemetry status getter for Admin API & UI
 */
export function getMetadataSyncTelemetry(): SyncTelemetry {
  const recentRuns = loadAuditLogs();
  return {
    isRunning: isSyncRunning,
    lastRunTime: lastRunTimestamp || (recentRuns.length > 0 ? recentRuns[recentRuns.length - 1].timestamp : null),
    nextRunTime: nextRunTimestamp || new Date(Date.now() + METADATA_SYNC_CONFIG.FULL_AUDIT_INTERVAL_MS).toISOString(),
    totalRunsCompleted: recentRuns.length,
    config: METADATA_SYNC_CONFIG,
    cumulativeStats,
    recentRuns: recentRuns.slice(-10).reverse()
  };
}
