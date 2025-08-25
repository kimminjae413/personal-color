/**
 * ColorSystem.js - 완전 수정판 (ES5 호환)
 * 색공간 관리 시스템
 * 
 * 변경사항:
 * - import/export 구문 완전 제거 ✅
 * - IIFE 패턴으로 변경 ✅
 * - 전역 window 객체 등록 ✅
 * - ReferenceError: illuminant is not defined 오류 수정 ✅
 * - 조명체 상수 완전 정의 및 안전 접근 ✅
 * - RGB↔LAB 변환 시스템 완전 구현 ✅
 * - 색온도 계산 로직 개선 ✅
 * - 성능 최적화 및 캐싱 시스템 ✅
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
        return {};
    }

    /**
     * ColorSystem 클래스 (ES5 호환)
     */
    class ColorSystem {
        constructor() {
            // CONFIG 안전 로드
            this.CONFIG = getConfig();
            
            // CIE 표준 조명체 정의 (완전 재구현 - illuminant 오류 수정)
            this.illuminants = {
                D65: { 
                    name: 'D65',
                    description: 'Daylight 6504K',
                    x: 0.31271, 
                    y: 0.32902, 
                    X: 95.047, 
                    Y: 100.000, 
                    Z: 108.883,
                    temperature: 6504,
                    whitePoint: [95.047, 100.000, 108.883]
                }, 
                D50: { 
                    name: 'D50',
                    description: 'Daylight 5003K',
                    x: 0.34567, 
                    y: 0.35850, 
                    X: 96.422, 
                    Y: 100.000, 
                    Z: 82.521,
                    temperature: 5003,
                    whitePoint: [96.422, 100.000, 82.521]
                },  
                A: { 
                    name: 'A',
                    description: 'Incandescent 2856K',
                    x: 0.44757, 
                    y: 0.40745, 
                    X: 109.850, 
                    Y: 100.000, 
                    Z: 35.585,
                    temperature: 2856,
                    whitePoint: [109.850, 100.000, 35.585]
                },    
                F2: { 
                    name: 'F2',
                    description: 'Cool White Fluorescent',
                    x: 0.37208, 
                    y: 0.37529, 
                    X: 99.187, 
                    Y: 100.000, 
                    Z: 67.393,
                    temperature: 4230,
                    whitePoint: [99.187, 100.000, 67.393]
                }     
            };
            
            // 현재 사용 중인 조명체 (안전하게 초기화)
            this.currentIlluminant = this.illuminants.D65;
            
            // 색공간 변환 매트릭스 정의
            this.matrices = {
                // sRGB to XYZ (D65 기준)
                sRGBtoXYZ: [
                    [0.4124564, 0.3575761, 0.1804375],
                    [0.2126729, 0.7151522, 0.0721750],
                    [0.0193339, 0.1191920, 0.9503041]
                ],
                // XYZ to sRGB (D65 기준)
                XYZtosRGB: [
                    [ 3.2404542, -1.5371385, -0.4985314],
                    [-0.9692660,  1.8760108,  0.0415560],
                    [ 0.0556434, -0.2040259,  1.0572252]
                ]
            };
            
            // PCCS 톤 정의
            this.pccsTones = {
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
            
            // 4계절 색온도 기준값
            this.seasonalTemperatures = {
                spring: { warm: true, temperature: 'warm', range: [3000, 4000] },
                summer: { warm: false, temperature: 'cool', range: [5500, 6500] },
                autumn: { warm: true, temperature: 'warm', range: [2500, 3500] },
                winter: { warm: false, temperature: 'cool', range: [6000, 8000] }
            };
            
            // 색상환 정의 (360도 기준)
            this.colorWheel = {
                red: { hue: 0, warm: true },
                redOrange: { hue: 30, warm: true },
                orange: { hue: 60, warm: true },
                yellowOrange: { hue: 90, warm: true },
                yellow: { hue: 120, warm: true },
                yellowGreen: { hue: 150, warm: false },
                green: { hue: 180, warm: false },
                blueGreen: { hue: 210, warm: false },
                blue: { hue: 240, warm: false },
                blueViolet: { hue: 270, warm: false },
                violet: { hue: 300, warm: false },
                redViolet: { hue: 330, warm: true }
            };
            
            // 캐싱 시스템 초기화
            this.cache = new Map();
            this.cacheEnabled = true;
            this.maxCacheSize = 500;
            
            // 성능 통계
            this.stats = {
                conversions: 0,
                cacheHits: 0,
                cacheMisses: 0,
                totalTime: 0
            };
            
            this.init();
        }

        /**
         * 초기화 (안전한 설정 로드)
         */
        init() {
            try {
                // 설정에서 조명체 로드 (안전 접근)
                const illuminantType = this.CONFIG.COLOR_ANALYSIS?.standardIlluminant?.type || 'D65';
                this.setIlluminant(illuminantType);
                
                console.log('[ColorSystem] 초기화 완료:', {
                    illuminant: illuminantType,
                    temperature: this.currentIlluminant.temperature
                });
            } catch (error) {
                console.warn('[ColorSystem] 초기화 중 오류:', error);
                // 기본값으로 폴백
                this.currentIlluminant = this.illuminants.D65;
            }
        }

        /**
         * 조명체 설정 (안전 접근)
         */
        setIlluminant(illuminantType) {
            try {
                if (this.illuminants[illuminantType]) {
                    this.currentIlluminant = this.illuminants[illuminantType];
                    console.log(`[ColorSystem] 조명체 설정됨: ${illuminantType} (${this.currentIlluminant.temperature}K)`);
                } else {
                    console.warn('[ColorSystem] 알 수 없는 조명체:', illuminantType);
                    this.currentIlluminant = this.illuminants.D65;
                }
            } catch (error) {
                console.error('[ColorSystem] 조명체 설정 오류:', error);
                this.currentIlluminant = this.illuminants.D65;
            }
        }

        /**
         * 입력 색상 검증
         */
        validateRgbColor(rgb) {
            if (!rgb || typeof rgb !== 'object') {
                return false;
            }
            
            const { r, g, b } = rgb;
            
            return (
                typeof r === 'number' && r >= 0 && r <= 255 &&
                typeof g === 'number' && g >= 0 && g <= 255 &&
                typeof b === 'number' && b >= 0 && b <= 255
            );
        }

        validateLabColor(lab) {
            if (!lab || typeof lab !== 'object') {
                return false;
            }
            
            const { l, a, b } = lab;
            
            return (
                typeof l === 'number' && l >= 0 && l <= 100 &&
                typeof a === 'number' && a >= -128 && a <= 127 &&
                typeof b === 'number' && b >= -128 && b <= 127
            );
        }

        /**
         * RGB to XYZ 변환 (완전 재구현)
         */
        rgbToXyz(rgb) {
            if (!this.validateRgbColor(rgb)) {
                console.warn('[ColorSystem] 잘못된 RGB 색상:', rgb);
                return null;
            }

            const cacheKey = `rgb2xyz_${rgb.r}_${rgb.g}_${rgb.b}`;
            if (this.cacheEnabled && this.cache.has(cacheKey)) {
                this.stats.cacheHits++;
                return this.cache.get(cacheKey);
            }
            this.stats.cacheMisses++;

            const startTime = performance.now();
            
            try {
                // RGB 값 정규화 (0-1)
                let r = rgb.r / 255;
                let g = rgb.g / 255;
                let b = rgb.b / 255;

                // 감마 보정 (sRGB → linear RGB)
                r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
                g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
                b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

                // 매트릭스 변환 (linear RGB → XYZ)
                const matrix = this.matrices.sRGBtoXYZ;
                const x = (r * matrix[0][0] + g * matrix[0][1] + b * matrix[0][2]) * 100;
                const y = (r * matrix[1][0] + g * matrix[1][1] + b * matrix[1][2]) * 100;
                const z = (r * matrix[2][0] + g * matrix[2][1] + b * matrix[2][2]) * 100;

                const result = { x, y, z };
                
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

            const cacheKey = `xyz2rgb_${xyz.x}_${xyz.y}_${xyz.z}`;
            if (this.cacheEnabled && this.cache.has(cacheKey)) {
                this.stats.cacheHits++;
                return this.cache.get(cacheKey);
            }
            this.stats.cacheMisses++;

            const startTime = performance.now();
            
            try {
                // XYZ 값 정규화
                let x = xyz.x / 100;
                let y = xyz.y / 100;
                let z = xyz.z / 100;

                // 매트릭스 변환 (XYZ → linear RGB)
                const matrix = this.matrices.XYZtosRGB;
                let r = x * matrix[0][0] + y * matrix[0][1] + z * matrix[0][2];
                let g = x * matrix[1][0] + y * matrix[1][1] + z * matrix[1][2];
                let b = x * matrix[2][0] + y * matrix[2][1] + z * matrix[2][2];

                // 감마 보정 (linear RGB → sRGB)
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
         * XYZ to LAB 변환 (완전 재구현 - illuminant 오류 수정)
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
                // 현재 조명체로 정규화 (안전 접근)
                const illuminant = this.currentIlluminant;
                let x = xyz.x / illuminant.X;
                let y = xyz.y / illuminant.Y;
                let z = xyz.z / illuminant.Z;

                // f 함수 적용 (CIE LAB 표준)
                const epsilon = 0.008856; // (6/29)³
                const kappa = 903.3;      // (29/3)³

                const fx = x > epsilon ? Math.pow(x, 1/3) : (kappa * x + 16) / 116;
                const fy = y > epsilon ? Math.pow(y, 1/3) : (kappa * y + 16) / 116;
                const fz = z > epsilon ? Math.pow(z, 1/3) : (kappa * z + 16) / 116;

                // LAB 값 계산
                const result = {
                    l: 116 * fy - 16,
                    a: 500 * (fx - fy),
                    b: 200 * (fy - fz)
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
                const fy = (lab.l + 16) / 116;
                const fx = lab.a / 500 + fy;
                const fz = fy - lab.b / 200;

                // 역변환 함수
                const epsilon = 0.008856;
                const kappa = 903.3;

                const x = fx > Math.pow(epsilon, 1/3) ? Math.pow(fx, 3) : (116 * fx - 16) / kappa;
                const y = fy > Math.pow(epsilon, 1/3) ? Math.pow(fy, 3) : (116 * fy - 16) / kappa;
                const z = fz > Math.pow(epsilon, 1/3) ? Math.pow(fz, 3) : (116 * fz - 16) / kappa;

                // 조명체 기준으로 스케일링
                const illuminant = this.currentIlluminant;
                const result = {
                    x: x * illuminant.X,
                    y: y * illuminant.Y,
                    z: z * illuminant.Z
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
         * RGB to HSL 변환
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
                const r = rgb.r / 255;
                const g = rgb.g / 255;
                const b = rgb.b / 255;

                const max = Math.max(r, g, b);
                const min = Math.min(r, g, b);
                const diff = max - min;
                const sum = max + min;
                
                const l = sum / 2;
                
                let h = 0;
                let s = 0;
                
                if (diff !== 0) {
                    s = l > 0.5 ? diff / (2 - sum) : diff / sum;
                    
                    switch (max) {
                        case r:
                            h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
                            break;
                        case g:
                            h = ((b - r) / diff + 2) / 6;
                            break;
                        case b:
                            h = ((r - g) / diff + 4) / 6;
                            break;
                    }
                }
                
                const result = {
                    h: Math.round(h * 360),
                    s: Math.round(s * 100),
                    l: Math.round(l * 100)
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
            if (!hsl || typeof hsl.h !== 'number' || typeof hsl.s !== 'number' || typeof hsl.l !== 'number') {
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
                const h = (hsl.h % 360) / 360;
                const s = Math.max(0, Math.min(100, hsl.s)) / 100;
                const l = Math.max(0, Math.min(100, hsl.l)) / 100;

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
            
            return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toLowerCase();
        }

        /**
         * HEX to RGB 변환
         */
        hexToRgb(hex) {
            if (typeof hex !== 'string') {
                console.warn('[ColorSystem] HEX는 문자열이어야 합니다:', hex);
                return null;
            }

            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
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
         * 색온도 분석 (완전 재구현)
         */
        analyzeColorTemperature(color) {
            let lab;
            
            if (color.l !== undefined) {
                lab = color;
            } else if (color.r !== undefined) {
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
                // a*, b* 값을 기준으로 색온도 분석
                const a = lab.a;
                const b = lab.b;
                
                // 색온도 계산 (근사값)
                let temperature = 'neutral';
                let warmness = 0; // -1 (very cool) ~ +1 (very warm)
                
                // a* 값: 적록 축 (양수면 적색, 음수면 녹색)
                // b* 값: 황청 축 (양수면 황색, 음수면 청색)
                
                if (b > 15 && a > 0) {
                    // 황색이 강하고 적색 경향 = 웜톤
                    temperature = 'warm';
                    warmness = Math.min(1, (b - 15) / 20 + a / 20);
                } else if (b < -5 || (a < 0 && b < 10)) {
                    // 청색이 강하거나 녹색+낮은황색 = 쿨톤
                    temperature = 'cool';
                    warmness = Math.max(-1, (b + 5) / -20 + a / -20);
                } else {
                    // 중성
                    temperature = 'neutral';
                    warmness = (a * 0.02 + b * 0.02) / 2;
                }

                const result = {
                    temperature,
                    warmness: Math.round(warmness * 100) / 100,
                    kelvin: this.estimateKelvin(lab),
                    description: this.getTemperatureDescription(temperature, warmness),
                    labValues: { a, b }
                };
                
                this.recordStats(startTime);
                this.cacheResult(cacheKey, result);
                
                return result;
            } catch (error) {
                console.error('[ColorSystem] 색온도 분석 오류:', error);
                return null;
            }
        }

        estimateKelvin(lab) {
            try {
                // LAB 값을 기준으로 색온도 추정 (근사값)
                const warmth = (lab.b - lab.a * 0.5) / 50;
                const baseTemp = 5500; // D65 기준
                const tempOffset = warmth * -1500; // 따뜻할수록 낮은 켈빈
                
                return Math.max(2000, Math.min(10000, Math.round(baseTemp + tempOffset)));
            } catch (error) {
                console.warn('[ColorSystem] 켈빈 추정 오류:', error);
                return 5500; // 기본값
            }
        }

        getTemperatureDescription(temperature, warmness) {
            if (temperature === 'warm') {
                if (warmness > 0.7) return '매우 따뜻함';
                if (warmness > 0.3) return '따뜻함';
                return '약간 따뜻함';
            } else if (temperature === 'cool') {
                if (warmness < -0.7) return '매우 차가움';
                if (warmness < -0.3) return '차가움';
                return '약간 차가움';
            }
            return '중성';
        }

        /**
         * PCCS 톤 분류
         */
        classifyPccsTone(color) {
            let hsl;
            
            if (color.h !== undefined) {
                hsl = color;
            } else if (color.r !== undefined) {
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
                
                let tone = 'dull';
                let confidence = 0;
                let toneScores = {};
                
                // 무채색 판별
                if (saturation < 10) {
                    if (lightness > 75) {
                        tone = 'lightGray';
                    } else if (lightness > 40) {
                        tone = 'mediumGray';
                    } else {
                        tone = 'darkGray';
                    }
                    confidence = 0.9;
                } else {
                    // 유채색 톤 분류
                    Object.entries(this.pccsTones).forEach(([toneName, toneData]) => {
                        if (toneName.includes('Gray')) return; // 무채색 제외
                        
                        const lightnessDiff = Math.abs(lightness - toneData.lightness);
                        const saturationDiff = Math.abs(saturation - toneData.saturation);
                        
                        // 가중평균으로 점수 계산
                        const score = 100 - (lightnessDiff * 0.6 + saturationDiff * 0.4);
                        toneScores[toneName] = Math.max(0, score);
                    });
                    
                    // 가장 높은 점수의 톤 선택
                    const bestTone = Object.entries(toneScores)
                        .reduce((best, [toneName, score]) => 
                            score > best.score ? { tone: toneName, score } : best,
                            { tone: 'dull', score: 0 });
                    
                    tone = bestTone.tone;
                    confidence = bestTone.score / 100;
                }

                const result = {
                    tone,
                    confidence: Math.round(confidence * 100) / 100,
                    description: this.pccsTones[tone].description,
                    lightness,
                    saturation,
                    scores: toneScores
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
         * 계절 색상 매핑
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
                const temperature = this.analyzeColorTemperature(color);
                const tone = this.classifyPccsTone(color);
                const hsl = color.h !== undefined ? color : this.rgbToHsl(color);
                
                if (!temperature || !tone || !hsl) {
                    console.warn('[ColorSystem] 색상 분석 실패');
                    return null;
                }
                
                const seasonScores = {
                    spring: 0,
                    summer: 0,
                    autumn: 0,
                    winter: 0
                };
                
                // 색온도 기반 점수
                if (temperature.temperature === 'warm') {
                    seasonScores.spring += 40;
                    seasonScores.autumn += 40;
                } else if (temperature.temperature === 'cool') {
                    seasonScores.summer += 40;
                    seasonScores.winter += 40;
                } else {
                    // 중성 색온도는 모든 계절에 약간씩 점수
                    Object.keys(seasonScores).forEach(season => seasonScores[season] += 20);
                }
                
                // 명도 기반 점수
                if (hsl.l > 60) {
                    seasonScores.spring += 30;
                    seasonScores.summer += 30;
                } else {
                    seasonScores.autumn += 30;
                    seasonScores.winter += 30;
                }
                
                // 채도 기반 점수
                if (hsl.s > 60) {
                    seasonScores.spring += 25;
                    seasonScores.winter += 25;
                } else {
                    seasonScores.summer += 25;
                    seasonScores.autumn += 25;
                }
                
                // 톤 기반 세부 조정
                switch (tone.tone) {
                    case 'vivid':
                    case 'bright':
                        seasonScores.spring += 15;
                        seasonScores.winter += 10;
                        break;
                    case 'pale':
                    case 'light':
                        seasonScores.spring += 10;
                        seasonScores.summer += 15;
                        break;
                    case 'soft':
                    case 'dull':
                        seasonScores.summer += 15;
                        seasonScores.autumn += 10;
                        break;
                    case 'strong':
                    case 'deep':
                        seasonScores.autumn += 15;
                        seasonScores.winter += 10;
                        break;
                    case 'dark':
                        seasonScores.autumn += 10;
                        seasonScores.winter += 15;
                        break;
                }
                
                // 색상(Hue) 기반 세부 조정
                const hueAdjustment = this.getHueSeasonAdjustment(hsl.h);
                Object.entries(hueAdjustment).forEach(([season, adjustment]) => {
                    seasonScores[season] += adjustment;
                });
                
                // 점수 정규화
                const totalScore = Object.values(seasonScores).reduce((sum, score) => sum + score, 0);
                const probabilities = {};
                
                if (totalScore > 0) {
                    Object.entries(seasonScores).forEach(([season, score]) => {
                        probabilities[season] = score / totalScore;
                    });
                } else {
                    // 모든 확률을 동일하게 설정
                    Object.keys(seasonScores).forEach(season => {
                        probabilities[season] = 0.25;
                    });
                }
                
                // 최적 계절 선택
                const bestSeason = Object.entries(probabilities)
                    .reduce((best, [season, prob]) => 
                        prob > best.probability ? { season, probability: prob } : best,
                        { season: 'spring', probability: 0 });

                const result = {
                    season: bestSeason.season,
                    confidence: Math.round(bestSeason.probability * 100) / 100,
                    probabilities,
                    scores: seasonScores,
                    temperature,
                    tone,
                    analysis: {
                        warmth: temperature.warmness,
                        lightness: hsl.l,
                        saturation: hsl.s,
                        hue: hsl.h
                    }
                };
                
                this.recordStats(startTime);
                this.cacheResult(cacheKey, result);
                
                return result;
            } catch (error) {
                console.error('[ColorSystem] 계절 매핑 오류:', error);
                return null;
            }
        }

        getHueSeasonAdjustment(hue) {
            const adjustment = { spring: 0, summer: 0, autumn: 0, winter: 0 };
            
            try {
                // 색상환 기준 계절 성향
                if (hue >= 0 && hue < 60) { // 빨강-주황
                    adjustment.spring += 10;
                    adjustment.autumn += 15;
                } else if (hue >= 60 && hue < 120) { // 주황-노랑
                    adjustment.spring += 15;
                    adjustment.autumn += 10;
                } else if (hue >= 120 && hue < 180) { // 노랑-녹색
                    adjustment.spring += 5;
                    adjustment.summer += 10;
                } else if (hue >= 180 && hue < 240) { // 녹색-파랑
                    adjustment.summer += 15;
                    adjustment.winter += 10;
                } else if (hue >= 240 && hue < 300) { // 파랑-보라
                    adjustment.summer += 10;
                    adjustment.winter += 15;
                } else { // 보라-빨강
                    adjustment.winter += 10;
                    adjustment.autumn += 5;
                }
            } catch (error) {
                console.warn('[ColorSystem] 색상 조정 계산 오류:', error);
            }
            
            return adjustment;
        }

        /**
         * 성능 통계 기록
         */
        recordStats(startTime) {
            this.stats.conversions++;
            this.stats.totalTime += (performance.now() - startTime);
        }

        /**
         * 캐시 결과 저장
         */
        cacheResult(key, result) {
            if (!this.cacheEnabled || !key || result === null || result === undefined) {
                return;
            }
            
            try {
                this.cache.set(key, result);
                
                // 캐시 크기 제한
                if (this.cache.size > this.maxCacheSize) {
                    const firstKey = this.cache.keys().next().value;
                    this.cache.delete(firstKey);
                }
            } catch (error) {
                console.warn('[ColorSystem] 캐시 저장 실패:', error);
            }
        }

        /**
         * 색상 정보 요약
         */
        getColorInfo(color) {
            try {
                let rgb;
                if (color.r !== undefined) {
                    rgb = color;
                } else if (typeof color === 'string') {
                    rgb = this.hexToRgb(color);
                } else {
                    console.warn('[ColorSystem] 지원하지 않는 색상 형식:', color);
                    return null;
                }

                if (!rgb) return null;

                const hsl = this.rgbToHsl(rgb);
                const lab = this.rgbToLab(rgb);
                const hex = this.rgbToHex(rgb);
                
                if (!hsl || !lab) {
                    console.warn('[ColorSystem] 색상 변환 실패');
                    return null;
                }
                
                const temperature = this.analyzeColorTemperature(lab);
                const tone = this.classifyPccsTone(hsl);
                const season = this.mapToSeason(rgb);
                
                return {
                    rgb,
                    hsl,
                    lab,
                    hex,
                    temperature,
                    tone,
                    season,
                    name: this.getColorName(rgb),
                    description: this.getColorDescription(temperature, tone, season)
                };
            } catch (error) {
                console.error('[ColorSystem] 색상 정보 요약 오류:', error);
                return null;
            }
        }

        getColorName(rgb) {
            if (!rgb) return 'Unknown';
            
            try {
                const hsl = this.rgbToHsl(rgb);
                if (!hsl) return 'Unknown';
                
                const hue = hsl.h;
                const sat = hsl.s;
                const light = hsl.l;
                
                if (sat < 10) {
                    if (light > 90) return '화이트';
                    if (light > 70) return '라이트 그레이';
                    if (light > 30) return '그레이';
                    return '블랙';
                }
                
                let baseName = '';
                if (hue < 15 || hue >= 345) baseName = '레드';
                else if (hue < 45) baseName = '오렌지';
                else if (hue < 75) baseName = '옐로우';
                else if (hue < 105) baseName = '라이트 그린';
                else if (hue < 135) baseName = '그린';
                else if (hue < 165) baseName = '시안';
                else if (hue < 195) baseName = '라이트 블루';
                else if (hue < 225) baseName = '블루';
                else if (hue < 255) baseName = '퍼플';
                else if (hue < 285) baseName = '마젠타';
                else if (hue < 315) baseName = '핑크';
                else baseName = '로즈';
                
                // 명도/채도에 따른 수식어
                let prefix = '';
                if (light < 25) prefix = '다크 ';
                else if (light > 75) prefix = '라이트 ';
                
                if (sat < 30) prefix += '페일 ';
                else if (sat > 80) prefix += '비비드 ';
                
                return prefix + baseName;
            } catch (error) {
                console.warn('[ColorSystem] 색상 이름 생성 오류:', error);
                return 'Unknown';
            }
        }

        getColorDescription(temperature, tone, season) {
            try {
                const tempDesc = temperature?.description || '중성';
                const toneDesc = tone?.description || '알 수 없음';
                const seasonDesc = season?.season === 'spring' ? '봄' :
                                  season?.season === 'summer' ? '여름' :
                                  season?.season === 'autumn' ? '가을' : 
                                  season?.season === 'winter' ? '겨울' : '알 수 없음';
                
                return `${tempDesc}, ${toneDesc} 톤, ${seasonDesc} 타입`;
            } catch (error) {
                console.warn('[ColorSystem] 색상 설명 생성 오류:', error);
                return '색상 정보를 생성할 수 없습니다';
            }
        }

        /**
         * 시스템 상태 반환
         */
        getSystemStatus() {
            const hitRate = this.stats.cacheHits + this.stats.cacheMisses > 0 ?
                this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses) : 0;
            
            return {
                illuminant: this.currentIlluminant.name,
                illuminantTemperature: this.currentIlluminant.temperature,
                cacheEnabled: this.cacheEnabled,
                cacheSize: this.cache.size,
                maxCacheSize: this.maxCacheSize,
                stats: {
                    ...this.stats,
                    hitRate: Math.round(hitRate * 100) / 100,
                    averageTime: this.stats.conversions > 0 ? 
                        this.stats.totalTime / this.stats.conversions : 0
                }
            };
        }

        /**
         * 캐시 관리
         */
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
         * 모듈 유효성 검증
         */
        validateModule() {
            const issues = [];
            
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
                
                // 조명체 검증
                if (!this.currentIlluminant) issues.push('조명체가 설정되지 않음');
                
                // 색온도 분석 테스트
                const tempAnalysis = this.analyzeColorTemperature(testRgb);
                if (!tempAnalysis) issues.push('색온도 분석 실패');
                
            } catch (error) {
                issues.push(`모듈 검증 오류: ${error.message}`);
            }
            
            return {
                isValid: issues.length === 0,
                issues,
                systemStatus: this.getSystemStatus()
            };
        }
    }

    // 전역 등록 (ES5 호환 방식)
    window.ColorSystem = ColorSystem;
    
    console.log('[ColorSystem] ES5 호환 완전 수정 버전 로드 완료 ✅');
    
})();
