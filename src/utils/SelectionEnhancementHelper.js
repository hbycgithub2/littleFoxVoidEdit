// src/utils/SelectionEnhancementHelper.js
// 选择增强辅助工具 - 遵循 Phaser 3 官方标准

export default class SelectionEnhancementHelper {
    constructor(scene) {
        this.scene = scene;
        this.setupKeyboard();
    }
    
    /**
     * 设置键盘快捷键
     */
    setupKeyboard() {
        // Ctrl+A - 全选
        this.scene.input.keyboard.on('keydown-A', (event) => {
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                this.selectAll();
            }
        });
        
        // Ctrl+Shift+A - 反选
        this.scene.input.keyboard.on('keydown-A', (event) => {
            if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
                event.preventDefault();
                this.invertSelection();
            }
        });
        
        // Ctrl+D - 取消选择
        this.scene.input.keyboard.on('keydown-D', (event) => {
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                this.scene.selectionManager.clearSelection();
                console.log('❌ 取消所有选择');
            }
        });
    }
    
    /**
     * 全选可见热区
     */
    selectAll() {
        const hotspots = this.scene.hotspots || [];
        const videoTime = this.scene.registry.get('videoTime') || 0;
        
        let count = 0;
        hotspots.forEach(hotspot => {
            if (hotspot.shouldShow(videoTime)) {
                this.scene.selectionManager.select(hotspot, true);
                count++;
            }
        });
        
        console.log(`✅ 全选: ${count} 个热区`);
    }
    
    /**
     * 反选
     */
    invertSelection() {
        const hotspots = this.scene.hotspots || [];
        const videoTime = this.scene.registry.get('videoTime') || 0;
        const selected = this.scene.selectionManager.getSelected();
        
        // 先清空选择
        this.scene.selectionManager.clearSelection();
        
        // 选择未选中的可见热区
        let count = 0;
        hotspots.forEach(hotspot => {
            if (hotspot.shouldShow(videoTime) && !selected.includes(hotspot)) {
                this.scene.selectionManager.select(hotspot, true);
                count++;
            }
        });
        
        console.log(`🔄 反选: ${count} 个热区`);
    }
    
    /**
     * 选择相同类型的热区
     * @param {string} shape - 形状类型
     */
    selectByShape(shape) {
        const hotspots = this.scene.hotspots || [];
        const videoTime = this.scene.registry.get('videoTime') || 0;
        
        this.scene.selectionManager.clearSelection();
        
        let count = 0;
        hotspots.forEach(hotspot => {
            if (hotspot.config.shape === shape && hotspot.shouldShow(videoTime)) {
                this.scene.selectionManager.select(hotspot, true);
                count++;
            }
        });
        
        console.log(`🔍 选择所有 ${shape}: ${count} 个热区`);
    }
    
    /**
     * 选择相同颜色的热区
     * @param {string} color - 颜色
     */
    selectByColor(color) {
        const hotspots = this.scene.hotspots || [];
        const videoTime = this.scene.registry.get('videoTime') || 0;
        
        this.scene.selectionManager.clearSelection();
        
        let count = 0;
        hotspots.forEach(hotspot => {
            if (hotspot.config.color === color && hotspot.shouldShow(videoTime)) {
                this.scene.selectionManager.select(hotspot, true);
                count++;
            }
        });
        
        console.log(`🎨 选择相同颜色: ${count} 个热区`);
    }
    
    /**
     * 清理资源
     */
    destroy() {
        this.scene.input.keyboard.off('keydown-A');
        this.scene.input.keyboard.off('keydown-D');
    }
}
