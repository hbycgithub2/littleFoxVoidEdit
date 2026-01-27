// src/utils/GridSnapHelper.js
// 网格吸附辅助工具 - 遵循 Phaser 3 官方标准

export default class GridSnapHelper {
    constructor(scene, gridSize = 10) {
        this.scene = scene;
        this.gridSize = gridSize;
        this.enabled = false;
        this.gridGraphics = null;
    }
    
    /**
     * 启用网格吸附
     * @param {number} gridSize - 网格大小（像素）
     */
    enable(gridSize = 10) {
        this.enabled = true;
        this.gridSize = gridSize;
        this.showGrid();
    }
    
    /**
     * 禁用网格吸附
     */
    disable() {
        this.enabled = false;
        this.hideGrid();
    }
    
    /**
     * 切换网格吸附
     */
    toggle() {
        if (this.enabled) {
            this.disable();
        } else {
            this.enable();
        }
    }
    
    /**
     * 吸附坐标到网格
     * @param {number} x - X 坐标
     * @param {number} y - Y 坐标
     * @returns {object} 吸附后的坐标 {x, y}
     */
    snap(x, y) {
        if (!this.enabled) {
            return { x, y };
        }
        
        return {
            x: Math.round(x / this.gridSize) * this.gridSize,
            y: Math.round(y / this.gridSize) * this.gridSize
        };
    }
    
    /**
     * 显示网格（遵循 Phaser 官方标准）
     */
    showGrid() {
        if (this.gridGraphics) {
            this.gridGraphics.setVisible(true);
            return;
        }
        
        // 创建网格图形（遵循 Phaser 官方标准）
        this.gridGraphics = this.scene.add.graphics();
        this.gridGraphics.setDepth(0); // 在最底层
        
        const width = this.scene.game.config.width;
        const height = this.scene.game.config.height;
        
        // 绘制网格
        this.gridGraphics.lineStyle(1, 0x333333, 0.3);
        
        // 垂直线
        for (let x = 0; x <= width; x += this.gridSize) {
            this.gridGraphics.lineBetween(x, 0, x, height);
        }
        
        // 水平线
        for (let y = 0; y <= height; y += this.gridSize) {
            this.gridGraphics.lineBetween(0, y, width, y);
        }
    }
    
    /**
     * 隐藏网格
     */
    hideGrid() {
        if (this.gridGraphics) {
            this.gridGraphics.setVisible(false);
        }
    }
    
    /**
     * 清理资源
     */
    destroy() {
        if (this.gridGraphics) {
            this.gridGraphics.destroy();
            this.gridGraphics = null;
        }
    }
}
