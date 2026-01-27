// src/dom/timeline/TimelineHighlightController.js
// 时间条高亮控制器 - 完全遵循 Phaser 3 官方标准

import { ModifyHotspotCommand } from '../../core/CommandManager.js';

export default class TimelineHighlightController {
    constructor(timelinePanel) {
        this.timeline = timelinePanel;
        this.scene = timelinePanel.scene;
        this.game = timelinePanel.game;
        
        this.highlightedHotspotId = null;
        this.flashCount = 0;
        this.maxFlashes = 6;
        this.flashTimer = null;
        this.step = 0.1; // 0.1秒步进
        
        this.setupEvents();
    }
    
    /**
     * 设置事件监听（遵循 Phaser 标准）
     */
    setupEvents() {
        // 监听热区添加事件
        this.scene.events.on('hotspot:added', (hotspot) => {
            this.highlightHotspot(hotspot.config.id);
        });
        
        // 监听键盘事件
        this.keydownHandler = (e) => {
            if (!this.highlightedHotspotId) return;
            if (this.isInputFocused()) return;
            
            this.handleKeyDown(e);
        };
        
        window.addEventListener('keydown', this.keydownHandler);
    }
    
    /**
     * 检查是否有输入框获得焦点
     */
    isInputFocused() {
        const activeElement = document.activeElement;
        return activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.isContentEditable
        );
    }
    
    /**
     * 高亮热区
     */
    highlightHotspot(hotspotId) {
        this.highlightedHotspotId = hotspotId;
        this.flashCount = 0;
        
        // 开始闪烁动画
        this.startFlashing();
        
        // 显示提示
        this.showHint();
        
        console.log(`✨ 高亮热区: ${hotspotId}`);
    }
    
    /**
     * 开始闪烁动画
     */
    startFlashing() {
        if (this.flashTimer) {
            clearInterval(this.flashTimer);
        }
        
        this.flashTimer = setInterval(() => {
            this.flashCount++;
            this.timeline.render();
            
            if (this.flashCount >= this.maxFlashes) {
                this.stopFlashing();
            }
        }, 200);
    }
    
    /**
     * 停止闪烁
     */
    stopFlashing() {
        if (this.flashTimer) {
            clearInterval(this.flashTimer);
            this.flashTimer = null;
        }
        this.highlightedHotspotId = null;
        this.timeline.render();
    }
    
    /**
     * 显示提示
     */
    showHint() {
        this.scene.events.emit('ui:showToast', {
            message: '⌨️ ←→ 调整开始 | Shift+←→ 调整结束 | Enter 确认',
            duration: 5000,
            color: '#2196F3'
        });
    }
    
    /**
     * 处理键盘按下
     */
    handleKeyDown(e) {
        const hotspots = this.scene.registry.get('hotspots') || [];
        const hotspot = hotspots.find(h => h.id === this.highlightedHotspotId);
        
        if (!hotspot) return;
        
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                if (e.shiftKey) {
                    this.adjustEndTime(hotspot, -this.step);
                } else {
                    this.adjustStartTime(hotspot, -this.step);
                }
                break;
                
            case 'ArrowRight':
                e.preventDefault();
                if (e.shiftKey) {
                    this.adjustEndTime(hotspot, this.step);
                } else {
                    this.adjustStartTime(hotspot, this.step);
                }
                break;
                
            case 'Enter':
                e.preventDefault();
                this.stopFlashing();
                console.log('✅ 时间调整完成');
                break;
                
            case 'Escape':
                e.preventDefault();
                this.stopFlashing();
                console.log('❌ 取消时间调整');
                break;
        }
    }
    
    /**
     * 调整开始时间
     */
    adjustStartTime(hotspot, delta) {
        const newTime = Math.max(0, hotspot.startTime + delta);
        
        // 边界检查
        if (newTime >= hotspot.endTime) {
            console.warn('⚠️ 开始时间不能大于等于结束时间');
            return;
        }
        
        // 使用命令模式（遵循 Phaser 标准）
        const command = new ModifyHotspotCommand(
            this.scene,
            hotspot.id,
            'startTime',
            hotspot.startTime,
            parseFloat(newTime.toFixed(1))
        );
        this.scene.commandManager.execute(command);
        
        console.log(`⏪ 开始时间: ${newTime.toFixed(1)}s`);
    }
    
    /**
     * 调整结束时间
     */
    adjustEndTime(hotspot, delta) {
        const newTime = hotspot.endTime + delta;
        
        // 边界检查
        if (newTime <= hotspot.startTime) {
            console.warn('⚠️ 结束时间不能小于等于开始时间');
            return;
        }
        
        // 使用命令模式（遵循 Phaser 标准）
        const command = new ModifyHotspotCommand(
            this.scene,
            hotspot.id,
            'endTime',
            hotspot.endTime,
            parseFloat(newTime.toFixed(1))
        );
        this.scene.commandManager.execute(command);
        
        console.log(`⏩ 结束时间: ${newTime.toFixed(1)}s`);
    }
    
    /**
     * 绘制高亮效果
     */
    drawHighlight(ctx) {
        if (!this.highlightedHotspotId) return;
        
        // 闪烁效果（偶数次显示）
        if (this.flashCount % 2 === 0) return;
        
        const hotspots = this.scene.registry.get('hotspots') || [];
        const hotspot = hotspots.find(h => h.id === this.highlightedHotspotId);
        
        if (!hotspot) return;
        
        const startX = hotspot.startTime * this.timeline.scale;
        const endX = hotspot.endTime * this.timeline.scale;
        const width = endX - startX;
        
        // 找到热区在时间轴上的Y位置
        const y = this.timeline.layerGroupController.getHotspotY(hotspot);
        
        if (y === null) return;
        
        // 绘制高亮边框
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.strokeRect(startX, y, width, 20);
        
        // 绘制半透明覆盖
        ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
        ctx.fillRect(startX, y, width, 20);
    }
    
    /**
     * 清理资源（遵循 Phaser 标准）
     */
    destroy() {
        this.stopFlashing();
        
        if (this.keydownHandler) {
            window.removeEventListener('keydown', this.keydownHandler);
        }
        
        this.scene.events.off('hotspot:added');
    }
}
