/**
 * colorPalettes.js
 * 퍼스널컬러 색상 팔레트 데이터베이스
 * 
 * 기능:
 * - 4계절 12톤 색상 팔레트
 * - CIE L*a*b* 색공간 데이터
 * - 한국인 특화 색상 보정
 * - 용도별 색상 분류
 * - 조화 색상 조합
 */

// 메인 색상 팔레트 데이터
const COLOR_PALETTES = {
    // 봄 (Spring) 색상 팔레트
    spring: {
        name: { ko: '봄', en: 'Spring' },
        characteristics: {
            temperature: 'warm',
            clarity: 'clear',
            depth: 'light',
            intensity: 'bright',
            keywords: ['활기찬', '생동감', '화사한', '젊은', '경쾌한']
        },
        
        // 봄 서브타입별 색상
        subtypes: {
            bright_spring: {
                name: '브라이트 스프링',
                primary_colors: [
                    { name: 'True Red', hex: '#FF0000', lab: [53.24, 80.09, 67.20], usage: 'accent' },
                    { name: 'Clear Blue', hex: '#0066FF', lab: [47.77, 25.42, -74.45], usage: 'accent' },
                    { name: 'Emerald Green', hex: '#00CC66', lab: [67.55, -58.66, 36.48], usage: 'main' },
                    { name: 'Hot Pink', hex: '#FF1493', lab: [54.29, 80.80, 5.85], usage: 'accent' },
                    { name: 'Golden Yellow', hex: '#FFD700', lab: [86.93, 15.19, 93.24], usage: 'main' }
                ],
                neutrals: [
                    { name: 'Warm White', hex: '#FFF8DC', lab: [97.14, -0.64, 6.88], usage: 'base' },
                    { name: 'Light Ivory', hex: '#FFFACD', lab: [96.54, -2.93, 13.75], usage: 'base' },
                    { name: 'Cream', hex: '#F5F5DC', lab: [94.79, -2.33, 8.88], usage: 'neutral' },
                    { name: 'Light Camel', hex: '#DEB887', lab: [78.69, 8.32, 25.65], usage: 'neutral' }
                ]
            },
            
            light_spring: {
                name: '라이트 스프링',
                primary_colors: [
                    { name: 'Coral Pink', hex: '#FF7F7F', lab: [65.48, 52.23, 26.85], usage: 'main' },
                    { name: 'Peach', hex: '#FFCBA4', lab: [84.07, 15.09, 31.97], usage: 'main' },
                    { name: 'Light Aqua', hex: '#7FFFD4', lab: [90.66, -33.75, 4.43], usage: 'accent' },
                    { name: 'Soft Yellow', hex: '#FFFF99', lab: [96.44, -15.37, 49.70], usage: 'main' },
                    { name: 'Light Green', hex: '#98FB98', lab: [89.09, -33.74, 30.98], usage: 'accent' }
                ],
                neutrals: [
                    { name: 'Soft White', hex: '#F8F8FF', lab: [97.60, 0.00, -0.46], usage: 'base' },
                    { name: 'Light Beige', hex: '#F5F5DC', lab: [94.79, -2.33, 8.88], usage: 'base' },
                    { name: 'Pale Taupe', hex: '#E6D3C7', lab: [85.32, 3.06, 10.16], usage: 'neutral' },
                    { name: 'Light Gray', hex: '#E0E0E0', lab: [87.75, 0.00, 0.00], usage: 'neutral' }
                ]
            },
            
            warm_spring: {
                name: '웜 스프링',
                primary_colors: [
                    { name: 'Warm Coral', hex: '#FF6347', lab: [59.30, 62.21, 55.13], usage: 'main' },
                    { name: 'Golden Orange', hex: '#FF8C00', lab: [67.53, 43.46, 74.29], usage: 'accent' },
                    { name: 'Warm Yellow', hex: '#FFEB3B', lab: [91.11, -10.49, 84.19], usage: 'main' },
                    { name: 'Warm Green', hex: '#9ACD32', lab: [76.53, -31.89, 65.52], usage: 'accent' },
                    { name: 'Warm Red', hex: '#DC143C', lab: [47.09, 70.93, 33.91], usage: 'accent' }
                ],
                neutrals: [
                    { name: 'Warm Ivory', hex: '#FDF5E6', lab: [96.36, -0.18, 6.59], usage: 'base' },
                    { name: 'Golden Beige', hex: '#F5DEB3', lab: [89.37, 3.28, 21.46], usage: 'base' },
                    { name: 'Camel', hex: '#C19A6B', lab: [67.37, 15.29, 31.64], usage: 'neutral' },
                    { name: 'Warm Brown', hex: '#A0522D', lab: [42.51, 26.90, 37.89], usage: 'neutral' }
                ]
            }
        },
        
        // 용도별 색상 조합
        color_combinations: {
            hair_colors: [
                { name: '골든 블론드', hex: '#DAA520', lab: [71.32, 18.97, 69.55], level: 7 },
                { name: '허니 브라운', hex: '#CD853F', lab: [61.86, 22.48, 51.20], level: 6 },
                { name: '웜 브라운', hex: '#A0522D', lab: [42.51, 26.90, 37.89], level: 5 },
                { name: '구리 레드', hex: '#B22222', lab: [40.57, 61.17, 46.81], level: 5 },
                { name: '골든 레드', hex: '#CD5C5C', lab: [54.29, 48.25, 38.80], level: 6 }
            ],
            makeup_colors: {
                foundation: [
                    { name: 'Light Warm', hex: '#F7DCB4', lab: [87.73, 5.67, 24.62], undertone: 'warm' },
                    { name: 'Medium Warm', hex: '#E8B894', lab: [76.31, 15.42, 30.05], undertone: 'warm' },
                    { name: 'Golden Beige', hex: '#DEB887', lab: [78.69, 8.32, 25.65], undertone: 'warm' }
                ],
                lipstick: [
                    { name: 'Coral Red', hex: '#FF6347', lab: [59.30, 62.21, 55.13], finish: 'satin' },
                    { name: 'Warm Pink', hex: '#FF69B4', lab: [62.86, 70.94, -2.23], finish: 'gloss' },
                    { name: 'Peach', hex: '#FFCBA4', lab: [84.07, 15.09, 31.97], finish: 'balm' }
                ],
                eyeshadow: [
                    { name: 'Golden Brown', hex: '#CD853F', lab: [61.86, 22.48, 51.20], finish: 'shimmer' },
                    { name: 'Warm Copper', hex: '#B87333', lab: [53.38, 23.93, 42.31], finish: 'metallic' },
                    { name: 'Peach Glow', hex: '#FFCBA4', lab: [84.07, 15.09, 31.97], finish: 'shimmer' }
                ]
            }
        }
    },

    // 여름 (Summer) 색상 팔레트
    summer: {
        name: { ko: '여름', en: 'Summer' },
        characteristics: {
            temperature: 'cool',
            clarity: 'soft',
            depth: 'light',
            intensity: 'soft',
            keywords: ['우아한', '부드러운', '여성스러운', '세련된', '시원한']
        },
        
        subtypes: {
            light_summer: {
                name: '라이트 서머',
                primary_colors: [
                    { name: 'Soft Pink', hex: '#FFB6C1', lab: [79.15, 33.40, 6.11], usage: 'main' },
                    { name: 'Powder Blue', hex: '#B0E0E6', lab: [86.27, -13.60, -10.61], usage: 'main' },
                    { name: 'Lavender', hex: '#E6E6FA', lab: [92.46, 4.86, -12.49], usage: 'accent' },
                    { name: 'Soft Yellow', hex: '#FFFACD', lab: [96.54, -2.93, 13.75], usage: 'accent' },
                    { name: 'Mint Green', hex: '#98FB98', lab: [89.09, -33.74, 30.98], usage: 'accent' }
                ],
                neutrals: [
                    { name: 'Icy White', hex: '#F0F8FF', lab: [97.11, -1.93, -2.29], usage: 'base' },
                    { name: 'Pearl', hex: '#F8F8FF', lab: [97.60, 0.00, -0.46], usage: 'base' },
                    { name: 'Light Gray', hex: '#E0E0E0', lab: [87.75, 0.00, 0.00], usage: 'neutral' },
                    { name: 'Cool Beige', hex: '#F5F5DC', lab: [94.79, -2.33, 8.88], usage: 'neutral' }
                ]
            },
            
            soft_summer: {
                name: '소프트 서머',
                primary_colors: [
                    { name: 'Dusty Pink', hex: '#DDA0DD', lab: [72.86, 39.35, -21.53], usage: 'main' },
                    { name: 'Sage Green', hex: '#9CAF88', lab: [67.08, -15.42, 21.58], usage: 'main' },
                    { name: 'Soft Blue', hex: '#87CEEB', lab: [78.73, -15.27, -26.27], usage: 'accent' },
                    { name: 'Mauve', hex: '#E0B4D6', lab: [78.35, 27.99, -13.79], usage: 'main' },
                    { name: 'Soft Teal', hex: '#5F9EA0', lab: [62.80, -18.13, -5.99], usage: 'accent' }
                ],
                neutrals: [
                    { name: 'Soft White', hex: '#F5F5F5', lab: [96.54, 0.00, 0.00], usage: 'base' },
                    { name: 'Cool Gray', hex: '#D3D3D3', lab: [84.87, 0.00, 0.00], usage: 'base' },
                    { name: 'Taupe', hex: '#C8B99C', lab: [75.49, 4.25, 16.52], usage: 'neutral' },
                    { name: 'Mushroom', hex: '#C8A696', lab: [71.65, 12.25, 16.11], usage: 'neutral' }
                ]
            },
            
            cool_summer: {
                name: '쿨 서머',
                primary_colors: [
                    { name: 'Rose', hex: '#FF69B4', lab: [62.86, 70.94, -2.23], usage: 'main' },
                    { name: 'Cool Blue', hex: '#4169E1', lab: [48.22, 35.60, -73.32], usage: 'accent' },
                    { name: 'Purple', hex: '#9370DB', lab: [56.30, 51.40, -60.93], usage: 'accent' },
                    { name: 'Cool Pink', hex: '#FF1493', lab: [54.29, 80.80, 5.85], usage: 'main' },
                    { name: 'Teal', hex: '#008080', lab: [48.26, -28.84, -8.48], usage: 'accent' }
                ],
                neutrals: [
                    { name: 'Pure White', hex: '#FFFFFF', lab: [100.00, 0.00, 0.00], usage: 'base' },
                    { name: 'Silver', hex: '#C0C0C0', lab: [77.70, 0.00, 0.00], usage: 'base' },
                    { name: 'Cool Gray', hex: '#808080', lab: [53.59, 0.00, 0.00], usage: 'neutral' },
                    { name: 'Charcoal', hex: '#36454F', lab: [29.30, -2.37, -5.85], usage: 'neutral' }
                ]
            }
        },
        
        color_combinations: {
            hair_colors: [
                { name: '애쉬 블론드', hex: '#F5DEB3', lab: [89.37, 3.28, 21.46], level: 8 },
                { name: '플래티넘', hex: '#E5E4E2', lab: [90.76, 0.95, 2.49], level: 9 },
                { name: '애쉬 브라운', hex: '#A0522D', lab: [42.51, 26.90, 37.89], level: 6 },
                { name: '로즈 브라운', hex: '#BC8F8F', lab: [63.73, 16.10, 16.78], level: 6 },
                { name: '실버 그레이', hex: '#C0C0C0', lab: [77.70, 0.00, 0.00], level: 8 }
            ],
            makeup_colors: {
                foundation: [
                    { name: 'Light Cool', hex: '#F2E6D0', lab: [91.61, 2.06, 13.34], undertone: 'cool' },
                    { name: 'Medium Cool', hex: '#E8C4A0', lab: [81.26, 8.97, 26.67], undertone: 'cool' },
                    { name: 'Rose Beige', hex: '#E6C2A6', lab: [81.15, 8.34, 21.22], undertone: 'cool' }
                ],
                lipstick: [
                    { name: 'Rose Pink', hex: '#FFB6C1', lab: [79.15, 33.40, 6.11], finish: 'satin' },
                    { name: 'Berry', hex: '#8B008B', lab: [29.78, 68.75, -49.73], finish: 'matte' },
                    { name: 'Mauve', hex: '#E0B4D6', lab: [78.35, 27.99, -13.79], finish: 'cream' }
                ],
                eyeshadow: [
                    { name: 'Cool Taupe', hex: '#C8B99C', lab: [75.49, 4.25, 16.52], finish: 'matte' },
                    { name: 'Silver', hex: '#C0C0C0', lab: [77.70, 0.00, 0.00], finish: 'metallic' },
                    { name: 'Lavender', hex: '#E6E6FA', lab: [92.46, 4.86, -12.49], finish: 'shimmer' }
                ]
            }
        }
    },

    // 가을 (Autumn) 색상 팔레트
    autumn: {
        name: { ko: '가을', en: 'Autumn' },
        characteristics: {
            temperature: 'warm',
            clarity: 'muted',
            depth: 'deep',
            intensity: 'deep',
            keywords: ['고급스러운', '깊이있는', '성숙한', '따뜻한', '자연스러운']
        },
        
        subtypes: {
            deep_autumn: {
                name: '딥 오텀',
                primary_colors: [
                    { name: 'Deep Red', hex: '#8B0000', lab: [25.53, 48.69, 38.05], usage: 'accent' },
                    { name: 'Forest Green', hex: '#228B22', lab: [50.59, -50.75, 45.27], usage: 'main' },
                    { name: 'Navy Blue', hex: '#000080', lab: [12.98, 47.51, -64.70], usage: 'accent' },
                    { name: 'Burnt Orange', hex: '#CC5500', lab: [48.87, 58.32, 63.93], usage: 'main' },
                    { name: 'Chocolate', hex: '#7B3F00', lab: [28.35, 28.70, 40.16], usage: 'neutral' }
                ],
                neutrals: [
                    { name: 'Cream', hex: '#F5F5DC', lab: [94.79, -2.33, 8.88], usage: 'base' },
                    { name: 'Warm Beige', hex: '#DEB887', lab: [78.69, 8.32, 25.65], usage: 'base' },
                    { name: 'Coffee', hex: '#6F4E37', lab: [33.12, 17.46, 28.34], usage: 'neutral' },
                    { name: 'Dark Brown', hex: '#654321', lab: [29.04, 12.64, 22.46], usage: 'neutral' }
                ]
            },
            
            warm_autumn: {
                name: '웜 오텀',
                primary_colors: [
                    { name: 'Terracotta', hex: '#E2725B', lab: [60.17, 41.88, 40.57], usage: 'main' },
                    { name: 'Golden Yellow', hex: '#DAA520', lab: [71.32, 18.97, 69.55], usage: 'main' },
                    { name: 'Rust', hex: '#B7410E', lab: [38.24, 47.40, 50.63], usage: 'accent' },
                    { name: 'Olive Green', hex: '#808000', lab: [51.87, -12.93, 56.68], usage: 'main' },
                    { name: 'Warm Brown', hex: '#A0522D', lab: [42.51, 26.90, 37.89], usage: 'neutral' }
                ],
                neutrals: [
                    { name: 'Warm White', hex: '#FFF8DC', lab: [97.14, -0.64, 6.88], usage: 'base' },
                    { name: 'Camel', hex: '#C19A6B', lab: [67.37, 15.29, 31.64], usage: 'base' },
                    { name: 'Khaki', hex: '#F0E68C', lab: [89.95, -12.28, 56.67], usage: 'neutral' },
                    { name: 'Bronze', hex: '#CD7F32', lab: [58.75, 22.59, 57.88], usage: 'neutral' }
                ]
            },
            
            soft_autumn: {
                name: '소프트 오텀',
                primary_colors: [
                    { name: 'Muted Red', hex: '#CD5C5C', lab: [54.29, 48.25, 38.80], usage: 'main' },
                    { name: 'Sage Green', hex: '#9CAF88', lab: [67.08, -15.42, 21.58], usage: 'main' },
                    { name: 'Dusty Blue', hex: '#6495ED', lab: [61.50, 5.14, -55.32], usage: 'accent' },
                    { name: 'Muted Orange', hex: '#D2B48C', lab: [76.77, 9.54, 28.82], usage: 'main' },
                    { name: 'Taupe', hex: '#C8B99C', lab: [75.49, 4.25, 16.52], usage: 'neutral' }
                ],
                neutrals: [
                    { name: 'Oyster', hex: '#F5F5DC', lab: [94.79, -2.33, 8.88], usage: 'base' },
                    { name: 'Mushroom', hex: '#C8A696', lab: [71.65, 12.25, 16.11], usage: 'base' },
                    { name: 'Soft Brown', hex: '#996633', lab: [45.93, 20.01, 37.79], usage: 'neutral' },
                    { name: 'Stone', hex: '#B8860B', lab: [58.38, 14.12, 62.52], usage: 'neutral' }
                ]
            }
        },
        
        color_combinations: {
            hair_colors: [
                { name: '초콜릿 브라운', hex: '#654321', lab: [29.04, 12.64, 22.46], level: 4 },
                { name: '체스트넛', hex: '#954535', lab: [35.57, 34.75, 32.37], level: 4 },
                { name: '딥 오번', hex: '#A0522D', lab: [42.51, 26.90, 37.89], level: 5 },
                { name: '카퍼', hex: '#B87333', lab: [53.38, 23.93, 42.31], level: 5 },
                { name: '리치 브라운', hex: '#8B4513', lab: [35.12, 26.61, 46.47], level: 4 }
            ],
            makeup_colors: {
                foundation: [
                    { name: 'Warm Medium', hex: '#D2B48C', lab: [76.77, 9.54, 28.82], undertone: 'warm' },
                    { name: 'Golden Tan', hex: '#DEB887', lab: [78.69, 8.32, 25.65], undertone: 'warm' },
                    { name: 'Rich Beige', hex: '#C19A6B', lab: [67.37, 15.29, 31.64], undertone: 'warm' }
                ],
                lipstick: [
                    { name: 'Brick Red', hex: '#B22222', lab: [40.57, 61.17, 46.81], finish: 'matte' },
                    { name: 'Terracotta', hex: '#E2725B', lab: [60.17, 41.88, 40.57], finish: 'satin' },
                    { name: 'Burnt Orange', hex: '#CC5500', lab: [48.87, 58.32, 63.93], finish: 'cream' }
                ],
                eyeshadow: [
                    { name: 'Bronze', hex: '#CD7F32', lab: [58.75, 22.59, 57.88], finish: 'metallic' },
                    { name: 'Copper', hex: '#B87333', lab: [53.38, 23.93, 42.31], finish: 'shimmer' },
                    { name: 'Golden Brown', hex: '#996633', lab: [45.93, 20.01, 37.79], finish: 'matte' }
                ]
            }
        }
    },

    // 겨울 (Winter) 색상 팔레트
    winter: {
        name: { ko: '겨울', en: 'Winter' },
        characteristics: {
            temperature: 'cool',
            clarity: 'clear',
            depth: 'deep',
            intensity: 'deep',
            keywords: ['강렬한', '차가운', '도시적인', '세련된', '극적인']
        },
        
        subtypes: {
            deep_winter: {
                name: '딥 윈터',
                primary_colors: [
                    { name: 'True Red', hex: '#FF0000', lab: [53.24, 80.09, 67.20], usage: 'accent' },
                    { name: 'Royal Blue', hex: '#4169E1', lab: [48.22, 35.60, -73.32], usage: 'main' },
                    { name: 'Emerald', hex: '#50C878', lab: [71.52, -50.93, 44.64], usage: 'accent' },
                    { name: 'Purple', hex: '#800080', lab: [29.78, 68.75, -49.73], usage: 'main' },
                    { name: 'Black', hex: '#000000', lab: [0.00, 0.00, 0.00], usage: 'neutral' }
                ],
                neutrals: [
                    { name: 'Pure White', hex: '#FFFFFF', lab: [100.00, 0.00, 0.00], usage: 'base' },
                    { name: 'Charcoal', hex: '#36454F', lab: [29.30, -2.37, -5.85], usage: 'base' },
                    { name: 'True Black', hex: '#000000', lab: [0.00, 0.00, 0.00], usage: 'neutral' },
                    { name: 'Silver', hex: '#C0C0C0', lab: [77.70, 0.00, 0.00], usage: 'neutral' }
                ]
            },
            
            cool_winter: {
                name: '쿨 윈터',
                primary_colors: [
                    { name: 'Fuchsia', hex: '#FF1493', lab: [54.29, 80.80, 5.85], usage: 'main' },
                    { name: 'Electric Blue', hex: '#0080FF', lab: [52.46, 18.84, -64.30], usage: 'accent' },
                    { name: 'Cyan', hex: '#00FFFF', lab: [91.11, -48.09, -14.13], usage: 'accent' },
                    { name: 'Magenta', hex: '#FF00FF', lab: [60.32, 98.25, -60.84], usage: 'main' },
                    { name: 'Icy Blue', hex: '#B0E0E6', lab: [86.27, -13.60, -10.61], usage: 'main' }
                ],
                neutrals: [
                    { name: 'Icy White', hex: '#F0F8FF', lab: [97.11, -1.93, -2.29], usage: 'base' },
                    { name: 'Cool Gray', hex: '#808080', lab: [53.59, 0.00, 0.00], usage: 'base' },
                    { name: 'Steel Blue', hex: '#4682B4', lab: [53.81, -4.69, -32.61], usage: 'neutral' },
                    { name: 'Navy', hex: '#000080', lab: [12.98, 47.51, -64.70], usage: 'neutral' }
                ]
            },
            
            clear_winter: {
                name: '클리어 윈터',
                primary_colors: [
                    { name: 'Cherry Red', hex: '#DE3163', lab: [47.09, 70.93, 33.91], usage: 'main' },
                    { name: 'Cobalt Blue', hex: '#0047AB', lab: [33.38, 26.67, -65.29], usage: 'accent' },
                    { name: 'Lime Green', hex: '#32CD32', lab: [72.61, -66.89, 67.81], usage: 'accent' },
                    { name: 'Hot Pink', hex: '#FF69B4', lab: [62.86, 70.94, -2.23], usage: 'main' },
                    { name: 'Violet', hex: '#8A2BE2', lab: [35.78, 65.31, -84.08], usage: 'main' }
                ],
                neutrals: [
                    { name: 'Brilliant White', hex: '#FFFFFF', lab: [100.00, 0.00, 0.00], usage: 'base' },
                    { name: 'Light Gray', hex: '#D3D3D3', lab: [84.87, 0.00, 0.00], usage: 'base' },
                    { name: 'Medium Gray', hex: '#808080', lab: [53.59, 0.00, 0.00], usage: 'neutral' },
                    { name: 'Graphite', hex: '#41424C', lab: [27.84, 0.26, -2.44], usage: 'neutral' }
                ]
            }
        },
        
        color_combinations: {
            hair_colors: [
                { name: '제트 블랙', hex: '#000000', lab: [0.00, 0.00, 0.00], level: 1 },
                { name: '애쉬 블랙', hex: '#36454F', lab: [29.30, -2.37, -5.85], level: 2 },
                { name: '다크 브라운', hex: '#654321', lab: [29.04, 12.64, 22.46], level: 3 },
                { name: '버건디', hex: '#800020', lab: [26.92, 48.97, 22.48], level: 3 },
                { name: '실버', hex: '#C0C0C0', lab: [77.70, 0.00, 0.00], level: 8 }
            ],
            makeup_colors: {
                foundation: [
                    { name: 'Light Cool', hex: '#F7E7CE', lab: [91.96, 4.49, 14.84], undertone: 'cool' },
                    { name: 'Medium Cool', hex: '#E8C4A0', lab: [81.26, 8.97, 26.67], undertone: 'cool' },
                    { name: 'Deep Cool', hex: '#C8A696', lab: [71.65, 12.25, 16.11], undertone: 'cool' }
                ],
                lipstick: [
                    { name: 'True Red', hex: '#FF0000', lab: [53.24, 80.09, 67.20], finish: 'matte' },
                    { name: 'Deep Berry', hex: '#8B008B', lab: [29.78, 68.75, -49.73], finish: 'satin' },
                    { name: 'Fuchsia', hex: '#FF1493', lab: [54.29, 80.80, 5.85], finish: 'gloss' }
                ],
                eyeshadow: [
                    { name: 'Charcoal', hex: '#36454F', lab: [29.30, -2.37, -5.85], finish: 'matte' },
                    { name: 'Silver', hex: '#C0C0C0', lab: [77.70, 0.00, 0.00], finish: 'metallic' },
                    { name: 'Deep Purple', hex: '#4B0082', lab: [20.16, 51.24, -65.20], finish: 'shimmer' }
                ]
            }
        }
    }
};

