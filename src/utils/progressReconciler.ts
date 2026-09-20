/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TvShow, WatchedEpisode, NextEpisode } from '../types';
import {
  mergeEpisodeReviewsPreservingUserData,
  mergeUserNotesPreservingUserData,
  mergeUserScorePreservingUserData,
  mergeEpisodeScoresPreservingUserData,
  getStrictReviewTimestamp,
  mergeShowPreservingUserData,
  isGenericOrPlaceholderReview,
  isGenericOrPlaceholderNotes,
} from './reviewPreservationGuards';

export {
  mergeEpisodeReviewsPreservingUserData,
  mergeUserNotesPreservingUserData,
  mergeUserScorePreservingUserData,
  mergeEpisodeScoresPreservingUserData,
  getStrictReviewTimestamp,
  mergeShowPreservingUserData,
  isGenericOrPlaceholderReview,
  isGenericOrPlaceholderNotes,
};

/**
 * Calculates a monotonic linear progress score for comparison.
 * Season * 10000 + Episode gives a reliable numeric ordering:
 * S18E1 (180001) > S17E7 (170007) > S1E1 (10001) > S1E0 (10000) > Not Started (0).
 */
export function calculateProgressScore(watched?: WatchedEpisode | null): number {
  if (!watched) return 0;
  const s = typeof watched.season === 'number' ? Math.max(0, watched.season) : 0;
  const e = typeof watched.episode === 'number' ? Math.max(0, watched.episode) : 0;
  return s * 10000 + e;
}

/**
 * Determines whether a title is generic or placeholder (e.g. 'TBA', 'Not Started', 'Episode 5')
 */
export function isPlaceholderOrGenericTitle(title?: string | null): boolean {
  if (!title) return true;
  const t = title.trim().toUpperCase();
  if (t === 'NOT STARTED' || t === 'TBA' || t === 'TBD' || t === 'TBC' || t === 'TO BE ANNOUNCED' || t === 'UNTITLED' || t === 'UNANNOUNCED') {
    return true;
  }
  if (/^EPISODE\s+\d+$/i.test(title.trim())) {
    return true;
  }
  return false;
}

/**
 * Robustly resolves the authoritative latestWatched progress between two versions of a show.
 * Guarantees that:
 * 1. Progress NEVER regresses to a lower season/episode unless there is an explicit, newer progressUpdatedAt timestamp.
 * 2. Intentional rewinds (e.g. user chooses to rewatch Season 1) are preserved if their progressUpdatedAt is strictly newer.
 * 3. Seed files, stale client caches, and background syncs cannot silently wipe forward progress.
 * 4. Rich, descriptive episode titles are preserved over placeholders or generic numbers.
 */
