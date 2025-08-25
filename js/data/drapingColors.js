// js/data/drapingColors.js - 드래이핑 분석용 색상 데이터

/**
 * 3단계 드래이핑 분석용 색상 데이터
 * 온도감 → 명도 → 채도 순서로 체계적 분석
 */
window.DRAPING_COLORS = {
    
    /**
     * 1단계: 온도감 분석 (Temperature Analysis)
     * 따뜻함(Warm) vs 차가움(Cool) 판별
     */
    temperature: {
        warm: [
            {
                name: '골든 옐로우',
                color: '#FFD700',
                munsell: '5Y 8/12',
                description: '순수한 따뜻함의 기준색',
                intensity: 'high',
                category: 'primary_warm'
            },
            {
                name: '코랄 오렌지', 
                color: '#FF7F50',
                munsell: '5YR 7/12',
                description: '생기 넘치는 따뜻한 오렌지',
                intensity: 'high',
                category: 'secondary_warm'
            },
            {
                name: '피치',
                color: '#FFCBA4',
                munsell: '5YR 8/6',
                description: '부드러운 따뜻함',
                intensity: 'medium',
                category: 'soft_warm'
            },
            {
                name: '테라코타',
                color: '#E2725B',
                munsell: '5YR 6/8',
                description: '자연스러운 따뜻한 흙빛',
                intensity: 'medium',
                category: 'earth_warm'
            }
        ],
        cool: [
            {
                name: '아이시 핑크',
                color: '#FF69B4',
                munsell: '5RP 6/14',
                description: '순수한 차가움의 기준색',
                intensity: 'high',
                category: 'primary_cool'
            },
            {
                name: '로얄 블루',
                color: '#4169E1',
                munsell: '5PB 4/12',
                description: '깊고 차가운 파란색',
                intensity: 'high',
                category: 'secondary_cool'
            },
            {
                name: '라벤더',
                color: '#E6E6FA',
                munsell: '5P 8/4',
                description: '부드러운 차가움',
                intensity: 'low',
                category: 'soft_cool'
            },
            {
                name: '민트 그린',
                color: '#98FF98',
                munsell: '5G 8/6',
                description: '신선한 차가운 초록',
                intensity: 'medium',
                category: 'fresh_cool'
            }
        ]
    },
    
    /**
     * 2단계: 명도 분석 (Value Analysis)  
     * 밝음(Light) vs 깊음(Deep) 판별
     */
    brightness: {
        light: [
            {
                name: '소프트 화이트',
                color: '#FFFAFA',
                munsell: 'N 9.5/',
                description: '최고 명도의 기준색',
                temperature: 'neutral',
                category: 'pure_light'
            },
            {
                name: '라이트 피치',
                color: '#FFDAB9',
                munsell: '5YR 9/4',
                description: '밝은 따뜻한 색상',
                temperature: 'warm',
                category: 'warm_light'
            },
            {
                name: '파우더 블루',
                color: '#B0E0E6',
                munsell: '5PB 8/4',
                description: '밝은 차가운 색상',
                temperature: 'cool',
                category: 'cool_light'
            },
            {
                name: '라이트 옐로우',
                color: '#FFFFE0',
                munsell: '5Y 9/6',
                description: '최대 반사율의 밝은 색',
                temperature: 'warm',
                category: 'bright_light'
            }
        ],
        deep: [
            {
                name: '차콜',
                color: '#36454F',
                munsell: 'N 3/',
                description: '깊은 명도의 기준색',
                temperature: 'neutral',
                category: 'pure_deep'
            },
            {
                name: '딥 버건디',
                color: '#800020',
                munsell: '5R 3/8',
                description: '깊고 따뜻한 빨강',
                temperature: 'warm',
                category: 'warm_deep'
            },
            {
                name: '네이비',
                color: '#000080',
                munsell: '5PB 2/10',
                description: '깊고 차가운 파랑',
                temperature: 'cool', 
                category: 'cool_deep'
            },
            {
                name: '포레스트 그린',
                color: '#228B22',
                munsell: '5G 4/10',
                description: '자연스러운 깊은 초록',
                temperature: 'neutral',
                category: 'nature_deep'
            }
        ]
    },
    
    /**
     * 3단계: 채도 분석 (Chroma Analysis)
     * 선명함(Vivid) vs 부드러움(Muted) 판별  
     */
    saturation: {
        vivid: [
            {
                name: '트루 레드',
                color: '#FF0000',
                munsell: '5R 5/14',
                description: '최고 채도의 기준색',
                brightness: 'medium',
                category: 'pure_vivid'
            },
            {
                name: '에메랄드',
                color: '#50C878',
                munsell: '5G 6/12',
                description: '선명한 보석 색상',
                brightness: 'medium',
                category: 'jewel_vivid'
            },
            {
                name: '로얄 퍼플',
                color: '#7851A9',
                munsell: '5P 4/12',
                description: '깊고 선명한 보라',
                brightness: 'medium',
                category: 'royal_vivid'
            },
            {
                name: '브라이트 오렌지',
                color: '#FF4500',
                munsell: '5YR 6/16',
                description: '활동적인 선명한 오렌지',
                brightness: 'medium',
                category: 'bright_vivid'
            }
        ],
        muted: [
            {
                name: '세이지',
                color: '#9CAF88',
                munsell: '5GY 6/4',
                description: '부드러운 채도의 기준색',
                brightness: 'medium',
                category: 'pure_muted'
            },
            {
                name: '더스티 로즈',
                color: '#C39BD3',
                munsell: '5RP 7/6',
                description: '부드럽고 우아한 분홍',
                brightness: 'medium',
                category: 'romantic_muted'
            },
            {
                name: '모카',
                color: '#967117',
                munsell: '5Y 5/6',
                description: '자연스러운 갈색',
                brightness: 'medium',
                category: 'earth_muted'
            },
            {
                name: '스틸 블루',
                color: '#4682B4',
                munsell: '5PB 5/6',
                description: '차분한 파란색',
                brightness: 'medium',
                category: 'calm_muted'
            }
        ]
    },
    
    /**
     * 보조 분석용 중성 색상들
     */
    neutral: {
        whites: [
            { name: '퓨어 화이트', color: '#FFFFFF', munsell: 'N 9.5/', description: '순수한 흰색' },
            { name: '아이보리', color: '#FFFFF0', munsell: '5Y 9.5/2', description: '따뜻한 흰색' },
            { name: '쿨 화이트', color: '#F0F8FF', munsell: '5PB 9.5/1', description: '차가운 흰색' }
        ],
        grays: [
            { name: '미드 그레이', color: '#808080', munsell: 'N 5/', description: '중성 회색' },
            { name: '웜 그레이', color: '#8C7853', munsell: '5Y 5/2', description: '따뜻한 회색' },
            { name: '쿨 그레이', color: '#6495ED', munsell: '5PB 5/2', description: '차가운 회색' }
        ],
        blacks: [
            { name: '퓨어 블랙', color: '#000000', munsell: 'N 1/', description: '순수한 검정' },
            { name: '웜 블랙', color: '#0A0A0A', munsell: '5Y 1/1', description: '따뜻한 검정' },
            { name: '쿨 블랙', color: '#2F4F4F', munsell: '5PB 2/1', description: '차가운 검정' }
        ]
    }
};

