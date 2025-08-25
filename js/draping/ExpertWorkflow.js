/**
 * ExpertWorkflow.js
 * 헤어디자이너 전문가 워크플로우 시스템
 * 
 * 기능:
 * - 전문가용 진단 프로세스 관리
 * - 단계별 가이드라인 제공
 * - 고객 상담 히스토리 관리
 * - 결과 검증 및 승인 시스템
 * - 전문가 노하우 축적
 */

class ExpertWorkflow {
    constructor() {
        this.initialized = false;
        this.currentSession = null;
        this.sessionHistory = [];
        this.expertProfile = null;
        this.workflowTemplates = {};
        this.validationRules = {};
        
        console.log('👨‍🎨 ExpertWorkflow 생성자 실행');
    }

    /**
     * 시스템 초기화
     */
    async initialize(expertInfo = {}) {
        try {
            console.log('🚀 ExpertWorkflow 초기화 시작...');
            
            // 전문가 프로필 설정
            this.expertProfile = {
                id: expertInfo.id || 'expert_' + Date.now(),
                name: expertInfo.name || '전문가',
                level: expertInfo.level || 'senior', // junior, senior, master
                specialties: expertInfo.specialties || ['color_analysis', 'hair_styling'],
                certification: expertInfo.certification || [],
                experience_years: expertInfo.experience || 5,
                preferences: expertInfo.preferences || {}
            };
            
            // 워크플로우 템플릿 로드
            await this.loadWorkflowTemplates();
            
            // 검증 규칙 설정
            this.setupValidationRules();
            
            // 저장된 세션 히스토리 로드
            this.loadSessionHistory();
            
            this.initialized = true;
            console.log('✅ ExpertWorkflow 초기화 완료');
            return true;
            
        } catch (error) {
            console.error('❌ ExpertWorkflow 초기화 실패:', error);
            return false;
        }
    }

