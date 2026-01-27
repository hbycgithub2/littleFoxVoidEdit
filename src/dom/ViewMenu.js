// src/dom/ViewMenu.js
// View 菜单控制器 - 统一管理所有信息面板和消息通知

export default class ViewMenu {
    constructor(options = {}) {
        this.toast = options.toast;
        this.statusBar = null;
        this.historyDisplay = null;
        this.shortcutDisplay = null;
        this.statusIndicator = null;
        this.historyVisualHelper = null;
        
        // 面板状态
        this.panelStates = {
            statusBar: true,
            statusIndicator: false,  // 默认隐藏
            history: false,  // 默认隐藏
            shortcuts: false,  // 默认隐藏
            historyVisual: false,  // 默认隐藏
            timeline: true,
            layers: true,
            properties: true,
            styles: true
        };
        
        this.init();
        this.loadStates();
    }
    
    init() {
        console.log('🎯 ViewMenu 初始化开始');
        this.createViewButton();
        this.createDropdownMenu();
        this.bindEvents();
        console.log('✅ ViewMenu 初始化完成');
    }
    
    /**
     * 设置场景相关的面板引用
     */
    setScenePanels(statusBar, historyDisplay, shortcutDisplay, statusIndicator, historyVisualHelper) {
        console.log('🔗 设置场景面板引用:', {
            statusBar: !!statusBar,
            historyDisplay: !!historyDisplay,
            shortcutDisplay: !!shortcutDisplay,
            statusIndicator: !!statusIndicator,
            historyVisualHelper: !!historyVisualHelper
        });
        
        this.statusBar = statusBar;
        this.historyDisplay = historyDisplay;
        this.shortcutDisplay = shortcutDisplay;
        this.statusIndicator = statusIndicator;
        this.historyVisualHelper = historyVisualHelper;
        
        // 同步初始状态
        this.syncPanelStates();
        
        // 更新菜单显示
        this.updateMenuStates();
        
        console.log('✅ 面板状态已同步:', this.panelStates);
    }
    
    /**
     * 创建 View 按钮
     */
    createViewButton() {
        // 直接获取 HTML 中已有的按钮
        this.viewBtn = document.getElementById('viewMenuBtn');
        
        if (!this.viewBtn) {
            console.error('❌ 找不到 viewMenuBtn 元素');
            return;
        }
        
        console.log('✅ View 按钮已找到:', this.viewBtn);
    }
    
    /**
     * 创建下拉菜单
     */
    createDropdownMenu() {
        console.log('📋 创建下拉菜单');
        
        this.dropdown = document.createElement('div');
        this.dropdown.id = 'viewDropdown';
        this.dropdown.className = 'view-dropdown';
        this.dropdown.style.display = 'none';
        
        // 面板管理部分
        this.dropdown.innerHTML = `
            <div class="view-menu-section">
                <div class="view-menu-title">📊 Panels</div>
                <div class="view-menu-item" data-action="toggle-statusbar">
                    <span class="view-checkbox">☑</span> Drawing Status Bar
                </div>
                <div class="view-menu-item" data-action="toggle-statusindicator">
                    <span class="view-checkbox">☑</span> Status Info (J)
                </div>
                <div class="view-menu-item" data-action="toggle-history">
                    <span class="view-checkbox">☑</span> Drawing History (K)
                </div>
                <div class="view-menu-item" data-action="toggle-shortcuts">
                    <span class="view-checkbox">☑</span> Shortcut Hints (H)
                </div>
                <div class="view-menu-item" data-action="toggle-historyvisual">
                    <span class="view-checkbox">☑</span> History Record (H)
                </div>
                <div class="view-menu-item" data-action="toggle-timeline">
                    <span class="view-checkbox">☑</span> Timeline
                </div>
                <div class="view-menu-item" data-action="toggle-layers">
                    <span class="view-checkbox">☑</span> Layers
                </div>
                <div class="view-menu-item" data-action="toggle-properties">
                    <span class="view-checkbox">☑</span> Properties
                </div>
                <div class="view-menu-item" data-action="toggle-styles">
                    <span class="view-checkbox">☑</span> Styles
                </div>
            </div>
            
            <div class="view-menu-divider"></div>
            
            <div class="view-menu-section">
                <div class="view-menu-title">💬 Notifications</div>
                <div class="view-menu-item" data-action="show-success">
                    💾 Show Success
                </div>
                <div class="view-menu-item" data-action="show-info">
                    ℹ️ Show Info
                </div>
                <div class="view-menu-item" data-action="show-warning">
                    ⚠️ Show Warning
                </div>
                <div class="view-menu-item" data-action="show-error">
                    ❌ Show Error
                </div>
                <div class="view-menu-item" data-action="clear-all">
                    🗑️ Clear All Messages
                </div>
            </div>
            
            <div class="view-menu-divider"></div>
            
            <div class="view-menu-item" data-action="reset-layout">
                🔄 Reset Layout
            </div>
        `;
        
        document.body.appendChild(this.dropdown);
        console.log('✅ 下拉菜单已创建并添加到 body:', this.dropdown);
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        console.log('🔗 绑定事件');
        
        // View 按钮点击
        this.viewBtn.addEventListener('click', (e) => {
            console.log('🖱️ View 按钮被点击');
            e.stopPropagation();
            this.toggleDropdown();
        });
        
        // 菜单项点击
        this.dropdown.addEventListener('click', (e) => {
            const item = e.target.closest('.view-menu-item');
            if (!item) return;
            
            const action = item.dataset.action;
            this.handleAction(action);
            
            // 切换面板时不关闭菜单，其他操作关闭菜单
            if (!action.startsWith('toggle-')) {
                this.hideDropdown();
            }
        });
        
        // 点击外部关闭菜单
        document.addEventListener('click', (e) => {
            if (!this.dropdown.contains(e.target) && e.target !== this.viewBtn) {
                this.hideDropdown();
            }
        });
    }
    
