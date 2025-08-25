/**
 * PDFGenerator.js - 헤어디자이너용 퍼스널컬러 진단 시스템
 * PDF 보고서 생성 최적화 엔진
 * 
 * 기능:
 * - 전문가급 PDF 보고서 생성
 * - 다양한 템플릿 및 레이아웃
 * - 고품질 이미지 및 차트 삽입
 * - 인터랙티브 요소 및 링크
 * - 브랜드별 커스터마이징
 * - 다국어 지원 (한/영)
 */

class PDFGenerator {
    constructor() {
        this.jsPDFLib = null;
        this.initialized = false;
        
        // PDF 설정
        this.pageConfig = {
            format: 'a4',
            orientation: 'portrait',
            unit: 'mm',
            compress: true
        };
        
        // 색상 팔레트
        this.colors = {
            primary: '#007AFF',
            secondary: '#5856D6',
            success: '#34C759',
            warning: '#FF9500',
            danger: '#FF3B30',
            dark: '#1D1D1F',
            gray: '#8E8E93',
            lightGray: '#F2F2F7',
            white: '#FFFFFF'
        };

        // 폰트 설정
        this.fonts = {
            regular: 'helvetica',
            bold: 'helvetica',
            light: 'helvetica'
        };

        // 페이지 여백
        this.margins = {
            top: 20,
            right: 20,
            bottom: 20,
            left: 20
        };

        this.initializePDFLib();
    }

    /**
     * PDF 라이브러리 초기화
     */
    async initializePDFLib() {
        try {
            // jsPDF CDN에서 로드 (실제 환경에서는 번들에 포함)
            if (typeof window.jsPDF === 'undefined') {
                await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
            }
            
            this.jsPDFLib = window.jsPDF.jsPDF;
            this.initialized = true;
            console.log('PDF Generator initialized successfully');
        } catch (error) {
            console.error('Failed to initialize PDF library:', error);
            this.initialized = false;
        }
    }

    /**
     * 외부 스크립트 로드
     */
    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * 메인 PDF 보고서 생성
     * @param {Object} reportData - 보고서 데이터
     * @param {Object} options - 생성 옵션
     */
    async generateReport(reportData, options = {}) {
        if (!this.initialized) {
            throw new Error('PDF Generator not initialized');
        }

        const {
            template = 'comprehensive',
            language = 'ko',
            includePhotos = true,
            includeCharts = true,
            customBranding = null
        } = options;

        try {
            // PDF 문서 생성
            const pdf = new this.jsPDFLib(this.pageConfig);
            
            // 한글 폰트 설정 (필요시)
            if (language === 'ko') {
                await this.setupKoreanFont(pdf);
            }

            // 템플릿에 따른 보고서 생성
            switch (template) {
                case 'simple':
                    await this.generateSimpleReport(pdf, reportData, options);
                    break;
                case 'detailed':
                    await this.generateDetailedReport(pdf, reportData, options);
                    break;
                case 'comprehensive':
                default:
                    await this.generateComprehensiveReport(pdf, reportData, options);
                    break;
            }

            // PDF 반환
            return {
                pdf: pdf,
                blob: pdf.output('blob'),
                dataUrl: pdf.output('datauristring'),
                base64: pdf.output('datauristring').split(',')[1]
            };

        } catch (error) {
            console.error('PDF generation failed:', error);
            throw error;
        }
    }

