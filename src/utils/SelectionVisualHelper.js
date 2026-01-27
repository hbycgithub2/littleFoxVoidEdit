// src/utils/SelectionVisualHelper.js
// 选择视觉增强辅助工具 - 遵循 Phaser 3 官方标准

export default class SelectionVisualHelper {
    constructor(scene) {
        this.scene = scene;
        
        // 创建选择指示器图形（遵循 Phaser 官方标准）
        this.indicatorGraphics = scene.add.graphics();
        this.indicatorGraphics.setDepth(2001);
        
        // 创建选择计数文本（遵循 Phaser 官方标准）
        this.countText = scene.add.text(10, scene.game.config.height - 40, '', {
            fontSize: '14px',
            color: '#ff0000',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 },
            fontStyle: 'bold'
        });
        this.countText.setDepth(2000);
        this.countText.setVisible(false);
        
        this.setupEvents();
    }
    
    /**
     * 设置事件监听
     */
    setupEvents() {
        // 监听选择变化（遵循 Phaser 官方标准）
        this.scene.events.on('selection:changed', (data) => {
            this.updateVisual(data);
        });
    }
    
    /**
     * 更新视觉效果
     * @param {object} data - 选择数据
     */
    updateVisual(data) {
        this.indicatorGraphics.clear();
        
        // ✅ 检查是否启用选择指示器（默认隐藏，符合 Phaser 官方标准）
        const showIndicator = this.scene.registry.get('showSelectionIndicator') ?? false;
        if (!showIndicator) {
            this.countText.setVisible(false);
            return;
        }
        
        if (data.count === 0) {
            this.countText.setVisible(false);
            return;
        }
        
        // 显示选择计数
        this.countText.setText(`已选择: ${data.count} 个热区`);
        this.countText.setVisible(true);
        
        // 绘制选择指示器（遵循 Phaser 官方标准）
        data.selected.forEach(hotspot => {
            this.drawSelectionIndicator(hotspot);
        });
    }
    
    /**
     * 绘制选择指示器
     * @param {Hotspot} hotspot - 热区对象
     * @private
     */
    drawSelectionIndicator(hotspot) {
        const bounds = hotspot.getBounds();
        
        // 绘制角标记（遵循 Phaser 官方标准）
        const cornerSize = 10;
        const offset = 5;
        
        this.indicatorGraphics.lineStyle(3, 0xff0000, 1);
        
        // 左上角
        this.indicatorGraphics.lineBetween(
            bounds.left - offset, 
            bounds.top - offset,
            bounds.left - offset + cornerSize,
            bounds.top - offset
        );
        this.indicatorGraphics.lineBetween(
            bounds.left - offset,
            bounds.top - offset,
            bounds.left - offset,
            bounds.top - offset + cornerSize
        );
        
        // 右上角
        this.indicatorGraphics.lineBetween(
            bounds.right + offset,
            bounds.top - offset,
            bounds.right + offset - cornerSize,
            bounds.top - offset
        );
        this.indicatorGraphics.lineBetween(
            bounds.right + offset,
            bounds.top - offset,
            bounds.right + offset,
            bounds.top - offset + cornerSize
        );
        
        // 左下角
        this.indicatorGraphics.lineBetween(
            bounds.left - offset,
            bounds.bottom + offset,
            bounds.left - offset + cornerSize,
            bounds.bottom + offset
        );
        this.indicatorGraphics.lineBetween(
            bounds.left - offset,
            bounds.bottom + offset,
            bounds.left - offset,
            bounds.bottom + offset - cornerSize
        );
        
        // 右下角
        this.indicatorGraphics.lineBetween(
            bounds.right + offset,
            bounds.bottom + offset,
            bounds.right + offset - cornerSize,
            bounds.bottom + offset
        );
        this.indicatorGraphics.lineBetween(
            bounds.right + offset,
            bounds.bottom + offset,
            bounds.right + offset,
            bounds.bottom + offset - cornerSize
        );
    }
    
    /**
     * 清理资源
     */
    destroy() {
        if (this.indicatorGraphics) {
            this.indicatorGraphics.destroy();
            this.indicatorGraphics = null;
        }
        
        if (this.countText) {
            this.scene.events.off('selection:changed');
            this.countText.destroy();
            this.countText = null;
        }
    }
}
