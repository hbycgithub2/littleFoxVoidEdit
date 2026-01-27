// src/dom/timeline/TimelineDragController.js
// 时间轴拖拽控制器 - 管理热区时间条的拖拽操作

import { UpdateTimeCommand, BatchUpdateTimeCommand } from '../../core/CommandManager.js';

/**
 * 时间轴拖拽控制器
 * 职责：
 * 1. 检测热区时间条的点击（手柄/主体）
 * 2. 处理拖拽开始/移动/结束
 * 3. 支持拖拽手柄调整时间
 * 4. 支持拖拽主体整体移动
 * 5. 集成撤销/重做命令
 */
export default class TimelineDragController {
    constructor(timelinePanel) {
        this.timeline = timelinePanel;
        this.scene = timelinePanel.scene;
        
        // 拖拽状态
        this.isDragging = false;
        this.dragTarget = null;
        this.dragStartTime = null; // 记录拖拽开始时的时间（用于撤销/重做）
        this.dragStartX = null; // 记录拖拽开始时的鼠标 X 坐标（用于整体移动）
        this.batchOriginalTimes = null; // 批量操作时保存所有热区的原始时间
        
        // 常量
        this.handleWidth = 5; // 手柄宽度
        this.barHeight = 20; // 时间条高度
    }
    
    /**
     * 检测热区时间条点击
     * @param {number} x - 鼠标 X 坐标
     * @param {number} y - 鼠标 Y 坐标
     * @returns {object|null} 拖拽目标或 null
     */
    hitTest(x, y) {
        if (!this.scene) return null;
        
        const hotspots = this.scene.registry.get('hotspots') || [];
        
        for (const config of hotspots) {
            // 使用图层分组控制器获取热区的 Y 坐标
            const barY = this.timeline.layerGroupController.getHotspotY(config);
            
            if (barY === null) continue; // 图层折叠时跳过
            
            const x1 = config.startTime * this.timeline.scale;
            const x2 = config.endTime * this.timeline.scale;
            
            // 检查是否在时间条的 Y 范围内
            if (y < barY || y > barY + this.barHeight) continue;
            
            // 优先检查开始手柄（左侧）
            if (Math.abs(x - x1) < this.handleWidth) {
                return { hotspot: config, handle: 'start' };
            }
            
            // 检查结束手柄（右侧）
            if (Math.abs(x - x2) < this.handleWidth) {
                return { hotspot: config, handle: 'end' };
            }
            
            // 检查时间条中间区域（整体移动）
            if (x > x1 + this.handleWidth && x < x2 - this.handleWidth) {
                return { hotspot: config, handle: 'body' };
            }
        }
        
        return null;
    }
    
    /**
     * 开始拖拽（优化版 - 支持批量操作）
     * @param {object} target - 拖拽目标
     * @param {number} x - 鼠标 X 坐标
     */
    startDrag(target, x) {
        this.isDragging = true;
        this.dragTarget = target;
        this.dragStartX = x;
        
        // 记录拖拽开始时的时间（用于撤销/重做）
        this.dragStartTime = {
            startTime: target.hotspot.startTime,
            endTime: target.hotspot.endTime
        };
        
        // 检查是否多选
        const selectedIds = this.timeline.selectionController.getSelectedIds();
        const isMultiSelect = selectedIds.length > 1 && selectedIds.includes(target.hotspot.id);
        
        if (isMultiSelect) {
            // 批量操作：保存所有选中热区的原始时间
            this.batchOriginalTimes = new Map();
            const hotspots = this.scene.registry.get('hotspots') || [];
            
            hotspots.forEach(config => {
                if (selectedIds.includes(config.id)) {
                    this.batchOriginalTimes.set(config.id, {
                        startTime: config.startTime,
                        endTime: config.endTime
                    });
                }
            });
            
            console.log(`🎯 开始批量拖拽 ${selectedIds.length} 个热区`);
        }
    }
    
