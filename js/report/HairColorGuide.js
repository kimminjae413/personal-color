/**
 * 헤어디자이너용 퍼스널컬러 진단 - 헤어컬러 가이드 시스템
 * 계절별 헤어컬러 추천, 브랜드별 시술 가이드, 손상도 분석, 포뮬레이션 제안
 * 
 * 주요 기능:
 * - 퍼스널컬러 기반 헤어컬러 추천
 * - 로레알/웰라/밀본 브랜드별 시술 가이드
 * - 모발 손상도 분석 및 케어 방법
 * - 색상 변화 시뮬레이션
 * - 단계별 시술 프로세스
 */

import { CONFIG } from '../config.js';
import { ColorSystem } from '../color/ColorSystem.js';
import { DeltaE } from '../color/DeltaE.js';
import { SEASONS } from '../data/seasons.js';
import { HAIR_COLOR_CHARTS } from '../data/hairColorCharts.js';
import { KOREAN_SKIN_TONES } from '../data/koreanSkinTones.js';

class HairColorGuide {
    constructor() {
        this.colorSystem = new ColorSystem();
        this.deltaE = new DeltaE();
        
        // 헤어컬러 전문 데이터
        this.colorFormulations = this.initializeColorFormulations();
        this.damageAssessment = this.initializeDamageAssessment();
        this.careProtocols = this.initializeCareProtocols();
        
        // 캐시 시스템
        this.recommendationCache = new Map();
        this.formulationCache = new Map();
        
        console.log('[HairColorGuide] 헤어컬러 가이드 시스템 초기화 완료');
    }

    /**
     * 종합 헤어컬러 가이드 생성
     */
    async generateHairColorGuide(analysisData, hairData = {}) {
        try {
            const cacheKey = this.generateCacheKey(analysisData, hairData);
            
            if (this.recommendationCache.has(cacheKey)) {
                return this.recommendationCache.get(cacheKey);
            }

            console.log('[HairColorGuide] 헤어컬러 가이드 생성 중...');
            
            const guide = {
                // 기본 분석 정보
                personalColor: analysisData.season,
                skinTone: analysisData.skinTone,
                currentHair: hairData,
                
                // 추천 헤어컬러들
                recommendations: await this.generateColorRecommendations(analysisData, hairData),
                
                // 브랜드별 시술 가이드
                brandGuides: await this.generateBrandGuides(analysisData, hairData),
                
                // 시술 프로세스
                procedures: await this.generateProcedures(analysisData, hairData),
                
                // 모발 관리 가이드
                careGuide: await this.generateCareGuide(analysisData, hairData),
                
                // 색상 유지 관리
                maintenance: await this.generateMaintenanceGuide(analysisData, hairData),
                
                // 주의사항 및 전문가 팁
                professionalTips: this.generateProfessionalTips(analysisData, hairData),
                
                // 시뮬레이션 데이터
                colorSimulation: await this.generateColorSimulation(analysisData, hairData),
                
                generatedAt: new Date().toISOString(),
                confidence: this.calculateConfidence(analysisData, hairData)
            };

            // 캐시 저장
            this.recommendationCache.set(cacheKey, guide);
            
            console.log(`[HairColorGuide] 가이드 생성 완료 (신뢰도: ${guide.confidence}%)`);
            return guide;
            
        } catch (error) {
            console.error('[HairColorGuide] 가이드 생성 실패:', error);
            throw error;
        }
    }

    /**
     * 헤어컬러 추천 생성
     */
    async generateColorRecommendations(analysisData, hairData) {
        const seasonData = SEASONS[analysisData.season];
        const currentLevel = hairData.level || 3; // 기본값 3레벨 (한국인 자연모)
        
        const recommendations = {
            // 시그니처 컬러 (가장 추천)
            signature: await this.getSignatureColors(analysisData, currentLevel),
            
            // 자연스러운 컬러
            natural: await this.getNaturalColors(analysisData, currentLevel),
            
            // 트렌디한 컬러
            trendy: await this.getTrendyColors(analysisData, currentLevel),
            
            // 대담한 컬러 (도전적)
            bold: await this.getBoldColors(analysisData, currentLevel),
            
            // 하이라이트/로우라이트
            dimensional: await this.getDimensionalColors(analysisData, currentLevel),
            
            // 그라데이션/옴브레
            gradient: await this.getGradientColors(analysisData, currentLevel)
        };

        // 각 추천에 상세 정보 추가
        Object.keys(recommendations).forEach(category => {
            recommendations[category].forEach(rec => {
                rec.difficulty = this.calculateDifficulty(currentLevel, rec.targetLevel);
                rec.damage = this.calculateDamage(currentLevel, rec.targetLevel, rec.process);
                rec.maintenance = this.getMaintenanceLevel(rec);
                rec.cost = this.estimateCost(rec);
                rec.timeRequired = this.estimateTime(rec);
            });
        });

        return recommendations;
    }

