// src/dom/timeline/TimelineFramePreviewController.js
// 时间轴视频帧预览控制器 - 管理悬停时的视频帧预览

/**
 * 时间轴视频帧预览控制器
 * 职责：
 * 1. 捕获视频帧
 * 2. 显示预览窗口
 * 3. 缓存帧数据
 * 4. 管理预览位置
 * 5. 性能优化
 */
export default class TimelineFramePreviewController {
    constructor(timelinePanel) {
        this.timeline = timelinePanel;
        this.scene = timelinePanel.scene;
        this.game = timelinePanel.game;
        
        // 预览设置
        this.enabled = true;
        this.previewWidth = 160;
        this.previewHeight = 90;
        this.previewPadding = 10;
        
        // 预览元素
        this.previewElement = null;
        this.previewCanvas = null;
        this.previewCtx = null;
        this.timeLabel = null;
        
        // 视频元素
        this.videoElement = null;
        
        // 缓存
        this.frameCache = new Map(); // time -> ImageData
        this.maxCacheSize = 50;
        this.cacheInterval = 0.5; // 每 0.5 秒缓存一帧
        
        // 状态
        this.isVisible = false;
        this.currentTime = null;
        this.lastCaptureTime = null;
        
        // 节流
        this.updateThrottle = null;
        this.throttleDelay = 100; // 100ms
        
        this.init();
    }
    
    /**
     * 初始化预览元素
     */
    init() {
        // 创建预览容器
        this.previewElement = document.createElement('div');
        this.previewElement.style.cssText = `
            position: fixed;
            display: none;
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #00bfff;
            border-radius: 5px;
            padding: 5px;
            z-index: 10000;
            pointer-events: none;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        `;
        
        // 创建预览 Canvas
        this.previewCanvas = document.createElement('canvas');
        this.previewCanvas.width = this.previewWidth;
        this.previewCanvas.height = this.previewHeight;
        this.previewCanvas.style.cssText = `
            display: block;
            border-radius: 3px;
        `;
        this.previewCtx = this.previewCanvas.getContext('2d');
        
        // 创建时间标签
        this.timeLabel = document.createElement('div');
        this.timeLabel.style.cssText = `
            color: #fff;
            font-size: 12px;
            font-weight: bold;
            text-align: center;
            margin-top: 5px;
            font-family: monospace;
        `;
        
        // 组装元素
        this.previewElement.appendChild(this.previewCanvas);
        this.previewElement.appendChild(this.timeLabel);
        document.body.appendChild(this.previewElement);
        
        // 监听事件
        this.setupEvents();
    }
    
    /**
     * 设置事件监听
     */
    setupEvents() {
        // 监听视频加载
        this.game.events.on('video:loaded', () => {
            this.videoElement = this.getVideoElement();
            this.clearCache();
        });
    }
    
    /**
     * 获取视频元素
     * @returns {HTMLVideoElement|null}
     */
    getVideoElement() {
        // 尝试从场景获取视频元素
        const videoPanel = document.getElementById('videoPanel');
        if (videoPanel) {
            const video = videoPanel.querySelector('video');
            if (video) return video;
        }
        return null;
    }
    
    /**
     * 启用/禁用预览
     * @param {boolean} enabled - 是否启用
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.hide();
        }
        
        // 发送事件
        this.scene.events.emit('timeline:framePreview:toggled', { enabled });
    }
    
    /**
     * 显示预览
     * @param {number} time - 时间（秒）
     * @param {number} mouseX - 鼠标 X 坐标（屏幕坐标）
     * @param {number} mouseY - 鼠标 Y 坐标（屏幕坐标）
     */
    show(time, mouseX, mouseY) {
        if (!this.enabled || !this.videoElement) return;
        
        // 节流更新
        if (this.updateThrottle) {
            clearTimeout(this.updateThrottle);
        }
        
        this.updateThrottle = setTimeout(() => {
            this.updatePreview(time, mouseX, mouseY);
        }, this.throttleDelay);
    }
    
    /**
     * 更新预览
     * @param {number} time - 时间（秒）
     * @param {number} mouseX - 鼠标 X 坐标
     * @param {number} mouseY - 鼠标 Y 坐标
     */
    async updatePreview(time, mouseX, mouseY) {
        this.currentTime = time;
        this.isVisible = true;
        
        // 更新时间标签
        this.timeLabel.textContent = this.formatTime(time);
        
        // 检查缓存
        const cacheKey = this.getCacheKey(time);
        let frameData = this.frameCache.get(cacheKey);
        
        if (!frameData) {
            // 捕获帧
            frameData = await this.captureFrame(time);
            if (frameData) {
                this.cacheFrame(cacheKey, frameData);
            }
        }
        
        // 绘制帧
        if (frameData) {
            this.previewCtx.putImageData(frameData, 0, 0);
        } else {
            // 绘制占位符
            this.drawPlaceholder();
        }
        
        // 定位预览窗口
        this.positionPreview(mouseX, mouseY);
        
        // 显示预览
        this.previewElement.style.display = 'block';
    }
    
