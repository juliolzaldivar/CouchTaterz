/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Board, TvShow } from '../types';

/**
 * Authentic takes written by Julio on the default/admin board.
 * When other users add these shows from Buddy Picks, they should have their own
 * blank slate and NEVER inherit these personal reviews.
 */
export const JULIO_AUTHENTIC_TAKES: Record<string, Record<string, string>> = {
  "silo": {
    "S3E9": "Bernard draws focus and exhales under an open sky. The Silos are finished just in time. Collin Hanks plays Chopsticks like his dad."
  },
  "reacher": {
    "S4E1": "Starts out with a bang. Reacher gets pulled into someone else's problems but still manages to fit in a cheesesteak breakfast.",
    "S4E4": "Reacher figures stuff out. Can't say I saw that ending coming, but I really enjoyed the battle poses.",
    "S3E8": "Excellent chase episode! Reacher dogged by cops and his buddies pursued by Indonesian karambit baddies. Reacher finally realizes what's actually goin on.",
    "S4E5": "Reacher tries to blend in. Tamara practices her times tables. Jacob shows off core strength."
  },
  "the walking dead: dead city": {
    "S3E6": "WTF? That start was the biggest shock I've had on TWD in a long time.",
    "S3E5": "Maggie dreams a breathing doctor run up against Glen's memory."
  },
  "lioness": {
    "S3E1": "Great start to the season — Zoe and team face the new realities of drone warfare. Great scene.",
    "S3E2": "“Lots of  splaining to do.” Pressing danger in the present and some needed context from the past.",
    "S3E3": "“Disease kills the bear and they’ve been infecting you for many years.” Things aren't looking great for Joe."
  },
  "rick and morty": {
    "S9E1": "Great episode and kick off to the season. Evil Morty in rare form.",
    "S9E10": "Wow, an impressive season finale. 'He belongs more to me than to you' was some cold ass shit, Morty Prime. Some creepy messed up scenes but great writing."
  },
  "x-men '97": {
    "S2E8": "Rogue, Remy and Apocalypse come to a head. Elf lives his faith. Charles is just kinda there."
  },
  "my adventures with superman": {
    "S3E5": "Hank throws a fit. Clark engages in fisticuffs. John wraps up his visit. The future belongs to everyone?"
  },
  "lanterns": {
    "S1E1": "Hal's kind of a dick, but I loved Waylien taunting him with the Oath during the interrogation scene. John farms aura.",
    "S1E2": "John makes a friend. Hal finally suits up and chats with everyone's favorite pink prisoner. Something is rotten in the state of Denmark.",
    "S1E3": "“Courage is fear that has said its prayers, son.” Hell of a childhood ya got there, John.",
    "S1E4": "Hal and John discuss Disney’s weenie. Truck go boom. Car go crash. I don’t think Hal likes John much."
  }
};

export function isJulioAccount(userOrIdOrEmail?: any): boolean {
  if (!userOrIdOrEmail) return false;
  if (typeof userOrIdOrEmail === 'string') {
    const s = userOrIdOrEmail.toLowerCase().trim();
    return (
      s === 'default' ||
      s === 'user-julio' ||
      s === 'user-google-8850' ||
      s === 'julio' ||
      s === 'juliozaldivar@gmail.com' ||
      s === 'julio@couchtaterz.com' ||
      s === 'julio@taterz.com'
    );
  }
  const id = (userOrIdOrEmail.id || '').toLowerCase().trim();
  const email = (userOrIdOrEmail.email || '').toLowerCase().trim();
  const name = (userOrIdOrEmail.name || '').toLowerCase().trim();
  if (id === 'default' || id === 'user-julio' || id === 'user-google-8850') return true;
  if (email === 'juliozaldivar@gmail.com' || email === 'julio@couchtaterz.com' || email === 'julio@taterz.com') return true;
  if (name === 'julio' && (!id || id === 'default' || id === 'user-julio' || id.startsWith('user-julio-'))) return true;
  return false;
}

/**
 * Sanitize an individual show on a non-owner/friend board to ensure it does NOT carry
 * another user's inherited takes, scores, or stale watch progress.
 */
