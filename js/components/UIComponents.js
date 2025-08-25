/**
 * UIComponents.js - 헤어디자이너용 퍼스널컬러 진단 시스템
 * 공통 UI 컴포넌트 라이브러리
 * 
 * 태블릿 최적화된 재사용 가능한 UI 컴포넌트들
 * - 44px+ 터치 타겟 크기 보장
 * - 접근성 및 시각적 피드백 최적화
 * - 일관된 디자인 시스템 구현
 */

class UIComponents {
    constructor() {
        this.touchTargetMinSize = 44; // 최소 터치 타겟 크기 (픽셀)
        this.animationDuration = 200; // 기본 애니메이션 시간 (ms)
        this.feedbackDelay = 100; // 터치 피드백 지연 시간
        
        this.initializeGlobalStyles();
    }

    /**
     * 전역 스타일 초기화
     */
    initializeGlobalStyles() {
        if (!document.getElementById('ui-components-styles')) {
            const style = document.createElement('style');
            style.id = 'ui-components-styles';
            style.textContent = this.getGlobalCSS();
            document.head.appendChild(style);
        }
    }

    /**
     * 전역 CSS 정의
     */
    getGlobalCSS() {
        return `
            /* UI Components 전역 스타일 */
            .ui-component {
                font-family: 'Inter', 'Noto Sans KR', sans-serif;
                box-sizing: border-box;
            }
            
            .ui-button {
                min-height: 44px;
                min-width: 44px;
                border: none;
                border-radius: 8px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                text-decoration: none;
                user-select: none;
                -webkit-tap-highlight-color: transparent;
            }
            
            .ui-button:active {
                transform: scale(0.98);
            }
            
            .ui-button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                transform: none !important;
            }
            
            .ui-card {
                background: white;
                border-radius: 12px;
                box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
                overflow: hidden;
                transition: all 0.2s ease;
            }
            
            .ui-card:hover {
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
                transform: translateY(-1px);
            }
            
            .ui-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                opacity: 0;
                animation: fadeIn 0.2s forwards;
            }
            
            .ui-modal {
                background: white;
                border-radius: 16px;
                max-width: 90vw;
                max-height: 90vh;
                overflow: auto;
                transform: scale(0.9);
                animation: modalIn 0.2s 0.1s forwards;
            }
            
            @keyframes fadeIn {
                to { opacity: 1; }
            }
            
            @keyframes modalIn {
                to { 
                    transform: scale(1);
                }
            }
            
            .ui-loading {
                display: inline-block;
                width: 20px;
                height: 20px;
                border: 2px solid #f3f3f3;
                border-top: 2px solid #007AFF;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .ui-toast {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 12px 24px;
                border-radius: 24px;
                font-size: 14px;
                z-index: 1100;
                animation: toastIn 0.3s ease;
            }
            
            @keyframes toastIn {
                from {
                    opacity: 0;
                    transform: translate(-50%, 20px);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, 0);
                }
            }
        `;
    }

