import { PushDeviceItem, RegisterWebPushSubscriptionDto, SendTestPushDto } from '@kalya/types';
import { ENDPOINTS, http } from '@/libs/api';

export class PushService {
  /**
   * Fetch the server's VAPID public key for Web Push registration.
   */
  static async getVapidKey(): Promise<{ publicKey: string }> {
    try {
      const res = await http.get<Record<string, unknown>>(ENDPOINTS.NOTIFICATIONS.PUSH.VAPID_KEY);
      const rawKey =
        (res?.publicKey as string) ||
        (res?.public_key as string) ||
        ((res?.data as Record<string, unknown>)?.publicKey as string) ||
        ((res?.data as Record<string, unknown>)?.public_key as string) ||
        '';

      if (rawKey) {
        return { publicKey: rawKey };
      }
    } catch {
      // Fallback to static public key if network or server issue occurs
    }

    const envFallback = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
    return { publicKey: envFallback };
  }

  /**
   * Register a browser Web Push subscription with the backend.
   */
  static async subscribeWeb(dto: RegisterWebPushSubscriptionDto): Promise<any> {
    return http.post(ENDPOINTS.NOTIFICATIONS.PUSH.SUBSCRIBE_WEB, dto);
  }

  /**
   * Unregister a browser Web Push subscription from the backend.
   */
  static async unsubscribeWeb(endpoint: string): Promise<{ success: boolean }> {
    return http.post<{ success: boolean }>(ENDPOINTS.NOTIFICATIONS.PUSH.UNSUBSCRIBE_WEB, {
      endpoint,
    });
  }

  /**
   * List all active registered push devices for the user.
   */
  static async listDevices(): Promise<PushDeviceItem[]> {
    return http.get<PushDeviceItem[]>(ENDPOINTS.NOTIFICATIONS.PUSH.DEVICES);
  }

  /**
   * Revoke a registered device by its record ID.
   */
  static async revokeDevice(id: string): Promise<{ success: boolean }> {
    return http.delete<{ success: boolean }>(ENDPOINTS.NOTIFICATIONS.PUSH.REVOKE_DEVICE(id));
  }

  /**
   * Send a diagnostic test push notification to the user's active devices.
   */
  static async sendTestPush(dto?: SendTestPushDto): Promise<{ sent: number; failed: number }> {
    return http.post<{ sent: number; failed: number }>(
      ENDPOINTS.NOTIFICATIONS.PUSH.TEST,
      dto ?? {}
    );
  }
}
