import type { HealthChecker, StorageHealthResult } from '@kalya/types';
import { access, constants, statfs } from 'node:fs/promises';
import path from 'node:path';

/**
 * Health checker verifying local storage directory accessibility,
 * read/write permissions, and available disk capacity.
 *
 * @description Marked as a non-critical dependency (`isCritical: false`),
 * meaning degradation or failure of storage access will not fail the readiness probe,
 * but will be flagged as degraded in the comprehensive `/health` report.
 */
export class StorageHealthChecker implements HealthChecker {
  /** Subsystem identifier key */
  readonly name = 'storage' as const;

  /** Non-critical: failure flags degraded state rather than taking instance out of rotation */
  readonly isCritical = false;

  /** Maximum execution timeout threshold in milliseconds */
  readonly timeoutMs = 1500;

  /**
   * @param {string} uploadDir - File path to the configured media/uploads directory.
   */
  constructor(private readonly uploadDir: string) {}

  /**
   * Verifies read and write permissions and checks disk capacity for the upload path.
   *
   * @returns {Promise<StorageHealthResult>} Storage diagnostics including writable flag, free space, and path.
   */
  async check(): Promise<StorageHealthResult> {
    const start = performance.now();
    const resolvedPath = path.resolve(this.uploadDir);

    try {
      // 1. Verify directory existence and read/write accessibility
      await access(resolvedPath, constants.R_OK | constants.W_OK);

      // 2. Measure free disk capacity if filesystem statistics are supported
      let freeSpaceBytes: number | undefined;
      try {
        const stats = await statfs(resolvedPath);
        freeSpaceBytes = stats.bavail * stats.bsize;
      } catch {
        // Fallback for filesystems where statfs is restricted or unsupported
      }

      const latencyMs = Math.round((performance.now() - start) * 100) / 100;

      return {
        name: this.name,
        status: 'healthy',
        latencyMs,
        checkedAt: new Date().toISOString(),
        details: {
          provider: 'local',
          writable: true,
          freeSpaceBytes,
          uploadDir: resolvedPath,
        },
      };
    } catch (error) {
      const latencyMs = Math.round((performance.now() - start) * 100) / 100;
      let errorMessage = 'Storage path is not accessible';

      if (error instanceof Error) {
        if ('code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
          errorMessage = `Storage directory does not exist: "${resolvedPath}"`;
        } else if ('code' in error && (error as NodeJS.ErrnoException).code === 'EACCES') {
          errorMessage = `Permission denied accessing storage directory: "${resolvedPath}"`;
        } else {
          errorMessage = error.message;
        }
      }

      return {
        name: this.name,
        status: 'degraded',
        latencyMs,
        message: errorMessage,
        checkedAt: new Date().toISOString(),
        details: {
          provider: 'local',
          writable: false,
          uploadDir: resolvedPath,
        },
      };
    }
  }
}
