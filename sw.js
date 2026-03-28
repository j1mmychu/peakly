// Peakly Service Worker — lightweight cache-first for static assets
const CACHE_NAME = "peakly-v12";
const PRECACHE = [
  "/peakly/app.jsx"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // Network-first for API calls and CDN scripts
  if (url.hostname !== location.hostname || e.request.method !== "GET") return;

  // Network-first for index.html and root — ensures latest splash/HTML always loads
  const path = url.pathname;
  if (path === "/peakly/" || path === "/peakly/index.html" || path === "/peakly") {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // Stale-while-revalidate for other app assets (app.jsx, sw.js, manifest, etc.)
  e.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(e.request).then((cached) => {
        const fetched = fetch(e.request).then((response) => {
          if (response.ok) cache.put(e.request, response.clone());
          return response;
        }).catch(() => cached);
        return cached || fetched;
      })
    )
  );
});
