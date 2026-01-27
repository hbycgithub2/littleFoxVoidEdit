// src/dom/timeline/TimelineFineAdjustController.js
// 时间微调控制器 - 完全遵循 Phaser 3 官方标准

import { UpdateTimeCommand, BatchUpdateTimeCommand } from '../../core/CommandManager.js';

/**
 * 时间微调控制器 (B8 - 优化版)
 * 职责：
 * 1. 方向键微调选中热区的时间
 * 2. 支持单个和批量微调
 * 3. 支持不同步长（0.1s, 1s, 10s）
 * 4. 支持整体移动和边界调整
 * 5. 实时视觉反馈
 * 6. 集成磁性吸附
 * 7. 性能优化（缓存）
 * 8. 智能边界处理
 */
export default class TimelineFineAdjustController {
    constructor(timelinePanel) {
        this.timeline = timelinePanel;
        this.scene = timelinePanel.scene;
        this.game = timelinePanel.game;
        
        // 微调步长
        this.steps = {
            fine: 0.1,      // 精细调整（默认）
            normal: 1.0,    // 正常调整（Ctrl）
            coarse: 10.0    // 粗调整（Ctrl+Shift）
        };
        
        // 当前模式
        this.mode = 'fine';
        
        // 是否启用
        this.enabled = true;
        
        // 预览状态
        this.previewEnabled = false;
        this.previewData = null;
        
        // 性能缓存
        this.hotspotsCache = null;
        this.cacheTime = 0;
        this.cacheTimeout = 50; // 缓存有效期（ms）
        
        // 智能边界处理
        this.smartBoundary = {
            enabled: true,
            warnThreshold: 0.5,  // 接近边界警告阈值（秒）
            autoClamp: true       // 自动限制在边界内
        };
        
        this.setupKeyboardShortcuts();
    }
    
