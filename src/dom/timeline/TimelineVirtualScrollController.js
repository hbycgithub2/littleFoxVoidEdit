// src/dom/timeline/TimelineVirtualScrollController.js
// 时间轴虚拟滚动控制器 - 优化大量热区时的性能

/**
 * 时间轴虚拟滚动控制器
 * 职责：
 * 1. 计算可见区域
 * 2. 只渲染可见的时间条和标记
 * 3. 管理垂直滚动
 * 4. 绘制滚动条
 * 5. 性能优化
 */
export default class TimelineVirtualScrollController {
    constructor(timelinePanel) {
        this.timeline = timelinePanel;
        this.scene = timelinePanel.scene;
        
        // 滚动状态
        this.scrollY = 0; // 垂直滚动偏移
        this.maxScrollY = 0; // 最大滚动距离
        
        // 可见区域
        this.visibleStartY = 0;
        this.visibleEndY = 0;
        
        // 滚动条
        this.scrollbarWidth = 12;
        this.scrollbarVisible = false;
        this.isDraggingScrollbar = false;
        this.scrollbarDragStartY = 0;
        this.scrollbarDragStartScroll = 0;
        
        // 性能优化
        this.renderCache = new Map(); // 渲染缓存
        this.lastRenderTime = 0;
        this.renderThrottle = 16; // 16ms (60fps)
        
        // 虚拟化设置
        this.enabled = true;
        this.bufferSize = 50; // 缓冲区大小（像素）
    }
    
    /**
     * 更新可见区域
     */
    updateVisibleArea() {
        const canvasHeight = this.timeline.canvas.height;
        
        this.visibleStartY = this.scrollY - this.bufferSize;
        this.visibleEndY = this.scrollY + canvasHeight + this.bufferSize;
        
        // 计算最大滚动距离
        this.calculateMaxScroll();
        
        // 限制滚动范围
        this.scrollY = Math.max(0, Math.min(this.scrollY, this.maxScrollY));
        
        // 更新滚动条可见性
        this.scrollbarVisible = this.maxScrollY > 0;
    }
    
    /**
     * 计算最大滚动距离
     */
    calculateMaxScroll() {
        if (!this.scene) {
            this.maxScrollY = 0;
            return;
        }
        
        const layers = this.scene.layerManager.getLayers();
        const hotspots = this.scene.registry.get('hotspots') || [];
        
        let totalHeight = 30 + 10; // 时间刻度高度 + 间距
        
        layers.forEach(layer => {
            totalHeight += 25; // 图层标题高度
            
            // 如果图层未折叠，计算热区高度
            if (!this.timeline.layerGroupController.isLayerCollapsed(layer.id)) {
                const layerHotspots = hotspots.filter(h => h.layerId === layer.id);
                
                if (layerHotspots.length > 0) {
                    totalHeight += layerHotspots.length * (20 + 5); // 热区高度 + 间距
                } else {
                    totalHeight += 20; // 空图层提示高度
                }
            }
        });
        
        const canvasHeight = this.timeline.canvas.height;
        this.maxScrollY = Math.max(0, totalHeight - canvasHeight);
    }
    
    /**
     * 检查元素是否在可见区域内
     * @param {number} y - 元素 Y 坐标
     * @param {number} height - 元素高度
     * @returns {boolean} 是否可见
     */
    isVisible(y, height = 0) {
        if (!this.enabled) return true;
        
        const adjustedY = y - this.scrollY;
        return adjustedY + height >= this.visibleStartY && 
               adjustedY <= this.visibleEndY;
    }
    
    /**
     * 过滤可见的热区
     * @param {Array} hotspots - 热区数组
     * @returns {Array} 可见的热区数组
     */
    filterVisibleHotspots(hotspots) {
        if (!this.enabled) return hotspots;
        
        return hotspots.filter(config => {
            const barY = this.timeline.layerGroupController.getHotspotY(config);
            if (barY === null) return false;
            
            return this.isVisible(barY, 20);
        });
    }
    
    /**
     * 滚动到指定位置
     * @param {number} y - 目标 Y 坐标
     * @param {boolean} smooth - 是否平滑滚动
     */
    scrollTo(y, smooth = false) {
        const targetY = Math.max(0, Math.min(y, this.maxScrollY));
        
        if (smooth) {
            // 平滑滚动动画
            this.smoothScrollTo(targetY);
        } else {
            this.scrollY = targetY;
            this.updateVisibleArea();
            this.timeline.render();
        }
    }
    