    /**
     * 워크플로우 템플릿 로드
     */
    async loadWorkflowTemplates() {
        this.workflowTemplates = {
            // 표준 퍼스널컬러 진단 워크플로우
            standard_diagnosis: {
                name: '표준 퍼스널컬러 진단',
                duration_estimate: 45, // 분
                steps: [
                    {
                        id: 'consultation',
                        name: '초기 상담',
                        duration: 10,
                        required_fields: ['customer_info', 'lifestyle', 'preferences'],
                        description: '고객 기본정보 및 라이프스타일 파악',
                        tips: [
                            '고객의 직업과 라이프스타일을 자세히 파악하세요',
                            '평소 선호하는 색상과 스타일을 물어보세요',
                            '알레르기나 피부 민감성을 확인하세요'
                        ]
                    },
                    {
                        id: 'skin_analysis',
                        name: '피부 분석',
                        duration: 10,
                        required_fields: ['skin_tone', 'undertone', 'clarity'],
                        description: '자연광 하에서 피부톤 및 언더톤 분석',
                        tips: [
                            '자연광 또는 색온도 5500K 조명 사용',
                            '메이크업을 완전히 지운 상태에서 분석',
                            '목과 손목의 혈관 색상도 함께 관찰'
                        ]
                    },
                    {
                        id: 'draping_test',
                        name: '드레이핑 테스트',
                        duration: 20,
                        required_fields: ['test_colors', 'reactions', 'best_colors'],
                        description: '4계절 색상으로 드레이핑 테스트 실시',
                        tips: [
                            '봄 → 여름 → 가을 → 겨울 순서로 테스트',
                            '각 색상별 피부 반응을 세심히 관찰',
                            '고객과 함께 차이점을 확인하며 진행',
                            '사진으로 기록하여 나중에 비교'
                        ]
                    },
                    {
                        id: 'verification',
                        name: '결과 검증',
                        duration: 5,
                        required_fields: ['primary_season', 'secondary_season', 'confidence'],
                        description: '진단 결과 재확인 및 검증',
                        tips: [
                            '가장 좋았던 색상 2-3개로 재확인',
                            '고객의 반응과 객관적 관찰 비교',
                            '의구심이 있다면 추가 테스트 실시'
                        ]
                    },
                    {
                        id: 'consultation_final',
                        name: '최종 상담',
                        duration: 10,
                        required_fields: ['recommendations', 'styling_tips', 'product_suggestions'],
                        description: '결과 설명 및 스타일링 조언',
                        tips: [
                            '진단 과정을 함께 리뷰하며 설명',
                            '실용적인 스타일링 팁 제공',
                            '점진적 변화를 권장'
                        ]
                    }
                ],
                validation_points: [
                    'natural_lighting_used',
                    'makeup_removed',
                    'multiple_colors_tested',
                    'customer_agreement'
                ]
            },

            // 빠른 진단 워크플로우
            quick_diagnosis: {
                name: '빠른 퍼스널컬러 진단',
                duration_estimate: 20,
                steps: [
                    {
                        id: 'rapid_consultation',
                        name: '간단 상담',
                        duration: 5,
                        required_fields: ['basic_info', 'time_constraint'],
                        description: '기본 정보 및 시간 제약 파악'
                    },
                    {
                        id: 'focused_analysis',
                        name: '집중 분석',
                        duration: 10,
                        required_fields: ['key_colors', 'immediate_reaction'],
                        description: '핵심 색상으로만 빠른 테스트'
                    },
                    {
                        id: 'quick_recommendation',
                        name: '즉석 추천',
                        duration: 5,
                        required_fields: ['primary_result', 'key_tips'],
                        description: '기본 결과 및 핵심 팁 제공'
                    }
                ]
            },

            // 정밀 진단 워크플로우
            detailed_diagnosis: {
                name: '정밀 퍼스널컬러 진단',
                duration_estimate: 90,
                steps: [
                    {
                        id: 'comprehensive_consultation',
                        name: '종합 상담',
                        duration: 20,
                        required_fields: ['detailed_lifestyle', 'color_history', 'goals'],
                        description: '상세한 라이프스타일 및 색상 히스토리 분석'
                    },
                    {
                        id: 'scientific_analysis',
                        name: '과학적 분석',
                        duration: 15,
                        required_fields: ['lab_values', 'spectral_data'],
                        description: 'CIE L*a*b* 측정 및 스펙트럼 분석'
                    },
                    {
                        id: 'comprehensive_draping',
                        name: '종합 드레이핑',
                        duration: 30,
                        required_fields: ['all_seasons', 'subtypes', 'fabric_variations'],
                        description: '12톤 시스템 전체 및 다양한 패브릭으로 테스트'
                    },
                    {
                        id: 'makeup_application',
                        name: '메이크업 적용',
                        duration: 15,
                        required_fields: ['color_matching', 'application_demo'],
                        description: '진단 결과에 맞는 메이크업 시연'
                    },
                    {
                        id: 'detailed_consultation',
                        name: '상세 상담',
                        duration: 10,
                        required_fields: ['complete_guide', 'product_list', 'follow_up'],
                        description: '완전한 가이드 및 제품 리스트 제공'
                    }
                ]
            }
        };

        console.log('✅ 워크플로우 템플릿 로드 완료');
    }

    /**
     * 검증 규칙 설정
     */
    setupValidationRules() {
        this.validationRules = {
            // 진단 신뢰도 검증
            confidence_validation: {
                minimum_confidence: 80,
                required_agreements: ['customer_agrees', 'expert_confident'],
                warning_threshold: 75
            },

            // 환경 조건 검증
            environment_validation: {
                lighting: {
                    required: 'natural_or_daylight',
                    color_temperature: { min: 5000, max: 6500 },
                    intensity: { min: 800, max: 2000 }
                },
                background: 'neutral_white_or_gray',
                makeup_status: 'removed_or_minimal'
            },

            // 프로세스 검증
            process_validation: {
                minimum_colors_tested: 8,
                minimum_test_duration: 15, // 분
                required_documentation: ['before_photos', 'draping_photos', 'final_result']
            },

            // 결과 일관성 검증
            consistency_validation: {
                undertone_match: true,
                season_characteristics_align: true,
                customer_lifestyle_compatible: true
            }
        };

        console.log('✅ 검증 규칙 설정 완료');
    }

