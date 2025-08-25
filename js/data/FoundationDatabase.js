// js/data/FoundationDatabase.js - 브랜드별 파운데이션 매칭 시스템

/**
 * 한국 브랜드 특화 파운데이션 데이터베이스
 * CIE L*a*b* 기반 정확한 색상 매칭 시스템
 */
const FOUNDATION_DATABASE = {
    // Spring Light - 밝고 따뜻한 톤
    'Spring Light': {
        base: 'Yellow',
        brightness: '21-23',
        undertone: 'Golden',
        labRange: { L: [68, 75], a: [8, 12], b: [15, 20] },
        skinCharacteristics: ['얇은 피부', '따뜻한 혈색', '황금빛 언더톤'],
        brands: {
            'VDL': {
                name: '퍼펙팅 라스트 파운데이션',
                shade: 'A21 Apricot Beige',
                price: 38000,
                coverage: 'Medium',
                finish: 'Natural',
                labValues: { L: 68.5, a: 10.2, b: 17.8 },
                hexColor: '#F5DEB3',
                matchScore: 95,
                spf: 'SPF 25 PA++',
                volume: '30ml',
                bestFor: ['일상', '데이트'],
                pros: ['자연스러운 커버력', '촉촉한 마감', '하루 종일 지속'],
                cons: ['기름진 피부에는 무거울 수 있음']
            },
            '에스쁘아': {
                name: '프로 테일러 파운데이션',
                shade: 'Honey Beige',
                price: 32000,
                coverage: 'Full',
                finish: 'Semi-Matte',
                labValues: { L: 67.2, a: 9.8, b: 18.2 },
                hexColor: '#F4E4BC',
                matchScore: 92,
                spf: 'SPF 34 PA+++',
                volume: '30ml',
                bestFor: ['직장', '중요한 미팅'],
                pros: ['완벽한 커버력', '12시간 지속', '포토제닉'],
                cons: ['건조한 피부에는 각질 부각 가능']
            },
            '로레알': {
                name: '트루 매치 파운데이션',
                shade: 'W3 Golden Sand',
                price: 24000,
                coverage: 'Medium',
                finish: 'Natural',
                labValues: { L: 69.1, a: 11.1, b: 16.9 },
                hexColor: '#F6E5C3',
                matchScore: 89,
                spf: 'SPF 17',
                volume: '30ml',
                bestFor: ['일상', '학교'],
                pros: ['가성비 우수', '자연스러운 표현', '다양한 색상'],
                cons: ['지속력이 다소 아쉬움']
            },
            '메이크업포에버': {
                name: 'Ultra HD 파운데이션',
                shade: 'Y315 Sand',
                price: 65000,
                coverage: 'Medium to Full',
                finish: 'Natural',
                labValues: { L: 68.8, a: 10.5, b: 17.5 },
                hexColor: '#F5E2C1',
                matchScore: 94,
                spf: 'SPF 15',
                volume: '30ml',
                bestFor: ['화보', '웨딩', '특별한 날'],
                pros: ['HD 화질 대응', '프로 메이킵 수준', '완벽한 블렌딩'],
                cons: ['고가', '초보자에게는 어려울 수 있음']
            },
            '이니스프리': {
                name: '마이 파운데이션',
                shade: '21호 바닐라',
                price: 18000,
                coverage: 'Light to Medium',
                finish: 'Natural',
                labValues: { L: 69.5, a: 9.5, b: 18.0 },
                hexColor: '#F6E6C4',
                matchScore: 87,
                spf: 'SPF 30 PA++',
                volume: '30ml',
                bestFor: ['일상', '가벼운 메이크업'],
                pros: ['착한 가격', '제주 성분', '가벼운 발림성'],
                cons: ['커버력 한계', '지속력 보통']
            }
        }
    },

    // Summer Light - 밝고 차가운 톤
    'Summer Light': {
        base: 'Pink',
        brightness: '21-23',
        undertone: 'Rosy',
        labRange: { L: [70, 78], a: [12, 16], b: [5, 12] },
        skinCharacteristics: ['투명한 피부', '핑크빛 혈색', '쿨 언더톤'],
        brands: {
            'VDL': {
                name: '퍼펙팅 라스트 파운데이션',
                shade: 'P21 Pink Beige',
                price: 38000,
                coverage: 'Medium',
                finish: 'Dewy',
                labValues: { L: 70.2, a: 14.1, b: 8.3 },
                hexColor: '#F5E6E8',
                matchScore: 96,
                spf: 'SPF 25 PA++',
                volume: '30ml',
                bestFor: ['데이트', '로맨틱 룩'],
                pros: ['자연스러운 윤광', '핑크 톤 보정', '촉촉함'],
                cons: ['지성 피부에는 번들거림 가능']
            },
            '헤라': {
                name: 'UV 미스트 쿠션',
                shade: '21호 바닐라',
                price: 52000,
                coverage: 'Medium',
                finish: 'Luminous',
                labValues: { L: 71.5, a: 13.8, b: 9.1 },
                hexColor: '#F6E7E9',
                matchScore: 93,
                spf: 'SPF 50+ PA+++',
                volume: '15g',
                bestFor: ['야외 활동', '여행'],
                pros: ['높은 자외선 차단', '윤광 표현', '간편함'],
                cons: ['리필 교체 필요', '상대적 고가']
            },
            '아이오페': {
                name: '에어핏 선쿠션',
                shade: '21 바닐라',
                price: 45000,
                coverage: 'Light to Medium',
                finish: 'Natural',
                labValues: { L: 72.0, a: 13.2, b: 7.8 },
                hexColor: '#F7E8EA',
                matchScore: 91,
                spf: 'SPF 50+ PA+++',
                volume: '15g',
                bestFor: ['일상', '오피스'],
                pros: ['바이오 성분', '자연스러운 커버', '피부 진정'],
                cons: ['커버력 한계']
            }
        }
    },

    // Spring True - 선명하고 따뜻한 톤
    'Spring True': {
        base: 'Yellow',
        brightness: '23-25',
        undertone: 'Warm Golden',
        labRange: { L: [60, 68], a: [10, 15], b: [18, 25] },
        skinCharacteristics: ['건강한 피부', '따뜻한 골든 톤', '생기 있는 혈색'],
        brands: {
            '에스쁘아': {
                name: '프로 테일러 파운데이션',
                shade: 'Golden Beige',
                price: 32000,
                coverage: 'Full',
                finish: 'Semi-Matte',
                labValues: { L: 64.2, a: 12.5, b: 21.3 },
                hexColor: '#E8D5A6',
                matchScore: 94,
                spf: 'SPF 34 PA+++',
                volume: '30ml',
                bestFor: ['비즈니스', '프레젠테이션'],
                pros: ['강한 커버력', '오래 지속', '매트 마감'],
                cons: ['건조할 수 있음', '두꺼워 보일 수 있음']
            },
            '랑콤': {
                name: '땡 아이돌 울트라 웨어',
                shade: '03 Beige Diaphane',
                price: 68000,
                coverage: 'Full',
                finish: 'Matte',
                labValues: { L: 63.8, a: 11.9, b: 22.1 },
                hexColor: '#E7D4A5',
                matchScore: 92,
                spf: 'SPF 38 PA+++',
                volume: '30ml',
                bestFor: ['중요한 행사', '웨딩'],
                pros: ['24시간 지속', '완벽한 커버', '럭셔리 브랜드'],
                cons: ['높은 가격', '건조한 피부에는 부적합']
            }
        }
    },

    // Summer True - 중간 차가운 톤
    'Summer True': {
        base: 'Neutral Pink',
        brightness: '23-25', 
        undertone: 'Cool Neutral',
        labRange: { L: [55, 65], a: [8, 14], b: [2, 8] },
        skinCharacteristics: ['중성적 피부', '은은한 핑크 톤', '세련된 느낌'],
        brands: {
            '슈에무라': {
                name: '언리미티드 파운데이션',
                shade: '764 Medium Light Sand',
                price: 72000,
                coverage: 'Medium to Full',
                finish: 'Natural',
                labValues: { L: 60.5, a: 10.8, b: 5.2 },
                hexColor: '#E6D8D0',
                matchScore: 95,
                spf: 'SPF 24 PA+++',
                volume: '35ml',
                bestFor: ['아티스틱 메이크업', '포토슈트'],
                pros: ['예술가급 품질', '완벽한 블렌딩', '자연스러운 마감'],
                cons: ['고가', '전문적 기술 필요']
            },
            '클리니크': {
                name: '이븐 베터 파운데이션',
                shade: 'WN 46 Golden Neutral',
                price: 55000,
                coverage: 'Medium',
                finish: 'Natural',
                labValues: { L: 59.8, a: 11.2, b: 4.8 },
                hexColor: '#E5D7CF',
                matchScore: 88,
                spf: 'SPF 15',
                volume: '30ml',
                bestFor: ['센시티브 스킨', '일상'],
                pros: ['저자극', '피부 개선', '자연스러운 커버'],
                cons: ['커버력 제한', '지속력 보통']
            }
        }
    },

    // Winter Deep - 깊고 차가운 톤
    'Winter Deep': {
        base: 'Neutral',
        brightness: '25-27',
        undertone: 'Cool Deep',
        labRange: { L: [30, 40], a: [5, 12], b: [-10, 0] },
        skinCharacteristics: ['깊은 피부', '강렬한 대비', '쿨 언더톤'],
        brands: {
            '메이크업포에버': {
                name: 'Ultra HD 파운데이션',
                shade: 'Y445 Amber',
                price: 65000,
                coverage: 'Full',
                finish: 'Natural',
                labValues: { L: 35.2, a: 8.5, b: -3.2 },
                hexColor: '#B89080',
                matchScore: 93,
                spf: 'SPF 15',
                volume: '30ml',
                bestFor: ['드라마틱 룩', '이브닝'],
                pros: ['완벽한 색상 매칭', 'HD 대응', '프로급 마감'],
                cons: ['고가', '전문가 추천 필요']
            }
        }
    }
};

