/**
 * FashionStyling.js - 헤어디자이너용 퍼스널컬러 진단 시스템
 * 패션 스타일링 상세 가이드
 * 
 * 기능:
 * - 계절별 패션 색상 조합 추천
 * - 상황별 스타일링 가이드 (직장/캐주얼/파티/데이트)
 * - 체형별 맞춤 스타일링
 * - 액세서리 매칭 가이드
 * - 브랜드별 제품 추천
 * - 계절 트렌드 반영
 */

import { SEASONS } from '../data/seasons.js';
import { KOREAN_SKIN_TONES } from '../data/koreanSkinTones.js';

class FashionStyling {
    constructor() {
        this.fashionCategories = {
            basics: '기본 아이템',
            formal: '포멀웨어',
            casual: '캐주얼',
            party: '파티/이벤트',
            season: '계절별',
            accessories: '액세서리'
        };

        // 상황별 스타일링 데이터
        this.situationStyles = {
            office: {
                name: '직장/오피스',
                description: '프로페셔널하고 신뢰감 있는 이미지',
                priority: ['신뢰성', '전문성', '단정함']
            },
            casual: {
                name: '캐주얼/일상',
                description: '편안하고 자연스러운 일상 스타일',
                priority: ['편안함', '활동성', '개성']
            },
            date: {
                name: '데이트/소개팅',
                description: '매력적이고 품격 있는 스타일',
                priority: ['매력', '우아함', '친근함']
            },
            party: {
                name: '파티/이벤트',
                description: '화려하고 눈에 띄는 특별한 스타일',
                priority: ['화려함', '개성', '트렌디함']
            },
            wedding: {
                name: '결혼식/경조사',
                description: '격식 있고 품위 있는 예의 스타일',
                priority: ['예의', '품격', '조화']
            }
        };

        // 체형별 스타일링 가이드
        this.bodyTypeGuides = {
            rectangle: {
                name: '사각형 체형',
                characteristics: '어깨와 허리, 엉덩이가 비슷한 체형',
                strengths: ['균형잡힌 비율', '다양한 스타일 소화'],
                focuses: ['허리라인 강조', '곡선미 연출']
            },
            apple: {
                name: '사과형 체형',
                characteristics: '상체가 풍성하고 허리가 두꺼운 체형',
                strengths: ['세련된 상체라인', '긴 다리'],
                focuses: ['허리 커버', '하체 강조', '세로라인 연출']
            },
            pear: {
                name: '배형 체형',
                characteristics: '하체가 상체보다 풍성한 체형',
                strengths: ['슬림한 상체', '여성스러운 곡선'],
                focuses: ['상체 볼륨업', '하체 슬림 연출']
            },
            hourglass: {
                name: '모래시계 체형',
                characteristics: '허리가 잘록하고 상하체 균형이 잡힌 체형',
                strengths: ['완벽한 S라인', '여성스러운 실루엣'],
                focuses: ['허리라인 활용', '몸매 강조']
            }
        };

        // K-Fashion 브랜드 데이터베이스
        this.koreanBrands = {
            luxury: ['시즐', '윈터케이트', '더코엑스', '유니폼브릿지'],
            contemporary: ['에잇세컨즈', '스파오', '탑텐', '폴햄'],
            casual: ['유니클로', 'H&M', '자라', '르마샤']
        };

        this.initializeFashionData();
    }

    /**
     * 패션 데이터 초기화
     */
    initializeFashionData() {
        this.seasonalTrends = this.loadSeasonalTrends();
        this.colorCombinations = this.generateColorCombinations();
        this.accessoryGuide = this.generateAccessoryGuide();
    }

