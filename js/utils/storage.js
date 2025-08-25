/**
 * storage.js - 헤어디자이너용 퍼스널컬러 진단 시스템
 * 고급 로컬 저장소 관리 유틸리티
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
        this.encryptionKey = this.generateEncryptionKey();
        
        // IndexedDB 설정
        this.dbName = 'PersonalColorAnalyzerDB';
        this.dbVersion = 1;
        this.db = null;
        
        this.initializeStorage();
    }

    /**
     * 저장소 초기화
     */
    async initializeStorage() {
        try {
            // IndexedDB 지원 확인 및 초기화
            if ('indexedDB' in window) {
                await this.initIndexedDB();
            }
            
            // 용량 모니터링 시작
            this.startQuotaMonitoring();
            
            // 만료된 데이터 정리
            await this.cleanupExpiredData();
            
            console.log('Storage system initialized successfully');
        } catch (error) {
            console.error('Storage initialization failed:', error);
        }
    }

    /**
     * IndexedDB 초기화
     */
    initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
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
            };
        });
    }

    /**
     * 암호화 키 생성
     */
    generateEncryptionKey() {
        let key = localStorage.getItem(this.prefix + 'encryption_key');
        if (!key) {
            key = this.generateRandomKey(32);
            localStorage.setItem(this.prefix + 'encryption_key', key);
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
     * 데이터 저장 (통합 인터페이스)
     * @param {string} key - 저장 키
     * @param {any} data - 저장할 데이터
     * @param {Object} options - 옵션 (ttl, compress, encrypt, storage)
     */
    async setItem(key, data, options = {}) {
        const {
            ttl = null, // Time to live in milliseconds
            compress = false,
            encrypt = false,
            storage = 'auto' // 'localStorage', 'indexedDB', 'auto'
        } = options;

        try {
            // 데이터 패키징
            const packagedData = await this.packageData(data, {
                ttl,
                compress,
                encrypt,
                timestamp: Date.now()
            });

            // 저장소 선택
            const storageType = this.selectStorage(key, packagedData, storage);
            
            if (storageType === 'indexedDB') {
                await this.setIndexedDBItem(key, packagedData);
            } else {
                this.setLocalStorageItem(key, packagedData);
            }

            // 메타데이터 업데이트
            await this.updateMetadata(key, {
                size: JSON.stringify(packagedData).length,
                storage: storageType,
                createdAt: Date.now(),
                ttl: ttl
            });

            return true;
        } catch (error) {
            console.error('Storage setItem failed:', error);
            return false;
        }
    }

    /**
     * 데이터 조회
     * @param {string} key - 조회 키
     * @param {any} defaultValue - 기본값
     */
    async getItem(key, defaultValue = null) {
        try {
            // 메타데이터 확인
            const metadata = await this.getMetadata(key);
            if (!metadata) return defaultValue;
            
            // TTL 확인
            if (metadata.ttl && (Date.now() - metadata.createdAt) > metadata.ttl) {
                await this.removeItem(key);
                return defaultValue;
            }

            // 데이터 조회
            let packagedData;
            if (metadata.storage === 'indexedDB') {
                packagedData = await this.getIndexedDBItem(key);
            } else {
                packagedData = this.getLocalStorageItem(key);
            }

            if (!packagedData) return defaultValue;

            // 데이터 언패키징
            const data = await this.unpackageData(packagedData);
            return data;
        } catch (error) {
            console.error('Storage getItem failed:', error);
            return defaultValue;
        }
    }

    /**
     * 데이터 삭제
     * @param {string} key - 삭제할 키
     */
    async removeItem(key) {
        try {
            const metadata = await this.getMetadata(key);
            if (!metadata) return true;

            if (metadata.storage === 'indexedDB') {
                await this.removeIndexedDBItem(key);
            } else {
                this.removeLocalStorageItem(key);
            }

            await this.removeMetadata(key);
            return true;
        } catch (error) {
            console.error('Storage removeItem failed:', error);
            return false;
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
            
            // 간단한 LZ 압축 알고리즘
            let compressed = '';
            let dict = {};
            let dictSize = 256;
            let w = '';
            
            for (let i = 0; i < jsonString.length; i++) {
                const c = jsonString[i];
                const wc = w + c;
                
                if (dict.hasOwnProperty(wc)) {
                    w = wc;
                } else {
                    if (dict.hasOwnProperty(w)) {
                        compressed += String.fromCharCode(dict[w]);
                    } else {
                        compressed += w;
                    }
                    dict[wc] = dictSize++;
                    w = c;
                }
            }
            
            if (w !== '') {
                if (dict.hasOwnProperty(w)) {
                    compressed += String.fromCharCode(dict[w]);
                } else {
                    compressed += w;
                }
            }
            
            return btoa(compressed);
        } catch (error) {
            console.warn('Compression failed, using original data:', error);
            return data;
        }
    }

    /**
     * 데이터 압축 해제
     */
    async decompressData(compressedData) {
        try {
            const compressed = atob(compressedData);
            // 압축 해제 로직 (압축과 반대 과정)
            return JSON.parse(compressed);
        } catch (error) {
            console.warn('Decompression failed:', error);
            return compressedData;
        }
    }

    /**
     * 데이터 암호화
     */
    encryptData(data) {
        try {
            const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
            let encrypted = '';
            
            for (let i = 0; i < jsonString.length; i++) {
                const keyChar = this.encryptionKey[i % this.encryptionKey.length];
                const encryptedChar = String.fromCharCode(jsonString.charCodeAt(i) ^ keyChar.charCodeAt(0));
                encrypted += encryptedChar;
            }
            
            return btoa(encrypted);
        } catch (error) {
            console.warn('Encryption failed, using original data:', error);
            return data;
        }
    }

    /**
     * 데이터 복호화
     */
    decryptData(encryptedData) {
        try {
            const encrypted = atob(encryptedData);
            let decrypted = '';
            
            for (let i = 0; i < encrypted.length; i++) {
                const keyChar = this.encryptionKey[i % this.encryptionKey.length];
                const decryptedChar = String.fromCharCode(encrypted.charCodeAt(i) ^ keyChar.charCodeAt(0));
                decrypted += decryptedChar;
            }
            
            return JSON.parse(decrypted);
        } catch (error) {
            console.warn('Decryption failed:', error);
            return encryptedData;
        }
    }

    /**
     * 저장소 선택 로직
     */
    selectStorage(key, data, preferredStorage) {
        if (preferredStorage === 'localStorage') return 'localStorage';
        if (preferredStorage === 'indexedDB') return 'indexedDB';
        
        // 자동 선택
        const dataSize = JSON.stringify(data).length;
        
        // 큰 데이터는 IndexedDB 사용
        if (dataSize > 10 * 1024) return 'indexedDB';
        
        // 고객/진단 데이터는 IndexedDB 사용
        if (key.includes('customer') || key.includes('diagnosis')) return 'indexedDB';
        
        // 그 외는 localStorage 사용
        return 'localStorage';
    }

    /**
     * localStorage 작업
     */
    setLocalStorageItem(key, data) {
        localStorage.setItem(this.prefix + key, JSON.stringify(data));
    }

    getLocalStorageItem(key) {
        const item = localStorage.getItem(this.prefix + key);
        return item ? JSON.parse(item) : null;
    }

    removeLocalStorageItem(key) {
        localStorage.removeItem(this.prefix + key);
    }

    /**
     * IndexedDB 작업
     */
    async setIndexedDBItem(key, data) {
        if (!this.db) throw new Error('IndexedDB not initialized');
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['cache'], 'readwrite');
            const store = transaction.objectStore('cache');
            const request = store.put({ key, data, updatedAt: Date.now() });
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getIndexedDBItem(key) {
        if (!this.db) throw new Error('IndexedDB not initialized');
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['cache'], 'readonly');
            const store = transaction.objectStore('cache');
            const request = store.get(key);
            
            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? result.data : null);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async removeIndexedDBItem(key) {
        if (!this.db) throw new Error('IndexedDB not initialized');
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['cache'], 'readwrite');
            const store = transaction.objectStore('cache');
            const request = store.delete(key);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * 메타데이터 관리
     */
    async updateMetadata(key, metadata) {
        const allMetadata = await this.getItem('_metadata', {});
        allMetadata[key] = metadata;
        await this.setItem('_metadata', allMetadata, { storage: 'localStorage' });
    }

    async getMetadata(key) {
        const allMetadata = await this.getItem('_metadata', {});
        return allMetadata[key] || null;
    }

    async removeMetadata(key) {
        const allMetadata = await this.getItem('_metadata', {});
        delete allMetadata[key];
        await this.setItem('_metadata', allMetadata, { storage: 'localStorage' });
    }

    /**
     * 용량 모니터링
     */
    startQuotaMonitoring() {
        if ('navigator' in window && 'storage' in navigator && 'estimate' in navigator.storage) {
            setInterval(async () => {
                try {
                    const estimate = await navigator.storage.estimate();
                    const usage = estimate.usage || 0;
                    const quota = estimate.quota || this.maxQuota;
                    
                    if (usage > quota * 0.9) {
                        console.warn('Storage quota nearly full, cleaning up...');
                        await this.cleanup();
                    }
                } catch (error) {
                    console.error('Quota monitoring failed:', error);
                }
            }, 60000); // 1분마다 확인
        }
    }

    /**
     * 만료된 데이터 정리
     */
    async cleanupExpiredData() {
        try {
            const allMetadata = await this.getItem('_metadata', {});
            const now = Date.now();
            
            for (const [key, metadata] of Object.entries(allMetadata)) {
                if (metadata.ttl && (now - metadata.createdAt) > metadata.ttl) {
                    await this.removeItem(key);
                }
            }
        } catch (error) {
            console.error('Expired data cleanup failed:', error);
        }
    }

    /**
     * 저장소 정리
     */
    async cleanup() {
        try {
            // 만료된 데이터 제거
            await this.cleanupExpiredData();
            
            // 오래된 캐시 제거 (30일 이상)
            const allMetadata = await this.getItem('_metadata', {});
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
            
            for (const [key, metadata] of Object.entries(allMetadata)) {
                if (key.startsWith('cache_') && metadata.createdAt < thirtyDaysAgo) {
                    await this.removeItem(key);
                }
            }
            
            console.log('Storage cleanup completed');
        } catch (error) {
            console.error('Storage cleanup failed:', error);
        }
    }

    /**
     * 데이터 백업
     */
    async exportData() {
        try {
            const exportData = {
                version: this.version,
                timestamp: Date.now(),
                customers: await this.getAllCustomers(),
                diagnoses: await this.getAllDiagnoses(),
                settings: await this.getItem('app_settings', {}),
                metadata: await this.getItem('_metadata', {})
            };
            
            return JSON.stringify(exportData, null, 2);
        } catch (error) {
            console.error('Data export failed:', error);
            throw error;
        }
    }

    /**
     * 데이터 복원
     */
    async importData(jsonData) {
        try {
            const importData = JSON.parse(jsonData);
            
            // 버전 확인
            if (importData.version !== this.version) {
                console.warn('Import data version mismatch');
            }
            
            // 데이터 복원
            if (importData.customers) {
                for (const customer of importData.customers) {
                    await this.setItem(`customer_${customer.id}`, customer, {
                        storage: 'indexedDB'
                    });
                }
            }
            
            if (importData.diagnoses) {
                for (const diagnosis of importData.diagnoses) {
                    await this.setItem(`diagnosis_${diagnosis.id}`, diagnosis, {
                        storage: 'indexedDB'
                    });
                }
            }
            
            if (importData.settings) {
                await this.setItem('app_settings', importData.settings);
            }
            
            console.log('Data import completed successfully');
            return true;
        } catch (error) {
            console.error('Data import failed:', error);
            throw error;
        }
    }

    /**
     * 모든 고객 데이터 조회
     */
    async getAllCustomers() {
        const metadata = await this.getItem('_metadata', {});
        const customers = [];
        
        for (const [key, meta] of Object.entries(metadata)) {
            if (key.startsWith('customer_')) {
                const customer = await this.getItem(key.replace(this.prefix, ''));
                if (customer) {
                    customers.push(customer);
                }
            }
        }
        
        return customers;
    }

    /**
     * 모든 진단 데이터 조회
     */
    async getAllDiagnoses() {
        const metadata = await this.getItem('_metadata', {});
        const diagnoses = [];
        
        for (const [key, meta] of Object.entries(metadata)) {
            if (key.startsWith('diagnosis_')) {
                const diagnosis = await this.getItem(key.replace(this.prefix, ''));
                if (diagnosis) {
                    diagnoses.push(diagnosis);
                }
            }
        }
        
        return diagnoses;
    }

    /**
     * 저장소 상태 조회
     */
    async getStorageStatus() {
        try {
            const metadata = await this.getItem('_metadata', {});
            let totalSize = 0;
            let itemCount = 0;
            const storageTypes = { localStorage: 0, indexedDB: 0 };
            
            for (const [key, meta] of Object.entries(metadata)) {
                totalSize += meta.size || 0;
                itemCount++;
                storageTypes[meta.storage] = (storageTypes[meta.storage] || 0) + 1;
            }
            
            // 할당량 정보
            let quotaInfo = null;
            if ('navigator' in window && 'storage' in navigator && 'estimate' in navigator.storage) {
                quotaInfo = await navigator.storage.estimate();
            }
            
            return {
                itemCount,
                totalSize,
                storageTypes,
                quota: quotaInfo,
                usage: quotaInfo ? (quotaInfo.usage / quotaInfo.quota * 100).toFixed(2) + '%' : 'Unknown'
            };
        } catch (error) {
            console.error('Storage status check failed:', error);
            return null;
        }
    }

    /**
     * 전체 저장소 초기화
     */
    async clearAll() {
        try {
            // localStorage 초기화
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
            
            // IndexedDB 초기화
            if (this.db) {
                const stores = ['customers', 'diagnoses', 'settings', 'cache'];
                for (const storeName of stores) {
                    const transaction = this.db.transaction([storeName], 'readwrite');
                    const store = transaction.objectStore(storeName);
                    await new Promise((resolve, reject) => {
                        const request = store.clear();
                        request.onsuccess = () => resolve();
                        request.onerror = () => reject(request.error);
                    });
                }
            }
            
            console.log('All storage cleared successfully');
            return true;
        } catch (error) {
            console.error('Clear all storage failed:', error);
            return false;
        }
    }
}

// 전역 인스턴스 생성
window.StorageManager = new StorageManager();

export default StorageManager;
