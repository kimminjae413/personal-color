/**
 * makeupBrands.js
 * 화장품 브랜드별 제품 매칭 데이터베이스
 * 
 * 기능:
 * - 계절별 브랜드 제품 추천
 * - 가격대별 옵션 제공
 * - 한국 시장 특화 브랜드 포함
 * - 온라인/오프라인 구매처 정보
 */

// 주요 화장품 브랜드 데이터
const MAKEUP_BRANDS = {
    // 럭셔리 브랜드
    luxury: {
        'Chanel': {
            brand_info: {
                name: '샤넬',
                country: 'France',
                price_range: 'luxury',
                specialty: ['립스틱', '파운데이션', '아이섀도우'],
                available_in_korea: true
            },
            foundation: {
                spring: [
                    { name: 'Ultra Le Teint', shade: 'B20 Beige', undertone: 'warm', price: 75000 },
                    { name: 'Ultra Le Teint', shade: 'B30 Beige', undertone: 'warm', price: 75000 },
                    { name: 'Les Beiges', shade: '22', undertone: 'neutral-warm', price: 68000 }
                ],
                summer: [
                    { name: 'Ultra Le Teint', shade: 'B10 Beige', undertone: 'cool', price: 75000 },
                    { name: 'Les Beiges', shade: '20', undertone: 'cool', price: 68000 },
                    { name: 'Ultra Le Teint', shade: 'BR12', undertone: 'cool', price: 75000 }
                ],
                autumn: [
                    { name: 'Ultra Le Teint', shade: 'B40 Beige', undertone: 'warm', price: 75000 },
                    { name: 'Les Beiges', shade: '32', undertone: 'warm', price: 68000 },
                    { name: 'Ultra Le Teint', shade: 'B50', undertone: 'warm', price: 75000 }
                ],
                winter: [
                    { name: 'Ultra Le Teint', shade: 'BR22', undertone: 'cool', price: 75000 },
                    { name: 'Les Beiges', shade: '30', undertone: 'cool', price: 68000 },
                    { name: 'Ultra Le Teint', shade: 'BR32', undertone: 'cool', price: 75000 }
                ]
            },
            lipstick: {
                spring: [
                    { name: 'Rouge Coco', shade: '434 Mademoiselle', color: '#FF6B6B', finish: 'satin', price: 52000 },
                    { name: 'Rouge Coco', shade: '440 Arthur', color: '#FF7F50', finish: 'satin', price: 52000 },
                    { name: 'Rouge Allure', shade: '99 Pirate', color: '#DC143C', finish: 'satin', price: 52000 }
                ],
                summer: [
                    { name: 'Rouge Coco', shade: '416 Coco', color: '#DDA0DD', finish: 'satin', price: 52000 },
                    { name: 'Rouge Allure', shade: '135 Enigmatique', color: '#B39DDB', finish: 'matte', price: 52000 },
                    { name: 'Rouge Coco', shade: '402 Adrienne', color: '#FFB6C1', finish: 'satin', price: 52000 }
                ],
                autumn: [
                    { name: 'Rouge Allure', shade: '104 Passion', color: '#B22222', finish: 'matte', price: 52000 },
                    { name: 'Rouge Coco', shade: '444 Gabrielle', color: '#D2691E', finish: 'satin', price: 52000 },
                    { name: 'Rouge Allure', shade: '102 Palpitante', color: '#CD853F', finish: 'satin', price: 52000 }
                ],
                winter: [
                    { name: 'Rouge Allure', shade: '98 Coromandel', color: '#8B008B', finish: 'matte', price: 52000 },
                    { name: 'Rouge Coco', shade: '455 Nicole', color: '#FF1493', finish: 'satin', price: 52000 },
                    { name: 'Rouge Allure', shade: '1 Rouge Vif', color: '#FF0000', finish: 'satin', price: 52000 }
                ]
            }
        },

        'Dior': {
            brand_info: {
                name: '디올',
                country: 'France',
                price_range: 'luxury',
                specialty: ['립스틱', '파운데이션', '컨실러'],
                available_in_korea: true
            },
            foundation: {
                spring: [
                    { name: 'Forever Skin Glow', shade: '2WO', undertone: 'warm', price: 72000 },
                    { name: 'Forever Skin Glow', shade: '3WO', undertone: 'warm', price: 72000 },
                    { name: 'Backstage Foundation', shade: '2W', undertone: 'warm', price: 45000 }
                ],
                summer: [
                    { name: 'Forever Skin Glow', shade: '1CR', undertone: 'cool', price: 72000 },
                    { name: 'Forever Skin Glow', shade: '2CR', undertone: 'cool', price: 72000 },
                    { name: 'Backstage Foundation', shade: '1C', undertone: 'cool', price: 45000 }
                ],
                autumn: [
                    { name: 'Forever Skin Glow', shade: '4W', undertone: 'warm', price: 72000 },
                    { name: 'Forever Skin Glow', shade: '5W', undertone: 'warm', price: 72000 },
                    { name: 'Backstage Foundation', shade: '3W', undertone: 'warm', price: 45000 }
                ],
                winter: [
                    { name: 'Forever Skin Glow', shade: '3CR', undertone: 'cool', price: 72000 },
                    { name: 'Forever Skin Glow', shade: '4CR', undertone: 'cool', price: 72000 },
                    { name: 'Backstage Foundation', shade: '2C', undertone: 'cool', price: 45000 }
                ]
            },
            lipstick: {
                spring: [
                    { name: 'Rouge Dior', shade: '999', color: '#DC143C', finish: 'matte', price: 48000 },
                    { name: 'Rouge Dior', shade: '434', color: '#FF7F50', finish: 'satin', price: 48000 },
                    { name: 'Addict Lip Glow', shade: '001 Pink', color: '#FFB6C1', finish: 'balm', price: 42000 }
                ],
                summer: [
                    { name: 'Rouge Dior', shade: '566', color: '#DDA0DD', finish: 'satin', price: 48000 },
                    { name: 'Rouge Dior', shade: '277', color: '#B39DDB', finish: 'matte', price: 48000 },
                    { name: 'Addict Lip Glow', shade: '004 Coral', color: '#F08080', finish: 'balm', price: 42000 }
                ],
                autumn: [
                    { name: 'Rouge Dior', shade: '720', color: '#B22222', finish: 'matte', price: 48000 },
                    { name: 'Rouge Dior', shade: '525', color: '#D2691E', finish: 'satin', price: 48000 },
                    { name: 'Addict Lip Glow', shade: '012 Rosewood', color: '#BC8F8F', finish: 'balm', price: 42000 }
                ],
                winter: [
                    { name: 'Rouge Dior', shade: '964', color: '#8B008B', finish: 'matte', price: 48000 },
                    { name: 'Rouge Dior', shade: '770', color: '#FF1493', finish: 'satin', price: 48000 },
                    { name: 'Addict Lip Glow', shade: '006 Berry', color: '#DC143C', finish: 'balm', price: 42000 }
                ]
            }
        }
    },

    // 프리미엄 브랜드
    premium: {
        'MAC': {
            brand_info: {
                name: '맥',
                country: 'USA',
                price_range: 'premium',
                specialty: ['립스틱', '아이섀도우', '컨실러'],
                available_in_korea: true
            },
            foundation: {
                spring: [
                    { name: 'Studio Fix Fluid', shade: 'NC25', undertone: 'warm', price: 42000 },
                    { name: 'Studio Fix Fluid', shade: 'NC30', undertone: 'warm', price: 42000 },
                    { name: 'Face and Body', shade: 'C3', undertone: 'warm', price: 38000 }
                ],
                summer: [
                    { name: 'Studio Fix Fluid', shade: 'NW20', undertone: 'cool', price: 42000 },
                    { name: 'Studio Fix Fluid', shade: 'NW25', undertone: 'cool', price: 42000 },
                    { name: 'Face and Body', shade: 'W3', undertone: 'cool', price: 38000 }
                ],
                autumn: [
                    { name: 'Studio Fix Fluid', shade: 'NC35', undertone: 'warm', price: 42000 },
                    { name: 'Studio Fix Fluid', shade: 'NC40', undertone: 'warm', price: 42000 },
                    { name: 'Face and Body', shade: 'C4', undertone: 'warm', price: 38000 }
                ],
                winter: [
                    { name: 'Studio Fix Fluid', shade: 'NW30', undertone: 'cool', price: 42000 },
                    { name: 'Studio Fix Fluid', shade: 'NW35', undertone: 'cool', price: 42000 },
                    { name: 'Face and Body', shade: 'W4', undertone: 'cool', price: 38000 }
                ]
            },
            lipstick: {
                spring: [
                    { name: 'Ruby Woo', shade: 'Ruby Woo', color: '#DC143C', finish: 'matte', price: 26000 },
                    { name: 'Velvet Teddy', shade: 'Velvet Teddy', color: '#D2691E', finish: 'matte', price: 26000 },
                    { name: 'Coral Bliss', shade: 'Coral Bliss', color: '#FF7F50', finish: 'lustre', price: 26000 }
                ],
                summer: [
                    { name: 'Mehr', shade: 'Mehr', color: '#BC8F8F', finish: 'matte', price: 26000 },
                    { name: 'Twig', shade: 'Twig', color: '#DDA0DD', finish: 'satin', price: 26000 },
                    { name: 'Pink Nouveau', shade: 'Pink Nouveau', color: '#FFB6C1', finish: 'satin', price: 26000 }
                ],
                autumn: [
                    { name: 'Chili', shade: 'Chili', color: '#B22222', finish: 'satin', price: 26000 },
                    { name: 'Devoted to Chili', shade: 'Devoted to Chili', color: '#A0522D', finish: 'matte', price: 26000 },
                    { name: 'Taupe', shade: 'Taupe', color: '#CD853F', finish: 'satin', price: 26000 }
                ],
                winter: [
                    { name: 'Russian Red', shade: 'Russian Red', color: '#8B0000', finish: 'matte', price: 26000 },
                    { name: 'D for Danger', shade: 'D for Danger', color: '#FF1493', finish: 'satin', price: 26000 },
                    { name: 'Rebel', shade: 'Rebel', color: '#8B008B', finish: 'satin', price: 26000 }
                ]
            }
        },

        'NARS': {
            brand_info: {
                name: '나스',
                country: 'USA',
                price_range: 'premium',
                specialty: ['블러셔', '립스틱', '아이섀도우'],
                available_in_korea: true
            },
            lipstick: {
                spring: [
                    { name: 'Audacious', shade: 'Jeanne', color: '#FF6B6B', finish: 'semi-matte', price: 42000 },
                    { name: 'Audacious', shade: 'Claudia', color: '#FF7F50', finish: 'satin', price: 42000 },
                    { name: 'Velvet Matte', shade: 'Dragon Girl', color: '#DC143C', finish: 'matte', price: 38000 }
                ],
                summer: [
                    { name: 'Audacious', shade: 'Anna', color: '#DDA0DD', finish: 'satin', price: 42000 },
                    { name: 'Audacious', shade: 'Brigitte', color: '#FFB6C1', finish: 'satin', price: 42000 },
                    { name: 'Velvet Matte', shade: 'Dolce Vita', color: '#BC8F8F', finish: 'matte', price: 38000 }
                ],
                autumn: [
                    { name: 'Audacious', shade: 'Charlotte', color: '#B22222', finish: 'satin', price: 42000 },
                    { name: 'Audacious', shade: 'Annabella', color: '#D2691E', finish: 'satin', price: 42000 },
                    { name: 'Velvet Matte', shade: 'Cruella', color: '#A0522D', finish: 'matte', price: 38000 }
                ],
                winter: [
                    { name: 'Audacious', shade: 'Dominique', color: '#8B008B', finish: 'matte', price: 42000 },
                    { name: 'Audacious', shade: 'Vera', color: '#FF1493', finish: 'satin', price: 42000 },
                    { name: 'Velvet Matte', shade: 'Train Bleu', color: '#4B0082', finish: 'matte', price: 38000 }
                ]
            }
        }
    },

    // 미드레인지 브랜드 (한국 브랜드 포함)
    midrange: {
        'Hera': {
            brand_info: {
                name: '헤라',
                country: 'Korea',
                price_range: 'midrange',
                specialty: ['파운데이션', '립스틱', '쿠션'],
                available_in_korea: true
            },
            foundation: {
                spring: [
                    { name: 'Black Cushion', shade: '23N1', undertone: 'neutral-warm', price: 35000 },
                    { name: 'Black Foundation', shade: '25N1', undertone: 'neutral-warm', price: 45000 },
                    { name: 'UV Mist Cushion', shade: '23', undertone: 'warm', price: 32000 }
                ],
                summer: [
                    { name: 'Black Cushion', shade: '21N1', undertone: 'neutral-cool', price: 35000 },
                    { name: 'Black Foundation', shade: '23N1', undertone: 'neutral-cool', price: 45000 },
                    { name: 'UV Mist Cushion', shade: '21', undertone: 'cool', price: 32000 }
                ],
                autumn: [
                    { name: 'Black Cushion', shade: '25N2', undertone: 'warm', price: 35000 },
                    { name: 'Black Foundation', shade: '27N1', undertone: 'warm', price: 45000 },
                    { name: 'UV Mist Cushion', shade: '25', undertone: 'warm', price: 32000 }
                ],
                winter: [
                    { name: 'Black Cushion', shade: '23N2', undertone: 'cool', price: 35000 },
                    { name: 'Black Foundation', shade: '25N2', undertone: 'cool', price: 45000 },
                    { name: 'UV Mist Cushion', shade: '23', undertone: 'cool', price: 32000 }
                ]
            },
            lipstick: {
                spring: [
                    { name: 'Sensual Spicy Nude', shade: '141', color: '#FF7F50', finish: 'velvet', price: 28000 },
                    { name: 'Rouge Holic', shade: '110', color: '#FF6B6B', finish: 'cream', price: 25000 },
                    { name: 'Sensual Spicy Nude', shade: '117', color: '#DC143C', finish: 'velvet', price: 28000 }
                ],
                summer: [
                    { name: 'Sensual Spicy Nude', shade: '421', color: '#DDA0DD', finish: 'velvet', price: 28000 },
                    { name: 'Rouge Holic', shade: '355', color: '#FFB6C1', finish: 'cream', price: 25000 },
                    { name: 'Sensual Spicy Nude', shade: '415', color: '#BC8F8F', finish: 'velvet', price: 28000 }
                ],
                autumn: [
                    { name: 'Sensual Spicy Nude', shade: '325', color: '#B22222', finish: 'velvet', price: 28000 },
                    { name: 'Rouge Holic', shade: '287', color: '#D2691E', finish: 'cream', price: 25000 },
                    { name: 'Sensual Spicy Nude', shade: '277', color: '#A0522D', finish: 'velvet', price: 28000 }
                ],
                winter: [
                    { name: 'Sensual Spicy Nude', shade: '548', color: '#8B008B', finish: 'velvet', price: 28000 },
                    { name: 'Rouge Holic', shade: '513', color: '#FF1493', finish: 'cream', price: 25000 },
                    { name: 'Sensual Spicy Nude', shade: '521', color: '#4B0082', finish: 'velvet', price: 28000 }
                ]
            }
        },

        'Laneige': {
            brand_info: {
                name: '라네즈',
                country: 'Korea',
                price_range: 'midrange',
                specialty: ['립밤', '쿠션', '스킨케어'],
                available_in_korea: true
            },
            foundation: {
                spring: [
                    { name: 'Neo Cushion', shade: 'No.23', undertone: 'neutral-warm', price: 28000 },
                    { name: 'Perfect Renew Foundation', shade: 'No.33', undertone: 'warm', price: 32000 }
                ],
                summer: [
                    { name: 'Neo Cushion', shade: 'No.21', undertone: 'neutral-cool', price: 28000 },
                    { name: 'Perfect Renew Foundation', shade: 'No.31', undertone: 'cool', price: 32000 }
                ],
                autumn: [
                    { name: 'Neo Cushion', shade: 'No.25', undertone: 'warm', price: 28000 },
                    { name: 'Perfect Renew Foundation', shade: 'No.35', undertone: 'warm', price: 32000 }
                ],
                winter: [
                    { name: 'Neo Cushion', shade: 'No.23C', undertone: 'cool', price: 28000 },
                    { name: 'Perfect Renew Foundation', shade: 'No.33C', undertone: 'cool', price: 32000 }
                ]
            },
            lip_products: {
                spring: [
                    { name: 'Two Tone Lip Bar', shade: '6호 Lollipop Red', color: '#FF6B6B', finish: 'balm', price: 18000 },
                    { name: 'Stained Glass Lip Tint', shade: '4호 Coral', color: '#FF7F50', finish: 'tint', price: 15000 },
                    { name: 'Lip Glowy Balm', shade: 'Berry', color: '#DC143C', finish: 'balm', price: 16000 }
                ],
                summer: [
                    { name: 'Two Tone Lip Bar', shade: '8호 Sweet Lavender', color: '#DDA0DD', finish: 'balm', price: 18000 },
                    { name: 'Stained Glass Lip Tint', shade: '7호 Rose', color: '#FFB6C1', finish: 'tint', price: 15000 },
                    { name: 'Lip Glowy Balm', shade: 'Pink', color: '#F08080', finish: 'balm', price: 16000 }
                ],
                autumn: [
                    { name: 'Two Tone Lip Bar', shade: '12호 Mocha Brown', color: '#D2691E', finish: 'balm', price: 18000 },
                    { name: 'Stained Glass Lip Tint', shade: '9호 Brick', color: '#B22222', finish: 'tint', price: 15000 },
                    { name: 'Lip Glowy Balm', shade: 'Grapefruit', color: '#A0522D', finish: 'balm', price: 16000 }
                ],
                winter: [
                    { name: 'Two Tone Lip Bar', shade: '15호 Deep Plum', color: '#8B008B', finish: 'balm', price: 18000 },
                    { name: 'Stained Glass Lip Tint', shade: '11호 Fuchsia', color: '#FF1493', finish: 'tint', price: 15000 },
                    { name: 'Lip Glowy Balm', shade: 'Berry', color: '#4B0082', finish: 'balm', price: 16000 }
                ]
            }
        }
    },

    // 드럭스토어 브랜드
    drugstore: {
        'Maybelline': {
            brand_info: {
                name: '메이블린',
                country: 'USA',
                price_range: 'drugstore',
                specialty: ['마스카라', '파운데이션', '립스틱'],
                available_in_korea: true
            },
            foundation: {
                spring: [
                    { name: 'Fit Me Foundation', shade: '220 Natural Beige', undertone: 'warm', price: 12000 },
                    { name: 'Super Stay Foundation', shade: '128 Warm Nude', undertone: 'warm', price: 15000 },
                    { name: 'Dream Urban Cover', shade: '240', undertone: 'warm', price: 14000 }
                ],
                summer: [
                    { name: 'Fit Me Foundation', shade: '112 Natural Ivory', undertone: 'cool', price: 12000 },
                    { name: 'Super Stay Foundation', shade: '120 Classic Ivory', undertone: 'cool', price: 15000 },
                    { name: 'Dream Urban Cover', shade: '220', undertone: 'cool', price: 14000 }
                ],
                autumn: [
                    { name: 'Fit Me Foundation', shade: '230 Natural Buff', undertone: 'warm', price: 12000 },
                    { name: 'Super Stay Foundation', shade: '238 Rich Tan', undertone: 'warm', price: 15000 },
                    { name: 'Dream Urban Cover', shade: '260', undertone: 'warm', price: 14000 }
                ],
                winter: [
                    { name: 'Fit Me Foundation', shade: '128 Warm Nude', undertone: 'cool', price: 12000 },
                    { name: 'Super Stay Foundation', shade: '130 Buff Beige', undertone: 'cool', price: 15000 },
                    { name: 'Dream Urban Cover', shade: '250', undertone: 'cool', price: 14000 }
                ]
            },
            lipstick: {
                spring: [
                    { name: 'SuperStay Matte Ink', shade: '20 Pioneer', color: '#FF6B6B', finish: 'matte', price: 9000 },
                    { name: 'Color Sensational', shade: '540 Hollywood Red', color: '#DC143C', finish: 'cream', price: 8000 },
                    { name: 'SuperStay Vinyl Ink', shade: '15 Peachy', color: '#FF7F50', finish: 'vinyl', price: 10000 }
                ],
                summer: [
                    { name: 'SuperStay Matte Ink', shade: '115 Founder', color: '#DDA0DD', finish: 'matte', price: 9000 },
                    { name: 'Color Sensational', shade: '376 Pink For Me', color: '#FFB6C1', finish: 'cream', price: 8000 },
                    { name: 'SuperStay Vinyl Ink', shade: '25 Pink', color: '#F08080', finish: 'vinyl', price: 10000 }
                ],
                autumn: [
                    { name: 'SuperStay Matte Ink', shade: '50 Voyager', color: '#B22222', finish: 'matte', price: 9000 },
                    { name: 'Color Sensational', shade: '540 Hollywood Red', color: '#A0522D', finish: 'cream', price: 8000 },
                    { name: 'SuperStay Vinyl Ink', shade: '40 Witty', color: '#D2691E', finish: 'vinyl', price: 10000 }
                ],
                winter: [
                    { name: 'SuperStay Matte Ink', shade: '25 Heroine', color: '#8B008B', finish: 'matte', price: 9000 },
                    { name: 'Color Sensational', shade: '382 Red For Me', color: '#FF1493', finish: 'cream', price: 8000 },
                    { name: 'SuperStay Vinyl Ink', shade: '35 Cheeky', color: '#4B0082', finish: 'vinyl', price: 10000 }
                ]
            }
        },

        'Revlon': {
            brand_info: {
                name: '레블론',
                country: 'USA',
                price_range: 'drugstore',
                specialty: ['립스틱', '네일', '파운데이션'],
                available_in_korea: true
            },
            lipstick: {
                spring: [
                    { name: 'Super Lustrous', shade: '440 Cherries in the Snow', color: '#DC143C', finish: 'cream', price: 11000 },
                    { name: 'ColorStay Overtime', shade: '007 Non-Stop Cherry', color: '#FF6B6B', finish: 'liquid', price: 13000 },
                    { name: 'Super Lustrous', shade: '205 Champagne on Ice', color: '#FF7F50', finish: 'pearl', price: 11000 }
                ],
                summer: [
                    { name: 'Super Lustrous', shade: '245 Smoky Rose', color: '#DDA0DD', finish: 'cream', price: 11000 },
                    { name: 'ColorStay Overtime', shade: '040 Forever Scarlet', color: '#FFB6C1', finish: 'liquid', price: 13000 },
                    { name: 'Super Lustrous', shade: '415 Pink in the Afternoon', color: '#F08080', finish: 'cream', price: 11000 }
                ],
                autumn: [
                    { name: 'Super Lustrous', shade: '477 Black Cherry', color: '#B22222', finish: 'cream', price: 11000 },
                    { name: 'ColorStay Overtime', shade: '005 Infinite Raspberry', color: '#A0522D', finish: 'liquid', price: 13000 },
                    { name: 'Super Lustrous', shade: '325 Toast of New York', color: '#D2691E', finish: 'cream', price: 11000 }
                ],
                winter: [
                    { name: 'Super Lustrous', shade: '460 Blushing Mauve', color: '#8B008B', finish: 'cream', price: 11000 },
                    { name: 'ColorStay Overtime', shade: '050 Infinite Plum', color: '#FF1493', finish: 'liquid', price: 13000 },
                    { name: 'Super Lustrous', shade: '130 LUV', color: '#4B0082', finish: 'cream', price: 11000 }
                ]
            }
        }
    }
};

