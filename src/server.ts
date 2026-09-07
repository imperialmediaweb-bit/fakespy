import { createApp } from './app';
import { config } from './config';
import { validateConfig } from './config/validate';
import { connectDatabase, disconnectDatabase } from './lib/prisma';
import { disconnectRedis } from './lib/redis';
import { logger } from './lib/logger';
import { analysesService } from './modules/analyses/analyses.service';

async function main() {
  validateConfig();

  const app = createApp();

  await connectDatabase();

  // Recover analyses stranded by a previous restart, then keep sweeping.
  await analysesService.failStale().catch((err) => logger.error({ err }, 'Stale analysis sweep failed'));
  const sweeper = setInterval(() => {
    analysesService.failStale().catch((err) => logger.error({ err }, 'Stale analysis sweep failed'));
  }, 5 * 60_000);
  sweeper.unref();

  const server = app.listen(config.port, '0.0.0.0', () => {
    logger.info(
      {
        port: config.port,
        env: config.env,
        prefix: config.apiPrefix,
      },
      `FakeSpy API server started on port ${config.port}`,
    );
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutting down gracefully...');

    server.close(async () => {
      await disconnectDatabase();
      await disconnectRedis();
      logger.info('Server shut down');
      process.exit(0);
    });

    // Force exit after 10s
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled rejection');
  });

  process.on('uncaughtException', (error) => {
    logger.fatal({ error }, 'Uncaught exception');
    process.exit(1);
  });
}

main().catch((err) => {
  logger.fatal({ err }, 'Failed to start server');
  process.exit(1);
});
