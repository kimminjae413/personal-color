/**
 * Personal Color Pro - 메인 애플리케이션 컨트롤러
 * 헤어디자이너용 퍼스널컬러 진단 태블릿 웹앱
 */

class PersonalColorApp {
    constructor() {
        this.currentCustomer = null;
        this.currentMode = 'photo';
        this.diagnosisData = null;
        this.isInitialized = false;
        this.components = {};
        
        // 로딩 진행률
        this.loadingSteps = [
            'AI 모델 로딩',
            '색상 데이터베이스 초기화',
            '카메라 시스템 준비',
            '드레이핑 엔진 초기화',
            '사용자 인터페이스 준비'
        ];
        this.currentLoadingStep = 0;
        
        // 이벤트 리스너 바인딩
        this.init();
    }

    /**
     * 애플리케이션 초기화
     */
    async init() {
        try {
            console.log('🎨 Personal Color Pro 시작...');
            
            // DOM이 로드될 때까지 대기
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
            // 로딩 UI 업데이트
            this.updateLoadingProgress(0, this.loadingSteps[0]);
            
            // 1. 설정 및 상수 로드
            await this.loadConfiguration();
            this.updateLoadingProgress(20, this.loadingSteps[1]);
            
            // 2. 핵심 시스템 초기화
            await this.initializeCoresystems();
            this.updateLoadingProgress(40, this.loadingSteps[2]);
            
            // 3. AI 모델 및 데이터 로드
            await this.loadAIModelsAndData();
            this.updateLoadingProgress(60, this.loadingSteps[3]);
            
            // 4. 컴포넌트 초기화
            await this.initializeComponents();
            this.updateLoadingProgress(80, this.loadingSteps[4]);
            
            // 5. 이벤트 리스너 설정
            this.setupEventListeners();
            this.updateLoadingProgress(90, '마무리 중...');
            
            // 6. 초기 상태 설정
            await this.setInitialState();
            this.updateLoadingProgress(100, '완료!');
            
            // 로딩 완료 후 메인 앱 표시
            setTimeout(() => {
                this.hideLoadingScreen();
                this.showMainApp();
                this.isInitialized = true;
                console.log('✅ Personal Color Pro 초기화 완료!');
            }, 500);
            
        } catch (error) {
            console.error('❌ 초기화 프로세스 실패:', error);
            this.showError('시스템 초기화 중 오류가 발생했습니다: ' + error.message);
        }
    }

    /**
     * 설정 및 상수 로드
     */
    async loadConfiguration() {
        return new Promise((resolve) => {
            // 설정 데이터가 이미 로드되었는지 확인
            if (window.PersonalColorConfig) {
                resolve();
                return;
            }
            
            // 설정 파일 로딩 시뮬레이션
            setTimeout(() => {
                console.log('📋 설정 파일 로드 완료');
                resolve();
            }, 300);
        });
    }

    /**
     * 핵심 시스템 초기화
     */
    async initializeCoreystems() {
        return new Promise(async (resolve) => {
            try {
                // 저장소 시스템 초기화
                if (window.StorageManager) {
                    await StorageManager.initialize();
                }
                
                // 성능 모니터링 시작
                if (window.PerformanceMonitor) {
                    PerformanceMonitor.start();
                }
                
                // 분석 도구 초기화
                if (window.AnalyticsManager) {
                    AnalyticsManager.initialize();
                }
                
                console.log('⚙️ 핵심 시스템 초기화 완료');
                resolve();
                
            } catch (error) {
                console.error('❌ 핵심 시스템 초기화 실패:', error);
                resolve(); // 비필수 시스템이므로 계속 진행
            }
        });
    }

