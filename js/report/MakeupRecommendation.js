/**
 * 헤어디자이너용 퍼스널컬러 진단 - 메이크업 세부 추천 시스템
 * 계절별 맞춤 메이크업 추천, 브랜드별 제품 매칭, 단계별 튜토리얼
 * 
 * 주요 기능:
 * - 계절별 메이크업 색상 추천
 * - K-Beauty 브랜드 제품 매칭
 * - 얼굴형별 메이크업 기법
 * - 피부톤별 보정 가이드
 * - TPO별 메이크업 제안
 */

import { CONFIG } from '../config.js';
import { ColorSystem } from '../color/ColorSystem.js';
import { DeltaE } from '../color/DeltaE.js';
import { SEASONS } from '../data/seasons.js';
import { KOREAN_SKIN_TONES } from '../data/koreanSkinTones.js';

class MakeupRecommendation {
    constructor() {
        this.colorSystem = new ColorSystem();
        this.deltaE = new DeltaE();
        
        // K-Beauty 브랜드 데이터베이스
        this.brandDatabase = this.initializeBrandDatabase();
        
        // 메이크업 기법 데이터
        this.techniques = this.initializeTechniques();
        
        // 캐시
        this.recommendationCache = new Map();
        this.productMatchCache = new Map();
        
        console.log('[MakeupRecommendation] 초기화 완료');
    }

    /**
     * 종합 메이크업 추천 생성
     */
    async generateRecommendation(analysisData) {
        try {
            const cacheKey = this.generateCacheKey(analysisData);
            
            // 캐시 확인
            if (this.recommendationCache.has(cacheKey)) {
                console.log('[MakeupRecommendation] 캐시된 추천 사용');
                return this.recommendationCache.get(cacheKey);
            }

            console.log('[MakeupRecommendation] 새 추천 생성 중...');
            
            const recommendation = {
                // 기본 정보
                season: analysisData.season,
                skinTone: analysisData.skinTone,
                undertone: analysisData.undertone,
                
                // 베이스 메이크업
                base: await this.generateBaseRecommendation(analysisData),
                
                // 포인트 메이크업
                eyes: await this.generateEyeMakeupRecommendation(analysisData),
                lips: await this.generateLipMakeupRecommendation(analysisData),
                cheeks: await this.generateCheekMakeupRecommendation(analysisData),
                
                // 상황별 추천
                occasions: await this.generateOccasionRecommendations(analysisData),
                
                // 브랜드별 제품 매칭
                productMatches: await this.matchProducts(analysisData),
                
                // 메이크업 기법 가이드
                techniques: this.getTechniques(analysisData),
                
                // 주의사항 및 팁
                tips: this.generateTips(analysisData),
                
                // 생성 정보
                generatedAt: new Date().toISOString(),
                confidence: this.calculateConfidence(analysisData)
            };

            // 캐시 저장
            this.recommendationCache.set(cacheKey, recommendation);
            
            console.log(`[MakeupRecommendation] 추천 생성 완료 (신뢰도: ${recommendation.confidence}%)`);
            return recommendation;
            
        } catch (error) {
            console.error('[MakeupRecommendation] 추천 생성 실패:', error);
            throw error;
        }
    }

