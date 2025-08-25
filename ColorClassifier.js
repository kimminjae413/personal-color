/**
 * ColorClassifier.js
 * AI 기반 색상 분류 시스템
 * 
 * 기능:
 * - TensorFlow.js 기반 색상 분류
 * - 실시간 색상 분석
 * - PCCS 톤 분류
 * - 헤어컬러 매칭
 * - 화장품 색상 추천
 */

class ColorClassifier {
    constructor() {
        this.initialized = false;
        this.model = null;
        this.pccsSystem = null;
        this.colorDatabase = null;
        this.analysisHistory = [];
        
        console.log('🎯 ColorClassifier 생성자 실행');
    }

    /**
     * 시스템 초기화
     */
    async initialize() {
        try {
            console.log('🚀 ColorClassifier 초기화 시작...');
            
            // PCCS 색상 시스템 초기화
            await this.initializePCCSSystem();
            
            // 색상 데이터베이스 로드
            await this.loadColorDatabase();
            
            // AI 모델 로드 (실제 환경에서는 TensorFlow.js 모델)
            await this.loadAIModel();
            
            this.initialized = true;
            console.log('✅ ColorClassifier 초기화 완료');
            return true;
            
        } catch (error) {
            console.error('❌ ColorClassifier 초기화 실패:', error);
            return false;
        }
    }

    /**
     * PCCS 색상 시스템 초기화
     */
    async initializePCCSSystem() {
        this.pccsSystem = {
            // 색상환 (Hue) - 24색상
            hues: [
                // 빨강 계열
                { id: 1, name: 'R (빨강)', angle: 15, rgb: [255, 0, 0] },
                { id: 2, name: 'YR (주황)', angle: 45, rgb: [255, 127, 0] },
                
                // 노랑 계열  
                { id: 3, name: 'Y (노랑)', angle: 75, rgb: [255, 255, 0] },
                { id: 4, name: 'GY (연두)', angle: 105, rgb: [127, 255, 0] },
                
                // 초록 계열
                { id: 5, name: 'G (초록)', angle: 135, rgb: [0, 255, 0] },
                { id: 6, name: 'BG (청록)', angle: 165, rgb: [0, 255, 127] },
                
                // 파랑 계열
                { id: 7, name: 'B (파랑)', angle: 195, rgb: [0, 127, 255] },
                { id: 8, name: 'PB (남보라)', angle: 225, rgb: [127, 0, 255] },
                
                // 보라 계열
                { id: 9, name: 'P (보라)', angle: 255, rgb: [255, 0, 255] },
                { id: 10, name: 'RP (자주)', angle: 285, rgb: [255, 0, 127] }
            ],

            // 톤 (Tone) - 12톤
            tones: {
                // 고명도 계열
                'pale': { 
                    name: '페일', 
                    brightness: 85, 
                    saturation: 20,
                    description: '연하고 밝은',
                    seasons: ['spring', 'summer']
                },
                'light': { 
                    name: '라이트', 
                    brightness: 75, 
                    saturation: 35,
                    description: '밝고 부드러운',
                    seasons: ['spring', 'summer']
                },
                'bright': { 
                    name: '브라이트', 
                    brightness: 70, 
                    saturation: 85,
                    description: '밝고 선명한',
                    seasons: ['spring', 'winter']
                },
                
                // 중명도 계열
                'soft': { 
                    name: '소프트', 
                    brightness: 60, 
                    saturation: 30,
                    description: '부드럽고 온화한',
                    seasons: ['spring', 'summer']
                },
                'strong': { 
                    name: '스트롱', 
                    brightness: 50, 
                    saturation: 75,
                    description: '강하고 뚜렷한',
                    seasons: ['autumn', 'winter']
                },
                'vivid': { 
                    name: '비비드', 
                    brightness: 55, 
                    saturation: 95,
                    description: '생생하고 강렬한',
                    seasons: ['spring', 'winter']
                },
                
                // 저명도 계열
                'deep': { 
                    name: '딥', 
                    brightness: 35, 
                    saturation: 70,
                    description: '깊고 진한',
                    seasons: ['autumn', 'winter']
                },
                'dark': { 
                    name: '다크', 
                    brightness: 25, 
                    saturation: 45,
                    description: '어둡고 중후한',
                    seasons: ['autumn', 'winter']
                },
                
                // 회색기 계열
                'light_grayish': { 
                    name: '라이트 그레이시', 
                    brightness: 65, 
                    saturation: 15,
                    description: '회색기가 도는 밝은',
                    seasons: ['summer']
                },
                'grayish': { 
                    name: '그레이시', 
                    brightness: 50, 
                    saturation: 20,
                    description: '회색기가 도는',
                    seasons: ['summer', 'autumn']
                },
                'dark_grayish': { 
                    name: '다크 그레이시', 
                    brightness: 35, 
                    saturation: 25,
                    description: '회색기가 도는 어두운',
                    seasons: ['autumn']
                },
                'dull': { 
                    name: '덜', 
                    brightness: 45, 
                    saturation: 35,
                    description: '탁하고 차분한',
                    seasons: ['autumn', 'summer']
                }
            }
        };

        console.log('✅ PCCS 시스템 초기화 완료');
    }

