// src/dom/timeline/TimelineThumbnailManager.js
// 时间轴缩略图管理器 - 仿剪映（简化版）

export default class TimelineThumbnailManager {
    constructor(timelinePanel) {
        this.timelinePanel = timelinePanel;
        this.video = null;
        this.thumbnails = []; // {time, canvas}
        this.thumbnailWidth = 60;
        this.thumbnailHeight = 45;
        this.generating = false;
        
        // 创建复用的canvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.thumbnailWidth;
        this.canvas.height = this.thumbnailHeight;
        this.ctx = this.canvas.getContext('2d');
    }
    
    /**
     * 加载视频并生成缩略图
     */
    async loadVideo(videoElement) {
        if (this.generating || !videoElement || !videoElement.duration) {
            return;
        }
        
        this.video = videoElement;
        await this.generateThumbnails();
    }
    
    /**
     * 生成缩略图（简单直接）
     */
    async generateThumbnails() {
        if (!this.video || this.generating) return;
        
        this.generating = true;
        this.thumbnails = [];
        
        const duration = this.video.duration;
        const interval = 1; // 每1秒一个缩略图
        
        console.log('🎬 开始生成缩略图，视频时长:', duration);
        
        // 每隔1秒提取一帧
        for (let time = 0; time < duration; time += interval) {
            try {
                const canvas = await this.extractFrame(time);
                this.thumbnails.push({ time, canvas });
                await new Promise(resolve => setTimeout(resolve, 20));
            } catch (error) {
                console.error(`❌ 提取帧失败 time=${time}:`, error);
            }
        }
        
        this.generating = false;
        console.log(`✅ 缩略图生成完成，共${this.thumbnails.length}个`);
        this.timelinePanel.render();
    }
    
    /**
     * 提取单帧
     */
    async extractFrame(timestamp) {
        return new Promise((resolve, reject) => {
            const onSeeked = async () => {
                try {
                    await new Promise(r => requestAnimationFrame(r));
                    await new Promise(r => setTimeout(r, 15));
                    
                    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
                    
                    const newCanvas = document.createElement('canvas');
                    newCanvas.width = this.canvas.width;
                    newCanvas.height = this.canvas.height;
                    const newCtx = newCanvas.getContext('2d');
                    newCtx.drawImage(this.canvas, 0, 0);
                    
                    resolve(newCanvas);
                } catch (error) {
                    reject(error);
                }
            };
            
            this.video.addEventListener('seeked', onSeeked, { once: true });
            this.video.currentTime = timestamp;
            
            setTimeout(() => {
                this.video.removeEventListener('seeked', onSeeked);
                reject(new Error('Timeout'));
            }, 2000);
        });
    }
    
    /**
     * 绘制缩略图（最简单的方式）
     */
    draw(ctx) {
        if (this.thumbnails.length === 0) return;
        
        const scale = this.timelinePanel.scale;
        const y = 30;
        const canvasWidth = ctx.canvas.width;
        
        ctx.save();
        
        // 裁剪区域
        ctx.beginPath();
        ctx.rect(0, y, canvasWidth, this.thumbnailHeight);
        ctx.clip();
        
        // 背景
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, y, canvasWidth, this.thumbnailHeight);
        
        // 绘制每个缩略图
        this.thumbnails.forEach(thumb => {
            // X坐标 = 时间 × 缩放比例
            const x = thumb.time * scale;
            
            // 只绘制可见的
            if (x + this.thumbnailWidth >= 0 && x <= canvasWidth) {
                ctx.drawImage(thumb.canvas, x, y, this.thumbnailWidth, this.thumbnailHeight);
                
                // 边框
                ctx.strokeStyle = '#555';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, this.thumbnailWidth, this.thumbnailHeight);
            }
        });
        
        ctx.restore();
    }
}
