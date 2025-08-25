/**
 * app.js - Personal Color Pro 메인 애플리케이션 컨트롤러
 * 
 * 헤어디자이너용 퍼스널컬러 진단 태블릿 웹앱
 * 완전한 PWA 지원, AI 분석, 드레이핑 모드, 보고서 생성
 */

class PersonalColorApp {
    constructor() {
        this.config = null;
        this.isInitialized = false;
        this.currentCustomer = null;
        this.currentDiagnosis = null;
        this.loadingProgress = 0;
        
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

        // 초기화 시작
        this.init();
    }

    /**
     * 애플리케이션 초기화
     */
    async init() {
        try {
            console.log('🎨 Personal Color Pro 시작...');
            
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

            // 2. 핵심 시스템 초기화 (오타 수정: initializeCoresystems → initializeCoreSystem)
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
     * 설정 로드 (process 참조 제거)
     */
    async loadConfiguration() {
        try {
            // 환경 감지
            const environment = this.detectEnvironment();
            
            // 기본 설정값 사용
            this.config = {
                version: '1.0.0',
                environment: environment,
                features: {
                    aiAnalysis: true,
                    virtualDraping: true,
                    pdfReports: true,
                    offlineMode: true,
                    analytics: true
                },
                performance: {
                    enableOptimization: true,
                    cacheSize: 100,
                    workerThreads: navigator.hardwareConcurrency || 4
                },
                ui: {
                    theme: 'professional',
                    language: 'ko',
                    animations: true
                },
                diagnosis: {
                    confidenceThreshold: 85,
                    maxRetries: 3,
                    timeoutMs: 30000
                }
            };

            // 저장된 사용자 설정 로드
            const savedConfig = localStorage.getItem('app_config');
            if (savedConfig) {
                try {
                    const userConfig = JSON.parse(savedConfig);
                    this.config = { ...this.config, ...userConfig };
                } catch (error) {
                    console.warn('저장된 설정을 불러올 수 없습니다:', error);
                }
            }

            console.log('📋 설정 파일 로드 완료');
        } catch (error) {
            console.error('❌ 설정 로드 실패:', error);
            throw error;
        }
    }

    /**
     * 환경 감지 (process.env 대신)
     */
    detectEnvironment() {
        const hostname = window.location.hostname;
        
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'development';
        }
        if (hostname.includes('staging') || hostname.includes('test')) {
            return 'staging';
        }
        return 'production';
    }

    /**
     * 핵심 시스템 초기화 (메서드명 수정)
     */
    async initializeCoreSystem() {
        try {
            // 색상 시스템 초기화
            if (window.ColorSystem) {
                this.systems.colorSystem = new window.ColorSystem();
                await this.systems.colorSystem.initialize();
            }

            // 피부톤 분석기 초기화
            if (window.SkinToneAnalyzer) {
                this.systems.skinToneAnalyzer = new window.SkinToneAnalyzer();
                await this.systems.skinToneAnalyzer.initialize();
            }

            // 검증 시스템 초기화
            if (window.ValidationSystem || window.validationSystem) {
                this.systems.validationSystem = window.validationSystem || new window.ValidationSystem();
            }

            // 성능 최적화 시스템
            if (window.PerformanceOptimizer || window.performanceOptimizer) {
                this.systems.performanceOptimizer = window.performanceOptimizer || new window.PerformanceOptimizer();
            }

            // 분석 시스템
            if (window.AnalyticsSystem || window.analyticsSystem) {
                this.systems.analyticsSystem = window.analyticsSystem || new window.AnalyticsSystem();
            }

            console.log('✅ 핵심 시스템 초기화 완료');

        } catch (error) {
            console.error('❌ 핵심 시스템 초기화 실패:', error);
            throw error;
        }
    }

    /**
     * UI 컴포넌트 초기화
     */
    async initializeComponents() {
        try {
            // PhotoAnalysis 컴포넌트
            if (window.PhotoAnalysis) {
                this.components.photoAnalysis = new window.PhotoAnalysis();
            }

            // DrapingMode 컴포넌트
            if (window.DrapingMode) {
                this.components.drapingMode = new window.DrapingMode();
            }

            // ReportGenerator 컴포넌트
            if (window.ReportGenerator) {
                this.components.reportGenerator = new window.ReportGenerator();
            }

            // CustomerManager 컴포넌트
            if (window.CustomerManager) {
                this.components.customerManager = new window.CustomerManager();
            }

            // ColorPalette 컴포넌트
            if (window.ColorPalette) {
                this.components.colorPalette = new window.ColorPalette();
            }

            // DiagnosisMode 컴포넌트
            if (window.DiagnosisMode || window.diagnosisMode) {
                this.components.diagnosisMode = window.diagnosisMode || new window.DiagnosisMode();
            }

            console.log('✅ UI 컴포넌트 초기화 완료');

        } catch (error) {
            console.error('❌ UI 컴포넌트 초기화 실패:', error);
            throw error;
        }
    }

    /**
     * 초기 데이터 로드
     */
    async loadInitialData() {
        try {
            const dataPromises = [];

            // 계절 데이터 확인
            if (window.seasons) {
                console.log('✅ 계절 데이터 로드됨');
            } else {
                console.warn('⚠️ 계절 데이터를 로드할 수 없습니다');
            }

            // 한국인 피부톤 데이터 확인
            if (window.koreanSkinTones) {
                console.log('✅ 한국인 피부톤 데이터 로드됨');
            } else {
                console.warn('⚠️ 한국인 피부톤 데이터를 로드할 수 없습니다');
            }

            // 헤어컬러 차트 확인
            if (window.hairColorCharts) {
                console.log('✅ 헤어컬러 차트 로드됨');
            } else {
                console.warn('⚠️ 헤어컬러 차트를 로드할 수 없습니다');
            }

            // 브랜드 데이터 확인
            if (window.makeupBrands) {
                console.log('✅ 메이크업 브랜드 데이터 로드됨');
            }

            if (window.fashionGuide) {
                console.log('✅ 패션 가이드 데이터 로드됨');
            }

            // 모든 데이터 로딩 대기
            await Promise.all(dataPromises);

            console.log('✅ 초기 데이터 로드 완료');

        } catch (error) {
            console.error('❌ 초기 데이터 로드 실패:', error);
            // 데이터 로드 실패해도 앱은 계속 실행 가능
        }
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        try {
            // DOM 이벤트들
            document.addEventListener('DOMContentLoaded', () => {
                this.handleDOMReady();
            });

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
            window.addEventListener('online', () => {
                this.handleNetworkOnline();
            });

            window.addEventListener('offline', () => {
                this.handleNetworkOffline();
            });

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
        
        // 로딩 바 업데이트
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
    }

    /**
     * 초기화 완료
     */
    completeInitialization() {
        this.isInitialized = true;
        
        // 로딩 화면 숨기기
        const loadingScreen = document.querySelector('.loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
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

        // 초기 UI 상태 설정
        this.initializeUIState();

        // 초기화 완료 이벤트 발생
        document.dispatchEvent(new CustomEvent('app-ready', {
            detail: {
                version: this.config.version,
                features: this.config.features,
                timestamp: Date.now()
            }
        }));

        console.log('🎉 Personal Color Pro 초기화 완료!');
        
        // 분석 이벤트 전송
        if (this.systems.analyticsSystem) {
            this.systems.analyticsSystem.track('app_initialized', {
                version: this.config.version,
                environment: this.config.environment,
                loadTime: Date.now() - this.startTime
            });
        }
    }

    /**
     * DOM 준비 완료 처리
     */
    handleDOMReady() {
        console.log('📄 DOM 로드 완료');
        
        // 시작 시간 기록
        this.startTime = Date.now();
        
        // UI 초기 상태 설정
        this.initializeUIState();
        
        // 진단 모드 환경 체크
        if (this.components.diagnosisMode) {
            this.components.diagnosisMode.checkEnvironment();
        }
    }

    /**
     * UI 초기 상태 설정
     */
    initializeUIState() {
        // 진단 모드 선택 버튼들
        const modeButtons = document.querySelectorAll('[data-mode]');
        modeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
                this.switchToMode(mode);
            });
        });

