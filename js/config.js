/**
 * config.js - Personal Color Pro 전역 설정 (완전 수정 버전)
 * 
 * 퍼스널컬러 진단 앱의 모든 설정값들을 관리
 * 브라우저 환경에서 완벽하게 작동하도록 최적화
 * 
 * 수정사항:
 * - process 참조 완전 제거
 * - 브라우저 호환성 개선
 * - 안전한 API 접근
 * - 완전한 설정 객체
 */

// 안전한 브라우저 API 접근 함수
const safeNavigatorAccess = (property, fallback = null) => {
    try {
        return navigator[property] !== undefined ? navigator[property] : fallback;
    } catch (error) {
        console.warn(`Navigator.${property} 접근 실패:`, error);
        return fallback;
    }
};

// 환경 감지 함수 (process.env 완전 대체)
const detectEnvironment = () => {
    try {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        
        // 개발 환경
        if (hostname === 'localhost' || 
            hostname === '127.0.0.1' || 
            hostname.startsWith('192.168.') ||
            hostname.startsWith('10.') ||
            protocol === 'file:') {
            return 'development';
        }
        
        // 스테이징 환경
        if (hostname.includes('staging') || 
            hostname.includes('test') || 
            hostname.includes('dev') ||
            hostname.includes('preview')) {
            return 'staging';
        }
        
        // 프로덕션 환경 (기본값)
        return 'production';
    } catch (error) {
        console.warn('환경 감지 실패:', error);
        return 'production';
    }
};

// 현재 환경
const CURRENT_ENVIRONMENT = detectEnvironment();

// 브라우저 정보 수집 (안전한 접근)
const getBrowserInfo = () => {
    return {
        userAgent: safeNavigatorAccess('userAgent', 'Unknown'),
        language: safeNavigatorAccess('language', 'ko'),
        languages: safeNavigatorAccess('languages', ['ko']),
        platform: safeNavigatorAccess('platform', 'Unknown'),
        cookieEnabled: safeNavigatorAccess('cookieEnabled', true),
        onLine: safeNavigatorAccess('onLine', true),
        hardwareConcurrency: safeNavigatorAccess('hardwareConcurrency', 4),
        deviceMemory: safeNavigatorAccess('deviceMemory', 4), // Chrome 전용
        maxTouchPoints: safeNavigatorAccess('maxTouchPoints', 0),
        
        // 연결 정보 (Chrome/Edge 전용, 안전한 접근)
        connection: (() => {
            try {
                const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
                return connection ? {
                    effectiveType: connection.effectiveType || '4g',
                    downlink: connection.downlink || 10,
                    rtt: connection.rtt || 100,
                    saveData: connection.saveData || false
                } : null;
            } catch (error) {
                return null;
            }
        })(),
        
        // 브라우저 기능 지원 체크
        features: {
            webgl: !!window.WebGLRenderingContext,
            webgl2: !!window.WebGL2RenderingContext,
            webrtc: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
            workers: !!window.Worker,
            serviceWorkers: 'serviceWorker' in navigator,
            indexedDB: !!window.indexedDB,
            canvas: !!document.createElement('canvas').getContext,
            fileReader: !!window.FileReader,
            geolocation: 'geolocation' in navigator,
            vibration: 'vibrate' in navigator,
            battery: 'getBattery' in navigator,
            gamepad: 'getGamepads' in navigator
        },
        
        // 화면 정보
        screen: {
            width: screen.width || 1024,
            height: screen.height || 768,
            availWidth: screen.availWidth || 1024,
            availHeight: screen.availHeight || 768,
            pixelDepth: screen.pixelDepth || 24,
            colorDepth: screen.colorDepth || 24,
            orientation: screen.orientation ? screen.orientation.type : 'landscape-primary'
        },
        
        // 성능 정보
        memory: (() => {
            try {
                if (performance.memory) {
                    return {
                        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
                    };
                }
            } catch (error) {
                // Chrome 전용 기능
            }
            return null;
        })()
    };
};

// 디바이스 타입 감지
const getDeviceType = () => {
    const userAgent = safeNavigatorAccess('userAgent', '').toLowerCase();
    const maxTouchPoints = safeNavigatorAccess('maxTouchPoints', 0);
    
    if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone')) {
        return 'mobile';
    } else if (userAgent.includes('tablet') || userAgent.includes('ipad') || (maxTouchPoints > 1 && !userAgent.includes('mac'))) {
        return 'tablet';
    } else {
        return 'desktop';
    }
};

/**
 * Personal Color Pro 전역 설정 객체
 */
