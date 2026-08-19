import { TvShow, WatchedEpisode } from '../types';

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
 * Calculates the maximum season that has actually aired episodes.
 */
export function getMaxAiredSeason(show: TvShow): number {
  if (hasFutureNextEpisode(show) && show.nextEpisode) {
    // If nextEpisode has episode > 1, then earlier episodes in that season have aired!
    if (show.nextEpisode.episode > 1) {
      return show.nextEpisode.season;
    }
    // If nextEpisode is S_E1, season S hasn't aired yet, so max aired season is S - 1.
    return Math.max(1, show.nextEpisode.season - 1);
  }

  // If no future nextEpisode, all known seasons up to totalSeasons / latestWatched have aired
  return Math.max(1, show.totalSeasons || 1, show.latestWatched?.season || 1);
}

/**
 * Calculates the maximum episode count that has actually aired for a specific season.
 */
export function getMaxAiredEpisodeForSeason(show: TvShow, season: number): number {
  const episodesInSeason = (show.episodesPerSeason && show.episodesPerSeason[season - 1]) || 10;

  if (hasFutureNextEpisode(show) && show.nextEpisode) {
    const futureSeason = show.nextEpisode.season;
    const futureEpisode = show.nextEpisode.episode;

    if (season > futureSeason) {
      // Future season after nextEpisode -> 0 aired episodes
      return 0;
    } else if (season === futureSeason) {
      // Same season as nextEpisode -> max aired episode is futureEpisode - 1
      return Math.max(0, futureEpisode - 1);
    } else {
      // Earlier season -> all episodes in this season have aired
      return episodesInSeason;
    }
  }

  // No future nextEpisode -> all episodes in this season have aired
  return Math.max(1, episodesInSeason, season === show.latestWatched?.season ? show.latestWatched.episode : 0);
}

/**
 * Helper to get title for an episode
 */
export function getTitleForEpisode(show: TvShow, season: number, episode: number): string {
  if (episode <= 0) return "Not Started";
  const k1 = `S${season}E${episode}`;
  const k2 = `${season}-${episode}`;
  if (show.episodes?.[k1]) return show.episodes[k1];
  if (show.episodes?.[k2]) return show.episodes[k2];
  if (show.latestWatched?.season === season && show.latestWatched?.episode === episode && show.latestWatched.title) {
    return show.latestWatched.title;
  }
  return `Episode ${episode}`;
}

/**
 * Clamps user progress so that season and episode never exceed the most recent aired episode.
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
