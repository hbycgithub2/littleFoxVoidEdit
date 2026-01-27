// src/utils/DrawingPresets.js
// 绘制预设模板 - 遵循 Phaser 3 官方标准

export default class DrawingPresets {
    constructor() {
        // 预设模板
        this.presets = {
            // 小型热区
            small: {
                circle: { radius: 30 },
                rect: { width: 50, height: 50 },
                ellipse: { radiusX: 40, radiusY: 30 }
            },
            // 中型热区
            medium: {
                circle: { radius: 60 },
                rect: { width: 100, height: 100 },
                ellipse: { radiusX: 80, radiusY: 60 }
            },
            // 大型热区
            large: {
                circle: { radius: 100 },
                rect: { width: 200, height: 200 },
                ellipse: { radiusX: 150, radiusY: 100 }
            }
        };
    }
    
    /**
     * 获取预设
     * @param {string} size - 尺寸 (small|medium|large)
     * @param {string} shape - 形状 (circle|rect|ellipse)
     * @returns {object} 预设配置
     */
    getPreset(size, shape) {
        if (this.presets[size] && this.presets[size][shape]) {
            return { ...this.presets[size][shape] };
        }
        return null;
    }
    
    /**
     * 创建预设热区
     * @param {Phaser.Scene} scene - 场景
     * @param {string} size - 尺寸
     * @param {string} shape - 形状
     * @param {number} x - X 坐标
     * @param {number} y - Y 坐标
     * @returns {object} 热区配置
     */
    createPresetHotspot(scene, size, shape, x, y) {
        const preset = this.getPreset(size, shape);
        if (!preset) return null;
        
        const videoTime = scene.registry.get('videoTime') || 0;
        
        const config = {
            id: Date.now(),
            shape: shape,
            x: x,
            y: y,
            color: '#00ff00',
            strokeWidth: 3,
            word: '',
            startTime: videoTime,
            endTime: videoTime + 5,
            ...preset
        };
        
        return config;
    }
}
