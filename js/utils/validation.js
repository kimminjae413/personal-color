/**
 * validation.js - 종합 데이터 검증 시스템
 * 
 * 퍼스널컬러 진단 데이터의 무결성과 정확성을 보장
 * 고객 정보, 색상 데이터, 진단 결과 등 모든 데이터 검증
 */

class ValidationSystem {
    constructor() {
        this.rules = new Map();
        this.customValidators = new Map();
        this.errorMessages = {
            ko: {
                required: '{field}는 필수 입력 항목입니다.',
                email: '올바른 이메일 형식이 아닙니다.',
                phone: '올바른 전화번호 형식이 아닙니다.',
                age: '나이는 1-120 사이의 숫자여야 합니다.',
                color_range: '색상값은 0-255 사이여야 합니다.',
                lab_range: 'L*a*b* 값이 유효 범위를 벗어났습니다.',
                season_type: '유효하지 않은 계절 타입입니다.',
                image_format: '지원하지 않는 이미지 형식입니다.',
                file_size: '파일 크기가 너무 큽니다. (최대: {max}MB)',
                min_length: '{field}는 최소 {min}자 이상이어야 합니다.',
                max_length: '{field}는 최대 {max}자를 초과할 수 없습니다.',
                numeric: '{field}는 숫자여야 합니다.',
                date_format: '올바른 날짜 형식(YYYY-MM-DD)이 아닙니다.',
                future_date: '미래 날짜는 입력할 수 없습니다.',
                skin_tone: '유효하지 않은 피부톤 값입니다.',
                diagnosis_confidence: '진단 신뢰도는 0-100 사이여야 합니다.'
            }
        };

        this.validationCache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5분
        
        this.init();
    }

    /**
     * 시스템 초기화
     */
    init() {
        this.setupDefaultRules();
        this.setupCustomValidators();
        this.loadValidationConfig();
        console.log('ValidationSystem initialized');
    }

    /**
     * 기본 검증 규칙 설정
     */
    setupDefaultRules() {
        // 고객 정보 검증 규칙
        this.addRule('customer', {
            name: { required: true, minLength: 2, maxLength: 50, type: 'string' },
            email: { required: false, type: 'email' },
            phone: { required: false, type: 'phone' },
            age: { required: true, type: 'number', min: 1, max: 120 },
            gender: { required: true, enum: ['male', 'female', 'other'] },
            skinType: { required: false, enum: ['dry', 'oily', 'combination', 'sensitive', 'normal'] },
            visitDate: { required: true, type: 'date' },
            previousVisits: { required: false, type: 'number', min: 0 },
            notes: { required: false, maxLength: 1000 }
        });

        // 색상 데이터 검증 규칙
        this.addRule('color', {
            r: { required: true, type: 'number', min: 0, max: 255 },
            g: { required: true, type: 'number', min: 0, max: 255 },
            b: { required: true, type: 'number', min: 0, max: 255 },
            hex: { required: false, type: 'hex' },
            name: { required: false, type: 'string', maxLength: 50 }
        });

        // LAB 색공간 검증 규칙
        this.addRule('lab', {
            L: { required: true, type: 'number', min: 0, max: 100 },
            a: { required: true, type: 'number', min: -128, max: 127 },
            b: { required: true, type: 'number', min: -128, max: 127 }
        });

        // 진단 결과 검증 규칙
        this.addRule('diagnosis', {
            season: { required: true, enum: ['spring', 'summer', 'autumn', 'winter'] },
            subtype: { required: false, type: 'string' },
            confidence: { required: true, type: 'number', min: 0, max: 100 },
            method: { required: true, enum: ['ai_photo', 'draping', 'hybrid'] },
            analysisDate: { required: true, type: 'date' },
            dominantColors: { required: true, type: 'array', minLength: 3 },
            skinTone: { required: true, type: 'skin_tone' },
            undertone: { required: true, enum: ['warm', 'cool', 'neutral'] },
            lightness: { required: true, enum: ['light', 'medium', 'deep'] }
        });

        // 이미지 데이터 검증 규칙
        this.addRule('image', {
            file: { required: true, type: 'file' },
            format: { required: true, enum: ['jpg', 'jpeg', 'png', 'webp'] },
            size: { required: true, type: 'number', max: 10 * 1024 * 1024 }, // 10MB
            width: { required: false, type: 'number', min: 300 },
            height: { required: false, type: 'number', min: 300 },
            quality: { required: false, type: 'number', min: 0.1, max: 1.0 }
        });
    }

