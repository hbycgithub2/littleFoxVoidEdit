// src/phaser/managers/AlignmentManager.js
// 对齐和分布管理器 - 管理热区的对齐和分布（遵循 Phaser 3 标准）

export default class AlignmentManager {
    constructor(scene) {
        this.scene = scene;
    }
    
    /**
     * 左对齐
     */
    alignLeft() {
        const selected = this.scene.selectionManager.getSelected();
        if (selected.length < 2) return;
        
        // 找到最左边的 x 坐标
        const minX = Math.min(...selected.map(h => h.x));
        
        selected.forEach(hotspot => {
            hotspot.x = minX;
            hotspot.config.x = minX;
            if (hotspot.updateHandlePositions) {
                hotspot.updateHandlePositions();
            }
        });
        
        this.scene.syncToRegistry();
        this.scene.events.emit('hotspots:aligned', { type: 'left' });
    }
    
    /**
     * 右对齐
     */
    alignRight() {
        const selected = this.scene.selectionManager.getSelected();
        if (selected.length < 2) return;
        
        const maxX = Math.max(...selected.map(h => h.x));
        
        selected.forEach(hotspot => {
            hotspot.x = maxX;
            hotspot.config.x = maxX;
            if (hotspot.updateHandlePositions) {
                hotspot.updateHandlePositions();
            }
        });
        
        this.scene.syncToRegistry();
        this.scene.events.emit('hotspots:aligned', { type: 'right' });
    }
    
    /**
     * 水平居中对齐
     */
    alignCenterH() {
        const selected = this.scene.selectionManager.getSelected();
        if (selected.length < 2) return;
        
        const minX = Math.min(...selected.map(h => h.x));
        const maxX = Math.max(...selected.map(h => h.x));
        const centerX = (minX + maxX) / 2;
        
        selected.forEach(hotspot => {
            hotspot.x = centerX;
            hotspot.config.x = centerX;
            if (hotspot.updateHandlePositions) {
                hotspot.updateHandlePositions();
            }
        });
        
        this.scene.syncToRegistry();
        this.scene.events.emit('hotspots:aligned', { type: 'centerH' });
    }
    
    /**
     * 顶部对齐
     */
    alignTop() {
        const selected = this.scene.selectionManager.getSelected();
        if (selected.length < 2) return;
        
        const minY = Math.min(...selected.map(h => h.y));
        
        selected.forEach(hotspot => {
            hotspot.y = minY;
            hotspot.config.y = minY;
            if (hotspot.updateHandlePositions) {
                hotspot.updateHandlePositions();
            }
        });
        
        this.scene.syncToRegistry();
        this.scene.events.emit('hotspots:aligned', { type: 'top' });
    }
    
    /**
     * 底部对齐
     */
    alignBottom() {
        const selected = this.scene.selectionManager.getSelected();
        if (selected.length < 2) return;
        
        const maxY = Math.max(...selected.map(h => h.y));
        
        selected.forEach(hotspot => {
            hotspot.y = maxY;
            hotspot.config.y = maxY;
            if (hotspot.updateHandlePositions) {
                hotspot.updateHandlePositions();
            }
        });
        
        this.scene.syncToRegistry();
        this.scene.events.emit('hotspots:aligned', { type: 'bottom' });
    }
    
    /**
     * 垂直居中对齐
     */
    alignCenterV() {
        const selected = this.scene.selectionManager.getSelected();
        if (selected.length < 2) return;
        
        const minY = Math.min(...selected.map(h => h.y));
        const maxY = Math.max(...selected.map(h => h.y));
        const centerY = (minY + maxY) / 2;
        
        selected.forEach(hotspot => {
            hotspot.y = centerY;
            hotspot.config.y = centerY;
            if (hotspot.updateHandlePositions) {
                hotspot.updateHandlePositions();
            }
        });
        
        this.scene.syncToRegistry();
        this.scene.events.emit('hotspots:aligned', { type: 'centerV' });
    }
    
    /**
     * 水平分布
     */
    distributeH() {
        const selected = this.scene.selectionManager.getSelected();
        if (selected.length < 3) return;
        
        // 按 x 坐标排序
        const sorted = [...selected].sort((a, b) => a.x - b.x);
        const minX = sorted[0].x;
        const maxX = sorted[sorted.length - 1].x;
        const gap = (maxX - minX) / (sorted.length - 1);
        
        sorted.forEach((hotspot, index) => {
            hotspot.x = minX + gap * index;
            hotspot.config.x = hotspot.x;
            if (hotspot.updateHandlePositions) {
                hotspot.updateHandlePositions();
            }
        });
        
        this.scene.syncToRegistry();
        this.scene.events.emit('hotspots:distributed', { type: 'horizontal' });
    }
    
    /**
     * 垂直分布
     */
    distributeV() {
        const selected = this.scene.selectionManager.getSelected();
        if (selected.length < 3) return;
        
        // 按 y 坐标排序
        const sorted = [...selected].sort((a, b) => a.y - b.y);
        const minY = sorted[0].y;
        const maxY = sorted[sorted.length - 1].y;
        const gap = (maxY - minY) / (sorted.length - 1);
        
        sorted.forEach((hotspot, index) => {
            hotspot.y = minY + gap * index;
            hotspot.config.y = hotspot.y;
            if (hotspot.updateHandlePositions) {
                hotspot.updateHandlePositions();
            }
        });
        
        this.scene.syncToRegistry();
        this.scene.events.emit('hotspots:distributed', { type: 'vertical' });
    }
    
    /**
     * 对齐到画布中心
     */
    alignToCanvas() {
        const selected = this.scene.selectionManager.getSelected();
        if (selected.length === 0) return;
        
        const centerX = this.scene.cameras.main.width / 2;
        const centerY = this.scene.cameras.main.height / 2;
        
        selected.forEach(hotspot => {
            hotspot.x = centerX;
            hotspot.y = centerY;
            hotspot.config.x = centerX;
            hotspot.config.y = centerY;
            if (hotspot.updateHandlePositions) {
                hotspot.updateHandlePositions();
            }
        });
        
        this.scene.syncToRegistry();
        this.scene.events.emit('hotspots:aligned', { type: 'canvas' });
    }
}
