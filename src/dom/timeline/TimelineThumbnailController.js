// src/dom/timeline/TimelineThumbnailController.js
// 时间轴缩略图控制器 - 管理热区缩略图预览

/**
 * 时间轴缩略图控制器
 * 职责：
 * 1. 捕获热区截图
 * 2. 生成缩略图
 * 3. 缓存缩略图
 * 4. 在时间条上绘制缩略图
 * 5. 管理缩略图显示开关
 */
export default class TimelineThumbnailController {
    constructor(timelinePanel) {
        this.timeline = timelinePanel;
        this.scene = timelinePanel.scene;
        this.game = timelinePanel.game;
        
        // 缩略图缓存
        this.thumbnailCache = new Map(); // hotspotId -> Image
        
        // 缩略图设置
        this.enabled = true;
        this.thumbnailWidth = 60;
        this.thumbnailHeight = 16;
        this.maxCacheSize = 100; // 最大缓存数量
        
        // 生成队列
        this.generateQueue = [];
        this.isGenerating = false;
    }
    
    /**
     * 启用/禁用缩略图
     * @param {boolean} enabled - 是否启用
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        this.timeline.render();
        
        // 发送事件
        this.scene.events.emit('timeline:thumbnail:toggled', { enabled });
    }
    
    /**
     * 生成热区缩略图
     * @param {string} hotspotId - 热区 ID
     * @returns {Promise<Image>} 缩略图图像
     */
    async generateThumbnail(hotspotId) {
        // 检查缓存
        if (this.thumbnailCache.has(hotspotId)) {
            return this.thumbnailCache.get(hotspotId);
        }
        
        // 查找热区
        const hotspot = this.scene.hotspots.find(h => h.config.id === hotspotId);
        if (!hotspot) return null;
        
        try {
            // 创建临时 Canvas 捕获热区
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            
            // 获取热区边界
            const bounds = hotspot.getBounds();
            const padding = 10;
            
            tempCanvas.width = bounds.width + padding * 2;
            tempCanvas.height = bounds.height + padding * 2;
            
            // 绘制背景
            tempCtx.fillStyle = '#2a2a2a';
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            
            // 保存上下文状态
            tempCtx.save();
            tempCtx.translate(padding - bounds.x, padding - bounds.y);
            
            // 绘制热区（简化版本）
            this.drawHotspotToCanvas(tempCtx, hotspot);
            
            // 恢复上下文
            tempCtx.restore();
            
            // 创建缩略图
            const thumbnail = await this.createThumbnailFromCanvas(tempCanvas);
            
            // 缓存缩略图
            this.cacheThumbnail(hotspotId, thumbnail);
            
            return thumbnail;
        } catch (error) {
            console.error('Failed to generate thumbnail:', error);
            return null;
        }
    }
    
