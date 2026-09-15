/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from "fs";
import path from "path";
import { TvShow, Board } from "../src/types";

export interface StoredReviewEntry {
  showId: string;
  showTitle: string;
  episodeReviews: Record<string, string>;
  episodeScores: Record<string, number>;
  episodeTags?: Record<string, string[]>;
  userNotes?: string;
  userScore?: number;
  reviewUpdatedAt?: string;
  updatedAt: string;
}

export type ReviewsLedger = Record<string, StoredReviewEntry>;

const LEDGER_FILE = path.join(process.cwd(), "reviews_ledger.json");
const LEDGER_BACKUP_FILE = path.join(process.cwd(), "reviews_ledger.json.bak");

function safeWriteJson(filePath: string, data: any) {
  try {
    const tempFile = `${filePath}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf8");
    fs.renameSync(tempFile, filePath);
  } catch (err) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    } catch (e) {
      console.error(`[ReviewsLedger] Failed to write to ${filePath}:`, e);
    }
  }
}

export function loadReviewsLedger(): ReviewsLedger {
  try {
    if (fs.existsSync(LEDGER_FILE)) {
      const content = fs.readFileSync(LEDGER_FILE, "utf8");
      return JSON.parse(content);
    }
  } catch (e) {
    console.warn("[ReviewsLedger] Main ledger read error, attempting backup...", e);
  }

  try {
    if (fs.existsSync(LEDGER_BACKUP_FILE)) {
      const content = fs.readFileSync(LEDGER_BACKUP_FILE, "utf8");
      return JSON.parse(content);
    }
  } catch (e) {
    console.error("[ReviewsLedger] Backup ledger read error:", e);
  }

  return {};
}

export function saveReviewsLedger(ledger: ReviewsLedger): void {
  safeWriteJson(LEDGER_FILE, ledger);
  try {
    safeWriteJson(LEDGER_BACKUP_FILE, ledger);
  } catch (e) {}
}

/**
 * Normalizes title for consistent ledger keying across aliases
 */
export function normalizeLedgerKey(titleOrId: string): string {
  if (!titleOrId) return "";
  return titleOrId
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(the|a|an)\b/gi, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

/**
 * Harvests all reviews, episode scores, user notes, and user scores from a set of shows
 * and atomically persists them into the immutable reviews ledger.
 */
export function recordShowsToLedger(shows: any[] | Record<string, Board>): void {
  if (!shows) return;

  const showList: any[] = [];
  if (Array.isArray(shows)) {
    showList.push(...shows);
  } else if (typeof shows === "object") {
    for (const board of Object.values(shows)) {
      if (board && Array.isArray(board.shows)) {
        showList.push(...board.shows);
      }
    }
  }

  const ledger = loadReviewsLedger();
  let modified = false;

  for (const s of showList) {
    if (!s || typeof s !== "object") continue;

    const hasEpReviews = s.episodeReviews && typeof s.episodeReviews === "object" && Object.keys(s.episodeReviews).length > 0;
    const hasEpScores = s.episodeScores && typeof s.episodeScores === "object" && Object.keys(s.episodeScores).length > 0;
    const hasNotes = typeof s.userNotes === "string" && s.userNotes.trim().length > 0;
    const hasScore = typeof s.userScore === "number";

    if (!hasEpReviews && !hasEpScores && !hasNotes && !hasScore) continue;

    // Use multiple keys to ensure resilient recovery by ID and normalized title
    const idKey = s.id ? s.id.trim() : "";
    const titleKey = s.title ? normalizeLedgerKey(s.title) : "";
    const primaryKey = idKey || titleKey;
    if (!primaryKey) continue;

    const existing = ledger[primaryKey] || (titleKey ? ledger[titleKey] : null);

    const mergedEpReviews: Record<string, string> = {
      ...(existing?.episodeReviews || {}),
      ...(s.episodeReviews || {}),
    };

    const mergedEpScores: Record<string, number> = {
      ...(existing?.episodeScores || {}),
      ...(s.episodeScores || {}),
    };

    const mergedNotes = (s.userNotes && s.userNotes.trim()) ? s.userNotes.trim() : (existing?.userNotes || "");
    const mergedScore = typeof s.userScore === "number" ? s.userScore : (existing?.userScore !== undefined ? existing.userScore : undefined);

    const updatedEntry: StoredReviewEntry = {
      showId: s.id || existing?.showId || "",
      showTitle: s.title || existing?.showTitle || "",
      episodeReviews: mergedEpReviews,
      episodeScores: mergedEpScores,
      episodeTags: { ...(existing?.episodeTags || {}), ...(s.episodeTags || {}) },
      userNotes: mergedNotes,
      userScore: mergedScore,
      reviewUpdatedAt: s.reviewUpdatedAt || existing?.reviewUpdatedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    ledger[primaryKey] = updatedEntry;
    if (titleKey && titleKey !== primaryKey) {
      ledger[titleKey] = updatedEntry;
    }
    modified = true;
  }

  if (modified) {
    saveReviewsLedger(ledger);
  }
}

/**
 * Merges authoritative reviews from the ledger onto an array of shows.
 * Guarantees that any past reviews/scores are never lost even if a show is restored
 * from an old backup snapshot.
 */
export function applyReviewsLedgerToShows(shows: TvShow[]): TvShow[] {
  if (!Array.isArray(shows)) return shows;
  const ledger = loadReviewsLedger();
  const ledgerKeys = Object.keys(ledger);
  if (ledgerKeys.length === 0) return shows;

  return shows.map((show) => {
    if (!show) return show;

    const idKey = show.id ? show.id.trim() : "";
    const titleKey = show.title ? normalizeLedgerKey(show.title) : "";

    const ledgerEntry = (idKey && ledger[idKey]) || (titleKey && ledger[titleKey]) || null;
    if (!ledgerEntry) return show;

    // Non-destructively merge: preserve incoming if present, otherwise restore from ledger
    const mergedReviews: Record<string, string> = {
      ...(ledgerEntry.episodeReviews || {}),
      ...(show.episodeReviews || {}),
    };

    const mergedScores: Record<string, number> = {
      ...(ledgerEntry.episodeScores || {}),
      ...(show.episodeScores || {}),
    };

    const resolvedNotes = (show.userNotes && show.userNotes.trim())
      ? show.userNotes
      : (ledgerEntry.userNotes || "");

    const resolvedScore = typeof show.userScore === "number"
      ? show.userScore
      : (ledgerEntry.userScore !== undefined ? ledgerEntry.userScore : undefined);

    return {
      ...show,
      episodeReviews: mergedReviews,
      episodeScores: mergedScores,
      userNotes: resolvedNotes,
      userScore: resolvedScore,
      reviewUpdatedAt: show.reviewUpdatedAt || ledgerEntry.reviewUpdatedAt,
    };
  });
}

/**
 * Returns diagnostic statistics about stored user reviews
 */
export function getReviewsLedgerStats(): {
  totalShowsWithReviews: number;
  totalEpisodeReviews: number;
  totalEpisodeScores: number;
  totalSeriesNotes: number;
  lastUpdated: string | null;
} {
  const ledger = loadReviewsLedger();
  let totalEpisodeReviews = 0;
  let totalEpisodeScores = 0;
  let totalSeriesNotes = 0;
  let latestUpdate: number = 0;

  const uniqueShows = new Set<string>();

  for (const [key, entry] of Object.entries(ledger)) {
    if (!entry) continue;
    const showIdentifier = entry.showId || entry.showTitle || key;
    if (uniqueShows.has(showIdentifier)) continue;
    uniqueShows.add(showIdentifier);

    if (entry.episodeReviews) {
      totalEpisodeReviews += Object.keys(entry.episodeReviews).length;
    }
    if (entry.episodeScores) {
      totalEpisodeScores += Object.keys(entry.episodeScores).length;
    }
    if (entry.userNotes && entry.userNotes.trim()) {
      totalSeriesNotes += 1;
    }
    if (entry.updatedAt) {
      const time = new Date(entry.updatedAt).getTime();
      if (time > latestUpdate) latestUpdate = time;
    }
  }

  return {
    totalShowsWithReviews: uniqueShows.size,
    totalEpisodeReviews,
    totalEpisodeScores,
    totalSeriesNotes,
    lastUpdated: latestUpdate ? new Date(latestUpdate).toISOString() : null,
  };
}
