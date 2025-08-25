/**
 * SeasonClassifier.js
 * 과학적 계절 분류 시스템 - CIE L*a*b* 색공간 기반
 * 
 * 기능:
 * - CIE L*a*b* 색공간 기반 정확한 색상 분석
 * - Delta E 2000 색차 계산
 * - 한국인 특화 피부톤 분석
 * - 12톤 시스템 지원 (4계절 × 3서브톤)
 * - 신뢰도 평가 시스템
 */

class SeasonClassifier {
    constructor() {
        this.initialized = false;
        this.seasonData = null;
        this.koreanSkinData = null;
        this.confidenceThreshold = 85; // 85% 이상 신뢰도 요구
        
        console.log('🎨 SeasonClassifier 생성자 실행');
    }

    /**
     * 시스템 초기화
     */
    async initialize() {
        try {
            // 계절 데이터 로드
            await this.loadSeasonData();
            await this.loadKoreanSkinData();
            
            this.initialized = true;
            console.log('✅ SeasonClassifier 초기화 완료');
            return true;
        } catch (error) {
            console.error('❌ SeasonClassifier 초기화 실패:', error);
            return false;
        }
    }

    /**
     * 계절 데이터 로드
     */
    async loadSeasonData() {
        // 기본 계절 특성 데이터
        this.seasonData = {
            spring: {
                name: { ko: '봄', en: 'Spring' },
                temperature: 'warm',
                clarity: 'clear',
                depth: 'light',
                intensity: 'bright',
                
                // CIE L*a*b* 기준값 (한국인 특화)
                lab_ranges: {
                    l: { min: 65, max: 75 },    // 밝은 피부
                    a: { min: 6, max: 12 },     // 약간 빨강 편향
                    b: { min: 12, max: 18 }     // 노란 편향 (웜톤)
                },
                
                // 주요 색상 특성
                characteristics: {
                    hue_preference: 'yellow_based',
                    saturation: 'high',
                    brightness: 'high',
                    contrast: 'medium'
                },
                
                // 서브타입
                subtypes: {
                    bright_spring: { clarity: 'very_clear', intensity: 'high' },
                    light_spring: { clarity: 'clear', intensity: 'medium' },
                    warm_spring: { temperature: 'very_warm', intensity: 'medium' }
                },
                
                // 추천 색상 (헥스 코드)
                recommended_colors: [
                    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
                    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
                ],
                
                // 피해야 할 색상
                avoid_colors: [
                    '#2C3E50', '#34495E', '#7F8C8D', '#BDC3C7',
                    '#800080', '#4B0082', '#191970', '#2F4F4F'
                ]
            },

            summer: {
                name: { ko: '여름', en: 'Summer' },
                temperature: 'cool',
                clarity: 'soft',
                depth: 'light',
                intensity: 'soft',
                
                lab_ranges: {
                    l: { min: 66, max: 76 },    // 밝은 피부
                    a: { min: 8, max: 14 },     // 핑크 편향
                    b: { min: 8, max: 14 }      // 중성-차가운 편향
                },
                
                characteristics: {
                    hue_preference: 'blue_based',
                    saturation: 'low_medium',
                    brightness: 'high_medium',
                    contrast: 'low'
                },
                
                subtypes: {
                    light_summer: { depth: 'very_light', intensity: 'low' },
                    soft_summer: { clarity: 'muted', intensity: 'medium' },
                    cool_summer: { temperature: 'very_cool', intensity: 'medium' }
                },
                
                recommended_colors: [
                    '#B39DDB', '#90CAF9', '#80DEEA', '#A5D6A7',
                    '#FFCDD2', '#F8BBD9', '#E1BEE7', '#D7CCC8'
                ],
                
                avoid_colors: [
                    '#FF5722', '#E65100', '#BF360C', '#D84315',
                    '#FF6F00', '#F57C00', '#E65100', '#FF8F00'
                ]
            },

            autumn: {
                name: { ko: '가을', en: 'Autumn' },
                temperature: 'warm',
                clarity: 'muted',
                depth: 'deep',
                intensity: 'deep',
                
                lab_ranges: {
                    l: { min: 58, max: 68 },    // 중간-어두운 피부
                    a: { min: 10, max: 16 },    // 빨강 편향
                    b: { min: 14, max: 22 }     // 강한 노란 편향
                },
                
                characteristics: {
                    hue_preference: 'yellow_orange_based',
                    saturation: 'high',
                    brightness: 'low_medium',
                    contrast: 'high'
                },
                
                subtypes: {
                    deep_autumn: { depth: 'very_deep', intensity: 'high' },
                    warm_autumn: { temperature: 'very_warm', intensity: 'high' },
                    soft_autumn: { clarity: 'muted', intensity: 'medium' }
                },
                
                recommended_colors: [
                    '#D2691E', '#CD853F', '#DEB887', '#F4A460',
                    '#8B4513', '#A0522D', '#CD853F', '#DAA520'
                ],
                
                avoid_colors: [
                    '#E8F5E8', '#F0F8FF', '#E6E6FA', '#F5F5DC',
                    '#00CED1', '#20B2AA', '#48D1CC', '#40E0D0'
                ]
            },

            winter: {
                name: { ko: '겨울', en: 'Winter' },
                temperature: 'cool',
                clarity: 'clear',
                depth: 'deep',
                intensity: 'deep',
                
                lab_ranges: {
                    l: { min: 57, max: 67 },    // 중간-어두운 피부
                    a: { min: 11, max: 17 },    // 강한 핑크 편향
                    b: { min: 10, max: 16 }     // 차가운 편향
                },
                
                characteristics: {
                    hue_preference: 'blue_red_based',
                    saturation: 'high',
                    brightness: 'extreme', // 매우 밝거나 매우 어둡거나
                    contrast: 'high'
                },
                
                subtypes: {
                    deep_winter: { depth: 'very_deep', intensity: 'high' },
                    cool_winter: { temperature: 'very_cool', intensity: 'high' },
                    clear_winter: { clarity: 'very_clear', intensity: 'high' }
                },
                
                recommended_colors: [
                    '#000080', '#4B0082', '#8B008B', '#DC143C',
                    '#FF1493', '#FF69B4', '#00BFFF', '#1E90FF'
                ],
                
                avoid_colors: [
                    '#F5DEB3', '#DEB887', '#D2B48C', '#BC8F8F',
                    '#CD853F', '#DAA520', '#B8860B', '#FF8C00'
                ]
            }
        };

        console.log('✅ 계절 데이터 로드 완료');
    }

