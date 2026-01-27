// src/dom/timeline/TimelineRangeCopyController.js
// 时间范围复制粘贴控制器 - 完全遵循 Phaser 3 官方标准

import { AddHotspotCommand, BatchCommand } from '../../core/CommandManager.js';

/**
 * 时间范围复制粘贴控制器（优化版）
 * 职责：
 * 1. 复制选中热区的时间范围（完整属性）
 * 2. 粘贴时间范围到新位置（智能偏移）
 * 3. 支持批量复制粘贴（批量命令）
 * 4. 保持相对时间关系
 * 5. 集成磁性吸附
 * 6. 智能重叠检测
 */
export default class TimelineRangeCopyController {
    constructor(timelinePanel) {
        this.timeline = timelinePanel;
        this.scene = timelinePanel.scene;
        this.game = timelinePanel.game;
        
        // 复制的时间范围数据
        this.copiedRanges = [];
        this.copyReferenceTime = 0; // 复制时的参考时间（最早的开始时间）
        
        // 粘贴模式
        this.pasteMode = 'current'; // 'current' | 'original'
        
        // 智能偏移设置
        this.smartOffset = {
            enabled: true,
            spatial: 20,    // 空间偏移（像素）
            temporal: 0     // 时间偏移（秒）
        };
        
        // 性能缓存
        this.hotspotsCache = null;
        this.cacheTime = 0;
        this.cacheTimeout = 100; // 缓存有效期（ms）
        
        this.setupKeyboardShortcuts();
    }
    
