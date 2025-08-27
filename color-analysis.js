// 색상 분석 및 Delta E 2000 계산 시스템
class ColorAnalysis {
    // RGB to LAB 변환 (정확한 CIE 변환)
    static rgbToLab(r, g, b) {
        // RGB to XYZ 변환
        let rLinear = r / 255;
        let gLinear = g / 255;
        let bLinear = b / 255;
        
        // sRGB 감마 보정
        rLinear = rLinear > 0.04045 ? Math.pow((rLinear + 0.055) / 1.055, 2.4) : rLinear / 12.92;
        gLinear = gLinear > 0.04045 ? Math.pow((gLinear + 0.055) / 1.055, 2.4) : gLinear / 12.92;
        bLinear = bLinear > 0.04045 ? Math.pow((bLinear + 0.055) / 1.055, 2.4) : bLinear / 12.92;
        
        // Observer = 2°, Illuminant = D65
        let x = rLinear * 0.4124564 + gLinear * 0.3575761 + bLinear * 0.1804375;
        let y = rLinear * 0.2126729 + gLinear * 0.7151522 + bLinear * 0.0721750;
        let z = rLinear * 0.0193339 + gLinear * 0.1191920 + bLinear * 0.9503041;
        
        // XYZ to LAB 변환
        const xn = 0.95047; // D65 illuminant
        const yn = 1.00000;
        const zn = 1.08883;
        
        x = x / xn;
        y = y / yn;
        z = z / zn;
        
        const fx = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x + 16/116);
        const fy = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y + 16/116);
        const fz = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z + 16/116);
        
        const l = 116 * fy - 16;
        const a = 500 * (fx - fy);
        const b_val = 200 * (fy - fz);
        
        return { l, a, b: b_val };
    }
    
    // Delta E 2000 계산 (국제 표준)
    static calculateDeltaE2000(lab1, lab2) {
        const { l: l1, a: a1, b: b1 } = lab1;
        const { l: l2, a: a2, b: b2 } = lab2;
        
        // Calculate Chroma and Hue
        const c1 = Math.sqrt(a1 * a1 + b1 * b1);
        const c2 = Math.sqrt(a2 * a2 + b2 * b2);
        
        const cAvg = (c1 + c2) / 2;
        
        const g = 0.5 * (1 - Math.sqrt(Math.pow(cAvg, 7) / (Math.pow(cAvg, 7) + Math.pow(25, 7))));
        
        const a1Prime = a1 * (1 + g);
        const a2Prime = a2 * (1 + g);
        
        const c1Prime = Math.sqrt(a1Prime * a1Prime + b1 * b1);
        const c2Prime = Math.sqrt(a2Prime * a2Prime + b2 * b2);
        
        const h1Prime = Math.atan2(b1, a1Prime) * 180 / Math.PI;
        const h2Prime = Math.atan2(b2, a2Prime) * 180 / Math.PI;
        
        const deltaL = l2 - l1;
        const deltaC = c2Prime - c1Prime;
        
        let deltaH;
        if (c1Prime * c2Prime === 0) {
            deltaH = 0;
        } else {
            if (Math.abs(h2Prime - h1Prime) <= 180) {
                deltaH = h2Prime - h1Prime;
            } else if (h2Prime - h1Prime > 180) {
                deltaH = h2Prime - h1Prime - 360;
            } else {
                deltaH = h2Prime - h1Prime + 360;
            }
        }
        
        const deltaHPrime = 2 * Math.sqrt(c1Prime * c2Prime) * Math.sin(deltaH * Math.PI / 360);
        
        const lAvg = (l1 + l2) / 2;
        const cPrimeAvg = (c1Prime + c2Prime) / 2;
        
        let hPrimeAvg;
        if (c1Prime * c2Prime === 0) {
            hPrimeAvg = h1Prime + h2Prime;
        } else {
            if (Math.abs(h1Prime - h2Prime) <= 180) {
                hPrimeAvg = (h1Prime + h2Prime) / 2;
            } else if (Math.abs(h1Prime - h2Prime) > 180 && (h1Prime + h2Prime) < 360) {
                hPrimeAvg = (h1Prime + h2Prime + 360) / 2;
            } else {
                hPrimeAvg = (h1Prime + h2Prime - 360) / 2;
            }
        }
        
        const t = 1 - 0.17 * Math.cos((hPrimeAvg - 30) * Math.PI / 180) +
                 0.24 * Math.cos(2 * hPrimeAvg * Math.PI / 180) +
                 0.32 * Math.cos((3 * hPrimeAvg + 6) * Math.PI / 180) -
                 0.20 * Math.cos((4 * hPrimeAvg - 63) * Math.PI / 180);
        
        const sl = 1 + (0.015 * Math.pow(lAvg - 50, 2)) / Math.sqrt(20 + Math.pow(lAvg - 50, 2));
        const sc = 1 + 0.045 * cPrimeAvg;
        const sh = 1 + 0.015 * cPrimeAvg * t;
        
        const deltaTheta = 30 * Math.exp(-Math.pow((hPrimeAvg - 275) / 25, 2));
        const rc = 2 * Math.sqrt(Math.pow(cPrimeAvg, 7) / (Math.pow(cPrimeAvg, 7) + Math.pow(25, 7)));
        const rt = -rc * Math.sin(2 * deltaTheta * Math.PI / 180);
        
        const kl = 1, kc = 1, kh = 1;
        
        const deltaE = Math.sqrt(
            Math.pow(deltaL / (kl * sl), 2) +
            Math.pow(deltaC / (kc * sc), 2) +
            Math.pow(deltaHPrime / (kh * sh), 2) +
            rt * (deltaC / (kc * sc)) * (deltaHPrime / (kh * sh))
        );
        
        return deltaE;
    }
    
    // 퍼스널컬러 기준 LAB 값들 (논문 데이터 기반)
    static getSeasonReferenceLab() {
        return {
            spring: [
                { l: 65, a: 12, b: 18, name: '밝은 웜톤' },
                { l: 70, a: 8, b: 22, name: '선명한 웜톤' },
                { l: 68, a: 10, b: 25, name: '활기찬 웜톤' }
            ],
            summer: [
                { l: 62, a: 2, b: 8, name: '부드러운 쿨톤' },
                { l: 65, a: -2, b: 12, name: '차분한 쿨톤' },
                { l: 60, a: 1, b: 6, name: '우아한 쿨톤' }
            ],
            autumn: [
                { l: 55, a: 15, b: 30, name: '깊은 웜톤' },
                { l: 58, a: 18, b: 35, name: '풍부한 웜톤' },
                { l: 52, a: 12, b: 28, name: '성숙한 웜톤' }
            ],
            winter: [
                { l: 50, a: 5, b: -2, name: '강렬한 쿨톤' },
                { l: 48, a: 8, b: 2, name: '드라마틱 쿨톤' },
                { l: 55, a: 3, b: -5, name: '선명한 쿨톤' }
            ]
        };
    }
    
    // 메인 퍼스널컬러 분석 함수
    static analyzePersonalColor(rgbColor, labColor) {
        const { r, g, b } = rgbColor;
        const { l, a, b: b_val } = labColor;
        
        const seasons = this.getSeasonReferenceLab();
        const results = {};
        
        // 각 계절별 Delta E 계산
        Object.keys(seasons).forEach(season => {
            const seasonRef = seasons[season];
            let minDeltaE = Infinity;
            let bestMatch = null;
            
            seasonRef.forEach(ref => {
                const deltaE = this.calculateDeltaE2000(
                    { l, a, b: b_val },
                    { l: ref.l, a: ref.a, b: ref.b }
                );
                
                if (deltaE < minDeltaE) {
                    minDeltaE = deltaE;
                    bestMatch = ref;
                }
            });
            
            results[season] = {
                deltaE: minDeltaE,
                match: bestMatch,
                confidence: this.calculateConfidence(minDeltaE)
            };
        });
        
        // 가장 적합한 계절 찾기
        let bestSeason = null;
        let bestDeltaE = Infinity;
        
        Object.keys(results).forEach(season => {
            if (results[season].deltaE < bestDeltaE) {
                bestDeltaE = results[season].deltaE;
                bestSeason = season;
            }
        });
        
        // 웜톤/쿨톤 분석
        const isWarm = this.isWarmTone(rgbColor, labColor);
        const undertone = this.analyzeUndertone(rgbColor);
        
        return {
            primarySeason: bestSeason,
            deltaE: bestDeltaE,
            confidence: results[bestSeason].confidence,
            isWarm: isWarm,
            undertone: undertone,
            allResults: results,
            labValues: labColor,
            rgbValues: rgbColor
        };
    }
    
    // 신뢰도 계산 (Delta E 기반)
    static calculateConfidence(deltaE) {
        // Delta E 2000 기준:
        // 0-1: 감지 불가능한 차이 (100%)
        // 1-2: 약간 감지 가능 (95%)
        // 2-10: 감지 가능 (90-70%)
        // 10-49: 명확한 차이 (70-30%)
        // 50+: 매우 큰 차이 (30% 이하)
        
        if (deltaE <= 1) return 100;
        if (deltaE <= 2) return 95;
        if (deltaE <= 5) return 90;
        if (deltaE <= 10) return Math.max(70, 90 - (deltaE - 5) * 4);
        if (deltaE <= 20) return Math.max(50, 70 - (deltaE - 10) * 2);
        if (deltaE <= 50) return Math.max(30, 50 - (deltaE - 20));
        return 30;
    }
    
    // 웜톤/쿨톤 판별 (논문 알고리즘)
    static isWarmTone(rgbColor, labColor) {
        const { r, g, b } = rgbColor;
        const { l, a, b: b_val } = labColor;
        
        // 여러 지표를 종합하여 판별
        const indicators = [];
        
        // 1. RGB 비율 분석
        const rg_ratio = r / (g + 1);
        const rb_ratio = r / (b + 1);
        indicators.push(rg_ratio > 1.1 && rb_ratio > 1.2);
        
        // 2. LAB a*b* 값 분석
        indicators.push(a > 5 && b_val > 10); // 웜톤 영역
        
        // 3. 색상각 분석
        const hue = Math.atan2(b_val, a) * 180 / Math.PI;
        const normalizedHue = hue < 0 ? hue + 360 : hue;
        indicators.push(normalizedHue > 30 && normalizedHue < 120); // 노란색-주황색 영역
        
        // 4. 채도 분석
        const chroma = Math.sqrt(a * a + b_val * b_val);
        indicators.push(chroma > 15); // 웜톤은 일반적으로 채도가 높음
        
        // 과반수 지표가 웜톤을 나타내면 웜톤으로 판별
        const warmCount = indicators.filter(Boolean).length;
        return warmCount >= 2;
    }
    
    // 언더톤 세부 분석
    static analyzeUndertone(rgbColor) {
        const { r, g, b } = rgbColor;
        
        // 피부의 언더톤 분류 (논문 기반)
        const undertones = {
            yellow: (r - g > 10 && r - b > 15),
            pink: (r > g && g > b && r - g < 15),
            peach: (r > g && r > b && g > b && r - g > 5 && r - g < 20),
            olive: (g >= r && g > b),
            neutral: Math.abs(r - g) < 8 && Math.abs(g - b) < 8
        };
        
        // 가장 강한 특성 찾기
        let dominantUndertone = 'neutral';
        Object.keys(undertones).forEach(tone => {
            if (undertones[tone] && tone !== 'neutral') {
                dominantUndertone = tone;
            }
        });
        
        return dominantUndertone;
    }
    
    // 명도 분석 (유이레 노하우 반영)
    static analyzeLightness(labColor, rgbColor) {
        const { l } = labColor;
        const { r, g, b } = rgbColor;
        
        // 명도 카테고리 (유이레 기준)
        let lightnessCategory;
        if (l < 45) lightnessCategory = 'very_dark';
        else if (l < 55) lightnessCategory = 'dark';
        else if (l < 65) lightnessCategory = 'medium';
        else if (l < 75) lightnessCategory = 'light';
        else lightnessCategory = 'very_light';
        
        // 파운데이션 호수 추정 (논문 데이터)
        let foundationShade;
        if (l < 50) foundationShade = '19-21호';
        else if (l < 60) foundationShade = '21-23호';
        else if (l < 70) foundationShade = '23-25호';
        else foundationShade = '25-27호';
        
        return {
            category: lightnessCategory,
            value: l,
            foundationShade: foundationShade,
            recommendation: this.getLightnessRecommendation(lightnessCategory)
        };
    }
    
    static getLightnessRecommendation(category) {
        const recommendations = {
            very_dark: '어두운 피부톤으로 진한 색상이 잘 어울립니다. 대비감을 살린 스타일링을 추천합니다.',
            dark: '중간 어두운 피부톤으로 깊이 있는 색상이 좋습니다.',
            medium: '중간 피부톤으로 다양한 색상을 소화할 수 있습니다.',
            light: '밝은 피부톤으로 파스텔과 선명한 색상 모두 잘 어울립니다.',
            very_light: '매우 밝은 피부톤으로 소프트한 색상이 조화롭습니다.'
        };
        return recommendations[category];
    }
    
    // 채도 분석 (빛날윤 노하우)
    static analyzeChroma(labColor) {
        const { l, a, b } = labColor;
        const chroma = Math.sqrt(a * a + b * b);
        
        let chromaLevel;
        if (chroma < 10) chromaLevel = 'muted';
        else if (chroma < 20) chromaLevel = 'soft';
        else if (chroma < 35) chromaLevel = 'clear';
        else chromaLevel = 'bright';
        
        return {
            level: chromaLevel,
            value: chroma,
            recommendation: this.getChromaRecommendation(chromaLevel)
        };
    }
    
    static getChromaRecommendation(level) {
        const recommendations = {
            muted: '탁한 톤이 어울리므로 스모키하고 차분한 색상을 추천합니다.',
            soft: '부드러운 색상이 조화롭습니다. 파스텔 톤을 활용해보세요.',
            clear: '선명한 색상이 잘 어울립니다. 맑고 깔끔한 톤을 추천합니다.',
            bright: '매우 선명한 색상을 소화할 수 있습니다. 비비드한 컬러에 도전해보세요.'
        };
        return recommendations[level];
    }
    
    // 종합 색상 분석
    static comprehensiveAnalysis(rgbColor, labColor) {
        const basicAnalysis = this.analyzePersonalColor(rgbColor, labColor);
        const lightnessAnalysis = this.analyzeLightness(labColor, rgbColor);
        const chromaAnalysis = this.analyzeChroma(labColor);
        
        return {
            ...basicAnalysis,
            lightness: lightnessAnalysis,
            chroma: chromaAnalysis,
            analysisDate: new Date().toISOString(),
            method: 'ai_comprehensive'
        };
    }
    
    // 색상 시각화를 위한 헬퍼 함수들
    static rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    
    static labToRgb(l, a, b) {
        // LAB to XYZ
        let y = (l + 16) / 116;
        let x = a / 500 + y;
        let z = y - b / 200;
        
        x = 0.95047 * (Math.pow(x, 3) > 0.008856 ? Math.pow(x, 3) : (x - 16/116) / 7.787);
        y = 1.00000 * (Math.pow(y, 3) > 0.008856 ? Math.pow(y, 3) : (y - 16/116) / 7.787);
        z = 1.08883 * (Math.pow(z, 3) > 0.008856 ? Math.pow(z, 3) : (z - 16/116) / 7.787);
        
        // XYZ to RGB
        let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
        let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
        let b_val = x * 0.0557 + y * -0.2040 + z * 1.0570;
        
        // Gamma correction
        r = r > 0.0031308 ? 1.055 * Math.pow(r, 1/2.4) - 0.055 : 12.92 * r;
        g = g > 0.0031308 ? 1.055 * Math.pow(g, 1/2.4) - 0.055 : 12.92 * g;
        b_val = b_val > 0.0031308 ? 1.055 * Math.pow(b_val, 1/2.4) - 0.055 : 12.92 * b_val;
        
        return {
            r: Math.max(0, Math.min(255, Math.round(r * 255))),
            g: Math.max(0, Math.min(255, Math.round(g * 255))),
            b: Math.max(0, Math.min(255, Math.round(b_val * 255)))
        };
    }
    
    // 색상 조화 분석 (고급 기능)
    static analyzeColorHarmony(baseColor, seasonColors) {
        const baseLab = this.rgbToLab(baseColor.r, baseColor.g, baseColor.b);
        const harmonyScores = {};
        
        seasonColors.forEach((color, index) => {
            const colorLab = this.rgbToLab(color.r, color.g, color.b);
            const deltaE = this.calculateDeltaE2000(baseLab, colorLab);
            
            // 조화도 점수 계산 (낮은 Delta E = 높은 조화)
            const harmonyScore = Math.max(0, 100 - deltaE * 2);
            harmonyScores[index] = {
                score: harmonyScore,
                deltaE: deltaE,
                color: color
            };
        });
        
        return harmonyScores;
    }
}
