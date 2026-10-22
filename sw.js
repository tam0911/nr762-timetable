const CACHE = "nr762-v2";

let documentFromCache = false;

const PRECACHE = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/app.js",
  "./js/data.js",
  "./js/pwa.js",
  "./manifest.json",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "net-status" && event.source) {
    event.source.postMessage({ fromCache: documentFromCache });
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.endsWith("/sw.js") || url.pathname.includes("/splash/")) return;

  event.respondWith(networkFirst(request));
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await caches.match(request, { ignoreSearch: true });
  const isDocument = request.mode === "navigate";
  try {
    const response = await fetchWithTimeout(request, cached ? 2500 : 8000);
    if (response && response.ok && response.type === "basic" && !response.redirected) {
      await cache.put(request, response.clone());
    }
    if (isDocument) noteDocument(false);
    return response;
  } catch (error) {
    if (cached) {
      if (isDocument) noteDocument(true);
      return cached;
    }
    if (isDocument) {
      const fallback = (await caches.match("./index.html")) || (await caches.match("./"));
      if (fallback) {
        noteDocument(true);
        return fallback;
      }
    }
    throw error;
  }
}

function noteDocument(fromCache) {
  documentFromCache = fromCache;
  self.clients.matchAll({ includeUncontrolled: true }).then((clients) => {
    clients.forEach((client) => client.postMessage({ fromCache }));
  });
}

function fetchWithTimeout(request, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(request, { signal: controller.signal }).finally(() => clearTimeout(timer));
}
