/**
 * DeltaE.js
 * CIE Delta E 색차 계산 모듈
 * - Delta E 76, 94, 2000 공식 지원
 * - 퍼스널컬러 진단을 위한 정밀 색차 계산
 * - 배치 처리 및 성능 최적화
 * - 색차 임계값 기반 유사도 판정
 */

import { CONFIG } from '../config.js';

export class DeltaE {
    constructor() {
        // Delta E 임계값 설정
        this.thresholds = {
            // CIE Delta E 2000 기준
            justNoticeable: 1.0,    // 눈으로 구분하기 어려운 수준
            perceptible: 2.3,       // 인지 가능한 차이
            noticeable: 5.0,        // 명확히 구분 가능
            significant: 10.0,      // 상당한 차이
            
            // 퍼스널컬러 진단 특화 임계값
            skinTone: {
                excellent: 3.0,     // 매우 잘 맞음
                good: 6.0,          // 잘 맞음
                acceptable: 10.0,   // 허용 가능
                poor: 15.0          // 잘 맞지 않음
            }
        };
        
        // 설정에서 임계값 로드
        if (CONFIG.COLOR_ANALYSIS?.deltaE?.thresholds) {
            this.thresholds = { ...this.thresholds, ...CONFIG.COLOR_ANALYSIS.deltaE.thresholds };
        }
        
        // 성능 최적화를 위한 캐싱
        this.cache = new Map();
        this.cacheEnabled = true;
        this.maxCacheSize = 1000;
        
        console.log('DeltaE 모듈 초기화 완료');
    }

