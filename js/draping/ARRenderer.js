/**
 * ARRenderer.js - AR 렌더링 시스템
 * 
 * 실시간 가상 드레이핑을 위한 WebGL 기반 AR 렌더러
 * 얼굴 감지 + 색상 오버레이 + 실시간 렌더링
 */

class ARRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = null;
        this.program = null;
        this.video = null;
        
        this.overlayTextures = new Map();
        this.faceDetector = null;
        this.isRendering = false;
        this.animationFrame = null;
        
        this.renderSettings = {
            opacity: 0.6,
            blendMode: 'multiply',
            colorIntensity: 0.8,
            smoothing: 0.3
        };

        this.shaders = {
            vertex: `
                attribute vec2 a_position;
                attribute vec2 a_texCoord;
                
                uniform vec2 u_resolution;
                
                varying vec2 v_texCoord;
                
                void main() {
                    vec2 zeroToOne = a_position / u_resolution;
                    vec2 zeroToTwo = zeroToOne * 2.0;
                    vec2 clipSpace = zeroToTwo - 1.0;
                    
                    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
                    v_texCoord = a_texCoord;
                }
            `,
            fragment: `
                precision mediump float;
                
                uniform sampler2D u_video;
                uniform sampler2D u_overlay;
                uniform float u_opacity;
                uniform vec3 u_color;
                uniform float u_blend;
                uniform vec2 u_facePosition;
                uniform vec2 u_faceSize;
                
                varying vec2 v_texCoord;
                
                void main() {
                    vec4 videoColor = texture2D(u_video, v_texCoord);
                    vec4 overlayColor = texture2D(u_overlay, v_texCoord);
                    
                    // 얼굴 영역 마스킹
                    vec2 faceCenter = u_facePosition;
                    vec2 faceHalfSize = u_faceSize * 0.5;
                    
                    vec2 faceUV = (v_texCoord - faceCenter + faceHalfSize) / u_faceSize;
                    float faceMask = 1.0;
                    
                    if (faceUV.x >= 0.0 && faceUV.x <= 1.0 && 
                        faceUV.y >= 0.0 && faceUV.y <= 1.0) {
                        
                        // 타원형 마스크
                        vec2 centered = (faceUV - 0.5) * 2.0;
                        float dist = length(centered);
                        faceMask = smoothstep(1.2, 0.8, dist);
                    } else {
                        faceMask = 0.0;
                    }
                    
                    // 색상 블렌딩
                    vec3 blendedColor = mix(
                        videoColor.rgb,
                        videoColor.rgb * u_color * overlayColor.rgb,
                        faceMask * u_opacity * u_blend
                    );
                    
                    gl_FragColor = vec4(blendedColor, videoColor.a);
                }
            `
        };

        this.init();
    }

    /**
     * 시스템 초기화
     */
    async init() {
        try {
            // WebGL 컨텍스트 초기화
            this.initWebGL();
            
            // 셰이더 프로그램 생성
            this.createShaderProgram();
            
            // 버퍼 설정
            this.setupBuffers();
            
            // 얼굴 감지기 초기화
            await this.initFaceDetection();
            
            console.log('✅ AR 렌더러 초기화 완료');
            
        } catch (error) {
            console.error('❌ AR 렌더러 초기화 실패:', error);
            throw error;
        }
    }

    /**
     * WebGL 컨텍스트 초기화
     */
    initWebGL() {
        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        
        if (!this.gl) {
            throw new Error('WebGL을 지원하지 않는 브라우저입니다.');
        }

        // WebGL 설정
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.clearColor(0, 0, 0, 0);
    }

    /**
     * 셰이더 프로그램 생성
     */
    createShaderProgram() {
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, this.shaders.vertex);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, this.shaders.fragment);
        
        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, vertexShader);
        this.gl.attachShader(this.program, fragmentShader);
        this.gl.linkProgram(this.program);
        
        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            throw new Error('셰이더 프로그램 링크 실패: ' + this.gl.getProgramInfoLog(this.program));
        }
        
        // 속성 및 유니폼 위치 가져오기
        this.attributes = {
            position: this.gl.getAttribLocation(this.program, 'a_position'),
            texCoord: this.gl.getAttribLocation(this.program, 'a_texCoord')
        };
        
        this.uniforms = {
            resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
            video: this.gl.getUniformLocation(this.program, 'u_video'),
            overlay: this.gl.getUniformLocation(this.program, 'u_overlay'),
            opacity: this.gl.getUniformLocation(this.program, 'u_opacity'),
            color: this.gl.getUniformLocation(this.program, 'u_color'),
            blend: this.gl.getUniformLocation(this.program, 'u_blend'),
            facePosition: this.gl.getUniformLocation(this.program, 'u_facePosition'),
            faceSize: this.gl.getUniformLocation(this.program, 'u_faceSize')
        };
    }

    /**
     * 개별 셰이더 생성
     */
    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            throw new Error('셰이더 컴파일 실패: ' + this.gl.getShaderInfoLog(shader));
        }
        
        return shader;
    }

    /**
     * 버퍼 설정
     */
    setupBuffers() {
        // 정점 버퍼
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        
        const positions = new Float32Array([
            0, 0,
            this.canvas.width, 0,
            0, this.canvas.height,
            0, this.canvas.height,
            this.canvas.width, 0,
            this.canvas.width, this.canvas.height
        ]);
        
        this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
        
        // 텍스처 좌표 버퍼
        this.texCoordBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
        
        const texCoords = new Float32Array([
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            0.0, 1.0,
            1.0, 0.0,
            1.0, 1.0
        ]);
        
        this.gl.bufferData(this.gl.ARRAY_BUFFER, texCoords, this.gl.STATIC_DRAW);
    }

    /**
     * 얼굴 감지 초기화
     */
    async initFaceDetection() {
        if (window.FaceDetection) {
            this.faceDetector = new window.FaceDetection();
            await this.faceDetector.initialize();
        }
    }

    /**
     * 비디오 스트림 설정
     */
    async setupVideo(videoElement) {
        this.video = videoElement;
        
        // 비디오 텍스처 생성
        this.videoTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.videoTexture);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    }

    /**
     * 오버레이 색상 설정
     */
    setOverlayColor(r, g, b) {
        this.currentColor = [r / 255, g / 255, b / 255];
    }

    /**
     * 렌더링 시작
     */
    startRendering() {
        if (this.isRendering) return;
        
        this.isRendering = true;
        this.renderLoop();
    }

    /**
     * 렌더링 중지
     */
    stopRendering() {
        this.isRendering = false;
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    /**
     * 렌더링 루프
     */
    renderLoop() {
        if (!this.isRendering) return;
        
        this.render();
        this.animationFrame = requestAnimationFrame(() => this.renderLoop());
    }

    /**
     * 단일 프레임 렌더링
     */
    async render() {
        if (!this.video || !this.gl) return;
        
        try {
            // 캔버스 크기 조정
            this.resizeCanvas();
            
            // WebGL 뷰포트 설정
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
            
            // 셰이더 프로그램 사용
            this.gl.useProgram(this.program);
            
            // 비디오 텍스처 업데이트
            this.updateVideoTexture();
            
            // 얼굴 감지 실행
            const faceData = await this.detectFace();
            
            // 유니폼 설정
            this.setUniforms(faceData);
            
            // 버퍼 바인딩 및 그리기
            this.bindBuffersAndDraw();
            
        } catch (error) {
            console.error('렌더링 오류:', error);
        }
    }

    /**
     * 캔버스 크기 조정
     */
    resizeCanvas() {
        if (this.video && (this.canvas.width !== this.video.videoWidth || 
                          this.canvas.height !== this.video.videoHeight)) {
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
        }
    }

    /**
     * 비디오 텍스처 업데이트
     */
    updateVideoTexture() {
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.videoTexture);
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.RGBA,
            this.gl.RGBA,
            this.gl.UNSIGNED_BYTE,
            this.video
        );
    }

    /**
     * 얼굴 감지 실행
     */
    async detectFace() {
        if (!this.faceDetector) {
            return {
                position: [0.5, 0.5],
                size: [0.3, 0.4],
                confidence: 0
            };
        }
        
        try {
            const results = await this.faceDetector.detectFaces(this.video);
            
            if (results && results.length > 0) {
                const face = results[0];
                return {
                    position: [face.x + face.width / 2, face.y + face.height / 2],
                    size: [face.width, face.height],
                    confidence: face.confidence || 1.0
                };
            }
        } catch (error) {
            console.warn('얼굴 감지 실패:', error);
        }
        
        return {
            position: [0.5, 0.5],
            size: [0.3, 0.4],
            confidence: 0
        };
    }

    /**
     * 유니폼 변수 설정
     */
    setUniforms(faceData) {
        // 해상도
        this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
        
        // 텍스처
        this.gl.uniform1i(this.uniforms.video, 0);
        this.gl.uniform1i(this.uniforms.overlay, 1);
        
        // 색상 및 블렌딩
        if (this.currentColor) {
            this.gl.uniform3fv(this.uniforms.color, this.currentColor);
        } else {
            this.gl.uniform3f(this.uniforms.color, 1.0, 0.8, 0.6); // 기본 웜톤
        }
        
        this.gl.uniform1f(this.uniforms.opacity, this.renderSettings.opacity);
        this.gl.uniform1f(this.uniforms.blend, this.renderSettings.colorIntensity);
        
        // 얼굴 데이터
        this.gl.uniform2fv(this.uniforms.facePosition, faceData.position);
        this.gl.uniform2fv(this.uniforms.faceSize, faceData.size);
    }

    /**
     * 버퍼 바인딩 및 그리기
     */
    bindBuffersAndDraw() {
        // 위치 속성
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.enableVertexAttribArray(this.attributes.position);
        this.gl.vertexAttribPointer(this.attributes.position, 2, this.gl.FLOAT, false, 0, 0);
        
        // 텍스처 좌표 속성
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
        this.gl.enableVertexAttribArray(this.attributes.texCoord);
        this.gl.vertexAttribPointer(this.attributes.texCoord, 2, this.gl.FLOAT, false, 0, 0);
        
        // 그리기
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }

    /**
     * 렌더링 설정 업데이트
     */
    updateSettings(settings) {
        Object.assign(this.renderSettings, settings);
    }

    /**
     * 스크린샷 캡처
     */
    captureFrame() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = this.canvas.width;
        canvas.height = this.canvas.height;
        
        ctx.drawImage(this.canvas, 0, 0);
        
        return canvas.toDataURL('image/jpeg', 0.9);
    }

    /**
     * 리소스 정리
     */
    dispose() {
        this.stopRendering();
        
        if (this.gl) {
            // 텍스처 정리
            if (this.videoTexture) {
                this.gl.deleteTexture(this.videoTexture);
            }
            
            // 버퍼 정리
            if (this.positionBuffer) {
                this.gl.deleteBuffer(this.positionBuffer);
            }
            
            if (this.texCoordBuffer) {
                this.gl.deleteBuffer(this.texCoordBuffer);
            }
            
            // 프로그램 정리
            if (this.program) {
                this.gl.deleteProgram(this.program);
            }
        }
        
        console.log('✅ AR 렌더러 리소스 정리 완료');
    }
}

// 전역 접근을 위한 설정
if (typeof window !== 'undefined') {
    window.ARRenderer = ARRenderer;
}

// 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ARRenderer;
}
