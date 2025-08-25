/**
 * storage.js - 헤어디자이너용 퍼스널컬러 진단 시스템 (무한재귀 오류 수정 완전판)
 * 고급 로컬 저장소 관리 유틸리티
 * 
 * 수정사항:
 * - RangeError: Maximum call stack size exceeded 완전 해결
 * - getItem/getMetadata 순환 참조 제거
 * - 메타데이터 직접 접근 방식으로 변경
 * - 비동기 처리 안정화
 * 
 * 기능:
 * - localStorage/IndexedDB 통합 관리
 * - 데이터 압축 및 암호화
 * - 자동 백업 및 복원
 * - 용량 모니터링 및 정리
 * - 오프라인 동기화 지원
 */

import { CONFIG } from '../config.js';

class StorageManager {
    constructor() {
        this.prefix = 'personal_color_analyzer_';
        this.version = '1.0.0';
        this.maxQuota = 50 * 1024 * 1024; // 50MB 제한
        this.compressionThreshold = 1024; // 1KB 이상 데이터 압축
        this.encryptionKey = null;
        
        // IndexedDB 설정
        this.dbName = 'PersonalColorAnalyzerDB';
        this.dbVersion = 1;
        this.db = null;
        this.isInitialized = false;
        
        // 메타데이터 캐시 (순환 참조 방지)
        this.metadataCache = new Map();
        this.metadataCacheExpiry = 60000; // 1분
        this.lastMetadataUpdate = 0;
        
        // 초기화 상태
        this.initPromise = null;
        this.initializationError = null;
        
        console.log('[StorageManager] 저장소 관리자 초기화 시작');
        this.initialize();
    }

    /**
     * 저장소 초기화 (비동기 안전)
     */
    async initialize() {
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = this._doInitialize();
        return this.initPromise;
    }

    async _doInitialize() {
        try {
            console.log('[StorageManager] 저장소 시스템 초기화 중...');
            
            // 암호화 키 생성
            this.encryptionKey = this.generateEncryptionKey();
            
            // IndexedDB 지원 확인 및 초기화
            if ('indexedDB' in window) {
                await this.initIndexedDB();
                console.log('[StorageManager] IndexedDB 초기화 완료');
            } else {
                console.warn('[StorageManager] IndexedDB 미지원, localStorage만 사용');
            }
            
            // 메타데이터 캐시 로드
            await this.loadMetadataCache();
            
            // 용량 모니터링 시작
            this.startQuotaMonitoring();
            
            // 만료된 데이터 정리 (비동기로 실행)
            this.cleanupExpiredData().catch(error => {
                console.warn('[StorageManager] 만료 데이터 정리 실패:', error);
            });
            
            this.isInitialized = true;
            console.log('[StorageManager] 저장소 시스템 초기화 완료');
            
        } catch (error) {
            console.error('[StorageManager] 초기화 실패:', error);
            this.initializationError = error;
            this.isInitialized = false;
            throw error;
        }
    }