    /**
     * 设置键盘快捷键
     */
    setupKeyboardShortcuts() {
        this.keydownHandler = (e) => {
            if (!this.enabled) return;
            if (this.isInputFocused()) return;
            
            // 检查是否有选中的热区
            const selectedIds = this.timeline.selectionController.getSelectedIds();
            if (selectedIds.length === 0) return;
            
            this.handleKeyDown(e, selectedIds);
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
     * 处理键盘按下
     */
    handleKeyDown(e, selectedIds) {
        // 确定步长
        let step = this.steps.fine;
        if (e.ctrlKey && e.shiftKey) {
            step = this.steps.coarse;
            this.mode = 'coarse';
        } else if (e.ctrlKey) {
            step = this.steps.normal;
            this.mode = 'normal';
        } else {
            this.mode = 'fine';
        }
        
        const isBatch = selectedIds.length > 1;
        
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                if (e.altKey) {
                    // Alt+←: 调整开始时间
                    this.adjustStartTime(selectedIds, -step, isBatch);
                } else if (e.shiftKey && !e.ctrlKey) {
                    // Shift+←: 调整结束时间
                    this.adjustEndTime(selectedIds, -step, isBatch);
                } else if (!e.shiftKey && !e.altKey) {
                    // ←: 整体向左移动
                    this.moveTime(selectedIds, -step, isBatch);
                }
                break;
                
            case 'ArrowRight':
                e.preventDefault();
                if (e.altKey) {
                    // Alt+→: 调整开始时间
                    this.adjustStartTime(selectedIds, step, isBatch);
                } else if (e.shiftKey && !e.ctrlKey) {
                    // Shift+→: 调整结束时间
                    this.adjustEndTime(selectedIds, step, isBatch);
                } else if (!e.shiftKey && !e.altKey) {
                    // →: 整体向右移动
                    this.moveTime(selectedIds, step, isBatch);
                }
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                // ↑: 增加持续时间（同时调整结束时间）
                this.adjustDuration(selectedIds, step, isBatch);
                break;
                
            case 'ArrowDown':
                e.preventDefault();
                // ↓: 减少持续时间（同时调整结束时间）
                this.adjustDuration(selectedIds, -step, isBatch);
                break;
        }
    }
    
    /**
     * 调整开始时间（优化版）
     */
    adjustStartTime(selectedIds, delta, isBatch) {
        const hotspots = this.getHotspots();
        const selectedHotspots = hotspots.filter(h => selectedIds.includes(h.id));
        
        if (isBatch) {
            // 批量调整
            const updates = [];
            let adjustedCount = 0;
            
            selectedHotspots.forEach(h => {
                let newStartTime = Math.max(0, h.startTime + delta);
                
                // 应用磁性吸附（如果启用）
                if (this.timeline.snapController && this.timeline.snapController.enabled) {
                    const snapped = this.timeline.snapController.snapTime(newStartTime, h.id);
                    if (snapped.snapped) {
                        newStartTime = snapped.time;
                    }
                }
                
                // 边界检查
                if (newStartTime < h.endTime - 0.1) {
                    updates.push({
                        hotspotId: h.id,
                        oldTime: {
                            startTime: h.startTime,
                            endTime: h.endTime
                        },
                        newTime: {
                            startTime: parseFloat(newStartTime.toFixed(1)),
                            endTime: h.endTime
                        }
                    });
                    adjustedCount++;
                }
            });
            
            if (updates.length > 0) {
                const command = new BatchUpdateTimeCommand(this.scene, updates);
                this.scene.commandManager.execute(command);
                this.clearCache();
                
                this.showFeedback(`⏪ 开始时间 ${delta > 0 ? '+' : ''}${delta.toFixed(1)}s (${adjustedCount}个)`, this.mode);
            }
        } else {
            // 单个调整
            const hotspot = selectedHotspots[0];
            let newStartTime = Math.max(0, hotspot.startTime + delta);
            
            // 应用磁性吸附（如果启用）
            if (this.timeline.snapController && this.timeline.snapController.enabled) {
                const snapped = this.timeline.snapController.snapTime(newStartTime, hotspot.id);
                if (snapped.snapped) {
                    newStartTime = snapped.time;
                }
            }
            
            if (newStartTime < hotspot.endTime - 0.1) {
                const command = new UpdateTimeCommand(
                    this.scene,
                    hotspot.id,
                    { startTime: hotspot.startTime, endTime: hotspot.endTime },
                    { startTime: parseFloat(newStartTime.toFixed(1)), endTime: hotspot.endTime }
                );
                this.scene.commandManager.execute(command);
                this.clearCache();
                
                this.showFeedback(`⏪ 开始: ${newStartTime.toFixed(1)}s`, this.mode);
            }
        }
    }
    
    /**
     * 调整结束时间（优化版）
     */
    adjustEndTime(selectedIds, delta, isBatch) {
        const hotspots = this.getHotspots();
        const selectedHotspots = hotspots.filter(h => selectedIds.includes(h.id));
        
        if (isBatch) {
            // 批量调整
            const updates = [];
            let adjustedCount = 0;
            
            selectedHotspots.forEach(h => {
                let newEndTime = h.endTime + delta;
                
                // 应用磁性吸附（如果启用）
                if (this.timeline.snapController && this.timeline.snapController.enabled) {
                    const snapped = this.timeline.snapController.snapTime(newEndTime, h.id);
                    if (snapped.snapped) {
                        newEndTime = snapped.time;
                    }
                }
                
                // 边界检查
                if (newEndTime > h.startTime + 0.1) {
                    updates.push({
                        hotspotId: h.id,
                        oldTime: {
                            startTime: h.startTime,
                            endTime: h.endTime
                        },
                        newTime: {
                            startTime: h.startTime,
                            endTime: parseFloat(newEndTime.toFixed(1))
                        }
                    });
                    adjustedCount++;
                }
            });
            
            if (updates.length > 0) {
                const command = new BatchUpdateTimeCommand(this.scene, updates);
                this.scene.commandManager.execute(command);
                this.clearCache();
                
                this.showFeedback(`⏩ 结束时间 ${delta > 0 ? '+' : ''}${delta.toFixed(1)}s (${adjustedCount}个)`, this.mode);
            }
        } else {
            // 单个调整
            const hotspot = selectedHotspots[0];
            let newEndTime = hotspot.endTime + delta;
            
            // 应用磁性吸附（如果启用）
            if (this.timeline.snapController && this.timeline.snapController.enabled) {
                const snapped = this.timeline.snapController.snapTime(newEndTime, hotspot.id);
                if (snapped.snapped) {
                    newEndTime = snapped.time;
                }
            }
            
            if (newEndTime > hotspot.startTime + 0.1) {
                const command = new UpdateTimeCommand(
                    this.scene,
                    hotspot.id,
                    { startTime: hotspot.startTime, endTime: hotspot.endTime },
                    { startTime: hotspot.startTime, endTime: parseFloat(newEndTime.toFixed(1)) }
                );
                this.scene.commandManager.execute(command);
                this.clearCache();
                
                this.showFeedback(`⏩ 结束: ${newEndTime.toFixed(1)}s`, this.mode);
            }
        }
    }
    
    /**
     * 整体移动时间（保持持续时间不变 - 优化版）
     */
    moveTime(selectedIds, delta, isBatch) {
        const hotspots = this.getHotspots();
        const selectedHotspots = hotspots.filter(h => selectedIds.includes(h.id));
        
        if (isBatch) {
            // 批量移动
            const updates = [];
            let adjustedCount = 0;
            
            selectedHotspots.forEach(h => {
                const duration = h.endTime - h.startTime;
                let newStartTime = h.startTime + delta;
                
                // 边界检查
                newStartTime = Math.max(0, newStartTime);
                if (this.timeline.videoDuration > 0) {
                    newStartTime = Math.min(newStartTime, this.timeline.videoDuration - duration);
                }
                
                // 应用磁性吸附（如果启用）
                if (this.timeline.snapController && this.timeline.snapController.enabled) {
                    const snapped = this.timeline.snapController.snapTime(newStartTime, h.id);
                    if (snapped.snapped) {
                        newStartTime = snapped.time;
                    }
                }
                
                const newEndTime = newStartTime + duration;
                
                updates.push({
                    hotspotId: h.id,
                    oldTime: {
                        startTime: h.startTime,
                        endTime: h.endTime
                    },
                    newTime: {
                        startTime: parseFloat(newStartTime.toFixed(1)),
                        endTime: parseFloat(newEndTime.toFixed(1))
                    }
                });
                adjustedCount++;
            });
            
            if (updates.length > 0) {
                const command = new BatchUpdateTimeCommand(this.scene, updates);
                this.scene.commandManager.execute(command);
                this.clearCache();
                
                this.showFeedback(`↔️ 移动 ${delta > 0 ? '+' : ''}${delta.toFixed(1)}s (${adjustedCount}个)`, this.mode);
            }
        } else {
            // 单个移动
            const hotspot = selectedHotspots[0];
            const duration = hotspot.endTime - hotspot.startTime;
            let newStartTime = hotspot.startTime + delta;
            
            // 边界检查
            newStartTime = Math.max(0, newStartTime);
            if (this.timeline.videoDuration > 0) {
                newStartTime = Math.min(newStartTime, this.timeline.videoDuration - duration);
            }
            
            // 应用磁性吸附（如果启用）
            if (this.timeline.snapController && this.timeline.snapController.enabled) {
                const snapped = this.timeline.snapController.snapTime(newStartTime, hotspot.id);
                if (snapped.snapped) {
                    newStartTime = snapped.time;
                }
            }
            
            const newEndTime = newStartTime + duration;
            
            const command = new UpdateTimeCommand(
                this.scene,
                hotspot.id,
                { startTime: hotspot.startTime, endTime: hotspot.endTime },
                { startTime: parseFloat(newStartTime.toFixed(1)), endTime: parseFloat(newEndTime.toFixed(1)) }
            );
            this.scene.commandManager.execute(command);
            this.clearCache();
            
            this.showFeedback(`↔️ 移动到: ${newStartTime.toFixed(1)}s`, this.mode);
        }
    }
    
    /**
     * 调整持续时间（优化版）
     */
    adjustDuration(selectedIds, delta, isBatch) {
        const hotspots = this.getHotspots();
        const selectedHotspots = hotspots.filter(h => selectedIds.includes(h.id));
        
        if (isBatch) {
            // 批量调整
            const updates = [];
            let adjustedCount = 0;
            
            selectedHotspots.forEach(h => {
                const newEndTime = h.endTime + delta;
                
                // 边界检查
                if (newEndTime > h.startTime + 0.1) {
                    updates.push({
                        hotspotId: h.id,
                        oldTime: {
                            startTime: h.startTime,
                            endTime: h.endTime
                        },
                        newTime: {
                            startTime: h.startTime,
                            endTime: parseFloat(newEndTime.toFixed(1))
                        }
                    });
                    adjustedCount++;
                }
            });
            
            if (updates.length > 0) {
                const command = new BatchUpdateTimeCommand(this.scene, updates);
                this.scene.commandManager.execute(command);
                this.clearCache();
                
                this.showFeedback(`⏱️ 时长 ${delta > 0 ? '+' : ''}${delta.toFixed(1)}s (${adjustedCount}个)`, this.mode);
            }
        } else {
            // 单个调整
            const hotspot = selectedHotspots[0];
            const newEndTime = hotspot.endTime + delta;
            
            if (newEndTime > hotspot.startTime + 0.1) {
                const command = new UpdateTimeCommand(
                    this.scene,
                    hotspot.id,
                    { startTime: hotspot.startTime, endTime: hotspot.endTime },
                    { startTime: hotspot.startTime, endTime: parseFloat(newEndTime.toFixed(1)) }
                );
                this.scene.commandManager.execute(command);
                this.clearCache();
                
                const newDuration = (newEndTime - hotspot.startTime).toFixed(1);
                this.showFeedback(`⏱️ 时长: ${newDuration}s`, this.mode);
            }
        }
    }
    
    /**
     * 显示反馈信息
     */
    showFeedback(message, mode) {
        // 根据模式选择颜色
        let color = '#2196F3';
        let modeText = '';
        
        switch (mode) {
            case 'fine':
                color = '#4CAF50';
                modeText = '精细(0.1s)';
                break;
            case 'normal':
                color = '#2196F3';
                modeText = '正常(1s)';
                break;
            case 'coarse':
                color = '#FF9800';
                modeText = '粗调(10s)';
                break;
        }
        
        // 添加磁性吸附状态提示
        let snapStatus = '';
        if (this.timeline.snapController && this.timeline.snapController.enabled) {
            snapStatus = ' 🧲';
        }
        
        this.scene.events.emit('ui:showToast', {
            message: `${message}${snapStatus} [${modeText}]`,
            duration: 1500,
            color: color
        });
        
        // 触发重绘
        this.timeline.render();
    }
    
    /**
     * 批量调整优化（减少重复计算）
     * @param {Array} selectedIds - 选中的热区ID
     * @param {Function} adjustFunc - 调整函数
     * @returns {Array} 更新列表
     */
    batchAdjustOptimized(selectedIds, adjustFunc) {
        const hotspots = this.scene.registry.get('hotspots') || [];
        const selectedHotspots = hotspots.filter(h => selectedIds.includes(h.id));
        
        const updates = [];
        
        // 批量处理，减少重复的边界检查
        for (const hotspot of selectedHotspots) {
            const result = adjustFunc(hotspot);
            if (result) {
                updates.push(result);
            }
        }
        
        return updates;
    }
    
    /**
     * 获取当前调整信息（用于调试和监控）
     */
    getAdjustInfo() {
        return {
            enabled: this.enabled,
            mode: this.mode,
            currentStep: this.steps[this.mode],
            steps: { ...this.steps },
            snapEnabled: this.timeline.snapController ? this.timeline.snapController.enabled : false,
            smartBoundary: { ...this.smartBoundary },
            cacheEnabled: this.hotspotsCache !== null
        };
    }
    
    /**
     * 设置预览模式
     */
    setPreviewEnabled(enabled) {
        this.previewEnabled = enabled;
    }
    
    /**
     * 设置智能边界
     */
    setSmartBoundary(enabled, warnThreshold = 0.5, autoClamp = true) {
        this.smartBoundary.enabled = enabled;
        this.smartBoundary.warnThreshold = warnThreshold;
        this.smartBoundary.autoClamp = autoClamp;
    }
    
    /**
     * 启用/禁用控制器
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    
    /**
     * 获取当前步长
     */
    getCurrentStep() {
        return this.steps[this.mode];
    }
    
    /**
     * 设置步长
     */
    setStep(mode, value) {
        if (this.steps.hasOwnProperty(mode)) {
            this.steps[mode] = value;
        }
    }
    
    /**
     * 清理资源
     */
    destroy() {
        if (this.keydownHandler) {
            window.removeEventListener('keydown', this.keydownHandler);
        }
        this.clearCache();
        console.log('TimelineFineAdjustController destroyed');
    }
}