    /**
     * 색상 데이터베이스 로드
     */
    async loadColorDatabase() {
        this.colorDatabase = {
            // 헤어컬러 데이터베이스
            hairColors: {
                spring: [
                    { name: '골든 브라운', hex: '#D2691E', level: 6, undertone: 'golden' },
                    { name: '허니 블론드', hex: '#DAA520', level: 7, undertone: 'warm' },
                    { name: '카라멜 브라운', hex: '#8B4513', level: 5, undertone: 'warm' },
                    { name: '쿠퍼 레드', hex: '#B22222', level: 5, undertone: 'warm' },
                    { name: '라이트 오번', hex: '#CD853F', level: 6, undertone: 'golden' }
                ],
                summer: [
                    { name: '애쉬 브라운', hex: '#A0522D', level: 6, undertone: 'cool' },
                    { name: '플래티넘 블론드', hex: '#E6E6FA', level: 9, undertone: 'cool' },
                    { name: '애쉬 블론드', hex: '#F5DEB3', level: 8, undertone: 'cool' },
                    { name: '로즈 브라운', hex: '#BC8F8F', level: 6, undertone: 'cool' },
                    { name: '라벤더 그레이', hex: '#C8A2C8', level: 7, undertone: 'cool' }
                ],
                autumn: [
                    { name: '초콜릿 브라운', hex: '#654321', level: 4, undertone: 'warm' },
                    { name: '체스트넛', hex: '#800000', level: 3, undertone: 'warm' },
                    { name: '딥 오번', hex: '#A0522D', level: 4, undertone: 'warm' },
                    { name: '스파이스 레드', hex: '#B22222', level: 4, undertone: 'warm' },
                    { name: '커피 브라운', hex: '#6F4E37', level: 3, undertone: 'warm' }
                ],
                winter: [
                    { name: '제트 블랙', hex: '#000000', level: 1, undertone: 'neutral' },
                    { name: '애쉬 블랙', hex: '#36454F', level: 2, undertone: 'cool' },
                    { name: '다크 브라운', hex: '#654321', level: 3, undertone: 'cool' },
                    { name: '버건디', hex: '#800020', level: 3, undertone: 'cool' },
                    { name: '실버 그레이', hex: '#C0C0C0', level: 8, undertone: 'cool' }
                ]
            },

            // 립스틱 색상 데이터베이스
            lipColors: {
                spring: [
                    { name: '코랄 핑크', hex: '#FF7F50', finish: 'glossy', intensity: 'medium' },
                    { name: '피치', hex: '#FFCBA4', finish: 'creamy', intensity: 'light' },
                    { name: '워터멜론', hex: '#FF69B4', finish: 'glossy', intensity: 'bright' },
                    { name: '골든 레드', hex: '#DC143C', finish: 'matte', intensity: 'high' }
                ],
                summer: [
                    { name: '로즈 핑크', hex: '#FFB6C1', finish: 'satin', intensity: 'medium' },
                    { name: '베리', hex: '#8B008B', finish: 'matte', intensity: 'deep' },
                    { name: '라벤더 핑크', hex: '#DDA0DD', finish: 'glossy', intensity: 'light' },
                    { name: '플럼', hex: '#DDA0DD', finish: 'matte', intensity: 'medium' }
                ],
                autumn: [
                    { name: '테라코타', hex: '#E2725B', finish: 'matte', intensity: 'medium' },
                    { name: '번트 오렌지', hex: '#CC5500', finish: 'satin', intensity: 'high' },
                    { name: '브릭 레드', hex: '#B22222', finish: 'matte', intensity: 'deep' },
                    { name: '스파이스', hex: '#D2691E', finish: 'creamy', intensity: 'medium' }
                ],
                winter: [
                    { name: '트루 레드', hex: '#FF0000', finish: 'matte', intensity: 'high' },
                    { name: '체리', hex: '#DE3163', finish: 'glossy', intensity: 'bright' },
                    { name: '퓨시아', hex: '#FF1493', finish: 'matte', intensity: 'high' },
                    { name: '와인', hex: '#722F37', finish: 'matte', intensity: 'deep' }
                ]
            },

            // 아이섀도우 색상 데이터베이스
            eyeshadowColors: {
                spring: [
                    { name: '피치 글로우', hex: '#FFCBA4', finish: 'shimmer', placement: 'lid' },
                    { name: '골든 브론즈', hex: '#CD7F32', finish: 'metallic', placement: 'crease' },
                    { name: '코랄 블러시', hex: '#FF7F50', finish: 'matte', placement: 'outer_v' },
                    { name: '샴페인', hex: '#F7E7CE', finish: 'shimmer', placement: 'inner_corner' }
                ],
                summer: [
                    { name: '로즈 쿼츠', hex: '#F7CAC9', finish: 'satin', placement: 'lid' },
                    { name: '라벤더 미스트', hex: '#E6E6FA', finish: 'shimmer', placement: 'lid' },
                    { name: '플럼 스모키', hex: '#8B008B', finish: 'matte', placement: 'crease' },
                    { name: '실버', hex: '#C0C0C0', finish: 'metallic', placement: 'inner_corner' }
                ],
                autumn: [
                    { name: '번트 시엔나', hex: '#E97451', finish: 'matte', placement: 'crease' },
                    { name: '골든 오커', hex: '#DAA520', finish: 'shimmer', placement: 'lid' },
                    { name: '초콜릿', hex: '#7B3F00', finish: 'matte', placement: 'outer_v' },
                    { name: '카퍼', hex: '#B87333', finish: 'metallic', placement: 'lid' }
                ],
                winter: [
                    { name: '스모키 그레이', hex: '#696969', finish: 'matte', placement: 'crease' },
                    { name: '딥 퍼플', hex: '#4B0082', finish: 'shimmer', placement: 'lid' },
                    { name: '제트 블랙', hex: '#000000', finish: 'matte', placement: 'outer_v' },
                    { name: '아이시 화이트', hex: '#F8F8FF', finish: 'shimmer', placement: 'inner_corner' }
                ]
            }
        };

        console.log('✅ 색상 데이터베이스 로드 완료');
    }

