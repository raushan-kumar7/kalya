import slugify from 'slugify';
import { type DatabaseClient, eq, schema } from '@kalya/db';
import type { AuthInstance } from './auth.instance';
import { AUTH_LIMITS, type AvailabilityResponse, type CheckAvailabilityDto } from '@kalya/types';
import { BadRequestError, InternalServerError, UnauthorizedError } from '@/errors';

export class AuthService {
  constructor(
    private readonly db: DatabaseClient,
    private readonly auth: AuthInstance
  ) {}

  /**
   * Generates a unique, collision-resistant username handle compliant with UsernameSchema.
   *
   * @description
   * 1. Merges name parts: `${firstName} ${middleName ?? ''} ${lastName}`.
   * 2. Uses slugify with `replacement: '_'` (critical: UsernameSchema enforces alphanumeric + underscore).
   * 3. Truncates base slug to 24 characters to guarantee headroom for numeric suffixes within AUTH_LIMITS.
   * 4. Attempts up to MAX_ATTEMPTS collision checks against existing usernames.
   * 5. Falls back to timestamp suffix if all random attempts collide.
   */
  async generateUniqueUsername(
    firstName: string,
    lastName: string,
    middleName?: string
  ): Promise<string> {
    if (!firstName?.trim() && !lastName?.trim()) {
      throw new BadRequestError('At least one name component is required to generate a username');
    }
    const rawParts = [firstName, middleName, lastName].filter(Boolean).join(' ');
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
      const [existing] = await this.db
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
  }

  /**
   * Performs an instant uniqueness check for username or email.
   */
  async checkAvailability(dto: CheckAvailabilityDto): Promise<AvailabilityResponse> {
    const { field, value } = dto;
    const normalized = value.trim().toLowerCase();

    let exists = false;
    if (field === 'username') {
      const [found] = await this.db
        .select({ id: schema.user.id })
        .from(schema.user)
        .where(eq(schema.user.username, normalized))
        .limit(1);
      exists = !!found;
    } else {
      const [found] = await this.db
        .select({ id: schema.user.id })
        .from(schema.user)
        .where(eq(schema.user.email, normalized))
        .limit(1);
      exists = !!found;
    }

    return {
      field,
      value: normalized,
      available: !exists,
      message: exists ? `${field} is already taken` : `${field} is available`,
    };
  }

  /**
   * Resolves the active session and user from request headers using Better-Auth.
   */
  async resolveSession(headers: HeadersInit) {
    try {
      return await this.auth.api.getSession({ headers });
    } catch (error) {
      throw new UnauthorizedError(
        'Failed to resolve active session',
        'SESSION_RESOLVE_FAILED',
        undefined,
        error
      );
    }
  }
}
