/**
 * 헤어디자이너용 퍼스널컬러 진단 - 색상 팔레트 관리 도구
 * 실시간 색상 선택, 팔레트 생성, 브랜드 매칭, 색조합 추천
 * 
 * 주요 기능:
 * - 4계절 색상 팔레트 표시
 * - 실시간 색상 블렌딩 시뮬레이션
 * - 브랜드별 제품 매칭
 * - 색조합 호환성 분석
 * - 태블릿 터치 최적화 UI
 */

import { CONFIG } from '../config.js';
import { ColorSystem } from '../color/ColorSystem.js';
import { DeltaE } from '../color/DeltaE.js';
import { SEASONS } from '../data/seasons.js';
import { KOREAN_SKIN_TONES } from '../data/koreanSkinTones.js';
import { HAIR_COLOR_CHARTS } from '../data/hairColorCharts.js';

class ColorPalette {
    constructor(container) {
        this.container = container;
        this.colorSystem = new ColorSystem();
        this.deltaE = new DeltaE();
        
        // 상태 관리
        this.currentSeason = 'spring';
        this.selectedColors = new Set();
        this.customPalette = [];
        this.blendingMode = 'multiply';
        this.viewMode = 'grid'; // 'grid', 'list', 'wheel'
        
        // 캐시
        this.colorCache = new Map();
        this.harmonyCache = new Map();
        this.brandMatchCache = new Map();
        
        // UI 요소들
        this.elements = {};
        
        this.initialize();
    }

    async initialize() {
        console.log('[ColorPalette] 초기화 중...');
        
        try {
            this.createUI();
            this.setupEventListeners();
            this.loadSavedPalettes();
            await this.renderPalette();
            
            console.log('[ColorPalette] 초기화 완료');
        } catch (error) {
            console.error('[ColorPalette] 초기화 실패:', error);
        }
    }

