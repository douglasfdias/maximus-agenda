// ══════════════════════════════════════════════════════════════════
//  AGENDA MÁXIMUS — Service Worker
//  Ao subir nova versão do app, incremente o número abaixo:
//  v1 → v2 → v3 → ...
// ══════════════════════════════════════════════════════════════════
const VERSION = 'v12';
const CACHE = 'maximus-' + VERSION;
const ASSETS = ['/maximus-agenda/', '/maximus-agenda/index.html', '/maximus-agenda/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})));
  // NÃO chama skipWaiting aqui — fica em espera para o banner aparecer
  // O skipWaiting só ocorre quando o usuário clica em "Atualizar"
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
  // Ignora requisições cross-origin (Apps Script, Google APIs, fontes, etc.)
  // O SW só cuida dos assets do próprio app
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Usuário clicou em "Atualizar" no banner — ativa o novo SW agora
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});
