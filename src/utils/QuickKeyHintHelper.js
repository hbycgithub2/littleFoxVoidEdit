// src/utils/QuickKeyHintHelper.js
// 快捷键提示辅助工具 - 完全遵循 Phaser 3 官方标准

export default class QuickKeyHintHelper {
    constructor(scene) {
        this.scene = scene;
        this.visible = false;
        
        // 创建提示面板（遵循 Phaser 标准）
        const x = 10;
        const y = scene.game.config.height - 150;
        
        this.hintText = scene.add.text(x, y, this.getHintText(), {
            fontSize: '12px',
            color: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: { x: 10, y: 8 },
            lineSpacing: 4
        });
        this.hintText.setDepth(1004);
        this.hintText.setScrollFactor(0);
        this.hintText.setVisible(false);
        
        this.setupKeyboard();
    }
    
    /**
     * 设置键盘监听
     */
    setupKeyboard() {
        // H键切换显示/隐藏
        this.scene.input.keyboard.on('keydown-H', (event) => {
            if (event.ctrlKey || event.metaKey) {
                this.toggle();
            }
        });
    }
    
    /**
     * 获取提示文本
     */
    getHintText() {
        return `⌨️ 快捷键提示 (Ctrl+H 切换)
━━━━━━━━━━━━━━━━━━━━━━
时长预设: 1-9 设置时长 | 0 重置
时间控制: T 开始 | Shift+T 结束 | Ctrl+T 片段
时间微调: ←→ 开始 | Shift+←→ 结束
确认操作: Enter 确认 | Escape 取消`;
    }
    
    /**
     * 切换显示/隐藏
     */
    toggle() {
        this.visible = !this.visible;
        this.hintText.setVisible(this.visible);
        
        if (this.visible) {
            console.log('💡 快捷键提示已显示');
        } else {
            console.log('💡 快捷键提示已隐藏');
        }
    }
    
    /**
     * 显示
     */
    show() {
        this.visible = true;
        this.hintText.setVisible(true);
    }
    
    /**
     * 隐藏
     */
    hide() {
        this.visible = false;
        this.hintText.setVisible(false);
    }
    
    /**
     * 清理资源
     */
    destroy() {
        this.scene.input.keyboard.off('keydown-H');
        
        if (this.hintText) {
            this.hintText.destroy();
            this.hintText = null;
        }
    }
}