export function resolveWatchedProgress(
  showA: any, // incoming / mutation / primary candidate
  showB: any  // baseline / existing / secondary
): {
  latestWatched: WatchedEpisode;
  progressUpdatedAt?: string;
  source: 'A' | 'B';
} {
  const wA: WatchedEpisode | undefined = showA?.latestWatched;
  const wB: WatchedEpisode | undefined = showB?.latestWatched;

  if (!wA && !wB) {
    return {
      latestWatched: { season: 1, episode: 0, title: 'Not Started' },
      source: 'A'
    };
  }
  if (!wA) {
    return {
      latestWatched: { ...wB! },
      progressUpdatedAt: showB?.progressUpdatedAt || wB?.progressUpdatedAt || showB?.updatedAt,
      source: 'B'
    };
  }
  if (!wB) {
    return {
      latestWatched: { ...wA! },
      progressUpdatedAt: showA?.progressUpdatedAt || wA?.progressUpdatedAt || showA?.updatedAt,
      source: 'A'
    };
  }

  // Check explicit progress update timestamps (highest priority for user intent)
  const pTimeA = new Date(showA?.progressUpdatedAt || wA?.progressUpdatedAt || 0).getTime();
  const pTimeB = new Date(showB?.progressUpdatedAt || wB?.progressUpdatedAt || 0).getTime();

  const scoreA = calculateProgressScore(wA);
  const scoreB = calculateProgressScore(wB);

  // If BOTH sides have explicit progress timestamps and one is strictly newer:
  // Newer explicit user interaction always wins (allows rewinding to S1 if desired)
  if (pTimeA > 0 && pTimeB > 0 && pTimeA !== pTimeB) {
    if (pTimeA > pTimeB) {
      return {
        latestWatched: { ...wA, progressUpdatedAt: showA.progressUpdatedAt || wA.progressUpdatedAt },
        progressUpdatedAt: showA.progressUpdatedAt || wA.progressUpdatedAt,
        source: 'A'
      };
    } else {
      return {
        latestWatched: { ...wB, progressUpdatedAt: showB.progressUpdatedAt || wB.progressUpdatedAt },
        progressUpdatedAt: showB.progressUpdatedAt || wB.progressUpdatedAt,
        source: 'B'
      };
    }
  }

  // If only ONE side has an explicit progress timestamp:
  if (pTimeA > 0 && pTimeB === 0) {
    // If A's score is >= B, or A's progress timestamp is newer than B's general updatedAt, A wins
    const bUpdated = new Date(showB?.updatedAt || 0).getTime();
    if (scoreA >= scoreB || pTimeA > bUpdated) {
      return {
        latestWatched: { ...wA, progressUpdatedAt: showA.progressUpdatedAt || wA.progressUpdatedAt },
        progressUpdatedAt: showA.progressUpdatedAt || wA.progressUpdatedAt,
        source: 'A'
      };
    }
  } else if (pTimeB > 0 && pTimeA === 0) {
    const aUpdated = new Date(showA?.updatedAt || 0).getTime();
    if (scoreB >= scoreA || pTimeB > aUpdated) {
      return {
        latestWatched: { ...wB, progressUpdatedAt: showB.progressUpdatedAt || wB.progressUpdatedAt },
        progressUpdatedAt: showB.progressUpdatedAt || wB.progressUpdatedAt,
        source: 'B'
      };
    }
  }

  // Compare general show update timestamps
  const showTimeA = new Date(showA?.updatedAt || 0).getTime();
  const showTimeB = new Date(showB?.updatedAt || 0).getTime();

  // If one side has STRICTLY HIGHER progress (higher season or same season with higher episode):
  // We NEVER let a lower progress regress a higher progress unless the lower side has a strictly newer explicit progress timestamp
  if (scoreA > scoreB) {
    // If showB has lower progress, it can ONLY win if showB has an explicit progress timestamp strictly newer than showA
    if (pTimeB > 0 && pTimeB > showTimeA) {
      return {
        latestWatched: { ...wB, progressUpdatedAt: showB.progressUpdatedAt || wB.progressUpdatedAt },
        progressUpdatedAt: showB.progressUpdatedAt || wB.progressUpdatedAt,
        source: 'B'
      };
    }
    // Otherwise higher progress in A wins
    const pTime = showA?.progressUpdatedAt || wA?.progressUpdatedAt || (showTimeA > 0 ? showA.updatedAt : undefined);
    return {
      latestWatched: { ...wA, ...(pTime ? { progressUpdatedAt: pTime } : {}) },
      progressUpdatedAt: pTime,
      source: 'A'
    };
  } else if (scoreB > scoreA) {
    if (pTimeA > 0 && pTimeA > showTimeB) {
      return {
        latestWatched: { ...wA, progressUpdatedAt: showA.progressUpdatedAt || wA.progressUpdatedAt },
        progressUpdatedAt: showA.progressUpdatedAt || wA.progressUpdatedAt,
        source: 'A'
      };
    }
    const pTime = showB?.progressUpdatedAt || wB?.progressUpdatedAt || (showTimeB > 0 ? showB.updatedAt : undefined);
    return {
      latestWatched: { ...wB, ...(pTime ? { progressUpdatedAt: pTime } : {}) },
      progressUpdatedAt: pTime,
      source: 'B'
    };
  }

  // Scores are equal: resolve best title and latest timestamp
  const hasAOfficial = wA.title && !isPlaceholderOrGenericTitle(wA.title);
  const hasBOfficial = wB.title && !isPlaceholderOrGenericTitle(wB.title);

  let bestTitle = wA.title || wB.title || `Episode ${wA.episode || 1}`;
  if (hasBOfficial && !hasAOfficial) {
    bestTitle = wB.title;
  } else if (hasAOfficial) {
    bestTitle = wA.title;
  }

  const latestTime = Math.max(showTimeA, showTimeB, pTimeA, pTimeB);
  const latestIso = latestTime > 0 ? new Date(latestTime).toISOString() : undefined;

  return {
    latestWatched: {
      season: wA.season,
      episode: wA.episode,
      title: bestTitle,
      ...(latestIso ? { progressUpdatedAt: latestIso } : {})
    },
    progressUpdatedAt: latestIso,
    source: showTimeA >= showTimeB ? 'A' : 'B'
  };
}

/**
 * Normalizes title for consistent matching across keys
 */
export function normalizeTitleKey(titleOrId?: string): string {
  if (!titleOrId) return '';
  return titleOrId
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(the|a|an)\b/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Reconciles two show objects (client-side or server-side).
 * Merges progress, reviews, scores, notes, and metadata losslessly
 * with absolute protection of user-authored reviews and notes.
 */
export function reconcileTwoShows(showA: TvShow, showB: TvShow): TvShow {
  return mergeShowPreservingUserData(showA, showB);
}

/**
 * Losslessly reconciles incoming shows with baseline shows.
 * Guarantees no show or progress is ever lost.
 */
export function reconcileShowLists(primaryShows: TvShow[], secondaryShows: TvShow[]): TvShow[] {
  const result: TvShow[] = [];
  const map = new Map<string, TvShow>();

  // Helper to index shows by ID and normalized title
  const getKeys = (s: TvShow) => {
    const keys: string[] = [];
    if (s.id && s.id.trim()) keys.push(s.id.trim());
    if (s.title && s.title.trim()) keys.push(normalizeTitleKey(s.title));
    return keys;
  };

  // Seed with secondary shows
  for (const s of secondaryShows) {
    if (!s) continue;
    const keys = getKeys(s);
    for (const k of keys) {
      if (!map.has(k)) {
        map.set(k, s);
      }
    }
  }

  // Merge with primary shows
  const processedKeys = new Set<string>();
  for (const s of primaryShows) {
    if (!s) continue;
    const keys = getKeys(s);
    let matchedSecondary: TvShow | null = null;
    for (const k of keys) {
      if (map.has(k)) {
        matchedSecondary = map.get(k)!;
        break;
      }
    }

    if (matchedSecondary) {
      const merged = reconcileTwoShows(s, matchedSecondary);
      result.push(merged);
    } else {
      result.push(s);
    }

    for (const k of keys) {
      processedKeys.add(k);
    }
  }

  // Retain any secondary shows that were not in primary
  for (const s of secondaryShows) {
    if (!s) continue;
    const keys = getKeys(s);
    const alreadyProcessed = keys.some(k => processedKeys.has(k));
    if (!alreadyProcessed) {
      result.push(s);
      for (const k of keys) {
        processedKeys.add(k);
      }
    }
  }

  return result;
}
