
const CACHE = 'mind-armor-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/app.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon-maskable-192.png',
  './assets/icons/icon-maskable-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if(url.origin === location.origin){
    event.respondWith(
      caches.match(event.request).then(res => res || fetch(event.request))
    );
  } else {
    event.respondWith(fetch(event.request).catch(()=>caches.match('./index.html')));
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(self.clients.matchAll({ type:'window' }).then(clients => {
    for(const client of clients){ if('focus' in client){ return client.focus(); } }
    if(self.clients.openWindow) return self.clients.openWindow('./');
  }));
});