/**
 * 파운데이션 매칭 및 추천 시스템
 */
class FoundationMatcher {
    constructor() {
        this.database = FOUNDATION_DATABASE;
        this.colorMeasurement = new ColorMeasurement();
        
        // 가격대별 분류
        this.priceRanges = {
            budget: [0, 25000],        // 저가
            mid: [25000, 45000],       // 중가
            premium: [45000, 65000],   // 프리미엄
            luxury: [65000, Infinity]  // 럭셔리
        };

        // 사용 목적별 가중치
        this.usagePriority = {
            daily: { coverage: 0.2, longevity: 0.3, price: 0.3, finish: 0.2 },
            work: { coverage: 0.3, longevity: 0.4, price: 0.1, finish: 0.2 },
            special: { coverage: 0.4, longevity: 0.3, price: 0.1, finish: 0.2 },
            photo: { coverage: 0.5, longevity: 0.2, price: 0.1, finish: 0.2 }
        };
    }

    /**
     * 개인화된 파운데이션 추천
     * @param {string} personalColorType - 퍼스널컬러 타입
     * @param {object} userLab - 사용자 Lab 값
     * @param {object} preferences - 사용자 선호도
     * @returns {Array} 추천 제품 목록
     */
    recommendFoundations(personalColorType, userLab = null, preferences = {}) {
        console.log(`파운데이션 추천 시작: ${personalColorType}`, preferences);
        
        const seasonData = this.database[personalColorType];
        if (!seasonData) {
            console.warn(`지원되지 않는 퍼스널컬러 타입: ${personalColorType}`);
            return [];
        }

        let recommendations = [];
        
        // 1. 기본 색상 매칭 점수 계산
        Object.values(seasonData.brands).forEach(product => {
            let baseScore = product.matchScore;
            
            // 2. Lab 값이 있으면 정밀 매칭
            if (userLab) {
                const colorSimilarity = this.colorMeasurement.calculateMatchingScore(
                    userLab, 
                    product.labValues
                );
                baseScore = Math.round((baseScore * 0.6) + (colorSimilarity * 0.4));
            }
            
            // 3. 사용자 선호도 반영
            let finalScore = this.applyUserPreferences(product, baseScore, preferences);
            
            // 4. 개인화된 추천 사유 생성
            const reason = this.generateRecommendationReason(product, personalColorType, preferences);
            
            recommendations.push({
                ...product,
                baseScore: baseScore,
                finalScore: Math.round(finalScore),
                reason: reason,
                priceCategory: this.getPriceCategory(product.price),
                labMatch: userLab ? this.colorMeasurement.calculateMatchingScore(userLab, product.labValues) : null
            });
        });

        // 5. 최종 점수순 정렬 및 상위 제품 반환
        const sortedRecommendations = recommendations
            .sort((a, b) => b.finalScore - a.finalScore)
            .slice(0, Math.min(5, recommendations.length));
            
        console.log('파운데이션 추천 완료:', sortedRecommendations.length + '개 제품');
        return sortedRecommendations;
    }

