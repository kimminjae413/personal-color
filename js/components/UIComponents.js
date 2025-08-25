/**
 * UIComponents.js - ES6 → ES5 변환 완료
 * 헤어디자이너용 퍼스널컬러 진단 시스템 공통 UI 컴포넌트 라이브러리
 * 
 * 주요 변경사항:
 * - ES6 클래스 → ES5 함수 생성자 패턴
 * - const/let → var 변환
 * - 화살표 함수 → function() {} 변환
 * - 템플릿 리터럴 → 문자열 연결
 * - Object.assign 브라우저 호환성 처리
 * - import/export → window 전역 등록
 * - 44px+ 터치 타겟 보장 (태블릿 최적화)
 */

(function() {
    'use strict';

    /**
     * UI 컴포넌트 라이브러리 클래스 (ES5 버전)
     */
    function UIComponents() {
        this.touchTargetMinSize = 44; // 최소 터치 타겟 크기 (픽셀)
        this.animationDuration = 200; // 기본 애니메이션 시간 (ms)
        this.feedbackDelay = 100; // 터치 피드백 지연 시간
        
        // Object.assign 폴리필 (IE 호환성)
        if (!Object.assign) {
            this.setupObjectAssignPolyfill();
        }
        
        // 초기화
        this.initializeGlobalStyles();
    }

    /**
     * Object.assign 폴리필 설정
     */
    UIComponents.prototype.setupObjectAssignPolyfill = function() {
        Object.assign = function(target) {
            if (target == null) {
                throw new TypeError('Cannot convert undefined or null to object');
            }
            var to = Object(target);
            for (var index = 1; index < arguments.length; index++) {
                var nextSource = arguments[index];
                if (nextSource != null) {
                    for (var nextKey in nextSource) {
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        };
    };

    /**
     * 전역 스타일 초기화 (ES5 버전)
     */
    UIComponents.prototype.initializeGlobalStyles = function() {
        if (!document.getElementById('ui-components-styles')) {
            var style = document.createElement('style');
            style.id = 'ui-components-styles';
            style.textContent = this.getGlobalCSS();
            document.head.appendChild(style);
        }
    };

    /**
     * 전역 CSS 정의 (ES5 버전)
     */
    UIComponents.prototype.getGlobalCSS = function() {
        return [
            '/* UI Components 전역 스타일 */',
            '.ui-component {',
            '    font-family: "Inter", "Noto Sans KR", sans-serif;',
            '    box-sizing: border-box;',
            '}',
            '',
            '.ui-button {',
            '    min-height: 44px;',
            '    min-width: 44px;',
            '    border: none;',
            '    border-radius: 8px;',
            '    font-weight: 500;',
            '    cursor: pointer;',
            '    transition: all 0.2s ease;',
            '    display: inline-flex;',
            '    align-items: center;',
            '    justify-content: center;',
            '    gap: 8px;',
            '    text-decoration: none;',
            '    user-select: none;',
            '    -webkit-tap-highlight-color: transparent;',
            '}',
            '',
            '.ui-button:active {',
            '    transform: scale(0.98);',
            '}',
            '',
            '.ui-button:disabled {',
            '    opacity: 0.5;',
            '    cursor: not-allowed;',
            '    transform: none !important;',
            '}',
            '',
            '.ui-card {',
            '    background: white;',
            '    border-radius: 12px;',
            '    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);',
            '    overflow: hidden;',
            '    transition: all 0.2s ease;',
            '}',
            '',
            '.ui-card:hover {',
            '    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);',
            '    transform: translateY(-1px);',
            '}',
            '',
            '.ui-modal-overlay {',
            '    position: fixed;',
            '    top: 0;',
            '    left: 0;',
            '    right: 0;',
            '    bottom: 0;',
            '    background: rgba(0, 0, 0, 0.5);',
            '    display: flex;',
            '    align-items: center;',
            '    justify-content: center;',
            '    z-index: 1000;',
            '    opacity: 0;',
            '    animation: fadeIn 0.2s forwards;',
            '}',
            '',
            '.ui-modal {',
            '    background: white;',
            '    border-radius: 16px;',
            '    max-width: 90vw;',
            '    max-height: 90vh;',
            '    overflow: auto;',
            '    transform: scale(0.9);',
            '    animation: modalIn 0.2s 0.1s forwards;',
            '}',
            '',
            '@keyframes fadeIn {',
            '    to { opacity: 1; }',
            '}',
            '',
            '@keyframes modalIn {',
            '    to { transform: scale(1); }',
            '}',
            '',
            '.ui-loading {',
            '    display: inline-block;',
            '    width: 20px;',
            '    height: 20px;',
            '    border: 2px solid #f3f3f3;',
            '    border-top: 2px solid #007AFF;',
            '    border-radius: 50%;',
            '    animation: spin 1s linear infinite;',
            '}',
            '',
            '@keyframes spin {',
            '    0% { transform: rotate(0deg); }',
            '    100% { transform: rotate(360deg); }',
            '}',
            '',
            '.ui-toast {',
            '    position: fixed;',
            '    bottom: 20px;',
            '    left: 50%;',
            '    transform: translateX(-50%);',
            '    background: rgba(0, 0, 0, 0.8);',
            '    color: white;',
            '    padding: 12px 24px;',
            '    border-radius: 24px;',
            '    font-size: 14px;',
            '    z-index: 1100;',
            '    animation: toastIn 0.3s ease;',
            '}',
            '',
            '@keyframes toastIn {',
            '    from {',
            '        opacity: 0;',
            '        transform: translate(-50%, 20px);',
            '    }',
            '    to {',
            '        opacity: 1;',
            '        transform: translate(-50%, 0);',
            '    }',
            '}',
            '',
            '@keyframes fadeOut {',
            '    to { opacity: 0; }',
            '}',
            '',
            '@keyframes toastOut {',
            '    to {',
            '        opacity: 0;',
            '        transform: translate(-50%, 20px);',
            '    }',
            '}',
            '',
            '.checkbox-container input[type="checkbox"] {',
            '    accent-color: #007AFF;',
            '}',
            '',
            '.color-swatch:active {',
            '    transform: scale(0.95) !important;',
            '}'
        ].join('\n');
    };

    /**
     * 기본 버튼 컴포넌트 (ES5 버전)
     */
    UIComponents.prototype.createButton = function(options) {
        options = options || {};
        
        var text = options.text || '';
        var type = options.type || 'primary';
        var size = options.size || 'medium';
        var icon = options.icon || '';
        var onClick = options.onClick || null;
        var disabled = options.disabled || false;
        var loading = options.loading || false;
        var className = options.className || '';

        var button = document.createElement('button');
        button.className = 'ui-component ui-button ' + type + ' ' + size + ' ' + className;
        
        // 타입별 스타일 적용
        var typeStyles = {
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
        var sizeStyles = {
            small: { padding: '8px 16px', fontSize: '14px' },
            medium: { padding: '12px 24px', fontSize: '16px' },
            large: { padding: '16px 32px', fontSize: '18px' }
        };

        var typeStyle = typeStyles[type] || typeStyles.primary;
        var sizeStyle = sizeStyles[size] || sizeStyles.medium;

        // 스타일 적용
        Object.assign(button.style, {
            backgroundColor: typeStyle.background,
            color: typeStyle.color,
            border: typeStyle.border || 'none',
            padding: sizeStyle.padding,
            fontSize: sizeStyle.fontSize
        });

        // 호버 효과
        button.addEventListener('mouseenter', function() {
            if (!disabled && !loading) {
                button.style.backgroundColor = typeStyle.hoverBg;
                if (typeStyle.hoverColor) {
                    button.style.color = typeStyle.hoverColor;
                }
            }
        });

        button.addEventListener('mouseleave', function() {
            if (!disabled && !loading) {
                button.style.backgroundColor = typeStyle.background;
                button.style.color = typeStyle.color;
            }
        });

        // 내용 설정
        if (loading) {
            button.innerHTML = '<div class="ui-loading"></div>' + (text ? ' ' + text : '');
            button.disabled = true;
        } else {
            button.innerHTML = icon + text;
        }

        // 이벤트 리스너
        if (onClick && typeof onClick === 'function') {
            button.addEventListener('click', function(e) {
                if (!disabled && !loading) {
                    onClick(e);
                }
            });
        }

        // 상태 관리 메서드 추가
        button.setLoading = function(isLoading) {
            if (isLoading) {
                button.innerHTML = '<div class="ui-loading"></div>' + (text ? ' ' + text : '');
                button.disabled = true;
            } else {
                button.innerHTML = icon + text;
                button.disabled = disabled;
            }
        };

        button.disabled = disabled || loading;
        return button;
    };

    /**
     * 카드 컴포넌트 (ES5 버전)
     */
    UIComponents.prototype.createCard = function(options) {
        options = options || {};
        
        var title = options.title || '';
        var content = options.content || '';
        var footer = options.footer || '';
        var onClick = options.onClick || null;
        var className = options.className || '';
        var padding = options.padding || '24px';

        var card = document.createElement('div');
        card.className = 'ui-component ui-card ' + className;
        card.style.padding = padding;

        if (onClick) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', onClick);
        }

        var cardHTML = '';
        
        if (title) {
            cardHTML += '<h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #1D1D1F;">' + title + '</h3>';
        }
        
        if (content) {
            cardHTML += '<div style="margin-bottom: ' + (footer ? '16px' : '0') + '; color: #86868B; line-height: 1.5;">' + content + '</div>';
        }
        
        if (footer) {
            cardHTML += '<div style="margin: 0; font-size: 14px; color: #86868B;">' + footer + '</div>';
        }

        card.innerHTML = cardHTML;
        return card;
    };

    /**
     * 모달 컴포넌트 (ES5 버전)
     */
    UIComponents.prototype.createModal = function(options) {
        options = options || {};
        
        var title = options.title || '';
        var content = options.content || '';
        var actions = options.actions || [];
        var onClose = options.onClose || null;
        var closeOnOverlay = options.closeOnOverlay !== false;
        var className = options.className || '';

        var self = this;

        // 오버레이 생성
        var overlay = document.createElement('div');
        overlay.className = 'ui-modal-overlay';

        // 모달 컨테이너 생성
        var modal = document.createElement('div');
        modal.className = 'ui-component ui-modal ' + className;
        modal.style.padding = '32px';
        modal.style.minWidth = '320px';

        // 제목 영역
        var modalHTML = '';
        if (title) {
            modalHTML += '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">';
            modalHTML += '<h2 style="margin: 0; font-size: 24px; font-weight: 700; color: #1D1D1F;">' + title + '</h2>';
            modalHTML += '<button class="modal-close" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #86868B; padding: 4px;">×</button>';
            modalHTML += '</div>';
        }

        // 내용 영역
        if (content) {
            modalHTML += '<div class="modal-content" style="margin-bottom: ' + (actions.length ? '32px' : '0') + ';">' + content + '</div>';
        }

        // 액션 영역
        if (actions.length > 0) {
            modalHTML += '<div class="modal-actions" style="display: flex; gap: 12px; justify-content: flex-end;"></div>';
        }

        modal.innerHTML = modalHTML;

        // 액션 버튼들 추가
        if (actions.length > 0) {
            var actionsContainer = modal.querySelector('.modal-actions');
            for (var i = 0; i < actions.length; i++) {
                var action = actions[i];
                var button = this.createButton({
                    text: action.text || '확인',
                    type: action.type || 'primary',
                    onClick: (function(actionRef) {
                        return function(e) {
                            if (actionRef.onClick) {
                                actionRef.onClick(e);
                            }
                            if (actionRef.closeModal !== false) {
                                self.closeModal(overlay);
                            }
                        };
                    })(action)
                });
                actionsContainer.appendChild(button);
            }
        }

        // 닫기 이벤트
        var closeHandler = function() {
            if (onClose) {
                onClose();
            }
            self.closeModal(overlay);
        };

        var closeButton = modal.querySelector('.modal-close');
        if (closeButton) {
            closeButton.addEventListener('click', closeHandler);
        }

        if (closeOnOverlay) {
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) {
                    closeHandler();
                }
            });
        }

        // ESC 키로 닫기
        var escHandler = function(e) {
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
            close: function() { 
                closeHandler(); 
            },
            setContent: function(newContent) {
                var contentElement = modal.querySelector('.modal-content');
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
    };

    /**
     * 모달 닫기 (ES5 버전)
     */
    UIComponents.prototype.closeModal = function(overlay) {
        overlay.style.animation = 'fadeOut 0.2s forwards';
        setTimeout(function() {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 200);
    };

    /**
     * 토스트 메시지 (ES5 버전)
     */
    UIComponents.prototype.showToast = function(message, duration, type) {
        duration = duration || 3000;
        type = type || 'info';
        
        var toast = document.createElement('div');
        toast.className = 'ui-toast';
        
        // 타입별 스타일
        var typeStyles = {
            success: { background: 'rgba(52, 199, 89, 0.9)' },
            error: { background: 'rgba(255, 59, 48, 0.9)' },
            warning: { background: 'rgba(255, 149, 0, 0.9)' },
            info: { background: 'rgba(0, 0, 0, 0.8)' }
        };

        var typeStyle = typeStyles[type] || typeStyles.info;
        Object.assign(toast.style, typeStyle);
        
        toast.textContent = message;
        document.body.appendChild(toast);

        // 자동 제거
        setTimeout(function() {
            toast.style.animation = 'toastOut 0.3s ease forwards';
            setTimeout(function() {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);

        return toast;
    };

    /**
     * 로딩 스피너 (ES5 버전)
     */
    UIComponents.prototype.createSpinner = function(size, color) {
        size = size || 'medium';
        color = color || '#007AFF';
        
        var spinner = document.createElement('div');
        spinner.className = 'ui-loading';
        
        var sizes = {
            small: '16px',
            medium: '24px',
            large: '32px'
        };

        var spinnerSize = sizes[size] || sizes.medium;
        
        Object.assign(spinner.style, {
            width: spinnerSize,
            height: spinnerSize,
            borderTopColor: color
        });

        return spinner;
    };

    /**
     * 입력 필드 컴포넌트 (ES5 버전)
     */
    UIComponents.prototype.createInput = function(options) {
        options = options || {};
        
        var type = options.type || 'text';
        var placeholder = options.placeholder || '';
        var label = options.label || '';
        var required = options.required || false;
        var disabled = options.disabled || false;
        var value = options.value || '';
        var onChange = options.onChange || null;
        var className = options.className || '';

        var container = document.createElement('div');
        container.className = 'ui-component input-container ' + className;
        
        if (label) {
            var labelElement = document.createElement('label');
            labelElement.style.cssText = 'display: block; margin-bottom: 8px; font-weight: 500; color: #1D1D1F;';
            labelElement.textContent = label + (required ? ' *' : '');
            container.appendChild(labelElement);
        }

        var input = document.createElement('input');
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
        input.addEventListener('focus', function() {
            input.style.borderColor = '#007AFF';
        });

        input.addEventListener('blur', function() {
            input.style.borderColor = '#D1D1D6';
        });

        if (onChange) {
            input.addEventListener('input', onChange);
        }

        container.appendChild(input);
        
        return {
            container: container,
            input: input,
            setValue: function(newValue) {
                input.value = newValue;
            },
            getValue: function() {
                return input.value;
            },
            setDisabled: function(isDisabled) {
                input.disabled = isDisabled;
                input.style.backgroundColor = isDisabled ? '#F2F2F7' : 'white';
                input.style.color = isDisabled ? '#86868B' : '#1D1D1F';
            }
        };
    };

    /**
     * 선택 드롭다운 컴포넌트 (ES5 버전)
     */
    UIComponents.prototype.createSelect = function(options) {
        options = options || {};
        
        var selectOptions = options.options || [];
        var placeholder = options.placeholder || '선택하세요';
        var label = options.label || '';
        var required = options.required || false;
        var disabled = options.disabled || false;
        var value = options.value || '';
        var onChange = options.onChange || null;
        var className = options.className || '';

        var container = document.createElement('div');
        container.className = 'ui-component select-container ' + className;
        
        if (label) {
            var labelElement = document.createElement('label');
            labelElement.style.cssText = 'display: block; margin-bottom: 8px; font-weight: 500; color: #1D1D1F;';
            labelElement.textContent = label + (required ? ' *' : '');
            container.appendChild(labelElement);
        }

        var select = document.createElement('select');
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
            var placeholderOption = document.createElement('option');
            placeholderOption.value = '';
            placeholderOption.textContent = placeholder;
            placeholderOption.disabled = true;
            placeholderOption.selected = !value;
            select.appendChild(placeholderOption);
        }

        // 선택 옵션들 추가
        for (var i = 0; i < selectOptions.length; i++) {
            var option = selectOptions[i];
            var optionElement = document.createElement('option');
            optionElement.value = option.value || option;
            optionElement.textContent = option.text || option;
            if (value === optionElement.value) {
                optionElement.selected = true;
            }
            select.appendChild(optionElement);
        }

        // 포커스 효과
        select.addEventListener('focus', function() {
            select.style.borderColor = '#007AFF';
        });

        select.addEventListener('blur', function() {
            select.style.borderColor = '#D1D1D6';
        });

        if (onChange) {
            select.addEventListener('change', onChange);
        }

        container.appendChild(select);
        
        return {
            container: container,
            select: select,
            setValue: function(newValue) {
                select.value = newValue;
            },
            getValue: function() {
                return select.value;
            },
            setOptions: function(newOptions) {
                // 기존 옵션들 제거 (placeholder 제외)
                var options = select.querySelectorAll('option:not([disabled])');
                for (var i = 0; i < options.length; i++) {
                    options[i].remove();
                }
                
                // 새 옵션들 추가
                for (var i = 0; i < newOptions.length; i++) {
                    var option = newOptions[i];
                    var optionElement = document.createElement('option');
                    optionElement.value = option.value || option;
                    optionElement.textContent = option.text || option;
                    select.appendChild(optionElement);
                }
            }
        };
    };

    /**
     * 체크박스 컴포넌트 (ES5 버전)
     */
    UIComponents.prototype.createCheckbox = function(options) {
        options = options || {};
        
        var label = options.label || '';
        var checked = options.checked || false;
        var disabled = options.disabled || false;
        var onChange = options.onChange || null;
        var className = options.className || '';

        var container = document.createElement('label');
        container.className = 'ui-component checkbox-container ' + className;
        container.style.cssText = 'display: flex; align-items: center; cursor: pointer; gap: 12px; min-height: 44px;';
        
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = checked;
        checkbox.disabled = disabled;
        
        Object.assign(checkbox.style, {
            width: '20px',
            height: '20px',
            cursor: disabled ? 'not-allowed' : 'pointer'
        });

        var labelText = document.createElement('span');
        labelText.textContent = label;
        labelText.style.cssText = 'color: ' + (disabled ? '#86868B' : '#1D1D1F') + '; font-size: 16px;';

        if (onChange) {
            checkbox.addEventListener('change', onChange);
        }

        container.appendChild(checkbox);
        container.appendChild(labelText);
        
        return {
            container: container,
            checkbox: checkbox,
            setChecked: function(isChecked) {
                checkbox.checked = isChecked;
            },
            isChecked: function() {
                return checkbox.checked;
            },
            setDisabled: function(isDisabled) {
                checkbox.disabled = isDisabled;
                container.style.cursor = isDisabled ? 'not-allowed' : 'pointer';
                labelText.style.color = isDisabled ? '#86868B' : '#1D1D1F';
            }
        };
    };

    /**
     * 색상 견본 버튼 (ES5 버전)
     */
    UIComponents.prototype.createColorSwatch = function(options) {
        options = options || {};
        
        var color = options.color || '#000000';
        var size = options.size || 'medium';
        var selected = options.selected || false;
        var onClick = options.onClick || null;
        var className = options.className || '';
        var showBorder = options.showBorder !== false;

        var sizes = {
            small: '32px',
            medium: '44px',
            large: '56px'
        };

        var swatch = document.createElement('button');
        swatch.className = 'ui-component color-swatch ' + className;
        
        Object.assign(swatch.style, {
            width: sizes[size] || sizes.medium,
            height: sizes[size] || sizes.medium,
            backgroundColor: color,
            border: showBorder ? '2px solid ' + (selected ? '#007AFF' : '#D1D1D6') : 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            outline: 'none',
            boxShadow: selected ? '0 0 0 2px rgba(0, 122, 255, 0.3)' : 'none'
        });

        // 호버 효과
        swatch.addEventListener('mouseenter', function() {
            swatch.style.transform = 'scale(1.05)';
        });

        swatch.addEventListener('mouseleave', function() {
            swatch.style.transform = 'scale(1)';
        });

        if (onClick) {
            swatch.addEventListener('click', function(e) {
                onClick(e, color);
            });
        }

        swatch.setSelected = function(isSelected) {
            swatch.style.border = showBorder ? '2px solid ' + (isSelected ? '#007AFF' : '#D1D1D6') : 'none';
            swatch.style.boxShadow = isSelected ? '0 0 0 2px rgba(0, 122, 255, 0.3)' : 'none';
        };

        swatch.setColor = function(newColor) {
            swatch.style.backgroundColor = newColor;
        };

        return swatch;
    };

    /**
     * 색상 팔레트 그리드 생성 (ES5 버전)
     */
    UIComponents.prototype.createColorPalette = function(options) {
        options = options || {};
        
        var colors = options.colors || [];
        var columns = options.columns || 5;
        var size = options.size || 'medium';
        var onColorSelect = options.onColorSelect || null;
        var selectedColor = options.selectedColor || null;
        var className = options.className || '';

        var container = document.createElement('div');
        container.className = 'ui-component color-palette ' + className;
        container.style.cssText = 'display: grid; grid-template-columns: repeat(' + columns + ', 1fr); gap: 8px;';

        var self = this;
        
        for (var i = 0; i < colors.length; i++) {
            var color = colors[i];
            var colorValue = typeof color === 'string' ? color : color.value;
            var isSelected = selectedColor === colorValue;
            
            var swatch = this.createColorSwatch({
                color: colorValue,
                size: size,
                selected: isSelected,
                onClick: function(e, clickedColor) {
                    // 이전 선택 해제
                    var swatches = container.querySelectorAll('.color-swatch');
                    for (var j = 0; j < swatches.length; j++) {
                        swatches[j].setSelected(false);
                    }
                    
                    // 현재 선택 활성화
                    e.target.setSelected(true);
                    
                    if (onColorSelect) {
                        onColorSelect(clickedColor, color);
                    }
                }
            });
            
            container.appendChild(swatch);
        }

        return {
            container: container,
            setSelectedColor: function(color) {
                var swatches = container.querySelectorAll('.color-swatch');
                for (var i = 0; i < swatches.length; i++) {
                    var swatchColor = swatches[i].style.backgroundColor;
                    var isSelected = swatchColor === color || 
                                   swatchColor === 'rgb(' + this.hexToRgb(color).join(', ') + ')';
                    swatches[i].setSelected(isSelected);
                }
            },
            getSelectedColor: function() {
                var selectedSwatch = container.querySelector('.color-swatch[style*="rgb(0, 122, 255"]');
                return selectedSwatch ? selectedSwatch.style.backgroundColor : null;
            }
        };
    };

    /**
     * 헥스 컬러를 RGB로 변환 (ES5 버전)
     */
    UIComponents.prototype.hexToRgb = function(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : null;
    };

    /**
     * 프로그레스 바 컴포넌트 (ES5 버전)
     */
    UIComponents.prototype.createProgressBar = function(options) {
        options = options || {};
        
        var progress = options.progress || 0;
        var label = options.label || '';
        var showPercentage = options.showPercentage !== false;
        var color = options.color || '#007AFF';
        var height = options.height || '8px';
        var className = options.className || '';

        var container = document.createElement('div');
        container.className = 'ui-component progress-container ' + className;
        
        if (label || showPercentage) {
            var labelContainer = document.createElement('div');
            labelContainer.style.cssText = 'display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; color: #1D1D1F;';
            
            var labelSpan = document.createElement('span');
            labelSpan.textContent = label;
            labelContainer.appendChild(labelSpan);
            
            if (showPercentage) {
                var percentageSpan = document.createElement('span');
                percentageSpan.textContent = Math.round(progress * 100) + '%';
                percentageSpan.className = 'progress-percentage';
                labelContainer.appendChild(percentageSpan);
            }
            
            container.appendChild(labelContainer);
        }

        var progressTrack = document.createElement('div');
        progressTrack.style.cssText = 'width: 100%; height: ' + height + '; background: #F2F2F7; border-radius: 4px; overflow: hidden;';

        var progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.style.cssText = 'height: 100%; background: ' + color + '; width: ' + (progress * 100) + '%; transition: width 0.3s ease; border-radius: 4px;';

        progressTrack.appendChild(progressBar);
        container.appendChild(progressTrack);

        return {
            container: container,
            setProgress: function(newProgress) {
                progress = Math.max(0, Math.min(1, newProgress));
                progressBar.style.width = (progress * 100) + '%';
                
                if (showPercentage) {
                    var percentageElement = container.querySelector('.progress-percentage');
                    if (percentageElement) {
                        percentageElement.textContent = Math.round(progress * 100) + '%';
                    }
                }
            },
            getProgress: function() {
                return progress;
            }
        };
    };

    /**
     * 탭 컴포넌트 (ES5 버전)
     */
    UIComponents.prototype.createTabs = function(options) {
        options = options || {};
        
        var tabs = options.tabs || [];
        var activeTab = options.activeTab || 0;
        var onTabChange = options.onTabChange || null;
        var className = options.className || '';

        var container = document.createElement('div');
        container.className = 'ui-component tabs-container ' + className;

        var tabHeaders = document.createElement('div');
        tabHeaders.className = 'tab-headers';
        tabHeaders.style.cssText = 'display: flex; border-bottom: 1px solid #D1D1D6; margin-bottom: 24px;';

        var tabContents = document.createElement('div');
        tabContents.className = 'tab-contents';

        // 탭 헤더 및 콘텐츠 생성
        for (var i = 0; i < tabs.length; i++) {
            var tab = tabs[i];
            var isActive = i === activeTab;

            // 탭 헤더 버튼
            var tabButton = document.createElement('button');
            tabButton.className = 'tab-header';
            tabButton.textContent = tab.title || 'Tab ' + (i + 1);
            tabButton.setAttribute('data-tab-index', i);
            
            tabButton.style.cssText = [
                'background: none',
                'border: none',
                'padding: 16px 24px',
                'font-size: 16px',
                'font-weight: 500',
                'cursor: pointer',
                'color: ' + (isActive ? '#007AFF' : '#86868B'),
                'border-bottom: 2px solid ' + (isActive ? '#007AFF' : 'transparent'),
                'transition: all 0.2s ease'
            ].join('; ');

            // 탭 클릭 이벤트
            tabButton.addEventListener('click', (function(tabIndex) {
                return function() {
                    // 모든 탭 비활성화
                    var allHeaders = tabHeaders.querySelectorAll('.tab-header');
                    var allContents = tabContents.querySelectorAll('.tab-content');
                    
                    for (var j = 0; j < allHeaders.length; j++) {
                        allHeaders[j].style.color = '#86868B';
                        allHeaders[j].style.borderBottom = '2px solid transparent';
                    }
                    
                    for (var j = 0; j < allContents.length; j++) {
                        allContents[j].style.display = 'none';
                    }

                    // 선택된 탭 활성화
                    tabButton.style.color = '#007AFF';
                    tabButton.style.borderBottom = '2px solid #007AFF';
                    
                    var targetContent = tabContents.querySelector('[data-tab-index="' + tabIndex + '"]');
                    if (targetContent) {
                        targetContent.style.display = 'block';
                    }

                    if (onTabChange) {
                        onTabChange(tabIndex, tab);
                    }
                };
            })(i));

            tabHeaders.appendChild(tabButton);

            // 탭 콘텐츠
            var tabContent = document.createElement('div');
            tabContent.className = 'tab-content';
            tabContent.setAttribute('data-tab-index', i);
            tabContent.style.display = isActive ? 'block' : 'none';
            
            if (typeof tab.content === 'string') {
                tabContent.innerHTML = tab.content;
            } else if (tab.content) {
                tabContent.appendChild(tab.content);
            }

            tabContents.appendChild(tabContent);
        }

        container.appendChild(tabHeaders);
        container.appendChild(tabContents);

        return {
            container: container,
            setActiveTab: function(tabIndex) {
                var targetButton = tabHeaders.querySelector('[data-tab-index="' + tabIndex + '"]');
                if (targetButton) {
                    targetButton.click();
                }
            },
            getActiveTab: function() {
                var activeButton = tabHeaders.querySelector('.tab-header[style*="rgb(0, 122, 255)"]');
                return activeButton ? parseInt(activeButton.getAttribute('data-tab-index')) : 0;
            }
        };
    };

    // 전역 객체로 등록
    if (typeof window !== 'undefined') {
        window.UIComponents = new UIComponents();
        console.log('✅ UIComponents ES5 버전 로드 완료');
    }

})();
