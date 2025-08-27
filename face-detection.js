// MediaPipe Face Mesh 기반 얼굴 인식 시스템
class FaceDetectionSystem {
    constructor() {
        this.faceMesh = null;
        this.camera = null;
        this.isInitialized = false;
        this.currentLandmarks = null;
        this.skinRegions = {
            cheek: [],
            forehead: [],
            chin: []
        };
        
        // MediaPipe 초기화
        this.initializeMediaPipe();
    }
    
    async initializeMediaPipe() {
        try {
            updateLoadingMessage('MediaPipe Face Mesh 로딩 중...');
            
            // Face Mesh 모델 초기화
            this.faceMesh = new FaceMesh({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
                }
            });
            
            // Face Mesh 설정
            this.faceMesh.setOptions({
                maxNumFaces: 1,
                refineLandmarks: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });
            
            // 결과 처리 콜백 설정
            this.faceMesh.onResults(this.onResults.bind(this));
            
            updateLoadingMessage('MediaPipe 초기화 완료');
            this.isInitialized = true;
            
            // 상태 업데이트
            this.updateSystemStatus();
            
        } catch (error) {
            console.error('MediaPipe 초기화 실패:', error);
            showToast('MediaPipe 초기화에 실패했습니다', 'error');
        }
    }
    
    updateSystemStatus() {
        const mpStatus = document.getElementById('mediapipe-status');
        const mpStatusText = document.getElementById('mp-status-text');
        const aiStatus = document.getElementById('ai-status');
        const aiStatusText = document.getElementById('ai-status-text');
        
        if (this.isInitialized) {
            mpStatus.classList.add('ready');
            mpStatusText.textContent = '준비됨';
            aiStatus.classList.add('ready');
            aiStatusText.textContent = '준비됨';
        }
    }
    
    async startCamera() {
        try {
            updateLoadingMessage('카메라 초기화 중...');
            
            const video = document.getElementById('camera-video');
            const constraints = {
                video: {
                    width: 640,
                    height: 480,
                    facingMode: 'user'
                }
            };
            
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = stream;
            
            // Camera Utils 초기화
            this.camera = new Camera(video, {
                onFrame: async () => {
                    if (this.faceMesh && this.isInitialized) {
                        await this.faceMesh.send({ image: video });
                    }
                },
                width: 640,
                height: 480
            });
            
            await this.camera.start();
            
            // UI 업데이트
            document.getElementById('start-btn').disabled = true;
            document.getElementById('capture-btn').disabled = false;
            document.getElementById('reset-btn').disabled = false;
            
            document.getElementById('detection-status').textContent = '얼굴 감지 중...';
            document.getElementById('detection-status').classList.add('active');
            
            showToast('카메라가 시작되었습니다', 'success');
            
        } catch (error) {
            console.error('카메라 시작 실패:', error);
            showToast('카메라 접근에 실패했습니다', 'error');
        }
    }
    
    // MediaPipe 결과 처리
    onResults(results) {
        const canvas = document.getElementById('face-canvas');
        const ctx = canvas.getContext('2d');
        
        // 캔버스 클리어
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            const landmarks = results.multiFaceLandmarks[0];
            this.currentLandmarks = landmarks;
            
            // 얼굴 감지 상태 업데이트
            document.getElementById('detection-status').textContent = '✓ 얼굴 감지됨';
            document.getElementById('landmarks-count').textContent = `감지된 랜드마크: ${landmarks.length}개`;
            
            // 1단계 활성화
            const step1 = document.getElementById('step1');
            if (!step1.classList.contains('active')) {
                step1.classList.add('active');
            }
            
            // 랜드마크 그리기
            this.drawLandmarks(ctx, landmarks, canvas.width, canvas.height);
            
            // 피부 영역 추출 및 색상 분석
            this.extractSkinRegions(landmarks, canvas.width, canvas.height);
            this.analyzeSkinColor();
            
        } else {
            // 얼굴 감지되지 않음
            document.getElementById('detection-status').textContent = '얼굴 감지 중...';
            document.getElementById('landmarks-count').textContent = '감지된 랜드마크: 0개';
            this.currentLandmarks = null;
        }
    }
    
    // 랜드마크 그리기
    drawLandmarks(ctx, landmarks, width, height) {
        // 얼굴 메쉬 그리기
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 1;
        ctx.fillStyle = '#00ff00';
        
        // 얼굴 윤곽선
        const faceOval = [
            10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
            397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
            172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109
        ];
        
        this.drawConnectedPoints(ctx, landmarks, faceOval, width, height);
        
        // 눈 영역
        const leftEye = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
        const rightEye = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];
        
        this.drawConnectedPoints(ctx, landmarks, leftEye, width, height);
        this.drawConnectedPoints(ctx, landmarks, rightEye, width, height);
        
        // 피부 영역 하이라이트
        this.highlightSkinRegions(ctx, width, height);
        
        // 랜드마크 포인트
        landmarks.forEach((point) => {
            const x = point.x * width;
            const y = point.y * height;
            
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, 2 * Math.PI);
            ctx.fill();
        });
    }
    
    drawConnectedPoints(ctx, landmarks, indices, width, height) {
        ctx.beginPath();
        for (let i = 0; i < indices.length; i++) {
            const point = landmarks[indices[i]];
            const x = point.x * width;
            const y = point.y * height;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }
    
    // 피부 영역 추출 (논문 기반)
    extractSkinRegions(landmarks, width, height) {
        // 볼 영역 (논문에서 가장 신뢰도 높은 영역)
        const cheekPoints = [
            116, 117, 118, 119, 120, 121, 126, 142, 36, 205, 206, 207, 213, 192, 147, 187, 207, 213, 
            192, 147, 187, 234, 227, 116, 117, 118, 119, 120, 121, 126, 142, 36, 205, 206, 207, 213, 
            345, 346, 347, 348, 349, 350, 451, 452, 453, 464, 435, 410, 361, 340, 346, 347, 348, 349,
            350, 451, 452, 453, 464, 435, 410, 361, 340, 454, 356, 389, 251, 284, 332
        ];
        
        // 이마 영역
        const foreheadPoints = [
            9, 10, 151, 337, 299, 333, 298, 301, 368, 389, 356, 454, 323, 361, 340, 
            346, 347, 348, 349, 350, 451, 452, 453, 464, 435, 410, 454
        ];
        
        // 턱 영역  
        const chinPoints = [
            175, 196, 197, 3, 51, 48, 115, 131, 134, 102, 49, 220, 305, 291, 303, 267, 269, 270, 267, 271, 272
        ];
        
        this.skinRegions = {
            cheek: this.getRegionCoordinates(landmarks, cheekPoints, width, height),
            forehead: this.getRegionCoordinates(landmarks, foreheadPoints, width, height),
            chin: this.getRegionCoordinates(landmarks, chinPoints, width, height)
        };
        
        // 2단계 활성화
        const step2 = document.getElementById('step2');
        if (step2.classList.contains('active')) return;
        
        step2.classList.add('active');
        document.getElementById('step1').classList.remove('active');
        document.getElementById('step1').classList.add('completed');
    }
    
    getRegionCoordinates(landmarks, indices, width, height) {
        return indices.map(index => {
            const point = landmarks[index];
            return {
                x: Math.round(point.x * width),
                y: Math.round(point.y * height)
            };
        });
    }
    
    highlightSkinRegions(ctx, width, height) {
        // 피부 영역 하이라이트
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        // 볼 영역 사각형
        if (this.skinRegions.cheek.length > 0) {
            const cheekBounds = this.getBoundingBox(this.skinRegions.cheek);
            ctx.strokeRect(cheekBounds.x, cheekBounds.y, cheekBounds.width, cheekBounds.height);
        }
        
        ctx.setLineDash([]);
    }
    
    getBoundingBox(points) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        points.forEach(point => {
            minX = Math.min(minX, point.x);
            minY = Math.min(minY, point.y);
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
        });
        
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }
    
    // 피부 색상 분석 (실제 픽셀 데이터 사용)
    analyzeSkinColor() {
        if (!this.currentLandmarks) return;
        
        const video = document.getElementById('camera-video');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        
        // 비디오 프레임 캡처
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // 피부 영역 색상 추출
        const skinColors = this.extractSkinPixels(ctx, canvas.width, canvas.height);
        const avgColor = this.calculateAverageColor(skinColors);
        
        if (avgColor) {
            // RGB 값 표시
            document.getElementById('rgb-r').textContent = avgColor.r;
            document.getElementById('rgb-g').textContent = avgColor.g;
            document.getElementById('rgb-b').textContent = avgColor.b;
            
            // LAB 변환
            const labColor = ColorAnalysis.rgbToLab(avgColor.r, avgColor.g, avgColor.b);
            document.getElementById('lab-l').textContent = Math.round(labColor.l);
            document.getElementById('lab-a').textContent = Math.round(labColor.a);
            document.getElementById('lab-b').textContent = Math.round(labColor.b);
            
            // 스킨 샘플 색상 업데이트
            const skinSample = document.getElementById('skin-sample');
            skinSample.style.backgroundColor = `rgb(${avgColor.r}, ${avgColor.g}, ${avgColor.b})`;
            
            // 3단계 활성화
            const step3 = document.getElementById('step3');
            if (!step3.classList.contains('active')) {
                step3.classList.add('active');
                document.getElementById('step2').classList.remove('active');
                document.getElementById('step2').classList.add('completed');
                
                // 자동으로 색상 분석 진행
                setTimeout(() => {
                    this.performColorAnalysis(avgColor, labColor);
                }, 1000);
            }
        }
    }
    
    extractSkinPixels(ctx, width, height) {
        const pixels = [];
        
        // 볼 영역에서 픽셀 샘플링 (가장 신뢰도 높음)
        if (this.skinRegions.cheek.length > 0) {
            const cheekBounds = this.getBoundingBox(this.skinRegions.cheek);
            
            // 영역 내 픽셀 샘플링
            for (let y = cheekBounds.y; y < cheekBounds.y + cheekBounds.height; y += 3) {
                for (let x = cheekBounds.x; x < cheekBounds.x + cheekBounds.width; x += 3) {
                    if (x >= 0 && x < width && y >= 0 && y < height) {
                        const imageData = ctx.getImageData(x, y, 1, 1);
                        const [r, g, b] = imageData.data;
                        
                        // 피부색 필터링 (논문 기반)
                        if (this.isSkinColor(r, g, b)) {
                            pixels.push({ r, g, b });
                        }
                    }
                }
            }
        }
        
        return pixels;
    }
    
    // 피부색 필터링 (논문의 피부색 범위 적용)
    isSkinColor(r, g, b) {
        // RGB 피부색 범위 (논문 기반)
        const isValidRange = (
            r > 95 && g > 40 && b > 20 &&
            Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
            Math.abs(r - g) > 15 && r > g && r > b
        );
        
        // YCbCr 색공간에서의 추가 검증
        const y = 0.299 * r + 0.587 * g + 0.114 * b;
        const cb = -0.169 * r - 0.331 * g + 0.5 * b + 128;
        const cr = 0.5 * r - 0.419 * g - 0.081 * b + 128;
        
        const isYCbCrSkin = (cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173);
        
        return isValidRange && isYCbCrSkin;
    }
    
    calculateAverageColor(pixels) {
        if (pixels.length === 0) return null;
        
        let totalR = 0, totalG = 0, totalB = 0;
        
        pixels.forEach(pixel => {
            totalR += pixel.r;
            totalG += pixel.g;
            totalB += pixel.b;
        });
        
        return {
            r: Math.round(totalR / pixels.length),
            g: Math.round(totalG / pixels.length),
            b: Math.round(totalB / pixels.length)
        };
    }
    
    // 색상 분석 및 퍼스널컬러 진단
    performColorAnalysis(rgbColor, labColor) {
        // 4단계 활성화
        const step4 = document.getElementById('step4');
        step4.classList.add('active');
        document.getElementById('step3').classList.remove('active');
        document.getElementById('step3').classList.add('completed');
        
        setTimeout(() => {
            // 5단계 활성화 (전문가 규칙 적용)
            const step5 = document.getElementById('step5');
            step5.classList.add('active');
            document.getElementById('step4').classList.remove('active');
            document.getElementById('step4').classList.add('completed');
            
            // Delta E 계산 및 계절 분류
            const analysis = ColorAnalysis.analyzePersonalColor(rgbColor, labColor);
            const expertResult = ExpertKnowledge.applyExpertRules(analysis, rgbColor);
            
            // 결과 표시
            document.getElementById('delta-e').textContent = analysis.deltaE.toFixed(1);
            document.getElementById('season-result').textContent = this.getSeasonName(expertResult.season);
            document.getElementById('confidence-level').textContent = expertResult.confidence;
            
            // 전역 분석 데이터 업데이트
            window.analysisData = {
                rgb: rgbColor,
                lab: labColor,
                deltaE: analysis.deltaE,
                season: expertResult.season,
                confidence: expertResult.confidence,
                expertNotes: expertResult.notes,
                method: 'ai_analysis'
            };
            
            setTimeout(() => {
                step5.classList.remove('active');
                step5.classList.add('completed');
                showToast('AI 분석이 완료되었습니다!', 'success');
                
                // 결과 페이지 자동 업데이트
                updateResultsSection();
            }, 2000);
            
        }, 1500);
    }
    
    getSeasonName(season) {
        const names = {
            spring: '봄 웜톤',
            summer: '여름 쿨톤',
            autumn: '가을 웜톤',
            winter: '겨울 쿨톤'
        };
        return names[season] || '분석 중...';
    }
    
    // 분석 캡처
    captureAnalysis() {
        if (!this.currentLandmarks) {
            showToast('얼굴이 감지되지 않았습니다', 'warning');
            return;
        }
        
        showToast('분석 데이터를 캡처했습니다', 'success');
        
        // 결과 섹션으로 이동
        setTimeout(() => {
            showSection('results-section');
        }, 1000);
    }
    
    // 분석 리셋
    resetAnalysis() {
        // 모든 단계 초기화
        for (let i = 1; i <= 5; i++) {
            const step = document.getElementById(`step${i}`);
            step.classList.remove('active', 'completed');
        }
        
        // UI 리셋
        document.getElementById('detection-status').textContent = '얼굴 감지 중...';
        document.getElementById('landmarks-count').textContent = '감지된 랜드마크: 0개';
        
        ['rgb-r', 'rgb-g', 'rgb-b', 'lab-l', 'lab-a', 'lab-b'].forEach(id => {
            document.getElementById(id).textContent = '-';
        });
        
        document.getElementById('delta-e').textContent = '-';
        document.getElementById('season-result').textContent = '분석 중...';
        document.getElementById('confidence-level').textContent = '-';
        
        // 스킨 샘플 초기화
        document.getElementById('skin-sample').style.backgroundColor = '#f0f0f0';
        
        // 캔버스 클리어
        const canvas = document.getElementById('face-canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        this.currentLandmarks = null;
        this.skinRegions = { cheek: [], forehead: [], chin: [] };
        
        showToast('분석이 초기화되었습니다', 'info');
    }
    
    // 카메라 중지
    stopCamera() {
        if (this.camera) {
            this.camera.stop();
        }
        
        const video = document.getElementById('camera-video');
        if (video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
            video.srcObject = null;
        }
        
        // 버튼 상태 복원
        document.getElementById('start-btn').disabled = false;
        document.getElementById('capture-btn').disabled = true;
        document.getElementById('reset-btn').disabled = true;
    }
}

