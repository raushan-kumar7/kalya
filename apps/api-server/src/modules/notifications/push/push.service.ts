import webpush from 'web-push';
import { and, eq, pushSubscription, type PushSubscriptionRow } from '@kalya/db';
import { env } from '@kalya/env';
import {
  PushDeviceItem,
  PushNotificationPayload,
  RegisterMobilePushTokenDto,
  RegisterWebPushSubscriptionDto,
  SendTestPushDto,
} from '@kalya/types';
import { log } from '@/logger';
import { generateId } from '@kalya/utils';

export class PushService {
  private vapidConfigured = false;
  private vapidPublicKey = '';
  private vapidPrivateKey = '';
  private vapidSubject = '';

  constructor(private readonly db: any) {
    this.initVapid();
  }

  private initVapid() {
    this.vapidPublicKey = env.push?.vapidPublicKey || process.env.KALYA_VAPID_PUBLIC_KEY || '';
    this.vapidPrivateKey = env.push?.vapidPrivateKey || process.env.KALYA_VAPID_PRIVATE_KEY || '';
    this.vapidSubject =
      env.push?.vapidSubject || process.env.KALYA_VAPID_SUBJECT || 'mailto:admin@kalya.io';

    if (this.vapidPublicKey && this.vapidPrivateKey) {
      try {
        webpush.setVapidDetails(this.vapidSubject, this.vapidPublicKey, this.vapidPrivateKey);
        this.vapidConfigured = true;
        log.info('Web Push VAPID configuration initialized');
      } catch (err) {
        log.warn('Failed to initialize Web Push VAPID with provided keys', { error: String(err) });
      }
    } else {
      // In development, generate dynamic in-memory VAPID keys if none configured
      try {
        const dynamicKeys = webpush.generateVAPIDKeys();
        this.vapidPublicKey = dynamicKeys.publicKey;
        this.vapidPrivateKey = dynamicKeys.privateKey;
        webpush.setVapidDetails(this.vapidSubject, this.vapidPublicKey, this.vapidPrivateKey);
        this.vapidConfigured = true;
        log.info('Generated ephemeral development VAPID keys for Web Push');
      } catch (err) {
        log.warn('Could not generate ephemeral development VAPID keys', { error: String(err) });
      }
    }
  }

  getVapidPublicKey(): string {
    return this.vapidPublicKey;
  }

