import Database, { type Options as BetterSqliteOptions } from 'better-sqlite3';
import { defineConfig, type Config } from 'drizzle-kit';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schemas';

export { schema };
export * from './schemas';

export {
  // SQL template tag & expressions
  sql,
  // Equality & Comparison
  eq,
  ne,
  gt,
  gte,
  lt,
  lte,
  // Logical operators
  and,
  or,
  not,
  // String pattern matching
  like,
  ilike,
  // Array / Set inclusion
  inArray,
  notInArray,
  // Nullability checks
  isNull,
  isNotNull,
  // Range & Existence checks
  between,
  notBetween,
  exists,
  notExists,
  // Sorting
  asc,
  desc,
  // Aggregation helpers
  count,
  countDistinct,
  avg,
  avgDistinct,
  sum,
  sumDistinct,
  min,
  max,
  // Schema relationships
  relations,
} from 'drizzle-orm';

// Drizzle ORM Type Utilities
export type { InferSelectModel, InferInsertModel, SQL, SQLWrapper } from 'drizzle-orm';

// Drizzle Kit & Driver Re-exports
export { drizzle, defineConfig, Database };
export type { Config, BetterSqliteOptions };
export { runMigrations } from './migrate';

/**
 * Type alias for the strongly-typed Drizzle client instance bound to application schemas.
 */
export type DatabaseClient = ReturnType<typeof createDbClient>;

/**
 * Additional configuration options for initializing the SQLite database client.
 */
export interface CreateDbClientOptions {
  /** Optional better-sqlite3 driver options (e.g. readonly, timeout, verbose) */
  sqliteOptions?: BetterSqliteOptions;
  /** Custom SQLite pragmas to execute on initialization (e.g. ['cache_size = -64000']) */
  pragmas?: string[];
}

/**
 * Initializes and returns a strongly-typed Drizzle ORM client connected to a SQLite database.
 *
 * @description
 * 1. Instantiates `better-sqlite3` with optional driver flags.
 * 2. Enables `WAL` (Write-Ahead Logging) mode for concurrent read/write throughput.
 * 3. Enforces `foreign_keys = ON` to guarantee relational integrity.
 * 4. Sets `synchronous = NORMAL` for optimal write performance under WAL mode.
 * 5. Applies any caller-specified custom pragmas.
 * 6. Returns the Drizzle ORM client bound to application schemas.
 *
 * @param dbUrl - The file path (or `:memory:`) to the SQLite database.
 * @param options - Optional driver configuration and custom pragmas.
 * @returns Instantiated Drizzle ORM client.
 */
export const createDbClient = (dbUrl: string, options?: CreateDbClientOptions) => {
  const sqlite = new Database(dbUrl, options?.sqliteOptions);

  // Core production pragmas for performance and referential integrity
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  sqlite.pragma('synchronous = NORMAL');

  // Apply any additional custom pragmas
  if (options?.pragmas && options.pragmas.length > 0) {
    for (const pragma of options.pragmas) {
      sqlite.pragma(pragma);
    }
  }

  return drizzle(sqlite, { schema });
};

/**
 * Configuration options for the `drizzleConfig` helper.
 */
export interface DrizzleConfigOptions {
  /** Connection credentials containing the database URL (Only mandatory field) */
  dbCredentials: { url: string };
  /** The database dialect (Optional, defaults to "sqlite") */
  dialect?: Config['dialect'];
  /** Path to schema file(s), relative to config (Optional, defaults to "./src/schemas/index.ts") */
  schema?: string;
  /** Output directory for generated migrations (Optional, defaults to "./drizzle") */
  out?: string;
  /** Whether to log verbose SQL output during migrations (Optional, defaults to true) */
  verbose?: boolean;
  /** Whether to enforce strict schema checks (Optional, defaults to true) */
  strict?: boolean;
}

/**
 * Helper to generate a standardized Drizzle Kit configuration.
 *
 * @description Only `dbCredentials` is mandatory. All other settings default to
 * SQLite conventions for the Kalya monorepo.
 *
 * @param options - Configuration options containing mandatory dbCredentials.
 * @returns A fully constructed Drizzle Kit configuration object.
 */
export const drizzleConfig = ({
  dbCredentials,
  dialect = 'sqlite',
  schema = './src/schemas/index.ts',
  out = './drizzle',
  verbose = true,
  strict = true,
}: DrizzleConfigOptions) => {
  return defineConfig({
    dialect,
    schema,
    out,
    dbCredentials,
    verbose,
    strict,
  });
};