    /**
     * UI 생성
     */
    createUI() {
        this.container.innerHTML = `
            <div class="color-palette-container">
                <!-- 헤더 컨트롤 -->
                <div class="palette-header">
                    <div class="season-selector">
                        <button class="season-btn active" data-season="spring">
                            <span class="season-icon">🌸</span>
                            Spring
                        </button>
                        <button class="season-btn" data-season="summer">
                            <span class="season-icon">🌿</span>
                            Summer
                        </button>
                        <button class="season-btn" data-season="autumn">
                            <span class="season-icon">🍂</span>
                            Autumn
                        </button>
                        <button class="season-btn" data-season="winter">
                            <span class="season-icon">❄️</span>
                            Winter
                        </button>
                    </div>
                    
                    <div class="view-controls">
                        <button class="view-btn active" data-view="grid">
                            <i class="icon-grid"></i>
                        </button>
                        <button class="view-btn" data-view="list">
                            <i class="icon-list"></i>
                        </button>
                        <button class="view-btn" data-view="wheel">
                            <i class="icon-circle"></i>
                        </button>
                    </div>
                </div>

                <!-- 메인 팔레트 영역 -->
                <div class="palette-main">
                    <!-- 색상 그리드 -->
                    <div class="palette-grid" id="palette-grid">
                        <!-- 동적 생성 -->
                    </div>

                    <!-- 색상 휠 (숨김) -->
                    <div class="palette-wheel hidden" id="palette-wheel">
                        <canvas id="color-wheel-canvas" width="300" height="300"></canvas>
                    </div>

                    <!-- 리스트 뷰 (숨김) -->
                    <div class="palette-list hidden" id="palette-list">
                        <!-- 동적 생성 -->
                    </div>
                </div>

                <!-- 선택된 색상들 -->
                <div class="selected-colors">
                    <h3>선택된 색상 <span class="count">(0)</span></h3>
                    <div class="selected-grid" id="selected-grid">
                        <!-- 동적 생성 -->
                    </div>
                    <div class="selection-controls">
                        <button class="btn-secondary" id="clear-selection">모두 해제</button>
                        <button class="btn-primary" id="create-harmony">조화색 생성</button>
                        <button class="btn-accent" id="match-brands">브랜드 매칭</button>
                    </div>
                </div>

                <!-- 색상 조화 분석 -->
                <div class="color-harmony hidden" id="color-harmony">
                    <h3>색상 조화 분석</h3>
                    <div class="harmony-results" id="harmony-results">
                        <!-- 동적 생성 -->
                    </div>
                </div>

                <!-- 브랜드 매칭 결과 -->
                <div class="brand-matching hidden" id="brand-matching">
                    <h3>브랜드 제품 매칭</h3>
                    <div class="brand-tabs">
                        <button class="brand-tab active" data-brand="loreal">로레알</button>
                        <button class="brand-tab" data-brand="wella">웰라</button>
                        <button class="brand-tab" data-brand="milbon">밀본</button>
                    </div>
                    <div class="brand-results" id="brand-results">
                        <!-- 동적 생성 -->
                    </div>
                </div>

                <!-- 색상 블렌딩 시뮬레이터 -->
                <div class="color-blender hidden" id="color-blender">
                    <h3>색상 블렌딩 시뮬레이터</h3>
                    <div class="blender-controls">
                        <label>블렌딩 모드:</label>
                        <select id="blend-mode">
                            <option value="multiply">곱하기</option>
                            <option value="overlay">오버레이</option>
                            <option value="soft-light">소프트 라이트</option>
                            <option value="normal">일반</option>
                        </select>
                    </div>
                    <canvas id="blend-canvas" width="400" height="100"></canvas>
                    <div class="blend-result" id="blend-result">
                        <!-- 블렌딩 결과 -->
                    </div>
                </div>

                <!-- 커스텀 팔레트 -->
                <div class="custom-palette">
                    <h3>나만의 팔레트 <button class="btn-small" id="save-palette">저장</button></h3>
                    <div class="custom-grid" id="custom-grid">
                        <!-- 동적 생성 -->
                    </div>
                    <div class="saved-palettes" id="saved-palettes">
                        <!-- 저장된 팔레트들 -->
                    </div>
                </div>
            </div>
        `;

        // 요소 참조 저장
        this.elements = {
            seasonBtns: this.container.querySelectorAll('.season-btn'),
            viewBtns: this.container.querySelectorAll('.view-btn'),
            paletteGrid: this.container.querySelector('#palette-grid'),
            paletteWheel: this.container.querySelector('#palette-wheel'),
            paletteList: this.container.querySelector('#palette-list'),
            selectedGrid: this.container.querySelector('#selected-grid'),
            countSpan: this.container.querySelector('.count'),
            colorHarmony: this.container.querySelector('#color-harmony'),
            brandMatching: this.container.querySelector('#brand-matching'),
            colorBlender: this.container.querySelector('#color-blender')
        };
    }

    /**
     * 팔레트 렌더링
     */
    async renderPalette() {
        const seasonData = SEASONS[this.currentSeason];
        if (!seasonData) return;

        switch (this.viewMode) {
            case 'grid':
                this.renderGridView(seasonData);
                break;
            case 'list':
                this.renderListView(seasonData);
                break;
            case 'wheel':
                this.renderWheelView(seasonData);
                break;
        }

        // 선택된 색상 업데이트
        this.updateSelectedColors();
    }

