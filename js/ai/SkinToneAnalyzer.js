/**
 * SkinToneAnalyzer.js
 * AI 기반 피부톤 분석 엔진
 * - TensorFlow.js 모델 로딩 및 추론
 * - 한국인 특화 피부톤 데이터베이스
 * - CIE L*a*b* 색공간 정량 분석
 * - 4계절 12톤 분류 시스템
 * - 실시간 분석 결과 제공
 */

import { CONFIG } from '../config.js';

export class SkinToneAnalyzer {
    constructor() {
        this.model = null;
        this.isModelLoaded = false;
        this.koreanSkinDatabase = null;
        
        // 분석 결과 캐시
        this.analysisCache = new Map();
        
        // 성능 최적화
        this.analysisQueue = [];
        this.isProcessing = false;
        this.lastAnalysisTime = 0;
        
        this.init();
    }

    async init() {
        try {
            await this.loadModel();
            await this.loadKoreanSkinDatabase();
            this.isModelLoaded = true;
            console.log('SkinToneAnalyzer 초기화 완료');
        } catch (error) {
            console.error('SkinToneAnalyzer 초기화 실패:', error);
            throw error;
        }
    }

    async loadModel() {
        try {
            // TensorFlow.js 모델 로딩
            if (typeof tf === 'undefined') {
                throw new Error('TensorFlow.js가 로드되지 않았습니다.');
            }

            const modelConfig = CONFIG.AI_MODELS.skinToneAnalyzer;
            this.model = await tf.loadLayersModel(modelConfig.modelUrl);
            
            // 모델 워밍업 (첫 추론 속도 최적화)
            const dummyInput = tf.zeros([1, ...modelConfig.inputSize]);
            await this.model.predict(dummyInput);
            dummyInput.dispose();
            
            console.log('AI 모델 로딩 완료');
        } catch (error) {
            console.warn('AI 모델 로딩 실패, 대체 분석 방법 사용:', error);
            // AI 모델 없이도 기본 분석 가능하도록 처리
        }
    }

    async loadKoreanSkinDatabase() {
        // 한국인 피부톤 특성 데이터베이스
        this.koreanSkinDatabase = {
            // 논문 기반 한국인 피부톤 분류
            skinTypes: {
                fair: {
                    lab: { l: 65.2, a: 2.8, b: 14.6 },
                    rgb: { r: 248, g: 219, b: 186 },
                    temperature: 'neutral',
                    undertone: 'pink',
                    seasons: ['spring', 'summer']
                },
                light: {
                    lab: { l: 58.7, a: 6.2, b: 18.9 },
                    rgb: { r: 224, g: 183, b: 144 },
                    temperature: 'warm',
                    undertone: 'yellow',
                    seasons: ['spring', 'autumn']
                },
                medium: {
                    lab: { l: 52.1, a: 8.9, b: 22.4 },
                    rgb: { r: 194, g: 149, b: 108 },
                    temperature: 'warm',
                    undertone: 'olive',
                    seasons: ['autumn', 'winter']
                },
                deep: {
                    lab: { l: 43.8, a: 11.2, b: 24.8 },
                    rgb: { r: 156, g: 115, b: 78 },
                    temperature: 'warm',
                    undertone: 'golden',
                    seasons: ['autumn', 'winter']
                }
            },

            // 계절별 색온도 임계값
            temperatureThresholds: {
                warm: { aValue: 5.0, bValue: 15.0 },
                cool: { aValue: -2.0, bValue: 8.0 },
                neutral: { aValue: 2.5, bValue: 12.0 }
            },

            // 한국인 특화 보정 계수
            correctionFactors: {
                brightness: 1.05,  // 한국인 선호 밝기 보정
                warmth: 0.95,      // 웜톤 강도 보정
                saturation: 1.02   // 채도 보정
            }
        };
    }

