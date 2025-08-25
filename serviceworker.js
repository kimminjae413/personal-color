// sw.js - Service Worker for Personal Color Analyzer

const CACHE_NAME = 'personal-color-analyzer-v2.0.0';
const STATIC_CACHE = 'static-v2.0.0';
const DYNAMIC_CACHE = 'dynamic-v2.0.0';

// 캐시할 정적 파일들
const STATIC_FILES = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/app.js',
    '/js/components/FullscreenDraping.js',
    '/js/components/ExpertManual.js',
    '/js/data/seasons.js',
    '/js/data/drapingColors.js',
    '/manifest.json',
    'https://cdn.tailwindcss.com'
];

// 런타임에 캐시할 파일 패턴
const CACHE_PATTERNS = [
    /\.(?:js|css|html)$/,
    /^https:\/\/cdn\.tailwindcss\.com/
];

/**
 * Service Worker 설치
 */
self.addEventListener('install', (event) => {
    console.log('Service Worker 설치 중...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('정적 파일 캐싱 중...');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Service Worker 설치 완료');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Service Worker 설치 실패:', error);
            })
    );
});

/**
 * Service Worker 활성화
 */
self.addEventListener('activate', (event) => {
    console.log('Service Worker 활성화 중...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('오래된 캐시 삭제:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker 활성화 완료');
                return self.clients.claim();
            })
    );
});

/**
 * 네트워크 요청 가로채기
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // 같은 오리진 또는 허용된 외부 리소스만 처리
    if (url.origin !== location.origin && !CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
        return;
    }
    
    event.respondWith(
        caches.match(request)
            .then(response => {
                // 캐시에 있으면 반환
                if (response) {
                    console.log('캐시에서 제공:', request.url);
                    return response;
                }
                
                // 네트워크에서 가져오기
                return fetch(request)
                    .then(networkResponse => {
                        // 유효한 응답인지 확인
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }
                        
                        // 캐시 가능한 요청인지 확인
                        if (shouldCache(request)) {
                            const responseToCache = networkResponse.clone();
                            
                            caches.open(DYNAMIC_CACHE)
                                .then(cache => {
                                    console.log('동적 캐싱:', request.url);
                                    cache.put(request, responseToCache);
                                });
                        }
                        
                        return networkResponse;
                    })
                    .catch(error => {
                        console.error('네트워크 요청 실패:', error);
                        
                        // 오프라인 폴백 제공
                        if (request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                        
                        // 이미지 등 기타 리소스에 대한 폴백
                        return new Response('오프라인 상태입니다', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});

/**
 * 백그라운드 동기화
 */
self.addEventListener('sync', (event) => {
    console.log('백그라운드 동기화:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

/**
 * Push 알림 처리
 */
self.addEventListener('push', (event) => {
    console.log('Push 메시지 수신:', event);
    
    const options = {
        body: event.data ? event.data.text() : '새로운 알림이 있습니다',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '1'
        },
        actions: [
            {
                action: 'open',
                title: '열기',
                icon: '/action-open.png'
            },
            {
                action: 'close',
                title: '닫기',
                icon: '/action-close.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('퍼스널컬러 진단', options)
    );
});

/**
 * 알림 클릭 처리
 */
self.addEventListener('notificationclick', (event) => {
    console.log('알림 클릭됨:', event);
    
    event.notification.close();
    
    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

/**
 * 헬퍼 함수들
 */

function shouldCache(request) {
    return CACHE_PATTERNS.some(pattern => pattern.test(request.url)) ||
           request.method === 'GET';
}

async function doBackgroundSync() {
    try {
        // 백그라운드에서 수행할 작업
        console.log('백그라운드 동기화 수행');
        
        // 예: 오프라인 상태에서 저장된 데이터 동기화
        const offlineData = await getOfflineData();
        if (offlineData.length > 0) {
            await syncOfflineData(offlineData);
        }
        
        // 캐시 업데이트
        await updateCache();
        
    } catch (error) {
        console.error('백그라운드 동기화 실패:', error);
    }
}

async function getOfflineData() {
    // IndexedDB 등에서 오프라인 데이터 가져오기
    return [];
}

async function syncOfflineData(data) {
    // 서버로 오프라인 데이터 전송
    console.log('오프라인 데이터 동기화:', data);
}

async function updateCache() {
    try {
        const cache = await caches.open(STATIC_CACHE);
        const requests = STATIC_FILES.map(url => new Request(url));
        
        await Promise.all(
            requests.map(async request => {
                try {
                    const response = await fetch(request);
                    if (response.ok) {
                        await cache.put(request, response);
                    }
                } catch (error) {
                    console.warn('캐시 업데이트 실패:', request.url);
                }
            })
        );
        
        console.log('캐시 업데이트 완료');
    } catch (error) {
        console.error('캐시 업데이트 중 오류:', error);
    }
}

/**
 * 메시지 리스너 (메인 스레드와 통신)
 */
self.addEventListener('message', (event) => {
    console.log('Service Worker 메시지 수신:', event.data);
    
    if (event.data && event.data.type) {
        switch (event.data.type) {
            case 'SKIP_WAITING':
                self.skipWaiting();
                break;
            case 'GET_VERSION':
                event.ports[0].postMessage({ version: CACHE_NAME });
                break;
            case 'CLEAR_CACHE':
                clearAllCaches().then(() => {
                    event.ports[0].postMessage({ success: true });
                });
                break;
            default:
                console.log('알 수 없는 메시지 타입:', event.data.type);
        }
    }
});

async function clearAllCaches() {
    const cacheNames = await caches.keys();
    await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('모든 캐시 삭제 완료');
}
