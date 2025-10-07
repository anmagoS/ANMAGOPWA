const CACHE_NAME = 'anmago-cache-v2';
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

// Activar y limpiar cachés antiguas si es necesario
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

// Interceptar peticiones y servir desde red o caché
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