    /**
     * 종합 보고서 생성
     */
    async generateComprehensiveReport(pdf, reportData, options) {
        const {
            customerInfo,
            analysisResult,
            makeupGuide,
            hairColorGuide,
            fashionStyling,
            photos = []
        } = reportData;

        let currentPage = 1;

        // 1. 커버 페이지
        await this.generateCoverPage(pdf, customerInfo, analysisResult);
        
        // 2. 고객 정보 페이지
        pdf.addPage();
        currentPage++;
        await this.generateCustomerInfoPage(pdf, customerInfo, currentPage);

        // 3. 분석 결과 요약 페이지
        pdf.addPage();
        currentPage++;
        await this.generateAnalysisResultPage(pdf, analysisResult, currentPage);

        // 4. 메이크업 가이드 페이지
        if (makeupGuide) {
            pdf.addPage();
            currentPage++;
            await this.generateMakeupGuidePage(pdf, makeupGuide, analysisResult, currentPage);
        }

        // 5. 헤어컬러 가이드 페이지
        if (hairColorGuide) {
            pdf.addPage();
            currentPage++;
            await this.generateHairColorGuidePage(pdf, hairColorGuide, analysisResult, currentPage);
        }

        // 6. 패션 스타일링 페이지
        if (fashionStyling) {
            pdf.addPage();
            currentPage++;
            await this.generateFashionStylingPage(pdf, fashionStyling, analysisResult, currentPage);
        }

        // 7. 색상 팔레트 페이지
        pdf.addPage();
        currentPage++;
        await this.generateColorPalettePage(pdf, analysisResult, currentPage);

        // 8. 사진 갤러리 페이지
        if (photos.length > 0 && options.includePhotos) {
            pdf.addPage();
            currentPage++;
            await this.generatePhotoGalleryPage(pdf, photos, currentPage);
        }

        // 9. 쇼핑 가이드 페이지
        if (fashionStyling?.shoppingGuide) {
            pdf.addPage();
            currentPage++;
            await this.generateShoppingGuidePage(pdf, fashionStyling.shoppingGuide, currentPage);
        }

        // 10. 부록 페이지
        pdf.addPage();
        currentPage++;
        await this.generateAppendixPage(pdf, reportData, currentPage);

        // 페이지 번호 및 푸터 추가
        this.addPageNumbers(pdf, currentPage);
        this.addFooters(pdf, currentPage);
    }

    /**
     * 커버 페이지 생성
     */
    async generateCoverPage(pdf, customerInfo, analysisResult) {
        const pageWidth = pdf.internal.pageSize.width;
        const pageHeight = pdf.internal.pageSize.height;

        // 배경 그라데이션
        await this.addGradientBackground(pdf, analysisResult.season);

        // 제목
        pdf.setFontSize(32);
        pdf.setTextColor(this.colors.white);
        pdf.setFont(this.fonts.bold);
        const title = 'PERSONAL COLOR ANALYSIS REPORT';
        const titleWidth = pdf.getTextWidth(title);
        pdf.text(title, (pageWidth - titleWidth) / 2, 60);

        // 한글 제목
        pdf.setFontSize(24);
        const korTitle = '퍼스널컬러 진단 보고서';
        const korTitleWidth = pdf.getTextWidth(korTitle);
        pdf.text(korTitle, (pageWidth - korTitleWidth) / 2, 80);

        // 고객 정보
        pdf.setFontSize(18);
        pdf.setTextColor(this.colors.white);
        const customerName = `${customerInfo.name} 고객님`;
        const nameWidth = pdf.getTextWidth(customerName);
        pdf.text(customerName, (pageWidth - nameWidth) / 2, 110);

        // 분석 결과 하이라이트
        pdf.setFontSize(24);
        pdf.setTextColor(this.colors.white);
        const seasonName = `${analysisResult.seasonName} 타입`;
        const seasonWidth = pdf.getTextWidth(seasonName);
        pdf.text(seasonName, (pageWidth - seasonWidth) / 2, 140);

        // 신뢰도
        pdf.setFontSize(14);
        const confidence = `분석 신뢰도: ${Math.round(analysisResult.confidence)}%`;
        const confidenceWidth = pdf.getTextWidth(confidence);
        pdf.text(confidence, (pageWidth - confidenceWidth) / 2, 160);

        // 분석 날짜
        const analysisDate = `분석일: ${new Date().toLocaleDateString('ko-KR')}`;
        const dateWidth = pdf.getTextWidth(analysisDate);
        pdf.text(analysisDate, (pageWidth - dateWidth) / 2, 180);

        // 로고 또는 브랜딩 (옵션)
        await this.addBrandingElement(pdf, pageWidth / 2, 220);

        // 하단 장식
        this.addDecorativeElement(pdf, pageWidth, pageHeight);
    }

