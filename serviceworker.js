// sw.js - Service Worker for Personal Color Analyzer
const CACHE_NAME = 'personal-color-analyzer-v2.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/app.js',
    '/js/data/seasons.js',
    '/js/data/drapingColors.js',
    '/js/components/FullscreenDraping.js',
    '/js/components/ExpertManual.js'
];

// Install event - cache resources
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Service Worker: Cache opened');
                return cache.addAll(urlsToCache);
            })
            .catch(function(error) {
                console.error('Service Worker: Cache failed', error);
            })
    );
});

// Fetch event - serve from cache or fetch from network
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Return cached version or fetch from network
                if (response) {
                    return response;
                }
                return fetch(event.request);
            }
        )
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