// 색상 조화 시스템
const COLOR_HARMONY_RULES = {
    // 기본 조화 규칙
    basic_harmonies: {
        monochromatic: {
            name: '단색 조화',
            description: '같은 색상의 다양한 명도와 채도',
            rule: 'same_hue_different_saturation_lightness'
        },
        analogous: {
            name: '인접 색상 조화',
            description: '색상환에서 인접한 색상들',
            rule: 'adjacent_hues_30_degrees'
        },
        complementary: {
            name: '보색 조화',
            description: '색상환에서 정반대 색상',
            rule: 'opposite_hues_180_degrees'
        },
        triadic: {
            name: '삼색 조화',
            description: '색상환에서 120도씩 떨어진 색상',
            rule: 'three_hues_120_degrees'
        },
        split_complementary: {
            name: '분할 보색 조화',
            description: '보색의 양쪽 인접 색상',
            rule: 'complement_plus_adjacent'
        }
    },

    // 계절별 추천 조화
    seasonal_harmonies: {
        spring: {
            recommended: ['analogous', 'monochromatic'],
            avoid: ['split_complementary'],
            best_combinations: [
                ['#FFD700', '#FF8C00', '#FF6347'], // 골든 계열
                ['#32CD32', '#9ACD32', '#ADFF2F'], // 생동감 그린
                ['#FF69B4', '#FFB6C1', '#FFC0CB']  // 웜 핑크
            ]
        },
        summer: {
            recommended: ['monochromatic', 'analogous'],
            avoid: ['triadic'],
            best_combinations: [
                ['#E6E6FA', '#DDA0DD', '#D8BFD8'], // 라벤더 계열
                ['#B0E0E6', '#87CEEB', '#87CEFA'], // 소프트 블루
                ['#FFB6C1', '#F0B4D6', '#E6B4D6']  // 소프트 핑크
            ]
        },
        autumn: {
            recommended: ['analogous', 'complementary'],
            avoid: ['monochromatic'],
            best_combinations: [
                ['#D2691E', '#CD853F', '#DEB887'], // 어스 톤
                ['#8B4513', '#A0522D', '#CD853F'], // 브라운 계열
                ['#B22222', '#DC143C', '#CD5C5C']  // 딥 레드
            ]
        },
        winter: {
            recommended: ['complementary', 'triadic'],
            avoid: ['analogous'],
            best_combinations: [
                ['#000000', '#FFFFFF', '#FF0000'], // 클래식 대비
                ['#4169E1', '#FF1493', '#FFFFFF'], // 비비드 대비
                ['#800080', '#00FFFF', '#FFD700']  // 쿨 비비드
            ]
        }
    }
};

