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
        this.setStartTimeBtn = document.getElementById('setStartTimeBtn');
        this.setEndTimeBtn = document.getElementById('setEndTimeBtn');
        
        // 调试信息
        console.log('📋 PropertyPanelController 元素初始化:', {
            propertyPanel: !!this.propertyPanel,
            propWord: !!this.propWord,
            propStartTime: !!this.propStartTime,
            propEndTime: !!this.propEndTime,
            propColor: !!this.propColor,
            deleteBtn: !!this.deleteBtn,
            setStartTimeBtn: !!this.setStartTimeBtn,
            setEndTimeBtn: !!this.setEndTimeBtn
        });
        
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
            // 双击时间输入框跳转到该时间点
            this.propStartTime.addEventListener('dblclick', (e) => {
                this.jumpToTime(parseFloat(e.target.value));
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
            // 双击时间输入框跳转到该时间点
            this.propEndTime.addEventListener('dblclick', (e) => {
                this.jumpToTime(parseFloat(e.target.value));
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
        
        // 设置开始时间为当前视频时间
        if (this.setStartTimeBtn) {
            this.setStartTimeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔘 点击开始时间按钮');
                this.setTimeFromVideo('startTime');
            });
            console.log('✅ 开始时间按钮事件已绑定');
        } else {
            console.warn('⚠️ 开始时间按钮未找到');
        }
        
        // 设置结束时间为当前视频时间
        if (this.setEndTimeBtn) {
            this.setEndTimeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔘 点击结束时间按钮');
                this.setTimeFromVideo('endTime');
            });
            console.log('✅ 结束时间按钮事件已绑定');
        } else {
            console.warn('⚠️ 结束时间按钮未找到');
        }
        
        this.scene.events.on('selection:changed', (data) => {
            this.update(data);
        });
    }
    
    /**
     * 从视频获取当前时间并设置到输入框
     */
    setTimeFromVideo(property) {
        const video = document.getElementById('video');
        if (!video) {
            console.warn('⚠️ 视频元素未找到');
            return;
        }
        
        const currentTime = parseFloat(video.currentTime.toFixed(1));
        
        // 记录旧值
        const inputElement = property === 'startTime' ? this.propStartTime : this.propEndTime;
        const oldValue = parseFloat(inputElement.value);
        
        // 边界检查：开始时间不应大于结束时间
        if (property === 'startTime') {
            const endTime = parseFloat(this.propEndTime.value);
            if (currentTime > endTime) {
                // 自动调整结束时间
                this.propEndTime.value = currentTime + 5;
                console.log(`⚠️ 开始时间大于结束时间，自动调整结束时间为 ${currentTime + 5}s`);
            }
        } else if (property === 'endTime') {
            const startTime = parseFloat(this.propStartTime.value);
            if (currentTime < startTime) {
                console.warn(`⚠️ 结束时间 ${currentTime}s 小于开始时间 ${startTime}s`);
                // 提示用户但仍然允许设置
            }
        }
        
        // 更新输入框
        inputElement.value = currentTime;
        
        // 视觉反馈：按钮闪烁效果
        const button = property === 'startTime' ? this.setStartTimeBtn : this.setEndTimeBtn;
        if (button) {
            button.style.transform = 'scale(1.2)';
            button.style.background = 'rgba(76, 175, 80, 0.6)';
            setTimeout(() => {
                button.style.transform = '';
                button.style.background = '';
            }, 200);
        }
        
        // 使用命令模式更新属性
        if (oldValue !== currentTime) {
            this.updatePropertyWithCommand(property, oldValue, currentTime);
        }
        
        console.log(`📍 设置${property === 'startTime' ? '开始' : '结束'}时间: ${currentTime}s`);
    }
    
    /**
     * 跳转到指定时间（双击时间输入框时触发）
     */
    jumpToTime(time) {
        const video = document.getElementById('video');
        if (!video) {
            console.warn('⚠️ 视频元素未找到');
            return;
        }
        
        if (isNaN(time) || time < 0) {
            console.warn('⚠️ 无效的时间值:', time);
            return;
        }
        
        video.currentTime = time;
        console.log(`⏩ 跳转到时间: ${time}s`);
        
        // 视觉反馈：高亮输入框
        const inputs = [this.propStartTime, this.propEndTime];
        inputs.forEach(input => {
            if (input && parseFloat(input.value) === time) {
                input.style.background = 'rgba(76, 175, 80, 0.3)';
                setTimeout(() => {
                    input.style.background = '';
                }, 500);
            }
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
