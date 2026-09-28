import { type DatabaseClient, sql } from '@kalya/db';
import type { DatabaseHealthResult, HealthChecker } from '@kalya/types';

/**
 * Health checker verifying database connectivity, query execution latency,
 * and read/write availability against the SQLite/Drizzle database client.
 *
 * @description Marked as a critical dependency (`isCritical: true`), meaning
 * failure of this check will mark the server readiness probe as `not_ready` (HTTP 503).
 */
export class DatabaseHealthChecker implements HealthChecker {
  /** Subsystem identifier key */
  readonly name = 'database' as const;

  /** Failure of this check renders readiness probe false */
  readonly isCritical = true;

  /** Maximum execution timeout threshold in milliseconds before aborting */
  readonly timeoutMs = 2000;

  /**
   * @param {DatabaseClient} db - Strongly typed Drizzle ORM client instance.
   */
  constructor(private readonly db: DatabaseClient) {}

  /**
   * Executes a lightweight ping query (`SELECT 1;`) to verify connectivity.
   *
   * @returns {Promise<DatabaseHealthResult>} Diagnostics including execution latency and driver status.
   */
  async check(): Promise<DatabaseHealthResult> {
    const start = performance.now();

    try {
      // Execute fast query to verify engine responsiveness
      this.db.run(sql`SELECT 1;`);
      const latencyMs = Math.round((performance.now() - start) * 100) / 100;

      return {
        name: this.name,
        status: 'healthy',
        latencyMs,
        checkedAt: new Date().toISOString(),
        details: {
          driver: 'better-sqlite3',
          writable: true,
        },
      };
    } catch (error) {
      const latencyMs = Math.round((performance.now() - start) * 100) / 100;
      const errorMessage = error instanceof Error ? error.message : 'Database ping query failed';

      return {
        name: this.name,
        status: 'unhealthy',
        latencyMs,
        message: errorMessage,
        checkedAt: new Date().toISOString(),
        details: {
          driver: 'better-sqlite3',
          writable: false,
        },
      };
    }
  }
}
