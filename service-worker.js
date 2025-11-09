const CACHE_NAME = 'anmago-cache-v3';
const ARCHIVOS_A_CACHEAR = [
  './INICIO.HTML',
  './ESTILO.CSS',
  './carrito.js',
  './app.js',
  './producto.html',
  './PROMOS.HTML',
  './HEADER.HTML',
  './footer.html',
  './logo.jpg'
];

// Instalar y cachear archivos clave
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ARCHIVOS_A_CACHEAR);
    })
  );
});

// Activar y limpiar cachés antiguas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia: Cache First + Actualización en segundo plano
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => cachedResponse); // fallback si offline

      return cachedResponse || fetchPromise;
    })
  );
});
