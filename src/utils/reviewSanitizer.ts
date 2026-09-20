/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Board, TvShow } from '../types';

/**
 * Normalizes text for fuzzy matching of reviews and notes across quote styles,
 * dashes, whitespace, and punctuation differences.
 */
export function normalizeReviewText(text?: string): string {
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
 * Authentic takes written by Julio on the default/admin board.
 * When other users add these shows or view Buddy Picks, buddy boards should NEVER
 * inherit these personal reviews.
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
    "S2E8": "Rogue, Remy and Apocalypse come to a head. Elf lives his faith. Charles is just kinda there.",
    "S2E9": "Remy, Rogue and Apocalypse come to a head. Charles doesn't seem to do much about it. Stick around for the final scene at the end."
  },
  "supernatural": {
    "S1E1": "Dad's on a hunting trip and hasn't been home in a few days. Solid start to an amazing series. And we're off (again)!"
  },
  "my adventures with superman": {
    "S3E5": "Hank throws a fit. Clark engages in fisticuffs. John wraps up his visit. The future belongs to everyone?"
  },
  "lanterns": {
    "S1E1": "Hal's kind of a dick, but I loved Waylien taunting him with the Oath during the interrogation scene. John farms aura.",
    "S1E2": "John makes a friend. Hal finally suits up and chats with everyone's favorite pink prisoner. Something is rotten in the state of Denmark.",
    "S1E3": "“Courage is fear that has said its prayers, son.” Hell of a childhood ya got there, John.",
    "S1E4": "Hal and John discuss Disney’s weenie. Truck go boom. Car go crash. Things come into focus.  I don’t think Hal likes John much."
  }
};

/**
 * Normalized set of all authentic episode review texts written by Julio.
 */
const ALL_NORMALIZED_JULIO_TAKES = new Set<string>();
for (const showTakes of Object.values(JULIO_AUTHENTIC_TAKES)) {
  for (const takeText of Object.values(showTakes)) {
    ALL_NORMALIZED_JULIO_TAKES.add(normalizeReviewText(takeText));
  }
}
// Add slight wording variant for Lanterns S1E4
ALL_NORMALIZED_JULIO_TAKES.add(normalizeReviewText("Hal and John discuss Disney’s weenie. Truck go boom. Car go crash. I don’t think Hal likes John much."));

/**
 * Known authentic user notes / series reviews authored by Julio that were leaked to buddy boards.
 */
