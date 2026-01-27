// src/utils/HistoryVisualHelper.js
// 历史记录可视化工具 - 使用 DOM 面板，可移动到屏幕任意位置

import DraggableInfoPanel from '../dom/DraggableInfoPanel.js';

export default class HistoryVisualHelper {
    constructor(scene) {
        this.scene = scene;
        
        // 状态
        this.isVisible = false;
        
        // 创建 DOM 面板
        this.create();
        this.setupEvents();
        this.setupKeyboard();
    }
    
    /**
     * 创建历史记录面板（使用 DOM 面板）
     */
    create() {
        const width = window.innerWidth;
        
        // 创建 DOM 面板（可移动到屏幕任意位置）
        this.panel = new DraggableInfoPanel({
            id: 'history-visual-helper',
            title: '📜 历史记录 (H 切换)',
            content: this.getHistoryText(),
            x: width - 260,
            y: 20,
            visible: false  // 默认隐藏
        });
        
        this.isVisible = false;  // 设置为隐藏状态
        console.log('✅ 历史记录面板已创建（DOM 面板）');
    }
    
    /**
     * 获取历史记录文本
     */
    getHistoryText() {
        const historyCount = this.scene.commandManager.history.length;
        const redoCount = this.scene.commandManager.redoStack.length;
        const maxHistory = this.scene.commandManager.maxHistory;
        
        let lines = [
            `历史: ${historyCount}/${maxHistory} | 重做: ${redoCount}`,
            '',
            '=== 最近操作 ==='
        ];
        
        // 显示最近的 10 条历史记录
        const recentHistory = this.scene.commandManager.history.slice(-10);
        
        if (recentHistory.length === 0) {
            lines.push('暂无历史记录');
        } else {
            recentHistory.forEach((command, index) => {
                const commandName = this.getCommandName(command);
                lines.push(`${index + 1}. ${commandName}`);
            });
        }
        
        lines.push('');
        lines.push('=== 快捷键 ===');
        lines.push('Ctrl+Z - 撤销');
        lines.push('Ctrl+Shift+Z - 重做');
        lines.push('Ctrl+Y - 重做');
        
        return lines.join('\n');
    }
    
    /**
     * 设置事件监听（遵循 Phaser 官方标准）
     */
    setupEvents() {
        // 监听历史记录变化
        this.scene.events.on('history:changed', () => {
            if (this.isVisible) {
                this.updateHistoryList();
            }
        });
    }
    
    /**
     * 设置键盘监听（遵循 Phaser 官方标准）
     */
    setupKeyboard() {
        // Ctrl+Z 撤销
        this.scene.input.keyboard.on('keydown', (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
                event.preventDefault();
                this.undo();
            }
        });
        
        // Ctrl+Shift+Z 或 Ctrl+Y 重做
        this.scene.input.keyboard.on('keydown', (event) => {
            if ((event.ctrlKey || event.metaKey) && 
                (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
                event.preventDefault();
                this.redo();
            }
        });
        
        // H 键切换历史记录面板
        this.scene.input.keyboard.on('keydown-H', () => {
            this.toggle();
        });
    }
    
    /**
     * 撤销（遵循 Phaser 官方标准）
     */
    undo() {
        if (this.scene.commandManager.undo()) {
            console.log('↶ 撤销成功');
            this.showUndoFeedback();
        }
    }
    
    /**
     * 重做（遵循 Phaser 官方标准）
     */
    redo() {
        if (this.scene.commandManager.redo()) {
            console.log('↷ 重做成功');
            this.showRedoFeedback();
        }
    }
    
    /**
     * 显示撤销反馈（遵循 Phaser 官方标准）
     */
    showUndoFeedback() {
        const text = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            '↶ 撤销',
            {
                fontSize: '32px',
                color: '#ffff00',
                backgroundColor: '#000000',
                padding: { x: 20, y: 10 }
            }
        );
        text.setOrigin(0.5, 0.5);
        text.setDepth(10003);
        text.setScrollFactor(0);
        
        // 淡出动画（遵循 Phaser 官方标准）
        this.scene.tweens.add({
            targets: text,
            alpha: 0,
            y: text.y - 50,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                text.destroy();
            }
        });
    }
    
    /**
     * 显示重做反馈（遵循 Phaser 官方标准）
     */
    showRedoFeedback() {
        const text = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            '↷ 重做',
            {
                fontSize: '32px',
                color: '#00ff00',
                backgroundColor: '#000000',
                padding: { x: 20, y: 10 }
            }
        );
        text.setOrigin(0.5, 0.5);
        text.setDepth(10003);
        text.setScrollFactor(0);
        
        // 淡出动画（遵循 Phaser 官方标准）
        this.scene.tweens.add({
            targets: text,
            alpha: 0,
            y: text.y - 50,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                text.destroy();
            }
        });
    }
    
    /**
     * 更新历史记录列表
     */
    updateHistoryList() {
        if (this.panel) {
            this.panel.setContent(this.getHistoryText());
        }
    }
    
    /**
     * 获取命令名称（遵循 Phaser 官方标准）
     */
    getCommandName(command) {
        const name = command.constructor.name;
        const nameMap = {
            'AddHotspotCommand': '添加热区',
            'DeleteHotspotCommand': '删除热区',
            'MoveHotspotCommand': '移动热区',
            'ResizeHotspotCommand': '缩放热区',
            'ModifyHotspotCommand': '修改属性',
            'PasteHotspotsCommand': '粘贴热区',
            'UpdateTimeCommand': '更新时间'
        };
        return nameMap[name] || name;
    }
    
    /**
     * 切换显示/隐藏
     */
    toggle() {
        this.isVisible = !this.isVisible;
        if (this.isVisible) {
            this.updateHistoryList(); // 更新内容
            this.panel.show();
        } else {
            this.panel.hide();
        }
        console.log(`${this.isVisible ? '✅' : '❌'} 历史记录面板: ${this.isVisible ? '显示' : '隐藏'}`);
    }
    
    /**
     * 显示历史记录面板
     */
    show() {
        this.isVisible = true;
        this.updateHistoryList();
        this.panel.show();
    }
    
    /**
     * 隐藏历史记录面板
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
        
        this.scene.events.off('history:changed');
        this.scene.input.keyboard.off('keydown');
        this.scene.input.keyboard.off('keydown-H');
    }
}