    /**
     * 사용자 선호도를 점수에 반영
     * @param {object} product - 제품 정보
     * @param {number} baseScore - 기본 점수
     * @param {object} preferences - 사용자 선호도
     * @returns {number} 조정된 점수
     */
    applyUserPreferences(product, baseScore, preferences) {
        let score = baseScore;
        
        // 가격대 선호도
        if (preferences.priceRange) {
            const priceScore = this.calculatePriceScore(product.price, preferences.priceRange);
            score *= priceScore;
        }
        
        // 커버리지 선호도
        if (preferences.coverage) {
            const coverageScore = this.calculateCoverageScore(product.coverage, preferences.coverage);
            score *= coverageScore;
        }
        
        // 마감 선호도
        if (preferences.finish) {
            const finishScore = this.calculateFinishScore(product.finish, preferences.finish);
            score *= finishScore;
        }
        
        // 사용 목적별 조정
        if (preferences.usage) {
            const usageScore = this.calculateUsageScore(product, preferences.usage);
            score *= usageScore;
        }
        
        // SPF 선호도
        if (preferences.spfRequired && product.spf) {
            const spfLevel = this.extractSPFLevel(product.spf);
            if (spfLevel >= 30) score *= 1.1;
            if (spfLevel >= 50) score *= 1.15;
        }
        
        return Math.min(100, score); // 최대 100점으로 제한
    }

