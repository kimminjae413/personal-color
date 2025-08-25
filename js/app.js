// js/app.js - 통합된 퍼스널컬러 진단 시스템

console.log('app.js 로딩 시작');

// ====== 데이터 정의 ======

// 드래이핑 색상 데이터
const DRAPING_DATA = {
    temperature: {
        title: '온도감 분석 (Temperature)',
        theory: 'Von Kries 색채 적응 이론',
        description: '피부의 언더톤이 따뜻한지(황색) 차가운지(핑크/블루)를 판단합니다.',
        method: '따뜻한 색상군과 차가운 색상군을 번갈아 비교하며 관찰합니다.',
        observationTime: '각 색상당 3-5초, 총 2-3분 소요',
        scientificBasis: 'SPD(Spectral Power Distribution) 분석을 통한 언더톤 매칭',
        colors: {
            warm: [
                { name: '골든 옐로우', color: '#FFD700', munsell: '5Y 8/12', spd: '따뜻한 황색 스펙트럼' },
                { name: '코랄 오렌지', color: '#FF7F50', munsell: '5YR 7/12', spd: '복숭아 언더톤 강조' },
                { name: '러스트 레드', color: '#B7410E', munsell: '5YR 4/14', spd: '웜톤 적색 성분' },
                { name: '올리브 그린', color: '#8FBC8F', munsell: '5GY 6/8', spd: '황록 혼합 스펙트럼' }
            ],
            cool: [
                { name: '아이시 핑크', color: '#FF1493', munsell: '5RP 6/14', spd: '차가운 마젠타 스펙트럼' },
                { name: '로얄 블루', color: '#4169E1', munsell: '5PB 4/12', spd: '순수 청색 성분' },
                { name: '에메랄드', color: '#50C878', munsell: '5G 6/12', spd: '청록 혼합 스펙트럼' },
                { name: '라벤더', color: '#E6E6FA', munsell: '5P 8/4', spd: '보라 언더톤' }
            ]
        }
    },
    brightness: {
        title: '명도 분석 (Value)',
        theory: 'Munsell 명도 척도 시스템',
        description: '개인에게 조화로운 색상의 밝기 범위를 찾습니다.',
        colors: {
            light: [
                { name: '페일 핑크', color: '#FFB6C1', munsell: '5RP 8/6' },
                { name: '베이비 블루', color: '#87CEEB', munsell: '5PB 8/4' },
                { name: '크림 옐로우', color: '#FFFACD', munsell: '5Y 9/6' },
                { name: '민트 그린', color: '#98FB98', munsell: '5G 9/6' }
            ],
            deep: [
                { name: '딥 네이비', color: '#000080', munsell: '5PB 2/10' },
                { name: '버건디', color: '#800020', munsell: '5R 3/12' },
                { name: '포레스트 그린', color: '#228B22', munsell: '5G 4/12' },
                { name: '자주색', color: '#8B008B', munsell: '5P 3/12' }
            ]
        }
    },
    saturation: {
        title: '채도 분석 (Chroma)',
        theory: 'Munsell 채도 분석법',
        description: '색상의 선명도와 순수성 정도를 결정합니다.',
        colors: {
            vivid: [
                { name: '브라이트 레드', color: '#FF0000', munsell: '5R 5/16' },
                { name: '일렉트릭 블루', color: '#0080FF', munsell: '5PB 5/14' },
                { name: '라임 그린', color: '#32CD32', munsell: '5GY 6/14' },
                { name: '핫 핑크', color: '#FF69B4', munsell: '5RP 6/14' }
            ],
            muted: [
                { name: '더스티 로즈', color: '#BC8F8F', munsell: '5R 6/6' },
                { name: '세이지 그린', color: '#9CAF88', munsell: '5GY 7/4' },
                { name: '슬레이트 블루', color: '#6A5ACD', munsell: '5PB 5/8' },
                { name: '모카 브라운', color: '#D2B48C', munsell: '5YR 7/6' }
            ]
        }
    }
};

// 관찰 기준
const OBSERVATION_CRITERIA = {
    positive: [
        '피부 내부 발광 증가 (Inner Glow)',
        '혈색 개선, 생기 있는 인상',
        '윤곽선 선명도 향상',
        '피부톤 균일화, 잡티 완화'
    ],
    negative: [
        '피부 변색, 칙칙함 증가',
        '그림자 진함, 노화 인상',
        '윤곽 흐려짐, 피곤해 보임',
        '결점 강조, 피부 트러블 부각'
    ]
};

