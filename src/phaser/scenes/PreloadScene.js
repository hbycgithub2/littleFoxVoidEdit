// src/phaser/scenes/PreloadScene.js
// 预加载场景 - 遵循 Phaser 3 官方标准

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }
    
    preload() {
        // 创建加载进度条（遵循 Phaser 官方标准）
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 进度条背景
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
        
        // 加载文本
        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
            fontSize: '20px',
            color: '#ffffff'
        });
        loadingText.setOrigin(0.5, 0.5);
        
        // 百分比文本
        const percentText = this.add.text(width / 2, height / 2, '0%', {
            fontSize: '18px',
            color: '#ffffff'
        });
        percentText.setOrigin(0.5, 0.5);
        
        // 监听加载进度（遵循 Phaser 官方标准）
        this.load.on('progress', (value) => {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0x00ff00, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });
        
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
        });
        
        // 这里可以预加载资源（如果有的话）
        // this.load.image('key', 'path');
    }
    
    create() {
        // 加载完成，启动编辑器场景
        this.scene.start('EditorScene');
    }
}
