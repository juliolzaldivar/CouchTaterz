/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { doc, getDoc, setDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { Board, User } from '../types';
import { sanitizeBoardForUser } from './reviewSanitizer';

const STORAGE_PREFIX = 'couchtater_board_';

// Client-side Firestore Quota & Error Circuit Breaker
let isFirestoreQuotaExhausted = false;
let quotaBackoffUntil = 0;

export function isQuotaExhausted(): boolean {
  return isFirestoreQuotaExhausted || Date.now() < quotaBackoffUntil;
}

function isQuotaError(err: any): boolean {
  if (!err) return false;
  const msg = (err?.message || err?.toString() || '').toLowerCase();
  const code = (err?.code || '').toLowerCase();
  return (
    code === 'resource-exhausted' ||
    code.includes('resource-exhausted') ||
    code === '8' ||
    msg.includes('quota limit exceeded') ||
    msg.includes('resource-exhausted') ||
    msg.includes('resource_exhausted') ||
    msg.includes('free daily write units') ||
    msg.includes('free daily read units') ||
    msg.includes('quota exceeded')
  );
}

function isOfflineError(err: any): boolean {
  if (!err) return false;
  const msg = (err?.message || err?.toString() || '').toLowerCase();
  const code = (err?.code || '').toLowerCase();
  return (
    code === 'unavailable' ||
    code.includes('offline') ||
    msg.includes('client is offline') ||
    msg.includes('failed to get document because the client is offline') ||
    msg.includes('network request failed') ||
    msg.includes('failed to fetch')
  );
}

function handleFirestoreError(err: any, opName: string) {
  if (isQuotaError(err)) {
    // Free tier daily limit reached: back off for 1 hour to prevent flooding the backend and spamming errors
    quotaBackoffUntil = Date.now() + 3600000;
    if (!isFirestoreQuotaExhausted) {
      isFirestoreQuotaExhausted = true;
      console.warn(`[Firestore Client] Daily write/read quota reached during ${opName}. Seamlessly operating in high-speed local storage & server mode.`);
    }
  } else if (isOfflineError(err)) {
    // Graceful silent fallback to local storage mode when network/client is offline
  } else {
    console.warn(`[Firestore Client] ${opName} note:`, err?.message || err);
  }
}

/**
 * Strips circular references or non-serializable fields before sending to Firestore
 */
function sanitizeForFirestore(data: any): any {
  if (data === null || data === undefined) return null;
  const cleaned = JSON.parse(JSON.stringify(data));
  return cleaned;
}

/**
 * Fetch a board directly from Firebase Firestore (client-side)
 */
export async function getBoardFromFirestore(boardId: string): Promise<Board | null> {
  if (!boardId || isFirestoreQuotaExhausted || Date.now() < quotaBackoffUntil) return null;
  try {
    const docRef = doc(db, 'boards', boardId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const b = docSnap.data() as Board;
      return sanitizeBoardForUser(b).board;
    }
  } catch (err: any) {
    handleFirestoreError(err, `getBoard(${boardId})`);
  }
  return null;
}

/**
 * Save a board directly to Firebase Firestore (client-side)
 */
export async function saveBoardToFirestore(board: Board): Promise<boolean> {
  if (!board || !board.id || isFirestoreQuotaExhausted || Date.now() < quotaBackoffUntil) return false;
  try {
    const docRef = doc(db, 'boards', board.id);
    const cleanData = sanitizeForFirestore({
      ...board,
      updatedAt: new Date().toISOString()
    });
    await setDoc(docRef, cleanData, { merge: true });
    return true;
  } catch (err: any) {
    handleFirestoreError(err, `saveBoard(${board.id})`);
    return false;
  }
}

/**
 * Fetch all boards from Firebase Firestore (client-side)
 */
export async function getAllBoardsFromFirestore(): Promise<Record<string, Board>> {
  const result: Record<string, Board> = {};
  if (isFirestoreQuotaExhausted || Date.now() < quotaBackoffUntil) return result;
  try {
    const querySnapshot = await getDocs(collection(db, 'boards'));
    querySnapshot.forEach((d) => {
      if (d.exists()) {
        const b = d.data() as Board;
        if (b && b.id) {
          result[b.id] = sanitizeBoardForUser(b).board;
        }
      }
    });
  } catch (err: any) {
    handleFirestoreError(err, 'getAllBoards');
  }
  return result;
}

/**
 * Fetch all registered users from Firebase Firestore (client-side)
 */
export async function getAllUsersFromFirestore(): Promise<User[]> {
  const users: User[] = [];
  if (isFirestoreQuotaExhausted || Date.now() < quotaBackoffUntil) return users;
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    querySnapshot.forEach((d) => {
      if (d.exists()) {
        const u = d.data() as User;
        if (u && u.id) {
          users.push(u);
        }
      }
    });
  } catch (err: any) {
    handleFirestoreError(err, 'getAllUsers');
  }
  return users;
}

/**
 * Save user profile directly to Firebase Firestore
 */
