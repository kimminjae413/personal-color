/**
 * Personal Color Pro - 설정 및 상수
 * 애플리케이션 전반에서 사용되는 설정값들을 관리
 */

window.PersonalColorConfig = {
    // 애플리케이션 정보
    APP_INFO: {
        name: 'Personal Color Pro',
        version: '1.0.0',
        description: '헤어디자이너용 퍼스널컬러 진단 시스템',
        author: 'Personal Color Pro Team',
        buildDate: '2024-01-15'
    },

    // API 설정
    API: {
        baseUrl: process.env.API_BASE_URL || '/api/v1',
        timeout: 30000,
        retryAttempts: 3,
        endpoints: {
            analysis: '/analysis',
            customers: '/customers',
            reports: '/reports',
            models: '/models'
        }
    },

    // AI 모델 설정
    AI_MODELS: {
        skinToneAnalyzer: {
            modelUrl: './js/ai/models/personal-color-model.json',
            weightsUrl: './js/ai/models/skin-tone-weights.bin',
            inputSize: [224, 224, 3],
            confidenceThreshold: 0.85,
            maxBatchSize: 1
        },
        faceDetection: {
            modelType: 'mediapipe',
            maxNumFaces: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.5
        },
        colorClassifier: {
            algorithm: 'deltaE2000',
            colorSpace: 'CIELAB',
            toleranceThreshold: 3.0
        }
    },

    // 카메라 설정
    CAMERA: {
        preferredResolution: {
            width: 1280,
            height: 720
        },
        fallbackResolution: {
            width: 640,
            height: 480
        },
        frameRate: 30,
        facingMode: 'user', // 'user' 또는 'environment'
        autoFocus: true,
        whiteBalance: 'auto',
        exposureCompensation: 0
    },

    // 색상 분석 설정
    COLOR_ANALYSIS: {
        // 표준 조명 조건
        standardIlluminant: {
            type: 'D65',
            temperature: 6500, // Kelvin
            intensity: 300 // lux
        },
        
        // 피부 영역 감지 설정
        skinDetection: {
            faceRegion: {
                forehead: { x: 0.3, y: 0.2, w: 0.4, h: 0.15 },
                cheek: { x: 0.2, y: 0.4, w: 0.2, h: 0.2 },
                chin: { x: 0.35, y: 0.7, w: 0.3, h: 0.15 }
            },
            minSkinPixels: 1000,
            skinColorRange: {
                hue: { min: 0, max: 50 },
                saturation: { min: 20, max: 80 },
                lightness: { min: 30, max: 85 }
            }
        },
        
        // 색상 공간 변환
        colorSpaces: {
            input: 'sRGB',
            analysis: 'CIELAB',
            display: 'Display-P3'
        },
        
        // Delta E 계산 설정
        deltaE: {
            formula: 'CIE2000',
            thresholds: {
                identical: 1.0,
                similar: 3.0,
                different: 10.0
            },
            kL: 1.0, // 명도 가중치
            kC: 1.0, // 채도 가중치
            kH: 1.0  // 색상 가중치
        }
    },

    // 드레이핑 설정
    DRAPING: {
        // 가상 드레이프 크기
        drapeDimensions: {
            width: 200,
            height: 150,
            position: { x: 0.5, y: 0.8 } // 얼굴 기준 상대 위치
        },
        
        // 비교 모드
        comparisonModes: ['single', 'split', 'slider'],
        
        // 색상 팔레트
        colorPalettes: {
            spring: 217, // 색상 수
            summer: 217,
            autumn: 217,
            winter: 217
        },
        
        // AR 렌더링 설정
        arRendering: {
            blendMode: 'multiply',
            opacity: 0.7,
            smoothing: true,
            antiAliasing: true
        }
    },

    // 퍼스널컬러 시스템
    PERSONAL_COLOR_SYSTEM: {
        // 기본 4계절 시스템
        seasons: {
            spring: {
                name: '봄',
                nameEn: 'Spring',
                characteristics: {
                    temperature: 'warm',
                    clarity: 'clear',
                    depth: 'light'
                },
                colors: {
                    primary: ['#FF6B9D', '#FECA57', '#FF9F40', '#48CAE4'],
                    neutral: ['#F8F9FA', '#FFFBF0', '#FFF5F5']
                }
            },
            summer: {
                name: '여름',
                nameEn: 'Summer',
                characteristics: {
                    temperature: 'cool',
                    clarity: 'soft',
                    depth: 'light'
                },
                colors: {
                    primary: ['#A8E6CF', '#B8BCFF', '#F2B5D4', '#C7CEEA'],
                    neutral: ['#F8F9FA', '#F0F8FF', '#FFF0F5']
                }
            },
            autumn: {
                name: '가을',
                nameEn: 'Autumn',
                characteristics: {
                    temperature: 'warm',
                    clarity: 'soft',
                    depth: 'deep'
                },
                colors: {
                    primary: ['#CD853F', '#D2691E', '#A0522D', '#8B4513'],
                    neutral: ['#FFF8DC', '#F5DEB3', '#FAEBD7']
                }
            },
            winter: {
                name: '겨울',
                nameEn: 'Winter',
                characteristics: {
                    temperature: 'cool',
                    clarity: 'clear',
                    depth: 'deep'
                },
                colors: {
                    primary: ['#FF1744', '#3F51B5', '#9C27B0', '#000000'],
                    neutral: ['#FFFFFF', '#F5F5F5', '#E8EAF6']
                }
            }
        },
        
        // 한국인 특화 톤 분류
        koreanSkinTones: {
            warmYellow: { name: '웜 옐로우', lab: [65, 8, 15] },
            coolPink: { name: '쿨 핑크', lab: [68, 12, 5] },
            neutralBeige: { name: '뉴트럴 베이지', lab: [66, 6, 10] },
            warmOlive: { name: '웜 올리브', lab: [62, 5, 12] },
            coolOlive: { name: '쿨 올리브', lab: [64, 3, 8] }
        }
    },

    // 브랜드 데이터베이스
    BRAND_DATABASE: {
        // 헤어컬러 브랜드
        hairColor: {
            loreal: {
                name: 'L\'Oréal Professional',
                colorSystem: 'numeric',
                shades: [
                    { code: '6.66', name: 'Dark Blonde Deep Red' },
                    { code: '7.43', name: 'Blonde Copper Golden' },
                    { code: '8.31', name: 'Light Blonde Golden Ash' }
                ]
            },
            wella: {
                name: 'Wella Professionals',
                colorSystem: 'mixed',
                shades: [
                    { code: '8/5', name: 'Light Blonde Mahogany' },
                    { code: '7/3', name: 'Medium Blonde Gold' },
                    { code: '6/0', name: 'Dark Blonde Natural' }
                ]
            },
            milbon: {
                name: 'Milbon',
                colorSystem: 'hyphen',
                shades: [
                    { code: '8-50', name: 'Light Brown Red' },
                    { code: '7-43', name: 'Brown Copper Gold' },
                    { code: '6-31', name: 'Dark Brown Gold Ash' }
                ]
            }
        },
        
        // 메이크업 브랜드
        makeup: {
            foundations: [
                { brand: 'MAC', shade: 'NC25', lab: [65.2, 8.1, 14.7] },
                { brand: 'NARS', shade: 'Light 4 Deauville', lab: [68.1, 6.2, 12.3] },
                { brand: 'Estée Lauder', shade: '2W1 Dawn', lab: [66.8, 7.5, 13.2] }
            ],
            lipColors: [
                { brand: 'MAC', shade: 'Ruby Woo', hex: '#D31F3C' },
                { brand: 'Charlotte Tilbury', shade: 'Pillow Talk', hex: '#B8859B' },
                { brand: 'Tom Ford', shade: 'Cherry Lush', hex: '#8B2635' }
            ]
        }
    },

    // UI 설정
    UI: {
        // 태블릿 최적화
        tablet: {
            minWidth: 768,
            maxWidth: 1366,
            orientation: 'landscape',
            touchTargetSize: 44 // px
        },
        
        // 애니메이션 설정
        animations: {
            duration: {
                fast: 150,
                normal: 300,
                slow: 500
            },
            easing: {
                default: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
                enter: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
                exit: 'cubic-bezier(0.4, 0.0, 1, 1)'
            }
        },
        
        // 색상 팔레트
        colors: {
            primary: '#6366f1',
            secondary: '#e5e7eb',
            accent: '#f59e0b',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            background: {
                primary: '#ffffff',
                secondary: '#f9fafb',
                tertiary: '#f3f4f6'
            }
        }
    },

    // 보고서 설정
    REPORT: {
        // 템플릿 설정
        templates: {
            comprehensive: {
                name: '종합 진단 보고서',
                sections: ['customer_info', 'analysis_results', 'color_palette', 'makeup_recommendations', 'hair_recommendations', 'fashion_guide']
            },
            basic: {
                name: '기본 진단 보고서',
                sections: ['customer_info', 'analysis_results', 'color_palette']
            }
        },
        
        // PDF 생성 설정
        pdf: {
            format: 'A4',
            orientation: 'portrait',
            margins: {
                top: 20,
                right: 15,
                bottom: 20,
                left: 15
            },
            quality: 'high',
            compress: true
        },
        
        // 이미지 설정
        images: {
            colorSwatches: {
                size: 40, // px
                borderRadius: 4,
                spacing: 8
            },
            customerPhoto: {
                maxWidth: 200,
                maxHeight: 200,
                quality: 0.8
            }
        }
    },

    // 저장소 설정
    STORAGE: {
        // 로컬 스토리지 키
        keys: {
            customers: 'personalcolor_customers',
            settings: 'personalcolor_settings',
            session: 'personalcolor_session',
            progress: 'personalcolor_progress',
            cache: 'personalcolor_cache'
        },
        
        // 캐시 설정
        cache: {
            maxAge: 24 * 60 * 60 * 1000, // 24시간
            maxSize: 50 * 1024 * 1024,   // 50MB
            compression: true
        },
        
        // 백업 설정
        backup: {
            autoBackup: true,
            interval: 30 * 60 * 1000, // 30분
            maxBackups: 10
        }
    },

    // 성능 모니터링
    PERFORMANCE: {
        // FPS 모니터링
        fps: {
            target: 30,
            warning: 15,
            critical: 10
        },
        
        // 메모리 사용량 모니터링
        memory: {
            warning: 100 * 1024 * 1024,  // 100MB
            critical: 200 * 1024 * 1024  // 200MB
        },
        
        // 로딩 시간 모니터링
        loading: {
            target: 3000,  // 3초
            warning: 5000, // 5초
            critical: 10000 // 10초
        }
    },

    // 분석 및 로깅
    ANALYTICS: {
        enabled: true,
        events: [
            'app_start',
            'mode_switch',
            'customer_selected',
            'diagnosis_complete',
            'report_generated',
            'error_occurred'
        ],
        batchSize: 10,
        sendInterval: 30000 // 30초
    },

    // 디버그 설정
    DEBUG: {
        enabled: process.env.NODE_ENV === 'development',
        logLevel: 'info', // 'error', 'warn', 'info', 'debug'
        showFPS: false,
        showMemory: false,
        colorAnalysisVerbose: false,
        aiModelVerbose: false
    },

    // 접근성 설정
    ACCESSIBILITY: {
        // 키보드 내비게이션
        keyboard: {
            enabled: true,
            shortcuts: {
                'Ctrl+1': 'switch_photo_mode',
                'Ctrl+2': 'switch_draping_mode',
                'Ctrl+S': 'save_progress',
                'Ctrl+R': 'reset_diagnosis',
                'Ctrl+H': 'show_help',
                'Escape': 'close_modal'
            }
        },
        
        // 스크린 리더 지원
        screenReader: {
            announcements: true,
            liveRegions: true,
            ariaLabels: true
        },
        
        // 고대비 모드
        highContrast: {
            autoDetect: true,
            override: false
        }
    },

    // 다국어 설정
    LOCALIZATION: {
        defaultLanguage: 'ko',
        supportedLanguages: ['ko', 'en'],
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm:ss',
        numberFormat: {
            decimal: '.',
            thousands: ','
        }
    },

    // 보안 설정
    SECURITY: {
        // 데이터 암호화
        encryption: {
            algorithm: 'AES-256-GCM',
            keyDerivation: 'PBKDF2'
        },
        
        // 세션 관리
        session: {
            timeout: 4 * 60 * 60 * 1000, // 4시간
            renewThreshold: 30 * 60 * 1000 // 30분
        },
        
        // 입력 검증
        validation: {
            maxFileSize: 10 * 1024 * 1024, // 10MB
            allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
            maxImageDimensions: { width: 4000, height: 4000 }
        }
    }
};