    /**
     * 새 진단 세션 시작
     */
    startSession(workflowType = 'standard_diagnosis', customerInfo = {}) {
        if (!this.initialized) {
            console.error('ExpertWorkflow가 초기화되지 않았습니다.');
            return null;
        }

        try {
            const workflow = this.workflowTemplates[workflowType];
            if (!workflow) {
                console.error('존재하지 않는 워크플로우 타입:', workflowType);
                return null;
            }

            const sessionId = this.generateSessionId();
            
            this.currentSession = {
                id: sessionId,
                workflow_type: workflowType,
                workflow: { ...workflow },
                customer: {
                    id: customerInfo.id || 'customer_' + Date.now(),
                    name: customerInfo.name || '',
                    age: customerInfo.age || null,
                    gender: customerInfo.gender || '',
                    contact: customerInfo.contact || '',
                    visit_reason: customerInfo.visit_reason || '',
                    previous_analysis: customerInfo.previous_analysis || null
                },
                expert: { ...this.expertProfile },
                
                // 세션 상태
                status: 'in_progress',
                current_step: 0,
                started_at: new Date().toISOString(),
                estimated_completion: new Date(Date.now() + workflow.duration_estimate * 60000).toISOString(),
                
                // 진행 데이터
                step_data: {},
                photos: [],
                notes: [],
                
                // 결과 데이터
                results: {
                    primary_season: null,
                    secondary_season: null,
                    confidence_score: null,
                    recommendations: [],
                    validation_status: 'pending'
                }
            };

            console.log('✅ 새 진단 세션 시작:', sessionId);
            this.notifyStepChange();
            
            return sessionId;

        } catch (error) {
            console.error('❌ 세션 시작 중 오류:', error);
            return null;
        }
    }