// 헤어컬러 브랜드 데이터
const HAIR_COLOR_BRANDS = {
    professional: {
        'Schwarzkopf Professional': {
            brand_info: {
                name: '슈바르츠코프 프로페셔널',
                country: 'Germany',
                type: 'professional',
                application: 'salon_only'
            },
            hair_colors: {
                spring: [
                    { level: 6, tone: 'G', name: '골든 다크 블론드', hex: '#D2691E', series: 'Igora Royal' },
                    { level: 7, tone: 'G', name: '골든 블론드', hex: '#DAA520', series: 'Igora Royal' },
                    { level: 8, tone: 'G', name: '라이트 골든 블론드', hex: '#F0E68C', series: 'Igora Royal' },
                    { level: 5, tone: 'KG', name: '구리 골든 라이트 브라운', hex: '#B22222', series: 'Igora Royal' }
                ],
                summer: [
                    { level: 6, tone: 'A', name: '애쉬 다크 블론드', hex: '#A0522D', series: 'Igora Royal' },
                    { level: 7, tone: 'A', name: '애쉬 블론드', hex: '#F5DEB3', series: 'Igora Royal' },
                    { level: 9, tone: 'A', name: '베리 라이트 애쉬 블론드', hex: '#E6E6FA', series: 'Igora Royal' },
                    { level: 6, tone: 'VA', name: '바이올렛 애쉬 다크 블론드', hex: '#BC8F8F', series: 'Igora Royal' }
                ],
                autumn: [
                    { level: 4, tone: 'KG', name: '구리 골든 브라운', hex: '#8B4513', series: 'Igora Royal' },
                    { level: 5, tone: 'G', name: '골든 라이트 브라운', hex: '#CD853F', series: 'Igora Royal' },
                    { level: 3, tone: 'K', name: '구리 다크 브라운', hex: '#A0522D', series: 'Igora Royal' },
                    { level: 4, tone: 'KR', name: '구리 레드 브라운', hex: '#B22222', series: 'Igora Royal' }
                ],
                winter: [
                    { level: 1, tone: '', name: '블랙', hex: '#000000', series: 'Igora Royal' },
                    { level: 3, tone: '', name: '다크 브라운', hex: '#654321', series: 'Igora Royal' },
                    { level: 4, tone: 'A', name: '애쉬 브라운', hex: '#696969', series: 'Igora Royal' },
                    { level: 5, tone: 'V', name: '바이올렛 라이트 브라운', hex: '#800020', series: 'Igora Royal' }
                ]
            }
        },

        'Wella Professionals': {
            brand_info: {
                name: '웰라 프로페셔널',
                country: 'Germany', 
                type: 'professional',
                application: 'salon_only'
            },
            hair_colors: {
                spring: [
                    { level: 6, tone: '/3', name: '골든 다크 블론드', hex: '#D2691E', series: 'Koleston Perfect' },
                    { level: 7, tone: '/31', name: '골든 애쉬 블론드', hex: '#DAA520', series: 'Koleston Perfect' },
                    { level: 8, tone: '/38', name: '골든 펄 블론드', hex: '#F0E68C', series: 'Koleston Perfect' },
                    { level: 5, tone: '/43', name: '레드 골든 라이트 브라운', hex: '#B22222', series: 'Koleston Perfect' }
                ],
                summer: [
                    { level: 6, tone: '/1', name: '애쉬 다크 블론드', hex: '#A0522D', series: 'Koleston Perfect' },
                    { level: 7, tone: '/16', name: '애쉬 바이올렛 블론드', hex: '#F5DEB3', series: 'Koleston Perfect' },
                    { level: 9, tone: '/16', name: '베리 라이트 애쉬 바이올렛 블론드', hex: '#E6E6FA', series: 'Koleston Perfect' },
                    { level: 8, tone: '/81', name: '펄 애쉬 라이트 블론드', hex: '#C0C0C0', series: 'Koleston Perfect' }
                ],
                autumn: [
                    { level: 4, tone: '/37', name: '골든 브라운 브라운', hex: '#8B4513', series: 'Koleston Perfect' },
                    { level: 5, tone: '/3', name: '골든 라이트 브라운', hex: '#CD853F', series: 'Koleston Perfect' },
                    { level: 3, tone: '/4', name: '레드 다크 브라운', hex: '#A0522D', series: 'Koleston Perfect' },
                    { level: 4, tone: '/43', name: '레드 골든 브라운', hex: '#B22222', series: 'Koleston Perfect' }
                ],
                winter: [
                    { level: 2, tone: '/0', name: '블랙 브라운', hex: '#000000', series: 'Koleston Perfect' },
                    { level: 3, tone: '/0', name: '다크 브라운', hex: '#654321', series: 'Koleston Perfect' },
                    { level: 4, tone: '/1', name: '애쉬 브라운', hex: '#696969', series: 'Koleston Perfect' },
                    { level: 5, tone: '/6', name: '바이올렛 라이트 브라운', hex: '#800020', series: 'Koleston Perfect' }
                ]
            }
        }
    },

    // 홈 컬러링 브랜드 (한국)
    home_coloring: {
        'Mise en scene': {
            brand_info: {
                name: '미쟝센',
                country: 'Korea',
                type: 'consumer',
                application: 'home_use'
            },
            hair_colors: {
                spring: [
                    { shade: '7GN', name: '골든 너트 브라운', hex: '#D2691E', price: 8000 },
                    { shade: '8GN', name: '라이트 골든 너트 브라운', hex: '#DAA520', price: 8000 },
                    { shade: '9GN', name: '베리 라이트 골든 너트 브라운', hex: '#F0E68C', price: 8000 },
                    { shade: '6RN', name: '로즈 너트 브라운', hex: '#B22222', price: 8000 }
                ],
                summer: [
                    { shade: '7AN', name: '애쉬 너트 브라운', hex: '#A0522D', price: 8000 },
                    { shade: '8AN', name: '라이트 애쉬 너트 브라운', hex: '#F5DEB3', price: 8000 },
                    { shade: '9A', name: '베리 라이트 애쉬', hex: '#E6E6FA', price: 8000 },
                    { shade: '8P', name: '라이트 핑크', hex: '#BC8F8F', price: 8000 }
                ],
                autumn: [
                    { shade: '5G', name: '골든 브라운', hex: '#8B4513', price: 8000 },
                    { shade: '6G', name: '다크 골든 브라운', hex: '#CD853F', price: 8000 },
                    { shade: '4R', name: '레드 브라운', hex: '#A0522D', price: 8000 },
                    { shade: '5R', name: '라이트 레드 브라운', hex: '#B22222', price: 8000 }
                ],
                winter: [
                    { shade: '1N', name: '블랙', hex: '#000000', price: 8000 },
                    { shade: '3N', name: '다크 브라운', hex: '#654321', price: 8000 },
                    { shade: '4A', name: '애쉬 브라운', hex: '#696969', price: 8000 },
                    { shade: '5V', name: '바이올렛 브라운', hex: '#800020', price: 8000 }
                ]
            }
        }
    }
};