// 환경별 설정 오버라이드
if (typeof process !== 'undefined' && process.env) {
    // 개발 환경
    if (process.env.NODE_ENV === 'development') {
        PersonalColorConfig.DEBUG.enabled = true;
        PersonalColorConfig.DEBUG.showFPS = true;
        PersonalColorConfig.ANALYTICS.enabled = false;
    }
    
    // 프로덕션 환경
    if (process.env.NODE_ENV === 'production') {
        PersonalColorConfig.DEBUG.enabled = false;
        PersonalColorConfig.DEBUG.logLevel = 'error';
        PersonalColorConfig.ANALYTICS.enabled = true;
    }
    
    // 테스트 환경
    if (process.env.NODE_ENV === 'test') {
        PersonalColorConfig.DEBUG.enabled = false;
        PersonalColorConfig.ANALYTICS.enabled = false;
        PersonalColorConfig.STORAGE.backup.autoBackup = false;
    }
}

// 설정 유효성 검사
PersonalColorConfig.validate = function() {
    const errors = [];
    
    // 필수 설정 확인
    if (!this.APP_INFO.name) {
        errors.push('APP_INFO.name is required');
    }
    
    if (!this.AI_MODELS.skinToneAnalyzer.modelUrl) {
        errors.push('AI_MODELS.skinToneAnalyzer.modelUrl is required');
    }
    
    if (!this.CAMERA.preferredResolution.width) {
        errors.push('CAMERA.preferredResolution.width is required');
    }
    
    // 값 범위 검사
    if (this.AI_MODELS.skinToneAnalyzer.confidenceThreshold < 0 || 
        this.AI_MODELS.skinToneAnalyzer.confidenceThreshold > 1) {
        errors.push('AI_MODELS.skinToneAnalyzer.confidenceThreshold must be between 0 and 1');
    }
    
    if (errors.length > 0) {
        console.error('❌ 설정 검증 실패:', errors);
        return false;
    }
    
    console.log('✅ 설정 검증 성공');
    return true;
};

