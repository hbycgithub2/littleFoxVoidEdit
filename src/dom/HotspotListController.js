// src/dom/HotspotListController.js
// 热区列表控制器 - 管理热区列表显示（遵循 Phaser 3 标准）

export default class HotspotListController {
    constructor(game) {
        this.game = game;
        this.scene = null;
        this.setupElements();
    }
    
    setupElements() {
        this.hotspotList = document.getElementById('hotspotListContent');
    }
    
    setScene(scene) {
        this.scene = scene;
        this.setupEvents();
    }
    
    setupEvents() {
        if (!this.scene) return;
        
        // 监听热区事件（遵循 Phaser 标准）
        this.scene.events.on('hotspot:added', this.update, this);
        this.scene.events.on('hotspot:removed', this.update, this);
        this.scene.events.on('selection:changed', this.update, this);
        
        // 监听图层事件（图层名称变化时需要更新）
        this.scene.events.on('layer:renamed', this.update, this);
        this.scene.events.on('layer:deleted', this.update, this);
        
        // 监听 registry 变化
        this.scene.registry.events.on('changedata', (_, key) => {
            if (key === 'hotspots') {
                this.update();
            }
        });
    }
    
    /**
     * 销毁时清理（遵循 Phaser 标准）
     */
    destroy() {
        if (this.scene && this.scene.events) {
            this.scene.events.off('hotspot:added', this.update, this);
            this.scene.events.off('hotspot:removed', this.update, this);
            this.scene.events.off('selection:changed', this.update, this);
            this.scene.events.off('layer:renamed', this.update, this);
            this.scene.events.off('layer:deleted', this.update, this);
        }
    }
    
    update() {
        if (!this.scene || !this.hotspotList) return;
        
        const hotspots = this.scene.registry.get('hotspots');
        this.hotspotList.innerHTML = '';
        
        hotspots.forEach((config, index) => {
            const item = document.createElement('div');
            item.className = 'hotspot-item';
            
            // 获取图层信息
            const hotspot = this.scene.hotspots.find(h => h.config.id === config.id);
            const layer = hotspot ? this.scene.layerManager.getHotspotLayer(hotspot) : null;
            const layerName = layer ? layer.name : '未知';
            
            // 显示：序号. 形状 - 单词 [图层名]
            item.textContent = `${index + 1}. ${config.shape} - ${config.word || '未命名'} [${layerName}]`;
            
            item.onclick = () => {
                if (hotspot) {
                    this.scene.selectionManager.select(hotspot, false);
                }
            };
            
            this.hotspotList.appendChild(item);
        });
    }
}
