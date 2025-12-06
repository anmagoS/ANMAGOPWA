// ====== SERVICE WORKER SIMPLIFICADO Y ROBUSTO ======
const CACHE_NAME = 'anmago-cache-v5';

// SOLO los archivos ABSOLUTAMENTE ESENCIALES
const ARCHIVOS_ESENCIALES = [
  './',
  './INICIO.HTML',
  './ESTILO.CSS',
  './carrito.js',
  './app.js',
  './buscador.js',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js'
];

// Instalar - enfoque MUY conservador
self.addEventListener('install', (event) => {
  console.log('[Service Worker] 📦 Instalando versión:', CACHE_NAME);
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        console.log('[Service Worker] Cache abierto');
        
        // Intenta cachear solo la página principal primero
        try {
          await cache.add('./');
          console.log('[Service Worker] ✅ Página principal cacheada');
        } catch (err) {
          console.warn('[Service Worker] ⚠️ No se pudo cachear página principal:', err.message);
        }
        
        // Para los demás archivos, usa un enfoque más tolerante
        for (const url of ARCHIVOS_ESENCIALES) {
          if (url !== './') { // Ya cacheamos la página principal
            try {
              // Usa fetch en lugar de cache.add para mejor control
              const response = await fetch(url, { 
                mode: 'no-cors',
                credentials: 'omit'
              });
              
              if (response.ok || response.type === 'opaque') {
                await cache.put(url, response);
                console.log(`[Service Worker] ✅ Cacheado: ${url}`);
              }
            } catch (err) {
              console.warn(`[Service Worker] ⚠️ No se pudo cachear: ${url}`, err.message);
              // Continúa con el siguiente archivo
            }
          }
        }
        
        console.log('[Service Worker] 🎉 Instalación completada');
      } catch (error) {
        console.error('[Service Worker] ❌ Error en instalación:', error);
      }
    })()
  );
  
  // Fuerza que el SW tome control inmediatamente
  self.skipWaiting();
});

// Activar - limpiar caches viejos
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] 🚀 Activando versión:', CACHE_NAME);
  
  event.waitUntil(
    (async () => {
      // Limpiar caches viejos
      const cacheKeys = await caches.keys();
      await Promise.all(
        cacheKeys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] 🗑️ Eliminando cache viejo:', key);
            return caches.delete(key);
          }
        })
      );
      
      // Tomar control de todos los clients
      await self.clients.claim();
      
      // Notificar a los clients sobre la nueva versión
      const clients = await self.clients.matchAll();
      clients.forEach((client) => {
        client.postMessage({
          type: 'SW_UPDATED',
          version: CACHE_NAME,
          timestamp: new Date().toISOString()
        });
      });
      
      console.log('[Service Worker] ✅ Activación completada');
    })()
  );
});

// Fetch - estrategia inteligente
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // 1. NO cachear solicitudes a Google Apps Script
  if (url.href.includes('script.google.com')) {
    return;
  }
  
  // 2. Para archivos locales, usa Cache First con actualización
  if (url.origin === self.location.origin) {
    event.respondWith(
      (async () => {
        try {
          // Primero intenta con la red
          const networkResponse = await fetch(event.request);
          
          // Si es exitosa, actualiza el cache
          if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, networkResponse.clone());
          }
          
          return networkResponse;
        } catch (error) {
          // Si falla la red, usa el cache
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Si no hay en cache, muestra offline page
          return new Response('Estás offline. Por favor, revisa tu conexión.', {
            status: 503,
            statusText: 'Offline',
            headers: { 'Content-Type': 'text/plain' }
          });
        }
      })()
    );
  }
  
  // 3. Para recursos externos (CDN), usa Cache First
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(event.request)
        .then((networkResponse) => {
          // Solo cachea si es exitoso y es cacheable
          if (networkResponse.ok && 
              event.request.method === 'GET' &&
              !networkResponse.headers.get('vary')?.includes('Authorization')) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Para imágenes rotas, muestra placeholder
          if (event.request.destination === 'image') {
            return fetch('https://ik.imagekit.io/mbsk9dati/placeholder-producto.jpg');
          }
          return new Response('Recurso no disponible offline', { status: 404 });
        });
    })
  );
});

// Manejar mensajes desde la app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME);
  }
});
