import { TvShow, WatchedEpisode } from '../types';
import { getEpisodeAirDate } from './showSchedules';

/**
 * Checks if a title is a temporary placeholder like 'TBA'
 */
function isPlaceholderTitle(val?: string | null): boolean {
  if (!val) return true;
  const s = val.trim().toUpperCase();
  return s === 'TBA' || s === 'TBD' || s === 'TBC' || s === 'TO BE ANNOUNCED' || s === 'UNTITLED' || s === 'UNANNOUNCED';
}

/**
 * Gets today's date string in YYYY-MM-DD format (local time)
 */
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Checks if a date string represents a future date (strictly after today).
 */
export function isFutureAirDate(airDate?: string | null): boolean {
  if (!airDate) return false;
  // Format airDate to YYYY-MM-DD if ISO
  const dateOnly = airDate.split('T')[0];
  const today = getTodayDateString();
  return dateOnly > today;
}

/**
 * Determines if a show's nextEpisode represents an un-aired future episode.
 */
export function hasFutureNextEpisode(show: TvShow): boolean {
  return Boolean(
    show.nextEpisode &&
    show.nextEpisode.airDate &&
    isFutureAirDate(show.nextEpisode.airDate)
  );
}

/**
 * Calculates the maximum season available for tracking (allowing navigation of all known seasons).
 */
export function getMaxAiredSeason(show: TvShow): number {
  const fromTotal = show.totalSeasons || 1;
  const fromEps = show.episodesPerSeason ? show.episodesPerSeason.length : 1;
  const fromWatched = show.latestWatched?.season || 1;
  const fromNext = show.nextEpisode?.season || 1;
  return Math.max(1, fromTotal, fromEps, fromWatched, fromNext);
}

/**
 * Calculates the maximum episode count available for a specific season.
 * Ensures user can always progress through all known episodes of that season.
 */
export function getMaxAiredEpisodeForSeason(show: TvShow, season: number): number {
  // 1. From episodesPerSeason array
  if (show.episodesPerSeason && show.episodesPerSeason[season - 1] && show.episodesPerSeason[season - 1] > 0) {
    return show.episodesPerSeason[season - 1];
  }

  // 2. Count numbered episodes in episodes map
  if (show.episodes && typeof show.episodes === 'object') {
    let maxEp = 0;
    const prefixS = `S${season}E`;
    const prefixDash = `${season}-`;
    for (const key of Object.keys(show.episodes)) {
      if (key.startsWith(prefixS) || key.startsWith(prefixDash)) {
        const match = key.match(/E(\d+)/i) || key.match(/-(\d+)/);
        if (match) {
          const ep = parseInt(match[1], 10);
          if (!isNaN(ep) && ep > maxEp) maxEp = ep;
        }
      }
    }
    if (maxEp > 0) return maxEp;
  }

  // 3. From latestWatched if it's already higher
  if (show.latestWatched && show.latestWatched.season === season && show.latestWatched.episode > 10) {
    return show.latestWatched.episode;
  }

  // Default to standard 10 episodes per season
  return 10;
}

/**
 * Helper to get title for an episode
 */
export function getTitleForEpisode(show: TvShow, season: number, episode: number): string {
  if (episode <= 0) return "Not Started";
  const k1 = `S${season}E${episode}`;
  const k2 = `${season}-${episode}`;
  const ep1 = show.episodes?.[k1];
  const ep2 = show.episodes?.[k2];

  // 1. If local dictionary has a valid, non-placeholder title, use it
  if (ep1 && !isPlaceholderTitle(ep1)) return ep1;
  if (ep2 && !isPlaceholderTitle(ep2)) return ep2;

  // 2. Prioritize official broadcast schedule (canonical database)
  const canonical = getEpisodeAirDate(show.title, season, episode);
  if (canonical?.title && !isPlaceholderTitle(canonical.title)) {
    return canonical.title;
  }

  // 3. Check nextEpisode if matching season/episode and has an official title
  if (show.nextEpisode?.season === season && show.nextEpisode?.episode === episode && show.nextEpisode.title && !isPlaceholderTitle(show.nextEpisode.title)) {
    return show.nextEpisode.title;
  }

  // 4. Check latestWatched if matching season/episode and has an official title
  if (show.latestWatched?.season === season && show.latestWatched?.episode === episode && show.latestWatched.title && !isPlaceholderTitle(show.latestWatched.title)) {
    return show.latestWatched.title;
  }

  // 5. Fallback to placeholder if explicit ("TBA"), or canonical title
  if (ep1) return ep1;
  if (ep2) return ep2;
  if (canonical?.title) return canonical.title;

  return `Episode ${episode}`;
}

/**
 * Clamps user progress so that season and episode never exceed the known boundaries.
 */
export function clampProgressToAired(show: TvShow, targetSeason: number, targetEpisode: number): WatchedEpisode {
  const maxSeason = getMaxAiredSeason(show);
  const clampedSeason = Math.max(1, Math.min(maxSeason, targetSeason));

  const maxEpisode = getMaxAiredEpisodeForSeason(show, clampedSeason);
  const clampedEpisode = Math.max(0, Math.min(maxEpisode, targetEpisode));

  return {
    season: clampedSeason,
    episode: clampedEpisode,
    title: getTitleForEpisode(show, clampedSeason, clampedEpisode)
  };
}

