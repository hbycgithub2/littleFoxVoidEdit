// src/utils/DrawingGuideHelper.js
// 绘制辅助线工具 - 遵循 Phaser 3 官方标准

export default class DrawingGuideHelper {
    constructor(scene) {
        this.scene = scene;
        this.enabled = false;
        this.guideGraphics = null;
    }
    
    /**
     * 启用辅助线
     */
    enable() {
        this.enabled = true;
        if (!this.guideGraphics) {
            // 创建辅助线图形（遵循 Phaser 官方标准）
            this.guideGraphics = this.scene.add.graphics();
            this.guideGraphics.setDepth(999); // 在热区下方
        }
    }
    
    /**
     * 禁用辅助线
     */
    disable() {
        this.enabled = false;
        if (this.guideGraphics) {
            this.guideGraphics.clear();
        }
    }
    
    /**
     * 更新辅助线（显示十字线和尺寸）
     * @param {number} startX - 起始 X 坐标
     * @param {number} startY - 起始 Y 坐标
     * @param {number} currentX - 当前 X 坐标
     * @param {number} currentY - 当前 Y 坐标
     * @param {string} shape - 形状类型
     */
    update(startX, startY, currentX, currentY, shape) {
        if (!this.enabled || !this.guideGraphics) return;
        
        this.guideGraphics.clear();
        
        const width = this.scene.game.config.width;
        const height = this.scene.game.config.height;
        
        // 绘制十字辅助线（遵循 Phaser 官方标准）
        this.guideGraphics.lineStyle(1, 0xffff00, 0.5);
        
        // 垂直线（从起点）
        this.guideGraphics.lineBetween(startX, 0, startX, height);
        
        // 水平线（从起点）
        this.guideGraphics.lineBetween(0, startY, width, startY);
        
        // 垂直线（当前位置）
        this.guideGraphics.lineStyle(1, 0x00ffff, 0.5);
        this.guideGraphics.lineBetween(currentX, 0, currentX, height);
        
        // 水平线（当前位置）
        this.guideGraphics.lineBetween(0, currentY, width, currentY);
        
        // 显示尺寸信息
        this.showDimensions(startX, startY, currentX, currentY, shape);
    }
    
    /**
     * 显示尺寸信息
     * @private
     */
    showDimensions(startX, startY, currentX, currentY, shape) {
        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);
        
        let text = '';
        
        switch (shape) {
            case 'circle':
                const radius = Math.sqrt(width * width + height * height);
                text = `半径: ${radius.toFixed(0)}px`;
                break;
            case 'rect':
            case 'ellipse':
                text = `${width.toFixed(0)} × ${height.toFixed(0)}px`;
                break;
        }
        
        if (text) {
            // 在中心点显示尺寸（使用 Phaser Text 对象）
            const centerX = (startX + currentX) / 2;
            const centerY = (startY + currentY) / 2;
            
            // 绘制背景
            this.guideGraphics.fillStyle(0x000000, 0.7);
            this.guideGraphics.fillRect(centerX - 60, centerY - 15, 120, 30);
            
            // 注意：Graphics 不能直接绘制文字，需要使用 Text 对象
            // 这里我们只绘制背景框，文字由 DrawingManager 处理
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
