// src/dom/TimelinePanel.js
// 时间轴面板 - 显示热区的时间范围（使用 Canvas 绘制）

export default class TimelinePanel {
    constructor(game) {
        this.game = game;
        this.scene = null;
        this.canvas = null;
        this.ctx = null;
        this.videoDuration = 0;
        this.currentTime = 0;
        this.scale = 10; // 每秒的像素数
        this.isDragging = false;
        this.dragTarget = null;
        
        // 等待场景准备好
        this.game.events.once('ready', () => {
            this.scene = this.game.scene.getScene('EditorScene');
            this.init();
        });
    }
    
    init() {
        this.setupCanvas();
        this.setupEvents();
        this.render();
    }
    
    setupCanvas() {
        this.canvas = document.getElementById('timelineCanvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        
        // 设置 canvas 尺寸
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        if (!this.canvas) return;
        
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        
        this.render();
    }
    
    setupEvents() {
        // 监听视频时间更新
        this.game.events.on('video:timeupdate', (time) => {
            this.currentTime = time;
            this.render();
        });
        
        // 监听视频加载
        this.game.events.on('video:loaded', (duration) => {
            this.videoDuration = duration;
            this.render();
        });
        
        // 监听热区变化
        this.scene.events.on('hotspot:added', () => this.render());
        this.scene.events.on('hotspot:removed', () => this.render());
        this.scene.registry.events.on('changedata', (_, key) => {
            if (key === 'hotspots') {
                this.render();
            }
        });
        
        // Canvas 交互
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e));
    }
    
    render() {
        if (!this.ctx || !this.canvas) return;
        
        const { width, height } = this.canvas;
        
        // 清空画布
        this.ctx.clearRect(0, 0, width, height);
        
        // 绘制背景
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, width, height);
        
        // 绘制时间刻度
        this.drawTimeScale();
        
        // 绘制热区时间条
        this.drawHotspotBars();
        
        // 绘制当前时间指示器
        this.drawCurrentTimeIndicator();
    }
    
    drawTimeScale() {
        const { width, height } = this.canvas;
        const scaleHeight = 30;
        
        // 背景
        this.ctx.fillStyle = '#2a2a2a';
        this.ctx.fillRect(0, 0, width, scaleHeight);
        
        // 刻度线和文字
        this.ctx.strokeStyle = '#666';
        this.ctx.fillStyle = '#aaa';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        
        const maxTime = this.videoDuration || 60;
        const step = this.scale < 5 ? 10 : (this.scale < 20 ? 5 : 1);
        
        for (let t = 0; t <= maxTime; t += step) {
            const x = t * this.scale;
            
            if (x > width) break;
            
            // 刻度线
            this.ctx.beginPath();
            this.ctx.moveTo(x, scaleHeight - 10);
            this.ctx.lineTo(x, scaleHeight);
            this.ctx.stroke();
            
            // 时间文字
            this.ctx.fillText(`${t}s`, x, scaleHeight - 15);
        }
    }
    
    drawHotspotBars() {
        if (!this.scene) return;
        
        const hotspots = this.scene.registry.get('hotspots') || [];
        const scaleHeight = 30;
        const barHeight = 20;
        const barGap = 5;
        
        hotspots.forEach((config, index) => {
            const y = scaleHeight + 10 + index * (barHeight + barGap);
            const x1 = config.startTime * this.scale;
            const x2 = config.endTime * this.scale;
            const width = x2 - x1;
            
            // 热区条背景
            this.ctx.fillStyle = config.color || '#00ff00';
            this.ctx.globalAlpha = 0.6;
            this.ctx.fillRect(x1, y, width, barHeight);
            this.ctx.globalAlpha = 1.0;
            
            // 边框
            this.ctx.strokeStyle = config.color || '#00ff00';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x1, y, width, barHeight);
            
            // 文字
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(
                config.word || `${config.shape} ${index + 1}`,
                x1 + 5,
                y + 14
            );
            
            // 拖拽手柄
            this.drawHandle(x1, y, barHeight);
            this.drawHandle(x2, y, barHeight);
        });
    }
    
    drawHandle(x, y, height) {
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(x - 3, y, 6, height);
    }
    
    drawCurrentTimeIndicator() {
        const x = this.currentTime * this.scale;
        const { height } = this.canvas;
        
        // 红色竖线
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, height);
        this.ctx.stroke();
        
        // 顶部三角形
        this.ctx.fillStyle = '#ff0000';
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x - 5, 10);
        this.ctx.lineTo(x + 5, 10);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    onMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 检查是否点击了时间条或手柄
        const target = this.hitTest(x, y);
        
        if (target) {
            this.isDragging = true;
            this.dragTarget = target;
            this.canvas.style.cursor = 'ew-resize';
        }
        // 暂时禁用时间轴点击跳转功能，避免与视频进度条冲突
        // else if (y < 30) {
        //     // 点击时间刻度，跳转到该时间
        //     const time = x / this.scale;
        //     this.game.events.emit('video:seek', time);
        // }
    }
    
    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (this.isDragging && this.dragTarget) {
            const time = x / this.scale;
            const { hotspot, handle } = this.dragTarget;
            
            if (handle === 'start') {
                hotspot.startTime = Math.max(0, Math.min(time, hotspot.endTime - 0.1));
            } else if (handle === 'end') {
                hotspot.endTime = Math.max(hotspot.startTime + 0.1, time);
            }
            
            // 更新场景中的热区
            this.updateHotspotTime(hotspot);
            this.render();
        } else {
            // 更新鼠标样式
            const target = this.hitTest(x, y);
            this.canvas.style.cursor = target ? 'ew-resize' : 'default';
        }
    }
    
    onMouseUp() {
        this.isDragging = false;
        this.dragTarget = null;
        this.canvas.style.cursor = 'default';
    }
    
    onWheel(e) {
        e.preventDefault();
        
        // 缩放时间轴
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        this.scale = Math.max(1, Math.min(50, this.scale * delta));
        
        this.render();
    }
    
    hitTest(x, y) {
        if (!this.scene) return null;
        
        const hotspots = this.scene.registry.get('hotspots') || [];
        const scaleHeight = 30;
        const barHeight = 20;
        const barGap = 5;
        
        for (let i = 0; i < hotspots.length; i++) {
            const config = hotspots[i];
            const barY = scaleHeight + 10 + i * (barHeight + barGap);
            const x1 = config.startTime * this.scale;
            const x2 = config.endTime * this.scale;
            
            // 检查是否点击了开始手柄
            if (Math.abs(x - x1) < 5 && y >= barY && y <= barY + barHeight) {
                return { hotspot: config, handle: 'start' };
            }
            
            // 检查是否点击了结束手柄
            if (Math.abs(x - x2) < 5 && y >= barY && y <= barY + barHeight) {
                return { hotspot: config, handle: 'end' };
            }
        }
        
        return null;
    }
    
    updateHotspotTime(config) {
        if (!this.scene) return;
        
        const hotspot = this.scene.hotspots.find(h => h.config.id === config.id);
        if (hotspot) {
            hotspot.config.startTime = config.startTime;
            hotspot.config.endTime = config.endTime;
            this.scene.syncToRegistry();
        }
    }
}
