// src/dom/timeline/TimelineKeyboardController.js
// 时间轴键盘控制器 - 管理时间轴的键盘快捷键

/**
 * 时间轴键盘控制器
 * 职责：
 * 1. 注册和管理时间轴相关的键盘快捷键
 * 2. 处理方向键微调时间
 * 3. 处理播放/暂停、跳转等操作
 * 4. 处理入点/出点标记
 * 5. 发送 Phaser 事件通知场景
 */
export default class TimelineKeyboardController {
    constructor(timelinePanel) {
        this.timeline = timelinePanel;
        this.scene = timelinePanel.scene;
        this.game = timelinePanel.game;
        
        // 帧率（用于计算帧时间）
        this.fps = 30; // 默认 30fps
        this.frameTime = 1 / this.fps; // 每帧的时间（秒）
        
        // 入点/出点标记
        this.inPoint = null;
        this.outPoint = null;
        
        // 设置键盘事件
        this.setupKeyboardEvents();
    }
    
    /**
     * 设置键盘事件监听
     */
    setupKeyboardEvents() {
        this.keydownHandler = (e) => {
            // 如果正在输入文本，忽略快捷键
            if (this.isInputFocused()) return;
            
            this.handleKeyDown(e);
        };
        
        window.addEventListener('keydown', this.keydownHandler);
    }
    
