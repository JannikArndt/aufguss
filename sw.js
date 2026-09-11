/* The service worker. Two jobs and only two.

   1. The app opens with no network. It gets used in a corridor between two
      saunas, on a phone that has been in a locker; needing a connection to
      look up what you poured last Tuesday would be absurd.

   2. A new version arrives as a whole version. The cache is named for VERSION
      and thrown away whole on activate, so a fresh index.html can never end up
      driving last week's modules.

   What it never does: talk to any origin but this one. There are no
   third-party requests to intercept because the app makes none — no fonts, no
   analytics, no CDN — and this file adds none. The journal lives in
   localStorage and is not touched here.

   VERSION must match RELEASE.v in src/release.js. There is no build step to
   keep them in step, so tools/smoke.mjs asserts it, along with SHELL listing
   exactly the files on disk. */

const VERSION = '0.7.0';
const CACHE = 'aufguss-' + VERSION;

const SHELL = [
  './',
  './index.html',
  './app.css',
  './manifest.webmanifest',
  './icon.svg',
  './icon.png',
  './icon-maskable.png',
  './src/main.js',
  './src/release.js',
  './src/core/util.js',
  './src/core/store.js',
  './src/core/catalog.js',
  './src/core/blend.js',
  './src/core/suggest.js',
  './src/ui/parts.js',
  './src/ui/journal.js',
  './src/ui/entry.js',
  './src/ui/oils.js',
  './src/ui/more.js',
  './src/data/oils.js',
  './src/data/oils-rbm.js',
  './src/data/themes.js',
  './src/data/blending.js',
];

self.addEventListener('install', (e) => {
  /* No skipWaiting() here. Swapping the code out from under someone who is
     halfway through writing an Aufguss down is worse than being one version
     behind; this worker waits, and the next cold start takes it — unless the
     'message' handler below is asked to skip that wait, which only happens
     when a person taps "Update jetzt" on the Mehr screen. */
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
});

self.addEventListener('message', (e) => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;

  /* Cache-first inside a version. Network-first would look like an
     improvement and would reintroduce exactly the skew this design prevents,
     as well as costing the offline start. */
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      if (res && res.ok && res.type === 'basic') {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
