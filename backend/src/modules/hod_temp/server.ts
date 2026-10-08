import { app } from './app';
import { env } from './config/env';
import { prisma } from './config/db';

async function bootstrap() {
  try {
    // 1. Verify database connection
    await prisma.$connect();
    console.log('[Database] Connected to PostgreSQL successfully via Prisma.');

    // 2. Start Express HTTP Server
    const server = app.listen(env.PORT, () => {
      console.log(`[HOD Server] Express API server running on http://localhost:${env.PORT}`);
      console.log(`[HOD Server] Health check available at http://localhost:${env.PORT}/api/health`);
    });

    const shutdown = async () => {
      console.log('\n[HOD Server] Gracefully shutting down...');
      server.close(async () => {
        await prisma.$disconnect();
        console.log('[HOD Server] Cleanup complete. Exiting.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('[HOD Server] Startup failure:', error);
    process.exit(1);
  }
}

bootstrap();
