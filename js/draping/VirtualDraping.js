/**
 * VirtualDraping.js
 * 실시간 가상 드레이핑 엔진
 * - WebGL 기반 고성능 실시간 렌더링
 * - 4계절 색상 팔레트 실시간 적용
 * - 피부톤 매칭도 즉시 분석
 * - Before/After 비교 모드
 */

class VirtualDraping {
    constructor(canvasElement, options = {}) {
        this.canvas = canvasElement;
        this.options = {
            enableWebGL: options.enableWebGL !== false,
            maxFPS: options.maxFPS || 60,
            colorBlendMode: options.colorBlendMode || 'multiply',
            enableSkinAnalysis: options.enableSkinAnalysis !== false,
            debugMode: options.debugMode || false,
            ...options
        };

        // WebGL 컨텍스트
        this.gl = null;
        this.program = null;
        this.buffers = {};
        this.textures = {};
        this.uniforms = {};

        // 드레이핑 상태
        this.state = {
            isActive: false,
            currentColor: null,
            currentSeason: null,
            faceDetected: false,
            skinToneAnalyzed: false,
            blendMode: 'soft-light',
            opacity: 0.7,
            skinROI: null
        };

        // 성능 모니터링
        this.performance = {
            frameCount: 0,
            lastFrameTime: 0,
            averageFPS: 0,
            renderTime: []
        };

        // 색상 팔레트
        this.colorPalettes = {};
        this.loadColorPalettes();

        this.init();
    }

    async init() {
        try {
            console.log('🎨 VirtualDraping 초기화 시작');
            
            await this.setupWebGL();
            await this.loadShaders();
            await this.initializeBuffers();
            this.setupEventListeners();
            
            console.log('✅ VirtualDraping 초기화 완료');
        } catch (error) {
            console.error('❌ VirtualDraping 초기화 실패:', error);
            this.fallbackToCanvas2D();
        }
    }

    /**
     * WebGL 설정
     */
    async setupWebGL() {
        this.gl = this.canvas.getContext('webgl2') || this.canvas.getContext('webgl');
        
        if (!this.gl) {
            throw new Error('WebGL을 지원하지 않는 브라우저입니다');
        }

        // WebGL 설정
        this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);

