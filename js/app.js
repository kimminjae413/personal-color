// js/app.js - 퍼스널컬러 진단 시스템 메인 애플리케이션

console.log('퍼스널컬러 진단 시스템 v3.0 로딩 시작');

/**
 * 메인 퍼스널컬러 분석기 클래스
 */
class PersonalColorAnalyzer {
    constructor() {
        console.log('PersonalColorAnalyzer 초기화 시작');
        
        // 앱 상태
        this.currentStep = 0;
        this.analysisMode = null; // 'simple' | 'expert'
        this.currentDrapingStep = 'temperature';
        this.maxSteps = 4;
        
        // 진단 데이터
        this.analysisData = {
            mode: null,
            results: {},
            selectedColors: {},
            finalSeason: null,
            confidence: 0
        };
        
        // 터치 이벤트 상태
        this.touchState = {
            startX: 0,
            startY: 0,
            isScrolling: false
        };
        
        // 타이머
        this.colorPreviewTimer = null;
        
        // 초기화
        this.init();
    }
    
    /**
     * 앱 초기화
     */
    init() {
        console.log('앱 초기화 시작');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }
    
    /**
     * 앱 완전 초기화
     */
    initializeApp() {
        console.log('앱 완전 초기화');
        
        try {
            this.setupEventListeners();
            this.setupSwipeGestures();
            this.hideLoading();
            this.showStep(0);
            this.updateNavigation();
            
            console.log('앱 초기화 완료');
        } catch (error) {
            console.error('앱 초기화 오류:', error);
            this.showError('시스템을 초기화하는 중 오류가 발생했습니다.');
        }
    }
    
    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        console.log('이벤트 리스너 설정');
        
        // 토글 버튼들
        document.addEventListener('click', (e) => {
            const toggle = e.target.closest('.info-toggle');
            if (toggle) {
                const targetId = toggle.dataset.target;
                this.toggleContent(targetId);
            }
        });
        