    /**
     * 拖拽中（优化版 - 支持批量调整）
     * @param {number} x - 当前鼠标 X 坐标
     */
    drag(x) {
        if (!this.isDragging || !this.dragTarget) return;
        
        let time = x / this.timeline.scale;
        const { hotspot, handle } = this.dragTarget;
        
        // 检查是否多选
        const selectedIds = this.timeline.selectionController.getSelectedIds();
        const isMultiSelect = selectedIds.length > 1 && selectedIds.includes(hotspot.id);
        
        if (handle === 'start') {
            // 拖拽开始手柄
            // 应用吸附
            if (this.timeline.snapController) {
                time = this.timeline.snapController.snapTime(time, hotspot.id);
            }
            
            const newStartTime = Math.max(0, Math.min(time, hotspot.endTime - 0.1));
            const deltaTime = newStartTime - this.dragStartTime.startTime;
            
            if (isMultiSelect) {
                // 批量调整开始时间
                this.batchAdjustStartTime(deltaTime);
            } else {
                // 单个调整
                hotspot.startTime = newStartTime;
                this.updateHotspotTimeImmediate(hotspot);
            }
            
        } else if (handle === 'end') {
            // 拖拽结束手柄
            // 应用吸附
            if (this.timeline.snapController) {
                time = this.timeline.snapController.snapTime(time, hotspot.id);
            }
            
            const newEndTime = Math.max(hotspot.startTime + 0.1, time);
            const deltaTime = newEndTime - this.dragStartTime.endTime;
            
            if (isMultiSelect) {
                // 批量调整结束时间
                this.batchAdjustEndTime(deltaTime);
            } else {
                // 单个调整
                hotspot.endTime = newEndTime;
                this.updateHotspotTimeImmediate(hotspot);
            }
            
        } else if (handle === 'body') {
            // 拖拽整个时间条（保持持续时间不变）
            const deltaX = x - this.dragStartX;
            const deltaTime = deltaX / this.timeline.scale;
            
            const duration = this.dragStartTime.endTime - this.dragStartTime.startTime;
            let newStartTime = this.dragStartTime.startTime + deltaTime;
            
            // 应用吸附（吸附开始时间）
            if (this.timeline.snapController) {
                newStartTime = this.timeline.snapController.snapTime(newStartTime, hotspot.id);
            }
            
            // 限制在有效范围内
            newStartTime = Math.max(0, newStartTime);
            if (this.timeline.videoDuration > 0) {
                newStartTime = Math.min(newStartTime, this.timeline.videoDuration - duration);
            }
            
            if (isMultiSelect) {
                // 批量移动（保持相对位置）
                const actualDelta = newStartTime - this.dragStartTime.startTime;
                this.batchMoveTime(actualDelta);
            } else {
                // 单个移动
                hotspot.startTime = newStartTime;
                hotspot.endTime = newStartTime + duration;
                this.updateHotspotTimeImmediate(hotspot);
            }
        }
        
        this.timeline.render();
    }
    
    /**
     * 批量调整开始时间（优化版 - 更好的边界检查）
     * @param {number} deltaTime - 时间偏移量
     */
    batchAdjustStartTime(deltaTime) {
        const selectedIds = this.timeline.selectionController.getSelectedIds();
        const hotspots = this.scene.registry.get('hotspots') || [];
        
        let adjustedCount = 0;
        
        hotspots.forEach(config => {
            if (selectedIds.includes(config.id)) {
                const newStartTime = Math.max(0, config.startTime + deltaTime);
                // 确保开始时间不超过结束时间（保留最小间隔0.1秒）
                if (newStartTime < config.endTime - 0.1) {
                    config.startTime = newStartTime;
                    this.updateHotspotTimeImmediate(config);
                    adjustedCount++;
                }
            }
        });
        
        return adjustedCount;
    }
    
    /**
     * 批量调整结束时间（优化版 - 更好的边界检查）
     * @param {number} deltaTime - 时间偏移量
     */
    batchAdjustEndTime(deltaTime) {
        const selectedIds = this.timeline.selectionController.getSelectedIds();
        const hotspots = this.scene.registry.get('hotspots') || [];
        
        let adjustedCount = 0;
        
        hotspots.forEach(config => {
            if (selectedIds.includes(config.id)) {
                const newEndTime = config.endTime + deltaTime;
                // 确保结束时间不小于开始时间（保留最小间隔0.1秒）
                if (newEndTime > config.startTime + 0.1) {
                    config.endTime = newEndTime;
                    this.updateHotspotTimeImmediate(config);
                    adjustedCount++;
                }
            }
        });
        
        return adjustedCount;
    }
    
