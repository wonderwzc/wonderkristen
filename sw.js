/* 克丽斯腾站点 PWA Service Worker：缓存静态资源，支持离线访问 */
const CACHE_NAME = "christen-v1";
const STATIC_URLS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./bg-music-embed.js",
  "./kw-logo.png",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate" && event.request.url.startsWith("http") && !event.request.url.startsWith(self.location.origin)) {
    return;
  }
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || url.pathname.includes("/olib/")) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((res) => {
        const clone = res.clone();
        if (res.status === 200 && (event.request.mode === "navigate" || event.request.destination === "script" || event.request.destination === "style"))
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return res;
      }).catch(() => {
        if (event.request.mode === "navigate") return caches.match("./index.html");
        return null;
      });
    })
  );
});