export const JULIO_AUTHENTIC_NOTES: string[] = [
  "Deep mystery, deep hole.",
  "To me, my X-Men! If you like Marvel, you need to be watching this.",
  "Not your daddy's Green Lantern, but lots to like. Leaning into the space cop and less superhero. Some stellar performances and loads of easter eggs for fanboys.",
  "Consistently awesome action and badassery. AR carries the show, that talented wall of meat. Can't wait for S4.",
  "Rebecca Ferguson is magnificent. Can't wait for season 3!",
  "Ahh geez... still solid, even after the cast change.",
  "Negan, you old bastard, why can’t I quit you? Probably cause I like seeing John and Bella on tv. Extra tater points to whoever gets the reference.",
  "Superb cast and writing. Zoe isn't blue or green but leads the CIA's war on terror. S3 kicks off super strong: modern day drone warfare changes the game.",
  "This series is hilarious. Even if you're not into animation, Penny & the vo cast does such a phenomenal job its always worth a laugh.",
  "This is art in motion. If you love animation, samurais, or martial arts revenge stories, give this a shot before season 2. One of my favorite series on Netflix.",
  "Nic Cage, Spider-Man... Noir?! They wrote this for me. Beautifully unhinged performance. Oh and I loved it in both black and white and color.",
  "Thomas Shelby is a force. Peaky Blinders is peak tv.",
  "Was amazing and then lost its mojo. Hope they get it back this season.",
  "One of the greatest television dramas ever written. Outstanding finale and unforgettable dialogue.",
  "Hilarious, gory, and wonderfully authentic to the game lore. Walton Goggins as the Ghoul is iconic.",
  "The tension in every kitchen scene is so real!",
  "Dragons and political intrigue at their finest.",
  "Masterpiece cinematography, dialogue, and performances.",
  "The office environment is so eerie. That season finale cliffhanger was one of the best in TV history!",
  "Need to rewatch before the final season drops. S4 was epic, especially the Max/Vecna storyline.",
  "Incredible adaptation of the game! Pedro Pascal and Bella Ramsey are stellar. Season 2 was a masterpiece, now waiting for Season 3.",
  "Obsessed with this show! One of the best on TV right now.",
  "Ella Purnell and Walton Goggins are phenomenal.",
  "A triumph of animation art, soundtrack, and tragic sibling storytelling. Absolute masterpiece.",
  "Grogu is the cutest character ever. Season 3 ended the main arc nicely, heard there's a movie coming next.",
  "Mando takes off his helmet and adopts another special orphan. This is the way.",
  "Intense, stressful, but absolute culinary cinema. The kitchen chemistry is unmatched. Every second is packed with tension.",
  "Dragon battles in Season 2 were mindblowing. The Dance of the Dragons is getting fierce.",
  "Cinematography, costumes, and political intrigue are staggering. Must binge next!",
  "One of the best modern sitcoms. Quinta Brunson and the cast have phenomenal comic timing.",
  "Heartwarming, wholesome, and delightfully funny all the way through all 3 seasons.",
  "A masterclass in character transformation and tension from start to finish.",
  "Sharp social satire, gorgeous resort settings, and Jennifer Coolidge at her absolute peak.",
  "Samurai Jacks’s darker, angrier and bloodier cousin.",
  "Some pretty timely and relevant questions in episode 1. Ai will challenge our relationships with work and meaning.",
  "Interesting but all too common tale of Western colonialism clashing upon native (Hawaiian) life. Amazing attention to detail. Thankfully, Aquabro discovers pants about the third episode in.",
  "Amazing acting, super creepy performance. Highly recommend. AD won’t let me do his voice anymore but it’s so fun.",
  "Fun if your a fan of anime or the game - not all heroes with a whip are named Indiana.",
  "Best of the spinoffs. Daryl tries to get home from France while saving a teenage French Jesus. Amazing locales and wine.",
  "This show dies and comes back so often you'd think it was a Winchester. Super smart and ridiculously stupid funny at the same time. I'd rank above The Simpsons...",
  "Ready for Season 2!",
  "Childhood feels.",
  "Some folks just can't get a good break. Worst luck, but best show out of the Dutton bunch. Sam Elliot's mustache FTW.",
  "S1 had aliens probing Cartman. S28 has Trump probing Vance. Full circle.",
  "What if George Costanza had his own show? Watch and find out.",
  "The best non anime anime there is. If you’re not sold by the end of the shows intro, we’re watching different shows.",
  "Added from Julio's picks",
  "Juno Temple and Jon Hamm knocked season 5 out of the park!",
  "Night Country atmosphere in Alaska was eerie and cool.",
  "Still has its moments of brilliance and lots of nostalgia, but man, what this show used to be...",
  "If you don't understand the implication, then we can’t be friends.",
  "The go back and watch comfort show.",
  "Isaac Asimov’s sprawling masterpiece in glorious installments that are so layered, dense and complex they demand multiple viewings. And they deserve it.",
  "Not everyone realizes it but Samantha actually had two Dicks on this show.",
  "I so loved the graphic novel by Stephen King’s son, Joe Hill but the show fell short of it. The parts that came through were great and not too creepy for the less brave.",
  "Superman. Of course I’m gonna watch it. Wee Hughie does a great job on the show’s fresh take on the original superhero.",
  "Nothin like Big Bang. Delightfully weird. Nice to see a bit of cursing and carnage in the BB world.",
  "A tragedy this ended. I'd put this up with loss of Firefly. The music was ripped out of my old Walkman.",
  "Fiona is back! I can't wait to start this.",
  "Brubaker, Kris. Brubaker. It’s an Elseworld’s version of Batman set in the 40s.",
  "Bill Burr is amazing(ly dysfunctional and hilarious). The trough scene deserves an Emmy.",
  "Gary Oldman is hilarious and brilliant.",
  "Michael finally gets his comeuppance. Took long enough…",
  "Absolute perfection. The unraveling mystery of Lumon is unmatched!",
  "Incredible emotional depth and tense atmosphere.",
  "Rebecca Ferguson is magnificent. Can't wait for season 3!",
  "Masterpiece cinematography, dialogue, and performances.",
  "The tension in every kitchen scene is so real!",
  "Dragons and political intrigue at their finest.",
  "Best written television drama of the decade!",
  "Ella Purnell and Walton Goggins are phenomenal.",
  "Heartwarming and hilarious. Futbol is life!",
  "Gearing up for the final season!",
  "Love Steve Martin, Martin Short, and Selena Gomez together!",
  "Jean Smart is a treasure.",
  "Consistently funny and heartwarming workplace comedy.",
  "Excited for Thailand!",
  "High pressure financial madness!",
  "Huge mystery box vibes. Rebecca Ferguson carries the show brilliantly.",
  "Favorite sci-fi thriller of 2024-2026. Rebecca Ferguson is unbelievable.",
  "Top tier animation, peak superhero writing.",
  "Peak detective noir meets DC universe.",
  "Pure action fun. Don't overthink it, just enjoy the ride.",
  "Intense military espionage thriller.",
  "Loving the mind-bending mystery and cinematography!"
];

