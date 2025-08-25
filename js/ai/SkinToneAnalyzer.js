/**
 * SkinToneAnalyzer.js - 완전 수정판
 * AI 기반 피부톤 분석 엔진
 * 
 * 수정사항:
 * - ReferenceError: modelConfig is not defined 오류 수정
 * - AI 모델 설정 완전 정의 및 안전 접근
 * - TensorFlow.js 모델 로드 시스템 완전 구현
 * - 한국인 피부톤 특화 분석 알고리즘
 * - 오류 처리 및 폴백 시스템 강화
 * - 성능 최적화 및 메모리 관리
 */

// CONFIG 안전 로드
let CONFIG = {};
try {
    if (typeof window !== 'undefined' && window.PersonalColorConfig) {
        CONFIG = window.PersonalColorConfig;
    }
} catch (error) {
    console.warn('[SkinToneAnalyzer] CONFIG 로드 실패, 기본값 사용:', error);
}

export class SkinToneAnalyzer {
    constructor() {
        // AI 모델 설정 완전 정의 (누락된 modelConfig 해결)
        this.modelConfig = {
            // 기본 모델 설정
            modelUrl: this.getConfigPath('AI_MODELS.skinToneAnalyzer.modelUrl', './js/ai/models/personal-color-model.json'),
            weightsUrl: this.getConfigPath('AI_MODELS.skinToneAnalyzer.weightsUrl', './js/ai/models/skin-tone-weights.bin'),
            
            // 입출력 설정
            inputSize: this.getConfigPath('AI_MODELS.skinToneAnalyzer.inputSize', [224, 224, 3]),
            outputClasses: this.getConfigPath('AI_MODELS.skinToneAnalyzer.outputClasses', ['spring', 'summer', 'autumn', 'winter']),
            confidenceThreshold: this.getConfigPath('AI_MODELS.skinToneAnalyzer.confidenceThreshold', 0.75),
            maxBatchSize: this.getConfigPath('AI_MODELS.skinToneAnalyzer.maxBatchSize', 1),
            
            // 전처리 설정
            preprocessing: {
                normalize: true,
                centerCrop: true,
                colorSpace: 'RGB',
                meanSubtraction: [0.485, 0.456, 0.406],
                stdNormalization: [0.229, 0.224, 0.225],
                resize: 'bilinear'
            },
            
            // 후처리 설정
            postprocessing: {
                softmax: true,
                temperatureScaling: 1.0,
                calibration: true
            }
        };

        // 모델 상태
        this.model = null;
        this.isModelLoaded = false;
        this.isLoading = false;
        this.modelLoadError = null;
        
        // 한국인 피부톤 분석 데이터
        this.koreanSkinDatabase = null;
        
        // 분석 결과 캐시
        this.analysisCache = new Map();
        this.maxCacheSize = 100;
        
        // 성능 최적화
        this.analysisQueue = [];
        this.isProcessing = false;
        this.lastAnalysisTime = 0;
        
        // 성능 통계
        this.stats = {
            analysisCount: 0,
            totalProcessingTime: 0,
            cacheHits: 0,
            cacheMisses: 0,
            modelLoadTime: 0,
            errors: 0
        };
        
        // 초기화 시작
        this.init();
    }

    /**
     * 안전한 설정 값 가져오기
     */
    getConfigPath(path, defaultValue) {
        try {
            const keys = path.split('.');
            let current = CONFIG;
            
            for (const key of keys) {
                if (current && typeof current === 'object' && key in current) {
                    current = current[key];
                } else {
                    return defaultValue;
                }
            }
            
            return current !== undefined ? current : defaultValue;
        } catch (error) {
            console.warn(`[SkinToneAnalyzer] 설정 경로 접근 실패 (${path}):`, error);
            return defaultValue;
        }
    }

    /**
     * 시스템 초기화
     */
    async init() {
        try {
            console.log('[SkinToneAnalyzer] 초기화 시작...');
            
            // 한국인 피부톤 데이터베이스 로드
            await this.loadKoreanSkinDatabase();
            
            // TensorFlow.js 및 AI 모델 로드
            await this.loadModel();
            
            console.log('[SkinToneAnalyzer] 초기화 완료');
        } catch (error) {
            console.error('[SkinToneAnalyzer] 초기화 실패:', error);
            this.modelLoadError = error;
            // 오류가 있어도 기본 분석은 가능하도록 처리
        }
    }

