/**
 * ComparisonTool.js
 * 드레이핑 비교 도구 - Before/After 분석 시스템
 * 
 * 기능:
 * - 실시간 비교 인터페이스
 * - 얼굴 분석 및 색상 효과 측정
 * - 전문가용 평가 도구
 * - 고객 만족도 측정
 * - 보고서 생성
 */

class ComparisonTool {
    constructor() {
        this.initialized = false;
        this.comparisonData = [];
        this.currentComparison = null;
        this.analysisResults = {};
        this.faceAnalyzer = null;
        
        // 비교 설정
        this.settings = {
            analysis_mode: 'professional', // basic, professional, expert
            show_overlays: true,
            enable_metrics: true,
            auto_save: true,
            comparison_delay: 2000 // 2초 간격으로 자동 전환
        };
        
        console.log('📊 ComparisonTool 생성자 실행');
    }

    /**
     * 시스템 초기화
     */
    async initialize() {
        try {
            console.log('🚀 ComparisonTool 초기화 시작...');
            
            // 얼굴 분석 모듈 초기화
            await this.initializeFaceAnalyzer();
            
            // UI 컨트롤러 설정
            this.setupUIControls();
            
            // 이벤트 리스너 등록
            this.attachEventListeners();
            
            this.initialized = true;
            console.log('✅ ComparisonTool 초기화 완료');
            return true;
            
        } catch (error) {
            console.error('❌ ComparisonTool 초기화 실패:', error);
            return false;
        }
    }

    /**
     * 얼굴 분석 모듈 초기화
     */
    async initializeFaceAnalyzer() {
        this.faceAnalyzer = {
            // 피부톤 분석 포인트
            skinAnalysisPoints: [
                { name: 'forehead', x: 0.5, y: 0.3 },
                { name: 'cheek_left', x: 0.3, y: 0.5 },
                { name: 'cheek_right', x: 0.7, y: 0.5 },
                { name: 'nose', x: 0.5, y: 0.45 },
                { name: 'chin', x: 0.5, y: 0.7 }
            ],
            
            // 분석 지표
            metrics: {
                brightness: { weight: 0.25, description: '피부 밝기' },
                clarity: { weight: 0.2, description: '피부 선명도' },
                warmth: { weight: 0.2, description: '피부 온도감' },
                harmony: { weight: 0.15, description: '색상 조화도' },
                vitality: { weight: 0.1, description: '생기' },
                contrast: { weight: 0.1, description: '대비감' }
            }
        };
        
        console.log('✅ 얼굴 분석 모듈 초기화 완료');
    }

    /**
     * UI 컨트롤러 설정
     */
    setupUIControls() {
        this.uiControls = {
            // 비교 모드
            comparisonModes: [
                { id: 'side_by_side', name: '나란히 비교', icon: '⚖️' },
                { id: 'overlay', name: '오버레이', icon: '🎭' },
                { id: 'split_screen', name: '분할 화면', icon: '📱' },
                { id: 'slider', name: '슬라이더', icon: '🎚️' },
                { id: 'auto_toggle', name: '자동 전환', icon: '🔄' }
            ],
            
            // 분석 도구
            analysisTools: [
                { id: 'skin_tone', name: '피부톤 분석', active: true },
                { id: 'color_harmony', name: '색상 조화', active: true },
                { id: 'face_shape', name: '얼굴형 분석', active: false },
                { id: 'lighting', name: '조명 효과', active: true },
                { id: 'texture', name: '질감 분석', active: false }
            ],
            
            // 측정 옵션
            measurementOptions: [
                { id: 'brightness_change', name: '밝기 변화량' },
                { id: 'color_temperature', name: '색온도 변화' },
                { id: 'saturation_impact', name: '채도 영향' },
                { id: 'contrast_ratio', name: '대비 비율' },
                { id: 'harmony_score', name: '조화도 점수' }
            ]
        };
        
        console.log('✅ UI 컨트롤러 설정 완료');
    }

