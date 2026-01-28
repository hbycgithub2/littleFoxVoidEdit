// src/phaser/timeline/utils/ThumbnailPerformanceMonitor.js
// 性能监控器 - 监控帧率、内存、渲染时间（V2.0）

export default class ThumbnailPerformanceMonitor {
    constructor(scene) {
        this.scene = scene;
        this.enabled = false;
        this.stats = {
            fps: 0,
            memory: 0,
            renderTime: 0,
            scrollTime: 0
        };
        this.lastTime = 0;
    }
    
    /**
     * 启动监控
     */
    start() {
        this.enabled = true;
        this.lastTime = performance.now();
        console.log('📊 性能监控已启动');
    }
    
    /**
     * 停止监控
     */
    stop() {
        this.enabled = false;
        console.log('📊 性能监控已停止');
    }
    
    /**
     * 更新统计（在Scene的update中调用）
     */
    update() {
        if (!this.enabled) return;
        
        // 帧率
        this.stats.fps = this.scene.game.loop.actualFps;
        
        // 内存（如果支持）
        if (performance.memory) {
            this.stats.memory = Math.round(
                performance.memory.usedJSHeapSize / 1024 / 1024
            );
        }
    }
    
    /**
     * 测量渲染时间
     */
    measureRenderTime(fn) {
        const start = performance.now();
        fn();
        this.stats.renderTime = performance.now() - start;
    }
    
    /**
     * 测量滚动时间
     */
    measureScrollTime(fn) {
        const start = performance.now();
        fn();
        this.stats.scrollTime = performance.now() - start;
    }
    
    /**
     * 获取统计信息
     */
    getStats() {
        return {
            fps: Math.round(this.stats.fps),
            memory: `${this.stats.memory}MB`,
            renderTime: `${this.stats.renderTime.toFixed(2)}ms`,
            scrollTime: `${this.stats.scrollTime.toFixed(2)}ms`
        };
    }
    
    /**
     * 打印统计信息
     */
    printStats() {
        const stats = this.getStats();
        console.log('📊 性能统计:', stats);
        return stats;
    }
    
    /**
     * 检查性能是否达标
     */
    checkPerformance() {
        const issues = [];
        
        if (this.stats.fps < 55) {
            issues.push(`⚠️ 帧率过低: ${Math.round(this.stats.fps)}fps`);
        }
        
        if (this.stats.memory > 100) {
            issues.push(`⚠️ 内存使用过高: ${this.stats.memory}MB`);
        }
        
        if (this.stats.scrollTime > 16) {
            issues.push(`⚠️ 滚动延迟过高: ${this.stats.scrollTime.toFixed(2)}ms`);
        }
        
        if (issues.length > 0) {
            console.warn('性能问题:', issues);
            return false;
        }
        
        console.log('✅ 性能达标');
        return true;
    }
}