    /**
     * 베이스 메이크업 추천
     */
    async generateBaseRecommendation(analysisData) {
        const seasonData = SEASONS[analysisData.season];
        const skinToneData = KOREAN_SKIN_TONES.detailed_analysis[analysisData.season];
        
        // 파운데이션 색상 추천
        const foundationShades = this.recommendFoundationShades(analysisData);
        
        // 컨실러 추천
        const concealerShades = this.recommendConcealerShades(analysisData);
        
        // 파우더 추천
        const powderShades = this.recommendPowderShades(analysisData);

        return {
            foundation: {
                primaryShade: foundationShades.primary,
                alternativeShades: foundationShades.alternatives,
                undertoneCorrection: foundationShades.correction,
                application: {
                    technique: this.getFoundationTechnique(analysisData),
                    tools: ['쿠션 퍼프', '뷰티 블렌더', '파운데이션 브러시'],
                    layering: this.getLayeringGuide(analysisData)
                }
            },
            concealer: {
                shades: concealerShades,
                areas: this.getConcealerAreas(analysisData),
                technique: this.getConcealerTechnique(analysisData)
            },
            powder: {
                type: powderShades.type, // 'pressed', 'loose', 'setting'
                shade: powderShades.shade,
                application: powderShades.application
            },
            primer: {
                type: this.getPrimerType(analysisData),
                color: this.getPrimerColor(analysisData),
                benefits: this.getPrimerBenefits(analysisData)
            },
            tips: [
                '파운데이션은 목선까지 자연스럽게 블렌딩하세요',
                '컨실러는 파운데이션보다 한 톤 밝게 선택하세요',
                `${analysisData.season} 타입은 ${this.getSeasonSpecificBaseTip(analysisData.season)}`
            ]
        };
    }

    /**
     * 아이 메이크업 추천
     */
    async generateEyeMakeupRecommendation(analysisData) {
        const seasonData = SEASONS[analysisData.season];
        const eyeColors = this.getSeasonalEyeColors(analysisData.season);
        
        return {
            eyeshadow: {
                dailyPalette: {
                    base: eyeColors.neutral.base,
                    transition: eyeColors.neutral.transition,
                    accent: eyeColors.neutral.accent,
                    description: '자연스러운 일상 메이크업'
                },
                eveningPalette: {
                    base: eyeColors.dramatic.base,
                    transition: eyeColors.dramatic.transition,
                    accent: eyeColors.dramatic.accent,
                    liner: eyeColors.dramatic.liner,
                    description: '화려한 저녁 메이크업'
                },
                colorStory: eyeColors.story,
                application: this.getEyeshadowApplication(analysisData)
            },
            eyeliner: {
                dailyColor: eyeColors.liner.daily,
                dramaticColor: eyeColors.liner.dramatic,
                style: this.getEyelinerStyle(analysisData),
                technique: this.getEyelinerTechnique(analysisData)
            },
            mascara: {
                color: this.getMascaraColor(analysisData),
                type: this.getMascaraType(analysisData),
                application: this.getMascaraApplication(analysisData)
            },
            eyebrow: {
                color: this.getEyebrowColor(analysisData),
                style: this.getEyebrowStyle(analysisData),
                products: this.getEyebrowProducts(analysisData)
            },
            tips: [
                `${analysisData.season} 타입은 ${this.getSeasonEyeTip(analysisData.season)}`,
                '아이섀도우는 눈의 형태에 따라 그라데이션을 조절하세요',
                '언더톤에 맞는 아이브로우 컬러로 자연스러움을 연출하세요'
            ]
        };
    }

    /**
     * 립 메이크업 추천
     */
    async generateLipMakeupRecommendation(analysisData) {
        const seasonData = SEASONS[analysisData.season];
        const lipColors = this.getSeasonalLipColors(analysisData.season);
        
        return {
            daily: {
                colors: lipColors.daily,
                finish: this.getDailyLipFinish(analysisData),
                application: 'gradient 기법으로 자연스럽게',
                products: ['틴트', '립밤', '글로스']
            },
            evening: {
                colors: lipColors.evening,
                finish: this.getEveningLipFinish(analysisData),
                application: '또렷한 립라인으로 정확하게',
                products: ['매트 립스틱', '립라이너', '글로스']
            },
            special: {
                colors: lipColors.special,
                description: '특별한 날을 위한 시그니처 컬러',
                application: this.getSpecialLipApplication(analysisData)
            },
            lipcare: {
                preparation: [
                    '립스크럽으로 각질 제거',
                    '보습 립밤으로 수분 공급',
                    '프라이머로 색상 지속력 향상'
                ],
                maintenance: [
                    '하루 2-3회 립밤 발라주기',
                    '자기 전 집중 케어 팩',
                    '충분한 수분 섭취'
                ]
            },
            colorMatching: this.getLipColorMatching(analysisData),
            tips: [
                `${analysisData.season} 타입의 시그니처 립 컬러를 찾아보세요`,
                '립라이너를 활용해 입술 형태를 보정할 수 있어요',
                '같은 톤의 아이섀도우와 매칭하면 통일감이 생겨요'
            ]
        };
    }

