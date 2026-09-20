/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TvShow, WatchedEpisode } from '../types';
import { resolveWatchedProgress } from './progressReconciler';

/**
 * Normalizes text for comparison across whitespace, quote styles, and punctuation.
 */
export function normalizeGuardText(text?: string | null): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[“”"']/g, '')
    .replace(/[—–-]/g, ' ')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Known synthetic or generic placeholder review strings that must NEVER
 * overwrite authentic user-authored reviews.
 */
export const KNOWN_PLACEHOLDER_REVIEWS: string[] = [
  "Sharp, punchy opening. Frances Neagley steps into the spotlight with gripping detective instincts and immediate stakes.",
  "Terrific spinoff featuring Frances Neagley. Maria Sten brings great intensity and razor-sharp detective work.",
  "No review thoughts added yet.",
  "No review thoughts added yet. Hit edit to log a review!",
  "No review added yet.",
  "TBA",
  "TBD",
  "To be announced",
  "Not started",
  "Placeholder review",
  "Default review",
  "Added from Julio's picks",
  "Terrific spinoff featuring Frances Neagley"
];

const NORMALIZED_PLACEHOLDER_REVIEWS = new Set<string>(
  KNOWN_PLACEHOLDER_REVIEWS.map(r => normalizeGuardText(r))
);

/**
 * Checks whether a given review text is empty, generic, or a known placeholder.
 */
export function isGenericOrPlaceholderReview(text?: string | null): boolean {
  if (!text || typeof text !== 'string') return true;
  const trimmed = text.trim();
  if (trimmed.length === 0) return true;
  const norm = normalizeGuardText(trimmed);
  if (norm.length <= 2) return true;
  if (NORMALIZED_PLACEHOLDER_REVIEWS.has(norm)) return true;
  for (const placeholder of NORMALIZED_PLACEHOLDER_REVIEWS) {
    if (placeholder && placeholder.length > 15 && (norm === placeholder || norm.includes(placeholder) || placeholder.includes(norm))) {
      return true;
    }
  }
  return false;
}

/**
 * Checks whether user notes are empty, generic, or a known catalog template placeholder.
 */
export function isGenericOrPlaceholderNotes(notes?: string | null): boolean {
  if (!notes || typeof notes !== 'string') return true;
  const trimmed = notes.trim();
  if (trimmed.length === 0) return true;
  const norm = normalizeGuardText(trimmed);
  if (norm.length <= 2) return true;
  if (NORMALIZED_PLACEHOLDER_REVIEWS.has(norm)) return true;
  for (const placeholder of NORMALIZED_PLACEHOLDER_REVIEWS) {
    if (placeholder && placeholder.length > 15 && (norm === placeholder || norm.includes(placeholder) || placeholder.includes(norm))) {
      return true;
    }
  }
  return false;
}

/**
 * Extracts a strict review modification timestamp.
 *
 * CRITICAL ARCHITECTURAL SAFEGUARD:
 * This MUST NEVER fall back to `updatedAt` or `createdAt`!
 * Routine operations like status toggles, watch progress updates, background
 * metadata enrichments, or newly created show objects must never be mistaken
 * for an intentional edit to user reviews or notes.
 */
export function getStrictReviewTimestamp(show?: any): number {
  if (!show || typeof show !== 'object') return 0;
  if (show.reviewUpdatedAt) {
    const t = new Date(show.reviewUpdatedAt).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  return 0;
}

/**
 * Deeply merges episode reviews with strict preservation of user-authored content.
 *
 * Rules:
 * 1. Existing authentic reviews are NEVER overwritten by blank, whitespace, or generic placeholder texts.
 * 2. If both incoming and existing have reviews for the same episode:
 *    - If incoming is generic/placeholder, existing is strictly preserved.
 *    - If existing is generic/placeholder but incoming is authentic, incoming is adopted.
 *    - If both are authentic: only overwrite existing if incoming has a strictly newer
 *      explicit reviewUpdatedAt timestamp. Otherwise, existing review is preserved.
 * 3. Union of all episode reviews is preserved so that reviews on different episodes are never dropped.
 */
export function mergeEpisodeReviewsPreservingUserData(
  incomingReviews?: Record<string, string> | null,
  existingReviews?: Record<string, string> | null,
  timeIncoming: number = 0,
  timeExisting: number = 0
): Record<string, string> {
  const merged: Record<string, string> = {};

  // 1. Seed with existing reviews (sanitizing out obvious placeholders if better text exists)
  if (existingReviews && typeof existingReviews === 'object') {
    for (const [epKey, text] of Object.entries(existingReviews)) {
      if (typeof text === 'string' && text.trim().length > 0) {
        merged[epKey] = text.trim();
      }
    }
  }

  // 2. Safely merge incoming reviews
  if (incomingReviews && typeof incomingReviews === 'object') {
    for (const [epKey, text] of Object.entries(incomingReviews)) {
      if (typeof text !== 'string') continue;
      const cleanIncoming = text.trim();
      if (!cleanIncoming) continue; // Blank string cannot overwrite existing review!

      const existingText = merged[epKey];

      if (!existingText) {
        // No existing review: accept if not a placeholder
        if (!isGenericOrPlaceholderReview(cleanIncoming)) {
          merged[epKey] = cleanIncoming;
        } else {
          // Even if placeholder, accept if no review existed at all (unless totally empty)
          if (cleanIncoming.length > 0) {
            merged[epKey] = cleanIncoming;
          }
        }
      } else {
        // Both have reviews for this episode
        if (cleanIncoming === existingText) {
          continue;
        }

        const incomingIsPlaceholder = isGenericOrPlaceholderReview(cleanIncoming);
        const existingIsPlaceholder = isGenericOrPlaceholderReview(existingText);

        if (incomingIsPlaceholder && !existingIsPlaceholder) {
          // Incoming is a generic placeholder (like Neagley S1E1 generic synopsis) - PRESERVE EXISTING!
          continue;
        }

        if (existingIsPlaceholder && !incomingIsPlaceholder) {
          // Existing was a placeholder and incoming is authentic - ADOPT INCOMING!
          merged[epKey] = cleanIncoming;
          continue;
        }

        // Both are authentic or both are non-placeholder: compare strict review timestamp
        if (timeIncoming > timeExisting) {
          merged[epKey] = cleanIncoming;
        } else {
          // Keep existing review
        }
      }
    }
  }

  return merged;
}

/**
 * Deeply merges user notes with strict preservation of authentic user writing.
 */
export function mergeUserNotesPreservingUserData(
  incomingNotes?: string | null,
  existingNotes?: string | null,
  timeIncoming: number = 0,
  timeExisting: number = 0
): string {
  const cleanIncoming = typeof incomingNotes === 'string' ? incomingNotes.trim() : '';
  const cleanExisting = typeof existingNotes === 'string' ? existingNotes.trim() : '';

  if (!cleanIncoming && !cleanExisting) return '';
  if (!cleanIncoming && cleanExisting) {
    // Existing has user notes, incoming is blank (e.g. from background sync or fresh catalog re-add)
    // ALWAYS PRESERVE EXISTING USER NOTES!
    return cleanExisting;
  }
  if (cleanIncoming && !cleanExisting) {
    if (isGenericOrPlaceholderNotes(cleanIncoming)) return '';
    return cleanIncoming;
  }

  // Both have notes
  if (cleanIncoming === cleanExisting) return cleanExisting;

  const incomingIsPlaceholder = isGenericOrPlaceholderNotes(cleanIncoming);
  const existingIsPlaceholder = isGenericOrPlaceholderNotes(cleanExisting);

  if (incomingIsPlaceholder && !existingIsPlaceholder) {
    return cleanExisting;
  }
  if (existingIsPlaceholder && !incomingIsPlaceholder) {
    return cleanIncoming;
  }

  if (timeIncoming > timeExisting) {
    return cleanIncoming;
  }
  return cleanExisting;
}

/**
 * Merges user score with strict preservation of existing score against unrated catalog payloads.
 */
export function mergeUserScorePreservingUserData(
  incomingScore?: number | null,
  existingScore?: number | null,
  timeIncoming: number = 0,
  timeExisting: number = 0
): number | null {
  const validIncoming = typeof incomingScore === 'number' && !isNaN(incomingScore);
  const validExisting = typeof existingScore === 'number' && !isNaN(existingScore);

  if (!validIncoming && !validExisting) return null;
  if (!validIncoming && validExisting) {
    // Incoming is null/undefined (typical of catalog metadata or unrated re-adds). Preserve existing!
    return existingScore!;
  }
  if (validIncoming && !validExisting) {
    return incomingScore!;
  }

  // Both are valid numbers: use strict review timestamp
  if (timeIncoming > timeExisting) {
    return incomingScore!;
  }
  return existingScore!;
}

/**
 * Merges episode scores preserving user scores.
 */
export function mergeEpisodeScoresPreservingUserData(
  incomingScores?: Record<string, number> | null,
  existingScores?: Record<string, number> | null,
  timeIncoming: number = 0,
  timeExisting: number = 0
): Record<string, number> {
  const merged: Record<string, number> = { ...(existingScores || {}) };
  if (incomingScores && typeof incomingScores === 'object') {
    for (const [epKey, score] of Object.entries(incomingScores)) {
      if (typeof score !== 'number' || isNaN(score)) continue;
      if (merged[epKey] === undefined || timeIncoming > timeExisting) {
        merged[epKey] = score;
      }
    }
  }
  return merged;
}

/**
 * Master Protected Deep-Merge function for shows.
 *
 * Guarantees that:
 * 1. User-authored reviews (episodeReviews), scores (userScore, episodeScores), and
 *    notes (userNotes) are NEVER overwritten by incoming catalog metadata, default show
 *    templates, background syncs, or unrated imports.
 * 2. Monotonic watch progress (latestWatched) and status are preserved using authoritative
 *    reconciliation rules.
 * 3. Episode lists, seasons, banner images, and streaming metadata are losslessly merged.
 */
export function mergeShowPreservingUserData(
  incomingShow: any, // primary candidate / incoming mutation
  existingShow: any  // baseline / existing stored show
): TvShow {
  if (!incomingShow && !existingShow) return null as any;
  if (!incomingShow) return { ...existingShow };
  if (!existingShow) return { ...incomingShow };

  const timeIncoming = new Date(incomingShow.updatedAt || 0).getTime();
  const timeExisting = new Date(existingShow.updatedAt || 0).getTime();

  const timeStatusIncoming = new Date(incomingShow.statusUpdatedAt || incomingShow.updatedAt || 0).getTime();
  const timeStatusExisting = new Date(existingShow.statusUpdatedAt || existingShow.updatedAt || 0).getTime();

  // STRICT review timestamps — NEVER fall back to updatedAt or createdAt
  const timeReviewIncoming = getStrictReviewTimestamp(incomingShow);
  const timeReviewExisting = getStrictReviewTimestamp(existingShow);

  // 1. Protected User Content Resolution
  const resolvedNotes = mergeUserNotesPreservingUserData(
    incomingShow.userNotes !== undefined ? incomingShow.userNotes : incomingShow.myReview,
    existingShow.userNotes !== undefined ? existingShow.userNotes : existingShow.myReview,
    timeReviewIncoming,
    timeReviewExisting
  );

  const resolvedScore = mergeUserScorePreservingUserData(
    incomingShow.userScore !== undefined ? incomingShow.userScore : (typeof incomingShow.myRating === 'number' ? incomingShow.myRating : null),
    existingShow.userScore !== undefined ? existingShow.userScore : (typeof existingShow.myRating === 'number' ? existingShow.myRating : null),
    timeReviewIncoming,
    timeReviewExisting
  );

  const mergedEpReviews = mergeEpisodeReviewsPreservingUserData(
    incomingShow.episodeReviews,
    existingShow.episodeReviews,
    timeReviewIncoming,
    timeReviewExisting
  );

  const mergedEpScores = mergeEpisodeScoresPreservingUserData(
    incomingShow.episodeScores,
    existingShow.episodeScores,
    timeReviewIncoming,
    timeReviewExisting
  );

  // 2. Status Resolution
  let resolvedStatus = incomingShow.status || existingShow.status || "Backlog";
  let resolvedStatusUpdated = incomingShow.statusUpdatedAt || existingShow.statusUpdatedAt;
  if (timeStatusIncoming > timeStatusExisting && incomingShow.status) {
    resolvedStatus = incomingShow.status;
    resolvedStatusUpdated = incomingShow.statusUpdatedAt || incomingShow.updatedAt;
  } else if (timeStatusExisting > timeStatusIncoming && existingShow.status) {
    resolvedStatus = existingShow.status;
    resolvedStatusUpdated = existingShow.statusUpdatedAt || existingShow.updatedAt;
  } else if (incomingShow.status && incomingShow.status !== "Backlog" && existingShow.status === "Backlog") {
    resolvedStatus = incomingShow.status;
    resolvedStatusUpdated = incomingShow.statusUpdatedAt || incomingShow.updatedAt;
  } else if (existingShow.status && existingShow.status !== "Backlog" && incomingShow.status === "Backlog") {
    resolvedStatus = existingShow.status;
    resolvedStatusUpdated = existingShow.statusUpdatedAt || existingShow.updatedAt;
  }

  // 3. Watched Progress Resolution
  const { latestWatched: resolvedWatched, progressUpdatedAt: resolvedProgressUpdated } = resolveWatchedProgress(incomingShow, existingShow);

  // 4. Seasons and Episodes
  const maxTotalSeasons = Math.max(
    incomingShow.totalSeasons || 1,
    existingShow.totalSeasons || 1,
    resolvedWatched?.season || 1,
    incomingShow.nextEpisode?.season || 1,
    existingShow.nextEpisode?.season || 1
  );

  let epsPerSeason = (incomingShow.episodesPerSeason && incomingShow.episodesPerSeason.length >= (existingShow.episodesPerSeason?.length || 0))
    ? [...incomingShow.episodesPerSeason]
    : [...(existingShow.episodesPerSeason || incomingShow.episodesPerSeason || [10])];

  while (epsPerSeason.length < maxTotalSeasons) {
    epsPerSeason.push(10);
  }
  if (resolvedWatched && resolvedWatched.season <= epsPerSeason.length) {
    const sIdx = resolvedWatched.season - 1;
    if (resolvedWatched.episode > epsPerSeason[sIdx]) {
      epsPerSeason[sIdx] = resolvedWatched.episode;
    }
  }

  const mergedEpisodes = {
    ...(existingShow.episodes || {}),
    ...(incomingShow.episodes || {})
  };

  const nextEp = (incomingShow.nextEpisode && incomingShow.nextEpisode.airDate)
    ? incomingShow.nextEpisode
    : (existingShow.nextEpisode || incomingShow.nextEpisode || null);

  const newestReviewUpdated = (timeReviewIncoming >= timeReviewExisting && timeReviewIncoming > 0)
    ? (incomingShow.reviewUpdatedAt || existingShow.reviewUpdatedAt)
    : (existingShow.reviewUpdatedAt || incomingShow.reviewUpdatedAt);

  const newestUpdated = timeIncoming >= timeExisting
    ? (incomingShow.updatedAt || existingShow.updatedAt || new Date().toISOString())
    : (existingShow.updatedAt || incomingShow.updatedAt || new Date().toISOString());

  const baseObj = timeIncoming >= timeExisting
    ? { ...existingShow, ...incomingShow }
    : { ...incomingShow, ...existingShow };

  return {
    ...baseObj,
    id: incomingShow.id || existingShow.id,
    title: existingShow.title && !existingShow.title.toLowerCase().includes('untitled') ? existingShow.title : (incomingShow.title || existingShow.title),
    status: resolvedStatus,
    statusUpdatedAt: resolvedStatusUpdated,
    latestWatched: resolvedWatched,
    progressUpdatedAt: resolvedProgressUpdated,
    userNotes: resolvedNotes || undefined,
    userScore: resolvedScore,
    episodeReviews: Object.keys(mergedEpReviews).length > 0 ? mergedEpReviews : undefined,
    episodeScores: Object.keys(mergedEpScores).length > 0 ? mergedEpScores : undefined,
    episodes: mergedEpisodes,
    totalSeasons: maxTotalSeasons,
    episodesPerSeason: epsPerSeason,
    nextEpisode: nextEp,
    reviewUpdatedAt: newestReviewUpdated,
    updatedAt: newestUpdated,
    bannerImage: incomingShow.bannerImage || existingShow.bannerImage || '',
    bannerPosition: incomingShow.bannerPosition || existingShow.bannerPosition || 'center 25%',
    overview: incomingShow.overview || existingShow.overview || '',
    streamingService: incomingShow.streamingService || existingShow.streamingService || 'Other',
    genres: (incomingShow.genres && incomingShow.genres.length > 0) ? incomingShow.genres : (existingShow.genres || []),
    directors: (incomingShow.directors && incomingShow.directors.length > 0) ? incomingShow.directors : (existingShow.directors || []),
    actors: (incomingShow.actors && incomingShow.actors.length > 0) ? incomingShow.actors : (existingShow.actors || []),
  };
}
