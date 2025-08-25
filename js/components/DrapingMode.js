/**
 * DrapingMode.js
 * 전문가 드래이핑 모드 컴포넌트
 * - 실시간 카메라 피드백
 * - 가상 드래이핑 오버레이
 * - Before/After 비교
 * - 색상 팔레트 선택
 * - 전문가 워크플로우
 */

import { CONFIG } from '../config.js';

export class DrapingMode {
    constructor(container) {
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
        
        this.init();
    }

    async init() {
        this.createInterface();
        await this.setupWebGL();
        this.bindEvents();
    }

    createInterface() {
        this.container.innerHTML = `
            <div class="draping-mode" id="drapingMode">
                <!-- 헤더 -->
                <div class="draping-header">
                    <div class="mode-info">
                        <h2>전문가 드래이핑 모드</h2>
                        <p>실시간 가상 패이드로 정확한 퍼스널컬러 진단</p>
                    </div>
                    <div class="header-controls">
                        <button class="btn btn-outline" id="switchCamera">
                            <i class="icon-camera-switch"></i>
                            카메라 전환
                        </button>
                        <button class="btn btn-outline" id="settingsBtn">
                            <i class="icon-settings"></i>
                            설정
                        </button>
                    </div>
                </div>

                <!-- 메인 워크스페이스 -->
                <div class="draping-workspace">
                    <!-- 카메라 뷰 -->
                    <div class="camera-section">
                        <div class="video-container">
                            <video id="drapingVideo" autoplay playsinline muted></video>
                            <canvas id="drapingCanvas" class="overlay-canvas"></canvas>
                            <canvas id="webglCanvas" class="webgl-canvas"></canvas>
                            
                            <!-- 오버레이 컨트롤 -->
                            <div class="overlay-controls">
                                <div class="blend-control">
                                    <label>블렌딩 강도</label>
                                    <input type="range" id="blendSlider" min="0" max="100" value="70">
                                    <span id="blendValue">70%</span>
                                </div>
                            </div>

                            <!-- 가이드라인 -->
                            <div class="face-guidelines" id="faceGuidelines">
                                <div class="guideline forehead"></div>
                                <div class="guideline cheek-left"></div>
                                <div class="guideline cheek-right"></div>
                                <div class="guideline jaw"></div>
                            </div>
                        </div>

                        <!-- 카메라 컨트롤 -->
                        <div class="camera-controls">
                            <button class="btn btn-primary" id="startCamera">
                                <i class="icon-play"></i>
                                카메라 시작
                            </button>
                            <button class="btn btn-secondary" id="pauseCamera" disabled>
                                <i class="icon-pause"></i>
                                일시정지
                            </button>
                            <button class="btn btn-success" id="captureFrame">
                                <i class="icon-camera"></i>
                                프레임 캡처
                            </button>
                        </div>
                    </div>

                    <!-- 컬러 팔레트 선택 -->
                    <div class="palette-section">
                        <div class="palette-header">
                            <h3>색상 팔레트 선택</h3>
                            <div class="season-tabs">
                                <button class="tab-btn active" data-season="spring">봄</button>
                                <button class="tab-btn" data-season="summer">여름</button>
                                <button class="tab-btn" data-season="autumn">가을</button>
                                <button class="tab-btn" data-season="winter">겨울</button>
                            </div>
                        </div>

                        <div class="color-grid" id="colorGrid">
                            <!-- 색상들이 동적으로 생성됨 -->
                        </div>

                        <!-- 선택된 색상 정보 -->
                        <div class="selected-color-info" id="selectedColorInfo">
                            <div class="color-preview"></div>
                            <div class="color-details">
                                <span class="color-name">색상을 선택하세요</span>
                                <span class="color-values"></span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 비교 모드 -->
                <div class="comparison-section">
                    <div class="comparison-header">
                        <h3>Before/After 비교</h3>
                        <div class="comparison-controls">
                            <button class="comparison-btn active" data-mode="single">단일</button>
                            <button class="comparison-btn" data-mode="split">분할</button>
                            <button class="comparison-btn" data-mode="slider">슬라이더</button>
                        </div>
                    </div>

                    <div class="comparison-viewer" id="comparisonViewer">
                        <div class="comparison-before">
                            <label>Before</label>
                            <div class="frame-placeholder">캡처된 프레임이 없습니다</div>
                        </div>
                        <div class="comparison-after">
                            <label>After</label>
                            <div class="frame-placeholder">드래이핑을 적용하세요</div>
                        </div>
                    </div>
                </div>

                <!-- 분석 결과 -->
                <div class="analysis-section" id="analysisSection">
                    <div class="analysis-header">
                        <h3>실시간 분석 결과</h3>
                        <button class="btn btn-outline" id="exportResults">
                            <i class="icon-download"></i>
                            결과 내보내기
                        </button>
                    </div>

                    <div class="analysis-grid">
                        <div class="analysis-card">
                            <h4>피부톤 매칭도</h4>
                            <div class="score-indicator">
                                <div class="score-bar" id="skinToneScore">
                                    <div class="score-fill"></div>
                                </div>
                                <span class="score-value">--</span>
                            </div>
                        </div>

                        <div class="analysis-card">
                            <h4>색온도 분석</h4>
                            <div class="temperature-gauge" id="temperatureGauge">
                                <div class="gauge-warm">웜톤</div>
                                <div class="gauge-indicator"></div>
                                <div class="gauge-cool">쿨톤</div>
                            </div>
                        </div>

                        <div class="analysis-card">
                            <h4>명도/채도 분석</h4>
                            <div class="lightness-chart" id="lightnessChart">
                                <canvas width="200" height="100"></canvas>
                            </div>
                        </div>

                        <div class="analysis-card">
                            <h4>추천 계절</h4>
                            <div class="season-recommendation" id="seasonRecommendation">
                                <div class="season-item">
                                    <span class="season-name">분석 중...</span>
                                    <span class="confidence">--%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 액션 버튼 -->
                <div class="draping-actions">
                    <button class="btn btn-outline" id="resetDraping">
                        <i class="icon-refresh"></i>
                        초기화
                    </button>
                    <button class="btn btn-secondary" id="saveDraft">
                        <i class="icon-save"></i>
                        임시저장
                    </button>
                    <button class="btn btn-primary" id="generateReport">
                        <i class="icon-file-text"></i>
                        보고서 생성
                    </button>
                </div>

                <!-- 로딩 오버레이 -->
                <div class="loading-overlay" id="drapingLoading">
                    <div class="loading-content">
                        <div class="spinner"></div>
                        <p>카메라를 초기화하는 중...</p>
                    </div>
                </div>
            </div>
        `;
    }