/**
 * 드래이핑 분석 메타데이터
 */
window.DRAPING_METADATA = {
    analysisSteps: [
        {
            step: 'temperature',
            title: '온도감 분석',
            description: '피부의 언더톤이 따뜻한지 차가운지 판별',
            duration: 180, // 3분
            colors: 8, // 4개씩 2그룹
            vonKriesTime: 5 // Von Kries 적응 시간 (초)
        },
        {
            step: 'brightness',
            title: '명도 분석', 
            description: '어울리는 색상의 밝기 정도 판별',
            duration: 180, // 3분
            colors: 8, // 4개씩 2그룹
            vonKriesTime: 5
        },
        {
            step: 'saturation',
            title: '채도 분석',
            description: '선명한 색상과 부드러운 색상 중 선호도 판별',
            duration: 180, // 3분  
            colors: 8, // 4개씩 2그룹
            vonKriesTime: 5
        }
    ],
    
    totalAnalysisTime: 540, // 9분
    
    observationCriteria: {
        positive: [
            'skin_glow', // 피부 발광
            'even_tone', // 균일한 피부톤
            'healthy_look', // 건강한 외관
            'facial_definition', // 얼굴 윤곽 선명도
            'eye_brightness', // 눈의 밝기
            'lip_definition' // 입술 선명도
        ],
        negative: [
            'skin_dullness', // 피부 칙칙함
            'uneven_tone', // 불균일한 피부톤
            'tired_look', // 피곤한 외관
            'facial_blur', // 얼굴 윤곽 흐림
            'eye_dullness', // 눈의 침침함
            'lip_fade' // 입술 바램
        ]
    }
};

/**
 * 색상 조합 분석 함수들
 */
