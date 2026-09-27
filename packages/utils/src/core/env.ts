import fs from 'node:fs';
import path from 'node:path';

/**
 * Searches upward from `startDir` to locate the monorepo root directory
 * identified by `pnpm-workspace.yaml`.
 *
 * @param startDir - Starting directory for the upward search. Defaults to `process.cwd()`.
 * @returns The absolute path to the monorepo root directory.
 */
export const findMonorepoRoot = (startDir: string = process.cwd()): string => {
  let current = path.resolve(startDir);

  while (current !== path.dirname(current)) {
    if (fs.existsSync(path.join(current, 'pnpm-workspace.yaml'))) {
      return current;
    }
    current = path.dirname(current);
  }

  return process.cwd();
};

/**
 * Discovers and injects environment variables from the monorepo root `.env`
 * into `process.env`.
 *
 * @param customDir - Optional custom directory to start searching from.
 * @returns True if a `.env` file was found and loaded; otherwise false.
 */
export const loadMonorepoEnv = (customDir?: string): boolean => {
  const root = findMonorepoRoot(customDir);
  const rootEnv = path.join(root, '.env');

  if (fs.existsSync(rootEnv)) {
    if (typeof process.loadEnvFile === 'function') {
      try {
        process.loadEnvFile(rootEnv);
        return true;
      } catch {
        // Fall through to manual parser below if loadEnvFile encounters parse errors
      }
    }

    try {
      const content = fs.readFileSync(rootEnv, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        const equalsIndex = trimmed.indexOf('=');
        if (equalsIndex === -1) continue;

        const key = trimmed.slice(0, equalsIndex).trim();
        let value = trimmed.slice(equalsIndex + 1).trim();

        // Strip matching outer quotes
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        if (process.env[key] === undefined) {
          process.env[key] = value;
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  return false;
};

/**
 * Retrieves the resolved database connection URL for the current environment.
 *
 * @description
 * 1. Ensures monorepo root environment variables are loaded.
 * 2. Checks `KALYA_DATABASE.URL` and `KALYA_DATABASE_URL`.
 * 3. Resolves relative SQLite file paths against the monorepo root.
 *
 * @returns The resolved SQLite database URL or file path.
 */
export const getDatabaseUrl = (): string => {
  loadMonorepoEnv();

  const root = findMonorepoRoot();
  const rawUrl =
    process.env['KALYA_DATABASE.URL'] ||
    process.env.KALYA_DATABASE_URL ||
    './apps/api-server/data/kalya.db';

  if (rawUrl === ':memory:' || rawUrl.startsWith('file::memory:')) {
    return rawUrl;
  }

  if (path.isAbsolute(rawUrl)) {
    return rawUrl;
  }

  // Resolve relative paths against monorepo root
  return path.resolve(root, rawUrl);
};
