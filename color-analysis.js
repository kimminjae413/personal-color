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
        if
