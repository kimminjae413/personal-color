/**
 * Personal Color Pro - Service Worker (간단한 버전)
 * 현재 앱 구조에 맞춘 최적화된 PWA 지원
 */

const CACHE_NAME = 'personal-color-pro-v1.0.0';
const VERSION = '1.0.0';

// 실제 존재하는 파일들만 캐시
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    
    // 실제 존재하는 CSS 파일들만 (404 오류 방지)
    '/css/styles.css',
    '/css/tablet.css', 
    '/css/components.css',
    '/css/animations.css',
    
    // 실제 로드되는 JS 파일들만
    '/js/config.js',
    '/js/utils/validation.js',
    '/js/utils/performance.js',
    '/js/utils/analytics.js'
];

/**
 * Service Worker 설치
 */
self.addEventListener('install', (event) => {
    console.log('📦 Service Worker 설치 중...', VERSION);
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📥 핵심 파일들 캐시 중...');
                // 실패해도 앱이 작동하도록 개별 캐시
                return Promise.allSettled(
                    CORE_ASSETS.map(asset => 
                        cache.add(asset).catch(error => {
                            console.warn(`⚠️ 캐시 실패 (무시됨): ${asset}`, error);
                        })
                    )
                );
            })
            .then(() => {
                console.log('✅ Service Worker 설치 완료');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.warn('⚠️ Service Worker 설치 중 일부 오류 (앱은 정상 작동):', error);
            })
    );
});

/**
 * Service Worker 활성화
 */
self.addEventListener('activate', (event) => {
    console.log('🔄 Service Worker 활성화 중...', VERSION);
    
    event.waitUntil(
        Promise.all([
            // 이전 캐시 정리
            cleanupOldCaches(),
            // 모든 클라이언트 제어
            self.clients.claim()
        ]).then(() => {
            console.log('✅ Service Worker 활성화 완료');
        })
    );
});

/**
 * 네트워크 요청 처리 (간단한 전략)
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    
    // HTML 파일들은 네트워크 우선
    if (request.destination === 'document') {
        event.respondWith(networkFirst(request));
    }
    // CSS, JS 파일들은 캐시 우선  
    else if (request.destination === 'style' || 
             request.destination === 'script') {
        event.respondWith(cacheFirst(request));
    }
    // 나머지는 기본 처리
});

/**
 * 캐시 우선 전략
 */
async function cacheFirst(request) {
    try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            console.log('📦 캐시에서 제공:', request.url);
            return cachedResponse;
        }
        
        // 캐시에 없으면 네트워크에서 가져오고 캐시에 저장
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
            console.log('🌐 네트워크에서 가져와서 캐시함:', request.url);
        }
        
        return networkResponse;
        
    } catch (error) {
        console.warn('⚠️ 캐시 우선 전략 실패:', request.url, error);
        // 네트워크 요청으로 폴백
        return fetch(request);
    }
}

/**
 * 네트워크 우선 전략
 */
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // 성공하면 캐시에 저장
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        // 네트워크 실패 시 캐시에서 찾기
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            console.log('📦 오프라인: 캐시에서 제공:', request.url);
            return cachedResponse;
        }
        
        // 둘 다 실패하면 기본 오프라인 응답
        if (request.destination === 'document') {
            return new Response(`
                <!DOCTYPE html>
                <html lang="ko">
                <head>
                    <meta charset="UTF-8">
                    <title>오프라인</title>
                    <style>
                        body { 
                            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                            display: flex; 
                            align-items: center; 
                            justify-content: center; 
                            height: 100vh; 
                            margin: 0; 
                            background: #f8fafc; 
                            text-align: center;
                        }
                        .offline-message {
                            background: white;
                            padding: 2rem;
                            border-radius: 12px;
                            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                        }
                    </style>
                </head>
                <body>
                    <div class="offline-message">
                        <h1>📶 오프라인 상태</h1>
                        <p>인터넷 연결을 확인한 후 다시 시도해주세요.</p>
                        <button onclick="location.reload()" style="
                            background: #6366f1; 
                            color: white; 
                            border: none; 
                            padding: 12px 24px; 
                            border-radius: 8px; 
                            cursor: pointer;
                            margin-top: 1rem;
                        ">다시 시도</button>
                    </div>
                </body>
                </html>
            `, {
                status: 503,
                headers: { 'Content-Type': 'text/html' }
            });
        }
        
        throw error;
    }
}

/**
 * 이전 버전 캐시 정리
 */
async function cleanupOldCaches() {
    try {
        const cacheNames = await caches.keys();
        
        const deletePromises = cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => {
                console.log('🗑️ 이전 캐시 삭제:', name);
                return caches.delete(name);
            });
        
        return Promise.all(deletePromises);
    } catch (error) {
        console.warn('⚠️ 캐시 정리 실패:', error);
    }
}

/**
 * 클라이언트와의 메시지 통신 (간단한 버전)
 */
self.addEventListener('message', (event) => {
    if (event.data && event.data.type) {
        switch (event.data.type) {
            case 'SKIP_WAITING':
                self.skipWaiting();
                break;
                
            case 'GET_VERSION':
                event.ports[0]?.postMessage({ version: VERSION });
                break;
                
            case 'CLEAR_CACHE':
                event.waitUntil(clearAllCaches());
                break;
        }
    }
});

/**
 * 모든 캐시 정리
 */
async function clearAllCaches() {
    try {
        const cacheNames = await caches.keys();
        const deletePromises = cacheNames.map(name => caches.delete(name));
        
        console.log('🗑️ 모든 캐시 정리');
        await Promise.all(deletePromises);
        
        // 클라이언트에게 알림
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({ type: 'CACHE_CLEARED' });
        });
        
    } catch (error) {
        console.warn('⚠️ 캐시 정리 실패:', error);
    }
}

/**
 * 에러 처리
 */
self.addEventListener('error', (event) => {
    console.error('🚨 Service Worker 에러:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Service Worker Promise 거부:', event.reason);
});

console.log('🚀 Personal Color Pro Service Worker 로드됨 v' + VERSION);