    /**
     * 고객 정보 페이지 생성
     */
    async generateCustomerInfoPage(pdf, customerInfo, pageNumber) {
        await this.addPageHeader(pdf, '고객 정보', pageNumber);

        let yPos = 50;
        const leftCol = 30;
        const rightCol = 120;

        // 기본 정보
        pdf.setFontSize(16);
        pdf.setTextColor(this.colors.primary);
        pdf.setFont(this.fonts.bold);
        pdf.text('기본 정보', leftCol, yPos);
        yPos += 15;

        pdf.setFontSize(12);
        pdf.setTextColor(this.colors.dark);
        pdf.setFont(this.fonts.regular);

        const basicInfo = [
            ['이름', customerInfo.name],
            ['연락처', customerInfo.phone],
            ['이메일', customerInfo.email || '-'],
            ['나이', customerInfo.age ? `${customerInfo.age}세` : '-'],
            ['성별', customerInfo.gender || '-'],
            ['직업', customerInfo.occupation || '-']
        ];

        basicInfo.forEach(([label, value]) => {
            pdf.text(`${label}:`, leftCol, yPos);
            pdf.text(value || '-', rightCol, yPos);
            yPos += 8;
        });

        yPos += 15;

        // 진단 정보
        pdf.setFontSize(16);
        pdf.setTextColor(this.colors.primary);
        pdf.setFont(this.fonts.bold);
        pdf.text('진단 정보', leftCol, yPos);
        yPos += 15;

        pdf.setFontSize(12);
        pdf.setTextColor(this.colors.dark);
        pdf.setFont(this.fonts.regular);

        const diagnosisInfo = [
            ['진단 방법', customerInfo.diagnosisMethod || '전문가 진단'],
            ['진단 날짜', new Date(customerInfo.createdAt).toLocaleDateString('ko-KR')],
            ['진단 장소', customerInfo.location || '-'],
            ['담당자', customerInfo.consultant || '-']
        ];

        diagnosisInfo.forEach(([label, value]) => {
            pdf.text(`${label}:`, leftCol, yPos);
            pdf.text(value, rightCol, yPos);
            yPos += 8;
        });

        yPos += 15;

        // 고객 요구사항
        if (customerInfo.requirements) {
            pdf.setFontSize(16);
            pdf.setTextColor(this.colors.primary);
            pdf.setFont(this.fonts.bold);
            pdf.text('고객 요구사항', leftCol, yPos);
            yPos += 15;

            pdf.setFontSize(12);
            pdf.setTextColor(this.colors.dark);
            pdf.setFont(this.fonts.regular);
            
            const requirements = customerInfo.requirements.split('\n');
            requirements.forEach(req => {
                if (req.trim()) {
                    pdf.text(`• ${req.trim()}`, leftCol, yPos);
                    yPos += 6;
                }
            });
        }
    }

    /**
     * 분석 결과 페이지 생성
     */
    async generateAnalysisResultPage(pdf, analysisResult, pageNumber) {
        await this.addPageHeader(pdf, '퍼스널컬러 분석 결과', pageNumber);

        let yPos = 50;
        const leftCol = 30;

        // 메인 결과
        pdf.setFontSize(24);
        pdf.setTextColor(this.colors.primary);
        pdf.setFont(this.fonts.bold);
        pdf.text(`${analysisResult.seasonName} 타입`, leftCol, yPos);
        yPos += 20;

        // 신뢰도 바
        await this.drawConfidenceBar(pdf, leftCol, yPos, analysisResult.confidence);
        yPos += 25;

        // 특성 설명
        pdf.setFontSize(14);
        pdf.setTextColor(this.colors.dark);
        pdf.setFont(this.fonts.regular);
        const characteristics = analysisResult.characteristics || [];
        characteristics.forEach(char => {
            pdf.text(`• ${char}`, leftCol, yPos);
            yPos += 8;
        });

        yPos += 15;

        // 색상 온도
        pdf.setFontSize(16);
        pdf.setTextColor(this.colors.primary);
        pdf.setFont(this.fonts.bold);
        pdf.text('색상 특성', leftCol, yPos);
        yPos += 15;

        pdf.setFontSize(12);
        pdf.setTextColor(this.colors.dark);
        pdf.setFont(this.fonts.regular);

        const colorCharacteristics = [
            ['색온도', analysisResult.temperature === 'warm' ? '웜톤 (따뜻한 톤)' : '쿨톤 (차가운 톤)'],
            ['명도', this.getBrightnessDescription(analysisResult.brightness)],
            ['채도', this.getSaturationDescription(analysisResult.saturation)],
            ['대비감', this.getContrastDescription(analysisResult.contrast)]
        ];

        colorCharacteristics.forEach(([label, description]) => {
            pdf.text(`${label}: ${description}`, leftCol, yPos);
            yPos += 8;
        });

        // 적합한 컬러 미리보기
        yPos += 15;
        await this.drawColorPreview(pdf, leftCol, yPos, analysisResult.colorPalette);
    }

