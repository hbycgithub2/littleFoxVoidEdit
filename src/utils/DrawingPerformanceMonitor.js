// src/utils/DrawingPerformanceMonitor.js
// 绘制性能监控 - 遵循 Phaser 3 官方标准

export default class DrawingPerformanceMonitor {
    constructor(scene) {
        this.scene = scene;
        this.enabled = false;
        
        // 性能数据
        this.stats = {
            drawCount: 0,
            avgDrawTime: 0,
            maxDrawTime: 0,
            totalDrawTime: 0
        };
        
        // 监听绘制事件
        this.setupEvents();
    }
    
    /**
     * 启用监控
     */
    enable() {
        this.enabled = true;
        console.log('📊 绘制性能监控已启用');
    }
    
    /**
     * 禁用监控
     */
    disable() {
        this.enabled = false;
        console.log('📊 绘制性能监控已禁用');
    }
    
    /**
     * 设置事件监听
     */
    setupEvents() {
        this.scene.events.on('hotspot:added', (hotspot) => {
            if (this.enabled) {
                this.recordDraw(hotspot);
            }
        });
    }
    
    /**
     * 记录绘制
     * @param {Hotspot} hotspot - 热区对象
     */
    recordDraw(hotspot) {
        this.stats.drawCount++;
        
        // 简单的性能建议
        if (this.stats.drawCount > 50) {
            console.warn('⚠️ 热区数量较多 (>50)，建议使用图层管理');
        }
    }
    
    /**
     * 获取统计数据
     * @returns {object} 统计数据
     */
    getStats() {
        return { ...this.stats };
    }
    
    /**
     * 重置统计
     */
    reset() {
        this.stats = {
            drawCount: 0,
            avgDrawTime: 0,
            maxDrawTime: 0,
            totalDrawTime: 0
        };
    }
    
    /**
     * 清理资源
     */
    destroy() {
        this.scene.events.off('hotspot:added');
    }
}
