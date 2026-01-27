// src/phaser/managers/PolygonDrawingManager.js
// 多边形绘制管理器 - 处理多边形绘制（遵循 Phaser 3 官方标准）

import { AddHotspotCommand } from '../../core/CommandManager.js';
import GridSnapHelper from '../../utils/GridSnapHelper.js';

export default class PolygonDrawingManager {
    constructor(scene) {
        this.scene = scene;
        
        // 多边形绘制状态
        this.isDrawing = false;
        this.points = [];
        
        // 绘制预览图形（遵循 Phaser 官方标准）
        this.drawingGraphics = scene.add.graphics();
        this.drawingGraphics.setDepth(1001);
        
        // 共享网格吸附助手（遵循 Phaser 官方标准）
        // 注意：与 DrawingManager 共享同一个实例
        this.gridSnapHelper = scene.drawingManager ? scene.drawingManager.gridSnapHelper : new GridSnapHelper(scene, 10);
        
        // 顶点数量文本（遵循 Phaser 官方标准）
        this.vertexText = scene.add.text(0, 0, '', {
            fontSize: '14px',
            color: '#ffff00',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        });
        this.vertexText.setDepth(1002);
        this.vertexText.setVisible(false);
    }
    
    /**
     * 添加顶点
     * @param {number} x - X 坐标
     * @param {number} y - Y 坐标
     * @returns {boolean} 是否完成绘制
     */
    addPoint(x, y) {
        // 应用网格吸附（遵循 Phaser 官方标准）
        const snapped = this.gridSnapHelper.snap(x, y);
        x = snapped.x;
        y = snapped.y;
        
        // 第一个点：开始绘制
        if (this.points.length === 0) {
            this.isDrawing = true;
            this.points = [{ x, y }];
            console.log('🎨 开始绘制多边形，点击添加顶点，按 Enter 完成，Backspace 撤销');
            this.updateVertexText();
            return false;
        }
        
        // 检查是否点击起点附近（完成多边形）
        const firstPoint = this.points[0];
        const distance = Math.sqrt(
            Math.pow(x - firstPoint.x, 2) + Math.pow(y - firstPoint.y, 2)
        );
        
        const closeDistance = 15;
        if (distance < closeDistance && this.points.length >= 3) {
            // 点击起点附近，完成多边形
            console.log(`✅ 点击起点附近 (距离: ${distance.toFixed(0)}px)，完成多边形`);
            return this.finish();
        }
        
        // 添加新顶点
        this.points.push({ x, y });
        console.log(`➕ 添加顶点 #${this.points.length}: (${x.toFixed(0)}, ${y.toFixed(0)})`);
        this.updateVertexText();
        
        // 播放顶点添加动画（遵循 Phaser 官方标准）
        if (this.scene.drawingManager.animationHelper) {
            this.scene.drawingManager.animationHelper.playVertexAddAnimation(x, y);
        }
        
        // 播放音效
        if (this.scene.drawingManager.soundManager) {
            this.scene.drawingManager.soundManager.playClickSound();
        }
        
        return false;
    }
    
    /**
     * 撤销上一个顶点（遵循 Phaser 官方标准）
     */
    undoLastPoint() {
        if (!this.isDrawing || this.points.length <= 1) {
            return false;
        }
        
        const removed = this.points.pop();
        console.log(`↩️ 撤销顶点 #${this.points.length + 1}: (${removed.x.toFixed(0)}, ${removed.y.toFixed(0)})`);
        this.updateVertexText();
        return true;
    }
    
    /**
     * 更新顶点数量文本（遵循 Phaser 官方标准）
     * @private
     */
    updateVertexText() {
        if (this.points.length > 0) {
            const text = `顶点: ${this.points.length} (最少3个)`;
            this.vertexText.setText(text);
            
            // 显示在第一个顶点上方
            const firstPoint = this.points[0];
            this.vertexText.setPosition(firstPoint.x - this.vertexText.width / 2, firstPoint.y - 30);
            this.vertexText.setVisible(true);
        }
    }
    