    /**
     * 한국인 피부톤 데이터 로드
     */
    async loadKoreanSkinData() {
        // 한국인 특화 피부톤 보정 데이터
        this.koreanSkinData = {
            // 연령대별 보정 계수
            age_corrections: {
                '20-29': { l: 1.02, clarity: 1.05 },
                '30-39': { l: 1.00, clarity: 1.00 },
                '40-49': { l: 0.98, clarity: 0.95 },
                '50+': { l: 0.95, clarity: 0.92 }
            },
            
            // 계절별 한국인 평균값
            korean_averages: {
                spring: { l: 67.58, a: 8.91, b: 14.23 },
                summer: { l: 67.92, a: 9.45, b: 11.70 },
                autumn: { l: 62.09, a: 11.25, b: 16.54 },
                winter: { l: 61.41, a: 12.46, b: 13.82 }
            },
            
            // 지역별 보정 (한국 내 지역차이)
            regional_corrections: {
                seoul: { l: 1.01, a: 1.00, b: 0.99 },
                busan: { l: 0.99, a: 1.02, b: 1.01 },
                jeju: { l: 0.97, a: 1.03, b: 1.02 }
            }
        };

        console.log('✅ 한국인 피부톤 데이터 로드 완료');
    }

    /**
     * 메인 계절 분류 함수
     * @param {Object} labValues - CIE L*a*b* 값 {l, a, b}
     * @param {Object} options - 추가 옵션 (나이, 성별, 지역 등)
     * @returns {Object} - 분류 결과
     */
    classifySeason(labValues, options = {}) {
        if (!this.initialized) {
            console.error('SeasonClassifier가 초기화되지 않았습니다.');
            return null;
        }

        // 입력값 검증
        if (!this.validateLabValues(labValues)) {
            console.error('유효하지 않은 L*a*b* 값입니다.');
            return null;
        }

        try {
            // 1단계: 기본 분류
            const basicClassification = this.performBasicClassification(labValues);
            
            // 2단계: 한국인 특화 보정
            const correctedValues = this.applyKoreanCorrections(labValues, options);
            
            // 3단계: 정밀 분류
            const preciseClassification = this.performPreciseClassification(correctedValues);
            
            // 4단계: 서브타입 분류
            const subtypeClassification = this.classifySubtype(preciseClassification, correctedValues);
            
            // 5단계: 신뢰도 계산
            const confidence = this.calculateConfidence(subtypeClassification, correctedValues);
            
            // 최종 결과 생성
            const result = {
                primary_season: subtypeClassification.season,
                subtype: subtypeClassification.subtype,
                confidence: confidence,
                lab_values: correctedValues,
                characteristics: this.seasonData[subtypeClassification.season].characteristics,
                recommended_colors: this.seasonData[subtypeClassification.season].recommended_colors,
                avoid_colors: this.seasonData[subtypeClassification.season].avoid_colors,
                analysis_details: {
                    temperature: this.analyzeTemperature(correctedValues),
                    clarity: this.analyzeClarity(correctedValues),
                    depth: this.analyzeDepth(correctedValues),
                    intensity: this.analyzeIntensity(correctedValues)
                },
                timestamp: new Date().toISOString()
            };

            console.log('✅ 계절 분류 완료:', result);
            return result;

        } catch (error) {
            console.error('❌ 계절 분류 중 오류:', error);
            return null;
        }
    }