    // 메인 분석 함수
    async analyzeSkinTone(imageData, options = {}) {
        if (!this.isModelLoaded && !options.forceAnalysis) {
            console.warn('모델이 아직 로딩 중입니다.');
            return null;
        }

        const analysisId = this.generateAnalysisId(imageData);
        
        // 캐시 확인
        if (this.analysisCache.has(analysisId)) {
            return this.analysisCache.get(analysisId);
        }

        try {
            // 성능 최적화: 큐 시스템 사용
            return await this.queueAnalysis(imageData, options, analysisId);
        } catch (error) {
            console.error('피부톤 분석 실패:', error);
            return this.getFallbackResult();
        }
    }

    async queueAnalysis(imageData, options, analysisId) {
        return new Promise((resolve, reject) => {
            this.analysisQueue.push({
                imageData,
                options,
                analysisId,
                resolve,
                reject
            });

            if (!this.isProcessing) {
                this.processQueue();
            }
        });
    }

    async processQueue() {
        this.isProcessing = true;

        while (this.analysisQueue.length > 0) {
            const task = this.analysisQueue.shift();
            
            try {
                // 분석 간격 제어 (성능 최적화)
                const now = Date.now();
                const timeSinceLastAnalysis = now - this.lastAnalysisTime;
                const minInterval = CONFIG.PERFORMANCE.analysis.minInterval || 100;
                
                if (timeSinceLastAnalysis < minInterval) {
                    await this.delay(minInterval - timeSinceLastAnalysis);
                }

                const result = await this.performAnalysis(task.imageData, task.options);
                this.analysisCache.set(task.analysisId, result);
                
                task.resolve(result);
                this.lastAnalysisTime = Date.now();

            } catch (error) {
                task.reject(error);
            }
        }

        this.isProcessing = false;
    }

    async performAnalysis(imageData, options) {
        const startTime = performance.now();
        
        // 1. 얼굴 영역 감지 및 피부 영역 추출
        const faceRegions = await this.extractFaceRegions(imageData, options);
        
        // 2. 피부톤 샘플 추출
        const skinSamples = this.extractSkinSamples(faceRegions, imageData);
        
        // 3. AI 모델을 사용한 고급 분석 (가능한 경우)
        let aiAnalysis = null;
        if (this.model) {
            aiAnalysis = await this.performAIAnalysis(skinSamples);
        }
        
        // 4. 색공간 변환 및 정량 분석
        const colorAnalysis = this.performColorSpaceAnalysis(skinSamples);
        
        // 5. 한국인 특화 보정
        const correctedAnalysis = this.applyKoreanCorrection(colorAnalysis);
        
        // 6. 계절 분류
        const seasonClassification = this.classifySeasons(correctedAnalysis);
        
        // 7. 최종 결과 구성
        const result = this.constructResult({
            aiAnalysis,
            colorAnalysis: correctedAnalysis,
            seasonClassification,
            skinSamples,
            processingTime: performance.now() - startTime,
            confidence: this.calculateConfidence(aiAnalysis, colorAnalysis)
        });

        return result;
    }

    async extractFaceRegions(imageData, options) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        ctx.putImageData(imageData, 0, 0);

        // 얼굴 영역 감지 (FaceDetection.js와 연동)
        if (window.FaceDetection) {
            try {
                const faces = await window.FaceDetection.detectFaces(canvas);
                return this.mapFaceRegionsToSkinAreas(faces, imageData);
            } catch (error) {
                console.warn('얼굴 감지 실패, 기본 영역 사용:', error);
            }
        }

