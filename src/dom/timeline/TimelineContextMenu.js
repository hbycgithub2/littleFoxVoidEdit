// src/dom/timeline/TimelineContextMenu.js
// 时间轴右键菜单控制器 - 管理时间条的上下文菜单

/**
 * 时间轴右键菜单控制器
 * 职责：
 * 1. 创建和管理右键菜单 DOM
 * 2. 根据点击位置显示不同菜单项
 * 3. 处理菜单项点击事件
 * 4. 发送 Phaser 事件通知场景
 */
export default class TimelineContextMenu {
    constructor(timelinePanel) {
        this.timeline = timelinePanel;
        this.scene = timelinePanel.scene;
        
        // 菜单状态
        this.isVisible = false;
        this.targetHotspot = null;
        
        // 创建菜单 DOM
        this.createMenu();
    }
    
    /**
     * 创建菜单 DOM 元素
     */
    createMenu() {
        // 创建菜单容器
        this.menuElement = document.createElement('div');
        this.menuElement.className = 'timeline-context-menu';
        this.menuElement.style.cssText = `
            position: fixed;
            background: #2a2a2a;
            border: 1px solid #444;
            border-radius: 4px;
            padding: 4px 0;
            min-width: 150px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            z-index: 10000;
            display: none;
            font-family: Arial, sans-serif;
            font-size: 13px;
        `;
        
        // 添加到 body
        document.body.appendChild(this.menuElement);
        
        // 点击其他地方关闭菜单
        document.addEventListener('click', () => this.hide());
        
        // 阻止菜单内部点击冒泡
        this.menuElement.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    /**
     * 显示菜单
     * @param {number} x - 屏幕 X 坐标
     * @param {number} y - 屏幕 Y 坐标
     * @param {object} hotspot - 热区配置对象
     */
    show(x, y, hotspot) {
        this.targetHotspot = hotspot;
        
        // 清空菜单
        this.menuElement.innerHTML = '';
        
        // 根据是否有热区显示不同菜单
        if (hotspot) {
            this.buildHotspotMenu();
        } else {
            this.buildEmptyMenu();
        }
        
        // 定位菜单
        this.menuElement.style.left = `${x}px`;
        this.menuElement.style.top = `${y}px`;
        this.menuElement.style.display = 'block';
        
        // 边界检查（防止菜单超出屏幕）
        const rect = this.menuElement.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            this.menuElement.style.left = `${window.innerWidth - rect.width - 10}px`;
        }
        if (rect.bottom > window.innerHeight) {
            this.menuElement.style.top = `${window.innerHeight - rect.height - 10}px`;
        }
        
        this.isVisible = true;
    }
    
    /**
     * 隐藏菜单
     */
    hide() {
        this.menuElement.style.display = 'none';
        this.isVisible = false;
        this.targetHotspot = null;
    }
    
    /**
     * 构建热区菜单（右键点击热区时）
     */
    buildHotspotMenu() {
        const items = [
            { label: '删除', icon: '🗑️', action: 'delete', shortcut: 'Delete' },
            { label: '复制', icon: '📋', action: 'copy', shortcut: 'Ctrl+C' },
            { label: '剪切', icon: '✂️', action: 'cut', shortcut: 'Ctrl+X' },
            { type: 'separator' },
            { label: '分割', icon: '✂️', action: 'split', shortcut: '' },
            { type: 'separator' },
            { label: '跳转到开始', icon: '⏩', action: 'jumpToStart', shortcut: '' },
            { label: '跳转到结束', icon: '⏭️', action: 'jumpToEnd', shortcut: '' },
            { label: '播放此片段', icon: '🔁', action: 'playSegment', shortcut: '' },
            { type: 'separator' },
            { label: '复制时间范围', icon: '📋', action: 'copyTimeRange', shortcut: 'Ctrl+Shift+C' },
            { label: '粘贴时间范围', icon: '📌', action: 'pasteTimeRange', shortcut: 'Ctrl+Shift+V' },
            { type: 'separator' },
            { label: '属性', icon: '⚙️', action: 'properties', shortcut: '' }
        ];
        
        items.forEach(item => {
            if (item.type === 'separator') {
                this.addSeparator();
            } else {
                this.addMenuItem(item);
            }
        });
    }
    