    /**
     * 이벤트 리스너 등록
     */
    attachEventListeners() {
        // 키보드 단축키
        document.addEventListener('keydown', (e) => {
            if (this.currentComparison) {
                switch(e.key) {
                    case ' ': // 스페이스바 - 토글
                        e.preventDefault();
                        this.toggleComparison();
                        break;
                    case 'ArrowLeft': // 이전 비교
                        this.showPreviousComparison();
                        break;
                    case 'ArrowRight': // 다음 비교
                        this.showNextComparison();
                        break;
                    case 's': // 저장
                        if (e.ctrlKey) {
                            e.preventDefault();
                            this.saveCurrentComparison();
                        }
                        break;
                }
            }
        });
        
        console.log('✅ 이벤트 리스너 등록 완료');
    }

    /**
     * 새 비교 시작
     * @param {Object} beforeImage - 이전 이미지 데이터
     * @param {Object} afterImage - 이후 이미지 데이터
     * @param {Object} drapingInfo - 드레이핑 정보
     */
    startComparison(beforeImage, afterImage, drapingInfo = {}) {
        if (!this.initialized) {
            console.error('ComparisonTool이 초기화되지 않았습니다.');
            return null;
        }

        try {
            // 비교 데이터 생성
            const comparisonId = this.generateComparisonId();
            
            this.currentComparison = {
                id: comparisonId,
                timestamp: new Date().toISOString(),
                
                // 이미지 데이터
                before: {
                    image: beforeImage,
                    analysis: null,
                    dominant_colors: []
                },
                after: {
                    image: afterImage,
                    analysis: null,
                    dominant_colors: []
                },
                
                // 드레이핑 정보
                draping: {
                    fabric_color: drapingInfo.fabricColor || '#FFFFFF',
                    fabric_type: drapingInfo.fabricType || 'silk',
                    lighting_condition: drapingInfo.lighting || 'natural',
                    season_tested: drapingInfo.season || 'unknown'
                },
                
                // 설정
                settings: { ...this.settings },
                
                // 결과 (나중에 채움)
                results: {
                    metrics: {},
                    recommendations: [],
                    expert_notes: '',
                    customer_rating: null
                }
            };
            
            // 즉시 분석 시작
            this.analyzeComparison();
            
            console.log('✅ 새 비교 시작:', comparisonId);
            return comparisonId;
            
        } catch (error) {
            console.error('❌ 비교 시작 중 오류:', error);
            return null;
        }
    }

    /**
     * 비교 분석 수행
     */
    async analyzeComparison() {
        if (!this.currentComparison) return;
        
        try {
            console.log('🔍 비교 분석 시작...');
            
            // 1단계: 개별 이미지 분석
            this.currentComparison.before.analysis = await this.analyzeImage(
                this.currentComparison.before.image, 'before'
            );
            
            this.currentComparison.after.analysis = await this.analyzeImage(
                this.currentComparison.after.image, 'after'
            );
            
            // 2단계: 비교 메트릭 계산
            const metrics = this.calculateComparisonMetrics(
                this.currentComparison.before.analysis,
                this.currentComparison.after.analysis
            );
            
            // 3단계: 개선 사항 분석
            const improvements = this.analyzeImprovements(metrics);
            
            // 4단계: 전문가 추천사항 생성
            const recommendations = this.generateRecommendations(metrics, improvements);
            
            // 결과 저장
            this.currentComparison.results = {
                metrics: metrics,
                improvements: improvements,
                recommendations: recommendations,
                overall_score: this.calculateOverallScore(metrics),
                analysis_timestamp: new Date().toISOString()
            };
            
            // 분석 완료 이벤트 발생
            this.dispatchEvent('analysisComplete', this.currentComparison);
            
            console.log('✅ 비교 분석 완료');
            
        } catch (error) {
            console.error('❌ 비교 분석 중 오류:', error);
        }
    }