    // CIE Delta E 76 (1976) 계산
    calculateDeltaE76(lab1, lab2) {
        const cacheKey = this.generateCacheKey('76', lab1, lab2);
        
        if (this.cacheEnabled && this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        const deltaL = lab1.l - lab2.l;
        const deltaA = lab1.a - lab2.a;
        const deltaB = lab1.b - lab2.b;
        
        const deltaE = Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
        
        this.cacheResult(cacheKey, deltaE);
        return deltaE;
    }

    // CIE Delta E 94 (1994) 계산
    calculateDeltaE94(lab1, lab2, textiles = false) {
        const cacheKey = this.generateCacheKey('94', lab1, lab2, textiles);
        
        if (this.cacheEnabled && this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        // 가중치 설정 (textiles vs graphic arts)
        const kL = textiles ? 2 : 1;
        const kC = 1;
        const kH = 1;
        const K1 = textiles ? 0.048 : 0.045;
        const K2 = textiles ? 0.014 : 0.015;
        
        const deltaL = lab1.l - lab2.l;
        const deltaA = lab1.a - lab2.a;
        const deltaB = lab1.b - lab2.b;
        
        const C1 = Math.sqrt(lab1.a * lab1.a + lab1.b * lab1.b);
        const C2 = Math.sqrt(lab2.a * lab2.a + lab2.b * lab2.b);
        const deltaC = C1 - C2;
        
        const deltaH2 = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
        const deltaH = deltaH2 > 0 ? Math.sqrt(deltaH2) : 0;
        
        const SL = 1;
        const SC = 1 + K1 * C1;
        const SH = 1 + K2 * C1;
        
        const deltaE = Math.sqrt(
            Math.pow(deltaL / (kL * SL), 2) +
            Math.pow(deltaC / (kC * SC), 2) +
            Math.pow(deltaH / (kH * SH), 2)
        );
        
        this.cacheResult(cacheKey, deltaE);
        return deltaE;
    }

    // CIE Delta E 2000 (가장 정확한 공식)
    calculateDeltaE2000(lab1, lab2, kL = 1, kC = 1, kH = 1) {
        const cacheKey = this.generateCacheKey('2000', lab1, lab2, kL, kC, kH);
        
        if (this.cacheEnabled && this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        const result = this.computeDeltaE2000(lab1, lab2, kL, kC, kH);
        
        this.cacheResult(cacheKey, result);
        return result;
    }

    computeDeltaE2000(lab1, lab2, kL, kC, kH) {
        // Step 1: LAB 값 준비
        const L1 = lab1.l, a1 = lab1.a, b1 = lab1.b;
        const L2 = lab2.l, a2 = lab2.a, b2 = lab2.b;
        
        // Step 2: C와 G 계산
        const C1 = Math.sqrt(a1 * a1 + b1 * b1);
        const C2 = Math.sqrt(a2 * a2 + b2 * b2);
        const Cbar = (C1 + C2) / 2;
        
        const G = 0.5 * (1 - Math.sqrt(Math.pow(Cbar, 7) / (Math.pow(Cbar, 7) + Math.pow(25, 7))));
        
        // Step 3: a'과 C' 계산
        const a1_prime = a1 * (1 + G);
        const a2_prime = a2 * (1 + G);
        
        const C1_prime = Math.sqrt(a1_prime * a1_prime + b1 * b1);
        const C2_prime = Math.sqrt(a2_prime * a2_prime + b2 * b2);
        
        // Step 4: h' 계산
        let h1_prime = this.calculateHuePrime(a1_prime, b1);
        let h2_prime = this.calculateHuePrime(a2_prime, b2);
        
        // Step 5: 델타 값들 계산
        const deltaL_prime = L2 - L1;
        const deltaC_prime = C2_prime - C1_prime;
        const deltaH_prime = this.calculateDeltaHPrime(C1_prime, C2_prime, h1_prime, h2_prime);
        const deltaH_prime_value = 2 * Math.sqrt(C1_prime * C2_prime) * Math.sin(this.toRadians(deltaH_prime / 2));
        
        // Step 6: 평균값들 계산
        const Lbar_prime = (L1 + L2) / 2;
        const Cbar_prime = (C1_prime + C2_prime) / 2;
        const Hbar_prime = this.calculateHbarPrime(h1_prime, h2_prime, C1_prime, C2_prime);
        
        // Step 7: T 계산
        const T = 1 - 0.17 * Math.cos(this.toRadians(Hbar_prime - 30)) +
                      0.24 * Math.cos(this.toRadians(2 * Hbar_prime)) +
                      0.32 * Math.cos(this.toRadians(3 * Hbar_prime + 6)) -
                      0.20 * Math.cos(this.toRadians(4 * Hbar_prime - 63));
        
        // Step 8: 가중치 함수들 계산
        const SL = 1 + (0.015 * Math.pow(Lbar_prime - 50, 2)) / Math.sqrt(20 + Math.pow(Lbar_prime - 50, 2));
        const SC = 1 + 0.045 * Cbar_prime;
        const SH = 1 + 0.015 * Cbar_prime * T;
        
        // Step 9: RT 회전 항 계산
        const deltaTheta = 30 * Math.exp(-Math.pow((Hbar_prime - 275) / 25, 2));
        const RC = 2 * Math.sqrt(Math.pow(Cbar_prime, 7) / (Math.pow(Cbar_prime, 7) + Math.pow(25, 7)));
        const RT = -RC * Math.sin(this.toRadians(2 * deltaTheta));
        
        // Step 10: 최종 Delta E 2000 계산
        const deltaE = Math.sqrt(
            Math.pow(deltaL_prime / (kL * SL), 2) +
            Math.pow(deltaC_prime / (kC * SC), 2) +
            Math.pow(deltaH_prime_value / (kH * SH), 2) +
            RT * (deltaC_prime / (kC * SC)) * (deltaH_prime_value / (kH * SH))
        );
        
        return deltaE;
    }

    calculateHuePrime(a_prime, b) {
        if (a_prime === 0 && b === 0) return 0;
        
        let hue = this.toDegrees(Math.atan2(b, a_prime));
        return hue >= 0 ? hue : hue + 360;
    }

    calculateDeltaHPrime(C1_prime, C2_prime, h1_prime, h2_prime) {
        if (C1_prime === 0 || C2_prime === 0) return 0;
        
        const deltaH = h2_prime - h1_prime;
        
        if (Math.abs(deltaH) <= 180) {
            return deltaH;
        } else if (deltaH > 180) {
            return deltaH - 360;
        } else {
            return deltaH + 360;
        }
    }

    calculateHbarPrime(h1_prime, h2_prime, C1_prime, C2_prime) {
        if (C1_prime === 0 || C2_prime === 0) {
            return h1_prime + h2_prime;
        }
        
        const deltaH = Math.abs(h1_prime - h2_prime);
        const sum = h1_prime + h2_prime;
        
        if (deltaH <= 180) {
            return sum / 2;
        } else if (sum < 360) {
            return (sum + 360) / 2;
        } else {
            return (sum - 360) / 2;
        }
    }

    // 각도 변환 유틸리티
    toRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    toDegrees(radians) {
        return radians * 180 / Math.PI;
    }

    // 색차 기반 유사도 판정
    assessColorSimilarity(deltaE, context = 'general') {
        const thresholds = context === 'skinTone' ? this.thresholds.skinTone : this.thresholds;
        
        if (context === 'skinTone') {
            if (deltaE <= thresholds.excellent) return { level: 'excellent', score: 95, description: '매우 잘 어울림' };
            if (deltaE <= thresholds.good) return { level: 'good', score: 85, description: '잘 어울림' };
            if (deltaE <= thresholds.acceptable) return { level: 'acceptable', score: 70, description: '어울림' };
            if (deltaE <= thresholds.poor) return { level: 'poor', score: 50, description: '보통' };
            return { level: 'bad', score: 30, description: '잘 맞지 않음' };
        } else {
            if (deltaE <= thresholds.justNoticeable) return { level: 'identical', score: 98, description: '거의 동일함' };
            if (deltaE <= thresholds.perceptible) return { level: 'similar', score: 90, description: '매우 유사함' };
            if (deltaE <= thresholds.noticeable) return { level: 'noticeable', score: 75, description: '유사함' };
            if (deltaE <= thresholds.significant) return { level: 'different', score: 50, description: '다름' };
            return { level: 'very_different', score: 25, description: '매우 다름' };
        }
    }

    // 배치 Delta E 계산
    calculateBatchDeltaE(referenceColor, colors, formula = '2000') {
        const results = [];
        
        colors.forEach((color, index) => {
            let deltaE;
            
            switch (formula) {
                case '76':
                    deltaE = this.calculateDeltaE76(referenceColor, color);
                    break;
                case '94':
                    deltaE = this.calculateDeltaE94(referenceColor, color);
                    break;
                case '2000':
                default:
                    deltaE = this.calculateDeltaE2000(referenceColor, color);
                    break;
            }
            
            const similarity = this.assessColorSimilarity(deltaE);
            
            results.push({
                index,
                color,
                deltaE: Math.round(deltaE * 100) / 100,
                similarity,
                formula
            });
        });
        
        // Delta E 값으로 정렬 (유사도 순)
        results.sort((a, b) => a.deltaE - b.deltaE);
        
        return results;
    }

    // 가장 유사한 색상 찾기
    findClosestColors(targetColor, colorDatabase, count = 5, formula = '2000') {
        const results = this.calculateBatchDeltaE(targetColor, colorDatabase, formula);
        return results.slice(0, count);
    }

    // 색상 매칭 점수 계산
    calculateMatchingScore(skinColor, testColor, weights = {}) {
        const defaultWeights = {
            deltaE: 0.7,        // Delta E가 가장 중요
            lightness: 0.15,    // 명도 차이
            chroma: 0.1,        // 채도 차이  
            hue: 0.05          // 색상 차이
        };
        
        const w = { ...defaultWeights, ...weights };
        
        // Delta E 계산
        const deltaE = this.calculateDeltaE2000(skinColor, testColor);
        const deltaEScore = Math.max(0, 100 - deltaE * 5); // Delta E를 0-100 점수로 변환
        
        // 개별 차이 계산
        const lightnessScore = Math.max(0, 100 - Math.abs(skinColor.l - testColor.l) * 2);
        
        const skinChroma = Math.sqrt(skinColor.a * skinColor.a + skinColor.b * skinColor.b);
        const testChroma = Math.sqrt(testColor.a * testColor.a + testColor.b * testColor.b);
        const chromaScore = Math.max(0, 100 - Math.abs(skinChroma - testChroma) * 3);
        
        // 색상(Hue) 차이는 LAB의 a, b 값으로 근사 계산
        const skinHue = Math.atan2(skinColor.b, skinColor.a);
        const testHue = Math.atan2(testColor.b, testColor.a);
        let hueDiff = Math.abs(skinHue - testHue);
        if (hueDiff > Math.PI) hueDiff = 2 * Math.PI - hueDiff;
        const hueScore = Math.max(0, 100 - (hueDiff / Math.PI) * 100);
        
        // 가중평균으로 최종 점수 계산
        const totalScore = 
            deltaEScore * w.deltaE +
            lightnessScore * w.lightness +
            chromaScore * w.chroma +
            hueScore * w.hue;
        
        return {
            overall: Math.round(totalScore),
            details: {
                deltaE: Math.round(deltaEScore),
                lightness: Math.round(lightnessScore),
                chroma: Math.round(chromaScore),
                hue: Math.round(hueScore)
            },
            deltaE: Math.round(deltaE * 100) / 100
        };
    }

    // 퍼스널컬러 계절별 매칭 분석
    analyzeSeasonMatching(skinColor, seasonColors) {
        const seasonResults = {};
        
        Object.entries(seasonColors).forEach(([season, colors]) => {
            const seasonScores = colors.map(color => {
                const deltaE = this.calculateDeltaE2000(skinColor, color);
                const similarity = this.assessColorSimilarity(deltaE, 'skinTone');
                
                return {
                    color,
                    deltaE: Math.round(deltaE * 100) / 100,
                    similarity,
                    score: similarity.score
                };
            });
            
            // 평균 점수 계산
            const avgScore = seasonScores.reduce((sum, result) => sum + result.score, 0) / seasonScores.length;
            const bestMatch = seasonScores.reduce((best, current) => 
                current.score > best.score ? current : best);
            
            seasonResults[season] = {
                averageScore: Math.round(avgScore),
                bestMatch,
                allMatches: seasonScores.sort((a, b) => b.score - a.score),
                recommendation: avgScore >= 80 ? 'excellent' :
                              avgScore >= 70 ? 'good' :
                              avgScore >= 60 ? 'acceptable' : 'poor'
            };
        });
        
        // 가장 적합한 계절 선택
        const bestSeason = Object.entries(seasonResults)
            .reduce((best, [season, result]) => 
                result.averageScore > best.score ? { season, score: result.averageScore } : best,
                { season: null, score: 0 });
        
        return {
            bestSeason: bestSeason.season,
            confidence: bestSeason.score / 100,
            seasonResults,
            summary: this.generateMatchingSummary(seasonResults, bestSeason.season)
        };
    }

    generateMatchingSummary(seasonResults, bestSeason) {
        const bestResult = seasonResults[bestSeason];
        
        let summary = `${this.getSeasonName(bestSeason)} 타입이 가장 잘 어울립니다 (${bestResult.averageScore}점).`;
        
        if (bestResult.averageScore >= 85) {
            summary += ' 매우 훌륭한 매칭입니다!';
        } else if (bestResult.averageScore >= 75) {
            summary += ' 좋은 매칭입니다.';
        } else if (bestResult.averageScore >= 65) {
            summary += ' 적절한 매칭입니다.';
        } else {
            summary += ' 다른 색상도 함께 고려해보세요.';
        }
        
        return summary;
    }

    getSeasonName(season) {
        const names = {
            spring: '봄',
            summer: '여름', 
            autumn: '가을',
            winter: '겨울'
        };
        return names[season] || season;
    }

    // 색상 조화도 분석 (여러 색상 간)
    analyzeColorHarmony(colors, formula = '2000') {
        if (colors.length < 2) return null;
        
        const harmonies = [];
        const deltaEValues = [];
        
        // 모든 색상 쌍에 대해 Delta E 계산
        for (let i = 0; i < colors.length - 1; i++) {
            for (let j = i + 1; j < colors.length; j++) {
                const deltaE = formula === '2000' ? 
                    this.calculateDeltaE2000(colors[i], colors[j]) :
                    formula === '94' ?
                    this.calculateDeltaE94(colors[i], colors[j]) :
                    this.calculateDeltaE76(colors[i], colors[j]);
                
                deltaEValues.push(deltaE);
                harmonies.push({
                    pair: [i, j],
                    colors: [colors[i], colors[j]],
                    deltaE: Math.round(deltaE * 100) / 100,
                    similarity: this.assessColorSimilarity(deltaE)
                });
            }
        }
        
        // 통계 계산
        const avgDeltaE = deltaEValues.reduce((sum, val) => sum + val, 0) / deltaEValues.length;
        const minDeltaE = Math.min(...deltaEValues);
        const maxDeltaE = Math.max(...deltaEValues);
        
        // 조화도 평가
        let harmonyLevel = 'poor';
        let harmonyScore = 50;
        
        if (avgDeltaE < 10) {
            harmonyLevel = 'excellent';
            harmonyScore = 95;
        } else if (avgDeltaE < 20) {
            harmonyLevel = 'good'; 
            harmonyScore = 80;
        } else if (avgDeltaE < 35) {
            harmonyLevel = 'acceptable';
            harmonyScore = 65;
        }
        
        return {
            harmonyLevel,
            harmonyScore,
            statistics: {
                average: Math.round(avgDeltaE * 100) / 100,
                minimum: Math.round(minDeltaE * 100) / 100,
                maximum: Math.round(maxDeltaE * 100) / 100,
                pairs: harmonies.length
            },
            pairAnalysis: harmonies.sort((a, b) => a.deltaE - b.deltaE),
            recommendation: this.getHarmonyRecommendation(harmonyLevel, avgDeltaE)
        };
    }

    getHarmonyRecommendation(level, avgDeltaE) {
        switch (level) {
            case 'excellent':
                return '색상들이 매우 조화롭습니다. 완벽한 조합입니다.';
            case 'good':
                return '색상들이 잘 어울립니다. 좋은 선택입니다.';
            case 'acceptable':
                return '무난한 색상 조합입니다.';
            default:
                return `색상 차이가 큽니다 (ΔE=${avgDeltaE.toFixed(1)}). 더 유사한 색상을 고려해보세요.`;
        }
    }

    // 캐시 관리
    generateCacheKey(...args) {
        return JSON.stringify(args);
    }

    cacheResult(key, result) {
        if (!this.cacheEnabled) return;
        
        this.cache.set(key, result);
        
        // 캐시 크기 제한
        if (this.cache.size > this.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
    }

    clearCache() {
        this.cache.clear();
    }

    setCacheEnabled(enabled) {
        this.cacheEnabled = enabled;
        if (!enabled) {
            this.clearCache();
        }
    }

    // 성능 통계
    getCacheStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxCacheSize,
            enabled: this.cacheEnabled,
            hitRate: this.cacheHits / (this.cacheHits + this.cacheMisses) || 0
        };
    }

    // 임계값 설정
    setThresholds(newThresholds) {
        this.thresholds = { ...this.thresholds, ...newThresholds };
    }

    getThresholds() {
        return this.thresholds;
    }

    // 색차 공식 비교
    compareFormulas(lab1, lab2) {
        return {
            deltaE76: this.calculateDeltaE76(lab1, lab2),
            deltaE94: this.calculateDeltaE94(lab1, lab2),
            deltaE2000: this.calculateDeltaE2000(lab1, lab2),
            recommendation: 'Delta E 2000이 가장 정확한 인간의 시각적 인지와 일치합니다.'
        };
    }

    // 벤치마크 테스트
    benchmark(iterations = 1000) {
        const testColors = [
            { l: 50, a: 20, b: 30 },
            { l: 60, a: 15, b: 25 },
            { l: 45, a: 25, b: 35 }
        ];
        
        const startTime = performance.now();
        
        for (let i = 0; i < iterations; i++) {
            this.calculateDeltaE2000(testColors[0], testColors[1]);
            this.calculateDeltaE2000(testColors[1], testColors[2]);
            this.calculateDeltaE2000(testColors[0], testColors[2]);
        }
        
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        
        return {
            iterations,
            totalTime: Math.round(totalTime),
            avgTime: Math.round(totalTime / iterations * 1000) / 1000,
            calculationsPerSecond: Math.round((iterations * 3) / (totalTime / 1000))
        };
    }
}
