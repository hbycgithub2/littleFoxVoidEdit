// src/phaser/gameobjects/CircleHotspot.js
// 圆形热区 - 遵循 Phaser 3 官方标准

import Hotspot from './Hotspot.js';

export default class CircleHotspot extends Hotspot {
    /**
     * 绘制圆形
     */
    draw() {
        const radius = this.config.radius;
        console.log('🎨 CircleHotspot.draw():', {
            id: this.config.id,
            radius: radius,
            x: this.x,
            y: this.y,
            visible: this.visible
        });
        
        this.strokeCircle(0, 0, radius);
    }
    
    /**
     * 获取碰撞区域（遵循 Phaser 官方标准）
     */
    getHitArea() {
        return {
            shape: new Phaser.Geom.Circle(0, 0, this.config.radius),
            callback: Phaser.Geom.Circle.Contains
        };
    }
    
    /**
     * 获取边界框（遵循 Phaser 官方标准）
     * @returns {object} 包含 left, right, top, bottom, width, height 的对象
     */
    getBounds() {
        const r = this.config.radius;
        const diameter = r * 2;
        return {
            left: this.x - r,
            right: this.x + r,
            top: this.y - r,
            bottom: this.y + r,
            width: diameter,
            height: diameter
        };
    }
    
    /**
     * 更新手柄位置（圆形使用 4 个方向手柄）
     * 遵循 Phaser 3 官方标准
     */
    updateHandlePositions() {
        if (!this.resizeHandles || this.resizeHandles.length === 0) return;
        
        const r = this.config.radius;
        
        // 8 个手柄位置，但圆形只显示 4 个（上、右、下、左）
        const positions = [
            { x: this.x, y: this.y - r, visible: false },      // 0: 左上（隐藏）
            { x: this.x, y: this.y - r, visible: true },       // 1: 上
            { x: this.x, y: this.y - r, visible: false },      // 2: 右上（隐藏）
            { x: this.x + r, y: this.y, visible: true },       // 3: 右
            { x: this.x, y: this.y + r, visible: false },      // 4: 右下（隐藏）
            { x: this.x, y: this.y + r, visible: true },       // 5: 下
            { x: this.x, y: this.y + r, visible: false },      // 6: 左下（隐藏）
            { x: this.x - r, y: this.y, visible: true }        // 7: 左
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
        // 计算新半径（从圆心到拖拽点的距离）
        const dx = dragX - this.x;
        const dy = dragY - this.y;
        const newRadius = Math.sqrt(dx * dx + dy * dy);
        
        // 限制最小和最大半径
        const minRadius = 10;
        const maxRadius = 500;
        this.config.radius = Math.max(minRadius, Math.min(maxRadius, newRadius));
        
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
     * @returns {object} 包含半径的对象
     */
    getCurrentSize() {
        return {
            radius: this.config.radius
        };
    }
    
    /**
     * 获取手柄位置配置（圆形只需要 4 个方向）
     * 重写父类方法
     */
    getHandlePositions() {
        // 圆形只显示 4 个方向的手柄（上、右、下、左）
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
