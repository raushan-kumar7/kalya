/**
 * Formats a composite full name from individual name components.
 *
 * @description Trims and concatenates first, middle, and last name components into a single space-separated composite full name string.
 *
 * @param {string | null | undefined} firstName - Given or legal first name.
 * @param {string | null | undefined} lastName - Family or legal last name.
 * @param {string | null | undefined} [middleName] - Optional middle name.
 * @returns {Promise<string>} Concatenated full name string.
 */
export const fullName = async (
  firstName?: string | null,
  lastName?: string | null,
  middleName?: string | null
): Promise<string> => {
  return [firstName, middleName, lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ');
};

/**
 * Extracts uppercase initials from a person's name (e.g., "John Doe" -> "JD").
 *
 * @param {string | null | undefined} name - Full or single name string.
 * @param {string} [fallback='?'] - Fallback character when name is empty.
 * @returns {string} One or two character uppercase initials.
 */
export const getInitials = (name?: string | null, fallback = '?'): string => {
  if (!name) return fallback;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Partially masks an email address for privacy and confirmation screens (e.g. "alex@example.com" -> "a***x@example.com").
 *
 * @param {string | null | undefined} email - The email address to mask.
 * @returns {string} Obfuscated email string.
 */
export const maskEmail = (email?: string | null): string => {
  if (!email || !email.includes('@')) return email ?? '';
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local[0]}*@${domain}`;
  }
  return `${local[0]}${'*'.repeat(Math.min(5, Math.max(1, local.length - 2)))}${local[local.length - 1]}@${domain}`;
};