    /**
     * 시그니처 컬러 추천
     */
    async getSignatureColors(analysisData, currentLevel) {
        const seasonData = SEASONS[analysisData.season];
        const colors = [];

        // 계절별 시그니처 컬러 로직
        switch (analysisData.season) {
            case 'spring':
                colors.push(
                    {
                        name: '웜 허니 브라운',
                        targetLevel: Math.max(currentLevel, 6),
                        baseColor: '#8B4513',
                        tone: 'warm',
                        process: currentLevel < 6 ? ['bleach', 'tone'] : ['tone'],
                        description: '봄의 따뜻함을 담은 꿀색 브라운',
                        suitability: 95
                    },
                    {
                        name: '골든 캐러멜',
                        targetLevel: Math.max(currentLevel, 7),
                        baseColor: '#D2691E',
                        tone: 'warm',
                        process: currentLevel < 7 ? ['bleach', 'tone'] : ['tone'],
                        description: '달콤한 캐러멜처럼 부드러운 골든 톤',
                        suitability: 90
                    }
                );
                break;

            case 'summer':
                colors.push(
                    {
                        name: '애쉬 브라운',
                        targetLevel: Math.max(currentLevel, 5),
                        baseColor: '#8B7355',
                        tone: 'cool',
                        process: ['tone'],
                        description: '시원하고 우아한 애쉬 톤 브라운',
                        suitability: 95
                    },
                    {
                        name: '쿨 베이지',
                        targetLevel: Math.max(currentLevel, 8),
                        baseColor: '#F5F5DC',
                        tone: 'cool',
                        process: currentLevel < 8 ? ['bleach', 'tone'] : ['tone'],
                        description: '차분하고 세련된 쿨 베이지',
                        suitability: 88
                    }
                );
                break;

            case 'autumn':
                colors.push(
                    {
                        name: '체스트넛 브라운',
                        targetLevel: Math.max(currentLevel, 4),
                        baseColor: '#800000',
                        tone: 'warm',
                        process: ['tone'],
                        description: '깊고 풍부한 밤색 브라운',
                        suitability: 95
                    },
                    {
                        name: '코퍼 레드',
                        targetLevel: Math.max(currentLevel, 6),
                        baseColor: '#B87333',
                        tone: 'warm',
                        process: currentLevel < 6 ? ['bleach', 'tone'] : ['tone'],
                        description: '따뜻한 구리빛 레드 브라운',
                        suitability: 92
                    }
                );
                break;

            case 'winter':
                colors.push(
                    {
                        name: '쿨 다크 브라운',
                        targetLevel: Math.max(currentLevel, 2),
                        baseColor: '#2F2F2F',
                        tone: 'cool',
                        process: currentLevel > 2 ? ['darken'] : ['tone'],
                        description: '선명하고 시원한 다크 브라운',
                        suitability: 95
                    },
                    {
                        name: '블루 블랙',
                        targetLevel: Math.max(currentLevel, 1),
                        baseColor: '#191970',
                        tone: 'cool',
                        process: ['darken', 'tone'],
                        description: '신비로운 블루 언더톤의 블랙',
                        suitability: 90
                    }
                );
                break;
        }

        return colors;
    }

    /**
     * 브랜드별 시술 가이드 생성
     */
    async generateBrandGuides(analysisData, hairData) {
        const guides = {
            loreal: await this.generateLorealGuide(analysisData, hairData),
            wella: await this.generateWellaGuide(analysisData, hairData),
            milbon: await this.generateMilbonGuide(analysisData, hairData)
        };

        return guides;
    }

