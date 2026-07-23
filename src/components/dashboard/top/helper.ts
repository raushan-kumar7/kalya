const GREETING_VARIANTS = {
  morning: ["Good morning", "Coffee time"],
  afternoon: ["Good afternoon", "Hope your day's going well"],
  evening: ["Good evening", "Evening"],
  night: ["Hello, night owl", "Burning the midnight oil?", "Still up?"],
} as const;

/**
 * Time-of-day greeting for dashboard headings, e.g. "Good morning".
 * Rotates between a few phrasings per time-of-day bucket so the heading
 * doesn't feel static on every visit. Optionally timezone-aware — pass
 * the user's IANA timezone if you have one on hand; otherwise falls back
 * to the browser's local time.
 */
export function getGreeting(timezone?: string): string {
  const hour = timezone
    ? Number(
        new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          hourCycle: "h23",
          timeZone: timezone,
        }).format(new Date())
      )
    : new Date().getHours();

  const bucket: keyof typeof GREETING_VARIANTS =
    hour >= 5 && hour < 12
      ? "morning"
      : hour >= 12 && hour < 17
        ? "afternoon"
        : hour >= 17 && hour < 21
          ? "evening"
          : "night"; // 21:00–04:59, wraps past midnight

  const options = GREETING_VARIANTS[bucket];
  return options[Math.floor(Math.random() * options.length)];
}
