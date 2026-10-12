import { Identifiable, ISOTimestamp, PushPlatform, UUID } from '../core';

export interface WebPushKeys {
  p256dh: string;
  auth: string;
}

export interface RegisterWebPushSubscriptionDto {
  endpoint: string;
  keys: WebPushKeys;
  deviceId?: string;
  deviceName?: string;
  userAgent?: string;
}

export interface RegisterMobilePushTokenDto {
  pushToken: string;
  platform: 'ios' | 'android';
  deviceId: string;
  deviceName?: string;
  appVersion?: string;
}

export interface PushDeviceItem extends Identifiable {
  user_id: UUID;
  platform: PushPlatform;
  device_id: string;
  device_name: string;
  is_active: boolean;
  last_seen_at?: ISOTimestamp | null;
  created_at: ISOTimestamp;
}

export interface SendTestPushDto {
  title?: string;
  body?: string;
  platform?: PushPlatform;
  deviceId?: string;
}

export interface PushPayloadData {
  url?: string;
  type?: string;
  referenceType?: string | null;
  referenceId?: string | null;
  [key: string]: unknown;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: PushPayloadData;
}
