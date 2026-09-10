const STATIC_CACHE = "zadify-static-v2";
const DYNAMIC_CACHE = "zadify-dynamic-v2";

const ESSENTIAL_ROUTES = [
  "/",
  "/quran",
  "/prayer-times",
  "/dzikir",
  "/dua",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png"
];

// --- INSTALL EVENT ---
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      await Promise.allSettled(
        ESSENTIAL_ROUTES.map((url) =>
          cache.add(url).catch((err) => console.warn("SW precache failed for:", url, err))
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// --- ACTIVATE EVENT ---
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// --- FETCH STRATEGIES ---
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 1. Tangani Rute API Chat Saat Offline
  if (url.pathname === "/api/chat" && event.request.method === "POST") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({
            reply: "🌙 **Koneksi Terputus**\n\nZad Mentor sedang tidur karena perangkat Anda sedang berada dalam mode offline. Sambungkan kembali ke internet untuk melanjutkan sesi tanya jawab.",
          }),
          {
            headers: { "Content-Type": "application/json" },
            status: 200,
          }
        );
      })
    );
    return;
  }

  // 2. Abaikan Request Non-GET
  if (event.request.method !== "GET") {
    return;
  }

  // 3. Cache-First untuk Aset Statis (Gambar, Font, Ikon)
  if (
    url.pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|woff|woff2|ttf|eot)$/) ||
    url.pathname.startsWith("/_next/image")
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // 4. Stale-While-Revalidate untuk Next.js Static Chunks
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.match(event.request).then((cached) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
          return cached || fetchPromise;
        });
      })
    );
    return;
  }

  // 5. Network-First dengan Offline Cache Fallback untuk Halaman Navigasi
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.mode === "navigate") {
            return caches.match("/") || new Response("Offline", { status: 503 });
          }
          return new Response("", { status: 503, statusText: "Offline" });
        });
      })
  );
});
