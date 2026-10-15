import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { createDbClient } from './index';
import { dbEnv } from '@kalya/env';

/**
 * Resolves the directory containing Drizzle migrations across various runtime contexts:
 * - Development with tsx (inside packages/db or apps/api-server)
 * - Bundled production build (apps/api-server/dist/index.js)
 * - Docker container (/app/packages/db/drizzle)
 */
function resolveMigrationsFolder(customFolder?: string): string {
  if (customFolder && fs.existsSync(customFolder)) {
    return customFolder;
  }

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const candidatePaths = [
    path.resolve(__dirname, '../drizzle'),
    path.resolve(__dirname, '../../packages/db/drizzle'),
    path.resolve(process.cwd(), 'packages/db/drizzle'),
    path.resolve(process.cwd(), '../packages/db/drizzle'),
    path.resolve('/app/packages/db/drizzle'),
  ];

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return path.resolve(__dirname, '../drizzle');
}

/**
 * Runs pending Drizzle SQLite migrations programmatically.
 *
 * @param customFolder - Optional path to the migrations directory (defaults to packages/db/drizzle)
 */
export function runMigrations(customFolder?: string): void {
  const db = createDbClient(dbEnv.url);
  const migrationsFolder = resolveMigrationsFolder(customFolder);

  console.log(`[Database] Checking and applying migrations from ${migrationsFolder}...`);
  migrate(db, { migrationsFolder });
  console.log('[Database] Database schema is up to date.');
}

// Auto-run when executed directly as a script (e.g. via tsx)
if (
  process.argv[1] &&
  fileURLToPath(import.meta.url).endsWith(process.argv[1].replace(/\\/g, '/'))
) {
  runMigrations();
}
