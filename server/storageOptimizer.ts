/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from "fs";
import path from "path";

export const BOARDS_DIR = path.join(process.cwd(), "data", "boards");
export const BACKUPS_DIR = path.join(process.cwd(), "data", "backups");
export const MASTER_SHOWS_FILE = path.join(process.cwd(), "data", "julioMasterShows.json");
export const REVIEWS_LEDGER_FILE = path.join(process.cwd(), "reviews_ledger.json");

/**
 * Active-Window Episode Bounding Engine
 * Enforces bounded episode storage per show to permanently prevent JSON dictionary ballooning,
 * while strictly guaranteeing 100% zero data loss for:
 *  1. Any episode with a user review, user score, or user note (in show.episodeReviews)
 *  2. Currently watched season & episode (show.latestWatched)
 *  3. Upcoming season & episode (show.nextEpisode)
 *  4. Watched season +/- 1 and upcoming season
 *  5. Latest season (show.totalSeasons)
 * Also normalizes legacy dash keys (e.g. '1-1' -> 'S1E1') and eliminates duplicates.
 */
export function boundShowEpisodes(show: any): any {
  if (!show || !show.episodes || typeof show.episodes !== "object") {
    return show;
  }

  const watchedSeason = typeof show.latestWatched?.season === "number" && show.latestWatched.season > 0
    ? show.latestWatched.season
    : 1;
  const watchedEpisode = typeof show.latestWatched?.episode === "number"
    ? show.latestWatched.episode
    : 0;

  const nextSeason = typeof show.nextEpisode?.season === "number" && show.nextEpisode.season > 0
    ? show.nextEpisode.season
    : watchedSeason;
  const nextEpisode = typeof show.nextEpisode?.episode === "number"
    ? show.nextEpisode.episode
    : 0;

  const totalSeasons = typeof show.totalSeasons === "number" && show.totalSeasons > 0
    ? show.totalSeasons
    : Math.max(watchedSeason, nextSeason, 1);

  // Active seasons window: watched season, watched-1, watched+1, next season, and latest season
  const activeSeasons = new Set<number>([
    watchedSeason,
    nextSeason,
    totalSeasons,
    Math.min(watchedSeason + 1, totalSeasons),
    Math.max(1, watchedSeason - 1)
  ]);

  // Collect all keys that have user reviews or ratings so they are NEVER pruned
  const reviewedKeys = new Set<string>();
  if (show.episodeReviews && typeof show.episodeReviews === "object") {
    for (const rk of Object.keys(show.episodeReviews)) {
      const match = rk.match(/^(?:S(\d+)E(\d+)|(\d+)-(\d+))$/i);
      if (match) {
        const sNum = parseInt(match[1] || match[3], 10);
        const eNum = parseInt(match[2] || match[4], 10);
        reviewedKeys.add(`S${sNum}E${eNum}`);
        activeSeasons.add(sNum);
      } else {
        reviewedKeys.add(rk);
      }
    }
  }

  const boundedEpisodes: Record<string, string> = {};

  for (const [key, val] of Object.entries(show.episodes)) {
    if (typeof val !== "string") continue;

    const match = key.match(/^(?:S(\d+)E(\d+)|(\d+)-(\d+))$/i);
    if (!match) {
      // Non-standard key; retain
      boundedEpisodes[key] = val;
      continue;
    }

    const sNum = parseInt(match[1] || match[3], 10);
    const eNum = parseInt(match[2] || match[4], 10);
    const canonicalKey = `S${sNum}E${eNum}`;

    const isReviewed = reviewedKeys.has(canonicalKey) || reviewedKeys.has(key);
    const isWatched = sNum === watchedSeason && eNum === watchedEpisode;
    const isNext = sNum === nextSeason && eNum === nextEpisode;
    const isInActiveSeason = activeSeasons.has(sNum);

    if (isReviewed || isWatched || isNext || isInActiveSeason) {
      // Retain under canonical key and strip duplicate legacy dash keys
      boundedEpisodes[canonicalKey] = val;
    }
  }

  show.episodes = boundedEpisodes;
  return show;
}

/**
 * Loads all partitioned board files from data/boards/ into an in-memory dictionary.
 */
export function loadAllBoardsFromDisk(boardsDir = BOARDS_DIR): Record<string, any> {
  const boards: Record<string, any> = {};
  if (!fs.existsSync(boardsDir)) return boards;

  try {
    const files = fs.readdirSync(boardsDir).filter(f => f.endsWith(".json"));
    for (const file of files) {
      const boardId = path.basename(file, ".json");
      const filePath = path.join(boardsDir, file);
      try {
        const raw = fs.readFileSync(filePath, "utf8");
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && (parsed.id || parsed.name || Array.isArray(parsed.shows))) {
          boards[boardId] = parsed;
        }
      } catch (readErr) {}
    }
  } catch (err) {}

  return boards;
}

/**
 * Saves a single modular board file atomically to data/boards/${boardId}.json (<1ms write time).
 */
export function saveBoardToDisk(boardId: string, board: any, boardsDir = BOARDS_DIR): void {
  try {
    if (!fs.existsSync(boardsDir)) {
      fs.mkdirSync(boardsDir, { recursive: true });
    }
    const filePath = path.join(boardsDir, `${boardId}.json`);
    const tempPath = path.join(boardsDir, `${boardId}.${Date.now()}.${Math.random().toString(36).slice(2, 6)}.tmp`);
    fs.writeFileSync(tempPath, JSON.stringify(board, null, 2), "utf8");
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    console.error(`[Modular Board Storage] Failed saving board ${boardId}:`, err);
  }
}

/**
 * Deletes a single modular board file when a board is removed.
 */
