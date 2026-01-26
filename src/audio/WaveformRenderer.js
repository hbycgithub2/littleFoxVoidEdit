// src/audio/WaveformRenderer.js
// 音频波形渲染器 - 使用 Web Audio API 提取和渲染音频波形

/**
 * 音频波形渲染器
 * 职责：
 * 1. 使用 Web Audio API 提取音频数据
 * 2. 生成波形数据
 * 3. 渲染波形到 Canvas
 * 4. 缓存波形数据
 * 5. 支持缩放和滚动
 */
export default class WaveformRenderer {
    constructor() {
        // Audio Context
        this.audioContext = null;
        this.audioBuffer = null;
        
        // 波形数据
        this.waveformData = null;
        this.sampleRate = 44100;
        this.samplesPerPixel = 512; // 每像素采样数
        
        // 渲染设置
        this.waveformHeight = 60;
        this.waveformColor = 'rgba(0, 191, 255, 0.6)';
        this.waveformLineColor = '#00bfff';
        this.backgroundColor = 'rgba(0, 0, 0, 0.3)';
        
        // 缓存
        this.cachedCanvas = null;
        this.cachedScale = null;
    }
    
    /**
     * 初始化 Audio Context
     */
    initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }
    
    /**
     * 从视频元素加载音频
     * @param {HTMLVideoElement} videoElement - 视频元素
     * @returns {Promise<void>}
     */
    async loadFromVideo(videoElement) {
        try {
            this.initAudioContext();
            
            // 创建 MediaElementSource
            const source = this.audioContext.createMediaElementSource(videoElement);
            
            // 注意：这种方法不能直接获取音频数据
            // 需要使用 fetch 获取视频文件的音频数据
            console.warn('从视频元素直接提取音频需要额外处理');
            
            return null;
        } catch (error) {
            console.error('加载音频失败:', error);
            throw error;
        }
    }
    
    /**
     * 从 URL 加载音频
     * @param {string} url - 音频/视频 URL
     * @returns {Promise<void>}
     */
    async loadFromURL(url) {
        try {
            this.initAudioContext();
            
            // 获取音频数据
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            
            // 解码音频数据
            this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            // 生成波形数据
            this.generateWaveformData();
            
            return this.audioBuffer;
        } catch (error) {
            console.error('从 URL 加载音频失败:', error);
            throw error;
        }
    }
    
    /**
     * 从 ArrayBuffer 加载音频
     * @param {ArrayBuffer} arrayBuffer - 音频数据
     * @returns {Promise<AudioBuffer>}
     */
    async loadFromArrayBuffer(arrayBuffer) {
        try {
            this.initAudioContext();
            
            // 解码音频数据
            this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            // 生成波形数据
            this.generateWaveformData();
            
            return this.audioBuffer;
        } catch (error) {
            console.error('从 ArrayBuffer 加载音频失败:', error);
            throw error;
        }
    }
    
    /**
     * 生成波形数据
     */
    generateWaveformData() {
        if (!this.audioBuffer) return;
        
        const channelData = this.audioBuffer.getChannelData(0); // 使用第一个声道
        const samples = channelData.length;
        const duration = this.audioBuffer.duration;
        
        // 计算每秒的像素数（假设时间轴缩放为 10）
        const pixelsPerSecond = 10;
        const totalPixels = Math.ceil(duration * pixelsPerSecond);
        
        // 生成波形数据（每个像素的最大值和最小值）
        this.waveformData = [];
        
        for (let i = 0; i < totalPixels; i++) {
            const startSample = Math.floor((i / totalPixels) * samples);
            const endSample = Math.floor(((i + 1) / totalPixels) * samples);
            
            let min = 1.0;
            let max = -1.0;
            
            for (let j = startSample; j < endSample; j++) {
                const value = channelData[j];
                if (value < min) min = value;
                if (value > max) max = value;
            }
            
            this.waveformData.push({ min, max });
        }
    }
    
    /**
     * 绘制波形
     * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
     * @param {number} x - X 坐标
     * @param {number} y - Y 坐标
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {number} scale - 时间轴缩放
     * @param {number} startTime - 开始时间（秒）
     * @param {number} endTime - 结束时间（秒）
     */
    draw(ctx, x, y, width, height, scale, startTime = 0, endTime = null) {
        if (!this.waveformData) return;
        
        // 使用缓存（如果缩放没变）
        if (this.cachedCanvas && this.cachedScale === scale) {
            ctx.drawImage(this.cachedCanvas, x, y, width, height);
            return;
        }
        
        // 绘制背景
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(x, y, width, height);
        
        // 计算可见范围
        const duration = this.audioBuffer ? this.audioBuffer.duration : 0;
        if (!endTime) endTime = duration;
        
        const centerY = y + height / 2;
        const amplitude = height / 2;
        
        // 绘制波形
        ctx.fillStyle = this.waveformColor;
        ctx.strokeStyle = this.waveformLineColor;
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        
        for (let i = 0; i < width; i++) {
            const time = startTime + (i / width) * (endTime - startTime);
            const dataIndex = Math.floor((time / duration) * this.waveformData.length);
            
            if (dataIndex >= 0 && dataIndex < this.waveformData.length) {
                const data = this.waveformData[dataIndex];
                
                const minY = centerY - data.min * amplitude;
                const maxY = centerY - data.max * amplitude;
                
                // 绘制垂直线
                ctx.moveTo(x + i, minY);
                ctx.lineTo(x + i, maxY);
            }
        }
        
        ctx.stroke();
        
        // 绘制中心线
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, centerY);
        ctx.lineTo(x + width, centerY);
        ctx.stroke();
    }
    
    /**
     * 绘制简化波形（性能优化版本）
     * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
     * @param {number} x - X 坐标
     * @param {number} y - Y 坐标
     * @param {number} width - 宽度
     * @param {number} height - 高度
     */
    drawSimplified(ctx, x, y, width, height) {
        if (!this.waveformData) return;
        
        // 绘制背景
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(x, y, width, height);
        
        const centerY = y + height / 2;
        const amplitude = height / 2;
        
        // 绘制波形（使用路径优化）
        ctx.fillStyle = this.waveformColor;
        ctx.beginPath();
        
        // 上半部分
        ctx.moveTo(x, centerY);
        for (let i = 0; i < width; i++) {
            const dataIndex = Math.floor((i / width) * this.waveformData.length);
            if (dataIndex < this.waveformData.length) {
                const data = this.waveformData[dataIndex];
                const maxY = centerY - data.max * amplitude;
                ctx.lineTo(x + i, maxY);
            }
        }
        
        // 下半部分（反向）
        for (let i = width - 1; i >= 0; i--) {
            const dataIndex = Math.floor((i / width) * this.waveformData.length);
            if (dataIndex < this.waveformData.length) {
                const data = this.waveformData[dataIndex];
                const minY = centerY - data.min * amplitude;
                ctx.lineTo(x + i, minY);
            }
        }
        
        ctx.closePath();
        ctx.fill();
        
        // 绘制中心线
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, centerY);
        ctx.lineTo(x + width, centerY);
        ctx.stroke();
    }
    
    /**
     * 生成缓存 Canvas
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {number} scale - 缩放
     */
    generateCache(width, height, scale) {
        if (!this.waveformData) return;
        
        this.cachedCanvas = document.createElement('canvas');
        this.cachedCanvas.width = width;
        this.cachedCanvas.height = height;
        this.cachedScale = scale;
        
        const ctx = this.cachedCanvas.getContext('2d');
        this.drawSimplified(ctx, 0, 0, width, height);
    }
    
    /**
     * 清除缓存
     */
    clearCache() {
        this.cachedCanvas = null;
        this.cachedScale = null;
    }
    
    /**
     * 获取音频时长
     * @returns {number} 时长（秒）
     */
    getDuration() {
        return this.audioBuffer ? this.audioBuffer.duration : 0;
    }
    
    /**
     * 获取采样率
     * @returns {number} 采样率
     */
    getSampleRate() {
        return this.audioBuffer ? this.audioBuffer.sampleRate : 0;
    }
    
    /**
     * 获取声道数
     * @returns {number} 声道数
     */
    getNumberOfChannels() {
        return this.audioBuffer ? this.audioBuffer.numberOfChannels : 0;
    }
    
    /**
     * 导出波形数据
     * @returns {Array} 波形数据
     */
    exportWaveformData() {
        return this.waveformData;
    }
    
    /**
     * 导入波形数据
     * @param {Array} data - 波形数据
     */
    importWaveformData(data) {
        this.waveformData = data;
        this.clearCache();
    }
    
    /**
     * 清理资源
     */
    destroy() {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        this.audioBuffer = null;
        this.waveformData = null;
        this.clearCache();
        
        console.log('WaveformRenderer destroyed');
    }
}