    /**
     * 绘制热区到 Canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
     * @param {object} hotspot - 热区对象
     */
    drawHotspotToCanvas(ctx, hotspot) {
        const config = hotspot.config;
        
        // 绘制形状
        ctx.strokeStyle = config.strokeColor || '#00ff00';
        ctx.fillStyle = config.fillColor || 'rgba(0, 255, 0, 0.3)';
        ctx.lineWidth = config.strokeWidth || 2;
        
        if (config.shape === 'rectangle') {
            ctx.fillRect(config.x, config.y, config.width, config.height);
            ctx.strokeRect(config.x, config.y, config.width, config.height);
        } else if (config.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(config.x, config.y, config.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        } else if (config.shape === 'polygon' && config.points) {
            ctx.beginPath();
            config.points.forEach((point, index) => {
                if (index === 0) {
                    ctx.moveTo(point.x, point.y);
                } else {
                    ctx.lineTo(point.x, point.y);
                }
            });
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
        
        // 绘制文字
        if (config.word) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(config.word, config.x, config.y);
        }
    }
    
    /**
     * 从 Canvas 创建缩略图
     * @param {HTMLCanvasElement} sourceCanvas - 源 Canvas
     * @returns {Promise<Image>} 缩略图图像
     */
    createThumbnailFromCanvas(sourceCanvas) {
        return new Promise((resolve, reject) => {
            // 创建缩略图 Canvas
            const thumbCanvas = document.createElement('canvas');
            const thumbCtx = thumbCanvas.getContext('2d');
            
            thumbCanvas.width = this.thumbnailWidth;
            thumbCanvas.height = this.thumbnailHeight;
            
            // 计算缩放比例（保持宽高比）
            const scaleX = this.thumbnailWidth / sourceCanvas.width;
            const scaleY = this.thumbnailHeight / sourceCanvas.height;
            const scale = Math.min(scaleX, scaleY);
            
            const scaledWidth = sourceCanvas.width * scale;
            const scaledHeight = sourceCanvas.height * scale;
            
            // 居中绘制
            const offsetX = (this.thumbnailWidth - scaledWidth) / 2;
            const offsetY = (this.thumbnailHeight - scaledHeight) / 2;
            
            // 绘制背景
            thumbCtx.fillStyle = '#1a1a1a';
            thumbCtx.fillRect(0, 0, this.thumbnailWidth, this.thumbnailHeight);
            
            // 绘制缩放后的图像
            thumbCtx.drawImage(
                sourceCanvas,
                0, 0, sourceCanvas.width, sourceCanvas.height,
                offsetX, offsetY, scaledWidth, scaledHeight
            );
            
            // 转换为 Image 对象
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = thumbCanvas.toDataURL();
        });
    }
    
    /**
     * 缓存缩略图
     * @param {string} hotspotId - 热区 ID
     * @param {Image} thumbnail - 缩略图图像
     */
    cacheThumbnail(hotspotId, thumbnail) {
        // 检查缓存大小
        if (this.thumbnailCache.size >= this.maxCacheSize) {
            // 删除最旧的缓存（FIFO）
            const firstKey = this.thumbnailCache.keys().next().value;
            this.thumbnailCache.delete(firstKey);
        }
        
        this.thumbnailCache.set(hotspotId, thumbnail);
        
        // 发送事件
        this.scene.events.emit('timeline:thumbnail:cached', {
            hotspotId,
            cacheSize: this.thumbnailCache.size
        });
    }
    
    /**
     * 获取缩略图
     * @param {string} hotspotId - 热区 ID
     * @returns {Image|null} 缩略图图像
     */
    getThumbnail(hotspotId) {
        return this.thumbnailCache.get(hotspotId) || null;
    }
    
    /**
     * 清除缩略图缓存
     * @param {string} hotspotId - 热区 ID（可选，不传则清除所有）
     */
    clearCache(hotspotId = null) {
        if (hotspotId) {
            this.thumbnailCache.delete(hotspotId);
        } else {
            this.thumbnailCache.clear();
        }
        
        // 发送事件
        this.scene.events.emit('timeline:thumbnail:cacheCleared', { hotspotId });
    }
    
    /**
     * 批量生成缩略图
     * @param {Array<string>} hotspotIds - 热区 ID 数组
     */
    async batchGenerate(hotspotIds) {
        // 添加到队列
        this.generateQueue.push(...hotspotIds);
        
        // 如果没有正在生成，开始处理队列
        if (!this.isGenerating) {
            this.processQueue();
        }
    }
    
    /**
     * 处理生成队列
     */
    async processQueue() {
        if (this.generateQueue.length === 0) {
            this.isGenerating = false;
            return;
        }
        
        this.isGenerating = true;
        
        // 每次处理一个
        const hotspotId = this.generateQueue.shift();
        
        try {
            await this.generateThumbnail(hotspotId);
            
            // 触发重绘
            this.timeline.render();
        } catch (error) {
            console.error('Failed to generate thumbnail:', error);
        }
        
        // 继续处理下一个（使用 setTimeout 避免阻塞）
        setTimeout(() => this.processQueue(), 10);
    }
    
    /**
     * 绘制缩略图到时间条
     * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
     * @param {object} config - 热区配置
     * @param {number} x - X 坐标
     * @param {number} y - Y 坐标
     * @param {number} width - 宽度
     * @param {number} height - 高度
     */
    drawThumbnail(ctx, config, x, y, width, height) {
        if (!this.enabled) return;
        
        // 检查宽度是否足够显示缩略图
        if (width < this.thumbnailWidth + 10) return;
        
        const thumbnail = this.getThumbnail(config.id);
        
        if (thumbnail) {
            // 绘制缩略图
            const thumbX = x + 5;
            const thumbY = y + (height - this.thumbnailHeight) / 2;
            
            // 绘制边框
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.strokeRect(thumbX, thumbY, this.thumbnailWidth, this.thumbnailHeight);
            
            // 绘制缩略图
            ctx.drawImage(thumbnail, thumbX, thumbY, this.thumbnailWidth, this.thumbnailHeight);
        } else {
            // 缩略图未生成，添加到队列
            if (!this.generateQueue.includes(config.id)) {
                this.generateQueue.push(config.id);
                
                if (!this.isGenerating) {
                    this.processQueue();
                }
            }
            
            // 绘制占位符
            const thumbX = x + 5;
            const thumbY = y + (height - this.thumbnailHeight) / 2;
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(thumbX, thumbY, this.thumbnailWidth, this.thumbnailHeight);
            
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            ctx.strokeRect(thumbX, thumbY, this.thumbnailWidth, this.thumbnailHeight);
            ctx.setLineDash([]);
            
            // 绘制加载图标
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('...', thumbX + this.thumbnailWidth / 2, thumbY + this.thumbnailHeight / 2);
        }
    }
    
    /**
     * 预加载可见热区的缩略图
     * @param {Array} visibleHotspots - 可见的热区数组
     */
    preloadVisibleThumbnails(visibleHotspots) {
        const hotspotIds = visibleHotspots
            .filter(config => !this.thumbnailCache.has(config.id))
            .map(config => config.id);
        
        if (hotspotIds.length > 0) {
            this.batchGenerate(hotspotIds);
        }
    }
    
    /**
     * 获取缓存统计信息
     * @returns {object} 缓存统计
     */
    getCacheStats() {
        return {
            size: this.thumbnailCache.size,
            maxSize: this.maxCacheSize,
            queueLength: this.generateQueue.length,
            isGenerating: this.isGenerating
        };
    }
    
    /**
     * 清理资源
     */
    destroy() {
        this.thumbnailCache.clear();
        this.generateQueue = [];
        this.isGenerating = false;
        console.log('TimelineThumbnailController destroyed');
    }
}
