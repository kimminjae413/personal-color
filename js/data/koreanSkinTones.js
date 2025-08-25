/**
 * koreanSkinTones.js
 * 한국인 특화 피부톤 분석 데이터베이스
 * - 논문 기반 과학적 데이터 (CIE L*a*b*)
 * - 연령별, 성별, 계절별 보정
 * - 퍼스널컬러 4계절 매칭
 * - 피부 상태별 분석
 */

// 한국인 기본 피부톤 데이터 (노기영 외, 2000; 김정희, 2012 논문 기반)
export const KOREAN_BASE_SKIN_DATA = {
    // 전체 평균 데이터
    overall_average: {
        lab: { l: 64.75, a: 10.85, b: 14.30 },
        rgb_equivalent: [180, 156, 132],
        hex: '#B49C84',
        description: '한국인 평균 피부톤'
    },

    // 계절별 분포 (4계절 시스템)
    seasonal_distribution: {
        spring: {
            percentage: 25,
            lab: { l: 67.58, a: 8.91, b: 16.12 },
            rgb_equivalent: [186, 162, 138],
            characteristics: '밝고 따뜻한 톤',
            undertone: 'warm',
            common_features: ['골든 언더톤', '밝은 피부', '따뜻한 느낌']
        },
        summer: {
            percentage: 30,
            lab: { l: 67.92, a: 10.84, b: 11.70 },
            rgb_equivalent: [184, 158, 142],
            characteristics: '밝고 차가운 톤',
            undertone: 'cool',
            common_features: ['핑크 언더톤', '부드러운 피부', '차가운 느낌']
        },
        autumn: {
            percentage: 25,
            lab: { l: 62.09, a: 11.25, b: 16.54 },
            rgb_equivalent: [172, 145, 117],
            characteristics: '깊고 따뜻한 톤',
            undertone: 'warm',
            common_features: ['골든 옐로우 언더톤', '깊은 피부', '성숙한 느낌']
        },
        winter: {
            percentage: 20,
            lab: { l: 61.41, a: 12.46, b: 13.82 },
            rgb_equivalent: [168, 140, 122],
            characteristics: '깊고 차가운 톤',
            undertone: 'cool',
            common_features: ['핑크 언더톤', '선명한 대비', '차가운 느낌']
        }
    }
};

// 연령별 피부톤 변화 데이터
export const AGE_BASED_VARIATIONS = {
    '20-29': {
        adjustment_factors: {
            brightness: +2.5,    // L값 조정
            redness: -0.8,       // a값 조정  
            yellowness: +1.2,    // b값 조정
            elasticity: 1.0,
            moisture: 1.0
        },
        characteristics: ['높은 수분', '탄력있는 피부', '맑은 톤'],
        foundation_recommendation: {
            coverage: 'light-medium',
            finish: 'natural-dewy',
            undertone_match: 'exact'
        }
    },

    '30-39': {
        adjustment_factors: {
            brightness: 0,
            redness: 0,
            yellowness: 0,
            elasticity: 0.95,
            moisture: 0.9
        },
        characteristics: ['안정적 피부톤', '자연스러운 윤기', '균일한 톤'],
        foundation_recommendation: {
            coverage: 'medium',
            finish: 'natural',
            undertone_match: 'exact'
        }
    },

    '40-49': {
        adjustment_factors: {
            brightness: -1.8,
            redness: +0.5,
            yellowness: +0.8,
            elasticity: 0.85,
            moisture: 0.8
        },
        characteristics: ['약간의 색소침착', '탄력 감소', '피지 감소'],
        foundation_recommendation: {
            coverage: 'medium-full',
            finish: 'satin',
            undertone_match: 'slightly_warm'
        }
    },

    '50+': {
        adjustment_factors: {
            brightness: -3.2,
            redness: +1.2,
            yellowness: +1.5,
            elasticity: 0.7,
            moisture: 0.65
        },
        characteristics: ['색소침착 증가', '주름 발생', '건조함'],
        foundation_recommendation: {
            coverage: 'full',
            finish: 'luminous',
            undertone_match: 'warm_adjusted'
        }
    }
};

