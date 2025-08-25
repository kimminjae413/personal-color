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
        
        // 매뉴얼 버튼
        document.addEventListener('click', (e) => {
            if (e.target.id === 'manual-btn' || e.target.closest('#manual-btn')) {
                if (window.ExpertManual) {
                    window.ExpertManual.show();
                }
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
     * 전역 함수 등록
     */
    registerGlobalFunctions() {
        window.selectMode = (mode) => this.selectAnalysisMode(mode);
        window.selectColor = (step, type, colorName, colorData) => this.selectColor(step, type, colorName, colorData);
        window.selectColorGroup = (step, type, groupName) => this.selectColorGroup(step, type, groupName);
        window.goBack = () => this.goBack();
        window.goNext = () => this.goNext();
        window.resetApp = () => this.resetApp();
        window.exportToPDF = () => this.exportToPDF();
        window.shareResults = () => this.shareResults();
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
        const backBtn = document.getElementById('thumbBackBtn');
        const homeBtn = document.getElementById('thumbHomeBtn');
        
        // 뒤로가기 버튼
        if (backBtn) {
            backBtn.style.display = this.currentStep > 0 ? 'block' : 'none';
        }
        
        // 홈 버튼은 항상 표시
        if (homeBtn) {
            homeBtn.style.display = 'block';
        }
    }
    
    /**
     * 진행률 표시 업데이트
     */
    updateProgressIndicator() {
        // 필요시 구현
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
            if (mode === 'photo') {
                this.showStep(1);
                this.renderPhotoAnalysis();
            } else if (mode === 'expert') {
                this.showStep(2);
                this.renderExpertAnalysis();
            }
        }, 300);
    }
    
    /**
     * 사진 기반 진단 렌더링
     */
    renderPhotoAnalysis() {
        console.log('사진 기반 진단 렌더링');
        
        const content = document.getElementById('step-1');
        if (!content) return;
        
        content.innerHTML = `
            <div class="max-w-4xl mx-auto">
                <div class="text-center mb-12">
                    <h2 class="mega-font-md text-gray-800 mb-6">📸 사진 업로드</h2>
                    <p class="large-font text-gray-600 mb-8">얼굴이 잘 보이는 사진을 업로드해주세요</p>
                </div>

                <div class="bg-white rounded-3xl shadow-xl p-8 mb-8">
                    <div class="text-center">
                        <div id="photo-upload-zone" class="border-2 border-dashed border-blue-300 rounded-xl p-12 mb-6 hover:border-blue-500 transition-colors cursor-pointer">
                            <div class="text-6xl mb-4">📸</div>
                            <h3 class="text-2xl font-bold text-gray-800 mb-4">사진 업로드</h3>
                            <p class="text-gray-600 mb-6">클릭하거나 파일을 드래그해주세요</p>
                            <input type="file" id="photo-input" accept="image/*" class="hidden">
                            <button class="bg-blue-500 text-white px-8 py-4 rounded-xl hover:bg-blue-600 transition-all font-bold text-lg">
                                파일 선택
                            </button>
                        </div>
                        
                        <div id="photo-preview" class="hidden mb-6">
                            <img id="preview-image" class="max-w-full h-64 object-cover rounded-xl mx-auto">
                        </div>
                        
                        <div id="analysis-button-container" class="hidden">
                            <button id="analyze-photo-btn" class="bg-green-500 text-white px-8 py-4 rounded-xl hover:bg-green-600 transition-all font-bold text-lg">
                                📊 사진 분석하기
                            </button>
                        </div>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                    <h4 class="font-bold text-blue-800 mb-4 text-xl">📋 촬영 가이드</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-3">
                            <h5 class="font-semibold text-green-800 mb-2">✅ 좋은 사진</h5>
                            <ul class="text-green-700 space-y-1 text-sm">
                                <li>• 자연광이나 밝은 조명</li>
                                <li>• 정면을 바라보는 얼굴</li>
                                <li>• 메이크업을 하지 않은 상태</li>
                                <li>• 흰색이나 회색 옷 착용</li>
                                <li>• 머리카락이 얼굴을 가리지 않음</li>
                            </ul>
                        </div>
                        <div class="space-y-3">
                            <h5 class="font-semibold text-red-800 mb-2">❌ 피해야 할 사진</h5>
                            <ul class="text-red-700 space-y-1 text-sm">
                                <li>• 어둡거나 인위적인 조명</li>
                                <li>• 측면이나 기울어진 얼굴</li>
                                <li>• 진한 메이크업 상태</li>
                                <li>• 선명한 색상의 옷</li>
                                <li>• 그림자가 많이 지는 환경</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.setupPhotoUpload();
    }
    
    /**
     * 사진 업로드 기능 설정
     */
    setupPhotoUpload() {
        const uploadZone = document.getElementById('photo-upload-zone');
        const photoInput = document.getElementById('photo-input');
        const photoPreview = document.getElementById('photo-preview');
        const previewImage = document.getElementById('preview-image');
        const analyzeBtn = document.getElementById('analyze-photo-btn');
        const buttonContainer = document.getElementById('analysis-button-container');
        
        if (!uploadZone || !photoInput) return;
        
        // 클릭으로 파일 선택
        uploadZone.addEventListener('click', () => {
            photoInput.click();
        });
        
        // 파일 선택 처리
        photoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handlePhotoUpload(file);
            }
        });
        
        // 드래그 앤 드롭
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('border-blue-500', 'bg-blue-50');
        });
        
        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('border-blue-500', 'bg-blue-50');
        });
        
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('border-blue-500', 'bg-blue-50');
            
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.handlePhotoUpload(file);
            }
        });
        
        // 분석 버튼
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => {
                this.analyzePhoto();
            });
        }
    }
    
    /**
     * 사진 업로드 처리
     */
    handlePhotoUpload(file) {
        const photoPreview = document.getElementById('photo-preview');
        const previewImage = document.getElementById('preview-image');
        const buttonContainer = document.getElementById('analysis-button-container');
        
        if (!photoPreview || !previewImage || !buttonContainer) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            photoPreview.classList.remove('hidden');
            buttonContainer.classList.remove('hidden');
            
            // 분석 데이터에 이미지 저장
            this.analysisData.photoData = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    /**
     * 사진 분석 처리
     */
    analyzePhoto() {
        console.log('사진 분석 시작');
        
        // 간단한 시뮬레이션 - 실제로는 AI 분석 로직
        const seasons = ['Spring Light', 'Summer Light', 'Autumn Soft', 'Winter Bright'];
        const randomSeason = seasons[Math.floor(Math.random() * seasons.length)];
        
        this.analysisData.finalSeason = randomSeason;
        this.analysisData.confidence = 85;
        
        // 결과 화면으로 이동
        setTimeout(() => {
            this.showStep(3);
            this.renderResults(randomSeason);
        }, 2000);
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

                <!-- 과학적 배경 -->
                <div class="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                    <button class="info-toggle w-full flex items-center justify-between text-left" data-target="scientific-background-${this.currentDrapingStep}">
                        <div class="flex items-center">
                            <span class="text-2xl mr-3">🔬</span>
                            <span class="large-font font-bold text-blue-800">과학적 배경</span>
                        </div>
                        <span class="text-2xl text-blue-400 toggle-arrow transition-transform">▼</span>
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
            </div>
        `;
    }
    
    /**
     * 전문가 색상 선택 영역 렌더링
     */
    renderExpertColorSelection(stepData) {
        const colorGroups = Object.keys(stepData.colors);
        
        return `
            <div class="grid grid-cols-1 lg:grid-cols-${colorGroups.length} gap-12">
                ${colorGroups.map(groupKey => {
                    const colors = stepData.colors[groupKey];
                    const groupInfo = this.getColorGroupInfo(this.currentDrapingStep, groupKey);
                    
                    return `
                        <div class="text-center">
                            <h3 class="text-3xl font-bold ${groupInfo.className} mb-8">
                                ${groupInfo.icon} ${groupInfo.label}
                            </h3>
                            <div class="grid grid-cols-2 gap-6">
                                ${colors.map((color, index) => `
                                    <div class="relative group">
                                        <div class="color-card p-6 rounded-2xl border-2 border-gray-200 cursor-pointer touch-target transition-all hover:border-${groupInfo.hoverColor}-300"
                                             onclick="selectColor('${this.currentDrapingStep}', '${groupKey}', '${color.name}', ${JSON.stringify(color).replace(/"/g, '&quot;')})">
                                            <div class="color-chip w-full h-24 rounded-xl mb-4" 
                                                 style="background: linear-gradient(135deg, ${color.color}, ${this.adjustColorBrightness(color.color, -15)});"></div>
                                            <p class="text-lg font-semibold text-gray-800 mb-1">${color.name}</p>
                                            <p class="text-sm text-gray-500">${color.munsell}</p>
                                        </div>
                                        
                                        <!-- 전체화면 드래이핑 버튼 -->
                                        <button class="absolute top-2 right-2 w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center text-gray-600 opacity-0 group-hover:opacity-100 transition-all hover:bg-purple-100"
                                                onclick="event.stopPropagation(); enterFullscreenDraping(${JSON.stringify(color).replace(/"/g, '&quot;')})"
                                                title="전체화면에서 체험">
                                            🎭
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                            
                            <!-- 그룹 선택 버튼 -->
                            <button class="thumb-button bg-gradient-to-r ${groupInfo.gradient} text-white w-full mt-6" 
                                    onclick="selectColorGroup('${this.currentDrapingStep}', '${groupKey}', '${groupInfo.label}')">
                                <span class="text-lg font-bold">${groupInfo.label} 선택</span>
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    /**
     * 색상 그룹 정보 반환
     */
    getColorGroupInfo(step, groupKey) {
        const groupInfoMap = {
            temperature: {
                warm: { 
                    label: '따뜻한 색상', 
                    icon: '🔥', 
                    className: 'text-orange-500', 
                    hoverColor: 'orange',
                    gradient: 'from-orange-400 to-red-400' 
                },
                cool: { 
                    label: '차가운 색상', 
                    icon: '❄️', 
                    className: 'text-blue-500', 
                    hoverColor: 'blue',
                    gradient: 'from-blue-400 to-purple-400' 
                }
            },
            brightness: {
                light: { 
                    label: '밝은 색상', 
                    icon: '🌟', 
                    className: 'text-yellow-500', 
                    hoverColor: 'yellow',
                    gradient: 'from-yellow-400 to-orange-400' 
                },
                deep: { 
                    label: '깊은 색상', 
                    icon: '🌑', 
                    className: 'text-purple-600', 
                    hoverColor: 'purple',
                    gradient: 'from-purple-500 to-indigo-500' 
                }
            },
            saturation: {
                vivid: { 
                    label: '선명한 색상', 
                    icon: '⚡', 
                    className: 'text-red-500', 
                    hoverColor: 'red',
                    gradient: 'from-red-400 to-pink-400' 
                },
                muted: { 
                    label: '부드러운 색상', 
                    icon: '🌙', 
                    className: 'text-gray-600', 
                    hoverColor: 'gray',
                    gradient: 'from-gray-400 to-slate-500' 
                }
            }
        };
        
        return groupInfoMap[step][groupKey];
    }
    
    /**
     * 색상 선택 처리
     */
    selectColor(step, type, colorName, colorData) {
        console.log('색상 선택:', step, type, colorName);
        
        // 선택 데이터 저장
        this.analysisData.selectedColors[step] = {
            step,
            type,
            name: colorName,
            data: colorData,
            timestamp: Date.now()
        };
        
        // 터치 피드백
        this.createTouchFeedback(event);
        
        // 선택된 카드 시각적 강조
        const selectedCard = event.currentTarget;
        if (selectedCard) {
            selectedCard.classList.add('selected');
            
            // 다른 카드들 비선택 상태로
            const allCards = selectedCard.parentNode.parentNode.querySelectorAll('.color-card');
            allCards.forEach(card => {
                if (card !== selectedCard) {
                    card.classList.remove('selected');
                }
            });
        }
        
        // 2초간 컬러 미리보기
        this.showColorPreview(colorData);
        
        setTimeout(() => {
            this.hideColorPreview();
            this.proceedToNextStep();
        }, 2000);
    }
    
    /**
     * 색상 그룹 선택 처리
     */
    selectColorGroup(step, type, groupName) {
        console.log('색상 그룹 선택:', step, type, groupName);
        
        // 그룹 선택 데이터 저장
        this.analysisData.selectedColors[step] = {
            step,
            type,
            name: groupName,
            isGroup: true,
            timestamp: Date.now()
        };
        
        // 터치 피드백
        this.createTouchFeedback(event);
        
        setTimeout(() => {
            this.proceedToNextStep();
        }, 500);
    }
    
    /**
     * 다음 단계로 진행
     */
    proceedToNextStep() {
        if (this.analysisMode === 'photo') {
            // 사진 진단의 경우 바로 결과로
            this.generateResults();
        } else if (this.analysisMode === 'expert') {
            // 전문가 진단의 경우 다음 드래이핑 단계로
            const steps = ['temperature', 'brightness', 'saturation'];
            const currentIndex = steps.indexOf(this.currentDrapingStep);
            
            if (currentIndex < steps.length - 1) {
                this.currentDrapingStep = steps[currentIndex + 1];
                this.renderExpertAnalysis();
            } else {
                // 모든 단계 완료 - 결과 생성
                this.generateResults();
            }
        }
    }
    
    /**
     * 컬러 미리보기 표시
     */
    showColorPreview(colorData) {
        console.log('컬러 미리보기:', colorData.name);
        
        // 임시 미리보기 오버레이 생성
        const preview = document.createElement('div');
        preview.id = 'colorPreview';
        preview.className = 'color-preview active fixed inset-0 z-40 flex items-center justify-center';
        preview.style.backgroundColor = colorData.color;
        
        preview.innerHTML = `
            <div class="text-center text-white bg-black bg-opacity-50 p-8 rounded-3xl">
                <h3 class="text-4xl font-bold mb-4">${colorData.name}</h3>
                <p class="text-xl">${colorData.munsell}</p>
                <div class="mt-4 text-lg">2초간 미리보기...</div>
            </div>
        `;
        
        document.body.appendChild(preview);
        
        // 2초 후 자동 제거
        setTimeout(() => {
            if (preview.parentNode) {
                preview.parentNode.removeChild(preview);
            }
        }, 2000);
    }
    
    /**
     * 컬러 미리보기 숨기기
     */
    hideColorPreview() {
        const preview = document.getElementById('colorPreview');
        if (preview && preview.parentNode) {
            preview.parentNode.removeChild(preview);
        }
    }
    
    /**
     * 결과 생성 및 표시
     */
    generateResults() {
        console.log('결과 생성 시작');
        
        // 계절 결정
        const season = this.determineSeason();
        this.analysisData.finalSeason = season;
        this.analysisData.confidence = this.calculateConfidence();
        
        // 결과 화면으로 이동
        this.showStep(3);
        this.renderResults(season);
        
        console.log('결과 생성 완료:', season);
    }
    
    /**
     * 계절 결정 로직
     */
    determineSeason() {
        const selectedColors = this.analysisData.selectedColors;
        
        if (this.analysisMode === 'photo') {
            // 사진 진단 로직 (간단한 시뮬레이션)
            const seasons = ['Spring Light', 'Summer Light', 'Autumn Soft', 'Winter Bright'];
            return seasons[Math.floor(Math.random() * seasons.length)];
        } else {
            // 전문가 진단 로직
            const tempType = selectedColors.temperature?.type;
            const brightType = selectedColors.brightness?.type;
            const satType = selectedColors.saturation?.type;
            
            // 12계절 분류 로직
            if (tempType === 'warm') {
                if (brightType === 'light') {
                    return satType === 'muted' ? 'Spring Light' : 'Spring True';
                } else {
                    return satType === 'muted' ? 'Autumn Soft' : 'Autumn Deep';
                }
            } else {
                if (brightType === 'light') {
                    return satType === 'muted' ? 'Summer Light' : 'Summer True';
                } else {
                    return satType === 'vivid' ? 'Winter Bright' : 'Winter Deep';
                }
            }
        }
    }
    
    /**
     * 신뢰도 계산
     */
    calculateConfidence() {
        if (this.analysisMode === 'photo') {
            return 85;
        } else {
            const completedSteps = Object.keys(this.analysisData.selectedColors).length;
            return Math.min(95, 70 + (completedSteps * 8));
        }
    }
    
    /**
     * 결과 화면 렌더링
     */
    renderResults(season) {
        console.log('결과 화면 렌더링:', season);
        
        const content = document.getElementById('step-3');
        if (!content) return;
        
        const seasonData = SEASONS[season];
        const consultationMsg = CONSULTATION_MESSAGES[season];
        
        if (!seasonData) {
            console.error('계절 데이터 없음:', season);
            content.innerHTML = `
                <div class="text-center p-12">
                    <h2 class="text-3xl font-bold text-red-600 mb-4">오류 발생</h2>
                    <p class="text-xl text-gray-600">계절 데이터를 찾을 수 없습니다: ${season}</p>
                    <button onclick="resetApp()" class="mt-6 bg-blue-500 text-white px-8 py-4 rounded-xl">처음부터 다시</button>
                </div>
            `;
            return;
        }
        
        content.innerHTML = `
            <div class="w-full max-w-none">
                <!-- 결과 헤더 -->
                <div class="result-header bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-3xl shadow-2xl p-12 mb-12">
                    <div class="text-center">
                        <h2 class="text-5xl font-bold mb-6">🎉 진단 완료!</h2>
                        <div class="season-name result-font mb-6">${season}</div>
                        <p class="text-3xl mb-8 opacity-90 font-medium">${seasonData.characteristics}</p>
                        
                        <div class="flex justify-center space-x-16 mb-8">
                            <div class="text-center">
                                <div class="text-5xl font-bold">${this.analysisData.confidence}%</div>
                                <div class="text-xl opacity-80 mt-2">정확도</div>
                            </div>
                            <div class="text-center">
                                <div class="text-3xl font-bold">${this.analysisMode === 'photo' ? '사진분석' : '전문가급'}</div>
                                <div class="text-xl opacity-80 mt-2">분석 방법</div>
                            </div>
                            <div class="text-center">
                                <div class="text-3xl font-bold">${this.getCurrentDateTime()}</div>
                                <div class="text-xl opacity-80 mt-2">진단 일시</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 상담 멘트 -->
                ${consultationMsg ? `
                    <div class="consultation-bubble p-8 mb-12 mx-4">
                        <div class="flex items-start space-x-4">
                            <div class="flex-shrink-0">
                                <div class="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-2xl">
                                    👩‍🎨
                                </div>
                            </div>
                            <div class="flex-1">
                                <h3 class="text-2xl font-bold text-amber-800 mb-4">💬 전문가 상담 멘트</h3>
                                <p class="consultation-text">${consultationMsg.main || '당신만의 특별한 매력을 발견했습니다!'}</p>
                            </div>
                        </div>
                    </div>
                ` : ''}

                <!-- 추천 컬러 팔레트 -->
                <div class="bg-white rounded-3xl shadow-xl p-8 mb-8">
                    <h3 class="mega-font-sm text-gray-800 mb-8 text-center">🎨 추천 컬러 팔레트</h3>
                    <div class="color-palette">
                        ${seasonData.bestColors.map(color => `
                            <div class="palette-color" style="background: ${this.getColorHex(color)};" 
                                 title="${color}">
                                <div class="absolute inset-0 rounded-xl flex items-end justify-center pb-2">
                                    <span class="text-xs font-medium text-white bg-black bg-opacity-50 px-2 py-1 rounded">${color}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- 액션 버튼 -->
                <div class="text-center space-y-4">
                    <div class="flex justify-center space-x-4">
                        <button onclick="shareResults()" class="bg-green-500 text-white px-8 py-4 rounded-xl hover:bg-green-600 transition-all font-bold text-lg">
                            📱 결과 공유하기
                        </button>
                        <button onclick="exportToPDF()" class="bg-blue-500 text-white px-8 py-4 rounded-xl hover:bg-blue-600 transition-all font-bold text-lg">
                            📄 PDF로 저장
                        </button>
                    </div>
                    <button onclick="resetApp()" class="bg-gray-500 text-white px-8 py-4 rounded-xl hover:bg-gray-600 transition-all font-bold text-lg">
                        🔄 다시 진단하기
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * 현재 날짜 시간 반환
     */
    getCurrentDateTime() {
        return new Date().toLocaleString('ko-KR', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    /**
     * 색상명을 hex 코드로 변환
     */
    getColorHex(colorName) {
        const colorMap = {
            '아이보리': '#FFFFF0',
            '크림': '#FFF8DC', 
            '베이지': '#F5F5DC',
            '캐멀': '#C19A6B',
            '코랄 핑크': '#FF7F7F',
            '피치': '#FFCBA4',
            '라벤더': '#E6E6FA',
            '민트': '#98FF98',
            '라이트 골드': '#FFD700',
            '허니': '#FFA500',
            '복숭아': '#FFCBA4',
            '연한 터키석': '#AFEEEE',
            '순백색': '#FFFFFF',
            '검정색': '#000000',
            '네이비': '#000080',
            '와인 레드': '#722F37'
        };
        
        return colorMap[colorName] || '#CCCCCC';
    }
    
    /**
     * 색상 밝기 조절
     */
    adjustColorBrightness(hex, percent) {
        const num = parseInt(hex.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, Math.min(255, (num >> 16) + amt));
        const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amt));
        const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
        
        return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }
    
    /**
     * 터치 피드백 생성
     */
    createTouchFeedback(event) {
        if (!event || !event.currentTarget) return;
        
        const ripple = document.createElement('div');
        const rect = event.currentTarget.getBoundingClientRect();
        const size = 50;
        
        ripple.classList.add('touch-feedback');
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (event.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (event.clientY - rect.top - size / 2) + 'px';
        
        event.currentTarget.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }
    
    /**
     * 토글 콘텐츠
     */
    toggleContent(targetId) {
        const content = document.getElementById(targetId);
        const button = document.querySelector(`[data-target="${targetId}"]`);
        
        if (!content || !button) return;
        
        const arrow = button.querySelector('.toggle-arrow');
        
        if (content.classList.contains('expanded')) {
            content.classList.remove('expanded');
            if (arrow) arrow.classList.remove('rotated');
        } else {
            content.classList.add('expanded');
            if (arrow) arrow.classList.add('rotated');
        }
    }
    
    /**
     * 뒤로가기
     */
    goBack() {
        console.log('뒤로가기, 현재 단계:', this.currentStep);
        
        if (this.currentStep === 2 && this.analysisMode === 'expert') {
            // 전문가 진단 중이면 이전 드래이핑 단계로
            const steps = ['temperature', 'brightness', 'saturation'];
            const currentIndex = steps.indexOf(this.currentDrapingStep);
            
            if (currentIndex > 0) {
                this.currentDrapingStep = steps[currentIndex - 1];
                this.renderExpertAnalysis();
                return;
            }
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
                    confidence: 0
                };
                this.currentDrapingStep = 'temperature';
            }
        }
    }
    
    /**
     * 다음으로
     */
    goNext() {
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
            confidence: 0
        };
        
        this.showStep(0);
    }
    
    /**
     * PDF 내보내기
     */
    exportToPDF() {
        console.log('PDF 내보내기 시작');
        
        const printContent = document.getElementById('step-3');
        if (printContent) {
            window.print();
        }
    }
    
    /**
     * 결과 공유
     */
    shareResults() {
        console.log('결과 공유');
        
        const shareData = {
            title: '퍼스널컬러 진단 결과',
            text: `내 퍼스널컬러는 ${this.analysisData.finalSeason}입니다! (정확도: ${this.analysisData.confidence}%)`,
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

// 앱 인스턴스 생성 및 초기화
let app = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 로드 완료 - 앱 초기화 시작');
    
    try {
        app = new PersonalColorAnalyzer();
        window.app = app;
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