window.DrapingAnalyzer = {
    
    /**
     * 단계별 최적 색상 조합 생성
     */
    generateColorPairs: function(step, selectedPreference = null) {
        const colors = window.DRAPING_COLORS[step];
        const pairs = [];
        
        if (step === 'temperature') {
            // 온도감: warm vs cool 직접 비교
            for (let i = 0; i < Math.min(colors.warm.length, colors.cool.length); i++) {
                pairs.push({
                    warm: colors.warm[i],
                    cool: colors.cool[i],
                    comparisonType: 'temperature'
                });
            }
        } else if (step === 'brightness') {
            // 명도: 온도감 결과를 반영한 light vs deep 비교
            const tempPreference = selectedPreference || 'neutral';
            for (let i = 0; i < Math.min(colors.light.length, colors.deep.length); i++) {
                pairs.push({
                    light: colors.light[i],
                    deep: colors.deep[i],
                    comparisonType: 'brightness',
                    temperatureFilter: tempPreference
                });
            }
        } else if (step === 'saturation') {
            // 채도: 이전 결과를 반영한 vivid vs muted 비교
            for (let i = 0; i < Math.min(colors.vivid.length, colors.muted.length); i++) {
                pairs.push({
                    vivid: colors.vivid[i],
                    muted: colors.muted[i],
                    comparisonType: 'saturation'
                });
            }
        }
        
        return pairs;
    },
    
    /**
     * 분석 결과를 바탕으로 최종 계절 추론
     */
    inferSeason: function(temperatureResult, brightnessResult, saturationResult) {
        const profile = {
            temperature: temperatureResult, // 'warm' or 'cool'
            brightness: brightnessResult,   // 'light' or 'deep' 
            saturation: saturationResult    // 'vivid' or 'muted'
        };
        
        // 12계절 매핑 알고리즘
        if (profile.temperature === 'warm') {
            if (profile.brightness === 'light') {
                return profile.saturation === 'vivid' ? 'Spring True' : 'Spring Light';
            } else { // deep
                return profile.saturation === 'vivid' ? 'Autumn True' : 'Autumn Deep';
            }
        } else { // cool
            if (profile.brightness === 'light') {
                return profile.saturation === 'vivid' ? 'Winter Bright' : 'Summer Light';
            } else { // deep
                return profile.saturation === 'vivid' ? 'Winter True' : 'Summer Deep';
            }
        }
    },
    
    /**
     * 분석 정확도 계산
     */
    calculateConfidence: function(analysisResults) {
        let totalScore = 0;
        let maxScore = 0;
        
        // 각 단계별 일관성 점수
        ['temperature', 'brightness', 'saturation'].forEach(step => {
            const result = analysisResults[step];
            if (result && result.confidence) {
                totalScore += result.confidence;
                maxScore += 100;
            }
        });
        
        // Von Kries 적응 시간 준수 보너스
        if (analysisResults.vonKriesCompliance) {
            totalScore += 5;
            maxScore += 5;
        }
        
        // 색상 간 명확한 선호도 보너스  
        if (analysisResults.clearPreference) {
            totalScore += 10;
            maxScore += 10;
        }
        
        return Math.round((totalScore / maxScore) * 100);
    },
    
    /**
     * 드래이핑 색상을 HEX 코드로 변환
     */
    getColorHex: function(colorName) {
        // 모든 드래이핑 색상을 검색
        const allColors = [
            ...window.DRAPING_COLORS.temperature.warm,
            ...window.DRAPING_COLORS.temperature.cool,
            ...window.DRAPING_COLORS.brightness.light,
            ...window.DRAPING_COLORS.brightness.deep,
            ...window.DRAPING_COLORS.saturation.vivid,
            ...window.DRAPING_COLORS.saturation.muted
        ];
        
        const found = allColors.find(color => color.name === colorName);
        return found ? found.color : (window.COLOR_HEX_MAP?.[colorName] || '#CCCCCC');
    },
    
    /**
     * Munsell 표기법을 RGB로 근사 변환
     */
    munsellToRgb: function(munsellNotation) {
        // 간단한 근사 변환 (실제로는 더 복잡한 변환 필요)
        // 여기서는 기본 매핑 사용
        const colorMatch = Object.values(window.DRAPING_COLORS.temperature.warm)
            .concat(Object.values(window.DRAPING_COLORS.temperature.cool))
            .find(color => color.munsell === munsellNotation);
        
        return colorMatch ? colorMatch.color : '#CCCCCC';
    }
};

/**
 * 전문가 드래이핑 가이드라인
 */
window.EXPERT_GUIDELINES = {
    lightingRequirements: {
        colorTemperature: '5000K (D50 표준광원)',
        cri: '90+ (R9 값 70 이상)',
        illuminance: '1000-1500 lux',
        uniformity: '±10% 이내',
        backgroundReflection: 'N5 중성회색'
    },
    
    observationProtocol: {
        adaptationTime: '3-5초 (Von Kries 적응)',
        observationDistance: '60-80cm',
        drapingArea: '얼굴 전체 + 목 상단',
        comparisonMethod: '항상 2개 이상 색상 직접 비교',
        evaluationTime: '단계당 3-5분'
    },
    
    professionalTips: [
        '메이크업 제거 필수 (베이스 포함)',
        '자연광에 가까운 조명 환경 조성',
        '흰색/검정색 의복 착용 권장',
        '머리카락이 얼굴을 가리지 않도록 정리',
        '감정적 반응보다 객관적 관찰 중시',
        '피부 반사광의 스펙트럼 변화 주의 깊게 관찰'
    ]
};

console.log('드래이핑 색상 데이터 로딩 완료:', Object.keys(window.DRAPING_COLORS).length, '개 카테고리');
