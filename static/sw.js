self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open("akgularda-cache-v2").then((cache) => {
            return cache.addAll([
                "/",
                "/about/",
                "/blogs/",
                "/404.html",
                "/manifest.json",
                "/images/og-default.jpg",
                "/images/ardaakgul.jpg"
            ]);
        })
    );
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET" || event.request.url.includes("llms") || event.request.url.includes("ai.txt")) {
        return; // NEVER cache AI files in the service worker
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then((networkResponse) => {
                return caches.open("akgularda-cache-v2").then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            });
        })
    );
});
