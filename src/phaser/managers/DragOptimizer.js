// src/phaser/managers/DragOptimizer.js
// 拖拽优化管理器 - 优化拖拽性能（遵循 Phaser 3 标准）

import { throttle } from '../../utils/Throttle.js';

export default class DragOptimizer {
    constructor(scene) {
        this.scene = scene;
        this.dragThreshold = 5; // 拖拽阈值（像素）
        this.updateInterval = 16; // 更新间隔（毫秒，约 60 FPS）
        
        // 创建节流函数
        this.throttledUpdate = throttle((hotspot, x, y) => {
            this.updateDragPosition(hotspot, x, y);
        }, this.updateInterval);
    }
    
    /**
     * 优化热区拖拽
     * @param {Hotspot} hotspot - 热区对象
     */
    optimizeDrag(hotspot) {
        let isDragging = false;
        let dragStartX = 0;
        let dragStartY = 0;
        let hasMoved = false;
        
        // 拖拽开始
        hotspot.on('dragstart', (pointer) => {
            isDragging = true;
            dragStartX = pointer.x;
            dragStartY = pointer.y;
            hasMoved = false;
            
            // 记录初始位置
            hotspot.dragStartPos = { x: hotspot.x, y: hotspot.y };
        });
        
        // 拖拽中（使用节流优化）
        hotspot.on('drag', (pointer, dragX, dragY) => {
            if (!isDragging) return;
            
            // 检查是否超过拖拽阈值
            const dx = Math.abs(pointer.x - dragStartX);
            const dy = Math.abs(pointer.y - dragStartY);
            
            if (!hasMoved && (dx < this.dragThreshold && dy < this.dragThreshold)) {
                return; // 未超过阈值，不触发拖拽
            }
            
            hasMoved = true;
            
            // 使用节流更新位置
            this.throttledUpdate(hotspot, dragX, dragY);
        });
        
        // 拖拽结束
        hotspot.on('dragend', () => {
            isDragging = false;
            
            if (hasMoved) {
                // 更新配置
                hotspot.config.x = hotspot.x;
                hotspot.config.y = hotspot.y;
                
                // 发送移动事件（用于撤销/重做）
                this.scene.events.emit('hotspot:moved', {
                    hotspot: hotspot,
                    oldPos: hotspot.dragStartPos,
                    newPos: { x: hotspot.x, y: hotspot.y }
                });
            }
        });
    }
    
    /**
     * 更新拖拽位置
     * @private
     */
    updateDragPosition(hotspot, x, y) {
        hotspot.x = x;
        hotspot.y = y;
        
        // 更新缩放手柄位置
        if (hotspot.resizeHandles && hotspot.updateHandlePositions) {
            hotspot.updateHandlePositions();
        }
    }
    
    /**
     * 设置拖拽阈值
     * @param {number} threshold - 阈值（像素）
     */
    setDragThreshold(threshold) {
        this.dragThreshold = threshold;
    }
    
    /**
     * 设置更新间隔
     * @param {number} interval - 间隔（毫秒）
     */
    setUpdateInterval(interval) {
        this.updateInterval = interval;
        
        // 重新创建节流函数
        this.throttledUpdate = throttle((hotspot, x, y) => {
            this.updateDragPosition(hotspot, x, y);
        }, this.updateInterval);
    }
}