// 구매처 정보
const PURCHASE_LOCATIONS = {
    online: {
        'Sephora Korea': {
            url: 'https://sephora.kr',
            brands: ['Dior', 'Chanel', 'NARS', 'MAC'],
            delivery: '무료배송 (5만원 이상)',
            return_policy: '30일 무료반품'
        },
        'Olive Young': {
            url: 'https://oliveyoung.co.kr',
            brands: ['Hera', 'Laneige', 'Maybelline', 'Revlon', 'Mise en scene'],
            delivery: '무료배송 (2만원 이상)',
            return_policy: '7일 무료반품'
        },
        'Ssg.com': {
            url: 'https://ssg.com',
            brands: ['MAC', 'NARS', 'Hera', 'Laneige'],
            delivery: '무료배송 (3만원 이상)',
            return_policy: '14일 무료반품'
        }
    },
    offline: {
        'Lotte Department Store': {
            locations: ['본점', '잠실점', '월드타워점', '센텀시티점'],
            brands: ['Chanel', 'Dior', 'MAC', 'NARS', 'Hera'],
            services: ['메이크업 서비스', '퍼스널컬러 진단', '색조 매칭']
        },
        'Shinsegae Department Store': {
            locations: ['본점', '강남점', '센텀시티점'],
            brands: ['Chanel', 'Dior', 'MAC', 'NARS'],
            services: ['VIP 상담', '메이크업 클래스', '제품 체험']
        },
        'Olive Young': {
            locations: '전국 매장',
            brands: ['Hera', 'Laneige', 'Maybelline', 'Revlon'],
            services: ['색조 테스트', '스킨케어 상담', 'APP 연동 서비스']
        }
    }
};

