// src/dom/PropertyPanelController.js
// 属性面板控制器 - 管理热区属性编辑（遵循 Phaser 3 标准）

import { ModifyHotspotCommand } from '../core/CommandManager.js';

export default class PropertyPanelController {
    constructor(game) {
        this.game = game;
        this.scene = null;
        this.setupElements();
    }
    
    setupElements() {
        this.propertyPanel = document.getElementById('propertyPanel');
        this.propWord = document.getElementById('propWord');
        this.propStartTime = document.getElementById('propStartTime');
        this.propEndTime = document.getElementById('propEndTime');
        this.propColor = document.getElementById('propColor');
        this.deleteBtn = document.getElementById('deleteBtn');
        
        // 记录旧值（用于撤销/重做）
        this.oldValues = new Map();
    }
    
    setScene(scene) {
        this.scene = scene;
        this.setupEvents();
    }
    
    setupEvents() {
        if (!this.scene) return;
        
        if (this.propWord) {
            // 记录开始编辑时的旧值
            this.propWord.addEventListener('focus', (e) => {
                this.recordOldValue('word', e.target.value);
            });
            // 完成编辑时使用命令模式
            this.propWord.addEventListener('blur', (e) => {
                const oldValue = this.oldValues.get('word');
                const newValue = e.target.value;
                if (oldValue !== newValue) {
                    this.updatePropertyWithCommand('word', oldValue, newValue);
                }
            });
        }
        
        if (this.propStartTime) {
            this.propStartTime.addEventListener('focus', (e) => {
                this.recordOldValue('startTime', parseFloat(e.target.value));
            });
            this.propStartTime.addEventListener('blur', (e) => {
                const oldValue = this.oldValues.get('startTime');
                const newValue = parseFloat(e.target.value);
                if (oldValue !== newValue) {
                    this.updatePropertyWithCommand('startTime', oldValue, newValue);
                }
            });
        }
        
        if (this.propEndTime) {
            this.propEndTime.addEventListener('focus', (e) => {
                this.recordOldValue('endTime', parseFloat(e.target.value));
            });
            this.propEndTime.addEventListener('blur', (e) => {
                const oldValue = this.oldValues.get('endTime');
                const newValue = parseFloat(e.target.value);
                if (oldValue !== newValue) {
                    this.updatePropertyWithCommand('endTime', oldValue, newValue);
                }
            });
        }
        
        if (this.propColor) {
            this.propColor.addEventListener('focus', (e) => {
                this.recordOldValue('color', e.target.value);
            });
            this.propColor.addEventListener('change', (e) => {
                const oldValue = this.oldValues.get('color');
                const newValue = e.target.value;
                if (oldValue !== newValue) {
                    this.updatePropertyWithCommand('color', oldValue, newValue);
                }
            });
        }
        
        if (this.deleteBtn) {
            this.deleteBtn.addEventListener('click', () => {
                this.game.events.emit('hotspot:delete');
            });
        }
        
        this.scene.events.on('selection:changed', (data) => {
            this.update(data);
        });
    }
    
    /**
     * 记录旧值（用于撤销/重做）
     */
    recordOldValue(property, value) {
        this.oldValues.set(property, value);
    }
    
    update(data) {
        if (!this.propertyPanel) return;
        
        if (data.count === 0) {
            this.propertyPanel.style.display = 'none';
            return;
        }
        
        this.propertyPanel.style.display = 'block';
        
        if (data.count === 1) {
            const hotspot = data.selected[0];
            if (this.propWord) {
                this.propWord.value = hotspot.config.word || '';
                this.propWord.disabled = false;
            }
            if (this.propStartTime) this.propStartTime.value = hotspot.config.startTime;
            if (this.propEndTime) this.propEndTime.value = hotspot.config.endTime;
            if (this.propColor) this.propColor.value = hotspot.config.color || '#00ff00';
        } else {
            if (this.propWord) {
                this.propWord.value = `已选中 ${data.count} 个热区`;
                this.propWord.disabled = true;
            }
        }
    }
    
    /**
     * 使用命令模式更新属性（支持撤销/重做）
     * 遵循 Phaser 3 标准
     */
    updatePropertyWithCommand(property, oldValue, newValue) {
        if (!this.scene) return;
        
        const selected = this.scene.selectionManager.getSelected();
        
        // 只支持单选时的属性修改
        if (selected.length === 1) {
            const hotspot = selected[0];
            const command = new ModifyHotspotCommand(
                this.scene,
                hotspot.config.id,
                property,
                oldValue,
                newValue
            );
            this.scene.commandManager.execute(command);
        } else if (selected.length > 1) {
            // 多选时直接修改（不支持撤销）
            selected.forEach(hotspot => {
                hotspot.config[property] = newValue;
                if (property === 'color') {
                    hotspot.updateVisual();
                }
            });
            this.scene.syncToRegistry();
        }
    }
    
    /**
     * 直接更新属性（不使用命令模式，用于内部调用）
     */
    updateProperty(property, value) {
        if (!this.scene) return;
        
        const selected = this.scene.selectionManager.getSelected();
        selected.forEach(hotspot => {
            hotspot.config[property] = value;
            if (property === 'color') {
                hotspot.updateVisual();
            }
        });
        
        this.scene.syncToRegistry();
    }
}
