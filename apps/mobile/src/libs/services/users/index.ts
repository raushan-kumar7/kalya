import { ENDPOINTS, http } from '@/libs/api';
import type { Session, UpdateProfileDto, UpdateUsernameDto, User } from '@kalya/types';
import { buildQueryString } from '../helper';

export interface SuggestUsernameParams {
  first_name?: string;
  last_name?: string;
  middle_name?: string;
}

export interface GetUsersParams {
  search?: string;
  q?: string;
  limit?: number;
  offset?: number;
}

export class UserService {
  /**
   * Retrieves profile information of the current authenticated user.
   *
   * @description Fetches personal profile, display handles, localization, and governance role from `/api/v1/users/me`.
   * @returns {Promise<User>} The authenticated user's profile object.
   */
  static async getMe(): Promise<User> {
    return http.get<User>(ENDPOINTS.USERS.ME);
  }

  /**
   * Updates mutable fields on the current user's profile.
   *
   * @description Modifies names, gender, date of birth, currency, timezone, and locale preferences.
   * @param {UpdateProfileDto} dto - Partial profile update payload.
   * @returns {Promise<User>} The updated user profile object returned by the server.
   */
  static async updateProfile(dto: UpdateProfileDto): Promise<User> {
    return http.patch<User>(ENDPOINTS.USERS.UPDATE_PROFILE, dto);
  }

  /**
   * Updates the unique public username handle for the authenticated user.
   *
   * @description Validates and persists the new handle. Subject to uniqueness constraints.
   * @param {UpdateUsernameDto} dto - Payload containing the new username.
   * @returns {Promise<User>} The updated user profile with modified username.
   */
  static async updateUsername(dto: UpdateUsernameDto): Promise<User> {
    return http.patch<User>(ENDPOINTS.USERS.UPDATE_USERNAME, dto);
  }

  /**
   * Generates intelligent username suggestions based on user names.
   *
   * @description Queries backend name generation engine with first, middle, and last names.
   * @param {SuggestUsernameParams} [params] - Optional user name components.
   * @returns {Promise<{ username: string }>} Suggested unique username handle.
   */
  static async suggestUsername(params?: SuggestUsernameParams): Promise<{ username: string }> {
    const qs = buildQueryString(params as Record<string, unknown>);
    return http.get<{ username: string }>(`${ENDPOINTS.USERS.SUGGEST_USERNAME}${qs}`);
  }

  /**
   * Uploads an avatar image using React Native multipart FormData.
   *
   * @description Converts a local device image descriptor into a standard FormData payload and uploads to the media storage service.
   * @param {{ uri: string; name: string; type: string }} file - Local image file descriptor with native URI, filename, and MIME type.
   * @returns {Promise<{ avatarUrl: string }>} Cloud storage URL pointing to the uploaded avatar.
   */
  static async uploadAvatar(file: {
    uri: string;
    name: string;
    type: string;
  }): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as unknown as Blob);

    return http.post<{ avatarUrl: string }>(ENDPOINTS.USERS.AVATAR, formData);
  }

  /**
   * Searches the platform user directory by text query or paginated filter.
   *
   * @description Used for friend search, split-bill participant suggestions, and user mentions.
   * @param {GetUsersParams} [params] - Query search filter, pagination limit, and offset.
   * @returns {Promise<User[]>} Array of matching platform users.
   */
  static async searchUsers(params?: GetUsersParams): Promise<User[]> {
    const qs = buildQueryString(params as Record<string, unknown>);
    return http.get<User[]>(`${ENDPOINTS.USERS.SEARCH}${qs}`);
  }

  /**
   * Lists all active concurrent sessions across web and native devices for the user.
   *
   * @description Queries active session records including IP addresses, user agents, and expiry timestamps.
   * @returns {Promise<Session[]>} Array of active session objects.
   */
  static async getSessions(): Promise<Session[]> {
    return http.get<Session[]>(ENDPOINTS.USERS.SESSIONS);
  }

  /**
   * Revokes a specific active session by its unique session ID.
   *
   * @description Immediately invalidates the target session on the authentication server.
   * @param {string} sessionId - The UUID of the session to terminate.
   * @returns {Promise<{ revoked: boolean }>} Confirmation of session revocation.
   */
  static async revokeSession(sessionId: string): Promise<{ revoked: boolean }> {
    return http.delete<{ revoked: boolean }>(ENDPOINTS.USERS.REVOKE_SESSION(sessionId));
  }

  /**
   * Revokes all active sessions for the user except the currently active device session.
   *
   * @description Security measure to terminate stale or untrusted sessions across other devices.
   * @returns {Promise<{ revokedCount: number }>} Count of invalidated sessions.
   */
  static async revokeOtherSessions(): Promise<{ revokedCount: number }> {
    return http.post<{ revokedCount: number }>(ENDPOINTS.USERS.REVOKE_OTHER_SESSIONS);
  }

  /**
   * Schedules user account deletion with a regulatory grace period.
   *
   * @description Initiates the account deactivation and scheduled purge process.
   * @returns {Promise<{ scheduledDate: string; gracePeriodDays: number }>} Scheduled deletion date and grace period length.
   */
  static async scheduleDeletion(): Promise<{ scheduledDate: string; gracePeriodDays: number }> {
    return http.post<{ scheduledDate: string; gracePeriodDays: number }>(
      ENDPOINTS.USERS.SCHEDULE_DELETION
    );
  }

  /**
   * Cancels a pending scheduled account deletion during the active grace period.
   *
   * @description Restores the user account to fully active status.
   * @returns {Promise<{ restored: boolean }>} Restoration confirmation status.
   */
  static async cancelDeletion(): Promise<{ restored: boolean }> {
    return http.post<{ restored: boolean }>(ENDPOINTS.USERS.CANCEL_DELETION);
  }
}
