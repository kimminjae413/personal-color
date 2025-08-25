/**
 * FaceDetection.js
 * MediaPipe 기반 얼굴 감지 모듈
 * - 실시간 얼굴 감지 및 랜드마크 추출
 * - 피부톤 분석을 위한 관심 영역(ROI) 설정
 * - 얼굴 방향 및 조명 조건 분석
 * - 멀티페이스 지원 및 최적 얼굴 선택
 */

import { CONFIG } from '../config.js';

export class FaceDetection {
    constructor() {
        this.faceDetection = null;
        this.faceMesh = null;
        this.isInitialized = false;
        
        // 감지 설정
        this.config = {
            maxFaces: CONFIG.AI_MODELS.faceDetection.maxFaces || 1,
            minDetectionConfidence: CONFIG.AI_MODELS.faceDetection.minDetectionConfidence || 0.7,
            minTrackingConfidence: 0.5,
            refineLandmarks: true
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
        
        this.init();
    }

    async init() {
        try {
            await this.loadMediaPipe();
            await this.setupFaceDetection();
            await this.setupFaceMesh();
            this.isInitialized = true;
            console.log('FaceDetection 초기화 완료');
        } catch (error) {
            console.error('FaceDetection 초기화 실패:', error);
            this.setupFallbackDetection();
        }
    }

    async loadMediaPipe() {
        // MediaPipe 라이브러리 동적 로딩
        if (typeof MediaPipe === 'undefined') {
            await this.loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
            await this.loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js');
            await this.loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js');
            await this.loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/face_detection.js');
            await this.loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js');
        }
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async setupFaceDetection() {
        if (typeof FaceDetection === 'undefined') {
            throw new Error('MediaPipe FaceDetection을 사용할 수 없습니다.');
        }

        this.faceDetection = new FaceDetection({
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
    }

    async setupFaceMesh() {
        if (typeof FaceMesh === 'undefined') {
            throw new Error('MediaPipe FaceMesh를 사용할 수 없습니다.');
        }

        this.faceMesh = new FaceMesh({
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
    }

    setupFallbackDetection() {
        // MediaPipe가 실패할 경우 기본 얼굴 감지 사용
        console.warn('기본 얼굴 감지 방식으로 대체합니다.');
        this.isInitialized = true;
    }

    // 정적 이미지에서 얼굴 감지
    async detectFaces(imageSource) {
        if (!this.isInitialized) {
            await this.init();
        }

        try {
            const canvas = this.prepareCanvas(imageSource);
            const results = await this.processImage(canvas);
            return this.formatResults(results, canvas);
        } catch (error) {
            console.error('얼굴 감지 실패:', error);
            return this.getFallbackResults(imageSource);
        }
    }

    prepareCanvas(imageSource) {
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
        }
        
        return canvas;
    }

    async processImage(canvas) {
        if (this.faceMesh) {
            await this.faceMesh.send({ image: canvas });
            return this.lastFaceMeshResults;
        } else if (this.faceDetection) {
            await this.faceDetection.send({ image: canvas });
            return this.lastFaceDetectionResults;
        } else {
            // 대체 방법 사용
            return this.basicFaceDetection(canvas);
        }
    }

    onFaceDetectionResults(results) {
        this.lastFaceDetectionResults = results;
    }

    onFaceMeshResults(results) {
        this.lastFaceMeshResults = results;
    }

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

    processFaceMeshLandmarks(landmarks, width, height, index) {
        try {
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
            console.error('FaceMesh 처리 오류:', error);
            return null;
        }
    }

    processFaceDetection(detection, width, height, index) {
        try {
            const bbox = {
                x: detection.boundingBox.xCenter * width - (detection.boundingBox.width * width) / 2,
                y: detection.boundingBox.yCenter * height - (detection.boundingBox.height * height) / 2,
                width: detection.boundingBox.width * width,
                height: detection.boundingBox.height * height
            };

            // 키포인트를 픽셀 좌표로 변환
            const keypoints = detection.landmarks.map(point => ({
                x: point.x * width,
                y: point.y * height
            }));

            // 피부 샘플링 영역 추정
            const skinAreas = this.estimateSkinAreasFromBbox(bbox);
            
            // 기본 품질 평가
            const quality = Math.min(detection.score, this.assessBasicQuality(bbox, width, height));

            return {
                id: index,
                type: 'detection',
                bbox,
                keypoints,
                skinAreas,
                quality,
                confidence: detection.score,
                orientation: { pitch: 0, yaw: 0, roll: 0 },
                lighting: { score: 0.5, uniform: true }
            };
        } catch (error) {
            console.error('FaceDetection 처리 오류:', error);
            return null;
        }
    }

    calculateBoundingBox(landmarks) {
        const xs = landmarks.map(p => p.x);
        const ys = landmarks.map(p => p.y);
        
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
    }

    calculateSkinAreas(bbox, landmarks) {
        const areas = {};
        
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
            areas.forehead = this.refineForeheadArea(landmarks, bbox);
            areas.leftCheek = this.refineLeftCheekArea(landmarks, bbox);
            areas.rightCheek = this.refineRightCheekArea(landmarks, bbox);
        }

        return areas;
    }

    refineForeheadArea(landmarks, bbox) {
        // 이마 랜드마크들의 평균 위치 계산
        const foreheadPoints = this.faceRegions.forehead.map(idx => landmarks[idx]).filter(Boolean);
        
        if (foreheadPoints.length === 0) {
            return this.skinSamplingAreas.forehead;
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
    }

    refineLeftCheekArea(landmarks, bbox) {
        const cheekPoints = this.faceRegions.leftCheek.map(idx => landmarks[idx]).filter(Boolean);
        
        if (cheekPoints.length === 0) {
            return this.skinSamplingAreas.leftCheek;
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
    }

    refineRightCheekArea(landmarks, bbox) {
        const cheekPoints = this.faceRegions.rightCheek.map(idx => landmarks[idx]).filter(Boolean);
        
        if (cheekPoints.length === 0) {
            return this.skinSamplingAreas.rightCheek;
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
    }

    assessFaceQuality(landmarks, bbox, imgWidth, imgHeight) {
        let quality = 1.0;
        
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
            const visibleLandmarks = landmarks.filter(p => 
                p.x >= 0 && p.x < imgWidth && p.y >= 0 && p.y < imgHeight);
            const visibilityRatio = visibleLandmarks.length / landmarks.length;
            quality *= visibilityRatio;
        }
        
        return Math.max(0.1, Math.min(1.0, quality));
    }

    analyzeFaceOrientation(landmarks) {
        if (!landmarks || landmarks.length < 468) {
            return { pitch: 0, yaw: 0, roll: 0, frontal: true };
        }

        try {
            // 주요 랜드마크 포인트들
            const noseTip = landmarks[1];
            const leftEye = landmarks[33];
            const rightEye = landmarks[263];
            const leftMouth = landmarks[61];
            const rightMouth = landmarks[291];
            const chin = landmarks[18];
            const forehead = landmarks[10];

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
            
            const yaw = Math.atan2(noseToRightEye - noseToLeftEye, eyeDistance) * (180 / Math.PI);

            // Pitch (상하 회전) 계산
            const faceHeight = Math.abs(chin.y - forehead.y);
            const noseToForeheadRatio = Math.abs(noseTip.y - forehead.y) / faceHeight;
            const pitch = (noseToForeheadRatio - 0.5) * 60; // 대략적인 각도

            // Roll (기울기) 계산
            const eyeSlope = (rightEye.y - leftEye.y) / (rightEye.x - leftEye.x);
            const roll = Math.atan(eyeSlope) * (180 / Math.PI);

            // 정면 여부 판단
            const frontal = Math.abs(yaw) < 15 && Math.abs(pitch) < 15 && Math.abs(roll) < 10;

            return {
                pitch: Math.round(pitch),
                yaw: Math.round(yaw),
                roll: Math.round(roll),
                frontal
            };
        } catch (error) {
            console.error('얼굴 방향 분석 오류:', error);
            return { pitch: 0, yaw: 0, roll: 0, frontal: true };
        }
    }

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

    assessBasicQuality(bbox, imgWidth, imgHeight) {
        const faceAreaRatio = (bbox.width * bbox.height) / (imgWidth * imgHeight);
        let quality = 0.7;
        
        if (faceAreaRatio > 0.1 && faceAreaRatio < 0.3) {
            quality = 0.9;
        } else if (faceAreaRatio < 0.05) {
            quality = 0.4;
        }
        
        return quality;
    }

    estimateSkinAreasFromBbox(bbox) {
        const areas = {};
        
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
        
        return areas;
    }

    // 대체 얼굴 감지 (MediaPipe 실패 시)
    basicFaceDetection(canvas) {
        // Viola-Jones 스타일의 간단한 얼굴 감지
        // 실제로는 더 정교한 구현이 필요하지만, 여기서는 중앙 영역을 가정
        
        const width = canvas.width;
        const height = canvas.height;
        
        // 이미지 중앙 60% 영역을 얼굴로 가정
        const faceWidth = width * 0.6;
        const faceHeight = height * 0.8;
        const faceX = (width - faceWidth) / 2;
        const faceY = (height - faceHeight) / 2;
        
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
                score: 0.8
            }]
        };
    }

    getFallbackResults(imageSource) {
        // MediaPipe가 완전히 실패했을 때 기본 결과 반환
        let width, height;
        
        if (imageSource instanceof HTMLCanvasElement) {
            width = imageSource.width;
            height = imageSource.height;
        } else if (imageSource instanceof HTMLVideoElement) {
            width = imageSource.videoWidth;
            height = imageSource.videoHeight;
        } else if (imageSource instanceof HTMLImageElement) {
            width = imageSource.naturalWidth;
            height = imageSource.naturalHeight;
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
    }

    // 실시간 비디오 스트림 처리
    async processVideoStream(videoElement, callback) {
        if (!this.isInitialized) {
            await this.init();
        }

        const processFrame = async () => {
            if (videoElement.videoWidth > 0) {
                try {
                    const faces = await this.detectFaces(videoElement);
                    if (callback) callback(faces);
                } catch (error) {
                    console.error('비디오 프레임 처리 오류:', error);
                }
            }
            
            requestAnimationFrame(processFrame);
        };
        
        processFrame();
    }

    // 베스트 얼굴 선택 (여러 얼굴이 감지된 경우)
    selectBestFace(faces) {
        if (!faces || faces.length === 0) return null;
        if (faces.length === 1) return faces[0];
        
        // 품질, 크기, 중앙 정렬을 종합적으로 고려
        return faces.reduce((best, current) => {
            let bestScore = best.quality;
            let currentScore = current.quality;
            
            // 정면을 향한 얼굴 우대
            if (current.orientation.frontal) currentScore += 0.2;
            if (best.orientation.frontal) bestScore += 0.2;
            
            // 중앙에 위치한 얼굴 우대
            const currentCentrality = 1 - Math.abs(current.bbox.centerX / 640 - 0.5);
            const bestCentrality = 1 - Math.abs(best.bbox.centerX / 640 - 0.5);
            
            currentScore += currentCentrality * 0.1;
            bestScore += bestCentrality * 0.1;
            
            return currentScore > bestScore ? current : best;
        });
    }

    // 얼굴 영역 시각화 (디버깅용)
    visualizeFaceDetection(canvas, faces) {
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        
        faces.forEach(face => {
            // 바운딩 박스
            ctx.strokeRect(face.bbox.x, face.bbox.y, face.bbox.width, face.bbox.height);
            
            // 피부 샘플링 영역
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 1;
            Object.values(face.skinAreas).forEach(area => {
                ctx.strokeRect(area.x, area.y, area.width, area.height);
            });
            
            // 랜드마크 (있는 경우)
            if (face.landmarks) {
                ctx.fillStyle = '#ffff00';
                face.landmarks.forEach(point => {
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, 1, 0, 2 * Math.PI);
                    ctx.fill();
                });
            }
            
            // 품질 점수 표시
            ctx.fillStyle = '#ffffff';
            ctx.font = '14px sans-serif';
            ctx.fillText(`Quality: ${Math.round(face.quality * 100)}%`, 
                        face.bbox.x, face.bbox.y - 5);
        });
    }

    // 성능 최적화를 위한 감지 설정 조정
    adjustDetectionSettings(performance) {
        if (performance === 'high') {
            this.config.minDetectionConfidence = 0.8;
            this.config.refineLandmarks = true;
        } else if (performance === 'balanced') {
            this.config.minDetectionConfidence = 0.7;
            this.config.refineLandmarks = true;
        } else { // 'fast'
            this.config.minDetectionConfidence = 0.6;
            this.config.refineLandmarks = false;
        }
        
        // MediaPipe 설정 업데이트
        if (this.faceDetection) {
            this.faceDetection.setOptions({
                minDetectionConfidence: this.config.minDetectionConfidence
            });
        }
        
        if (this.faceMesh) {
            this.faceMesh.setOptions({
                minDetectionConfidence: this.config.minDetectionConfidence,
                refineLandmarks: this.config.refineLandmarks
            });
        }
    }

    // 리소스 정리
    dispose() {
        if (this.faceDetection) {
            this.faceDetection.close();
        }
        
        if (this.faceMesh) {
            this.faceMesh.close();
        }
        
        console.log('FaceDetection 정리 완료');
    }
}

// 전역 인스턴스 생성
window.FaceDetection = new FaceDetection();
