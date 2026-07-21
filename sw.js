const CACHE = 'orbit-sync-v3';
const STATIC_ASSETS = [
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    './apple-touch-icon.png'
];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC_ASSETS)));
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
    const url = new URL(e.request.url);

    // Network-first für die Haupt-HTML: immer frische Version laden
    if (url.pathname.endsWith('SpaceWheel.html') || url.pathname.endsWith('/SpaceWheel/')) {
        e.respondWith(
            fetch(e.request)
                .then(response => {
                    caches.open(CACHE).then(c => c.put(e.request, response.clone()));
                    return response;
                })
                .catch(() => caches.match(e.request))
        );
        return;
    }

    // Cache-first für Icons und Manifest (ändern sich selten)
    e.respondWith(
        caches.match(e.request).then(r => r || fetch(e.request))
    );
});
