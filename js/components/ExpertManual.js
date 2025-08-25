// js/components/ExpertManual.js - 전문가 매뉴얼 모달

/**
 * 전문가 매뉴얼 컴포넌트
 * 과학적 드래이핑 이론과 실무 가이드라인
 */
class ExpertManual {
    static isOpen = false;

    /**
     * 전문가 매뉴얼 표시
     */
    static show() {
        console.log('전문가 매뉴얼 열기');
        
        const modal = document.getElementById('expertManualModal');
        if (!modal) return;

        modal.innerHTML = this.createManualContent();
        modal.classList.remove('hidden');
        
        // body 스크롤 방지
        document.body.style.overflow = 'hidden';
        
        this.isOpen = true;
        
        // 이벤트 리스너 설정
        this.setupEventListeners();
    }

    /**
     * 전문가 매뉴얼 숨기기
     */
    static hide() {
        console.log('전문가 매뉴얼 닫기');
        
        const modal = document.getElementById('expertManualModal');
        if (!modal) return;

        modal.classList.add('hidden');
        
        // body 스크롤 복원
        document.body.style.overflow = '';
        
        this.isOpen = false;
    }

    /**
     * 매뉴얼 콘텐츠 생성
     */
    static createManualContent() {
        return `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-2xl max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl">
                    <!-- 헤더 -->
                    <div class="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl">
                        <div class="flex items-center justify-between">
                            <div>
                                <h2 id="manual-title" class="text-3xl font-bold text-gray-800 mb-2">
                                    전문가 매뉴얼
                                </h2>
                                <p class="text-gray-600">과학적 드래이핑 이론과 실무 가이드라인</p>
                            </div>
                            <button onclick="ExpertManual.hide()" 
                                    class="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors touch-target"
                                    aria-label="매뉴얼 닫기">
                                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- 매뉴얼 내용 -->
                    <div class="px-8 py-6">
                        ${this.createTheorySection()}
                        ${this.createMethodologySection()}
                        ${this.createTechnicalSection()}
                        ${this.createPracticalSection()}
                        ${this.createDigitalSection()}
                        ${this.createReferencesSection()}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 이벤트 리스너 설정
     */
    static setupEventListeners() {
        // ESC 키로 닫기
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.hide();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        // 배경 클릭으로 닫기
        const modal = document.getElementById('expertManualModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hide();
                }
            });
        }
    }

    /**
     * 이론 섹션
     */
    static createTheorySection() {
        return `
            <section class="mb-12">
                <h3 class="text-2xl font-bold text-blue-800 mb-6 flex items-center">
                    <svg class="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                    </svg>
                    1. 과학적 이론 기반 (Scientific Foundation)
                </h3>
                
                <div class="space-y-8">
                    <div class="bg-white rounded-xl p-6 shadow-sm">
                        <h4 class="font-bold text-blue-700 mb-4 text-xl">Von Kries 색채 적응 이론</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="space-y-4">
                                <h5 class="font-semibold text-gray-800 mb-3">🧬 생리학적 메커니즘</h5>
                                <div class="bg-blue-50 rounded-lg p-4 space-y-2 text-sm">
                                    <div class="flex justify-between">
                                        <span class="font-medium">L 원추세포:</span>
                                        <span class="text-blue-700">장파장 (빨강) 감지</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">M 원추세포:</span>
                                        <span class="text-blue-700">중파장 (초록) 감지</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">S 원추세포:</span>
                                        <span class="text-blue-700">단파장 (파랑) 감지</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">적응 시간:</span>
                                        <span class="text-blue-700">3-5초 표준</span>
                                    </div>
                                </div>
                            </div>
                            <div class="space-y-4">
                                <h5 class="font-semibold text-gray-800 mb-3">⚗️ 색채 항상성 원리</h5>
                                <div class="bg-blue-50 rounded-lg p-4 space-y-2 text-sm">
                                    <div class="flex justify-between">
                                        <span class="font-medium">조명 보정:</span>
                                        <span class="text-blue-700">자동 화이트 밸런스</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">스펙트럼 분석:</span>
                                        <span class="text-blue-700">반사율 특성 판별</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">대비 효과:</span>
                                        <span class="text-blue-700">동시 대비 현상</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">메타메리즘:</span>
                                        <span class="text-blue-700">조건등색 고려</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-xl p-6 shadow-sm">
                        <h4 class="font-bold text-blue-700 mb-4 text-xl">Munsell 색체계 적용</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div class="text-center p-4 bg-red-50 rounded-xl border border-red-200">
                                <div class="text-3xl mb-2">🎨</div>
                                <h5 class="font-bold text-red-700 mb-3">색상 (Hue)</h5>
                                <ul class="text-red-800 space-y-1 text-sm">
                                    <li>• <strong>R:</strong> Red (빨강)</li>
                                    <li>• <strong>YR:</strong> Yellow-Red (주황)</li>
                                    <li>• <strong>Y:</strong> Yellow (노랑)</li>
                                    <li>• <strong>GY:</strong> Green-Yellow</li>
                                    <li>• <strong>G:</strong> Green (초록)</li>
                                    <li>• <strong>BG:</strong> Blue-Green</li>
                                    <li>• <strong>B:</strong> Blue (파랑)</li>
                                    <li>• <strong>PB:</strong> Purple-Blue</li>
                                    <li>• <strong>P:</strong> Purple (보라)</li>
                                    <li>• <strong>RP:</strong> Red-Purple</li>
                                </ul>
                            </div>
                            <div class="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                                <div class="text-3xl mb-2">☀️</div>
                                <h5 class="font-bold text-yellow-700 mb-3">명도 (Value)</h5>
                                <ul class="text-yellow-800 space-y-1 text-sm">
                                    <li>• <strong>0:</strong> 완전한 검정</li>
                                    <li>• <strong>1-3:</strong> 어두운 색상</li>
                                    <li>• <strong>4-6:</strong> 중간 색상</li>
                                    <li>• <strong>7-9:</strong> 밝은 색상</li>
                                    <li>• <strong>10:</strong> 완전한 흰색</li>
                                </ul>
                            </div>
                            <div class="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                                <div class="text-3xl mb-2">⚡</div>
                                <h5 class="font-bold text-purple-700 mb-3">채도 (Chroma)</h5>
                                <ul class="text-purple-800 space-y-1 text-sm">
                                    <li>• <strong>0:</strong> 무채색 (회색)</li>
                                    <li>• <strong>2-4:</strong> 저채도</li>
                                    <li>• <strong>6-8:</strong> 중채도</li>
                                    <li>• <strong>10-14:</strong> 고채도</li>
                                    <li>• <strong>16+:</strong> 최고채도</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    /**
     * 방법론 섹션
     */
    static createMethodologySection() {
        return `
            <section class="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-8 mb-12 border border-purple-200">
                <h3 class="text-2xl font-bold text-purple-800 mb-6 flex items-center">
                    <svg class="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                    </svg>
                    2. Sci\\ART 방법론 (전문 드래이핑 시스템)
                </h3>
                
                <div class="space-y-8">
                    <div class="bg-white rounded-xl p-6 shadow-sm">
                        <h4 class="font-bold text-purple-700 mb-4 text-xl">3단계 분석 프로토콜</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div class="bg-orange-50 rounded-xl p-6 border-l-4 border-orange-400">
                                <h5 class="font-bold text-orange-700 mb-3 text-lg flex items-center">
                                    🔥 1단계: 온도감 (Temperature)
                                </h5>
                                <ul class="text-orange-800 space-y-2 text-sm">
                                    <li>• <strong>목적:</strong> 황색(warm) vs 청색(cool) 언더톤 분석</li>
                                    <li>• <strong>방법:</strong> 8개 색상 (warm 4개 + cool 4개) 비교</li>
                                    <li>• <strong>관찰:</strong> 피부 반사광의 스펙트럼 변화</li>
                                    <li>• <strong>평가:</strong> 혈색, 생기, 조화도 종합 판단</li>
                                </ul>
                            </div>
                            <div class="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-400">
                                <h5 class="font-bold text-blue-700 mb-3 text-lg flex items-center">
                                    🌟 2단계: 명도 (Value)
                                </h5>
                                <ul class="text-blue-800 space-y-2 text-sm">
                                    <li>• <strong>목적:</strong> 밝음(light) vs 깊음(deep) 대비 분석</li>
                                    <li>• <strong>방법:</strong> 개인 최적 명도 범위 측정</li>
                                    <li>• <strong>관찰:</strong> 얼굴 윤곽 선명도 변화</li>
                                    <li>• <strong>평가:</strong> 입체감, 또렷함 정도 비교</li>
                                </ul>
                            </div>
                            <div class="bg-green-50 rounded-xl p-6 border-l-4 border-green-400">
                                <h5 class="font-bold text-green-700 mb-3 text-lg flex items-center">
                                    ⚡ 3단계: 채도 (Chroma)
                                </h5>
                                <ul class="text-green-800 space-y-2 text-sm">
                                    <li>• <strong>목적:</strong> 선명함(vivid) vs 부드러움(muted) 조화</li>
                                    <li>• <strong>방법:</strong> 채도 강도별 색상 테스트</li>
                                    <li>• <strong>관찰:</strong> 전체적 균형감과 자연스러움</li>
                                    <li>• <strong>평가:</strong> 개성 표현력과 세련됨 정도</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-xl p-6 shadow-sm">
                        <h4 class="font-bold text-purple-700 mb-4 text-xl">12계절 분류 시스템</h4>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div class="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                                <div class="text-3xl mb-2">🌸</div>
                                <h5 class="font-bold text-yellow-700 mb-3">Spring</h5>
                                <ul class="text-yellow-800 space-y-1 text-xs">
                                    <li><strong>Light:</strong> 밝고 부드러움</li>
                                    <li><strong>True:</strong> 선명하고 따뜻함</li>
                                    <li><strong>Deep:</strong> 깊고 풍부함</li>
                                </ul>
                            </div>
                            <div class="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                                <div class="text-3xl mb-2">🌊</div>
                                <h5 class="font-bold text-blue-700 mb-3">Summer</h5>
                                <ul class="text-blue-800 space-y-1 text-xs">
                                    <li><strong>Light:</strong> 밝고 쿨함</li>
                                    <li><strong>True:</strong> 중간 쿨톤</li>
                                    <li><strong>Deep:</strong> 깊고 차가움</li>
                                </ul>
                            </div>
                            <div class="text-center p-4 bg-orange-50 rounded-xl border border-orange-200">
                                <div class="text-3xl mb-2">🍂</div>
                                <h5 class="font-bold text-orange-700 mb-3">Autumn</h5>
                                <ul class="text-orange-800 space-y-1 text-xs">
                                    <li><strong>Soft:</strong> 부드럽고 따뜻함</li>
                                    <li><strong>True:</strong> 진한 가을색</li>
                                    <li><strong>Deep:</strong> 가장 깊은 웜톤</li>
                                </ul>
                            </div>
                            <div class="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                                <div class="text-3xl mb-2">❄️</div>
                                <h5 class="font-bold text-purple-700 mb-3">Winter</h5>
                                <ul class="text-purple-800 space-y-1 text-xs">
                                    <li><strong>Bright:</strong> 선명하고 차가움</li>
                                    <li><strong>True:</strong> 진정한 겨울톤</li>
                                    <li><strong>Deep:</strong> 가장 깊은 쿨톤</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-xl p-6 shadow-sm">
                        <h4 class="font-bold text-indigo-700 mb-4 text-xl flex items-center">
                            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                            </svg>
                            K-뷰티 표준 연계
                        </h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="space-y-4">
                                <h5 class="font-semibold text-gray-800 mb-3">💄 화장품 매칭</h5>
                                <div class="bg-indigo-50 rounded-lg p-4 space-y-2 text-sm">
                                    <div class="flex justify-between">
                                        <span class="font-medium">베이스:</span>
                                        <span class="text-indigo-700">언더톤 매칭 21단계</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">립 컬러:</span>
                                        <span class="text-indigo-700">계절별 300여개 매칭</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">아이 메이크업:</span>
                                        <span class="text-indigo-700">조화도 기반 추천</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">치크:</span>
                                        <span class="text-indigo-700">자연 혈색 시뮬레이션</span>
                                    </div>
                                </div>
                            </div>
                            <div class="space-y-4">
                                <h5 class="font-semibold text-gray-800 mb-3">🎨 한국형 특화</h5>
                                <div class="bg-indigo-50 rounded-lg p-4 space-y-2 text-sm">
                                    <div class="flex justify-between">
                                        <span class="font-medium">피부톤:</span>
                                        <span class="text-indigo-700">아시아인 특화 ITA 분석</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">투명도:</span>
                                        <span class="text-indigo-700">얇은 피부층 반영</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">계절감:</span>
                                        <span class="text-indigo-700">한반도 기후 고려</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">조화 패턴:</span>
                                        <span class="text-indigo-700">고유한 아시아적 조화 기준</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    /**
     * 기술 섹션
     */
    static createTechnicalSection() {
        return `
            <section class="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-8 mb-12 border border-red-200">
                <h3 class="text-2xl font-bold text-red-800 mb-6 flex items-center">
                    <svg class="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    3. 기술적 요구사항 (Technical Requirements)
                </h3>
                
                <div class="space-y-8">
                    <div class="bg-white rounded-xl p-6 shadow-sm">
                        <h4 class="font-bold text-red-700 mb-4 text-xl">조명 환경 표준</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="space-y-4">
                                <h5 class="font-semibold text-gray-800 mb-3">💡 조명 사양</h5>
                                <div class="bg-red-50 rounded-lg p-4 space-y-2 text-sm">
                                    <div class="flex justify-between">
                                        <span class="font-medium">색온도:</span>
                                        <span class="text-red-700">5000K (D50 표준광원)</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">CRI:</span>
                                        <span class="text-red-700">90 이상 (R9 70+)</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">조도:</span>
                                        <span class="text-red-700">1000-1500 lux</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">균등도:</span>
                                        <span class="text-red-700">±10% 이내</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">배경:</span>
                                        <span class="text-red-700">중성회색 N5, 무반사</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">차광:</span>
                                        <span class="text-red-700">외부광 완전 차단</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">소음:</span>
                                        <span class="text-red-700">40dB 이하 유지</span>
                                    </div>
                                </div>
                            </div>
                            <div class="space-y-4">
                                <h5 class="font-semibold text-gray-800 mb-3">🎯 관찰 조건</h5>
                                <div class="bg-red-50 rounded-lg p-4 space-y-2 text-sm">
                                    <div class="flex justify-between">
                                        <span class="font-medium">거리:</span>
                                        <span class="text-red-700">60-80cm 최적</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">각도:</span>
                                        <span class="text-red-700">45° 조명각</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">시야:</span>
                                        <span class="text-red-700">2° 표준 관찰자</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">적응:</span>
                                        <span class="text-red-700">3-5초 Von Kries</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">휴식:</span>
                                        <span class="text-red-700">색상간 10초 간격</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">집중:</span>
                                        <span class="text-red-700">총 15분 이내</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">기록:</span>
                                        <span class="text-red-700">즉시 문서화</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    /**
     * 실무 섹션  
     */
    static createPracticalSection() {
        return `
            <section class="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-8 mb-12 border border-green-200">
                <h3 class="text-2xl font-bold text-green-800 mb-6 flex items-center">
                    <svg class="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    4. 실무 가이드라인 (Practical Guidelines)
                </h3>
                
                <div class="space-y-8">
                    <div class="bg-white rounded-xl p-6 shadow-sm">
                        <h4 class="font-bold text-green-700 mb-4 text-xl">드래이핑 천 표준</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="space-y-4">
                                <h5 class="font-semibold text-gray-800 mb-3">🧵 천 사양</h5>
                                <div class="bg-green-50 rounded-lg p-4 space-y-2 text-sm">
                                    <div class="flex justify-between">
                                        <span class="font-medium">소재:</span>
                                        <span class="text-green-700">100% 천연섬유 (실크 권장)</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">크기:</span>
                                        <span class="text-green-700">85cm × 65cm (대형)</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">마감:</span>
                                        <span class="text-green-700">무광택 (Matte finish)</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">색상 정확도:</span>
                                        <span class="text-green-700">ΔE<2000 < 1.0</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">내광성:</span>
                                        <span class="text-green-700">Blue Wool 7급 이상</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">관리:</span>
                                        <span class="text-green-700">암소 보관, 먼지 방지</span>
                                    </div>
                                </div>
                            </div>
                            <div class="space-y-4">
                                <h5 class="font-semibold text-gray-800 mb-3">📏 배치 방법</h5>
                                <div class="bg-green-50 rounded-lg p-4 space-y-2 text-sm">
                                    <div class="flex justify-between">
                                        <span class="font-medium">위치:</span>
                                        <span class="text-green-700">턱 아래부터 이마까지</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">각도:</span>
                                        <span class="text-green-700">어깨선과 평행</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">거리:</span>
                                        <span class="text-green-700">피부에서 2-3cm 떨어짐</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">고정:</span>
                                        <span class="text-green-700">클립 사용 (뒷목)</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">교체:</span>
                                        <span class="text-green-700">부드럽고 신속하게</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">비교:</span>
                                        <span class="text-green-700">항상 2개 이상 대조</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-xl p-6 shadow-sm">
                        <h4 class="font-bold text-green-700 mb-4 text-xl">관찰 체크리스트</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="space-y-3">
                                <h5 class="font-semibold text-gray-800 mb-3">✅ 긍정적 반응</h5>
                                <div class="space-y-2">
                                    <label class="flex items-center space-x-2 text-sm">
                                        <input type="checkbox" class="rounded text-green-600">
                                        <span>피부 내부 발광 증가</span>
                                    </label>
                                    <label class="flex items-center space-x-2 text-sm">
                                        <input type="checkbox" class="rounded text-green-600">
                                        <span>얼굴 윤곽 선명도 향상</span>
                                    </label>
                                    <label class="flex items-center space-x-2 text-sm">
                                        <input type="checkbox" class="rounded text-green-600">
                                        <span>자연스러운 혈색 표현</span>
                                    </label>
                                    <label class="flex items-center space-x-2 text-sm">
                                        <input type="checkbox" class="rounded text-green-600">
                                        <span>눈의 밝기와 생기</span>
                                    </label>
                                    <label class="flex items-center space-x-2 text-sm">
                                        <input type="checkbox" class="rounded text-green-600">
                                        <span>전체적인 조화로움</span>
                                    </label>
                                </div>
                            </div>
                            <div class="space-y-3">
                                <h5 class="font-semibold text-gray-800 mb-3">❌ 부정적 반응</h5>
                                <div class="space-y-2">
                                    <label class="flex items-center space-x-2 text-sm">
                                        <input type="checkbox" class="rounded text-red-600">
                                        <span>피부 칙칙함과 피로감</span>
                                    </label>
                                    <label class="flex items-center space-x-2 text-sm">
                                        <input type="checkbox" class="rounded text-red-600">
                                        <span>그림자와 주름 강조</span>
                                    </label>
                                    <label class="flex items-center space-x-2 text-sm">
                                        <input type="checkbox" class="rounded text-red-600">
                                        <span>불균일한 피부톤</span>
                                    </label>
                                    <label class="flex items-center space-x-2 text-sm">
                                        <input type="checkbox" class="rounded text-red-600">
                                        <span>눈가 다크서클 부각</span>
                                    </label>
                                    <label class="flex items-center space-x-2 text-sm">
                                        <input type="checkbox" class="rounded text-red-600">
                                        <span>전체적인 부조화</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    /**
     * 디지털 섹션
     */
    static createDigitalSection() {
        return `
            <section class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 mb-12 border border-indigo-200">
                <h3 class="text-2xl font-bold text-indigo-800 mb-6 flex items-center">
                    <svg class="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    5. 디지털 드래이핑 활용 (Digital Integration)
                </h3>
                
                <div class="space-y-8">
                    <div class="bg-white rounded-xl p-6 shadow-sm">
                        <h4 class="font-bold text-indigo-700 mb-4 text-xl">하드웨어 요구사항</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="space-y-4">
                                <h5 class="font-semibold text-gray-800 mb-3">🖥️ 디스플레이 사양</h5>
                                <div class="bg-indigo-50 rounded-lg p-4 space-y-2 text-sm">
                                    <div class="flex justify-between">
                                        <span class="font-medium">색역:</span>
                                        <span class="text-indigo-700">sRGB 99%+ 커버리지</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">밝기:</span>
                                        <span class="text-indigo-700">300cd/m² 이상</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">패널:</span>
                                        <span class="text-indigo-700">IPS 또는 OLED</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">해상도:</span>
                                        <span class="text-indigo-700">1920×1080 이상</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">칼리브레이션:</span>
                                        <span class="text-indigo-700">월 1회 필수</span>
                                    </div>
                                </div>
                            </div>
                            <div class="space-y-4">
                                <h5 class="font-semibold text-gray-800 mb-3">📱 소프트웨어 기능</h5>
                                <div class="bg-indigo-50 rounded-lg p-4 space-y-2 text-sm">
                                    <div class="flex justify-between">
                                        <span class="font-medium">실시간 오버레이:</span>
                                        <span class="text-indigo-700">WebGL 가속</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">색상 정확도:</span>
                                        <span class="text-indigo-700">10비트 색심도</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">반응속도:</span>
                                        <span class="text-indigo-700">60fps 안정</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">터치 지연:</span>
                                        <span class="text-indigo-700">100ms 이하</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">데이터 백업:</span>
                                        <span class="text-indigo-700">클라우드 동기화</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    /**
     * 참조 섹션
     */
    static createReferencesSection() {
        return `
            <section class="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                <h3 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <svg class="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                    </svg>
                    6. 참고자료 및 출처 (References)
                </h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="space-y-4">
                        <h4 class="font-bold text-gray-700 mb-3">📚 학술 자료</h4>
                        <div class="bg-white rounded-lg p-4 space-y-2 text-sm">
                            <p class="font-medium">• Von Kries, J. (1902). "Chromatic Adaptation Theory"</p>
                            <p class="font-medium">• Munsell, A.H. (1915). "Atlas of the Munsell Color System"</p>
                            <p class="font-medium">• Hunt, R.W.G. (2004). "The Reproduction of Colour"</p>
                            <p class="font-medium">• Fairchild, M.D. (2013). "Color Appearance Models"</p>
                            <p class="font-medium">• CIE Publication 15:2004 "Colorimetry"</p>
                        </div>
                    </div>
                    <div class="space-y-4">
                        <h4 class="font-bold text-gray-700 mb-3">🏢 업계 표준</h4>
                        <div class="bg-white rounded-lg p-4 space-y-2 text-sm">
                            <p class="font-medium">• Sci\\ART Method (Kathryn Kalisz, 2000)</p>
                            <p class="font-medium">• House of Colour Standards (UK)</p>
                            <p class="font-medium">• Color Me Beautiful System (US)</p>
                            <p class="font-medium">• 한국퍼스널컬러협회 가이드라인</p>
                            <p class="font-medium">• K-뷰티 색상 매칭 표준</p>
                        </div>
                    </div>
                </div>
                
                <div class="mt-8 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <p class="text-blue-800 text-sm">
                        <strong>알림:</strong> 본 시스템은 과학적 연구와 업계 표준을 기반으로 개발되었으며, 
                        전문가 교육 및 실무 가이드 목적으로 제공됩니다. 
                        상업적 사용 시에는 해당 기관의 승인이 필요할 수 있습니다.
                    </p>
                </div>
            </section>
        `;
    }
}

// 전역으로 내보내기
window.ExpertManual = ExpertManual;

console.log('ExpertManual 컴포넌트 로딩 완료');