// 브랜드 검색 및 매칭 함수들
class MakeupBrandMatcher {
    constructor() {
        this.brands = MAKEUP_BRANDS;
        this.hairColors = HAIR_COLOR_BRANDS;
        this.purchaseLocations = PURCHASE_LOCATIONS;
    }

    /**
     * 계절과 예산에 따른 제품 추천
     */
    getRecommendationsBySeason(season, budget = 'all', category = 'all') {
        const recommendations = {
            foundation: [],
            lipstick: [],
            hair_color: [],
            purchase_info: {}
        };

        // 예산 범위 설정
        const budgetRanges = {
            low: { max: 20000 },
            medium: { min: 20000, max: 50000 },
            high: { min: 50000 },
            all: { min: 0, max: Infinity }
        };

        const budgetRange = budgetRanges[budget] || budgetRanges.all;

        // 각 브랜드 타입별로 제품 수집
        Object.keys(this.brands).forEach(priceRange => {
            Object.keys(this.brands[priceRange]).forEach(brandName => {
                const brand = this.brands[priceRange][brandName];

                // 파운데이션 추천
                if ((category === 'all' || category === 'foundation') && brand.foundation && brand.foundation[season]) {
                    brand.foundation[season].forEach(product => {
                        if (product.price >= budgetRange.min && product.price <= budgetRange.max) {
                            recommendations.foundation.push({
                                ...product,
                                brand: brandName,
                                brand_info: brand.brand_info,
                                category: 'foundation'
                            });
                        }
                    });
                }

                // 립스틱 추천
                if ((category === 'all' || category === 'lipstick')) {
                    const lipProducts = brand.lipstick || brand.lip_products;
                    if (lipProducts && lipProducts[season]) {
                        lipProducts[season].forEach(product => {
                            if (product.price >= budgetRange.min && product.price <= budgetRange.max) {
                                recommendations.lipstick.push({
                                    ...product,
                                    brand: brandName,
                                    brand_info: brand.brand_info,
                                    category: 'lipstick'
                                });
                            }
                        });
                    }
                }
            });
        });

        // 헤어컬러 추천
        if (category === 'all' || category === 'hair_color') {
            Object.keys(this.hairColors).forEach(type => {
                Object.keys(this.hairColors[type]).forEach(brandName => {
                    const brand = this.hairColors[type][brandName];
                    if (brand.hair_colors && brand.hair_colors[season]) {
                        brand.hair_colors[season].forEach(product => {
                            const price = product.price || 50000; // 전문가용은 예상 가격
                            if (price >= budgetRange.min && price <= budgetRange.max) {
                                recommendations.hair_color.push({
                                    ...product,
                                    brand: brandName,
                                    brand_info: brand.brand_info,
                                    category: 'hair_color'
                                });
                            }
                        });
                    }
                });
            });
        }

        // 구매처 정보 추가
        recommendations.purchase_info = this.getPurchaseInfo(recommendations);

        // 가격순 정렬
        ['foundation', 'lipstick', 'hair_color'].forEach(cat => {
            recommendations[cat].sort((a, b) => (a.price || 0) - (b.price || 0));
        });

        return recommendations;
    }

