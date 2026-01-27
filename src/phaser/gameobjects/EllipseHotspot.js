// src/phaser/gameobjects/EllipseHotspot.js
// 椭圆热区 - 遵循 Phaser 3 官方标准

import Hotspot from './Hotspot.js';

export default class EllipseHotspot extends Hotspot {
    /**
     * 绘制椭圆
     */
    draw() {
        this.strokeEllipse(0, 0, this.config.radiusX, this.config.radiusY);
    }
    
    /**
     * 获取碰撞区域（遵循 Phaser 官方标准）
     */
    getHitArea() {
        return {
            shape: new Phaser.Geom.Ellipse(0, 0, this.config.radiusX, this.config.radiusY),
            callback: Phaser.Geom.Ellipse.Contains
        };
    }
    
    /**
     * 获取边界框（遵循 Phaser 官方标准）
     * @returns {object} 包含 left, right, top, bottom, width, height 的对象
     */
    getBounds() {
        const rx = this.config.radiusX;
        const ry = this.config.radiusY;
        return {
            left: this.x - rx,
            right: this.x + rx,
            top: this.y - ry,
            bottom: this.y + ry,
            width: rx * 2,
            height: ry * 2
        };
    }
    
    /**
     * 更新手柄位置（椭圆使用 4 个方向手柄）
     * 遵循 Phaser 3 官方标准
     */
    updateHandlePositions() {
        if (!this.resizeHandles || this.resizeHandles.length === 0) return;
        
        const rx = this.config.radiusX;
        const ry = this.config.radiusY;
        
        // 8 个手柄位置，但椭圆只显示 4 个（上、右、下、左）
        const positions = [
            { x: this.x, y: this.y - ry, visible: false },      // 0: 左上（隐藏）
            { x: this.x, y: this.y - ry, visible: true },       // 1: 上
            { x: this.x, y: this.y - ry, visible: false },      // 2: 右上（隐藏）
            { x: this.x + rx, y: this.y, visible: true },       // 3: 右
            { x: this.x, y: this.y + ry, visible: false },      // 4: 右下（隐藏）
            { x: this.x, y: this.y + ry, visible: true },       // 5: 下
            { x: this.x, y: this.y + ry, visible: false },      // 6: 左下（隐藏）
            { x: this.x - rx, y: this.y, visible: true }        // 7: 左
        ];
        
        // 更新所有手柄位置和可见性
        this.resizeHandles.forEach((handle, index) => {
            if (index < positions.length) {
                const pos = positions[index];
                handle.setPosition(pos.x, pos.y);
                handle.setVisible(pos.visible && this.showHandles);
            }
        });
    }
    
    /**
     * 处理手柄拖拽（遵循 Phaser 3 官方标准）
     * @param {number} handleIndex - 手柄索引（0-7）
     * @param {number} dragX - 拖拽到的 X 坐标
     * @param {number} dragY - 拖拽到的 Y 坐标
     * @param {Phaser.Input.Pointer} pointer - 指针对象
     */
    onHandleDrag(handleIndex, dragX, dragY, pointer) {
        // 根据手柄索引调整半径
        switch (handleIndex) {
            case 1: // 上
            case 5: // 下
                // 调整 Y 轴半径
                const newRadiusY = Math.abs(dragY - this.y);
                const minRadiusY = 10;
                const maxRadiusY = 500;
                this.config.radiusY = Math.max(minRadiusY, Math.min(maxRadiusY, newRadiusY));
                break;
                
            case 3: // 右
            case 7: // 左
                // 调整 X 轴半径
                const newRadiusX = Math.abs(dragX - this.x);
                const minRadiusX = 10;
                const maxRadiusX = 500;
                this.config.radiusX = Math.max(minRadiusX, Math.min(maxRadiusX, newRadiusX));
                break;
        }
        
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
     * @returns {object} 包含 X 和 Y 半径的对象
     */
    getCurrentSize() {
        return {
            radiusX: this.config.radiusX,
            radiusY: this.config.radiusY
        };
    }
    
    /**
     * 获取手柄位置配置（椭圆只需要 4 个方向）
     * 重写父类方法
     */
    getHandlePositions() {
        // 椭圆只显示 4 个方向的手柄（上、右、下、左）
        return [
            { cursor: 'n-resize' },   // 0: 左上（隐藏）
            { cursor: 'n-resize' },   // 1: 上
            { cursor: 'n-resize' },   // 2: 右上（隐藏）
            { cursor: 'e-resize' },   // 3: 右
            { cursor: 's-resize' },   // 4: 右下（隐藏）
            { cursor: 's-resize' },   // 5: 下
            { cursor: 's-resize' },   // 6: 左下（隐藏）
            { cursor: 'w-resize' }    // 7: 左
        ];
    }
}
