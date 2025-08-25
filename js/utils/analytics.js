/**
 * analytics.js - 종합 사용량 분석 시스템
 * 
 * 퍼스널컬러 진단 앱의 사용자 행동, 성능, 비즈니스 지표 추적
 * 프라이버시 중심의 안전한 데이터 수집 및 분석
 */

class AnalyticsSystem {
    constructor() {
        this.config = {
            enableTracking: true,
            enablePerformance: true,
            enableBehavior: true,
            enableBusiness: true,
            enableErrors: true,
            batchSize: 10,
            flushInterval: 30000, // 30초
            maxStorageSize: 5 * 1024 * 1024, // 5MB
            retentionDays: 30
        };

        this.events = [];
        this.session = this.generateSessionId();
        this.userId = this.getUserId();
        
        this.metrics = {
            user: new Map(),
            session: new Map(),
            business: new Map(),
            performance: new Map(),
            errors: new Map()
        };

        this.flushTimer = null;
        this.startTime = Date.now();
        this.pageViews = 0;
        this.interactions = 0;

        this.eventTypes = {
            // 사용자 행동
            PAGE_VIEW: 'page_view',
            CLICK: 'click',
            SCROLL: 'scroll',
            INPUT: 'input',
            NAVIGATION: 'navigation',
            
            // 진단 관련
            DIAGNOSIS_START: 'diagnosis_start',
            DIAGNOSIS_COMPLETE: 'diagnosis_complete',
            DIAGNOSIS_ERROR: 'diagnosis_error',
            MODE_CHANGE: 'mode_change',
            
            // 비즈니스 지표
            CUSTOMER_ADD: 'customer_add',
            REPORT_GENERATE: 'report_generate',
            RECOMMENDATION_VIEW: 'recommendation_view',
            EXPORT_DATA: 'export_data',
            
            // 기술적 지표
            PERFORMANCE: 'performance',
            ERROR: 'error',
            FEATURE_USE: 'feature_use',
            API_CALL: 'api_call'
        };

        this.init();
    }

    /**
     * 시스템 초기화
     */
    async init() {
        this.setupEventListeners();
        this.loadStoredData();
        this.startDataCollection();
        this.scheduleFlush();
        
        // 세션 시작 이벤트
        this.track(this.eventTypes.PAGE_VIEW, {
            page: window.location.pathname,
            title: document.title,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            deviceInfo: this.getDeviceInfo()
        });

        console.log('AnalyticsSystem initialized');
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 페이지 이벤트
        window.addEventListener('beforeunload', () => {
            this.trackSessionEnd();
            this.flush(true); // 동기 플러시
        });

        window.addEventListener('visibilitychange', () => {
            this.track('visibility_change', {
                hidden: document.hidden,
                visibilityState: document.visibilityState
            });
        });

        // 사용자 상호작용 추적
        document.addEventListener('click', this.throttle((e) => {
            this.trackClick(e);
        }, 100));

        // 스크롤 추적
        window.addEventListener('scroll', this.throttle(() => {
            this.trackScroll();
        }, 1000));

        // 폼 상호작용
        document.addEventListener('input', this.debounce((e) => {
            if (e.target.matches('input, textarea, select')) {
                this.trackInput(e);
            }
        }, 500));

        // 오류 추적
        window.addEventListener('error', (e) => {
            this.trackError(e.error, 'javascript_error');
        });

        window.addEventListener('unhandledrejection', (e) => {
            this.trackError(e.reason, 'unhandled_promise_rejection');
        });

        // 커스텀 이벤트 리스너
        document.addEventListener('diagnosis_start', (e) => {
            this.trackDiagnosisStart(e.detail);
        });

        document.addEventListener('diagnosis_complete', (e) => {
            this.trackDiagnosisComplete(e.detail);
        });

        document.addEventListener('mode_change', (e) => {
            this.trackModeChange(e.detail);
        });
    }

