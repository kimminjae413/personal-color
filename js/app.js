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
            console.warn('일부 기본 데이터가 누락되었습니다:', missing.join(', '));
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
        console.log('단계', stepNumber, '표시');
        
        try {
            this.currentStep = stepNumber;
            
            // 브라우저 히스토리 업데이트
            const stateObj = { step: stepNumber };
            const title = '퍼스널컬러 진단 - 단계 ' + (stepNumber + 1);
            const url = '#step-' + stepNumber;
            
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
                throw new Error('단계 ' + stepNumber + '에 대한 콘텐츠가 없습니다.');
            }
            
            // 네비게이션 버튼 상태 업데이트
            this.updateNavigationButtons();
            
        } catch (error) {
            console.error('단계 표시 오류:', error);
            this.showError('단계 ' + stepNumber + '를 표시하는 중 오류가 발생했습니다.');
        }
    }
    
    /**
     * 환영 단계 생성 - 태블릿 최적화
     */
    createWelcomeStep() {
        return `
            <div class="text-center max-w-6xl mx-auto px-4">
                <div class="mb-8">
                    <div class="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
                        <svg class="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"></path>
                        </svg>
                    </div>
                    
                    <h2 class="text-3xl md:text-4xl lg:text-5xl text-gray-800 mb-4 font-bold">
                        당신만의 색을 찾아보세요
                    </h2>
                    
                    <p class="text-lg text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
                        과학적 드래이핑 분석으로 당신에게 가장 어울리는 색상을 찾아드립니다
                    </p>
                </div>
                
                <!-- 간단한 기능 소개 - 태블릿 최적화 -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
                    <div class="bg-white rounded-2xl shadow-md p-4 text-center">
                        <div class="text-3xl mb-2">🔬</div>
                        <h3 class="text-lg font-bold text-gray-800 mb-1">과학적 분석</h3>
                        <p class="text-sm text-gray-600">Munsell 색체계 기반</p>
                    </div>
                    
                    <div class="bg-white rounded-2xl shadow-md p-4 text-center">
                        <div class="text-3xl mb-2">📱</div>
                        <h3 class="text-lg font-bold text-gray-800 mb-1">태블릿 최적화</h3>
                        <p class="text-sm text-gray-600">직관적인 터치 UX</p>
                    </div>
                    
                    <div class="bg-white rounded-2xl shadow-md p-4 text-center">
                        <div class="text-3xl mb-2">⭐</div>
                        <h3 class="text-lg font-bold text-gray-800 mb-1">92% 정확도</h3>
                        <p class="text-sm text-gray-600">전문가급 진단</p>
                    </div>
                </div>
                
                <!-- 시작 버튼 -->
                <div class="text-center mb-8">
                    <button onclick="app.showStep(1)" 
                            class="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-10 py-4 rounded-xl text-xl font-bold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl touch-target">
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
        const advancedModeCard = this.advancedMode ? `
            <!-- 고급 과학적 분석 -->
            <article class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl shadow-xl p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 touch-target group border border-emerald-200"
                     onclick="selectMode('advanced')"
                     role="button"
                     tabindex="0"
                     aria-label="고급 과학적 분석 선택">
                <div class="text-center">
                    <div class="bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full p-6 w-24 h-24 mx-auto mb-8 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <svg class="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                             aria-label="사진 기반 AI 분석 선택">
                        <div class="text-center">
                            <div class="bg-gradient-to-br from-blue-100 to-blue-200 rounded-full p-6 w-24 h-24 mx-auto mb-8 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                <svg class="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                             aria-label="전문가급 드래이핑 진단 선택">
                        <div class="text-center">
                            <div class="bg-gradient-to-br from-purple-100 to-purple-200 rounded-full p-6 w-24 h-24 mx-auto mb-8 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                <svg class="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            const rgbValues = userInput.split(',').map(n => parseInt(n.trim()));
            const r = rgbValues[0];
            const g = rgbValues[1]; 
            const b = rgbValues[2];
            
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
            rgb: { r: r, g: g, b: b },
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
     * 드래이핑 분석 단계 생성 - 3단계 완전 진단
     */
    createDrapingAnalysisStep() {
        const stepTitles = {
            'temperature': '1단계: 온도감 진단',
            'brightness': '2단계: 명도 진단', 
            'saturation': '3단계: 채도 진단'
        };
        
        const stepDescriptions = {
            'temperature': '따뜻한 색상과 차가운 색상 중 어떤 것이 더 잘 어울리는지 선택해주세요',
            'brightness': '밝은 색상과 깊은 색상 중 어떤 것이 더 어울리는지 선택해주세요',
            'saturation': '선명한 색상과 부드러운 색상 중 어떤 것이 더 어울리는지 선택해주세요'
        };
        
        const stepNumber = this.getStepNumber(this.currentDrapingStep);
        
        return `
            <div class="max-w-5xl mx-auto px-4">
                <div class="text-center mb-8">
                    <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                        전문가급 드래이핑 진단
                    </h2>
                    <p class="text-lg text-gray-600 mb-6">
                        3단계 체계적 분석을 통해 당신만의 색상을 찾아보겠습니다
                    </p>
                    
                    <!-- 진행 단계 표시 -->
                    <div class="flex justify-center mb-8">
                        <div class="flex items-center space-x-3">
                            ${[1, 2, 3].map(num => `
                                <div class="flex items-center">
                                    <div class="w-8 h-8 rounded-full ${num <= stepNumber ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'} flex items-center justify-center font-bold text-sm">
                                        ${num}
                                    </div>
                                    ${num < 3 ? `<div class="w-12 h-0.5 ${num < stepNumber ? 'bg-purple-600' : 'bg-gray-200'}"></div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h3 class="text-xl font-bold text-center mb-2">${stepTitles[this.currentDrapingStep]}</h3>
                    <p class="text-gray-600 text-center mb-8">
                        ${stepDescriptions[this.currentDrapingStep]}
                    </p>
                    
                    <!-- 색상 선택 영역 -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        ${this.generateDrapingColorGroups()}
                    </div>
                </div>
                
                <!-- 진행 상황 -->
                <div class="text-center text-sm text-gray-500">
                    단계 ${stepNumber}/3 진행 중
                </div>
            </div>
        `;
    }
    
    /**
     * 현재 드래이핑 단계의 숫자 반환
     */
    getStepNumber(step) {
        const stepMap = { 'temperature': 1, 'brightness': 2, 'saturation': 3 };
        return stepMap[step] || 1;
    }
    
    /**
     * 드래이핑 색상 그룹 생성 - 개선된 버전
     */
    generateDrapingColorGroups() {
        if (this.currentDrapingStep === 'temperature') {
            return `
                <div class="text-center">
                    <h4 class="text-lg font-bold mb-6 text-orange-600 flex items-center justify-center">
                        <span class="text-2xl mr-2">🔥</span> 따뜻한 색상
                    </h4>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        ${this.generateColorOptions('warm')}
                    </div>
                </div>
                
                <div class="text-center">
                    <h4 class="text-lg font-bold mb-6 text-blue-600 flex items-center justify-center">
                        <span class="text-2xl mr-2">❄️</span> 차가운 색상
                    </h4>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        ${this.generateColorOptions('cool')}
                    </div>
                </div>
            `;
        } else if (this.currentDrapingStep === 'brightness') {
            return `
                <div class="text-center">
                    <h4 class="text-lg font-bold mb-6 text-yellow-600 flex items-center justify-center">
                        <span class="text-2xl mr-2">☀️</span> 밝은 색상
                    </h4>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        ${this.generateColorOptions('bright')}
                    </div>
                </div>
                
                <div class="text-center">
                    <h4 class="text-lg font-bold mb-6 text-gray-700 flex items-center justify-center">
                        <span class="text-2xl mr-2">🌙</span> 깊은 색상
                    </h4>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        ${this.generateColorOptions('deep')}
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="text-center">
                    <h4 class="text-lg font-bold mb-6 text-red-600 flex items-center justify-center">
                        <span class="text-2xl mr-2">✨</span> 선명한 색상
                    </h4>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        ${this.generateColorOptions('vivid')}
                    </div>
                </div>
                
                <div class="text-center">
                    <h4 class="text-lg font-bold mb-6 text-purple-600 flex items-center justify-center">
                        <span class="text-2xl mr-2">🌸</span> 부드러운 색상
                    </h4>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        ${this.generateColorOptions('muted')}
                    </div>
                </div>
            `;
        }
    }
    
    /**
     * 색상 옵션 생성 - 완전히 개선된 버전
     */
    generateColorOptions(type) {
        const colors = this.getColorsForType(type);
            
        return colors.map(colorData => `
            <div class="cursor-pointer transform hover:scale-105 transition-all duration-200 touch-target"
                 onclick="selectColor('${this.currentDrapingStep}', '${type}', '${colorData.name}', ${JSON.stringify(colorData).replace(/"/g, '&quot;')})">
                <div class="w-full aspect-square rounded-xl shadow-lg mb-2 relative overflow-hidden border-2 border-gray-200 hover:border-purple-400 transition-colors" 
                     style="background: linear-gradient(135deg, ${colorData.color}, ${colorData.shadow || colorData.color});"
                     title="${colorData.description}">
                    <!-- 색상 이름을 박스 안에 표시 -->
                    <div class="absolute inset-0 flex items-end p-2">
                        <div class="bg-black bg-opacity-60 text-white text-xs font-medium px-2 py-1 rounded backdrop-blur-sm">
                            ${colorData.name}
                        </div>
                    </div>
                    <!-- 선택 효과 -->
                    <div class="absolute inset-0 bg-purple-500 bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 rounded-xl"></div>
                </div>
            </div>
        `).join('');
    }
    
    /**
     * 타입별 색상 데이터 제공 - 확장된 버전
     */
    getColorsForType(type) {
        const colorSets = {
            // 온도감 - 1단계
            'warm': [
                { name: '골든 옐로우', color: '#FFD700', shadow: '#E6C200', description: '따뜻한 황금색' },
                { name: '코랄 오렌지', color: '#FF7F50', shadow: '#E6723D', description: '산호색 오렌지' },
                { name: '피치', color: '#FFCBA4', shadow: '#E6B891', description: '복숭아색' },
                { name: '올리브', color: '#8FBC8F', shadow: '#7CA97C', description: '따뜻한 올리브' }
            ],
            'cool': [
                { name: '아이시 핑크', color: '#FF1493', shadow: '#E60080', description: '차가운 핑크' },
                { name: '로얄 블루', color: '#4169E1', shadow: '#365FCE', description: '깊은 파란색' },
                { name: '에메랄드', color: '#50C878', shadow: '#47B56A', description: '청록색' },
                { name: '라벤더', color: '#E6E6FA', shadow: '#D3D3E7', description: '연한 보라색' }
            ],
            
            // 명도 - 2단계
            'bright': [
                { name: '라이트 핑크', color: '#FFB6C1', shadow: '#E6A3AE', description: '밝은 핑크' },
                { name: '스카이 블루', color: '#87CEEB', shadow: '#74BBD8', description: '하늘색' },
                { name: '민트', color: '#98FB98', shadow: '#85E885', description: '밝은 민트' },
                { name: '레몬 옐로우', color: '#FFFACD', shadow: '#E6E7BA', description: '연한 노랑' }
            ],
            'deep': [
                { name: '딥 레드', color: '#8B0000', shadow: '#780000', description: '깊은 빨강' },
                { name: '네이비', color: '#000080', shadow: '#000070', description: '진한 남색' },
                { name: '포레스트', color: '#228B22', shadow: '#1F7B1F', description: '숲의 초록' },
                { name: '퍼플', color: '#800080', shadow: '#700070', description: '진한 보라' }
            ],
            
            // 채도 - 3단계  
            'vivid': [
                { name: '비비드 레드', color: '#FF0000', shadow: '#E60000', description: '선명한 빨강' },
                { name: '일렉트릭 블루', color: '#0080FF', shadow: '#0073E6', description: '전기 파랑' },
                { name: '라임', color: '#00FF00', shadow: '#00E600', description: '선명한 초록' },
                { name: '마젠타', color: '#FF00FF', shadow: '#E600E6', description: '선명한 자홍' }
            ],
            'muted': [
                { name: '더스티 로즈', color: '#BC9A9A', shadow: '#A98787', description: '부드러운 장미색' },
                { name: '세이지', color: '#9CAF88', shadow: '#899C75', description: '회색빛 초록' },
                { name: '슬레이트', color: '#708090', shadow: '#5D6D7D', description: '슬레이트 회색' },
                { name: '모브', color: '#E0B4D6', shadow: '#CDA1C3', description: '부드러운 보라' }
            ]
        };
        
        return colorSets[type] || [];
    }
    
    /**
     * 색상 선택 처리 - 3단계 진행 시스템
     */
    selectColor(step, type, colorName, colorData) {
        console.log('색상 선택:', step, type, colorName);
        
        // 분석 데이터 저장
        if (!this.analysisData.selectedColors[step]) {
            this.analysisData.selectedColors[step] = {};
        }
        this.analysisData.selectedColors[step][type] = {
            name: colorName,
            data: colorData
        };
        
        // 선택 피드백 표시
        this.showColorSelectionFeedback(colorName);
        
        // 다음 단계로 진행
        setTimeout(() => {
            this.proceedToNextDrapingStep();
        }, 800);
    }
    
    /**
     * 다음 드래이핑 단계로 진행
     */
    proceedToNextDrapingStep() {
        if (this.currentDrapingStep === 'temperature') {
            this.currentDrapingStep = 'brightness';
            this.showStep(2); // 2단계로 다시 렌더링
        } else if (this.currentDrapingStep === 'brightness') {
            this.currentDrapingStep = 'saturation';
            this.showStep(2); // 3단계로 다시 렌더링
        } else {
            // 모든 단계 완료 - 결과 분석
            this.analyzeDrapingResults();
            this.showStep(3);
        }
    }
    
    /**
     * 드래이핑 결과 분석
     */
    analyzeDrapingResults() {
        console.log('드래이핑 결과 분석:', this.analysisData.selectedColors);
        
        // 간단한 분석 로직
        let season = 'Spring Light';
        let confidence = 85;
        
        // 온도감 분석
        const tempSelection = this.analysisData.selectedColors['temperature'];
        const isWarm = tempSelection && (tempSelection['warm'] !== undefined);
        
        // 명도 분석  
        const brightSelection = this.analysisData.selectedColors['brightness'];
        const isBright = brightSelection && (brightSelection['bright'] !== undefined);
        
        // 채도 분석
        const satSelection = this.analysisData.selectedColors['saturation'];
        const isVivid = satSelection && (satSelection['vivid'] !== undefined);
        
        // 계절 결정 로직
        if (isWarm && isBright && isVivid) {
            season = 'Spring Bright';
            confidence = 94;
        } else if (isWarm && isBright && !isVivid) {
            season = 'Spring Light';
            confidence = 92;
        } else if (isWarm && !isBright && isVivid) {
            season = 'Autumn Deep';
            confidence = 90;
        } else if (isWarm && !isBright && !isVivid) {
            season = 'Autumn Muted';
            confidence = 88;
        } else if (!isWarm && isBright && isVivid) {
            season = 'Winter Clear';
            confidence = 93;
        } else if (!isWarm && isBright && !isVivid) {
            season = 'Summer Light';
            confidence = 91;
        } else if (!isWarm && !isBright && isVivid) {
            season = 'Winter Deep';
            confidence = 89;
        } else {
            season = 'Summer Muted';
            confidence = 87;
        }
        
        this.analysisData.finalSeason = season;
        this.analysisData.confidence = confidence;
        
        console.log('분석 완료:', season, confidence + '%');
    }
    
    /**
     * 색상 선택 피드백 표시
     */
    showColorSelectionFeedback(colorName) {
        // 간단한 피드백 표시
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        toast.textContent = `${colorName} 선택됨`;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 2000);
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
     * 기본 결과 생성 - 깊이있는 분석 포함
     */
    createBasicResults() {
        const season = this.analysisData.finalSeason || 'Spring Light';
        const seasonData = this.getDetailedSeasonData(season);
        
        return `
            <div class="max-w-6xl mx-auto px-4">
                <div class="text-center mb-8">
                    <div class="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <span class="text-4xl">🎉</span>
                    </div>
                    
                    <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                        진단 완료!
                    </h2>
                    
                    <div class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                        ${seasonData.korean}
                    </div>
                    
                    <p class="text-lg text-gray-600 mb-6">
                        ${seasonData.characteristics}
                    </p>
                    
                    <div class="bg-gray-100 rounded-xl px-6 py-3 inline-block">
                        <span class="text-lg font-bold text-gray-700">
                            정확도: ${this.analysisData.confidence || 92}%
                        </span>
                    </div>
                </div>
                
                <!-- 추천 컬러 팔레트 - 개선된 버전 -->
                <div class="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <h3 class="text-xl font-bold text-center mb-6 flex items-center justify-center">
                        <span class="text-2xl mr-2">🎨</span>
                        추천 컬러 팔레트
                    </h3>
                    <div class="grid grid-cols-4 md:grid-cols-6 gap-4 mb-6">
                        ${seasonData.bestColors.map(color => `
                            <div class="relative group cursor-pointer">
                                <div class="aspect-square rounded-xl shadow-md border-2 border-gray-200 hover:border-purple-400 transition-all duration-200 transform hover:scale-105" 
                                     style="background: linear-gradient(135deg, ${color.main}, ${color.shadow});"
                                     title="${color.name}">
                                    <!-- 그라데이션 하이라이트 -->
                                    <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
                                    <!-- 색상 이름 툴팁 -->
                                    <div class="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                        ${color.name}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <p class="text-gray-600 text-center leading-relaxed">
                        ${seasonData.description}
                    </p>
                </div>
                
                <!-- 깊이있는 분석 결과 -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    
                    <!-- 메이크업 추천 -->
                    <div class="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-200">
                        <h4 class="text-lg font-bold text-pink-800 mb-4 flex items-center">
                            <span class="text-xl mr-2">💄</span>
                            메이크업 추천
                        </h4>
                        <div class="space-y-3 text-sm">
                            <div>
                                <span class="font-semibold text-pink-700">립 컬러:</span>
                                <span class="text-pink-600"> ${seasonData.makeup.lipColor}</span>
                            </div>
                            <div>
                                <span class="font-semibold text-pink-700">아이섀도:</span>
                                <span class="text-pink-600"> ${seasonData.makeup.eyeshadow}</span>
                            </div>
                            <div>
                                <span class="font-semibold text-pink-700">블러셔:</span>
                                <span class="text-pink-600"> ${seasonData.makeup.blush}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 헤어 추천 -->
                    <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
                        <h4 class="text-lg font-bold text-amber-800 mb-4 flex items-center">
                            <span class="text-xl mr-2">💇‍♀️</span>
                            헤어 컬러
                        </h4>
                        <div class="space-y-3 text-sm">
                            <div>
                                <span class="font-semibold text-amber-700">추천 컬러:</span>
                                <span class="text-amber-600"> ${seasonData.hair.recommended}</span>
                            </div>
                            <div>
                                <span class="font-semibold text-amber-700">하이라이트:</span>
                                <span class="text-amber-600"> ${seasonData.hair.highlight}</span>
                            </div>
                            <div>
                                <span class="font-semibold text-amber-700">피해야 할 색:</span>
                                <span class="text-amber-600"> ${seasonData.hair.avoid}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 의상 추천 -->
                    <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                        <h4 class="text-lg font-bold text-blue-800 mb-4 flex items-center">
                            <span class="text-xl mr-2">👗</span>
                            패션 스타일
                        </h4>
                        <div class="space-y-3 text-sm">
                            <div>
                                <span class="font-semibold text-blue-700">베이직 컬러:</span>
                                <span class="text-blue-600"> ${seasonData.fashion.basic}</span>
                            </div>
                            <div>
                                <span class="font-semibold text-blue-700">포인트 컬러:</span>
                                <span class="text-blue-600"> ${seasonData.fashion.accent}</span>
                            </div>
                            <div>
                                <span class="font-semibold text-blue-700">스타일:</span>
                                <span class="text-blue-600"> ${seasonData.fashion.style}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 전문가 상담 멘트 -->
                <div class="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-purple-200">
                    <h4 class="text-lg font-bold text-purple-800 mb-4 flex items-center">
                        <span class="text-xl mr-2">💬</span>
                        전문가 조언
                    </h4>
                    <p class="text-purple-700 leading-relaxed italic">
                        "${seasonData.consultation}"
                    </p>
                </div>
                
                <!-- 액션 버튼들 -->
                <div class="text-center space-y-4">
                    <div class="flex flex-wrap justify-center gap-4">
                        <button onclick="shareResults()" 
                                class="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all duration-300">
                            📱 결과 공유하기
                        </button>
                        <button onclick="exportToPDF()" 
                                class="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-4 rounded-xl font-bold hover:from-blue-600 hover:to-indigo-600 transition-all duration-300">
                            📄 상세 리포트 저장
                        </button>
                    </div>
                    
                    <button onclick="resetApp()" 
                            class="bg-gray-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-600 transition-all duration-200">
                        🔄 다시 진단하기
                    </button>
                </div>
            </div>
        `;-8 py-4 rounded-xl font-bold hover:bg-gray-600 transition-all duration-200">
                        🔄 다시 진단하기
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * 상세한 계절 데이터 제공
     */
    getDetailedSeasonData(season) {
        const seasonDatabase = {
            'Spring Light': {
                korean: '봄 라이트',
                characteristics: '밝고 따뜻한 톤, 높은 명도',
                description: '밝고 화사한 따뜻한 색상이 특징으로, 자연스럽고 생기 넘치는 매력을 강조합니다.',
                bestColors: [
                    { name: '피치 핑크', main: '#FFB5BA', shadow: '#FF9AA0' },
                    { name: '코랄', main: '#FF6B6B', shadow: '#FF5252' },
                    { name: '라이트 옐로우', main: '#FFF59D', shadow: '#FFF176' },
                    { name: '아쿠아', main: '#4FC3F7', shadow: '#29B6F6' },
                    { name: '라벤더', main: '#CE93D8', shadow: '#BA68C8' },
                    { name: '민트', main: '#80CBC4', shadow: '#4DB6AC' }
                ],
                makeup: {
                    lipColor: '코랄 핑크, 피치 오렌지',
                    eyeshadow: '골드, 피치, 라이트 브라운',
                    blush: '코랄, 피치 톤'
                },
                hair: {
                    recommended: '골든 브라운, 허니 블론드',
                    highlight: '캐러멜, 골드',
                    avoid: '애쉬 톤, 다크 브라운'
                },
                fashion: {
                    basic: '크림, 아이보리, 카키',
                    accent: '코랄, 터콰이즈, 피치',
                    style: '내츄럴, 로맨틱'
                },
                consultation: '당신의 밝고 따뜻한 피부톤에는 봄의 생기를 닮은 색상들이 완벽하게 어울립니다. 코랄과 피치 계열의 메이크업으로 자연스러운 혈색을 살리고, 골든 톤의 헤어 컬러로 전체적인 하모니를 완성해보세요.'
            },
            'Spring Bright': {
                korean: '봄 브라이트',
                characteristics: '따뜻하고 선명한 톤',
                description: '화사하고 생동감 있는 색상이 매력적인 봄 브라이트 타입입니다.',
                bestColors: [
                    { name: '브라이트 오렌지', main: '#FF8A50', shadow: '#FF7043' },
                    { name: '터콰이즈', main: '#40E0D0', shadow: '#26D0CE' },
                    { name: '옐로우 그린', main: '#9CCC65', shadow: '#8BC34A' },
                    { name: '핫 핑크', main: '#E91E63', shadow: '#C2185B' },
                    { name: '골든 옐로우', main: '#FFD54F', shadow: '#FFCA28' },
                    { name: '로얄 블루', main: '#2196F3', shadow: '#1976D2' }
                ],
                makeup: {
                    lipColor: '브라이트 코랄, 오렌지 레드',
                    eyeshadow: '브론즈, 골드, 터콰이즈',
                    blush: '브라이트 피치, 코랄'
                },
                hair: {
                    recommended: '골든 브라운, 구리빛 브라운',
                    highlight: '골드, 구리',
                    avoid: '차가운 블론드, 애쉬 톤'
                },
                fashion: {
                    basic: '크림, 따뜻한 베이지',
                    accent: '터콰이즈, 브라이트 코랄',
                    style: '다이나믹, 활동적'
                },
                consultation: '생동감 넘치는 당신에게는 강렬하고 따뜻한 색상이 완벽합니다. 브라이트한 색상으로 당당하고 에너지 넘치는 매력을 표현해보세요.'
            },
            // 다른 계절들도 추가...
            'Summer Light': {
                korean: '여름 라이트',
                characteristics: '차갑고 밝은 톤, 부드러운 느낌',
                description: '청순하고 우아한 분위기의 차가운 색상이 잘 어울리는 타입입니다.',
                bestColors: [
                    { name: '라이트 핑크', main: '#F8BBD9', shadow: '#F48FB1' },
                    { name: '스카이 블루', main: '#81D4FA', shadow: '#4FC3F7' },
                    { name: '라벤더 그레이', main: '#D1C4E9', shadow: '#B39DDB' },
                    { name: '소프트 옐로우', main: '#FFF9C4', shadow: '#FFF59D' },
                    { name: '더스티 로즈', main: '#F8BBD9', shadow: '#F48FB1' },
                    { name: '민트 그린', main: '#B2DFDB', shadow: '#80CBC4' }
                ],
                makeup: {
                    lipColor: '로즈 핑크, 베리 틴트',
                    eyeshadow: '소프트 브라운, 로즈 골드',
                    blush: '핑크, 로즈 톤'
                },
                hair: {
                    recommended: '애쉬 브라운, 쿨 블론드',
                    highlight: '애쉬, 플래티넘',
                    avoid: '골든 톤, 레드 브라운'
                },
                fashion: {
                    basic: '네이비, 그레이, 화이트',
                    accent: '라벤더, 소프트 핑크',
                    style: '엘레간트, 페미닌'
                },
                consultation: '당신의 차갑고 섬세한 피부톤에는 부드러운 파스텔 톤이 가장 잘 어울립니다. 로즈 핑크와 라벤더 컬러로 우아하고 여성스러운 매력을 완성해보세요.'
            },
            'Autumn Deep': {
                korean: '가을 딥',
                characteristics: '깊고 따뜻한 톤, 중후한 매력',
                description: '성숙하고 깊이 있는 따뜻한 색상이 매력적인 타입입니다.',
                bestColors: [
                    { name: '딥 오렌지', main: '#FF5722', shadow: '#E64A19' },
                    { name: '올리브 그린', main: '#689F38', shadow: '#558B2F' },
                    { name: '버건디', main: '#AD1457', shadow: '#880E4F' },
                    { name: '골든 브라운', main: '#8D6E63', shadow: '#6D4C41' },
                    { name: '딥 골드', main: '#FF8F00', shadow: '#FF6F00' },
                    { name: '테라코타', main: '#BF360C', shadow: '#A62100' }
                ],
                makeup: {
                    lipColor: '딥 레드, 브라운 레드',
                    eyeshadow: '브론즈, 골드, 브라운',
                    blush: '테라코타, 딥 피치'
                },
                hair: {
                    recommended: '딥 브라운, 체스넛',
                    highlight: '구리, 골드',
                    avoid: '애쉬 톤, 라이트 컬러'
                },
                fashion: {
                    basic: '브라운, 카키, 크림',
                    accent: '버건디, 올리브, 딥 오렌지',
                    style: '클래식, 빈티지'
                },
                consultation: '깊이 있는 따뜻한 색상이 당신의 성숙한 매력을 극대화합니다. 딥한 컬러로 우아하고 세련된 분위기를 연출해보세요.'
            },
            'Winter Clear': {
                korean: '겨울 클리어',
                characteristics: '차갑고 선명한 톤, 강렬한 대비',
                description: '선명하고 강렬한 차가운 색상이 돋보이는 드라마틱한 타입입니다.',
                bestColors: [
                    { name: '퓨어 화이트', main: '#FFFFFF', shadow: '#F5F5F5' },
                    { name: '블랙', main: '#000000', shadow: '#212121' },
                    { name: '로얄 블루', main: '#1565C0', shadow: '#0D47A1' },
                    { name: '에메랄드', main: '#00695C', shadow: '#004D40' },
                    { name: '퓨어 레드', main: '#D32F2F', shadow: '#B71C1C' },
                    { name: '바이올렛', main: '#7B1FA2', shadow: '#4A148C' }
                ],
                makeup: {
                    lipColor: '트루 레드, 딥 베리',
                    eyeshadow: '실버, 블랙, 네이비',
                    blush: '로즈, 퓨어 핑크'
                },
                hair: {
                    recommended: '제트 블랙, 다크 브라운',
                    highlight: '실버, 애쉬',
                    avoid: '골든 톤, 따뜻한 브라운'
                },
                fashion: {
                    basic: '블랙, 화이트, 네이비',
                    accent: '로얄 블루, 에메랄드',
                    style: '모던, 시크'
                },
                consultation: '강렬한 대비가 당신의 매력입니다. 선명한 컬러와 클리어한 톤으로 세련되고 임팩트 있는 스타일을 완성해보세요.'
            }
        };
        
        return seasonDatabase[season] || seasonDatabase['Spring Light'];
    }-8 py-4 rounded-xl font-bold hover:bg-gray-600 transition-all duration-200">
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
                        
                        <!-- Lab 수치 -->
                        <div class="space-y-3 text-sm">
                            <div class="flex justify-between">
                                <span class="text-gray-600">L* (명도):</span>
                                <span class="font-bold">${labData.lab.L}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">a* (적-녹):</span>
                                <span class="font-bold">${labData.lab.a}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">b* (황-청):</span>
                                <span class="font-bold">${labData.lab.b}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 계절 분석 -->
                    <div class="bg-white rounded-3xl shadow-xl p-8">
                        <h3 class="text-xl font-bold mb-6 text-center flex items-center justify-center">
                            <span class="text-2xl mr-2">🌸</span>
                            계절 특성
                        </h3>
                        
                        <div class="text-center mb-6">
                            <div class="text-2xl font-bold text-emerald-600 mb-2">
                                ${labData.result.season}
                            </div>
                        </div>
                        
                        <div class="space-y-3 text-sm">
                            <div class="flex justify-between">
                                <span class="text-gray-600">온도감:</span>
                                <span class="font-bold capitalize">${labData.result.analysis.temperature === 'warm' ? '따뜻함' : '차가움'}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">명도:</span>
                                <span class="font-bold capitalize">${labData.result.analysis.lightness === 'bright' ? '밝음' : labData.result.analysis.lightness === 'medium' ? '중간' : '깊음'}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">채도:</span>
                                <span class="font-bold capitalize">${labData.result.analysis.chroma === 'high' ? '높음' : labData.result.analysis.chroma === 'medium' ? '중간' : '낮음'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 추천 등급 -->
                    <div class="bg-white rounded-3xl shadow-xl p-8">
                        <h3 class="text-xl font-bold mb-6 text-center flex items-center justify-center">
                            <span class="text-2xl mr-2">⭐</span>
                            신뢰도
                        </h3>
                        
                        <div class="text-center mb-6">
                            <div class="text-4xl font-bold text-emerald-600 mb-2">
                                ${labData.result.confidence}%
                            </div>
                            <div class="text-lg text-gray-600">
                                ${labData.result.recommendation === 'highly_recommended' ? '매우 신뢰' : 
                                  labData.result.recommendation === 'recommended' ? '신뢰함' : '재검토 필요'}
                            </div>
                        </div>
                        
                        <div class="bg-emerald-50 rounded-lg p-4">
                            <p class="text-sm text-emerald-700 text-center">
                                과학적 측정과 시각적 분석을 결합한 최고 정확도의 진단 결과입니다.
                            </p>
                        </div>
                    </div>
                </div>

                ${foundationData ? `
                <!-- 파운데이션 추천 -->
                <div class="bg-white rounded-3xl shadow-xl p-8 mb-8">
                    <h3 class="text-2xl font-bold mb-8 text-center flex items-center justify-center">
                        <span class="text-3xl mr-3">💄</span>
                        맞춤 파운데이션 Top 3
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        ${foundationData.slice(0, 3).map((product, index) => `
                            <div class="text-center p-4 border rounded-xl hover:shadow-lg transition-shadow">
                                <div class="text-2xl font-bold text-purple-600 mb-2">${index + 1}위</div>
                                <h4 class="font-bold mb-2">${product.name}</h4>
                                <p class="text-sm text-gray-600 mb-3">${product.shade}</p>
                                <div class="w-full h-6 rounded-full mb-3 border-2 border-gray-200"
                                     style="background: ${product.hexColor};"></div>
                                <div class="text-sm">
                                    <div class="flex justify-between mb-1">
                                        <span>매칭도:</span>
                                        <span class="font-bold text-green-600">${product.labMatch}%</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span>가격:</span>
                                        <span class="font-bold">${product.price.toLocaleString()}원</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <!-- 액션 버튼들 -->
                <div class="text-center space-y-4">
                    <div class="flex flex-wrap justify-center gap-4">
                        <button onclick="shareResults()" 
                                class="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all duration-300">
                            📱 고급 결과 공유
                        </button>
                        <button onclick="exportToPDF()" 
                                class="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-4 rounded-xl font-bold hover:from-blue-600 hover:to-indigo-600 transition-all duration-300">
                            📊 상세 리포트 저장
                        </button>
                    </div>
                    
                    <button onclick="resetApp()" 
                            class="bg-gray-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-600 transition-all duration-200">
                        🔄 새로운 진단
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * 네비게이션 버튼 상태 업데이트
     */
    updateNavigationButtons() {
        // 필요시 구현 - 현재는 각 단계에서 직접 버튼 관리
        console.log('네비게이션 업데이트 - 현재 단계:', this.currentStep);
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
            
            // 상태 초기화
            if (this.currentStep === 1) {
                this.analysisData = {
                    mode: null,
                    results: {},
                    selectedColors: {},
                    finalSeason: null,
                    confidence: 0,
                    labAnalysis: null,
                    foundationMatch: null
                };
                this.currentDrapingStep = 'temperature';
            }
        }
    }
    
    /**
     * 다음으로
     */
    goNext() {
        // 필요시 구현
        console.log('다음 단계로');
    }
    
    /**
     * 앱 리셋
     */
    resetApp() {
        console.log('앱 완전 리셋');
        
        this.currentStep = 0;
        this.analysisMode = null;
        this.currentDrapingStep = 'temperature';
        this.analysisData = {
            mode: null,
            results: {},
            selectedColors: {},
            finalSeason: null,
            confidence: 0,
            labAnalysis: null,
            foundationMatch: null
        };
        
        this.showStep(0);
    }
    
    /**
     * PDF 내보내기
     */
    exportToPDF() {
        console.log('PDF 내보내기 시작');
        
        // 간단한 구현 (실제로는 jsPDF 등의 라이브러리 필요)
        const printContent = document.getElementById('step-content');
        if (printContent) {
            window.print();
        }
    }
    
    /**
     * 결과 공유
     */
    shareResults() {
        console.log('결과 공유');
        
        const season = this.analysisData.labAnalysis ? 
            this.analysisData.labAnalysis.result.season : 
            (this.analysisData.finalSeason || 'Spring Light');
        
        const confidence = this.analysisData.labAnalysis ? 
            this.analysisData.labAnalysis.result.confidence : 
            (this.analysisData.confidence || 92);
        
        const shareData = {
            title: '퍼스널컬러 진단 결과',
            text: `내 퍼스널컬러는 ${season}입니다! (정확도: ${confidence}%)`,
            url: window.location.href
        };
        
        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            navigator.share(shareData).catch(console.error);
        } else if (navigator.clipboard) {
            // 대체 방법: 클립보드에 복사
            const shareText = `${shareData.text} ${shareData.url}`;
            navigator.clipboard.writeText(shareText).then(() => {
                alert('결과가 클립보드에 복사되었습니다!');
            }).catch(() => {
                alert('공유 기능을 사용할 수 없습니다.');
            });
        }
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
        // FullscreenDraping이나 ExpertManual의 닫기 함수 호출
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

function selectColorGroup(step, type, groupName) {
    if (window.app) {
        window.app.selectColorGroup(step, type, groupName);
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

function enterFullscreenDraping(colorData) {
    if (window.FullscreenDraping && window.FullscreenDraping.show) {
        window.FullscreenDraping.show(colorData);
    }
}

// 고급 기능을 위한 추가 전역 함수들
function startColorExtraction() {
    if (window.app) {
        window.app.startColorExtraction();
    }
}

function runAdvancedDemo() {
    if (window.app) {
        window.app.runAdvancedDemo();
    }
}

function proceedToFoundationMatching() {
    if (window.app) {
        window.app.proceedToFoundationMatching();
    }
}

// 앱 인스턴스 생성 및 초기화
let app = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 로드 완료 - 앱 초기화 시작');
    
    try {
        app = new PersonalColorAnalyzer();
        window.app = app; // 디버깅용 전역 접근
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
