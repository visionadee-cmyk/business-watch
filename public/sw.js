const CACHE_NAME = 'business-watch-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/logo/logo.png',
  '/manifest.json'
];

// Skip Vite dev server URLs
const shouldSkip = (url) => {
  return (
    url.includes('localhost') ||
    url.includes('127.0.0.1') ||
    url.includes('__vite') ||
    url.includes('@vite') ||
    url.includes('.t=') ||
    url.includes('?t=') ||
    url.endsWith('.jsx') ||
    url.endsWith('.tsx') ||
    url.endsWith('.ts') ||
    url.startsWith('http://localhost') ||
    url.startsWith('http://127.0.0.1')
  );
};

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        console.log('Cache failed:', err);
      })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // Skip Vite dev server and WebSocket requests
  if (shouldSkip(url) || request.mode === 'websocket') {
    return;
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        return fetch(request)
          .then((networkResponse) => {
            // Check if valid response and cacheable
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // Clone and cache the response
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              })
              .catch(err => console.log('SW: Cache put failed:', err));
            
            return networkResponse;
          })
          .catch((err) => {
            console.log('SW: Fetch failed:', err);
            // Fallback for offline navigation
            if (request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            throw err;
          });
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-bids') {
    event.waitUntil(syncBids());
  }
});

async function syncBids() {
  // Sync bid data when back online
  console.log('Syncing bids...');
}

// Push notifications (future feature)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/logo/logo.png',
      badge: '/logo/logo.png',
      vibrate: [100, 50, 100],
      data: data.data
    };
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});