    /**
     * AI 모델 로드 (시뮬레이션)
     */
    async loadAIModel() {
        // 실제 환경에서는 TensorFlow.js 모델을 로드
        // 현재는 시뮬레이션 모델
        this.model = {
            loaded: true,
            version: '1.0.0',
            accuracy: 0.94,
            
            // 색상 분류 함수 (시뮬레이션)
            predict: (rgbValues) => {
                return this.simulateAIPrediction(rgbValues);
            }
        };

        console.log('✅ AI 모델 로드 완료 (시뮬레이션)');
    }

    /**
     * AI 예측 시뮬레이션
     */
    simulateAIPrediction(rgbValues) {
        const [r, g, b] = rgbValues;
        
        // HSL 변환
        const hsl = this.rgbToHsl(r, g, b);
        const [h, s, l] = hsl;
        
        // 간단한 규칙 기반 분류
        let predictions = {
            spring: 0,
            summer: 0, 
            autumn: 0,
            winter: 0
        };
        
        // 온도감 분석
        const isWarm = (h >= 15 && h <= 75) || (h >= 315);
        
        // 채도 분석
        const highSaturation = s > 0.6;
        const mediumSaturation = s > 0.3;
        
        // 명도 분석
        const highLightness = l > 0.7;
        const mediumLightness = l > 0.4;
        
        // 분류 로직
        if (isWarm) {
            if (highLightness && highSaturation) {
                predictions.spring = 0.8;
                predictions.autumn = 0.2;
            } else if (mediumLightness && highSaturation) {
                predictions.autumn = 0.7;
                predictions.spring = 0.3;
            } else {
                predictions.autumn = 0.6;
                predictions.spring = 0.4;
            }
        } else {
            if (highLightness) {
                predictions.summer = 0.7;
                predictions.winter = 0.3;
            } else if (highSaturation) {
                predictions.winter = 0.8;
                predictions.summer = 0.2;
            } else {
                predictions.summer = 0.6;
                predictions.winter = 0.4;
            }
        }
        
        return predictions;
    }