  /**
   * Register or update a browser Web Push subscription.
   */
  async registerWebPush(
    userId: string,
    dto: RegisterWebPushSubscriptionDto
  ): Promise<PushSubscriptionRow> {
    const deviceId = dto.deviceId || generateId();
    const deviceName = dto.deviceName || 'Web Browser';

    // Check if subscription already exists for this endpoint or user+device
    const [existing] = await this.db
      .select()
      .from(pushSubscription)
      .where(and(eq(pushSubscription.userId, userId), eq(pushSubscription.endpoint, dto.endpoint)))
      .limit(1);

    if (existing) {
      const [updated] = await this.db
        .update(pushSubscription)
        .set({
          deviceId,
          deviceName,
          p256dhKey: dto.keys.p256dh,
          authKey: dto.keys.auth,
          userAgent: dto.userAgent,
          isActive: true,
          lastSeenAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(pushSubscription.id, existing.id))
        .returning();

      return updated;
    }

    const [created] = await this.db
      .insert(pushSubscription)
      .values({
        userId,
        platform: 'web',
        deviceId,
        deviceName,
        endpoint: dto.endpoint,
        p256dhKey: dto.keys.p256dh,
        authKey: dto.keys.auth,
        userAgent: dto.userAgent,
        isActive: true,
        lastSeenAt: new Date(),
      })
      .returning();

    return created;
  }

  /**
   * Unregister a browser Web Push subscription by endpoint.
   */
  async unregisterWebPush(userId: string, endpoint: string): Promise<boolean> {
    await this.db
      .update(pushSubscription)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(pushSubscription.userId, userId), eq(pushSubscription.endpoint, endpoint)));
    return true;
  }

  /**
   * Register or update a mobile client push token (Expo Push / FCM).
   */
  async registerMobilePush(
    userId: string,
    dto: RegisterMobilePushTokenDto
  ): Promise<PushSubscriptionRow> {
    const [existing] = await this.db
      .select()
      .from(pushSubscription)
      .where(and(eq(pushSubscription.userId, userId), eq(pushSubscription.deviceId, dto.deviceId)))
      .limit(1);

    if (existing) {
      const [updated] = await this.db
        .update(pushSubscription)
        .set({
          pushToken: dto.pushToken,
          platform: dto.platform,
          deviceName: dto.deviceName || existing.deviceName,
          appVersion: dto.appVersion,
          isActive: true,
          lastSeenAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(pushSubscription.id, existing.id))
        .returning();

      return updated;
    }

    const [created] = await this.db
      .insert(pushSubscription)
      .values({
        userId,
        platform: dto.platform,
        deviceId: dto.deviceId,
        deviceName: dto.deviceName || 'Mobile App',
        pushToken: dto.pushToken,
        appVersion: dto.appVersion,
        isActive: true,
        lastSeenAt: new Date(),
      })
      .returning();

    return created;
  }

  /**
   * Retrieve list of registered devices for the current user.
   */
  async listUserDevices(userId: string): Promise<PushDeviceItem[]> {
    const rows = await this.db
      .select()
      .from(pushSubscription)
      .where(and(eq(pushSubscription.userId, userId), eq(pushSubscription.isActive, true)));

    return rows.map((r: PushSubscriptionRow) => ({
      id: r.id,
      user_id: r.userId,
      platform: r.platform as any,
      device_id: r.deviceId,
      device_name: r.deviceName,
      is_active: Boolean(r.isActive),
      last_seen_at: r.lastSeenAt ? new Date(r.lastSeenAt).toISOString() : null,
      created_at: new Date(r.createdAt).toISOString(),
    }));
  }

  /**
   * Revoke/deactivate a specific registered device.
   */
  async revokeDevice(userId: string, deviceId: string): Promise<boolean> {
    await this.db
      .update(pushSubscription)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(pushSubscription.userId, userId), eq(pushSubscription.id, deviceId)));
    return true;
  }

  /**
   * Send push notification to all active devices registered by a user.
   */
  async sendToUser(
    userId: string,
    payload: PushNotificationPayload
  ): Promise<{ sent: number; failed: number }> {
    const devices = await this.db
      .select()
      .from(pushSubscription)
      .where(and(eq(pushSubscription.userId, userId), eq(pushSubscription.isActive, true)));

    if (!devices.length) {
      return { sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    const dispatches = devices.map(async (device: PushSubscriptionRow) => {
      try {
        if (device.platform === 'web' && device.endpoint && device.p256dhKey && device.authKey) {
          if (!this.vapidConfigured) {
            log.warn('VAPID not configured, skipping web push', { deviceId: device.id });
            failed++;
            return;
          }

          const pushSub = {
            endpoint: device.endpoint,
            keys: {
              p256dh: device.p256dhKey,
              auth: device.authKey,
            },
          };

          await webpush.sendNotification(
            pushSub,
            JSON.stringify({
              title: payload.title,
              body: payload.body,
              icon: payload.icon || '/icons/icon-192x192.png',
              badge: payload.badge || '/icons/badge-72x72.png',
              data: payload.data || {},
            })
          );
          sent++;
        } else if (
          (device.platform === 'ios' || device.platform === 'android') &&
          device.pushToken
        ) {
          // Expo Push Notification API
          const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              ...(env.push?.expoAccessToken
                ? { Authorization: `Bearer ${env.push.expoAccessToken}` }
                : {}),
            },
            body: JSON.stringify({
              to: device.pushToken,
              title: payload.title,
              body: payload.body,
              data: payload.data || {},
              sound: 'default',
            }),
          });

          if (!response.ok) {
            failed++;
            return;
          }

          const expoResult = (await response.json()) as any;
          if (expoResult?.data?.status === 'error') {
            if (expoResult.data.details?.error === 'DeviceNotRegistered') {
              // Deactivate stale mobile device
              await this.db
                .update(pushSubscription)
                .set({ isActive: false })
                .where(eq(pushSubscription.id, device.id));
            }
            failed++;
          } else {
            sent++;
          }
        }
      } catch (err: any) {
        failed++;
        // Prune expired Web Push subscriptions (410 Gone / 404 Not Found)
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          log.info('Pruning deactivated Web Push endpoint', { endpoint: device.endpoint });
          await this.db
            .update(pushSubscription)
            .set({ isActive: false })
            .where(eq(pushSubscription.id, device.id));
        } else {
          log.error('Push dispatch failed for device', {
            deviceId: device.id,
            platform: device.platform,
            error: err?.message || String(err),
          });
        }
      }
    });

    await Promise.allSettled(dispatches);
    return { sent, failed };
  }

  /**
   * Dispatch a diagnostic test notification to verify push setup.
   */
  async sendTestPush(userId: string, dto?: SendTestPushDto) {
    const payload: PushNotificationPayload = {
      title: dto?.title || 'Kalya Push Diagnostic',
      body: dto?.body || 'Push notification delivery verified successfully! 🚀',
      data: {
        type: 'system',
        url: '/dashboard/settings/account?tab=notification',
      },
    };

    return await this.sendToUser(userId, payload);
  }
}
