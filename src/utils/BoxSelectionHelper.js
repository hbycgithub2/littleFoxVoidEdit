// src/utils/BoxSelectionHelper.js
// 框选辅助工具 - 遵循 Phaser 3 官方标准

export default class BoxSelectionHelper {
    constructor(scene) {
        this.scene = scene;
        this.isSelecting = false;
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
        
        // 创建框选矩形图形（遵循 Phaser 官方标准）
        this.selectionBox = scene.add.graphics();
        this.selectionBox.setDepth(2500);
        this.selectionBox.setVisible(false);
    }
    
    /**
     * 开始框选
     * @param {number} x - 起始 X 坐标
     * @param {number} y - 起始 Y 坐标
     */
    start(x, y) {
        this.isSelecting = true;
        this.startX = x;
        this.startY = y;
        this.currentX = x;
        this.currentY = y;
        
        this.selectionBox.setVisible(true);
        this.updateBox();
        
        console.log(`📦 开始框选: (${x.toFixed(0)}, ${y.toFixed(0)})`);
    }
    
    /**
     * 更新框选区域
     * @param {number} x - 当前 X 坐标
     * @param {number} y - 当前 Y 坐标
     */
    update(x, y) {
        if (!this.isSelecting) return;
        
        this.currentX = x;
        this.currentY = y;
        this.updateBox();
    }
    
    /**
     * 更新框选矩形显示
     * @private
     */
    updateBox() {
        const minX = Math.min(this.startX, this.currentX);
        const minY = Math.min(this.startY, this.currentY);
        const width = Math.abs(this.currentX - this.startX);
        const height = Math.abs(this.currentY - this.startY);
        
        this.selectionBox.clear();
        
        // 绘制半透明填充
        this.selectionBox.fillStyle(0x00aaff, 0.1);
        this.selectionBox.fillRect(minX, minY, width, height);
        
        // 绘制边框
        this.selectionBox.lineStyle(2, 0x00aaff, 1);
        this.selectionBox.strokeRect(minX, minY, width, height);
    }
    
    /**
     * 结束框选并返回选中的热区
     * @returns {Array} 选中的热区数组
     */
    end() {
        if (!this.isSelecting) return [];
        
        const minX = Math.min(this.startX, this.currentX);
        const minY = Math.min(this.startY, this.currentY);
        const maxX = Math.max(this.startX, this.currentX);
        const maxY = Math.max(this.startY, this.currentY);
        
        // 查找框选区域内的热区
        const selectedHotspots = [];
        const hotspots = this.scene.hotspots || [];
        
        hotspots.forEach(hotspot => {
            if (!hotspot.visible) return;
            
            const bounds = hotspot.getBounds();
            
            // 检查热区是否与框选区域相交
            if (this.intersects(bounds, minX, minY, maxX, maxY)) {
                selectedHotspots.push(hotspot);
            }
        });
        
        console.log(`📦 框选完成: 选中 ${selectedHotspots.length} 个热区`);
        
        this.cancel();
        return selectedHotspots;
    }
    
    /**
     * 检查矩形是否相交
     * @private
     */
    intersects(bounds, minX, minY, maxX, maxY) {
        return !(bounds.right < minX || 
                bounds.left > maxX || 
                bounds.bottom < minY || 
                bounds.top > maxY);
    }
    
    /**
     * 取消框选
     */
    cancel() {
        this.isSelecting = false;
        this.selectionBox.clear();
        this.selectionBox.setVisible(false);
    }
    
    /**
     * 清理资源
     */
    destroy() {
        if (this.selectionBox) {
            this.selectionBox.destroy();
            this.selectionBox = null;
        }
    }
}
