// js/components/FullscreenDraping.js - 전체화면 드래이핑 모드

class FullscreenDraping {
    static currentColor = null;
    static timer = 0;
    static isActive = false;
    static timerInterval = null;
    static observationData = {};

    /**
     * 전체화면 드래이핑 시작
     */
    static show(colorData, timer = 0) {
        console.log('전체화면 드래이핑 시작:', colorData.name);
        
        this.currentColor = colorData;
        this.timer = timer;
        this.isActive = true;

        const modal = document.getElementById('fullscreenModal');
        if (!modal) return;

        modal.innerHTML = this.createFullscreenContent();
        modal.classList.remove('hidden');
        modal.classList.add('fullscreen-modal', 'no-select');
        modal.style.backgroundColor = colorData.color;
        
        // 이벤트 리스너 설정
        this.setupEventListeners();
        
        // body 스크롤 방지
        document.body.style.overflow = 'hidden';
        
        // 드래이핑 타이머 시작
        this.startTimer();
        
        // 전체화면 요청 (가능한 경우)
        this.requestFullscreen(modal);
        
        // 아이콘 초기화
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * 전체화면 드래이핑 종료
     */
    static hide() {
        console.log('전체화면 드래이핑 종료');
        
        const modal = document.getElementById('fullscreenModal');
        if (!modal) return;

        modal.classList.add('hidden');
        modal.classList.remove('fullscreen-modal', 'no-select');
        modal.style.backgroundColor = '';
        
        // body 스크롤 복원
        document.body.style.overflow = '';
        
        // 타이머 정지
        this.stopTimer();
        
        // 전체화면 종료
        this.exitFullscreen();

        this.isActive = false;
        this.currentColor = null;
        this.timer = 0;
    }

    /**
     * 전체화면 콘텐츠 생성
     */
    static createFullscreenContent() {
        const color = this.currentColor;
        
        return `
            <div class="w-full h-full flex items-center justify-center relative">
                <!-- 상단 색상 정보 -->
                <div class="absolute top-8 left-8 bg-black bg-opacity-70 text-white px-8 py-6 rounded-2xl max-w-md z-10">
                    <div class="space-y-3">
                        <div class="text-2xl font-bold">${color.name}</div>
                        <div class="text-base opacity-90">${color.munsell}</div>
                        ${color.description ? `<div class="text-sm opacity-80">${color.description}</div>` : ''}
                        <div id="draping-timer" class="text-base font-mono draping-timer text-yellow-400 font-bold">
                            관찰 시간: 0.0초
                        </div>
                    </div>
                </div>

                <!-- 종료 버튼 -->
                <button
                    id="exit-fullscreen-btn"
                    class="absolute top-8 right-8 bg-black bg-opacity-70 text-white p-4 rounded-full text-2xl hover:bg-opacity-90 transition-all z-10 touch-target"
                    title="전체화면 종료 (ESC)">
                    <i data-lucide="x" class="w-8 h-8"></i>
                </button>

                <!-- 중앙 가이드 영역 -->
                <div class="text-center z-10">
                    <div class="bg-black bg-opacity-60 text-white px-12 py-12 rounded-3xl max-w-2xl mx-auto">
                        <h2 class="text-5xl font-bold mb-8">🎭 실제 드래이핑 체험</h2>
                        
                        <div class="space-y-6 text-xl mb-12">
                            <p class="font-bold text-2xl">화면을 얼굴 근처에 대어보세요</p>
                            <div class="text-lg opacity-90 space-y-3">
                                <p class="flex items-center justify-center">
                                    <i data-lucide="smartphone" class="w-6 h-6 mr-3"></i>
                                    턱 아래 또는 목 근처에 위치
                                </p>
                                <p class="flex items-center justify-center">
                                    <i data-lucide="eye" class="w-6 h-6 mr-3"></i>
                                    거울을 보며 피부 변화 관찰
                                </p>
                                <p class="flex items-center justify-center">
                                    <i data-lucide="clock" class="w-6 h-6 mr-3"></i>
                                    최소 3초 이상 천천히 관찰
                                </p>
                            </div>
                        </div>
                        
                        <!-- 얼굴 시뮬레이션 영역 -->
                        <div class="face-simulation-area w-80 h-96 rounded-full border-4 border-white border-opacity-30 flex items-center justify-center mx-auto mb-12">
                            <div class="text-white text-opacity-70 text-center">
                                <i data-lucide="user" class="w-20 h-20 mx-auto mb-4"></i>
                                <p class="text-xl">얼굴을 여기에 대어보세요</p>
                            </div>
                        </div>

                        <!-- 관찰 체크포인트 -->
                        <div class="bg-white bg-opacity-20 rounded-2xl p-8">
                            <h3 class="font-bold mb-6 text-2xl">👁️ 관찰 체크포인트</h3>
                            <div class="space-y-4">
                                ${this.createObservationCheckpoints()}
                            </div>
                        </div>

                        <div class="mt-8 text-lg opacity-80 space-y-2">
                            <p class="flex items-center justify-center">
                                <i data-lucide="lightbulb" class="w-5 h-5 mr-2"></i>
                                팁: 첫인상이 가장 정확합니다!
                            </p>
                            <p class="flex items-center justify-center">
                                <i data-lucide="keyboard" class="w-5 h-5 mr-2"></i>
                                ESC 키 또는 ✕ 버튼으로 종료
                            </p>
                        </div>
                    </div>
                </div>

                <!-- 하단 컨트롤 -->
                <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
                    <div class="flex space-x-6">
                        <button
                            id="brightness-control"
                            class="bg-black bg-opacity-60 text-white px-6 py-4 rounded-2xl hover:bg-opacity-80 transition-all touch-target flex items-center"
                            title="화면 밝기 조절">
                            <i data-lucide="sun" class="w-6 h-6 mr-2"></i>
                            밝기 조절
                        </button>
                        
                        <button
                            id="color-info-btn"
                            class="bg-black bg-opacity-60 text-white px-6 py-4 rounded-2xl hover:bg-opacity-80 transition-all touch-target flex items-center"
                            title="색상 정보 보기">
                            <i data-lucide="info" class="w-6 h-6 mr-2"></i>
                            상세 정보
                        </button>
                        
                        <button
                            id="screenshot-btn"
                            class="bg-black bg-opacity-60 text-white px-6 py-4 rounded-2xl hover:bg-opacity-80 transition-all touch-target flex items-center"
                            title="화면 저장">
                            <i data-lucide="camera" class="w-6 h-6 mr-2"></i>
                            화면 저장
                        </button>
                    </div>
                </div>

                <!-- 밝기 조절 슬라이더 (숨김 상태) -->
                <div id="brightness-slider" class="absolute bottom-32 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 px-8 py-6 rounded-2xl hidden z-20">
                    <div class="text-white text-center mb-4 text-lg font-semibold">화면 밝기</div>
                    <input
                        type="range"
                        min="10"
                        max="100"
                        value="80"
                        class="w-64 h-3 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                        id="brightness-range">
                    <div class="flex justify-between text-white text-sm mt-3">
                        <span>어둡게</span>
                        <span>밝게</span>
                    </div>
                </div>

                <!-- 색상 정보 모달 (숨김 상태) -->
                <div id="color-info-modal" class="absolute inset-8 bg-black bg-opacity-90 rounded-3xl p-8 text-white hidden overflow-y-auto z-20">
                    <div class="max-w-4xl mx-auto">
                        <div class="flex justify-between items-center mb-8">
                            <h3 class="text-3xl font-bold">🎨 색상 상세 정보</h3>
                            <button id="close-color-info" class="text-white text-2xl hover:text-gray-300 p-2">
                                <i data-lucide="x" class="w-8 h-8"></i>
                            </button>
                        </div>
                        
                        ${this.createColorInfoContent(color)}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 관찰 체크포인트 생성
     */
    static createObservationCheckpoints() {
        const checkpoints = [
            { question: '피부가 화사해 보이나요?', key: 'brightness' },
            { question: '혈색이 좋아 보이나요?', key: 'complexion' },
            { question: '전체적으로 조화롭나요?', key: 'harmony' },
            { question: '건강해 보이나요?', key: 'healthy' }
        ];

        return checkpoints.map(checkpoint => `
            <div class="flex items-center justify-between bg-white bg-opacity-10 rounded-xl p-4">
                <span class="text-lg font-medium">${checkpoint.question}</span>
                <div class="flex space-x-3">
                    <button class="observation-btn w-12 h-12 bg-green-500 bg-opacity-80 hover:bg-opacity-100 rounded-full flex items-center justify-center text-2xl transition-all touch-target" 
                            data-result="positive" 
                            data-key="${checkpoint.key}"
                            title="좋음">
                        ✅
                    </button>
                    <button class="observation-btn w-12 h-12 bg-red-500 bg-opacity-80 hover:bg-opacity-100 rounded-full flex items-center justify-center text-2xl transition-all touch-target" 
                            data-result="negative" 
                            data-key="${checkpoint.key}"
                            title="나쁨">
                        ❌
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * 색상 정보 콘텐츠 생성
     */
    static createColorInfoContent(color) {
        return `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h4 class="text-2xl font-semibold mb-6">📊 기본 정보</h4>
                    <div class="space-y-4 text-lg">
                        <div class="bg-white bg-opacity-10 rounded-xl p-6">
                            <div><strong>색상명:</strong> ${color.name}</div>
                            <div class="mt-2"><strong>헥스 코드:</strong> ${color.color}</div>
                            <div class="mt-2"><strong>Munsell 표기:</strong> ${color.munsell}</div>
                            ${color.spd ? `<div class="mt-2"><strong>SPD 특성:</strong> ${color.spd}</div>` : ''}
                        </div>
                    </div>
                </div>
                
                <div>
                    <h4 class="text-2xl font-semibold mb-6">🔬 색채 이론</h4>
                    <div class="space-y-4 text-lg">
                        <div class="bg-white bg-opacity-10 rounded-xl p-6">
                            ${color.description ? `<div><strong>설명:</strong> ${color.description}</div>` : ''}
                            ${color.wavelength ? `<div class="mt-2"><strong>파장대:</strong> ${color.wavelength}</div>` : ''}
                            ${color.undertone ? `<div class="mt-2"><strong>언더톤:</strong> ${color.undertone}</div>` : ''}
                            ${color.lightness ? `<div class="mt-2"><strong>명도:</strong> ${color.lightness}</div>` : ''}
                            ${color.chroma ? `<div class="mt-2"><strong>채도:</strong> ${color.chroma}</div>` : ''}
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-12">
                <h4 class="text-2xl font-semibold mb-6">👁️ 전문가 관찰 가이드</h4>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="bg-green-900 bg-opacity-50 rounded-xl p-6">
                        <h5 class="font-bold text-green-300 mb-4 text-xl">✅ 긍정적 효과</h5>
                        <ul class="space-y-2 text-green-100">
                            <li>• 피부 내부 발광 증가</li>
                            <li>• 자연스러운 혈색 개선</li>
                            <li>• 윤곽선 선명도 향상</li>
                            <li>• 전체적 조화감 증가</li>
                            <li>• 건강하고 생기 있는 인상</li>
                        </ul>
                    </div>
                    <div class="bg-red-900 bg-opacity-50 rounded-xl p-6">
                        <h5 class="font-bold text-red-300 mb-4 text-xl">❌ 부정적 효과</h5>
                        <ul class="space-y-2 text-red-100">
                            <li>• 피부 칙칙함 증가</li>
                            <li>• 그림자가 진해짐</li>
                            <li>• 윤곽이 흐려짐</li>
                            <li>• 부자연스러운 대비</li>
                            <li>• 피곤하거나 창백한 인상</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="mt-8 text-center">
                <p class="text-lg opacity-80">
                    <i data-lucide="info" class="w-5 h-5 inline mr-2"></i>
                    Von Kries 색채 적응 이론에 따라 3초 이상 관찰하시면 더 정확한 판단이 가능합니다.
                </p>
            </div>
        `;
    }

    /**
     * 이벤트 리스너 설정
     */
    static setupEventListeners() {
        // 종료 버튼
        document.getElementById('exit-fullscreen-btn')?.addEventListener('click', () => {
            this.hide();
        });

        // 밝기 조절
        document.getElementById('brightness-control')?.addEventListener('click', () => {
            this.toggleBrightnessControl();
        });

        document.getElementById('brightness-range')?.addEventListener('input', (e) => {
            this.adjustBrightness(e.target.value);
        });

        // 색상 정보
        document.getElementById('color-info-btn')?.addEventListener('click', () => {
            this.toggleColorInfo();
        });

        document.getElementById('close-color-info')?.addEventListener('click', () => {
            this.hideColorInfo();
        });

        // 스크린샷
        document.getElementById('screenshot-btn')?.addEventListener('click', () => {
            this.takeScreenshot();
        });

        // 관찰 체크포인트
        document.querySelectorAll('.observation-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.recordObservation(
                    e.target.dataset.result, 
                    e.target.dataset.key
                );
            });
        });

        // ESC 키로 종료
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isActive) {
                this.hide();
            }
        });
    }

    /**
     * 타이머 시작
     */
    static startTimer() {
        this.timer = 0;
        this.timerInterval = setInterval(() => {
            this.timer += 0.1;
            this.updateTimerDisplay();
        }, 100);
    }

    /**
     * 타이머 정지
     */
    static stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * 타이머 표시 업데이트
     */
    static updateTimerDisplay() {
        const timerElement = document.getElementById('draping-timer');
        if (timerElement && this.isActive) {
            timerElement.textContent = `관찰 시간: ${this.timer.toFixed(1)}초`;
            
            // Von Kries 적응 시간에 따른 색상 변경
            if (this.timer >= 3) {
                timerElement.classList.remove('text-yellow-400');
                timerElement.classList.add('text-green-400');
            }
        }
    }

    /**
     * 밝기 조절 토글
     */
    static toggleBrightnessControl() {
        const slider = document.getElementById('brightness-slider');
        if (slider) {
            slider.classList.toggle('hidden');
        }
    }

    /**
     * 화면 밝기 조절
     */
    static adjustBrightness(value) {
        const modal = document.getElementById('fullscreenModal');
        if (modal) {
            const brightness = value / 100;
            modal.style.filter = `brightness(${brightness})`;
        }
    }

    /**
     * 색상 정보 토글
     */
    static toggleColorInfo() {
        const infoModal = document.getElementById('color-info-modal');
        if (infoModal) {
            infoModal.classList.toggle('hidden');
            
            // 아이콘 재초기화
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    }

    /**
     * 색상 정보 숨기기
     */
    static hideColorInfo() {
        const infoModal = document.getElementById('color-info-modal');
        if (infoModal) {
            infoModal.classList.add('hidden');
        }
    }

    /**
     * 스크린샷 저장
     */
    static takeScreenshot() {
        try {
            const modal = document.getElementById('fullscreenModal');
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            // 배경색으로 캔버스 채우기
            ctx.fillStyle = this.currentColor.color;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 색상 정보 텍스트 추가
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(50, 50, 400, 150);
            
            ctx.fillStyle = 'white';
            ctx.font = 'bold 24px Arial';
            ctx.fillText(this.currentColor.name, 70, 90);
            ctx.font = '18px Arial';
            ctx.fillText(this.currentColor.munsell, 70, 120);
            ctx.fillText(`관찰 시간: ${this.timer.toFixed(1)}초`, 70, 150);
            ctx.fillText('퍼스널컬러 진단 - 드래이핑 체험', 70, 180);
            
            // 이미지 다운로드
            const link = document.createElement('a');
            link.download = `draping-${this.currentColor.name.replace(/\s+/g, '-')}-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showMessage('드래이핑 화면이 저장되었습니다!', 'success');
        } catch (error) {
            console.error('스크린샷 저장 오류:', error);
            this.showMessage('화면 저장에 실패했습니다.', 'error');
        }
    }

    /**
     * 관찰 결과 기록
     */
    static recordObservation(result, key) {
        const colorName = this.currentColor.name;
        
        if (!this.observationData[colorName]) {
            this.observationData[colorName] = {
                positive: {},
                negative: {},
                observationTime: this.timer,
                timestamp: Date.now()
            };
        }
        
        // 결과 기록
        this.observationData[colorName][result][key] = true;
        
        // 시각적 피드백
        const button = event.target;
        const originalScale = button.style.transform;
        button.style.transform = 'scale(1.2)';
        
        setTimeout(() => {
            button.style.transform = originalScale;
        }, 200);
        
        console.log('관찰 기록:', colorName, result, key);
    }

    /**
     * 전체화면 요청
     */
    static requestFullscreen(element) {
        try {
            if (element.requestFullscreen) {
                element.requestFullscreen().catch(() => {
                    // 전체화면 실패 시 무시
                });
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        } catch (error) {
            console.log('전체화면 요청 실패:', error);
        }
    }

    /**
     * 전체화면 종료
     */
    static exitFullscreen() {
        try {
            if (document.exitFullscreen && document.fullscreenElement) {
                document.exitFullscreen().catch(() => {
                    // 종료 실패 시 무시
                });
            } else if (document.webkitExitFullscreen && document.webkitFullscreenElement) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen && document.mozFullScreenElement) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen && document.msFullscreenElement) {
                document.msExitFullscreen();
            }
        } catch (error) {
            console.log('전체화면 종료 실패:', error);
        }
    }

    /**
     * 메시지 표시
     */
    static showMessage(text, type = 'info') {
        const message = document.createElement('div');
        message.className = `fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                           px-8 py-4 rounded-2xl text-white font-bold text-xl z-50 transition-all`;
        message.textContent = text;
        
        switch (type) {
            case 'success':
                message.classList.add('bg-green-500');
                break;
            case 'error':
                message.classList.add('bg-red-500');
                break;
            default:
                message.classList.add('bg-blue-500');
        }
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.style.opacity = '0';
            setTimeout(() => {
                if (message.parentNode) {
                    message.parentNode.removeChild(message);
                }
            }, 300);
        }, 2500);
    }

    /**
     * 관찰 데이터 내보내기
     */
    static getObservationData() {
        return this.observationData;
    }

    /**
     * 관찰 데이터 초기화
     */
    static clearObservationData() {
        this.observationData = {};
    }

    /**
     * 현재 상태 반환
     */
    static getStatus() {
        return {
            isActive: this.isActive,
            currentColor: this.currentColor,
            timer: this.timer,
            observationCount: Object.keys(this.observationData).length
        };
    }
}

// 전역 접근을 위한 window 객체에 할당
if (typeof window !== 'undefined') {
    window.FullscreenDraping = FullscreenDraping;
    
    // 전역 함수로 등록 (HTML에서 직접 호출)
    window.enterFullscreenDraping = (colorData) => {
        FullscreenDraping.show(colorData);
    };
    
    window.exitFullscreenDraping = () => {
        FullscreenDraping.hide();
    };
}