window.PersonalColorConfig = {
    // 애플리케이션 기본 정보
    APP_INFO: {
        name: 'Personal Color Analyzer Pro',
        version: '1.0.0',
        description: '헤어디자이너용 퍼스널컬러 진단 태블릿 시스템',
        author: 'Personal Color Pro Team',
        buildDate: new Date().toISOString().split('T')[0],
        buildTime: new Date().toISOString(),
        environment: CURRENT_ENVIRONMENT,
        deviceType: getDeviceType(),
        browserInfo: getBrowserInfo(),
        
        // 지원 정보
        support: {
            email: 'support@personalcolorpro.com',
            website: 'https://personalcolorpro.com',
            documentation: 'https://docs.personalcolorpro.com',
            version: '1.0.0',
            lastUpdated: '2024-01-01'
        }
    },

    // 환경별 설정
    ENVIRONMENT: {
        current: CURRENT_ENVIRONMENT,
        isDevelopment: CURRENT_ENVIRONMENT === 'development',
        isStaging: CURRENT_ENVIRONMENT === 'staging',
        isProduction: CURRENT_ENVIRONMENT === 'production',
        
        // 환경별 기능 플래그
        features: {
            development: {
                debugMode: true,
                verboseLogging: true,
                performanceMetrics: true,
                errorReporting: false,
                analytics: false,
                hotReload: true
            },
            staging: {
                debugMode: true,
                verboseLogging: false,
                performanceMetrics: true,
                errorReporting: true,
                analytics: false,
                hotReload: false
            },
            production: {
                debugMode: false,
                verboseLogging: false,
                performanceMetrics: false,
                errorReporting: true,
                analytics: true,
                hotReload: false
            }
        }[CURRENT_ENVIRONMENT]
    },

    // API 및 서버 설정
    API: {
        baseUrl: CURRENT_ENVIRONMENT === 'development' 
            ? 'http://localhost:3000/api/v1' 
            : '/api/v1',
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000,
        retryBackoffMultiplier: 2,
        
        endpoints: {
            analysis: '/analysis',
            customers: '/customers',
            reports: '/reports',
            models: '/models',
            upload: '/upload',
            export: '/export',
            analytics: '/analytics',
            auth: '/auth',
            settings: '/settings',
            feedback: '/feedback'
        },
        
        // 요청 설정
        defaultHeaders: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Client-Version': '1.0.0',
            'X-Client-Platform': getDeviceType()
        },
        
        // CORS 설정
        cors: {
            enabled: true,
            credentials: 'same-origin',
            allowedOrigins: CURRENT_ENVIRONMENT === 'development' 
                ? ['http://localhost:3000', 'http://127.0.0.1:3000']
                : [window.location.origin]
        }
    },

    // AI 모델 및 분석 설정
    AI_MODELS: {
        skinToneAnalyzer: {
            // 모델 경로 (절대 경로로 수정)
            modelUrl: './js/ai/models/personal-color-model.json',
            weightsUrl: './js/ai/models/skin-tone-weights.bin',
            
            // 모델 설정
            inputSize: [224, 224, 3],
            outputClasses: ['spring', 'summer', 'autumn', 'winter'],
            confidenceThreshold: CURRENT_ENVIRONMENT === 'development' ? 0.75 : 0.85,
            maxBatchSize: 1,
            
            // 전처리 설정
            preprocessingSettings: {
                normalize: true,
                centerCrop: true,
                colorSpace: 'RGB',
                meanSubtraction: [0.485, 0.456, 0.406],
                stdNormalization: [0.229, 0.224, 0.225]
            },
            
            // 후처리 설정
            postprocessingSettings: {
                softmax: true,
                temperatureScaling: 1.0,
                calibration: true
            }
        },
        
        faceDetection: {
            // MediaPipe 대신 TensorFlow.js 사용 (CDN 의존성 제거)
            modelType: 'blazeface',
            modelUrl: 'https://tfhub.dev/tensorflow/tfjs-model/blazeface/1/default/1',
            
            maxNumFaces: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.5,
            selfieMode: true,
            
            // 대안 설정 (MediaPipe 사용 불가 시)
            fallback: {
                enabled: true,
                method: 'manual_selection',
                defaultRegion: { x: 0.25, y: 0.25, width: 0.5, height: 0.5 }
            }
        },
        
        colorClassifier: {
            algorithm: 'deltaE2000',
            colorSpace: 'CIELAB',
            toleranceThreshold: 3.0,
            
            // 계절별 기준 색상 (LAB 값 포함)
            referenceColors: {
                spring: [
                    { name: '코랄 핑크', hex: '#FFB6C1', lab: [81, 24, 12] },
                    { name: '피치', hex: '#FFCBA4', lab: [82, 12, 28] },
                    { name: '민트', hex: '#98FB98', lab: [91, -26, 24] },
                    { name: '라벤더', hex: '#E6E6FA', lab: [91, 4, -8] }
                ],
                summer: [
                    { name: '더스티 로즈', hex: '#C8A2C8', lab: [71, 18, -8] },
                    { name: '소프트 블루', hex: '#B0E0E6', lab: [86, -8, -12] },
                    { name: '라일락', hex: '#C8A2C8', lab: [71, 18, -8] },
                    { name: '세이지', hex: '#9CAF88', lab: [66, -12, 18] }
                ],
                autumn: [
                    { name: '테라코타', hex: '#E2725B', lab: [60, 32, 28] },
                    { name: '올리브', hex: '#808000', lab: [49, -8, 38] },
                    { name: '머스타드', hex: '#FFDB58', lab: [84, -2, 68] },
                    { name: '딥 티얼', hex: '#008080', lab: [48, -28, -8] }
                ],
                winter: [
                    { name: '로얄 블루', hex: '#4169E1', lab: [45, 26, -67] },
                    { name: '에메랄드', hex: '#50C878', lab: [70, -48, 38] },
                    { name: '딥 레드', hex: '#8B0000', lab: [25, 48, 38] },
                    { name: '퓨샤', hex: '#FF1493', lab: [54, 78, -8] }
                ]
            }
        }
    },

    // 카메라 및 미디어 설정
    CAMERA: {
        // 해상도 설정
        preferredResolution: {
            width: getDeviceType() === 'mobile' ? 1280 : 1920,
            height: getDeviceType() === 'mobile' ? 720 : 1080
        },
        
        fallbackResolutions: [
            { width: 1920, height: 1080 },
            { width: 1280, height: 720 },
            { width: 854, height: 480 },
            { width: 640, height: 480 },
            { width: 320, height: 240 }
        ],
        
        frameRate: getDeviceType() === 'mobile' ? 24 : 30,
        facingMode: 'user', // 'user' 또는 'environment'
        
        // 상세 제약조건
        constraints: {
            video: {
                width: { 
                    ideal: getDeviceType() === 'mobile' ? 1280 : 1920, 
                    min: 640, 
                    max: 3840 
                },
                height: { 
                    ideal: getDeviceType() === 'mobile' ? 720 : 1080, 
                    min: 480, 
                    max: 2160 
                },
                frameRate: { 
                    ideal: getDeviceType() === 'mobile' ? 24 : 30, 
                    min: 15, 
                    max: 60 
                },
                facingMode: 'user',
                aspectRatio: { ideal: 16/9, min: 4/3, max: 21/9 }
            },
            audio: false // 오디오는 사용하지 않음
        },
        
        // 촬영 설정
        captureSettings: {
            imageFormat: 'image/jpeg',
            quality: 0.9,
            maxFileSize: 10 * 1024 * 1024, // 10MB
            
            // 이미지 최적화
            optimization: {
                resize: true,
                maxWidth: 2048,
                maxHeight: 2048,
                maintainAspectRatio: true,
                compressionQuality: 0.85
            }
        },
        
        // 권한 및 보안
        permissions: {
            requestOnDemand: true,
            fallbackMessage: '카메라 권한이 필요합니다. 브라우저 설정에서 카메라를 허용해주세요.',
            retryAttempts: 3
        }
    },

    // 색상 분석 상세 설정
    COLOR_ANALYSIS: {
        // 표준 조명 조건 (CIE 표준)
        standardIlluminant: {
            type: 'D65', // 표준 주광
            temperature: 6504, // Kelvin
            chromaticity: { x: 0.3127, y: 0.3290 },
            intensity: 300, // lux
            description: 'Average daylight'
        },
        
        // 피부 영역 감지 설정 (얼굴 비율 기반)
        skinDetection: {
            regions: {
                forehead: { 
                    x: 0.3, y: 0.15, w: 0.4, h: 0.15,
                    description: '이마 중앙 부분'
                },
                leftCheek: { 
                    x: 0.15, y: 0.35, w: 0.2, h: 0.2,
                    description: '왼쪽 볼'
                },
                rightCheek: { 
                    x: 0.65, y: 0.35, w: 0.2, h: 0.2,
                    description: '오른쪽 볼'
                },
                nose: { 
                    x: 0.4, y: 0.4, w: 0.2, h: 0.2,
                    description: '코 부분'
                },
                chin: { 
                    x: 0.35, y: 0.65, w: 0.3, h: 0.15,
                    description: '턱 부분'
                }
            },
            
            // 영역별 가중치
            weights: {
                forehead: 0.25,
                leftCheek: 0.25,
                rightCheek: 0.25,
                nose: 0.15,
                chin: 0.10
            },
            
            // 품질 기준
            qualityThresholds: {
                minPixelCount: 1000,
                maxPixelCount: 50000,
                minVariance: 10,
                maxVariance: 100,
                minConfidence: 0.7,
                minFaceSize: 0.1 // 이미지 대비 얼굴 크기
            },
            
            // 필터링 설정
            filtering: {
                removeOutliers: true,
                outlierThreshold: 2.0, // 표준편차 배수
                smoothingKernel: 3,
                edgeDetection: true
            }
        },
        
        // 색상 공간 설정
        colorSpaces: {
            input: 'sRGB',
            analysis: 'CIELAB',
            display: 'sRGB',
            deltaE: 'CIE2000',
            
            // 변환 매트릭스 (sRGB to XYZ)
            transformMatrix: [
                [0.4124, 0.3576, 0.1805],
                [0.2126, 0.7152, 0.0722],
                [0.0193, 0.1192, 0.9505]
            ],
            
            // 화이트 포인트
            whitePoint: {
                X: 95.047,
                Y: 100.000,
                Z: 108.883
            }
        },
        
        // 계절 분류 기준 (과학적 기준)
        seasonClassification: {
            undertone: {
                warm: { 
                    aThreshold: 3, 
                    bThreshold: 6,
                    description: '황색 기반 따뜻한 톤'
                },
                cool: { 
                    aThreshold: -3, 
                    bThreshold: -6,
                    description: '청색 기반 차가운 톤'
                },
                neutral: { 
                    aRange: [-3, 3], 
                    bRange: [-6, 6],
                    description: '중성 톤'
                }
            },
            
            lightness: {
                light: { 
                    LThreshold: 65,
                    description: '밝은 피부'
                },
                medium: { 
                    LRange: [45, 65],
                    description: '중간 피부'
                },
                deep: { 
                    LThreshold: 45,
                    description: '어두운 피부'
                }
            },
            
            saturation: {
                muted: { 
                    chromaThreshold: 15,
                    description: '차분한 채도'
                },
                medium: { 
                    chromaRange: [15, 35],
                    description: '중간 채도'
                },
                vivid: { 
                    chromaThreshold: 35,
                    description: '선명한 채도'
                }
            },
            
            // 한국인 특화 보정값
            koreanSkinAdjustment: {
                undertoneBoost: 1.2,
                lightnessBoost: 0.9,
                saturationBoost: 1.1
            }
        }
    },

    // 드레이핑 시스템 설정
    DRAPING: {
        // 계절별 색상 세트 (전문가 검증된 색상)
        colorSets: {
            spring: [
                { name: '코랄 핑크', hex: '#FF7F7F', lab: [65, 40, 20], pantone: 'Coral Pink' },
                { name: '피치 오렌지', hex: '#FFB347', lab: [75, 15, 45], pantone: 'Peach Orange' },
                { name: '아쿠아 블루', hex: '#7FFFD4', lab: [85, -25, 10], pantone: 'Aqua Blue' },
                { name: '라벤더', hex: '#E6E6FA', lab: [90, 5, -15], pantone: 'Lavender' },
                { name: '옐로우 그린', hex: '#ADFF2F', lab: [88, -35, 75], pantone: 'Yellow Green' },
                { name: '골든 옐로우', hex: '#FFD700', lab: [84, 5, 88], pantone: 'Golden Yellow' }
            ],
            
            summer: [
                { name: '더스티 로즈', hex: '#C8A2C8', lab: [71, 18, -8], pantone: 'Dusty Rose' },
                { name: '파우더 블루', hex: '#B0E0E6', lab: [86, -8, -12], pantone: 'Powder Blue' },
                { name: '라일락 그레이', hex: '#C8A2C8', lab: [71, 18, -8], pantone: 'Lilac Gray' },
                { name: '세이지 그린', hex: '#9CAF88', lab: [66, -12, 18], pantone: 'Sage Green' },
                { name: '소프트 핑크', hex: '#F8BBD9', lab: [81, 28, -2], pantone: 'Soft Pink' },
                { name: '미스트 블루', hex: '#C4D3E0', lab: [83, -2, -8], pantone: 'Mist Blue' }
            ],
            
            autumn: [
                { name: '테라코타', hex: '#E2725B', lab: [60, 32, 28], pantone: 'Terracotta' },
                { name: '올리브 그린', hex: '#808000', lab: [49, -8, 38], pantone: 'Olive Green' },
                { name: '머스타드', hex: '#FFDB58', lab: [84, -2, 68], pantone: 'Mustard' },
                { name: '딥 티얼', hex: '#008080', lab: [48, -28, -8], pantone: 'Deep Teal' },
                { name: '번트 오렌지', hex: '#CC5500', lab: [50, 42, 58], pantone: 'Burnt Orange' },
                { name: '골든 브라운', hex: '#B8860B', lab: [58, 8, 68], pantone: 'Golden Brown' }
            ],
            
            winter: [
                { name: '로얄 블루', hex: '#4169E1', lab: [45, 26, -67], pantone: 'Royal Blue' },
                { name: '에메랄드', hex: '#50C878', lab: [70, -48, 38], pantone: 'Emerald' },
                { name: '딥 레드', hex: '#8B0000', lab: [25, 48, 38], pantone: 'Deep Red' },
                { name: '퓨샤', hex: '#FF1493', lab: [54, 78, -8], pantone: 'Fuchsia' },
                { name: '아이시 블루', hex: '#B0E0E6', lab: [86, -8, -12], pantone: 'Icy Blue' },
                { name: '트루 화이트', hex: '#FFFFFF', lab: [100, 0, 0], pantone: 'True White' }
            ]
        },
        
        // 가상 드레이핑 설정
        virtualDraping: {
            enabled: true,
            blendMode: 'multiply',
            opacity: 0.6,
            smoothing: 0.3,
            realTimeProcessing: true,
            
            // 렌더링 설정
            rendering: {
                quality: 'high', // 'low', 'medium', 'high'
                antialiasing: true,
                shadows: true,
                reflections: false
            },
            
            // 물리적 속성
            fabricProperties: {
                shininess: 0.1,
                roughness: 0.8,
                metallic: 0.0,
                transparency: 0.1
            }
        },
        
        // 비교 도구
        comparison: {
            enableSideBySide: true,
            enableBeforeAfter: true,
            enableOverlay: true,
            autoCapture: true,
            maxComparisons: 12,
            
            // 자동 평가
            autoEvaluation: {
                enabled: true,
                criteria: ['brightness', 'contrast', 'harmony'],
                weightings: { brightness: 0.3, contrast: 0.4, harmony: 0.3 }
            }
        },
        
        // 전문가 워크플로우
        expertWorkflow: {
            steps: [
                { name: '초기 상담', duration: 5, required: true },
                { name: '베이스 테스트', duration: 10, required: true },
                { name: '세부 드레이핑', duration: 15, required: true },
                { name: '최종 확인', duration: 5, required: true },
                { name: '결과 설명', duration: 10, required: false }
            ],
            
            totalEstimatedTime: 45, // 분
            minRequiredSteps: 3
        }
    },

    // 성능 최적화 설정
    PERFORMANCE: {
        // 메모리 관리
        memory: {
            maxHeapSize: getDeviceType() === 'mobile' ? 50 * 1024 * 1024 : 150 * 1024 * 1024,
            gcThreshold: getDeviceType() === 'mobile' ? 40 * 1024 * 1024 : 120 * 1024 * 1024,
            cacheExpiry: 30 * 60 * 1000, // 30분
            imagePoolSize: getDeviceType() === 'mobile' ? 5 : 15,
            workerPoolSize: Math.min(safeNavigatorAccess('hardwareConcurrency', 4), 8),
            
            // 가비지 컬렉션 힌트
            enableMemoryProfiling: CURRENT_ENVIRONMENT === 'development',
            memoryWarningThreshold: 0.8, // 80% 사용시 경고
            forcedGCInterval: 5 * 60 * 1000 // 5분마다 강제 GC 힌트
        },
        
        // 이미지 처리 최적화
        imageProcessing: {
            maxDimensions: { 
                width: getDeviceType() === 'mobile' ? 1024 : 2048, 
                height: getDeviceType() === 'mobile' ? 1024 : 2048 
            },
            compressionQuality: getDeviceType() === 'mobile' ? 0.7 : 0.8,
            enableWebP: getBrowserInfo().features.canvas, // WebP 지원 체크
            enableAVIF: false, // 아직 지원이 제한적
            tileSize: getDeviceType() === 'mobile' ? 128 : 256,
            useWebGL: getBrowserInfo().features.webgl,
            useWebAssembly: 'WebAssembly' in window,
            
            // 병렬 처리
            parallelProcessing: {
                enabled: safeNavigatorAccess('hardwareConcurrency', 1) > 2,
                maxWorkers: Math.min(safeNavigatorAccess('hardwareConcurrency', 4), 4),
                chunkSize: 1024 * 1024 // 1MB 청크
            }
        },
        
        // 렌더링 최적화
        rendering: {
            targetFPS: getDeviceType() === 'mobile' ? 30 : 60,
            enableVSync: true,
            enableGPUAcceleration: getBrowserInfo().features.webgl,
            layeredRendering: true,
            debounceDelay: getDeviceType() === 'mobile' ? 500 : 300,
            throttleLimit: getDeviceType() === 'mobile' ? 200 : 100,
            
            // 적응형 품질
            adaptiveQuality: {
                enabled: true,
                fpsThreshold: 20, // FPS가 20 이하로 떨어지면 품질 감소
                qualityLevels: ['low', 'medium', 'high'],
                autoAdjust: true
            },
            
            // 배터리 최적화 (모바일)
            batteryOptimization: {
                enabled: getDeviceType() === 'mobile',
                lowBatteryThreshold: 0.2, // 20% 미만시 저전력 모드
                reducedAnimations: true,
                lowerResolution: true
            }
        },
        
        // 네트워크 최적화
        network: {
            enableCompression: true,
            enableCaching: true,
            prefetchResources: !getBrowserInfo().connection?.saveData,
            batchRequests: true,
            retryBackoff: 'exponential',
            
            // 연결 품질별 설정
            connectionOptimization: {
                enabled: !!getBrowserInfo().connection,
                slowConnectionThreshold: 1, // 1Mbps 미만
                fastConnectionThreshold: 10, // 10Mbps 이상
                
                settings: {
                    slow: {
                        imageQuality: 0.5,
                        prefetch: false,
                        batchSize: 1
                    },
                    fast: {
                        imageQuality: 0.9,
                        prefetch: true,
                        batchSize: 5
                    }
                }
            },
            
            // 오프라인 지원
            offline: {
                enabled: true,
                cacheStrategy: 'cache-first',
                maxCacheSize: 50 * 1024 * 1024, // 50MB
                syncWhenOnline: true
            }
        }
    },

    // 데이터 저장소 설정
    STORAGE: {
        // 로컬 저장소
        localStorage: {
            enabled: !!window.localStorage,
            prefix: 'pca_',
            maxSize: 10 * 1024 * 1024, // 10MB
            compression: true,
            encryption: false, // HTTPS 환경에서만 활성화 권장
            retention: 90 * 24 * 60 * 60 * 1000, // 90일
            
            // 저장소 정리
            cleanup: {
                autoCleanup: true,
                cleanupInterval: 24 * 60 * 60 * 1000, // 24시간
                maxItems: 1000,
                oldestFirstCleanup: true
            },
            
            // 압축 설정
            compressionSettings: {
                algorithm: 'gzip', // 'gzip' 또는 'lz4'
                threshold: 1024, // 1KB 이상만 압축
                level: 6 // 압축 레벨 (1-9)
            }
        },
        
        // IndexedDB 설정
        indexedDB: {
            enabled: getBrowserInfo().features.indexedDB,
            dbName: 'PersonalColorDB',
            version: 1,
            
            stores: {
                customers: { 
                    keyPath: 'id', 
                    autoIncrement: true,
                    indexes: ['name', 'phone', 'email', 'visitDate']
                },
                diagnoses: { 
                    keyPath: 'id', 
                    autoIncrement: true,
                    indexes: ['customerId', 'date', 'season', 'confidence']
                },
                reports: { 
                    keyPath: 'id', 
                    autoIncrement: true,
                    indexes: ['customerId', 'diagnosisId', 'createdAt']
                },
                images: { 
                    keyPath: 'id', 
                    autoIncrement: true,
                    indexes: ['diagnosisId', 'type', 'timestamp']
                },
                settings: { 
                    keyPath: 'key',
                    autoIncrement: false
                },
                cache: {
                    keyPath: 'url',
                    autoIncrement: false,
                    indexes: ['timestamp', 'type']
                }
            },
            
            // 트랜잭션 설정
            transactions: {
                timeout: 30000, // 30초
                retryAttempts: 3,
                batchSize: 100
            }
        },
        
        // 백업 및 동기화
        backup: {
            autoBackup: true,
            backupInterval: 24 * 60 * 60 * 1000, // 24시간
            maxBackups: 7,
            cloudSync: false, // 향후 구현 예정
            
            exportFormats: ['json', 'csv', 'pdf'],
            
            // 백업 설정
            backupSettings: {
                includeImages: false, // 이미지는 용량상 제외
                compressBackup: true,
                encryptBackup: false,
                partialBackup: true // 변경된 부분만 백업
            }
        }
    },

    // 사용자 인터페이스 설정
    UI: {
        // 테마 설정
        theme: {
            default: 'professional',
            available: ['professional', 'elegant', 'modern', 'classic'],
            darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
            highContrast: window.matchMedia('(prefers-contrast: high)').matches,
            
            // 커스텀 색상
            customColors: {
                primary: '#6366f1',
                primaryDark: '#4f46e5',
                secondary: '#ec4899',
                secondaryDark: '#db2777',
                accent: '#f59e0b',
                success: '#10b981',
                warning: '#f59e0b',
                error: '#ef4444',
                
                // 그라데이션
                gradients: {
                    primary: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    secondary: 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)',
                    success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                }
            }
        },
        
        // 레이아웃 설정
        layout: {
            // 반응형 브레이크포인트
            breakpoints: {
                xs: '480px',
                sm: '640px',
                md: '768px',
                lg: '1024px',
                xl: '1280px',
                xxl: '1536px'
            },
            
            // 컴포넌트 크기
            headerHeight: getDeviceType() === 'mobile' ? '60px' : '80px',
            sidebarWidth: getDeviceType() === 'mobile' ? '280px' : '320px',
            contentPadding: getDeviceType() === 'mobile' ? '16px' : '24px',
            cardBorderRadius: '12px',
            buttonBorderRadius: '8px',
            
            // 그리드 시스템
            grid: {
                columns: 12,
                gutter: getDeviceType() === 'mobile' ? '16px' : '24px',
                containerMaxWidth: '1400px'
            },
            
            // Z-index 레이어
            zIndex: {
                dropdown: 1000,
                sticky: 1020,
                fixed: 1030,
                modalBackdrop: 1040,
                modal: 1050,
                popover: 1060,
                tooltip: 1070,
                toast: 1080
            }
        },
        
        // 애니메이션 설정
        animations: {
            enabled: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            duration: getDeviceType() === 'mobile' ? 200 : 300,
            easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
            reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            
            // 애니메이션 타입별 설정
            types: {
                pageTransition: {
                    duration: 400,
                    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                },
                modalTransition: {
                    duration: 250,
                    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                },
                buttonHover: {
                    duration: 150,
                    easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
                },
                loading: {
                    duration: 1000,
                    easing: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
                    infinite: true
                }
            }
        },
        
        // 접근성 설정
        accessibility: {
            screenReader: true,
            keyboardNavigation: true,
            focusIndicators: true,
            skipLinks: true,
            ariaLabels: true,
            contrastRatio: 4.5,
            
            // 폰트 크기
            fontSize: {
                min: '14px',
                default: '16px',
                max: '24px',
                scaleRatio: 1.125
            },
            
            // 색상 접근성
            colorAccessibility: {
                enforceContrast: true,
                minimumContrast: 4.5,
                largeTextContrast: 3.0,
                colorBlindFriendly: true
            },
            
            // 키보드 네비게이션
            keyboard: {
                trapFocus: true,
                escapeToClose: true,
                tabNavigation: true,
                arrowKeyNavigation: true
            }
        },
        
        // 터치 및 제스처 (모바일/태블릿)
        touch: {
            enabled: getDeviceType() !== 'desktop',
            minTouchTarget: '44px', // Apple HIG 기준
            swipeThreshold: 100,
            longPressDelay: 500,
            hapticFeedback: 'vibrate' in navigator,
            preventZoom: getDeviceType() === 'mobile',
            
            // 제스처 설정
            gestures: {
                swipeToNavigate: true,
                pinchToZoom: false, // 진단 중에는 비활성화
                doubleTapToZoom: false,
                longPressMenu: true
            },
            
            // 터치 피드백
            feedback: {
                visual: true,
                haptic: 'vibrate' in navigator,
                audio: false,
                rippleEffect: true
            }
        }
    },

    // 국제화 설정
    I18N: {
        defaultLanguage: 'ko',
        supportedLanguages: ['ko', 'en', 'ja', 'zh-CN'],
        fallbackLanguage: 'en',
        
        // 언어 감지
        detection: {
            order: ['localStorage', 'navigator', 'htmlTag'],
            caches: ['localStorage'],
            lookupLocalStorage: 'i18nextLng'
        },
        
        // 로딩 설정
        loading: {
            lazy: true,
            preload: ['ko'], // 기본 언어는 미리 로드
            loadPath: '/locales/{{lng}}/{{ns}}.json',
            addPath: '/locales/add/{{lng}}/{{ns}}'
        },
        
        // 네임스페이스
        namespaces: {
            default: 'common',
            available: ['common', 'diagnosis', 'report', 'customer', 'settings', 'errors']
        },
        
        // 형식화
        formatting: {
            currency: {
                ko: 'KRW',
                en: 'USD',
                ja: 'JPY',
                'zh-CN': 'CNY'
            },
            dateFormat: {
                ko: 'YYYY-MM-DD',
                en: 'MM/DD/YYYY',
                ja: 'YYYY/MM/DD',
                'zh-CN': 'YYYY-MM-DD'
            },
            timeFormat: {
                ko: 'HH:mm',
                en: 'hh:mm A',
                ja: 'HH:mm',
                'zh-CN': 'HH:mm'
            }
        },
        
        // 지역별 설정
        localeSettings: {
            ko: {
                name: '한국어',
                flag: '🇰🇷',
                rtl: false,
                numberFormat: '1,234.56'
            },
            en: {
                name: 'English',
                flag: '🇺🇸',
                rtl: false,
                numberFormat: '1,234.56'
            },
            ja: {
                name: '日本語',
                flag: '🇯🇵',
                rtl: false,
                numberFormat: '1,234.56'
            },
            'zh-CN': {
                name: '简体中文',
                flag: '🇨🇳',
                rtl: false,
                numberFormat: '1,234.56'
            }
        }
    },

    // 보고서 생성 설정
    REPORTS: {
        // 템플릿 설정
        templates: {
            standard: {
                name: '표준 진단 보고서',
                sections: ['customer', 'diagnosis', 'recommendations', 'colors'],
                pageSize: 'A4',
                orientation: 'portrait'
            },
            detailed: {
                name: '상세 진단 보고서',
                sections: ['customer', 'diagnosis', 'analysis', 'recommendations', 'colors', 'styling'],
                pageSize: 'A4',
                orientation: 'portrait'
            },
            summary: {
                name: '요약 보고서',
                sections: ['diagnosis', 'recommendations'],
                pageSize: 'A5',
                orientation: 'portrait'
            }
        },
        
        // PDF 생성 설정
        pdf: {
            engine: 'jsPDF', // 'jsPDF' 또는 'html2pdf'
            quality: 1.0,
            dpi: 300,
            format: 'A4',
            margins: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20
            },
            
            // 폰트 설정
            fonts: {
                korean: 'NotoSansKR',
                english: 'Roboto',
                fallback: 'Arial'
            },
            
            // 이미지 설정
            images: {
                format: 'JPEG',
                quality: 0.8,
                maxWidth: 500,
                maxHeight: 500
            }
        },
        
        // 색상 팔레트 표시
        colorPalette: {
            swatchSize: 40, // px
            swatchesPerRow: 6,
            showHexValues: true,
            showColorNames: true,
            groupByCategory: true
        },
        
        // 브랜딩
        branding: {
            logo: '/assets/images/logo.png',
            companyName: 'Personal Color Pro',
            website: 'www.personalcolorpro.com',
            footer: 'Professional Personal Color Analysis',
            watermark: false
        }
    },

    // 고객 관리 설정
    CUSTOMER_MANAGEMENT: {
        // 고객 정보 필드
        customerFields: {
            required: ['name', 'phone'],
            optional: ['email', 'age', 'gender', 'skinType', 'hairColor', 'notes'],
            
            validation: {
                name: { minLength: 2, maxLength: 50 },
                phone: { pattern: /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/ },
                email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
                age: { min: 15, max: 100 }
            }
        },
        
        // 검색 및 필터
        search: {
            fields: ['name', 'phone', 'email'],
            fuzzySearch: true,
            searchThreshold: 0.6
        },
        
        // 정렬 옵션
        sorting: {
            default: 'visitDate_desc',
            options: [
                'name_asc', 'name_desc',
                'visitDate_asc', 'visitDate_desc',
                'diagnosis_asc', 'diagnosis_desc'
            ]
        },
        
        // 개인정보 보호
        privacy: {
            dataRetention: 365 * 24 * 60 * 60 * 1000, // 1년
            anonymization: true,
            exportRestriction: true,
            consentRequired: true
        }
    },

    // 보안 설정
    SECURITY: {
        // 데이터 보호
        dataProtection: {
            enableEncryption: window.location.protocol === 'https:',
            encryptionAlgorithm: 'AES-256-GCM',
            hashAlgorithm: 'SHA-256',
            saltLength: 32
        },
        
        // 세션 관리
        session: {
            timeout: 60 * 60 * 1000, // 1시간
            extendOnActivity: true,
            multipleDevices: false,
            secureStorage: true
        },
        
        // API 보안
        api: {
            rateLimiting: {
                enabled: true,
                maxRequests: 100,
                windowMs: 15 * 60 * 1000 // 15분
            },
            apiKeyRequired: false,
            corsEnabled: true
        },
        
        // 개인정보 보호
        privacy: {
            gdprCompliance: true,
            dataMinimization: true,
            rightToDelete: true,
            consentManagement: true
        }
    },

    // 디버깅 및 로깅
    DEBUG: {
        enabled: CURRENT_ENVIRONMENT !== 'production',
        verboseLogging: CURRENT_ENVIRONMENT === 'development',
        
        // 로그 레벨
        logLevel: {
            development: 'debug',
            staging: 'info',
            production: 'error'
        }[CURRENT_ENVIRONMENT],
        
        // 성능 모니터링
        performance: {
            enabled: true,
            measureLoadTime: true,
            measureRenderTime: true,
            trackMemoryUsage: CURRENT_ENVIRONMENT === 'development',
            trackFPS: CURRENT_ENVIRONMENT === 'development'
        },
        
        // 에러 리포팅
        errorReporting: {
            enabled: CURRENT_ENVIRONMENT === 'production',
            captureConsoleErrors: true,
            captureUnhandledRejections: true,
            maxErrors: 50,
            endpoint: '/api/errors'
        }
    }
};

