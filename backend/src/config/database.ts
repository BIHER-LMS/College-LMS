import { PrismaClient } from '@prisma/client';
import { env } from './env';

/**
 * Prisma client singleton and connection pooling optimization.
 *
 * In serverless environments (Vercel) and development HMR:
 * - Re-use client on globalThis across warm invocations to prevent connection leaks
 * - Enforce pgbouncer=true on Supabase pooler port 6543
 * - Limit connection pool size in serverless lambdas (connection_limit=1) to prevent pool exhaustion
 */

function getOptimizedDatabaseUrl(): string | undefined {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) return undefined;

  let url = rawUrl;

  // Supabase PgBouncer transaction mode requirement
  if (url.includes(':6543') && !url.includes('pgbouncer=true')) {
    url += (url.includes('?') ? '&' : '?') + 'pgbouncer=true';
  }

  // Serverless connection limit: clamp to 1 in serverless lambdas to conserve pooler slots
  if (process.env.VERCEL && !url.includes('connection_limit=')) {
    url += (url.includes('?') ? '&' : '?') + 'connection_limit=1';
  }

  return url;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const optimizedUrl = getOptimizedDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(optimizedUrl ? { datasources: { db: { url: optimizedUrl } } } : {}),
    log:
      env.NODE_ENV === 'development' && process.env.PRISMA_LOG_QUERIES
        ? ['query', 'warn', 'error']
        : ['warn', 'error'],
  });

// Preserve client across warm serverless invocations and dev reloads
globalForPrisma.prisma = prisma;

export default prisma;

