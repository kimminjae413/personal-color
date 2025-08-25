/**
 * DiagnosisMode.js - 진단 모드 관리 시스템
 * 
 * AI 사진 분석 모드와 전문가 드레이핑 모드 간의 전환 및 관리
 * 고객별 맞춤 모드 추천 및 진단 품질 최적화
 */

class DiagnosisMode {
    constructor() {
        this.currentMode = null;
        this.availableModes = {
            AI_PHOTO: 'ai_photo',
            DRAPING: 'draping',
            HYBRID: 'hybrid'
        };
        
        this.modeConfigs = {
            ai_photo: {
                name: 'AI 사진 분석',
                description: '스마트폰 카메라로 간편하게 진단',
                icon: 'camera',
                duration: '5-7분',
                accuracy: 85,
                advantages: [
                    '빠른 진단 속도',
                    '객관적 색상 분석',
                    '일관된 결과',
                    '데이터 기반 추천'
                ],
                limitations: [
                    '조명 환경에 민감',
                    '화장 상태에 영향',
                    '개인 선호 미반영'
                ],
                requirements: [
                    '자연광 또는 표준 조명',
                    '최소한의 메이크업',
                    '정면 얼굴 사진'
                ]
            },
            draping: {
                name: '전문가 드레이핑',
                description: '색상 천을 활용한 정밀 진단',
                icon: 'palette',
                duration: '15-20분',
                accuracy: 95,
                advantages: [
                    '매우 높은 정확도',
                    '전문가 경험 반영',
                    '미세한 차이 감지',
                    '개인 특성 고려'
                ],
                limitations: [
                    '시간 소요',
                    '전문가 숙련도 필요',
                    '주관적 판단 요소'
                ],
                requirements: [
                    '표준 조명 환경',
                    '색상 드레이핑 천',
                    '전문가 경험'
                ]
            },
            hybrid: {
                name: '하이브리드 진단',
                description: 'AI 분석 + 전문가 검증',
                icon: 'layers',
                duration: '10-15분',
                accuracy: 98,
                advantages: [
                    '최고 정확도',
                    '속도와 정밀도 균형',
                    'AI + 인간 장점 결합',
                    '종합적 분석'
                ],
                limitations: [
                    '중간 수준 시간 소요'
                ],
                requirements: [
                    'AI 분석 + 드레이핑 검증',
                    '표준 환경',
                    '전문가 최종 확인'
                ]
            }
        };

        this.customerProfiles = {
            FIRST_VISIT: 'first_visit',
            REGULAR: 'regular',
            VIP: 'vip',
            QUICK_SERVICE: 'quick_service'
        };

        this.environmentFactors = {
            lighting: null,
            timeConstraint: null,
            customerType: null,
            equipmentAvailable: null
        };

        this.init();
    }

