// src/timeline/TimelineCore.js
// 时间轴核心 - 完全遵循 Phaser 3 官方标准
// 功能：时间刻度、播放头、时间条、拖拽、吸附

export default class TimelineCore {
    constructor(scene, config = {}) {
        this.scene = scene;
        this.config = {
            x: config.x || 0,
            y: config.y || 500,
            width: config.width || 800,
            height: config.height || 100,
            duration: config.duration || 60, // 总时长（秒）
            pixelsPerSecond: config.pixelsPerSecond || 50,
            snapInterval: config.snapInterval || 0.5, // 吸附间隔（秒）
            ...config
        };
        
        this.currentTime = 0;
        this.isPlaying = false;
        this.playhead = null;
        this.container = null;
        this.tracks = [];
        this.markers = [];
        
        this.init();
    }
    
    /**
     * 初始化时间轴（遵循 Phaser 标准）
     */
    init() {
        this.container = this.scene.add.container(this.config.x, this.config.y);
        this.container.setDepth(1000);
        this.container.setScrollFactor(0);
        
        this.createBackground();
        this.createTimeScale();
        this.createPlayhead();
        this.setupInteraction();
    }
    
    /**
     * 创建背景（遵循 Phaser 标准）
     */
    createBackground() {
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x1a1a1a, 0.95);
        bg.fillRect(0, 0, this.config.width, this.config.height);
        bg.lineStyle(2, 0x4CAF50);
        bg.strokeRect(0, 0, this.config.width, this.config.height);
        this.container.add(bg);
    }
    
    /**
     * 创建时间刻度（遵循 Phaser 标准）
     */
    createTimeScale() {
        const scaleHeight = 30;
        const pps = this.config.pixelsPerSecond;
        
        // 刻度背景
        const scaleBg = this.scene.add.graphics();
        scaleBg.fillStyle(0x2a2a2a, 1);
        scaleBg.fillRect(0, 0, this.config.width, scaleHeight);
        this.container.add(scaleBg);
        
        // 绘制刻度线和时间标签
        for (let t = 0; t <= this.config.duration; t++) {
            const x = t * pps;
            if (x > this.config.width) break;
            
            const isSecond = t % 1 === 0;
            const isFiveSecond = t % 5 === 0;
            
            // 刻度线
            const line = this.scene.add.graphics();
            if (isFiveSecond) {
                line.lineStyle(2, 0xffffff, 0.8);
                line.lineBetween(x, 0, x, scaleHeight);
            } else if (isSecond) {
                line.lineStyle(1, 0xffffff, 0.5);
                line.lineBetween(x, scaleHeight - 15, x, scaleHeight);
            } else {
                line.lineStyle(1, 0xffffff, 0.3);
                line.lineBetween(x, scaleHeight - 8, x, scaleHeight);
            }
            this.container.add(line);
            
            // 时间标签（每5秒）
            if (isFiveSecond) {
                const label = this.scene.add.text(x, 5, this.formatTime(t), {
                    fontSize: '11px',
                    color: '#ffffff'
                });
                label.setOrigin(0.5, 0);
                this.container.add(label);
            }
        }
    }
    
    /**
     * 创建播放头（遵循 Phaser 标准）
     */
    createPlayhead() {
        this.playhead = this.scene.add.container(0, 0);
        
        // 播放头线
        const line = this.scene.add.graphics();
        line.lineStyle(2, 0xff0000, 1);
        line.lineBetween(0, 0, 0, this.config.height);
        this.playhead.add(line);
        
        // 播放头顶部三角形
        const triangle = this.scene.add.graphics();
        triangle.fillStyle(0xff0000, 1);
        triangle.fillTriangle(-6, 0, 6, 0, 0, 10);
        this.playhead.add(triangle);
        
        // 播放头底部圆形
        const circle = this.scene.add.graphics();
        circle.fillStyle(0xff0000, 1);
        circle.fillCircle(0, this.config.height, 6);
        this.playhead.add(circle);
        
        // 设置交互（遵循 Phaser 标准）
        const hitArea = new Phaser.Geom.Rectangle(-10, 0, 20, this.config.height);
        line.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
        line.setData('draggable', true);
        
        this.scene.input.setDraggable(line);
        
        line.on('drag', (pointer, dragX) => {
            this.setPlayheadPosition(dragX);
        });
        
        this.container.add(this.playhead);
    }
    
    /**
     * 设置播放头位置（遵循 Phaser 标准）
     */
    setPlayheadPosition(x) {
        // 限制范围
        x = Phaser.Math.Clamp(x, 0, this.config.width);
        
        // 吸附
        if (this.config.snapInterval > 0) {
            const time = x / this.config.pixelsPerSecond;
            const snappedTime = Math.round(time / this.config.snapInterval) * this.config.snapInterval;
            x = snappedTime * this.config.pixelsPerSecond;
        }
        
        this.playhead.x = x;
        this.currentTime = x / this.config.pixelsPerSecond;
        
        // 触发事件
        this.scene.events.emit('timeline:timeChanged', this.currentTime);
    }
    
    /**
     * 设置交互（遵循 Phaser 标准）
     */
    setupInteraction() {
        // 点击时间轴跳转
        const clickArea = this.scene.add.graphics();
        clickArea.fillStyle(0x000000, 0.01);
        clickArea.fillRect(0, 30, this.config.width, this.config.height - 30);
        clickArea.setInteractive(
            new Phaser.Geom.Rectangle(0, 30, this.config.width, this.config.height - 30),
            Phaser.Geom.Rectangle.Contains
        );
        
        clickArea.on('pointerdown', (pointer) => {
            const localX = pointer.x - this.config.x;
            this.setPlayheadPosition(localX);
        });
        
        this.container.add(clickArea);
    }
    
    /**
     * 添加时间条（遵循 Phaser 标准）
     */
    addTimeBar(id, startTime, endTime, y, color = 0x4CAF50) {
        const startX = startTime * this.config.pixelsPerSecond;
        const width = (endTime - startTime) * this.config.pixelsPerSecond;
        
        const bar = this.scene.add.container(startX, y);
        
        // 时间条背景
        const bg = this.scene.add.graphics();
        bg.fillStyle(color, 0.7);
        bg.fillRoundedRect(0, 0, width, 20, 4);
        bg.lineStyle(2, color, 1);
        bg.strokeRoundedRect(0, 0, width, 20, 4);
        bar.add(bg);
        
        // 时间条文本
        const text = this.scene.add.text(width / 2, 10, `${id}`, {
            fontSize: '10px',
            color: '#ffffff'
        });
        text.setOrigin(0.5);
        bar.add(text);
        
        // 设置交互
        bg.setInteractive(
            new Phaser.Geom.Rectangle(0, 0, width, 20),
            Phaser.Geom.Rectangle.Contains
        );
        
        this.scene.input.setDraggable(bg);
        
        bg.on('drag', (pointer, dragX) => {
            const newX = Phaser.Math.Clamp(dragX, 0, this.config.width - width);
            bar.x = newX;
        });
        
        bg.on('dragend', () => {
            const newStartTime = bar.x / this.config.pixelsPerSecond;
            this.scene.events.emit('timeline:barMoved', {
                id,
                startTime: newStartTime,
                endTime: newStartTime + (endTime - startTime)
            });
        });
        
        bar.setData('id', id);
        bar.setData('startTime', startTime);
        bar.setData('endTime', endTime);
        
        this.container.add(bar);
        this.tracks.push(bar);
        
        return bar;
    }
    
    /**
     * 添加时间标记（遵循 Phaser 标准）
     */
    addMarker(time, label, color = 0xffff00) {
        const x = time * this.config.pixelsPerSecond;
        
        const marker = this.scene.add.container(x, 0);
        
        // 标记线
        const line = this.scene.add.graphics();
        line.lineStyle(2, color, 0.8);
        line.lineBetween(0, 30, 0, this.config.height);
        marker.add(line);
        
        // 标记标签
        const text = this.scene.add.text(0, 15, label, {
            fontSize: '10px',
            color: '#' + color.toString(16).padStart(6, '0'),
            backgroundColor: '#000000',
            padding: { x: 3, y: 2 }
        });
        text.setOrigin(0.5);
        marker.add(text);
        
        marker.setData('time', time);
        marker.setData('label', label);
        
        this.container.add(marker);
        this.markers.push(marker);
        
        return marker;
    }
    
    /**
     * 播放/暂停（遵循 Phaser 标准）
     */
    togglePlay() {
        this.isPlaying = !this.isPlaying;
        
        if (this.isPlaying) {
            this.play();
        } else {
            this.pause();
        }
    }
    
    play() {
        this.isPlaying = true;
        this.scene.events.emit('timeline:play');
    }
    
    pause() {
        this.isPlaying = false;
        this.scene.events.emit('timeline:pause');
    }
    
    /**
     * 更新（遵循 Phaser 标准）
     */
    update(delta) {
        if (this.isPlaying) {
            this.currentTime += delta / 1000;
            
            if (this.currentTime >= this.config.duration) {
                this.currentTime = this.config.duration;
                this.pause();
            }
            
            const x = this.currentTime * this.config.pixelsPerSecond;
            this.playhead.x = x;
            
            this.scene.events.emit('timeline:timeChanged', this.currentTime);
        }
    }
    
    /**
     * 格式化时间（遵循 Phaser 标准）
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    /**
     * 跳转到时间
     */
    seekTo(time) {
        this.currentTime = Phaser.Math.Clamp(time, 0, this.config.duration);
        const x = this.currentTime * this.config.pixelsPerSecond;
        this.playhead.x = x;
        this.scene.events.emit('timeline:timeChanged', this.currentTime);
    }
    
    /**
     * 销毁
     */
    destroy() {
        if (this.container) {
            this.container.destroy();
        }
        this.tracks = [];
        this.markers = [];
    }
}
