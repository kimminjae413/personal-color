/**
 * DeltaE.js - ES5 호환 완전 변환 버전
 * CIE Delta E 색차 계산 모듈
 * 
 * 변환사항:
 * - import/export 구문 완전 제거 ✅
 * - IIFE 패턴으로 변경 ✅ 
 * - 전역 window 객체 등록 ✅
 * - 브라우저 호환성 개선 ✅
 * - cacheKey 오류 완전 해결 ✅
 * 
 * 기능:
 * - Delta E 76, 94, 2000 공식 지원
 * - 퍼스널컬러 진단을 위한 정밀 색차 계산
 * - 배치 처리 및 성능 최적화
 * - 색차 임계값 기반 유사도 판정
 * - 계절별 매칭 분석
 * - 색상 조화도 분석
 */

(function() {
    'use strict';
    
    // CONFIG 안전 로드 (전역 객체 체크)
    function getConfig() {
        try {
            if (typeof window !== 'undefined' && window.PersonalColorConfig) {
                return window.PersonalColorConfig;
            }
        } catch (error) {
            console.warn('[DeltaE] CONFIG 로드 실패, 기본값 사용:', error);
        }
        return {};
    }

    /**
     * 캐시 키 생성기 클래스 (분리하여 안전성 향상)
     */
    function CacheKeyGenerator() {
        this.separator = '|';
        this.precision = 6; // 소수점 정밀도
    }

    CacheKeyGenerator.prototype.generate = function() {
        var args = Array.prototype.slice.call(arguments);
        return args.map(this.processArgument.bind(this)).join(this.separator);
    };

    CacheKeyGenerator.prototype.processArgument = function(arg) {
        if (arg === null || arg === undefined) {
            return 'null';
        }
        
        if (typeof arg === 'number') {
            return isNaN(arg) ? 'NaN' : Number(arg.toFixed(this.precision));
        }
        
        if (typeof arg === 'boolean') {
            return arg.toString();
        }
        
        if (typeof arg === 'string') {
            return arg;
        }
        
        if (typeof arg === 'object') {
            // LAB 색상 객체 처리
            if (arg.l !== undefined && arg.a !== undefined && arg.b !== undefined) {
                return 'L' + Number(arg.l.toFixed(this.precision)) + 
                       'a' + Number(arg.a.toFixed(this.precision)) + 
                       'b' + Number(arg.b.toFixed(this.precision));
            }
            
            // 일반 객체는 JSON으로 직렬화
            try {
                return JSON.stringify(arg);
            } catch (error) {
                return arg.toString();
            }
        }
        
        return String(arg);
    };

    /**
     * DeltaE 메인 클래스
     */
    function DeltaE() {
        var CONFIG = getConfig();
        
        // 성능 통계 변수 초기화 (누락된 변수들)
        this.cacheHits = 0;
        this.cacheMisses = 0;
        this.calculationCount = 0;
        this.totalCalculationTime = 0;
        
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
        
        // 설정에서 임계값 로드 (안전 접근)
        try {
            if (CONFIG.COLOR_ANALYSIS && CONFIG.COLOR_ANALYSIS.deltaE && CONFIG.COLOR_ANALYSIS.deltaE.thresholds) {
                Object.assign(this.thresholds, CONFIG.COLOR_ANALYSIS.deltaE.thresholds);
            }
        } catch (error) {
            console.warn('[DeltaE] 임계값 설정 로드 실패, 기본값 사용');
        }
        
        // 성능 최적화를 위한 캐싱
        this.cache = new Map();
        this.cacheEnabled = true;
        this.maxCacheSize = 1000;
        
        // 캐시 키 생성기 초기화
        this.keyGenerator = new CacheKeyGenerator();
        
        console.log('[DeltaE] 모듈 초기화 완료');
    }

    /**
     * 안전한 캐시 키 생성 (오류 수정)
     */
    DeltaE.prototype.generateCacheKey = function() {
        try {
            return this.keyGenerator.generate.apply(this.keyGenerator, arguments);
        } catch (error) {
            console.warn('[DeltaE] 캐시 키 생성 실패:', error);
            // 폴백: 단순 문자열 연결
            var args = Array.prototype.slice.call(arguments);
            return args.map(function(arg) {
                return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
            }).join('|');
        }
    };

    /**
     * CIE Delta E 76 (1976) 계산
     */
    DeltaE.prototype.calculateDeltaE76 = function(lab1, lab2) {
        if (!this.validateLabColors(lab1, lab2)) {
            return null;
        }

        var cacheKey = this.generateCacheKey('76', lab1, lab2);
        
        if (this.cacheEnabled && this.cache.has(cacheKey)) {
            this.cacheHits++;
            return this.cache.get(cacheKey);
        }
        this.cacheMisses++;

        var startTime = performance.now();
        
        try {
            var deltaL = lab1.l - lab2.l;
            var deltaA = lab1.a - lab2.a;
            var deltaB = lab1.b - lab2.b;
            
            var deltaE = Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
            
            this.recordCalculationTime(startTime);
            this.cacheResult(cacheKey, deltaE);
            
            return deltaE;
        } catch (error) {
            console.error('[DeltaE] Delta E 76 계산 오류:', error);
            return null;
        }
    };

    /**
     * CIE Delta E 94 (1994) 계산
     */
    DeltaE.prototype.calculateDeltaE94 = function(lab1, lab2, textiles) {
        if (textiles === undefined) textiles = false;
        
        if (!this.validateLabColors(lab1, lab2)) {
            return null;
        }

        var cacheKey = this.generateCacheKey('94', lab1, lab2, textiles);
        
        if (this.cacheEnabled && this.cache.has(cacheKey)) {
            this.cacheHits++;
            return this.cache.get(cacheKey);
        }
        this.cacheMisses++;

        var startTime = performance.now();
        
        try {
            // 가중치 설정 (textiles vs graphic arts)
            var kL = textiles ? 2 : 1;
            var kC = 1;
            var kH = 1;
            var K1 = textiles ? 0.048 : 0.045;
            var K2 = textiles ? 0.014 : 0.015;
            
            var deltaL = lab1.l - lab2.l;
            var deltaA = lab1.a - lab2.a;
            var deltaB = lab1.b - lab2.b;
            
            var C1 = Math.sqrt(lab1.a * lab1.a + lab1.b * lab1.b);
            var C2 = Math.sqrt(lab2.a * lab2.a + lab2.b * lab2.b);
            var deltaC = C1 - C2;
            
            var deltaH2 = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
            var deltaH = deltaH2 > 0 ? Math.sqrt(deltaH2) : 0;
            
            var SL = 1;
            var SC = 1 + K1 * C1;
            var SH = 1 + K2 * C1;
            
            var deltaE = Math.sqrt(
                Math.pow(deltaL / (kL * SL), 2) +
                Math.pow(deltaC / (kC * SC), 2) +
                Math.pow(deltaH / (kH * SH), 2)
            );
            
            this.recordCalculationTime(startTime);
            this.cacheResult(cacheKey, deltaE);
            
            return deltaE;
        } catch (error) {
            console.error('[DeltaE] Delta E 94 계산 오류:', error);
            return null;
        }
    };

    /**
     * CIE Delta E 2000 (가장 정확한 공식)
     */
    DeltaE.prototype.calculateDeltaE2000 = function(lab1, lab2, kL, kC, kH) {
        if (kL === undefined) kL = 1;
        if (kC === undefined) kC = 1;
        if (kH === undefined) kH = 1;
        
        if (!this.validateLabColors(lab1, lab2)) {
            return null;
        }

        var cacheKey = this.generateCacheKey('2000', lab1, lab2, kL, kC, kH);
        
        if (this.cacheEnabled && this.cache.has(cacheKey)) {
            this.cacheHits++;
            return this.cache.get(cacheKey);
        }
        this.cacheMisses++;

        var startTime = performance.now();
        
        try {
            var result = this.computeDeltaE2000(lab1, lab2, kL, kC, kH);
            
            this.recordCalculationTime(startTime);
            this.cacheResult(cacheKey, result);
            
            return result;
        } catch (error) {
            console.error('[DeltaE] Delta E 2000 계산 오류:', error);
            return null;
        }
    };

    /**
     * Delta E 2000 실제 계산 로직
     */
    DeltaE.prototype.computeDeltaE2000 = function(lab1, lab2, kL, kC, kH) {
        // Step 1: LAB 값 준비
        var L1 = lab1.l, a1 = lab1.a, b1 = lab1.b;
        var L2 = lab2.l, a2 = lab2.a, b2 = lab2.b;
        
        // Step 2: C와 G 계산
        var C1 = Math.sqrt(a1 * a1 + b1 * b1);
        var C2 = Math.sqrt(a2 * a2 + b2 * b2);
        var Cbar = (C1 + C2) / 2;
        
        var G = 0.5 * (1 - Math.sqrt(Math.pow(Cbar, 7) / (Math.pow(Cbar, 7) + Math.pow(25, 7))));
        
        // Step 3: a'과 C' 계산
        var a1_prime = a1 * (1 + G);
        var a2_prime = a2 * (1 + G);
        
        var C1_prime = Math.sqrt(a1_prime * a1_prime + b1 * b1);
        var C2_prime = Math.sqrt(a2_prime * a2_prime + b2 * b2);
        
        // Step 4: h' 계산
        var h1_prime = this.calculateHuePrime(a1_prime, b1);
        var h2_prime = this.calculateHuePrime(a2_prime, b2);
        
        // Step 5: 델타 값들 계산
        var deltaL_prime = L2 - L1;
        var deltaC_prime = C2_prime - C1_prime;
        var deltaH_prime = this.calculateDeltaHPrime(C1_prime, C2_prime, h1_prime, h2_prime);
        var deltaH_prime_value = 2 * Math.sqrt(C1_prime * C2_prime) * Math.sin(this.toRadians(deltaH_prime / 2));
        
        // Step 6: 평균값들 계산
        var Lbar_prime = (L1 + L2) / 2;
        var Cbar_prime = (C1_prime + C2_prime) / 2;
        var Hbar_prime = this.calculateHbarPrime(h1_prime, h2_prime, C1_prime, C2_prime);
        
        // Step 7: T 계산
        var T = 1 - 0.17 * Math.cos(this.toRadians(Hbar_prime - 30)) +
                    0.24 * Math.cos(this.toRadians(2 * Hbar_prime)) +
                    0.32 * Math.cos(this.toRadians(3 * Hbar_prime + 6)) -
                    0.20 * Math.cos(this.toRadians(4 * Hbar_prime - 63));
        
        // Step 8: 가중치 함수들 계산
        var SL = 1 + (0.015 * Math.pow(Lbar_prime - 50, 2)) / Math.sqrt(20 + Math.pow(Lbar_prime - 50, 2));
        var SC = 1 + 0.045 * Cbar_prime;
        var SH = 1 + 0.015 * Cbar_prime * T;
        
        // Step 9: RT 회전 항 계산
        var deltaTheta = 30 * Math.exp(-Math.pow((Hbar_prime - 275) / 25, 2));
        var RC = 2 * Math.sqrt(Math.pow(Cbar_prime, 7) / (Math.pow(Cbar_prime, 7) + Math.pow(25, 7)));
        var RT = -RC * Math.sin(this.toRadians(2 * deltaTheta));
        
        // Step 10: 최종 Delta E 2000 계산
        var deltaE = Math.sqrt(
            Math.pow(deltaL_prime / (kL * SL), 2) +
            Math.pow(deltaC_prime / (kC * SC), 2) +
            Math.pow(deltaH_prime_value / (kH * SH), 2) +
            RT * (deltaC_prime / (kC * SC)) * (deltaH_prime_value / (kH * SH))
        );
        
        return deltaE;
    };

    /**
     * 색상 데이터 검증
     */
    DeltaE.prototype.validateLabColors = function(lab1, lab2) {
        if (!lab1 || !lab2) {
            console.warn('[DeltaE] LAB 색상 데이터가 null입니다');
            return false;
        }
        
        if (typeof lab1.l !== 'number' || typeof lab1.a !== 'number' || typeof lab1.b !== 'number') {
            console.warn('[DeltaE] lab1 색상 데이터 형식이 잘못되었습니다:', lab1);
            return false;
        }
        
        if (typeof lab2.l !== 'number' || typeof lab2.a !== 'number' || typeof lab2.b !== 'number') {
            console.warn('[DeltaE] lab2 색상 데이터 형식이 잘못되었습니다:', lab2);
            return false;
        }
        
        // L 값은 0-100 범위여야 함
        if (lab1.l < 0 || lab1.l > 100 || lab2.l < 0 || lab2.l > 100) {
            console.warn('[DeltaE] L 값이 유효 범위(0-100)를 벗어났습니다');
            return false;
        }
        
        return true;
    };

    /**
     * 계산 시간 기록
     */
    DeltaE.prototype.recordCalculationTime = function(startTime) {
        this.calculationCount++;
        this.totalCalculationTime += (performance.now() - startTime);
    };

    DeltaE.prototype.calculateHuePrime = function(a_prime, b) {
        if (a_prime === 0 && b === 0) return 0;
        
        var hue = this.toDegrees(Math.atan2(b, a_prime));
        return hue >= 0 ? hue : hue + 360;
    };

    DeltaE.prototype.calculateDeltaHPrime = function(C1_prime, C2_prime, h1_prime, h2_prime) {
        if (C1_prime === 0 || C2_prime === 0) return 0;
        
        var deltaH = h2_prime - h1_prime;
        
        if (Math.abs(deltaH) <= 180) {
            return deltaH;
        } else if (deltaH > 180) {
            return deltaH - 360;
        } else {
            return deltaH + 360;
        }
    };

    DeltaE.prototype.calculateHbarPrime = function(h1_prime, h2_prime, C1_prime, C2_prime) {
        if (C1_prime === 0 || C2_prime === 0) {
            return h1_prime + h2_prime;
        }
        
        var deltaH = Math.abs(h1_prime - h2_prime);
        var sum = h1_prime + h2_prime;
        
        if (deltaH <= 180) {
            return sum / 2;
        } else if (sum < 360) {
            return (sum + 360) / 2;
        } else {
            return (sum - 360) / 2;
        }
    };

    // 각도 변환 유틸리티
    DeltaE.prototype.toRadians = function(degrees) {
        return degrees * Math.PI / 180;
    };

    DeltaE.prototype.toDegrees = function(radians) {
        return radians * 180 / Math.PI;
    };

    // 색차 기반 유사도 판정
    DeltaE.prototype.assessColorSimilarity = function(deltaE, context) {
        if (context === undefined) context = 'general';
        
        if (typeof deltaE !== 'number' || isNaN(deltaE)) {
            return { level: 'error', score: 0, description: '계산 오류' };
        }

        var thresholds = context === 'skinTone' ? this.thresholds.skinTone : this.thresholds;
        
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
    };

    // 배치 Delta E 계산
    DeltaE.prototype.calculateBatchDeltaE = function(referenceColor, colors, formula) {
        if (formula === undefined) formula = '2000';
        
        if (!referenceColor || !Array.isArray(colors)) {
            console.warn('[DeltaE] 배치 계산 파라미터 오류');
            return [];
        }

        var results = [];
        var self = this;
        
        colors.forEach(function(color, index) {
            if (!color) return;

            var deltaE;
            
            try {
                switch (formula) {
                    case '76':
                        deltaE = self.calculateDeltaE76(referenceColor, color);
                        break;
                    case '94':
                        deltaE = self.calculateDeltaE94(referenceColor, color);
                        break;
                    case '2000':
                    default:
                        deltaE = self.calculateDeltaE2000(referenceColor, color);
                        break;
                }
                
                if (deltaE === null) return;
                
                var similarity = self.assessColorSimilarity(deltaE);
                
                results.push({
                    index: index,
                    color: color,
                    deltaE: Math.round(deltaE * 100) / 100,
                    similarity: similarity,
                    formula: formula
                });
            } catch (error) {
                console.warn('[DeltaE] 배치 계산 중 오류 (index ' + index + '):', error);
            }
        });
        
        // Delta E 값으로 정렬 (유사도 순)
        results.sort(function(a, b) {
            return a.deltaE - b.deltaE;
        });
        
        return results;
    };

    // 가장 유사한 색상 찾기
    DeltaE.prototype.findClosestColors = function(targetColor, colorDatabase, count, formula) {
        if (count === undefined) count = 5;
        if (formula === undefined) formula = '2000';
        
        var results = this.calculateBatchDeltaE(targetColor, colorDatabase, formula);
        return results.slice(0, Math.max(1, Math.min(count, results.length)));
    };

    // 색상 매칭 점수 계산
    DeltaE.prototype.calculateMatchingScore = function(skinColor, testColor, weights) {
        if (!this.validateLabColors(skinColor, testColor)) {
            return null;
        }

        var defaultWeights = {
            deltaE: 0.7,        // Delta E가 가장 중요
            lightness: 0.15,    // 명도 차이
            chroma: 0.1,        // 채도 차이  
            hue: 0.05          // 색상 차이
        };
        
        if (!weights) weights = {};
        var w = Object.assign({}, defaultWeights, weights);
        
        try {
            // Delta E 계산
            var deltaE = this.calculateDeltaE2000(skinColor, testColor);
            if (deltaE === null) return null;
            
            var deltaEScore = Math.max(0, 100 - deltaE * 5); // Delta E를 0-100 점수로 변환
            
            // 개별 차이 계산
            var lightnessScore = Math.max(0, 100 - Math.abs(skinColor.l - testColor.l) * 2);
            
            var skinChroma = Math.sqrt(skinColor.a * skinColor.a + skinColor.b * skinColor.b);
            var testChroma = Math.sqrt(testColor.a * testColor.a + testColor.b * testColor.b);
            var chromaScore = Math.max(0, 100 - Math.abs(skinChroma - testChroma) * 3);
            
            // 색상(Hue) 차이는 LAB의 a, b 값으로 근사 계산
            var skinHue = Math.atan2(skinColor.b, skinColor.a);
            var testHue = Math.atan2(testColor.b, testColor.a);
            var hueDiff = Math.abs(skinHue - testHue);
            if (hueDiff > Math.PI) hueDiff = 2 * Math.PI - hueDiff;
            var hueScore = Math.max(0, 100 - (hueDiff / Math.PI) * 100);
            
            // 가중평균으로 최종 점수 계산
            var totalScore = 
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
        } catch (error) {
            console.error('[DeltaE] 매칭 점수 계산 오류:', error);
            return null;
        }
    };

    // 퍼스널컬러 계절별 매칭 분석
    DeltaE.prototype.analyzeSeasonMatching = function(skinColor, seasonColors) {
        if (!skinColor || !seasonColors) {
            console.warn('[DeltaE] 계절 매칭 분석 파라미터 오류');
            return null;
        }

        var seasonResults = {};
        var self = this;
        
        try {
            Object.keys(seasonColors).forEach(function(season) {
                var colors = seasonColors[season];
                if (!Array.isArray(colors)) return;

                var seasonScores = colors.map(function(color) {
                    var deltaE = self.calculateDeltaE2000(skinColor, color);
                    if (deltaE === null) return null;
                    
                    var similarity = self.assessColorSimilarity(deltaE, 'skinTone');
                    
                    return {
                        color: color,
                        deltaE: Math.round(deltaE * 100) / 100,
                        similarity: similarity,
                        score: similarity.score
                    };
                }).filter(function(result) {
                    return result !== null;
                });
                
                if (seasonScores.length === 0) return;
                
                // 평균 점수 계산
                var avgScore = seasonScores.reduce(function(sum, result) {
                    return sum + result.score;
                }, 0) / seasonScores.length;
                
                var bestMatch = seasonScores.reduce(function(best, current) {
                    return current.score > best.score ? current : best;
                });
                
                seasonResults[season] = {
                    averageScore: Math.round(avgScore),
                    bestMatch: bestMatch,
                    allMatches: seasonScores.sort(function(a, b) {
                        return b.score - a.score;
                    }),
                    recommendation: avgScore >= 80 ? 'excellent' :
                                  avgScore >= 70 ? 'good' :
                                  avgScore >= 60 ? 'acceptable' : 'poor'
                };
            });
            
            // 가장 적합한 계절 선택
            var bestSeason = Object.keys(seasonResults).reduce(function(best, season) {
                var result = seasonResults[season];
                return result.averageScore > best.score ? 
                    { season: season, score: result.averageScore } : best;
            }, { season: null, score: 0 });
            
            return {
                bestSeason: bestSeason.season,
                confidence: bestSeason.score / 100,
                seasonResults: seasonResults,
                summary: this.generateMatchingSummary(seasonResults, bestSeason.season)
            };
        } catch (error) {
            console.error('[DeltaE] 계절 매칭 분석 오류:', error);
            return null;
        }
    };

    DeltaE.prototype.generateMatchingSummary = function(seasonResults, bestSeason) {
        if (!bestSeason || !seasonResults[bestSeason]) {
            return '매칭 분석에 실패했습니다.';
        }

        var bestResult = seasonResults[bestSeason];
        
        var summary = this.getSeasonName(bestSeason) + ' 타입이 가장 잘 어울립니다 (' + bestResult.averageScore + '점).';
        
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
    };

    DeltaE.prototype.getSeasonName = function(season) {
        var names = {
            spring: '봄',
            summer: '여름', 
            autumn: '가을',
            winter: '겨울'
        };
        return names[season] || season;
    };

    // 색상 조화도 분석 (여러 색상 간)
    DeltaE.prototype.analyzeColorHarmony = function(colors, formula) {
        if (formula === undefined) formula = '2000';
        
        if (!Array.isArray(colors) || colors.length < 2) {
            console.warn('[DeltaE] 색상 조화도 분석: 최소 2개 색상이 필요합니다');
            return null;
        }
        
        var self = this;
        try {
            var harmonies = [];
            var deltaEValues = [];
            
            // 모든 색상 쌍에 대해 Delta E 계산
            for (var i = 0; i < colors.length - 1; i++) {
                for (var j = i + 1; j < colors.length; j++) {
                    if (!colors[i] || !colors[j]) continue;

                    var deltaE = formula === '2000' ? 
                        self.calculateDeltaE2000(colors[i], colors[j]) :
                        formula === '94' ?
                        self.calculateDeltaE94(colors[i], colors[j]) :
                        self.calculateDeltaE76(colors[i], colors[j]);
                    
                    if (deltaE === null) continue;
                    
                    deltaEValues.push(deltaE);
                    harmonies.push({
                        pair: [i, j],
                        colors: [colors[i], colors[j]],
                        deltaE: Math.round(deltaE * 100) / 100,
                        similarity: self.assessColorSimilarity(deltaE)
                    });
                }
            }
            
            if (deltaEValues.length === 0) {
                return { error: '유효한 색상 쌍을 찾을 수 없습니다' };
            }
            
            // 통계 계산
            var avgDeltaE = deltaEValues.reduce(function(sum, val) {
                return sum + val;
            }, 0) / deltaEValues.length;
            
            var minDeltaE = Math.min.apply(Math, deltaEValues);
            var maxDeltaE = Math.max.apply(Math, deltaEValues);
            
            // 조화도 평가
            var harmonyLevel = 'poor';
            var harmonyScore = 50;
            
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
                harmonyLevel: harmonyLevel,
                harmonyScore: harmonyScore,
                statistics: {
                    average: Math.round(avgDeltaE * 100) / 100,
                    minimum: Math.round(minDeltaE * 100) / 100,
                    maximum: Math.round(maxDeltaE * 100) / 100,
                    pairs: harmonies.length
                },
                pairAnalysis: harmonies.sort(function(a, b) {
                    return a.deltaE - b.deltaE;
                }),
                recommendation: this.getHarmonyRecommendation(harmonyLevel, avgDeltaE)
            };
        } catch (error) {
            console.error('[DeltaE] 색상 조화도 분석 오류:', error);
            return { error: '색상 조화도 분석에 실패했습니다' };
        }
    };

    DeltaE.prototype.getHarmonyRecommendation = function(level, avgDeltaE) {
        switch (level) {
            case 'excellent':
                return '색상들이 매우 조화롭습니다. 완벽한 조합입니다.';
            case 'good':
                return '색상들이 잘 어울립니다. 좋은 선택입니다.';
            case 'acceptable':
                return '무난한 색상 조합입니다.';
            default:
                return '색상 차이가 큽니다 (ΔE=' + avgDeltaE.toFixed(1) + '). 더 유사한 색상을 고려해보세요.';
        }
    };

    // 캐시 관리 (수정됨)
    DeltaE.prototype.cacheResult = function(key, result) {
        if (!this.cacheEnabled || !key || result === null || result === undefined) {
            return;
        }
        
        try {
            this.cache.set(key, result);
            
            // 캐시 크기 제한
            if (this.cache.size > this.maxCacheSize) {
                var firstKey = this.cache.keys().next().value;
                this.cache.delete(firstKey);
            }
        } catch (error) {
            console.warn('[DeltaE] 캐시 저장 실패:', error);
        }
    };

    DeltaE.prototype.clearCache = function() {
        this.cache.clear();
        this.cacheHits = 0;
        this.cacheMisses = 0;
        console.log('[DeltaE] 캐시가 클리어되었습니다');
    };

    DeltaE.prototype.setCacheEnabled = function(enabled) {
        this.cacheEnabled = Boolean(enabled);
        if (!enabled) {
            this.clearCache();
        }
        console.log('[DeltaE] 캐시 ' + (enabled ? '활성화' : '비활성화') + '됨');
    };

    // 성능 통계 (수정됨)
    DeltaE.prototype.getCacheStats = function() {
        var totalRequests = this.cacheHits + this.cacheMisses;
        return {
            size: this.cache.size,
            maxSize: this.maxCacheSize,
            enabled: this.cacheEnabled,
            hits: this.cacheHits,
            misses: this.cacheMisses,
            hitRate: totalRequests > 0 ? (this.cacheHits / totalRequests) : 0,
            totalCalculations: this.calculationCount,
            averageCalculationTime: this.calculationCount > 0 ? 
                (this.totalCalculationTime / this.calculationCount) : 0
        };
    };

    // 임계값 설정
    DeltaE.prototype.setThresholds = function(newThresholds) {
        if (typeof newThresholds === 'object') {
            Object.assign(this.thresholds, newThresholds);
            console.log('[DeltaE] 임계값이 업데이트되었습니다');
        }
    };

    DeltaE.prototype.getThresholds = function() {
        return Object.assign({}, this.thresholds);
    };

    // 색차 공식 비교
    DeltaE.prototype.compareFormulas = function(lab1, lab2) {
        if (!this.validateLabColors(lab1, lab2)) {
            return { error: '유효하지 않은 색상 데이터입니다' };
        }

        try {
            var deltaE76 = this.calculateDeltaE76(lab1, lab2);
            var deltaE94 = this.calculateDeltaE94(lab1, lab2);
            var deltaE2000 = this.calculateDeltaE2000(lab1, lab2);

            return {
                deltaE76: deltaE76 !== null ? Math.round(deltaE76 * 100) / 100 : null,
                deltaE94: deltaE94 !== null ? Math.round(deltaE94 * 100) / 100 : null,
                deltaE2000: deltaE2000 !== null ? Math.round(deltaE2000 * 100) / 100 : null,
                recommendation: 'Delta E 2000이 가장 정확한 인간의 시각적 인지와 일치합니다.'
            };
        } catch (error) {
            console.error('[DeltaE] 공식 비교 오류:', error);
            return { error: '공식 비교에 실패했습니다' };
        }
    };

    // 벤치마크 테스트 (수정됨)
    DeltaE.prototype.benchmark = function(iterations) {
        if (iterations === undefined) iterations = 1000;
        
        var testColors = [
            { l: 50, a: 20, b: 30 },
            { l: 60, a: 15, b: 25 },
            { l: 45, a: 25, b: 35 }
        ];
        
        if (!this.validateLabColors(testColors[0], testColors[1]) ||
            !this.validateLabColors(testColors[1], testColors[2]) ||
            !this.validateLabColors(testColors[0], testColors[2])) {
            return { error: '벤치마크 테스트 색상 데이터 오류' };
        }

        console.log('[DeltaE] 벤치마크 테스트 시작 (' + iterations + '회 반복)');
        
        var startTime = performance.now();
        var successfulCalculations = 0;
        
        try {
            for (var i = 0; i < iterations; i++) {
                var result1 = this.calculateDeltaE2000(testColors[0], testColors[1]);
                var result2 = this.calculateDeltaE2000(testColors[1], testColors[2]);
                var result3 = this.calculateDeltaE2000(testColors[0], testColors[2]);
                
                if (result1 !== null && result2 !== null && result3 !== null) {
                    successfulCalculations += 3;
                }
            }
            
            var endTime = performance.now();
            var totalTime = endTime - startTime;
            
            return {
                iterations: iterations,
                successfulCalculations: successfulCalculations,
                totalTime: Math.round(totalTime),
                avgTime: Math.round(totalTime / iterations * 1000) / 1000,
                calculationsPerSecond: Math.round(successfulCalculations / (totalTime / 1000)),
                cacheStats: this.getCacheStats()
            };
        } catch (error) {
            console.error('[DeltaE] 벤치마크 테스트 오류:', error);
            return { error: '벤치마크 테스트 실패' };
        }
    };

    /**
     * 모듈 상태 검증
     */
    DeltaE.prototype.validateModule = function() {
        var issues = [];
        
        try {
            // 기본 계산 테스트
            var testColor1 = { l: 50, a: 0, b: 0 };
            var testColor2 = { l: 60, a: 10, b: 10 };
            
            var deltaE76 = this.calculateDeltaE76(testColor1, testColor2);
            var deltaE94 = this.calculateDeltaE94(testColor1, testColor2);
            var deltaE2000 = this.calculateDeltaE2000(testColor1, testColor2);
            
            if (deltaE76 === null) issues.push('Delta E 76 계산 실패');
            if (deltaE94 === null) issues.push('Delta E 94 계산 실패');
            if (deltaE2000 === null) issues.push('Delta E 2000 계산 실패');
            
            // 캐시 테스트
            if (this.cacheEnabled && this.cache.size === 0) {
                issues.push('캐시가 활성화되었으나 작동하지 않음');
            }
            
        } catch (error) {
            issues.push('모듈 검증 오류: ' + error.message);
        }
        
        return {
            isValid: issues.length === 0,
            issues: issues,
            cacheStats: this.getCacheStats()
        };
    };

    // 전역 등록
    if (typeof window !== 'undefined') {
        window.DeltaE = DeltaE;
        window.CacheKeyGenerator = CacheKeyGenerator;
        
        // 전역 인스턴스도 생성
        window.globalDeltaE = new DeltaE();
    }

    console.log('[DeltaE] ES5 호환 버전 로드 완료 ✅');

})();