    /**
     * 치크 메이크업 추천
     */
    async generateCheekMakeupRecommendation(analysisData) {
        const cheekColors = this.getSeasonalCheekColors(analysisData.season);
        
        return {
            blush: {
                daily: {
                    colors: cheekColors.daily,
                    application: this.getDailyCheekApplication(analysisData),
                    placement: this.getCheekPlacement(analysisData)
                },
                evening: {
                    colors: cheekColors.evening,
                    application: this.getEveningCheekApplication(analysisData),
                    contouring: this.getCheekContouring(analysisData)
                }
            },
            highlighter: {
                colors: this.getHighlighterColors(analysisData),
                placement: this.getHighlighterPlacement(analysisData),
                intensity: this.getHighlighterIntensity(analysisData)
            },
            contouring: {
                shades: this.getContourShades(analysisData),
                technique: this.getContourTechnique(analysisData),
                areas: this.getContourAreas(analysisData)
            },
            tips: [
                '치크는 웃을 때 올라오는 광대뼈 위에 발라주세요',
                '하이라이터는 얇게 여러 번 덧발라 자연스럽게',
                '컨투어링은 본인의 얼굴형을 고려해 적용하세요'
            ]
        };
    }

    /**
     * 상황별 메이크업 추천
     */
    async generateOccasionRecommendations(analysisData) {
        return {
            office: {
                description: '직장에서의 단정하고 깔끔한 메이크업',
                base: 'medium coverage foundation + setting powder',
                eyes: this.getOfficeMakeup(analysisData).eyes,
                lips: this.getOfficeMakeup(analysisData).lips,
                overall: 'natural and professional'
            },
            date: {
                description: '데이트를 위한 로맨틱 메이크업',
                base: 'dewy finish foundation + subtle glow',
                eyes: this.getDateMakeup(analysisData).eyes,
                lips: this.getDateMakeup(analysisData).lips,
                overall: 'romantic and feminine'
            },
            party: {
                description: '파티를 위한 글래머러스 메이크업',
                base: 'full coverage + dramatic highlight',
                eyes: this.getPartyMakeup(analysisData).eyes,
                lips: this.getPartyMakeup(analysisData).lips,
                overall: 'glamorous and bold'
            },
            wedding: {
                description: '결혼식을 위한 우아한 메이크업',
                base: 'long-lasting foundation + photo-ready finish',
                eyes: this.getWeddingMakeup(analysisData).eyes,
                lips: this.getWeddingMakeup(analysisData).lips,
                overall: 'elegant and timeless'
            },
            casual: {
                description: '캐주얼한 일상 메이크업',
                base: 'light coverage + natural finish',
                eyes: this.getCasualMakeup(analysisData).eyes,
                lips: this.getCasualMakeup(analysisData).lips,
                overall: 'effortless and fresh'
            }
        };
    }

    /**
     * 브랜드별 제품 매칭
     */
    async matchProducts(analysisData) {
        const matches = {
            foundation: [],
            lipstick: [],
            eyeshadow: [],
            blush: []
        };

        // 각 카테고리별로 브랜드 제품 매칭
        Object.keys(matches).forEach(category => {
            matches[category] = this.findBrandMatches(analysisData, category);
        });

        return matches;
    }