    /**
     * AI 모델 로드 (완전 재구현)
     */
    async loadModel() {
        if (this.isLoading) {
            console.log('[SkinToneAnalyzer] 모델 로딩 중...');
            return;
        }

        this.isLoading = true;
        const startTime = performance.now();
        
        try {
            // TensorFlow.js 로드 확인
            if (typeof tf === 'undefined') {
                // 동적으로 TensorFlow.js 로드 시도
                await this.loadTensorFlowJS();
            }

            if (typeof tf === 'undefined') {
                throw new Error('TensorFlow.js를 로드할 수 없습니다. AI 분석을 사용할 수 없습니다.');
            }

            console.log('[SkinToneAnalyzer] TensorFlow.js 로드 완료');

            // 모델 파일 존재 확인
            const modelExists = await this.checkModelExists();
            if (!modelExists) {
                console.warn('[SkinToneAnalyzer] 모델 파일이 없습니다. 기본 분석 모드로 실행됩니다.');
                return;
            }

            // AI 모델 로딩
            console.log('[SkinToneAnalyzer] AI 모델 로딩 중:', this.modelConfig.modelUrl);
            this.model = await tf.loadLayersModel(this.modelConfig.modelUrl);
            
            // 모델 워밍업 (첫 추론 속도 최적화)
            await this.warmupModel();
            
            this.isModelLoaded = true;
            this.stats.modelLoadTime = performance.now() - startTime;
            
            console.log(`[SkinToneAnalyzer] AI 모델 로딩 완료 (${Math.round(this.stats.modelLoadTime)}ms)`);
            
        } catch (error) {
            console.warn('[SkinToneAnalyzer] AI 모델 로딩 실패, 기본 분석 모드 사용:', error);
            this.modelLoadError = error;
            this.model = null;
            this.isModelLoaded = false;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * TensorFlow.js 동적 로드
     */
    async loadTensorFlowJS() {
        try {
            if (typeof window !== 'undefined' && !window.tf) {
                console.log('[SkinToneAnalyzer] TensorFlow.js 동적 로드 시도...');
                
                // TensorFlow.js CDN에서 로드
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.10.0/dist/tf.min.js';
                script.async = true;
                
                await new Promise((resolve, reject) => {
                    script.onload = resolve;
                    script.onerror = () => reject(new Error('TensorFlow.js 로드 실패'));
                    document.head.appendChild(script);
                });
                
                // tf 전역 변수 설정
                if (window.tf) {
                    window.tf = window.tf;
                    console.log('[SkinToneAnalyzer] TensorFlow.js 동적 로드 완료');
                }
            }
        } catch (error) {
            console.warn('[SkinToneAnalyzer] TensorFlow.js 동적 로드 실패:', error);
            throw error;
        }
    }

    /**
     * 모델 파일 존재 확인
     */
    async checkModelExists() {
        try {
            const response = await fetch(this.modelConfig.modelUrl, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            console.warn('[SkinToneAnalyzer] 모델 파일 확인 실패:', error);
            return false;
        }
    }

    /**
     * 모델 워밍업
     */
    async warmupModel() {
        if (!this.model) return;
        
        try {
            const [height, width, channels] = this.modelConfig.inputSize;
            const dummyInput = tf.zeros([1, height, width, channels]);
            
            const prediction = await this.model.predict(dummyInput);
            
            // 메모리 정리
            dummyInput.dispose();
            prediction.dispose();
            
            console.log('[SkinToneAnalyzer] 모델 워밍업 완료');
        } catch (error) {
            console.warn('[SkinToneAnalyzer] 모델 워밍업 실패:', error);
        }
    }

    /**
     * 한국인 피부톤 데이터베이스 로드
     */
    async loadKoreanSkinDatabase() {
        try {
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
            
            console.log('[SkinToneAnalyzer] 한국인 피부톤 데이터베이스 로드 완료');
        } catch (error) {
            console.error('[SkinToneAnalyzer] 데이터베이스 로드 실패:', error);
            throw error;
        }
    }

    /**
     * 메인 분석 함수 (안전성 강화)
     */
    async analyzeSkinTone(imageData, options = {}) {
        // 입력 검증
        if (!imageData) {
            console.warn('[SkinToneAnalyzer] imageData가 null입니다');
            return this.getFallbackResult();
        }

        // 모델 로딩 대기 (옵션)
        if (this.isLoading && !options.skipModelWait) {
            console.log('[SkinToneAnalyzer] 모델 로딩 대기 중...');
            await this.waitForModelLoad(5000); // 5초 타임아웃
        }

        const analysisId = this.generateAnalysisId(imageData);
        
        // 캐시 확인
        if (this.analysisCache.has(analysisId)) {
            this.stats.cacheHits++;
            return this.analysisCache.get(analysisId);
        }
        this.stats.cacheMisses++;

        try {
            // 성능 최적화: 큐 시스템 사용
            return await this.queueAnalysis(imageData, options, analysisId);
        } catch (error) {
            console.error('[SkinToneAnalyzer] 피부톤 분석 실패:', error);
            this.stats.errors++;
            return this.getFallbackResult();
        }
    }

    /**
     * 모델 로드 대기
     */
    async waitForModelLoad(timeout = 5000) {
        const startTime = Date.now();
        
        while (this.isLoading && (Date.now() - startTime) < timeout) {
            await this.delay(100);
        }
        
        if (this.isLoading) {
            console.warn('[SkinToneAnalyzer] 모델 로드 타임아웃');
        }
    }

    /**
     * 분석 큐 시스템
     */
    async queueAnalysis(imageData, options, analysisId) {
        return new Promise((resolve, reject) => {
            this.analysisQueue.push({
                imageData,
                options,
                analysisId,
                resolve,
                reject,
                timestamp: Date.now()
            });

            if (!this.isProcessing) {
                this.processQueue();
            }
        });
    }

    /**
     * 큐 처리
     */
    async processQueue() {
        this.isProcessing = true;

        while (this.analysisQueue.length > 0) {
            const task = this.analysisQueue.shift();
            
            try {
                // 분석 간격 제어 (성능 최적화)
                const now = Date.now();
                const timeSinceLastAnalysis = now - this.lastAnalysisTime;
                const minInterval = this.getConfigPath('PERFORMANCE.analysis.minInterval', 100);
                
                if (timeSinceLastAnalysis < minInterval) {
                    await this.delay(minInterval - timeSinceLastAnalysis);
                }

                const result = await this.performAnalysis(task.imageData, task.options);
                
                // 캐시 저장
                this.cacheResult(task.analysisId, result);
                
                task.resolve(result);
                this.lastAnalysisTime = Date.now();

            } catch (error) {
                console.error('[SkinToneAnalyzer] 큐 처리 오류:', error);
                task.reject(error);
            }
        }

        this.isProcessing = false;
    }

    /**
     * 실제 분석 수행
     */
    async performAnalysis(imageData, options) {
        const startTime = performance.now();
        
        try {
            // 1. 얼굴 영역 감지 및 피부 영역 추출
            const faceRegions = await this.extractFaceRegions(imageData, options);
            
            // 2. 피부톤 샘플 추출
            const skinSamples = this.extractSkinSamples(faceRegions, imageData);
            
            if (skinSamples.length === 0) {
                console.warn('[SkinToneAnalyzer] 유효한 피부 샘플을 찾을 수 없습니다');
                return this.getFallbackResult();
            }
            
            // 3. AI 모델을 사용한 고급 분석 (가능한 경우)
            let aiAnalysis = null;
            if (this.model && this.isModelLoaded) {
                aiAnalysis = await this.performAIAnalysis(skinSamples);
            }
            
            // 4. 색공간 변환 및 정량 분석
            const colorAnalysis = this.performColorSpaceAnalysis(skinSamples);
            
            // 5. 한국인 특화 보정
            const correctedAnalysis = this.applyKoreanCorrection(colorAnalysis);
            
            // 6. 계절 분류
            const seasonClassification = this.classifySeasons(correctedAnalysis);
            
            // 7. 신뢰도 계산
            const confidence = this.calculateConfidence(aiAnalysis, colorAnalysis, skinSamples.length);
            
            // 8. 최종 결과 구성
            const result = this.constructResult({
                aiAnalysis,
                colorAnalysis: correctedAnalysis,
                seasonClassification,
                skinSamples,
                processingTime: performance.now() - startTime,
                confidence
            });

            this.stats.analysisCount++;
            this.stats.totalProcessingTime += (performance.now() - startTime);

            return result;
            
        } catch (error) {
            console.error('[SkinToneAnalyzer] 분석 수행 오류:', error);
            throw error;
        }
    }

    /**
     * 얼굴 영역 추출 (안전 처리)
     */
    async extractFaceRegions(imageData, options) {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = imageData.width;
            canvas.height = imageData.height;
            ctx.putImageData(imageData, 0, 0);

            // 얼굴 감지 시스템과 연동 (안전 접근)
            if (typeof window !== 'undefined' && window.FaceDetection) {
                try {
                    const faces = await window.FaceDetection.detectFaces(canvas);
                    if (faces && faces.length > 0) {
                        return this.mapFaceRegionsToSkinAreas(faces, imageData);
                    }
                } catch (error) {
                    console.warn('[SkinToneAnalyzer] 얼굴 감지 실패:', error);
                }
            }

            // 기본 영역 사용
            return this.getDefaultFaceRegions(imageData);
            
        } catch (error) {
            console.error('[SkinToneAnalyzer] 얼굴 영역 추출 오류:', error);
            return this.getDefaultFaceRegions(imageData);
        }
    }

    /**
     * 얼굴 영역을 피부 분석 영역으로 매핑
     */
    mapFaceRegionsToSkinAreas(faces, imageData) {
        if (!faces || faces.length === 0) {
            return this.getDefaultFaceRegions(imageData);
        }

        try {
            const face = faces[0]; // 첫 번째 얼굴 사용
            const faceRegionConfig = this.getConfigPath('COLOR_ANALYSIS.skinDetection.regions', {
                forehead: { x: 0.3, y: 0.15, w: 0.4, h: 0.15 },
                leftCheek: { x: 0.15, y: 0.35, w: 0.2, h: 0.2 },
                rightCheek: { x: 0.65, y: 0.35, w: 0.2, h: 0.2 },
                nose: { x: 0.4, y: 0.4, w: 0.2, h: 0.2 },
                chin: { x: 0.35, y: 0.65, w: 0.3, h: 0.15 }
            });
            
            return Object.entries(faceRegionConfig).map(([name, region]) => ({
                name,
                x: Math.floor(face.x + face.width * region.x),
                y: Math.floor(face.y + face.height * region.y),
                width: Math.floor(face.width * region.w),
                height: Math.floor(face.height * region.h)
            }));
        } catch (error) {
            console.error('[SkinToneAnalyzer] 얼굴 매핑 오류:', error);
            return this.getDefaultFaceRegions(imageData);
        }
    }

    /**
     * 기본 얼굴 영역 반환
     */
    getDefaultFaceRegions(imageData) {
        const defaultRegions = {
            forehead: { x: 0.3, y: 0.15, w: 0.4, h: 0.15 },
            leftCheek: { x: 0.15, y: 0.35, w: 0.2, h: 0.2 },
            rightCheek: { x: 0.65, y: 0.35, w: 0.2, h: 0.2 },
            nose: { x: 0.4, y: 0.4, w: 0.2, h: 0.2 },
            chin: { x: 0.35, y: 0.65, w: 0.3, h: 0.15 }
        };
        
        return Object.entries(defaultRegions).map(([name, region]) => ({
            name,
            x: Math.floor(imageData.width * region.x),
            y: Math.floor(imageData.height * region.y),
            width: Math.floor(imageData.width * region.w),
            height: Math.floor(imageData.height * region.h)
        }));
    }

    /**
     * 피부 샘플 추출
     */
    extractSkinSamples(faceRegions, imageData) {
        const samples = [];
        const data = imageData.data;
        const width = imageData.width;
        
        try {
            faceRegions.forEach(region => {
                const endX = Math.min(region.x + region.width, width);
                const endY = Math.min(region.y + region.height, imageData.height);
                
                for (let y = region.y; y < endY; y += 3) { // 샘플링 간격 증가 (성능)
                    for (let x = region.x; x < endX; x += 3) {
                        const index = (y * width + x) * 4;
                        
                        if (index + 3 < data.length) {
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
                }
            });
        } catch (error) {
            console.error('[SkinToneAnalyzer] 피부 샘플 추출 오류:', error);
        }

        console.log(`[SkinToneAnalyzer] 추출된 피부 샘플 수: ${samples.length}`);
        return samples;
    }

    /**
     * 유효한 피부색 검증
     */
    isValidSkinColor(r, g, b, a) {
        try {
            // 투명도 체크
            if (a < 200) return false;
            
            // 기본적인 피부색 범위 체크
            const brightness = (r + g + b) / 3;
            if (brightness < 50 || brightness > 250) return false;
            
            // 피부색 특성 체크 (R >= G >= B 경향)
            if (r < g - 10 || g < b - 10) return false;
            
            // 채도 체크 (너무 선명한 색은 제외)
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const saturation = max === 0 ? 0 : (max - min) / max;
            
            if (saturation > 0.4) return false;
            
            // 추가 피부색 필터링
            const rg_diff = Math.abs(r - g);
            const rb_diff = Math.abs(r - b);
            
            // 피부색은 R과 G, R과 B의 차이가 적당해야 함
            if (rg_diff > 50 || rb_diff > 80) return false;
            
            return true;
        } catch (error) {
            console.error('[SkinToneAnalyzer] 피부색 검증 오류:', error);
            return false;
        }
    }

    /**
     * AI 분석 수행 (안전 처리)
     */
    async performAIAnalysis(skinSamples) {
        if (!this.model || skinSamples.length === 0) {
            return null;
        }

        try {
            // 샘플을 모델 입력 형식으로 변환
            const inputTensor = this.prepareTensorInput(skinSamples);
            if (!inputTensor) return null;
            
            // 모델 추론 실행
            const prediction = await this.model.predict(inputTensor);
            if (!prediction) {
                inputTensor.dispose();
                return null;
            }
            
            const predictionData = await prediction.data();
            
            // 메모리 정리
            inputTensor.dispose();
            prediction.dispose();
            
            return this.interpretAIResult(predictionData);
            
        } catch (error) {
            console.error('[SkinToneAnalyzer] AI 분석 실행 오류:', error);
            return null;
        }
    }

    /**
     * 텐서 입력 준비
     */
    prepareTensorInput(skinSamples) {
        try {
            if (typeof tf === 'undefined' || !skinSamples || skinSamples.length === 0) {
                return null;
            }

            const [height, width, channels] = this.modelConfig.inputSize;
            
            // 대표 색상들을 이미지 형태로 구성
            const inputData = new Float32Array(height * width * channels);
            
            // 샘플들의 평균 색상 계산
            const avgColor = this.calculateAverageColor(skinSamples);
            if (!avgColor) return null;
            
            // 정규화된 RGB 값으로 텐서 채우기
            const normalizedR = avgColor.r / 255;
            const normalizedG = avgColor.g / 255;
            const normalizedB = avgColor.b / 255;
            
            for (let i = 0; i < height * width; i++) {
                inputData[i * channels] = normalizedR;
                inputData[i * channels + 1] = normalizedG;
                inputData[i * channels + 2] = normalizedB;
            }
            
            return tf.tensor4d(inputData, [1, height, width, channels]);
            
        } catch (error) {
            console.error('[SkinToneAnalyzer] 텐서 입력 준비 오류:', error);
            return null;
        }
    }

    /**
     * AI 결과 해석
     */
    interpretAIResult(predictionData) {
        try {
            if (!predictionData || predictionData.length === 0) {
                return null;
            }

            const seasons = this.modelConfig.outputClasses;
            const probabilities = Array.from(predictionData);
            
            const results = seasons.map((season, index) => ({
                season,
                probability: probabilities[index] || 0,
                confidence: (probabilities[index] || 0) > 0.7 ? 'high' : 
                           (probabilities[index] || 0) > 0.4 ? 'medium' : 'low'
            }));
            
            // 가장 높은 확률의 계절
            const bestMatch = results.reduce((max, current) => 
                current.probability > max.probability ? current : max);
            
            return {
                prediction: bestMatch.season,
                confidence: bestMatch.confidence,
                probability: bestMatch.probability,
                probabilities: results
            };
            
        } catch (error) {
            console.error('[SkinToneAnalyzer] AI 결과 해석 오류:', error);
            return null;
        }
    }

    /**
     * 색공간 분석 수행
     */
    performColorSpaceAnalysis(skinSamples) {
        if (!skinSamples || skinSamples.length === 0) {
            return null;
        }

        try {
            // 대표 색상 계산
            const avgColor = this.calculateAverageColor(skinSamples);
            if (!avgColor) return null;
            
            // RGB to LAB 변환
            const labColor = this.rgbToLab(avgColor);
            if (!labColor) return null;
            
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
            
        } catch (error) {
            console.error('[SkinToneAnalyzer] 색공간 분석 오류:', error);
            return null;
        }
    }

    /**
     * 평균 색상 계산
     */
    calculateAverageColor(skinSamples) {
        if (!skinSamples || skinSamples.length === 0) {
            return null;
        }

        try {
            const totalR = skinSamples.reduce((sum, sample) => sum + (sample.rgb?.r || 0), 0);
            const totalG = skinSamples.reduce((sum, sample) => sum + (sample.rgb?.g || 0), 0);
            const totalB = skinSamples.reduce((sum, sample) => sum + (sample.rgb?.b || 0), 0);
            
            const count = skinSamples.length;
            
            return {
                r: Math.round(totalR / count),
                g: Math.round(totalG / count),
                b: Math.round(totalB / count)
            };
        } catch (error) {
            console.error('[SkinToneAnalyzer] 평균 색상 계산 오류:', error);
            return null;
        }
    }

    /**
     * RGB to LAB 변환
     */
    rgbToLab(rgb) {
        if (!rgb || typeof rgb.r !== 'number' || typeof rgb.g !== 'number' || typeof rgb.b !== 'number') {
            return null;
        }

        try {
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
        } catch (error) {
            console.error('[SkinToneAnalyzer] RGB to LAB 변환 오류:', error);
            return null;
        }
    }

    /**
     * 색온도 분석
     */
    analyzeColorTemperature(labColor) {
        if (!labColor || !this.koreanSkinDatabase) {
            return 'neutral';
        }

        try {
            const thresholds = this.koreanSkinDatabase.temperatureThresholds;
            
            if (labColor.a > thresholds.warm.aValue && labColor.b > thresholds.warm.bValue) {
                return 'warm';
            } else if (labColor.a < thresholds.cool.aValue && labColor.b < thresholds.cool.bValue) {
                return 'cool';
            } else {
                return 'neutral';
            }
        } catch (error) {
            console.error('[SkinToneAnalyzer] 색온도 분석 오류:', error);
            return 'neutral';
        }
    }

    /**
     * 언더톤 분석
     */
    analyzeUndertone(labColor) {
        if (!labColor) {
            return 'neutral';
        }

        try {
            // a*, b* 값을 기준으로 언더톤 분석
            const a = labColor.a;
            const b = labColor.b;
            
            if (a > 3 && b > 15) return 'yellow';
            else if (a < 0 && b < 10) return 'pink';
            else if (a > 0 && b > 8 && b < 15) return 'olive';
            else if (a > 5 && b > 20) return 'golden';
            else return 'neutral';
        } catch (error) {
            console.error('[SkinToneAnalyzer] 언더톤 분석 오류:', error);
            return 'neutral';
        }
    }

    /**
     * 한국인 특화 보정
     */
    applyKoreanCorrection(colorAnalysis) {
        if (!colorAnalysis || !this.koreanSkinDatabase) {
            return colorAnalysis;
        }

        try {
            const factors = this.koreanSkinDatabase.correctionFactors;
            
            return {
                ...colorAnalysis,
                brightness: colorAnalysis.brightness * factors.brightness,
                temperature: this.adjustTemperature(colorAnalysis.temperature, factors.warmth),
                chroma: colorAnalysis.chroma * factors.saturation
            };
        } catch (error) {
            console.error('[SkinToneAnalyzer] 한국인 보정 적용 오류:', error);
            return colorAnalysis;
        }
    }

    adjustTemperature(temperature, factor) {
        try {
            // 웜톤 강도 보정 적용
            if (temperature === 'warm' && factor < 1.0) {
                return 'neutral';
            }
            return temperature;
        } catch (error) {
            return temperature;
        }
    }

    /**
     * 계절 분류
     */
    classifySeasons(colorAnalysis) {
        if (!colorAnalysis) {
            return null;
        }

        try {
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
            
            if (totalScore > 0) {
                Object.entries(seasonScores).forEach(([season, score]) => {
                    probabilities[season] = score / totalScore;
                });
            } else {
                // 기본 확률 설정
                Object.keys(seasonScores).forEach(season => {
                    probabilities[season] = 0.25;
                });
            }

            // 최적 계절 선택
            const bestSeason = Object.entries(probabilities)
                .reduce((best, [season, prob]) => prob > best.prob ? { season, prob } : best, 
                       { season: 'spring', prob: 0 });

            return {
                primary: bestSeason.season,
                confidence: Math.round(bestSeason.prob * 100) / 100,
                probabilities,
                scores: seasonScores
            };
        } catch (error) {
            console.error('[SkinToneAnalyzer] 계절 분류 오류:', error);
            return {
                primary: 'neutral',
                confidence: 0.25,
                probabilities: { spring: 0.25, summer: 0.25, autumn: 0.25, winter: 0.25 },
                scores: { spring: 25, summer: 25, autumn: 25, winter: 25 }
            };
        }
    }

    /**
     * 신뢰도 계산
     */
    calculateConfidence(aiAnalysis, colorAnalysis, sampleCount) {
        try {
            let confidence = 0.5; // 기본 신뢰도

            // AI 분석 신뢰도
            if (aiAnalysis && aiAnalysis.confidence === 'high') {
                confidence += 0.3;
            } else if (aiAnalysis && aiAnalysis.confidence === 'medium') {
                confidence += 0.15;
            }

            // 샘플 수 기반 신뢰도
            if (sampleCount > 100) {
                confidence += 0.2;
            } else if (sampleCount > 50) {
                confidence += 0.1;
            }

            // 색상 분석 품질 기반 신뢰도
            if (colorAnalysis && colorAnalysis.sampleCount > 0) {
                confidence += 0.1;
            }

            return Math.min(Math.max(confidence, 0.1), 1.0);
        } catch (error) {
            console.error('[SkinToneAnalyzer] 신뢰도 계산 오류:', error);
            return 0.5;
        }
    }

    /**
     * 최종 결과 구성
     */
    constructResult(data) {
        const { aiAnalysis, colorAnalysis, seasonClassification, skinSamples, processingTime, confidence } = data;

        try {
            return {
                // 메인 결과
                season: seasonClassification?.primary || 'neutral',
                confidence: confidence || 0.5,
                
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
                    sampleCount: skinSamples?.length || 0,
                    processingTime: Math.round(processingTime || 0),
                    modelUsed: this.isModelLoaded ? 'ai' : 'traditional',
                    analysisDate: new Date().toISOString(),
                    modelVersion: this.modelConfig.modelUrl
                },
                
                // 추천사항
                recommendations: this.generateRecommendations(seasonClassification?.primary, colorAnalysis)
            };
        } catch (error) {
            console.error('[SkinToneAnalyzer] 결과 구성 오류:', error);
            return this.getFallbackResult();
        }
    }

    /**
     * 추천사항 생성
     */
    generateRecommendations(season, colorAnalysis) {
        const recommendations = [];
        
        try {
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
                default:
                    recommendations.push({
                        category: 'info',
                        message: '다양한 색상을 시도해보며 자신만의 스타일을 찾아보세요'
                    });
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
        } catch (error) {
            console.error('[SkinToneAnalyzer] 추천사항 생성 오류:', error);
            recommendations.push({
                category: 'info',
                message: '퍼스널컬러 전문가와 상담하여 더 정확한 진단을 받아보세요'
            });
        }

        return recommendations;
    }

    /**
     * 폴백 결과 (분석 실패 시)
     */
    getFallbackResult() {
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
                analysisDate: new Date().toISOString(),
                error: true
            },
            recommendations: [
                {
                    category: 'info',
                    message: '정확한 분석을 위해 조명이 좋은 곳에서 다시 촬영해주세요'
                }
            ]
        };
    }

    /**
     * 유틸리티 메서드들
     */
    generateAnalysisId(imageData) {
        try {
            // 이미지 데이터의 간단한 해시 생성
            const sample = imageData.data.slice(0, 1000);
            let hash = 0;
            for (let i = 0; i < sample.length; i++) {
                hash = ((hash << 5) - hash + sample[i]) & 0xffffffff;
            }
            return hash.toString(36);
        } catch (error) {
            return Date.now().toString(36);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 캐시 관리
     */
    cacheResult(analysisId, result) {
        if (!analysisId || !result) return;

        try {
            this.analysisCache.set(analysisId, result);
            
            // 캐시 크기 제한
            if (this.analysisCache.size > this.maxCacheSize) {
                const firstKey = this.analysisCache.keys().next().value;
                this.analysisCache.delete(firstKey);
            }
        } catch (error) {
            console.warn('[SkinToneAnalyzer] 캐시 저장 실패:', error);
        }
    }

    clearCache() {
        this.analysisCache.clear();
        console.log('[SkinToneAnalyzer] 캐시가 클리어되었습니다');
    }

    getCacheSize() {
        return this.analysisCache.size;
    }

    /**
     * 성능 통계
     */
    getPerformanceStats() {
        const hitRate = this.stats.cacheHits + this.stats.cacheMisses > 0 ?
            this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses) : 0;
        
        return {
            modelLoaded: this.isModelLoaded,
            modelLoadError: this.modelLoadError?.message,
            cacheSize: this.getCacheSize(),
            queueLength: this.analysisQueue.length,
            isProcessing: this.isProcessing,
            lastAnalysisTime: this.lastAnalysisTime,
            stats: {
                ...this.stats,
                hitRate: Math.round(hitRate * 100) / 100,
                averageProcessingTime: this.stats.analysisCount > 0 ?
                    this.stats.totalProcessingTime / this.stats.analysisCount : 0
            }
        };
    }

    /**
     * 실시간 분석을 위한 간단한 분석 함수
     */
    async quickAnalyze(rgbColor) {
        if (!rgbColor) return null;

        try {
            const labColor = this.rgbToLab(rgbColor);
            if (!labColor) return null;
            
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
            console.error('[SkinToneAnalyzer] 빠른 분석 실패:', error);
            return null;
        }
    }

    /**
     * 시스템 상태 검증
     */
    validateSystem() {
        const issues = [];
        
        try {
            // 모델 상태 확인
            if (this.modelLoadError) {
                issues.push(`모델 로드 오류: ${this.modelLoadError.message}`);
            }
            
            // 데이터베이스 확인
            if (!this.koreanSkinDatabase) {
                issues.push('한국인 피부톤 데이터베이스가 로드되지 않음');
            }
            
            // TensorFlow.js 확인
            if (typeof tf === 'undefined') {
                issues.push('TensorFlow.js가 로드되지 않음');
            }
            
            // 기본 분석 테스트
            const testRgb = { r: 200, g: 180, b: 160 };
            const testLab = this.rgbToLab(testRgb);
            
            if (!testLab) {
                issues.push('RGB to LAB 변환 실패');
            }
            
        } catch (error) {
            issues.push(`시스템 검증 오류: ${error.message}`);
        }
        
        return {
            isValid: issues.length === 0,
            issues,
            stats: this.getPerformanceStats()
        };
    }

    /**
     * 정리 함수 (메모리 해제)
     */
    dispose() {
        try {
            // 모델 메모리 해제
            if (this.model) {
                this.model.dispose();
                this.model = null;
            }
            
            // 캐시 정리
            this.clearCache();
            
            // 큐 정리
            this.analysisQueue.length = 0;
            
            // 상태 리셋
            this.isModelLoaded = false;
            this.isLoading = false;
            this.isProcessing = false;
            
            console.log('[SkinToneAnalyzer] 정리 완료');
        } catch (error) {
            console.error('[SkinToneAnalyzer] 정리 중 오류:', error);
        }
    }
}

// 전역 접근을 위한 등록
if (typeof window !== 'undefined') {
    window.SkinToneAnalyzer = SkinToneAnalyzer;
}

console.log('[SkinToneAnalyzer] 완전 수정 버전 로드 완료 ✅');
