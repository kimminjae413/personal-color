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
                    { name: 'Fuchsia', hex: '#FF1493', lab: [54