    /**
     * 다음 단계로 진행
     */
    proceedToNextStep(stepData = {}) {
        if (!this.currentSession) {
            console.error('활성 세션이 없습니다.');
            return false;
        }

        try {
            const workflow = this.currentSession.workflow;
            const currentStepIndex = this.currentSession.current_step;
            const currentStep = workflow.steps[currentStepIndex];

            // 현재 단계 데이터 저장
            this.currentSession.step_data[currentStep.id] = {
                ...stepData,
                completed_at: new Date().toISOString(),
                duration_actual: this.calculateStepDuration(currentStep.id)
            };

            // 필수 필드 검증
            const validation = this.validateStepData(currentStep, stepData);
            if (!validation.valid) {
                console.warn('단계 검증 실패:', validation.errors);
                return {
                    success: false,
                    errors: validation.errors,
                    warnings: validation.warnings
                };
            }

            // 다음 단계로 진행
            if (currentStepIndex < workflow.steps.length - 1) {
                this.currentSession.current_step++;
                this.notifyStepChange();
                
                console.log(`✅ 다음 단계 진행: ${workflow.steps[this.currentSession.current_step].name}`);
                return { success: true, next_step: workflow.steps[this.currentSession.current_step] };
            } else {
                // 모든 단계 완료
                return this.completeSession();
            }

        } catch (error) {
            console.error('❌ 단계 진행 중 오류:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 이전 단계로 돌아가기
     */
    goToPreviousStep() {
        if (!this.currentSession) return false;

        if (this.currentSession.current_step > 0) {
            this.currentSession.current_step--;
            this.notifyStepChange();
            
            const currentStep = this.currentSession.workflow.steps[this.currentSession.current_step];
            console.log(`⬅️ 이전 단계로 이동: ${currentStep.name}`);
            return { success: true, current_step: currentStep };
        }

        return { success: false, message: '첫 번째 단계입니다.' };
    }

    /**
     * 특정 단계로 이동
     */
    goToStep(stepIndex) {
        if (!this.currentSession) return false;

        const workflow = this.currentSession.workflow;
        if (stepIndex >= 0 && stepIndex < workflow.steps.length) {
            this.currentSession.current_step = stepIndex;
            this.notifyStepChange();
            
            const currentStep = workflow.steps[stepIndex];
            console.log(`🎯 단계 이동: ${currentStep.name}`);
            return { success: true, current_step: currentStep };
        }

        return { success: false, message: '유효하지 않은 단계입니다.' };
    }

    /**
     * 단계 데이터 검증
     */
    validateStepData(step, data) {
        const result = {
            valid: true,
            errors: [],
            warnings: []
        };

        // 필수 필드 검증
        step.required_fields.forEach(field => {
            if (!data[field] || data[field] === '') {
                result.valid = false;
                result.errors.push(`필수 필드가 누락되었습니다: ${field}`);
            }
        });

        // 단계별 특별 검증
        switch (step.id) {
            case 'skin_analysis':
                if (data.skin_tone && !this.isValidSkinTone(data.skin_tone)) {
                    result.warnings.push('비정상적인 피부톤 값이 감지되었습니다.');
                }
                break;

            case 'draping_test':
                if (data.test_colors && data.test_colors.length < 4) {
                    result.warnings.push('충분한 색상을 테스트하지 않았습니다. (최소 4개 권장)');
                }
                break;

            case 'verification':
                if (data.confidence && data.confidence < this.validationRules.confidence_validation.minimum_confidence) {
                    result.warnings.push('신뢰도가 낮습니다. 추가 검증이 필요할 수 있습니다.');
                }
                break;
        }

        return result;
    }

    /**
     * 세션 완료
     */
    completeSession() {
        if (!this.currentSession) return { success: false };

        try {
            // 최종 검증
            const finalValidation = this.performFinalValidation();
            
            // 결과 정리
            const results = this.compileFinalResults();
            
            // 세션 상태 업데이트
            this.currentSession.status = 'completed';
            this.currentSession.completed_at = new Date().toISOString();
            this.currentSession.actual_duration = this.calculateSessionDuration();
            this.currentSession.results = results;
            this.currentSession.validation = finalValidation;

            // 히스토리에 추가
            this.sessionHistory.push({ ...this.currentSession });
            
            // 자동 저장
            this.saveSessionHistory();

            // 완료 이벤트 발생
            this.dispatchEvent('sessionCompleted', this.currentSession);

            console.log('✅ 세션 완료:', this.currentSession.id);

            // 현재 세션 초기화
            const completedSession = { ...this.currentSession };
            this.currentSession = null;

            return {
                success: true,
                session: completedSession,
                validation: finalValidation
            };

        } catch (error) {
            console.error('❌ 세션 완료 중 오류:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 최종 검증 수행
     */
    performFinalValidation() {
        const validation = {
            overall_valid: true,
            confidence_score: 0,
            issues: [],
            warnings: [],
            recommendations: []
        };

        // 환경 조건 검증
        const envValidation = this.validateEnvironment();
        if (!envValidation.valid) {
            validation.issues.push(...envValidation.issues);
            validation.overall_valid = false;
        }

        // 프로세스 검증
        const processValidation = this.validateProcess();
        if (!processValidation.valid) {
            validation.warnings.push(...processValidation.warnings);
        }

        // 결과 일관성 검증
        const consistencyValidation = this.validateConsistency();
        validation.confidence_score = consistencyValidation.score;

        if (validation.confidence_score < this.validationRules.confidence_validation.minimum_confidence) {
            validation.warnings.push('결과 신뢰도가 기준보다 낮습니다.');
        }

        // 전문가 경험 기반 추가 검증
        const expertValidation = this.applyExpertValidation();
        validation.recommendations.push(...expertValidation.recommendations);

        return validation;
    }

    /**
     * 환경 조건 검증
     */
    validateEnvironment() {
        const validation = { valid: true, issues: [] };
        const envData = this.currentSession.step_data.skin_analysis || {};

        // 조명 조건 검증
        if (!envData.lighting_condition || envData.lighting_condition !== 'natural_daylight') {
            validation.issues.push('자연광 또는 데이라이트 조명이 사용되지 않았습니다.');
            validation.valid = false;
        }

        // 메이크업 상태 검증
        if (!envData.makeup_removed) {
            validation.issues.push('메이크업이 완전히 제거되지 않았습니다.');
            validation.valid = false;
        }

        return validation;
    }

    /**
     * 프로세스 검증
     */
    validateProcess() {
        const validation = { valid: true, warnings: [] };
        const drapingData = this.currentSession.step_data.draping_test || {};

        // 테스트 색상 수 검증
        const colorsCount = drapingData.test_colors?.length || 0;
        if (colorsCount < this.validationRules.process_validation.minimum_colors_tested) {
            validation.warnings.push(`충분한 색상을 테스트하지 않았습니다. (${colorsCount}/8)`);
        }

        // 소요 시간 검증
        const actualDuration = this.calculateSessionDuration();
        const minDuration = this.validationRules.process_validation.minimum_test_duration;
        if (actualDuration < minDuration) {
            validation.warnings.push(`테스트 시간이 부족합니다. (${actualDuration}분/${minDuration}분)`);
        }

        return validation;
    }

    /**
     * 결과 일관성 검증
     */
    validateConsistency() {
        const skinData = this.currentSession.step_data.skin_analysis || {};
        const drapingData = this.currentSession.step_data.draping_test || {};
        const verificationData = this.currentSession.step_data.verification || {};

        let consistencyScore = 100;

        // 언더톤 일치성 검증
        if (skinData.undertone && verificationData.primary_season) {
            const expectedUndertone = this.getSeasonUndertone(verificationData.primary_season);
            if (skinData.undertone !== expectedUndertone) {
                consistencyScore -= 20;
            }
        }

        // 드레이핑 반응 일치성
        if (drapingData.best_colors && verificationData.primary_season) {
            const seasonColors = this.getSeasonColors(verificationData.primary_season);
            const matchingColors = drapingData.best_colors.filter(color => 
                seasonColors.some(seasonColor => this.colorsMatch(color, seasonColor))
            );
            
            const matchRatio = matchingColors.length / drapingData.best_colors.length;
            if (matchRatio < 0.7) {
                consistencyScore -= 25;
            }
        }

        // 고객 만족도
        if (verificationData.customer_satisfaction) {
            if (verificationData.customer_satisfaction < 7) { // 10점 만점 기준
                consistencyScore -= 15;
            }
        }

        return { score: Math.max(0, consistencyScore) };
    }

    /**
     * 전문가 경험 기반 검증
     */
    applyExpertValidation() {
        const recommendations = [];
        const expertLevel = this.expertProfile.level;
        const experience = this.expertProfile.experience_years;

        // 경험 기반 추천사항
        if (experience < 3) {
            recommendations.push('신입 전문가로서 시니어의 검토를 받으시길 권장합니다.');
        }

        // 전문 분야 매칭
        if (!this.expertProfile.specialties.includes('color_analysis')) {
            recommendations.push('퍼스널컬러 전문 교육을 추가로 받으시길 권장합니다.');
        }

        // 결과 신뢰도 기반
        const confidence = this.currentSession.step_data.verification?.confidence || 0;
        if (confidence < 85 && expertLevel === 'junior') {
            recommendations.push('신뢰도가 낮은 경우 상급자의 검토가 필요합니다.');
        }

        return { recommendations };
    }

    /**
     * 최종 결과 정리
     */
    compileFinalResults() {
        const stepData = this.currentSession.step_data;
        const verificationData = stepData.verification || {};
        const consultationData = stepData.consultation_final || {};

        return {
            // 진단 결과
            primary_season: verificationData.primary_season,
            secondary_season: verificationData.secondary_season,
            subtype: verificationData.subtype,
            confidence_score: verificationData.confidence,
            
            // 피부 분석 결과
            skin_analysis: {
                tone: stepData.skin_analysis?.skin_tone,
                undertone: stepData.skin_analysis?.undertone,
                clarity: stepData.skin_analysis?.clarity
            },
            
            // 드레이핑 결과
            draping_results: {
                best_colors: stepData.draping_test?.best_colors || [],
                worst_colors: stepData.draping_test?.worst_colors || [],
                reactions: stepData.draping_test?.reactions || {}
            },
            
            // 추천사항
            recommendations: consultationData.recommendations || [],
            styling_tips: consultationData.styling_tips || [],
            product_suggestions: consultationData.product_suggestions || [],
            
            // 메타데이터
            diagnosis_method: this.currentSession.workflow_type,
            expert_notes: this.compiledExpertNotes(),
            photos: this.currentSession.photos,
            
            // 검증 정보
            validation_passed: true,
            expert_approved: true,
            created_at: new Date().toISOString()
        };
    }

    /**
     * 전문가 노트 컴파일
     */
    compiledExpertNotes() {
        const allNotes = this.currentSession.notes || [];
        const stepNotes = Object.values(this.currentSession.step_data).map(data => data.notes).filter(Boolean);
        
        return [...allNotes, ...stepNotes.flat()].join('\n');
    }

    /**
     * 사진 추가
     */
    addPhoto(photoData, step, description = '') {
        if (!this.currentSession) return false;

        const photo = {
            id: 'photo_' + Date.now(),
            step: step,
            description: description,
            timestamp: new Date().toISOString(),
            data: photoData
        };

        this.currentSession.photos.push(photo);
        console.log(`📸 사진 추가됨: ${step} - ${description}`);
        
        return photo.id;
    }

    /**
     * 노트 추가
     */
    addNote(note, step = null) {
        if (!this.currentSession) return false;

        const noteObj = {
            id: 'note_' + Date.now(),
            step: step || this.getCurrentStepId(),
            content: note,
            timestamp: new Date().toISOString(),
            expert_id: this.expertProfile.id
        };

        this.currentSession.notes.push(noteObj);
        console.log(`📝 노트 추가됨: ${note.substring(0, 50)}...`);
        
        return noteObj.id;
    }

    /**
     * 현재 단계 정보 가져오기
     */
    getCurrentStep() {
        if (!this.currentSession) return null;
        
        const workflow = this.currentSession.workflow;
        const currentIndex = this.currentSession.current_step;
        
        if (currentIndex >= 0 && currentIndex < workflow.steps.length) {
            return {
                ...workflow.steps[currentIndex],
                index: currentIndex,
                total: workflow.steps.length,
                progress: ((currentIndex + 1) / workflow.steps.length) * 100
            };
        }
        
        return null;
    }

    /**
     * 현재 단계 ID 가져오기
     */
    getCurrentStepId() {
        const currentStep = this.getCurrentStep();
        return currentStep ? currentStep.id : null;
    }

    /**
     * 세션 일시정지
     */
    pauseSession(reason = '') {
        if (!this.currentSession) return false;

        this.currentSession.status = 'paused';
        this.currentSession.pause_reason = reason;
        this.currentSession.paused_at = new Date().toISOString();

        this.addNote(`세션 일시정지: ${reason}`);
        console.log('⏸️ 세션 일시정지:', reason);

        return true;
    }

    /**
     * 세션 재개
     */
    resumeSession() {
        if (!this.currentSession || this.currentSession.status !== 'paused') return false;

        this.currentSession.status = 'in_progress';
        this.currentSession.resumed_at = new Date().toISOString();
        
        // 예상 완료 시간 재계산
        const remainingSteps = this.currentSession.workflow.steps.length - this.currentSession.current_step - 1;
        const avgStepDuration = this.currentSession.workflow.duration_estimate / this.currentSession.workflow.steps.length;
        const remainingTime = remainingSteps * avgStepDuration * 60000;
        
        this.currentSession.estimated_completion = new Date(Date.now() + remainingTime).toISOString();

        this.addNote('세션 재개');
        console.log('▶️ 세션 재개');

        return true;
    }

    /**
     * 세션 취소
     */
    cancelSession(reason = '') {
        if (!this.currentSession) return false;

        this.currentSession.status = 'cancelled';
        this.currentSession.cancellation_reason = reason;
        this.currentSession.cancelled_at = new Date().toISOString();

        this.addNote(`세션 취소: ${reason}`);
        
        // 부분 완료된 데이터도 히스토리에 저장
        this.sessionHistory.push({ ...this.currentSession });
        this.saveSessionHistory();

        console.log('❌ 세션 취소:', reason);

        this.currentSession = null;
        return true;
    }

    /**
     * 세션 히스토리 관리
     */
    getSessionHistory(limit = 10) {
        return this.sessionHistory
            .sort((a, b) => new Date(b.started_at) - new Date(a.started_at))
            .slice(0, limit);
    }

    /**
     * 특정 세션 가져오기
     */
    getSession(sessionId) {
        return this.sessionHistory.find(session => session.id === sessionId);
    }

    /**
     * 세션 통계
     */
    getSessionStats(period = 'month') {
        const now = new Date();
        let startDate;
        
        switch(period) {
            case 'day':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            default:
                startDate = new Date(0);
        }

        const filteredSessions = this.sessionHistory.filter(session => 
            new Date(session.started_at) >= startDate
        );

        const completedSessions = filteredSessions.filter(s => s.status === 'completed');
        const averageDuration = completedSessions.length > 0 ? 
            completedSessions.reduce((sum, s) => sum + s.actual_duration, 0) / completedSessions.length : 0;

        // 계절별 분포
        const seasonDistribution = {};
        completedSessions.forEach(session => {
            const season = session.results?.primary_season;
            if (season) {
                seasonDistribution[season] = (seasonDistribution[season] || 0) + 1;
            }
        });

        return {
            period: period,
            total_sessions: filteredSessions.length,
            completed_sessions: completedSessions.length,
            completion_rate: filteredSessions.length > 0 ? (completedSessions.length / filteredSessions.length) * 100 : 0,
            average_duration: Math.round(averageDuration),
            season_distribution: seasonDistribution,
            success_rate: this.calculateSuccessRate(completedSessions)
        };
    }

    /**
     * 성공률 계산
     */
    calculateSuccessRate(sessions) {
        if (sessions.length === 0) return 0;
        
        const successfulSessions = sessions.filter(session => 
            session.results?.confidence_score >= 80 && 
            session.validation?.overall_valid !== false
        );
        
        return Math.round((successfulSessions.length / sessions.length) * 100);
    }

    /**
     * 전문가 성과 분석
     */
    getExpertPerformance() {
        const recentSessions = this.getSessionHistory(50);
        const completedSessions = recentSessions.filter(s => s.status === 'completed');

        if (completedSessions.length === 0) {
            return { message: '충분한 데이터가 없습니다.' };
        }

        // 평균 신뢰도
        const avgConfidence = completedSessions.reduce((sum, session) => 
            sum + (session.results?.confidence_score || 0), 0) / completedSessions.length;

        // 평균 소요 시간
        const avgDuration = completedSessions.reduce((sum, session) => 
            sum + session.actual_duration, 0) / completedSessions.length;

        // 고객 만족도 (가정)
        const avgSatisfaction = completedSessions.reduce((sum, session) => 
            sum + (session.step_data.verification?.customer_satisfaction || 8), 0) / completedSessions.length;

        // 개선 영역 식별
        const improvements = [];
        if (avgConfidence < 85) improvements.push('진단 정확도 향상 필요');
        if (avgDuration > 60) improvements.push('프로세스 효율성 개선 필요');
        if (avgSatisfaction < 8) improvements.push('고객 서비스 개선 필요');

        return {
            sessions_analyzed: completedSessions.length,
            average_confidence: Math.round(avgConfidence),
            average_duration: Math.round(avgDuration),
            average_satisfaction: Math.round(avgSatisfaction * 10) / 10,
            performance_grade: this.calculatePerformanceGrade(avgConfidence, avgDuration, avgSatisfaction),
            improvement_areas: improvements,
            strengths: this.identifyStrengths(completedSessions)
        };
    }

    /**
     * 성과 등급 계산
     */
    calculatePerformanceGrade(confidence, duration, satisfaction) {
        let score = 0;
        
        // 신뢰도 점수 (40%)
        if (confidence >= 90) score += 40;
        else if (confidence >= 85) score += 35;
        else if (confidence >= 80) score += 30;
        else score += 20;
        
        // 효율성 점수 (30%)
        if (duration <= 30) score += 30;
        else if (duration <= 45) score += 25;
        else if (duration <= 60) score += 20;
        else score += 10;
        
        // 만족도 점수 (30%)
        if (satisfaction >= 9) score += 30;
        else if (satisfaction >= 8) score += 25;
        else if (satisfaction >= 7) score += 20;
        else score += 10;
        
        if (score >= 90) return 'A+';
        if (score >= 85) return 'A';
        if (score >= 80) return 'B+';
        if (score >= 75) return 'B';
        if (score >= 70) return 'C+';
        return 'C';
    }

    /**
     * 강점 식별
     */
    identifyStrengths(sessions) {
        const strengths = [];
        
        // 높은 신뢰도
        const highConfidenceSessions = sessions.filter(s => s.results?.confidence_score >= 90);
        if (highConfidenceSessions.length / sessions.length >= 0.7) {
            strengths.push('높은 진단 정확도');
        }
        
        // 빠른 진행
        const efficientSessions = sessions.filter(s => s.actual_duration <= 45);
        if (efficientSessions.length / sessions.length >= 0.7) {
            strengths.push('효율적인 진행');
        }
        
        // 일관성
        const consistentResults = sessions.filter(s => 
            s.validation?.confidence_score >= 85
        );
        if (consistentResults.length / sessions.length >= 0.8) {
            strengths.push('일관된 결과 도출');
        }
        
        return strengths;
    }

    /**
     * 유틸리티 함수들
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    }

    calculateStepDuration(stepId) {
        const stepData = this.currentSession.step_data[stepId];
        if (!stepData || !stepData.completed_at) return 0;
        
        const startTime = stepData.started_at || this.currentSession.started_at;
        const endTime = stepData.completed_at;
        
        return Math.round((new Date(endTime) - new Date(startTime)) / (1000 * 60));
    }

    calculateSessionDuration() {
        if (!this.currentSession) return 0;
        
        const startTime = new Date(this.currentSession.started_at);
        const endTime = new Date();
        
        return Math.round((endTime - startTime) / (1000 * 60));
    }

    notifyStepChange() {
        if (!this.currentSession) return;
        
        const currentStep = this.getCurrentStep();
        this.dispatchEvent('stepChanged', {
            session: this.currentSession,
            step: currentStep
        });
    }

    dispatchEvent(eventName, data) {
        const event = new CustomEvent(`expertWorkflow:${eventName}`, { detail: data });
        document.dispatchEvent(event);
    }

    // 저장소 관리
    saveSessionHistory() {
        try {
            const dataToSave = {
                expert_profile: this.expertProfile,
                session_history: this.sessionHistory.slice(-100), // 최근 100개만 보관
                saved_at: new Date().toISOString()
            };
            
            localStorage.setItem('expertWorkflow_data', JSON.stringify(dataToSave));
        } catch (error) {
            console.error('세션 히스토리 저장 실패:', error);
        }
    }

    loadSessionHistory() {
        try {
            const saved = localStorage.getItem('expertWorkflow_data');
            if (saved) {
                const data = JSON.parse(saved);
                this.sessionHistory = data.session_history || [];
                
                // 전문가 프로필 병합
                if (data.expert_profile) {
                    this.expertProfile = { ...this.expertProfile, ...data.expert_profile };
                }
                
                console.log(`✅ ${this.sessionHistory.length}개 세션 히스토리 로드됨`);
            }
        } catch (error) {
            console.error('세션 히스토리 로드 실패:', error);
        }
    }

    // 검증 헬퍼 함수들
    isValidSkinTone(tone) {
        const validTones = ['very_light', 'light', 'medium_light', 'medium', 'medium_dark', 'dark'];
        return validTones.includes(tone);
    }

    getSeasonUndertone(season) {
        const undertones = {
            spring: 'warm',
            summer: 'cool',
            autumn: 'warm',
            winter: 'cool'
        };
        return undertones[season] || 'neutral';
    }

    getSeasonColors(season) {
        // 간소화된 계절별 대표 색상들
        const colors = {
            spring: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
            summer: ['#B39DDB', '#90CAF9', '#80DEEA', '#A5D6A7'],
            autumn: ['#D2691E', '#CD853F', '#8B4513', '#A0522D'],
            winter: ['#000080', '#8B008B', '#DC143C', '#1E90FF']
        };
        return colors[season] || [];
    }

    colorsMatch(color1, color2) {
        // 간소화된 색상 매칭 로직
        return Math.abs(parseInt(color1.replace('#', ''), 16) - parseInt(color2.replace('#', ''), 16)) < 100000;
    }

    /**
     * 시스템 상태 확인
     */
    getSystemStatus() {
        return {
            initialized: this.initialized,
            expert_profile: this.expertProfile,
            current_session: this.currentSession?.id || null,
            session_history_count: this.sessionHistory.length,
            workflow_templates: Object.keys(this.workflowTemplates),
            timestamp: new Date().toISOString()
        };
    }
}

// 전역 등록 (브라우저 호환성)
if (typeof window !== 'undefined') {
    window.ExpertWorkflow = ExpertWorkflow;
    console.log('✅ ExpertWorkflow가 전역에 등록되었습니다.');
}

// ES6 모듈 지원
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExpertWorkflow;
}
