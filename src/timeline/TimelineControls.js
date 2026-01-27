// src/timeline/TimelineControls.js
// 时间轴控制器 - 完全遵循 Phaser 3 官方标准
// 功能：播放控制、键盘快捷键、右键菜单

export default class TimelineControls {
    constructor(scene, timeline) {
        this.scene = scene;
        this.timeline = timeline;
        this.controlPanel = null;
        
        this.init();
    }
    
    /**
     * 初始化控制器（遵循 Phaser 标准）
     */
    init() {
        this.createControlPanel();
        this.setupKeyboard();
        this.setupContextMenu();
    }
    
    /**
     * 创建控制面板（遵循 Phaser 标准）
     */
    createControlPanel() {
        this.controlPanel = this.scene.add.container(10, 450);
        this.controlPanel.setDepth(1001);
        this.controlPanel.setScrollFactor(0);
        
        let x = 0;
        
        // 播放/暂停按钮
        const playBtn = this.createButton(x, 0, '▶', () => {
            this.timeline.togglePlay();
            playBtn.list[1].setText(this.timeline.isPlaying ? '⏸' : '▶');
        });
        this.controlPanel.add(playBtn);
        x += 45;
        
        // 停止按钮
        const stopBtn = this.createButton(x, 0, '⏹', () => {
            this.timeline.pause();
            this.timeline.seekTo(0);
        });
        this.controlPanel.add(stopBtn);
        x += 45;
        
        // 后退按钮
        const backBtn = this.createButton(x, 0, '⏮', () => {
            this.timeline.seekTo(this.timeline.currentTime - 5);
        });
        this.controlPanel.add(backBtn);
        x += 45;
        
        // 前进按钮
        const forwardBtn = this.createButton(x, 0, '⏭', () => {
            this.timeline.seekTo(this.timeline.currentTime + 5);
        });
        this.controlPanel.add(forwardBtn);
        x += 45;
        
        // 时间显示
        this.timeDisplay = this.scene.add.text(x + 10, 15, '0:00 / 1:00', {
            fontSize: '14px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        });
        this.timeDisplay.setOrigin(0, 0.5);
        this.controlPanel.add(this.timeDisplay);
        
        // 监听时间变化
        this.scene.events.on('timeline:timeChanged', (time) => {
            this.updateTimeDisplay(time);
        });
    }
    
    /**
     * 创建按钮（遵循 Phaser 标准）
     */
    createButton(x, y, text, callback) {
        const btn = this.scene.add.container(x, y);
        
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x4CAF50, 1);
        bg.fillRoundedRect(0, 0, 40, 30, 4);
        btn.add(bg);
        
        const label = this.scene.add.text(20, 15, text, {
            fontSize: '16px',
            color: '#ffffff'
        });
        label.setOrigin(0.5);
        btn.add(label);
        
        bg.setInteractive(
            new Phaser.Geom.Rectangle(0, 0, 40, 30),
            Phaser.Geom.Rectangle.Contains
        );
        
        bg.on('pointerdown', callback);
        bg.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(0x45a049, 1);
            bg.fillRoundedRect(0, 0, 40, 30, 4);
        });
        bg.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(0x4CAF50, 1);
            bg.fillRoundedRect(0, 0, 40, 30, 4);
        });
        
        return btn;
    }
    
    /**
     * 更新时间显示
     */
    updateTimeDisplay(currentTime) {
        const current = this.timeline.formatTime(currentTime);
        const total = this.timeline.formatTime(this.timeline.config.duration);
        this.timeDisplay.setText(`${current} / ${total}`);
    }
    
    /**
     * 设置键盘快捷键（遵循 Phaser 标准）
     */
    setupKeyboard() {
        const keyboard = this.scene.input.keyboard;
        
        // 空格键 - 播放/暂停
        keyboard.on('keydown-SPACE', (event) => {
            event.preventDefault();
            this.timeline.togglePlay();
        });
        
        // 左箭头 - 后退1秒
        keyboard.on('keydown-LEFT', () => {
            this.timeline.seekTo(this.timeline.currentTime - 1);
        });
        
        // 右箭头 - 前进1秒
        keyboard.on('keydown-RIGHT', () => {
            this.timeline.seekTo(this.timeline.currentTime + 1);
        });
        
        // Home - 跳到开始
        keyboard.on('keydown-HOME', () => {
            this.timeline.seekTo(0);
        });
        
        // End - 跳到结束
        keyboard.on('keydown-END', () => {
            this.timeline.seekTo(this.timeline.config.duration);
        });
        
        // Shift+左箭头 - 后退5秒
        keyboard.on('keydown', (event) => {
            if (event.shiftKey && event.key === 'ArrowLeft') {
                this.timeline.seekTo(this.timeline.currentTime - 5);
            }
            if (event.shiftKey && event.key === 'ArrowRight') {
                this.timeline.seekTo(this.timeline.currentTime + 5);
            }
        });
    }
    
    /**
     * 设置右键菜单（遵循 Phaser 标准）
     */
    setupContextMenu() {
        // 右键菜单容器
        this.contextMenu = null;
        
        this.scene.input.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) {
                this.showContextMenu(pointer.x, pointer.y);
            } else {
                this.hideContextMenu();
            }
        });
    }
    
    /**
     * 显示右键菜单
     */
    showContextMenu(x, y) {
        this.hideContextMenu();
        
        this.contextMenu = this.scene.add.container(x, y);
        this.contextMenu.setDepth(2000);
        this.contextMenu.setScrollFactor(0);
        
        const menuItems = [
            { text: '添加标记', action: () => this.addMarkerAtTime() },
            { text: '删除标记', action: () => this.deleteMarkerAtTime() },
            { text: '跳转到此处', action: () => this.seekToPointer(x) }
        ];
        
        const menuHeight = menuItems.length * 30;
        
        // 背景
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x2a2a2a, 0.95);
        bg.fillRoundedRect(0, 0, 150, menuHeight, 4);
        bg.lineStyle(1, 0x4CAF50);
        bg.strokeRoundedRect(0, 0, 150, menuHeight, 4);
        this.contextMenu.add(bg);
        
        // 菜单项
        menuItems.forEach((item, index) => {
            const itemY = index * 30;
            
            const itemBg = this.scene.add.graphics();
            itemBg.setInteractive(
                new Phaser.Geom.Rectangle(0, itemY, 150, 30),
                Phaser.Geom.Rectangle.Contains
            );
            
            itemBg.on('pointerover', () => {
                itemBg.clear();
                itemBg.fillStyle(0x4CAF50, 0.3);
                itemBg.fillRect(0, itemY, 150, 30);
            });
            
            itemBg.on('pointerout', () => {
                itemBg.clear();
            });
            
            itemBg.on('pointerdown', () => {
                item.action();
                this.hideContextMenu();
            });
            
            this.contextMenu.add(itemBg);
            
            const text = this.scene.add.text(10, itemY + 15, item.text, {
                fontSize: '12px',
                color: '#ffffff'
            });
            text.setOrigin(0, 0.5);
            this.contextMenu.add(text);
        });
    }
    
    hideContextMenu() {
        if (this.contextMenu) {
            this.contextMenu.destroy();
            this.contextMenu = null;
        }
    }
    
    addMarkerAtTime() {
        const time = this.timeline.currentTime;
        this.timeline.addMarker(time, `标记${this.timeline.markers.length + 1}`);
        console.log(`✓ 添加标记于 ${this.timeline.formatTime(time)}`);
    }
    
    deleteMarkerAtTime() {
        // 删除最近的标记
        if (this.timeline.markers.length > 0) {
            const marker = this.timeline.markers.pop();
            marker.destroy();
            console.log('✓ 删除标记');
        }
    }
    
    seekToPointer(x) {
        const localX = x - this.timeline.config.x;
        const time = localX / this.timeline.config.pixelsPerSecond;
        this.timeline.seekTo(time);
    }
    
    /**
     * 销毁
     */
    destroy() {
        if (this.controlPanel) {
            this.controlPanel.destroy();
        }
        this.hideContextMenu();
        this.scene.events.off('timeline:timeChanged');
        this.scene.input.keyboard.off('keydown-SPACE');
        this.scene.input.keyboard.off('keydown-LEFT');
        this.scene.input.keyboard.off('keydown-RIGHT');
        this.scene.input.keyboard.off('keydown-HOME');
        this.scene.input.keyboard.off('keydown-END');
    }
}
