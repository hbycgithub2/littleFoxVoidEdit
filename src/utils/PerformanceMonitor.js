// src/utils/PerformanceMonitor.js
// 性能监控工具（遵循 Phaser 3 标准）

export default class PerformanceMonitor {
    constructor(scene) {
        this.scene = scene;
        this.enabled = false;
        this.fpsText = null;
        this.memoryText = null;
        this.hotspotCountText = null;
    }
    
    /**
     * 启用性能监控
     */
    enable() {
        if (this.enabled) return;
        this.enabled = true;
        
        // 创建 FPS 文本（遵循 Phaser 标准）
        this.fpsText = this.scene.add.text(10, 10, 'FPS: 0', {
            fontSize: '14px',
            color: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 5, y: 5 }
        });
        this.fpsText.setDepth(10000);
        this.fpsText.setScrollFactor(0);
        
        // 热区数量文本
        this.hotspotCountText = this.scene.add.text(10, 30, 'Hotspots: 0', {
            fontSize: '14px',
            color: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 5, y: 5 }
        });
        this.hotspotCountText.setDepth(10000);
        this.hotspotCountText.setScrollFactor(0);
        
        // 内存使用（如果支持）
        if (performance.memory) {
            this.memoryText = this.scene.add.text(10, 50, 'Memory: 0 MB', {
                fontSize: '14px',
                color: '#00ff00',
                backgroundColor: '#000000',
                padding: { x: 5, y: 5 }
            });
            this.memoryText.setDepth(10000);
            this.memoryText.setScrollFactor(0);
        }
    }
    
    /**
     * 禁用性能监控
     */
    disable() {
        if (!this.enabled) return;
        this.enabled = false;
        
        if (this.fpsText) {
            this.fpsText.destroy();
            this.fpsText = null;
        }
        
        if (this.hotspotCountText) {
            this.hotspotCountText.destroy();
            this.hotspotCountText = null;
        }
        
        if (this.memoryText) {
            this.memoryText.destroy();
            this.memoryText = null;
        }
    }
    
    /**
     * 更新性能数据（在 scene.update 中调用）
     */
    update() {
        if (!this.enabled) return;
        
        // 更新 FPS
        if (this.fpsText) {
            const fps = Math.round(this.scene.game.loop.actualFps);
            this.fpsText.setText(`FPS: ${fps}`);
            
            // 根据 FPS 改变颜色
            if (fps >= 55) {
                this.fpsText.setColor('#00ff00'); // 绿色
            } else if (fps >= 30) {
                this.fpsText.setColor('#ffff00'); // 黄色
            } else {
                this.fpsText.setColor('#ff0000'); // 红色
            }
        }
        
        // 更新热区数量
        if (this.hotspotCountText && this.scene.hotspots) {
            this.hotspotCountText.setText(`Hotspots: ${this.scene.hotspots.length}`);
        }
        
        // 更新内存使用
        if (this.memoryText && performance.memory) {
            const usedMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
            this.memoryText.setText(`Memory: ${usedMB} MB`);
        }
    }
    
    /**
     * 切换显示状态
     */
    toggle() {
        if (this.enabled) {
            this.disable();
        } else {
            this.enable();
        }
    }
}
