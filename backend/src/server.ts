import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import prisma from './config/database';

async function start() {
  try {
    // Verify database connection
    try {
      await prisma.$connect();
      logger.info('✅ Database connected');
    } catch (dbError: any) {
      if (env.NODE_ENV === 'development') {
        logger.warn('⚠️ Database connection warning: ' + (dbError?.message || dbError));
        logger.warn('⚠️ Server running. Update DATABASE_URL in backend/.env with your real Supabase password when ready.');
      } else {
        throw dbError;
      }
    }

    // Start server
    app.listen(env.PORT, () => {
      logger.info(`🚀 Server running on port ${env.PORT}`, {
        env: env.NODE_ENV,
        port: env.PORT,
      });
    });
  } catch (error) {
    logger.error('❌ Failed to start server', {
      error: error instanceof Error ? error.message : 'Unknown',
    });
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

start();
