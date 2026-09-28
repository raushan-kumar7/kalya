import slugify from 'slugify';
import { BadRequestError } from '@/errors';
import { type DatabaseClient, eq, schema } from '@kalya/db';
import { AUTH_LIMITS } from '@kalya/types';
import { fullName } from '@kalya/utils';

/**
 * Generates a unique, collision-resistant username handle compliant with UsernameSchema.
 *
 * @description Merges name parts into normalized slug handle and resolves collisions against existing database usernames using incremental suffixes.
 *
 * @param {DatabaseClient} db - Active Drizzle database client instance.
 * @param {string} firstName - First name of user.
 * @param {string} lastName - Last name of user.
 * @param {string} [middleName] - Optional middle name.
 * @returns {Promise<string>} Unique username handle meeting length constraints.
 * @throws {BadRequestError} If both first and last names are missing.
 */
export const generateUniqueUsername = async (
  db: DatabaseClient,
  firstName: string,
  lastName: string,
  middleName?: string
): Promise<string> => {
  if (!firstName?.trim() && !lastName?.trim()) {
    throw new BadRequestError('At least one name component is required to generate a username');
  }

  const rawParts = await fullName(firstName, lastName, middleName);
  const base = slugify(rawParts, {
    lower: true,
    strict: true,
    trim: true,
    replacement: '_',
  });

  const safeBase = (base.slice(0, 24) || 'user').replace(/_+/g, '_');

  let candidate = safeBase;
  let attempt = 0;
  const MAX_ATTEMPTS = 5;

  while (attempt < MAX_ATTEMPTS) {
    const [existing] = await db
      .select({ id: schema.user.id })
      .from(schema.user)
      .where(eq(schema.user.username, candidate))
      .limit(1);

    if (!existing) {
      return candidate;
    }

    attempt++;
    const suffix = Math.floor(1000 + Math.random() * 9000);
    candidate = `${safeBase}_${suffix}`.slice(0, AUTH_LIMITS.MAX_USERNAME_LENGTH);
  }

  // Fallback: Append last 5 digits of current timestamp
  const fallbackSuffix = Date.now().toString().slice(-5);
  return `${safeBase}_${fallbackSuffix}`.slice(0, AUTH_LIMITS.MAX_USERNAME_LENGTH);
};