// 색상 분석 도구
class ColorPaletteAnalyzer {
    constructor() {
        this.palettes = COLOR_PALETTES;
        this.harmonyRules = COLOR_HARMONY_RULES;
    }

    /**
     * 계절별 색상 팔레트 가져오기
     */
    getSeasonPalette(season, subtype = null) {
        const palette = this.palettes[season];
        if (!palette) {
            return { error: `계절 '${season}'을 찾을 수 없습니다.` };
        }

        if (subtype && palette.subtypes[subtype]) {
            return {
                season: season,
                subtype: subtype,
                characteristics: palette.characteristics,
                colors: palette.subtypes[subtype],
                combinations: palette.color_combinations
            };
        }

        return {
            season: season,
            characteristics: palette.characteristics,
            subtypes: palette.subtypes,
            combinations: palette.color_combinations
        };
    }

    /**
     * 색상으로 계절 추정
     */
    estimateSeasonByColor(hexColor) {
        const lab = this.hexToLab(hexColor);
        const scores = {};

        // 각 계절의 모든 서브타입과 비교
        Object.keys(this.palettes).forEach(season => {
            scores[season] = 0;
            const palette = this.palettes[season];
            
            Object.keys(palette.subtypes).forEach(subtype => {
                const colors = palette.subtypes[subtype].primary_colors;
                colors.forEach(color => {
                    const distance = this.calculateColorDistance(lab, color.lab);
                    const similarity = Math.max(0, 100 - distance);
                    scores[season] = Math.max(scores[season], similarity);
                });
            });
        });

        // 가장 높은 점수의 계절 반환
        const bestSeason = Object.keys(scores).reduce((a, b) => 
            scores[a] > scores[b] ? a : b
        );

        return {
            estimated_season: bestSeason,
            confidence: scores[bestSeason],
            all_scores: scores
        };
    }

