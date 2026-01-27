// src/utils/DragResizePerformanceHelper.js
// 拖拽缩放性能优化工具 - 完全遵循 Phaser 3 官方标准
// 功能：节流、批量更新、脏标记

export default class DragResizePerformanceHelper {
    constructor(scene) {
        this.scene = scene;
        
        // 节流配置
        this.throttleDelay = 16; // 约 60 FPS
        this.lastUpdateTime = 0;
        
        // 批量更新队列
        this.updateQueue = new Set();
        this.isProcessing = false;
        
        // 性能统计
        this.stats = {
            dragCount: 0,
            resizeCount: 0,
            throttledCount: 0,
            batchCount: 0
        };
        
        this.setupEvents();
    }
    
    /**
     * 设置事件监听（遵循 Phaser 官方标准）
     */
    setupEvents() {
        // 监听拖拽事件（应用节流）
        this.scene.events.on('hotspot:drag', (hotspot, pointer) => {
            this.throttledDrag(hotspot, pointer);
        });
        
        // 监听缩放事件（应用节流）
        this.scene.events.on('hotspot:resized', (data) => {
            this.throttledResize(data.hotspot);
        });
    }
    
    /**
     * 节流拖拽更新（遵循 Phaser 官方标准）
     */
    throttledDrag(hotspot, pointer) {
        const now = Date.now();
        
        if (now - this.lastUpdateTime < this.throttleDelay) {
            this.stats.throttledCount++;
            // 添加到队列，稍后批量处理
            this.updateQueue.add(hotspot);
            this.scheduleBatchUpdate();
            return;
        }
        
        this.lastUpdateTime = now;
        this.stats.dragCount++;
        
        // 立即更新
        this.updateHotspot(hotspot);
    }
    
    /**
     * 节流缩放更新（遵循 Phaser 官方标准）
     */
    throttledResize(hotspot) {
        const now = Date.now();
        
        if (now - this.lastUpdateTime < this.throttleDelay) {
            this.stats.throttledCount++;
            // 添加到队列，稍后批量处理
            this.updateQueue.add(hotspot);
            this.scheduleBatchUpdate();
            return;
        }
        
        this.lastUpdateTime = now;
        this.stats.resizeCount++;
        
        // 立即更新
        this.updateHotspot(hotspot);
    }
    
    /**
     * 调度批量更新（遵循 Phaser 官方标准）
     */
    scheduleBatchUpdate() {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        
        // 使用 requestAnimationFrame 在下一帧批量更新
        requestAnimationFrame(() => {
            this.processBatchUpdate();
        });
    }
    
    /**
     * 处理批量更新（遵循 Phaser 官方标准）
     */
    processBatchUpdate() {
        if (this.updateQueue.size === 0) {
            this.isProcessing = false;
            return;
        }
        
        this.stats.batchCount++;
        
        // 批量更新所有热区
        this.updateQueue.forEach(hotspot => {
            this.updateHotspot(hotspot);
        });
        
        this.updateQueue.clear();
        this.isProcessing = false;
    }
    
    /**
     * 更新热区（遵循 Phaser 官方标准）
     */
    updateHotspot(hotspot) {
        // 只在需要时更新（使用脏标记）
        if (hotspot._isDirty) {
            hotspot.updateVisual();
        }
        
        // 更新手柄位置
        if (hotspot.updateHandlePositions) {
            hotspot.updateHandlePositions();
        }
    }
    
    /**
     * 获取性能统计（遵循 Phaser 官方标准）
     */
    getStats() {
        return {
            ...this.stats,
            queueSize: this.updateQueue.size,
            throttleRate: this.stats.throttledCount / 
                         (this.stats.dragCount + this.stats.resizeCount + this.stats.throttledCount)
        };
    }
    
    /**
     * 重置统计（遵循 Phaser 官方标准）
     */
    resetStats() {
        this.stats = {
            dragCount: 0,
            resizeCount: 0,
            throttledCount: 0,
            batchCount: 0
        };
    }
    
    /**
     * 销毁（遵循 Phaser 官方标准）
     */
    destroy() {
        this.updateQueue.clear();
        this.scene.events.off('hotspot:drag');
        this.scene.events.off('hotspot:resized');
    }
}
