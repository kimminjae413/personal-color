/**
 * Personal Color Pro - Service Worker (실제 파일만 캐시)
 * 
 * 🔥 문제 해결:
 * - 존재하지 않는 파일 캐시 시도로 인한 404 오류 해결
 * - cache.addAll() → 개별 cache.add()로 변경
 * - 실패해도 앱이 정상 작동하도록 오류 허용
 * - 버전 업데이트로 기존 캐시 완전 무효화
 */

const CACHE_NAME = 'personal-color-pro-v2.1';
const VERSION = '2.1';

// 🔥 실제 존재하는 핵심 파일들만 캐시 (404 방지)
const ESSENTIAL_FILES = [
    '/',
    '/index.html',
    '/manifest.json'
];

// 선택적으로 캐시할 파일들 (실패해도 무관)
const OPTIONAL_FILES = [
    '/css/styles.css',
    '/css/tablet.css', 
    '/css/components.css',
    '/css/animations.css',
    '/js/config.js'
];

/**
 * Service Worker 설치 (안전한 캐시 전략)
 */
self.addEventListener('install', (event) => {
    console.log('🔥 Service Worker 새 버전 설치:', VERSION);
    
    event.waitUntil(
        Promise.resolve()
            .then(async () => {
                const cache = await caches.open(CACHE_NAME);
                
                // 1단계: 필수 파일들 캐시 (실패하면 설치 실패)
                console.log('📦 필수 파일 캐시 중...');
                try {
                    await cache.addAll(ESSENTIAL_FILES);
                    console.log('✅ 필수 파일 캐시 성공');
                } catch (error) {
                    console.error('❌ 필수 파일 캐시 실패:', error);
                    throw error;
                }
                
                // 2단계: 선택적 파일들 개별 캐시 (실패 허용)
                console.log('📥 선택적 파일 캐시 중...');
                for (const file of OPTIONAL_FILES) {
                    try {
                        await cache.add(file);
                        console.log('✅ 캐시 성공:', file);
                    } catch (error) {
                        console.warn('⚠️ 캐시 실패 (무시됨):', file, error.message);
                    }
                }
                
                console.log('🚀 Service Worker 설치 완료 v' + VERSION);
                
                // 즉시 활성화
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Service Worker 설치 전체 실패:', error);
                throw error;
            })
    );
});

/**
 * Service Worker 활성화
 */
self.addEventListener('activate', (event) => {
    console.log('🔄 Service Worker 활성화:', VERSION);
    
    event.waitUntil(
        Promise.all([
            // 이전 버전 캐시 완전 삭제
            cleanupAllOldCaches(),
            // 모든 클라이언트 즉시 제어
            self.clients.claim()
        ])
        .then(() => {
            console.log('✅ Service Worker 활성화 완료');
            
            // 클라이언트에게 업데이트 알림
            return notifyClientsOfUpdate();
        })
    );
});

/**
 * 네트워크 요청 처리 (간단한 전략)
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // 같은 도메인 요청만 처리
    if (url.origin !== location.origin) {
        return;
    }
    
    // HTML 문서: 네트워크 우선
    if (request.destination === 'document') {
        event.respondWith(networkFirstStrategy(request));
    }
    // CSS, JS: 캐시 우선 
    else if (request.destination === 'style' || request.destination === 'script') {
        event.respondWith(cacheFirstStrategy(request));
    }
});

/**
 * 네트워크 우선 전략
 */
async function networkFirstStrategy(request) {
    try {
        // 네트워크에서 최신 버전 가져오기
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // 성공하면 캐시 업데이트
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone()).catch(error => {
                console.warn('⚠️ 캐시 저장 실패:', error);
            });
        }
        
        return networkResponse;
        
    } catch (error) {
        // 네트워크 실패 시 캐시에서 찾기
        console.log('📦 네트워크 실패, 캐시 사용:', request.url);
        
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // 둘 다 실패하면 기본 오프라인 페이지
        return createOfflineResponse();
    }
}

/**
 * 캐시 우선 전략
 */
