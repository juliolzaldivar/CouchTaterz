import { db, checkCloudSqlConnection } from './index.ts';
import { boards, friends, users, merchandise } from './schema.ts';
import { eq, ilike } from 'drizzle-orm';

export interface BoardData {
  id: string;
  name: string;
  owner?: any;
  preferences?: any;
  shows: any[];
  updatedAt?: string;
}

export interface FriendsRecord {
  friends: string[];
  pendingSent: string[];
  pendingReceived: any[];
}

export interface MerchandiseItem {
  id: string;
  showTitle: string;
  category: 'books' | 'clothing' | 'collectibles';
  title: string;
  price: string;
  rating?: string;
  imageUrl: string;
  amazonUrl: string;
  badge?: string;
  description?: string;
  updatedAt?: string;
}

function sanitizeJson(val: any): any {
  if (val === undefined || val === null) return null;
  try {
    return JSON.parse(JSON.stringify(val));
  } catch (e) {
    return null;
  }
}

export async function deleteBoardFromCloudSql(boardId: string): Promise<void> {
  if (!process.env.SQL_HOST) return;
  const isUp = await checkCloudSqlConnection();
  if (!isUp) return;
  try {
    await db.delete(boards).where(eq(boards.id, boardId));
  } catch (error) {
    console.error(`[Cloud SQL] Error deleting board ${boardId}:`, error);
  }
}

export async function deleteFriendsFromCloudSql(userId: string): Promise<void> {
  if (!process.env.SQL_HOST) return;
  const isUp = await checkCloudSqlConnection();
  if (!isUp) return;
  try {
    await db.delete(friends).where(eq(friends.userId, userId));
  } catch (error) {
    console.error(`[Cloud SQL] Error deleting friends for ${userId}:`, error);
  }
}

export async function saveBoardToCloudSql(boardId: string, board: BoardData): Promise<void> {
  if (!process.env.SQL_HOST) return;
  const isUp = await checkCloudSqlConnection();
  if (!isUp) return;

  const execute = async () => {
    const payload = {
      id: boardId,
      name: board.name || 'My Collection',
      owner: board.owner ? sanitizeJson(board.owner) : null,
      preferences: board.preferences ? sanitizeJson(board.preferences) : null,
      shows: Array.isArray(board.shows) ? sanitizeJson(board.shows) : [],
      updatedAt: new Date(),
    };

    await db.insert(boards)
      .values(payload)
      .onConflictDoUpdate({
        target: boards.id,
        set: {
          name: payload.name,
          owner: payload.owner,
          preferences: payload.preferences,
          shows: payload.shows,
          updatedAt: payload.updatedAt,
        },
      });
  };

  try {
    await execute();
  } catch (error: any) {
    const isConnErr = error?.code === 'EPIPE' || error?.code === 'ECONNRESET' || error?.message?.includes('EPIPE') || error?.message?.includes('ECONNRESET');
    if (isConnErr) {
      try {
        await new Promise(r => setTimeout(r, 100));
        await execute();
        return;
      } catch (retryErr: any) {
        console.warn(`[Cloud SQL] Save board retry failed for ${boardId}:`, retryErr?.message || retryErr);
        return;
      }
    }
    console.error(`[Cloud SQL] Error saving board ${boardId}:`, error?.message || error, error?.cause || '');
  }
}

export async function getAllBoardsFromCloudSql(): Promise<Record<string, BoardData> | null> {
  if (!process.env.SQL_HOST) return null;
  const isUp = await checkCloudSqlConnection();
  if (!isUp) return null;

  try {
    const result = await db.select().from(boards);
    if (!result || result.length === 0) return null;
    
    const dbMap: Record<string, BoardData> = {};
    for (const row of result) {
      dbMap[row.id] = {
        id: row.id,
        name: row.name,
        owner: row.owner,
        preferences: row.preferences,
        shows: (row.shows as any[]) || [],
        updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : undefined,
      };
    }
    return dbMap;
  } catch (error) {
    console.error('[Cloud SQL] Error fetching boards:', error);
    return null;
  }
}

export async function saveFriendsToCloudSql(userId: string, record: FriendsRecord): Promise<void> {
  if (!process.env.SQL_HOST) return;
  const isUp = await checkCloudSqlConnection();
  if (!isUp) return;

  const execute = async () => {
    const payload = {
      userId,
      friendsList: Array.isArray(record.friends) ? sanitizeJson(record.friends) : [],
      pendingSent: Array.isArray(record.pendingSent) ? sanitizeJson(record.pendingSent) : [],
      pendingReceived: Array.isArray(record.pendingReceived) ? sanitizeJson(record.pendingReceived) : [],
      updatedAt: new Date(),
    };

    await db.insert(friends)
      .values(payload)
      .onConflictDoUpdate({
        target: friends.userId,
        set: {
          friendsList: payload.friendsList,
          pendingSent: payload.pendingSent,
          pendingReceived: payload.pendingReceived,
          updatedAt: payload.updatedAt,
        },
      });
  };

  try {
    await execute();
  } catch (error: any) {
    const isConnErr = error?.code === 'EPIPE' || error?.code === 'ECONNRESET' || error?.message?.includes('EPIPE') || error?.message?.includes('ECONNRESET');
    if (isConnErr) {
      // Retry once after connection reset
      try {
        await new Promise(r => setTimeout(r, 100));
        await execute();
        return;
      } catch (retryErr: any) {
        console.warn(`[Cloud SQL] Save friends retry failed for ${userId}:`, retryErr?.message || retryErr);
        return;
      }
    }
    console.error(`[Cloud SQL] Error saving friends for ${userId}:`, error?.message || error, error?.cause || '');
  }
}

