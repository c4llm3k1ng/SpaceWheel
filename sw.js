const CACHE = 'orbit-sync-v59';
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
    if (e.request.method !== 'GET') return;
    const url = new URL(e.request.url);

    // Network-first für die Haupt-HTML: immer frische Version laden.
    // cache: 'no-cache' erzwingt Revalidierung am Server und umgeht den
    // HTTP-Cache des Browsers (GitHub Pages sendet max-age=600).
    // Offline: Fallback auf die zuletzt gecachte Version.
    if (url.pathname.endsWith('SpaceWheel.html') || url.pathname.endsWith('/SpaceWheel/')) {
        e.respondWith(
            fetch(e.request, { cache: 'no-cache' })
                .then(response => {
                    caches.open(CACHE).then(c => c.put(e.request, response.clone()));
                    return response;
                })
                .catch(() => caches.match(e.request))
        );
        return;
    }

    // Firebase-SDK-Skripte vom CDN: cache-first und beim ersten Laden
    // nachcachen — nötig, damit das Spiel offline überhaupt startet
    if (url.hostname.endsWith('gstatic.com')) {
        e.respondWith(
            caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
                const clone = resp.clone();
                caches.open(CACHE).then(c => c.put(e.request, clone));
                return resp;
            }))
        );
        return;
    }

    // Live-API-Traffic (Firestore/Auth) niemals cachen
    if (url.hostname.includes('googleapis.com')) return;

    // Cache-first für Icons und Manifest (ändern sich selten)
    e.respondWith(
        caches.match(e.request).then(r => r || fetch(e.request))
    );
});
