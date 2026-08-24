/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User } from '../types';

export interface FriendRequestDetail {
  fromUserId: string;
  fromUserName?: string;
  fromUserAvatar?: string;
  message?: string;
  sentAt?: string;
}

export interface FriendsData {
  friends: string[]; // List of user IDs that are connected
  pendingSent: string[]; // Outgoing friend request target user IDs
  pendingReceived: (string | FriendRequestDetail)[]; // Incoming friend request source user IDs or details
}

const STORAGE_PREFIX = 'coughtater_friends_';

// Julio is everybody's friend on CouchTaterz!
export const JULIO_USER_ID = 'default';

export const CORE_BUDDY_IDS = [
  'user-kris-5139',
  'user-rafael-9639',
  'user-lily-9367',   // AnnaDee
  'user-lilyann-4290', // Lilyann
  'user-julian-7667',  // Julian
  'user-ejc-2841'      // EJC
];

export const getFriendsData = (userId: string): FriendsData => {
  if (!userId) {
    return { friends: [], pendingSent: [], pendingReceived: [] };
  }

  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
    if (raw) {
      const parsed: FriendsData = JSON.parse(raw);
      if (!Array.isArray(parsed.friends)) parsed.friends = [];
      if (!Array.isArray(parsed.pendingSent)) parsed.pendingSent = [];
      if (!Array.isArray(parsed.pendingReceived)) parsed.pendingReceived = [];
      return parsed;
    }
  } catch (e) {
    console.error('Error loading friends data:', e);
  }

  const defaultData: FriendsData = {
    friends: [],
    pendingSent: [],
    pendingReceived: []
  };

  saveFriendsData(userId, defaultData);
  return defaultData;
};

export const fetchFriendsDataAsync = async (userId: string): Promise<FriendsData> => {
  if (!userId) return getFriendsData(userId);

  try {
    const res = await fetch(`/api/friends/${encodeURIComponent(userId)}`);
    if (res.ok) {
      const serverData: FriendsData = await res.json();
      if (!Array.isArray(serverData.friends)) serverData.friends = [];
      if (!Array.isArray(serverData.pendingSent)) serverData.pendingSent = [];
      if (!Array.isArray(serverData.pendingReceived)) serverData.pendingReceived = [];

      const mergedData: FriendsData = {
        friends: serverData.friends.filter(id => id !== userId),
        pendingSent: serverData.pendingSent,
        pendingReceived: serverData.pendingReceived
      };

      saveFriendsData(userId, mergedData);
      return mergedData;
    }
  } catch (e) {
    console.error('Error fetching friends data from server:', e);
  }

  return getFriendsData(userId);
};

export const saveFriendsData = (userId: string, data: FriendsData): void => {
  if (!userId) return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving friends data:', e);
  }
};

const isGuestId = (id?: string) => !id || id === 'guest-demo' || id.startsWith('guest');

/**
 * Sends a friend request from current user to target user
 */
export const sendFriendRequest = (
  fromUser: { id: string; name: string; avatarUrl?: string }, 
  toUser: { id: string; name: string; avatarUrl?: string },
  message?: string
): void => {
  const fromUserId = fromUser.id;
  const toUserId = toUser.id;

  if (!fromUserId || !toUserId || fromUserId === toUserId) return;

  // Update sender's pendingSent
  const senderData = getFriendsData(fromUserId);
  if (!senderData.pendingSent.includes(toUserId) && !senderData.friends.includes(toUserId)) {
    senderData.pendingSent.push(toUserId);
    saveFriendsData(fromUserId, senderData);
  }

  // If sender or recipient is guest/demo, do not alter target real user's state or post to backend
  if (isGuestId(fromUserId) || isGuestId(toUserId)) {
    return;
  }

  // Update recipient's pendingReceived
  const recipientData = getFriendsData(toUserId);
  const existingIdx = recipientData.pendingReceived.findIndex(item => 
    typeof item === 'string' ? item === fromUserId : item.fromUserId === fromUserId
  );

  if (existingIdx === -1 && !recipientData.friends.includes(fromUserId)) {
    recipientData.pendingReceived.push({
      fromUserId,
      fromUserName: fromUser.name,
      fromUserAvatar: fromUser.avatarUrl,
      message,
      sentAt: new Date().toISOString()
    });
    saveFriendsData(toUserId, recipientData);
  }

  // Sync with server
  fetch('/api/friends/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fromUserId,
      toUserId,
      fromUserName: fromUser.name,
      fromUserAvatar: fromUser.avatarUrl,
      message
    })
  }).catch(() => {});
};

/**
 * Responds to a friend request (accept / reject / cancel / unfriend)
 */
