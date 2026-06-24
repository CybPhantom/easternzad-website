// CybPhantom Digital Solutions | https://cybphantom.github.io/business-solutions/ | EZ-2026
var CACHE = 'easternzad-v2';
var ASSETS = [
  './',
  './index.html',
  './about.html',
  './services.html',
  './regions.html',
  './contact.html',
  './manifest.webmanifest',
  './sitemap.xml',
  './llms.txt',
  './assets/logos/easternzad logo.png'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(ASSETS);
    }).then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); }));
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      var fetched = fetch(e.request).then(function(res) {
        if (res && res.status === 200) {
          var copy = res.clone();
          caches.open(CACHE).then(function(c) { c.put(e.request, copy); });
        }
        return res;
      }).catch(function() { return cached; });
      return cached || fetched;
    })
  );
});