    /**
     * 색상 조합 분석
     */
    analyzeColorCombination(colors) {
        if (!Array.isArray(colors) || colors.length < 2) {
            return { error: '최소 2개의 색상이 필요합니다.' };
        }

        const analysis = {
            colors: colors.map(hex => ({
                hex: hex,
                lab: this.hexToLab(hex),
                hsl: this.hexToHsl(hex)
            })),
            harmony_types: [],
            seasonal_match: {},
            overall_score: 0
        };

        // 조화 타입 분석
        analysis.harmony_types = this.detectHarmonyTypes(analysis.colors);

        // 계절별 매칭 점수
        Object.keys(this.palettes).forEach(season => {
            analysis.seasonal_match[season] = this.calculateSeasonalMatch(colors, season);
        });

        // 전체 조화 점수 계산
        analysis.overall_score = this.calculateOverallHarmony(analysis);

        return analysis;
    }

    /**
     * 조화 타입 감지
     */
    detectHarmonyTypes(colors) {
        const harmonies = [];
        const hues = colors.map(color => color.hsl[0]);

        // 단색 조화 검사
        const hueRange = Math.max(...hues) - Math.min(...hues);
        if (hueRange <= 30) {
            harmonies.push({
                type: 'monochromatic',
                confidence: Math.max(0, 100 - hueRange * 2)
            });
        }

        // 인접 색상 조화 검사 (2-3개 색상)
        if (colors.length <= 3 && hueRange <= 60) {
            harmonies.push({
                type: 'analogous',
                confidence: Math.max(0, 100 - hueRange)
            });
        }

        // 보색 조화 검사 (2개 색상)
        if (colors.length === 2) {
            const hueDiff = Math.abs(hues[0] - hues[1]);
            const normalizedDiff = Math.min(hueDiff, 360 - hueDiff);
            if (normalizedDiff >= 150 && normalizedDiff <= 210) {
                harmonies.push({
                    type: 'complementary',
                    confidence: Math.max(0, 100 - Math.abs(normalizedDiff - 180) * 2)
                });
            }
        }

        // 삼색 조화 검사 (3개 색상)
        if (colors.length === 3) {
            const sortedHues = [...hues].sort((a, b) => a - b);
            const diff1 = sortedHues[1] - sortedHues[0];
            const diff2 = sortedHues[2] - sortedHues[1];
            const diff3 = (sortedHues[0] + 360) - sortedHues[2];

            if (Math.abs(diff1 - 120) <= 30 && Math.abs(diff2 - 120) <= 30) {
                harmonies.push({
                    type: 'triadic',
                    confidence: Math.max(0, 100 - (Math.abs(diff1 - 120) + Math.abs(diff2 - 120)) * 2)
                });
            }
        }

        return harmonies.sort((a, b) => b.confidence - a.confidence);
    }

