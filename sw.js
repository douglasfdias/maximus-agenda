const CACHE = 'maximus-v3';
const ASSETS = ['/maximus-agenda/', '/maximus-agenda/index.html', '/maximus-agenda/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{})));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE && k !== 'share-target').map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Intercepta o POST do share target (Android share sheet)
  if (e.request.method === 'POST' && e.request.url.includes('share=image')) {
    e.respondWith((async () => {
      try {
        const formData = await e.request.formData();
        const image = formData.get('image');
        if (image) {
          // Armazena a imagem num cache temporário para o app buscar
          const cache = await caches.open('share-target');
          await cache.put('shared-image', new Response(image));
        }
      } catch(err) {}
      // Redireciona para o app com flag de share
      return Response.redirect('/maximus-agenda/?share=image', 303);
    })());
    return;
  }

  // Requisições normais: rede primeiro, cache como fallback
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

// Recebe mensagem para pular fila e ativar nova versão imediatamente
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});