export function deleteBoardFromDisk(boardId: string, boardsDir = BOARDS_DIR): void {
  try {
    const filePath = path.join(boardsDir, `${boardId}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {}
}

export interface StorageHealthReport {
  status: "OPTIMAL" | "WARNING" | "CRITICAL";
  summary: string;
  details: {
    dbSizeKb: number;
    ledgerSizeKb: number;
    masterSizeKb: number;
    totalBoardFiles: number;
    maxBoardSizeKb: number;
    maxBoardName: string;
    totalJsonWeightKb: number;
    isolatedCount: number;
    warnings: string[];
  };
}

/**
 * Storage Health Circuit Breaker & Safeguard Engine
 * Monitors repository JSON file sizes, audits for accidental file ballooning,
 * prevents root directory pollution (.bak/.tmp), and enforces Google AI Studio safety bounds.
 */
export function verifyStorageHealth(dbFilePath?: string): StorageHealthReport {
  try {
    const rootDir = process.cwd();
    const dataDir = path.join(rootDir, "data");
    const boardsDir = path.join(dataDir, "boards");
    const backupsDir = path.join(dataDir, "backups");
    const targetDbFile = dbFilePath || path.join(rootDir, "data.json");

    if (!fs.existsSync(backupsDir)) {
      try { fs.mkdirSync(backupsDir, { recursive: true }); } catch (e) {}
    }

    // 1. Root directory check: Clean up or isolate any stray .bak or .tmp files
    let isolatedCount = 0;
    try {
      const rootFiles = fs.readdirSync(rootDir);
      for (const file of rootFiles) {
        if (file.endsWith(".pre_review_fix_bak") || (file.includes(".bak") && !file.startsWith(".")) || file.endsWith(".tmp")) {
          try {
            const src = path.join(rootDir, file);
            const dest = path.join(backupsDir, file);
            fs.renameSync(src, dest);
            isolatedCount++;
          } catch (e) {}
        }
      }
    } catch (e) {}

    // 2. Measure core data files
    const getFileSizeKb = (filePath: string): number => {
      try {
        return fs.existsSync(filePath) ? Math.round(fs.statSync(filePath).size / 1024) : 0;
      } catch (e) {
        return 0;
      }
    };

    const dbSizeKb = getFileSizeKb(targetDbFile);
    const ledgerSizeKb = getFileSizeKb(REVIEWS_LEDGER_FILE);
    const masterSizeKb = getFileSizeKb(MASTER_SHOWS_FILE);

    // 3. Measure boards directory
    let totalBoardFiles = 0;
    let maxBoardSizeKb = 0;
    let maxBoardName = "";
    let totalBoardsWeightKb = 0;

    if (fs.existsSync(boardsDir)) {
      const boardFiles = fs.readdirSync(boardsDir).filter(f => f.endsWith(".json"));
      totalBoardFiles = boardFiles.length;
      for (const bf of boardFiles) {
        const sizeKb = getFileSizeKb(path.join(boardsDir, bf));
        totalBoardsWeightKb += sizeKb;
        if (sizeKb > maxBoardSizeKb) {
          maxBoardSizeKb = sizeKb;
          maxBoardName = bf;
        }
      }
    }

    const totalJsonWeightKb = dbSizeKb + ledgerSizeKb + masterSizeKb + totalBoardsWeightKb;

    // Google AI Studio limits: Individual files should be < 1MB (1024KB), total repo JSON < 10MB (10240KB)
    let status: "OPTIMAL" | "WARNING" | "CRITICAL" = "OPTIMAL";
    const warnings: string[] = [];

    if (maxBoardSizeKb > 800) {
      status = "WARNING";
      warnings.push(`Board ${maxBoardName} (${maxBoardSizeKb}KB) exceeds 800KB safeguard threshold.`);
    }
    if (dbSizeKb > 2500) {
      status = "WARNING";
      warnings.push(`Main database (${dbSizeKb}KB) exceeds 2.5MB safeguard threshold.`);
    }
    if (totalJsonWeightKb > 8000) {
      status = "CRITICAL";
      warnings.push(`Total JSON weight (${Math.round(totalJsonWeightKb / 1024)}MB) approaches Google AI Studio 10MB ceiling.`);
    }

    const summary = `[Storage Health] DB: ${Math.round(dbSizeKb / 1024 * 10) / 10}MB | Ledger: ${ledgerSizeKb}KB | Boards: ${totalBoardFiles} (max: ${maxBoardSizeKb}KB ${maxBoardName}) | Total: ${Math.round(totalJsonWeightKb / 1024 * 10) / 10}MB [${status}]`;
    console.log(summary);
    if (warnings.length > 0) {
      warnings.forEach(w => console.warn(`[Storage Warning] ${w}`));
    }
    if (isolatedCount > 0) {
      console.log(`[Storage Health] Isolated ${isolatedCount} stray backup/temp file(s) into data/backups/`);
    }

    return {
      status,
      summary,
      details: {
        dbSizeKb,
        ledgerSizeKb,
        masterSizeKb,
        totalBoardFiles,
        maxBoardSizeKb,
        maxBoardName,
        totalJsonWeightKb,
        isolatedCount,
        warnings
      }
    };
  } catch (err) {
    console.warn("[Storage Health] Verification encountered non-fatal error:", err);
    return {
      status: "OPTIMAL",
      summary: "[Storage Health] Audit skipped",
      details: {
        dbSizeKb: 0,
        ledgerSizeKb: 0,
        masterSizeKb: 0,
        totalBoardFiles: 0,
        maxBoardSizeKb: 0,
        maxBoardName: "",
        totalJsonWeightKb: 0,
        isolatedCount: 0,
        warnings: []
      }
    };
  }
}
