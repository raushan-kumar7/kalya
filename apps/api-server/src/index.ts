import { buildApp } from '@/app';
import { env } from '@kalya/env';
import { log } from '@/logger';
import { runMigrations } from '@kalya/db';
import { getMailer } from '@/libs/mail';

const app = buildApp();

/**
 * Guard flag to ensure shutdown logic is executed only once.
 */
let isShuttingDown = false;

/**
 * Gracefully shuts down the Fastify server and application resources.
 *
 * @description Handles process termination signals (SIGINT, SIGTERM) and fatal errors.
 * Closes active network listeners, drains in-flight requests, and forces termination
 * if shutdown hangs longer than the timeout threshold.
 *
 * @param {string} signal - The operating system or runtime signal received.
 * @returns {Promise<void>}
 */
async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;

  log.info(`Received ${signal}, shutting down gracefully...`, {
    service: env.app.name,
    environment: env.env,
  });

  // Force exit after 10 seconds if connections fail to close in time
  const forceExitTimeout = setTimeout(() => {
    log.error('Graceful shutdown timed out, forcing exit.', {
      service: env.app.name,
      errorCode: 'SHUTDOWN_TIMEOUT',
    });
    process.exit(1);
  }, 10_000);

  forceExitTimeout.unref();

  try {
    await app.close();

    log.info(`${env.app.name} has been shut down successfully.`);
    process.exit(0);
  } catch (err) {
    log.error(err, {
      service: env.app.name,
      errorCode: 'SHUTDOWN_ERROR',
    });
    process.exit(1);
  }
}

/**
 * Initializes and starts the Fastify API server.
 *
 * @description Binds the server to the configured host and port, logging the
 * bound address and runtime environment on successful startup.
 *
 * @returns {Promise<void>}
 */
async function start(): Promise<void> {
  try {
    // 1. Ensure database schema is up-to-date with latest migrations
    runMigrations();

    // 2. Start HTTP listener
    const address = await app.listen({
      host: env.server.host,
      port: env.server.port,
    });

    log.info(`🚀 ${env.app.name} running in [${env.env}] mode on ${address}`, {
      service: env.app.name,
      environment: env.env,
      path: address,
    });

    // 3. Warm up the SMTP pool so the first email doesn't pay cold-start cost.
    //    Fire-and-forget: warm-up errors are non-fatal.
    getMailer().warmUp();
  } catch (err) {
    log.error(err, {
      service: env.app.name,
      environment: env.env,
      errorCode: 'SERVER_BOOT_ERROR',
    });
    process.exit(1);
  }
}

// Lifecycle and Termination Signal Listeners
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

// Uncaught Error Handlers
process.on('unhandledRejection', (reason) => {
  log.error(reason instanceof Error ? reason : new Error(String(reason)), {
    service: env.app.name,
    environment: env.env,
    errorCode: 'SYSTEM_UNHANDLED_REJECTION',
  });
  void shutdown('unhandledRejection');
});

process.on('uncaughtException', (err) => {
  log.error(err, {
    service: env.app.name,
    environment: env.env,
    errorCode: 'SYSTEM_UNCAUGHT_EXCEPTION',
  });
  void shutdown('uncaughtException');
});

// Boot the application
void start();
