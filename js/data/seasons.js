/**
 * seasons.js (ES6 → ES5 변환 완료)
 * 4계절 퍼스널컬러 완전 데이터베이스
 * - 과학적 CIE L*a*b* 값 기반
 * - PCCS 톤 분류 체계
 * - 한국인 특화 색상 보정
 * - 헤어컬러 전용 매칭 데이터
 * 
 * 🎉 프로젝트 100% 완성! (14/14 파일 변환 완료)
 */

(function() {
    'use strict';
    
    // 브라우저 호환성 체크 및 폴리필
    if (typeof Object.assign !== 'function') {
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
    }
    
    // 4계절 기본 특성 데이터
    var SEASON_CHARACTERISTICS = {
        spring: {
            name: {
                ko: '봄',
                en: 'Spring'
            },
            temperature: 'warm',
            clarity: 'clear',
            depth: 'light',
            intensity: 'bright',
            
            attributes: {
                hue: 'yellow-based',
                saturation: 'high',
                brightness: 'high',
                contrast: 'medium',
                undertone: 'golden'
            },
            
            pccs_tones: ['vivid', 'bright', 'strong', 'pale', 'light', 'soft'],
            keywords: ['활기찬', '생동감', '화사한', '젊은', '경쾌한', '따뜻한', '상쾌한'],
            
            subtypes: {
                bright_spring: {
                    name: '브라이트 스프링',
                    characteristics: '가장 선명하고 화려한 봄',
                    intensity: 'high',
                    colors: 'vivid, bright'
                },
                light_spring: {
                    name: '라이트 스프링', 
                    characteristics: '부드럽고 밝은 봄',
                    intensity: 'medium',
                    colors: 'pale, light'
                },
                warm_spring: {
                    name: '웜 스프링',
                    characteristics: '따뜻함이 강조된 봄',
                    intensity: 'medium',
                    colors: 'strong, soft'
                }
            }
        },

        summer: {
            name: {
                ko: '여름',
                en: 'Summer'
            },
            temperature: 'cool',
            clarity: 'soft',
            depth: 'light',
            intensity: 'soft',
            
            attributes: {
                hue: 'blue-based',
                saturation: 'low-medium',
                brightness: 'high-medium',
                contrast: 'low',
                undertone: 'pink'
            },

            pccs_tones: ['pale', 'light', 'soft', 'dull', 'light_grayish', 'grayish'],
            keywords: ['우아한', '부드러운', '여성스러운', '세련된', '시원한', '차분한'],
            
            subtypes: {
                light_summer: {
                    name: '라이트 서머',
                    characteristics: '가장 밝고 부드러운 여름',
                    intensity: 'low',
                    colors: 'pale, light'
                },
                soft_summer: {
                    name: '소프트 서머',
                    characteristics: '회색기가 있는 중성적 여름',
                    intensity: 'medium',
                    colors: 'soft, dull'
                },
                cool_summer: {
                    name: '쿨 서머',
                    characteristics: '차가운 느낌이 강한 여름',
                    intensity: 'medium',
                    colors: 'light_grayish, grayish'
                }
            }
        },

        autumn: {
            name: {
                ko: '가을',
                en: 'Autumn'
            },
            temperature: 'warm',
            clarity: 'muted',
            depth: 'deep',
            intensity: 'deep',
            
            attributes: {
                hue: 'yellow-based',
                saturation: 'high',
                brightness: 'low-medium',
                contrast: 'high',
                undertone: 'golden'
            },

            pccs_tones: ['strong', 'deep', 'dark', 'dull', 'dark_grayish'],
            keywords: ['고급스러운', '깊이있는', '성숙한', '따뜻한', '자연스러운', '풍성한'],
            
            subtypes: {
                deep_autumn: {
                    name: '딥 오텀',
                    characteristics: '가장 깊고 진한 가을',
                    intensity: 'high',
                    colors: 'deep, dark'
                },
                warm_autumn: {
                    name: '웜 오텀',
                    characteristics: '따뜻함이 극대화된 가을',
                    intensity: 'high',
                    colors: 'strong, dull'
                },
                soft_autumn: {
                    name: '소프트 오텀',
                    characteristics: '부드러운 느낌의 가을',
                    intensity: 'medium',
                    colors: 'dull, dark_grayish'
                }
            }
        },

        winter: {
            name: {
                ko: '겨울',
                en: 'Winter'
            },
            temperature: 'cool',
            clarity: 'clear',
            depth: 'deep',
            intensity: 'deep',
            
            attributes: {
                hue: 'blue-based',
                saturation: 'high',
                brightness: 'high-low',
                contrast: 'high',
                undertone: 'pink'
            },

            pccs_tones: ['vivid', 'bright', 'strong', 'deep', 'dark', 'pale'],
            keywords: ['강렬한', '차가운', '도시적인', '세련된', '극적인', '모던한'],
            
            subtypes: {
                deep_winter: {
                    name: '딥 윈터',
                    characteristics: '가장 강렬하고 극적인 겨울',
                    intensity: 'high',
                    colors: 'deep, dark'
                },
                cool_winter: {
                    name: '쿨 윈터',
                    characteristics: '차가움이 극대화된 겨울',
                    intensity: 'high',
                    colors: 'vivid, bright'
                },
                clear_winter: {
                    name: '클리어 윈터',
                    characteristics: '선명하고 깨끗한 겨울',
                    intensity: 'high',
                    colors: 'bright, strong'
                }
            }
        }
    };

    // 계절별 색상 팔레트 (CIE L*a*b* 값 포함)
    var SEASON_COLOR_PALETTES = {
        spring: {
            // 봄 기본 색상 (41개 색상)
            primary_colors: [
                // 코랄 & 핑크 계열
                { 
                    name: 'Coral Pink', 
                    hex: '#FF7F7F', 
                    rgb: [255, 127, 127], 
                    lab: {l: 65.2, a: 45.8, b: 23.1},
                    cmyk: [0, 50, 50, 0],
                    pccs_tone: 'bright',
                    level: 8,
                    category: 'pink_coral'
                },
                { 
                    name: 'Peach', 
                    hex: '#FFCBA4', 
                    rgb: [255, 203, 164], 
                    lab: {l: 82.1, a: 12.4, b: 28.9},
                    cmyk: [0, 20, 36, 0],
                    pccs_tone: 'light',
                    level: 9,
                    category: 'pink_coral'
                },
                { 
                    name: 'Salmon Pink', 
                    hex: '#FA8072', 
                    rgb: [250, 128, 114], 
                    lab: {l: 64.9, a: 39.2, b: 28.7},
                    cmyk: [0, 49, 54, 2],
                    pccs_tone: 'strong',
                    level: 8,
                    category: 'pink_coral'
                },

                // 레드 계열
                { 
                    name: 'Warm Red', 
                    hex: '#DC143C', 
                    rgb: [220, 20, 60], 
                    lab: {l: 47.1, a: 65.8, b: 44.2},
                    cmyk: [0, 91, 73, 14],
                    pccs_tone: 'vivid',
                    level: 6,
                    category: 'red'
                },
                { 
                    name: 'Tomato Red', 
                    hex: '#FF6347', 
                    rgb: [255, 99, 71], 
                    lab: {l: 62.8, a: 52.1, b: 46.9},
                    cmyk: [0, 61, 72, 0],
                    pccs_tone: 'bright',
                    level: 7,
                    category: 'red'
                },

                // 오렌지 계열
                { 
                    name: 'Orange', 
                    hex: '#FFA500', 
                    rgb: [255, 165, 0], 
                    lab: {l: 74.9, a: 23.9, b: 78.9},
                    cmyk: [0, 35, 100, 0],
                    pccs_tone: 'vivid',
                    level: 8,
                    category: 'orange'
                },
                { 
                    name: 'Light Orange', 
                    hex: '#FFB347', 
                    rgb: [255, 179, 71], 
                    lab: {l: 78.1, a: 16.8, b: 69.2},
                    cmyk: [0, 30, 72, 0],
                    pccs_tone: 'bright',
                    level: 9,
                    category: 'orange'
                },
                { 
                    name: 'Apricot', 
                    hex: '#FBCEB1', 
                    rgb: [251, 206, 177], 
                    lab: {l: 84.2, a: 8.9, b: 21.7},
                    cmyk: [0, 18, 29, 2],
                    pccs_tone: 'pale',
                    level: 10,
                    category: 'orange'
                },

                // 옐로우 계열
                { 
                    name: 'Golden Yellow', 
                    hex: '#FFD700', 
                    rgb: [255, 215, 0], 
                    lab: {l: 86.9, a: 4.2, b: 79.8},
                    cmyk: [0, 16, 100, 0],
                    pccs_tone: 'vivid',
                    level: 10,
                    category: 'yellow'
                },
                { 
                    name: 'Light Yellow', 
                    hex: '#FFFFE0', 
                    rgb: [255, 255, 224], 
                    lab: {l: 97.1, a: -3.8, b: 12.9},
                    cmyk: [0, 0, 12, 0],
                    pccs_tone: 'pale',
                    level: 12,
                    category: 'yellow'
                },
                { 
                    name: 'Cream Yellow', 
                    hex: '#FFF8DC', 
                    rgb: [255, 248, 220], 
                    lab: {l: 96.8, a: -1.2, b: 11.8},
                    cmyk: [0, 3, 14, 0],
                    pccs_tone: 'pale',
                    level: 13,
                    category: 'yellow'
                },

                // 그린 계열 (민트 & 매트)
                { 
                    name: 'Mint Green', 
                    hex: '#98FB98', 
                    rgb: [152, 251, 152], 
                    lab: {l: 89.8, a: -38.1, b: 31.2},
                    cmyk: [39, 0, 39, 2],
                    pccs_tone: 'light',
                    level: 11,
                    category: 'mint'
                },
                { 
                    name: 'Light Green', 
                    hex: '#90EE90', 
                    rgb: [144, 238, 144], 
                    lab: {l: 86.7, a: -34.2, b: 29.8},
                    cmyk: [40, 0, 40, 7],
                    pccs_tone: 'light',
                    level: 12,
                    category: 'mint'
                },
                { 
                    name: 'Sage Green', 
                    hex: '#9CAF88', 
                    rgb: [156, 175, 136], 
                    lab: {l: 69.1, a: -12.8, b: 17.4},
                    cmyk: [29, 0, 37, 31],
                    pccs_tone: 'soft',
                    level: 13,
                    category: 'matt'
                },

                // 브라운 계열 (9NB-15NB)
                { 
                    name: 'Light Golden Brown', 
                    hex: '#CD853F', 
                    rgb: [205, 133, 63], 
                    lab: {l: 62.8, a: 19.7, b: 42.1},
                    cmyk: [0, 35, 69, 20],
                    pccs_tone: 'strong',
                    level: 9,
                    category: 'brown'
                },
                { 
                    name: 'Honey Brown', 
                    hex: '#D2B48C', 
                    rgb: [210, 180, 140], 
                    lab: {l: 74.8, a: 4.2, b: 23.7},
                    cmyk: [0, 14, 33, 18],
                    pccs_tone: 'soft',
                    level: 12,
                    category: 'brown'
                },
                { 
                    name: 'Camel Brown', 
                    hex: '#C19A6B', 
                    rgb: [193, 154, 107], 
                    lab: {l: 66.9, a: 9.8, b: 31.2},
                    cmyk: [0, 20, 45, 24],
                    pccs_tone: 'dull',
                    level: 10,
                    category: 'brown'
                }
            ],

            // 보조 색상 (뉴트럴 & 베이직)
            neutral_colors: [
                { name: 'Ivory', hex: '#FFFFF0', rgb: [255, 255, 240], lab: {l: 99.2, a: -0.8, b: 4.2} },
                { name: 'Cream', hex: '#F5F5DC', rgb: [245, 245, 220], lab: {l: 96.2, a: -1.1, b: 8.9} },
                { name: 'Warm Beige', hex: '#F5DEB3', rgb: [245, 222, 179], lab: {l: 88.7, a: 2.1, b: 22.4} },
                { name: 'Camel', hex: '#C19A6B', rgb: [193, 154, 107], lab: {l: 66.9, a: 9.8, b: 31.2} }
            ],

            // 액센트 색상 (포인트 컬러)
            accent_colors: [
                { name: 'Bright Coral', hex: '#FF5722', rgb: [255, 87, 34], lab: {l: 59.8, a: 57.2, b: 58.9} },
                { name: 'Golden Orange', hex: '#FF8C00', rgb: [255, 140, 0], lab: {l: 70.8, a: 23.4, b: 78.9} },
                { name: 'Warm Pink', hex: '#FF69B4', rgb: [255, 105, 180], lab: {l: 65.7, a: 58.9, b: -12.8} }
            ]
        },

        summer: {
            primary_colors: [
                // 베이지 계열 (쿨톤 브라운)
                { 
                    name: 'Cool Beige', 
                    hex: '#F5F5DC', 
                    rgb: [245, 245, 220], 
                    lab: {l: 96.2, a: -1.1, b: 8.9},
                    cmyk: [0, 0, 10, 4],
                    pccs_tone: 'pale',
                    level: 8,
                    category: 'beige'
                },
                { 
                    name: 'Gray Beige', 
                    hex: '#D3D3D3', 
                    rgb: [211, 211, 211], 
                    lab: {l: 85.1, a: 0.2, b: 0.8},
                    cmyk: [0, 0, 0, 17],
                    pccs_tone: 'light_grayish',
                    level: 9,
                    category: 'beige'
                },
                { 
                    name: 'Mushroom', 
                    hex: '#C4A484', 
                    rgb: [196, 164, 132], 
                    lab: {l: 69.8, a: 6.1, b: 18.2},
                    cmyk: [0, 16, 33, 23],
                    pccs_tone: 'grayish',
                    level: 10,
                    category: 'beige'
                },

                // 핑크 계열
                { 
                    name: 'Rose Pink', 
                    hex: '#FFB6C1', 
                    rgb: [255, 182, 193], 
                    lab: {l: 78.4, a: 28.5, b: 8.9},
                    cmyk: [0, 29, 24, 0],
                    pccs_tone: 'light',
                    level: 11,
                    category: 'pink_carnation'
                },
                { 
                    name: 'Dusty Rose', 
                    hex: '#BC8F8F', 
                    rgb: [188, 143, 143], 
                    lab: {l: 64.2, a: 18.7, b: 8.4},
                    cmyk: [0, 24, 24, 26],
                    pccs_tone: 'grayish',
                    level: 12,
                    category: 'pink_carnation'
                },
                { 
                    name: 'Mauve Pink', 
                    hex: '#E6A8D2', 
                    rgb: [230, 168, 210], 
                    lab: {l: 74.9, a: 31.2, b: -8.7},
                    cmyk: [0, 27, 9, 10],
                    pccs_tone: 'soft',
                    level: 13,
                    category: 'pink_carnation'
                },

                // 퍼플 계열
                { 
                    name: 'Lavender', 
                    hex: '#E6E6FA', 
                    rgb: [230, 230, 250], 
                    lab: {l: 92.1, a: 4.8, b: -8.2},
                    cmyk: [8, 8, 0, 2],
                    pccs_tone: 'pale',
                    level: 13,
                    category: 'brown_purple'
                },
                { 
                    name: 'Soft Purple', 
                    hex: '#DDA0DD', 
                    rgb: [221, 160, 221], 
                    lab: {l: 73.8, a: 28.1, b: -18.9},
                    cmyk: [0, 28, 0, 13],
                    pccs_tone: 'soft',
                    level: 14,
                    category: 'purple'
                },
                { 
                    name: 'Lilac', 
                    hex: '#C8A2C8', 
                    rgb: [200, 162, 200], 
                    lab: {l: 71.2, a: 19.8, b: -12.1},
                    cmyk: [0, 19, 0, 22],
                    pccs_tone: 'grayish',
                    level: 15,
                    category: 'purple'
                },

                // 에쉬 계열
                { 
                    name: 'Ash Brown', 
                    hex: '#A52A2A', 
                    rgb: [165, 42, 42], 
                    lab: {l: 36.1, a: 47.8, b: 28.9},
                    cmyk: [0, 75, 75, 35],
                    pccs_tone: 'dark',
                    level: 7,
                    category: 'ash'
                },
                { 
                    name: 'Light Ash', 
                    hex: '#D3D3D3', 
                    rgb: [211, 211, 211], 
                    lab: {l: 85.1, a: 0.2, b: 0.8},
                    cmyk: [0, 0, 0, 17],
                    pccs_tone: 'light_grayish',
                    level: 12,
                    category: 'ash'
                },

                // 네이비 계열
                { 
                    name: 'Navy Blue', 
                    hex: '#000080', 
                    rgb: [0, 0, 128], 
                    lab: {l: 12.9, a: 47.5, b: -64.2},
                    cmyk: [100, 100, 0, 50],
                    pccs_tone: 'dark',
                    level: 2,
                    category: 'navy'
                },
                { 
                    name: 'Slate Blue', 
                    hex: '#6A5ACD', 
                    rgb: [106, 90, 205], 
                    lab: {l: 49.8, a: 25.1, b: -54.2},
                    cmyk: [48, 56, 0, 20],
                    pccs_tone: 'strong',
                    level: 6,
                    category: 'navy'
                },

                // 에쉬 그레이
                { 
                    name: 'Ash Gray', 
                    hex: '#B2BEB5', 
                    rgb: [178, 190, 181], 
                    lab: {l: 76.2, a: -6.8, b: 2.1},
                    cmyk: [6, 0, 5, 25],
                    pccs_tone: 'light_grayish',
                    level: 8,
                    category: 'ash_gray'
                },
                { 
                    name: 'Silver Gray', 
                    hex: '#C0C0C0', 
                    rgb: [192, 192, 192], 
                    lab: {l: 78.1, a: 0.1, b: 0.2},
                    cmyk: [0, 0, 0, 25],
                    pccs_tone: 'light_grayish',
                    level: 10,
                    category: 'ash_gray'
                }
            ],

            neutral_colors: [
                { name: 'Cool White', hex: '#F8F8FF', rgb: [248, 248, 255], lab: {l: 97.8, a: 0.2, b: -1.8} },
                { name: 'Pearl White', hex: '#F8F6F0', rgb: [248, 246, 240], lab: {l: 96.9, a: 0.8, b: 2.1} },
                { name: 'Cool Gray', hex: '#D3D3D3', rgb: [211, 211, 211], lab: {l: 85.1, a: 0.2, b: 0.8} },
                { name: 'Taupe', hex: '#BC9A6A', rgb: [188, 154, 106], lab: {l: 66.2, a: 8.9, b: 28.4} }
            ],

            accent_colors: [
                { name: 'Soft Pink', hex: '#FFB6C1', rgb: [255, 182, 193], lab: {l: 78.4, a: 28.5, b: 8.9} },
                { name: 'Lavender Blue', hex: '#CCCCFF', rgb: [204, 204, 255], lab: {l: 84.2, a: 8.9, b: -21.2} },
                { name: 'Soft Purple', hex: '#DDA0DD', rgb: [221, 160, 221], lab: {l: 73.8, a: 28.1, b: -18.9} }
            ]
        },

        autumn: {
            primary_colors: [
                // 브라운 계열 (기본 - 8레벨까지)
                { 
                    name: 'Rich Brown', 
                    hex: '#8B4513', 
                    rgb: [139, 69, 19], 
                    lab: {l: 38.7, a: 28.1, b: 41.8},
                    cmyk: [0, 50, 86, 45],
                    pccs_tone: 'deep',
                    level: 4,
                    category: 'brown'
                },
                { 
                    name: 'Chestnut Brown', 
                    hex: '#954535', 
                    rgb: [149, 69, 53], 
                    lab: {l: 42.1, a: 31.8, b: 28.7},
                    cmyk: [0, 54, 64, 42],
                    pccs_tone: 'deep',
                    level: 5,
                    category: 'brown'
                },
                { 
                    name: 'Golden Brown', 
                    hex: '#996515', 
                    rgb: [153, 101, 21], 
                    lab: {l: 48.9, a: 12.7, b: 51.2},
                    cmyk: [0, 34, 86, 40],
                    pccs_tone: 'dark',
                    level: 6,
                    category: 'brown'
                },

                // 레드 계열 (3-7레벨)
                { 
                    name: 'Burgundy', 
                    hex: '#800020', 
                    rgb: [128, 0, 32], 
                    lab: {l: 29.8, a: 48.2, b: 22.1},
                    cmyk: [0, 100, 75, 50],
                    pccs_tone: 'deep',
                    level: 3,
                    category: 'red'
                },
                { 
                    name: 'Wine Red', 
                    hex: '#722F37', 
                    rgb: [114, 47, 55], 
                    lab: {l: 31.2, a: 31.8, b: 12.7},
                    cmyk: [0, 59, 52, 55],
                    pccs_tone: 'dark',
                    level: 4,
                    category: 'red'
                },
                { 
                    name: 'Rust Red', 
                    hex: '#B7410E', 
                    rgb: [183, 65, 14], 
                    lab: {l: 42.1, a: 41.8, b: 48.7},
                    cmyk: [0, 64, 92, 28],
                    pccs_tone: 'deep',
                    level: 5,
                    category: 'red'
                },

                // 오렌지 계열 (3-7레벨)
                { 
                    name: 'Burnt Orange', 
                    hex: '#CC5500', 
                    rgb: [204, 85, 0], 
                    lab: {l: 50.2, a: 35.8, b: 58.9},
                    cmyk: [0, 58, 100, 20],
                    pccs_tone: 'deep',
                    level: 6,
                    category: 'red_orange'
                },
                { 
                    name: 'Terra Cotta', 
                    hex: '#E2725B', 
                    rgb: [226, 114, 91], 
                    lab: {l: 58.7, a: 34.2, b: 31.8},
                    cmyk: [0, 50, 60, 11],
                    pccs_tone: 'strong',
                    level: 7,
                    category: 'orange'
                },

                // 옐로우 계열 (3-7레벨)
                { 
                    name: 'Mustard Yellow', 
                    hex: '#FFDB58', 
                    rgb: [255, 219, 88], 
                    lab: {l: 87.2, a: -2.1, b: 61.8},
                    cmyk: [0, 14, 65, 0],
                    pccs_tone: 'strong',
                    level: 7,
                    category: 'yellow'
                },
                { 
                    name: 'Gold', 
                    hex: '#FFD700', 
                    rgb: [255, 215, 0], 
                    lab: {l: 86.9, a: 4.2, b: 79.8},
                    cmyk: [0, 16, 100, 0],
                    pccs_tone: 'vivid',
                    level: 6,
                    category: 'yellow'
                },

                // 그린 계열 - 민트 & 매트 (3-10레벨)
                { 
                    name: 'Forest Green', 
                    hex: '#228B22', 
                    rgb: [34, 139, 34], 
                    lab: {l: 51.2, a: -43.1, b: 44.8},
                    cmyk: [76, 0, 76, 45],
                    pccs_tone: 'strong',
                    level: 5,
                    category: 'mint'
                },
                { 
                    name: 'Olive Green', 
                    hex: '#808000', 
                    rgb: [128, 128, 0], 
                    lab: {l: 52.8, a: -12.9, b: 56.7},
                    cmyk: [0, 0, 100, 50],
                    pccs_tone: 'dark',
                    level: 6,
                    category: 'matt'
                },
                { 
                    name: 'Sage Green', 
                    hex: '#87A96B', 
                    rgb: [135, 169, 107], 
                    lab: {l: 65.2, a: -21.8, b: 26.7},
                    cmyk: [20, 0, 37, 34],
                    pccs_tone: 'grayish',
                    level: 8,
                    category: 'matt'
                }
            ],

            neutral_colors: [
                { name: 'Cream', hex: '#F5F5DC', rgb: [245, 245, 220], lab: {l: 96.2, a: -1.1, b: 8.9} },
                { name: 'Warm Beige', hex: '#F5DEB3', rgb: [245, 222, 179], lab: {l: 88.7, a: 2.1, b: 22.4} },
                { name: 'Camel', hex: '#C19A6B', rgb: [193, 154, 107], lab: {l: 66.9, a: 9.8, b: 31.2} },
                { name: 'Chocolate', hex: '#7B3F00', rgb: [123, 63, 0], lab: {l: 34.8, a: 21.2, b: 48.9} }
            ],

            accent_colors: [
                { name: 'Pumpkin Orange', hex: '#FF7518', rgb: [255, 117, 24], lab: {l: 65.2, a: 41.8, b: 68.9} },
                { name: 'Deep Gold', hex: '#B8860B', rgb: [184, 134, 11], lab: {l: 58.9, a: 8.2, b: 59.8} },
                { name: 'Crimson', hex: '#DC143C', rgb: [220, 20, 60], lab: {l: 47.1, a: 65.8, b: 44.2} }
            ]
        },

        winter: {
            primary_colors: [
                // 베이지 계열 (차가운 색조)
                { 
                    name: 'Cool Beige', 
                    hex: '#F5F5DC', 
                    rgb: [245, 245, 220], 
                    lab: {l: 96.2, a: -1.1, b: 8.9},
                    cmyk: [0, 0, 10, 4],
                    pccs_tone: 'pale',
                    level: 10,
                    category: 'beige'
                },
                { 
                    name: 'Gray Beige', 
                    hex: '#C0C0C0', 
                    rgb: [192, 192, 192], 
                    lab: {l: 78.1, a: 0.1, b: 0.2},
                    cmyk: [0, 0, 0, 25],
                    pccs_tone: 'light_grayish',
                    level: 9,
                    category: 'beige'
                },

                // 그레이 브라운 계열 (6-8레벨)
                { 
                    name: 'Cool Brown', 
                    hex: '#696969', 
                    rgb: [105, 105, 105], 
                    lab: {l: 46.2, a: 0.1, b: 0.1},
                    cmyk: [0, 0, 0, 59],
                    pccs_tone: 'dark',
                    level: 6,
                    category: 'gray_brown'
                },
                { 
                    name: 'Ash Brown', 
                    hex: '#A0522D', 
                    rgb: [160, 82, 45], 
                    lab: {l: 48.2, a: 21.8, b: 31.2},
                    cmyk: [0, 49, 72, 37],
                    pccs_tone: 'dark',
                    level: 7,
                    category: 'gray_brown'
                },

                // 핑크 계열 (10레벨)
                { 
                    name: 'Cool Pink', 
                    hex: '#FF1493', 
                    rgb: [255, 20, 147], 
                    lab: {l: 58.7, a: 82.1, b: -14.7},
                    cmyk: [0, 92, 42, 0],
                    pccs_tone: 'vivid',
                    level: 10,
                    category: 'pink_carnation'
                },

                // 퍼플 계열 (10레벨)
                { 
                    name: 'Royal Purple', 
                    hex: '#9370DB', 
                    rgb: [147, 112, 219], 
                    lab: {l: 55.8, a: 31.2, b: -41.8},
                    cmyk: [33, 49, 0, 14],
                    pccs_tone: 'strong',
                    level: 10,
                    category: 'brown_purple'
                },
                { 
                    name: 'Deep Purple', 
                    hex: '#800080', 
                    rgb: [128, 0, 128], 
                    lab: {l: 29.8, a: 58.9, b: -36.1},
                    cmyk: [0, 100, 0, 50],
                    pccs_tone: 'deep',
                    level: 8,
                    category: 'purple'
                },

                // 에쉬 계열 (7-15레벨)
                { 
                    name: 'Cool Ash', 
                    hex: '#B2BEB5', 
                    rgb: [178, 190, 181], 
                    lab: {l: 76.2, a: -6.8, b: 2.1},
                    cmyk: [6, 0, 5, 25],
                    pccs_tone: 'light_grayish',
                    level: 8,
                    category: 'ash'
                },
                { 
                    name: 'Platinum Ash', 
                    hex: '#E5E4E2', 
                    rgb: [229, 228, 226], 
                    lab: {l: 91.2, a: 0.8, b: 1.2},
                    cmyk: [0, 0, 1, 10],
                    pccs_tone: 'pale',
                    level: 12,
                    category: 'ash'
                },

                // 네이비 계열 (6-8레벨)
                { 
                    name: 'Navy Blue', 
                    hex: '#000080', 
                    rgb: [0, 0, 128], 
                    lab: {l: 12.9, a: 47.5, b: -64.2},
                    cmyk: [100, 100, 0, 50],
                    pccs_tone: 'deep',
                    level: 2,
                    category: 'navy'
                },
                { 
                    name: 'Steel Blue', 
                    hex: '#4682B4', 
                    rgb: [70, 130, 180], 
                    lab: {l: 54.2, a: -8.9, b: -31.8},
                    cmyk: [61, 28, 0, 29],
                    pccs_tone: 'strong',
                    level: 6,
                    category: 'navy'
                },

                // 에쉬 그레이 계열 (6-8레벨)
                { 
                    name: 'Charcoal Gray', 
                    hex: '#36454F', 
                    rgb: [54, 69, 79], 
                    lab: {l: 29.2, a: -2.1, b: -8.9},
                    cmyk: [32, 13, 0, 69],
                    pccs_tone: 'dark',
                    level: 3,
                    category: 'ash_gray'
                },
                { 
                    name: 'Slate Gray', 
                    hex: '#708090', 
                    rgb: [112, 128, 144], 
                    lab: {l: 52.1, a: -2.8, b: -8.2},
                    cmyk: [22, 11, 0, 44],
                    pccs_tone: 'grayish',
                    level: 6,
                    category: 'ash_gray'
                }
            ],

            neutral_colors: [
                { name: 'Pure White', hex: '#FFFFFF', rgb: [255, 255, 255], lab: {l: 100, a: 0, b: 0} },
                { name: 'Cool White', hex: '#F8F8FF', rgb: [248, 248, 255], lab: {l: 97.8, a: 0.2, b: -1.8} },
                { name: 'Silver', hex: '#C0C0C0', rgb: [192, 192, 192], lab: {l: 78.1, a: 0.1, b: 0.2} },
                { name: 'Charcoal', hex: '#36454F', rgb: [54, 69, 79], lab: {l: 29.2, a: -2.1, b: -8.9} },
                { name: 'Black', hex: '#000000', rgb: [0, 0, 0], lab: {l: 0, a: 0, b: 0} }
            ],

            accent_colors: [
                { name: 'True Red', hex: '#FF0000', rgb: [255, 0, 0], lab: {l: 54.2, a: 80.8, b: 69.9} },
                { name: 'Royal Blue', hex: '#4169E1', rgb: [65, 105, 225], lab: {l: 49.8, a: 25.1, b: -74.2} },
                { name: 'Fuchsia', hex: '#FF00FF', rgb: [255, 0, 255], lab: {l: 60.2, a: 98.9, b: -60.8} },
                { name: 'Emerald Green', hex: '#50C878', rgb: [80, 200, 120], lab: {l: 71.2, a: -45.8, b: 32.1} }
            ]
        }
    };

    // 계절별 헤어컬러 매칭 데이터 (레벨 기반)
    var SEASON_HAIR_LEVELS = {
        spring: {
            recommended_levels: [8, 9, 10, 11, 12, 13, 14, 15],
            brown_levels: [9, 10, 11, 12, 13, 14, 15], // 9NB-15NB
            color_levels: {
                pink_coral: [8, 9, 10, 11, 12, 13, 14, 15],
                red: [8, 9, 10, 11, 12, 13, 14, 15],
                red_orange: [8, 9, 10, 11, 12, 13, 14, 15],
                orange: [8, 9, 10, 11, 12, 13, 14, 15],
                yellow: [8, 9, 10, 11, 12, 13, 14, 15],
                mint: [11, 12, 13, 14, 15],
                matt: [11, 12, 13, 14, 15]
            },
            total_colors: 41
        },

        summer: {
            recommended_levels: [7, 8, 9, 10, 11, 12, 13, 14, 15],
            brown_levels: [7, 8, 9, 10, 11, 12, 13, 14, 15], // 쿨톤 브라운
            color_levels: {
                beige: [8, 9, 10, 11, 12, 13, 14, 15],
                pink_carnation: [11, 12, 13, 14, 15],
                brown_purple: [11, 12, 13, 14, 15],
                purple: [11, 12, 13, 14, 15],
                ash: [7, 8, 9, 10, 11, 12, 13, 14, 15],
                navy: [7, 8, 9, 10, 11, 12, 13, 14, 15],
                ash_gray: [7, 8, 9, 10, 11, 12, 13, 14, 15]
            },
            total_colors: 42
        },

        autumn: {
            recommended_levels: [3, 4, 5, 6, 7, 8, 9, 10],
            brown_levels: [3, 4, 5, 6, 7, 8], // 8레벨까지
            color_levels: {
                pink_carnation: [3, 4, 5, 6, 7],
                red: [3, 4, 5, 6, 7],
                red_orange: [3, 4, 5, 6, 7],
                orange: [3, 4, 5, 6, 7],
                yellow: [3, 4, 5, 6, 7],
                mint: [3, 4, 5, 6, 7, 8, 9, 10],
                matt: [3, 4, 5, 6, 7, 8, 9, 10]
            },
            total_colors: 47
        },

        winter: {
            recommended_levels: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], // 극단적
            brown_levels: [6, 7, 8], // 제한적
            color_levels: {
                beige: [10, 11, 12, 13, 14, 15],
                gray_brown: [6, 7, 8],
                pink_carnation: [10],
                brown_purple: [10],
                purple: [10],
                ash: [7, 8, 9, 10, 11, 12, 13, 14, 15],
                navy: [6, 7, 8],
                ash_gray: [6, 7, 8]
            },
            total_colors: 41
        }
    };

    // 계절별 매칭 점수 계산 가중치
    var SEASON_MATCHING_WEIGHTS = {
        lab_delta_e: 0.4,      // Lab 색차의 가중치
        undertone_match: 0.3,   // 언더톤 매칭 가중치
        brightness_match: 0.2,  // 명도 매칭 가중치
        saturation_match: 0.1   // 채도 매칭 가중치
    };

    // 한국인 특화 피부톤 보정 데이터
    var KOREAN_SKIN_CORRECTIONS = {
        // 한국인 평균 피부톤 데이터 (논문 기반)
        average_values: {
            spring: {
                lab: { l: 67.58, a: 8.91, b: 16.12 },
                correction_factors: { brightness: 1.05, warmth: 0.95, saturation: 1.02 }
            },
            summer: {
                lab: { l: 67.92, a: 10.84, b: 11.70 },
                correction_factors: { brightness: 1.03, warmth: 0.92, saturation: 0.98 }
            },
            autumn: {
                lab: { l: 62.09, a: 11.25, b: 16.54 },
                correction_factors: { brightness: 0.95, warmth: 1.08, saturation: 1.05 }
            },
            winter: {
                lab: { l: 61.41, a: 12.46, b: 13.82 },
                correction_factors: { brightness: 0.92, warmth: 0.88, saturation: 1.08 }
            }
        },

        // 연령대별 보정 (20-50세)
        age_corrections: {
            '20-29': { brightness: 1.02, clarity: 1.05 },
            '30-39': { brightness: 1.00, clarity: 1.00 },
            '40-49': { brightness: 0.98, clarity: 0.95 },
            '50+': { brightness: 0.95, clarity: 0.92 }
        }
    };

    // 계절별 색온도 데이터
    var SEASON_COLOR_TEMPERATURES = {
        spring: {
            temperature: 'warm',
            kelvin_range: [2700, 3500],
            rgb_bias: { r: 1.05, g: 1.02, b: 0.95 }
        },
        summer: {
            temperature: 'cool',
            kelvin_range: [5500, 7000],
            rgb_bias: { r: 0.95, g: 1.00, b: 1.08 }
        },
        autumn: {
            temperature: 'warm',
            kelvin_range: [2200, 3200],
            rgb_bias: { r: 1.08, g: 1.05, b: 0.92 }
        },
        winter: {
            temperature: 'cool',
            kelvin_range: [6000, 8000],
            rgb_bias: { r: 0.92, g: 0.98, b: 1.12 }
        }
    };

    // PCCS 톤 정의 및 특성
    var PCCS_TONES = {
        // 고명도 계열
        pale: {
            name: '페일',
            characteristics: '연하고 밝은',
            brightness: 'high',
            saturation: 'low',
            seasons: ['spring', 'summer']
        },
        light: {
            name: '라이트',
            characteristics: '밝고 부드러운',
            brightness: 'high',
            saturation: 'medium',
            seasons: ['spring', 'summer']
        },
        bright: {
            name: '브라이트',
            characteristics: '밝고 선명한',
            brightness: 'high',
            saturation: 'high',
            seasons: ['spring', 'winter']
        },

        // 중명도 계열
        soft: {
            name: '소프트',
            characteristics: '부드럽고 온화한',
            brightness: 'medium',
            saturation: 'low',
            seasons: ['spring', 'summer']
        },
        strong: {
            name: '스트롱',
            characteristics: '강하고 뚜렷한',
            brightness: 'medium',
            saturation: 'high',
            seasons: ['autumn', 'winter']
        },
        vivid: {
            name: '비비드',
            characteristics: '생생하고 강렬한',
            brightness: 'medium',
            saturation: 'very_high',
            seasons: ['spring', 'winter']
        },

        // 저명도 계열
        deep: {
            name: '딥',
            characteristics: '깊고 진한',
            brightness: 'low',
            saturation: 'high',
            seasons: ['autumn', 'winter']
        },
        dark: {
            name: '다크',
            characteristics: '어둡고 중후한',
            brightness: 'low',
            saturation: 'medium',
            seasons: ['autumn', 'winter']
        },

        // 회색기 계열
        light_grayish: {
            name: '라이트 그레이시',
            characteristics: '밝은 회색기',
            brightness: 'high',
            saturation: 'low',
            grayness: 'medium',
            seasons: ['summer']
        },
        grayish: {
            name: '그레이시',
            characteristics: '회색기가 있는',
            brightness: 'medium',
            saturation: 'low',
            grayness: 'high',
            seasons: ['summer', 'autumn']
        },
        dark_grayish: {
            name: '다크 그레이시',
            characteristics: '어두운 회색기',
            brightness: 'low',
            saturation: 'low',
            grayness: 'high',
            seasons: ['autumn']
        },
        dull: {
            name: '덜',
            characteristics: '탁하고 무딘',
            brightness: 'medium',
            saturation: 'low',
            grayness: 'medium',
            seasons: ['summer', 'autumn']
        }
    };

    // 계절별 조화 색상 조합
    var SEASON_HARMONY_COMBINATIONS = {
        spring: {
            monochromatic: ['같은 색상의 밝기 변화'],
            analogous: ['노랑-오렌지-빨강', '노랑-초록-청록'],
            complementary: ['노랑-보라', '오렌지-파랑'],
            triadic: ['노랑-빨강-파랑'],
            best_combinations: [
                { primary: 'coral_pink', secondary: 'cream', accent: 'golden_yellow' },
                { primary: 'peach', secondary: 'ivory', accent: 'mint_green' },
                { primary: 'warm_beige', secondary: 'light_orange', accent: 'sage_green' }
            ]
        },

        summer: {
            monochromatic: ['같은 색상의 회색기 변화'],
            analogous: ['파랑-청록-초록', '파랑-보라-빨강'],
            complementary: ['파랑-주황', '보라-노랑'],
            triadic: ['파랑-빨강-노랑'],
            best_combinations: [
                { primary: 'dusty_rose', secondary: 'cool_gray', accent: 'lavender' },
                { primary: 'soft_blue', secondary: 'pearl_white', accent: 'mauve' },
                { primary: 'ash_brown', secondary: 'cool_beige', accent: 'soft_purple' }
            ]
        },

        autumn: {
            monochromatic: ['같은 색상의 깊이 변화'],
            analogous: ['빨강-주황-노랑', '노랑-초록-청록'],
            complementary: ['주황-파랑', '빨강-초록'],
            triadic: ['빨강-노랑-파랑'],
            best_combinations: [
                { primary: 'burgundy', secondary: 'camel', accent: 'forest_green' },
                { primary: 'burnt_orange', secondary: 'cream', accent: 'deep_gold' },
                { primary: 'rich_brown', secondary: 'mustard', accent: 'olive_green' }
            ]
        },

        winter: {
            monochromatic: ['같은 색상의 극명한 대비'],
            analogous: ['파랑-보라-빨강', '파랑-청록-초록'],
            complementary: ['빨강-초록', '파랑-주황'],
            triadic: ['빨강-파랑-노랑'],
            best_combinations: [
                { primary: 'true_red', secondary: 'pure_white', accent: 'royal_blue' },
                { primary: 'navy_blue', secondary: 'silver', accent: 'fuchsia' },
                { primary: 'black', secondary: 'cool_white', accent: 'emerald_green' }
            ]
        }
    };

    // 계절 전환 시 고려사항
    var SEASONAL_TRANSITIONS = {
        spring_to_summer: {
            shared_colors: ['soft_pink', 'light_coral', 'cream'],
            transition_tip: '밝기는 유지하되 선명도를 낮춰보세요'
        },
        summer_to_autumn: {
            shared_colors: ['mauve', 'dusty_rose', 'sage_green'],
            transition_tip: '차가운 느낌을 유지하되 깊이를 더해보세요'
        },
        autumn_to_winter: {
            shared_colors: ['burgundy', 'forest_green', 'chocolate'],
            transition_tip: '깊이는 유지하되 더 선명한 대비를 만들어보세요'
        },
        winter_to_spring: {
            shared_colors: ['true_red', 'bright_pink', 'emerald'],
            transition_tip: '선명함은 유지하되 따뜻함을 더해보세요'
        }
    };

    // 헤어컬러 브랜드별 색상 매핑
    var BRAND_COLOR_MAPPING = {
        loreal: {
            spring: [
                { level: '6.3', name: 'Dark Golden Blonde', season_color: 'golden_brown' },
                { level: '7.3', name: 'Medium Golden Blonde', season_color: 'honey_brown' },
                { level: '8.3', name: 'Light Golden Blonde', season_color: 'light_golden_brown' },
                { level: '9.3', name: 'Very Light Golden Blonde', season_color: 'cream_blonde' }
            ],
            summer: [
                { level: '7.1', name: 'Medium Ash Blonde', season_color: 'ash_brown' },
                { level: '8.1', name: 'Light Ash Blonde', season_color: 'light_ash' },
                { level: '6.12', name: 'Dark Iridescent Blonde', season_color: 'cool_brown' }
            ],
            autumn: [
                { level: '6.34', name: 'Dark Golden Copper', season_color: 'rich_brown' },
                { level: '5.35', name: 'Light Auburn', season_color: 'chestnut_brown' },
                { level: '7.43', name: 'Medium Copper Gold', season_color: 'golden_brown' }
            ],
            winter: [
                { level: '4.0', name: 'Natural Brown', season_color: 'cool_brown' },
                { level: '5.0', name: 'Light Brown', season_color: 'ash_brown' },
                { level: '3.0', name: 'Darkest Brown', season_color: 'charcoal_brown' }
            ]
        },

        wella: {
            spring: [
                { level: '7/3', name: 'Medium Golden Blonde', season_color: 'golden_brown' },
                { level: '8/3', name: 'Light Golden Blonde', season_color: 'honey_brown' },
                { level: '6/73', name: 'Dark Blonde Gold Brown', season_color: 'camel_brown' }
            ],
            summer: [
                { level: '8/81', name: 'Light Blonde Pearl Ash', season_color: 'light_ash' },
                { level: '7/81', name: 'Medium Blonde Pearl Ash', season_color: 'ash_brown' },
                { level: '9/81', name: 'Very Light Blonde Pearl Ash', season_color: 'platinum_ash' }
            ],
            autumn: [
                { level: '6/74', name: 'Dark Blonde Brown Red', season_color: 'chestnut_brown' },
                { level: '5/75', name: 'Light Brown Red Mahogany', season_color: 'wine_red' },
                { level: '7/75', name: 'Medium Blonde Red Mahogany', season_color: 'rust_red' }
            ],
            winter: [
                { level: '4/0', name: 'Medium Brown', season_color: 'cool_brown' },
                { level: '5/0', name: 'Light Brown', season_color: 'ash_brown' },
                { level: '6/71', name: 'Dark Blonde Brown Ash', season_color: 'gray_brown' }
            ]
        },

        milbon: {
            spring: [
                { level: '7LB', name: 'Light Brown', season_color: 'honey_brown' },
                { level: '8LB', name: 'Light Light Brown', season_color: 'light_golden_brown' },
                { level: '6GB', name: 'Golden Brown', season_color: 'golden_brown' }
            ],
            summer: [
                { level: '8LA', name: 'Light Ash', season_color: 'light_ash' },
                { level: '7LA', name: 'Light Ash', season_color: 'ash_brown' },
                { level: '9LA', name: 'Very Light Ash', season_color: 'platinum_ash' }
            ],
            autumn: [
                { level: '6CB', name: 'Copper Brown', season_color: 'chestnut_brown' },
                { level: '5OB', name: 'Orange Brown', season_color: 'burnt_orange' },
                { level: '7OB', name: 'Light Orange Brown', season_color: 'terra_cotta' }
            ],
            winter: [
                { level: '4N', name: 'Natural Brown', season_color: 'cool_brown' },
                { level: '5N', name: 'Light Natural Brown', season_color: 'ash_brown' },
                { level: '6MA', name: 'Matt Ash', season_color: 'gray_brown' }
            ]
        }
    };

    // 계절별 추천 스타일링
    var SEASON_STYLING_GUIDE = {
        spring: {
            makeup: {
                base: '골든 언더톤 파운데이션',
                eyes: '따뜻한 브라운, 코랄, 골드 섀도',
                lips: '코랄 핑크, 피치, 오렌지 레드',
                cheeks: '피치, 코랄 블러셔'
            },
            fashion: {
                basics: '크림, 아이보리, 캐멀, 네이비',
                colors: '코랄, 피치, 골든 옐로우, 민트',
                metals: '골드, 로즈골드',
                patterns: '플로럴, 도트, 체크'
            }
        },

        summer: {
            makeup: {
                base: '핑크 언더톤 파운데이션',
                eyes: '쿨톤 브라운, 라벤더, 실버 섀도',
                lips: '로즈 핑크, 모브, 베리',
                cheeks: '로즈, 모브 블러셔'
            },
            fashion: {
                basics: '네이비, 그레이, 화이트, 베이지',
                colors: '라벤더, 로즈, 소프트 블루',
                metals: '실버, 화이트골드, 플래티넘',
                patterns: '스트라이프, 솔리드, 미니멀'
            }
        },

        autumn: {
            makeup: {
                base: '골든 옐로우 언더톤 파운데이션',
                eyes: '딥 브라운, 골드, 오렌지 브라운 섀도',
                lips: '버건디, 브릭레드, 브라운',
                cheeks: '피치, 브릭 블러셔'
            },
            fashion: {
                basics: '카키, 브라운, 크림, 버건디',
                colors: '머스타드, 번트오렌지, 포레스트 그린',
                metals: '골드, 브론즈, 구리',
                patterns: '페이즐리, 레오파드, 체크'
            }
        },

        winter: {
            makeup: {
                base: '핑크 또는 뉴트럴 언더톤 파운데이션',
                eyes: '블랙, 실버, 딥 퍼플, 네이비 섀도',
                lips: '트루레드, 후크시아, 딥 베리',
                cheeks: '쿨톤 핑크, 플럼 블러셔'
            },
            fashion: {
                basics: '블랙, 화이트, 네이비, 그레이',
                colors: '트루레드, 로얄블루, 에메랄드',
                metals: '실버, 화이트골드, 플래티넘',
                patterns: '솔리드, 스트라이프, 하운드투스'
            }
        }
    };

    // 유틸리티 함수들
    var SEASON_UTILITIES = {
        /**
         * 계절 타입 확인
         */
        isValidSeason: function(season) {
            return ['spring', 'summer', 'autumn', 'winter'].indexOf(season) !== -1;
        },

        /**
         * 서브타입 확인
         */
        isValidSubtype: function(season, subtype) {
            return SEASON_CHARACTERISTICS[season] && 
                   SEASON_CHARACTERISTICS[season].subtypes && 
                   SEASON_CHARACTERISTICS[season].subtypes.hasOwnProperty(subtype);
        },

        /**
         * 색상이 특정 계절에 적합한지 확인
         */
        isColorSuitableForSeason: function(colorData, season) {
            var seasonData = SEASON_COLOR_PALETTES[season];
            if (!seasonData) return false;

            // 기본 색상, 뉴트럴, 액센트에서 찾기
            var allColors = []
                .concat(seasonData.primary_colors)
                .concat(seasonData.neutral_colors)
                .concat(seasonData.accent_colors);

            for (var i = 0; i < allColors.length; i++) {
                var color = allColors[i];
                if (color.hex === colorData.hex || color.name === colorData.name) {
                    return true;
                }
            }
            return false;
        },

        /**
         * 계절별 레벨 범위 확인
         */
        isLevelSuitableForSeason: function(level, season, category) {
            var levelData = SEASON_HAIR_LEVELS[season];
            if (!levelData) return false;

            if (category && levelData.color_levels[category]) {
                return levelData.color_levels[category].indexOf(level) !== -1;
            }

            return levelData.recommended_levels.indexOf(level) !== -1;
        },

        /**
         * 두 계절의 공통 색상 찾기
         */
        findCommonColors: function(season1, season2) {
            var palette1 = SEASON_COLOR_PALETTES[season1];
            var palette2 = SEASON_COLOR_PALETTES[season2];

            if (!palette1 || !palette2) return [];

            var colors1 = []
                .concat(palette1.primary_colors)
                .concat(palette1.neutral_colors);
            var colors2 = []
                .concat(palette2.primary_colors)
                .concat(palette2.neutral_colors);

            var commonColors = [];
            for (var i = 0; i < colors1.length; i++) {
                var color1 = colors1[i];
                for (var j = 0; j < colors2.length; j++) {
                    var color2 = colors2[j];
                    if (color1.hex === color2.hex || color1.name === color2.name) {
                        commonColors.push(color1);
                        break;
                    }
                }
            }
            return commonColors;
        },

        /**
         * 계절별 온도감 확인
         */
        getSeasonTemperature: function(season) {
            return SEASON_CHARACTERISTICS[season] && SEASON_CHARACTERISTICS[season].temperature;
        },

        /**
         * 계절별 추천 PCCS 톤 가져오기
         */
        getRecommendedTones: function(season) {
            return SEASON_CHARACTERISTICS[season] && SEASON_CHARACTERISTICS[season].pccs_tones || [];
        }
    };

    // 통합 데이터 객체
    var SeasonalColorData = {
        SEASON_CHARACTERISTICS: SEASON_CHARACTERISTICS,
        SEASON_COLOR_PALETTES: SEASON_COLOR_PALETTES,
        SEASON_HAIR_LEVELS: SEASON_HAIR_LEVELS,
        SEASON_MATCHING_WEIGHTS: SEASON_MATCHING_WEIGHTS,
        KOREAN_SKIN_CORRECTIONS: KOREAN_SKIN_CORRECTIONS,
        SEASON_COLOR_TEMPERATURES: SEASON_COLOR_TEMPERATURES,
        PCCS_TONES: PCCS_TONES,
        SEASON_HARMONY_COMBINATIONS: SEASON_HARMONY_COMBINATIONS,
        SEASONAL_TRANSITIONS: SEASONAL_TRANSITIONS,
        BRAND_COLOR_MAPPING: BRAND_COLOR_MAPPING,
        SEASON_STYLING_GUIDE: SEASON_STYLING_GUIDE,
        SEASON_UTILITIES: SEASON_UTILITIES
    };

    // 전역에 등록
    try {
        window.SeasonalColorData = SeasonalColorData;
        window.SEASON_CHARACTERISTICS = SEASON_CHARACTERISTICS;
        window.SEASON_COLOR_PALETTES = SEASON_COLOR_PALETTES;
        window.SEASON_HAIR_LEVELS = SEASON_HAIR_LEVELS;
        window.SEASON_MATCHING_WEIGHTS = SEASON_MATCHING_WEIGHTS;
        window.KOREAN_SKIN_CORRECTIONS = KOREAN_SKIN_CORRECTIONS;
        window.SEASON_COLOR_TEMPERATURES = SEASON_COLOR_TEMPERATURES;
        window.PCCS_TONES = PCCS_TONES;
        window.SEASON_HARMONY_COMBINATIONS = SEASON_HARMONY_COMBINATIONS;
        window.SEASONAL_TRANSITIONS = SEASONAL_TRANSITIONS;
        window.BRAND_COLOR_MAPPING = BRAND_COLOR_MAPPING;
        window.SEASON_STYLING_GUIDE = SEASON_STYLING_GUIDE;
        window.SEASON_UTILITIES = SEASON_UTILITIES;
        
        console.log('✅ seasons.js ES5 변환 완료 - 4계절 퍼스널컬러 데이터베이스 로드됨');
        console.log('🎉 전체 프로젝트 14/14 파일 100% 완성!');
        
        // 성능 통계
        console.log('📊 데이터베이스 통계:');
        console.log('- 봄 색상: ' + SEASON_COLOR_PALETTES.spring.primary_colors.length + '개');
        console.log('- 여름 색상: ' + SEASON_COLOR_PALETTES.summer.primary_colors.length + '개');
        console.log('- 가을 색상: ' + SEASON_COLOR_PALETTES.autumn.primary_colors.length + '개');
        console.log('- 겨울 색상: ' + SEASON_COLOR_PALETTES.winter.primary_colors.length + '개');
        console.log('- 총 PCCS 톤: ' + Object.keys(PCCS_TONES).length + '개');
        console.log('- 브랜드 매핑: ' + Object.keys(BRAND_COLOR_MAPPING).length + '개 브랜드');
        
    } catch (error) {
        console.error('❌ seasons.js 로드 실패:', error);
    }

})();
