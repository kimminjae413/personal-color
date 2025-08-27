/**
 * app.js - 퍼스널컬러 진단 시스템 메인 애플리케이션
 * 전문가 노하우와 과학적 분석을 결합한 실제 진단 시스템
 */

class PersonalColorDiagnosisApp {
    constructor() {
        this.expert = null;
        this.currentMode = null;
        this.faceDetector = null;
        this.colorAnalyzer = null;
        this.hairProducts = null;
        this.currentClient = null;
        this.clientCounter = parseInt(localStorage.getItem('clientCounter') || '0');
        
        this.init();
    }
    
    async init() {
        try {
            // 전문가 시스템 초기화
            this.expert = new PersonalColorExpert();
            
            // MediaPipe 얼굴 인식 초기화 (비동기)
            this.faceDetector = new FaceDetector();
            await this.faceDetector.initialize();
            
            // 색상 분석 시스템 초기화
            this.colorAnalyzer = new ColorAnalyzer();
            
            // 헤어 제품 데이터베이스 초기화
            this.hairProducts = new HairProductDatabase();
            
            // UI 이벤트 리스너 설정
            this.setupEventListeners();
            
            // 초기 상태 설정
            this.updateClientCounter();
            
            console.log('퍼스널컬러 진단 시스템이 성공적으로 초기화되었습니다.');
        } catch (error) {
            console.error('초기화 실패:', error);
            this.showToast('시스템 초기화에 실패했습니다. 새로고침 후 다시 시도해주세요.', 'error');
        }
    }
    
    setupEventListeners() {
        // 메인 모드 선택
        const aiModeBtn = document.getElementById('ai-diagnosis-btn');
        const drapingModeBtn = document.getElementById('draping-diagnosis-btn');
        
        if (aiModeBtn) {
            aiModeBtn.addEventListener('click', () => this.startAIDiagnosis());
        }
        
        if (drapingModeBtn) {
            drapingModeBtn.addEventListener('click', () => this.startDrapingDiagnosis());
        }
        
        // AI 모드 컨트롤
        const startCameraBtn = document.getElementById('start-camera-btn');
        const captureFaceBtn = document.getElementById('capture-face-btn');
        const analyzeFaceBtn = document.getElementById('analyze-face-btn');
        
        if (startCameraBtn) {
            startCameraBtn.addEventListener('click', () => this.startCamera());
        }
        
        if (captureFaceBtn) {
            captureFaceBtn.addEventListener('click', () => this.captureAndAnalyze());
        }
        
        if (analyzeFaceBtn) {
            analyzeFaceBtn.addEventListener('click', () => this.performAIAnalysis());
        }
        
        // 드래이핑 모드 컨트롤
        const uploadPhotoBtn = document.getElementById('upload-photo-btn');
        const photoInput = document.getElementById('photo-input');
        
        if (uploadPhotoBtn) {
            uploadPhotoBtn.addEventListener('click', () => photoInput?.click());
        }
        
        if (photoInput) {
            photoInput.addEventListener('change', (e) => this.handlePhotoUpload(e));
        }
        
        // 계절 팔레트 버튼들
        ['spring', 'summer', 'autumn', 'winter'].forEach(season => {
            const btns = document.querySelectorAll(`[data-season="${season}"]`);
            btns.forEach(btn => {
                btn.addEventListener('click', () => this.applySeasonPalette(season));
            });
        });
        
        // 결과 저장/리셋 버튼
        const saveResultBtn = document.getElementById('save-result-btn');
        const resetBtn = document.getElementById('reset-btn');
        
        if (saveResultBtn) {
            saveResultBtn.addEventListener('click', () => this.saveResult());
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetDiagnosis());
        }
        