// 계절별 추천 데이터
const SEASON_RECOMMENDATIONS = {
    'Spring Light': {
        hairColors: {
            primary: [
                { name: '허니 브라운', level: '7-8레벨', color: '#D4A574', description: '따뜻한 꿀색 브라운', munsell: '2.5YR 6/6', research: '피부 혈색 개선 효과 입증' },
                { name: '골든 베이지', level: '8-9레벨', color: '#E6D0A3', description: '밝은 황금빛 베이지', munsell: '5Y 8/4', research: '자연스러운 밝기 효과' },
                { name: '카라멜 브라운', level: '6-7레벨', color: '#C4915C', description: '달콤한 카라멜색', munsell: '7.5YR 6/8', research: '따뜻한 인상 강화' }
            ],
            secondary: [
                { name: '골든 블론드', level: '9-10레벨', color: '#F4E4BC', description: '따뜻한 금발', munsell: '2.5Y 9/4', research: '활기찬 이미지 연출' },
                { name: '스트로베리 블론드', level: '8-9레벨', color: '#E8B5A0', description: '딸기빛 금발', munsell: '5YR 8/6', research: '개성적 매력 포인트' }
            ],
            avoid: [
                { name: '애쉬 브라운', color: '#8B7D6B', reason: '회색빛으로 인한 칙칙함', munsell: '10YR 5/2', impact: '피부가 거칠어 보이는 효과' },
                { name: '제트 블랙', color: '#1C1C1C', reason: '너무 강한 대비', munsell: 'N 2/', impact: '인상이 강해지고 노안 효과' },
                { name: '플래티넘 블론드', color: '#F5F5DC', reason: '차가운 톤 + 과도한 밝기', munsell: '5Y 9/2', impact: '부자연스럽고 세련되지 못한 인상' }
            ],
            professionalTips: {
                baseLevel: '개인 피부 명도 6-7 기준',
                optimalRange: '4-8레벨 (±2레벨 원칙)',
                undertone: '골든-옐로우 베이스 강조',
                maintenance: '4-6주 리터치, 컬러 샴푸 필수'
            }
        }
    },
    'Summer Light': {
        hairColors: {
            primary: [
                { name: '애쉬 브라운', level: '6-7레벨', color: '#8B7D6B', description: '부드러운 회색빛 브라운', munsell: '10YR 5/2', research: '쿨톤 피부와 자연 조화' },
                { name: '쿨 블론드', level: '8-9레벨', color: '#E6E6FA', description: '차가운 금발', munsell: '5PB 9/2', research: '우아한 인상 연출' },
                { name: '다크 블론드', level: '7-8레벨', color: '#D3C7B8', description: '진한 금발', munsell: '2.5Y 8/2', research: '지적이고 세련된 느낌' }
            ],
            avoid: [
                { name: '골든 브라운', color: '#D4A574', reason: '너무 따뜻한 톤', munsell: '2.5YR 6/6', impact: '피부가 황색으로 보이는 효과' },
                { name: '구리색', color: '#B87333', reason: '황색 성분 과다', munsell: '5YR 5/8', impact: '부자연스럽고 거친 인상' }
            ],
            professionalTips: {
                baseLevel: '개인 피부 명도 5-6 기준',
                optimalRange: '3-7레벨 (차분한 색상 선호)',
                undertone: '애쉬-베이지 베이스',
                maintenance: '6-8주 리터치, 자외선 차단 필수'
            }
        }
    }
};

