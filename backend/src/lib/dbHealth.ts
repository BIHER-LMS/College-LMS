import net from 'net';

let cachedDbStatus: boolean | null = null;
let lastCheckTime = 0;
const CACHE_TTL_MS = 30000; // Cache connection state for 30s to eliminate latency

export function parseDatabaseUrl(urlStr?: string): { host: string; port: number } | null {
  if (!urlStr) return null;
  try {
    if (urlStr.includes('[') || urlStr.includes('YOUR_') || urlStr.includes('PROJECT_REF')) {
      return null;
    }
    const parsed = new URL(urlStr);
    const host = parsed.hostname;
    const port = parsed.port ? parseInt(parsed.port, 10) : 5432;
    if (!host) return null;
    return { host, port };
  } catch {
    return null;
  }
}

/**
 * Rapidly checks if the target database port is accepting connections.
 * Resolves in < 20ms on failed/closed ports without triggering heavy Prisma timeouts.
 */
export async function isDatabaseOnline(): Promise<boolean> {
  const now = Date.now();
  if (cachedDbStatus !== null && now - lastCheckTime < CACHE_TTL_MS) {
    return cachedDbStatus;
  }

  const dbUrl = process.env.DATABASE_URL;
  const parsed = parseDatabaseUrl(dbUrl);

  if (!parsed) {
    cachedDbStatus = false;
    lastCheckTime = now;
    return false;
  }

  // Fast TCP reachability check (3000ms timeout for cross-region cloud databases)
  const targetHost = parsed.host === 'localhost' ? '127.0.0.1' : parsed.host;
  const isReachable = await new Promise<boolean>((resolve) => {
    const socket = new net.Socket();
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve(false);
      }
    }, 3000);

    socket.once('connect', () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        socket.destroy();
        resolve(true);
      }
    });

    socket.once('error', () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        socket.destroy();
        resolve(false);
      }
    });

    socket.connect(parsed.port, targetHost);
  });

  cachedDbStatus = isReachable;
  lastCheckTime = now;
  // If connection failed, don't cache failure for 30s, retry sooner (2s)
  if (!isReachable) {
    lastCheckTime = now - CACHE_TTL_MS + 2000;
  }

  return isReachable;
}

export function markDatabaseOffline(): void {
  cachedDbStatus = false;
  lastCheckTime = Date.now() - CACHE_TTL_MS + 2000;
}

export const isDatabaseAvailable = isDatabaseOnline;
export const markDatabaseUnavailable = markDatabaseOffline;

