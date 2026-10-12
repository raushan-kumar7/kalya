import { z } from 'zod';
import { PUSH_PLATFORM_OPTIONS } from '@kalya/types';

export const WebPushKeysSchema = z.object({
  p256dh: z.string().min(1, 'p256dh key is required'),
  auth: z.string().min(1, 'auth key is required'),
});

export const RegisterWebPushSubscriptionSchema = z.object({
  endpoint: z.string().url('Invalid push endpoint URL'),
  keys: WebPushKeysSchema,
  deviceId: z.string().optional(),
  deviceName: z.string().max(100).optional(),
  userAgent: z.string().optional(),
});
export type RegisterWebPushSubscriptionInput = z.infer<typeof RegisterWebPushSubscriptionSchema>;

export const RegisterMobilePushTokenSchema = z.object({
  pushToken: z.string().min(1, 'Push token is required'),
  platform: z.enum(['ios', 'android']),
  deviceId: z.string().min(1, 'Device ID is required'),
  deviceName: z.string().max(100).optional(),
  appVersion: z.string().optional(),
});
export type RegisterMobilePushTokenInput = z.infer<typeof RegisterMobilePushTokenSchema>;

export const SendTestPushSchema = z.object({
  title: z.string().max(100).optional(),
  body: z.string().max(255).optional(),
  platform: z.enum(PUSH_PLATFORM_OPTIONS).optional(),
  deviceId: z.string().optional(),
});
export type SendTestPushInput = z.infer<typeof SendTestPushSchema>;
