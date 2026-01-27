// src/utils/DragResizeStatusIndicator.js
// 拖拽缩放状态指示器 - 使用 DOM 面板，可移动到屏幕任意位置

import DraggableInfoPanel from '../dom/DraggableInfoPanel.js';

export default class DragResizeStatusIndicator {
    constructor(scene) {
        this.scene = scene;
        
        // 状态数据
        this.statusData = {
            mode: '正常',
            selected: 0,
            clipboard: '空',
            snap: false,
            shift: false
        };
        
        // 状态（默认隐藏，按 F3 切换）
        this.isVisible = false;
        
        this.create();
        this.setupEvents();
        this.setupKeyboard();
    }
    
    /**
     * 创建状态面板（使用 DOM 面板）
     */
    create() {
        // 创建 DOM 面板（可移动到屏幕任意位置）
        this.panel = new DraggableInfoPanel({
            id: 'drag-resize-status-indicator',
            title: '🎮 状态 (J 切换)',
            content: this.getStatusText(),
            x: 10,
            y: 10,
            visible: false  // 默认隐藏
        });
        
        console.log('✅ 状态指示器已创建（DOM 面板）');
        
        // 初始更新
        this.isVisible = false;  // 设置为隐藏状态
        this.update();
    }
    
    /**
     * 获取状态文本
     */
    getStatusText() {
        const lines = [
            `模式: ${this.statusData.mode}`,
            `选中: ${this.statusData.selected} 个`,
            `剪贴板: ${this.statusData.clipboard}`,
            `吸附: ${this.statusData.snap ? '开启 (G)' : '关闭 (G)'}`,
            `Shift: ${this.statusData.shift ? '保持比例' : '关闭'}`
        ];
        return lines.join('\n');
    }
    
    /**
     * 设置事件监听（遵循 Phaser 官方标准）
     */
    setupEvents() {
        // 监听选择变化
        this.scene.events.on('selection:changed', () => {
            this.update();
        });
        
        // 监听拖拽开始
        this.scene.events.on('hotspot:dragstart', () => {
            this.statusData.mode = '拖拽中';
            this.update();
        });
        
        // 监听拖拽结束
        this.scene.events.on('hotspot:dragend', () => {
            this.statusData.mode = '正常';
            this.update();
        });
        
        // 监听缩放开始
        this.scene.events.on('hotspot:resizestart', () => {
            this.statusData.mode = '缩放中';
            this.update();
        });
        
        // 监听缩放结束
        let resizeTimeout = null;
        this.scene.events.on('hotspot:resized', () => {
            if (resizeTimeout) clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.statusData.mode = '正常';
                this.update();
            }, 100);
        });
    }
    
    /**
     * 设置键盘监听（遵循 Phaser 官方标准）
     */
    setupKeyboard() {
        // J 键切换状态框显示/隐藏
        this.scene.input.keyboard.on('keydown-J', () => {
            this.toggle();
        });
        
        // Shift 键状态
        this.scene.input.keyboard.on('keydown-SHIFT', () => {
            this.statusData.shift = true;
            this.update();
        });
        
        this.scene.input.keyboard.on('keyup-SHIFT', () => {
            this.statusData.shift = false;
            this.update();
        });
    }
    
    /**
     * 更新状态显示
     */
    update() {
        // 选中数量
        this.statusData.selected = this.scene.selectionManager ? 
            this.scene.selectionManager.getSelected().length : 0;
        
        // 剪贴板状态
        const clipboardStatus = this.scene.clipboardHelper ? 
            this.scene.clipboardHelper.getStatus() : { hasData: false, count: 0, isCut: false };
        if (clipboardStatus.hasData) {
            this.statusData.clipboard = clipboardStatus.isCut ? 
                `${clipboardStatus.count} 个 (剪切)` : `${clipboardStatus.count} 个`;
        } else {
            this.statusData.clipboard = '空';
        }
        
        // 吸附状态
        this.statusData.snap = this.scene.dragSnapHelper ? 
            this.scene.dragSnapHelper.enabled : false;
        
        // 更新面板内容
        if (this.panel) {
            this.panel.setContent(this.getStatusText());
        }
    }
    
    /**
     * 切换显示/隐藏
     */
    toggle() {
        this.isVisible = !this.isVisible;
        if (this.isVisible) {
            this.panel.show();
            this.update(); // 显示时更新内容
        } else {
            this.panel.hide();
        }
        console.log(`${this.isVisible ? '✅' : '❌'} 状态指示器: ${this.isVisible ? '显示' : '隐藏'}`);
    }
    
    /**
     * 显示
     */
    show() {
        this.isVisible = true;
        this.panel.show();
        this.update();
    }
    
    /**
     * 隐藏
     */
    hide() {
        this.isVisible = false;
        this.panel.hide();
    }
    
    /**
     * 销毁（遵循 Phaser 官方标准）
     */
    destroy() {
        if (this.panel) {
            this.panel.destroy();
            this.panel = null;
        }
        
        this.scene.events.off('selection:changed');
        this.scene.events.off('hotspot:dragstart');
        this.scene.events.off('hotspot:dragend');
        this.scene.events.off('hotspot:resizestart');
        this.scene.events.off('hotspot:resized');
        
        this.scene.input.keyboard.off('keydown-J');
        this.scene.input.keyboard.off('keydown-SHIFT');
        this.scene.input.keyboard.off('keyup-SHIFT');
        this.scene.input.keyboard.off('keydown-F3');
    }
}