    /**
     * 브랜드 매칭 로직
     */
    findBrandMatches(analysisData, category) {
        const brandData = this.brandDatabase[category];
        const seasonColors = SEASONS[analysisData.season].colors;
        const matches = [];

        Object.keys(brandData).forEach(brand => {
            const products = brandData[brand];
            
            products.forEach(product => {
                const compatibility = this.calculateProductCompatibility(
                    product.color,
                    seasonColors,
                    analysisData
                );

                if (compatibility.score > 70) {
                    matches.push({
                        brand: brand,
                        product: product,
                        compatibility: compatibility,
                        category: category
                    });
                }
            });
        });

        return matches
            .sort((a, b) => b.compatibility.score - a.compatibility.score)
            .slice(0, 10); // 상위 10개만 반환
    }

    /**
     * 제품 호환성 계산
     */
    calculateProductCompatibility(productColor, seasonColors, analysisData) {
        let totalScore = 0;
        let matchCount = 0;

        // 계절 색상들과 Delta E 계산
        [...seasonColors.primary, ...seasonColors.neutral, ...seasonColors.accent]
            .forEach(seasonColor => {
                const productLab = this.colorSystem.hexToLab(productColor);
                const seasonLab = seasonColor.lab || this.colorSystem.hexToLab(seasonColor.hex);
                const deltaE = this.deltaE.calculate(productLab, seasonLab);
                
                if (deltaE < 20) {
                    const score = Math.max(0, 100 - deltaE * 3);
                    totalScore += score;
                    matchCount++;
                }
            });

        const averageScore = matchCount > 0 ? totalScore / matchCount : 0;
        
        // 언더톤 보정
        const undertoneBonus = this.getUndertoneBonus(productColor, analysisData.undertone);
        
        return {
            score: Math.min(100, averageScore + undertoneBonus),
            deltaE: matchCount > 0 ? totalScore / matchCount / 3 : 99,
            matchCount: matchCount,
            undertoneMatch: undertoneBonus > 0
        };
    }

    /**
     * 메이크업 기법 가져오기
     */
    getTechniques(analysisData) {
        return {
            faceShape: this.techniques.faceShape[analysisData.faceShape] || this.techniques.faceShape.oval,
            skinType: this.techniques.skinType[analysisData.skinType] || this.techniques.skinType.normal,
            eyeShape: this.techniques.eyeShape[analysisData.eyeShape] || this.techniques.eyeShape.almond,
            season: this.techniques.seasonal[analysisData.season]
        };
    }

    /**
     * 유틸리티 메서드들
     */
    recommendFoundationShades(analysisData) {
        const skinToneData = KOREAN_SKIN_TONES.detailed_analysis[analysisData.season];
        const baseShade = this.calculateBaseShade(analysisData.skinTone);
        
        return {
            primary: baseShade,
            alternatives: [
                this.adjustShade(baseShade, -1), // 한 톤 밝게
                this.adjustShade(baseShade, 1)   // 한 톤 어둡게
            ],
            correction: this.getUndertoneCorrection(analysisData.undertone)
        };
    }

    getSeasonalEyeColors(season) {
        const seasonData = SEASONS[season];
        
        return {
            neutral: {
                base: seasonData.colors.neutral[0]?.hex || '#F5F5F5',
                transition: seasonData.colors.neutral[1]?.hex || '#E0E0E0',
                accent: seasonData.colors.primary[0]?.hex || '#C0C0C0'
            },
            dramatic: {
                base: seasonData.colors.neutral[2]?.hex || '#A0A0A0',
                transition: seasonData.colors.primary[1]?.hex || '#808080',
                accent: seasonData.colors.accent[0]?.hex || '#606060',
                liner: seasonData.colors.accent[1]?.hex || '#404040'
            },
            liner: {
                daily: season === 'winter' ? '#2C2C2C' : '#4A4A4A',
                dramatic: '#000000'
            },
            story: this.getEyeColorStory(season)
        };
    }

    getSeasonalLipColors(season) {
        const seasonData = SEASONS[season];
        
        return {
            daily: seasonData.colors.primary.slice(0, 3).map(color => color.hex),
            evening: seasonData.colors.accent.slice(0, 3).map(color => color.hex),
            special: [seasonData.colors.accent[0]?.hex || '#FF0000']
        };
    }

