import { type DatabaseClient, eq, schema } from '@kalya/db';
import type { AuthInstance } from './auth.instance';
import type { AvailabilityResponse, CheckAvailabilityDto } from '@kalya/types';
import { UnauthorizedError } from '@/errors';
import { generateUniqueUsername } from '../helpers';

/**
 * Service orchestrating authentication workflows, credential verifications, and session resolutions.
 *
 * @description Coordinates Better-Auth instance integration, username availability checks, and unique handle generation for authenticated user operations.
 */
export class AuthService {
  constructor(
    private readonly db: DatabaseClient,
    private readonly auth: AuthInstance
  ) {}

  /**
   * Generates a unique, collision-resistant username handle compliant with UsernameSchema.
   *
   * @description Merges name parts into normalized slug handle and resolves collisions against existing database usernames using incremental suffixes.
   *
   * @param {string} firstName - First name of user.
   * @param {string} lastName - Last name of user.
   * @param {string} [middleName] - Optional middle name.
   * @returns {Promise<string>} Unique username handle meeting length constraints.
   */
  async generateUniqueUsername(
    firstName: string,
    lastName: string,
    middleName?: string
  ): Promise<string> {
    return generateUniqueUsername(this.db, firstName, lastName, middleName);
  }

  /**
   * Performs an instant uniqueness check for username or email.
   *
   * @description Queries database to verify if an email address or username handle is already claimed by an account.
   *
   * @param {CheckAvailabilityDto} dto - Field and value to inspect for uniqueness.
   * @returns {Promise<AvailabilityResponse>} Availability status and user-facing message.
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
   *
   * @description Validates incoming request headers with Better-Auth authentication engine to resolve active user identity and session token.
   *
   * @param {HeadersInit} headers - Inbound HTTP request headers.
   * @returns {Promise<unknown>} Authenticated user and session context.
   * @throws {UnauthorizedError} If session extraction or verification fails.
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
