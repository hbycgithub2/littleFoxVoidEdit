// src/core/StyleManager.js
// 样式管理器 - 管理热区样式预设（遵循 Phaser 3 标准）

export default class StyleManager {
    constructor(scene) {
        this.scene = scene;
        this.presets = new Map();
        
        // 初始化默认预设
        this.initDefaultPresets();
        
        // 从 localStorage 加载自定义预设
        this.loadCustomPresets();
    }
    
    /**
     * 初始化默认预设
     */
    initDefaultPresets() {
        // 默认样式
        this.addPreset('default', {
            name: '默认',
            color: '#00ff00',
            strokeWidth: 3,
            isDefault: true
        });
        
        // 重点标记
        this.addPreset('important', {
            name: '重点',
            color: '#ff0000',
            strokeWidth: 5,
            isDefault: true
        });
        
        // 次要标记
        this.addPreset('secondary', {
            name: '次要',
            color: '#ffff00',
            strokeWidth: 2,
            isDefault: true
        });
        
        // 提示标记
        this.addPreset('hint', {
            name: '提示',
            color: '#00ffff',
            strokeWidth: 3,
            isDefault: true
        });
        
        // 警告标记
        this.addPreset('warning', {
            name: '警告',
            color: '#ff9900',
            strokeWidth: 4,
            isDefault: true
        });
    }
    
    /**
     * 添加预设
     * @param {string} id - 预设 ID
     * @param {object} style - 样式对象
     */
    addPreset(id, style) {
        this.presets.set(id, {
            id,
            ...style,
            createdAt: Date.now()
        });
        
        // 发送事件（遵循 Phaser 标准）
        this.scene.events.emit('style:presetAdded', { id, style });
    }
    
    /**
     * 删除预设
     * @param {string} id - 预设 ID
     */
    removePreset(id) {
        const preset = this.presets.get(id);
        
        // 不能删除默认预设
        if (preset && preset.isDefault) {
            console.warn('不能删除默认预设');
            return false;
        }
        
        this.presets.delete(id);
        
        // 发送事件
        this.scene.events.emit('style:presetRemoved', id);
        
        // 保存到 localStorage
        this.saveCustomPresets();
        
        return true;
    }
    
    /**
     * 应用预设到选中的热区
     * @param {string} id - 预设 ID
     */
    applyPreset(id) {
        const preset = this.presets.get(id);
        if (!preset) return;
        
        const selected = this.scene.selectionManager.getSelected();
        if (selected.length === 0) return;
        
        selected.forEach(hotspot => {
            // 应用样式
            hotspot.config.color = preset.color;
            hotspot.config.strokeWidth = preset.strokeWidth;
            
            // 更新视觉
            hotspot.updateVisual();
        });
        
        // 同步到 registry
        this.scene.syncToRegistry();
        
        // 发送事件
        this.scene.events.emit('style:applied', { presetId: id, count: selected.length });
    }
    
    /**
     * 从当前选中的热区创建预设
     * @param {string} name - 预设名称
     */
    createFromSelection(name) {
        const selected = this.scene.selectionManager.getSelected();
        if (selected.length === 0) return null;
        
        // 使用第一个选中热区的样式
        const hotspot = selected[0];
        const id = `custom_${Date.now()}`;
        
        this.addPreset(id, {
            name: name,
            color: hotspot.config.color || '#00ff00',
            strokeWidth: hotspot.config.strokeWidth || 3,
            isDefault: false
        });
        
        // 保存到 localStorage
        this.saveCustomPresets();
        
        return id;
    }
    
    /**
     * 获取所有预设
     * @returns {Array} 预设数组
     */
    getPresets() {
        return Array.from(this.presets.values());
    }
    
    /**
     * 获取预设
     * @param {string} id - 预设 ID
     * @returns {object} 预设对象
     */
    getPreset(id) {
        return this.presets.get(id);
    }
    
    /**
     * 保存自定义预设到 localStorage
     */
    saveCustomPresets() {
        const customPresets = Array.from(this.presets.values())
            .filter(p => !p.isDefault);
        
        try {
            localStorage.setItem('hotspot_style_presets', JSON.stringify(customPresets));
        } catch (error) {
            console.error('保存样式预设失败:', error);
        }
    }
    
    /**
     * 从 localStorage 加载自定义预设
     */
    loadCustomPresets() {
        try {
            const data = localStorage.getItem('hotspot_style_presets');
            if (data) {
                const presets = JSON.parse(data);
                presets.forEach(preset => {
                    this.presets.set(preset.id, preset);
                });
            }
        } catch (error) {
            console.error('加载样式预设失败:', error);
        }
    }
}
