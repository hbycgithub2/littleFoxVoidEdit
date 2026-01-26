// src/dom/LayerPanelController.js
// 图层面板控制器 - 管理图层 UI（遵循 Phaser 3 标准）

export default class LayerPanelController {
    constructor(game) {
        this.game = game;
        this.scene = null;
        this.layerManager = null;
        this.currentLayerId = null;
        
        // DOM 元素
        this.panel = document.getElementById('layerPanel');
        this.layerList = document.getElementById('layerListContent');
        this.addLayerBtn = document.getElementById('addLayerBtn');
        
        // 等待场景准备好
        this.game.events.once('ready', () => {
            this.scene = this.game.scene.getScene('EditorScene');
            this.layerManager = this.scene.layerManager;
            this.init();
        });
    }
    
    init() {
        // 设置事件监听
        this.setupEvents();
        
        // 初始渲染
        this.render();
        
        // 选中默认图层
        const defaultLayer = this.layerManager.getLayers()[0];
        if (defaultLayer) {
            this.selectLayer(defaultLayer.id);
        }
    }
    
    setupEvents() {
        // 新建图层按钮
        this.addLayerBtn.addEventListener('click', () => {
            const name = `图层 ${this.layerManager.layers.size + 1}`;
            this.layerManager.createLayer(name, true);
            this.render();
        });
        
        // 监听图层事件（遵循 Phaser 标准）
        this.scene.events.on('layer:created', this.render, this);
        this.scene.events.on('layer:deleted', this.render, this);
        this.scene.events.on('layer:renamed', this.render, this);
        this.scene.events.on('layer:moved', this.render, this);
        this.scene.events.on('layer:visibilityChanged', this.render, this);
        this.scene.events.on('layer:lockChanged', this.render, this);
    }
    
    /**
     * 销毁时清理（遵循 Phaser 标准）
     */
    destroy() {
        if (this.scene && this.scene.events) {
            this.scene.events.off('layer:created', this.render, this);
            this.scene.events.off('layer:deleted', this.render, this);
            this.scene.events.off('layer:renamed', this.render, this);
            this.scene.events.off('layer:moved', this.render, this);
            this.scene.events.off('layer:visibilityChanged', this.render, this);
            this.scene.events.off('layer:lockChanged', this.render, this);
        }
    }
    
    render() {
        const layers = this.layerManager.getLayers();
        
        this.layerList.innerHTML = '';
        
        // 从上到下渲染（顶层在上）
        layers.reverse().forEach(layer => {
            const item = this.createLayerItem(layer);
            this.layerList.appendChild(item);
        });
    }
    
    createLayerItem(layer) {
        const item = document.createElement('div');
        item.className = 'layer-item';
        item.dataset.layerId = layer.id;
        
        if (this.currentLayerId === layer.id) {
            item.classList.add('active');
        }
        
        // 可见性图标
        const visibleBtn = document.createElement('button');
        visibleBtn.className = 'layer-icon-btn';
        visibleBtn.innerHTML = layer.visible ? '👁️' : '🚫';
        visibleBtn.title = layer.visible ? '隐藏图层' : '显示图层';
        visibleBtn.onclick = (e) => {
            e.stopPropagation();
            this.layerManager.setLayerVisible(layer.id, !layer.visible);
        };
        
        // 锁定图标
        const lockBtn = document.createElement('button');
        lockBtn.className = 'layer-icon-btn';
        lockBtn.innerHTML = layer.locked ? '🔒' : '🔓';
        lockBtn.title = layer.locked ? '解锁图层' : '锁定图层';
        lockBtn.onclick = (e) => {
            e.stopPropagation();
            this.layerManager.setLayerLocked(layer.id, !layer.locked);
        };
        
        // 图层名称
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'layer-name';
        nameInput.value = layer.name;
        nameInput.readOnly = true;
        
        // 双击重命名
        nameInput.ondblclick = () => {
            nameInput.readOnly = false;
            nameInput.select();
        };
        
        nameInput.onblur = () => {
            nameInput.readOnly = true;
            if (nameInput.value.trim()) {
                this.layerManager.renameLayer(layer.id, nameInput.value.trim());
            } else {
                nameInput.value = layer.name;
            }
        };
        
        nameInput.onkeydown = (e) => {
            if (e.key === 'Enter') {
                nameInput.blur();
            } else if (e.key === 'Escape') {
                nameInput.value = layer.name;
                nameInput.blur();
            }
        };
        
        // 热区数量
        const count = document.createElement('span');
        count.className = 'layer-count';
        count.textContent = `(${layer.hotspots.length})`;
        
        // 操作按钮组
        const actions = document.createElement('div');
        actions.className = 'layer-actions';
        
        // 上移按钮
        const upBtn = document.createElement('button');
        upBtn.className = 'layer-action-btn';
        upBtn.innerHTML = '▲';
        upBtn.title = '上移图层';
        upBtn.onclick = (e) => {
            e.stopPropagation();
            const layers = this.layerManager.getLayers();
            const index = layers.findIndex(l => l.id === layer.id);
            if (index < layers.length - 1) {
                this.layerManager.moveLayer(layer.id, index + 1);
            }
        };
        
        // 下移按钮
        const downBtn = document.createElement('button');
        downBtn.className = 'layer-action-btn';
        downBtn.innerHTML = '▼';
        downBtn.title = '下移图层';
        downBtn.onclick = (e) => {
            e.stopPropagation();
            const layers = this.layerManager.getLayers();
            const index = layers.findIndex(l => l.id === layer.id);
            if (index > 0) {
                this.layerManager.moveLayer(layer.id, index - 1);
            }
        };
        
        // 删除按钮
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'layer-action-btn danger';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.title = '删除图层';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            if (this.layerManager.layers.size > 1) {
                if (confirm(`确定删除图层"${layer.name}"吗？`)) {
                    const wasCurrentLayer = this.currentLayerId === layer.id;
                    this.layerManager.deleteLayer(layer.id);
                    
                    // 如果删除的是当前图层，选中默认图层
                    if (wasCurrentLayer) {
                        const defaultLayer = this.layerManager.getLayers()[0];
                        if (defaultLayer) {
                            this.selectLayer(defaultLayer.id);
                        }
                    }
                }
            } else {
                alert('不能删除最后一个图层！');
            }
        };
        
        actions.appendChild(upBtn);
        actions.appendChild(downBtn);
        actions.appendChild(deleteBtn);
        
        // 组装
        item.appendChild(visibleBtn);
        item.appendChild(lockBtn);
        item.appendChild(nameInput);
        item.appendChild(count);
        item.appendChild(actions);
        
        // 点击选中图层
        item.onclick = () => {
            this.selectLayer(layer.id);
        };
        
        return item;
    }
    
    selectLayer(layerId) {
        this.currentLayerId = layerId;
        
        // 更新 UI
        document.querySelectorAll('.layer-item').forEach(item => {
            if (parseInt(item.dataset.layerId) === layerId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // 通知场景
        this.scene.registry.set('currentLayerId', layerId);
    }
    
    getCurrentLayer() {
        return this.layerManager.getLayer(this.currentLayerId);
    }
}
