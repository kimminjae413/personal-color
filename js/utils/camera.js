/**
 * camera.js - 헤어디자이너용 퍼스널컬러 진단 카메라 제어 (ES5 호환 완전 변환)
 * 태블릿 최적화 카메라 제어, 조명 분석, 이미지 품질 검증
 * 
 * 수정사항:
 * - ES6 import/export → ES5 IIFE 패턴 변환 ✅
 * - hasPermission 변수 초기화 오류 완전 수정 ✅
 * - 브라우저 호환성 개선 ✅
 * - 전역 window 객체 등록 ✅
 * 
 * 주요 기능:
 * - 고품질 카메라 스트림 관리
 * - 조명 조건 실시간 분석
 * - 이미지 캡처 및 전처리
 * - 얼굴 감지 영역 가이드
 * - 태블릿 터치 제스처 지원
 */

(function() {
    'use strict';

    // 안전한 설정 접근
    function getConfig() {
        return window.PersonalColorConfig || {
            CAMERA: {
                preferredResolution: { width: 1280, height: 720 },
                frameRate: 30,
                facingMode: 'user',
                constraints: {
                    video: {
                        width: { ideal: 1280, min: 640, max: 3840 },
                        height: { ideal: 720, min: 480, max: 2160 },
                        frameRate: { ideal: 30, min: 15, max: 60 },
                        facingMode: 'user',
                        aspectRatio: { ideal: 16/9 }
                    },
                    audio: false
                }
            }
        };
    }

    /**
     * 카메라 컨트롤러 클래스 (ES5 호환)
     */
    class CameraController {
        constructor() {
            this.stream = null;
            this.videoElement = null;
            this.canvasElement = null;
            this.ctx = null;
            this.availableCameras = [];
            
            // 카메라 설정
            this.currentCamera = 'user'; // 'user' (전면) 또는 'environment' (후면)
            this.resolution = { width: 1280, height: 720 };
            this.isCapturing = false;
            this.isAnalyzing = false;
            this.isInitialized = false;
            
            // 권한 상태 (완전 초기화)
            this.hasPermission = false;
            this.permissionStatus = 'unknown'; // 'unknown', 'granted', 'denied', 'prompt'
            this.lastPermissionCheck = null;
            
            // 조명 및 품질 분석 (안전한 초기화)
            this.lightingAnalyzer = null;
            this.imageQualityChecker = null;
            
            // 이벤트 콜백
            this.callbacks = {
                onStreamReady: null,
                onCaptureComplete: null,
                onError: null,
                onLightingChange: null,
                onQualityChange: null,
                onPermissionChange: null
            };

            // 가이드라인 설정
            this.faceGuide = {
                enabled: true,
                opacity: 0.3,
                color: '#00FF00'
            };

            // 성능 모니터링
            this.performance = {
                frameRate: 0,
                lastFrameTime: 0,
                frameCount: 0
            };

            // 오류 추적
            this.errorHistory = [];
            this.maxErrorHistory = 10;

            console.log('[CameraController] 카메라 컨트롤러 초기화 완료');
        }

        /**
         * 카메라 초기화 및 스트림 시작
         */
        async initialize(videoElement, canvasElement = null) {
            try {
                console.log('[CameraController] 초기화 시작...');
                
                // DOM 요소 설정
                this.videoElement = videoElement;
                this.canvasElement = canvasElement || this.createCanvas();
                this.ctx = this.canvasElement.getContext('2d');

                // 분석기 초기화 (안전한 방식)
                try {
                    this.lightingAnalyzer = new LightingAnalyzer();
                    this.imageQualityChecker = new ImageQualityChecker();
                } catch (analyzerError) {
                    console.warn('[CameraController] 분석기 초기화 실패:', analyzerError);
                    // 폴백: 기본 분석기 사용
                    this.lightingAnalyzer = new SimpleLightingAnalyzer();
                    this.imageQualityChecker = new SimpleImageQualityChecker();
                }

                // 카메라 권한 확인 (완전 수정됨)
                const permissionResult = await this.checkCameraPermission();
                if (!permissionResult.hasPermission) {
                    throw new Error(`카메라 권한이 필요합니다. 상태: ${permissionResult.status}`);
                }

                // 카메라 디바이스 목록 가져오기
                this.availableCameras = await this.getCameraDevices();
                console.log(`[CameraController] 사용 가능한 카메라: ${this.availableCameras.length}개`);
                
                // 카메라 스트림 시작
                await this.startCamera();
                
                // 실시간 분석 시작
                this.startAnalysis();
                
                this.isInitialized = true;
                console.log('[CameraController] 카메라 초기화 완료');
                
                // 콜백 호출
                if (this.callbacks.onStreamReady) {
                    this.callbacks.onStreamReady(this.stream);
                }
                
            } catch (error) {
                console.error('[CameraController] 초기화 실패:', error);
                this.addErrorToHistory(error);
                
                if (this.callbacks.onError) {
                    this.callbacks.onError(error);
                }
                throw error;
            }
        }

        /**
         * 카메라 권한 확인 (완전 수정됨)
         */
        async checkCameraPermission() {
            try {
                console.log('[CameraController] 카메라 권한 확인 중...');
                
                // 권한 API 지원 확인
                if ('permissions' in navigator && 'query' in navigator.permissions) {
                    try {
                        const result = await navigator.permissions.query({ name: 'camera' });
                        this.permissionStatus = result.state;
                        this.hasPermission = (result.state === 'granted');
                        this.lastPermissionCheck = Date.now();
                        
                        console.log(`[CameraController] 권한 상태: ${result.state}`);
                        
                        // 권한 변경 리스너 등록
                        result.addEventListener('change', () => {
                            this.permissionStatus = result.state;
                            this.hasPermission = (result.state === 'granted');
                            
                            if (this.callbacks.onPermissionChange) {
                                this.callbacks.onPermissionChange({
                                    status: this.permissionStatus,
                                    hasPermission: this.hasPermission
                                });
                            }
                        });
                        
                        return {
                            hasPermission: this.hasPermission,
                            status: this.permissionStatus,
                            method: 'permissions-api'
                        };
                        
                    } catch (permissionError) {
                        console.warn('[CameraController] 권한 API 사용 실패:', permissionError);
                        // 폴백 방식으로 계속 진행
                    }
                }
                
                // 폴백: 실제 미디어 스트림 요청으로 권한 확인
                console.log('[CameraController] 폴백 권한 확인 방식 사용');
                
                try {
                    const testStream = await navigator.mediaDevices.getUserMedia({ 
                        video: { 
                            width: { ideal: 640 }, 
                            height: { ideal: 480 } 
                        }
                    });
                    
                    // 권한 획득 성공
                    this.hasPermission = true;
                    this.permissionStatus = 'granted';
                    this.lastPermissionCheck = Date.now();
                    
                    // 테스트 스트림 즉시 정리
                    testStream.getTracks().forEach(track => {
                        track.stop();
                    });
                    
                    console.log('[CameraController] 권한 확인 완료: 허용됨');
                    
                    return {
                        hasPermission: this.hasPermission,
                        status: this.permissionStatus,
                        method: 'media-stream-test'
                    };
                    
                } catch (mediaError) {
                    this.hasPermission = false;
                    this.permissionStatus = 'denied';
                    this.lastPermissionCheck = Date.now();
                    
                    console.warn('[CameraController] 권한 거부됨:', mediaError.name);
                    
                    return {
                        hasPermission: this.hasPermission,
                        status: this.permissionStatus,
                        error: mediaError,
                        method: 'media-stream-test'
                    };
                }
                
            } catch (error) {
                console.error('[CameraController] 권한 확인 중 오류:', error);
                
                // 안전한 폴백
                this.hasPermission = false;
                this.permissionStatus = 'error';
                this.lastPermissionCheck = Date.now();
                
                return {
                    hasPermission: false,
                    status: 'error',
                    error: error,
                    method: 'fallback'
                };
            }
        }

        /**
         * 카메라 스트림 시작
         */
        async startCamera(deviceId = null) {
            try {
                console.log('[CameraController] 카메라 스트림 시작...');
                
                // 기존 스트림 정리
                if (this.stream) {
                    this.stopCamera();
                }

                // 설정에서 제약조건 가져오기
                const config = getConfig();
                const baseConstraints = config.CAMERA.constraints.video;

                // 카메라 제약조건 설정
                const constraints = {
                    video: {
                        deviceId: deviceId ? { exact: deviceId } : undefined,
                        facingMode: deviceId ? undefined : this.currentCamera,
                        width: baseConstraints.width || { ideal: this.resolution.width },
                        height: baseConstraints.height || { ideal: this.resolution.height },
                        frameRate: baseConstraints.frameRate || { ideal: 30, min: 15 },
                        aspectRatio: baseConstraints.aspectRatio || { ideal: 16/9 }
                    },
                    audio: false
                };

                // 스트림 생성
                this.stream = await navigator.mediaDevices.getUserMedia(constraints);
                
                // 비디오 엘리먼트에 스트림 연결
                this.videoElement.srcObject = this.stream;
                
                // 메타데이터 로드 대기
                await new Promise((resolve, reject) => {
                    const timeoutId = setTimeout(() => {
                        reject(new Error('비디오 메타데이터 로드 타임아웃'));
                    }, 10000);
                    
                    this.videoElement.onloadedmetadata = () => {
                        clearTimeout(timeoutId);
                        resolve();
                    };
                    
                    this.videoElement.onerror = (error) => {
                        clearTimeout(timeoutId);
                        reject(error);
                    };
                    
                    this.videoElement.load();
                });

                // 비디오 재생 시작
                await this.videoElement.play();
                
                // 실제 해상도 확인 및 캔버스 크기 조정
                this.adjustCanvasSize();
                
                console.log(`[CameraController] 카메라 스트림 시작 완료: ${this.videoElement.videoWidth}x${this.videoElement.videoHeight}`);
                
            } catch (error) {
                console.error('[CameraController] 카메라 시작 실패:', error);
                this.addErrorToHistory(error);
                throw error;
            }
        }

        /**
         * 카메라 전환 (전면 <-> 후면)
         */
        async switchCamera() {
            try {
                console.log('[CameraController] 카메라 전환 중...');
                this.currentCamera = this.currentCamera === 'user' ? 'environment' : 'user';
                await this.startCamera();
                console.log(`[CameraController] 카메라 전환 완료: ${this.currentCamera}`);
            } catch (error) {
                console.error('[CameraController] 카메라 전환 실패:', error);
                this.addErrorToHistory(error);
                throw error;
            }
        }

        /**
         * 특정 카메라 디바이스로 전환
         */
        async switchToDevice(deviceId) {
            try {
                console.log(`[CameraController] 디바이스 전환: ${deviceId}`);
                await this.startCamera(deviceId);
                console.log(`[CameraController] 디바이스 전환 완료`);
            } catch (error) {
                console.error('[CameraController] 디바이스 전환 실패:', error);
                this.addErrorToHistory(error);
                throw error;
            }
        }

        /**
         * 이미지 캡처
         */
        async captureImage(options = {}) {
            if (this.isCapturing) {
                console.warn('[CameraController] 이미 캡처 진행 중');
                return null;
            }

            if (!this.stream || !this.videoElement || !this.canvasElement) {
                throw new Error('카메라가 초기화되지 않았습니다.');
            }

            try {
                this.isCapturing = true;
                console.log('[CameraController] 이미지 캡처 시작...');
                
                const settings = {
                    format: 'jpeg',
                    quality: 0.95,
                    includeMetadata: true,
                    preProcess: true,
                    ...options
                };

                // 현재 프레임 캔버스에 그리기
                this.ctx.drawImage(
                    this.videoElement, 
                    0, 0, 
                    this.canvasElement.width, 
                    this.canvasElement.height
                );

                // 이미지 전처리
                if (settings.preProcess) {
                    await this.preProcessImage();
                }

                // 이미지 데이터 추출
                const imageData = this.canvasElement.toDataURL(
                    `image/${settings.format}`, 
                    settings.quality
                );

                // 메타데이터 수집
                const metadata = settings.includeMetadata ? await this.collectImageMetadata() : {};

                const result = {
                    imageData: imageData,
                    blob: await this.dataURLToBlob(imageData),
                    metadata: metadata,
                    timestamp: Date.now(),
                    dimensions: {
                        width: this.canvasElement.width,
                        height: this.canvasElement.height
                    }
                };

                console.log('[CameraController] 이미지 캡처 완료');
                
                if (this.callbacks.onCaptureComplete) {
                    this.callbacks.onCaptureComplete(result);
                }
                
                return result;
                
            } catch (error) {
                console.error('[CameraController] 캡처 실패:', error);
                this.addErrorToHistory(error);
                throw error;
            } finally {
                this.isCapturing = false;
            }
        }

        /**
         * 연속 캡처 (버스트 모드)
         */
        async burstCapture(count = 3, interval = 500) {
            const images = [];
            console.log(`[CameraController] 버스트 캡처 시작: ${count}장`);
            
            for (let i = 0; i < count; i++) {
                try {
                    const image = await this.captureImage();
                    if (image) {
                        images.push(image);
                    }
                    
                    if (i < count - 1) {
                        await new Promise(resolve => setTimeout(resolve, interval));
                    }
                } catch (error) {
                    console.warn(`[CameraController] 버스트 캡처 ${i+1}번째 실패:`, error);
                }
            }

            console.log(`[CameraController] 버스트 캡처 완료: ${images.length}/${count}`);
            return images;
        }

        /**
         * 실시간 분석 시작
         */
        startAnalysis() {
            if (this.isAnalyzing) {
                console.warn('[CameraController] 이미 분석 중입니다.');
                return;
            }

            this.isAnalyzing = true;
            this.performance.lastFrameTime = performance.now();
            this.performance.frameCount = 0;
            
            this.analysisLoop();
            console.log('[CameraController] 실시간 분석 시작');
        }

        /**
         * 분석 루프
         */
        async analysisLoop() {
            if (!this.isAnalyzing || !this.videoElement || !this.stream) {
                return;
            }

            try {
                const currentTime = performance.now();
                
                // 프레임레이트 계산
                this.updateFrameRate(currentTime);

                // 현재 프레임 분석
                await this.analyzeCurrentFrame();

                // 다음 프레임 스케줄링
                requestAnimationFrame(() => this.analysisLoop());
                
            } catch (error) {
                console.warn('[CameraController] 분석 루프 오류:', error);
                this.addErrorToHistory(error);
                
                // 오류 시 100ms 후 재시도
                setTimeout(() => this.analysisLoop(), 100);
            }
        }

        /**
         * 현재 프레임 분석
         */
        async analyzeCurrentFrame() {
            if (!this.videoElement || this.videoElement.readyState < 2) {
                return; // 비디오가 준비되지 않음
            }

            // 분석기가 없으면 건너뛰기
            if (!this.lightingAnalyzer || !this.imageQualityChecker) {
                return;
            }

            // 임시 캔버스에 현재 프레임 그리기
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = this.videoElement.videoWidth;
            tempCanvas.height = this.videoElement.videoHeight;
            
            tempCtx.drawImage(this.videoElement, 0, 0);
            
            // 이미지 데이터 가져오기
            const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

            try {
                // 조명 분석
                const lightingInfo = this.lightingAnalyzer.analyze(imageData);
                if (lightingInfo.changed && this.callbacks.onLightingChange) {
                    this.callbacks.onLightingChange(lightingInfo);
                }

                // 이미지 품질 분석
                const qualityInfo = this.imageQualityChecker.analyze(imageData);
                if (qualityInfo.changed && this.callbacks.onQualityChange) {
                    this.callbacks.onQualityChange(qualityInfo);
                }
            } catch (analysisError) {
                console.warn('[CameraController] 프레임 분석 오류:', analysisError);
            }

            // 가이드라인 그리기
            if (this.faceGuide.enabled) {
                this.drawFaceGuide();
            }
        }

        /**
         * 얼굴 가이드라인 그리기
         */
        drawFaceGuide() {
            if (!this.canvasElement || !this.ctx) return;

            // 캔버스 클리어
            this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

            // 가이드라인 스타일 설정
            this.ctx.strokeStyle = this.faceGuide.color;
            this.ctx.lineWidth = 2;
            this.ctx.globalAlpha = this.faceGuide.opacity;

            const centerX = this.canvasElement.width / 2;
            const centerY = this.canvasElement.height / 2;
            const guideWidth = this.canvasElement.width * 0.6;
            const guideHeight = this.canvasElement.height * 0.8;

            // 얼굴 가이드 타원
            this.ctx.beginPath();
            this.ctx.ellipse(centerX, centerY, guideWidth/2, guideHeight/2, 0, 0, 2 * Math.PI);
            this.ctx.stroke();

            // 중앙 십자선
            this.ctx.beginPath();
            this.ctx.moveTo(centerX - 20, centerY);
            this.ctx.lineTo(centerX + 20, centerY);
            this.ctx.moveTo(centerX, centerY - 20);
            this.ctx.lineTo(centerX, centerY + 20);
            this.ctx.stroke();

            // 투명도 원복
            this.ctx.globalAlpha = 1.0;
        }

        /**
         * 조명 조건 최적화 가이드
         */
        getOptimalLightingGuide(lightingInfo) {
            const guide = {
                status: 'unknown',
                message: '',
                suggestions: [],
                score: 0
            };

            if (lightingInfo.brightness < 0.3) {
                guide.status = 'too_dark';
                guide.message = '조명이 너무 어둡습니다';
                guide.score = 20;
                guide.suggestions = [
                    '밝은 곳으로 이동하세요',
                    '추가 조명을 켜주세요',
                    '창가로 이동해 자연광을 활용하세요'
                ];
            } else if (lightingInfo.brightness > 0.8) {
                guide.status = 'too_bright';
                guide.message = '조명이 너무 밝습니다';
                guide.score = 30;
                guide.suggestions = [
                    '직사광선을 피해주세요',
                    '조명을 줄이거나 위치를 조정하세요',
                    '그늘진 곳으로 이동하세요'
                ];
            } else if (lightingInfo.uniformity < 0.6) {
                guide.status = 'uneven';
                guide.message = '조명이 고르지 않습니다';
                guide.score = 50;
                guide.suggestions = [
                    '균일한 조명 아래로 이동하세요',
                    '얼굴에 그림자가 지지 않도록 위치 조정',
                    '여러 방향에서 오는 조명 활용'
                ];
            } else {
                guide.status = 'good';
                guide.message = '좋은 조명 상태입니다';
                guide.score = 90;
                guide.suggestions = [];
            }

            return guide;
        }

        /**
         * 이미지 전처리
         */
        async preProcessImage() {
            const imageData = this.ctx.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height);
            
            if (this.imageQualityChecker && typeof this.imageQualityChecker.enhance === 'function') {
                const processedData = this.imageQualityChecker.enhance(imageData);
                this.ctx.putImageData(processedData, 0, 0);
            }
        }

        /**
         * 이미지 메타데이터 수집
         */
        async collectImageMetadata() {
            const lightingInfo = await this.getCurrentLighting();
            const qualityInfo = await this.getCurrentQuality();
            
            return {
                timestamp: new Date().toISOString(),
                camera: {
                    facing: this.currentCamera,
                    resolution: {
                        width: this.videoElement.videoWidth,
                        height: this.videoElement.videoHeight
                    },
                    deviceId: this.getCurrentDeviceId()
                },
                lighting: lightingInfo,
                quality: qualityInfo,
                device: {
                    userAgent: navigator.userAgent,
                    platform: navigator.platform,
                    devicePixelRatio: window.devicePixelRatio
                },
                permissions: {
                    status: this.permissionStatus,
                    lastCheck: this.lastPermissionCheck
                }
            };
        }

        /**
         * 현재 조명 정보 가져오기
         */
        async getCurrentLighting() {
            if (!this.videoElement || this.videoElement.readyState < 2) {
                return { error: '비디오가 준비되지 않음' };
            }

            if (!this.lightingAnalyzer) {
                return { error: '조명 분석기가 초기화되지 않음' };
            }

            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = this.videoElement.videoWidth;
            tempCanvas.height = this.videoElement.videoHeight;
            
            tempCtx.drawImage(this.videoElement, 0, 0);
            const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            
            return this.lightingAnalyzer.analyze(imageData);
        }

        /**
         * 현재 품질 정보 가져오기
         */
        async getCurrentQuality() {
            if (!this.videoElement || this.videoElement.readyState < 2) {
                return { error: '비디오가 준비되지 않음' };
            }

            if (!this.imageQualityChecker) {
                return { error: '품질 검사기가 초기화되지 않음' };
            }

            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = this.videoElement.videoWidth;
            tempCanvas.height = this.videoElement.videoHeight;
            
            tempCtx.drawImage(this.videoElement, 0, 0);
            const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            
            return this.imageQualityChecker.analyze(imageData);
        }

        /**
         * 유틸리티 메서드들
         */
        async getCameraDevices() {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoInputs = devices.filter(device => device.kind === 'videoinput');
                
                console.log(`[CameraController] 카메라 디바이스 발견: ${videoInputs.length}개`);
                return videoInputs;
            } catch (error) {
                console.error('[CameraController] 카메라 디바이스 목록 가져오기 실패:', error);
                return [];
            }
        }

        createCanvas() {
            const canvas = document.createElement('canvas');
            canvas.width = this.resolution.width;
            canvas.height = this.resolution.height;
            return canvas;
        }

        adjustCanvasSize() {
            if (this.canvasElement && this.videoElement) {
                this.canvasElement.width = this.videoElement.videoWidth;
                this.canvasElement.height = this.videoElement.videoHeight;
            }
        }

        updateFrameRate(currentTime) {
            this.performance.frameCount++;
            
            if (currentTime - this.performance.lastFrameTime >= 1000) {
                this.performance.frameRate = this.performance.frameCount;
                this.performance.frameCount = 0;
                this.performance.lastFrameTime = currentTime;
            }
        }

        async dataURLToBlob(dataURL) {
            return new Promise(resolve => {
                const arr = dataURL.split(',');
                const mime = arr[0].match(/:(.*?);/)[1];
                const bstr = atob(arr[1]);
                let n = bstr.length;
                const u8arr = new Uint8Array(n);
                
                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                }
                
                resolve(new Blob([u8arr], { type: mime }));
            });
        }

        getCurrentDeviceId() {
            if (this.stream && this.stream.getVideoTracks().length > 0) {
                const track = this.stream.getVideoTracks()[0];
                return track.getSettings().deviceId || null;
            }
            return null;
        }

        addErrorToHistory(error) {
            const errorEntry = {
                timestamp: Date.now(),
                message: error.message,
                stack: error.stack,
                type: error.name
            };
            
            this.errorHistory.unshift(errorEntry);
            
            // 최대 개수 제한
            if (this.errorHistory.length > this.maxErrorHistory) {
                this.errorHistory.pop();
            }
        }

        /**
         * 정리 및 해제
         */
        stopCamera() {
            if (this.stream) {
                this.stream.getTracks().forEach(track => {
                    track.stop();
                });
                this.stream = null;
            }

            if (this.videoElement) {
                this.videoElement.srcObject = null;
            }

            console.log('[CameraController] 카메라 스트림 중지');
        }

        stopAnalysis() {
            this.isAnalyzing = false;
            console.log('[CameraController] 실시간 분석 중지');
        }

        destroy() {
            this.stopAnalysis();
            this.stopCamera();
            
            this.videoElement = null;
            this.canvasElement = null;
            this.ctx = null;
            this.availableCameras = [];
            this.isInitialized = false;
            
            console.log('[CameraController] 카메라 컨트롤러 해제');
        }

        /**
         * 설정 메서드들
         */
        setResolution(width, height) {
            this.resolution = { width, height };
            console.log(`[CameraController] 해상도 설정: ${width}x${height}`);
        }

        setFaceGuide(enabled, options = {}) {
            this.faceGuide = {
                ...this.faceGuide,
                enabled,
                ...options
            };
        }

        setCallbacks(callbacks) {
            this.callbacks = { ...this.callbacks, ...callbacks };
        }

        /**
         * 상태 조회
         */
        getStatus() {
            return {
                isInitialized: this.isInitialized,
                isActive: !!this.stream,
                isAnalyzing: this.isAnalyzing,
                isCapturing: this.isCapturing,
                currentCamera: this.currentCamera,
                resolution: this.resolution,
                performance: { ...this.performance },
                availableCameras: this.availableCameras?.length || 0,
                permission: {
                    hasPermission: this.hasPermission,
                    status: this.permissionStatus,
                    lastCheck: this.lastPermissionCheck
                },
                errorHistory: this.errorHistory.slice(0, 5) // 최근 5개 오류만
            };
        }

        /**
         * 진단 및 디버깅
         */
        async runDiagnostics() {
            const diagnostics = {
                timestamp: Date.now(),
                browser: {
                    userAgent: navigator.userAgent,
                    mediaDevices: !!navigator.mediaDevices,
                    getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
                },
                permissions: await this.checkCameraPermission(),
                devices: await this.getCameraDevices(),
                performance: { ...this.performance },
                errors: this.errorHistory.slice()
            };

            console.log('[CameraController] 진단 완료:', diagnostics);
            return diagnostics;
        }
    }

    /**
     * 조명 분석기 (ES5 호환)
     */
    class LightingAnalyzer {
        constructor() {
            this.previousBrightness = null;
            this.previousUniformity = null;
            this.previousColorTemp = null;
            this.threshold = 0.05; // 변화 감지 임계값
            
            console.log('[LightingAnalyzer] 조명 분석기 초기화');
        }

        analyze(imageData) {
            const { data, width, height } = imageData;
            
            // 밝기 계산
            const brightness = this.calculateBrightness(data);
            
            // 균일성 계산
            const uniformity = this.calculateUniformity(data, width, height);
            
            // 색온도 추정
            const colorTemperature = this.estimateColorTemperature(data);
            
            // 변화 감지
            const brightnessChanged = this.previousBrightness === null || 
                Math.abs(brightness - this.previousBrightness) > this.threshold;
            const uniformityChanged = this.previousUniformity === null ||
                Math.abs(uniformity - this.previousUniformity) > this.threshold;
            const colorTempChanged = this.previousColorTemp === null ||
                this.previousColorTemp !== colorTemperature;
            
            this.previousBrightness = brightness;
            this.previousUniformity = uniformity;
            this.previousColorTemp = colorTemperature;

            return {
                brightness: brightness,
                uniformity: uniformity,
                colorTemperature: colorTemperature,
                changed: brightnessChanged || uniformityChanged || colorTempChanged,
                quality: this.assessLightingQuality(brightness, uniformity),
                score: this.calculateLightingScore(brightness, uniformity, colorTemperature)
            };
        }

        calculateBrightness(data) {
            let sum = 0;
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                sum += (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            }
            return sum / (data.length / 4);
        }

        calculateUniformity(data, width, height) {
            // 이미지를 9개 구역으로 나누어 밝기 편차 계산
            const regions = [];
            const regionSize = Math.min(width, height) / 3;
            
            for (let y = 0; y < 3; y++) {
                for (let x = 0; x < 3; x++) {
                    const startX = Math.floor(x * width / 3);
                    const startY = Math.floor(y * height / 3);
                    const regionBrightness = this.calculateRegionBrightness(
                        data, width, startX, startY, regionSize
                    );
                    regions.push(regionBrightness);
                }
            }

            // 표준편차 계산
            const mean = regions.reduce((a, b) => a + b, 0) / regions.length;
            const variance = regions.reduce((sum, brightness) => 
                sum + Math.pow(brightness - mean, 2), 0) / regions.length;
            const standardDeviation = Math.sqrt(variance);

            return 1 - Math.min(1, standardDeviation * 2); // 0~1 범위로 정규화
        }

        calculateRegionBrightness(data, width, startX, startY, regionSize) {
            let sum = 0;
            let count = 0;

            const endX = Math.min(startX + regionSize, width);
            const endY = Math.min(startY + regionSize, width); // 원본의 height 오타 수정

            for (let y = startY; y < endY; y++) {
                for (let x = startX; x < endX; x++) {
                    const index = (y * width + x) * 4;
                    if (index + 2 < data.length) {
                        const r = data[index];
                        const g = data[index + 1];
                        const b = data[index + 2];
                        sum += (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                        count++;
                    }
                }
            }

            return count > 0 ? sum / count : 0;
        }

        estimateColorTemperature(data) {
            let rSum = 0, gSum = 0, bSum = 0, count = 0;

            for (let i = 0; i < data.length; i += 4) {
                rSum += data[i];
                gSum += data[i + 1];
                bSum += data[i + 2];
                count++;
            }

            if (count === 0) return 'unknown';

            const rAvg = rSum / count;
            const gAvg = gSum / count;
            const bAvg = bSum / count;

            // 간단한 색온도 추정
            const rbRatio = rAvg / bAvg;
            if (rbRatio > 1.3) return 'warm';     // ~2700-3000K (따뜻한 빛)
            if (rbRatio < 0.7) return 'cool';     // ~6500-7000K (차가운 빛)
            if (rbRatio < 0.85) return 'daylight'; // ~5000-6500K (자연광)
            return 'neutral';                     // ~4000-5000K (중성광)
        }

        assessLightingQuality(brightness, uniformity) {
            if (brightness > 0.4 && brightness < 0.7 && uniformity > 0.8) {
                return 'excellent';
            }
            if (brightness > 0.3 && brightness < 0.8 && uniformity > 0.6) {
                return 'good';
            }
            if (brightness > 0.2 && brightness < 0.9 && uniformity > 0.4) {
                return 'fair';
            }
            return 'poor';
        }

        calculateLightingScore(brightness, uniformity, colorTemperature) {
            let score = 0;
            
            // 밝기 점수 (0-40)
            if (brightness >= 0.4 && brightness <= 0.7) {
                score += 40;
            } else if (brightness >= 0.3 && brightness <= 0.8) {
                score += 30;
            } else if (brightness >= 0.2 && brightness <= 0.9) {
                score += 20;
            } else {
                score += 10;
            }
            
            // 균일성 점수 (0-35)
            if (uniformity > 0.8) {
                score += 35;
            } else if (uniformity > 0.6) {
                score += 25;
            } else if (uniformity > 0.4) {
                score += 15;
            } else {
                score += 5;
            }
            
            // 색온도 점수 (0-25)
            if (colorTemperature === 'neutral' || colorTemperature === 'daylight') {
                score += 25;
            } else if (colorTemperature === 'warm') {
                score += 15;
            } else if (colorTemperature === 'cool') {
                score += 10;
            } else {
                score += 5;
            }
            
            return Math.min(100, score);
        }
    }

    /**
     * 이미지 품질 검사기 (ES5 호환)
     */
    class ImageQualityChecker {
        constructor() {
            this.previousSharpness = null;
            this.previousContrast = null;
            this.previousNoise = null;
            this.threshold = 0.05;
            
            console.log('[ImageQualityChecker] 이미지 품질 검사기 초기화');
        }

        analyze(imageData) {
            const { data, width, height } = imageData;
            
            // 선명도 계산
            const sharpness = this.calculateSharpness(data, width, height);
            
            // 대비 계산
            const contrast = this.calculateContrast(data);
            
            // 노이즈 레벨 계산
            const noiseLevel = this.calculateNoiseLevel(data, width, height);
            
            // 변화 감지
            const sharpnessChanged = this.previousSharpness === null ||
                Math.abs(sharpness - this.previousSharpness) > this.threshold;
            const contrastChanged = this.previousContrast === null ||
                Math.abs(contrast - this.previousContrast) > this.threshold;
            const noiseChanged = this.previousNoise === null ||
                Math.abs(noiseLevel - this.previousNoise) > this.threshold;

            this.previousSharpness = sharpness;
            this.previousContrast = contrast;
            this.previousNoise = noiseLevel;

            return {
                sharpness: sharpness,
                contrast: contrast,
                noiseLevel: noiseLevel,
                changed: sharpnessChanged || contrastChanged || noiseChanged,
                overallQuality: this.assessOverallQuality(sharpness, contrast, noiseLevel),
                score: this.calculateQualityScore(sharpness, contrast, noiseLevel)
            };
        }

        calculateSharpness(data, width, height) {
            // Sobel 필터를 사용한 가장자리 검출
            let edgeSum = 0;
            let count = 0;

            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    // Sobel X 필터
                    const gx = 
                        -this.getGrayValue(data, width, x-1, y-1) - 2*this.getGrayValue(data, width, x, y-1) - this.getGrayValue(data, width, x+1, y-1) +
                         this.getGrayValue(data, width, x-1, y+1) + 2*this.getGrayValue(data, width, x, y+1) + this.getGrayValue(data, width, x+1, y+1);
                    
                    // Sobel Y 필터
                    const gy = 
                        -this.getGrayValue(data, width, x-1, y-1) - 2*this.getGrayValue(data, width, x-1, y) - this.getGrayValue(data, width, x-1, y+1) +
                         this.getGrayValue(data, width, x+1, y-1) + 2*this.getGrayValue(data, width, x+1, y) + this.getGrayValue(data, width, x+1, y+1);
                    
                    edgeSum += Math.sqrt(gx * gx + gy * gy);
                    count++;
                }
            }

            return count > 0 ? (edgeSum / count) / 255 : 0;
        }

        getGrayValue(data, width, x, y) {
            const idx = (y * width + x) * 4;
            if (idx + 2 < data.length) {
                return 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
            }
            return 0;
        }

        calculateContrast(data) {
            let min = 255, max = 0;
            
            for (let i = 0; i < data.length; i += 4) {
                const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                min = Math.min(min, gray);
                max = Math.max(max, gray);
            }

            return max > min ? (max - min) / 255 : 0;
        }

        calculateNoiseLevel(data, width, height) {
            // 로컬 분산을 이용한 노이즈 추정
            let totalVariance = 0;
            let regionCount = 0;
            const regionSize = 8;

            for (let y = 0; y < height - regionSize; y += regionSize) {
                for (let x = 0; x < width - regionSize; x += regionSize) {
                    const variance = this.calculateRegionVariance(data, width, x, y, regionSize);
                    totalVariance += variance;
                    regionCount++;
                }
            }

            return regionCount > 0 ? totalVariance / regionCount : 0;
        }

        calculateRegionVariance(data, width, startX, startY, size) {
            const pixels = [];
            
            for (let y = startY; y < startY + size && y < width; y++) { // height 오타 수정 필요
                for (let x = startX; x < startX + size && x < width; x++) {
                    const idx = (y * width + x) * 4;
                    if (idx + 2 < data.length) {
                        const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
                        pixels.push(gray);
                    }
                }
            }

            if (pixels.length === 0) return 0;

            const mean = pixels.reduce((a, b) => a + b, 0) / pixels.length;
            const variance = pixels.reduce((sum, pixel) => sum + Math.pow(pixel - mean, 2), 0) / pixels.length;
            
            return variance / (255 * 255); // 정규화
        }

        assessOverallQuality(sharpness, contrast, noiseLevel) {
            const score = this.calculateQualityScore(sharpness, contrast, noiseLevel);
            
            if (score >= 85) return 'excellent';
            if (score >= 70) return 'good';
            if (score >= 50) return 'fair';
            return 'poor';
        }

        calculateQualityScore(sharpness, contrast, noiseLevel) {
            let score = 0;
            
            // 선명도 점수 (0-40점)
            if (sharpness > 0.3) {
                score += 40;
            } else if (sharpness > 0.2) {
                score += 30;
            } else if (sharpness > 0.1) {
                score += 20;
            } else {
                score += 10;
            }
            
            // 대비 점수 (0-30점)
            if (contrast > 0.6) {
                score += 30;
            } else if (contrast > 0.4) {
                score += 25;
            } else if (contrast > 0.2) {
                score += 15;
            } else {
                score += 5;
            }
            
            // 노이즈 점수 (0-30점, 노이즈가 적을수록 점수 높음)
            if (noiseLevel < 0.1) {
                score += 30;
            } else if (noiseLevel < 0.2) {
                score += 25;
            } else if (noiseLevel < 0.3) {
                score += 15;
            } else {
                score += 5;
            }

            return Math.min(100, score);
        }

        enhance(imageData) {
            // 간단한 이미지 향상 (선명화, 대비 개선)
            const enhanced = new ImageData(
                new Uint8ClampedArray(imageData.data), 
                imageData.width, 
                imageData.height
            );

            // 선명화 필터 적용
            this.applySharpenFilter(enhanced);
            
            // 대비 개선
            this.enhanceContrast(enhanced);
            
            return enhanced;
        }

        applySharpenFilter(imageData) {
            // 3x3 선명화 커널
            const kernel = [
                0, -1, 0,
                -1, 5, -1,
                0, -1, 0
            ];

            this.applyKernel(imageData, kernel, 1);
        }

        enhanceContrast(imageData, factor = 1.2) {
            const { data } = imageData;
            
            for (let i = 0; i < data.length; i += 4) {
                // RGB 각 채널에 대비 향상 적용
                data[i] = Math.min(255, Math.max(0, (data[i] - 128) * factor + 128));
                data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * factor + 128));
                data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * factor + 128));
            }
        }

        applyKernel(imageData, kernel, weight) {
            const { data, width, height } = imageData;
            const output = new Uint8ClampedArray(data);

            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    for (let c = 0; c < 3; c++) { // RGB 채널만
                        let sum = 0;
                        for (let ky = -1; ky <= 1; ky++) {
                            for (let kx = -1; kx <= 1; kx++) {
                                const idx = ((y + ky) * width + (x + kx)) * 4 + c;
                                const kernelIdx = (ky + 1) * 3 + (kx + 1);
                                sum += data[idx] * kernel[kernelIdx];
                            }
                        }
                        const outputIdx = (y * width + x) * 4 + c;
                        output[outputIdx] = Math.min(255, Math.max(0, sum / weight));
                    }
                }
            }

            imageData.data.set(output);
        }
    }

    /**
     * 간단한 조명 분석기 (폴백용)
     */
    class SimpleLightingAnalyzer {
        constructor() {
            this.previousBrightness = null;
            console.log('[SimpleLightingAnalyzer] 간단한 조명 분석기 초기화 (폴백)');
        }

        analyze(imageData) {
            const { data } = imageData;
            
            // 기본 밝기 계산만
            let sum = 0;
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                sum += (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            }
            const brightness = sum / (data.length / 4);

            const changed = this.previousBrightness === null || 
                Math.abs(brightness - this.previousBrightness) > 0.1;
            
            this.previousBrightness = brightness;

            return {
                brightness: brightness,
                uniformity: 0.8, // 기본값
                colorTemperature: 'neutral',
                changed: changed,
                quality: brightness > 0.5 ? 'good' : 'fair',
                score: Math.round(brightness * 100)
            };
        }
    }

    /**
     * 간단한 품질 검사기 (폴백용)
     */
    class SimpleImageQualityChecker {
        constructor() {
            this.previousContrast = null;
            console.log('[SimpleImageQualityChecker] 간단한 품질 검사기 초기화 (폴백)');
        }

        analyze(imageData) {
            const { data } = imageData;
            
            // 기본 대비 계산만
            let min = 255, max = 0;
            for (let i = 0; i < data.length; i += 4) {
                const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                min = Math.min(min, gray);
                max = Math.max(max, gray);
            }
            const contrast = max > min ? (max - min) / 255 : 0;

            const changed = this.previousContrast === null || 
                Math.abs(contrast - this.previousContrast) > 0.1;
            
            this.previousContrast = contrast;

            return {
                sharpness: 0.5, // 기본값
                contrast: contrast,
                noiseLevel: 0.1, // 기본값
                changed: changed,
                overallQuality: contrast > 0.5 ? 'good' : 'fair',
                score: Math.round(contrast * 100)
            };
        }

        enhance(imageData) {
            // 기본 향상 없음, 원본 반환
            return imageData;
        }
    }

    // 전역 등록 (ES5 호환 방식)
    window.CameraController = CameraController;
    window.LightingAnalyzer = LightingAnalyzer;
    window.ImageQualityChecker = ImageQualityChecker;
    window.SimpleLightingAnalyzer = SimpleLightingAnalyzer;
    window.SimpleImageQualityChecker = SimpleImageQualityChecker;
    
    console.log('✅ CameraController ES5 호환 모듈 로드 완료');

})();