    getSeasonalCheekColors(season) {
        const seasonData = SEASONS[season];
        
        return {
            daily: seasonData.colors.primary
                .filter(color => this.isSuitableForCheek(color.hex))
                .slice(0, 2),
            evening: seasonData.colors.accent
                .filter(color => this.isSuitableForCheek(color.hex))
                .slice(0, 2)
        };
    }

    initializeBrandDatabase() {
        return {
            foundation: {
                'hera': [
                    { name: 'Black Cushion', color: '#F2D2A7', shades: ['13', '21', '23'] },
                    { name: 'UV Mist Cushion', color: '#F5D5AA', shades: ['13', '21', '23', '25'] }
                ],
                'laneige': [
                    { name: 'Neo Cushion', color: '#F0D0A5', shades: ['11', '13', '21', '23'] },
                    { name: 'Layering Cover Cushion', color: '#F3D3A8', shades: ['13', '21', '23'] }
                ],
                'innisfree': [
                    { name: 'Super Volcanic Pore Clay Mask', color: '#EFD1A6', shades: ['13', '21', '23'] },
                    { name: 'My Foundation', color: '#F1D2A7', shades: ['13', '21', '23', '27'] }
                ]
            },
            lipstick: {
                'hera': [
                    { name: 'Rouge Holic', color: '#D2536F', finish: 'creamy' },
                    { name: 'Sensual Spicy Nude', color: '#C4475A', finish: 'matte' }
                ],
                'laneige': [
                    { name: 'Serum Intense Lipstick', color: '#E85A78', finish: 'satin' },
                    { name: 'Stained Glasstick', color: '#F06B89', finish: 'glossy' }
                ],
                'innisfree': [
                    { name: 'Vivid Creamy Tint', color: '#F2859A', finish: 'creamy' },
                    { name: 'Real Fit Velvet Lipstick', color: '#DE6B85', finish: 'matte' }
                ]
            },
            eyeshadow: {
                'hera': [
                    { name: 'Shadow Duo', colors: ['#E8C5A0', '#B08D57'] },
                    { name: 'Multi Eye Palette', colors: ['#F5E6D3', '#E0C2A0', '#C19B73', '#A67C52'] }
                ],
                'laneige': [
                    { name: 'Ideal Shadow Quad', colors: ['#F2E5D5', '#D6C0A8', '#B8956F', '#9A7B56'] },
                    { name: 'Eyeshadow Bar', colors: ['#E9D4C1', '#C8A882', '#A67F5B'] }
                ]
            },
            blush: {
                'hera': [
                    { name: 'Face Designing Blusher', color: '#F2A5A5', finish: 'matte' },
                    { name: 'Rouge Holic Cheek', color: '#E89FAA', finish: 'satin' }
                ],
                'laneige': [
                    { name: 'Ideal Blush', color: '#F5B8C4', finish: 'natural' },
                    { name: 'Multi Berry Blush', color: '#E6A0B5', finish: 'dewy' }
                ]
            }
        };
    }