    /**
     * 로레알 시술 가이드
     */
    async generateLorealGuide(analysisData, hairData) {
        const lorealChart = HAIR_COLOR_CHARTS.loreal;
        const recommendations = [];

        // 퍼스널컬러에 맞는 로레알 제품 찾기
        const seasonColors = SEASONS[analysisData.season].colors.primary;
        
        lorealChart.colors.forEach(product => {
            const compatibility = this.calculateBrandCompatibility(
                product, seasonColors, analysisData
            );
            
            if (compatibility.score > 75) {
                recommendations.push({
                    productCode: product.code,
                    productName: product.name,
                    level: product.level,
                    tone: product.tone,
                    formulation: this.getLorealFormulation(product, hairData),
                    processingTime: this.getLorealProcessingTime(product, hairData),
                    beforeCare: this.getLorealBeforeCare(product, hairData),
                    afterCare: this.getLorealAfterCare(product),
                    compatibility: compatibility,
                    professionalNotes: this.getLorealProfessionalNotes(product, hairData)
                });
            }
        });

        return {
            brand: 'L\'Oréal Professional',
            totalProducts: recommendations.length,
            recommendations: recommendations.sort((a, b) => b.compatibility.score - a.compatibility.score),
            systemGuide: {
                lightening: 'Blond Studio 시리즈 사용',
                toning: 'Dia Light / Dia Richesse 추천',
                permanent: 'Majirel 시리즈 활용',
                semiPermanent: 'Majirel Cool Cover 고려'
            },
            mixingRatios: this.getLorealMixingRatios(),
            troubleshooting: this.getLorealTroubleshooting()
        };
    }

    /**
     * 웰라 시술 가이드
     */
    async generateWellaGuide(analysisData, hairData) {
        const wellaChart = HAIR_COLOR_CHARTS.wella;
        const recommendations = [];

        const seasonColors = SEASONS[analysisData.season].colors.primary;
        
        wellaChart.colors.forEach(product => {
            const compatibility = this.calculateBrandCompatibility(
                product, seasonColors, analysisData
            );
            
            if (compatibility.score > 75) {
                recommendations.push({
                    productCode: product.code,
                    productName: product.name,
                    level: product.level,
                    tone: product.tone,
                    formulation: this.getWellaFormulation(product, hairData),
                    processingTime: this.getWellaProcessingTime(product, hairData),
                    beforeCare: this.getWellaBeforeCare(product, hairData),
                    afterCare: this.getWellaAfterCare(product),
                    compatibility: compatibility,
                    professionalNotes: this.getWellaProfessionalNotes(product, hairData)
                });
            }
        });

        return {
            brand: 'Wella Professionals',
            totalProducts: recommendations.length,
            recommendations: recommendations.sort((a, b) => b.compatibility.score - a.compatibility.score),
            systemGuide: {
                lightening: 'Blondor 시리즈 권장',
                toning: 'Color Touch 또는 Illumina 추천',
                permanent: 'Koleston Perfect 활용',
                creative: 'Color Fresh Create 고려'
            },
            mixingRatios: this.getWellaMixingRatios(),
            troubleshooting: this.getWellaTroubleshooting()
        };
    }

    /**
     * 시술 프로세스 가이드
     */
    async generateProcedures(analysisData, hairData) {
        const procedures = {};

        // 추천된 컬러들에 대한 시술 프로세스
        const recommendations = await this.generateColorRecommendations(analysisData, hairData);
        
        Object.keys(recommendations).forEach(category => {
            procedures[category] = recommendations[category].map(color => ({
                colorName: color.name,
                steps: this.generateStepByStepProcess(color, hairData),
                timeline: this.generateTimeline(color),
                materials: this.getMaterialsList(color),
                safetyNotes: this.getSafetyNotes(color)
            }));
        });

        return procedures;
    }

