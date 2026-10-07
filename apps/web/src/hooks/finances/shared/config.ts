/** Central stale-time presets (ms). Use these instead of magic numbers. */
export const STALE = {
  /** Live-ish data, e.g. budget health gauge. */
  realtime: 30 * 1000,
  /** Frequently changing lists: expenses, budgets, pending splits. */
  short: 2 * 60 * 1000,
  /** Normal data: income, goals, assets, summaries, contacts. */
  medium: 5 * 60 * 1000,
  /** Rarely changing reference data: buckets, categories. */
  long: 10 * 60 * 1000,
} as const;
