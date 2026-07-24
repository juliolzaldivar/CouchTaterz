/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type StreamingService =
  | 'HBO'
  | 'Disney+'
  | 'Prime Video'
  | 'Netflix'
  | 'Hulu'
  | 'Paramount+'
  | 'Apple TV'
  | 'Peacock'
  | 'AMC+'
  | 'Other';

export type ShowStatus = 'Watching' | 'Backlog' | 'Completed' | 'Dropped';

export interface WatchedEpisode {
  season: number;
  episode: number;
  title: string;
}

export interface NextEpisode {
  season: number;
  episode: number;
  title: string;
  airDate: string; // ISO string or human date e.g., "2026-09-15"
  overview?: string; // Optional upcoming episode overview/summary
  summary?: string; // Optional upcoming episode summary/description
}

export interface TvShow {
  id: string;
  title: string;
  streamingService: StreamingService;
  genres: string[];
  status: ShowStatus;
  latestWatched: WatchedEpisode;
  nextEpisode: NextEpisode | null;
  rottenTomatoesScore: number | null; // 0-100 percentage, null if unrated/upcoming
  userScore: number | null; // 1-10 rating
  userNotes: string;
  overview: string;
  directors: string[];
  actors: string[];
  bannerImage: string;
  bannerPosition?: string; // e.g., "center 25%" or "center" or percentage "center 30%"
  concluded: boolean;
  totalSeasons?: number;
  episodesPerSeason?: number[];
  isFavorite?: boolean;
  isBannerHidden?: boolean;
  isStarter?: boolean;
  redundancyVerified?: boolean;
  redundancyCheckedAt?: string;
  createdAt: string;
}

export interface User {
  id: string; // unique username, email or randomized ID
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface UserPreferences {
  genres: string[];
  actors: string[];
  directors: string[];
  services?: StreamingService[];
}

export interface AppNotification {
  id: string;
  senderName: string;
  senderAvatarUrl?: string;
  show: TvShow;
  message?: string;
  createdAt: string;
}

export interface Board {
  id: string;
  name: string;
  shows: TvShow[];
  preferences?: UserPreferences;
  updatedAt: string;
  owner?: User;
  notifications?: AppNotification[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}
