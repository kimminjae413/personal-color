// js/data/seasons.js

const SEASONS = {
    'Spring Light': {
        colors: ['#FFF8E7', '#FFE5CC', '#FFD1DC', '#FFFACD', '#F0FFF0', '#E6E6FA'],
        characteristics: '밝고 따뜻한 톤, 부드러운 채도',
        munsell: '5Y 8/12 기준',
        celebrities: ['아이유', '태연', '박보영', '김태희'],
        bestColors: ['아이보리', '코랄 핑크', '피치', '라벤더'],
        worstColors: ['순백색', '검정색', '네이비', '와인 레드'],
        description: '봄 라이트는 따뜻하면서도 밝고 부드러운 색상이 특징입니다.',
        skinTone: '황색 언더톤이 있으면서 투명하고 깨끗한 피부',
        makeupTips: '코랄, 복숭아 계열의 자연스러운 메이크업',
        hairColors: ['골든 블론드', '허니 브라운', '따뜻한 브라운'],
        clothingColors: {
            basic: ['아이보리', '크림', '베이지', '캐멀'],
            accent: ['코랄', '피치', '라벤더', '민트'],
            avoid: ['순백', '검정', '회색', '네이비']
        }
    },

    'Spring True': {
        colors: ['#FFE135', '#FF6B47', '#FF8C94', '#98FB98', '#87CEEB', '#DDA0DD'],
        characteristics: '따뜻하고 선명한 톤, 중간 채도',
        munsell: '5YR 7/14 기준',
        celebrities: ['수지', '박민영', '김고은', '한지민'],
        bestColors: ['골든 옐로우', '코랄', '터키석', '라임'],
        worstColors: ['차가운 핑크', '실버', '네이비', '자주색'],
        description: '진정한 봄 타입으로 따뜻하고 생기 넘치는 색상이 어울립니다.',
        skinTone: '골든 언더톤, 건강한 혈색',
        makeupTips: '선명한 코랄, 골든 아이섀도',
        hairColors: ['골든 브라운', '구리색', '따뜻한 적갈색'],
        clothingColors: {
            basic: ['크림', '카키', '따뜻한 베이지'],
            accent: ['코랄', '황금색', '터키석', '라임'],
            avoid: ['검정', '순백', '회색', '보라']
        }
    },

    'Spring Deep': {
        colors: ['#FF4500', '#FFD700', '#32CD32', '#00CED1', '#FF69B4', '#DA70D6'],
        characteristics: '따뜻하고 깊은 톤, 높은 채도',
        munsell: '5YR 5/16 기준',
        celebrities: ['전지현', '송혜교', '한예슬', '김연아'],
        bestColors: ['딥 오렌지', '골든 옐로우', '에메랄드', '터키석'],
        worstColors: ['파스텔', '실버', '네이비', '보라'],
        description: '봄 딥은 따뜻하면서도 강렬하고 깊은 색상이 특징입니다.',
        skinTone: '진한 골든 언더톤, 풍부한 색감',
        makeupTips: '강렬한 레드, 골든 하이라이터',
        hairColors: ['다크 브라운', '구리색', '적갈색'],
        clothingColors: {
            basic: ['베이지', '카키', '브라운'],
            accent: ['딥 오렌지', '골드', '에메랄드', '터키석'],
            avoid: ['검정', '순백', '회색', '파스텔']
        }
    },

    'Summer Light': {
        colors: ['#E6E6FA', '#F0F8FF', '#F5F5DC', '#FFF8DC', '#E0FFFF', '#F0FFFF'],
        characteristics: '차가우면서 밝고 부드러운 톤',
        munsell: '5PB 8/6 기준',
        celebrities: ['한소희', '박신혜', '윤세아', '김지원'],
        bestColors: ['파스텔 핑크', '라벤더', '스카이 블루', '민트'],
        worstColors: ['오렌지', '골드', '따뜻한 브라운', '카키'],
        description: '여름 라이트는 차가우면서도 우아하고 부드러운 색상이 특징입니다.',
        skinTone: '핑크 언더톤, 섬세하고 투명한 피부',
        makeupTips: '로지 핑크, 쿨톤 아이섀도',
        hairColors: ['애쉬 브라운', '플래티넘 블론드', '차가운 브라운'],
        clothingColors: {
            basic: ['화이트', '그레이', '네이비'],
            accent: ['파스텔 핑크', '라벤더', '민트', '스카이블루'],
            avoid: ['오렌지', '골드', '카키', '브라운']
        }
    },

    'Summer True': {
        colors: ['#DDA0DD', '#B0C4DE', '#98FB98', '#F0E68C', '#FFB6C1', '#AFEEEE'],
        characteristics: '차가운 중간 톤, 중간 채도',
        munsell: '5P 6/8 기준',
        celebrities: ['김태리', '전도연', '손예진', '이영애'],
        bestColors: ['더스티 로즈', '라벤더', '세이지', '스틸 블루'],
        worstColors: ['선명한 오렌지', '골드', '브라운', '카키'],
        description: '진정한 여름 타입으로 우아하고 세련된 색상이 어울립니다.',
        skinTone: '쿨 언더톤, 균형잡힌 피부',
        makeupTips: '베리 톤, 쿨톤 브라운',
        hairColors: ['애쉬 브라운', '다크 블론드', '쿨톤 브라운'],
        clothingColors: {
            basic: ['네이비', '그레이', '화이트'],
            accent: ['더스티 로즈', '라벤더', '세이지', '스틸블루'],
            avoid: ['오렌지', '골드', '카키', '따뜻한 브라운']
        }
    },

    'Summer Deep': {
        colors: ['#4682B4', '#2F4F4F', '#800080', '#008B8B', '#CD5C5C', '#9370DB'],
        characteristics: '차가우면서 깊은 톤, 높은 명도 대비',
        munsell: '5PB 4/10 기준',
        celebrities: ['김나나', '한가인', '이나영', '김희선'],
        bestColors: ['딥 로즈', '스틸 블루', '진한 보라', '틸'],
        worstColors: ['오렌지', '골드', '황색', '따뜻한 색상'],
        description: '여름 딥은 차가우면서도 강렬하고 깊은 색상이 특징입니다.',
        skinTone: '진한 쿨 언더톤, 대비가 뚜렷한 피부',
        makeupTips: '베리 립, 스모키 아이',
        hairColors: ['다크 브라운', '블랙', '애쉬 브라운'],
        clothingColors: {
            basic: ['네이비', '차콜', '화이트'],
            accent: ['딥 로즈', '보라', '틸', '스틸블루'],
            avoid: ['오렌지', '골드', '황색', '브라운']
        }
    },

    'Autumn Soft': {
        colors: ['#BC8F8F', '#D2B48C', '#DEB887', '#F4A460', '#CD853F', '#DAA520'],
        characteristics: '따뜻하고 부드러운 톤, 저채도',
        munsell: '5YR 6/6 기준',
        celebrities: ['공효진', '김혜수', '라미란', '김희애'],
        bestColors: ['모카', '카키', '올리브', '머스타드'],
        worstColors: ['선명한 색상', '네온', '실버', '아이시 컬러'],
        description: '가을 소프트는 따뜻하면서도 차분하고 세련된 색상이 특징입니다.',
        skinTone: '따뜻한 언더톤, 부드러운 피부',
        makeupTips: '브라운 계열, 자연스러운 메이크업',
        hairColors: ['소프트 브라운', '헤이즐넛', '카라멜'],
        clothingColors: {
            basic: ['베이지', '카키', '브라운'],
            accent: ['모카', '올리브', '머스타드', '테라코타'],
            avoid: ['네온', '파스텔', '실버', '검정']
        }
    },

    'Autumn True': {
        colors: ['#FF8C00', '#DC143C', '#228B22', '#B8860B', '#D2691E', '#A0522D'],
        characteristics: '진정한 가을 톤, 따뜻하고 선명함',
        munsell: '5YR 5/14 기준',
        celebrities: ['김태희', '전지현', '송혜교', '고소영'],
        bestColors: ['터크만 골드', '러스트', '포레스트 그린', '딥 오렌지'],
        worstColors: ['파스텔', '네온', '실버', '쿨 톤'],
        description: '진정한 가을 타입으로 풍부하고 따뜻한 색상이 어울립니다.',
        skinTone: '골든 언더톤, 따뜻한 피부',
        makeupTips: '가을 컬러 립스틱, 골든 아이섀도',
        hairColors: ['골든 브라운', '적갈색', '구리색'],
        clothingColors: {
            basic: ['크림', '베이지', '브라운'],
            accent: ['골드', '러스트', '딥 그린', '오렌지'],
            avoid: ['파스텔', '실버', '검정', '네이비']
        }
    },

    'Autumn Deep': {
        colors: ['#800000', '#556B2F', '#8B4513', '#A0522D', '#CD853F', '#DAA520'],
        characteristics: '깊고 따뜻한 톤, 높은 채도',
        munsell: '5YR 3/12 기준',
        celebrities: ['차예련', '한지혜', '김사랑', '이보영'],
        bestColors: ['딥 버건디', '포레스트 그린', '초콜릿', '골드'],
        worstColors: ['파스텔', '네온', '실버', '아이시 컬러'],
        description: '가을 딥은 깊고 풍부한 따뜻한 색상이 특징입니다.',
        skinTone: '진한 골든 언더톤, 깊이 있는 피부',
        makeupTips: '딥 레드 립, 브론즈 메이크업',
        hairColors: ['다크 브라운', '초콜릿', '적갈색'],
        clothingColors: {
            basic: ['베이지', '브라운', '카키'],
            accent: ['버건디', '딥 그린', '골드', '초콜릿'],
            avoid: ['파스텔', '실버', '네이비', '검정']
        }
    },

    'Winter Bright': {
        colors: ['#FF0000', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#00FF00'],
        characteristics: '차가우면서 밝고 선명한 톤',
        munsell: '5R 5/16 기준',
        celebrities: ['이효리', '김윤아', '하지원', '전도연'],
        bestColors: ['브라이트 레드', '로얄 블루', '머젠타', '에메랄드'],
        worstColors: ['파스텔', '머드 톤', '브라운', '베이지'],
        description: '겨울 브라이트는 선명하고 강렬한 색상이 특징입니다.',
        skinTone: '쿨 언더톤, 선명한 대비',
        makeupTips: '브라이트 립, 진한 아이라인',
        hairColors: ['제트 블랙', '다크 브라운', '플래티넘 블론드'],
        clothingColors: {
            basic: ['화이트', '블랙', '네이비'],
            accent: ['브라이트 레드', '로얄블루', '머젠타', '에메랄드'],
            avoid: ['베이지', '브라운', '파스텔', '머드톤']
        }
    },

    'Winter True': {
        colors: ['#800020', '#000080', '#800080', '#006400', '#B22222', '#4169E1'],
        characteristics: '진정한 겨울 톤, 차갑고 깊음',
        munsell: '5PB 3/10 기준',
        celebrities: ['김태희', '이나영', '김희선', '한가인'],
        bestColors: ['딥 레드', '네이비', '보라', '에메랄드'],
        worstColors: ['따뜻한 색상', '파스텔', '브라운', '베이지'],
        description: '진정한 겨울 타입으로 깊고 차가운 색상이 어울립니다.',
        skinTone: '쿨 언더톤, 뚜렷한 대비',
        makeupTips: '베리 톤, 쿨톤 메이크업',
        hairColors: ['블랙', '다크 브라운', '애쉬 브라운'],
        clothingColors: {
            basic: ['화이트', '블랙', '네이비'],
            accent: ['딥 레드', '보라', '에메랄드', '로얄블루'],
            avoid: ['브라운', '베이지', '오렌지', '황색']
        }
    },

    'Winter Deep': {
        colors: ['#000000', '#2F4F4F', '#800080', '#8B0000', '#000080', '#4B0082'],
        characteristics: '깊고 차가운 톤, 최고 대비',
        munsell: '5PB 2/10 기준',
        celebrities: ['김나나', '한가인', '이나영', '김희선'],
        bestColors: ['순백색', '제트 블랙', '로얄 블루', '머젠타'],
        worstColors: ['베이지', '브라운', '주황', '황색'],
        description: '겨울 딥은 가장 강렬한 대비와 깊은 색상이 특징입니다.',
        skinTone: '뚜렷한 쿨 언더톤, 강한 대비',
        makeupTips: '드라마틱 메이크업, 진한 색상',
        hairColors: ['제트 블랙', '플래티넘 블론드', '실버'],
        clothingColors: {
            basic: ['순백', '제트블랙', '네이비'],
            accent: ['브라이트 레드', '로얄블루', '머젠타', '보라'],
            avoid: ['베이지', '브라운', '오렌지', '파스텔']
        }
    }
};

// 전역 접근을 위한 window 객체에 할당
window.SEASONS = SEASONS;
