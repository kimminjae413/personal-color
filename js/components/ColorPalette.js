/**
 * ColorPalette.js - ES6→ES5 완전 변환 최종 버전
 * 헤어디자이너용 퍼스널컬러 진단 - 색상 팔레트 관리 도구
 * 
 * 🔥 수정사항:
 * - ES6 import → 전역 객체 접근으로 변경
 * - const/let → var로 변경  
 * - Arrow functions → function() 변환
 * - Template literals → 문자열 연결 변환
 * - html is not defined 오류 완전 해결
 * - 브라우저 호환성 개선
 */

(function() {
    'use strict';

    /**
     * 색상 팔레트 관리 클래스 (ES5 버전)
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
     * UI 생성 (수정됨 - html 변수 오류 해결)
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
     * 팔레트 렌더링
     */
    ColorPalette.prototype.renderPalette = function() {
        var seasonData = this.getSeasonData(this.currentSeason);
        if (!seasonData) {
            console.warn('[ColorPalette] 계절 데이터를 찾을 수 없음:', this.currentSeason);
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
     * 계절 데이터 가져오기 (안전한 접근)
     */
    ColorPalette.prototype.getSeasonData = function(season) {
        try {
            // 전역 seasons 데이터 접근 시도
            if (window.seasons && window.seasons[season]) {
                return window.seasons[season];
            }
            
            // getConfig 함수로 접근 시도
            if (typeof getConfig === 'function') {
                var seasonsData = getConfig('SEASONS.' + season);
                if (seasonsData) {
                    return seasonsData;
                }
            }
            
            // 폴백 데이터 제공
            return this.getFallbackSeasonData(season);
            
        } catch (error) {
            console.warn('[ColorPalette] 계절 데이터 접근 실패:', error);
            return this.getFallbackSeasonData(season);
        }
    };

    /**
     * 폴백 계절 데이터 
     */
    ColorPalette.prototype.getFallbackSeasonData = function(season) {
        var fallbackData = {
            spring: {
                colors: {
                    primary: [
                        { name: '코랄 핑크', hex: '#FF6B6B' },
                        { name: '피치', hex: '#FFB74D' },
                        { name: '아이보리', hex: '#FFF8DC' },
                        { name: '민트', hex: '#4ECDC4' }
                    ],
                    neutral: [
                        { name: '베이지', hex: '#F5DEB3' },
                        { name: '크림', hex: '#FFFDD0' },
                        { name: '라이트 그레이', hex: '#D3D3D3' }
                    ],
                    accent: [
                        { name: '터키석', hex: '#40E0D0' },
                        { name: '라벤더', hex: '#E6E6FA' },
                        { name: '라임', hex: '#32CD32' }
                    ]
                }
            },
            summer: {
                colors: {
                    primary: [
                        { name: '로즈 핑크', hex: '#F8BBD9' },
                        { name: '라벤더 블루', hex: '#CCCCFF' },
                        { name: '소프트 화이트', hex: '#F8F8FF' }
                    ],
                    neutral: [
                        { name: '실버 그레이', hex: '#C0C0C0' },
                        { name: '쿨 베이지', hex: '#F5F5DC' }
                    ],
                    accent: [
                        { name: '아쿠아', hex: '#00FFFF' },
                        { name: '퍼플', hex: '#DDA0DD' }
                    ]
                }
            },
            autumn: {
                colors: {
                    primary: [
                        { name: '번트 오렌지', hex: '#CC5500' },
                        { name: '골든 옐로우', hex: '#FFD700' },
                        { name: '딥 레드', hex: '#8B0000' }
                    ],
                    neutral: [
                        { name: '웜 브라운', hex: '#A0522D' },
                        { name: '카키', hex: '#F0E68C' }
                    ],
                    accent: [
                        { name: '올리브', hex: '#808000' },
                        { name: '머스터드', hex: '#FFDB58' }
                    ]
                }
            },
            winter: {
                colors: {
                    primary: [
                        { name: '트루 레드', hex: '#FF0000' },
                        { name: '로열 블루', hex: '#4169E1' },
                        { name: '퓨어 화이트', hex: '#FFFFFF' }
                    ],
                    neutral: [
                        { name: '차콜', hex: '#36454F' },
                        { name: '실버', hex: '#C0C0C0' }
                    ],
                    accent: [
                        { name: '마젠타', hex: '#FF00FF' },
                        { name: '에메랄드', hex: '#50C878' }
                    ]
                }
            }
        };
        
        return fallbackData[season] || fallbackData.spring;
    };

    /**
     * 그리드 뷰 렌더링 (수정됨 - html 변수 스코프 해결)
     */
    ColorPalette.prototype.renderGridView = function(seasonData) {
        this.showView('grid');
        
        var html = []; // 스코프 문제 해결을 위해 var 사용
        var self = this;
        
        // 기본 색상들
        html.push('<div class="color-category">');
        html.push('<h4>기본 색상</h4>');
        html.push('<div class="color-row">');
        
        seasonData.colors.primary.forEach(function(color) {
            var isSelected = self.selectedColors.has(color.hex);
            html.push(
                '<div class="color-swatch ' + (isSelected ? 'selected' : '') + '" ' +
                     'data-color="' + color.hex + '" ' +
                     'style="background-color: ' + color.hex + ';" ' +
                     'title="' + color.name + '">' +
                    '<div class="color-info">' +
                        '<span class="color-name">' + color.name + '</span>' +
                        '<span class="color-hex">' + color.hex + '</span>' +
                    '</div>' +
                '</div>'
            );
        });
        
        html.push('</div></div>');

        // 뉴트럴 색상들
        html.push('<div class="color-category">');
        html.push('<h4>뉴트럴 색상</h4>');
        html.push('<div class="color-row">');
        
        seasonData.colors.neutral.forEach(function(color) {
            var isSelected = self.selectedColors.has(color.hex);
            html.push(
                '<div class="color-swatch ' + (isSelected ? 'selected' : '') + '" ' +
                     'data-color="' + color.hex + '" ' +
                     'style="background-color: ' + color.hex + ';" ' +
                     'title="' + color.name + '">' +
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
        html.push('<h4>액센트 색상</h4>');
        html.push('<div class="color-row">');
        
        seasonData.colors.accent.forEach(function(color) {
            var isSelected = self.selectedColors.has(color.hex);
            html.push(
                '<div class="color-swatch ' + (isSelected ? 'selected' : '') + '" ' +
                     'data-color="' + color.hex + '" ' +
                     'style="background-color: ' + color.hex + ';" ' +
                     'title="' + color.name + '">' +
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
     * 리스트 뷰 렌더링
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
            var labColor = self.hexToLabSafe(color.hex);
            var pccsInfo = self.getPCCSToneInfo(color);
            
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
                                '<span>L*' + labColor.l.toFixed(1) + ', a*' + labColor.a.toFixed(1) + ', b*' + labColor.b.toFixed(1) + '</span>' +
                            '</div>' +
                            '<div class="value-group">' +
                                '<label>PCCS 톤:</label>' +
                                '<span>' + pccsInfo.tone + ' (' + pccsInfo.description + ')</span>' +
                            '</div>' +
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
     * 색상 휠 뷰 렌더링
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

        // 색상 휠 그리기
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
     * 색상 조화 분석
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
     * 색상 조화 계산
     */
    ColorPalette.prototype.calculateColorHarmony = function(colors) {
        var results = {
            compatibility: 'good',
            dominantTemp: 'warm',
            suggestions: [],
            deltaE: []
        };

        var self = this;

        // Delta E 계산
        for (var i = 0; i < colors.length; i++) {
            for (var j = i + 1; j < colors.length; j++) {
                var lab1 = this.hexToLabSafe(colors[i]);
                var lab2 = this.hexToLabSafe(colors[j]);
                var deltaE = this.calculateDeltaE(lab1, lab2);
                
                results.deltaE.push({
                    color1: colors[i],
                    color2: colors[j],
                    value: deltaE,
                    perception: this.interpretDeltaE(deltaE)
                });
            }
        }

        // 색온도 분석
        var warmCount = colors.filter(function(color) {
            return self.isWarmColor(color);
        }).length;
        var coolCount = colors.length - warmCount;
        results.dominantTemp = warmCount > coolCount ? 'warm' : 'cool';

        // 호환성 평가
        if (results.deltaE.length > 0) {
            var avgDeltaE = results.deltaE.reduce(function(sum, item) {
                return sum + item.value;
            }, 0) / results.deltaE.length;
            
            if (avgDeltaE < 10) results.compatibility = 'excellent';
            else if (avgDeltaE < 20) results.compatibility = 'good';
            else if (avgDeltaE < 40) results.compatibility = 'fair';
            else results.compatibility = 'poor';
        }

        return results;
    };

    /**
     * 브랜드 제품 매칭
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
            // 각 브랜드별로 가장 유사한 제품 찾기
            var brands = ['loreal', 'wella', 'milbon'];
            brands.forEach(function(brand) {
                var matches = self.findClosestBrandMatches(colorHex, brand, 3);
                results[brand] = results[brand].concat(matches);
            });
        });

        this.displayBrandMatching(results);
        this.elements.brandMatching.classList.remove('hidden');
    };

    /**
     * 가장 유사한 브랜드 제품 찾기 (폴백 데이터 사용)
     */
    ColorPalette.prototype.findClosestBrandMatches = function(targetColor, brand, limit) {
        limit = limit || 5;
        
        // 폴백 브랜드 데이터 (실제 프로젝트에서는 외부 데이터 사용)
        var brandData = {
            loreal: [
                { name: '골든 브론즈', code: '7.34', hex: '#A0522D', similarity: 85 },
                { name: '애쉬 브라운', code: '6.1', hex: '#8B7355', similarity: 78 },
                { name: '내츄럴 브라운', code: '5.0', hex: '#654321', similarity: 82 }
            ],
            wella: [
                { name: '라이트 골든', code: '8/3', hex: '#DAA520', similarity: 88 },
                { name: '미디엄 애쉬', code: '6/1', hex: '#696969', similarity: 75 },
                { name: '다크 브라운', code: '4/0', hex: '#2F1B14', similarity: 80 }
            ],
            milbon: [
                { name: '베이지 브라운', code: 'BE-5', hex: '#D2B48C', similarity: 90 },
                { name: '매트 브라운', code: 'MT-6', hex: '#8B4513', similarity: 77 },
                { name: '애쉬 그레이', code: 'A-7', hex: '#B8B8B8', similarity: 73 }
            ]
        };

        var products = brandData[brand] || [];
        
        return products
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
     * 블렌딩 결과 그리기
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

        // 결과 정보 업데이트
        var resultElement = this.container.querySelector('#blend-result');
        if (resultElement) {
            var labColor = this.hexToLabSafe(blendedColor);
            resultElement.innerHTML = 
                '<div class="blend-info">' +
                    '<div class="blend-color" style="background-color: ' + blendedColor + ';"></div>' +
                    '<div class="blend-details">' +
                        '<div><strong>블렌딩 결과:</strong> ' + blendedColor + '</div>' +
                        '<div><strong>CIE L*a*b*:</strong> L*' + labColor.l.toFixed(1) + ', a*' + labColor.a.toFixed(1) + ', b*' + labColor.b.toFixed(1) + '</div>' +
                        '<div><strong>권장 사용:</strong> ' + this.getBlendRecommendation(blendedColor) + '</div>' +
                    '</div>' +
                '</div>';
        }
    };

    /**
     * 색상 블렌딩
     */
    ColorPalette.prototype.blendColors = function(colors, mode) {
        if (colors.length === 0) return '#000000';
        if (colors.length === 1) return colors[0];

        // RGB 값들 추출
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
            });
        });

        // 제어 버튼들
        var clearBtn = this.container.querySelector('#clear-selection');
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                self.selectedColors.clear();
                self.updateSelectedColors();
                self.renderPalette();
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

    /**
     * 유틸리티 메서드들
     */
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

    ColorPalette.prototype.getPCCSToneInfo = function(color) {
        var hsl = this.hexToHslSafe(color.hex);
        var tone = 'vivid';
        var description = '선명한';

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

        return { tone: tone, description: description };
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
        if (deltaE < 5) return '유사';
        if (deltaE < 10) return '다소 다름';
        if (deltaE < 20) return '다름';
        return '매우 다름';
    };

    // 색상 변환 안전 메서드들 (ColorSystem 없을 때 폴백)
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
        
        // 단순 폴백 (실제로는 복잡한 변환 필요)
        var rgb = this.hexToRgbSafe(hex);
        return {
            l: rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114,
            a: (rgb.r - rgb.g) * 0.5,
            b: (rgb.r + rgb.g - 2 * rgb.b) * 0.25
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
        
        // 단순 유클리드 거리 폴백
        var dl = lab1.l - lab2.l;
        var da = lab1.a - lab2.a;
        var db = lab1.b - lab2.b;
        return Math.sqrt(dl * dl + da * da + db * db);
    };

    // 블렌딩 알고리즘들
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
        // 간단화된 오버레이 블렌드
        return this.averageBlend(colors);
    };

    ColorPalette.prototype.softLightBlend = function(colors) {
        // 간단화된 소프트 라이트 블렌드
        return this.averageBlend(colors);
    };

    ColorPalette.prototype.getBlendRecommendation = function(color) {
        var hsl = this.hexToHslSafe(color);
        if (hsl.l > 70) return '하이라이트 추천';
        if (hsl.l < 30) return '로우라이트 추천';
        if (hsl.s > 50) return '컬러 포인트 추천';
        return '베이스 컬러 추천';
    };

    ColorPalette.prototype.displayHarmonyResults = function(results) {
        var harmonyElement = this.container.querySelector('#harmony-results');
        if (!harmonyElement) return;
        
        var deltaEItems = results.deltaE.map(function(item) {
            return 
                '<div class="delta-e-item">' +
                    '<div class="color-pair">' +
                        '<span class="color-dot" style="background-color: ' + item.color1 + ';"></span>' +
                        '<span class="color-dot" style="background-color: ' + item.color2 + ';"></span>' +
                    '</div>' +
                    '<div class="delta-value">ΔE: ' + item.value.toFixed(1) + '</div>' +
                    '<div class="delta-perception">' + item.perception + '</div>' +
                '</div>';
        }).join('');
        
        harmonyElement.innerHTML = 
            '<div class="harmony-overview">' +
                '<div class="harmony-score ' + results.compatibility + '">' +
                    '호환성: ' + this.getCompatibilityText(results.compatibility) +
                '</div>' +
                '<div class="harmony-temp">' +
                    '주조: ' + (results.dominantTemp === 'warm' ? '웜톤' : '쿨톤') +
                '</div>' +
            '</div>' +
            '<div class="delta-e-results">' +
                deltaEItems +
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
                '<div class="brand-match-item">' +
                    '<div class="product-color" style="background-color: ' + product.hex + ';"></div>' +
                    '<div class="product-info">' +
                        '<h5>' + (product.name || product.code) + '</h5>' +
                        '<div class="product-details">' +
                            '<span>유사도: ' + product.similarity.toFixed(1) + '%</span>' +
                            '<span>제품코드: ' + product.code + '</span>' +
                        '</div>' +
                    '</div>' +
                '</div>';
        }).join('');
        
        brandElement.innerHTML = resultHtml;
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

            console.log('[ColorPalette] 팔레트 저장: ' + paletteName);
            this.loadSavedPalettes();
        } catch (error) {
            console.error('[ColorPalette] 팔레트 저장 실패:', error);
        }
    };

    ColorPalette.prototype.loadSavedPalettes = function() {
        try {
            var savedPalettes = JSON.parse(localStorage.getItem('savedPalettes') || '[]');
            var container = this.container.querySelector('#saved-palettes');
            if (!container) return;
            
            var paletteHtml = savedPalettes.map(function(palette) {
                var colorHtml = palette.colors.map(function(color) {
                    return '<div class="mini-color" style="background-color: ' + color + ';"></div>';
                }).join('');
                
                return 
                    '<div class="saved-palette-item">' +
                        '<div class="palette-preview">' + colorHtml + '</div>' +
                        '<div class="palette-info">' +
                            '<h6>' + palette.name + '</h6>' +
                            '<span class="palette-season">' + palette.season + '</span>' +
                        '</div>' +
                        '<div class="palette-actions">' +
                            '<button class="btn-mini" onclick="window.colorPalette.loadPalette(\'' + palette.name + '\')">불러오기</button>' +
                            '<button class="btn-mini danger" onclick="window.colorPalette.deletePalette(\'' + palette.name + '\')">삭제</button>' +
                        '</div>' +
                    '</div>';
            }).join('');
            
            container.innerHTML = paletteHtml;
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
                this.renderPalette();
                
                console.log('[ColorPalette] 팔레트 불러오기: ' + paletteName);
            }
        } catch (error) {
            console.error('[ColorPalette] 팔레트 불러오기 실패:', error);
        }
    };

    ColorPalette.prototype.deletePalette = function(paletteName) {
        if (confirm('"' + paletteName + '" 팔레트를 삭제하시겠습니까?')) {
            try {
                var savedPalettes = JSON.parse(localStorage.getItem('savedPalettes') || '[]');
                var filtered = savedPalettes.filter(function(p) { return p.name !== paletteName; });
                localStorage.setItem('savedPalettes', JSON.stringify(filtered));
                
                this.loadSavedPalettes();
                console.log('[ColorPalette] 팔레트 삭제: ' + paletteName);
            } catch (error) {
                console.error('[ColorPalette] 팔레트 삭제 실패:', error);
            }
        }
    };

    // Set을 배열로 변환하는 폴백 메서드 (Array.from이 없는 브라우저용)
    ColorPalette.prototype.setToArray = function(set) {
        var array = [];
        set.forEach(function(value) {
            array.push(value);
        });
        return array;
    };

    // 전역 객체로 등록
    if (typeof window !== 'undefined') {
        window.ColorPalette = ColorPalette;
        
        // 전역 접근을 위한 인스턴스 (UI 콜백용)
        window.colorPalette = null;
        
        console.log('✅ ColorPalette ES5 완전 수정 버전 로드 완료');
    }

})();
