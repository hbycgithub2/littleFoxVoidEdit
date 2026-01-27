// src/dom/timeline/TimelineDirectCreateController.js
// 时间轴直接创建控制器 - 完全遵循 Phaser 3 官方标准

import { AddHotspotCommand } from '../../core/CommandManager.js';

export default class TimelineDirectCreateController {
    constructor(timelinePanel) {
        this.timeline = timelinePanel;
        this.scene = timelinePanel.scene;
        this.game = timelinePanel.game;
        
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragCurrentX = 0;
        this.previewStartTime = 0;
        this.previewEndTime = 0;
        this.minDuration = 0.5; // 最小时长0.5秒
        this.isTooShort = false; // 标记是否太短
    }
    
    /**
     * 检测是否按住Alt键并在时间轴上拖拽
     */
    handleMouseDown(x, y, altKey) {
        if (!altKey) return false;
        
        // 检查是否在时间轴区域（排除时间刻度区域）
        if (y < 30) return false;
        
        this.isDragging = true;
        this.dragStartX = x;
        this.dragCurrentX = x;
        
        // 计算时间
        this.previewStartTime = x / this.timeline.scale;
        this.previewEndTime = this.previewStartTime;
        
        console.log('🎬 开始在时间轴上创建热区');
        return true;
    }
    
    /**
     * 更新拖拽预览（优化版 - 实时检查最小时长）
     */
    handleMouseMove(x, y) {
        if (!this.isDragging) return false;
        
        this.dragCurrentX = x;
        
        // 计算时间范围
        const startX = Math.min(this.dragStartX, this.dragCurrentX);
        const endX = Math.max(this.dragStartX, this.dragCurrentX);
        
        this.previewStartTime = startX / this.timeline.scale;
        this.previewEndTime = endX / this.timeline.scale;
        
        // 最小时长检查（实时提示）
        const duration = this.previewEndTime - this.previewStartTime;
        this.isTooShort = duration < this.minDuration;
        
        if (this.isTooShort) {
            // 自动调整到最小时长
            this.previewEndTime = this.previewStartTime + this.minDuration;
        }
        
        // 触发重绘
        this.timeline.render();
        
        return true;
    }
    
    /**
     * 完成拖拽，创建热区
     */
    handleMouseUp() {
        if (!this.isDragging) return false;
        
        this.isDragging = false;
        
        // 检查时长是否足够
        const duration = this.previewEndTime - this.previewStartTime;
        if (duration < this.minDuration) {
            console.warn(`⚠️ 时间范围太短，最小${this.minDuration}秒`);
            
            // 显示错误提示
            this.scene.events.emit('ui:showToast', {
                message: `⚠ 时间范围太短，最小${this.minDuration}秒`,
                duration: 2000,
                color: '#FF6B6B'
            });
            
            this.timeline.render();
            return true;
        }
        
        // 创建热区
        const hotspotId = this.createHotspot();
        
        // 自动高亮新创建的热区（集成A3功能）
        if (hotspotId && this.timeline.highlightController) {
            // 延迟一帧，确保热区已添加到时间轴
            setTimeout(() => {
                this.timeline.highlightController.startHighlight(hotspotId);
            }, 50);
        }
        
        // 清除预览
        this.timeline.render();
        
        return true;
    }
    
