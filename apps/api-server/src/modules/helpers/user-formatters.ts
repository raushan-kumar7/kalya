/**
 * Resolves a friendly display name for transactional emails, notices, and UI greetings.
 *
 * @param user - User identity object with first_name, firstName, or name properties.
 * @param fallback - Default fallback name if no parts are found.
 * @returns Sanitized display name string.
 */
export function resolveDisplayName(
  user?: {
    first_name?: string | null;
    firstName?: string | null;
    name?: string | null;
  } | null,
  fallback = 'Valued User'
): string {
  if (!user) return fallback;
  return user.first_name?.trim() || user.firstName?.trim() || user.name?.trim() || fallback;
}

/**
 * Resolves a safe timezone fallback for localized date/time formatting.
 *
 * @param timezone - Optional user timezone string.
 * @param fallback - Default system timezone ('Asia/Kolkata').
 * @returns Verified non-empty timezone string.
 */
export function resolveUserTimezone(timezone?: string | null, fallback = 'Asia/Kolkata'): string {
  return timezone?.trim() || fallback;
}
