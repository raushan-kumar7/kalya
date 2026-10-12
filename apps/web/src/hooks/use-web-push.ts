'use client';

import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PushDeviceItem } from '@kalya/types';
import { PushService } from '@/libs/services/notifications';
import { toast } from '@/components/ui';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function useWebPush() {
  const qc = useQueryClient();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Check browser capability and existing subscription status
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const supported =
      'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);

    if (!supported) return;

    setPermission(Notification.permission);

    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => {
        setIsSubscribed(Boolean(subscription));
      })
      .catch(() => {
        setIsSubscribed(false);
      });
  }, []);

  // Query user registered devices
  const {
    data: devices = [],
    isLoading: isDevicesLoading,
    refetch: refetchDevices,
  } = useQuery<PushDeviceItem[]>({
    queryKey: ['notifications', 'push', 'devices'],
    queryFn: () => PushService.listDevices(),
    staleTime: 60_000,
  });

  // Enable / Subscribe to Web Push
  const subscribeToPush = useCallback(async () => {
    if (!isSupported) {
      toast.error('Web Push is not supported by your browser.');
      return;
    }

    setIsActionLoading(true);
    try {
      // 1. Request native notification permission
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        toast.error(
          'Notification permission was denied. Please allow notifications in browser settings.'
        );
        setIsActionLoading(false);
        return;
      }

      // 2. Register Service Worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // 3. Retrieve VAPID Public Key from server
      const vapidRes = await PushService.getVapidKey();
      const publicKey =
        vapidRes?.publicKey ||
        (vapidRes as any)?.public_key ||
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!publicKey) {
        throw new Error('Push service VAPID public key not available from server');
      }

      // 4. Subscribe via W3C PushManager
      const convertedVapidKey = urlBase64ToUint8Array(publicKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as unknown as BufferSource,
      });

      const subJson = subscription.toJSON();
      if (!subJson.endpoint || !subJson.keys?.p256dh || !subJson.keys?.auth) {
        throw new Error('Browser generated an invalid push subscription object');
      }

      // 5. Send subscription to Kalya API
      await PushService.subscribeWeb({
        endpoint: subJson.endpoint,
        keys: {
          p256dh: subJson.keys.p256dh,
          auth: subJson.keys.auth,
        },
        deviceName: `${navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Browser'} on ${navigator.platform || 'Device'}`,
        userAgent: navigator.userAgent,
      });

      setIsSubscribed(true);
      qc.invalidateQueries({ queryKey: ['notifications', 'push', 'devices'] });
      toast.success('Web Push notifications enabled on this browser! 🎉');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to enable push notifications.';
      toast.error(msg);
    } finally {
      setIsActionLoading(false);
    }
  }, [isSupported, qc]);

  // Unsubscribe / Disable Web Push
  const unsubscribeFromPush = useCallback(async () => {
    if (!isSupported) return;

    setIsActionLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        await PushService.unsubscribeWeb(endpoint);
      }

      setIsSubscribed(false);
      qc.invalidateQueries({ queryKey: ['notifications', 'push', 'devices'] });
      toast.success('Web Push notifications disabled for this browser.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to disable push notifications.';
      toast.error(msg);
    } finally {
      setIsActionLoading(false);
    }
  }, [isSupported, qc]);

  // Revoke device mutation
  const revokeDeviceMutation = useMutation({
    mutationFn: (deviceId: string) => PushService.revokeDevice(deviceId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', 'push', 'devices'] });
      toast.success('Device revoked successfully');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to revoke device');
    },
  });

  // Diagnostic Test Push mutation
  const sendTestPushMutation = useMutation({
    mutationFn: () => PushService.sendTestPush(),
    onSuccess: (res) => {
      if (res.sent > 0) {
        toast.success(
          `Test push dispatched to ${res.sent} active device${res.sent === 1 ? '' : 's'}! Check your notifications.`
        );
      } else {
        toast.info('No active push devices registered to receive the test.');
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to dispatch test push');
    },
  });

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading: isActionLoading || isDevicesLoading,
    devices,
    refetchDevices,
    subscribeToPush,
    unsubscribeFromPush,
    revokeDevice: revokeDeviceMutation.mutateAsync,
    isRevoking: revokeDeviceMutation.isPending,
    sendTestPush: sendTestPushMutation.mutateAsync,
    isSendingTest: sendTestPushMutation.isPending,
  };
}
