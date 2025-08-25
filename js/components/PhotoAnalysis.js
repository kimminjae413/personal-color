/**
 * PhotoAnalysis - AI 사진 분석 컴포넌트
 * 카메라 촬영 및 이미지 업로드를 통한 자동 피부톤 분석
 */

class PhotoAnalysis {
    constructor() {
        this.isInitialized = false;
        this.camera = null;
        this.video = null;
        this.canvas = null;
        this.faceOverlay = null;
        this.currentStream = null;
        this.faceDetector = null;
        this.isAnalyzing = false;
        this.lastAnalysisResult = null;
        
        // 바인딩
        this.handleCapture = this.handleCapture.bind(this);
        this.handleUpload = this.handleUpload.bind(this);
        this.updateFaceDetection = this.updateFaceDetection.bind(this);
        
        console.log('📷 PhotoAnalysis 컴포넌트 생성');
    }

    /**
     * 컴포넌트 초기화
     */
    async initialize() {
        if (this.isInitialized) {
            return;
        }

        try {
            console.log('📷 PhotoAnalysis 초기화 시작');
            
            // DOM 요소 가져오기
            this.getDOMElements();
            
            // 카메라 시스템 초기화
            await this.initializeCamera();
            
            // 얼굴 감지 시스템 초기화
            await this.initializeFaceDetection();
            
            // 이벤트 리스너 설정
            this.setupEventListeners();
            
            // 초기 상태 설정
            this.setInitialState();
            
            this.isInitialized = true;
            console.log('✅ PhotoAnalysis 초기화 완료');
            
        } catch (error) {
            console.error('❌ PhotoAnalysis 초기화 실패:', error);
            this.showError('카메라 시스템 초기화에 실패했습니다.');
        }
    }

    /**
     * DOM 요소 가져오기
     */
    getDOMElements() {
        this.video = document.getElementById('camera-feed');
        this.canvas = document.getElementById('face-overlay');
        this.faceOverlay = this.canvas;
        this.captureBtn = document.getElementById('capture-btn');
        this.uploadInput = document.getElementById('photo-upload');
        this.analysisStatus = document.getElementById('analysis-status');
        this.analysisResults = document.getElementById('analysis-results');
        
        if (!this.video || !this.canvas) {
            throw new Error('필수 DOM 요소를 찾을 수 없습니다');
        }
        
        // 캔버스 컨텍스트 설정
        this.ctx = this.canvas.getContext('2d');
    }

    /**
     * 카메라 시스템 초기화
     */
    async initializeCamera() {
        try {
            // 카메라 권한 확인
            const hasPermission = await this.checkCameraPermission();
            if (!hasPermission) {
                throw new Error('카메라 권한이 필요합니다');
            }
            
            // 카메라 스트림 시작
            await this.startCameraStream();
            
            console.log('📹 카메라 초기화 완료');
            
        } catch (error) {
            console.error('❌ 카메라 초기화 실패:', error);
            this.showCameraError(error.message);
        }
    }

