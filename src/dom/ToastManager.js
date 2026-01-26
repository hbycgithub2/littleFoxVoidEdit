// src/dom/ToastManager.js
// Toast 提示管理器 - 用户体验优化（优先级 4）

export default class ToastManager {
    constructor() {
        this.container = null;
        this.toasts = [];
        this.maxToasts = 3;
        this.defaultDuration = 3000;
        
        this.createContainer();
    }
    
    /**
     * 创建 Toast 容器
     * @private
     */
    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(this.container);
    }
    
    /**
     * 显示 Toast
     * @param {string} message - 消息内容
     * @param {string} type - 类型（success/error/warning/info）
     * @param {number} duration - 显示时长（毫秒）
     */
    show(message, type = 'info', duration = this.defaultDuration) {
        // 限制 Toast 数量
        if (this.toasts.length >= this.maxToasts) {
            this.removeToast(this.toasts[0]);
        }
        
        const toast = this.createToast(message, type);
        this.container.appendChild(toast);
        this.toasts.push(toast);
        
        // 动画进入
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 10);
        
        // 自动移除
        if (duration > 0) {
            setTimeout(() => {
                this.removeToast(toast);
            }, duration);
        }
        
        return toast;
    }
    
    /**
     * 创建 Toast 元素
     * @private
     */
    createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        // 获取图标和颜色
        const config = this.getTypeConfig(type);
        
        toast.style.cssText = `
            background: ${config.bg};
            color: ${config.color};
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 250px;
            max-width: 400px;
            opacity: 0;
            transform: translateX(100px);
            transition: all 0.3s ease;
            pointer-events: auto;
            cursor: pointer;
            font-size: 14px;
            border-left: 4px solid ${config.borderColor};
        `;
        
        toast.innerHTML = `
            <span style="font-size: 18px;">${config.icon}</span>
            <span style="flex: 1;">${message}</span>
            <span style="opacity: 0.7; font-size: 12px;">✕</span>
        `;
        
        // 点击关闭
        toast.addEventListener('click', () => {
            this.removeToast(toast);
        });
        
        return toast;
    }
    
    /**
     * 获取类型配置
     * @private
     */
    getTypeConfig(type) {
        const configs = {
            success: {
                icon: '✓',
                bg: '#10b981',
                color: '#ffffff',
                borderColor: '#059669'
            },
            error: {
                icon: '✕',
                bg: '#ef4444',
                color: '#ffffff',
                borderColor: '#dc2626'
            },
            warning: {
                icon: '⚠',
                bg: '#f59e0b',
                color: '#ffffff',
                borderColor: '#d97706'
            },
            info: {
                icon: 'ℹ',
                bg: '#3b82f6',
                color: '#ffffff',
                borderColor: '#2563eb'
            }
        };
        
        return configs[type] || configs.info;
    }
    
    /**
     * 移除 Toast
     * @private
     */
    removeToast(toast) {
        if (!toast || !toast.parentNode) return;
        
        // 动画退出
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            
            const index = this.toasts.indexOf(toast);
            if (index > -1) {
                this.toasts.splice(index, 1);
            }
        }, 300);
    }
    
    /**
     * 快捷方法
     */
    success(message, duration) {
        return this.show(message, 'success', duration);
    }
    
    error(message, duration) {
        return this.show(message, 'error', duration);
    }
    
    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }
    
    info(message, duration) {
        return this.show(message, 'info', duration);
    }
    
    /**
     * 清除所有 Toast
     */
    clearAll() {
        this.toasts.forEach(toast => {
            this.removeToast(toast);
        });
    }
    
    /**
     * 销毁管理器
     */
    destroy() {
        this.clearAll();
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}
