const CACHE_NAME = 'healthcare-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/offline_symptoms.json',
  '/manifest.json'
];

// Install Service Worker and cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Intercept fetch requests
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // If hitting the AI prediction API, intercept to provide an offline fallback
  if (url.pathname.includes('/predict')) {
    event.respondWith(
      fetch(event.request).catch(async () => {
        // Network failed (offline), fetch local JSON instead
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match('/offline_symptoms.json');
        if (cachedResponse) {
          const offlineData = await cachedResponse.json();
          // We must read the request body to match keywords, 
          // but event.request body might be consumed. We assume offline mode for now.
          return new Response(JSON.stringify({
            condition: "Offline Mode Generic Suggestion",
            confidence: 50.0,
            recommendation: "Network disconnected. Please observe symptoms and consult a local doctor if severe.",
            disclaimer: "DISCLAIMER: Running in Offline Mode. This is a generic advisory, not a medical diagnosis."
          }), { headers: { 'Content-Type': 'application/json' } });
        }
      })
    );
  } else if (event.request.method === 'GET') {
    // Normal caching strategy: Cache First, then Network
    event.respondWith(
      caches.match(event.request)
        .then(response => {
           if (response) {
             return response; // Return from cache
           }
           return fetch(event.request); // Fallback to network
        })
    );
  }
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
});