    /**
     * 카메라 권한 확인
     */
    async checkCameraPermission() {
        try {
            if (navigator.permissions) {
                const permission = await navigator.permissions.query({ name: 'camera' });
                return permission.state === 'granted';
            }
            
            // 권한 API가 없는 경우, 직접 확인
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 640 }, 
                    height: { ideal: 480 } 
                }
            });
            
            stream.getTracks().forEach(track => track.stop());
            return true;
            
        } catch (error) {
            return false;
        }
    }

    /**
     * 카메라 스트림 시작
     */
    async startCameraStream() {
        const config = window.Config.CAMERA;
        
        const constraints = {
            video: {
                width: { ideal: config.preferredResolution.width },
                height: { ideal: config.preferredResolution.height },
                frameRate: { ideal: config.frameRate },
                facingMode: config.facingMode
            }
        };

        try {
            this.currentStream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.currentStream;
            
            // 비디오 로드 완료 대기
            await new Promise((resolve, reject) => {
                this.video.onloadedmetadata = resolve;
                this.video.onerror = reject;
            });
            
            // 비디오 재생 시작
            await this.video.play();
            
            // 캔버스 크기 조정
            this.resizeCanvas();
            
            console.log('📹 카메라 스트림 시작 완료');
            
        } catch (error) {
            console.error('❌ 카메라 스트림 실패:', error);
            
            // 폴백 해상도로 재시도
            if (constraints.video.width.ideal !== config.fallbackResolution.width) {
                console.log('📹 폴백 해상도로 재시도...');
                
                constraints.video.width.ideal = config.fallbackResolution.width;
                constraints.video.height.ideal = config.fallbackResolution.height;
                
                try {
                    this.currentStream = await navigator.mediaDevices.getUserMedia(constraints);
                    this.video.srcObject = this.currentStream;
                    await this.video.play();
                    this.resizeCanvas();
                    console.log('✅ 폴백 해상도로 카메라 시작 성공');
                } catch (fallbackError) {
                    throw fallbackError;
                }
            } else {
                throw error;
            }
        }
    }

    /**
     * 캔버스 크기 조정
     */
    resizeCanvas() {
        if (!this.video || !this.canvas) return;
        
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        
        // CSS 크기도 조정
        const containerRect = this.video.parentElement.getBoundingClientRect();
        const videoAspectRatio = this.video.videoWidth / this.video.videoHeight;
        const containerAspectRatio = containerRect.width / containerRect.height;
        
        if (videoAspectRatio > containerAspectRatio) {
            this.canvas.style.width = '100%';
            this.canvas.style.height = 'auto';
        } else {
            this.canvas.style.width = 'auto';
            this.canvas.style.height = '100%';
        }
    }

    /**
     * 얼굴 감지 시스템 초기화
     */
    async initializeFaceDetection() {
        try {
            if (window.FaceDetection) {
                this.faceDetector = new FaceDetection();
                await this.faceDetector.initialize();
                
                // 실시간 얼굴 감지 시작
                this.startFaceDetection();
                
                console.log('👤 얼굴 감지 시스템 초기화 완료');
            } else {
                console.warn('⚠️ FaceDetection 클래스를 찾을 수 없습니다');
            }
        } catch (error) {
            console.error('❌ 얼굴 감지 초기화 실패:', error);
            // 얼굴 감지 없이도 기본 기능은 동작하도록 함
        }
    }

    /**
     * 실시간 얼굴 감지 시작
     */
    startFaceDetection() {
        if (!this.faceDetector || !this.video) return;
        
        const detectFaces = () => {
            if (this.video.readyState === 4) { // HAVE_ENOUGH_DATA
                this.updateFaceDetection();
            }
            
            if (!this.isAnalyzing) {
                requestAnimationFrame(detectFaces);
            }
        };
        
        detectFaces();
    }

    /**
     * 얼굴 감지 업데이트
     */
    async updateFaceDetection() {
        if (!this.faceDetector || !this.ctx) return;
        
        try {
            // 현재 비디오 프레임에서 얼굴 감지
            const faces = await this.faceDetector.detectFaces(this.video);
            
            // 캔버스 초기화
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // 얼굴 윤곽선 그리기
            if (faces && faces.length > 0) {
                this.drawFaceOutlines(faces);
                this.showFaceDetectionStatus('얼굴이 감지되었습니다');
            } else {
                this.showFaceDetectionStatus('얼굴을 카메라 중앙에 맞춰주세요');
            }
            
        } catch (error) {
            console.warn('⚠️ 얼굴 감지 업데이트 실패:', error);
        }
    }

    /**
     * 얼굴 윤곽선 그리기
     */
    drawFaceOutlines(faces) {
        if (!this.ctx) return;
        
        this.ctx.strokeStyle = '#22c55e';
        this.ctx.lineWidth = 2;
        this.ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
        
        faces.forEach(face => {
            // 얼굴 바운딩 박스
            const bbox = face.boundingBox;
            this.ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);
            
            // 피부 영역 표시
            if (face.landmarks) {
                this.drawSkinRegions(face.landmarks);
            }
        });
    }

    /**
     * 피부 영역 표시
     */
    drawSkinRegions(landmarks) {
        const config = window.Config.COLOR_ANALYSIS.skinDetection.faceRegion;
        const faceWidth = this.canvas.width;
        const faceHeight = this.canvas.height;
        
        // 이마 영역
        this.ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
        this.ctx.fillRect(
            faceWidth * config.forehead.x,
            faceHeight * config.forehead.y,
            faceWidth * config.forehead.w,
            faceHeight * config.forehead.h
        );
        
        // 볼 영역
        this.ctx.fillRect(
            faceWidth * config.cheek.x,
            faceHeight * config.cheek.y,
            faceWidth * config.cheek.w,
            faceHeight * config.cheek.h
        );
        
        // 턱 영역
        this.ctx.fillRect(
            faceWidth * config.chin.x,
            faceHeight * config.chin.y,
            faceWidth * config.chin.w,
            faceHeight * config.chin.h
        );
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 사진 촬영 버튼
        if (this.captureBtn) {
            this.captureBtn.addEventListener('click', this.handleCapture);
        }
        
        // 파일 업로드
        if (this.uploadInput) {
            this.uploadInput.addEventListener('change', this.handleUpload);
        }
        
        // 비디오 메타데이터 로드
        if (this.video) {
            this.video.addEventListener('loadedmetadata', () => {
                this.resizeCanvas();
            });
        }
        
        // 윈도우 리사이즈
        window.addEventListener('resize', () => {
            this.throttle(() => {
                this.resizeCanvas();
            }, 250)();
        });
    }

    /**
     * 초기 상태 설정
     */
    setInitialState() {
        this.showAnalysisStatus('ready');
        this.hideAnalysisResults();
    }

    /**
     * 사진 촬영 처리
     */
    async handleCapture() {
        if (!this.video || this.isAnalyzing) {
            return;
        }
        
        try {
            console.log('📸 사진 촬영 시작');
            
            // 촬영 효과
            this.showCaptureEffect();
            
            // 현재 비디오 프레임 캡처
            const imageData = this.captureCurrentFrame();
            
            // AI 분석 실행
            await this.analyzeImage(imageData);
            
        } catch (error) {
            console.error('❌ 사진 촬영 실패:', error);
            this.showError('사진 촬영에 실패했습니다.');
        }
    }

    /**
     * 파일 업로드 처리
     */
    async handleUpload(event) {
        const file = event.target.files[0];
        if (!file || this.isAnalyzing) {
            return;
        }
        
        try {
            console.log('📁 파일 업로드 시작:', file.name);
            
            // 파일 검증
            if (!this.validateImageFile(file)) {
                return;
            }
            
            // 이미지 로드
            const imageData = await this.loadImageFile(file);
            
            // AI 분석 실행
            await this.analyzeImage(imageData);
            
        } catch (error) {
            console.error('❌ 파일 업로드 실패:', error);
            this.showError('파일 업로드에 실패했습니다.');
        }
    }

    /**
     * 현재 비디오 프레임 캡처
     */
    captureCurrentFrame() {
        if (!this.video) return null;
        
        // 임시 캔버스 생성
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCanvas.width = this.video.videoWidth;
        tempCanvas.height = this.video.videoHeight;
        
        // 현재 프레임 그리기
        tempCtx.drawImage(this.video, 0, 0);
        
        // ImageData 반환
        return tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    }

    /**
     * 이미지 파일 검증
     */
    validateImageFile(file) {
        const config = window.Config.SECURITY.validation;
        
        // 파일 크기 검증
        if (file.size > config.maxFileSize) {
            this.showError(`파일 크기가 너무 큽니다. 최대 ${config.maxFileSize / 1024 / 1024}MB까지 가능합니다.`);
            return false;
        }
        
        // 파일 형식 검증
        if (!config.allowedImageTypes.includes(file.type)) {
            this.showError('지원하지 않는 파일 형식입니다. JPEG, PNG, WebP 파일만 가능합니다.');
            return false;
        }
        
        return true;
    }

    /**
     * 이미지 파일 로드
     */
    async loadImageFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    // 최대 크기 검증
                    const config = window.Config.SECURITY.validation;
                    if (img.width > config.maxImageDimensions.width || 
                        img.height > config.maxImageDimensions.height) {
                        reject(new Error('이미지 크기가 너무 큽니다.'));
                        return;
                    }
                    
                    // 캔버스에 그려서 ImageData 생성
                    const tempCanvas = document.createElement('canvas');
                    const tempCtx = tempCanvas.getContext('2d');
                    
                    tempCanvas.width = img.width;
                    tempCanvas.height = img.height;
                    
                    tempCtx.drawImage(img, 0, 0);
                    const imageData = tempCtx.getImageData(0, 0, img.width, img.height);
                    
                    resolve(imageData);
                };
                
                img.onerror = () => reject(new Error('이미지 로드 실패'));
                img.src = e.target.result;
            };
            
            reader.onerror = () => reject(new Error('파일 읽기 실패'));
            reader.readAsDataURL(file);
        });
    }

    /**
     * 이미지 AI 분석
     */
    async analyzeImage(imageData) {
        if (!imageData || this.isAnalyzing) {
            return;
        }
        
        this.isAnalyzing = true;
        
        try {
            console.log('🧠 AI 분석 시작');
            
            // 분석 상태 표시
            this.showAnalysisStatus('analyzing');
            
            // 1단계: 얼굴 감지
            let faces = null;
            if (this.faceDetector) {
                faces = await this.faceDetector.detectFacesFromImageData(imageData);
                if (!faces || faces.length === 0) {
                    throw new Error('얼굴을 감지할 수 없습니다. 얼굴이 명확하게 보이는 사진을 사용해주세요.');
                }
            }
            
            // 2단계: 피부톤 분석
            let skinAnalysis = null;
            if (window.SkinToneAnalyzer) {
                skinAnalysis = await SkinToneAnalyzer.analyzeSkinTone(imageData, faces);
                if (!skinAnalysis) {
                    throw new Error('피부톤 분석에 실패했습니다.');
                }
            }
            
            // 3단계: 계절 분류
            let seasonClassification = null;
            if (window.ColorClassifier && skinAnalysis) {
                seasonClassification = await ColorClassifier.classifySeason(skinAnalysis);
                if (!seasonClassification) {
                    throw new Error('계절 분류에 실패했습니다.');
                }
            }
            
            // 분석 결과 생성
            const analysisResult = {
                timestamp: new Date().toISOString(),
                faces: faces,
                skinTone: skinAnalysis,
                season: seasonClassification,
                confidence: seasonClassification?.confidence || 0,
                imageData: imageData
            };
            
            this.lastAnalysisResult = analysisResult;
            
            // 결과 표시
            this.showAnalysisResults(analysisResult);
            
            // 상위 컴포넌트에 결과 전달
            this.notifyAnalysisComplete(analysisResult);
            
            console.log('✅ AI 분석 완료:', analysisResult);
            
        } catch (error) {
            console.error('❌ AI 분석 실패:', error);
            this.showError(error.message);
            this.showAnalysisStatus('error');
            
        } finally {
            this.isAnalyzing = false;
        }
    }

    /**
     * 분석 결과 표시
     */
    showAnalysisResults(result) {
        if (!this.analysisResults) return;
        
        // 계절 결과 업데이트
        const seasonBadge = document.getElementById('season-badge');
        const confidenceScore = document.getElementById('confidence-score');
        
        if (seasonBadge && result.season) {
            seasonBadge.textContent = `${result.season.name} ${result.season.subtype || ''}`;
            seasonBadge.className = `season-badge season-${result.season.type}`;
        }
        
        if (confidenceScore) {
            confidenceScore.textContent = `신뢰도: ${Math.round(result.confidence * 100)}%`;
        }
        
        // 색상 값 업데이트
        const colorValues = document.getElementById('color-values');
        if (colorValues && result.skinTone) {
            const lab = result.skinTone.lab;
            colorValues.innerHTML = `
                <div class="value-item">
                    <span class="label">L*:</span>
                    <span class="value">${lab.L.toFixed(1)}</span>
                </div>
                <div class="value-item">
                    <span class="label">a*:</span>
                    <span class="value">${lab.a.toFixed(1)}</span>
                </div>
                <div class="value-item">
                    <span class="label">b*:</span>
                    <span class="value">${lab.b.toFixed(1)}</span>
                </div>
            `;
        }
        
        // 결과 영역 표시
        this.hideAnalysisStatus();
        this.analysisResults.style.display = 'block';
        this.analysisResults.classList.add('animate-fadeIn');
        
        // 보고서 생성 버튼 활성화
        const generateReportBtn = document.getElementById('generate-report-btn');
        if (generateReportBtn) {
            generateReportBtn.disabled = false;
        }
    }

    /**
     * 분석 상태 표시
     */
    showAnalysisStatus(status) {
        if (!this.analysisStatus) return;
        
        const statusMessages = {
            ready: {
                icon: '📷',
                title: 'AI 분석 준비됨',
                message: '사진을 촬영하거나 업로드해주세요'
            },
            analyzing: {
                icon: '🧠',
                title: 'AI 분석 중...',
                message: '피부톤을 분석하고 있습니다'
            },
            error: {
                icon: '❌',
                title: '분석 실패',
                message: '다시 시도해주세요'
            }
        };
        
        const statusData = statusMessages[status] || statusMessages.ready;
        
        this.analysisStatus.innerHTML = `
            <div class="status-${status}">
                <h3>${statusData.icon} ${statusData.title}</h3>
                <p>${statusData.message}</p>
                ${status === 'analyzing' ? '<div class="spinner large"></div>' : ''}
            </div>
        `;
        
        this.analysisStatus.style.display = 'block';
    }

    /**
     * 분석 상태 숨기기
     */
    hideAnalysisStatus() {
        if (this.analysisStatus) {
            this.analysisStatus.style.display = 'none';
        }
    }

    /**
     * 분석 결과 숨기기
     */
    hideAnalysisResults() {
        if (this.analysisResults) {
            this.analysisResults.style.display = 'none';
        }
    }

    /**
     * 얼굴 감지 상태 표시
     */
    showFaceDetectionStatus(message) {
        // 임시로 콘솔에 출력 (나중에 UI로 표시)
        if (window.Config.DEBUG.enabled) {
            console.log('👤', message);
        }
    }

    /**
     * 촬영 효과 표시
     */
    showCaptureEffect() {
        // 플래시 효과
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: white;
            opacity: 0.8;
            z-index: 9999;
            pointer-events: none;
        `;
        
        document.body.appendChild(flash);
        
        // 애니메이션
        setTimeout(() => {
            flash.style.opacity = '0';
            flash.style.transition = 'opacity 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(flash);
            }, 300);
        }, 100);
        
        // 셔터 사운드 재생
        this.playShutterSound();
    }

    /**
     * 셔터 사운드 재생
     */
    playShutterSound() {
        try {
            const audio = new Audio('./assets/sounds/camera-shutter.mp3');
            audio.volume = 0.3;
            audio.play().catch(() => {
                // 사운드 재생 실패는 무시
            });
        } catch (error) {
            // 사운드 파일이 없어도 무시
        }
    }

    /**
     * 분석 완료 알림
     */
    notifyAnalysisComplete(result) {
        // 메인 앱에 분석 완료 이벤트 전달
        if (window.PersonalColorApp && window.PersonalColorApp.diagnosisData) {
            window.PersonalColorApp.diagnosisData.photoAnalysis = result;
            window.PersonalColorApp.updateActionButtonsState();
        }
        
        // 커스텀 이벤트 발생
        const event = new CustomEvent('photoAnalysisComplete', {
            detail: result
        });
        document.dispatchEvent(event);
        
        // 분석 이벤트 전송
        if (window.AnalyticsManager) {
            AnalyticsManager.track('photo_analysis_complete', {
                confidence: result.confidence,
                season: result.season?.type,
                processingTime: Date.now() - new Date(result.timestamp).getTime()
            });
        }
    }

    /**
     * 에러 표시
     */
    showError(message) {
        if (window.PersonalColorApp) {
            window.PersonalColorApp.showToast(message, 'error');
        } else {
            console.error('❌', message);
            alert(message);
        }
    }

    /**
     * 카메라 에러 표시
     */
    showCameraError(message) {
        const cameraContainer = this.video?.parentElement;
        if (cameraContainer) {
            cameraContainer.innerHTML = `
                <div class="camera-error">
                    <div class="error-icon">📷</div>
                    <h3>카메라를 사용할 수 없습니다</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">다시 시도</button>
                </div>
            `;
        }
    }

    /**
     * 카메라 일시정지
     */
    pauseCamera() {
        if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => {
                track.enabled = false;
            });
        }
    }

    /**
     * 카메라 재개
     */
    resumeCamera() {
        if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => {
                track.enabled = true;
            });
        }
    }

    /**
     * 리사이즈 처리
     */
    handleResize() {
        this.resizeCanvas();
    }

    /**
     * 화면 방향 변경 처리
     */
    handleOrientationChange() {
        setTimeout(() => {
            this.resizeCanvas();
        }, 100);
    }

    /**
     * 컴포넌트 초기화
     */
    reset() {
        this.lastAnalysisResult = null;
        this.hideAnalysisResults();
        this.showAnalysisStatus('ready');
        
        // 캔버스 초기화
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // 파일 입력 초기화
        if (this.uploadInput) {
            this.uploadInput.value = '';
        }
        
        console.log('🔄 PhotoAnalysis 초기화 완료');
    }

    /**
     * 컴포넌트 정리
     */
    cleanup() {
        // 카메라 스트림 정지
        if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => {
                track.stop();
            });
            this.currentStream = null;
        }
        
        // 얼굴 감지 정지
        this.isAnalyzing = true; // 감지 루프 중단
        
        // 이벤트 리스너 제거
        if (this.captureBtn) {
            this.captureBtn.removeEventListener('click', this.handleCapture);
        }
        
        if (this.uploadInput) {
            this.uploadInput.removeEventListener('change', this.handleUpload);
        }
        
        console.log('🧹 PhotoAnalysis 정리 완료');
    }

    /**
     * 쓰로틀 유틸리티
     */
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// 전역 변수로 내보내기
window.PhotoAnalysis = PhotoAnalysis;
