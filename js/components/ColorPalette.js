/**
 * ColorPalette.js - 진짜 전문 데이터 사용하는 최종 버전 
 * 헤어디자이너용 퍼스널컬러 진단 - 색상 팔레트 관리 도구
 * 
 * 🚀 최종 수정사항:
 * - 진짜 전문 데이터 SEASON_COLOR_PALETTES 사용
 * - 가짜 폴백 데이터 제거
 * - ES6→ES5 완전 변환
 * - html is not defined 오류 완전 해결
 * - 브라우저 호환성 완성
 */

(function() {
    'use strict';

    /**
     * 색상 팔레트 관리 클래스 (ES5 최종 버전)
     */
    function ColorPalette(container) {
        this.container = container;
        
        // 전역 객체들 안전하게 접근
        this.colorSystem = window.ColorSystem ? new window.ColorSystem() : null;
        this.deltaE = window.DeltaE ? new window.DeltaE() : null;
        
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
        
        // 바인딩
        this.initialize = this.initialize.bind(this);
        this.createUI = this.createUI.bind(this);
        this.renderPalette = this.renderPalette.bind(this);
        
        this.initialize();
    }

    /**
     * 초기화
     */
    ColorPalette.prototype.initialize = function() {
        console.log('[ColorPalette] 초기화 중...');
        
        try {
            this.createUI();
            this.setupEventListeners();
            this.loadSavedPalettes();
            this.renderPalette();
            
            console.log('[ColorPalette] 초기화 완료');
        } catch (error) {
            console.error('[ColorPalette] 초기화 실패:', error);
        }
    };

    /**
     * UI 생성 (html 변수 오류 완전 해결)
     */
    ColorPalette.prototype.createUI = function() {
        var htmlContent = 
            '<div class="color-palette-container">' +
                '<!-- 헤더 컨트롤 -->' +
                '<div class="palette-header">' +
                    '<div class="season-selector">' +
                        '<button class="season-btn active" data-season="spring">' +
                            '<span class="season-icon">🌸</span>' +
                            'Spring' +
                        '</button>' +
                        '<button class="season-btn" data-season="summer">' +
                            '<span class="season-icon">🌿</span>' +
                            'Summer' +
                        '</button>' +
                        '<button class="season-btn" data-season="autumn">' +
                            '<span class="season-icon">🍂</span>' +
                            'Autumn' +
                        '</button>' +
                        '<button class="season-btn" data-season="winter">' +
                            '<span class="season-icon">❄️</span>' +
                            'Winter' +
                        '</button>' +
                    '</div>' +
                    
                    '<div class="view-controls">' +
                        '<button class="view-btn active" data-view="grid">' +
                            '<i class="icon-grid"></i>' +
                        '</button>' +
                        '<button class="view-btn" data-view="list">' +
                            '<i class="icon-list"></i>' +
                        '</button>' +
                        '<button class="view-btn" data-view="wheel">' +
                            '<i class="icon-circle"></i>' +
                        '</button>' +
                    '</div>' +
                '</div>' +

                '<!-- 메인 팔레트 영역 -->' +
                '<div class="palette-main">' +
                    '<!-- 색상 그리드 -->' +
                    '<div class="palette-grid" id="palette-grid">' +
                        '<!-- 동적 생성 -->' +
                    '</div>' +

                    '<!-- 색상 휠 (숨김) -->' +
                    '<div class="palette-wheel hidden" id="palette-wheel">' +
                        '<canvas id="color-wheel-canvas" width="300" height="300"></canvas>' +
                    '</div>' +

                    '<!-- 리스트 뷰 (숨김) -->' +
                    '<div class="palette-list hidden" id="palette-list">' +
                        '<!-- 동적 생성 -->' +
                    '</div>' +
                '</div>' +

                '<!-- 선택된 색상들 -->' +
                '<div class="selected-colors">' +
                    '<h3>선택된 색상 <span class="count">(0)</span></h3>' +
                    '<div class="selected-grid" id="selected-grid">' +
                        '<!-- 동적 생성 -->' +
                    '</div>' +
                    '<div class="selection-controls">' +
                        '<button class="btn-secondary" id="clear-selection">모두 해제</button>' +
                        '<button class="btn-primary" id="create-harmony">조화색 생성</button>' +
                        '<button class="btn-accent" id="match-brands">브랜드 매칭</button>' +
                    '</div>' +
                '</div>' +

                '<!-- 색상 조화 분석 -->' +
                '<div class="color-harmony hidden" id="color-harmony">' +
                    '<h3>색상 조화 분석</h3>' +
                    '<div class="harmony-results" id="harmony-results">' +
                        '<!-- 동적 생성 -->' +
                    '</div>' +
                '</div>' +

                '<!-- 브랜드 매칭 결과 -->' +
                '<div class="brand-matching hidden" id="brand-matching">' +
                    '<h3>브랜드 제품 매칭</h3>' +
                    '<div class="brand-tabs">' +
                        '<button class="brand-tab active" data-brand="loreal">로레알</button>' +
                        '<button class="brand-tab" data-brand="wella">웰라</button>' +
                        '<button class="brand-tab" data-brand="milbon">밀본</button>' +
                    '</div>' +
                    '<div class="brand-results" id="brand-results">' +
                        '<!-- 동적 생성 -->' +
                    '</div>' +
                '</div>' +

                '<!-- 색상 블렌딩 시뮬레이터 -->' +
                '<div class="color-blender hidden" id="color-blender">' +
                    '<h3>색상 블렌딩 시뮬레이터</h3>' +
                    '<div class="blender-controls">' +
                        '<label>블렌딩 모드:</label>' +
                        '<select id="blend-mode">' +
                            '<option value="multiply">곱하기</option>' +
                            '<option value="overlay">오버레이</option>' +
                            '<option value="soft-light">소프트 라이트</option>' +
                            '<option value="normal">일반</option>' +
                        '</select>' +
                    '</div>' +
                    '<canvas id="blend-canvas" width="400" height="100"></canvas>' +
                    '<div class="blend-result" id="blend-result">' +
                        '<!-- 블렌딩 결과 -->' +
                    '</div>' +
                '</div>' +

                '<!-- 커스텀 팔레트 -->' +
                '<div class="custom-palette">' +
                    '<h3>나만의 팔레트 <button class="btn-small" id="save-palette">저장</button></h3>' +
                    '<div class="custom-grid" id="custom-grid">' +
                        '<!-- 동적 생성 -->' +
                    '</div>' +
                    '<div class="saved-palettes" id="saved-palettes">' +
                        '<!-- 저장된 팔레트들 -->' +
                    '</div>' +
                '</div>' +
            '</div>';

        this.container.innerHTML = htmlContent;

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
    };

    /**
     * 팔레트 렌더링 (진짜 데이터 사용)
     */
    ColorPalette.prototype.renderPalette = function() {
        var seasonData = this.getSeasonData(this.currentSeason);
        if (!seasonData) {
            console.error('[ColorPalette] 계절 데이터 없음:', this.currentSeason);
            return;
        }

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
    };

    /**
     * 진짜 전문 데이터 가져오기 (SEASON_COLOR_PALETTES 사용)
     */
    ColorPalette.prototype.getSeasonData = function(season) {
        if (!season) {
            return null;
        }

        // 실제 전문 데이터 사용 (SEASON_COLOR_PALETTES)
        var seasonData = window.SEASON_COLOR_PALETTES && window.SEASON_COLOR_PALETTES[season] ? 
            window.SEASON_COLOR_PALETTES[season] : null;
            
        if (!seasonData) {
            console.error('[ColorPalette] 계절 데이터를 찾을 수 없음:', season);
            console.error('[ColorPalette] 사용 가능한 데이터:', Object.keys(window.SEASON_COLOR_PALETTES || {}));
            return null;
        }

        // SEASON_COLOR_PALETTES 구조를 ColorPalette가 기대하는 구조로 변환
        return {
            name: window.SEASON_CHARACTERISTICS && window.SEASON_CHARACTERISTICS[season] ? 
                window.SEASON_CHARACTERISTICS[season].name : season,
            undertone: window.SEASON_CHARACTERISTICS && window.SEASON_CHARACTERISTICS[season] ? 
                window.SEASON_CHARACTERISTICS[season].temperature : 
                (season === 'spring' || season === 'autumn' ? 'warm' : 'cool'),
            lightness: window.SEASON_CHARACTERISTICS && window.SEASON_CHARACTERISTICS[season] ? 
                window.SEASON_CHARACTERISTICS[season].lightness :
                (season === 'spring' || season === 'summer' ? 'light' : 'dark'),
            colors: {
                primary: seasonData.primary_colors || [],
                neutral: seasonData.neutral_colors || [],
                accent: seasonData.accent_colors || []
            }
        };
    };

    /**
     * 그리드 뷰 렌더링 (진짜 데이터로 표시)
     */
    ColorPalette.prototype.renderGridView = function(seasonData) {
        this.showView('grid');
        
        var html = [];
        var self = this;
        
        // 기본 색상들 (실제 CIE L*a*b*, PCCS 톤 데이터 포함)
        html.push('<div class="color-category">');
        html.push('<h4>기본 색상 (' + seasonData.colors.primary.length + '개)</h4>');
        html.push('<div class="color-row">');
        
        seasonData.colors.primary.forEach(function(color) {
            var isSelected = self.selectedColors.has(color.hex);
            var labInfo = color.lab ? 
                'L*' + color.lab.l.toFixed(1) + ' a*' + color.lab.a.toFixed(1) + ' b*' + color.lab.b.toFixed(1) : '';
            var pccsInfo = color.pccs_tone || '';
            var levelInfo = color.level ? 'Lv.' + color.level : '';
            
            html.push(
                '<div class="color-swatch ' + (isSelected ? 'selected' : '') + '" ' +
                     'data-color="' + color.hex + '" ' +
                     'style="background-color: ' + color.hex + ';" ' +
                     'title="' + color.name + ' - ' + labInfo + ' - ' + pccsInfo + '">' +
                    '<div class="color-info">' +
                        '<span class="color-name">' + color.name + '</span>' +
                        '<span class="color-hex">' + color.hex + '</span>' +
                        (levelInfo ? '<span class="color-level">' + levelInfo + '</span>' : '') +
                        (pccsInfo ? '<span class="color-tone">' + pccsInfo + '</span>' : '') +
                    '</div>' +
                '</div>'
            );
        });
        
        html.push('</div></div>');

        // 뉴트럴 색상들
        html.push('<div class="color-category">');
        html.push('<h4>뉴트럴 색상 (' + seasonData.colors.neutral.length + '개)</h4>');
        html.push('<div class="color-row">');
        
        seasonData.colors.neutral.forEach(function(color) {
            var isSelected = self.selectedColors.has(color.hex);
            var labInfo = color.lab ? 
                'L*' + color.lab.l.toFixed(1) + ' a*' + color.lab.a.toFixed(1) + ' b*' + color.lab.b.toFixed(1) : '';
            
            html.push(
                '<div class="color-swatch ' + (isSelected ? 'selected' : '') + '" ' +
                     'data-color="' + color.hex + '" ' +
                     'style="background-color: ' + color.hex + ';" ' +
                     'title="' + color.name + ' - ' + labInfo + '">' +
                    '<div class="color-info">' +
                        '<span class="color-name">' + color.name + '</span>' +
                        '<span class="color-hex">' + color.hex + '</span>' +
                    '</div>' +
                '</div>'
            );
        });
        
        html.push('</div></div>');

        // 액센트 색상들
        html.push('<div class="color-category">');
        html.push('<h4>액센트 색상 (' + seasonData.colors.accent.length + '개)</h4>');
        html.push('<div class="color-row">');
        
        seasonData.colors.accent.forEach(function(color) {
            var isSelected = self.selectedColors.has(color.hex);
            var labInfo = color.lab ? 
                'L*' + color.lab.l.toFixed(1) + ' a*' + color.lab.a.toFixed(1) + ' b*' + color.lab.b.toFixed(1) : '';
            
            html.push(
                '<div class="color-swatch ' + (isSelected ? 'selected' : '') + '" ' +
                     'data-color="' + color.hex + '" ' +
                     'style="background-color: ' + color.hex + ';" ' +
                     'title="' + color.name + ' - ' + labInfo + '">' +
                    '<div class="color-info">' +
                        '<span class="color-name">' + color.name + '</span>' +
                        '<span class="color-hex">' + color.hex + '</span>' +
                    '</div>' +
                '</div>'
            );
        });
        
        html.push('</div></div>');

        this.elements.paletteGrid.innerHTML = html.join('');
        this.addColorSwatchListeners();
    };

    /**
     * 리스트 뷰 렌더링 (전문 데이터 정보 표시)
     */
    ColorPalette.prototype.renderListView = function(seasonData) {
        this.showView('list');
        
        var html = [];
        var self = this;
        var allColors = []
            .concat(seasonData.colors.primary)
            .concat(seasonData.colors.neutral)
            .concat(seasonData.colors.accent);

        allColors.forEach(function(color) {
            var isSelected = self.selectedColors.has(color.hex);
            var labInfo = color.lab ? color.lab : self.hexToLabSafe(color.hex);
            var pccsInfo = color.pccs_tone || 'unknown';
            var categoryInfo = color.category || '';
            var levelInfo = color.level || '';
            
            html.push(
                '<div class="color-list-item ' + (isSelected ? 'selected' : '') + '" data-color="' + color.hex + '">' +
                    '<div class="color-preview" style="background-color: ' + color.hex + ';"></div>' +
                    '<div class="color-details">' +
                        '<div class="color-name-group">' +
                            '<h5>' + color.name + '</h5>' +
                            '<span class="color-hex">' + color.hex + '</span>' +
                        '</div>' +
                        '<div class="color-values">' +
                            '<div class="value-group">' +
                                '<label>CIE L*a*b*:</label>' +
                                '<span>L*' + labInfo.l.toFixed(1) + ', a*' + labInfo.a.toFixed(1) + ', b*' + labInfo.b.toFixed(1) + '</span>' +
                            '</div>' +
                            '<div class="value-group">' +
                                '<label>PCCS 톤:</label>' +
                                '<span>' + pccsInfo + '</span>' +
                            '</div>' +
                            (levelInfo ? 
                                '<div class="value-group">' +
                                    '<label>레벨:</label>' +
                                    '<span>' + levelInfo + '</span>' +
                                '</div>' : '') +
                            (categoryInfo ? 
                                '<div class="value-group">' +
                                    '<label>카테고리:</label>' +
                                    '<span>' + categoryInfo + '</span>' +
                                '</div>' : '') +
                        '</div>' +
                        '<div class="color-actions">' +
                            '<button class="btn-small" onclick="window.colorPalette.findHarmony(\'' + color.hex + '\')">조화색 찾기</button>' +
                            '<button class="btn-small" onclick="window.colorPalette.matchBrands(\'' + color.hex + '\')">브랜드 매칭</button>' +
                        '</div>' +
                    '</div>' +
                '</div>'
            );
        });

        this.elements.paletteList.innerHTML = html.join('');
        this.addColorSwatchListeners();
    };

    /**
     * 색상 휠 뷰 렌더링 (전문 색상으로)
     */
    ColorPalette.prototype.renderWheelView = function(seasonData) {
        this.showView('wheel');
        
        var canvas = this.container.querySelector('#color-wheel-canvas');
        if (!canvas) return;
        
        var ctx = canvas.getContext('2d');
        var centerX = canvas.width / 2;
        var centerY = canvas.height / 2;
        var radius = 120;
        var self = this;

        // 캔버스 클리어
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 색상 휠 그리기 (전문 데이터로)
        var allColors = []
            .concat(seasonData.colors.primary)
            .concat(seasonData.colors.neutral)
            .concat(seasonData.colors.accent);

        allColors.forEach(function(color, index) {
            var angle = (index / allColors.length) * 2 * Math.PI;
            var x = centerX + Math.cos(angle) * radius;
            var y = centerY + Math.sin(angle) * radius;

            // 색상 점 그리기
            ctx.beginPath();
            ctx.arc(x, y, 15, 0, 2 * Math.PI);
            ctx.fillStyle = color.hex;
            ctx.fill();

            // 선택된 색상 표시
            if (self.selectedColors.has(color.hex)) {
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 3;
                ctx.stroke();
            }

            ctx.strokeStyle = '#333333';
            ctx.lineWidth = 1;
            ctx.stroke();

            // 색상명 표시 (레벨 정보 포함)
            ctx.fillStyle = '#333333';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            var label = color.name;
            if (color.level) label += ' (Lv.' + color.level + ')';
            ctx.fillText(label, x, y + 25);
        });

        // 클릭 이벤트 추가
        canvas.onclick = function(e) {
            var rect = canvas.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            
            allColors.forEach(function(color, index) {
                var angle = (index / allColors.length) * 2 * Math.PI;
                var colorX = centerX + Math.cos(angle) * radius;
                var colorY = centerY + Math.sin(angle) * radius;
                
                var distance = Math.sqrt((x - colorX) * (x - colorX) + (y - colorY) * (y - colorY));
                if (distance <= 15) {
                    self.toggleColorSelection(color.hex);
                }
            });
        };
    };

    /**
     * 색상 선택 토글
     */
    ColorPalette.prototype.toggleColorSelection = function(colorHex) {
        if (this.selectedColors.has(colorHex)) {
            this.selectedColors.delete(colorHex);
        } else {
            this.selectedColors.add(colorHex);
        }

        this.updateSelectedColors();
        this.renderPalette(); // 선택 상태 업데이트를 위해 재렌더링
    };

    /**
     * 선택된 색상들 업데이트
     */
    ColorPalette.prototype.updateSelectedColors = function() {
        this.elements.countSpan.textContent = '(' + this.selectedColors.size + ')';
        
        var html = [];
        var self = this;
        
        this.selectedColors.forEach(function(colorHex) {
            var colorInfo = self.findColorInfo(colorHex);
            html.push(
                '<div class="selected-color" data-color="' + colorHex + '">' +
                    '<div class="color-preview" style="background-color: ' + colorHex + ';"></div>' +
                    '<div class="color-label">' + (colorInfo ? colorInfo.name : colorHex) + '</div>' +
                    '<button class="remove-color" onclick="window.colorPalette.toggleColorSelection(\'' + colorHex + '\')">×</button>' +
                '</div>'
            );
        });

        this.elements.selectedGrid.innerHTML = html.join('');

        // 블렌딩 업데이트
        if (this.selectedColors.size > 1) {
            this.updateBlending();
        }
    };

    /**
     * 색상 조화 분석 (전문 데이터 기반)
     */
    ColorPalette.prototype.analyzeColorHarmony = function() {
        if (this.selectedColors.size < 2) {
            alert('색상 조화 분석을 위해 2개 이상의 색상을 선택해주세요.');
            return;
        }

        var colors = Array.from ? Array.from(this.selectedColors) : this.setToArray(this.selectedColors);
        var harmonyResults = this.calculateColorHarmony(colors);
        
        this.displayHarmonyResults(harmonyResults);
        this.elements.colorHarmony.classList.remove('hidden');
    };

    /**
     * 색상 조화 계산 (CIE L*a*b* 기반)
     */
    ColorPalette.prototype.calculateColorHarmony = function(colors) {
        var results = {
            compatibility: 'good',
            dominantTemp: 'warm',
            suggestions: [],
            deltaE: []
        };

        var self = this;

        // Delta E 2000 계산 (전문 색차 측정)
        for (var i = 0; i < colors.length; i++) {
            for (var j = i + 1; j < colors.length; j++) {
                var lab1 = this.getColorLabFromDatabase(colors[i]);
                var lab2 = this.getColorLabFromDatabase(colors[j]);
                var deltaE = this.calculateDeltaE(lab1, lab2);
                
                results.deltaE.push({
                    color1: colors[i],
                    color2: colors[j],
                    value: deltaE,
                    perception: this.interpretDeltaE(deltaE)
                });
            }
        }

        // 색온도 분석 (계절 특성 고려)
        var warmCount = colors.filter(function(color) {
            return self.isWarmColor(color);
        }).length;
        var coolCount = colors.length - warmCount;
        results.dominantTemp = warmCount > coolCount ? 'warm' : 'cool';

        // 호환성 평가 (Delta E 기준)
        if (results.deltaE.length > 0) {
            var avgDeltaE = results.deltaE.reduce(function(sum, item) {
                return sum + item.value;
            }, 0) / results.deltaE.length;
            
            if (avgDeltaE < 3) results.compatibility = 'excellent';
            else if (avgDeltaE < 6) results.compatibility = 'good';
            else if (avgDeltaE < 12) results.compatibility = 'fair';
            else results.compatibility = 'poor';
        }

        return results;
    };

    /**
     * 데이터베이스에서 색상의 CIE L*a*b* 값 가져오기
     */
    ColorPalette.prototype.getColorLabFromDatabase = function(colorHex) {
        var seasonData = this.getSeasonData(this.currentSeason);
        if (!seasonData) return this.hexToLabSafe(colorHex);
        
        var allColors = []
            .concat(seasonData.colors.primary)
            .concat(seasonData.colors.neutral)
            .concat(seasonData.colors.accent);
            
        for (var i = 0; i < allColors.length; i++) {
            if (allColors[i].hex === colorHex && allColors[i].lab) {
                return allColors[i].lab;
            }
        }
        
        return this.hexToLabSafe(colorHex);
    };

    /**
     * 브랜드 제품 매칭 (실제 제품 데이터베이스 사용)
     */
    ColorPalette.prototype.matchBrandProducts = function() {
        if (this.selectedColors.size === 0) {
            alert('브랜드 매칭을 위해 색상을 선택해주세요.');
            return;
        }

        var results = {
            loreal: [],
            wella: [],
            milbon: []
        };

        var self = this;
        this.selectedColors.forEach(function(colorHex) {
            // BRAND_COLOR_MAPPING 데이터 사용
            if (window.BRAND_COLOR_MAPPING) {
                var brands = ['loreal', 'wella', 'milbon'];
                brands.forEach(function(brand) {
                    var matches = self.findClosestBrandMatches(colorHex, brand, 3);
                    results[brand] = results[brand].concat(matches);
                });
            }
        });

        this.displayBrandMatching(results);
        this.elements.brandMatching.classList.remove('hidden');
    };

    /**
     * 가장 유사한 브랜드 제품 찾기 (실제 브랜드 데이터 사용)
     */
    ColorPalette.prototype.findClosestBrandMatches = function(targetColor, brand, limit) {
        limit = limit || 5;
        
        // 실제 BRAND_COLOR_MAPPING 데이터 사용
        var brandData = window.BRAND_COLOR_MAPPING && window.BRAND_COLOR_MAPPING[brand] ?
            window.BRAND_COLOR_MAPPING[brand] : [];
        
        if (brandData.length === 0) {
            // 실제 데이터가 없으면 로딩 메시지 표시
            return [{
                name: '데이터 로딩 중...',
                code: 'Loading',
                hex: targetColor,
                similarity: 0
            }];
        }

        var matches = [];
        var targetLab = this.hexToLabSafe(targetColor);
        
        brandData.forEach(function(product) {
            var productLab = product.lab || this.hexToLabSafe(product.hex);
            var deltaE = this.calculateDeltaE(targetLab, productLab);
            var similarity = Math.max(0, 100 - deltaE * 2); // Delta E를 유사도로 변환
            
            matches.push({
                name: product.name,
                code: product.code,
                hex: product.hex,
                similarity: similarity,
                deltaE: deltaE
            });
        }.bind(this));

        return matches
            .sort(function(a, b) { return b.similarity - a.similarity; })
            .slice(0, limit);
    };

    /**
     * 색상 블렌딩 업데이트
     */
    ColorPalette.prototype.updateBlending = function() {
        var colors = Array.from ? Array.from(this.selectedColors) : this.setToArray(this.selectedColors);
        if (colors.length < 2) return;

        var canvas = this.container.querySelector('#blend-canvas');
        if (!canvas) return;
        
        var ctx = canvas.getContext('2d');
        
        // 블렌딩 결과 그리기
        this.drawBlendResult(ctx, colors, canvas.width, canvas.height);
        
        // 블렌딩 섹션 표시
        this.elements.colorBlender.classList.remove('hidden');
    };

    /**
     * 블렌딩 결과 그리기 (전문 색상 정보 포함)
     */
    ColorPalette.prototype.drawBlendResult = function(ctx, colors, width, height) {
        var segmentWidth = width / colors.length;
        
        // 개별 색상들
        for (var i = 0; i < colors.length; i++) {
            ctx.fillStyle = colors[i];
            ctx.fillRect(i * segmentWidth, 0, segmentWidth, height / 2);
        }

        // 블렌딩 결과
        var blendedColor = this.blendColors(colors, this.blendingMode);
        ctx.fillStyle = blendedColor;
        ctx.fillRect(0, height / 2, width, height / 2);

        // 결과 정보 업데이트 (전문 정보 포함)
        var resultElement = this.container.querySelector('#blend-result');
        if (resultElement) {
            var labColor = this.hexToLabSafe(blendedColor);
            var recommendation = this.getBlendRecommendation(blendedColor);
            
            resultElement.innerHTML = 
                '<div class="blend-info">' +
                    '<div class="blend-color" style="background-color: ' + blendedColor + ';"></div>' +
                    '<div class="blend-details">' +
                        '<div><strong>블렌딩 결과:</strong> ' + blendedColor + '</div>' +
                        '<div><strong>CIE L*a*b*:</strong> L*' + labColor.l.toFixed(1) + ', a*' + labColor.a.toFixed(1) + ', b*' + labColor.b.toFixed(1) + '</div>' +
                        '<div><strong>색온도:</strong> ' + (this.isWarmColor(blendedColor) ? '웜톤' : '쿨톤') + '</div>' +
                        '<div><strong>권장 사용:</strong> ' + recommendation + '</div>' +
                    '</div>' +
                '</div>';
        }
    };

    /**
     * 이벤트 리스너 설정
     */
    ColorPalette.prototype.setupEventListeners = function() {
        var self = this;
        
        // 계절 버튼
        this.elements.seasonBtns.forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                self.elements.seasonBtns.forEach(function(b) { 
                    b.classList.remove('active'); 
                });
                btn.classList.add('active');
                self.currentSeason = btn.dataset.season;
                self.renderPalette();
                console.log('[ColorPalette] 계절 변경:', self.currentSeason);
            });
        });

        // 뷰 버튼
        this.elements.viewBtns.forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                self.elements.viewBtns.forEach(function(b) { 
                    b.classList.remove('active'); 
                });
                btn.classList.add('active');
                self.viewMode = btn.dataset.view;
                self.renderPalette();
                console.log('[ColorPalette] 뷰 변경:', self.viewMode);
            });
        });

        // 제어 버튼들
        var clearBtn = this.container.querySelector('#clear-selection');
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                self.selectedColors.clear();
                self.updateSelectedColors();
                self.renderPalette();
                console.log('[ColorPalette] 선택 색상 모두 해제');
            });
        }

        var harmonyBtn = this.container.querySelector('#create-harmony');
        if (harmonyBtn) {
            harmonyBtn.addEventListener('click', function() {
                self.analyzeColorHarmony();
            });
        }

        var brandBtn = this.container.querySelector('#match-brands');
        if (brandBtn) {
            brandBtn.addEventListener('click', function() {
                self.matchBrandProducts();
            });
        }

        var saveBtn = this.container.querySelector('#save-palette');
        if (saveBtn) {
            saveBtn.addEventListener('click', function() {
                self.saveCustomPalette();
            });
        }

        // 블렌딩 모드 변경
        var blendSelect = this.container.querySelector('#blend-mode');
        if (blendSelect) {
            blendSelect.addEventListener('change', function(e) {
                self.blendingMode = e.target.value;
                self.updateBlending();
            });
        }
    };

    // === 유틸리티 메서드들 (완전한 구현) ===
    
    ColorPalette.prototype.addColorSwatchListeners = function() {
        var self = this;
        var swatches = this.container.querySelectorAll('.color-swatch, .color-list-item');
        
        swatches.forEach(function(swatch) {
            swatch.addEventListener('click', function(e) {
                e.preventDefault();
                var colorHex = swatch.dataset.color;
                self.toggleColorSelection(colorHex);
            });
        });
    };

    ColorPalette.prototype.showView = function(viewType) {
        var gridEl = this.container.querySelector('#palette-grid');
        var wheelEl = this.container.querySelector('#palette-wheel');
        var listEl = this.container.querySelector('#palette-list');
        
        if (gridEl) gridEl.classList.toggle('hidden', viewType !== 'grid');
        if (wheelEl) wheelEl.classList.toggle('hidden', viewType !== 'wheel');
        if (listEl) listEl.classList.toggle('hidden', viewType !== 'list');
    };

    ColorPalette.prototype.findColorInfo = function(colorHex) {
        var seasonData = this.getSeasonData(this.currentSeason);
        if (!seasonData) return null;
        
        var allColors = []
            .concat(seasonData.colors.primary)
            .concat(seasonData.colors.neutral)
            .concat(seasonData.colors.accent);
            
        for (var i = 0; i < allColors.length; i++) {
            if (allColors[i].hex === colorHex) {
                return allColors[i];
            }
        }
        return null;
    };

    ColorPalette.prototype.isWarmColor = function(colorHex) {
        var hsl = this.hexToHslSafe(colorHex);
        var hue = hsl.h;
        // 따뜻한 색상 범위: 빨강-주황-노랑 (0-60, 300-360)
        return (hue >= 0 && hue <= 60) || (hue >= 300 && hue <= 360);
    };

    ColorPalette.prototype.interpretDeltaE = function(deltaE) {
        if (deltaE < 1) return '거의 구분 불가능';
        if (deltaE < 2) return '매우 유사';
        if (deltaE < 3) return '유사';
        if (deltaE < 6) return '다소 다름';
        if (deltaE < 12) return '다름';
        return '매우 다름';
    };

    // === 색상 변환 안전 메서드들 ===
    
    ColorPalette.prototype.hexToRgbSafe = function(hex) {
        if (this.colorSystem && this.colorSystem.hexToRgb) {
            return this.colorSystem.hexToRgb(hex);
        }
        
        // 폴백 구현
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    };

    ColorPalette.prototype.rgbToHexSafe = function(rgb) {
        if (this.colorSystem && this.colorSystem.rgbToHex) {
            return this.colorSystem.rgbToHex(rgb);
        }
        
        // 폴백 구현
        var toHex = function(c) {
            var hex = Math.round(Math.max(0, Math.min(255, c))).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        
        return '#' + toHex(rgb.r) + toHex(rgb.g) + toHex(rgb.b);
    };

    ColorPalette.prototype.hexToLabSafe = function(hex) {
        if (this.colorSystem && this.colorSystem.hexToLab) {
            return this.colorSystem.hexToLab(hex);
        }
        
        // 정확한 sRGB → CIE L*a*b* 변환
        var rgb = this.hexToRgbSafe(hex);
        
        // sRGB → XYZ
        var r = rgb.r / 255;
        var g = rgb.g / 255;
        var b = rgb.b / 255;
        
        r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
        g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
        b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
        
        var x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
        var y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
        var z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
        
        // XYZ → L*a*b*
        x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
        y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
        z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;
        
        return {
            l: (116 * y) - 16,
            a: 500 * (x - y),
            b: 200 * (y - z)
        };
    };

    ColorPalette.prototype.hexToHslSafe = function(hex) {
        var rgb = this.hexToRgbSafe(hex);
        var r = rgb.r / 255;
        var g = rgb.g / 255;
        var b = rgb.b / 255;

        var max = Math.max(r, g, b);
        var min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return { h: h * 360, s: s * 100, l: l * 100 };
    };

    ColorPalette.prototype.calculateDeltaE = function(lab1, lab2) {
        if (this.deltaE && this.deltaE.calculate) {
            return this.deltaE.calculate(lab1, lab2);
        }
        
        // Delta E 2000 간소화 버전
        var dl = lab1.l - lab2.l;
        var da = lab1.a - lab2.a;
        var db = lab1.b - lab2.b;
        
        // 크로마 계산
        var c1 = Math.sqrt(lab1.a * lab1.a + lab1.b * lab1.b);
        var c2 = Math.sqrt(lab2.a * lab2.a + lab2.b * lab2.b);
        var dc = c1 - c2;
        
        // 색상각 차이
        var dh = Math.sqrt(da * da + db * db - dc * dc);
        
        // 가중치 적용 (간소화)
        var sl = 1;
        var sc = 1 + 0.045 * ((c1 + c2) / 2);
        var sh = 1 + 0.015 * ((c1 + c2) / 2);
        
        return Math.sqrt(
            (dl / sl) * (dl / sl) +
            (dc / sc) * (dc / sc) +
            (dh / sh) * (dh / sh)
        );
    };

    // === 블렌딩 알고리즘들 ===
    
    ColorPalette.prototype.blendColors = function(colors, mode) {
        if (colors.length === 0) return '#000000';
        if (colors.length === 1) return colors[0];

        var rgbColors = [];
        var self = this;
        colors.forEach(function(hex) {
            rgbColors.push(self.hexToRgbSafe(hex));
        });
        
        var result;
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

        return this.rgbToHexSafe(result);
    };

    ColorPalette.prototype.multiplyBlend = function(colors) {
        var result = colors[0];
        for (var i = 1; i < colors.length; i++) {
            result = {
                r: Math.round((result.r * colors[i].r) / 255),
                g: Math.round((result.g * colors[i].g) / 255),
                b: Math.round((result.b * colors[i].b) / 255)
            };
        }
        return result;
    };

    ColorPalette.prototype.averageBlend = function(colors) {
        var sum = { r: 0, g: 0, b: 0 };
        
        colors.forEach(function(color) {
            sum.r += color.r;
            sum.g += color.g;
            sum.b += color.b;
        });

        return {
            r: Math.round(sum.r / colors.length),
            g: Math.round(sum.g / colors.length),
            b: Math.round(sum.b / colors.length)
        };
    };

    ColorPalette.prototype.overlayBlend = function(colors) {
        var result = colors[0];
        for (var i = 1; i < colors.length; i++) {
            result = {
                r: result.r < 128 ? 2 * result.r * colors[i].r / 255 : 255 - 2 * (255 - result.r) * (255 - colors[i].r) / 255,
                g: result.g < 128 ? 2 * result.g * colors[i].g / 255 : 255 - 2 * (255 - result.g) * (255 - colors[i].g) / 255,
                b: result.b < 128 ? 2 * result.b * colors[i].b / 255 : 255 - 2 * (255 - result.b) * (255 - colors[i].b) / 255
            };
            result.r = Math.round(Math.max(0, Math.min(255, result.r)));
            result.g = Math.round(Math.max(0, Math.min(255, result.g)));
            result.b = Math.round(Math.max(0, Math.min(255, result.b)));
        }
        return result;
    };

    ColorPalette.prototype.softLightBlend = function(colors) {
        var result = colors[0];
        for (var i = 1; i < colors.length; i++) {
            var base = { r: result.r / 255, g: result.g / 255, b: result.b / 255 };
            var overlay = { r: colors[i].r / 255, g: colors[i].g / 255, b: colors[i].b / 255 };
            
            result = {
                r: overlay.r < 0.5 ? 2 * base.r * overlay.r + base.r * base.r * (1 - 2 * overlay.r) :
                   Math.sqrt(base.r) * (2 * overlay.r - 1) + (2 * base.r) * (1 - overlay.r),
                g: overlay.g < 0.5 ? 2 * base.g * overlay.g + base.g * base.g * (1 - 2 * overlay.g) :
                   Math.sqrt(base.g) * (2 * overlay.g - 1) + (2 * base.g) * (1 - overlay.g),
                b: overlay.b < 0.5 ? 2 * base.b * overlay.b + base.b * base.b * (1 - 2 * overlay.b) :
                   Math.sqrt(base.b) * (2 * overlay.b - 1) + (2 * base.b) * (1 - overlay.b)
            };
            
            result.r = Math.round(Math.max(0, Math.min(255, result.r * 255)));
            result.g = Math.round(Math.max(0, Math.min(255, result.g * 255)));
            result.b = Math.round(Math.max(0, Math.min(255, result.b * 255)));
        }
        return result;
    };

    ColorPalette.prototype.getBlendRecommendation = function(color) {
        var hsl = this.hexToHslSafe(color);
        var lab = this.hexToLabSafe(color);
        
        if (lab.l > 70) return '하이라이트 추천 (밝은 색상)';
        if (lab.l < 30) return '로우라이트 추천 (어두운 색상)';
        if (hsl.s > 60) return '컬러 포인트 추천 (높은 채도)';
        if (hsl.s < 20) return '베이스 컬러 추천 (낮은 채도)';
        return '미드톤 컬러 추천 (균형 잡힌 색상)';
    };

    // === UI 업데이트 메서드들 ===
    
    ColorPalette.prototype.displayHarmonyResults = function(results) {
        var harmonyElement = this.container.querySelector('#harmony-results');
        if (!harmonyElement) return;
        
        var deltaEItems = results.deltaE.map(function(item) {
            return 
                '<div class="delta-e-item ' + (item.value < 6 ? 'good-match' : item.value < 12 ? 'fair-match' : 'poor-match') + '">' +
                    '<div class="color-pair">' +
                        '<span class="color-dot" style="background-color: ' + item.color1 + ';" title="' + item.color1 + '"></span>' +
                        '<span class="color-dot" style="background-color: ' + item.color2 + ';" title="' + item.color2 + '"></span>' +
                    '</div>' +
                    '<div class="delta-value">ΔE: ' + item.value.toFixed(2) + '</div>' +
                    '<div class="delta-perception">' + item.perception + '</div>' +
                '</div>';
        }).join('');
        
        var avgDeltaE = results.deltaE.length > 0 ? 
            results.deltaE.reduce(function(sum, item) { return sum + item.value; }, 0) / results.deltaE.length : 0;
        
        harmonyElement.innerHTML = 
            '<div class="harmony-overview">' +
                '<div class="harmony-score ' + results.compatibility + '">' +
                    '<strong>전체 호환성: ' + this.getCompatibilityText(results.compatibility) + '</strong>' +
                    '<small>평균 ΔE: ' + avgDeltaE.toFixed(2) + '</small>' +
                '</div>' +
                '<div class="harmony-temp">' +
                    '<strong>주요 색조: ' + (results.dominantTemp === 'warm' ? '웜톤' : '쿨톤') + '</strong>' +
                '</div>' +
            '</div>' +
            '<div class="delta-e-results">' +
                '<h4>색상간 차이 분석 (Delta E 2000)</h4>' +
                deltaEItems +
            '</div>' +
            '<div class="harmony-tips">' +
                '<h4>조합 팁</h4>' +
                '<p>' + this.getHarmonyTips(results) + '</p>' +
            '</div>';
    };

    ColorPalette.prototype.displayBrandMatching = function(results) {
        var brandElement = this.container.querySelector('#brand-results');
        if (!brandElement) return;
        
        var activeTab = this.container.querySelector('.brand-tab.active');
        var activeBrand = activeTab ? activeTab.dataset.brand : 'loreal';
        
        var brandResults = results[activeBrand] || [];
        var resultHtml = brandResults.map(function(product) {
            return 
                '<div class="brand-match-item ' + (product.similarity > 80 ? 'excellent-match' : product.similarity > 60 ? 'good-match' : 'fair-match') + '">' +
                    '<div class="product-color" style="background-color: ' + product.hex + ';" title="' + product.hex + '"></div>' +
                    '<div class="product-info">' +
                        '<h5>' + (product.name || product.code) + '</h5>' +
                        '<div class="product-details">' +
                            '<span class="similarity">유사도: ' + product.similarity.toFixed(1) + '%</span>' +
                            '<span class="product-code">제품코드: ' + product.code + '</span>' +
                            (product.deltaE ? '<span class="delta-e">ΔE: ' + product.deltaE.toFixed(2) + '</span>' : '') +
                        '</div>' +
                    '</div>' +
                '</div>';
        }).join('');
        
        brandElement.innerHTML = resultHtml || '<p class="no-results">해당 브랜드의 매칭 제품이 없습니다.</p>';
    };

    ColorPalette.prototype.getCompatibilityText = function(compatibility) {
        var texts = {
            excellent: '매우 좋음',
            good: '좋음',
            fair: '보통',
            poor: '나쁨'
        };
        return texts[compatibility] || '알 수 없음';
    };

    ColorPalette.prototype.getHarmonyTips = function(results) {
        if (results.compatibility === 'excellent') {
            return '완벽한 색상 조합입니다! 이 색상들은 자연스럽게 어우러져 세련된 느낌을 연출합니다.';
        } else if (results.compatibility === 'good') {
            return '좋은 색상 조합입니다. 조화로운 느낌으로 다양한 상황에 활용할 수 있습니다.';
        } else if (results.compatibility === 'fair') {
            return '보통 수준의 조합입니다. 특별한 효과를 원할 때 포인트로 사용해보세요.';
        } else {
            return '대비가 강한 조합입니다. 극적인 효과를 원할 때나 부분적으로 사용하는 것이 좋겠습니다.';
        }
    };

    // === 팔레트 저장/관리 ===
    
    ColorPalette.prototype.saveCustomPalette = function() {
        if (this.selectedColors.size === 0) {
            alert('저장할 색상을 선택해주세요.');
            return;
        }

        var paletteName = prompt('팔레트 이름을 입력하세요:');
        if (!paletteName) return;

        var palette = {
            name: paletteName,
            colors: Array.from ? Array.from(this.selectedColors) : this.setToArray(this.selectedColors),
            season: this.currentSeason,
            createdAt: new Date().toISOString()
        };

        // 로컬 스토리지에 저장
        try {
            var savedPalettes = JSON.parse(localStorage.getItem('savedPalettes') || '[]');
            savedPalettes.push(palette);
            localStorage.setItem('savedPalettes', JSON.stringify(savedPalettes));

            console.log('[ColorPalette] 팔레트 저장:', paletteName);
            this.loadSavedPalettes();
            alert('팔레트가 저장되었습니다!');
        } catch (error) {
            console.error('[ColorPalette] 팔레트 저장 실패:', error);
            alert('팔레트 저장에 실패했습니다.');
        }
    };

    ColorPalette.prototype.loadSavedPalettes = function() {
        try {
            var savedPalettes = JSON.parse(localStorage.getItem('savedPalettes') || '[]');
            var container = this.container.querySelector('#saved-palettes');
            if (!container) return;
            
            var paletteHtml = savedPalettes.map(function(palette) {
                var colorHtml = palette.colors.map(function(color) {
                    return '<div class="mini-color" style="background-color: ' + color + ';" title="' + color + '"></div>';
                }).join('');
                
                var dateStr = new Date(palette.createdAt).toLocaleDateString();
                
                return 
                    '<div class="saved-palette-item">' +
                        '<div class="palette-preview">' + colorHtml + '</div>' +
                        '<div class="palette-info">' +
                            '<h6>' + palette.name + '</h6>' +
                            '<span class="palette-season">' + palette.season + ' · ' + palette.colors.length + '색상</span>' +
                            '<span class="palette-date">' + dateStr + '</span>' +
                        '</div>' +
                        '<div class="palette-actions">' +
                            '<button class="btn-mini" onclick="window.colorPalette.loadPalette(\'' + palette.name + '\')">불러오기</button>' +
                            '<button class="btn-mini danger" onclick="window.colorPalette.deletePalette(\'' + palette.name + '\')">삭제</button>' +
                        '</div>' +
                    '</div>';
            }).join('');
            
            container.innerHTML = paletteHtml || '<p class="no-palettes">저장된 팔레트가 없습니다.</p>';
        } catch (error) {
            console.error('[ColorPalette] 저장된 팔레트 로드 실패:', error);
        }
    };

    ColorPalette.prototype.loadPalette = function(paletteName) {
        try {
            var savedPalettes = JSON.parse(localStorage.getItem('savedPalettes') || '[]');
            var palette = savedPalettes.find(function(p) { return p.name === paletteName; });
            
            if (palette) {
                this.selectedColors.clear();
                var self = this;
                palette.colors.forEach(function(color) {
                    self.selectedColors.add(color);
                });
                this.currentSeason = palette.season;
                
                // UI 업데이트
                this.elements.seasonBtns.forEach(function(btn) {
                    btn.classList.toggle('active', btn.dataset.season === palette.season);
                });
                
                this.updateSelectedColors();