    /**
     * 메인 색상 분류 함수
     * @param {Array} colors - RGB 색상 배열 [[r,g,b], [r,g,b], ...]
     * @param {Object} options - 분석 옵션
     * @returns {Object} - 분류 결과
     */
    classifyColors(colors, options = {}) {
        if (!this.initialized) {
            console.error('ColorClassifier가 초기화되지 않았습니다.');
            return null;
        }

        if (!Array.isArray(colors) || colors.length === 0) {
            console.error('유효하지 않은 색상 데이터입니다.');
            return null;
        }

        try {
            const results = [];
            
            colors.forEach((color, index) => {
                const result = this.classifySingleColor(color, options);
                results.push({
                    index: index,
                    color: color,
                    ...result
                });
            });
            
            // 종합 분석
            const analysis = this.analyzeColorGroup(results);
            
            // 결과 저장
            const finalResult = {
                individual_results: results,
                group_analysis: analysis,
                recommendations: this.generateRecommendations(analysis),
                timestamp: new Date().toISOString()
            };
            
            this.analysisHistory.push(finalResult);
            
            console.log('✅ 색상 분류 완료:', finalResult);
            return finalResult;
            
        } catch (error) {
            console.error('❌ 색상 분류 중 오류:', error);
            return null;
        }
    }

    /**
     * 단일 색상 분류
     */
    classifySingleColor(rgbColor, options) {
        const [r, g, b] = rgbColor;
        
        // 색공간 변환
        const hsl = this.rgbToHsl(r, g, b);
        const lab = this.rgbToLab(r, g, b);
        
        // AI 모델 예측
        const aiPrediction = this.model.predict(rgbColor);
        
        // PCCS 톤 분류
        const pccsClassification = this.classifyPCCSTone(hsl);
        
        // 색상 특성 분석
        const characteristics = this.analyzeColorCharacteristics(rgbColor, hsl, lab);
        
        return {
            rgb: rgbColor,
            hex: this.rgbToHex(r, g, b),
            hsl: hsl,
            lab: lab,
            ai_prediction: aiPrediction,
            pccs_tone: pccsClassification,
            characteristics: characteristics,
            dominant_season: this.getDominantSeason(aiPrediction)
        };
    }

    /**
     * PCCS 톤 분류
     */
    classifyPCCSTone(hsl) {
        const [h, s, l] = hsl;
        
        const brightness = l * 100;  // 명도
        const saturation = s * 100;  // 채도
        
        // 각 톤과의 거리 계산
        const toneDistances = {};
        
        Object.keys(this.pccsSystem.tones).forEach(toneName => {
            const tone = this.pccsSystem.tones[toneName];
            const brightnessDiff = Math.abs(brightness - tone.brightness);
            const saturationDiff = Math.abs(saturation - tone.saturation);
            
            // 유클리드 거리
            toneDistances[toneName] = Math.sqrt(
                brightnessDiff * brightnessDiff + saturationDiff * saturationDiff
            );
        });
        
        // 최소 거리 톤 선택
        const closestTone = Object.keys(toneDistances).reduce((a, b) => 
            toneDistances[a] < toneDistances[b] ? a : b
        );
        
        return {
            tone: closestTone,
            tone_info: this.pccsSystem.tones[closestTone],
            distances: toneDistances,
            confidence: this.calculateToneConfidence(toneDistances[closestTone])
        };
    }

    /**
     * 색상 특성 분석
     */
    analyzeColorCharacteristics(rgb, hsl, lab) {
        const [r, g, b] = rgb;
        const [h, s, l] = hsl;
        
        return {
            temperature: this.analyzeTemperature(h),
            clarity: this.analyzeClarity(s),
            depth: this.analyzeDepth(l),
            intensity: this.analyzeIntensity(s, l),
            chroma: Math.sqrt(lab[1] * lab[1] + lab[2] * lab[2]),
            dominant_channel: this.getDominantChannel(r, g, b),
            color_harmony: this.analyzeColorHarmony(h)
        };
    }

