/**
 * 헤어디자이너용 퍼스널컬러 진단 - 고객 정보 관리 시스템
 * 고객 데이터 저장, 검색, 관리 및 과거 진단 기록 추적
 * 
 * 주요 기능:
 * - 고객 프로필 생성/수정/삭제
 * - 진단 기록 히스토리 관리
 * - 고객 검색 및 필터링
 * - 데이터 동기화 및 백업
 * - 태블릿 최적화 UI
 */

import { CONFIG } from '../config.js';

class CustomerManager {
    constructor() {
        this.customers = new Map();
        this.diagnosticHistory = new Map();
        this.searchIndex = new Map();
        this.syncQueue = [];
        
        // 인덱스 키들
        this.indexKeys = ['name', 'phone', 'email', 'birthDate', 'lastVisit'];
        
        // 초기화
        this.initialize();
    }

    async initialize() {
        console.log('[CustomerManager] 초기화 중...');
        
        try {
            await this.loadCustomers();
            await this.loadDiagnosticHistory();
            this.buildSearchIndex();
            this.setupEventListeners();
            
            console.log(`[CustomerManager] 초기화 완료: ${this.customers.size}명 고객 로드`);
        } catch (error) {
            console.error('[CustomerManager] 초기화 실패:', error);
        }
    }

