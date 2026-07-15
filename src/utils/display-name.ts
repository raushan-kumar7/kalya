/**
 * Builds the single `name` field Better Auth expects at sign-up from your
 * separate first/middle/last inputs. Kept async to match how it's called
 * (`await displayName(...)`) in case this later needs to normalize against
 * a server-side profanity/format check — right now it's pure formatting.
 */
export const displayName = async (
  firstName: string,
  lastName: string,
  middleName?: string
): Promise<string> => {
  return [firstName, middleName, lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");
};
