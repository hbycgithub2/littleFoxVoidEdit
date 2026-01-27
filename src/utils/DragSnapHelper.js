// src/utils/DragSnapHelper.js
// 拖拽吸附工具 - 完全遵循 Phaser 3 官方标准
// 功能：自动对齐到其他热区、显示对齐线

export default class DragSnapHelper {
    constructor(scene) {
        this.scene = scene;
        
        // 吸附配置
        this.snapDistance = 10; // 吸附距离（像素）
        this.enabled = true;
        
        // 对齐线（遵循 Phaser 官方标准）
        this.alignLines = null;
        
        // 当前拖拽的热区
        this.draggingHotspot = null;
        
        this.setupEvents();
    }
    
    /**
     * 设置事件监听（遵循 Phaser 官方标准）
     */
    setupEvents() {
        // 监听拖拽开始
        this.scene.events.on('hotspot:dragstart', (hotspot) => {
            this.draggingHotspot = hotspot;
        });
        
        // 监听拖拽中
        this.scene.events.on('hotspot:drag', (hotspot) => {
            if (this.enabled && this.draggingHotspot === hotspot) {
                this.checkSnap(hotspot);
            }
        });
        
        // 监听拖拽结束
        this.scene.events.on('hotspot:dragend', () => {
            this.draggingHotspot = null;
            this.hideAlignLines();
        });
    }
    
    /**
     * 检查吸附（遵循 Phaser 官方标准）
     */
    checkSnap(hotspot) {
        if (!this.scene.hotspots || this.scene.hotspots.length <= 1) return;
        
        const snapInfo = this.findSnapTarget(hotspot);
        
        if (snapInfo) {
            // 应用吸附
            this.applySnap(hotspot, snapInfo);
            
            // 显示对齐线
            this.showAlignLines(snapInfo);
        } else {
            // 隐藏对齐线
            this.hideAlignLines();
        }
    }
    
    /**
     * 查找吸附目标（遵循 Phaser 官方标准）
     */
    findSnapTarget(hotspot) {
        let closestSnap = null;
        let minDistance = this.snapDistance;
        
        // 遍历所有其他热区
        this.scene.hotspots.forEach(other => {
            if (other === hotspot || !other.visible) return;
            
            // 检查水平对齐
            const hSnap = this.checkHorizontalSnap(hotspot, other);
            if (hSnap && hSnap.distance < minDistance) {
                closestSnap = hSnap;
                minDistance = hSnap.distance;
            }
            
            // 检查垂直对齐
            const vSnap = this.checkVerticalSnap(hotspot, other);
            if (vSnap && vSnap.distance < minDistance) {
                closestSnap = vSnap;
                minDistance = vSnap.distance;
            }
        });
        
        return closestSnap;
    }
    
    /**
     * 检查水平对齐（遵循 Phaser 官方标准）
     */
    checkHorizontalSnap(hotspot, other) {
        const distance = Math.abs(hotspot.x - other.x);
        
        if (distance <= this.snapDistance) {
            return {
                type: 'horizontal',
                distance: distance,
                targetX: other.x,
                targetY: null,
                line: {
                    x1: other.x,
                    y1: Math.min(hotspot.y, other.y) - 50,
                    x2: other.x,
                    y2: Math.max(hotspot.y, other.y) + 50
                }
            };
        }
        
        return null;
    }
    
    /**
     * 检查垂直对齐（遵循 Phaser 官方标准）
     */
    checkVerticalSnap(hotspot, other) {
        const distance = Math.abs(hotspot.y - other.y);
        
        if (distance <= this.snapDistance) {
            return {
                type: 'vertical',
                distance: distance,
                targetX: null,
                targetY: other.y,
                line: {
                    x1: Math.min(hotspot.x, other.x) - 50,
                    y1: other.y,
                    x2: Math.max(hotspot.x, other.x) + 50,
                    y2: other.y
                }
            };
        }
        
        return null;
    }
    
    /**
     * 应用吸附（遵循 Phaser 官方标准）
     */
    applySnap(hotspot, snapInfo) {
        if (snapInfo.targetX !== null) {
            hotspot.x = snapInfo.targetX;
        }
        
        if (snapInfo.targetY !== null) {
            hotspot.y = snapInfo.targetY;
        }
        
        // 更新手柄位置
        if (hotspot.updateHandlePositions) {
            hotspot.updateHandlePositions();
        }
    }
    
    /**
     * 显示对齐线（遵循 Phaser 官方标准）
     */
    showAlignLines(snapInfo) {
        if (!this.alignLines) {
            // 使用 Phaser.GameObjects.Graphics 创建对齐线
            this.alignLines = this.scene.add.graphics();
            this.alignLines.setDepth(9998);
        }
        
        this.alignLines.clear();
        this.alignLines.lineStyle(2, 0xff00ff, 0.8);
        
        // 绘制对齐线
        if (snapInfo.line) {
            this.alignLines.lineBetween(
                snapInfo.line.x1,
                snapInfo.line.y1,
                snapInfo.line.x2,
                snapInfo.line.y2
            );
        }
    }
    
    /**
     * 隐藏对齐线（遵循 Phaser 官方标准）
     */
    hideAlignLines() {
        if (this.alignLines) {
            this.alignLines.clear();
        }
    }
    
    /**
     * 启用/禁用吸附（遵循 Phaser 官方标准）
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.hideAlignLines();
        }
    }
    
    /**
     * 设置吸附距离（遵循 Phaser 官方标准）
     */
    setSnapDistance(distance) {
        this.snapDistance = distance;
    }
    
    /**
     * 销毁（遵循 Phaser 官方标准）
     */
    destroy() {
        if (this.alignLines) {
            this.alignLines.destroy();
            this.alignLines = null;
        }
        
        this.scene.events.off('hotspot:dragstart');
        this.scene.events.off('hotspot:drag');
        this.scene.events.off('hotspot:dragend');
    }
}
