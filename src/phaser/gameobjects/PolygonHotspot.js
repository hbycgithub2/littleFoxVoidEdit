// src/phaser/gameobjects/PolygonHotspot.js
// 多边形热区 - 遵循 Phaser 3 官方标准

import Hotspot from './Hotspot.js';

export default class PolygonHotspot extends Hotspot {
    /**
     * 绘制多边形
     */
    draw() {
        if (!this.config.points || this.config.points.length < 3) return;
        
        this.beginPath();
        this.moveTo(this.config.points[0].x, this.config.points[0].y);
        
        for (let i = 1; i < this.config.points.length; i++) {
            this.lineTo(this.config.points[i].x, this.config.points[i].y);
        }
        
        this.closePath();
        this.strokePath();
    }
    
    /**
     * 获取碰撞区域（遵循 Phaser 官方标准）
     */
    getHitArea() {
        if (!this.config.points || this.config.points.length < 3) {
            // 默认返回一个小圆形
            return {
                shape: new Phaser.Geom.Circle(0, 0, 10),
                callback: Phaser.Geom.Circle.Contains
            };
        }
        
        return {
            shape: new Phaser.Geom.Polygon(this.config.points),
            callback: Phaser.Geom.Polygon.Contains
        };
    }
    
    /**
     * 设置缩放手柄（多边形使用顶点作为手柄）
     * 重写父类方法
     */
    setupResizeHandles() {
        if (!this.config.points || this.config.points.length === 0) return;
        
        this.resizeHandles = [];
        this.showHandles = false;
        
        // 为每个顶点创建一个手柄
        const handleSize = 8;
        
        this.config.points.forEach((_point, index) => {
            // 使用 Phaser.GameObjects.Circle 创建手柄
            const handle = this.scene.add.circle(0, 0, handleSize, 0xffffff, 1);
            handle.setStrokeStyle(2, 0x000000);
            
            // 设置交互（遵循 Phaser 官方标准）
            handle.setInteractive({ cursor: 'move' });
            
            // 设置为可拖拽（遵循 Phaser 官方标准）
            this.scene.input.setDraggable(handle);
            
            // 存储手柄信息
            handle.handleIndex = index;
            handle.hotspot = this;
            
            // 拖拽事件
            handle.on('dragstart', () => {
                this.resizeStartSize = this.getCurrentSize();
                this.resizeStartPos = { x: this.x, y: this.y };
            });
            
            handle.on('drag', (_pointer, dragX, dragY) => {
                this.onHandleDrag(index, dragX, dragY);
            });
            
            handle.on('dragend', () => {
                // 发送缩放事件（用于撤销/重做）
                this.scene.events.emit('hotspot:resized', {
                    hotspot: this,
                    oldSize: this.resizeStartSize,
                    newSize: this.getCurrentSize(),
                    oldPos: this.resizeStartPos,
                    newPos: { x: this.x, y: this.y }
                });
            });
            
            // 初始隐藏
            handle.setVisible(false);
            
            this.resizeHandles.push(handle);
        });
        
        this.updateHandlePositions();
    }
    
    /**
     * 更新手柄位置（多边形使用顶点作为手柄）
     * 遵循 Phaser 3 官方标准
     */
    updateHandlePositions() {
        if (!this.resizeHandles || !this.config.points) return;
        
        // 更新每个顶点手柄的位置
        this.config.points.forEach((point, index) => {
            if (index < this.resizeHandles.length) {
                const handle = this.resizeHandles[index];
                handle.setPosition(this.x + point.x, this.y + point.y);
                handle.setVisible(this.showHandles);
            }
        });
    }
    
    /**
     * 处理手柄拖拽（调整顶点位置）
     * 遵循 Phaser 3 官方标准
     * @param {number} handleIndex - 手柄索引（顶点索引）
     * @param {number} dragX - 拖拽到的 X 坐标
     * @param {number} dragY - 拖拽到的 Y 坐标
     */
    onHandleDrag(handleIndex, dragX, dragY) {
        if (!this.config.points || handleIndex >= this.config.points.length) return;
        
        // 更新顶点位置（相对于热区中心）
        this.config.points[handleIndex].x = dragX - this.x;
        this.config.points[handleIndex].y = dragY - this.y;
        
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
     * 获取当前尺寸（多边形返回顶点数组的深拷贝）
     * 用于撤销/重做
     * @returns {object} 包含顶点数组的对象
     */
    getCurrentSize() {
        return {
            points: this.config.points ? this.config.points.map(p => ({ ...p })) : []
        };
    }
    
    /**
     * 获取手柄位置配置（多边形不使用标准 8 个手柄）
     * 重写父类方法
     */
    getHandlePositions() {
        // 多边形使用顶点作为手柄，返回空数组
        // 实际手柄在 setupResizeHandles 中创建
        return [];
    }
}
