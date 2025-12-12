// ====== SERVICE WORKER PARA ANMAGO STORE ======
// Versión: v5.2 (Optimizado y sin errores)
// Fecha: 2024-12-06

const CACHE_NAME = 'anmago-cache-v5.5';
const APP_VERSION = 'v5.5';

// Archivos ESENCIALES para cachear (offline)
const ARCHIVOS_ESENCIALES = [
  './',
  './INICIO.HTML',
  './PROMOS.HTML', 
  './PRODUCTO.HTML',
  './ESTILO.CSS',
  './carrito.js',
  './app.js',
  './buscador.js',
  './manifest.json'
];

// ====== INSTALACIÓN ======
self.addEventListener('install', (event) => {
  console.log('[Service Worker] 📦 Instalando versión:', CACHE_NAME);
  
  event.waitUntil(
    (async () => {
      try {
        // Abrir cache
        const cache = await caches.open(CACHE_NAME);
        console.log('[Service Worker] ✅ Cache abierto:', CACHE_NAME);
        
        // Cachear archivos esenciales con manejo de errores individual
        const cachePromises = ARCHIVOS_ESENCIALES.map(async (url) => {
          try {
            const response = await fetch(url, {
              cache: 'reload', // Ignorar cache HTTP
              credentials: 'omit'
            });
            
            if (response.ok) {
              await cache.put(url, response);
              console.log(`[Service Worker] ✅ Cacheado: ${url}`);
              return true;
            } else {
              console.warn(`[Service Worker] ⚠️ No se pudo cachear ${url}: ${response.status}`);
              return false;
            }
          } catch (error) {
            console.warn(`[Service Worker] ⚠️ Error cacheando ${url}:`, error.message);
            return false; // Continuar con los demás
          }
        });
        
        await Promise.all(cachePromises);
        console.log('[Service Worker] 🎉 Instalación completada');
        
      } catch (error) {
        console.error('[Service Worker] ❌ Error en instalación:', error);
      }
    })()
  );
  
  // Forzar que el nuevo SW tome control inmediatamente
  self.skipWaiting();
});

// ====== ACTIVACIÓN ======
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] 🚀 Activando versión:', CACHE_NAME);
  
  event.waitUntil(
    (async () => {
      try {
        // 1. Limpiar caches viejos
        const cacheKeys = await caches.keys();
        const deletePromises = cacheKeys.map(async (key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] 🗑️ Eliminando cache viejo:', key);
            await caches.delete(key);
          }
        });
        
        await Promise.all(deletePromises);
        console.log('[Service Worker] ✅ Caches viejos eliminados');
        
        // 2. Tomar control de todas las pestañas
        await self.clients.claim();
        
        // 3. Notificar a los clients sobre la nueva versión
        const clients = await self.clients.matchAll();
        clients.forEach((client) => {
          client.postMessage({
            type: 'SW_UPDATED',
            version: CACHE_NAME,
            appVersion: APP_VERSION,
            timestamp: new Date().toISOString()
          });
        });
        
        console.log('[Service Worker] ✅ Activación completada');
        console.log(`[Service Worker] 📱 Aplicación versión: ${APP_VERSION}`);
        
      } catch (error) {
        console.error('[Service Worker] ❌ Error en activación:', error);
      }
    })()
  );
});

// ====== ESTRATEGIA DE FETCH (CORREGIDA) ======
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // 1. NO interceptar estas URLs (dejar pasar directamente)
  if (shouldSkipCache(event.request)) {
    return; // No usar event.respondWith() para estas URLs
  }
  
  // 2. Para todas las demás solicitudes
  event.respondWith(
    handleFetch(event)
  );
});

// ====== FUNCIONES AUXILIARES ======

// Determinar si una URL debe ser cacheada
function shouldSkipCache(request) {
  const url = request.url;
  
  // URLs que NO deben ser cacheadas:
  const skipUrls = [
    'script.google.com',     // Google Apps Script
    'raw.githubusercontent.com', // Catálogo JSON
    'ik.imagekit.io',       // Imágenes dinámicas
    'cdn.jsdelivr.net'      // CDN externos
  ];
  
  return skipUrls.some(skipUrl => url.includes(skipUrl));
}

// Estrategia: Cache First con actualización en background
async function handleFetch(event) {
  const request = event.request;
  const url = new URL(request.url);
  
  try {
    // 1. Primero intentar del cache
    const cachedResponse = await caches.match(request);
    
    // 2. Siempre intentar red en paralelo para actualizar cache
    const fetchPromise = fetch(request)
      .then(async (networkResponse) => {
        // Solo cachear si es exitoso y es GET
        if (networkResponse.ok && request.method === 'GET') {
          try {
            const cache = await caches.open(CACHE_NAME);
            
            // IMPORTANTE: Clonar la respuesta ANTES de usarla
            const responseClone = networkResponse.clone();
            await cache.put(request, responseClone);
            
            console.log(`[Service Worker] 🔄 Cache actualizado: ${url.pathname}`);
          } catch (cacheError) {
            console.warn(`[Service Worker] ⚠️ Error actualizando cache:`, cacheError.message);
          }
        }
        return networkResponse;
      })
      .catch((networkError) => {
        console.log(`[Service Worker] 🌐 Sin conexión para: ${url.pathname}`);
        return null; // Falló la red
      });
    
    // 3. Retornar cache inmediatamente si existe
    if (cachedResponse) {
      // Enviar respuesta cacheada inmediatamente
      console.log(`[Service Worker] 📂 Sirviendo desde cache: ${url.pathname}`);
      
      // Pero actualizar cache en background si hay conexión
      if (navigator.onLine) {
        fetchPromise.then(networkResponse => {
          if (networkResponse) {
            console.log(`[Service Worker] 📡 Cache actualizado en background: ${url.pathname}`);
          }
        });
      }
      
      return cachedResponse;
    }
    
    // 4. Si no hay en cache, esperar por la red
    const networkResponse = await fetchPromise;
    if (networkResponse) {
      return networkResponse;
    }
    
    // 5. Si no hay ni cache ni red, mostrar página offline
    return getOfflineResponse(request);
    
  } catch (error) {
    console.error('[Service Worker] ❌ Error en handleFetch:', error);
    return getOfflineResponse(request);
  }
}