    /**
     * 构建空白区域菜单（右键点击空白处时）
     */
    buildEmptyMenu() {
        const items = [
            { label: '粘贴', icon: '📋', action: 'paste', shortcut: 'Ctrl+V' },
            { type: 'separator' },
            { label: '全选', icon: '☑️', action: 'selectAll', shortcut: 'Ctrl+A' }
        ];
        
        items.forEach(item => {
            if (item.type === 'separator') {
                this.addSeparator();
            } else {
                this.addMenuItem(item);
            }
        });
    }
    
    /**
     * 添加菜单项
     * @param {object} item - 菜单项配置
     */
    addMenuItem(item) {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.style.cssText = `
            padding: 8px 16px;
            cursor: pointer;
            color: #ddd;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: background 0.1s;
        `;
        
        // 左侧：图标 + 标签
        const leftPart = document.createElement('span');
        leftPart.innerHTML = `${item.icon} ${item.label}`;
        menuItem.appendChild(leftPart);
        
        // 右侧：快捷键
        if (item.shortcut) {
            const shortcut = document.createElement('span');
            shortcut.textContent = item.shortcut;
            shortcut.style.cssText = `
                color: #888;
                font-size: 11px;
                margin-left: 20px;
            `;
            menuItem.appendChild(shortcut);
        }
        
        // 悬停效果
        menuItem.addEventListener('mouseenter', () => {
            menuItem.style.background = '#3a3a3a';
        });
        menuItem.addEventListener('mouseleave', () => {
            menuItem.style.background = 'transparent';
        });
        
        // 点击事件
        menuItem.addEventListener('click', () => {
            this.handleMenuAction(item.action);
            this.hide();
        });
        
        this.menuElement.appendChild(menuItem);
    }
    
    /**
     * 添加分隔线
     */
    addSeparator() {
        const separator = document.createElement('div');
        separator.style.cssText = `
            height: 1px;
            background: #444;
            margin: 4px 0;
        `;
        this.menuElement.appendChild(separator);
    }
    
    /**
     * 处理菜单动作
     * @param {string} action - 动作类型
     */
    handleMenuAction(action) {
        if (!this.scene) return;
        
        switch (action) {
            case 'delete':
                this.handleDelete();
                break;
            case 'copy':
                this.handleCopy();
                break;
            case 'cut':
                this.handleCut();
                break;
            case 'split':
                this.handleSplit();
                break;
            case 'jumpToStart':
                this.handleJumpToStart();
                break;
            case 'jumpToEnd':
                this.handleJumpToEnd();
                break;
            case 'playSegment':
                this.handlePlaySegment();
                break;
            case 'copyTimeRange':
                this.handleCopyTimeRange();
                break;
            case 'pasteTimeRange':
                this.handlePasteTimeRange();
                break;
            case 'properties':
                this.handleProperties();
                break;
            case 'paste':
                this.handlePaste();
                break;
            case 'selectAll':
                this.handleSelectAll();
                break;
        }
    }
    
    /**
     * 删除热区
     */
    handleDelete() {
        if (!this.targetHotspot) return;
        
        // 如果有多选，删除所有选中的热区
        const selectedIds = this.timeline.selectionController.getSelectedIds();
        if (selectedIds.length > 0) {
            this.timeline.selectionController.deleteSelected();
        } else {
            // 否则只删除当前热区
            this.scene.removeHotspot(this.targetHotspot.id);
        }
        
        // 发送事件（遵循 Phaser 标准）
        this.scene.events.emit('timeline:contextmenu:delete', {
            hotspotId: this.targetHotspot.id
        });
    }
    
    /**
     * 复制热区
     */
    handleCopy() {
        if (!this.targetHotspot) return;
        
        // 获取选中的热区（如果有多选）
        const selectedIds = this.timeline.selectionController.getSelectedIds();
        const hotspots = this.scene.registry.get('hotspots') || [];
        
        let copyData;
        if (selectedIds.length > 0) {
            // 复制所有选中的热区
            copyData = hotspots.filter(h => selectedIds.includes(h.id));
        } else {
            // 复制当前热区
            copyData = [this.targetHotspot];
        }
        
        // 保存到剪贴板（使用 scene.registry）
        this.scene.registry.set('clipboard', {
            type: 'hotspots',
            data: copyData.map(h => ({ ...h })), // 深拷贝
            action: 'copy'
        });
        
        // 发送事件
        this.scene.events.emit('timeline:contextmenu:copy', {
            count: copyData.length
        });
    }
    
