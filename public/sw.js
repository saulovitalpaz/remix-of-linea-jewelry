const CACHE_NAME = 'chique-admin-pwa-v3';
const STATIC_ASSETS = [
  '/',
  '/admin',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/icons/chique-full-192.png',
  '/icons/chique-full-512.png',
  '/icons/chique-full-apple-180.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  // Ignore non-GET or API requests
  if (request.method !== 'GET' || request.url.includes('/api/')) return;

  // Quote links contain a private reference; don't store the URL in the PWA cache.
  const url = new URL(request.url);
  if (url.pathname === '/admin' && url.searchParams.has('quote')) {
    event.respondWith(fetch(request).catch(() => caches.match('/admin')));
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          if (request.mode === 'navigate') return caches.match('/admin');
          return Promise.reject('offline');
        });
      })
  );
});
