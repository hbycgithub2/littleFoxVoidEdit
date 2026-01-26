// src/utils/LoadingManager.js
// 加载动画管理器 - 使用 Phaser Tween 系统（遵循 Phaser 3 标准）

export default class LoadingManager {
    constructor(scene) {
        this.scene = scene;
        this.loadingOverlay = null;
        this.loadingText = null;
        this.progressBar = null;
        this.progressBarBg = null;
        this.spinner = null;
        this.isShowing = false;
    }
    
    /**
     * 显示加载动画
     * @param {string} message - 加载消息
     * @param {boolean} showProgress - 是否显示进度条
     */
    show(message = '加载中...', showProgress = false) {
        if (this.isShowing) return;
        this.isShowing = true;
        
        const { width, height } = this.scene.cameras.main;
        
        // 创建半透明遮罩
        this.loadingOverlay = this.scene.add.rectangle(
            width / 2, 
            height / 2, 
            width, 
            height, 
            0x000000, 
            0
        );
        this.loadingOverlay.setDepth(10000);
        
        // 淡入动画
        this.scene.tweens.add({
            targets: this.loadingOverlay,
            alpha: 0.8,
            duration: 300,
            ease: 'Power2'
        });
        
        // 创建加载文本
        this.loadingText = this.scene.add.text(
            width / 2,
            height / 2 - 40,
            message,
            {
                fontSize: '24px',
                color: '#ffffff',
                fontFamily: 'Arial'
            }
        );
        this.loadingText.setOrigin(0.5);
        this.loadingText.setDepth(10001);
        this.loadingText.setAlpha(0);
        
        // 文本淡入
        this.scene.tweens.add({
            targets: this.loadingText,
            alpha: 1,
            duration: 300,
            ease: 'Power2'
        });
        
        // 创建旋转加载图标
        this.createSpinner(width / 2, height / 2 + 20);
        
        // 如果需要进度条
        if (showProgress) {
            this.createProgressBar(width / 2, height / 2 + 60);
        }
    }
    
    /**
     * 创建旋转加载图标
     * @param {number} x - X 坐标
     * @param {number} y - Y 坐标
     */
    createSpinner(x, y) {
        // 创建圆形加载图标
        const graphics = this.scene.add.graphics();
        graphics.lineStyle(4, 0x00ff00, 1);
        graphics.beginPath();
        graphics.arc(0, 0, 20, 0, Math.PI * 1.5, false);
        graphics.strokePath();
        
        graphics.generateTexture('spinner', 50, 50);
        graphics.destroy();
        
        this.spinner = this.scene.add.image(x, y, 'spinner');
        this.spinner.setDepth(10001);
        this.spinner.setAlpha(0);
        
        // 淡入
        this.scene.tweens.add({
            targets: this.spinner,
            alpha: 1,
            duration: 300,
            ease: 'Power2'
        });
        
        // 旋转动画
        this.scene.tweens.add({
            targets: this.spinner,
            angle: 360,
            duration: 1000,
            repeat: -1,
            ease: 'Linear'
        });
    }
    
    /**
     * 创建进度条
     * @param {number} x - X 坐标
     * @param {number} y - Y 坐标
     */
    createProgressBar(x, y) {
        const barWidth = 300;
        const barHeight = 20;
        
        // 进度条背景
        this.progressBarBg = this.scene.add.rectangle(
            x, y, barWidth, barHeight, 0x333333
        );
        this.progressBarBg.setDepth(10001);
        this.progressBarBg.setAlpha(0);
        
        // 进度条
        this.progressBar = this.scene.add.rectangle(
            x - barWidth / 2, y, 0, barHeight, 0x00ff00
        );
        this.progressBar.setOrigin(0, 0.5);
        this.progressBar.setDepth(10002);
        this.progressBar.setAlpha(0);
        
        // 淡入
        this.scene.tweens.add({
            targets: [this.progressBarBg, this.progressBar],
            alpha: 1,
            duration: 300,
            ease: 'Power2'
        });
    }
    
    /**
     * 更新进度
     * @param {number} progress - 进度值 (0-1)
     */
    updateProgress(progress) {
        if (!this.progressBar) return;
        
        const barWidth = 300;
        const targetWidth = barWidth * Math.max(0, Math.min(1, progress));
        
        // 平滑过渡
        this.scene.tweens.add({
            targets: this.progressBar,
            width: targetWidth,
            duration: 200,
            ease: 'Power2'
        });
    }
    
    /**
     * 更新加载消息
     * @param {string} message - 新消息
     */
    updateMessage(message) {
        if (!this.loadingText) return;
        this.loadingText.setText(message);
    }
    
    /**
     * 隐藏加载动画
     * @param {Function} onComplete - 完成回调
     */
    hide(onComplete) {
        if (!this.isShowing) return;
        
        const targets = [
            this.loadingOverlay,
            this.loadingText,
            this.spinner,
            this.progressBar,
            this.progressBarBg
        ].filter(obj => obj !== null);
        
        // 淡出动画
        this.scene.tweens.add({
            targets: targets,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.destroy();
                this.isShowing = false;
                if (onComplete) onComplete();
            }
        });
    }
    
    /**
     * 销毁所有对象
     */
    destroy() {
        if (this.loadingOverlay) {
            this.loadingOverlay.destroy();
            this.loadingOverlay = null;
        }
        if (this.loadingText) {
            this.loadingText.destroy();
            this.loadingText = null;
        }
        if (this.spinner) {
            this.spinner.destroy();
            this.spinner = null;
        }
        if (this.progressBar) {
            this.progressBar.destroy();
            this.progressBar = null;
        }
        if (this.progressBarBg) {
            this.progressBarBg.destroy();
            this.progressBarBg = null;
        }
    }
}
