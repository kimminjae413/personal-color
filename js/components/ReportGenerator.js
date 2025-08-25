/**
 * ReportGenerator.js
 * 퍼스널컬러 진단 보고서 생성기
 * - 메이크업, 패션, 헤어컬러 3개 영역 종합 보고서
 * - PDF 출력, 고객 공유, 프린트 최적화
 * - 브랜드 매칭 및 구체적 제품 추천
 */

class ReportGenerator {
    constructor(config = {}) {
        this.config = {
            language: config.language || 'ko',
            template: config.template || 'professional',
            branding: config.branding || 'default',
            printOptimized: config.printOptimized || true,
            ...config
        };

        // 보고서 템플릿 스타일
        this.templates = {
            professional: {
                colorScheme: 'minimal',
                layout: 'structured',
                fonts: ['Noto Sans KR', 'Inter']
            },
            salon: {
                colorScheme: 'branded',
                layout: 'visual',
                fonts: ['Noto Sans KR', 'Inter']
            }
        };

        // 보고서 데이터 캐시
        this.reportCache = new Map();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        console.log('✅ ReportGenerator 초기화 완료');
    }

    setupEventListeners() {
        // 보고서 생성 이벤트 리스너
        document.addEventListener('generateReport', this.handleGenerateReport.bind(this));
        document.addEventListener('exportPDF', this.handleExportPDF.bind(this));
        document.addEventListener('shareReport', this.handleShareReport.bind(this));
    }

    /**
     * 종합 보고서 생성 (메인 메서드)
     * @param {Object} analysisResult - 분석 결과 데이터
     * @param {Object} customerInfo - 고객 정보
     * @param {Object} options - 보고서 옵션
     */
    async generateComprehensiveReport(analysisResult, customerInfo, options = {}) {
        try {
            console.log('📊 종합 보고서 생성 시작');

            // 캐시 확인
            const cacheKey = this.generateCacheKey(analysisResult, customerInfo);
            if (this.reportCache.has(cacheKey) && !options.forceRefresh) {
                console.log('📋 캐시된 보고서 사용');
                return this.reportCache.get(cacheKey);
            }

            // 보고서 데이터 구조화
            const reportData = await this.structureReportData(analysisResult, customerInfo);

            // 3개 영역별 보고서 생성
            const sections = await Promise.all([
                this.generateMakeupSection(reportData),
                this.generateFashionSection(reportData),
                this.generateHairColorSection(reportData)
            ]);

            // 종합 보고서 조립
            const report = {
                metadata: this.generateMetadata(customerInfo, analysisResult),
                executiveSummary: this.generateExecutiveSummary(reportData),
                personalColorAnalysis: this.generateColorAnalysisSection(analysisResult),
                makeupRecommendations: sections[0],
                fashionStyling: sections[1],
                hairColorGuide: sections[2],
                shoppingGuide: this.generateShoppingGuide(reportData),
                maintenanceTips: this.generateMaintenanceTips(reportData),
                generatedAt: new Date().toISOString(),
                reportId: this.generateReportId()
            };

            // 캐시 저장
            this.reportCache.set(cacheKey, report);

            console.log('✅ 종합 보고서 생성 완료');
            return report;

        } catch (error) {
            console.error('❌ 보고서 생성 실패:', error);
            throw new Error(`보고서 생성 중 오류 발생: ${error.message}`);
        }
    }

