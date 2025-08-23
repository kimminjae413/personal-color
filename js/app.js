// js/app.js - 메인 애플리케이션 로직

console.log('app.js 로딩 시작');

class PersonalColorAnalyzer {
    constructor() {
        console.log('PersonalColorAnalyzer 생성자 실행');
        
        // 상태 관리
        this.currentStep = 0;
        this.analysisMode = null;
        this.analysisData = null;
        this.uploadedImage = null;
        this.selectedFeatures = { skinTone: null };
        this.drapingResults = { 
            temperature: null, 
            brightness: null, 
            saturation: null,
            selectedColor: null 
        };
        this.currentDrapingStep = 'temperature';
        this.fullscreenMode = false;
        this.fullscreenColor = null;
        this.expandedSections = {};
        this.showManual = false;
        this.drapingTimer = 0;
        this.timerInterval = null;

        // DOM 요소들 캐시
        this.elements = {};
        
        // 초기화
        this.init();
    }

    init() {
        console.log('앱 초기화 시작');
        
        // DOM이 로드된 후 실행
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    initializeApp() {
        console.log('앱 초기화 실행');
        
        try {
            this.cacheElements();
            this.setupEventListeners();
            this.hideLoading();
            this.showStep(0);
            console.log('앱 초기화 완료');
        } catch (error) {
            console.error('앱 초기화 중 오류:', error);
            this.showError('앱을 초기화하는 중 오류가 발생했습니다.');
        }
    }

    cacheElements() {
        console.log('DOM 요소 캐시 중');
        
        // 기본 요소들
        this.elements = {
            loading: document.getElementById('loading'),
            app: document.getElementById('app'),
            manualBtn: document.getElementById('manual-btn'),
            steps: document.querySelectorAll('.step-content'),
            expertManualModal: document.getElementById('expert-manual-modal'),
            fullscreenModal: document.getElementById('fullscreen-modal')
        };

        // 필수 요소 확인
        if (!this.elements.loading || !this.elements.app) {
            throw new Error('필수 DOM 요소를 찾을 수 없습니다.');
        }

        console.log('DOM 요소 캐시 완료');
    }

    setupEventListeners() {
        console.log('이벤트 리스너 설정 중');
        
        // 매뉴얼 버튼
        if (this.elements.manualBtn) {
            this.elements.manualBtn.addEventListener('click', () => this.toggleManual());
        }
        
        // ESC 키로 모달 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.fullscreenMode) {
                    this.exitFullscreen();
                } else if (this.showManual) {
                    this.toggleManual();
                }
            }
        });

        // 전역 함수들을 window에 등록 (기존 HTML과 호환성)
        this.registerGlobalFunctions();

        console.log('이벤트 리스너 설정 완료');
    }

    registerGlobalFunctions() {
        console.log('전역 함수 등록 중');
        
        // 기존 HTML에서 사용하는 함수들을 전역으로 등록
        window.selectMode = (mode) => this.selectAnalysisMode(mode);
        window.goBack = () => this.goBack();
        window.selectColor = (temperature, colorName) => this.handleColorSelection(temperature, colorName);
        window.resetApp = () => this.resetAll();
        window.enterFullscreen = (color) => this.enterFullscreen(color);
        window.exitFullscreen = () => this.exitFullscreen();
        window.showExpertManual = () => this.showExpertManual();
        window.hideExpertManual = () => this.hideExpertManual();

        console.log('전역 함수 등록 완료');
    }

    showError(message) {
        console.error('오류 표시:', message);
        alert(message);
    }

    hideLoading() {
        console.log('로딩 화면 숨김');
        
        if (this.elements.loading && this.elements.app) {
            this.elements.loading.style.display = 'none';
            this.elements.app.style.display = 'block';
        }
    }

    showStep(stepNumber) {
        console.log('단계 표시:', stepNumber);
        
        try {
            // 모든 단계 숨기기
            if (this.elements.steps) {
                this.elements.steps.forEach(step => {
                    step.style.display = 'none';
                });
            }

            // 현재 단계 표시
            const currentStepElement = document.getElementById(`step-${stepNumber}`);
            if (currentStepElement) {
                currentStepElement.style.display = 'block';
                currentStepElement.classList.add('fade-in-up');
            }

            this.currentStep = stepNumber;
            console.log('현재 단계:', stepNumber);
        } catch (error) {
            console.error('단계 표시 중 오류:', error);
        }
    }

    // 네비게이션 메서드들
    selectAnalysisMode(mode) {
        console.log('분석 모드 선택:', mode);
        
        this.analysisMode = mode;
        if (mode === 'photo') {
            this.showStep(1);
            this.setupPhotoUpload();
        } else if (mode === 'expert') {
            this.showStep(2);
            this.startExpertAnalysis();
        }
    }

    goBack() {
        console.log('뒤로가기, 현재 단계:', this.currentStep);
        
        if (this.currentStep === 1) {
            this.currentStep = 0;
            this.analysisMode = null;
            this.showStep(0);
        } else if (this.currentStep === 2) {
            if (this.analysisMode === 'photo') {
                this.currentStep = 1;
                this.uploadedImage = null;
                this.showStep(1);
            } else {
                this.currentStep = 0;
                this.analysisMode = null;
                this.showStep(0);
            }
            this.resetDrapingResults();
        } else if (this.currentStep === 3) {
            this.currentStep = 2;
            this.analysisData = null;
            this.showStep(2);
        }
    }

    resetDrapingResults() {
        console.log('드래이핑 결과 초기화');
        
        this.drapingResults = { 
            temperature: null, 
            brightness: null, 
            saturation: null,
            selectedColor: null 
        };
        this.currentDrapingStep = 'temperature';
    }

    resetAll() {
        console.log('앱 전체 초기화');
        
        this.currentStep = 0;
        this.analysisMode = null;
        this.analysisData = null;
        this.uploadedImage = null;
        this.selectedFeatures = { skinTone: null };
        this.resetDrapingResults();
        this.expandedSections = {};
        this.showManual = false;
        this.showStep(0);
    }

    // 사진 업로드 관련
    setupPhotoUpload() {
        console.log('사진 업로드 설정');
        
        const input = document.getElementById('photo-input');
        if (input) {
            // 기존 이벤트 리스너 제거
            const newInput = input.cloneNode(true);
            input.parentNode.replaceChild(newInput, input);
            
            // 새 이벤트 리스너 추가
            newInput.addEventListener('change', (e) => this.handleImageUpload(e));
        }
    }

    handleImageUpload(event) {
        console.log('이미지 업로드 처리');
        
        const file = event.target.files[0];
        if (file) {
            console.log('파일 선택됨:', file.name);
            
            const reader = new FileReader();
            reader.onload = (e) => {
                this.uploadedImage = e.target.result;
                this.showStep(2);
                this.startPhotoAnalysis();
            };
            reader.readAsDataURL(file);
        }
    }

    startPhotoAnalysis() {
        console.log('사진 분석 시작');
        
        const step2Element = document.getElementById('step-2');
        if (step2Element) {
            step2Element.innerHTML = `
                <div class="text-center mb-8">
                    <button onclick="goBack()" class="float-left text-gray-600 hover:text-gray-800 flex items-center">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                        뒤로가기
                    </button>
                    <h2 class="text-3xl font-bold mb-4">🔍 AI 색상 분석</h2>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div class="text-center">
                        <img src="${this.uploadedImage}" alt="분석할 사진" class="max-w-full h-64 object-cover rounded-lg mx-auto shadow-md">
                    </div>
                    
                    <div class="space-y-6">
                        <div class="bg-orange-50 rounded-lg p-6">
                            <h3 class="text-xl font-bold mb-4">피부 기본 톤</h3>
                            <div class="space-y-3">
                                ${this.renderSkinToneOptions()}
                            </div>
                        </div>

                        <button id="analyze-btn" onclick="app.runPhotoAnalysis()" 
                                class="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold text-xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
                                disabled>
                            🔬 AI 분석 시작
                        </button>
                    </div>
                </div>
            `;
            
            this.setupSkinToneSelection();
        }
    }

    renderSkinToneOptions() {
        const options = [
            { key: 'warm', label: '🔥 따뜻한 톤', desc: '황색/골든 언더톤' },
            { key: 'neutral', label: '⚪ 중성 톤', desc: '균형잡힌 언더톤' },
            { key: 'cool', label: '❄️ 차가운 톤', desc: '핑크/블루 언더톤' }
        ];

        return options.map(option => `
            <button class="skin-tone-option w-full p-4 rounded-lg border-2 text-left transition-all border-gray-200 bg-white hover:border-gray-300" 
                    data-tone="${option.key}">
                <div class="font-semibold">${option.label}</div>
                <div class="text-sm text-gray-600">${option.desc}</div>
            </button>
        `).join('');
    }

    setupSkinToneSelection() {
        console.log('피부톤 선택 설정');
        
        document.querySelectorAll('.skin-tone-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const tone = btn.dataset.tone;
                this.selectedFeatures.skinTone = tone;
                this.updateSkinToneSelection();
                this.updateAnalyzeButton();
            });
        });
    }

    updateSkinToneSelection() {
        document.querySelectorAll('.skin-tone-option').forEach(btn => {
            const tone = btn.dataset.tone;
            if (tone === this.selectedFeatures.skinTone) {
                btn.className = 'skin-tone-option w-full p-4 rounded-lg border-2 text-left transition-all border-orange-500 bg-orange-100';
            } else {
                btn.className = 'skin-tone-option w-full p-4 rounded-lg border-2 text-left transition-all border-gray-200 bg-white hover:border-gray-300';
            }
        });
    }

    updateAnalyzeButton() {
        const analyzeBtn = document.getElementById('analyze-btn');
        if (analyzeBtn) {
            analyzeBtn.disabled = !this.selectedFeatures.skinTone;
        }
    }

    runPhotoAnalysis() {
        console.log('사진 분석 실행');
        
        const season = this.determineSeason(this.selectedFeatures);
        const analysis = {
            season,
            confidence: 85,
            method: 'photo-based',
            characteristics: '밝고 따뜻한 톤, 부드러운 채도',
            recommendations: {
                makeup: '코랄 핑크 립스틱, 복숭아 블러셔',
                hair: '따뜻한 골든 블론드',
                clothing: '아이보리, 코랄, 따뜻한 핑크'
            }
        };
        
        this.analysisData = analysis;
        this.showStep(3);
        this.renderResults();
    }

    determineSeason(features) {
        // 간단한 규칙 기반 분류
        if (features.skinTone === 'warm') {
            return 'Spring Light';
        } else if (features.skinTone === 'cool') {
            return 'Summer Light';
        } else {
            return 'Autumn Soft';
        }
    }

    // 전문가 분석 시작
    startExpertAnalysis() {
        console.log('전문가 분석 시작');
        
        // 기존 HTML의 전문가 분석 내용을 그대로 사용
        // (이미 HTML에 구현되어 있으므로 별도 처리 불필요)
    }

    handleColorSelection(temperature, colorName) {
        console.log('색상 선택:', temperature, colorName);
        
        // 간단한 애니메이션
        const selectedCard = event.target.closest('.color-card') || event.target;
        if (selectedCard) {
            selectedCard.style.transform = 'scale(1.05)';
            selectedCard.style.borderColor = temperature === 'warm' ? '#f97316' : '#3b82f6';
        }
        
        setTimeout(() => {
            this.showStep(3);
            this.renderExpertResults(temperature);
        }, 1000);
    }

    renderExpertResults(temperature) {
        console.log('전문가 결과 렌더링:', temperature);
        
        const season = temperature === 'warm' ? 'Spring Light' : 'Summer Light';
        const analysis = {
            season,
            confidence: 92,
            method: 'professional-draping',
            characteristics: temperature === 'warm' ? '밝고 따뜻한 톤, 부드러운 채도' : '밝고 차가운 톤, 우아한 색감',
            drapingAnalysis: { temperature },
            recommendations: {
                makeup: '전문가 추천 메이크업',
                hair: '최적 헤어 컬러',
                clothing: '베스트 의상 컬러'
            }
        };
        
        this.analysisData = analysis;
        this.renderResults();
    }

    renderResults() {
        console.log('결과 렌더링');
        
        const step3Element = document.getElementById('step-3');
        if (step3Element && this.analysisData) {
            // 기존 결과 화면 사용하되 동적 데이터 업데이트
            const seasonElement = document.getElementById('result-season');
            const descElement = document.getElementById('result-description');
            
            if (seasonElement) seasonElement.textContent = this.analysisData.season;
            if (descElement) descElement.textContent = this.analysisData.characteristics;
        }
    }

    // 전문가 매뉴얼 관련
    toggleManual() {
        console.log('매뉴얼 토글');
        
        this.showManual = !this.showManual;
        if (this.showManual) {
            this.showExpertManual();
        } else {
            this.hideExpertManual();
        }
    }

    showExpertManual() {
        console.log('전문가 매뉴얼 표시');
        
        if (this.elements.expertManualModal) {
            // HTML에 이미 구현된 매뉴얼 사용
            window.showExpertManual();
        }
    }

    hideExpertManual() {
        console.log('전문가 매뉴얼 숨김');
        
        if (this.elements.expertManualModal) {
            window.hideExpertManual();
        }
        this.showManual = false;
    }

    // 전체화면 드래이핑 관련
    enterFullscreen(color) {
        console.log('전체화면 진입:', color.name);
        
        this.fullscreenColor = color;
        this.fullscreenMode = true;
        this.startDrapingTimer();
        
        // HTML의 전체화면 함수 호출
        if (window.enterFullscreen) {
            window.enterFullscreen(color);
        }
    }

    exitFullscreen() {
        console.log('전체화면 종료');
        
        this.fullscreenMode = false;
        this.fullscreenColor = null;
        this.stopDrapingTimer();
        
        // HTML의 전체화면 종료 함수 호출
        if (window.exitFullscreen) {
            window.exitFullscreen();
        }
    }

    startDrapingTimer() {
        console.log('드래이핑 타이머 시작');
        
        this.drapingTimer = 0;
        this.timerInterval = setInterval(() => {
            this.drapingTimer += 0.1;
            this.updateTimerDisplay();
        }, 100);
    }

    stopDrapingTimer() {
        console.log('드래이핑 타이머 정지');
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimerDisplay() {
        const timerElement = document.getElementById('draping-timer');
        if (timerElement && this.fullscreenMode) {
            timerElement.textContent = `관찰 시간: ${this.drapingTimer.toFixed(1)}초`;
            
            // 3초 이상일 때 색상 변경
            if (this.drapingTimer >= 3) {
                timerElement.className = 'text-sm font-mono text-green-400';
            }
        }
    }

    // 유틸리티 메서드들
    log(message, data = null) {
        console.log(`[PersonalColorAnalyzer] ${message}`, data || '');
    }

    error(message, error = null) {
        console.error(`[PersonalColorAnalyzer] ${message}`, error || '');
    }
}

// 전역 앱 인스턴스 생성
let app;

// DOM 로드 완료 후 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM 로드 완료 - app.js에서 앱 초기화');
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
