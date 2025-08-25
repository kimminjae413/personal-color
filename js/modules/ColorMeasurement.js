// js/modules/ColorMeasurement.js - CIE L*a*b* 색상 분석 모듈

/**
 * 과학적 색상 측정 및 분석 클래스
 * CIE L*a*b* 색공간 기반 정밀 색상 분석
 */
class ColorMeasurement {
    constructor() {
        // 논문 기반 분류 임계값 (연구 데이터 기반)
        this.labThresholds = {
            lightness: {
                bright: 65,    // Spring Light, Summer Light
                medium: 50,    // Spring True, Summer True  
                deep: 35       // Autumn Deep, Winter Deep
            },
            chromaB: {
                warm: 0,       // b* > 0 = 따뜻함 (Yellow base)
                cool: 0        // b* < 0 = 차가움 (Blue base)
            },
            chromaA: {
                high: 15,      // 높은 채도 (겨울, 가을)
                medium: 8,     // 중간 채도 (봄, 여름)
                low: 3         // 낮은 채도 (Soft 타입)
            }
        };
        
        // 12계절별 L*a*b* 표준값
        this.seasonStandards = {
            'Spring Light': { L: [68, 75], a: [8, 12], b: [15, 20] },
            'Spring True': { L: [60, 68], a: [10, 15], b: [18, 25] },
            'Spring Deep': { L: [45, 55], a: [12, 18], b: [20, 28] },
            'Summer Light': { L: [70, 78], a: [12, 16], b: [5, 12] },
            'Summer True': { L: [55, 65], a: [8, 14], b: [2, 8] },
            'Summer Deep': { L: [40, 50], a: [6, 12], b: [-2, 5] },
            'Autumn Light': { L: [65, 72], a: [8, 14], b: [20, 28] },
            'Autumn True': { L: [50, 60], a: [12, 18], b: [22, 30] },
            'Autumn Deep': { L: [35, 45], a: [10, 16], b: [18, 26] },
            'Winter Bright': { L: [55, 65], a: [15, 22], b: [-5, 5] },
            'Winter True': { L: [45, 55], a: [8, 15], b: [-8, 2] },
            'Winter Deep': { L: [30, 40], a: [5, 12], b: [-10, 0] }
        };
    }

    /**
     * RGB → CIE L*a*b* 변환 (D50 표준광원)
     * @param {number} r - Red (0-255)
     * @param {number} g - Green (0-255) 
     * @param {number} b - Blue (0-255)
     * @returns {object} CIE L*a*b* 값
     */
    rgbToLab(r, g, b) {
        console.log(`RGB → Lab 변환: (${r}, ${g}, ${b})`);
        
        // 1. RGB 정규화
        r = r / 255;
        g = g / 255; 
        b = b / 255;

        // 2. sRGB → Linear RGB 변환 (감마 보정 해제)
        r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
        g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
        b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

        // 3. Linear RGB → XYZ 변환 (sRGB 매트릭스)
        // Observer 2°, Illuminant D50 기준
        const x = r * 0.4360747 + g * 0.3850649 + b * 0.1430804;
        const y = r * 0.2225045 + g * 0.7168786 + b * 0.0606169;
        const z = r * 0.0139322 + g * 0.0971045 + b * 0.7141733;

        // 4. XYZ → L*a*b* 변환
        const xn = 0.96422; // D50 표준 백색점
        const yn = 1.00000;
        const zn = 0.82521;

        let fx = x / xn;
        let fy = y / yn;
        let fz = z / zn;

        // f(t) 함수 적용
        fx = fx > 0.008856 ? Math.pow(fx, 1/3) : (7.787 * fx + 16/116);
        fy = fy > 0.008856 ? Math.pow(fy, 1/3) : (7.787 * fy + 16/116);
        fz = fz > 0.008856 ? Math.pow(fz, 1/3) : (7.787 * fz + 16/116);

        // 최종 L*a*b* 계산
        const L = 116 * fy - 16;
        const a = 500 * (fx - fy);
        const b_lab = 200 * (fy - fz);

        const result = { 
            L: Math.round(L * 100) / 100, 
            a: Math.round(a * 100) / 100, 
            b: Math.round(b_lab * 100) / 100 
        };
        
        console.log(`Lab 결과:`, result);
        return result;
    }

