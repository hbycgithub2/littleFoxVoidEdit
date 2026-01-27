// src/utils/AdvancedDragHelper.js
// 高级拖拽功能 - 完全遵循 Phaser 3 官方标准
// 功能：Ctrl拖拽复制、Alt从中心缩放

export default class AdvancedDragHelper {
    constructor(scene) {
        this.scene = scene;
        
        // 复制拖拽状态
        this.isDraggingCopy = false;
        this.copiedHotspots = [];
        
        // Alt 缩放状态
        this.isAltResize = false;
        this.resizeCenter = null;
        
        this.setupEvents();
    }
    
    /**
     * 设置事件监听（遵循 Phaser 官方标准）
     */
    setupEvents() {
        // 监听拖拽开始（检测 Ctrl 键）
        this.scene.events.on('hotspot:dragstart', (hotspot, pointer) => {
            if (pointer.event.ctrlKey || pointer.event.metaKey) {
                this.startCopyDrag(hotspot);
            }
        });
        
        // 监听拖拽结束
        this.scene.events.on('hotspot:dragend', (hotspot) => {
            if (this.isDraggingCopy) {
                this.finishCopyDrag(hotspot);
            }
        });
        
        // 监听缩放开始（检测 Alt 键）
        this.scene.events.on('hotspot:resizestart', (hotspot, handleIndex) => {
            // Alt 键从中心缩放
            if (this.scene.input.keyboard.addKey('ALT').isDown) {
                this.isAltResize = true;
                this.resizeCenter = { x: hotspot.x, y: hotspot.y };
                console.log('🎯 Alt 从中心缩放已启用');
            }
        });
        
        // 监听缩放结束
        this.scene.events.on('hotspot:resized', () => {
            this.isAltResize = false;
            this.resizeCenter = null;
        });
    }
    
    /**
     * 开始复制拖拽（遵循 Phaser 官方标准）
     */
    startCopyDrag(hotspot) {
        this.isDraggingCopy = true;
        
        // 获取选中的热区
        const selected = this.scene.selectionManager.getSelected();
        const hotspotsToCopy = selected.length > 0 ? selected : [hotspot];
        
        // 创建副本
        this.copiedHotspots = hotspotsToCopy.map(h => {
            const config = { ...h.config };
            config.id = Date.now() + Math.random();
            
            // 创建新热区
            this.scene.addHotspot(config);
            
            // 获取新创建的热区
            const newHotspot = this.scene.hotspots.find(nh => nh.config.id === config.id);
            
            return {
                original: h,
                copy: newHotspot,
                offset: { x: h.x - hotspot.x, y: h.y - hotspot.y }
            };
        });
        
        // 隐藏原始热区（视觉上看起来像在拖拽副本）
        hotspotsToCopy.forEach(h => {
            h.setAlpha(0.3);
        });
        
        console.log('📋 复制拖拽已开始:', this.copiedHotspots.length);
    }
    
    /**
     * 完成复制拖拽（遵循 Phaser 官方标准）
     */
    finishCopyDrag(hotspot) {
        if (!this.isDraggingCopy) return;
        
        // 恢复原始热区的透明度
        this.copiedHotspots.forEach(item => {
            item.original.setAlpha(1);
        });
        
        // 更新副本位置
        this.copiedHotspots.forEach(item => {
            if (item.copy) {
                item.copy.x = hotspot.x + item.offset.x;
                item.copy.y = hotspot.y + item.offset.y;
                item.copy.config.x = item.copy.x;
                item.copy.config.y = item.copy.y;
                
                if (item.copy.updateHandlePositions) {
                    item.copy.updateHandlePositions();
                }
            }
        });
        
        // 选中新创建的热区
        this.scene.selectionManager.clearSelection();
        this.copiedHotspots.forEach(item => {
            if (item.copy) {
                this.scene.selectionManager.select(item.copy, true);
            }
        });
        
        console.log('✅ 复制拖拽已完成:', this.copiedHotspots.length);
        
        // 清理
        this.isDraggingCopy = false;
        this.copiedHotspots = [];
    }
    
    /**
     * Alt 从中心缩放（遵循 Phaser 官方标准）
     */
    resizeFromCenter(hotspot, handleIndex, dragX, dragY, pointer) {
        if (!this.isAltResize || !this.resizeCenter) {
            // 正常缩放
            return false;
        }
        
        // 计算从中心点的距离
        const dx = dragX - this.resizeCenter.x;
        const dy = dragY - this.resizeCenter.y;
        
        if (hotspot.config.shape === 'rect') {
            // 矩形从中心缩放
            const newWidth = Math.abs(dx) * 2;
            const newHeight = Math.abs(dy) * 2;
            
            // 限制最小尺寸
            const minSize = 20;
            hotspot.config.width = Math.max(minSize, newWidth);
            hotspot.config.height = Math.max(minSize, newHeight);
            
            // 保持中心点不变
            hotspot.x = this.resizeCenter.x;
            hotspot.y = this.resizeCenter.y;
            hotspot.config.x = this.resizeCenter.x;
            hotspot.config.y = this.resizeCenter.y;
            
        } else if (hotspot.config.shape === 'circle') {
            // 圆形从中心缩放
            const newRadius = Math.sqrt(dx * dx + dy * dy);
            
            // 限制最小半径
            const minRadius = 10;
            hotspot.config.radius = Math.max(minRadius, newRadius);
            
            // 保持中心点不变
            hotspot.x = this.resizeCenter.x;
            hotspot.y = this.resizeCenter.y;
            hotspot.config.x = this.resizeCenter.x;
            hotspot.config.y = this.resizeCenter.y;
            
        } else if (hotspot.config.shape === 'ellipse') {
            // 椭圆从中心缩放
            const newRadiusX = Math.abs(dx);
            const newRadiusY = Math.abs(dy);
            
            // 限制最小半径
            const minRadius = 10;
            hotspot.config.radiusX = Math.max(minRadius, newRadiusX);
            hotspot.config.radiusY = Math.max(minRadius, newRadiusY);
            
            // 保持中心点不变
            hotspot.x = this.resizeCenter.x;
            hotspot.y = this.resizeCenter.y;
            hotspot.config.x = this.resizeCenter.x;
            hotspot.config.y = this.resizeCenter.y;
        }
        
        // 更新视觉
        hotspot.markDirty();
        hotspot.updateVisual();
        hotspot.updateHandlePositions();
        
        // 更新交互区域
        const hitArea = hotspot.getHitArea();
        hotspot.setInteractive(hitArea.shape, hitArea.callback);
        
        console.log('🎯 Alt 从中心缩放:', {
            shape: hotspot.config.shape,
            center: this.resizeCenter
        });
        
        return true;
    }
    
    /**
     * 销毁（遵循 Phaser 官方标准）
     */
    destroy() {
        this.copiedHotspots = [];
        
        this.scene.events.off('hotspot:dragstart');
        this.scene.events.off('hotspot:dragend');
        this.scene.events.off('hotspot:resizestart');
        this.scene.events.off('hotspot:resized');
    }
}
