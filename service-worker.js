/**
 * Personal Color Pro - Service Worker
 * PWA 오프라인 지원 및 캐싱 관리
 */

const CACHE_NAME = 'personal-color-pro-v1.0.0';
const CACHE_VERSION = '1.0.0';

// 캐시할 리소스 목록
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    
    // 스타일시트
    '/css/styles.css',
    '/css/tablet.css',
    '/css/components.css',
    '/css/animations.css',
    
    // JavaScript 파일들
    '/js/app.js',
    '/js/config.js',
    
    // 컴포넌트들
    '/js/components/DiagnosisMode.js',
    '/js/components/PhotoAnalysis.js',
    '/js/components/DrapingMode.js',
    '/js/components/ReportGenerator.js',
    '/js/components/ColorPalette.js',
    '/js/components/CustomerManager.js',
    '/js/components/UIComponents.js',
    
    // AI 모듈들
    '/js/ai/SkinToneAnalyzer.js',
    '/js/ai/FaceDetection.js',
    '/js/ai/ColorClassifier.js',
    
    // 색상 시스템
    '/js/color/ColorSystem.js',
    '/js/color/DeltaE.js',
    '/js/color/SeasonClassifier.js',
    '/js/color/ColorConverter.js',
    
    // 드레이핑 시스템
    '/js/draping/VirtualDraping.js',
    '/js/draping/ARRenderer.js',
    '/js/draping/ComparisonTool.js',
    '/js/draping/ExpertWorkflow.js',
    
    // 데이터 파일들
    '/js/data/seasons.js',
    '/js/data/colorPalettes.js',
    '/js/data/makeupBrands.js',
    '/js/data/hairColorCharts.js',
    '/js/data/fashionGuide.js',
    '/js/data/koreanSkinTones.js',
    
    // 보고서 시스템
    '/js/report/ReportTemplate.js',
    '/js/report/MakeupRecommendation.js',
    '/js/report/FashionStyling.js',
    '/js/report/HairColorGuide.js',
    '/js/report/PDFGenerator.js',
    
    // 유틸리티
    '/js/utils/camera.js',
    '/js/utils/storage.js',
    '/js/utils/validation.js',
    '/js/utils/performance.js',
    '/js/utils/analytics.js',
    
    // 템플릿 파일들
    '/templates/diagnosis-mode.html',
    '/templates/photo-analysis.html',
    '/templates/draping-interface.html',
    '/templates/color-palette.html',
    '/templates/report-template.html',
    '/templates/customer-form.html',
    
    // 폰트 파일들
    '/assets/fonts/NotoSansKR-Regular.woff2',
    '/assets/fonts/Inter-Variable.woff2',
    
    // 아이콘들
    '/assets/images/icons/icon-192x192.png',
    '/assets/images/icons/icon-512x512.png',
    '/assets/images/icons/favicon.ico',
    '/assets/images/icons/apple-touch-icon.png',
    
    // 사운드 파일들
    '/assets/sounds/camera-shutter.mp3',
    '/assets/sounds/success.mp3',
    '/assets/sounds/notification.mp3'
];

// 데이터 캐시 (동적 콘텐츠)
const DATA_CACHE_NAME = 'personal-color-data-v1.0.0';

// 런타임 캐시 (API 응답 등)
const RUNTIME_CACHE_NAME = 'personal-color-runtime-v1.0.0';

/**
 * Service Worker 설치 이벤트
 */
self.addEventListener('install', (event) => {
    console.log('📦 Service Worker 설치 중...', CACHE_VERSION);
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📥 핵심 리소스 캐싱 중...');
                return cache.addAll(CORE_ASSETS);
            })
            .then(() => {
                console.log('✅ Service Worker 설치 완료');
                // 즉시 활성화
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Service Worker 설치 실패:', error);
            })
    );
});

/**
 * Service Worker 활성화 이벤트
 */
self.addEventListener('activate', (event) => {
    console.log('🔄 Service Worker 활성화 중...', CACHE_VERSION);
    
    event.waitUntil(
        Promise.all([
            // 이전 버전 캐시 정리
            cleanupOldCaches(),
            // 클라이언트 제어 시작
            self.clients.claim()
        ]).then(() => {
            console.log('✅ Service Worker 활성화 완료');
        })
    );
});

/**
 * 네트워크 요청 가로채기
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // 캐시 전략 결정
    if (isCoreAsset(request.url)) {
        // 핵심 리소스: Cache First 전략
        event.respondWith(cacheFirst(request));
    } else if (isDataRequest(request.url)) {
        // 데이터 요청: Network First 전략
        event.respondWith(networkFirst(request));
    } else if (isImageRequest(request)) {
        // 이미지 요청: Cache First with Network Fallback
        event.respondWith(cacheFirstWithNetworkFallback(request));
    } else if (url.origin === location.origin) {
        // 같은 출처 요청: Stale While Revalidate
        event.respondWith(staleWhileRevalidate(request));
    }
    // 외부 요청은 기본 동작 사용
});

/**
 * 백그라운드 동기화
 */
