const CACHE_NAME = "certifyme-cache-v2"; // Increment cache version to force update
const urlsToCache = ["/", "/index.html"];

// Install event: cache the basic shell of the app
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate event: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// Fetch event: "Network First" strategy
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If the fetch is successful, cache the response and return it
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // If the network fails, try to serve from the cache
        return caches.match(event.request);
      })
  );
});
