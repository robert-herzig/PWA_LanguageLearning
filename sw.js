// Service Worker for Language Learning PWA
const CACHE_NAME = 'language-learning-v3';
const urlsToCache = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './js/topical-vocabulary.js',
  './js/translations.js',
  './manifest.json',
  './icons/favicon-96x96.png',
  './icons/web-app-manifest-192x192.png',
  './icons/web-app-manifest-512x512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon.ico',
  './icons/favicon.svg',
  // Cache vocabulary JSON files for offline topical vocabulary
  './data/word_lists/english/b1/food.json',
  './data/word_lists/english/b1/travel.json',
  './data/word_lists/english/b1/work.json',
  './data/word_lists/english/b2/environment.json',
  './data/word_lists/english/b2/health.json',
  './data/word_lists/english/b2/technology.json',
  './data/word_lists/spanish/b1/food.json',
  './data/word_lists/spanish/b1/travel.json',
  './data/word_lists/spanish/b1/work.json',
  './data/word_lists/spanish/b2/environment.json',
  './data/word_lists/spanish/b2/health.json',
  './data/word_lists/spanish/b2/technology.json',
  './data/word_lists/russian/b1/food.json',
  './data/word_lists/russian/b1/travel.json',
  './data/word_lists/russian/b1/work.json',
  './data/word_lists/russian/b2/environment.json',
  './data/word_lists/russian/b2/health.json',
  './data/word_lists/russian/b2/technology.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Failed to cache resources during install:', error);
      })
  );
});

// Activate event - clean up old caches
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
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        return fetch(event.request).then((response) => {
          // Don't cache non-successful responses
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
        });
      })
      .catch(() => {
        // Return offline page for navigation requests
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

// Background sync for storing data when offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync logic here
      console.log('Background sync triggered')
    );
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New lesson available!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Start Learning',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Language Learning', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