        // 키보드 단축키
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // 실시간 색상 비교 (드래이핑 모드)
        const colorComparisonBtns = document.querySelectorAll('.color-comparison-btn');
        colorComparisonBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.compareColor(e.target.dataset.color));
        });
    }
    
    // AI 진단 모드 시작
    async startAIDiagnosis() {
        this.currentMode = 'ai';
        this.showSection('ai-diagnosis-section');
        this.hideSection('main-selection');
        this.hideSection('draping-diagnosis-section');
        
        // 새 고객 카운터 증가
        this.incrementClientCounter();
        
        this.showToast('AI 퍼스널컬러 진단을 시작합니다.', 'info');
    }
    
    // 드래이핑 진단 모드 시작
    startDrapingDiagnosis() {
        this.currentMode = 'draping';
        this.showSection('draping-diagnosis-section');
        this.hideSection('main-selection');
        this.hideSection('ai-diagnosis-section');
        
        // 새 고객 카운터 증가
        this.incrementClientCounter();
        
        this.showToast('전문가 드래이핑 진단을 시작합니다.', 'info');
    }
    
    // 카메라 시작 (AI 모드)
    async startCamera() {
        try {
            const video = document.getElementById('camera-video');
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                } 
            });
            
            video.srcObject = stream;
            await video.play();
            
            // MediaPipe 얼굴 인식 시작
            await this.faceDetector.startDetection(video);
            
            // UI 업데이트
            document.getElementById('start-camera-btn').style.display = 'none';
            document.getElementById('capture-face-btn').style.display = 'inline-block';
            
            this.showToast('카메라가 시작되었습니다. 얼굴을 정면으로 보고 촬영해주세요.', 'success');
        } catch (error) {
            console.error('카메라 시작 실패:', error);
            this.showToast('카메라 접근에 실패했습니다. 권한을 확인해주세요.', 'error');
        }
    }
    
    // 얼굴 캡처 및 분석 (AI 모드)
    async captureAndAnalyze() {
        try {
            this.showToast('얼굴을 캡처하고 분석을 시작합니다...', 'info');
            this.showProgressBar();
            
            // 1단계: 얼굴 캡처
            this.updateProgress(25, '얼굴 캡처 중...');
            const faceData = await this.faceDetector.captureFace();
            
            if (!faceData) {
                throw new Error('얼굴이 감지되지 않았습니다.');
            }
            
            // 2단계: 피부 영역 추출
            this.updateProgress(50, '피부 색상 분석 중...');
            const skinColors = await this.colorAnalyzer.extractSkinColors(faceData);
            
            // 3단계: 색상 분석
            this.updateProgress(75, '퍼스널컬러 분석 중...');
            const colorAnalysis = await this.colorAnalyzer.analyzePersonalColor(skinColors);
            
            // 4단계: 전문가 시스템 적용
            this.updateProgress(100, '최종 진단 생성 중...');
            const expertDiagnosis = this.expert.comprehensiveDiagnosis(
                colorAnalysis.dominantSkinColor,
                colorAnalysis.eyeColor,
                colorAnalysis.hairColor,
                {
                    foundation: colorAnalysis.foundationMatch,
                    skinCondition: this.detectSkinCondition(colorAnalysis),
                    lighting: this.getCurrentLighting()
                }
            );
            
            // 결과 표시
            await this.displayAIResult(expertDiagnosis, colorAnalysis);
            
            this.hideProgressBar();
            this.showToast('AI 분석이 완료되었습니다!', 'success');
            
        } catch (error) {
            console.error('분석 실패:', error);
            this.hideProgressBar();
            this.showToast(`분석에 실패했습니다: ${error.message}`, 'error');
        }
    }
    
    // 사진 업로드 처리 (드래이핑 모드)
    async handlePhotoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            this.showToast('사진을 업로드하고 있습니다...', 'info');
            
            const imageUrl = await this.loadImage(file);
            const drapingCanvas = document.getElementById('draping-canvas');
            const ctx = drapingCanvas.getContext('2d');
            
            const img = new Image();
            img.onload = () => {
                // 캔버스 크기 설정
                drapingCanvas.width = 400;
                drapingCanvas.height = 500;
                
                // 이미지 그리기
                ctx.drawImage(img, 0, 0, 400, 500);
                
                // 드래이핑 오버레이 활성화
                this.enableDrapingMode();
                this.showToast('사진이 업로드되었습니다. 계절별 색상을 테스트해보세요.', 'success');
            };
            img.src = imageUrl;
            
        } catch (error) {
            console.error('사진 업로드 실패:', error);
            this.showToast('사진 업로드에 실패했습니다.', 'error');
        }
    }
    
    // 계절 팔레트 적용 (드래이핑 모드)
    applySeasonPalette(season) {
        try {
            const canvas = document.getElementById('draping-canvas');
            const overlay = document.getElementById('draping-overlay');
            
            if (!canvas || !overlay) return;
            
            // 계절별 색상 적용
            const seasonColors = this.getSeasonColors(season);
            overlay.style.background = this.createGradient(seasonColors);
            overlay.style.opacity = '0.3';
            overlay.style.display = 'block';
            
            // 실시간 분석 결과 업데이트
            this.updateDrapingAnalysis(season, seasonColors);
            
            this.showToast(`${this.getSeasonName(season)} 팔레트가 적용되었습니다.`, 'info');
        } catch (error) {
            console.error('팔레트 적용 실패:', error);
        }
    }
    
    // 색상 비교 (드래이핑 모드)
    compareColor(colorData) {
        try {
            const comparison = this.colorAnalyzer.compareWithSkinTone(colorData);
            const resultDiv = document.getElementById('color-comparison-result');
            
            if (resultDiv) {
                resultDiv.innerHTML = `
                    <div class="comparison-result">
                        <h4>색상 적합도 분석</h4>
                        <div class="compatibility-score">
                            <span>적합도: ${Math.round(comparison.compatibility * 100)}%</span>
                            <div class="score-bar">
                                <div class="score-fill" style="width: ${comparison.compatibility * 100}%"></div>
                            </div>
                        </div>
                        <p class="analysis-text">${comparison.analysis}</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('색상 비교 실패:', error);
        }
    }
    
    // AI 분석 결과 표시
    async displayAIResult(diagnosis, colorAnalysis) {
        const resultSection = document.getElementById('ai-result-section');
        const resultContent = document.getElementById('ai-result-content');
        
        if (!resultSection || !resultContent) return;
        
        // 결과 HTML 생성
        const resultHTML = `
            <div class="diagnosis-result">
                <h3>AI 퍼스널컬러 진단 결과</h3>
                
                <div class="primary-result">
                    <h4>${diagnosis.primaryType.toUpperCase()} 타입</h4>
                    <div class="confidence-badge">${Math.round(diagnosis.confidence * 100)}% 신뢰도</div>
                </div>
                
                <div class="color-analysis">
                    <h5>색상 분석 데이터</h5>
                    <div class="color-data">
                        <div class="skin-color">
                            <span>피부색 RGB: ${colorAnalysis.dominantSkinColor}</span>
                        </div>
                        <div class="lab-values">
                            <span>LAB 값: ${colorAnalysis.labValues}</span>
                        </div>
                        <div class="delta-e">
                            <span>Delta E: ${colorAnalysis.deltaE}</span>
                        </div>
                    </div>
                </div>
                
                <div class="expert-adjustments">
                    <h5>전문가 노하우 적용</h5>
                    <div class="adjustments-list">
                        ${diagnosis.adjustments.map(adj => `
                            <div class="adjustment-item">
                                <strong>${adj.source.toUpperCase()}</strong>: ${adj.type}
                                ${adj.reason ? `<br><small>${adj.reason}</small>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="hair-recommendations">
                    <h5>추천 헤어컬러</h5>
                    <div class="color-grid">
                        ${diagnosis.recommendation.primaryColors.map(color => `
                            <div class="color-item">
                                <div class="color-swatch" style="background-color: ${this.getColorCode(color)}"></div>
                                <span>${this.getColorName(color)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="product-recommendations">
                    <h5>브랜드별 제품 추천</h5>
                    <div class="products-list">
                        ${await this.generateProductList(diagnosis.primaryType, diagnosis.adjustments)}
                    </div>
                </div>
                
                <div class="techniques">
                    <h5>추천 시술 기법</h5>
                    <div class="techniques-list">
                        ${diagnosis.recommendation.techniques.map(tech => `
                            <span class="technique-tag">${this.getTechniqueName(tech)}</span>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        resultContent.innerHTML = resultHTML;
        resultSection.style.display = 'block';
        
        // 스크롤 이동
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // 제품 목록 생성
    async generateProductList(season, adjustments) {
        const products = this.expert.recommendProducts(season, adjustments);
        const productDetails = await this.hairProducts.getProductDetails(products);
        
        return productDetails.map(product => `
            <div class="product-item">
                <div class="brand-logo">${product.brand}</div>
                <div class="product-info">
                    <h6>${product.name}</h6>
                    <p>컬러코드: ${product.code}</p>
                    <div class="cmyk-values">
                        CMYK: ${product.cmyk.c}/${product.cmyk.m}/${product.cmyk.y}/${product.cmyk.k}
                    </div>
                </div>
                <div class="confidence">${Math.round(product.confidence * 100)}%</div>
            </div>
        `).join('');
    }
    
    // 결과 저장
    saveResult() {
        try {
            const resultData = {
                timestamp: new Date().toISOString(),
                clientId: this.clientCounter,
                mode: this.currentMode,
                result: this.getCurrentResult()
            };
            
            // 로컬 스토리지에 저장
            const savedResults = JSON.parse(localStorage.getItem('diagnosisResults') || '[]');
            savedResults.push(resultData);
            localStorage.setItem('diagnosisResults', JSON.stringify(savedResults));
            
            this.showToast('진단 결과가 저장되었습니다.', 'success');
        } catch (error) {
            console.error('저장 실패:', error);
            this.showToast('결과 저장에 실패했습니다.', 'error');
        }
    }
    
    // 진단 리셋
    resetDiagnosis() {
        try {
            // 비디오 스트림 정리
            const video = document.getElementById('camera-video');
            if (video && video.srcObject) {
                const tracks = video.srcObject.getTracks();
                tracks.forEach(track => track.stop());
                video.srcObject = null;
            }
            
            // UI 리셋
            this.hideAllSections();
            this.showSection('main-selection');
            
            // 상태 리셋
            this.currentMode = null;
            this.currentClient = null;
            
            // 캔버스 클리어
            const canvases = document.querySelectorAll('canvas');
            canvases.forEach(canvas => {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            });
            
            this.showToast('진단이 초기화되었습니다.', 'info');
        } catch (error) {
            console.error('리셋 실패:', error);
        }
    }
    
    // 키보드 단축키 처리
    handleKeyboardShortcuts(event) {
        if (event.ctrlKey) {
            switch(event.key) {
                case '1':
                    event.preventDefault();
                    this.applySeasonPalette('spring');
                    break;
                case '2':
                    event.preventDefault();
                    this.applySeasonPalette('summer');
                    break;
                case '3':
                    event.preventDefault();
                    this.applySeasonPalette('autumn');
                    break;
                case '4':
                    event.preventDefault();
                    this.applySeasonPalette('winter');
                    break;
                case 's':
                    event.preventDefault();
                    this.saveResult();
                    break;
                case 'r':
                    event.preventDefault();
                    this.resetDiagnosis();
                    break;
            }
        }
    }
    
    // 유틸리티 함수들
    showSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) section.style.display = 'block';
    }
    
    hideSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) section.style.display = 'none';
    }
    
    hideAllSections() {
        const sections = ['main-selection', 'ai-diagnosis-section', 'draping-diagnosis-section', 'ai-result-section'];
        sections.forEach(id => this.hideSection(id));
    }
    
    showProgressBar() {
        const progressBar = document.getElementById('progress-container');
        if (progressBar) progressBar.style.display = 'block';
    }
    
    hideProgressBar() {
        const progressBar = document.getElementById('progress-container');
        if (progressBar) progressBar.style.display = 'none';
    }
    
    updateProgress(percentage, text) {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        if (progressFill) progressFill.style.width = `${percentage}%`;
        if (progressText) progressText.textContent = text;
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // 애니메이션
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }
    
    incrementClientCounter() {
        this.clientCounter++;
        localStorage.setItem('clientCounter', this.clientCounter.toString());
        this.updateClientCounter();
    }
    
    updateClientCounter() {
        const counter = document.getElementById('client-counter');
        if (counter) {
            counter.textContent = `오늘 진단 고객: ${this.clientCounter}명`;
        }
    }
    
    // 색상 관련 유틸리티
    getSeasonColors(season) {
        const colors = {
            spring: ['#FFE4B5', '#F0E68C', '#FF7F50', '#FF6347'],
            summer: ['#E6E6FA', '#B0C4DE', '#F0F8FF', '#D8BFD8'],
            autumn: ['#D2691E', '#CD853F', '#A0522D', '#8B4513'],
            winter: ['#000000', '#800080', '#4B0082', '#FF1493']
        };
        return colors[season] || colors.spring;
    }
    
    getSeasonName(season) {
        const names = {
            spring: '봄',
            summer: '여름',
            autumn: '가을',
            winter: '겨울'
        };
        return names[season] || season;
    }
    
    createGradient(colors) {
        return `linear-gradient(45deg, ${colors.join(', ')})`;
    }
    
    getColorCode(colorName) {
        const colorCodes = {
            'golden_blonde': '#F4D03F',
            'ash_brown': '#8B7D6B',
            'copper': '#B87333',
            'platinum': '#E5E4E2',
            'black': '#000000',
            'deep_brown': '#654321'
        };
        return colorCodes[colorName] || '#888888';
    }
    
    getColorName(colorKey) {
        const names = {
            'golden_blonde': '골든 블론드',
            'ash_brown': '애쉬 브라운',
            'copper': '코퍼',
            'platinum': '플래티넘',
            'black': '블랙',
            'deep_brown': '딥 브라운'
        };
        return names[colorKey] || colorKey;
    }
    
    getTechniqueName(techKey) {
        const names = {
            'ombre': '옴브레',
            'balayage': '발레아주',
            'clear_contrast': '클리어 컨트라스트',
            'soft_gradation': '소프트 그라데이션'
        };
        return names[techKey] || techKey;
    }
    
    async loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    detectSkinCondition(colorAnalysis) {
        // 간단한 피부 상태 감지 로직
        const { r, g, b } = colorAnalysis.dominantSkinColor;
        
        if (r > g && r > b && r - g > 30) return 'redness';
        if (g > r && g > b) return 'yellowish';
        if (r < 150 && g < 150 && b < 150) return 'pale';
        
        return 'normal';
    }
    
    getCurrentLighting() {
        // 간단한 조명 감지 (실제로는 더 복잡한 로직 필요)
        const hour = new Date().getHours();
        if (hour >= 9 && hour <= 17) return 'natural';
        return 'artificial';
    }
    
    getCurrentResult() {
        // 현재 진단 결과 반환
        if (this.currentMode === 'ai') {
            return document.getElementById('ai-result-content')?.innerHTML || '';
        } else if (this.currentMode === 'draping') {
            return document.getElementById('draping-result')?.innerHTML || '';
        }
        return '';
    }
    
    enableDrapingMode() {
        const controls = document.getElementById('draping-controls');
        if (controls) {
            controls.style.display = 'block';
        }
    }
    
    updateDrapingAnalysis(season, colors) {
        const analysisDiv = document.getElementById('draping-analysis');
        if (analysisDiv) {
            analysisDiv.innerHTML = `
                <h4>${this.getSeasonName(season)} 타입 분석</h4>
                <div class="season-colors">
                    ${colors.map(color => `
                        <div class="color-sample" style="background-color: ${color}"></div>
                    `).join('')}
                </div>
                <p>이 색상들이 얼굴에 어떤 영향을 주는지 확인해보세요.</p>
            `;
        }
    }
}

// 애플리케이션 시작
document.addEventListener('DOMContentLoaded', () => {
    window.personalColorApp = new PersonalColorDiagnosisApp();
});