    /**
     * 단계별 시술 프로세스
     */
    generateStepByStepProcess(colorRec, hairData) {
        const steps = [];

        // 1. 사전 상담 및 준비
        steps.push({
            step: 1,
            title: '사전 상담 및 모발 진단',
            duration: '10-15분',
            description: '고객 상담, 모발 상태 체크, 알레르기 테스트',
            details: [
                '퍼스널컬러 진단 결과 확인',
                '현재 모발 레벨 측정',
                '모발 손상도 평가',
                '고객 라이프스타일 파악',
                '패치 테스트 실시'
            ],
            materials: ['색상환', '모발 진단 차트', '패치 테스트 키트']
        });

        // 2. 전처리
        if (colorRec.process.includes('bleach') || hairData.previousColor) {
            steps.push({
                step: 2,
                title: '모발 전처리',
                duration: '10-20분',
                description: '시술 전 모발 보호 및 준비',
                details: [
                    '보호 크림 도포',
                    '모발 섹셔닝',
                    '손상 부위 별도 처리',
                    '유수분 밸런스 조절'
                ],
                materials: ['보호 크림', '섹셔닝 클립', '전처리 트리트먼트']
            });
        }

        // 3. 탈색 (필요시)
        if (colorRec.process.includes('bleach')) {
            steps.push({
                step: steps.length + 1,
                title: '탈색 과정',
                duration: '30-60분',
                description: `${colorRec.targetLevel}레벨까지 탈색`,
                details: [
                    `목표 레벨: ${colorRec.targetLevel}`,
                    '탈색제 조합: 1:1.5 비율',
                    '15분마다 레벨 체크',
                    '끝부분부터 시작하여 뿌리 순서'
                ],
                materials: ['탈색 파우더', '과산화수소', '브러시', '타이머']
            });
        }

        // 4. 컬러링
        steps.push({
            step: steps.length + 1,
            title: '컬러 시술',
            duration: '30-45분',
            description: `${colorRec.name} 컬러 적용`,
            details: [
                `목표 컬러: ${colorRec.name}`,
                '염료 조합 확인',
                '균일한 도포',
                '적절한 처리 시간 준수'
            ],
            materials: ['헤어 컬러', '현색제', '도포 브러시', '타이머']
        });

        // 5. 후처리
        steps.push({
            step: steps.length + 1,
            title: '후처리 및 마무리',
            duration: '20-30분',
            description: '시술 후 케어 및 스타일링',
            details: [
                '컬러 고착 트리트먼트',
                '산성 린스',
                '보습 케어',
                '스타일링'
            ],
            materials: ['컬러 트리트먼트', '산성 린스', '헤어 에센스', '드라이어']
        });

        return steps;
    }

    /**
     * 모발 관리 가이드
     */
    async generateCareGuide(analysisData, hairData) {
        const currentLevel = hairData.level || 3;
        const damageLevel = this.assessDamageLevel(hairData);

        return {
            immediate: {
                title: '시술 직후 관리 (1주일)',
                guidelines: [
                    '48시간 샴푸 금지',
                    '뜨거운 물 사용 금지',
                    '헤어 드라이어 최소 사용',
                    '컬러 전용 샴푸 사용 시작'
                ],
                products: this.getImmediateCareProducts(analysisData.season),
                frequency: '매일'
            },
            shortTerm: {
                title: '단기 관리 (1-4주)',
                guidelines: [
                    '주 2-3회 딥 트리트먼트',
                    '자외선 차단',
                    '염소 노출 피하기',
                    '정기적 끝 정리'
                ],
                products: this.getShortTermCareProducts(analysisData.season),
                frequency: '주 2-3회'
            },
            longTerm: {
                title: '장기 관리 (1개월 이후)',
                guidelines: [
                    '4-6주마다 컬러 터치업',
                    '월 1회 살롱 트리트먼트',
                    '계절별 케어 방법 조정',
                    '건강한 생활습관 유지'
                ],
                products: this.getLongTermCareProducts(analysisData.season),
                frequency: '월 1-2회'
            },
            damageRecovery: damageLevel > 3 ? {
                title: '손상 회복 케어',
                duration: '2-3개월',
                intensiveCare: this.getIntensiveCareProtocol(damageLevel),
                professionalTreatments: [
                    '케라틴 트리트먼트',
                    '단백질 재생 케어',
                    '오일 트리트먼트',
                    'pH 밸런싱 케어'
                ],
                homecare: this.getHomeCareForDamage(damageLevel)
            } : null,
            seasonal: this.getSeasonalCareGuide(analysisData.season)
        };
    }