export async function saveUserToFirestore(user: User): Promise<boolean> {
  if (!user || !user.id || isFirestoreQuotaExhausted || Date.now() < quotaBackoffUntil) return false;
  try {
    const docRef = doc(db, 'users', user.id);
    await setDoc(docRef, sanitizeForFirestore(user), { merge: true });
    return true;
  } catch (err: any) {
    handleFirestoreError(err, `saveUser(${user.id})`);
    return false;
  }
}

/**
 * Retrieve cached board from browser localStorage synchronously (zero latency)
 */
export function getCachedBoard(boardId: string): Board | null {
  if (!boardId) return null;
  const keysToTry = [
    `${STORAGE_PREFIX}${boardId}`,
    `couchtater_board_${boardId}`,
    `couchtaterz_board_${boardId}`,
    `taterz_board_${boardId}`
  ];
  if (boardId === 'default' || boardId === 'user-julio') {
    keysToTry.push('couch_taterz_board', 'couchtater_board_default');
  }

  for (const key of keysToTry) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.shows)) {
          // If this is Julio's / default board and has 15 or fewer shows (stale seed cache),
          // treat as empty so we fetch the complete 230+ master library from the server.
          if ((boardId === 'default' || boardId === 'user-julio') && parsed.shows.length <= 15) {
            continue;
          }
          return sanitizeBoardForUser(parsed).board;
        }
      }
    } catch {}
  }
  return null;
}

/**
 * Resilient Board Loader for Vercel and Hybrid Deployments
 * 1. Fast Server API fetch
 * 2. Falls back to direct Firestore database
 * 3. Falls back to localStorage cache
 */
export async function resilientFetchBoard(boardId: string, options?: { preferCache?: boolean }): Promise<Board | null> {
  if (!boardId) return null;

  // 1. Try local cache first for instant synchronous return check
  const cachedBoard = getCachedBoard(boardId);
  const isJulioOrDefault = boardId === 'default' || boardId === 'user-julio';
  
  if (options?.preferCache && cachedBoard && (!isJulioOrDefault || cachedBoard.shows.length > 50)) {
    // Return cached immediately and refresh in background
    fetch(`/api/boards?id=${encodeURIComponent(boardId)}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && Array.isArray(data.shows)) {
          localStorage.setItem(`${STORAGE_PREFIX}${boardId}`, JSON.stringify(data));
          localStorage.setItem(`couchtater_board_${boardId}`, JSON.stringify(data));
        }
      })
      .catch(() => {});
    return cachedBoard;
  }

  // 2. Try server API with generous timeout for large libraries
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(`/api/boards?id=${encodeURIComponent(boardId)}`, {
      signal: controller.signal
    });
    clearTimeout(timer);
    const contentType = res.headers.get('content-type');
    if (res.ok && contentType && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && Array.isArray(data.shows)) {
        localStorage.setItem(`${STORAGE_PREFIX}${boardId}`, JSON.stringify(data));
        localStorage.setItem(`couchtater_board_${boardId}`, JSON.stringify(data));
        return data;
      }
    }
  } catch (apiErr) {
    // API failed or timeout reached
  }

  // 3. Fallback to direct Firestore (if quota not exhausted)
  if (!isFirestoreQuotaExhausted && Date.now() >= quotaBackoffUntil) {
    try {
      const firestoreBoard = await getBoardFromFirestore(boardId);
      if (firestoreBoard && Array.isArray(firestoreBoard.shows)) {
        localStorage.setItem(`${STORAGE_PREFIX}${boardId}`, JSON.stringify(firestoreBoard));
        localStorage.setItem(`couchtater_board_${boardId}`, JSON.stringify(firestoreBoard));
        return firestoreBoard;
      }
    } catch (fsErr) {
      handleFirestoreError(fsErr, `resilientFetch(${boardId})`);
    }
  }

  // 4. Return cached board from localStorage if available
  if (cachedBoard) {
    return cachedBoard;
  }

  return null;
}

/**
 * Resilient Board Saver for Vercel and Hybrid Deployments
 * Saves to localStorage immediately + optional Server API / Firestore
 */
export async function resilientSaveBoard(board: Board): Promise<void> {
  if (!board || !board.id) return;

  const sanitized = sanitizeBoardForUser(board).board;
  const nowIso = new Date().toISOString();
  const updatedBoard: Board = {
    ...sanitized,
    updatedAt: nowIso
  };

  // 1. Instant local persistence
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${board.id}`, JSON.stringify(updatedBoard));
  } catch (e) {}

  // 2. Server API Write (non-blocking, primary in full-stack)
  let serverSaved = false;
  try {
    const res = await fetch('/api/boards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': board.owner?.email || '',
        'X-User-Id': board.owner?.id || board.id
      },
      body: JSON.stringify(updatedBoard)
    });
    if (res.ok) {
      serverSaved = true;
    }
  } catch {
    // Gracefully ignore on static Vercel deployments
  }

  // 3. Direct Firestore Cloud Write only if server API was not reached (e.g. standalone Vercel client)
  if (!serverSaved && !isFirestoreQuotaExhausted && Date.now() >= quotaBackoffUntil) {
    saveBoardToFirestore(updatedBoard).catch((err) => {
      handleFirestoreError(err, `resilientSave(${board.id})`);
    });
  }
}