    /**
     * 切换下拉菜单
     */
    toggleDropdown() {
        console.log('🔄 切换下拉菜单，当前状态:', this.dropdown.style.display);
        if (this.dropdown.style.display === 'none') {
            this.showDropdown();
        } else {
            this.hideDropdown();
        }
    }
    
    /**
     * 显示下拉菜单
     */
    showDropdown() {
        console.log('👁️ 显示下拉菜单');
        
        // 更新菜单状态
        this.updateMenuStates();
        
        // 定位菜单
        const rect = this.viewBtn.getBoundingClientRect();
        this.dropdown.style.top = (rect.bottom + 5) + 'px';
        this.dropdown.style.right = (window.innerWidth - rect.right) + 'px';
        this.dropdown.style.display = 'block';
        
        console.log('📍 菜单位置:', {
            top: this.dropdown.style.top,
            right: this.dropdown.style.right,
            display: this.dropdown.style.display
        });
    }
    
    /**
     * 隐藏下拉菜单
     */
    hideDropdown() {
        this.dropdown.style.display = 'none';
    }
    
    /**
     * 处理菜单操作
     */
    handleAction(action) {
        switch (action) {
            // 面板切换
            case 'toggle-statusbar':
                this.togglePanel('statusBar');
                break;
            case 'toggle-statusindicator':
                this.togglePanel('statusIndicator');
                break;
            case 'toggle-history':
                this.togglePanel('history');
                break;
            case 'toggle-shortcuts':
                this.togglePanel('shortcuts');
                break;
            case 'toggle-historyvisual':
                this.togglePanel('historyVisual');
                break;
            case 'toggle-timeline':
                this.togglePanel('timeline');
                break;
            case 'toggle-layers':
                this.togglePanel('layers');
                break;
            case 'toggle-properties':
                this.togglePanel('properties');
                break;
            case 'toggle-styles':
                this.togglePanel('styles');
                break;
            
            // 消息通知
            case 'show-success':
                this.toast?.success('操作成功！这是一个成功消息示例');
                break;
            case 'show-info':
                this.toast?.info('这是一个信息消息示例');
                break;
            case 'show-warning':
                this.toast?.warning('这是一个警告消息示例');
                break;
            case 'show-error':
                this.toast?.error('这是一个错误消息示例');
                break;
            case 'clear-all':
                this.toast?.clearAll();
                break;
            
            // 布局管理
            case 'reset-layout':
                this.resetLayout();
                break;
        }
    }
    
