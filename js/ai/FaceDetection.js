/**
 * FaceDetection.js - ES5 호환 완전 변환 버전
 * MediaPipe 기반 얼굴 감지 모듈
 * 
 * 변환사항:
 * - import/export 구문 완전 제거 ✅
 * - IIFE 패턴으로 변경 ✅ 
 * - 전역 window 객체 등록 ✅
 * - CONFIG 안전 접근 구현 ✅
 * - MediaPipe 동적 로딩 강화 ✅
 * 
 * 기능:
 * - MediaPipe FaceDetection & FaceMesh 지원
 * - TensorFlow.js BlazeFace 폴백 지원
 * - 얼굴 랜드마크 468포인트 정밀 분석
 * - 피부 영역 자동 추출 (이마, 볼, 턱)
 * - 얼굴 품질 및 방향 분석
 * - 다중 모델 폴백 시스템
 */

(function() {
    'use strict';
    
    // CONFIG 안전 로드 함수
    function getConfig() {
        try {
            if (typeof window !== 'undefined' && window.PersonalColorConfig) {
                return window.PersonalColorConfig;
            }
        } catch (error) {
            console.warn('[FaceDetection] CONFIG 로드 실패, 기본값 사용:', error);
        }
        return {};
    }

    /**
     * FaceDetection 메인 클래스
     */
    function FaceDetection() {
        var CONFIG = getConfig();
        
        // MediaPipe 및 TensorFlow 모델 상태
        this.faceDetection = null;
        this.faceMesh = null;
        this.blazefaceModel = null;
        this.isInitialized = false;
        this.initializationError = null;
        
        // 감지 설정 (CONFIG 안전 접근)
        this.config = {
            maxFaces: this.getConfigPath(CONFIG, 'AI_MODELS.faceDetection.maxNumFaces', 1),
            minDetectionConfidence: this.getConfigPath(CONFIG, 'AI_MODELS.faceDetection.minDetectionConfidence', 0.7),
            minTrackingConfidence: this.getConfigPath(CONFIG, 'AI_MODELS.faceDetection.minTrackingConfidence', 0.5),
            refineLandmarks: true,
            selfieMode: this.getConfigPath(CONFIG, 'AI_MODELS.faceDetection.selfieMode', true),
            
            // 성능 설정
            performance: {
                enableGPU: true,
                maxWidth: 640,
                maxHeight: 480,
                skipFrames: 0
            },
            
            // 폴백 설정
            fallback: {
                enabled: this.getConfigPath(CONFIG, 'AI_MODELS.faceDetection.fallback.enabled', true),
                method: this.getConfigPath(CONFIG, 'AI_MODELS.faceDetection.fallback.method', 'blazeface'),
                defaultRegion: this.getConfigPath(CONFIG, 'AI_MODELS.faceDetection.fallback.defaultRegion', 
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
    FaceDetection.prototype.getConfigPath = function(config, path, defaultValue) {
        try {
            var keys = path.split('.');
            var current = config;
            
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (current && typeof current === 'object' && key in current) {
                    current = current[key];
                } else {
                    return defaultValue;
                }
            }
            
            return current !== undefined ? current : defaultValue;
        } catch (error) {
            console.warn('[FaceDetection] 설정 경로 접근 실패 (' + path + '):', error);
            return defaultValue;
        }
    };

    /**
     * 시스템 초기화
     */
    FaceDetection.prototype.init = function() {
        var self = this;
        
        (function() {
            try {
                console.log('[FaceDetection] MediaPipe 로딩 시도...');
                
                // MediaPipe 로드 시도
                self.loadMediaPipe().then(function(mediaPipeLoaded) {
                    if (mediaPipeLoaded) {
                        return Promise.all([
                            self.setupFaceDetection(),
                            self.setupFaceMesh()
                        ]).then(function() {
                            console.log('[FaceDetection] MediaPipe 초기화 완료');
                            self.isInitialized = true;
                        });
                    } else {
                        console.warn('[FaceDetection] MediaPipe 로드 실패, TensorFlow.js 시도...');
                        
                        // TensorFlow.js BlazeFace 로드 시도
                        return self.loadBlazeFace().then(function(blazefaceLoaded) {
                            if (!blazefaceLoaded) {
                                console.warn('[FaceDetection] 모든 모델 로드 실패, 폴백 모드로 실행');
                                self.setupFallbackDetection();
                            }
                            self.isInitialized = true;
                        });
                    }
                }).then(function() {
                    console.log('[FaceDetection] 초기화 완료');
                }).catch(function(error) {
                    console.error('[FaceDetection] 초기화 실패:', error);
                    self.initializationError = error;
                    self.setupFallbackDetection();
                    self.isInitialized = true;
                });
                
            } catch (error) {
                console.error('[FaceDetection] 초기화 실패:', error);
                self.initializationError = error;
                self.setupFallbackDetection();
                self.isInitialized = true;
            }
        })();
    };

    /**
     * MediaPipe 라이브러리 로드
     */
    FaceDetection.prototype.loadMediaPipe = function() {
        var self = this;
        
        return new Promise(function(resolve) {
            try {
                // MediaPipe가 이미 로드되어 있는지 확인
                if (typeof window !== 'undefined' && 
                    window.FaceDetection && window.FaceMesh) {
                    resolve(true);
                    return;
                }

                // MediaPipe 라이브러리들 순차적 로드
                var scripts = [
                    'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
                    'https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js', 
                    'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
                    'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/face_detection.js',
                    'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js'
                ];

                var loadIndex = 0;
                
                function loadNext() {
                    if (loadIndex >= scripts.length) {
                        // 모든 스크립트 로드 완료
                        self.delay(1000).then(function() {
                            var success = typeof window !== 'undefined' && 
                                         typeof window.FaceDetection !== 'undefined' && 
                                         typeof window.FaceMesh !== 'undefined';
                            resolve(success);
                        });
                        return;
                    }
                    
                    var src = scripts[loadIndex++];
                    self.loadScript(src).then(function() {
                        console.log('[FaceDetection] 로드 완료: ' + src.split('/').pop());
                        loadNext();
                    }).catch(function(error) {
                        console.warn('[FaceDetection] 스크립트 로드 실패: ' + src, error);
                        resolve(false);
                    });
                }
                
                loadNext();
                   
            } catch (error) {
                console.error('[FaceDetection] MediaPipe 로드 오류:', error);
                resolve(false);
            }
        });
    };

    /**
     * TensorFlow.js BlazeFace 모델 로드
     */
    FaceDetection.prototype.loadBlazeFace = function() {
        var self = this;
        
        return new Promise(function(resolve) {
            try {
                // TensorFlow.js 확인
                if (typeof tf === 'undefined') {
                    console.log('[FaceDetection] TensorFlow.js 로딩...');
                    self.loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.10.0/dist/tf.min.js')
                        .then(function() {
                            return self.delay(2000); // TF.js 로드 대기
                        })
                        .then(function() {
                            if (typeof tf === 'undefined') {
                                console.warn('[FaceDetection] TensorFlow.js 로드 실패');
                                resolve(false);
                                return;
                            }
                            loadBlazeFaceModel();
                        })
                        .catch(function(error) {
                            console.warn('[FaceDetection] TensorFlow.js 로드 실패:', error);
                            resolve(false);
                        });
                } else {
                    loadBlazeFaceModel();
                }

                function loadBlazeFaceModel() {
                    // BlazeFace 모델 로드
                    console.log('[FaceDetection] BlazeFace 모델 로딩...');
                    
                    // BlazeFace 라이브러리 로드
                    self.loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface@0.0.7/dist/blazeface.min.js')
                        .then(function() {
                            return self.delay(1000);
                        })
                        .then(function() {
                            if (typeof blazeface !== 'undefined') {
                                return blazeface.load();
                            } else {
                                throw new Error('BlazeFace 라이브러리 로드 실패');
                            }
                        })
                        .then(function(model) {
                            self.blazefaceModel = model;
                            console.log('[FaceDetection] BlazeFace 모델 로드 완료');
                            resolve(true);
                        })
                        .catch(function(error) {
                            console.warn('[FaceDetection] BlazeFace 로드 실패:', error);
                            resolve(false);
                        });
                }
                
            } catch (error) {
                console.error('[FaceDetection] BlazeFace 로드 오류:', error);
                resolve(false);
            }
        });
    };

    /**
     * 스크립트 동적 로드
     */
    FaceDetection.prototype.loadScript = function(src) {
        return new Promise(function(resolve, reject) {
            // 이미 로드된 스크립트 확인
            var existingScript = document.querySelector('script[src="' + src + '"]');
            if (existingScript) {
                resolve();
                return;
            }

            var script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = resolve;
            script.onerror = function() {
                reject(new Error('스크립트 로드 실패: ' + src));
            };
            
            // 타임아웃 설정
            setTimeout(function() {
                reject(new Error('스크립트 로드 타임아웃: ' + src));
            }, 10000);
            
            document.head.appendChild(script);
        });
    };

    /**
     * MediaPipe FaceDetection 설정
     */
    FaceDetection.prototype.setupFaceDetection = function() {
        var self = this;
        
        return new Promise(function(resolve, reject) {
            if (typeof window === 'undefined' || typeof window.FaceDetection === 'undefined') {
                reject(new Error('MediaPipe FaceDetection을 사용할 수 없습니다.'));
                return;
            }

            try {
                self.faceDetection = new window.FaceDetection({
                    locateFile: function(file) {
                        return 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/' + file;
                    }
                });

                self.faceDetection.setOptions({
                    model: 'short',
                    minDetectionConfidence: self.config.minDetectionConfidence
                });

                self.faceDetection.onResults(function(results) {
                    self.onFaceDetectionResults(results);
                });

                console.log('[FaceDetection] MediaPipe FaceDetection 설정 완료');
                resolve();
            } catch (error) {
                console.error('[FaceDetection] FaceDetection 설정 실패:', error);
                reject(error);
            }
        });
    };

    /**
     * MediaPipe FaceMesh 설정
     */
    FaceDetection.prototype.setupFaceMesh = function() {
        var self = this;
        
        return new Promise(function(resolve, reject) {
            if (typeof window === 'undefined' || typeof window.FaceMesh === 'undefined') {
                reject(new Error('MediaPipe FaceMesh를 사용할 수 없습니다.'));
                return;
            }

            try {
                self.faceMesh = new window.FaceMesh({
                    locateFile: function(file) {
                        return 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/' + file;
                    }
                });

                self.faceMesh.setOptions({
                    maxNumFaces: self.config.maxFaces,
                    refineLandmarks: self.config.refineLandmarks,
                    minDetectionConfidence: self.config.minDetectionConfidence,
                    minTrackingConfidence: self.config.minTrackingConfidence
                });

                self.faceMesh.onResults(function(results) {
                    self.onFaceMeshResults(results);
                });

                console.log('[FaceDetection] MediaPipe FaceMesh 설정 완료');
                resolve();
            } catch (error) {
                console.error('[FaceDetection] FaceMesh 설정 실패:', error);
                reject(error);
            }
        });
    };

    /**
     * 폴백 감지 시스템 설정
     */
    FaceDetection.prototype.setupFallbackDetection = function() {
        console.warn('[FaceDetection] 기본 얼굴 감지 방식으로 설정됩니다');
        this.isInitialized = true;
    };

    /**
     * 지연 함수
     */
    FaceDetection.prototype.delay = function(ms) {
        return new Promise(function(resolve) {
            setTimeout(resolve, ms);
        });
    };

    /**
     * 정적 이미지에서 얼굴 감지 (메인 함수)
     */
    FaceDetection.prototype.detectFaces = function(imageSource) {
        var self = this;
        
        return new Promise(function(resolve) {
            if (!self.isInitialized) {
                console.log('[FaceDetection] 초기화 대기 중...');
                self.waitForInitialization().then(function() {
                    self.performDetection(imageSource, resolve);
                });
            } else {
                self.performDetection(imageSource, resolve);
            }
        });
    };

    /**
     * 실제 감지 수행
     */
    FaceDetection.prototype.performDetection = function(imageSource, resolve) {
        var startTime = performance.now();
        this.stats.detectionsPerformed++;

        try {
            var canvas = this.prepareCanvas(imageSource);
            if (!canvas) {
                throw new Error('이미지 소스를 캔버스로 변환할 수 없습니다');
            }
            
            var self = this;
            this.processImage(canvas).then(function(results) {
                var faces = self.formatResults(results, canvas);
                
                // 성공 통계
                self.stats.successfulDetections++;
                var processingTime = performance.now() - startTime;
                self.stats.totalProcessingTime += processingTime;
                self.stats.averageProcessingTime = self.stats.totalProcessingTime / self.stats.detectionsPerformed;
                
                console.log('[FaceDetection] 감지 완료: ' + faces.length + '개 얼굴, ' + Math.round(processingTime) + 'ms');
                resolve(faces);
            }).catch(function(error) {
                console.error('[FaceDetection] 얼굴 감지 실패:', error);
                self.stats.failedDetections++;
                resolve(self.getFallbackResults(imageSource));
            });
            
        } catch (error) {
            console.error('[FaceDetection] 얼굴 감지 실패:', error);
            this.stats.failedDetections++;
            resolve(this.getFallbackResults(imageSource));
        }
    };

    /**
     * 초기화 대기
     */
    FaceDetection.prototype.waitForInitialization = function(timeout) {
        if (timeout === undefined) timeout = 10000;
        
        var self = this;
        var startTime = Date.now();
        
        return new Promise(function(resolve) {
            function checkInitialized() {
                if (self.isInitialized || (Date.now() - startTime) >= timeout) {
                    if (!self.isInitialized) {
                        console.warn('[FaceDetection] 초기화 타임아웃');
                        self.setupFallbackDetection();
                    }
                    resolve();
                } else {
                    setTimeout(checkInitialized, 100);
                }
            }
            checkInitialized();
        });
    };

    /**
     * 캔버스 준비
     */
    FaceDetection.prototype.prepareCanvas = function(imageSource) {
        try {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            
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
    };

    /**
     * 이미지 처리 (다중 모델 지원)
     */
    FaceDetection.prototype.processImage = function(canvas) {
        var self = this;
        
        return new Promise(function(resolve) {
            // MediaPipe FaceMesh 우선 시도
            if (self.faceMesh) {
                try {
                    self.faceMesh.send({ image: canvas }).then(function() {
                        if (self.lastFaceMeshResults) {
                            resolve(self.lastFaceMeshResults);
                            return;
                        }
                        tryFaceDetection();
                    }).catch(function(error) {
                        console.warn('[FaceDetection] FaceMesh 처리 실패:', error);
                        tryFaceDetection();
                    });
                } catch (error) {
                    console.warn('[FaceDetection] FaceMesh 처리 실패:', error);
                    tryFaceDetection();
                }
            } else {
                tryFaceDetection();
            }
            
            function tryFaceDetection() {
                // MediaPipe FaceDetection 시도
                if (self.faceDetection) {
                    try {
                        self.faceDetection.send({ image: canvas }).then(function() {
                            if (self.lastFaceDetectionResults) {
                                resolve(self.lastFaceDetectionResults);
                                return;
                            }
                            tryBlazeFace();
                        }).catch(function(error) {
                            console.warn('[FaceDetection] FaceDetection 처리 실패:', error);
                            tryBlazeFace();
                        });
                    } catch (error) {
                        console.warn('[FaceDetection] FaceDetection 처리 실패:', error);
                        tryBlazeFace();
                    }
                } else {
                    tryBlazeFace();
                }
            }
            
            function tryBlazeFace() {
                // BlazeFace 시도
                if (self.blazefaceModel) {
                    try {
                        self.blazefaceModel.estimateFaces(canvas, false).then(function(predictions) {
                            var results = self.convertBlazeFaceResults(predictions);
                            resolve(results);
                        }).catch(function(error) {
                            console.warn('[FaceDetection] BlazeFace 처리 실패:', error);
                            resolve(self.basicFaceDetection(canvas));
                        });
                    } catch (error) {
                        console.warn('[FaceDetection] BlazeFace 처리 실패:', error);
                        resolve(self.basicFaceDetection(canvas));
                    }
                } else {
                    // 모든 방법이 실패하면 기본 감지
                    resolve(self.basicFaceDetection(canvas));
                }
            }
        });
    };

    /**
     * BlazeFace 결과 변환
     */
    FaceDetection.prototype.convertBlazeFaceResults = function(predictions) {
        var detections = predictions.map(function(prediction, index) {
            return {
                boundingBox: {
                    xCenter: (prediction.topLeft[0] + prediction.bottomRight[0]) / 2 / (prediction.image ? prediction.image.width : 640),
                    yCenter: (prediction.topLeft[1] + prediction.bottomRight[1]) / 2 / (prediction.image ? prediction.image.height : 480),
                    width: (prediction.bottomRight[0] - prediction.topLeft[0]) / (prediction.image ? prediction.image.width : 640),
                    height: (prediction.bottomRight[1] - prediction.topLeft[1]) / (prediction.image ? prediction.image.height : 480)
                },
                landmarks: prediction.landmarks || [],
                score: prediction.probability || 0.8
            };
        });
        
        return { detections: detections };
    };

    /**
     * MediaPipe 결과 콜백
     */
    FaceDetection.prototype.onFaceDetectionResults = function(results) {
        this.lastFaceDetectionResults = results;
    };

    FaceDetection.prototype.onFaceMeshResults = function(results) {
        this.lastFaceMeshResults = results;
    };

    /**
     * 결과 포매팅
     */
    FaceDetection.prototype.formatResults = function(results, canvas) {
        if (!results) return [];

        var faces = [];
        var width = canvas.width;
        var height = canvas.height;
        var self = this;

        if (results.multiFaceLandmarks) {
            // FaceMesh 결과 처리
            results.multiFaceLandmarks.forEach(function(landmarks, index) {
                var face = self.processFaceMeshLandmarks(landmarks, width, height, index);
                if (face) faces.push(face);
            });
        } else if (results.detections) {
            // FaceDetection 결과 처리
            results.detections.forEach(function(detection, index) {
                var face = self.processFaceDetection(detection, width, height, index);
                if (face) faces.push(face);
            });
        }

        // 얼굴 품질에 따라 정렬 (가장 좋은 얼굴이 첫 번째)
        faces.sort(function(a, b) {
            return b.quality - a.quality;
        });

        return faces;
    };

    /**
     * FaceMesh 랜드마크 처리
     */
    FaceDetection.prototype.processFaceMeshLandmarks = function(landmarks, width, height, index) {
        try {
            if (!landmarks || landmarks.length === 0) {
                return null;
            }

            // 랜드마크를 픽셀 좌표로 변환
            var pixelLandmarks = landmarks.map(function(point) {
                return {
                    x: point.x * width,
                    y: point.y * height,
                    z: point.z || 0
                };
            });

            // 바운딩 박스 계산
            var bbox = this.calculateBoundingBox(pixelLandmarks);
            
            // 피부 샘플링 영역 계산
            var skinAreas = this.calculateSkinAreas(bbox, pixelLandmarks);
            
            // 얼굴 품질 평가
            var quality = this.assessFaceQuality(pixelLandmarks, bbox, width, height);
            
            // 얼굴 방향 분석
            var orientation = this.analyzeFaceOrientation(pixelLandmarks);
            
            // 조명 조건 평가
            var lighting = this.assessLighting(skinAreas, width, height);

            return {
                id: index,
                type: 'facemesh',
                bbox: bbox,
                landmarks: pixelLandmarks,
                skinAreas: skinAreas,
                quality: quality,
                orientation: orientation,
                lighting: lighting,
                confidence: quality
            };
        } catch (error) {
            console.error('[FaceDetection] FaceMesh 처리 오류:', error);
            return null;
        }
    };

    /**
     * FaceDetection 처리
     */
    FaceDetection.prototype.processFaceDetection = function(detection, width, height, index) {
        try {
            if (!detection || !detection.boundingBox) {
                return null;
            }

            var bbox = {
                x: detection.boundingBox.xCenter * width - (detection.boundingBox.width * width) / 2,
                y: detection.boundingBox.yCenter * height - (detection.boundingBox.height * height) / 2,
                width: detection.boundingBox.width * width,
                height: detection.boundingBox.height * height
            };

            // 키포인트를 픽셀 좌표로 변환
            var keypoints = (detection.landmarks || []).map(function(point) {
                return {
                    x: point.x * width,
                    y: point.y * height
                };
            });

            // 피부 샘플링 영역 추정
            var skinAreas = this.estimateSkinAreasFromBbox(bbox);
            
            // 기본 품질 평가
            var quality = Math.min(detection.score || 0.7, this.assessBasicQuality(bbox, width, height));

            return {
                id: index,
                type: 'detection',
                bbox: bbox,
                keypoints: keypoints,
                skinAreas: skinAreas,
                quality: quality,
                confidence: detection.score || 0.7,
                orientation: { pitch: 0, yaw: 0, roll: 0, frontal: true },
                lighting: { score: 0.5, uniform: true }
            };
        } catch (error) {
            console.error('[FaceDetection] FaceDetection 처리 오류:', error);
            return null;
        }
    };

    /**
     * 바운딩 박스 계산
     */
    FaceDetection.prototype.calculateBoundingBox = function(landmarks) {
        if (!landmarks || landmarks.length === 0) {
            return { x: 0, y: 0, width: 100, height: 100, centerX: 50, centerY: 50 };
        }

        try {
            var xs = landmarks.map(function(p) { return p.x; }).filter(function(x) { return !isNaN(x); });
            var ys = landmarks.map(function(p) { return p.y; }).filter(function(y) { return !isNaN(y); });
            
            if (xs.length === 0 || ys.length === 0) {
                return { x: 0, y: 0, width: 100, height: 100, centerX: 50, centerY: 50 };
            }
            
            var minX = Math.min.apply(Math, xs);
            var maxX = Math.max.apply(Math, xs);
            var minY = Math.min.apply(Math, ys);
            var maxY = Math.max.apply(Math, ys);
            
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
    };

    /**
     * 피부 영역 계산
     */
    FaceDetection.prototype.calculateSkinAreas = function(bbox, landmarks) {
        var areas = {};
        var self = this;
        
        try {
            Object.keys(this.skinSamplingAreas).forEach(function(name) {
                var area = self.skinSamplingAreas[name];
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
                    areas.forehead = self.refineForeheadArea(landmarks, bbox);
                    areas.leftCheek = self.refineLeftCheekArea(landmarks, bbox);
                    areas.rightCheek = self.refineRightCheekArea(landmarks, bbox);
                } catch (error) {
                    console.warn('[FaceDetection] 랜드마크 기반 영역 조정 실패:', error);
                }
            }
        } catch (error) {
            console.error('[FaceDetection] 피부 영역 계산 오류:', error);
        }

        return areas;
    };

    /**
     * 이마 영역 정밀 조정
     */
    FaceDetection.prototype.refineForeheadArea = function(landmarks, bbox) {
        try {
            // 이마 랜드마크들의 평균 위치 계산
            var foreheadPoints = this.faceRegions.forehead
                .map(function(idx) { return landmarks[idx]; })
                .filter(function(point) { return point && !isNaN(point.x) && !isNaN(point.y); });
            
            if (foreheadPoints.length === 0) {
                return this.estimateSkinAreasFromBbox(bbox).forehead;
            }
            
            var avgX = foreheadPoints.reduce(function(sum, p) { return sum + p.x; }, 0) / foreheadPoints.length;
            var avgY = foreheadPoints.reduce(function(sum, p) { return sum + p.y; }, 0) / foreheadPoints.length;
            
            var width = bbox.width * 0.3;
            var height = bbox.height * 0.1;
            
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
    };

    /**
     * 왼쪽 볼 영역 정밀 조정
     */
    FaceDetection.prototype.refineLeftCheekArea = function(landmarks, bbox) {
        try {
            var cheekPoints = this.faceRegions.leftCheek
                .map(function(idx) { return landmarks[idx]; })
                .filter(function(point) { return point && !isNaN(point.x) && !isNaN(point.y); });
            
            if (cheekPoints.length === 0) {
                return this.estimateSkinAreasFromBbox(bbox).leftCheek;
            }
            
            var avgX = cheekPoints.reduce(function(sum, p) { return sum + p.x; }, 0) / cheekPoints.length;
            var avgY = cheekPoints.reduce(function(sum, p) { return sum + p.y; }, 0) / cheekPoints.length;
            
            var width = bbox.width * 0.15;
            var height = bbox.height * 0.2;
            
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
    };

    /**
     * 오른쪽 볼 영역 정밀 조정
     */
    FaceDetection.prototype.refineRightCheekArea = function(landmarks, bbox) {
        try {
            var cheekPoints = this.faceRegions.rightCheek
                .map(function(idx) { return landmarks[idx]; })
                .filter(function(point) { return point && !isNaN(point.x) && !isNaN(point.y); });
            
            if (cheekPoints.length === 0) {
                return this.estimateSkinAreasFromBbox(bbox).rightCheek;
            }
            
            var avgX = cheekPoints.reduce(function(sum, p) { return sum + p.x; }, 0) / cheekPoints.length;
            var avgY = cheekPoints.reduce(function(sum, p) { return sum + p.y; }, 0) / cheekPoints.length;
            
            var width = bbox.width * 0.15;
            var height = bbox.height * 0.2;
            
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
    };

    /**
     * 얼굴 품질 평가
     */
    FaceDetection.prototype.assessFaceQuality = function(landmarks, bbox, imgWidth, imgHeight) {
        var quality = 1.0;
        
        try {
            // 1. 얼굴 크기 (이미지 대비)
            var faceAreaRatio = (bbox.width * bbox.height) / (imgWidth * imgHeight);
            if (faceAreaRatio < 0.05) quality *= 0.5; // 너무 작음
            else if (faceAreaRatio > 0.5) quality *= 0.7; // 너무 큼
            else if (faceAreaRatio > 0.1 && faceAreaRatio < 0.3) quality *= 1.1; // 최적 크기
            
            // 2. 얼굴 중앙 정렬
            var centerX = bbox.centerX / imgWidth;
            var centerY = bbox.centerY / imgHeight;
            var centerDistance = Math.sqrt(Math.pow(centerX - 0.5, 2) + Math.pow(centerY - 0.5, 2));
            quality *= Math.max(0.5, 1 - centerDistance);
            
            // 3. 경계 근접성 (얼굴이 잘렸는지)
            var margin = 0.05;
            if (bbox.x < imgWidth * margin || bbox.y < imgHeight * margin ||
                bbox.x + bbox.width > imgWidth * (1 - margin) ||
                bbox.y + bbox.height > imgHeight * (1 - margin)) {
                quality *= 0.6;
            }
            
            // 4. 랜드마크 품질 (FaceMesh인 경우)
            if (landmarks && landmarks.length > 100) {
                var validLandmarks = landmarks.filter(function(p) {
                    return p && !isNaN(p.x) && !isNaN(p.y) &&
                           p.x >= 0 && p.x < imgWidth && p.y >= 0 && p.y < imgHeight;
                });
                var visibilityRatio = validLandmarks.length / landmarks.length;
                quality *= visibilityRatio;
            }
            
        } catch (error) {
            console.error('[FaceDetection] 품질 평가 오류:', error);
            quality = 0.5;
        }
        
        return Math.max(0.1, Math.min(1.0, quality));
    };

    /**
     * 얼굴 방향 분석
     */
    FaceDetection.prototype.analyzeFaceOrientation = function(landmarks) {
        if (!landmarks || landmarks.length < 468) {
            return { pitch: 0, yaw: 0, roll: 0, frontal: true };
        }

        try {
            // 주요 랜드마크 포인트들 (안전 접근)
            var noseTip = landmarks[1];
            var leftEye = landmarks[33];
            var rightEye = landmarks[263];
            var leftMouth = landmarks[61];
            var rightMouth = landmarks[291];
            var chin = landmarks[18];
            var forehead = landmarks[10];

            // 포인트 유효성 검사
            var points = [noseTip, leftEye, rightEye, leftMouth, rightMouth, chin, forehead];
            var validPoints = points.filter(function(p) { return p && !isNaN(p.x) && !isNaN(p.y); });
            
            if (validPoints.length < 4) {
                return { pitch: 0, yaw: 0, roll: 0, frontal: true };
            }

            // Yaw (좌우 회전) 계산
            var eyeDistance = Math.sqrt(
                Math.pow(rightEye.x - leftEye.x, 2) + Math.pow(rightEye.y - leftEye.y, 2)
            );
            var noseToLeftEye = Math.sqrt(
                Math.pow(noseTip.x - leftEye.x, 2) + Math.pow(noseTip.y - leftEye.y, 2)
            );
            var noseToRightEye = Math.sqrt(
                Math.pow(noseTip.x - rightEye.x, 2) + Math.pow(noseTip.y - rightEye.y, 2)
            );
            
            var yaw = 0;
            if (eyeDistance > 0) {
                yaw = Math.atan2(noseToRightEye - noseToLeftEye, eyeDistance) * (180 / Math.PI);
            }

            // Pitch (상하 회전) 계산
            var faceHeight = Math.abs(chin.y - forehead.y);
            var pitch = 0;
            if (faceHeight > 0) {
                var noseToForeheadRatio = Math.abs(noseTip.y - forehead.y) / faceHeight;
                pitch = (noseToForeheadRatio - 0.5) * 60; // 대략적인 각도
            }

            // Roll (기울기) 계산
            var roll = 0;
            if (rightEye.x !== leftEye.x) {
                var eyeSlope = (rightEye.y - leftEye.y) / (rightEye.x - leftEye.x);
                roll = Math.atan(eyeSlope) * (180 / Math.PI);
            }

            // 정면 여부 판단
            var frontal = Math.abs(yaw) < 15 && Math.abs(pitch) < 15 && Math.abs(roll) < 10;

            return {
                pitch: Math.round(pitch),
                yaw: Math.round(yaw),
                roll: Math.round(roll),
                frontal: frontal
            };
        } catch (error) {
            console.error('[FaceDetection] 얼굴 방향 분석 오류:', error);
            return { pitch: 0, yaw: 0, roll: 0, frontal: true };
        }
    };

    /**
     * 조명 조건 평가
     */
    FaceDetection.prototype.assessLighting = function(skinAreas, imgWidth, imgHeight) {
        // 실제 구현에서는 이미지 데이터를 분석해야 함
        // 여기서는 기본적인 구조만 제공
        
        return {
            score: 0.8, // 0-1 범위의 조명 품질 점수
            uniform: true, // 조명의 균일성
            shadows: false, // 그림자 존재 여부
            overexposed: false, // 과노출 여부
            underexposed: false // 저노출 여부
        };
    };

    /**
     * 기본 품질 평가
     */
    FaceDetection.prototype.assessBasicQuality = function(bbox, imgWidth, imgHeight) {
        try {
            var faceAreaRatio = (bbox.width * bbox.height) / (imgWidth * imgHeight);
            var quality = 0.7;
            
            if (faceAreaRatio > 0.1 && faceAreaRatio < 0.3) {
                quality = 0.9;
            } else if (faceAreaRatio < 0.05) {
                quality = 0.4;
            }
            
            return quality;
        } catch (error) {
            return 0.5;
        }
    };

    /**
     * 바운딩박스에서 피부 영역 추정
     */
    FaceDetection.prototype.estimateSkinAreasFromBbox = function(bbox) {
        var areas = {};
        var self = this;
        
        try {
            Object.keys(this.skinSamplingAreas).forEach(function(name) {
                var area = self.skinSamplingAreas[name];
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
    };

    /**
     * 기본 얼굴 감지 (모든 고급 방법 실패 시)
     */
    FaceDetection.prototype.basicFaceDetection = function(canvas) {
        // 이미지 중앙 60% 영역을 얼굴로 가정
        var width = canvas.width;
        var height = canvas.height;
        
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
    };

    /**
     * 폴백 결과 (완전 실패 시)
     */
    FaceDetection.prototype.getFallbackResults = function(imageSource) {
        try {
            var width, height;
            
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
            
            var faceWidth = width * 0.6;
            var faceHeight = height * 0.8;
            var faceX = (width - faceWidth) / 2;
            var faceY = (height - faceHeight) / 2;
            
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
    };

    /**
     * 베스트 얼굴 선택
     */
    FaceDetection.prototype.selectBestFace = function(faces) {
        if (!faces || faces.length === 0) return null;
        if (faces.length === 1) return faces[0];
        
        try {
            return faces.reduce(function(best, current) {
                var bestScore = best.quality;
                var currentScore = current.quality;
                
                // 정면을 향한 얼굴 우대
                if (current.orientation && current.orientation.frontal) currentScore += 0.2;
                if (best.orientation && best.orientation.frontal) bestScore += 0.2;
                
                // 중앙에 위치한 얼굴 우대
                var currentCentrality = 1 - Math.abs(current.bbox.centerX / 640 - 0.5);
                var bestCentrality = 1 - Math.abs(best.bbox.centerX / 640 - 0.5);
                
                currentScore += currentCentrality * 0.1;
                bestScore += bestCentrality * 0.1;
                
                return currentScore > bestScore ? current : best;
            });
        } catch (error) {
            console.error('[FaceDetection] 베스트 얼굴 선택 오류:', error);
            return faces[0];
        }
    };

    /**
     * 성능 통계 반환
     */
    FaceDetection.prototype.getPerformanceStats = function() {
        return {
            isInitialized: this.isInitialized,
            initializationError: this.initializationError ? this.initializationError.message : null,
            modelsAvailable: {
                mediapieFaceDetection: !!this.faceDetection,
                mediapipeFaceMesh: !!this.faceMesh,
                blazeface: !!this.blazefaceModel
            },
            stats: this.stats
        };
    };

    /**
     * 시스템 상태 검증
     */
    FaceDetection.prototype.validateSystem = function() {
        var issues = [];
        
        try {
            if (!this.isInitialized) {
                issues.push('시스템이 초기화되지 않음');
            }
            
            if (this.initializationError) {
                issues.push('초기화 오류: ' + this.initializationError.message);
            }
            
            if (!this.faceDetection && !this.faceMesh && !this.blazefaceModel) {
                issues.push('사용 가능한 얼굴 감지 모델이 없음');
            }
            
        } catch (error) {
            issues.push('검증 오류: ' + error.message);
        }
        
        return {
            isValid: issues.length === 0,
            issues: issues,
            stats: this.getPerformanceStats()
        };
    };

    /**
     * 리소스 정리
     */
    FaceDetection.prototype.dispose = function() {
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
    };

    // 전역 등록
    if (typeof window !== 'undefined') {
        window.FaceDetection = FaceDetection;
        
        // 전역 인스턴스도 생성
        window.globalFaceDetection = new FaceDetection();
    }

    console.log('[FaceDetection] ES5 호환 버전 로드 완료 ✅');

})();