    /**
     * 그리드 뷰 렌더링
     */
    renderGridView(seasonData) {
        this.showView('grid');
        
        const html = [];
        
        // 기본 색상들
        html.push('<div class="color-category">');
        html.push('<h4>기본 색상</h4>');
        html.push('<div class="color-row">');
        
        seasonData.colors.primary.forEach(color => {
            const isSelected = this.selectedColors.has(color.hex);
            html.push(`
                <div class="color-swatch ${isSelected ? 'selected' : ''}" 
                     data-color="${color.hex}"
                     style="background-color: ${color.hex};"
                     title="${color.name}">
                    <div class="color-info">
                        <span class="color-name">${color.name}</span>
                        <span class="color-hex">${color.hex}</span>
                    </div>
                </div>
            `);
        });
        
        html.push('</div></div>');

        // 뉴트럴 색상들
        html.push('<div class="color-category">');
        html.push('<h4>뉴트럴 색상</h4>');
        html.push('<div class="color-row">');
        
        seasonData.colors.neutral.forEach(color => {
            const isSelected = this.selectedColors.has(color.hex);
            html.push(`
                <div class="color-swatch ${isSelected ? 'selected' : ''}" 
                     data-color="${color.hex}"
                     style="background-color: ${color.hex};"
                     title="${color.name}">
                    <div class="color-info">
                        <span class="color-name">${color.name}</span>
                        <span class="color-hex">${color.hex}</span>
                    </div>
                </div>
            `);
        });
        
        html.push('</div></div>');

        // 액센트 색상들
        html.push('<div class="color-category">');
        html.push('<h4>액센트 색상</h4>');
        html.push('<div class="color-row">');
        
        seasonData.colors.accent.forEach(color => {
            const isSelected = this.selectedColors.has(color.hex);
            html.push(`
                <div class="color-swatch ${isSelected ? 'selected' : ''}" 
                     data-color="${color.hex}"
                     style="background-color: ${color.hex};"
                     title="${color.name}">
                    <div class="color-info">
                        <span class="color-name">${color.name}</span>
                        <span class="color-hex">${color.hex}</span>
                    </div>
                </div>
            `);
        });
        
        html.push('</div></div>');

        this.elements.paletteGrid.innerHTML = html.join('');
        this.addColorSwatchListeners();
    }

    /**
     * 리스트 뷰 렌더링
     */
    renderListView(seasonData) {
        this.showView('list');
        
        const html = [];
        const allColors = [
            ...seasonData.colors.primary,
            ...seasonData.colors.neutral,
            ...seasonData.colors.accent
        ];

        allColors.forEach(color => {
            const isSelected = this.selectedColors.has(color.hex);
            const labColor = this.colorSystem.hexToLab(color.hex);
            const pccsInfo = this.getPCCSToneInfo(color);
            
            html.push(`
                <div class="color-list-item ${isSelected ? 'selected' : ''}" data-color="${color.hex}">
                    <div class="color-preview" style="background-color: ${color.hex};"></div>
                    <div class="color-details">
                        <div class="color-name-group">
                            <h5>${color.name}</h5>
                            <span class="color-hex">${color.hex}</span>
                        </div>
                        <div class="color-values">
                            <div class="value-group">
                                <label>CIE L*a*b*:</label>
                                <span>L*${labColor.l.toFixed(1)}, a*${labColor.a.toFixed(1)}, b*${labColor.b.toFixed(1)}</span>
                            </div>
                            <div class="value-group">
                                <label>PCCS 톤:</label>
                                <span>${pccsInfo.tone} (${pccsInfo.description})</span>
                            </div>
                        </div>
                        <div class="color-actions">
                            <button class="btn-small" onclick="colorPalette.findHarmony('${color.hex}')">조화색 찾기</button>
                            <button class="btn-small" onclick="colorPalette.matchBrands('${color.hex}')">브랜드 매칭</button>
                        </div>
                    </div>
                </div>
            `);
        });

        this.elements.paletteList.innerHTML = html.join('');
        this.addColorSwatchListeners();
    }

