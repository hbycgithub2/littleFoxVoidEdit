// src/utils/DrawingTimePresetHelper.js
// 绘制时间预设辅助工具 - 完全遵循 Phaser 3 官方标准

export default class DrawingTimePresetHelper {
    constructor(scene) {
        this.scene = scene;
        this.currentPreset = 5; // 默认5秒
        this.isActive = false;
        
        // 创建显示文本（遵循 Phaser 标准）
        // 位置：屏幕中上方，更醒目
        const centerX = scene.game.config.width / 2;
        this.presetText = scene.add.text(centerX, 80, '', {
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#ffffff',
            backgroundColor: 'rgba(76, 175, 80, 0.9)',
            padding: { x: 20, y: 10 },
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 4,
                fill: true
            }
        });
        this.presetText.setOrigin(0.5, 0);
        this.presetText.setDepth(1003);
        this.presetText.setScrollFactor(0);
        this.presetText.setVisible(false);
        
        this.setupKeyboard();
    }
    
    /**
     * 设置键盘监听（遵循 Phaser 官方标准）
     */
    setupKeyboard() {
        // 监听数字键1-9
        for (let i = 1; i <= 9; i++) {
            this.scene.input.keyboard.on(`keydown-${i}`, (event) => {
                // 检查是否在输入框中
                if (this.isInputFocused()) return;
                this.setPreset(i);
            });
        }
        
        // 监听0键重置为默认5秒
        this.scene.input.keyboard.on('keydown-0', (event) => {
            // 检查是否在输入框中
            if (this.isInputFocused()) return;
            this.setPreset(5);
        });
    }
    
    /**
     * 检查是否有输入框获得焦点
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
     * 设置时长预设
     * @param {number} seconds - 时长（秒）
     */
    setPreset(seconds) {
        this.currentPreset = seconds;
        this.isActive = true;
        this.showPreset();
        
        // 发送事件（遵循 Phaser 标准）
        this.scene.events.emit('drawing:presetChanged', seconds);
        
        console.log(`⏱️ 时长预设: ${seconds}秒`);
    }
    
    /**
     * 显示预设提示
     */
    showPreset() {
        this.presetText.setText(`⏱️ 热区时长: ${this.currentPreset}秒`);
        this.presetText.setVisible(true);
        
        // 添加缩放动画效果（遵循 Phaser 标准）
        this.presetText.setScale(0.8);
        this.scene.tweens.add({
            targets: this.presetText,
            scale: 1,
            duration: 200,
            ease: 'Back.easeOut'
        });
        
        // 3秒后淡出隐藏（遵循 Phaser 标准）
        this.scene.time.delayedCall(2500, () => {
            this.scene.tweens.add({
                targets: this.presetText,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    this.presetText.setVisible(false);
                    this.presetText.setAlpha(1);
                }
            });
        });
    }
    
    /**
     * 获取当前预设
     * @returns {number} 预设时长（秒）
     */
    getPreset() {
        return this.currentPreset;
    }
    
    /**
     * 重置预设
     */
    reset() {
        this.currentPreset = 5;
        this.isActive = false;
        this.presetText.setVisible(false);
    }
    
    /**
     * 清理资源（遵循 Phaser 标准）
     */
    destroy() {
        // 移除键盘监听
        for (let i = 0; i <= 9; i++) {
            this.scene.input.keyboard.off(`keydown-${i}`);
        }
        
        if (this.presetText) {
            this.presetText.destroy();
            this.presetText = null;
        }
    }
}
