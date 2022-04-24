let cacheName = 'pwa';
let filesToCache = [
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
  // console.log('used to intercept requests so we can check for the file or data in the cache');
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

// Escuchar nuevas notificaciones push del servidor
self.addEventListener('push', e => {
    const {message, sender} = e.data.json();

    self.clients.matchAll({
      includeUncontrolled: true,
      type: 'window',
    }).then((clients) => {
      if (clients && clients.length) {
        // Enviamos un mensaje al cliente sobre el evento push
        clients[0].postMessage({ 
          type: 'REPLY_PUSH', message, sender
        });
      }
    });
});

// Escuchar evento del cliente para mostrar notificaciones
self.addEventListener('message', (event) => {
  const {type, sender, message} = event.data;

  if (event.data && type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification('Nuevo mensaje', {
      body: message,
      icon: '/img/iconsPWA/icon-192x192.png'
    });
  }
});
        

// ------------- Listen class changes

// const btn = self.document.querySelectorAll('.perfiles .contact')
// const options = {
//   attributes: true
// }

// function callback(mutationList, observer) {
//   mutationList.forEach(function(mutation) {
//     if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
//       // handle class change
//       console.log('receiver changed!');
//     }
//   })
// }

// const observer = new MutationObserver(callback)
// observer.observe(btn, options)