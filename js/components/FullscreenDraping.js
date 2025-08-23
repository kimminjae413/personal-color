// js/components/FullscreenDraping.js - 전체화면 드래이핑 모드

class FullscreenDraping {
    static currentColor = null;
    static timer = 0;
    static isActive = false;

    static show(color, timer = 0) {
        const modal = document.getElementById('fullscreen-modal');
        if (!modal) return;

        this.currentColor = color;
        this.timer = timer;
        this.isActive = true;

        modal.innerHTML = this.createFullscreenContent();
        modal.classList.remove('hidden');
        modal.classList.add('fullscreen-draping', 'no-select');
        modal.style.backgroundColor = color.color;
        
        // 이벤트 리스너 추가
        this.setupEventListeners();
        
        // body 스크롤 방지
        document.body.style.overflow = 'hidden';
        
        // 전체화면 요청 (가능한 경우)
        if (modal.requestFullscreen) {
            modal.requestFullscreen().catch(() => {
                // 전체화면 실패 시 무시
            });
        }
    }

    static hide() {
        const modal = document.getElementById('fullscreen-modal');
        if (!modal) return;

        modal.classList.add('hidden');
        modal.classList.remove('fullscreen-draping', 'no-select');
        modal.style.backgroundColor = '';
        
        // body 스크롤 복원
        document.body.style.overflow = '';
        
        // 전체화면 종료
        if (document.exitFullscreen && document.fullscreenElement) {
            document.exitFullscreen().catch(() => {
                // 전체화면 종료 실패 시 무시
            });
        }

        this.isActive = false;
        this.currentColor = null;
        this.timer = 0;
    }

    static updateTimer(newTimer) {
        this.timer = newTimer;
        const timerElement = document.getElementById('draping-timer');
        if (timerElement && this.isActive) {
            timerElement.textContent = `관찰 시간: ${newTimer.toFixed(1)}초`;
            
            // 3초 이상일 때 색상 변경
            if (newTimer >= 3) {
                timerElement.classList.add('text-green-400');
                timerElement.classList.remove('text-yellow-400');
            } else {
                timerElement.classList.add('text-yellow-400');
                timerElement.classList.remove('text-green-400');
            }
        }
    }