    /**
     * 특정 브랜드의 계절별 제품 가져오기
     */
    getBrandProducts(brandName, season) {
        let foundBrand = null;
        let brandCategory = null;

        // 메이크업 브랜드에서 찾기
        Object.keys(this.brands).forEach(priceRange => {
            if (this.brands[priceRange][brandName]) {
                foundBrand = this.brands[priceRange][brandName];
                brandCategory = 'makeup';
            }
        });

        // 헤어컬러 브랜드에서 찾기
        if (!foundBrand) {
            Object.keys(this.hairColors).forEach(type => {
                if (this.hairColors[type][brandName]) {
                    foundBrand = this.hairColors[type][brandName];
                    brandCategory = 'hair';
                }
            });
        }

        if (!foundBrand) {
            return { error: `브랜드 '${brandName}'를 찾을 수 없습니다.` };
        }

        const products = {
            brand_info: foundBrand.brand_info,
            season: season,
            products: {}
        };

        if (brandCategory === 'makeup') {
            if (foundBrand.foundation && foundBrand.foundation[season]) {
                products.products.foundation = foundBrand.foundation[season];
            }
            
            const lipProducts = foundBrand.lipstick || foundBrand.lip_products;
            if (lipProducts && lipProducts[season]) {
                products.products.lipstick = lipProducts[season];
            }
        } else if (brandCategory === 'hair') {
            if (foundBrand.hair_colors && foundBrand.hair_colors[season]) {
                products.products.hair_color = foundBrand.hair_colors[season];
            }
        }

        return products;
    }

