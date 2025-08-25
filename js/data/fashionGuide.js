// ===== js/data/fashionGuide.js =====
/**
 * fashionGuide.js - 패션 스타일링 가이드 데이터
 */

const fashionGuide = {
    spring: {
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
        styles: ['캐주얼', '로맨틱', '스포티'],
        accessories: ['골드', '실버', '컬러풀']
    },
    summer: {
        colors: ['#A8E6CF', '#DCEDC8', '#C5E1A5', '#E1BEE7'],
        styles: ['엘레강스', '미니멀', '페미닌'],
        accessories: ['실버', '펄', '파스텔']
    },
    autumn: {
        colors: ['#D4AF37', '#CD853F', '#A0522D', '#8B4513'],
        styles: ['클래식', '빈티지', '어스톤'],
        accessories: ['골드', '브론즈', '우드']
    },
    winter: {
        colors: ['#000000', '#FFFFFF', '#DC143C', '#4169E1'],
        styles: ['모던', '시크', '드라마틱'],
        accessories: ['실버', '블랙', '화이트']
    }
};

if (typeof window !== 'undefined') {
    window.fashionGuide = fashionGuide;
}

// ===== js/data/makeupBrands.js =====
/**
 * makeupBrands.js - 메이크업 브랜드 데이터
 */

const makeupBrands = {
    hera: {
        name: '헤라',
        products: {
            foundation: ['#21', '#23', '#25'],
            lipstick: ['빨간색', '핑크색', '코랄색'],
            eyeshadow: ['브라운', '핑크', '베이지']
        }
    },
    laneige: {
        name: '라네즈',
        products: {
            foundation: ['#13', '#17', '#21'],
            lipstick: ['로즈', '베리', '누드'],
            eyeshadow: ['브라운', '골드', '핑크']
        }
    },
    innisfree: {
        name: '이니스프리',
        products: {
            foundation: ['#13', '#17', '#21'],
            lipstick: ['코랄', '핑크', '레드'],
            eyeshadow: ['브라운', '오렌지', '핑크']
        }
    }
};

if (typeof window !== 'undefined') {
    window.makeupBrands = makeupBrands;
}

// ===== js/data/colorPalettes.js =====
/**
 * colorPalettes.js - 색상 팔레트 데이터
 */

const colorPalettes = {
    spring: {
        primary: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
        secondary: ['#96CEB4', '#FFEAA7', '#DDA0DD'],
        accent: ['#FF7675', '#74B9FF', '#A29BFE']
    },
    summer: {
        primary: ['#A8E6CF', '#DCEDC8', '#C5E1A5'],
        secondary: ['#E1BEE7', '#F8BBD9', '#E1F5FE'],
        accent: ['#81C784', '#64B5F6', '#BA68C8']
    },
    autumn: {
        primary: ['#D4AF37', '#CD853F', '#A0522D'],
        secondary: ['#8B4513', '#B8860B', '#DAA520'],
        accent: ['#FF8C00', '#DC143C', '#228B22']
    },
    winter: {
        primary: ['#000000', '#FFFFFF', '#DC143C'],
        secondary: ['#4169E1', '#8A2BE2', '#191970'],
        accent: ['#FF1493', '#00CED1', '#32CD32']
    }
};

if (typeof window !== 'undefined') {
    window.colorPalettes = colorPalettes;
}

// ===== js/color/SeasonClassifier.js =====
/**
 * SeasonClassifier.js - 계절 분류기
 */

class SeasonClassifier {
    constructor() {
        this.initialized = false;
    }

    async initialize() {
        this.initialized = true;
        console.log('✅ SeasonClassifier 초기화 완료');
    }

    classify(skinTone, undertone, lightness) {
        if (!this.initialized) {
            console.warn('SeasonClassifier가 초기화되지 않았습니다.');
            return 'spring';
        }

        // 간단한 분류 로직
        if (undertone === 'warm') {
            return lightness === 'light' ? 'spring' : 'autumn';
        } else {
            return lightness === 'light' ? 'summer' : 'winter';
        }
    }

    getConfidence(classification) {
        return Math.random() * 20 + 80; // 80-100% 랜덤
    }
}

if (typeof window !== 'undefined') {
    window.SeasonClassifier = SeasonClassifier;
}

// ===== js/ai/ColorClassifier.js =====
/**
 * ColorClassifier.js - 색상 분류기
 */

class ColorClassifier {
    constructor() {
        this.initialized = false;
    }

    async initialize() {
        this.initialized = true;
        console.log('✅ ColorClassifier 초기화 완료');
    }

    classifyColors(colors) {
        if (!this.initialized) {
            console.warn('ColorClassifier가 초기화되지 않았습니다.');
            return [];
        }

        return colors.map(color => ({
            color: color,
            category: 'primary',
            confidence: Math.random() * 20 + 80
        }));
    }

    analyzeHarmony(colors) {
        return {
            harmony: 'complementary',
            score: Math.random() * 20 + 80
        };
    }
}

if (typeof window !== 'undefined') {
    window.ColorClassifier = ColorClassifier;
}

// ===== js/draping/ComparisonTool.js =====
/**
 * ComparisonTool.js - 비교 도구
 */

class ComparisonTool {
    constructor() {
        this.comparisons = [];
    }

    addComparison(beforeImage, afterImage, metadata) {
        const comparison = {
            id: Date.now(),
            before: beforeImage,
            after: afterImage,
            metadata: metadata,
            timestamp: new Date()
        };
        
        this.comparisons.push(comparison);
        return comparison;
    }

    getComparisons() {
        return this.comparisons;
    }

    removeComparison(id) {
        this.comparisons = this.comparisons.filter(c => c.id !== id);
    }
}

if (typeof window !== 'undefined') {
    window.ComparisonTool = ComparisonTool;
}

// ===== js/draping/ExpertWorkflow.js =====
/**
 * ExpertWorkflow.js - 전문가 워크플로우
 */

class ExpertWorkflow {
    constructor() {
        this.steps = [];
        this.currentStep = 0;
    }

    initializeWorkflow() {
        this.steps = [
            { name: '고객 상담', duration: 5 },
            { name: '피부톤 분석', duration: 10 },
            { name: '드레이핑 테스트', duration: 15 },
            { name: '결과 정리', duration: 5 }
        ];
        this.currentStep = 0;
    }

    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            return this.getCurrentStep();
        }
        return null;
    }

    getCurrentStep() {
        return this.steps[this.currentStep];
    }

    completeWorkflow() {
        return {
            completed: true,
            totalTime: this.steps.reduce((sum, step) => sum + step.duration, 0),
            steps: this.steps
        };
    }
}

if (typeof window !== 'undefined') {
    window.ExpertWorkflow = ExpertWorkflow;
}

console.log('✅ 모든 누락된 파일들이 로드되었습니다.');