self.addEventListener('sync', (event) => {
    console.log('🔄 백그라운드 동기화:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(handleBackgroundSync());
    } else if (event.tag === 'upload-diagnosis') {
        event.waitUntil(uploadPendingDiagnosis());
    }
});

/**
 * 푸시 알림 수신
 */
self.addEventListener('push', (event) => {
    console.log('📱 푸시 알림 수신:', event);
    
    if (event.data) {
        const data = event.data.json();
        event.waitUntil(showNotification(data));
    }
});

/**
 * 알림 클릭 처리
 */
self.addEventListener('notificationclick', (event) => {
    console.log('🔔 알림 클릭:', event);
    
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow(event.notification.data?.url || '/')
    );
});

/**
 * 메시지 처리 (클라이언트와의 통신)
 */
self.addEventListener('message', (event) => {
    console.log('💬 메시지 수신:', event.data);
    
    if (event.data && event.data.type) {
        switch (event.data.type) {
            case 'SKIP_WAITING':
                self.skipWaiting();
                break;
                
            case 'GET_VERSION':
                event.ports[0].postMessage({ version: CACHE_VERSION });
                break;
                
            case 'CLEAR_CACHE':
                event.waitUntil(clearAllCaches());
                break;
                
            case 'UPDATE_CACHE':
                event.waitUntil(updateCache(event.data.urls));
                break;
                
            case 'PREFETCH_RESOURCES':
                event.waitUntil(prefetchResources(event.data.urls));
                break;
        }
    }
});

/**
 * 캐시 전략: Cache First
 * 캐시에서 먼저 찾고, 없으면 네트워크에서 가져옴
 */
async function cacheFirst(request) {
    try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            console.log('📦 캐시에서 제공:', request.url);
            return cachedResponse;
        }
        
        console.log('🌐 네트워크에서 가져옴:', request.url);
        const networkResponse = await fetch(request);
        
        // 성공적인 응답만 캐시
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        console.error('❌ Cache First 전략 실패:', error);
        
        // 오프라인 페이지 반환 (있는 경우)
        if (request.destination === 'document') {
            const cache = await caches.open(CACHE_NAME);
            return cache.match('/offline.html') || 
                   new Response('오프라인 상태입니다.', { status: 503 });
        }
        
        throw error;
    }
}

/**
 * 캐시 전략: Network First
 * 네트워크에서 먼저 시도하고, 실패하면 캐시 사용
 */
async function networkFirst(request) {
    try {
        console.log('🌐 네트워크 우선 시도:', request.url);
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // 데이터 캐시에 저장
            const cache = await caches.open(DATA_CACHE_NAME);
            cache.put(request, networkResponse.clone());
            
            return networkResponse;
        }
        
        throw new Error('Network response not ok');
        
    } catch (error) {
        console.log('📦 네트워크 실패, 캐시에서 찾는 중:', request.url);
        
        const cache = await caches.open(DATA_CACHE_NAME);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            console.log('📦 캐시에서 제공:', request.url);
            return cachedResponse;
        }
        
        console.error('❌ Network First 전략 실패:', error);
        throw error;
    }
}

/**
 * 캐시 전략: Stale While Revalidate
 * 캐시 응답을 즉시 반환하면서, 백그라운드에서 업데이트
 */
async function staleWhileRevalidate(request) {
    try {
        const cache = await caches.open(RUNTIME_CACHE_NAME);
        const cachedResponse = await cache.match(request);
        
        // 백그라운드에서 네트워크 요청
        const networkResponsePromise = fetch(request).then((response) => {
            if (response.ok) {
                cache.put(request, response.clone());
            }
            return response;
        }).catch(() => {
            // 네트워크 오류는 무시
        });
        
        // 캐시 응답이 있으면 즉시 반환
        if (cachedResponse) {
            console.log('📦 Stale 캐시 제공:', request.url);
            return cachedResponse;
        }
        
        // 캐시가 없으면 네트워크 응답 대기
        console.log('🌐 네트워크 응답 대기:', request.url);
        return await networkResponsePromise;
        
    } catch (error) {
        console.error('❌ Stale While Revalidate 전략 실패:', error);
        throw error;
    }
}

/**
 * 캐시 전략: Cache First with Network Fallback
 * 이미지용 특화 전략
 */
async function cacheFirstWithNetworkFallback(request) {
    try {
        const cache = await caches.open(RUNTIME_CACHE_NAME);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // 이미지는 일정 기간만 캐시
            const headers = new Headers(networkResponse.headers);
            headers.set('Cache-Control', 'max-age=86400'); // 1일
            
            const modifiedResponse = new Response(networkResponse.body, {
                status: networkResponse.status,
                statusText: networkResponse.statusText,
                headers: headers
            });
            
            cache.put(request, modifiedResponse.clone());
            return modifiedResponse;
        }
        
        return networkResponse;
        
    } catch (error) {
        // 기본 이미지 반환 (있는 경우)
        const cache = await caches.open(CACHE_NAME);
        return cache.match('/assets/images/placeholder.png') ||
               new Response('', { status: 404 });
    }
}

