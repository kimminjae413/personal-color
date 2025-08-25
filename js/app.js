/**
 * app.js - Personal Color Pro 메인 애플리케이션 컨트롤러 (완전 수정 버전)
 * 
 * 헤어디자이너용 퍼스널컬러 진단 태블릿 웹앱
 * 완전한 PWA 지원, AI 분석, 드레이핑 모드, 보고서 생성
 * 
 * 수정사항:
 * - initializeCoreSystem() 메서드명 수정
 * - process 참조 완전 제거
 * - 전역 객체 안전 접근
 * - 브라우저 호환성 개선
 */

class PersonalColorApp {
    constructor() {
        this.config = null;
        this.isInitialized = false;
        this.currentCustomer = null;
        this.currentDiagnosis = null;
        this.loadingProgress = 0;
        this.startTime = Date.now();
        
        this.components = {
            photoAnalysis: null,
            drapingMode: null,
            reportGenerator: null,
            customerManager: null,
            colorPalette: null,
            diagnosisMode: null
        };

        this.systems = {
            colorSystem: null,
            skinToneAnalyzer: null,
            validationSystem: null,
            performanceOptimizer: null,
            analyticsSystem: null
        };

        this.state = {
            currentMode: 'selection', // selection, ai_photo, draping, hybrid, results
            isProcessing: false,
            hasActiveCamera: false,
            lastInteraction: Date.now()
        };

        this.eventListeners = new Map();
        
        // 로딩 단계 정의
        this.loadingSteps = [
            'AI 모델 로딩',
            '색상 데이터베이스 초기화',
            'UI 컴포넌트 로딩',
            '진단 시스템 준비',
            '마무리 중...'
        ];
        this.currentLoadingStep = 0;

        // 환경 정보 (process 대신)
        this.environment = this.detectEnvironment();

        // 초기화 시작
        this.init();
    }

    /**
     * 환경 감지 (process.env 완전 대체)
     */
    detectEnvironment() {
        try {
            const hostname = window.location.hostname;
            const protocol = window.location.protocol;
            
            // 개발 환경 감지
            if (hostname === 'localhost' || 
                hostname === '127.0.0.1' || 
                hostname.startsWith('192.168.') ||
                protocol === 'file:') {
                return {
                    name: 'development',
                    isDev: true,
                    isStaging: false,
                    isProd: false
                };
            }
            
            // 스테이징 환경 감지
            if (hostname.includes('staging') || 
                hostname.includes('test') || 
                hostname.includes('dev')) {
                return {
                    name: 'staging',
                    isDev: false,
                    isStaging: true,
                    isProd: false
                };
            }
            
            // 프로덕션 환경 (기본값)
            return {
                name: 'production',
                isDev: false,
                isStaging: false,
                isProd: true
            };
        } catch (error) {
            console.warn('환경 감지 실패, 기본값 사용:', error);
            return {
                name: 'production',
                isDev: false,
                isStaging: false,
                isProd: true
            };
        }
    }

