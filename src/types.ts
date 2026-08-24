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
  | 'Starz'
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
  episodes?: Record<string, string>; // Map of "S1E1" or "1-1" -> "Episode Title"
  episodeReviews?: Record<string, string>; // Map of "S1E1" -> "2-3 line VIP episode review text"
  isFavorite?: boolean;
  isBannerHidden?: boolean;
  hasAirDateReminder?: boolean;
  isStarter?: boolean;
  redundancyVerified?: boolean;
  redundancyCheckedAt?: string;
  updatedAt?: string;
  reviewUpdatedAt?: string;
  createdAt: string;
}

export interface User {
  id: string; // unique username, email or randomized ID
  name: string;
  email: string;
  avatarUrl?: string;
  isOnline?: boolean;
  isPro?: boolean;
  isAdmin?: boolean;
  isVip?: boolean;
  lastLoginAt?: string; // ISO string timestamp of last login
  lastActiveAt?: string; // ISO string timestamp of most recent activity
  totalTimeSpentSeconds?: number; // Total cumulative time spent active in the app
  sessionCount?: number; // Number of login sessions
  createdAt: string;
}

export interface UserPreferences {
  genres: string[];
  actors: string[];
  directors: string[];
  services?: StreamingService[];
  gender?: string;
  ageRange?: string;
  geography?: string;
  country?: string;
  stateRegion?: string;
  city?: string;
  timezone?: string;
  eras?: string[];
  vibes?: string[];
  favoriteShows?: string[];
  alertPreference?: 'email' | 'text';
  alertDestination?: string;
}

export interface AppNotification {
  id: string;
  type?: 'alert' | 'recommendation' | 'message';
  senderId?: string;
  senderName: string;
  senderAvatarUrl?: string;
  show?: TvShow;
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
  intent?: 'recap' | 'group_recommendation' | 'natural_search' | 'general_chat';
  cached?: boolean;
}

export type TaterzAIIntent = 'recap' | 'group_recommendation' | 'natural_search' | 'general_chat';

export interface TaterzAIRecapPayload {
  showId?: string;
  showTitle: string;
  showStatus?: string;
  targetSeason: number;
  targetEpisode: number;
  lastWatchedSeason?: number;
  lastWatchedEpisode?: number;
  overview?: string;
}

export interface TaterzAIGroupBuddy {
  id: string;
  name: string;
  avatarUrl?: string;
  topShows?: { title: string; rating?: number | null; streamingService?: string }[];
}

export interface TaterzAIGroupPayload {
  buddies: TaterzAIGroupBuddy[];
}

export interface TaterzAINaturalSearchPayload {
  prompt: string;
}

export interface TaterzAIRequestPayload {
  intent: TaterzAIIntent;
  recap?: TaterzAIRecapPayload;
  group?: TaterzAIGroupPayload;
  search?: TaterzAINaturalSearchPayload;
  customPrompt?: string;
  messages?: ChatMessage[];
  shows?: TvShow[];
  preferences?: UserPreferences;
  userState?: {
    isPro?: boolean;
    freeCreditsUsed?: number;
  };
}

export interface TaterzAIResponse {
  success: boolean;
  content: string;
  cached?: boolean;
  cacheKey?: string;
  freeCreditsUsed?: number;
  isLimitReached?: boolean;
  intent?: TaterzAIIntent;
  error?: string;
}