    /**
     * 고객 생성
     */
    async createCustomer(customerData) {
        try {
            // 데이터 검증
            const validationResult = this.validateCustomerData(customerData);
            if (!validationResult.isValid) {
                throw new Error(`고객 정보 오류: ${validationResult.errors.join(', ')}`);
            }

            // 고객 ID 생성
            const customerId = this.generateCustomerId();
            
            // 고객 객체 생성
            const customer = {
                id: customerId,
                ...customerData,
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
            this.customers.set(customerId, customer);
            await this.saveCustomer(customer);
            
            // 검색 인덱스 업데이트
            this.updateSearchIndex(customer);
            
            console.log(`[CustomerManager] 새 고객 생성: ${customer.name} (${customerId})`);
            return customer;
            
        } catch (error) {
            console.error('[CustomerManager] 고객 생성 실패:', error);
            throw error;
        }
    }

    /**
     * 고객 정보 업데이트
     */
    async updateCustomer(customerId, updateData) {
        try {
            const customer = this.customers.get(customerId);
            if (!customer) {
                throw new Error(`고객을 찾을 수 없습니다: ${customerId}`);
            }

            // 업데이트된 데이터 검증
            const mergedData = { ...customer, ...updateData };
            const validationResult = this.validateCustomerData(mergedData);
            if (!validationResult.isValid) {
                throw new Error(`업데이트 데이터 오류: ${validationResult.errors.join(', ')}`);
            }

            // 업데이트
            const updatedCustomer = {
                ...customer,
                ...updateData,
                updatedAt: new Date().toISOString()
            };

            this.customers.set(customerId, updatedCustomer);
            await this.saveCustomer(updatedCustomer);
            
            // 검색 인덱스 업데이트
            this.updateSearchIndex(updatedCustomer);
            
            console.log(`[CustomerManager] 고객 정보 업데이트: ${updatedCustomer.name}`);
            return updatedCustomer;
            
        } catch (error) {
            console.error('[CustomerManager] 고객 업데이트 실패:', error);
            throw error;
        }
    }

    /**
     * 고객 검색
     */
    searchCustomers(query, filters = {}) {
        try {
            const results = [];
            const searchQuery = query.toLowerCase().trim();

            // 빈 쿼리인 경우 전체 반환 (필터 적용)
            if (!searchQuery) {
                return this.applyFilters(Array.from(this.customers.values()), filters);
            }

            // 검색 인덱스에서 검색
            for (const [key, customerIds] of this.searchIndex.entries()) {
                if (key.includes(searchQuery)) {
                    customerIds.forEach(id => {
                        const customer = this.customers.get(id);
                        if (customer && !results.find(c => c.id === id)) {
                            results.push(customer);
                        }
                    });
                }
            }

            // 필터 적용
            const filteredResults = this.applyFilters(results, filters);

            // 관련도별 정렬
            return this.sortByRelevance(filteredResults, searchQuery);
            
        } catch (error) {
            console.error('[CustomerManager] 검색 실패:', error);
            return [];
        }
    }

    /**
     * 진단 기록 추가
     */
    async addDiagnosticRecord(customerId, diagnosticData) {
        try {
            const customer = this.customers.get(customerId);
            if (!customer) {
                throw new Error(`고객을 찾을 수 없습니다: ${customerId}`);
            }

            const recordId = this.generateRecordId();
            const record = {
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
            if (!this.diagnosticHistory.has(customerId)) {
                this.diagnosticHistory.set(customerId, []);
            }
            this.diagnosticHistory.get(customerId).push(record);

            // 고객 통계 업데이트
            await this.updateCustomerStatistics(customerId, record);

            // 고객 마지막 방문일 업데이트
            await this.updateCustomer(customerId, {
                lastVisit: record.date,
                totalVisits: customer.totalVisits + 1
            });

            await this.saveDiagnosticHistory(customerId);
            
            console.log(`[CustomerManager] 진단 기록 추가: ${customer.name} - ${record.type}`);
            return record;
            
        } catch (error) {
            console.error('[CustomerManager] 진단 기록 추가 실패:', error);
            throw error;
        }
    }

    /**
     * 고객 진단 히스토리 조회
     */
    getCustomerHistory(customerId, limit = 10) {
        const history = this.diagnosticHistory.get(customerId) || [];
        return history
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    }

    /**
     * 고객 통계 분석
     */
    getCustomerInsights(customerId) {
        try {
            const customer = this.customers.get(customerId);
            const history = this.diagnosticHistory.get(customerId) || [];

            if (!customer || history.length === 0) {
                return null;
            }

            // 계절 분포 분석
            const seasonCount = {};
            const colorPreferences = {};
            const satisfactionScores = [];
            
            history.forEach(record => {
                if (record.results && record.results.season) {
                    seasonCount[record.results.season] = (seasonCount[record.results.season] || 0) + 1;
                }
                
                if (record.results && record.results.colors) {
                    record.results.colors.forEach(color => {
                        colorPreferences[color] = (colorPreferences[color] || 0) + 1;
                    });
                }
                
                if (record.satisfaction) {
                    satisfactionScores.push(record.satisfaction);
                }
            });

            // 인사이트 계산
            const insights = {
                totalDiagnoses: history.length,
                dominantSeason: this.getMostFrequent(seasonCount),
                favoriteColors: this.getTopColors(colorPreferences, 5),
                averageSatisfaction: satisfactionScores.length > 0 
                    ? (satisfactionScores.reduce((a, b) => a + b, 0) / satisfactionScores.length).toFixed(1)
                    : 'N/A',
                visitFrequency: this.calculateVisitFrequency(history),
                lastDiagnosis: history[history.length - 1]?.date || null,
                trends: this.analyzeTrends(history)
            };

            return insights;
            
        } catch (error) {
            console.error('[CustomerManager] 통계 분석 실패:', error);
            return null;
        }
    }

    /**
     * 고객 데이터 검증
     */
    validateCustomerData(data) {
        const errors = [];

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
            const birthDate = new Date(data.birthDate);
            const now = new Date();
            const age = now.getFullYear() - birthDate.getFullYear();
            
            if (isNaN(birthDate.getTime()) || age < 0 || age > 120) {
                errors.push('올바른 생년월일을 입력해주세요');
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * 검색 인덱스 구축
     */
    buildSearchIndex() {
        this.searchIndex.clear();
        
        for (const customer of this.customers.values()) {
            this.updateSearchIndex(customer);
        }
        
        console.log(`[CustomerManager] 검색 인덱스 구축 완료: ${this.searchIndex.size}개 키`);
    }

    /**
     * 검색 인덱스 업데이트
     */
    updateSearchIndex(customer) {
        // 기존 인덱스에서 고객 제거
        this.removeFromSearchIndex(customer.id);

        // 새 인덱스 추가
        const searchableFields = [
            customer.name,
            customer.phone,
            customer.email,
            customer.preferences?.notes || ''
        ].filter(Boolean);

        searchableFields.forEach(field => {
            const normalized = field.toLowerCase();
            
            // 전체 문자열
            this.addToSearchIndex(normalized, customer.id);
            
            // 단어별 분리
            normalized.split(/\s+/).forEach(word => {
                if (word.length > 1) {
                    this.addToSearchIndex(word, customer.id);
                }
            });

            // 초성 검색 (한글)
            if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(normalized)) {
                const chosung = this.extractChosung(normalized);
                this.addToSearchIndex(chosung, customer.id);
            }
        });
    }

    /**
     * 필터 적용
     */
    applyFilters(customers, filters) {
        return customers.filter(customer => {
            // 연령 필터
            if (filters.ageRange) {
                const age = this.calculateAge(customer.birthDate);
                const [minAge, maxAge] = filters.ageRange;
                if (age < minAge || age > maxAge) return false;
            }

            // 방문 기간 필터
            if (filters.visitPeriod) {
                const lastVisit = new Date(customer.lastVisit);
                const now = new Date();
                const daysDiff = (now - lastVisit) / (1000 * 60 * 60 * 24);
                
                switch (filters.visitPeriod) {
                    case 'week': return daysDiff <= 7;
                    case 'month': return daysDiff <= 30;
                    case 'quarter': return daysDiff <= 90;
                    case 'year': return daysDiff <= 365;
                }
            }

            // 진단 횟수 필터
            if (filters.diagnosisCount) {
                const history = this.diagnosticHistory.get(customer.id) || [];
                const [min, max] = filters.diagnosisCount;
                if (history.length < min || history.length > max) return false;
            }

            return true;
        });
    }

    /**
     * 관련도별 정렬
     */
    sortByRelevance(customers, query) {
        return customers.sort((a, b) => {
            const scoreA = this.calculateRelevanceScore(a, query);
            const scoreB = this.calculateRelevanceScore(b, query);
            return scoreB - scoreA;
        });
    }

    /**
     * 관련도 점수 계산
     */
    calculateRelevanceScore(customer, query) {
        let score = 0;
        const lowerQuery = query.toLowerCase();

        // 이름 매치 (가중치 높음)
        if (customer.name.toLowerCase().includes(lowerQuery)) {
            score += 100;
            if (customer.name.toLowerCase().startsWith(lowerQuery)) {
                score += 50; // 시작 문자 일치 보너스
            }
        }

        // 전화번호 매치
        if (customer.phone.includes(query)) {
            score += 80;
        }

        // 이메일 매치
        if (customer.email && customer.email.toLowerCase().includes(lowerQuery)) {
            score += 60;
        }

        // 최근 방문 보너스
        const daysSinceLastVisit = (new Date() - new Date(customer.lastVisit)) / (1000 * 60 * 60 * 24);
        if (daysSinceLastVisit < 30) {
            score += 20;
        }

        // 방문 횟수 보너스
        score += Math.min(customer.totalVisits * 2, 20);

        return score;
    }

    /**
     * 데이터 저장/로드
     */
    async saveCustomer(customer) {
        try {
            const key = `customer_${customer.id}`;
            localStorage.setItem(key, JSON.stringify(customer));
        } catch (error) {
            console.error('[CustomerManager] 고객 저장 실패:', error);
        }
    }

    async loadCustomers() {
        try {
            const customers = [];
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('customer_')) {
                    const customerData = JSON.parse(localStorage.getItem(key));
                    customers.push(customerData);
                }
            }

            customers.forEach(customer => {
                this.customers.set(customer.id, customer);
            });

            console.log(`[CustomerManager] ${customers.length}명 고객 로드 완료`);
        } catch (error) {
            console.error('[CustomerManager] 고객 로드 실패:', error);
        }
    }

    async saveDiagnosticHistory(customerId) {
        try {
            const key = `history_${customerId}`;
            const history = this.diagnosticHistory.get(customerId) || [];
            localStorage.setItem(key, JSON.stringify(history));
        } catch (error) {
            console.error('[CustomerManager] 진단 기록 저장 실패:', error);
        }
    }

    async loadDiagnosticHistory() {
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('history_')) {
                    const customerId = key.replace('history_', '');
                    const historyData = JSON.parse(localStorage.getItem(key));
                    this.diagnosticHistory.set(customerId, historyData);
                }
            }
        } catch (error) {
            console.error('[CustomerManager] 진단 기록 로드 실패:', error);
        }
    }

    /**
     * 유틸리티 메서드들
     */
    generateCustomerId() {
        return 'CUST_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    generateRecordId() {
        return 'REC_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    addToSearchIndex(key, customerId) {
        if (!this.searchIndex.has(key)) {
            this.searchIndex.set(key, new Set());
        }
        this.searchIndex.get(key).add(customerId);
    }

    removeFromSearchIndex(customerId) {
        for (const [key, customerIds] of this.searchIndex.entries()) {
            customerIds.delete(customerId);
            if (customerIds.size === 0) {
                this.searchIndex.delete(key);
            }
        }
    }

    extractChosung(text) {
        const chosungMap = {
            'ㄱ': 'ㄱ', 'ㄲ': 'ㄱ', 'ㄴ': 'ㄴ', 'ㄷ': 'ㄷ', 'ㄸ': 'ㄷ',
            'ㄹ': 'ㄹ', 'ㅁ': 'ㅁ', 'ㅂ': 'ㅂ', 'ㅃ': 'ㅂ', 'ㅅ': 'ㅅ',
            'ㅆ': 'ㅅ', 'ㅇ': 'ㅇ', 'ㅈ': 'ㅈ', 'ㅉ': 'ㅈ', 'ㅊ': 'ㅊ',
            'ㅋ': 'ㅋ', 'ㅌ': 'ㅌ', 'ㅍ': 'ㅍ', 'ㅎ': 'ㅎ'
        };

        return text.replace(/[가-힣]/g, (char) => {
            const code = char.charCodeAt(0) - 0xAC00;
            const chosung = String.fromCharCode(0x1100 + Math.floor(code / 588));
            return chosungMap[chosung] || chosung;
        });
    }

    calculateAge(birthDate) {
        if (!birthDate) return 0;
        const birth = new Date(birthDate);
        const now = new Date();
        return now.getFullYear() - birth.getFullYear();
    }

    getMostFrequent(obj) {
        return Object.keys(obj).reduce((a, b) => obj[a] > obj[b] ? a : b, null);
    }

    getTopColors(colorPreferences, limit) {
        return Object.entries(colorPreferences)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit)
            .map(([color]) => color);
    }

    calculateVisitFrequency(history) {
        if (history.length < 2) return 'insufficient_data';
        
        const dates = history.map(record => new Date(record.date)).sort();
        const intervals = [];
        
        for (let i = 1; i < dates.length; i++) {
            const interval = (dates[i] - dates[i-1]) / (1000 * 60 * 60 * 24);
            intervals.push(interval);
        }
        
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        
        if (avgInterval <= 30) return 'monthly';
        if (avgInterval <= 90) return 'quarterly';
        if (avgInterval <= 180) return 'biannual';
        return 'annual';
    }

    analyzeTrends(history) {
        // 시간별 트렌드 분석 로직
        return {
            seasonConsistency: 'high', // 계절 일관성
            colorExploration: 'moderate', // 색상 탐험도
            satisfactionTrend: 'improving' // 만족도 트렌드
        };
    }

    async updateCustomerStatistics(customerId, record) {
        const customer = this.customers.get(customerId);
        if (!customer) return;

        // 통계 업데이트 로직
        customer.statistics.totalDiagnoses += 1;
        
        if (record.results && record.results.season) {
            customer.statistics.favoriteSeasons.push(record.results.season);
        }
    }

    setupEventListeners() {
        // 이벤트 리스너 설정 (필요시 확장)
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                // 페이지가 다시 보일 때 데이터 동기화
                this.syncData();
            }
        });
    }

    async syncData() {
        // 데이터 동기화 로직 (향후 서버 동기화 시 확장)
        console.log('[CustomerManager] 데이터 동기화 실행');
    }
}

export default CustomerManager;
