// src/layer/LayerManager.js
// 图层管理器 - 完全遵循 Phaser 3 官方标准
// 功能：创建、删除、显示/隐藏、锁定/解锁、排序、重命名

export default class LayerManager {
    constructor(scene) {
        this.scene = scene;
        this.layers = [];
        this.activeLayer = null;
        this.layerIdCounter = 0;
        
        // 创建默认图层
        this.createLayer('默认图层');
    }
    
    /**
     * 创建图层（遵循 Phaser 标准）
     */
    createLayer(name = '新图层') {
        const layer = {
            id: `layer_${this.layerIdCounter++}`,
            name: name,
            visible: true,
            locked: false,
            opacity: 1.0,
            hotspots: [],
            container: this.scene.add.container(0, 0),
            createdAt: Date.now()
        };
        
        // 设置容器深度
        layer.container.setDepth(this.layers.length);
        
        this.layers.push(layer);
        
        // 如果是第一个图层，设为活动图层
        if (!this.activeLayer) {
            this.activeLayer = layer;
        }
        
        this.scene.events.emit('layer:created', layer);
        console.log(`✓ 创建图层: ${layer.name}`);
        
        return layer;
    }
    
    /**
     * 删除图层（遵循 Phaser 标准）
     */
    deleteLayer(layerId) {
        const index = this.layers.findIndex(l => l.id === layerId);
        
        if (index === -1) {
            console.warn('⚠️ 图层不存在');
            return false;
        }
        
        // 不能删除最后一个图层
        if (this.layers.length === 1) {
            console.warn('⚠️ 不能删除最后一个图层');
            return false;
        }
        
        const layer = this.layers[index];
        
        // 销毁图层容器
        if (layer.container) {
            layer.container.destroy();
        }
        
        // 从数组中移除
        this.layers.splice(index, 1);
        
        // 如果删除的是活动图层，切换到其他图层
        if (this.activeLayer === layer) {
            this.activeLayer = this.layers[Math.max(0, index - 1)];
        }
        
        this.scene.events.emit('layer:deleted', layerId);
        console.log(`✓ 删除图层: ${layer.name}`);
        
        return true;
    }
    
    /**
     * 显示/隐藏图层（遵循 Phaser 标准）
     */
    toggleLayerVisibility(layerId) {
        const layer = this.getLayer(layerId);
        
        if (!layer) {
            console.warn('⚠️ 图层不存在');
            return false;
        }
        
        layer.visible = !layer.visible;
        
        // 更新容器可见性
        if (layer.container) {
            layer.container.setVisible(layer.visible);
        }
        
        // 更新热区可见性
        layer.hotspots.forEach(hotspot => {
            if (hotspot.setVisible) {
                hotspot.setVisible(layer.visible);
            }
        });
        
        this.scene.events.emit('layer:visibilityChanged', {
            layerId,
            visible: layer.visible
        });
        
        console.log(`${layer.visible ? '👁' : '🚫'} 图层 "${layer.name}" ${layer.visible ? '显示' : '隐藏'}`);
        
        return true;
    }
    
    /**
     * 锁定/解锁图层（遵循 Phaser 标准）
     */
    toggleLayerLock(layerId) {
        const layer = this.getLayer(layerId);
        
        if (!layer) {
            console.warn('⚠️ 图层不存在');
            return false;
        }
        
        layer.locked = !layer.locked;
        
        // 更新热区交互性
        layer.hotspots.forEach(hotspot => {
            if (hotspot.setInteractive) {
                if (layer.locked) {
                    hotspot.disableInteractive();
                } else {
                    hotspot.setInteractive();
                }
            }
        });
        
        this.scene.events.emit('layer:lockChanged', {
            layerId,
            locked: layer.locked
        });
        
        console.log(`${layer.locked ? '🔒' : '🔓'} 图层 "${layer.name}" ${layer.locked ? '锁定' : '解锁'}`);
        
        return true;
    }
    
    /**
     * 上移图层（遵循 Phaser 标准）
     */
    moveLayerUp(layerId) {
        const index = this.layers.findIndex(l => l.id === layerId);
        
        if (index === -1 || index === this.layers.length - 1) {
            return false;
        }
        
        // 交换位置
        [this.layers[index], this.layers[index + 1]] = 
        [this.layers[index + 1], this.layers[index]];
        
        // 更新深度
        this.updateLayerDepths();
        
        this.scene.events.emit('layer:orderChanged');
        console.log(`⬆️ 上移图层: ${this.layers[index + 1].name}`);
        
        return true;
    }
    