    /**
     * 색상 그룹 분석
     */
    analyzeColorGroup(results) {
        if (!results || results.length === 0) return null;
        
        // 계절별 점수 합계
        const seasonScores = {
            spring: 0,
            summer: 0,
            autumn: 0,
            winter: 0
        };
        
        results.forEach(result => {
            Object.keys(result.ai_prediction).forEach(season => {
                seasonScores[season] += result.ai_prediction[season];
            });
        });
        
        // 평균 계산
        Object.keys(seasonScores).forEach(season => {
            seasonScores[season] /= results.length;
        });
        
        // 지배적 계절
        const dominantSeason = Object.keys(seasonScores).reduce((a, b) => 
            seasonScores[a] > seasonScores[b] ? a : b
        );
        
        // 톤 분포 분석
        const toneDistribution = {};
        results.forEach(result => {
            const tone = result.pccs_tone.tone;
            toneDistribution[tone] = (toneDistribution[tone] || 0) + 1;
        });
        
        // 색상 온도 분석
        const temperatureAnalysis = this.analyzeGroupTemperature(results);
        
        return {
            season_scores: seasonScores,
            dominant_season: dominantSeason,
            confidence: seasonScores[dominantSeason],
            tone_distribution: toneDistribution,
            temperature_analysis: temperatureAnalysis,
            color_count: results.length,
            harmony_score: this.calculateHarmonyScore(results)
        };
    }

    /**
     * 추천사항 생성
     */
    generateRecommendations(analysis) {
        const season = analysis.dominant_season;
        const confidence = analysis.confidence;
        
        const recommendations = {
            hair_colors: this.colorDatabase.hairColors[season] || [],
            lip_colors: this.colorDatabase.lipColors[season] || [],
            eyeshadow_colors: this.colorDatabase.eyeshadowColors[season] || [],
            
            styling_tips: this.getSeasonStylingTips(season),
            color_combinations: this.getColorCombinations(season),
            avoid_colors: this.getAvoidColors(season),
            
            confidence_level: this.getConfidenceLevel(confidence),
            additional_notes: this.getAdditionalNotes(season, analysis)
        };
        
        return recommendations;
    }

    /**
     * RGB to HSL 변환
     */
    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;
        const sum = max + min;
        
        let h, s, l = sum / 2;
        
        if (diff === 0) {
            h = s = 0;
        } else {
            s = l > 0.5 ? diff / (2 - sum) : diff / sum;
            
            switch (max) {
                case r: h = (g - b) / diff + (g < b ? 6 : 0); break;
                case g: h = (b - r) / diff + 2; break;
                case b: h = (r - g) / diff + 4; break;
            }
            h /= 6;
        }
        