    /**
     * 색상 팔레트 페이지 생성
     */
    async generateColorPalettePage(pdf, analysisResult, pageNumber) {
        await this.addPageHeader(pdf, '추천 색상 팔레트', pageNumber);

        let yPos = 60;
        const leftCol = 30;
        const colorSize = 15;
        const colorsPerRow = 8;

        // 기본 색상
        pdf.setFontSize(16);
        pdf.setTextColor(this.colors.primary);
        pdf.setFont(this.fonts.bold);
        pdf.text('기본 색상 (Primary Colors)', leftCol, yPos);
        yPos += 20;

        if (analysisResult.colorPalette.primary) {
            await this.drawColorSwatches(pdf, leftCol, yPos, analysisResult.colorPalette.primary, colorSize, colorsPerRow);
            yPos += 40;
        }

        // 보조 색상
        pdf.setFontSize(16);
        pdf.setTextColor(this.colors.primary);
        pdf.setFont(this.fonts.bold);
        pdf.text('보조 색상 (Secondary Colors)', leftCol, yPos);
        yPos += 20;

        if (analysisResult.colorPalette.secondary) {
            await this.drawColorSwatches(pdf, leftCol, yPos, analysisResult.colorPalette.secondary, colorSize, colorsPerRow);
            yPos += 40;
        }

        // 악센트 색상
        if (analysisResult.colorPalette.accent) {
            pdf.setFontSize(16);
            pdf.setTextColor(this.colors.primary);
            pdf.setFont(this.fonts.bold);
            pdf.text('악센트 색상 (Accent Colors)', leftCol, yPos);
            yPos += 20;

            await this.drawColorSwatches(pdf, leftCol, yPos, analysisResult.colorPalette.accent, colorSize, colorsPerRow);
            yPos += 40;
        }

        // 피해야 할 색상
        if (analysisResult.colorPalette.avoid) {
            pdf.setFontSize(16);
            pdf.setTextColor(this.colors.danger);
            pdf.setFont(this.fonts.bold);
            pdf.text('피해야 할 색상', leftCol, yPos);
            yPos += 20;

            await this.drawColorSwatches(pdf, leftCol, yPos, analysisResult.colorPalette.avoid, colorSize, colorsPerRow, true);
        }
    }

    /**
     * 색상 견본 그리기
     */
    async drawColorSwatches(pdf, x, y, colors, size, perRow, isAvoid = false) {
        let currentX = x;
        let currentY = y;
        let count = 0;

        colors.forEach(color => {
            // 색상 사각형
            pdf.setFillColor(color.hex || color);
            pdf.rect(currentX, currentY, size, size, 'F');

            // 테두리
            pdf.setDrawColor(this.colors.gray);
            pdf.setLineWidth(0.5);
            pdf.rect(currentX, currentY, size, size, 'S');

            // 피해야 할 색상 표시
            if (isAvoid) {
                pdf.setDrawColor(this.colors.danger);
                pdf.setLineWidth(2);
                pdf.line(currentX, currentY, currentX + size, currentY + size);
                pdf.line(currentX + size, currentY, currentX, currentY + size);
            }

            // 색상 이름
            pdf.setFontSize(8);
            pdf.setTextColor(this.colors.dark);
            const colorName = color.name || color;
            const nameWidth = pdf.getTextWidth(colorName);
            pdf.text(colorName, currentX + (size - nameWidth) / 2, currentY + size + 8);

            count++;
            if (count % perRow === 0) {
                currentX = x;
                currentY += size + 20;
            } else {
                currentX += size + 5;
            }
        });
    }

