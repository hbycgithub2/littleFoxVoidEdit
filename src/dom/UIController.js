// src/dom/UIController.js
// UI 控制器 - 管理工具栏、属性面板、热区列表

export default class UIController {
    constructor(game, toast, keyboard) {
        this.game = game;
        this.toast = toast;
        this.keyboard = keyboard;
        this.scene = null;  // 将在场景创建后设置
        
        this.setupElements();
        this.setupEvents();
        this.setupKeyboard();
    }
    
    /**
     * 设置场景（遵循 Phaser 3 标准）
     */
    setScene(scene) {
        this.scene = scene;
        this.setupSceneEvents(scene);
    }
    
    setupElements() {
        // 工具栏按钮
        this.toolButtons = document.querySelectorAll('.tool-btn');
        this.playBtn = document.getElementById('playBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.importBtn = document.getElementById('importBtn');
        this.undoBtn = document.getElementById('undoBtn');
        this.redoBtn = document.getElementById('redoBtn');
        
        // 对齐按钮
        this.alignLeftBtn = document.getElementById('alignLeftBtn');
        this.alignCenterHBtn = document.getElementById('alignCenterHBtn');
        this.alignRightBtn = document.getElementById('alignRightBtn');
        this.alignTopBtn = document.getElementById('alignTopBtn');
        this.alignCenterVBtn = document.getElementById('alignCenterVBtn');
        this.alignBottomBtn = document.getElementById('alignBottomBtn');
        this.distributeHBtn = document.getElementById('distributeHBtn');
        this.distributeVBtn = document.getElementById('distributeVBtn');
        
        // 分组按钮
        this.groupBtn = document.getElementById('groupBtn');
        this.ungroupBtn = document.getElementById('ungroupBtn');
        
        // 属性面板
        this.propertyPanel = document.getElementById('propertyPanel');
        this.propWord = document.getElementById('propWord');
        this.propStartTime = document.getElementById('propStartTime');
        this.propEndTime = document.getElementById('propEndTime');
        this.propColor = document.getElementById('propColor');
        this.deleteBtn = document.getElementById('deleteBtn');
        
        // 热区列表
        this.hotspotList = document.getElementById('hotspotListContent');
    }
    
    setupEvents() {
        // 工具栏按钮
        this.toolButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                this.setDrawMode(mode);
            });
        });
        
        // 播放控制
        if (this.playBtn) {
            this.playBtn.addEventListener('click', () => {
                this.game.events.emit('video:play');
            });
        }
        
        if (this.pauseBtn) {
            this.pauseBtn.addEventListener('click', () => {
                this.game.events.emit('video:pause');
            });
        }
        
        // 导出/导入
        if (this.exportBtn) {
            this.exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }
        
        if (this.importBtn) {
            this.importBtn.addEventListener('click', () => {
                this.importData();
            });
        }
        
        // 撤销/重做
        if (this.undoBtn) {
            this.undoBtn.addEventListener('click', () => {
                this.game.events.emit('history:undo');
            });
        }
        
        if (this.redoBtn) {
            this.redoBtn.addEventListener('click', () => {
                this.game.events.emit('history:redo');
            });
        }
        
        // 删除按钮
        if (this.deleteBtn) {
            this.deleteBtn.addEventListener('click', () => {
                this.game.events.emit('hotspot:delete');
            });
        }
        
        // 对齐按钮（遵循 Phaser 标准）
        if (this.alignLeftBtn) {
            this.alignLeftBtn.addEventListener('click', () => {
                if (this.scene && this.scene.alignmentManager) {
                    this.scene.alignmentManager.alignLeft();
                    this.toast.success('已左对齐');
                }
            });
        }
        
        if (this.alignCenterHBtn) {
            this.alignCenterHBtn.addEventListener('click', () => {
                if (this.scene && this.scene.alignmentManager) {
                    this.scene.alignmentManager.alignCenterH();
                    this.toast.success('已水平居中');
                }
            });
        }
        
        if (this.alignRightBtn) {
            this.alignRightBtn.addEventListener('click', () => {
                if (this.scene && this.scene.alignmentManager) {
                    this.scene.alignmentManager.alignRight();
                    this.toast.success('已右对齐');
                }
            });
        }
        
        if (this.alignTopBtn) {
            this.alignTopBtn.addEventListener('click', () => {
                if (this.scene && this.scene.alignmentManager) {
                    this.scene.alignmentManager.alignTop();
                    this.toast.success('已顶部对齐');
                }
            });
        }
        
        if (this.alignCenterVBtn) {
            this.alignCenterVBtn.addEventListener('click', () => {
                if (this.scene && this.scene.alignmentManager) {
                    this.scene.alignmentManager.alignCenterV();
                    this.toast.success('已垂直居中');
                }
            });
        }
        
        if (this.alignBottomBtn) {
            this.alignBottomBtn.addEventListener('click', () => {
                if (this.scene && this.scene.alignmentManager) {
                    this.scene.alignmentManager.alignBottom();
                    this.toast.success('已底部对齐');
                }
            });
        }
        
        if (this.distributeHBtn) {
            this.distributeHBtn.addEventListener('click', () => {
                if (this.scene && this.scene.alignmentManager) {
                    this.scene.alignmentManager.distributeH();
                    this.toast.success('已水平分布');
                }
            });
        }
        
        if (this.distributeVBtn) {
            this.distributeVBtn.addEventListener('click', () => {
                if (this.scene && this.scene.alignmentManager) {
                    this.scene.alignmentManager.distributeV();
                    this.toast.success('已垂直分布');
                }
            });
        }
        
        // 分组按钮（遵循 Phaser 标准）
        if (this.groupBtn) {
            this.groupBtn.addEventListener('click', () => {
                if (this.scene && this.scene.groupManager) {
                    const selected = this.scene.selectionManager.getSelected();
                    if (selected.length < 2) {
                        this.toast.error('至少选择 2 个热区才能创建分组');
                        return;
                    }
                    this.scene.groupManager.createGroup(selected);
                    this.toast.success(`已创建分组（${selected.length} 个热区）`);
                }
            });
        }
        
        if (this.ungroupBtn) {
            this.ungroupBtn.addEventListener('click', () => {
                if (this.scene && this.scene.groupManager) {
                    const selected = this.scene.selectionManager.getSelected();
                    let ungrouped = 0;
                    
                    selected.forEach(hotspot => {
                        if (hotspot.groupId) {
                            this.scene.groupManager.ungroupHotspots(hotspot.groupId);
                            ungrouped++;
                        }
                    });
                    
                    if (ungrouped > 0) {
                        this.toast.success('已解散分组');
                    } else {
                        this.toast.error('选中的热区不在任何分组中');
                    }
                }
            });
        }
        
        // 属性输入
        if (this.propWord) {
            this.propWord.addEventListener('input', (e) => {
                this.updateSelectedProperty('word', e.target.value);
            });
        }
        
        if (this.propStartTime) {
            this.propStartTime.addEventListener('input', (e) => {
                this.updateSelectedProperty('startTime', parseFloat(e.target.value));
            });
        }
        
        if (this.propEndTime) {
            this.propEndTime.addEventListener('input', (e) => {
                this.updateSelectedProperty('endTime', parseFloat(e.target.value));
            });
        }
        
        if (this.propColor) {
            this.propColor.addEventListener('input', (e) => {
                this.updateSelectedProperty('color', e.target.value);
            });
        }
        
        // 监听场景准备事件
        this.game.events.on('scene-ready', (scene) => {
            this.scene = scene;
            this.setupSceneEvents(scene);
        });
    }
    
    setupSceneEvents(scene) {
        // 监听选择变化
        scene.events.on('selection:changed', (data) => {
            this.updatePropertyPanel(data);
            this.updateHotspotList();
        });
        
        // 监听热区变化
        scene.events.on('hotspot:added', () => {
            this.updateHotspotList();
        });
        
        scene.events.on('hotspot:removed', () => {
            this.updateHotspotList();
        });
        
        // 监听历史变化
        scene.events.on('history:changed', (data) => {
            this.updateHistoryButtons(data);
        });
        
        // 监听 registry 变化
        scene.registry.events.on('changedata', (_parent, key, _value) => {
            if (key === 'hotspots') {
                this.updateHotspotList();
            }
        });
    }
    
    setupKeyboard() {
        // 使用 KeyboardManager 注册快捷键（优先级 4）
        if (this.keyboard) {
            // Ctrl+Z 撤销
            this.keyboard.register('Ctrl+Z', () => {
                this.game.events.emit('history:undo');
            }, '撤销');
            
            // Ctrl+Shift+Z 或 Ctrl+Y 重做
            this.keyboard.register('Ctrl+Shift+Z', () => {
                this.game.events.emit('history:redo');
            }, '重做');
            
            this.keyboard.register('Ctrl+Y', () => {
                this.game.events.emit('history:redo');
            }, '重做');
            
            // Ctrl+C 复制
            this.keyboard.register('Ctrl+C', () => {
                this.game.events.emit('hotspot:copy');
                if (this.toast) this.toast.info('已复制选中的热区');
            }, '复制');
            
            // Ctrl+V 粘贴
            this.keyboard.register('Ctrl+V', () => {
                this.game.events.emit('hotspot:paste');
            }, '粘贴');
            
            // Ctrl+A 全选（优先级 4）
            this.keyboard.register('Ctrl+A', () => {
                if (this.scene) {
                    this.scene.hotspots.forEach(hotspot => {
                        this.scene.selectionManager.select(hotspot, true);
                    });
                    if (this.toast) {
                        this.toast.info(`已选中 ${this.scene.hotspots.length} 个热区`);
                    }
                }
            }, '全选');
            
            // Ctrl+D 取消选择（优先级 4）
            this.keyboard.register('Ctrl+D', () => {
                if (this.scene) {
                    this.scene.selectionManager.clearSelection();
                    if (this.toast) this.toast.info('已取消选择');
                }
            }, '取消选择');
            
            // Ctrl+G 创建分组
            this.keyboard.register('Ctrl+G', () => {
                if (this.scene && this.scene.groupManager) {
                    const selected = this.scene.selectionManager.getSelected();
                    if (selected.length < 2) {
                        if (this.toast) this.toast.error('至少选择 2 个热区才能创建分组');
                        return;
                    }
                    this.scene.groupManager.createGroup(selected);
                    if (this.toast) this.toast.success(`已创建分组（${selected.length} 个热区）`);
                }
            }, '创建分组');
            
            // Ctrl+Shift+G 解散分组
            this.keyboard.register('Ctrl+Shift+G', () => {
                if (this.scene && this.scene.groupManager) {
                    const selected = this.scene.selectionManager.getSelected();
                    let ungrouped = 0;
                    
                    selected.forEach(hotspot => {
                        if (hotspot.groupId) {
                            this.scene.groupManager.ungroupHotspots(hotspot.groupId);
                            ungrouped++;
                        }
                    });
                    
                    if (ungrouped > 0) {
                        if (this.toast) this.toast.success('已解散分组');
                    } else {
                        if (this.toast) this.toast.error('选中的热区不在任何分组中');
                    }
                }
            }, '解散分组');
            
            // Ctrl+S 保存（导出）（优先级 4）
            this.keyboard.register('Ctrl+S', () => {
                this.exportData();
            }, '保存');
            
            // Ctrl+O 打开（导入）（优先级 4）
            this.keyboard.register('Ctrl+O', () => {
                this.importData();
            }, '打开');
            
            // Space 播放/暂停（优先级 4）
            this.keyboard.register('Space', () => {
                const video = document.getElementById('video');
                if (video) {
                    if (video.paused) {
                        this.game.events.emit('video:play');
                    } else {
                        this.game.events.emit('video:pause');
                    }
                }
            }, '播放/暂停');
            
            // ESC 取消绘制模式
            this.keyboard.register('Escape', () => {
                this.setDrawMode(null);
                if (this.toast) this.toast.info('已取消绘制模式');
            }, '取消');
            
            // Ctrl+H 切换选择指示器显示（遵循 Phaser 官方标准）
            this.keyboard.register('Ctrl+H', () => {
                if (this.scene) {
                    const current = this.scene.registry.get('showSelectionIndicator') ?? false;
                    this.scene.registry.set('showSelectionIndicator', !current);
                    
                    // 触发更新
                    this.scene.selectionManager.emitChange();
                    
                    if (this.toast) {
                        this.toast.info(current ? '已隐藏选择指示器' : '已显示选择指示器');
                    }
                }
            }, '切换选择指示器');
        }
        
        // 保留原有的 document 监听（作为备份）
        // 这里只处理 KeyboardManager 未处理的键
        // 目前所有快捷键都由 KeyboardManager 处理
    }
    
    setDrawMode(mode) {
        if (!this.scene) return;
        
        this.scene.registry.set('drawMode', mode);
        
        // 更新按钮状态
        this.toolButtons.forEach(btn => {
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // 发送绘制模式变化事件（用于动态切换层级）
        this.game.events.emit('drawMode:changed', mode);
    }
    
    updatePropertyPanel(data) {
        if (!this.propertyPanel) return;
        
        if (data.count === 0) {
            this.propertyPanel.style.display = 'none';
            return;
        }
        
        this.propertyPanel.style.display = 'block';
        
        if (data.count === 1) {
            // 单选：显示详细属性
            const hotspot = data.selected[0];
            if (this.propWord) this.propWord.value = hotspot.config.word || '';
            if (this.propStartTime) this.propStartTime.value = hotspot.config.startTime;
            if (this.propEndTime) this.propEndTime.value = hotspot.config.endTime;
            if (this.propColor) this.propColor.value = hotspot.config.color || '#00ff00';
            
            if (this.propWord) this.propWord.disabled = false;
        } else {
            // 多选：显示提示
            if (this.propWord) {
                this.propWord.value = `已选中 ${data.count} 个热区`;
                this.propWord.disabled = true;
            }
        }
    }
    
    updateSelectedProperty(property, value) {
        if (!this.scene) return;
        
        const selected = this.scene.selectionManager.getSelected();
        selected.forEach(hotspot => {
            hotspot.config[property] = value;
            
            // 如果是颜色，更新视觉
            if (property === 'color') {
                hotspot.updateVisual();
            }
        });
        
        this.scene.syncToRegistry();
    }
    
    updateHotspotList() {
        if (!this.scene || !this.hotspotList) return;
        
        const hotspots = this.scene.registry.get('hotspots');
        this.hotspotList.innerHTML = '';
        
        hotspots.forEach((config, index) => {
            const item = document.createElement('div');
            item.className = 'hotspot-item';
            item.textContent = `${index + 1}. ${config.shape} - ${config.word || '未命名'}`;
            
            item.onclick = () => {
                const hotspot = this.scene.hotspots.find(h => h.config.id === config.id);
                if (hotspot) {
                    this.scene.selectionManager.select(hotspot, false);
                }
            };
            
            this.hotspotList.appendChild(item);
        });
    }
    
    updateHistoryButtons(data) {
        if (this.undoBtn) {
            this.undoBtn.disabled = !data.canUndo;
        }
        if (this.redoBtn) {
            this.redoBtn.disabled = !data.canRedo;
        }
    }
    
    exportData() {
        if (!this.scene) return;
        
        try {
            const hotspots = this.scene.registry.get('hotspots');
            const data = {
                version: '1.0',
                hotspots: hotspots
            };
            
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'hotspots.json';
            a.click();
            
            URL.revokeObjectURL(url);
            
            console.log('数据导出成功');
            if (this.toast) {
                this.toast.success('数据导出成功');
            }
        } catch (error) {
            console.error('导出失败:', error);
            if (this.toast) {
                this.toast.error('导出失败：' + error.message);
            }
        }
    }
    
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    this.game.events.emit('data:import', data);
                    if (this.toast) {
                        this.toast.success('数据导入成功');
                    }
                } catch (error) {
                    console.error('导入失败:', error);
                    if (this.toast) {
                        this.toast.error('导入失败：' + error.message);
                    }
                }
            };
            
            reader.onerror = () => {
                if (this.toast) {
                    this.toast.error('文件读取失败');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }
}
