/** UUId generated using nanoid */
export type UUID = string;

/** Date-only ISO string, e.g. '2026-09-11' */
export type ISODate = string;

/** Full ISO timestamp string, e.g. '2026-09-11T10:00:00Z' */
export type ISOTimestamp = string;

/** Numeric decimal/currency value */
export type Decimal = number;

/** 'YYYY-MM' reporting-month string */
export type MonthString = string;

/** Arbitrary JSON payload (jsonb/json columns) */
export type JSONValue =
  string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };

/** Allows known literals to autocomplete while still accepting any string. */
export type Extensible<T extends string> = T | (string & {});

/** Every table has a uuid primary key. */
export interface Identifiable {
  id: UUID;
}

/** Standard created_at/updated_at pair shared by most tables. */
export interface Timestamps {
  created_at: ISOTimestamp;
  updated_at: ISOTimestamp;
}
