// src/dom/timeline/TimelineHorizontalScrollController.js
// 时间轴水平滚动控制器

export default class TimelineHorizontalScrollController {
    constructor(timelinePanel) {
        this.timeline = timelinePanel;
        this.scrollX = 0;
        this.isDragging = false;
        this.lastMouseX = 0;
    }
    
    /**
     * 获取最大滚动距离（添加额外空白区域）
     */
    getMaxScrollX() {
        const totalWidth = this.timeline.videoDuration * this.timeline.scale;
        const canvasWidth = this.timeline.canvas.width;
        // 添加额外的空白区域（视频结束后还能继续滚动2倍画布宽度）
        const extraSpace = canvasWidth * 2;
        return Math.max(0, totalWidth + extraSpace - canvasWidth);
    }
    
    /**
     * 处理滚轮事件（Shift+滚轮水平滚动）
     */
    handleWheel(e) {
        if (!e.shiftKey) return false;
        
        const delta = e.deltaY;
        const maxScrollX = this.getMaxScrollX();
        this.scrollX = Math.max(0, Math.min(maxScrollX, this.scrollX + delta));
        this.timeline.render();
        return true;
    }
    
    /**
     * 开始拖拽滚动（中键或Shift+左键）
     */
    startDrag(mouseX) {
        this.isDragging = true;
        this.lastMouseX = mouseX;
    }
    
    /**
     * 拖拽滚动
     */
    drag(mouseX) {
        if (!this.isDragging) return false;
        
        const deltaX = this.lastMouseX - mouseX;
        const maxScrollX = this.getMaxScrollX();
        this.scrollX = Math.max(0, Math.min(maxScrollX, this.scrollX + deltaX));
        this.lastMouseX = mouseX;
        this.timeline.render();
        return true;
    }
    
    /**
     * 结束拖拽
     */
    endDrag() {
        this.isDragging = false;
    }
    
    /**
     * 应用水平滚动偏移
     */
    applyScroll(ctx) {
        ctx.save();
        ctx.translate(-this.scrollX, 0);
    }
    
    /**
     * 恢复水平滚动偏移
     */
    restoreScroll(ctx) {
        ctx.restore();
    }
    
    /**
     * 获取光标样式
     */
    getCursor() {
        return this.isDragging ? 'grabbing' : null;
    }
    
    /**
     * 清理
     */
    destroy() {
        this.timeline = null;
    }
}
