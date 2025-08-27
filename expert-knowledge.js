/**
 * expert-knowledge.js - 전문가 노하우 규칙 엔진
 * 논문 분석 결과와 유이레/빛날윤/블루미 전문가 노하우 통합
 */

// 1. 논문 기반 기본 이론 정의
const PersonalColorTheory = {
    // 4계절 기본 특성 (논문 기반)
    seasons: {
        spring: {
            name: '봄 (Spring)',
            undertone: 'warm',
            characteristics: {
                dominant: 'clear_bright',
                lightness: 'high',
                saturation: 'high',
                temperature: 'warm'
            },
            skinTone: ['ivory', 'peach', 'golden'],
            eyeColor: ['golden_brown', 'amber', 'warm_hazel'],
            hairColor: ['golden_blonde', 'auburn', 'golden_brown']
        },
        summer: {
            name: '여름 (Summer)', 
            undertone: 'cool',
            characteristics: {
                dominant: 'muted',
                lightness: 'high',
                saturation: 'low',
                temperature: 'cool'
            },
            skinTone: ['rose', 'pink', 'cool_beige'],
            eyeColor: ['blue', 'gray', 'cool_brown'],
            hairColor: ['ash_blonde', 'mouse_brown', 'silver_gray']
        },
        autumn: {
            name: '가을 (Autumn)',
            undertone: 'warm',
            characteristics: {
                dominant: 'deep_muted',
                lightness: 'low',
                saturation: 'high',
                temperature: 'warm'
            },
            skinTone: ['golden', 'bronze', 'olive'],
            eyeColor: ['brown', 'amber', 'deep_green'],
            hairColor: ['copper', 'chestnut', 'dark_brown']
        },
        winter: {
            name: '겨울 (Winter)',
            undertone: 'cool',
            characteristics: {
                dominant: 'clear_deep',
                lightness: 'low',
                saturation: 'high',
                temperature: 'cool'
            },
            skinTone: ['porcelain', 'olive', 'deep_cool'],
            eyeColor: ['dark_brown', 'black', 'deep_blue'],
            hairColor: ['black', 'dark_brown', 'platinum']
        }
    }
};

// 2. 유이레(UIREH) 전문가 노하우
const UirehExpertise = {
    // 헤어컬러 스펙트럼 이론
    colorSpectrum: {
        warmToCool: [
            { name: '매트브라운', tone: 'neutral', warmness: 50 },
            { name: '애쉬브라운', tone: 'cool', warmness: 30 },
            { name: '블루그레이', tone: 'extreme_cool', warmness: 10 }
        ],
        impossibleCombinations: [
            { color: 'orange', tone: 'cool', reason: '주황색은 절대 쿨톤으로 만들 수 없음' }
        ]
    },
    
    // 타입별 실전 추천
    typeRecommendations: {
        winterClear: {
            celebrities: ['조이', '현아'],
            colors: ['vivid_colors', 'bright_tones'],
            hairColors: ['black', 'platinum', 'vivid_red', 'deep_blue'],
            avoidColors: ['muted_tones', 'warm_browns']
        },
        summerMute: {
            colors: ['cool_ash_series'],
            hairColors: ['ash_brown', 'gray_brown', 'cool_beige'],
            technique: 'soft_gradation'
        },
        autumnLight: {
            colors: ['high_lightness'],
            hairColors: ['platinum', 'light_golden', 'bright_copper'],
            technique: 'brightness_matching'
        }
    },
    
    // 명도 매칭 원칙
    lightnessMatching: {
        foundationGuide: {
            '21-23': {
                recommendation: '비슷한 명도의 헤어컬러 회피',
                reason: '단조로운 인상 방지',
                alternative: '대비감 있는 명도 선택'
            }
        }
    },
    
    // 고급 테크닉
    advancedTechniques: {
        ombre: {
            description: '그라데이션 연출',
            bestFor: ['long_hair', 'wave_hair'],
            colorTransition: 'gradual'
        },
        balayage: {
            description: '자연스러운 하이라이트',
            bestFor: ['natural_look', 'low_maintenance']
        },
        lifting: {
            description: '자연스러운 명도 변화',
            technique: 'selective_bleaching'
        }
    }
};

