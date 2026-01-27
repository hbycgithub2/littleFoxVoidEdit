// src/utils/ShortcutHintDisplay.js
// 快捷键提示显示器 - 使用 DOM 面板，可移动到屏幕任意位置

import DraggableInfoPanel from '../dom/DraggableInfoPanel.js';

export default class ShortcutHintDisplay {
    constructor(scene) {
        this.scene = scene;
        this.visible = false;
        
        // 创建 DOM 面板（可移动到屏幕任意位置）
        const width = window.innerWidth;
        this.panel = new DraggableInfoPanel({
            id: 'shortcut-hint-display',
            title: '⌨️ 快捷键提示 (H 切换)',
            content: this.getHintsText(),
            x: width - 220,
            y: 10,
            visible: false  // 默认隐藏
        });
        
        this.visible = false;  // 设置为隐藏状态
        
        // H 键切换显示
        scene.input.keyboard.on('keydown-H', () => {
            this.toggle();
        });
    }
    
    getHintsText() {
        const hints = [
            '=== 绘制模式 ===',
            'C - 圆形 | R - 矩形',
            'E - 椭圆 | P - 多边形',
            '',
            '=== 辅助工具 ===',
            'G - 网格吸附',
            'S - 智能吸附',
            'I - 精度显示',
            'M - 镜像模式',
            'Q/E - 旋转 ±15°',
            '',
            '=== 快速操作 ===',
            '1/2/3 - 模板大小',
            'Space - 重复上次',
            'Shift - 约束比例',
            'Alt - 约束角度',
            'Ctrl - 复制模式',
            '',
            '=== 控制 ===',
            'Backspace - 撤销顶点',
            'ESC - 取消 | Enter - 完成',
            'Delete - 删除选中'
        ];
        
        return hints.join('\n');
    }
    
    toggle() {
        this.visible = !this.visible;
        if (this.visible) {
            this.panel.show();
        } else {
            this.panel.hide();
        }
        console.log(`${this.visible ? '✅' : '❌'} 快捷键提示: ${this.visible ? '显示' : '隐藏'}`);
    }
    
    show() {
        this.visible = true;
        this.panel.show();
    }
    
    hide() {
        this.visible = false;
        this.panel.hide();
    }
    
    destroy() {
        this.scene.input.keyboard.off('keydown-H');
        if (this.panel) {
            this.panel.destroy();
            this.panel = null;
        }
    }
}
