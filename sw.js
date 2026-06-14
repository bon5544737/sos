/* SOS Emergency Response — service worker
   Enables OS-level notifications (mobile + desktop) and basic offline caching. */
const CACHE = 'sos-v2';

self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});

/* Tap a notification → focus the open app, or open it */
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) { if ('focus' in c) return c.focus(); }
      if (self.clients.openWindow) return self.clients.openWindow('.');
    })
  );
});

/* Web Push (only fires if a push server sends a message — see notes) */
self.addEventListener('push', e => {
  let d = { title: 'SOS', body: '' };
  try { d = e.data.json(); } catch (_) { if (e.data) d.body = e.data.text(); }
  e.waitUntil(self.registration.showNotification(d.title || 'SOS', {
    body: d.body || '', icon: 'icon-192.png', badge: 'icon-192.png', tag: 'sos', renotify: true
  }));
});
