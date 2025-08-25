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
            this.res
