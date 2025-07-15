// Increment the cache name whenever cached files change
// so the service worker installs a fresh cache.
const CACHE_NAME = 'app-cache-v3';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './tabs.js',
  './firebase-init.js',
  './importShopee.js',
  './importPedidos.js',
  './importDesempenho.js',
  './manifest.json',
  './icon-192.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
});

self.addEventListener('fetch', event => {
   const url = new URL(event.request.url);
  if (url.hostname.includes('googleapis.com')) {
    // Let requests to Firestore or other Google APIs go directly to the network
    return;
  }
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
