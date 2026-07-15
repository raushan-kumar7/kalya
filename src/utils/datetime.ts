/* =====================================================================
   DATETIME UTILS
   Single home for every date/time helper in the app — email/notification
   formatting (timezone-aware) and pure calendar-math helpers used by
   components/ui/date-picker.tsx (timezone-agnostic, local-time only).
   ===================================================================== */

/** Normalizes the flexible input type used across every helper below. */
function toDate(date: Date | string | number): Date {
  return typeof date === "string" || typeof date === "number" ? new Date(date) : date;
}

/* ---------------------------------------------------------------------
   EMAIL / NOTIFICATION FORMATTING
   These accept an optional IANA timezone (e.g. "Asia/Kolkata") and fall
   back to UTC when none is given — appropriate for transactional email
   where you often don't know the recipient's local timezone.
   --------------------------------------------------------------------- */

/**
 * Formats a date for display in emails, e.g. "5 Jul 2026, 3:42 PM IST"
 * Defaults to the user's timezone if provided, otherwise falls back to UTC.
 */
export function formatDateTime(
  date: Date | string | number = new Date(),
  timezone?: string
): string {
  const d = toDate(date);

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
    timeZone: timezone || "UTC",
  }).format(d);
}

/**
 * Short date only, e.g. "5 Jul 2026"
 */
export function formatDate(date: Date | string | number = new Date(), timezone?: string): string {
  const d = toDate(date);

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: timezone || "UTC",
  }).format(d);
}

/**
 * Time only, e.g. "3:42 PM IST"
 */
export function formatTime(date: Date | string | number = new Date(), timezone?: string): string {
  const d = toDate(date);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
    timeZone: timezone || "UTC",
  }).format(d);
}

/**
 * Relative time, e.g. "3 minutes ago", "in 15 minutes"
 * Useful for "your session expires in X" or "signed in X ago" copy.
 */
export function formatRelativeTime(date: Date | string | number): string {
  const d = toDate(date);
  const diffMs = d.getTime() - Date.now();
  const diffSec = Math.round(diffMs / 1000);

  const divisions: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
    ["second", 1],
  ];

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  for (const [unit, secondsInUnit] of divisions) {
    if (Math.abs(diffSec) >= secondsInUnit || unit === "second") {
      return rtf.format(Math.round(diffSec / secondsInUnit), unit);
    }
  }

  return rtf.format(diffSec, "second");
}

/**
 * Adds N seconds to a date — handy for computing expiry timestamps
 * (e.g. session.expiresIn, verification link expiry).
 */
export function addSeconds(date: Date, seconds: number): Date {
  return new Date(date.getTime() + seconds * 1000);
}

/**
 * Checks if a date has passed.
 */
export function isExpired(date: Date | string | number): boolean {
  return toDate(date).getTime() < Date.now();
}

/**
 * Human-readable duration from seconds, e.g. 900 -> "15 minutes"
 * Useful for messaging like "Your session will expire in {formatDuration(session.expiresIn)}"
 */
export function formatDuration(totalSeconds: number): string {
  const units: [string, number][] = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
    ["second", 1],
  ];

  for (const [label, secondsInUnit] of units) {
    if (totalSeconds >= secondsInUnit) {
      const value = Math.floor(totalSeconds / secondsInUnit);
      return `${value} ${label}${value !== 1 ? "s" : ""}`;
    }
  }

  return "0 seconds";
}

/* ---------------------------------------------------------------------
   CALENDAR HELPERS (components/ui/date-picker.tsx)
   Deliberately timezone-agnostic — these operate on local calendar days
   (year/month/date components), never on absolute instants, since a
   date picker is choosing a *day*, not a moment in time. Mixing these
   with the UTC-defaulting formatters above would silently shift the
   selected day near midnight for users west of UTC — keep that
   distinction if you touch either half of this file.
   --------------------------------------------------------------------- */

export const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Serializes a local calendar date to "yyyy-mm-dd" (matches
 * <input type="date"> and ProfileSchema's date_of_birth field). */
export function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parses "yyyy-mm-dd" as a local calendar date (not UTC midnight —
 * avoids the classic off-by-one-day bug near timezone boundaries). */
export function fromISO(value?: string | null): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  return isNaN(date.getTime()) ? null : date;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Long display format for the date-picker trigger, e.g. "July 5, 2026".
 * Locale-aware (uses the browser's locale) and intentionally has no
 * timezone param — see module note above. */
export function formatCalendarDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Same output as formatCalendarDate ("July 5, 2026") but tolerant of
 * missing/invalid input — for read-only display of optional date fields
 * like date_of_birth. Goes through fromISO rather than `new Date(value)`
 * directly, so it doesn't suffer the UTC-parsing off-by-one-day issue
 * described in the module note above. */
export function formatCalendarDateOrDash(value?: string | null): string {
  const date = fromISO(value);
  return date ? formatCalendarDate(date) : "—";
}

/** Returns a 6x7 grid of dates covering the visible month, including
 * the trailing/leading days from adjacent months needed to fill the grid. */
export function buildMonthGrid(viewYear: number, viewMonth: number): Date[] {
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startOffset = firstOfMonth.getDay(); // 0 = Sunday
  const gridStart = new Date(viewYear, viewMonth, 1 - startOffset);

  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);
    return date;
  });
}
