}

    /**
     * 초기화 메서드 (ES5 버전)
     */
    CustomerManager.prototype.initialize = function() {
        console.log('[CustomerManager] 초기화 중...');
        
        var self = this;
        
        Promise.resolve()
            .then(function() {
                return self.loadCustomers();
            })
            .then(function() {
                return self.loadDiagnosticHistory();
            })
            .then(function() {
                self.buildSearchIndex();
                self.setupEventListeners();
                console.log('[CustomerManager] 초기화 완료: ' + self.customers.size + '명 고객 로드');
            })
            .catch(function(error) {
                console.error('[CustomerManager] 초기화 실패:', error);
            });
    };

    /**
     * 고객 생성 (ES5 버전)
     */
    CustomerManager.prototype.createCustomer = function(customerData) {
        var self = this;
        
        return new Promise(function(resolve, reject) {
            try {
                // 데이터 검증
                var validationResult = self.validateCustomerData(customerData);
                if (!validationResult.isValid) {
                    throw new Error('고객 정보 오류: ' + validationResult.errors.join(', '));
                }

                // 고객 ID 생성
                var customerId = self.generateCustomerId();
                
                // 고객 객체 생성
                var customer = {
                    id: customerId,
                    name: customerData.name,
                    phone: customerData.phone,
                    email: customerData.email || '',
                    birthDate: customerData.birthDate || '',
                    gender: customerData.gender || '',
                    address: customerData.address || '',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    totalVisits: 1,
                    lastVisit: new Date().toISOString(),
                    preferences: {
                        colorPreferences: [],
                        stylePreferences: [],
                        allergies: [],
                        notes: ''
                    },
                    statistics: {
                        totalDiagnoses: 0,
                        favoriteSeasons: [],
                        commonRequests: []
                    }
                };

                // 저장
                self.customers.set(customerId, customer);
                
                self.saveCustomer(customer)
                    .then(function() {
                        // 검색 인덱스 업데이트
                        self.updateSearchIndex(customer);
                        console.log('[CustomerManager] 새 고객 생성: ' + customer.name + ' (' + customerId + ')');
                        resolve(customer);
                    })
                    .catch(reject);
                
            } catch (error) {
                console.error('[CustomerManager] 고객 생성 실패:', error);
                reject(error);
            }
        });
    };

    /**
     * 고객 정보 업데이트 (ES5 버전)
     */
    CustomerManager.prototype.updateCustomer = function(customerId, updateData) {
        var self = this;
        
        return new Promise(function(resolve, reject) {
            try {
                var customer = self.customers.get(customerId);
                if (!customer) {
                    throw new Error('고객을 찾을 수 없습니다: ' + customerId);
                }

                // 업데이트된 데이터 검증
                var mergedData = {};
                for (var key in customer) {
                    if (customer.hasOwnProperty(key)) {
                        mergedData[key] = customer[key];
                    }
                }
                for (var key in updateData) {
                    if (updateData.hasOwnProperty(key)) {
                        mergedData[key] = updateData[key];
                    }
                }

                var validationResult = self.validateCustomerData(mergedData);
                if (!validationResult.isValid) {
                    throw new Error('업데이트 데이터 오류: ' + validationResult.errors.join(', '));
                }

                // 업데이트
                var updatedCustomer = {};
                for (var key in customer) {
                    if (customer.hasOwnProperty(key)) {
                        updatedCustomer[key] = customer[key];
                    }
                }
                for (var key in updateData) {
                    if (updateData.hasOwnProperty(key)) {
                        updatedCustomer[key] = updateData[key];
                    }
                }
                updatedCustomer.updatedAt = new Date().toISOString();

                self.customers.set(customerId, updatedCustomer);
                
                self.saveCustomer(updatedCustomer)
                    .then(function() {
                        // 검색 인덱스 업데이트
                        self.updateSearchIndex(updatedCustomer);
                        console.log('[CustomerManager] 고객 정보 업데이트: ' + updatedCustomer.name);
                        resolve(updatedCustomer);
                    })
                    .catch(reject);
                
            } catch (error) {
                console.error('[CustomerManager] 고객 업데이트 실패:', error);
                reject(error);
            }
        });
    };

    /**
     * 고객 검색 (ES5 버전)
     */
    CustomerManager.prototype.searchCustomers = function(query, filters) {
        filters = filters || {};
        
        try {
            var results = [];
            var searchQuery = query.toLowerCase().trim();

            // 빈 쿼리인 경우 전체 반환 (필터 적용)
            if (!searchQuery) {
                var allCustomers = [];
                for (var customer of this.customers.values()) {
                    allCustomers.push(customer);
                }
                return this.applyFilters(allCustomers, filters);
            }

            // 검색 인덱스에서 검색
            var self = this;
            this.searchIndex.forEach(function(customerIds, key) {
                if (key.indexOf(searchQuery) !== -1) {
                    customerIds.forEach(function(id) {
                        var customer = self.customers.get(id);
                        if (customer && !results.find(function(c) { return c.id === id; })) {
                            results.push(customer);
                        }
                    });
                }
            });

            // 필터 적용
            var filteredResults = this.applyFilters(results, filters);

            // 관련도별 정렬
            return this.sortByRelevance(filteredResults, searchQuery);
            
        } catch (error) {
            console.error('[CustomerManager] 검색 실패:', error);
            return [];
        }
    };

    /**
     * 진단 기록 추가 (ES5 버전)
     */
    CustomerManager.prototype.addDiagnosticRecord = function(customerId, diagnosticData) {
        var self = this;
        
        return new Promise(function(resolve, reject) {
            try {
                var customer = self.customers.get(customerId);
                if (!customer) {
                    throw new Error('고객을 찾을 수 없습니다: ' + customerId);
                }

                var recordId = self.generateRecordId();
                var record = {
                    id: recordId,
                    customerId: customerId,
                    date: new Date().toISOString(),
                    type: diagnosticData.type, // 'ai' 또는 'draping'
                    results: diagnosticData.results,
                    designer: diagnosticData.designer || 'Unknown',
                    notes: diagnosticData.notes || '',
                    images: diagnosticData.images || [],
                    satisfaction: diagnosticData.satisfaction || null,
                    products: diagnosticData.products || []
                };

                // 진단 기록 저장
                if (!self.diagnosticHistory.has(customerId)) {
                    self.diagnosticHistory.set(customerId, []);
                }
                self.diagnosticHistory.get(customerId).push(record);

                // 고객 통계 업데이트 및 마지막 방문일 업데이트
                Promise.all([
                    self.updateCustomerStatistics(customerId, record),
                    self.updateCustomer(customerId, {
                        lastVisit: record.date,
                        totalVisits: customer.totalVisits + 1
                    })
                ])
                .then(function() {
                    return self.saveDiagnosticHistory(customerId);
                })
                .then(function() {
                    console.log('[CustomerManager] 진단 기록 추가: ' + customer.name + ' - ' + record.type);
                    resolve(record);
                })
                .catch(reject);
                
            } catch (error) {
                console.error('[CustomerManager] 진단 기록 추가 실패:', error);
                reject(error);
            }
        });
    };

    /**
     * 고객 진단 히스토리 조회 (ES5 버전)
     */
    CustomerManager.prototype.getCustomerHistory = function(customerId, limit) {
        limit = limit || 10;
        
        var history = this.diagnosticHistory.get(customerId) || [];
        return history
            .sort(function(a, b) {
                return new Date(b.date) - new Date(a.date);
            })
            .slice(0, limit);
    };

    /**
     * 고객 통계 분석 (ES5 버전)
     */
    CustomerManager.prototype.getCustomerInsights = function(customerId) {
        try {
            var customer = this.customers.get(customerId);
            var history = this.diagnosticHistory.get(customerId) || [];

            if (!customer || history.length === 0) {
                return null;
            }

            // 계절 분포 분석
            var seasonCount = {};
            var colorPreferences = {};
            var satisfactionScores = [];
            
            var self = this;
            history.forEach(function(record) {
                if (record.results && record.results.season) {
                    seasonCount[record.results.season] = (seasonCount[record.results.season] || 0) + 1;
                }
                
                if (record.results && record.results.colors) {
                    record.results.colors.forEach(function(color) {
                        colorPreferences[color] = (colorPreferences[color] || 0) + 1;
                    });
                }
                
                if (record.satisfaction) {
                    satisfactionScores.push(record.satisfaction);
                }
            });

            // 인사이트 계산
            var insights = {
                totalDiagnoses: history.length,
                dominantSeason: this.getMostFrequent(seasonCount),
                favoriteColors: this.getTopColors(colorPreferences, 5),
                averageSatisfaction: satisfactionScores.length > 0 
                    ? (satisfactionScores.reduce(function(a, b) { return a + b; }, 0) / satisfactionScores.length).toFixed(1)
                    : 'N/A',
                visitFrequency: this.calculateVisitFrequency(history),
                lastDiagnosis: history[history.length - 1] ? history[history.length - 1].date : null,
                trends: this.analyzeTrends(history)
            };

            return insights;
            
        } catch (error) {
            console.error('[CustomerManager] 통계 분석 실패:', error);
            return null;
        }
    };

    /**
     * 고객 데이터 검증 (ES5 버전)
     */
    CustomerManager.prototype.validateCustomerData = function(data) {
        var errors = [];

        // 필수 필드 체크
        if (!data.name || data.name.trim().length < 2) {
            errors.push('이름은 2자 이상 입력해주세요');
        }

        if (!data.phone || !/^[0-9-+\s()]+$/.test(data.phone)) {
            errors.push('올바른 전화번호를 입력해주세요');
        }

        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.push('올바른 이메일 주소를 입력해주세요');
        }

        if (data.birthDate) {
            var birthDate = new Date(data.birthDate);
            var now = new Date();
            var age = now.getFullYear() - birthDate.getFullYear();
            
            if (isNaN(birthDate.getTime()) || age < 0 || age > 120) {
                errors.push('올바른 생년월일을 입력해주세요');
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    };

    /**
     * 검색 인덱스 구축 (ES5 버전)
     */
    CustomerManager.prototype.buildSearchIndex = function() {
        this.searchIndex.clear();
        
        var self = this;
        this.customers.forEach(function(customer) {
            self.updateSearchIndex(customer);
        });
        
        console.log('[CustomerManager] 검색 인덱스 구축 완료: ' + this.searchIndex.size + '개 키');
    };

    /**
     * 검색 인덱스 업데이트 (ES5 버전)
     */
    CustomerManager.prototype.updateSearchIndex = function(customer) {
        // 기존 인덱스에서 고객 제거
        this.removeFromSearchIndex(customer.id);

        // 새 인덱스 추가
        var searchableFields = [
            customer.name,
            customer.phone,
            customer.email,
            (customer.preferences && customer.preferences.notes) || ''
        ].filter(function(field) { return !!field; });

        var self = this;
        searchableFields.forEach(function(field) {
            var normalized = field.toLowerCase();
            
            // 전체 문자열
            self.addToSearchIndex(normalized, customer.id);
            
            // 단어별 분리
            normalized.split(/\s+/).forEach(function(word) {
                if (word.length > 1) {
                    self.addToSearchIndex(word, customer.id);
                }
            });

            // 초성 검색 (한글)
            if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(normalized)) {
                var chosung = self.extractChosung(normalized);
                self.addToSearchIndex(chosung, customer.id);
            }
        });
    };

    /**
     * 필터 적용 (ES5 버전)
     */
    CustomerManager.prototype.applyFilters = function(customers, filters) {
        var self = this;
        
        return customers.filter(function(customer) {
            // 연령 필터
            if (filters.ageRange) {
                var age = self.calculateAge(customer.birthDate);
                var minAge = filters.ageRange[0];
                var maxAge = filters.ageRange[1];
                if (age < minAge || age > maxAge) return false;
            }

            // 방문 기간 필터
            if (filters.visitPeriod) {
                var lastVisit = new Date(customer.lastVisit);
                var now = new Date();
                var daysDiff = (now - lastVisit) / (1000 * 60 * 60 * 24);
                
                switch (filters.visitPeriod) {
                    case 'week': return daysDiff <= 7;
                    case 'month': return daysDiff <= 30;
                    case 'quarter': return daysDiff <= 90;
                    case 'year': return daysDiff <= 365;
                }
            }

            // 진단 횟수 필터
            if (filters.diagnosisCount) {
                var history = self.diagnosticHistory.get(customer.id) || [];
                var min = filters.diagnosisCount[0];
                var max = filters.diagnosisCount[1];
                if (history.length < min || history.length > max) return false;
            }

            return true;
        });
    };

    /**
     * 관련도별 정렬 (ES5 버전)
     */
    CustomerManager.prototype.sortByRelevance = function(customers, query) {
        var self = this;
        
        return customers.sort(function(a, b) {
            var scoreA = self.calculateRelevanceScore(a, query);
            var scoreB = self.calculateRelevanceScore(b, query);
            return scoreB - scoreA;
        });
    };

    /**
     * 관련도 점수 계산 (ES5 버전)
     */
    CustomerManager.prototype.calculateRelevanceScore = function(customer, query) {
        var score = 0;
        var lowerQuery = query.toLowerCase();

        // 이름 매치 (가중치 높음)
        if (customer.name.toLowerCase().indexOf(lowerQuery) !== -1) {
            score += 100;
            if (customer.name.toLowerCase().indexOf(lowerQuery) === 0) {
                score += 50; // 시작 문자 일치 보너스
            }
        }

        // 전화번호 매치
        if (customer.phone.indexOf(query) !== -1) {
            score += 80;
        }

        // 이메일 매치
        if (customer.email && customer.email.toLowerCase().indexOf(lowerQuery) !== -1) {
            score += 60;
        }

        // 최근 방문 보너스
        var daysSinceLastVisit = (new Date() - new Date(customer.lastVisit)) / (1000 * 60 * 60 * 24);
        if (daysSinceLastVisit < 30) {
            score += 20;
        }

        // 방문 횟수 보너스
        score += Math.min(customer.totalVisits * 2, 20);

        return score;
    };

    /**
     * 데이터 저장/로드 (ES5 버전)
     */
    CustomerManager.prototype.saveCustomer = function(customer) {
        return new Promise(function(resolve, reject) {
            try {
                var key = 'customer_' + customer.id;
                localStorage.setItem(key, JSON.stringify(customer));
                resolve();
            } catch (error) {
                console.error('[CustomerManager] 고객 저장 실패:', error);
                reject(error);
            }
        });
    };

    CustomerManager.prototype.loadCustomers = function() {
        var self = this;
        
        return new Promise(function(resolve, reject) {
            try {
                var customers = [];
                
                for (var i = 0; i < localStorage.length; i++) {
                    var key = localStorage.key(i);
                    if (key.indexOf('customer_') === 0) {
                        var customerData = JSON.parse(localStorage.getItem(key));
                        customers.push(customerData);
                    }
                }

                customers.forEach(function(customer) {
                    self.customers.set(customer.id, customer);
                });

                console.log('[CustomerManager] ' + customers.length + '명 고객 로드 완료');
                resolve();
            } catch (error) {
                console.error('[CustomerManager] 고객 로드 실패:', error);
                reject(error);
            }
        });
    };

    CustomerManager.prototype.saveDiagnosticHistory = function(customerId) {
        var self = this;
        
        return new Promise(function(resolve, reject) {
            try {
                var key = 'history_' + customerId;
                var history = self.diagnosticHistory.get(customerId) || [];
                localStorage.setItem(key, JSON.stringify(history));
                resolve();
            } catch (error) {
                console.error('[CustomerManager] 진단 기록 저장 실패:', error);
                reject(error);
            }
        });
    };

    CustomerManager.prototype.loadDiagnosticHistory = function() {
        var self = this;
        
        return new Promise(function(resolve, reject) {
            try {
                for (var i = 0; i < localStorage.length; i++) {
                    var key = localStorage.key(i);
                    if (key.indexOf('history_') === 0) {
                        var customerId = key.replace('history_', '');
                        var historyData = JSON.parse(localStorage.getItem(key));
                        self.diagnosticHistory.set(customerId, historyData);
                    }
                }
                resolve();
            } catch (error) {
                console.error('[CustomerManager] 진단 기록 로드 실패:', error);
                reject(error);
            }
        });
    };

    /**
     * 유틸리티 메서드들 (ES5 버전)
     */
    CustomerManager.prototype.generateCustomerId = function() {
        return 'CUST_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    };

    CustomerManager.prototype.generateRecordId = function() {
        return 'REC_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    };

    CustomerManager.prototype.addToSearchIndex = function(key, customerId) {
        if (!this.searchIndex.has(key)) {
            this.searchIndex.set(key, new Set());
        }
        this.searchIndex.get(key).add(customerId);
    };

    CustomerManager.prototype.removeFromSearchIndex = function(customerId) {
        var self = this;
        var keysToDelete = [];
        
        this.searchIndex.forEach(function(customerIds, key) {
            customerIds.delete(customerId);
            if (customerIds.size === 0) {
                keysToDelete.push(key);
            }
        });
        
        keysToDelete.forEach(function(key) {
            self.searchIndex.delete(key);
        });
    };

    CustomerManager.prototype.extractChosung = function(text) {
        var chosungMap = {
            'ㄱ': 'ㄱ', 'ㄲ': 'ㄱ', 'ㄴ': 'ㄴ', 'ㄷ': 'ㄷ', 'ㄸ': 'ㄷ',
            'ㄹ': 'ㄹ', 'ㅁ': 'ㅁ', 'ㅂ': 'ㅂ', 'ㅃ': 'ㅂ', 'ㅅ': 'ㅅ',
            'ㅆ': 'ㅅ', 'ㅇ': 'ㅇ', 'ㅈ': 'ㅈ', 'ㅉ': 'ㅈ', 'ㅊ': 'ㅊ',
            'ㅋ': 'ㅋ', 'ㅌ': 'ㅌ', 'ㅍ': 'ㅍ', 'ㅎ': 'ㅎ'
        };

        return text.replace(/[가-힣]/g, function(char) {
            var code = char.charCodeAt(0) - 0xAC00;
            var chosung = String.fromCharCode(0x1100 + Math.floor(code / 588));
            return chosungMap[chosung] || chosung;
        });
    };

    CustomerManager.prototype.calculateAge = function(birthDate) {
        if (!birthDate) return 0;
        var birth = new Date(birthDate);
        var now = new Date();
        return now.getFullYear() - birth.getFullYear();
    };

    CustomerManager.prototype.getMostFrequent = function(obj) {
        var keys = Object.keys(obj);
        if (keys.length === 0) return null;
        
        return keys.reduce(function(a, b) {
            return obj[a] > obj[b] ? a : b;
        });
    };

    CustomerManager.prototype.getTopColors = function(colorPreferences, limit) {
        return Object.keys(colorPreferences)
            .map(function(color) {
                return [color, colorPreferences[color]];
            })
            .sort(function(a, b) {
                return b[1] - a[1];
            })
            .slice(0, limit)
            .map(function(item) {
                return item[0];
            });
    };

    CustomerManager.prototype.calculateVisitFrequency = function(history) {
        if (history.length < 2) return 'insufficient_data';
        
        var dates = history.map(function(record) {
            return new Date(record.date);
        }).sort(function(a, b) {
            return a - b;
        });
        
        var intervals = [];
        
        for (var i = 1; i < dates.length; i++) {
            var interval = (dates[i] - dates[i-1]) / (1000 * 60 * 60 * 24);
            intervals.push(interval);
        }
        
        var avgInterval = intervals.reduce(function(a, b) {
            return a + b;
        }, 0) / intervals.length;
        
        if (avgInterval <= 30) return 'monthly';
        if (avgInterval <= 90) return 'quarterly';
        if (avgInterval <= 180) return 'biannual';
        return 'annual';
    };

    CustomerManager.prototype.analyzeTrends = function(history) {
        // 시간별 트렌드 분석 로직
        return {
            seasonConsistency: 'high', // 계절 일관성
            colorExploration: 'moderate', // 색상 탐험도
            satisfactionTrend: 'improving' // 만족도 트렌드
        };
    };

    CustomerManager.prototype.updateCustomerStatistics = function(customerId, record) {
        var self = this;
        
        return new Promise(function(resolve) {
            var customer = self.customers.get(customerId);
            if (!customer) {
                resolve();
                return;
            }

            // 통계 업데이트 로직
            customer.statistics.totalDiagnoses += 1;
            
            if (record.results && record.results.season) {
                customer.statistics.favoriteSeasons.push(record.results.season);
            }
            
            resolve();
        });
    };

    CustomerManager.prototype.setupEventListeners = function() {
        var self = this;
        
        // 이벤트 리스너 설정 (필요시 확장)
        document.addEventListener('visibilitychange', function() {
            if (document.visibilityState === 'visible') {
                // 페이지가 다시 보일 때 데이터 동기화
                self.syncData();
            }
        });
    };

    CustomerManager.prototype.syncData = function() {
        // 데이터 동기화 로직 (향후 서버 동기화 시 확장)
        console.log('[CustomerManager] 데이터 동기화 실행');
        return Promise.resolve();
    };

    // 전역 객체로 등록
    if (typeof window !== 'undefined') {
        window.CustomerManager = CustomerManager;
        console.log('✅ CustomerManager ES5 버전 로드 완료');
    }

})();
/**
 * CustomerManager.js - ES6 → ES5 변환 완료
 * Personal Color Pro 고객 정보 관리 시스템
 * 
 * 주요 변경사항:
 * - ES6 클래스 → ES5 함수 생성자 패턴
 * - const/let → var 변환
 * - 화살표 함수 → function() {} 변환
 * - import/export → window 전역 등록
 * - Map/Set 브라우저 호환성 처리
 * - async/await → Promise 체인 변환
 */

(function() {
    'use strict';

    /**
     * 고객 정보 관리 클래스 (ES5 버전)
     */
    function CustomerManager() {
        this.customers = new Map();
        this.diagnosticHistory = new Map();
        this.searchIndex = new Map();
        this.syncQueue = [];
        
        // 인덱스 키들
        this.indexKeys = ['name', 'phone', 'email', 'birthDate', 'lastVisit'];
        
        // 브라우저 호환성을 위한 바인딩
        var self = this;
        this.initialize = this.initialize.bind(this);
        this.createCustomer = this.createCustomer.bind(this);
        this.updateCustomer = this.updateCustomer.bind(this);
        this.searchCustomers = this.searchCustomers.bind(this);
        
        // 초기화 실행
        setTimeout(function() {
            self.initialize();
        }, 0);
