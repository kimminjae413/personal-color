/**
 * ColorConverter.js - 고급 색공간 변환 유틸리티
 * 
 * 퍼스널컬러 진단에 필요한 모든 색공간 간 변환을 제공
 * RGB ↔ LAB ↔ HSL ↔ CMYK ↔ HSV ↔ XYZ 완벽 지원
 */

class ColorConverter {
    constructor() {
        // D65 표준 조명 기준값 (CIE 1931 2° observer)
        this.illuminant = {
            X: 95.047,
            Y: 100.000,
            Z: 108.883
        };
        
        // RGB 작업 공간 (sRGB)
        this.workingSpace = {
            gamma: 2.4,
            companding: 0.04045
        };
        
        // 캐시 시스템
        this.cache = new Map();
        this.cacheSize = 1000;
    }

    /**
     * RGB를 CIE L*a*b*로 변환
     * @param {number} r - Red (0-255)
     * @param {number} g - Green (0-255)
     * @param {number} b - Blue (0-255)
     * @returns {Object} {L, a, b}
     */
    rgbToLab(r, g, b) {
        const cacheKey = `rgb2lab_${r}_${g}_${b}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        // RGB → XYZ → LAB
        const xyz = this.rgbToXyz(r, g, b);
        const lab = this.xyzToLab(xyz.X, xyz.Y, xyz.Z);
        
        this.setCache(cacheKey, lab);
        return lab;
    }

    /**
     * CIE L*a*b*를 RGB로 변환
     * @param {number} L - Lightness
     * @param {number} a - Green-Red
     * @param {number} b - Blue-Yellow
     * @returns {Object} {r, g, b}
     */
    labToRgb(L, a, b) {
        const cacheKey = `lab2rgb_${L}_${a}_${b}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        // LAB → XYZ → RGB
        const xyz = this.labToXyz(L, a, b);
        const rgb = this.xyzToRgb(xyz.X, xyz.Y, xyz.Z);
        
        this.setCache(cacheKey, rgb);
        return rgb;
    }

