// src/core/HotspotPool.js
// 热区对象池 - 性能优化（遵循 Phaser 3 标准）

import hotspotRegistry from './HotspotRegistry.js';

export default class HotspotPool {
    constructor(scene) {
        this.scene = scene;
        this.pools = new Map(); // 按类型分组的对象池
    }
    
    /**
     * 获取热区对象（从池中获取或创建新的）
     * @param {string} type - 热区类型
     * @param {object} config - 热区配置
     * @returns {Hotspot} 热区对象
     */
    acquire(type, config) {
        const pool = this.getPool(type);
        
        let hotspot;
        if (pool.length > 0) {
            // 从池中获取
            hotspot = pool.pop();
            hotspot.reset(config);
        } else {
            // 创建新对象
            hotspot = hotspotRegistry.create(this.scene, config);
        }
        
        return hotspot;
    }
    
    /**
     * 释放热区对象（放回池中）
     * @param {Hotspot} hotspot - 热区对象
     */
    release(hotspot) {
        if (!hotspot || !hotspot.config) return;
        
        const type = hotspot.config.shape;
        const pool = this.getPool(type);
        
        // 隐藏对象
        hotspot.setVisible(false);
        hotspot.setActive(false);
        
        // 放回池中
        pool.push(hotspot);
    }
    
    /**
     * 获取指定类型的对象池
     * @private
     */
    getPool(type) {
        if (!this.pools.has(type)) {
            this.pools.set(type, []);
        }
        return this.pools.get(type);
    }
    
    /**
     * 清空所有对象池
     */
    clear() {
        this.pools.forEach(pool => {
            pool.forEach(hotspot => hotspot.destroy());
            pool.length = 0;
        });
        this.pools.clear();
    }
}