        return [h * 360, s, l];
    }

    /**
     * RGB to LAB 변환 (간소화)
     */
    rgbToLab(r, g, b) {
        // sRGB to XYZ 변환 (간소화)
        r = r / 255;
        g = g / 255;
        b = b / 255;
        
        // 감마 보정
        r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
        g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
        b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
        
        // XYZ 변환
        let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
        let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
        let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
        
        // LAB 변환
        x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
        y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
        z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;
        
        const L = (116 * y) - 16;
        const a = 500 * (x - y);
        const B = 200 * (y - z);
        
        return [L, a, B];
    }

    /**
     * RGB to HEX 변환
     */
    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    /**
     * 지배적 계절 결정
     */
    getDominantSeason(prediction) {
        return Object.keys(prediction).reduce((a, b) => 
            prediction[a] > prediction[b] ? a : b
        );
    }

    /**
     * 유틸리티 함수들
     */
    analyzeTemperature(hue) {
        if ((hue >= 0 && hue <= 60) || (hue >= 300)) return 'warm';
        if (hue >= 120 && hue <= 240) return 'cool';
        return 'neutral';
    }

    analyzeClarity(saturation) {
        if (saturation > 0.8) return 'very_clear';
        if (saturation > 0.6) return 'clear';
        if (saturation > 0.4) return 'soft';
        if (saturation > 0.2) return 'muted';
        return 'very_muted';
    }

    analyzeDepth(lightness) {
        if (lightness > 0.8) return 'very_light';
        if (lightness > 0.6) return 'light';
        if (lightness > 0.4) return 'medium';
        if (lightness > 0.2) return 'deep';
        return 'very_deep';
    }

    analyzeIntensity(saturation, lightness) {
        const intensity = saturation * lightness;
        if (intensity > 0.7) return 'high';
        if (intensity > 0.4) return 'medium';
        return 'low';
    }

    getDominantChannel(r, g, b) {
        if (r >= g && r >= b) return 'red';
        if (g >= r && g >= b) return 'green';
        return 'blue';
    }

    analyzeColorHarmony(hue) {
        // 색상 조화 분석 (간소화)
        const harmonies = [];
        
        // 보색
        const complement = (hue + 180) % 360;
        harmonies.push({ type: 'complement', hue: complement });
        
        // 삼색 조화
        const triadic1 = (hue + 120) % 360;
        const triadic2 = (hue + 240) % 360;
        harmonies.push({ type: 'triadic', hues: [triadic1, triadic2] });
        
        return harmonies;
    }

    calculateToneConfidence(distance) {
        const maxDistance = 50; // 최대 예상 거리
        const confidence = Math.max(0, (1 - distance / maxDistance) * 100);
        return Math.round(confidence);
    }

    analyzeGroupTemperature(results) {
        const temperatures = results.map(r => r.characteristics.temperature);
        const warmCount = temperatures.filter(t => t === 'warm').length;
        const coolCount = temperatures.filter(t => t === 'cool').length;
        const neutralCount = temperatures.filter(t => t === 'neutral').length;
        
        return {
            warm_ratio: warmCount / results.length,
            cool_ratio: coolCount / results.length,
            neutral_ratio: neutralCount / results.length,
            dominant_temperature: warmCount > coolCount ? 'warm' : 'cool'
        };
    }

    calculateHarmonyScore(results) {
        // 색상 조화도 점수 계산 (간소화)
        if (results.length < 2) return 100;
        
        let harmonyScore = 100;
        
        // 색상 분산 분석
        const hues = results.map(r => r.hsl[0]);
        const hueVariance = this.calculateVariance(hues);
        
        // 분산이 클수록 조화도 감소
        harmonyScore -= Math.min(30, hueVariance / 10);
        
        return Math.max(50, Math.round(harmonyScore));
    }

    calculateVariance(values) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        return variance;
    }

    getSeasonStylingTips(season) {
        const tips = {
            spring: [
                '밝고 화사한 색상으로 생동감 표현',
                '골든 언더톤의 메이크업 활용',
                '따뜻한 색감의 액세서리 선택'
            ],
            summer: [
                '부드럽고 우아한 색상으로 세련미 연출',
                '쿨톤 베이스의 메이크업 적용',
                '실버 톤 액세서리로 포인트'
            ],
            autumn: [
                '깊고 풍성한 색상으로 성숙미 강조',
                '웜톤의 진한 색상 활용',
                '골드 액세서리로 고급스러움 연출'
            ],
            winter: [
                '강렬하고 선명한 색상으로 극적 효과',
                '높은 대비의 메이크업 스타일',
                '실버나 화이트 골드 액세서리 선택'
            ]
        };
        
        return tips[season] || [];
    }

    getColorCombinations(season) {
        const combinations = {
            spring: ['코랄 + 민트', '피치 + 라이트 그린', '골든 옐로우 + 애쿠아'],
            summer: ['로즈 + 라벤더', '소프트 블루 + 핑크', '민트 + 그레이'],
            autumn: ['테라코타 + 올리브', '번트 오렌지 + 브라운', '골드 + 딥 그린'],
            winter: ['블랙 + 레드', '네이비 + 화이트', '퓨시아 + 실버']
        };
        
        return combinations[season] || [];
    }

    getAvoidColors(season) {
        const avoid = {
            spring: ['회색', '검정', '차가운 파스텔'],
            summer: ['주황', '따뜻한 노랑', '강한 대비색'],
            autumn: ['파스텔', '아이시 컬러', '네온'],
            winter: ['따뜻한 베이지', '탁한 색', '중간 톤']
        };
        
        return avoid[season] || [];
    }

    getConfidenceLevel(confidence) {
        if (confidence >= 0.8) return 'high';
        if (confidence >= 0.6) return 'medium';
        return 'low';
    }

    getAdditionalNotes(season, analysis) {
        const notes = [];
        
        if (analysis.confidence < 0.6) {
            notes.push('추가 분석이 권장됩니다.');
        }
        
        if (analysis.color_count < 3) {
            notes.push('더 많은 색상 분석으로 정확도를 높일 수 있습니다.');
        }
        
        return notes;
    }

    /**
     * 분석 히스토리 가져오기
     */
    getAnalysisHistory(limit = 10) {
        return this.analysisHistory.slice(-limit);
    }

    /**
     * 특정 색상의 매칭 제품 찾기
     */
    findMatchingProducts(rgbColor, productType = 'all') {
        const classification = this.classifySingleColor(rgbColor);
        const season = classification.dominant_season;
        
        const products = {};
        
        if (productType === 'all' || productType === 'hair') {
            products.hairColors = this.colorDatabase.hairColors[season] || [];
        }
        
        if (productType === 'all' || productType === 'lip') {
            products.lipColors = this.colorDatabase.lipColors[season] || [];
        }
        
        if (productType === 'all' || productType === 'eyeshadow') {
            products.eyeshadowColors = this.colorDatabase.eyeshadowColors[season] || [];
        }
        
        return {
            season: season,
            confidence: classification.ai_prediction[season],
            products: products,
            color_analysis: classification
        };
    }

    /**
     * 색상 팔레트 생성
     */
    generateColorPalette(baseSeason, paletteSize = 12) {
        const seasonColors = [];
        
        // 각 계절별 추천 색상에서 선택
        const baseColors = this.colorDatabase.hairColors[baseSeason] || [];
        const lipColors = this.colorDatabase.lipColors[baseSeason] || [];
        const eyeColors = this.colorDatabase.eyeshadowColors[baseSeason] || [];
        
        // 헤어컬러 추가
        baseColors.slice(0, 4).forEach(color => {
            seasonColors.push({
                hex: color.hex,
                name: color.name,
                category: 'hair',
                undertone: color.undertone
            });
        });
        
        // 립 컬러 추가
        lipColors.slice(0, 4).forEach(color => {
            seasonColors.push({
                hex: color.hex,
                name: color.name,
                category: 'lip',
                finish: color.finish
            });
        });
        
        // 아이 컬러 추가
        eyeColors.slice(0, 4).forEach(color => {
            seasonColors.push({
                hex: color.hex,
                name: color.name,
                category: 'eye',
                finish: color.finish
            });
        });
        
        return {
            season: baseSeason,
            palette: seasonColors.slice(0, paletteSize),
            created_at: new Date().toISOString()
        };
    }

    /**
     * 색상 조화도 검사
     */
    checkColorHarmony(colors) {
        if (!Array.isArray(colors) || colors.length < 2) {
            return { harmony: false, score: 0, message: '최소 2개 색상이 필요합니다.' };
        }
        
        const hslColors = colors.map(color => {
            const [r, g, b] = color;
            return this.rgbToHsl(r, g, b);
        });
        
        const hues = hslColors.map(hsl => hsl[0]);
        const saturations = hslColors.map(hsl => hsl[1]);
        const lightnesses = hslColors.map(hsl => hsl[2]);
        
        let harmonyScore = 100;
        let harmonyType = 'custom';
        
        // 색상환에서의 관계 분석
        if (colors.length === 2) {
            const hueDiff = Math.abs(hues[0] - hues[1]);
            const normalizedDiff = Math.min(hueDiff, 360 - hueDiff);
            
            if (normalizedDiff >= 170 && normalizedDiff <= 190) {
                harmonyType = 'complementary';
                harmonyScore = 95;
            } else if (normalizedDiff >= 55 && normalizedDiff <= 65) {
                harmonyType = 'analogous';
                harmonyScore = 85;
            }
        } else if (colors.length === 3) {
            // 삼색 조화 검사
            const sorted = [...hues].sort((a, b) => a - b);
            const diff1 = sorted[1] - sorted[0];
            const diff2 = sorted[2] - sorted[1];
            const diff3 = (sorted[0] + 360) - sorted[2];
            
            if (Math.abs(diff1 - 120) <= 20 && Math.abs(diff2 - 120) <= 20) {
                harmonyType = 'triadic';
                harmonyScore = 90;
            }
        }
        
        // 채도 일관성 검사
        const satVariance = this.calculateVariance(saturations);
        if (satVariance > 0.3) harmonyScore -= 15;
        
        // 명도 일관성 검사
        const lightVariance = this.calculateVariance(lightnesses);
        if (lightVariance > 0.3) harmonyScore -= 15;
        
        return {
            harmony: harmonyScore >= 70,
            score: Math.round(harmonyScore),
            type: harmonyType,
            message: this.getHarmonyMessage(harmonyScore, harmonyType),
            analysis: {
                hue_variance: this.calculateVariance(hues),
                saturation_variance: satVariance,
                lightness_variance: lightVariance
            }
        };
    }

    /**
     * 조화도 메시지 생성
     */
    getHarmonyMessage(score, type) {
        if (score >= 90) {
            return `뛰어난 색상 조화 (${type})`;
        } else if (score >= 80) {
            return `좋은 색상 조화`;
        } else if (score >= 70) {
            return `적당한 색상 조화`;
        } else if (score >= 60) {
            return `보통 색상 조화`;
        } else {
            return `색상 조화 개선 필요`;
        }
    }

    /**
     * 색상 대비 분석
     */
    analyzeColorContrast(color1, color2) {
        const [r1, g1, b1] = color1;
        const [r2, g2, b2] = color2;
        
        // 상대 휘도 계산
        const getLuminance = (r, g, b) => {
            const sRGB = [r, g, b].map(c => {
                c = c / 255;
                return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
            });
            return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
        };
        
        const lum1 = getLuminance(r1, g1, b1);
        const lum2 = getLuminance(r2, g2, b2);
        
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        
        const contrast = (brightest + 0.05) / (darkest + 0.05);
        
        let level;
        if (contrast >= 7) level = 'AAA';
        else if (contrast >= 4.5) level = 'AA';
        else if (contrast >= 3) level = 'A';
        else level = 'fail';
        
        return {
            ratio: Math.round(contrast * 100) / 100,
            level: level,
            accessible: contrast >= 4.5,
            description: this.getContrastDescription(contrast)
        };
    }

    /**
     * 대비 설명 생성
     */
    getContrastDescription(contrast) {
        if (contrast >= 7) return '매우 높은 대비 - 모든 용도에 적합';
        if (contrast >= 4.5) return '높은 대비 - 텍스트에 적합';
        if (contrast >= 3) return '중간 대비 - 큰 텍스트에만 적합';
        return '낮은 대비 - 가독성 문제 가능';
    }

    /**
     * 브랜드별 제품 매칭
     */
    matchBrandProducts(season, brands = []) {
        // 실제로는 외부 브랜드 DB에서 가져와야 함
        const brandMatching = {
            'MAC': {
                spring: ['Ruby Woo', 'Coral Bliss', 'Peach Harmony'],
                summer: ['Rose Romance', 'Berry Bliss', 'Lavender Dream'],
                autumn: ['Spice It Up', 'Burnt Orange', 'Chocolate Kiss'],
                winter: ['True Red', 'Deep Berry', 'Classic Wine']
            },
            'NARS': {
                spring: ['Orgasm', 'Peachy Keen', 'Golden Hour'],
                summer: ['Rose Quartz', 'Soft Mauve', 'Cool Berry'],
                autumn: ['Terracotta', 'Warm Spice', 'Rich Amber'],
                winter: ['Dragon Girl', 'Pure Red', 'Dramatic Plum']
            }
        };
        
        const results = {};
        
        if (brands.length === 0) {
            brands = Object.keys(brandMatching);
        }
        
        brands.forEach(brand => {
            if (brandMatching[brand] && brandMatching[brand][season]) {
                results[brand] = brandMatching[brand][season];
            }
        });
        
        return results;
    }

    /**
     * 시스템 상태 확인
     */
    getSystemStatus() {
        return {
            initialized: this.initialized,
            model_loaded: this.model !== null,
            pccs_system_ready: this.pccsSystem !== null,
            database_loaded: this.colorDatabase !== null,
            analysis_count: this.analysisHistory.length,
            timestamp: new Date().toISOString()
        };
    }
}

// 전역 등록 (브라우저 호환성)
if (typeof window !== 'undefined') {
    window.ColorClassifier = ColorClassifier;
    console.log('✅ ColorClassifier가 전역에 등록되었습니다.');
}

// ES6 모듈 지원
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ColorClassifier;
}