    /**
     * 색상 코드로 제품 검색
     */
    findProductsByColor(hexColor, tolerance = 50000) {
        const targetColor = parseInt(hexColor.replace('#', ''), 16);
        const matchingProducts = [];

        // 모든 브랜드를 순회하며 색상 매칭
        Object.keys(this.brands).forEach(priceRange => {
            Object.keys(this.brands[priceRange]).forEach(brandName => {
                const brand = this.brands[priceRange][brandName];

                // 립스틱 색상 매칭
                const lipProducts = brand.lipstick || brand.lip_products;
                if (lipProducts) {
                    Object.keys(lipProducts).forEach(season => {
                        lipProducts[season].forEach(product => {
                            if (product.color) {
                                const productColor = parseInt(product.color.replace('#', ''), 16);
                                const colorDiff = Math.abs(targetColor - productColor);
                                
                                if (colorDiff <= tolerance) {
                                    matchingProducts.push({
                                        ...product,
                                        brand: brandName,
                                        season: season,
                                        color_difference: colorDiff,
                                        category: 'lipstick'
                                    });
                                }
                            }
                        });
                    });
                }
            });
        });

        // 헤어컬러 매칭
        Object.keys(this.hairColors).forEach(type => {
            Object.keys(this.hairColors[type]).forEach(brandName => {
                const brand = this.hairColors[type][brandName];
                if (brand.hair_colors) {
                    Object.keys(brand.hair_colors).forEach(season => {
                        brand.hair_colors[season].forEach(product => {
                            if (product.hex) {
                                const productColor = parseInt(product.hex.replace('#', ''), 16);
                                const colorDiff = Math.abs(targetColor - productColor);
                                
                                if (colorDiff <= tolerance) {
                                    matchingProducts.push({
                                        ...product,
                                        brand: brandName,
                                        season: season,
                                        color_difference: colorDiff,
                                        category: 'hair_color'
                                    });
                                }
                            }
                        });
                    });
                }
            });
        });

        // 색상 차이순으로 정렬
        matchingProducts.sort((a, b) => a.color_difference - b.color_difference);

        return matchingProducts;
    }

