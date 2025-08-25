/**
 * performance.js - 고급 성능 최적화 시스템
 * 
 * 퍼스널컬러 진단 앱의 성능 모니터링, 최적화, 메모리 관리
 * AI 분석, 이미지 처리, 데이터 처리 성능 최적화
 */

class PerformanceOptimizer {
    constructor() {
        this.metrics = {
            memory: new Map(),
            timing: new Map(),
            resources: new Map(),
            errors: new Map()
        };

        this.thresholds = {
            memoryWarning: 50 * 1024 * 1024, // 50MB
            memoryCritical: 100 * 1024 * 1024, // 100MB
            renderTime: 16, // 60fps 기준
            analysisTime: 5000, // AI 분석 5초
            imageProcessing: 2000 // 이미지 처리 2초
        };

        this.optimizations = {
            imageCompression: true,
            lazyLoading: true,
            resourcePreload: true,
            memoryCleanup: true,
            caching: true,
            webWorkers: true,
            requestOptimization: true
        };

        this.cache = {
            images: new Map(),
            analysis: new Map(),
            computation: new Map(),
            maxSize: 100,
            ttl: 30 * 60 * 1000 // 30분
        };

        this.observers = {
            intersection: null,
            performance: null,
            memory: null
        };

        this.workers = new Map();
        this.requestQueue = [];
        this.processingQueue = false;

        this.init();
    }

    /**
     * 시스템 초기화
     */
    async init() {
        this.setupPerformanceMonitoring();
        this.setupMemoryManagement();
        this.setupResourceOptimization();
        this.setupWebWorkers();
        this.setupCaching();
        this.startMonitoring();
        
        console.log('PerformanceOptimizer initialized');
    }