    /**
     * 계절별 매칭 점수 계산
     */
    calculateSeasonalMatch(colors, season) {
        const palette = this.palettes[season];
        let totalScore = 0;
        let colorCount = 0;

        colors.forEach(hexColor => {
            const lab = this.hexToLab(hexColor);
            let bestMatch = 0;

            // 각 서브타입의 색상과 비교
            Object.keys(palette.subtypes).forEach(subtype => {
                const subtypeColors = [
                    ...palette.subtypes[subtype].primary_colors,
                    ...palette.subtypes[subtype].neutrals
                ];

                subtypeColors.forEach(paletteColor => {
                    const distance = this.calculateColorDistance(lab, paletteColor.lab);
                    const similarity = Math.max(0, 100 - distance);
                    bestMatch = Math.max(bestMatch, similarity);
                });
            });

            totalScore += bestMatch;
            colorCount++;
        });

        return Math.round(totalScore / colorCount);
    }

    /**
     * 전체 조화 점수 계산
     */
    calculateOverallHarmony(analysis) {
        let score = 0;
        
        // 조화 타입 점수
        if (analysis.harmony_types.length > 0) {
            score += analysis.harmony_types[0].confidence * 0.4;
        }

        // 최고 계절 매칭 점수
        const seasonalScores = Object.values(analysis.seasonal_match);
        const maxSeasonalScore = Math.max(...seasonalScores);
        score += maxSeasonalScore * 0.4;

        // 색상 분산 점수 (너무 비슷하거나 너무 다르면 감점)
        const labColors = analysis.colors.map(c => c.lab);
        const avgDistance = this.calculateAverageColorDistance(labColors);
        const diversityScore = Math.max(0, 100 - Math.abs(avgDistance - 30) * 2);
        score += diversityScore * 0.2;

        return Math.round(score);
    }

