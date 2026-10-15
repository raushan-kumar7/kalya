import { existsSync } from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { envSchema, type RawEnv } from '@kalya/validations';

/**
 * Searches upward from `startDir` to locate the monorepo root directory
 * identified by the presence of `pnpm-workspace.yaml`.
 *
 * @param startDir - Directory to begin upward traversal from. Defaults to `process.cwd()`.
 * @returns Absolute path to the monorepo root directory.
 */
export function findRoot(startDir: string = process.cwd()): string {
  let current = path.resolve(startDir);

  while (current !== path.dirname(current)) {
    if (existsSync(path.join(current, 'pnpm-workspace.yaml'))) {
      return current;
    }
    current = path.dirname(current);
  }

  return process.cwd();
}

/**
 * Loads an environment file into process.env if it exists on disk.
 *
 * @param filePath - Absolute path to the .env file.
 */
function loadFile(filePath: string): void {
  if (!existsSync(filePath)) return;
  dotenv.config({ path: filePath });
}

/**
 * Discovers and loads environment variables across the monorepo.
 * Prioritizes the monorepo root `.env`, falling back to `apps/api-server/.env`.
 */
export function loadEnv(): void {
  const root = findRoot();

  // 1. Root .env (Monorepo Single Source of Truth)
  loadFile(path.join(root, '.env'));

  // 2. apps/api-server/.env (Application-specific fallback)
  loadFile(path.join(root, 'apps', 'api-server', '.env'));
}

// Auto-load environment variables on module evaluation
loadEnv();

/**
 * Normalizes environment variables by mapping POSIX-compliant underscore equivalents
 * (e.g. KALYA_APP_NAME) to dot-notation keys (e.g. KALYA_APP.NAME) when the dot key is not set.
 */
function normalizeEnv(source: NodeJS.ProcessEnv): Record<string, unknown> {
  const result: Record<string, unknown> = { ...source };
  const schemaShape = envSchema.shape;

  for (const schemaKey of Object.keys(schemaShape)) {
    if (result[schemaKey] === undefined) {
      const underscoreKey = schemaKey.replace(/\./g, '_');
      if (source[underscoreKey] !== undefined) {
        result[schemaKey] = source[underscoreKey];
      }
    }
  }

  return result;
}

/**
 * Validates process.env variables against the Zod schema from @kalya/validations.
 *
 * @description Parses and validates environment variables against envSchema.
 * If validation fails, formats and logs each issue to stderr and terminates
 * the process with exit code 1 to prevent booting with invalid configuration.
 *
 * @returns {RawEnv} The parsed, coerced, and validated environment configuration object.
 */
export function validateEnv(): RawEnv {
  const normalized = normalizeEnv(process.env);
  const result = envSchema.safeParse(normalized);

  if (!result.success) {
    console.error('\n [Config] Invalid Environment Variables:\n');

    for (const issue of result.error.issues) {
      const key = issue.path.join('.');
      console.error(`  ${key}: ${issue.message}`);
    }

    console.error('\n Please check your .env file against .env.example\n');
    process.exit(1);
  }
  return result.data;
}

/**
 * Validated and coerced environment variables loaded from process.env.
 */
export const rawEnv: RawEnv = validateEnv();
