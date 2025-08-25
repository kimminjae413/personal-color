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
            hsl = this.rgbToHsl(color);
        } else {
            throw new Error('지원하지 않는 색상 형식입니다.');
        }

        const lightness = hsl.l;
        const saturation = hsl.s;
        
        // PCCS 톤 분류 로직
        let tone = 'dull';
        let confidence = 0;
        
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
            const toneScores = {};
            
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
        
        return {
            tone,
            confidence,
            description: this.pccsTones[tone].description,
            lightness,
            saturation,
            scores: toneScores || {}
        };
    }

    // 계절 색상 매핑
    mapToSeason(color, options = {}) {
        const temperature = this.analyzeColorTemperature(color);
        const tone = this.classifyPccsTone(color);
        const hsl = color.h !== undefined ? color : this.rgbToHsl(color);
        
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
        
        Object.entries(seasonScores).forEach(([season, score]) => {
            probabilities[season] = totalScore > 0 ? score / totalScore : 0.25;
        });
        
        // 최적 계절 선택
        const bestSeason = Object.entries(probabilities)
            .reduce((best, [season, prob]) => 
                prob > best.probability ? { season, probability: prob } : best,
                { season: 'spring', probability: 0 });
        
        return {
            season: bestSeason.season,
            confidence: bestSeason.probability,
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
    }

    getHueSeasonAdjustment(hue) {
        const adjustment = { spring: 0, summer: 0, autumn: 0, winter: 0 };
        
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
        
        return adjustment;
    }

    // 색상 조화 분석
    analyzeColorHarmony(colors) {
        if (!Array.isArray(colors) || colors.length < 2) {
            return null;
        }
        
        const hslColors = colors.map(color => 
            color.h !== undefined ? color : this.rgbToHsl(color));
        
        const harmony = {
            type: this.identifyHarmonyType(hslColors),
            balance: this.calculateColorBalance(hslColors),
            contrast: this.calculateContrast(colors),
            temperature: this.analyzeTemperatureHarmony(colors)
        };
        
        return harmony;
    }

    identifyHarmonyType(hslColors) {
        const hues = hslColors.map(c => c.h);
        const hueCount = hues.length;
        
        if (hueCount === 2) {
            const diff = Math.abs(hues[0] - hues[1]);
            const minDiff = Math.min(diff, 360 - diff);
            
            if (minDiff < 30) return 'analogous';
            if (minDiff > 150 && minDiff < 210) return 'complementary';
            if (minDiff > 90 && minDiff < 150) return 'triadic';
            return 'custom';
        } else if (hueCount === 3) {
            // 삼각 조화 검사
            const sortedHues = hues.sort((a, b) => a - b);
            const diff1 = sortedHues[1] - sortedHues[0];
            const diff2 = sortedHues[2] - sortedHues[1];
            const diff3 = 360 - sortedHues[2] + sortedHues[0];
            
            if (Math.abs(diff1 - 120) < 30 && Math.abs(diff2 - 120) < 30 && Math.abs(diff3 - 120) < 30) {
                return 'triadic';
            }
            
            return 'custom';
        }
        
        return 'complex';
    }

    calculateColorBalance(hslColors) {
        const totalLightness = hslColors.reduce((sum, c) => sum + c.l, 0);
        const totalSaturation = hslColors.reduce((sum, c) => sum + c.s, 0);
        
        const avgLightness = totalLightness / hslColors.length;
        const avgSaturation = totalSaturation / hslColors.length;
        
        // 분산 계산
        const lightnessVariance = hslColors.reduce((sum, c) => sum + Math.pow(c.l - avgLightness, 2), 0) / hslColors.length;
        const saturationVariance = hslColors.reduce((sum, c) => sum + Math.pow(c.s - avgSaturation, 2), 0) / hslColors.length;
        
        return {
            lightness: avgLightness,
            saturation: avgSaturation,
            lightnessVariance,
            saturationVariance,
            balanced: lightnessVariance < 400 && saturationVariance < 400
        };
    }

    calculateContrast(colors) {
        if (colors.length < 2) return 0;
        
        // 가장 밝은 색과 가장 어두운 색 간의 대비 계산
        const labColors = colors.map(color => 
            color.l !== undefined ? color : this.rgbToLab(color));
        
        const lightnesses = labColors.map(c => c.l);
        const maxL = Math.max(...lightnesses);
        const minL = Math.min(...lightnesses);
        
        // Weber 대비 공식 변형
        const contrast = (maxL - minL) / (maxL + minL);
        
        return {
            ratio: Math.round(contrast * 100) / 100,
            level: contrast > 0.7 ? 'high' : contrast > 0.3 ? 'medium' : 'low',
            maxLightness: maxL,
            minLightness: minL
        };
    }

    analyzeTemperatureHarmony(colors) {
        const temperatures = colors.map(color => this.analyzeColorTemperature(color));
        
        const warmCount = temperatures.filter(t => t.temperature === 'warm').length;
        const coolCount = temperatures.filter(t => t.temperature === 'cool').length;
        const neutralCount = temperatures.filter(t => t.temperature === 'neutral').length;
        
        let harmony = 'mixed';
        if (warmCount === colors.length) harmony = 'warm';
        else if (coolCount === colors.length) harmony = 'cool';
        else if (neutralCount === colors.length) harmony = 'neutral';
        
        return {
            harmony,
            distribution: { warm: warmCount, cool: coolCount, neutral: neutralCount },
            dominant: warmCount > coolCount ? 'warm' : coolCount > warmCount ? 'cool' : 'balanced'
        };
    }

    // 색상 팔레트 생성
    generatePalette(baseColor, type = 'analogous', count = 5) {
        const baseHsl = baseColor.h !== undefined ? baseColor : this.rgbToHsl(baseColor);
        const palette = [baseColor];
        
        switch (type) {
            case 'analogous':
                return this.generateAnalogousPalette(baseHsl, count);
            case 'complementary':
                return this.generateComplementaryPalette(baseHsl, count);
            case 'triadic':
                return this.generateTriadicPalette(baseHsl, count);
            case 'monochromatic':
                return this.generateMonochromaticPalette(baseHsl, count);
            case 'split-complementary':
                return this.generateSplitComplementaryPalette(baseHsl, count);
            default:
                return this.generateAnalogousPalette(baseHsl, count);
        }
    }

    generateAnalogousPalette(baseHsl, count) {
        const palette = [];
        const step = 30; // 30도씩 이동
        
        for (let i = 0; i < count; i++) {
            const hue = (baseHsl.h + (i - Math.floor(count / 2)) * step + 360) % 360;
            const color = this.hslToRgb({
                h: hue,
                s: baseHsl.s,
                l: baseHsl.l
            });
            palette.push(color);
        }
        
        return palette;
    }

    generateComplementaryPalette(baseHsl, count) {
        const palette = [this.hslToRgb(baseHsl)];
        
        // 보색
        const complementaryHue = (baseHsl.h + 180) % 360;
        palette.push(this.hslToRgb({
            h: complementaryHue,
            s: baseHsl.s,
            l: baseHsl.l
        }));
        
        // 나머지 색상들은 명도/채도 변형
        for (let i = 2; i < count; i++) {
            const useBase = i % 2 === 0;
            const hue = useBase ? baseHsl.h : complementaryHue;
            const lightnessMod = (i - 2) * 15 - 15;
            
            palette.push(this.hslToRgb({
                h: hue,
                s: Math.max(20, Math.min(100, baseHsl.s)),
                l: Math.max(10, Math.min(90, baseHsl.l + lightnessMod))
            }));
        }
        
        return palette;
    }

    generateTriadicPalette(baseHsl, count) {
        const palette = [];
        const hues = [baseHsl.h, (baseHsl.h + 120) % 360, (baseHsl.h + 240) % 360];
        
        for (let i = 0; i < count; i++) {
            const hue = hues[i % 3];
            const lightnessMod = Math.floor(i / 3) * 20 - 10;
            
            palette.push(this.hslToRgb({
                h: hue,
                s: baseHsl.s,
                l: Math.max(10, Math.min(90, baseHsl.l + lightnessMod))
            }));
        }
        
        return palette;
    }

    generateMonochromaticPalette(baseHsl, count) {
        const palette = [];
        const lightnessStep = 80 / (count - 1);
        
        for (let i = 0; i < count; i++) {
            const lightness = 10 + i * lightnessStep;
            palette.push(this.hslToRgb({
                h: baseHsl.h,
                s: baseHsl.s,
                l: lightness
            }));
        }
        
        return palette;
    }

    generateSplitComplementaryPalette(baseHsl, count) {
        const palette = [this.hslToRgb(baseHsl)];
        
        // 분할 보색 (보색의 양쪽 30도)
        const comp1 = (baseHsl.h + 150) % 360;
        const comp2 = (baseHsl.h + 210) % 360;
        
        palette.push(this.hslToRgb({ h: comp1, s: baseHsl.s, l: baseHsl.l }));
        palette.push(this.hslToRgb({ h: comp2, s: baseHsl.s, l: baseHsl.l }));
        
        // 나머지는 명도 변형
        for (let i = 3; i < count; i++) {
            const hue = [baseHsl.h, comp1, comp2][i % 3];
            const lightnessMod = (i - 3) * 15;
            
            palette.push(this.hslToRgb({
                h: hue,
                s: baseHsl.s,
                l: Math.max(10, Math.min(90, baseHsl.l + lightnessMod))
            }));
        }
        
        return palette;
    }

    // 색상 유사도 계산
    calculateColorSimilarity(color1, color2, method = 'euclidean') {
        switch (method) {
            case 'euclidean':
                return this.calculateEuclideanDistance(color1, color2);
            case 'lab':
                return this.calculateLabDistance(color1, color2);
            case 'hsl':
                return this.calculateHslDistance(color1, color2);
            default:
                return this.calculateEuclideanDistance(color1, color2);
        }
    }

    calculateEuclideanDistance(color1, color2) {
        const rgb1 = color1.r !== undefined ? color1 : this.hexToRgb(color1);
        const rgb2 = color2.r !== undefined ? color2 : this.hexToRgb(color2);
        
        const dr = rgb1.r - rgb2.r;
        const dg = rgb1.g - rgb2.g;
        const db = rgb1.b - rgb2.b;
        
        return Math.sqrt(dr * dr + dg * dg + db * db);
    }

    calculateLabDistance(color1, color2) {
        const lab1 = color1.l !== undefined ? color1 : this.rgbToLab(color1);
        const lab2 = color2.l !== undefined ? color2 : this.rgbToLab(color2);
        
        const dl = lab1.l - lab2.l;
        const da = lab1.a - lab2.a;
        const db = lab1.b - lab2.b;
        
        return Math.sqrt(dl * dl + da * da + db * db);
    }

    calculateHslDistance(color1, color2) {
        const hsl1 = color1.h !== undefined ? color1 : this.rgbToHsl(color1);
        const hsl2 = color2.h !== undefined ? color2 : this.rgbToHsl(color2);
        
        // 색상환에서의 거리 (원형이므로 특별 처리)
        let dh = Math.abs(hsl1.h - hsl2.h);
        dh = Math.min(dh, 360 - dh);
        
        const ds = Math.abs(hsl1.s - hsl2.s);
        const dl = Math.abs(hsl1.l - hsl2.l);
        
        // 가중 평균 (색상을 더 중요하게)
        return Math.sqrt(dh * dh * 2 + ds * ds + dl * dl);
    }

    // 색상 접근성 검사
    checkAccessibility(foregroundColor, backgroundColor) {
        const fgLab = foregroundColor.l !== undefined ? foregroundColor : this.rgbToLab(foregroundColor);
        const bgLab = backgroundColor.l !== undefined ? backgroundColor : this.rgbToLab(backgroundColor);
        
        // 상대 휘도 계산
        const fgLuminance = this.calculateRelativeLuminance(fgLab);
        const bgLuminance = this.calculateRelativeLuminance(bgLab);
        
        const lighter = Math.max(fgLuminance, bgLuminance);
        const darker = Math.min(fgLuminance, bgLuminance);
        
        const contrastRatio = (lighter + 0.05) / (darker + 0.05);
        
        return {
            ratio: Math.round(contrastRatio * 100) / 100,
            level: this.getWCAGLevel(contrastRatio),
            passes: {
                aa: contrastRatio >= 4.5,
                aaa: contrastRatio >= 7,
                aaLarge: contrastRatio >= 3,
                aaaLarge: contrastRatio >= 4.5
            }
        };
    }

    calculateRelativeLuminance(lab) {
        // LAB에서 상대 휘도 근사 계산
        return lab.l / 100;
    }

    getWCAGLevel(ratio) {
        if (ratio >= 7) return 'AAA';
        if (ratio >= 4.5) return 'AA';
        if (ratio >= 3) return 'AA Large';
        return 'Fail';
    }

    // 색상 정보 요약
    getColorInfo(color) {
        const rgb = color.r !== undefined ? color : this.hexToRgb(color);
        const hsl = this.rgbToHsl(rgb);
        const lab = this.rgbToLab(rgb);
        const hex = this.rgbToHex(rgb);
        
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
    }

    getColorName(rgb) {
        // 기본적인 색상 이름 매핑
        const hsl = this.rgbToHsl(rgb);
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
    }

    getColorDescription(temperature, tone, season) {
        const tempDesc = temperature.description;
        const toneDesc = tone.description;
        const seasonDesc = season.season === 'spring' ? '봄' :
                          season.season === 'summer' ? '여름' :
                          season.season === 'autumn' ? '가을' : '겨울';
        
        return `${tempDesc}, ${toneDesc} 톤, ${seasonDesc} 타입`;
    }

    // 유틸리티 메서드
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    // 성능 최적화를 위한 캐싱
    enableCache() {
        this.cache = new Map();
    }

    disableCache() {
        this.cache = null;
    }

    getCachedResult(key, computeFn) {
        if (!this.cache) return computeFn();
        
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }
        
        const result = computeFn();
        this.cache.set(key, result);
        
        // 캐시 크기 제한
        if (this.cache.size > 1000) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        return result;
    }
}
