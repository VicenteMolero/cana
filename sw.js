/* ¿Terraza hoy? — service worker mínimo: la app se abre aunque no haya red.
   HTML: primero red (siempre la última versión), caché si falla. Resto de lo propio: caché y refresco por detrás.
   Las APIs del tiempo no se cachean aquí: de eso ya se encarga la app con su última respuesta. */
const C = 'terraza-v2';
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(['./'])).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET') return;
  const fonts = u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com';
  if (u.origin !== location.origin && !fonts) return;
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(C).then(c => c.put('./', cp)); return res; }).catch(() => caches.match('./')));
    return;
  }
  e.respondWith(caches.match(r).then(hit => {
    const net = fetch(r).then(res => { if (res && (res.ok || res.type === 'opaque')) { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); } return res; }).catch(() => hit);
    return hit || net;
  }));
});
