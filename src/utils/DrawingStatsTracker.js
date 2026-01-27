// src/utils/DrawingStatsTracker.js
// 绘制统计追踪器 - 遵循 Phaser 3 官方标准

export default class DrawingStatsTracker {
    constructor(scene) {
        this.scene = scene;
        
        // 统计数据
        this.stats = {
            circle: 0,
            rect: 0,
            ellipse: 0,
            polygon: 0,
            total: 0
        };
        
        // 监听热区添加事件
        this.setupEvents();
    }
    
    /**
     * 设置事件监听
     */
    setupEvents() {
        this.scene.events.on('hotspot:added', (hotspot) => {
            this.trackHotspot(hotspot);
        });
        
        this.scene.events.on('hotspot:removed', (hotspotId) => {
            // 可以添加移除统计
        });
    }
    
    /**
     * 追踪热区
     * @param {Hotspot} hotspot - 热区对象
     */
    trackHotspot(hotspot) {
        const shape = hotspot.config.shape;
        
        if (this.stats.hasOwnProperty(shape)) {
            this.stats[shape]++;
        }
        
        this.stats.total++;
        
        console.log('📊 绘制统计:', {
            [shape]: this.stats[shape],
            总计: this.stats.total
        });
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
            circle: 0,
            rect: 0,
            ellipse: 0,
            polygon: 0,
            total: 0
        };
    }
    
    /**
     * 清理资源
     */
    destroy() {
        this.scene.events.off('hotspot:added');
        this.scene.events.off('hotspot:removed');
    }
}
