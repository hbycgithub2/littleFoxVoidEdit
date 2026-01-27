// src/utils/DrawingHistoryDisplay.js
// 绘制历史显示器 - 使用 DOM 面板，可移动到屏幕任意位置

import DraggableInfoPanel from '../dom/DraggableInfoPanel.js';

export default class DrawingHistoryDisplay {
    constructor(scene) {
        this.scene = scene;
        this.history = [];
        this.maxHistory = 5;
        this.isVisible = true;  // 默认显示
        
        // 创建 DOM 面板（可移动到屏幕任意位置）
        const height = window.innerHeight;
        this.panel = new DraggableInfoPanel({
            id: 'drawing-history-display',
            title: '📝 最近绘制 (K 切换)',
            content: '暂无绘制记录',
            x: 10,
            y: height - 200,
            visible: false  // 默认隐藏
        });
        
        // 形状图标
        this.shapeIcons = {
            'circle': '⭕',
            'rect': '▭',
            'ellipse': '⬭',
            'polygon': '⬟'
        };
        
        this.setupEvents();
        this.setupKeyboard();
        
        console.log('✅ 绘制历史显示器已创建（DOM 面板）');
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
            this.panel.show();
        } else {
            this.panel.hide();
        }
        console.log(`${this.isVisible ? '✅' : '❌'} 绘制历史显示器: ${this.isVisible ? '显示' : '隐藏'}`);
    }
    
    /**
     * 显示
     */
    show() {
        this.isVisible = true;
        this.panel.show();
    }
    
    /**
     * 隐藏
     */
    hide() {
        this.isVisible = false;
        this.panel.hide();
    }
    
    setupEvents() {
        this.scene.events.on('hotspot:added', (hotspot) => {
            this.addToHistory(hotspot.config.shape);
        });
    }
    
    addToHistory(shape) {
        this.history.unshift(shape);
        if (this.history.length > this.maxHistory) {
            this.history.pop();
        }
        this.updateDisplay();
    }
    
    updateDisplay() {
        if (this.history.length === 0) {
            this.panel.setContent('暂无绘制记录\n\n按 C/R/E/P 开始绘制');
            return;
        }
        
        const lines = this.history.map((shape, i) => {
            const icon = this.shapeIcons[shape] || shape;
            const hint = i === 0 ? ' (Space 重复)' : '';
            return `${icon} ${shape}${hint}`;
        });
        
        this.panel.setContent(lines.join('\n'));
    }
    
    destroy() {
        this.scene.events.off('hotspot:added');
        this.scene.input.keyboard.off('keydown-K');
        if (this.panel) {
            this.panel.destroy();
            this.panel = null;
        }
    }
}
