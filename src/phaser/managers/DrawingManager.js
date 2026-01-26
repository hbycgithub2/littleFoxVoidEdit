// src/phaser/managers/DrawingManager.js
// 绘制管理器 - 处理基础形状绘制（遵循 Phaser 3 官方标准）

import { AddHotspotCommand } from '../../core/CommandManager.js';

export default class DrawingManager {
    constructor(scene) {
        this.scene = scene;
        
        // 绘制状态
        this.isDrawing = false;
        this.drawStartPos = null;
        this.drawMode = null;
        
        // 绘制预览图形（遵循 Phaser 官方标准）
        this.drawingGraphics = scene.add.graphics();
    }
    
    /**
     * 开始绘制
     * @param {number} x - 起始 X 坐标
     * @param {number} y - 起始 Y 坐标
     * @param {string} mode - 绘制模式 (circle|rect|ellipse)
     */
    startDrawing(x, y, mode) {
        this.isDrawing = true;
        this.drawStartPos = { x, y };
        this.drawMode = mode;
    }
    
    /**
     * 更新绘制预览（遵循 Phaser 官方标准）
     * @param {number} x - 当前 X 坐标
     * @param {number} y - 当前 Y 坐标
     */
    updatePreview(x, y) {
        if (!this.isDrawing) return;
        
        this.drawingGraphics.clear();
        this.drawingGraphics.lineStyle(3, 0x00ff00);
        
        const startX = this.drawStartPos.x;
        const startY = this.drawStartPos.y;
        const width = x - startX;
        const height = y - startY;
        
        switch (this.drawMode) {
            case 'circle':
                const radius = Math.sqrt(width * width + height * height);
                this.drawingGraphics.strokeCircle(startX, startY, radius);
                break;
                
            case 'rect':
                this.drawingGraphics.strokeRect(startX, startY, width, height);
                break;
                
            case 'ellipse':
                this.drawingGraphics.strokeEllipse(
                    startX + width / 2,
                    startY + height / 2,
                    Math.abs(width / 2),
                    Math.abs(height / 2)
                );
                break;
        }
    }
    
    /**
     * 完成绘制
     * @param {number} x - 结束 X 坐标
     * @param {number} y - 结束 Y 坐标
     * @returns {boolean} 是否成功创建热区
     */
    finishDrawing(x, y) {
        if (!this.isDrawing) return false;
        
        this.isDrawing = false;
        this.drawingGraphics.clear();
        
        const startX = this.drawStartPos.x;
        const startY = this.drawStartPos.y;
        const width = x - startX;
        const height = y - startY;
        
        // 最小尺寸检查
        if (Math.abs(width) < 10 || Math.abs(height) < 10) {
            return false; // 太小，不创建
        }
        
        // 创建热区配置
        const config = this.createHotspotConfig(startX, startY, width, height);
        
        // 使用命令模式添加热区（遵循 Phaser 官方标准）
        const command = new AddHotspotCommand(this.scene, config);
        this.scene.commandManager.execute(command);
        
        // 清除绘制模式
        this.scene.registry.set('drawMode', null);
        
        return true;
    }
    
    /**
     * 创建热区配置
     * @private
     */
    createHotspotConfig(startX, startY, width, height) {
        const videoTime = this.scene.registry.get('videoTime') || 0;
        
        const config = {
            id: Date.now(),
            shape: this.drawMode,
            color: '#00ff00',
            strokeWidth: 3,
            word: '',
            startTime: videoTime,
            endTime: videoTime + 5
        };
        
        console.log('🎨 创建热区配置:', {
            shape: config.shape,
            startTime: config.startTime,
            endTime: config.endTime,
            currentVideoTime: videoTime
        });
        
        // 根据形状添加特定属性
        switch (this.drawMode) {
            case 'circle':
                config.x = startX;
                config.y = startY;
                config.radius = Math.sqrt(width * width + height * height);
                break;
                
            case 'rect':
                // 矩形以中心点为原点
                config.width = Math.abs(width);
                config.height = Math.abs(height);
                config.x = startX + width / 2;
                config.y = startY + height / 2;
                break;
                
            case 'ellipse':
                config.radiusX = Math.abs(width / 2);
                config.radiusY = Math.abs(height / 2);
                config.x = startX + width / 2;
                config.y = startY + height / 2;
                break;
        }
        
        return config;
    }
    
    /**
     * 取消绘制
     */
    cancelDrawing() {
        this.isDrawing = false;
        this.drawingGraphics.clear();
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

