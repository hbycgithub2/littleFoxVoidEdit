// src/utils/AlignmentGuideHelper.js
// 对齐辅助线工具 - 遵循 Phaser 3 官方标准

export default class AlignmentGuideHelper {
    constructor(scene) {
        this.scene = scene;
        this.enabled = false;
        this.guideGraphics = null;
        this.alignThreshold = 5; // 对齐阈值
    }
    
    /**
     * 启用对齐辅助线
     */
    enable() {
        this.enabled = true;
        if (!this.guideGraphics) {
            this.guideGraphics = this.scene.add.graphics();
            this.guideGraphics.setDepth(998);
        }
    }
    
    /**
     * 禁用对齐辅助线
     */
    disable() {
        this.enabled = false;
        if (this.guideGraphics) {
            this.guideGraphics.clear();
        }
    }
    
    /**
     * 更新对齐辅助线
     * @param {number} x - 当前 X 坐标
     * @param {number} y - 当前 Y 坐标
     */
    update(x, y) {
        if (!this.enabled || !this.guideGraphics) return;
        
        this.guideGraphics.clear();
        
        const hotspots = this.scene.hotspots || [];
        const width = this.scene.game.config.width;
        const height = this.scene.game.config.height;
        
        let alignedX = false;
        let alignedY = false;
        
        // 检查与其他热区的对齐
        for (const hotspot of hotspots) {
            if (!hotspot.visible) continue;
            
            const config = hotspot.config;
            
            // X 轴对齐
            if (Math.abs(x - config.x) < this.alignThreshold && !alignedX) {
                this.guideGraphics.lineStyle(1, 0xff00ff, 0.8);
                this.guideGraphics.lineBetween(config.x, 0, config.x, height);
                alignedX = true;
            }
            
            // Y 轴对齐
            if (Math.abs(y - config.y) < this.alignThreshold && !alignedY) {
                this.guideGraphics.lineStyle(1, 0xff00ff, 0.8);
                this.guideGraphics.lineBetween(0, config.y, width, config.y);
                alignedY = true;
            }
            
            if (alignedX && alignedY) break;
        }
    }
    
    /**
     * 清除辅助线
     */
    clear() {
        if (this.guideGraphics) {
            this.guideGraphics.clear();
        }
    }
    
    /**
     * 清理资源
     */
    destroy() {
        if (this.guideGraphics) {
            this.guideGraphics.destroy();
            this.guideGraphics = null;
        }
    }
}