export function sanitizeShowForNonOwner(show: TvShow, isAuthoritativeOwner: boolean = false): TvShow {
  if (!show || isAuthoritativeOwner) return show;

  const normTitle = (show.title || '').toLowerCase().trim();
  const knownTakesForShow = JULIO_AUTHENTIC_TAKES[normTitle];

  let cleanedEpReviews = show.episodeReviews ? { ...show.episodeReviews } : undefined;
  let cleanedEpScores = show.episodeScores ? { ...show.episodeScores } : undefined;
  let hasChanged = false;

  if (cleanedEpReviews && knownTakesForShow) {
    for (const [epKey, reviewText] of Object.entries(cleanedEpReviews)) {
      const knownText = knownTakesForShow[epKey];
      if (knownText && typeof reviewText === 'string' && reviewText.trim() === knownText.trim()) {
        delete cleanedEpReviews[epKey];
        if (cleanedEpScores && cleanedEpScores[epKey] !== undefined) {
          delete cleanedEpScores[epKey];
        }
        hasChanged = true;
      }
    }
  }

  // Also check if any review in cleanedEpReviews matches ANY known take from any show (generic fallback)
  if (cleanedEpReviews) {
    for (const [epKey, reviewText] of Object.entries(cleanedEpReviews)) {
      if (typeof reviewText === 'string') {
        const trimmed = reviewText.trim();
        for (const showTakes of Object.values(JULIO_AUTHENTIC_TAKES)) {
          for (const takeText of Object.values(showTakes)) {
            if (trimmed === takeText.trim()) {
              delete cleanedEpReviews[epKey];
              if (cleanedEpScores && cleanedEpScores[epKey] !== undefined) {
                delete cleanedEpScores[epKey];
              }
              hasChanged = true;
            }
          }
        }
      }
    }
  }

  if (cleanedEpReviews && Object.keys(cleanedEpReviews).length === 0) {
    cleanedEpReviews = {};
  }
  if (cleanedEpScores && Object.keys(cleanedEpScores).length === 0) {
    cleanedEpScores = {};
  }

  // If latestWatched was inherited from Julio's Silo S3E9 and user never set their own rating or notes
  let cleanedWatched = show.latestWatched;
  if (normTitle === 'silo' && cleanedWatched?.season === 3 && cleanedWatched?.episode === 9) {
    if (!show.userScore && (!show.userNotes || show.userNotes.trim() === 'Deep mystery, deep hole.')) {
      cleanedWatched = { season: 1, episode: 0, title: 'Not Started' };
      hasChanged = true;
    }
  }

  let cleanedNotes = show.userNotes;
  if (normTitle === 'silo' && cleanedNotes?.trim() === 'Deep mystery, deep hole.') {
    cleanedNotes = '';
    hasChanged = true;
  }

  if (!hasChanged) return show;

  return {
    ...show,
    episodeReviews: cleanedEpReviews,
    episodeScores: cleanedEpScores,
    latestWatched: cleanedWatched,
    userNotes: cleanedNotes
  };
}

/**
 * Sanitize an entire board if it does not belong to Julio / Admin.
 * Purges all leaked episode reviews and scores that were accidentally copied from Buddy Picks.
 */
export function sanitizeBoardForUser(board: Board, currentUser?: any): { board: Board; changed: boolean } {
  if (!board || !Array.isArray(board.shows)) return { board, changed: false };
  const isJulio = isJulioAccount(board.id) || isJulioAccount(board.owner) || isJulioAccount(currentUser);
  if (isJulio) return { board, changed: false };

  let changed = false;
  const sanitizedShows = board.shows.map(s => {
    const sanitized = sanitizeShowForNonOwner(s, false);
    if (sanitized !== s) changed = true;
    return sanitized;
  });

  if (!changed) return { board, changed: false };

  return {
    board: {
      ...board,
      shows: sanitizedShows
    },
    changed: true
  };
}

/**
 * Clones a friend's show for adding to the current user's personal board.
 * Strips all friend-specific progress, private takes, episode ratings, notes, and owner metadata.
 */
export function createCleanShowFromFriend(friendShow: TvShow, initialStatus: TvShow['status'] = 'Backlog'): TvShow {
  const cleanShow: TvShow = {
    ...friendShow,
    id: `show-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
    status: initialStatus,
    latestWatched: { season: 1, episode: 0, title: 'Not Started' },
    userScore: null,
    userNotes: '',
    episodeReviews: {},
    episodeScores: {},
    reviewUpdatedAt: undefined,
    statusUpdatedAt: undefined,
    createdAt: new Date().toISOString()
  };

  // Ensure buddy-pick metadata is never stamped onto user's personal show
  delete (cleanShow as any).ownerName;
  delete (cleanShow as any).ownerNames;
  delete (cleanShow as any).familyDetails;

  return cleanShow;
}
