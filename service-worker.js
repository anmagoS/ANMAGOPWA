self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open('anmago-cache').then(cache => {
      return cache.addAll([
        './INICIO.HTML',
        './ESTILO.CSS',
        './carrito.js',
        './logo.jpg'
      ]);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