    initializeTechniques() {
        return {
            faceShape: {
                oval: {
                    blush: '광대뼈 가장 높은 부위에 원형으로',
                    contour: '자연스러운 쉐딩으로 입체감만',
                    highlight: 'T존과 턱 끝에 포인트로'
                },
                round: {
                    blush: '광대뼈에서 관자놀이 방향으로 길게',
                    contour: '얼굴 외곽선을 따라 쉐딩',
                    highlight: 'T존을 강조해서 길어보이게'
                },
                square: {
                    blush: '광대뼈 중앙에 둥글게',
                    contour: '각진 턱선을 부드럽게 쉐딩',
                    highlight: '이마 중앙과 턱 중앙에'
                },
                heart: {
                    blush: '광대뼈에 넓게 펴 발라',
                    contour: '넓은 이마를 좁혀보이게',
                    highlight: '턱 끝을 강조해서 균형잡기'
                }
            },
            skinType: {
                normal: {
                    base: '세미 매트 파운데이션 추천',
                    powder: '루스파우더로 가볍게',
                    primer: '컬러 컨트롤 프라이머'
                },
                oily: {
                    base: '매트 롱웨어 파운데이션',
                    powder: '컴팩트 파우더로 유분 컨트롤',
                    primer: '포어 미니마이징 프라이머'
                },
                dry: {
                    base: '하이드레이팅 파운데이션',
                    powder: '세팅 파우더 최소량만',
                    primer: '모이스처라이징 프라이머'
                }
            },
            eyeShape: {
                almond: '기본적인 그라데이션 기법',
                monolid: '진한 색상으로 깊이감 연출',
                hooded: '아이섀도우를 눈썹 아래까지',
                round: '외측으로 길어보이게 연장'
            },
            seasonal: {
                spring: {
                    emphasis: '밝고 화사한 색상으로 생기 표현',
                    avoid: '너무 진하거나 스모키한 메이크업'
                },
                summer: {
                    emphasis: '쿨톤 베이스로 시원하고 우아하게',
                    avoid: '오렌지나 골드톤 사용'
                },
                autumn: {
                    emphasis: '따뜻하고 깊은 색감으로 성숙미',
                    avoid: '너무 밝거나 차가운 색상'
                },
                winter: {
                    emphasis: '선명하고 대비가 뚜렷한 컬러',
                    avoid: '중간톤이나 애매한 색상'
                }
            }
        };
    }

    generateTips(analysisData) {
        const seasonTips = {
            spring: [
                '코랄 핑크나 피치 톤이 얼굴을 화사하게 만듭니다',
                '골드 하이라이터로 건강한 윤기를 연출하세요',
                '아이브로우는 밝은 브라운 톤을 사용하세요'
            ],
            summer: [
                '로즈 핑크나 라벤더 톤이 우아함을 더합니다',
                '실버 하이라이터로 시원한 느낌을 주세요',
                '아이브로우는 회갈색 톤이 잘 어울립니다'
            ],
            autumn: [
                '브라운이나 오렌지 톤으로 따뜻함을 표현하세요',
                '브론즈 하이라이터로 깊은 윤기를 연출하세요',
                '아이브로우는 진한 브라운이 자연스럽습니다'
            ],
            winter: [
                '선명한 레드나 베리 톤으로 강렬함을 표현하세요',
                '실버나 화이트 하이라이터로 차가운 빛을 연출하세요',
                '아이브로우는 다크 브라운이나 블랙을 사용하세요'
            ]
        };

        const generalTips = [
            '메이크업 전 충분한 보습이 가장 중요합니다',
            '자신의 피부톤에 맞는 베이스 컬러를 찾는 것이 핵심입니다',
            '계절별 추천 컬러를 참고하되, 개인 취향도 고려하세요',
            '메이크업 도구를 깨끗하게 관리하여 피부트러블을 예방하세요'
        ];

        return {
            seasonal: seasonTips[analysisData.season] || [],
            general: generalTips,
            personalized: this.generatePersonalizedTips(analysisData)
        };
    }

    generatePersonalizedTips(analysisData) {
        const tips = [];

        if (analysisData.age) {
            if (analysisData.age < 25) {
                tips.push('젊은 피부에는 너무 진한 커버리지보다는 자연스러운 베이스가 좋습니다');
            } else if (analysisData.age > 40) {
                tips.push('성숙한 피부에는 보습력이 높은 제품으로 윤기를 살려주세요');
            }
        }

        if (analysisData.skinType === 'oily') {
            tips.push('T존 유분 컨트롤을 위해 포어 프라이머를 사용하세요');
        } else if (analysisData.skinType === 'dry') {
            tips.push('건조한 피부에는 글로우 베이스로 촉촉함을 연출하세요');
        }

        return tips;
    }

    // 헬퍼 메서드들
    generateCacheKey(analysisData) {
        return `makeup_${analysisData.season}_${analysisData.skinTone}_${analysisData.undertone}`;
    }

