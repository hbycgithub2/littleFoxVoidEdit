// src/phaser/managers/PolygonDrawingManager.js
// 多边形绘制管理器 - 处理多边形绘制（遵循 Phaser 3 官方标准）

import { AddHotspotCommand } from '../../core/CommandManager.js';

export default class PolygonDrawingManager {
    constructor(scene) {
        this.scene = scene;
        
        // 多边形绘制状态
        this.isDrawing = false;
        this.points = [];
        
        // 绘制预览图形（遵循 Phaser 官方标准）
        this.drawingGraphics = scene.add.graphics();
    }
    
    /**
     * 添加顶点
     * @param {number} x - X 坐标
     * @param {number} y - Y 坐标
     * @returns {boolean} 是否完成绘制
     */
    addPoint(x, y) {
        // 第一个点：开始绘制
        if (this.points.length === 0) {
            this.isDrawing = true;
            this.points = [{ x, y }];
            console.log('开始绘制多边形，点击添加顶点，按 Enter 完成');
            return false;
        }
        
        // 检查是否点击起点附近（完成多边形）
        const firstPoint = this.points[0];
        const distance = Math.sqrt(
            Math.pow(x - firstPoint.x, 2) + Math.pow(y - firstPoint.y, 2)
        );
        
        if (distance < 15 && this.points.length >= 3) {
            // 点击起点附近，完成多边形
            return this.finish();
        }
        
        // 添加新顶点
        this.points.push({ x, y });
        return false;
    }
    
    /**
     * 更新预览（遵循 Phaser 官方标准）
     * @param {number} x - 当前鼠标 X 坐标
     * @param {number} y - 当前鼠标 Y 坐标
     */
    updatePreview(x, y) {
        if (!this.isDrawing || this.points.length === 0) return;
        
        this.drawingGraphics.clear();
        this.drawingGraphics.lineStyle(3, 0x00ff00);
        
        // 绘制已有的线段
        this.drawingGraphics.beginPath();
        this.drawingGraphics.moveTo(this.points[0].x, this.points[0].y);
        
        for (let i = 1; i < this.points.length; i++) {
            this.drawingGraphics.lineTo(this.points[i].x, this.points[i].y);
        }
        
        // 绘制到当前鼠标位置的预览线
        this.drawingGraphics.lineTo(x, y);
        this.drawingGraphics.strokePath();
        
        // 绘制顶点
        this.points.forEach((point, index) => {
            this.drawingGraphics.fillStyle(index === 0 ? 0xff0000 : 0x00ff00);
            this.drawingGraphics.fillCircle(point.x, point.y, 5);
        });
    }
    
    /**
     * 完成多边形绘制
     * @returns {boolean} 是否成功创建热区
     */
    finish() {
        if (this.points.length < 3) {
            console.log('多边形至少需要 3 个顶点');
            return false;
        }
        
        this.isDrawing = false;
        this.drawingGraphics.clear();
        
        // 计算中心点
        let centerX = 0;
        let centerY = 0;
        this.points.forEach(p => {
            centerX += p.x;
            centerY += p.y;
        });
        centerX /= this.points.length;
        centerY /= this.points.length;
        
        // 转换为相对坐标
        const relativePoints = this.points.map(p => ({
            x: p.x - centerX,
            y: p.y - centerY
        }));
        
        // 创建热区配置
        const config = {
            id: Date.now(),
            shape: 'polygon',
            x: centerX,
            y: centerY,
            points: relativePoints,
            color: '#00ff00',
            strokeWidth: 3,
            word: '',
            startTime: this.scene.registry.get('videoTime'),
            endTime: this.scene.registry.get('videoTime') + 5
        };
        
        // 使用命令模式添加热区（遵循 Phaser 官方标准）
        const command = new AddHotspotCommand(this.scene, config);
        this.scene.commandManager.execute(command);
        
        // 重置状态
        this.points = [];
        this.scene.registry.set('drawMode', null);
        
        console.log('多边形创建完成');
        return true;
    }
    
    /**
     * 取消绘制
     */
    cancel() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.points = [];
            this.drawingGraphics.clear();
            console.log('已取消多边形绘制');
        }
    }
    
    /**
     * 清理资源
     */
    destroy() {
        if (this.drawingGraphics) {
            this.drawingGraphics.destroy();
            this.drawingGraphics = null;
        }
    }
}

