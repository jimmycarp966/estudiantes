const CACHE_NAME = 'e-estudiantes-v1';
const STATIC_CACHE_NAME = 'e-estudiantes-static-v1';
const DYNAMIC_CACHE_NAME = 'e-estudiantes-dynamic-v1';

// Archivos estáticos que siempre queremos cachear
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/auth',
  '/my-library',
  '/shared-library',
  '/upload',
  '/study-tools',
  '/planner',
  '/manifest.json',
  // Agregar más rutas importantes
];

// Estrategia de cache para diferentes tipos de contenido
const CACHE_STRATEGIES = {
  // Páginas HTML - Network First
  pages: 'network-first',
  // Assets estáticos - Cache First
  static: 'cache-first',
  // APIs - Network First con fallback
  api: 'network-first',
  // Imágenes - Cache First
  images: 'cache-first'
};

// Instalar Service Worker
self.addEventListener('install', event => {
  console.log('SW: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache de archivos estáticos
      caches.open(STATIC_CACHE_NAME)
        .then(cache => {
          console.log('SW: Caching static assets');
          return cache.addAll(STATIC_ASSETS);
        }),
      // Activar inmediatamente
      self.skipWaiting()
    ])
  );
});

// Activar Service Worker
self.addEventListener('activate', event => {
  console.log('SW: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Limpiar caches antiguos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              return cacheName !== STATIC_CACHE_NAME && 
                     cacheName !== DYNAMIC_CACHE_NAME;
            })
            .map(cacheName => caches.delete(cacheName))
        );
      }),
      // Tomar control inmediatamente
      self.clients.claim()
    ])
  );
});

// Interceptar peticiones fetch
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo cachear requests del mismo origen
  if (url.origin !== location.origin) {
    return;
  }

  // Determinar estrategia de cache
  let strategy = CACHE_STRATEGIES.pages;
  
  if (request.destination === 'image') {
    strategy = CACHE_STRATEGIES.images;
  } else if (url.pathname.startsWith('/api/') || url.pathname.includes('firebase')) {
    strategy = CACHE_STRATEGIES.api;
  } else if (request.destination === 'script' || 
             request.destination === 'style' || 
             url.pathname.includes('_next/static')) {
    strategy = CACHE_STRATEGIES.static;
  }

  event.respondWith(handleRequest(request, strategy));
});

// Función principal para manejar requests
async function handleRequest(request, strategy) {
  const url = new URL(request.url);
  
  switch (strategy) {
    case 'cache-first':
      return cacheFirst(request);
    case 'network-first':
      return networkFirst(request);
    default:
      return networkFirst(request);
  }
}

// Estrategia Cache First - buscar en cache primero
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('SW: Cache first failed:', error);
    return await caches.match(request) || new Response('Offline', { status: 503 });
  }
}

// Estrategia Network First - intentar red primero
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('SW: Network first failed, trying cache:', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback para páginas HTML
    if (request.headers.get('accept')?.includes('text/html')) {
      const offlinePage = await caches.match('/offline.html');
      return offlinePage || new Response(
        '<!DOCTYPE html><html><head><title>Sin conexión</title></head><body><h1>Sin conexión</h1><p>No hay conexión a internet disponible.</p></body></html>',
        { headers: { 'Content-Type': 'text/html' } }
      );
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Manejar mensajes del cliente
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Evento de sincronización en segundo plano
self.addEventListener('sync', event => {
  console.log('SW: Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Aquí puedes implementar lógica de sincronización
  // como subir archivos pendientes, sincronizar datos, etc.
  console.log('SW: Performing background sync...');
}

// Manejar notificaciones push
self.addEventListener('push', event => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'Nueva notificación de E-Estudiantes',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: data.tag || 'general',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/'
      },
      actions: [
        {
          action: 'open',
          title: 'Abrir',
          icon: '/icons/icon-72x72.png'
        },
        {
          action: 'close',
          title: 'Cerrar'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'E-Estudiantes', options)
    );
  } catch (error) {
    console.error('SW: Error processing push notification:', error);
  }
});

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Si ya hay una ventana abierta, enfocarla
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Si no, abrir nueva ventana
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});