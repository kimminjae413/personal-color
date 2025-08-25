/**
 * 헤어디자이너용 퍼스널컬러 진단 - 카메라 제어 유틸리티
 * 태블릿 최적화 카메라 제어, 조명 분석, 이미지 품질 검증
 * 
 * 주요 기능:
 * - 고품질 카메라 스트림 관리
 * - 조명 조건 실시간 분석
 * - 이미지 캡처 및 전처리
 * - 얼굴 감지 영역 가이드
 * - 태블릿 터치 제스처 지원
 */

import { CONFIG } from '../config.js';

class CameraController {
    constructor() {
        this.stream = null;
        this.videoElement = null;
        this.canvasElement = null;
        this.ctx = null;
        
        // 카메라 설정
        this.currentCamera = 'user'; // 'user' (전면) 또는 'environment' (후면)
        this.resolution = { width: 1280, height: 720 };
        this.isCapturing = false;
        this.isAnalyzing = false;
        
        // 조명 및 품질 분석
        this.lightingAnalyzer = new LightingAnalyzer();
        this.imageQualityChecker = new ImageQualityChecker();
        
        // 이벤트 콜백
        this.callbacks = {
            onStreamReady: null,
            onCaptureComplete: null,
            onError: null,
            onLightingChange: null,
            onQualityChange: null
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

        console.log('[CameraController] 카메라 컨트롤러 초기화');
    }

    /**
     * 카메라 초기화 및 스트림 시작
     */
    async initialize(videoElement, canvasElement = null) {
        try {
            this.videoElement = videoElement;
            this.canvasElement = canvasElement || this.createCanvas();
            this.ctx = this.canvasElement.getContext('2d');

            // 카메라 권한 확인
            const hasPermission = await this.checkCameraPermission();
            if (!hasPermission) {
                throw new Error('카메라 권한이 필요합니다.');
            }

            // 카메라 디바이스 목록 가져오기
            this.availableCameras = await this.getCameraDevices();
            
            // 카메라 스트림 시작
            await this.startCamera();
            
            // 실시간 분석 시작
            this.startAnalysis();
            
            console.log('[CameraController] 카메라 초기화 완료');
            this.callbacks.onStreamReady?.(this.stream);
            
        } catch (error) {
            console.error('[CameraController] 초기화 실패:', error);
            this.callbacks.onError?.(error);
            throw error;
        }
    }

    /**
     * 카메라 스트림 시작
     */
    async startCamera(deviceId = null) {
        try {
            // 기존 스트림 정리
            if (this.stream) {
                this.stopCamera();
            }

            // 카메라 제약조건 설정
            const constraints = {
                video: {
                    deviceId: deviceId || undefined,
                    facingMode: deviceId ? undefined : this.currentCamera,
                    width: { ideal: this.resolution.width },
                    height: { ideal: this.resolution.height },
                    frameRate: { ideal: 30, min: 15 },
                    
                    // 이미지 품질 향상 설정
                    focusMode: 'continuous',
                    exposureMode: 'continuous',
                    whiteBalanceMode: 'continuous',
                    
                    // 태블릿 최적화
                    aspectRatio: { ideal: 16/9 },
                    resizeMode: 'crop-and-scale'
                },
                audio: false
            };

            // 스트림 생성
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            // 비디오 엘리먼트에 스트림 연결
            this.videoElement.srcObject = this.stream;
            
            // 메타데이터 로드 대기
            await new Promise((resolve, reject) => {
                this.videoElement.onloadedmetadata = resolve;
                this.videoElement.onerror = reject;
                this.videoElement.load();
            });

            // 비디오 재생 시작
            await this.videoElement.play();
            
            // 실제 해상도 확인 및 캔버스 크기 조정
            this.adjustCanvasSize();
            
            console.log(`[CameraController] 카메라 스트림 시작: ${this.videoElement.videoWidth}x${this.videoElement.videoHeight}`);
            
        } catch (error) {
            console.error('[CameraController] 카메라 시작 실패:', error);
            throw error;
        }
    }

    /**
     * 카메라 전환 (전면 <-> 후면)
     */
    async switchCamera() {
        try {
            this.currentCamera = this.currentCamera === 'user' ? 'environment' : 'user';
            await this.startCamera();
            console.log(`[CameraController] 카메라 전환: ${this.currentCamera}`);
        } catch (error) {
            console.error('[CameraController] 카메라 전환 실패:', error);
        }
    }

    /**
     * 특정 카메라 디바이스로 전환
     */
    async switchToDevice(deviceId) {
        try {
            await this.startCamera(deviceId);
            console.log(`[CameraController] 디바이스 전환: ${deviceId}`);
        } catch (error) {
            console.error('[CameraController] 디바이스 전환 실패:', error);
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

        try {
            this.isCapturing = true;
            
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
            this.callbacks.onCaptureComplete?.(result);
            
            return result;
            
        } catch (error) {
            console.error('[CameraController] 캡처 실패:', error);
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
        
        for (let i = 0; i < count; i++) {
            try {
                const image = await this.captureImage();
                images.push(image);
                
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
        if (this.isAnalyzing) return;

        this.isAnalyzing = true;
        this.analysisLoop();
        console.log('[CameraController] 실시간 분석 시작');
    }

    /**
     * 분석 루프
     */
    async analysisLoop() {
        if (!this.isAnalyzing || !this.videoElement) return;

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
            setTimeout(() => this.analysisLoop(), 100); // 오류 시 100ms 후 재시도
        }
    }

    /**
     * 현재 프레임 분석
     */
    async analyzeCurrentFrame() {
        // 임시 캔버스에 현재 프레임 그리기
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = this.videoElement.videoWidth;
        tempCanvas.height = this.videoElement.videoHeight;
        
        tempCtx.drawImage(this.videoElement, 0, 0);
        
        // 이미지 데이터 가져오기
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

        // 조명 분석
        const lightingInfo = this.lightingAnalyzer.analyze(imageData);
        if (lightingInfo.changed) {
            this.callbacks.onLightingChange?.(lightingInfo);
        }

        // 이미지 품질 분석
        const qualityInfo = this.imageQualityChecker.analyze(imageData);
        if (qualityInfo.changed) {
            this.callbacks.onQualityChange?.(qualityInfo);
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
            suggestions: []
        };

        if (lightingInfo.brightness < 0.3) {
            guide.status = 'too_dark';
            guide.message = '조명이 너무 어둡습니다';
            guide.suggestions = [
                '밝은 곳으로 이동하세요',
                '추가 조명을 켜주세요',
                '창가로 이동해 자연광을 활용하세요'
            ];
        } else if (lightingInfo.brightness > 0.8) {
            guide.status = 'too_bright';
            guide.message = '조명이 너무 밝습니다';
            guide.suggestions = [
                '직사광선을 피해주세요',
                '조명을 줄이거나 위치를 조정하세요',
                '그늘진 곳으로 이동하세요'
            ];
        } else if (lightingInfo.uniformity < 0.6) {
            guide.status = 'uneven';
            guide.message = '조명이 고르지 않습니다';
            guide.suggestions = [
                '균일한 조명 아래로 이동하세요',
                '얼굴에 그림자가 지지 않도록 위치 조정',
                '여러 방향에서 오는 조명 활용'
            ];
        } else {
            guide.status = 'good';
            guide.message = '좋은 조명 상태입니다';
            guide.suggestions = [];
        }

        return guide;
    }

    /**
     * 이미지 전처리
     */
    async preProcessImage() {
        const imageData = this.ctx.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height);
        const processedData = this.imageQualityChecker.enhance(imageData);
        this.ctx.putImageData(processedData, 0, 0);
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
                }
            },
            lighting: lightingInfo,
            quality: qualityInfo,
            device: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                devicePixelRatio: window.devicePixelRatio
            }
        };
    }

    /**
     * 현재 조명 정보 가져오기
     */
    async getCurrentLighting() {
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
    async checkCameraPermission() {
        try {
            const result = await navigator.permissions.query({ name: 'camera' });
            return result.state === 'granted' || result.state === 'prompt';
        } catch (error) {
            console.warn('[CameraController] 권한 확인 불가:', error);
            return true; // 권한 API를 지원하지 않는 경우 시도해볼 수 있도록
        }
    }

    async getCameraDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            return devices.filter(device => device.kind === 'videoinput');
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
        this.frameCount++;
        
        if (currentTime - this.lastFrameTime >= 1000) {
            this.performance.frameRate = this.frameCount;
            this.frameCount = 0;
            this.lastFrameTime = currentTime;
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
            isActive: !!this.stream,
            isAnalyzing: this.isAnalyzing,
            isCapturing: this.isCapturing,
            currentCamera: this.currentCamera,
            resolution: this.resolution,
            performance: this.performance,
            availableCameras: this.availableCameras?.length || 0
        };
    }
}

