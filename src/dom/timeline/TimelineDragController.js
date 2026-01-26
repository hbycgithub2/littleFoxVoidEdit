// src/dom/timeline/TimelineDragController.js
// 时间轴拖拽控制器 - 管理热区时间条的拖拽操作

import { UpdateTimeCommand } from '../../core/CommandManager.js';

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
     * 开始拖拽
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
    }
    
    /**
     * 拖拽中
     * @param {number} x - 当前鼠标 X 坐标
     */
    drag(x) {
        if (!this.isDragging || !this.dragTarget) return;
        
        let time = x / this.timeline.scale;
        const { hotspot, handle } = this.dragTarget;
        
        if (handle === 'start') {
            // 拖拽开始手柄
            // 应用吸附
            if (this.timeline.snapController) {
                time = this.timeline.snapController.snapTime(time, hotspot.id);
            }
            hotspot.startTime = Math.max(0, Math.min(time, hotspot.endTime - 0.1));
        } else if (handle === 'end') {
            // 拖拽结束手柄
            // 应用吸附
            if (this.timeline.snapController) {
                time = this.timeline.snapController.snapTime(time, hotspot.id);
            }
            hotspot.endTime = Math.max(hotspot.startTime + 0.1, time);
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
            
            hotspot.startTime = newStartTime;
            hotspot.endTime = newStartTime + duration;
        }
        
        // 实时更新场景中的热区（不使用命令模式）
        this.updateHotspotTimeImmediate(hotspot);
        this.timeline.render();
    }
    
    /**
     * 结束拖拽
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
        
        this.isDragging = false;
        this.dragTarget = null;
        this.dragStartTime = null;
        this.dragStartX = null;
        
        // 清除吸附状态
        if (this.timeline.snapController) {
            this.timeline.snapController.clearSnap();
            this.timeline.render();
        }
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