    /**
     * 가격 점수 계산
     * @param {number} productPrice - 제품 가격
     * @param {string} preferredRange - 선호 가격대
     * @returns {number} 가격 점수 (0.7-1.2)
     */
    calculatePriceScore(productPrice, preferredRange) {
        const range = this.priceRanges[preferredRange];
        if (!range) return 1.0;
        
        if (productPrice >= range[0] && productPrice < range[1]) {
            return 1.1; // 선호 가격대이면 10% 보너스
        } else if (productPrice < range[0]) {
            return 1.05; // 예산보다 저렴하면 5% 보너스
        } else {
            return 0.85; // 예산 초과시 15% 감점
        }
    }

    /**
     * 커버리지 점수 계산
     * @param {string} productCoverage - 제품 커버리지
     * @param {string} preferredCoverage - 선호 커버리지
     * @returns {number} 커버리지 점수 (0.8-1.2)
     */
    calculateCoverageScore(productCoverage, preferredCoverage) {
        const coverageMap = {
            'Light': 1,
            'Light to Medium': 1.5,
            'Medium': 2,
            'Medium to Full': 2.5,
            'Full': 3
        };
        
        const productLevel = coverageMap[productCoverage] || 2;
        const preferredLevel = coverageMap[preferredCoverage] || 2;
        
        const difference = Math.abs(productLevel - preferredLevel);
        
        if (difference === 0) return 1.2;      // 정확히 일치
        if (difference <= 0.5) return 1.1;    // 거의 일치
        if (difference <= 1) return 1.0;      // 보통
        return 0.8;                           // 차이가 큼
    }

    /**
     * 마감 점수 계산
     * @param {string} productFinish - 제품 마감
     * @param {string} preferredFinish - 선호 마감
     * @returns {number} 마감 점수 (0.9-1.1)
     */
    calculateFinishScore(productFinish, preferredFinish) {
        // 정확히 일치하면 보너스
        if (productFinish.toLowerCase().includes(preferredFinish.toLowerCase())) {
            return 1.1;
        }
        
        // 호환 가능한 조합
        const compatibleFinishes = {
            'natural': ['dewy', 'luminous'],
            'matte': ['semi-matte'],
            'dewy': ['natural', 'luminous']
        };
        
        const compatible = compatibleFinishes[preferredFinish.toLowerCase()] || [];
        if (compatible.some(finish => productFinish.toLowerCase().includes(finish))) {
            return 1.05;
        }
        
        return 0.95; // 약간 다르면 소폭 감점
    }

