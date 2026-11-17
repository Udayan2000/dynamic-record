// Dynamic Record Progressive Web App Service Worker (v2)
const CACHE_VERSION = 'v2';
const APP_SHELL_CACHE = `dynamic-record-shell-${CACHE_VERSION}`;
const STATIC_ASSET_CACHE = `dynamic-record-static-${CACHE_VERSION}`;
const DATA_CACHE = `dynamic-record-data-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

// Core assets to pre-cache on install for guaranteed offline functionality
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon.svg',
  '/icons/maskable-icon-512x512.png',
  '/icons/apple-touch-icon.png',
];

// Install: pre-cache critical shell assets with fault tolerance
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then(async (cache) => {
      // Use allSettled so one missing or delayed asset doesn't fail the whole install
      await Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[PWA SW] Precache skipped for:', url, err);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

// Activate: clean up outdated caches from previous versions
self.addEventListener('activate', (event) => {
  const currentCaches = [APP_SHELL_CACHE, STATIC_ASSET_CACHE, DATA_CACHE];
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (!currentCaches.includes(key)) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event listener
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET' || !url.origin.startsWith(self.location.origin)) {
    return;
  }

  // 1. Navigation requests (HTML pages) -> Network First with Cache Fallback -> Offline Page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(APP_SHELL_CACHE).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          // Check if page was previously visited and cached
          const cached = await caches.match(request);
          if (cached) return cached;

          // Check root page fallback
          const rootCached = await caches.match('/');
          if (rootCached) return rootCached;

          // Fallback to offline page
          const offlinePage = await caches.match(OFFLINE_URL);
          if (offlinePage) return offlinePage;

          return new Response('You are offline. Please reconnect to the internet.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' },
          });
        })
    );
    return;
  }

  // 2. Next.js RSC requests (?_rsc=...) & Next.js page data -> Network First with Cache Fallback
  if (url.searchParams.has('_rsc') || url.pathname.startsWith('/_next/data/')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(DATA_CACHE).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // 3. Static assets (_next/static, icons, images, fonts, styles) -> Cache First with Stale-While-Revalidate
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|woff|woff2|ttf|css|js)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(STATIC_ASSET_CACHE).then((cache) => cache.put(request, copy));
            }
            return networkResponse;
          })
          .catch(() => null);

        // Return cached asset immediately for 0ms startup, revalidate in background
        return cached || fetchPromise;
      })
    );
    return;
  }

  // 4. API GET requests -> Network First with cached data fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(DATA_CACHE).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return new Response(
            JSON.stringify({
              offline: true,
              message: 'You are currently offline. Please reconnect to access live data.',
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        })
    );
    return;
  }

  // 5. Default fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// Support instant update activation from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
