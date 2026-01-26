// src/dom/timeline/TimeScaleController.js
// 时间刻度控制器 - 管理时间刻度的点击和视觉反馈（遵循 Phaser 标准）

/**
 * 时间刻度控制器
 * 职责：
 * 1. 检测时间刻度点击
 * 2. 处理视频跳转
 * 3. 显示点击视觉反馈
 */
export default class TimeScaleController {
    constructor(timelinePanel) {
        this.timeline = timelinePanel;
        this.game = timelinePanel.game;
        this.scaleHeight = 30; // 时间刻度区域高度
        
        // 视觉反馈状态
        this.clickFeedback = null;
        this.feedbackTimer = null;
    }
    
    /**
     * 检测是否点击了时间刻度区域
     * @param {number} x - 鼠标 X 坐标
     * @param {number} y - 鼠标 Y 坐标
     * @returns {boolean} 是否点击了时间刻度
     */
    hitTest(x, y) {
        return y < this.scaleHeight;
    }
    
    /**
     * 处理时间刻度点击
     * @param {number} x - 鼠标 X 坐标
     */
    handleClick(x) {
        // 计算点击的时间
        const time = x / this.timeline.scale;
        
        // 限制在有效范围内
        const clampedTime = Math.max(0, Math.min(time, this.timeline.videoDuration));
        
        // 发送视频跳转事件（遵循 Phaser 事件系统）
        this.game.events.emit('video:seek', clampedTime);
        
        // 显示点击反馈
        this.showClickFeedback(x);
    }
    
    /**
     * 显示点击视觉反馈
     * @param {number} x - 点击位置 X 坐标
     */
    showClickFeedback(x) {
        // 清除之前的反馈定时器
        if (this.feedbackTimer) {
            clearTimeout(this.feedbackTimer);
        }
        
        // 保存反馈位置
        this.clickFeedback = {
            x: x,
            alpha: 1.0,
            startTime: Date.now()
        };
        
        // 触发重绘
        this.timeline.render();
        
        // 150ms 后清除反馈
        this.feedbackTimer = setTimeout(() => {
            this.clickFeedback = null;
            this.timeline.render();
        }, 150);
    }
    
    /**
     * 绘制点击视觉反馈
     * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
     */
    drawClickFeedback(ctx) {
        if (!this.clickFeedback) return;
        
        const { x, alpha } = this.clickFeedback;
        
        // 计算淡出效果
        const elapsed = Date.now() - this.clickFeedback.startTime;
        const fadeAlpha = Math.max(0, 1 - elapsed / 150);
        
        // 绘制高亮竖线
        ctx.save();
        ctx.globalAlpha = fadeAlpha * 0.8;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, this.scaleHeight);
        ctx.stroke();
        
        // 绘制扩散圆圈
        ctx.globalAlpha = fadeAlpha * 0.3;
        ctx.fillStyle = '#ffffff';
        const radius = 5 + (elapsed / 150) * 10; // 扩散效果
        ctx.beginPath();
        ctx.arc(x, this.scaleHeight / 2, radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        // 如果还在动画中，继续重绘
        if (fadeAlpha > 0) {
            requestAnimationFrame(() => this.timeline.render());
        }
    }
    
    /**
     * 获取光标样式
     * @param {number} x - 鼠标 X 坐标
     * @param {number} y - 鼠标 Y 坐标
     * @returns {string|null} 光标样式
     */
    getCursor(x, y) {
        if (this.hitTest(x, y)) {
            return 'pointer';
        }
        return null;
    }
    
    /**
     * 清理资源
     */
    destroy() {
        if (this.feedbackTimer) {
            clearTimeout(this.feedbackTimer);
            this.feedbackTimer = null;
        }
        this.clickFeedback = null;
    }
}