    /**
     * 이벤트 추적
     * @param {string} eventType - 이벤트 타입
     * @param {Object} data - 이벤트 데이터
     * @param {Object} options - 추가 옵션
     */
    track(eventType, data = {}, options = {}) {
        if (!this.config.enableTracking) return;

        const event = {
            id: this.generateEventId(),
            type: eventType,
            timestamp: Date.now(),
            sessionId: this.session,
            userId: this.userId,
            data: this.sanitizeData(data),
            metadata: {
                url: window.location.href,
                userAgent: navigator.userAgent,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                language: navigator.language,
                ...options
            }
        };

        this.events.push(event);
        this.updateMetrics(event);

        // 배치 크기에 도달하면 즉시 플러시
        if (this.events.length >= this.config.batchSize) {
            this.flush();
        }

        console.debug('Event tracked:', eventType, data);
    }

    /**
     * 클릭 이벤트 추적
     * @param {MouseEvent} event - 마우스 이벤트
     */
    trackClick(event) {
        const element = event.target;
        const data = {
            elementType: element.tagName.toLowerCase(),
            elementId: element.id,
            elementClass: element.className,
            elementText: element.textContent?.substring(0, 100),
            position: {
                x: event.clientX,
                y: event.clientY
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };

        // 특별한 요소들 추가 추적
        if (element.matches('[data-track]')) {
            data.trackingData = element.dataset.track;
        }

        if (element.matches('button, a, [role="button"]')) {
            data.actionType = 'button_click';
        }

        this.track(this.eventTypes.CLICK, data);
        this.interactions++;
    }

    /**
     * 스크롤 이벤트 추적
     */
    trackScroll() {
        const scrollPercent = Math.round(
            (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        );

        this.track(this.eventTypes.SCROLL, {
            scrollPercent: Math.min(100, Math.max(0, scrollPercent)),
            scrollY: window.scrollY,
            documentHeight: document.body.scrollHeight,
            viewportHeight: window.innerHeight
        });
    }

    /**
     * 입력 이벤트 추적
     * @param {InputEvent} event - 입력 이벤트
     */
    trackInput(event) {
        const element = event.target;
        
        // 민감한 데이터 제외
        if (element.type === 'password' || 
            element.name?.includes('password') ||
            element.name?.includes('email')) {
            return;
        }

        this.track(this.eventTypes.INPUT, {
            inputType: element.type,
            inputName: element.name,
            inputId: element.id,
            inputLength: element.value?.length || 0,
            formId: element.closest('form')?.id
        });
    }

    /**
     * 진단 시작 추적
     * @param {Object} diagnosisData - 진단 데이터
     */
    trackDiagnosisStart(diagnosisData) {
        this.track(this.eventTypes.DIAGNOSIS_START, {
            mode: diagnosisData.mode,
            customerId: diagnosisData.customerId,
            customerType: diagnosisData.customerType,
            estimatedTime: diagnosisData.estimatedTime,
            deviceCapabilities: this.getDeviceCapabilities(),
            environmentFactors: diagnosisData.environmentFactors
        });

        // 비즈니스 메트릭 업데이트
        this.updateBusinessMetrics('diagnosis_started');
    }

    /**
     * 진단 완료 추적
     * @param {Object} result - 진단 결과
     */
    trackDiagnosisComplete(result) {
        const completionTime = Date.now();
        const startEvent = this.findLastEvent(this.eventTypes.DIAGNOSIS_START);
        const duration = startEvent ? completionTime - startEvent.timestamp : null;

        this.track(this.eventTypes.DIAGNOSIS_COMPLETE, {
            mode: result.mode,
            season: result.season,
            confidence: result.confidence,
            duration: duration,
            success: result.success,
            accuracy: result.accuracy,
            customerId: result.customerId,
            recommendations: {
                makeup: result.makeup?.length || 0,
                fashion: result.fashion?.length || 0,
                hair: result.hair?.length || 0
            }
        });

        // 성능 메트릭
        if (duration) {
            this.trackPerformance('diagnosis_duration', duration, {
                mode: result.mode,
                success: result.success
            });
        }

        // 비즈니스 메트릭
        this.updateBusinessMetrics('diagnosis_completed', result);
    }

    /**
     * 모드 변경 추적
     * @param {Object} modeData - 모드 변경 데이터
     */
    trackModeChange(modeData) {
        this.track(this.eventTypes.MODE_CHANGE, {
            fromMode: modeData.fromMode,
            toMode: modeData.toMode,
            reason: modeData.reason,
            automatic: modeData.automatic,
            compatibility: modeData.compatibility
        });
    }

    /**
     * 오류 추적
     * @param {Error|string} error - 오류 객체 또는 메시지
     * @param {string} type - 오류 타입
     */
    trackError(error, type = 'unknown') {
        const errorData = {
            type: type,
            message: error?.message || String(error),
            stack: error?.stack,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: Date.now()
        };

        // 스택 트레이스 정리 (개인정보 제거)
        if (errorData.stack) {
            errorData.stack = errorData.stack
                .split('\n')
                .slice(0, 10) // 상위 10줄만
                .map(line => line.replace(/https?:\/\/[^/]+/, ''))
                .join('\n');
        }

        this.track(this.eventTypes.ERROR, errorData);
        
        // 오류 메트릭 업데이트
        this.updateErrorMetrics(errorData);
    }

    /**
     * 성능 추적
     * @param {string} metricName - 메트릭 이름
     * @param {number} value - 값
     * @param {Object} context - 컨텍스트 정보
     */
    trackPerformance(metricName, value, context = {}) {
        if (!this.config.enablePerformance) return;

        this.track(this.eventTypes.PERFORMANCE, {
            metric: metricName,
            value: value,
            context: context,
            memory: this.getMemoryInfo(),
            connection: this.getConnectionInfo()
        });

        // 성능 메트릭 업데이트
        this.updatePerformanceMetrics(metricName, value);
    }

    /**
     * 기능 사용 추적
     * @param {string} feature - 기능 이름
     * @param {Object} context - 사용 컨텍스트
     */
    trackFeatureUse(feature, context = {}) {
        this.track(this.eventTypes.FEATURE_USE, {
            feature: feature,
            context: context,
            sessionTime: Date.now() - this.startTime,
            previousInteractions: this.interactions
        });
    }

    /**
     * 고객 추가 추적
     * @param {Object} customerData - 고객 데이터
     */
    trackCustomerAdd(customerData) {
        this.track(this.eventTypes.CUSTOMER_ADD, {
            customerType: customerData.type,
            source: customerData.source,
            hasPhoto: Boolean(customerData.photo),
            ageGroup: this.getAgeGroup(customerData.age)
        });

        this.updateBusinessMetrics('customer_added');
    }

    /**
     * 보고서 생성 추적
     * @param {Object} reportData - 보고서 데이터
     */
    trackReportGeneration(reportData) {
        this.track(this.eventTypes.REPORT_GENERATE, {
            format: reportData.format,
            sections: reportData.sections,
            pageCount: reportData.pageCount,
            generationTime: reportData.generationTime,
            customizations: reportData.customizations
        });

        this.updateBusinessMetrics('report_generated');
    }

    /**
     * 데이터 플러시 (서버 전송)
     * @param {boolean} sync - 동기 전송 여부
     */
    async flush(sync = false) {
        if (this.events.length === 0) return;

        const eventsToSend = [...this.events];
        this.events = [];

        try {
            const payload = {
                events: eventsToSend,
                session: {
                    id: this.session,
                    userId: this.userId,
                    startTime: this.startTime,
                    duration: Date.now() - this.startTime,
                    pageViews: this.pageViews,
                    interactions: this.interactions
                },
                metadata: this.getSessionMetadata()
            };

            if (sync) {
                // 동기 전송 (페이지 종료 시)
                navigator.sendBeacon('/api/analytics', JSON.stringify(payload));
            } else {
                // 비동기 전송
                await this.sendAnalyticsData(payload);
            }

            console.log(`Analytics flushed: ${eventsToSend.length} events`);

        } catch (error) {
            // 전송 실패 시 이벤트 복원
            this.events.unshift(...eventsToSend);
            console.error('Analytics flush failed:', error);
        }
    }

    /**
     * 분석 데이터 전송
     * @param {Object} payload - 전송할 데이터
     */
    async sendAnalyticsData(payload) {
        const response = await fetch('/api/analytics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Analytics send failed: ${response.statusText}`);
        }
    }

    /**
     * 사용자 ID 생성/조회
     * @returns {string} 사용자 ID
     */
    getUserId() {
        let userId = localStorage.getItem('analytics_user_id');
        
        if (!userId) {
            userId = 'user_' + this.generateId();
            localStorage.setItem('analytics_user_id', userId);
        }
        
        return userId;
    }

    /**
     * 세션 ID 생성
     * @returns {string} 세션 ID
     */
    generateSessionId() {
        return 'session_' + this.generateId() + '_' + Date.now();
    }

    /**
     * 이벤트 ID 생성
     * @returns {string} 이벤트 ID
     */
    generateEventId() {
        return 'event_' + this.generateId();
    }

    /**
     * 랜덤 ID 생성
     * @returns {string} 랜덤 ID
     */
    generateId() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }

    /**
     * 디바이스 정보 수집
     * @returns {Object} 디바이스 정보
     */
    getDeviceInfo() {
        return {
            platform: navigator.platform,
            userAgent: navigator.userAgent,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            touchSupport: 'ontouchstart' in window
        };
    }

    /**
     * 디바이스 성능 정보
     * @returns {Object} 성능 정보
     */
    getDeviceCapabilities() {
        return {
            memory: navigator.deviceMemory || null,
            cores: navigator.hardwareConcurrency || null,
            connection: this.getConnectionInfo(),
            webgl: this.checkWebGLSupport(),
            webworkers: typeof Worker !== 'undefined',
            serviceWorkers: 'serviceWorker' in navigator,
            mediaDevices: 'mediaDevices' in navigator
        };
    }

    /**
     * 메모리 정보 수집
     * @returns {Object} 메모리 정보
     */
    getMemoryInfo() {
        if (performance.memory) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    }

    /**
     * 네트워크 연결 정보
     * @returns {Object} 연결 정보
     */
    getConnectionInfo() {
        if (navigator.connection) {
            return {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt,
                saveData: navigator.connection.saveData
            };
        }
        return null;
    }

    /**
     * WebGL 지원 확인
     * @returns {boolean} WebGL 지원 여부
     */
    checkWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch {
            return false;
        }
    }