    /**
     * 애플리케이션 초기화
     */
    async init() {
        try {
            console.log('🎨 Personal Color Pro 시작...');
            console.log('🌍 현재 환경:', this.environment.name);
            
            // DOM이 준비될 때까지 대기
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.startInitialization());
            } else {
                await this.startInitialization();
            }
        } catch (error) {
            console.error('❌ 애플리케이션 초기화 실패:', error);
            this.showError('시스템 초기화에 실패했습니다. 페이지를 새로고침해주세요.');
        }
    }

    /**
     * 초기화 프로세스 시작
     */
    async startInitialization() {
        try {
            // 1. 기본 설정 로드
            await this.loadConfiguration();
            this.updateLoadingProgress(20, 'AI 모델 로딩');

            // 2. 핵심 시스템 초기화 (메서드명 수정됨)
            await this.initializeCoreSystem();
            this.updateLoadingProgress(40, '색상 데이터베이스 초기화');

            // 3. UI 컴포넌트 초기화
            await this.initializeComponents();
            this.updateLoadingProgress(60, 'UI 컴포넌트 로딩');

            // 4. 데이터 로드
            await this.loadInitialData();
            this.updateLoadingProgress(80, '진단 시스템 준비');

            // 5. 이벤트 리스너 설정
            this.setupEventListeners();
            this.updateLoadingProgress(100, '완료');

            // 6. 초기화 완료
            this.completeInitialization();

        } catch (error) {
            console.error('❌ 초기화 프로세스 실패:', error);
            this.showError(`시스템 초기화 중 오류가 발생했습니다: ${error.message}`);
        }
    }

    /**
     * 설정 로드 (process 완전 제거)
     */
    async loadConfiguration() {
        try {            
            // 기본 설정값 사용
            this.config = {
                version: '1.0.0',
                environment: this.environment.name,
                features: {
                    aiAnalysis: true,
                    virtualDraping: true,
                    pdfReports: true,
                    offlineMode: true,
                    analytics: this.environment.isProd // 프로덕션에서만 분석 활성화
                },
                performance: {
                    enableOptimization: true,
                    cacheSize: this.environment.isDev ? 50 : 100,
                    workerThreads: Math.min(navigator.hardwareConcurrency || 4, 8)
                },
                ui: {
                    theme: 'professional',
                    language: 'ko',
                    animations: !window.matchMedia('(prefers-reduced-motion: reduce)').matches
                },
                diagnosis: {
                    confidenceThreshold: this.environment.isDev ? 75 : 85,
                    maxRetries: 3,
                    timeoutMs: 30000
                },
                debug: {
                    enabled: this.environment.isDev,
                    verbose: this.environment.isDev,
                    showPerformance: this.environment.isDev
                }
            };

            // 저장된 사용자 설정 로드
            try {
                const savedConfig = localStorage.getItem('app_config');
                if (savedConfig) {
                    const userConfig = JSON.parse(savedConfig);
                    this.config = { ...this.config, ...userConfig };
                }
            } catch (error) {
                console.warn('저장된 설정을 불러올 수 없습니다:', error);
            }

            // 브라우저 호환성 체크
            this.checkBrowserCompatibility();

            console.log('📋 설정 파일 로드 완료');
            
            // 디버그 모드에서 설정 출력
            if (this.config.debug.enabled) {
                console.log('🔧 설정 정보:', this.config);
            }

        } catch (error) {
            console.error('❌ 설정 로드 실패:', error);
            throw error;
        }
    }

    /**
     * 브라우저 호환성 체크
     */
    checkBrowserCompatibility() {
        const requiredFeatures = [
            'Promise',
            'fetch',
            'localStorage',
            'addEventListener'
        ];

        const missingFeatures = requiredFeatures.filter(feature => 
            typeof window[feature] === 'undefined'
        );

        if (missingFeatures.length > 0) {
            console.warn('❌ 지원되지 않는 기능들:', missingFeatures);
            this.showError('브라우저가 이 앱을 완전히 지원하지 않습니다. 최신 브라우저를 사용해주세요.');
        }

        // 추가 호환성 체크
        const checks = {
            webgl: !!window.WebGLRenderingContext,
            webrtc: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
            workers: !!window.Worker,
            indexedDB: !!window.indexedDB
        };

        console.log('🔍 브라우저 기능 지원:', checks);
    }

    /**
     * 핵심 시스템 초기화 (안전한 전역 객체 접근)
     */
    async initializeCoreSystem() {
        try {
            // 색상 시스템 초기화 (안전 접근)
            if (this.safeGlobalAccess('ColorSystem')) {
                try {
                    this.systems.colorSystem = new window.ColorSystem();
                    await this.systems.colorSystem.initialize();
                    console.log('✅ ColorSystem 초기화 완료');
                } catch (error) {
                    console.warn('⚠️ ColorSystem 초기화 실패:', error);
                }
            } else {
                console.warn('⚠️ ColorSystem 클래스를 찾을 수 없습니다');
            }

            // 피부톤 분석기 초기화 (안전 접근)
            if (this.safeGlobalAccess('SkinToneAnalyzer')) {
                try {
                    this.systems.skinToneAnalyzer = new window.SkinToneAnalyzer();
                    await this.systems.skinToneAnalyzer.initialize();
                    console.log('✅ SkinToneAnalyzer 초기화 완료');
                } catch (error) {
                    console.warn('⚠️ SkinToneAnalyzer 초기화 실패:', error);
                }
            } else {
                console.warn('⚠️ SkinToneAnalyzer 클래스를 찾을 수 없습니다');
            }

            // 검증 시스템 초기화
            if (this.safeGlobalAccess('ValidationSystem') || this.safeGlobalAccess('validationSystem')) {
                this.systems.validationSystem = window.validationSystem || new window.ValidationSystem();
                console.log('✅ ValidationSystem 초기화 완료');
            }

            // 성능 최적화 시스템
            if (this.safeGlobalAccess('PerformanceOptimizer') || this.safeGlobalAccess('performanceOptimizer')) {
                this.systems.performanceOptimizer = window.performanceOptimizer || new window.PerformanceOptimizer();
                console.log('✅ PerformanceOptimizer 초기화 완료');
            }

            // 분석 시스템 (프로덕션에서만)
            if (this.config.features.analytics && 
                (this.safeGlobalAccess('AnalyticsSystem') || this.safeGlobalAccess('analyticsSystem'))) {
                this.systems.analyticsSystem = window.analyticsSystem || new window.AnalyticsSystem();
                console.log('✅ AnalyticsSystem 초기화 완료');
            }

            console.log('✅ 핵심 시스템 초기화 완료');

        } catch (error) {
            console.error('❌ 핵심 시스템 초기화 실패:', error);
            // 핵심 시스템 실패해도 앱은 계속 실행 가능하도록
            console.warn('⚠️ 일부 기능이 제한될 수 있습니다');
        }
    }

    /**
     * 안전한 전역 객체 접근
     */
    safeGlobalAccess(objectName) {
        try {
            return typeof window[objectName] !== 'undefined' && window[objectName] !== null;
        } catch (error) {
            return false;
        }
    }

    /**
     * UI 컴포넌트 초기화 (안전 접근)
     */
    async initializeComponents() {
        try {
            const componentMappings = {
                'PhotoAnalysis': 'photoAnalysis',
                'DrapingMode': 'drapingMode',
                'ReportGenerator': 'reportGenerator',
                'CustomerManager': 'customerManager',
                'ColorPalette': 'colorPalette',
                'DiagnosisMode': 'diagnosisMode'
            };

            for (const [globalName, localName] of Object.entries(componentMappings)) {
                if (this.safeGlobalAccess(globalName)) {
                    try {
                        this.components[localName] = new window[globalName]();
                        console.log(`✅ ${globalName} 컴포넌트 초기화 완료`);
                    } catch (error) {
                        console.warn(`⚠️ ${globalName} 컴포넌트 초기화 실패:`, error);
                    }
                } else if (this.safeGlobalAccess(localName)) {
                    // 소문자 버전도 체크 (diagnosisMode 등)
                    this.components[localName] = window[localName];
                    console.log(`✅ ${localName} 인스턴스 발견됨`);
                } else {
                    console.warn(`⚠️ ${globalName} 컴포넌트를 찾을 수 없습니다`);
                }
            }

            console.log('✅ UI 컴포넌트 초기화 완료');

        } catch (error) {
            console.error('❌ UI 컴포넌트 초기화 실패:', error);
            // 컴포넌트 실패해도 앱은 계속 실행
        }
    }

    /**
     * 초기 데이터 로드 (안전 접근)
     */
    async loadInitialData() {
        try {
            // 데이터 객체들 확인
            const dataObjects = {
                'seasons': '계절 데이터',
                'koreanSkinTones': '한국인 피부톤 데이터',
                'hairColorCharts': '헤어컬러 차트',
                'makeupBrands': '메이크업 브랜드 데이터',
                'fashionGuide': '패션 가이드 데이터',
                'colorPalettes': '색상 팔레트'
            };

            for (const [objectName, description] of Object.entries(dataObjects)) {
                if (this.safeGlobalAccess(objectName)) {
                    console.log(`✅ ${description} 로드됨`);
                } else {
                    console.warn(`⚠️ ${description}를 로드할 수 없습니다`);
                }
            }

            // 필수 데이터가 없는 경우 기본값 생성
            this.ensureEssentialData();

            console.log('✅ 초기 데이터 로드 완료');

        } catch (error) {
            console.error('❌ 초기 데이터 로드 실패:', error);
            // 데이터 로드 실패해도 앱은 계속 실행 가능
        }
    }

    /**
     * 필수 데이터 확보
     */
    ensureEssentialData() {
        // 기본 계절 데이터 제공
        if (!this.safeGlobalAccess('seasons')) {
            window.seasons = {
                spring: { name: '봄 웜톤', undertone: 'warm', lightness: 'light' },
                summer: { name: '여름 쿨톤', undertone: 'cool', lightness: 'light' },
                autumn: { name: '가을 웜톤', undertone: 'warm', lightness: 'dark' },
                winter: { name: '겨울 쿨톤', undertone: 'cool', lightness: 'dark' }
            };
            console.log('📝 기본 계절 데이터 생성됨');
        }

        // 기본 한국인 피부톤 데이터
        if (!this.safeGlobalAccess('koreanSkinTones')) {
            window.koreanSkinTones = {
                light: { range: [20, 35], description: '밝은 피부' },
                medium: { range: [35, 50], description: '중간 피부' },
                dark: { range: [50, 65], description: '어두운 피부' }
            };
            console.log('📝 기본 피부톤 데이터 생성됨');
        }
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        try {
            // DOM 이벤트들
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.handleDOMReady();
                });
            } else {
                this.handleDOMReady();
            }

            // 앱 레벨 커스텀 이벤트들
            this.addEventListener('customer-selected', (e) => {
                this.handleCustomerSelection(e.detail);
            });

            this.addEventListener('diagnosis-complete', (e) => {
                this.handleDiagnosisComplete(e.detail);
            });

            this.addEventListener('report-request', (e) => {
                this.handleReportRequest(e.detail);
            });

            this.addEventListener('mode-change', (e) => {
                this.handleModeChange(e.detail);
            });

            // 전역 에러 처리
            window.addEventListener('error', (e) => {
                this.handleGlobalError(e);
            });

            window.addEventListener('unhandledrejection', (e) => {
                this.handleGlobalError({ error: e.reason });
            });

            // 가시성 변화 (앱이 백그라운드로 갈 때)
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.handleAppBackground();
                } else {
                    this.handleAppForeground();
                }
            });

            // 네트워크 상태 변화
            if ('onLine' in navigator) {
                window.addEventListener('online', () => {
                    this.handleNetworkOnline();
                });

                window.addEventListener('offline', () => {
                    this.handleNetworkOffline();
                });
            }

            console.log('✅ 이벤트 리스너 설정 완료');

        } catch (error) {
            console.error('❌ 이벤트 리스너 설정 실패:', error);
        }
    }

    /**
     * 이벤트 리스너 추가 (메모리 누수 방지)
     */
    addEventListener(eventName, handler) {
        const wrappedHandler = (e) => {
            try {
                handler(e);
            } catch (error) {
                console.error(`이벤트 핸들러 오류 (${eventName}):`, error);
            }
        };

        document.addEventListener(eventName, wrappedHandler);
        
        // 정리를 위해 저장
        if (!this.eventListeners.has(eventName)) {
            this.eventListeners.set(eventName, []);
        }
        this.eventListeners.get(eventName).push(wrappedHandler);
    }

    /**
     * 로딩 진행률 업데이트
     */
    updateLoadingProgress(percentage, message) {
        this.loadingProgress = percentage;
        console.log(`📊 로딩 진행률: ${percentage}% - ${message}`);
        
        // 로딩 바 업데이트 (안전 접근)
        try {
            const progressBar = document.querySelector('.loading-progress');
            const progressMessage = document.querySelector('.loading-message');
            
            if (progressBar) {
                progressBar.style.width = `${percentage}%`;
                progressBar.setAttribute('aria-valuenow', percentage);
            }
            
            if (progressMessage) {
                progressMessage.textContent = message;
            }

            // 로딩 단계 업데이트
            if (percentage > this.currentLoadingStep * 20) {
                const stepElement = document.getElementById(`step-${this.currentLoadingStep + 1}`);
                if (stepElement) {
                    stepElement.textContent = `✅ ${message}`;
                }
                this.currentLoadingStep++;
            }
        } catch (error) {
            // 로딩 UI 업데이트 실패는 무시 (콘솔에만 표시)
            if (this.config?.debug?.enabled) {
                console.warn('로딩 UI 업데이트 실패:', error);
            }
        }
    }

    /**
     * 초기화 완료
     */
    completeInitialization() {
        this.isInitialized = true;
        
        // 로딩 화면 숨기기 (안전 접근)
        try {
            const loadingScreen = document.querySelector('.loading-screen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    document.body.classList.remove('loading');
                }, 500);
            }

            // 메인 앱 표시
            const mainApp = document.querySelector('.main-app');
            if (mainApp) {
                mainApp.style.display = 'block';
                mainApp.style.opacity = '0';
                setTimeout(() => {
                    mainApp.style.opacity = '1';
                }, 100);
            }
        } catch (error) {
            console.warn('UI 전환 실패:', error);
        }

        // 초기 UI 상태 설정
        this.initializeUIState();

        // 초기화 완료 이벤트 발생
        try {
            document.dispatchEvent(new CustomEvent('app-ready', {
                detail: {
                    version: this.config.version,
                    features: this.config.features,
                    timestamp: Date.now()
                }
            }));
        } catch (error) {
            console.warn('app-ready 이벤트 발생 실패:', error);
        }

        console.log('🎉 Personal Color Pro 초기화 완료!');
        
        // 분석 이벤트 전송 (안전 접근)
        if (this.systems.analyticsSystem && this.config.features.analytics) {
            try {
                this.systems.analyticsSystem.track('app_initialized', {
                    version: this.config.version,
                    environment: this.config.environment,
                    loadTime: Date.now() - this.startTime
                });
            } catch (error) {
                console.warn('분석 이벤트 전송 실패:', error);
            }
        }
    }

    /**
     * DOM 준비 완료 처리
     */
    handleDOMReady() {
        console.log('📄 DOM 로드 완료');
        
        // UI 초기 상태 설정
        this.initializeUIState();
        
        // 진단 모드 환경 체크 (안전 접근)
        if (this.components.diagnosisMode) {
            try {
                this.components.diagnosisMode.checkEnvironment();
            } catch (error) {
                console.warn('진단 모드 환경 체크 실패:', error);
            }
        }
    }

    /**
     * UI 초기 상태 설정
     */
    initializeUIState() {
        try {
            // 진단 모드 선택 버튼들
            const modeButtons = document.querySelectorAll('[data-mode]');
            modeButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const mode = e.currentTarget.dataset.mode;
                    this.switchToMode(mode);
                });
            });

            // 각종 버튼들 이벤트 바인딩
            const buttonMappings = {
                '#customer-management': () => this.openCustomerManagement(),
                '#settings-btn': () => this.openSettings(),
                '#generate-report': () => this.generateReport(),
                '#new-diagnosis': () => this.startNewDiagnosis(),
                '.close-sidebar': () => this.closeSidebar()
            };

            for (const [selector, handler] of Object.entries(buttonMappings)) {
                const element = document.querySelector(selector);
                if (element) {
                    element.addEventListener('click', handler);
                }
            }

            console.log('✅ UI 초기 상태 설정 완료');

        } catch (error) {
            console.error('❌ UI 초기 상태 설정 실패:', error);
        }
    }

    /**
     * 진단 모드로 전환
     */
    switchToMode(mode) {
        console.log(`🔄 모드 전환: ${this.state.currentMode} → ${mode}`);

        if (this.state.isProcessing) {
            this.showToast('진단이 진행 중입니다. 잠시만 기다려주세요.', 'warning');
            return;
        }

        try {
            // 이전 모드 정리
            this.cleanupCurrentMode();

            // 새 모드 설정
            this.state.currentMode = mode;
            this.updateModeUI(mode);
            this.initializeMode(mode);

            // 모드 변경 이벤트 발생
            document.dispatchEvent(new CustomEvent('mode-change', {
                detail: { mode: mode, timestamp: Date.now() }
            }));

            // 분석 추적 (안전 접근)
            if (this.systems.analyticsSystem && this.config.features.analytics) {
                try {
                    this.systems.analyticsSystem.track('mode_change', {
                        mode: mode,
                        timestamp: Date.now()
                    });
                } catch (error) {
                    console.warn('모드 변경 분석 실패:', error);
                }
            }
        } catch (error) {
            console.error('모드 전환 실패:', error);
            this.showError('모드 전환 중 오류가 발생했습니다.');
        }
    }

    /**
     * 모드별 UI 업데이트
     */
    updateModeUI(mode) {
        try {
            // 모드 선택 카드 업데이트
            document.querySelectorAll('.mode-card').forEach(card => {
                card.classList.toggle('selected', card.dataset.mode === mode);
            });

            // 진단 영역 표시/숨김
            const diagnosisArea = document.querySelector('.diagnosis-area');
            const modeSelection = document.querySelector('.diagnosis-mode-selection');
            
            if (mode === 'selection') {
                if (diagnosisArea) diagnosisArea.style.display = 'none';
                if (modeSelection) modeSelection.style.display = 'block';
            } else {
                if (modeSelection) modeSelection.style.display = 'none';
                if (diagnosisArea) diagnosisArea.style.display = 'block';
            }

            // 모드별 컨테이너 표시/숨김
            const aiContainer = document.querySelector('#ai-mode-container');
            const drapingContainer = document.querySelector('#draping-mode-container');
            
            if (aiContainer) {
                aiContainer.style.display = (mode === 'ai_photo' || mode === 'hybrid') ? 'block' : 'none';
            }
            
            if (drapingContainer) {
                drapingContainer.style.display = (mode === 'draping' || mode === 'hybrid') ? 'block' : 'none';
            }
        } catch (error) {
            console.warn('모드 UI 업데이트 실패:', error);
        }
    }

    /**
     * 모드별 초기화
     */
    async initializeMode(mode) {
        try {
            switch (mode) {
                case 'ai_photo':
                case 'hybrid':
                    if (this.components.photoAnalysis) {
                        await this.components.photoAnalysis.initialize();
                        this.setupCameraControls();
                    }
                    break;

                case 'draping':
                    if (this.components.drapingMode) {
                        await this.components.drapingMode.initialize();
                        this.setupDrapingControls();
                    }
                    break;
            }

            console.log(`✅ ${mode} 모드 초기화 완료`);

        } catch (error) {
            console.error(`❌ ${mode} 모드 초기화 실패:`, error);
            this.showError(`${mode} 모드를 초기화할 수 없습니다.`);
        }
    }

    /**
     * 카메라 컨트롤 설정
     */
    setupCameraControls() {
        try {
            const captureBtn = document.querySelector('#capture-btn');
            const uploadBtn = document.querySelector('#upload-btn');
            const fileInput = document.querySelector('#file-input');

            if (captureBtn) {
                captureBtn.addEventListener('click', () => {
                    this.capturePhoto();
                });
            }

            if (uploadBtn && fileInput) {
                uploadBtn.addEventListener('click', () => {
                    fileInput.click();
                });

                fileInput.addEventListener('change', (e) => {
                    if (e.target.files.length > 0) {
                        this.handleFileUpload(e.target.files[0]);
                    }
                });
            }
        } catch (error) {
            console.warn('카메라 컨트롤 설정 실패:', error);
        }
    }

    /**
     * 드레이핑 컨트롤 설정
     */
    setupDrapingControls() {
        try {
            const addComparisonBtn = document.querySelector('#add-comparison');
            const completeDrapingBtn = document.querySelector('#complete-draping');

            if (addComparisonBtn) {
                addComparisonBtn.addEventListener('click', () => {
                    this.addDrapingComparison();
                });
            }

            if (completeDrapingBtn) {
                completeDrapingBtn.addEventListener('click', () => {
                    this.completeDraping();
                });
            }

            // 색상 견본 클릭 이벤트
            document.querySelectorAll('.color-swatch').forEach(swatch => {
                swatch.addEventListener('click', (e) => {
                    const color = e.target.dataset.color;
                    this.selectDrapingColor(color);
                });
            });
        } catch (error) {
            console.warn('드레이핑 컨트롤 설정 실패:', error);
        }
    }

    /**
     * 사진 촬영
     */
    async capturePhoto() {
        if (this.state.isProcessing) return;

        try {
            this.state.isProcessing = true;
            this.showToast('사진을 촬영합니다...', 'info');

            if (this.components.photoAnalysis) {
                const result = await this.components.photoAnalysis.captureAndAnalyze();
                this.handleAnalysisResult(result);
            } else {
                throw new Error('사진 분석 컴포넌트가 사용할 수 없습니다.');
            }

        } catch (error) {
            console.error('❌ 사진 촬영 실패:', error);
            this.showError('사진 촬영에 실패했습니다: ' + error.message);
        } finally {
            this.state.isProcessing = false;
        }
    }

    /**
     * 파일 업로드 처리
     */
    async handleFileUpload(file) {
        if (this.state.isProcessing) return;

        try {
            this.state.isProcessing = true;
            this.showToast('이미지를 분석합니다...', 'info');

            // 파일 검증 (안전 접근)
            if (this.systems.validationSystem) {
                try {
                    const validation = this.systems.validationSystem.validate(
                        { file: file, size: file.size, type: file.type },
                        'image'
                    );

                    if (!validation.isValid) {
                        throw new Error(validation.errors[0].message);
                    }
                } catch (validationError) {
                    console.warn('파일 검증 실패:', validationError);
                    // 기본 검증으로 폴백
                    if (!file.type.startsWith('image/')) {
                        throw new Error('이미지 파일을 선택해주세요.');
                    }
                    if (file.size > 10 * 1024 * 1024) { // 10MB
                        throw new Error('파일 크기가 너무 큽니다. (최대 10MB)');
                    }
                }
            }

            if (this.components.photoAnalysis) {
                const result = await this.components.photoAnalysis.analyzeFile(file);
                this.handleAnalysisResult(result);
            } else {
                throw new Error('사진 분석 컴포넌트가 사용할 수 없습니다.');
            }

        } catch (error) {
            console.error('❌ 파일 업로드 처리 실패:', error);
            this.showError('이미지 분석에 실패했습니다: ' + error.message);
        } finally {
            this.state.isProcessing = false;
        }
    }

    /**
     * 분석 결과 처리
     */
    handleAnalysisResult(result) {
        console.log('✅ 분석 결과:', result);
        
        this.currentDiagnosis = result;
        this.showDiagnosisResult(result);
        
        // 보고서 생성 버튼 활성화
        const reportBtn = document.querySelector('#generate-report');
        if (reportBtn) {
            reportBtn.disabled = false;
            reportBtn.textContent = 'PDF 보고서 생성';
        }

        // 결과 영역 표시
        this.showResultsArea();
    }

    /**
     * 진단 결과 표시
     */
    showDiagnosisResult(result) {
        const resultContainer = document.querySelector('.diagnosis-result');
        if (!resultContainer) return;

        try {
            const seasonName = this.getSeasonDisplayName(result.season);
            const confidenceLevel = this.getConfidenceLevel(result.confidence);

            resultContainer.innerHTML = `
                <div class="result-container">
                    <h2>🎉 진단 결과</h2>
                    
                    <div class="result-summary">
                        <div class="season-badge ${result.season}">
                            <span class="season-name">${seasonName}</span>
                            <span class="confidence">${result.confidence}% ${confidenceLevel}</span>
                        </div>
                        
                        <div class="result-details">
                            <div class="detail-item">
                                <span class="label">언더톤:</span>
                                <span class="value">${result.undertone || '분석중'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">밝기:</span>
                                <span class="value">${result.lightness || '분석중'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">채도:</span>
                                <span class="value">${result.saturation || '중간'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="result-actions">
                        <button id="generate-report" class="primary-btn">
                            📊 PDF 보고서 생성
                        </button>
                        <button id="save-result" class="secondary-btn">
                            💾 결과 저장
                        </button>
                        <button id="new-diagnosis" class="secondary-btn">
                            🔄 새 진단
                        </button>
                    </div>
                </div>
            `;

            resultContainer.style.display = 'block';

            // 버튼 이벤트 재설정
            this.setupResultButtons();
        } catch (error) {
            console.error('진단 결과 표시 실패:', error);
        }
    }

    /**
     * 결과 영역 표시
     */
    showResultsArea() {
        try {
            const diagnosisArea = document.querySelector('.diagnosis-area');
            const resultArea = document.querySelector('.diagnosis-result');
            
            if (diagnosisArea) diagnosisArea.style.display = 'none';
            if (resultArea) resultArea.style.display = 'block';
            
            this.state.currentMode = 'results';
        } catch (error) {
            console.warn('결과 영역 표시 실패:', error);
        }
    }

    /**
     * 결과 버튼 설정
     */
    setupResultButtons() {
        try {
            const buttonMappings = {
                '#generate-report': () => this.generateReport(),
                '#save-result': () => this.saveResult(),
                '#new-diagnosis': () => this.startNewDiagnosis()
            };

            for (const [selector, handler] of Object.entries(buttonMappings)) {
                const button = document.querySelector(selector);
                if (button) {
                    button.addEventListener('click', handler);
                }
            }
        } catch (error) {
            console.warn('결과 버튼 설정 실패:', error);
        }
    }

    /**
     * 보고서 생성
     */
    async generateReport() {
        if (!this.currentDiagnosis) {
            this.showError('생성할 진단 결과가 없습니다.');
            return;
        }

        try {
            this.showToast('PDF 보고서를 생성합니다...', 'info');

            if (this.components.reportGenerator) {
                const reportData = {
                    customer: this.currentCustomer || { name: '손님' },
                    diagnosis: this.currentDiagnosis,
                    timestamp: new Date(),
                    version: this.config.version
                };

                await this.components.reportGenerator.generateReport(reportData);
                this.showToast('보고서가 생성되었습니다!', 'success');
            } else {
                // 폴백: 간단한 보고서 다운로드
                this.downloadSimpleReport();
            }

        } catch (error) {
            console.error('❌ 보고서 생성 실패:', error);
            this.showError('보고서 생성에 실패했습니다: ' + error.message);
        }
    }

    /**
     * 간단한 보고서 다운로드 (폴백)
     */
    downloadSimpleReport() {
        try {
            const reportText = `
퍼스널 컬러 진단 결과

진단 날짜: ${new Date().toLocaleDateString('ko-KR')}
고객명: ${this.currentCustomer?.name || '손님'}

== 진단 결과 ==
계절: ${this.getSeasonDisplayName(this.currentDiagnosis.season)}
신뢰도: ${this.currentDiagnosis.confidence}%
언더톤: ${this.currentDiagnosis.undertone || '분석중'}
밝기: ${this.currentDiagnosis.lightness || '분석중'}
채도: ${this.currentDiagnosis.saturation || '중간'}

== 추천사항 ==
- 웜톤: 황색, 주황색, 갈색 계열 추천
- 쿨톤: 청색, 보라색, 회색 계열 추천

Personal Color Pro v${this.config.version}
            `;

            const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `퍼스널컬러_진단결과_${Date.now()}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            this.showToast('간단한 보고서를 다운로드했습니다.', 'success');
        } catch (error) {
            console.error('간단한 보고서 다운로드 실패:', error);
            this.showError('보고서 다운로드에 실패했습니다.');
        }
    }

    /**
     * 결과 저장
     */
    async saveResult() {
        if (!this.currentDiagnosis) {
            this.showError('저장할 진단 결과가 없습니다.');
            return;
        }

        try {
            const resultData = {
                diagnosis: this.currentDiagnosis,
                customer: this.currentCustomer || { name: '손님' },
                timestamp: new Date().toISOString(),
                id: Date.now().toString()
            };

            // 로컬 스토리지에 저장
            const savedResults = JSON.parse(localStorage.getItem('diagnosis_results') || '[]');
            savedResults.push(resultData);
            
            // 최대 100개까지만 저장 (메모리 절약)
            if (savedResults.length > 100) {
                savedResults.shift();
            }
            
            localStorage.setItem('diagnosis_results', JSON.stringify(savedResults));

            this.showToast('진단 결과가 저장되었습니다!', 'success');

        } catch (error) {
            console.error('❌ 결과 저장 실패:', error);
            this.showError('결과 저장에 실패했습니다: ' + error.message);
        }
    }

    /**
     * 새 진단 시작
     */
    startNewDiagnosis() {
        try {
            // 현재 상태 초기화
            this.currentDiagnosis = null;
            this.state.currentMode = 'selection';
            this.state.isProcessing = false;

            // UI 초기화
            const resultArea = document.querySelector('.diagnosis-result');
            const diagnosisArea = document.querySelector('.diagnosis-area');
            const modeSelection = document.querySelector('.diagnosis-mode-selection');

            if (resultArea) resultArea.style.display = 'none';
            if (diagnosisArea) diagnosisArea.style.display = 'none';
            if (modeSelection) modeSelection.style.display = 'block';

            // 카메라 정리
            this.cleanupCurrentMode();

            console.log('🔄 새 진단을 시작합니다');
            this.showToast('새 진단을 시작합니다.', 'info');
        } catch (error) {
            console.error('새 진단 시작 실패:', error);
        }
    }

    /**
     * 현재 모드 정리
     */
    cleanupCurrentMode() {
        try {
            if (this.components.photoAnalysis && typeof this.components.photoAnalysis.cleanup === 'function') {
                this.components.photoAnalysis.cleanup();
            }

            if (this.components.drapingMode && typeof this.components.drapingMode.cleanup === 'function') {
                this.components.drapingMode.cleanup();
            }

            this.state.hasActiveCamera = false;
        } catch (error) {
            console.warn('모드 정리 실패:', error);
        }
    }

    /**
     * 고객 관리 열기
     */
    openCustomerManagement() {
        console.log('👥 고객 관리 시스템 열기');
        
        try {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.style.display = 'block';
                sidebar.classList.add('show');
            }

            if (this.components.customerManager) {
                this.components.customerManager.showCustomerList();
            }
        } catch (error) {
            console.warn('고객 관리 열기 실패:', error);
        }
    }

    /**
     * 사이드바 닫기
     */
    closeSidebar() {
        try {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.classList.remove('show');
                setTimeout(() => {
                    sidebar.style.display = 'none';
                }, 300);
            }
        } catch (error) {
            console.warn('사이드바 닫기 실패:', error);
        }
    }

    /**
     * 설정 열기
     */
    openSettings() {
        console.log('⚙️ 설정 열기');
        this.showToast('설정 기능은 준비 중입니다.', 'info');
    }

    /**
     * 이벤트 핸들러들
     */
    handleCustomerSelection(customerData) {
        this.currentCustomer = customerData;
        console.log('👤 고객 선택됨:', customerData.name);
        
        // 현재 고객 정보 표시
        const customerInfo = document.querySelector('.current-customer');
        if (customerInfo) {
            customerInfo.textContent = `현재 고객: ${customerData.name}`;
        }

        // 사이드바 닫기
        this.closeSidebar();
    }

    handleDiagnosisComplete(diagnosisResult) {
        console.log('✅ 진단 완료:', diagnosisResult);
        this.handleAnalysisResult(diagnosisResult);
    }

    handleReportRequest(reportOptions) {
        console.log('📊 보고서 요청:', reportOptions);
        this.generateReport();
    }

    handleModeChange(modeData) {
        console.log('🔄 모드 변경:', modeData);
    }

    handleGlobalError(event) {
        console.error('🚨 전역 에러:', event.error);
        
        if (this.systems.analyticsSystem && this.config.features.analytics) {
            try {
                this.systems.analyticsSystem.trackError(event.error, 'global_error');
            } catch (analyticsError) {
                console.warn('분석 에러 추적 실패:', analyticsError);
            }
        }
        
        if (!this.isInitialized) {
            this.showError('앱 초기화 중 문제가 발생했습니다. 페이지를 새로고침해 주세요.');
        }
    }

    handleAppBackground() {
        console.log('📱 앱이 백그라운드로 이동');
        
        // 카메라 일시정지
        if (this.state.hasActiveCamera) {
            this.pauseCamera();
        }
    }

    handleAppForeground() {
        console.log('📱 앱이 포그라운드로 복귀');
        
        // 카메라 재개
        if (this.state.hasActiveCamera) {
            this.resumeCamera();
        }
    }

    handleNetworkOnline() {
        console.log('🌐 네트워크 연결됨');
        this.showToast('네트워크가 연결되었습니다.', 'success');
    }

    handleNetworkOffline() {
        console.log('📶 네트워크 연결 끊김');
        this.showToast('오프라인 모드로 전환됩니다.', 'warning');
    }

    /**
     * 유틸리티 메서드들
     */
    getSeasonDisplayName(season) {
        const seasonNames = {
            spring: '봄 웜톤',
            summer: '여름 쿨톤', 
            autumn: '가을 웜톤',
            winter: '겨울 쿨톤'
        };
        return seasonNames[season] || season;
    }

    getConfidenceLevel(confidence) {
        if (confidence >= 90) return '매우 확실';
        if (confidence >= 80) return '확실';
        if (confidence >= 70) return '양호';
        return '보통';
    }

    pauseCamera() {
        if (this.components.photoAnalysis && typeof this.components.photoAnalysis.pauseCamera === 'function') {
            try {
                this.components.photoAnalysis.pauseCamera();
            } catch (error) {
                console.warn('카메라 일시정지 실패:', error);
            }
        }
    }

    resumeCamera() {
        if (this.components.photoAnalysis && typeof this.components.photoAnalysis.resumeCamera === 'function') {
            try {
                this.components.photoAnalysis.resumeCamera();
            } catch (error) {
                console.warn('카메라 재개 실패:', error);
            }
        }
    }

    /**
     * 토스트 알림 표시
     */
    showToast(message, type = 'info', duration = 5000) {
        try {
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.innerHTML = `
                <div class="toast-content">
                    <span class="toast-icon">${this.getToastIcon(type)}</span>
                    <span class="toast-message">${message}</span>
                    <button class="toast-close">×</button>
                </div>
            `;

            let container = document.querySelector('.toast-container');
            if (!container) {
                container = document.createElement('div');
                container.className = 'toast-container';
                container.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    pointer-events: none;
                `;
                document.body.appendChild(container);
            }
            
            container.appendChild(toast);
            
            // 스타일 적용
            toast.style.cssText = `
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                margin-bottom: 10px;
                padding: 16px;
                pointer-events: auto;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                border-left: 4px solid ${this.getToastColor(type)};
            `;
            
            // 애니메이션
            setTimeout(() => {
                toast.style.transform = 'translateX(0)';
            }, 100);
            
            // 자동 제거
            const autoRemove = setTimeout(() => {
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }, duration);
            
            // 수동 닫기
            const closeBtn = toast.querySelector('.toast-close');
            if (closeBtn) {
                closeBtn.style.cssText = `
                    background: none;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                    float: right;
                    margin-left: 10px;
                `;
                closeBtn.addEventListener('click', () => {
                    clearTimeout(autoRemove);
                    toast.style.transform = 'translateX(100%)';
                    setTimeout(() => {
                        if (toast.parentNode) {
                            toast.parentNode.removeChild(toast);
                        }
                    }, 300);
                });
            }
        } catch (error) {
            console.error('토스트 표시 실패:', error);
            // 폴백: 기본 alert 사용
            alert(message);
        }
    }

    getToastIcon(type) {
        const icons = {
            success: '✅',
            error: '❌', 
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }

    getToastColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b', 
            info: '#6366f1'
        };
        return colors[type] || '#6366f1';
    }

    /**
     * 에러 표시
     */
    showError(message) {
        console.error('❌ 에러:', message);
        this.showToast(message, 'error', 8000);
    }

    /**
     * 앱 상태 확인 (디버그용)
     */
    getAppStatus() {
        return {
            initialized: this.isInitialized,
            version: this.config?.version,
            environment: this.environment.name,
            currentMode: this.state.currentMode,
            currentCustomer: this.currentCustomer?.name,
            currentDiagnosis: this.currentDiagnosis?.season,
            loadingProgress: this.loadingProgress,
            isProcessing: this.state.isProcessing,
            hasActiveCamera: this.state.hasActiveCamera,
            availableComponents: Object.keys(this.components).filter(key => 
                this.components[key] !== null
            ),
            availableSystems: Object.keys(this.systems).filter(key => 
                this.systems[key] !== null
            ),
            eventListenersCount: Array.from(this.eventListeners.values()).reduce((sum, arr) => sum + arr.length, 0),
            browserSupport: {
                webgl: !!window.WebGLRenderingContext,
                webrtc: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
                workers: !!window.Worker,
                indexedDB: !!window.indexedDB
            }
        };
    }

    /**
     * 리소스 정리 (앱 종료 시)
     */
    cleanup() {
        console.log('🧹 앱 리소스 정리 시작');

        try {
            // 현재 모드 정리
            this.cleanupCurrentMode();

            // 이벤트 리스너 정리
            this.eventListeners.forEach((handlers, eventName) => {
                handlers.forEach(handler => {
                    try {
                        document.removeEventListener(eventName, handler);
                    } catch (error) {
                        console.warn(`이벤트 리스너 제거 실패 (${eventName}):`, error);
                    }
                });
            });
            this.eventListeners.clear();

            // 컴포넌트 정리
            Object.values(this.components).forEach(component => {
                if (component && typeof component.cleanup === 'function') {
                    try {
                        component.cleanup();
                    } catch (error) {
                        console.warn('컴포넌트 정리 실패:', error);
                    }
                }
            });

            // 시스템 정리
            Object.values(this.systems).forEach(system => {
                if (system && typeof system.cleanup === 'function') {
                    try {
                        system.cleanup();
                    } catch (error) {
                        console.warn('시스템 정리 실패:', error);
                    }
                }
            });

            // 토스트 컨테이너 제거
            const toastContainer = document.querySelector('.toast-container');
            if (toastContainer) {
                toastContainer.remove();
            }

            console.log('✅ 앱 리소스 정리 완료');
        } catch (error) {
            console.error('앱 정리 중 오류:', error);
        }
    }
}