    /**
     * 추천 색상 조합 생성
     */
    generateRecommendedCombinations(season, count = 5) {
        const palette = this.palettes[season];
        if (!palette) return [];

        const combinations = [];
        const harmonies = this.harmonyRules.seasonal_harmonies[season];

        // 계절별 추천 조합 사용
        if (harmonies.best_combinations) {
            harmonies.best_combinations.forEach(combination => {
                combinations.push({
                    colors: combination,
                    type: 'seasonal_best',
                    harmony_score: 95,
                    description: `${palette.name.ko} 시즌 베스트 조합`
                });
            });
        }

        // 서브타입별 조합 생성
        Object.keys(palette.subtypes).forEach(subtype => {
            const subtypePalette = palette.subtypes[subtype];
            const primaryColors = subtypePalette.primary_colors.slice(0, 3);
            
            combinations.push({
                colors: primaryColors.map(c => c.hex),
                type: 'subtype_primary',
                harmony_score: 90,
                description: `${subtypePalette.name} 주요 색상 조합`
            });

            // 메인 + 중성 조합
            if (subtypePalette.neutrals.length >= 2) {
                combinations.push({
                    colors: [
                        primaryColors[0].hex,
                        subtypePalette.neutrals[0].hex,
                        subtypePalette.neutrals[1].hex
                    ],
                    type: 'balanced',
                    harmony_score: 85,
                    description: `${subtypePalette.name} 균형 조합`
                });
            }
        });

        // 점수순 정렬하고 요청된 개수만 반환
        return combinations
            .sort((a, b) => b.harmony_score - a.harmony_score)
            .slice(0, count);
    }

