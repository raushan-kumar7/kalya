import { Temporal } from 'temporal-polyfill';

export { Temporal } from 'temporal-polyfill';

export const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Serializes a PlainDate to a "YYYY-MM-DD" string.
 * @param date - The date to serialize.
 * @returns The serialized date string.
 */
export function toISO(date: Temporal.PlainDate): string {
  return date.toString();
}

/**
 * Parses a "YYYY-MM-DD" string into a Temporal.PlainDate.
 * @param value - The "YYYY-MM-DD" string to parse.
 * @returns The parsed PlainDate, or null if invalid/empty.
 */
export function fromISO(value?: string | null): Temporal.PlainDate | null {
  if (!value) return null;
  try {
    return Temporal.PlainDate.from(value);
  } catch {
    return null;
  }
}

/**
 * Derives the "YYYY-MM" month key for a given date, used for month grouping.
 * @param date - The date to derive the month key from.
 * @returns The "YYYY-MM" string.
 */
export function toMonthKey(date: Temporal.PlainDate): string {
  return date.toPlainYearMonth().toString();
}

/**
 * Converts a "YYYY-MM" string into a long month label (e.g., "July 2026").
 * @param month - The "YYYY-MM" string to format.
 * @returns The long month label string, or the original input if invalid.
 */
export function formatMonthLabel(month: string): string {
  try {
    const ym = Temporal.PlainYearMonth.from(month);
    return `${MONTHS[ym.month - 1]} ${ym.year}`;
  } catch {
    return month;
  }
}

/**
 * Checks if two PlainDates represent the exact same calendar day.
 * @param a - The first date.
 * @param b - The second date.
 * @returns True if they represent the same day, otherwise false.
 */
export function isSameDay(a: Temporal.PlainDate, b: Temporal.PlainDate): boolean {
  return a.equals(b);
}

/**
 * Adds a specific number of days to a given date.
 * @param date - The base date.
 * @param days - The number of days to add (may be negative).
 * @returns A new PlainDate with the days added.
 */
export function addDays(date: Temporal.PlainDate, days: number): Temporal.PlainDate {
  return date.add({ days });
}

/**
 * Returns a 6x7 grid (42 days) of PlainDates covering the visible month for
 * calendars, starting on Sunday.
 * @param viewYear - The year of the month to view.
 * @param viewMonth - The month index (0-11) to view, matching JS Date convention.
 * @returns An array of 42 PlainDate objects representing the grid.
 */
export function buildMonthGrid(viewYear: number, viewMonth: number): Temporal.PlainDate[] {
  const firstOfMonth = Temporal.PlainDate.from({ year: viewYear, month: viewMonth + 1, day: 1 });
  // Temporal's dayOfWeek is ISO (Mon=1..Sun=7); `% 7` maps Sun->0, Mon->1, ... Sat->6,
  // which lines up with the Sunday-first WEEKDAYS grid.
  const startOffset = firstOfMonth.dayOfWeek % 7;
  const gridStart = firstOfMonth.subtract({ days: startOffset });

  return Array.from({ length: 42 }, (_, i) => gridStart.add({ days: i }));
}

/**
 * Returns the current month as a "YYYY-MM" string.
 * @returns The current month string.
 */
export function getCurrentMonthString(): string {
  return Temporal.Now.plainDateISO().toPlainYearMonth().toString();
}

/**
 * Checks if a given date falls within a specific "YYYY-MM" month string.
 * @param date - The date to check.
 * @param monthString - The "YYYY-MM" month string.
 * @returns True if the date falls in the month, otherwise false.
 */
export function isDateInMonth(date: Temporal.PlainDate, monthString: string): boolean {
  return toMonthKey(date) === monthString;
}

/**
 * Formats a date into a short, locale-specific format for cards (e.g., "5 Jul 2026").
 * @param value - The date (or "YYYY-MM-DD" string) to format.
 * @returns The formatted date string, or "—" if undefined/invalid.
 */
export function formatCardDate(value?: Temporal.PlainDate | string | null): string {
  const date = typeof value === 'string' ? fromISO(value) : (value ?? null);
  if (!date) return '—';
  return date.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Formats a date to a long display string (e.g., "July 5, 2026").
 * @param date - The date to format.
 * @returns The formatted calendar date string.
 */
export function formatCalendarDate(date: Temporal.PlainDate): string {
  return date.toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Same as formatCalendarDate, but accepts a "YYYY-MM-DD" string and returns
 * "—" if the input is null/undefined/invalid.
 * @param value - The "YYYY-MM-DD" string to format.
 * @returns The formatted date string, or "—" if null/invalid.
 */
export function formatCalendarDateOrDash(value?: string | null): string {
  const date = fromISO(value);
  return date ? formatCalendarDate(date) : '—';
}

/** Shifts a "YYYY-MM" string by N months (negative goes back). */
export function shiftMonth(month: string, delta: number): string {
  return Temporal.PlainYearMonth.from(month).add({ months: delta }).toString();
}
