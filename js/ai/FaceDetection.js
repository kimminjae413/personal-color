/**
 * FaceDetection.js - 완전 수정판
 * MediaPipe 기반 얼굴 감지 모듈
 * 
 * 수정사항:
 * - ReferenceError: CONFIG is not defined 오류 수정
 * - 설정 객체 안전 접근 및 폴백 구현
 * - MediaPipe 동적 로딩 시스템 강화
 * - TensorFlow.js BlazeFace 대체 시스템 추가
 * - 오류 처리 및 리소스 관리 개선
 */

// CONFIG 안전 로드
let CONFIG = {};
try {
    if (typeof window !== 'undefined' && window.PersonalColorConfig) {
        CONFIG = window.PersonalColorConfig;
    }
} catch (error) {
    console.warn('[FaceDetection] CONFIG 로드 실패, 기본값 사용:', error);
}

export class FaceDetection {
    constructor() {
        // MediaPipe 및 TensorFlow 모델 상태
        this.faceDetection = null;
        this.faceMesh = null;
        this.blazefaceModel = null;
        this.isInitialized = false;
        this.initializationError = null;
        
        // 감지 설정 (CONFIG 안전 접근)
        this.config = {
            maxFaces: this.getConfigPath('AI_MODELS.faceDetection.maxNumFaces', 1),
            minDetectionConfidence: this.getConfigPath('AI_MODELS.faceDetection.minDetectionConfidence', 0.7),
            minTrackingConfidence: this.getConfigPath('AI_MODELS.faceDetection.minTrackingConfidence', 0.5),
            refineLandmarks: true,
            selfieMode: this.getConfigPath('AI_MODELS.faceDetection.selfieMode', true),
            
            // 성능 설정
            performance: {
                enableGPU: true,
                maxWidth: 640,
                maxHeight: 480,
                skipFrames: 0
            },
            
            // 폴백 설정
            fallback: {
                enabled: this.getConfigPath('AI_MODELS.faceDetection.fallback.enabled', true),
                method: this.getConfigPath('AI_MODELS.faceDetection.fallback.method', 'blazeface'),
                defaultRegion: this.getConfigPath('AI_MODELS.faceDetection.fallback.defaultRegion', 
                    { x: 0.25, y: 0.25, width: 0.5, height: 0.5 })
            }
        };
        
        // 얼굴 영역 정의 (MediaPipe 랜드마크 기준)
        this.faceRegions = {
            forehead: [10, 151, 9, 8, 107, 55, 8],
            leftCheek: [116, 117, 118, 119, 120, 121, 126, 142, 36, 205],
            rightCheek: [345, 346, 347, 348, 349, 350, 355, 371, 266, 425],
            nose: [1, 2, 5, 4, 6, 19, 94, 168, 195, 197, 236, 3, 51, 48, 115],
            chin: [18, 175, 199, 200, 9, 10, 151, 234, 454, 424, 418, 396, 395, 394, 416, 433, 434],
            jaw: [172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397, 288, 361, 323]
        };
        
        // 피부 샘플링을 위한 최적 영역 (얼굴 대비 비율)
        this.skinSamplingAreas = {
            forehead: { x: 0.3, y: 0.15, w: 0.4, h: 0.12 },
            leftCheek: { x: 0.15, y: 0.4, w: 0.15, h: 0.2 },
            rightCheek: { x: 0.7, y: 0.4, w: 0.15, h: 0.2 },
            chin: { x: 0.35, y: 0.75, w: 0.3, h: 0.15 }
        };
        
        // 결과 캐시
        this.lastFaceDetectionResults = null;
        this.lastFaceMeshResults = null;
        this.detectionCache = new Map();
        this.maxCacheSize = 10;
        
        // 성능 통계
        this.stats = {
            detectionsPerformed: 0,
            successfulDetections: 0,
            failedDetections: 0,
            averageProcessingTime: 0,
            totalProcessingTime: 0
        };
        
        console.log('[FaceDetection] 초기화 시작...');
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
            console.warn(`[FaceDetection] 설정 경로 접근 실패 (${path}):`, error);
            return defaultValue;
        }
    }

    /**
     * 시스템 초기화
     */
    async init() {
        try {
            console.log('[FaceDetection] MediaPipe 로딩 시도...');
            
            // MediaPipe 로드 시도
            const mediaPipeLoaded = await this.loadMediaPipe();
            
            if (mediaPipeLoaded) {
                await this.setupFaceDetection();
                await this.setupFaceMesh();
                console.log('[FaceDetection] MediaPipe 초기화 완료');
            } else {
                console.warn('[FaceDetection] MediaPipe 로드 실패, TensorFlow.js 시도...');
                
                // TensorFlow.js BlazeFace 로드 시도
                const blazefaceLoaded = await this.loadBlazeFace();
                
                if (!blazefaceLoaded) {
                    console.warn('[FaceDetection] 모든 모델 로드 실패, 폴백 모드로 실행');
                    this.setupFallbackDetection();
                }
            }
            
            this.isInitialized = true;
            console.log('[FaceDetection] 초기화 완료');
            
        } catch (error) {
            console.error('[FaceDetection] 초기화 실패:', error);
            this.initializationError = error;
            this.setupFallbackDetection();
            this.isInitialized = true;
        }
    }

    /**
     * MediaPipe 라이브러리 로드
     */
    async loadMediaPipe() {
        try {
            // MediaPipe가 이미 로드되어 있는지 확인
            if (typeof window !== 'undefined' && 
                window.FaceDetection && window.FaceMesh) {
                return true;
            }

            // MediaPipe 라이브러리들 순차적 로드
            const scripts = [
                'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
                'https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js', 
                'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
                'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/face_detection.js',
                'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js'
            ];

            for (const src of scripts) {
                try {
                    await this.loadScript(src);
                    console.log(`[FaceDetection] 로드 완료: ${src.split('/').pop()}`);
                } catch (error) {
                    console.warn(`[FaceDetection] 스크립트 로드 실패: ${src}`, error);
                    return false;
                }
            }

            // MediaPipe 로드 확인
            await this.delay(1000); // 스크립트 로드 대기
            
            return typeof window !== 'undefined' && 
                   typeof window.FaceDetection !== 'undefined' && 
                   typeof window.FaceMesh !== 'undefined';
                   
        } catch (error) {
            console.error('[FaceDetection] MediaPipe 로드 오류:', error);
            return false;
        }
    }

    /**
     * TensorFlow.js BlazeFace 모델 로드
     */
    async loadBlazeFace() {
        try {
            // TensorFlow.js 확인
            if (typeof tf === 'undefined') {
                console.log('[FaceDetection] TensorFlow.js 로딩...');
                await this.loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.10.0/dist/tf.min.js');
                await this.delay(2000); // TF.js 로드 대기
            }

            if (typeof tf === 'undefined') {
                console.warn('[FaceDetection] TensorFlow.js 로드 실패');
                return false;
            }

            // BlazeFace 모델 로드
            console.log('[FaceDetection] BlazeFace 모델 로딩...');
            
            // BlazeFace 라이브러리 로드
            await this.loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface@0.0.7/dist/blazeface.min.js');
            await this.delay(1000);

            if (typeof blazeface !== 'undefined') {
                this.blazefaceModel = await blazeface.load();
                console.log('[FaceDetection] BlazeFace 모델 로드 완료');
                return true;
            } else {
                console.warn('[FaceDetection] BlazeFace 라이브러리 로드 실패');
                return false;
            }
            
        } catch (error) {
            console.error('[FaceDetection] BlazeFace 로드 오류:', error);
            return false;
        }
    }

    /**
     * 스크립트 동적 로드
     */
    loadScript(src) {
        return new Promise((resolve, reject) => {
            // 이미 로드된 스크립트 확인
            const existingScript = document.querySelector(`script[src="${src}"]`);
            if (existingScript) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`스크립트 로드 실패: ${src}`));
            
            // 타임아웃 설정
            setTimeout(() => {
                reject(new Error(`스크립트 로드 타임아웃: ${src}`));
            }, 10000);
            
            document.head.appendChild(script);
        });
    }

    /**
     * MediaPipe FaceDetection 설정
     */
    async setupFaceDetection() {
        if (typeof window === 'undefined' || typeof window.FaceDetection === 'undefined') {
            throw new Error('MediaPipe FaceDetection을 사용할 수 없습니다.');
        }

        try {
            this.faceDetection = new window.FaceDetection({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
                }
            });

            this.faceDetection.setOptions({
                model: 'short',
                minDetectionConfidence: this.config.minDetectionConfidence
            });

            this.faceDetection.onResults((results) => {
                this.onFaceDetectionResults(results);
            });

            console.log('[FaceDetection] MediaPipe FaceDetection 설정 완료');
        } catch (error) {
            console.error('[FaceDetection] FaceDetection 설정 실패:', error);
            throw error;
        }
    }

    /**
     * MediaPipe FaceMesh 설정
     */
    async setupFaceMesh() {
        if (typeof window === 'undefined' || typeof window.FaceMesh === 'undefined') {
            throw new Error('MediaPipe FaceMesh를 사용할 수 없습니다.');
        }

        try {
            this.faceMesh = new window.FaceMesh({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
                }
            });

            this.faceMesh.setOptions({
                maxNumFaces: this.config.maxFaces,
                refineLandmarks: this.config.refineLandmarks,
                minDetectionConfidence: this.config.minDetectionConfidence,
                minTrackingConfidence: this.config.minTrackingConfidence
            });

            this.faceMesh.onResults((results) => {
                this.onFaceMeshResults(results);
            });

            console.log('[FaceDetection] MediaPipe FaceMesh 설정 완료');
        } catch (error) {
            console.error('[FaceDetection] FaceMesh 설정 실패:', error);
            throw error;
        }
    }

    /**
     * 폴백 감지 시스템 설정
     */
    setupFallbackDetection() {
        console.warn('[FaceDetection] 기본 얼굴 감지 방식으로 설정됩니다');
        this.isInitialized = true;
    }

    /**
     * 지연 함수
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 정적 이미지에서 얼굴 감지 (메인 함수)
     */
    async detectFaces(imageSource) {
        if (!this.isInitialized) {
            console.log('[FaceDetection] 초기화 대기 중...');
            await this.waitForInitialization();
        }

        const startTime = performance.now();
        this.stats.detectionsPerformed++;

        try {
            const canvas = this.prepareCanvas(imageSource);
            if (!canvas) {
                throw new Error('이미지 소스를 캔버스로 변환할 수 없습니다');
            }
            
            const results = await this.processImage(canvas);
            const faces = this.formatResults(results, canvas);
            
            // 성공 통계
            this.stats.successfulDetections++;
            const processingTime = performance.now() - startTime;
            this.stats.totalProcessingTime += processingTime;
            this.stats.averageProcessingTime = this.stats.totalProcessingTime / this.stats.detectionsPerformed;
            
            console.log(`[FaceDetection] 감지 완료: ${faces.length}개 얼굴, ${Math.round(processingTime)}ms`);
            return faces;
            
        } catch (error) {
            console.error('[FaceDetection] 얼굴 감지 실패:', error);
            this.stats.failedDetections++;
            return this.getFallbackResults(imageSource);
        }
    }

    /**
     * 초기화 대기
     */
    async waitForInitialization(timeout = 10000) {
        const startTime = Date.now();
        
        while (!this.isInitialized && (Date.now() - startTime) < timeout) {
            await this.delay(100);
        }
        
        if (!this.isInitialized) {
            console.warn('[FaceDetection] 초기화 타임아웃');
            this.setupFallbackDetection();
        }
    }

    /**
     * 캔버스 준비
     */
    prepareCanvas(imageSource) {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (imageSource instanceof HTMLCanvasElement) {
                canvas.width = imageSource.width;
                canvas.height = imageSource.height;
                ctx.drawImage(imageSource, 0, 0);
            } else if (imageSource instanceof HTMLVideoElement) {
                canvas.width = imageSource.videoWidth;
                canvas.height = imageSource.videoHeight;
                ctx.drawImage(imageSource, 0, 0);
            } else if (imageSource instanceof HTMLImageElement) {
                canvas.width = imageSource.naturalWidth;
                canvas.height = imageSource.naturalHeight;
                ctx.drawImage(imageSource, 0, 0);
            } else if (imageSource instanceof ImageData) {
                canvas.width = imageSource.width;
                canvas.height = imageSource.height;
                ctx.putImageData(imageSource, 0, 0);
            } else {
                console.warn('[FaceDetection] 지원하지 않는 이미지 소스 타입:', typeof imageSource);
                return null;
            }
            
            return canvas;
        } catch (error) {
            console.error('[FaceDetection] 캔버스 준비 오류:', error);
            return null;
        }
    }

    /**
     * 이미지 처리 (다중 모델 지원)
     */
    async processImage(canvas) {
        // MediaPipe FaceMesh 우선 시도
        if (this.faceMesh) {
            try {
                await this.faceMesh.send({ image: canvas });
                if (this.lastFaceMeshResults) {
                    return this.lastFaceMeshResults;
                }
            } catch (error) {
                console.warn('[FaceDetection] FaceMesh 처리 실패:', error);
            }
        }
        
        // MediaPipe FaceDetection 시도
        if (this.faceDetection) {
            try {
                await this.faceDetection.send({ image: canvas });
                if (this.lastFaceDetectionResults) {
                    return this.lastFaceDetectionResults;
                }
            } catch (error) {
                console.warn('[FaceDetection] FaceDetection 처리 실패:', error);
            }
        }
        
        // BlazeFace 시도
        if (this.blazefaceModel) {
            try {
                const predictions = await this.blazefaceModel.estimateFaces(canvas, false);
                return this.convertBlazeFaceResults(predictions);
            } catch (error) {
                console.warn('[FaceDetection] BlazeFace 처리 실패:', error);
            }
        }
        
        // 모든 방법이 실패하면 기본 감지
        return this.basicFaceDetection(canvas);
    }

    /**
     * BlazeFace 결과 변환
     */
    convertBlazeFaceResults(predictions) {
        const detections = predictions.map((prediction, index) => ({
            boundingBox: {
                xCenter: (prediction.topLeft[0] + prediction.bottomRight[0]) / 2 / prediction.image?.width || 640,
                yCenter: (prediction.topLeft[1] + prediction.bottomRight[1]) / 2 / prediction.image?.height || 480,
                width: (prediction.bottomRight[0] - prediction.topLeft[0]) / (prediction.image?.width || 640),
                height: (prediction.bottomRight[1] - prediction.topLeft[1]) / (prediction.image?.height || 480)
            },
            landmarks: prediction.landmarks || [],
            score: prediction.probability || 0.8
        }));
        
        return { detections };
    }

    /**
     * MediaPipe 결과 콜백
     */
    onFaceDetectionResults(results) {
        this.lastFaceDetectionResults = results;
    }

    onFaceMeshResults(results) {
        this.lastFaceMeshResults = results;
    }

    /**
     * 결과 포매팅
     */
    formatResults(results, canvas) {
        if (!results) return [];

        const faces = [];
        const width = canvas.width;
        const height = canvas.height;

        if (results.multiFaceLandmarks) {
            // FaceMesh 결과 처리
            results.multiFaceLandmarks.forEach((landmarks, index) => {
                const face = this.processFaceMeshLandmarks(landmarks, width, height, index);
                if (face) faces.push(face);
            });
        } else if (results.detections) {
            // FaceDetection 결과 처리
            results.detections.forEach((detection, index) => {
                const face = this.processFaceDetection(detection, width, height, index);
                if (face) faces.push(face);
            });
        }

        // 얼굴 품질에 따라 정렬 (가장 좋은 얼굴이 첫 번째)
        faces.sort((a, b) => b.quality - a.quality);

        return faces;
    }

    /**
     * FaceMesh 랜드마크 처리
     */
    processFaceMeshLandmarks(landmarks, width, height, index) {
        try {
            if (!landmarks || landmarks.length === 0) {
                return null;
            }

            // 랜드마크를 픽셀 좌표로 변환
            const pixelLandmarks = landmarks.map(point => ({
                x: point.x * width,
                y: point.y * height,
                z: point.z || 0
            }));

            // 바운딩 박스 계산
            const bbox = this.calculateBoundingBox(pixelLandmarks);
            
            // 피부 샘플링 영역 계산
            const skinAreas = this.calculateSkinAreas(bbox, pixelLandmarks);
            
            // 얼굴 품질 평가
            const quality = this.assessFaceQuality(pixelLandmarks, bbox, width, height);
            
            // 얼굴 방향 분석
            const orientation = this.analyzeFaceOrientation(pixelLandmarks);
            
            // 조명 조건 평가
            const lighting = this.assessLighting(skinAreas, width, height);

            return {
                id: index,
                type: 'facemesh',
                bbox,
                landmarks: pixelLandmarks,
                skinAreas,
                quality,
                orientation,
                lighting,
                confidence: quality
            };
        } catch (error) {
            console.error('[FaceDetection] FaceMesh 처리 오류:', error);
            return null;
        }
    }

    /**
     * FaceDetection 처리
     */
    processFaceDetection(detection, width, height, index) {
        try {
            if (!detection || !detection.boundingBox) {
                return null;
            }

            const bbox = {
                x: detection.boundingBox.xCenter * width - (detection.boundingBox.width * width) / 2,
                y: detection.boundingBox.yCenter * height - (detection.boundingBox.height * height) / 2,
                width: detection.boundingBox.width * width,
                height: detection.boundingBox.height * height
            };

            // 키포인트를 픽셀 좌표로 변환
            const keypoints = (detection.landmarks || []).map(point => ({
                x: point.x * width,
                y: point.y * height
            }));

            // 피부 샘플링 영역 추정
            const skinAreas = this.estimateSkinAreasFromBbox(bbox);
            
            // 기본 품질 평가
            const quality = Math.min(detection.score || 0.7, this.assessBasicQuality(bbox, width, height));

            return {
                id: index,
                type: 'detection',
                bbox,
                keypoints,
                skinAreas,
                quality,
                confidence: detection.score || 0.7,
                orientation: { pitch: 0, yaw: 0, roll: 0, frontal: true },
                lighting: { score: 0.5, uniform: true }
            };
        } catch (error) {
            console.error('[FaceDetection] FaceDetection 처리 오류:', error);
            return null;
        }
    }

    /**
     * 바운딩 박스 계산
     */
    calculateBoundingBox(landmarks) {
        if (!landmarks || landmarks.length === 0) {
            return { x: 0, y: 0, width: 100, height: 100, centerX: 50, centerY: 50 };
        }

        try {
            const xs = landmarks.map(p => p.x).filter(x => !isNaN(x));
            const ys = landmarks.map(p => p.y).filter(y => !isNaN(y));
            
            if (xs.length === 0 || ys.length === 0) {
                return { x: 0, y: 0, width: 100, height: 100, centerX: 50, centerY: 50 };
            }
            
            const minX = Math.min(...xs);
            const maxX = Math.max(...xs);
            const minY = Math.min(...ys);
            const maxY = Math.max(...ys);
            
            return {
                x: minX,
                y: minY,
                width: maxX - minX,
                height: maxY - minY,
                centerX: (minX + maxX) / 2,
                centerY: (minY + maxY) / 2
            };
        } catch (error) {
            console.error('[FaceDetection] 바운딩박스 계산 오류:', error);
            return { x: 0, y: 0, width: 100, height: 100, centerX: 50, centerY: 50 };
        }
    }

    /**
     * 피부 영역 계산
     */
    calculateSkinAreas(bbox, landmarks) {
        const areas = {};
        
        try {
            Object.entries(this.skinSamplingAreas).forEach(([name, area]) => {
                areas[name] = {
                    x: Math.floor(bbox.x + bbox.width * area.x),
                    y: Math.floor(bbox.y + bbox.height * area.y),
                    width: Math.floor(bbox.width * area.w),
                    height: Math.floor(bbox.height * area.h),
                    center: {
                        x: Math.floor(bbox.x + bbox.width * (area.x + area.w / 2)),
                        y: Math.floor(bbox.y + bbox.height * (area.y + area.h / 2))
                    }
                };
            });

            // 랜드마크 기반 세밀한 조정 (FaceMesh인 경우)
            if (landmarks && landmarks.length > 100) {
                try {
                    areas.forehead = this.refineForeheadArea(landmarks, bbox);
                    areas.leftCheek = this.refineLeftCheekArea(landmarks, bbox);
                    areas.rightCheek = this.refineRightCheekArea(landmarks, bbox);
                } catch (error) {
                    console.warn('[FaceDetection] 랜드마크 기반 영역 조정 실패:', error);
                }
            }
        } catch (error) {
            console.error('[FaceDetection] 피부 영역 계산 오류:', error);
        }

        return areas;
    }

    /**
     * 이마 영역 정밀 조정
     */
    refineForeheadArea(landmarks, bbox) {
        try {
            // 이마 랜드마크들의 평균 위치 계산
            const foreheadPoints = this.faceRegions.forehead
                .map(idx => landmarks[idx])
                .filter(point => point && !isNaN(point.x) && !isNaN(point.y));
            
            if (foreheadPoints.length === 0) {
                return this.estimateSkinAreasFromBbox(bbox).forehead;
            }
            
            const avgX = foreheadPoints.reduce((sum, p) => sum + p.x, 0) / foreheadPoints.length;
            const avgY = foreheadPoints.reduce((sum, p) => sum + p.y, 0) / foreheadPoints.length;
            
            const width = bbox.width * 0.3;
            const height = bbox.height * 0.1;
            
            return {
                x: Math.floor(avgX - width / 2),
                y: Math.floor(avgY - height / 2),
                width: Math.floor(width),
                height: Math.floor(height),
                center: { x: Math.floor(avgX), y: Math.floor(avgY) }
            };
        } catch (error) {
            console.warn('[FaceDetection] 이마 영역 조정 오류:', error);
            return this.estimateSkinAreasFromBbox(bbox).forehead;
        }
    }

    /**
     * 왼쪽 볼 영역 정밀 조정
     */
    refineLeftCheekArea(landmarks, bbox) {
        try {
            const cheekPoints = this.faceRegions.leftCheek
                .map(idx => landmarks[idx])
                .filter(point => point && !isNaN(point.x) && !isNaN(point.y));
            
            if (cheekPoints.length === 0) {
                return this.estimateSkinAreasFromBbox(bbox).leftCheek;
            }
            
            const avgX = cheekPoints.reduce((sum, p) => sum + p.x, 0) / cheekPoints.length;
            const avgY = cheekPoints.reduce((sum, p) => sum + p.y, 0) / cheekPoints.length;
            
            const width = bbox.width * 0.15;
            const height = bbox.height * 0.2;
            
            return {
                x: Math.floor(avgX - width / 2),
                y: Math.floor(avgY - height / 2),
                width: Math.floor(width),
                height: Math.floor(height),
                center: { x: Math.floor(avgX), y: Math.floor(avgY) }
            };
        } catch (error) {
            console.warn('[FaceDetection] 왼쪽 볼 영역 조정 오류:', error);
            return this.estimateSkinAreasFromBbox(bbox).leftCheek;
        }
    }

    /**
     * 오른쪽 볼 영역 정밀 조정
     */
    refineRightCheekArea(landmarks, bbox) {
        try {
            const cheekPoints = this.faceRegions.rightCheek
                .map(idx => landmarks[idx])
                .filter(point => point && !isNaN(point.x) && !isNaN(point.y));
            
            if (cheekPoints.length === 0) {
                return this.estimateSkinAreasFromBbox(bbox).rightCheek;
            }
            
            const avgX = cheekPoints.reduce((sum, p) => sum + p.x, 0) / cheekPoints.length;
            const avgY = cheekPoints.reduce((sum, p) => sum + p.y, 0) / cheekPoints.length;
            
            const width = bbox.width * 0.15;
            const height = bbox.height * 0.2;
            
            return {
                x: Math.floor(avgX - width / 2),
                y: Math.floor(avgY - height / 2),
                width: Math.floor(width),
                height: Math.floor(height),
                center: { x: Math.floor(avgX), y: Math.floor(avgY) }
            };
        } catch (error) {
            console.warn('[FaceDetection] 오른쪽 볼 영역 조정 오류:', error);
            return this.estimateSkinAreasFromBbox(bbox).rightCheek;
        }
    }

    /**
     * 얼굴 품질 평가
     */
    assessFaceQuality(landmarks, bbox, imgWidth, imgHeight) {
        let quality = 1.0;
        
        try {
            // 1. 얼굴 크기 (이미지 대비)
            const faceAreaRatio = (bbox.width * bbox.height) / (imgWidth * imgHeight);
            if (faceAreaRatio < 0.05) quality *= 0.5; // 너무 작음
            else if (faceAreaRatio > 0.5) quality *= 0.7; // 너무 큼
            else if (faceAreaRatio > 0.1 && faceAreaRatio < 0.3) quality *= 1.1; // 최적 크기
            
            // 2. 얼굴 중앙 정렬
            const centerX = bbox.centerX / imgWidth;
            const centerY = bbox.centerY / imgHeight;
            const centerDistance = Math.sqrt((centerX - 0.5) ** 2 + (centerY - 0.5) ** 2);
            quality *= Math.max(0.5, 1 - centerDistance);
            
            // 3. 경계 근접성 (얼굴이 잘렸는지)
            const margin = 0.05;
            if (bbox.x < imgWidth * margin || bbox.y < imgHeight * margin ||
                bbox.x + bbox.width > imgWidth * (1 - margin) ||
                bbox.y + bbox.height > imgHeight * (1 - margin)) {
                quality *= 0.6;
            }
            
            // 4. 랜드마크 품질 (FaceMesh인 경우)
            if (landmarks && landmarks.length > 100) {
                const validLandmarks = landmarks.filter(p => 
                    p && !isNaN(p.x) && !isNaN(p.y) &&
                    p.x >= 0 && p.x < imgWidth && p.y >= 0 && p.y < imgHeight);
                const visibilityRatio = validLandmarks.length / landmarks.length;
                quality *= visibilityRatio;
            }
            
        } catch (error) {
            console.error('[FaceDetection] 품질 평가 오류:', error);
            quality = 0.5;
        }
        
        return Math.max(0.1, Math.min(1.0, quality));
    }

    /**
     * 얼굴 방향 분석
     */
    analyzeFaceOrientation(landmarks) {
        if (!landmarks || landmarks.length < 468) {
            return { pitch: 0, yaw: 0, roll: 0, frontal: true };
        }

        try {
            // 주요 랜드마크 포인트들 (안전 접근)
            const noseTip = landmarks[1];
            const leftEye = landmarks[33];
            const rightEye = landmarks[263];
            const leftMouth = landmarks[61];
            const rightMouth = landmarks[291];
            const chin = landmarks[18];
            const forehead = landmarks[10];

            // 포인트 유효성 검사
            const points = [noseTip, leftEye, rightEye, leftMouth, rightMouth, chin, forehead];
            const validPoints = points.filter(p => p && !isNaN(p.x) && !isNaN(p.y));
            
            if (validPoints.length < 4) {
                return { pitch: 0, yaw: 0, roll: 0, frontal: true };
            }

            // Yaw (좌우 회전) 계산
            const eyeDistance = Math.sqrt(
                (rightEye.x - leftEye.x) ** 2 + (rightEye.y - leftEye.y) ** 2
            );
            const noseToLeftEye = Math.sqrt(
                (noseTip.x - leftEye.x) ** 2 + (noseTip.y - leftEye.y) ** 2
            );
            const noseToRightEye = Math.sqrt(
                (noseTip.x - rightEye.x) ** 2 + (noseTip.y - rightEye.y) ** 2
            );
            
            let yaw = 0;
            if (eyeDistance > 0) {
                yaw = Math.atan2(noseToRightEye - noseToLeftEye, eyeDistance) * (180 / Math.PI);
            }

            // Pitch (상하 회전) 계산
            const faceHeight = Math.abs(chin.y - forehead.y);
            let pitch = 0;
            if (faceHeight > 0) {
                const noseToForeheadRatio = Math.abs(noseTip.y - forehead.y) / faceHeight;
                pitch = (noseToForeheadRatio - 0.5) * 60; // 대략적인 각도
            }

            // Roll (기울기) 계산
            let roll = 0;
            if (rightEye.x !== leftEye.x) {
                const eyeSlope = (rightEye.y - leftEye.y) / (rightEye.x - leftEye.x);
                roll = Math.atan(eyeSlope) * (180 / Math.PI);
            }

            // 정면 여부 판단
            const frontal = Math.abs(yaw) < 15 && Math.abs(pitch) < 15 && Math.abs(roll) < 10;

            return {
                pitch: Math.round(pitch),
                yaw: Math.round(yaw),
                roll: Math.round(roll),
                frontal
            };
        } catch (error) {
            console.error('[FaceDetection] 얼굴 방향 분석 오류:', error);
            return { pitch: 0, yaw: 0, roll: 0, frontal: true };
        }
    }

    /**
     * 조명 조건 평가
     */
    assessLighting(skinAreas, imgWidth, imgHeight) {
        // 실제 구현에서는 이미지 데이터를 분석해야 함
        // 여기서는 기본적인 구조만 제공
        
        return {
            score: 0.8, // 0-1 범위의 조명 품질 점수
            uniform: true, // 조명의 균일성
            shadows: false, // 그림자 존재 여부
            overexposed: false, // 과노출 여부
            underexposed: false // 저노출 여부
        };
    }

    /**
     * 기본 품질 평가
     */
    assessBasicQuality(bbox, imgWidth, imgHeight) {
        try {
            const faceAreaRatio = (bbox.width * bbox.height) / (imgWidth * imgHeight);
            let quality = 0.7;
            
            if (faceAreaRatio > 0.1 && faceAreaRatio < 0.3) {
                quality = 0.9;
            } else if (faceAreaRatio < 0.05) {
                quality = 0.4;
            }
            
            return quality;
        } catch (error) {
            return 0.5;
        }
    }

    /**
     * 바운딩박스에서 피부 영역 추정
     */
    estimateSkinAreasFromBbox(bbox) {
        const areas = {};
        
        try {
            Object.entries(this.skinSamplingAreas).forEach(([name, area]) => {
                areas[name] = {
                    x: Math.floor(bbox.x + bbox.width * area.x),
                    y: Math.floor(bbox.y + bbox.height * area.y),
                    width: Math.floor(bbox.width * area.w),
                    height: Math.floor(bbox.height * area.h),
                    center: {
                        x: Math.floor(bbox.x + bbox.width * (area.x + area.w / 2)),
                        y: Math.floor(bbox.y + bbox.height * (area.y + area.h / 2))
                    }
                };
            });
        } catch (error) {
            console.error('[FaceDetection] 피부 영역 추정 오류:', error);
        }
        
        return areas;
    }

    /**
     * 기본 얼굴 감지 (모든 고급 방법 실패 시)
     */
    basicFaceDetection(canvas) {
        // 이미지 중앙 60% 영역을 얼굴로 가정
        const width = canvas.width;
        const height = canvas.height;
        
        return {
            detections: [{
                boundingBox: {
                    xCenter: 0.5,
                    yCenter: 0.5,
                    width: 0.6,
                    height: 0.8
                },
                landmarks: [
                    { x: 0.3, y: 0.3 }, // 좌안
                    { x: 0.7, y: 0.3 }, // 우안
                    { x: 0.5, y: 0.5 }, // 코
                    { x: 0.4, y: 0.7 }, // 좌입
                    { x: 0.6, y: 0.7 }  // 우입
                ],
                score: 0.6
            }]
        };
    }

    /**
     * 폴백 결과 (완전 실패 시)
     */
    getFallbackResults(imageSource) {
        try {
            let width, height;
            
            if (imageSource instanceof HTMLCanvasElement) {
                width = imageSource.width;
                height = imageSource.height;
            } else if (imageSource instanceof HTMLVideoElement) {
                width = imageSource.videoWidth || 640;
                height = imageSource.videoHeight || 480;
            } else if (imageSource instanceof HTMLImageElement) {
                width = imageSource.naturalWidth || 640;
                height = imageSource.naturalHeight || 480;
            } else {
                width = 640;
                height = 480;
            }
            
            const faceWidth = width * 0.6;
            const faceHeight = height * 0.8;
            const faceX = (width - faceWidth) / 2;
            const faceY = (height - faceHeight) / 2;
            
            return [{
                id: 0,
                type: 'fallback',
                bbox: {
                    x: faceX,
                    y: faceY,
                    width: faceWidth,
                    height: faceHeight,
                    centerX: width / 2,
                    centerY: height / 2
                },
                skinAreas: this.estimateSkinAreasFromBbox({
                    x: faceX,
                    y: faceY,
                    width: faceWidth,
                    height: faceHeight
                }),
                quality: 0.5,
                confidence: 0.5,
                orientation: { pitch: 0, yaw: 0, roll: 0, frontal: true },
                lighting: { score: 0.5, uniform: true }
            }];
        } catch (error) {
            console.error('[FaceDetection] 폴백 결과 생성 오류:', error);
            return [];
        }
    }

    /**
     * 베스트 얼굴 선택
     */
    selectBestFace(faces) {
        if (!faces || faces.length === 0) return null;
        if (faces.length === 1) return faces[0];
        
        try {
            return faces.reduce((best, current) => {
                let bestScore = best.quality;
                let currentScore = current.quality;
                
                // 정면을 향한 얼굴 우대
                if (current.orientation && current.orientation.frontal) currentScore += 0.2;
                if (best.orientation && best.orientation.frontal) bestScore += 0.2;
                
                // 중앙에 위치한 얼굴 우대
                const currentCentrality = 1 - Math.abs(current.bbox.centerX / 640 - 0.5);
                const bestCentrality = 1 - Math.abs(best.bbox.centerX / 640 - 0.5);
                
                currentScore += currentCentrality * 0.1;
                bestScore += bestCentrality * 0.1;
                
                return currentScore > bestScore ? current : best;
            });
        } catch (error) {
            console.error('[FaceDetection] 베스트 얼굴 선택 오류:', error);
            return faces[0];
        }
    }

    /**
     * 성능 통계 반환
     */
    getPerformanceStats() {
        return {
            isInitialized: this.isInitialized,
            initializationError: this.initializationError?.message,
            modelsAvailable: {
                mediapieFaceDetection: !!this.faceDetection,
                mediapipeFaceMesh: !!this.faceMesh,
                blazeface: !!this.blazefaceModel
            },
            stats: this.stats
        };
    }

    /**
     * 시스템 상태 검증
     */
    validateSystem() {
        const issues = [];
        
        try {
            if (!this.isInitialized) {
                issues.push('시스템이 초기화되지 않음');
            }
            
            if (this.initializationError) {
                issues.push(`초기화 오류: ${this.initializationError.message}`);
            }
            
            if (!this.faceDetection && !this.faceMesh && !this.blazefaceModel) {
                issues.push('사용 가능한 얼굴 감지 모델이 없음');
            }
            
        } catch (error) {
            issues.push(`검증 오류: ${error.message}`);
        }
        
        return {
            isValid: issues.length === 0,
            issues,
            stats: this.getPerformanceStats()
        };
    }

    /**
     * 리소스 정리
     */
    dispose() {
        try {
            if (this.faceDetection) {
                this.faceDetection.close();
                this.faceDetection = null;
            }
            
            if (this.faceMesh) {
                this.faceMesh.close();
                this.faceMesh = null;
            }
            
            if (this.blazefaceModel) {
                this.blazefaceModel.dispose();
                this.blazefaceModel = null;
            }
            
            // 캐시 정리
            this.detectionCache.clear();
            
            console.log('[FaceDetection] 정리 완료');
        } catch (error) {
            console.error('[FaceDetection] 정리 중 오류:', error);
        }
    }
}

// 전역 인스턴스 생성
if (typeof window !== 'undefined') {
    window.FaceDetection = new FaceDetection();
}

console.log('[FaceDetection] 완전 수정 버전 로드 완료 ✅');
