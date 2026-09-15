// CouchTaterz Service Worker Cleanup & Cache Buster
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => caches.delete(k)));
    }).then(() => {
      return self.registration.unregister();
    }).then(() => {
      return self.clients.matchAll();
    }).then((clients) => {
      clients.forEach((client) => {
        // Clients can now load cleanly from network
      });
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Pass-through all requests directly to the network
  return;
});


