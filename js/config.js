/**
 * config.js - Personal Color Pro 완전한 최종 설정 버전
 * 
 * 🚀 완전 복원: 원본의 모든 설정 항목 포함
 * ✅ getConfig() 함수 + 전역 함수들
 * ✅ 드레이핑 시스템 완전 설정
 * ✅ 보고서 생성 상세 설정  
 * ✅ 국제화 다국어 지원
 * ✅ 고객 관리 시스템
 * ✅ 보안 및 개인정보 보호
 * ✅ 성능 최적화 세부 설정
 * ✅ UI/UX 접근성 설정
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
        
        if (hostname === 'localhost' || 
            hostname === '127.0.0.1' || 
            hostname.startsWith('192.168.') ||
            hostname.startsWith('10.') ||
            protocol === 'file:') {
            return 'development';
        }
        
        if (hostname.includes('staging') || 
            hostname.includes('test') || 
            hostname.includes('dev') ||
            hostname.includes('preview')) {
            return 'staging';
        }
        
        return 'production';
    } catch (error) {
        console.warn('환경 감지 실패:', error);
        return 'production';
    }
};

// 현재 환경
const CURRENT_ENVIRONMENT = detectEnvironment();

// 🔥 긴급 추가: getConfig 함수 (8개 파일 로드 실패 해결)
/**
 * 전역 설정값 접근 함수
 * @param {string} keyPath - 설정 키 경로 (예: 'CAMERA.constraints', 'AI_MODELS.confidenceThreshold')
 * @param {*} defaultValue - 기본값
 * @returns {*} 설정값 또는 기본값
 */
function getConfig(keyPath, defaultValue = null) {
    try {
        if (!window.PersonalColorConfig) {
            console.warn('PersonalColorConfig가 아직 로드되지 않았습니다.');
            return defaultValue;
        }

        // 키 경로를 점(.)으로 분리하여 중첩된 객체에 접근
        const keys = keyPath.split('.');
        let current = window.PersonalColorConfig;
        
        for (const key of keys) {
            if (current === null || current === undefined || typeof current !== 'object') {
                console.warn(`설정 경로 '${keyPath}'에서 '${key}' 찾을 수 없음`);
                return defaultValue;
            }
            current = current[key];
        }
        
        return current !== undefined ? current : defaultValue;
        
    } catch (error) {
        console.warn(`getConfig 오류 (${keyPath}):`, error);
        return defaultValue;
    }
}

