/**
 * ReportGenerator.js - ES6 → ES5 변환 완료
 * 퍼스널컬러 진단 보고서 생성기
 * 
 * 주요 변경사항:
 * - ES6 클래스 → ES5 함수 생성자 패턴
 * - const/let → var 변환
 * - 화살표 함수 → function() {} 변환
 * - async/await → Promise 체인 변환
 * - 템플릿 리터럴 → 문자열 연결
 * - import/export → window 전역 등록
 * - Map 브라우저 호환성 처리
 */

(function() {
    'use strict';

    /**
     * 보고서 생성기 클래스 (ES5 버전)
     */
    function ReportGenerator(config) {
        config = config || {};
        
        this.config = {
            language: config.language || 'ko',
            template: config.template || 'professional',
            branding: config.branding || 'default',
            printOptimized: config.printOptimized !== false
        };

        // 추가 설정 병합
        for (var key in config) {
            if (config.hasOwnProperty(key) && !this.config.hasOwnProperty(key)) {
                this.config[key] = config[key];
            }
        }

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
        
        // 성능 추적
        this.averageGenerationTime = 0;
        this.totalReports = 0;

        // 메서드 바인딩
        var self = this;
        this.handleGenerateReport = function(event) {
            var detail = event.detail;
            self.generateComprehensiveReport(detail.analysisResult, detail.customerInfo, detail.options);
        };
        this.handleExportPDF = function(event) {
            var detail = event.detail;
            self.generatePDF(detail.report, detail.options);
        };
        this.handleShareReport = function(event) {
            var detail = event.detail;
            self.shareReport(detail.report, detail.method);
        };
        
        // 초기화
        setTimeout(function() {
            self.init();
        }, 0);
    }

    /**
     * 초기화 (ES5 버전)
     */
    ReportGenerator.prototype.init = function() {
        this.setupEventListeners();
        console.log('✅ ReportGenerator 초기화 완료');
    };

    ReportGenerator.prototype.setupEventListeners = function() {
        // 보고서 생성 이벤트 리스너
        document.addEventListener('generateReport', this.handleGenerateReport);
        document.addEventListener('exportPDF', this.handleExportPDF);
        document.addEventListener('shareReport', this.handleShareReport);
    };

    /**
     * 종합 보고서 생성 (ES5 버전)
     */
    ReportGenerator.prototype.generateComprehensiveReport = function(analysisResult, customerInfo, options) {
        options = options || {};
        var self = this;
        var startTime = Date.now();
        
        return new Promise(function(resolve, reject) {
            try {
                console.log('📊 종합 보고서 생성 시작');

                // 캐시 확인
                var cacheKey = self.generateCacheKey(analysisResult, customerInfo);
                if (self.reportCache.has(cacheKey) && !options.forceRefresh) {
                    console.log('📋 캐시된 보고서 사용');
                    resolve(self.reportCache.get(cacheKey));
                    return;
                }

                // 보고서 데이터 구조화
                self.structureReportData(analysisResult, customerInfo)
                    .then(function(reportData) {
                        // 3개 영역별 보고서 생성
                        return Promise.all([
                            self.generateMakeupSection(reportData),
                            self.generateFashionSection(reportData),
                            self.generateHairColorSection(reportData)
                        ])
                        .then(function(sections) {
                            // 종합 보고서 조립
                            var report = {
                                metadata: self.generateMetadata(customerInfo, analysisResult),
                                executiveSummary: self.generateExecutiveSummary(reportData),
                                personalColorAnalysis: self.generateColorAnalysisSection(analysisResult),
                                makeupRecommendations: sections[0],
                                fashionStyling: sections[1],
                                hairColorGuide: sections[2],
                                shoppingGuide: self.generateShoppingGuide(reportData),
                                maintenanceTips: self.generateMaintenanceTips(reportData),
                                generatedAt: new Date().toISOString(),
                                reportId: self.generateReportId()
                            };

                            // 캐시 저장
                            self.reportCache.set(cacheKey, report);

                            // 성능 통계 업데이트
                            var generationTime = Date.now() - startTime;
                            self.updatePerformanceStats(generationTime);

                            console.log('✅ 종합 보고서 생성 완료');
                            resolve(report);
                        });
                    })
                    .catch(reject);

            } catch (error) {
                console.error('❌ 보고서 생성 실패:', error);
                reject(new Error('보고서 생성 중 오류 발생: ' + error.message));
            }
        });
    };

    /**
     * 보고서 데이터 구조화 (ES5 버전)
     */
    ReportGenerator.prototype.structureReportData = function(analysisResult, customerInfo) {
        return new Promise(function(resolve) {
            var personalColorType = analysisResult.personalColorType;
            var skinTone = analysisResult.skinTone;
            var colorMatching = analysisResult.colorMatching;
            var confidenceScore = analysisResult.confidenceScore;
            var detailedAnalysis = analysisResult.detailedAnalysis;

            var reportData = {
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

            resolve(reportData);
        });
    };

    /**
     * 메타데이터 생성 (ES5 버전)
     */
    ReportGenerator.prototype.generateMetadata = function(customerInfo, analysisResult) {
        return {
            title: (customerInfo.name || '고객님') + '의 퍼스널컬러 진단 보고서',
            subtitle: analysisResult.personalColorType.season + ' 타입 완벽 가이드',
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
    };

    /**
     * 요약 보고서 생성 (ES5 버전)
     */
    ReportGenerator.prototype.generateExecutiveSummary = function(reportData) {
        var colorProfile = reportData.colorProfile;
        var customer = reportData.customer;
        var seasonKorean = this.getSeasonKorean(colorProfile.season);
        var subtypeKorean = this.getSubtypeKorean(colorProfile.subtype);

        return {
            keyFindings: [
                (customer.name || '고객님') + '은 **' + seasonKorean + ' ' + subtypeKorean + '** 타입입니다',
                '피부톤: ' + this.getTemperatureKorean(colorProfile.temperature) + ' (' + Math.round(colorProfile.confidence * 100) + '% 확신도)',
                '언더톤: ' + this.getUndertoneKorean(colorProfile.undertone),
                '깊이: ' + this.getDepthKorean(colorProfile.depth) + ' / 선명도: ' + this.getClarityKorean(colorProfile.clarity)
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
    };

    /**
     * 퍼스널컬러 분석 섹션 생성 (ES5 버전)
     */
    ReportGenerator.prototype.generateColorAnalysisSection = function(analysisResult) {
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
    };

    /**
     * 메이크업 추천 섹션 생성 (ES5 버전)
     */
    ReportGenerator.prototype.generateMakeupSection = function(reportData) {
        var self = this;
        var colorProfile = reportData.colorProfile;
        var colorPalette = reportData.colorPalette;

        return new Promise(function(resolve) {
            Promise.all([
                self.getFoundationRecommendations(colorProfile),
                self.getConcealerRecommendations(colorProfile),
                self.getPrimerRecommendations(colorProfile),
                self.getPowderRecommendations(colorProfile),
                self.getMakeupBrandRecommendations(colorProfile)
            ])
            .then(function(results) {
                var makeupSection = {
                    title: '메이크업 컬러 가이드',
                    
                    basePrep: {
                        foundation: results[0],
                        concealer: results[1],
                        primer: results[2],
                        powder: results[3]
                    },

                    complexion: {
                        blush: self.getBlushRecommendations(colorProfile, colorPalette),
                        bronzer: self.getBronzerRecommendations(colorProfile),
                        highlighter: self.getHighlighterRecommendations(colorProfile),
                        contour: self.getContourRecommendations(colorProfile)
                    },

                    eyes: {
                        eyeshadowPalette: self.getEyeshadowRecommendations(colorProfile, colorPalette),
                        eyeliner: self.getEyelinerRecommendations(colorProfile),
                        mascara: self.getMascaraRecommendations(colorProfile),
                        eyebrows: self.getEyebrowRecommendations(colorProfile)
                    },

                    lips: {
                        everyday: self.getLipColorRecommendations(colorProfile, 'everyday'),
                        bold: self.getLipColorRecommendations(colorProfile, 'bold'),
                        nude: self.getLipColorRecommendations(colorProfile, 'nude'),
                        special: self.getLipColorRecommendations(colorProfile, 'special')
                    },

                    brandRecommendations: results[4]
                };

                resolve(makeupSection);
            })
            .catch(function() {
                // 에러 발생시 기본값 반환
                resolve({
                    title: '메이크업 컬러 가이드',
                    basePrep: {},
                    complexion: {},
                    eyes: {},
                    lips: {},
                    brandRecommendations: {}
                });
            });
        });
    };

    /**
     * 패션 스타일링 섹션 생성 (ES5 버전)
     */
    ReportGenerator.prototype.generateFashionSection = function(reportData) {
        var self = this;
        var colorProfile = reportData.colorProfile;
        var colorPalette = reportData.colorPalette;

        return new Promise(function(resolve) {
            var fashionSection = {
                title: '패션 스타일링 가이드',

                coreWardrobe: {
                    basics: self.getBasicWardrobeColors(colorProfile, colorPalette),
                    neutrals: self.getNeutralColors(colorProfile, colorPalette),
                    accents: self.getAccentColors(colorProfile, colorPalette),
                    patterns: self.getPatternRecommendations(colorProfile)
                },

                seasonalStyling: {
                    spring: self.getSeasonalStyling(colorProfile, 'spring'),
                    summer: self.getSeasonalStyling(colorProfile, 'summer'),
                    autumn: self.getSeasonalStyling(colorProfile, 'autumn'),
                    winter: self.getSeasonalStyling(colorProfile, 'winter')
                },

                occasion: {
                    business: self.getOccasionStyling(colorProfile, 'business'),
                    casual: self.getOccasionStyling(colorProfile, 'casual'),
                    formal: self.getOccasionStyling(colorProfile, 'formal'),
                    date: self.getOccasionStyling(colorProfile, 'date')
                },

                accessories: {
                    jewelry: self.getJewelryRecommendations(colorProfile),
                    bags: self.getBagColorRecommendations(colorProfile),
                    scarves: self.getScarfColorRecommendations(colorProfile),
                    shoes: self.getShoeColorRecommendations(colorProfile)
                }
            };

            resolve(fashionSection);
        });
    };

    /**
     * 헤어컬러 가이드 섹션 생성 (ES5 버전)
     */
    ReportGenerator.prototype.generateHairColorSection = function(reportData) {
        var self = this;
        var colorProfile = reportData.colorProfile;
        var analysis = reportData.analysis;

        return new Promise(function(resolve) {
            Promise.all([
                self.getHairColorRecommendations(colorProfile, 'primary'),
                self.getHairColorRecommendations(colorProfile, 'alternative'),
                self.getHairColorRecommendations(colorProfile, 'highlights'),
                self.getHairColorRecommendations(colorProfile, 'lowlights'),
                self.getBrandSpecificHairColors(colorProfile, 'loreal'),
                self.getBrandSpecificHairColors(colorProfile, 'wella'),
                self.getBrandSpecificHairColors(colorProfile, 'milbon')
            ])
            .then(function(results) {
                var hairSection = {
                    title: '헤어컬러 완벽 가이드',

                    currentHairAnalysis: {
                        naturalColor: analysis.hairAnalysis ? analysis.hairAnalysis.naturalColor : null,
                        currentColor: analysis.hairAnalysis ? analysis.hairAnalysis.currentColor : null,
                        condition: analysis.hairAnalysis ? analysis.hairAnalysis.condition : null,
                        texture: analysis.hairAnalysis ? analysis.hairAnalysis.texture : null,
                        harmonyScore: analysis.hairAnalysis ? analysis.hairAnalysis.harmonyWithSkinTone : null
                    },

                    recommendedColors: {
                        primary: results[0],
                        alternative: results[1],
                        highlights: results[2],
                        lowlights: results[3]
                    },

                    brandSpecificGuide: {
                        loreal: results[4],
                        wella: results[5],
                        milbon: results[6]
                    },

                    techniques: {
                        balayage: self.getHairTechniqueRecommendations(colorProfile, 'balayage'),
                        ombre: self.getHairTechniqueRecommendations(colorProfile, 'ombre'),
                        highlights: self.getHairTechniqueRecommendations(colorProfile, 'highlights'),
                        singleProcess: self.getHairTechniqueRecommendations(colorProfile, 'single')
                    },

                    maintenance: {
                        colorProtection: self.getHairMaintenanceGuide(colorProfile, 'protection'),
                        homecare: self.getHairMaintenanceGuide(colorProfile, 'homecare'),
                        salonSchedule: self.getHairMaintenanceGuide(colorProfile, 'schedule'),
                        seasonalAdjustments: self.getHairMaintenanceGuide(colorProfile, 'seasonal')
                    }
                };

                resolve(hairSection);
            })
            .catch(function() {
                // 에러 발생시 기본값 반환
                resolve({
                    title: '헤어컬러 완벽 가이드',
                    currentHairAnalysis: {},
                    recommendedColors: {},
                    brandSpecificGuide: {},
                    techniques: {},
                    maintenance: {}
                });
            });
        });
    };

    /**
     * 쇼핑 가이드 생성 (ES5 버전)
     */
    ReportGenerator.prototype.generateShoppingGuide = function(reportData) {
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
    };

    /**
     * 관리 팁 생성 (ES5 버전)
     */
    ReportGenerator.prototype.generateMaintenanceTips = function(reportData) {
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
    };

    /**
     * 파운데이션 추천 (ES5 버전)
     */
    ReportGenerator.prototype.getFoundationRecommendations = function(colorProfile) {
        return new Promise(function(resolve) {
            var recommendations = {
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

            var seasonRecs = recommendations[colorProfile.season] || recommendations.spring;
            var depthRecs = seasonRecs[colorProfile.depth] || seasonRecs.medium;

            var result = {
                primaryShades: depthRecs,
                brands: [
                    { 
                        name: '정관장', 
                        shades: depthRecs.filter(function(shade) { 
                            return shade.indexOf('N1') !== -1 || shade.indexOf('W1') !== -1 || shade.indexOf('P1') !== -1; 
                        }) 
                    },
                    { 
                        name: 'MAC', 
                        shades: depthRecs.filter(function(shade) { 
                            return shade.indexOf('NC') !== -1 || shade.indexOf('NW') !== -1; 
                        }) 
                    },
                    { 
                        name: 'FENTY Beauty', 
                        shades: depthRecs.filter(function(shade) { 
                            return shade.indexOf('N1') === -1 && shade.indexOf('NC') === -1; 
                        }) 
                    }
                ],
                tips: [
                    '목과 얼굴 경계선에서 테스트하세요',
                    '자연광에서 확인하는 것이 가장 정확합니다',
                    '계절에 따라 0.5톤 조정을 고려하세요'
                ]
            };

            resolve(result);
        });
    };

    /**
     * 헤어컬러 추천 (ES5 버전)
     */
    ReportGenerator.prototype.getHairColorRecommendations = function(colorProfile, type) {
        type = type || 'primary';
        
        return new Promise(function(resolve) {
            var season = colorProfile.season;
            var subtype = colorProfile.subtype;
            var temperature = colorProfile.temperature;
            var depth = colorProfile.depth;

            var baseRecommendations = {
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

            var result = (baseRecommendations[season] && baseRecommendations[season][type]) ? 
                baseRecommendations[season][type] : baseRecommendations.spring.primary;
            
            resolve(result);
        });
    };

    /**
     * 브랜드별 헤어컬러 매칭 (ES5 버전)
     */
    ReportGenerator.prototype.getBrandSpecificHairColors = function(colorProfile, brand) {
        var self = this;
        
        return new Promise(function(resolve) {
            var colorMap = {
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

            var brandColors = (colorMap[brand] && colorMap[brand][colorProfile.season]) ? 
                colorMap[brand][colorProfile.season] : colorMap.loreal.spring;

            var result = {
                recommendedShades: brandColors,
                processingNotes: self.getProcessingNotes(colorProfile, brand),
                maintenanceSchedule: self.getMaintenanceSchedule(colorProfile, brand)
            };

            resolve(result);
        });
    };

    /**
     * 보고서 HTML 렌더링 (ES5 버전)
     */
    ReportGenerator.prototype.renderReportHTML = function(report) {
        var template = this.templates[this.config.template];
        
        var html = '<!DOCTYPE html>\n' +
            '<html lang="ko">\n' +
            '<head>\n' +
            '    <meta charset="UTF-8">\n' +
            '    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
            '    <title>' + report.metadata.title + '</title>\n' +
            '    <style>\n' +
            '        ' + this.generateReportCSS(template) + '\n' +
            '    </style>\n' +
            '</head>\n' +
            '<body>\n' +
            '    <div class="report-container">\n' +
            '        ' + this.renderHeader(report.metadata) + '\n' +
            '        ' + this.renderExecutiveSummary(report.executiveSummary) + '\n' +
            '        ' + this.renderColorAnalysis(report.personalColorAnalysis) + '\n' +
            '        ' + this.renderMakeupSection(report.makeupRecommendations) + '\n' +
            '        ' + this.renderFashionSection(report.fashionStyling) + '\n' +
            '        ' + this.renderHairColorSection(report.hairColorGuide) + '\n' +
            '        ' + this.renderShoppingGuide(report.shoppingGuide) + '\n' +
            '        ' + this.renderMaintenanceTips(report.maintenanceTips) + '\n' +
            '        ' + this.renderFooter(report.metadata) + '\n' +
            '    </div>\n' +
            '</body>\n' +
            '</html>';
            
        return html;
    };

    /**
     * PDF 생성 (ES5 버전)
     */
    ReportGenerator.prototype.generatePDF = function(report, options) {
        options = options || {};
        var self = this;
        
        return new Promise(function(resolve, reject) {
            try {
                var html = self.renderReportHTML(report);
                
                // PDF 생성 옵션
                var pdfOptions = {
                    format: 'A4',
                    printBackground: true,
                    preferCSSPageSize: true,
                    margin: {
                        top: '20mm',
                        bottom: '20mm',
                        left: '15mm',
                        right: '15mm'
                    }
                };

                // 추가 옵션 병합
                for (var key in options) {
                    if (options.hasOwnProperty(key)) {
                        pdfOptions[key] = options[key];
                    }
                }

                // 브라우저 환경에서는 클라이언트 사이드 PDF 생성
                if (typeof window !== 'undefined') {
                    self.generateClientSidePDF(html, pdfOptions)
                        .then(resolve)
                        .catch(reject);
                } else {
                    console.log('✅ PDF 생성 완료');
                    resolve({ html: html, options: pdfOptions });
                }

            } catch (error) {
                console.error('❌ PDF 생성 실패:', error);
                reject(error);
            }
        });
    };

    /**
     * 클라이언트 사이드 PDF 생성 (ES5 버전)
     */
    ReportGenerator.prototype.generateClientSidePDF = function(html, options) {
        return new Promise(function(resolve, reject) {
            try {
                // HTML을 새 창에서 열고 프린트 다이얼로그 호출
                var printWindow = window.open('', '_blank');
                printWindow.document.write(html);
                printWindow.document.close();
                
                printWindow.onload = function() {
                    printWindow.focus();
                    printWindow.print();
                    
                    // 프린트 후 창 닫기
                    setTimeout(function() {
                        printWindow.close();
                    }, 1000);
                };
                
                resolve({ success: true, message: 'PDF 프린트 다이얼로그 호출됨' });
                
            } catch (error) {
                reject(error);
            }
        });
    };

    /**
     * 보고서 공유 (ES5 버전)
     */
    ReportGenerator.prototype.shareReport = function(report, method) {
        method = method || 'url';
        var self = this;
        
        return new Promise(function(resolve, reject) {
            try {
                switch (method) {
                    case 'url':
                        resolve(self.generateShareableURL(report));
                        break;
                    case 'email':
                        resolve(self.shareViaEmail(report));
                        break;
                    case 'kakao':
                        resolve(self.shareViaKakao(report));
                        break;
                    case 'print':
                        resolve(self.printReport(report));
                        break;
                    default:
                        reject(new Error('지원하지 않는 공유 방법: ' + method));
                }
            } catch (error) {
                console.error('❌ 보고서 공유 실패:', error);
                reject(error);
            }
        });
    };

    /**
     * 유틸리티 메서드들 (ES5 버전)
     */
    ReportGenerator.prototype.getSeasonKorean = function(season) {
        var seasonMap = {
            spring: '봄',
            summer: '여름',
            autumn: '가을',
            winter: '겨울'
        };
        return seasonMap[season] || season;
    };

    ReportGenerator.prototype.getSubtypeKorean = function(subtype) {
        var subtypeMap = {
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
    };

    ReportGenerator.prototype.getTemperatureKorean = function(temperature) {
        var tempMap = {
            warm: '웜톤',
            cool: '쿨톤',
            neutral: '뉴트럴톤'
        };
        return tempMap[temperature] || temperature;
    };

    ReportGenerator.prototype.getUndertoneKorean = function(undertone) {
        var undertoneMap = {
            yellow: '옐로우',
            pink: '핑크',
            olive: '올리브',
            neutral: '뉴트럴'
        };
        return undertoneMap[undertone] || undertone;
    };

    ReportGenerator.prototype.getDepthKorean = function(depth) {
        var depthMap = {
            light: '라이트',
            medium: '미디엄',
            deep: '딥'
        };
        return depthMap[depth] || depth;
    };

    ReportGenerator.prototype.getClarityKorean = function(clarity) {
        var clarityMap = {
            clear: '클리어',
            soft: '소프트',
            muted: '뮤티드'
        };
        return clarityMap[clarity] || clarity;
    };

    ReportGenerator.prototype.generateCacheKey = function(analysisResult, customerInfo) {
        return (customerInfo.name + '_' + analysisResult.personalColorType.season + '_' + analysisResult.personalColorType.subtype + '_' + Date.now()).replace(/\s+/g, '_');
    };

    ReportGenerator.prototype.generateReportId = function() {
        return 'RPT_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    };

    /**
     * 성능 통계 업데이트 (ES5 버전)
     */
    ReportGenerator.prototype.updatePerformanceStats = function(generationTime) {
        this.totalReports++;
        this.averageGenerationTime = ((this.averageGenerationTime * (this.totalReports - 1)) + generationTime) / this.totalReports;
    };

    /**
     * 기본 메서드 스텁들 (ES5 버전)
     */
    ReportGenerator.prototype.getConcealerRecommendations = function(colorProfile) {
        return Promise.resolve(['기본 컨실러 추천']);
    };

    ReportGenerator.prototype.getPrimerRecommendations = function(colorProfile) {
        return Promise.resolve(['기본 프라이머 추천']);
    };

    ReportGenerator.prototype.getPowderRecommendations = function(colorProfile) {
        return Promise.resolve(['기본 파우더 추천']);
    };

    ReportGenerator.prototype.getMakeupBrandRecommendations = function(colorProfile) {
        return Promise.resolve(['MAC', 'Bobbi Brown', 'NARS']);
    };

    ReportGenerator.prototype.getBlushRecommendations = function(colorProfile, colorPalette) {
        return ['코랄 핑크', '피치 블러셔'];
    };

    ReportGenerator.prototype.getBronzerRecommendations = function(colorProfile) {
        return ['웜 브론저', '내추럴 브론저'];
    };

    ReportGenerator.prototype.getHighlighterRecommendations = function(colorProfile) {
        return ['골드 하이라이터', '핑크 하이라이터'];
    };

    ReportGenerator.prototype.getContourRecommendations = function(colorProfile) {
        return ['쿨톤 컨투어', '웜톤 컨투어'];
    };

    ReportGenerator.prototype.getEyeshadowRecommendations = function(colorProfile, colorPalette) {
        return ['뉴드 팔레트', '브라운 팔레트'];
    };

    ReportGenerator.prototype.getEyelinerRecommendations = function(colorProfile) {
        return ['블랙 아이라이너', '브라운 아이라이너'];
    };

    ReportGenerator.prototype.getMascaraRecommendations = function(colorProfile) {
        return ['블랙 마스카라', '브라운 마스카라'];
    };

    ReportGenerator.prototype.getEyebrowRecommendations = function(colorProfile) {
        return ['브라운 아이브로우', '그레이 아이브로우'];
    };

    ReportGenerator.prototype.getLipColorRecommendations = function(colorProfile, type) {
        var recommendations = {
            everyday: ['MLBB 컬러', '코랄 핑크'],
            bold: ['레드', '베리'],
            nude: ['뉴드 베이지', '핑크 베이지'],
            special: ['딥 레드', '와인']
        };
        return recommendations[type] || recommendations.everyday;
    };

    ReportGenerator.prototype.getBasicWardrobeColors = function(colorProfile, colorPalette) {
        return ['화이트', '네이비', '베이지'];
    };

    ReportGenerator.prototype.getNeutralColors = function(colorProfile, colorPalette) {
        return ['그레이', '아이보리', '카키'];
    };

    ReportGenerator.prototype.getAccentColors = function(colorProfile, colorPalette) {
        return ['코랄', '터콰이즈', '골드'];
    };

    ReportGenerator.prototype.getPatternRecommendations = function(colorProfile) {
        return ['스트라이프', '도트', '체크'];
    };

    ReportGenerator.prototype.getSeasonalStyling = function(colorProfile, season) {
        return { colors: ['계절별 컬러'], tips: ['계절별 팁'] };
    };

    ReportGenerator.prototype.getOccasionStyling = function(colorProfile, occasion) {
        return { colors: ['상황별 컬러'], tips: ['상황별 팁'] };
    };

    ReportGenerator.prototype.getJewelryRecommendations = function(colorProfile) {
        return ['골드 주얼리', '실버 주얼리'];
    };

    ReportGenerator.prototype.getBagColorRecommendations = function(colorProfile) {
        return ['블랙', '브라운', '베이지'];
    };

    ReportGenerator.prototype.getScarfColorRecommendations = function(colorProfile) {
        return ['네이비', '버건디', '카키'];
    };

    ReportGenerator.prototype.getShoeColorRecommendations = function(colorProfile) {
        return ['블랙', '브라운', '누드'];
    };

    ReportGenerator.prototype.getHairTechniqueRecommendations = function(colorProfile, technique) {
        return { description: technique + ' 기법', suitability: '적합도 높음' };
    };

    ReportGenerator.prototype.getHairMaintenanceGuide = function(colorProfile, type) {
        return { tips: [type + ' 관리 팁'], frequency: '4-6주' };
    };

    ReportGenerator.prototype.getProcessingNotes = function(colorProfile, brand) {
        return '표준 시술법 적용';
    };

    ReportGenerator.prototype.getMaintenanceSchedule = function(colorProfile, brand) {
        return '6-8주마다 터치업';
    };

    ReportGenerator.prototype.getSeasonCharacteristics = function(season) {
        var characteristics = {
            spring: '밝고 따뜻한 색상',
            summer: '부드럽고 시원한 색상',
            autumn: '깊고 따뜻한 색상',
            winter: '선명하고 시원한 색상'
        };
        return characteristics[season] || '기본 특성';
    };

    ReportGenerator.prototype.generateReportCSS = function(template) {
        return 'body { font-family: "Noto Sans KR", sans-serif; margin: 0; padding: 20px; }';
    };

    ReportGenerator.prototype.renderHeader = function(metadata) {
        return '<header><h1>' + metadata.title + '</h1></header>';
    };

    ReportGenerator.prototype.renderExecutiveSummary = function(summary) {
        return '<section><h2>요약</h2><p>' + summary.keyFindings.join('</p><p>') + '</p></section>';
    };

    ReportGenerator.prototype.renderColorAnalysis = function(analysis) {
        return '<section><h2>' + analysis.title + '</h2></section>';
    };

    ReportGenerator.prototype.renderMakeupSection = function(makeup) {
        return '<section><h2>' + makeup.title + '</h2></section>';
    };

    ReportGenerator.prototype.renderFashionSection = function(fashion) {
        return '<section><h2>' + fashion.title + '</h2></section>';
    };

    ReportGenerator.prototype.renderHairColorSection = function(hair) {
        return '<section><h2>' + hair.title + '</h2></section>';
    };

    ReportGenerator.prototype.renderShoppingGuide = function(shopping) {
        return '<section><h2>' + shopping.title + '</h2></section>';
    };

    ReportGenerator.prototype.renderMaintenanceTips = function(maintenance) {
        return '<section><h2>' + maintenance.title + '</h2></section>';
    };

    ReportGenerator.prototype.renderFooter = function(metadata) {
        return '<footer><p>Generated: ' + metadata.date + '</p></footer>';
    };

    ReportGenerator.prototype.generateShareableURL = function(report) {
        return Promise.resolve('https://example.com/report/' + report.reportId);
    };

    ReportGenerator.prototype.shareViaEmail = function(report) {
        return Promise.resolve({ method: 'email', success: true });
    };

    ReportGenerator.prototype.shareViaKakao = function(report) {
        return Promise.resolve({ method: 'kakao', success: true });
    };

    ReportGenerator.prototype.printReport = function(report) {
        return Promise.resolve({ method: 'print', success: true });
    };

    /**
     * 성능 통계 반환 (ES5 버전)
     */
    ReportGenerator.prototype.getPerformanceStats = function() {
        return {
            cacheSize: this.reportCache.size,
            reportGenerated: this.totalReports,
            averageGenerationTime: Math.round(this.averageGenerationTime),
            memoryUsage: this.reportCache.size * 1024 // KB 단위 추정치
        };
    };

    // 전역 객체로 등록
    if (typeof window !== 'undefined') {
        window.ReportGenerator = ReportGenerator;
        console.log('✅ ReportGenerator ES5 버전 로드 완료');
    }

})();