    /**
     * 平滑滚动到指定位置
     * @param {number} targetY - 目标 Y 坐标
     */
    smoothScrollTo(targetY) {
        const startY = this.scrollY;
        const distance = targetY - startY;
        const duration = 300; // 300ms
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 缓动函数（ease-out）
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            this.scrollY = startY + distance * easeProgress;
            this.updateVisibleArea();
            this.timeline.render();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    /**
     * 处理滚轮事件
     * @param {WheelEvent} e - 滚轮事件
     */
    handleWheel(e) {
        if (!this.scrollbarVisible) return false;
        
        e.preventDefault();
        
        // 垂直滚动
        const delta = e.deltaY;
        this.scrollY += delta;
        
        this.updateVisibleArea();
        this.timeline.render();
        
        return true;
    }
    
    /**
     * 检测滚动条点击
     * @param {number} x - 鼠标 X 坐标
     * @param {number} y - 鼠标 Y 坐标
     * @returns {boolean} 是否点击了滚动条
     */
    hitTestScrollbar(x, y) {
        if (!this.scrollbarVisible) return false;
        
        const canvasWidth = this.timeline.canvas.width;
        const scrollbarX = canvasWidth - this.scrollbarWidth;
        
        return x >= scrollbarX;
    }
    
    /**
     * 开始拖拽滚动条
     * @param {number} y - 鼠标 Y 坐标
     */
    startDragScrollbar(y) {
        this.isDraggingScrollbar = true;
        this.scrollbarDragStartY = y;
        this.scrollbarDragStartScroll = this.scrollY;
    }
    
    /**
     * 拖拽滚动条
     * @param {number} y - 当前鼠标 Y 坐标
     */
    dragScrollbar(y) {
        if (!this.isDraggingScrollbar) return;
        
        const deltaY = y - this.scrollbarDragStartY;
        const canvasHeight = this.timeline.canvas.height;
        const scrollbarHeight = this.getScrollbarHeight();
        
        // 计算滚动比例
        const scrollRatio = deltaY / (canvasHeight - scrollbarHeight);
        const scrollDelta = scrollRatio * this.maxScrollY;
        
        this.scrollY = this.scrollbarDragStartScroll + scrollDelta;
        this.updateVisibleArea();
        this.timeline.render();
    }
    
    /**
     * 结束拖拽滚动条
     */
    endDragScrollbar() {
        this.isDraggingScrollbar = false;
    }
    
    /**
     * 获取滚动条高度
     * @returns {number} 滚动条高度
     */
    getScrollbarHeight() {
        const canvasHeight = this.timeline.canvas.height;
        const totalHeight = canvasHeight + this.maxScrollY;
        
        // 滚动条高度与可见区域的比例
        const ratio = canvasHeight / totalHeight;
        return Math.max(30, canvasHeight * ratio);
    }
    
    /**
     * 获取滚动条位置
     * @returns {number} 滚动条 Y 坐标
     */
    getScrollbarY() {
        const canvasHeight = this.timeline.canvas.height;
        const scrollbarHeight = this.getScrollbarHeight();
        
        // 滚动条位置与滚动进度的比例
        const scrollRatio = this.scrollY / this.maxScrollY;
        return scrollRatio * (canvasHeight - scrollbarHeight);
    }
    
    /**
     * 绘制滚动条
     * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
     */
    drawScrollbar(ctx) {
        if (!this.scrollbarVisible) return;
        
        const canvasWidth = this.timeline.canvas.width;
        const canvasHeight = this.timeline.canvas.height;
        const scrollbarX = canvasWidth - this.scrollbarWidth;
        const scrollbarY = this.getScrollbarY();
        const scrollbarHeight = this.getScrollbarHeight();
        
        // 绘制滚动条轨道
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(scrollbarX, 0, this.scrollbarWidth, canvasHeight);
        
        // 绘制滚动条滑块
        ctx.fillStyle = this.isDraggingScrollbar ? 
            'rgba(255, 255, 255, 0.6)' : 
            'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(
            scrollbarX + 2, 
            scrollbarY + 2, 
            this.scrollbarWidth - 4, 
            scrollbarHeight - 4
        );
        
        // 绘制滚动条边框
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(
            scrollbarX + 2, 
            scrollbarY + 2, 
            this.scrollbarWidth - 4, 
            scrollbarHeight - 4
        );
    }
    
    /**
     * 应用滚动偏移到 Canvas 上下文
     * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
     */
    applyScroll(ctx) {
        if (!this.enabled) return;
        
        ctx.save();
        ctx.translate(0, -this.scrollY);
    }
    
    /**
     * 恢复 Canvas 上下文
     * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
     */
    restoreScroll(ctx) {
        if (!this.enabled) return;
        
        ctx.restore();
    }
    
    /**
     * 节流渲染
     * @returns {boolean} 是否应该渲染
     */
    shouldRender() {
        const now = Date.now();
        if (now - this.lastRenderTime < this.renderThrottle) {
            return false;
        }
        this.lastRenderTime = now;
        return true;
    }
    
    /**
     * 清除渲染缓存
     */
    clearCache() {
        this.renderCache.clear();
    }
    
    /**
     * 启用/禁用虚拟滚动
     * @param {boolean} enabled - 是否启用
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        
        if (!enabled) {
            this.scrollY = 0;
        }
        
        this.updateVisibleArea();
        this.timeline.render();
        
        // 发送事件
        this.scene.events.emit('timeline:virtualScroll:toggled', { enabled });
    }
    
    /**
     * 获取光标样式
     * @param {number} x - 鼠标 X 坐标
     * @param {number} y - 鼠标 Y 坐标
     * @returns {string|null} 光标样式或 null
     */
    getCursor(x, y) {
        if (this.hitTestScrollbar(x, y)) {
            return 'pointer';
        }
        return null;
    }
    
    /**
     * 清理资源
     */
    destroy() {
        this.clearCache();
        this.isDraggingScrollbar = false;
        console.log('TimelineVirtualScrollController destroyed');
    }
}
