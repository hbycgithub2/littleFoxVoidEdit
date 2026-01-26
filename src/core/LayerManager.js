// src/core/LayerManager.js
// 图层管理器 - 管理热区的图层显示/隐藏、锁定、排序（遵循 Phaser 3 标准）

export default class LayerManager {
    constructor(scene) {
        this.scene = scene;
        this.layers = new Map();  // 图层集合
        this.nextLayerId = 1;
        
        // 创建默认图层
        this.createLayer('默认图层', true);
    }
    
    /**
     * 创建图层
     * @param {string} name - 图层名称
     * @param {boolean} visible - 是否可见
     * @returns {object} 图层对象
     */
    createLayer(name, visible = true) {
        const layer = {
            id: this.nextLayerId++,
            name: name,
            visible: visible,
            locked: false,
            hotspots: [],
            zIndex: this.layers.size
        };
        
        this.layers.set(layer.id, layer);
        
        // 发送事件（遵循 Phaser 标准）
        this.scene.events.emit('layer:created', layer);
        
        return layer;
    }
    
    /**
     * 删除图层
     * @param {number} layerId - 图层 ID
     */
    deleteLayer(layerId) {
        const layer = this.layers.get(layerId);
        if (!layer) return false;
        
        // 不能删除最后一个图层
        if (this.layers.size === 1) {
            console.warn('不能删除最后一个图层');
            return false;
        }
        
        // 将该图层的热区移动到默认图层
        const defaultLayer = Array.from(this.layers.values())[0];
        layer.hotspots.forEach(hotspot => {
            hotspot.layerId = defaultLayer.id;
            defaultLayer.hotspots.push(hotspot);
        });
        
        this.layers.delete(layerId);
        
        // 如果删除的是当前选中的图层，切换到默认图层
        const currentLayerId = this.scene.registry.get('currentLayerId');
        if (currentLayerId === layerId) {
            this.scene.registry.set('currentLayerId', defaultLayer.id);
        }
        
        // 发送事件
        this.scene.events.emit('layer:deleted', layerId);
        
        return true;
    }
    
    /**
     * 设置图层可见性
     * @param {number} layerId - 图层 ID
     * @param {boolean} visible - 是否可见
     */
    setLayerVisible(layerId, visible) {
        const layer = this.layers.get(layerId);
        if (!layer) return;
        
        layer.visible = visible;
        
        // 更新该图层所有热区的可见性
        layer.hotspots.forEach(hotspot => {
            if (visible) {
                // 恢复可见性（根据视频时间判断）
                const videoTime = this.scene.registry.get('videoTime');
                hotspot.setVisible(hotspot.shouldShow(videoTime));
            } else {
                // 隐藏
                hotspot.setVisible(false);
            }
        });
        
        // 发送事件
        this.scene.events.emit('layer:visibilityChanged', { layerId, visible });
    }
    
    /**
     * 设置图层锁定状态
     * @param {number} layerId - 图层 ID
     * @param {boolean} locked - 是否锁定
     */
    setLayerLocked(layerId, locked) {
        const layer = this.layers.get(layerId);
        if (!layer) return;
        
        layer.locked = locked;
        
        // 更新该图层所有热区的交互状态
        layer.hotspots.forEach(hotspot => {
            if (locked) {
                hotspot.disableInteractive();
            } else {
                const hitArea = hotspot.getHitArea();
                hotspot.setInteractive(hitArea.shape, hitArea.callback);
            }
        });
        
        // 发送事件
        this.scene.events.emit('layer:lockChanged', { layerId, locked });
    }
    
    /**
     * 重命名图层
     * @param {number} layerId - 图层 ID
     * @param {string} newName - 新名称
     */
    renameLayer(layerId, newName) {
        const layer = this.layers.get(layerId);
        if (!layer) return;
        
        layer.name = newName;
        
        // 发送事件
        this.scene.events.emit('layer:renamed', { layerId, name: newName });
    }
    
    /**
     * 移动图层顺序
     * @param {number} layerId - 图层 ID
     * @param {number} newIndex - 新的索引位置
     */
    moveLayer(layerId, newIndex) {
        const layersArray = Array.from(this.layers.values());
        const oldIndex = layersArray.findIndex(l => l.id === layerId);
        
        if (oldIndex === -1 || newIndex < 0 || newIndex >= layersArray.length) {
            return;
        }
        
        // 重新排序
        const [layer] = layersArray.splice(oldIndex, 1);
        layersArray.splice(newIndex, 0, layer);
        
        // 更新 zIndex
        layersArray.forEach((l, index) => {
            l.zIndex = index;
        });
        
        // 更新热区的深度（遵循 Phaser 标准）
        this.updateHotspotDepths();
        
        // 发送事件
        this.scene.events.emit('layer:moved', { layerId, oldIndex, newIndex });
    }
    
    /**
     * 将热区添加到图层
     * @param {object} hotspot - 热区对象
     * @param {number} layerId - 图层 ID
     */
    addHotspotToLayer(hotspot, layerId) {
        const layer = this.layers.get(layerId);
        if (!layer) return;
        
        // 从旧图层移除
        if (hotspot.layerId) {
            this.removeHotspotFromLayer(hotspot, hotspot.layerId);
        }
        
        // 添加到新图层
        hotspot.layerId = layerId;
        layer.hotspots.push(hotspot);
        
        // 更新深度
        this.updateHotspotDepths();
        
        // 应用图层状态
        if (!layer.visible) {
            hotspot.setVisible(false);
        }
        if (layer.locked) {
            hotspot.disableInteractive();
        }
    }
    
    /**
     * 从图层移除热区
     * @param {object} hotspot - 热区对象
     * @param {number} layerId - 图层 ID
     */
    removeHotspotFromLayer(hotspot, layerId) {
        const layer = this.layers.get(layerId);
        if (!layer) return;
        
        const index = layer.hotspots.indexOf(hotspot);
        if (index !== -1) {
            layer.hotspots.splice(index, 1);
        }
    }
    
    /**
     * 更新所有热区的深度（遵循 Phaser 标准）
     */
    updateHotspotDepths() {
        const layersArray = Array.from(this.layers.values()).sort((a, b) => a.zIndex - b.zIndex);
        
        let depth = 0;
        layersArray.forEach(layer => {
            layer.hotspots.forEach(hotspot => {
                hotspot.setDepth(depth++);
            });
        });
    }
    
    /**
     * 获取所有图层
     * @returns {Array} 图层数组
     */
    getLayers() {
        return Array.from(this.layers.values()).sort((a, b) => a.zIndex - b.zIndex);
    }
    
    /**
     * 获取图层
     * @param {number} layerId - 图层 ID
     * @returns {object} 图层对象
     */
    getLayer(layerId) {
        return this.layers.get(layerId);
    }
    
    /**
     * 获取热区所在的图层
     * @param {object} hotspot - 热区对象
     * @returns {object} 图层对象
     */
    getHotspotLayer(hotspot) {
        return this.layers.get(hotspot.layerId);
    }
}
