import {
  Alert,
  AlertFilterQueryDto,
  MarkAlertsAsReadDto,
  UnreadAlertCountResponse,
} from '@kalya/types';
import { ENDPOINTS, http } from '@/libs/api';
import { buildQueryString } from '../finances/helper';

export class AlertService {
  /**
   * List notification alerts for current user with optional filters.
   */
  static async list(query?: AlertFilterQueryDto): Promise<Alert[]> {
    const qs = query ? buildQueryString(query as Record<string, unknown>) : '';
    return http.get<Alert[]>(`${ENDPOINTS.NOTIFICATIONS.ALERTS.LIST}${qs}`);
  }

  /**
   * Get unread notification alerts count.
   */
  static async getUnreadCount(): Promise<UnreadAlertCountResponse> {
    return http.get<UnreadAlertCountResponse>(ENDPOINTS.NOTIFICATIONS.ALERTS.UNREAD_COUNT);
  }

  /**
   * Mark a single alert as read.
   */
  static async markAsRead(id: string): Promise<Alert> {
    return http.patch<Alert>(ENDPOINTS.NOTIFICATIONS.ALERTS.MARK_READ(id), {});
  }

  /**
   * Batch mark multiple or all alerts as read.
   */
  static async batchMarkAsRead(dto: MarkAlertsAsReadDto): Promise<{ success: boolean }> {
    return http.post<{ success: boolean }>(ENDPOINTS.NOTIFICATIONS.ALERTS.BATCH_MARK_READ, dto);
  }

  /**
   * Dismiss/delete an alert notification.
   */
  static async delete(id: string): Promise<{ success: boolean }> {
    return http.delete<{ success: boolean }>(ENDPOINTS.NOTIFICATIONS.ALERTS.DELETE(id));
  }
}
