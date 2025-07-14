const CACHE_NAME = 'app-cache-v1';
const ASSETS = [
  '/',
  'index.html',
  'style.css',
  'app.js',
  'tabs.js',
  'firebase.config.js',
  'firebase.js',
  'importShopee.js',
  'importPedidos.js',
  'manifest.json',
  'icon-192.png'
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
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