    static createFullscreenContent() {
        const color = this.currentColor;
        
        return `
            <div class="w-full h-full flex items-center justify-center relative">
                <!-- 상단 정보 바 -->
                <div class="absolute top-4 left-4 bg-black bg-opacity-80 text-white px-6 py-4 rounded-xl max-w-md">
                    <div class="space-y-2">
                        <div class="text-xl font-bold">${color.name}</div>
                        <div class="text-sm opacity-90">${color.munsell}</div>
                        ${color.spd ? `<div class="text-xs opacity-80">${color.spd}</div>` : ''}
                        <div id="draping-timer" class="text-sm font-mono draping-timer text-yellow-400">
                            관찰 시간: ${this.timer.toFixed(1)}초
                        </div>
                    </div>
                </div>

                <!-- 닫기 버튼 -->
                <button
                    id="exit-fullscreen-btn"
                    class="absolute top-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-full text-2xl hover:bg-opacity-100 transition-all z-10"
                    title="전체화면 종료 (ESC)"
                >
                    ✕
                </button>

                <!-- 중앙 안내 -->
                <div class="text-center z-10">
                    <div class="bg-black bg-opacity-60 text-white px-8 py-8 rounded-2xl max-w-lg mx-auto">
                        <h2 class="text-4xl font-bold mb-4">🎭 실제 드래이핑</h2>
                        <div class="space-y-3 text-lg">
                            <p class="font-semibold">화면을 얼굴 근처에 대어보세요</p>
                            <div class="text-base opacity-90">
                                <p>📱 턱 아래 또는 가슴 근처 위치</p>
                                <p>👁️ 거울을 보며 피부 변화 관찰</p>
                                <p>⏱️ 최소 3초 이상 천천히 관찰</p>
                            </div>
                        </div>
                        
                        <div class="mt-6 p-4 bg-white bg-opacity-20 rounded-lg">
                            <h3 class="font-bold mb-2">관찰 체크포인트</h3>
                            <div class="grid grid-cols-1 gap-2 text-sm">
                                <div class="flex items-center justify-between">
                                    <span>피부가 화사해 보이나요?</span>
                                    <div class="flex space-x-2">
                                        <button class="observation-btn bg-green-500 px-2 py-1 rounded text-xs" data-result="positive">✅</button>
                                        <button class="observation-btn bg-red-500 px-2 py-1 rounded text-xs" data-result="negative">❌</button>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span>혈색이 좋아 보이나요?</span>
                                    <div class="flex space-x-2">
                                        <button class="observation-btn bg-green-500 px-2 py-1 rounded text-xs" data-result="positive">✅</button>
                                        <button class="observation-btn bg-red-500 px-2 py-1 rounded text-xs" data-result="negative">❌</button>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span>전체적으로 조화롭나요?</span>
                                    <div class="flex space-x-2">
                                        <button class="observation-btn bg-green-500 px-2 py-1 rounded text-xs" data-result="positive">✅</button>
                                        <button class="observation-btn bg-red-500 px-2 py-1 rounded text-xs" data-result="negative">❌</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="mt-4 text-sm opacity-80">
                            <p>💡 팁: 첫인상이 가장 정확합니다!</p>
                        </div>
                    </div>
                </div>

                <!-- 하단 컨트롤 -->
                <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <div class="flex space-x-4">
                        <button
                            id="brightness-control"
                            class="bg-black bg-opacity-60 text-white px-4 py-2 rounded-lg hover:bg-opacity-80 transition-all"
                            title="화면 밝기 조절"
                        >
                            🔆 밝기
                        </button>
                        <button
                            id="color-info-btn"
                            class="bg-black bg-opacity-60 text-white px-4 py-2 rounded-lg hover:bg-opacity-80 transition-all"
                            title="색상 정보 보기"
                        >
                            ℹ️ 정보
                        </button>
                        <button
                            id="screenshot-btn"
                            class="bg-black bg-opacity-60 text-white px-4 py-2 rounded-lg hover:bg-opacity-80 transition-all"
                            title="스크린샷 저장"
                        >
                            📷 저장
                        </button>
                    </div>
                </div>

                <!-- 밝기 조절 슬라이더 (숨김 상태) -->
                <div id="brightness-slider" class="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 px-6 py-4 rounded-lg hidden">
                    <div class="text-white text-center mb-2">화면 밝기</div>
                    <input
                        type="range"
                        min="20"
                        max="100"
                        value="80"
                        class="w-48 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                        id="brightness-range"
                    >
                    <div class="flex justify-between text-white text-xs mt-1">
                        <span>어둡게</span>
                        <span>밝게</span>
                    </div>
                </div>

                <!-- 색상 정보 모달 (숨김 상태) -->
                <div id="color-info-modal" class="absolute inset-4 bg-black bg-opacity-90 rounded-xl p-6 text-white hidden overflow-y-auto">
                    <div class="max-w-2xl mx-auto">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-2xl font-bold">🎨 색상 상세 정보</h3>
                            <button id="close-color-info" class="text-white text-xl hover:text-gray-300">✕</button>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 class="text-lg font-semibold mb-3">기본 정보</h4>
                                <div class="space-y-2 text-sm">
                                    <div><strong>색상명:</strong> ${color.name}</div>
                                    <div><strong>헥스 코드:</strong> ${color.color}</div>
                                    <div><strong>Munsell 표기:</strong> ${color.munsell}</div>
                                    ${color.spd ? `<div><strong>SPD 특성:</strong> ${color.spd}</div>` : ''}
                                </div>
                            </div>
                            
                            <div>
                                <h4 class="text-lg font-semibold mb-3">색채 이론</h4>
                                <div class="space-y-2 text-sm">
                                    ${color.description ? `<div><strong>설명:</strong> ${color.description}</div>` : ''}
                                    ${color.wavelength ? `<div><strong>파장대:</strong> ${color.wavelength}</div>` : ''}
                                    ${color.undertone ? `<div><strong>언더톤:</strong> ${color.undertone}</div>` : ''}
                                </div>
                            </div>
                        </div>

                        <div class="mt-6">
                            <h4 class="text-lg font-semibold mb-3">관찰 가이드</h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div class="bg-green-900 bg-opacity-50 p-4 rounded">
                                    <h5 class="font-semibold text-green-300 mb-2">✅ 긍정적 효과</h5>
                                    <ul class="space-y-1">
                                        <li>• 피부 생기 증가</li>
                                        <li>• 혈색 개선</li>
                                        <li>• 윤곽 선명해짐</li>
                                        <li>• 자연스러운 조화</li>
                                    </ul>
                                </div>
                                <div class="bg-red-900 bg-opacity-50 p-4 rounded">
                                    <h5 class="font-semibold text-red-300 mb-2">❌ 부정적 효과</h5>
                                    <ul class="space-y-1">
                                        <li>• 피부 칙칙해짐</li>
                                        <li>• 그림자 진해짐</li>
                                        <li>• 윤곽 흐려짐</li>
                                        <li>• 부자연스러운 대비</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

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
            btn.addEventListener('click', () => {
                this.recordObservation(btn.dataset.result);
            });
        });

        // ESC 키로 종료
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isActive) {
                this.hide();
            }
        });

        // 터치 이벤트 처리 (모바일)
        this.setupTouchEvents();
    }

    static setupTouchEvents() {
        const modal = document.getElementById('fullscreen-modal');
        if (!modal || !('ontouchstart' in window)) return;

        let touchStartTime = 0;
        
        modal.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
        });

        modal.addEventListener('touchend', (e) => {
            const touchEndTime = Date.now();
            const touchDuration = touchEndTime - touchStartTime;
            
            // 더블 탭으로 종료 (500ms 내 두 번 탭)
            if (touchDuration < 300) {
                clearTimeout(this.doubleTapTimer);
                this.doubleTapTimer = setTimeout(() => {
                    // 단일 탭 처리
                }, 300);
            }
        });
    }

    static toggleBrightnessControl() {
        const slider = document.getElementById('brightness-slider');
        if (slider) {
            slider.classList.toggle('hidden');
        }
    }

    static adjustBrightness(value) {
        const modal = document.getElementById('fullscreen-modal');
        if (modal) {
            const opacity = value / 100;
            modal.style.filter = `brightness(${opacity})`;
        }
    }

    static toggleColorInfo() {
        const infoModal = document.getElementById('color-info-modal');
        if (infoModal) {
            infoModal.classList.toggle('hidden');
        }
    }

    static hideColorInfo() {
        const infoModal = document.getElementById('color-info-modal');
        if (infoModal) {
            infoModal.classList.add('hidden');
        }
    }

    static takeScreenshot() {
        // HTML2Canvas 라이브러리를 사용하여 스크린샷 생성
        // 실제 구현에서는 html2canvas 라이브러리 필요
        try {
            const modal = document.getElementById('fullscreen-modal');
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            // 배경색으로 캔버스 채우기
            ctx.fillStyle = this.currentColor.color;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 이미지 다운로드
            const link = document.createElement('a');
            link.download = `draping-${this.currentColor.name}-${Date.now()}.png`;
            link.href = canvas.toDataURL();
            link.click();
            
            // 성공 메시지
            this.showMessage('스크린샷이 저장되었습니다!', 'success');
        } catch (error) {
            this.showMessage('스크린샷 저장에 실패했습니다.', 'error');
        }
    }

    static recordObservation(result) {
        // 관찰 결과 기록
        if (!this.observationData) {
            this.observationData = {};
        }
        
        const colorName = this.currentColor.name;
        if (!this.observationData[colorName]) {
            this.observationData[colorName] = {
                positive: 0,
                negative: 0,
                observationTime: this.timer
            };
        }
        
        this.observationData[colorName][result]++;
        
        // 피드백 애니메이션
        const button = event.target;
        button.style.transform = 'scale(1.2)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 200);
    }

    static showMessage(text, type = 'info') {
        // 임시 메시지 표시
        const message = document.createElement('div');
        message.className = `fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                           px-6 py-3 rounded-lg text-white font-semibold z-50 transition-all`;
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
            message.remove();
        }, 3000);
    }

    // 관찰 데이터 내보내기
    static getObservationData() {
        return this.observationData || {};
    }

    // 관찰 데이터 초기화
    static clearObservationData() {
        this.observationData = {};
    }
}

// 전역 접근을 위한 window 객체에 할당
window.FullscreenDraping = FullscreenDraping;
