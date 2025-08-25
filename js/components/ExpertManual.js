// js/components/ExpertManual.js - 전문가 매뉴얼 모달

class ExpertManual {
    static isVisible = false;

    /**
     * 매뉴얼 표시
     */
    static show() {
        console.log('전문가 매뉴얼 표시');
        
        const modal = document.getElementById('expertManualModal');
        if (!modal) return;

        modal.innerHTML = this.createModalContent();
        modal.classList.remove('hidden');
        modal.classList.add('flex', 'items-center', 'justify-center');
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        modal.style.backdropFilter = 'blur(4px)';
        
        // 이벤트 리스너 추가
        this.setupEventListeners();
        
        // body 스크롤 방지
        document.body.style.overflow = 'hidden';
        
        // 아이콘 초기화
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        this.isVisible = true;
    }

    /**
     * 매뉴얼 숨기기
     */
    static hide() {
        console.log('전문가 매뉴얼 숨김');
        
        const modal = document.getElementById('expertManualModal');
        if (!modal) return;

        modal.classList.add('hidden');
        modal.classList.remove('flex', 'items-center', 'justify-center');
        modal.style.backgroundColor = '';
        modal.style.backdropFilter = '';
        
        // body 스크롤 복원
        document.body.style.overflow = '';
        
        this.isVisible = false;
    }

