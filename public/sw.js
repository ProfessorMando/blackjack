const CACHE = 'blackjack-v1';
const APP_SHELL = ['/', '/index.html'];

self.addEventListener('install', (event) => {
  (event as ExtendableEvent).waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)));
});

self.addEventListener('fetch', (event) => {
  const fetchEvent = event as FetchEvent;
  if (fetchEvent.request.url.includes('/api/')) {
    fetchEvent.respondWith(fetch(fetchEvent.request));
    return;
  }
  fetchEvent.respondWith(caches.match(fetchEvent.request).then((hit) => hit ?? fetch(fetchEvent.request)));
});
