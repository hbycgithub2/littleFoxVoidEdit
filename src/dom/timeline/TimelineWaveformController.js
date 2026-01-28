// src/dom/timeline/TimelineWaveformController.js
// 时间轴波形控制器 - 管理时间轴上的音频波形显示

import WaveformRenderer from '../../audio/WaveformRenderer.js';

/**
 * 时间轴波形控制器
 * 职责：
 * 1. 管理波形渲染器
 * 2. 在时间轴上绘制波形
 * 3. 同步波形到时间轴缩放
 * 4. 控制波形显示/隐藏
 * 5. 处理波形加载状态
 */
export default class TimelineWaveformController {
    constructor(timelinePanel) {
        this.timeline = timelinePanel;
        this.scene = timelinePanel.scene;
        this.game = timelinePanel.game;
        
        // 波形渲染器
        this.waveformRenderer = new WaveformRenderer();
        
        // 显示设置
        this.enabled = false;
        this.waveformHeight = 60;
        this.waveformY = 75; // 在缩略图下方（缩略图高度45 + 时间刻度30 = 75）
        
        // 加载状态
        this.isLoading = false;
        this.loadError = null;
        
        // 监听事件
        this.setupEvents();
    }
    
    /**
     * 设置事件监听
     */
    setupEvents() {
        // 监听视频加载
        this.game.events.on('video:loaded', (duration) => {
            // 视频加载后可以尝试加载音频
            this.loadError = null;
        });
    }
    
    /**
     * 启用/禁用波形显示
     * @param {boolean} enabled - 是否启用
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        this.timeline.render();
        
        // 发送事件
        this.scene.events.emit('timeline:waveform:toggled', { enabled });
    }
    
    /**
     * 从 URL 加载音频波形
     * @param {string} url - 音频/视频 URL
     * @returns {Promise<boolean>} 是否成功
     */
    async loadFromURL(url) {
        try {
            this.isLoading = true;
            this.loadError = null;
            this.timeline.render();
            
            // 发送加载开始事件
            this.scene.events.emit('timeline:waveform:loadStart', { url });
            
            await this.waveformRenderer.loadFromURL(url);
            
            this.isLoading = false;
            this.enabled = true;
            this.timeline.render();
            
            // 发送加载完成事件
            this.scene.events.emit('timeline:waveform:loaded', {
                duration: this.waveformRenderer.getDuration(),
                sampleRate: this.waveformRenderer.getSampleRate(),
                channels: this.waveformRenderer.getNumberOfChannels()
            });
            
            return true;
        } catch (error) {
            this.isLoading = false;
            this.loadError = error.message;
            this.timeline.render();
            
            // 发送加载错误事件
            this.scene.events.emit('timeline:waveform:loadError', { error: error.message });
            
            return false;
        }
    }
    
    /**
     * 从 ArrayBuffer 加载音频波形
     * @param {ArrayBuffer} arrayBuffer - 音频数据
     * @returns {Promise<boolean>} 是否成功
     */
    async loadFromArrayBuffer(arrayBuffer) {
        try {
            this.isLoading = true;
            this.loadError = null;
            this.timeline.render();
            
            await this.waveformRenderer.loadFromArrayBuffer(arrayBuffer);
            
            this.isLoading = false;
            this.enabled = true;
            this.timeline.render();
            
            // 发送加载完成事件
            this.scene.events.emit('timeline:waveform:loaded', {
                duration: this.waveformRenderer.getDuration()
            });
            
            return true;
        } catch (error) {
            this.isLoading = false;
            this.loadError = error.message;
            this.timeline.render();
            
            // 发送加载错误事件
            this.scene.events.emit('timeline:waveform:loadError', { error: error.message });
            
            return false;
        }
    }
    
    /**
     * 绘制波形
     * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
     */
    drawWaveform(ctx) {
        if (!this.enabled) return;
        
        const { width } = this.timeline.canvas;
        const y = this.waveformY;
        const height = this.waveformHeight;
        
        // 绘制背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, y, width, height);
        
        // 绘制边框
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, y, width, height);
        