    /**
     * L*a*b* 기반 자동 계절 분류
     * @param {number} L - 명도
     * @param {number} a - a* (빨강-초록 축)
     * @param {number} b - b* (노랑-파랑 축)
     * @returns {object} 분류 결과
     */
    classifySeasonByLab(L, a, b) {
        console.log(`Lab 기반 계절 분류: L=${L}, a=${a}, b=${b}`);
        
        // 기본 온도감/명도/채도 판정
        const isWarm = b > this.labThresholds.chromaB.warm;
        const isBright = L > this.labThresholds.lightness.bright;
        const isMedium = L > this.labThresholds.lightness.medium && L <= this.labThresholds.lightness.bright;
        const isDeep = L <= this.labThresholds.lightness.medium;
        const isHighChroma = Math.sqrt(a*a + b*b) > this.labThresholds.chromaA.high;
        const isMediumChroma = Math.sqrt(a*a + b*b) > this.labThresholds.chromaA.medium;

        let season = '';
        let confidence = 0;

        // 논문 기반 분류 로직
        if (isWarm) {
            if (isBright) {
                season = isHighChroma ? 'Spring True' : 'Spring Light';
                confidence = isHighChroma ? 88 : 85;
            } else if (isMedium) {
                season = isHighChroma ? 'Spring True' : 'Autumn Light';
                confidence = 82;
            } else {
                season = isHighChroma ? 'Autumn Deep' : 'Autumn True';
                confidence = 90;
            }
        } else { // Cool
            if (isBright) {
                season = isHighChroma ? 'Winter Bright' : 'Summer Light';
                confidence = isHighChroma ? 87 : 84;
            } else if (isMedium) {
                season = isHighChroma ? 'Winter True' : 'Summer True';
                confidence = 89;
            } else {
                season = 'Winter Deep';
                confidence = 92;
            }
        }

        // 표준값과의 거리 계산으로 신뢰도 보정
        const distanceScore = this.calculateDistanceToStandard(L, a, b, season);
        const finalConfidence = Math.round(confidence * distanceScore);

        const result = {
            season: season,
            confidence: finalConfidence,
            labValues: { L, a, b },
            analysis: {
                temperature: isWarm ? 'warm' : 'cool',
                lightness: isBright ? 'bright' : isMedium ? 'medium' : 'deep',
                chroma: isHighChroma ? 'high' : isMediumChroma ? 'medium' : 'low'
            },
            recommendation: finalConfidence > 85 ? 'highly_recommended' : 
                           finalConfidence > 70 ? 'recommended' : 'needs_review'
        };

        console.log('Lab 분류 결과:', result);
        return result;
    }

    /**
     * 표준값과의 거리 계산 (Delta E 기반)
     * @param {number} L - 측정된 명도
     * @param {number} a - 측정된 a*
     * @param {number} b - 측정된 b*
     * @param {string} season - 예측된 계절
     * @returns {number} 거리 점수 (0-1)
     */
    calculateDistanceToStandard(L, a, b, season) {
        const standard = this.seasonStandards[season];
        if (!standard) return 0.5;

        // 각 축별 거리 계산
        const lDistance = Math.min(
            Math.abs(L - standard.L[0]),
            Math.abs(L - standard.L[1]),
            L >= standard.L[0] && L <= standard.L[1] ? 0 : Infinity
        );
        
        const aDistance = Math.min(
            Math.abs(a - standard.a[0]),
            Math.abs(a - standard.a[1]),
            a >= standard.a[0] && a <= standard.a[1] ? 0 : Infinity
        );
        
        const bDistance = Math.min(
            Math.abs(b - standard.b[0]),
            Math.abs(b - standard.b[1]),
            b >= standard.b[0] && b <= standard.b[1] ? 0 : Infinity
        );

        // Delta E CIE76 계산
        const deltaE = Math.sqrt(lDistance*lDistance + aDistance*aDistance + bDistance*bDistance);
        
        // 거리를 0-1 점수로 변환 (Delta E < 3이면 거의 일치)
        const score = Math.max(0, 1 - (deltaE / 30));
        
        console.log(`${season} 표준값과의 거리: ΔE=${deltaE.toFixed(2)}, 점수=${score.toFixed(3)}`);
        return score;
    }

    /**
     * 시각적 진단과 Lab 진단 결과 비교
     * @param {string} visualResult - 시각적 진단 결과
     * @param {object} labResult - Lab 진단 결과
     * @returns {object} 정확도 분석
     */
    compareResults(visualResult, labResult) {
        const isMatch = visualResult === labResult.season;
        const seasonDistance = this.getSeasonDistance(visualResult, labResult.season);
        
        // 계절 간 거리에 따른 정확도 계산
        let accuracy;
        if (isMatch) {
            accuracy = 100;
        } else if (seasonDistance <= 1) {
            accuracy = 85; // 인접 계절 (예: Spring Light ↔ Spring True)
        } else if (seasonDistance <= 2) {
            accuracy = 70; // 같은 온도감 다른 명도
        } else {
            accuracy = 50; // 완전히 다른 계절
        }

        return {
            match: isMatch,
            accuracy: accuracy,
            confidence: labResult.confidence > 80 && accuracy > 85 ? 'high' : 
                       labResult.confidence > 60 && accuracy > 70 ? 'medium' : 'low',
            recommendation: accuracy < 70 ? 'retest_recommended' : 'reliable',
            details: {
                visualSeason: visualResult,
                labSeason: labResult.season,
                labConfidence: labResult.confidence,
                seasonDistance: seasonDistance,
                analysisNote: this.generateAnalysisNote(visualResult, labResult)
            }
        };
    }

