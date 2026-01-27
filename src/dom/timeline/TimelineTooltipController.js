// src/dom/timeline/TimelineTooltipController.js
// 时间轴工具提示控制器 - 显示时间、持续时间、帧数等信息

/**
 * 时间轴工具提示控制器
 * 职责：
 * 1. 检测鼠标悬停位置
 * 2. 显示相应的工具提示
 * 3. 格式化时间信息
 */
export default class TimelineTooltipController {
    constructor(timelinePanel) {
        this.timeline = timelinePanel;
        this.tooltip = null;
        this.showDelay = 300; // 300ms 延迟显示
        this.showTimer = null;
        this.fps = 30; // 默认帧率
        
        this.createTooltip();
    }
    
    /**
     * 创建工具提示元素
     */
    createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'timeline-tooltip';
        this.tooltip.style.cssText = `
            position: fixed;
            background: rgba(0, 0, 0, 0.95);
            color: white;
            padding: 10px 14px;
            border-radius: 6px;
            font-size: 12px;
            font-family: 'Courier New', monospace;
            pointer-events: none;
            z-index: 10002;
            opacity: 0;
            transition: opacity 0.15s ease;
            white-space: pre-line;
            box-shadow: 0 3px 12px rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.1);
            line-height: 1.6;
        `;
        document.body.appendChild(this.tooltip);
    }
    
    /**
     * 处理鼠标移动（检测悬停位置并显示工具提示）
     * @param {number} x - Canvas 内的 X 坐标
     * @param {number} y - Canvas 内的 Y 坐标
     * @param {number} clientX - 屏幕 X 坐标
     * @param {number} clientY - 屏幕 Y 坐标
     */
    handleMouseMove(x, y, clientX, clientY) {
        // 清除之前的定时器
        if (this.showTimer) {
            clearTimeout(this.showTimer);
            this.showTimer = null;
        }
        
        // 检测悬停位置
        const content = this.getTooltipContent(x, y);
        
        if (content) {
            // 延迟显示工具提示
            this.showTimer = setTimeout(() => {
                this.show(content, clientX, clientY);
            }, this.showDelay);
        } else {
            this.hide();
        }
    }
    
    /**
     * 获取工具提示内容
     * @param {number} x - Canvas 内的 X 坐标
     * @param {number} y - Canvas 内的 Y 坐标
     * @returns {string|null} 工具提示内容
     */
    getTooltipContent(x, y) {
        // 1. 检测播放头
        if (this.timeline.playheadController.hitTest(x, y)) {
            const time = this.timeline.currentTime;
            return this.formatPlayheadTooltip(time);
        }
        
        // 2. 检测热区时间条（优先使用 LayerGroupController 的方法）
        const scrollY = this.timeline.virtualScrollController ? this.timeline.virtualScrollController.scrollY : 0;
        const hotspot = this.timeline.layerGroupController.getHotspotAtPosition(x, y + scrollY);
        
        if (hotspot) {
            // 检测是否在手柄上
            const x1 = hotspot.startTime * this.timeline.scale;
            const x2 = hotspot.endTime * this.timeline.scale;
            const handleWidth = 5;
            
            let handle = null;
            if (Math.abs(x - x1) < handleWidth) {
                handle = 'start';
            } else if (Math.abs(x - x2) < handleWidth) {
                handle = 'end';
            }
            
            return this.formatHotspotTooltip(hotspot, handle);
        }
        
        // 3. 检测时间刻度
        if (this.timeline.timeScaleController.hitTest(x, y)) {
            const time = x / this.timeline.scale;
            return this.formatTimeScaleTooltip(time);
        }
        
        return null;
    }
    
    /**
     * 格式化播放头工具提示
     * @param {number} time - 当前时间（秒）
     * @returns {string} 格式化的内容
     */
    formatPlayheadTooltip(time) {
        const frame = Math.floor(time * this.fps);
        const timeStr = this.formatTime(time);
        
        return `🔴 播放头\n时间: ${timeStr}\n帧数: ${frame}`;
    }
    
    /**
     * 格式化热区工具提示（增强版 - 显示详细信息）
     * @param {object} hotspot - 热区配置
     * @param {string} handle - 手柄类型（start/end/null）
     * @returns {string} 格式化的内容
     */
    formatHotspotTooltip(hotspot, handle) {
        const duration = hotspot.endTime - hotspot.startTime;
        const frames = Math.floor(duration * this.fps);
        const startFrame = Math.floor(hotspot.startTime * this.fps);
        const endFrame = Math.floor(hotspot.endTime * this.fps);
        
        const name = hotspot.word || `${hotspot.shape}`;
        const startTimeStr = this.formatTime(hotspot.startTime);
        const endTimeStr = this.formatTime(hotspot.endTime);
        const durationStr = this.formatTime(duration);
        
        let content = `📍 ${name}\n`;
        content += `━━━━━━━━━━━━━━━━━━━━\n`;
        content += `⏱️  开始: ${startTimeStr} (帧 ${startFrame})\n`;
        content += `⏱️  结束: ${endTimeStr} (帧 ${endFrame})\n`;
        content += `⏳ 时长: ${durationStr} (${frames} 帧)\n`;
        
        // 添加操作提示
        content += `━━━━━━━━━━━━━━━━━━━━\n`;
        
        if (handle === 'start') {
            content += `💡 拖拽调整开始时间`;
        } else if (handle === 'end') {
            content += `💡 拖拽调整结束时间`;
        } else {
            content += `💡 双击跳转 | 右键菜单`;
        }
        
        return content;
    }
    
    /**
     * 格式化时间刻度工具提示
     * @param {number} time - 时间（秒）
     * @returns {string} 格式化的内容
     */
    formatTimeScaleTooltip(time) {
        const frame = Math.floor(time * this.fps);
        const timeStr = this.formatTime(time);
        
        return `⏱️ 时间轴\n时间: ${timeStr}\n帧数: ${frame}\n\n💡 点击跳转到此时间`;
    }
    
    /**
     * 格式化时间（秒 -> MM:SS.mmm）
     * @param {number} seconds - 秒数
     * @returns {string} 格式化的时间字符串
     */
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 1000);
        
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
    }
    
    /**
     * 显示工具提示
     * @param {string} content - 内容
     * @param {number} clientX - 屏幕 X 坐标
     * @param {number} clientY - 屏幕 Y 坐标
     */
    show(content, clientX, clientY) {
        this.tooltip.textContent = content;
        this.tooltip.style.opacity = '1';
        
        // 更新位置
        this.updatePosition(clientX, clientY);
    }
    
    /**
     * 隐藏工具提示
     */
    hide() {
        this.tooltip.style.opacity = '0';
    }
    
    /**
     * 更新工具提示位置
     * @param {number} clientX - 屏幕 X 坐标
     * @param {number} clientY - 屏幕 Y 坐标
     */
    updatePosition(clientX, clientY) {
        // 获取工具提示尺寸
        const rect = this.tooltip.getBoundingClientRect();
        const gap = 15;
        
        // 默认显示在鼠标右下方
        let left = clientX + gap;
        let top = clientY + gap;
        
        // 边界检查 - 右边界
        if (left + rect.width > window.innerWidth - gap) {
            left = clientX - rect.width - gap;
        }
        
        // 边界检查 - 底部边界
        if (top + rect.height > window.innerHeight - gap) {
            top = clientY - rect.height - gap;
        }
        
        // 边界检查 - 左边界
        left = Math.max(gap, left);
        
        // 边界检查 - 顶部边界
        top = Math.max(gap, top);
        
        this.tooltip.style.left = left + 'px';
        this.tooltip.style.top = top + 'px';
    }
    
    /**
     * 设置帧率
     * @param {number} fps - 帧率
     */
    setFPS(fps) {
        this.fps = fps;
    }
    
    /**
     * 清理资源
     */
    destroy() {
        if (this.showTimer) {
            clearTimeout(this.showTimer);
            this.showTimer = null;
        }
        
        if (this.tooltip && this.tooltip.parentNode) {
            this.tooltip.parentNode.removeChild(this.tooltip);
            this.tooltip = null;
        }
    }
}
