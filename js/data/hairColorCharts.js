/**
 * hairColorCharts.js
 * 헤어컬러 브랜드별 완전 차트 데이터베이스
 * - 로레알, 웰라, 밀본 3사 전문 살롱용 데이터
 * - 논문 기반 정확한 CMYK 값
 * - 퍼스널컬러 4계절 매칭
 * - 한국 헤어샵 현장 최적화
 */

// 브랜드별 기본 정보
export const BRAND_INFO = {
    loreal: {
        name: 'L\'ORÉAL Professional',
        country: 'France',
        established: 1909,
        market_share_korea: 35,
        notation_system: 'level.reflection',
        characteristics: '웜톤 색상이 풍부, 골든 베이스 우수',
        popular_levels: [5, 6, 7, 8, 9],
        description: '세계 1위 화장품 브랜드의 프리미엄 헤어컬러'
    },

    wella: {
        name: 'Wella Professionals',
        country: 'Germany',
        established: 1880,
        market_share_korea: 25,
        notation_system: 'level/reflection',
        characteristics: '쿨톤 색상 및 선명한 발색력 우수',
        popular_levels: [6, 7, 8, 9, 10],
        description: '140년 전통의 독일 프리미엄 헤어컬러 브랜드'
    },

    milbon: {
        name: 'Milbon Professional',
        country: 'Japan',
        established: 1960,
        market_share_korea: 20,
        notation_system: 'level-reflection',
        characteristics: '아시아인 모발 특화, 자연스러운 발색',
        popular_levels: [6, 7, 8, 9, 13],
        description: '일본 프리미엄 헤어케어 브랜드, 아시아인 특화'
    }
};

// 반사빛 색상 표기법 통합 매핑
export const REFLECTION_MAPPING = {
    red: {
        loreal: '.66', // 강한 적색
        wella: '/5',   // 마호가니
        milbon: '-50', // 레드
        description: '적색 반사빛',
        color_family: 'red',
        temperature: 'warm'
    },
    orange: {
        loreal: '.44', // 강한 구리색
        wella: '/44',  // 인텐스 구리색
        milbon: '-40', // 오렌지
        description: '주황색 반사빛',
        color_family: 'orange',
        temperature: 'warm'
    },
    yellow: {
        loreal: '.3',  // 골든
        wella: '/3',   // 골든
        milbon: '-30', // 옐로우
        description: '금색 반사빛',
        color_family: 'yellow',
        temperature: 'warm'
    },
    green: {
        loreal: '.07', // 매트
        wella: '/2',   // 매트
        milbon: '-20', // 그린 (매트)
        description: '매트 (그린) 반사빛',
        color_family: 'green',
        temperature: 'cool'
    },
    ash: {
        loreal: '.1',  // 애쉬
        wella: '/1',   // 애쉬
        milbon: '-10', // 애쉬
        description: '애쉬 반사빛',
        color_family: 'ash',
        temperature: 'cool'
    },
    violet: {
        loreal: '.22', // 강한 바이올렛
        wella: '/6',   // 바이올렛
        milbon: '-60', // 바이올렛
        description: '보라색 반사빛',
        color_family: 'violet',
        temperature: 'cool'
    },
    brown: {
        loreal: '.0',  // 내추럴 브라운
        wella: '/00',  // 내추럴
        milbon: 'NB',  // 내추럴 브라운
        description: '자연 브라운',
        color_family: 'brown',
        temperature: 'neutral'
    }
};

// 로레알 프로페셔널 헤어컬러 차트 (논문 데이터 기반)
export const LOREAL_CHART = {
    brand: 'loreal',
    
    // 기본 색상 라인업
    color_range: {
        // 레드 계열
        '6.66': {
            name: 'Dark Red',
            level: 6,
            reflection: 'intense_red',
            cmyk: { c: 62.68, m: 80.41, y: 71.5, k: 35.74 },
            rgb: [105, 62, 45],
            hex: '#693E2D',
            lab: { l: 32.1, a: 18.7, b: 16.8 },
            pccs_tone: 'dark',
            season: 'autumn',
            temperature: 'warm',
            description: '진한 레드, 깊이감 있는 적색'
        },

        '7.44': {
            name: 'Medium Copper',
            level: 7,
            reflection: 'intense_copper',
            cmyk: { c: 64.81, m: 77.22, y: 77.48, k: 41.9 },
            rgb: [98, 58, 35],
            hex: '#623A23',
            lab: { l: 30.2, a: 15.8, b: 19.7 },
            pccs_tone: 'deep',
            season: 'autumn',
            temperature: 'warm',
            description: '미디엄 구리색, 따뜻한 오렌지 브라운'
        },

        '9.3': {
            name: 'Very Light Golden Blonde',
            level: 9,
            reflection: 'golden',
            cmyk: { c: 32.46, m: 44.02, y: 61, k: 0 },
            rgb: [185, 142, 98],
            hex: '#B98E62',
            lab: { l: 62.1, a: 12.4, b: 28.9 },
            pccs_tone: 'bright',
            season: 'spring',
            temperature: 'warm',
            description: '베리 라이트 골든 블론드, 화사한 금발'
        },

        '8.07': {
            name: 'Light Natural Matt',
            level: 8,
            reflection: 'matt',
            cmyk: { c: 67.99, m: 64.29, y: 78.02, k: 26.88 },
            rgb: [78, 65, 42],
            hex: '#4E412A',
            lab: { l: 29.8, a: 5.2, b: 15.7 },
            pccs_tone: 'dark',
            season: 'autumn',
            temperature: 'warm',
            description: '라이트 매트, 자연스러운 그린 베이스'
        },

        '8.1': {
            name: 'Light Ash Blonde',
            level: 8,
            reflection: 'ash',
            cmyk: { c: 46.82, m: 49.3, y: 52.23, k: 3.5 },
            rgb: [138, 125, 115],
            hex: '#8A7D73',
            lab: { l: 54.2, a: 3.8, b: 8.9 },
            pccs_tone: 'light',
            season: 'summer',
            temperature: 'cool',
            description: '라이트 애쉬 블론드, 차가운 회색톤'
        },

        '9.22': {
            name: 'Very Light Intense Violet',
            level: 9,
            reflection: 'intense_violet',
            cmyk: { c: 48.54, m: 64.01, y: 48.46, k: 1.28 },
            rgb: [132, 94, 118],
            hex: '#845E76',
            lab: { l: 45.8, a: 23.1, b: -2.1 },
            pccs_tone: 'soft',
            season: 'summer',
            temperature: 'cool',
            description: '베리 라이트 인텐스 바이올렛'
        },

        '5': {
            name: 'Light Brown',
            level: 5,
            reflection: 'natural',
            cmyk: { c: 80.43, m: 81.65, y: 84.68, k: 67.05 },
            rgb: [45, 38, 28],
            hex: '#2D261C',
            pccs_tone: 'dark',
            season: 'winter',
            temperature: 'cool',
            description: '라이트 브라운, 자연스러운 어두운 갈색'
        },

        '13': {
            name: 'Ultra Light Beige',
            level: 13,
            reflection: 'beige',
            cmyk: { c: 13.88, m: 25.39, y: 39.9, k: 0 },
            rgb: [220, 190, 152],
            hex: '#DCBE98',
            lab: { l: 78.1, a: 8.2, b: 18.7 },
            pccs_tone: 'pale',
            season:
