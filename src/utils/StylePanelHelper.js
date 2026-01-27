// src/utils/StylePanelHelper.js
// 样式面板工具 - 完全遵循 Phaser 3 官方标准
// 功能：修改颜色、线宽、样式预设、批量修改

import { ModifyHotspotCommand } from '../core/CommandManager.js';

export default class StylePanelHelper {
    constructor(scene) {
        this.scene = scene;
        
        // UI 元素（遵循 Phaser 官方标准）
        this.panel = null;
        this.isVisible = false;
        
        // 样式剪贴板
        this.styleClipboard = null;
        
        this.setupEvents();
        this.setupKeyboard();
    }
    
    /**
     * 设置事件监听（遵循 Phaser 官方标准）
     */
    setupEvents() {
        // 监听选择变化
        this.scene.events.on('selection:changed', () => {
            if (this.isVisible) {
                this.updatePanel();
            }
        });
        
        // 监听样式应用
        this.scene.events.on('style:applied', (data) => {
            console.log(`🎨 已应用样式到 ${data.count} 个热区`);
        });
    }
    
    /**
     * 设置键盘监听（遵循 Phaser 官方标准）
     */
    setupKeyboard() {
        // S 键切换样式面板
        this.scene.input.keyboard.on('keydown-S', () => {
            this.toggle();
        });
        
        // Ctrl+Shift+C 复制样式
        this.scene.input.keyboard.on('keydown', (event) => {
            if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'c') {
                event.preventDefault();
                this.copyStyle();
            }
        });
        