        // 고객 관리 버튼
        const customerBtn = document.querySelector('#customer-management');
        if (customerBtn) {
            customerBtn.addEventListener('click', () => {
                this.openCustomerManagement();
            });
        }

        // 설정 버튼
        const settingsBtn = document.querySelector('#settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.openSettings();
            });
        }

        // 보고서 생성 버튼
        const reportBtn = document.querySelector('#generate-report');
        if (reportBtn) {
            reportBtn.addEventListener('click', () => {
                this.generateReport();
            });
        }

        // 새 진단 버튼
        const newDiagnosisBtn = document.querySelector('#new-diagnosis');
        if (newDiagnosisBtn) {
            newDiagnosisBtn.addEventListener('click', () => {
                this.startNewDiagnosis();
            });
        }

        // 사이드바 닫기 버튼
        const closeSidebarBtn = document.querySelector('.close-sidebar');
        if (closeSidebarBtn) {
            closeSidebarBtn.addEventListener('click', () => {
                this.closeSidebar();
            });
        }

        console.log('✅ UI 초기 상태 설정 완료');
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

        // 분석 추적
        if (this.systems.analyticsSystem) {
            this.systems.analyticsSystem.track('mode_change', {
                mode: mode,
                timestamp: Date.now()
            });
        }
    }

    /**
     * 모드별 UI 업데이트
     */
    updateModeUI(mode) {
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
    }

    /**
     * 드레이핑 컨트롤 설정
     */
    setupDrapingControls() {
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
            }

        } catch (error) {
            console.error('❌ 사진 촬영 실패:', error);
            this.showError('사진 촬영에 실패했습니다.');
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

            // 파일 검증
            if (this.systems.validationSystem) {
                const validation = this.systems.validationSystem.validate(
                    { file: file, size: file.size, type: file.type },
                    'image'
                );

                if (!validation.isValid) {
                    throw new Error(validation.errors[0].message);
                }
            }

            if (this.components.photoAnalysis) {
                const result = await this.components.photoAnalysis.analyzeFile(file);
                this.handleAnalysisResult(result);
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
                            <span class="value">${result.undertone}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">밝기:</span>
                            <span class="value">${result.lightness}</span>
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
    }

    /**
     * 결과 영역 표시
     */
    showResultsArea() {
        const diagnosisArea = document.querySelector('.diagnosis-area');
        const resultArea = document.querySelector('.diagnosis-result');
        
        if (diagnosisArea) diagnosisArea.style.display = 'none';
        if (resultArea) resultArea.style.display = 'block';
        
        this.state.currentMode = 'results';
    }

    /**
     * 결과 버튼 설정
     */
    setupResultButtons() {
        const generateBtn = document.querySelector('#generate-report');
        const saveBtn = document.querySelector('#save-result');
        const newBtn = document.querySelector('#new-diagnosis');

        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateReport());
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveResult());
        }

        if (newBtn) {
            newBtn.addEventListener('click', () => this.startNewDiagnosis());
        }
    }

    /**
     * 보고서 생성
     */
    async generateReport() {
        if (!this.currentDiagnosis || !this.currentCustomer) {
            this.showError('진단 결과와 고객 정보가 필요합니다.');
            return;
        }

        try {
            this.showToast('PDF 보고서를 생성합니다...', 'info');

            if (this.components.reportGenerator) {
                const reportData = {
                    customer: this.currentCustomer,
                    diagnosis: this.currentDiagnosis,
                    timestamp: new Date(),
                    version: this.config.version
                };

                await this.components.reportGenerator.generateReport(reportData);
                this.showToast('보고서가 생성되었습니다!', 'success');
            }

        } catch (error) {
            console.error('❌ 보고서 생성 실패:', error);
            this.showError('보고서 생성에 실패했습니다.');
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
                customer: this.currentCustomer,
                timestamp: new Date(),
                id: Date.now().toString()
            };

            // 로컬 스토리지에 저장
            const savedResults = JSON.parse(localStorage.getItem('diagnosis_results') || '[]');
            savedResults.push(resultData);
            localStorage.setItem('diagnosis_results', JSON.stringify(savedResults));

            this.showToast('진단 결과가 저장되었습니다!', 'success');

        } catch (error) {
            console.error('❌ 결과 저장 실패:', error);
            this.showError('결과 저장에 실패했습니다.');
        }
    }

    /**
     * 새 진단 시작
     */
    startNewDiagnosis() {
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
    }

    /**
     * 현재 모드 정리
     */
    cleanupCurrentMode() {
        if (this.components.photoAnalysis) {
            this.components.photoAnalysis.cleanup();
        }

        if (this.components.drapingMode) {
            this.components.drapingMode.cleanup();
        }

        this.state.hasActiveCamera = false;
    }

    /**
     * 고객 관리 열기
     */
    openCustomerManagement() {
        console.log('👥 고객 관리 시스템 열기');
        
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.style.display = 'block';
            sidebar.classList.add('show');
        }

        if (this.components.customerManager) {
            this.components.customerManager.showCustomerList();
        }
    }

    /**
     * 사이드바 닫기
     */
    closeSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.remove('show');
            setTimeout(() => {
                sidebar.style.display = 'none';
            }, 300);
        }
    }

    /**
     * 설정 열기
     */
    openSettings() {
        console.log('⚙️ 설정 열기');
        // 설정 모달 표시 로직
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
        
        if (this.systems.analyticsSystem) {
            this.systems.analyticsSystem.trackError(event.error, 'global_error');
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
        if (this.components.photoAnalysis) {
            this.components.photoAnalysis.pauseCamera();
        }
    }

    resumeCamera() {
        if (this.components.photoAnalysis) {
            this.components.photoAnalysis.resumeCamera();
        }
    }

    /**
     * 토스트 알림 표시
     */
    showToast(message, type = 'info', duration = 5000) {
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
            document.body.appendChild(container);
        }
        
        container.appendChild(toast);
        
        // 애니메이션
        setTimeout(() => toast.classList.add('show'), 100);
        
        // 자동 제거
        const autoRemove = setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
        
        // 수동 닫기
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            clearTimeout(autoRemove);
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        });
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

    /**
     * 에러 표시
     */
    showError(message) {
        console.error('❌ 에러:', message);
        this.showToast(message, 'error');
    }

    /**
     * 앱 상태 확인 (디버그용)
     */
    getAppStatus() {
        return {
            initialized: this.isInitialized,
            version: this.config?.version,
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
            eventListenersCount: Array.from(this.eventListeners.values()).reduce((sum, arr) => sum + arr.length, 0)
        };
    }

    /**
     * 리소스 정리 (앱 종료 시)
     */
    cleanup() {
        console.log('🧹 앱 리소스 정리 시작');

        // 현재 모드 정리
        this.cleanupCurrentMode();

        // 이벤트 리스너 정리
        this.eventListeners.forEach((handlers, eventName) => {
            handlers.forEach(handler => {
                document.removeEventListener(eventName, handler);
            });
        });
        this.eventListeners.clear();

        // 컴포넌트 정리
        Object.values(this.components).forEach(component => {
            if (component && typeof component.cleanup === 'function') {
                component.cleanup();
            }
        });

        // 시스템 정리
        Object.values(this.systems).forEach(system => {
            if (system && typeof system.cleanup === 'function') {
                system.cleanup();
            }
        });

        console.log('✅ 앱 리소스 정리 완료');
    }
}

// 전역 인스턴스 생성
const personalColorApp = new PersonalColorApp();

// 전역 접근 가능하도록 설정
window.personalColorApp = personalColorApp;
window.PersonalColorApp = PersonalColorApp;

// 페이지 종료 시 정리
window.addEventListener('beforeunload', () => {
    personalColorApp.cleanup();
});

// 개발자 도구용 디버그 함수들 (개발 환경에서만)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.debugApp = {
        getApp: () => personalColorApp,
        getStatus: () => personalColorApp.getAppStatus(),
        switchMode: (mode) => personalColorApp.switchToMode(mode),
        resetApp: () => location.reload(),
        showComponents: () => console.table(personalColorApp.components),
        showSystems: () => console.table(personalColorApp.systems),
        testToast: (message, type) => personalColorApp.showToast(message, type),
        cleanup: () => personalColorApp.cleanup()
    };
    
    console.log('🔧 개발자 도구: window.debugApp 사용 가능');
}