    /**
     * 剪切热区
     */
    handleCut() {
        if (!this.targetHotspot) return;
        
        // 先复制
        this.handleCopy();
        
        // 修改剪贴板动作为剪切
        const clipboard = this.scene.registry.get('clipboard');
        if (clipboard) {
            clipboard.action = 'cut';
            this.scene.registry.set('clipboard', clipboard);
        }
        
        // 删除热区
        const selectedIds = this.timeline.selectionController.getSelectedIds();
        if (selectedIds.length > 0) {
            this.timeline.selectionController.deleteSelected();
        } else {
            this.scene.removeHotspot(this.targetHotspot.id);
        }
        
        // 发送事件
        this.scene.events.emit('timeline:contextmenu:cut', {
            hotspotId: this.targetHotspot.id
        });
    }
    
    /**
     * 分割热区（在当前时间点）
     */
    handleSplit() {
        if (!this.targetHotspot) return;
        
        const currentTime = this.timeline.currentTime;
        const hotspot = this.targetHotspot;
        
        // 检查当前时间是否在热区范围内
        if (currentTime <= hotspot.startTime || currentTime >= hotspot.endTime) {
            console.warn('当前时间不在热区范围内，无法分割');
            return;
        }
        
        // 创建第二个热区（分割后的部分）
        const newHotspot = {
            ...hotspot,
            id: `hotspot_${Date.now()}`,
            startTime: currentTime,
            endTime: hotspot.endTime
        };
        
        // 修改原热区的结束时间
        hotspot.endTime = currentTime;
        
        // 更新原热区
        const originalHotspot = this.scene.hotspots.find(h => h.config.id === hotspot.id);
        if (originalHotspot) {
            originalHotspot.config.endTime = currentTime;
        }
        
        // 添加新热区
        this.scene.addHotspot(newHotspot);
        
        // 同步到 registry
        this.scene.syncToRegistry();
        
        // 发送事件
        this.scene.events.emit('timeline:contextmenu:split', {
            originalId: hotspot.id,
            newId: newHotspot.id,
            splitTime: currentTime
        });
    }
    
    /**
     * 显示属性面板
     */
    handleProperties() {
        if (!this.targetHotspot) return;
        
        // 发送事件，让主场景处理属性面板显示
        this.scene.events.emit('timeline:contextmenu:properties', {
            hotspotId: this.targetHotspot.id
        });
    }
    
    /**
     * 粘贴热区
     */
    handlePaste() {
        const clipboard = this.scene.registry.get('clipboard');
        if (!clipboard || clipboard.type !== 'hotspots') {
            console.warn('剪贴板为空或类型不匹配');
            return;
        }
        
        const currentTime = this.timeline.currentTime;
        
        // 粘贴所有热区
        clipboard.data.forEach((hotspotData, index) => {
            const duration = hotspotData.endTime - hotspotData.startTime;
            const newHotspot = {
                ...hotspotData,
                id: `hotspot_${Date.now()}_${index}`,
                startTime: currentTime + index * 0.1, // 稍微错开时间
                endTime: currentTime + index * 0.1 + duration
            };
            
            this.scene.addHotspot(newHotspot);
        });
        
        // 如果是剪切操作，清空剪贴板
        if (clipboard.action === 'cut') {
            this.scene.registry.set('clipboard', null);
        }
        
        // 发送事件
        this.scene.events.emit('timeline:contextmenu:paste', {
            count: clipboard.data.length
        });
    }
    
    /**
     * 全选
     */
    handleSelectAll() {
        this.timeline.selectAll();
        
        // 发送事件
        this.scene.events.emit('timeline:contextmenu:selectAll');
    }
    
    /**
     * 跳转到热区开始时间（遵循 Phaser 标准）
     */
    handleJumpToStart() {
        if (!this.targetHotspot) return;
        
        // 使用 Phaser 事件系统跳转
        this.timeline.game.events.emit('video:seek', this.targetHotspot.startTime);
        
        // 发送事件
        this.scene.events.emit('timeline:contextmenu:jumpToStart', {
            hotspotId: this.targetHotspot.id,
            time: this.targetHotspot.startTime
        });
        
        // Toast 提示
        if (window.toast) {
            window.toast.info(`跳转到 ${this.targetHotspot.startTime.toFixed(1)}s`);
        }
    }
    