    /**
     * 색상 유지 가이드
     */
    async generateMaintenanceGuide(analysisData, hairData) {
        return {
            colorLongevity: {
                expected: this.calculateColorLongevity(analysisData, hairData),
                factors: [
                    '모발의 다공성',
                    '일상 생활 습관',
                    '사용하는 헤어 제품',
                    '열 스타일링 빈도',
                    '자외선 노출 정도'
                ]
            },
            touchUpSchedule: {
                roots: '4-6주마다',
                overall: '8-12주마다',
                gloss: '2-3주마다',
                description: '개인차에 따라 조정 가능'
            },
            homeCareTips: [
                '컬러 전용 샴푸 사용',
                '찬물 또는 미지근한 물로 헹구기',
                '주 2회 컬러 트리트먼트',
                '헤어 오일로 끝머리 보호',
                '자외선 차단 헤어 제품 사용'
            ],
            colorFading: {
                signs: [
                    '뿌리 새치 보임',
                    '전체적인 색상 바래짐',
                    '원하지 않는 톤 출현',
                    '윤기 감소'
                ],
                prevention: this.getColorFadingPrevention(analysisData.season),
                correction: this.getColorCorrection(analysisData.season)
            },
            seasonalAdjustment: this.getSeasonalColorAdjustment(analysisData.season)
        };
    }

    /**
     * 전문가 팁 생성
     */
    generateProfessionalTips(analysisData, hairData) {
        const seasonTips = {
            spring: [
                '웜톤 베이스에 골드나 허니 톤을 추가하면 자연스러운 볼륨감 연출',
                '너무 차가운 애쉬 톤은 피하고 따뜻한 브라운 계열 선택',
                '하이라이트 시 캐러멜이나 골든 톤으로 입체감 표현'
            ],
            summer: [
                '쿨톤 베이스로 애쉬나 베이지 톤이 가장 잘 어울림',
                '오렌지나 구리 톤은 피하고 중성적이거나 차가운 톤 선택',
                '실버 하이라이트로 세련된 느낌 연출 가능'
            ],
            autumn: [
                '깊고 풍부한 브라운 계열이 가장 적합',
                '레드나 구리 톤을 포인트로 활용하면 개성 표현',
                '너무 밝은 컬러보다는 중간~어두운 톤이 조화로움'
            ],
            winter: [
                '선명하고 대비가 뚜렷한 컬러가 잘 어울림',
                '다크 브라운이나 블랙 베이스에 쿨톤 포인트 추가',
                '중간톤보다는 확실한 다크나 밝은 톤 선택'
            ]
        };

        const generalTips = [
            '고객의 라이프스타일과 관리 의지를 충분히 상담하여 결정',
            '첫 시술 시에는 보수적으로 접근 후 점진적으로 변화',
            '피부톤과 헤어컬러의 조화가 전체적인 이미지를 좌우함',
            '계절별 추천을 기본으로 하되 개인의 취향도 고려 필요'
        ];

        const technicalTips = [
            '탈색 시 모발 상태를 15분마다 체크하여 과도한 손상 방지',
            '컬러 적용 시 뿌리와 끝머리의 처리 시간을 다르게 조절',
            '애프터 케어 제품 추천으로 컬러 지속성 향상',
            '정기적인 트리트먼트로 모발 건강 유지하며 컬러링 지속'
        ];

        return {
            seasonal: seasonTips[analysisData.season] || [],
            general: generalTips,
            technical: technicalTips,
            troubleshooting: this.getTroubleshootingTips(),
            consultation: this.getConsultationTips()
        };
    }

    /**
     * 색상 시뮬레이션 생성
     */
    async generateColorSimulation(analysisData, hairData) {
        const currentLevel = hairData.level || 3;
        const recommendations = await this.generateColorRecommendations(analysisData, hairData);
        
        const simulations = {};

        Object.keys(recommendations).forEach(category => {
            simulations[category] = recommendations[category].map(color => ({
                colorName: color.name,
                beforeColor: this.getCurrentHairColorHex(currentLevel),
                afterColor: color.baseColor,
                processSteps: this.getColorTransitionSteps(currentLevel, color),
                visualPreview: {
                    lightingEffects: this.getLightingEffects(color.baseColor),
                    skinHarmony: this.getSkinHarmonyScore(color.baseColor, analysisData),
                    complementaryColors: this.getComplementaryColors(color.baseColor)
                }
            }));
        });

        return simulations;
    }

