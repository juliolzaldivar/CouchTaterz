/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SharedVipWatchlist, SharedWatchlistShow, SharedWatchlistCollaborator } from '../types';

const LOCAL_STORAGE_KEY = 'couchtaterz_shared_vip_watchlists';

/**
 * Reads locally cached shared watchlists as fallback
 */
export function getLocalSharedWatchlists(): SharedVipWatchlist[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn("Could not read local shared watchlists:", e);
  }
  return [];
}

/**
 * Saves shared watchlists to local storage cache
 */
export function saveLocalSharedWatchlists(lists: SharedVipWatchlist[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lists));
  } catch (e) {
    console.warn("Could not cache shared watchlists locally:", e);
  }
}

/**
 * Fetches all shared VIP watchlists accessible by the user
 */
export async function fetchSharedWatchlists(userId?: string): Promise<SharedVipWatchlist[]> {
  const effectiveUserId = userId || 'default';
  try {
    const res = await fetch(`/api/shared-watchlists?userId=${encodeURIComponent(effectiveUserId)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      saveLocalSharedWatchlists(data);
      return data;
    }
  } catch (err) {
    console.warn("[SharedWatchlists] Server fetch failed, using local cache:", err);
  }
  return getLocalSharedWatchlists();
}

/**
 * Creates a new Shared VIP Buddy Watchlist
 */
export async function createSharedWatchlist(payload: {
  title: string;
  description?: string;
  badge?: string;
  themeColor?: string;
  createdById: string;
  createdByName: string;
  createdByAvatarUrl?: string;
  collaborators: Array<{ id: string; name: string; avatarUrl?: string; email?: string; role?: 'editor' | 'viewer'; isVip?: boolean }>;
  initialShows?: Array<Partial<SharedWatchlistShow>>;
}): Promise<SharedVipWatchlist | null> {
  try {
    const res = await fetch('/api/shared-watchlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const newList: SharedVipWatchlist = await res.json();
    
    // Update local cache
    const current = getLocalSharedWatchlists();
    const updated = [newList, ...current.filter(l => l.id !== newList.id)];
    saveLocalSharedWatchlists(updated);
    
    return newList;
  } catch (err) {
    console.error("[SharedWatchlists] Create failed:", err);
    // Local fallback creation
    const fallbackList: SharedVipWatchlist = {
      id: `vip_wl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: payload.title,
      description: payload.description || '',
      badge: payload.badge || '👑 VIP Shared',
      themeColor: payload.themeColor || 'amber',
      createdById: payload.createdById,
      createdByName: payload.createdByName,
      createdByAvatarUrl: payload.createdByAvatarUrl,
      isVipExclusive: true,
      collaboratorIds: [payload.createdById, ...payload.collaborators.map(c => c.id)],
      collaborators: [
        {
          id: payload.createdById,
          name: payload.createdByName,
          avatarUrl: payload.createdByAvatarUrl,
          role: 'owner',
          isVip: true,
          joinedAt: new Date().toISOString()
        },
        ...payload.collaborators.map(c => ({
          id: c.id,
          name: c.name,
          avatarUrl: c.avatarUrl,
          email: c.email,
          role: c.role || ('editor' as const),
          isVip: Boolean(c.isVip),
          joinedAt: new Date().toISOString()
        }))
      ],
      shows: (payload.initialShows || []).map((s, idx) => ({
        id: s.id || `show_${Date.now()}_${idx}`,
        title: s.title || 'Untitled Show',
        streamingService: s.streamingService || 'Other',
        bannerImage: s.bannerImage,
        genres: s.genres || [],
        status: s.status || 'Watching',
        addedByUserId: payload.createdById,
        addedByUserName: payload.createdByName,
        addedAt: new Date().toISOString(),
        targetSeason: s.targetSeason || 1,
        targetEpisode: s.targetEpisode || 1,
        votes: {}
      })),
      activityFeed: [{
        id: `act_${Date.now()}`,
        userId: payload.createdById,
        userName: payload.createdByName,
        userAvatarUrl: payload.createdByAvatarUrl,
        action: 'created the VIP Shared Watchlist',
        timestamp: new Date().toISOString()
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const current = getLocalSharedWatchlists();
    saveLocalSharedWatchlists([fallbackList, ...current]);
    return fallbackList;
  }
}

/**
 * Updates a shared watchlist (details, collaborators, or shows)
 */
export async function updateSharedWatchlist(
  listId: string, 
  updates: Partial<SharedVipWatchlist> & { updatedBy?: { id: string; name: string } }
): Promise<SharedVipWatchlist | null> {
  try {
    const res = await fetch(`/api/shared-watchlists/${listId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const updated: SharedVipWatchlist = await res.json();
    
    const current = getLocalSharedWatchlists();
    const next = current.map(l => l.id === listId ? updated : l);
    saveLocalSharedWatchlists(next);
    
    return updated;
  } catch (err) {
    console.error("[SharedWatchlists] Update failed:", err);
    return null;
  }
}

/**
 * Adds a show to a Shared VIP Watchlist
 */
export async function addShowToSharedWatchlist(
  listId: string,
  show: {
    title: string;
    streamingService?: string;
    bannerImage?: string;
    genres?: string[];
    status?: 'Watching' | 'Backlog' | 'Completed';
    addedByUserId: string;
    addedByUserName: string;
    notes?: string;
  }
): Promise<SharedVipWatchlist | null> {
  try {
    const res = await fetch(`/api/shared-watchlists/${listId}/shows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(show)
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const updated: SharedVipWatchlist = await res.json();
    
    const current = getLocalSharedWatchlists();
    const next = current.map(l => l.id === listId ? updated : l);
    saveLocalSharedWatchlists(next);

    return updated;
  } catch (err) {
    console.error("[SharedWatchlists] Add show failed:", err);
    return null;
  }
}

/**
 * Removes a show from a Shared VIP Watchlist
 */
export async function removeShowFromSharedWatchlist(
  listId: string,
  showId: string,
  removedBy?: { id: string; name: string }
): Promise<SharedVipWatchlist | null> {
  try {
    const res = await fetch(`/api/shared-watchlists/${listId}/shows/${showId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ removedBy })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const updated: SharedVipWatchlist = await res.json();
    
    const current = getLocalSharedWatchlists();
    const next = current.map(l => l.id === listId ? updated : l);
    saveLocalSharedWatchlists(next);

    return updated;
  } catch (err) {
    console.error("[SharedWatchlists] Remove show failed:", err);
    return null;
  }
}

/**
 * Submits a vote/rating for a show in a Shared VIP Watchlist
 */
export async function voteOnSharedWatchlistShow(
  listId: string,
  showId: string,
  userId: string,
  userName: string,
  voteValue: number
): Promise<SharedVipWatchlist | null> {
  try {
    const res = await fetch(`/api/shared-watchlists/${listId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ showId, userId, userName, voteValue })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const updated: SharedVipWatchlist = await res.json();
    
    const current = getLocalSharedWatchlists();
    const next = current.map(l => l.id === listId ? updated : l);
    saveLocalSharedWatchlists(next);

    return updated;
  } catch (err) {
    console.error("[SharedWatchlists] Vote failed:", err);
    return null;
  }
}

/**
 * Deletes a Shared VIP Watchlist
 */
export async function deleteSharedWatchlist(
  listId: string,
  userId: string
): Promise<boolean> {
  try {
    const res = await fetch(`/api/shared-watchlists/${listId}?userId=${encodeURIComponent(userId)}`, {
      method: 'DELETE'
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const current = getLocalSharedWatchlists();
    const next = current.filter(l => l.id !== listId);
    saveLocalSharedWatchlists(next);

    return true;
  } catch (err) {
    console.error("[SharedWatchlists] Delete failed:", err);
    return false;
  }
}