// 전역 인스턴스 생성
let faceDetectionSystem = null;

// 초기화 함수
function initializeFaceDetection() {
    if (!faceDetectionSystem) {
        faceDetectionSystem = new FaceDetectionSystem();
    }
}

// 카메라 초기화 함수
async function initializeCamera() {
    if (!faceDetectionSystem) {
        initializeFaceDetection();
    }
    
    // MediaPipe 준비 대기
    if (!faceDetectionSystem.isInitialized) {
        showToast('MediaPipe 초기화를 기다리는 중...', 'info');
        
        // 최대 10초 대기
        let attempts = 0;
        while (!faceDetectionSystem.isInitialized && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 200));
            attempts++;
        }
        
        if (!faceDetectionSystem.isInitialized) {
            showToast('MediaPipe 초기화 시간 초과', 'error');
            return;
        }
    }
    
    await faceDetectionSystem.startCamera();
}

// 분석 캡처 함수
function captureAnalysis() {
    if (faceDetectionSystem) {
        faceDetectionSystem.captureAnalysis();
    }
}

// 분석 리셋 함수
function resetAnalysis() {
    if (faceDetectionSystem) {
        faceDetectionSystem.resetAnalysis();
    }
}

// 페이지 언로드 시 카메라 정리
window.addEventListener('beforeunload', () => {
    if (faceDetectionSystem) {
        faceDetectionSystem.stopCamera();
    }
});