    /**
     * 유틸리티 메서드들
     */
    calculateBrandCompatibility(product, seasonColors, analysisData) {
        if (!product.cmyk) return { score: 0, reason: 'No color data' };

        const productRgb = this.colorSystem.cmykToRgb(product.cmyk);
        const productHex = this.colorSystem.rgbToHex(productRgb);
        const productLab = this.colorSystem.hexToLab(productHex);

        let bestScore = 0;
        let bestMatch = null;

        seasonColors.forEach(seasonColor => {
            const seasonLab = seasonColor.lab || this.colorSystem.hexToLab(seasonColor.hex);
            const deltaE = this.deltaE.calculate(productLab, seasonLab);
            const score = Math.max(0, 100 - deltaE * 2);
            
            if (score > bestScore) {
                bestScore = score;
                bestMatch = seasonColor;
            }
        });

        return {
            score: bestScore,
            deltaE: bestScore > 0 ? (100 - bestScore) / 2 : 99,
            bestMatch: bestMatch,
            productColor: productHex
        };
    }

    calculateDifficulty(currentLevel, targetLevel) {
        const levelDiff = Math.abs(targetLevel - currentLevel);
        
        if (levelDiff <= 1) return 'easy';
        if (levelDiff <= 3) return 'moderate';
        if (levelDiff <= 5) return 'difficult';
        return 'expert';
    }

    calculateDamage(currentLevel, targetLevel, process) {
        let damageScore = 0;
        
        if (process.includes('bleach')) {
            const levelIncrease = Math.max(0, targetLevel - currentLevel);
            damageScore += levelIncrease * 15;
        }
        
        if (process.includes('tone')) {
            damageScore += 10;
        }

        if (damageScore <= 20) return 'minimal';
        if (damageScore <= 40) return 'moderate';
        if (damageScore <= 60) return 'significant';
        return 'high';
    }

    getMaintenanceLevel(colorRec) {
        if (colorRec.targetLevel >= 8) return 'high';
        if (colorRec.targetLevel >= 6) return 'moderate';
        return 'low';
    }

    estimateCost(colorRec) {
        let baseCost = 80000; // 기본 컬러링 비용
        
        if (colorRec.process.includes('bleach')) {
            baseCost += 30000;
        }
        
        if (colorRec.targetLevel >= 8) {
            baseCost += 20000;
        }

        return {
            min: baseCost,
            max: baseCost + 30000,
            currency: 'KRW'
        };
    }

    estimateTime(colorRec) {
        let baseTime = 60; // 분
        
        if (colorRec.process.includes('bleach')) {
            baseTime += 60;
        }
        
        if (colorRec.difficulty === 'expert') {
            baseTime += 30;
        }

        return {
            min: baseTime,
            max: baseTime + 30,
            unit: 'minutes'
        };
    }

    assessDamageLevel(hairData) {
        let damageScore = 0;
        
        if (hairData.previousColor) damageScore += 2;
        if (hairData.chemicalTreatments) damageScore += 1;
        if (hairData.heatStyling === 'frequent') damageScore += 1;
        if (hairData.porosity === 'high') damageScore += 2;
        
        return Math.min(5, damageScore);
    }

    // 브랜드별 상세 메서드들
    getLorealFormulation(product, hairData) {
        return {
            colorTube: `${product.code} - 50ml`,
            developer: '20vol (6%) - 75ml',
            mixingRatio: '1:1.5',
            additives: hairData.damage > 2 ? ['Bond Protector 5ml'] : [],
            processingTime: '35분'
        };
    }

    getWellaFormulation(product, hairData) {
        return {
            colorTube: `${product.code} - 60ml`,
            developer: 'Welloxon Perfect 20vol - 90ml',
            mixingRatio: '1:1.5',
            additives: hairData.damage > 2 ? ['Wellaplex No.1 - 4ml'] : [],
            processingTime: '30분'
        };
    }

    getLorealMixingRatios() {
        return {
            standard: '1:1.5 (컬러:현색제)',
            toning: '1:2 (컬러:현색제)',
            intensive: '1:1 (컬러:현색제)'
        };
    }

    getWellaMixingRatios() {
        return {
            standard: '1:1.5 (컬러:현색제)',
            pastel: '1:2 (컬러:현색제)',
            intensive: '1:1 (컬러:현색제)'
        };
    }

    getNaturalColors(analysisData, currentLevel) {
        const colors = [];
        const season = analysisData.season;
        
        // 계절별 자연스러운 컬러
        switch (season) {
            case 'spring':
                colors.push({
                    name: '내추럴 브라운',
                    targetLevel: Math.max(currentLevel, 4),
                    baseColor: '#6B4423',
                    process: ['tone'],
                    suitability: 88
                });
                break;
            case 'summer':
                colors.push({
                    name: '소프트 애쉬',
                    targetLevel: Math.max(currentLevel, 5),
                    baseColor: '#7A6A5C',
                    process: ['tone'],
                    suitability: 90
                });
                break;
        }
        
        return colors;
    }

