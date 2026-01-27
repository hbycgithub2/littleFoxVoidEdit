// src/utils/DragResizeShortcutHelper.js
// 拖拽缩放快捷键提示工具 - 完全遵循 Phaser 3 官方标准

export default class DragResizeShortcutHelper {
    constructor(scene) {
        this.scene = scene;
        
        // 提示面板（遵循 Phaser 官方标准）
        this.panel = null;
        this.isVisible = false;
        
        this.setupKeyboard();
    }
    
    /**
     * 设置键盘监听（遵循 Phaser 官方标准）
     */
    setupKeyboard() {
        // F2 键显示/隐藏快捷键提示
        this.scene.input.keyboard.on('keydown-F2', () => {
            this.toggle();
        });
    }
    
    /**
     * 切换显示/隐藏（遵循 Phaser 官方标准）
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    /**
     * 显示快捷键提示（遵循 Phaser 官方标准）
     */
    show() {
        if (this.panel) {
            this.panel.setVisible(true);
            this.isVisible = true;
            return;
        }
        
        // 创建面板容器（遵循 Phaser 官方标准）
        this.panel = this.scene.add.container(20, 20);
        this.panel.setDepth(10001);
        this.panel.setScrollFactor(0); // 固定在屏幕上
        
        // 背景（遵循 Phaser 官方标准）
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x000000, 0.9);
        bg.fillRoundedRect(0, 0, 350, 650, 8);
        bg.lineStyle(2, 0x4CAF50);
        bg.strokeRoundedRect(0, 0, 350, 650, 8);
        this.panel.add(bg);
        
        // 标题（遵循 Phaser 官方标准）
        const title = this.scene.add.text(175, 20, '🎮 拖拽和缩放快捷键', {
            fontSize: '18px',
            color: '#4CAF50',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5, 0);
        this.panel.add(title);
        
        // 快捷键列表
        const shortcuts = [
            { key: '拖拽操作', value: '', isHeader: true },
            { key: '鼠标拖拽', value: '移动单个热区' },
            { key: 'Ctrl + 点击', value: '多选热区' },
            { key: '拖拽多选热区', value: '同时移动多个热区' },
            { key: 'Ctrl + 拖拽', value: '复制并拖拽热区' },
            { key: '', value: '', isHeader: true },
            { key: '缩放操作', value: '', isHeader: true },
            { key: '点击热区', value: '显示缩放手柄' },
            { key: '拖拽手柄', value: '缩放热区' },
            { key: 'Shift + 拖拽角手柄', value: '保持宽高比缩放' },
            { key: 'Alt + 拖拽手柄', value: '从中心缩放' },
            { key: '', value: '', isHeader: true },
            { key: '选择操作', value: '', isHeader: true },
            { key: 'Ctrl + A', value: '全选热区' },
            { key: 'Ctrl + D', value: '取消选择' },
            { key: 'Shift + 拖拽', value: '框选热区' },
            { key: '', value: '', isHeader: true },
            { key: '复制粘贴', value: '', isHeader: true },
            { key: 'Ctrl + C', value: '复制热区' },
            { key: 'Ctrl + X', value: '剪切热区' },
            { key: 'Ctrl + V', value: '粘贴热区' },
            { key: 'Ctrl + Shift + C', value: '复制样式' },
            { key: 'Ctrl + Shift + V', value: '粘贴样式' },
            { key: '', value: '', isHeader: true },
            { key: '其他快捷键', value: '', isHeader: true },
            { key: 'Ctrl + Z', value: '撤销' },
            { key: 'Ctrl + Shift + Z', value: '重做' },
            { key: 'Ctrl + Y', value: '重做' },
            { key: 'H', value: '显示/隐藏历史记录' },
            { key: 'L', value: '显示/隐藏图层面板' },
            { key: 'S', value: '显示/隐藏样式面板' },
            { key: 'F1', value: '显示绘制帮助' },
            { key: 'F2', value: '显示/隐藏此面板' },
            { key: 'F3', value: '显示/隐藏状态指示器' },
            { key: 'G', value: '切换吸附对齐' },
            { key: 'ESC', value: '取消当前操作' }
        ];
        
        let y = 60;
        shortcuts.forEach(item => {
            if (item.isHeader) {
                // 分隔线
                if (item.key) {
                    const headerText = this.scene.add.text(20, y, item.key, {
                        fontSize: '14px',
                        color: '#64B5F6',
                        fontStyle: 'bold'
                    });
                    this.panel.add(headerText);
                    y += 25;
                } else {
                    y += 10;
                }
            } else {
                // 快捷键项
                const keyText = this.scene.add.text(20, y, item.key, {
                    fontSize: '12px',
                    color: '#ffff00'
                });
                this.panel.add(keyText);
                
                const valueText = this.scene.add.text(180, y, item.value, {
                    fontSize: '12px',
                    color: '#ffffff'
                });
                this.panel.add(valueText);
                
                y += 22;
            }
        });
        
        // 关闭按钮（遵循 Phaser 官方标准）
        const closeBtn = this.scene.add.text(330, 10, '✕', {
            fontSize: '20px',
            color: '#ff0000'
        });
        closeBtn.setOrigin(0.5, 0);
        closeBtn.setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => {
            this.hide();
        });
        closeBtn.on('pointerover', () => {
            closeBtn.setColor('#ff5555');
        });
        closeBtn.on('pointerout', () => {
            closeBtn.setColor('#ff0000');
        });
        this.panel.add(closeBtn);
        
        this.isVisible = true;
        console.log('📋 快捷键提示已显示');
    }
    
    /**
     * 隐藏快捷键提示（遵循 Phaser 官方标准）
     */
    hide() {
        if (this.panel) {
            this.panel.setVisible(false);
            this.isVisible = false;
            console.log('📋 快捷键提示已隐藏');
        }
    }
    
    /**
     * 销毁（遵循 Phaser 官方标准）
     */
    destroy() {
        if (this.panel) {
            this.panel.destroy();
            this.panel = null;
        }
        
        this.scene.input.keyboard.off('keydown-F2');
    }
}