// 전역 인스턴스 생성 (try-catch로 보호)
let personalColorApp = null;

try {
    personalColorApp = new PersonalColorApp();
    
    // 전역 접근 가능하도록 설정
    window.personalColorApp = personalColorApp;
    window.PersonalColorApp = PersonalColorApp;
    
    console.log('✅ PersonalColorApp 전역 인스턴스 생성 완료');
} catch (error) {
    console.error('❌ PersonalColorApp 인스턴스 생성 실패:', error);
    
    // 폴백 처리
    window.personalColorApp = null;
    window.PersonalColorApp = PersonalColorApp;
    
    // 사용자에게 알림
    if (document.body) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #fee2e2;
            color: #991b1b;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #fecaca;
            z-index: 10000;
            text-align: center;
        `;
        errorDiv.innerHTML = `
            <h3>⚠️ 앱 초기화 실패</h3>
            <p>시스템을 시작할 수 없습니다.</p>
            <p>페이지를 새로고침해 주세요.</p>
            <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer;">
                새로고침
            </button>
        `;
        document.body.appendChild(errorDiv);
    }
}

// 페이지 종료 시 정리
window.addEventListener('beforeunload', () => {
    if (personalColorApp) {
        personalColorApp.cleanup();
    }
});

// 개발자 도구용 디버그 함수들 (개발 환경에서만)
if (personalColorApp && (personalColorApp.environment?.isDev || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    window.debugApp = {
        getApp: () => personalColorApp,
        getStatus: () => personalColorApp ? personalColorApp.getAppStatus() : null,
        switchMode: (mode) => personalColorApp ? personalColorApp.switchToMode(mode) : console.warn('앱이 초기화되지 않음'),
        resetApp: () => location.reload(),
        showComponents: () => personalColorApp ? console.table(personalColorApp.components) : console.warn('앱이 초기화되지 않음'),
        showSystems: () => personalColorApp ? console.table(personalColorApp.systems) : console.warn('앱이 초기화되지 않음'),
        testToast: (message, type) => personalColorApp ? personalColorApp.showToast(message, type) : console.warn('앱이 초기화되지 않음'),
        cleanup: () => personalColorApp ? personalColorApp.cleanup() : console.warn('앱이 초기화되지 않음'),
        
        // 추가 디버그 기능들
        mockDiagnosis: () => {
            if (!personalColorApp) return console.warn('앱이 초기화되지 않음');
            
            const mockResult = {
                season: 'spring',
                confidence: 87,
                undertone: 'warm',
                lightness: 'light',
                saturation: 'medium',
                colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
                recommendations: {
                    hair: ['골든 브라운', '허니 블론드'],
                    makeup: ['코랄 핑크', '피치 오렌지'],
                    fashion: ['아이보리', '캐멀']
                }
            };
            
            personalColorApp.handleAnalysisResult(mockResult);
            console.log('🎭 Mock 진단 결과 적용됨');
        },
        
        mockCustomer: () => {
            if (!personalColorApp) return console.warn('앱이 초기화되지 않음');
            
            const mockCustomer = {
                name: '김영희',
                phone: '010-1234-5678',
                email: 'test@example.com',
                age: 28,
                visitDate: new Date().toISOString(),
                notes: '테스트 고객'
            };
            
            personalColorApp.handleCustomerSelection(mockCustomer);
            console.log('👤 Mock 고객 정보 적용됨');
        },
        
        testError: () => {
            personalColorApp ? personalColorApp.showError('테스트 에러 메시지입니다') : console.warn('앱이 초기화되지 않음');
        },
        
        showConfig: () => {
            if (!personalColorApp) return console.warn('앱이 초기화되지 않음');
            console.log('⚙️ 앱 설정:', personalColorApp.config);
            console.log('🌍 환경 정보:', personalColorApp.environment);
        },
        
        simulate: {
            networkOffline: () => window.dispatchEvent(new Event('offline')),
            networkOnline: () => window.dispatchEvent(new Event('online')),
            appBackground: () => Object.defineProperty(document, 'hidden', { value: true, configurable: true }) && document.dispatchEvent(new Event('visibilitychange')),
            appForeground: () => Object.defineProperty(document, 'hidden', { value: false, configurable: true }) && document.dispatchEvent(new Event('visibilitychange'))
        }
    };
    
    console.log('🔧 개발자 도구 사용법:');
    console.log('• window.debugApp.getStatus() - 앱 상태 확인');
    console.log('• window.debugApp.mockDiagnosis() - 테스트 진단 결과');
    console.log('• window.debugApp.mockCustomer() - 테스트 고객');
    console.log('• window.debugApp.testToast("메시지", "타입") - 토스트 테스트');
    console.log('• window.debugApp.simulate.networkOffline() - 오프라인 시뮬레이션');
} else {
    console.log('📱 프로덕션 모드로 실행 중 (디버그 도구 비활성화)');
}

// 추가 유틸리티 함수들
window.PersonalColorUtils = {
    // 색상 유틸리티
    hexToRgb: (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },
    
    rgbToHex: (r, g, b) => {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },
    
    // 계절별 기본 색상 팔레트
    getSeasonColors: (season) => {
        const palettes = {
            spring: {
                primary: ['#FFB6C1', '#FFE4B5', '#98FB98', '#87CEEB'],
                accent: ['#FF69B4', '#FFA500', '#32CD32', '#1E90FF'],
                neutral: ['#F5F5DC', '#FFFAF0', '#F0F8FF', '#FFF8DC']
            },
            summer: {
                primary: ['#E6E6FA', '#F0F8FF', '#E0FFFF', '#FFB6C1'],
                accent: ['#9370DB', '#4169E1', '#20B2AA', '#DC143C'],
                neutral: ['#F8F8FF', '#F5F5F5', '#E6E6FA', '#FFF0F5']
            },
            autumn: {
                primary: ['#CD853F', '#D2691E', '#B8860B', '#A0522D'],
                accent: ['#FF4500', '#FF8C00', '#DAA520', '#8B4513'],
                neutral: ['#F5DEB3', '#FAEBD7', '#FDF5E6', '#FFF8DC']
            },
            winter: {
                primary: ['#000000', '#FFFFFF', '#DC143C', '#4169E1'],
                accent: ['#8B0000', '#000080', '#2F4F4F', '#483D8B'],
                neutral: ['#F5F5F5', '#DCDCDC', '#C0C0C0', '#A9A9A9']
            }
        };
        return palettes[season] || palettes.spring;
    },
    
    // 브라우저 호환성 체크
    checkCompatibility: () => {
        const features = {
            essential: {
                promises: typeof Promise !== 'undefined',
                fetch: typeof fetch !== 'undefined',
                localStorage: typeof localStorage !== 'undefined',
                addEventListener: typeof document.addEventListener !== 'undefined'
            },
            advanced: {
                webgl: !!window.WebGLRenderingContext,
                webrtc: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
                workers: !!window.Worker,
                indexedDB: !!window.indexedDB,
                canvas: !!document.createElement('canvas').getContext,
                fileReader: !!window.FileReader
            },
            mobile: {
                touchSupport: 'ontouchstart' in window,
                orientationSupport: 'orientation' in window,
                deviceMotion: 'DeviceMotionEvent' in window,
                vibration: 'vibrate' in navigator
            }
        };
        
        return features;
    },
    
    // 성능 측정 유틸리티
    performance: {
        measure: (name, fn) => {
            const start = performance.now();
            const result = fn();
            const end = performance.now();
            console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
            return result;
        },
        
        measureAsync: async (name, fn) => {
            const start = performance.now();
            const result = await fn();
            const end = performance.now();
            console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
            return result;
        }
    },
    
    // 메모리 사용량 체크
    getMemoryUsage: () => {
        if (performance.memory) {
            return {
                used: (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + ' MB',
                total: (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2) + ' MB',
                limit: (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2) + ' MB'
            };
        }
        return null;
    }
};

console.log('✅ Personal Color Pro 완전 로드 완료');
console.log('🎨 앱 버전: 1.0.0 (오류 수정 완료)');
console.log('🔧 유틸리티: window.PersonalColorUtils 사용 가능');
