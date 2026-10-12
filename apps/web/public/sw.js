// Service Worker for Kalya Web Push Notifications
self.addEventListener('push', function (event) {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const title = payload.title || 'Kalya Financial Alert';
    const options = {
      body: payload.body || '',
      icon: payload.icon || '/kalya_icon1.png',
      badge: payload.badge || '/kalya_icon_white1.png',
      data: payload.data || {},
      vibrate: [100, 50, 100],
      actions: [
        { action: 'open', title: 'Open Kalya' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error('Failed to parse push notification payload:', err);
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (windowClients) {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes('/dashboard') && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