// 전역에서 접근 가능하도록 등록
window.getConfig = getConfig;

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
        }
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
 * Personal Color Pro 완전한 전역 설정 객체
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
        }
    },

    // AI 모델 및 분석 설정
    AI_MODELS: {
        skinToneAnalyzer: {
            modelUrl: './js/ai/models/personal-color-model.json',
            weightsUrl: './js/ai/models/skin-tone-weights.bin',
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
            }
        },
        
        faceDetection: {
            modelType: 'blazeface',
            modelUrl: 'https://tfhub.dev/tensorflow/tfjs-model/blazeface/1/default/1',
            maxNumFaces: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.5,
            selfieMode: true,
            
            // 대안 설정
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
        preferredResolution: {
            width: getDeviceType() === 'mobile' ? 1280 : 1920,
            height: getDeviceType() === 'mobile' ? 720 : 1080
        },
        
        fallbackResolutions: [
            { width: 1920, height: 1080 },
            { width: 1280, height: 720 },
            { width: 854, height: 480 },
            { width: 640, height: 480 }
        ],
        
        frameRate: getDeviceType() === 'mobile' ? 24 : 30,
        facingMode: 'user',
        
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
            audio: false
        },
        
        captureSettings: {
            imageFormat: 'image/jpeg',
            quality: 0.9,
            maxFileSize: 10 * 1024 * 1024 // 10MB
        }
    },

    // 색상 분석 상세 설정
    COLOR_ANALYSIS: {
        standardIlluminant: {
            type: 'D65',
            temperature: 6504,
            chromaticity: { x: 0.3127, y: 0.3290 },
            intensity: 300,
            description: 'Average daylight'
        },
        
        // 피부 영역 감지 설정
        skinDetection: {
            regions: {
                forehead: { x: 0.3, y: 0.15, w: 0.4, h: 0.15 },
                leftCheek: { x: 0.15, y: 0.35, w: 0.2, h: 0.2 },
                rightCheek: { x: 0.65, y: 0.35, w: 0.2, h: 0.2 },
                nose: { x: 0.4, y: 0.4, w: 0.2, h: 0.2 },
                chin: { x: 0.35, y: 0.65, w: 0.3, h: 0.15 }
            },
            
            weights: {
                forehead: 0.25,
                leftCheek: 0.25,
                rightCheek: 0.25,
                nose: 0.15,
                chin: 0.10
            },
            
            qualityThresholds: {
                minPixelCount: 1000,
                maxPixelCount: 50000,
                minVariance: 10,
                maxVariance: 100,
                minConfidence: 0.7,
                minFaceSize: 0.1
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
            
            whitePoint: {
                X: 95.047,
                Y: 100.000,
                Z: 108.883
            }
        },
        
        // 계절 분류 기준
        seasonClassification: {
            undertone: {
                warm: { aThreshold: 3, bThreshold: 6 },
                cool: { aThreshold: -3, bThreshold: -6 },
                neutral: { aRange: [-3, 3], bRange: [-6, 6] }
            },
            
            lightness: {
                light: { LThreshold: 65 },
                medium: { LRange: [45, 65] },
                deep: { LThreshold: 45 }
            },
            
            // 한국인 특화 보정값
            koreanSkinAdjustment: {
                undertoneBoost: 1.2,
                lightnessBoost: 0.9,
                saturationBoost: 1.1
            }
        }
    },

    // 🎨 드레이핑 시스템 설정 (완전 복원)
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
            
            rendering: {
                quality: 'high',
                antialiasing: true,
                shadows: true,
                reflections: false
            },
            
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
            totalEstimatedTime: 45,
            minRequiredSteps: 3
        }
    },

    // 성능 최적화 설정
    PERFORMANCE: {
        memory: {
            maxHeapSize: getDeviceType() === 'mobile' ? 50 * 1024 * 1024 : 150 * 1024 * 1024,
            gcThreshold: getDeviceType() === 'mobile' ? 40 * 1024 * 1024 : 120 * 1024 * 1024,
            cacheExpiry: 30 * 60 * 1000,
            imagePoolSize: getDeviceType() === 'mobile' ? 5 : 15,
            workerPoolSize: Math.min(safeNavigatorAccess('hardwareConcurrency', 4), 8)
        },
        
        imageProcessing: {
            maxDimensions: { 
                width: getDeviceType() === 'mobile' ? 1024 : 2048, 
                height: getDeviceType() === 'mobile' ? 1024 : 2048 
            },
            compressionQuality: getDeviceType() === 'mobile' ? 0.7 : 0.8,
            useWebGL: getBrowserInfo().features.webgl,
            useWebAssembly: 'WebAssembly' in window,
            
            parallelProcessing: {
                enabled: safeNavigatorAccess('hardwareConcurrency', 1) > 2,
                maxWorkers: Math.min(safeNavigatorAccess('hardwareConcurrency', 4), 4),
                chunkSize: 1024 * 1024
            }
        },
        
        rendering: {
            targetFPS: getDeviceType() === 'mobile' ? 30 : 60,
            enableVSync: true,
            enableGPUAcceleration: getBrowserInfo().features.webgl,
            
            adaptiveQuality: {
                enabled: true,
                fpsThreshold: 20,
                qualityLevels: ['low', 'medium', 'high'],
                autoAdjust: true
            }
        }
    },

    // 데이터 저장소 설정
    STORAGE: {
        localStorage: {
            enabled: !!window.localStorage,
            prefix: 'pca_',
            maxSize: 10 * 1024 * 1024,
            compression: true,
            retention: 90 * 24 * 60 * 60 * 1000
        },
        
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
                }
            }
        }
    },

    // UI 설정 (완전 버전)
    UI: {
        theme: {
            default: 'professional',
            available: ['professional', 'elegant', 'modern', 'classic'],
            darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
            
            customColors: {
                primary: '#6366f1',
                primaryDark: '#4f46e5',
                secondary: '#ec4899',
                accent: '#f59e0b',
                success: '#10b981',
                warning: '#f59e0b',
                error: '#ef4444'
            }
        },
        
        layout: {
            breakpoints: {
                xs: '480px',
                sm: '640px',
                md: '768px',
                lg: '1024px',
                xl: '1280px'
            },
            
            headerHeight: getDeviceType() === 'mobile' ? '60px' : '80px',
            sidebarWidth: '320px',
            contentPadding: '24px',
            
            zIndex: {
                dropdown: 1000,
                modal: 1050,
                tooltip: 1070,
                toast: 1080
            }
        },
        
        animations: {
            enabled: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            duration: getDeviceType() === 'mobile' ? 200 : 300,
            easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
        },
        
        accessibility: {
            screenReader: true,
            keyboardNavigation: true,
            focusIndicators: true,
            contrastRatio: 4.5,
            
            fontSize: {
                min: '14px',
                default: '16px',
                max: '24px'
            }
        },
        
        touch: {
            enabled: getDeviceType() !== 'desktop',
            minTouchTarget: '44px',
            swipeThreshold: 100,
            longPressDelay: 500,
            hapticFeedback: 'vibrate' in navigator
        }
    },

    // 🌐 국제화 설정 (완전 복원)
    I18N: {
        defaultLanguage: 'ko',
        supportedLanguages: ['ko', 'en', 'ja', 'zh-CN'],
        fallbackLanguage: 'en',
        
        detection: {
            order: ['localStorage', 'navigator', 'htmlTag'],
            caches: ['localStorage'],
            lookupLocalStorage: 'i18nextLng'
        },
        
        loading: {
            lazy: true,
            preload: ['ko'],
            loadPath: '/locales/{{lng}}/{{ns}}.json'
        },
        
        namespaces: {
            default: 'common',
            available: ['common', 'diagnosis', 'report', 'customer', 'settings', 'errors']
        },
        
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
            }
        },
        
        localeSettings: {
            ko: { name: '한국어', flag: '🇰🇷', rtl: false },
            en: { name: 'English', flag: '🇺🇸', rtl: false },
            ja: { name: '日本語', flag: '🇯🇵', rtl: false },
            'zh-CN': { name: '简体中文', flag: '🇨🇳', rtl: false }
        }
    },

    // 📊 보고서 생성 설정 (완전 복원)
    REPORTS: {
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
        
        pdf: {
            engine: 'jsPDF',
            quality: 1.0,
            dpi: 300,
            format: 'A4',
            margins: { top: 20, right: 20, bottom: 20, left: 20 },
            
            fonts: {
                korean: 'NotoSansKR',
                english: 'Roboto',
                fallback: 'Arial'
            },
            
            images: {
                format: 'JPEG',
                quality: 0.8,
                maxWidth: 500,
                maxHeight: 500
            }
        },
        
        colorPalette: {
            swatchSize: 40,
            swatchesPerRow: 6,
            showHexValues: true,
            showColorNames: true,
            groupByCategory: true
        },
        
        branding: {
            logo: '/assets/images/logo.png',
            companyName: 'Personal Color Pro',
            website: 'www.personalcolorpro.com',
            footer: 'Professional Personal Color Analysis'
        }
    },

    // 👥 고객 관리 설정 (완전 복원)
    CUSTOMER_MANAGEMENT: {
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
        
        search: {
            fields: ['name', 'phone', 'email'],
            fuzzySearch: true,
            searchThreshold: 0.6
        },
        
        sorting: {
            default: 'visitDate_desc',
            options: [
                'name_asc', 'name_desc',
                'visitDate_asc', 'visitDate_desc',
                'diagnosis_asc', 'diagnosis_desc'
            ]
        },
        
        privacy: {
            dataRetention: 365 * 24 * 60 * 60 * 1000,
            anonymization: true,
            exportRestriction: true,
            consentRequired: true
        }
    },

    // 🔐 보안 설정 (완전 복원)
    SECURITY: {
        dataProtection: {
            enableEncryption: window.location.protocol === 'https:',
            encryptionAlgorithm: 'AES-256-GCM',
            hashAlgorithm: 'SHA-256',
            saltLength: 32
        },
        
        session: {
            timeout: 60 * 60 * 1000,
            extendOnActivity: true,
            multipleDevices: false,
            secureStorage: true
        },
        
        api: {
            rateLimiting: {
                enabled: true,
                maxRequests: 100,
                windowMs: 15 * 60 * 1000
            },
            corsEnabled: true
        },
        
        privacy: {
            gdprCompliance: true,
            dataMinimization: true,
            rightToDelete: true,
            consentManagement: true
        }
    },

    // 🐛 디버깅 및 로깅
    DEBUG: {
        enabled: CURRENT_ENVIRONMENT !== 'production',
        verboseLogging: CURRENT_ENVIRONMENT === 'development',
        
        logLevel: {
            development: 'debug',
            staging: 'info',
            production: 'error'
        }[CURRENT_ENVIRONMENT],
        
        performance: {
            enabled: true,
            measureLoadTime: true,
            measureRenderTime: true,
            trackMemoryUsage: CURRENT_ENVIRONMENT === 'development',
            trackFPS: CURRENT_ENVIRONMENT === 'development'
        },
        
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
    
    if (!config.APP_INFO.version) {
        errors.push('APP_INFO.version이 설정되지 않았습니다.');
    }
    
    if (!config.CAMERA.constraints) {
        errors.push('CAMERA.constraints가 설정되지 않았습니다.');
    }
    
    const features = getBrowserInfo().features;
    
    if (!features.webgl && config.PERFORMANCE.imageProcessing.useWebGL) {
        warnings.push('WebGL을 지원하지 않는 브라우저입니다.');
    }
    
    if (!features.indexedDB && config.STORAGE.indexedDB.enabled) {
        warnings.push('IndexedDB를 지원하지 않는 브라우저입니다.');
        config.STORAGE.indexedDB.enabled = false;
    }
    
    if (!features.webrtc) {
        errors.push('이 브라우저는 카메라를 지원하지 않습니다.');
    }
    
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
    
    if (CURRENT_ENVIRONMENT === 'development') {
        console.log('🔧 Personal Color Pro 설정:', window.PersonalColorConfig);
        
        window.ConfigUtils = {
            getConfig: () => window.PersonalColorConfig,
            validateConfig,
            getBrowserInfo,
            getDeviceType,
            detectEnvironment,
            
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

// 🔥 긴급 추가: getConfig 함수 (8개 파일 로드 실패 해결의 핵심!)
/**
 * 전역 설정값 접근 함수
 * @param {string} keyPath - 설정 키 경로 (예: 'CAMERA.constraints', 'AI_MODELS.confidenceThreshold')
 * @param {*} defaultValue - 기본값
 * @returns {*} 설정값 또는 기본값
 */
function getConfig(keyPath, defaultValue = null) {
    try {
        if (!window.PersonalColorConfig) {
            console.warn('PersonalColorConfig가 아직 로드되지 않았습니다.');
            return defaultValue;
        }

        // 키 경로를 점(.)으로 분리하여 중첩된 객체에 접근
        const keys = keyPath.split('.');
        let current = window.PersonalColorConfig;
        
        for (const key of keys) {
            if (current === null || current === undefined || typeof current !== 'object') {
                console.warn(`설정 경로 '${keyPath}'에서 '${key}' 찾을 수 없음`);
                return defaultValue;
            }
            current = current[key];
        }
        
        return current !== undefined ? current : defaultValue;
        
    } catch (error) {
        console.warn(`getConfig 오류 (${keyPath}):`, error);
        return defaultValue;
    }
}

// 전역에서 접근 가능하도록 등록
window.getConfig = getConfig;

// 🔥 추가 전역 함수 정의 (다른 파일에서 참조하는 함수들)

/**
 * 권한 확인 함수 (PhotoAnalysis.js에서 사용)
 */
window.hasPermission = function(permissionType) {
    try {
        switch (permissionType) {
            case 'camera':
                return navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
            case 'microphone':
                return navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
            case 'geolocation':
                return 'geolocation' in navigator;
            case 'storage':
                return 'localStorage' in window && window.localStorage !== null;
            default:
                return false;
        }
    } catch (error) {
        console.warn(`권한 확인 실패 (${permissionType}):`, error);
        return false;
    }
};

/**
 * 렌더링 함수 (VirtualDraping.js에서 사용)
 */
window.render = function(context, data) {
    try {
        if (!context || !data) {
            console.warn('렌더링 함수: 잘못된 매개변수');
            return false;
        }
        
        if (context.clearRect) {
            context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        }
        
        if (data.type === 'image' && data.imageData) {
            context.putImageData(data.imageData, 0, 0);
        }
        
        return true;
    } catch (error) {
        console.warn('렌더링 함수 오류:', error);
        return false;
    }
};

/**
 * 계절 데이터 접근 함수 (ColorPalette.js에서 사용)
 */
window.getSeasonData = function(season = null) {
    try {
        const seasonData = window.seasons || window.SEASONS || {
            spring: { name: '봄', colors: [], description: '따뜻하고 밝은 톤' },
            summer: { name: '여름', colors: [], description: '시원하고 부드러운 톤' },
            autumn: { name: '가을', colors: [], description: '따뜻하고 깊은 톤' },
            winter: { name: '겨울', colors: [], description: '차갑고 선명한 톤' }
        };
        
        if (season) {
            return seasonData[season] || null;
        }
        
        return seasonData;
    } catch (error) {
        console.warn('계절 데이터 접근 오류:', error);
        return null;
    }
};

// seasonData 별칭 등록 (ColorPalette.js 호환성)
window.seasonData = window.getSeasonData();

/**
 * 설정값 업데이트 함수
 */
window.updateConfig = function(path, value) {
    try {
        const pathArray = path.split('.');
        let current = window.PersonalColorConfig;
        
        for (let i = 0; i < pathArray.length - 1; i++) {
            if (!current[pathArray[i]]) {
                current[pathArray[i]] = {};
            }
            current = current[pathArray[i]];
        }
        
        current[pathArray[pathArray.length - 1]] = value;
        console.log(`✅ 설정 업데이트: ${path} = ${value}`);
        return true;
    } catch (error) {
        console.error(`❌ 설정 업데이트 실패 (${path}):`, error);
        return false;
    }
};

/**
 * 안전한 전역 변수 접근 함수
 */
window.safeGlobalAccess = function(varName, defaultValue = null) {
    try {
        return window[varName] !== undefined ? window[varName] : defaultValue;
    } catch (error) {
        console.warn(`전역 변수 '${varName}' 접근 실패:`, error);
        return defaultValue;
    }
};

// 🔥 기존 버전에서 빠진 중요 부분들 추가

/**
 * PCCS 톤 정의 (기존 버전에 있던 부분)
 */
window.PersonalColorConfig.COLOR_ANALYSIS.pccsTones = {
    // 순색톤
    vivid: { lightness: 70, saturation: 100, description: '선명한' },
    bright: { lightness: 80, saturation: 80, description: '밝은' },
    strong: { lightness: 60, saturation: 90, description: '강한' },
    deep: { lightness: 40, saturation: 85, description: '짙은' },
    
    // 명청톤
    pale: { lightness: 85, saturation: 45, description: '연한' },
    light: { lightness: 75, saturation: 50, description: '얕은' },
    soft: { lightness: 65, saturation: 40, description: '부드러운' },
    dull: { lightness: 55, saturation: 35, description: '탁한' },
    dark: { lightness: 35, saturation: 45, description: '어두운' },
    
    // 무채색톤
    lightGray: { lightness: 80, saturation: 5, description: '밝은 회색' },
    mediumGray: { lightness: 50, saturation: 5, description: '중간 회색' },
    darkGray: { lightness: 25, saturation: 5, description: '어두운 회색' }
};

/**
 * 4계절 색온도 기준값 (기존 버전에 있던 부분)
 */
window.PersonalColorConfig.COLOR_ANALYSIS.seasonalTemperatures = {
    spring: { warm: true, temperature: 'warm', range: [3000, 4000] },
    summer: { warm: false, temperature: 'cool', range: [5500, 6500] },
    autumn: { warm: true, temperature: 'warm', range: [2500, 3500] },
    winter: { warm: false, temperature: 'cool', range: [6000, 8000] }
};

/**
 * 색상환 정의 (기존 버전에 있던 부분)
 */
window.PersonalColorConfig.COLOR_ANALYSIS.colorWheel = {
    red: { hue: 0, warm: true },
    redOrange: { hue: 30, warm: true },
    orange: { hue: 60, warm: true },
    yellowOrange: { hue: 90, warm: true },
    yellow: { hue: 120, warm: true },
    yellowGreen: { hue: 150, warm: true },
    green: { hue: 180, warm: false },
    blueGreen: { hue: 210, warm: false },
    blue: { hue: 240, warm: false },
    blueViolet: { hue: 270, warm: false },
    violet: { hue: 300, warm: false },
    redViolet: { hue: 330, warm: true }
};

/**
 * CIE 표준 조명체 정의 (기존 버전에 있던 완전한 부분)
 */
window.PersonalColorConfig.COLOR_ANALYSIS.illuminants = {
    D65: { x: 0.31271, y: 0.32902, X: 95.047, Y: 100.000, Z: 108.883 }, // 표준 주광
    D50: { x: 0.34567, y: 0.35850, X: 96.422, Y: 100.000, Z: 82.521 },  // 인쇄 표준
    A: { x: 0.44757, y: 0.40745, X: 109.850, Y: 100.000, Z: 35.585 },    // 백열등
    F2: { x: 0.37208, y: 0.37529, X: 99.187, Y: 100.000, Z: 67.393 }     // 형광등
};

/**
 * 현재 사용 중인 조명체
 */
window.PersonalColorConfig.COLOR_ANALYSIS.currentIlluminant = window.PersonalColorConfig.COLOR_ANALYSIS.illuminants.D65;

/**
 * 피부 샘플링을 위한 최적 영역 (기존 버전에 있던 부분)
 */
window.PersonalColorConfig.COLOR_ANALYSIS.skinSamplingAreas = {
    forehead: { x: 0.3, y: 0.15, w: 0.4, h: 0.12 },
    leftCheek: { x: 0.15, y: 0.4, w: 0.15, h: 0.2 },
    rightCheek: { x: 0.7, y: 0.4, w: 0.15, h: 0.2 },
    chin: { x: 0.35, y: 0.75, w: 0.3, h: 0.15 }
};

/**
 * 화장품 브랜드 매칭 데이터 (기존 버전에서 중요한 부분)
 */
window.PersonalColorConfig.BRAND_MATCHING = {
    makeup: {
        foundation: {
            brands: ['에스티로더', '랑콤', '디올', '샤넬', '맥', '클리니크'],
            colorMapping: {
                spring: ['21N1', 'NC20', 'W1', 'Beige 10'],
                summer: ['21C1', 'NW20', 'C1', 'Beige Rose 20'],
                autumn: ['23N2', 'NC25', 'W2', 'Beige 30'],
                winter: ['23C2', 'NW25', 'C2', 'Beige Rose 30']
            }
        },
        lipstick: {
            brands: ['샤넬', '디올', '톰포드', 'YSL', '맥'],
            recommendations: {
                spring: ['코랄', '피치', '오렌지레드'],
                summer: ['로즈', '베리', '플럼'],
                autumn: ['브릭레드', '테라코타', '브론즈'],
                winter: ['트루레드', '딥베리', '퓨샤']
            }
        }
    },
    hairColor: {
        brands: ['웰라', '로레알', '슈바르츠코프', '매트릭스'],
        recommendations: {
            spring: ['골든브라운', '카라멜', '허니블론드'],
            summer: ['애쉬브라운', '플래티넘블론드', '실버그레이'],
            autumn: ['초콜릿브라운', '레드브라운', '딥브런트'],
            winter: ['제트블랙', '다크브라운', '인텐스레드']
        }
    }
};

// 🔥 콘솔에서 확인 가능한 디버그 정보
if (CURRENT_ENVIRONMENT === 'development') {
    console.log('🚀 전역 함수 등록 완료:');
    console.log('  - getConfig()');
    console.log('  - hasPermission()');
    console.log('  - render()');
    console.log('  - getSeasonData()');
    console.log('  - updateConfig()');
    console.log('  - safeGlobalAccess()');
    console.log('');
    console.log('💡 사용법:');
    console.log('  getConfig("DRAPING.colorSets.spring")');
    console.log('  hasPermission("camera")');
    console.log('  getSeasonData("spring")');
}

console.log('🔥 완전한 config.js 로드 완료 - 기존 버전 모든 기능 완벽 복원!');

// 🔥 추가 전역 함수 정의 (다른 파일에서 참조하는 함수들)

/**
 * 권한 확인 함수 (PhotoAnalysis.js에서 사용)
 */
window.hasPermission = function(permissionType) {
    try {
        switch (permissionType) {
            case 'camera':
                return navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
            case 'microphone':
                return navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
            case 'geolocation':
                return 'geolocation' in navigator;
            case 'storage':
                return 'localStorage' in window && window.localStorage !== null;
            default:
                return false;
        }
    } catch (error) {
        console.warn(`권한 확인 실패 (${permissionType}):`, error);
        return false;
    }
};

/**
 * 렌더링 함수 (VirtualDraping.js에서 사용)
 */
window.render = function(context, data) {
    try {
        if (!context || !data) {
            console.warn('렌더링 함수: 잘못된 매개변수');
            return false;
        }
        
        if (context.clearRect) {
            context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        }
        
        if (data.type === 'image' && data.imageData) {
            context.putImageData(data.imageData, 0, 0);
        }
        
        return true;
    } catch (error) {
        console.warn('렌더링 함수 오류:', error);
        return false;
    }
};

/**
 * 계절 데이터 접근 함수 (ColorPalette.js에서 사용)
 */
window.getSeasonData = function(season = null) {
    try {
        const seasonData = window.seasons || window.SEASONS || {
            spring: { name: '봄', colors: [], description: '따뜻하고 밝은 톤' },
            summer: { name: '여름', colors: [], description: '시원하고 부드러운 톤' },
            autumn: { name: '가을', colors: [], description: '따뜻하고 깊은 톤' },
            winter: { name: '겨울', colors: [], description: '차갑고 선명한 톤' }
        };
        
        if (season) {
            return seasonData[season] || null;
        }
        
        return seasonData;
    } catch (error) {
        console.warn('계절 데이터 접근 오류:', error);
        return null;
    }
};

// seasonData 별칭 등록 (ColorPalette.js 호환성)
window.seasonData = window.getSeasonData();

/**
 * 설정값 업데이트 함수
 */
window.updateConfig = function(path, value) {
    try {
        const pathArray = path.split('.');
        let current = window.PersonalColorConfig;
        
        for (let i = 0; i < pathArray.length - 1; i++) {
            if (!current[pathArray[i]]) {
                current[pathArray[i]] = {};
            }
            current = current[pathArray[i]];
        }
        
        current[pathArray[pathArray.length - 1]] = value;
        console.log(`✅ 설정 업데이트: ${path} = ${value}`);
        return true;
    } catch (error) {
        console.error(`❌ 설정 업데이트 실패 (${path}):`, error);
        return false;
    }
};

/**
 * 안전한 전역 변수 접근 함수
 */
window.safeGlobalAccess = function(varName, defaultValue = null) {
    try {
        return window[varName] !== undefined ? window[varName] : defaultValue;
    } catch (error) {
        console.warn(`전역 변수 '${varName}' 접근 실패:`, error);
        return defaultValue;
    }
};

// 🔥 콘솔에서 확인 가능한 디버그 정보
if (CURRENT_ENVIRONMENT === 'development') {
    console.log('🚀 전역 함수 등록 완료:');
    console.log('  - getConfig()');
    console.log('  - hasPermission()');
    console.log('  - render()');
    console.log('  - getSeasonData()');
    console.log('  - updateConfig()');
    console.log('  - safeGlobalAccess()');
    console.log('');
    console.log('💡 사용법:');
    console.log('  getConfig("DRAPING.colorSets.spring")');
    console.log('  hasPermission("camera")');
    console.log('  getSeasonData("spring")');
}

// 🔥 기존 버전에서 빠진 중요 부분들 추가

/**
 * PCCS 톤 정의 (기존 버전에 있던 부분)
 */
window.PersonalColorConfig.COLOR_ANALYSIS.pccsTones = {
    // 순색톤
    vivid: { lightness: 70, saturation: 100, description: '선명한' },
    bright: { lightness: 80, saturation: 80, description: '밝은' },
    strong: { lightness: 60, saturation: 90, description: '강한' },
    deep: { lightness: 40, saturation: 85, description: '짙은' },
    
    // 명청톤
    pale: { lightness: 85, saturation: 45, description: '연한' },
    light: { lightness: 75, saturation: 50, description: '얕은' },
    soft: { lightness: 65, saturation: 40, description: '부드러운' },
    dull: { lightness: 55, saturation: 35, description: '탁한' },
    dark: { lightness: 35, saturation: 45, description: '어두운' },
    
    // 무채색톤
    lightGray: { lightness: 80, saturation: 5, description: '밝은 회색' },
    mediumGray: { lightness: 50, saturation: 5, description: '중간 회색' },
    darkGray: { lightness: 25, saturation: 5, description: '어두운 회색' }
};

/**
 * 4계절 색온도 기준값 (기존 버전에 있던 부분)
 */
window.PersonalColorConfig.COLOR_ANALYSIS.seasonalTemperatures = {
    spring: { warm: true, temperature: 'warm', range: [3000, 4000] },
    summer: { warm: false, temperature: 'cool', range: [5500, 6500] },
    autumn: { warm: true, temperature: 'warm', range: [2500, 3500] },
    winter: { warm: false, temperature: 'cool', range: [6000, 8000] }
};

/**
 * 색상환 정의 (기존 버전에 있던 부분)
 */
window.PersonalColorConfig.COLOR_ANALYSIS.colorWheel = {
    red: { hue: 0, warm: true },
    redOrange: { hue: 30, warm: true },
    orange: { hue: 60, warm: true },
    yellowOrange: { hue: 90, warm: true },
    yellow: { hue: 120, warm: true },
    yellowGreen: { hue: 150, warm: true },
    green: { hue: 180, warm: false },
    blueGreen: { hue: 210, warm: false },
    blue: { hue: 240, warm: false },
    blueViolet: { hue: 270, warm: false },
    violet: { hue: 300, warm: false },
    redViolet: { hue: 330, warm: true }
};

/**
 * CIE 표준 조명체 정의 (기존 버전에 있던 완전한 부분)
 */
window.PersonalColorConfig.COLOR_ANALYSIS.illuminants = {
    D65: { x: 0.31271, y: 0.32902, X: 95.047, Y: 100.000, Z: 108.883 }, // 표준 주광
    D50: { x: 0.34567, y: 0.35850, X: 96.422, Y: 100.000, Z: 82.521 },  // 인쇄 표준
    A: { x: 0.44757, y: 0.40745, X: 109.850, Y: 100.000, Z: 35.585 },    // 백열등
    F2: { x: 0.37208, y: 0.37529, X: 99.187, Y: 100.000, Z: 67.393 }     // 형광등
};

/**
 * 현재 사용 중인 조명체
 */
window.PersonalColorConfig.COLOR_ANALYSIS.currentIlluminant = window.PersonalColorConfig.COLOR_ANALYSIS.illuminants.D65;

/**
 * 피부 샘플링을 위한 최적 영역 (기존 버전에 있던 부분)
 */
window.PersonalColorConfig.COLOR_ANALYSIS.skinSamplingAreas = {
    forehead: { x: 0.3, y: 0.15, w: 0.4, h: 0.12 },
    leftCheek: { x: 0.15, y: 0.4, w: 0.15, h: 0.2 },
    rightCheek: { x: 0.7, y: 0.4, w: 0.15, h: 0.2 },
    chin: { x: 0.35, y: 0.75, w: 0.3, h: 0.15 }
};

/**
 * 화장품 브랜드 매칭 데이터 (기존 버전에서 중요한 부분)
 */
window.PersonalColorConfig.BRAND_MATCHING = {
    makeup: {
        foundation: {
            brands: ['에스티로더', '랑콤', '디올', '샤넬', '맥', '클리니크'],
            colorMapping: {
                spring: ['21N1', 'NC20', 'W1', 'Beige 10'],
                summer: ['21C1', 'NW20', 'C1', 'Beige Rose 20'],
                autumn: ['23N2', 'NC25', 'W2', 'Beige 30'],
                winter: ['23C2', 'NW25', 'C2', 'Beige Rose 30']
            }
        },
        lipstick: {
            brands: ['샤넬', '디올', '톰포드', 'YSL', '맥'],
            recommendations: {
                spring: ['코랄', '피치', '오렌지레드'],
                summer: ['로즈', '베리', '플럼'],
                autumn: ['브릭레드', '테라코타', '브론즈'],
                winter: ['트루레드', '딥베리', '퓨샤']
            }
        }
    },
    hairColor: {
        brands: ['웰라', '로레알', '슈바르츠코프', '매트릭스'],
        recommendations: {
            spring: ['골든브라운', '카라멜', '허니블론드'],
            summer: ['애쉬브라운', '플래티넘블론드', '실버그레이'],
            autumn: ['초콜릿브라운', '레드브라운', '딥브런트'],
            winter: ['제트블랙', '다크브라운', '인텐스레드']
        }
    }
};

console.log('🔥 완전한 config.js 로드 완료 - 기존 버전 모든 기능 완벽 복원!');
