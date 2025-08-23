// js/components/ExpertManual.js - 전문가 매뉴얼 모달

class ExpertManual {
    static show() {
        const modal = document.getElementById('expert-manual-modal');
        if (!modal) return;

        modal.innerHTML = this.createModalContent();
        modal.classList.add('flex', 'items-center', 'justify-center', 'modal-backdrop');
        modal.classList.remove('hidden');
        
        // 이벤트 리스너 추가
        this.setupEventListeners();
        
        // body 스크롤 방지
        document.body.style.overflow = 'hidden';
        
        // 아이콘 초기화
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    static hide() {
        const modal = document.getElementById('expert-manual-modal');
        if (!modal) return;

        modal.classList.add('hidden');
        modal.classList.remove('flex', 'items-center', 'justify-center', 'modal-backdrop');
        
        // body 스크롤 복원
        document.body.style.overflow = '';
    }

    static createModalContent() {
        return `
            <div class="bg-white rounded-2xl shadow-2xl max-w-6xl max-h-[90vh] overflow-y-auto p-8 m-4">
                <div class="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pb-4 border-b">
                    <h2 class="text-3xl font-bold text-gray-800">🎓 전문가용 드래이핑 진단 매뉴얼</h2>
                    <button id="close-manual-btn" class="text-gray-500 hover:text-gray-700 text-2xl transition-colors">
                        <i data-lucide="x" class="w-8 h-8"></i>
                    </button>
                </div>

                <div class="manual-content space-y-8 text-sm">
                    ${this.createTheorySection()}
                    ${this.createMethodologySection()}
                    ${this.createObservationSection()}
                    ${this.createKoreanSystemSection()}
                    ${this.createQualityControlSection()}
                    ${this.createDigitalSection()}
                    ${this.createPrecautionsSection()}
                </div>

                <div class="mt-8 text-center sticky bottom-0 bg-white pt-4 border-t">
                    <button
                        id="close-manual-footer-btn"
                        class="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all font-semibold"
                    >
                        매뉴얼 닫기
                    </button>
                </div>
            </div>
        `;
    }

    static createTheorySection() {
        return `
            <section class="bg-blue-50 rounded-lg p-6">
                <h3 class="text-xl font-bold text-blue-800 mb-4">🔬 1. 이론적 배경 (Scientific Foundation)</h3>
                
                <div class="space-y-4">
                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-bold text-blue-700 mb-3">Von Kries 색채 적응 이론 (Chromatic Adaptation Theory)</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div>
                                <h5 class="font-semibold mb-2">이론적 기초</h5>
                                <ul class="text-gray-700 space-y-1">
                                    <li>• <strong>원추세포 적응:</strong> L(장파), M(중파), S(단파) 원추세포의 민감도 자동 조정</li>
                                    <li>• <strong>적응 공식:</strong> R' = R×ka, G' = G×kb, B' = B×kc</li>
                                    <li>• <strong>적응 계수:</strong> ka, kb, kc는 조명 조건에 따른 변수</li>
                                    <li>• <strong>시간 의존성:</strong> 완전 적응까지 약 30초-2분 소요</li>
                                </ul>
                            </div>
                            <div>
                                <h5 class="font-semibold mb-2">실무 적용</h5>
                                <ul class="text-gray-700 space-y-1">
                                    <li>• <strong>관찰 시간:</strong> 최소 3초, 권장 5-10초</li>
                                    <li>• <strong>드래이핑 간격:</strong> 색상 간 최소 2초 대기</li>
                                    <li>• <strong>순차적 비교:</strong> A-B-A 순서로 반복 확인</li>
                                    <li>• <strong>환경 통제:</strong> 일정한 조명, 중성 배경</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-bold text-purple-700 mb-3">Munsell 색체계 (3차원 색공간)</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div>
                                <h5 class="font-semibold mb-2">색상 (Hue)</h5>
                                <ul class="text-gray-700 space-y-1">
                                    <li>• <strong>기본 10색상:</strong> 5R, 5YR, 5Y, 5GY, 5G, 5BG, 5B, 5PB, 5P, 5RP</li>
                                    <li>• <strong>중간색:</strong> 각 기본색 사이 10단계 세분화</li>
                                    <li>• <strong>표기법:</strong> 5YR (5 Yellow-Red)</li>
                                    <li>• <strong>색상환:</strong> 360° 원형 배치</li>
                                </ul>
                            </div>
                            <div>
                                <h5 class="font-semibold mb-2">명도 (Value)</h5>
                                <ul class="text-gray-700 space-y-1">
                                    <li>• <strong>척도:</strong> 0(완전검정) ~ 10(완전백색)</li>
                                    <li>• <strong>피부톤 범위:</strong> 일반적으로 3-8</li>
                                    <li>• <strong>동양인 평균:</strong> 5-6.5</li>
                                    <li>• <strong>대비 효과:</strong> 주변 명도와의 상대적 관계</li>
                                </ul>
                            </div>
                            <div>
                                <h5 class="font-semibold mb-2">채도 (Chroma)</h5>
                                <ul class="text-gray-700 space-y-1">
                                    <li>• <strong>척도:</strong> 0(무채색) ~ 16+(최고채도)</li>
                                    <li>• <strong>개인차 범위:</strong> 일반적으로 2-14</li>
                                    <li>• <strong>색상별 최대:</strong> 빨강(16), 파랑(12), 노랑(14)</li>
                                    <li>• <strong>조화 원리:</strong> 개인 고유의 채도 범위 존재</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-bold text-orange-700 mb-3">SPD(Spectral Power Distribution) 분석</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div>
                                <h5 class="font-semibold mb-2">조명 기준</h5>
                                <ul class="text-gray-700 space-y-1">
                                    <li>• <strong>표준광원:</strong> D50 (5003K), CIE 표준</li>
                                    <li>• <strong>연색지수:</strong> CRI ≥ 90, R9 ≥ 70 필수</li>
                                    <li>• <strong>조도:</strong> 1000-1500 lux, 균등 확산</li>
                                    <li>• <strong>UV 차단:</strong> 380nm 이하 필터링</li>
                                </ul>
                            </div>
                            <div>
                                <h5 class="font-semibold mb-2">메타메리즘 고려</h5>
                                <ul class="text-gray-700 space-y-1">
                                    <li>• <strong>정의:</strong> 조명에 따른 색상 변화 현상</li>
                                    <li>• <strong>주요 원인:</strong> 광원의 SPD 차이</li>
                                    <li>• <strong>대응책:</strong> 다양한 조명 조건 테스트</li>
                                    <li>• <strong>평가 지표:</strong> CIE 메타메리즘 지수 활용</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    static createMethodologySection() {
        return `
            <section class="bg-purple-50 rounded-lg p-6">
                <h3 class="text-xl font-bold text-purple-800 mb-4">🎯 2. Sci\\ART 방법론</h3>
                
                <div class="space-y-4">
                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-bold text-purple-700 mb-3">3단계 분석 프로토콜</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div class="border-l-4 border-orange-400 pl-4">
                                <h5 class="font-semibold text-orange-700 mb-2">1단계: 온도감 (Temperature)</h5>
                                <ul class="text-gray-700 space-y-1">
                                    <li>• 황색(warm) vs 청색(cool) 언더톤 분석</li>
                                    <li>• 4개씩 총 8개 색상 비교</li>
                                    <li>• 피부 반사광의 스펙트럼 관찰</li>
                                    <li>• 혈색, 생기, 조화도 평가</li>
                                </ul>
                            </div>
                            <div class="border-l-4 border-blue-400 pl-4">
                                <h5 class="font-semibold text-blue-700 mb-2">2단계: 명도 (Value)</h5>
                                <ul class="text-gray-700 space-y-1">
                                    <li>• 밝음(light) vs 깊음(deep) 대비 분석</li>
                                    <li>• 개인 최적 명도 범위 측정</li>
                                    <li>• 피부-색상 명도 조화 평가</li>
                                    <li>• 윤곽선 선명도 관찰</li>
                                </ul>
                            </div>
                            <div class="border-l-4 border-pink-400 pl-4">
                                <h5 class="font-semibold text-pink-700 mb-2">3단계: 채도 (Chroma)</h5>
                                <ul class="text-gray-700 space-y-1">
                                    <li>• 선명함(vivid) vs 부드러움(muted) 분석</li>
                                    <li>• 색상 순수성과 강도 측정</li>
                                    <li>• 개인 채도 허용 범위 결정</li>
                                    <li>• 최종 조화도 종합 평가</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-bold text-indigo-700 mb-3">드래이핑 천 표준 규격</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div>
                                <h5 class="font-semibold mb-2">물리적 사양</h5>
                                <ul class="text-gray-700 space-y-1">
                                    <li>• <strong>크기:</strong> 85cm × 110cm (Sci\\ART 표준)</li>
                                    <li>• <strong>재질:</strong> 100% 천연섬유 (실크, 면, 울)</li>
                                    <li>• <strong>마감:</strong> 무광택, 균일한 표면 질감</li>
                                    <li>• <strong>두께:</strong> 중간 두께, 빛 투과 최소화</li>
                                </ul>
                            </div>
                            <div>
                                <h5 class="font-semibold mb-2">색채 기준</h5>
                                <ul class="text-gray-700 space-y-1">
                                    <li>• <strong>색차:</strong> ΔE < 2.0 (육안 구별 한계)</li>
                                    <li>• <strong>퇴색 방지:</strong> 광견뢰도 Grade 4 이상</li>
                                    <li>• <strong>색상 정확도:</strong> Munsell 표준 ±0.5 허용</li>
                                    <li>• <strong>표면 반사율:</strong> 10-20% 범위 유지</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="mt-4 p-4 bg-gray-50 rounded">
                            <h5 class="font-semibold mb-2">보관 및 관리</h5>
                            <div class="grid grid-cols-2 gap-4 text-xs">
                                <ul class="text-gray-700 space-y-1">
                                    <li>• <strong>온도:</strong> 20±2℃ 유지</li>
                                    <li>• <strong>습도:</strong> 65±5% RH</li>
                                    <li>• <strong>차광:</strong> UV 차단, 암실 보관</li>
                                </ul>
                                <ul class="text-gray-700 space-y-1">
                                    <li>• <strong>청소:</strong> 건식 청소만 허용</li>
                                    <li>• <strong>점검:</strong> 월 1회 색상 검증</li>
                                    <li>• <strong>교체:</strong> 2년마다 정기 교체</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    static createObservationSection() {
        return `
            <section class="bg-green-50 rounded-lg p-6">
                <h3 class="text-xl font-bold text-green-800 mb-4">👁️ 3. 전문가 관찰 기준</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-bold text-green-700 mb-3">✅ 긍정적 반응 지표 (조화)</h4>
                        <div class="space-y-3 text-xs">
                            <div class="observation-positive p-3 rounded">
                                <h5 class="font-semibold mb-2">시각적 개선 효과</h5>
                                <ul class="text-gray-700 space-y-1">
                                    <li>• <strong>Inner Glow:</strong> 피부 내부에서 발광하는 듯한 효과</li>
                                    <li>• <strong>혈색 개선:</strong> 자연스러운 혈색, 생기 있는 인상</li>
                                    <li>• <strong>선명도 향상:</strong> 윤곽선이 또렷하고 입체적</li>
                                    <li>• <strong>피부 균일화:</strong> 색조 불균형 완화, 매끄러운 텍스처</li>
                                </ul>
                            </div>
                            <div class="observation-positive p-3 rounded">
                                <h5 class="font-semibold mb-2">심리적 인상 변화</h5>
                                <ul class="text-gray-700 space-y-1">
                                    <li>• <strong>젊어 보임:</strong> 연령 인상 개선 효과</li>
                                    <li>• <strong>건강해 보임:</strong> 활력 있고 에너지 넘치는 인상</li>
                                    <li>• <strong>자연스러움:</strong> 억지스럽지 않은 조화</li>
                                    <li>• <strong>매력 증진:</strong> 개인의 고유 매력 강화</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-bold text-red-700 mb-3">❌ 부정적 반응 지표 (부조화)</h4>
                        <div class="space-y-3 text-xs">
                            <div class="observation-negative p-3 rounded">
                                <h5 class="font-semibold mb-2">시각적 악화 효과</h5>
                                <ul class="text-gray-700 space-y-1">
                                    <li>• <strong>피부 변색:</strong> 칙칙함, 황달, 회색빛 증가</li>
                                    <li>• <strong>그림자 강화:</strong> 눈 밑, 법령선 등 음영 진해짐</li>
                                    <li>• <strong>윤곽 흐려짐:</strong> 얼굴 입체감 감소</li>
                                    <li>• <strong>결점 강조:</strong> 잡티, 트러블 부각</li>
                                </ul>
                            </div>
                            <div class="observation-negative p-3 rounded">
                                <h5 class="font-semibold mb-2">심리적 인상 저하</h5>
                                <ul class="text-gray-700 space-y-1">
                                    <li>• <strong>노화 인상:</strong> 실제 연령보다 늙어 보임</li>
                                    <li>• <strong>병든 인상:</strong> 창백하거나 아픈 듯한 느낌</li>
                                    <li>• <strong>부자연스러움:</strong> 어색하고 억지스러운 대비</li>
                                    <li>• <strong>매력 감소:</strong> 개성과 매력 약화</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-6 bg-white rounded-lg p-4">
                    <h4 class="font-bold text-blue-700 mb-3">📋 체계적 관찰 프로토콜</h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div>
                            <h5 class="font-semibold mb-2">관찰 순서</h5>
                            <ol class="text-gray-700 space-y-1 list-decimal list-inside">
                                <li>전체적 인상 (3초)</li>
                                <li>피부 톤 변화 (2초)</li>
                                <li>얼굴 윤곽 (2초)</li>
                                <li>세부 특징 (3초)</li>
                                <li>종합 평가 (전문가 판단)</li>
                            </ol>
                        </div>
                        <div>
                            <h5 class="font-semibold mb-2">비교 방법</h5>
                            <ul class="text-gray-700 space-y-1">
                                <li>• A-B 직접 비교</li>
                                <li>• A-B-A 반복 확인</li>
                                <li>• 제거법 적용</li>
                                <li>• 최종 재검증</li>
                            </ul>
                        </div>
                        <div>
                            <h5 class="font-semibold mb-2">기록 방법</h5>
                            <ul class="text-gray-700 space-y-1">
                                <li>• 5점 척도 평가</li>
                                <li>• 구체적 관찰 내용</li>
                                <li>• 사진 촬영 기록</li>
                                <li>• 고객 반응 기록</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    static createKoreanSystemSection() {
        return `
            <section class="bg-orange-50 rounded-lg p-6">
                <h3 class="text-xl font-bold text-orange-800 mb-4">🇰🇷 4. 한국형 특화 시스템</h3>
                
                <div class="space-y-4">
                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-bold text-orange-700 mb-3">동아시아 피부 특성 분석</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div>
                                <h5 class="font-semibold mb-2">생리학적 특징</h5>
                                <ul class="text-gray-700 space-y-1">
                                    <li>• <strong>멜라닌 구성:</strong> 유멜라닌(갈색) > 페오멜라닌(황색)</li>
                                    <li>• <strong>피부 두께:</strong> 서양인 대비 10-15% 얇음</li>
                                    <li>• <strong>투명도:</strong> 상대적으로 높은 투과성</li>
                                    <li>• <strong>혈관 분포:</strong> 표층 혈관 발달</li>
                                </ul>
                            </div>
                            <div>
                                <h5 class="font-semibold mb-2">색채 반응 특성</h5>
                                <ul class="text-gray-700 space-y-1">
                                    <li>• <strong>대비 선호:</strong> 중간 채도, 부드러운 대비</li>
                                    <li>• <strong>색상 범위:</strong> 제한적 머리/눈 색상 변화</li>
                                    <li>• <strong>민감도:</strong> 미묘한 색상 변화에 높은 반응</li>
                                    <li>• <strong>조화 패턴:</strong> 고유한 아시아적 조화 기준</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-bold text-pink-700 mb-3">12계절 세분화 시스템</h4>
                        <div class="grid grid-cols-4 gap-3 text-xs">
                            <div class="text-center p-3 bg-yellow-50 rounded border">
                                <h5 class="font-semibold text-yellow-700 mb-2">🌸 Spring</h5>
                                <ul class="text-gray-700 space-y-1">
                                    <li><strong>Light:</strong> 밝고 부드러움</li>
                                    <li><strong>True:</strong> 선명하고 따뜻함</li>
                                    <li><strong>Deep:</strong> 깊고 풍부함</li>
                                </ul>
                            </div>
                            <div class="text-center p-3 bg-blue-50 rounded border">
                                <h5 class="font-semibold text-blue-700 mb-2">🌊 Summer</h5>
                                <ul class="text-gray-700 space-y-1">
                                    <li><strong>Light:</strong> 밝고 쿨함</li>
                                    <li><strong>True:</strong> 중간 쿨톤</li>
                                    <li><strong>Deep:</strong> 깊고 차가움</li>
                                </ul>
                            </div>
                            <div class="text-center p-3 bg-orange-50 rounded border">
                                <h5 class="font-semibold text-orange-700 mb-2">🍂 Autumn</h5>
                                <ul class="text-gray-700 space-y-1">
                                    <li><strong>Soft:</strong> 부드럽고 따뜻함</li>
                                    <li><strong>True:</strong> 진한 가을색</li>
                                    <li><strong>Deep:</strong> 가장 깊은 웜톤</li>
                                </ul>
                            </div>
                            <div class="text-center p-3 bg-purple-50 rounded border">
                                <h5 class="font-semibold text-purple-700 mb-2">❄️ Winter</h5>
                                <ul class="text-gray-700 space-y-1">
                                    <li><strong>Bright:</strong> 선명하고 차가움</li>
                                    <li><strong>True:</strong> 진정한 겨울톤</li>
                                    <li><strong>Deep:</strong> 가장 깊은 쿨톤</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-bold text-indigo-700 mb-3">K-뷰티 표준 연계</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div>
                                <h5 class="font-semibold mb-2">화장품 매칭</h5>
                                <ul class="text-gray-700 space-y-1">
                                    <li>• <strong>파운데이션:</strong> 21-27호 세분화 기준</li>
                                    <li>• <strong>립스틱:</strong> MLBB 톤 중심 추천</li>
                                    <li>• <strong>아이섀도:</strong> 그라데이션 조화 고려</li>
                                    <li>• <strong>블러셔:</strong> 자연 혈색과 조화</li>
                                </ul>
                            </div>
                            <div>
                                <h5 class="font-semibold mb-2">패션 트렌드</h5>
                                <ul class="text-gray-700 space-y-1">
                                    <li>• <strong>베이직 컬러:</strong> 한국인 선호 색상</li>
                                    <li>• <strong>시즌 컬러:</strong> 트렌드와 개인색 조화</li>
                                    <li>• <strong>비즈니스:</strong> 직장 환경 적합성</li>
                                    <li>• <strong>캐주얼:</strong> 일상 활용도 극대화</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    static createQualityControlSection() {
        return `
            <section class="bg-red-50 rounded-lg p-6">
                <h3 class="text-xl font-bold text-red-800 mb-4">⚡ 5. 품질 관리 (Quality Control)</h3>
                
                <div class="space-y-4">
                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-bold text-red-700 mb-3">진단 환경 표준</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div>
                                <h5 class="font-semibold mb-2">조명 시스템</h5>
                                <ul class="text-gray-700 space-y-1">
                                    <li>• <strong>표준광원:</strong> CIE D50 (5003K ± 200K)</li>
                                    <li>• <strong>연색지수:</strong> CRI ≥ 90, R9 ≥ 70</li>
                                    <li>• <strong>조도:</strong> 1000-1500 lux ± 10%</li>
                                    <li>• <strong>균등도:</strong> 80% 이상 균일성</li>
                                    <li>• <strong>점검:</strong> 주 1회 색온도/조도 측정</li>
                                </ul>
                            </div>
                            <div>
                                <h5 class="font-semibold mb-2">물리적 환경</h5>
                                <ul class="text-gray-700 space-y-1">
                                    <li>• <strong>온도:</strong> 20-23℃ ± 2℃</li>
                                    <li>• <strong>습도:</strong> 45-65% RH ± 5%</li>
                                    <li>• <strong>배경:</strong> 중성회색 N5, 무반사</li>
                                    <li>• <strong>차광:</strong> 외부광 완전 차단</li>
                                    <li>• <strong>소음:</strong> 40dB 이하 유지</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-bold text-blue-700 mb-3">진단자 자격 기준</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div>
                                <h5 class="font-semibold mb-2">기본 요구사항</h5>
                                <ul class="text-gray-700 space-y-1">
                                    <li>• <strong>색각 검사:</strong> Ishihara 24판 완전 통과</li>
                                    <li>• <strong>세밀 검사:</strong> Farnsworth D-15 오류 0개</li>
                                    <li>• <strong>시력:</strong> 교정시력 1.0 이상</li>
                                    <li>• <strong>연령:</strong> 만 25-55세 권장</li>
                                </ul>
                            </div>
                            <div>
                                <h5 class="font-semibold mb-2">교육 및 경험</h5>
                                <ul class="text-gray-700 space-y-1">
                                    <li>• <strong>이론 교육:</strong> 색채학 20시간</li>
                                    <li>• <strong>실습 교육:</strong> 드래이핑 20시간</li>
                                    <li>• <strong>실무 경험:</strong> 최소 100케이스</li>
                                    <li>• <strong>재교육:</strong> 연 1회 8시간</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-bold text-purple-700 mb-3">정확도 검증 시스템</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div>
                                <h5 class="font-semibold mb-2">교차 검증</h5>
                                <ul class="text-gray-700 space-y-1">
                                    <li>• 다중 진단자 독립 평가</li>
                                    <li>• 85% 이상 일치율 요구</li>
                                    <li>• 불일치 시 재진단</li>
                                    <li>• 전문가 패널 최종 판정</li>
                                </ul>
                            </div>
                            <div>
                                <h5 class="font-semibold mb-2">재현성 검증</h5>
                                <ul class="text-gray-700 space-y-1">
                                    <li>• 동일 대상자 재검사</li>
                                    <li>• 1개월 간격 2회 진단</li>
                                    <li>• 90% 이상 재현율</li>
                                    <li>• Cohen's Kappa > 0.8</li>
                                </ul>
                            </div>
                            <div>
                                <h5 class="font-semibold mb-2">통계적 분석</h5>
                                <ul class="text-gray-700 space-y-1">
                                    <li>• 월별 정확도 집계</li>
                                    <li>• 진단자별 성과 분석</li>
                                    <li>• 오류 패턴 분석</li>
                                    <li>• 개선방안 도출</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    static createDigitalSection() {
        return `
            <section class="bg-indigo-50 rounded-lg p-6">
                <h3 class="text-xl font-bold text-indigo-800 mb-4">💻 6. 디지털 드래이핑 활용</h3>
                
                <div class="space-y-4">
                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-bold text-indigo-700 mb-3">하드웨어 요구사항</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div>
                                <h5 class="font-semibold mb-2">디스플레이 사양</h5>
                                <ul class="text-gray-700 space-y-1">
                                    <li>• <strong>색역:</strong> sRGB 99%+ 커버리지</li>
                                    <li>• <strong>밝기:</strong> 300cd/m² 이상</li>
                                    <li>• <strong>패널:</strong> IPS 또는 OLED</li>
                                    <li>• <strong>크기:</strong> 12.9인치 이상 권장</li>
                                    <li>• <strong>해상도:</strong> 2K 이상</li>
                                </ul>
                            </div>
                            <div>
                                <h5 class="font-semibold mb-2">캘리브레이션</h5>
                                <ul class="text-gray-700 space-y-1">
                                    <li>• <strong>주기:</strong> 월 1회 정기 교정</li>
                                    <li>• <strong>정확도:</strong> ΔE < 1.0</li>
                                    <li>• <strong>도구:</strong> X-Rite i1Display Pro</li>
                                    <li>• <strong>기준:</strong> sRGB, D65, 2.2 감마</li>
                                    <li>• <strong>기록:</strong> 교정 이력 보관</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-bold text-purple-700 mb-3">소프트웨어 기능</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div>
                                <h5 class="font-semibold mb-2">색상 관리</h5>
                                <ul class="text-gray-700 space-y-1">
                                    <li>• ICC 프로파일 적용</li>
                                    <li>• 색공간 변환 정확성</li>
                                    <li>• 실시간 색상 보정</li>
                                    <li>• 메타메리즘 시뮬레이션</li>
                                </ul>
                            </div>
                            <div>
                                <h5 class="font-semibold mb-2">AI 분석</h5>
                                <ul class="text-gray-700 space-y-1">
                                    <li>• 얼굴 자동 인식</li>
                                    <li>• 피부톤 자동 분석</li>
                                    <li>• 색상 매칭 추천</li>
                                    <li>• 학습 데이터 축적</li>
                                </ul>
                            </div>
                            <div>
                                <h5 class="font-semibold mb-2">기록 시스템</h5>
                                <ul class="text-gray-700 space-y-1">
                                    <li>• 진단 과정 녹화</li>
                                    <li>• 결과 데이터베이스</li>
                                    <li>• 고객 히스토리</li>
                                    <li>• 통계 분석 도구</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-lg p-4">
                        <h4 class="font-bold text-green-700 mb-3">한국형 디지털 솔루션</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div class="p-3 bg-blue-50 rounded">
                                <h5 class="font-semibold text-blue-700 mb-2">아이컬러(iColor)</h5>
                                <ul class="text-gray-700 space-y-1">
                                    <li>• AI 기반 사진 분석</li>
                                    <li>• 12가지 색상 유형 분류</li>
                                    <li>• 20,000+ 화장품 DB</li>
                                    <li>• 실시간 AR 체험</li>
                                </ul>
                            </div>
                            <div class="p-3 bg-pink-50 rounded">
                                <h5 class="font-semibold text-pink-700 mb-2">AMOREPACIFIC</h5>
                                <ul class="text-gray-700 space-y-1">
                                    <li>• 150가지 피부톤 감지</li>
                                    <li>• 로봇 파운데이션 매칭</li>
                                    <li>• 커스터마이징 기술</li>
                                    <li>• 매장 연동 서비스</li>
                                </ul>
                            </div>
                            <div class="p-3 bg-green-50 rounded">
                                <h5 class="font-semibold text-green-700 mb-2">MyColor.kr</h5>
                                <ul class="text-gray-700 space-y-1">
                                    <li>• 딥러닝 웜/쿨톤 감지</li>
                                    <li>• 실시간 드래이핑</li>
                                    <li>• 전문가 원격 상담</li>
                                    <li>• 개인 컬러 리포트</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    static createPrecautionsSection() {
        return `
            <section class="bg-yellow-50 rounded-lg p-6">
                <h3 class="text-xl font-bold text-yellow-800 mb-4">⚠️ 7. 주의사항 및 한계</h3>
                
                <div class="bg-white rounded-lg p-4">
                    <h4 class="font-bold text-yellow-700 mb-3">진단 전후 체크리스트</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                        <div>
                            <h5 class="font-semibold text-green-600 mb-3">✅ 진단 전 확인사항</h5>
                            <div class="space-y-2">
                                <label class="flex items-center space-x-2">
                                    <input type="checkbox" class="text-green-600">
                                    <span>메이크업 완전 제거 (클렌징 2회)</span>
                                </label>
                                <label class="flex items-center space-x-2">
                                    <input type="checkbox" class="text-green-600">
                                    <span>자연광 또는 표준광 조명 확보</span>
                                </label>
                                <label class="flex items-center space-x-2">
                                    <input type="checkbox" class="text-green-600">
                                    <span>중성색 의복 착용 (흰색/회색)</span>
                                </label>
                                <label class="flex items-center space-x-2">
                                    <input type="checkbox" class="text-green-600">
                                    <span>건강한 피부 상태 확인</span>
                                </label>
                                <label class="flex items-center space-x-2">
                                    <input type="checkbox" class="text-green-600">
                                    <span>진단자 컨디션 양호</span>
                                </label>
                                <label class="flex items-center space-x-2">
                                    <input type="checkbox" class="text-green-600">
                                    <span>충분한 시간 확보 (30분 이상)</span>
                                </label>
                            </div>
                        </div>
                        <div>
                            <h5 class="font-semibold text-red-600 mb-3">❌ 진단 제외 조건</h5>
                            <div class="space-y-2">
                                <label class="flex items-center space-x-2">
                                    <input type="checkbox" class="text-red-600">
                                    <span>심한 피부 트러블 (염증, 상처)</span>
                                </label>
                                <label class="flex items-center space-x-2">
                                    <input type="checkbox" class="text-red-600">
                                    <span>최근 시술 이력 (1개월 내)</span>
                                </label>
                                <label class="flex items-center space-x-2">
                                    <input type="checkbox" class="text-red-600">
                                    <span>임신/생리로 인한 호르몬 변화</span>
                                </label>
                                <label class="flex items-center space-x-2">
                                    <input type="checkbox" class="text-red-600">
                                    <span>약물 복용으로 인한 피부 변화</span>
                                </label>
                                <label class="flex items-center space-x-2">
                                    <input type="checkbox" class="text-red-600">
                                    <span>부적절한 조명 환경</span>
                                </label>
                                <label class="flex items-center space-x-2">
                                    <input type="checkbox" class="text-red-600">
                                    <span>진단자/고객 피로 상태</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-4 bg-white rounded-lg p-4">
                    <h4 class="font-bold text-orange-700 mb-3">시스템 한계 및 고려사항</h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div>
                            <h5 class="font-semibold mb-2">기술적 한계</h5>
                            <ul class="text-gray-700 space-y-1">
                                <li>• 디스플레이 색재현율 제약</li>
                                <li>• 메타메리즘 완벽 재현 불가</li>
                                <li>• 개별 모니터 편차</li>
                                <li>• 주변광 영향</li>
                            </ul>
                        </div>
                        <div>
                            <h5 class="font-semibold mb-2">인적 요인</h5>
                            <ul class="text-gray-700 space-y-1">
                                <li>• 진단자 주관성</li>
                                <li>• 고객 선호도 개입</li>
                                <li>• 문화적 색상 인식 차이</li>
                                <li>• 경험과 훈련 수준</li>
                            </ul>
                        </div>
                        <div>
                            <h5 class="font-semibold mb-2">환경적 변수</h5>
                            <ul class="text-gray-700 space-y-1">
                                <li>• 계절별 피부 변화</li>
                                <li>• 연령에 따른 변화</li>
                                <li>• 건강 상태 영향</li>
                                <li>• 생활 환경 변화</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="mt-4 p-4 bg-blue-100 rounded-lg border border-blue-300">
                    <h4 class="font-bold text-blue-800 mb-2">💡 전문가 권장사항</h4>
                    <ul class="text-blue-700 text-sm space-y-1">
                        <li>• 정기적인 재진단 권장 (2-3년 주기)</li>
                        <li>• 계절별 컬러 팔레트 조정</li>
                        <li>• 개인 스타일과 조화 고려</li>
                        <li>• 지속적인 전문가 교육 필요</li>
                        <li>• 기술 발전에 따른 시스템 업그레이드</li>
                    </ul>
                </div>
            </section>
        `;
    }

    static setupEventListeners() {
        // 닫기 버튼들
        const closeButtons = ['close-manual-btn', 'close-manual-footer-btn'];
        closeButtons.forEach(id => {
            document.getElementById(id)?.addEventListener('click', () => {
                this.hide();
            });
        });

        // 배경 클릭으로 닫기
        document.getElementById('expert-manual-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'expert-manual-modal') {
                this.hide();
            }
        });

        // ESC 키로 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hide();
            }
        });
    }
}

// 전역 접근을 위한 window 객체에 할당
window.ExpertManual = ExpertManual;
