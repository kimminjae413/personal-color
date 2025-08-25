/**
 * ColorSystem.js
 * 색공간 관리 시스템
 * - RGB, LAB, HSL, XYZ 색공간 변환
 * - CIE 표준 조명체 (D65, D50, A) 지원
 * - 색온도 분석 및 분류
 * - PCCS(일본색채연구소) 톤 시스템
 * - 퍼스널컬러 4계절 매핑
 */

import { CONFIG } from '../config.js';

export class ColorSystem {
    constructor() {
        // CIE 표준 조명체 정의
        this.illuminants = {
            D65: { x: 0.31271, y: 0.32902, X: 95.047, Y: 100.000, Z: 108.883 }, // 표준 주광
            D50: { x: 0.34567, y: 0.35850, X: 96.422, Y: 100.000, Z: 82.521 },  // 인쇄 표준
            A: { x: 0.44757, y: 0.40745, X: 109.850, Y: 100.000, Z: 35.585 },    // 백열등
            F2: { x: 0.37208, y: 0.37529, X: 99.187, Y: 100.000, Z: 67.393 }     // 형광등
        };
        
        // 현재 사용 중인 조명체
        this.currentIlluminant = this.illuminants.D65;
        
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
        
        this.init();
    }

    init() {
        // 설정에서 조명체 로드
        const illuminant = CONFIG.COLOR_ANALYSIS?.standardIlluminant?.type || 'D65';
        this.setIlluminant(illuminant);
        
        console.log('ColorSystem 초기화 완료:', {
            illuminant: illuminant,
            temperature: this.currentIlluminant
        });
    }

    // 조명체 설정
    setIlluminant(illuminantType) {
        if (this.illuminants[illuminantType]) {
            this.currentIlluminant = this.illuminants[illuminantType];
        } else {
            console.warn('알 수 없는 조명체:', illuminantType);
            this.currentIlluminant = this.illuminants.D65;
        }
    }

    // RGB to XYZ 변환
    rgbToXyz(rgb) {
        // sRGB 색공간 기준
        let r = rgb.r / 255;
        let g = rgb.g / 255;
        let b = rgb.b / 255;

        // 감마 보정 (sRGB)
        r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
        g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
        b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

        // sRGB to XYZ 변환 매트릭스 (D65 기준)
        const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
        const y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
        const z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;

        return {
            x: x * 100, // 정규화
            y: y * 100,
            z: z * 100
        };
    }

    // XYZ to RGB 변환
    xyzToRgb(xyz) {
        let x = xyz.x / 100;
        let y = xyz.y / 100;
        let z = xyz.z / 100;

        // XYZ to sRGB 변환 매트릭스
        let r = x *  3.2404542 + y * -1.5371385 + z * -0.4985314;
        let g = x * -0.9692660 + y *  1.8760108 + z *  0.0415560;
        let b = x *  0.0556434 + y * -0.2040259 + z *  1.0572252;

        // 감마 보정
        r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
        g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
        b = b > 0.0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : 12.92 * b;

        return {
            r: Math.max(0, Math.min(255, Math.round(r * 255))),
            g: Math.max(0, Math.min(255, Math.round(g * 255))),
            b: Math.max(0, Math.min(255, Math.round(b * 255)))
        };
    }

    // XYZ to LAB 변환 (CIE L*a*b*)
    xyzToLab(xyz) {
        // 현재 조명체로 정규화
        let x = xyz.x / this.currentIlluminant.X;
        let y = xyz.y / this.currentIlluminant.Y;
        let z = xyz.z / this.currentIlluminant.Z;

        // f 함수 적용
        const fx = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x + 16/116);
        const fy = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y + 16/116);
        const fz = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z + 16/116);

        return {
            l: 116 * fy - 16,
            a: 500 * (fx - fy),
            b: 200 * (fy - fz)
        };
    }

    // LAB to XYZ 변환
    labToXyz(lab) {
        const fy = (lab.l + 16) / 116;
        const fx = lab.a / 500 + fy;
        const fz = fy - lab.b / 200;

        const x = fx > 0.206897 ? Math.pow(fx, 3) : (fx - 16/116) / 7.787;
        const y = fy > 0.206897 ? Math.pow(fy, 3) : (fy - 16/116) / 7.787;
        const z = fz > 0.206897 ? Math.pow(fz, 3) : (fz - 16/116) / 7.787;

        return {
            x: x * this.currentIlluminant.X,
            y: y * this.currentIlluminant.Y,
            z: z * this.currentIlluminant.Z
        };
    }

    // RGB to LAB 직접 변환
    rgbToLab(rgb) {
        const xyz = this.rgbToXyz(rgb);
        return this.xyzToLab(xyz);
    }

    // LAB to RGB 직접 변환
    labToRgb(lab) {
        const xyz = this.labToXyz(lab);
        return this.xyzToRgb(xyz);
    }

    // RGB to HSL 변환
    rgbToHsl(rgb) {
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
        
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    // HSL to RGB 변환
    hslToRgb(hsl) {
        const h = hsl.h / 360;
        const s = hsl.s / 100;
        const l = hsl.l / 100;

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

        return {
            r: Math.round(hue2rgb(p, q, h + 1/3) * 255),
            g: Math.round(hue2rgb(p, q, h) * 255),
            b: Math.round(hue2rgb(p, q, h - 1/3) * 255)
        };
    }

    // RGB to HEX 변환
    rgbToHex(rgb) {
        const toHex = (n) => {
            const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        
        return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
    }

    // HEX to RGB 변환
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    // 색온도 분석
    analyzeColorTemperature(color) {
        // RGB 또는 LAB 색상 모두 지원
        let lab;
        if (color.l !== undefined) {
            lab = color;
        } else if (color.r !== undefined) {
            lab = this.rgbToLab(color);
        } else {
            throw new Error('지원하지 않는 색상 형식입니다.');
        }

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
        
        return {
            temperature,
            warmness: Math.round(warmness * 100) / 100,
            kelvin: this.estimateKelvin(lab),
            description: this.getTemperatureDescription(temperature, warmness)
        };
    }

    estimateKelvin(lab) {
        // LAB 값을 기준으로 색온도 추정 (근사값)
        const warmth = (lab.b - lab.a * 0.5) / 50;
        const baseTemp = 5500; // D65 기준
        const tempOffset = warmth * -1500; // 따뜻할수록 낮은 켈빈
        
        return Math.max(2000, Math.min(10000, baseTemp + tempOffset));
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

    // PCCS 톤 분류
    classifyPccsTone(color) {
        let hsl;
        if (color.h !== undefined) {
            hsl = color;
        } else if (color.r !== undefined) {
