import { FastifyReply, FastifyRequest } from 'fastify';
import { UserService } from './user.service';
import { ApiResponse } from '@/responses';
import {
  ALLOWED_AVATAR_MIME_TYPES,
  Identifiable,
  MAX_AVATAR_BYTES,
  Session,
  UpdateProfileDto,
  UpdateUsernameDto,
  User,
} from '@kalya/types';
import { BadRequestError, UnauthorizedError } from '@/errors';

type AuthenticatedUser = User & Identifiable;
type AuthenticatedSession = Session & Identifiable;

/**
 * Controller translating HTTP requests into user profile operations and standard response envelopes.
 *
 * @description Handles request parameter extraction, multipart file parsing, authentication context resolution, and standardized response generation.
 */
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Retrieves all platform users or searches users by query string for authenticated callers.
   *
   * @description Authenticated endpoint allowing users to search directory or list registered users.
   */
  getUsers = async (
    request: FastifyRequest<{
      Querystring: {
        search?: string;
        q?: string;
        limit?: number;
        offset?: number;
        includeSelf?: boolean;
      };
    }>,
    reply: FastifyReply
  ) => {
    const currentUserId = this.assertAuthenticatedUserId(request);
    const { search, q, limit, offset, includeSelf } = request.query ?? {};
    const query = search || q;

    const users = await this.userService.getUsers({
      query,
      limit,
      offset,
      excludeUserId: includeSelf ? undefined : currentUserId,
    });

    return ApiResponse.ok(reply, users, 'Users retrieved successfully');
  };

  /**
   * Retrieves the current authenticated user profile.
   *
   * @description Extracts user identity from request context and responds with full profile details in standard API envelope.
   */
  getMe = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = this.assertAuthenticatedUserId(request);
    const user = await this.userService.getProfile(userId);
    return ApiResponse.ok(reply, user, 'Profile retrieved successfully');
  };

  /**
   * Updates profile fields for the authenticated user.
   *
   * @description Accepts validated profile body data and invokes user service to update editable demographic and locale details.
   */
  updateMe = async (request: FastifyRequest<{ Body: UpdateProfileDto }>, reply: FastifyReply) => {
    const userId = this.assertAuthenticatedUserId(request);
    const updated = await this.userService.updateProfile(userId, request.body);
    return ApiResponse.ok(reply, updated, 'Profile updated successfully');
  };

  /**
   * Updates the primary username handle for the authenticated user.
   *
   * @description Updates unique username handle after validating uniqueness across all accounts in the database.
   */
  updateUsername = async (
    request: FastifyRequest<{ Body: UpdateUsernameDto }>,
    reply: FastifyReply
  ) => {
    const userId = this.assertAuthenticatedUserId(request);
    const updated = await this.userService.updateUsername(userId, request.body);
    return ApiResponse.ok(reply, updated, 'Username updated successfully');
  };

  /**
   * Generates a suggested unique username handle for the authenticated user.
   *
   * @description Resolves user identity from session context and returns an available unique username handle suggestion in standard response.
   */
  suggestUsername = async (
    request: FastifyRequest<{
      Querystring: { first_name?: string; last_name?: string; middle_name?: string };
    }>,
    reply: FastifyReply
  ) => {
    const userId = this.assertAuthenticatedUserId(request);
    const { first_name, last_name, middle_name } = request.query;

    let username: string;
    if (first_name || last_name) {
      username = await this.userService.generateUniqueUsername(
        first_name ?? '',
        last_name ?? '',
        middle_name
      );
    } else {
      username = await this.userService.suggestUsername(userId);
    }

    return ApiResponse.ok(reply, { username }, 'Suggested username generated successfully');
  };

  /**
   * Processes multipart avatar upload, validates image constraints, and updates user image.
   *
   * @description Parses multipart stream from request, validates size and MIME type, optimizes image, and saves avatar.
   */
  uploadAvatar = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = this.assertAuthenticatedUserId(request);

    const file = await request.file({
      limits: {
        fileSize: MAX_AVATAR_BYTES,
        files: 1,
      },
    });

    if (!file) {
      throw new BadRequestError(
        'No image file provided in multipart payload',
        'MISSING_AVATAR_FILE'
      );
    }

    // Validate MIME Type
    if (
      !ALLOWED_AVATAR_MIME_TYPES.includes(
        file.mimetype as (typeof ALLOWED_AVATAR_MIME_TYPES)[number]
      )
    ) {
      throw new BadRequestError(
        `Invalid image MIME type: ${file.mimetype}. Allowed: ${ALLOWED_AVATAR_MIME_TYPES.join(', ')}`,
        'INVALID_AVATAR_TYPE',
        { allowed: ALLOWED_AVATAR_MIME_TYPES, detected: file.mimetype }
      );
    }

    const fileBuffer = await file.toBuffer();

    if (fileBuffer.byteLength > MAX_AVATAR_BYTES) {
      throw new BadRequestError(
        `Avatar exceeds maximum permitted size of ${MAX_AVATAR_BYTES / (1024 * 1024)}MB`,
        'AVATAR_TOO_LARGE'
      );
    }

    const updatedUser = await this.userService.uploadAvatar(
      userId,
      fileBuffer,
      file.filename || 'avatar.jpg'
    );

    return ApiResponse.ok(reply, updatedUser, 'Avatar uploaded and updated successfully');
  };

  /**
   * Deletes the active avatar image for the authenticated user.
   *
   * @description Deletes current user avatar from configured storage driver and clears avatar reference on user profile.
   */
  deleteAvatar = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = this.assertAuthenticatedUserId(request);
    const updatedUser = await this.userService.deleteAvatar(userId);
    return ApiResponse.ok(reply, updatedUser, 'Avatar removed successfully');
  };

  /**
   * Retrieves all active sessions for the authenticated user.
   *
   * @description Returns all active, unexpired login sessions associated with authenticated user account for security review.
   */
  getSessions = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = this.assertAuthenticatedUserId(request);
    const sessions = await this.userService.getSessions(userId);
    return ApiResponse.ok(reply, sessions, 'Active sessions retrieved successfully');
  };

  /**
   * Revokes a specific session belonging to the user.
   *
   * @description Terminates an active session by its ID, guarding against attempts to delete sessions belonging to other accounts.
   */
  revokeSession = async (
    request: FastifyRequest<{ Params: { sessionId: string } }>,
    reply: FastifyReply
  ) => {
    const userId = this.assertAuthenticatedUserId(request);
    await this.userService.revokeSession(userId, request.params.sessionId);
    return ApiResponse.ok(reply, { revoked: true }, 'Session terminated successfully');
  };

  /**
   * Revokes all active sessions except the currently active session.
   *
   * @description Invalidates all login sessions for authenticated user excluding current session token to protect account security.
   */
  revokeOtherSessions = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = this.assertAuthenticatedUserId(request);
    const currentSessionId = (request.session as AuthenticatedSession | null)?.id;

    if (!currentSessionId) {
      throw new UnauthorizedError('Current session could not be determined', 'SESSION_UNRESOLVED');
    }

    const count = await this.userService.revokeAllOtherSessions(userId, currentSessionId);
    return ApiResponse.ok(
      reply,
      { revokedCount: count },
      `Successfully terminated ${count} other active session(s)`
    );
  };

  /**
   * Schedules account deletion with a 14-day grace period and dispatches email notice.
   */
  scheduleAccountDeletion = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = this.assertAuthenticatedUserId(request);
    const result = await this.userService.scheduleAccountDeletion(userId);
    return ApiResponse.ok(reply, result, 'Account scheduled for deletion in 14 days');
  };

  /**
   * Cancels a pending account deletion request and restores normal account status.
   */
  cancelAccountDeletion = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = this.assertAuthenticatedUserId(request);
    const result = await this.userService.cancelAccountDeletion(userId);
    return ApiResponse.ok(reply, result, 'Account deletion request successfully cancelled');
  };

  /**
   * Requests an update to primary email address, dispatching a verification email.
   */
  requestEmailChange = async (
    request: FastifyRequest<{ Body: { newEmail: string } }>,
    reply: FastifyReply
  ) => {
    const userId = this.assertAuthenticatedUserId(request);
    const result = await this.userService.requestEmailChange(userId, request.body.newEmail);
    return ApiResponse.ok(reply, result, 'Verification email sent to new address');
  };

  /**
   * Admin broadcast of Terms / Privacy Policy update notice to all verified users.
   */
  broadcastPolicyUpdate = async (
    request: FastifyRequest<{
      Body: { effectiveDate: string; termsUrl?: string; privacyUrl?: string };
    }>,
    reply: FastifyReply
  ) => {
    const result = await this.userService.broadcastPolicyUpdate(request.body);
    return ApiResponse.ok(reply, result, `Policy update dispatched to ${result.totalSent} users`);
  };

  /**
   * Asserts that request has a valid authenticated user ID.
   */
  private assertAuthenticatedUserId(request: FastifyRequest): string {
    const user = request.user as AuthenticatedUser | null;
    if (!user?.id) {
      throw new UnauthorizedError(
        'Authentication required to access user profile',
        'UNAUTHENTICATED'
      );
    }
    return user.id;
  }
}