    /**
     * 세션 메타데이터 생성
     * @returns {Object} 세션 메타데이터
     */
    getSessionMetadata() {
        return {
            version: '1.0.0', // 앱 버전
            build: 'production',
            features: this.getEnabledFeatures(),
            performance: this.getPerformanceSummary(),
            errors: this.getErrorSummary()
        };
    }

    /**
     * 활성화된 기능 목록
     * @returns {Array} 기능 목록
     */
    getEnabledFeatures() {
        const features = [];
        
        if (window.skinToneAnalyzer) features.push('ai_analysis');
        if (window.virtualDraping) features.push('virtual_draping');
        if (window.reportGenerator) features.push('pdf_reports');
        if ('serviceWorker' in navigator) features.push('offline_support');
        
        return features;
    }

    /**
     * 성능 요약
     * @returns {Object} 성능 요약
     */
    getPerformanceSummary() {
        const performanceEntries = Array.from(this.metrics.performance.values());
        
        if (performanceEntries.length === 0) return null;

        const durations = performanceEntries.map(entry => entry.value);
        
        return {
            count: durations.length,
            avg: durations.reduce((a, b) => a + b, 0) / durations.length,
            min: Math.min(...durations),
            max: Math.max(...durations)
        };
    }

    /**
     * 오류 요약
     * @returns {Object} 오류 요약
     */
    getErrorSummary() {
        const errorEntries = Array.from(this.metrics.errors.values());
        
        return {
            count: errorEntries.length,
            types: [...new Set(errorEntries.map(e => e.type))]
        };
    }