    /**
     * 메인 패션 스타일링 추천 생성
     * @param {Object} analysisResult - 퍼스널컬러 분석 결과
     * @param {Object} preferences - 고객 선호도 정보
     */
    generateFashionStyling(analysisResult, preferences = {}) {
        const {
            season,
            subseason,
            confidence,
            skinTone,
            colorPalette
        } = analysisResult;

        const {
            situation = 'casual',
            bodyType = 'rectangle',
            budget = 'medium',
            preferredStyles = [],
            ageGroup = '20s'
        } = preferences;

        return {
            overview: this.generateOverview(season, subseason, confidence),
            situationStyles: this.generateSituationStyles(season, colorPalette, situation),
            bodyTypeGuide: this.generateBodyTypeGuide(bodyType, season),
            colorCombinations: this.generateSeasonalCombinations(season, colorPalette),
            accessoryGuide: this.generateAccessoryRecommendations(season, colorPalette),
            shoppingGuide: this.generateShoppingGuide(season, budget),
            seasonalTrends: this.getSeasonalTrends(season),
            stylingTips: this.generateStylingTips(season, bodyType, ageGroup),
            brandRecommendations: this.generateBrandRecommendations(season, budget),
            wardrobe: this.generateWardrobeEssentials(season, situation)
        };
    }

    /**
     * 패션 스타일링 개요 생성
     */
    generateOverview(season, subseason, confidence) {
        const seasonData = SEASONS[season];
        
        return {
            title: `${seasonData.name} 타입 패션 스타일링 가이드`,
            subtitle: subseason ? `${subseason} 서브톤` : '',
            confidence: confidence,
            mainCharacteristics: seasonData.characteristics,
            styleKeywords: seasonData.styleKeywords || this.getStyleKeywords(season),
            colorPhilosophy: this.getColorPhilosophy(season),
            avoidColors: seasonData.avoid || [],
            description: this.getSeasonDescription(season)
        };
    }

    /**
     * 상황별 스타일링 생성
     */
    generateSituationStyles(season, colorPalette, preferredSituation) {
        const styles = {};
        
        Object.entries(this.situationStyles).forEach(([situation, info]) => {
            styles[situation] = {
                ...info,
                colors: this.selectSituationColors(season, colorPalette, situation),
                outfits: this.generateOutfitSuggestions(season, colorPalette, situation),
                styling: this.getSituationStylingTips(season, situation),
                accessories: this.getSituationAccessories(season, situation),
                budget: this.getSituationBudget(situation)
            };
        });

        return styles;
    }

    /**
     * 체형별 스타일링 가이드 생성
     */
    generateBodyTypeGuide(bodyType, season) {
        const guide = this.bodyTypeGuides[bodyType];
        const seasonData = SEASONS[season];
        
        return {
            ...guide,
            seasonalTips: this.getBodyTypeSeasonalTips(bodyType, season),
            recommendedSilhouettes: this.getRecommendedSilhouettes(bodyType, season),
            avoidSilhouettes: this.getAvoidSilhouettes(bodyType),
            colorPlacement: this.getColorPlacementGuide(bodyType, season),
            layeringTips: this.getLayeringTips(bodyType, season)
        };
    }

    /**
     * 계절별 색상 조합 생성
     */
    generateSeasonalCombinations(season, colorPalette) {
        const combinations = [];
        const seasonColors = colorPalette.primary.concat(colorPalette.secondary);
        
        // 기본 조합들
        combinations.push({
            type: 'monochromatic',
            name: '동일 계열 조합',
            description: '같은 색상의 다양한 톤으로 세련된 통일감 연출',
            combinations: this.generateMonochromaticCombos(seasonColors),
            situations: ['office', 'casual'],
            difficulty: 'easy'
        });

        combinations.push({
            type: 'analogous',
            name: '인접 색상 조합',
            description: '색상환에서 인접한 색들로 자연스러운 조화 연출',
            combinations: this.generateAnalogousCombos(seasonColors),
            situations: ['date', 'casual'],
            difficulty: 'medium'
        });

        combinations.push({
            type: 'complementary',
            name: '보색 조합',
            description: '대비되는 색상으로 강렬하고 인상적인 스타일',
            combinations: this.generateComplementaryCombos(seasonColors),
            situations: ['party', 'date'],
            difficulty: 'advanced'
        });

        combinations.push({
            type: 'triadic',
            name: '삼색 조합',
            description: '세 가지 색상의 균형잡힌 화려한 조합',
            combinations: this.generateTriadicCombos(seasonColors),
            situations: ['party', 'wedding'],
            difficulty: 'expert'
        });

        return combinations;
    }

