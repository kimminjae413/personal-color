// sw.js - 퍼스널컬러 진단 시스템 Service Worker

const CACHE_NAME = 'personal-color-analyzer-v2.0';
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

// 설치 이벤트
self.addEventListener('install', function(event) {
  console.log('Service Worker 설치 중...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('캐시 오픈됨:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
  );
});

// 활성화 이벤트
self.addEventListener('activate', function(event) {
  console.log('Service Worker 활성화됨');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('오래된 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 페치 이벤트
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // 캐시에 있으면 캐시에서 반환
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
