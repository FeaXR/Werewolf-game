// Service worker: lets the board open without a connection.
//
// Network first, so a new GitHub Pages deploy shows up straight away; the
// cached copy is only used when the network fails. When adding a file the
// page needs, add it to FILES and bump CACHE so offline use keeps working.

const CACHE = "werewolf-v4";
const FILES = [
  "./",
  "index.html",
  "style.css",
  "manifest.webmanifest",
  "js/state.js",
  "js/ui.js",
  "js/render.js",
  "js/players.js",
  "js/reorder.js",
  "js/toolbar.js",
  "js/wakelock.js",
  "js/install.js",
  "js/timer.js",
  "js/deal.js",
  "js/managers.js",
  "js/setups.js",
  "js/main.js",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png",
  "icons/favicon-32.png",
];

self.addEventListener("install", (event) => {
  // "reload" skips the browser's HTTP cache so stale files aren't stored.
  const requests = FILES.map((f) => new Request(f, { cache: "reload" }));
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(requests)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== location.origin)
    return;

  event.respondWith(
    // "no-cache" revalidates with the server (GitHub Pages lets browsers
    // keep files for 10 minutes), so updates appear on the next load.
    fetch(request, { cache: "no-cache" })
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      // ignoreSearch so share links (?game=...) still open offline.
      .catch(() => caches.match(request, { ignoreSearch: true }))
  );
});