    calculateConfidence(analysisData) {
        let confidence = 80; // 기본값
        
        if (analysisData.lab_values) confidence += 10;
        if (analysisData.face_detection_score > 0.9) confidence += 5;
        if (analysisData.lighting_quality === 'good') confidence += 5;
        
        return Math.min(100, confidence);
    }

    calculateBaseShade(skinTone) {
        // 피부톤 데이터를 기반으로 파운데이션 쉐이드 계산
        if (skinTone.l > 70) return '#F5D5AA';
        if (skinTone.l > 60) return '#F0D0A5';
        if (skinTone.l > 50) return '#EBCBA0';
        return '#E6C69B';
    }

    adjustShade(baseShade, adjustment) {
        // 색상 밝기 조절
        const hsl = this.colorSystem.hexToHsl(baseShade);
        hsl.l = Math.max(0, Math.min(100, hsl.l + (adjustment * 5)));
        return this.colorSystem.hslToHex(hsl);
    }

    getUndertoneCorrection(undertone) {
        const corrections = {
            warm: { color: '#FFE5B4', description: '따뜻한 피치 톤' },
            cool: { color: '#F0E6FF', description: '쿨한 라벤더 톤' },
            neutral: { color: '#F5F5DC', description: '중성 베이지 톤' }
        };
        return corrections[undertone] || corrections.neutral;
    }

    getUndertoneBonus(color, undertone) {
        const colorTemp = this.getColorTemperature(color);
        if (undertone === 'warm' && colorTemp === 'warm') return 10;
        if (undertone === 'cool' && colorTemp === 'cool') return 10;
        if (undertone === 'neutral') return 5;
        return 0;
    }

    getColorTemperature(hex) {
        const hsl = this.colorSystem.hexToHsl(hex);
        const hue = hsl.h;
        
        // 따뜻한 색상 범위: 빨강-주황-노랑
        if ((hue >= 0 && hue <= 60) || (hue >= 300 && hue <= 360)) {
            return 'warm';
        }
        // 차가운 색상 범위: 파랑-초록-보라
        if (hue >= 120 && hue <= 300) {
            return 'cool';
        }
        return 'neutral';
    }

    isSuitableForCheek(hex) {
        const hsl = this.colorSystem.hexToHsl(hex);
        // 적절한 채도와 명도를 가진 색상인지 확인
        return hsl.s > 30 && hsl.s < 90 && hsl.l > 40 && hsl.l < 80;
    }

    getEyeColorStory(season) {
        const stories = {
            spring: '봄꽃처럼 화사하고 생기 넘치는 아이 메이크업',
            summer: '시원한 바람처럼 우아하고 깔끔한 아이 메이크업',
            autumn: '단풍잎처럼 깊고 따뜻한 아이 메이크업',
            winter: '눈꽃처럼 선명하고 드라마틱한 아이 메이크업'
        };
        return stories[season] || '계절에 어울리는 아이 메이크업';
    }

    // 상황별 메이크업 상세 메서드들은 필요에 따라 구현
    getOfficeMakeup(analysisData) {
        return {
            eyes: '중성 톤 아이섀도우로 자연스럽게',
            lips: '누드 베이지 톤이나 로즈 핑크'
        };
    }

    getDateMakeup(analysisData) {
        return {
            eyes: '소프트 글리터로 포인트 주기',
            lips: '글로시한 핑크나 코랄 톤'
        };
    }

    getPartyMakeup(analysisData) {
        return {
            eyes: '스모키 아이 또는 글리터 포인트',
            lips: '대담한 레드나 와인 톤'
        };
    }

    getWeddingMakeup(analysisData) {
        return {
            eyes: '클래식한 그라데이션',
            lips: '로맨틱한 로즈 핑크'
        };
    }

    getCasualMakeup(analysisData) {
        return {
            eyes: '마스카라만으로 간단하게',
            lips: '틴트나 립밤 정도'
        };
    }
}

export default MakeupRecommendation;
