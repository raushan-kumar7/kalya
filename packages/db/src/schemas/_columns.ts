import { sql } from 'drizzle-orm';
import { integer, text } from 'drizzle-orm/sqlite-core';
import { generateId } from '@kalya/utils';

/** UUID-shaped primary key, generated app-side (SQLite has no native uuid type). */
export const idCol = () =>
  text('id')
    .primaryKey()
    .$defaultFn(() => generateId());

/** Bare foreign-key column. Callers attach `.notNull()` and `.references()`. */
export const uuidCol = (name: string) => text(name);

/** created_at: always defaulted, never null, never touched again after insert. */
export const createdAt = () =>
  integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`);

/** updated_at: defaulted on insert, refreshed automatically on every update. */
export const updatedAt = () =>
  integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date());

/** Spread into a table's column map: `...timestamps()`. */
export const timestamps = () => ({
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/** A timestamp that requires explicit value supply, not auto-defaulted. */
export const nullableTimestamp = (name: string) => integer(name, { mode: 'timestamp_ms' });

/** Money is ALWAYS stored as an INTEGER in minor units to avoid float precision loss. */
export const money = (name: string, opts: { notNull?: boolean; default?: number } = {}) => {
  let col = integer(name);
  if (opts.notNull) col = col.notNull() as typeof col;
  if (opts.default !== undefined) col = col.default(opts.default) as typeof col;
  return col;
};

/** ISO date string column, e.g. "2026-09-11". Sorts correctly as text. */
export const isoDate = (name: string) => text(name);

export const boolCol = (name: string, defaultValue = false) =>
  integer(name, { mode: 'boolean' }).notNull().default(defaultValue);