    /**
     * 커스텀 검증자 설정
     */
    setupCustomValidators() {
        // 이메일 검증
        this.addValidator('email', (value) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value);
        });

        // 전화번호 검증 (한국 형식)
        this.addValidator('phone', (value) => {
            const phoneRegex = /^(01[016789]-?[0-9]{3,4}-?[0-9]{4}|02-?[0-9]{3,4}-?[0-9]{4}|0[3-9][0-9]-?[0-9]{3,4}-?[0-9]{4})$/;
            return phoneRegex.test(value.replace(/\s/g, ''));
        });

        // 16진수 색상 검증
        this.addValidator('hex', (value) => {
            const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
            return hexRegex.test(value);
        });

        // 날짜 검증
        this.addValidator('date', (value) => {
            if (typeof value === 'string') {
                const date = new Date(value);
                return !isNaN(date.getTime()) && value.match(/^\d{4}-\d{2}-\d{2}$/);
            }
            return value instanceof Date && !isNaN(value.getTime());
        });

        // 피부톤 검증
        this.addValidator('skin_tone', (value) => {
            return typeof value === 'object' && 
                   value.hasOwnProperty('L') && 
                   value.hasOwnProperty('a') && 
                   value.hasOwnProperty('b') &&
                   this.validate(value, 'lab').isValid;
        });

        // 파일 검증
        this.addValidator('file', (value) => {
            return value instanceof File || 
                   (typeof value === 'object' && value.hasOwnProperty('name') && value.hasOwnProperty('size'));
        });

        // 배열 검증
        this.addValidator('array', (value) => {
            return Array.isArray(value);
        });
    }

    /**
     * 검증 규칙 추가
     * @param {string} ruleName - 규칙 이름
     * @param {Object} rules - 검증 규칙 객체
     */
    addRule(ruleName, rules) {
        this.rules.set(ruleName, rules);
    }

    /**
     * 커스텀 검증자 추가
     * @param {string} name - 검증자 이름
     * @param {Function} validator - 검증 함수
     */
    addValidator(name, validator) {
        this.customValidators.set(name, validator);
    }

    /**
     * 데이터 검증 실행
     * @param {*} data - 검증할 데이터
     * @param {string} ruleName - 적용할 규칙 이름
     * @param {Object} options - 검증 옵션
     * @returns {Object} 검증 결과
     */
    validate(data, ruleName, options = {}) {
        const startTime = performance.now();
        
        try {
            // 캐시 확인
            const cacheKey = this.generateCacheKey(data, ruleName, options);
            const cached = this.getFromCache(cacheKey);
            if (cached && !options.skipCache) {
                return cached;
            }

            // 규칙 가져오기
            const rules = this.rules.get(ruleName);
            if (!rules) {
                throw new Error(`Validation rule '${ruleName}' not found`);
            }

            // 검증 실행
            const result = this.executeValidation(data, rules, options);
            result.performance = {
                executionTime: performance.now() - startTime,
                ruleName: ruleName,
                dataSize: this.calculateDataSize(data)
            };

            // 결과 캐싱
            this.setCache(cacheKey, result);

            return result;

        } catch (error) {
            return {
                isValid: false,
                errors: [{
                    field: 'system',
                    message: `검증 시스템 오류: ${error.message}`,
                    code: 'VALIDATION_ERROR'
                }],
                performance: {
                    executionTime: performance.now() - startTime,
                    error: error.message
                }
            };
        }
    }

    /**
     * 검증 실행
     * @param {*} data - 데이터
     * @param {Object} rules - 규칙
     * @param {Object} options - 옵션
     * @returns {Object} 검증 결과
     */
    executeValidation(data, rules, options) {
        const errors = [];
        const warnings = [];
        const sanitizedData = {};
        
        // 데이터가 객체가 아닌 경우 처리
        if (typeof data !== 'object' || data === null) {
            return {
                isValid: false,
                errors: [{
                    field: 'root',
                    message: '검증할 데이터는 객체여야 합니다.',
                    code: 'INVALID_DATA_TYPE'
                }]
            };
        }

        // 각 필드에 대해 검증 실행
        for (const [fieldName, fieldRules] of Object.entries(rules)) {
            const fieldValue = data[fieldName];
            const fieldResult = this.validateField(fieldName, fieldValue, fieldRules, options);

            if (!fieldResult.isValid) {
                errors.push(...fieldResult.errors);
            }

            if (fieldResult.warnings && fieldResult.warnings.length > 0) {
                warnings.push(...fieldResult.warnings);
            }

            // 정제된 데이터 저장
            if (fieldResult.sanitizedValue !== undefined) {
                sanitizedData[fieldName] = fieldResult.sanitizedValue;
            } else if (fieldValue !== undefined) {
                sanitizedData[fieldName] = fieldValue;
            }
        }

        // 추가 검증 (교차 필드 검증)
        const crossFieldErrors = this.validateCrossFields(data, rules, options);
        errors.push(...crossFieldErrors);

        return {
            isValid: errors.length === 0,
            errors: errors,
            warnings: warnings,
            sanitizedData: sanitizedData,
            fieldCount: Object.keys(rules).length,
            validatedAt: new Date().toISOString()
        };
    }

    /**
     * 개별 필드 검증
     * @param {string} fieldName - 필드 이름
     * @param {*} value - 필드 값
     * @param {Object} rules - 필드 규칙
     * @param {Object} options - 옵션
     * @returns {Object} 필드 검증 결과
     */
    validateField(fieldName, value, rules, options) {
        const errors = [];
        const warnings = [];
        let sanitizedValue = value;

        // 필수 검증
        if (rules.required && (value === undefined || value === null || value === '')) {
            errors.push({
                field: fieldName,
                message: this.formatMessage('required', { field: fieldName }),
                code: 'REQUIRED',
                value: value
            });
            return { isValid: false, errors: errors };
        }

        // 값이 없고 필수가 아닌 경우 통과
        if (value === undefined || value === null || value === '') {
            return { isValid: true, errors: [], sanitizedValue: value };
        }

        // 타입 검증
        if (rules.type) {
            const typeResult = this.validateType(fieldName, value, rules.type);
            if (!typeResult.isValid) {
                errors.push(...typeResult.errors);
                return { isValid: false, errors: errors };
            }
            sanitizedValue = typeResult.sanitizedValue || sanitizedValue;
        }

        // 범위 검증 (숫자)
        if (rules.min !== undefined && typeof value === 'number' && value < rules.min) {
            errors.push({
                field: fieldName,
                message: `${fieldName}는 ${rules.min} 이상이어야 합니다.`,
                code: 'MIN_VALUE',
                value: value,
                min: rules.min
            });
        }

        if (rules.max !== undefined && typeof value === 'number' && value > rules.max) {
            errors.push({
                field: fieldName,
                message: `${fieldName}는 ${rules.max} 이하여야 합니다.`,
                code: 'MAX_VALUE',
                value: value,
                max: rules.max
            });
        }

        // 길이 검증 (문자열, 배열)
        const length = typeof value === 'string' ? value.length : 
                      Array.isArray(value) ? value.length : null;

        if (length !== null) {
            if (rules.minLength && length < rules.minLength) {
                errors.push({
                    field: fieldName,
                    message: this.formatMessage('min_length', { 
                        field: fieldName, 
                        min: rules.minLength 
                    }),
                    code: 'MIN_LENGTH',
                    value: value,
                    minLength: rules.minLength
                });
            }

            if (rules.maxLength && length > rules.maxLength) {
                errors.push({
                    field: fieldName,
                    message: this.formatMessage('max_length', { 
                        field: fieldName, 
                        max: rules.maxLength 
                    }),
                    code: 'MAX_LENGTH',
                    value: value,
                    maxLength: rules.maxLength
                });
            }
        }

        // 열거형 검증
        if (rules.enum && !rules.enum.includes(value)) {
            errors.push({
                field: fieldName,
                message: `${fieldName}는 다음 중 하나여야 합니다: ${rules.enum.join(', ')}`,
                code: 'INVALID_ENUM',
                value: value,
                allowedValues: rules.enum
            });
        }

        // 정규식 검증
        if (rules.pattern) {
            const regex = new RegExp(rules.pattern);
            if (typeof value === 'string' && !regex.test(value)) {
                errors.push({
                    field: fieldName,
                    message: `${fieldName} 형식이 올바르지 않습니다.`,
                    code: 'PATTERN_MISMATCH',
                    value: value,
                    pattern: rules.pattern
                });
            }
        }

        // 커스텀 검증자
        if (rules.customValidator) {
            const customResult = this.runCustomValidator(fieldName, value, rules.customValidator);
            if (!customResult.isValid) {
                errors.push(...customResult.errors);
            }
            if (customResult.warnings) {
                warnings.push(...customResult.warnings);
            }
        }

        // 데이터 정제
        if (rules.sanitize) {
            sanitizedValue = this.sanitizeValue(value, rules.sanitize);
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            warnings: warnings,
            sanitizedValue: sanitizedValue
        };
    }

    /**
     * 타입 검증
     * @param {string} fieldName - 필드 이름
     * @param {*} value - 값
     * @param {string} type - 예상 타입
     * @returns {Object} 검증 결과
     */
    validateType(fieldName, value, type) {
        const errors = [];
        let sanitizedValue = value;

        switch (type) {
            case 'string':
                if (typeof value !== 'string') {
                    if (typeof value === 'number' || typeof value === 'boolean') {
                        sanitizedValue = String(value);
                    } else {
                        errors.push({
                            field: fieldName,
                            message: `${fieldName}는 문자열이어야 합니다.`,
                            code: 'TYPE_STRING',
                            value: value
                        });
                    }
                }
                break;

            case 'number':
                if (typeof value !== 'number') {
                    const numValue = Number(value);
                    if (!isNaN(numValue)) {
                        sanitizedValue = numValue;
                    } else {
                        errors.push({
                            field: fieldName,
                            message: this.formatMessage('numeric', { field: fieldName }),
                            code: 'TYPE_NUMBER',
                            value: value
                        });
                    }
                }
                break;

            case 'boolean':
                if (typeof value !== 'boolean') {
                    if (value === 'true' || value === '1' || value === 1) {
                        sanitizedValue = true;
                    } else if (value === 'false' || value === '0' || value === 0) {
                        sanitizedValue = false;
                    } else {
                        errors.push({
                            field: fieldName,
                            message: `${fieldName}는 참/거짓 값이어야 합니다.`,
                            code: 'TYPE_BOOLEAN',
                            value: value
                        });
                    }
                }
                break;

            case 'date':
                const dateResult = this.validateDate(fieldName, value);
                if (!dateResult.isValid) {
                    errors.push(...dateResult.errors);
                } else {
                    sanitizedValue = dateResult.sanitizedValue;
                }
                break;

            default:
                // 커스텀 타입 검증자 호출
                if (this.customValidators.has(type)) {
                    const validator = this.customValidators.get(type);
                    if (!validator(value)) {
                        errors.push({
                            field: fieldName,
                            message: `${fieldName}의 ${type} 형식이 올바르지 않습니다.`,
                            code: `TYPE_${type.toUpperCase()}`,
                            value: value
                        });
                    }
                } else {
                    errors.push({
                        field: fieldName,
                        message: `알 수 없는 타입: ${type}`,
                        code: 'UNKNOWN_TYPE',
                        value: value
                    });
                }
                break;
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            sanitizedValue: sanitizedValue
        };
    }

    /**
     * 날짜 검증
     * @param {string} fieldName - 필드 이름
     * @param {*} value - 날짜 값
     * @returns {Object} 검증 결과
     */
    validateDate(fieldName, value) {
        const errors = [];
        let sanitizedValue = value;

        if (typeof value === 'string') {
            // 문자열 날짜 검증
            if (!value.match(/^\d{4}-\d{2}-\d{2}$/)) {
                errors.push({
                    field: fieldName,
                    message: this.formatMessage('date_format'),
                    code: 'DATE_FORMAT',
                    value: value
                });
                return { isValid: false, errors: errors };
            }

            const date = new Date(value);
            if (isNaN(date.getTime())) {
                errors.push({
                    field: fieldName,
                    message: '유효하지 않은 날짜입니다.',
                    code: 'INVALID_DATE',
                    value: value
                });
                return { isValid: false, errors: errors };
            }

            sanitizedValue = date;
        } else if (value instanceof Date) {
            if (isNaN(value.getTime())) {
                errors.push({
                    field: fieldName,
                    message: '유효하지 않은 날짜 객체입니다.',
                    code: 'INVALID_DATE_OBJECT',
                    value: value
                });
                return { isValid: false, errors: errors };
            }
            sanitizedValue = value;
        } else {
            errors.push({
                field: fieldName,
                message: '날짜는 문자열 또는 Date 객체여야 합니다.',
                code: 'DATE_TYPE',
                value: value
            });
            return { isValid: false, errors: errors };
        }

        // 미래 날짜 검증 (옵션)
        const now = new Date();
        now.setHours(23, 59, 59, 999); // 오늘 끝까지 허용
        
        if (sanitizedValue > now) {
            errors.push({
                field: fieldName,
                message: this.formatMessage('future_date'),
                code: 'FUTURE_DATE',
                value: value
            });
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            sanitizedValue: sanitizedValue
        };
    }

    /**
     * 교차 필드 검증
     * @param {Object} data - 전체 데이터
     * @param {Object} rules - 검증 규칙
     * @param {Object} options - 옵션
     * @returns {Array} 오류 배열
     */
    validateCrossFields(data, rules, options) {
        const errors = [];

        // 퍼스널컬러 관련 교차 검증
        if (rules === this.rules.get('diagnosis')) {
            // 계절과 서브타입 일치성 검증
            if (data.season && data.subtype) {
                const validSubtypes = this.getValidSubtypes(data.season);
                if (validSubtypes && !validSubtypes.includes(data.subtype)) {
                    errors.push({
                        field: 'subtype',
                        message: `${data.season} 계절에 유효하지 않은 서브타입입니다.`,
                        code: 'INVALID_SUBTYPE_FOR_SEASON',
                        value: data.subtype,
                        season: data.season
                    });
                }
            }

            // 신뢰도와 분석 방법 일치성
            if (data.confidence && data.method) {
                const expectedConfidence = this.getExpectedConfidence(data.method);
                if (data.confidence < expectedConfidence.min) {
                    errors.push({
                        field: 'confidence',
                        message: `${data.method} 방법의 최소 신뢰도(${expectedConfidence.min}%)보다 낮습니다.`,
                        code: 'LOW_CONFIDENCE',
                        value: data.confidence,
                        method: data.method
                    });
                }
            }

            // 피부톤과 계절 일치성
            if (data.skinTone && data.season && data.undertone) {
                const compatibility = this.checkSkinSeasonCompatibility(
                    data.skinTone, 
                    data.season, 
                    data.undertone
                );
                if (!compatibility.isCompatible) {
                    errors.push({
                        field: 'season',
                        message: `피부톤과 계절 분류가 일치하지 않습니다: ${compatibility.reason}`,
                        code: 'SKIN_SEASON_MISMATCH',
                        skinTone: data.skinTone,
                        season: data.season,
                        undertone: data.undertone
                    });
                }
            }
        }

        // 고객 정보 교차 검증
        if (rules === this.rules.get('customer')) {
            // 나이와 연락처 일치성 (미성년자인 경우)
            if (data.age && data.age < 18 && data.email && !data.parentConsent) {
                errors.push({
                    field: 'parentConsent',
                    message: '미성년자의 경우 보호자 동의가 필요합니다.',
                    code: 'MINOR_CONSENT_REQUIRED',
                    age: data.age
                });
            }
        }

        return errors;
    }

    /**
     * 커스텀 검증자 실행
     * @param {string} fieldName - 필드 이름
     * @param {*} value - 값
     * @param {string|Function} validator - 검증자
     * @returns {Object} 검증 결과
     */
    runCustomValidator(fieldName, value, validator) {
        try {
            let validatorFunc;
            
            if (typeof validator === 'string') {
                validatorFunc = this.customValidators.get(validator);
                if (!validatorFunc) {
                    throw new Error(`Custom validator '${validator}' not found`);
                }
            } else if (typeof validator === 'function') {
                validatorFunc = validator;
            } else {
                throw new Error('Invalid validator type');
            }

            const result = validatorFunc(value, fieldName);
            
            if (typeof result === 'boolean') {
                return {
                    isValid: result,
                    errors: result ? [] : [{
                        field: fieldName,
                        message: `${fieldName} 커스텀 검증에 실패했습니다.`,
                        code: 'CUSTOM_VALIDATION_FAILED',
                        value: value
                    }]
                };
            } else if (typeof result === 'object') {
                return result;
            } else {
                throw new Error('Invalid validator return type');
            }

        } catch (error) {
            return {
                isValid: false,
                errors: [{
                    field: fieldName,
                    message: `커스텀 검증 오류: ${error.message}`,
                    code: 'CUSTOM_VALIDATOR_ERROR',
                    value: value
                }]
            };
        }
    }

    /**
     * 값 정제
     * @param {*} value - 원본 값
     * @param {string|Object} sanitizeRule - 정제 규칙
     * @returns {*} 정제된 값
     */
    sanitizeValue(value, sanitizeRule) {
        if (typeof sanitizeRule === 'string') {
            switch (sanitizeRule) {
                case 'trim':
                    return typeof value === 'string' ? value.trim() : value;
                case 'lowercase':
                    return typeof value === 'string' ? value.toLowerCase() : value;
                case 'uppercase':
                    return typeof value === 'string' ? value.toUpperCase() : value;
                case 'alphanumeric':
                    return typeof value === 'string' ? value.replace(/[^a-zA-Z0-9]/g, '') : value;
                case 'numeric':
                    return typeof value === 'string' ? value.replace(/[^0-9.-]/g, '') : value;
                default:
                    return value;
            }
        } else if (typeof sanitizeRule === 'object') {
            let sanitized = value;
            for (const [rule, enabled] of Object.entries(sanitizeRule)) {
                if (enabled) {
                    sanitized = this.sanitizeValue(sanitized, rule);
                }
            }
            return sanitized;
        }
        
        return value;
    }

    /**
     * 메시지 포맷팅
     * @param {string} key - 메시지 키
     * @param {Object} params - 파라미터
     * @returns {string} 포맷된 메시지
     */
    formatMessage(key, params = {}) {
        const template = this.errorMessages.ko[key] || key;
        return template.replace(/{(\w+)}/g, (match, param) => {
            return params[param] || match;
        });
    }

    /**
     * 배치 검증
     * @param {Array} dataArray - 검증할 데이터 배열
     * @param {string} ruleName - 규칙 이름
     * @param {Object} options - 옵션
     * @returns {Array} 검증 결과 배열
     */
    validateBatch(dataArray, ruleName, options = {}) {
        if (!Array.isArray(dataArray)) {
            throw new Error('Data must be an array for batch validation');
        }

        const results = [];
        const summary = {
            total: dataArray.length,
            valid: 0,
            invalid: 0,
            errors: [],
            warnings: []
        };

        dataArray.forEach((data, index) => {
            try {
                const result = this.validate(data, ruleName, options);
                result.index = index;
                results.push(result);

                if (result.isValid) {
                    summary.valid++;
                } else {
                    summary.invalid++;
                    summary.errors.push(...result.errors.map(error => ({
                        ...error,
                        index: index
                    })));
                }

                if (result.warnings) {
                    summary.warnings.push(...result.warnings.map(warning => ({
                        ...warning,
                        index: index
                    })));
                }
            } catch (error) {
                summary.invalid++;
                summary.errors.push({
                    index: index,
                    field: 'system',
                    message: `Index ${index} validation failed: ${error.message}`,
                    code: 'BATCH_VALIDATION_ERROR'
                });
            }
        });

        return {
            results: results,
            summary: summary,
            isAllValid: summary.invalid === 0
        };
    }

    /**
     * 검증 설정 로드
     */
    loadValidationConfig() {
        try {
            const config = localStorage.getItem('validation_config');
            if (config) {
                const parsed = JSON.parse(config);
                if (parsed.customRules) {
                    for (const [name, rule] of Object.entries(parsed.customRules)) {
                        this.addRule(name, rule);
                    }
                }
                if (parsed.customValidators) {
                    for (const [name, validatorCode] of Object.entries(parsed.customValidators)) {
                        try {
                            const validator = new Function('value', 'fieldName', validatorCode);
                            this.addValidator(name, validator);
                        } catch (error) {
                            console.warn(`Failed to load custom validator ${name}:`, error);
                        }
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to load validation config:', error);
        }
    }

    /**
     * 캐시 관련 메서드들
     */
    generateCacheKey(data, ruleName, options) {
        const dataHash = this.hashData(data);
        const optionsHash = this.hashData(options);
        return `${ruleName}_${dataHash}_${optionsHash}`;
    }

    hashData(data) {
        return btoa(JSON.stringify(data)).slice(0, 16);
    }

    getFromCache(key) {
        const cached = this.validationCache.get(key);
        if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
            return cached.data;
        }
        return null;
    }

    setCache(key, data) {
        this.validationCache.set(key, {
            data: data,
            timestamp: Date.now()
        });

        // 캐시 크기 관리
        if (this.validationCache.size > 1000) {
            const entries = Array.from(this.validationCache.entries());
            entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
            
            // 오래된 항목 절반 제거
            const toRemove = entries.slice(0, Math.floor(entries.length / 2));
            toRemove.forEach(([key]) => this.validationCache.delete(key));
        }
    }

    clearCache() {
        this.validationCache.clear();
    }

    /**
     * 데이터 크기 계산
     * @param {*} data - 데이터
     * @returns {number} 바이트 크기
     */
    calculateDataSize(data) {
        return new Blob([JSON.stringify(data)]).size;
    }

    /**
     * 헬퍼 메서드들
     */
    getValidSubtypes(season) {
        const subtypes = {
            spring: ['bright', 'warm', 'light'],
            summer: ['soft', 'cool', 'light'],
            autumn: ['deep', 'warm', 'muted'],
            winter: ['clear', 'cool', 'deep']
        };
        return subtypes[season] || null;
    }

    getExpectedConfidence(method) {
        const expectations = {
            ai_photo: { min: 70, typical: 85 },
            draping: { min: 85, typical: 95 },
            hybrid: { min: 90, typical: 98 }
        };
        return expectations[method] || { min: 50, typical: 70 };
    }

    checkSkinSeasonCompatibility(skinTone, season, undertone) {
        // 피부톤 L*a*b* 값과 계절/언더톤 일치성 검사
        const { L, a, b } = skinTone;
        
        // 기본 호환성 체크
        const warmCool = a > 0 ? 'warm' : 'cool';
        const lightDeep = L > 65 ? 'light' : L > 45 ? 'medium' : 'deep';
        
        // 계절별 예상 특성
        const seasonExpectations = {
            spring: { undertone: 'warm', lightness: ['light', 'medium'] },
            summer: { undertone: 'cool', lightness: ['light', 'medium'] },
            autumn: { undertone: 'warm', lightness: ['medium', 'deep'] },
            winter: { undertone: 'cool', lightness: ['medium', 'deep'] }
        };
        
        const expectation = seasonExpectations[season];
        if (!expectation) {
            return { isCompatible: true, reason: 'Unknown season' };
        }
        
        // 언더톤 검사
        if (expectation.undertone !== undertone) {
            return {
                isCompatible: false,
                reason: `${season} 계절은 ${expectation.undertone} 언더톤이어야 합니다`
            };
        }
        
        // 밝기 검사
        if (!expectation.lightness.includes(lightDeep)) {
            return {
                isCompatible: false,
                reason: `${season} 계절에 맞지 않는 피부 밝기입니다`
            };
        }
        
        return { isCompatible: true, reason: 'Compatible' };
    }
}

// 전역 인스턴스 생성
const validationSystem = new ValidationSystem();

// 편의 함수들
const validate = (data, ruleName, options) => validationSystem.validate(data, ruleName, options);
const validateBatch = (dataArray, ruleName, options) => validationSystem.validateBatch(dataArray, ruleName, options);
const addValidationRule = (name, rules) => validationSystem.addRule(name, rules);
const addValidator = (name, validator) => validationSystem.addValidator(name, validator);

// 모듈 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ValidationSystem,
        validate,
        validateBatch,
        addValidationRule,
        addValidator
    };
} else if (typeof window !== 'undefined') {
    window.ValidationSystem = ValidationSystem;
    window.validationSystem = validationSystem;
    window.validate = validate;
    window.validateBatch = validateBatch;
    window.addValidationRule = addValidationRule;
    window.addValidator = addValidator;
}