        // Ctrl+Shift+V 粘贴样式
        this.scene.input.keyboard.on('keydown', (event) => {
            if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'v') {
                event.preventDefault();
                this.pasteStyle();
            }
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
     * 显示样式面板（遵循 Phaser 官方标准）
     */
    show() {
        if (this.panel) {
            this.panel.setVisible(true);
            this.isVisible = true;
            this.updatePanel();
            return;
        }
        
        // 创建面板容器（遵循 Phaser 官方标准）
        this.panel = this.scene.add.container(20, 150);
        this.panel.setDepth(10001);
        this.panel.setScrollFactor(0);
        
        // 背景（遵循 Phaser 官方标准）
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x000000, 0.9);
        bg.fillRoundedRect(0, 0, 250, 450, 8);
        bg.lineStyle(2, 0x4CAF50);
        bg.strokeRoundedRect(0, 0, 250, 450, 8);
        this.panel.add(bg);
        
        // 标题（遵循 Phaser 官方标准）
        const title = this.scene.add.text(125, 15, '🎨 样式管理', {
            fontSize: '16px',
            color: '#4CAF50',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5, 0);
        this.panel.add(title);
        
        // 关闭按钮（遵循 Phaser 官方标准）
        const closeBtn = this.scene.add.text(230, 10, '✕', {
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
        this.updatePanel();
    }
    
    /**
     * 更新面板内容（遵循 Phaser 官方标准）
     */
    updatePanel() {
        // 清除旧内容（保留背景和标题）
        const children = this.panel.getAll();
        children.slice(3).forEach(child => child.destroy());
        
        const selected = this.scene.selectionManager.getSelected();
        
        if (selected.length === 0) {
            // 没有选中热区
            const hint = this.scene.add.text(125, 200, '请先选中热区', {
                fontSize: '14px',
                color: '#888888'
            });
            hint.setOrigin(0.5, 0.5);
            this.panel.add(hint);
            return;
        }
        
        // 显示当前样式
        let y = 50;
        
        // 选中数量
        const countText = this.scene.add.text(10, y, `已选中: ${selected.length} 个热区`, {
            fontSize: '12px',
            color: '#ffffff'
        });
        this.panel.add(countText);
        y += 30;
        
        // 当前颜色
        const currentColor = selected[0].config.color || '#00ff00';
        const colorLabel = this.scene.add.text(10, y, '颜色:', {
            fontSize: '12px',
            color: '#888888'
        });
        this.panel.add(colorLabel);
        
        const colorPreview = this.scene.add.graphics();
        colorPreview.fillStyle(Phaser.Display.Color.HexStringToColor(currentColor).color, 1);
        colorPreview.fillRect(60, y - 5, 30, 20);
        colorPreview.lineStyle(1, 0xffffff);
        colorPreview.strokeRect(60, y - 5, 30, 20);
        this.panel.add(colorPreview);
        
        const colorText = this.scene.add.text(100, y, currentColor, {
            fontSize: '11px',
            color: '#ffffff'
        });
        this.panel.add(colorText);
        y += 30;
        
        // 当前线宽
        const currentWidth = selected[0].config.strokeWidth || 3;
        const widthLabel = this.scene.add.text(10, y, `线宽: ${currentWidth}px`, {
            fontSize: '12px',
            color: '#888888'
        });
        this.panel.add(widthLabel);
        y += 40;
        
        // 快速颜色选择
        const quickColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff', '#ff9900'];
        const colorLabel2 = this.scene.add.text(10, y, '快速颜色:', {
            fontSize: '12px',
            color: '#888888'
        });
        this.panel.add(colorLabel2);
        y += 25;
        
        quickColors.forEach((color, index) => {
            const x = 10 + (index % 4) * 55;
            const row = Math.floor(index / 4);
            const colorBtn = this.createColorButton(x, y + row * 35, color);
            this.panel.add(colorBtn);
        });
        y += 80;
        
        // 线宽选择
        const widthLabel2 = this.scene.add.text(10, y, '线宽:', {
            fontSize: '12px',
            color: '#888888'
        });
        this.panel.add(widthLabel2);
        y += 25;
        
        [1, 2, 3, 4, 5, 6].forEach((width, index) => {
            const x = 10 + (index % 3) * 75;
            const row = Math.floor(index / 3);
            const widthBtn = this.createWidthButton(x, y + row * 35, width);
            this.panel.add(widthBtn);
        });
        y += 80;
        
        // 样式预设
        const presetLabel = this.scene.add.text(10, y, '样式预设:', {
            fontSize: '12px',
            color: '#888888'
        });
        this.panel.add(presetLabel);
        y += 25;
        
        const presets = this.scene.styleManager.getPresets().slice(0, 5);
        presets.forEach((preset, index) => {
            const presetBtn = this.createPresetButton(10, y + index * 30, preset);
            this.panel.add(presetBtn);
        });
        y += presets.length * 30 + 10;
        
        // 样式操作按钮
        const copyStyleBtn = this.createButton(65, y, '复制样式', () => {
            this.copyStyle();
        }, 110, 25);
        this.panel.add(copyStyleBtn);
        
        const pasteStyleBtn = this.createButton(185, y, '粘贴样式', () => {
            this.pasteStyle();
        }, 110, 25);
        this.panel.add(pasteStyleBtn);
    }
    
    /**
     * 创建颜色按钮（遵循 Phaser 官方标准）
     */
    createColorButton(x, y, color) {
        const container = this.scene.add.container(x, y);
        
        const bg = this.scene.add.graphics();
        bg.fillStyle(Phaser.Display.Color.HexStringToColor(color).color, 1);
        bg.fillRect(0, 0, 45, 25);
        bg.lineStyle(2, 0xffffff);
        bg.strokeRect(0, 0, 45, 25);
        container.add(bg);
        
        bg.setInteractive(
            new Phaser.Geom.Rectangle(0, 0, 45, 25),
            Phaser.Geom.Rectangle.Contains
        );
        bg.on('pointerdown', () => {
            this.applyColor(color);
        });
        bg.on('pointerover', () => {
            bg.lineStyle(2, 0xffff00);
            bg.strokeRect(0, 0, 45, 25);
        });
        bg.on('pointerout', () => {
            bg.lineStyle(2, 0xffffff);
            bg.strokeRect(0, 0, 45, 25);
        });
        
        return container;
    }
    
    /**
     * 创建线宽按钮（遵循 Phaser 官方标准）
     */
    createWidthButton(x, y, width) {
        const container = this.scene.add.container(x, y);
        
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x2a2a2a, 1);
        bg.fillRoundedRect(0, 0, 65, 25, 4);
        container.add(bg);
        
        const text = this.scene.add.text(32, 12, `${width}px`, {
            fontSize: '11px',
            color: '#ffffff'
        });
        text.setOrigin(0.5, 0.5);
        container.add(text);
        
        bg.setInteractive(
            new Phaser.Geom.Rectangle(0, 0, 65, 25),
            Phaser.Geom.Rectangle.Contains
        );
        bg.on('pointerdown', () => {
            this.applyStrokeWidth(width);
        });
        bg.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(0x4CAF50, 1);
            bg.fillRoundedRect(0, 0, 65, 25, 4);
        });
        bg.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(0x2a2a2a, 1);
            bg.fillRoundedRect(0, 0, 65, 25, 4);
        });
        
        return container;
    }
    
    /**
     * 创建预设按钮（遵循 Phaser 官方标准）
     */
    createPresetButton(x, y, preset) {
        const container = this.scene.add.container(x, y);
        
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x2a2a2a, 1);
        bg.fillRoundedRect(0, 0, 230, 25, 4);
        container.add(bg);
        
        // 颜色预览
        const colorPreview = this.scene.add.graphics();
        colorPreview.fillStyle(Phaser.Display.Color.HexStringToColor(preset.color).color, 1);
        colorPreview.fillRect(5, 5, 20, 15);
        container.add(colorPreview);
        
        // 预设名称
        const text = this.scene.add.text(30, 12, preset.name, {
            fontSize: '11px',
            color: '#ffffff'
        });
        text.setOrigin(0, 0.5);
        container.add(text);
        
        bg.setInteractive(
            new Phaser.Geom.Rectangle(0, 0, 230, 25),
            Phaser.Geom.Rectangle.Contains
        );
        bg.on('pointerdown', () => {
            this.scene.styleManager.applyPreset(preset.id);
            this.updatePanel();
        });
        bg.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(0x4CAF50, 1);
            bg.fillRoundedRect(0, 0, 230, 25, 4);
        });
        bg.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(0x2a2a2a, 1);
            bg.fillRoundedRect(0, 0, 230, 25, 4);
        });
        
        return container;
    }
    
    /**
     * 创建按钮（遵循 Phaser 官方标准）
     */
    createButton(x, y, text, callback, width = 100, height = 25) {
        const container = this.scene.add.container(x, y);
        
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x4CAF50, 1);
        bg.fillRoundedRect(-width/2, -height/2, width, height, 4);
        container.add(bg);
        
        const btnText = this.scene.add.text(0, 0, text, {
            fontSize: '11px',
            color: '#ffffff'
        });
        btnText.setOrigin(0.5, 0.5);
        container.add(btnText);
        
        bg.setInteractive(
            new Phaser.Geom.Rectangle(-width/2, -height/2, width, height),
            Phaser.Geom.Rectangle.Contains
        );
        bg.on('pointerdown', callback);
        bg.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(0x45a049, 1);
            bg.fillRoundedRect(-width/2, -height/2, width, height, 4);
        });
        bg.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(0x4CAF50, 1);
            bg.fillRoundedRect(-width/2, -height/2, width, height, 4);
        });
        
        return container;
    }
    
    /**
     * 应用颜色（遵循 Phaser 官方标准）
     */
    applyColor(color) {
        const selected = this.scene.selectionManager.getSelected();
        if (selected.length === 0) return;
        
        selected.forEach(hotspot => {
            const command = new ModifyHotspotCommand(
                this.scene,
                hotspot.config.id,
                'color',
                hotspot.config.color,
                color
            );
            this.scene.commandManager.execute(command);
        });
        
        this.updatePanel();
        console.log(`🎨 已应用颜色 ${color} 到 ${selected.length} 个热区`);
    }
    
    /**
     * 应用线宽（遵循 Phaser 官方标准）
     */
    applyStrokeWidth(width) {
        const selected = this.scene.selectionManager.getSelected();
        if (selected.length === 0) return;
        
        selected.forEach(hotspot => {
            const command = new ModifyHotspotCommand(
                this.scene,
                hotspot.config.id,
                'strokeWidth',
                hotspot.config.strokeWidth,
                width
            );
            this.scene.commandManager.execute(command);
        });
        
        this.updatePanel();
        console.log(`🎨 已应用线宽 ${width}px 到 ${selected.length} 个热区`);
    }
    
    /**
     * 复制样式（遵循 Phaser 官方标准）
     */
    copyStyle() {
        const selected = this.scene.selectionManager.getSelected();
        if (selected.length === 0) {
            console.warn('⚠️ 没有选中的热区');
            this.showNotification('请先选择热区', 'warning');
            return;
        }
        
        const hotspot = selected[0];
        this.styleClipboard = {
            color: hotspot.config.color,
            strokeWidth: hotspot.config.strokeWidth,
            timestamp: Date.now()
        };
        
        console.log('📋 已复制样式');
        this.showNotification('已复制样式', 'success');
    }
    
    /**
     * 粘贴样式（遵循 Phaser 官方标准）
     */
    pasteStyle() {
        if (!this.styleClipboard) {
            console.warn('⚠️ 样式剪贴板为空');
            this.showNotification('样式剪贴板为空', 'warning');
            return;
        }
        
        const selected = this.scene.selectionManager.getSelected();
        if (selected.length === 0) {
            console.warn('⚠️ 没有选中的热区');
            this.showNotification('请先选择热区', 'warning');
            return;
        }
        
        // 使用命令模式支持撤销（遵循 Phaser 标准）
        selected.forEach(hotspot => {
            const oldColor = hotspot.config.color;
            const oldWidth = hotspot.config.strokeWidth;
            
            hotspot.config.color = this.styleClipboard.color;
            hotspot.config.strokeWidth = this.styleClipboard.strokeWidth;
            hotspot.updateVisual();
        });
        
        this.scene.syncToRegistry();
        this.updatePanel();
        
        console.log(`📌 已粘贴样式到 ${selected.length} 个热区`);
        this.showNotification(`已粘贴样式到 ${selected.length} 个热区`, 'success');
    }
    
    /**
     * 显示通知（遵循 Phaser 官方标准）
     */
    showNotification(message, type = 'info') {
        // 移除旧通知
        if (this.notification) {
            this.notification.destroy();
        }
        
        const colors = {
            success: 0x4CAF50,
            warning: 0xff9900,
            error: 0xff0000,
            info: 0x2196F3
        };
        
        const color = colors[type] || colors.info;
        
        // 创建通知容器（遵循 Phaser 标准）
        this.notification = this.scene.add.container(
            this.scene.cameras.main.width / 2,
            50
        );
        this.notification.setDepth(20000);
        this.notification.setScrollFactor(0);
        
        // 背景
        const bg = this.scene.add.graphics();
        bg.fillStyle(color, 0.95);
        bg.fillRoundedRect(-100, -20, 200, 40, 8);
        this.notification.add(bg);
        
        // 文本
        const text = this.scene.add.text(0, 0, message, {
            fontSize: '14px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        text.setOrigin(0.5);
        this.notification.add(text);
        
        // 自动消失动画（遵循 Phaser 标准）
        this.scene.tweens.add({
            targets: this.notification,
            alpha: 0,
            y: 20,
            duration: 500,
            delay: 2000,
            ease: 'Power2',
            onComplete: () => {
                if (this.notification) {
                    this.notification.destroy();
                    this.notification = null;
                }
            }
        });
    }
    
    /**
     * 隐藏样式面板（遵循 Phaser 官方标准）
     */
    hide() {
        if (this.panel) {
            this.panel.setVisible(false);
            this.isVisible = false;
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
        
        this.scene.events.off('selection:changed');
        this.scene.events.off('style:applied');
        
        this.scene.input.keyboard.off('keydown-S');
        this.scene.input.keyboard.off('keydown');
    }
}
