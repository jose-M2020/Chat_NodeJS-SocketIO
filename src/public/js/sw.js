var cacheName = 'pwa';
var filesToCache = [
  '/',
  '/signin',
  '/signup',
  '/css/style.css',
  '/js/main.js'
];

/* Start the service worker and cache all of the app's content */
self.addEventListener('install', function(e) {
  console.log('used to register the service worker');
  e.waitUntil(
    caches.open(cacheName)
        .then(function(cache) {
          return cache.addAll(filesToCache);
        })
        .then(self.skipWaiting())
  );
});

/* Serve cached content when offline */
self.addEventListener('fetch', function(e) {
  console.log('used to intercept requests so we can check for the file or data in the cache');
  e.respondWith(
    fetch(e.request)
      .catch(() => {
        return caches.open(cacheName)
          .then((cache) => {
            return cache.match(e.request)
          })
      })
  )
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys()
          .then((keyList) => {
            return Promise.all(keyList.map((key) => {
              if (key !== cacheName) {
                console.log('[ServiceWorker] Removing old cache', key)
                return caches.delete(key)
              }
            }))
          })
          .then(() => self.clients.claim())
    )
})

self.addEventListener('push', e => {
    const data = e.data.json();
    console.log(data)
    console.log('Notification Received');
    self.registration.showNotification('Nuevo mensaje', {
        body: data.message,
        icon: '/img/iconsPWA/icon-192x192.png'
    });
});