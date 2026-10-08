import {
  NotificationPreference,
  NotificationPreferenceFilterQueryDto,
  UpdateNotificationPreferenceDto,
  UpsertNotificationPreferenceDto,
} from '@kalya/types';
import { ENDPOINTS, http } from '@/libs/api';
import { buildQueryString } from '../finances/helper';

export class PreferenceService {
  /**
   * List notification preferences for current user.
   */
  static async list(
    query?: NotificationPreferenceFilterQueryDto
  ): Promise<NotificationPreference[]> {
    const qs = query ? buildQueryString(query as Record<string, unknown>) : '';
    return http.get<NotificationPreference[]>(`${ENDPOINTS.NOTIFICATIONS.PREFERENCES.LIST}${qs}`);
  }

  /**
   * Upsert category × channel notification preference.
   */
  static async upsert(dto: UpsertNotificationPreferenceDto): Promise<NotificationPreference> {
    return http.put<NotificationPreference>(ENDPOINTS.NOTIFICATIONS.PREFERENCES.UPSERT, dto);
  }

  /**
   * Update existing notification preference by ID.
   */
  static async update(
    id: string,
    dto: UpdateNotificationPreferenceDto
  ): Promise<NotificationPreference> {
    return http.patch<NotificationPreference>(ENDPOINTS.NOTIFICATIONS.PREFERENCES.UPDATE(id), dto);
  }
}