// 성별 피부톤 차이
export const GENDER_VARIATIONS = {
    female: {
        average_lab: { l: 65.2, a: 10.3, b: 14.1 },
        characteristics: [
            '남성 대비 약간 밝은 톤',
            '부드러운 피부 질감',
            '화장품 사용으로 인한 톤 변화'
        ],
        seasonal_preferences: {
            spring: 28,
            summer: 32,
            autumn: 22,
            winter: 18
        }
    },

    male: {
        average_lab: { l: 64.3, a: 11.4, b: 14.5 },
        characteristics: [
            '여성 대비 약간 어두운 톤',
            '거친 피부 질감',
            '자연스러운 피부 상태'
        ],
        seasonal_preferences: {
            spring: 22,
            summer: 28,
            autumn: 28,
            winter: 22
        }
    }
};

// 지역별 피부톤 변화 (한국 내)
export const REGIONAL_VARIATIONS = {
    seoul_metro: {
        adjustment: { l: +1.2, a: -0.3, b: -0.5 },
        characteristics: '도시형 생활로 인한 약간 밝은 톤',
        pollution_effect: 'moderate'
    },
    
    busan_coastal: {
        adjustment: { l: +0.8, a: +0.2, b: +0.8 },
        characteristics: '해안 기후로 인한 촉촉한 피부',
        humidity_effect: 'high'
    },

    jeju_island: {
        adjustment: { l: +1.5, a: -0.5, b: +1.2 },
        characteristics: '청정 환경으로 인한 맑은 피부',
        uv_exposure: 'high'
    },

    inland_mountain: {
        adjustment: { l: -0.5, a: +0.3, b: +0.3 },
        characteristics: '건조한 기후로 인한 매트한 피부',
        dryness_factor: 'high'
    }
};

// 계절별 피부톤 변화 (한국의 사계절)
export const SEASONAL_SKIN_CHANGES = {
    spring: {
        skin_adjustments: { l: +0.5, a: -0.2, b: +0.3 },
        characteristics: '봄철 회복, 약간 밝아짐',
        moisture_level: 'recovering',
        recommended_care: ['보습 집중', '각질 제거', 'SPF 30+']
    },

    summer: {
        skin_adjustments: { l: -1.2, a: +0.5, b: +0.8 },
        characteristics: '자외선으로 인한 어두워짐',
        moisture_level: 'oily',
        recommended_care: ['유분 조절', '미백 관리', 'SPF 50+']
    },

    autumn: {
        skin_adjustments: { l: -0.3, a: +0.2, b: +0.5 },
        characteristics: '여름 피로 회복, 안정화',
        moisture_level: 'balanced',
        recommended_care: ['수분 공급', '진정 관리', 'SPF 30+']
    },

    winter: {
        skin_adjustments: { l: +0.8, a: -0.3, b: -0.2 },
        characteristics: '건조로 인한 창백함',
        moisture_level: 'dry',
        recommended_care: ['집중 보습', '유분 공급', 'SPF 25+']
    }
};

// 한국인 특화 파운데이션 색상 매칭
export const KOREAN_FOUNDATION_MATCHING = {
    // K-Beauty 브랜드 기준
    korean_brands: {
        // 이니스프리
        innisfree: {
            21: { lab: [67.2, 8.9, 14.6], seasons: ['spring', 'summer'] },
            23: { lab: [63.8, 10.2, 16.1], seasons: ['autumn', 'winter'] },
            25: { lab: [60.1, 11.8, 17.9], seasons: ['autumn', 'winter'] },
            27: { lab: [56.9, 13.2, 19.2], seasons: ['autumn', 'winter'] }
        },

        // 헤라
        hera: {
            21: { lab: [66.8, 9.1, 14.2], seasons: ['spring', 'summer'] },
            23: { lab: [64.2, 10.5, 15.8], seasons: ['autumn', 'winter'] },
            25: { lab: [61.5, 11.9, 17.4], seasons: ['autumn', 'winter'] }
        },

        // 라네즈
        laneige: {
            21: { lab: [67.5, 8.7, 14.8], seasons: ['spring', 'summer'] },
            21W: { lab: [67.2, 9.2, 15.9], seasons: ['spring'] },
            21P: { lab: [67.8, 8.2, 13.7], seasons: ['summer'] },
            23: { lab: [64.1, 10.3, 16.2], seasons: ['autumn', 'winter'] },
            23W: { lab: [63.8, 10.8, 17.1], seasons: ['autumn'] },
            23P: { lab: [64.4, 9.8, 15.3], seasons: ['winter'] }
        }
    },

    // 글로벌 브랜드의 한국인 매칭
    global_brands: {
        mac: {
            'NC20': { lab: [66.9, 9.2, 15.8], korean_match: 'spring' },
            'NC25': { lab: [63.5, 10.8, 17.2], korean_match: 'autumn' },
            'NW20': { lab: [67.1, 8.8, 13.9], korean_match: 'summer' },
            'NW25': { lab: [63.8, 9.9, 15.4], korean_match: 'winter' }
        },

        fenty: {
            '150': { lab: [66.8, 9.1, 14.7], korean_match: 'spring' },
            '200': { lab: [64.2, 10.4, 16.1], korean_match: 'autumn' },
            '210': { lab: [67.3, 8.5, 13.8], korean_match: 'summer' }
        }
    }
};

