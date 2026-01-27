// src/video/VideoControlBar.js
// 自定义视频控制条 - 完全遵循 Phaser 3 官方标准
// 功能：播放控制、进度条、音量控制、时间显示

export default class VideoControlBar {
    constructor(scene, videoController, config = {}) {
        this.scene = scene;
        this.videoController = videoController;
        this.config = {
            x: config.x || 0,
            y: config.y || 460,
            width: config.width || 800,
            height: config.height || 40,
            ...config
        };
        
        this.container = null;
        this.progressBar = null;
        this.isDragging = false;
        
        this.init();
    }
    
    /**
     * 初始化控制条（遵循 Phaser 标准）
     */
    init() {
        this.container = this.scene.add.container(this.config.x, this.config.y);
        this.container.setDepth(1000);
        this.container.setScrollFactor(0);
        
        this.createBackground();
        this.createPlayButton();
        this.createProgressBar();
        this.createTimeDisplay();
        this.createVolumeControl();
        this.createSpeedControl();
        
        this.setupEvents();
    }
    
    /**
     * 创建背景（遵循 Phaser 标准）
     */
    createBackground() {
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x000000, 0.9);
        bg.fillRect(0, 0, this.config.width, this.config.height);
        bg.lineStyle(2, 0x4CAF50);
        bg.strokeRect(0, 0, this.config.width, this.config.height);
        this.container.add(bg);
    }
    
    /**
     * 创建播放按钮（遵循 Phaser 标准）
     */
    createPlayButton() {
        this.playButton = this.scene.add.container(20, 20);
        
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x4CAF50, 1);
        bg.fillCircle(0, 0, 15);
        this.playButton.add(bg);
        
        this.playIcon = this.scene.add.text(0, 0, '▶', {
            fontSize: '16px',
            color: '#ffffff'
        });
        this.playIcon.setOrigin(0.5);
        this.playButton.add(this.playIcon);
        
        bg.setInteractive(
            new Phaser.Geom.Circle(0, 0, 15),
            Phaser.Geom.Circle.Contains
        );
        
        bg.on('pointerdown', () => {
            this.videoController.togglePlay();
        });
        
        bg.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(0x45a049, 1);
            bg.fillCircle(0, 0, 15);
        });
        
        bg.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(0x4CAF50, 1);
            bg.fillCircle(0, 0, 15);
        });
        
        this.container.add(this.playButton);
    }
    
    /**
     * 创建进度条（遵循 Phaser 标准）
     */
    createProgressBar() {
        const barX = 50;
        const barY = 20;
        const barWidth = this.config.width - 250;
        const barHeight = 6;
        
        // 进度条背景
        const bgBar = this.scene.add.graphics();
        bgBar.fillStyle(0x333333, 1);
        bgBar.fillRoundedRect(barX, barY - barHeight/2, barWidth, barHeight, 3);
        this.container.add(bgBar);
        
        // 进度条填充
        this.progressFill = this.scene.add.graphics();
        this.container.add(this.progressFill);
        
        // 进度条滑块
        this.progressHandle = this.scene.add.circle(barX, barY, 8, 0x4CAF50);
        this.progressHandle.setStrokeStyle(2, 0xffffff);
        this.container.add(this.progressHandle);
        
        // 交互区域
        const hitArea = this.scene.add.graphics();
        hitArea.fillStyle(0x000000, 0.01);
        hitArea.fillRect(barX, barY - 10, barWidth, 20);
        hitArea.setInteractive(
            new Phaser.Geom.Rectangle(barX, barY - 10, barWidth, 20),
            Phaser.Geom.Rectangle.Contains
        );
        
        hitArea.on('pointerdown', (pointer) => {
            this.isDragging = true;
            this.updateProgress(pointer.x - this.config.x);
        });
        
        this.scene.input.on('pointermove', (pointer) => {
            if (this.isDragging) {
                this.updateProgress(pointer.x - this.config.x);
            }
        });
        
        this.scene.input.on('pointerup', () => {
            this.isDragging = false;
        });
        
        this.container.add(hitArea);
        
        this.progressBarConfig = { x: barX, y: barY, width: barWidth, height: barHeight };
    }
    
    /**
     * 更新进度（遵循 Phaser 标准）
     */
    updateProgress(x) {
        const barX = this.progressBarConfig.x;
        const barWidth = this.progressBarConfig.width;
        
        const localX = Math.max(barX, Math.min(x, barX + barWidth));
        const progress = (localX - barX) / barWidth;
        const time = progress * this.videoController.duration;
        
        this.videoController.seekTo(time);
    }
    
    /**
     * 创建时间显示（遵循 Phaser 标准）
     */
    createTimeDisplay() {
        this.timeDisplay = this.scene.add.text(
            this.config.width - 180,
            20,
            '0:00 / 0:00',
            {
                fontSize: '12px',
                color: '#ffffff'
            }
        );
        this.timeDisplay.setOrigin(0, 0.5);
        this.container.add(this.timeDisplay);
    }
    
    /**
     * 创建音量控制（遵循 Phaser 标准）
     */
    createVolumeControl() {
        const volumeBtn = this.scene.add.text(
            this.config.width - 100,
            20,
            '🔊',
            {
                fontSize: '16px'
            }
        );
        volumeBtn.setOrigin(0.5);
        volumeBtn.setInteractive();
        
        volumeBtn.on('pointerdown', () => {
            this.videoController.toggleMute();
            volumeBtn.setText(this.videoController.videoElement.muted ? '🔇' : '🔊');
        });
        
        this.container.add(volumeBtn);
    }
    
    /**
     * 创建速度控制（遵循 Phaser 标准）
     */
    createSpeedControl() {
        const speedBtn = this.scene.add.text(
            this.config.width - 50,
            20,
            '1x',
            {
                fontSize: '12px',
                color: '#ffffff',
                backgroundColor: '#333333',
                padding: { x: 6, y: 3 }
            }
        );
        speedBtn.setOrigin(0.5);
        speedBtn.setInteractive();
        
        const speeds = [0.5, 1, 1.5, 2];
        let currentSpeedIndex = 1;
        
        speedBtn.on('pointerdown', () => {
            currentSpeedIndex = (currentSpeedIndex + 1) % speeds.length;
            const speed = speeds[currentSpeedIndex];
            this.videoController.setPlaybackRate(speed);
            speedBtn.setText(`${speed}x`);
        });
        
        this.container.add(speedBtn);
    }
    
    /**
     * 设置事件监听（遵循 Phaser 标准）
     */
    setupEvents() {
        // 监听视频播放状态
        this.scene.events.on('video:play', () => {
            this.playIcon.setText('⏸');
        });
        
        this.scene.events.on('video:pause', () => {
            this.playIcon.setText('▶');
        });
        
        // 监听时间更新
        this.scene.events.on('video:timeupdate', (time) => {
            this.updateDisplay(time);
        });
    }
    
    /**
     * 更新显示（遵循 Phaser 标准）
     */
    updateDisplay(currentTime) {
        // 更新进度条
        const progress = currentTime / this.videoController.duration;
        const barX = this.progressBarConfig.x;
        const barWidth = this.progressBarConfig.width;
        const barY = this.progressBarConfig.y;
        const barHeight = this.progressBarConfig.height;
        
        this.progressFill.clear();
        this.progressFill.fillStyle(0x4CAF50, 1);
        this.progressFill.fillRoundedRect(
            barX,
            barY - barHeight/2,
            barWidth * progress,
            barHeight,
            3
        );
        
        // 更新滑块位置
        this.progressHandle.x = barX + barWidth * progress;
        
        // 更新时间显示
        const current = this.formatTime(currentTime);
        const total = this.formatTime(this.videoController.duration);
        this.timeDisplay.setText(`${current} / ${total}`);
    }
    
    /**
     * 格式化时间
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    /**
     * 销毁
     */
    destroy() {
        if (this.container) {
            this.container.destroy();
        }
        
        this.scene.events.off('video:play');
        this.scene.events.off('video:pause');
        this.scene.events.off('video:timeupdate');
        this.scene.input.off('pointermove');
        this.scene.input.off('pointerup');
    }
}