    /**
     * AI 모델 및 데이터 로드
     */
    async loadAIModelsAndData() {
        return new Promise(async (resolve) => {
            try {
                const loadPromises = [];
                
                // TensorFlow.js 모델 로드
                if (window.SkinToneAnalyzer) {
                    loadPromises.push(SkinToneAnalyzer.loadModel());
                }
                
                // 색상 분류 모델 로드
                if (window.ColorClassifier) {
                    loadPromises.push(ColorClassifier.initialize());
                }
                
                // 계절별 색상 데이터 로드
                if (window.SeasonsData) {
                    loadPromises.push(Promise.resolve()); // 이미 로드됨
                }
                
                // 한국인 피부톤 데이터 로드
                if (window.KoreanSkinTonesData) {
                    loadPromises.push(Promise.resolve()); // 이미 로드됨
                }
                
                await Promise.all(loadPromises);
                console.log('🧠 AI 모델 및 데이터 로드 완료');
                resolve();
                
            } catch (error) {
                console.error('❌ AI 모델 로드 실패:', error);
                // AI 기능 없이도 기본 기능은 동작하도록 함
                resolve();
            }
        });
    }

    /**
     * 컴포넌트 초기화
     */
    async initializeComponents() {
        return new Promise((resolve) => {
            try {
                // 진단 모드 관리자
                this.components.diagnosisMode = new DiagnosisMode();
                
                // 사진 분석 컴포넌트
                this.components.photoAnalysis = new PhotoAnalysis();
                
                // 드레이핑 모드 컴포넌트
                this.components.drapingMode = new DrapingMode();
                
                // 보고서 생성기
                this.components.reportGenerator = new ReportGenerator();
                
                // 색상 팔레트 관리자
                this.components.colorPalette = new ColorPalette();
                
                // 고객 관리자
                this.components.customerManager = new CustomerManager();
                
                // UI 컴포넌트 관리자
                this.components.uiComponents = new UIComponents();
                
                console.log('🎛️ 컴포넌트 초기화 완료');
                resolve();
                
            } catch (error) {
                console.error('❌ 컴포넌트 초기화 실패:', error);
                throw error;
            }
        });
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 헤더 버튼들
        this.bindHeaderEvents();
        
        // 모드 선택 버튼들
        this.bindModeEvents();
        
        // 고객 관리 이벤트들
        this.bindCustomerEvents();
        
        // 액션 바 이벤트들
        this.bindActionEvents();
        
        // 키보드 단축키
        this.bindKeyboardShortcuts();
        
        // 윈도우 이벤트들
        this.bindWindowEvents();
        
        console.log('🎯 이벤트 리스너 설정 완료');
    }