    /**
     * 기본 버튼 컴포넌트
     * @param {Object} options - 버튼 옵션
     * @param {string} options.text - 버튼 텍스트
     * @param {string} options.type - 버튼 타입 (primary, secondary, danger)
     * @param {string} options.size - 버튼 크기 (small, medium, large)
     * @param {string} options.icon - 아이콘 HTML
     * @param {Function} options.onClick - 클릭 핸들러
     * @param {boolean} options.disabled - 비활성화 상태
     * @param {boolean} options.loading - 로딩 상태
     */
    createButton(options = {}) {
        const {
            text = '',
            type = 'primary',
            size = 'medium',
            icon = '',
            onClick = null,
            disabled = false,
            loading = false,
            className = ''
        } = options;

        const button = document.createElement('button');
        button.className = `ui-component ui-button ${type} ${size} ${className}`;
        
        // 타입별 스타일 적용
        const typeStyles = {
            primary: {
                background: '#007AFF',
                color: 'white',
                hoverBg: '#0056CC'
            },
            secondary: {
                background: '#F2F2F7',
                color: '#007AFF',
                hoverBg: '#E5E5EA'
            },
            danger: {
                background: '#FF3B30',
                color: 'white',
                hoverBg: '#D70015'
            },
            outline: {
                background: 'transparent',
                color: '#007AFF',
                border: '2px solid #007AFF',
                hoverBg: '#007AFF',
                hoverColor: 'white'
            }
        };

        // 크기별 스타일 적용
        const sizeStyles = {
            small: { padding: '8px 16px', fontSize: '14px' },
            medium: { padding: '12px 24px', fontSize: '16px' },
            large: { padding: '16px 32px', fontSize: '18px' }
        };

        const typeStyle = typeStyles[type] || typeStyles.primary;
        const sizeStyle = sizeStyles[size] || sizeStyles.medium;

        // 스타일 적용
        Object.assign(button.style, {
            backgroundColor: typeStyle.background,
            color: typeStyle.color,
            border: typeStyle.border || 'none',
            padding: sizeStyle.padding,
            fontSize: sizeStyle.fontSize
        });

        // 호버 효과
        button.addEventListener('mouseenter', () => {
            if (!disabled && !loading) {
                button.style.backgroundColor = typeStyle.hoverBg;
                if (typeStyle.hoverColor) {
                    button.style.color = typeStyle.hoverColor;
                }
            }
        });

        button.addEventListener('mouseleave', () => {
            if (!disabled && !loading) {
                button.style.backgroundColor = typeStyle.background;
                button.style.color = typeStyle.color;
            }
        });

        // 내용 설정
        if (loading) {
            button.innerHTML = `<div class="ui-loading"></div>${text ? ` ${text}` : ''}`;
            button.disabled = true;
        } else {
            button.innerHTML = `${icon}${text}`;
        }

        // 이벤트 리스너
        if (onClick && typeof onClick === 'function') {
            button.addEventListener('click', (e) => {
                if (!disabled && !loading) {
                    onClick(e);
                }
            });
        }

        // 상태 관리 메서드 추가
        button.setLoading = (isLoading) => {
            if (isLoading) {
                button.innerHTML = `<div class="ui-loading"></div>${text ? ` ${text}` : ''}`;
                button.disabled = true;
            } else {
                button.innerHTML = `${icon}${text}`;
                button.disabled = disabled;
            }
        };

        button.disabled = disabled || loading;
        return button;
    }

    /**
     * 카드 컴포넌트
     * @param {Object} options - 카드 옵션
     * @param {string} options.title - 카드 제목
     * @param {string} options.content - 카드 내용
     * @param {string} options.footer - 카드 푸터
     * @param {Function} options.onClick - 클릭 핸들러
     */
    createCard(options = {}) {
        const {
            title = '',
            content = '',
            footer = '',
            onClick = null,
            className = '',
            padding = '24px'
        } = options;

        const card = document.createElement('div');
        card.className = `ui-component ui-card ${className}`;
        card.style.padding = padding;

        if (onClick) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', onClick);
        }

        let cardHTML = '';
        
        if (title) {
            cardHTML += `<h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #1D1D1F;">${title}</h3>`;
        }
        
        if (content) {
            cardHTML += `<div style="margin-bottom: ${footer ? '16px' : '0'}; color: #86868B; line-height: 1.5;">${content}</div>`;
        }
        
        if (footer) {
            cardHTML += `<div style="margin: 0; font-size: 14px; color: #86868B;">${footer}</div>`;
        }