    /**
     * 切换面板显示
     */
    togglePanel(panelName) {
        console.log('🔄 切换面板:', panelName, '当前状态:', this.panelStates[panelName]);
        
        this.panelStates[panelName] = !this.panelStates[panelName];
        const isVisible = this.panelStates[panelName];
        
        console.log('➡️ 新状态:', isVisible);
        
        // 应用到实际面板
        switch (panelName) {
            case 'statusBar':
                console.log('statusBar 引用:', !!this.statusBar);
                if (this.statusBar) {
                    this.statusBar.background.setVisible(isVisible);
                    this.statusBar.statusText.setVisible(isVisible);
                }
                break;
            case 'statusIndicator':
                console.log('statusIndicator 引用:', !!this.statusIndicator);
                if (this.statusIndicator) {
                    isVisible ? this.statusIndicator.show() : this.statusIndicator.hide();
                }
                break;
            case 'history':
                console.log('historyDisplay 引用:', !!this.historyDisplay);
                if (this.historyDisplay) {
                    isVisible ? this.historyDisplay.show() : this.historyDisplay.hide();
                }
                break;
            case 'shortcuts':
                console.log('shortcutDisplay 引用:', !!this.shortcutDisplay);
                if (this.shortcutDisplay) {
                    isVisible ? this.shortcutDisplay.show() : this.shortcutDisplay.hide();
                }
                break;
            case 'historyVisual':
                console.log('historyVisualHelper 引用:', !!this.historyVisualHelper);
                if (this.historyVisualHelper) {
                    isVisible ? this.historyVisualHelper.show() : this.historyVisualHelper.hide();
                }
                break;
            case 'timeline':
                const timeline = document.getElementById('timelinePanel');
                if (timeline) timeline.style.display = isVisible ? 'block' : 'none';
                break;
            case 'layers':
                const layers = document.getElementById('layerPanel');
                if (layers) layers.style.display = isVisible ? 'block' : 'none';
                break;
            case 'properties':
                const properties = document.getElementById('propertyPanel');
                if (properties && properties.style.display !== 'none') {
                    properties.style.display = isVisible ? 'block' : 'none';
                }
                break;
            case 'styles':
                const styles = document.getElementById('stylePanel');
                if (styles) styles.style.display = isVisible ? 'block' : 'none';
                break;
        }
        
        // 保存状态
        this.saveStates();
        
        // 更新菜单显示
        this.updateMenuStates();
    }
    
    /**
     * 更新菜单状态显示
     */
    updateMenuStates() {
        const items = this.dropdown.querySelectorAll('[data-action^="toggle-"]');
        items.forEach(item => {
            const action = item.dataset.action;
            const panelName = action.replace('toggle-', '');
            const checkbox = item.querySelector('.view-checkbox');
            if (checkbox) {
                checkbox.textContent = this.panelStates[panelName] ? '☑' : '☐';
            }
        });
    }
    
    /**
     * 同步面板状态
     */
    syncPanelStates() {
        console.log('🔄 同步面板状态');
        
        // 从实际面板同步状态
        if (this.statusBar) {
            this.panelStates.statusBar = this.statusBar.background.visible;
            console.log('  statusBar:', this.panelStates.statusBar);
        }
        if (this.statusIndicator) {
            this.panelStates.statusIndicator = this.statusIndicator.isVisible;
            console.log('  statusIndicator:', this.panelStates.statusIndicator);
        }
        if (this.historyDisplay) {
            this.panelStates.history = this.historyDisplay.isVisible;
            console.log('  history:', this.panelStates.history);
        }
        if (this.shortcutDisplay) {
            this.panelStates.shortcuts = this.shortcutDisplay.visible;
            console.log('  shortcuts:', this.panelStates.shortcuts);
        }
        if (this.historyVisualHelper) {
            this.panelStates.historyVisual = this.historyVisualHelper.isVisible;
            console.log('  historyVisual:', this.panelStates.historyVisual);
        }
        
        console.log('✅ 面板状态已同步:', this.panelStates);
    }
    
    /**
     * 重置布局
     */
    resetLayout() {
        // 重置所有面板到默认位置
        if (this.historyDisplay?.panel) {
            this.historyDisplay.panel.panel.style.left = '10px';
            this.historyDisplay.panel.panel.style.top = (window.innerHeight - 200) + 'px';
        }
        
        if (this.shortcutDisplay?.panel) {
            this.shortcutDisplay.panel.panel.style.left = (window.innerWidth - 220) + 'px';
            this.shortcutDisplay.panel.panel.style.top = '10px';
        }
        
        this.toast?.success('布局已重置');
    }
    
    /**
     * 保存状态到 LocalStorage
     */
    saveStates() {
        try {
            localStorage.setItem('viewMenuPanelStates', JSON.stringify(this.panelStates));
        } catch (e) {
            console.warn('无法保存面板状态:', e);
        }
    }
    
    /**
     * 从 LocalStorage 加载状态
     */
    loadStates() {
        try {
            const saved = localStorage.getItem('viewMenuPanelStates');
            if (saved) {
                this.panelStates = { ...this.panelStates, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.warn('无法加载面板状态:', e);
        }
    }
    
    /**
     * 销毁
     */
    destroy() {
        if (this.dropdown && this.dropdown.parentNode) {
            this.dropdown.parentNode.removeChild(this.dropdown);
        }
        if (this.viewBtn && this.viewBtn.parentNode) {
            this.viewBtn.parentNode.parentNode.removeChild(this.viewBtn.parentNode);
        }
    }
}