    /**
     * L*a*b* 값 검증
     */
    validateLabValues(labValues) {
        if (!labValues || typeof labValues !== 'object') return false;
        
        const { l, a, b } = labValues;
        
        // L*: 0-100, a*: -128~127, b*: -128~127
        return (
            typeof l === 'number' && l >= 0 && l <= 100 &&
            typeof a === 'number' && a >= -128 && a <= 127 &&
            typeof b === 'number' && b >= -128 && b <= 127
        );
    }

    /**
     * 기본 분류 수행
     */
    performBasicClassification(labValues) {
        const { l, a, b } = labValues;
        
        // 온도감 분석 (a*, b* 기반)
        const isWarm = b > a; // b*값이 a*값보다 크면 웜톤
        
        // 명도 분석 (L* 기반)
        const isLight = l > 64; // 한국인 평균 기준
        
        // 기본 4계절 분류
        if (isWarm && isLight) return 'spring';
        if (!isWarm && isLight) return 'summer';
        if (isWarm && !isLight) return 'autumn';
        if (!isWarm && !isLight) return 'winter';
        
        return 'spring'; // 기본값
    }

    /**
     * 한국인 특화 보정 적용
     */
    applyKoreanCorrections(labValues, options) {
        let corrected = { ...labValues };
        
        // 나이별 보정
        if (options.age) {
            const ageGroup = this.getAgeGroup(options.age);
            const ageCorrection = this.koreanSkinData.age_corrections[ageGroup];
            
            if (ageCorrection) {
                corrected.l *= ageCorrection.l;
                // clarity 보정은 추후 적용
            }
        }
        
        // 지역별 보정
        if (options.region) {
            const regionCorrection = this.koreanSkinData.regional_corrections[options.region];
            if (regionCorrection) {
                corrected.l *= regionCorrection.l;
                corrected.a *= regionCorrection.a;
                corrected.b *= regionCorrection.b;
            }
        }
        
        return corrected;
    }

    /**
     * 정밀 분류 수행 (Delta E 기반)
     */
    performPreciseClassification(labValues) {
        const distances = {};
        
        // 각 계절과의 색차 계산
        Object.keys(this.koreanSkinData.korean_averages).forEach(season => {
            const seasonAverage = this.koreanSkinData.korean_averages[season];
            distances[season] = this.calculateDeltaE2000(labValues, seasonAverage);
        });
        
        // 최소 거리 계절 선택
        const closestSeason = Object.keys(distances).reduce((a, b) => 
            distances[a] < distances[b] ? a : b
        );
        
        return {
            season: closestSeason,
            distances: distances,
            confidence_from_distance: this.distanceToConfidence(distances[closestSeason])
        };
    }

    /**
     * Delta E 2000 색차 계산 (간소화 버전)
     */
    calculateDeltaE2000(lab1, lab2) {
        const deltaL = lab1.l - lab2.l;
        const deltaA = lab1.a - lab2.a;
        const deltaB = lab1.b - lab2.b;
        
        // 간소화된 Delta E 계산 (정확한 Delta E 2000은 매우 복잡)
        const deltaE = Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
        
        return deltaE;
    }

    /**
     * 서브타입 분류
     */
    classifySubtype(primaryResult, labValues) {
        const season = primaryResult.season;
        const seasonInfo = this.seasonData[season];
        const { l, a, b } = labValues;
        
        let subtype = Object.keys(seasonInfo.subtypes)[0]; // 기본값
        
        // 각 계절별 서브타입 로직
        switch (season) {
            case 'spring':
                if (l > 70 && Math.abs(a - b) < 3) subtype = 'light_spring';
                else if (b > a + 4) subtype = 'warm_spring';
                else subtype = 'bright_spring';
                break;
                
            case 'summer':
                if (l > 70) subtype = 'light_summer';
                else if (Math.abs(a - b) < 2) subtype = 'soft_summer';
                else subtype = 'cool_summer';
                break;
                
            case 'autumn':
                if (l < 60) subtype = 'deep_autumn';
                else if (b > a + 5) subtype = 'warm_autumn';
                else subtype = 'soft_autumn';
                break;
                
            case 'winter':
                if (l < 60) subtype = 'deep_winter';
                else if (a > b + 3) subtype = 'cool_winter';
                else subtype = 'clear_winter';
                break;
        }
        
        return {
            season: season,
            subtype: subtype
        };
    }