    /**
     * 색상 매칭 제품 추천
     */
    getMatchingProducts(hexColor, category = 'all') {
        const seasonEstimation = this.estimateSeasonByColor(hexColor);
        const season = seasonEstimation.estimated_season;
        const palette = this.palettes[season];
        
        if (!palette) return [];

        const products = [];

        // 헤어컬러 매칭
        if (category === 'all' || category === 'hair') {
            palette.color_combinations.hair_colors.forEach(hairColor => {
                const distance = this.calculateColorDistance(
                    this.hexToLab(hexColor),
                    hairColor.lab
                );
                
                if (distance < 30) {
                    products.push({
                        ...hairColor,
                        category: 'hair',
                        match_score: Math.round(100 - distance),
                        season: season
                    });
                }
            });
        }

        // 메이크업 매칭
        if (category === 'all' || category === 'makeup') {
            const makeupColors = palette.color_combinations.makeup_colors;
            
            ['foundation', 'lipstick', 'eyeshadow'].forEach(makeupCategory => {
                if (makeupColors[makeupCategory]) {
                    makeupColors[makeupCategory].forEach(product => {
                        const distance = this.calculateColorDistance(
                            this.hexToLab(hexColor),
                            this.hexToLab(product.hex)
                        );
                        
                        if (distance < 40) {
                            products.push({
                                ...product,
                                category: makeupCategory,
                                match_score: Math.round(100 - distance),
                                season: season
                            });
                        }
                    });
                }
            });
        }

        return products.sort((a, b) => b.match_score - a.match_score);
    }