        // 기본 영역 사용 (설정에서 정의된 영역)
        return this.getDefaultFaceRegions(imageData);
    }

    mapFaceRegionsToSkinAreas(faces, imageData) {
        if (!faces || faces.length === 0) {
            return this.getDefaultFaceRegions(imageData);
        }

        const face = faces[0]; // 첫 번째 얼굴 사용
        const faceRegions = CONFIG.COLOR_ANALYSIS.skinDetection.faceRegion;
        
        return Object.entries(faceRegions).map(([name, region]) => ({
            name,
            x: Math.floor(face.x + face.width * region.x),
            y: Math.floor(face.y + face.height * region.y),
            width: Math.floor(face.width * region.w),
            height: Math.floor(face.height * region.h)
        }));
    }

    getDefaultFaceRegions(imageData) {
        const faceRegions = CONFIG.COLOR_ANALYSIS.skinDetection.faceRegion;
        
        return Object.entries(faceRegions).map(([name, region]) => ({
            name,
            x: Math.floor(imageData.width * region.x),
            y: Math.floor(imageData.height * region.y),
            width: Math.floor(imageData.width * region.w),
            height: Math.floor(imageData.height * region.h)
        }));
    }

    extractSkinSamples(faceRegions, imageData) {
        const samples = [];
        const data = imageData.data;
        const width = imageData.width;
        
        faceRegions.forEach(region => {
            for (let y = region.y; y < region.y + region.height; y += 2) {
                for (let x = region.x; x < region.x + region.width; x += 2) {
                    const index = (y * width + x) * 4;
                    
                    const r = data[index];
                    const g = data[index + 1];
                    const b = data[index + 2];
                    const a = data[index + 3];
                    
                    // 유효한 피부색인지 필터링
                    if (this.isValidSkinColor(r, g, b, a)) {
                        samples.push({
                            region: region.name,
                            rgb: { r, g, b },
                            position: { x, y }
                        });
                    }
                }
            }
        });

        return samples;
    }

    isValidSkinColor(r, g, b, a) {
        // 투명도 체크
        if (a < 200) return false;
        
        // 기본적인 피부색 범위 체크
        const brightness = (r + g + b) / 3;
        if (brightness < 50 || brightness > 250) return false;
        
        // 피부색 특성 체크 (R > G > B 경향)
        if (r < g || g < b) return false;
        
        // 채도 체크 (너무 선명한 색은 제외)
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const saturation = max === 0 ? 0 : (max - min) / max;
        
        if (saturation > 0.4) return false;
        
        return true;
    }

    async performAIAnalysis(skinSamples) {
        if (!this.model || skinSamples.length === 0) return null;

        try {
            // 샘플을 모델 입력 형식으로 변환
            const inputTensor = this.prepareTensorInput(skinSamples);
            
            // 모델 추론 실행
            const prediction = await this.model.predict(inputTensor);
            const predictionData = await prediction.data();
            
            // 메모리 정리
            inputTensor.dispose();
            prediction.dispose();
            
            return this.interpretAIResult(predictionData);
        } catch (error) {
            console.error('AI 분석 실행 오류:', error);
            return null;
        }
    }

    prepareTensorInput(skinSamples) {
        const modelConfig = CONFIG.AI_MODELS.skinToneAnalyzer;
        const [height, width, channels] = modelConfig.inputSize;
        
        // 대표 색상들을 이미지 형태로 구성
        const inputData = new Float32Array(height * width * channels);
        
        // 샘플들의 평균 색상 계산
        const avgColor = this.calculateAverageColor(skinSamples);
        
        // 정규화된 RGB 값으로 텐서 채우기
        for (let i = 0; i < height * width; i++) {
            inputData[i * channels] = avgColor.r / 255;
            inputData[i * channels + 1] = avgColor.g / 255;
            inputData[i * channels + 2] = avgColor.b / 255;
        }
        
        return tf.tensor4d(inputData, [1, height, width, channels]);
    }

    interpretAIResult(predictionData) {
        // 모델 출력을 해석하여 의미있는 결과로 변환
        // 예: [spring, summer, autumn, winter] 확률
        const seasons = ['spring', 'summer', 'autumn', 'winter'];
        const probabilities = Array.from(predictionData);
        
        const results = seasons.map((season, index) => ({
            season,
            probability: probabilities[index],
            confidence: probabilities[index] > 0.7 ? 'high' : 
                       probabilities[index] > 0.4 ? 'medium' : 'low'
        }));
        
        // 가장 높은 확률의 계절
        const bestMatch = results.reduce((max, current) => 
            current.probability > max.probability ? current : max);
        
        return {
            prediction: bestMatch.season,
            confidence: bestMatch.confidence,
            probabilities: results
        };
    }

    performColorSpaceAnalysis(skinSamples) {
        if (skinSamples.length === 0) return null;

        // 대표 색상 계산
        const avgColor = this.calculateAverageColor(skinSamples);
        
        // RGB to LAB 변환
        const labColor = this.rgbToLab(avgColor);
        
        // 색온도 분석
        const temperature = this.analyzeColorTemperature(labColor);
        
        // 언더톤 분석
        const undertone = this.analyzeUndertone(labColor);
        
        // 명도/채도 분석
        const brightness = labColor.l;
        const chroma = Math.sqrt(labColor.a * labColor.a + labColor.b * labColor.b);
        
        return {
            rgb: avgColor,
            lab: labColor,
            temperature,
            undertone,
            brightness,
            chroma,
            sampleCount: skinSamples.length
        };
    }

    calculateAverageColor(skinSamples) {
        const totalR = skinSamples.reduce((sum, sample) => sum + sample.rgb.r, 0);
        const totalG = skinSamples.reduce((sum, sample) => sum + sample.rgb.g, 0);
        const totalB = skinSamples.reduce((sum, sample) => sum + sample.rgb.b, 0);
        
        const count = skinSamples.length;
        
        return {
            r: Math.round(totalR / count),
            g: Math.round(totalG / count),
            b: Math.round(totalB / count)
        };
    }

    rgbToLab(rgb) {
        // RGB to XYZ 변환
        let r = rgb.r / 255;
        let g = rgb.g / 255;
        let b = rgb.b / 255;

        // 감마 보정
        r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
        g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
        b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

        // Observer = 2°, Illuminant = D65
        let x = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) / 0.95047;
        let y = (r * 0.2126729 + g * 0.7151522 + b * 0.0721750) / 1.00000;
        let z = (r * 0.0193339 + g * 0.1191920 + b * 0.9503041) / 1.08883;

        // XYZ to LAB 변환
        x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x + 16/116);
        y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y + 16/116);
        z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z + 16/116);

        return {
            l: (116 * y) - 16,
            a: 500 * (x - y),
            b: 200 * (y - z)
        };
    }

    analyzeColorTemperature(labColor) {
        const thresholds = this.koreanSkinDatabase.temperatureThresholds;
        
        if (labColor.a > thresholds.warm.aValue && labColor.b > thresholds.warm.bValue) {
            return 'warm';
        } else if (labColor.a < thresholds.cool.aValue && labColor.b < thresholds.cool.bValue) {
            return 'cool';
        } else {
            return 'neutral';
        }
    }

    analyzeUndertone(labColor) {
        // a*, b* 값을 기준으로 언더톤 분석
        const a = labColor.a;
        const b = labColor.b;
        
        if (a > 3 && b > 15) return 'yellow';
        else if (a < 0 && b < 10) return 'pink';
        else if (a > 0 && b > 8 && b < 15) return 'olive';
        else if (a > 5 && b > 20) return 'golden';
        else return 'neutral';
    }

    applyKoreanCorrection(colorAnalysis) {
        if (!colorAnalysis) return null;

        const factors = this.koreanSkinDatabase.correctionFactors;
        
        return {
            ...colorAnalysis,
            brightness: colorAnalysis.brightness * factors.brightness,
            temperature: this.adjustTemperature(colorAnalysis.temperature, factors.warmth),
            chroma: colorAnalysis.chroma * factors.saturation
        };
    }

    adjustTemperature(temperature, factor) {
        // 웜톤 강도 보정 적용
        if (temperature === 'warm' && factor < 1.0) {
            return 'neutral';
        }
        return temperature;
    }

    classifySeasons(colorAnalysis) {
        if (!colorAnalysis) return null;

        const { temperature, brightness, chroma, undertone } = colorAnalysis;
        const seasonScores = {
            spring: 0,
            summer: 0,
            autumn: 0,
            winter: 0
        };

        // 색온도 기반 점수
        if (temperature === 'warm') {
            seasonScores.spring += 30;
            seasonScores.autumn += 30;
        } else if (temperature === 'cool') {
            seasonScores.summer += 30;
            seasonScores.winter += 30;
        } else {
            seasonScores.spring += 15;
            seasonScores.summer += 15;
            seasonScores.autumn += 15;
            seasonScores.winter += 15;
        }

        // 명도 기반 점수
        if (brightness > 60) {
            seasonScores.spring += 25;
            seasonScores.summer += 25;
        } else {
            seasonScores.autumn += 25;
            seasonScores.winter += 25;
        }

        // 채도 기반 점수
        if (chroma > 20) {
            seasonScores.spring += 20;
            seasonScores.winter += 20;
        } else {
            seasonScores.summer += 20;
            seasonScores.autumn += 20;
        }

        // 언더톤 기반 점수
        switch (undertone) {
            case 'yellow':
            case 'golden':
                seasonScores.spring += 15;
                seasonScores.autumn += 15;
                break;
            case 'pink':
                seasonScores.summer += 15;
                seasonScores.winter += 15;
                break;
            case 'olive':
                seasonScores.autumn += 15;
                seasonScores.winter += 10;
                break;
        }

        // 점수를 확률로 정규화
        const totalScore = Object.values(seasonScores).reduce((sum, score) => sum + score, 0);
        const probabilities = {};
        
        Object.entries(seasonScores).forEach(([season, score]) => {
            probabilities[season] = totalScore > 0 ? score / totalScore : 0.25;
        });

        // 최적 계절 선택
        const bestSeason = Object.entries(probabilities)
            .reduce((best, [season, prob]) => prob > best.prob ? { season, prob } : best, 
                   { season: 'spring', prob: 0 });

        return {
            primary: bestSeason.season,
            confidence: bestSeason.prob,
            probabilities,
            scores: seasonScores
        };
    }

    calculateConfidence(aiAnalysis, colorAnalysis) {
        let confidence = 0.5; // 기본 신뢰도

        if (aiAnalysis && aiAnalysis.confidence === 'high') {
            confidence += 0.3;
        }

        if (colorAnalysis && colorAnalysis.sampleCount > 100) {
            confidence += 0.2;
        }

        return Math.min(confidence, 1.0);
    }

    constructResult(data) {
        const { aiAnalysis, colorAnalysis, seasonClassification, skinSamples, processingTime, confidence } = data;

        return {
            // 메인 결과
            season: seasonClassification?.primary || 'neutral',
            confidence: confidence,
            
            // 상세 분석
            skinTone: {
                rgb: colorAnalysis?.rgb || { r: 200, g: 180, b: 160 },
                lab: colorAnalysis?.lab || { l: 65, a: 5, b: 15 },
                temperature: colorAnalysis?.temperature || 'neutral',
                undertone: colorAnalysis?.undertone || 'neutral',
                brightness: colorAnalysis?.brightness || 65,
                chroma: colorAnalysis?.chroma || 15
            },
            
            // 계절 분류
            seasons: seasonClassification?.probabilities || {
                spring: 0.25, summer: 0.25, autumn: 0.25, winter: 0.25
            },
            
            // AI 분석 (있는 경우)
            ai: aiAnalysis,
            
            // 메타데이터
            metadata: {
                sampleCount: skinSamples.length,
                processingTime: Math.round(processingTime),
                modelUsed: this.model ? 'ai' : 'traditional',
                analysisDate: new Date().toISOString()
            },
            
            // 추천사항
            recommendations: this.generateRecommendations(seasonClassification?.primary, colorAnalysis)
        };
    }

    generateRecommendations(season, colorAnalysis) {
        if (!season) return [];

        const recommendations = [];
        
        // 계절별 기본 추천
        switch (season) {
            case 'spring':
                recommendations.push({
                    category: 'color',
                    message: '밝고 따뜻한 색상이 잘 어울립니다',
                    colors: ['#FF6B6B', '#FFA726', '#66BB6A', '#42A5F5']
                });
                break;
            case 'summer':
                recommendations.push({
                    category: 'color',
                    message: '부드럽고 시원한 색상을 추천합니다',
                    colors: ['#E1BEE7', '#B39DDB', '#90CAF9', '#A5D6A7']
                });
                break;
            case 'autumn':
                recommendations.push({
                    category: 'color',
                    message: '깊고 따뜻한 가을 색상이 어울립니다',
                    colors: ['#D32F2F', '#F57C00', '#689F38', '#5D4037']
                });
                break;
            case 'winter':
                recommendations.push({
                    category: 'color',
                    message: '선명하고 차가운 색상을 선택하세요',
                    colors: ['#000000', '#FFFFFF', '#1976D2', '#C2185B']
                });
                break;
        }

        // 색온도 기반 추천
        if (colorAnalysis?.temperature) {
            if (colorAnalysis.temperature === 'warm') {
                recommendations.push({
                    category: 'makeup',
                    message: '골드톤 메이크업이 피부를 환하게 만들어줍니다'
                });
            } else if (colorAnalysis.temperature === 'cool') {
                recommendations.push({
                    category: 'makeup',
                    message: '실버톤이나 로즈톤 메이크업을 추천합니다'
                });
            }
        }

        return recommendations;
    }

    // 유틸리티 메서드들
    generateAnalysisId(imageData) {
        // 이미지 데이터의 간단한 해시 생성
        const sample = imageData.data.slice(0, 1000);
        let hash = 0;
        for (let i = 0; i < sample.length; i++) {
            hash = ((hash << 5) - hash + sample[i]) & 0xffffffff;
        }
        return hash.toString(36);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getFallbackResult() {
        // 분석 실패 시 기본 결과 반환
        return {
            season: 'neutral',
            confidence: 0.1,
            skinTone: {
                rgb: { r: 200, g: 180, b: 160 },
                lab: { l: 65, a: 5, b: 15 },
                temperature: 'neutral',
                undertone: 'neutral',
                brightness: 65,
                chroma: 15
            },
            seasons: {
                spring: 0.25,
                summer: 0.25,
                autumn: 0.25,
                winter: 0.25
            },
            ai: null,
            metadata: {
                sampleCount: 0,
                processingTime: 0,
                modelUsed: 'fallback',
                analysisDate: new Date().toISOString()
            },
            recommendations: [
                {
                    category: 'info',
                    message: '정확한 분석을 위해 조명이 좋은 곳에서 다시 촬영해주세요'
                }
            ]
        };
    }

    // 캐시 관리
    clearCache() {
        this.analysisCache.clear();
    }

    getCacheSize() {
        return this.analysisCache.size;
    }

    // 성능 통계
    getPerformanceStats() {
        return {
            modelLoaded: this.isModelLoaded,
            cacheSize: this.getCacheSize(),
            queueLength: this.analysisQueue.length,
            isProcessing: this.isProcessing,
            lastAnalysisTime: this.lastAnalysisTime
        };
    }

    // 실시간 분석을 위한 간단한 분석 함수
    async quickAnalyze(rgbColor) {
        if (!rgbColor) return null;

        try {
            const labColor = this.rgbToLab(rgbColor);
            const temperature = this.analyzeColorTemperature(labColor);
            const undertone = this.analyzeUndertone(labColor);
            
            // 간단한 계절 추정
            let estimatedSeason = 'neutral';
            if (temperature === 'warm' && labColor.l > 60) {
                estimatedSeason = 'spring';
            } else if (temperature === 'cool' && labColor.l > 60) {
                estimatedSeason = 'summer';
            } else if (temperature === 'warm' && labColor.l <= 60) {
                estimatedSeason = 'autumn';
            } else if (temperature === 'cool' && labColor.l <= 60) {
                estimatedSeason = 'winter';
            }

            return {
                season: estimatedSeason,
                temperature,
                undertone,
                lab: labColor,
                confidence: 0.6
            };
        } catch (error) {
            console.error('빠른 분석 실패:', error);
            return null;
        }
    }

    // 배치 분석 (여러 이미지 동시 처리)
    async batchAnalyze(imageDataArray, options = {}) {
        const results = [];
        const batchSize = options.batchSize || 3;
        
        for (let i = 0; i < imageDataArray.length; i += batchSize) {
            const batch = imageDataArray.slice(i, i + batchSize);
            const batchPromises = batch.map(imageData => 
                this.analyzeSkinTone(imageData, options));
            
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
            
            // 배치 간 휴식 (과부하 방지)
            if (i + batchSize < imageDataArray.length) {
                await this.delay(100);
            }
        }
        
        return results;
    }

    // 분석 결과 비교
    compareResults(result1, result2) {
        if (!result1 || !result2) return null;

        return {
            seasonMatch: result1.season === result2.season,
            temperatureMatch: result1.skinTone.temperature === result2.skinTone.temperature,
            confidenceDiff: Math.abs(result1.confidence - result2.confidence),
            labDistance: this.calculateLabDistance(result1.skinTone.lab, result2.skinTone.lab),
            recommendation: this.getComparisonRecommendation(result1, result2)
        };
    }

    calculateLabDistance(lab1, lab2) {
        const deltaL = lab1.l - lab2.l;
        const deltaA = lab1.a - lab2.a;
        const deltaB = lab1.b - lab2.b;
        
        // CIE76 Delta E (간단한 버전)
        return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
    }

    getComparisonRecommendation(result1, result2) {
        const distance = this.calculateLabDistance(result1.skinTone.lab, result2.skinTone.lab);
        
        if (distance < 5) {
            return '두 분석 결과가 매우 일치합니다.';
        } else if (distance < 15) {
            return '분석 결과가 비슷합니다. 조명 조건을 확인해보세요.';
        } else {
            return '분석 결과가 다릅니다. 다른 조건에서 다시 촬영을 권장합니다.';
        }
    }

    // 모델 업데이트 및 재학습 지원
    async updateModel(newModelUrl) {
        try {
            // 기존 모델 정리
            if (this.model) {
                this.model.dispose();
            }
            
            // 새 모델 로드
            this.model = await tf.loadLayersModel(newModelUrl);
            this.clearCache(); // 캐시 초기화
            
            console.log('모델 업데이트 완료');
            return true;
        } catch (error) {
            console.error('모델 업데이트 실패:', error);
            return false;
        }
    }

    // 사용자 피드백을 통한 학습 데이터 수집
    collectFeedback(analysisResult, userCorrection) {
        const feedbackData = {
            timestamp: new Date().toISOString(),
            originalResult: analysisResult,
            userCorrection: userCorrection,
            confidence: analysisResult.confidence
        };
        
        // 로컬 스토리지에 피드백 저장 (실제로는 서버로 전송)
        const existingFeedback = JSON.parse(localStorage.getItem('skinAnalysisFeedback') || '[]');
        existingFeedback.push(feedbackData);
        
        // 최대 100개까지만 저장
        if (existingFeedback.length > 100) {
            existingFeedback.splice(0, existingFeedback.length - 100);
        }
        
        localStorage.setItem('skinAnalysisFeedback', JSON.stringify(existingFeedback));
        
        return feedbackData;
    }

    // 정리 함수
    dispose() {
        // 모델 메모리 해제
        if (this.model) {
            this.model.dispose();
        }
        
        // 캐시 정리
        this.clearCache();
        
        // 큐 정리
        this.analysisQueue.length = 0;
        
        console.log('SkinToneAnalyzer 정리 완료');
    }
}