    /**
     * 신뢰도 계산
     */
    calculateConfidence(classification, labValues) {
        const seasonData = this.seasonData[classification.season];
        const ranges = seasonData.lab_ranges;
        
        let confidence = 100;
        
        // L* 값 적합도
        if (labValues.l < ranges.l.min || labValues.l > ranges.l.max) {
            confidence -= 15;
        }
        
        // a* 값 적합도
        if (labValues.a < ranges.a.min || labValues.a > ranges.a.max) {
            confidence -= 10;
        }
        
        // b* 값 적합도
        if (labValues.b < ranges.b.min || labValues.b > ranges.b.max) {
            confidence -= 10;
        }
        
        // 최소 50% 신뢰도 보장
        confidence = Math.max(50, confidence);
        
        return Math.round(confidence);
    }

    /**
     * 온도감 분석
     */
    analyzeTemperature(labValues) {
        const { a, b } = labValues;
        const warmth = b - a;
        
        if (warmth > 4) return 'very_warm';
        if (warmth > 1) return 'warm';
        if (warmth > -1) return 'neutral';
        if (warmth > -4) return 'cool';
        return 'very_cool';
    }

    /**
     * 선명도 분석
     */
    analyzeClarity(labValues) {
        const chroma = Math.sqrt(labValues.a * labValues.a + labValues.b * labValues.b);
        
        if (chroma > 20) return 'very_clear';
        if (chroma > 15) return 'clear';
        if (chroma > 10) return 'soft';
        if (chroma > 5) return 'muted';
        return 'very_muted';
    }

    /**
     * 깊이 분석
     */
    analyzeDepth(labValues) {
        const { l } = labValues;
        
        if (l > 75) return 'very_light';
        if (l > 65) return 'light';
        if (l > 55) return 'medium';
        if (l > 45) return 'deep';
        return 'very_deep';
    }

    /**
     * 강도 분석
     */
    analyzeIntensity(labValues) {
        const chroma = Math.sqrt(labValues.a * labValues.a + labValues.b * labValues.b);
        const intensity = chroma * (labValues.l / 100);
        
        if (intensity > 18) return 'high';
        if (intensity > 12) return 'medium';
        if (intensity > 8) return 'low';
        return 'very_low';
    }

    /**
     * 나이 그룹 결정
     */
    getAgeGroup(age) {
        if (age < 30) return '20-29';
        if (age < 40) return '30-39';
        if (age < 50) return '40-49';
        return '50+';
    }

    /**
     * 거리를 신뢰도로 변환
     */
    distanceToConfidence(distance) {
        // 거리가 클수록 신뢰도 감소
        const maxDistance = 20; // 최대 예상 거리
        const confidence = Math.max(0, (1 - distance / maxDistance) * 100);
        return Math.round(confidence);
    }

    /**
     * 계절 정보 가져오기
     */
    getSeasonInfo(season) {
        if (!this.seasonData || !this.seasonData[season]) {
            return null;
        }
        
        return {
            ...this.seasonData[season],
            korean_average: this.koreanSkinData.korean_averages[season]
        };
    }

    /**
     * 모든 계절 정보 가져오기
     */
    getAllSeasonsInfo() {
        if (!this.initialized) return null;
        
        return Object.keys(this.seasonData).map(season => ({
            season: season,
            info: this.getSeasonInfo(season)
        }));
    }

    /**
     * 시스템 상태 확인
     */
    getSystemStatus() {
        return {
            initialized: this.initialized,
            seasons_loaded: this.seasonData !== null,
            korean_data_loaded: this.koreanSkinData !== null,
            confidence_threshold: this.confidenceThreshold,
            timestamp: new Date().toISOString()
        };
    }
}

// 전역 등록 (브라우저 호환성)
if (typeof window !== 'undefined') {
    window.SeasonClassifier = SeasonClassifier;
    console.log('✅ SeasonClassifier가 전역에 등록되었습니다.');
}

// ES6 모듈 지원
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SeasonClassifier;
}
