/**
 * moduleLoader.js - ES6 모듈 호환성 해결
 * 
 * ES6 import/export가 포함된 파일들을 브라우저에서 동적으로 로드
 * import/export 구문을 제거하고 전역 변수로 변환
 */

class ModuleLoader {
    constructor() {
        this.loadedModules = new Set();
        this.moduleCache = new Map();
        this.loadingPromises = new Map();
    }

    /**
     * 모듈 파일 로드 및 변환
     * @param {string} url - 모듈 파일 URL
     * @param {string} moduleName - 전역 변수명
     * @returns {Promise} 로드 완료 Promise
     */
    async loadModule(url, moduleName) {
        // 이미 로드된 모듈이면 캐시에서 반환
        if (this.loadedModules.has(url)) {
            return this.moduleCache.get(url);
        }

        // 로딩 중인 모듈이면 기존 Promise 반환
        if (this.loadingPromises.has(url)) {
            return this.loadingPromises.get(url);
        }

        // 새로운 로딩 Promise 생성
        const loadingPromise = this.loadModuleInternal(url, moduleName);
        this.loadingPromises.set(url, loadingPromise);

        try {
            const result = await loadingPromise;
            this.loadedModules.add(url);
            this.moduleCache.set(url, result);
            return result;
        } finally {
            this.loadingPromises.delete(url);
        }
    }

    /**
     * 내부 모듈 로드 구현
     */
    async loadModuleInternal(url, moduleName) {
        try {
            console.log(`📦 모듈 로드 시작: ${url}`);

            // 파일 내용 가져오기
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`모듈 로드 실패: ${response.statusText}`);
            }

            let code = await response.text();

            // ES6 모듈 구문 변환
            code = this.transformModuleCode(code, moduleName);

            // 동적으로 실행
            const module = this.executeModuleCode(code, moduleName);

            console.log(`✅ 모듈 로드 완료: ${moduleName}`);
            return module;

        } catch (error) {
            console.error(`❌ 모듈 로드 실패 (${url}):`, error);
            throw error;
        }
    }

    /**
     * ES6 모듈 코드 변환
     * @param {string} code - 원
