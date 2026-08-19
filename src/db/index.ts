import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: Pool | undefined;
  var _drizzleDb: any | undefined;
}

let isConnected: boolean | null = null;
let lastCheckTime = 0;

export const checkCloudSqlConnection = async (): Promise<boolean> => {
  if (!process.env.SQL_HOST) return false;
  const now = Date.now();
  if (isConnected !== null && now - lastCheckTime < 15000) {
    return isConnected;
  }
  const pool = getPool();
  if (!pool) return false;
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    isConnected = true;
    lastCheckTime = now;
    return true;
  } catch (err: any) {
    isConnected = false;
    lastCheckTime = now;
    return false;
  }
};

export const getPool = (): Pool | null => {
  if (!process.env.SQL_HOST) return null;
  if (!global._postgresPool) {
    global._postgresPool = new Pool({
      host: process.env.SQL_HOST,
      user: process.env.SQL_ADMIN_USER || process.env.SQL_USER,
      password: process.env.SQL_ADMIN_PASSWORD || process.env.SQL_PASSWORD,
      database: process.env.SQL_DB_NAME,
      ssl: false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 3000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    });

    global._postgresPool.on('error', (err) => {
      // Avoid uncaught noise on idle pool errors
    });
  }
  return global._postgresPool;
};

export const getDb = () => {
  const pool = getPool();
  if (!pool) return null;
  if (!global._drizzleDb) {
    global._drizzleDb = drizzle(pool, { schema });
  }
  return global._drizzleDb;
};

// Backwards-compatible db proxy that safely guards missing SQL connection
export const db = new Proxy({} as any, {
  get(target, prop) {
    const activeDb = getDb();
    if (!activeDb) {
      // Return a dummy chainable object that resolves to empty/void
      return (...args: any[]) => ({
        where: () => Promise.resolve([]),
        set: () => ({ where: () => Promise.resolve([]) }),
        values: () => ({ onConflictDoUpdate: () => Promise.resolve([]), onConflictDoNothing: () => Promise.resolve([]) }),
      });
    }
    return activeDb[prop];
  }
});