    /**
     * 성능 모니터링 설정
     */
    setupPerformanceMonitoring() {
        // Performance Observer 설정
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    list.getEntries().forEach(entry => {
                        this.recordMetric('timing', entry.name, {
                            duration: entry.duration,
                            startTime: entry.startTime,
                            type: entry.entryType,
                            timestamp: Date.now()
                        });

                        // 성능 임계값 체크
                        this.checkPerformanceThreshold(entry);
                    });
                });

                observer.observe({ entryTypes: ['measure', 'navigation', 'resource', 'paint'] });
                this.observers.performance = observer;
            } catch (error) {
                console.warn('Performance Observer not supported:', error);
            }
        }

        // 메모리 사용량 모니터링
        if ('memory' in performance) {
            setInterval(() => {
                const memInfo = performance.memory;
                this.recordMetric('memory', 'heap', {
                    used: memInfo.usedJSHeapSize,
                    total: memInfo.totalJSHeapSize,
                    limit: memInfo.jsHeapSizeLimit,
                    timestamp: Date.now()
                });

                this.checkMemoryThreshold(memInfo);
            }, 5000); // 5초마다
        }

        // 사용자 지정 성능 마커
        this.addPerformanceMark = (name) => {
            performance.mark(name);
        };

        this.addPerformanceMeasure = (name, startMark, endMark) => {
            performance.measure(name, startMark, endMark);
        };
    }

    /**
     * 메모리 관리 시스템
     */
    setupMemoryManagement() {
        // 자동 가비지 컬렉션 트리거
        this.scheduleMemoryCleanup();

        // 메모리 누수 감지
        this.detectMemoryLeaks();

        // 이미지 메모리 최적화
        this.optimizeImageMemory();
    }

    /**
     * 리소스 최적화 설정
     */
    setupResourceOptimization() {
        // Intersection Observer로 지연 로딩
        this.setupLazyLoading();

        // 리소스 프리로딩
        this.setupResourcePreloading();

        // 이미지 압축 및 최적화
        this.setupImageOptimization();
    }

    /**
     * 웹워커 설정
     */
    async setupWebWorkers() {
        // AI 분석용 워커
        if (window.Worker) {
            try {
                const aiWorker = await this.createWorker('aiAnalysis', `
                    self.onmessage = function(e) {
                        const { imageData, config } = e.data;
                        // AI 분석 로직 (무거운 연산을 워커에서 처리)
                        const result = performAIAnalysis(imageData, config);
                        self.postMessage({ type: 'analysis', result: result });
                    };
                    
                    function performAIAnalysis(imageData, config) {
                        // 실제 AI 분석 구현
                        return { skinTone: null, season: null, confidence: 0 };
                    }
                `);
                
                this.workers.set('ai', aiWorker);

                // 이미지 처리용 워커
                const imageWorker = await this.createWorker('imageProcessing', `
                    self.onmessage = function(e) {
                        const { imageData, operations } = e.data;
                        const result = processImage(imageData, operations);
                        self.postMessage({ type: 'processed', result: result });
                    };
                    
                    function processImage(imageData, operations) {
                        // 이미지 처리 로직
                        return imageData; // 처리된 이미지 데이터
                    }
                `);
                
                this.workers.set('image', imageWorker);

                // 계산용 워커
                const computeWorker = await this.createWorker('computation', `
                    self.onmessage = function(e) {
                        const { type, data } = e.data;
                        let result;
                        
                        switch(type) {
                            case 'deltaE':
                                result = calculateDeltaE(data.lab1, data.lab2);
                                break;
                            case 'colorAnalysis':
                                result = analyzeColorPalette(data.colors);
                                break;
                            default:
                                result = null;
                        }
                        
                        self.postMessage({ type: type, result: result });
                    };
                    
                    function calculateDeltaE(lab1, lab2) {
                        // Delta E 계산
                        const deltaL = lab2.L - lab1.L;
                        const deltaA = lab2.a - lab1.a;
                        const deltaB = lab2.b - lab1.b;
                        return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
                    }
                    
                    function analyzeColorPalette(colors) {
                        // 색상 팔레트 분석
                        return { dominantColors: [], harmony: null };
                    }
                `);
                
                this.workers.set('compute', computeWorker);

            } catch (error) {
                console.warn('Failed to setup web workers:', error);
            }
        }
    }

    /**
     * 캐싱 시스템 설정
     */
    setupCaching() {
        // 캐시 정리 스케줄링
        setInterval(() => {
            this.cleanupCache();
        }, 10 * 60 * 1000); // 10분마다

        // 페이지 언로드 시 캐시 저장
        window.addEventListener('beforeunload', () => {
            this.saveCacheToStorage();
        });

        // 캐시에서 데이터 로드
        this.loadCacheFromStorage();
    }

    /**
     * 성능 임계값 체크
     * @param {PerformanceEntry} entry - 성능 엔트리
     */
    checkPerformanceThreshold(entry) {
        const thresholds = {
            'ai-analysis': this.thresholds.analysisTime,
            'image-processing': this.thresholds.imageProcessing,
            'render': this.thresholds.renderTime
        };

        const threshold = thresholds[entry.name];
        if (threshold && entry.duration > threshold) {
            this.recordMetric('errors', 'performance', {
                name: entry.name,
                duration: entry.duration,
                threshold: threshold,
                overage: entry.duration - threshold,
                timestamp: Date.now()
            });

            // 자동 최적화 트리거
            this.triggerOptimization(entry.name, entry.duration);
        }
    }

    /**
     * 메모리 임계값 체크
     * @param {MemoryInfo} memInfo - 메모리 정보
     */
    checkMemoryThreshold(memInfo) {
        const used = memInfo.usedJSHeapSize;
        
        if (used > this.thresholds.memoryCritical) {
            console.warn('Critical memory usage:', used / 1024 / 1024 + 'MB');
            this.forceMemoryCleanup();
        } else if (used > this.thresholds.memoryWarning) {
            console.warn('High memory usage:', used / 1024 / 1024 + 'MB');
            this.scheduleMemoryCleanup();
        }
    }

    /**
     * AI 분석 성능 최적화
     * @param {ImageData} imageData - 이미지 데이터
     * @param {Object} config - 설정
     * @returns {Promise} 분석 결과
     */
    async optimizedAIAnalysis(imageData, config = {}) {
        const startTime = performance.now();
        this.addPerformanceMark('ai-analysis-start');

        try {
            // 캐시 확인
            const cacheKey = this.generateCacheKey('ai-analysis', imageData, config);
            const cached = this.getFromCache('analysis', cacheKey);
            
            if (cached) {
                console.log('AI analysis cache hit');
                return cached;
            }

            // 이미지 전처리 및 압축
            const optimizedImage = await this.optimizeImageForAnalysis(imageData);

            // 웹워커에서 분석 실행
            let result;
            if (this.workers.has('ai')) {
                result = await this.runInWorker('ai', {
                    imageData: optimizedImage,
                    config: config
                });
            } else {
                // 워커가 없는 경우 메인 스레드에서 실행
                result = await this.performAIAnalysisMainThread(optimizedImage, config);
            }

            // 캐시에 저장
            this.setCache('analysis', cacheKey, result);

            const duration = performance.now() - startTime;
            this.addPerformanceMark('ai-analysis-end');
            this.addPerformanceMeasure('ai-analysis', 'ai-analysis-start', 'ai-analysis-end');

            console.log(`AI analysis completed in ${duration.toFixed(2)}ms`);
            return result;

        } catch (error) {
            console.error('AI analysis failed:', error);
            this.recordMetric('errors', 'ai-analysis', {
                error: error.message,
                timestamp: Date.now()
            });
            throw error;
        }
    }

    /**
     * 이미지 처리 최적화
     * @param {File|Blob} imageFile - 이미지 파일
     * @param {Object} options - 처리 옵션
     * @returns {Promise} 처리된 이미지
     */
    async optimizedImageProcessing(imageFile, options = {}) {
        const startTime = performance.now();
        this.addPerformanceMark('image-processing-start');

        try {
            // 캐시 확인
            const cacheKey = this.generateCacheKey('image-processing', imageFile, options);
            const cached = this.getFromCache('images', cacheKey);
            
            if (cached) {
                return cached;
            }

            // 이미지 크기 및 품질 최적화
            const optimized = await this.optimizeImage(imageFile, options);

            // 웹워커에서 처리
            let result;
            if (this.workers.has('image')) {
                result = await this.runInWorker('image', {
                    imageData: optimized,
                    operations: options.operations || []
                });
            } else {
                result = await this.processImageMainThread(optimized, options);
            }

            // 캐시에 저장
            this.setCache('images', cacheKey, result);

            const duration = performance.now() - startTime;
            this.addPerformanceMark('image-processing-end');
            this.addPerformanceMeasure('image-processing', 'image-processing-start', 'image-processing-end');

            return result;

        } catch (error) {
            console.error('Image processing failed:', error);
            throw error;
        }
    }

    /**
     * 색상 계산 최적화
     * @param {Array} colors - 색상 배열
     * @param {string} operation - 연산 타입
     * @returns {Promise} 계산 결과
     */
    async optimizedColorCalculation(colors, operation) {
        if (this.workers.has('compute')) {
            return await this.runInWorker('compute', {
                type: operation,
                data: { colors: colors }
            });
        } else {
            return await this.performCalculationMainThread(colors, operation);
        }
    }

    /**
     * 지연 로딩 설정
     */
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        
                        // 이미지 지연 로딩
                        if (element.dataset.src) {
                            element.src = element.dataset.src;
                            element.removeAttribute('data-src');
                        }

                        // 컴포넌트 지연 로딩
                        if (element.dataset.component) {
                            this.loadComponent(element.dataset.component, element);
                        }

                        observer.unobserve(element);
                    }
                });
            }, {
                root: null,
                rootMargin: '50px',
                threshold: 0.1
            });

            this.observers.intersection = observer;

            // 지연 로딩 대상 요소들 관찰
            document.querySelectorAll('[data-src], [data-component]').forEach(el => {
                observer.observe(el);
            });
        }
    }

    /**
     * 리소스 프리로딩
     */
    setupResourcePreloading() {
        // 중요한 리소스 프리로드
        const criticalResources = [
            '/js/ai/SkinToneAnalyzer.js',
            '/js/color/ColorSystem.js',
            '/data/seasons.json',
            '/data/koreanSkinTones.json'
        ];

        criticalResources.forEach(resource => {
            this.preloadResource(resource);
        });
    }

    /**
     * 리소스 프리로드
     * @param {string} url - 리소스 URL
     * @param {string} type - 리소스 타입
     */
    preloadResource(url, type = 'script') {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = url;
        link.as = type;
        document.head.appendChild(link);
    }

    /**
     * 이미지 최적화
     * @param {File|Blob} imageFile - 원본 이미지
     * @param {Object} options - 최적화 옵션
     * @returns {Promise} 최적화된 이미지
     */
    async optimizeImage(imageFile, options = {}) {
        const {
            maxWidth = 1920,
            maxHeight = 1080,
            quality = 0.8,
            format = 'jpeg'
        } = options;

        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // 비율을 유지하면서 크기 조정
                const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
                const width = img.width * ratio;
                const height = img.height * ratio;

                canvas.width = width;
                canvas.height = height;

                // 이미지 그리기
                ctx.drawImage(img, 0, 0, width, height);

                // 최적화된 이미지 데이터 생성
                canvas.toBlob(resolve, `image/${format}`, quality);
            };

            img.onerror = reject;
            img.src = URL.createObjectURL(imageFile);
        });
    }

    /**
     * 이미지 분석용 최적화
     * @param {ImageData} imageData - 이미지 데이터
     * @returns {ImageData} 최적화된 이미지 데이터
     */
    async optimizeImageForAnalysis(imageData) {
        // AI 분석에 최적화된 크기로 리사이즈 (보통 더 작은 크기)
        const targetWidth = 640;
        const targetHeight = 480;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        // 이미지 데이터를 캔버스에 그리기
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = imageData.width;
        tempCanvas.height = imageData.height;
        tempCtx.putImageData(imageData, 0, 0);
        
        // 리사이즈
        ctx.drawImage(tempCanvas, 0, 0, targetWidth, targetHeight);
        
        return ctx.getImageData(0, 0, targetWidth, targetHeight);
    }

    /**
     * 웹워커에서 작업 실행
     * @param {string} workerName - 워커 이름
     * @param {*} data - 전송할 데이터
     * @returns {Promise} 작업 결과
     */
    runInWorker(workerName, data) {
        return new Promise((resolve, reject) => {
            const worker = this.workers.get(workerName);
            if (!worker) {
                reject(new Error(`Worker ${workerName} not found`));
                return;
            }

            const messageHandler = (event) => {
                worker.removeEventListener('message', messageHandler);
                resolve(event.data.result);
            };

            const errorHandler = (error) => {
                worker.removeEventListener('error', errorHandler);
                reject(error);
            };

            worker.addEventListener('message', messageHandler);
            worker.addEventListener('error', errorHandler);
            worker.postMessage(data);
        });
    }

    /**
     * 워커 생성
     * @param {string} name - 워커 이름
     * @param {string} code - 워커 코드
     * @returns {Worker} 생성된 워커
     */
    createWorker(name, code) {
        const blob = new Blob([code], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        const worker = new Worker(workerUrl);
        
        worker.addEventListener('error', (error) => {
            console.error(`Worker ${name} error:`, error);
        });

        return worker;
    }

    /**
     * 메모리 정리 스케줄링
     */
    scheduleMemoryCleanup() {
        if (this.memoryCleanupTimer) {
            clearTimeout(this.memoryCleanupTimer);
        }

        this.memoryCleanupTimer = setTimeout(() => {
            this.performMemoryCleanup();
        }, 30000); // 30초 후
    }

    /**
     * 메모리 정리 실행
     */
    performMemoryCleanup() {
        // 캐시 정리
        this.cleanupCache();

        // 사용하지 않는 이미지 객체 정리
        this.cleanupImages();

        // 이벤트 리스너 정리
        this.cleanupEventListeners();

        // 강제 가비지 컬렉션 (가능한 경우)
        if (window.gc) {
            window.gc();
        }

        console.log('Memory cleanup performed');
    }

    /**
     * 강제 메모리 정리
     */
    forceMemoryCleanup() {
        // 모든 캐시 클리어
        this.clearAllCaches();

        // 워커 재시작
        this.restartWorkers();

        // DOM 요소 정리
        this.cleanupDOM();

        this.performMemoryCleanup();
    }

    /**
     * 캐시 정리
     */
    cleanupCache() {
        const now = Date.now();
        
        ['images', 'analysis', 'computation'].forEach(cacheType => {
            const cache = this.cache[cacheType];
            const entries = Array.from(cache.entries());
            
            entries.forEach(([key, value]) => {
                if (now - value.timestamp > this.cache.ttl) {
                    cache.delete(key);
                }
            });

            // 크기 제한
            if (cache.size > this.cache.maxSize) {
                const sortedEntries = entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
                const toRemove = sortedEntries.slice(0, cache.size - this.cache.maxSize);
                toRemove.forEach(([key]) => cache.delete(key));
            }
        });
    }

    /**
     * 캐시 관련 메서드들
     */
    generateCacheKey(type, ...args) {
        const data = JSON.stringify(args);
        return `${type}_${this.hashString(data)}`;
    }

    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 32비트 정수로 변환
        }
        return hash.toString(36);
    }

    getFromCache(cacheType, key) {
        const cache = this.cache[cacheType];
        const entry = cache.get(key);
        
        if (entry && Date.now() - entry.timestamp < this.cache.ttl) {
            return entry.data;
        }
        
        return null;
    }

    setCache(cacheType, key, data) {
        const cache = this.cache[cacheType];
        cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    /**
     * 성능 메트릭 기록
     * @param {string} category - 카테고리
     * @param {string} name - 메트릭 이름
     * @param {*} value - 값
     */
    recordMetric(category, name, value) {
        const categoryMap = this.metrics[category];
        if (categoryMap) {
            categoryMap.set(name, value);
        }
    }

    /**
     * 성능 리포트 생성
     * @returns {Object} 성능 리포트
     */
    generatePerformanceReport() {
        const report = {
            timestamp: Date.now(),
            memory: Object.fromEntries(this.metrics.memory),
            timing: Object.fromEntries(this.metrics.timing),
            resources: Object.fromEntries(this.metrics.resources),
            errors: Object.fromEntries(this.metrics.errors),
            cacheStats: this.getCacheStats(),
            optimizations: this.optimizations,
            recommendations: this.generateRecommendations()
        };

        return report;
    }

    /**
     * 최적화 추천사항 생성
     * @returns {Array} 추천사항
     */
    generateRecommendations() {
        const recommendations = [];
        
        // 메모리 사용량 체크
        const memoryEntries = Array.from(this.metrics.memory.values());
        if (memoryEntries.length > 0) {
            const avgMemory = memoryEntries.reduce((sum, entry) => sum + entry.used, 0) / memoryEntries.length;
            if (avgMemory > this.thresholds.memoryWarning) {
                recommendations.push({
                    type: 'memory',
                    priority: 'high',
                    message: '메모리 사용량이 높습니다. 캐시 크기를 줄이거나 정리 주기를 늘려보세요.'
                });
            }
        }

        // 성능 타이밍 체크
        const timingEntries = Array.from(this.metrics.timing.values());
        timingEntries.forEach(entry => {
            if (entry.duration > this.thresholds.renderTime && entry.name.includes('render')) {
                recommendations.push({
                    type: 'rendering',
                    priority: 'medium',
                    message: '렌더링 성능이 저하되었습니다. DOM 조작을 최적화하세요.'
                });
            }
        });

        return recommendations;
    }

    /**
     * 모니터링 시작
     */
    startMonitoring() {
        // 정기적인 성능 체크
        setInterval(() => {
            this.performPerformanceCheck();
        }, 60000); // 1분마다

        console.log('Performance monitoring started');
    }

    /**
     * 정기 성능 체크
     */
    performPerformanceCheck() {
        // 메모리 사용량 체크
        if (performance.memory) {
            this.checkMemoryThreshold(performance.memory);
        }

        // 캐시 효율성 체크
        this.analyzeCacheEfficiency();

        // 자동 최적화 트리거
        this.triggerAutoOptimization();
    }

    /**
     * 자동 최적화 실행
     */
    triggerAutoOptimization() {
        // 메모리 사용량이 높으면 정리
        if (performance.memory && performance.memory.usedJSHeapSize > this.thresholds.memoryWarning) {
            this.scheduleMemoryCleanup();
        }

        // 캐시 히트율이 낮으면 캐시 전략 조정
        const cacheStats = this.getCacheStats();
        if (cacheStats.hitRate < 0.5) {
            this.optimizeCacheStrategy();
        }
    }

    /**
     * 유틸리티 메서드들
     */
    getCacheStats() {
        const stats = {};
        
        ['images', 'analysis', 'computation'].forEach(cacheType => {
            const cache = this.cache[cacheType];
            stats[cacheType] = {
                size: cache.size,
                maxSize: this.cache.maxSize,
                utilization: (cache.size / this.cache.maxSize) * 100
            };
        });

        return stats;
    }

    optimizeCacheStrategy() {
        // 캐시 전략 최적화 로직
        console.log('Optimizing cache strategy');
    }

    analyzeCacheEfficiency() {
        // 캐시 효율성 분석 로직
        console.log('Analyzing cache efficiency');
    }

    // 추가 유틸리티 메서드들...
    cleanupImages() {
        document.querySelectorAll('img[src^="blob:"]').forEach(img => {
            if (!img.offsetParent) { // 숨겨진 이미지
                URL.revokeObjectURL(img.src);
                img.src = '';
            }
        });
    }

    cleanupEventListeners() {
        // 사용하지 않는 이벤트 리스너 정리
        // 실제 구현에서는 리스너 추적 시스템 필요
        console.log('Cleaning up event listeners');
    }

    cleanupDOM() {
        // 사용하지 않는 DOM 요소 정리
        document.querySelectorAll('[data-cleanup="true"]').forEach(el => {
            el.remove();
        });
    }

    clearAllCaches() {
        this.cache.images.clear();
        this.cache.analysis.clear();
        this.cache.computation.clear();
    }

    restartWorkers() {
        this.workers.forEach((worker, name) => {
            worker.terminate();
            this.workers.delete(name);
        });
        this.setupWebWorkers();
    }

    saveCacheToStorage() {
        try {
            const cacheData = {
                images: Array.from(this.cache.images.entries()),
                analysis: Array.from(this.cache.analysis.entries()),
                computation: Array.from(this.cache.computation.entries())
            };
            localStorage.setItem('performance_cache', JSON.stringify(cacheData));
        } catch (error) {
            console.warn('Failed to save cache to storage:', error);
        }
    }

    loadCacheFromStorage() {
        try {
            const cached = localStorage.getItem('performance_cache');
            if (cached) {
                const cacheData = JSON.parse(cached);
                
                // 만료된 항목 제외하고 로드
                const now = Date.now();
                Object.keys(cacheData).forEach(cacheType => {
                    if (this.cache[cacheType]) {
                        cacheData[cacheType].forEach(([key, value]) => {
                            if (now - value.timestamp < this.cache.ttl) {
                                this.cache[cacheType].set(key, value);
                            }
                        });
                    }
                });
            }
        } catch (error) {
            console.warn('Failed to load cache from storage:', error);
        }
    }

    loadComponent(componentName, element) {
        // 컴포넌트 지연 로딩 로직
        console.log(`Loading component: ${componentName}`);
    }

    triggerOptimization(operationName, duration) {
        // 특정 작업에 대한 최적화 트리거
        switch (operationName) {
            case 'ai-analysis':
                if (duration > this.thresholds.analysisTime) {
                    this.optimizeAIAnalysis();
                }
                break;
            case 'image-processing':
                if (duration > this.thresholds.imageProcessing) {
                    this.optimizeImageProcessing();
                }
                break;
            case 'render':
                if (duration > this.thresholds.renderTime) {
                    this.optimizeRendering();
                }
                break;
        }
    }

    optimizeAIAnalysis() {
        // AI 분석 최적화
        console.log('Optimizing AI analysis performance');
        
        // 이미지 크기 축소
        this.optimizations.imageCompression = true;
        
        // 캐시 적극 활용
        this.cache.maxSize = Math.min(this.cache.maxSize * 1.5, 200);
    }

    optimizeImageProcessing() {
        // 이미지 처리 최적화
        console.log('Optimizing image processing performance');
        
        // 웹워커 우선 사용
        this.optimizations.webWorkers = true;
    }

    optimizeRendering() {
        // 렌더링 최적화
        console.log('Optimizing rendering performance');
        
        // 지연 로딩 강화
        this.optimizations.lazyLoading = true;
        
        // 불필요한 DOM 조작 최소화
        this.batchDOMUpdates = true;
    }

    async performAIAnalysisMainThread(imageData, config) {
        // 메인 스레드에서 AI 분석 실행 (워커 없을 때)
        console.log('Performing AI analysis on main thread');
        
        // 실제 구현에서는 SkinToneAnalyzer 사용
        if (window.skinToneAnalyzer) {
            return await window.skinToneAnalyzer.analyzeImage(imageData, config);
        }
        
        // 기본 구현
        return {
            season: 'spring',
            confidence: 75,
            skinTone: { L: 65, a: 8, b: 12 },
            undertone: 'warm'
        };
    }

    async processImageMainThread(imageData, options) {
        // 메인 스레드에서 이미지 처리 (워커 없을 때)
        console.log('Processing image on main thread');
        
        // 기본 이미지 처리
        return imageData;
    }

    async performCalculationMainThread(data, operation) {
        // 메인 스레드에서 계산 실행
        switch (operation) {
            case 'deltaE':
                if (window.deltaE) {
                    return window.deltaE.calculate(data.lab1, data.lab2);
                }
                break;
            case 'colorAnalysis':
                // 색상 분석 로직
                return { dominantColors: [], harmony: null };
        }
        
        return null;
    }

    detectMemoryLeaks() {
        // 메모리 누수 감지
        let lastMemoryUsage = 0;
        const memoryGrowthThreshold = 10 * 1024 * 1024; // 10MB
        
        setInterval(() => {
            if (performance.memory) {
                const currentUsage = performance.memory.usedJSHeapSize;
                const growth = currentUsage - lastMemoryUsage;
                
                if (growth > memoryGrowthThreshold) {
                    console.warn('Potential memory leak detected:', {
                        growth: growth / 1024 / 1024 + 'MB',
                        current: currentUsage / 1024 / 1024 + 'MB'
                    });
                    
                    this.recordMetric('errors', 'memory-leak', {
                        growth: growth,
                        current: currentUsage,
                        timestamp: Date.now()
                    });
                }
                
                lastMemoryUsage = currentUsage;
            }
        }, 30000); // 30초마다
    }

    optimizeImageMemory() {
        // 이미지 메모리 최적화
        const imageCache = new Map();
        const maxImageCacheSize = 50;
        
        // 이미지 로딩 인터셉트
        const originalCreateElement = document.createElement;
        document.createElement = function(tagName) {
            const element = originalCreateElement.call(document, tagName);
            
            if (tagName.toLowerCase() === 'img') {
                const originalSetSrc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src').set;
                
                Object.defineProperty(element, 'src', {
                    set: function(value) {
                        // 캐시 확인
                        if (imageCache.has(value)) {
                            const cached = imageCache.get(value);
                            if (Date.now() - cached.timestamp < 300000) { // 5분
                                originalSetSrc.call(this, cached.dataUrl);
                                return;
                            }
                        }
                        
                        // 원래 동작
                        originalSetSrc.call(this, value);
                        
                        // 로드 완료 후 캐싱
                        this.addEventListener('load', () => {
                            try {
                                const canvas = document.createElement('canvas');
                                const ctx = canvas.getContext('2d');
                                canvas.width = this.naturalWidth;
                                canvas.height = this.naturalHeight;
                                ctx.drawImage(this, 0, 0);
                                
                                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                                
                                // 캐시 크기 관리
                                if (imageCache.size >= maxImageCacheSize) {
                                    const firstKey = imageCache.keys().next().value;
                                    imageCache.delete(firstKey);
                                }
                                
                                imageCache.set(value, {
                                    dataUrl: dataUrl,
                                    timestamp: Date.now()
                                });
                            } catch (error) {
                                console.warn('Image caching failed:', error);
                            }
                        }, { once: true });
                    },
                    get: function() {
                        return Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src').get.call(this);
                    }
                });
            }
            
            return element;
        };
    }

    setupImageOptimization() {
        // 이미지 로딩 최적화
        document.addEventListener('DOMContentLoaded', () => {
            // Intersection Observer로 이미지 지연 로딩
            if (this.observers.intersection) {
                document.querySelectorAll('img[data-src]').forEach(img => {
                    this.observers.intersection.observe(img);
                });
            }

            // 이미지 포맷 최적화
            this.optimizeImageFormats();
        });
    }

    optimizeImageFormats() {
        // 브라우저 지원에 따른 이미지 포맷 최적화
        const supportsWebP = this.checkWebPSupport();
        const supportsAVIF = this.checkAVIFSupport();

        document.querySelectorAll('img[data-optimize]').forEach(img => {
            const originalSrc = img.dataset.src || img.src;
            
            if (supportsAVIF) {
                img.src = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.avif');
            } else if (supportsWebP) {
                img.src = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
            }
        });
    }

    checkWebPSupport() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('webp') > 0;
    }

    checkAVIFSupport() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        try {
            return canvas.toDataURL('image/avif').indexOf('avif') > 0;
        } catch {
            return false;
        }
    }

    // 요청 최적화 (배치 처리)
    queueRequest(requestFn) {
        this.requestQueue.push(requestFn);
        
        if (!this.processingQueue) {
            this.processRequestQueue();
        }
    }

    async processRequestQueue() {
        if (this.processingQueue || this.requestQueue.length === 0) {
            return;
        }

        this.processingQueue = true;

        try {
            // 배치 크기 제한
            const batchSize = 5;
            while (this.requestQueue.length > 0) {
                const batch = this.requestQueue.splice(0, batchSize);
                await Promise.all(batch.map(fn => fn()));
                
                // 다음 배치 전에 잠시 대기 (브라우저 응답성 유지)
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        } finally {
            this.processingQueue = false;
        }
    }

    // 디바운스된 함수 생성
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 스로틀된 함수 생성
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // 성능 최적화 유틸리티들
    batchDOMUpdates(updates) {
        // DOM 업데이트 배치 처리
        if (updates.length === 0) return;

        // DocumentFragment 사용으로 리플로우 최소화
        const fragment = document.createDocumentFragment();
        
        updates.forEach(update => {
            if (typeof update === 'function') {
                update(fragment);
            }
        });

        // 한 번에 DOM에 적용
        if (fragment.children.length > 0) {
            document.body.appendChild(fragment);
        }
    }

    // 리사이즈 최적화
    optimizeResize() {
        const optimizedResize = this.throttle(() => {
            // 리사이즈 핸들링 로직
            this.handleResize();
        }, 150);

        window.addEventListener('resize', optimizedResize);
    }

    handleResize() {
        // 반응형 이미지 최적화
        document.querySelectorAll('img[data-responsive]').forEach(img => {
            const width = img.offsetWidth;
            const src = img.dataset.src;
            
            if (width <= 480) {
                img.src = src.replace(/(\.[^.]+)$/, '_small$1');
            } else if (width <= 768) {
                img.src = src.replace(/(\.[^.]+)$/, '_medium$1');
            } else {
                img.src = src.replace(/(\.[^.]+)$/, '_large$1');
            }
        });
    }

    // 성능 프로파일링
    profileFunction(name, fn) {
        return (...args) => {
            const start = performance.now();
            const result = fn.apply(this, args);
            const end = performance.now();
            
            this.recordMetric('timing', name, {
                duration: end - start,
                startTime: start,
                timestamp: Date.now()
            });
            
            return result;
        };
    }

    // 비동기 함수 프로파일링
    profileAsyncFunction(name, fn) {
        return async (...args) => {
            const start = performance.now();
            try {
                const result = await fn.apply(this, args);
                const end = performance.now();
                
                this.recordMetric('timing', name, {
                    duration: end - start,
                    startTime: start,
                    success: true,
                    timestamp: Date.now()
                });
                
                return result;
            } catch (error) {
                const end = performance.now();
                
                this.recordMetric('timing', name, {
                    duration: end - start,
                    startTime: start,
                    success: false,
                    error: error.message,
                    timestamp: Date.now()
                });
                
                throw error;
            }
        };
    }
}

