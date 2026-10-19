import fs from 'node:fs';
import path from 'node:path';
import { createDbClient, sql } from '@kalya/db';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { env } from '@kalya/env';
import { log } from '@/logger';

/**
 * Fastify plugin initializing the Drizzle SQLite database connection.
 *
 * @description
 * 1. Resolves `config.database.url` from validated environment configuration.
 * 2. Ensures the target database directory exists on disk for SQLite files.
 * 3. Initializes the Drizzle ORM client via `@kalya/db` in WAL mode.
 * 4. Decorates `fastify.db` and `request.db` for universal database access.
 * 5. Verifies database connectivity with an immediate `SELECT 1` ping and latency tracking.
 * 6. Registers an `onClose` lifecycle hook for clean database shutdown.
 *
 * @param fastify - The Fastify application instance.
 */
const dbPluginCallback: FastifyPluginAsync = async (fastify) => {
  const dbUrl = env.database.url;

  try {
    // Ensure parent directory exists for file-based SQLite databases
    if (dbUrl !== ':memory:' && !dbUrl.startsWith('file::memory:')) {
      const resolvedPath = path.isAbsolute(dbUrl) ? dbUrl : path.resolve(process.cwd(), dbUrl);
      const dbDir = path.dirname(resolvedPath);

      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
        log.debug(`Created missing SQLite database directory at: ${dbDir}`);
      }
    }

    const db = createDbClient(dbUrl);

    // Verify connectivity and measure round-trip latency
    const pingStart = performance.now();
    db.run(sql`SELECT 1;`);
    const pingLatencyMs = Math.round((performance.now() - pingStart) * 100) / 100;

    log.info(`Database connected successfully [url=${dbUrl}, latency=${pingLatencyMs}ms]`);

    // Decorate Fastify instance and request objects
    fastify.decorate('db', db);
    fastify.decorateRequest('db', {
      getter() {
        return fastify.db;
      },
    });

    // Register clean teardown hook on application shutdown
    fastify.addHook('onClose', async (instance) => {
      log.info('Closing database connection...');
      try {
        const client = (
          instance.db as unknown as {
            $client?: {
              close?: () => void;
              pragma?: (cmd: string) => unknown;
            };
          }
        ).$client;

        if (client) {
          // Flush and checkpoint WAL frames into the main database file before closing
          if (typeof client.pragma === 'function') {
            try {
              client.pragma('wal_checkpoint(TRUNCATE)');
              log.info('SQLite WAL checkpoint (TRUNCATE) executed successfully.');
            } catch (walError) {
              log.warn('Failed to checkpoint SQLite WAL during shutdown', {
                error: walError instanceof Error ? walError.message : String(walError),
              });
            }
          }

          if (typeof client.close === 'function') {
            client.close();
          }
        }
        log.info('Database connection closed gracefully.');
      } catch (closeError) {
        log.error('Error occurred while closing database connection', {
          error: closeError instanceof Error ? closeError.message : String(closeError),
        });
      }
    });
  } catch (err) {
    log.error('Failed to initialize database client', {
      dbUrl,
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });

    throw err;
  }
};

/**
 * Global database plugin wrapped with fastify-plugin.
 */
export const dbPlugin = fp(dbPluginCallback, {
  name: 'db-plugin',
});

export const databasePlugin = dbPlugin;
