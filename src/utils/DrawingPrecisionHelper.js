// src/utils/DrawingPrecisionHelper.js
// 绘制精度辅助工具 - 遵循 Phaser 3 官方标准

export default class DrawingPrecisionHelper {
    constructor(scene) {
        this.scene = scene;
        this.enabled = false;
        
        // 创建精度信息文本（遵循 Phaser 官方标准）
        this.precisionText = scene.add.text(0, 0, '', {
            fontSize: '11px',
            color: '#ffff00',
            backgroundColor: '#000000',
            padding: { x: 6, y: 4 }
        });
        this.precisionText.setDepth(1003);
        this.precisionText.setVisible(false);
    }
    
    /**
     * 更新精度信息
     * @param {number} startX - 起始 X
     * @param {number} startY - 起始 Y
     * @param {number} currentX - 当前 X
     * @param {number} currentY - 当前 Y
     * @param {string} shape - 形状类型
     */
    update(startX, startY, currentX, currentY, shape) {
        if (!this.enabled) return;
        
        const dx = currentX - startX;
        const dy = currentY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        
        let info = [];
        info.push(`距离: ${distance.toFixed(1)}px`);
        info.push(`角度: ${angle.toFixed(1)}°`);
        
        if (shape === 'rect' || shape === 'ellipse') {
            const width = Math.abs(dx);
            const height = Math.abs(dy);
            const ratio = height > 0 ? (width / height).toFixed(2) : '∞';
            info.push(`比例: ${ratio}:1`);
        }
        
        this.precisionText.setText(info.join(' | '));
        this.precisionText.setPosition(currentX + 15, currentY - 25);
        this.precisionText.setVisible(true);
    }
    
    /**
     * 启用精度显示
     */
    enable() {
        this.enabled = true;
    }
    
    /**
     * 禁用精度显示
     */
    disable() {
        this.enabled = false;
        this.precisionText.setVisible(false);
    }
    
    /**
     * 切换精度显示
     */
    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.precisionText.setVisible(false);
        }
        console.log(`${this.enabled ? '✅' : '❌'} 精度显示: ${this.enabled ? '开启' : '关闭'}`);
    }
    
    /**
     * 隐藏精度信息
     */
    hide() {
        this.precisionText.setVisible(false);
    }
    
    /**
     * 清理资源
     */
    destroy() {
        if (this.precisionText) {
            this.precisionText.destroy();
            this.precisionText = null;
        }
    }
}