export const respondToFriendRequest = (
  userId: string,
  targetUserId: string,
  action: 'accept' | 'reject' | 'cancel' | 'unfriend',
  replyMessage?: string
): void => {
  if (!userId || !targetUserId) return;

  const userData = getFriendsData(userId);

  // If either user is guest/demo, only update local demo state for the acting user
  if (isGuestId(userId) || isGuestId(targetUserId)) {
    if (isGuestId(userId)) {
      if (action === 'accept') {
        if (!userData.friends.includes(targetUserId)) userData.friends.push(targetUserId);
        userData.pendingReceived = userData.pendingReceived.filter(item => 
          (typeof item === 'string' ? item : item.fromUserId) !== targetUserId
        );
        userData.pendingSent = userData.pendingSent.filter(id => id !== targetUserId);
      } else if (action === 'reject') {
        userData.pendingReceived = userData.pendingReceived.filter(item => 
          (typeof item === 'string' ? item : item.fromUserId) !== targetUserId
        );
      } else if (action === 'cancel') {
        userData.pendingSent = userData.pendingSent.filter(id => id !== targetUserId);
      } else if (action === 'unfriend') {
        userData.friends = userData.friends.filter(id => id !== targetUserId);
      }
      saveFriendsData(userId, userData);
    }
    return;
  }

  const targetData = getFriendsData(targetUserId);

  if (action === 'accept') {
    // Add to friends for both
    if (!userData.friends.includes(targetUserId)) userData.friends.push(targetUserId);
    if (!targetData.friends.includes(userId)) targetData.friends.push(userId);

    // Remove from pending
    userData.pendingReceived = userData.pendingReceived.filter(item => 
      (typeof item === 'string' ? item : item.fromUserId) !== targetUserId
    );
    userData.pendingSent = userData.pendingSent.filter(id => id !== targetUserId);

    targetData.pendingReceived = targetData.pendingReceived.filter(item => 
      (typeof item === 'string' ? item : item.fromUserId) !== userId
    );
    targetData.pendingSent = targetData.pendingSent.filter(id => id !== userId);
  } else if (action === 'reject') {
    userData.pendingReceived = userData.pendingReceived.filter(item => 
      (typeof item === 'string' ? item : item.fromUserId) !== targetUserId
    );
    targetData.pendingSent = targetData.pendingSent.filter(id => id !== userId);
  } else if (action === 'cancel') {
    userData.pendingSent = userData.pendingSent.filter(id => id !== targetUserId);
    targetData.pendingReceived = targetData.pendingReceived.filter(item => 
      (typeof item === 'string' ? item : item.fromUserId) !== userId
    );
  } else if (action === 'unfriend') {
    userData.friends = userData.friends.filter(id => id !== targetUserId);
    targetData.friends = targetData.friends.filter(id => id !== userId);
  }

  saveFriendsData(userId, userData);
  saveFriendsData(targetUserId, targetData);

  // Sync with server
  fetch('/api/friends/respond', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, targetUserId, action, replyMessage })
  }).catch(() => {});
};

/**
 * Automatically connects two users as friends (e.g., via invite link)
 */
export const autoConnectUsers = (user1Id: string, user2Id: string): void => {
  if (!user1Id || !user2Id || user1Id === user2Id) return;

  const u1Data = getFriendsData(user1Id);

  if (isGuestId(user1Id) || isGuestId(user2Id)) {
    if (isGuestId(user1Id)) {
      if (!u1Data.friends.includes(user2Id)) u1Data.friends.push(user2Id);
      u1Data.pendingSent = u1Data.pendingSent.filter(id => id !== user2Id);
      u1Data.pendingReceived = u1Data.pendingReceived.filter(item => (typeof item === 'string' ? item : item.fromUserId) !== user2Id);
      saveFriendsData(user1Id, u1Data);
    }
    return;
  }

  const u2Data = getFriendsData(user2Id);

  if (!u1Data.friends.includes(user2Id)) u1Data.friends.push(user2Id);
  if (!u2Data.friends.includes(user1Id)) u2Data.friends.push(user1Id);

  u1Data.pendingSent = u1Data.pendingSent.filter(id => id !== user2Id);
  u1Data.pendingReceived = u1Data.pendingReceived.filter(id => id !== user2Id);

  u2Data.pendingSent = u2Data.pendingSent.filter(id => id !== user1Id);
  u2Data.pendingReceived = u2Data.pendingReceived.filter(id => id !== user1Id);

  saveFriendsData(user1Id, u1Data);
  saveFriendsData(user2Id, u2Data);

  // Sync with server
  fetch('/api/friends/connect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user1Id, user2Id })
  }).catch(() => {});
};