async function cacheFirstStrategy(request) {
    try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            console.log('📦 캐시 제공:', request.url);
            return cachedResponse;
        }
        
        // 캐시에 없으면 네트워크에서 가져오기
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // 성공하면 캐시에 저장
            cache.put(request, networkResponse.clone()).catch(error => {
                console.warn('⚠️ 캐시 저장 실패:', error);
            });
        }
        
        return networkResponse;
        
    } catch (error) {
        console.error('❌ 캐시 우선 전략 실패:', request.url, error);
        throw error;
    }
}

/**
 * 모든 이전 캐시 삭제
 */
async function cleanupAllOldCaches() {
    try {
        const cacheNames = await caches.keys();
        
        const deletePromises = cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => {
                console.log('🗑️ 이전 캐시 삭제:', name);
                return caches.delete(name);
            });
        
        await Promise.all(deletePromises);
        console.log('✅ 모든 이전 캐시 삭제 완료');
        
    } catch (error) {
        console.warn('⚠️ 캐시 정리 실패:', error);
    }
}

/**
 * 클라이언트에게 업데이트 알림
 */
async function notifyClientsOfUpdate() {
    try {
        const clients = await self.clients.matchAll();
        
        clients.forEach(client => {
            client.postMessage({
                type: 'SW_UPDATE',
                version: VERSION,
                message: 'Service Worker 업데이트 완료'
            });
        });
        
        console.log('📢 클라이언트 업데이트 알림 완료');
        
    } catch (error) {
        console.warn('⚠️ 클라이언트 알림 실패:', error);
    }
}

/**
 * 오프라인 응답 생성
 */
function createOfflineResponse() {
    return new Response(`
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <title>Personal Color Pro - 오프라인</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    min-height: 100vh; 
                    margin: 0; 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-align: center;
                    padding: 20px;
                    box-sizing: border-box;
                }
                .offline-container {
                    background: rgba(255,255,255,0.1);
                    backdrop-filter: blur(10px);
                    padding: 40px;
                    border-radius: 20px;
                    border: 1px solid rgba(255,255,255,0.2);
                    max-width: 500px;
                }
                .icon { font-size: 64px; margin-bottom: 20px; }
                h1 { margin: 0 0 20px 0; font-size: 2rem; }
                p { margin: 0 0 30px 0; font-size: 1.1rem; opacity: 0.9; }
                button {
                    background: rgba(255,255,255,0.2);
                    border: 1px solid rgba(255,255,255,0.3);
                    color: white;
                    padding: 12px 30px;
                    border-radius: 25px;
                    font-size: 16px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                button:hover {
                    background: rgba(255,255,255,0.3);
                    transform: translateY(-2px);
                }
            </style>
        </head>
        <body>
            <div class="offline-container">
                <div class="icon">📶</div>
                <h1>오프라인 상태</h1>
                <p>인터넷 연결을 확인한 후<br>다시 시도해주세요.</p>
                <button onclick="window.location.reload()">
                    다시 시도
                </button>
            </div>
        </body>
        </html>
    `, {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache'
        }
    });
}

/**
 * 메시지 처리
 */
self.addEventListener('message', (event) => {
    console.log('💬 메시지 수신:', event.data);
    
    if (event.data && event.data.type) {
        switch (event.data.type) {
            case 'SKIP_WAITING':
                self.skipWaiting();
                break;
                
            case 'GET_VERSION':
                event.ports[0]?.postMessage({ version: VERSION });
                break;
                
            case 'CLEAR_ALL_CACHE':
                event.waitUntil(clearAllCache());
                break;
        }
    }
});

/**
 * 전체 캐시 강제 삭제
 */
async function clearAllCache() {
    try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        
        console.log('🗑️ 전체 캐시 삭제 완료');
        
        // 클라이언트에게 알림
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({ type: 'CACHE_CLEARED' });
        });
        
    } catch (error) {
        console.error('❌ 캐시 삭제 실패:', error);
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

// 초기화 로그
console.log('🚀 Personal Color Pro Service Worker v' + VERSION + ' 로드됨');
console.log('📋 캐시 전략: 네트워크 우선 (HTML) + 캐시 우선 (CSS/JS)');
console.log('🛡️ 오류 허용: 개별 파일 캐시 실패 무시');
