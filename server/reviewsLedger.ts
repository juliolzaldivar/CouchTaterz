/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from "fs";
import path from "path";
import type { TvShow, Board } from "../src/types";
import {
  mergeEpisodeReviewsPreservingUserData,
  mergeUserNotesPreservingUserData,
  mergeUserScorePreservingUserData,
  mergeEpisodeScoresPreservingUserData,
  getStrictReviewTimestamp,
  isGenericOrPlaceholderReview,
  isGenericOrPlaceholderNotes,
} from "../src/utils/reviewPreservationGuards";

export interface StoredReviewEntry {
  boardId?: string;
  userId?: string;
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

// In-memory cache for fast sub-millisecond lookups without synchronous disk I/O
let cachedLedger: ReviewsLedger | null = null;
let cachedLedgerMtime = 0;

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

export function isJulioAccountLedger(userOrIdOrEmail?: any): boolean {
  if (!userOrIdOrEmail) return false;
  if (typeof userOrIdOrEmail === "string") {
    const s = userOrIdOrEmail.toLowerCase().trim();
    return (
      s === "default" ||
      s === "user-julio" ||
      s === "user-google-8850" ||
      s === "julio" ||
      s === "juliozaldivar@gmail.com" ||
      s === "julio@couchtaterz.com" ||
      s === "julio@taterz.com"
    );
  }
  const id = (userOrIdOrEmail.id || "").toLowerCase().trim();
  const email = (userOrIdOrEmail.email || "").toLowerCase().trim();
  const name = (userOrIdOrEmail.name || "").toLowerCase().trim();
  if (id === "default" || id === "user-julio" || id === "user-google-8850") return true;
  if (email === "juliozaldivar@gmail.com" || email === "julio@couchtaterz.com" || email === "julio@taterz.com") return true;
  if (name === "julio" && (!id || id === "default" || id === "user-julio" || id.startsWith("user-julio-"))) return true;
  return false;
}

export const normalizeReviewTextLedger = (text: string): string => {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[“”"']/g, "")
    .replace(/[—–-]/g, " ")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

export const ALL_NORMALIZED_JULIO_TAKES_LEDGER = new Set([
  normalizeReviewTextLedger("Bernard draws focus and exhales under an open sky. The Silos are finished just in time. Collin Hanks plays Chopsticks like his dad."),
  normalizeReviewTextLedger("Creepy vibe, interesting visuals and the soundtrack for E1 was on point for anybody 80s inclined. Super LA centric. Curious to see where we're headed."),
  normalizeReviewTextLedger("Starts out with a bang. Reacher gets pulled into someone else's problems but still manages to fit in a cheesesteak breakfast."),
  normalizeReviewTextLedger("Reacher figures stuff out. Can't say I saw that ending coming, but I really enjoyed the battle poses."),
  normalizeReviewTextLedger("Excellent chase episode! Reacher dogged by cops and his buddies pursued by Indonesian karambit baddies. Reacher finally realizes what's actually goin on."),
  normalizeReviewTextLedger("Reacher tries to blend in. Tamara practices 4th grade multiplication. Jacob shows off core strength."),
  normalizeReviewTextLedger("Reacher tries to blend in. Tamara practices her times tables. Jacob shows off core strength."),
  normalizeReviewTextLedger("WTF? That start was the biggest shock I've had on TWD in a long time."),
  normalizeReviewTextLedger("Maggie dreams a breathing doctor run up against Glen's memory."),
  normalizeReviewTextLedger("Great start to the season — Zoe and team face the new realities of drone warfare. Great scene."),
  normalizeReviewTextLedger("“Lots of  splaining to do.” Pressing danger in the present and some needed context from the past."),
  normalizeReviewTextLedger("“Disease kills the bear and they’ve been infecting you for many years.” Things aren't looking great for Joe."),
  normalizeReviewTextLedger("Great episode and kick off to the season. Evil Morty in rare form."),
  normalizeReviewTextLedger("Wow, an impressive season finale. 'He belongs more to me than to you' was some cold ass shit, Morty Prime. Some creepy messed up scenes but great writing."),
  normalizeReviewTextLedger("Dad's on a hunting trip and hasn't been home in a few days. Solid start to an amazing series. And we're off (again)!"),
  normalizeReviewTextLedger("Rogue, Remy and Apocalypse come to a head. Elf lives his faith. Charles is just kinda there."),
  normalizeReviewTextLedger("Remy, Rogue and Apocalypse come to a head. Charles doesn't seem to do much about it. Stick around for the final scene at the end."),
  normalizeReviewTextLedger("Hank throws a fit. Clark engages in fisticuffs. John wraps up his visit. The future belongs to everyone?"),
  normalizeReviewTextLedger("Hal's kind of a dick, but I loved Waylien taunting him with the Oath during the interrogation scene. John farms aura."),
  normalizeReviewTextLedger("John makes a friend. Hal finally suits up and chats with everyone's favorite pink prisoner. Something is rotten in the state of Denmark."),
  normalizeReviewTextLedger("“Courage is fear that has said its prayers, son.” Hell of a childhood ya got there, John."),
  normalizeReviewTextLedger("Hal and John discuss Disney’s weenie. Truck go boom. Car go crash. Things come into focus.  I don’t think Hal likes John much."),
  normalizeReviewTextLedger("Hal and John discuss Disney’s weenie. Truck go boom. Car go crash. I don’t think Hal likes John much."),
  normalizeReviewTextLedger("The animated medium gives them absolute freedom to make fight scenes that would cost 200 million dollars in live action. Magneto's monologue in episode 8 gave me literal chills."),
  normalizeReviewTextLedger("The absolute best sci-fi on television right now. Episode 9 had my jaw on the floor with that generator room sequence."),
  normalizeReviewTextLedger("Holy shit, the ending of season 3 episode 9 made my jaw drop. The level of tension Morten Tyldum and Graham Yost created in that generator room is unmatched. Best sci-fi currently on TV."),
  normalizeReviewTextLedger("They finally nailed the balance between grounded detective procedural and cosmic weirdness. John Stewart's introduction is pitch-perfect."),
  normalizeReviewTextLedger("Alan Ritchson was born to play Reacher. Season 3 is pure adrenaline and high-octane fun from start to finish."),
  normalizeReviewTextLedger("Pure adrenaline and bone-crunching action. Season 3 delivers everything fans wanted."),
  normalizeReviewTextLedger("Taylor Sheridan's tightest writing since Sicario. Zoe Saldaña gives a powerhouse performance."),
  normalizeReviewTextLedger("The animation style and multiverse humor is peak Dan Harmon. Classic Rick and Morty absurdity at its finest.")
]);

export const ALL_NORMALIZED_JULIO_NOTES_LEDGER = new Set([
  normalizeReviewTextLedger("Deep mystery, deep hole."),
  normalizeReviewTextLedger("To me, my X-Men! If you like Marvel, you need to be watching this."),
  normalizeReviewTextLedger("Not your daddy's Green Lantern, but lots to like. Leaning into the space cop and less superhero. Some stellar performances and loads of easter eggs for fanboys."),
  normalizeReviewTextLedger("Consistently awesome action and badassery. AR carries the show, that talented wall of meat. Can't wait for S4."),
  normalizeReviewTextLedger("Rebecca Ferguson is magnificent. Can't wait for season 3!"),
  normalizeReviewTextLedger("Ahh geez... still solid, even after the cast change."),
  normalizeReviewTextLedger("Negan, you old bastard, why can’t I quit you? Probably cause I like seeing John and Bella on tv. Extra tater points to whoever gets the reference."),
  normalizeReviewTextLedger("Superb cast and writing. Zoe isn't blue or green but leads the CIA's war on terror. S3 kicks off super strong: modern day drone warfare changes the game."),
  normalizeReviewTextLedger("This series is hilarious. Even if you're not into animation, Penny & the vo cast does such a phenomenal job its always worth a laugh."),
  normalizeReviewTextLedger("This is art in motion. If you love animation, samurais, or martial arts revenge stories, give this a shot before season 2. One of my favorite series on Netflix."),
  normalizeReviewTextLedger("Nic Cage, Spider-Man... Noir?! They wrote this for me. Beautifully unhinged performance. Oh and I loved it in both black and white and color."),
  normalizeReviewTextLedger("Thomas Shelby is a force. Peaky Blinders is peak tv."),
  normalizeReviewTextLedger("Was amazing and then lost its mojo. Hope they get it back this season."),
  normalizeReviewTextLedger("One of the greatest television dramas ever written. Outstanding finale and unforgettable dialogue."),
  normalizeReviewTextLedger("Hilarious, gory, and wonderfully authentic to the game lore. Walton Goggins as the Ghoul is iconic."),
  normalizeReviewTextLedger("The tension in every kitchen scene is so real!"),
  normalizeReviewTextLedger("Dragons and political intrigue at their finest."),
  normalizeReviewTextLedger("Masterpiece cinematography, dialogue, and performances."),
  normalizeReviewTextLedger("The office environment is so eerie. That season finale cliffhanger was one of the best in TV history!"),
  normalizeReviewTextLedger("Need to rewatch before the final season drops. S4 was epic, especially the Max/Vecna storyline."),
  normalizeReviewTextLedger("Incredible adaptation of the game! Pedro Pascal and Bella Ramsey are stellar. Season 2 was a masterpiece, now waiting for Season 3."),
  normalizeReviewTextLedger("Obsessed with this show! One of the best on TV right now."),
  normalizeReviewTextLedger("Ella Purnell and Walton Goggins are phenomenal."),
  normalizeReviewTextLedger("A triumph of animation art, soundtrack, and tragic sibling storytelling. Absolute masterpiece."),
  normalizeReviewTextLedger("Grogu is the cutest character ever. Season 3 ended the main arc nicely, heard there's a movie coming next."),
  normalizeReviewTextLedger("Mando takes off his helmet and adopts another special orphan. This is the way."),
  normalizeReviewTextLedger("Intense, stressful, but absolute culinary cinema. The kitchen chemistry is unmatched. Every second is packed with tension."),
  normalizeReviewTextLedger("Dragon battles in Season 2 were mindblowing. The Dance of the Dragons is getting fierce."),
  normalizeReviewTextLedger("Cinematography, costumes, and political intrigue are staggering. Must binge next!"),
  normalizeReviewTextLedger("One of the best modern sitcoms. Quinta Brunson and the cast have phenomenal comic timing."),
  normalizeReviewTextLedger("Heartwarming, wholesome, and delightfully funny all the way through all 3 seasons."),
  normalizeReviewTextLedger("A masterclass in character transformation and tension from start to finish."),
  normalizeReviewTextLedger("Sharp social satire, gorgeous resort settings, and Jennifer Coolidge at her absolute peak."),
  normalizeReviewTextLedger("Samurai Jacks’s darker, angrier and bloodier cousin."),
  normalizeReviewTextLedger("Some pretty timely and relevant questions in episode 1. Ai will challenge our relationships with work and meaning."),
  normalizeReviewTextLedger("Interesting but all too common tale of Western colonialism clashing upon native (Hawaiian) life. Amazing attention to detail. Thankfully, Aquabro discovers pants about the third episode in."),
  normalizeReviewTextLedger("Amazing acting, super creepy performance. Highly recommend. AD won’t let me do his voice anymore but it’s so fun."),
  normalizeReviewTextLedger("Fun if your a fan of anime or the game - not all heroes with a whip are named Indiana."),
  normalizeReviewTextLedger("Best of the spinoffs. Daryl tries to get home from France while saving a teenage French Jesus. Amazing locales and wine."),
  normalizeReviewTextLedger("This show dies and comes back so often you'd think it was a Winchester. Super smart and ridiculously stupid funny at the same time. I'd rank above The Simpsons..."),
  normalizeReviewTextLedger("Ready for Season 2!"),
  normalizeReviewTextLedger("Childhood feels."),
  normalizeReviewTextLedger("Some folks just can't get a good break. Worst luck, but best show out of the Dutton bunch. Sam Elliot's mustache FTW."),
  normalizeReviewTextLedger("S1 had aliens probing Cartman. S28 has Trump probing Vance. Full circle."),
  normalizeReviewTextLedger("What if George Costanza had his own show? Watch and find out."),
  normalizeReviewTextLedger("The best non anime anime there is. If you’re not sold by the end of the shows intro, we’re watching different shows."),
  normalizeReviewTextLedger("Added from Julio's picks"),
  normalizeReviewTextLedger("Juno Temple and Jon Hamm knocked season 5 out of the park!"),
  normalizeReviewTextLedger("Night Country atmosphere in Alaska was eerie and cool."),
  normalizeReviewTextLedger("Still has its moments of brilliance and lots of nostalgia, but man, what this show used to be..."),
  normalizeReviewTextLedger("If you don't understand the implication, then we can’t be friends."),
  normalizeReviewTextLedger("The go back and watch comfort show."),
  normalizeReviewTextLedger("Isaac Asimov’s sprawling masterpiece in glorious installments that are so layered, dense and complex they demand multiple viewings. And they deserve it."),
  normalizeReviewTextLedger("Not everyone realizes it but Samantha actually had two Dicks on this show."),
  normalizeReviewTextLedger("I so loved the graphic novel by Stephen King’s son, Joe Hill but the show fell short of it. The parts that came through were great and not too creepy for the less brave."),
  normalizeReviewTextLedger("Superman. Of course I’m gonna watch it. Wee Hughie does a great job on the show’s fresh take on the original superhero."),
  normalizeReviewTextLedger("Nothin like Big Bang. Delightfully weird. Nice to see a bit of cursing and carnage in the BB world."),
  normalizeReviewTextLedger("A tragedy this ended. I'd put this up with loss of Firefly. The music was ripped out of my old Walkman."),
  normalizeReviewTextLedger("Fiona is back! I can't wait to start this."),
  normalizeReviewTextLedger("Brubaker, Kris. Brubaker. It’s an Elseworld’s version of Batman set in the 40s."),
  normalizeReviewTextLedger("Bill Burr is amazing(ly dysfunctional and hilarious). The trough scene deserves an Emmy."),
  normalizeReviewTextLedger("Gary Oldman is hilarious and brilliant."),
  normalizeReviewTextLedger("Michael finally gets his comeuppance. Took long enough…"),
  normalizeReviewTextLedger("Absolute perfection. The unraveling mystery of Lumon is unmatched!"),
  normalizeReviewTextLedger("Incredible emotional depth and tense atmosphere."),
  normalizeReviewTextLedger("Rebecca Ferguson is magnificent. Can't wait for season 3!"),
  normalizeReviewTextLedger("Heartwarming and hilarious. Futbol is life!"),
  normalizeReviewTextLedger("Gearing up for the final season!"),
  normalizeReviewTextLedger("Love Steve Martin, Martin Short, and Selena Gomez together!"),
  normalizeReviewTextLedger("Jean Smart is a treasure."),
  normalizeReviewTextLedger("Consistently funny and heartwarming workplace comedy."),
  normalizeReviewTextLedger("Excited for Thailand!"),
  normalizeReviewTextLedger("High pressure financial madness!"),
  normalizeReviewTextLedger("Huge mystery box vibes. Rebecca Ferguson carries the show brilliantly."),
  normalizeReviewTextLedger("Favorite sci-fi thriller of 2024-2026. Rebecca Ferguson is unbelievable."),
  normalizeReviewTextLedger("Top tier animation, peak superhero writing."),
  normalizeReviewTextLedger("Peak detective noir meets DC universe."),
  normalizeReviewTextLedger("Pure action fun. Don't overthink it, just enjoy the ride."),
  normalizeReviewTextLedger("Intense military espionage thriller."),
  normalizeReviewTextLedger("Loving the mind-bending mystery and cinematography!")
]);

export function isLeakedJulioTextLedger(text: string): boolean {
  if (!text || typeof text !== "string") return false;
  const norm = normalizeReviewTextLedger(text);
  if (!norm) return false;
  if (ALL_NORMALIZED_JULIO_TAKES_LEDGER.has(norm) || ALL_NORMALIZED_JULIO_NOTES_LEDGER.has(norm)) return true;
  for (const take of ALL_NORMALIZED_JULIO_TAKES_LEDGER) {
    if (take && (norm === take || (norm.length > 20 && (norm.includes(take) || take.includes(norm))))) return true;
  }
  for (const note of ALL_NORMALIZED_JULIO_NOTES_LEDGER) {
    if (note && (norm === note || (norm.length > 20 && (norm.includes(note) || note.includes(norm))))) return true;
  }
  return false;
}

export function loadReviewsLedger(): ReviewsLedger {
  try {
    if (fs.existsSync(LEDGER_FILE)) {
      const stat = fs.statSync(LEDGER_FILE);
      if (cachedLedger && stat.mtimeMs === cachedLedgerMtime) {
        return cachedLedger;
      }
    }
  } catch (e) {}

  let rawLedger: ReviewsLedger = {};

  try {
    if (fs.existsSync(LEDGER_FILE)) {
      const content = fs.readFileSync(LEDGER_FILE, "utf8");
      rawLedger = JSON.parse(content);
    } else if (fs.existsSync(LEDGER_BACKUP_FILE)) {
      const content = fs.readFileSync(LEDGER_BACKUP_FILE, "utf8");
      rawLedger = JSON.parse(content);
    }
  } catch (e) {
    console.warn("[ReviewsLedger] Error loading ledger:", e);
  }

  // Automatic Migration & Sanitization:
  // 1. Dynamically harvest all authentic Julio notes & episode takes from default partition
  for (const [key, entry] of Object.entries(rawLedger)) {
    if (!entry) continue;
    if (!key.includes("::") || key.startsWith("default::")) {
      if (entry.userNotes && typeof entry.userNotes === "string" && entry.userNotes.trim()) {
        ALL_NORMALIZED_JULIO_NOTES_LEDGER.add(normalizeReviewTextLedger(entry.userNotes.trim()));
      }
      if (entry.episodeReviews && typeof entry.episodeReviews === "object") {
        for (const rev of Object.values(entry.episodeReviews)) {
          if (typeof rev === "string" && rev.trim()) {
            ALL_NORMALIZED_JULIO_TAKES_LEDGER.add(normalizeReviewTextLedger(rev.trim()));
          }
        }
      }
    }
  }

  // 2. Migrate legacy unpartitioned global keys (without "::") to "default::"
  // 3. Purge any leaked Julio reviews/notes from non-default partitions
  let dirty = false;
  const migrated: ReviewsLedger = {};

  for (const [key, entry] of Object.entries(rawLedger)) {
    if (!entry) continue;

    let targetKey = key;
    let targetBoard = entry.boardId || "default";

    if (!key.includes("::")) {
      dirty = true;
      targetKey = `default::${key}`;
      targetBoard = "default";
    }

    const isDefaultPartition = targetKey.startsWith("default::");

    if (!isDefaultPartition) {
      // Sanitize non-default entry
      let entryChanged = false;
      const cleanReviews: Record<string, string> = {};
      const cleanScores: Record<string, number> = {};

      if (entry.episodeReviews && typeof entry.episodeReviews === "object") {
        for (const [ep, rev] of Object.entries(entry.episodeReviews)) {
          if (typeof rev === "string" && isLeakedJulioTextLedger(rev)) {
            entryChanged = true;
            dirty = true;
          } else {
            cleanReviews[ep] = rev;
            if (entry.episodeScores && entry.episodeScores[ep] !== undefined) {
              cleanScores[ep] = entry.episodeScores[ep];
            }
          }
        }
      }

      let cleanNotes = entry.userNotes;
      if (cleanNotes && isLeakedJulioTextLedger(cleanNotes)) {
        cleanNotes = undefined;
        entryChanged = true;
        dirty = true;
      }

      const hasReviews = Object.keys(cleanReviews).length > 0;
      const hasNotes = Boolean(cleanNotes && cleanNotes.trim().length > 0);
      const hasScore = typeof entry.userScore === "number";

      if (!hasReviews && !hasNotes && !hasScore) {
        // Nothing remains in this friend ledger entry, remove it completely
        dirty = true;
        continue;
      }

      migrated[targetKey] = {
        ...entry,
        boardId: targetBoard,
        episodeReviews: hasReviews ? cleanReviews : undefined,
        episodeScores: Object.keys(cleanScores).length > 0 ? cleanScores : undefined,
        userNotes: cleanNotes
      };
    } else {
      migrated[targetKey] = {
        ...entry,
        boardId: targetBoard
      };
    }
  }

  if (dirty) {
    saveReviewsLedger(migrated);
    return migrated;
  }

  cachedLedger = rawLedger;
  try {
    if (fs.existsSync(LEDGER_FILE)) {
      cachedLedgerMtime = fs.statSync(LEDGER_FILE).mtimeMs;
    }
  } catch (e) {}

  return rawLedger;
}

export function saveReviewsLedger(ledger: ReviewsLedger): void {
  safeWriteJson(LEDGER_FILE, ledger);
  cachedLedger = ledger;
  try {
    if (fs.existsSync(LEDGER_FILE)) {
      cachedLedgerMtime = fs.statSync(LEDGER_FILE).mtimeMs;
    }
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
 * and atomically persists them into the partitioned reviews ledger.
 * Strictly scopes reviews per-board to prevent cross-account contamination.
 */
export function recordShowsToLedger(shows: any[] | Record<string, Board>, targetBoardId?: string): void {
  if (!shows) return;

  const entriesToRecord: { boardKey: string; show: any }[] = [];

  if (Array.isArray(shows)) {
    const bKey = targetBoardId && !isJulioAccountLedger(targetBoardId) ? targetBoardId : "default";
    for (const s of shows) {
      if (s) entriesToRecord.push({ boardKey: bKey, show: s });
    }
  } else if (typeof shows === "object") {
    for (const [bId, board] of Object.entries(shows)) {
      if (!board || !Array.isArray(board.shows)) continue;
      const isJulio = isJulioAccountLedger(bId) || isJulioAccountLedger(board.owner);
      const bKey = isJulio ? "default" : bId;
      for (const s of board.shows) {
        if (!s) continue;
        // Never record leaked Julio takes under a friend board's ledger partition!
        if (!isJulio) {
          const anyShow = s as any;
          const isContaminated = (anyShow.ownerName && anyShow.ownerName.toLowerCase().includes("julio")) ||
            (Array.isArray(anyShow.ownerNames) && anyShow.ownerNames.some((n: string) => n.toLowerCase().includes("julio")));
          if (isContaminated) continue;
        }
        entriesToRecord.push({ boardKey: bKey, show: s });
      }
    }
  }

  if (entriesToRecord.length === 0) return;

  const ledger = loadReviewsLedger();
  let modified = false;

  for (const { boardKey, show: s } of entriesToRecord) {
    if (!s || typeof s !== "object") continue;

    const hasEpReviews = s.episodeReviews && typeof s.episodeReviews === "object" && Object.keys(s.episodeReviews).length > 0;
    const hasEpScores = s.episodeScores && typeof s.episodeScores === "object" && Object.keys(s.episodeScores).length > 0;
    const hasNotes = typeof s.userNotes === "string" && s.userNotes.trim().length > 0;
    const hasScore = typeof s.userScore === "number";

    if (!hasEpReviews && !hasEpScores && !hasNotes && !hasScore) continue;

    let inputEpReviews = s.episodeReviews && typeof s.episodeReviews === "object" ? { ...s.episodeReviews } : {};
    let inputEpScores = s.episodeScores && typeof s.episodeScores === "object" ? { ...s.episodeScores } : {};
    let inputNotes = typeof s.userNotes === "string" ? s.userNotes.trim() : "";
    let inputScore = typeof s.userScore === "number" ? s.userScore : undefined;

    if (boardKey !== "default") {
      for (const [ep, rev] of Object.entries(inputEpReviews)) {
        if (typeof rev === "string" && isLeakedJulioTextLedger(rev)) {
          delete inputEpReviews[ep];
          delete inputEpScores[ep];
        }
      }
      if (inputNotes && isLeakedJulioTextLedger(inputNotes)) {
        inputNotes = "";
      }
      if (Object.keys(inputEpReviews).length === 0 && !inputNotes && inputScore === undefined) {
        continue;
      }
    }

    const idKey = s.id ? s.id.trim() : "";
    const titleKey = s.title ? normalizeLedgerKey(s.title) : "";
    if (!idKey && !titleKey) continue;

    const scopedIdKey = idKey ? `${boardKey}::${idKey}` : "";
    const scopedTitleKey = titleKey ? `${boardKey}::${titleKey}` : "";
    const primaryKey = scopedIdKey || scopedTitleKey;

    const existing = ledger[primaryKey] || (scopedTitleKey ? ledger[scopedTitleKey] : null);

    const timeInputReview = getStrictReviewTimestamp(s);
    const timeExistingReview = getStrictReviewTimestamp(existing);

    const mergedEpReviews = mergeEpisodeReviewsPreservingUserData(
      inputEpReviews,
      existing?.episodeReviews,
      timeInputReview,
      timeExistingReview
    );

    const mergedEpScores = mergeEpisodeScoresPreservingUserData(
      inputEpScores,
      existing?.episodeScores,
      timeInputReview,
      timeExistingReview
    );

    const mergedNotes = mergeUserNotesPreservingUserData(
      inputNotes,
      existing?.userNotes,
      timeInputReview,
      timeExistingReview
    );

    const mergedScore = mergeUserScorePreservingUserData(
      inputScore !== undefined ? inputScore : null,
      existing?.userScore !== undefined ? existing.userScore : null,
      timeInputReview,
      timeExistingReview
    );

    const newestReviewUpdated = (timeInputReview >= timeExistingReview && timeInputReview > 0)
      ? (s.reviewUpdatedAt || existing?.reviewUpdatedAt)
      : (existing?.reviewUpdatedAt || s.reviewUpdatedAt || new Date().toISOString());

    const updatedEntry: StoredReviewEntry = {
      boardId: boardKey,
      showId: s.id || existing?.showId || "",
      showTitle: s.title || existing?.showTitle || "",
      episodeReviews: mergedEpReviews,
      episodeScores: mergedEpScores,
      episodeTags: { ...(existing?.episodeTags || {}), ...(s.episodeTags || {}) },
      userNotes: mergedNotes,
      userScore: mergedScore !== null ? mergedScore : undefined,
      reviewUpdatedAt: newestReviewUpdated,
      updatedAt: new Date().toISOString(),
    };

    if (scopedIdKey) ledger[scopedIdKey] = updatedEntry;
    if (scopedTitleKey) ledger[scopedTitleKey] = updatedEntry;
    modified = true;
  }

  if (modified) {
    saveReviewsLedger(ledger);
  }
}

/**
 * Merges authoritative reviews from the ledger onto an array of shows.
 * Strictly scopes by board identity. Julio's reviews are ONLY applied to Julio's board.
 * Non-Julio boards can NEVER inherit reviews from Julio's ledger partition.
 */
export function applyReviewsLedgerToShows(shows: TvShow[], boardIdOrOwner?: any): TvShow[] {
  if (!Array.isArray(shows)) return shows;
  const ledger = loadReviewsLedger();
  if (Object.keys(ledger).length === 0) return shows;

  const isJulio = !boardIdOrOwner || isJulioAccountLedger(boardIdOrOwner) || (typeof boardIdOrOwner === "object" && isJulioAccountLedger(boardIdOrOwner?.owner));
  const boardKey = isJulio ? "default" : (typeof boardIdOrOwner === "string" ? boardIdOrOwner : (boardIdOrOwner?.id || ""));

  // If this is a non-Julio board without an identified board key, NEVER apply reviews speculatively
  if (!isJulio && !boardKey) return shows;

  return shows.map((show) => {
    if (!show) return show;

    const idKey = show.id ? show.id.trim() : "";
    const titleKey = show.title ? normalizeLedgerKey(show.title) : "";

    // Strictly check within this board's partition
    const scopedIdKey = idKey ? `${boardKey}::${idKey}` : "";
    const scopedTitleKey = titleKey ? `${boardKey}::${titleKey}` : "";

    let ledgerEntry = (scopedIdKey && ledger[scopedIdKey]) || (scopedTitleKey && ledger[scopedTitleKey]) || null;

    // For Julio only: also allow legacy unpartitioned key fallback
    if (!ledgerEntry && isJulio) {
      ledgerEntry = (idKey && ledger[idKey]) || (titleKey && ledger[titleKey]) || null;
    }

    if (!ledgerEntry) return show;

    const timeShowReview = getStrictReviewTimestamp(show);
    const timeLedgerReview = getStrictReviewTimestamp(ledgerEntry);

    // Deep protected merge with existing reviews and notes
    const mergedReviews = mergeEpisodeReviewsPreservingUserData(
      show.episodeReviews,
      ledgerEntry.episodeReviews,
      timeShowReview,
      timeLedgerReview
    );

    const mergedScores = mergeEpisodeScoresPreservingUserData(
      show.episodeScores,
      ledgerEntry.episodeScores,
      timeShowReview,
      timeLedgerReview
    );

    let resolvedNotes = mergeUserNotesPreservingUserData(
      show.userNotes,
      ledgerEntry.userNotes,
      timeShowReview,
      timeLedgerReview
    );

    let resolvedScore = mergeUserScorePreservingUserData(
      typeof show.userScore === "number" ? show.userScore : null,
      typeof ledgerEntry.userScore === "number" ? ledgerEntry.userScore : null,
      timeShowReview,
      timeLedgerReview
    );

    // Defense-in-depth: If non-Julio, purge any leaked Julio reviews/notes from the merged result
    if (!isJulio) {
      for (const [ep, rev] of Object.entries(mergedReviews)) {
        if (typeof rev === "string" && isLeakedJulioTextLedger(rev)) {
          delete mergedReviews[ep];
          delete mergedScores[ep];
        }
      }
      if (resolvedNotes && isLeakedJulioTextLedger(resolvedNotes)) {
        resolvedNotes = "";
      }
    }

    return {
      ...show,
      episodeReviews: Object.keys(mergedReviews).length > 0 ? mergedReviews : undefined,
      episodeScores: Object.keys(mergedScores).length > 0 ? mergedScores : undefined,
      userNotes: resolvedNotes || undefined,
      userScore: resolvedScore !== null ? resolvedScore : undefined,
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
