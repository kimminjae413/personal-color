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
                                                 style="--chip-color: ${color.color}; --chip-shadow: ${this.adjustColorBrightness(color.color, -15)}; background: linear-gradient(135deg, var(--chip-color), var(--chip-shadow));"></div>
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
        if (this.analysisMode === 'simple') {
            // 간편 진단의 경우 바로 결과로
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
        
        const preview = document.getElementById('colorPreview');
        const previewText = document.getElementById('previewText');
        
        if (preview && previewText) {
            preview.style.backgroundColor = colorData.color;
            previewText.textContent = colorData.name;
            preview.classList.add('active');
        }
    }
    
    /**
     * 컬러 미리보기 숨기기
     */
    hideColorPreview() {
        const preview = document.getElementById('colorPreview');
        if (preview) {
            preview.classList.remove('active');
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
        
        if (this.analysisMode === 'simple') {
            // 간편 진단 로직
            const tempType = selectedColors.temperature?.type;
            if (tempType === 'warm') {
                return 'Spring Light';
            } else {
                return 'Summer Light';
            }
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
        if (this.analysisMode === 'simple') {
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
        
        if (!seasonData || !consultationMsg) {
            console.error('계절 데이터 없음:', season);
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
                                <div class="text-3xl font-bold">${this.analysisMode === 'simple' ? '간편' : '전문가급'}</div>
                                <div class="text-xl opacity-80 mt-2">분석 방법</div>
                            </div>
                            <div class="text-center">
                                <div class="text-3xl font-bold" id="analysis-date">${this.getCurrentDateTime()}</div>
                                <div class="text-xl opacity-80 mt-2">진단 일시</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 상담 멘트 (자동 노출) -->
                <div class="consultation-bubble p-8 mb-12 mx-4">
                    <div class="flex items-start space-x-4">
                        <div class="flex-shrink-0">
                            <div class="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-2xl">
                                👩‍🎨
                            </div>
                        </div>
                        <div class="flex-1">
                            <h3 class="text-2xl font-bold text-amber-800 mb-4">💬 전문가 상담 멘트</h3>
                            <p class="consultation-text">${consultationMsg.main}</p>
                        </div>
                    </div>
                </div>

                <!-- 상세 분석 결과 -->
                <div class="space-y-12">
                    <!-- 추천 컬러 팔레트 -->
                    <div class="bg-white rounded-3xl shadow-xl p-8">
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

                    <!-- 메이크업 & 헤어 가이드 -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <!-- 메이크업 팁 -->
                        <div class="bg-gradient-to-br from-pink-50 to-rose-50 rounded-3xl p-8 border border-pink-200">
                            <div class="consultation-bubble bg-gradient-to-r from-pink-100 to-rose-100 border-l-pink-400">
                                <div class="consultation-text text-pink-800">
                                    <strong>💄 메이크업 팁:</strong> ${consultationMsg.makeup}
                                </div>
                            </div>
                        </div>
                        
                        <!-- 헤어 추천 -->
                        <div class="bg-gradient-to-br from-purple-50 to-violet-50 rounded-3xl p-8 border border-purple-200">
                            <div class="consultation-bubble bg-gradient-to-r from-purple-100 to-violet-100 border-l-purple-400">
                                <div class="consultation-text text-purple-800">
                                    <strong>💇‍♀️ 헤어 추천:</strong> ${consultationMsg.hair}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 피해야 할 컬러 -->
                    <div class="bg-white rounded-3xl shadow-xl p-8">
                        <h3 class="mega-font-sm text-gray-800 mb-8 text-center">❌ 피해야 할 컬러</h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                            ${seasonData.worstColors.map(color => `
                                <div class="text-center">
                                    <div class="w-20 h-20 rounded-xl mx-auto mb-3 border-4 border-red-300 relative" 
                                         style="background: ${this.getColorHex(color)};">
                                        <div class="absolute inset-0 flex items-center justify-center">
                                            <div class="w-16 h-0.5 bg-red-500 transform rotate-45"></div>
                                            <div class="w-16 h-0.5 bg-red-500 transform -rotate-45 absolute"></div>
                                        </div>
                                    </div>
                                    <p class="text-lg font-medium text-red-700">${color}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- 상세 분석 -->
                    <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-200">
                        <div class="consultation-bubble bg-gradient-to-r from-blue-100 to-indigo-100 border-l-blue-400">
                            <div class="consultation-text text-blue-800">
                                <strong>✨ 상세 분석:</strong> ${consultationMsg.detailed}
                            </div>
                        </div>
                    </div>

                    <!-- 유명인 매칭 -->
                    ${seasonData.celebrities ? `
                        <div class="bg-white rounded-3xl shadow-xl p-8">
                            <h3 class="mega-font-sm text-gray-800 mb-8 text-center">👥 비슷한 톤의 연예인</h3>
                            <div class="text-center">
                                <div class="flex justify-center space-x-8 mb-6">
                                    ${seasonData.celebrities.slice(0, 4).map(celebrity => `
                                        <div class="text-center">
                                            <div class="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-2xl mb-2">
                                                👤
                                            </div>
                                            <p class="text-lg font-semibold">${celebrity}</p>
                                        </div>
                                    `).join('')}
                                </div>
                                <p class="large-font text-gray-600">같은 계절 타입의 대표적인 연예인들입니다</p>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        // 아이콘 초기화
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    /**
     * 현재 날짜 시간 반환
     */
    getCurrentDateTime() {
        return new Date().toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long', 
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
            '코랄 핑크': '#FF7F7F',
            '피치': '#FFCBA4',
            '라벤더': '#E6E6FA',
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
            confidence: 0
        };
        
        this.showStep(0);
    }
    
    /**
     * PDF 내보내기
     */
    exportToPDF() {
        console.log('PDF 내보내기 시작');
        
        // 간단한 구현 (실제로는 jsPDF 등의 라이브러리 필요)
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

console.log('app.js 로딩 완료');역 함수 등록 (HTML에서 호출하는 함수들)
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
