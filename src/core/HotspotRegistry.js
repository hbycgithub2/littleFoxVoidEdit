// src/core/HotspotRegistry.js
// 热区注册表 - 管理热区类型的注册和创建

import CircleHotspot from '../phaser/gameobjects/CircleHotspot.js';
import RectHotspot from '../phaser/gameobjects/RectHotspot.js';
import EllipseHotspot from '../phaser/gameobjects/EllipseHotspot.js';
import PolygonHotspot from '../phaser/gameobjects/PolygonHotspot.js';

class HotspotRegistry {
    constructor() {
        this.types = new Map();
        
        // 注册默认类型
        this.register('circle', CircleHotspot);
        this.register('rect', RectHotspot);
        this.register('ellipse', EllipseHotspot);
        this.register('polygon', PolygonHotspot);
    }
    
    /**
     * 注册新的热区类型
     * @param {string} type - 类型名称
     * @param {class} HotspotClass - 热区类（必须继承 Hotspot）
     */
    register(type, HotspotClass) {
        if (this.types.has(type)) {
            console.warn(`Hotspot type "${type}" already registered, overwriting...`);
        }
        this.types.set(type, HotspotClass);
    }
    
    /**
     * 创建热区对象
     * @param {Phaser.Scene} scene - 场景实例
     * @param {object} config - 热区配置
     * @returns {Hotspot} 热区对象
     */
    create(scene, config) {
        const HotspotClass = this.types.get(config.shape);
        
        if (!HotspotClass) {
            throw new Error(`Unknown hotspot type: ${config.shape}`);
        }
        
        return new HotspotClass(scene, config);
    }
    
    /**
     * 获取所有已注册的类型
     */
    getTypes() {
        return Array.from(this.types.keys());
    }
}

// 导出单例
export default new HotspotRegistry();
