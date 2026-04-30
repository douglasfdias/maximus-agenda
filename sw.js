// ══════════════════════════════════════════════════════════════════
//  AGENDA MÁXIMUS — Service Worker
//  Ao subir nova versão do app, incremente o número abaixo:
//  v1 → v2 → v3 → ...
// ══════════════════════════════════════════════════════════════════
const VERSION = 'v6';
const CACHE = 'maximus-' + VERSION;
const ASSETS = ['/maximus-agenda/', '/maximus-agenda/index.html', '/maximus-agenda/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{})));
  // Não espera — instala imediatamente
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone)).catch(()=>{});
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Recebe mensagem para ativar nova versão imediatamente
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});
