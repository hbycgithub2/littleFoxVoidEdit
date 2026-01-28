// src/phaser/timeline/utils/VideoFrameExtractor.js
// 视频帧提取器 - 使用Canvas API提取视频帧（V1.0 MVP）

export default class VideoFrameExtractor {
    constructor(videoElement, config) {
        this.video = videoElement;
        this.config = config;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 设置Canvas尺寸
        this.canvas.width = config.thumbnailWidth;
        this.canvas.height = config.thumbnailHeight;
    }
    
    /**
     * 提取单帧
     * @param {number} timestamp - 时间戳（秒）
     * @returns {Promise<string>} Base64图片数据
     */
    async extractFrame(timestamp) {
        return new Promise((resolve, reject) => {
            let timeoutId;
            
            // 等待seeked事件
            const onSeeked = async () => {
                // 验证是否seek到正确位置（允许0.1秒误差）
                if (Math.abs(this.video.currentTime - timestamp) > 0.1) {
                    console.warn(`⚠️ Seek位置不准确: 期望${timestamp}s, 实际${this.video.currentTime}s`);
                }
                
                try {
                    // 等待下一帧渲染（关键！确保视频画面已更新）
                    await new Promise(r => requestAnimationFrame(r));
                    
                    // 绘制到Canvas
                    this.ctx.drawImage(
                        this.video,
                        0, 0,
                        this.canvas.width,
                        this.canvas.height
                    );
                    
                    // 转换为Base64
                    const base64 = this.canvas.toDataURL('image/jpeg', this.config.quality);
                    
                    // 清理
                    clearTimeout(timeoutId);
                    
                    resolve(base64);
                } catch (error) {
                    clearTimeout(timeoutId);
                    reject(error);
                }
            };
            
            // 监听seeked事件（使用once确保只触发一次）
            this.video.addEventListener('seeked', onSeeked, { once: true });
            
            // 设置视频时间（在监听器设置后）
            this.video.currentTime = timestamp;
            
            // 超时处理
            timeoutId = setTimeout(() => {
                this.video.removeEventListener('seeked', onSeeked);
                reject(new Error(`Frame extraction timeout at ${timestamp}s`));
            }, 5000);
        });
    }
    
    /**
     * 计算采样点
     * @param {number} duration - 视频时长（秒）
     * @param {number} interval - 采样间隔（秒）
     * @returns {Array<number>} 采样时间点数组
     */
    calculateSamplePoints(duration, interval) {
        const points = [];
        for (let t = 0; t < duration; t += interval) {
            points.push(t);
        }
        // 确保包含最后一帧
        if (points[points.length - 1] < duration - 0.1) {
            points.push(duration - 0.1);
        }
        return points;
    }
    
    /**
     * 批量提取帧
     * @param {Array<number>} timestamps - 时间戳数组
     * @param {Function} onProgress - 进度回调
     * @returns {Promise<Array<{timestamp, base64}>>}
     */
    async extractFrames(timestamps, onProgress) {
        const results = [];
        
        console.log(`🎬 开始提取${timestamps.length}帧 (采样间隔: ${(timestamps[1] - timestamps[0]).toFixed(2)}s)`);
        
        for (let i = 0; i < timestamps.length; i++) {
            try {
                const timestamp = timestamps[i];
                
                // 串行提取，等待每一帧完成
                const base64 = await this.extractFrame(timestamp);
                
                results.push({
                    timestamp: timestamp,
                    base64: base64
                });
                
                // 每10帧或前3帧显示进度
                if (i < 3 || i % 10 === 0 || i === timestamps.length - 1) {
                    console.log(`📊 进度: ${i + 1}/${timestamps.length} (${((i + 1) / timestamps.length * 100).toFixed(0)}%)`);
                }
                
                if (onProgress) {
                    onProgress(i + 1, timestamps.length);
                }
                
                // 添加小延迟，确保视频状态稳定
                await new Promise(resolve => setTimeout(resolve, 10));
                
            } catch (error) {
                console.error(`❌ 提取帧${i}失败 (${timestamps[i]}s):`, error);
            }
        }
        
        console.log(`✅ 提取完成，共${results.length}帧`);
        
        return results;
    }
    
    /**
     * 销毁
     */
    destroy() {
        this.canvas = null;
        this.ctx = null;
        this.video = null;
    }
}
