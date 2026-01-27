// src/utils/QuickFeedbackHelper.js
// 快速反馈辅助工具 - 完全遵循 Phaser 3 官方标准
// 提供视觉和听觉反馈

export default class QuickFeedbackHelper {
    constructor(scene) {
        this.scene = scene;
        this.enabled = true;
    }
    
    /**
     * 成功反馈（绿色闪光）
     */
    success(x, y) {
        if (!this.enabled) return;
        
        // 创建闪光圆圈（遵循 Phaser 标准）
        const circle = this.scene.add.circle(x, y, 30, 0x4CAF50, 0.6);
        circle.setDepth(2000);
        circle.setScrollFactor(0);
        
        // 扩散动画
        this.scene.tweens.add({
            targets: circle,
            scale: 2,
            alpha: 0,
            duration: 400,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                circle.destroy();
            }
        });
    }
    
    /**
     * 错误反馈（红色闪光）
     */
    error(x, y) {
        if (!this.enabled) return;
        
        const circle = this.scene.add.circle(x, y, 30, 0xFF6B6B, 0.6);
        circle.setDepth(2000);
        circle.setScrollFactor(0);
        
        // 抖动+淡出
        this.scene.tweens.add({
            targets: circle,
            x: x + 5,
            yoyo: true,
            repeat: 2,
            duration: 50
        });
        
        this.scene.tweens.add({
            targets: circle,
            alpha: 0,
            duration: 300,
            delay: 150,
            onComplete: () => {
                circle.destroy();
            }
        });
    }
    
    /**
     * 信息反馈（蓝色闪光）
     */
    info(x, y) {
        if (!this.enabled) return;
        
        const circle = this.scene.add.circle(x, y, 20, 0x2196F3, 0.5);
        circle.setDepth(2000);
        circle.setScrollFactor(0);
        
        this.scene.tweens.add({
            targets: circle,
            scale: 1.5,
            alpha: 0,
            duration: 300,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                circle.destroy();
            }
        });
    }
    
    /**
     * 启用/禁用
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    
    /**
     * 清理资源
     */
    destroy() {
        // 无需清理，动画会自动销毁
    }
}