    /**
     * 유틸리티 함수들
     */
    hexToLab(hex) {
        // 간단한 변환 (실제로는 더 정확한 변환 필요)
        const rgb = this.hexToRgb(hex);
        return this.rgbToLab(rgb[0], rgb[1], rgb[2]);
    }

    hexToHsl(hex) {
        const rgb = this.hexToRgb(hex);
        return this.rgbToHsl(rgb[0], rgb[1], rgb[2]);
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : null;
    }

    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [h * 360, s, l];
    }

    rgbToLab(r, g, b) {
        // 간소화된 RGB to LAB 변환
        r = r / 255;
        g = g / 255;
        b = b / 255;

        r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
        g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
        b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

        let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
        let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
        let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

        x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
        y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
        z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;

        const L = (116 * y) - 16;
        const a = 500 * (x - y);
        const B = 200 * (y - z);

        return [L, a, B];
    }

    calculateColorDistance(lab1, lab2) {
        const deltaL = lab1[0] - lab2[0];
        const deltaA = lab1[1] - lab2[1];
        const deltaB = lab1[2] - lab2[2];
        
        return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
    }

    calculateAverageColorDistance(labColors) {
        if (labColors.length < 2) return 0;

        let totalDistance = 0;
        let pairCount = 0;

        for (let i = 0; i < labColors.length; i++) {
            for (let j = i + 1; j < labColors.length; j++) {
                totalDistance += this.calculateColorDistance(labColors[i], labColors[j]);
                pairCount++;
            }
        }

        return totalDistance / pairCount;
    }

    /**
     * 시스템 상태 확인
     */
    getSystemStatus() {
        return {
            available_seasons: Object.keys(this.palettes),
            total_color_combinations: Object.values(this.palettes).reduce((sum, palette) => {
                return sum + Object.keys(palette.subtypes).length;
            }, 0),
            harmony_rules_loaded: Object.keys(this.harmonyRules.basic_harmonies).length,
            timestamp: new Date().toISOString()
        };
    }
}

// 전역 객체 생성
const colorPaletteAnalyzer = new ColorPaletteAnalyzer();

// 전역 등록 (브라우저 호환성)
if (typeof window !== 'undefined') {
    window.COLOR_PALETTES = COLOR_PALETTES;
    window.COLOR_HARMONY_RULES = COLOR_HARMONY_RULES;
    window.colorPaletteAnalyzer = colorPaletteAnalyzer;
    console.log('✅ colorPalettes 데이터가 전역에 등록되었습니다.');
}

// ES6 모듈 지원
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        COLOR_PALETTES,
        COLOR_HARMONY_RULES,
        ColorPaletteAnalyzer
    };
}