// 설정 유효성 검증
const validateConfig = () => {
    const config = window.PersonalColorConfig;
    const warnings = [];
    const errors = [];
    
    // 필수 설정 검증
    if (!config.APP_INFO.version) {
        errors.push('APP_INFO.version이 설정되지 않았습니다.');
    }
    
    if (!config.CAMERA.constraints) {
        errors.push('CAMERA.constraints가 설정되지 않았습니다.');
    }
    
    // 브라우저 호환성 검증
    const features = getBrowserInfo().features;
    
    if (!features.webgl && config.PERFORMANCE.imageProcessing.useWebGL) {
        warnings.push('WebGL을 지원하지 않는 브라우저입니다. 성능이 저하될 수 있습니다.');
    }
    
    if (!features.indexedDB && config.STORAGE.indexedDB.enabled) {
        warnings.push('IndexedDB를 지원하지 않는 브라우저입니다. 로컬 저장소를 사용합니다.');
        config.STORAGE.indexedDB.enabled = false;
    }
    
    if (!features.webrtc) {
        errors.push('이 브라우저는 카메라를 지원하지 않습니다.');
    }
    
    // 로그 출력
    if (errors.length > 0) {
        console.error('❌ 설정 검증 오류:', errors);
    }
    
    if (warnings.length > 0) {
        console.warn('⚠️ 설정 검증 경고:', warnings);
    }
    
    if (errors.length === 0 && warnings.length === 0) {
        console.log('✅ 설정 검증 완료');
    }
    
    return { errors, warnings };
};

