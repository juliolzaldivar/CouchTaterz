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
  airTime?: string; // e.g., "21:00" or "9:00 PM"
  overview?: string; // Optional upcoming episode overview/summary
  summary?: string; // Optional upcoming episode summary/description
}

export interface TvShow {
  id: string;
  title: string;
  streamingService: StreamingService;
  services?: StreamingService[];
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
  episodeScores?: Record<string, number>; // Map of "S1E1" -> 1-10 rating
  isFavorite?: boolean;
  isFandomActive?: boolean;
  fandomJoinedAt?: string;
  isBannerHidden?: boolean;
  hasAirDateReminder?: boolean;
  isStarter?: boolean;
  redundancyVerified?: boolean;
  redundancyCheckedAt?: string;
  metadataAuditedAt?: string;
  metadataAuditStatus?: 'verified' | 'updated' | 'error';
  updatedAt?: string;
  statusUpdatedAt?: string;
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
  vipPlan?: 'monthly' | 'lifetime' | 'annual' | 'tester' | 'free';
  vipSince?: string;
  subscriptionStatus?: 'active' | 'cancelled' | 'expired' | 'past_due' | 'unpaid' | 'inactive';
  subscriptionRenewsAt?: string;
  lemonSqueezyOrderId?: string;
  lemonSqueezySubscriptionId?: string;
  lemonSqueezyCustomerPortalUrl?: string;
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
  notificationLeadDays?: number; // Days in advance to receive air date notifications & countdowns (default: 30)
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
  dismissedNotificationIds?: string[];
  dismissedAlertKeys?: string[];
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
    email?: string;
    userId?: string;
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

export type BugReportCategory = 'bug' | 'feature_request' | 'ui_confusing' | 'other';
export type BugReportSeverity = 'low' | 'medium' | 'high' | 'critical';
export type BugReportStatus = 'new' | 'investigating' | 'resolved' | 'dismissed';

export interface BugReport {
  id: string;
  category: BugReportCategory;
  title: string;
  description: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  severity: BugReportSeverity;
  status: BugReportStatus;
  userId?: string;
  userName?: string;
  userEmail?: string;
  currentRoute?: string;
  browserInfo?: string;
  screenResolution?: string;
  createdAt: string;
  updatedAt?: string;
  adminNotes?: string;
}

export interface SharedWatchlistCollaborator {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  role: 'owner' | 'editor' | 'viewer';
  isVip?: boolean;
  joinedAt?: string;
}

export interface SharedWatchlistShow {
  id: string;
  title: string;
  streamingService: string;
  bannerImage?: string;
  genres?: string[];
  status?: 'Watching' | 'Backlog' | 'Completed';
  addedByUserId: string;
  addedByUserName: string;
  addedAt: string;
  targetSeason?: number;
  targetEpisode?: number;
  totalEpisodes?: number;
  notes?: string;
  votes?: Record<string, number>; // userId -> rating (1-5) or vote (1)
}

export interface SharedWatchlistActivity {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  action: string;
  showTitle?: string;
  timestamp: string;
}

export interface SharedVipWatchlist {
  id: string;
  title: string;
  description?: string;
  badge?: string; // e.g. '👑 VIP Shared', '🔥 Binge Squad', '🍿 Movie Night', '✨ Curated'
  themeColor?: string;
  createdById: string;
  createdByName: string;
  createdByAvatarUrl?: string;
  isVipExclusive: boolean;
  collaboratorIds: string[];
  collaborators: SharedWatchlistCollaborator[];
  shows: SharedWatchlistShow[];
  activityFeed?: SharedWatchlistActivity[];
  createdAt: string;
  updatedAt: string;
}

export interface FandomTake {
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  episodeKey?: string;
  reviewText: string;
  score?: number;
  createdAt?: string;
}

export interface FandomMember {
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  status: ShowStatus;
  latestWatched?: WatchedEpisode;
  userScore?: number | null;
  userNotes?: string;
  episodeReviewsCount: number;
  recentTake?: string;
  isOnline?: boolean;
  activityScore: number;
  totalShowsTracked?: number;
}

export interface ShowFandom {
  showTitle: string;
  normalizedTitle: string;
  streamingService?: StreamingService;
  bannerImage?: string;
  memberCount: number;
  members: FandomMember[];
  topTenMembers: FandomMember[];
  avgRating: number | null;
  totalReviewsCount: number;
  recentTakes: FandomTake[];
  isUserJoined?: boolean;
}