export async function getAllFriendsFromCloudSql(): Promise<Record<string, FriendsRecord> | null> {
  if (!process.env.SQL_HOST) return null;
  const isUp = await checkCloudSqlConnection();
  if (!isUp) return null;

  try {
    const result = await db.select().from(friends);
    if (!result || result.length === 0) return null;

    const friendsMap: Record<string, FriendsRecord> = {};
    for (const row of result) {
      friendsMap[row.userId] = {
        friends: (row.friendsList as string[]) || [],
        pendingSent: (row.pendingSent as string[]) || [],
        pendingReceived: (row.pendingReceived as any[]) || [],
      };
    }
    return friendsMap;
  } catch (error) {
    console.error('[Cloud SQL] Error fetching friends records:', error);
    return null;
  }
}

export async function saveMerchandiseItemToCloudSql(item: MerchandiseItem): Promise<void> {
  if (!process.env.SQL_HOST) return;
  const isUp = await checkCloudSqlConnection();
  if (!isUp) return;

  const execute = async () => {
    const payload = {
      id: item.id,
      showTitle: item.showTitle,
      category: item.category,
      title: item.title,
      price: item.price,
      rating: item.rating || '4.8',
      imageUrl: item.imageUrl,
      amazonUrl: item.amazonUrl,
      badge: item.badge || null,
      description: item.description || null,
      updatedAt: new Date(),
    };

    await db.insert(merchandise)
      .values(payload)
      .onConflictDoUpdate({
        target: merchandise.id,
        set: {
          showTitle: payload.showTitle,
          category: payload.category,
          title: payload.title,
          price: payload.price,
          rating: payload.rating,
          imageUrl: payload.imageUrl,
          amazonUrl: payload.amazonUrl,
          badge: payload.badge,
          description: payload.description,
          updatedAt: payload.updatedAt,
        },
      });
  };

  try {
    await execute();
  } catch (error: any) {
    const isConnErr = error?.code === 'EPIPE' || error?.code === 'ECONNRESET' || error?.message?.includes('EPIPE') || error?.message?.includes('ECONNRESET');
    if (isConnErr) {
      try {
        await new Promise(r => setTimeout(r, 100));
        await execute();
        return;
      } catch (retryErr: any) {
        return;
      }
    }
    console.warn(`[Cloud SQL] Non-critical warning saving merchandise item ${item.id}:`, error?.message || error);
  }
}

export async function getMerchandiseForShowFromCloudSql(showTitle: string): Promise<MerchandiseItem[] | null> {
  if (!process.env.SQL_HOST) return null;
  const isUp = await checkCloudSqlConnection();
  if (!isUp) return null;

  try {
    const result = await db.select().from(merchandise).where(ilike(merchandise.showTitle, `%${showTitle}%`));
    if (!result) return null;
    return result.map(row => ({
      id: row.id,
      showTitle: row.showTitle,
      category: row.category as any,
      title: row.title,
      price: row.price,
      rating: row.rating || undefined,
      imageUrl: row.imageUrl,
      amazonUrl: row.amazonUrl,
      badge: row.badge || undefined,
      description: row.description || undefined,
      updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : undefined,
    }));
  } catch (error) {
    console.error(`[Cloud SQL] Error fetching merchandise for ${showTitle}:`, error);
    return null;
  }
}

export async function getAllMerchandiseFromCloudSql(): Promise<MerchandiseItem[] | null> {
  if (!process.env.SQL_HOST) return null;
  const isUp = await checkCloudSqlConnection();
  if (!isUp) return null;

  try {
    const result = await db.select().from(merchandise);
    if (!result) return null;
    return result.map(row => ({
      id: row.id,
      showTitle: row.showTitle,
      category: row.category as any,
      title: row.title,
      price: row.price,
      rating: row.rating || undefined,
      imageUrl: row.imageUrl,
      amazonUrl: row.amazonUrl,
      badge: row.badge || undefined,
      description: row.description || undefined,
      updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : undefined,
    }));
  } catch (error) {
    console.error('[Cloud SQL] Error fetching all merchandise:', error);
    return null;
  }
}