    /**
     * 사용 목적별 점수 계산
     * @param {object} product - 제품 정보
     * @param {string} usage - 사용 목적
     * @returns {number} 사용 목적 점수
     */
    calculateUsageScore(product, usage) {
        const priorities = this.usagePriority[usage];
        if (!priorities) return 1.0;
        
        let score = 1.0;
        
        // 일상용: 가격과 자연스러움 중시
        if (usage === 'daily' && product.price <= 40000) {
            score += 0.1;
        }
        
        // 업무용: 지속력과 커버력 중시
        if (usage === 'work' && product.coverage.includes('Full')) {
            score += 0.1;
        }
        
        // 특별한 날: 커버력과 마감 중시
        if (usage === 'special' && product.matchScore >= 90) {
            score += 0.15;
        }
        
        return Math.min(1.2, score);
    }

    /**
     * SPF 수치 추출
     * @param {string} spfText - SPF 텍스트
     * @returns {number} SPF 수치
     */
    extractSPFLevel(spfText) {
        const match = spfText.match(/SPF\s*(\d+)/i);
        return match ? parseInt(match[1]) : 0;
    }

    /**
     * 가격 카테고리 판정
     * @param {number} price - 제품 가격
     * @returns {string} 가격 카테고리
     */
    getPriceCategory(price) {
        if (price < this.priceRanges.budget[1]) return 'budget';
        if (price < this.priceRanges.mid[1]) return 'mid';
        if (price < this.priceRanges.premium[1]) return 'premium';
        return 'luxury';
    }

    /**
     * 추천 사유 생성
     * @param {object} product - 제품 정보
     * @param {string} personalColorType - 퍼스널컬러 타입
     * @param {object} preferences - 사용자 선호도
     * @returns {string} 추천 사유
     */
    generateRecommendationReason(product, personalColorType, preferences) {
        const seasonData = this.database[personalColorType];
        let reasons = [];
        
        // 색상 매칭
        if (product.matchScore >= 90) {
            reasons.push(`${seasonData.undertone} 언더톤에 ${product.matchScore}% 매칭`);
        }
        
        // 가격대
        const priceCategory = this.getPriceCategory(product.price);
        if (preferences.priceRange === priceCategory) {
            reasons.push('선호 가격대');
        }
        
        // 커버리지
        if (preferences.coverage && product.coverage.includes(preferences.coverage)) {
            reasons.push('원하는 커버리지');
        }
        
        // 특별한 장점
        if (product.pros && product.pros.length > 0) {
            reasons.push(product.pros[0]); // 첫 번째 장점 추가
        }
        
        // SPF
        if (preferences.spfRequired && this.extractSPFLevel(product.spf) >= 30) {
            reasons.push('높은 자외선 차단');
        }
        
        return reasons.length > 0 ? reasons.join(', ') : '색상 매칭 우수';
    }

    /**
     * 색상 시각화 데이터 생성
     * @param {Array} recommendations - 추천 제품 목록
     * @returns {object} 시각화 데이터
     */
    generateVisualizationData(recommendations) {
        return {
            colorWheel: recommendations.map(product => ({
                name: product.shade,
                hex: product.hexColor,
                lab: product.labValues,
                score: product.finalScore
            })),
            priceChart: recommendations.map(product => ({
                name: product.name,
                price: product.price,
                score: product.finalScore,
                category: this.getPriceCategory(product.price)
            })),
            featureComparison: recommendations.map(product => ({
                name: product.shade,
                coverage: product.coverage,
                finish: product.finish,
                longevity: this.estimateLongevity(product),
                score: product.finalScore
            }))
        };
    }

    /**
     * 지속력 추정 (제품 정보 기반)
     * @param {object} product - 제품 정보
     * @returns {number} 지속력 점수 (1-10)
     */
    estimateLongevity(product) {
        let score = 5; // 기본 점수
        
        if (product.coverage === 'Full') score += 2;
        if (product.finish.includes('Matte')) score += 1.5;
        if (product.price > 50000) score += 1; // 고가 제품은 일반적으로 지속력이 좋음
        if (product.pros.some(pro => pro.includes('지속'))) score += 2;
        
        return Math.min(10, Math.round(score));
    }
}

// 전역 사용을 위한 윈도우 객체에 등록
if (typeof window !== 'undefined') {
    window.FOUNDATION_DATABASE = FOUNDATION_DATABASE;
    window.FoundationMatcher = FoundationMatcher;
    console.log('FoundationMatcher 모듈 로딩 완료');
}

// Node.js 환경 지원
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FOUNDATION_DATABASE, FoundationMatcher };
}
