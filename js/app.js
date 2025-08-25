// js/app.js - 메인 애플리케이션 로직

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
        this.analysisData = {
            mode: null,
            results: {},
            selectedColors: {},
            finalSeason: null,
            confidence: 0
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
        const required = [
            'SEASON_DATA',
            'DRAPING_COLORS',
            'COLOR_HEX_MAP',
            'SIMPLE_COLORS'
        ];
        
        const missing = required.filter(dep => !window[dep]);
        
        if (missing.length > 0) {
            throw new Error(`필수 데이터가 누락되었습니다: ${missing.join(', ')}`);
        }
        
        console.log('모든 의존성 확인 완료');
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
                    
                    <h2 class="mega-font-sm text-gray-800 mb-6 font-bold">
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
                    <h2 class="mega-font-sm text-gray-800 mb-6 font-bold">진단 방식을 선택하세요</h2>
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
            alert('사진 기반 분석은 곧 출시될 예정입니다. 현재는 전문가 드래이핑 진단만 이용 가능합니다.');
            return;
        } else if (mode === 'expert') {
            // 전문가 드래이핑으로 진행
            this.showStep(2);
        }
    }
    
    /**
     * 드래이핑 분석 단계 생성
     */
    createDrapingAnalysisStep() {
        const stepMap = {
            'temperature