    /**
     * 헤더 이벤트 바인딩
     */
    bindHeaderEvents() {
        const settingsBtn = document.getElementById('settings-btn');
        const helpBtn = document.getElementById('help-btn');
        
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettings());
        }
        
        if (helpBtn) {
            helpBtn.addEventListener('click', () => this.showHelp());
        }
    }

    /**
     * 모드 선택 이벤트 바인딩
     */
    bindModeEvents() {
        const modeButtons = document.querySelectorAll('.mode-btn');
        
        modeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
                this.switchMode(mode);
            });
        });
    }

    /**
     * 고객 관리 이벤트 바인딩
     */
    bindCustomerEvents() {
        const newCustomerBtn = document.getElementById('new-customer-btn');
        
        if (newCustomerBtn) {
            newCustomerBtn.addEventListener('click', () => this.showNewCustomerModal());
        }
        
        // 고객 목록 클릭 이벤트는 동적으로 처리
        document.addEventListener('click', (e) => {
            if (e.target.closest('.customer-item')) {
                const customerItem = e.target.closest('.customer-item');
                const customerId = customerItem.dataset.customerId;
                if (customerId) {
                    this.selectCustomer(customerId);
                }
            }
        });
    }

    /**
     * 액션 바 이벤트 바인딩
     */
    bindActionEvents() {
        const resetBtn = document.getElementById('reset-btn');
        const saveProgressBtn = document.getElementById('save-progress-btn');
        const completeDiagnosisBtn = document.getElementById('complete-diagnosis-btn');
        const generateFinalReportBtn = document.getElementById('generate-final-report-btn');
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetDiagnosis());
        }
        
        if (saveProgressBtn) {
            saveProgressBtn.addEventListener('click', () => this.saveProgress());
        }
        
        if (completeDiagnosisBtn) {
            completeDiagnosisBtn.addEventListener('click', () => this.completeDiagnosis());
        }
        
        if (generateFinalReportBtn) {
            generateFinalReportBtn.addEventListener('click', () => this.generateFinalReport());
        }
    }

    /**
     * 키보드 단축키 바인딩
     */
    bindKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + 숫자키로 모드 전환
            if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        this.switchMode('photo');
                        break;
                    case '2':
                        e.preventDefault();
                        this.switchMode('draping');
                        break;
                    case 's':
                        e.preventDefault();
                        this.saveProgress();
                        break;
                    case 'r':
                        e.preventDefault();
                        this.resetDiagnosis();
                        break;
                    case 'h':
                        e.preventDefault();
                        this.showHelp();
                        break;
                }
            }
            
            // ESC 키로 모달 닫기
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    /**
     * 윈도우 이벤트 바인딩
     */
    bindWindowEvents() {
        // 화면 방향 변경 감지
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });
        
        // 리사이즈 이벤트
        window.addEventListener('resize', () => {
            this.throttle(() => {
                this.handleResize();
            }, 250)();
        });
        
        // 언로드 이벤트 (진행 중인 작업 저장)
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = '저장되지 않은 진단 데이터가 있습니다. 정말 나가시겠습니까?';
                return e.returnValue;
            }
        });
        
        // 가시성 변경 이벤트
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.handleAppHidden();
            } else {
                this.handleAppVisible();
            }
        });
    }

    /**
     * 초기 상태 설정
     */
    async setInitialState() {
        return new Promise((resolve) => {
            try {
                // 저장된 고객 목록 로드
                this.loadCustomerList();
                
                // 마지막 사용 모드 복원
                const lastMode = localStorage.getItem('lastUsedMode') || 'photo';
                this.currentMode = lastMode;
                
                // 모드 UI 업데이트
                this.updateModeUI();
                
                // 세션 정보 복원
                this.restoreSession();
                
                console.log('🏁 초기 상태 설정 완료');
                resolve();
                
            } catch (error) {
                console.error('❌ 초기 상태 설정 실패:', error);
                resolve(); // 비필수이므로 계속 진행
            }
        });
    }

    /**
     * 로딩 진행률 업데이트
     */
    updateLoadingProgress(percentage, message) {
        const progressBar = document.getElementById('loading-progress');
        const loadingText = document.getElementById('loading-text');
        
        if (progressBar) {
            progressBar.style.width = percentage + '%';
        }
        
        if (loadingText) {
            loadingText.textContent = message;
        }
        
        console.log(`📊 로딩 진행률: ${percentage}% - ${message}`);
    }

    /**
     * 로딩 화면 숨기기
     */
    hideLoadingScreen() {
        const loadingSplash = document.getElementById('loading-splash');
        
        if (loadingSplash) {
            loadingSplash.style.opacity = '0';
            setTimeout(() => {
                loadingSplash.style.display = 'none';
            }, 300);
        }
    }

    /**
     * 메인 앱 표시
     */
    showMainApp() {
        const app = document.getElementById('app');
        
        if (app) {
            app.style.display = 'flex';
            app.classList.add('animate-fadeIn');
        }
        
        // 화면 방향 알림 표시 (세로 모드인 경우)
        this.checkOrientation();
    }

    /**
     * 모드 전환
     */
    switchMode(mode) {
        if (!this.isInitialized || this.currentMode === mode) {
            return;
        }
        
        console.log(`🔄 모드 전환: ${this.currentMode} → ${mode}`);
        
        // 현재 모드 저장
        const previousMode = this.currentMode;
        this.currentMode = mode;
        
        // 로컬 스토리지에 저장
        localStorage.setItem('lastUsedMode', mode);
        
        // UI 업데이트
        this.updateModeUI();
        
        // 모드별 초기화
        this.initializeMode(mode);
        
        // 이전 모드 정리
        this.cleanupMode(previousMode);
        
        // 분석 이벤트 전송
        if (window.AnalyticsManager) {
            AnalyticsManager.track('mode_switch', { from: previousMode, to: mode });
        }
    }

    /**
     * 모드 UI 업데이트
     */
    updateModeUI() {
        // 모드 버튼 활성화 상태 업데이트
        const modeButtons = document.querySelectorAll('.mode-btn');
        modeButtons.forEach(button => {
            const buttonMode = button.dataset.mode;
            button.classList.toggle('active', buttonMode === this.currentMode);
        });
        
        // 모드 콘텐츠 표시/숨김
        const modeContents = document.querySelectorAll('.mode-content');
        modeContents.forEach(content => {
            const contentMode = content.id.replace('-mode', '').replace('photo-analysis', 'photo').replace('draping', 'draping');
            
            if (contentMode === this.currentMode) {
                content.style.display = 'flex';
                content.classList.add('active');
                content.classList.add('animate-fadeIn');
            } else {
                content.style.display = 'none';
                content.classList.remove('active');
                content.classList.remove('animate-fadeIn');
            }
        });
    }

    /**
     * 모드별 초기화
     */
    initializeMode(mode) {
        switch (mode) {
            case 'photo':
                if (this.components.photoAnalysis) {
                    this.components.photoAnalysis.initialize();
                }
                break;
                
            case 'draping':
                if (this.components.drapingMode) {
                    this.components.drapingMode.initialize();
                }
                break;
        }
    }

    /**
     * 모드 정리
     */
    cleanupMode(mode) {
        switch (mode) {
            case 'photo':
                if (this.components.photoAnalysis) {
                    this.components.photoAnalysis.cleanup();
                }
                break;
                
            case 'draping':
                if (this.components.drapingMode) {
                    this.components.drapingMode.cleanup();
                }
                break;
        }
    }

    /**
     * 새 고객 모달 표시
     */
    showNewCustomerModal() {
        if (this.components.customerManager) {
            this.components.customerManager.showNewCustomerModal();
        }
    }

    /**
     * 고객 선택
     */
    selectCustomer(customerId) {
        if (this.components.customerManager) {
            const customer = this.components.customerManager.getCustomer(customerId);
            if (customer) {
                this.currentCustomer = customer;
                this.updateCurrentCustomerUI();
                
                console.log('👤 고객 선택:', customer.name);
                
                // 분석 이벤트 전송
                if (window.AnalyticsManager) {
                    AnalyticsManager.track('customer_selected', { customerId });
                }
            }
        }
    }

    /**
     * 현재 고객 UI 업데이트
     */
    updateCurrentCustomerUI() {
        const currentCustomerElement = document.getElementById('current-customer');
        const customerNameElement = currentCustomerElement?.querySelector('.customer-name');
        
        if (customerNameElement && this.currentCustomer) {
            customerNameElement.textContent = this.currentCustomer.name;
            currentCustomerElement.classList.add('active');
        } else if (customerNameElement) {
            customerNameElement.textContent = '고객을 선택해주세요';
            currentCustomerElement.classList.remove('active');
        }
    }

    /**
     * 고객 목록 로드
     */
    loadCustomerList() {
        if (this.components.customerManager) {
            this.components.customerManager.loadCustomerList();
        }
    }

    /**
     * 진단 초기화
     */
    resetDiagnosis() {
        if (confirm('현재 진단 데이터가 모두 삭제됩니다. 계속하시겠습니까?')) {
            this.diagnosisData = null;
            
            // 각 모드별 초기화
            if (this.components.photoAnalysis) {
                this.components.photoAnalysis.reset();
            }
            
            if (this.components.drapingMode) {
                this.components.drapingMode.reset();
            }
            
            // UI 상태 업데이트
            this.updateActionButtonsState();
            
            this.showToast('진단이 초기화되었습니다.', 'info');
            
            console.log('🔄 진단 초기화 완료');
        }
    }

    /**
     * 진행 상황 저장
     */
    async saveProgress() {
        if (!this.currentCustomer) {
            this.showToast('고객을 먼저 선택해주세요.', 'warning');
            return;
        }
        
        try {
            const progressData = {
                customerId: this.currentCustomer.id,
                mode: this.currentMode,
                diagnosisData: this.diagnosisData,
                timestamp: new Date().toISOString()
            };
            
            // 로컬 스토리지에 저장
            const progressKey = `progress_${this.currentCustomer.id}`;
            localStorage.setItem(progressKey, JSON.stringify(progressData));
            
            this.showToast('진행 상황이 저장되었습니다.', 'success');
            
            console.log('💾 진행 상황 저장 완료');
            
        } catch (error) {
            console.error('❌ 진행 상황 저장 실패:', error);
            this.showToast('저장에 실패했습니다.', 'error');
        }
    }

    /**
     * 진단 완료
     */
    completeDiagnosis() {
        if (!this.validateDiagnosis()) {
            return;
        }
        
        // 진단 완료 처리
        this.diagnosisData.isComplete = true;
        this.diagnosisData.completedAt = new Date().toISOString();
        
        // UI 업데이트
        this.updateActionButtonsState();
        
        this.showToast('진단이 완료되었습니다!', 'success');
        
        console.log('✅ 진단 완료');
    }

    /**
     * 최종 보고서 생성
     */
    async generateFinalReport() {
        if (!this.diagnosisData || !this.diagnosisData.isComplete) {
            this.showToast('진단을 먼저 완료해주세요.', 'warning');
            return;
        }
        
        try {
            if (this.components.reportGenerator) {
                const report = await this.components.reportGenerator.generateReport(
                    this.currentCustomer,
                    this.diagnosisData
                );
                
                this.showReportModal(report);
                
                console.log('📋 최종 보고서 생성 완료');
            }
            
        } catch (error) {
            console.error('❌ 보고서 생성 실패:', error);
            this.showToast('보고서 생성에 실패했습니다.', 'error');
        }
    }

    /**
     * 진단 데이터 검증
     */
    validateDiagnosis() {
        if (!this.currentCustomer) {
            this.showToast('고객을 먼저 선택해주세요.', 'warning');
            return false;
        }
        
        if (!this.diagnosisData) {
            this.showToast('진단 데이터가 없습니다. 진단을 먼저 실행해주세요.', 'warning');
            return false;
        }
        
        // 모드별 검증
        if (this.currentMode === 'photo') {
            if (!this.diagnosisData.photoAnalysis) {
                this.showToast('사진 분석이 완료되지 않았습니다.', 'warning');
                return false;
            }
        } else if (this.currentMode === 'draping') {
            if (!this.diagnosisData.drapingAnalysis) {
                this.showToast('드레이핑 분석이 완료되지 않았습니다.', 'warning');
                return false;
            }
        }
        
        return true;
    }

    /**
     * 액션 버튼 상태 업데이트
     */
    updateActionButtonsState() {
        const completeDiagnosisBtn = document.getElementById('complete-diagnosis-btn');
        const generateFinalReportBtn = document.getElementById('generate-final-report-btn');
        
        const hasDiagnosisData = this.diagnosisData !== null;
        const isComplete = this.diagnosisData?.isComplete === true;
        
        if (completeDiagnosisBtn) {
            completeDiagnosisBtn.disabled = !hasDiagnosisData || isComplete;
        }
        
        if (generateFinalReportBtn) {
            generateFinalReportBtn.disabled = !isComplete;
        }
    }

    /**
     * 화면 방향 확인
     */
    checkOrientation() {
        const isPortrait = window.innerHeight > window.innerWidth;
        
        if (isPortrait) {
            this.showOrientationNotice();
        } else {
            this.hideOrientationNotice();
        }
    }

    /**
     * 세로 모드 알림 표시
     */
    showOrientationNotice() {
        let notice = document.querySelector('.orientation-notice');
        
        if (!notice) {
            notice = document.createElement('div');
            notice.className = 'orientation-notice';
            notice.innerHTML = '📱 가로 모드에서 최적화되어 있습니다';
            document.body.appendChild(notice);
        }
        
        notice.style.display = 'block';
    }

    /**
     * 세로 모드 알림 숨기기
     */
    hideOrientationNotice() {
        const notice = document.querySelector('.orientation-notice');
        if (notice) {
            notice.style.display = 'none';
        }
    }

    /**
     * 화면 방향 변경 처리
     */
    handleOrientationChange() {
        console.log('🔄 화면 방향 변경 감지');
        
        this.checkOrientation();
        
        // 컴포넌트들에게 방향 변경 알림
        Object.values(this.components).forEach(component => {
            if (typeof component.handleOrientationChange === 'function') {
                component.handleOrientationChange();
            }
        });
    }

    /**
     * 리사이즈 이벤트 처리
     */
    handleResize() {
        // 컴포넌트들에게 리사이즈 알림
        Object.values(this.components).forEach(component => {
            if (typeof component.handleResize === 'function') {
                component.handleResize();
            }
        });
    }

    /**
     * 앱이 숨겨질 때 처리
     */
    handleAppHidden() {
        // 자동 저장
        if (this.hasUnsavedChanges()) {
            this.saveProgress();
        }
        
        // 카메라 정지
        if (this.components.photoAnalysis) {
            this.components.photoAnalysis.pauseCamera();
        }
    }

    /**
     * 앱이 보일 때 처리
     */
    handleAppVisible() {
        // 카메라 재시작
        if (this.currentMode === 'photo' && this.components.photoAnalysis) {
            this.components.photoAnalysis.resumeCamera();
        }
    }

    /**
     * 저장되지 않은 변경사항 확인
     */
    hasUnsavedChanges() {
        return this.diagnosisData !== null && !this.diagnosisData.isSaved;
    }

    /**
     * 세션 복원
     */
    restoreSession() {
        try {
            const sessionData = localStorage.getItem('currentSession');
            if (sessionData) {
                const session = JSON.parse(sessionData);
                
                if (session.customerId) {
                    this.selectCustomer(session.customerId);
                }
                
                if (session.diagnosisData) {
                    this.diagnosisData = session.diagnosisData;
                    this.updateActionButtonsState();
                }
            }
        } catch (error) {
            console.warn('⚠️ 세션 복원 실패:', error);
        }
    }

    /**
     * 설정 화면 표시
     */
    showSettings() {
        // TODO: 설정 모달 구현
        console.log('⚙️ 설정 화면 표시');
    }

    /**
     * 도움말 표시
     */
    showHelp() {
        // TODO: 도움말 모달 구현
        console.log('❓ 도움말 표시');
    }

    /**
     * 모든 모달 닫기
     */
    closeAllModals() {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => {
            modal.remove();
        });
    }

    /**
     * 보고서 모달 표시
     */
    showReportModal(report) {
        // TODO: 보고서 모달 구현
        console.log('📋 보고서 모달 표시:', report);
    }

    /**
     * 토스트 알림 표시
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = {
            info: '💡',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        }[type] || '💡';
        
        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">×</button>
        `;
        
        // 토스트 컨테이너 확인/생성
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        
        container.appendChild(toast);
        
        // 자동 제거
        setTimeout(() => {
            toast.remove();
        }, 5000);
        
        // 닫기 버튼 이벤트
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            toast.remove();
        });
    }

    /**
     * 에러 표시
     */
    showError(message) {
        console.error('❌ 에러:', message);
        this.showToast(message, 'error');
    }

    /**
     * 쓰로틀 유틸리티
     */
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// 애플리케이션 인스턴스 생성 및 전역 변수로 설정
window.PersonalColorApp = new PersonalColorApp();

// 개발자 도구용 디버그 함수들
if (process.env.NODE_ENV === 'development') {
    window.debugApp = {
        getApp: () => window.PersonalColorApp,
        switchMode: (mode) => window.PersonalColorApp.switchMode(mode),
        resetApp: () => location.reload(),
        showComponents: () => console.table(window.PersonalColorApp.components),
        getCurrentState: () => ({
            currentCustomer: window.PersonalColorApp.currentCustomer,
            currentMode: window.PersonalColorApp.currentMode,
            diagnosisData: window.PersonalColorApp.diagnosisData
        })
    };
    
    console.log('🔧 개발자 도구: window.debugApp 사용 가능');
}