// 피부 상태별 분석 데이터
export const SKIN_CONDITION_ANALYSIS = {
    // 피부 타입별
    skin_types: {
        dry: {
            lab_adjustment: { l: +1.2, a: -0.5, b: -0.3 },
            characteristics: '건조로 인한 칙칙함',
            season_tendency: ['summer', 'winter'],
            care_focus: '보습'
        },

        oily: {
            lab_adjustment: { l: -0.8, a: +0.3, b: +0.7 },
            characteristics: '유분으로 인한 어두워짐',
            season_tendency: ['spring', 'autumn'],
            care_focus: '유분조절'
        },

        combination: {
            lab_adjustment: { l: 0, a: 0, b: +0.2 },
            characteristics: '부분별 차이',
            season_tendency: ['all'],
            care_focus: '밸런스'
        },

        sensitive: {
            lab_adjustment: { l: +0.5, a: +0.8, b: -0.2 },
            characteristics: '붉은기, 예민함',
            season_tendency: ['summer', 'winter'],
            care_focus: '진정'
        }
    },

    // 피부 고민별
    concerns: {
        acne: {
            color_impact: { redness: +2.1, darkness: +0.8 },
            masking_colors: ['green', 'yellow'],
            avoid_colors: ['red', 'orange']
        },

        dark_spots: {
            color_impact: { darkness: +1.5, unevenness: +1.2 },
            masking_colors: ['peach', 'orange'],
            correction_needed: true
        },

        rosacea: {
            color_impact: { redness: +3.2, sensitivity: +2.0 },
            masking_colors: ['green', 'mint'],
            gentle_approach: true
        },

        dullness: {
            color_impact: { brightness: -1.8, grayness: +1.0 },
            brightening_colors: ['coral', 'pink'],
            illuminating_needed: true
        }
    }
};

// 한국인 특화 색상 보정 알고리즘
export const KOREAN_COLOR_CORRECTION = {
    // 기본 보정 공식
    base_corrections: {
        // 한국인은 일반적으로 노란끼가 강함
        reduce_yellow: 0.85,  // b값을 15% 줄임
        enhance_pink: 1.1,    // a값을 10% 늘림 (자연스러운 혈색)
        brightness_boost: 1.05, // L값을 5% 늘림 (화사함)
        
        // 계절별 보정 강도
        seasonal_intensity: {
            spring: 0.8,   // 자연스러운 보정
            summer: 1.0,   // 표준 보정
            autumn: 0.9,   // 약간 약한 보정
            winter: 1.2    // 강한 보정
        }
    },

    // 연령별 보정 전략
    age_corrections: {
        young: {
            method: 'subtle_enhancement',
            focus: ['brightness', 'clarity'],
            intensity: 0.7
        },
        mature: {
            method: 'warming_correction',
            focus: ['warmth', 'luminosity'],
            intensity: 1.3
        }
    },

    // 조명별 보정
    lighting_corrections: {
        indoor_led: { temperature_shift: -200, brightness: +0.3 },
        natural_daylight: { temperature_shift: 0, brightness: 0 },
        fluorescent: { temperature_shift: +300, brightness: +0.5 },
        incandescent: { temperature_shift: -500, brightness: -0.2 }
    }
};

