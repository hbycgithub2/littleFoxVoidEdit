// src/utils/TimelineQuickTimeHelper.js
// 快捷键时间设置辅助工具 - 完全遵循 Phaser 3 官方标准

import { ModifyHotspotCommand } from '../core/CommandManager.js';

export default class TimelineQuickTimeHelper {
    constructor(scene) {
        this.scene = scene;
        this.setupKeyboard();
    }
    
    /**
     * 设置键盘监听（遵循 Phaser 官方标准）
     */
    setupKeyboard() {
        // T键 - 设置时间
        this.scene.input.keyboard.on('keydown-T', (event) => {
            // 检查是否在输入框中
            if (this.isInputFocused()) return;
            
            if (event.shiftKey) {
                // Shift+T - 设置结束时间
                this.setEndTime();
            } else if (event.ctrlKey || event.metaKey) {
                // Ctrl+T - 设置为当前片段
                this.setCurrentSegment();
            } else {
                // T - 设置开始时间
                this.setStartTime();
            }
        });
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
     * 设置开始时间为当前视频时间
     */
    setStartTime() {
        const selected = this.scene.selectionManager.getSelected();
        if (selected.length === 0) {
            console.warn('⚠️ 没有选中的热区');
            this.scene.events.emit('ui:showToast', {
                message: '请先选中热区',
                duration: 2000,
                color: '#FF6B6B'
            });
            return;
        }
        
        const videoTime = this.scene.registry.get('videoTime') || 0;
        let successCount = 0;
        
        selected.forEach(hotspot => {
            const oldValue = hotspot.config.startTime;
            const newValue = parseFloat(videoTime.toFixed(1));
            
            // 边界检查：开始时间不应大于结束时间
            if (newValue >= hotspot.config.endTime) {
                console.warn(`⚠️ 开始时间 ${newValue}s 不能大于等于结束时间 ${hotspot.config.endTime}s`);
                return;
            }
            
            // 使用命令模式（支持撤销）
            const command = new ModifyHotspotCommand(
                this.scene,
                hotspot.config.id,
                'startTime',
                oldValue,
                newValue
            );
            this.scene.commandManager.execute(command);
            successCount++;
        });
        
        if (successCount > 0) {
            console.log(`📍 设置开始时间: ${videoTime.toFixed(1)}s (${successCount}个热区)`);
            this.showFeedback(`✓ 开始时间: ${videoTime.toFixed(1)}s`);
        }
    }
    
    /**
     * 设置结束时间为当前视频时间
     */
    setEndTime() {
        const selected = this.scene.selectionManager.getSelected();
        if (selected.length === 0) {
            console.warn('⚠️ 没有选中的热区');
            this.scene.events.emit('ui:showToast', {
                message: '请先选中热区',
                duration: 2000,
                color: '#FF6B6B'
            });
            return;
        }
        
        const videoTime = this.scene.registry.get('videoTime') || 0;
        let successCount = 0;
        
        selected.forEach(hotspot => {
            const oldValue = hotspot.config.endTime;
            const newValue = parseFloat(videoTime.toFixed(1));
            
            // 边界检查：结束时间不应小于开始时间
            if (newValue <= hotspot.config.startTime) {
                console.warn(`⚠️ 结束时间 ${newValue}s 不能小于等于开始时间 ${hotspot.config.startTime}s`);
                return;
            }
            
            // 使用命令模式（支持撤销）
            const command = new ModifyHotspotCommand(
                this.scene,
                hotspot.config.id,
                'endTime',
                oldValue,
                newValue
            );
            this.scene.commandManager.execute(command);
            successCount++;
        });
        
        if (successCount > 0) {
            console.log(`📍 设置结束时间: ${videoTime.toFixed(1)}s (${successCount}个热区)`);
            this.showFeedback(`✓ 结束时间: ${videoTime.toFixed(1)}s`);
        }
    }
    
    /**
     * 设置为当前片段（开始=当前，结束=当前+5秒）
     */
    setCurrentSegment() {
        const selected = this.scene.selectionManager.getSelected();
        if (selected.length === 0) {
            console.warn('⚠️ 没有选中的热区');
            this.scene.events.emit('ui:showToast', {
                message: '请先选中热区',
                duration: 2000,
                color: '#FF6B6B'
            });
            return;
        }
        
        const videoTime = this.scene.registry.get('videoTime') || 0;
        const startTime = parseFloat(videoTime.toFixed(1));
        const endTime = parseFloat((videoTime + 5).toFixed(1));
        
        selected.forEach(hotspot => {
            // 设置开始时间
            const startCommand = new ModifyHotspotCommand(
                this.scene,
                hotspot.config.id,
                'startTime',
                hotspot.config.startTime,
                startTime
            );
            this.scene.commandManager.execute(startCommand);
            
            // 设置结束时间
            const endCommand = new ModifyHotspotCommand(
                this.scene,
                hotspot.config.id,
                'endTime',
                hotspot.config.endTime,
                endTime
            );
            this.scene.commandManager.execute(endCommand);
        });
        
        console.log(`📍 设置为当前片段: ${startTime}s - ${endTime}s (${selected.length}个热区)`);
        this.showFeedback(`✓ 片段: ${startTime}s - ${endTime}s (5秒)`);
    }
    
    /**
     * 显示反馈提示（遵循 Phaser 标准）
     */
    showFeedback(message) {
        // 发送事件显示Toast提示
        this.scene.events.emit('ui:showToast', {
            message: message,
            duration: 2000,
            color: '#4CAF50'
        });
    }
    
    /**
     * 清理资源（遵循 Phaser 标准）
     */
    destroy() {
        this.scene.input.keyboard.off('keydown-T');
    }
}