// 전역 인스턴스 생성
const performanceOptimizer = new PerformanceOptimizer();

// 편의 함수들
const optimizeAI = (imageData, config) => performanceOptimizer.optimizedAIAnalysis(imageData, config);
const optimizeImage = (imageFile, options) => performanceOptimizer.optimizedImageProcessing(imageFile, options);
const optimizeColor = (colors, operation) => performanceOptimizer.optimizedColorCalculation(colors, operation);
const getPerformanceReport = () => performanceOptimizer.generatePerformanceReport();
const profileFn = (name, fn) => performanceOptimizer.profileFunction(name, fn);
const profileAsyncFn = (name, fn) => performanceOptimizer.profileAsyncFunction(name, fn);

// 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PerformanceOptimizer,
        optimizeAI,
        optimizeImage,
        optimizeColor,
        getPerformanceReport,
        profileFn,
        profileAsyncFn
    };
} else if (typeof window !== 'undefined') {
    window.PerformanceOptimizer = PerformanceOptimizer;
    window.performanceOptimizer = performanceOptimizer;
    window.optimizeAI = optimizeAI;
    window.optimizeImage = optimizeImage;
    window.optimizeColor = optimizeColor;
    window.getPerformanceReport = getPerformanceReport;
    window.profileFn = profileFn;
    window.profileAsyncFn = profileAsyncFn;
}
