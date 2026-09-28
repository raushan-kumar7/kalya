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