/**
 * 이전 버전 캐시 정리
 */
async function cleanupOldCaches() {
    const cacheNames = await caches.keys();
    const currentCaches = [CACHE_NAME, DATA_CACHE_NAME, RUNTIME_CACHE_NAME];
    
    const deletionPromises = cacheNames
        .filter(name => !currentCaches.includes(name))
        .map(name => {
            console.log('🗑️ 이전 캐시 삭제:', name);
            return caches.delete(name);
        });
    
    return Promise.all(deletionPromises);
}

/**
 * 모든 캐시 정리
 */
async function clearAllCaches() {
    const cacheNames = await caches.keys();
    const deletionPromises = cacheNames.map(name => caches.delete(name));
    
    console.log('🗑️ 모든 캐시 정리');
    return Promise.all(deletionPromises);
}

/**
 * 캐시 업데이트
 */
async function updateCache(urls) {
    const cache = await caches.open(CACHE_NAME);
    
    console.log('🔄 캐시 업데이트:', urls);
    return cache.addAll(urls);
}

/**
 * 리소스 선행 가져오기
 */
async function prefetchResources(urls) {
    const cache = await caches.open(RUNTIME_CACHE_NAME);
    
    const fetchPromises = urls.map(async (url) => {
        try {
            const response = await fetch(url);
            if (response.ok) {
                cache.put(url, response);
                console.log('📥 선행 캐시:', url);
            }
        } catch (error) {
            console.warn('⚠️ 선행 캐시 실패:', url, error);
        }
    });
    
    return Promise.all(fetchPromises);
}

/**
 * 백그라운드 동기화 처리
 */
async function handleBackgroundSync() {
    console.log('🔄 백그라운드 동기화 실행');
    
    try {
        // 대기 중인 진단 데이터 업로드
        await uploadPendingDiagnosis();
        
        // 사용자 설정 동기화
        await syncUserSettings();
        
        // 고객 데이터 백업
        await backupCustomerData();
        
        console.log('✅ 백그라운드 동기화 완료');
        
    } catch (error) {
        console.error('❌ 백그라운드 동기화 실패:', error);
        throw error;
    }
}

/**
 * 대기 중인 진단 데이터 업로드
 */
async function uploadPendingDiagnosis() {
    // IndexedDB나 LocalStorage에서 대기 중인 데이터 가져오기
    // 실제 구현에서는 클라이언트와 통신하여 데이터를 가져와야 함
    
    console.log('📤 대기 중인 진단 데이터 업로드');
    // TODO: 실제 업로드 로직 구현
}

/**
 * 사용자 설정 동기화
 */
async function syncUserSettings() {
    console.log('⚙️ 사용자 설정 동기화');
    // TODO: 설정 동기화 로직 구현
}

/**
 * 고객 데이터 백업
 */
async function backupCustomerData() {
    console.log('💾 고객 데이터 백업');
    // TODO: 데이터 백업 로직 구현
}

/**
 * 알림 표시
 */
async function showNotification(data) {
    const options = {
        body: data.body || '새로운 알림이 있습니다.',
        icon: '/assets/images/icons/icon-192x192.png',
        badge: '/assets/images/icons/badge-72x72.png',
        image: data.image,
        data: data,
        actions: data.actions || [],
        requireInteraction: data.requireInteraction || false,
        silent: data.silent || false,
        tag: data.tag || 'default',
        timestamp: Date.now()
    };
    
    return self.registration.showNotification(
        data.title || 'Personal Color Pro',
        options
    );
}

/**
 * 요청이 핵심 리소스인지 확인
 */
function isCoreAsset(url) {
    return CORE_ASSETS.some(asset => url.endsWith(asset));
}

/**
 * 데이터 요청인지 확인
 */
function isDataRequest(url) {
    return url.includes('/api/') || 
           url.includes('/data/') ||
           url.endsWith('.json');
}

/**
 * 이미지 요청인지 확인
 */
function isImageRequest(request) {
    return request.destination === 'image' ||
           /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(request.url);
}

/**
 * 캐시 크기 관리
 */
async function manageCacheSize() {
    const cache = await caches.open(RUNTIME_CACHE_NAME);
    const requests = await cache.keys();
    
    // 100개 이상이면 오래된 것부터 삭제
    if (requests.length > 100) {
        console.log('🗑️ 런타임 캐시 크기 관리');
        
        // 날짜순 정렬 후 오래된 것 삭제
        const sortedRequests = requests.sort((a, b) => {
            return new Date(a.headers.get('Date')) - new Date(b.headers.get('Date'));
        });
        
        const deletePromises = sortedRequests
            .slice(0, 20) // 가장 오래된 20개 삭제
            .map(request => cache.delete(request));
        
        await Promise.all(deletePromises);
    }
}

// 주기적으로 캐시 크기 관리 (1시간마다)
setInterval(manageCacheSize, 60 * 60 * 1000);

console.log('🚀 Service Worker 로드됨:', CACHE_VERSION);