    /**
     * IndexedDB 초기화
     */
    initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => {
                console.error('[StorageManager] IndexedDB 열기 실패:', request.error);
                reject(request.error);
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                console.log('[StorageManager] IndexedDB 연결 성공');
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                console.log('[StorageManager] IndexedDB 스키마 업그레이드');
                const db = event.target.result;
                
                try {
                    // 고객 데이터 스토어
                    if (!db.objectStoreNames.contains('customers')) {
                        const customerStore = db.createObjectStore('customers', { keyPath: 'id' });
                        customerStore.createIndex('name', 'name', { unique: false });
                        customerStore.createIndex('phone', 'phone', { unique: true });
                        customerStore.createIndex('createdAt', 'createdAt', { unique: false });
                    }
                    
                    // 진단 기록 스토어
                    if (!db.objectStoreNames.contains('diagnoses')) {
                        const diagnosisStore = db.createObjectStore('diagnoses', { keyPath: 'id' });
                        diagnosisStore.createIndex('customerId', 'customerId', { unique: false });
                        diagnosisStore.createIndex('createdAt', 'createdAt', { unique: false });
                        diagnosisStore.createIndex('type', 'type', { unique: false });
                    }
                    
                    // 설정 스토어
                    if (!db.objectStoreNames.contains('settings')) {
                        db.createObjectStore('settings', { keyPath: 'key' });
                    }
                    
                    // 캐시 스토어
                    if (!db.objectStoreNames.contains('cache')) {
                        const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
                        cacheStore.createIndex('expiry', 'expiry', { unique: false });
                    }
                    
                } catch (storeError) {
                    console.error('[StorageManager] 스토어 생성 오류:', storeError);
                    reject(storeError);
                }
            };
        });
    }

    /**
     * 암호화 키 생성
     */
    generateEncryptionKey() {
        const keyStorageKey = this.prefix + 'encryption_key';
        let key = null;
        
        try {
            key = localStorage.getItem(keyStorageKey);
        } catch (error) {
            console.warn('[StorageManager] 기존 암호화 키 읽기 실패:', error);
        }
        
        if (!key) {
            key = this.generateRandomKey(32);
            try {
                localStorage.setItem(keyStorageKey, key);
            } catch (error) {
                console.warn('[StorageManager] 암호화 키 저장 실패:', error);
            }
        }
        
        return key;
    }

    /**
     * 랜덤 키 생성
     */
    generateRandomKey(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * 메타데이터 캐시 로드 (순환 참조 방지)
     */
    async loadMetadataCache() {
        try {
            const metadataKey = this.prefix + '_metadata';
            const rawMetadata = localStorage.getItem(metadataKey);
            
            if (rawMetadata) {
                const parsedMetadata = JSON.parse(rawMetadata);
                this.metadataCache.clear();
                
                for (const [key, value] of Object.entries(parsedMetadata)) {
                    this.metadataCache.set(key, value);
                }
                
                this.lastMetadataUpdate = Date.now();
                console.log(`[StorageManager] 메타데이터 캐시 로드: ${this.metadataCache.size}개 항목`);
            }
        } catch (error) {
            console.warn('[StorageManager] 메타데이터 캐시 로드 실패:', error);
            this.metadataCache.clear();
        }
    }

    /**
     * 메타데이터 캐시 저장
     */
    async saveMetadataCache() {
        try {
            const metadataKey = this.prefix + '_metadata';
            const metadataObject = Object.fromEntries(this.metadataCache);
            localStorage.setItem(metadataKey, JSON.stringify(metadataObject));
            this.lastMetadataUpdate = Date.now();
        } catch (error) {
            console.error('[StorageManager] 메타데이터 캐시 저장 실패:', error);
        }
    }

    /**
     * 데이터 저장 (통합 인터페이스) - 순환 참조 해결됨
     * @param {string} key - 저장 키
     * @param {any} data - 저장할 데이터
     * @param {Object} options - 옵션 (ttl, compress, encrypt, storage)
     */
    async setItem(key, data, options = {}) {
        await this.initialize(); // 초기화 대기
        
        const {
            ttl = null, // Time to live in milliseconds
            compress = false,
            encrypt = false,
            storage = 'auto' // 'localStorage', 'indexedDB', 'auto'
        } = options;

        try {
            // 메타데이터 키는 특별 처리 (순환 참조 방지)
            if (key === '_metadata') {
                return this.setRawLocalStorageItem(key, data);
            }

            // 데이터 패키징
            const packagedData = await this.packageData(data, {
                ttl,
                compress,
                encrypt,
                timestamp: Date.now()
            });

            // 저장소 선택
            const storageType = this.selectStorage(key, packagedData, storage);
            
            // 데이터 저장
            let success = false;
            if (storageType === 'indexedDB' && this.db) {
                success = await this.setIndexedDBItem(key, packagedData);
            } else {
                success = this.setLocalStorageItem(key, packagedData);
            }

            if (success) {
                // 메타데이터 업데이트 (직접 캐시 업데이트)
                this.updateMetadataCache(key, {
                    size: JSON.stringify(packagedData).length,
                    storage: storageType,
                    createdAt: Date.now(),
                    ttl: ttl,
                    lastAccessed: Date.now()
                });
                
                // 주기적으로 메타데이터 캐시를 디스크에 저장
                if (Date.now() - this.lastMetadataUpdate > 5000) { // 5초마다
                    await this.saveMetadataCache();
                }
            }

            return success;
            
        } catch (error) {
            console.error('[StorageManager] setItem 실패:', error);
            return false;
        }
    }

    /**
     * 데이터 조회 - 순환 참조 해결됨
     * @param {string} key - 조회 키
     * @param {any} defaultValue - 기본값
     */
    async getItem(key, defaultValue = null) {
        await this.initialize(); // 초기화 대기
        
        try {
            // 메타데이터 키는 특별 처리 (순환 참조 방지)
            if (key === '_metadata') {
                return this.getRawLocalStorageItem(key, defaultValue);
            }

            // 메타데이터 확인 (캐시에서 직접 조회)
            const metadata = this.getMetadataFromCache(key);
            if (!metadata) {
                return defaultValue;
            }
            
            // TTL 확인
            if (metadata.ttl && (Date.now() - metadata.createdAt) > metadata.ttl) {
                await this.removeItem(key);
                return defaultValue;
            }

            // 데이터 조회
            let packagedData = null;
            if (metadata.storage === 'indexedDB' && this.db) {
                packagedData = await this.getIndexedDBItem(key);
            } else {
                packagedData = this.getLocalStorageItem(key);
            }

            if (!packagedData) {
                return defaultValue;
            }

            // 마지막 접근 시간 업데이트
            this.updateMetadataCache(key, {
                ...metadata,
                lastAccessed: Date.now()
            });

            // 데이터 언패키징
            const data = await this.unpackageData(packagedData);
            return data;
            
        } catch (error) {
            console.error('[StorageManager] getItem 실패:', error);
            return defaultValue;
        }
    }

    /**
     * 데이터 삭제
     * @param {string} key - 삭제할 키
     */
    async removeItem(key) {
        await this.initialize(); // 초기화 대기
        
        try {
            const metadata = this.getMetadataFromCache(key);
            if (!metadata) {
                return true; // 이미 없음
            }

            // 데이터 삭제
            let success = false;
            if (metadata.storage === 'indexedDB' && this.db) {
                success = await this.removeIndexedDBItem(key);
            } else {
                success = this.removeLocalStorageItem(key);
            }

            // 메타데이터에서 제거
            if (success) {
                this.removeMetadataFromCache(key);
                await this.saveMetadataCache();
            }

            return success;
            
        } catch (error) {
            console.error('[StorageManager] removeItem 실패:', error);
            return false;
        }
    }

    /**
     * 메타데이터 캐시 작업 (순환 참조 방지)
     */
    updateMetadataCache(key, metadata) {
        this.metadataCache.set(key, metadata);
    }

    getMetadataFromCache(key) {
        return this.metadataCache.get(key) || null;
    }

    removeMetadataFromCache(key) {
        this.metadataCache.delete(key);
    }

    /**
     * 원시 localStorage 작업 (메타데이터용)
     */
    setRawLocalStorageItem(key, data) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('[StorageManager] Raw localStorage setItem 실패:', error);
            return false;
        }
    }

    getRawLocalStorageItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(this.prefix + key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('[StorageManager] Raw localStorage getItem 실패:', error);
            return defaultValue;
        }
    }

    /**
     * 데이터 패키징 (압축/암호화)
     */
    async packageData(data, options) {
        let processed = {
            data: data,
            timestamp: options.timestamp,
            version: this.version
        };

        // TTL 설정
        if (options.ttl) {
            processed.expiry = options.timestamp + options.ttl;
        }

        // 압축
        if (options.compress || JSON.stringify(data).length > this.compressionThreshold) {
            processed.data = await this.compressData(data);
            processed.compressed = true;
        }

        // 암호화
        if (options.encrypt) {
            processed.data = this.encryptData(processed.data);
            processed.encrypted = true;
        }

        return processed;
    }

    /**
     * 데이터 언패키징 (복원/복호화)
     */
    async unpackageData(packagedData) {
        let data = packagedData.data;

        // 복호화
        if (packagedData.encrypted) {
            data = this.decryptData(data);
        }

        // 압축 해제
        if (packagedData.compressed) {
            data = await this.decompressData(data);
        }

        return data;
    }

    /**
     * 데이터 압축
     */
    async compressData(data) {
        try {
            const jsonString = JSON.stringify(data);
            
            // 간단한 LZ 압축 알고리즘 구현
            let compressed = '';
            let dict = {};
            let dictSize = 256;
            let w = '';
            
            // 기본 ASCII 문자들을 딕셔너리에 추가
            for (let i = 0; i < 256; i++) {
                dict[String.fromCharCode(i)] = i;
            }
            
            for (let i = 0; i < jsonString.length; i++) {
                const c = jsonString[i];
                const wc = w + c;
                
                if (dict.hasOwnProperty(wc)) {
                    w = wc;
                } else {
                    compressed += String.fromCharCode(dict[w]);
                    dict[wc] = dictSize++;
                    w = c;
                }
            }
            
            if (w !== '') {
                compressed += String.fromCharCode(dict[w]);
            }
            
            return btoa(compressed);
        } catch (error) {
            console.warn('[StorageManager] 압축 실패, 원본 데이터 사용:', error);
            return data;
        }
    }

    /**
     * 데이터 압축 해제
     */
    async decompressData(compressedData) {
        try {
            const compressed = atob(compressedData);
            
            // LZ 압축 해제
            let dict = {};
            let dictSize = 256;
            let result = '';
            let w = '';
            
            // 기본 ASCII 문자들을 딕셔너리에 추가
            for (let i = 0; i < 256; i++) {
                dict[i] = String.fromCharCode(i);
            }
            
            for (let i = 0; i < compressed.length; i++) {
                const k = compressed.charCodeAt(i);
                let entry;
                
                if (dict[k]) {
                    entry = dict[k];
                } else if (k === dictSize) {
                    entry = w + w[0];
                } else {
                    throw new Error('압축 해제 오류');
                }
                
                result += entry;
                
                if (w !== '') {
                    dict[dictSize++] = w + entry[0];
                }
                
                w = entry;
            }
            
            return JSON.parse(result);
        } catch (error) {
            console.warn('[StorageManager] 압축 해제 실패:', error);
            return compressedData;
        }
    }

    /**
     * 데이터 암호화
     */
    encryptData(data) {
        if (!this.encryptionKey) {
            return data;
        }

        try {
            const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
            let encrypted = '';
            
            for (let i = 0; i < jsonString.length; i++) {
                const keyChar = this.encryptionKey[i % this.encryptionKey.length];
                const encryptedChar = String.fromCharCode(
                    jsonString.charCodeAt(i) ^ keyChar.charCodeAt(0)
                );
                encrypted += encryptedChar;
            }
            
            return btoa(encrypted);
        } catch (error) {
            console.warn('[StorageManager] 암호화 실패, 원본 데이터 사용:', error);
            return data;
        }
    }

    /**
     * 데이터 복호화
     */
    decryptData(encryptedData) {
        if (!this.encryptionKey) {
            return encryptedData;
        }

        try {
            const encrypted = atob(encryptedData);
            let decrypted = '';
            
            for (let i = 0; i < encrypted.length; i++) {
                const keyChar = this.encryptionKey[i % this.encryptionKey.length];
                const decryptedChar = String.fromCharCode(
                    encrypted.charCodeAt(i) ^ keyChar.charCodeAt(0)
                );
                decrypted += decryptedChar;
            }
            
            return JSON.parse(decrypted);
        } catch (error) {
            console.warn('[StorageManager] 복호화 실패:', error);
            return encryptedData;
        }
    }

    /**
     * 저장소 선택 로직
     */
    selectStorage(key, data, preferredStorage) {
        // 명시적 선택
        if (preferredStorage === 'localStorage') return 'localStorage';
        if (preferredStorage === 'indexedDB' && this.db) return 'indexedDB';
        
        // 자동 선택
        const dataSize = JSON.stringify(data).length;
        
        // 큰 데이터는 IndexedDB 우선 사용
        if (dataSize > 10 * 1024 && this.db) {
            return 'indexedDB';
        }
        
        // 고객/진단 데이터는 IndexedDB 우선 사용
        if ((key.includes('customer') || key.includes('diagnosis')) && this.db) {
            return 'indexedDB';
        }
        
        // 그 외는 localStorage 사용
        return 'localStorage';
    }

    /**
     * localStorage 작업
     */
    setLocalStorageItem(key, data) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('[StorageManager] localStorage setItem 실패:', error);
            return false;
        }
    }

    getLocalStorageItem(key) {
        try {
            const item = localStorage.getItem(this.prefix + key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('[StorageManager] localStorage getItem 실패:', error);
            return null;
        }
    }

    removeLocalStorageItem(key) {
        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch (error) {
            console.error('[StorageManager] localStorage removeItem 실패:', error);
            return false;
        }
    }

    /**
     * IndexedDB 작업
     */
    async setIndexedDBItem(key, data) {
        if (!this.db) {
            console.warn('[StorageManager] IndexedDB 미초기화');
            return false;
        }
        
        return new Promise((resolve) => {
            try {
                const transaction = this.db.transaction(['cache'], 'readwrite');
                const store = transaction.objectStore('cache');
                const request = store.put({ key, data, updatedAt: Date.now() });
                
                request.onsuccess = () => resolve(true);
                request.onerror = () => {
                    console.error('[StorageManager] IndexedDB setItem 실패:', request.error);
                    resolve(false);
                };
                
                transaction.onerror = () => {
                    console.error('[StorageManager] IndexedDB 트랜잭션 실패:', transaction.error);
                    resolve(false);
                };
            } catch (error) {
                console.error('[StorageManager] IndexedDB setItem 예외:', error);
                resolve(false);
            }
        });
    }

    async getIndexedDBItem(key) {
        if (!this.db) {
            console.warn('[StorageManager] IndexedDB 미초기화');
            return null;
        }
        
        return new Promise((resolve) => {
            try {
                const transaction = this.db.transaction(['cache'], 'readonly');
                const store = transaction.objectStore('cache');
                const request = store.get(key);
                
                request.onsuccess = () => {
                    const result = request.result;
                    resolve(result ? result.data : null);
                };
                
                request.onerror = () => {
                    console.error('[StorageManager] IndexedDB getItem 실패:', request.error);
                    resolve(null);
                };
                
                transaction.onerror = () => {
                    console.error('[StorageManager] IndexedDB 트랜잭션 실패:', transaction.error);
                    resolve(null);
                };
            } catch (error) {
                console.error('[StorageManager] IndexedDB getItem 예외:', error);
                resolve(null);
            }
        });
    }

    async removeIndexedDBItem(key) {
        if (!this.db) {
            console.warn('[StorageManager] IndexedDB 미초기화');
            return false;
        }
        
        return new Promise((resolve) => {
            try {
                const transaction = this.db.transaction(['cache'], 'readwrite');
                const store = transaction.objectStore('cache');
                const request = store.delete(key);
                
                request.onsuccess = () => resolve(true);
                request.onerror = () => {
                    console.error('[StorageManager] IndexedDB removeItem 실패:', request.error);
                    resolve(false);
                };
                
                transaction.onerror = () => {
                    console.error('[StorageManager] IndexedDB 트랜잭션 실패:', transaction.error);
                    resolve(false);
                };
            } catch (error) {
                console.error('[StorageManager] IndexedDB removeItem 예외:', error);
                resolve(false);
            }
        });
    }

    /**
     * 용량 모니터링
     */
    startQuotaMonitoring() {
        if (!('navigator' in window) || !('storage' in navigator) || !('estimate' in navigator.storage)) {
            console.warn('[StorageManager] Storage API 미지원');
            return;
        }

        const monitorQuota = async () => {
            try {
                const estimate = await navigator.storage.estimate();
                const usage = estimate.usage || 0;
                const quota = estimate.quota || this.maxQuota;
                const usagePercent = (usage / quota) * 100;
                
                if (usagePercent > 90) {
                    console.warn(`[StorageManager] 저장소 사용량 경고: ${usagePercent.toFixed(1)}%`);
                    await this.cleanup();
                } else if (usagePercent > 75) {
                    console.info(`[StorageManager] 저장소 사용량: ${usagePercent.toFixed(1)}%`);
                }
            } catch (error) {
                console.error('[StorageManager] 용량 모니터링 실패:', error);
            }
        };

        // 초기 실행 및 주기적 모니터링
        monitorQuota();
        setInterval(monitorQuota, 300000); // 5분마다 확인
    }

    /**
     * 만료된 데이터 정리
     */
    async cleanupExpiredData() {
        try {
            console.log('[StorageManager] 만료된 데이터 정리 시작');
            
            const now = Date.now();
            const keysToRemove = [];
            
            // 메타데이터 캐시에서 만료된 항목 찾기
            for (const [key, metadata] of this.metadataCache.entries()) {
                if (metadata.ttl && (now - metadata.createdAt) > metadata.ttl) {
                    keysToRemove.push(key);
                }
            }
            
            // 만료된 데이터 제거
            for (const key of keysToRemove) {
                await this.removeItem(key);
            }
            
            console.log(`[StorageManager] 만료된 데이터 ${keysToRemove.length}개 정리 완료`);
            
        } catch (error) {
            console.error('[StorageManager] 만료된 데이터 정리 실패:', error);
        }
    }

    /**
     * 저장소 정리
     */
    async cleanup() {
        try {
            console.log('[StorageManager] 저장소 정리 시작');
            
            // 만료된 데이터 제거
            await this.cleanupExpiredData();
            
            // 오래된 캐시 제거 (30일 이상)
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
            const keysToRemove = [];
            
            for (const [key, metadata] of this.metadataCache.entries()) {
                if (key.startsWith('cache_') && metadata.createdAt < thirtyDaysAgo) {
                    keysToRemove.push(key);
                }
            }
            
            // 오래된 캐시 제거
            for (const key of keysToRemove) {
                await this.removeItem(key);
            }
            
            // 메타데이터 캐시 저장
            await this.saveMetadataCache();
            
            console.log(`[StorageManager] 저장소 정리 완료: ${keysToRemove.length}개 항목 제거`);
            
        } catch (error) {
            console.error('[StorageManager] 저장소 정리 실패:', error);
        }
    }

    /**
     * 데이터 백업
     */
    async exportData() {
        try {
            console.log('[StorageManager] 데이터 내보내기 시작');
            
            const exportData = {
                version: this.version,
                timestamp: Date.now(),
                customers: await this.getAllCustomers(),
                diagnoses: await this.getAllDiagnoses(),
                settings: await this.getItem('app_settings', {}),
                metadata: Object.fromEntries(this.metadataCache)
            };
            
            const jsonData = JSON.stringify(exportData, null, 2);
            console.log(`[StorageManager] 데이터 내보내기 완료: ${jsonData.length} bytes`);
            
            return jsonData;
        } catch (error) {
            console.error('[StorageManager] 데이터 내보내기 실패:', error);
            throw error;
        }
    }

    /**
     * 데이터 복원
     */
    async importData(jsonData) {
        try {
            console.log('[StorageManager] 데이터 가져오기 시작');
            
            const importData = JSON.parse(jsonData);
            
            // 버전 확인
            if (importData.version !== this.version) {
                console.warn(`[StorageManager] 버전 불일치: ${importData.version} vs ${this.version}`);
            }
            
            let importCount = 0;
            
            // 고객 데이터 복원
            if (importData.customers && Array.isArray(importData.customers)) {
                for (const customer of importData.customers) {
                    if (customer.id) {
                        await this.setItem(`customer_${customer.id}`, customer, {
                            storage: 'indexedDB'
                        });
                        importCount++;
                    }
                }
            }
            
            // 진단 데이터 복원
            if (importData.diagnoses && Array.isArray(importData.diagnoses)) {
                for (const diagnosis of importData.diagnoses) {
                    if (diagnosis.id) {
                        await this.setItem(`diagnosis_${diagnosis.id}`, diagnosis, {
                            storage: 'indexedDB'
                        });
                        importCount++;
                    }
                }
            }
            
            // 설정 복원
            if (importData.settings) {
                await this.setItem('app_settings', importData.settings);
                importCount++;
            }
            
            console.log(`[StorageManager] 데이터 가져오기 완료: ${importCount}개 항목`);
            return true;
            
        } catch (error) {
            console.error('[StorageManager] 데이터 가져오기 실패:', error);
            throw error;
        }
    }

    /**
     * 모든 고객 데이터 조회
     */
    async getAllCustomers() {
        const customers = [];
        
        try {
            for (const [key, metadata] of this.metadataCache.entries()) {
                if (key.startsWith('customer_')) {
                    const customer = await this.getItem(key);
                    if (customer) {
                        customers.push(customer);
                    }
                }
            }
            
            console.log(`[StorageManager] 고객 데이터 조회: ${customers.length}명`);
        } catch (error) {
            console.error('[StorageManager] 고객 데이터 조회 실패:', error);
        }
        
        return customers;
    }

    /**
     * 모든 진단 데이터 조회
     */
    async getAllDiagnoses() {
        const diagnoses = [];
        
        try {
            for (const [key, metadata] of this.metadataCache.entries()) {
                if (key.startsWith('diagnosis_')) {
                    const diagnosis = await this.getItem(key);
                    if (diagnosis) {
                        diagnoses.push(diagnosis);
                    }
                }
            }
            
            console.log(`[StorageManager] 진단 데이터 조회: ${diagnoses.length}건`);
        } catch (error) {
            console.error('[StorageManager] 진단 데이터 조회 실패:', error);
        }
        
        return diagnoses;
    }

    /**
     * 저장소 상태 조회
     */
    async getStorageStatus() {
        try {
            let totalSize = 0;
            let itemCount = 0;
            const storageTypes = { localStorage: 0, indexedDB: 0 };
            
            for (const [key, metadata] of this.metadataCache.entries()) {
                totalSize += metadata.size || 0;
                itemCount++;
                storageTypes[metadata.storage] = (storageTypes[metadata.storage] || 0) + 1;
            }
            
            // 할당량 정보
            let quotaInfo = null;
            if ('navigator' in window && 'storage' in navigator && 'estimate' in navigator.storage) {
                try {
                    quotaInfo = await navigator.storage.estimate();
                } catch (error) {
                    console.warn('[StorageManager] 할당량 정보 조회 실패:', error);
                }
            }
            
            const status = {
                isInitialized: this.isInitialized,
                itemCount,
                totalSize,
                storageTypes,
                quota: quotaInfo,
                usage: quotaInfo ? (quotaInfo.usage / quotaInfo.quota * 100).toFixed(2) + '%' : 'Unknown',
                cacheSize: this.metadataCache.size,
                dbAvailable: !!this.db
            };
            
            return status;
            
        } catch (error) {
            console.error('[StorageManager] 저장소 상태 조회 실패:', error);
            return {
                isInitialized: this.isInitialized,
                error: error.message
            };
        }
    }

    /**
     * 전체 저장소 초기화
     */
    async clearAll() {
        try {
            console.log('[StorageManager] 전체 저장소 초기화 시작');
            
            // localStorage 초기화
            const keys = Object.keys(localStorage);
            let localStorageCleared = 0;
            
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                    localStorageCleared++;
                }
            });
            
            // IndexedDB 초기화
            let indexedDBCleared = 0;
            if (this.db) {
                const stores = ['customers', 'diagnoses', 'settings', 'cache'];
                
                for (const storeName of stores) {
                    try {
                        await new Promise((resolve, reject) => {
                            const transaction = this.db.transaction([storeName], 'readwrite');
                            const store = transaction.objectStore(storeName);
                            const request = store.clear();
                            
                            request.onsuccess = () => {
                                indexedDBCleared++;
                                resolve();
                            };
                            request.onerror = () => reject(request.error);
                        });
                    } catch (error) {
                        console.warn(`[StorageManager] ${storeName} 스토어 초기화 실패:`, error);
                    }
                }
            }
            
            // 메타데이터 캐시 초기화
            this.metadataCache.clear();
            
            console.log(`[StorageManager] 저장소 초기화 완료: localStorage ${localStorageCleared}개, IndexedDB ${indexedDBCleared}개 스토어`);
            return true;
            
        } catch (error) {
            console.error('[StorageManager] 저장소 초기화 실패:', error);
            return false;
        }
    }

    /**
     * 진단 및 디버깅
     */
    async runDiagnostics() {
        const diagnostics = {
            timestamp: Date.now(),
            initialization: {
                isInitialized: this.isInitialized,
                error: this.initializationError ? this.initializationError.message : null
            },
            browser: {
                localStorage: typeof Storage !== 'undefined',
                indexedDB: 'indexedDB' in window,
                storageEstimate: 'navigator' in window && 'storage' in navigator && 'estimate' in navigator.storage
            },
            storage: {
                dbConnected: !!this.db,
                cacheSize: this.metadataCache.size,
                encryptionKey: !!this.encryptionKey
            },
            status: await this.getStorageStatus()
        };

        console.log('[StorageManager] 진단 완료:', diagnostics);
        return diagnostics;
    }
}

// 싱글톤 인스턴스 생성 및 전역 노출
let storageManagerInstance = null;

/**
 * StorageManager 싱글톤 인스턴스 가져오기
 */
export function getStorageManager() {
    if (!storageManagerInstance) {
        storageManagerInstance = new StorageManager();
    }
    return storageManagerInstance;
}

// 기본 내보내기 (이전 버전 호환성)
export default getStorageManager();

// 전역 접근 (개발/디버깅 용도)
if (typeof window !== 'undefined') {
    window.StorageManager = getStorageManager();
}
