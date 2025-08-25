/**
 * config.js - Personal Color Pro 전역 설정
 * 
 * 퍼스널컬러 진단 앱의 모든 설정값들을 관리
 * 브라우저 환경에서 직접 실행 가능하도록 최적화
 */

// 환경 감지 함수 (process.env 대신 브라우저 기반)
const detectEnvironment = () => {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // 개발 환경
    if (hostname === 'localhost' || 
        hostname === '127.0.0.1' || 
        hostname.startsWith('192.168.') ||
        protocol === 'file:') {
        return 'development';
    }
    
    // 스테이징 환경
    if (hostname.includes('staging') || 
        hostname.includes('test') || 
        hostname.includes('dev')) {
        return 'staging';
    }
    
    // 프로덕션 환경 (기본값)
    return 'production';
};

// 현재 환경
const CURRENT_ENVIRONMENT = detectEnvironment();

// 브라우저 정보 수집
const getBrowserInfo = () => {
    return {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        hardwareConcurrency: navigator.hardwareConcurrency || 4,
        deviceMemory: navigator.deviceMemory || 4,
        connection: navigator.connection ? {
            effectiveType: navigator.connection.effectiveType,
            downlink: navigator.connection.downlink,
            rtt: navigator.connection.rtt
        } : null
    };
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
        environment: CURRENT_ENVIRONMENT,
        browserInfo: getBrowserInfo()
    },

    // 환경별 설정
    ENVIRONMENT: {
        current: CURRENT_ENVIRONMENT,
        isDevelopment: CURRENT_ENVIRONMENT === 'development',
        isStaging: CURRENT_ENVIRONMENT === 'staging',
        isProduction: CURRENT_ENVIRONMENT === 'production'
    },

    // API 및 서버 설정
    API: {
        baseUrl: CURRENT_ENVIRONMENT === 'development' 
            ? 'http://localhost:3000/api/v1' 
            : '/api/v1',
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000,
        endpoints: {
            analysis: '/analysis',
            customers: '/customers',
            reports: '/reports',
            models: '/models',
            upload: '/upload',
            export: '/export',
            analytics: '/analytics'
        }
    },

    // AI 모델 및 분석 설정
    AI_MODELS: {
        skinToneAnalyzer: {
            modelUrl: '/js/ai/models/personal-color-model.json',
            weightsUrl: '/js/ai/models/skin-tone-weights.bin',
            inputSize: [224, 224, 3],
            outputClasses: ['spring', 'summer', 'autumn', 'winter'],
            confidenceThreshold: 0.85,
            maxBatchSize: 1,
            preprocessingSettings: {
                normalize: true,
                centerCrop: true,
                colorSpace: 'RGB'
            }
        },
        
        faceDetection: {
            modelType: 'mediapipe',
            modelUrl: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4/face_detection.js',
            maxNumFaces: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.5,
            selfieMode: true
        },
        
        colorClassifier: {
            algorithm: 'deltaE2000',
            colorSpace: 'CIELAB',
            toleranceThreshold: 3.0,
            referenceColors: {
                spring: ['#FFB6C1', '#98FB98', '#F0E68C', '#FFA07A'],
                summer: ['#E6E6FA', '#B0E0E6', '#D8BFD8', '#F0F8FF'],
                autumn: ['#DEB887', '#CD853F', '#D2691E', '#A0522D'],
                winter: ['#000080', '#8B0000', '#2F4F4F', '#800080']
            }
        }
    },

    // 카메라 및 미디어 설정
    CAMERA: {
        preferredResolution: {
            width: 1920,
            height: 1080
        },
        fallbackResolutions: [
            { width: 1280, height: 720 },
            { width: 640, height: 480 },
            { width: 320, height: 240 }
        ],
        frameRate: 30,
        facingMode: 'user', // 'user' 또는 'environment'
        constraints: {
            video: {
                width: { ideal: 1920, min: 640 },
                height: { ideal: 1080, min: 480 },
                frameRate: { ideal: 30, min: 15 },
                facingMode: 'user',
                aspectRatio: { ideal: 16/9 }
            }
        },
        captureSettings: {
            imageFormat: 'image/jpeg',
            quality: 0.9,
            maxFileSize: 5 * 1024 * 1024 // 5MB
        }
    },

    // 색상 분석 상세 설정
    COLOR_ANALYSIS: {
        // 표준 조명 조건
        standardIlluminant: {
            type: 'D65',
            temperature: 6504, // Kelvin
            chromaticity: { x: 0.3127, y: 0.3290 },
            intensity: 300 // lux
        },
        
        // 피부 영역 감지 설정
        skinDetection: {
            regions: {
                forehead: { x: 0.3, y: 0.2, w: 0.4, h: 0.15 },
                leftCheek: { x: 0.15, y: 0.4, w: 0.2, h: 0.2 },
                rightCheek: { x: 0.65, y: 0.4, w: 0.2, h: 0.2 },
                nose: { x: 0.4, y: 0.45, w: 0.2, h: 0.15 },
                chin: { x: 0.35, y: 0.65, w: 0.3, h: 0.15 }
            },
            weights: {
                forehead: 0.3,
                leftCheek: 0.25,
                rightCheek: 0.25,
                nose: 0.15,
                chin: 0.05
            },
            minPixelCount: 1000,
            qualityThreshold: 0.8
        },
        
        // 색상 공간 설정
        colorSpaces: {
            input: 'sRGB',
            analysis: 'CIELAB',
            display: 'sRGB',
            deltaE: 'CIE2000'
        },
        
        // 계절 분류 기준
        seasonClassification: {
            undertone: {
                warm: { aThreshold: 5, bThreshold: 8 },
                cool: { aThreshold: -5, bThreshold: -8 },
                neutral: { aRange: [-5, 5], bRange: [-8, 8] }
            },
            lightness: {
                light: { LThreshold: 65 },
                medium: { LRange: [45, 65] },
                deep: { LThreshold: 45 }
            },
            saturation: {
                muted: { chromaThreshold: 20 },
                medium: { chromaRange: [20, 40] },
                vivid: { chromaThreshold: 40 }
            }
        }
    },

    // 드레이핑 시스템 설정
    DRAPING: {
        colorSets: {
            spring: [
                { name: '코랄 핑크', hex: '#FF7F7F', lab: [65, 40, 20] },
                { name: '피치', hex: '#FFB347', lab: [75, 15, 45] },
                { name: '아쿠아', hex: '#7FFFD4', lab: [85, -25, 10] },
                { name: '바이올렛', hex: '#DA70D6', lab: [60, 50, -30] }
            ],
            summer: [
                { name: '라벤더', hex: '#E6E6FA', lab: [90, 5, -15] },
                { name: '로즈', hex: '#F0C0C0', lab: [80, 20, 10] },
                { name: '민트', hex: '#B0FFB0', lab: [88, -30, 25] },
                { name: '퍼플', hex: '#9370DB', lab: [55, 35, -45] }
            ],
            autumn: [
                { name: '버건디', hex: '#800020', lab: [25, 40, 20] },
                { name: '올리브', hex: '#808000', lab: [50, -10, 40] },
                { name: '러스트', hex: '#B7410E', lab: [45, 35, 50] },
                { name: '포레스트', hex: '#228B22', lab: [45, -45, 35] }
            ],
            winter: [
                { name: '로얄 블루', hex: '#4169E1', lab: [45, 15, -65] },
                { name: '에메랄드', hex: '#50C878', lab: [70, -45, 35] },
                { name: '딥 레드', hex: '#8B0000', lab: [25, 45, 40] },
                { name: '퓨샤', hex: '#FF1493', lab: [55, 75, -10] }
            ]
        },
        
        virtualDraping: {
            enabled: true,
            blendMode: 'multiply',
            opacity: 0.6,
            smoothing: 0.3,
            realTimeProcessing: true
        },
        
        comparison: {
            enableSideBySide: true,
            enableBeforeAfter: true,
            autoCapture: true,
            maxComparisons: 10
        }
    },

    // 성능 최적화 설정
    PERFORMANCE: {
        // 메모리 관리
        memory: {
            maxHeapSize: 100 * 1024 * 1024, // 100MB
            gcThreshold: 80 * 1024 * 1024,  // 80MB
            cacheExpiry: 30 * 60 * 1000,    // 30분
            imagePoolSize: 10,
            workerPoolSize: navigator.hardwareConcurrency || 4
        },
        
        // 이미지 처리 최적화
        imageProcessing: {
            maxDimensions: { width: 2048, height: 2048 },
            compressionQuality: 0.8,
            enableWebP: true,
            enableAVIF: false,
            tileSize: 256,
            useWebGL: true,
            useWebAssembly: false
        },
        
        // 렌더링 최적화
        rendering: {
            targetFPS: 60,
            enableVSync: true,
            enableGPUAcceleration: true,
            layeredRendering: true,
            debounceDelay: 300,
            throttleLimit: 100
        },
        
        // 네트워크 최적화
        network: {
            enableCompression: true,
            enableCaching: true,
            prefetchResources: true,
            batchRequests: true,
            retryBackoff: 'exponential'
        }
    },

    // 데이터 저장소 설정
    STORAGE: {
        // 로컬 저장소
        localStorage: {
            enabled: true,
            prefix: 'pca_',
            maxSize: 10 * 1024 * 1024, // 10MB
            compression: true,
            encryption: false,
            retention: 90 * 24 * 60 * 60 * 1000 // 90일
        },
        
        // IndexedDB 설정
        indexedDB: {
            enabled: true,
            dbName: 'PersonalColorDB',
            version: 1,
            stores: {
                customers: { keyPath: 'id', autoIncrement: true },
                diagnoses: { keyPath: 'id', autoIncrement: true },
                reports: { keyPath: 'id', autoIncrement: true },
                images: { keyPath: 'id', autoIncrement: true },
                settings: { keyPath: 'key' }
            }
        },
        
        // 백업 및 동기화
        backup: {
            autoBackup: true,
            backupInterval: 24 * 60 * 60 * 1000, // 24시간
            maxBackups: 7,
            cloudSync: false,
            exportFormats: ['json', 'csv', 'pdf']
        }
    },

    // 사용자 인터페이스 설정
    UI: {
        // 테마 설정
        theme: {
            default: 'professional',
            available: ['professional', 'elegant', 'modern', 'classic'],
            darkMode: false,
            highContrast: false,
            customColors: {
                primary: '#2C3E50',
                secondary: '#3498DB',
                accent: '#E74C3C',
                success: '#27AE60',
                warning: '#F39C12',
                error: '#E74C3C'
            }
        },
        
        // 레이아웃 설정
        layout: {
            headerHeight: '80px',
            sidebarWidth: '320px',
            contentPadding: '24px',
            cardBorderRadius: '12px',
            responsive: {
                tablet: '768px',
                desktop: '1024px',
                widescreen: '1440px'
            }
        },
        
        // 애니메이션 설정
        animations: {
            enabled: true,
            duration: 300,
            easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
            reducedMotion: false,
            pageTransitions: true,
            microInteractions: true
        },
        
        // 접근성 설정
        accessibility: {
            screenReader: true,
            keyboardNavigation: true,
            focusIndicators: true,
            skipLinks: true,
            ariaLabels: true,
            contrastRatio: 4.5,
            fontSize: {
                min: '14px',
                default: '16px',
                max: '24px'
            }
        },
        
        // 터치 및 제스처
        touch: {
            enabled: true,
            minTouchTarget: '44px',
            swipeThreshold: 100,
            longPressDelay: 500,
            hapticFeedback: true,
            preventZoom: true
        }
    },

    // 국제화 설정
    I18N: {
        defaultLanguage: 'ko',
        supportedLanguages: ['ko', 'en', 'ja', 'zh'],
