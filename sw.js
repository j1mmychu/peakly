// Peakly Service Worker — lightweight cache-first for static assets + web push handler
const CACHE_NAME = "peakly-20260503a";
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

// ─── Web Push: Strike Alert notifications ─────────────────────────────────────
self.addEventListener("push", (e) => {
  let data = {};
  try {
    data = e.data ? e.data.json() : {};
  } catch {
    data = { title: "Peakly Strike Alert", body: e.data ? e.data.text() : "Conditions are firing!" };
  }

  const title = data.title || "Peakly Strike Alert";
  const options = {
    body: data.body || "Conditions are peaking — check your window now.",
    icon: "/peakly/manifest.json",
    badge: "/peakly/manifest.json",
    tag: data.venueId ? `venue-${data.venueId}` : "peakly-alert",
    renotify: true,
    data: {
      venueId: data.venueId || null,
      score: data.score || null,
      price: data.price || null,
      url: data.venueId
        ? `/peakly/?venue=${data.venueId}`
        : "/peakly/",
    },
  };

  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const targetUrl = (e.notification.data && e.notification.data.url)
    ? e.notification.data.url
    : "/peakly/";

  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // Focus existing tab if already open
      for (const client of windowClients) {
        if (client.url.includes("/peakly") && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Otherwise open a new tab
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