    /**
     * 메트릭 업데이트
     * @param {Object} event - 이벤트 객체
     */
    updateMetrics(event) {
        const category = this.getCategoryFromEventType(event.type);
        const metrics = this.metrics[category];
        
        if (metrics) {
            metrics.set(event.id, {
                timestamp: event.timestamp,
                type: event.type,
                data: event.data
            });
        }
    }

    /**
     * 비즈니스 메트릭 업데이트
     * @param {string} metric - 메트릭 이름
     * @param {*} data - 추가 데이터
     */
    updateBusinessMetrics(metric, data = {}) {
        const existing = this.metrics.business.get(metric) || { count: 0, data: [] };
        existing.count++;
        existing.data.push({ timestamp: Date.now(), ...data });
        this.metrics.business.set(metric, existing);
    }

    /**
     * 성능 메트릭 업데이트
     * @param {string} metric - 메트릭 이름
     * @param {number} value - 값
     */
    updatePerformanceMetrics(metric, value) {
        const existing = this.metrics.performance.get(metric) || { values: [], count: 0 };
        existing.values.push(value);
        existing.count++;
        
        // 최근 100개 값만 유지
        if (existing.values.length > 100) {
            existing.values.shift();
        }
        
        this.metrics.performance.set(metric, existing);
    }

