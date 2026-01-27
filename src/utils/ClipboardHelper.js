// src/utils/ClipboardHelper.js
// 剪贴板管理器 - 完全遵循 Phaser 3 官方标准
// 功能：复制、粘贴、剪切、自动偏移

import { PasteHotspotsCommand } from '../core/CommandManager.js';

export default class ClipboardHelper {
    constructor(scene) {
        this.scene = scene;
        
        // 剪贴板数据
        this.clipboard = [];
        this.isCut = false; // 是否是剪切操作
        this.cutHotspots = []; // 剪切的热区
        
        // 粘贴偏移量
        this.pasteOffset = 20;
        this.pasteCount = 0; // 连续粘贴次数
        
        // 视觉反馈（遵循 Phaser 官方标准）
        this.feedbackText = null;
        
        this.setupKeyboard();
    }
    
    /**
     * 设置键盘监听（遵循 Phaser 官方标准）
     */
    setupKeyboard() {
        // Ctrl+C 复制
        this.scene.input.keyboard.on('keydown', (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
                event.preventDefault();
                this.copy();
            }
        });
        
        // Ctrl+X 剪切
        this.scene.input.keyboard.on('keydown', (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'x') {
                event.preventDefault();
                this.cut();
            }
        });
        
        // Ctrl+V 粘贴
        this.scene.input.keyboard.on('keydown', (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
                event.preventDefault();
                this.paste();
            }
        });
    }
    
    /**
     * 复制选中的热区（遵循 Phaser 官方标准）
     */
    copy() {
        const selected = this.scene.selectionManager.getSelected();
        
        if (selected.length === 0) {
            this.showFeedback('⚠️ 没有选中的热区', '#ff9800');
            return;
        }
        
        // 深拷贝配置到剪贴板
        this.clipboard = selected.map(hotspot => ({ ...hotspot.config }));
        this.isCut = false;
        this.pasteCount = 0;
        
        console.log(`📋 已复制 ${this.clipboard.length} 个热区`);
        this.showFeedback(`📋 已复制 ${this.clipboard.length} 个热区`, '#4CAF50');
        
        // 发送事件
        this.scene.events.emit('clipboard:copy', {
            count: this.clipboard.length
        });
    }
    
    /**
     * 剪切选中的热区（遵循 Phaser 官方标准）
     */
    cut() {
        const selected = this.scene.selectionManager.getSelected();
        
        if (selected.length === 0) {
            this.showFeedback('⚠️ 没有选中的热区', '#ff9800');
            return;
        }
        
        // 深拷贝配置到剪贴板
        this.clipboard = selected.map(hotspot => ({ ...hotspot.config }));
        this.isCut = true;
        this.cutHotspots = [...selected];
        this.pasteCount = 0;
        
        // 将剪切的热区设置为半透明（视觉反馈）
        this.cutHotspots.forEach(hotspot => {
            hotspot.setAlpha(0.3);
        });
        
        console.log(`✂️ 已剪切 ${this.clipboard.length} 个热区`);
        this.showFeedback(`✂️ 已剪切 ${this.clipboard.length} 个热区`, '#ff9800');
        
        // 发送事件
        this.scene.events.emit('clipboard:cut', {
            count: this.clipboard.length
        });
    }
    
    /**
     * 粘贴热区（遵循 Phaser 官方标准）
     */
    paste() {
        if (this.clipboard.length === 0) {
            this.showFeedback('⚠️ 剪贴板为空', '#ff9800');
            return;
        }
        
        // 如果是剪切操作，第一次粘贴时删除原热区
        if (this.isCut && this.pasteCount === 0) {
            this.cutHotspots.forEach(hotspot => {
                this.scene.removeHotspot(hotspot.config.id);
            });
            this.cutHotspots = [];
        }
        
        // 计算偏移量（连续粘贴时累加）
        this.pasteCount++;
        const offset = this.pasteOffset * this.pasteCount;
        
        // 创建新的配置（偏移位置避免重叠）
        const newConfigs = this.clipboard.map(config => ({
            ...config,
            id: Date.now() + Math.random(),  // 新 ID
            x: config.x + offset,
            y: config.y + offset
        }));
        
        // 使用命令模式（支持撤销/重做）
        const command = new PasteHotspotsCommand(this.scene, newConfigs);
        this.scene.commandManager.execute(command);
        
        // 选中新粘贴的热区
        this.scene.selectionManager.clearSelection();
        newConfigs.forEach(config => {
            const hotspot = this.scene.hotspots.find(h => h.config.id === config.id);
            if (hotspot) {
                this.scene.selectionManager.select(hotspot, true);
            }
        });
        
        console.log(`📌 已粘贴 ${newConfigs.length} 个热区 (偏移: ${offset}px)`);
        this.showFeedback(`📌 已粘贴 ${newConfigs.length} 个热区`, '#4CAF50');
        
        // 如果是剪切操作，第一次粘贴后清除剪切标记
        if (this.isCut && this.pasteCount === 1) {
            this.isCut = false;
        }
        
        // 发送事件
        this.scene.events.emit('clipboard:paste', {
            count: newConfigs.length,
            offset: offset
        });
    }
    
    /**
     * 显示反馈信息（遵循 Phaser 官方标准）
     */
    showFeedback(message, color = '#ffffff') {
        // 销毁旧的反馈文本
        if (this.feedbackText) {
            this.scene.tweens.killTweensOf(this.feedbackText);
            this.feedbackText.destroy();
        }
        
        // 创建新的反馈文本（遵循 Phaser 官方标准）
        this.feedbackText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            message,
            {
                fontSize: '24px',
                color: color,
                backgroundColor: '#000000',
                padding: { x: 20, y: 10 }
            }
        );
        this.feedbackText.setOrigin(0.5, 0.5);
        this.feedbackText.setDepth(10003);
        this.feedbackText.setScrollFactor(0);
        
        // 淡出动画（遵循 Phaser 官方标准）
        this.scene.tweens.add({
            targets: this.feedbackText,
            alpha: 0,
            y: this.feedbackText.y - 50,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                if (this.feedbackText) {
                    this.feedbackText.destroy();
                    this.feedbackText = null;
                }
            }
        });
    }
    
    /**
     * 获取剪贴板状态（遵循 Phaser 官方标准）
     */
    getStatus() {
        return {
            hasData: this.clipboard.length > 0,
            count: this.clipboard.length,
            isCut: this.isCut,
            pasteCount: this.pasteCount
        };
    }
    
    /**
     * 清空剪贴板（遵循 Phaser 官方标准）
     */
    clear() {
        // 恢复剪切热区的透明度
        if (this.isCut && this.cutHotspots.length > 0) {
            this.cutHotspots.forEach(hotspot => {
                if (hotspot && !hotspot.scene) { // 检查是否已销毁
                    return;
                }
                if (hotspot) {
                    hotspot.setAlpha(1);
                }
            });
        }
        
        this.clipboard = [];
        this.isCut = false;
        this.cutHotspots = [];
        this.pasteCount = 0;
        
        console.log('🗑️ 剪贴板已清空');
    }
    
    /**
     * 销毁（遵循 Phaser 官方标准）
     */
    destroy() {
        this.clear();
        
        if (this.feedbackText) {
            this.scene.tweens.killTweensOf(this.feedbackText);
            this.feedbackText.destroy();
            this.feedbackText = null;
        }
        
        this.scene.input.keyboard.off('keydown');
    }
}
