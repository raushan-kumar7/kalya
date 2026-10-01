'use client';

import { http, ENDPOINTS } from '@/libs/api';
import type { Session, UpdateProfileDto, UpdateUsernameDto, User } from '@kalya/types';

export interface SuggestUsernameParams {
  first_name?: string;
  last_name?: string;
  middle_name?: string;
}

export interface SuggestUsernameResponse {
  username: string;
}

export interface RevokeSessionResponse {
  revoked: boolean;
}

export interface RevokeOtherSessionsResponse {
  revokedCount: number;
}

export interface ScheduleDeletionResponse {
  scheduledDate: string | Date;
  gracePeriodDays: number;
}

export interface CancelDeletionResponse {
  restored: boolean;
}

export interface RequestEmailChangeResponse {
  pending: boolean;
}

/**
 * User Profile & Account Management Service
 *
 * Implements static methods for retrieving/updating user profile details,
 * username handles, avatars, active sessions, and account lifecycle procedures.
 */
export class UserService {
  /**
   * Retrieves profile details for the currently authenticated user.
   */
  static async getMe(): Promise<User> {
    return http.get<User>(ENDPOINTS.USERS.ME);
  }

  /**
   * Updates editable user profile fields.
   */
  static async updateProfile(dto: UpdateProfileDto): Promise<User> {
    return http.patch<User>(ENDPOINTS.USERS.UPDATE_PROFILE, dto);
  }

  /**
   * Updates the user's public username handle.
   */
  static async updateUsername(dto: UpdateUsernameDto): Promise<User> {
    return http.patch<User>(ENDPOINTS.USERS.UPDATE_USERNAME, dto);
  }

  /**
   * Generates a suggested unique username handle based on legal or display names.
   */
  static async suggestUsername(params?: SuggestUsernameParams): Promise<SuggestUsernameResponse> {
    const query = new URLSearchParams();
    if (params?.first_name) query.set('first_name', params.first_name);
    if (params?.last_name) query.set('last_name', params.last_name);
    if (params?.middle_name) query.set('middle_name', params.middle_name);

    const qs = query.toString();
    const endpoint = qs
      ? `${ENDPOINTS.USERS.SUGGEST_USERNAME}?${qs}`
      : ENDPOINTS.USERS.SUGGEST_USERNAME;

    return http.get<SuggestUsernameResponse>(endpoint);
  }

  /**
   * Uploads and optimizes a new profile avatar image.
   */
  static async uploadAvatar(file: File | Blob): Promise<User> {
    const formData = new FormData();
    formData.append('avatar', file);

    return http.post<User>(ENDPOINTS.USERS.AVATAR, formData);
  }

  /**
   * Removes current user profile avatar image, resetting back to initial fallback.
   */
  static async deleteAvatar(): Promise<User> {
    return http.delete<User>(ENDPOINTS.USERS.AVATAR);
  }

  /**
   * Lists all active concurrent sessions for current user.
   */
  static async getSessions(): Promise<Session[]> {
    return http.get<Session[]>(ENDPOINTS.USERS.SESSIONS);
  }

  /**
   * Revokes a specific active session by its ID.
   */
  static async revokeSession(sessionId: string): Promise<RevokeSessionResponse> {
    return http.delete<RevokeSessionResponse>(ENDPOINTS.USERS.REVOKE_SESSION(sessionId));
  }

  /**
   * Revokes all active sessions for current user excluding the currently active session.
   */
  static async revokeOtherSessions(): Promise<RevokeOtherSessionsResponse> {
    return http.post<RevokeOtherSessionsResponse>(ENDPOINTS.USERS.REVOKE_OTHER_SESSIONS);
  }

  /**
   * Schedules account for permanent deletion with a 14-day grace period.
   */
  static async scheduleAccountDeletion(): Promise<ScheduleDeletionResponse> {
    return http.post<ScheduleDeletionResponse>(ENDPOINTS.USERS.SCHEDULE_DELETION);
  }

  /**
   * Cancels a pending scheduled account deletion during the active grace period.
   */
  static async cancelAccountDeletion(): Promise<CancelDeletionResponse> {
    return http.post<CancelDeletionResponse>(ENDPOINTS.USERS.CANCEL_DELETION);
  }

  /**
   * Requests change of primary account email address.
   */
  static async requestEmailChange(newEmail: string): Promise<RequestEmailChangeResponse> {
    return http.post<RequestEmailChangeResponse>(ENDPOINTS.USERS.REQUEST_EMAIL_CHANGE, {
      newEmail: newEmail.trim().toLowerCase(),
    });
  }
}