        card.innerHTML = cardHTML;
        return card;
    }

    /**
     * 모달 컴포넌트
     * @param {Object} options - 모달 옵션
     * @param {string} options.title - 모달 제목
     * @param {HTMLElement|string} options.content - 모달 내용
     * @param {Array} options.actions - 액션 버튼들
     * @param {Function} options.onClose - 닫기 콜백
     */
    createModal(options = {}) {
        const {
            title = '',
            content = '',
            actions = [],
            onClose = null,
            closeOnOverlay = true,
            className = ''
        } = options;

        // 오버레이 생성
        const overlay = document.createElement('div');
        overlay.className = 'ui-modal-overlay';

        // 모달 컨테이너 생성
        const modal = document.createElement('div');
        modal.className = `ui-component ui-modal ${className}`;
        modal.style.padding = '32px';
        modal.style.minWidth = '320px';

        // 제목 영역
        let modalHTML = '';
        if (title) {
            modalHTML += `
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
                    <h2 style="margin: 0; font-size: 24px; font-weight: 700; color: #1D1D1F;">${title}</h2>
                    <button class="modal-close" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #86868B; padding: 4px;">×</button>
                </div>
            `;
        }

        // 내용 영역
        if (content) {
            modalHTML += `<div class="modal-content" style="margin-bottom: ${actions.length ? '32px' : '0'};">${content}</div>`;
        }

        // 액션 영역
        if (actions.length > 0) {
            modalHTML += `<div class="modal-actions" style="display: flex; gap: 12px; justify-content: flex-end;"></div>`;
        }

        modal.innerHTML = modalHTML;

        // 액션 버튼들 추가
        if (actions.length > 0) {
            const actionsContainer = modal.querySelector('.modal-actions');
            actions.forEach(action => {
                const button = this.createButton({
                    text: action.text || '확인',
                    type: action.type || 'primary',
                    onClick: (e) => {
                        if (action.onClick) {
                            action.onClick(e);
                        }
                        if (action.closeModal !== false) {
                            this.closeModal(overlay);
                        }
                    }
                });
                actionsContainer.appendChild(button);
            });
        }

        // 닫기 이벤트
        const closeHandler = () => {
            if (onClose) {
                onClose();
            }
            this.closeModal(overlay);
        };

        const closeButton = modal.querySelector('.modal-close');
        if (closeButton) {
            closeButton.addEventListener('click', closeHandler);
        }

        if (closeOnOverlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    closeHandler();
                }
            });
        }

        // ESC 키로 닫기
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeHandler();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // 모달 객체 반환 (컨트롤을 위해)
        return {
            element: overlay,
            modal: modal,
            close: () => closeHandler(),
            setContent: (newContent) => {
                const contentElement = modal.querySelector('.modal-content');
                if (contentElement) {
                    if (typeof newContent === 'string') {
                        contentElement.innerHTML = newContent;
                    } else {
                        contentElement.innerHTML = '';
                        contentElement.appendChild(newContent);
                    }
                }
            }
        };
    }

    /**
     * 모달 닫기
     */
    closeModal(overlay) {
        overlay.style.animation = 'fadeOut 0.2s forwards';
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 200);
    }

    /**
     * 토스트 메시지
     * @param {string} message - 메시지 내용
     * @param {number} duration - 표시 시간 (ms)
     * @param {string} type - 토스트 타입 (success, error, warning, info)
     */
    showToast(message, duration = 3000, type = 'info') {
        const toast = document.createElement('div');
        toast.className = 'ui-toast';
        
        // 타입별 스타일
        const typeStyles = {
            success: { background: 'rgba(52, 199, 89, 0.9)' },
            error: { background: 'rgba(255, 59, 48, 0.9)' },
            warning: { background: 'rgba(255, 149, 0, 0.9)' },
            info: { background: 'rgba(0, 0, 0, 0.8)' }
        };

        const typeStyle = typeStyles[type] || typeStyles.info;
        Object.assign(toast.style, typeStyle);
        
        toast.textContent = message;
        document.body.appendChild(toast);

        // 자동 제거
        setTimeout(() => {
            toast.style.animation = 'toastOut 0.3s ease forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);

        return toast;
    }

    /**
     * 로딩 스피너
     * @param {string} size - 스피너 크기 (small, medium, large)
     * @param {string} color - 스피너 색상
     */
    createSpinner(size = 'medium', color = '#007AFF') {
        const spinner = document.createElement('div');
        spinner.className = 'ui-loading';
        
        const sizes = {
            small: '16px',
            medium: '24px',
            large: '32px'
        };

        const spinnerSize = sizes[size] || sizes.medium;
        
        Object.assign(spinner.style, {
            width: spinnerSize,
            height: spinnerSize,
            borderTopColor: color
        });

        return spinner;
    }

    /**
     * 입력 필드 컴포넌트
     * @param {Object} options - 입력 옵션
     */
    createInput(options = {}) {
        const {
            type = 'text',
            placeholder = '',
            label = '',
            required = false,
            disabled = false,
            value = '',
            onChange = null,
            className = ''
        } = options;

        const container = document.createElement('div');
        container.className = `ui-component input-container ${className}`;
        
        let inputHTML = '';
        
        if (label) {
            inputHTML += `<label style="display: block; margin-bottom: 8px; font-weight: 500; color: #1D1D1F;">${label}${required ? ' *' : ''}</label>`;
        }

        const input = document.createElement('input');
        input.type = type;
        input.placeholder = placeholder;
        input.value = value;
        input.disabled = disabled;
        input.required = required;
        
        Object.assign(input.style, {
            width: '100%',
            minHeight: '44px',
            padding: '12px 16px',
            border: '1px solid #D1D1D6',
            borderRadius: '8px',
            fontSize: '16px',
            backgroundColor: disabled ? '#F2F2F7' : 'white',
            color: disabled ? '#86868B' : '#1D1D1F',
            outline: 'none',
            transition: 'border-color 0.2s ease'
        });

        // 포커스 효과
        input.addEventListener('focus', () => {
            input.style.borderColor = '#007AFF';
        });

        input.addEventListener('blur', () => {
            input.style.borderColor = '#D1D1D6';
        });

        if (onChange) {
            input.addEventListener('input', onChange);
        }

        container.appendChild(input);
        
        return {
            container,
            input,
            setValue: (newValue) => {
                input.value = newValue;
            },
            getValue: () => input.value,
            setDisabled: (isDisabled) => {
                input.disabled = isDisabled;
                input.style.backgroundColor = isDisabled ? '#F2F2F7' : 'white';
                input.style.color = isDisabled ? '#86868B' : '#1D1D1F';
            }
        };
    }

    /**
     * 선택 드롭다운 컴포넌트
     * @param {Object} options - 선택 옵션
     */
    createSelect(options = {}) {
        const {
            options: selectOptions = [],
            placeholder = '선택하세요',
            label = '',
            required = false,
            disabled = false,
            value = '',
            onChange = null,
            className = ''
        } = options;

        const container = document.createElement('div');
        container.className = `ui-component select-container ${className}`;
        
        if (label) {
            const labelElement = document.createElement('label');
            labelElement.style.cssText = 'display: block; margin-bottom: 8px; font-weight: 500; color: #1D1D1F;';
            labelElement.textContent = `${label}${required ? ' *' : ''}`;
            container.appendChild(labelElement);
        }

        const select = document.createElement('select');
        select.disabled = disabled;
        select.required = required;
        
        Object.assign(select.style, {
            width: '100%',
            minHeight: '44px',
            padding: '12px 16px',
            border: '1px solid #D1D1D6',
            borderRadius: '8px',
            fontSize: '16px',
            backgroundColor: disabled ? '#F2F2F7' : 'white',
            color: disabled ? '#86868B' : '#1D1D1F',
            outline: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'border-color 0.2s ease'
        });

        // 기본 옵션 추가
        if (placeholder) {
            const placeholderOption = document.createElement('option');
            placeholderOption.value = '';
            placeholderOption.textContent = placeholder;
            placeholderOption.disabled = true;
            placeholderOption.selected = !value;
            select.appendChild(placeholderOption);
        }

        // 선택 옵션들 추가
        selectOptions.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value || option;
            optionElement.textContent = option.text || option;
            if (value === optionElement.value) {
                optionElement.selected = true;
            }
            select.appendChild(optionElement);
        });

        // 포커스 효과
        select.addEventListener('focus', () => {
            select.style.borderColor = '#007AFF';
        });

        select.addEventListener('blur', () => {
            select.style.borderColor = '#D1D1D6';
        });

        if (onChange) {
            select.addEventListener('change', onChange);
        }

        container.appendChild(select);
        
        return {
            container,
            select,
            setValue: (newValue) => {
                select.value = newValue;
            },
            getValue: () => select.value,
            setOptions: (newOptions) => {
                // 기존 옵션들 제거 (placeholder 제외)
                const options = select.querySelectorAll('option:not([disabled])');
                options.forEach(opt => opt.remove());
                
                // 새 옵션들 추가
                newOptions.forEach(option => {
                    const optionElement = document.createElement('option');
                    optionElement.value = option.value || option;
                    optionElement.textContent = option.text || option;
                    select.appendChild(optionElement);
                });
            }
        };
    }

    /**
     * 체크박스 컴포넌트
     * @param {Object} options - 체크박스 옵션
     */
    createCheckbox(options = {}) {
        const {
            label = '',
            checked = false,
            disabled = false,
            onChange = null,
            className = ''
        } = options;

        const container = document.createElement('label');
        container.className = `ui-component checkbox-container ${className}`;
        container.style.cssText = 'display: flex; align-items: center; cursor: pointer; gap: 12px; min-height: 44px;';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = checked;
        checkbox.disabled = disabled;
        
        Object.assign(checkbox.style, {
            width: '20px',
            height: '20px',
            cursor: disabled ? 'not-allowed' : 'pointer'
        });

        const labelText = document.createElement('span');
        labelText.textContent = label;
        labelText.style.cssText = `color: ${disabled ? '#86868B' : '#1D1D1F'}; font-size: 16px;`;

        if (onChange) {
            checkbox.addEventListener('change', onChange);
        }

        container.appendChild(checkbox);
        container.appendChild(labelText);
        
        return {
            container,
            checkbox,
            setChecked: (isChecked) => {
                checkbox.checked = isChecked;
            },
            isChecked: () => checkbox.checked,
            setDisabled: (isDisabled) => {
                checkbox.disabled = isDisabled;
                container.style.cursor = isDisabled ? 'not-allowed' : 'pointer';
                labelText.style.color = isDisabled ? '#86868B' : '#1D1D1F';
            }
        };
    }

    /**
     * 색상 견본 버튼
     * @param {Object} options - 색상 버튼 옵션
     */
    createColorSwatch(options = {}) {
        const {
            color = '#000000',
            size = 'medium',
            selected = false,
            onClick = null,
            className = '',
            showBorder = true
        } = options;

        const sizes = {
            small: '32px',
            medium: '44px',
            large: '56px'
        };

        const swatch = document.createElement('button');
        swatch.className = `ui-component color-swatch ${className}`;
        
        Object.assign(swatch.style, {
            width: sizes[size] || sizes.medium,
            height: sizes[size] || sizes.medium,
            backgroundColor: color,
            border: showBorder ? `2px solid ${selected ? '#007AFF' : '#D1D1D6'}` : 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            outline: 'none',
            boxShadow: selected ? '0 0 0 2px rgba(0, 122, 255, 0.3)' : 'none'
        });

        // 호버 효과
        swatch.addEventListener('mouseenter', () => {
            swatch.style.transform = 'scale(1.05)';
        });

        swatch.addEventListener('mouseleave', () => {
            swatch.style.transform = 'scale(1)';
        });

        if (onClick) {
            swatch.addEventListener('click', (e) => {
                onClick(e, color);
            });
        }

        swatch.setSelected = (isSelected) => {
            swatch.style.border = showBorder ? `2px solid ${isSelected ? '#007AFF' : '#D1D1D6'}` : 'none';
            swatch.style.boxShadow = isSelected ? '0 0 0 2px rgba(0, 122, 255, 0.3)' : 'none';
        };

        swatch.setColor = (newColor) => {
            swatch.style.backgroundColor = newColor;
        };

        return swatch;
    }
}

// CSS 애니메이션 추가
const additionalCSS = `
    @keyframes fadeOut {
        to { opacity: 0; }
    }
    
    @keyframes toastOut {
        to {
            opacity: 0;
            transform: translate(-50%, 20px);
        }
    }
    
    .checkbox-container input[type="checkbox"] {
        accent-color: #007AFF;
    }
    
    .color-swatch:active {
        transform: scale(0.95) !important;
    }
`;

// 추가 CSS 주입
if (!document.getElementById('ui-components-additional-styles')) {
    const style = document.createElement('style');
    style.id = 'ui-components-additional-styles';
    style.textContent = additionalCSS;
    document.head.appendChild(style);
}

// 전역 인스턴스 생성
window.UIComponents = new UIComponents();

export default UIComponents;