    /**
     * 捕获视频帧
     * @param {number} time - 时间（秒）
     * @returns {Promise<ImageData|null>}
     */
    async captureFrame(time) {
        if (!this.videoElement) return null;
        
        try {
            // 保存当前时间
            const originalTime = this.videoElement.currentTime;
            const wasPaused = this.videoElement.paused;
            
            // 跳转到目标时间
            this.videoElement.currentTime = time;
            
            // 等待视频跳转完成
            await new Promise((resolve) => {
                const onSeeked = () => {
                    this.videoElement.removeEventListener('seeked', onSeeked);
                    resolve();
                };
                this.videoElement.addEventListener('seeked', onSeeked);
                
                // 超时保护
                setTimeout(resolve, 500);
            });
            
            // 创建临时 Canvas 捕获帧
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = this.previewWidth;
            tempCanvas.height = this.previewHeight;
            const tempCtx = tempCanvas.getContext('2d');
            
            // 绘制视频帧
            tempCtx.drawImage(
                this.videoElement,
                0, 0,
                this.videoElement.videoWidth,
                this.videoElement.videoHeight,
                0, 0,
                this.previewWidth,
                this.previewHeight
            );
            
            // 获取图像数据
            const imageData = tempCtx.getImageData(0, 0, this.previewWidth, this.previewHeight);
            
            // 恢复原始时间（如果需要）
            if (!wasPaused) {
                this.videoElement.currentTime = originalTime;
            }
            
            return imageData;
        } catch (error) {
            console.error('捕获视频帧失败:', error);
            return null;
        }
    }
    
    /**
     * 绘制占位符
     */
    drawPlaceholder() {
        this.previewCtx.fillStyle = '#1a1a1a';
        this.previewCtx.fillRect(0, 0, this.previewWidth, this.previewHeight);
        
        this.previewCtx.fillStyle = '#666';
        this.previewCtx.font = '14px Arial';
        this.previewCtx.textAlign = 'center';
        this.previewCtx.textBaseline = 'middle';
        this.previewCtx.fillText('加载中...', this.previewWidth / 2, this.previewHeight / 2);
    }
    
    /**
     * 定位预览窗口
     * @param {number} mouseX - 鼠标 X 坐标
     * @param {number} mouseY - 鼠标 Y 坐标
     */
    positionPreview(mouseX, mouseY) {
        const previewRect = this.previewElement.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // 计算位置（默认在鼠标右上方）
        let x = mouseX + this.previewPadding;
        let y = mouseY - previewRect.height - this.previewPadding;
        
        // 边界检测
        if (x + previewRect.width > windowWidth) {
            x = mouseX - previewRect.width - this.previewPadding;
        }
        
        if (y < 0) {
            y = mouseY + this.previewPadding;
        }
        
        // 应用位置
        this.previewElement.style.left = `${x}px`;
        this.previewElement.style.top = `${y}px`;
    }
    
    /**
     * 隐藏预览
     */
    hide() {
        this.isVisible = false;
        this.previewElement.style.display = 'none';
        
        if (this.updateThrottle) {
            clearTimeout(this.updateThrottle);
            this.updateThrottle = null;
        }
    }
    
    /**
     * 获取缓存键
     * @param {number} time - 时间（秒）
     * @returns {number} 缓存键
     */
    getCacheKey(time) {
        return Math.floor(time / this.cacheInterval) * this.cacheInterval;
    }
    
    /**
     * 缓存帧
     * @param {number} key - 缓存键
     * @param {ImageData} frameData - 帧数据
     */
    cacheFrame(key, frameData) {
        // 检查缓存大小
        if (this.frameCache.size >= this.maxCacheSize) {
            // 删除最旧的缓存（FIFO）
            const firstKey = this.frameCache.keys().next().value;
            this.frameCache.delete(firstKey);
        }
        
        this.frameCache.set(key, frameData);
        
        // 发送事件
        this.scene.events.emit('timeline:framePreview:cached', {
            time: key,
            cacheSize: this.frameCache.size
        });
    }
    
    /**
     * 清除缓存
     */
    clearCache() {
        this.frameCache.clear();
        
        // 发送事件
        this.scene.events.emit('timeline:framePreview:cacheCleared');
    }
    
    /**
     * 预加载帧（批量）
     * @param {number} startTime - 开始时间
     * @param {number} endTime - 结束时间
     * @param {number} interval - 间隔（秒）
     */
    async preloadFrames(startTime, endTime, interval = 1) {
        const times = [];
        for (let t = startTime; t <= endTime; t += interval) {
            times.push(t);
        }
        
        for (const time of times) {
            const cacheKey = this.getCacheKey(time);
            if (!this.frameCache.has(cacheKey)) {
                const frameData = await this.captureFrame(time);
                if (frameData) {
                    this.cacheFrame(cacheKey, frameData);
                }
                
                // 延迟避免阻塞
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        }
        
        // 发送事件
        this.scene.events.emit('timeline:framePreview:preloaded', {
            startTime,
            endTime,
            count: times.length
        });
    }
    
    /**
     * 格式化时间
     * @param {number} time - 时间（秒）
     * @returns {string} 格式化的时间
     */
    formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        const ms = Math.floor((time % 1) * 100);
        return `${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    }
    
    /**
     * 获取缓存统计
     * @returns {object} 统计信息
     */
    getCacheStats() {
        return {
            size: this.frameCache.size,
            maxSize: this.maxCacheSize,
            cacheInterval: this.cacheInterval
        };
    }
    
    /**
     * 清理资源
     */
    destroy() {
        this.hide();
        this.clearCache();
        
        if (this.previewElement && this.previewElement.parentNode) {
            this.previewElement.parentNode.removeChild(this.previewElement);
        }
        
        this.previewElement = null;
        this.previewCanvas = null;
        this.previewCtx = null;
        this.timeLabel = null;
        this.videoElement = null;
        
        console.log('TimelineFramePreviewController destroyed');
    }
}