    /**
     * 보고서 데이터 구조화
     */
    async structureReportData(analysisResult, customerInfo) {
        const {
            personalColorType,
            skinTone,
            colorMatching,
            confidenceScore,
            detailedAnalysis
        } = analysisResult;

        return {
            // 기본 정보
            customer: {
                name: customerInfo.name || '고객님',
                age: customerInfo.age,
                gender: customerInfo.gender,
                consultationDate: new Date().toLocaleDateString('ko-KR'),
                consultant: customerInfo.consultant || '퍼스널컬러 전문가'
            },

            // 퍼스널컬러 분석 결과
            colorProfile: {
                season: personalColorType.season, // spring, summer, autumn, winter
                subtype: personalColorType.subtype, // bright, light, soft, deep, etc.
                temperature: skinTone.temperature, // warm, cool, neutral
                undertone: skinTone.undertone, // yellow, pink, olive, neutral
                depth: skinTone.depth, // light, medium, deep
                clarity: skinTone.clarity, // clear, soft, muted
                confidence: confidenceScore
            },

            // 색상 매칭 데이터
            colorPalette: {
                bestColors: colorMatching.bestColors || [],
                avoidColors: colorMatching.avoidColors || [],
                neutralColors: colorMatching.neutralColors || [],
                accentColors: colorMatching.accentColors || []
            },

            // 상세 분석 데이터
            analysis: {
                skinAnalysis: detailedAnalysis.skinAnalysis,
                eyeAnalysis: detailedAnalysis.eyeAnalysis,
                hairAnalysis: detailedAnalysis.hairAnalysis,
                overallHarmony: detailedAnalysis.overallHarmony
            }
        };
    }