    /**
     * 更新预览（遵循 Phaser 官方标准）
     * @param {number} x - 当前鼠标 X 坐标
     * @param {number} y - 当前鼠标 Y 坐标
     */
    updatePreview(x, y) {
        if (!this.isDrawing || this.points.length === 0) return;
        
        // 应用网格吸附（遵循 Phaser 官方标准）
        const snapped = this.gridSnapHelper.snap(x, y);
        x = snapped.x;
        y = snapped.y;
        
        this.drawingGraphics.clear();
        
        // 绘制已有的线段（半透明填充）
        if (this.points.length >= 2) {
            this.drawingGraphics.fillStyle(0x00ff00, 0.1);
            this.drawingGraphics.beginPath();
            this.drawingGraphics.moveTo(this.points[0].x, this.points[0].y);
            
            for (let i = 1; i < this.points.length; i++) {
                this.drawingGraphics.lineTo(this.points[i].x, this.points[i].y);
            }
            
            this.drawingGraphics.lineTo(x, y);
            this.drawingGraphics.closePath();
            this.drawingGraphics.fillPath();
        }
        
        // 绘制边框
        this.drawingGraphics.lineStyle(3, 0x00ff00, 1);
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
            // 起点用红色，其他用绿色
            this.drawingGraphics.fillStyle(index === 0 ? 0xff0000 : 0x00ff00, 1);
            this.drawingGraphics.fillCircle(point.x, point.y, 6);
            
            // 顶点边框
            this.drawingGraphics.lineStyle(2, 0xffffff, 1);
            this.drawingGraphics.strokeCircle(point.x, point.y, 6);
        });
        
        // 检查是否接近起点（显示闭合提示）
        const firstPoint = this.points[0];
        const distance = Math.sqrt(
            Math.pow(x - firstPoint.x, 2) + Math.pow(y - firstPoint.y, 2)
        );
        
        if (distance < 15 && this.points.length >= 3) {
            // 绘制闭合提示圈
            this.drawingGraphics.lineStyle(3, 0xffff00, 1);
            this.drawingGraphics.strokeCircle(firstPoint.x, firstPoint.y, 15);
        }
    }
    
    /**
     * 完成多边形绘制
     * @returns {boolean} 是否成功创建热区
     */
    finish() {
        const minPoints = 3;
        if (this.points.length < minPoints) {
            console.warn(`⚠️ 多边形至少需要 ${minPoints} 个顶点，当前: ${this.points.length}`);
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
        
        console.log(`✅ 完成绘制多边形:`, {
            顶点数: this.points.length,
            中心点: `(${centerX.toFixed(0)}, ${centerY.toFixed(0)})`
        });
        
        // 播放完成动画（遵循 Phaser 官方标准）
        if (this.scene.drawingManager.animationHelper) {
            this.scene.drawingManager.animationHelper.playCompleteAnimation(centerX, centerY, 'polygon');
        }
        
        // 播放音效
        if (this.scene.drawingManager.soundManager) {
            this.scene.drawingManager.soundManager.playCompleteSound();
        }
        
        // 使用命令模式添加热区（遵循 Phaser 官方标准）
        const command = new AddHotspotCommand(this.scene, config);
        this.scene.commandManager.execute(command);
        
        // 重置状态
        this.points = [];
        this.scene.registry.set('drawMode', null);
        this.vertexText.setVisible(false);
        
        return true;
    }
    
    /**
     * 取消绘制
     */
    cancel() {
        if (this.isDrawing) {
            console.log(`❌ 取消多边形绘制 (已有 ${this.points.length} 个顶点)`);
            this.isDrawing = false;
            this.points = [];
            this.drawingGraphics.clear();
            this.vertexText.setVisible(false);
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
        
        if (this.vertexText) {
            this.vertexText.destroy();
            this.vertexText = null;
        }
        
        // 注意：不销毁 gridSnapHelper，因为它是共享的
    }
}

