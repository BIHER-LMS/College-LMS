import { PrismaClient } from '@prisma/client';
import { env } from './env';

/**
 * Prisma client singleton.
 *
 * In development we re-use the client across HMR reloads
 * to avoid exhausting database connections.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' && process.env.PRISMA_LOG_QUERIES ? ['query', 'warn', 'error'] : ['warn', 'error'],
  });

// Always store on globalThis to preserve connection pool across warm serverless invocations
globalForPrisma.prisma = prisma;

export default prisma;