    async setupWebGL() {
        this.glCanvas = document.getElementById('webglCanvas');
        this.gl = this.glCanvas.getContext('webgl');
        
        if (!this.gl) {
            console.error('WebGL을 지원하지 않습니다.');
            return;
        }

        // 셰이더 프로그램 생성
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, `
            attribute vec2 a_position;
            attribute vec2 a_texCoord;
            varying vec2 v_texCoord;
            
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
                v_texCoord = a_texCoord;
            }
        `);

        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, `
            precision mediump float;
            uniform sampler2D u_videoTexture;
            uniform sampler2D u_colorTexture;
            uniform float u_blend;
            uniform vec3 u_selectedColor;
            varying vec2 v_texCoord;
            
            void main() {
                vec4 videoColor = texture2D(u_videoTexture, v_texCoord);
                vec3 blendedColor = mix(videoColor.rgb, u_selectedColor, u_blend);
                gl_FragColor = vec4(blendedColor, videoColor.a);
            }
        `);

        this.shaderProgram = this.createProgram(vertexShader, fragmentShader);
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('셰이더 컴파일 오류:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }

    createProgram(vertexShader, fragmentShader) {
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('셰이더 프로그램 링크 오류:', this.gl.getProgramInfoLog(program));
            this.gl.deleteProgram(program);
            return null;
        }
        
        return program;
    }

    bindEvents() {
        // 카메라 컨트롤
        document.getElementById('startCamera').addEventListener('click', () => this.startCamera());
        document.getElementById('pauseCamera').addEventListener('click', () => this.pauseCamera());
        document.getElementById('captureFrame').addEventListener('click', () => this.captureFrame());
        document.getElementById('switchCamera').addEventListener('click', () => this.switchCamera());

        // 계절 탭
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectSeason(e.target.dataset.season));
        });

        // 비교 모드
        document.querySelectorAll('.comparison-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setComparisonMode(e.target.dataset.mode));
        });

        // 블렌딩 슬라이더
        document.getElementById('blendSlider').addEventListener('input', (e) => {
            this.updateBlendStrength(parseInt(e.target.value));
        });

        // 액션 버튼
        document.getElementById('resetDraping').addEventListener('click', () => this.reset());
        document.getElementById('saveDraft').addEventListener('click', () => this.saveDraft());
        document.getElementById('generateReport').addEventListener('click', () => this.generateReport());
    }

    async startCamera() {
        try {
            this.showLoading('카메라를 시작하는 중...');
            
            const constraints = {
                video: {
                    width: { ideal: CONFIG.CAMERA.resolution.width },
                    height: { ideal: CONFIG.CAMERA.resolution.height },
                    frameRate: { ideal: CONFIG.CAMERA.frameRate },
                    facingMode: 'user'
                }
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.videoElement = document.getElementById('drapingVideo');
            this.canvasElement = document.getElementById('drapingCanvas');
            this.ctx = this.canvasElement.getContext('2d');
            
            this.videoElement.srcObject = this.stream;
            this.isActive = true;

            // 비디오 로드 완료 후
            this.videoElement.addEventListener('loadedmetadata', () => {
                this.setupCanvasSize();
                this.startDrapingLoop();
                this.hideLoading();
                this.updateCameraControls(true);
            });

        } catch (error) {
            console.error('카메라 시작 오류:', error);
            this.hideLoading();
            this.showError('카메라에 접근할 수 없습니다. 권한을 확인해주세요.');
        }
    }

    setupCanvasSize() {
        const video = this.videoElement;
        this.canvasElement.width = video.videoWidth;
        this.canvasElement.height = video.videoHeight;
        this.glCanvas.width = video.videoWidth;
        this.glCanvas.height = video.videoHeight;
    }

    startDrapingLoop() {
        if (!this.isActive) return;

        this.renderFrame();
        this.analyzeFrame();
        
        requestAnimationFrame(() => this.startDrapingLoop());
    }

    renderFrame() {
        if (!this.ctx || !this.videoElement) return;

        // 비디오 프레임을 캔버스에 그리기
        this.ctx.drawImage(this.videoElement, 0, 0);

        // 현재 선택된 색상이 있으면 가상 드래이핑 적용
        if (this.currentColor) {
            this.applyVirtualDraping();
        }

        // 얼굴 가이드라인 그리기
        this.drawFaceGuidelines();
    }

    applyVirtualDraping() {
        // WebGL을 사용한 실시간 색상 블렌딩
        const gl = this.gl;
        if (!gl || !this.shaderProgram) return;

        gl.useProgram(this.shaderProgram);
        
        // 블렌딩 강도 설정
        const blendStrength = document.getElementById('blendSlider').value / 100;
        const blendUniform = gl.getUniformLocation(this.shaderProgram, 'u_blend');
        gl.uniform1f(blendUniform, blendStrength);

        // 선택된 색상 설정
        const colorUniform = gl.getUniformLocation(this.shaderProgram, 'u_selectedColor');
        const rgb = this.hexToRgb(this.currentColor);
        gl.uniform3f(colorUniform, rgb.r / 255, rgb.g / 255, rgb.b / 255);

        // 렌더링 실행
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    drawFaceGuidelines() {
        if (!this.ctx) return;

        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);

        const width = this.canvasElement.width;
        const height = this.canvasElement.height;

        // 얼굴 영역 가이드라인
        const regions = CONFIG.COLOR_ANALYSIS.skinDetection.faceRegion;
        
        Object.entries(regions).forEach(([name, region]) => {
            const x = width * region.x;
            const y = height * region.y;
            const w = width * region.w;
            const h = height * region.h;
            
            this.ctx.strokeRect(x, y, w, h);
            
            // 레이블
            this.ctx.fillStyle = 'white';
            this.ctx.font = '12px sans-serif';
            this.ctx.fillText(name, x, y - 5);
        });

        this.ctx.setLineDash([]);
    }

    analyzeFrame() {
        if (!this.ctx || !this.currentColor) return;

        // 피부톤 영역 색상 추출
        const skinColors = this.extractSkinColors();
        
        // Delta E 계산을 통한 매칭도 분석
        const matchingScore = this.calculateColorMatching(skinColors, this.currentColor);
        
        // 색온도 분석
        const temperature = this.analyzeColorTemperature(skinColors);
        
        // UI 업데이트
        this.updateAnalysisUI(matchingScore, temperature);
    }

    extractSkinColors() {
        const imageData = this.ctx.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height);
        const skinColors = [];
        
        const regions = CONFIG.COLOR_ANALYSIS.skinDetection.faceRegion;
        
        Object.values(regions).forEach(region => {
            const x = Math.floor(this.canvasElement.width * region.x);
            const y = Math.floor(this.canvasElement.height * region.y);
            const w = Math.floor(this.canvasElement.width * region.w);
            const h = Math.floor(this.canvasElement.height * region.h);
            
            for (let i = 0; i < h; i += 5) {
                for (let j = 0; j < w; j += 5) {
                    const pixelIndex = ((y + i) * this.canvasElement.width + (x + j)) * 4;
                    skinColors.push({
                        r: imageData.data[pixelIndex],
                        g: imageData.data[pixelIndex + 1],
                        b: imageData.data[pixelIndex + 2]
                    });
                }
            }
        });
        
        return skinColors;
    }

    calculateColorMatching(skinColors, selectedColor) {
        // Delta E 2000 계산을 위한 간단한 구현
        const selectedRgb = this.hexToRgb(selectedColor);
        let totalDeltaE = 0;
        let validSamples = 0;

        skinColors.forEach(skinColor => {
            // RGB를 LAB으로 변환 (간단한 근사값 사용)
            const deltaE = this.calculateDeltaE(skinColor, selectedRgb);
            if (deltaE > 0) {
                totalDeltaE += deltaE;
                validSamples++;
            }
        });

        if (validSamples === 0) return 0;
        
        const averageDeltaE = totalDeltaE / validSamples;
        
        // Delta E를 0-100 점수로 변환 (낮을수록 좋음)
        return Math.max(0, 100 - (averageDeltaE * 2));
    }

    calculateDeltaE(color1, color2) {
        // 간단한 유클리드 거리 (실제로는 CIE Delta E 2000 사용해야 함)
        const dr = color1.r - color2.r;
        const dg = color1.g - color2.g;
        const db = color1.b - color2.b;
        
        return Math.sqrt(dr * dr + dg * dg + db * db);
    }

    analyzeColorTemperature(skinColors) {
        let warmCount = 0;
        let coolCount = 0;

        skinColors.forEach(color => {
            // 간단한 색온도 판별 (R-B 비교)
            if (color.r > color.b) {
                warmCount++;
            } else {
                coolCount++;
            }
        });

        return warmCount > coolCount ? 'warm' : 'cool';
    }

    updateAnalysisUI(matchingScore, temperature) {
        // 피부톤 매칭도 업데이트
        const scoreElement = document.getElementById('skinToneScore');
        const scoreFill = scoreElement.querySelector('.score-fill');
        const scoreValue = scoreElement.parentElement.querySelector('.score-value');
        
        scoreFill.style.width = `${matchingScore}%`;
        scoreValue.textContent = `${Math.round(matchingScore)}점`;
        
        // 색온도 게이지 업데이트
        const gauge = document.getElementById('temperatureGauge');
        const indicator = gauge.querySelector('.gauge-indicator');
        
        if (temperature === 'warm') {
            indicator.style.left = '25%';
            indicator.style.backgroundColor = '#ff6b6b';
        } else {
            indicator.style.left = '75%';
            indicator.style.backgroundColor = '#4ecdc4';
        }
    }

    selectSeason(season) {
        // 탭 활성화
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-season="${season}"]`).classList.add('active');
        
        this.selectedPalette = season;
        this.loadColorPalette(season);
    }

    async loadColorPalette(season) {
        try {
            // 실제로는 seasons.js에서 데이터를 가져옴
            const colors = await this.getSeasonColors(season);
            this.renderColorGrid(colors);
        } catch (error) {
            console.error('색상 팔레트 로드 오류:', error);
        }
    }

    async getSeasonColors(season) {
        // 임시 색상 데이터 (실제로는 seasons.js에서 가져옴)
        const seasonColors = {
            spring: ['#ff6b6b', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'],
            summer: ['#a29bfe', '#fd79a8', '#fdcb6e', '#6c5ce7', '#fab1a0'],
            autumn: ['#e17055', '#fdcb6e', '#d63031', '#74b9ff', '#00b894'],
            winter: ['#2d3436', '#636e72', '#ddd', '#0984e3', '#6c5ce7']
        };
        
        return seasonColors[season] || [];
    }

    renderColorGrid(colors) {
        const grid = document.getElementById('colorGrid');
        grid.innerHTML = '';
        
        colors.forEach(color => {
            const colorItem = document.createElement('div');
            colorItem.className = 'color-item';
            colorItem.style.backgroundColor = color;
            colorItem.dataset.color = color;
            
            colorItem.addEventListener('click', () => this.selectColor(color));
            
            grid.appendChild(colorItem);
        });
    }

    selectColor(color) {
        // 이전 선택 해제
        document.querySelectorAll('.color-item').forEach(item => 
            item.classList.remove('selected'));
        
        // 새 색상 선택
        document.querySelector(`[data-color="${color}"]`).classList.add('selected');
        
        this.currentColor = color;
        this.updateSelectedColorInfo(color);
    }

    updateSelectedColorInfo(color) {
        const info = document.getElementById('selectedColorInfo');
        const preview = info.querySelector('.color-preview');
        const name = info.querySelector('.color-name');
        const values = info.querySelector('.color-values');
        
        preview.style.backgroundColor = color;
        name.textContent = this.getColorName(color);
        
        const rgb = this.hexToRgb(color);
        values.textContent = `RGB(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    }

    getColorName(hex) {
        // 색상 이름 매핑 (실제로는 더 정교한 데이터베이스 사용)
        const colorNames = {
            '#ff6b6b': '코랄 레드',
            '#feca57': '선셋 옐로우',
            '#ff9ff3': '핑크 블라썸',
            '#54a0ff': '스카이 블루',
            '#5f27cd': '로얄 퍼플'
        };
        
        return colorNames[hex] || '사용자 정의 색상';
    }

    captureFrame() {
        if (!this.canvasElement) return;

        const frameData = this.canvasElement.toDataURL('image/png');
        const timestamp = new Date().toISOString();
        
        this.capturedFrames.push({
            id: Date.now(),
            data: frameData,
            timestamp: timestamp,
            color: this.currentColor,
            analysis: this.getCurrentAnalysis()
        });

        this.updateComparisonView();
        this.showNotification('프레임이 캡처되었습니다.');
    }

    getCurrentAnalysis() {
        // 현재 분석 결과 반환
        return {
            matchingScore: 0,
            temperature: 'neutral',
            season: this.selectedPalette
        };
    }

    updateComparisonView() {
        const viewer = document.getElementById('comparisonViewer');
        const before = viewer.querySelector('.comparison-before');
        const after = viewer.querySelector('.comparison-after');
        
        if (this.capturedFrames.length > 0) {
            const latestFrame = this.capturedFrames[this.capturedFrames.length - 1];
            
            before.innerHTML = `
                <label>Before</label>
                <img src="${latestFrame.data}" alt="Before">
            `;
            
            // After는 현재 드래이핑이 적용된 상태
            if (this.currentColor) {
                after.innerHTML = `
                    <label>After (${this.getColorName(this.currentColor)})</label>
                    <img src="${latestFrame.data}" alt="After" style="filter: hue-rotate(30deg);">
                `;
            }
        }
    }

    setComparisonMode(mode) {
        document.querySelectorAll('.comparison-btn').forEach(btn => 
            btn.classList.remove('active'));
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
        
        this.comparisonMode = mode;
        this.updateComparisonLayout();
    }

    updateComparisonLayout() {
        const viewer = document.getElementById('comparisonViewer');
        viewer.className = `comparison-viewer ${this.comparisonMode}-mode`;
    }

    updateBlendStrength(value) {
        document.getElementById('blendValue').textContent = `${value}%`;
        
        // WebGL 렌더링 강도 업데이트는 renderFrame에서 처리됨
    }

    pauseCamera() {
        if (this.stream) {
            this.stream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            
            const isPaused = !this.stream.getVideoTracks()[0].enabled;
            this.updateCameraControls(!isPaused);
        }
    }

    switchCamera() {
        // 전면/후면 카메라 전환
        this.stopCamera();
        setTimeout(() => this.startCamera(), 500);
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        this.isActive = false;
        this.updateCameraControls(false);
    }

    updateCameraControls(isActive) {
        document.getElementById('startCamera').disabled = isActive;
        document.getElementById('pauseCamera').disabled = !isActive;
        document.getElementById('captureFrame').disabled = !isActive;
    }

    reset() {
        this.stopCamera();
        this.currentColor = null;
        this.selectedPalette = null;
        this.capturedFrames = [];
        this.analysisResults = [];
        
        // UI 초기화
        document.getElementById('colorGrid').innerHTML = '';
        document.getElementById('comparisonViewer').innerHTML = `
            <div class="comparison-before">
                <label>Before</label>
                <div class="frame-placeholder">캡처된 프레임이 없습니다</div>
            </div>
            <div class="comparison-after">
                <label>After</label>
                <div class="frame-placeholder">드래이핑을 적용하세요</div>
            </div>
        `;
        
        this.showNotification('드래이핑 모드가 초기화되었습니다.');
    }

    saveDraft() {
        const draftData = {
            timestamp: new Date().toISOString(),
            selectedPalette: this.selectedPalette,
            currentColor: this.currentColor,
            capturedFrames: this.capturedFrames,
            analysisResults: this.analysisResults
        };
        
        localStorage.setItem('drapingDraft', JSON.stringify(draftData));
        this.showNotification('임시저장이 완료되었습니다.');
    }

    generateReport() {
        if (this.capturedFrames.length === 0) {
            this.showError('분석할 프레임이 없습니다. 먼저 드래이핑을 진행해주세요.');
            return;
        }

        // ReportGenerator에 데이터 전달
        const reportData = {
            mode: 'draping',
            results: this.analysisResults,
            frames: this.capturedFrames,
            selectedColors: this.currentColor,
            palette: this.selectedPalette
        };
        
        // 이벤트 발생으로 앱에 보고서 생성 요청
        window.dispatchEvent(new CustomEvent('generateReport', { detail: reportData }));
    }

    // 유틸리티 메서드
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    showLoading(message) {
        const overlay = document.getElementById('drapingLoading');
        overlay.querySelector('p').textContent = message;
        overlay.style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('drapingLoading').style.display = 'none';
    }

    showNotification(message) {
        // 간단한 토스트 알림
        const toast = document.createElement('div');
        toast.className = 'toast success';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    showError(message) {
        const toast = document.createElement('div');
        toast.className = 'toast error';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // 정리
    destroy() {
        this.stopCamera();
        
        if (this.gl) {
            this.gl.deleteProgram(this.shaderProgram);
        }
        
        // 이벤트 리스너 제거
        // (필요시 구현)
    }
}
