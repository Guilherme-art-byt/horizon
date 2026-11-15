/* Horizon — abre rápido e funciona sem internet para consultar o funil. */
const CACHE = "horizon-pessoal-v1";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./vendor/leaflet.js", "./vendor/leaflet.css", "./vendor/jspdf.umd.min.js", "./icons/icon-192.png", "./icons/icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return; // buscas e mapa sempre direto na internet
  const fresh = req.mode === "navigate" || url.pathname.endsWith(".html") || url.pathname.endsWith("/") || url.pathname.endsWith(".webmanifest");
  if (fresh) {
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); return r; })
      .catch(() => caches.match(req).then(r => r || caches.match("./index.html"))));
  } else {
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(r2 => { const c = r2.clone(); caches.open(CACHE).then(x => x.put(req, c)); return r2; })));
  }
});
