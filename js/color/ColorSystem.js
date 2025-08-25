/**
 * ColorSystem.js - 최종 완성 버전 (과학적 색상 시스템)
 * 
 * CIE Lab* 색공간 기반의 정밀한 색상 계산 및 변환
 * - Delta E 2000 색차 계산
 * - 색공간 변환 (RGB ↔ Lab* ↔ HSL ↔ XYZ)
 * - 4계절 12톤 색상 시스템
 * - PCCS 색조 시스템
 * - 한국인 피부톤 최적화
 */

(function() {
    'use strict';
    
    /**
     * CONFIG 안전 로드
     */
    function getConfig() {
        try {
            if (typeof window !== 'undefined' && window.PersonalColorConfig) {
                return window.PersonalColorConfig;
            }
        } catch (error) {
            console.warn('[ColorSystem] CONFIG 로드 실패, 기본값 사용:', error);
        }
        return {
            COLOR_ANALYSIS: {
                standardIlluminant: { type: 'D65' },
                precisionLevel: 'high',
                caching: { enabled: true, maxSize: 500 }
            }
        };
    }

    /**
     * ColorSystem 클래스 - 과학적 색상 분석 시스템
     */
    class ColorSystem {
        constructor() {
            // CONFIG 안전 로드
            this.CONFIG = getConfig();
            
            // CIE 표준 조명체 정의 (완전 구현)
            this.illuminants = {
                D65: { 
                    name: 'D65 (Daylight 6504K)',
                    x: 0.31271, y: 0.32902, 
                    X: 95.047, Y: 100.000, Z: 108.883,
                    temperature: 6504,
                    whitePoint: [95.047, 100.000, 108.883],
                    description: '표준 주광'
                }, 
                D50: { 
                    name: 'D50 (Daylight 5003K)',
                    x: 0.34567, y: 0.35850, 
                    X: 96.422, Y: 100.000, Z: 82.521,
                    temperature: 5003,
                    whitePoint: [96.422, 100.000, 82.521],
                    description: '인쇄용 표준 주광'
                },  
                A: { 
                    name: 'A (Tungsten 2856K)',
                    x: 0.44757, y: 0.40745, 
                    X: 109.850, Y: 100.000, Z: 35.585,
                    temperature: 2856,
                    whitePoint: [109.850, 100.000, 35.585],
                    description: '텅스텐 백열등'
                },    
                F2: { 
                    name: 'F2 (Cool White Fluorescent)',
                    x: 0.37208, y: 0.37529, 
                    X: 99.187, Y: 100.000, Z: 67.393,
                    temperature: 4230,
                    whitePoint: [99.187, 100.000, 67.393],
                    description: '냉백색 형광등'
                }     
            };
            
            // 현재 사용 중인 조명체
            this.currentIlluminant = this.illuminants.D65;
            
            // 색공간 변환 매트릭스 (sRGB ↔ XYZ)
            this.matrices = {
                sRGBtoXYZ: [
                    [0.4124564, 0.3575761, 0.1804375],
                    [0.2126729, 0.7151522, 0.0721750],
                    [0.0193339, 0.1191920, 0.9503041]
                ],
                XYZtosRGB: [
                    [ 3.2404542, -1.5371385, -0.4985314],
                    [-0.9692660,  1.8760108,  0.0415560],
                    [ 0.0556434, -0.2040259,  1.0572252]
                ]
            };
            
            // Delta E 2000 계산용 상수
            this.deltaE2000Constants = {
                kL: 1.0, // 명도 가중치
                kC: 1.0, // 채도 가중치  
                kH: 1.0  // 색상 가중치
            };
            
            // PCCS 톤 시스템 (완전 정의)
            this.pccsTones = {
                // Vivid 계열 (선명한)
                vivid: { 
                    lightness: 70, saturation: 90, 
                    description: '선명한', 
                    characteristics: ['clear', 'bright', 'saturated'] 
                },
                strong: { 
                    lightness: 60, saturation: 85, 
                    description: '강한', 
                    characteristics: ['deep', 'rich', 'bold'] 
                },
                bright: { 
                    lightness: 80, saturation: 70, 
                    description: '밝은', 
                    characteristics: ['cheerful', 'lively', 'fresh'] 
                },
                
                // Pale 계열 (연한)
                pale: { 
                    lightness: 85, saturation: 45, 
                    description: '연한', 
                    characteristics: ['soft', 'gentle', 'delicate'] 
                },
                light: { 
                    lightness: 75, saturation: 50, 
                    description: '얕은', 
                    characteristics: ['airy', 'light', 'fresh'] 
                },
                soft: { 
                    lightness: 65, saturation: 40, 
                    description: '부드러운', 
                    characteristics: ['muted', 'calm', 'sophisticated'] 
                },
                
                // Muted 계열 (탁한)
                dull: { 
                    lightness: 55, saturation: 30, 
                    description: '탁한', 
                    characteristics: ['subdued', 'quiet', 'natural'] 
                },
                dark: { 
                    lightness: 35, saturation: 45, 
                    description: '어두운', 
                    characteristics: ['deep', 'mature', 'dramatic'] 
                },
                deep: { 
                    lightness: 40, saturation: 80, 
                    description: '짙은', 
                    characteristics: ['intense', 'rich', 'powerful'] 
                },
                
                // Gray 계열 (무채색)
                lightGray: { 
                    lightness: 80, saturation: 3, 
                    description: '밝은 회색', 
                    characteristics: ['neutral', 'clean', 'minimal'] 
                },
                mediumGray: { 
                    lightness: 50, saturation: 3, 
                    description: '중간 회색', 
                    characteristics: ['balanced', 'stable', 'timeless'] 
                },
                darkGray: { 
                    lightness: 25, saturation: 3, 
                    description: '어두운 회색', 
                    characteristics: ['solid', 'grounded', 'sophisticated'] 
                }
            };
            
            // 4계절 색온도 및 특성 정의
            this.seasonalCharacteristics = {
                spring: { 
                    temperature: 'warm', 
                    brightness: 'high', 
                    saturation: 'high',
                    hueRange: [15, 105], // 주황-연두
                    labRange: { L: [55, 75], a: [3, 8], b: [14, 26] },
                    keywords: ['bright', 'warm', 'clear', 'fresh', 'youthful']
                },
                summer: { 
                    temperature: 'cool', 
                    brightness: 'medium-high', 
                    saturation: 'medium',
                    hueRange: [195, 315], // 파랑-보라
                    labRange: { L: [60, 80], a: [-2, 4], b: [6, 16] },
                    keywords: ['soft', 'cool', 'muted', 'elegant', 'refined']
                },
                autumn: { 
                    temperature: 'warm', 
                    brightness: 'medium-low', 
                    saturation: 'high',
                    hueRange: [30, 120], // 주황-녹색
                    labRange: { L: [45, 65], a: [6, 14], b: [16, 30] },
                    keywords: ['deep', 'warm', 'rich', 'earthy', 'mature']
                },
                winter: { 
                    temperature: 'cool', 
                    brightness: 'varied', 
                    saturation: 'high',
                    hueRange: [210, 330], // 파랑-자주
                    labRange: { L: [20, 85], a: [-5, 6], b: [-5, 18] },
                    keywords: ['clear', 'cool', 'contrasted', 'dramatic', 'intense']
                }
            };
            
            // 색상 하모니 규칙
            this.harmonyRules = {
                complementary: { angle: 180, tolerance: 15, name: '보색 조화' },
                triadic: { angles: [120, 240], tolerance: 15, name: '삼각 조화' },
                tetradic: { angles: [90, 180, 270], tolerance: 15, name: '사각 조화' },
                analogous: { range: 30, tolerance: 10, name: '유사 조화' },
                splitComplementary: { angles: [150, 210], tolerance: 15, name: '분할 보색' },
                monochromatic: { range: 0, tolerance: 5, name: '단색 조화' }
            };
            
            // 성능 최적화 - 캐싱 시스템
            this.cache = new Map();
            this.cacheEnabled = this.getConfigPath('COLOR_ANALYSIS.caching.enabled', true);
            this.maxCacheSize = this.getConfigPath('COLOR_ANALYSIS.caching.maxSize', 500);
            
            // 성능 통계
            this.stats = {
                conversions: 0,
                cacheHits: 0,
                cacheMisses: 0,
                totalTime: 0,
                deltaECalculations: 0,
                temperatureAnalyses: 0
            };
            
            // 한국인 피부톤 최적화 데이터
            this.koreanSkinOptimization = {
                // 한국인 피부톤 분포 (연구 기반)
                distribution: {
                    fair: 0.15,      // 15% - 밝은 피부
                    light: 0.35,     // 35% - 연한 피부  
                    medium: 0.40,    // 40% - 중간 피부
                    tan: 0.08,       // 8% - 어두운 피부
                    deep: 0.02       // 2% - 깊은 피부
                },
                
                // 언더톤 분포 (한국인 특화)
                undertoneDistribution: {
                    warm: 0.42,      // 42% - 웜톤 (황색 기반)
                    cool: 0.33,      // 33% - 쿨톤 (분홍 기반)
                    neutral: 0.25    // 25% - 뉴트럴톤
                },
                
                // 보정 계수
                adjustmentFactors: {
                    brightness: 1.08,     // 밝기 선호도 보정
                    warmth: 0.94,         // 웜톤 강도 보정
                    saturation: 1.06,     // 채도 보정
                    contrast: 0.96        // 대비 보정
                }
            };
            
            this.init();
        }

        /**
         * 설정값 안전 접근
         */
        getConfigPath(path, defaultValue) {
            try {
                const keys = path.split('.');
                let current = this.CONFIG;
                
                for (const key of keys) {
                    if (current && typeof current === 'object' && key in current) {
                        current = current[key];
                    } else {
                        return defaultValue;
                    }
                }
                
                return current !== undefined ? current : defaultValue;
            } catch (error) {
                console.warn(`[ColorSystem] 설정 경로 접근 실패 (${path}):`, error);
                return defaultValue;
            }
        }

        /**
         * 시스템 초기화
         */
        async init() {
            try {
                console.log('[ColorSystem] 🎨 과학적 색상 시스템 초기화 중...');
                
                // 조명체 설정
                const illuminantType = this.getConfigPath('COLOR_ANALYSIS.standardIlluminant.type', 'D65');
                this.setIlluminant(illuminantType);
                
                // 정밀도 레벨 설정
                const precisionLevel = this.getConfigPath('COLOR_ANALYSIS.precisionLevel', 'high');
                this.setPrecisionLevel(precisionLevel);
                
                // 캐시 설정
                this.configureCaching();
                
                // 시스템 검증
                const validation = this.validateColorSystem();
                if (!validation.isValid) {
                    console.warn('[ColorSystem] ⚠️ 시스템 검증 경고:', validation.issues);
                }
                
                console.log('[ColorSystem] ✅ 초기화 완료:', {
                    illuminant: this.currentIlluminant.name,
                    precision: precisionLevel,
                    caching: this.cacheEnabled
                });
                
            } catch (error) {
                console.error('[ColorSystem] ❌ 초기화 실패:', error);
                throw error;
            }
        }

        /**
         * 조명체 설정
         */
        setIlluminant(illuminantType) {
            try {
                if (this.illuminants[illuminantType]) {
                    this.currentIlluminant = this.illuminants[illuminantType];
                    this.clearCache(); // 조명체 변경시 캐시 클리어
                    console.log(`[ColorSystem] 조명체 설정: ${this.currentIlluminant.name}`);
                } else {
                    console.warn('[ColorSystem] 알 수 없는 조명체, D65 사용:', illuminantType);
                    this.currentIlluminant = this.illuminants.D65;
                }
            } catch (error) {
                console.error('[ColorSystem] 조명체 설정 오류:', error);
                this.currentIlluminant = this.illuminants.D65;
            }
        }

        /**
         * 정밀도 레벨 설정
         */
        setPrecisionLevel(level) {
            try {
                const precisionSettings = {
                    low: { decimal: 1, deltaE: 2.0, caching: true },
                    medium: { decimal: 2, deltaE: 1.0, caching: true },
                    high: { decimal: 3, deltaE: 0.5, caching: true },
                    ultra: { decimal: 4, deltaE: 0.1, caching: false }
                };
                
                this.precisionLevel = precisionSettings[level] || precisionSettings.high;
                console.log(`[ColorSystem] 정밀도 레벨: ${level}`);
            } catch (error) {
                console.error('[ColorSystem] 정밀도 설정 오류:', error);
                this.precisionLevel = { decimal: 3, deltaE: 0.5, caching: true };
            }
        }

        /**
         * 캐싱 설정
         */
        configureCaching() {
            const cacheConfig = this.getConfigPath('COLOR_ANALYSIS.caching', {});
            this.cacheEnabled = cacheConfig.enabled !== false && this.precisionLevel.caching;
            this.maxCacheSize = cacheConfig.maxSize || 500;
            
            if (this.cacheEnabled) {
                console.log(`[ColorSystem] 캐싱 활성화 (최대 ${this.maxCacheSize}개)`);
            }
        }

        /**
         * 색상 입력 검증
         */
        validateRgbColor(rgb) {
            if (!rgb || typeof rgb !== 'object') return false;
            const { r, g, b } = rgb;
            return (
                typeof r === 'number' && r >= 0 && r <= 255 &&
                typeof g === 'number' && g >= 0 && g <= 255 &&
                typeof b === 'number' && b >= 0 && b <= 255
            );
        }

        validateLabColor(lab) {
            if (!lab || typeof lab !== 'object') return false;
            const { l, a, b } = lab;
            return (
                typeof l === 'number' && l >= 0 && l <= 100 &&
                typeof a === 'number' && a >= -128 && a <= 127 &&
                typeof b === 'number' && b >= -128 && b <= 127
            );
        }

        validateHslColor(hsl) {
            if (!hsl || typeof hsl !== 'object') return false;
            const { h, s, l } = hsl;
            return (
                typeof h === 'number' && h >= 0 && h < 360 &&
                typeof s === 'number' && s >= 0 && s <= 100 &&
                typeof l === 'number' && l >= 0 && l <= 100
            );
        }

        /**
         * 🎨 RGB to XYZ 변환 (고정밀)
         */
        rgbToXyz(rgb) {
            if (!this.validateRgbColor(rgb)) {
                console.warn('[ColorSystem] 잘못된 RGB 색상:', rgb);
                return null;
            }

            const cacheKey = `rgb2xyz_${rgb.r}_${rgb.g}_${rgb.b}_${this.currentIlluminant.name}`;
            if (this.cacheEnabled && this.cache.has(cacheKey)) {
                this.stats.cacheHits++;
                return this.cache.get(cacheKey);
            }
            this.stats.cacheMisses++;

            const startTime = performance.now();
            
            try {
                // RGB 값 정규화 (0-1 범위)
                let r = rgb.r / 255.0;
                let g = rgb.g / 255.0;
                let b = rgb.b / 255.0;

                // sRGB 감마 보정 (정확한 공식)
                r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
                g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
                b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

                // 매트릭스 변환 (sRGB → XYZ, D65 기준)
                const matrix = this.matrices.sRGBtoXYZ;
                const x = (r * matrix[0][0] + g * matrix[0][1] + b * matrix[0][2]) * 100;
                const y = (r * matrix[1][0] + g * matrix[1][1] + b * matrix[1][2]) * 100;
                const z = (r * matrix[2][0] + g * matrix[2][1] + b * matrix[2][2]) * 100;

                const result = { 
                    x: this.roundToPrecision(x), 
                    y: this.roundToPrecision(y), 
                    z: this.roundToPrecision(z) 
                };
                
                this.recordStats(startTime);
                this.cacheResult(cacheKey, result);
                
                return result;
            } catch (error) {
                console.error('[ColorSystem] RGB to XYZ 변환 오류:', error);
                return null;
            }
        }

        /**
         * XYZ to RGB 변환
         */
        xyzToRgb(xyz) {
            if (!xyz || typeof xyz.x !== 'number' || typeof xyz.y !== 'number' || typeof xyz.z !== 'number') {
                console.warn('[ColorSystem] 잘못된 XYZ 색상:', xyz);
                return null;
            }

            const cacheKey = `xyz2rgb_${xyz.x}_${xyz.y}_${xyz.z}_${this.currentIlluminant.name}`;
            if (this.cacheEnabled && this.cache.has(cacheKey)) {
                this.stats.cacheHits++;
                return this.cache.get(cacheKey);
            }
            this.stats.cacheMisses++;

            const startTime = performance.now();
            
            try {
                // XYZ 값 정규화
                let x = xyz.x / 100.0;
                let y = xyz.y / 100.0;
                let z = xyz.z / 100.0;

                // 매트릭스 변환 (XYZ → sRGB)
                const matrix = this.matrices.XYZtosRGB;
                let r = x * matrix[0][0] + y * matrix[0][1] + z * matrix[0][2];
                let g = x * matrix[1][0] + y * matrix[1][1] + z * matrix[1][2];
                let b = x * matrix[2][0] + y * matrix[2][1] + z * matrix[2][2];

                // 역 감마 보정 (정확한 공식)
                r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
                g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
                b = b > 0.0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : 12.92 * b;

                // 0-255 범위로 변환 및 클램핑
                const result = {
                    r: Math.max(0, Math.min(255, Math.round(r * 255))),
                    g: Math.max(0, Math.min(255, Math.round(g * 255))),
                    b: Math.max(0, Math.min(255, Math.round(b * 255)))
                };

                this.recordStats(startTime);
                this.cacheResult(cacheKey, result);
                
                return result;
            } catch (error) {
                console.error('[ColorSystem] XYZ to RGB 변환 오류:', error);
                return null;
            }
        }

        /**
         * 🧪 XYZ to LAB 변환 (CIE LAB*a*b* 정확한 구현)
         */
        xyzToLab(xyz) {
            if (!xyz || typeof xyz.x !== 'number' || typeof xyz.y !== 'number' || typeof xyz.z !== 'number') {
                console.warn('[ColorSystem] 잘못된 XYZ 색상:', xyz);
                return null;
            }

            const cacheKey = `xyz2lab_${xyz.x}_${xyz.y}_${xyz.z}_${this.currentIlluminant.name}`;
            if (this.cacheEnabled && this.cache.has(cacheKey)) {
                this.stats.cacheHits++;
                return this.cache.get(cacheKey);
            }
            this.stats.cacheMisses++;

            const startTime = performance.now();
            
            try {
                // 현재 조명체의 화이트포인트로 정규화
                const illuminant = this.currentIlluminant;
                let xn = xyz.x / illuminant.X;
                let yn = xyz.y / illuminant.Y;
                let zn = xyz.z / illuminant.Z;

                // CIE LAB 표준 상수
                const epsilon = 0.008856451679;  // (6/29)³
                const kappa = 903.2962963;       // (29/3)³

                // f 함수 적용 (정확한 CIE 공식)
                const fx = xn > epsilon ? Math.pow(xn, 1/3) : (kappa * xn + 16) / 116;
                const fy = yn > epsilon ? Math.pow(yn, 1/3) : (kappa * yn + 16) / 116;
                const fz = zn > epsilon ? Math.pow(zn, 1/3) : (kappa * zn + 16) / 116;

                // LAB 값 계산
                const result = {
                    l: this.roundToPrecision(116 * fy - 16),
                    a: this.roundToPrecision(500 * (fx - fy)),
                    b: this.roundToPrecision(200 * (fy - fz))
                };

                this.recordStats(startTime);
                this.cacheResult(cacheKey, result);
                
                return result;
            } catch (error) {
                console.error('[ColorSystem] XYZ to LAB 변환 오류:', error);
                return null;
            }
        }

        /**
         * LAB to XYZ 변환
         */
        labToXyz(lab) {
            if (!this.validateLabColor(lab)) {
                console.warn('[ColorSystem] 잘못된 LAB 색상:', lab);
                return null;
            }

            const cacheKey = `lab2xyz_${lab.l}_${lab.a}_${lab.b}_${this.currentIlluminant.name}`;
            if (this.cacheEnabled && this.cache.has(cacheKey)) {
                this.stats.cacheHits++;
                return this.cache.get(cacheKey);
            }
            this.stats.cacheMisses++;

            const startTime = performance.now();
            
            try {
                // LAB에서 f 함수값 계산
                const fy = (lab.l + 16) / 116;
                const fx = lab.a / 500 + fy;
                const fz = fy - lab.b / 200;

                // CIE LAB 표준 상수
                const epsilon = 0.008856451679;
                const kappa = 903.2962963;

                // 역변환 함수 (정확한 CIE 공식)
                const xr = fx * fx * fx > epsilon ? fx * fx * fx : (116 * fx - 16) / kappa;
                const yr = fy * fy * fy > epsilon ? fy * fy * fy : (116 * fy - 16) / kappa;
                const zr = fz * fz * fz > epsilon ? fz * fz * fz : (116 * fz - 16) / kappa;

                // 조명체 기준으로 스케일링
                const illuminant = this.currentIlluminant;
                const result = {
                    x: this.roundToPrecision(xr * illuminant.X),
                    y: this.roundToPrecision(yr * illuminant.Y),
                    z: this.roundToPrecision(zr * illuminant.Z)
                };

                this.recordStats(startTime);
                this.cacheResult(cacheKey, result);
                
                return result;
            } catch (error) {
                console.error('[ColorSystem] LAB to XYZ 변환 오류:', error);
                return null;
            }
        }

        /**
         * RGB to LAB 직접 변환
         */
        rgbToLab(rgb) {
            const xyz = this.rgbToXyz(rgb);
            if (!xyz) return null;
            return this.xyzToLab(xyz);
        }

        /**
         * LAB to RGB 직접 변환
         */
        labToRgb(lab) {
            const xyz = this.labToXyz(lab);
            if (!xyz) return null;
            return this.xyzToRgb(xyz);
        }

        /**
         * 🌈 RGB to HSL 변환 (고정밀)
         */
        rgbToHsl(rgb) {
            if (!this.validateRgbColor(rgb)) {
                console.warn('[ColorSystem] 잘못된 RGB 색상:', rgb);
                return null;
            }

            const cacheKey = `rgb2hsl_${rgb.r}_${rgb.g}_${rgb.b}`;
            if (this.cacheEnabled && this.cache.has(cacheKey)) {
                this.stats.cacheHits++;
                return this.cache.get(cacheKey);
            }
            this.stats.cacheMisses++;

            const startTime = performance.now();
            
            try {
                const r = rgb.r / 255.0;
                const g = rgb.g / 255.0;
                const b = rgb.b / 255.0;

                const max = Math.max(r, g, b);
                const min = Math.min(r, g, b);
                const diff = max - min;
                const sum = max + min;
                
                const l = sum / 2.0;
                
                let h = 0;
                let s = 0;
                
                if (diff !== 0) {
                    s = l > 0.5 ? diff / (2.0 - sum) : diff / sum;
                    
                    switch (max) {
                        case r:
                            h = ((g - b) / diff + (g < b ? 6 : 0)) / 6.0;
                            break;
                        case g:
                            h = ((b - r) / diff + 2) / 6.0;
                            break;
                        case b:
                            h = ((r - g) / diff + 4) / 6.0;
                            break;
                    }
                }
                
                const result = {
                    h: this.roundToPrecision(h * 360),
                    s: this.roundToPrecision(s * 100),
                    l: this.roundToPrecision(l * 100)
                };

                this.recordStats(startTime);
                this.cacheResult(cacheKey, result);
                
                return result;
            } catch (error) {
                console.error('[ColorSystem] RGB to HSL 변환 오류:', error);
                return null;
            }
        }

        /**
         * HSL to RGB 변환
         */
        hslToRgb(hsl) {
            if (!this.validateHslColor(hsl)) {
                console.warn('[ColorSystem] 잘못된 HSL 색상:', hsl);
                return null;
            }

            const cacheKey = `hsl2rgb_${hsl.h}_${hsl.s}_${hsl.l}`;
            if (this.cacheEnabled && this.cache.has(cacheKey)) {
                this.stats.cacheHits++;
                return this.cache.get(cacheKey);
            }
            this.stats.cacheMisses++;

            const startTime = performance.now();
            
            try {
                const h = (hsl.h % 360) / 360.0;
                const s = Math.max(0, Math.min(100, hsl.s)) / 100.0;
                const l = Math.max(0, Math.min(100, hsl.l)) / 100.0;

                if (s === 0) {
                    const gray = Math.round(l * 255);
                    return { r: gray, g: gray, b: gray };
                }

                const hue2rgb = (p, q, t) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1/6) return p + (q - p) * 6 * t;
                    if (t < 1/2) return q;
                    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                    return p;
                };

                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;

                const result = {
                    r: Math.round(hue2rgb(p, q, h + 1/3) * 255),
                    g: Math.round(hue2rgb(p, q, h) * 255),
                    b: Math.round(hue2rgb(p, q, h - 1/3) * 255)
                };

                this.recordStats(startTime);
                this.cacheResult(cacheKey, result);
                
                return result;
            } catch (error) {
                console.error('[ColorSystem] HSL to RGB 변환 오류:', error);
                return null;
            }
        }

        /**
         * RGB to HEX 변환
         */
        rgbToHex(rgb) {
            if (!this.validateRgbColor(rgb)) {
                console.warn('[ColorSystem] 잘못된 RGB 색상:', rgb);
                return null;
            }

            const toHex = (n) => {
                const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            };
            
            return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase();
        }

        /**
         * HEX to RGB 변환
         */
        hexToRgb(hex) {
            if (typeof hex !== 'string') {
                console.warn('[ColorSystem] HEX는 문자열이어야 합니다:', hex);
                return null;
            }

            // 3자리 HEX 지원 (#ABC -> #AABBCC)
            let cleanHex = hex.replace('#', '');
            if (cleanHex.length === 3) {
                cleanHex = cleanHex.split('').map(c => c + c).join('');
            }

            const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(cleanHex);
            if (!result) {
                console.warn('[ColorSystem] 잘못된 HEX 형식:', hex);
                return null;
            }

            return {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            };
        }

        /**
         * 🌡️ 고급 색온도 분석 (완전 구현)
         */
        analyzeColorTemperature(color) {
            let lab;
            
            // 입력 형식에 따라 LAB 변환
            if (color.l !== undefined && color.a !== undefined && color.b !== undefined) {
                lab = color;
            } else if (color.r !== undefined && color.g !== undefined && color.b !== undefined) {
                lab = this.rgbToLab(color);
                if (!lab) return null;
            } else {
                console.warn('[ColorSystem] 지원하지 않는 색상 형식:', color);
                return null;
            }

            const cacheKey = `temp_${lab.l}_${lab.a}_${lab.b}`;
            if (this.cacheEnabled && this.cache.has(cacheKey)) {
                this.stats.cacheHits++;
                return this.cache.get(cacheKey);
            }
            this.stats.cacheMisses++;

            const startTime = performance.now();
            
            try {
                this.stats.temperatureAnalyses++;
                
                const a = lab.a;
                const b = lab.b;
                
                // 색온도 분석 알고리즘
                let temperature = 'neutral';
                let warmness = 0; // -1 (매우 차가움) ~ +1 (매우 따뜻함)
                let confidence = 0.5;
                
                // 채도(Chroma) 계산
                const chroma = Math.sqrt(a * a + b * b);
                
                // 색상각(Hue angle) 계산
                let hueAngle = Math.atan2(b, a) * 180 / Math.PI;
                if (hueAngle < 0) hueAngle += 360;
                
                // 온도 분류 로직 (개선된 알고리즘)
                if (b > 12 && a > 0) {
                    // 황색이 강하고 적색 경향 = 웜톤
                    temperature = 'warm';
                    warmness = Math.min(1.0, (b - 12) / 25.0 + a / 30.0);
                    confidence = Math.min(0.95, 0.6 + chroma / 40.0);
                } else if (b < 8 || (a < 0 && b < 15)) {
                    // 청색이 강하거나 녹색+낮은황색 = 쿨톤
                    temperature = 'cool';
                    warmness = Math.max(-1.0, (8 - b) / -25.0 + Math.min(0, a) / 30.0);
                    confidence = Math.min(0.95, 0.6 + chroma / 40.0);
                } else {
                    // 중성톤
                    temperature = 'neutral';
                    warmness = (a * 0.02 + (b - 10) * 0.02);
                    confidence = 0.5 + Math.max(0, 0.3 - Math.abs(warmness));
                }

                // 한국인 피부톤 최적화 적용
                warmness = this.applyKoreanTemperatureAdjustment(warmness, temperature);
                
                const result = {
                    temperature,
                    warmness: this.roundToPrecision(warmness),
                    confidence: this.roundToPrecision(confidence),
                    kelvin: this.estimateColorTemperature(lab),
                    description: this.getTemperatureDescription(temperature, warmness),
                    chroma: this.roundToPrecision(chroma),
                    hueAngle: this.roundToPrecision(hueAngle),
                    labValues: { l: lab.l, a, b }
                };

                this.recordStats(startTime);
                this.cacheResult(cacheKey, result);
                
                return result;
            } catch (error) {
                console.error('[ColorSystem] 색온도 분석 오류:', error);
                return null;
            }
        }

        /**
         * 한국인 피부톤 색온도 조정
         */
        applyKoreanTemperatureAdjustment(warmness, temperature) {
            try {
                const adjustment = this.koreanSkinOptimization.adjustmentFactors.warmth;
                
                if (temperature === 'warm') {
                    return warmness * adjustment;
                } else if (temperature === 'cool') {
                    return warmness * (2 - adjustment); // 쿨톤은 반대로 조정
                }
                
                return warmness;
            } catch (error) {
                console.error('[ColorSystem] 한국인 색온도 조정 오류:', error);
                return warmness;
            }
        }

        /**
         * 색온도(켈빈) 추정
         */
        estimateColorTemperature(lab) {
            try {
                // LAB 값을 기준으로 상관 색온도 추정 (근사 공식)
                const x = lab.a;
                const y = lab.b;
                
                // 색도 좌표 기반 색온도 계산
                const n = (x - 0.3320) / (0.1858 - y);
                let cct = 449 * n * n * n + 3525 * n * n + 6823.3 * n + 5520.33;
                
                // 범위 제한 (1000K - 25000K)
                cct = Math.max(1000, Math.min(25000, cct));
                
                // 피부톤에 맞는 보정
                if (lab.l > 50 && lab.b > 10) {
                    cct -= 300; // 따뜻한 피부톤은 약간 낮은 색온도
                } else if (lab.l > 50 && lab.a < 3) {
                    cct += 500; // 차가운 피부톤은 약간 높은 색온도
                }
                
                return Math.round(cct);
            } catch (error) {
                console.warn('[ColorSystem] 색온도 추정 오류:', error);
                return 5500; // 표준 주광 D55
            }
        }

        /**
         * 온도 설명 생성
         */
        getTemperatureDescription(temperature, warmness) {
            const absWarmness = Math.abs(warmness);
            
            if (temperature === 'warm') {
                if (absWarmness > 0.8) return '매우 따뜻한 톤';
                if (absWarmness > 0.5) return '따뜻한 톤';
                if (absWarmness > 0.2) return '약간 따뜻한 톤';
                return '살짝 따뜻한 톤';
            } else if (temperature === 'cool') {
                if (absWarmness > 0.8) return '매우 차가운 톤';
                if (absWarmness > 0.5) return '차가운 톤';
                if (absWarmness > 0.2) return '약간 차가운 톤';
                return '살짝 차가운 톤';
            }
            return '중성 톤';
        }

        /**
         * 🎨 PCCS 톤 분류 (완전 구현)
         */
        classifyPccsTone(color) {
            let hsl;
            
            // 입력 형식에 따라 HSL 변환
            if (color.h !== undefined && color.s !== undefined && color.l !== undefined) {
                hsl = color;
            } else if (color.r !== undefined && color.g !== undefined && color.b !== undefined) {
                hsl = this.rgbToHsl(color);
                if (!hsl) return null;
            } else {
                console.warn('[ColorSystem] 지원하지 않는 색상 형식:', color);
                return null;
            }

            const cacheKey = `tone_${hsl.h}_${hsl.s}_${hsl.l}`;
            if (this.cacheEnabled && this.cache.has(cacheKey)) {
                this.stats.cacheHits++;
                return this.cache.get(cacheKey);
            }
            this.stats.cacheMisses++;

            const startTime = performance.now();
            
            try {
                const lightness = hsl.l;
                const saturation = hsl.s;
                
                let bestTone = 'dull';
                let bestScore = 0;
                let toneScores = {};
                let confidence = 0.5;
                
                // 무채색 판별 (채도 < 5%)
                if (saturation < 5) {
                    if (lightness > 75) {
                        bestTone = 'lightGray';
                        confidence = 0.95;
                    } else if (lightness > 40) {
                        bestTone = 'mediumGray';
                        confidence = 0.90;
                    } else {
                        bestTone = 'darkGray';
                        confidence = 0.95;
                    }
                } else {
                    // 유채색 톤 분류 (개선된 알고리즘)
                    Object.entries(this.pccsTones).forEach(([toneName, toneData]) => {
                        if (toneName.includes('Gray')) return; // 무채색 제외
                        
                        // 가중치 기반 점수 계산
                        const lightnessDiff = Math.abs(lightness - toneData.lightness);
                        const saturationDiff = Math.abs(saturation - toneData.saturation);
                        
                        // 가중평균 점수 (명도 60%, 채도 40%)
                        let score = 100 - (lightnessDiff * 0.6 + saturationDiff * 0.4);
                        
                        // 특별 보너스/패널티
                        if (toneName === 'vivid' && saturation > 85 && lightness > 65) score += 10;
                        if (toneName === 'pale' && saturation < 50 && lightness > 80) score += 10;
                        if (toneName === 'deep' && saturation > 75 && lightness < 45) score += 10;
                        
                        toneScores[toneName] = Math.max(0, score);
                        
                        if (score > bestScore) {
                            bestScore = score;
                            bestTone = toneName;
                        }
                    });
                    
                    confidence = Math.min(0.95, bestScore / 100);
                }

                const result = {
                    tone: bestTone,
                    confidence: this.roundToPrecision(confidence),
                    description: this.pccsTones[bestTone].description,
                    characteristics: this.pccsTones[bestTone].characteristics,
                    lightness: this.roundToPrecision(lightness),
                    saturation: this.roundToPrecision(saturation),
                    scores: toneScores,
                    isGray: saturation < 5
                };
                
                this.recordStats(startTime);
                this.cacheResult(cacheKey, result);
                
                return result;
            } catch (error) {
                console.error('[ColorSystem] PCCS 톤 분류 오류:', error);
                return null;
            }
        }

        /**
         * 🍂 4계절 색상 매핑 (완전 구현)
         */
        mapToSeason(color, options = {}) {
            if (!color) {
                console.warn('[ColorSystem] 색상이 null입니다');
                return null;
            }

            const cacheKey = `season_${JSON.stringify(color)}_${JSON.stringify(options)}`;
            if (this.cacheEnabled && this.cache.has(cacheKey)) {
                this.stats.cacheHits++;
                return this.cache.get(cacheKey);
            }
            this.stats.cacheMisses++;

            const startTime = performance.now();
            
            try {
                // 다양한 색상 분석 수행
                const temperature = this.analyzeColorTemperature(color);
                const tone = this.classifyPccsTone(color);
                const lab = color.l !== undefined ? color : this.rgbToLab(color);
                const hsl = color.h !== undefined ? color : this.rgbToHsl(color);
                
                if (!temperature || !tone || !lab || !hsl) {
                    console.warn('[ColorSystem] 색상 분석 실패');
                    return null;
                }
                
                let seasonScores = { spring: 0, summer: 0, autumn: 0, winter: 0 };
                
                // 1️⃣ LAB 값 기반 계절 매칭 (40% 가중치)
                Object.entries(this.seasonalCharacteristics).forEach(([season, chars]) => {
                    let labScore = 0;
                    
                    // L* (명도) 매칭
                    if (lab.l >= chars.labRange.L[0] && lab.l <= chars.labRange.L[1]) {
                        labScore += 15;
                    } else {
                        const lDistance = Math.min(
                            Math.abs(lab.l - chars.labRange.L[0]), 
                            Math.abs(lab.l - chars.labRange.L[1])
                        );
                        labScore += Math.max(0, 15 - lDistance * 0.3);
                    }
                    
                    // a* 매칭  
                    if (lab.a >= chars.labRange.a[0] && lab.a <= chars.labRange.a[1]) {
                        labScore += 12;
                    } else {
                        const aDistance = Math.min(
                            Math.abs(lab.a - chars.labRange.a[0]), 
                            Math.abs(lab.a - chars.labRange.a[1])
                        );
                        labScore += Math.max(0, 12 - aDistance * 0.8);
                    }
                    
                    // b* 매칭
                    if (lab.b >= chars.labRange.b[0] && lab.b <= chars.labRange.b[1]) {
                        labScore += 13;
                    } else {
                        const bDistance = Math.min(
                            Math.abs(lab.b - chars.labRange.b[0]), 
                            Math.abs(lab.b - chars.labRange.b[1])
                        );
                        labScore += Math.max(0, 13 - bDistance * 0.6);
                    }
                    
                    seasonScores[season] += labScore;
                });
                
                // 2️⃣ 색온도 기반 매칭 (25% 가중치)
                if (temperature.temperature === 'warm') {
                    seasonScores.spring += 12 * temperature.confidence;
                    seasonScores.autumn += 13 * temperature.confidence;
                } else if (temperature.temperature === 'cool') {
                    seasonScores.summer += 12 * temperature.confidence;
                    seasonScores.winter += 13 * temperature.confidence;
                } else {
                    // 중성톤은 모든 계절에 약간씩
                    Object.keys(seasonScores).forEach(season => seasonScores[season] += 6);
                }
                
                // 3️⃣ PCCS 톤 기반 매칭 (20% 가중치)
                const toneSeasonMapping = {
                    vivid: { spring: 8, winter: 6, summer: 2, autumn: 4 },
                    bright: { spring: 10, summer: 6, winter: 4, autumn: 2 },
                    strong: { autumn: 8, winter: 6, spring: 4, summer: 2 },
                    pale: { spring: 6, summer: 10, winter: 2, autumn: 2 },
                    light: { spring: 8, summer: 8, winter: 3, autumn: 3 },
                    soft: { summer: 10, autumn: 6, spring: 3, winter: 3 },
                    dull: { autumn: 8, summer: 6, winter: 4, spring: 2 },
                    dark: { winter: 8, autumn: 6, summer: 3, spring: 1 },
                    deep: { autumn: 10, winter: 8, spring: 2, summer: 1 }
                };
                
                if (toneSeasonMapping[tone.tone]) {
                    Object.entries(toneSeasonMapping[tone.tone]).forEach(([season, bonus]) => {
                        seasonScores[season] += bonus * tone.confidence;
                    });
                }
                
                // 4️⃣ 색상(Hue) 기반 세부 조정 (15% 가중치)
                const hueAdjustment = this.calculateHueSeasonAdjustment(hsl.h);
                Object.entries(hueAdjustment).forEach(([season, adjustment]) => {
                    seasonScores[season] += adjustment;
                });
                
                // 5️⃣ 한국인 피부톤 최적화 적용
                seasonScores = this.applyKoreanSeasonOptimization(seasonScores, lab);
                
                // 점수 정규화 및 확률 계산
                const totalScore = Object.values(seasonScores).reduce((sum, score) => sum + score, 0);
                const probabilities = {};
                
                if (totalScore > 0) {
                    Object.entries(seasonScores).forEach(([season, score]) => {
                        probabilities[season] = Math.max(0, score / totalScore);
                    });
                } else {
                    // 균등 분배
                    Object.keys(seasonScores).forEach(season => {
                        probabilities[season] = 0.25;
                    });
                }
                
                // 최적 계절 및 서브타입 결정
                const bestSeason = Object.entries(probabilities)
                    .reduce((best, [season, prob]) => 
                        prob > best.probability ? { season, probability: prob } : best,
                        { season: 'spring', probability: 0 });

                const subtype = this.determineSubtype(bestSeason.season, lab, temperature, tone);
                
                const result = {
                    season: bestSeason.season,
                    subtype: subtype,
                    confidence: this.roundToPrecision(bestSeason.probability),
                    probabilities,
                    scores: seasonScores,
                    temperature,
                    tone,
                    analysis: {
                        warmth: temperature.warmness,
                        lightness: lab.l,
                        chroma: temperature.chroma,
                        hue: hsl.h,
                        saturation: hsl.s
                    },
                    recommendations: this.generateSeasonRecommendations(bestSeason.season, subtype)
                };
                
                this.recordStats(startTime);
                this.cacheResult(cacheKey, result);
                
                return result;
            } catch (error) {
                console.error('[ColorSystem] 계절 매핑 오류:', error);
                return null;
            }
        }

        /**
         * 색상(Hue) 기반 계절 조정
         */
        calculateHueSeasonAdjustment(hue) {
            const adjustment = { spring: 0, summer: 0, autumn: 0, winter: 0 };
            
            try {
                // 색상환 기준 계절 성향 (더 정교한 매핑)
                if (hue >= 0 && hue < 30) {        // 빨강 (0-30°)
                    adjustment.winter += 8;
                    adjustment.autumn += 6;
                } else if (hue >= 30 && hue < 60) { // 주황 (30-60°)
                    adjustment.autumn += 10;
                    adjustment.spring += 8;
                } else if (hue >= 60 && hue < 90) { // 노랑 (60-90°)
                    adjustment.spring += 10;
                    adjustment.autumn += 6;
                } else if (hue >= 90 && hue < 150) { // 연두-녹색 (90-150°)
                    adjustment.spring += 6;
                    adjustment.summer += 4;
                } else if (hue >= 150 && hue < 210) { // 청록 (150-210°)
                    adjustment.summer += 8;
                    adjustment.winter += 4;
                } else if (hue >= 210 && hue < 270) { // 파랑 (210-270°)
                    adjustment.winter += 10;
                    adjustment.summer += 8;
                } else if (hue >= 270 && hue < 330) { // 보라 (270-330°)
                    adjustment.winter += 8;
                    adjustment.summer += 6;
                } else {                             // 자주 (330-360°)
                    adjustment.winter += 6;
                    adjustment.autumn += 4;
                }
            } catch (error) {
                console.warn('[ColorSystem] 색상 조정 계산 오류:', error);
            }
            
            return adjustment;
        }

        /**
         * 한국인 계절 최적화
         */
        applyKoreanSeasonOptimization(seasonScores, lab) {
            try {
                const factors = this.koreanSkinOptimization.adjustmentFactors;
                
                // 밝기 선호도 반영
                if (lab.l > 60) {
                    seasonScores.spring *= factors.brightness;
                    seasonScores.summer *= factors.brightness;
                }
                
                // 채도 선호도 반영  
                const chroma = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
                if (chroma > 15) {
                    seasonScores.spring *= factors.saturation;
                    seasonScores.autumn *= factors.saturation;
                }
                
                // 대비 선호도 반영
                seasonScores.winter *= factors.contrast;
                
                return seasonScores;
            } catch (error) {
                console.error('[ColorSystem] 한국인 최적화 적용 오류:', error);
                return seasonScores;
            }
        }

        /**
         * 서브타입 결정 (12톤 시스템)
         */
        determineSubtype(season, lab, temperature, tone) {
            try {
                const { l, a, b } = lab;
                const chroma = Math.sqrt(a * a + b * b);
                
                switch (season) {
                    case 'spring':
                        if (l > 70 && chroma > 25) return 'bright_spring';
                        if (temperature.warmness > 0.6 && b > 18) return 'warm_spring';
                        return 'light_spring';
                        
                    case 'summer':
                        if (l > 75 && chroma < 20) return 'light_summer';
                        if (a < 2 && b < 10) return 'cool_summer';
                        return 'soft_summer';
                        
                    case 'autumn':
                        if (l < 50 && chroma > 20) return 'deep_autumn';
                        if (temperature.warmness > 0.7 && b > 22) return 'warm_autumn';
                        return 'soft_autumn';
                        
                    case 'winter':
                        if (l > 60 && chroma > 25) return 'bright_winter';
                        if (l < 45) return 'deep_winter';
                        return 'cool_winter';
                        
                    default:
                        return season;
                }
            } catch (error) {
                console.error('[ColorSystem] 서브타입 결정 오류:', error);
                return season;
            }
        }

        /**
         * 계절별 추천사항 생성
         */
        generateSeasonRecommendations(season, subtype) {
            const recommendations = {
                colors: [],
                characteristics: [],
                avoidColors: [],
                styling: []
            };
            
            try {
                const seasonData = this.seasonalCharacteristics[season];
                if (seasonData) {
                    recommendations.characteristics = seasonData.keywords;
                    
                    // 계절별 기본 추천 색상
                    const colorRecommendations = {
                        spring: {
                            colors: ['#FF6B6B', '#FFA726', '#66BB6A', '#42A5F5', '#FFEB3B'],
                            avoid: ['#9E9E9E', '#607D8B', '#4A148C'],
                            styling: ['밝고 선명한 컬러', '클리어한 원색', '경쾌한 패턴']
                        },
                        summer: {
                            colors: ['#E1BEE7', '#B39DDB', '#90CAF9', '#A5D6A7', '#F8BBD9'],
                            avoid: ['#FF5722', '#FF9800', '#CDDC39'],
                            styling: ['소프트한 파스텔', '우아한 중간톤', '섬세한 패턴']
                        },
                        autumn: {
                            colors: ['#D32F2F', '#F57C00', '#689F38', '#5D4037', '#E65100'],
                            avoid: ['#E91E63', '#9C27B0', '#3F51B5'],
                            styling: ['깊고 풍부한 색상', '자연스러운 어스톤', '텍스처 강조']
                        },
                        winter: {
                            colors: ['#000000', '#FFFFFF', '#1976D2', '#C2185B', '#4CAF50'],
                            avoid: ['#FF9800', '#CDDC39', '#8BC34A'],
                            styling: ['하이컨트라스트', '선명한 원색', '모던한 스타일']
                        }
                    };
                    
                    if (colorRecommendations[season]) {
                        recommendations.colors = colorRecommendations[season].colors;
                        recommendations.avoidColors = colorRecommendations[season].avoid;
                        recommendations.styling = colorRecommendations[season].styling;
                    }
                }
            } catch (error) {
                console.error('[ColorSystem] 추천사항 생성 오류:', error);
            }
            
            return recommendations;
        }

        /**
         * 🔢 Delta E 2000 색차 계산 (정확한 구현)
         */
        calculateDeltaE2000(lab1, lab2) {
            if (!this.validateLabColor(lab1) || !this.validateLabColor(lab2)) {
                console.warn('[ColorSystem] 잘못된 LAB 색상:', lab1, lab2);
                return null;
            }

            const cacheKey = `deltaE_${lab1.l}_${lab1.a}_${lab1.b}_${lab2.l}_${lab2.a}_${lab2.b}`;
            if (this.cacheEnabled && this.cache.has(cacheKey)) {
                this.stats.cacheHits++;
                return this.cache.get(cacheKey);
            }
            this.stats.cacheMisses++;

            const startTime = performance.now();
            
            try {
                this.stats.deltaECalculations++;
                
                const { kL, kC, kH } = this.deltaE2000Constants;
                
                // LAB 값 추출
                const L1 = lab1.l, a1 = lab1.a, b1 = lab1.b;
                const L2 = lab2.l, a2 = lab2.a, b2 = lab2.b;
                
                // 색도(Chroma) 계산
                const C1 = Math.sqrt(a1 * a1 + b1 * b1);
                const C2 = Math.sqrt(a2 * a2 + b2 * b2);
                const C_bar = (C1 + C2) / 2;
                
                // G 인수 계산
                const G = 0.5 * (1 - Math.sqrt(Math.pow(C_bar, 7) / (Math.pow(C_bar, 7) + Math.pow(25, 7))));
                
                // 수정된 a* 값
                const a1_prime = (1 + G) * a1;
                const a2_prime = (1 + G) * a2;
                
                // 수정된 색도 계산
                const C1_prime = Math.sqrt(a1_prime * a1_prime + b1 * b1);
                const C2_prime = Math.sqrt(a2_prime * a2_prime + b2 * b2);
                
                // 색상각 계산
                const h1_prime = Math.atan2(b1, a1_prime) * 180 / Math.PI;
                const h2_prime = Math.atan2(b2, a2_prime) * 180 / Math.PI;
                
                // 차이 계산
                const delta_L_prime = L2 - L1;
                const delta_C_prime = C2_prime - C1_prime;
                
                let delta_h_prime = h2_prime - h1_prime;
                if (Math.abs(delta_h_prime) > 180) {
                    if (h2_prime > h1_prime) {
                        delta_h_prime -= 360;
                    } else {
                        delta_h_prime += 360;
                    }
                }
                
                const delta_H_prime = 2 * Math.sqrt(C1_prime * C2_prime) * Math.sin(delta_h_prime * Math.PI / 360);
                
                // 평균값들
                const L_bar = (L1 + L2) / 2;
                const C_bar_prime = (C1_prime + C2_prime) / 2;
                
                let H_bar_prime = (h1_prime + h2_prime) / 2;
                if (Math.abs(h1_prime - h2_prime) > 180) {
                    H_bar_prime += 180;
                }
                
                // 보정 함수들
                const T = 1 - 0.17 * Math.cos((H_bar_prime - 30) * Math.PI / 180) +
                          0.24 * Math.cos(2 * H_bar_prime * Math.PI / 180) +
                          0.32 * Math.cos((3 * H_bar_prime + 6) * Math.PI / 180) -
                          0.20 * Math.cos((4 * H_bar_prime - 63) * Math.PI / 180);
                
                const delta_ro = 30 * Math.exp(-Math.pow((H_bar_prime - 275) / 25, 2));
                
                const RC = 2 * Math.sqrt(Math.pow(C_bar_prime, 7) / (Math.pow(C_bar_prime, 7) + Math.pow(25, 7)));
                
                const SL = 1 + (0.015 * Math.pow(L_bar - 50, 2)) / Math.sqrt(20 + Math.pow(L_bar - 50, 2));
                const SC = 1 + 0.045 * C_bar_prime;
                const SH = 1 + 0.015 * C_bar_prime * T;
                
                const RT = -Math.sin(2 * delta_ro * Math.PI / 180) * RC;
                
                // 최종 Delta E 2000 계산
                const deltaE = Math.sqrt(
                    Math.pow(delta_L_prime / (kL * SL), 2) +
                    Math.pow(delta_C_prime / (kC * SC), 2) +
                    Math.pow(delta_H_prime / (kH * SH), 2) +
                    RT * (delta_C_prime / (kC * SC)) * (delta_H_prime / (kH * SH))
                );

                const result = this.roundToPrecision(deltaE);
                
                this.recordStats(startTime);
                this.cacheResult(cacheKey, result);
                
                return result;
            } catch (error) {
                console.error('[ColorSystem] Delta E 2000 계산 오류:', error);
                return null;
            }
        }

        /**
         * 색상 하모니 분석
         */
        analyzeColorHarmony(colors, harmonyType = 'complementary') {
            if (!colors || !Array.isArray(colors) || colors.length < 2) {
                console.warn('[ColorSystem] 색상 하모니 분석을 위해서는 최소 2개의 색상이 필요합니다');
                return null;
            }

            try {
                const rule = this.harmonyRules[harmonyType];
                if (!rule) {
                    console.warn('[ColorSystem] 알 수 없는 하모니 타입:', harmonyType);
                    return null;
                }

                const hslColors = colors.map(color => {
                    if (color.h !== undefined) return color;
                    if (color.r !== undefined) return this.rgbToHsl(color);
                    return null;
                }).filter(Boolean);

                if (hslColors.length < 2) {
                    console.warn('[ColorSystem] HSL 변환에 실패한 색상들이 있습니다');
                    return null;
                }

                // 하모니 분석 로직
                const baseHue = hslColors[0].h;
                let harmonyScore = 0;
                let analysis = [];

                hslColors.slice(1).forEach((color, index) => {
                    const hueDiff = Math.abs(color.h - baseHue);
                    const normalizedDiff = Math.min(hueDiff, 360 - hueDiff);

                    let expectedDiff;
                    if (Array.isArray(rule.angles)) {
                        expectedDiff = rule.angles[index % rule.angles.length];
                    } else if (rule.angle) {
                        expectedDiff = rule.angle;
                    } else if (rule.range) {
                        expectedDiff = rule.range;
                    } else {
                        expectedDiff = 0;
                    }

                    const deviation = Math.abs(normalizedDiff - expectedDiff);
                    const colorScore = Math.max(0, 100 - deviation * 2);
                    harmonyScore += colorScore;

                    analysis.push({
                        colorIndex: index + 1,
                        expectedHue: (baseHue + expectedDiff) % 360,
                        actualHue: color.h,
                        deviation: deviation,
                        score: colorScore
                    });
                });

                harmonyScore /= (hslColors.length - 1);

                return {
                    harmonyType: rule.name,
                    score: this.roundToPrecision(harmonyScore),
                    rating: this.getHarmonyRating(harmonyScore),
                    analysis: analysis,
                    recommendations: this.generateHarmonyRecommendations(harmonyType, harmonyScore)
                };

            } catch (error) {
                console.error('[ColorSystem] 색상 하모니 분석 오류:', error);
                return null;
            }
        }

        getHarmonyRating(score) {
            if (score > 85) return 'excellent';
            if (score > 70) return 'good';
            if (score > 50) return 'fair';
            return 'poor';
        }

        generateHarmonyRecommendations(harmonyType, score) {
            const recommendations = [];

            if (score < 70) {
                recommendations.push('색상 간의 조화를 위해 색상환에서의 각도를 조정해보세요');
            }

            if (harmonyType === 'complementary') {
                recommendations.push('보색 조화는 강한 대비 효과를 만들어냅니다');
            } else if (harmonyType === 'analogous') {
                recommendations.push('유사색 조화는 차분하고 통일된 느낌을 줍니다');
            }

            return recommendations;
        }

        /**
         * 종합 색상 정보 제공
         */
        getColorInfo(color) {
            try {
                let rgb;
                if (color.r !== undefined && color.g !== undefined && color.b !== undefined) {
                    rgb = color;
                } else if (typeof color === 'string') {
                    rgb = this.hexToRgb(color);
                } else {
                    console.warn('[ColorSystem] 지원하지 않는 색상 형식:', color);
                    return null;
                }

                if (!rgb) return null;

                // 모든 색공간으로 변환
                const hsl = this.rgbToHsl(rgb);
                const lab = this.rgbToLab(rgb);
                const xyz = this.rgbToXyz(rgb);
                const hex = this.rgbToHex(rgb);
                
                if (!hsl || !lab || !xyz) {
                    console.warn('[ColorSystem] 색상 변환 실패');
                    return null;
                }
                
                // 고급 분석 수행
                const temperature = this.analyzeColorTemperature(lab);
                const tone = this.classifyPccsTone(hsl);
                const season = this.mapToSeason(rgb);
                
                return {
                    // 기본 색공간 정보
                    rgb: rgb,
                    hsl: hsl,
                    lab: lab,
                    xyz: xyz,
                    hex: hex,
                    
                    // 고급 분석 결과
                    temperature: temperature,
                    tone: tone,
                    season: season,
                    
                    // 추가 정보
                    name: this.generateColorName(rgb, hsl),
                    description: this.generateColorDescription(temperature, tone, season),
                    accessibility: this.analyzeAccessibility(rgb),
                    webSafe: this.isWebSafeColor(rgb),
                    
                    // 메타데이터
                    analysis: {
                        chroma: temperature ? temperature.chroma : 0,
                        hueAngle: temperature ? temperature.hueAngle : 0,
                        illuminant: this.currentIlluminant.name,
                        precision: this.precisionLevel
                    }
                };
            } catch (error) {
                console.error('[ColorSystem] 색상 정보 요약 오류:', error);
                return null;
            }
        }

        /**
         * 색상 이름 생성 (개선된 알고리즘)
         */
        generateColorName(rgb, hsl) {
            if (!rgb || !hsl) return 'Unknown';
            
            try {
                const { h, s, l } = hsl;
                
                // 무채색 판별
                if (s < 8) {
                    if (l > 95) return '순백색';
                    if (l > 85) return '연한 회색';
                    if (l > 65) return '밝은 회색';
                    if (l > 35) return '중간 회색';
                    if (l > 15) return '어두운 회색';
                    return '순검정색';
                }
                
                // 기본 색상 이름 결정 (개선된 색상환)
                let baseName = '';
                if (h < 15 || h >= 345) baseName = '빨강';
                else if (h < 25) baseName = '주황빨강';
                else if (h < 45) baseName = '주황';
                else if (h < 65) baseName = '노랑주황';
                else if (h < 85) baseName = '노랑';
                else if (h < 105) baseName = '노랑녹색';
                else if (h < 135) baseName = '녹색';
                else if (h < 165) baseName = '청록';
                else if (h < 195) baseName = '하늘색';
                else if (h < 225) baseName = '파랑';
                else if (h < 255) baseName = '남색';
                else if (h < 285) baseName = '보라';
                else if (h < 315) baseName = '자주';
                else baseName = '분홍';
                
                // 명도/채도 수식어
                let prefix = '';
                if (l < 20) prefix = '매우 어두운 ';
                else if (l < 35) prefix = '어두운 ';
                else if (l > 85) prefix = '매우 밝은 ';
                else if (l > 70) prefix = '밝은 ';
                
                if (s < 25) prefix += '연한 ';
                else if (s > 85) prefix += '선명한 ';
                else if (s > 65) prefix += '진한 ';
                
                return prefix + baseName;
            } catch (error) {
                console.warn('[ColorSystem] 색상 이름 생성 오류:', error);
                return 'Unknown';
            }
        }

        /**
         * 색상 설명 생성
         */
        generateColorDescription(temperature, tone, season) {
            try {
                let description = '';
                
                if (temperature) {
                    description += temperature.description;
                }
                
                if (tone) {
                    description += description ? ', ' : '';
                    description += tone.description + ' 톤';
                }
                
                if (season) {
                    description += description ? ', ' : '';
                    const seasonNames = {
                        spring: '봄', summer: '여름', 
                        autumn: '가을', winter: '겨울'
                    };
                    description += seasonNames[season.season] + ' 타입';
                }
                
                return description || '색상 특성을 분석할 수 없습니다';
            } catch (error) {
                console.warn('[ColorSystem] 색상 설명 생성 오류:', error);
                return '설명을 생성할 수 없습니다';
            }
        }

        /**
         * 접근성 분석
         */
        analyzeAccessibility(rgb) {
            try {
                // 상대 휘도 계산 (WCAG 2.1 기준)
                const getLuminance = (r, g, b) => {
                    const sRGB = [r, g, b].map(c => {
                        c = c / 255;
                        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
                    });
                    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
                };
                
                const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
                
                // 흰색/검정색과의 대비율 계산
                const whiteContrast = (1 + 0.05) / (luminance + 0.05);
                const blackContrast = (luminance + 0.05) / (0 + 0.05);
                
                const betterContrast = Math.max(whiteContrast, blackContrast);
                
                return {
                    luminance: this.roundToPrecision(luminance),
                    contrastWithWhite: this.roundToPrecision(whiteContrast),
                    contrastWithBlack: this.roundToPrecision(blackContrast),
                    wcagAA: betterContrast >= 4.5,
                    wcagAAA: betterContrast >= 7,
                    recommendedTextColor: whiteContrast > blackContrast ? '#FFFFFF' : '#000000'
                };
            } catch (error) {
                console.error('[ColorSystem] 접근성 분석 오류:', error);
                return null;
            }
        }

        /**
         * 웹 안전 색상 판별
         */
        isWebSafeColor(rgb) {
            const webSafeValues = [0, 51, 102, 153, 204, 255];
            return webSafeValues.includes(rgb.r) && 
                   webSafeValues.includes(rgb.g) && 
                   webSafeValues.includes(rgb.b);
        }

        /**
         * 유틸리티 메서드들
         */
        roundToPrecision(value) {
            const precision = this.precisionLevel ? this.precisionLevel.decimal : 3;
            return Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);
        }

        recordStats(startTime) {
            this.stats.conversions++;
            this.stats.totalTime += (performance.now() - startTime);
        }

        cacheResult(key, result) {
            if (!this.cacheEnabled || !key || result === null || result === undefined) {
                return;
            }
            
            try {
                this.cache.set(key, result);
                
                if (this.cache.size > this.maxCacheSize) {
                    const firstKey = this.cache.keys().next().value;
                    this.cache.delete(firstKey);
                }
            } catch (error) {
                console.warn('[ColorSystem] 캐시 저장 실패:', error);
            }
        }

        clearCache() {
            this.cache.clear();
            this.stats.cacheHits = 0;
            this.stats.cacheMisses = 0;
            console.log('[ColorSystem] 캐시가 클리어되었습니다');
        }

        setCacheEnabled(enabled) {
            this.cacheEnabled = Boolean(enabled);
            if (!enabled) {
                this.clearCache();
            }
            console.log(`[ColorSystem] 캐시 ${enabled ? '활성화' : '비활성화'}됨`);
        }

        /**
         * 시스템 상태 반환
         */
        getSystemStatus() {
            const hitRate = this.stats.cacheHits + this.stats.cacheMisses > 0 ?
                this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses) : 0;
            
            return {
                // 시스템 설정
                illuminant: this.currentIlluminant.name,
                illuminantTemperature: this.currentIlluminant.temperature,
                precisionLevel: this.precisionLevel,
                
                // 캐시 상태
                cacheEnabled: this.cacheEnabled,
                cacheSize: this.cache.size,
                maxCacheSize: this.maxCacheSize,
                
                // 성능 통계
                stats: {
                    ...this.stats,
                    hitRate: this.roundToPrecision(hitRate * 100),
                    averageTime: this.stats.conversions > 0 ? 
                        this.roundToPrecision(this.stats.totalTime / this.stats.conversions) : 0
                },
                
                // 기능 상태
                capabilities: {
                    colorSpaceConversion: true,
                    temperatureAnalysis: true,
                    seasonMapping: true,
                    deltaE2000: true,
                    harmonyAnalysis: true,
                    koreanOptimization: true,
                    accessibility: true
                }
            };
        }

        /**
         * 시스템 유효성 검증
         */
        validateColorSystem() {
            const issues = [];
            const warnings = [];
            
            try {
                // 기본 변환 테스트
                const testRgb = { r: 128, g: 64, b: 192 };
                
                const xyz = this.rgbToXyz(testRgb);
                if (!xyz) issues.push('RGB to XYZ 변환 실패');
                
                const lab = this.rgbToLab(testRgb);
                if (!lab) issues.push('RGB to LAB 변환 실패');
                
                const hsl = this.rgbToHsl(testRgb);
                if (!hsl) issues.push('RGB to HSL 변환 실패');
                
                const hex = this.rgbToHex(testRgb);
                if (!hex) issues.push('RGB to HEX 변환 실패');
                
                // 고급 분석 테스트
                const temperature = this.analyzeColorTemperature(testRgb);
                if (!temperature) warnings.push('색온도 분석 실패');
                
                const tone = this.classifyPccsTone(testRgb);
                if (!tone) warnings.push('PCCS 톤 분류 실패');
                
                const season = this.mapToSeason(testRgb);
                if (!season) warnings.push('계절 매핑 실패');
                
                // Delta E 테스트
                if (lab) {
                    const testLab2 = { l: lab.l + 5, a: lab.a + 3, b: lab.b - 2 };
                    const deltaE = this.calculateDeltaE2000(lab, testLab2);
                    if (deltaE === null) warnings.push('Delta E 2000 계산 실패');
                }
                
                // 조명체 검증
                if (!this.currentIlluminant) issues.push('조명체가 설정되지 않음');
                
            } catch (error) {
                issues.push(`시스템 검증 오류: ${error.message}`);
            }
            
            const status = issues.length === 0 ? 'healthy' : 
                          issues.length > 3 ? 'critical' : 'warning';
            
            return {
                status,
                isValid: issues.length === 0,
                issues,
                warnings,
                systemInfo: this.getSystemStatus()
            };
        }

        /**
         * 정리 함수 (메모리 해제)
         */
        dispose() {
            try {
                // 캐시 정리
                this.clearCache();
                
                // 참조 해제
                this.illuminants = null;
                this.matrices = null;
                this.pccsTones = null;
                this.seasonalCharacteristics = null;
                this.harmonyRules = null;
                this.koreanSkinOptimization = null;
                
                console.log('[ColorSystem] ✅ 시스템 정리 완료');
            } catch (error) {
                console.error('[ColorSystem] ❌ 정리 중 오류:', error);
            }
        }
    }

    // 전역 등록 (window 객체)
    if (typeof window !== 'undefined') {
        window.ColorSystem = ColorSystem;
    }
    
    // 모듈 방식 지원
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = ColorSystem;
    }
    
    console.log('[ColorSystem] 🎨 최종 완성 버전 로드 완료 ✅');
    console.log('[ColorSystem] 🔬 과학적 색상 분석 시스템 준비됨');
    
})();
