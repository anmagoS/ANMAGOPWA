// 1. INCREMENTA LA VERSIÓN DEL CACHE
const CACHE_NAME = 'anmago-cache-v4';  // Cambié v3 → v4
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

// 2. MODIFICA EL INSTALL PARA CACHEAR TODOS LOS ARCHIVOS
self.addEventListener('install', event => {
  console.log('[Service Worker] Instalando versión:', CACHE_NAME);
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Cacheando archivos...');
      return cache.addAll(ARCHIVOS_A_CACHEAR);
    }).catch(err => {
      console.warn("⚠️ Error al precachear:", err);
    })
  );
  
  // Fuerza que el nuevo SW tome control inmediatamente
  self.skipWaiting();
});

// 3. MODIFICA EL ACTIVATE PARA LIMPIAR VERSIONES ANTERIORES
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activando nueva versión:', CACHE_NAME);
  
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          // ELIMINA TODOS LOS CACHES QUE NO SEAN EL ACTUAL
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Eliminando cache viejo:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      // 4. NUEVO: NOTIFICAR A TODOS LOS CLIENTES (PÁGINAS)
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'NEW_VERSION_AVAILABLE',
            version: CACHE_NAME
          });
        });
      });
      
      return self.clients.claim();
    })
  );
});

// 5. MODIFICA LA ESTRATEGIA FETCH PARA FORZAR ACTUALIZACIÓN
self.addEventListener('fetch', event => {
  // Evita cachear solicitudes a Google Apps Script (para datos en tiempo real)
  if (event.request.url.includes('script.google.com')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Para archivos .html, usa "Network First" para obtener versión más reciente
  if (event.request.url.includes('.html') || event.request.url.includes('.js')) {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          // Actualiza el cache con la nueva versión
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // Fallback al cache si no hay conexión
          return caches.match(event.request);
        })
    );
  } else {
    // Para otros recursos, usa la estrategia original
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }).catch(() => cachedResponse);
        
        return cachedResponse || fetchPromise;
      })
    );
  }
});

// 6. AÑADE MENSAJES PARA COMUNICACIÓN CON LA APP
self.addEventListener('message', event => {
  if (event.data.type === 'CHECK_FOR_UPDATES') {
    self.registration.update();
    event.source.postMessage({
      type: 'UPDATE_CHECKED',
      currentVersion: CACHE_NAME
    });
  }
  
  if (event.data.type === 'FORCE_UPDATE') {
    console.log('[Service Worker] Actualización forzada solicitada');
    caches.delete(CACHE_NAME).then(() => {
      self.skipWaiting();
      self.clients.claim();
    });
  }
});
