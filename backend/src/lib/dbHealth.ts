import net from 'net';

let cachedDbStatus: boolean | null = null;
let lastCheckTime = 0;
const CACHE_TTL_MS = 60000; // Cache connection state for 60s
const FAILURE_RETRY_MS = 2000; // Retry 2s after a recorded failure

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
 * Checks if the target database is considered available.
 * Does not block hot queries with redundant TCP socket handshakes when the DATABASE_URL
 * is configured and healthy. Prisma's internal connection pool handles connection reuse.
 */
export async function isDatabaseOnline(forceCheck = false): Promise<boolean> {
  const now = Date.now();

  // If a known failure occurred recently, fail-fast without hitting DB
  if (cachedDbStatus === false && now - lastCheckTime < FAILURE_RETRY_MS) {
    return false;
  }

  // If already confirmed healthy within cache TTL, return immediately
  if (!forceCheck && cachedDbStatus === true && now - lastCheckTime < CACHE_TTL_MS) {
    return true;
  }

  const dbUrl = process.env.DATABASE_URL;
  const parsed = parseDatabaseUrl(dbUrl);

  if (!parsed) {
    cachedDbStatus = false;
    lastCheckTime = now;
    return false;
  }

  // Without forceCheck, if DATABASE_URL is valid, assume online to avoid TCP handshake latency
  if (!forceCheck && cachedDbStatus === null) {
    cachedDbStatus = true;
    lastCheckTime = now;
    return true;
  }

  // Only perform actual TCP reachability check if forced or re-evaluating after a failure
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
    }, 1500);

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
  return isReachable;
}

export function markDatabaseOffline(): void {
  cachedDbStatus = false;
  lastCheckTime = Date.now();
}

export function markDatabaseOnline(): void {
  cachedDbStatus = true;
  lastCheckTime = Date.now();
}

export const isDatabaseAvailable = isDatabaseOnline;
export const markDatabaseUnavailable = markDatabaseOffline;