// 메이크업 추천 시스템
export const KOREAN_MAKEUP_RECOMMENDATIONS = {
    // 계절별 한국인 메이크업
    seasonal_makeup: {
        spring: {
            base: {
                foundation: '골든 베이지, 웜 아이보리',
                concealer: '피치 베이지',
                powder: '루서 파우더',
                primer: '컬러 코렉팅 (옐로우)'
            },
            color: {
                eyeshadow: ['코랄 핑크', '피치', '골드 브라운'],
                blush: ['코랄', '피치 핑크'],
                lipstick: ['코랄 레드', '피치 핑크', '오렌지 레드']
            }
        },

        summer: {
            base: {
                foundation: '핑크 베이지, 쿨 아이보리',
                concealer: '라벤더 베이지',
                powder: '핑크 파우더',
                primer: '컬러 코렉팅 (민트)'
            },
            color: {
                eyeshadow: ['로즈 브라운', '라벤더', '실버'],
                blush: ['로즈 핑크', '모브'],
                lipstick: ['로즈 레드', '베리 핑크', '플럼']
            }
        },

        autumn: {
            base: {
                foundation: '골든 베이지, 웜 브라운',
                concealer: '골든 베이지',
                powder: '웜 세팅 파우더',
                primer: '컬러 코렉팅 (옐로우)'
            },
            color: {
                eyeshadow: ['딥 브라운', '골드', '버건디'],
                blush: ['브릭 레드', '번트 오렌지'],
                lipstick: ['딥 레드', '브라운 레드', '버건디']
            }
        },

        winter: {
            base: {
                foundation: '쿨 베이지, 뉴트럴 아이보리',
                concealer: '핑크 베이지',
                powder: '쿨톤 파우더',
                primer: '일루미네이팅'
            },
            color: {
                eyeshadow: ['블랙 브라운', '실버', '네이비'],
                blush: ['쿨 핑크', '후크시아'],
                lipstick: ['트루 레드', '핫 핑크', '딥 베리']
            }
        }
    }
};

// 한국인 피부톤 진단 알고리즘
export const KOREAN_DIAGNOSIS_ALGORITHM = {
    /**
     * 1차 분류: 온도감 (웜/쿨)
     */
    temperature_classification: {
        warm_indicators: {
            lab_conditions: ['b_value > 15', 'a_value < 12'],
            visual_cues: ['골든 언더톤', '노란끼', '따뜻한 느낌'],
            vein_color: 'greenish',
            jewelry_preference: 'gold'
        },
        cool_indicators: {
            lab_conditions: ['b_value < 13', 'a_value > 10'],
            visual_cues: ['핑크 언더톤', '붉은끼', '차가운 느낌'],
            vein_color: 'bluish',
            jewelry_preference: 'silver'
        }
    },

    /**
     * 2차 분류: 명도 (라이트/딥)
     */
    depth_classification: {
        light_indicators: {
            lab_conditions: ['l_value > 65'],
            characteristics: ['밝은 피부', '섬세함', '투명감'],
            seasons: ['spring', 'summer']
        },
        deep_indicators: {
            lab_conditions: ['l_value < 65'],
            characteristics: ['깊은 피부', '강인함', '성숙함'],
            seasons: ['autumn', 'winter']
        }
    },

    /**
     * 3차 분류: 선명도 (클리어/뮤티드)
     */
    clarity_classification: {
        clear_indicators: {
            chroma_conditions: ['high_saturation', 'vivid_contrast'],
            characteristics: ['선명함', '또렷함', '강한 대비'],
            seasons: ['spring', 'winter']
        },
        muted_indicators: {
            chroma_conditions: ['low_saturation', 'soft_contrast'],
            characteristics: ['부드러움', '차분함', '회색기'],
            seasons: ['summer', 'autumn']
        }
    },

    /**
     * 최종 계절 분류 매트릭스
     */
    season_matrix: {
        'warm + light + clear': 'bright_spring',
        'warm + light + muted': 'light_spring',
        'warm + deep + clear': 'clear_autumn',
        'warm + deep + muted': 'deep_autumn',
        'cool + light + clear': 'clear_summer',
        'cool + light + muted': 'light_summer',
        'cool + deep + clear': 'clear_winter',
        'cool + deep + muted': 'deep_winter'
    }
};

// 분석 정확도 향상을 위한 보조 데이터
export const ANALYSIS_ENHANCEMENT = {
    // 한국인 특화 랜드마크
    facial_landmarks: {
        skin_sampling_points: [
            { region: 'forehead', coordinates: [0.5, 0.3], weight: 0.3 },
            { region: 'cheek_left', coordinates: [0.3, 0.6], weight: 0.25 },
            { region: 'cheek_right', coordinates: [0.7, 0.6], weight: 0.25 },
            { region: 'chin', coordinates: [0.5, 0.8], weight: 0.2 }
        ]
    },

    // 품질 검증 기준
    quality_thresholds: {
        minimum_brightness: 30,
        maximum_brightness: 220,
        color_uniformity: 0.8,
        face_size_ratio: 0.3,
        angle_tolerance: 15  // degrees
    },

    // 신뢰도 점수 계산
    confidence_factors: {
        image_quality: 0.3,
        color_consistency: 0.25,
        face_detection_accuracy: 0.2,
        lighting_conditions: 0.15,
        skin_area_coverage: 0.1
    }
};

