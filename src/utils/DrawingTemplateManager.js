// src/utils/DrawingTemplateManager.js
// 绘制模板管理器 - 遵循 Phaser 3 官方标准

export default class DrawingTemplateManager {
    constructor(scene) {
        this.scene = scene;
        this.templates = this.initTemplates();
        this.currentTemplate = null;
        
        // 创建模板提示文本（遵循 Phaser 官方标准）
        this.templateText = scene.add.text(10, 50, '', {
            fontSize: '12px',
            color: '#ffaa00',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        });
        this.templateText.setDepth(2000);
        this.templateText.setVisible(false);
        
        this.setupKeyboard();
    }
    
    /**
     * 初始化模板
     */
    initTemplates() {
        return {
            '1': { name: '小型', size: 50, color: '#00ff00' },
            '2': { name: '中型', size: 100, color: '#00ffff' },
            '3': { name: '大型', size: 150, color: '#ffff00' }
        };
    }
    
    /**
     * 设置键盘监听
     */
    setupKeyboard() {
        // 数字键 1-3 选择模板
        ['ONE', 'TWO', 'THREE'].forEach((key, index) => {
            this.scene.input.keyboard.on(`keydown-${key}`, () => {
                this.selectTemplate((index + 1).toString());
            });
        });
    }
    
    /**
     * 选择模板
     * @param {string} key - 模板键
     */
    selectTemplate(key) {
        const template = this.templates[key];
        if (!template) return;
        
        this.currentTemplate = template;
        this.showTemplateHint();
        
        console.log(`📐 选择模板: ${template.name} (${template.size}px)`);
        
        // 3秒后自动隐藏提示
        setTimeout(() => {
            this.hideTemplateHint();
        }, 3000);
    }
    
    /**
     * 显示模板提示
     */
    showTemplateHint() {
        if (!this.currentTemplate) return;
        
        const text = `📐 模板: ${this.currentTemplate.name} (${this.currentTemplate.size}px)`;
        this.templateText.setText(text);
        this.templateText.setVisible(true);
    }
    
    /**
     * 隐藏模板提示
     */
    hideTemplateHint() {
        this.templateText.setVisible(false);
    }
    
    /**
     * 应用模板到热区配置
     * @param {object} config - 热区配置
     * @returns {object} 应用模板后的配置
     */
    applyTemplate(config) {
        if (!this.currentTemplate) return config;
        
        const size = this.currentTemplate.size;
        
        // 根据形状应用模板
        switch (config.shape) {
            case 'circle':
                config.radius = size / 2;
                break;
            case 'rect':
                config.width = size;
                config.height = size;
                break;
            case 'ellipse':
                config.radiusX = size / 2;
                config.radiusY = size / 2;
                break;
        }
        
        // 应用颜色
        if (this.currentTemplate.color) {
            config.color = this.currentTemplate.color;
        }
        
        console.log(`✅ 应用模板: ${this.currentTemplate.name}`);
        
        return config;
    }
    
    /**
     * 获取当前模板
     */
    getCurrentTemplate() {
        return this.currentTemplate;
    }
    
    /**
     * 清除当前模板
     */
    clearTemplate() {
        this.currentTemplate = null;
        this.hideTemplateHint();
    }
    
    /**
     * 清理资源
     */
    destroy() {
        if (this.templateText) {
            this.scene.input.keyboard.off('keydown-ONE');
            this.scene.input.keyboard.off('keydown-TWO');
            this.scene.input.keyboard.off('keydown-THREE');
            this.templateText.destroy();
            this.templateText = null;
        }
    }
}