    /**
     * 액세서리 추천 생성
     */
    generateAccessoryRecommendations(season, colorPalette) {
        return {
            jewelry: this.getJewelryRecommendations(season),
            bags: this.getBagRecommendations(season, colorPalette),
            shoes: this.getShoeRecommendations(season, colorPalette),
            scarves: this.getScarfRecommendations(season, colorPalette),
            belts: this.getBeltRecommendations(season),
            watches: this.getWatchRecommendations(season),
            sunglasses: this.getSunglassRecommendations(season)
        };
    }

    /**
     * 쇼핑 가이드 생성
     */
    generateShoppingGuide(season, budget) {
        const budgetLevels = {
            low: { name: '합리적 쇼핑', max: 300000 },
            medium: { name: '적정 예산', max: 800000 },
            high: { name: '프리미엄', max: 2000000 }
        };

        return {
            budgetLevel: budgetLevels[budget],
            priorityItems: this.getPriorityItems(season, budget),
            seasonalMustHaves: this.getSeasonalMustHaves(season),
            investmentPieces: this.getInvestmentPieces(season),
            trendyItems: this.getTrendyItems(season, budget),
            shoppingSchedule: this.getShoppingSchedule(season),
            brandSuggestions: this.getBudgetBrandSuggestions(season, budget)
        };
    }

    /**
     * 상황별 색상 선택
     */
    selectSituationColors(season, colorPalette, situation) {
        const seasonData = SEASONS[season];
        const allColors = [...colorPalette.primary, ...colorPalette.secondary];
        
        const situationColorPrefs = {
            office: {
                preferred: ['navy', 'grey', 'white', 'beige', 'burgundy'],
                avoid: ['neon', 'bright', 'fluorescent']
            },
            casual: {
                preferred: ['denim', 'white', 'khaki', 'soft colors'],
                avoid: ['formal black', 'shiny']
            },
            date: {
                preferred: ['soft pink', 'coral', 'powder blue', 'cream'],
                avoid: ['dark', 'aggressive']
            },
            party: {
                preferred: ['jewel tones', 'metallics', 'bold colors'],
                avoid: ['muted', 'pale']
            },
            wedding: {
                preferred: ['pastels', 'soft neutrals', 'elegant tones'],
                avoid: ['white', 'black', 'bright red']
            }
        };

        const prefs = situationColorPrefs[situation];
        return {
            main: allColors.filter(color => 
                prefs.preferred.some(pref => color.name.toLowerCase().includes(pref))
            ).slice(0, 3),
            accent: allColors.filter(color => 
                !prefs.avoid.some(avoid => color.name.toLowerCase().includes(avoid))
            ).slice(0, 2),
            neutral: this.getNeutralColors(season).slice(0, 2)
        };
    }

    /**
     * 아웃핏 제안 생성
     */
    generateOutfitSuggestions(season, colorPalette, situation) {
        const outfits = [];
        const situationData = this.situationStyles[situation];
        
        // 상황별 아웃핏 3개씩 생성
        for (let i = 0; i < 3; i++) {
            outfits.push({
                id: `${situation}_outfit_${i + 1}`,
                name: `${situationData.name} 스타일 ${i + 1}`,
                pieces: this.generateOutfitPieces(season, colorPalette, situation, i),
                colors: this.getOutfitColors(season, colorPalette, situation, i),
                styling: this.getOutfitStyling(season, situation, i),
                occasion: situationData.name,
                season: this.getCurrentSeason(),
                difficulty: i === 0 ? 'easy' : i === 1 ? 'medium' : 'advanced'
            });
        }
        
        return outfits;
    }

