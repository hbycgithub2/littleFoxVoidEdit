// src/dom/timeline/TimelineRangeController.js
// 时间区域选择控制器 - 管理时间范围选择和操作

/**
 * 时间区域选择控制器
 * 职责：
 * 1. 拖拽选择时间区域
 * 2. 绘制选择区域高亮
 * 3. 循环播放区域
 * 4. 导出区域数据
 * 5. 删除区域内热区
 * 6. 区域边缘调整
 */
export default class TimelineRangeController {
    constructor(timelinePanel) {
        this.timeline = timelinePanel;
        this.scene = timelinePanel.scene;
        this.game = timelinePanel.game;
        
        // 选择区域状态
        this.rangeStart = null;  // 区域开始时间
        this.rangeEnd = null;    // 区域结束时间
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragHandle = null;  // 'start' | 'end' | 'body' | null
        
        // 循环播放状态
        this.isLooping = false;
        this.loopInterval = null;
        
        // 视觉样式
        this.rangeColor = 'rgba(0, 191, 255, 0.2)';
        this.rangeBorderColor = '#00bfff';
        this.handleWidth = 8;
        
        // 监听事件
        this.setupEvents();
    }
    
    /**
     * 设置事件监听
     */
    setupEvents() {
        // 监听视频播放完成（用于循环播放）
        this.game.events.on('video:ended', () => {
            if (this.isLooping && this.rangeStart !== null) {
                this.seekToRangeStart();
            }
        });
        
        // 监听视频时间更新（检查是否超出区域）
        this.game.events.on('video:timeupdate', (time) => {
            if (this.isLooping && this.rangeEnd !== null && time >= this.rangeEnd) {
                this.seekToRangeStart();
            }
        });
    }
    
    /**
     * 开始拖拽选择区域
     * @param {number} x - 鼠标 X 坐标
     */
    startDragRange(x) {
        this.isDragging = true;
        this.dragStartX = x;
        this.dragHandle = 'body';
        
        // 清除现有区域
        this.rangeStart = null;
        this.rangeEnd = null;
        
        // 发送事件
        this.scene.events.emit('timeline:range:dragStart', { x });
    }
    
    /**
     * 拖拽更新区域
     * @param {number} x - 当前鼠标 X 坐标
     */
    dragRange(x) {
        if (!this.isDragging) return;
        
        const startTime = Math.min(this.dragStartX, x) / this.timeline.scale;
        const endTime = Math.max(this.dragStartX, x) / this.timeline.scale;
        
        this.rangeStart = Math.max(0, startTime);
        this.rangeEnd = Math.min(this.timeline.videoDuration, endTime);
        
        this.timeline.render();
    }
    
    /**
     * 结束拖拽
     */
    endDragRange() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.dragHandle = null;
        
        // 如果区域太小，清除
        if (this.rangeEnd - this.rangeStart < 0.1) {
            this.clearRange();
            return;
        }
        