    /**
     * 下移图层（遵循 Phaser 标准）
     */
    moveLayerDown(layerId) {
        const index = this.layers.findIndex(l => l.id === layerId);
        
        if (index === -1 || index === 0) {
            return false;
        }
        
        // 交换位置
        [this.layers[index], this.layers[index - 1]] = 
        [this.layers[index - 1], this.layers[index]];
        
        // 更新深度
        this.updateLayerDepths();
        
        this.scene.events.emit('layer:orderChanged');
        console.log(`⬇️ 下移图层: ${this.layers[index - 1].name}`);
        
        return true;
    }
    
    /**
     * 重命名图层（遵循 Phaser 标准）
     */
    renameLayer(layerId, newName) {
        const layer = this.getLayer(layerId);
        
        if (!layer) {
            console.warn('⚠️ 图层不存在');
            return false;
        }
        
        const oldName = layer.name;
        layer.name = newName;
        
        this.scene.events.emit('layer:renamed', {
            layerId,
            oldName,
            newName
        });
        
        console.log(`✏️ 重命名图层: "${oldName}" → "${newName}"`);
        
        return true;
    }
    
    /**
     * 设置活动图层（遵循 Phaser 标准）
     */
    setActiveLayer(layerId) {
        const layer = this.getLayer(layerId);
        
        if (!layer) {
            console.warn('⚠️ 图层不存在');
            return false;
        }
        
        this.activeLayer = layer;
        
        this.scene.events.emit('layer:activeChanged', layer);
        console.log(`✓ 切换到图层: ${layer.name}`);
        
        return true;
    }
    
    /**
     * 添加热区到图层（遵循 Phaser 标准）
     */
    addHotspotToLayer(hotspot, layerId = null) {
        const layer = layerId ? this.getLayer(layerId) : this.activeLayer;
        
        if (!layer) {
            console.warn('⚠️ 图层不存在');
            return false;
        }
        
        layer.hotspots.push(hotspot);
        
        // ✅ 关键修复：设置热区的 layerId
        if (hotspot.config) {
            hotspot.config.layerId = layer.id;
        }
        
        // 添加到图层容器
        if (layer.container && hotspot.setParent) {
            layer.container.add(hotspot);
        }
        
        return true;
    }
    
    /**
     * 从图层移除热区（遵循 Phaser 标准）
     */
    removeHotspotFromLayer(hotspot, layerId) {
        const layer = this.getLayer(layerId);
        
        if (!layer) {
            return false;
        }
        
        const index = layer.hotspots.indexOf(hotspot);
        if (index > -1) {
            layer.hotspots.splice(index, 1);
            
            // 从容器移除
            if (layer.container) {
                layer.container.remove(hotspot);
            }
            
            return true;
        }
        
        return false;
    }
    
    /**
     * 更新图层深度（遵循 Phaser 标准）
     */
    updateLayerDepths() {
        this.layers.forEach((layer, index) => {
            if (layer.container) {
                layer.container.setDepth(index);
            }
        });
    }
    
    /**
     * 设置图层透明度（遵循 Phaser 标准）
     */
    setLayerOpacity(layerId, opacity) {
        const layer = this.getLayer(layerId);
        
        if (!layer) {
            return false;
        }
        
        layer.opacity = Math.max(0, Math.min(1, opacity));
        
        if (layer.container) {
            layer.container.setAlpha(layer.opacity);
        }
        
        return true;
    }
    
    /**
     * 获取图层
     */
    getLayer(layerId) {
        return this.layers.find(l => l.id === layerId);
    }
    
    /**
     * 获取所有图层
     */
    getLayers() {
        return this.layers;
    }
    
    /**
     * 获取活动图层
     */
    getActiveLayer() {
        return this.activeLayer;
    }
    
    /**
     * 获取图层数量
     */
    getLayerCount() {
        return this.layers.length;
    }
    
    /**
     * 清空所有图层（保留一个默认图层）
     */
    clearAllLayers() {
        // 销毁所有图层
        this.layers.forEach(layer => {
            if (layer.container) {
                layer.container.destroy();
            }
        });
        
        this.layers = [];
        this.activeLayer = null;
        this.layerIdCounter = 0;
        
        // 创建新的默认图层
        this.createLayer('默认图层');
        
        console.log('✓ 已清空所有图层');
    }
    
    /**
     * 销毁
     */
    destroy() {
        this.layers.forEach(layer => {
            if (layer.container) {
                layer.container.destroy();
            }
        });
        
        this.layers = [];
        this.activeLayer = null;
    }
}
