/**
     * 모드 선택 단계 생성
     */
    createModeSelectionStep() {
        const advancedModeCard = this.advancedMode ? `
            <!-- 고급 과학적 분석 -->
            <article class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl shadow-xl p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 touch-target group border border-emerald-200"
                     onclick="selectMode('advanced')"
                     role="button"
                     tabindex="0"
                     aria-label="고급 과학적 분석 선택"
                     onkeydown="if(event.key==='Enter'||event.key===' ') selectMode('advanced')">
                <div class="text-center">
                    <div class="bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full p-6 w-24 h-24 mx-auto mb-8 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <svg class="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                        </svg>
                    </div>
                    
                    <h3 class="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                        고급 과학적 분석
                    </h3>
                    
                    <p class="text-gray-600 mb-8 text-base md:text-lg leading-relaxed">
                        CIE L*a*b* 측정과<br>
                        파운데이션 매칭까지 완벽 분석
                    </p>
                    
                    <div class="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-6">
                        <div class="grid grid-cols-3 gap-6 text-center">
                            <div>
                                <div class="text-3xl font-bold text-emerald-600 mb-1">20분</div>
                                <div class="text-sm text-emerald-700 font-medium">소요시간</div>
                            </div>
                            <div>
                                <div class="text-3xl font-bold text-emerald-600 mb-1">96%</div>
                                <div class="text-sm text-emerald-700 font-medium">정확도</div>
                            </div>
                            <div>
                                <div class="text-2xl font-bold text-emerald-600 mb-1">⭐⭐⭐⭐</div>
                                <div class="text-sm text-emerald-700 font-medium">과학성</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-4 flex justify-center">
                        <span class="bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                            🔬 Lab 측정 + 💄 제품매칭
                        </span>
                    </div>
                </div>
            </article>
        ` : '';

        return `
            <div class="max-w-6xl mx-auto">
                <div class="text-center mb-12">
                    <h2 class="text-3xl md:text-4xl lg:text-5xl text-gray-800 mb-6 font-bold">진단 방식을 선택하세요</h2>
                    <p class="text-xl text-gray-600 mb-8">
                        ${this.advancedMode ? '세 가지' : '두 가지'} 방식 중 원하는 진단 방법을 선택해주세요
                    </p>
                </div>
                
                <!-- 진단 방식 선택 카드들 -->
                <div class="grid grid-cols-1 ${this.advancedMode ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-8 mb-12">
                    
                    <!-- 사진 기반 분석 -->
                    <article class="bg-white rounded-3xl shadow-xl p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 touch-target group"
                             onclick="selectMode('photo')"
                             role="button"
                             tabindex="0"
                             aria-label="사진 기반 AI 분석 선택"
                             onkeydown="if(event.key==='Enter'||event.key===' ') selectMode('photo')">
                        <div class="text-center">
                            <div class="bg-gradient-to-br from-blue-100 to-blue-200 rounded-full p-6 w-24 h-24 mx-auto mb-8 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                <svg class="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                            </div>
                            
                            <h3 class="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                                사진 기반 AI 분석
                            </h3>
                            
                            <p class="text-gray-600 mb-8 text-base md:text-lg leading-relaxed">
                                간편하고 빠른 AI 분석으로<br>
                                기본적인 퍼스널컬러를 진단합니다.
                            </p>
                            
                            <div class="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
                                <div class="grid grid-cols-3 gap-6 text-center">
                                    <div>
                                        <div class="text-3xl font-bold text-blue-600 mb-1">5분</div>
                                        <div class="text-sm text-blue-700 font-medium">소요시간</div>
                                    </div>
                                    <div>
                                        <div class="text-3xl font-bold text-blue-600 mb-1">85%</div>
                                        <div class="text-sm text-blue-700 font-medium">정확도</div>
                                    </div>
                                    <div>
                                        <div class="text-2xl font-bold text-blue-600 mb-1">⭐⭐</div>
                                        <div class="text-sm text-blue-700 font-// js/app.js - 메인 애플리케이션 로직

/**
 * 퍼스널컬러 분석 메인 애플리케이션 클래스
 */
class PersonalColorAnalyzer {
    constructor() {
        console.log('PersonalColorAnalyzer 초기화 시작');
        
        // 앱 상태 초기화
        this.currentStep = 0;
        this.analysisMode = null;
        this.currentDrapingStep = 'temperature';
        this.advancedMode = false; // 고급 기능 활성화 여부
        this.analysisData = {
            mode: null,
            results: {},
            selectedColors: {},
            finalSeason: null,
            confidence: 0,
            labAnalysis: null,      // L*a*b* 분석 결과
            foundationMatch: null   // 파운데이션 매칭 결과
        };
        
        // 단계별 콘텐츠 매핑
        this.stepContents = {
            0: () => this.createWelcomeStep(),
            1: () => this.createModeSelectionStep(),
            2: () => this.createDrapingAnalysisStep(),
            3: () => this.createResultsStep()
        };
        
        // 초기화
        this.init();
    }
    
    /**
     * 앱 초기화
     */
    async init() {
        try {
            // DOM이 완전히 로드될 때까지 대기
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            // 필수 데이터 확인
            this.checkDependencies();
            
            // UI 초기화
            this.initializeUI();
            
            // 이벤트 리스너 설정
            this.setupEventListeners();
            
            // 첫 번째 단계 표시
            this.showStep(0);
            
            console.log('PersonalColorAnalyzer 초기화 완료');
            
        } catch (error) {
            console.error('앱 초기화 실패:', error);
            this.showError('애플리케이션 초기화 중 오류가 발생했습니다.');
        }
    }
    
    /**
     * 의존성 확인
     */
    checkDependencies() {
        const required = ['SEASONS', 'DRAPING_COLORS', 'SIMPLE_COLORS'];
        const advanced = ['ColorMeasurement', 'FoundationMatcher', 'FOUNDATION_DATABASE'];
        
        const missing = required.filter(dep => !window[dep]);
        const advancedMissing = advanced.filter(dep => !window[dep]);
        
        if (missing.length > 0) {
            console.warn(`일부 기본 데이터가 누락되었습니다: ${missing.join(', ')}`);
        }
        
        if (advancedMissing.length === 0) {
            this.advancedMode = true;
            console.log('🚀 고급 모드 활성화: CIE L*a*b* 분석 및 파운데이션 매칭 지원');
        } else {
            this.advancedMode = false;
            console.log('기본 모드로 실행: 고급 기능 비활성화');
        }
        
        console.log('의존성 확인 완료');
    }
    
    /**
     * UI 초기화
     */
    initializeUI() {
        // 로딩 화면 숨기기
        const loading = document.getElementById('loading');
        const app = document.getElementById('app');
        
        if (loading && app) {
            setTimeout(() => {
                loading.style.display = 'none';
                app.style.display = 'block';
            }, 1500);
        }
        
        // 전문가 매뉴얼 버튼 이벤트
        const manualBtn = document.getElementById('manual-btn');
        if (manualBtn) {
            manualBtn.addEventListener('click', () => {
                if (window.ExpertManual && window.ExpertManual.show) {
                    window.ExpertManual.show();
                }
            });
        }
    }
    
    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 스와이프 제스처 (모바일)
        this.setupSwipeGestures();
        
        // 키보드 네비게이션
        this.setupKeyboardNavigation();
        
        // 브라우저 뒤로가기 처리
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.step !== undefined) {
                this.currentStep = event.state.step;
                this.showStep(this.currentStep);
            }
        });
    }
    
    /**
     * 스와이프 제스처 설정
     */
    setupSwipeGestures() {
        let startX = 0;
        let startY = 0;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            
            // 수평 스와이프가 수직보다 클 때만
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0 && !this.isModalOpen()) {
                    // 오른쪽 스와이프: 뒤로가기
                    this.goBack();
                }
            }
            
            startX = 0;
            startY = 0;
        }, { passive: true });
    }
    
    /**
     * 키보드 네비게이션 설정
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (this.isModalOpen()) return;
            
            switch (e.key) {
                case 'Escape':
                    this.goBack();
                    break;
                case 'ArrowLeft':
                    this.goBack();
                    break;
                case 'Home':
                    this.resetApp();
                    break;
            }
        });
    }
    
    /**
     * 단계 표시
     */
    showStep(stepNumber) {
        console.log(`단계 ${stepNumber} 표시`);
        
        try {
            this.currentStep = stepNumber;
            
            // 브라우저 히스토리 업데이트
            const stateObj = { step: stepNumber };
            const title = `퍼스널컬러 진단 - 단계 ${stepNumber + 1}`;
            const url = `#step-${stepNumber}`;
            
            if (stepNumber === 0) {
                history.replaceState(stateObj, title, '/');
            } else {
                history.pushState(stateObj, title, url);
            }
            
            // 콘텐츠 생성 및 표시
            const contentGenerator = this.stepContents[stepNumber];
            if (contentGenerator) {
                const content = contentGenerator();
                const container = document.getElementById('step-content');
                
                if (container) {
                    container.innerHTML = content;
                    
                    // 페이드인 애니메이션 적용
                    container.classList.add('fade-in-up');
                    
                    // 애니메이션 후 클래스 제거
                    setTimeout(() => {
                        container.classList.remove('fade-in-up');
                    }, 600);
                }
            } else {
                throw new Error(`단계 ${stepNumber}에 대한 콘텐츠가 없습니다.`);
            }
            
            // 네비게이션 버튼 상태 업데이트
            this.updateNavigationButtons();
            
        } catch (error) {
            console.error('단계 표시 오류:', error);
            this.showError(`단계 ${stepNumber}를 표시하는 중 오류가 발생했습니다.`);
        }
    }
    
    /**
     * 환영 단계 생성
     */
    createWelcomeStep() {
        return `
            <div class="text-center max-w-4xl mx-auto">
                <div class="mb-12">
                    <div class="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
                        <svg class="w-16 h-16 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"></path>
                        </svg>
                    </div>
                    
                    <h2 class="text-4xl md:text-5xl lg:text-6xl text-gray-800 mb-6 font-bold">
                        당신만의 색을 찾아보세요
                    </h2>
                    
                    <p class="text-xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto">
                        과학적 드래이핑 분석으로<br>
                        당신에게 가장 어울리는 색상을 찾아드립니다
                    </p>
                </div>
                
                <!-- 기능 소개 -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div class="bg-white rounded-3xl shadow-lg p-8">
                        <div class="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                            </svg>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-800 mb-4">과학적 분석</h3>
                        <p class="text-gray-600 leading-relaxed">
                            Munsell 색체계와 Von Kries 이론을 기반으로 한 정확한 색상 분석
                        </p>
                    </div>
                    
                    <div class="bg-white rounded-3xl shadow-lg p-8">
                        <div class="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                            </svg>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-800 mb-4">모바일 최적화</h3>
                        <p class="text-gray-600 leading-relaxed">
                            터치와 스와이프 제스처로 직관적이고 편리한 사용 경험
                        </p>
                    </div>
                    
                    <div class="bg-white rounded-3xl shadow-lg p-8">
                        <div class="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                            </svg>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-800 mb-4">전문가급 정확도</h3>
                        <p class="text-gray-600 leading-relaxed">
                            92% 정확도의 전문 드래이핑과 맞춤 상담 제공
                        </p>
                    </div>
                </div>
                
                <!-- 시작 버튼 -->
                <div class="text-center">
                    <button onclick="app.showStep(1)" 
                            class="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-12 py-6 rounded-2xl text-2xl font-bold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl touch-target">
                        🎨 진단 시작하기
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * 모드 선택 단계 생성
     */
    createModeSelectionStep() {
        return `
            <div class="max-w-6xl mx-auto">
                <div class="text-center mb-12">
                    <h2 class="text-3xl md:text-4xl lg:text-5xl text-gray-800 mb-6 font-bold">진단 방식을 선택하세요</h2>
                    <p class="text-xl text-gray-600 mb-8">
                        두 가지 방식 중 원하는 진단 방법을 선택해주세요
                    </p>
                </div>
                
                <!-- 진단 방식 선택 카드들 -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    
                    <!-- 사진 기반 분석 -->
                    <article class="bg-white rounded-3xl shadow-xl p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 touch-target group"
                             onclick="selectMode('photo')"
                             role="button"
                             tabindex="0"
                             aria-label="사진 기반 AI 분석 선택"
                             onkeydown="if(event.key==='Enter'||event.key===' ') selectMode('photo')">
                        <div class="text-center">
                            <div class="bg-gradient-to-br from-blue-100 to-blue-200 rounded-full p-6 w-24 h-24 mx-auto mb-8 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                <svg class="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                            </div>
                            
                            <h3 class="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                                사진 기반 AI 분석
                            </h3>
                            
                            <p class="text-gray-600 mb-8 text-base md:text-lg leading-relaxed">
                                간편하고 빠른 AI 분석으로<br>
                                기본적인 퍼스널컬러를 진단합니다.
                            </p>
                            
                            <div class="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
                                <div class="grid grid-cols-3 gap-6 text-center">
                                    <div>
                                        <div class="text-3xl font-bold text-blue-600 mb-1">5분</div>
                                        <div class="text-sm text-blue-700 font-medium">소요시간</div>
                                    </div>
                                    <div>
                                        <div class="text-3xl font-bold text-blue-600 mb-1">85%</div>
                                        <div class="text-sm text-blue-700 font-medium">정확도</div>
                                    </div>
                                    <div>
                                        <div class="text-2xl font-bold text-blue-600 mb-1">⭐⭐</div>
                                        <div class="text-sm text-blue-700 font-medium">난이도</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </article>

                    <!-- 전문가 드래이핑 진단 -->
                    <article class="bg-white rounded-3xl shadow-xl p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 touch-target group"
                             onclick="selectMode('expert')"
                             role="button"
                             tabindex="0"
                             aria-label="전문가급 드래이핑 진단 선택"
                             onkeydown="if(event.key==='Enter'||event.key===' ') selectMode('expert')">
                        <div class="text-center">
                            <div class="bg-gradient-to-br from-purple-100 to-purple-200 rounded-full p-6 w-24 h-24 mx-auto mb-8 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                <svg class="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"></path>
                                </svg>
                            </div>
                            
                            <h3 class="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                                전문가급 드래이핑 진단
                            </h3>
                            
                            <p class="text-gray-600 mb-8 text-base md:text-lg leading-relaxed">
                                Sci\\ART 방법론으로<br>
                                3단계 체계적 분석을 진행합니다.
                            </p>
                            
                            <div class="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6">
                                <div class="grid grid-cols-3 gap-6 text-center">
                                    <div>
                                        <div class="text-3xl font-bold text-purple-600 mb-1">15분</div>
                                        <div class="text-sm text-purple-700 font-medium">소요시간</div>
                                    </div>
                                    <div>
                                        <div class="text-3xl font-bold text-purple-600 mb-1">92%</div>
                                        <div class="text-sm text-purple-700 font-medium">정확도</div>
                                    </div>
                                    <div>
                                        <div class="text-2xl font-bold text-purple-600 mb-1">⭐⭐⭐</div>
                                        <div class="text-sm text-purple-700 font-medium">난이도</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </article>

                    ${advancedModeCard}
                </div>

                <!-- 추가 정보 섹션 -->
                <div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 text-center border border-yellow-200">
                        <div class="text-4xl mb-4">🔬</div>
                        <h4 class="font-bold text-yellow-800 mb-2">과학적 기반</h4>
                        <p class="text-yellow-700 text-sm">Munsell 색체계와 Von Kries 이론을 바탕으로 한 정확한 분석</p>
                    </div>
                    <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 text-center border border-green-200">
                        <div class="text-4xl mb-4">🎯</div>
                        <h4 class="font-bold text-green-800 mb-2">한국형 특화</h4>
                        <p class="text-green-700 text-sm">아시아 피부톤에 최적화된 12계절 분석 시스템</p>
                    </div>
                    <div class="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 text-center border border-purple-200">
                        <div class="text-4xl mb-4">📱</div>
                        <h4 class="font-bold text-purple-800 mb-2">모바일 최적화</h4>
                        <p class="text-purple-700 text-sm">터치와 스와이프 제스처로 편리한 분석 경험</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * 분석 모드 선택 처리
     */
    selectAnalysisMode(mode) {
        console.log('분석 모드 선택:', mode);
        
        this.analysisMode = mode;
        this.analysisData.mode = mode;
        
        if (mode === 'photo') {
            // 사진 기반 분석 (향후 구현)
            alert('사진 기반 분석은 곧 출시될 예정입니다. 현재는 전문가 드래이핑 진단을 이용해주세요.');
            return;
        } else if (mode === 'expert') {
            // 전문가 드래이핑으로 진행
            this.showStep(2);
        } else if (mode === 'advanced' && this.advancedMode) {
            // 고급 과학적 분석
            this.showAdvancedAnalysisStep();
        }
    }

    /**
     * 고급 분석 단계 표시
     */
    showAdvancedAnalysisStep() {
        const container = document.getElementById('step-content');
        if (!container) return;

        container.innerHTML = `
            <div class="max-w-4xl mx-auto">
                <div class="text-center mb-12">
                    <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                        🔬 고급 과학적 분석
                    </h2>
                    <p class="text-xl text-gray-600 mb-8">
                        CIE L*a*b* 측정과 전문가 드래이핑을 결합한 최첨단 분석
                    </p>
                </div>

                <!-- 분석 진행 단계 -->
                <div class="bg-white rounded-3xl shadow-xl p-8 mb-8">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <!-- 1단계: 색상 추출 -->
                        <div class="text-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 transition-colors cursor-pointer"
                             onclick="startColorExtraction()">
                            <div class="text-6xl mb-4">🎨</div>
                            <h3 class="text-xl font-bold mb-4">1단계: 색상 추출</h3>
                            <p class="text-gray-600 mb-4">피부 색상을 정밀 측정합니다</p>
                            <button class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
                                색상 추출 시작
                            </button>
                        </div>

                        <!-- 2단계: Lab 분석 -->
                        <div class="text-center p-6 bg-gray-50 rounded-xl">
                            <div class="text-6xl mb-4">🔬</div>
                            <h3 class="text-xl font-bold mb-4">2단계: Lab 분석</h3>
                            <p class="text-gray-500 mb-4">과학적 색상 분석 (자동)</p>
                            <div class="text-gray-400">색상 추출 후 진행</div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                        <!-- 3단계: 시각적 확인 -->
                        <div class="text-center p-6 bg-gray-50 rounded-xl">
                            <div class="text-6xl mb-4">👁️</div>
                            <h3 class="text-xl font-bold mb-4">3단계: 시각적 확인</h3>
                            <p class="text-gray-500 mb-4">드래이핑으로 검증</p>
                            <div class="text-gray-400">이전 단계 완료 후 진행</div>
                        </div>

                        <!-- 4단계: 제품 매칭 -->
                        <div class="text-center p-6 bg-gray-50 rounded-xl">
                            <div class="text-6xl mb-4">💄</div>
                            <h3 class="text-xl font-bold mb-4">4단계: 제품 매칭</h3>
                            <p class="text-gray-500 mb-4">파운데이션 추천</p>
                            <div class="text-gray-400">최종 분석 후 진행</div>
                        </div>
                    </div>
                </div>

                <!-- 임시 시연용 버튼 -->
                <div class="text-center">
                    <button onclick="runAdvancedDemo()" 
                            class="bg-emerald-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-emerald-700 transition-all duration-300">
                        🚀 고급 분석 시연하기
                    </button>
                </div>
            </div>
        `;

        // 전역 함수 등록
        window.startColorExtraction = this.startColorExtraction.bind(this);
        window.runAdvancedDemo = this.runAdvancedDemo.bind(this);
    }

    /**
     * 색상 추출 시작
     */
    startColorExtraction() {
        // 임시: 색상 입력 프롬프트
        const userInput = prompt('피부색을 RGB 값으로 입력하세요 (예: 240,220,180)');
        if (!userInput) return;

        try {
            const [r, g, b] = userInput.split(',').map(n => parseInt(n.trim()));
            if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
                this.analyzeColorWithLab(r, g, b);
            } else {
                alert('올바른 RGB 값을 입력해주세요 (0-255)');
            }
        } catch (error) {
            alert('RGB 형식이 올바르지 않습니다. 예: 240,220,180');
        }
    }

    /**
     * Lab 분석 실행
     */
    analyzeColorWithLab(r, g, b) {
        if (!window.ColorMeasurement) {
            alert('ColorMeasurement 모듈이 로드되지 않았습니다.');
            return;
        }

        const colorMeasurement = new window.ColorMeasurement();
        
        // RGB → Lab 변환
        const lab = colorMeasurement.rgbToLab(r, g, b);
        
        // Lab 기반 계절 분류
        const labResult = colorMeasurement.classifySeasonByLab(lab.L, lab.a, lab.b);
        
        // 결과 저장
        this.analysisData.labAnalysis = {
            rgb: { r, g, b },
            lab: lab,
            result: labResult,
            hex: colorMeasurement.rgbToHex(r, g, b)
        };

        console.log('Lab 분석 완료:', this.analysisData.labAnalysis);
        
        // 결과 표시
        this.showLabAnalysisResult();
    }

    /**
     * Lab 분석 결과 표시
     */
    showLabAnalysisResult() {
        const labData = this.analysisData.labAnalysis;
        
        const container = document.getElementById('step-content');
        container.innerHTML = `
            <div class="max-w-4xl mx-auto">
                <div class="text-center mb-12">
                    <h2 class="text-3xl font-bold text-gray-800 mb-6">
                        🔬 Lab 색상 분석 결과
                    </h2>
                </div>

                <!-- 분석 결과 -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <!-- 색상 정보 -->
                    <div class="bg-white rounded-3xl shadow-xl p-8">
                        <h3 class="text-xl font-bold mb-6 text-center">색상 정보</h3>
                        
                        <!-- 색상 샘플 -->
                        <div class="w-32 h-32 mx-auto mb-6 rounded-full border-4 border-gray-200 shadow-lg"
                             style="background: ${labData.hex};"
                             title="추출된 피부색"></div>
                        
                        <!-- RGB/Lab 값 -->
                        <div class="space-y-3">
                            <div class="flex justify-between">
                                <span class="font-medium">RGB:</span>
                                <span class="font-mono">(${labData.rgb.r}, ${labData.rgb.g}, ${labData.rgb.b})</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="font-medium">HEX:</span>
                                <span class="font-mono">${labData.hex}</span>
                            </div>
                            <hr>
                            <div class="flex justify-between">
                                <span class="font-medium">L* (명도):</span>
                                <span class="font-mono">${labData.lab.L}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="font-medium">a* (빨강-초록):</span>
                                <span class="font-mono">${labData.lab.a}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="font-medium">b* (노랑-파랑):</span>
                                <span class="font-mono">${labData.lab.b}</span>
                            </div>
                        </div>
                    </div>

                    <!-- 분석 결과 -->
                    <div class="bg-white rounded-3xl shadow-xl p-8">
                        <h3 class="text-xl font-bold mb-6 text-center">과학적 분석</h3>
                        
                        <div class="text-center mb-6">
                            <div class="text-4xl font-bold text-purple-600 mb-2">
                                ${labData.result.season}
                            </div>
                            <div class="text-xl text-gray-600 mb-4">
                                신뢰도: ${labData.result.confidence}%
                            </div>
                        </div>

                        <div class="space-y-3">
                            <div class="flex justify-between">
                                <span class="font-medium">온도감:</span>
                                <span class="capitalize">${labData.result.analysis.temperature === 'warm' ? '따뜻함' : '차가움'}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="font-medium">명도:</span>
                                <span class="capitalize">${labData.result.analysis.lightness === 'bright' ? '밝음' : labData.result.analysis.lightness === 'medium' ? '중간' : '깊음'}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="font-medium">채도:</span>
                                <span class="capitalize">${labData.result.analysis.chroma === 'high' ? '높음' : labData.result.analysis.chroma === 'medium' ? '중간' : '낮음'}</span>
                            </div>
                            <hr>
                            <div class="flex justify-between">
                                <span class="font-medium">권장사항:</span>
                                <span class="text-sm">${labData.result.recommendation === 'highly_recommended' ? '매우 신뢰' : labData.result.recommendation === 'recommended' ? '신뢰' : '재검토'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 다음 단계 버튼 -->
                <div class="text-center space-y-4">
                    <button onclick="proceedToFoundationMatching()" 
                            class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300">
                        💄 파운데이션 매칭 진행
                    </button>
                    <div>
                        <button onclick="app.showStep(3)" 
                                class="bg-gray-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-600 transition-all duration-200">
                            결과 확인하기
                        </button>
                    </div>
                </div>
            </div>
        `;

        // 전역 함수 등록
        window.proceedToFoundationMatching = this.proceedToFoundationMatching.bind(this);
    }

    /**
     * 파운데이션 매칭 진행
     */
    proceedToFoundationMatching() {
        if (!window.FoundationMatcher) {
            alert('FoundationMatcher 모듈이 로드되지 않았습니다.');
            return;
        }

        const labData = this.analysisData.labAnalysis;
        const foundationMatcher = new window.FoundationMatcher();

        // 파운데이션 추천
        const recommendations = foundationMatcher.recommendFoundations(
            labData.result.season,
            labData.lab,
            {
                priceRange: 'mid', // 기본값
                usage: 'daily'
            }
        );

        this.analysisData.foundationMatch = recommendations;
        this.showFoundationRecommendations();
    }

    /**
     * 파운데이션 추천 결과 표시
     */
    showFoundationRecommendations() {
        const recommendations = this.analysisData.foundationMatch;
        
        const container = document.getElementById('step-content');
        container.innerHTML = `
            <div class="max-w-6xl mx-auto">
                <div class="text-center mb-12">
                    <h2 class="text-3xl font-bold text-gray-800 mb-6">
                        💄 맞춤 파운데이션 추천
                    </h2>
                    <p class="text-xl text-gray-600">
                        당신의 피부색에 가장 적합한 제품들을 찾았습니다
                    </p>
                </div>

                <!-- 추천 제품 목록 -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    ${recommendations.map((product, index) => `
                        <div class="bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
                            <!-- 순위 배지 -->
                            <div class="flex justify-between items-start mb-4">
                                <span class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                                    ${index + 1}위 추천
                                </span>
                                <span class="text-2xl font-bold text-purple-600">${product.finalScore}점</span>
                            </div>
                            
                            <!-- 제품 정보 -->
                            <h3 class="text-lg font-bold mb-2">${product.name}</h3>
                            <p class="text-gray-600 mb-2">${product.shade}</p>
                            
                            <!-- 색상 미리보기 -->
                            <div class="w-full h-8 rounded-lg mb-4 border-2 border-gray-200" 
                                 style="background: ${product.hexColor};"
                                 title="제품 색상"></div>
                            
                            <!-- 상세 정보 -->
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-600">가격:</span>
                                    <span class="font-bold">${product.price.toLocaleString()}원</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">커버리지:</span>
                                    <span>${product.coverage}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">마감:</span>
                                    <span>${product.finish}</span>
                                </div>
                                ${product.labMatch ? `
                                <div class="flex justify-between">
                                    <span class="text-gray-600">색상 매칭:</span>
                                    <span class="font-bold text-green-600">${product.labMatch}%</span>
                                </div>
                                ` : ''}
                            </div>
                            
                            <!-- 추천 이유 -->
                            <div class="mt-4 p-3 bg-purple-50 rounded-lg">
                                <p class="text-sm text-purple-700">
                                    <strong>추천 이유:</strong> ${product.reason}
                                </p>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- 완료 버튼 -->
                <div class="text-center">
                    <button onclick="app.showStep(3)" 
                            class="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:from-green-700 hover:to-emerald-700 transition-all duration-300">
                        ✅ 최종 결과 보기
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * 고급 분석 시연
     */
    runAdvancedDemo() {
        // 샘플 데이터로 시연
        this.analyzeColorWithLab(240, 220, 180); // 일반적인 아시아 피부톤 샘플
    }
    
    /**
     * 드래이핑 분석 단계 생성
     */
    createDrapingAnalysisStep() {
        return `
            <div class="max-w-4xl mx-auto">
                <div class="text-center mb-12">
                    <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                        전문가급 드래이핑 진단
                    </h2>
                    <p class="text-xl text-gray-600 mb-8">
                        3단계 체계적 분석을 통해 당신만의 색상을 찾아보겠습니다
                    </p>
                    
                    <!-- 진행 단계 표시 -->
                    <div class="flex justify-center mb-12">
                        <div class="flex items-center space-x-4">
                            <div class="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">1</div>
                            <div class="w-16 h-1 bg-gray-200"></div>
                            <div class="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold">2</div>
                            <div class="w-16 h-1 bg-gray-200"></div>
                            <div class="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold">3</div>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-3xl shadow-xl p-8">
                    <h3 class="text-2xl font-bold text-center mb-8">1단계: 온도감 진단</h3>
                    <p class="text-gray-600 text-center mb-12">
                        따뜻한 색상과 차가운 색상 중 어떤 것이 더 잘 어울리는지 선택해주세요
                    </p>
                    
                    <!-- 온도감 색상 선택 -->
                    <div class="grid grid-cols-2 gap-8 mb-8">
                        <div class="text-center">
                            <h4 class="text-xl font-bold mb-6 text-orange-600">따뜻한 색상</h4>
                            <div class="grid grid-cols-2 gap-4">
                                ${this.generateColorOptions('warm')}
                            </div>
                        </div>
                        
                        <div class="text-center">
                            <h4 class="text-xl font-bold mb-6 text-blue-600">차가운 색상</h4>
                            <div class="grid grid-cols-2 gap-4">
                                ${this.generateColorOptions('cool')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="text-center">
                        <button onclick="app.showStep(3)" 
                                class="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:from-purple-700 hover:to-blue-700 transition-all duration-300">
                            결과 보기 (임시)
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * 색상 옵션 생성
     */
    generateColorOptions(type) {
        const colors = window.SIMPLE_COLORS && window.SIMPLE_COLORS[type] 
            ? window.SIMPLE_COLORS[type] 
            : this.getDefaultColors(type);
            
        return colors.map(colorData => `
            <div class="cursor-pointer touch-target transform hover:scale-105 transition-all duration-200"
                 onclick="selectColor('temperature', '${type}', '${colorData.name}', ${JSON.stringify(colorData).replace(/"/g, '&quot;')})">
                <div class="w-full h-24 rounded-xl shadow-md mb-3" 
                     style="background: ${colorData.color};"
                     title="${colorData.description}">
                </div>
                <p class="text-sm font-medium text-gray-700">${colorData.name}</p>
            </div>
        `).join('');
    }
    
    /**
     * 기본 색상 제공 (데이터가 없을 경우)
     */
    getDefaultColors(type) {
        if (type === 'warm') {
            return [
                { name: '골든 옐로우', color: '#FFD700', description: '따뜻한 황금색' },
                { name: '코랄 오렌지', color: '#FF7F50', description: '산호색 오렌지' },
                { name: '피치', color: '#FFCBA4', description: '복숭아색' },
                { name: '올리브', color: '#8FBC8F', description: '따뜻한 올리브' }
            ];
        } else {
            return [
                { name: '아이시 핑크', color: '#FF1493', description: '차가운 핑크' },
                { name: '로얄 블루', color: '#4169E1', description: '깊은 파란색' },
                { name: '에메랄드', color: '#50C878', description: '청록색' },
                { name: '라벤더', color: '#E6E6FA', description: '연한 보라색' }
            ];
        }
    }
    
    /**
     * 결과 단계 생성
     */
    createResultsStep() {
        // Lab 분석 결과가 있으면 고급 결과 표시
        if (this.analysisData.labAnalysis) {
            return this.createAdvancedResults();
        }
        
        // 기본 결과 표시
        return this.createBasicResults();
    }

    /**
     * 기본 결과 생성
     */
    createBasicResults() {
        // 임시 결과 (실제로는 분석 결과 기반)
        const season = 'Spring Light';
        const seasonData = window.SEASONS && window.SEASONS[season] ? window.SEASONS[season] : {
            name: season,
            korean: '봄 라이트',
            characteristics: '밝고 따뜻한 톤',
            bestColors: ['#FFE5B4', '#FFD700', '#FFB6C1', '#98FB98'],
            description: '밝고 화사한 색상이 잘 어울리는 타입입니다.'
        };
        
        return `
            <div class="max-w-4xl mx-auto">
                <div class="text-center mb-12">
                    <div class="w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mx-auto mb-8 flex items-center justify-center">
                        <span class="text-6xl">🎉</span>
                    </div>
                    
                    <h2 class="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                        진단 완료!
                    </h2>
                    
                    <div class="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                        ${seasonData.korean || seasonData.name}
                    </div>
                    
                    <p class="text-xl text-gray-600 mb-8">
                        ${seasonData.characteristics}
                    </p>
                </div>
                
                <!-- 추천 컬러 팔레트 -->
                <div class="bg-white rounded-3xl shadow-xl p-8 mb-8">
                    <h3 class="text-2xl font-bold text-center mb-8">🎨 추천 컬러 팔레트</h3>
                    <div class="flex justify-center space-x-4 mb-8">
                        ${seasonData.bestColors.map(color => `
                            <div class="w-20 h-20 rounded-full shadow-lg border-4 border-white" 
                                 style="background: ${color};"
                                 title="${color}">
                            </div>
                        `).join('')}
                    </div>
                    
                    <p class="text-gray-600 text-center leading-relaxed">
                        ${seasonData.description}
                    </p>
                </div>
                
                <!-- 액션 버튼들 -->
                <div class="flex flex-col items-center space-y-4">
                    <div class="flex space-x-4">
                        <button onclick="shareResults()" 
                                class="bg-green-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-600 transition-all duration-200">
                            📱 결과 공유하기
                        </button>
                        <button onclick="exportToPDF()" 
                                class="bg-blue-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-600 transition-all duration-200">
                            📄 PDF로 저장
                        </button>
                    </div>
                    
                    <button onclick="resetApp()" 
                            class="bg-gray-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-600 transition-all duration-200">
                        🔄 다시 진단하기
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * 고급 분석 결과 생성
     */
    createAdvancedResults() {
        const labData = this.analysisData.labAnalysis;
        const foundationData = this.analysisData.foundationMatch;
        const seasonData = window.SEASONS && window.SEASONS[labData.result.season] 
            ? window.SEASONS[labData.result.season] 
            : { korean: labData.result.season, characteristics: '과학적으로 분석된 타입' };

        return `
            <div class="max-w-6xl mx-auto">
                <!-- 메인 결과 헤더 -->
                <div class="text-center mb-12">
                    <div class="w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full mx-auto mb-8 flex items-center justify-center">
                        <span class="text-6xl">🔬</span>
                    </div>
                    
                    <h2 class="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                        과학적 진단 완료!
                    </h2>
                    
                    <div class="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">
                        ${seasonData.korean || labData.result.season}
                    </div>
                    
                    <div class="flex justify-center items-center space-x-8 mb-8">
                        <div class="text-center">
                            <div class="text-3xl font-bold text-emerald-600">${labData.result.confidence}%</div>
                            <div class="text-sm text-gray-600">과학적 정확도</div>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-teal-600">Lab</div>
                            <div class="text-sm text-gray-600">CIE 색공간</div>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-blue-600">${foundationData ? foundationData.length : 0}</div>
                            <div class="text-sm text-gray-600">매칭 제품</div>
                        </div>
                    </div>
                </div>

                <!-- 종합 분석 결과 -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    
                    <!-- 과학적 측정 결과 -->
                    <div class="bg-white rounded-3xl shadow-xl p-8">
                        <h3 class="text-xl font-bold mb-6 text-center flex items-center justify-center">
                            <span class="text-2xl mr-2">🔬</span>
                            Lab 색상 분석
                        </h3>
                        
                        <!-- 측정된 색상 -->
                        <div class="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-gray-200 shadow-lg"
                             style="background: ${labData.hex};"
                             title="측정된 피부색"></div>
                        
                        <div class="space-y-3 text-sm">
                            <div class="bg-gray-50 p-3 rounded-lg">
                                <div class="flex justify-between mb-1">
                                    <span>L* (명도):</span>
                                    <span class="font-bold">${labData.lab.L}</span>
                                </div>
                                <div class="flex justify-between mb-1">
                                    <span>a* (빨강-초록):</span>
                                    <span class="font-bold">${labData.lab.a}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>b* (노랑-파랑):</span>
                                    <span class="font-bold">${labData.lab.b}</span>
                                </div>
                            </div>
                            
                            <div class="text-center">
                                <div class="text-lg font-bold text-emerald-600">
                                    ${labData.result.analysis.temperature === 'warm' ? '따뜻한' : '차가운'} • 
                                    ${labData.result.analysis.lightness === 'bright' ? '밝은' : labData.result.analysis.lightness === 'medium' ? '중간' : '깊은'} • 
                                    ${labData.result.analysis.chroma === 'high' ? '높은' : labData.result.analysis.chroma === 'medium' ? '중간' : '낮은'} 채도
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 추천 컬러 팔레트 -->
                    <div class="bg-white rounded-3xl shadow-xl p-8">
                        <h3 class="text-xl font-bold mb-6 text-center flex items-center justify-center">
                            <span class="text-2xl mr-2">🎨</span>
                            추천 컬러
                        </h3>
                        
                        <div class="grid grid-cols-2 gap-4 mb-6">
                            ${seasonData.bestColors ? seasonData.bestColors.slice(0, 4).map(color => `
                                <div class="flex flex-col items-center">
                                    <div class="w-16 h-16 rounded-lg shadow-md border-2 border-white mb-2" 
                                         style="background: ${color};"
                                         title="${color}"></div>
                                    <span class="text-xs text-gray-600 font-mono">${color}</span>
                                </div>
                            `).join('') : `
                                <div class="col-span-2 text-center text-gray-500">
                                    컬러 팔레트 로딩 중...
                                </div>
                            `}
                        </div>
                        
                        <div class="text-center text-sm text-gray-600">
                            과학적으로 검증된 최적 색상들
                        </div>
                    </div>

                    <!-- 신뢰도 분석 -->
                    <div class="bg-white rounded-3xl shadow-xl p-8">
                        <h3 class="text-xl font-bold mb-6 text-center flex items-center justify-center">
                            <span class="text-2xl mr-2">📊</span>
                            신뢰도 분석
                        </h3>
                        
                        <!-- 신뢰도 게이지 -->
                        <div class="relative w-32 h-32 mx-auto mb-6">
                            <svg class="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                                <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" stroke-width="10"/>
                                <circle cx="60" cy="60" r="50" fill="none" 
                                        stroke="${labData.result.confidence >= 90 ? '#10b981' : labData.result.confidence >= 75 ? '#f59e0b' : '#ef4444'}" 
                                        stroke-width="10"
                                        stroke-dasharray="${2 * Math.PI * 50}"
                                        stroke-dashoffset="${2 * Math.PI * 50 * (1 - labData.result.confidence / 100)}"
                                        stroke-linecap="round"/>
                            </svg>
                            <div class="absolute inset-0 flex items-center justify-center">
                                <span class="text-2xl font-bold">${labData.result.confidence}%</span>
                            </div>
                        </div>
                        
                        <div class="text-center space-y-2">
                            <div class="text-lg font-bold ${labData.result.confidence >= 90 ? 'text-green-600' : labData.result.confidence >= 75 ? 'text-yellow-600' : 'text-red-600'}">
                                ${labData.result.confidence >= 90 ? '매우 높음' : labData.result.confidence >= 75 ? '높음' : '보통'}
                            </div>
                            <div class="text-sm text-gray-600">
                                ${labData.result.recommendation === 'highly_recommended' ? '매우 신뢰할 수 있는 결과' : 
                                  labData.result.recommendation === 'recommended' ? '신뢰할 수 있는 결과' : '추가 검토 권장'}
                            </div>
                        </div>
                    </div>
                </div>

                ${foundationData && foundationData.length > 0 ? `
                <!-- 맞춤 제품 추천 -->
                <div class="bg-white rounded-3xl shadow-xl p-8 mb-8">
                    <h3 class="text-2xl font-bold mb-8 text-center flex items-center justify-center">
                        <span class="text-3xl mr-3">💄</span>
                        맞춤 파운데이션 추천 (상위 3개)
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        ${foundationData.slice(0, 3).map((product, index) => `
                            <div class="border-2 ${index === 0 ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'} rounded-2xl p-6">
                                ${index === 0 ? '<div class="text-center mb-4"><span class="bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-bold">🏆 최고 추천</span></div>' : ''}
                                
                                <h4 class="font-bold text-lg mb-2">${product.name}</h4>
                                <p class="text-gray-600 mb-3">${product.shade}</p>
                                
                                <!-- 색상 미리보기 -->
                                <div class="w-full h-6 rounded-lg mb-4 border border-gray-200" 
                                     style="background: ${product.hexColor};"
                                     title="제품 색상"></div>
                                
                                <div class="space-y-2 text-sm">
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">매칭 점수:</span>
                                        <span class="font-bold text-emerald-600">${product.finalScore}점</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">가격:</span>
                                        <span class="font-bold">${product.price.toLocaleString()}원</span>
                                    </div>
                                    ${product.labMatch ? `
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">색상 일치:</span>
                                        <span class="font-bold text-purple-600">${product.labMatch}%</span>
                                    </div>
                                    ` : ''}
                                </div>
                                
                                <div class="mt-4 p-3 bg-gray-50 rounded-lg">
                                    <p class="text-xs text-gray-700">${product.reason}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <!-- 액션 버튼들 -->
                <div class="flex flex-col items-center space-y-6">
                    <div class="flex flex-wrap justify-center gap-4">
                        <button onclick="shareAdvancedResults()" 
                                class="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition-all duration-200">
                            📱 고급 결과 공유
                        </button>
                        <button onclick="exportAdvancedPDF()" 
                                class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200">
                            📊 상세 리포트 다운로드
                        </button>
                    </div>
                    
                    <button onclick="resetApp()" 
                            class="bg-gray-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-600 transition-all duration-200">
                        🔄 새로운 진단 시작
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * 색상 선택 처리
     */
    selectColor(step, type, colorName, colorData) {
        console.log(`색상 선택: ${step}, ${type}, ${colorName}`);
        
        // 선택 데이터 저장
        if (!this.analysisData.selectedColors[step]) {
            this.analysisData.selectedColors[step] = {};
        }
        this.analysisData.selectedColors[step][type] = { colorName, colorData };
        
        // 임시: 바로 결과 단계로
        setTimeout(() => {
            this.showStep(3);
        }, 500);
    }
    
    /**
     * 네비게이션 버튼 업데이트
     */
    updateNavigationButtons() {
        const backBtn = document.getElementById('thumbBackBtn');
        const homeBtn = document.getElementById('thumbHomeBtn');
        
        if (backBtn) {
            backBtn.style.display = this.currentStep > 0 ? 'block' : 'none';
        }
        
        if (homeBtn) {
            homeBtn.style.display = 'block';
        }
    }
    
    /**
     * 뒤로가기
     */
    goBack() {
        if (this.isModalOpen()) {
            this.closeModal();
            return;
        }
        
        if (this.currentStep > 0) {
            this.showStep(this.currentStep - 1);
        }
    }
    
    /**
     * 앱 초기화 (홈으로)
     */
    resetApp() {
        console.log('앱 초기화');
        
        // 데이터 초기화
        this.currentStep = 0;
        this.analysisMode = null;
        this.currentDrapingStep = 'temperature';
        this.analysisData = {
            mode: null,
            results: {},
            selectedColors: {},
            finalSeason: null,
            confidence: 0
        };
        
        // 첫 단계로
        this.showStep(0);
    }
    
    /**
     * 결과 공유
     */
    shareResults() {
        const shareData = {
            title: '퍼스널컬러 진단 결과',
            text: `나의 퍼스널컬러는 ${this.analysisData.finalSeason || 'Spring Light'}입니다!`,
            url: window.location.href
        };
        
        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            navigator.share(shareData).catch(console.error);
        } else if (navigator.clipboard) {
            const shareText = `${shareData.text} ${shareData.url}`;
            navigator.clipboard.writeText(shareText).then(() => {
                alert('결과가 클립보드에 복사되었습니다!');
            }).catch(() => {
                alert('공유 기능을 사용할 수 없습니다.');
            });
        }
    }
    
    /**
     * PDF 내보내기
     */
    exportToPDF() {
        alert('PDF 내보내기 기능은 곧 추가될 예정입니다.');
    }
    
    /**
     * 모달 상태 확인
     */
    isModalOpen() {
        const fullscreenModal = document.getElementById('fullscreenModal');
        const expertModal = document.getElementById('expertManualModal');
        
        return (fullscreenModal && !fullscreenModal.classList.contains('hidden')) ||
               (expertModal && !expertModal.classList.contains('hidden'));
    }
    
    /**
     * 모달 닫기
     */
    closeModal() {
        if (window.FullscreenDraping && window.FullscreenDraping.hide) {
            window.FullscreenDraping.hide();
        }
        if (window.ExpertManual && window.ExpertManual.hide) {
            window.ExpertManual.hide();
        }
    }
    
    /**
     * 오류 표시
     */
    showError(message) {
        console.error('오류:', message);
        alert(message);
    }
}

// 전역 함수들 (HTML에서 직접 호출)
function selectMode(mode) {
    if (window.app) {
        window.app.selectAnalysisMode(mode);
    }
}

function selectColor(step, type, colorName, colorData) {
    if (window.app) {
        window.app.selectColor(step, type, colorName, colorData);
    }
}

function goBack() {
    if (window.app) {
        window.app.goBack();
    }
}

function resetApp() {
    if (window.app) {
        window.app.resetApp();
    }
}

function exportToPDF() {
    if (window.app) {
        window.app.exportToPDF();
    }
}

function shareResults() {
    if (window.app) {
        window.app.shareResults();
    }
}

function shareAdvancedResults() {
    if (window.app && window.app.analysisData.labAnalysis) {
        const labData = window.app.analysisData.labAnalysis;
        const shareData = {
            title: '고급 퍼스널컬러 과학적 진단 결과',
            text: `🔬 Lab 측정으로 ${labData.result.season} (신뢰도 ${labData.result.confidence}%) 판정! 과학적 근거로 완벽 분석 완료 💄`,
            url: window.location.href
        };
        
        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            navigator.share(shareData).catch(console.error);
        } else if (navigator.clipboard) {
            const shareText = `${shareData.text} ${shareData.url}`;
            navigator.clipboard.writeText(shareText).then(() => {
                alert('고급 분석 결과가 클립보드에 복사되었습니다!');
            }).catch(() => {
                alert('공유 기능을 사용할 수 없습니다.');
            });
        }
    } else {
        shareResults(); // 기본 공유로 폴백
    }
}

function exportAdvancedPDF() {
    if (window.app && window.app.analysisData.labAnalysis) {
        alert('🔬 Lab 측정 데이터와 파운데이션 매칭 정보가 포함된 상세 리포트 PDF 다운로드 기능은 곧 추가될 예정입니다.');
    } else {
        exportToPDF();
    }
}

function showExpertManual() {
    if (window.ExpertManual && window.ExpertManual.show) {
        window.ExpertManual.show();
    }
}

function enterFullscreenDraping(colorData) {
    if (window.FullscreenDraping && window.FullscreenDraping.show) {
        window.FullscreenDraping.show(colorData);
    }
}

// 앱 인스턴스 생성 및 초기화
let app = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 로드 완료 - 앱 초기화 시작');
    
    try {
        app = new PersonalColorAnalyzer();
        window.app = app; // 전역 접근을 위해
        console.log('앱 인스턴스 생성 완료');
    } catch (error) {
        console.error('앱 초기화 실패:', error);
        alert('애플리케이션을 초기화하는 중 오류가 발생했습니다. 페이지를 새로고침해주세요.');
    }
});

// 전역 오류 핸들러
window.addEventListener('error', function(e) {
    console.error('전역 JavaScript 오류:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('처리되지 않은 Promise 거부:', e.reason);
});

console.log('app.js 로딩 완료');