/**
 * 조명 분석기
 */
class LightingAnalyzer {
    constructor() {
        this.previousBrightness = null;
        this.previousUniformity = null;
        this.threshold = 0.05; // 변화 감지 임계값
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
        
        this.previousBrightness = brightness;
        this.previousUniformity = uniformity;

        return {
            brightness: brightness,
            uniformity: uniformity,
            colorTemperature: colorTemperature,
            changed: brightnessChanged || uniformityChanged,
            quality: this.assessLightingQuality(brightness, uniformity)
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

        for (let y = startY; y < startY + regionSize && y < width; y++) {
            for (let x = startX; x < startX + regionSize && x < width; x++) {
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

        const rAvg = rSum / count;
        const gAvg = gSum / count;
        const bAvg = bSum / count;

        // 간단한 색온도 추정 (켈빈)
        const ratio = rAvg / bAvg;
        if (ratio > 1.2) return 'warm'; // ~3000K
        if (ratio < 0.8) return 'cool';  // ~6500K
        return 'neutral'; // ~5000K
    }

    assessLightingQuality(brightness, uniformity) {
        if (brightness > 0.4 && brightness < 0.7 && uniformity > 0.7) {
            return 'excellent';
        }
        if (brightness > 0.3 && brightness < 0.8 && uniformity > 0.5) {
            return 'good';
        }
        if (brightness > 0.2 && brightness < 0.9 && uniformity > 0.3) {
            return 'fair';
        }
        return 'poor';
    }
}

/**
 * 이미지 품질 검사기
 */
class ImageQualityChecker {
    constructor() {
        this.previousSharpness = null;
        this.previousContrast = null;
        this.threshold = 0.05;
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

        this.previousSharpness = sharpness;
        this.previousContrast = contrast;

        return {
            sharpness: sharpness,
            contrast: contrast,
            noiseLevel: noiseLevel,
            changed: sharpnessChanged || contrastChanged,
            overallQuality: this.assessOverallQuality(sharpness, contrast, noiseLevel)
        };
    }

    calculateSharpness(data, width, height) {
        // Sobel 필터를 사용한 가장자리 검출
        let edgeSum = 0;
        let count = 0;

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;
                
                // 그레이스케일 변환
                const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
                
                // Sobel X
                const gx = 
                    -data[((y-1) * width + (x-1)) * 4] - 2*data[((y-1) * width + x) * 4] - data[((y-1) * width + (x+1)) * 4] +
                     data[((y+1) * width + (x-1)) * 4] + 2*data[((y+1) * width + x) * 4] + data[((y+1) * width + (x+1)) * 4];
                
                // Sobel Y  
                const gy = 
                    -data[((y-1) * width + (x-1)) * 4] - 2*data[(y * width + (x-1)) * 4] - data[((y+1) * width + (x-1)) * 4] +
                     data[((y-1) * width + (x+1)) * 4] + 2*data[(y * width + (x+1)) * 4] + data[((y+1) * width + (x+1)) * 4];
                
                edgeSum += Math.sqrt(gx * gx + gy * gy);
                count++;
            }
        }

        return count > 0 ? (edgeSum / count) / 255 : 0;
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
        
        for (let y = startY; y < startY + size; y++) {
            for (let x = startX; x < startX + size; x++) {
                const idx = (y * width + x) * 4;
                const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
                pixels.push(gray);
            }
        }

        const mean = pixels.reduce((a, b) => a + b, 0) / pixels.length;
        const variance = pixels.reduce((sum, pixel) => sum + Math.pow(pixel - mean, 2), 0) / pixels.length;
        
        return variance / (255 * 255); // 정규화
    }

    assessOverallQuality(sharpness, contrast, noiseLevel) {
        let score = 0;
        
        // 선명도 점수 (0-40점)
        if (sharpness > 0.3) score += 40;
        else if (sharpness > 0.2) score += 30;
        else if (sharpness > 0.1) score += 20;
        else score += 10;
        
        // 대비 점수 (0-30점)
        if (contrast > 0.6) score += 30;
        else if (contrast > 0.4) score += 25;
        else if (contrast > 0.2) score += 15;
        else score += 5;
        
        // 노이즈 점수 (0-30점, 노이즈가 적을수록 점수 높음)
        if (noiseLevel < 0.1) score += 30;
        else if (noiseLevel < 0.2) score += 25;
        else if (noiseLevel < 0.3) score += 15;
        else score += 5;

        if (score >= 85) return 'excellent';
        if (score >= 70) return 'good';
        if (score >= 50) return 'fair';
        return 'poor';
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

export { CameraController, LightingAnalyzer, ImageQualityChecker };