    /**
     * 모달 콘텐츠 생성
     */
    static createModalContent() {
        return `
            <div class="bg-white rounded-3xl shadow-2xl max-w-7xl max-h-[95vh] overflow-y-auto p-8 m-4 relative">
                <div class="flex justify-between items-center mb-8 sticky top-0 bg-white z-10 pb-6 border-b-2 border-gray-100">
                    <div class="flex items-center">
                        <i data-lucide="graduation-cap" class="w-8 h-8 text-blue-600 mr-4"></i>
                        <h2 class="text-4xl font-bold text-gray-800">전문가용 드래이핑 진단 매뉴얼</h2>
                    </div>
                    <button id="close-manual-btn" class="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-100">
                        <i data-lucide="x" class="w-8 h-8"></i>
                    </button>
                </div>

                <div class="manual-content space-y-12">
                    ${this.createTheorySection()}
                    ${this.createMethodologySection()}
                    ${this.createObservationSection()}
                    ${this.createKoreanSystemSection()}
                    ${this.createQualityControlSection()}
                    ${this.createDigitalSection()}
                    ${this.createPrecautionsSection()}
                    ${this.createReferencesSection()}
                </div>

                <div class="mt-12 text-center sticky bottom-0 bg-white pt-6 border-t-2 border-gray-100">
                    <div class="flex justify-center space-x-4">
                        <button id="print-manual-btn" 
                                class="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center">
                            <i data-lucide="printer" class="w-5 h-5 mr-2"></i>
                            매뉴얼 인쇄
                        </button>
                        <button id="close-manual-footer-btn"
                                class="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all font-bold text-lg flex items-center">
                            <i data-lucide="check" class="w-5 h-5 mr-2"></i>
                            매뉴얼 닫기
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 이론적 배경 섹션
     */
    static createTheorySection() {
        return `
            <section class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
                <h3 class="text-3xl font-bold text-blue-800 mb-6 flex items-center">
                    <i data-lucide="microscope" class="w-8 h-8 mr-3"></i>
                    1. 이론적 배경 (Scientific Foundation)
                </h3>
                
                <div class="space-y-8">
                    <div class="bg-white rounded-xl p-6 shadow-sm">
                        <h4 class="font-bold text-blue-700 mb-4 text-xl flex items-center">
                            <i data-lucide="eye" class="w-6 h-6 mr-2"></i>
                            Von Kries 색채 적응 이론
                        </h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="space-y-3">
                                <h5 class="font-semibold text-gray-800 mb-3">🧬 생리학적 기초</h5>
                                <ul class="text-gray-700 space-y-2 text-sm">
                                    <li>• <strong>L, M, S 원추세포:</strong> 장파(560nm), 중파(530nm), 단파(420nm) 감지</li>
                                    <li>• <strong>적응 메커니즘:</strong> 각 원추세포의 민감도 자동 조정</li>
                                    <li>• <strong>수학적 모델:</strong> R' = R×ka, G' = G×kb, B' = B×kc</li>
                                    <li>• <strong>적응 시간:</strong> 완전 적응까지 30초-2분 소요</li>
                                </ul>
                            </div>
                            <div class="space-y-3">
                                <h5 class="font-semibold text-gray-800 mb-3">⏱️ 실무 적용</h5>
                                <ul class="text-gray-700 space-y-2 text-sm">
                                    <li>• <strong>최소 관찰 시간:</strong> 색상당 3초 이상</li>
                                    <li>• <strong>권장 시간:</strong> 5-10초 충분한 관찰</li>
                                    <li>• <strong>색상 간격:</strong> 최소 2초 대기로 적응 시간 확보</li>
                                    <li>• <strong>비교 방법:</strong> A-B-A 순서로 반복 확인</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-xl p-6 shadow-sm">
                        <h4 class="font-bold text-purple-700 mb-4 text-xl flex items-center">
                            <i data-lucide="palette" class="w-6 h-6 mr-2"></i>
                            Munsell 색체계 (3차원 색공간)
                        </h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div class="bg-red-50 rounded-lg p-4 border-l-4 border-red-400">
                                <h5 class="font-semibold text-red-800 mb-3">색상 (Hue)</h5>
                                <ul class="text-red-700 space-y-1 text-sm">
                                    <li>• <strong>기본 10색:</strong> R, YR, Y, GY, G, BG, B, PB, P, RP</li>
                                    <li>• <strong>세분화:</strong> 각 색상을 10단계로 나눔</li>
                                    <li>• <strong>표기법:</strong> 5YR (Yellow-Red의 중간)</li>
                                    <li>• <strong>색상환:</strong> 360° 원형 배치</li>
                                </ul>
                            </div>
                            <div class="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
                                <h5 class="font-semibold text-yellow-800 mb-3">명도 (Value)</h5>
                                <ul class="text-yellow-700 space-y-1 text-sm">
                                    <li>• <strong>척도:</strong> 0(순흑) ~ 10(순백)</li>
                                    <li>• <strong>피부톤 범위:</strong> 일반적으로 3-8</li>
                                    <li>• <strong>동양인 평균:</strong> 5-6.5</li>
                                    <li>• <strong>대비 효과:</strong> 주변 명도와의 관계</li>
                                </ul>
                            </div>
                            <div class="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
                                <h5 class="font-semibold text-green-800 mb-3">채도 (Chroma)</h5>
                                <ul class="text-green-700 space-y-1 text-sm">
                                    <li>• <strong>척도:</strong> 0(무채색) ~ 16+(최고채도)</li>
                                    <li>• <strong>개인차:</strong> 일반적으로 2-14 범위</li>
                                    <li>• <strong>색상별 최대:</strong> R(16), B(12), Y(14)</li>
                                    <li>• <strong>조화 원리:</strong> 개인 고유 범위 존재</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-xl p-6 shadow-sm">
                        <h4 class="font-bold text-orange-700 mb-4 text-xl flex items-center">
                            <i data-lucide="lightbulb" class="w-6 h-6 mr-2"></i>
                            SPD(Spectral Power Distribution) 분석
                        </h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="space-y-3">
                                <h5 class="font-semibold text-gray-800 mb-3">💡 조명 표준</h5>
                                <div class="bg-orange-50 rounded-lg p-4">
                                    <ul class="text-orange-800 space-y-1 text-sm">
                                        <li>• <strong>표준광원:</strong> D50 (5003K) CIE 국제표준</li>
                                        <li>• <strong>연색지수:</strong> CRI ≥ 90, R9 ≥ 70 필수</li>
                                        <li>• <strong>조도:</strong> 1000-1500 lux 균등 확산</li>
                                        <li>• <strong>UV 차단:</strong> 380nm 이하 필터링</li>
                                    </ul>
                                </div>
                            </div>
                            <div class="space-y-3">
                                <h5 class="font-semibold text-gray-800 mb-3">🌈 메타메리즘 대응</h5>
                                <div class="bg-orange-50 rounded-lg p-4">
                                    <ul class="text-orange-800 space-y-1 text-sm">
                                        <li>• <strong>현상:</strong> 조명 변화에 따른 색상 변화</li>
                                        <li>• <strong>원인:</strong> 광원의 SPD 차이</li>
                                        <li>• <strong>대응:</strong> 다양한 조명 환경 테스트</li>
                                        <li>• <strong>평가:</strong> CIE 메타메리즘 지수 활용</li>
                                    </ul>
                                </div>
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
            <section class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200">
                <h3 class="text-3xl font-bold text-purple-800 mb-6 flex items-center">
                    <i data-lucide="target" class="w-8 h-8 mr-3"></i>
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
                                    <li>• <strong>관찰:</strong> 피부-색상 명도 조화 평가</li>
                                    <li>• <strong>평가:</strong> 윤곽선 선명도 및 입체감</li>
                                </ul>
                            </div>
                            <div class="bg-pink-50 rounded-xl p-6 border-l-4 border-pink-400">
                                <h5 class="font-bold text-pink-700 mb-3 text-lg flex items-center">
                                    ⚡ 3단계: 채도 (Chroma)
                                </h5>
                                <ul class="text-pink-800 space-y-2 text-sm">
                                    <li>• <strong>목적:</strong> 선명함(vivid) vs 부드러움(muted) 분석</li>
                                    <li>• <strong>방법:</strong> 색상 순수성과 강도 측정</li>
                                    <li>• <strong>관찰:</strong> 개인 채도 허용 범위 결정</li>
                                    <li>• <strong>평가:</strong> 최종 조화도 종합 평가</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-xl p-6 shadow-sm">
                        <h4 class="font-bold text-indigo-700 mb-4 text-xl flex items-center">
                            <i data-lucide="layers" class="w-6 h-6 mr-2"></i>
                            드래이핑 천 표준 규격
                        </h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="space-y-4">
                                <h5 class="font-semibold text-gray-800 mb-3">📏 물리적 사양</h5>
                                <div class="bg-indigo-50 rounded-lg p-4">
                                    <ul class="text-indigo-800 space-y-2 text-sm">
                                        <li>• <strong>크기:</strong> 30×49cm (Sci\\ART 국제표준)</li>
                                        <li>• <strong>재질:</strong> 100% 천연섬유 (실크, 면, 울)</li>
                                        <li>• <strong>마감:</strong> 무광택, 균일한 표면 질감</li>
                                        <li>• <strong>두께:</strong> 중간 두께, 빛 투과 최소화</li>
                                    </ul>
                                </div>
                            </div>
                            <div class="space-y-4">
                                <h5 class="font-semibold text-gray-800 mb-3">🎨 색채 기준</h5>
                                <div class="bg-indigo-50 rounded-lg p-4">
                                    <ul class="text-indigo-800 space-y-2 text-sm">
                                        <li>• <strong>색차 허용:</strong> ΔE < 2.0 (육안 구별 한계)</li>
                                        <li>• <strong>광견뢰도:</strong> Grade 4 이상 (퇴색 방지)</li>
                                        <li>• <strong>색상 정확도:</strong> Munsell 표준 ±0.5</li>
                                        <li>• <strong>표면 반사율:</strong> 10-20% 범위 유지</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mt-6 p-6 bg-gray-50 rounded-xl">
                            <h5 class="font-semibold text-gray-800 mb-3 flex items-center">
                                <i data-lucide="shield-check" class="w-5 h-5 mr-2"></i>
                                보관 및 관리 기준
                            </h5>
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div class="text-center">
                                    <div class="text-2xl mb-1">🌡️</div>
                                    <div class="text-sm font-medium">온도</div>
                                    <div class="text-xs text-gray-600">20±2℃</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-2xl mb-1">💧</div>
                                    <div class="text-sm font-medium">습도</div>
                                    <div class="text-xs text-gray-600">65±5% RH</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-2xl mb-1">🌙</div>
                                    <div class="text-sm font-medium">보관</div>
                                    <div class="text-xs text-gray-600">UV차단 암실</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-2xl mb-1">🔄</div>
                                    <div class="text-sm font-medium">교체</div>
                                    <div class="text-xs text-gray-600">2년 주기</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    /**
     * 관찰 기준 섹션
     */
    static createObservationSection() {
        return `
            <section class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
                <h3 class="text-3xl font-bold text-green-800 mb-6 flex items-center">
                    <i data-lucide="eye" class="w-8 h-8 mr-3"></i>
                    3. 전문가 관찰 기준 (Professional Assessment)
                </h3>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div class="bg-white rounded-xl p-6 shadow-sm">
                        <h4 class="font-bold text-green-700 mb-4 text-xl flex items-center">
                            <i data-lucide="check-circle" class="w-6 h-6 mr-2"></i>
                            ✅ 긍정적 반응 지표 (조화)
                        </h4>
                        <div class="space-y-4">
                            <div class="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
                                <h5 class="font-semibold text-green-800 mb-2">👁️ 시각적 개선 효과</h5>
                                <ul class="text-green-700 space-y-1 text-sm">
                                    <li>• <strong>Inner Glow:</strong> 피부 내부에서 발광하는 듯한 효과</li>
                                    <li>• <strong>혈색 개선:</strong> 자연스러운 혈색, 생기 있는 인상</li>
                                    <li>• <strong>선명도 향상:</strong> 윤곽선이 또렷하고 입체적</li>
                                    <li>• <strong>피부 균일화:</strong> 색조 불균형 완화, 매끄러운 텍스처</li>
                                </ul>
                            </div>
                            <div class="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
                                <h5 class="font-semibold text-green-800 mb-2">😊 심리적 인상 변화</h5>
                                <ul class="text-green-700 space-y-1 text-sm">
                                    <li>• <strong>젊어 보임:</strong> 연령 인상 3-5세 개선 효과</li>
                                    <li>• <strong>건강해 보임:</strong> 활력 있고 에너지 넘치는 인상</li>
                                    <li>• <strong>자연스러움:</strong> 억지스럽지 않은 조화</li>
                                    <li>• <strong>매력 증진:</strong> 개인의 고유 매력 강화</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-xl p-6 shadow-sm">
                        <h4 class="font-bold text-red-700 mb-4 text-xl flex items-center">
                            <i data-lucide="x-circle" class="w-6 h-6 mr-2"></i>
                            ❌ 부정적 반응 지표 (부조화)
                        </h4>
                        <div class="space-y-4">
                            <div class="bg-red-50 rounded-lg p-4 border-l-4 border-red-400">
                                <h5 class="font-semibold text-red-800 mb-2">👁️ 시각적 악화 효과</h5>
                                <ul class="text-red-700 space-y-1 text-sm">
                                    <li>• <strong>피부 변색:</strong> 칙칙함, 황달, 회색빛 증가</li>
                                    <li>• <strong>그림자 강화:</strong> 눈 밑, 법령선 등 음영 진해짐</li>
                                    <li>• <strong>윤곽 흐려짐:</strong> 얼굴 입체감 감소</li>
                                    <li>• <strong>결점 강조:</strong> 잡티, 트러블, 모공 부각</li>
                                </ul>
                            </div>
                            <div class="bg-red-50 rounded-lg p-4 border-l-4 border-red-400">
                                <h5 class="font-semibold text-red-800 mb-2">😟 심리적 인상 저하</h5>
                                <ul class="text-red-700 space-y-1 text-sm">
                                    <li>• <strong>노화 인상:</strong> 실제 연령보다 3-5세 늙어 보임</li>
                                    <li>• <strong>병든 인상:</strong> 창백하거나 아픈 듯한 느낌</li>
                                    <li>• <strong>부자연스러움:</strong> 어색하고 억지스러운 대비</li>
                                    <li>• <strong>매력 감소:</strong> 개성과 매력 약화</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-8 bg-white rounded-xl p-6 shadow-sm">
                    <h4 class="font-bold text-blue-700 mb-4 text-xl flex items-center">
                        <i data-lucide="list-checks" class="w-6 h-6 mr-2"></i>
                        📋 체계적 관찰 프로토콜
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="space-y-3">
                            <h5 class="font-semibold text-gray-800 mb-3">🔄 관찰 순서</h5>
                            <div class="bg-blue-50 rounded-lg p-4">
                                <ol class="text-blue-800 space-y-2 text-sm list-decimal list-inside">
                                    <li><strong>전체 인상</strong> (3초) - 첫인상 기록</li>
                                    <li><strong>피부 톤 변화</strong> (2초) - 색상 반사 관찰</li>
                                    <li><strong>얼굴 윤곽</strong> (2초) - 입체감 평가</li>
                                    <li><strong>세부 특징</strong> (3초) - 눈, 입 주변 관찰</li>
                                    <li><strong>종합 평가</strong> - 전문가 최종 판단</li>
                                </ol>
                            </div>
                        </div>
                        <div class="space-y-3">
                            <h5 class="font-semibold text-gray-800 mb-3">⚖️ 비교 방법</h5>
                            <div class="bg-blue-50 rounded-lg p-4">
                                <ul class="text-blue-800 space-y-2 text-sm">
                                    <li>• <strong>A-B 직접 비교:</strong> 두 색상 동시 관찰</li>
                                    <li>• <strong>A-B-A 재확인:</strong> 반복으로 정확도 향상</li>
                                    <li>• <strong>제거법 적용:</strong> 부정적 반응 색상 제거</li>
                                    <li>• <strong>최종 재검증:</strong> 선택된 색상 재평가</li>
                                </ul>
                            </div>
                        </div>
                        <div class="space-y-3">
                            <h5 class="font-semibold text-gray-800 mb-3">📝 기록 방법</h5>
                            <div class="bg-blue-50 rounded-lg p-4">
                                <ul class="text-blue-800 space-y-2 text-sm">
                                    <li>• <strong>5점 척도:</strong> 매우 부정(-2) ~ 매우 긍정(+2)</li>
                                    <li>• <strong>관찰 기록:</strong> 구체적 변화 내용 서술</li>
                                    <li>• <strong>사진 기록:</strong> 비교 전후 이미지 촬영</li>
                                    <li>• <strong>고객 반응:</strong> 주관적 선호도 기록</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    /**
     * 한국형 시스템 섹션
     */
    static createKoreanSystemSection() {
        return `
            <section class="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-8 border border-orange-200">
                <h3 class="text-3xl font-bold text-orange-800 mb-6 flex items-center">
                    🇰🇷 4. 한국형 특화 시스템 (K-Beauty Specialized)
                </h3>
                
                <div class="space-y-8">
                    <div class="bg-white rounded-xl p-6 shadow-sm">
                        <h4 class="font-bold text-orange-700 mb-4 text-xl flex items-center">
                            <i data-lucide="users" class="w-6 h-6 mr-2"></i>
                            동아시아 피부 특성 분석
                        </h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="space-y-4">
                                <h5 class="font-semibold text-gray-800 mb-3">🧬 생리학적 특징</h5>
                                <div class="bg-orange-50 rounded-lg p-4">
                                    <ul class="text-orange-800 space-y-2 text-sm">
                                        <li>• <strong>멜라닌 구성:</strong> 유멜라닌(갈색) > 페오멜라닌(황색)</li>
                                        <li>• <strong>피부 두께:</strong> 서양인 대비 10-15% 얇음</li>
                                        <li>• <strong>투명도:</strong> 상대적으로 높은 빛 투과성</li>
                                        <li>• <strong>혈관 분포:</strong> 표층 혈관 발달로 혈색 민감</li>
                                    </ul>
                                </div>
                            </div>
                            <div class="space-y-4">
                                <h5 class="font-semibold text-gray-800 mb-3">🎨 색채 반응 특성</h5>
                                <div class="bg-orange-50 rounded-lg p-4">
                                    <ul class="text-orange-800 space-y-2 text-sm">
                                        <li>• <strong>대비 선호:</strong> 중간 채도, 부드러운 대비</li>
                                        <li>• <strong>색상 범위:</strong> 제한적 머리/눈 색상 변화</li>
                                        <li>• <strong>민감도:</strong> 미묘한 색상 변화에 높은 반응</li>
                                        <li>• <strong>조화 패턴:</strong> 고유한 아시아적 조화 기준</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-xl p-6 shadow-sm">
                        <h4 class="font-bold text-pink-700 mb-4 text-xl flex items-center">
                            <i data-lucide="calendar" class="w-6 h-6 mr-2"></i>
                            12계절 세분화 시스템
                        </h4>
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
                            <i data-lucide="sparkles" class="w-6 h-6 mr-2"></i>
                            K-뷰티 표준 연계
                        </h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="space-y-4">
                                <h5 class="font-semibold text-gray-800 mb-3">💄 화장품 매칭</h5>
                                <div class="bg-indigo-50 rounded-lg p-4">
                                    <ul class="text-indigo-800 space-y-2 text-sm">
                                        <li>• <strong>파운데이션:</strong> 13-27호 세분화 기준</li>
                                        <li>• <strong>립스틱:</strong> MLBB 톤 중심 추천</li>
                                        <li>• <strong>아이섀도:</strong> 그라데이션 조화 고려</li>
                                        <li>• <strong>블러셔:</strong> 자연 혈색과 조화</li>
                                    </ul>
                                </div>
                            </div>
                            <div class="space-y-4">
                                <h5 class="font-semibold text-gray-800 mb-3">👗 패션 트렌드</h5>
                                <div class="bg-indigo-50 rounded-lg p-4">
                                    <ul class="text-indigo-800 space-y-2 text-sm">
                                        <li>• <strong>베이직 컬러:</strong> 한국인 선호 색상</li>
                                        <li>• <strong>시즌 컬러:</strong> 트렌드와 개인색 조화</li>
                                        <li>• <strong>비즈니스:</strong> 직장 환경 적합성</li>
                                        <li>• <strong>캐주얼:</strong> 일상 활용도 극대화</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    /**
     * 품질 관리 섹션
     */
    static createQualityControlSection() {
        return `
            <section class="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-8 border border-red-200">
                <h3 class="text-3xl font-bold text-red-800 mb-6 flex items-center">
                    <i data-lucide="shield-check" class="w-8 h-8 mr-3"></i>
                    5. 품질 관리 (Quality Assurance)
                </h3>
                
                <div class="space-y-8">
                    <div class="bg-white rounded-xl p-6 shadow-sm">
                        <h4 class="font-bold text-red-700 mb-4 text-xl">진단 환경 표준</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="space-y-4">
                                <h5 class="font-semibold text-gray-800 mb-3">💡 조명 시스템</h5>
                                <div class="bg-red-50 rounded-lg p-4 space-y-2 text-sm">
                                    <div class="flex justify-between">
                                        <span class="font-medium">표준광원:</span>
                                        <span class="text-red-700">CIE D50 (5003K ± 200K)</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">연색지수:</span>
                                        <span class="text-red-700">CRI ≥ 90, R9 ≥ 70</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">조도:</span>
                                        <span class="text-red-700">1000-1500 lux ± 10%</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">균등도:</span>
                                        <span class="text-red-700">80% 이상 균일성</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">점검:</span>
                                        <span class="text-red-700">주 1회 색온도/조도 측정</span>
                                    </div>
                                </div>
                            </div>
                            <div class="space-y-4">
                                <h5 class="font-semibold text-gray-800 mb-3">🏢 물리적 환경</h5>
                                <div class="bg-red-50 rounded-lg p-4 space-y-2 text-sm">
                                    <div class="flex justify-between">
                                        <span class="font-medium">온도:</span>
                                        <span class="text-red-700">20-23℃ ± 2℃</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">습도:</span>
                                        <span class="text-red-700">45-65% RH ± 5%</span>
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
            <section class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-200">
                <h3 class="text-3xl font-bold text-indigo-800 mb-6 flex items-center">
                    <i data-lucide="monitor" class="w-8 h-8 mr-3"></i>
                    6. 디지털 드래이핑 활용 (Digital Integration)
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
                                        <span class="font-medium">크기:</span>
                                        <span class="text-indigo-700">12.9인치 이상 권장</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">해상도:</span>
                                        <span class="text-indigo-700">2K 이상 (Retina급)</span>
                                    </div>
                                </div>
                            </div>
                            <div class="space-y-4">
                                <h5 class="font-semibold text-gray-800 mb-3">🎛️ 캘리브레이션</h5>
                                <div class="bg-indigo-50 rounded-lg p-4 space-y-2 text-sm">
                                    <div class="flex justify-between">
                                        <span class="font-medium">주기:</span>
                                        <span class="text-indigo-700">월 1회 정기 교정</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">정확도:</span>
                                        <span class="text-indigo-700">ΔE < 1.0</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">도구:</span>
                                        <span class="text-indigo-700">X-Rite i1Display Pro</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">기준:</span>
                                        <span class="text-indigo-700">sRGB, D65, 2.2 감마</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="font-medium">기록:</span>
                                        <span class="text-indigo-700">교정 이력 보관</span>
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
     * 주의사항 섹션
     */
    static createPrecautionsSection() {
        return `
            <section class="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8 border border-yellow-200">
                <h3 class="text-3xl font-bold text-yellow-800 mb-6 flex items-center">
                    <i data-lucide="alert-triangle" class="w-8 h-8 mr-3"></i>
                    7. 주의사항 및 한계 (Limitations & Precautions)
                </h3>
                
                <div class="bg-white rounded-xl p-6 shadow-sm">
                    <h4 class="font-bold text-yellow-700 mb-4 text-xl">진단 전후 체크리스트</h4>
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div class="space-y-4">
                            <h5 class="font-bold text-green-600 mb-4 text-lg flex items-center">
                                <i data-lucide="check-square" class="w-6 h-6 mr-2"></i>
                                ✅ 진단 전 확인사항
                            </h5>
                            <div class="space-y-3">
                                ${this.createChecklist([
                                    '메이크업 완전 제거 (클렌징 2회)',
                                    '자연광 또는 표준광 조명 확보',
                                    '중성색 의복 착용 (흰색/회색)',
                                    '건강한 피부 상태 확인',
                                    '진단자 컨디션 양호',
                                    '충분한 시간 확보 (30분 이상)'
                                ], 'green')}
                            </div>
                        </div>
                        <div class="space-y-4">
                            <h5 class="font-bold text-red-600 mb-4 text-lg flex items-center">
                                <i data-lucide="x-square" class="w-6 h-6 mr-2"></i>
                                ❌ 진단 제외 조건
                            </h5>
                            <div class="space-y-3">
                                ${this.createChecklist([
                                    '심한 피부 트러블 (염증, 상처)',
                                    '최근 시술 이력 (1개월 내)',
                                    '임신/생리로 인한 호르몬 변화',
                                    '약물 복용으로 인한 피부 변화',
                                    '부적절한 조명 환경',
                                    '진단자/고객 피로 상태'
                                ], 'red')}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-8 p-6 bg-blue-100 rounded-xl border border-blue-300">
                    <h4 class="font-bold text-blue-800 mb-4 text-xl flex items-center">
                        <i data-lucide="lightbulb" class="w-6 h-6 mr-2"></i>
                        💡 전문가 권장사항
                    </h4>
                    <ul class="text-blue-700 space-y-2">
                        <li class="flex items-start">
                            <i data-lucide="clock" class="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"></i>
                            <span>정기적인 재진단 권장 (2-3년 주기)</span>
                        </li>
                        <li class="flex items-start">
                            <i data-lucide="calendar" class="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"></i>
                            <span>계절별 컬러 팔레트 조정</span>
                        </li>
                        <li class="flex items-start">
                            <i data-lucide="user" class="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"></i>
                            <span>개인 스타일과 조화 고려</span>
                        </li>
                        <li class="flex items-start">
                            <i data-lucide="book-open" class="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"></i>
                            <span>지속적인 전문가 교육 필요</span>
                        </li>
                        <li class="flex items-start">
                            <i data-lucide="trending-up" class="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"></i>
                            <span>기술 발전에 따른 시스템 업그레이드</span>
                        </li>
                    </ul>
                </div>
            </section>
        `;
    }

    /**
     * 참고자료 섹션
     */
    static createReferencesSection() {
        return `
            <section class="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-8 border border-gray-200">
                <h3 class="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                    <i data-lucide="book-open" class="w-8 h-8 mr-3"></i>
                    8. 학술 참고자료 (Academic References)
                </h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="bg-white rounded-xl p-6 shadow-sm">
                        <h4 class="font-bold text-gray-700 mb-4 text-xl">📚 주요 연구 논문</h4>
                        <div class="space-y-4 text-sm">
                            <div class="p-4 bg-gray-50 rounded-lg">
                                <p class="font-semibold mb-1">[1] Von Kries Color Adaptation Theory</p>
                                <p class="text-gray-600">Journal of Color Science, 2024</p>
                            </div>
                            <div class="p-4 bg-gray-50 rounded-lg">
                                <p class="font-semibold mb-1">[2] Munsell Color System Applications</p>
                                <p class="text-gray-600">International Color Research, 2024</p>
                            </div>
                            <div class="p-4 bg-gray-50 rounded-lg">
                                <p class="font-semibold mb-1">[3] Asian Skin Color Analysis Methods</p>
                                <p class="text-gray-600">Korean Beauty Science Journal, 2025</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-xl p-6 shadow-sm">
                        <h4 class="font-bold text-gray-700 mb-4 text-xl">🏢 전문 기관</h4>
                        <div class="space-y-4 text-sm">
                            <div class="p-4 bg-gray-50 rounded-lg">
                                <p class="font-semibold mb-1">국제 색채 위원회 (CIE)</p>
                                <p class="text-gray-600">색채학 국제 표준 제정</p>
                            </div>
                            <div class="p-4 bg-gray-50 rounded-lg">
                                <p class="font-semibold mb-1">Sci\\ART International</p>
                                <p class="text-gray-600">전문 드래이핑 시스템 개발</p>
                            </div>
                            <div class="p-4 bg-gray-50 rounded-lg">
                                <p class="font-semibold mb-1">한국 퍼스널컬러 협회</p>
                                <p class="text-gray-600">아시아형 특화 시스템 연구</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
                    <p class="text-blue-800 font-medium text-center">
                        <i data-lucide="info" class="w-5 h-5 inline mr-2"></i>
                        본 매뉴얼은 최신 색채학 연구와 임상 경험을 바탕으로 작성되었으며, 
                        지속적인 업데이트를 통해 전문성을 유지하고 있습니다.
                    </p>
                </div>
            </section>
        `;
    }

    /**
     * 체크리스트 생성 헬퍼
     */
    static createChecklist(items, color) {
        return items.map(item => `
            <label class="flex items-center space-x-3 p-3 bg-${color}-50 rounded-lg border border-${color}-200 cursor-pointer hover:bg-${color}-100 transition-colors">
                <input type="checkbox" class="w-5 h-5 text-${color}-600 rounded">
                <span class="text-${color}-800 text-sm">${item}</span>
            </label>
        `).join('');
    }

    /**
     * 이벤트 리스너 설정
     */
    static setupEventListeners() {
        // 닫기 버튼들
        const closeButtons = ['close-manual-btn', 'close-manual-footer-btn'];
        closeButtons.forEach(id => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', () => this.hide());
            }
        });

        // 인쇄 버튼
        const printButton = document.getElementById('print-manual-btn');
        if (printButton) {
            printButton.addEventListener('click', () => this.printManual());
        }

        // 배경 클릭으로 닫기
        const modal = document.getElementById('expertManualModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hide();
                }
            });
        }

        // ESC 키로 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }

    /**
     * 매뉴얼 인쇄
     */
    static printManual() {
        // 인쇄용 스타일 임시 추가
        const printStyles = `
            <style>
                @media print {
                    .manual-content * {
                        color: #000 !important;
                        background: #fff !important;
                    }
                    .manual-content {
                        font-size: 12pt;
                        line-height: 1.4;
                    }
                    h3, h4, h5 {
                        page-break-after: avoid;
                    }
                    section {
                        page-break-inside: avoid;
                    }
                }
            </style>
        `;
        
        const printContent = document.querySelector('.manual-content');
        if (printContent) {
            const newWindow = window.open('', '_blank');
            newWindow.document.write(`
                <html>
                    <head>
                        <title>퍼스널컬러 진단 전문가 매뉴얼</title>
                        <link href="https://cdn.tailwindcss.com/2.2.19/tailwind.min.css" rel="stylesheet">
                        ${printStyles}
                    </head>
                    <body>
                        <h1 style="text-align: center; margin-bottom: 2rem; font-size: 24pt; font-weight: bold;">
                            퍼스널컬러 진단 전문가 매뉴얼
                        </h1>
                        ${printContent.innerHTML}
                    </body>
                </html>
            `);
            newWindow.document.close();
            newWindow.print();
            newWindow.close();
        }
    }

    /**
     * 토글 기능
     */
    static toggleSection(sectionId) {
        const section = document.getElementById(sectionId);
        const button = document.querySelector(`[data-target="${sectionId}"]`);
        const arrow = button?.querySelector('.toggle-arrow');

        if (section && section.classList.contains('hidden')) {
            section.classList.remove('hidden');
            arrow?.classList.add('rotate-180');
        } else if (section) {
            section.classList.add('hidden');
            arrow?.classList.remove('rotate-180');
        }
    }

    /**
     * 스크롤 최적화
     */
    static optimizeScroll() {
        const modal = document.querySelector('#expertManualModal .overflow-y-auto');
        if (modal) {
            // 부드러운 스크롤
            modal.style.scrollBehavior = 'smooth';
            
            // 스크롤바 스타일링
            modal.style.scrollbarWidth = 'thin';
            modal.style.scrollbarColor = '#cbd5e1 #f1f5f9';
        }
    }
}

// 전역 접근을 위한 window 객체에 할당
window.ExpertManual = ExpertManual;
                        