    /**
     * 跳转到热区结束时间（遵循 Phaser 标准）
     */
    handleJumpToEnd() {
        if (!this.targetHotspot) return;
        
        // 使用 Phaser 事件系统跳转
        this.timeline.game.events.emit('video:seek', this.targetHotspot.endTime);
        
        // 发送事件
        this.scene.events.emit('timeline:contextmenu:jumpToEnd', {
            hotspotId: this.targetHotspot.id,
            time: this.targetHotspot.endTime
        });
        
        // Toast 提示
        if (window.toast) {
            window.toast.info(`跳转到 ${this.targetHotspot.endTime.toFixed(1)}s`);
        }
    }
    
    /**
     * 播放热区片段（循环播放）（遵循 Phaser 标准）
     */
    handlePlaySegment() {
        if (!this.targetHotspot) return;
        
        // 使用 TimelineRangeController 设置循环播放区域
        this.timeline.rangeController.setRange(
            this.targetHotspot.startTime,
            this.targetHotspot.endTime
        );
        this.timeline.rangeController.startLoop();
        
        // 发送事件
        this.scene.events.emit('timeline:contextmenu:playSegment', {
            hotspotId: this.targetHotspot.id,
            startTime: this.targetHotspot.startTime,
            endTime: this.targetHotspot.endTime
        });
        
        // Toast 提示
        if (window.toast) {
            const duration = this.targetHotspot.endTime - this.targetHotspot.startTime;
            window.toast.success(`循环播放片段 (${duration.toFixed(1)}s)`);
        }
    }
    
    /**
     * 复制时间范围到剪贴板（遵循 Phaser 标准）
     */
    handleCopyTimeRange() {
        if (!this.targetHotspot) return;
        
        // 使用 TimelineRangeCopyController 复制时间范围
        if (this.timeline.rangeCopyController) {
            this.timeline.rangeCopyController.copySingleTimeRange(this.targetHotspot);
        } else {
            // 降级方案：直接复制文本
            const startTime = this.targetHotspot.startTime.toFixed(1);
            const endTime = this.targetHotspot.endTime.toFixed(1);
            const duration = (this.targetHotspot.endTime - this.targetHotspot.startTime).toFixed(1);
            const text = `开始: ${startTime}s | 结束: ${endTime}s | 时长: ${duration}s`;
            
            navigator.clipboard.writeText(text).then(() => {
                this.scene.events.emit('ui:showToast', {
                    message: '✓ 时间范围已复制',
                    duration: 2000,
                    color: '#4CAF50'
                });
            }).catch(err => {
                console.error('复制失败:', err);
            });
        }
        
        // 发送事件
        this.scene.events.emit('timeline:contextmenu:copyTimeRange', {
            hotspotId: this.targetHotspot.id
        });
    }
    
    /**
     * 粘贴时间范围（B7功能）
     */
    handlePasteTimeRange() {
        if (!this.timeline.rangeCopyController) {
            this.scene.events.emit('ui:showToast', {
                message: '⚠ 时间范围复制功能未初始化',
                duration: 2000,
                color: '#FF9800'
            });
            return;
        }
        
        // 粘贴到当前视频时间
        this.timeline.rangeCopyController.pasteTimeRanges();
        
        // 发送事件
        this.scene.events.emit('timeline:contextmenu:pasteTimeRange');
    }
    
    /**
     * 显示自定义菜单
     * @param {number} x - X 坐标
     * @param {number} y - Y 坐标
     * @param {Array} items - 菜单项数组
     */
    showCustomMenu(x, y, items) {
        this.hide();
        
        this.menuElement = this.createMenuElement(items);
        document.body.appendChild(this.menuElement);
        
        // 定位菜单
        this.positionMenu(x, y);
        
        // 发送事件
        this.scene.events.emit('timeline:contextmenu:shown', { x, y, custom: true });
    }
    
    /**
     * 清理资源
     */
    destroy() {
        if (this.menuElement && this.menuElement.parentNode) {
            this.menuElement.parentNode.removeChild(this.menuElement);
        }
        this.menuElement = null;
        this.targetHotspot = null;
        console.log('TimelineContextMenu destroyed');
    }
}