    /**
     * 设置键盘快捷键
     */
    setupKeyboardShortcuts() {
        this.keydownHandler = (e) => {
            // 检查是否在输入框中
            const activeElement = document.activeElement;
            const isInputFocused = activeElement && (
                activeElement.tagName === 'INPUT' ||
                activeElement.tagName === 'TEXTAREA' ||
                activeElement.isContentEditable
            );
            
            if (isInputFocused) return;
            
            // Ctrl+Shift+C: 复制时间范围
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                this.copyTimeRanges();
            }
            
            // Ctrl+Shift+V: 粘贴时间范围
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
                e.preventDefault();
                this.pasteTimeRanges();
            }
        };
        
        window.addEventListener('keydown', this.keydownHandler);
    }
    
    /**
     * 获取热区列表（带缓存优化）
     */
    getHotspots() {
        const now = Date.now();
        if (this.hotspotsCache && (now - this.cacheTime) < this.cacheTimeout) {
            return this.hotspotsCache;
        }
        
        this.hotspotsCache = this.scene.registry.get('hotspots') || [];
        this.cacheTime = now;
        return this.hotspotsCache;
    }
    
    /**
     * 清除缓存
     */
    clearCache() {
        this.hotspotsCache = null;
        this.cacheTime = 0;
    }
    
    /**
     * 复制选中热区的时间范围（完整属性）
     */
    copyTimeRanges() {
        const selectedIds = this.timeline.selectionController.getSelectedIds();
        
        if (selectedIds.length === 0) {
            this.scene.events.emit('ui:showToast', {
                message: '⚠ 请先选择要复制的热区',
                duration: 2000,
                color: '#FF9800'
            });
            return;
        }
        
        const hotspots = this.getHotspots();
        const selectedHotspots = hotspots.filter(h => selectedIds.includes(h.id));
        
        // 找到最早的开始时间作为参考点
        this.copyReferenceTime = Math.min(...selectedHotspots.map(h => h.startTime));
        
        // 保存完整的热区数据（相对于参考时间）
        this.copiedRanges = selectedHotspots.map(h => {
            const range = {
                relativeStart: h.startTime - this.copyReferenceTime,
                relativeEnd: h.endTime - this.copyReferenceTime,
                duration: h.endTime - h.startTime,
                // 基础属性
                shape: h.shape,
                color: h.color,
                strokeWidth: h.strokeWidth,
                word: h.word,
                // 位置和尺寸
                x: h.x,
                y: h.y,
                width: h.width,
                height: h.height,
                radius: h.radius,
                radiusX: h.radiusX,
                radiusY: h.radiusY,
                // 高级属性
                opacity: h.opacity !== undefined ? h.opacity : 1,
                rotation: h.rotation || 0,
                scaleX: h.scaleX || 1,
                scaleY: h.scaleY || 1,
                // 多边形点
                points: h.points ? [...h.points] : null,
                // 其他属性
                visible: h.visible !== undefined ? h.visible : true,
                interactive: h.interactive !== undefined ? h.interactive : true
            };
            
            return range;
        });
        
        // 复制到系统剪贴板（纯文本格式）
        const timeRangeText = selectedHotspots.map(h => 
            `${h.startTime.toFixed(1)}s - ${h.endTime.toFixed(1)}s`
        ).join(', ');
        
        navigator.clipboard.writeText(timeRangeText).then(() => {
            this.scene.events.emit('ui:showToast', {
                message: `✓ 已复制 ${this.copiedRanges.length} 个热区的时间范围`,
                duration: 2000,
                color: '#4CAF50'
            });
            
            console.log(`📋 已复制时间范围: ${timeRangeText}`);
        }).catch(err => {
            console.error('复制到剪贴板失败:', err);
        });
    }
    
    /**
     * 检测时间重叠
     * @param {number} startTime - 开始时间
     * @param {number} endTime - 结束时间
     * @returns {boolean} 是否重叠
     */
    detectTimeOverlap(startTime, endTime) {
        const hotspots = this.getHotspots();
        return hotspots.some(h => {
            return !(endTime <= h.startTime || startTime >= h.endTime);
        });
    }
    
    /**
     * 智能计算粘贴偏移
     * @param {number} baseTime - 基础时间
     * @returns {number} 调整后的时间
     */
    calculateSmartOffset(baseTime) {
        if (!this.smartOffset.enabled) {
            return baseTime;
        }
        
        let adjustedTime = baseTime;
        let attempts = 0;
        const maxAttempts = 10;
        const timeStep = 0.5; // 每次尝试偏移0.5秒
        
        // 检查是否有时间重叠，如果有则自动偏移
        while (attempts < maxAttempts) {
            let hasOverlap = false;
            
            for (const range of this.copiedRanges) {
                const newStart = adjustedTime + range.relativeStart;
                const newEnd = adjustedTime + range.relativeEnd;
                
                if (this.detectTimeOverlap(newStart, newEnd)) {
                    hasOverlap = true;
                    break;
                }
            }
            
            if (!hasOverlap) {
                break;
            }
            
            adjustedTime += timeStep;
            attempts++;
        }
        
        return adjustedTime;
    }
    
    /**
     * 粘贴时间范围（优化版 - 使用批量命令）
     * @param {number} targetTime - 目标时间（可选，默认为当前视频时间）
     */
    pasteTimeRanges(targetTime = null) {
        if (this.copiedRanges.length === 0) {
            this.scene.events.emit('ui:showToast', {
                message: '⚠ 没有可粘贴的时间范围',
                duration: 2000,
                color: '#FF9800'
            });
            return;
        }
        
        // 确定粘贴位置
        let pasteTime = targetTime !== null ? targetTime : this.timeline.currentTime;
        
        // 智能偏移（避免重叠）
        pasteTime = this.calculateSmartOffset(pasteTime);
        
        // 应用磁性吸附（如果启用）
        if (this.timeline.snapController && this.timeline.snapController.enabled) {
            const snapped = this.timeline.snapController.snapTime(pasteTime, null);
            if (snapped.snapped) {
                pasteTime = snapped.time;
            }
        }
        
        // 创建新热区
        const commands = [];
        const newIds = [];
        
        this.copiedRanges.forEach(range => {
            // 计算新的时间
            const newStartTime = pasteTime + range.relativeStart;
            const newEndTime = pasteTime + range.relativeEnd;
            
            // 边界检查
            if (newStartTime < 0) {
                console.warn('粘贴位置超出边界，已跳过');
                return;
            }
            
            // 生成新ID
            const newId = Date.now() + Math.random();
            
            // 创建新热区配置（包含所有属性）
            const newConfig = {
                id: newId,
                shape: range.shape,
                color: range.color,
                strokeWidth: range.strokeWidth,
                word: range.word,
                startTime: parseFloat(newStartTime.toFixed(1)),
                endTime: parseFloat(newEndTime.toFixed(1)),
                // 位置（智能偏移）
                x: range.x + (this.smartOffset.enabled ? this.smartOffset.spatial : 0),
                y: range.y + (this.smartOffset.enabled ? this.smartOffset.spatial : 0),
                width: range.width,
                height: range.height,
                radius: range.radius,
                radiusX: range.radiusX,
                radiusY: range.radiusY,
                // 高级属性
                opacity: range.opacity,
                rotation: range.rotation,
                scaleX: range.scaleX,
                scaleY: range.scaleY,
                // 多边形点
                points: range.points,
                // 其他属性
                visible: range.visible,
                interactive: range.interactive
            };
            
            // 创建添加命令
            const command = new AddHotspotCommand(this.scene, newConfig);
            commands.push(command);
            newIds.push(newId);
        });
        
        if (commands.length === 0) {
            this.scene.events.emit('ui:showToast', {
                message: '⚠ 粘贴位置无效',
                duration: 2000,
                color: '#FF9800'
            });
            return;
        }
        
        // 使用批量命令（单次撤销/重做）
        const batchCommand = new BatchCommand(commands);
        this.scene.commandManager.execute(batchCommand);
        
        // 清除缓存
        this.clearCache();
        
        // 选中新粘贴的热区
        this.timeline.selectionController.clearSelection();
        newIds.forEach(id => {
            this.timeline.selectionController.selectedIds.add(id);
        });
        this.timeline.selectionController.emitSelectionChanged();
        
        // 显示提示
        const offsetInfo = pasteTime !== (targetTime !== null ? targetTime : this.timeline.currentTime) 
            ? ' (已智能偏移)' : '';
        
        this.scene.events.emit('ui:showToast', {
            message: `✓ 已粘贴 ${commands.length} 个热区到 ${pasteTime.toFixed(1)}s${offsetInfo}`,
            duration: 2000,
            color: '#4CAF50'
        });
        
        // 触发重绘
        this.timeline.render();
        
        console.log(`📋 已粘贴 ${commands.length} 个热区`);
    }
    
    /**
     * 复制单个热区的时间范围（右键菜单使用）
     * @param {object} hotspot - 热区配置
     */
    copySingleTimeRange(hotspot) {
        this.copyReferenceTime = hotspot.startTime;
        
        this.copiedRanges = [{
            relativeStart: 0,
            relativeEnd: hotspot.endTime - hotspot.startTime,
            duration: hotspot.endTime - hotspot.startTime,
            shape: hotspot.shape,
            color: hotspot.color,
            strokeWidth: hotspot.strokeWidth,
            word: hotspot.word,
            x: hotspot.x,
            y: hotspot.y,
            width: hotspot.width,
            height: hotspot.height,
            radius: hotspot.radius,
            radiusX: hotspot.radiusX,
            radiusY: hotspot.radiusY,
            opacity: hotspot.opacity !== undefined ? hotspot.opacity : 1,
            rotation: hotspot.rotation || 0,
            scaleX: hotspot.scaleX || 1,
            scaleY: hotspot.scaleY || 1,
            points: hotspot.points ? [...hotspot.points] : null,
            visible: hotspot.visible !== undefined ? hotspot.visible : true,
            interactive: hotspot.interactive !== undefined ? hotspot.interactive : true
        }];
        
        // 复制到系统剪贴板
        const timeRangeText = `${hotspot.startTime.toFixed(1)}s - ${hotspot.endTime.toFixed(1)}s`;
        navigator.clipboard.writeText(timeRangeText);
        
        this.scene.events.emit('ui:showToast', {
            message: `✓ 已复制时间范围: ${timeRangeText}`,
            duration: 2000,
            color: '#4CAF50'
        });
    }
    
    /**
     * 粘贴到指定时间（右键菜单使用）
     * @param {number} time - 目标时间
     */
    pasteAtTime(time) {
        this.pasteTimeRanges(time);
    }
    
    /**
     * 设置智能偏移
     * @param {boolean} enabled - 是否启用
     * @param {number} spatial - 空间偏移（像素）
     * @param {number} temporal - 时间偏移（秒）
     */
    setSmartOffset(enabled, spatial = 20, temporal = 0) {
        this.smartOffset.enabled = enabled;
        this.smartOffset.spatial = spatial;
        this.smartOffset.temporal = temporal;
    }
    
    /**
     * 获取复制的时间范围信息
     * @returns {object} 时间范围信息
     */
    getCopiedInfo() {
        if (this.copiedRanges.length === 0) {
            return null;
        }
        
        const totalDuration = Math.max(...this.copiedRanges.map(r => r.relativeEnd));
        
        return {
            count: this.copiedRanges.length,
            duration: totalDuration,
            referenceTime: this.copyReferenceTime,
            smartOffset: { ...this.smartOffset }
        };
    }
    
    /**
     * 清空复制的数据
     */
    clear() {
        this.copiedRanges = [];
        this.copyReferenceTime = 0;
        this.clearCache();
    }
    
    /**
     * 清理资源
     */
    destroy() {
        if (this.keydownHandler) {
            window.removeEventListener('keydown', this.keydownHandler);
        }
        this.clear();
        console.log('TimelineRangeCopyController destroyed');
    }
}