// Página/respuesta offline
function getOfflineResponse(request) {
  const url = new URL(request.url);
  
  // Para páginas HTML, mostrar página offline personalizada
  if (request.headers.get('Accept')?.includes('text/html')) {
    return new Response(
      `
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Estás offline | Anmago Store</title>
          <style>
              body { 
                  font-family: Arial, sans-serif; 
                  background: #f8f9fa; 
                  color: #333;
                  padding: 2rem;
                  text-align: center;
              }
              .container { 
                  max-width: 500px; 
                  margin: 5rem auto; 
                  padding: 2rem;
                  background: white;
                  border-radius: 10px;
                  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
              }
              h1 { color: #666; }
              .icon { font-size: 4rem; margin-bottom: 1rem; }
              .btn { 
                  display: inline-block; 
                  padding: 10px 20px; 
                  background: #007bff; 
                  color: white; 
                  text-decoration: none;
                  border-radius: 5px;
                  margin-top: 1rem;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="icon">📶</div>
              <h1>Estás offline</h1>
              <p>No hay conexión a internet disponible.</p>
              <p>La aplicación funcionará normalmente cuando recuperes la conexión.</p>
              <p><small>Algunas funciones pueden estar limitadas sin conexión.</small></p>
              <a href="javascript:location.reload()" class="btn">Reintentar</a>
          </div>
      </body>
      </html>
      `,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      }
    );
  }
  
  // Para otros tipos de contenido
  return new Response(
    'Contenido no disponible offline',
    {
      status: 503,
      statusText: 'Offline',
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    }
  );
}

// ====== MANEJO DE MENSAJES ======
self.addEventListener('message', (event) => {
  console.log('[Service Worker] 📩 Mensaje recibido:', event.data);
  
  if (!event.data) return;
  
  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      event.source.postMessage({ type: 'SKIPPED_WAITING' });
      break;
      
    case 'CLEAR_CACHE':
      caches.delete(CACHE_NAME).then(() => {
        event.source.postMessage({ type: 'CACHE_CLEARED' });
      });
      break;
      
    case 'GET_VERSION':
      event.source.postMessage({ 
        type: 'VERSION_INFO',
        cacheVersion: CACHE_NAME,
        appVersion: APP_VERSION,
        timestamp: new Date().toISOString()
      });
      break;
      
    case 'CHECK_FOR_UPDATES':
      // Forzar actualización del SW
      self.registration.update().then(() => {
        event.source.postMessage({ 
          type: 'UPDATE_CHECKED',
          cacheVersion: CACHE_NAME
        });
      });
      break;
      
    case 'GET_CACHE_INFO':
      caches.open(CACHE_NAME).then(cache => {
        cache.keys().then(keys => {
          event.source.postMessage({
            type: 'CACHE_INFO',
            cacheName: CACHE_NAME,
            totalFiles: keys.length,
            files: keys.map(k => k.url).slice(0, 10) // Primeros 10
          });
        });
      });
      break;
  }
});

// ====== MANEJO DE PUSH NOTIFICATIONS (OPCIONAL FUTURO) ======
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    console.log('[Service Worker] 🔔 Push recibido:', data);
    
    const options = {
      body: data.body || 'Nueva notificación de Anmago Store',
      icon: data.icon || 'https://ik.imagekit.io/mbsk9dati/logo.jpg?tr=w-192,q-80',
      badge: 'https://ik.imagekit.io/mbsk9dati/logo.jpg?tr=w-96,q-80',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || './',
        timestamp: new Date().toISOString()
      },
      actions: [
        {
          action: 'open',
          title: 'Abrir'
        },
        {
          action: 'close',
          title: 'Cerrar'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(
        data.title || 'Anmago Store',
        options
      )
    );
  } catch (error) {
    console.error('[Service Worker] ❌ Error procesando push:', error);
  }
});

self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] 👆 Notificación clickeada');
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Buscar ventana abierta
        for (const client of clientList) {
          if (client.url.includes('anmagos.github.io') && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Si no hay ventana abierta, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data?.url || './');
        }
      })
    );
  }
});

// ====== SINCRONIZACIÓN EN BACKGROUND (OPCIONAL FUTURO) ======
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] 🔄 Sincronización:', event.tag);
  
  if (event.tag === 'sync-pedidos') {
    event.waitUntil(syncPedidosPendientes());
  }
});

async function syncPedidosPendientes() {
  console.log('[Service Worker] 📤 Sincronizando pedidos pendientes...');
  
  // Aquí iría la lógica para sincronizar pedidos pendientes
  // cuando el dispositivo recupera conexión
  
  return Promise.resolve();
}

// ====== INICIALIZACIÓN ======
console.log('[Service Worker] ✅ Cargado y listo');
console.log(`[Service Worker] 📊 Versión cache: ${CACHE_NAME}`);
console.log(`[Service Worker] 📱 Versión app: ${APP_VERSION}`);

// Exportar funciones para testing (solo en desarrollo)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CACHE_NAME,
    APP_VERSION,
    shouldSkipCache,
    handleFetch,
    getOfflineResponse
  };
}
