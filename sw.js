/* Tap & Say service worker. Bump CACHE when you change any asset. */
const CACHE = "tapandsay-v1";
const ASSETS = [
  "/",
  "/assets/style.css",
  "/assets/app.js",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/manifest.webmanifest",
  "/404.html",
  "/alphabet/",
  "/numbers/",
  "/colours/",
  "/shapes/",
  "/animals/",
  "/birds/",
  "/fruits/",
  "/vegetables/",
  "/body/",
  "/family/",
  "/instruments/",
  "/vehicles/",
  "/rhymes/"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache first: everything here is static and versioned by CACHE.
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req)
      .then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match("/404.html"))
    )
  );
});
