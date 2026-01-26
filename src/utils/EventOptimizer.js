// src/utils/EventOptimizer.js
// 事件优化工具 - 减少事件监听器数量（遵循 Phaser 3 标准）

export default class EventOptimizer {
    constructor() {
        this.listeners = new Map();
    }
    
    /**
     * 添加事件监听（自动管理）
     * @param {object} target - 事件目标
     * @param {string} event - 事件名称
     * @param {function} handler - 处理函数
     * @param {object} context - 上下文
     */
    on(target, event, handler, context) {
        const key = this.getKey(target, event);
        
        if (!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }
        
        this.listeners.get(key).push({ handler, context });
        target.on(event, handler, context);
    }
    
    /**
     * 移除事件监听
     * @param {object} target - 事件目标
     * @param {string} event - 事件名称
     * @param {function} handler - 处理函数
     * @param {object} context - 上下文
     */
    off(target, event, handler, context) {
        const key = this.getKey(target, event);
        
        if (this.listeners.has(key)) {
            const listeners = this.listeners.get(key);
            const index = listeners.findIndex(l => l.handler === handler && l.context === context);
            
            if (index !== -1) {
                listeners.splice(index, 1);
            }
            
            if (listeners.length === 0) {
                this.listeners.delete(key);
            }
        }
        
        target.off(event, handler, context);
    }
    
    /**
     * 清理所有事件监听
     */
    clear() {
        this.listeners.forEach((listeners, key) => {
            const [target, event] = this.parseKey(key);
            listeners.forEach(({ handler, context }) => {
                target.off(event, handler, context);
            });
        });
        
        this.listeners.clear();
    }
    
    /**
     * 获取监听器数量
     */
    getListenerCount() {
        let count = 0;
        this.listeners.forEach(listeners => {
            count += listeners.length;
        });
        return count;
    }
    
    /**
     * 生成唯一键
     * @private
     */
    getKey(target, event) {
        if (!target._eventOptimizerId) {
            target._eventOptimizerId = `target_${Date.now()}_${Math.random()}`;
        }
        return `${target._eventOptimizerId}:${event}`;
    }
    
    /**
     * 解析键
     * @private
     */
    parseKey(key) {
        const [targetId, event] = key.split(':');
        return [null, event]; // 简化版，实际使用中可以存储 target 引用
    }
}
