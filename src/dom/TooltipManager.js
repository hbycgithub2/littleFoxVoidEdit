// src/dom/TooltipManager.js
// 工具提示管理器 - 用户体验优化（优先级 4）

export default class TooltipManager {
    constructor() {
        this.tooltip = null;
        this.currentTarget = null;
        this.showDelay = 500;
        this.hideDelay = 100;
        this.showTimer = null;
        this.hideTimer = null;
        
        this.createTooltip();
    }
    
    /**
     * 创建 Tooltip 元素
     * @private
     */
    createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.id = 'tooltip';
        this.tooltip.style.cssText = `
            position: fixed;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 13px;
            pointer-events: none;
            z-index: 10001;
            opacity: 0;
            transition: opacity 0.2s ease;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        `;
        document.body.appendChild(this.tooltip);
    }
    
    /**
     * 为元素添加 Tooltip
     * @param {HTMLElement} element - 目标元素
     * @param {string} text - 提示文本
     * @param {string} position - 位置（top/bottom/left/right）
     */
    attach(element, text, position = 'top') {
        if (!element) return;
        
        element.addEventListener('mouseenter', (e) => {
            this.show(e.target, text, position);
        });
        
        element.addEventListener('mouseleave', () => {
            this.hide();
        });
    }
    
    /**
     * 批量添加 Tooltip（通过 data-tooltip 属性）
     */
    attachAll() {
        const elements = document.querySelectorAll('[data-tooltip]');
        elements.forEach(element => {
            const text = element.getAttribute('data-tooltip');
            const position = element.getAttribute('data-tooltip-position') || 'top';
            this.attach(element, text, position);
        });
    }
    
    /**
     * 显示 Tooltip
     * @param {HTMLElement} target - 目标元素
     * @param {string} text - 提示文本
     * @param {string} position - 位置
     */
    show(target, text, position = 'top') {
        if (!target || !text) return;
        
        // 清除隐藏定时器
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
            this.hideTimer = null;
        }
        
        // 设置显示定时器
        this.showTimer = setTimeout(() => {
            this.currentTarget = target;
            this.tooltip.textContent = text;
            this.updatePosition(target, position);
            this.tooltip.style.opacity = '1';
        }, this.showDelay);
    }
    
    /**
     * 隐藏 Tooltip
     */
    hide() {
        // 清除显示定时器
        if (this.showTimer) {
            clearTimeout(this.showTimer);
            this.showTimer = null;
        }
        
        // 设置隐藏定时器
        this.hideTimer = setTimeout(() => {
            this.tooltip.style.opacity = '0';
            this.currentTarget = null;
        }, this.hideDelay);
    }
    
    /**
     * 更新 Tooltip 位置
     * @private
     */
    updatePosition(target, position) {
        const rect = target.getBoundingClientRect();
        const tooltipRect = this.tooltip.getBoundingClientRect();
        const gap = 8;
        
        let left, top;
        
        switch (position) {
            case 'top':
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                top = rect.top - tooltipRect.height - gap;
                break;
                
            case 'bottom':
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                top = rect.bottom + gap;
                break;
                
            case 'left':
                left = rect.left - tooltipRect.width - gap;
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                break;
                
            case 'right':
                left = rect.right + gap;
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                break;
                
            default:
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                top = rect.top - tooltipRect.height - gap;
        }
        
        // 边界检查
        left = Math.max(gap, Math.min(left, window.innerWidth - tooltipRect.width - gap));
        top = Math.max(gap, Math.min(top, window.innerHeight - tooltipRect.height - gap));
        
        this.tooltip.style.left = left + 'px';
        this.tooltip.style.top = top + 'px';
    }
    
    /**
     * 设置显示延迟
     * @param {number} delay - 延迟时间（毫秒）
     */
    setShowDelay(delay) {
        this.showDelay = delay;
    }
    
    /**
     * 设置隐藏延迟
     * @param {number} delay - 延迟时间（毫秒）
     */
    setHideDelay(delay) {
        this.hideDelay = delay;
    }
    
    /**
     * 销毁管理器
     */
    destroy() {
        if (this.showTimer) clearTimeout(this.showTimer);
        if (this.hideTimer) clearTimeout(this.hideTimer);
        
        if (this.tooltip && this.tooltip.parentNode) {
            this.tooltip.parentNode.removeChild(this.tooltip);
        }
    }
}