    /**
     * 批量移动时间（优化版 - 更好的边界检查和相对位置保持）
     * @param {number} deltaTime - 时间偏移量
     */
    batchMoveTime(deltaTime) {
        const selectedIds = this.timeline.selectionController.getSelectedIds();
        const hotspots = this.scene.registry.get('hotspots') || [];
        
        // 第一遍：检查是否所有热区都能移动
        let canMoveAll = true;
        let maxDelta = deltaTime;
        
        hotspots.forEach(config => {
            if (selectedIds.includes(config.id)) {
                const duration = config.endTime - config.startTime;
                let newStartTime = config.startTime + deltaTime;
                
                // 检查下边界
                if (newStartTime < 0) {
                    const adjustment = -config.startTime;
                    maxDelta = Math.max(maxDelta, adjustment);
                }
                
                // 检查上边界
                if (this.timeline.videoDuration > 0) {
                    const maxStart = this.timeline.videoDuration - duration;
                    if (newStartTime > maxStart) {
                        const adjustment = maxStart - config.startTime;
                        maxDelta = Math.min(maxDelta, adjustment);
                    }
                }
            }
        });
        
        // 第二遍：应用调整后的偏移量
        let adjustedCount = 0;
        hotspots.forEach(config => {
            if (selectedIds.includes(config.id)) {
                const duration = config.endTime - config.startTime;
                let newStartTime = config.startTime + maxDelta;
                
                // 最终边界检查
                newStartTime = Math.max(0, newStartTime);
                if (this.timeline.videoDuration > 0) {
                    newStartTime = Math.min(newStartTime, this.timeline.videoDuration - duration);
                }
                
                config.startTime = newStartTime;
                config.endTime = newStartTime + duration;
                this.updateHotspotTimeImmediate(config);
                adjustedCount++;
            }
        });
        
        return adjustedCount;
    }
    
    /**
     * 结束拖拽（优化版 - 使用批量命令）
     */
    endDrag() {
        if (!this.isDragging || !this.dragTarget || !this.dragStartTime) {
            this.isDragging = false;
            this.dragTarget = null;
            this.dragStartTime = null;
            this.dragStartX = null;
            
            // 清除吸附状态
            if (this.timeline.snapController) {
                this.timeline.snapController.clearSnap();
                this.timeline.render();
            }
            return;
        }
        
        const { hotspot } = this.dragTarget;
        
        // 检查是否多选
        const selectedIds = this.timeline.selectionController.getSelectedIds();
        const isMultiSelect = selectedIds.length > 1 && selectedIds.includes(hotspot.id);
        
        if (isMultiSelect) {
            // 批量操作：使用单个批量命令
            const hotspots = this.scene.registry.get('hotspots') || [];
            const updates = [];
            
            hotspots.forEach(config => {
                if (selectedIds.includes(config.id)) {
                    // 获取原始时间（从拖拽开始时保存的状态）
                    const originalTime = this.getOriginalTime(config.id);
                    
                    // 检查时间是否真的改变了
                    const timeChanged = 
                        originalTime.startTime !== config.startTime ||
                        originalTime.endTime !== config.endTime;
                    
                    if (timeChanged) {
                        updates.push({
                            hotspotId: config.id,
                            oldTime: originalTime,
                            newTime: {
                                startTime: config.startTime,
                                endTime: config.endTime
                            }
                        });
                    }
                }
            });
            
            if (updates.length > 0) {
                // 使用批量命令（一次撤销/重做操作）
                const command = new BatchUpdateTimeCommand(this.scene, updates);
                
                // 直接添加到历史记录（不调用execute，因为已经更新了）
                this.scene.commandManager.history.push(command);
                
                // 清空重做栈
                this.scene.commandManager.redoStack = [];
                
                // 发送历史变化事件
                this.scene.events.emit('history:changed', {
                    canUndo: this.scene.commandManager.canUndo(),
                    canRedo: this.scene.commandManager.canRedo()
                });
                
                // 显示Toast提示
                this.scene.events.emit('ui:showToast', {
                    message: `✓ 已调整 ${updates.length} 个热区的时间`,
                    duration: 2000,
                    color: '#4CAF50'
                });
                
                console.log(`🎯 批量调整完成: ${updates.length}个热区`);
            }
        } else {
            // 单个操作：原有逻辑
            // 检查时间是否真的改变了
            const timeChanged = 
                this.dragStartTime.startTime !== hotspot.startTime ||
                this.dragStartTime.endTime !== hotspot.endTime;
            
            if (timeChanged) {
                // 创建命令并添加到历史记录
                const command = new UpdateTimeCommand(
                    this.scene,
                    hotspot.id,
                    this.dragStartTime,
                    {
                        startTime: hotspot.startTime,
                        endTime: hotspot.endTime
                    }
                );
                
                // 注意：不调用 execute()，因为时间已经在拖拽过程中更新了
                // 直接添加到历史记录
                this.scene.commandManager.history.push(command);
                
                // 清空重做栈
                this.scene.commandManager.redoStack = [];
                
                // 发送历史变化事件
                this.scene.events.emit('history:changed', {
                    canUndo: this.scene.commandManager.canUndo(),
                    canRedo: this.scene.commandManager.canRedo()
                });
            }
        }
        
        this.isDragging = false;
        this.dragTarget = null;
        this.dragStartTime = null;
        this.dragStartX = null;
        this.batchOriginalTimes = null;
        
        // 清除吸附状态
        if (this.timeline.snapController) {
            this.timeline.snapController.clearSnap();
            this.timeline.render();
        }
    }
    
