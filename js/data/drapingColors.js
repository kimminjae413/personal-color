// js/data/drapingColors.js

const DRAPING_COLORS = {
    temperature: {
        warm: [
            { 
                name: '골든 옐로우', 
                color: '#FFD700', 
                munsell: '5Y 8/12',
                spd: '따뜻한 황색 스펙트럼',
                description: '황금빛이 도는 따뜻한 노란색으로 웜톤의 대표 색상',
                wavelength: '570-590nm 주도',
                undertone: 'yellow-golden'
            },
            { 
                name: '코랄 오렌지', 
                color: '#FF7F50', 
                munsell: '5YR 7/12',
                spd: '복숭아 언더톤 강조',
                description: '산호색과 오렌지가 섞인 생기 넘치는 색상',
                wavelength: '590-620nm 주도',
                undertone: 'peach-coral'
            },
            { 
                name: '러스트 레드', 
                color: '#B7410E', 
                munsell: '5YR 4/14',
                spd: '웜톤 적색 성분',
                description: '녹이 슨 듯한 깊은 주황빛 빨강',
                wavelength: '620-750nm, 황색 성분 포함',
                undertone: 'rust-orange'
            },
            { 
                name: '올리브 그린', 
                color: '#8FBC8F', 
                munsell: '5GY 6/8',
                spd: '황록 혼합 스펙트럼',
                description: '황색이 가미된 따뜻한 녹색',
                wavelength: '520-570nm, 황색 성분 강함',
                undertone: 'yellow-green'
            }
        ],
        cool: [
            { 
                name: '아이시 핑크', 
                color: '#FF1493', 
                munsell: '5RP 6/14',
                spd: '차가운 마젠타 스펙트럼',
                description: '얼음처럼 차가운 느낌의 선명한 핑크',
                wavelength: '380-450nm + 620-750nm',
                undertone: 'blue-pink'
            },
            { 
                name: '로얄 블루', 
                color: '#4169E1', 
                munsell: '5PB 4/12',
                spd: '순수 청색 성분',
                description: '왕실을 상징하는 깊고 차가운 파란색',
                wavelength: '450-495nm 주도',
                undertone: 'pure-blue'
            },
            { 
                name: '에메랄드', 
                color: '#50C878', 
                munsell: '5G 6/12',
                spd: '청록 혼합 스펙트럼',
                description: '보석 에메랄드와 같은 청록색',
                wavelength: '495-520nm, 청색 성분 포함',
                undertone: 'blue-green'
            },
            { 
                name: '라벤더', 
                color: '#E6E6FA', 
                munsell: '5P 8/4',
                spd: '보라 언더톤',
                description: '라벤더 꽃과 같은 부드러운 보라색',
                wavelength: '380-450nm, 고명도',
                undertone: 'purple-white'
            }
        ]
    },
    
    brightness: {
        light: [
            { 
                name: '페일 핑크', 
                color: '#FFB6C1', 
                munsell: '5RP 8/6',
                spd: '고명도 핑크',
                description: '연한 분홍색, 봄의 벚꽃 같은 색상',
                lightness: 'high (Value 8)',
                effect: '부드럽고 여성스러운 인상'
            },
            { 
                name: '베이비 블루', 
                color: '#87CEEB', 
                munsell: '5PB 8/4',
                spd: '고명도 청색',
                description: '하늘색처럼 맑고 밝은 파란색',
                lightness: 'high (Value 8)',
                effect: '깨끗하고 청순한 인상'
            },
            { 
                name: '크림 옐로우', 
                color: '#FFFACD', 
                munsell: '5Y 9/6',
                spd: '고명도 황색',
                description: '크림처럼 부드럽고 따뜻한 노란색',
                lightness: 'very high (Value 9)',
                effect: '온화하고 친근한 인상'
            },
            { 
                name: '민트 그린', 
                color: '#98FB98', 
                munsell: '5G 9/6',
                spd: '고명도 녹색',
                description: '민트잎처럼 시원하고 밝은 녹색',
                lightness: 'very high (Value 9)',
                effect: '상쾌하고 생기 있는 인상'
            }
        ],
        deep: [
            { 
                name: '딥 네이비', 
                color: '#000080', 
                munsell: '5PB 2/10',
                spd: '저명도 청색',
                description: '깊은 바다처럼 진한 남색',
                lightness: 'very low (Value 2)',
                effect: '고급스럽고 신뢰감 있는 인상'
            },
            { 
                name: '버건디', 
                color: '#800020', 
                munsell: '5R 3/12',
                spd: '저명도 적색',
                description: '와인처럼 깊고 진한 적포도색',
                lightness: 'low (Value 3)',
                effect: '우아하고 성숙한 인상'
            },
            { 
                name: '포레스트 그린', 
                color: '#228B22', 
                munsell: '5G 4/12',
                spd: '저명도 녹색',
                description: '깊은 숲처럼 진한 초록색',
                lightness: 'low (Value 4)',
                effect: '안정적이고 자연스러운 인상'
            },
            { 
                name: '자주색', 
                color: '#8B008B', 
                munsell: '5P 3/12',
                spd: '저명도 보라',
                description: '깊고 신비로운 보라색',
                lightness: 'low (Value 3)',
                effect: '고귀하고 신비로운 인상'
            }
        ]
    },
    
    saturation: {
        vivid: [
            { 
                name: '브라이트 레드', 
                color: '#FF0000', 
                munsell: '5R 5/16',
                spd: '최고채도 적색',
                description: '가장 선명하고 강렬한 빨간색',
                chroma: 'maximum (Chroma 16)',
                impact: '강렬하고 주목받는 인상'
            },
            { 
                name: '일렉트릭 블루', 
                color: '#0080FF', 
                munsell: '5PB 5/14',
                spd: '최고채도 청색',
                description: '전기처럼 강렬한 파란색',
                chroma: 'very high (Chroma 14)',
                impact: '현대적이고 역동적인 인상'
            },
            { 
                name: '라임 그린', 
                color: '#32CD32', 
                munsell: '5GY 6/14',
                spd: '최고채도 황녹',
                description: '라임처럼 선명하고 생동감 있는 녹색',
                chroma: 'very high (Chroma 14)',
                impact: '활기차고 에너지 넘치는 인상'
            },
            { 
                name: '핫 핑크', 
                color: '#FF69B4', 
                munsell: '5RP 6/14',
                spd: '최고채도 핑크',
                description: '뜨겁고 강렬한 분홍색',
                chroma: 'very high (Chroma 14)',
                impact: '대담하고 매력적인 인상'
            }
        ],
        muted: [
            { 
                name: '더스티 로즈', 
                color: '#BC8F8F', 
                munsell: '5R 6/6',
                spd: '저채도 핑크',
                description: '먼지가 앉은 듯 차분한 장미색',
                chroma: 'low (Chroma 6)',
                elegance: '세련되고 우아한 인상'
            },
            { 
                name: '세이지 그린', 
                color: '#9CAF88', 
                munsell: '5GY 7/4',
                spd: '저채도 녹색',
                description: '세이지 허브처럼 부드러운 녹색',
                chroma: 'low (Chroma 4)',
                elegance: '자연스럽고 차분한 인상'
            },
            { 
                name: '슬레이트 블루', 
                color: '#6A5ACD', 
                munsell: '5PB 5/8',
                spd: '저채도 청보라',
                description: '슬레이트 돌처럼 차분한 청보라색',
                chroma: 'medium (Chroma 8)',
                elegance: '지적이고 신중한 인상'
            },
            { 
                name: '모카 브라운', 
                color: '#D2B48C', 
                munsell: '5YR 7/6',
                spd: '저채도 황갈',
                description: '모카 커피처럼 부드러운 갈색',
                chroma: 'medium (Chroma 6)',
                elegance: '따뜻하고 편안한 인상'
            }
        ]
    }
};