// 3. 빛날윤/차홍아르더 현장 노하우
const BitnalyunExpertise = {
    // 4계절 세분화 접근
    detailedSeasons: {
        warm: {
            hairColors: ['deep_pink_brown', 'gold', 'olive_brown', 'skin_brown'],
            principle: '명도·채도 조합이 이름보다 중요',
            customization: true
        },
        cool: {
            hairColors: ['ash', 'silver_magenta', 'cool_brown', 'ash_gray'],
            principle: '투명감과 청량감 우선',
            customization: true
        }
    },
    
    // 피부 상태별 맞춤 전략
    skinConditionStrategy: {
        redness: {
            problem: '홍조 피부',
            solution: 'midnight_color',
            effect: '중화 효과',
            colors: ['deep_brown', 'dark_ash', 'midnight_blue']
        },
        pale: {
            problem: '창백한 피부',
            solution: 'warm_tone',
            effect: '생기 부여',
            colors: ['golden_brown', 'copper', 'warm_beige']
        },
        yellowish: {
            problem: '황기 피부',
            solution: 'ash_series',
            effect: '투명감 연출',
            colors: ['ash_brown', 'gray_brown', 'cool_beige']
        }
    }
};

// 4. 블루미 퍼스널컬러 실무 경험
const BlumeExpertise = {
    // 타입별 구체적 추천
    specificRecommendations: {
        warm: {
            skinType: 'ivory',
            hairColors: ['cotori_beige', 'orange_brown', 'khaki_red'],
            redVariation: 'orange_red'
        },
        cool: {
            skinType: 'white',
            hairColors: ['blue_black', 'ash_blue', 'violet'],
            redVariation: 'wine_red'
        }
    },
    
    // 특수 상황별 노하우
    specialSituations: {
        bride: {
            situation: '결혼 예비신부',
            recommended: ['ash_brown', 'chocolate_brown', 'purple_brown'],
            reason: '노란기 제거로 깔끔한 인상',
            avoid: ['golden_tones', 'warm_browns']
        },
        blackHair: {
            warning: '쿨톤에게도 부적합할 수 있음',
            risk: '턱선 강조 위험',
            alternative: 'soft_black_or_dark_brown'
        },
        platinumHair: {
            conditions: ['밝은 피부', '저채도 타입'],
            requirement: '메이크업과의 일치성 중요',
            maintenance: 'high'
        }
    }
};

// 5. 논문 기반 과학적 데이터
const ScientificData = {
    // CMYK 값 기반 브랜드 분석 (논문 데이터)
    brandAnalysis: {
        redToneComparison: {
            milbon: { M_value: 93.22, rank: 1 },
            wella: { M_value: 87.17, rank: 2 },
            loreal: { M_value: 80.41, rank: 3 }
        }
    },
    
    // 고객 선택 기준 통계 (논문 데이터)
    customerPreferences: {
        suitableColor: 67,
        favoriteColor: 21,
        designerRecommendation: 7,
        trendyColor: 5
    },
    
    // 만족도 증가율
    satisfactionIncrease: 20,
    
    // 퍼스널컬러 필요성 인식
    necessityRecognition: 72.5
};

// 6. 통합 진단 알고리즘
class PersonalColorExpert {
    constructor() {
        this.theory = PersonalColorTheory;
        this.uireh = UirehExpertise;
        this.bitnalyun = BitnalyunExpertise;
        this.blume = BlumeExpertise;
        this.science = ScientificData;
    }
    
    // 종합 진단 함수
    comprehensiveDiagnosis(skinColor, eyeColor, hairColor, personalFactors = {}) {
        const baseType = this.determineBasicType(skinColor, eyeColor, hairColor);
        const expertAdjustments = this.applyExpertKnowledge(baseType, personalFactors);
        const finalRecommendation = this.generateRecommendation(baseType, expertAdjustments);
        
        return {
            primaryType: baseType,
            adjustments: expertAdjustments,
            recommendation: finalRecommendation,
            confidence: this.calculateConfidence(baseType, expertAdjustments)
        };
    }
    
    // 기본 타입 결정
    determineBasicType(skinColor, eyeColor, hairColor) {
        const scores = {
            spring: 0,
            summer: 0,
            autumn: 0,
            winter: 0
        };
        
        // 피부색 기반 점수 계산
        Object.keys(this.theory.seasons).forEach(season => {
            const seasonData = this.theory.seasons[season];
            if (seasonData.skinTone.some(tone => this.colorMatch(skinColor, tone))) {
                scores[season] += 3;
            }
        });
        
        // 눈동자색 기반 점수 계산
        Object.keys(this.theory.seasons).forEach(season => {
            const seasonData = this.theory.seasons[season];
            if (seasonData.eyeColor.some(color => this.colorMatch(eyeColor, color))) {
                scores[season] += 2;
            }
        });
        
        // 모발색 기반 점수 계산
        Object.keys(this.theory.seasons).forEach(season => {
            const seasonData = this.theory.seasons[season];
            if (seasonData.hairColor.some(color => this.colorMatch(hairColor, color))) {
                scores[season] += 1;
            }
        });
        
        return Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    }
    
    // 전문가 지식 적용
    applyExpertKnowledge(baseType, personalFactors) {
        const adjustments = [];
        
        // 유이레 노하우 적용
        if (personalFactors.foundation && personalFactors.foundation >= 21 && personalFactors.foundation <= 23) {
            adjustments.push({
                source: 'uireh',
                type: 'lightness_matching',
                recommendation: '비슷한 명도 헤어컬러 회피'
            });
        }
        
        // 빛날윤 노하우 적용 - 피부 상태별
        if (personalFactors.skinCondition) {
            const strategy = this.bitnalyun.skinConditionStrategy[personalFactors.skinCondition];
            if (strategy) {
                adjustments.push({
                    source: 'bitnalyun',
                    type: 'skin_condition',
                    problem: strategy.problem,
                    solution: strategy.solution,
                    colors: strategy.colors
                });
            }
        }
        
        // 블루미 노하우 적용 - 특수 상황
        if (personalFactors.situation) {
            const situation = this.blume.specialSituations[personalFactors.situation];
            if (situation) {
                adjustments.push({
                    source: 'blume',
                    type: 'special_situation',
                    situation: situation.situation,
                    recommended: situation.recommended,
                    reason: situation.reason
                });
            }
        }
        
        return adjustments;
    }
    
    // 최종 추천 생성
    generateRecommendation(baseType, adjustments) {
        const seasonData = this.theory.seasons[baseType];
        let recommendations = {
            primaryColors: [...seasonData.hairColor],
            techniques: [],
            warnings: [],
            maintenance: 'medium'
        };
        
        // 조정사항 적용
        adjustments.forEach(adj => {
            if (adj.type === 'skin_condition' && adj.colors) {
                recommendations.primaryColors = adj.colors;
            }
            if (adj.type === 'special_situation' && adj.recommended) {
                recommendations.primaryColors = adj.recommended;
            }
            if (adj.source === 'uireh') {
                recommendations.techniques.push('ombre', 'balayage');
            }
        });
        
        // 전문가별 기법 추가
        if (baseType === 'winter') {
            recommendations.techniques.push('clear_contrast');
        }
        if (baseType === 'summer') {
            recommendations.techniques.push('soft_gradation');
        }
        
        return recommendations;
    }
    
    // 신뢰도 계산
    calculateConfidence(baseType, adjustments) {
        let confidence = 0.7; // 기본 신뢰도
        
        // 전문가 노하우가 많이 적용될수록 신뢰도 증가
        confidence += adjustments.length * 0.1;
        
        // 최대 95%로 제한
        return Math.min(confidence, 0.95);
    }
    
