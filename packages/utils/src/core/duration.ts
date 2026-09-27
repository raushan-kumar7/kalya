/**
 * A mapping of human-readable time unit suffixes to their corresponding millisecond multipliers.
 */
const UNIT_TO_MS: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

/**
 * Regular expression used to extract the numeric amount and the unit suffix from a duration string.
 * Ensures the string strictly follows the format: [number][unit] (e.g. 15m, 7d).
 */
const DURATION_PATTERN = /^(\d+)(ms|s|m|h|d)$/;

/**
 * Parses a human-readable duration string into milliseconds.
 *
 * Supports standard time units:
 * - `ms`: milliseconds
 * - `s`: seconds
 * - `m`: minutes
 * - `h`: hours
 * - `d`: days
 *
 * @param value - The duration string to parse (e.g., "30s", "15m", "7d", "100ms").
 * @returns The parsed duration in milliseconds.
 * @throws {Error} If the provided string does not match the valid duration format.
 */
export function parseDuration(value: string): number {
  const match = DURATION_PATTERN.exec(value.trim());
  if (!match) {
    throw new Error(`Invalid duration "${value}". Expected format like "30s", "15m", "7d".`);
  }
  const [, amount, unit] = match;
  return Number(amount) * UNIT_TO_MS[unit];
}
