// src/utils/DrawingModeIndicator.js
// 绘制模式指示器 - 使用 DOM 面板，可移动到屏幕任意位置

import DraggableInfoPanel from '../dom/DraggableInfoPanel.js';

export default class DrawingModeIndicator {
    constructor(scene) {
        this.scene = scene;
        this.isVisible = false;  // 手动控制的可见状态
        this.autoShow = true;    // 是否自动显示（绘制模式变化时）
        
        // 创建 DOM 面板（可移动到屏幕任意位置）
        this.panel = new DraggableInfoPanel({
            id: 'drawing-mode-indicator',
            title: '🎨 绘制模式 (K 切换)',
            content: '',
            x: 10,
            y: 10,
            visible: false
        });
        
        // 模式名称映射
        this.modeNames = {
            'circle': '⭕ 圆形 (C)',
            'rect': '▭ 矩形 (R)',
            'ellipse': '⬭ 椭圆 (E)',
            'polygon': '⬟ 多边形 (P)'
        };
        
        // 当前模式
        this.currentMode = null;
        
        // 监听绘制模式变化
        this.setupEvents();
        this.setupKeyboard();
    }
    
    /**
     * 设置键盘监听
     */
    setupKeyboard() {
        // K 键切换显示/隐藏
        this.scene.input.keyboard.on('keydown-K', () => {
            this.toggle();
        });
    }
    
    /**
     * 切换显示/隐藏
     */
    toggle() {
        this.isVisible = !this.isVisible;
        if (this.isVisible) {
            // 如果有当前模式，显示它
            if (this.currentMode) {
                this.updateMode(this.currentMode);
            } else {
                // 没有模式时显示提示
                this.panel.setTitle('🎨 绘制模式 (K 切换)');
                this.panel.setContent('按 C/R/E/P 选择绘制模式');
                this.panel.show();
            }
        } else {
            this.panel.hide();
        }
        console.log(`${this.isVisible ? '✅' : '❌'} 绘制模式指示器: ${this.isVisible ? '显示' : '隐藏'}`);
    }
    
    /**
     * 显示
     */
    show() {
        this.isVisible = true;
        if (this.currentMode) {
            this.updateMode(this.currentMode);
        } else {
            this.panel.show();
        }
    }
    
    /**
     * 隐藏
     */
    hide() {
        this.isVisible = false;
        this.panel.hide();
    }
    
    /**
     * 设置事件监听
     */
    setupEvents() {
        // 监听 registry 变化（遵循 Phaser 官方标准）
        this.scene.registry.events.on('changedata-drawMode', (parent, value) => {
            this.updateMode(value);
        });
    }
    
    /**
     * 更新模式显示
     * @param {string} mode - 绘制模式
     */
    updateMode(mode) {
        this.currentMode = mode;
        console.log('🎨 绘制模式变化:', mode);
        
        // 只有在手动显示状态下才更新显示
        if (!this.isVisible) {
            return;
        }
        
        if (mode) {
            const modeName = this.modeNames[mode] || mode;
            let tips = '按 ESC 取消 | 按 G 切换网格';
            
            // 根据不同模式显示不同提示
            if (mode === 'polygon') {
                tips = '点击添加顶点 | Enter 完成 | Backspace 撤销 | ESC 取消';
            } else if (mode === 'rect' || mode === 'ellipse') {
                tips = 'Shift 约束比例 | Alt 约束角度 | ESC 取消 | G 网格';
            }
            
            this.panel.setTitle(`🎨 ${modeName} (K 切换)`);
            this.panel.setContent(tips);
            this.panel.show();
            console.log('✅ 绘制模式窗口已显示');
        } else {
            this.panel.setTitle('🎨 绘制模式 (K 切换)');
            this.panel.setContent('按 C/R/E/P 选择绘制模式');
            // 模式取消时不自动隐藏，保持用户的显示状态
        }
    }
    
    /**
     * 清理资源
     */
    destroy() {
        this.scene.registry.events.off('changedata-drawMode');
        this.scene.input.keyboard.off('keydown-K');
        if (this.panel) {
            this.panel.destroy();
            this.panel = null;
        }
    }
}
