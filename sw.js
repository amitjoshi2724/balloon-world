/**
 * Balloon World - Service Worker
 * Provides 100% offline gameplay, persistent asset caching, and background updates.
 */

const CACHE_NAME = 'balloon-world-v1.0.1';
const CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './new_favicon.jpeg',
  './icon-192.png',
  './icon-512.png',
  './favicon.ico',
  './favicon.png',
  './favicon.svg',
  './favicon-32x32.png',
  './apple-touch-icon.png'
];

// Install: Pre-cache all core game assets resiliently
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        CORE_ASSETS.map((assetUrl) =>
          cache.add(assetUrl).catch((err) => {
            console.warn(`[SW] Warning: could not pre-cache ${assetUrl}:`, err);
          })
        )
      );
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate: Purge stale caches from older versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch: Network-first for code & documents, Cache-first for images & fonts
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Transparent fallback for icon requests
  if (url.pathname.endsWith('/favicon.ico')) {
    event.respondWith(
      caches.match('./new_favicon.jpeg').then((cached) => cached || fetch(event.request))
    );
    return;
  }

  const isNavigation = event.request.mode === 'navigate';
  const isScriptOrHtml = event.request.destination === 'script' ||
                         url.pathname.endsWith('.js') ||
                         url.pathname.endsWith('.html');

  if (isNavigation || isScriptOrHtml) {
    // Network-first: fetch latest updates from GitHub Pages when online
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback
          return caches.match(event.request).then((cached) => {
            return cached || caches.match('./index.html');
          });
        })
    );
    return;
  }

  // Cache-first for images, fonts, styles
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        // Cache static resources like Google Fonts or stylesheet assets
        const clone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return networkResponse;
      }).catch((err) => {
        // Return cached index.html or empty fallback if completely unreachable
        return caches.match('./index.html');
      });
    })
  );
});
