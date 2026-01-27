// src/utils/LayerPanelHelper.js
// 图层面板工具 - 完全遵循 Phaser 3 官方标准
// 功能：创建、删除、显示/隐藏、锁定、排序、重命名图层

export default class LayerPanelHelper {
    constructor(scene) {
        this.scene = scene;
        
        // UI 元素（遵循 Phaser 官方标准）
        this.panel = null;
        this.layerItems = [];
        this.isVisible = false;
        
        this.setupEvents();
        this.setupKeyboard();
    }
    
    /**
     * 设置事件监听（遵循 Phaser 官方标准）
     */
    setupEvents() {
        // 监听图层变化
        this.scene.events.on('layer:created', () => {
            if (this.isVisible) {
                this.updateLayerList();
            }
        });
        
        this.scene.events.on('layer:deleted', () => {
            if (this.isVisible) {
                this.updateLayerList();
            }
        });
        
        this.scene.events.on('layer:renamed', () => {
            if (this.isVisible) {
                this.updateLayerList();
            }
        });
        
        this.scene.events.on('layer:moved', () => {
            if (this.isVisible) {
                this.updateLayerList();
            }
        });
    }
    
    /**
     * 设置键盘监听（遵循 Phaser 官方标准）
     */
    setupKeyboard() {
        // L 键切换图层面板
        this.scene.input.keyboard.on('keydown-L', () => {
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
     * 显示图层面板（遵循 Phaser 官方标准）
     */
    show() {
        if (this.panel) {
            this.panel.setVisible(true);
            this.isVisible = true;
            this.updateLayerList();
            return;
        }
        
        // 创建面板容器（遵循 Phaser 官方标准）
        this.panel = this.scene.add.container(
            this.scene.cameras.main.width - 260,
            440
        );
        this.panel.setDepth(10001);
        this.panel.setScrollFactor(0);
        
        // 背景（遵循 Phaser 官方标准）
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x000000, 0.9);
        bg.fillRoundedRect(0, 0, 250, 350, 8);
        bg.lineStyle(2, 0x4CAF50);
        bg.strokeRoundedRect(0, 0, 250, 350, 8);
        this.panel.add(bg);
        
        // 标题（遵循 Phaser 官方标准）
        const title = this.scene.add.text(125, 15, '📚 图层管理', {
            fontSize: '16px',
            color: '#4CAF50',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5, 0);
        this.panel.add(title);
        
        // 新建图层按钮
        const newBtn = this.createButton(125, 45, '+ 新建图层', () => {
            this.createNewLayer();
        });
        this.panel.add(newBtn);
        
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
        this.updateLayerList();
    }
    
    /**
     * 创建按钮（遵循 Phaser 官方标准）
     */
    createButton(x, y, text, callback, width = 200, height = 30) {
        const container = this.scene.add.container(x, y);
        
        // 按钮背景
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x4CAF50, 1);
        bg.fillRoundedRect(-width/2, -height/2, width, height, 4);
        container.add(bg);
        
        // 按钮文本
        const btnText = this.scene.add.text(0, 0, text, {
            fontSize: '12px',
            color: '#ffffff'
        });
        btnText.setOrigin(0.5, 0.5);
        container.add(btnText);
        
        // 交互（遵循 Phaser 官方标准）
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
     * 更新图层列表（遵循 Phaser 官方标准）
     */
    updateLayerList() {
        // 清除旧列表
        this.layerItems.forEach(item => item.destroy());
        this.layerItems = [];
        
        // 获取所有图层
        const layers = this.scene.layerManager.getLayers();
        let y = 80;
        
        layers.forEach((layer, index) => {
            const item = this.createLayerItem(layer, y, index);
            this.panel.add(item);
            this.layerItems.push(item);
            y += 50;
        });
    }
    
    /**
     * 创建图层项（遵循 Phaser 官方标准）
     */
    createLayerItem(layer, y, index) {
        const container = this.scene.add.container(10, y);
        
        // 背景
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x2a2a2a, 1);
        bg.fillRoundedRect(0, 0, 230, 45, 4);
        container.add(bg);
        
        // 图层名称
        const nameText = this.scene.add.text(10, 10, layer.name, {
            fontSize: '12px',
            color: '#ffffff'
        });
        container.add(nameText);
        
        // 热区数量
        const countText = this.scene.add.text(10, 25, `${layer.hotspots.length} 个热区`, {
            fontSize: '10px',
            color: '#888888'
        });
        container.add(countText);
        
        // 可见性按钮
        const visibleBtn = this.scene.add.text(150, 10, layer.visible ? '👁️' : '🚫', {
            fontSize: '16px'
        });
        visibleBtn.setInteractive({ useHandCursor: true });
        visibleBtn.on('pointerdown', () => {
            this.scene.layerManager.setLayerVisible(layer.id, !layer.visible);
            this.updateLayerList();
        });
        container.add(visibleBtn);
        
        // 锁定按钮
        const lockBtn = this.scene.add.text(180, 10, layer.locked ? '🔒' : '🔓', {
            fontSize: '16px'
        });
        lockBtn.setInteractive({ useHandCursor: true });
        lockBtn.on('pointerdown', () => {
            this.scene.layerManager.setLayerLocked(layer.id, !layer.locked);
            this.updateLayerList();
        });
        container.add(lockBtn);
        
        // 删除按钮
        const deleteBtn = this.scene.add.text(210, 10, '🗑️', {
            fontSize: '16px'
        });
        deleteBtn.setInteractive({ useHandCursor: true });
        deleteBtn.on('pointerdown', () => {
            this.deleteLayer(layer.id);
        });
        container.add(deleteBtn);
        
        // 上移按钮
        if (index > 0) {
            const upBtn = this.scene.add.text(150, 25, '↑', {
                fontSize: '12px',
                color: '#4CAF50'
            });
            upBtn.setInteractive({ useHandCursor: true });
            upBtn.on('pointerdown', () => {
                this.scene.layerManager.moveLayer(layer.id, index - 1);
                this.updateLayerList();
            });
            container.add(upBtn);
        }
        
        // 下移按钮
        const layers = this.scene.layerManager.getLayers();
        if (index < layers.length - 1) {
            const downBtn = this.scene.add.text(170, 25, '↓', {
                fontSize: '12px',
                color: '#4CAF50'
            });
            downBtn.setInteractive({ useHandCursor: true });
            downBtn.on('pointerdown', () => {
                this.scene.layerManager.moveLayer(layer.id, index + 1);
                this.updateLayerList();
            });
            container.add(downBtn);
        }
        
        return container;
    }
    
    /**
     * 创建新图层（遵循 Phaser 官方标准）
     */
    createNewLayer() {
        const layerCount = this.scene.layerManager.getLayers().length;
        const newLayer = this.scene.layerManager.createLayer(`图层 ${layerCount + 1}`);
        
        console.log('📚 已创建新图层:', newLayer.name);
        this.updateLayerList();
    }
    
    /**
     * 删除图层（遵循 Phaser 官方标准）
     */
    deleteLayer(layerId) {
        const success = this.scene.layerManager.deleteLayer(layerId);
        
        if (success) {
            console.log('🗑️ 已删除图层');
            this.updateLayerList();
        } else {
            console.warn('⚠️ 无法删除图层');
        }
    }
    
    /**
     * 隐藏图层面板（遵循 Phaser 官方标准）
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
        
        this.layerItems = [];
        
        this.scene.events.off('layer:created');
        this.scene.events.off('layer:deleted');
        this.scene.events.off('layer:renamed');
        this.scene.events.off('layer:moved');
        
        this.scene.input.keyboard.off('keydown-L');
    }
}