    /**
     * 아웃핏 구성 요소 생성
     */
    generateOutfitPieces(season, colorPalette, situation, variation) {
        const baseOutfits = {
            office: [
                {
                    top: '블라우스/셔츠',
                    bottom: '슬랙스/스커트',
                    outer: '블레이저/재킷',
                    shoes: '로퍼/펌프스',
                    bag: '토트백/브리프케이스'
                },
                {
                    top: '니트/카디건',
                    bottom: '팬츠/스커트',
                    outer: '코트/트렌치',
                    shoes: '옥스퍼드/앵클부츠',
                    bag: '크로스백/클러치'
                },
                {
                    top: '원피스',
                    bottom: null,
                    outer: '재킷/가디건',
                    shoes: '하이힐/플랫',
                    bag: '핸드백/숄더백'
                }
            ],
            casual: [
                {
                    top: 'T셔츠/탱크탑',
                    bottom: '진/레깅스',
                    outer: '후디/카디건',
                    shoes: '스니커즈/플랫',
                    bag: '백팩/크로스백'
                },
                {
                    top: '셔츠/블라우스',
                    bottom: '데님/치노',
                    outer: '가디건/자켓',
                    shoes: '로퍼/부츠',
                    bag: '토트백/숄더백'
                },
                {
                    top: '니트/스웨터',
                    bottom: '스커트/팬츠',
                    outer: '코트/점퍼',
                    shoes: '부츠/스니커즈',
                    bag: '백팩/클러치'
                }
            ],
            date: [
                {
                    top: '블라우스/니트',
                    bottom: '스커트/드레스팬츠',
                    outer: '카디건/블레이저',
                    shoes: '하이힐/로퍼',
                    bag: '클러치/미니백'
                },
                {
                    top: '원피스',
                    bottom: null,
                    outer: '재킷/가디건',
                    shoes: '펌프스/샌들',
                    bag: '핸드백/체인백'
                },
                {
                    top: '셔츠/톱',
                    bottom: '스커트/팬츠',
                    outer: '코트/자켓',
                    shoes: '부츠/하이힐',
                    bag: '숄더백/클러치'
                }
            ]
        };

        return baseOutfits[situation]?.[variation] || baseOutfits.casual[0];
    }

    /**
     * 보석 추천
     */
    getJewelryRecommendations(season) {
        const jewelryMap = {
            spring: {
                metals: ['골드', '옐로우 골드', '로즈 골드'],
                stones: ['다이아몬드', '시트린', '토파즈', '진주'],
                styles: ['섬세한', '화사한', '라운드 컷'],
                avoid: ['실버', '플래티넘', '다크 스톤']
            },
            summer: {
                metals: ['실버', '화이트 골드', '플래티넘'],
                stones: ['진주', '문스톤', '아쿠아마린', '사파이어'],
                styles: ['우아한', '클래식한', '매트 마감'],
                avoid: ['옐로우 골드', '브론즈', '오렌지 스톤']
            },
            autumn: {
                metals: ['골드', '브론즈', '코퍼'],
                stones: ['호박', '가넷', '루비', '토파즈'],
                stones: ['호박', '가넷', '루비', '토파즈'],
                styles: ['빈티지한', '따뜻한', '매트한'],
                avoid: ['실버', '차가운 블루 스톤']
            },
            winter: {
                metals: ['실버', '플래티넘', '화이트 골드'],
                stones: ['다이아몬드', '사파이어', '에메랄드', '루비'],
                styles: ['모던한', '시크한', '기하학적'],
                avoid: ['골드', '따뜻한 스톤', '매트 마감']
            }
        };

        return jewelryMap[season] || jewelryMap.spring;
    }

    /**
     * 가방 추천
     */
    getBagRecommendations(season, colorPalette) {
        const seasonData = SEASONS[season];
        const neutrals = this.getNeutralColors(season);
        
        return {
            everyday: {
                types: ['토트백', '숄더백', '크로스백'],
                colors: neutrals.slice(0, 3),
                materials: this.getSeasonalMaterials(season),
                brands: this.getBagBrands(season)
            },
            formal: {
                types: ['핸드백', '클러치', '브리프케이스'],
                colors: ['블랙', '네이비', '브라운'].filter(color => 
                    seasonData.primary.some(p => p.name.toLowerCase().includes(color))
                ),
                materials: ['가죽', '스웨이드', '캔버스'],
                brands: this.getFormalBagBrands(season)
            },
            evening: {
                types: ['클러치', '미니백', '체인백'],
                colors: colorPalette.accent || colorPalette.primary.slice(-2),
                materials: ['메탈릭', '비즈', '새틴'],
                brands: this.getEveningBagBrands(season)
            }
        };
    }

    /**
     * 신발 추천
     */
    getShoeRecommendations(season, colorPalette) {
        const neutrals = this.getNeutralColors(season);
        
        return {
            casual: {
                types: ['스니커즈', '로퍼', '플랫슈즈'],
                colors: [...neutrals, 'white', 'black'],
                styles: this.getCasualShoeStyles(season)
            },
            formal: {
                types: ['펌프스', '옥스퍼드', '앵클부츠'],
                colors: neutrals,
                styles: this.getFormalShoeStyles(season)
            },
            special: {
                types: ['하이힐', '샌들', '부츠'],
                colors: colorPalette.primary.slice(0, 2),
                styles: this.getSpecialShoeStyles(season)
            }
        };
    }