    /**
     * 获取热区的原始时间（拖拽开始时）
     * @param {string} hotspotId - 热区ID
     * @returns {object} 原始时间 {startTime, endTime}
     */
    getOriginalTime(hotspotId) {
        // 如果是主拖拽目标，使用保存的时间
        if (this.dragTarget && this.dragTarget.hotspot.id === hotspotId) {
            return this.dragStartTime;
        }
        
        // 否则从批量原始时间中获取
        if (!this.batchOriginalTimes) {
            this.batchOriginalTimes = new Map();
        }
        
        if (!this.batchOriginalTimes.has(hotspotId)) {
            // 如果没有保存，从当前状态获取（不应该发生）
            const hotspots = this.scene.registry.get('hotspots') || [];
            const config = hotspots.find(h => h.id === hotspotId);
            if (config) {
                return {
                    startTime: config.startTime,
                    endTime: config.endTime
                };
            }
        }
        
        return this.batchOriginalTimes.get(hotspotId);
    }
    
    /**
     * 检查是否正在拖拽
     * @returns {boolean} 是否拖拽中
     */
    isDraggingBar() {
        return this.isDragging;
    }
    
    /**
     * 获取光标样式
     * @param {number} x - 鼠标 X 坐标
     * @param {number} y - 鼠标 Y 坐标
     * @returns {string|null} 光标样式或 null
     */
    getCursor(x, y) {
        const target = this.hitTest(x, y);
        if (!target) return null;
        
        if (target.handle === 'body') {
            return 'move';
        } else {
            return 'ew-resize';
        }
    }
    
    /**
     * 实时更新热区时间（拖拽过程中，不使用命令模式）
     * @param {object} config - 热区配置
     */
    updateHotspotTimeImmediate(config) {
        if (!this.scene) return;
        
        const hotspot = this.scene.hotspots.find(h => h.config.id === config.id);
        if (hotspot) {
            hotspot.config.startTime = config.startTime;
            hotspot.config.endTime = config.endTime;
            this.scene.syncToRegistry();
        }
    }
    
    /**
     * 清理资源
     */
    destroy() {
        this.isDragging = false;
        this.dragTarget = null;
        this.dragStartTime = null;
        this.dragStartX = null;
        console.log('TimelineDragController destroyed');
    }
}
