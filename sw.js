const CACHE = 'orbit-sync-v79';
const STATIC_ASSETS = [
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    './apple-touch-icon.png'
];

// Firebase-SDK mitspeichern, damit eine bestehende Anmeldung auch ohne
// Verbindung wiederhergestellt werden kann. Die Skripte werden mit
// crossorigin="anonymous" geladen, liefern also normale (nicht opake)
// Antworten und lassen sich dadurch zuverlässig ablegen und prüfen.
const CDN_ASSETS = [
    'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js',
    'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js'
];

self.addEventListener('install', e => {
    e.waitUntil((async () => {
        const c = await caches.open(CACHE);
        // Einzeln ablegen: ein fehlgeschlagener Download darf die Installation
        // des Service Workers nicht verhindern (addAll schlägt sonst komplett fehl)
        await Promise.all(STATIC_ASSETS.map(u => c.add(u).catch(() => {})));
        await Promise.all(CDN_ASSETS.map(u =>
            c.add(new Request(u, { mode: 'cors' })).catch(() => {})
        ));
    })());
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
            caches.match(e.request, { ignoreVary: true }).then(r => r || fetch(e.request).then(resp => {
                const clone = resp.clone();
                caches.open(CACHE).then(c => c.put(e.request, clone)).catch(() => {});
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
