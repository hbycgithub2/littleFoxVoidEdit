// src/utils/RenderOptimizer.js
// 渲染优化工具 - 减少不必要的渲染调用（遵循 Phaser 3 标准）

export default class RenderOptimizer {
    constructor(scene) {
        this.scene = scene;
        this.dirtyObjects = new Set();
        this.renderScheduled = false;
    }
    
    /**
     * 标记对象为脏（需要重绘）
     * @param {object} obj - 需要重绘的对象
     */
    markDirty(obj) {
        this.dirtyObjects.add(obj);
        this.scheduleRender();
    }
    
    /**
     * 调度渲染（使用 RAF 优化）
     * @private
     */
    scheduleRender() {
        if (this.renderScheduled) return;
        
        this.renderScheduled = true;
        
        // 使用 Phaser 的下一帧回调（遵循 Phaser 标准）
        this.scene.time.delayedCall(0, () => {
            this.render();
            this.renderScheduled = false;
        });
    }
    
    /**
     * 执行渲染
     * @private
     */
    render() {
        if (this.dirtyObjects.size === 0) return;
        
        // 批量更新所有脏对象
        this.dirtyObjects.forEach(obj => {
            if (obj.updateVisual && typeof obj.updateVisual === 'function') {
                obj.updateVisual();
            }
        });
        
        this.dirtyObjects.clear();
    }
    
    /**
     * 清理
     */
    destroy() {
        this.dirtyObjects.clear();
        this.renderScheduled = false;
    }
}
