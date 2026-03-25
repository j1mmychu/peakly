// Peakly Service Worker — stale-while-revalidate + offline fallback
const CACHE_NAME = "peakly-v2";
const OFFLINE_URL = "/peakly/offline.html";
const PRECACHE = [
  "/peakly/",
  "/peakly/index.html",
  "/peakly/app.jsx",
  OFFLINE_URL,
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
  // Pass through: non-GET, cross-origin API/CDN calls
  if (e.request.method !== "GET") return;
  if (url.hostname !== location.hostname) return;

  // Navigation requests (HTML pages): network-first, offline fallback
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).catch(() =>
        caches.match(OFFLINE_URL)
      )
    );
    return;
  }

  // App assets: stale-while-revalidate, offline fallback
  e.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(e.request).then((cached) => {
        const fetched = fetch(e.request).then((response) => {
          if (response.ok) cache.put(e.request, response.clone());
          return response;
        }).catch(() => cached || caches.match(OFFLINE_URL));
        return cached || fetched;
      })
    )
  );
});