    /**
     * 创建热区（在画面中心）
     * @returns {number} 热区ID
     */
    createHotspot() {
        // 获取上次使用的形状类型
        const lastShape = this.scene.drawingManager.lastDrawMode || 'rect';
        
        // 获取画面中心位置
        const centerX = this.scene.game.config.width / 2;
        const centerY = this.scene.game.config.height / 2;
        
        // 默认尺寸
        const defaultSize = 100;
        
        // 生成唯一ID
        const hotspotId = Date.now() + Math.random();
        
        // 创建配置
        const config = {
            id: hotspotId,
            shape: lastShape,
            color: '#00ff00',
            strokeWidth: 3,
            word: '',
            startTime: parseFloat(this.previewStartTime.toFixed(1)),
            endTime: parseFloat(this.previewEndTime.toFixed(1)),
            x: centerX,
            y: centerY
        };
        
        // 根据形状添加尺寸属性
        switch (lastShape) {
            case 'circle':
                config.radius = defaultSize / 2;
                break;
            case 'rect':
                config.width = defaultSize;
                config.height = defaultSize;
                break;
            case 'ellipse':
                config.radiusX = defaultSize / 2;
                config.radiusY = defaultSize / 2;
                break;
        }
        
        // 使用命令模式添加热区（遵循 Phaser 标准）
        const command = new AddHotspotCommand(this.scene, config);
        this.scene.commandManager.execute(command);
        
        const duration = (this.previewEndTime - this.previewStartTime).toFixed(1);
        console.log(`✅ 在时间轴创建热区: ${this.previewStartTime.toFixed(1)}s - ${this.previewEndTime.toFixed(1)}s (${duration}秒)`);
        
        // 显示提示
        this.scene.events.emit('ui:showToast', {
            message: `✓ 热区已创建 (${duration}秒)，可在画面中调整位置和时间`,
            duration: 3000,
            color: '#4CAF50'
        });
        
        return hotspotId;
    }
    
    /**
     * 绘制预览（优化版 - 更好的视觉反馈）
     */
    drawPreview(ctx) {
        if (!this.isDragging) return;
        
        const startX = Math.min(this.dragStartX, this.dragCurrentX);
        const endX = Math.max(this.dragStartX, this.dragCurrentX);
        const width = endX - startX;
        
        // 绘制预览条（在时间轴底部）
        const y = this.timeline.canvas.height - 40;
        const height = 30;
        
        // 根据是否太短选择颜色
        const color = this.isTooShort ? '#FF9800' : '#4CAF50';
        const bgColor = this.isTooShort ? 'rgba(255, 152, 0, 0.3)' : 'rgba(76, 175, 80, 0.4)';
        
        // 渐变背景（更好的视觉效果）
        const gradient = ctx.createLinearGradient(startX, y, startX, y + height);
        gradient.addColorStop(0, bgColor);
        gradient.addColorStop(1, this.isTooShort ? 'rgba(255, 152, 0, 0.2)' : 'rgba(76, 175, 80, 0.2)');
        ctx.fillStyle = gradient;
        ctx.fillRect(startX, y, width, height);
        
        // 边框（实线，更醒目）
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, y, width, height);
        
        // 左右边缘标记（垂直线）
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(startX, y - 5);
        ctx.lineTo(startX, y + height + 5);
        ctx.moveTo(endX, y - 5);
        ctx.lineTo(endX, y + height + 5);
        ctx.stroke();
        
        // 显示时长（居中，更大字体）
        const duration = this.previewEndTime - this.previewStartTime;
        const durationText = `${duration.toFixed(1)}秒`;
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(durationText, startX + width / 2, y + height / 2);
        
        // 显示时间范围（小字体，在下方）
        const timeRangeText = `${this.previewStartTime.toFixed(1)}s - ${this.previewEndTime.toFixed(1)}s`;
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '11px Arial';
        ctx.fillText(timeRangeText, startX + width / 2, y + height + 15);
        
        // 显示提示（在上方）
        const hintText = this.isTooShort ? 
            `⚠ 最小时长${this.minDuration}秒 | 松开创建` : 
            'Alt+拖拽创建热区 | 松开鼠标完成';
        ctx.fillStyle = color;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(hintText, startX, y - 10);
    }
    
    /**
     * 取消拖拽
     */
    cancel() {
        if (this.isDragging) {
            this.isDragging = false;
            this.timeline.render();
        }
    }
    
    /**
     * 清理资源
     */
    destroy() {
        this.cancel();
    }
}
