// src/utils/Throttle.js
// 防抖和节流工具（性能优化）

/**
 * 节流函数 - 限制函数执行频率
 * @param {Function} func - 要节流的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle(func, delay) {
    let lastTime = 0;
    
    return function(...args) {
        const now = Date.now();
        
        if (now - lastTime >= delay) {
            lastTime = now;
            return func.apply(this, args);
        }
    };
}

/**
 * 防抖函数 - 延迟执行，多次调用只执行最后一次
 * @param {Function} func - 要防抖的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, delay) {
    let timeoutId = null;
    
    return function(...args) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        
        timeoutId = setTimeout(() => {
            func.apply(this, args);
            timeoutId = null;
        }, delay);
    };
}

/**
 * 请求动画帧节流 - 使用 requestAnimationFrame 优化性能
 * @param {Function} func - 要节流的函数
 * @returns {Function} 节流后的函数
 */
export function rafThrottle(func) {
    let rafId = null;
    let lastArgs = null;
    
    return function(...args) {
        lastArgs = args;
        
        if (rafId === null) {
            rafId = requestAnimationFrame(() => {
                func.apply(this, lastArgs);
                rafId = null;
            });
        }
    };
}
