// src/utils/DrawingAnimationHelper.js
// 绘制动画效果辅助工具 - 遵循 Phaser 3 官方标准

export default class DrawingAnimationHelper {
    constructor(scene) {
        this.scene = scene;
        this.enabled = true;
        this.particles = [];
    }
    
    /**
     * 播放完成动画
     * @param {number} x - X 坐标
     * @param {number} y - Y 坐标
     * @param {string} shape - 形状类型
     */
    playCompleteAnimation(x, y, shape) {
        if (!this.enabled) return;
        
        // 创建成功提示文本（遵循 Phaser 官方标准）
        const text = this.scene.add.text(x, y, '✓', {
            fontSize: '32px',
            color: '#00ff00',
            fontStyle: 'bold'
        });
        text.setOrigin(0.5);
        text.setDepth(2001);
        
        // 淡出动画（遵循 Phaser 官方标准）
        this.scene.tweens.add({
            targets: text,
            alpha: 0,
            y: y - 50,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                text.destroy();
            }
        });
        
        // 创建扩散圆圈效果（遵循 Phaser 官方标准）
        const circle = this.scene.add.graphics();
        circle.setDepth(2000);
        
        let radius = 0;
        const maxRadius = 50;
        
        const timer = this.scene.time.addEvent({
            delay: 16,
            repeat: 30,
            callback: () => {
                circle.clear();
                circle.lineStyle(3, 0x00ff00, 1 - radius / maxRadius);
                circle.strokeCircle(x, y, radius);
                radius += maxRadius / 30;
            },
            callbackScope: this
        });
        
        // 清理
        this.scene.time.delayedCall(500, () => {
            timer.remove();
            circle.destroy();
        });
    }
    
    /**
     * 播放取消动画
     * @param {number} x - X 坐标
     * @param {number} y - Y 坐标
     */
    playCancelAnimation(x, y) {
        if (!this.enabled) return;
        
        // 创建取消提示文本（遵循 Phaser 官方标准）
        const text = this.scene.add.text(x, y, '✗', {
            fontSize: '32px',
            color: '#ff0000',
            fontStyle: 'bold'
        });
        text.setOrigin(0.5);
        text.setDepth(2001);
        
        // 淡出动画（遵循 Phaser 官方标准）
        this.scene.tweens.add({
            targets: text,
            alpha: 0,
            scale: 0.5,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                text.destroy();
            }
        });
    }
    
    /**
     * 播放顶点添加动画
     * @param {number} x - X 坐标
     * @param {number} y - Y 坐标
     */
    playVertexAddAnimation(x, y) {
        if (!this.enabled) return;
        
        // 创建顶点脉冲效果（遵循 Phaser 官方标准）
        const circle = this.scene.add.graphics();
        circle.setDepth(2000);
        circle.fillStyle(0x00ff00, 0.5);
        circle.fillCircle(x, y, 10);
        
        // 缩放动画（遵循 Phaser 官方标准）
        this.scene.tweens.add({
            targets: circle,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                circle.destroy();
            }
        });
    }
    
    /**
     * 启用动画
     */
    enable() {
        this.enabled = true;
    }
    
    /**
     * 禁用动画
     */
    disable() {
        this.enabled = false;
    }
    
    /**
     * 切换动画
     */
    toggle() {
        this.enabled = !this.enabled;
        console.log(`${this.enabled ? '✅' : '❌'} 绘制动画: ${this.enabled ? '开启' : '关闭'}`);
    }
    
    /**
     * 清理资源
     */
    destroy() {
        this.particles.forEach(p => {
            if (p && p.destroy) p.destroy();
        });
        this.particles = [];
    }
}