    /**
     * RGB를 HSL로 변환
     * @param {number} r - Red (0-255)
     * @param {number} g - Green (0-255)
     * @param {number} b - Blue (0-255)
     * @returns {Object} {h, s, l}
     */
    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

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
                    h = (g - b) / diff + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / diff + 2;
                    break;
                case b:
                    h = (r - g) / diff + 4;
                    break;
            }
            h /= 6;
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    /**
     * HSL을 RGB로 변환
     * @param {number} h - Hue (0-360)
     * @param {number} s - Saturation (0-100)
     * @param {number} l - Lightness (0-100)
     * @returns {Object} {r, g, b}
     */
    hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;

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

    /**
     * RGB를 HSV로 변환
     * @param {number} r - Red (0-255)
     * @param {number} g - Green (0-255) 
     * @param {number} b - Blue (0-255)
     * @returns {Object} {h, s, v}
     */
    rgbToHsv(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;

        const v = max;
        const s = max === 0 ? 0 : diff / max;
        let h = 0;

        if (diff !== 0) {
            switch (max) {
                case r:
                    h = (g - b) / diff + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / diff + 2;
                    break;
                case b:
                    h = (r - g) / diff + 4;
                    break;
            }
            h /= 6;
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            v: Math.round(v * 100)
        };
    }

    /**
     * HSV를 RGB로 변환
     * @param {number} h - Hue (0-360)
     * @param {number} s - Saturation (0-100)
     * @param {number} v - Value (0-100)
     * @returns {Object} {r, g, b}
     */
    hsvToRgb(h, s, v) {
        h /= 360;
        s /= 100;
        v /= 100;

        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);

        let r, g, b;
        switch (i % 6) {
            case 0: r = v; g = t; b = p; break;
            case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break;
            case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break;
            case 5: r = v; g = p; b = q; break;
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    /**
     * RGB를 CMYK로 변환
     * @param {number} r - Red (0-255)
     * @param {number} g - Green (0-255)
     * @param {number} b - Blue (0-255)
     * @returns {Object} {c, m, y, k}
     */
    rgbToCmyk(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const k = 1 - Math.max(r, Math.max(g, b));
        
        if (k === 1) {
            return { c: 0, m: 0, y: 0, k: 100 };
        }

        const c = (1 - r - k) / (1 - k);
        const m = (1 - g - k) / (1 - k);
        const y = (1 - b - k) / (1 - k);

        return {
            c: Math.round(c * 100),
            m: Math.round(m * 100),
            y: Math.round(y * 100),
            k: Math.round(k * 100)
        };
    }

    /**
     * CMYK를 RGB로 변환
     * @param {number} c - Cyan (0-100)
     * @param {number} m - Magenta (0-100)
     * @param {number} y - Yellow (0-100)
     * @param {number} k - Black (0-100)
     * @returns {Object} {r, g, b}
     */
    cmykToRgb(c, m, y, k) {
        c /= 100;
        m /= 100;
        y /= 100;
        k /= 100;

        const r = 255 * (1 - c) * (1 - k);
        const g = 255 * (1 - m) * (1 - k);
        const b = 255 * (1 - y) * (1 - k);

        return {
            r: Math.round(r),
            g: Math.round(g),
            b: Math.round(b)
        };
    }

    /**
     * RGB를 XYZ로 변환 (sRGB 색공간)
     * @param {number} r - Red (0-255)
     * @param {number} g - Green (0-255)
     * @param {number} b - Blue (0-255)
     * @returns {Object} {X, Y, Z}
     */
    rgbToXyz(r, g, b) {
        // 정규화 및 감마 보정
        let rNorm = r / 255;
        let gNorm = g / 255;
        let bNorm = b / 255;

        // sRGB 감마 보정 제거
        rNorm = rNorm > 0.04045 ? 
            Math.pow((rNorm + 0.055) / 1.055, 2.4) : 
            rNorm / 12.92;
        gNorm = gNorm > 0.04045 ? 
            Math.pow((gNorm + 0.055) / 1.055, 2.4) : 
            gNorm / 12.92;
        bNorm = bNorm > 0.04045 ? 
            Math.pow((bNorm + 0.055) / 1.055, 2.4) : 
            bNorm / 12.92;

        // sRGB to XYZ 변환 매트릭스
        const X = rNorm * 0.4124564 + gNorm * 0.3575761 + bNorm * 0.1804375;
        const Y = rNorm * 0.2126729 + gNorm * 0.7151522 + bNorm * 0.0721750;
        const Z = rNorm * 0.0193339 + gNorm * 0.1191920 + bNorm * 0.9503041;

        return {
            X: X * 100,
            Y: Y * 100,
            Z: Z * 100
        };
    }

    /**
     * XYZ를 RGB로 변환
     * @param {number} X 
     * @param {number} Y 
     * @param {number} Z 
     * @returns {Object} {r, g, b}
     */
    xyzToRgb(X, Y, Z) {
        X /= 100;
        Y /= 100;
        Z /= 100;

        // XYZ to sRGB 변환 매트릭스
        let r = X * 3.2404542 + Y * -1.5371385 + Z * -0.4985314;
        let g = X * -0.9692660 + Y * 1.8760108 + Z * 0.0415560;
        let b = X * 0.0556434 + Y * -0.2040259 + Z * 1.0572252;

        // sRGB 감마 보정 적용
        r = r > 0.0031308 ? 1.055 * Math.pow(r, 1/2.4) - 0.055 : 12.92 * r;
        g = g > 0.0031308 ? 1.055 * Math.pow(g, 1/2.4) - 0.055 : 12.92 * g;
        b = b > 0.0031308 ? 1.055 * Math.pow(b, 1/2.4) - 0.055 : 12.92 * b;

        return {
            r: Math.max(0, Math.min(255, Math.round(r * 255))),
            g: Math.max(0, Math.min(255, Math.round(g * 255))),
            b: Math.max(0, Math.min(255, Math.round(b * 255)))
        };
    }

    /**
     * XYZ를 CIE L*a*b*로 변환
     * @param {number} X 
     * @param {number} Y 
     * @param {number} Z 
     * @returns {Object} {L, a, b}
     */
    xyzToLab(X, Y, Z) {
        const xn = X / this.illuminant.X;
        const yn = Y / this.illuminant.Y;
        const zn = Z / this.illuminant.Z;

        const fx = this.labFunction(xn);
        const fy = this.labFunction(yn);
        const fz = this.labFunction(zn);

        const L = 116 * fy - 16;
        const a = 500 * (fx - fy);
        const b = 200 * (fy - fz);

        return { L, a, b };
    }

    /**
     * CIE L*a*b*를 XYZ로 변환
     * @param {number} L 
     * @param {number} a 
     * @param {number} b 
     * @returns {Object} {X, Y, Z}
     */
    labToXyz(L, a, b) {
        const fy = (L + 16) / 116;
        const fx = a / 500 + fy;
        const fz = fy - b / 200;

        const xn = this.invLabFunction(fx);
        const yn = this.invLabFunction(fy);
        const zn = this.invLabFunction(fz);

        return {
            X: xn * this.illuminant.X,
            Y: yn * this.illuminant.Y,
            Z: zn * this.illuminant.Z
        };
    }

    /**
     * CIE L*a*b* 변환용 함수
     * @param {number} t 
     * @returns {number}
     */
    labFunction(t) {
        const delta = 6/29;
        return t > delta ** 3 ? Math.pow(t, 1/3) : t / (3 * delta ** 2) + 4/29;
    }

    /**
     * CIE L*a*b* 역변환용 함수
     * @param {number} t 
     * @returns {number}
     */
    invLabFunction(t) {
        const delta = 6/29;
        return t > delta ? t ** 3 : 3 * delta ** 2 * (t - 4/29);
    }

    /**
     * 16진수 컬러를 RGB로 변환
     * @param {string} hex - #RRGGBB 형식
     * @returns {Object} {r, g, b}
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     * RGB를 16진수 컬러로 변환
     * @param {number} r - Red (0-255)
     * @param {number} g - Green (0-255)
     * @param {number} b - Blue (0-255)
     * @returns {string} #RRGGBB
     */
    rgbToHex(r, g, b) {
        const toHex = (c) => {
            const hex = Math.max(0, Math.min(255, Math.round(c))).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    /**
     * 색온도(K)를 RGB로 변환
     * @param {number} kelvin - 색온도 (1000-40000K)
     * @returns {Object} {r, g, b}
     */
    kelvinToRgb(kelvin) {
        const temp = kelvin / 100;
        let r, g, b;

        // Red 계산
        if (temp <= 66) {
            r = 255;
        } else {
            r = temp - 60;
            r = 329.698727446 * Math.pow(r, -0.1332047592);
        }

        // Green 계산
        if (temp <= 66) {
            g = temp;
            g = 99.4708025861 * Math.log(g) - 161.1195681661;
        } else {
            g = temp - 60;
            g = 288.1221695283 * Math.pow(g, -0.0755148492);
        }

        // Blue 계산
        if (temp >= 66) {
            b = 255;
        } else if (temp <= 19) {
            b = 0;
        } else {
            b = temp - 10;
            b = 138.5177312231 * Math.log(b) - 305.0447927307;
        }

        return {
            r: Math.max(0, Math.min(255, Math.round(r))),
            g: Math.max(0, Math.min(255, Math.round(g))),
            b: Math.max(0, Math.min(255, Math.round(b)))
        };
    }

    /**
     * 캐시 설정
     * @param {string} key 
     * @param {*} value 
     */
    setCache(key, value) {
        if (this.cache.size >= this.cacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }

    /**
     * 캐시 초기화
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * 배치 변환 - 여러 색상을 한번에 변환
     * @param {Array} colors - 변환할 색상 배열
     * @param {string} fromSpace - 원본 색공간
     * @param {string} toSpace - 대상 색공간
     * @returns {Array} 변환된 색상 배열
     */
    batchConvert(colors, fromSpace, toSpace) {
        const methodName = `${fromSpace}To${toSpace}`;
        
        if (typeof this[methodName] !== 'function') {
            throw new Error(`Conversion from ${fromSpace} to ${toSpace} is not supported`);
        }

        return colors.map(color => {
            if (Array.isArray(color)) {
                return this[methodName](...color);
            } else if (typeof color === 'object') {
                const values = Object.values(color);
                return this[methodName](...values);
            } else {
                throw new Error('Invalid color format');
            }
        });
    }

    /**
     * 색상 정보 요약
     * @param {number} r - Red (0-255)
     * @param {number} g - Green (0-255)
     * @param {number} b - Blue (0-255)
     * @returns {Object} 모든 색공간 정보
     */
    getColorInfo(r, g, b) {
        const lab = this.rgbToLab(r, g, b);
        const hsl = this.rgbToHsl(r, g, b);
        const hsv = this.rgbToHsv(r, g, b);
        const cmyk = this.rgbToCmyk(r, g, b);
        const hex = this.rgbToHex(r, g, b);

        return {
            rgb: { r, g, b },
            lab: lab,
            hsl: hsl,
            hsv: hsv,
            cmyk: cmyk,
            hex: hex,
            // 추가 분석 정보
            brightness: Math.round((r * 0.299 + g * 0.587 + b * 0.114)),
            warmth: this.calculateWarmth(r, g, b),
            saturation: hsv.s,
            lightness: hsl.l
        };
    }

    /**
     * 색상 온도감 계산 (웜톤/쿨톤 판단)
     * @param {number} r 
     * @param {number} g 
     * @param {number} b 
     * @returns {string} 'warm', 'cool', 'neutral'
     */
    calculateWarmth(r, g, b) {
        const hsl = this.rgbToHsl(r, g, b);
        const hue = hsl.h;

        // 색상환 기준 온도감 판단
        if ((hue >= 0 && hue <= 60) || (hue >= 300 && hue <= 360)) {
            return 'warm';
        } else if (hue >= 120 && hue <= 240) {
            return 'cool';
        } else {
            return 'neutral';
        }
    }
}

// 전역 인스턴스 생성
const colorConverter = new ColorConverter();

// 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ColorConverter;
} else if (typeof window !== 'undefined') {
    window.ColorConverter = ColorConverter;
    window.colorConverter = colorConverter;
}
