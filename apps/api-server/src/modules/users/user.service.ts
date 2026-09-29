import crypto from 'node:crypto';
import { BadRequestError, ConflictError, InternalServerError, NotFoundError } from '@/errors';
import { AVATAR_OPTIMIZE_PRESET, getStorage } from '@/libs/storage';
import { getMailer } from '@/libs/mail';
import { log } from '@/logger';
import { and, type DatabaseClient, desc, eq, gt, ne, schema } from '@kalya/db';
import { AccountDeletionNotice, PolicyUpdateNotice } from '@kalya/email';
import { env } from '@kalya/env';
import type {
  Session,
  StorageProvider,
  UpdateProfileDto,
  UpdateUsernameDto,
  User,
} from '@kalya/types';
import { formatCardDate, formatDateTime, fullName } from '@kalya/utils';
import { generateUniqueUsername, resolveDisplayName, resolveUserTimezone } from '../helpers';
import { handleSendEmailChangeVerification } from '../auth/hooks';

/**
 * Service orchestrating user profile mutations, session life-cycles, and media storage operations.
 *
 * @description Encapsulates profile updates, username conflict verifications, avatar optimizations, and session revocations using Drizzle database queries.
 */
export class UserService {
  constructor(
    private readonly db: DatabaseClient,
    private readonly storage: StorageProvider = getStorage()
  ) {}

  /**
   * Retrieves the comprehensive user profile record by unique ID.
   *
   * @description Fetches a single user record from database by identifier, throwing a standard not-found error if nonexistent.
   *
   * @param {string} userId - Target user unique identifier.
   * @returns {Promise<User>} Fully populated user profile entity.
   * @throws {NotFoundError} If no user corresponds to the identifier.
   */
  async getProfile(userId: string): Promise<User> {
    const [foundUser] = await this.db
      .select()
      .from(schema.user)
      .where(eq(schema.user.id, userId))
      .limit(1);

    if (!foundUser) {
      throw new NotFoundError('User profile not found', 'USER_NOT_FOUND', { userId });
    }

    return foundUser as unknown as User;
  }

  /**
   * Modifies editable user profile attributes and synchronizes composite full name.
   *
   * @description Updates user demographics and locale preferences in database while synchronizing composite full name from provided parts.
   *
   * @param {string} userId - Authenticated user identifier.
   * @param {UpdateProfileDto} dto - Validated profile update properties.
   * @returns {Promise<User>} Updated user profile entity.
   */
  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    const existing = await this.getProfile(userId);

    const firstName = dto.first_name ?? existing.first_name;
    const middleName = dto.middle_name !== undefined ? dto.middle_name : existing.middle_name;
    const lastName = dto.last_name ?? existing.last_name;

    const compositeFullName = await fullName(firstName, lastName, middleName ?? undefined);

    const [updatedUser] = await this.db
      .update(schema.user)
      .set({
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        name: compositeFullName,
        displayUsername:
          dto.displayUsername !== undefined ? dto.displayUsername : existing.displayUsername,
        gender: dto.gender !== undefined ? dto.gender : existing.gender,
        dateOfBirth: dto.dateOfBirth !== undefined ? dto.dateOfBirth : existing.dateOfBirth,
        phone: dto.phone !== undefined ? dto.phone : existing.phone,
        locale: dto.locale !== undefined ? dto.locale : existing.locale,
        timezone: dto.timezone !== undefined ? dto.timezone : existing.timezone,
        currency: dto.currency !== undefined ? dto.currency : existing.currency,
        image: dto.image !== undefined ? dto.image : existing.image,
      })
      .where(eq(schema.user.id, userId))
      .returning();

    if (!updatedUser) {
      throw new InternalServerError(
        'Failed to apply user profile updates',
        'PROFILE_UPDATE_FAILED'
      );
    }