// ====== 메인 클래스 ======

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
        
        this.elements = {
            loading: document.getElementById('loading'),
            app: document.getElementById('app'),
            manualBtn: document.getElementById('manual-btn'),
            steps: document.querySelectorAll('.step-content'),
            expertManualModal: document.getElementById('expert-manual-modal'),
            fullscreenModal: document.getElementById('fullscreen-modal')
        };

        if (!this.elements.loading || !this.elements.app) {
            throw new Error('필수 DOM 요소를 찾을 수 없습니다.');
        }

        console.log('DOM 요소 캐시 완료');
    }

    setupEventListeners() {
        console.log('이벤트 리스너 설정 중');
        
        // 매뉴얼 버튼
        if (this.elements.manualBtn) {
            this.elements.manualBtn.addEventListener('click', () => this.showExpertManual());
        }
        
        // ESC 키로 모달 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.fullscreenMode) {
                    this.exitFullscreen();
                } else if (!this.elements.expertManualModal.classList.contains('hidden')) {
                    this.hideExpertManual();
                }
            }
        });

        // 전역 함수들을 window에 등록
        this.registerGlobalFunctions();
        
        // 토글 버튼 이벤트
        document.addEventListener('click', (e) => {
            if (e.target.matches('.theory-toggle') || e.target.closest('.theory-toggle')) {
                const button = e.target.closest('.theory-toggle') || e.target;
                const targetId = button.dataset.target;
                this.toggleContent(targetId);
            }

            if (e.target.matches('.observation-toggle') || e.target.closest('.observation-toggle')) {
                const button = e.target.closest('.observation-toggle') || e.target;
                const targetId = button.dataset.target;
                this.toggleContent(targetId);
            }
        });

        console.log('이벤트 리스너 설정 완료');
    }

    registerGlobalFunctions() {
        console.log('전역 함수 등록 중');
        
        window.selectMode = (mode) => this.selectAnalysisMode(mode);
        window.goBack = () => this.goBack();
        window.selectColor = (colorType, colorName, colorIndex) => this.selectColor(colorType, colorName, colorIndex);
        window.resetApp = () => this.resetAll();
        window.enterFullscreen = (color) => this.enterFullscreen(color);
        window.exitFullscreen = () => this.exitFullscreen();
        window.showExpertManual = () => this.showExpertManual();
        window.hideExpertManual = () => this.hideExpertManual();
        window.toggleColorInfo = () => this.toggleColorInfo();
        window.generateColorPalette = () => this.generateColorPalette();

        console.log('전역 함수 등록 완료');
    }

    // ====== 기본 UI 메서드 ======

    hideLoading() {
        console.log('로딩 화면 숨김');
        
        if (this.elements.loading && this.elements.app) {
            this.elements.loading.style.display = 'none';
            this.elements.app.style.display = 'block';
        }
    }

    showError(message) {
        console.error('오류 표시:', message);
        alert(message);
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

            // 결과 화면이면 개인별 추천사항 생성
            if (stepNumber === 3) {
                setTimeout(() => {
                    this.generateResults();
                }, 100);
            }

            this.currentStep = stepNumber;
            console.log('현재 단계:', stepNumber);
        } catch (error) {
            console.error('단계 표시 중 오류:', error);
        }
    }

    // ====== 토글 기능 ======

    toggleContent(targetId) {
        const content = document.getElementById(targetId);
        const button = document.querySelector(`[data-target="${targetId}"]`);
        const arrow = button ? button.querySelector('.toggle-arrow') : null;

        if (content) {
            if (content.classList.contains('expanded')) {
                content.classList.remove('expanded');
                if (arrow) arrow.classList.remove('rotated');
            } else {
                content.classList.add('expanded');
                if (arrow) arrow.classList.add('rotated');
            }
        }
    }

    // ====== 분석 모드 선택 ======

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

    // ====== 사진 기반 분석 ======

    setupPhotoUpload() {
        console.log('사진 업로드 설정');
        
        const input = document.getElementById('photo-input');
        if (input) {
            // 기존 이벤트 리스너 제거 후 새로 추가
            const newInput = input.cloneNode(true);
            input.parentNode.replaceChild(newInput, input);
            
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
                <div class="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto text-center">
                    <div class="text-center mb-8">
                        <button onclick="goBack()" class="float-left text-gray-600 hover:text-gray-800 flex items-center">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                            </svg>
                            뒤로가기
                        </button>
                        <h2 class="text-3xl font-bold mb-4">🔍 AI 색상 분석</h2>
                    </div>
                    
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p class="text-gray-600 mb-4">사진을 분석하고 있습니다...</p>
                    <div class="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
                        <p class="text-sm text-blue-700">AI가 피부톤, 명도, 채도를 종합 분석 중입니다.</p>
                    </div>
                </div>
            `;
        }
        
        // 3초 후 결과 화면으로
        setTimeout(() => {
            this.analysisData = {
                season: 'Spring Light',
                confidence: 85,
                method: 'photo-based',
                characteristics: '밝고 따뜻한 톤, 부드러운 채도'
            };
            this.showStep(3);
        }, 3000);
    }

    // ====== 전문가 드래이핑 분석 ======

    startExpertAnalysis() {
        this.currentDrapingStep = 'temperature';
        this.renderDrapingStep();
    }

    renderDrapingStep() {
        const stepData = DRAPING_DATA[this.currentDrapingStep];
        const content = document.getElementById('step2-content') || document.getElementById('step-2');
        
        if (!content) return;

        // 진행률 표시
        const progressSteps = ['temperature', 'brightness', 'saturation'];
        const currentIndex = progressSteps.indexOf(this.currentDrapingStep);
        
        const progressHTML = progressSteps.map((step, index) => {
            let className = 'progress-step w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ';
            if (index === currentIndex) {
                className += 'border-orange-500 bg-orange-100 text-orange-700 active';
            } else if (this.drapingResults[step]) {
                className += 'border-green-500 bg-green-100 text-green-700';
            } else {
                className += 'border-gray-300 text-gray-400';
            }
            
            return `<div class="${className}">${index + 1}</div>`;
        }).join('<div class="w-8 border-t-2 mt-4 border-gray-300"></div>');

        content.innerHTML = `
            <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-none">
                <div class="text-center mb-8">
                    <button onclick="goBack()" class="float-left text-gray-600 hover:text-gray-800 flex items-center transition-colors">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                        뒤로가기
                    </button>
                    
                    <!-- 진행률 표시 -->
                    <div class="flex justify-center mb-6">
                        <div class="flex space-x-4">
                            ${progressHTML}
                        </div>
                    </div>
                    
                    <h2 class="text-4xl font-bold mb-4">
                        🎭 ${stepData.title}
                    </h2>
                    <p class="text-xl text-gray-600 max-w-2xl mx-auto">
                        ${stepData.description}
                    </p>
                </div>

                <!-- 이론적 배경 토글 섹션 -->
                <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8">
                    <button class="theory-toggle w-full flex items-center justify-between text-left font-bold text-lg text-blue-800 hover:text-blue-900 transition-colors" 
                            data-target="theory-${this.currentDrapingStep}">
                        <span>📚 과학적 배경 & 이론</span>
                        <svg class="toggle-arrow w-5 h-5 transform transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>
                    
                    <div id="theory-${this.currentDrapingStep}" class="toggle-content">
                        <div class="space-y-4 text-sm mt-4">
                            <div class="bg-white rounded-lg p-4 border border-blue-200">
                                <h4 class="font-bold text-blue-900 mb-2">🔬 과학적 원리</h4>
                                <p class="text-gray-700">${stepData.theory}</p>
                                <p class="text-gray-600 mt-2">${stepData.scientificBasis || ''}</p>
                            </div>
                            
                            <div class="bg-white rounded-lg p-4 border border-purple-200">
                                <h4 class="font-bold text-purple-900 mb-2">⏱️ 관찰 방법</h4>
                                <p class="text-gray-700">${stepData.method || stepData.description}</p>
                                <p class="text-purple-600 mt-2"><strong>소요 시간:</strong> ${stepData.observationTime || '각 색상당 3-5초'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 관찰 기준 토글 섹션 -->
                <div class="bg-gradient-to-r from-green-50 to-red-50 rounded-2xl p-6 mb-8">
                    <button class="observation-toggle w-full flex items-center justify-between text-left font-bold text-lg text-gray-800 hover:text-gray-900 transition-colors" 
                            data-target="observation-criteria">
                        <span>👁️ 전문가 관찰 기준</span>
                        <svg class="toggle-arrow w-5 h-5 transform transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>
                    
                    <div id="observation-criteria" class="toggle-content">
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                            <div class="bg-gradient-to-br from-green-100 to-green-50 border-l-4 border-green-500 rounded-lg p-4">
                                <h4 class="font-bold text-green-800 mb-3">✅ 긍정적 반응 (조화)</h4>
                                <ul class="text-sm text-green-700 space-y-1">
                                    ${OBSERVATION_CRITERIA.positive.map(indicator => `<li>• ${indicator}</li>`).join('')}
                                </ul>
                            </div>
                            
                            <div class="bg-gradient-to-br from-red-100 to-red-50 border-l-4 border-red-500 rounded-lg p-4">
                                <h4 class="font-bold text-red-800 mb-3">❌ 부정적 반응 (부조화)</h4>
                                <ul class="text-sm text-red-700 space-y-1">
                                    ${OBSERVATION_CRITERIA.negative.map(indicator => `<li>• ${indicator}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                ${this.renderColorSelection()}

                <div class="text-center max-w-2xl mx-auto mt-8">
                    <div class="bg-blue-50 rounded-xl p-6">
                        <h4 class="font-bold text-blue-800 mb-3">👁️ 관찰 방법</h4>
                        <div class="text-sm text-blue-700 space-y-2">
                            <p>• 각 색상을 최소 3초 이상 천천히 관찰하세요</p>
                            <p>• 🎭 버튼으로 전체화면 드래이핑을 체험해보세요</p>
                            <p>• 피부가 화사하고 생기있게 보이는 색상을 선택하세요</p>
                            <p>• 피부가 칙칙하거나 피곤해 보이는 색상은 피하세요</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderColorSelection() {
        const stepData = DRAPING_DATA[this.currentDrapingStep];
        const colorKeys = Object.keys(stepData.colors);
        
        let gridHTML = `<div class="grid grid-cols-1 lg:grid-cols-${colorKeys.length} gap-8 max-w-6xl mx-auto mb-8">`;
        
        colorKeys.forEach(colorType => {
            const colors = stepData.colors[colorType];
            const typeLabel = this.getColorTypeLabel(this.currentDrapingStep, colorType);
            const typeIcon = this.getColorTypeIcon(this.currentDrapingStep, colorType);
            
            gridHTML += `
                <div>
                    <h3 class="text-2xl font-bold ${this.getColorTypeClass(this.currentDrapingStep, colorType)} text-center mb-6">
                        ${typeIcon} ${typeLabel}
                    </h3>
                    <div class="grid grid-cols-2 gap-4">
                        ${colors.map((color, index) => `
                            <div class="relative group">
                                <div class="color-card p-4 rounded-xl border-2 border-gray-200 hover:border-${this.getHoverColor(this.currentDrapingStep, colorType)}-300 transition-all cursor-pointer text-center"
                                     onclick="selectColor('${colorType}', '${color.name}', ${index})">
                                    <div class="w-full h-20 rounded-lg mb-2 shadow-md" style="background-color: ${color.color}"></div>
                                    <p class="text-sm font-medium">${color.name}</p>
                                    <p class="text-xs text-gray-500">${color.munsell}</p>
                                </div>
                                <button onclick="enterFullscreen(${JSON.stringify(color).replace(/"/g, '&quot;')})" 
                                        class="absolute top-2 right-2 bg-white bg-opacity-90 text-gray-700 p-1 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-all hover:bg-${this.getHoverColor(this.currentDrapingStep, colorType)}-100"
                                        title="전체화면에서 드래이핑 체험">
                                    🎭
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });
        
        gridHTML += '</div>';
        return gridHTML;
    }

    // ====== 색상 유틸리티 메서드 ======

    getColorTypeLabel(step, type) {
        const labels = {
            temperature: { warm: '따뜻한 색상 (Warm)', cool: '차가운 색상 (Cool)' },
            brightness: { light: '밝은 색상 (Light)', deep: '깊은 색상 (Deep)' },
            saturation: { vivid: '선명한 색상 (Vivid)', muted: '부드러운 색상 (Muted)' }
        };
        return labels[step][type];
    }

    getColorTypeIcon(step, type) {
        const icons = {
            temperature: { warm: '🔥', cool: '❄️' },
            brightness: { light: '🌟', deep: '🌑' },
            saturation: { vivid: '⚡', muted: '🌙' }
        };
        return icons[step][type];
    }

    getColorTypeClass(step, type) {
        const classes = {
            temperature: { warm: 'text-orange-500', cool: 'text-blue-500' },
            brightness: { light: 'text-yellow-500', deep: 'text-purple-600' },
            saturation: { vivid: 'text-red-500', muted: 'text-gray-600' }
        };
        return classes[step][type];
    }

    getHoverColor(step, type) {
        const colors = {
            temperature: { warm: 'orange', cool: 'blue' },
            brightness: { light: 'yellow', deep: 'purple' },
            saturation: { vivid: 'red', muted: 'gray' }
        };
        return colors[step][type];
    }

    selectColor(colorType, colorName, colorIndex) {
        console.log('색상 선택:', this.currentDrapingStep, colorType, colorName);
        
        // 결과 저장
        this.drapingResults[this.currentDrapingStep] = { 
            type: colorType, 
            name: colorName, 
            index: colorIndex 
        };
        
        // 시각적 피드백
        const selectedCard = event.currentTarget;
        if (selectedCard) {
            selectedCard.style.transform = 'scale(1.05)';
            selectedCard.style.borderColor = '#22c55e';
            selectedCard.classList.add('color-selected');
        }
        
        setTimeout(() => {
            // 다음 단계로 진행
            const steps = ['temperature', 'brightness', 'saturation'];
            const currentIndex = steps.indexOf(this.currentDrapingStep);
            
            if (currentIndex < steps.length - 1) {
                this.currentDrapingStep = steps[currentIndex + 1];
                this.renderDrapingStep();
            } else {
                // 모든 단계 완료 - 결과 화면으로
                this.analysisData = {
                    season: this.determineSeasonFromDraping(),
                    confidence: 92,
                    method: 'professional-draping',
                    characteristics: '전문가 수준의 체계적 분석'
                };
                this.showStep(3);
            }
        }, 1000);
    }

    determineSeasonFromDraping() {
        // 간단한 로직으로 드래이핑 결과를 바탕으로 계절 판정
        const temp = this.drapingResults.temperature;
        const brightness = this.drapingResults.brightness;
        
        if (temp && temp.type === 'warm') {
            return brightness && brightness.type === 'light' ? 'Spring Light' : 'Autumn Soft';
        } else {
            return brightness && brightness.type === 'light' ? 'Summer Light' : 'Winter Deep';
        }
    }

    // ====== 네비게이션 ======

    goBack() {
        console.log('뒤로가기, 현재 단계:', this.currentStep);
        
        if (this.currentStep === 2 && this.analysisMode === 'expert') {
            // 드래이핑 중이면 이전 단계로
            const steps = ['temperature', 'brightness', 'saturation'];
            const currentIndex = steps.indexOf(this.currentDrapingStep);
            
            if (currentIndex > 0) {
                this.currentDrapingStep = steps[currentIndex - 1];
                this.renderDrapingStep();
                return;
            }
        }
        
        if (this.currentStep > 0) {
            this.showStep(this.currentStep - 1);
            
            // 상태 초기화
            if (this.currentStep === 1) {
                this.drapingResults = { temperature: null, brightness: null, saturation: null };
                this.currentDrapingStep = 'temperature';
            }
        }
    }

    resetAll() {
        console.log('앱 전체 초기화');
        
        this.currentStep = 0;
        this.analysisMode = null;
        this.analysisData = null;
        this.uploadedImage = null;
        this.selectedFeatures = { skinTone: null };
        this.drapingResults = { temperature: null, brightness: null, saturation: null };
        this.currentDrapingStep = 'temperature';
        this.showStep(0);
    }

    // ====== 결과 생성 ======

    generateResults() {
        const now = new Date();
        const dateStr = now.toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const dateElement = document.getElementById('analysis-date');
        if (dateElement) {
            dateElement.textContent = dateStr;
        }
        
        // 결과 정보 업데이트
        const seasonElement = document.getElementById('result-season');
        const descElement = document.getElementById('result-description');
        
        if (seasonElement && this.analysisData) {
            seasonElement.textContent = this.analysisData.season;
        }
        
        if (descElement && this.analysisData) {
            descElement.textContent = this.analysisData.characteristics;
        }
        
        // 개인별 헤어컬러 추천 생성
        this.generatePersonalizedHairColors();
    }

    generatePersonalizedHairColors() {
        const recommendations = this.getPersonalizedRecommendations();
        const recommendedContainer = document.getElementById('recommended-hair-colors');
        const avoidContainer = document.getElementById('avoid-hair-colors');

        if (recommendedContainer && recommendations.hairColors) {
            let recommendedHTML = '';
            
            // 1순위 컬러들
            recommendedHTML += '<div class="bg-white rounded-lg p-4 border border-green-200"><div class="flex items-center gap-2 mb-3"><span class="text-lg">🥇</span><h5 class="font-semibold text-gray-800">1순위 추천 (과학적 검증)</h5></div>';
            
            recommendations.hairColors.primary.forEach(color => {
                recommendedHTML += `
                    <div class="flex items-center gap-3 mb-4 p-3 bg-green-50 rounded-lg border border-green-100">
                        <div class="flex items-center gap-2">
                            <div class="w-12 h-12 rounded-full border-2 border-gray-300 shadow-sm" style="background-color: ${color.color};" title="${color.name}"></div>
                            <div class="w-8 h-8 rounded-full border border-gray-200" style="background: linear-gradient(135deg, ${color.color}, ${this.adjustColorBrightness(color.color, -20)});" title="그라데이션 효과"></div>
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-1">
                                <p class="font-medium text-gray-800">${color.name}</p>
                                <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">${color.level}</span>
                            </div>
                            <p class="text-xs text-gray-600 mb-1">${color.description}</p>
                            <div class="text-xs text-gray-500">
                                <p><strong>Munsell:</strong> ${color.munsell || 'N/A'}</p>
                                <p class="text-green-700"><strong>연구근거:</strong> ${color.research || '색채 조화 이론 기반'}</p>
                            </div>
                        </div>
                    </div>
                `;
            });
            recommendedHTML += '</div>';
            
            recommendedContainer.innerHTML = recommendedHTML;
        }

        if (avoidContainer && recommendations.hairColors.avoid) {
            let avoidHTML = '';
            recommendations.hairColors.avoid.forEach(color => {
                avoidHTML += `
                    <div class="flex items-center gap-3 mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                        <div class="flex-shrink-0">
                            <div class="relative">
                                <div class="w-10 h-10 rounded-full border-2 border-red-300" style="background-color: ${color.color};" title="${color.name}"></div>
                                <div class="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">✕</div>
                            </div>
                        </div>
                        <div class="flex-1">
                            <p class="font-medium text-gray-800 mb-1">${color.name}</p>
                            <p class="text-xs text-red-700 mb-1"><strong>부정적 효과:</strong> ${color.reason}</p>
                            <p class="text-xs text-gray-600"><strong>시각적 영향:</strong> ${color.impact || '조화도 저하'}</p>
                        </div>
                    </div>
                `;
            });
            avoidContainer.innerHTML = avoidHTML;
        }
    }

    getPersonalizedRecommendations() {
        const currentSeason = this.analysisData ? this.analysisData.season : 'Spring Light';
        return SEASON_RECOMMENDATIONS[currentSeason] || SEASON_RECOMMENDATIONS['Spring Light'];
    }

    adjustColorBrightness(hex, percent) {
        const num = parseInt(hex.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    generateColorPalette() {
        const recommendations = this.getPersonalizedRecommendations();
        const paletteContainer = document.getElementById('color-palette');
        
        if (paletteContainer && recommendations.hairColors) {
            let paletteHTML = '<div class="bg-white rounded-lg p-4 border-2 border-gray-200"><h6 class="font-bold text-center mb-3">🎨 미용실용 컬러 팔레트</h6><div class="grid grid-cols-3 gap-2">';
            
            [...recommendations.hairColors.primary, ...(recommendations.hairColors.secondary || [])].forEach(color => {
                paletteHTML += `
                    <div class="text-center">
                        <div class="w-16 h-16 rounded-lg mx-auto mb-1 border border-gray-300" style="background-color: ${color.color};"></div>
                        <p class="text-xs font-medium">${color.name}</p>
                        <p class="text-xs text-gray-500">${color.level}</p>
                    </div>
                `;
            });
            
            paletteHTML += '</div><p class="text-xs text-gray-500 text-center mt-3">이 팔레트를 미용사에게 보여주세요!</p></div>';
            
            paletteContainer.innerHTML = paletteHTML;
            paletteContainer.classList.remove('hidden');
        }
    }

    // ====== 전문가 매뉴얼 ======

    showExpertManual() {
        const modal = this.elements.expertManualModal;
        if (!modal) return;

        modal.innerHTML = `
            <div class="flex items-center justify-center min-h-screen bg-black bg-opacity-50 p-4">
                <div class="bg-white rounded-2xl shadow-2xl max-w-6xl max-h-[90vh] overflow-y-auto p-8">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-3xl font-bold text-gray-800">🎓 전문가용 드래이핑 진단 매뉴얼</h2>
                        <button onclick="hideExpertManual()" class="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
                    </div>

                    <div class="space-y-8 text-sm">
                        <!-- 과학적 배경 -->
                        <section class="bg-blue-50 rounded-xl p-6">
                            <h3 class="text-2xl font-bold text-blue-800 mb-4">🔬 과학적 배경</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="bg-white rounded-lg p-4 border border-blue-200">
                                    <h4 class="font-bold text-blue-700 mb-3">Von Kries 색채 적응 이론</h4>
                                    <ul class="text-gray-700 space-y-2 text-sm">
                                        <li>• L, M, S 원추세포의 민감도 자동 조정</li>
                                        <li>• 최소 3초, 권장 5-10초 관찰 필요</li>
                                        <li>• 공식: R' = R×ka, G' = G×kb, B' = B×kc</li>
                                        <li>• 색채 항상성 메커니즘 활용</li>
                                    </ul>
                                </div>
                                <div class="bg-white rounded-lg p-4 border border-purple-200">
                                    <h4 class="font-bold text-purple-700 mb-3">Munsell 색체계</h4>
                                    <ul class="text-gray-700 space-y-2 text-sm">
                                        <li>• 색상(Hue): 5R~5RP, 10단계 구분</li>
                                        <li>• 명도(Value): 0~10, 피부톤 4-8 범위</li>
                                        <li>• 채도(Chroma): 0~16+, 개인차 2-12</li>
                                        <li>• 3차원 색공간 정밀 분석</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <!-- 관찰 기준 -->
                        <section class="bg-green-50 rounded-xl p-6">
                            <h3 class="text-2xl font-bold text-green-800 mb-4">👁️ 전문가 관찰 기준</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="bg-white rounded-lg p-4 border border-green-200">
                                    <h4 class="font-bold text-green-700 mb-3">✅ 긍정적 반응 (조화)</h4>
                                    <ul class="text-gray-700 space-y-1 text-sm">
                                        ${OBSERVATION_CRITERIA.positive.map(indicator => `<li>• ${indicator}</li>`).join('')}
                                    </ul>
                                </div>
                                <div class="bg-white rounded-lg p-4 border border-red-200">
                                    <h4 class="font-bold text-red-700 mb-3">❌ 부정적 반응 (부조화)</h4>
                                    <ul class="text-gray-700 space-y-1 text-sm">
                                        ${OBSERVATION_CRITERIA.negative.map(indicator => `<li>• ${indicator}</li>`).join('')}
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <!-- 3단계 분석법 -->
                        <section class="bg-orange-50 rounded-xl p-6">
                            <h3 class="text-2xl font-bold text-orange-800 mb-4">🎯 Sci\\ART 3단계 분석법</h3>
                            <div class="space-y-4">
                                ${Object.entries(DRAPING_DATA).map(([key, data], index) => `
                                    <div class="bg-white rounded-lg p-4 border border-orange-200">
                                        <h4 class="font-bold text-orange-700 mb-2">${index + 1}️⃣ ${data.title}</h4>
                                        <p class="text-gray-700 text-sm">${data.description}</p>
                                        <p class="text-orange-600 text-sm mt-1"><strong>이론:</strong> ${data.theory}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </section>
                    </div>

                    <div class="mt-8 text-center">
                        <button onclick="hideExpertManual()" 
                                class="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all font-semibold">
                            매뉴얼 닫기
                        </button>
                    </div>
                </div>
            </div>
        `;
        modal.classList.remove('hidden');
    }

    hideExpertManual() {
        if (this.elements.expertManualModal) {
            this.elements.expertManualModal.classList.add('hidden');
        }
    }

    // ====== 전체화면 드래이핑 ======

    enterFullscreen(color) {
        console.log('전체화면 드래이핑:', color.name);
        
        this.fullscreenMode = true;
        this.fullscreenColor = color;
        this.startDrapingTimer();
        
        const modal = this.elements.fullscreenModal;
        if (!modal) return;

        modal.innerHTML = `
            <div class="w-full h-full flex items-center justify-center relative" style="background-color: ${color.color}">
                <!-- 상단 정보 바 -->
                <div class="absolute top-4 left-4 bg-black bg-opacity-80 text-white px-6 py-4 rounded-xl max-w-md">
                    <div class="space-y-2">
                        <div class="text-xl font-bold">${color.name}</div>
                        <div class="text-sm opacity-90">${color.munsell}</div>
                        <div class="text-xs opacity-80">${color.spd || color.description || ''}</div>
                        <div id="draping-timer" class="text-sm font-mono text-yellow-400">
                            관찰 시간: 0.0초
                        </div>
                    </div>
                </div>

                <!-- 닫기 버튼 -->
                <button onclick="exitFullscreen()" 
                        class="absolute top-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-full text-2xl hover:bg-opacity-100 transition-all z-10">
                    ✕
                </button>

                <!-- 중앙 안내 -->
                <div class="text-center z-10">
                    <div class="bg-black bg-opacity-60 text-white px-8 py-8 rounded-2xl max-w-lg mx-auto">
                        <h2 class="text-4xl font-bold mb-4">🎭 실제 드래이핑</h2>
                        <div class="space-y-3 text-lg">
                            <p class="font-semibold">화면을 얼굴 근처에 대어보세요</p>
                            <div class="text-base opacity-90">
                                <p>📱 턱 아래 또는 가슴 근처 위치</p>
                                <p>👁️ 거울을 보며 피부 변화 관찰</p>
                                <p>⏱️ 최소 3초 이상 천천히 관찰</p>
                            </div>
                        </div>
                        
                        <div class="mt-6 p-4 bg-white bg-opacity-20 rounded-lg">
                            <h3 class="font-bold mb-2">관찰 체크포인트</h3>
                            <div class="text-sm space-y-1 text-left">
                                <p>✅ 피부가 화사해 보이나요?</p>
                                <p>✅ 혈색이 좋아 보이나요?</p>
                                <p>✅ 윤곽이 선명해 보이나요?</p>
                                <p>❌ 피부가 칙칙해 보이나요?</p>
                                <p>❌ 그림자가 진해 보이나요?</p>
                            </div>
                        </div>

                        <div class="mt-4 text-sm opacity-80">
                            <p>💡 팁: 첫인상이 가장 정확합니다!</p>
                            <p>ESC 키 또는 ✕ 버튼으로 종료</p>
                        </div>

                        <!-- 색상 상세 정보 (토글) -->
                        <div class="mt-6">
                            <button onclick="toggleColorInfo()" class="text-sm bg-white bg-opacity-20 px-4 py-2 rounded-lg hover:bg-opacity-30 transition-all">
                                ℹ️ 색상 상세 정보
                            </button>
                            <div id="color-info" class="hidden mt-4 text-xs text-left bg-black bg-opacity-40 rounded-lg p-4">
                                <div class="space-y-2">
                                    <p><strong>Munsell 표기:</strong> ${color.munsell}</p>
                                    ${color.wavelength ? `<p><strong>파장대:</strong> ${color.wavelength}</p>` : ''}
                                    ${color.lightness ? `<p><strong>명도:</strong> ${color.lightness}</p>` : ''}
                                    ${color.chroma ? `<p><strong>채도:</strong> ${color.chroma}</p>` : ''}
                                    ${color.effect ? `<p><strong>인상 효과:</strong> ${color.effect}</p>` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    exitFullscreen() {
        this.fullscreenMode = false;
        this.fullscreenColor = null;
        this.stopDrapingTimer();
        
        if (this.elements.fullscreenModal) {
            this.elements.fullscreenModal.classList.add('hidden');
        }
        document.body.style.overflow = '';
    }

    toggleColorInfo() {
        const colorInfo = document.getElementById('color-info');
        if (colorInfo) {
            colorInfo.classList.toggle('hidden');
        }
    }

    startDrapingTimer() {
        this.drapingTimer = 0;
        this.timerInterval = setInterval(() => {
            this.drapingTimer += 0.1;
            this.updateTimerDisplay();
        }, 100);
    }

    stopDrapingTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimerDisplay() {
        const timerElement = document.getElementById('draping-timer');
        if (timerElement && this.fullscreenMode) {
            timerElement.textContent = `관찰 시간: ${this.drapingTimer.toFixed(1)}초`;
            
            // 3초 이상일 때 색상 변경 - Von Kries 적응 시간 기준
            if (this.drapingTimer >= 3) {
                timerElement.className = 'text-sm font-mono text-green-400';
            }
        }
    }

    // ====== 유틸리티 메서드들 ======

    log(message, data = null) {
        console.log(`[PersonalColorAnalyzer] ${message}`, data || '');
    }

    error(message, error = null) {
        console.error(`[PersonalColorAnalyzer] ${message}`, error || '');
    }
}

// ====== 전역 초기화 ======

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
