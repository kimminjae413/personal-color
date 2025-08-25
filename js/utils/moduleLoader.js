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
     * @param {string} code - 원본 코드
     * @param {string} moduleName - 모듈명
     * @returns {string} 변환된 코드
     */
    transformModuleCode(code, moduleName) {
        let transformedCode = code;

        // import 구문 제거/변환
        transformedCode = transformedCode.replace(/import\s+.*?from\s+['"][^'"]*['"];?\s*/g, '');
        transformedCode = transformedCode.replace(/import\s+['"][^'"]*['"];?\s*/g, '');

        // export default 변환
        transformedCode = transformedCode.replace(
            /export\s+default\s+class\s+(\w+)/g, 
            'class $1'
        );
        transformedCode = transformedCode.replace(
            /export\s+default\s+function\s+(\w+)/g, 
            'function $1'
        );
        transformedCode = transformedCode.replace(
            /export\s+default\s+(\w+)/g, 
            'const _defaultExport = $1'
        );

        // export 구문 제거
        transformedCode = transformedCode.replace(/export\s+{[^}]*};\s*/g, '');
        transformedCode = transformedCode.replace(/export\s+/g, '');

        // 모듈 하단에 전역 등록 코드 추가
        transformedCode += `\n\n// 전역 등록\nif (typeof window !== 'undefined') {\n`;
        
        // 클래스 또는 함수 감지 후 등록
        const classMatches = transformedCode.match(/class\s+(\w+)/g);
        if (classMatches) {
            classMatches.forEach(match => {
                const className = match.replace('class ', '');
                transformedCode += `    window.${className} = ${className};\n`;
            });
        }

        const functionMatches = transformedCode.match(/function\s+(\w+)/g);
        if (functionMatches) {
            functionMatches.forEach(match => {
                const funcName = match.replace('function ', '');
                transformedCode += `    window.${funcName} = ${funcName};\n`;
            });
        }

        // 상수 및 변수 등록
        const constMatches = transformedCode.match(/const\s+(\w+)\s*=/g);
        if (constMatches) {
            constMatches.forEach(match => {
                const constName = match.replace(/const\s+(\w+)\s*=/, '$1');
                if (!constName.startsWith('_') && constName !== 'transformedCode') {
                    transformedCode += `    window.${constName} = ${constName};\n`;
                }
            });
        }

        transformedCode += `}\n`;

        return transformedCode;
    }

    /**
     * 변환된 코드 실행
     * @param {string} code - 변환된 코드
     * @param {string} moduleName - 모듈명
     * @returns {Object} 모듈 객체
     */
    executeModuleCode(code, moduleName) {
        try {
            // 안전한 실행 환경 생성
            const moduleScope = {
                window: window,
                document: document,
                console: console,
                setTimeout: setTimeout,
                setInterval: setInterval,
                clearTimeout: clearTimeout,
                clearInterval: clearInterval,
                requestAnimationFrame: requestAnimationFrame,
                cancelAnimationFrame: cancelAnimationFrame,
                fetch: fetch,
                URL: URL,
                Blob: Blob,
                FormData: FormData,
                performance: performance,
                navigator: navigator,
                location: location
            };

            // 코드 실행
            const func = new Function(...Object.keys(moduleScope), code);
            func(...Object.values(moduleScope));

            // 모듈 객체 반환 (전역에 등록된 것들 수집)
            const moduleObj = {
                name: moduleName,
                loaded: true,
                timestamp: Date.now()
            };

            return moduleObj;

        } catch (error) {
            console.error(`모듈 실행 실패 (${moduleName}):`, error);
            throw error;
        }
    }

    /**
     * 여러 모듈을 배치로 로드
     * @param {Array} modules - [{url, name}, ...] 배열
     * @returns {Promise} 모든 모듈 로드 완료 Promise
     */
    async loadModules(modules) {
        const promises = modules.map(({ url, name }) => 
            this.loadModule(url, name).catch(error => {
                console.warn(`모듈 로드 실패 무시: ${url}`, error);
                return null; // 실패해도 계속 진행
            })
        );

        const results = await Promise.all(promises);
        const successful = results.filter(result => result !== null);
        
        console.log(`📦 배치 로드 완료: ${successful.length}/${modules.length}`);
        return successful;
    }

    /**
     * 필수 시스템 모듈들 로드
     */
    async loadCoreModules() {
        const coreModules = [
            { url: '/js/utils/camera.js', name: 'Camera' },
            { url: '/js/utils/storage.js', name: 'Storage' },
            { url: '/js/color/ColorSystem.js', name: 'ColorSystem' },
            { url: '/js/color/DeltaE.js', name: 'DeltaE' },
            { url: '/js/ai/SkinToneAnalyzer.js', name: 'SkinToneAnalyzer' },
            { url: '/js/ai/FaceDetection.js', name: 'FaceDetection' },
            { url: '/js/draping/VirtualDraping.js', name: 'VirtualDraping' },
            { url: '/js/components/PhotoAnalysis.js', name: 'PhotoAnalysis' },
            { url: '/js/components/DrapingMode.js', name: 'DrapingMode' },
            { url: '/js/components/ReportGenerator.js', name: 'ReportGenerator' },
            { url: '/js/components/ColorPalette.js', name: 'ColorPalette' },
            { url: '/js/components/CustomerManager.js', name: 'CustomerManager' },
            { url: '/js/components/UIComponents.js', name: 'UIComponents' }
        ];

        return await this.loadModules(coreModules);
    }

    /**
     * 데이터 모듈들 로드
     */
    async loadDataModules() {
        const dataModules = [
            { url: '/js/data/seasons.js', name: 'seasons' },
            { url: '/js/data/koreanSkinTones.js', name: 'koreanSkinTones' },
            { url: '/js/data/hairColorCharts.js', name: 'hairColorCharts' }
        ];

        return await this.loadModules(dataModules);
    }

    /**
     * 로드된 모듈 목록 반환
     */
    getLoadedModules() {
        return Array.from(this.loadedModules);
    }

    /**
     * 모듈 캐시 클리어
     */
    clearCache() {
        this.moduleCache.clear();
        this.loadedModules.clear();
        console.log('📦 모듈 캐시가 클리어되었습니다.');
    }

    /**
     * 모듈 로드 상태 확인
     */
    getLoadStatus() {
        return {
            loaded: this.loadedModules.size,
            loading: this.loadingPromises.size,
            cached: this.moduleCache.size
        };
    }
}

// 전역 모듈 로더 인스턴스
const moduleLoader = new ModuleLoader();

/**
 * 간편 로드 함수들
 */
window.loadCoreModules = () => moduleLoader.loadCoreModules();
window.loadDataModules = () => moduleLoader.loadDataModules();
window.loadModule = (url, name) => moduleLoader.loadModule(url, name);

// 전역 접근
if (typeof window !== 'undefined') {
    window.ModuleLoader = ModuleLoader;
    window.moduleLoader = moduleLoader;
}

// 자동 초기화 (모든 필수 모듈 로드)
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🔄 핵심 모듈들 자동 로드 시작...');
        
        // 핵심 모듈 로드
        await moduleLoader.loadCoreModules();
        
        // 데이터 모듈 로드
        await moduleLoader.loadDataModules();
        
        console.log('✅ 모든 모듈 자동 로드 완료');
        
        // 모듈 로드 완료 이벤트 발생
        document.dispatchEvent(new CustomEvent('modules-loaded', {
            detail: {
                status: moduleLoader.getLoadStatus(),
                timestamp: Date.now()
            }
        }));
        
    } catch (error) {
        console.error('❌ 모듈 자동 로드 실패:', error);
    }
});

console.log('📦 ModuleLoader 준비 완료');
