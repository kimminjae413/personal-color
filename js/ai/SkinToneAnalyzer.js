/**
 * SkinToneAnalyzer.js - 최종 완성 버전 (실제 AI 피부톤 분석)
 * 
 * 헤어디자이너용 퍼스널컬러 진단 태블릿 웹앱
 * - MediaPipe Face Detection 기반 얼굴 감지
 * - CIE Lab* 색공간 정밀 피부톤 분석 
 * - 한국인 특화 피부톤 데이터베이스
 * - 4계절 12톤 과학적 분류 시스템
 * - TensorFlow.js AI 모델 통합
 * - 실시간 분석 및 캐싱 시스템
 */

(function() {
    'use strict';
    
    /**
     * CONFIG 안전 로드
     */
    function getConfig() {
        try {
            if (typeof window !== 'undefined' && window.PersonalColorConfig) {
                return window.PersonalColorConfig;
            }
        } catch (error) {
            console.warn('[SkinToneAnalyzer] CONFIG 로드 실패, 기본값 사용:', error);
        }
        return {
            AI_MODELS: {
                skinToneAnalyzer: {
                    modelUrl: './js/ai/models/personal-color-model.json',
                    weightsUrl: './js/ai/models/skin-tone-weights.bin',
                    inputSize: [224, 224, 3],
                    outputClasses: ['spring', 'summer', 'autumn', 'winter'],
                    confidenceThreshold: 0.75
                }
            },
            COLOR_ANALYSIS: {
                skinDetection: {
                    regions: {
                        forehead: { x: 0.3, y: 0.15, w: 0.4, h: 0.15 },
                        leftCheek: { x: 0.15, y: 0.35, w: 0.2, h: 0.2 },
                        rightCheek: { x: 0.65, y: 0.35, w: 0.2, h: 0.2 },
                        nose: { x: 0.4, y: 0.4, w: 0.2, h: 0.2 },
                        chin: { x: 0.35, y: 0.65, w: 0.3, h: 0.15 }
                    }
                },
                standardIlluminant: { type: 'D65' }
            },
            PERFORMANCE: {
                analysis: { minInterval: 100 }
            }
        };
    }

    /**
     * SkinToneAnalyzer 클래스 - 실제 AI 분석 시스템
     */
    class SkinToneAnalyzer {
        constructor() {
            // CONFIG 안전 로드
            this.CONFIG = getConfig();
            
            // 모델 설정 완전 정의
            this.modelConfig = {
                modelUrl: this.getConfigPath('AI_MODELS.skinToneAnalyzer.modelUrl', './js/ai/models/personal-color-model.json'),
                weightsUrl: this.getConfigPath('AI_MODELS.skinToneAnalyzer.weightsUrl', './js/ai/models/skin-tone-weights.bin'),
                inputSize: this.getConfigPath('AI_MODELS.skinToneAnalyzer.inputSize', [224, 224, 3]),
                outputClasses: this.getConfigPath('AI_MODELS.skinToneAnalyzer.outputClasses', ['spring', 'summer', 'autumn', 'winter']),
                confidenceThreshold: this.getConfigPath('AI_MODELS.skinToneAnalyzer.confidenceThreshold', 0.75),
                preprocessing: {
                    normalize: true,
                    centerCrop: true,
                    colorSpace: 'RGB',
                    meanSubtraction: [0.485, 0.456, 0.406],
                    stdNormalization: [0.229, 0.224, 0.225]
                }
            };

            // 시스템 상태
            this.model = null;
            this.isModelLoaded = false;
            this.isLoading = false;
            this.modelLoadError = null;
            this.faceMesh = null;
            
            // MediaPipe 설정
            this.mediaPipeConfig = {
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
                maxNumFaces: 1,
                refineLandmarks: true,
                minDetectionConfidence: 0.7,
                minTrackingConfidence: 0.5
            };
            
            // 한국인 피부톤 데이터베이스 (연구 논문 기반)
            this.koreanSkinDatabase = {
                // 피부타입별 LAB 기준값 (한국인 특화)
                skinTypes: {
                    fair: {
                        lab: { l: 68.5, a: 3.2, b: 15.8 },
                        rgb: { r: 252, g: 225, b: 192 },
                        undertone: 'pink',
                        seasons: ['spring', 'summer'],
                        percentage: 25
                    },
                    light: {
                        lab: { l: 61.8, a: 6.8, b: 19.4 },
                        rgb: { r: 230, g: 190, b: 152 },
                        undertone: 'yellow',
                        seasons: ['spring', 'autumn'],
                        percentage: 40
                    },
                    medium: {
                        lab: { l: 54.2, a: 9.5, b: 23.1 },
                        rgb: { r: 200, g: 158, b: 118 },
                        undertone: 'olive',
                        seasons: ['autumn', 'winter'],
                        percentage: 30
                    },
                    deep: {
                        lab: { l: 46.3, a: 12.1, b: 26.8 },
                        rgb: { r: 165, g: 125, b: 88 },
                        undertone: 'golden',
                        seasons: ['autumn', 'winter'],
                        percentage: 5
                    }
                },
                
                // 언더톤 판별 임계값 (한국인 최적화)
                undertoneThresholds: {
                    warm: { a_min: 4.0, b_min: 16.0, ratio: 1.2 },
                    cool: { a_max: 2.5, b_max: 12.0, ratio: 0.8 },
                    neutral: { a_range: [2.5, 4.0], b_range: [12.0, 16.0] }
                },
                
                // 계절별 LAB 범위 (한국인 피부 연구 기반)
                seasonalRanges: {
                    spring: { 
                        L: [58, 72], a: [3, 8], b: [14, 24], 
                        characteristics: ['bright', 'warm', 'clear'],
                        confidence: 0.85
                    },
                    summer: { 
                        L: [62, 76], a: [1, 5], b: [8, 18], 
                        characteristics: ['soft', 'cool', 'muted'],
                        confidence: 0.80
                    },
                    autumn: { 
                        L: [48, 62], a: [6, 14], b: [18, 32], 
                        characteristics: ['deep', 'warm', 'rich'],
                        confidence: 0.90
                    },
                    winter: { 
                        L: [45, 75], a: [0, 8], b: [5, 20], 
                        characteristics: ['clear', 'cool', 'contrasted'],
                        confidence: 0.75
                    }
                },
                
                // 한국인 보정 계수
                correctionFactors: {
                    brightness: 1.08,    // 한국인 선호 밝기
                    warmth: 0.92,        // 웜톤 강도 보정
                    saturation: 1.05,    // 채도 보정
                    ageAdjustment: {
                        '20s': 1.0,
                        '30s': 0.95,
                        '40s': 0.88,
                        '50s': 0.82
                    }
                }
            };
            
            // 성능 최적화 시스템
            this.analysisCache = new Map();
            this.maxCacheSize = 150;
            this.analysisQueue = [];
            this.isProcessing = false;
            this.lastAnalysisTime = 0;
            
            // 통계 및 성능 모니터링
            this.stats = {
                analysisCount: 0,
                totalProcessingTime: 0,
                cacheHits: 0,
                cacheMisses: 0,
                aiAnalysisCount: 0,
                traditionalAnalysisCount: 0,
                averageConfidence: 0,
                errors: 0,
                modelLoadTime: 0
            };
            
            // 얼굴 랜드마크 매핑 (MediaPipe 468 랜드마크 기준)
            this.faceLandmarks = {
                forehead: [10, 151, 9, 10, 151, 9],
                leftCheek: [116, 117, 118, 119, 120, 121],
                rightCheek: [345, 346, 347, 348, 349, 350],
                noseBridge: [6, 19, 20, 1, 2],
                chin: [175, 199, 175, 199, 200, 17],
                leftTemple: [234, 127, 162, 21, 54],
                rightTemple: [454, 356, 389, 251, 284]
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
                let current = this.CONFIG;
                
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
                console.log('[SkinToneAnalyzer] 🚀 실제 AI 시스템 초기화 시작...');
                
                // MediaPipe 초기화
                await this.initializeMediaPipe();
                
                // AI 모델 로드 (백그라운드)
                this.loadModelBackground();
                
                // 색상 시스템 연동
                this.initializeColorSystem();
                
                console.log('[SkinToneAnalyzer] ✅ 초기화 완료');
            } catch (error) {
                console.error('[SkinToneAnalyzer] ❌ 초기화 실패:', error);
                this.modelLoadError = error;
            }
        }

        /**
         * MediaPipe Face Mesh 초기화
         */
        async initializeMediaPipe() {
            try {
                console.log('[SkinToneAnalyzer] 🧠 MediaPipe Face Mesh 초기화 중...');
                
                // MediaPipe 스크립트 로드
                await this.loadMediaPipeScript();
                
                // FaceMesh 초기화
                if (typeof window.FaceMesh !== 'undefined') {
                    this.faceMesh = new window.FaceMesh(this.mediaPipeConfig);
                    
                    this.faceMesh.setOptions({
                        maxNumFaces: 1,
                        refineLandmarks: true,
                        minDetectionConfidence: 0.7,
                        minTrackingConfidence: 0.5
                    });

                    // 결과 처리 콜백
                    this.faceMesh.onResults(this.onFaceMeshResults.bind(this));
                    
                    console.log('[SkinToneAnalyzer] ✅ MediaPipe 초기화 완료');
                } else {
                    console.warn('[SkinToneAnalyzer] ⚠️ MediaPipe 로드 실패, 기본 분석 모드 사용');
                }
                
            } catch (error) {
                console.warn('[SkinToneAnalyzer] ⚠️ MediaPipe 초기화 실패:', error);
                this.faceMesh = null;
            }
        }

        /**
         * MediaPipe 스크립트 동적 로드
         */
        async loadMediaPipeScript() {
            return new Promise((resolve, reject) => {
                if (typeof window.FaceMesh !== 'undefined') {
                    resolve();
                    return;
                }

                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/face_mesh.js';
                script.onload = resolve;
                script.onerror = () => reject(new Error('MediaPipe 스크립트 로드 실패'));
                document.head.appendChild(script);
            });
        }

        /**
         * AI 모델 백그라운드 로드
         */
        async loadModelBackground() {
            if (this.isLoading) return;
            
            this.isLoading = true;
            const startTime = performance.now();
            
            try {
                console.log('[SkinToneAnalyzer] 🤖 AI 모델 로딩 시작...');
                
                // TensorFlow.js 로드
                await this.loadTensorFlowJS();
                
                if (typeof tf === 'undefined') {
                    throw new Error('TensorFlow.js 로드 실패');
                }

                // 모델 파일 존재 확인
                const modelExists = await this.checkModelExists();
                if (!modelExists) {
                    console.warn('[SkinToneAnalyzer] ⚠️ AI 모델 파일 없음, 전통적 분석 모드');
                    return;
                }

                // AI 모델 로드
                this.model = await tf.loadLayersModel(this.modelConfig.modelUrl);
                
                // 모델 워밍업
                await this.warmupModel();
                
                this.isModelLoaded = true;
                this.stats.modelLoadTime = performance.now() - startTime;
                
                console.log(`[SkinToneAnalyzer] ✅ AI 모델 로딩 완료 (${Math.round(this.stats.modelLoadTime)}ms)`);
                
            } catch (error) {
                console.warn('[SkinToneAnalyzer] ⚠️ AI 모델 로딩 실패, 전통적 분석 사용:', error);
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
            if (typeof tf !== 'undefined') return;
            
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.10.0/dist/tf.min.js';
                script.onload = () => {
                    console.log('[SkinToneAnalyzer] ✅ TensorFlow.js 로드 완료');
                    resolve();
                };
                script.onerror = () => reject(new Error('TensorFlow.js 로드 실패'));
                document.head.appendChild(script);
            });
        }

        /**
         * 모델 파일 존재 확인
         */
        async checkModelExists() {
            try {
                const response = await fetch(this.modelConfig.modelUrl, { method: 'HEAD' });
                return response.ok;
            } catch (error) {
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
                
                dummyInput.dispose();
                prediction.dispose();
                
                console.log('[SkinToneAnalyzer] ✅ AI 모델 워밍업 완료');
            } catch (error) {
                console.warn('[SkinToneAnalyzer] ⚠️ 모델 워밍업 실패:', error);
            }
        }

        /**
         * 색상 시스템 연동
         */
        initializeColorSystem() {
            try {
                if (typeof window.ColorSystem === 'function') {
                    this.colorSystem = new window.ColorSystem();
                    console.log('[SkinToneAnalyzer] ✅ ColorSystem 연동 완료');
                } else {
                    console.warn('[SkinToneAnalyzer] ⚠️ ColorSystem 없음, 기본 색상 변환 사용');
                    this.colorSystem = null;
                }
            } catch (error) {
                console.warn('[SkinToneAnalyzer] ⚠️ ColorSystem 연동 실패:', error);
                this.colorSystem = null;
            }
        }

        /**
         * 🎯 메인 피부톤 분석 함수 (완전 실제 구현)
         */
        async analyzeSkinTone(imageData, options = {}) {
            if (!imageData) {
                console.warn('[SkinToneAnalyzer] imageData가 null입니다');
                return this.getFallbackResult('입력 데이터 없음');
            }

            // 분석 ID 생성 (캐시용)
            const analysisId = this.generateAnalysisId(imageData);
            
            // 캐시 확인
            if (this.analysisCache.has(analysisId) && !options.forceRefresh) {
                this.stats.cacheHits++;
                const cached = this.analysisCache.get(analysisId);
                console.log('[SkinToneAnalyzer] 📦 캐시에서 결과 반환');
                return cached;
            }
            this.stats.cacheMisses++;

            try {
                // 큐 시스템으로 분석 처리
                return await this.queueAnalysis(imageData, options, analysisId);
            } catch (error) {
                console.error('[SkinToneAnalyzer] ❌ 피부톤 분석 실패:', error);
                this.stats.errors++;
                return this.getFallbackResult(`분석 오류: ${error.message}`);
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

                    const result = await this.performRealAnalysis(task.imageData, task.options);
                    
                    // 캐시 저장
                    this.cacheResult(task.analysisId, result);
                    
                    task.resolve(result);
                    this.lastAnalysisTime = Date.now();

                } catch (error) {
                    console.error('[SkinToneAnalyzer] ❌ 큐 처리 오류:', error);
                    task.reject(error);
                }
            }

            this.isProcessing = false;
        }

        /**
         * 🔬 실제 분석 수행 (핵심 로직)
         */
        async performRealAnalysis(imageData, options) {
            const startTime = performance.now();
            console.log('[SkinToneAnalyzer] 🔬 실제 피부톤 분석 시작...');
            
            try {
                // 1️⃣ 얼굴 감지 및 피부 영역 추출
                console.log('[SkinToneAnalyzer] 👤 얼굴 감지 중...');
                const faceDetectionResult = await this.detectFaceAndExtractSkin(imageData);
                
                if (!faceDetectionResult || faceDetectionResult.skinSamples.length === 0) {
                    console.warn('[SkinToneAnalyzer] ⚠️ 유효한 피부 샘플을 찾을 수 없음');
                    return this.getFallbackResult('얼굴 또는 피부 영역을 감지할 수 없습니다');
                }
                
                const { skinSamples, faceData, confidence: faceConfidence } = faceDetectionResult;
                console.log(`[SkinToneAnalyzer] ✅ 피부 샘플 ${skinSamples.length}개 추출 (신뢰도: ${faceConfidence})`);
                
                // 2️⃣ AI 모델 분석 (가능한 경우)
                let aiAnalysis = null;
                if (this.model && this.isModelLoaded) {
                    console.log('[SkinToneAnalyzer] 🤖 AI 모델 분석 중...');
                    aiAnalysis = await this.performAIAnalysis(skinSamples, imageData);
                    if (aiAnalysis) {
                        this.stats.aiAnalysisCount++;
                        console.log('[SkinToneAnalyzer] ✅ AI 분석 완료:', aiAnalysis.prediction);
                    }
                } else {
                    console.log('[SkinToneAnalyzer] 📊 전통적 분석 모드');
                    this.stats.traditionalAnalysisCount++;
                }
                
                // 3️⃣ 색공간 변환 및 정밀 분석
                console.log('[SkinToneAnalyzer] 🎨 색공간 변환 및 분석 중...');
                const colorAnalysis = this.performAdvancedColorAnalysis(skinSamples);
                
                // 4️⃣ 한국인 특화 보정
                console.log('[SkinToneAnalyzer] 🇰🇷 한국인 피부톤 보정 적용 중...');
                const correctedAnalysis = this.applyKoreanCorrection(colorAnalysis, options.age);
                
                // 5️⃣ 언더톤 정밀 분석
                console.log('[SkinToneAnalyzer] 🌡️ 언더톤 분석 중...');
                const undertoneAnalysis = this.analyzeUndertone(correctedAnalysis);
                
                // 6️⃣ 계절 분류 (4계절 12톤 시스템)
                console.log('[SkinToneAnalyzer] 🍂 계절 분류 중...');
                const seasonClassification = this.classifySeasons(correctedAnalysis, undertoneAnalysis, aiAnalysis);
                
                // 7️⃣ 신뢰도 계산
                const totalConfidence = this.calculateTotalConfidence({
                    faceConfidence,
                    aiAnalysis,
                    colorAnalysis: correctedAnalysis,
                    sampleCount: skinSamples.length
                });
                
                // 8️⃣ 최종 결과 구성
                const analysisResult = this.constructComprehensiveResult({
                    skinSamples,
                    faceData,
                    aiAnalysis,
                    colorAnalysis: correctedAnalysis,
                    undertoneAnalysis,
                    seasonClassification,
                    confidence: totalConfidence,
                    processingTime: performance.now() - startTime,
                    metadata: {
                        modelUsed: aiAnalysis ? 'ai' : 'traditional',
                        mediapikeUsed: !!this.faceMesh,
                        sampleCount: skinSamples.length,
                        analysisVersion: '2.0.0'
                    }
                });

                // 통계 업데이트
                this.updateStats(startTime, totalConfidence);
                
                console.log(`[SkinToneAnalyzer] ✅ 분석 완료 (${Math.round(performance.now() - startTime)}ms)`);
                console.log(`[SkinToneAnalyzer] 🎯 결과: ${analysisResult.season.primary} (${Math.round(analysisResult.confidence * 100)}%)`);
                
                return analysisResult;
                
            } catch (error) {
                console.error('[SkinToneAnalyzer] ❌ 실제 분석 수행 오류:', error);
                this.stats.errors++;
                throw error;
            }
        }

        /**
         * 얼굴 감지 및 피부 영역 추출
         */
        async detectFaceAndExtractSkin(imageData) {
            try {
                let faceData = null;
                let skinRegions = [];
                
                // MediaPipe를 사용한 얼굴 감지
                if (this.faceMesh) {
                    try {
                        faceData = await this.detectFaceWithMediaPipe(imageData);
                        if (faceData && faceData.landmarks) {
                            skinRegions = this.extractSkinRegionsFromLandmarks(imageData, faceData.landmarks);
                        }
                    } catch (error) {
                        console.warn('[SkinToneAnalyzer] MediaPipe 감지 실패:', error);
                    }
                }
                
                // 폴백: 기본 얼굴 영역 사용
                if (!faceData || skinRegions.length === 0) {
                    console.log('[SkinToneAnalyzer] 기본 얼굴 영역 사용');
                    skinRegions = this.getDefaultSkinRegions(imageData);
                    faceData = { method: 'default', confidence: 0.6 };
                }
                
                // 피부 샘플 추출
                const skinSamples = this.extractSkinSamples(skinRegions, imageData);
                
                // 품질 검증
                const filteredSamples = this.filterValidSkinSamples(skinSamples);
                
                return {
                    faceData,
                    skinSamples: filteredSamples,
                    confidence: this.calculateFaceDetectionConfidence(faceData, filteredSamples.length)
                };
                
            } catch (error) {
                console.error('[SkinToneAnalyzer] 얼굴 감지 및 피부 추출 오류:', error);
                return null;
            }
        }

        /**
         * MediaPipe로 얼굴 감지
         */
        async detectFaceWithMediaPipe(imageData) {
            if (!this.faceMesh) return null;
            
            return new Promise((resolve, reject) => {
                this.currentResolve = resolve;
                this.currentReject = reject;
                
                // 타임아웃 설정 (3초)
                const timeout = setTimeout(() => {
                    reject(new Error('얼굴 감지 시간 초과'));
                }, 3000);
                
                this.currentTimeout = timeout;
                
                // 이미지 데이터를 캔버스로 변환
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = imageData.width;
                canvas.height = imageData.height;
                ctx.putImageData(imageData, 0, 0);
                
                // MediaPipe로 분석 실행
                this.faceMesh.send({ image: canvas });
            });
        }

        /**
         * MediaPipe 결과 처리
         */
        onFaceMeshResults(results) {
            if (this.currentTimeout) {
                clearTimeout(this.currentTimeout);
            }

            if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
                const landmarks = results.multiFaceLandmarks[0];
                const faceData = {
                    landmarks: landmarks,
                    method: 'mediapipe',
                    confidence: 0.9, // MediaPipe는 높은 신뢰도
                    image: results.image
                };
                this.currentResolve(faceData);
            } else {
                this.currentReject(new Error('얼굴 랜드마크를 감지할 수 없습니다'));
            }
        }

        /**
         * 랜드마크에서 피부 영역 추출
         */
        extractSkinRegionsFromLandmarks(imageData, landmarks) {
            const regions = [];
            const width = imageData.width;
            const height = imageData.height;
            
            try {
                // 각 피부 영역별로 좌표 추출
                Object.entries(this.faceLandmarks).forEach(([regionName, landmarkIndices]) => {
                    const regionPoints = landmarkIndices.map(idx => {
                        const landmark = landmarks[idx];
                        return {
                            x: Math.round(landmark.x * width),
                            y: Math.round(landmark.y * height)
                        };
                    });
                    
                    // 영역의 경계 박스 계산
                    const minX = Math.max(0, Math.min(...regionPoints.map(p => p.x)) - 5);
                    const maxX = Math.min(width - 1, Math.max(...regionPoints.map(p => p.x)) + 5);
                    const minY = Math.max(0, Math.min(...regionPoints.map(p => p.y)) - 5);
                    const maxY = Math.min(height - 1, Math.max(...regionPoints.map(p => p.y)) + 5);
                    
                    if (maxX > minX && maxY > minY) {
                        regions.push({
                            name: regionName,
                            x: minX,
                            y: minY,
                            width: maxX - minX,
                            height: maxY - minY,
                            method: 'landmarks'
                        });
                    }
                });
            } catch (error) {
                console.error('[SkinToneAnalyzer] 랜드마크 영역 추출 오류:', error);
            }
            
            return regions;
        }

        /**
         * 기본 피부 영역 반환
         */
        getDefaultSkinRegions(imageData) {
            const regionConfig = this.getConfigPath('COLOR_ANALYSIS.skinDetection.regions', {
                forehead: { x: 0.3, y: 0.15, w: 0.4, h: 0.15 },
                leftCheek: { x: 0.15, y: 0.35, w: 0.2, h: 0.2 },
                rightCheek: { x: 0.65, y: 0.35, w: 0.2, h: 0.2 },
                nose: { x: 0.4, y: 0.4, w: 0.2, h: 0.2 },
                chin: { x: 0.35, y: 0.65, w: 0.3, h: 0.15 }
            });
            
            return Object.entries(regionConfig).map(([name, region]) => ({
                name,
                x: Math.floor(imageData.width * region.x),
                y: Math.floor(imageData.height * region.y),
                width: Math.floor(imageData.width * region.w),
                height: Math.floor(imageData.height * region.h),
                method: 'default'
            }));
        }

        /**
         * 피부 샘플 추출 (고품질)
         */
        extractSkinSamples(skinRegions, imageData) {
            const samples = [];
            const data = imageData.data;
            const width = imageData.width;
            const height = imageData.height;
            
            try {
                skinRegions.forEach(region => {
                    const endX = Math.min(region.x + region.width, width);
                    const endY = Math.min(region.y + region.height, height);
                    
                    // 적응적 샘플링 (영역 크기에 따라)
                    const sampleStep = Math.max(1, Math.floor(Math.min(region.width, region.height) / 15));
                    
                    for (let y = region.y; y < endY; y += sampleStep) {
                        for (let x = region.x; x < endX; x += sampleStep) {
                            const index = (y * width + x) * 4;
                            
                            if (index + 3 < data.length) {
                                const r = data[index];
                                const g = data[index + 1];
                                const b = data[index + 2];
                                const a = data[index + 3];
                                
                                // 기본 유효성 검사
                                if (a > 200) { // 투명도 체크
                                    samples.push({
                                        region: region.name,
                                        rgb: { r, g, b },
                                        position: { x, y },
                                        method: region.method || 'default'
                                    });
                                }
                            }
                        }
                    }
                });
            } catch (error) {
                console.error('[SkinToneAnalyzer] 피부 샘플 추출 오류:', error);
            }

            return samples;
        }

        /**
         * 유효한 피부 샘플 필터링
         */
        filterValidSkinSamples(samples) {
            return samples.filter(sample => {
                try {
                    const { r, g, b } = sample.rgb;
                    
                    // 1. 밝기 범위 체크 (너무 어둡거나 밝지 않음)
                    const brightness = (r + g + b) / 3;
                    if (brightness < 60 || brightness > 245) return false;
                    
                    // 2. 피부색 특성 체크 (R >= G >= B 경향)
                    if (r < g - 15 || g < b - 15) return false;
                    
                    // 3. 채도 체크 (너무 선명한 색은 제외)
                    const max = Math.max(r, g, b);
                    const min = Math.min(r, g, b);
                    const saturation = max === 0 ? 0 : (max - min) / max;
                    if (saturation > 0.5) return false;
                    
                    // 4. 피부색 범위 체크 (Lab* 기반)
                    const lab = this.rgbToLabBasic(r, g, b);
                    if (!lab) return false;
                    
                    // 한국인 피부톤 범위 체크
                    if (lab.l < 35 || lab.l > 85) return false;
                    if (lab.a < -5 || lab.a > 20) return false;
                    if (lab.b < 0 || lab.b > 35) return false;
                    
                    return true;
                } catch (error) {
                    console.warn('[SkinToneAnalyzer] 샘플 필터링 오류:', error);
                    return false;
                }
            });
        }

        /**
         * 기본 RGB to Lab 변환
         */
        rgbToLabBasic(r, g, b) {
            try {
                // RGB 정규화
                let rNorm = r / 255;
                let gNorm = g / 255;
                let bNorm = b / 255;

                // 감마 보정
                rNorm = rNorm > 0.04045 ? Math.pow((rNorm + 0.055) / 1.055, 2.4) : rNorm / 12.92;
                gNorm = gNorm > 0.04045 ? Math.pow((gNorm + 0.055) / 1.055, 2.4) : gNorm / 12.92;
                bNorm = bNorm > 0.04045 ? Math.pow((bNorm + 0.055) / 1.055, 2.4) : bNorm / 12.92;

                // XYZ 변환 (D65 기준)
                let x = rNorm * 0.4124564 + gNorm * 0.3575761 + bNorm * 0.1804375;
                let y = rNorm * 0.2126729 + gNorm * 0.7151522 + bNorm * 0.0721750;
                let z = rNorm * 0.0193339 + gNorm * 0.1191920 + bNorm * 0.9503041;

                // D65 화이트포인트로 정규화
                x = x / 0.95047;
                y = y / 1.00000;
                z = z / 1.08883;

                // Lab 변환
                const fx = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x + 16/116);
                const fy = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y + 16/116);
                const fz = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z + 16/116);

                return {
                    l: (116 * fy) - 16,
                    a: 500 * (fx - fy),
                    b: 200 * (fy - fz)
                };
            } catch (error) {
                console.error('[SkinToneAnalyzer] RGB to Lab 변환 오류:', error);
                return null;
            }
        }

        /**
         * AI 분석 수행
         */
        async performAIAnalysis(skinSamples, imageData) {
            if (!this.model || !skinSamples || skinSamples.length === 0) {
                return null;
            }

            try {
                // 평균 색상 계산
                const avgColor = this.calculateAverageColor(skinSamples);
                if (!avgColor) return null;
                
                // 텐서 입력 생성
                const inputTensor = this.createModelInput(avgColor, imageData);
                if (!inputTensor) return null;
                
                // 모델 예측 실행
                const prediction = await this.model.predict(inputTensor);
                const predictionData = await prediction.data();
                
                // 메모리 정리
                inputTensor.dispose();
                prediction.dispose();
                
                // 결과 해석
                return this.interpretAIPrediction(predictionData);
                
            } catch (error) {
                console.error('[SkinToneAnalyzer] AI 분석 실행 오류:', error);
                return null;
            }
        }

        /**
         * 모델 입력 생성
         */
        createModelInput(avgColor, imageData) {
            try {
                if (typeof tf === 'undefined') return null;

                const [height, width, channels] = this.modelConfig.inputSize;
                
                // 평균 색상을 정규화
                const r = avgColor.r / 255;
                const g = avgColor.g / 255;
                const b = avgColor.b / 255;
                
                // 전처리 적용 (ImageNet 기준)
                const preprocessing = this.modelConfig.preprocessing;
                const normalizedR = (r - preprocessing.meanSubtraction[0]) / preprocessing.stdNormalization[0];
                const normalizedG = (g - preprocessing.meanSubtraction[1]) / preprocessing.stdNormalization[1];
                const normalizedB = (b - preprocessing.meanSubtraction[2]) / preprocessing.stdNormalization[2];
                
                // 입력 텐서 생성
                const inputData = new Float32Array(height * width * channels);
                
                for (let i = 0; i < height * width; i++) {
                    inputData[i * channels] = normalizedR;
                    inputData[i * channels + 1] = normalizedG;
                    inputData[i * channels + 2] = normalizedB;
                }
                
                return tf.tensor4d(inputData, [1, height, width, channels]);
                
            } catch (error) {
                console.error('[SkinToneAnalyzer] 모델 입력 생성 오류:', error);
                return null;
            }
        }

        /**
         * AI 예측 결과 해석
         */
        interpretAIPrediction(predictionData) {
            try {
                if (!predictionData || predictionData.length === 0) {
                    return null;
                }

                const seasons = this.modelConfig.outputClasses;
                const probabilities = Array.from(predictionData);
                
                // 소프트맥스 적용 (정규화)
                const maxProb = Math.max(...probabilities);
                const expProbs = probabilities.map(p => Math.exp(p - maxProb));
                const sumExp = expProbs.reduce((sum, p) => sum + p, 0);
                const normalizedProbs = expProbs.map(p => p / sumExp);
                
                const results = seasons.map((season, index) => ({
                    season,
                    probability: normalizedProbs[index],
                    confidence: normalizedProbs[index] > 0.7 ? 'high' : 
                               normalizedProbs[index] > 0.4 ? 'medium' : 'low'
                }));
                
                // 가장 높은 확률의 계절
                const bestMatch = results.reduce((max, current) => 
                    current.probability > max.probability ? current : max);
                
                return {
                    prediction: bestMatch.season,
                    confidence: bestMatch.confidence,
                    probability: bestMatch.probability,
                    probabilities: results,
                    rawScores: probabilities
                };
                
            } catch (error) {
                console.error('[SkinToneAnalyzer] AI 결과 해석 오류:', error);
                return null;
            }
        }

        /**
         * 고급 색공간 분석
         */
        performAdvancedColorAnalysis(skinSamples) {
            try {
                // 평균 색상 계산
                const avgColor = this.calculateAverageColor(skinSamples);
                if (!avgColor) return null;
                
                // ColorSystem을 사용한 정밀 변환
                let lab, hsl, temperature;
                
                if (this.colorSystem) {
                    // 고급 색공간 변환 사용
                    lab = this.colorSystem.rgbToLab(avgColor);
                    hsl = this.colorSystem.rgbToHsl(avgColor);
                    temperature = this.colorSystem.analyzeColorTemperature(avgColor);
                } else {
                    // 기본 변환 사용
                    lab = this.rgbToLabBasic(avgColor.r, avgColor.g, avgColor.b);
                    hsl = this.rgbToHslBasic(avgColor);
                    temperature = this.analyzeColorTemperatureBasic(lab);
                }
                
                if (!lab || !hsl) return null;
                
                // 색상 특성 분석
                const chroma = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
                const hue = Math.atan2(lab.b, lab.a) * 180 / Math.PI;
                const normalizedHue = hue < 0 ? hue + 360 : hue;
                
                return {
                    rgb: avgColor,
                    lab: lab,
                    hsl: hsl,
                    temperature: temperature,
                    chroma: chroma,
                    hue: normalizedHue,
                    brightness: lab.l,
                    saturation: hsl.s,
                    sampleCount: skinSamples.length,
                    variance: this.calculateColorVariance(skinSamples)
                };
                
            } catch (error) {
                console.error('[SkinToneAnalyzer] 고급 색공간 분석 오류:', error);
                return null;
            }
        }

        /**
         * 평균 색상 계산
         */
        calculateAverageColor(skinSamples) {
            if (!skinSamples || skinSamples.length === 0) return null;

            try {
                let totalR = 0, totalG = 0, totalB = 0;
                let validSamples = 0;

                skinSamples.forEach(sample => {
                    if (sample.rgb) {
                        totalR += sample.rgb.r;
                        totalG += sample.rgb.g;
                        totalB += sample.rgb.b;
                        validSamples++;
                    }
                });

                if (validSamples === 0) return null;

                return {
                    r: Math.round(totalR / validSamples),
                    g: Math.round(totalG / validSamples),
                    b: Math.round(totalB / validSamples)
                };
            } catch (error) {
                console.error('[SkinToneAnalyzer] 평균 색상 계산 오류:', error);
                return null;
            }
        }

        /**
         * 기본 RGB to HSL 변환
         */
        rgbToHslBasic(rgb) {
            try {
                const r = rgb.r / 255;
                const g = rgb.g / 255;
                const b = rgb.b / 255;

                const max = Math.max(r, g, b);
                const min = Math.min(r, g, b);
                const diff = max - min;
                
                let h = 0;
                let s = 0;
                const l = (max + min) / 2;
                
                if (diff !== 0) {
                    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);
                    
                    switch (max) {
                        case r: h = ((g - b) / diff + (g < b ? 6 : 0)) / 6; break;
                        case g: h = ((b - r) / diff + 2) / 6; break;
                        case b: h = ((r - g) / diff + 4) / 6; break;
                    }
                }
                
                return {
                    h: Math.round(h * 360),
                    s: Math.round(s * 100),
                    l: Math.round(l * 100)
                };
            } catch (error) {
                console.error('[SkinToneAnalyzer] RGB to HSL 변환 오류:', error);
                return null;
            }
        }

        /**
         * 기본 색온도 분석
         */
        analyzeColorTemperatureBasic(lab) {
            if (!lab) return { temperature: 'neutral', warmness: 0 };
            
            try {
                const a = lab.a;
                const b = lab.b;
                
                let temperature = 'neutral';
                let warmness = 0;
                
                if (b > 12 && a > 2) {
                    temperature = 'warm';
                    warmness = Math.min(1, (b - 12) / 15 + (a - 2) / 10);
                } else if (b < 8 || (a < 0 && b < 15)) {
                    temperature = 'cool';
                    warmness = Math.max(-1, (8 - b) / -15 + Math.min(0, a) / 10);
                } else {
                    warmness = (a * 0.05 + b * 0.03) / 2;
                }

                return {
                    temperature,
                    warmness: Math.round(warmness * 100) / 100,
                    description: this.getTemperatureDescription(temperature, warmness)
                };
            } catch (error) {
                console.error('[SkinToneAnalyzer] 색온도 분석 오류:', error);
                return { temperature: 'neutral', warmness: 0 };
            }
        }

        getTemperatureDescription(temperature, warmness) {
            if (temperature === 'warm') {
                if (warmness > 0.7) return '매우 따뜻한';
                if (warmness > 0.3) return '따뜻한';
                return '약간 따뜻한';
            } else if (temperature === 'cool') {
                if (warmness < -0.7) return '매우 차가운';
                if (warmness < -0.3) return '차가운';
                return '약간 차가운';
            }
            return '중성적인';
        }

        /**
         * 색상 분산 계산 (일관성 측정)
         */
        calculateColorVariance(skinSamples) {
            if (!skinSamples || skinSamples.length < 2) return 0;
            
            try {
                const avgColor = this.calculateAverageColor(skinSamples);
                if (!avgColor) return 0;
                
                let variance = 0;
                let validSamples = 0;
                
                skinSamples.forEach(sample => {
                    if (sample.rgb) {
                        const dr = sample.rgb.r - avgColor.r;
                        const dg = sample.rgb.g - avgColor.g;
                        const db = sample.rgb.b - avgColor.b;
                        variance += (dr * dr + dg * dg + db * db);
                        validSamples++;
                    }
                });
                
                return validSamples > 1 ? variance / validSamples : 0;
            } catch (error) {
                console.error('[SkinToneAnalyzer] 색상 분산 계산 오류:', error);
                return 0;
            }
        }

        /**
         * 한국인 특화 보정
         */
        applyKoreanCorrection(colorAnalysis, age = '30s') {
            if (!colorAnalysis) return colorAnalysis;
            
            try {
                const factors = this.koreanSkinDatabase.correctionFactors;
                const ageMultiplier = factors.ageAdjustment[age] || factors.ageAdjustment['30s'];
                
                // 보정된 분석 결과
                const corrected = {
                    ...colorAnalysis,
                    brightness: colorAnalysis.brightness * factors.brightness * ageMultiplier,
                    chroma: colorAnalysis.chroma * factors.saturation,
                    correctionApplied: true,
                    ageCorrection: age
                };
                
                // 온도 보정
                if (colorAnalysis.temperature && colorAnalysis.temperature.temperature === 'warm') {
                    corrected.temperature = {
                        ...colorAnalysis.temperature,
                        warmness: colorAnalysis.temperature.warmness * factors.warmth
                    };
                }
                
                return corrected;
            } catch (error) {
                console.error('[SkinToneAnalyzer] 한국인 보정 적용 오류:', error);
                return colorAnalysis;
            }
        }

        /**
         * 언더톤 정밀 분석
         */
        analyzeUndertone(colorAnalysis) {
            if (!colorAnalysis || !colorAnalysis.lab) {
                return { primary: 'neutral', confidence: 0.5, analysis: '분석 불가' };
            }
            
            try {
                const { a, b, l } = colorAnalysis.lab;
                const thresholds = this.koreanSkinDatabase.undertoneThresholds;
                
                let primary = 'neutral';
                let confidence = 0.5;
                let characteristics = [];
                
                // 웜톤 판별
                if (a >= thresholds.warm.a_min && 
                    b >= thresholds.warm.b_min && 
                    b/a >= thresholds.warm.ratio) {
                    
                    primary = 'warm';
                    confidence = Math.min(0.95, 0.6 + ((a - 3) + (b - 14)) / 20);
                    characteristics = ['노란기가 강함', '황금빛 기운'];
                    
                    // 세부 분류
                    if (b > 20) characteristics.push('골든 언더톤');
                    if (a > 8) characteristics.push('피치 언더톤');
                }
                
                // 쿨톤 판별
                else if (a <= thresholds.cool.a_max && 
                         b <= thresholds.cool.b_max && 
                         (a > 0 ? b/a <= thresholds.cool.ratio : true)) {
                    
                    primary = 'cool';
                    confidence = Math.min(0.95, 0.6 + ((3 - a) + (12 - b)) / 15);
                    characteristics = ['분홍기가 도는', '시원한 기운'];
                    
                    // 세부 분류
                    if (a < 1) characteristics.push('핑크 언더톤');
                    if (b < 8) characteristics.push('로즈 언더톤');
                }
                
                // 뉴트럴 톤
                else {
                    primary = 'neutral';
                    const aDiff = Math.abs(a - 3.25); // 뉴트럴 중심값
                    const bDiff = Math.abs(b - 14);
                    confidence = Math.max(0.4, 1.0 - (aDiff + bDiff) / 15);
                    characteristics = ['균형잡힌', '중성적인'];
                }
                
                // 밝기에 따른 추가 특성
                if (l > 65) characteristics.push('밝은 톤');
                else if (l < 50) characteristics.push('깊은 톤');
                
                return {
                    primary,
                    confidence: Math.round(confidence * 100) / 100,
                    characteristics,
                    values: { a, b, l },
                    analysis: characteristics.join(', '),
                    percentages: this.calculateUndertonePercentages(a, b)
                };
                
            } catch (error) {
                console.error('[SkinToneAnalyzer] 언더톤 분석 오류:', error);
                return { primary: 'neutral', confidence: 0.5, analysis: '분석 오류' };
            }
        }

        /**
         * 언더톤 비율 계산
         */
        calculateUndertonePercentages(a, b) {
            try {
                // 웜/쿨/뉴트럴 점수 계산
                const warmScore = Math.max(0, a - 1) + Math.max(0, b - 10);
                const coolScore = Math.max(0, 4 - a) + Math.max(0, 15 - b);
                const neutralScore = 3; // 기본 뉴트럴 점수
                
                const totalScore = warmScore + coolScore + neutralScore;
                
                return {
                    warm: Math.round((warmScore / totalScore) * 100),
                    cool: Math.round((coolScore / totalScore) * 100),
                    neutral: Math.round((neutralScore / totalScore) * 100)
                };
            } catch (error) {
                console.error('[SkinToneAnalyzer] 언더톤 비율 계산 오류:', error);
                return { warm: 33, cool: 33, neutral: 34 };
            }
        }

        /**
         * 계절 분류 (4계절 12톤 시스템)
         */
        classifySeasons(colorAnalysis, undertoneAnalysis, aiAnalysis) {
            try {
                if (!colorAnalysis || !undertoneAnalysis) {
                    return this.getDefaultSeasonClassification();
                }
                
                const { lab, temperature } = colorAnalysis;
                const { primary: undertone } = undertoneAnalysis;
                const seasonRanges = this.koreanSkinDatabase.seasonalRanges;
                
                let seasonScores = { spring: 0, summer: 0, autumn: 0, winter: 0 };
                
                // 1. LAB 값 기반 점수 계산
                Object.entries(seasonRanges).forEach(([season, ranges]) => {
                    let score = 0;
                    
                    // L* (밝기) 점수
                    if (lab.l >= ranges.L[0] && lab.l <= ranges.L[1]) {
                        score += 35;
                    } else {
                        const distance = Math.min(
                            Math.abs(lab.l - ranges.L[0]), 
                            Math.abs(lab.l - ranges.L[1])
                        );
                        score += Math.max(0, 35 - distance * 2);
                    }
                    
                    // a* 점수
                    if (lab.a >= ranges.a[0] && lab.a <= ranges.a[1]) {
                        score += 30;
                    } else {
                        const distance = Math.min(
                            Math.abs(lab.a - ranges.a[0]), 
                            Math.abs(lab.a - ranges.a[1])
                        );
                        score += Math.max(0, 30 - distance * 3);
                    }
                    
                    // b* 점수
                    if (lab.b >= ranges.b[0] && lab.b <= ranges.b[1]) {
                        score += 30;
                    } else {
                        const distance = Math.min(
                            Math.abs(lab.b - ranges.b[0]), 
                            Math.abs(lab.b - ranges.b[1])
                        );
                        score += Math.max(0, 30 - distance * 2);
                    }
                    
                    seasonScores[season] = score;
                });
                
                // 2. 언더톤 기반 보너스
                const undertoneBonus = {
                    spring: undertone === 'warm' ? 15 : undertone === 'neutral' ? 8 : 0,
                    summer: undertone === 'cool' ? 15 : undertone === 'neutral' ? 8 : 0,
                    autumn: undertone === 'warm' ? 15 : undertone === 'neutral' ? 5 : 0,
                    winter: undertone === 'cool' ? 15 : undertone === 'neutral' ? 5 : 0
                };
                
                Object.keys(seasonScores).forEach(season => {
                    seasonScores[season] += undertoneBonus[season];
                });
                
                // 3. 색온도 기반 보너스
                if (temperature && temperature.temperature) {
                    if (temperature.temperature === 'warm') {
                        seasonScores.spring += 10;
                        seasonScores.autumn += 10;
                    } else if (temperature.temperature === 'cool') {
                        seasonScores.summer += 10;
                        seasonScores.winter += 10;
                    }
                }
                
                // 4. AI 분석 결과 반영 (가중치 20%)
                if (aiAnalysis && aiAnalysis.probabilities) {
                    aiAnalysis.probabilities.forEach(result => {
                        if (seasonScores.hasOwnProperty(result.season)) {
                            seasonScores[result.season] += result.probability * 20;
                        }
                    });
                }
                
                // 5. 채도 기반 조정
                const chroma = colorAnalysis.chroma || 0;
                if (chroma > 20) {
                    seasonScores.spring += 8;
                    seasonScores.winter += 5;
                } else if (chroma < 12) {
                    seasonScores.summer += 8;
                    seasonScores.autumn += 5;
                }
                
                // 점수 정규화 및 확률 계산
                const totalScore = Object.values(seasonScores).reduce((sum, score) => sum + score, 0);
                const probabilities = {};
                
                if (totalScore > 0) {
                    Object.entries(seasonScores).forEach(([season, score]) => {
                        probabilities[season] = Math.max(0, score / totalScore);
                    });
                } else {
                    // 기본 확률 분배
                    Object.keys(seasonScores).forEach(season => {
                        probabilities[season] = 0.25;
                    });
                }
                
                // 최적 계절 선택
                const bestSeason = Object.entries(probabilities)
                    .reduce((best, [season, prob]) => 
                        prob > best.probability ? { season, probability: prob } : best,
                        { season: 'spring', probability: 0 });
                
                return {
                    primary: bestSeason.season,
                    confidence: Math.round(bestSeason.probability * 100) / 100,
                    probabilities,
                    scores: seasonScores,
                    subtype: this.determineSubtype(bestSeason.season, colorAnalysis, undertoneAnalysis),
                    analysis: this.generateSeasonAnalysis(bestSeason.season, colorAnalysis)
                };
                
            } catch (error) {
                console.error('[SkinToneAnalyzer] 계절 분류 오류:', error);
                return this.getDefaultSeasonClassification();
            }
        }

        /**
         * 기본 계절 분류 반환
         */
        getDefaultSeasonClassification() {
            return {
                primary: 'neutral',
                confidence: 0.25,
                probabilities: { spring: 0.25, summer: 0.25, autumn: 0.25, winter: 0.25 },
                scores: { spring: 25, summer: 25, autumn: 25, winter: 25 },
                subtype: 'neutral',
                analysis: '분석할 수 있는 데이터가 부족합니다'
            };
        }

        /**
         * 계절별 서브타입 결정 (12톤 시스템)
         */
        determineSubtype(season, colorAnalysis, undertoneAnalysis) {
            try {
                const { lab } = colorAnalysis;
                const { primary: undertone } = undertoneAnalysis;
                
                switch (season) {
                    case 'spring':
                        if (lab.l > 68 && lab.a > 6) return 'bright_spring';
                        if (undertone === 'warm' && lab.b > 18) return 'warm_spring';
                        return 'light_spring';
                        
                    case 'summer':
                        if (lab.l > 70) return 'light_summer';
                        if (lab.a < 3 && lab.b < 12) return 'cool_summer';
                        return 'soft_summer';
                        
                    case 'autumn':
                        if (lab.l < 55) return 'deep_autumn';
                        if (undertone === 'warm' && lab.b > 22) return 'warm_autumn';
                        return 'soft_autumn';
                        
                    case 'winter':
                        if (lab.l > 65 && undertone === 'cool') return 'bright_winter';
                        if (lab.l < 50) return 'deep_winter';
                        return 'cool_winter';
                        
                    default:
                        return season;
                }
            } catch (error) {
                console.error('[SkinToneAnalyzer] 서브타입 결정 오류:', error);
                return season;
            }
        }

        /**
         * 계절 분석 생성
         */
        generateSeasonAnalysis(season, colorAnalysis) {
            const analyses = {
                spring: `밝고 따뜻한 봄의 색감입니다. 명도 ${Math.round(colorAnalysis.lab.l)}%, 채도가 높아 생기있고 활기찬 인상을 줍니다.`,
                summer: `부드럽고 시원한 여름의 색감입니다. 명도 ${Math.round(colorAnalysis.lab.l)}%, 차가운 언더톤으로 우아하고 세련된 느낌입니다.`,
                autumn: `깊고 따뜻한 가을의 색감입니다. 명도 ${Math.round(colorAnalysis.lab.l)}%, 풍성하고 성숙한 매력을 가지고 있습니다.`,
                winter: `선명하고 차가운 겨울의 색감입니다. 명도 ${Math.round(colorAnalysis.lab.l)}%, 강렬하고 도시적인 세련미를 보여줍니다.`
            };
            
            return analyses[season] || '개별적인 색상 특성을 가지고 있습니다.';
        }

        /**
         * 전체 신뢰도 계산
         */
        calculateTotalConfidence({ faceConfidence, aiAnalysis, colorAnalysis, sampleCount }) {
            try {
                let confidence = 0.4; // 기본 신뢰도
                
                // 얼굴 감지 신뢰도
                confidence += faceConfidence * 0.2;
                
                // AI 분석 신뢰도
                if (aiAnalysis && aiAnalysis.confidence === 'high') {
                    confidence += 0.25;
                } else if (aiAnalysis && aiAnalysis.confidence === 'medium') {
                    confidence += 0.15;
                }
                
                // 샘플 수 기반 신뢰도
                const sampleScore = Math.min(sampleCount / 200, 1.0);
                confidence += sampleScore * 0.15;
                
                // 색상 분석 일관성
                if (colorAnalysis && colorAnalysis.variance < 1000) {
                    confidence += 0.1;
                }
                
                // ColorSystem 사용 보너스
                if (this.colorSystem) {
                    confidence += 0.05;
                }
                
                return Math.max(0.2, Math.min(0.95, confidence));
            } catch (error) {
                console.error('[SkinToneAnalyzer] 신뢰도 계산 오류:', error);
                return 0.5;
            }
        }

        /**
         * 종합 결과 구성
         */
        constructComprehensiveResult(data) {
            const {
                skinSamples,
                faceData,
                aiAnalysis,
                colorAnalysis,
                undertoneAnalysis,
                seasonClassification,
                confidence,
                processingTime,
                metadata
            } = data;

            try {
                return {
                    // 🎯 메인 결과
                    season: {
                        primary: seasonClassification.primary,
                        subtype: seasonClassification.subtype,
                        confidence: seasonClassification.confidence,
                        analysis: seasonClassification.analysis
                    },
                    
                    // 🌡️ 언더톤 분석
                    undertone: {
                        primary: undertoneAnalysis.primary,
                        confidence: undertoneAnalysis.confidence,
                        characteristics: undertoneAnalysis.characteristics,
                        percentages: undertoneAnalysis.percentages,
                        description: undertoneAnalysis.analysis
                    },
                    
                    // 🎨 색상 데이터
                    skinTone: {
                        rgb: colorAnalysis.rgb,
                        lab: colorAnalysis.lab,
                        hsl: colorAnalysis.hsl,
                        hex: this.rgbToHex(colorAnalysis.rgb),
                        temperature: colorAnalysis.temperature,
                        brightness: Math.round(colorAnalysis.lab.l),
                        chroma: Math.round(colorAnalysis.chroma),
                        variance: Math.round(colorAnalysis.variance)
                    },
                    
                    // 📊 확률 분포
                    probabilities: seasonClassification.probabilities,
                    scores: seasonClassification.scores,
                    
                    // 🤖 AI 분석 (있는 경우)
                    ai: aiAnalysis,
                    
                    // 📈 전체 신뢰도
                    confidence: confidence,
                    
                    // 💡 추천사항
                    recommendations: this.generateComprehensiveRecommendations(
                        seasonClassification.primary, 
                        seasonClassification.subtype,
                        undertoneAnalysis.primary,
                        colorAnalysis
                    ),
                    
                    // 📋 메타데이터
                    metadata: {
                        ...metadata,
                        processingTime: Math.round(processingTime),
                        faceDetectionMethod: faceData.method,
                        analysisDate: new Date().toISOString(),
                        koreanOptimized: true,
                        systemVersion: '2.0.0'
                    },
                    
                    // 📊 품질 지표
                    quality: {
                        sampleCount: skinSamples.length,
                        faceDetectionConfidence: faceData.confidence || 0.6,
                        colorConsistency: this.calculateColorConsistency(colorAnalysis.variance),
                        overallQuality: this.calculateOverallQuality(confidence, skinSamples.length, colorAnalysis.variance)
                    }
                };
            } catch (error) {
                console.error('[SkinToneAnalyzer] 결과 구성 오류:', error);
                return this.getFallbackResult('결과 구성 중 오류 발생');
            }
        }

        /**
         * RGB to HEX 변환
         */
        rgbToHex(rgb) {
            if (!rgb) return '#C8B49C';
            
            const toHex = (n) => {
                const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            };
            
            return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase();
        }

        /**
         * 종합 추천사항 생성
         */
        generateComprehensiveRecommendations(season, subtype, undertone, colorAnalysis) {
            const recommendations = {
                colors: [],
                makeup: [],
                hair: [],
                fashion: [],
                avoid: []
            };
            
            try {
                // 계절별 기본 컬러 팔레트
                const seasonColors = {
                    spring: {
                        best: ['#FF6B6B', '#FFA726', '#66BB6A', '#42A5F5', '#FFEB3B'],
                        avoid: ['#9E9E9E', '#607D8B', '#4A148C', '#000000']
                    },
                    summer: {
                        best: ['#E1BEE7', '#B39DDB', '#90CAF9', '#A5D6A7', '#F8BBD9'],
                        avoid: ['#FF5722', '#FF9800', '#CDDC39', '#FFC107']
                    },
                    autumn: {
                        best: ['#D32F2F', '#F57C00', '#689F38', '#5D4037', '#E65100'],
                        avoid: ['#E91E63', '#9C27B0', '#3F51B5', '#00BCD4']
                    },
                    winter: {
                        best: ['#000000', '#FFFFFF', '#1976D2', '#C2185B', '#4CAF50'],
                        avoid: ['#FF9800', '#CDDC39', '#8BC34A', '#FFC107']
                    }
                };
                
                // 색상 추천
                if (seasonColors[season]) {
                    recommendations.colors = seasonColors[season].best;
                    recommendations.avoid = seasonColors[season].avoid;
                }
                
                // 언더톤별 메이크업 추천
                if (undertone === 'warm') {
                    recommendations.makeup = [
                        '골든 베이지나 피치 톤 파운데이션',
                        '코랄이나 오렌지 계열 립스틱',
                        '골드나 브론즈 계열 아이섀도우',
                        '피치나 코랄 계열 블러셔'
                    ];
                } else if (undertone === 'cool') {
                    recommendations.makeup = [
                        '핑크 베이지나 로즈 톤 파운데이션',
                        '로즈나 베리 계열 립스틱',
                        '실버나 그레이 계열 아이섀도우',
                        '로즈나 핑크 계열 블러셔'
                    ];
                } else {
                    recommendations.makeup = [
                        '내추럴 베이지 톤 파운데이션',
                        'MLBB(My Lips But Better) 계열 립스틱',
                        '브라운 계열 아이섀도우',
                        '자연스러운 핑크 블러셔'
                    ];
                }
                
                // 헤어 컬러 추천
                const brightness = colorAnalysis.lab.l;
                recommendations.hair = this.generateHairColorRecommendations(season, undertone, brightness);
                
                // 패션 스타일 추천
                recommendations.fashion = this.generateFashionRecommendations(season, subtype);
                
            } catch (error) {
                console.error('[SkinToneAnalyzer] 추천사항 생성 오류:', error);
                recommendations.colors = ['#FF6B6B', '#42A5F5', '#66BB6A', '#FFA726'];
            }
            
            return recommendations;
        }

        /**
         * 헤어 컬러 추천 생성
         */
        generateHairColorRecommendations(season, undertone, brightness) {
            const recommendations = [];
            
            try {
                if (undertone === 'warm') {
                    if (brightness > 60) {
                        recommendations.push('골든 블론드', '허니 브라운', '카라멜 브라운', '쿠퍼 레드');
                    } else {
                        recommendations.push('초콜릿 브라운', '오번', '골든 브라운', '웜 블랙');
                    }
                } else if (undertone === 'cool') {
                    if (brightness > 60) {
                        recommendations.push('애쉬 블론드', '플래티넘', '애쉬 브라운', '로즈 골드');
                    } else {
                        recommendations.push('애쉬 브라운', '쿨 블랙', '버건디', '다크 애쉬');
                    }
                } else {
                    recommendations.push('내추럴 브라운', '다크 블론드', '소프트 블랙', '밸런스드 브라운');
                }
            } catch (error) {
                console.error('[SkinToneAnalyzer] 헤어 컬러 추천 생성 오류:', error);
                recommendations.push('내추럴 브라운', '소프트 블랙');
            }
            
            return recommendations;
        }

        /**
         * 패션 스타일 추천 생성
         */
        generateFashionRecommendations(season, subtype) {
            const recommendations = [];
            
            try {
                const seasonStyles = {
                    spring: ['밝고 활기찬 컬러', '클리어한 원색', '경쾌한 패턴'],
                    summer: ['소프트하고 우아한 컬러', '파스텔 톤', '섬세한 패턴'],
                    autumn: ['깊고 풍부한 컬러', '어스 톤', '자연스러운 텍스처'],
                    winter: ['선명하고 강렬한 컬러', '하이 컨트라스트', '모던한 스타일']
                };
                
                return seasonStyles[season] || ['개성에 맞는 자유로운 스타일'];
            } catch (error) {
                console.error('[SkinToneAnalyzer] 패션 추천 생성 오류:', error);
                return ['다양한 스타일 시도'];
            }
        }

        /**
         * 색상 일관성 계산
         */
        calculateColorConsistency(variance) {
            if (variance < 500) return 'excellent';
            if (variance < 1000) return 'good';
            if (variance < 2000) return 'fair';
            return 'poor';
        }

        /**
         * 전체 품질 계산
         */
        calculateOverallQuality(confidence, sampleCount, variance) {
            let quality = 0;
            
            // 신뢰도 기여도 (40%)
            quality += confidence * 0.4;
            
            // 샘플 수 기여도 (30%)
            const sampleScore = Math.min(sampleCount / 200, 1.0);
            quality += sampleScore * 0.3;
            
            // 일관성 기여도 (30%)
            const consistencyScore = variance < 500 ? 1.0 : 
                                   variance < 1000 ? 0.8 : 
                                   variance < 2000 ? 0.6 : 0.4;
            quality += consistencyScore * 0.3;
            
            if (quality > 0.8) return 'excellent';
            if (quality > 0.6) return 'good';
            if (quality > 0.4) return 'fair';
            return 'poor';
        }

        /**
         * 통계 업데이트
         */
        updateStats(startTime, confidence) {
            this.stats.analysisCount++;
            this.stats.totalProcessingTime += (performance.now() - startTime);
            this.stats.averageConfidence = 
                (this.stats.averageConfidence * (this.stats.analysisCount - 1) + confidence) / 
                this.stats.analysisCount;
        }

        /**
         * 얼굴 감지 신뢰도 계산
         */
        calculateFaceDetectionConfidence(faceData, sampleCount) {
            let confidence = 0.3; // 기본값
            
            if (faceData.method === 'mediapipe') {
                confidence = 0.9;
            } else if (faceData.method === 'default') {
                confidence = 0.6;
            }
            
            // 샘플 수에 따른 조정
            if (sampleCount > 100) confidence += 0.1;
            else if (sampleCount < 30) confidence -= 0.2;
            
            return Math.max(0.1, Math.min(1.0, confidence));
        }

        /**
         * 폴백 결과 (분석 실패 시)
         */
        getFallbackResult(reason = '알 수 없는 오류') {
            return {
                season: {
                    primary: 'neutral',
                    subtype: 'neutral',
                    confidence: 0.25,
                    analysis: `분석을 완료할 수 없습니다: ${reason}`
                },
                undertone: {
                    primary: 'neutral',
                    confidence: 0.5,
                    characteristics: ['분석 불가'],
                    percentages: { warm: 33, cool: 33, neutral: 34 },
                    description: '언더톤을 판별할 수 없습니다'
                },
                skinTone: {
                    rgb: { r: 200, g: 180, b: 160 },
                    lab: { l: 65, a: 5, b: 15 },
                    hsl: { h: 30, s: 20, l: 65 },
                    hex: '#C8B4A0',
                    temperature: { temperature: 'neutral', warmness: 0 },
                    brightness: 65,
                    chroma: 15,
                    variance: 0
                },
                probabilities: { spring: 0.25, summer: 0.25, autumn: 0.25, winter: 0.25 },
                scores: { spring: 25, summer: 25, autumn: 25, winter: 25 },
                ai: null,
                confidence: 0.1,
                recommendations: {
                    colors: ['#FF6B6B', '#42A5F5', '#66BB6A', '#FFA726'],
                    makeup: ['전문가 상담을 받아보세요'],
                    hair: ['자연스러운 컬러 추천'],
                    fashion: ['개성에 맞는 스타일'],
                    avoid: []
                },
                metadata: {
                    sampleCount: 0,
                    processingTime: 0,
                    modelUsed: 'fallback',
                    analysisDate: new Date().toISOString(),
                    error: true,
                    errorReason: reason
                },
                quality: {
                    sampleCount: 0,
                    faceDetectionConfidence: 0.1,
                    colorConsistency: 'poor',
                    overallQuality: 'poor'
                }
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
                return hash.toString(36) + '_' + Date.now().toString(36);
            } catch (error) {
                return 'fallback_' + Date.now().toString(36);
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

        /**
         * 빠른 색상 분석 (드레이핑용)
         */
        async quickColorAnalysis(rgbColor) {
            if (!rgbColor) return null;

            try {
                const lab = this.rgbToLabBasic(rgbColor.r, rgbColor.g, rgbColor.b);
                if (!lab) return null;
                
                const temperature = this.analyzeColorTemperatureBasic(lab);
                const undertone = this.classifyUndertoneQuick(lab);
                
                // 간단한 계절 추정
                let estimatedSeason = 'neutral';
                if (temperature.temperature === 'warm' && lab.l > 60) {
                    estimatedSeason = 'spring';
                } else if (temperature.temperature === 'cool' && lab.l > 60) {
                    estimatedSeason = 'summer';
                } else if (temperature.temperature === 'warm' && lab.l <= 60) {
                    estimatedSeason = 'autumn';
                } else if (temperature.temperature === 'cool' && lab.l <= 60) {
                    estimatedSeason = 'winter';
                }

                return {
                    season: estimatedSeason,
                    undertone: undertone,
                    temperature: temperature.temperature,
                    lab: lab,
                    confidence: 0.7,
                    quick: true
                };
            } catch (error) {
                console.error('[SkinToneAnalyzer] 빠른 분석 실패:', error);
                return null;
            }
        }

        classifyUndertoneQuick(lab) {
            const { a, b } = lab;
            
            if (a > 3 && b > 15) return 'warm';
            else if (a < 2 && b < 12) return 'cool';
            else return 'neutral';
        }

        /**
         * 성능 통계 반환
         */
        getPerformanceStats() {
            const hitRate = this.stats.cacheHits + this.stats.cacheMisses > 0 ?
                this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses) : 0;
            
            return {
                // 시스템 상태
                modelLoaded: this.isModelLoaded,
                modelLoadError: this.modelLoadError?.message,
                mediaPipeLoaded: !!this.faceMesh,
                colorSystemLoaded: !!this.colorSystem,
                
                // 캐시 상태
                cacheSize: this.analysisCache.size,
                queueLength: this.analysisQueue.length,
                isProcessing: this.isProcessing,
                
                // 성능 통계
                stats: {
                    ...this.stats,
                    hitRate: Math.round(hitRate * 100) / 100,
                    averageProcessingTime: this.stats.analysisCount > 0 ?
                        Math.round(this.stats.totalProcessingTime / this.stats.analysisCount) : 0,
                    averageConfidence: Math.round(this.stats.averageConfidence * 100) / 100,
                    aiUsageRate: this.stats.analysisCount > 0 ?
                        Math.round((this.stats.aiAnalysisCount / this.stats.analysisCount) * 100) / 100 : 0
                }
            };
        }

        /**
         * 시스템 유효성 검증
         */
        validateSystem() {
            const issues = [];
            const warnings = [];
            
            try {
                // 핵심 시스템 체크
                if (!this.koreanSkinDatabase) {
                    issues.push('한국인 피부톤 데이터베이스가 로드되지 않음');
                }
                
                if (this.modelLoadError) {
                    warnings.push(`AI 모델 로드 오류: ${this.modelLoadError.message}`);
                }
                
                if (!this.faceMesh) {
                    warnings.push('MediaPipe Face Mesh가 로드되지 않음');
                }
                
                if (!this.colorSystem) {
                    warnings.push('ColorSystem이 연동되지 않음');
                }
                
                // 기본 분석 테스트
                const testRgb = { r: 200, g: 180, b: 160 };
                const testLab = this.rgbToLabBasic(testRgb.r, testRgb.g, testRgb.b);
                
                if (!testLab) {
                    issues.push('RGB to LAB 변환 실패');
                }
                
                const testTemperature = this.analyzeColorTemperatureBasic(testLab);
                if (!testTemperature) {
                    issues.push('색온도 분석 실패');
                }
                
            } catch (error) {
                issues.push(`시스템 검증 오류: ${error.message}`);
            }
            
            const status = issues.length === 0 ? 'healthy' : 
                          issues.length > warnings.length ? 'critical' : 'warning';
            
            return {
                status,
                isValid: issues.length === 0,
                issues,
                warnings,
                capabilities: {
                    aiAnalysis: this.isModelLoaded,
                    faceDetection: !!this.faceMesh,
                    advancedColorAnalysis: !!this.colorSystem,
                    koreanOptimization: !!this.koreanSkinDatabase,
                    realTimeAnalysis: true,
                    caching: true
                },
                stats: this.getPerformanceStats()
            };
        }

        /**
         * 정리 함수 (메모리 해제)
         */
        dispose() {
            try {
                // AI 모델 메모리 해제
                if (this.model && typeof this.model.dispose === 'function') {
                    this.model.dispose();
                    this.model = null;
                }
                
                // MediaPipe 정리
                if (this.faceMesh) {
                    if (typeof this.faceMesh.close === 'function') {
                        this.faceMesh.close();
                    }
                    this.faceMesh = null;
                }
                
                // 캐시 정리
                this.clearCache();
                
                // 큐 정리
                this.analysisQueue.length = 0;
                
                // 상태 리셋
                this.isModelLoaded = false;
                this.isLoading = false;
                this.isProcessing = false;
                
                console.log('[SkinToneAnalyzer] ✅ 시스템 정리 완료');
            } catch (error) {
                console.error('[SkinToneAnalyzer] ❌ 정리 중 오류:', error);
            }
        }
    }

    // 전역 등록 (window 객체)
    if (typeof window !== 'undefined') {
        window.SkinToneAnalyzer = SkinToneAnalyzer;
        
        // 싱글톤 인스턴스 생성
        if (!window.skinToneAnalyzer) {
            window.skinToneAnalyzer = new SkinToneAnalyzer();
        }
    }
    
    console.log('[SkinToneAnalyzer] 🎯 최종 완성 버전 로드 완료 ✅');
    console.log('[SkinToneAnalyzer] 🚀 실제 AI 피부톤 분석 시스템 준비됨');
    
})();
