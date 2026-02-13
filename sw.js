// Service Worker for SunJoy Calculator PWA
// Version: Jan-Feb 2026 Promotion (Exchange Rate Update)
// Last Updated: February 12, 2026

const TIMESTAMP = '20260212-1000'; // ⚠️ Update this timestamp when updating files
const CACHE_NAME = `sunjoy-calculator-${TIMESTAMP}`;

const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log(`[SW ${TIMESTAMP}] Installing Service Worker...`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log(`[SW ${TIMESTAMP}] Caching app shell`);
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log(`[SW ${TIMESTAMP}] Skip waiting...`);
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log(`[SW ${TIMESTAMP}] Activating Service Worker...`);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log(`[SW ${TIMESTAMP}] Deleting old cache:`, cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log(`[SW ${TIMESTAMP}] Claiming clients...`);
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          console.log(`[SW ${TIMESTAMP}] Serving from cache:`, event.request.url);
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch((error) => {
          console.log(`[SW ${TIMESTAMP}] Fetch failed:`, error);
          // You can return a custom offline page here
        });
      })
  );
});

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log(`[SW ${TIMESTAMP}] Received SKIP_WAITING message`);
    self.skipWaiting();
  }
});

console.log(`[SW] Service Worker ${TIMESTAMP} loaded`);
