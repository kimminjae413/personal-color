// js/data/drapingColors.js - 드래이핑 색상 데이터

/**
 * 3단계 드래이핑 진단용 색상 데이터
 * 1단계: 온도감 (Undertone) - 따뜻함 vs 차가움
 * 2단계: 명도 (Value) - 밝음 vs 어두움  
 * 3단계: 채도 (Chroma) - 선명함 vs 부드러움
 */

// 1단계: 온도감 분석용 색상
window.UNDERTONE_COLORS = {
    warm: [
        {
            name: '골든 옐로우',
            hex: '#FFD700',
            munsell: '5Y 8/12',
            description: '따뜻한 황금색',
            category: 'undertone'
        },
        {
            name: '코랄 오렌지',
            hex: '#FF7F50',
            munsell: '5YR 7/12',
            description: '산호색 오렌지',
            category: 'undertone'
        },
        {
            name: '피치',
            hex: '#FFCBA4',
            munsell: '5YR 8/6',
            description: '복숭아색',
            category: 'undertone'
        },
        {
            name: '올리브 그린',
            hex: '#8FBC8F',
            munsell: '5GY 6/8',
            description: '따뜻한 올리브 그린',
            category: 'undertone'
        }
    ],
    cool: [
        {
            name: '아이시 핑크',
            hex: '#FF1493',
            munsell: '5RP 6/14',
            description: '차가운 핑크',
            category: 'undertone'
        },
        {
            name: '로얄 블루',
            hex: '#4169E1',
            munsell: '5PB 4/12',
            description: '깊은 파란색',
            category: 'undertone'
        },
        {
            name: '에메랄드',
            hex: '#50C878',
            munsell: '5G 6/12',
            description: '청록색',
            category: 'undertone'
        },
        {
            name: '라벤더',
            hex: '#E6E6FA',
            munsell: '5P 8/4',
            description: '연한 보라색',
            category: 'undertone'
        }
    ]
};

// 2단계: 명도 분석용 색상
window.VALUE_COLORS = {
    light: [
        {
            name: '소프트 화이트',
            hex: '#FFFAFA',
            munsell: 'N9.5',
            description: '부드러운 흰색',
            category: 'value'
        },
        {
            name: '라이트 피치',
            hex: '#FFDAB9',
            munsell: '5YR 8.5/4',
            description: '밝은 복숭아색',
            category: 'value'
        },
        {
            name: '파우더 블루',
            hex: '#B0E0E6',
            munsell: '5B 8/4',
            description: '연한 파란색',
            category: 'value'
        },
        {
            name: '라벤더',
            hex: '#E6E6FA',
            munsell: '5P 8/4',
            description: '연한 보라색',
            category: 'value'
        }
    ],
    deep: [
        {
            name: '딥 네이비',
            hex: '#000080',
            munsell: '5PB 2/8',
            description: '깊은 남색',
            category: 'value'
        },
        {
            name: '버건디',
            hex: '#800020',
            munsell: '5R 3/8',
            description: '깊은 적갈색',
            category: 'value'
        },
        {
            name: '포레스트 그린',
            hex: '#228B22',
            munsell: '5G 3/8',
            description: '깊은 초록색',
            category: 'value'
        },
        {
            name: '차콜',
            hex: '#36454F',
            munsell: 'N3',
            description: '깊은 회색',
            category: 'value'
        }
    ]
};

// 3단계: 채도 분석용 색상
window.CHROMA_COLORS = {
    bright: [
        {
            name: '트루 레드',
            hex: '#FF0000',
            munsell: '5R 5/14',
            description: '순수한 빨간색',
            category: 'chroma'
        },
        {
            name: '브라이트 블루',
            hex: '#0066FF',
            munsell: '5B 5/12',
            description: '선명한 파란색',
            category: 'chroma'
        },
        {
            name: '에메랄드 그린',
            hex: '#50C878',
            munsell: '5G 6/12',
            description: '선명한 에메랄드',
            category: 'chroma'
        },
        {
            name: '골든 옐로우',
            hex: '#FFD700',
            munsell: '5Y 8/12',
            description: '선명한 황금색',
            category: 'chroma'
        }
    ],
    soft: [
        {
            name: '더스티 로즈',
            hex: '#C39BD3',
            munsell: '5RP 7/6',
            description: '부드러운 장미색',
            category: 'chroma'
        },
        {
            name: '세이지',
            hex: '#9CAF88',
            munsell: '5GY 6/4',
            description: '부드러운 회녹색',
            category: 'chroma'
        },
        {
            name: '머브',
            hex: '#B784A7',
            munsell: '5P 6/4',
            description: '부드러운 자주색',
            category: 'chroma'
        },
        {
            name: '스틸 블루',
            hex: '#4682B4',
            munsell: '5B 5/6',
            description: '부드러운 청색',
            category: 'chroma'
        }
    ]
};