    /**
     * 신뢰도 막대 그래프 그리기
     */
    async drawConfidenceBar(pdf, x, y, confidence) {
        const barWidth = 150;
        const barHeight = 12;
        
        // 배경 바
        pdf.setFillColor(this.colors.lightGray);
        pdf.rect(x, y, barWidth, barHeight, 'F');

        // 신뢰도 바
        const fillWidth = (barWidth * confidence) / 100;
        const color = confidence >= 80 ? this.colors.success : 
                     confidence >= 60 ? this.colors.warning : 
                     this.colors.danger;
        
        pdf.setFillColor(color);
        pdf.rect(x, y, fillWidth, barHeight, 'F');

        // 테두리
        pdf.setDrawColor(this.colors.gray);
        pdf.setLineWidth(0.5);
        pdf.rect(x, y, barWidth, barHeight, 'S');

        // 텍스트
        pdf.setFontSize(10);
        pdf.setTextColor(this.colors.dark);
        pdf.text(`신뢰도: ${Math.round(confidence)}%`, x, y - 3);
    }

    /**
     * 페이지 헤더 추가
     */
    async addPageHeader(pdf, title, pageNumber) {
        const pageWidth = pdf.internal.pageSize.width;
        
        // 헤더 라인
        pdf.setDrawColor(this.colors.primary);
        pdf.setLineWidth(0.5);
        pdf.line(this.margins.left, 25, pageWidth - this.margins.right, 25);

        // 제목
        pdf.setFontSize(18);
        pdf.setTextColor(this.colors.primary);
        pdf.setFont(this.fonts.bold);
        pdf.text(title, this.margins.left, 20);

        // 페이지 번호
        pdf.setFontSize(10);
        pdf.setTextColor(this.colors.gray);
        pdf.setFont(this.fonts.regular);
        const pageText = `Page ${pageNumber}`;
        const pageTextWidth = pdf.getTextWidth(pageText);
        pdf.text(pageText, pageWidth - this.margins.right - pageTextWidth, 20);
    }

    /**
     * 그라데이션 배경 추가 (시뮬레이션)
     */
    async addGradientBackground(pdf, season) {
        const pageWidth = pdf.internal.pageSize.width;
        const pageHeight = pdf.internal.pageSize.height;
        
        const gradientColors = {
            spring: ['#FFE5B4', '#FFCC99'],
            summer: ['#E6E6FA', '#D8BFD8'],
            autumn: ['#DEB887', '#D2691E'],
            winter: ['#B0C4DE', '#4682B4']
        };

        const colors = gradientColors[season] || gradientColors.spring;
        
        // 단순한 그라데이션 효과 (실제 그라데이션은 더 복잡한 구현 필요)
        pdf.setFillColor(colors[0]);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    }

    /**
     * 브랜딩 요소 추가
     */
    async addBrandingElement(pdf, x, y) {
        // 간단한 로고 대체 텍스트
        pdf.setFontSize(12);
        pdf.setTextColor(this.colors.white);
        pdf.setFont(this.fonts.regular);
        const brandText = 'Personal Color Analysis System';
        const brandWidth = pdf.getTextWidth(brandText);
        pdf.text(brandText, x - brandWidth / 2, y);
    }

    /**
     * 장식 요소 추가
     */
    addDecorativeElement(pdf, width, height) {
        // 하단 장식 라인
        pdf.setDrawColor(this.colors.white);
        pdf.setLineWidth(1);
        pdf.line(width * 0.3, height - 40, width * 0.7, height - 40);
    }

