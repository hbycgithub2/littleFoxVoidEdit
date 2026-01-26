// src/phaser/gameobjects/RectHotspot.js
// 矩形热区 - 遵循 Phaser 3 官方标准

import Hotspot from './Hotspot.js';

export default class RectHotspot extends Hotspot {
    /**
     * 绘制矩形（以中心点为原点）
     */
    draw() {
        this.strokeRect(
            -this.config.width / 2,
            -this.config.height / 2,
            this.config.width,
            this.config.height
        );
    }
    
    /**
     * 获取碰撞区域（遵循 Phaser 官方标准）
     */
    getHitArea() {
        return {
            shape: new Phaser.Geom.Rectangle(
                -this.config.width / 2,
                -this.config.height / 2,
                this.config.width,
                this.config.height
            ),
            callback: Phaser.Geom.Rectangle.Contains
        };
    }
    
    /**
     * 更新手柄位置（矩形使用全部 8 个手柄）
     * 遵循 Phaser 3 官方标准
     */
    updateHandlePositions() {
        if (!this.resizeHandles || this.resizeHandles.length === 0) return;
        
        const w = this.config.width / 2;
        const h = this.config.height / 2;
        
        // 8 个手柄位置（顺时针）
        const positions = [
            { x: this.x - w, y: this.y - h },  // 0: 左上
            { x: this.x, y: this.y - h },      // 1: 上
            { x: this.x + w, y: this.y - h },  // 2: 右上
            { x: this.x + w, y: this.y },      // 3: 右
            { x: this.x + w, y: this.y + h },  // 4: 右下
            { x: this.x, y: this.y + h },      // 5: 下
            { x: this.x - w, y: this.y + h },  // 6: 左下
            { x: this.x - w, y: this.y }       // 7: 左
        ];
        
        // 更新所有手柄位置和可见性
        this.resizeHandles.forEach((handle, index) => {
            if (index < positions.length) {
                handle.setPosition(positions[index].x, positions[index].y);
                handle.setVisible(this.showHandles);
            }
        });
    }
    
    /**
     * 处理手柄拖拽（遵循 Phaser 3 官方标准）
     * @param {number} handleIndex - 手柄索引（0-7）
     * @param {number} dragX - 拖拽到的 X 坐标
     * @param {number} dragY - 拖拽到的 Y 坐标
     */
    onHandleDrag(handleIndex, dragX, dragY) {
        const w = this.config.width / 2;
        const h = this.config.height / 2;
        
        let newX = this.x;
        let newY = this.y;
        let newWidth = this.config.width;
        let newHeight = this.config.height;
        
        // 根据手柄索引调整尺寸和位置
        switch (handleIndex) {
            case 0: // 左上
                newWidth = (this.x + w - dragX) * 2;
                newHeight = (this.y + h - dragY) * 2;
                newX = dragX + newWidth / 2;
                newY = dragY + newHeight / 2;
                break;
            case 1: // 上
                newHeight = (this.y + h - dragY) * 2;
                newY = dragY + newHeight / 2;
                break;
            case 2: // 右上
                newWidth = (dragX - (this.x - w)) * 2;
                newHeight = (this.y + h - dragY) * 2;
                newX = this.x - w + newWidth / 2;
                newY = dragY + newHeight / 2;
                break;
            case 3: // 右
                newWidth = (dragX - (this.x - w)) * 2;
                newX = this.x - w + newWidth / 2;
                break;
            case 4: // 右下
                newWidth = (dragX - (this.x - w)) * 2;
                newHeight = (dragY - (this.y - h)) * 2;
                newX = this.x - w + newWidth / 2;
                newY = this.y - h + newHeight / 2;
                break;
            case 5: // 下
                newHeight = (dragY - (this.y - h)) * 2;
                newY = this.y - h + newHeight / 2;
                break;
            case 6: // 左下
                newWidth = (this.x + w - dragX) * 2;
                newHeight = (dragY - (this.y - h)) * 2;
                newX = dragX + newWidth / 2;
                newY = this.y - h + newHeight / 2;
                break;
            case 7: // 左
                newWidth = (this.x + w - dragX) * 2;
                newX = dragX + newWidth / 2;
                break;
        }
        
        // 限制最小和最大尺寸
        const minSize = 20;
        const maxSize = 1000;
        newWidth = Math.max(minSize, Math.min(maxSize, Math.abs(newWidth)));
        newHeight = Math.max(minSize, Math.min(maxSize, Math.abs(newHeight)));
        
        // 更新位置和配置
        this.x = newX;
        this.y = newY;
        this.config.x = newX;
        this.config.y = newY;
        this.config.width = newWidth;
        this.config.height = newHeight;
        
        // 标记为脏（需要重绘）
        this.markDirty();
        
        // 更新视觉
        this.updateVisual();
        
        // 更新手柄位置
        this.updateHandlePositions();
        
        // 更新交互区域（遵循 Phaser 官方标准）
        const hitArea = this.getHitArea();
        this.setInteractive(hitArea.shape, hitArea.callback);
    }
    
    /**
     * 获取当前尺寸（用于撤销/重做）
     * @returns {object} 包含宽高的对象
     */
    getCurrentSize() {
        return {
            width: this.config.width,
            height: this.config.height
        };
    }
}