// 전체 드래이핑 색상 통합
window.DRAPING_COLORS = {
    // 1단계: 온도감
    step1: {
        title: '1단계: 온도감 분석',
        subtitle: '따뜻함 vs 차가움을 판단합니다',
        description: 'Von Kries 색채 적응 이론에 따라 3-5초간 관찰하세요',
        colors: [
            ...window.UNDERTONE_COLORS.warm,
            ...window.UNDERTONE_COLORS.cool
        ]
    },
    
    // 2단계: 명도
    step2: {
        title: '2단계: 명도 분석', 
        subtitle: '밝음 vs 어두움의 대비 효과를 분석합니다',
        description: '얼굴에서 30cm 거리에서 대비 효과를 관찰하세요',
        colors: [
            ...window.VALUE_COLORS.light,
            ...window.VALUE_COLORS.deep
        ]
    },
    
    // 3단계: 채도
    step3: {
        title: '3단계: 채도 분석',
        subtitle: '선명함 vs 부드러움의 조화도를 측정합니다', 
        description: '피부톤과의 조화를 통해 최적 채도를 찾아보세요',
        colors: [
            ...window.CHROMA_COLORS.bright,
            ...window.CHROMA_COLORS.soft
        ]
    }
};

// 간단한 테스트용 색상 (처음 사용자용)
window.SIMPLE_COLORS = {
    warm: [
        { name: '골든 옐로우', color: '#FFD700', munsell: '5Y 8/12', description: '따뜻한 황금색' },
        { name: '코랄 오렌지', color: '#FF7F50', munsell: '5YR 7/12', description: '산호색 오렌지' },
        { name: '피치', color: '#FFCBA4', munsell: '5YR 8/6', description: '복숭아색' },
        { name: '올리브', color: '#8FBC8F', munsell: '5GY 6/8', description: '따뜻한 올리브 그린' }
    ],
    cool: [
        { name: '아이시 핑크', color: '#FF1493', munsell: '5RP 6/14', description: '차가운 핑크' },
        { name: '로얄 블루', color: '#4169E1', munsell: '5PB 4/12', description: '깊은 파란색' },
        { name: '에메랄드', color: '#50C878', munsell: '5G 6/12', description: '청록색' },
        { name: '라벤더', color: '#E6E6FA', munsell: '5P 8/4', description: '연한 보라색' }
    ]
};

// 계절별 테스트 색상
window.SEASONAL_TEST_COLORS = {
    spring: [
        { name: '트루 레드', hex: '#FF0000', season: 'spring' },
        { name: '골든 옐로우', hex: '#FFD700', season: 'spring' },
        { name: '에메랄드', hex: '#50C878', season: 'spring' },
        { name: '워름 화이트', hex: '#FDF6E3', season: 'spring' }
    ],
    summer: [
        { name: '소프트 레드', hex: '#FF6B6B', season: 'summer' },
        { name: '라벤더', hex: '#E6E6FA', season: 'summer' },
        { name: '더스티 로즈', hex: '#C39BD3', season: 'summer' },
        { name: '쿨 화이트', hex: '#F0F8FF', season: 'summer' }
    ],
    autumn: [
        { name: '러스트', hex: '#B7410E', season: 'autumn' },
        { name: '머스타드', hex: '#FFDB58', season: 'autumn' },
        { name: '포레스트 그린', hex: '#228B22', season: 'autumn' },
        { name: '크림', hex: '#FFFDD0', season: 'autumn' }
    ],
    winter: [
        { name: '딥 레드', hex: '#8B0000', season: 'winter' },
        { name: '로얄 블루', hex: '#4169E1', season: 'winter' },
        { name: '에메랄드', hex: '#50C878', season: 'winter' },
        { name: '퓨어 화이트', hex: '#FFFFFF', season: 'winter' }
    ]
};

