// src/dom/timeline/PlayheadController.js
// 播放头控制器 - 管理时间轴播放头的交互（遵循 Phaser 标准）

/**
 * 播放头控制器
 * 职责：
 * 1. 检测播放头点击
 * 2. 处理播放头拖拽
 * 3. 发送视频跳转事件
 */
export default class PlayheadController {
    constructor(timelinePanel) {
        this.timeline = timelinePanel;
        this.game = timelinePanel.game;
        
        // 拖拽状态
        this.isDragging = false;
        this.hitAreaSize = 10; // 播放头可点击区域大小
        
        // 性能优化：节流视频 seek
        this.lastSeekTime = 0;
        this.seekThrottle = 50; // 50ms 节流，每秒最多 20 次 seek
        this.pendingSeekTime = null;
        this.seekTimeoutId = null;
        
        // 性能优化：使用 requestAnimationFrame 优化渲染
        this.rafId = null;
        this.needsRender = false;
    }
    
    /**
     * 检测是否点击了播放头
     * @param {number} x - 鼠标 X 坐标
     * @param {number} y - 鼠标 Y 坐标
     * @returns {boolean} 是否点击了播放头
     */
    hitTest(x, y) {
        const playheadX = this.timeline.currentTime * this.timeline.scale;
        
        // 检测三角形区域（顶部）
        if (y <= 10 && Math.abs(x - playheadX) <= 5) {
            return true;
        }
        
        // 检测竖线区域（扩大点击范围）
        if (Math.abs(x - playheadX) <= this.hitAreaSize) {
            return true;
        }
        
        return false;
    }
    
    /**
     * 开始拖拽播放头
     */
    startDrag() {
        this.isDragging = true;
        
        // 开始渲染循环
        this.startRenderLoop();
    }
    
    /**
     * 拖拽播放头（更新视频时间）
     * @param {number} x - 鼠标 X 坐标
     */
    drag(x) {
        if (!this.isDragging) {
            return;
        }
        
        // 计算新的时间
        const time = x / this.timeline.scale;
        
        // 获取视频时长（优先使用 timeline.videoDuration，如果为 0 则从视频元素获取）
        let videoDuration = this.timeline.videoDuration;
        if (videoDuration === 0 && this.game) {
            const videoController = this.game.videoController;
            if (videoController) {
                videoDuration = videoController.getDuration();
            }
        }
        
        // 限制在有效范围内（如果 videoDuration 仍为 0，则不限制上限）
        const clampedTime = videoDuration > 0 
            ? Math.max(0, Math.min(time, videoDuration))
            : Math.max(0, time);
        
        // 立即更新时间轴的 currentTime（播放头视觉位置）
        this.timeline.currentTime = clampedTime;
        
        // 标记需要渲染（由 RAF 循环处理）
        this.needsRender = true;
        
        // 节流视频 seek（避免频繁操作视频元素）
        this.throttledSeek(clampedTime);
    }
    
    /**
     * 节流视频 seek（性能优化）
     * @param {number} time - 目标时间
     */
    throttledSeek(time) {
        const now = Date.now();
        
        // 保存最新的目标时间
        this.pendingSeekTime = time;
        
        // 如果距离上次 seek 时间小于节流间隔，延迟执行
        if (now - this.lastSeekTime < this.seekThrottle) {
            // 清除之前的延迟 seek
            if (this.seekTimeoutId) {
                clearTimeout(this.seekTimeoutId);
            }
            
            // 设置新的延迟 seek
            this.seekTimeoutId = setTimeout(() => {
                this.performSeek(this.pendingSeekTime);
            }, this.seekThrottle);
            
            return;
        }
        
        // 立即执行 seek
        this.performSeek(time);
    }
    
    /**
     * 执行视频 seek
     * @param {number} time - 目标时间
     */
    performSeek(time) {
        this.lastSeekTime = Date.now();
        this.game.events.emit('video:seek', time);
    }
    
    /**
     * 开始渲染循环（使用 requestAnimationFrame）
     */
    startRenderLoop() {
        if (this.rafId) return; // 已经在运行
        
        const renderLoop = () => {
            if (!this.isDragging) {
                this.rafId = null;
                return;
            }
            
            // 只在需要时渲染
            if (this.needsRender) {
                this.timeline.render();
                this.needsRender = false;
            }
            
            // 继续循环
            this.rafId = requestAnimationFrame(renderLoop);
        };
        
        this.rafId = requestAnimationFrame(renderLoop);
    }
    
    /**
     * 结束拖拽
     */
    endDrag() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        
        // 停止渲染循环
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        
        // 确保最后一次 seek 被执行
        if (this.pendingSeekTime !== null) {
            this.performSeek(this.pendingSeekTime);
            this.pendingSeekTime = null;
        }
        
        // 清除延迟 seek
        if (this.seekTimeoutId) {
            clearTimeout(this.seekTimeoutId);
            this.seekTimeoutId = null;
        }
        
        // 最后渲染一次
        this.timeline.render();
    }
    
    /**
     * 获取当前拖拽状态
     */
    isDraggingPlayhead() {
        return this.isDragging;
    }
    
    /**
     * 获取光标样式
     * @param {number} x - 鼠标 X 坐标
     * @param {number} y - 鼠标 Y 坐标
     * @returns {string} 光标样式
     */
    getCursor(x, y) {
        if (this.isDragging) {
            return 'ew-resize';
        }
        
        if (this.hitTest(x, y)) {
            return 'ew-resize';
        }
        
        return null; // 返回 null 表示不改变光标
    }
    
    /**
     * 清理资源
     */
    destroy() {
        // 停止渲染循环
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        
        // 清除延迟 seek
        if (this.seekTimeoutId) {
            clearTimeout(this.seekTimeoutId);
            this.seekTimeoutId = null;
        }
    }
}