    /**
     * 检查是否有输入框获得焦点
     * @returns {boolean} 是否有输入框获得焦点
     */
    isInputFocused() {
        const activeElement = document.activeElement;
        return activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.isContentEditable
        );
    }
    
    /**
     * 处理键盘按下事件
     * @param {KeyboardEvent} e - 键盘事件
     */
    handleKeyDown(e) {
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.handleArrowLeft(e.shiftKey);
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.handleArrowRight(e.shiftKey);
                break;
            case 'Home':
                e.preventDefault();
                this.handleHome();
                break;
            case 'End':
                e.preventDefault();
                this.handleEnd();
                break;
            case ' ':
                e.preventDefault();
                this.handleSpace();
                break;
            case '[':
                e.preventDefault();
                this.handleSetInPoint();
                break;
            case ']':
                e.preventDefault();
                this.handleSetOutPoint();
                break;
            case 'm':
            case 'M':
                e.preventDefault();
                this.handleAddMarker();
                break;
        }
    }
    
    /**
     * 处理左箭头键（向前微调）
     * @param {boolean} shiftKey - 是否按下 Shift 键
     */
    handleArrowLeft(shiftKey) {
        const frames = shiftKey ? 10 : 1;
        const deltaTime = frames * this.frameTime;
        
        const newTime = Math.max(0, this.timeline.currentTime - deltaTime);
        
        // 发送视频跳转事件
        this.game.events.emit('video:seek', newTime);
        
        // 发送键盘事件
        this.scene.events.emit('timeline:keyboard:arrowLeft', {
            frames: frames,
            newTime: newTime
        });
    }
    
    /**
     * 处理右箭头键（向后微调）
     * @param {boolean} shiftKey - 是否按下 Shift 键
     */
    handleArrowRight(shiftKey) {
        const frames = shiftKey ? 10 : 1;
        const deltaTime = frames * this.frameTime;
        
        const maxTime = this.timeline.videoDuration || Infinity;
        const newTime = Math.min(maxTime, this.timeline.currentTime + deltaTime);
        
        // 发送视频跳转事件
        this.game.events.emit('video:seek', newTime);
        
        // 发送键盘事件
        this.scene.events.emit('timeline:keyboard:arrowRight', {
            frames: frames,
            newTime: newTime
        });
    }
    
    /**
     * 处理 Home 键（跳转到开始）
     */
    handleHome() {
        // 发送视频跳转事件
        this.game.events.emit('video:seek', 0);
        
        // 发送键盘事件
        this.scene.events.emit('timeline:keyboard:home');
    }
    
    /**
     * 处理 End 键（跳转到结束）
     */
    handleEnd() {
        const endTime = this.timeline.videoDuration || 0;
        
        // 发送视频跳转事件
        this.game.events.emit('video:seek', endTime);
        
        // 发送键盘事件
        this.scene.events.emit('timeline:keyboard:end', {
            endTime: endTime
        });
    }
    
    /**
     * 处理空格键（播放/暂停）
     */
    handleSpace() {
        // 发送播放/暂停切换事件
        this.game.events.emit('video:togglePlay');
        
        // 发送键盘事件
        this.scene.events.emit('timeline:keyboard:space');
    }
    
    /**
     * 处理 [ 键（设置入点）
     */
    handleSetInPoint() {
        this.inPoint = this.timeline.currentTime;
        
        // 触发重绘（显示入点标记）
        this.timeline.render();
        
        // 发送键盘事件
        this.scene.events.emit('timeline:keyboard:setInPoint', {
            time: this.inPoint
        });
        
        console.log(`入点设置为: ${this.inPoint.toFixed(2)}s`);
    }
    
    /**
     * 处理 ] 键（设置出点）
     */
    handleSetOutPoint() {
        this.outPoint = this.timeline.currentTime;
        
        // 触发重绘（显示出点标记）
        this.timeline.render();
        
        // 发送键盘事件
        this.scene.events.emit('timeline:keyboard:setOutPoint', {
            time: this.outPoint
        });
        
        console.log(`出点设置为: ${this.outPoint.toFixed(2)}s`);
    }
    
    /**
     * 处理 M 键（添加标记）
     */
    handleAddMarker() {
        // 使用 TimelineMarkerController 添加标记
        if (this.timeline.markerController) {
            this.timeline.markerController.addMarker(this.timeline.currentTime);
        }
        
        // 发送键盘事件
        this.scene.events.emit('timeline:keyboard:addMarker', {
            time: this.timeline.currentTime
        });
    }
    
    /**
     * 绘制入点/出点标记
     * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
     */
    drawInOutPoints(ctx) {
        const canvasHeight = this.timeline.canvas.height;
        
        // 绘制入点
        if (this.inPoint !== null) {
            const x = this.inPoint * this.timeline.scale;
            
            // 绿色竖线
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvasHeight);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // 顶部三角形
            ctx.fillStyle = '#00ff00';
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x - 6, 12);
            ctx.lineTo(x + 6, 12);
            ctx.closePath();
            ctx.fill();
            
            // 标签
            ctx.fillStyle = '#00ff00';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('IN', x + 8, 10);
        }
        
        // 绘制出点
        if (this.outPoint !== null) {
            const x = this.outPoint * this.timeline.scale;
            
            // 红色竖线
            ctx.strokeStyle = '#ff6666';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvasHeight);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // 顶部三角形
            ctx.fillStyle = '#ff6666';
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x - 6, 12);
            ctx.lineTo(x + 6, 12);
            ctx.closePath();
            ctx.fill();
            
            // 标签
            ctx.fillStyle = '#ff6666';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'right';
            ctx.fillText('OUT', x - 8, 10);
        }
    }
    
    /**
     * 绘制标记
     * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
     */
    drawMarkers(ctx) {
        const canvasHeight = this.timeline.canvas.height;
        
        this.markers.forEach(marker => {
            const x = marker.time * this.timeline.scale;
            
            // 蓝色竖线
            ctx.strokeStyle = '#4488ff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvasHeight);
            ctx.stroke();
            
            // 顶部菱形
            ctx.fillStyle = '#4488ff';
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x - 4, 6);
            ctx.lineTo(x, 12);
            ctx.lineTo(x + 4, 6);
            ctx.closePath();
            ctx.fill();
            
            // 标签（旋转显示）
            ctx.save();
            ctx.translate(x + 2, 20);
            ctx.rotate(Math.PI / 2);
            ctx.fillStyle = '#4488ff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(marker.label, 0, 0);
            ctx.restore();
        });
    }
    
    /**
     * 清除入点
     */
    clearInPoint() {
        this.inPoint = null;
        this.timeline.render();
        this.scene.events.emit('timeline:keyboard:clearInPoint');
    }
    
    /**
     * 清除出点
     */
    clearOutPoint() {
        this.outPoint = null;
        this.timeline.render();
        this.scene.events.emit('timeline:keyboard:clearOutPoint');
    }
    
    /**
     * 清除所有标记
     */
    clearAllMarkers() {
        this.markers = [];
        this.timeline.render();
        this.scene.events.emit('timeline:keyboard:clearAllMarkers');
    }
    
    /**
     * 删除指定标记
     * @param {string} markerId - 标记 ID
     */
    deleteMarker(markerId) {
        const index = this.markers.findIndex(m => m.id === markerId);
        if (index !== -1) {
            this.markers.splice(index, 1);
            this.timeline.render();
            this.scene.events.emit('timeline:keyboard:deleteMarker', { markerId });
        }
    }
    
    /**
     * 获取快捷键帮助信息
     * @returns {Array} 快捷键列表
     */
    getShortcutHelp() {
        return [
            { key: '←/→', description: '微调时间（1帧）' },
            { key: 'Shift+←/→', description: '快速移动（10帧）' },
            { key: 'Home', description: '跳转到开始' },
            { key: 'End', description: '跳转到结束' },
            { key: 'Space', description: '播放/暂停' },
            { key: '[', description: '设置入点' },
            { key: ']', description: '设置出点' },
            { key: 'M', description: '添加标记' },
            { key: 'Delete', description: '删除选中的热区' },
            { key: 'Escape', description: '清空选择' },
            { key: 'Ctrl+A', description: '全选' },
            { key: 'Ctrl+C', description: '复制' },
            { key: 'Ctrl+X', description: '剪切' },
            { key: 'Ctrl+V', description: '粘贴' }
        ];
    }
    
    /**
     * 清理资源
     */
    destroy() {
        if (this.keydownHandler) {
            window.removeEventListener('keydown', this.keydownHandler);
        }
        
        this.inPoint = null;
        this.outPoint = null;
        
        console.log('TimelineKeyboardController destroyed');
    }
}