    /**
     * 시스템 초기화
     */
    init() {
        this.setupEventListeners();
        this.loadUserPreferences();
        this.checkEnvironment();
        console.log('DiagnosisMode system initialized');
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 모드 선택 버튼
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-mode]')) {
                const mode = e.target.dataset.mode;
                this.selectMode(mode);
            }
        });

        // 환경 변화 감지
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.checkEnvironment();
            }
        });

        // 커스텀 이벤트 리스너
        document.addEventListener('environmentChanged', (e) => {
            this.handleEnvironmentChange(e.detail);
        });
    }

    /**
     * 진단 모드 선택
     * @param {string} mode - 선택할 모드
     * @param {Object} options - 추가 옵션
     */
    async selectMode(mode, options = {}) {
        try {
            // 모드 유효성 검사
            if (!this.isValidMode(mode)) {
                throw new Error(`Invalid mode: ${mode}`);
            }

            // 환경 적합성 검사
            const compatibility = await this.checkModeCompatibility(mode);
            if (!compatibility.suitable) {
                this.showCompatibilityWarning(compatibility);
                return false;
            }

            // 이전 모드 정리
            if (this.currentMode) {
                await this.cleanupCurrentMode();
            }

            // 새 모드 설정
            this.currentMode = mode;
            await this.initializeMode(mode, options);

            // UI 업데이트
            this.updateModeUI();

            // 분석 데이터 기록
            this.recordModeSelection(mode, options);

            // 이벤트 발생
            this.dispatchModeChangeEvent(mode);

            console.log(`Diagnosis mode changed to: ${mode}`);
            return true;

        } catch (error) {
            console.error('Mode selection failed:', error);
            this.showError('모드 변경 중 오류가 발생했습니다.');
            return false;
        }
    }

    /**
     * 고객 맞춤 모드 추천
     * @param {Object} customerInfo - 고객 정보
     * @returns {Object} 추천 모드 정보
     */
    recommendMode(customerInfo = {}) {
        const {
            visitHistory = 0,
            timeAvailable = 20,
            previousResults = null,
            preferences = {},
            skinConcerns = [],
            ageGroup = 'adult'
        } = customerInfo;

        let recommendedMode = this.availableModes.AI_PHOTO;
        let confidence = 0;
        const reasons = [];

        // 시간 제약 고려
        if (timeAvailable <= 10) {
            recommendedMode = this.availableModes.AI_PHOTO;
            confidence += 30;
            reasons.push('시간 제약으로 인한 빠른 진단');
        } else if (timeAvailable >= 20) {
            recommendedMode = this.availableModes.DRAPING;
            confidence += 20;
            reasons.push('충분한 시간 확보');
        }

        // 방문 이력 고려
        if (visitHistory === 0) {
            // 첫 방문 - 하이브리드 추천
            recommendedMode = this.availableModes.HYBRID;
            confidence += 25;
            reasons.push('첫 방문 고객을 위한 정확한 진단');
        } else if (visitHistory >= 3) {
            // 단골 고객 - 선호도 반영
            if (preferences.mode) {
                recommendedMode = preferences.mode;
                confidence += 35;
                reasons.push('고객 선호도 반영');
            }
        }

        // 이전 결과 고려
        if (previousResults) {
            if (previousResults.accuracy < 0.85) {
                recommendedMode = this.availableModes.DRAPING;
                confidence += 20;
                reasons.push('이전 결과 정확도 개선 필요');
            }
        }

        // 특수 케이스
        if (skinConcerns.includes('sensitive')) {
            recommendedMode = this.availableModes.AI_PHOTO;
            confidence += 15;
            reasons.push('민감한 피부를 위한 비접촉 진단');
        }

        return {
            mode: recommendedMode,
            confidence: Math.min(confidence, 95),
            reasons: reasons,
            alternatives: this.getAlternativeModes(recommendedMode),
            estimation: this.getTimeEstimation(recommendedMode)
        };
    }

    /**
     * 모드 호환성 검사
     * @param {string} mode - 검사할 모드
     * @returns {Object} 호환성 정보
     */
    async checkModeCompatibility(mode) {
        const config = this.modeConfigs[mode];
        const issues = [];
        let suitable = true;

        // 조명 환경 검사
        const lightingQuality = await this.checkLightingQuality();
        if (lightingQuality < 0.7 && (mode === 'ai_photo' || mode === 'hybrid')) {
            issues.push({
                type: 'lighting',
                severity: 'warning',
                message: '조명이 부족합니다. 자연광이나 표준 조명을 사용하세요.',
                solution: '창가 이동 또는 조명 개선'
            });
        }

        // 장비 가용성 검사
        if (mode === 'draping' || mode === 'hybrid') {
            const drapingAvailable = await this.checkDrapingEquipment();
            if (!drapingAvailable) {
                issues.push({
                    type: 'equipment',
                    severity: 'error',
                    message: '드레이핑 천이 준비되지 않았습니다.',
                    solution: '드레이핑 세트 준비'
                });
                suitable = false;
            }
        }

        // 카메라 접근성 검사
        if (mode === 'ai_photo' || mode === 'hybrid') {
            const cameraAvailable = await this.checkCameraAccess();
            if (!cameraAvailable) {
                issues.push({
                    type: 'camera',
                    severity: 'error', 
                    message: '카메라에 접근할 수 없습니다.',
                    solution: '카메라 권한 허용'
                });
                suitable = false;
            }
        }

        return {
            suitable: suitable,
            issues: issues,
            score: this.calculateCompatibilityScore(issues)
        };
    }

    /**
     * 모드별 시간 예상
     * @param {string} mode - 모드
     * @returns {Object} 시간 정보
     */
    getTimeEstimation(mode) {
        const config = this.modeConfigs[mode];
        const baseTime = this.parseTimeRange(config.duration);
        
        return {
            minimum: baseTime.min,
            maximum: baseTime.max,
            average: Math.round((baseTime.min + baseTime.max) / 2),
            factors: this.getTimeFactors(mode)
        };
    }

    /**
     * 시간 영향 요인
     * @param {string} mode - 모드
     * @returns {Array} 영향 요인 목록
     */
    getTimeFactors(mode) {
        const commonFactors = [
            '고객 협조도',
            '환경 준비 상태',
            '시스템 성능'
        ];

        const modeSpecificFactors = {
            ai_photo: [
                '조명 조정 시간',
                '사진 재촬영 횟수',
                'AI 처리 속도'
            ],
            draping: [
                '색상 천 준비',
                '세밀한 비교 과정',
                '전문가 판단 시간'
            ],
            hybrid: [
                'AI 분석 + 드레이핑 검증',
                '결과 비교 및 조정'
            ]
        };

        return [...commonFactors, ...(modeSpecificFactors[mode] || [])];
    }

    /**
     * 대안 모드 제안
     * @param {string} primaryMode - 주 모드
     * @returns {Array} 대안 모드 목록
     */
    getAlternativeModes(primaryMode) {
        const alternatives = [];
        
        Object.keys(this.modeConfigs).forEach(mode => {
            if (mode !== primaryMode) {
                alternatives.push({
                    mode: mode,
                    reason: this.getAlternativeReason(primaryMode, mode),
                    tradeoff: this.getTradeoffInfo(primaryMode, mode)
                });
            }
        });

        return alternatives.sort((a, b) => b.tradeoff.score - a.tradeoff.score);
    }

    /**
     * 모드 간 교환 조건 분석
     * @param {string} fromMode - 원래 모드
     * @param {string} toMode - 대안 모드
     * @returns {Object} 교환 조건 정보
     */
    getTradeoffInfo(fromMode, toMode) {
        const fromConfig = this.modeConfigs[fromMode];
        const toConfig = this.modeConfigs[toMode];
        
        const accuracyDiff = toConfig.accuracy - fromConfig.accuracy;
        const timeDiff = this.compareTime(toConfig.duration, fromConfig.duration);
        
        let score = 50;
        const factors = [];

        if (accuracyDiff > 0) {
            score += accuracyDiff;
            factors.push(`정확도 +${accuracyDiff}%`);
        } else if (accuracyDiff < 0) {
            score += accuracyDiff;
            factors.push(`정확도 ${accuracyDiff}%`);
        }

        if (timeDiff > 0) {
            score -= timeDiff * 2;
            factors.push(`시간 +${timeDiff}분`);
        } else if (timeDiff < 0) {
            score += Math.abs(timeDiff);
            factors.push(`시간 ${timeDiff}분`);
        }

        return {
            score: Math.max(0, Math.min(100, score)),
            factors: factors,
            recommendation: score > 60 ? 'recommended' : score > 40 ? 'neutral' : 'not_recommended'
        };
    }

    /**
     * 현재 환경 상태 확인
     */
    async checkEnvironment() {
        this.environmentFactors = {
            lighting: await this.checkLightingQuality(),
            cameraAccess: await this.checkCameraAccess(),
            drapingEquipment: await this.checkDrapingEquipment(),
            networkStatus: navigator.onLine,
            devicePerformance: this.assessDevicePerformance(),
            timestamp: Date.now()
        };

        this.dispatchEvent('environmentUpdated', this.environmentFactors);
    }

    /**
     * 조명 품질 평가
     * @returns {number} 0-1 사이의 품질 점수
     */
    async checkLightingQuality() {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                return 0.5; // 기본값
            }

            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 320, height: 240 } 
            });
            
            const video = document.createElement('video');
            video.srcObject = stream;
            await new Promise(resolve => {
                video.onloadedmetadata = resolve;
                video.play();
            });

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            ctx.drawImage(video, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // 스트림 정리
            stream.getTracks().forEach(track => track.stop());

            // 밝기 분석
            const brightness = this.analyzeBrightness(imageData.data);
            const contrast = this.analyzeContrast(imageData.data);
            
            return Math.min(1, (brightness + contrast) / 2);

        } catch (error) {
            console.warn('Lighting quality check failed:', error);
            return 0.5;
        }
    }

    /**
     * 카메라 접근 가능성 확인
     * @returns {boolean}
     */
    async checkCameraAccess() {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                return false;
            }

            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * 드레이핑 장비 확인
     * @returns {boolean}
     */
    async checkDrapingEquipment() {
        // 실제 구현에서는 장비 상태를 확인하는 로직
        // 현재는 설정값으로 대체
        return localStorage.getItem('drapingEquipmentReady') === 'true';
    }

    /**
     * 디바이스 성능 평가
     * @returns {number} 성능 점수 (0-1)
     */
    assessDevicePerformance() {
        const navigator = window.navigator;
        let score = 0.5;

        // 메모리 정보
        if (navigator.deviceMemory) {
            score += Math.min(navigator.deviceMemory / 8, 0.3);
        }

        // 하드웨어 동시성
        if (navigator.hardwareConcurrency) {
            score += Math.min(navigator.hardwareConcurrency / 8, 0.2);
        }

        return Math.min(1, score);
    }

    /**
     * 모드 전환 애니메이션
     * @param {string} newMode - 새 모드
     */
    async animateModeTransition(newMode) {
        const container = document.querySelector('.diagnosis-container');
        if (!container) return;

        // 페이드 아웃
        container.style.transition = 'opacity 0.3s ease';
        container.style.opacity = '0';

        await new Promise(resolve => setTimeout(resolve, 300));

        // 모드별 UI 업데이트
        this.updateModeContent(newMode);

        // 페이드 인
        container.style.opacity = '1';
    }

    /**
     * 모드별 콘텐츠 업데이트
     * @param {string} mode - 모드
     */
    updateModeContent(mode) {
        const config = this.modeConfigs[mode];
        if (!config) return;

        // 제목 업데이트
        const titleElement = document.querySelector('.mode-title');
        if (titleElement) {
            titleElement.textContent = config.name;
        }

        // 설명 업데이트
        const descElement = document.querySelector('.mode-description');
        if (descElement) {
            descElement.textContent = config.description;
        }

        // 아이콘 업데이트
        const iconElement = document.querySelector('.mode-icon');
        if (iconElement) {
            iconElement.className = `mode-icon icon-${config.icon}`;
        }

        // 예상 시간 업데이트
        const timeElement = document.querySelector('.mode-duration');
        if (timeElement) {
            timeElement.textContent = config.duration;
        }
    }

    /**
     * 모드별 설정 저장
     * @param {string} mode - 모드
     * @param {Object} settings - 설정
     */
    saveModeSettings(mode, settings) {
        const key = `mode_settings_${mode}`;
        localStorage.setItem(key, JSON.stringify({
            ...settings,
            lastUpdated: Date.now()
        }));
    }

    /**
     * 모드별 설정 로드
     * @param {string} mode - 모드
     * @returns {Object} 설정
     */
    loadModeSettings(mode) {
        const key = `mode_settings_${mode}`;
        const stored = localStorage.getItem(key);
        
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (error) {
                console.warn('Failed to parse mode settings:', error);
            }
        }

        return this.getDefaultModeSettings(mode);
    }

    /**
     * 기본 모드 설정
     * @param {string} mode - 모드
     * @returns {Object} 기본 설정
     */
    getDefaultModeSettings(mode) {
        const defaults = {
            ai_photo: {
                autoCapture: true,
                imageQuality: 0.9,
                analysisDepth: 'standard',
                colorSpace: 'sRGB'
            },
            draping: {
                colorSequence: 'seasonal',
                comparisonMethod: 'side_by_side',
                documentationLevel: 'detailed'
            },
            hybrid: {
                aiWeight: 0.6,
                expertWeight: 0.4,
                conflictResolution: 'expert_priority'
            }
        };

        return defaults[mode] || {};
    }

    /**
     * 사용자 선호도 저장
     */
    saveUserPreferences() {
        const preferences = {
            preferredMode: this.currentMode,
            environmentFactors: this.environmentFactors,
            lastUsed: Date.now()
        };

        localStorage.setItem('diagnosis_preferences', JSON.stringify(preferences));
    }

    /**
     * 사용자 선호도 로드
     */
    loadUserPreferences() {
        const stored = localStorage.getItem('diagnosis_preferences');
        if (stored) {
            try {
                const preferences = JSON.parse(stored);
                if (preferences.preferredMode && this.isValidMode(preferences.preferredMode)) {
                    this.currentMode = preferences.preferredMode;
                }
            } catch (error) {
                console.warn('Failed to load user preferences:', error);
            }
        }
    }

    /**
     * 유틸리티 메서드들
     */
    isValidMode(mode) {
        return Object.values(this.availableModes).includes(mode);
    }

    parseTimeRange(timeString) {
        const match = timeString.match(/(\d+)-(\d+)/);
        if (match) {
            return { min: parseInt(match[1]), max: parseInt(match[2]) };
        }
        return { min: 10, max: 15 };
    }

    compareTime(time1, time2) {
        const avg1 = (this.parseTimeRange(time1).min + this.parseTimeRange(time1).max) / 2;
        const avg2 = (this.parseTimeRange(time2).min + this.parseTimeRange(time2).max) / 2;
        return avg1 - avg2;
    }

    calculateCompatibilityScore(issues) {
        let score = 100;
        issues.forEach(issue => {
            if (issue.severity === 'error') score -= 30;
            else if (issue.severity === 'warning') score -= 10;
        });
        return Math.max(0, score);
    }

    analyzeBrightness(imageData) {
        let sum = 0;
        for (let i = 0; i < imageData.length; i += 4) {
            const brightness = (imageData[i] + imageData[i + 1] + imageData[i + 2]) / 3;
            sum += brightness;
        }
        return (sum / (imageData.length / 4)) / 255;
    }

    analyzeContrast(imageData) {
        const values = [];
        for (let i = 0; i < imageData.length; i += 4) {
            values.push((imageData[i] + imageData[i + 1] + imageData[i + 2]) / 3);
        }
        
        const mean = values.reduce((a, b) => a + b) / values.length;
        const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
        
        return Math.min(1, Math.sqrt(variance) / 128);
    }

    dispatchEvent(eventName, data) {
        document.dispatchEvent(new CustomEvent(eventName, { detail: data }));
    }

    // 추가 유틸리티 메서드들...
    async cleanupCurrentMode() {
        // 현재 모드 정리 로직
        console.log(`Cleaning up ${this.currentMode} mode`);
    }

    async initializeMode(mode, options) {
        // 새 모드 초기화 로직
        console.log(`Initializing ${mode} mode with options:`, options);
    }

    updateModeUI() {
        // UI 업데이트 로직
        document.body.classList.toggle('mode-ai-photo', this.currentMode === 'ai_photo');
        document.body.classList.toggle('mode-draping', this.currentMode === 'draping');
        document.body.classList.toggle('mode-hybrid', this.currentMode === 'hybrid');
    }

    recordModeSelection(mode, options) {
        // 분석용 데이터 기록
        const record = {
            mode: mode,
            timestamp: Date.now(),
            options: options,
            environment: this.environmentFactors
        };
        
        // 로컬 스토리지에 기록
        const history = JSON.parse(localStorage.getItem('mode_history') || '[]');
        history.push(record);
        
        // 최근 100개만 유지
        if (history.length > 100) {
            history.splice(0, history.length - 100);
        }
        
        localStorage.setItem('mode_history', JSON.stringify(history));
    }

    dispatchModeChangeEvent(mode) {
        this.dispatchEvent('modeChanged', {
            newMode: mode,
            timestamp: Date.now(),
            config: this.modeConfigs[mode]
        });
    }

    getAlternativeReason(primaryMode, alternativeMode) {
        const reasons = {
            ai_photo: {
                draping: '더 정확한 결과를 원한다면',
                hybrid: '최고 품질의 진단을 원한다면'
            },
            draping: {
                ai_photo: '시간을 절약하고 싶다면',
                hybrid: 'AI 분석도 함께 받고 싶다면'
            },
            hybrid: {
                ai_photo: '빠른 진단이 필요하다면',
                draping: '전통적인 방식을 선호한다면'
            }
        };

        return reasons[primaryMode]?.[alternativeMode] || '다른 접근 방식을 시도해보고 싶다면';
    }

    showCompatibilityWarning(compatibility) {
        // 호환성 경고 표시
        console.warn('Mode compatibility issues:', compatibility.issues);
    }

    showError(message) {
        // 에러 메시지 표시
        console.error(message);
    }

    handleEnvironmentChange(changes) {
        // 환경 변화 처리
        console.log('Environment changed:', changes);
    }
}

// 전역 인스턴스
const diagnosisMode = new DiagnosisMode();

// 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DiagnosisMode;
} else if (typeof window !== 'undefined') {
    window.DiagnosisMode = DiagnosisMode;
    window.diagnosisMode = diagnosisMode;
}