        if (this.isLoading) {
            // 显示加载状态
            this.drawLoadingState(ctx, 0, y, width, height);
        } else if (this.loadError) {
            // 显示错误状态
            this.drawErrorState(ctx, 0, y, width, height);
        } else if (this.waveformRenderer.waveformData) {
            // 绘制波形
            const duration = this.waveformRenderer.getDuration();
            const startTime = 0;
            const endTime = Math.min(duration, width / this.timeline.scale);
            
            this.waveformRenderer.drawSimplified(ctx, 0, y, width, height);
        } else {
            // 显示未加载状态
            this.drawEmptyState(ctx, 0, y, width, height);
        }
    }
    
    /**
     * 绘制加载状态
     * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
     * @param {number} x - X 坐标
     * @param {number} y - Y 坐标
     * @param {number} width - 宽度
     * @param {number} height - 高度
     */
    drawLoadingState(ctx, x, y, width, height) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('加载音频波形中...', x + width / 2, y + height / 2);
        
        // 绘制加载动画（简单的旋转圆圈）
        const centerX = x + width / 2 - 80;
        const centerY = y + height / 2;
        const radius = 10;
        const time = Date.now() / 1000;
        
        ctx.strokeStyle = '#00bfff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, time * 2, time * 2 + Math.PI * 1.5);
        ctx.stroke();
    }
    
    /**
     * 绘制错误状态
     * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
     * @param {number} x - X 坐标
     * @param {number} y - Y 坐标
     * @param {number} width - 宽度
     * @param {number} height - 高度
     */
    drawErrorState(ctx, x, y, width, height) {
        ctx.fillStyle = '#ff6666';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`加载失败: ${this.loadError}`, x + width / 2, y + height / 2);
    }
    
    /**
     * 绘制空状态
     * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
     * @param {number} x - X 坐标
     * @param {number} y - Y 坐标
     * @param {number} width - 宽度
     * @param {number} height - 高度
     */
    drawEmptyState(ctx, x, y, width, height) {
        ctx.fillStyle = '#666666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('右键点击时间轴 → 加载音频波形', x + width / 2, y + height / 2);
    }
    
    /**
     * 获取波形区域高度（用于调整其他元素位置）
     * @returns {number} 高度
     */
    getHeight() {
        return this.enabled ? this.waveformHeight : 0;
    }
    
    /**
     * 检测点击位置是否在波形区域
     * @param {number} x - 鼠标 X 坐标
     * @param {number} y - 鼠标 Y 坐标
     * @returns {boolean} 是否在波形区域
     */
    hitTest(x, y) {
        if (!this.enabled) return false;
        
        return y >= this.waveformY && y < this.waveformY + this.waveformHeight;
    }
    
    /**
     * 导出波形数据
     * @returns {object|null} 波形数据
     */
    exportData() {
        if (!this.waveformRenderer.waveformData) return null;
        
        return {
            waveformData: this.waveformRenderer.exportWaveformData(),
            duration: this.waveformRenderer.getDuration(),
            sampleRate: this.waveformRenderer.getSampleRate(),
            channels: this.waveformRenderer.getNumberOfChannels()
        };
    }
    
    /**
     * 导入波形数据
     * @param {object} data - 波形数据
     */
    importData(data) {
        if (!data || !data.waveformData) return;
        
        this.waveformRenderer.importWaveformData(data.waveformData);
        this.enabled = true;
        this.timeline.render();
        
        // 发送事件
        this.scene.events.emit('timeline:waveform:imported', { data });
    }
    
    /**
     * 清除波形数据
     */
    clearWaveform() {
        this.waveformRenderer.waveformData = null;
        this.waveformRenderer.clearCache();
        this.enabled = false;
        this.loadError = null;
        this.timeline.render();
        
        // 发送事件
        this.scene.events.emit('timeline:waveform:cleared');
    }
    
    /**
     * 清理资源
     */
    destroy() {
        if (this.waveformRenderer) {
            this.waveformRenderer.destroy();
            this.waveformRenderer = null;
        }
        
        console.log('TimelineWaveformController destroyed');
    }
}