// 유틸리티 함수들
export const KOREAN_SKIN_UTILITIES = {
    /**
     * 한국인 평균과의 차이 계산
     */
    calculateKoreanDeviation(labValues) {
        const avgLab = KOREAN_BASE_SKIN_DATA.overall_average.lab;
        return {
            l_diff: labValues.l - avgLab.l,
            a_diff: labValues.a - avgLab.a,
            b_diff: labValues.b - avgLab.b,
            total_diff: Math.sqrt(
                Math.pow(labValues.l - avgLab.l, 2) +
                Math.pow(labValues.a - avgLab.a, 2) +
                Math.pow(labValues.b - avgLab.b, 2)
            )
        };
    },

    /**
     * 연령별 보정 적용
     */
    applyAgeCorrection(labValues, age) {
        const ageGroup = age < 30 ? '20-29' : age < 40 ? '30-39' : age < 50 ? '40-49' : '50+';
        const corrections = AGE_BASED_VARIATIONS[ageGroup].adjustment_factors;
        
        return {
            l: labValues.l + corrections.brightness,
            a: labValues.a + corrections.redness,
            b: labValues.b + corrections.yellowness
        };
    },

    /**
     * 지역별 환경 보정
     */
    applyRegionalCorrection(labValues, region = 'seoul_metro') {
        const adjustment = REGIONAL_VARIATIONS[region]?.adjustment || { l: 0, a: 0, b: 0 };
        
        return {
            l: labValues.l + adjustment.l,
            a: labValues.a + adjustment.a,
            b: labValues.b + adjustment.b
        };
    },

    /**
     * 가장 가까운 한국인 표준 찾기
     */
    findClosestKoreanStandard(labValues) {
        const seasons = KOREAN_BASE_SKIN_DATA.seasonal_distribution;
        let closestSeason = null;
        let minDistance = Infinity;

        Object.keys(seasons).forEach(season => {
            const seasonLab = seasons[season].lab;
            const distance = Math.sqrt(
                Math.pow(labValues.l - seasonLab.l, 2) +
                Math.pow(labValues.a - seasonLab.a, 2) +
                Math.pow(labValues.b - seasonLab.b, 2)
            );

            if (distance < minDistance) {
                minDistance = distance;
                closestSeason = season;
            }
        });

        return {
            season: closestSeason,
            distance: minDistance,
            confidence: Math.max(0, 1 - (minDistance / 10))
        };
    },

    /**
     * 파운데이션 추천
     */
    recommendFoundation(labValues, brand = 'korean') {
        const brandData = KOREAN_FOUNDATION_MATCHING.korean_brands;
        const recommendations = [];

        Object.keys(brandData).forEach(brandName => {
            Object.keys(brandData[brandName]).forEach(shade => {
                const shadeLab = brandData[brandName][shade].lab;
                const distance = Math.sqrt(
                    Math.pow(labValues.l - shadeLab[0], 2) +
                    Math.pow(labValues.a - shadeLab[1], 2) +
                    Math.pow(labValues.b - shadeLab[2], 2)
                );

                recommendations.push({
                    brand: brandName,
                    shade: shade,
                    distance: distance,
                    match_score: Math.max(0, 1 - (distance / 15))
                });
            });
        });

        return recommendations.sort((a, b) => a.distance - b.distance).slice(0, 5);
    }
};

// 기본 내보내기
export default {
    KOREAN_BASE_SKIN_DATA,
    AGE_BASED_VARIATIONS,
    GENDER_VARIATIONS,
    REGIONAL_VARIATIONS,
    SEASONAL_SKIN_CHANGES,
    KOREAN_FOUNDATION_MATCHING,
    SKIN_CONDITION_ANALYSIS,
    KOREAN_COLOR_CORRECTION,
    KOREAN_MAKEUP_RECOMMENDATIONS,
    KOREAN_DIAGNOSIS_ALGORITHM,
    ANALYSIS_ENHANCEMENT,
    KOREAN_SKIN_UTILITIES
};
