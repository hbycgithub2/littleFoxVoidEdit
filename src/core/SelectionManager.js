// src/core/SelectionManager.js
// 选择管理器 - 管理热区的选择状态（支持单选/多选）

export default class SelectionManager {
    constructor(scene) {
        this.scene = scene;
        this.selected = new Set();  // 使用 Set 避免重复
    }
    
    /**
     * 选择热区
     * @param {Hotspot} hotspot - 热区对象
     * @param {boolean} multiSelect - 是否多选（Ctrl/Cmd 键）
     */
    select(hotspot, multiSelect = false) {
        if (!multiSelect) {
            this.clearSelection();
        }
        
        this.selected.add(hotspot);
        hotspot.setSelected(true);
        
        this.emitChange();
    }
    
    /**
     * 取消选择热区
     */
    deselect(hotspot) {
        if (this.selected.has(hotspot)) {
            this.selected.delete(hotspot);
            hotspot.setSelected(false);
            this.emitChange();
        }
    }
    
    /**
     * 切换选择状态
     */
    toggle(hotspot, multiSelect = false) {
        if (this.selected.has(hotspot)) {
            this.deselect(hotspot);
        } else {
            this.select(hotspot, multiSelect);
        }
    }
    
    /**
     * 清空选择
     */
    clearSelection() {
        this.selected.forEach(h => h.setSelected(false));
        this.selected.clear();
        this.emitChange();
    }
    
    /**
     * 获取选中的热区
     */
    getSelected() {
        return Array.from(this.selected);
    }
    
    /**
     * 获取选中的热区 ID
     */
    getSelectedIds() {
        return this.getSelected().map(h => h.config.id);
    }
    
    /**
     * 是否有选中
     */
    hasSelection() {
        return this.selected.size > 0;
    }
    
    /**
     * 是否选中了指定热区
     */
    isSelected(hotspot) {
        return this.selected.has(hotspot);
    }
    
    /**
     * 发送选择变化事件（遵循 Phaser 标准）
     */
    emitChange() {
        const selectedIds = this.getSelectedIds();
        
        // 更新 registry（遵循 Phaser 标准）
        this.scene.registry.set('selectedIds', selectedIds);
        
        // 发送事件
        this.scene.events.emit('selection:changed', {
            selected: this.getSelected(),
            ids: selectedIds,
            count: this.selected.size
        });
    }
}