    return updatedUser as unknown as User;
  }

  /**
   * Changes the primary username handle after performing collision verification.
   *
   * @description Verifies username availability across existing records and updates the handle for the authenticated user in database.
   *
   * @param {string} userId - Authenticated user identifier.
   * @param {UpdateUsernameDto} dto - New username handle input payload.
   * @returns {Promise<User>} Updated user profile entity.
   * @throws {ConflictError} If username is already claimed by another user.
   */
  async updateUsername(userId: string, dto: UpdateUsernameDto): Promise<User> {
    const normalized = dto.username.trim().toLowerCase();

    // Verify collision against other user records
    const [collision] = await this.db
      .select({ id: schema.user.id })
      .from(schema.user)
      .where(and(eq(schema.user.username, normalized), ne(schema.user.id, userId)))
      .limit(1);

    if (collision) {
      throw new ConflictError('Username is already taken by another account', 'USERNAME_TAKEN', {
        username: normalized,
      });
    }

    const [updatedUser] = await this.db
      .update(schema.user)
      .set({ username: normalized })
      .where(eq(schema.user.id, userId))
      .returning();

    return updatedUser as unknown as User;
  }

  /**
   * Suggests an available, collision-free username handle based on authenticated user name.
   *
   * @description Fetches user profile name parts and generates an available, collision-resistant username candidate conforming to system validation rules.
   *
   * @param {string} userId - Authenticated user unique identifier.
   * @returns {Promise<string>} Generated unique username candidate.
   */
  async suggestUsername(userId: string): Promise<string> {
    const user = await this.getProfile(userId);
    return generateUniqueUsername(
      this.db,
      user.first_name || '',
      user.last_name || '',
      user.middle_name || undefined
    );
  }

  /**
   * Generates a unique, collision-resistant username handle compliant with UsernameSchema.
   *
   * @description Merges name components into normalized slug handle and resolves collisions against existing database usernames using incremental suffixes.
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
   * Optimizes and persists an uploaded avatar image, updating user profile record.
   *
   * @description Processes image buffer through storage pipeline with WebP optimization and updates the avatar URL on user profile.
   *
   * @param {string} userId - Authenticated user identifier.
   * @param {Buffer} fileBuffer - Raw multipart image file buffer.
   * @param {string} originalFilename - Original filename of uploaded image.
   * @returns {Promise<User>} Updated user profile entity with new avatar URL.
   */
  async uploadAvatar(userId: string, fileBuffer: Buffer, originalFilename: string): Promise<User> {
    const existing = await this.getProfile(userId);

    // Upload to configured storage backend (Local disk or Cloudinary)
    const result = await this.storage.upload(fileBuffer, {
      filename: `avatar_${userId}_${originalFilename}`,
      folder: `avatars/${userId}`,
      optimize: AVATAR_OPTIMIZE_PRESET,
    });

    const [updatedUser] = await this.db
      .update(schema.user)
      .set({ image: result.url })
      .where(eq(schema.user.id, userId))
      .returning();

    // Clean up previous storage asset if different
    if (existing.image && existing.image !== result.url && result.publicId) {
      try {
        await this.storage.delete(existing.image);
      } catch {
        // Silently tolerate stale image deletion errors
      }
    }

    return updatedUser as unknown as User;
  }

  /**
   * Removes current avatar asset from storage backend and database record.
   *
   * @description Deletes the active avatar asset from storage backend and sets the profile image URL to null.
   *
   * @param {string} userId - Authenticated user identifier.
   * @returns {Promise<User>} Updated user profile entity without avatar URL.
   */
  async deleteAvatar(userId: string): Promise<User> {
    const existing = await this.getProfile(userId);

    if (existing.image) {
      try {
        await this.storage.delete(existing.image);
      } catch {
        // Silently tolerate deletion failure
      }
    }

    const [updatedUser] = await this.db
      .update(schema.user)
      .set({ image: null })
      .where(eq(schema.user.id, userId))
      .returning();

    return updatedUser as unknown as User;
  }

  /**
   * Retrieves all non-expired active sessions for the authenticated user.
   *
   * @description Queries database for all unexpired active sessions belonging to the user ordered by creation date descending.
   *
   * @param {string} userId - Target user identifier.
   * @returns {Promise<Session[]>} Array of active user session entities.
   */
  async getSessions(userId: string): Promise<Session[]> {
    const now = new Date();

    const activeSessions = await this.db
      .select()
      .from(schema.session)
      .where(and(eq(schema.session.userId, userId), gt(schema.session.expiresAt, now)))
      .orderBy(desc(schema.session.createdAt));

    return activeSessions as unknown as Session[];
  }

  /**
   * Revokes a designated active session belonging to the authenticated user.
   *
   * @description Deletes a single session record belonging to the authenticated user, guarding against unauthorized session deletion attempts.
   *
   * @param {string} userId - Authenticated user identifier.
   * @param {string} sessionId - Target session unique identifier.
   * @returns {Promise<void>} Resolves when session is deleted.
   * @throws {NotFoundError} If the target session does not belong to the user or does not exist.
   */
  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const [deleted] = await this.db
      .delete(schema.session)
      .where(and(eq(schema.session.id, sessionId), eq(schema.session.userId, userId)))
      .returning({ id: schema.session.id });

    if (!deleted) {
      throw new NotFoundError('Session not found or already terminated', 'SESSION_NOT_FOUND', {
        sessionId,
      });
    }
  }

  /**
   * Revokes all active sessions for the user except the currently active session.
   *
   * @description Deletes all active session records for the user excluding the current session token identifier from database.
   *
   * @param {string} userId - Authenticated user identifier.
   * @param {string} currentSessionId - Session identifier to preserve.
   * @returns {Promise<number>} Total count of revoked sessions.
   */
  async revokeAllOtherSessions(userId: string, currentSessionId: string): Promise<number> {
    const revoked = await this.db
      .delete(schema.session)
      .where(and(eq(schema.session.userId, userId), ne(schema.session.id, currentSessionId)))
      .returning({ id: schema.session.id });

    return revoked.length;
  }

  /**
   * Initiates account deletion with a 14-day grace period, revoking other sessions
   * and emailing the AccountDeletionNotice template with a cancellation link.
   *
   * @param {string} userId - Target user unique identifier.
   * @returns {Promise<{ scheduledDate: Date; gracePeriodDays: number }>} Deletion schedule details.
   */
  async scheduleAccountDeletion(
    userId: string
  ): Promise<{ scheduledDate: Date; gracePeriodDays: number }> {
    const [user] = await this.db
      .select()
      .from(schema.user)
      .where(eq(schema.user.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundError('User account not found', 'USER_NOT_FOUND', { userId });
    }

    const gracePeriodDays = 14;
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + gracePeriodDays);

    // 1. Mark user record sync_status as PENDING
    await this.db
      .update(schema.user)
      .set({
        sync_status: 'PENDING',
        updatedAt: new Date(),
      })
      .where(eq(schema.user.id, userId));

    const tz = resolveUserTimezone(user.timezone);

    // 2. Dispatch AccountDeletionNotice email using @kalya/utils formatters (non-blocking)
    void getMailer()
      .sendTemplate({
        template: AccountDeletionNotice,
        props: {
          userName: resolveDisplayName(user),
          userEmail: user.email,
          requestedAt: formatDateTime(new Date(), tz),
          scheduledDeletionDate: formatCardDate(scheduledDate.toISOString().split('T')[0]),
          gracePeriodDays,
          cancelDeletionUrl: `${env.app.clientUrl}/settings/account/cancel-deletion`,
        },
        to: user.email,
        subject: 'Important: Kalya account deletion confirmation',
      })
      .catch((err) => {
        log.error(err, {
          action: 'ACCOUNT_DELETION_EMAIL_FAILED',
          userId,
          to: user.email,
        });
      });

    return { scheduledDate, gracePeriodDays };
  }

  /**
   * Cancels scheduled account deletion and restores active account status.
   *
   * @param {string} userId - Target user unique identifier.
   * @returns {Promise<{ restored: boolean }>} Restoration status confirmation.
   */
  async cancelAccountDeletion(userId: string): Promise<{ restored: boolean }> {
    const [user] = await this.db
      .select()
      .from(schema.user)
      .where(eq(schema.user.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundError('User account not found', 'USER_NOT_FOUND', { userId });
    }

    await this.db
      .update(schema.user)
      .set({
        sync_status: 'SYNCED',
        updatedAt: new Date(),
      })
      .where(eq(schema.user.id, userId));

    return { restored: true };
  }

  /**
   * Initiates primary email change by generating a token and dispatching VerifyEmailChange.
   *
   * @param {string} userId - Target user unique identifier.
   * @param {string} newEmail - New target email address.
   * @returns {Promise<{ pending: boolean }>} Confirmation of pending email verification.
   */
  async requestEmailChange(userId: string, newEmail: string): Promise<{ pending: boolean }> {
    const normalizedNewEmail = newEmail.trim().toLowerCase();

    // Check if new email is already registered
    const [existing] = await this.db
      .select({ id: schema.user.id })
      .from(schema.user)
      .where(eq(schema.user.email, normalizedNewEmail))
      .limit(1);

    if (existing) {
      throw new BadRequestError(
        'Email address is already in use by another account',
        'EMAIL_ALREADY_EXISTS'
      );
    }

    const [user] = await this.db
      .select()
      .from(schema.user)
      .where(eq(schema.user.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundError('User account not found', 'USER_NOT_FOUND', { userId });
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Store verification token in Better-Auth verification table
    await this.db.insert(schema.verification).values({
      id: crypto.randomUUID(),
      identifier: `email-change:${userId}:${normalizedNewEmail}`,
      value: token,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const verificationUrl = `${env.app.clientUrl}/verify-email-change?token=${token}`;

    await handleSendEmailChangeVerification({
      userName: resolveDisplayName(user),
      currentEmail: user.email,
      newEmail: normalizedNewEmail,
      verificationUrl,
    });

    return { pending: true };
  }

  /**
   * Broadcasts PolicyUpdateNotice to all active users in batches of 50 with 250ms backoff.
   *
   * @param {object} dto - Policy update broadcast details.
   * @returns {Promise<{ totalSent: number }>} Total number of recipients.
   */
  async broadcastPolicyUpdate(dto: {
    effectiveDate: string;
    termsUrl?: string;
    privacyUrl?: string;
  }): Promise<{ totalSent: number }> {
    const activeUsers = await this.db
      .select({
        email: schema.user.email,
        firstName: schema.user.first_name,
        name: schema.user.name,
      })
      .from(schema.user)
      .where(eq(schema.user.emailVerified, true));

    const CHUNK_SIZE = 50;
    for (let i = 0; i < activeUsers.length; i += CHUNK_SIZE) {
      const chunk = activeUsers.slice(i, i + CHUNK_SIZE);
      await Promise.allSettled(
        chunk.map((u) =>
          getMailer().sendTemplate({
            template: PolicyUpdateNotice,
            props: {
              userName: resolveDisplayName(u, 'Valued Member'),
              effectiveDate: dto.effectiveDate,
              termsUrl: dto.termsUrl || `${env.app.clientUrl}/terms`,
              privacyUrl: dto.privacyUrl || `${env.app.clientUrl}/privacy`,
            },
            to: u.email,
            subject: "Important updates to Kalya's Terms of Service and Privacy Policy",
          })
        )
      );

      // Backoff between batches to prevent provider rate limits
      if (i + CHUNK_SIZE < activeUsers.length) {
        await new Promise((res) => setTimeout(res, 250));
      }
    }

    return { totalSent: activeUsers.length };
  }
}
