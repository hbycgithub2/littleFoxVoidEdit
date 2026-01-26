// src/dom/StylePanelController.js
// 样式面板控制器 - 管理样式预设 UI（遵循 Phaser 3 标准）

export default class StylePanelController {
    constructor(game, toast) {
        this.game = game;
        this.toast = toast;
        this.scene = null;
        this.styleManager = null;
        
        // DOM 元素
        this.panel = document.getElementById('stylePanel');
        this.presetList = document.getElementById('stylePresetList');
        this.savePresetBtn = document.getElementById('savePresetBtn');
        
        // 等待场景准备好
        this.game.events.once('ready', () => {
            this.scene = this.game.scene.getScene('EditorScene');
            this.styleManager = this.scene.styleManager;
            this.init();
        });
    }
    
    init() {
        this.setupEvents();
        this.render();
    }
    
    setupEvents() {
        // 保存预设按钮
        if (this.savePresetBtn) {
            this.savePresetBtn.addEventListener('click', () => {
                this.saveCurrentStyle();
            });
        }
        
        // 监听样式事件
        this.scene.events.on('style:presetAdded', () => this.render());
        this.scene.events.on('style:presetRemoved', () => this.render());
        this.scene.events.on('style:applied', (data) => {
            if (this.toast) {
                this.toast.success(`已应用样式到 ${data.count} 个热区`);
            }
        });
    }
    
    render() {
        if (!this.presetList) return;
        
        const presets = this.styleManager.getPresets();
        this.presetList.innerHTML = '';
        
        presets.forEach(preset => {
            const item = this.createPresetItem(preset);
            this.presetList.appendChild(item);
        });
    }
    
    createPresetItem(preset) {
        const item = document.createElement('div');
        item.className = 'style-preset-item';
        
        // 颜色预览
        const colorPreview = document.createElement('div');
        colorPreview.className = 'style-color-preview';
        colorPreview.style.backgroundColor = preset.color;
        colorPreview.style.border = `${preset.strokeWidth}px solid ${preset.color}`;
        
        // 名称
        const name = document.createElement('span');
        name.className = 'style-preset-name';
        name.textContent = preset.name;
        
        // 应用按钮
        const applyBtn = document.createElement('button');
        applyBtn.className = 'style-apply-btn';
        applyBtn.textContent = '应用';
        applyBtn.onclick = () => {
            this.styleManager.applyPreset(preset.id);
        };
        
        // 删除按钮（仅自定义预设）
        if (!preset.isDefault) {
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'style-delete-btn';
            deleteBtn.textContent = '🗑️';
            deleteBtn.onclick = () => {
                if (confirm(`确定删除预设"${preset.name}"吗？`)) {
                    this.styleManager.removePreset(preset.id);
                }
            };
            item.appendChild(deleteBtn);
        }
        
        item.appendChild(colorPreview);
        item.appendChild(name);
        item.appendChild(applyBtn);
        
        return item;
    }
    
    saveCurrentStyle() {
        const selected = this.scene.selectionManager.getSelected();
        
        if (selected.length === 0) {
            if (this.toast) {
                this.toast.error('请先选择一个热区');
            }
            return;
        }
        
        const name = prompt('请输入预设名称：', '自定义样式');
        if (!name) return;
        
        const id = this.styleManager.createFromSelection(name);
        
        if (id && this.toast) {
            this.toast.success(`已保存样式预设"${name}"`);
        }
    }
}