    /**
     * 구매처 정보 생성
     */
    getPurchaseInfo(recommendations) {
        const availableBrands = new Set();
        
        // 추천 제품에서 브랜드 추출
        Object.keys(recommendations).forEach(category => {
            if (Array.isArray(recommendations[category])) {
                recommendations[category].forEach(product => {
                    if (product.brand) {
                        availableBrands.add(product.brand);
                    }
                });
            }
        });

        const purchaseOptions = {
            online: [],
            offline: []
        };

        // 온라인 구매처
        Object.keys(this.purchaseLocations.online).forEach(store => {
            const storeInfo = this.purchaseLocations.online[store];
            const availableHere = [...availableBrands].filter(brand => 
                storeInfo.brands.includes(brand)
            );
            
            if (availableHere.length > 0) {
                purchaseOptions.online.push({
                    store: store,
                    available_brands: availableHere,
                    ...storeInfo
                });
            }
        });

        // 오프라인 구매처
        Object.keys(this.purchaseLocations.offline).forEach(store => {
            const storeInfo = this.purchaseLocations.offline[store];
            const availableHere = [...availableBrands].filter(brand => 
                storeInfo.brands.includes(brand)
            );
            
            if (availableHere.length > 0) {
                purchaseOptions.offline.push({
                    store: store,
                    available_brands: availableHere,
                    ...storeInfo
                });
            }
        });

        return purchaseOptions;
    }

