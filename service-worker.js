// CORREGIDO: Rutas exactas que necesitas cachear
const CACHE_NAME = 'anmago-cache-v4';

// SOLO archivos esenciales que SÍ existen
const ARCHIVOS_A_CACHEAR = [
  './',  // Página principal
  './INICIO.HTML',
  './ESTILO.CSS', 
  './carrito.js',
  './app.js',
  './buscador.js',
  './manifest.json',
  'https://ik.imagekit.io/mbsk9dati/logo.jpg',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js'
];
// Instalar y cachear SOLO lo esencial
self.addEventListener('install', event => {
  console.log('[Service Worker] Instalando versión:', CACHE_NAME);
  
  // NO uses cache.addAll() - es todo o nada
  // En su lugar, cachea uno por uno
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      console.log('[Service Worker] Cacheando archivos esenciales...');
      
      // Cachea la página principal primero
      await cache.add('./');
      
      // Intenta cachear otros archivos, pero continúa si falla alguno
      const cachePromises = ARCHIVOS_A_CACHEAR.map(url => {
        return cache.add(url).catch(err => {
          console.warn(`⚠️ No se pudo cachear: ${url}`, err.message);
          return Promise.resolve(); // Continúa con los demás
        });
      });
      
      return Promise.all(cachePromises);
    })
  );
  
  // Fuerza que el nuevo SW tome control inmediatamente
  self.skipWaiting();
});

// El resto del código se mantiene igual...
