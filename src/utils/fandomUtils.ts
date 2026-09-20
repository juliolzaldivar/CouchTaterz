/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Board, TvShow, User, ShowFandom, FandomMember, FandomTake } from '../types';
import { normalizeTitleForComparison, getShowBannerImage } from './showBanners';

const FANDOM_STORAGE_KEY = 'couchtaterz_joined_fandoms';

/**
 * Retrieve list of joined fandom show titles from localStorage
 */
export function getJoinedFandomsFromStorage(): string[] {
  try {
    const raw = localStorage.getItem(FANDOM_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Persist list of joined fandom show titles to localStorage
 */
export function saveJoinedFandomsToStorage(fandomTitles: string[]): void {
  try {
    const unique = Array.from(new Set(fandomTitles.filter(Boolean)));
    localStorage.setItem(FANDOM_STORAGE_KEY, JSON.stringify(unique));
  } catch (err) {
    console.warn('Failed to save joined fandoms to localStorage:', err);
  }
}

/**
 * Toggle fandom membership for a given show title
 */
export function toggleFandomMembership(
  showTitle: string,
  currentJoined: string[]
): { isJoined: boolean; updatedList: string[] } {
  const norm = normalizeTitleForComparison(showTitle);
  const exists = currentJoined.some(t => normalizeTitleForComparison(t) === norm);
  let updatedList: string[];

  if (exists) {
    updatedList = currentJoined.filter(t => normalizeTitleForComparison(t) !== norm);
  } else {
    updatedList = [...currentJoined, showTitle];
  }

  saveJoinedFandomsToStorage(updatedList);
  return { isJoined: !exists, updatedList };
}

/**
 * Compute activity ranking score for a fandom member:
 * - Completed series: 50 pts
 * - Watching actively: 40 pts
 * - Backlog: 15 pts
 * - Each episode review written: 10 pts
 * - Has rated the show: 15 pts
 * - Episodes watched count: 1 pt per episode
 */
function calculateMemberActivityScore(show: TvShow): number {
  let score = 0;
  if (show.status === 'Completed') score += 50;
  else if (show.status === 'Watching') score += 40;
  else if (show.status === 'Backlog') score += 15;

  if (show.userScore && show.userScore > 0) score += 15;
  if (show.userNotes && show.userNotes.trim().length > 10) score += 10;

  if (show.episodeReviews) {
    const reviewCount = Object.keys(show.episodeReviews).length;
    score += reviewCount * 10;
  }

  if (show.latestWatched) {
    const eps = (show.latestWatched.season || 1) * 8 + (show.latestWatched.episode || 1);
    score += Math.min(eps, 30);
  }

  return score;
}

/**
 * Aggregates all boards into rich ShowFandom records
 */
export function computeShowFandoms(
  familyBoards: Record<string, Board>,
  currentBoard?: Board | null,
  currentUser?: User | null,
  joinedTitles: string[] = []
): ShowFandom[] {
  const fandomMap = new Map<string, {
    canonicalTitle: string;
    representativeShow: TvShow;
    shows: Array<{ show: TvShow; board: Board; owner: User }>;
  }>();

  // Combine family boards plus current board
  const allBoardEntries: Board[] = Object.values(familyBoards || {});
  if (currentBoard && !allBoardEntries.some(b => b.id === currentBoard.id)) {
    allBoardEntries.push(currentBoard);
  }

  const joinedNorms = new Set(joinedTitles.map(normalizeTitleForComparison));

  // Group shows by normalized title
  allBoardEntries.forEach(board => {
    if (!board || !Array.isArray(board.shows)) return;
    
    const isCurrentBoardUser = Boolean(
      board.id === currentBoard?.id ||
      board.id === 'default' ||
      (currentUser && (board.owner?.id === currentUser.id || board.id === currentUser.id))
    );

    // Determine the user/owner for this board
    const owner: User = (isCurrentBoardUser && currentUser) ? {
      ...currentUser,
      id: currentUser.id || 'default',
      name: currentUser.name || board.name || 'Julio',
      avatarUrl: currentUser.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${currentUser.name || 'Julio'}`,
      createdAt: currentUser.createdAt || board.updatedAt || new Date().toISOString()
    } : (board.owner || {
      id: board.id,
      name: board.name || (board.id === 'default' ? 'Julio' : 'Member'),
      email: `${board.id}@couchtater.com`,
      avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${board.name || board.id}`,
      createdAt: board.updatedAt || new Date().toISOString()
    });

    board.shows.forEach(show => {
      if (!show || !show.title) return;
      const norm = normalizeTitleForComparison(show.title);
      if (!norm) return;

      if (!fandomMap.has(norm)) {
        fandomMap.set(norm, {
          canonicalTitle: show.title.trim(),
          representativeShow: show,
          shows: []
        });
      }

      const entry = fandomMap.get(norm)!;
      // Prefer representative show with banner image if available
      if (!entry.representativeShow.bannerImage && show.bannerImage) {
        entry.representativeShow = show;
      }

      // If this board belongs to current user, only add them as an active superfan member in the network/rankings if they actually joined
      const isUserFandomJoined = joinedNorms.has(norm) || Boolean(show.isFandomActive);
      if (!isCurrentBoardUser || isUserFandomJoined) {
        if (!entry.shows.some(s => s.owner.id === owner.id)) {
          entry.shows.push({ show, board, owner });
        }
      }
    });
  });

  // Build ShowFandom objects
  const fandoms: ShowFandom[] = [];

  fandomMap.forEach((entry, normKey) => {
    const { canonicalTitle, representativeShow, shows } = entry;

    // Pick best banner image and streaming service
    const bestShow = shows.find(s => s.show.bannerImage)?.show || representativeShow;
    const bannerImage = getShowBannerImage(bestShow);
    const streamingService = bestShow.streamingService;

    // Build members
    const members: FandomMember[] = shows.map(({ show, owner, board }) => {
      const episodeReviews = show.episodeReviews || {};
      const reviewKeys = Object.keys(episodeReviews);
      const recentTake = reviewKeys.length > 0 
        ? episodeReviews[reviewKeys[reviewKeys.length - 1]] 
        : (show.userNotes || undefined);

      return {
        userId: owner.id,
        userName: owner.name || board.name || 'CouchTater Fan',
        userAvatarUrl: owner.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${owner.name || owner.id}`,
        status: show.status,
        latestWatched: show.latestWatched,
        userScore: show.userScore || null,
        userNotes: show.userNotes,
        episodeReviewsCount: reviewKeys.length,
        recentTake,
        isOnline: Boolean(owner.isOnline),
        activityScore: calculateMemberActivityScore(show),
        totalShowsTracked: Array.isArray(board.shows) ? board.shows.length : 0
      };
    });

    // Sort members by activity score descending (Top Superfans)
    members.sort((a, b) => b.activityScore - a.activityScore);
    const topTenMembers = members.slice(0, 10);

    // Extract recent takes
    const recentTakes: FandomTake[] = [];
    shows.forEach(({ show, owner }) => {
      if (show.episodeReviews) {
        Object.entries(show.episodeReviews).forEach(([epKey, reviewText]) => {
          if (reviewText && reviewText.trim()) {
            recentTakes.push({
              userId: owner.id,
              userName: owner.name,
              userAvatarUrl: owner.avatarUrl,
              episodeKey: epKey,
              reviewText: reviewText.trim(),
              score: show.episodeScores?.[epKey] || show.userScore || undefined,
              createdAt: show.reviewUpdatedAt || show.updatedAt
            });
          }
        });
      } else if (show.userNotes && show.userNotes.trim().length > 15) {
        recentTakes.push({
          userId: owner.id,
          userName: owner.name,
          userAvatarUrl: owner.avatarUrl,
          reviewText: show.userNotes.trim(),
          score: show.userScore || undefined,
          createdAt: show.updatedAt
        });
      }
    });

    // Compute average rating
    const scores = shows.map(s => s.show.userScore).filter((s): s is number => typeof s === 'number' && s > 0);
    const avgRating = scores.length > 0 
      ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1))
      : (representativeShow.userScore && representativeShow.userScore > 0 ? representativeShow.userScore : null);

    // Check if user has joined this fandom
    const isUserJoined = joinedNorms.has(normKey) || (
      currentBoard?.shows?.some(s => 
        normalizeTitleForComparison(s.title) === normKey && s.isFandomActive
      ) || false
    );

    fandoms.push({
      showTitle: canonicalTitle,
      normalizedTitle: normKey,
      streamingService,
      bannerImage,
      memberCount: members.length,
      members,
      topTenMembers,
      avgRating,
      totalReviewsCount: recentTakes.length,
      recentTakes: recentTakes.slice(0, 15),
      isUserJoined
    });
  });

  // Sort fandoms: Joined first, then by member count descending
  return fandoms.sort((a, b) => {
    if (a.isUserJoined && !b.isUserJoined) return -1;
    if (!a.isUserJoined && b.isUserJoined) return 1;
    return b.memberCount - a.memberCount;
  });
}

/**
 * Creates a fallback ShowFandom object for any single show on demand
 */
export function createSingleShowFandom(
  show: TvShow,
  currentUser?: User | null,
  board?: Board | null,
  joinedTitles: string[] = []
): ShowFandom {
  const norm = normalizeTitleForComparison(show.title);
  const isJoined = joinedTitles.some(t => normalizeTitleForComparison(t) === norm) || Boolean(show.isFandomActive);
  const member: FandomMember | null = isJoined && currentUser ? {
    userId: currentUser.id || 'default',
    userName: currentUser.name || 'Julio',
    userAvatarUrl: currentUser.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${currentUser.name || 'Julio'}`,
    status: show.status,
    latestWatched: show.latestWatched,
    userScore: show.userScore || null,
    userNotes: show.userNotes,
    episodeReviewsCount: Object.keys(show.episodeReviews || {}).length,
    isOnline: true,
    activityScore: calculateMemberActivityScore(show),
    totalShowsTracked: Array.isArray(board?.shows) ? board.shows.length : 1
  } : null;

  return {
    showTitle: show.title,
    normalizedTitle: norm,
    streamingService: show.streamingService,
    bannerImage: getShowBannerImage(show),
    memberCount: member ? 1 : 0,
    members: member ? [member] : [],
    topTenMembers: member ? [member] : [],
    avgRating: show.userScore || null,
    totalReviewsCount: Object.keys(show.episodeReviews || {}).length,
    recentTakes: [],
    isUserJoined: isJoined
  };
}

/**
 * Finds the fandom for a given show
 */
export function getFandomForShow(
  showTitle: string,
  fandoms: ShowFandom[]
): ShowFandom | undefined {
  if (!showTitle || !Array.isArray(fandoms)) return undefined;
  const norm = normalizeTitleForComparison(showTitle);
  return fandoms.find(f => f.normalizedTitle === norm);
}