    /**
     * 가격대별 브랜드 목록
     */
    getBrandsByPriceRange(priceRange = 'all') {
        if (priceRange === 'all') {
            const allBrands = [];
            Object.keys(this.brands).forEach(range => {
                Object.keys(this.brands[range]).forEach(brandName => {
                    allBrands.push({
                        name: brandName,
                        price_range: range,
                        ...this.brands[range][brandName].brand_info
                    });
                });
            });
            return allBrands;
        } else if (this.brands[priceRange]) {
            return Object.keys(this.brands[priceRange]).map(brandName => ({
                name: brandName,
                price_range: priceRange,
                ...this.brands[priceRange][brandName].brand_info
            }));
        } else {
            return [];
        }
    }

    /**
     * 브랜드 검색
     */
    searchBrands(query) {
        const results = [];
        const queryLower = query.toLowerCase();

        Object.keys(this.brands).forEach(priceRange => {
            Object.keys(this.brands[priceRange]).forEach(brandName => {
                const brand = this.brands[priceRange][brandName];
                const brandNameKr = brand.brand_info.name;
                
                if (brandName.toLowerCase().includes(queryLower) || 
                    brandNameKr.includes(query)) {
                    results.push({
                        name: brandName,
                        name_kr: brandNameKr,
                        price_range: priceRange,
                        ...brand.brand_info
                    });
                }
            });
        });

        return results;
    }
}

// 전역 객체 생성
const makeupBrandMatcher = new MakeupBrandMatcher();

// 전역 등록 (브라우저 호환성)
if (typeof window !== 'undefined') {
    window.MAKEUP_BRANDS = MAKEUP_BRANDS;
    window.HAIR_COLOR_BRANDS = HAIR_COLOR_BRANDS;
    window.PURCHASE_LOCATIONS = PURCHASE_LOCATIONS;
    window.makeupBrandMatcher = makeupBrandMatcher;
    console.log('✅ makeupBrands 데이터가 전역에 등록되었습니다.');
}

// ES6 모듈 지원
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MAKEUP_BRANDS,
        HAIR_COLOR_BRANDS,
        PURCHASE_LOCATIONS,
        MakeupBrandMatcher
    };
}
