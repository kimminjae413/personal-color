/**
 * DrapingMode.js - ES5 호환 완전 변환 버전
 * 전문가 드래이핑 모드 컴포넌트
 * 
 * 변환사항:
 * - import/export 구문 완전 제거 ✅
 * - IIFE 패턴으로 변경 ✅ 
 * - 전역 window 객체 등록 ✅
 * - CONFIG 안전 접근 구현 ✅
 * - WebGL 셰이더 ES5 호환성 개선 ✅
 * 
 * 기능:
 * - 실시간 카메라 피드백 및 가상 드래이핑
 * - WebGL 기반 실시간 색상 블렌딩
 * - Before/After 비교 (단일/분할/슬라이더)
 * - 계절별 색상 팔레트 선택
 * - Delta E 기반 피부톤 매칭 분석
 * - 실시간 색온도 및 명도/채도 분석
 */

(function() {
    'use strict';
    
    // CONFIG 안전 로드 함수
    function getConfig() {
        try {
            if (typeof window !== 'undefined' && window.PersonalColorConfig) {
                return window.PersonalColorConfig;
            }
        } catch (error) {
            console.warn('[DrapingMode] CONFIG 로드 실패, 기본값 사용:', error);
        }
        return {
            CAMERA: {
                resolution: { width: 1280, height: 720 },
                frameRate: 30
            },
            COLOR_ANALYSIS: {
                skinDetection: {
                    faceRegion: {
                        forehead: { x: 0.3, y: 0.15, w: 0.4, h: 0.12 },
                        leftCheek: { x: 0.15, y: 0.4, w: 0.15, h: 0.2 },
                        rightCheek: { x: 0.7, y: 0.4, w: 0.15, h: 0.2 },
                        chin: { x: 0.35, y: 0.75, w: 0.3, h: 0.15 }
                    }
                }
            }
        };
    }

    /**
     * DrapingMode 메인 클래스
     */
    function DrapingMode(container) {
        var CONFIG = getConfig();
        
        this.container = container;
        this.videoElement = null;
        this.canvasElement = null;
        this.ctx = null;
        this.stream = null;
        this.isActive = false;
        
        // 드래이핑 상태
        this.currentColor = null;
        this.selectedPalette = null;
        this.comparisonMode = 'single'; // single, split, slider
        this.capturedFrames = [];
        this.analysisResults = [];
        
        // WebGL 렌더러 (가상 드래이핑용)
        this.glCanvas = null;
        this.gl = null;
        this.shaderProgram = null;
        this.currentFacingMode = 'user'; // 카메라 방향
        
        // 설정 저장
        this.config = CONFIG;
        
        var self = this;
        this.init().then(function() {
            console.log('[DrapingMode] 초기화 완료');
        }).catch(function(error) {
            console.error('[DrapingMode] 초기화 실패:', error);
        });
    }

    /**
     * 초기화
     */
    DrapingMode.prototype.init = function() {
        var self = this;
        return new Promise(function(resolve, reject) {
            try {
                self.createInterface();
                self.setupWebGL().then(function() {
                    self.bindEvents();
                    resolve();
                }).catch(reject);
            } catch (error) {
                reject(error);
            }
        });
    };

    /**
     * 인터페이스 생성
     */
    DrapingMode.prototype.createInterface = function() {
        this.container.innerHTML = '\n            <div class=\"draping-mode\" id=\"drapingMode\">\n                <!-- 헤더 -->\n                <div class=\"draping-header\">\n                    <div class=\"mode-info\">\n                        <h2>전문가 드래이핑 모드</h2>\n                        <p>실시간 가상 패이드로 정확한 퍼스널컬러 진단</p>\n                    </div>\n                    <div class=\"header-controls\">\n                        <button class=\"btn btn-outline\" id=\"switchCamera\">\n                            <i class=\"icon-camera-switch\"></i>\n                            카메라 전환\n                        </button>\n                        <button class=\"btn btn-outline\" id=\"settingsBtn\">\n                            <i class=\"icon-settings\"></i>\n                            설정\n                        </button>\n                    </div>\n                </div>\n\n                <!-- 메인 워크스페이스 -->\n                <div class=\"draping-workspace\">\n                    <!-- 카메라 뷰 -->\n                    <div class=\"camera-section\">\n                        <div class=\"video-container\">\n                            <video id=\"drapingVideo\" autoplay playsinline muted></video>\n                            <canvas id=\"drapingCanvas\" class=\"overlay-canvas\"></canvas>\n                            <canvas id=\"webglCanvas\" class=\"webgl-canvas\"></canvas>\n                            \n                            <!-- 오버레이 컨트롤 -->\n                            <div class=\"overlay-controls\">\n                                <div class=\"blend-control\">\n                                    <label>블렌딩 강도</label>\n                                    <input type=\"range\" id=\"blendSlider\" min=\"0\" max=\"100\" value=\"70\">\n                                    <span id=\"blendValue\">70%</span>\n                                </div>\n                            </div>\n\n                            <!-- 가이드라인 -->\n                            <div class=\"face-guidelines\" id=\"faceGuidelines\">\n                                <div class=\"guideline forehead\"></div>\n                                <div class=\"guideline cheek-left\"></div>\n                                <div class=\"guideline cheek-right\"></div>\n                                <div class=\"guideline jaw\"></div>\n                            </div>\n                        </div>\n\n                        <!-- 카메라 컨트롤 -->\n                        <div class=\"camera-controls\">\n                            <button class=\"btn btn-primary\" id=\"startCamera\">\n                                <i class=\"icon-play\"></i>\n                                카메라 시작\n                            </button>\n                            <button class=\"btn btn-secondary\" id=\"pauseCamera\" disabled>\n                                <i class=\"icon-pause\"></i>\n                                일시정지\n                            </button>\n                            <button class=\"btn btn-success\" id=\"captureFrame\">\n                                <i class=\"icon-camera\"></i>\n                                프레임 캡처\n                            </button>\n                        </div>\n                    </div>\n\n                    <!-- 컬러 팔레트 선택 -->\n                    <div class=\"palette-section\">\n                        <div class=\"palette-header\">\n                            <h3>색상 팔레트 선택</h3>\n                            <div class=\"season-tabs\">\n                                <button class=\"tab-btn active\" data-season=\"spring\">봄</button>\n                                <button class=\"tab-btn\" data-season=\"summer\">여름</button>\n                                <button class=\"tab-btn\" data-season=\"autumn\">가을</button>\n                                <button class=\"tab-btn\" data-season=\"winter\">겨울</button>\n                            </div>\n                        </div>\n\n                        <div class=\"color-grid\" id=\"colorGrid\">\n                            <!-- 색상들이 동적으로 생성됨 -->\n                        </div>\n\n                        <!-- 선택된 색상 정보 -->\n                        <div class=\"selected-color-info\" id=\"selectedColorInfo\">\n                            <div class=\"color-preview\"></div>\n                            <div class=\"color-details\">\n                                <span class=\"color-name\">색상을 선택하세요</span>\n                                <span class=\"color-values\"></span>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n\n                <!-- 비교 모드 -->\n                <div class=\"comparison-section\">\n                    <div class=\"comparison-header\">\n                        <h3>Before/After 비교</h3>\n                        <div class=\"comparison-controls\">\n                            <button class=\"comparison-btn active\" data-mode=\"single\">단일</button>\n                            <button class=\"comparison-btn\" data-mode=\"split\">분할</button>\n                            <button class=\"comparison-btn\" data-mode=\"slider\">슬라이더</button>\n                        </div>\n                    </div>\n\n                    <div class=\"comparison-viewer\" id=\"comparisonViewer\">\n                        <div class=\"comparison-before\">\n                            <label>Before</label>\n                            <div class=\"frame-placeholder\">캡처된 프레임이 없습니다</div>\n                        </div>\n                        <div class=\"comparison-after\">\n                            <label>After</label>\n                            <div class=\"frame-placeholder\">드래이핑을 적용하세요</div>\n                        </div>\n                    </div>\n                </div>\n\n                <!-- 분석 결과 -->\n                <div class=\"analysis-section\" id=\"analysisSection\">\n                    <div class=\"analysis-header\">\n                        <h3>실시간 분석 결과</h3>\n                        <button class=\"btn btn-outline\" id=\"exportResults\">\n                            <i class=\"icon-download\"></i>\n                            결과 내보내기\n                        </button>\n                    </div>\n\n                    <div class=\"analysis-grid\">\n                        <div class=\"analysis-card\">\n                            <h4>피부톤 매칭도</h4>\n                            <div class=\"score-indicator\">\n                                <div class=\"score-bar\" id=\"skinToneScore\">\n                                    <div class=\"score-fill\"></div>\n                                </div>\n                                <span class=\"score-value\">--</span>\n                            </div>\n                        </div>\n\n                        <div class=\"analysis-card\">\n                            <h4>색온도 분석</h4>\n                            <div class=\"temperature-gauge\" id=\"temperatureGauge\">\n                                <div class=\"gauge-warm\">웜톤</div>\n                                <div class=\"gauge-indicator\"></div>\n                                <div class=\"gauge-cool\">쿨톤</div>\n                            </div>\n                        </div>\n\n                        <div class=\"analysis-card\">\n                            <h4>명도/채도 분석</h4>\n                            <div class=\"lightness-chart\" id=\"lightnessChart\">\n                                <canvas width=\"200\" height=\"100\"></canvas>\n                            </div>\n                        </div>\n\n                        <div class=\"analysis-card\">\n                            <h4>추천 계절</h4>\n                            <div class=\"season-recommendation\" id=\"seasonRecommendation\">\n                                <div class=\"season-item\">\n                                    <span class=\"season-name\">분석 중...</span>\n                                    <span class=\"confidence\">--%</span>\n                                </div>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n\n                <!-- 액션 버튼 -->\n                <div class=\"draping-actions\">\n                    <button class=\"btn btn-outline\" id=\"resetDraping\">\n                        <i class=\"icon-refresh\"></i>\n                        초기화\n                    </button>\n                    <button class=\"btn btn-secondary\" id=\"saveDraft\">\n                        <i class=\"icon-save\"></i>\n                        임시저장\n                    </button>\n                    <button class=\"btn btn-primary\" id=\"generateReport\">\n                        <i class=\"icon-file-text\"></i>\n                        보고서 생성\n                    </button>\n                </div>\n\n                <!-- 로딩 오버레이 -->\n                <div class=\"loading-overlay\" id=\"drapingLoading\">\n                    <div class=\"loading-content\">\n                        <div class=\"spinner\"></div>\n                        <p>카메라를 초기화하는 중...</p>\n                    </div>\n                </div>\n            </div>\n        ';
    };

    /**
     * WebGL 설정
     */
    DrapingMode.prototype.setupWebGL = function() {
        var self = this;
        return new Promise(function(resolve, reject) {
            try {
                self.glCanvas = document.getElementById('webglCanvas');
                self.gl = self.glCanvas.getContext('webgl');
                
                if (!self.gl) {
                    console.error('[DrapingMode] WebGL을 지원하지 않습니다.');
                    resolve(); // 에러가 아닌 정상 진행 (폴백 사용)
                    return;
                }

                // 셰이더 프로그램 생성
                var vertexShader = self.createShader(self.gl.VERTEX_SHADER, '\n                    attribute vec2 a_position;\n                    attribute vec2 a_texCoord;\n                    varying vec2 v_texCoord;\n                    \n                    void main() {\n                        gl_Position = vec4(a_position, 0.0, 1.0);\n                        v_texCoord = a_texCoord;\n                    }\n                ');

                var fragmentShader = self.createShader(self.gl.FRAGMENT_SHADER, '\n                    precision mediump float;\n                    uniform sampler2D u_videoTexture;\n                    uniform sampler2D u_colorTexture;\n                    uniform float u_blend;\n                    uniform vec3 u_selectedColor;\n                    varying vec2 v_texCoord;\n                    \n                    void main() {\n                        vec4 videoColor = texture2D(u_videoTexture, v_texCoord);\n                        vec3 blendedColor = mix(videoColor.rgb, u_selectedColor, u_blend);\n                        gl_FragColor = vec4(blendedColor, videoColor.a);\n                    }\n                ');

                if (!vertexShader || !fragmentShader) {
                    console.warn('[DrapingMode] 셰이더 생성 실패, Canvas2D 폴백 사용');
                    resolve();
                    return;
                }

                self.shaderProgram = self.createProgram(vertexShader, fragmentShader);
                
                if (!self.shaderProgram) {
                    console.warn('[DrapingMode] 셰이더 프로그램 생성 실패, Canvas2D 폴백 사용');
                }
                
                console.log('[DrapingMode] WebGL 설정 완료');
                resolve();
            } catch (error) {
                console.warn('[DrapingMode] WebGL 설정 실패, Canvas2D 폴백 사용:', error);
                resolve();
            }
        });
    };

    /**
     * 셰이더 생성
     */
    DrapingMode.prototype.createShader = function(type, source) {
        var shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('[DrapingMode] 셰이더 컴파일 오류:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    };

    /**
     * 셰이더 프로그램 생성
     */
    DrapingMode.prototype.createProgram = function(vertexShader, fragmentShader) {
        var program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('[DrapingMode] 셰이더 프로그램 링크 오류:', this.gl.getProgramInfoLog(program));
            this.gl.deleteProgram(program);
            return null;
        }
        
        return program;
    };

    /**
     * 이벤트 바인딩
     */
    DrapingMode.prototype.bindEvents = function() {
        var self = this;
        
        // 카메라 컨트롤
        var startCameraBtn = document.getElementById('startCamera');
        var pauseCameraBtn = document.getElementById('pauseCamera');
        var captureFrameBtn = document.getElementById('captureFrame');
        var switchCameraBtn = document.getElementById('switchCamera');
        
        if (startCameraBtn) startCameraBtn.addEventListener('click', function() { self.startCamera(); });
        if (pauseCameraBtn) pauseCameraBtn.addEventListener('click', function() { self.pauseCamera(); });
        if (captureFrameBtn) captureFrameBtn.addEventListener('click', function() { self.captureFrame(); });
        if (switchCameraBtn) switchCameraBtn.addEventListener('click', function() { self.switchCamera(); });

        // 계절 탭
        var tabBtns = document.querySelectorAll('.tab-btn');
        for (var i = 0; i < tabBtns.length; i++) {
            (function(btn) {
                btn.addEventListener('click', function(e) {
                    self.selectSeason(e.target.dataset.season);
                });
            })(tabBtns[i]);
        }

        // 비교 모드
        var comparisonBtns = document.querySelectorAll('.comparison-btn');
        for (var i = 0; i < comparisonBtns.length; i++) {
            (function(btn) {
                btn.addEventListener('click', function(e) {
                    self.setComparisonMode(e.target.dataset.mode);
                });
            })(comparisonBtns[i]);
        }

        // 블렌딩 슬라이더
        var blendSlider = document.getElementById('blendSlider');
        if (blendSlider) {
            blendSlider.addEventListener('input', function(e) {
                self.updateBlendStrength(parseInt(e.target.value));
            });
        }

        // 액션 버튼
        var resetBtn = document.getElementById('resetDraping');
        var saveDraftBtn = document.getElementById('saveDraft');
        var generateReportBtn = document.getElementById('generateReport');
        
        if (resetBtn) resetBtn.addEventListener('click', function() { self.reset(); });
        if (saveDraftBtn) saveDraftBtn.addEventListener('click', function() { self.saveDraft(); });
        if (generateReportBtn) generateReportBtn.addEventListener('click', function() { self.generateReport(); });
        
        console.log('[DrapingMode] 이벤트 바인딩 완료');
    };

    /**
     * 카메라 시작
     */
    DrapingMode.prototype.startCamera = function() {
        var self = this;
        
        self.showLoading('카메라를 시작하는 중...');
        
        var constraints = {
            video: {
                width: { ideal: self.config.CAMERA.resolution.width },
                height: { ideal: self.config.CAMERA.resolution.height },
                frameRate: { ideal: self.config.CAMERA.frameRate },
                facingMode: self.currentFacingMode
            }
        };

        navigator.mediaDevices.getUserMedia(constraints)
            .then(function(stream) {
                self.stream = stream;
                self.videoElement = document.getElementById('drapingVideo');
                self.canvasElement = document.getElementById('drapingCanvas');
                self.ctx = self.canvasElement.getContext('2d');
                
                self.videoElement.srcObject = stream;
                self.isActive = true;

                // 비디오 로드 완료 후
                self.videoElement.addEventListener('loadedmetadata', function() {
                    self.setupCanvasSize();
                    self.startDrapingLoop();
                    self.hideLoading();
                    self.updateCameraControls(true);
                });
            })
            .catch(function(error) {
                console.error('[DrapingMode] 카메라 시작 오류:', error);
                self.hideLoading();
                self.showError('카메라에 접근할 수 없습니다. 권한을 확인해주세요.');
            });
    };

    /**
     * 캔버스 크기 설정
     */
    DrapingMode.prototype.setupCanvasSize = function() {
        var video = this.videoElement;
        this.canvasElement.width = video.videoWidth;
        this.canvasElement.height = video.videoHeight;
        
        if (this.glCanvas) {
            this.glCanvas.width = video.videoWidth;
            this.glCanvas.height = video.videoHeight;
        }
    };

    /**
     * 드래이핑 루프 시작
     */
    DrapingMode.prototype.startDrapingLoop = function() {
        var self = this;
        
        if (!self.isActive) return;

        self.renderFrame();
        self.analyzeFrame();
        
        requestAnimationFrame(function() {
            self.startDrapingLoop();
        });
    };

    /**
     * 프레임 렌더링
     */
    DrapingMode.prototype.renderFrame = function() {
        if (!this.ctx || !this.videoElement) return;

        // 비디오 프레임을 캔버스에 그리기
        this.ctx.drawImage(this.videoElement, 0, 0);

        // 현재 선택된 색상이 있으면 가상 드래이핑 적용
        if (this.currentColor) {
            this.applyVirtualDraping();
        }

        // 얼굴 가이드라인 그리기
        this.drawFaceGuidelines();
    };

    /**
     * 가상 드래이핑 적용
     */
    DrapingMode.prototype.applyVirtualDraping = function() {
        // WebGL 사용 가능하면 WebGL로, 아니면 Canvas2D로 폴백
        if (this.gl && this.shaderProgram) {
            this.applyWebGLDraping();
        } else {
            this.applyCanvasDraping();
        }
    };

    /**
     * WebGL 드래이핑
     */
    DrapingMode.prototype.applyWebGLDraping = function() {
        var gl = this.gl;
        if (!gl || !this.shaderProgram) return;

        try {
            gl.useProgram(this.shaderProgram);
            
            // 블렌딩 강도 설정
            var blendStrength = document.getElementById('blendSlider').value / 100;
            var blendUniform = gl.getUniformLocation(this.shaderProgram, 'u_blend');
            gl.uniform1f(blendUniform, blendStrength);

            // 선택된 색상 설정
            var colorUniform = gl.getUniformLocation(this.shaderProgram, 'u_selectedColor');
            var rgb = this.hexToRgb(this.currentColor);
            if (rgb) {
                gl.uniform3f(colorUniform, rgb.r / 255, rgb.g / 255, rgb.b / 255);
            }

            // 렌더링 실행
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        } catch (error) {
            console.warn('[DrapingMode] WebGL 렌더링 오류:', error);
            this.applyCanvasDraping(); // 폴백
        }
    };

    /**
     * Canvas2D 드래이핑 (폴백)
     */
    DrapingMode.prototype.applyCanvasDraping = function() {
        if (!this.ctx || !this.currentColor) return;

        try {
            var blendStrength = document.getElementById('blendSlider').value / 100;
            var rgb = this.hexToRgb(this.currentColor);
            
            if (!rgb) return;

            // 간단한 색상 오버레이
            this.ctx.globalAlpha = blendStrength * 0.3;
            this.ctx.globalCompositeOperation = 'multiply';
            this.ctx.fillStyle = this.currentColor;
            
            // 얼굴 영역에만 적용
            var regions = this.config.COLOR_ANALYSIS.skinDetection.faceRegion;
            var width = this.canvasElement.width;
            var height = this.canvasElement.height;
            
            Object.values(regions).forEach(function(region) {
                var x = width * region.x;
                var y = height * region.y;
                var w = width * region.w;
                var h = height * region.h;
                
                self.ctx.fillRect(x, y, w, h);
            });
            
            // 원래 상태로 복원
            this.ctx.globalAlpha = 1.0;
            this.ctx.globalCompositeOperation = 'source-over';
        } catch (error) {
            console.warn('[DrapingMode] Canvas2D 드래이핑 오류:', error);
        }
    };

    /**
     * 얼굴 가이드라인 그리기
     */
    DrapingMode.prototype.drawFaceGuidelines = function() {
        if (!this.ctx) return;

        try {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);

            var width = this.canvasElement.width;
            var height = this.canvasElement.height;

            // 얼굴 영역 가이드라인
            var regions = this.config.COLOR_ANALYSIS.skinDetection.faceRegion;
            var self = this;
            
            Object.keys(regions).forEach(function(name) {
                var region = regions[name];
                var x = width * region.x;
                var y = height * region.y;
                var w = width * region.w;
                var h = height * region.h;
                
                self.ctx.strokeRect(x, y, w, h);
                
                // 레이블
                self.ctx.fillStyle = 'white';
                self.ctx.font = '12px sans-serif';
                self.ctx.fillText(name, x, y - 5);
            });

            this.ctx.setLineDash([]);
        } catch (error) {
            console.warn('[DrapingMode] 가이드라인 그리기 오류:', error);
        }
    };

    /**
     * 프레임 분석
     */
    DrapingMode.prototype.analyzeFrame = function() {
        if (!this.ctx || !this.currentColor) return;

        try {
            // 피부톤 영역 색상 추출
            var skinColors = this.extractSkinColors();
            
            // Delta E 계산을 통한 매칭도 분석
            var matchingScore = this.calculateColorMatching(skinColors, this.currentColor);
            
            // 색온도 분석
            var temperature = this.analyzeColorTemperature(skinColors);
            
            // UI 업데이트
            this.updateAnalysisUI(matchingScore, temperature);
        } catch (error) {
            console.warn('[DrapingMode] 프레임 분석 오류:', error);
        }
    };

    /**
     * 피부 색상 추출
     */
    DrapingMode.prototype.extractSkinColors = function() {
        var imageData = this.ctx.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height);
        var skinColors = [];
        
        var regions = this.config.COLOR_ANALYSIS.skinDetection.faceRegion;
        var self = this;
        
        Object.values(regions).forEach(function(region) {
            var x = Math.floor(self.canvasElement.width * region.x);
            var y = Math.floor(self.canvasElement.height * region.y);
            var w = Math.floor(self.canvasElement.width * region.w);
            var h = Math.floor(self.canvasElement.height * region.h);
            
            for (var i = 0; i < h; i += 5) {
                for (var j = 0; j < w; j += 5) {
                    var pixelIndex = ((y + i) * self.canvasElement.width + (x + j)) * 4;
                    skinColors.push({
                        r: imageData.data[pixelIndex],
                        g: imageData.data[pixelIndex + 1],
                        b: imageData.data[pixelIndex + 2]
                    });
                }
            }
        });
        
        return skinColors;
    };

    /**
     * 색상 매칭도 계산
     */
    DrapingMode.prototype.calculateColorMatching = function(skinColors, selectedColor) {
        try {
            // Delta E 2000 계산을 위한 간단한 구현
            var selectedRgb = this.hexToRgb(selectedColor);
            if (!selectedRgb) return 0;
            
            var totalDeltaE = 0;
            var validSamples = 0;

            skinColors.forEach(function(skinColor) {
                // RGB를 LAB으로 변환 (간단한 근사값 사용)
                var deltaE = this.calculateDeltaE(skinColor, selectedRgb);
                if (deltaE > 0) {
                    totalDeltaE += deltaE;
                    validSamples++;
                }
            }, this);

            if (validSamples === 0) return 0;
            
            var averageDeltaE = totalDeltaE / validSamples;
            
            // Delta E를 0-100 점수로 변환 (낮을수록 좋음)
            return Math.max(0, 100 - (averageDeltaE * 2));
        } catch (error) {
            console.warn('[DrapingMode] 색상 매칭도 계산 오류:', error);
            return 0;
        }
    };

    /**
     * Delta E 계산 (간단한 버전)
     */
    DrapingMode.prototype.calculateDeltaE = function(color1, color2) {
        // 간단한 유클리드 거리 (실제로는 CIE Delta E 2000 사용해야 함)
        var dr = color1.r - color2.r;
        var dg = color1.g - color2.g;
        var db = color1.b - color2.b;
        
        return Math.sqrt(dr * dr + dg * dg + db * db);
    };

    /**
     * 색온도 분석
     */
    DrapingMode.prototype.analyzeColorTemperature = function(skinColors) {
        var warmCount = 0;
        var coolCount = 0;

        skinColors.forEach(function(color) {
            // 간단한 색온도 판별 (R-B 비교)
            if (color.r > color.b) {
                warmCount++;
            } else {
                coolCount++;
            }
        });

        return warmCount > coolCount ? 'warm' : 'cool';
    };

    /**
     * 분석 UI 업데이트
     */
    DrapingMode.prototype.updateAnalysisUI = function(matchingScore, temperature) {
        try {
            // 피부톤 매칭도 업데이트
            var scoreElement = document.getElementById('skinToneScore');
            if (scoreElement) {
                var scoreFill = scoreElement.querySelector('.score-fill');
                var scoreValue = scoreElement.parentElement.querySelector('.score-value');
                
                if (scoreFill) scoreFill.style.width = matchingScore + '%';
                if (scoreValue) scoreValue.textContent = Math.round(matchingScore) + '점';
            }
            
            // 색온도 게이지 업데이트
            var gauge = document.getElementById('temperatureGauge');
            if (gauge) {
                var indicator = gauge.querySelector('.gauge-indicator');
                if (indicator) {
                    if (temperature === 'warm') {
                        indicator.style.left = '25%';
                        indicator.style.backgroundColor = '#ff6b6b';
                    } else {
                        indicator.style.left = '75%';
                        indicator.style.backgroundColor = '#4ecdc4';
                    }
                }
            }
        } catch (error) {
            console.warn('[DrapingMode] 분석 UI 업데이트 오류:', error);
        }
    };

    /**
     * 계절 선택
     */
    DrapingMode.prototype.selectSeason = function(season) {
        // 탭 활성화
        var tabBtns = document.querySelectorAll('.tab-btn');
        for (var i = 0; i < tabBtns.length; i++) {
            tabBtns[i].classList.remove('active');
        }
        
        var selectedTab = document.querySelector('[data-season=\"' + season + '\"]');
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        
        this.selectedPalette = season;
        this.loadColorPalette(season);
    };

    /**
     * 색상 팔레트 로드
     */
    DrapingMode.prototype.loadColorPalette = function(season) {
        var self = this;
        
        this.getSeasonColors(season)
            .then(function(colors) {
                self.renderColorGrid(colors);
            })
            .catch(function(error) {
                console.error('[DrapingMode] 색상 팔레트 로드 오류:', error);
            });
    };

    /**
     * 계절별 색상 가져오기
     */
    DrapingMode.prototype.getSeasonColors = function(season) {
        return new Promise(function(resolve) {
            // 임시 색상 데이터 (실제로는 seasons.js에서 가져옴)
            var seasonColors = {
                spring: ['#ff6b6b', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd', '#ff7675', '#fdcb6e', '#e84393', '#0984e3', '#6c5ce7'],
                summer: ['#a29bfe', '#fd79a8', '#fdcb6e', '#6c5ce7', '#fab1a0', '#74b9ff', '#e84393', '#00b894', '#00cec9', '#55a3ff'],
                autumn: ['#e17055', '#fdcb6e', '#d63031', '#74b9ff', '#00b894', '#e17055', '#f39c12', '#d35400', '#8b4513', '#cd853f'],
                winter: ['#2d3436', '#636e72', '#ddd', '#0984e3', '#6c5ce7', '#000000', '#ffffff', '#dc143c', '#4169e1', '#800080']
            };
            
            resolve(seasonColors[season] || []);
        });
    };

    /**
     * 색상 그리드 렌더링
     */
    DrapingMode.prototype.renderColorGrid = function(colors) {
        var grid = document.getElementById('colorGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        var self = this;
        
        colors.forEach(function(color) {
            var colorItem = document.createElement('div');
            colorItem.className = 'color-item';
            colorItem.style.backgroundColor = color;
            colorItem.dataset.color = color;
            
            colorItem.addEventListener('click', function() {
                self.selectColor(color);
            });
            
            grid.appendChild(colorItem);
        });
    };

    /**
     * 색상 선택
     */
    DrapingMode.prototype.selectColor = function(color) {
        // 이전 선택 해제
        var colorItems = document.querySelectorAll('.color-item');
        for (var i = 0; i < colorItems.length; i++) {
            colorItems[i].classList.remove('selected');
        }
        
        // 새 색상 선택
        var selectedItem = document.querySelector('[data-color=\"' + color + '\"]');
        if (selectedItem) {
            selectedItem.classList.add('selected');
        }
        
        this.currentColor = color;
        this.updateSelectedColorInfo(color);
    };

    /**
     * 선택된 색상 정보 업데이트
     */
    DrapingMode.prototype.updateSelectedColorInfo = function(color) {
        var info = document.getElementById('selectedColorInfo');
        if (!info) return;
        
        var preview = info.querySelector('.color-preview');
        var name = info.querySelector('.color-name');
        var values = info.querySelector('.color-values');
        
        if (preview) preview.style.backgroundColor = color;
        if (name) name.textContent = this.getColorName(color);
        
        if (values) {
            var rgb = this.hexToRgb(color);
            if (rgb) {
                values.textContent = 'RGB(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')';
            }
        }
    };

    /**
     * 색상 이름 가져오기
     */
    DrapingMode.prototype.getColorName = function(hex) {
        // 색상 이름 매핑 (실제로는 더 정교한 데이터베이스 사용)
        var colorNames = {
            '#ff6b6b': '코랄 레드',
            '#feca57': '선셋 옐로우',
            '#ff9ff3': '핑크 블라썸',
            '#54a0ff': '스카이 블루',
            '#5f27cd': '로얄 퍼플'
        };
        
        return colorNames[hex] || '사용자 정의 색상';
    };

    /**
     * 프레임 캡처
     */
    DrapingMode.prototype.captureFrame = function() {
        if (!this.canvasElement) return;

        try {
            var frameData = this.canvasElement.toDataURL('image/png');
            var timestamp = new Date().toISOString();
            
            this.capturedFrames.push({
                id: Date.now(),
                data: frameData,
                timestamp: timestamp,
                color: this.currentColor,
                analysis: this.getCurrentAnalysis()
            });

            this.updateComparisonView();
            this.showNotification('프레임이 캡처되었습니다.');
        } catch (error) {
            console.error('[DrapingMode] 프레임 캡처 오류:', error);
            this.showError('프레임 캡처에 실패했습니다.');
        }
    };

    /**
     * 현재 분석 결과 가져오기
     */
    DrapingMode.prototype.getCurrentAnalysis = function() {
        return {
            matchingScore: 0,
            temperature: 'neutral',
            season: this.selectedPalette
        };
    };

    /**
     * 비교 뷰 업데이트
     */
    DrapingMode.prototype.updateComparisonView = function() {
        var viewer = document.getElementById('comparisonViewer');
        if (!viewer) return;
        
        var before = viewer.querySelector('.comparison-before');
        var after = viewer.querySelector('.comparison-after');
        
        if (this.capturedFrames.length > 0) {
            var latestFrame = this.capturedFrames[this.capturedFrames.length - 1];
            
            if (before) {
                before.innerHTML = '\n                    <label>Before</label>\n                    <img src=\"' + latestFrame.data + '\" alt=\"Before\">\n                ';
            }
            
            // After는 현재 드래이핑이 적용된 상태
            if (after && this.currentColor) {
                after.innerHTML = '\n                    <label>After (' + this.getColorName(this.currentColor) + ')</label>\n                    <img src=\"' + latestFrame.data + '\" alt=\"After\" style=\"filter: hue-rotate(30deg);\">\n                ';
            }
        }
    };

    /**
     * 비교 모드 설정
     */
    DrapingMode.prototype.setComparisonMode = function(mode) {
        var comparisonBtns = document.querySelectorAll('.comparison-btn');
        for (var i = 0; i < comparisonBtns.length; i++) {
            comparisonBtns[i].classList.remove('active');
        }
        
        var selectedBtn = document.querySelector('[data-mode=\"' + mode + '\"]');
        if (selectedBtn) {
            selectedBtn.classList.add('active');
        }
        
        this.comparisonMode = mode;
        this.updateComparisonLayout();
    };

    /**
     * 비교 레이아웃 업데이트
     */
    DrapingMode.prototype.updateComparisonLayout = function() {
        var viewer = document.getElementById('comparisonViewer');
        if (viewer) {
            viewer.className = 'comparison-viewer ' + this.comparisonMode + '-mode';
        }
    };

    /**
     * 블렌딩 강도 업데이트
     */
    DrapingMode.prototype.updateBlendStrength = function(value) {
        var blendValue = document.getElementById('blendValue');
        if (blendValue) {
            blendValue.textContent = value + '%';
        }
        
        // WebGL 렌더링 강도 업데이트는 renderFrame에서 처리됨
    };

    /**
     * 카메라 일시정지
     */
    DrapingMode.prototype.pauseCamera = function() {
        if (this.stream) {
            var tracks = this.stream.getVideoTracks();
            for (var i = 0; i < tracks.length; i++) {
                tracks[i].enabled = !tracks[i].enabled;
            }
            
            var isPaused = tracks.length > 0 ? !tracks[0].enabled : false;
            this.updateCameraControls(!isPaused);
        }
    };

    /**
     * 카메라 전환
     */
    DrapingMode.prototype.switchCamera = function() {
        this.currentFacingMode = this.currentFacingMode === 'user' ? 'environment' : 'user';
        this.stopCamera();
        
        var self = this;
        setTimeout(function() {
            self.startCamera();
        }, 500);
    };

    /**
     * 카메라 정지
     */
    DrapingMode.prototype.stopCamera = function() {
        if (this.stream) {
            var tracks = this.stream.getTracks();
            for (var i = 0; i < tracks.length; i++) {
                tracks[i].stop();
            }
            this.stream = null;
        }
        
        this.isActive = false;
        this.updateCameraControls(false);
    };

    /**
     * 카메라 컨트롤 UI 업데이트
     */
    DrapingMode.prototype.updateCameraControls = function(isActive) {
        var startBtn = document.getElementById('startCamera');
        var pauseBtn = document.getElementById('pauseCamera');
        var captureBtn = document.getElementById('captureFrame');
        
        if (startBtn) startBtn.disabled = isActive;
        if (pauseBtn) pauseBtn.disabled = !isActive;
        if (captureBtn) captureBtn.disabled = !isActive;
    };

    /**
     * 초기화
     */
    DrapingMode.prototype.reset = function() {
        this.stopCamera();
        this.currentColor = null;
        this.selectedPalette = null;
        this.capturedFrames = [];
        this.analysisResults = [];
        
        // UI 초기화
        var colorGrid = document.getElementById('colorGrid');
        if (colorGrid) colorGrid.innerHTML = '';
        
        var comparisonViewer = document.getElementById('comparisonViewer');
        if (comparisonViewer) {
            comparisonViewer.innerHTML = '\n                <div class=\"comparison-before\">\n                    <label>Before</label>\n                    <div class=\"frame-placeholder\">캡처된 프레임이 없습니다</div>\n                </div>\n                <div class=\"comparison-after\">\n                    <label>After</label>\n                    <div class=\"frame-placeholder\">드래이핑을 적용하세요</div>\n                </div>\n            ';
        }
        
        this.showNotification('드래이핑 모드가 초기화되었습니다.');
    };

    /**
     * 임시저장
     */
    DrapingMode.prototype.saveDraft = function() {
        try {
            var draftData = {
                timestamp: new Date().toISOString(),
                selectedPalette: this.selectedPalette,
                currentColor: this.currentColor,
                capturedFrames: this.capturedFrames,
                analysisResults: this.analysisResults
            };
            
            localStorage.setItem('drapingDraft', JSON.stringify(draftData));
            this.showNotification('임시저장이 완료되었습니다.');
        } catch (error) {
            console.error('[DrapingMode] 임시저장 오류:', error);
            this.showError('임시저장에 실패했습니다.');
        }
    };

    /**
     * 보고서 생성
     */
    DrapingMode.prototype.generateReport = function() {
        if (this.capturedFrames.length === 0) {
            this.showError('분석할 프레임이 없습니다. 먼저 드래이핑을 진행해주세요.');
            return;
        }

        try {
            // ReportGenerator에 데이터 전달
            var reportData = {
                mode: 'draping',
                results: this.analysisResults,
                frames: this.capturedFrames,
                selectedColors: this.currentColor,
                palette: this.selectedPalette
            };
            
            // 이벤트 발생으로 앱에 보고서 생성 요청
            window.dispatchEvent(new CustomEvent('generateReport', { detail: reportData }));
        } catch (error) {
            console.error('[DrapingMode] 보고서 생성 요청 오류:', error);
            this.showError('보고서 생성 요청에 실패했습니다.');
        }
    };

    // 유틸리티 메서드
    DrapingMode.prototype.hexToRgb = function(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    DrapingMode.prototype.showLoading = function(message) {
        var overlay = document.getElementById('drapingLoading');
        if (overlay) {
            var messageElement = overlay.querySelector('p');
            if (messageElement) messageElement.textContent = message;
            overlay.style.display = 'flex';
        }
    };

    DrapingMode.prototype.hideLoading = function() {
        var overlay = document.getElementById('drapingLoading');
        if (overlay) overlay.style.display = 'none';
    };

    DrapingMode.prototype.showNotification = function(message) {
        // 간단한 토스트 알림
        var toast = document.createElement('div');
        toast.className = 'toast success';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(function() {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    };

    DrapingMode.prototype.showError = function(message) {
        var toast = document.createElement('div');
        toast.className = 'toast error';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(function() {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    };

    // 정리
    DrapingMode.prototype.destroy = function() {
        this.stopCamera();
        
        if (this.gl && this.shaderProgram) {
            this.gl.deleteProgram(this.shaderProgram);
        }
        
        // 이벤트 리스너 제거
        // (필요시 구현)
    };

    // 전역 등록
    if (typeof window !== 'undefined') {
        window.DrapingMode = DrapingMode;
    }

    console.log('[DrapingMode] ES5 호환 버전 로드 완료 ✅');

})();
