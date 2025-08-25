// js/components/FullscreenDraping.js - 전체화면 드래이핑 모드

/**
 * 전체화면 드래이핑 컴포넌트
 * Von Kries 이론에 기반한 색채 적응 시뮬레이션
 */
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
                        ${color.description ? `<div class="text-sm opacity-75">${color.description}</div>` : ''}
                    </div>
                </div>

                <!-- 타이머 (우상단) -->
                <div class="absolute top-8 right-8 bg-black bg-opacity-70 text-white px-6 py-4 rounded-2xl z-10">
                    <div class="text-center">
                        <div class="draping-timer" id="fullscreen-timer">00:00</div>
                        <div class="text-sm opacity-75">관찰 시간</div>
                    </div>
                </div>

                <!-- 중앙 안내 메시지 -->
                <div class="text-center z-10">
                    <div class="bg-black bg-opacity-50 text-white px-8 py-6 rounded-2xl backdrop-filter backdrop-blur-sm">
                        <h2 class="text-3xl font-bold mb-4">드래이핑 분석</h2>
                        <p class="text-xl mb-6 opacity-90">
                            이 색상이 피부에 미치는 효과를 관찰하세요
                        </p>
                        <div class="text-base opacity-75 space-y-2">
                            <p>• 피부의 발광도와 생기</p>
                            <p>• 얼굴 윤곽의 선명도</p>
                            <p>• 전체적인 조화로움</p>
                        </div>
                    </div>
                </div>

                <!-- 하단 컨트롤 버튼들 -->
                <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 z-10">
                    <button onclick="FullscreenDraping.recordObservation('positive', 'skin_glow')"
                            class="bg-green-500 bg-opacity-80 hover:bg-opacity-100 text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 touch-target">
                        👍 좋음
                    </button>
                    <button onclick="FullscreenDraping.recordObservation('negative', 'skin_dullness')"
                            class="bg-red-500 bg-opacity-80 hover:bg-opacity-100 text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 touch-target">
                        👎 나쁨
                    </button>
                    <button onclick="FullscreenDraping.saveScreenshot()"
                            class="bg-blue-500 bg-opacity-80 hover:bg-opacity-100 text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 touch-target">
                        📷 저장
                    </button>
                </div>

                <!-- 종료 버튼 (우하단) -->
                <div class="absolute bottom-8 right-8 z-10">
                    <button onclick="FullscreenDraping.hide()"
                            class="bg-gray-800 bg-opacity-80 hover:bg-opacity-100 text-white p-4 rounded-full transition-all transform hover:scale-110 touch-target"
                            title="닫기"
                            aria-label="전체화면 드래이핑 종료">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <!-- 스와이프 인디케이터 -->
                <div class="swipe-indicator">
                    다른 색상으로 스와이프
                </div>
            </div>
        `;
    }

    /**
     * 이벤트 리스너 설정
     */
    static setupEventListeners() {
        // ESC 키로 종료
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.hide();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        // 터치/스와이프 제스처
        this.setupSwipeGestures();
    }

    /**
     * 스와이프 제스처 설정
     */
    static setupSwipeGestures() {
        const modal = document.getElementById('fullscreenModal');
        if (!modal) return;

        let startX = 0;
        let startY = 0;

        modal.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        modal.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;

            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;

            const deltaX = endX - startX;
            const deltaY = endY - startY;

            // 수직 스와이프가 더 클 때
            if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 100) {
                if (deltaY < 0) {
                    // 위로 스와이프: 좋음
                    this.recordObservation('positive', 'swipe_up');
                } else {
                    // 아래로 스와이프: 나쁨
                    this.recordObservation('negative', 'swipe_down');
                }
            } else if (Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    // 오른쪽 스와이프: 종료
                    this.hide();
                }
            }

            startX = 0;
            startY = 0;
        }, { passive: true });
    }

    /**
     * 타이머 시작
     */
    static startTimer() {
        this.timer = 0;
        this.updateTimerDisplay();

        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimerDisplay();
        }, 1000);
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
        const timerElement = document.getElementById('fullscreen-timer');
        if (timerElement) {
            const minutes = Math.floor(this.timer / 60);
            const seconds = this.timer % 60;
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    /**
     * 스크린샷 저장
     */
    static async saveScreenshot() {
        try {
            // Canvas를 사용한 스크린샷 (간단한 구현)
            const modal = document.getElementById('fullscreenModal');
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            // 배경색 설정
            ctx.fillStyle = this.currentColor.color;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 색상 정보 텍스트 추가
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(50, 50, 300, 120);
            
            ctx.fillStyle = 'white';
            ctx.font = 'bold 24px Arial';
            ctx.fillText(this.currentColor.name, 70, 90);
            ctx.font = '16px Arial';
            ctx.fillText(this.currentColor.munsell, 70, 120);
            ctx.fillText(`관찰 시간: ${Math.floor(this.timer / 60)}:${(this.timer % 60).toString().padStart(2, '0')}`, 70, 150);
            
            // 이미지로 변환하여 다운로드
            const link = document.createElement('a');
            link.download = `draping-${this.currentColor.name}-${Date.now()}.png`;
            link.href = canvas.toDataURL();
            link.click();
            
            this.showMessage('스크린샷이 저장되었습니다!', 'success');
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
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            if (button.onclick && button.onclick.toString().includes(result)) {
                const originalScale = button.style.transform;
                button.style.transform = 'scale(1.2)';
                
                setTimeout(() => {
                    button.style.transform = originalScale;
                }, 200);
            }
        });
        
        // 피드백 메시지
        const messages = {
            positive: { skin_glow: '피부 발광 좋음', swipe_up: '긍정적 평가' },
            negative: { skin_dullness: '피부 칙칙함', swipe_down: '부정적 평가' }
        };
        
        const message = messages[result][key] || `${result} 평가`;
        this.showMessage(message, result === 'positive' ? 'success' : 'info');
        
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
            case 'info':
            default:
                message.classList.add('bg-blue-500');
                break;
        }
        
        document.body.appendChild(message);
        
        // 페이드 인
        setTimeout(() => {
            message.style.opacity = '1';
            message.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 100);
        
        // 페이드 아웃 및 제거
        setTimeout(() => {
            message.style.opacity = '0';
            message.style.transform = 'translate(-50%, -50%) scale(0.8)';
            setTimeout(() => {
                if (message.parentNode) {
                    message.parentNode.removeChild(message);
                }
            }, 300);
        }, 2000);
    }

    /**
     * 관찰 데이터 가져오기
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
     * 현재 활성 상태 확인
     */
    static isActiveMode() {
        return this.isActive;
    }

    /**
     * 다중 색상 비교 모드
     */
    static showComparison(colorA, colorB) {
        console.log('색상 비교 모드:', colorA.name, 'vs', colorB.name);
        
        const modal = document.getElementById('fullscreenModal');
        if (!modal) return;

        modal.innerHTML = `
            <div class="w-full h-full flex">
                <!-- 왼쪽 색상 -->
                <div class="w-1/2 h-full flex items-center justify-center relative" style="background-color: ${colorA.color}">
                    <div class="absolute top-8 left-8 bg-black bg-opacity-70 text-white px-6 py-4 rounded-xl">
                        <h3 class="text-xl font-bold">${colorA.name}</h3>
                        <p class="text-sm opacity-75">${colorA.munsell}</p>
                    </div>
                    
                    <button onclick="FullscreenDraping.selectComparisonWinner('${colorA.name}')"
                            class="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-8 py-4 rounded-xl font-bold text-xl transition-all transform hover:scale-105">
                        이 색상 선택
                    </button>
                </div>
                
                <!-- 오른쪽 색상 -->
                <div class="w-1/2 h-full flex items-center justify-center relative" style="background-color: ${colorB.color}">
                    <div class="absolute top-8 right-8 bg-black bg-opacity-70 text-white px-6 py-4 rounded-xl">
                        <h3 class="text-xl font-bold">${colorB.name}</h3>
                        <p class="text-sm opacity-75">${colorB.munsell}</p>
                    </div>
                    
                    <button onclick="FullscreenDraping.selectComparisonWinner('${colorB.name}')"
                            class="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-8 py-4 rounded-xl font-bold text-xl transition-all transform hover:scale-105">
                        이 색상 선택
                    </button>
                </div>
                
                <!-- 중앙 구분선 -->
                <div class="absolute left-1/2 top-0 bottom-0 w-1 bg-white bg-opacity-50 transform -translate-x-1/2"></div>
                
                <!-- 종료 버튼 -->
                <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                    <button onclick="FullscreenDraping.hide()"
                            class="bg-gray-800 bg-opacity-80 text-white px-6 py-3 rounded-xl font-medium">
                        비교 종료
                    </button>
                </div>
            </div>
        `;
        
        modal.classList.remove('hidden');
        modal.classList.add('fullscreen-modal', 'no-select');
        document.body.style.overflow = 'hidden';
        
        this.isActive = true;
    }

    /**
     * 비교 모드에서 승자 선택
     */
    static selectComparisonWinner(colorName) {
        console.log('선택된 색상:', colorName);
        
        this.showMessage(`${colorName} 선택됨`, 'success');
        
        // 결과를 메인 앱에 전달 (필요시)
        if (window.app && window.app.handleColorComparison) {
            window.app.handleColorComparison(colorName);
        }
        
        setTimeout(() => {
            this.hide();
        }, 1500);
    }
}

// 전역으로 내보내기
window.FullscreenDraping = FullscreenDraping;

console.log('FullscreenDraping 컴포넌트 로딩 완료');