    /**
     * 개별 이미지 분석
     */
    async analyzeImage(imageData, type) {
        return new Promise((resolve) => {
            // Canvas 생성 및 이미지 로드
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (typeof imageData === 'string') {
                // Base64 이미지 처리
                const img = new Image();
                img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    
                    const analysis = this.performImageAnalysis(canvas, ctx, type);
                    resolve(analysis);
                };
                img.src = imageData;
            } else {
                // Canvas 또는 ImageData 객체 처리
                resolve(this.performImageAnalysis(canvas, ctx, type));
            }
        });
    }

    /**
     * 이미지 분석 수행
     */
    performImageAnalysis(canvas, ctx, type) {
        const width = canvas.width;
        const height = canvas.height;
        
        // 얼굴 영역 감지 (간소화된 버전)
        const faceRegion = this.detectFaceRegion(width, height);
        
        // 피부톤 분석 포인트에서 색상 추출
        const skinColors = this.extractSkinColors(ctx, faceRegion);
        
        // 전체 이미지 분석
        const imageStats = this.analyzeImageStatistics(ctx, width, height);
        
        // 조명 조건 분석
        const lighting = this.analyzeLighting(imageStats);
        
        return {
            type: type,
            dimensions: { width, height },
            face_region: faceRegion,
            skin_colors: skinColors,
            image_stats: imageStats,
            lighting: lighting,
            dominant_colors: this.extractDominantColors(ctx, width, height),
            analysis_timestamp: new Date().toISOString()
        };
    }

    /**
     * 얼굴 영역 감지 (간소화)
     */
    detectFaceRegion(width, height) {
        // 실제로는 얼굴 감지 라이브러리 사용
        // 여기서는 중앙 70% 영역을 얼굴로 가정
        const margin = 0.15;
        
        return {
            x: Math.floor(width * margin),
            y: Math.floor(height * margin),
            width: Math.floor(width * (1 - 2 * margin)),
            height: Math.floor(height * (1 - 2 * margin)),
            confidence: 0.8
        };
    }

    /**
     * 피부 색상 추출
     */
    extractSkinColors(ctx, faceRegion) {
        const colors = [];
        
        this.faceAnalyzer.skinAnalysisPoints.forEach(point => {
            const x = faceRegion.x + (point.x * faceRegion.width);
            const y = faceRegion.y + (point.y * faceRegion.height);
            
            // 3x3 영역의 평균 색상 계산
            const colorData = this.getAverageColor(ctx, x, y, 3);
            
            colors.push({
                point: point.name,
                position: { x: Math.floor(x), y: Math.floor(y) },
                rgb: colorData.rgb,
                lab: this.rgbToLab(colorData.rgb[0], colorData.rgb[1], colorData.rgb[2]),
                brightness: colorData.brightness
            });
        });
        
        return colors;
    }

    /**
     * 평균 색상 계산
     */
    getAverageColor(ctx, centerX, centerY, radius) {
        const startX = Math.max(0, centerX - radius);
        const startY = Math.max(0, centerY - radius);
        const endX = Math.min(ctx.canvas.width - 1, centerX + radius);
        const endY = Math.min(ctx.canvas.height - 1, centerY + radius);
        
        let totalR = 0, totalG = 0, totalB = 0;
        let pixelCount = 0;
        
        for (let x = startX; x <= endX; x++) {
            for (let y = startY; y <= endY; y++) {
                const pixel = ctx.getImageData(x, y, 1, 1).data;
                totalR += pixel[0];
                totalG += pixel[1];
                totalB += pixel[2];
                pixelCount++;
            }
        }
        
        const avgR = Math.round(totalR / pixelCount);
        const avgG = Math.round(totalG / pixelCount);
        const avgB = Math.round(totalB / pixelCount);
        const brightness = (avgR + avgG + avgB) / 3;
        
        return {
            rgb: [avgR, avgG, avgB],
            brightness: brightness
        };
    }

    /**
     * 이미지 통계 분석
     */
    analyzeImageStatistics(ctx, width, height) {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        let totalR = 0, totalG = 0, totalB = 0;
        let minBrightness = 255, maxBrightness = 0;
        const brightnessValues = [];
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const brightness = (r + g + b) / 3;
            
            totalR += r;
            totalG += g;
            totalB += b;
            
            brightnessValues.push(brightness);
            minBrightness = Math.min(minBrightness, brightness);
            maxBrightness = Math.max(maxBrightness, brightness);
        }
        
        const pixelCount = data.length / 4;
        const avgBrightness = brightnessValues.reduce((sum, val) => sum + val, 0) / pixelCount;
        
        // 표준편차 계산
        const variance = brightnessValues.reduce((sum, val) => {
            return sum + Math.pow(val - avgBrightness, 2);
        }, 0) / pixelCount;
        
        const standardDeviation = Math.sqrt(variance);
        
        return {
            average_color: [
                Math.round(totalR / pixelCount),
                Math.round(totalG / pixelCount),
                Math.round(totalB / pixelCount)
            ],
            brightness: {
                average: avgBrightness,
                min: minBrightness,
                max: maxBrightness,
                range: maxBrightness - minBrightness,
                standard_deviation: standardDeviation
            },
            contrast: (maxBrightness - minBrightness) / 255,
            pixel_count: pixelCount
        };
    }

    /**
     * 조명 분석
     */
    analyzeLighting(imageStats) {
        const brightness = imageStats.brightness;
        
        let lightingType;
        if (brightness.average > 200) lightingType = 'overexposed';
        else if (brightness.average > 160) lightingType = 'bright';
        else if (brightness.average > 120) lightingType = 'normal';
        else if (brightness.average > 80) lightingType = 'dim';
        else lightingType = 'dark';
        
        let consistency;
        if (brightness.standard_deviation < 20) consistency = 'very_even';
        else if (brightness.standard_deviation < 40) consistency = 'even';
        else if (brightness.standard_deviation < 60) consistency = 'uneven';
        else consistency = 'very_uneven';
        
        return {
            type: lightingType,
            consistency: consistency,
            quality_score: this.calculateLightingQuality(brightness, imageStats.contrast)
        };
    }

    /**
     * 조명 품질 점수 계산
     */
    calculateLightingQuality(brightness, contrast) {
        let score = 100;
        
        // 최적 밝기 범위 (120-180)
        const optimalBrightness = 150;
        const brightnessDiff = Math.abs(brightness.average - optimalBrightness);
        score -= brightnessDiff * 0.5;
        
        // 적절한 대비 (0.3-0.7)
        const optimalContrast = 0.5;
        const contrastDiff = Math.abs(contrast - optimalContrast);
        score -= contrastDiff * 50;
        
        // 균일한 조명
        score -= brightness.standard_deviation * 0.5;
        
        return Math.max(0, Math.min(100, Math.round(score)));
    }

    /**
     * 주요 색상 추출
     */
    extractDominantColors(ctx, width, height, colorCount = 5) {
        // 이미지를 작은 크기로 리샘플링
        const sampleSize = 50;
        const sampleCanvas = document.createElement('canvas');
        const sampleCtx = sampleCanvas.getContext('2d');
        
        sampleCanvas.width = sampleSize;
        sampleCanvas.height = sampleSize;
        sampleCtx.drawImage(ctx.canvas, 0, 0, width, height, 0, 0, sampleSize, sampleSize);
        
        const imageData = sampleCtx.getImageData(0, 0, sampleSize, sampleSize);
        const data = imageData.data;
        
        // 색상 빈도 계산
        const colorMap = {};
        
        for (let i = 0; i < data.length; i += 4) {
            const r = Math.floor(data[i] / 32) * 32; // 색상 양자화
            const g = Math.floor(data[i + 1] / 32) * 32;
            const b = Math.floor(data[i + 2] / 32) * 32;
            
            const key = `${r},${g},${b}`;
            colorMap[key] = (colorMap[key] || 0) + 1;
        }
        
        // 상위 색상 선택
        const sortedColors = Object.entries(colorMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, colorCount)
            .map(([colorKey, count]) => {
                const [r, g, b] = colorKey.split(',').map(Number);
                return {
                    rgb: [r, g, b],
                    hex: this.rgbToHex(r, g, b),
                    frequency: count / (sampleSize * sampleSize),
                    lab: this.rgbToLab(r, g, b)
                };
            });
        
        return sortedColors;
    }

    /**
     * 비교 메트릭 계산
     */
    calculateComparisonMetrics(beforeAnalysis, afterAnalysis) {
        const metrics = {};
        
        // 피부톤 개선 분석
        metrics.skin_improvement = this.analyzeSkinImprovement(
            beforeAnalysis.skin_colors,
            afterAnalysis.skin_colors
        );
        
        // 밝기 변화 분석
        metrics.brightness_change = this.analyzeBrightnessChange(
            beforeAnalysis.image_stats.brightness,
            afterAnalysis.image_stats.brightness
        );
        
        // 색온도 변화 분석
        metrics.color_temperature = this.analyzeColorTemperatureChange(
            beforeAnalysis.dominant_colors,
            afterAnalysis.dominant_colors
        );
        
        // 조화도 변화 분석
        metrics.harmony_improvement = this.analyzeHarmonyImprovement(
            beforeAnalysis, afterAnalysis
        );
        
        // 대비 개선 분석
        metrics.contrast_improvement = this.analyzeContrastImprovement(
            beforeAnalysis.image_stats.contrast,
            afterAnalysis.image_stats.contrast
        );
        
        return metrics;
    }

    /**
     * 피부톤 개선 분석
     */
    analyzeSkinImprovement(beforeSkin, afterSkin) {
        const improvements = {};
        
        // 각 분석 포인트별 개선사항
        beforeSkin.forEach((beforePoint, index) => {
            if (index < afterSkin.length) {
                const afterPoint = afterSkin[index];
                
                // 밝기 변화
                const brightnessChange = afterPoint.brightness - beforePoint.brightness;
                
                // 색차 계산 (Delta E)
                const deltaE = this.calculateDeltaE(beforePoint.lab, afterPoint.lab);
                
                improvements[beforePoint.point] = {
                    brightness_change: brightnessChange,
                    color_difference: deltaE,
                    improvement_score: this.calculatePointImprovement(brightnessChange, deltaE)
                };
            }
        });
        
        // 전체 개선 점수
        const improvementScores = Object.values(improvements).map(imp => imp.improvement_score);
        const averageImprovement = improvementScores.reduce((sum, score) => sum + score, 0) / improvementScores.length;
        
        return {
            point_improvements: improvements,
            overall_improvement: averageImprovement,
            significant_change: Math.abs(averageImprovement) > 10
        };
    }

    /**
     * 포인트별 개선 점수 계산
     */
    calculatePointImprovement(brightnessChange, deltaE) {
        let score = 0;
        
        // 적절한 밝기 증가는 긍정적
        if (brightnessChange > 0 && brightnessChange <= 20) {
            score += brightnessChange;
        } else if (brightnessChange > 20) {
            score += 20 - (brightnessChange - 20) * 0.5; // 과도한 밝기는 감점
        }
        
        // 색차는 적을수록 좋음 (자연스러운 변화)
        score -= deltaE * 0.5;
        
        return Math.max(-50, Math.min(50, score));
    }

    /**
     * Delta E 계산 (간소화 버전)
     */
    calculateDeltaE(lab1, lab2) {
        const deltaL = lab1[0] - lab2[0];
        const deltaA = lab1[1] - lab2[1];
        const deltaB = lab1[2] - lab2[2];
        
        return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
    }

    /**
     * 밝기 변화 분석
     */
    analyzeBrightnessChange(beforeBrightness, afterBrightness) {
        const change = afterBrightness.average - beforeBrightness.average;
        const percentChange = (change / beforeBrightness.average) * 100;
        
        let assessment;
        if (Math.abs(percentChange) < 5) assessment = 'minimal';
        else if (Math.abs(percentChange) < 15) assessment = 'moderate';
        else assessment = 'significant';
        
        return {
            absolute_change: change,
            percent_change: percentChange,
            assessment: assessment,
            improvement: change > 0 && change <= 30 // 적당한 밝기 증가는 개선
        };
    }

    /**
     * 색온도 변화 분석
     */
    analyzeColorTemperatureChange(beforeColors, afterColors) {
        // 색온도 계산 (간소화)
        const calcColorTemp = (colors) => {
            let warmth = 0;
            colors.forEach(color => {
                const [r, g, b] = color.rgb;
                // 빨강-노랑이 강하면 따뜻함, 파랑이 강하면 차가움
                warmth += (r + g * 0.5) - b;
            });
            return warmth / colors.length;
        };
        
        const beforeTemp = calcColorTemp(beforeColors);
        const afterTemp = calcColorTemp(afterColors);
        const change = afterTemp - beforeTemp;
        
        return {
            before_temperature: beforeTemp,
            after_temperature: afterTemp,
            change: change,
            direction: change > 5 ? 'warmer' : change < -5 ? 'cooler' : 'neutral'
        };
    }

    /**
     * 조화도 개선 분석
     */
    analyzeHarmonyImprovement(beforeAnalysis, afterAnalysis) {
        // 드레이핑 색상과 피부톤의 조화도 분석
        const fabricColor = this.currentComparison.draping.fabric_color;
        const fabricRGB = this.hexToRgb(fabricColor);
        
        if (!fabricRGB) {
            return { error: '유효하지 않은 드레이핑 색상' };
        }
        
        // 피부톤과 드레이핑 색상의 조화도 계산
        const beforeHarmony = this.calculateSkinFabricHarmony(
            beforeAnalysis.skin_colors, fabricRGB
        );
        
        const afterHarmony = this.calculateSkinFabricHarmony(
            afterAnalysis.skin_colors, fabricRGB
        );
        
        const improvement = afterHarmony - beforeHarmony;
        
        return {
            before_harmony: beforeHarmony,
            after_harmony: afterHarmony,
            improvement: improvement,
            significant_improvement: improvement > 10
        };
    }

    /**
     * 피부-드레이핑 조화도 계산
     */
    calculateSkinFabricHarmony(skinColors, fabricRGB) {
        let totalHarmony = 0;
        
        skinColors.forEach(skinPoint => {
            const skinRGB = skinPoint.rgb;
            
            // 색상 대비 분석
            const contrast = this.calculateColorContrast(skinRGB, fabricRGB);
            
            // 온도감 매칭 분석
            const temperatureMatch = this.analyzeTemperatureMatch(skinRGB, fabricRGB);
            
            // 조화도 점수 계산 (0-100)
            let harmonyScore = 50; // 기본 점수
            
            // 적절한 대비 (+)
            if (contrast.ratio >= 3 && contrast.ratio <= 7) {
                harmonyScore += 20;
            } else if (contrast.ratio < 3) {
                harmonyScore -= 10; // 대비 부족
            } else {
                harmonyScore -= 15; // 과도한 대비
            }
            
            // 온도감 매칭 (+)
            harmonyScore += temperatureMatch.score;
            
            totalHarmony += harmonyScore;
        });
        
        return totalHarmony / skinColors.length;
    }

    /**
     * 색상 대비 계산
     */
    calculateColorContrast(color1, color2) {
        // 상대 휘도 계산
        const getLuminance = (rgb) => {
            const [r, g, b] = rgb.map(c => {
                c = c / 255;
                return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
            });
            return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        };
        
        const lum1 = getLuminance(color1);
        const lum2 = getLuminance(color2);
        
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        
        const ratio = (brightest + 0.05) / (darkest + 0.05);
        
        return { ratio: ratio };
    }

    /**
     * 온도감 매칭 분석
     */
    analyzeTemperatureMatch(skinRGB, fabricRGB) {
        const getSkinUndertone = (rgb) => {
            const [r, g, b] = rgb;
            // 간소화된 언더톤 분석
            if (r > g && r > b) return 'warm'; // 빨강 계열
            if (b > r && b > g) return 'cool';  // 파랑 계열
            if (g > r && g > b) return 'neutral'; // 초록 계열
            return 'neutral';
        };
        
        const getFabricTemperature = (rgb) => {
            const [r, g, b] = rgb;
            const warmth = (r + g * 0.5) - b;
            return warmth > 0 ? 'warm' : 'cool';
        };
        
        const skinUndertone = getSkinUndertone(skinRGB);
        const fabricTemp = getFabricTemperature(fabricRGB);
        
        let matchScore = 0;
        
        if (skinUndertone === 'warm' && fabricTemp === 'warm') {
            matchScore = 15; // 완벽한 매칭
        } else if (skinUndertone === 'cool' && fabricTemp === 'cool') {
            matchScore = 15;
        } else if (skinUndertone === 'neutral') {
            matchScore = 10; // 중성은 어디에나 어울림
        } else {
            matchScore = -10; // 온도감 불일치
        }
        
        return {
            skin_undertone: skinUndertone,
            fabric_temperature: fabricTemp,
            score: matchScore,
            match: matchScore > 0
        };
    }

    /**
     * 대비 개선 분석
     */
    analyzeContrastImprovement(beforeContrast, afterContrast) {
        const change = afterContrast - beforeContrast;
        const improvement = this.assessContrastImprovement(beforeContrast, afterContrast);
        
        return {
            before_contrast: beforeContrast,
            after_contrast: afterContrast,
            change: change,
            improvement: improvement
        };
    }

    /**
     * 대비 개선 평가
     */
    assessContrastImprovement(before, after) {
        // 최적 대비 범위: 0.4-0.6
        const optimal = 0.5;
        const beforeDistance = Math.abs(before - optimal);
        const afterDistance = Math.abs(after - optimal);
        
        if (afterDistance < beforeDistance) {
            return 'improved';
        } else if (afterDistance > beforeDistance) {
            return 'worsened';
        } else {
            return 'unchanged';
        }
    }

    /**
     * 개선사항 분석
     */
    analyzeImprovements(metrics) {
        const improvements = [];
        
        // 피부 개선
        if (metrics.skin_improvement.significant_change) {
            if (metrics.skin_improvement.overall_improvement > 0) {
                improvements.push({
                    category: 'skin',
                    type: 'brightness',
                    description: '피부톤이 더 밝고 화사해졌습니다',
                    score: metrics.skin_improvement.overall_improvement
                });
            }
        }
        
        // 조화도 개선
        if (metrics.harmony_improvement.significant_improvement) {
            improvements.push({
                category: 'harmony',
                type: 'color_matching',
                description: '드레이핑 색상과의 조화가 개선되었습니다',
                score: metrics.harmony_improvement.improvement
            });
        }
        
        // 대비 개선
        if (metrics.contrast_improvement.improvement === 'improved') {
            improvements.push({
                category: 'contrast',
                type: 'visual_impact',
                description: '시각적 대비가 최적화되었습니다',
                score: 15
            });
        }
        
        // 색온도 변화
        const tempChange = metrics.color_temperature.change;
        if (Math.abs(tempChange) > 10) {
            const direction = tempChange > 0 ? '따뜻해져' : '차가워져';
            improvements.push({
                category: 'temperature',
                type: 'color_temperature',
                description: `전체적인 색온도가 ${direction} 더 조화롭습니다`,
                score: Math.min(20, Math.abs(tempChange) / 2)
            });
        }
        
        return improvements;
    }

    /**
     * 추천사항 생성
     */
    generateRecommendations(metrics, improvements) {
        const recommendations = [];
        
        // 개선된 부분 강조
        improvements.forEach(improvement => {
            recommendations.push({
                type: 'positive',
                category: improvement.category,
                message: improvement.description,
                confidence: 'high'
            });
        });
        
        // 추가 개선 제안
        if (metrics.brightness_change.percent_change < 5) {
            recommendations.push({
                type: 'suggestion',
                category: 'lighting',
                message: '더 밝은 조명에서 촬영하면 차이를 더 명확히 볼 수 있습니다',
                confidence: 'medium'
            });
        }
        
        if (metrics.harmony_improvement.before_harmony < 70) {
            recommendations.push({
                type: 'suggestion',
                category: 'draping',
                message: '다른 색상의 드레이핑도 테스트해보시길 권장합니다',
                confidence: 'medium'
            });
        }
        
        // 계절별 추천
        const season = this.currentComparison.draping.season_tested;
        if (season !== 'unknown') {
            recommendations.push({
                type: 'seasonal',
                category: 'styling',
                message: `${season} 타입에 적합한 색상들을 더 시도해보세요`,
                confidence: 'high'
            });
        }
        
        return recommendations;
    }

    /**
     * 전체 점수 계산
     */
    calculateOverallScore(metrics) {
        let totalScore = 50; // 기본 점수
        
        // 각 메트릭의 가중치
        const weights = this.faceAnalyzer.metrics;
        
        // 피부 개선 점수
        totalScore += metrics.skin_improvement.overall_improvement * weights.brightness.weight;
        
        // 조화도 점수
        if (metrics.harmony_improvement.improvement) {
            totalScore += metrics.harmony_improvement.improvement * weights.harmony.weight;
        }
        
        // 대비 점수
        if (metrics.contrast_improvement.improvement === 'improved') {
            totalScore += 15 * weights.contrast.weight;
        } else if (metrics.contrast_improvement.improvement === 'worsened') {
            totalScore -= 10 * weights.contrast.weight;
        }
        
        // 온도감 매칭
        const tempScore = Math.min(20, Math.abs(metrics.color_temperature.change) / 2);
        totalScore += tempScore * weights.warmth.weight;
        
        // 0-100 범위로 제한
        return Math.max(0, Math.min(100, Math.round(totalScore)));
    }

    /**
     * 비교 토글
     */
    toggleComparison() {
        if (!this.currentComparison) return;
        
        const event = new CustomEvent('comparisonToggle', {
            detail: { comparison: this.currentComparison }
        });
        document.dispatchEvent(event);
    }

    /**
     * 이전/다음 비교
     */
    showPreviousComparison() {
        // 구현 필요: 이전 비교 데이터로 이동
    }

    showNextComparison() {
        // 구현 필요: 다음 비교 데이터로 이동
    }

    /**
     * 현재 비교 저장
     */
    saveCurrentComparison() {
        if (!this.currentComparison) return;
        
        this.comparisonData.push({ ...this.currentComparison });
        
        if (this.settings.auto_save) {
            // 로컬 저장소에 저장
            this.saveToStorage();
        }
        
        console.log('✅ 비교 데이터 저장됨:', this.currentComparison.id);
        return this.currentComparison.id;
    }

    /**
     * 저장소에 저장
     */
    saveToStorage() {
        try {
            const dataToSave = {
                comparisons: this.comparisonData.slice(-50), // 최근 50개만 보관
                settings: this.settings,
                saved_at: new Date().toISOString()
            };
            
            localStorage.setItem('comparisonTool_data', JSON.stringify(dataToSave));
            
        } catch (error) {
            console.error('저장소 저장 실패:', error);
        }
    }

    /**
     * 저장소에서 로드
     */
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('comparisonTool_data');
            if (saved) {
                const data = JSON.parse(saved);
                this.comparisonData = data.comparisons || [];
                this.settings = { ...this.settings, ...data.settings };
                
                console.log(`✅ ${this.comparisonData.length}개 비교 데이터 로드됨`);
            }
        } catch (error) {
            console.error('저장소 로드 실패:', error);
        }
    }

    /**
     * 유틸리티 함수들
     */
    generateComparisonId() {
        return 'comp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    }

    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : null;
    }

    rgbToLab(r, g, b) {
        // RGB to LAB 변환 (간소화)
        r = r / 255;
        g = g / 255;
        b = b / 255;
        
        r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
        g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
        b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
        
        let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
        let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
        let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
        
        x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
        y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
        z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;
        
        const L = (116 * y) - 16;
        const a = 500 * (x - y);
        const B = 200 * (y - z);
        
        return [L, a, B];
    }

    dispatchEvent(eventName, data) {
        const event = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(event);
    }

    /**
     * 시스템 상태 확인
     */
    getSystemStatus() {
        return {
            initialized: this.initialized,
            current_comparison: this.currentComparison?.id || null,
            total_comparisons: this.comparisonData.length,
            settings: this.settings,
            face_analyzer_ready: this.faceAnalyzer !== null,
            timestamp: new Date().toISOString()
        };
    }
}

// 전역 등록 (브라우저 호환성)
if (typeof window !== 'undefined') {
    window.ComparisonTool = ComparisonTool;
    console.log('✅ ComparisonTool이 전역에 등록되었습니다.');
}

// ES6 모듈 지원
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComparisonTool;
}