        // 发送事件
        this.scene.events.emit('timeline:range:selected', {
            start: this.rangeStart,
            end: this.rangeEnd,
            duration: this.rangeEnd - this.rangeStart
        });
    }
    
    /**
     * 开始拖拽手柄
     * @param {string} handle - 'start' | 'end'
     * @param {number} x - 鼠标 X 坐标
     */
    startDragHandle(handle, x) {
        this.isDragging = true;
        this.dragHandle = handle;
        this.dragStartX = x;
    }
    
    /**
     * 拖拽手柄
     * @param {number} x - 当前鼠标 X 坐标
     */
    dragHandle(x) {
        if (!this.isDragging || !this.dragHandle) return;
        
        const time = x / this.timeline.scale;
        
        if (this.dragHandle === 'start') {
            this.rangeStart = Math.max(0, Math.min(time, this.rangeEnd - 0.1));
        } else if (this.dragHandle === 'end') {
            this.rangeEnd = Math.min(this.timeline.videoDuration, Math.max(time, this.rangeStart + 0.1));
        }
        
        this.timeline.render();
    }
    
    /**
     * 检测点击位置
     * @param {number} x - 鼠标 X 坐标
     * @param {number} y - 鼠标 Y 坐标
     * @returns {string|null} 'start' | 'end' | 'body' | null
     */
    hitTest(x, y) {
        if (this.rangeStart === null || this.rangeEnd === null) return null;
        
        const startX = this.rangeStart * this.timeline.scale;
        const endX = this.rangeEnd * this.timeline.scale;
        
        // 检测开始手柄
        if (Math.abs(x - startX) < this.handleWidth) {
            return 'start';
        }
        
        // 检测结束手柄
        if (Math.abs(x - endX) < this.handleWidth) {
            return 'end';
        }
        
        // 检测区域主体
        if (x >= startX && x <= endX && y >= 30) {
            return 'body';
        }
        
        return null;
    }
    
    /**
     * 获取光标样式
     * @param {number} x - 鼠标 X 坐标
     * @param {number} y - 鼠标 Y 坐标
     * @returns {string|null} 光标样式
     */
    getCursor(x, y) {
        const target = this.hitTest(x, y);
        
        if (target === 'start' || target === 'end') {
            return 'ew-resize';
        } else if (target === 'body') {
            return 'pointer';
        }
        
        return null;
    }
    
    /**
     * 绘制选择区域
     * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
     */
    drawRange(ctx) {
        if (this.rangeStart === null || this.rangeEnd === null) return;
        
        const startX = this.rangeStart * this.timeline.scale;
        const endX = this.rangeEnd * this.timeline.scale;
        const width = endX - startX;
        const height = this.timeline.canvas.height;
        
        // 绘制区域背景
        ctx.fillStyle = this.rangeColor;
        ctx.fillRect(startX, 0, width, height);
        
        // 绘制边框
        ctx.strokeStyle = this.rangeBorderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, 0, width, height);
        
        // 绘制开始手柄
        this.drawHandle(ctx, startX, height);
        
        // 绘制结束手柄
        this.drawHandle(ctx, endX, height);
        
        // 绘制时间标签
        this.drawTimeLabel(ctx, startX, 'start');
        this.drawTimeLabel(ctx, endX, 'end');
        
        // 绘制持续时间
        this.drawDurationLabel(ctx, startX, endX);
    }
    
    /**
     * 绘制手柄
     * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
     * @param {number} x - X 坐标
     * @param {number} height - 高度
     */
    drawHandle(ctx, x, height) {
        ctx.fillStyle = this.rangeBorderColor;
        ctx.fillRect(x - this.handleWidth / 2, 0, this.handleWidth, height);
        
        // 绘制手柄纹理（三条竖线）
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        for (let i = -1; i <= 1; i++) {
            ctx.beginPath();
            ctx.moveTo(x + i * 2, height / 2 - 10);
            ctx.lineTo(x + i * 2, height / 2 + 10);
            ctx.stroke();
        }
    }
    
    /**
     * 绘制时间标签
     * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
     * @param {number} x - X 坐标
     * @param {string} type - 'start' | 'end'
     */
    drawTimeLabel(ctx, x, type) {
        const time = type === 'start' ? this.rangeStart : this.rangeEnd;
        const text = this.formatTime(time);
        
        ctx.fillStyle = this.rangeBorderColor;
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = type === 'start' ? 'left' : 'right';
        ctx.textBaseline = 'top';
        
        const offsetX = type === 'start' ? 5 : -5;
        ctx.fillText(text, x + offsetX, 5);
    }
    
    /**
     * 绘制持续时间标签
     * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
     * @param {number} startX - 开始 X 坐标
     * @param {number} endX - 结束 X 坐标
     */
    drawDurationLabel(ctx, startX, endX) {
        const duration = this.rangeEnd - this.rangeStart;
        const text = `${this.formatTime(duration)}`;
        const centerX = (startX + endX) / 2;
        
        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        const textWidth = ctx.measureText(text).width;
        ctx.fillRect(centerX - textWidth / 2 - 5, 20, textWidth + 10, 18);
        
        // 文字
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(text, centerX, 22);
    }
    
    /**
     * 格式化时间
     * @param {number} time - 时间（秒）
     * @returns {string} 格式化的时间字符串
     */
    formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        const ms = Math.floor((time % 1) * 100);
        return `${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    }
    
    /**
     * 清除选择区域
     */
    clearRange() {
        this.rangeStart = null;
        this.rangeEnd = null;
        this.stopLoop();
        this.timeline.render();
        
        // 发送事件
        this.scene.events.emit('timeline:range:cleared');
    }
    
    /**
     * 设置选择区域
     * @param {number} start - 开始时间
     * @param {number} end - 结束时间
     */
    setRange(start, end) {
        this.rangeStart = Math.max(0, start);
        this.rangeEnd = Math.min(this.timeline.videoDuration, end);
        this.timeline.render();
        
        // 发送事件
        this.scene.events.emit('timeline:range:set', {
            start: this.rangeStart,
            end: this.rangeEnd
        });
    }
    
    /**
     * 获取选择区域
     * @returns {object|null} { start, end, duration }
     */
    getRange() {
        if (this.rangeStart === null || this.rangeEnd === null) return null;
        
        return {
            start: this.rangeStart,
            end: this.rangeEnd,
            duration: this.rangeEnd - this.rangeStart
        };
    }
    
    /**
     * 跳转到区域开始
     */
    seekToRangeStart() {
        if (this.rangeStart !== null) {
            this.game.events.emit('video:seek', this.rangeStart);
        }
    }
    
    /**
     * 跳转到区域结束
     */
    seekToRangeEnd() {
        if (this.rangeEnd !== null) {
            this.game.events.emit('video:seek', this.rangeEnd);
        }
    }
    
    /**
     * 开始循环播放区域
     */
    startLoop() {
        if (this.rangeStart === null || this.rangeEnd === null) return;
        
        this.isLooping = true;
        this.seekToRangeStart();
        this.game.events.emit('video:play');
        
        // 发送事件
        this.scene.events.emit('timeline:range:loopStarted', {
            start: this.rangeStart,
            end: this.rangeEnd
        });
    }
    
    /**
     * 停止循环播放
     */
    stopLoop() {
        this.isLooping = false;
        
        if (this.loopInterval) {
            clearInterval(this.loopInterval);
            this.loopInterval = null;
        }
        
        // 发送事件
        this.scene.events.emit('timeline:range:loopStopped');
    }
    
    /**
     * 切换循环播放
     */
    toggleLoop() {
        if (this.isLooping) {
            this.stopLoop();
        } else {
            this.startLoop();
        }
    }
    
    /**
     * 导出区域数据
     * @returns {object} 区域数据
     */
    exportRange() {
        if (this.rangeStart === null || this.rangeEnd === null) return null;
        
        const hotspots = this.scene.registry.get('hotspots') || [];
        
        // 获取区域内的热区
        const hotspotsInRange = hotspots.filter(config => {
            return config.startTime < this.rangeEnd && config.endTime > this.rangeStart;
        });
        
        const data = {
            range: {
                start: this.rangeStart,
                end: this.rangeEnd,
                duration: this.rangeEnd - this.rangeStart
            },
            hotspots: hotspotsInRange,
            exportTime: new Date().toISOString()
        };
        
        // 发送事件
        this.scene.events.emit('timeline:range:exported', data);
        
        return data;
    }
    
    /**
     * 删除区域内的热区
     */
    deleteHotspotsInRange() {
        if (this.rangeStart === null || this.rangeEnd === null) return;
        
        const hotspots = this.scene.registry.get('hotspots') || [];
        
        // 找到区域内的热区
        const hotspotsToDelete = hotspots.filter(config => {
            return config.startTime < this.rangeEnd && config.endTime > this.rangeStart;
        });
        
        if (hotspotsToDelete.length === 0) return;
        
        // 删除热区
        hotspotsToDelete.forEach(config => {
            const hotspot = this.scene.hotspots.find(h => h.config.id === config.id);
            if (hotspot) {
                hotspot.destroy();
            }
        });
        
        // 更新注册表
        const remainingHotspots = hotspots.filter(config => {
            return !hotspotsToDelete.find(h => h.id === config.id);
        });
        this.scene.registry.set('hotspots', remainingHotspots);
        
        // 发送事件
        this.scene.events.emit('timeline:range:hotspotsDeleted', {
            count: hotspotsToDelete.length,
            hotspots: hotspotsToDelete
        });
        
        this.timeline.render();
    }
    
    /**
     * 获取区域内的热区数量
     * @returns {number} 热区数量
     */
    getHotspotCountInRange() {
        if (this.rangeStart === null || this.rangeEnd === null) return 0;
        
        const hotspots = this.scene.registry.get('hotspots') || [];
        return hotspots.filter(config => {
            return config.startTime < this.rangeEnd && config.endTime > this.rangeStart;
        }).length;
    }
    
    /**
     * 检查是否正在拖拽
     * @returns {boolean}
     */
    isDraggingRange() {
        return this.isDragging;
    }
    
    /**
     * 清理资源
     */
    destroy() {
        this.stopLoop();
        this.clearRange();
        console.log('TimelineRangeController destroyed');
    }
}
