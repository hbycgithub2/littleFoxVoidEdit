// src/utils/SmartSnapHelper.js
// 智能吸附辅助工具 - 遵循 Phaser 3 官方标准

export default class SmartSnapHelper {
    constructor(scene) {
        this.scene = scene;
        this.enabled = false;
        this.snapDistance = 10; // 吸附距离
        this.snapGraphics = null;
    }
    
    /**
     * 启用智能吸附
     */
    enable() {
        this.enabled = true;
        if (!this.snapGraphics) {
            this.snapGraphics = this.scene.add.graphics();
            this.snapGraphics.setDepth(1000);
        }
    }
    
    /**
     * 禁用智能吸附
     */
    disable() {
        this.enabled = false;
        if (this.snapGraphics) {
            this.snapGraphics.clear();
        }
    }
    
    /**
     * 切换智能吸附
     */
    toggle() {
        if (this.enabled) {
            this.disable();
        } else {
            this.enable();
        }
    }
    
    /**
     * 智能吸附到其他热区
     * @param {number} x - X 坐标
     * @param {number} y - Y 坐标
     * @returns {object} 吸附后的坐标和吸附信息 {x, y, snapped, snapType}
     */
    snap(x, y) {
        if (!this.enabled) {
            return { x, y, snapped: false };
        }
        
        const hotspots = this.scene.hotspots || [];
        let bestSnap = { x, y, snapped: false };
        let minDistance = this.snapDistance;
        
        // 清除之前的吸附线
        if (this.snapGraphics) {
            this.snapGraphics.clear();
        }
        
        // 检查所有热区
        for (const hotspot of hotspots) {
            if (!hotspot.visible) continue;
            
            const snapPoints = this.getHotspotSnapPoints(hotspot);
            
            for (const point of snapPoints) {
                const distance = Math.sqrt(
                    Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2)
                );
                
                if (distance < minDistance) {
                    minDistance = distance;
                    bestSnap = {
                        x: point.x,
                        y: point.y,
                        snapped: true,
                        snapType: point.type
                    };
                }
            }
        }
        
        // 绘制吸附指示
        if (bestSnap.snapped && this.snapGraphics) {
            this.snapGraphics.lineStyle(2, 0xff00ff, 1);
            this.snapGraphics.strokeCircle(bestSnap.x, bestSnap.y, 8);
            this.snapGraphics.fillStyle(0xff00ff, 0.3);
            this.snapGraphics.fillCircle(bestSnap.x, bestSnap.y, 8);
        }
        
        return bestSnap;
    }
    
    /**
     * 获取热区的吸附点
     * @private
     */
    getHotspotSnapPoints(hotspot) {
        const points = [];
        const config = hotspot.config;
        
        // 中心点
        points.push({ x: config.x, y: config.y, type: 'center' });
        
        // 根据形状添加边缘点
        if (config.shape === 'rect') {
            const hw = config.width / 2;
            const hh = config.height / 2;
            points.push(
                { x: config.x - hw, y: config.y - hh, type: 'corner' },
                { x: config.x + hw, y: config.y - hh, type: 'corner' },
                { x: config.x - hw, y: config.y + hh, type: 'corner' },
                { x: config.x + hw, y: config.y + hh, type: 'corner' },
                { x: config.x, y: config.y - hh, type: 'edge' },
                { x: config.x, y: config.y + hh, type: 'edge' },
                { x: config.x - hw, y: config.y, type: 'edge' },
                { x: config.x + hw, y: config.y, type: 'edge' }
            );
        } else if (config.shape === 'circle') {
            const r = config.radius;
            points.push(
                { x: config.x + r, y: config.y, type: 'edge' },
                { x: config.x - r, y: config.y, type: 'edge' },
                { x: config.x, y: config.y + r, type: 'edge' },
                { x: config.x, y: config.y - r, type: 'edge' }
            );
        }
        
        return points;
    }
    
    /**
     * 清理资源
     */
    destroy() {
        if (this.snapGraphics) {
            this.snapGraphics.destroy();
            this.snapGraphics = null;
        }
    }
}
