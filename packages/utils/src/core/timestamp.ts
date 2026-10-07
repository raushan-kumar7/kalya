import { Temporal } from 'temporal-polyfill';

/** Anything that can be coerced into a Temporal.Instant. */
export type TimestampInput = Temporal.Instant | Date | string | number;

/**
 * Normalizes flexible timestamp inputs (Instant, Date, epoch ms, ISO string)
 * into a Temporal.Instant.
 * @param value - The input instant, Date, epoch-millisecond number, or ISO string.
 * @returns A normalized Temporal.Instant.
 */
export function toInstant(value: TimestampInput): Temporal.Instant {
  if (value instanceof Temporal.Instant) return value;
  if (value instanceof Date) return Temporal.Instant.fromEpochMilliseconds(value.getTime());
  if (typeof value === 'number') return Temporal.Instant.fromEpochMilliseconds(value);
  return Temporal.Instant.from(value);
}

/**
 * Formats an instant using an optional IANA timezone (e.g., "Jul 5, 2026 at 3:42 PM").
 * When no timezone is given, formats in UTC and appends " UTC".
 * @param date - The instant to format.
 * @param tz - Optional IANA timezone string.
 * @returns The formatted date string.
 */
export function formatDateTime(date: TimestampInput, tz?: string): string {
  const zdt = toInstant(date).toZonedDateTimeISO(tz ?? 'UTC');
  const datePart = zdt.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timePart = zdt.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${datePart} at ${timePart}${tz ? '' : ' UTC'}`;
}

/**
 * Formats an instant into a time string (e.g., "3:42 PM IST").
 * @param date - The instant to format, defaults to now.
 * @param tz - Optional IANA timezone string, defaults to UTC.
 * @returns The formatted time string.
 */
export function formatTime(date: TimestampInput = Temporal.Now.instant(), tz?: string): string {
  const zdt = toInstant(date).toZonedDateTimeISO(tz ?? 'UTC');
  return zdt.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  });
}

/**
 * Formats an instant into a relative time string (e.g., "in 3 minutes", "3 minutes ago").
 * @param date - The instant to calculate relative time from.
 * @returns The relative time string.
 */
export function formatRelativeTime(date: TimestampInput): string {
  const diffSec = Math.round(
    (toInstant(date).epochMilliseconds - Temporal.Now.instant().epochMilliseconds) / 1000
  );

  const divisions: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 60 * 60 * 24 * 365],
    ['month', 60 * 60 * 24 * 30],
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60],
    ['second', 1],
  ];

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  for (const [unit, secondsInUnit] of divisions) {
    if (Math.abs(diffSec) >= secondsInUnit || unit === 'second') {
      return rtf.format(Math.round(diffSec / secondsInUnit), unit);
    }
  }

  return rtf.format(diffSec, 'second');
}

/**
 * Formats a past instant into a human-readable time-ago string.
 * @param date - The past instant to format.
 * @param options - Configuration for compact output or a custom "now" reference.
 * @returns The formatted time-ago string.
 */
export function formatTimeAgo(
  date: TimestampInput,
  options: { compact?: boolean; now?: TimestampInput } = {}
): string {
  const { compact = false, now } = options;
  const nowInstant = now !== undefined ? toInstant(now) : Temporal.Now.instant();
  const diffSec = Math.max(
    0,
    Math.round((nowInstant.epochMilliseconds - toInstant(date).epochMilliseconds) / 1000)
  );

  const MIN = 60;
  const HOUR = MIN * 60;
  const DAY = HOUR * 24;
  const WEEK = DAY * 7;
  const MONTH = DAY * 30.4375;
  const YEAR = DAY * 365.25;

  if (diffSec < 10) return compact ? 'now' : 'a few seconds ago';
  if (diffSec < MIN) return compact ? `${diffSec}s` : `${diffSec} seconds ago`;
  if (diffSec < 90) return compact ? '1m' : 'a minute ago';
  if (diffSec < 45 * MIN) {
    const minutes = Math.round(diffSec / MIN);
    return compact ? `${minutes}m` : `${minutes} minutes ago`;
  }
  if (diffSec < 90 * MIN) return compact ? '1h' : 'about an hour ago';
  if (diffSec < DAY) {
    const hours = Math.round(diffSec / HOUR);
    return compact ? `${hours}h` : `${hours} hours ago`;
  }
  if (diffSec < 1.5 * DAY) return compact ? '1d' : 'a day ago';
  if (diffSec < WEEK) {
    const days = Math.round(diffSec / DAY);
    return compact ? `${days}d` : `${days} days ago`;
  }
  if (diffSec < 1.5 * WEEK) return compact ? '1w' : 'a week ago';
  if (diffSec < MONTH) {
    const weeks = Math.round(diffSec / WEEK);
    return compact ? `${weeks}w` : `${weeks} weeks ago`;
  }
  if (diffSec < 1.5 * MONTH) return compact ? '1mo' : 'a month ago';
  if (diffSec < YEAR) {
    const months = Math.round(diffSec / MONTH);
    return compact ? `${months}mo` : `${months} months ago`;
  }
  if (diffSec < 1.5 * YEAR) return compact ? '1y' : 'a year ago';

  const years = Math.round(diffSec / YEAR);
  return compact ? `${years}y` : `${years} years ago`;
}

/**
 * Determines the optimal refresh interval for time-ago UI labels.
 * @param date - The instant being displayed.
 * @param now - The current reference instant, defaults to now.
 * @returns The recommended refresh interval in milliseconds.
 */
export function getTimeAgoRefreshMs(
  date: TimestampInput,
  now: TimestampInput = Temporal.Now.instant()
): number {
  const diffSec = Math.max(
    0,
    Math.round((toInstant(now).epochMilliseconds - toInstant(date).epochMilliseconds) / 1000)
  );

  if (diffSec < 60) return 1_000;
  if (diffSec < 60 * 60) return 30_000;
  if (diffSec < 60 * 60 * 24) return 60_000;
  return 60 * 60 * 1000;
}

/**
 * Adds a specified number of seconds to a given instant.
 * @param date - The base instant.
 * @param seconds - The number of seconds to add.
 * @returns A new Temporal.Instant with the seconds added.
 */
export function addSeconds(date: TimestampInput, seconds: number): Temporal.Instant {
  return toInstant(date).add({ seconds });
}

/**
 * Checks if an instant has already passed.
 * @param date - The instant to check.
 * @returns True if the instant is in the past, otherwise false.
 */
export function isExpired(date: TimestampInput): boolean {
  return Temporal.Instant.compare(toInstant(date), Temporal.Now.instant()) < 0;
}

/**
 * Formats a duration in seconds into a human-readable string (e.g., "15 minutes").
 * @param totalSeconds - The total duration in seconds.
 * @returns The formatted duration string.
 */
export function formatDuration(totalSeconds: number): string {
  const units: [string, number][] = [
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1],
  ];

  for (const [label, secondsInUnit] of units) {
    if (totalSeconds >= secondsInUnit) {
      const value = Math.floor(totalSeconds / secondsInUnit);
      return `${value} ${label}${value !== 1 ? 's' : ''}`;
    }
  }

  return '0 seconds';
}

/**
 * Formats an instant as a time only (e.g., "9:05 PM") in an optional IANA timezone.
 */
export function formatTimeOnly(date: TimestampInput, tz?: string): string {
  const zdt = toInstant(date).toZonedDateTimeISO(tz ?? 'UTC');
  return zdt.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Returns the "YYYY-MM-DD" calendar date of an instant in a given timezone.
 */
export function getDateInTz(date: TimestampInput, tz?: string): string {
  return toInstant(date)
    .toZonedDateTimeISO(tz ?? 'UTC')
    .toPlainDate()
    .toString();
}