    /**
     * 계절 간 거리 계산
     * @param {string} season1 - 첫 번째 계절
     * @param {string} season2 - 두 번째 계절
     * @returns {number} 거리 (0-6)
     */
    getSeasonDistance(season1, season2) {
        const seasonMap = {
            'Spring Light': 0, 'Spring True': 1, 'Spring Deep': 2,
            'Summer Light': 3, 'Summer True': 4, 'Summer Deep': 5,
            'Autumn Light': 6, 'Autumn True': 7, 'Autumn Deep': 8,
            'Winter Light': 9, 'Winter True': 10, 'Winter Deep': 11
        };

        const pos1 = seasonMap[season1] || 0;
        const pos2 = seasonMap[season2] || 0;
        
        // 원형 배치에서의 최단 거리 계산
        const linearDistance = Math.abs(pos1 - pos2);
        return Math.min(linearDistance, 12 - linearDistance);
    }

    /**
     * 분석 노트 생성
     * @param {string} visualResult - 시각적 결과
     * @param {object} labResult - Lab 결과
     * @returns {string} 분석 설명
     */
    generateAnalysisNote(visualResult, labResult) {
        if (visualResult === labResult.season) {
            return `시각적 진단과 과학적 측정이 일치합니다. 높은 신뢰도로 ${labResult.season} 타입으로 분류됩니다.`;
        }
        
        const distance = this.getSeasonDistance(visualResult, labResult.season);
        
        if (distance <= 1) {
            return `시각적 진단(${visualResult})과 Lab 측정(${labResult.season})이 인접 계절로 분석되었습니다. 두 타입의 특성을 모두 고려하는 것을 권장합니다.`;
        } else {
            return `시각적 진단과 Lab 측정에 차이가 있습니다. 조명 조건을 개선하고 재진단을 권장합니다.`;
        }
    }

    /**
     * 색상 추출 도구 (이미지에서 대표 색상 추출)
     * @param {ImageData} imageData - 이미지 데이터
     * @param {object} region - 추출 영역 {x, y, width, height}
     * @returns {object} 평균 RGB 및 Lab 값
     */
    extractRegionColor(imageData, region) {
        const { data, width } = imageData;
        const { x, y, width: regionWidth, height: regionHeight } = region;
        
        let totalR = 0, totalG = 0, totalB = 0;
        let pixelCount = 0;

        // 지정된 영역의 픽셀들을 순회
        for (let dy = 0; dy < regionHeight; dy++) {
            for (let dx = 0; dx < regionWidth; dx++) {
                const pixelX = Math.floor(x + dx);
                const pixelY = Math.floor(y + dy);
                
                if (pixelX < width && pixelY < imageData.height) {
                    const index = (pixelY * width + pixelX) * 4;
                    totalR += data[index];
                    totalG += data[index + 1];
                    totalB += data[index + 2];
                    pixelCount++;
                }
            }
        }

        if (pixelCount === 0) return null;

        // 평균 RGB 계산
        const avgR = Math.round(totalR / pixelCount);
        const avgG = Math.round(totalG / pixelCount);
        const avgB = Math.round(totalB / pixelCount);

        // Lab 변환
        const lab = this.rgbToLab(avgR, avgG, avgB);

        return {
            rgb: { r: avgR, g: avgG, b: avgB },
            lab: lab,
            hex: this.rgbToHex(avgR, avgG, avgB),
            pixelCount: pixelCount
        };
    }

    /**
     * RGB를 HEX로 변환
     * @param {number} r - Red
     * @param {number} g - Green  
     * @param {number} b - Blue
     * @returns {string} HEX 색상 코드
     */
    rgbToHex(r, g, b) {
        return "#" + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }).join("");
    }

    /**
     * 색상 매칭 스코어 계산
     * @param {object} userLab - 사용자 Lab 값
     * @param {object} targetLab - 목표 Lab 값
     * @returns {number} 매칭 점수 (0-100)
     */
    calculateMatchingScore(userLab, targetLab) {
        const deltaE = Math.sqrt(
            Math.pow(userLab.L - targetLab.L, 2) +
            Math.pow(userLab.a - targetLab.a, 2) + 
            Math.pow(userLab.b - targetLab.b, 2)
        );
        
        // Delta E를 0-100 점수로 변환
        // Delta E < 1: 구분 불가 (100점)
        // Delta E < 3: 매우 유사 (90-99점)
        // Delta E < 6: 유사 (80-89점)
        // Delta E < 12: 인지 가능한 차이 (60-79점)
        
        let score;
        if (deltaE < 1) {
            score = 100;
        } else if (deltaE < 3) {
            score = 100 - (deltaE - 1) * 5; // 99-90
        } else if (deltaE < 6) {
            score = 90 - (deltaE - 3) * 3.33; // 89-80
        } else if (deltaE < 12) {
            score = 80 - (deltaE - 6) * 3.33; // 79-60
        } else {
            score = Math.max(0, 60 - (deltaE - 12) * 2); // 60-0
        }
        
        return Math.round(Math.max(0, Math.min(100, score)));
    }
}

// 전역 사용을 위한 윈도우 객체에 등록
if (typeof window !== 'undefined') {
    window.ColorMeasurement = ColorMeasurement;
    console.log('ColorMeasurement 모듈 로딩 완료');
}

// Node.js 환경 지원
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ColorMeasurement;
}