        console.log('🔧 WebGL 설정 완료');
    }

    /**
     * 셰이더 로드
     */
    async loadShaders() {
        const vertexShaderSource = `
            attribute vec2 a_position;
            attribute vec2 a_texCoord;
            
            varying vec2 v_texCoord;
            
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
                v_texCoord = a_texCoord;
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;
            
            uniform sampler2D u_image;
            uniform sampler2D u_skinMask;
            uniform vec3 u_drapingColor;
            uniform float u_opacity;
            uniform int u_blendMode;
            uniform vec2 u_resolution;
            
            varying vec2 v_texCoord;
            
            vec3 blendSoftLight(vec3 base, vec3 blend) {
                return mix(
                    sqrt(base) * (2.0 * blend - 1.0) + 2.0 * base * (1.0 - blend),
                    2.0 * base * blend + base * base * (1.0 - 2.0 * blend),
                    step(0.5, blend)
                );
            }
            
            vec3 blendMultiply(vec3 base, vec3 blend) {
                return base * blend;
            }
            
            vec3 blendOverlay(vec3 base, vec3 blend) {
                return mix(
                    2.0 * base * blend,
                    1.0 - 2.0 * (1.0 - base) * (1.0 - blend),
                    step(0.5, base)
                );
            }
            
            void main() {
                vec4 originalColor = texture2D(u_image, v_texCoord);
                vec4 skinMask = texture2D(u_skinMask, v_texCoord);
                
                // 피부 영역에만 드레이핑 적용
                if (skinMask.r < 0.5) {
                    gl_FragColor = originalColor;
                    return;
                }
                
                vec3 baseColor = originalColor.rgb;
                vec3 blendColor = u_drapingColor;
                vec3 result;
                
                // 블렌드 모드 적용
                if (u_blendMode == 0) {
                    result = blendSoftLight(baseColor, blendColor);
                } else if (u_blendMode == 1) {
                    result = blendMultiply(baseColor, blendColor);
                } else if (u_blendMode == 2) {
                    result = blendOverlay(baseColor, blendColor);
                } else {
                    result = mix(baseColor, blendColor, 0.5);
                }
                
                // 투명도 적용
                result = mix(baseColor, result, u_opacity * skinMask.r);
                
                gl_FragColor = vec4(result, originalColor.a);
            }
        `;

        this.program = await this.createShaderProgram(vertexShaderSource, fragmentShaderSource);
        this.gl.useProgram(this.program);

        // 유니폼 위치 가져오기
        this.uniforms = {
            image: this.gl.getUniformLocation(this.program, 'u_image'),
            skinMask: this.gl.getUniformLocation(this.program, 'u_skinMask'),
            drapingColor: this.gl.getUniformLocation(this.program, 'u_drapingColor'),
            opacity: this.gl.getUniformLocation(this.program, 'u_opacity'),
            blendMode: this.gl.getUniformLocation(this.program, 'u_blendMode'),
            resolution: this.gl.getUniformLocation(this.program, 'u_resolution')
        };

        console.log('📋 셰이더 로드 완료');
    }

    /**
     * 버퍼 초기화
     */
    initializeBuffers() {
        // 정점 버퍼 (전체 화면 quad)
        const vertices = new Float32Array([
            -1.0, -1.0,  0.0, 0.0,  // 좌하단
             1.0, -1.0,  1.0, 0.0,  // 우하단
            -1.0,  1.0,  0.0, 1.0,  // 좌상단
             1.0,  1.0,  1.0, 1.0   // 우상단
        ]);

        this.buffers.vertex = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.vertex);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

        // 인덱스 버퍼
        const indices = new Uint16Array([0, 1, 2, 1, 2, 3]);
        this.buffers.index = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.index);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indices, this.gl.STATIC_DRAW);

        // 속성 연결
        const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
        const texCoordLocation = this.gl.getAttribLocation(this.program, 'a_texCoord');

        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.enableVertexAttribArray(texCoordLocation);

        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 16, 0);
        this.gl.vertexAttribPointer(texCoordLocation, 2, this.gl.FLOAT, false, 16, 8);

        console.log('🔧 버퍼 초기화 완료');
    }

    /**
     * 색상 팔레트 로드
     */
    loadColorPalettes() {
        this.colorPalettes = {
            spring: {
                bright: [
                    { name: 'Coral Pink', rgb: [255, 127, 127], lab: [65.2, 45.8, 23.1] },
                    { name: 'Peach', rgb: [255, 203, 164], lab: [82.1, 12.4, 28.9] },
                    { name: 'Golden Yellow', rgb: [255, 215, 0], lab: [86.9, 4.2, 79.8] },
                    { name: 'Warm Beige', rgb: [245, 222, 179], lab: [88.7, 2.1, 22.4] },
                    { name: 'Light Coral', rgb: [240, 128, 128], lab: [67.3, 42.1, 19.6] }
                ],
                light: [
                    { name: 'Soft Peach', rgb: [255, 218, 185], lab: [87.2, 8.9, 18.7] },
                    { name: 'Cream', rgb: [255, 253, 208], lab: [98.1, -1.2, 12.8] },
                    { name: 'Light Pink', rgb: [255, 182, 193], lab: [78.4, 28.5, 8.9] },
                    { name: 'Ivory', rgb: [255, 255, 240], lab: [99.2, -0.8, 4.2] },
                    { name: 'Warm White', rgb: [248, 248, 255], lab: [97.8, 0.2, -1.8] }
                ]
            },

            summer: {
                light: [
                    { name: 'Rose Pink', rgb: [255, 182, 193], lab: [78.4, 28.5, 8.9] },
                    { name: 'Lavender', rgb: [230, 230, 250], lab: [92.1, 4.8, -8.2] },
                    { name: 'Baby Blue', rgb: [173, 216, 230], lab: [83.7, -8.9, -14.2] },
                    { name: 'Cool Beige', rgb: [245, 245, 220], lab: [96.2, -1.1, 8.9] },
                    { name: 'Soft Gray', rgb: [211, 211, 211], lab: [85.1, 0.2, 0.8] }
                ],
                soft: [
                    { name: 'Dusty Rose', rgb: [188, 143, 143], lab: [64.2, 18.7, 8.4] },
                    { name: 'Sage Green', rgb: [159, 175, 143], lab: [69.1, -8.2, 12.7] },
                    { name: 'Powder Blue', rgb: [176, 196, 222], lab: [78.9, -2.1, -18.4] },
                    { name: 'Mauve', rgb: [224, 176, 255], lab: [76.8, 23.9, -28.1] },
                    { name: 'Cool Taupe', rgb: [188, 175, 165], lab: [71.2, 4.1, 6.8] }
                ]
            },

            autumn: {
                deep: [
                    { name: 'Burgundy', rgb: [128, 0, 32], lab: [29.8, 48.2, 22.1] },
                    { name: 'Forest Green', rgb: [34, 139, 34], lab: [51.2, -43.1, 44.8] },
                    { name: 'Golden Brown', rgb: [153, 101, 21], lab: [48.9, 12.7, 51.2] },
                    { name: 'Deep Orange', rgb: [255, 140, 0], lab: [70.8, 23.4, 78.9] },
                    { name: 'Rust', rgb: [183, 65, 14], lab: [42.1, 41.8, 48.7] }
                ],
                warm: [
                    { name: 'Burnt Orange', rgb: [204, 85, 0], lab: [50.2, 35.8, 58.9] },
                    { name: 'Golden Tan', rgb: [210, 180, 140], lab: [74.8, 4.2, 23.7] },
                    { name: 'Terracotta', rgb: [204, 78, 92], lab: [47.9, 44.1, 12.8] },
                    { name: 'Warm Brown', rgb: [150, 75, 0], lab: [40.7, 21.8, 48.2] },
                    { name: 'Mustard', rgb: [255, 219, 88], lab: [87.2, -2.1, 61.8] }
                ]
            },

            winter: {
                deep: [
                    { name: 'True Red', rgb: [255, 0, 0], lab: [54.2, 80.8, 69.9] },
                    { name: 'Royal Blue', rgb: [65, 105, 225], lab: [49.8, 25.1, -74.2] },
                    { name: 'Black', rgb: [0, 0, 0], lab: [0, 0, 0] },
                    { name: 'Pure White', rgb: [255, 255, 255], lab: [100, 0, 0] },
                    { name: 'Emerald Green', rgb: [80, 200, 120], lab: [71.2, -45.8, 32.1] }
                ],
                cool: [
                    { name: 'Cool Pink', rgb: [255, 20, 147], lab: [58.7, 82.1, -14.7] },
                    { name: 'Icy Blue', rgb: [175, 238, 238], lab: [91.8, -14.2, -8.9] },
                    { name: 'Silver Gray', rgb: [192, 192, 192], lab: [78.1, 0.1, 0.2] },
                    { name: 'Cool Purple', rgb: [147, 0, 211], lab: [34.8, 67.2, -58.9] },
                    { name: 'Navy Blue', rgb: [0, 0, 128], lab: [12.9, 47.5, -64.2] }
                ]
            }
        };

        console.log('🎨 색상 팔레트 로드 완료');
    }

    /**
     * 실시간 드레이핑 시작
     */
    async startDraping(videoElement, faceDetection) {
        try {
            this.state.isActive = true;
            this.videoElement = videoElement;
            this.faceDetection = faceDetection;

            // 스킨 마스크 생성
            await this.generateSkinMask();
            
            // 렌더링 루프 시작
            this.startRenderLoop();
            
            console.log('🎥 실시간 드레이핑 시작');
        } catch (error) {
            console.error('❌ 드레이핑 시작 실패:', error);
            throw error;
        }
    }

    /**
     * 드레이핑 중지
     */
    stopDraping() {
        this.state.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        console.log('⏹️ 드레이핑 중지');
    }

    /**
     * 색상 적용
     */
    applyColor(color, season, subtype) {
        this.state.currentColor = color;
        this.state.currentSeason = season;
        
        // 색상을 정규화된 RGB로 변환
        const normalizedColor = [
            color.rgb[0] / 255.0,
            color.rgb[1] / 255.0,
            color.rgb[2] / 255.0
        ];

        this.gl.uniform3f(this.uniforms.drapingColor, ...normalizedColor);
        
        // 계절별 최적 블렌드 모드 설정
        const blendMode = this.getOptimalBlendMode(season, subtype);
        this.setBlendMode(blendMode);

        console.log(`🎨 색상 적용: ${color.name} (${season} ${subtype})`);
    }

    /**
     * 블렌드 모드 설정
     */
    setBlendMode(mode) {
        const blendModes = {
            'soft-light': 0,
            'multiply': 1,
            'overlay': 2,
            'normal': 3
        };

        this.state.blendMode = mode;
        this.gl.uniform1i(this.uniforms.blendMode, blendModes[mode] || 0);
    }

    /**
     * 투명도 설정
     */
    setOpacity(opacity) {
        this.state.opacity = Math.max(0, Math.min(1, opacity));
        this.gl.uniform1f(this.uniforms.opacity, this.state.opacity);
    }

    /**
     * 스킨 마스크 생성
     */
    async generateSkinMask() {
        if (!this.faceDetection || !this.videoElement) {
            console.warn('⚠️ 얼굴 감지 또는 비디오가 없어 스킨 마스크 생성 불가');
            return;
        }

        try {
            const faceResults = await this.faceDetection.detectFace(this.videoElement);
            
            if (!faceResults || !faceResults.landmarks) {
                console.warn('⚠️ 얼굴이 감지되지 않음');
                return;
            }

            // 스킨 영역 마스크 생성
            const maskCanvas = document.createElement('canvas');
            maskCanvas.width = this.canvas.width;
            maskCanvas.height = this.canvas.height;
            const maskCtx = maskCanvas.getContext('2d');

            // 얼굴 영역을 기반으로 마스크 생성
            this.drawSkinMask(maskCtx, faceResults.landmarks, maskCanvas.width, maskCanvas.height);

            // WebGL 텍스처로 업로드
            this.updateSkinMaskTexture(maskCanvas);

            this.state.skinROI = this.calculateSkinROI(faceResults.landmarks);
            this.state.faceDetected = true;

            console.log('🎭 스킨 마스크 생성 완료');

        } catch (error) {
            console.error('❌ 스킨 마스크 생성 실패:', error);
        }
    }

    /**
     * 스킨 마스크 그리기
     */
    drawSkinMask(ctx, landmarks, width, height) {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, width, height);

        // 얼굴 윤곽선 기반 마스크
        ctx.fillStyle = 'white';
        ctx.beginPath();

        // MediaPipe 랜드마크 기반 얼굴 영역 추출
        // 얼굴 윤곽 (FACE_OVAL)
        const faceOval = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
        
        if (landmarks.length >= 468) {
            // 얼굴 윤곽선 그리기
            faceOval.forEach((index, i) => {
                const point = landmarks[index];
                const x = point.x * width;
                const y = point.y * height;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.closePath();
            ctx.fill();

            // 이마 영역 추가
            const foreheadPoints = [9, 10, 151, 337, 299, 333, 298, 301];
            ctx.beginPath();
            foreheadPoints.forEach((index, i) => {
                const point = landmarks[index];
                const x = point.x * width;
                const y = point.y * height - 30; // 이마 영역 확장
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.closePath();
            ctx.fill();

            // 목 영역 추가
            const neckPoints = [18, 175, 199, 200, 9, 10, 151, 175];
            ctx.beginPath();
            neckPoints.forEach((index, i) => {
                const point = landmarks[index];
                const x = point.x * width;
                const y = point.y * height + 50; // 목 영역 확장
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.closePath();
            ctx.fill();
        }

        // 가장자리 소프트닝
        ctx.filter = 'blur(3px)';
        ctx.globalCompositeOperation = 'source-over';
    }

    /**
     * 렌더링 루프
     */
    startRenderLoop() {
        const render = (timestamp) => {
            if (!this.state.isActive) return;

            this.updatePerformance(timestamp);
            this.renderFrame();
            
            this.animationId = requestAnimationFrame(render);
        };

        this.animationId = requestAnimationFrame(render);
    }

    /**
     * 프레임 렌더링
     */
    renderFrame() {
        if (!this.videoElement || !this.gl || !this.program) return;

        const startTime = performance.now();

        try {
            // 비디오 텍스처 업데이트
            this.updateVideoTexture();

            // 뷰포트 설정
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);

            // 유니폼 업데이트
            this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);

            // 렌더링
            this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);

            // 성능 기록
            const renderTime = performance.now() - startTime;
            this.performance.renderTime.push(renderTime);
            if (this.performance.renderTime.length > 60) {
                this.performance.renderTime.shift();
            }

        } catch (error) {
            console.error('❌ 렌더링 오류:', error);
        }
    }

    /**
     * 비디오 텍스처 업데이트
     */
    updateVideoTexture() {
        if (!this.textures.video) {
            this.textures.video = this.gl.createTexture();
        }

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures.video);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.videoElement);
        
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

        this.gl.uniform1i(this.uniforms.image, 0);
    }

    /**
     * 스킨 마스크 텍스처 업데이트
     */
    updateSkinMaskTexture(maskCanvas) {
        if (!this.textures.skinMask) {
            this.textures.skinMask = this.gl.createTexture();
        }

        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures.skinMask);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, maskCanvas);
        
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

        this.gl.uniform1i(this.uniforms.skinMask, 1);
    }

    /**
     * Before/After 비교 모드
     */
    enableComparisonMode(mode = 'split') {
        this.comparisonMode = {
            enabled: true,
            mode: mode, // 'split', 'slider', 'toggle'
            splitRatio: 0.5
        };

        if (mode === 'split') {
            this.setupSplitComparison();
        }
        
        console.log(`🔄 비교 모드 활성화: ${mode}`);
    }

    /**
     * 분할 비교 설정
     */
    setupSplitComparison() {
        // 분할선 셰이더 수정
        const splitFragmentShader = `
            precision mediump float;
            
            uniform sampler2D u_image;
            uniform sampler2D u_skinMask;
            uniform vec3 u_drapingColor;
            uniform float u_opacity;
            uniform int u_blendMode;
            uniform vec2 u_resolution;
            uniform float u_splitRatio;
            
            varying vec2 v_texCoord;
            
            vec3 blendSoftLight(vec3 base, vec3 blend) {
                return mix(
                    sqrt(base) * (2.0 * blend - 1.0) + 2.0 * base * (1.0 - blend),
                    2.0 * base * blend + base * base * (1.0 - 2.0 * blend),
                    step(0.5, blend)
                );
            }
            
            void main() {
                vec4 originalColor = texture2D(u_image, v_texCoord);
                
                // 분할선 기준으로 처리
                if (v_texCoord.x > u_splitRatio) {
                    // 오른쪽: 드레이핑 적용
                    vec4 skinMask = texture2D(u_skinMask, v_texCoord);
                    if (skinMask.r > 0.5) {
                        vec3 result = blendSoftLight(originalColor.rgb, u_drapingColor);
                        result = mix(originalColor.rgb, result, u_opacity * skinMask.r);
                        gl_FragColor = vec4(result, originalColor.a);
                    } else {
                        gl_FragColor = originalColor;
                    }
                } else {
                    // 왼쪽: 원본
                    gl_FragColor = originalColor;
                }
                
                // 분할선 그리기
                if (abs(v_texCoord.x - u_splitRatio) < 0.002) {
                    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
                }
            }
        `;
        
        // 새 셰이더 프로그램으로 교체
        this.loadComparisonShader(splitFragmentShader);
    }

    /**
     * 색상 매칭도 실시간 분석
     */
    async analyzeSkinMatching() {
        if (!this.state.skinROI || !this.state.currentColor) {
            return { score: 0, analysis: '분석 데이터 부족' };
        }

        try {
            // 피부 영역 색상 추출
            const skinColors = await this.extractSkinColors();
            
            // Delta E 계산
            const deltaE = this.calculateColorDistance(skinColors.average, this.state.currentColor.lab);
            
            // 매칭 점수 계산 (0-100)
            const matchingScore = Math.max(0, 100 - (deltaE * 10));
            
            // 분석 결과
            const analysis = this.generateMatchingAnalysis(deltaE, matchingScore);
            
            return {
                score: matchingScore,
                deltaE: deltaE,
                analysis: analysis,
                recommendation: this.getMatchingRecommendation(matchingScore),
                skinTone: skinColors
            };

        } catch (error) {
            console.error('❌ 매칭 분석 실패:', error);
            return { score: 0, analysis: '분석 실패' };
        }
    }

    /**
     * 피부 색상 추출
     */
    async extractSkinColors() {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // 비디오 프레임 복사
        tempCtx.drawImage(this.videoElement, 0, 0, tempCanvas.width, tempCanvas.height);
        
        // ROI 영역 색상 샘플링
        const imageData = tempCtx.getImageData(
            this.state.skinROI.x,
            this.state.skinROI.y,
            this.state.skinROI.width,
            this.state.skinROI.height
        );

        const colors = [];
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 16) { // 샘플링 간격 조정
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            if (r > 50 && g > 50 && b > 50) { // 너무 어두운 픽셀 제외
                colors.push({ r, g, b });
            }
        }

        // 평균 색상 계산
        const avgColor = colors.reduce((acc, color) => {
            acc.r += color.r;
            acc.g += color.g;
            acc.b += color.b;
            return acc;
        }, { r: 0, g: 0, b: 0 });

        avgColor.r = Math.round(avgColor.r / colors.length);
        avgColor.g = Math.round(avgColor.g / colors.length);
        avgColor.b = Math.round(avgColor.b / colors.length);

        return {
            average: avgColor,
            samples: colors.length,
            variance: this.calculateColorVariance(colors, avgColor)
        };
    }

    /**
     * 계절별 최적 블렌드 모드
     */
    getOptimalBlendMode(season, subtype) {
        const blendModeMap = {
            spring: {
                bright: 'soft-light',
                light: 'overlay',
                warm: 'multiply'
            },
            summer: {
                light: 'soft-light',
                soft: 'overlay',
                cool: 'soft-light'
            },
            autumn: {
                deep: 'multiply',
                warm: 'overlay',
                soft: 'soft-light'
            },
            winter: {
                deep: 'multiply',
                cool: 'overlay',
                clear: 'soft-light'
            }
        };

        return blendModeMap[season]?.[subtype] || 'soft-light';
    }

    /**
     * 스킨 ROI 계산
     */
    calculateSkinROI(landmarks) {
        if (!landmarks || landmarks.length < 468) {
            return null;
        }

        // 얼굴 주요 포인트들로 ROI 계산
        const leftCheek = landmarks[116]; // 왼쪽 볼
        const rightCheek = landmarks[345]; // 오른쪽 볼
        const forehead = landmarks[9]; // 이마 중앙
        const chin = landmarks[175]; // 턱

        const minX = Math.min(leftCheek.x, rightCheek.x) * this.canvas.width;
        const maxX = Math.max(leftCheek.x, rightCheek.x) * this.canvas.width;
        const minY = forehead.y * this.canvas.height;
        const maxY = chin.y * this.canvas.height;

        return {
            x: Math.max(0, minX - 20),
            y: Math.max(0, minY - 20),
            width: Math.min(this.canvas.width - minX, maxX - minX + 40),
            height: Math.min(this.canvas.height - minY, maxY - minY + 40)
        };
    }

    /**
     * 색상 거리 계산 (Delta E 2000)
     */
    calculateColorDistance(rgb1, lab2) {
        // RGB를 LAB으로 변환
        const lab1 = this.rgbToLab(rgb1.r, rgb1.g, rgb1.b);
        
        // Delta E 2000 계산 (간단한 근사치)
        const deltaL = lab1.l - lab2[0];
        const deltaA = lab1.a - lab2[1];
        const deltaB = lab1.b - lab2[2];
        
        return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
    }

    /**
     * RGB를 LAB으로 변환
     */
    rgbToLab(r, g, b) {
        // 간단한 RGB -> LAB 변환 (정확한 구현은 ColorSystem.js 사용)
        const rNorm = r / 255;
        const gNorm = g / 255;
        const bNorm = b / 255;
        
        // 근사 변환
        const l = 0.2126 * rNorm + 0.7152 * gNorm + 0.0722 * bNorm;
        const a = (rNorm - gNorm) * 128;
        const b_lab = (gNorm - bNorm) * 128;
        
        return { l: l * 100, a: a, b: b_lab };
    }

    /**
     * 매칭 분석 생성
     */
    generateMatchingAnalysis(deltaE, score) {
        if (score >= 80) {
            return '매우 잘 어울리는 색상입니다';
        } else if (score >= 60) {
            return '잘 어울리는 색상입니다';
        } else if (score >= 40) {
            return '보통 수준으로 어울립니다';
        } else if (score >= 20) {
            return '약간 어울리지 않는 색상입니다';
        } else {
            return '잘 어울리지 않는 색상입니다';
        }
    }

    /**
     * 매칭 추천 생성
     */
    getMatchingRecommendation(score) {
        if (score >= 80) {
            return '이 색상을 적극 추천합니다!';
        } else if (score >= 60) {
            return '이 색상을 추천합니다';
        } else if (score >= 40) {
            return '다른 색상도 고려해보세요';
        } else {
            return '더 적합한 색상을 찾아보세요';
        }
    }

    /**
     * 셰이더 생성 유틸리티
     */
    async createShaderProgram(vertexSource, fragmentSource) {
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource);
        
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            const error = this.gl.getProgramInfoLog(program);
            console.error('셰이더 프로그램 링크 오류:', error);
            throw new Error(`셰이더 프로그램 링크 실패: ${error}`);
        }
        
        return program;
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            const error = this.gl.getShaderInfoLog(shader);
            console.error('셰이더 컴파일 오류:', error);
            this.gl.deleteShader(shader);
            throw new Error(`셰이더 컴파일 실패: ${error}`);
        }
        
        return shader;
    }

    /**
     * 성능 모니터링
     */
    updatePerformance(timestamp) {
        this.performance.frameCount++;
        
        if (this.performance.lastFrameTime) {
            const delta = timestamp - this.performance.lastFrameTime;
            const fps = 1000 / delta;
            
            // 이동 평균으로 FPS 계산
            this.performance.averageFPS = (this.performance.averageFPS * 0.9) + (fps * 0.1);
        }
        
        this.performance.lastFrameTime = timestamp;
    }

    /**
     * Canvas 2D 폴백
     */
    fallbackToCanvas2D() {
        console.warn('⚠️ WebGL을 사용할 수 없어 Canvas 2D로 폴백');
        this.useCanvas2D = true;
        this.ctx2d = this.canvas.getContext('2d');
    }

    /**
     * Canvas 2D 렌더링
     */
    renderCanvas2D() {
        if (!this.ctx2d || !this.videoElement) return;

        // 비디오 그리기
        this.ctx2d.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);

        // 간단한 색상 오버레이
        if (this.state.currentColor && this.state.skinROI) {
            this.ctx2d.globalCompositeOperation = 'multiply';
            this.ctx2d.globalAlpha = this.state.opacity;
            this.ctx2d.fillStyle = `rgb(${this.state.currentColor.rgb.join(',')})`;
            this.ctx2d.fillRect(
                this.state.skinROI.x,
                this.state.skinROI.y,
                this.state.skinROI.width,
                this.state.skinROI.height
            );
            this.ctx2d.globalAlpha = 1;
            this.ctx2d.globalCompositeOperation = 'source-over';
        }
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 색상 변경 이벤트
        document.addEventListener('colorSelected', (event) => {
            const { color, season, subtype } = event.detail;
            this.applyColor(color, season, subtype);
        });

        // 투명도 조절 이벤트
        document.addEventListener('opacityChanged', (event) => {
            this.setOpacity(event.detail.opacity);
        });

        // 블렌드 모드 변경 이벤트
        document.addEventListener('blendModeChanged', (event) => {
            this.setBlendMode(event.detail.mode);
        });

        // 비교 모드 이벤트
        document.addEventListener('comparisonModeChanged', (event) => {
            this.enableComparisonMode(event.detail.mode);
        });
    }

    /**
     * 리소스 정리
     */
    cleanup() {
        this.stopDraping();
        
        if (this.gl) {
            // 텍스처 정리
            Object.values(this.textures).forEach(texture => {
                if (texture) {
                    this.gl.deleteTexture(texture);
                }
            });

            // 버퍼 정리
            Object.values(this.buffers).forEach(buffer => {
                if (buffer) {
                    this.gl.deleteBuffer(buffer);
                }
            });

            // 프로그램 정리
            if (this.program) {
                this.gl.deleteProgram(this.program);
            }
        }

        // 캐시 정리
        this.reportCache?.clear();
        
        console.log('🧹 VirtualDraping 리소스 정리 완료');
    }

    /**
     * 성능 통계 반환
     */
    getPerformanceStats() {
        const avgRenderTime = this.performance.renderTime.length > 0 
            ? this.performance.renderTime.reduce((a, b) => a + b, 0) / this.performance.renderTime.length 
            : 0;

        return {
            fps: Math.round(this.performance.averageFPS),
            frameCount: this.performance.frameCount,
            averageRenderTime: avgRenderTime.toFixed(2),
            webglEnabled: !!this.gl,
            activeDraping: this.state.isActive
        };
    }
}

// 전역 객체로 등록
if (typeof window !== 'undefined') {
    window.VirtualDraping = VirtualDraping;
}

// 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VirtualDraping;
}

export default VirtualDraping;