// 전문가용 확장 색상 팔레트 (200+ 색상)
window.PROFESSIONAL_COLORS = {
    warm_light: [
        { name: '아이보리', hex: '#FFFFF0', temp: 'warm', value: 'light', chroma: 'soft' },
        { name: '바닐라', hex: '#F3E5AB', temp: 'warm', value: 'light', chroma: 'soft' },
        { name: '라이트 피치', hex: '#FFDAB9', temp: 'warm', value: 'light', chroma: 'soft' },
        { name: '코랄 핑크', hex: '#F88379', temp: 'warm', value: 'light', chroma: 'bright' }
    ],
    warm_deep: [
        { name: '딥 골드', hex: '#B8860B', temp: 'warm', value: 'deep', chroma: 'bright' },
        { name: '러스트', hex: '#B7410E', temp: 'warm', value: 'deep', chroma: 'bright' },
        { name: '초콜릿', hex: '#7B3F00', temp: 'warm', value: 'deep', chroma: 'soft' },
        { name: '마호가니', hex: '#C04000', temp: 'warm', value: 'deep', chroma: 'bright' }
    ],
    cool_light: [
        { name: '소프트 화이트', hex: '#FFFAFA', temp: 'cool', value: 'light', chroma: 'soft' },
        { name: '라벤더', hex: '#E6E6FA', temp: 'cool', value: 'light', chroma: 'soft' },
        { name: '파우더 블루', hex: '#B0E0E6', temp: 'cool', value: 'light', chroma: 'soft' },
        { name: '아이시 핑크', hex: '#FFB6C1', temp: 'cool', value: 'light', chroma: 'bright' }
    ],
    cool_deep: [
        { name: '딥 네이비', hex: '#000080', temp: 'cool', value: 'deep', chroma: 'bright' },
        { name: '버건디', hex: '#800020', temp: 'cool', value: 'deep', chroma: 'bright' },
        { name: '포레스트 그린', hex: '#228B22', temp: 'cool', value: 'deep', chroma: 'bright' },
        { name: '차콜', hex: '#36454F', temp: 'cool', value: 'deep', chroma: 'soft' }
    ]
};

// 유틸리티 함수들
window.DrapingUtils = {
    // 단계별 색상 가져오기
    getStepColors: function(step) {
        return window.DRAPING_COLORS['step' + step] || null;
    },
    
    // 온도감별 색상 가져오기
    getUndertoneColors: function(undertone) {
        return window.UNDERTONE_COLORS[undertone] || [];
    },
    
    // 명도별 색상 가져오기  
    getValueColors: function(value) {
        return window.VALUE_COLORS[value] || [];
    },
    
    // 채도별 색상 가져오기
    getChromaColors: function(chroma) {
        return window.CHROMA_COLORS[chroma] || [];
    },
    
    // 계절별 테스트 색상 가져오기
    getSeasonalTestColors: function(season) {
        return window.SEASONAL_TEST_COLORS[season] || [];
    },
    
    // 전문가용 색상 가져오기
    getProfessionalColors: function(category) {
        return window.PROFESSIONAL_COLORS[category] || [];
    },
    
    // 색상 분석 결과에 따른 추천 계절
    analyzeColors: function(selections) {
        let warmCount = 0;
        let coolCount = 0;
        let lightCount = 0;
        let deepCount = 0;
        let brightCount = 0;
        let softCount = 0;
        
        selections.forEach(selection => {
            // 온도감 분석
            if (this.getUndertoneColors('warm').some(c => c.name === selection)) {
                warmCount++;
            } else if (this.getUndertoneColors('cool').some(c => c.name === selection)) {
                coolCount++;
            }
            
            // 명도 분석
            if (this.getValueColors('light').some(c => c.name === selection)) {
                lightCount++;
            } else if (this.getValueColors('deep').some(c => c.name === selection)) {
                deepCount++;
            }
            
            // 채도 분석
            if (this.getChromaColors('bright').some(c => c.name === selection)) {
                brightCount++;
            } else if (this.getChromaColors('soft').some(c => c.name === selection)) {
                softCount++;
            }
        });
        
        // 결과 분석
        const undertone = warmCount > coolCount ? 'warm' : 'cool';
        const value = lightCount > deepCount ? 'light' : 'deep';
        const chroma = brightCount > softCount ? 'bright' : 'soft';
        
        // 계절 매핑
        const seasonMap = {
            'warm_light_bright': 'Spring True',
            'warm_light_soft': 'Spring Light', 
            'warm_deep_bright': 'Spring Deep',
            'warm_deep_soft': 'Autumn Soft',
            'cool_light_bright': 'Summer True',
            'cool_light_soft': 'Summer Light',
            'cool_deep_bright': 'Winter Bright',
            'cool_deep_soft': 'Winter True'
        };
        
        const key = `${undertone}_${value}_${chroma}`;
        return seasonMap[key] || 'Spring Light';
    }
};

console.log('drapingColors.js 로딩 완료 - 드래이핑 색상 데이터');
