// src/utils/MemoryOptimizer.js
// 内存优化工具 - 及时清理资源（遵循 Phaser 3 标准）

export default class MemoryOptimizer {
    constructor(scene) {
        this.scene = scene;
        this.trackedObjects = new Set();
        this.cleanupCallbacks = new Map();
    }
    
    /**
     * 跟踪对象（用于自动清理）
     * @param {object} obj - 要跟踪的对象
     * @param {function} cleanupCallback - 清理回调函数
     */
    track(obj, cleanupCallback) {
        this.trackedObjects.add(obj);
        
        if (cleanupCallback) {
            this.cleanupCallbacks.set(obj, cleanupCallback);
        }
    }
    
    /**
     * 取消跟踪对象
     * @param {object} obj - 要取消跟踪的对象
     */
    untrack(obj) {
        this.trackedObjects.delete(obj);
        this.cleanupCallbacks.delete(obj);
    }
    
    /**
     * 清理对象
     * @param {object} obj - 要清理的对象
     */
    cleanup(obj) {
        // 执行自定义清理回调
        const callback = this.cleanupCallbacks.get(obj);
        if (callback) {
            callback(obj);
        }
        
        // 清理事件监听器
        if (obj.removeAllListeners && typeof obj.removeAllListeners === 'function') {
            obj.removeAllListeners();
        }
        
        // 销毁对象
        if (obj.destroy && typeof obj.destroy === 'function') {
            obj.destroy();
        }
        
        // 取消跟踪
        this.untrack(obj);
    }
    
    /**
     * 清理所有跟踪的对象
     */
    cleanupAll() {
        this.trackedObjects.forEach(obj => {
            this.cleanup(obj);
        });
        
        this.trackedObjects.clear();
        this.cleanupCallbacks.clear();
    }
    
    /**
     * 获取内存使用情况
     * @returns {object} 内存信息
     */
    getMemoryInfo() {
        const info = {
            trackedObjects: this.trackedObjects.size,
            cleanupCallbacks: this.cleanupCallbacks.size
        };
        
        // 如果浏览器支持，获取 JS 堆内存信息
        if (performance.memory) {
            info.jsHeapSize = {
                used: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
                total: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
                limit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB'
            };
        }
        
        return info;
    }
    
    /**
     * 强制垃圾回收（仅在开发环境）
     */
    forceGC() {
        if (window.gc && typeof window.gc === 'function') {
            console.log('执行垃圾回收...');
            window.gc();
        } else {
            console.warn('垃圾回收不可用（需要在 Chrome 中使用 --expose-gc 标志启动）');
        }
    }
    
    /**
     * 销毁优化器
     */
    destroy() {
        this.cleanupAll();
    }
}
