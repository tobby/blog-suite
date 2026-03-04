const CACHE_NAME = "profiledrisk-blog-v1";
const OFFLINE_URL = "/offline.html";

const PRECACHE_URLS = [
  "/offline.html",
  "/manifest.json",
];

// Install: precache essential resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: NetworkFirst for pages, CacheFirst for static assets
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip API routes and auth
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/studio")) return;

  // Static assets: CacheFirst
  if (
    url.pathname.match(/\.(js|css|woff2?|png|jpg|jpeg|webp|svg|gif|ico)$/)
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            return response;
          })
      )
    );
    return;
  }

  // Blog pages: NetworkFirst with cache fallback
  if (url.pathname.startsWith("/blog/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() =>
          caches.match(request).then(
            (cached) => cached || caches.match(OFFLINE_URL)
          )
        )
    );
    return;
  }

  // Default: NetworkFirst
  event.respondWith(
    fetch(request).catch(() =>
      caches.match(request).then(
        (cached) => cached || caches.match(OFFLINE_URL)
      )
    )
  );
});