export const ALL_NORMALIZED_JULIO_NOTES = new Set<string>(
  JULIO_AUTHENTIC_NOTES.map(n => normalizeReviewText(n))
);

export function isLeakedJulioText(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  const norm = normalizeReviewText(text);
  if (!norm) return false;
  if (ALL_NORMALIZED_JULIO_TAKES.has(norm) || ALL_NORMALIZED_JULIO_NOTES.has(norm)) return true;
  for (const take of ALL_NORMALIZED_JULIO_TAKES) {
    if (take && (norm === take || (norm.length > 20 && (norm.includes(take) || take.includes(norm))))) return true;
  }
  for (const note of ALL_NORMALIZED_JULIO_NOTES) {
    if (note && (norm === note || (norm.length > 20 && (norm.includes(note) || note.includes(norm))))) return true;
  }
  return false;
}

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
export function sanitizeShowForNonOwner(
  show: TvShow,
  isAuthoritativeOwner: boolean = false,
  boardOwnerName?: string
): TvShow {
  if (!show || isAuthoritativeOwner) return show;

  let cleanedEpReviews = show.episodeReviews ? { ...show.episodeReviews } : undefined;
  let cleanedEpScores = show.episodeScores ? { ...show.episodeScores } : undefined;
  let hasChanged = false;

  // 1. Clean leaked episode reviews
  if (cleanedEpReviews && Object.keys(cleanedEpReviews).length > 0) {
    for (const [epKey, reviewText] of Object.entries(cleanedEpReviews)) {
      if (typeof reviewText === 'string') {
        const norm = normalizeReviewText(reviewText);
        if (ALL_NORMALIZED_JULIO_TAKES.has(norm)) {
          delete cleanedEpReviews[epKey];
          if (cleanedEpScores && cleanedEpScores[epKey] !== undefined) {
            delete cleanedEpScores[epKey];
          }
          hasChanged = true;
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

  // 2. Clean leaked user notes
  let cleanedNotes = show.userNotes;
  if (cleanedNotes && typeof cleanedNotes === 'string') {
    if (isLeakedJulioText(cleanedNotes)) {
      cleanedNotes = '';
      hasChanged = true;
    }
  }

  // 3. Clean stale watched progress for Silo S3E9 if inherited
  let cleanedWatched = show.latestWatched;
  const normTitle = (show.title || '').toLowerCase().trim();
  if (normTitle === 'silo' && cleanedWatched?.season === 3 && cleanedWatched?.episode === 9) {
    if (!show.userScore && !cleanedNotes) {
      cleanedWatched = { season: 1, episode: 0, title: 'Not Started' };
      hasChanged = true;
    }
  }

  // 4. Correct ownerName on non-owner shows if it says "Julio"
  let correctedOwnerName = (show as any).ownerName;
  let correctedOwnerNames = (show as any).ownerNames;
  if (boardOwnerName && boardOwnerName.toLowerCase() !== 'julio') {
    if (correctedOwnerName && correctedOwnerName.toLowerCase() === 'julio') {
      correctedOwnerName = boardOwnerName;
      hasChanged = true;
    }
    if (Array.isArray(correctedOwnerNames) && correctedOwnerNames.includes('Julio')) {
      correctedOwnerNames = correctedOwnerNames.filter((n: string) => n.toLowerCase() !== 'julio');
      if (!correctedOwnerNames.includes(boardOwnerName)) {
        correctedOwnerNames.push(boardOwnerName);
      }
      hasChanged = true;
    }
  }

  if (!hasChanged) return show;

  return {
    ...show,
    episodeReviews: cleanedEpReviews,
    episodeScores: cleanedEpScores,
    latestWatched: cleanedWatched,
    userNotes: cleanedNotes,
    ownerName: correctedOwnerName,
    ownerNames: correctedOwnerNames,
  } as TvShow;
}

/**
 * Sanitize an entire board if it does not belong to Julio / Admin.
 * Purges all leaked episode reviews and scores that were accidentally copied from Buddy Picks.
 */
export function sanitizeBoardForUser(board: Board, currentUser?: any): { board: Board; changed: boolean } {
  if (!board || !Array.isArray(board.shows)) return { board, changed: false };

  // A board should ONLY be exempt from sanitization if the BOARD ITSELF belongs to Julio
  const isJulioBoard = isJulioAccount(board.id) || isJulioAccount(board.owner);
  if (isJulioBoard) return { board, changed: false };

  let changed = false;
  const boardOwnerName = board.owner?.name || board.name || 'Buddy';
  const sanitizedShows = board.shows.map(s => {
    const sanitized = sanitizeShowForNonOwner(s, false, boardOwnerName);
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