        // ESC 키
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.isModalOpen()) {
                    this.closeModal();
                } else {
                    this.goBack();
                }
            }
        });
        
        // 전역 함수 등록
        this.registerGlobalFunctions();
        
        console.log('이벤트 리스너 설정 완료');
    }
    
    /**
     * 스와이프 제스처 설정
     */
    setupSwipeGestures() {
        console.log('스와이프 제스처 설정');
        
        let startX, startY, startTime;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTime = Date.now();
            this.touchState.isScrolling = false;
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            if (!startX || !startY) return;
            
            const deltaY = Math.abs(e.touches[0].clientY - startY);
            const deltaX = Math.abs(e.touches[0].clientX - startX);
            
            if (deltaY > deltaX) {
                this.touchState.isScrolling = true;
            }
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            if (!startX || !startY || this.touchState.isScrolling) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const deltaTime = Date.now() - startTime;
            
            // 스와이프 감지 조건
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 100 && deltaTime < 300) {
                if (deltaX > 0) {
                    // 왼쪽에서 오른쪽 스와이프 (뒤로가기)
                    this.goBack();
                } else {
                    // 오른쪽에서 왼쪽 스와이프 (다음)
                    this.goNext();
                }
            }
            
            startX = startY = null;
        }, { passive: true });
        
        console.log('스와이프 제스처 설정 완료');
    }
    
    /**
     * 전역 함수 등록 (HTML에서 호출하는 함수들)
     */
    registerGlobalFunctions() {
        window.selectMode = (mode) => this.selectAnalysisMode(mode);
        window.selectColor = (step, type, colorName, colorData) => this.selectColor(step, type, colorName, colorData);
        window.goBack = () => this.goBack();
        window.goNext = () => this.goNext();
        window.resetApp = () => this.resetApp();
        window.exportToPDF = () => this.exportToPDF();
        window.shareResults = () => this.shareResults();
    }
    
    /**
     * 로딩 화면 숨기기
     */
    hideLoading() {
        console.log('로딩 화면 숨김');
        
        const loading = document.getElementById('loading');
        const app = document.getElementById('app');
        
        if (loading && app) {
            setTimeout(() => {
                loading.style.display = 'none';
                app.style.display = 'block';
            }, 500);
        }
    }
    
    /**
     * 단계 표시
     */
    showStep(stepNumber) {
        console.log('단계 표시:', stepNumber);
        
        // 모든 단계 숨기기
        document.querySelectorAll('.step-content').forEach(step => {
            step.style.display = 'none';
            step.classList.remove('fade-in-up');
        });
        
        // 현재 단계 표시
        const currentStepElement = document.getElementById(`step-${stepNumber}`);
        if (currentStepElement) {
            currentStepElement.style.display = 'block';
            
            // 애니메이션 적용
            setTimeout(() => {
                currentStepElement.classList.add('fade-in-up');
            }, 50);
        }
        
        this.currentStep = stepNumber;
        this.updateNavigation();
        this.updateProgressIndicator();
    }
    
    /**
     * 네비게이션 업데이트
     */
    updateNavigation() {
        const backBtn = document.getElementById('backBtn');
        const nextBtn = document.getElementById('nextBtn');
        const actionBtn = document.getElementById('actionBtn');
        const resultActions = document.getElementById('resultActions');
        
        // 뒤로가기 버튼
        if (backBtn) {
            backBtn.style.display = this.currentStep > 0 ? 'flex' : 'none';
        }
        
        // 다음 버튼 (필요시)
        if (nextBtn) {
            nextBtn.style.display = 'none'; // 기본적으로 숨김
        }
        
        // 액션 버튼
        if (actionBtn) {
            actionBtn.style.display = 'none';
        }
        
        // 결과 액션바
        if (resultActions) {
            resultActions.style.display = this.currentStep === 3 ? 'block' : 'none';
        }
    }
    
    /**
     * 진행률 표시 업데이트
     */
    updateProgressIndicator() {
        const indicator = document.getElementById('progressIndicator');
        if (!indicator) return;
        
        const dots = indicator.querySelectorAll('div');
        dots.forEach((dot, index) => {
            dot.className = 'w-3 h-3 rounded-full transition-all duration-300';
            if (index <= this.currentStep) {
                dot.classList.add('bg-blue-600');
            } else {
                dot.classList.add('bg-gray-300');
            }
        });
    }
    
    /**
     * 분석 모드 선택
     */
    selectAnalysisMode(mode) {
        console.log('분석 모드 선택:', mode);
        
        this.analysisMode = mode;
        this.analysisData.mode = mode;
        
        // 터치 피드백
        this.createTouchFeedback(event);
        
        setTimeout(() => {
            if (mode === 'simple') {
                this.showStep(1);
                this.renderSimpleAnalysis();
            } else if (mode === 'expert') {
                this.showStep(2);
                this.renderExpertAnalysis();
            }
        }, 300);
    }
    
    /**
     * 간편 진단 렌더링
     */
    renderSimpleAnalysis() {
        console.log('간편 진단 렌더링');
        
        const content = document.getElementById('step-1');
        if (!content) return;
        
        content.innerHTML = `
            <div class="max-w-4xl mx-auto">
                <div class="text-center mb-12">
                    <h2 class="mega-font-md text-gray-800 mb-6">🎨 간편 색상 진단</h2>
                    <p class="large-font text-gray-600 mb-8">3단계로 빠르게 당신의 컬러 타입을 찾아보세요</p>
                    
                    <!-- 진행 단계 -->
                    <div class="flex justify-center mb-8">
                        <div class="flex items-center space-x-4">
                            <div class="progress-step w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold active">
                                1
                            </div>
                            <div class="w-12 border-t-2 border-gray-300"></div>
                            <div class="progress-step w-10 h-10 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold">
                                2
                            </div>
                            <div class="w-12 border-t-2 border-gray-300"></div>
                            <div class="progress-step w-10 h-10 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold">
                                3
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 1단계: 기본 온도감 -->
                <div class="bg-white rounded-3xl shadow-xl p-8 mb-8">
                    <div class="text-center mb-8">
                        <h3 class="mega-font-sm text-orange-600 mb-4">1단계: 기본 온도감</h3>
                        <p class="large-font text-gray-600">당신에게 더 어울리는 색상은?</p>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <!-- 따뜻한 색상 그룹 -->
                        <div class="text-center">
                            <h4 class="text-2xl font-bold text-orange-500 mb-6">🔥 따뜻한 색상</h4>
                            <div class="grid grid-cols-2 gap-4 mb-6">
                                ${SIMPLE_COLORS.warm.map((color, index) => `
                                    <div class="color-card p-4 rounded-2xl border-2 border-gray-200 cursor-pointer touch-target transition-all hover:border-orange-300"
                                         onclick="selectColor('temperature', 'warm', '${color.name}', ${JSON.stringify(color).replace(/"/g, '&quot;')})">
                                        <div class="color-chip w-full h-20 rounded-xl mb-3" 
                                             style="background: linear-gradient(135deg, ${color.color}, ${this.adjustColorBrightness(color.color, -10)});"></div>
                                        <p class="text-base font-medium text-gray-800">${color.name}</p>
                                    </div>
                                `).join('')}
                            </div>
                            <button class="thumb-button bg-gradient-to-r from-orange-400 to-red-400 text-white w-full" 
                                    onclick="selectColor('temperature', 'warm', '따뜻한 색상', {name: '따뜻한 색상', color: '#ff6b47'})">
                                <span class="text-lg font-bold">따뜻한 색상 선택</span>
                            </button>
                        </div>
                        
                        <!-- 차가운 색상 그룹 -->
                        <div class="text-center">
                            <h4 class="text-2xl font-bold text-blue-500 mb-6">❄️ 차가운 색상</h4>
                            <div class="grid grid-cols-2 gap-4 mb-6">
                                ${SIMPLE_COLORS.cool.map((color, index) => `
                                    <div class="color-card p-4 rounded-2xl border-2 border-gray-200 cursor-pointer touch-target transition-all hover:border-blue-300"
                                         onclick="selectColor('temperature', 'cool', '${color.name}', ${JSON.stringify(color).replace(/"/g, '&quot;')})">
                                        <div class="color-chip w-full h-20 rounded-xl mb-3" 
                                             style="background: linear-gradient(135deg, ${color.color}, ${this.adjustColorBrightness(color.color, -10)});"></div>
                                        <p class="text-base font-medium text-gray-800">${color.name}</p>
                                    </div>
                                `).join('')}
                            </div>
                            <button class="thumb-button bg-gradient-to-r from-blue-400 to-purple-400 text-white w-full" 
                                    onclick="selectColor('temperature', 'cool', '차가운 색상', {name: '차가운 색상', color: '#4169e1'})">
                                <span class="text-lg font-bold">차가운 색상 선택</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 관찰 가이드 -->
                <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                    <button class="info-toggle w-full flex items-center justify-between text-left" data-target="simple-guide">
                        <div class="flex items-center">
                            <i data-lucide="eye" class="w-6 h-6 text-blue-600 mr-3"></i>
                            <span class="large-font font-bold text-blue-800">색상 선택 가이드</span>
                        </div>
                        <i data-lucide="chevron-down" class="w-6 h-6 text-blue-400 toggle-arrow transition-transform"></i>
                    </button>
                    
                    <div id="simple-guide" class="toggle-content mt-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="bg-green-50 rounded-xl p-6 border-l-4 border-green-400">
                                <h4 class="font-bold text-green-800 mb-3 text-lg">✅ 이런 효과를 찾으세요</h4>
                                <ul class="text-green-700 space-y-2">
                                    <li>• 피부가 밝고 생기있게 보임</li>
                                    <li>• 자연스러운 혈색 개선</li>
                                    <li>• 전체적으로 조화로운 느낌</li>
                                    <li>• 건강하고 젊어 보이는 인상</li>
                                </ul>
                            </div>
                            <div class="bg-red-50 rounded-xl p-6 border-l-4 border-red-400">
                                <h4 class="font-bold text-red-800 mb-3 text-lg">❌ 이런 효과는 피하세요</h4>
                                <ul class="text-red-700 space-y-2">
                                    <li>• 피부가 칙칙하고 어두워 보임</li>
                                    <li>• 그림자가 진해져 피곤해 보임</li>
                                    <li>• 부자연스럽고 어색한 느낌</li>
                                    <li>• 창백하거나 병든 듯한 인상</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 아이콘 초기화
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    /**
     * 전문가 진단 렌더링
     */
    renderExpertAnalysis() {
        console.log('전문가 진단 렌더링');
        
        const stepData = DRAPING_COLORS[this.currentDrapingStep];
        const content = document.getElementById('step-2');
        
        if (!content || !stepData) return;
        
        // 진행률 계산
        const steps = ['temperature', 'brightness', 'saturation'];
        const currentIndex = steps.indexOf(this.currentDrapingStep);
        
        content.innerHTML = `
            <div class="max-w-6xl mx-auto">
                <div class="text-center mb-12">
                    <h2 class="mega-font-md text-gray-800 mb-6">🎭 ${stepData.title}</h2>
                    <p class="large-font text-gray-600 mb-8">${stepData.description}</p>
                    
                    <!-- 진행률 표시 -->
                    <div class="flex justify-center mb-8">
                        <div class="flex items-center space-x-4">
                            ${steps.map((step, index) => {
                                let className = 'progress-step w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ';
                                if (index === currentIndex) {
                                    className += 'bg-purple-500 text-white active';
                                } else if (this.analysisData.selectedColors[step]) {
                                    className += 'bg-green-500 text-white completed';
                                } else {
                                    className += 'bg-gray-300 text-gray-600';
                                }
                                
                                return `
                                    <div class="${className}">
                                        ${index + 1}
                                    </div>
                                    ${index < steps.length - 1 ? '<div class="w-12 border-t-2 border-gray-300"></div>' : ''}
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>

                <!-- 색상 선택 영역 -->
                ${this.renderExpertColorSelection(stepData)}

                <!-- 과학적 배경 및 관찰 가이드 -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                    <!-- 과학적 배경 -->
                    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                        <button class="info-toggle w-full flex items-center justify-between text-left" data-target="scientific-background-${this.currentDrapingStep}">
                            <div class="flex items-center">
                                <i data-lucide="microscope" class="w-6 h-6 text-blue-600 mr-3"></i>
                                <span class="large-font font-bold text-blue-800">과학적 배경</span>
                            </div>
                            <i data-lucide="chevron-down" class="w-6 h-6 text-blue-400 toggle-arrow transition-transform"></i>
                        </button>
                        
                        <div id="scientific-background-${this.currentDrapingStep}" class="toggle-content mt-6">
                            <div class="space-y-4">
                                <div class="bg-white rounded-lg p-4 border border-blue-200">
                                    <h4 class="font-bold text-blue-900 mb-2">🔬 이론적 원리</h4>
                                    <p class="text-blue-800 text-sm">${stepData.theory}</p>
                                </div>
                                <div class="bg-white rounded-lg p-4 border border-indigo-200">
                                    <h4 class="font-bold text-indigo-900 mb-2">⏱️ 관찰 방법</h4>
                                    <p class="text-indigo-800 text-sm">${stepData.method}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 전문가 가이드 -->
                    <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                        <button class="info-toggle w-full flex items-center justify-between text-left" data-target="expert-guide-${this.currentDrapingStep}">
                            <div class="flex items-center">
                                <i data-lucide="user-check" class="w-6 h-6 text-green-600 mr-3"></i>
                                <span class="large-font font-bold text-green-800">전문가 관찰법</span>
                            </div>
                            <i data-lucide="chevron-down" class="w-6 h-6 text-green-400 toggle-arrow transition-transform"></i>
                        </button>
                        
                        <div id="expert-guide-${this.currentDrapingStep}" class="toggle-content mt-6">
                            <div class="grid grid-cols-1 gap-4">
                                <div class="bg-green-100 rounded-lg p-4 border-l-4 border-green-500">
                                    <h5 class="font-bold text-green-800 mb-2">✅ 긍정적 반응</h5>
                                    <ul class="text-green-700 text-sm space-y-1">
                                        <li>• 피부 내부 발광 증가</li>
                                        <li>• 혈색 개선, 생기 있는 인상</li>
                                        <li>• 윤곽선 선명도 향상</li>
                                        <li>• 전체적 조화감</li>
                                    </ul>
                                </div>
                                <div class="bg-red-100 rounded-lg p-4 border-l-4 border-red-500">
                                    <h5 class="font-bold text-red-800 mb-2">❌ 부정적 반응</h5>
                                    <ul class="text-red-700 text-sm space-y-1">
                                        <li>• 피부 변색, 칙칙함 증가</li>
                                        <li>• 그림자 진함, 노화 인상</li>
                                        <li>• 윤곽 흐려짐</li>
                                        <li>• 부자연스러운 대비</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 아이콘 초기화
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    /**
     * 전