// 드래이핑 단계별 설명
const DRAPING_STEPS = {
    temperature: {
        title: '온도감 분석 (Temperature)',
        theory: 'Von Kries 색채 적응 이론',
        description: '피부의 언더톤이 따뜻한지(황색) 차가운지(핑크/블루)를 판단합니다.',
        method: '따뜻한 색상군과 차가운 색상군을 번갈아 비교하며 관찰합니다.',
        observationTime: '각 색상당 3-5초, 총 2-3분 소요',
        scientificBasis: 'SPD(Spectral Power Distribution) 분석을 통한 언더톤 매칭'
    },
    brightness: {
        title: '명도 분석 (Value)',
        theory: 'Munsell 명도 척도 시스템',
        description: '개인에게 조화로운 색상의 밝기 범위를 찾습니다.',
        method: '밝은 색상과 깊은 색상의 대비 효과를 비교 관찰합니다.',
        observationTime: '각 색상당 3-5초, 총 2-3분 소요',
        scientificBasis: 'Value 0-10 척도를 기준으로 한 명도 조화 분석'
    },
    saturation: {
        title: '채도 분석 (Chroma)',
        theory: 'Munsell 채도 분석법',
        description: '색상의 선명도와 순수성 정도를 결정합니다.',
        method: '선명한 색상과 부드러운 색상의 조화도를 비교합니다.',
        observationTime: '각 색상당 3-5초, 총 2-3분 소요',
        scientificBasis: 'Chroma 0-16+ 척도를 기준으로 한 채도 적합성 분석'
    }
};

// 관찰 기준
const OBSERVATION_CRITERIA = {
    positive: {
        title: '긍정적 반응 (조화)',
        indicators: [
            '피부 내부 발광 증가 (Inner Glow)',
            '혈색 개선, 생기 있는 인상',
            '윤곽선 선명도 향상',
            '피부톤 균일화, 잡티 완화',
            '전체적 조화감, 자연스러움',
            '건강하고 젊어 보이는 효과'
        ]
    },
    negative: {
        title: '부정적 반응 (부조화)',
        indicators: [
            '피부 변색, 칙칙함 증가',
            '그림자 진함, 노화 인상',
            '윤곽 흐려짐, 피곤해 보임',
            '결점 강조, 피부 트러블 부각',
            '부자연스러운 대비, 어색함',
            '창백하거나 병든 듯한 인상'
        ]
    }
};

// 전역 접근을 위한 window 객체에 할당
window.DRAPING_COLORS = DRAPING_COLORS;
window.DRAPING_STEPS = DRAPING_STEPS;
window.OBSERVATION_CRITERIA = OBSERVATION_CRITERIA;
