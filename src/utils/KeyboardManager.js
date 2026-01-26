// src/utils/KeyboardManager.js
// 快捷键管理器 - 用户体验优化（优先级 4）

export default class KeyboardManager {
    constructor(game) {
        this.game = game;
        this.shortcuts = new Map();
        this.enabled = true;
        
        this.setupGlobalListener();
    }
    
    /**
     * 设置全局键盘监听
     * @private
     */
    setupGlobalListener() {
        document.addEventListener('keydown', (e) => {
            if (!this.enabled) return;
            
            const key = this.getKeyString(e);
            const handler = this.shortcuts.get(key);
            
            if (handler) {
                e.preventDefault();
                handler(e);
            }
        });
    }
    
    /**
     * 注册快捷键
     * @param {string} key - 快捷键（如 'Ctrl+S', 'Space', 'Delete'）
     * @param {function} handler - 处理函数
     * @param {string} description - 描述
     */
    register(key, handler, description = '') {
        const normalizedKey = this.normalizeKey(key);
        this.shortcuts.set(normalizedKey, handler);
        
        console.log(`快捷键已注册: ${normalizedKey}${description ? ' - ' + description : ''}`);
    }
    
    /**
     * 取消注册快捷键
     * @param {string} key - 快捷键
     */
    unregister(key) {
        const normalizedKey = this.normalizeKey(key);
        this.shortcuts.delete(normalizedKey);
    }
    
    /**
     * 获取按键字符串
     * @private
     */
    getKeyString(event) {
        const parts = [];
        
        if (event.ctrlKey || event.metaKey) parts.push('Ctrl');
        if (event.shiftKey) parts.push('Shift');
        if (event.altKey) parts.push('Alt');
        
        // 特殊键
        const specialKeys = {
            ' ': 'Space',
            'Delete': 'Delete',
            'Backspace': 'Backspace',
            'Enter': 'Enter',
            'Escape': 'Escape',
            'Tab': 'Tab',
            'ArrowUp': 'ArrowUp',
            'ArrowDown': 'ArrowDown',
            'ArrowLeft': 'ArrowLeft',
            'ArrowRight': 'ArrowRight'
        };
        
        const key = specialKeys[event.key] || event.key.toUpperCase();
        parts.push(key);
        
        return parts.join('+');
    }
    
    /**
     * 标准化快捷键字符串
     * @private
     */
    normalizeKey(key) {
        return key
            .split('+')
            .map(k => k.trim())
            .map(k => {
                // 统一 Command 和 Ctrl
                if (k === 'Command' || k === 'Cmd' || k === 'Meta') {
                    return 'Ctrl';
                }
                return k;
            })
            .join('+');
    }
    
    /**
     * 启用快捷键
     */
    enable() {
        this.enabled = true;
    }
    
    /**
     * 禁用快捷键
     */
    disable() {
        this.enabled = false;
    }
    
    /**
     * 获取所有已注册的快捷键
     */
    getShortcuts() {
        return Array.from(this.shortcuts.keys());
    }
    
    /**
     * 清除所有快捷键
     */
    clear() {
        this.shortcuts.clear();
    }
}