// 설정 업데이트 함수
PersonalColorConfig.update = function(path, value) {
    const keys = path.split('.');
    let obj = this;
    
    for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
        if (!obj) {
            console.error('❌ 설정 경로를 찾을 수 없습니다:', path);
            return false;
        }
    }
    
    obj[keys[keys.length - 1]] = value;
    console.log(`⚙️ 설정 업데이트: ${path} = ${value}`);
    return true;
};

// 설정 조회 함수
PersonalColorConfig.get = function(path, defaultValue = null) {
    const keys = path.split('.');
    let obj = this;
    
    for (const key of keys) {
        obj = obj[key];
        if (obj === undefined) {
            return defaultValue;
        }
    }
    
    return obj;
};

// 초기 설정 검증 실행
PersonalColorConfig.validate();

// 전역 변수로 내보내기
window.Config = PersonalColorConfig;

// 개발자 도구용 설정 디버거
if (PersonalColorConfig.DEBUG.enabled) {
    window.debugConfig = {
        showAll: () => console.table(PersonalColorConfig),
        get: (path) => PersonalColorConfig.get(path),
        update: (path, value) => PersonalColorConfig.update(path, value),
        validate: () => PersonalColorConfig.validate()
    };
    
    console.log('🔧 설정 디버거: window.debugConfig 사용 가능');
}