// 설정 초기화 및 검증 실행
try {
    const validation = validateConfig();
    
    // 개발 환경에서만 상세 정보 출력
    if (CURRENT_ENVIRONMENT === 'development') {
        console.log('🔧 Personal Color Pro 설정:', window.PersonalColorConfig);
        console.log('🌍 환경 정보:', CURRENT_ENVIRONMENT);
        console.log('📱 디바이스 타입:', getDeviceType());
        console.log('🌐 브라우저 정보:', getBrowserInfo());
        
        // 설정 유틸리티 함수들
        window.ConfigUtils = {
            getConfig: () => window.PersonalColorConfig,
            validateConfig,
            getBrowserInfo,
            getDeviceType,
            detectEnvironment,
            
            // 설정 업데이트 함수
            updateConfig: (path, value) => {
                const pathArray = path.split('.');
                let current = window.PersonalColorConfig;
                
                for (let i = 0; i < pathArray.length - 1; i++) {
                    current = current[pathArray[i]];
                }
                
                current[pathArray[pathArray.length - 1]] = value;
                console.log(`설정 업데이트됨: ${path} = ${value}`);
            }
        };
        
        console.log('🔧 개발자 도구: window.ConfigUtils 사용 가능');
    }
    
    console.log('✅ Personal Color Pro 설정 로드 완료');
    
} catch (error) {
    console.error('❌ 설정 초기화 실패:', error);
    
    // 폴백 설정 제공
    window.PersonalColorConfig = {
        APP_INFO: { version: '1.0.0', environment: 'production' },
        ENVIRONMENT: { current: 'production', isProduction: true },
        API: { baseUrl: '/api/v1', timeout: 30000 },
        DEBUG: { enabled: false, logLevel: 'error' }
    };
    
    console.warn('⚠️ 기본 설정으로 폴백됨');
}