    getTrendyColors(analysisData, currentLevel) {
        // 2024년 트렌드 컬러들
        return [
            {
                name: '모카 브라운',
                targetLevel: Math.max(currentLevel, 5),
                baseColor: '#8B4513',
                process: currentLevel < 5 ? ['bleach', 'tone'] : ['tone'],
                suitability: 85,
                trend: '2024 FW'
            }
        ];
    }

    getBoldColors(analysisData, currentLevel) {
        return [
            {
                name: '플래티넘 블론드',
                targetLevel: 10,
                baseColor: '#F5F5DC',
                process: ['bleach', 'tone'],
                suitability: analysisData.season === 'winter' ? 80 : 60,
                maintenance: 'high'
            }
        ];
    }

    getDimensionalColors(analysisData, currentLevel) {
        return [
            {
                name: '3D 하이라이트',
                baseLevel: currentLevel,
                highlightLevel: currentLevel + 3,
                technique: 'foiling',
                suitability: 85
            }
        ];
    }

    getGradientColors(analysisData, currentLevel) {
        return [
            {
                name: '옴브레 그라데이션',
                rootLevel: currentLevel,
                endLevel: currentLevel + 4,
                technique: 'balayage',
                suitability: 80
            }
        ];
    }

    generateCacheKey(analysisData, hairData) {
        return `hair_${analysisData.season}_${hairData.level || 3}_${hairData.damage || 0}`;
    }

    calculateConfidence(analysisData, hairData) {
        let confidence = 75;
        
        if (analysisData.lab_values) confidence += 10;
        if (hairData.level) confidence += 5;
        if (hairData.previousColor) confidence += 5;
        if (analysisData.face_detection_score > 0.8) confidence += 5;
        
        return Math.min(100, confidence);
    }

    initializeColorFormulations() {
        return {
            bleaching: {
                gentle: { powder: 30, developer: 45, time: 30 },
                medium: { powder: 40, developer: 60, time: 45 },
                intensive: { powder: 50, developer: 75, time: 60 }
            },
            toning: {
                light: { color: 10, developer: 20, time: 20 },
                medium: { color: 15, developer: 30, time: 25 },
                deep: { color: 20, developer: 30, time: 30 }
            }
        };
    }

    initializeDamageAssessment() {
        return {
            level1: { description: '건강한 모발', care: 'basic' },
            level2: { description: '약간 손상', care: 'protective' },
            level3: { description: '중간 손상', care: 'restorative' },
            level4: { description: '심한 손상', care: 'intensive' },
            level5: { description: '매우 심한 손상', care: 'emergency' }
        };
    }

    initializeCareProtocols() {
        return {
            immediate: ['컬러 보호', '수분 공급', '큐티클 정리'],
            shortTerm: ['단백질 보충', '영양 공급', '탄력 회복'],
            longTerm: ['종합 케어', '예방 관리', '건강 유지']
        };
    }

    // 추가 헬퍼 메서드들
    getCurrentHairColorHex(level) {
        const levelColors = {
            1: '#1B1B1B', 2: '#2C2C2C', 3: '#3D3D3D',
            4: '#4F4F4F', 5: '#6B4E3D', 6: '#8B6F47',
            7: '#A0824E', 8: '#B8965F', 9: '#D4B578',
            10: '#F0E68C'
        };
        return levelColors[level] || '#3D3D3D';
    }

    getColorTransitionSteps(currentLevel, targetColor) {
        const steps = [];
        if (currentLevel < targetColor.targetLevel) {
            steps.push('탈색');
        }
        steps.push('컬러링');
        steps.push('토닝');
        return steps;
    }

    getLightingEffects(color) {
        return {
            natural: '자연광에서 부드러운 광택',
            indoor: '실내조명에서 따뜻한 느낌',
            led: 'LED 조명에서 선명한 발색'
        };
    }

    getSkinHarmonyScore(hairColor, analysisData) {
        const skinLab = analysisData.skinTone;
        const hairLab = this.colorSystem.hexToLab(hairColor);
        const deltaE = this.deltaE.calculate(skinLab, hairLab);
        
        return Math.max(0, 100 - deltaE);
    }

