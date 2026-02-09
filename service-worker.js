// Service Worker for One Bill PWA
const CACHE_NAME = 'onebill-v1.0.0';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
          .then((fetchResponse) => {
            // Cache new resources
            return caches.open(CACHE_NAME)
              .then((cache) => {
                if (event.request.method === 'GET') {
                  cache.put(event.request, fetchResponse.clone());
                }
                return fetchResponse;
              });
          });
      })
      .catch(() => {
        // Return offline page if available
        return caches.match('/offline.html');
      })
  );
});

// Background Sync - for offline bill submissions
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'sync-bills') {
    event.waitUntil(syncBills());
  }
});

async function syncBills() {
  try {
    // Get pending bills from IndexedDB
    const pendingBills = await getPendingBills();
    
    if (pendingBills.length > 0) {
      console.log(`[Service Worker] Syncing ${pendingBills.length} pending bills`);
      
      for (const bill of pendingBills) {
        try {
          // In a real app, this would send to your backend API
          // await fetch('/api/bills', {
          //   method: 'POST',
          //   body: JSON.stringify(bill)
          // });
          
          // Remove from pending queue
          await removePendingBill(bill.id);
          
          // Notify user
          self.registration.showNotification('Bill Synced', {
            body: `${bill.billTitle} has been uploaded`,
            icon: '/icon-192.png',
            badge: '/badge-72.png',
            tag: 'bill-sync'
          });
        } catch (error) {
          console.error('[Service Worker] Failed to sync bill:', error);
        }
      }
    }
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
  }
}

// Helper functions for IndexedDB (simplified)
async function getPendingBills() {
  // In production, read from IndexedDB
  return [];
}

async function removePendingBill(id) {
  // In production, remove from IndexedDB
  return true;
}

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New bill notification',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'view',
        title: 'View Bill',
        icon: '/icons/view.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/close.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('One Bill', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Periodic Background Sync (for checking expiring bills)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-expiring-bills') {
    event.waitUntil(checkExpiringBills());
  }
});

async function checkExpiringBills() {
  // Check for bills expiring in next 7 days
  // Send notification if found
  console.log('[Service Worker] Checking for expiring bills');
}

// Share Target API handler
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  if (url.pathname === '/share-target' && event.request.method === 'POST') {
    event.respondWith(handleSharedFile(event.request));
  }
});

async function handleSharedFile(request) {
  try {
    const formData = await request.formData();
    const receipt = formData.get('receipt');
    
    if (receipt) {
      // Store shared file in cache or IndexedDB
      console.log('[Service Worker] Received shared file:', receipt.name);
      
      // Redirect to app with shared file indicator
      return Response.redirect('/?shared=true', 303);
    }
  } catch (error) {
    console.error('[Service Worker] Error handling shared file:', error);
  }
  
  return Response.redirect('/', 303);
}

// Message handler for communication with main app
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CACHE_BILL') {
    // Cache a bill for offline access
    caches.open(CACHE_NAME).then((cache) => {
      cache.put(event.data.url, new Response(event.data.data));
    });
  }
});

console.log('[Service Worker] Loaded');
