// src/utils/AlignDistributePanel.js
// 对齐分布面板 - 完全遵循 Phaser 3 官方标准

export default class AlignDistributePanel {
    constructor(scene, alignHelper) {
        this.scene = scene;
        this.alignHelper = alignHelper;
        this.panel = null;
        this.isVisible = false;
    }
    
    /**
     * 切换显示（遵循 Phaser 标准）
     */
    toggle() {
        if (this.isVisible) this.hide();
        else this.show();
    }
    
    /**
     * 显示面板（遵循 Phaser 标准）
     */
    show() {
        if (this.panel) {
            this.panel.setVisible(true);
            this.isVisible = true;
            return;
        }
        
        this.panel = this.scene.add.container(20, 200);
        this.panel.setDepth(10001);
        this.panel.setScrollFactor(0);
        
        // 背景
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x000000, 0.9);
        bg.fillRoundedRect(0, 0, 200, 320, 8);
        bg.lineStyle(2, 0x2196F3);
        bg.strokeRoundedRect(0, 0, 200, 320, 8);
        this.panel.add(bg);
        
        // 标题
        const title = this.scene.add.text(100, 15, '🎯 对齐分布', {
            fontSize: '16px', color: '#2196F3', fontStyle: 'bold'
        });
        title.setOrigin(0.5, 0);
        this.panel.add(title);
        
        // 关闭按钮
        const closeBtn = this.scene.add.text(180, 10, '✕', {
            fontSize: '20px', color: '#ff0000'
        });
        closeBtn.setOrigin(0.5, 0);
        closeBtn.setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => this.hide());
        this.panel.add(closeBtn);
        
        let y = 50;
        
        // 对齐部分
        this.addLabel(10, y, '对齐:');
        y += 25;
        
        const alignBtns = [
            { text: '←左', action: () => this.alignHelper.alignLeft() },
            { text: '→右', action: () => this.alignHelper.alignRight() },
            { text: '↔中', action: () => this.alignHelper.alignCenterHorizontal() }
        ];
        alignBtns.forEach((btn, i) => {
            this.addButton(10 + i * 60, y, btn.text, btn.action, 55);
        });
        y += 35;
        
        const alignBtns2 = [
            { text: '↑顶', action: () => this.alignHelper.alignTop() },
            { text: '↓底', action: () => this.alignHelper.alignBottom() },
            { text: '↕中', action: () => this.alignHelper.alignCenterVertical() }
        ];
        alignBtns2.forEach((btn, i) => {
            this.addButton(10 + i * 60, y, btn.text, btn.action, 55);
        });
        y += 45;
        
        // 分布部分
        this.addLabel(10, y, '分布:');
        y += 25;
        
        this.addButton(10, y, '水平分布', () => this.alignHelper.distributeHorizontal(), 180);
        y += 35;
        this.addButton(10, y, '垂直分布', () => this.alignHelper.distributeVertical(), 180);
        y += 45;
        
        // 特殊对齐
        this.addLabel(10, y, '特殊:');
        y += 25;
        this.addButton(10, y, '画布居中', () => this.alignHelper.alignToCanvasCenter(), 180);
        
        this.isVisible = true;
    }
    
    addLabel(x, y, text) {
        const label = this.scene.add.text(x, y, text, {
            fontSize: '12px', color: '#888888'
        });
        this.panel.add(label);
    }
    
    addButton(x, y, text, callback, width = 100) {
        const container = this.scene.add.container(x + width/2, y + 12);
        
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x2196F3, 1);
        bg.fillRoundedRect(-width/2, -12, width, 24, 4);
        container.add(bg);
        
        const btnText = this.scene.add.text(0, 0, text, {
            fontSize: '11px', color: '#ffffff'
        });
        btnText.setOrigin(0.5);
        container.add(btnText);
        
        bg.setInteractive(
            new Phaser.Geom.Rectangle(-width/2, -12, width, 24),
            Phaser.Geom.Rectangle.Contains
        );
        bg.on('pointerdown', callback);
        bg.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(0x1976D2, 1);
            bg.fillRoundedRect(-width/2, -12, width, 24, 4);
        });
        bg.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(0x2196F3, 1);
            bg.fillRoundedRect(-width/2, -12, width, 24, 4);
        });
        
        this.panel.add(container);
    }
    
    hide() {
        if (this.panel) {
            this.panel.setVisible(false);
            this.isVisible = false;
        }
    }
    
    destroy() {
        if (this.panel) {
            this.panel.destroy();
            this.panel = null;
        }
    }
}