    /**
     * 오류 메트릭 업데이트
     * @param {Object} errorData - 오류 데이터
     */
    updateErrorMetrics(errorData) {
        const key = `${errorData.type}_${errorData.message}`;
        const existing = this.metrics.errors.get(key) || { count: 0, lastOccurred: null };
        existing.count++;
        existing.lastOccurred = Date.now();
        this.metrics.errors.set(key, existing);
    }

    /**
     * 데이터 정제 (개인정보 제거)
     * @param {Object} data - 원본 데이터
     * @returns {Object} 정제된 데이터
     */
    sanitizeData(data) {
        const sanitized = { ...data };
        
        // 민감한 필드 제거
        const sensitiveFields = ['password', 'email', 'phone', 'ssn', 'creditcard'];
        
        const sanitizeObject = (obj) => {
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const lowerKey = key.toLowerCase();
                    
                    if (sensitiveFields.some(field => lowerKey.includes(field))) {
                        obj[key] = '[REDACTED]';
                    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                        sanitizeObject(obj[key]);
                    }
                }
            }
        };
        
        sanitizeObject(sanitized);
        return sanitized;
    }

    /**
     * 세션 종료 추적
     */
    trackSessionEnd() {
        this.track('session_end', {
            duration: Date.now() - this.startTime,
            pageViews: this.pageViews,
            interactions: this.interactions,
            completedDiagnoses: this.metrics.business.get('diagnosis_completed')?.count || 0
        });
    }

    /**
     * 분석 리포트 생성
     * @param {string} period - 기간 ('day', 'week', 'month')
     * @returns {Object} 분석 리포트
     */
    generateAnalyticsReport(period = 'day') {
        const now = Date.now();
        const periodMs = {
            day: 24 * 60 * 60 * 1000,
            week: 7 * 24 * 60 * 60 * 1000,
            month: 30 * 24 * 60 * 60 * 1000
        };

        const startTime = now - periodMs[period];
        
        // 저장된 이벤트에서 기간별 데이터 필터링
        const storedEvents = this.getStoredEvents();
        const periodEvents = storedEvents.filter(event => 
            event.timestamp >= startTime && event.timestamp <= now
        );

        return {
            period: period,
            startTime: startTime,
            endTime: now,
            summary: {
                totalEvents: periodEvents.length,
                uniqueUsers: new Set(periodEvents.map(e => e.userId)).size,
                totalSessions: new Set(periodEvents.map(e => e.sessionId)).size,
                avgSessionDuration: this.calculateAvgSessionDuration(periodEvents)
            },
            events: this.groupEventsByType(periodEvents),
            performance: this.analyzePerformance(periodEvents),
            errors: this.analyzeErrors(periodEvents),
            business: this.analyzeBusinessMetrics(periodEvents)
        };
    }

    /**
     * 유틸리티 메서드들
     */
    getCategoryFromEventType(eventType) {
        const categories = {
            [this.eventTypes.PERFORMANCE]: 'performance',
            [this.eventTypes.ERROR]: 'errors',
            [this.eventTypes.DIAGNOSIS_START]: 'business',
            [this.eventTypes.DIAGNOSIS_COMPLETE]: 'business',
            [this.eventTypes.CUSTOMER_ADD]: 'business',
            [this.eventTypes.REPORT_GENERATE]: 'business'
        };
        
        return categories[eventType] || 'user';
    }

    findLastEvent(eventType) {
        for (let i = this.events.length - 1; i >= 0; i--) {
            if (this.events[i].type === eventType) {
                return this.events[i];
            }
        }
        return null;
    }

    getAgeGroup(age) {
        if (age < 20) return 'teen';
        if (age < 30) return '20s';
        if (age < 40) return '30s';
        if (age < 50) return '40s';
        if (age < 60) return '50s';
        return '60plus';
    }

    scheduleFlush() {
        this.flushTimer = setInterval(() => {
            this.flush();
        }, this.config.flushInterval);
    }

    loadStoredData() {
        try {
            const stored = localStorage.getItem('analytics_data');
            if (stored) {
                const data = JSON.parse(stored);
                // 만료되지 않은 데이터만 로드
                const cutoff = Date.now() - (this.config.retentionDays * 24 * 60 * 60 * 1000);
                this.events = data.events?.filter(e => e.timestamp > cutoff) || [];
            }
        } catch (error) {
            console.warn('Failed to load stored analytics data:', error);
        }
    }

    saveDataToStorage() {
        try {
            const data = {
                events: this.events,
                metrics: Object.fromEntries(
                    Object.entries(this.metrics).map(([key, map]) => [key, Object.fromEntries(map)])
                ),
                timestamp: Date.now()
            };
            
            const serialized = JSON.stringify(data);
            if (serialized.length < this.config.maxStorageSize) {
                localStorage.setItem('analytics_data', serialized);
            }
        } catch (error) {
            console.warn('Failed to save analytics data to storage:', error);
        }
    }

    startDataCollection() {
        // 주기적으로 데이터 저장
        setInterval(() => {
            this.saveDataToStorage();
        }, 60000); // 1분마다
    }

    // 디바운스와 스로틀 유틸리티
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

    // 분석 메서드들 (생략된 부분들)
    getStoredEvents() {
        return this.events;
    }

    groupEventsByType(events) {
        return events.reduce((groups, event) => {
            groups[event.type] = (groups[event.type] || 0) + 1;
            return groups;
        }, {});
    }

    calculateAvgSessionDuration(events) {
        // 세션 지속 시간 계산 로직
        return 0;
    }

    analyzePerformance(events) {
        // 성능 분석 로직
        return {};
    }

    analyzeErrors(events) {
        // 오류 분석 로직
        return {};
    }

    analyzeBusinessMetrics(events) {
        // 비즈니스 메트릭 분석 로직
        return {};
    }
}

// 전역 인스턴스 생성
const analyticsSystem = new AnalyticsSystem();

// 편의 함수들
const track = (eventType, data, options) => analyticsSystem.track(eventType, data, options);
const trackError = (error, type) => analyticsSystem.trackError(error, type);
const trackPerformance = (metric, value, context) => analyticsSystem.trackPerformance(metric, value, context);
const trackFeature = (feature, context) => analyticsSystem.trackFeatureUse(feature, context);
const getAnalyticsReport = (period) => analyticsSystem.generateAnalyticsReport(period);

// 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AnalyticsSystem,
        track,
        trackError,
        trackPerformance,
        trackFeature,
        getAnalyticsReport
    };
} else if (typeof window !== 'undefined') {
    window.AnalyticsSystem = AnalyticsSystem;
    window.analyticsSystem = analyticsSystem;
    window.track = track;
    window.trackError = trackError;
    window.trackPerformance = trackPerformance;
    window.trackFeature = trackFeature;
    window.getAnalyticsReport = getAnalyticsReport;
}
