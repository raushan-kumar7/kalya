import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { databaseEnvSchema, type DatabaseRawEnv } from '@kalya/validations';
import { findRoot, loadEnv } from './env';

// Discover and load monorepo environment
loadEnv();

/**
 * Normalizes and resolves the SQLite database path across monorepo packages.
 * Automatically ensures the parent directory exists on disk to prevent SQLite connection crashes.
 *
 * @param rawUrl - Raw URL or relative path from environment variables.
 * @returns Fully resolved database URL or file path.
 */
export function resolveDbUrl(rawUrl: string): string {
  if (rawUrl === ':memory:' || rawUrl.startsWith('file::memory:')) {
    return rawUrl;
  }

  const root = findRoot();
  let resolved: string;

  if (path.isAbsolute(rawUrl)) {
    resolved = rawUrl;
  } else if (rawUrl.startsWith('./data') || rawUrl.startsWith('data')) {
    resolved = path.resolve(root, 'apps/api-server', rawUrl);
  } else {
    resolved = path.resolve(root, rawUrl);
  }

  const dir = path.dirname(resolved);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  return resolved;
}

/**
 * Validates only database-related environment variables.
 *
 * @description Ensures `KALYA_DATABASE.URL` is present without enforcing
 * application-level variables like SMTP, Auth keys, or Cloudinary secrets.
 *
 * @returns {DatabaseRawEnv} Validated raw database environment.
 */
function validateDbEnv(): DatabaseRawEnv {
  const result = databaseEnvSchema.safeParse(process.env);

  if (!result.success) {
    console.error('\n [Config:Database] Invalid Database Environment Configuration:\n');
    for (const issue of result.error.issues) {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    }
    console.error('\n Please check your .env file against .env.example\n');
    process.exit(1);
  }

  return result.data;
}

const rawDb = validateDbEnv();

/**
 * Strongly typed database configuration object with resolved absolute path.
 */
export const dbEnv = Object.freeze({
  url: resolveDbUrl(rawDb['KALYA_DATABASE.URL']),
});

export type DbConfig = typeof dbEnv;