    getComplementaryColors(baseColor) {
        const hsl = this.colorSystem.hexToHsl(baseColor);
        const complementaryHue = (hsl.h + 180) % 360;
        
        return [
            this.colorSystem.hslToHex({ h: complementaryHue, s: hsl.s, l: hsl.l }),
            this.colorSystem.hslToHex({ h: (complementaryHue + 30) % 360, s: hsl.s * 0.7, l: hsl.l }),
            this.colorSystem.hslToHex({ h: (complementaryHue - 30) % 360, s: hsl.s * 0.7, l: hsl.l })
        ];
    }

    getImmediateCareProducts(season) {
        return {
            spring: ['웜톤 컬러 샴푸', '허니 트리트먼트', '골든 글로스'],
            summer: ['쿨톤 컬러 샴푸', '실버 트리트먼트', '애쉬 토너'],
            autumn: ['리치 컬러 샴푸', '너리싱 마스크', '브론즈 세럼'],
            winter: ['인텐시브 컬러 샴푸', '스트렝스닝 트리트먼트', '쿨 톤 글로스']
        }[season] || [];
    }

    getShortTermCareProducts(season) {
        return [
            '주간 딥 컨디셔닝 마스크',
            '컬러 보호 헤어 오일',
            'UV 프로텍션 스프레이',
            '단백질 트리트먼트'
        ];
    }

    getLongTermCareProducts(season) {
        return [
            '월간 살롱 트리트먼트',
            '컬러 리프레시 글로스',
            '영양 공급 앰플',
            '모발 끝 케어 세럼'
        ];
    }

    calculateColorLongevity(analysisData, hairData) {
        let baseWeeks = 6;
        
        if (hairData.porosity === 'high') baseWeeks -= 1;
        if (hairData.damage > 2) baseWeeks -= 1;
        if (hairData.level > 7) baseWeeks -= 1;
        
        return `${Math.max(3, baseWeeks)}-${baseWeeks + 2}주`;
    }

    getColorFadingPrevention(season) {
        return [
            '컬러 전용 제품 사용',
            '열 스타일링 최소화',
            '자외선 차단',
            '적정 온도로 세정'
        ];
    }

    getColorCorrection(season) {
        return {
            spring: '골든 글로스로 따뜻함 보완',
            summer: '실버 토너로 쿨함 유지',
            autumn: '앰버 트리트먼트로 깊이감 보강',
            winter: '아쿠아 토너로 선명도 복원'
        }[season] || '전문가와 상담 필요';
    }

    getSeasonalColorAdjustment(season) {
        return {
            spring: { adjust: 'warmer', timing: 'before_summer' },
            summer: { adjust: 'cooler', timing: 'before_winter' },
            autumn: { adjust: 'deeper', timing: 'before_winter' },
            winter: { adjust: 'brighter', timing: 'before_spring' }
        }[season];
    }

    getTroubleshootingTips() {
        return [
            '컬러가 너무 밝게 나온 경우: 저명도 토너로 조정',
            '원하지 않는 톤이 나온 경우: 반대 톤으로 중화',
            '불균일한 발색: 부분 보정 후 전체 톤 조정',
            '빠른 색 빠짐: 컬러 록 트리트먼트 적용'
        ];
    }

    getConsultationTips() {
        return [
            '고객의 라이프스타일 충분히 파악',
            '관리 의지와 시간 투자 가능성 확인',
            '이전 헤어 히스토리 상세 청취',
            '현실적인 기대치 조정 및 단계적 접근 제안'
        ];
    }

    getSeasonalCareGuide(season) {
        return {
            spring: {
                focus: '건조함 방지 및 윤기 관리',
                products: ['보습 샴푸', '영양 트리트먼트'],
                frequency: '주 2회'
            },
            summer: {
                focus: 'UV 차단 및 쿨링 케어',
                products: ['자외선 차단 스프레이', '쿨링 마스크'],
                frequency: '매일'
            },
            autumn: {
                focus: '수분 공급 및 영양 보충',
                products: ['인텐시브 마스크', '오일 트리트먼트'],
                frequency: '주 2-3회'
            },
            winter: {
                focus: '정전기 방지 및 보습',
                products: ['안티 스태틱 세럼', '딥 모이스처 마스크'],
                frequency: '주 3회'
            }
        }[season];
    }
}

export default HairColorGuide;