    /**
     * 헬퍼 메서드들
     */
    getStyleKeywords(season) {
        const keywords = {
            spring: ['생동감', '화사함', '경쾌함', '프레시', '내추럴'],
            summer: ['우아함', '로맨틱', '소프트', '시원함', '클래식'],
            autumn: ['따뜻함', '세련됨', '빈티지', '리치', '어스톤'],
            winter: ['시크함', '샤프함', '모던', '드라마틱', '쿨']
        };
        return keywords[season] || [];
    }

    getColorPhilosophy(season) {
        const philosophies = {
            spring: '따뜻하고 생동감 넘치는 색상으로 에너지 넘치는 이미지 연출',
            summer: '부드럽고 우아한 색상으로 세련된 여성미 표현',
            autumn: '깊고 풍부한 색상으로 성숙하고 지적인 매력 어필',
            winter: '선명하고 대비감 있는 색상으로 강렬한 개성 표현'
        };
        return philosophies[season] || '';
    }

    getSeasonDescription(season) {
        const descriptions = {
            spring: '봄의 신선함과 활기를 담은 스타일로, 밝고 경쾌한 색상을 통해 생명력 넘치는 이미지를 연출합니다.',
            summer: '여름의 시원함과 우아함을 표현하는 스타일로, 부드러운 파스텔 톤으로 로맨틱한 매력을 발산합니다.',
            autumn: '가을의 따뜻함과 깊이를 나타내는 스타일로, 어스 톤과 리치 컬러로 성숙한 세련미를 보여줍니다.',
            winter: '겨울의 선명함과 대비를 살린 스타일로, 쿨 톤과 강렬한 색상으로 시크한 도시적 매력을 연출합니다.'
        };
        return descriptions[season] || '';
    }

    getNeutralColors(season) {
        const neutrals = {
            spring: [
                { name: '아이보리', hex: '#FFF8E7' },
                { name: '베이지', hex: '#F5F5DC' },
                { name: '카멜', hex: '#C19A6B' }
            ],
            summer: [
                { name: '소프트 화이트', hex: '#F8F8FF' },
                { name: '그레이', hex: '#D3D3D3' },
                { name: '로즈 베이지', hex: '#E8C5B5' }
            ],
            autumn: [
                { name: '크림', hex: '#FFFDD0' },
                { name: '브라운', hex: '#A0522D' },
                { name: '올리브', hex: '#808000' }
            ],
            winter: [
                { name: '퓨어 화이트', hex: '#FFFFFF' },
                { name: '블랙', hex: '#000000' },
                { name: '쿨 그레이', hex: '#708090' }
            ]
        };
        return neutrals[season] || neutrals.spring;
    }

    getCurrentSeason() {
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4) return 'spring';
        if (month >= 5 && month <= 7) return 'summer';
        if (month >= 8 && month <= 10) return 'autumn';
        return 'winter';
    }

    // 더 많은 헬퍼 메서드들...
    getSeasonalMaterials(season) {
        const materials = {
            spring: ['코튼', '리넨', '실크', '라이트 니트'],
            summer: ['리넨', '쉬폰', '코튼', '레이온'],
            autumn: ['울', '가죽', '스웨이드', '헤비 니트'],
            winter: ['캐시미어', '울', '실크', '모헤어']
        };
        return materials[season] || materials.spring;
    }

    loadSeasonalTrends() {
        // 2025년 트렌드 데이터 (실제로는 API에서 로드)
        return {
            spring: ['파스텔 컬러', '플로럴 프린트', '오버사이즈', '레이어드'],
            summer: ['민트 그린', '화이트 앤 블루', '미니멀', '린넨 룩'],
            autumn: ['어스 톤', '체크 패턴', '오버코트', '부츠'],
            winter: ['모노톤', '퍼 디테일', '레더', '벨벳']
        };
    }
}

// 전역 인스턴스 생성
window.FashionStyling = new FashionStyling();

export default FashionStyling;