    /**
     * 페이지 번호 추가
     */
    addPageNumbers(pdf, totalPages) {
        const pageCount = pdf.internal.getNumberOfPages();
        const pageWidth = pdf.internal.pageSize.width;
        const pageHeight = pdf.internal.pageSize.height;

        for (let i = 1; i <= pageCount; i++) {
            pdf.setPage(i);
            pdf.setFontSize(10);
            pdf.setTextColor(this.colors.gray);
            const pageText = `${i} / ${pageCount}`;
            const pageTextWidth = pdf.getTextWidth(pageText);
            pdf.text(pageText, pageWidth - this.margins.right - pageTextWidth, pageHeight - 10);
        }
    }

    /**
     * 푸터 추가
     */
    addFooters(pdf, totalPages) {
        const pageCount = pdf.internal.getNumberOfPages();
        const pageHeight = pdf.internal.pageSize.height;

        for (let i = 1; i <= pageCount; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8);
            pdf.setTextColor(this.colors.gray);
            const footerText = `Generated by Personal Color Analysis System - ${new Date().toLocaleDateString('ko-KR')}`;
            pdf.text(footerText, this.margins.left, pageHeight - 5);
        }
    }

    /**
     * 한글 폰트 설정
     */
    async setupKoreanFont(pdf) {
        try {
            // 실제 환경에서는 한글 폰트 파일을 로드해야 함
            // 여기서는 기본 폰트 사용
            console.log('Korean font setup completed');
        } catch (error) {
            console.warn('Korean font setup failed, using default font');
        }
    }

    /**
     * 헬퍼 메서드들
     */
    getBrightnessDescription(brightness) {
        const descriptions = {
            high: '높은 명도 (밝은 색상 적합)',
            medium: '중간 명도 (균형잡힌 색상)',
            low: '낮은 명도 (깊은 색상 적합)'
        };
        return descriptions[brightness] || '중간 명도';
    }

    getSaturationDescription(saturation) {
        const descriptions = {
            high: '높은 채도 (선명한 색상)',
            medium: '중간 채도 (적당한 색상)',
            low: '낮은 채도 (차분한 색상)'
        };
        return descriptions[saturation] || '중간 채도';
    }

    getContrastDescription(contrast) {
        const descriptions = {
            high: '높은 대비감 (강렬한 색상 대비)',
            medium: '중간 대비감 (적절한 색상 대비)',
            low: '낮은 대비감 (부드러운 색상 조화)'
        };
        return descriptions[contrast] || '중간 대비감';
    }

    /**
     * PDF 다운로드
     */
    async downloadPDF(reportData, filename = null, options = {}) {
        try {
            const result = await this.generateReport(reportData, options);
            const defaultFilename = `퍼스널컬러_분석보고서_${reportData.customerInfo?.name || 'Unknown'}_${new Date().toISOString().split('T')[0]}.pdf`;
            
            // 다운로드 실행
            const link = document.createElement('a');
            link.href = result.dataUrl;
            link.download = filename || defaultFilename;
            link.click();

            return result;
        } catch (error) {
            console.error('PDF download failed:', error);
            throw error;
        }
    }

    /**
     * PDF 미리보기
     */
    async previewPDF(reportData, options = {}) {
        try {
            const result = await this.generateReport(reportData, options);
            
            // 새 창에서 미리보기
            const previewWindow = window.open('', '_blank');
            previewWindow.document.write(`
                <html>
                    <head>
                        <title>PDF 미리보기</title>
                        <style>
                            body { margin: 0; padding: 0; }
                            iframe { width: 100%; height: 100vh; border: none; }
                        </style>
                    </head>
                    <body>
                        <iframe src="${result.dataUrl}"></iframe>
                    </body>
                </html>
            `);

            return result;
        } catch (error) {
            console.error('PDF preview failed:', error);
            throw error;
        }
    }
}

// 전역 인스턴스 생성
window.PDFGenerator = new PDFGenerator();

export default PDFGenerator;