    /**
     * 색상 휠 뷰 렌더링
     */
    renderWheelView(seasonData) {
        this.showView('wheel');
        
        const canvas = this.container.querySelector('#color-wheel-canvas');
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 120;

        // 캔버스 클리어
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 색상 휠 그리기
        const allColors = [
            ...seasonData.colors.primary,
            ...seasonData.colors.neutral,
            ...seasonData.colors.accent
        ];

        allColors.forEach((color, index) => {
            const angle = (index / allColors.length) * 2 * Math.PI;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            // 색상 점 그리기
            ctx.beginPath();
            ctx.arc(x, y, 15, 0, 2 * Math.PI);
            ctx.fillStyle = color.hex;
            ctx.fill();

            // 선택된 색상 표시
            if (this.selectedColors.has(color.hex)) {
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 3;
                ctx.stroke();
            }

            ctx.strokeStyle = '#333333';
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        // 클릭 이벤트 추가
        canvas.onclick = (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            allColors.forEach((color, index) => {
                const angle = (index / allColors.length) * 2 * Math.PI;
                const colorX = centerX + Math.cos(angle) * radius;
                const colorY = centerY + Math.sin(angle) * radius;
                
                const distance = Math.sqrt((x - colorX) ** 2 + (y - colorY) ** 2);
                if (distance <= 15) {
                    this.toggleColorSelection(color.hex);
                }
            });
        };
    }

    /**
     * 색상 선택 토글
     */
    toggleColorSelection(colorHex) {
        if (this.selectedColors.has(colorHex)) {
            this.selectedColors.delete(colorHex);
        } else {
            this.selectedColors.add(colorHex);
        }

        this.updateSelectedColors();
        this.renderPalette(); // 선택 상태 업데이트를 위해 재렌더링
    }

    /**
     * 선택된 색상들 업데이트
     */
    updateSelectedColors() {
        this.elements.countSpan.textContent = `(${this.selectedColors.size})`;
        
        const html = [];
        this.selectedColors.forEach(colorHex => {
            const colorInfo = this.findColorInfo(colorHex);
            html.push(`
                <div class="selected-color" data-color="${colorHex}">
                    <div class="color-preview" style="background-color: ${colorHex};"></div>
                    <div class="color-label">${colorInfo?.name || colorHex}</div>
                    <button class="remove-color" onclick="colorPalette.toggleColorSelection('${colorHex}')">×</button>
                </div>
            `);
        });

        this.elements.selectedGrid.innerHTML = html.join('');

        // 블렌딩 업데이트
        if (this.selectedColors.size > 1) {
            this.updateBlending();
        }
    }

    /**
     * 색상 조화 분석
     */
    analyzeColorHarmony() {
        if (this.selectedColors.size < 2) {
            alert('색상 조화 분석을 위해 2개 이상의 색상을 선택해주세요.');
            return;
        }

        const colors = Array.from(this.selectedColors);
        const harmonyResults = this.calculateColorHarmony(colors);
        
        this.displayHarmonyResults(harmonyResults);
        this.elements.colorHarmony.classList.remove('hidden');
    }

    /**
     * 색상 조화 계산
     */
    calculateColorHarmony(colors) {
        const results = {
            compatibility: 'good',
            dominantTemp: 'warm',
            suggestions: [],
            deltaE: []
        };

        // Delta E 계산
        for (let i = 0; i < colors.length; i++) {
            for (let j = i + 1; j < colors.length; j++) {
                const lab1 = this.colorSystem.hexToLab(colors[i]);
                const lab2 = this.colorSystem.hexToLab(colors[j]);
                const deltaE = this.deltaE.calculate(lab1, lab2);
                
                results.deltaE.push({
                    color1: colors[i],
                    color2: colors[j],
                    value: deltaE,
                    perception: this.interpretDeltaE(deltaE)
                });
            }
        }

        // 색온도 분석
        const warmCount = colors.filter(color => this.isWarmColor(color)).length;
        const coolCount = colors.length - warmCount;
        results.dominantTemp = warmCount > coolCount ? 'warm' : 'cool';

        // 호환성 평가
        const avgDeltaE = results.deltaE.reduce((sum, item) => sum + item.value, 0) / results.deltaE.length;
        if (avgDeltaE < 10) results.compatibility = 'excellent';
        else if (avgDeltaE < 20) results.compatibility = 'good';
        else if (avgDeltaE < 40) results.compatibility = 'fair';
        else results.compatibility = 'poor';

        return results;
    }

    /**
     * 브랜드 제품 매칭
     */
    async matchBrandProducts() {
        if (this.selectedColors.size === 0) {
            alert('브랜드 매칭을 위해 색상을 선택해주세요.');
            return;
        }

        const results = {
            loreal: [],
            wella: [],
            milbon: []
        };

        this.selectedColors.forEach(colorHex => {
            // 각 브랜드별로 가장 유사한 제품 찾기
            Object.keys(HAIR_COLOR_CHARTS).forEach(brand => {
                const matches = this.findClosestBrandMatches(colorHex, brand, 3);
                results[brand].push(...matches);
            });
        });

        this.displayBrandMatching(results);
        this.elements.brandMatching.classList.remove('hidden');
    }

    /**
     * 가장 유사한 브랜드 제품 찾기
     */
    findClosestBrandMatches(targetColor, brand, limit = 5) {
        const brandData = HAIR_COLOR_CHARTS[brand];
        if (!brandData) return [];

        const targetLab = this.colorSystem.hexToLab(targetColor);
        const matches = [];

        brandData.colors.forEach(product => {
            if (product.cmyk) {
                // CMYK를 RGB로 변환 후 Lab으로 변환
                const rgb = this.colorSystem.cmykToRgb(product.cmyk);
                const hex = this.colorSystem.rgbToHex(rgb);
                const productLab = this.colorSystem.hexToLab(hex);
                
                const deltaE = this.deltaE.calculate(targetLab, productLab);
                
                matches.push({
                    ...product,
                    hex: hex,
                    deltaE: deltaE,
                    similarity: Math.max(0, 100 - deltaE * 2) // 0-100% 유사도
                });
            }
        });

        return matches
            .sort((a, b) => a.deltaE - b.deltaE)
            .slice(0, limit);
    }

    /**
     * 색상 블렌딩 업데이트
     */
    updateBlending() {
        const colors = Array.from(this.selectedColors);
        if (colors.length < 2) return;

        const canvas = this.container.querySelector('#blend-canvas');
        const ctx = canvas.getContext('2d');
        
        // 블렌딩 결과 그리기
        this.drawBlendResult(ctx, colors, canvas.width, canvas.height);
        
        // 블렌딩 섹션 표시
        this.elements.colorBlender.classList.remove('hidden');
    }

    /**
     * 블렌딩 결과 그리기
     */
    drawBlendResult(ctx, colors, width, height) {
        const segmentWidth = width / colors.length;
        
        // 개별 색상들
        colors.forEach((color, index) => {
            ctx.fillStyle = color;
            ctx.fillRect(index * segmentWidth, 0, segmentWidth, height / 2);
        });

        // 블렌딩 결과
        const blendedColor = this.blendColors(colors, this.blendingMode);
        ctx.fillStyle = blendedColor;
        ctx.fillRect(0, height / 2, width, height / 2);

        // 결과 정보 업데이트
        const resultElement = this.container.querySelector('#blend-result');
        const labColor = this.colorSystem.hexToLab(blendedColor);
        resultElement.innerHTML = `
            <div class="blend-info">
                <div class="blend-color" style="background-color: ${blendedColor};"></div>
                <div class="blend-details">
                    <div><strong>블렌딩 결과:</strong> ${blendedColor}</div>
                    <div><strong>CIE L*a*b*:</strong> L*${labColor.l.toFixed(1)}, a*${labColor.a.toFixed(1)}, b*${labColor.b.toFixed(1)}</div>
                    <div><strong>권장 사용:</strong> ${this.getBlendRecommendation(blendedColor)}</div>
                </div>
            </div>
        `;
    }

    /**
     * 색상 블렌딩
     */
    blendColors(colors, mode) {
        if (colors.length === 0) return '#000000';
        if (colors.length === 1) return colors[0];

        // RGB 값들 추출
        const rgbColors = colors.map(hex => this.colorSystem.hexToRgb(hex));
        
        let result;
        switch (mode) {
            case 'multiply':
                result = this.multiplyBlend(rgbColors);
                break;
            case 'overlay':
                result = this.overlayBlend(rgbColors);
                break;
            case 'soft-light':
                result = this.softLightBlend(rgbColors);
                break;
            default:
                result = this.averageBlend(rgbColors);
        }

        return this.colorSystem.rgbToHex(result);
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 계절 버튼
        this.elements.seasonBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.elements.seasonBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentSeason = btn.dataset.season;
                this.renderPalette();
            });
        });

        // 뷰 버튼
        this.elements.viewBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.elements.viewBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.viewMode = btn.dataset.view;
                this.renderPalette();
            });
        });

        // 제어 버튼들
        this.container.querySelector('#clear-selection').addEventListener('click', () => {
            this.selectedColors.clear();
            this.updateSelectedColors();
            this.renderPalette();
        });

        this.container.querySelector('#create-harmony').addEventListener('click', () => {
            this.analyzeColorHarmony();
        });

        this.container.querySelector('#match-brands').addEventListener('click', () => {
            this.matchBrandProducts();
        });

        this.container.querySelector('#save-palette').addEventListener('click', () => {
            this.saveCustomPalette();
        });

        // 블렌딩 모드 변경
        this.container.querySelector('#blend-mode').addEventListener('change', (e) => {
            this.blendingMode = e.target.value;
            this.updateBlending();
        });
    }

    /**
     * 유틸리티 메서드들
     */
    addColorSwatchListeners() {
        this.container.querySelectorAll('.color-swatch, .color-list-item').forEach(swatch => {
            swatch.addEventListener('click', (e) => {
                e.preventDefault();
                const colorHex = swatch.dataset.color;
                this.toggleColorSelection(colorHex);
            });
        });
    }

    showView(viewType) {
        this.container.querySelector('#palette-grid').classList.toggle('hidden', viewType !== 'grid');
        this.container.querySelector('#palette-wheel').classList.toggle('hidden', viewType !== 'wheel');
        this.container.querySelector('#palette-list').classList.toggle('hidden', viewType !== 'list');
    }

    findColorInfo(colorHex) {
        const seasonData = SEASONS[this.currentSeason];
        const allColors = [
            ...seasonData.colors.primary,
            ...seasonData.colors.neutral,
            ...seasonData.colors.accent
        ];
        return allColors.find(color => color.hex === colorHex);
    }

    getPCCSToneInfo(color) {
        // PCCS 톤 정보 반환 (간단화된 버전)
        const hsl = this.colorSystem.hexToHsl(color.hex);
        let tone = 'vivid';
        let description = '선명한';

        if (hsl.s < 30) {
            tone = 'neutral';
            description = '중성의';
        } else if (hsl.l > 80) {
            tone = 'pale';
            description = '연한';
        } else if (hsl.l < 30) {
            tone = 'dark';
            description = '어두운';
        }

        return { tone, description };
    }

    isWarmColor(colorHex) {
        const hsl = this.colorSystem.hexToHsl(colorHex);
        const hue = hsl.h;
        // 따뜻한 색상 범위: 빨강-주황-노랑 (0-60, 300-360)
        return (hue >= 0 && hue <= 60) || (hue >= 300 && hue <= 360);
    }

    interpretDeltaE(deltaE) {
        if (deltaE < 1) return '거의 구분 불가능';
        if (deltaE < 2) return '매우 유사';
        if (deltaE < 5) return '유사';
        if (deltaE < 10) return '다소 다름';
        if (deltaE < 20) return '다름';
        return '매우 다름';
    }

    // 블렌딩 알고리즘들
    multiplyBlend(colors) {
        return colors.reduce((result, color) => ({
            r: Math.round((result.r * color.r) / 255),
            g: Math.round((result.g * color.g) / 255),
            b: Math.round((result.b * color.b) / 255)
        }));
    }

    averageBlend(colors) {
        const sum = colors.reduce((result, color) => ({
            r: result.r + color.r,
            g: result.g + color.g,
            b: result.b + color.b
        }), { r: 0, g: 0, b: 0 });

        return {
            r: Math.round(sum.r / colors.length),
            g: Math.round(sum.g / colors.length),
            b: Math.round(sum.b / colors.length)
        };
    }

    overlayBlend(colors) {
        // 간단화된 오버레이 블렌드
        return this.averageBlend(colors);
    }

    softLightBlend(colors) {
        // 간단화된 소프트 라이트 블렌드
        return this.averageBlend(colors);
    }

    getBlendRecommendation(color) {
        const hsl = this.colorSystem.hexToHsl(color);
        if (hsl.l > 70) return '하이라이트 추천';
        if (hsl.l < 30) return '로우라이트 추천';
        if (hsl.s > 50) return '컬러 포인트 추천';
        return '베이스 컬러 추천';
    }

    displayHarmonyResults(results) {
        const harmonyElement = this.container.querySelector('#harmony-results');
        harmonyElement.innerHTML = `
            <div class="harmony-overview">
                <div class="harmony-score ${results.compatibility}">
                    호환성: ${this.getCompatibilityText(results.compatibility)}
                </div>
                <div class="harmony-temp">
                    주조: ${results.dominantTemp === 'warm' ? '웜톤' : '쿨톤'}
                </div>
            </div>
            <div class="delta-e-results">
                ${results.deltaE.map(item => `
                    <div class="delta-e-item">
                        <div class="color-pair">
                            <span class="color-dot" style="background-color: ${item.color1};"></span>
                            <span class="color-dot" style="background-color: ${item.color2};"></span>
                        </div>
                        <div class="delta-value">ΔE: ${item.value.toFixed(1)}</div>
                        <div class="delta-perception">${item.perception}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    displayBrandMatching(results) {
        const brandElement = this.container.querySelector('#brand-results');
        const activeBrand = this.container.querySelector('.brand-tab.active').dataset.brand;
        
        const brandResults = results[activeBrand] || [];
        brandElement.innerHTML = brandResults.map(product => `
            <div class="brand-match-item">
                <div class="product-color" style="background-color: ${product.hex};"></div>
                <div class="product-info">
                    <h5>${product.name || product.code}</h5>
                    <div class="product-details">
                        <span>유사도: ${product.similarity.toFixed(1)}%</span>
                        <span>ΔE: ${product.deltaE.toFixed(1)}</span>
                    </div>
                    <div class="product-code">${product.code}</div>
                </div>
            </div>
        `).join('');
    }

    getCompatibilityText(compatibility) {
        const texts = {
            excellent: '매우 좋음',
            good: '좋음',
            fair: '보통',
            poor: '나쁨'
        };
        return texts[compatibility] || '알 수 없음';
    }

    async saveCustomPalette() {
        if (this.selectedColors.size === 0) {
            alert('저장할 색상을 선택해주세요.');
            return;
        }

        const paletteName = prompt('팔레트 이름을 입력하세요:');
        if (!paletteName) return;

        const palette = {
            name: paletteName,
            colors: Array.from(this.selectedColors),
            season: this.currentSeason,
            createdAt: new Date().toISOString()
        };

        // 로컬 스토리지에 저장
        const savedPalettes = JSON.parse(localStorage.getItem('savedPalettes') || '[]');
        savedPalettes.push(palette);
        localStorage.setItem('savedPalettes', JSON.stringify(savedPalettes));

        console.log(`[ColorPalette] 팔레트 저장: ${paletteName}`);
        this.loadSavedPalettes();
    }

    loadSavedPalettes() {
        const savedPalettes = JSON.parse(localStorage.getItem('savedPalettes') || '[]');
        const container = this.container.querySelector('#saved-palettes');
        
        container.innerHTML = savedPalettes.map(palette => `
            <div class="saved-palette-item">
                <div class="palette-preview">
                    ${palette.colors.map(color => `
                        <div class="mini-color" style="background-color: ${color};"></div>
                    `).join('')}
                </div>
                <div class="palette-info">
                    <h6>${palette.name}</h6>
                    <span class="palette-season">${palette.season}</span>
                </div>
                <div class="palette-actions">
                    <button class="btn-mini" onclick="colorPalette.loadPalette('${palette.name}')">불러오기</button>
                    <button class="btn-mini danger" onclick="colorPalette.deletePalette('${palette.name}')">삭제</button>
                </div>
            </div>
        `).join('');
    }

    loadPalette(paletteName) {
        const savedPalettes = JSON.parse(localStorage.getItem('savedPalettes') || '[]');
        const palette = savedPalettes.find(p => p.name === paletteName);
        
        if (palette) {
            this.selectedColors.clear();
            palette.colors.forEach(color => this.selectedColors.add(color));
            this.currentSeason = palette.season;
            
            // UI 업데이트
            this.elements.seasonBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.season === palette.season);
            });
            
            this.updateSelectedColors();
            this.renderPalette();
            
            console.log(`[ColorPalette] 팔레트 불러오기: ${paletteName}`);
        }
    }

    deletePalette(paletteName) {
        if (confirm(`"${paletteName}" 팔레트를 삭제하시겠습니까?`)) {
            const savedPalettes = JSON.parse(localStorage.getItem('savedPalettes') || '[]');
            const filtered = savedPalettes.filter(p => p.name !== paletteName);
            localStorage.setItem('savedPalettes', JSON.stringify(filtered));
            
            this.loadSavedPalettes();
            console.log(`[ColorPalette] 팔레트 삭제: ${paletteName}`);
        }
    }
}

// 전역 접근을 위한 인스턴스 (UI 콜백용)
window.colorPalette = null;

export default ColorPalette;
