import { defineConfig, type Config } from 'drizzle-kit';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schemas';

export { schema };

/**
 * Initializes and returns a strongly-typed Drizzle ORM client connected to a SQLite database.
 *
 * @param dbUrl - The absolute or relative path to the SQLite `.db` file.
 * @returns The instantiated Drizzle ORM client bound to the application's schemas.
 */
export const createDbClient = (dbUrl: string) => {
  const sqlite = new Database(dbUrl);
  return drizzle(sqlite, { schema });
};

/**
 * Helper to generate a standardized Drizzle Kit configuration.
 *
 * @param dialect - The database dialect (e.g., "sqlite", "postgresql").
 * @param schema - The path to the schema file(s), relative to the consumer's configuration file.
 * @param out - The output directory for the generated SQL migration files.
 * @param dbCredentials - Connection credentials containing the database URL.
 * @returns A fully constructed Drizzle Kit configuration object.
 */
export const drizzleConfig = (
  dialect: Config['dialect'],
  schema: string,
  out: string,
  dbCredentials: { url: string }
) => {
  return defineConfig({
    dialect,
    schema,
    out,
    dbCredentials,
    verbose: true,
  });
};