    /**
     * 메타데이터 생성
     */
    generateMetadata(customerInfo, analysisResult) {
        return {
            title: `${customerInfo.name || '고객님'}의 퍼스널컬러 진단 보고서`,
            subtitle: `${analysisResult.personalColorType.season} 타입 완벽 가이드`,
            consultant: customerInfo.consultant || '퍼스널컬러 전문가',
            salonName: customerInfo.salonName || 'Professional Hair Salon',
            date: new Date().toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            }),
            confidenceLevel: analysisResult.confidenceScore,
            analysisMethod: 'AI + 전문가 드레이핑',
            reportVersion: '2.1'
        };
    }

    /**
     * 요약 보고서 생성
     */
    generateExecutiveSummary(reportData) {
        const { colorProfile, customer } = reportData;
        const seasonKorean = this.getSeasonKorean(colorProfile.season);
        const subtypeKorean = this.getSubtypeKorean(colorProfile.subtype);

        return {
            keyFindings: [
                `${customer.name || '고객님'}은 **${seasonKorean} ${subtypeKorean}** 타입입니다`,
                `피부톤: ${this.getTemperatureKorean(colorProfile.temperature)} (${Math.round(colorProfile.confidence * 100)}% 확신도)`,
                `언더톤: ${this.getUndertoneKorean(colorProfile.undertone)}`,
                `깊이: ${this.getDepthKorean(colorProfile.depth)} / 선명도: ${this.getClarityKorean(colorProfile.clarity)}`
            ],
            
            quickRecommendations: {
                bestColors: reportData.colorPalette.bestColors.slice(0, 5),
                avoidColors: reportData.colorPalette.avoidColors.slice(0, 3),
                signatureColor: reportData.colorPalette.accentColors[0]
            },

            actionItems: [
                '메이크업: 베이스 메이크업 색상 교체 권장',
                '패션: 기본 아이템 컬러 업데이트',
                '헤어: 현재 모발 색상 최적화 또는 변경 고려'
            ],

            nextSteps: [
                '추천 제품 구매 가이드 확인',
                '계절별 스타일링 팁 적용',
                '6개월 후 재진단 예약 권장'
            ]
        };
    }

    /**
     * 퍼스널컬러 분석 섹션 생성
     */
    generateColorAnalysisSection(analysisResult) {
        return {
            title: '과학적 퍼스널컬러 분석 결과',
            
            technicalAnalysis: {
                colorSpace: 'CIE L*a*b*',
                standardIlluminant: 'D65 (자연광 6500K)',
                deltaE: 'CIE Delta E 2000',
                skinToneLab: analysisResult.skinTone.labValues,
                colorMatchingScore: analysisResult.colorMatching.overallScore
            },

            seasonAnalysis: {
                primarySeason: analysisResult.personalColorType.season,
                subtype: analysisResult.personalColorType.subtype,
                alternativeSeasons: analysisResult.personalColorType.alternatives || [],
                seasonCharacteristics: this.getSeasonCharacteristics(analysisResult.personalColorType.season),
                confidence: analysisResult.confidenceScore
            },

            colorHarmony: {
                dominantUndertone: analysisResult.skinTone.undertone,
                colorTemperature: analysisResult.skinTone.temperature,
                intensity: analysisResult.skinTone.intensity,
                clarity: analysisResult.skinTone.clarity,
                harmonizingColors: analysisResult.colorMatching.bestColors,
                contrastingColors: analysisResult.colorMatching.accentColors
            }
        };
    }

    /**
     * 메이크업 추천 섹션 생성
     */
    async generateMakeupSection(reportData) {
        const { colorProfile, colorPalette } = reportData;

        return {
            title: '메이크업 컬러 가이드',
            
            basePrep: {
                foundation: await this.getFoundationRecommendations(colorProfile),
                concealer: await this.getConcealerRecommendations(colorProfile),
                primer: await this.getPrimerRecommendations(colorProfile),
                powder: await this.getPowderRecommendations(colorProfile)
            },

            complexion: {
                blush: this.getBlushRecommendations(colorProfile, colorPalette),
                bronzer: this.getBronzerRecommendations(colorProfile),
                highlighter: this.getHighlighterRecommendations(colorProfile),
                contour: this.getContourRecommendations(colorProfile)
            },

            eyes: {
                eyeshadowPalette: this.getEyeshadowRecommendations(colorProfile, colorPalette),
                eyeliner: this.getEyelinerRecommendations(colorProfile),
                mascara: this.getMascaraRecommendations(colorProfile),
                eyebrows: this.getEyebrowRecommendations(colorProfile)
            },

            lips: {
                everyday: this.getLipColorRecommendations(colorProfile, 'everyday'),
                bold: this.getLipColorRecommendations(colorProfile, 'bold'),
                nude: this.getLipColorRecommendations(colorProfile, 'nude'),
                special: this.getLipColorRecommendations(colorProfile, 'special')
            },

            brandRecommendations: await this.getMakeupBrandRecommendations(colorProfile)
        };
    }

    /**
     * 패션 스타일링 섹션 생성
     */
    async generateFashionSection(reportData) {
        const { colorProfile, colorPalette } = reportData;

        return {
            title: '패션 스타일링 가이드',

            coreWardrobe: {
                basics: this.getBasicWardrobeColors(colorProfile, colorPalette),
                neutrals: this.getNeutralColors(colorProfile, colorPalette),
                accents: this.getAccentColors(colorProfile, colorPalette),
                patterns: this.getPatternRecommendations(colorProfile)
            },

            seasonalStyling: {
                spring: this.getSeasonalStyling(colorProfile, 'spring'),
                summer: this.getSeasonalStyling(colorProfile, 'summer'),
                autumn: this.getSeasonalStyling(colorProfile, 'autumn'),
                winter: this.getSeasonalStyling(colorProfile, 'winter')
            },

            occasion: {
                business: this.getOccasionStyling(colorProfile, 'business'),
                casual: this.getOccasionStyling(colorProfile, 'casual'),
                formal: this.getOccasionStyling(colorProfile, 'formal'),
                date: this.getOccasionStyling(colorProfile, 'date')
            },

            accessories: {
                jewelry: this.getJewelryRecommendations(colorProfile),
                bags: this.getBagColorRecommendations(colorProfile),
                scarves: this.getScarfColorRecommendations(colorProfile),
                shoes: this.getShoeColorRecommendations(colorProfile)
            }
        };
    }

    /**
     * 헤어컬러 가이드 섹션 생성
     */
    async generateHairColorSection(reportData) {
        const { colorProfile, analysis } = reportData;

        return {
            title: '헤어컬러 완벽 가이드',

            currentHairAnalysis: {
                naturalColor: analysis.hairAnalysis?.naturalColor,
                currentColor: analysis.hairAnalysis?.currentColor,
                condition: analysis.hairAnalysis?.condition,
                texture: analysis.hairAnalysis?.texture,
                harmonyScore: analysis.hairAnalysis?.harmonyWithSkinTone
            },

            recommendedColors: {
                primary: await this.getHairColorRecommendations(colorProfile, 'primary'),
                alternative: await this.getHairColorRecommendations(colorProfile, 'alternative'),
                highlights: await this.getHairColorRecommendations(colorProfile, 'highlights'),
                lowlights: await this.getHairColorRecommendations(colorProfile, 'lowlights')
            },

            brandSpecificGuide: {
                loreal: await this.getBrandSpecificHairColors(colorProfile, 'loreal'),
                wella: await this.getBrandSpecificHairColors(colorProfile, 'wella'),
                milbon: await this.getBrandSpecificHairColors(colorProfile, 'milbon')
            },

            techniques: {
                balayage: this.getHairTechniqueRecommendations(colorProfile, 'balayage'),
                ombre: this.getHairTechniqueRecommendations(colorProfile, 'ombre'),
                highlights: this.getHairTechniqueRecommendations(colorProfile, 'highlights'),
                singleProcess: this.getHairTechniqueRecommendations(colorProfile, 'single')
            },

            maintenance: {
                colorProtection: this.getHairMaintenanceGuide(colorProfile, 'protection'),
                homecare: this.getHairMaintenanceGuide(colorProfile, 'homecare'),
                salonSchedule: this.getHairMaintenanceGuide(colorProfile, 'schedule'),
                seasonalAdjustments: this.getHairMaintenanceGuide(colorProfile, 'seasonal')
            }
        };
    }

    /**
     * 쇼핑 가이드 생성
     */
    generateShoppingGuide(reportData) {
        return {
            title: '스마트 쇼핑 가이드',

            priorityPurchases: [
                '1순위: 베이스 메이크업 (파운데이션, 컨실러)',
                '2순위: 립 컬러 (데일리 + 포인트 컬러)',
                '3순위: 기본 의류 (상의 3벌, 블라우스 2벌)',
                '4순위: 액세서리 (스카프, 주얼리)',
                '5순위: 헤어컬러 변경 또는 관리'
            ],

            budgetPlanning: {
                essential: '필수 아이템 (15-20만원)',
                recommended: '권장 아이템 (30-40만원)',
                luxury: '프리미엄 아이템 (50만원+)'
            },

            brandGuide: {
                budget: '저예산 브랜드 추천',
                midRange: '중가 브랜드 추천',
                luxury: '럭셔리 브랜드 추천',
                korean: '한국 브랜드 특별 추천'
            },

            shoppingTips: [
                '색상 확인은 자연광에서 하세요',
                '테스터를 활용해 피부에 직접 발라보세요',
                '시즌 세일 기간을 활용하세요',
                '리뷰와 평점을 반드시 확인하세요'
            ]
        };
    }

    /**
     * 관리 팁 생성
     */
    generateMaintenanceTips(reportData) {
        return {
            title: '퍼스널컬러 활용법 & 관리 팁',

            dailyRoutine: {
                morning: '아침 메이크업 루틴',
                evening: '저녁 스킨케어 루틴',
                weekly: '주간 특별 관리',
                monthly: '월간 점검 사항'
            },

            seasonalAdjustments: {
                spring: '봄철 컬러 조정법',
                summer: '여름철 컬러 조정법',
                autumn: '가을철 컬러 조정법',
                winter: '겨울철 컬러 조정법'
            },

            troubleshooting: {
                commonMistakes: '흔한 실수들',
                quickFixes: '빠른 해결법',
                professionalHelp: '전문가 도움이 필요한 경우'
            },

            futureConsultations: {
                timeline: '재진단 권장 주기',
                changes: '변화 감지 포인트',
                updates: '트렌드 업데이트 방법'
            }
        };
    }

    /**
     * 파운데이션 추천
     */
    async getFoundationRecommendations(colorProfile) {
        const recommendations = {
            spring: {
                light: ['21N1', '21W1', 'NC20', 'Ivory'],
                medium: ['23N1', '23W1', 'NC25', 'Natural Beige'],
                deep: ['25N1', '25W1', 'NC30', 'Medium Beige']
            },
            summer: {
                light: ['21P1', '21N1', 'NW20', 'Pink Ivory'],
                medium: ['23P1', '23N1', 'NW25', 'Natural Pink'],
                deep: ['25P1', '25N1', 'NW30', 'Medium Pink']
            },
            autumn: {
                light: ['21W1', '21Y1', 'NC25', 'Warm Ivory'],
                medium: ['23W1', '23Y1', 'NC30', 'Warm Beige'],
                deep: ['25W1', '27W1', 'NC35', 'Deep Warm']
            },
            winter: {
                light: ['21N1', '21C1', 'NW20', 'Cool Ivory'],
                medium: ['23N1', '23C1', 'NW25', 'Cool Beige'],
                deep: ['25N1', '25C1', 'NW30', 'Cool Medium']
            }
        };

        const seasonRecs = recommendations[colorProfile.season] || recommendations.spring;
        const depthRecs = seasonRecs[colorProfile.depth] || seasonRecs.medium;

        return {
            primaryShades: depthRecs,
            brands: [
                { name: '정관장', shades: depthRecs.filter(shade => shade.includes('N1') || shade.includes('W1') || shade.includes('P1')) },
                { name: 'MAC', shades: depthRecs.filter(shade => shade.includes('NC') || shade.includes('NW')) },
                { name: 'FENTY Beauty', shades: depthRecs.filter(shade => !shade.includes('N1') && !shade.includes('NC')) }
            ],
            tips: [
                '목과 얼굴 경계선에서 테스트하세요',
                '자연광에서 확인하는 것이 가장 정확합니다',
                '계절에 따라 0.5톤 조정을 고려하세요'
            ]
        };
    }

    /**
     * 헤어컬러 추천 (브랜드별)
     */
    async getHairColorRecommendations(colorProfile, type = 'primary') {
        const { season, subtype, temperature, depth } = colorProfile;

        const baseRecommendations = {
            spring: {
                primary: ['6.3', '7.4', '8.34', '7.43'],
                alternative: ['6.34', '7.3', '8.4', '9.3'],
                highlights: ['8.34', '9.3', '10.34'],
                lowlights: ['5.34', '6.3', '5.43']
            },
            summer: {
                primary: ['7.1', '8.1', '6.12', '7.12'],
                alternative: ['8.12', '7.21', '6.1', '9.1'],
                highlights: ['9.1', '8.21', '10.1'],
                lowlights: ['6.1', '5.12', '6.21']
            },
            autumn: {
                primary: ['6.34', '5.35', '7.35', '6.43'],
                alternative: ['5.34', '6.35', '7.43', '4.35'],
                highlights: ['7.34', '8.34', '7.43'],
                lowlights: ['4.35', '5.34', '4.43']
            },
            winter: {
                primary: ['4.0', '5.0', '3.0', '6.1'],
                alternative: ['2.0', '4.1', '5.1', '6.12'],
                highlights: ['6.1', '7.1', '5.12'],
                lowlights: ['3.0', '2.0', '4.0']
            }
        };

        return baseRecommendations[season]?.[type] || baseRecommendations.spring.primary;
    }

    /**
     * 브랜드별 헤어컬러 매칭
     */
    async getBrandSpecificHairColors(colorProfile, brand) {
        const colorMap = {
            loreal: {
                spring: ['6.3 Dark Golden Blonde', '7.3 Medium Golden Blonde', '8.3 Light Golden Blonde'],
                summer: ['7.1 Medium Ash Blonde', '8.1 Light Ash Blonde', '6.12 Dark Iridescent Blonde'],
                autumn: ['6.34 Dark Golden Copper', '5.35 Light Auburn', '7.43 Medium Copper Gold'],
                winter: ['4.0 Natural Brown', '5.0 Light Brown', '3.0 Darkest Brown']
            },
            wella: {
                spring: ['7/3', '8/3', '6/73', '7/73'],
                summer: ['8/81', '7/81', '6/71', '9/81'],
                autumn: ['6/74', '5/75', '7/75', '6/43'],
                winter: ['4/0', '5/0', '3/0', '6/71']
            },
            milbon: {
                spring: ['7LB', '8LB', '6GB', '7GB'],
                summer: ['8LA', '7LA', '6MA', '9LA'],
                autumn: ['6CB', '5OB', '7OB', '6RB'],
                winter: ['4N', '5N', '3N', '6MA']
            }
        };

        const brandColors = colorMap[brand]?.[colorProfile.season] || colorMap.loreal.spring;

        return {
            recommendedShades: brandColors,
            processingNotes: this.getProcessingNotes(colorProfile, brand),
            maintenanceSchedule: this.getMaintenanceSchedule(colorProfile, brand)
        };
    }

    /**
     * 보고서 HTML 렌더링
     */
    renderReportHTML(report) {
        const template = this.templates[this.config.template];
        
        return `
            <!DOCTYPE html>
            <html lang="ko">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${report.metadata.title}</title>
                <style>
                    ${this.generateReportCSS(template)}
                </style>
            </head>
            <body>
                <div class="report-container">
                    ${this.renderHeader(report.metadata)}
                    ${this.renderExecutiveSummary(report.executiveSummary)}
                    ${this.renderColorAnalysis(report.personalColorAnalysis)}
                    ${this.renderMakeupSection(report.makeupRecommendations)}
                    ${this.renderFashionSection(report.fashionStyling)}
                    ${this.renderHairColorSection(report.hairColorGuide)}
                    ${this.renderShoppingGuide(report.shoppingGuide)}
                    ${this.renderMaintenanceTips(report.maintenanceTips)}
                    ${this.renderFooter(report.metadata)}
                </div>
            </body>
            </html>
        `;
    }

    /**
     * PDF 생성
     */
    async generatePDF(report, options = {}) {
        try {
            const html = this.renderReportHTML(report);
            
            // PDF 생성 옵션
            const pdfOptions = {
                format: 'A4',
                printBackground: true,
                preferCSSPageSize: true,
                margin: {
                    top: '20mm',
                    bottom: '20mm',
                    left: '15mm',
                    right: '15mm'
                },
                ...options
            };

            // 브라우저 환경에서는 클라이언트 사이드 PDF 생성
            if (typeof window !== 'undefined') {
                return await this.generateClientSidePDF(html, pdfOptions);
            }

            console.log('✅ PDF 생성 완료');
            return { html, options: pdfOptions };

        } catch (error) {
            console.error('❌ PDF 생성 실패:', error);
            throw error;
        }
    }

    /**
     * 유틸리티 메서드들
     */
    getSeasonKorean(season) {
        const seasonMap = {
            spring: '봄',
            summer: '여름',
            autumn: '가을',
            winter: '겨울'
        };
        return seasonMap[season] || season;
    }

    getSubtypeKorean(subtype) {
        const subtypeMap = {
            bright: '브라이트',
            light: '라이트',
            soft: '소프트',
            deep: '딥',
            warm: '웜',
            cool: '쿨',
            clear: '클리어',
            muted: '뮤티드'
        };
        return subtypeMap[subtype] || subtype;
    }

    generateCacheKey(analysisResult, customerInfo) {
        return `${customerInfo.name}_${analysisResult.personalColorType.season}_${analysisResult.personalColorType.subtype}_${Date.now()}`.replace(/\s+/g, '_');
    }

    generateReportId() {
        return 'RPT_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 이벤트 핸들러들
     */
    handleGenerateReport(event) {
        const { analysisResult, customerInfo, options } = event.detail;
        this.generateComprehensiveReport(analysisResult, customerInfo, options);
    }

    handleExportPDF(event) {
        const { report, options } = event.detail;
        this.generatePDF(report, options);
    }

    handleShareReport(event) {
        const { report, method } = event.detail;
        this.shareReport(report, method);
    }

    /**
     * 보고서 공유
     */
    async shareReport(report, method = 'url') {
        try {
            switch (method) {
                case 'url':
                    return this.generateShareableURL(report);
                case 'email':
                    return this.shareViaEmail(report);
                case 'kakao':
                    return this.shareViaKakao(report);
                case 'print':
                    return this.printReport(report);
                default:
                    throw new Error(`지원하지 않는 공유 방법: ${method}`);
            }
        } catch (error) {
            console.error('❌ 보고서 공유 실패:', error);
            throw error;
        }
    }

    /**
     * 성능 통계
     */
    getPerformanceStats() {
        return {
            cacheSize: this.reportCache.size,
            reportGenerated: this.reportCache.size,
            averageGenerationTime: this.averageGenerationTime || 0,
            memoryUsage: this.reportCache.size * 1024 // KB 단위 추정치
        };
    }
}

// 전역 객체로 등록
if (typeof window !== 'undefined') {
    window.ReportGenerator = ReportGenerator;
}

// 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReportGenerator;
}

export default ReportGenerator;