    // 색상 매칭 헬퍼 함수
    colorMatch(color1, color2) {
        // 실제로는 더 복잡한 색상 매칭 로직 필요
        return color1.toLowerCase().includes(color2.toLowerCase()) || 
               color2.toLowerCase().includes(color1.toLowerCase());
    }
    
    // 브랜드별 제품 추천
    recommendProducts(season, adjustments = []) {
        const products = [];
        
        // 기본 계절별 추천
        const baseProducts = this.getSeasonProducts(season);
        products.push(...baseProducts);
        
        // 조정사항 기반 추가 제품
        adjustments.forEach(adj => {
            if (adj.colors) {
                const specialProducts = this.getProductsByColors(adj.colors);
                products.push(...specialProducts);
            }
        });
        
        return this.removeDuplicates(products);
    }
    
    // 계절별 기본 제품
    getSeasonProducts(season) {
        const seasonColors = this.theory.seasons[season].hairColor;
        return seasonColors.map(color => ({
            brand: 'multi',
            color: color,
            season: season,
            confidence: 0.8
        }));
    }
    
    // 특정 색상의 제품 찾기
    getProductsByColors(colors) {
        return colors.map(color => ({
            brand: 'specialist',
            color: color,
            type: 'corrective',
            confidence: 0.9
        }));
    }
    
    // 중복 제거
    removeDuplicates(products) {
        const seen = new Set();
        return products.filter(product => {
            const key = `${product.brand}-${product.color}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }
}

// 7. 실무진단 헬퍼 함수들
const DiagnosisHelpers = {
    // 복합 타입 처리
    handleComplexTypes: (primaryType, secondaryScores) => {
        if (secondaryScores && Object.keys(secondaryScores).length > 0) {
            const secondaryType = Object.keys(secondaryScores)
                .reduce((a, b) => secondaryScores[a] > secondaryScores[b] ? a : b);
            
            if (secondaryScores[secondaryType] > 0.3) {
                return {
                    type: 'complex',
                    primary: primaryType,
                    secondary: secondaryType,
                    approach: 'flexible'
                };
            }
        }
        return {
            type: 'simple',
            primary: primaryType,
            approach: 'standard'
        };
    },
    
    // 환경 요인 고려
    considerEnvironment: (lighting, makeup, clothing) => {
        const factors = [];
        
        if (lighting === 'fluorescent') {
            factors.push({
                factor: 'lighting',
                adjustment: 'warmer_tones',
                reason: '형광등 하에서는 웜톤이 더 자연스럽게 보임'
            });
        }
        
        if (makeup === 'heavy') {
            factors.push({
                factor: 'makeup',
                adjustment: 'stronger_contrast',
                reason: '진한 메이크업과 균형을 위해 대비감 필요'
            });
        }
        
        return factors;
    },
    
    // 고객 만족도 예측
    predictSatisfaction: (diagnosis, customerPreferences) => {
        let satisfaction = 0.7; // 기본 만족도
        
        // 고객 선호도와 진단 결과 일치도
        if (customerPreferences.preferredUndertone === diagnosis.primaryType) {
            satisfaction += 0.2;
        }
        
        // 전문가 노하우 반영도
        if (diagnosis.adjustments && diagnosis.adjustments.length > 0) {
            satisfaction += 0.1;
        }
        
        // 논문 기반 만족도 증가율 적용
        satisfaction *= (1 + ScientificData.satisfactionIncrease / 100);
        
        return Math.min(satisfaction, 1.0);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PersonalColorTheory,
        UirehExpertise,
        BitnalyunExpertise,
        BlumeExpertise,
        ScientificData,
        PersonalColorExpert,
        DiagnosisHelpers
    };
}

// Global access for web usage
window.PersonalColorExpert = PersonalColorExpert;
window.ExpertKnowledge = {
    PersonalColorTheory,
    UirehExpertise,
    BitnalyunExpertise,
    BlumeExpertise,
    ScientificData,
    DiagnosisHelpers
};
