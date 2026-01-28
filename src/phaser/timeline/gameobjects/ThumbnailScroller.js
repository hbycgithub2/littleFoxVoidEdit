// src/phaser/timeline/gameobjects/ThumbnailScroller.js
// 滚动控制器 - 处理时间轴滚动交互（V2.0 - 虚拟滚动）

export default class ThumbnailScroller {
    constructor(scene, renderer) {
        this.scene = scene;
        this.renderer = renderer; // V2.0: 需要renderer来更新可见区域
        this.camera = scene.cameras.main;
        this.isDragging = false;
        this.dragStartX = 0;
        this.scrollStartX = 0;
        this.lastScrollX = 0;
        
        this.setupInput();
    }
    
    /**
     * 设置输入监听（遵循Phaser标准）
     */
    setupInput() {
        const input = this.scene.input;
        
        // 拖拽开始
        input.on('pointerdown', (pointer) => {
            this.isDragging = true;
            this.dragStartX = pointer.x;
            this.scrollStartX = this.camera.scrollX;
        });
        
        // 拖拽中
        input.on('pointermove', (pointer) => {
            if (!this.isDragging) return;
            
            const deltaX = this.dragStartX - pointer.x;
            this.camera.scrollX = this.scrollStartX + deltaX;
            
            // 限制滚动范围
            this.clampScroll();
            
            // V2.0: 更新可见区域
            this.updateVisibleArea();
        });
        
        // 拖拽结束
        input.on('pointerup', () => {
            this.isDragging = false;
        });
        
        // 滚轮滚动
        input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            this.camera.scrollX += deltaY * 0.5;
            this.clampScroll();
            
            // V2.0: 更新可见区域
            this.updateVisibleArea();
        });
    }
    
    /**
     * V2.0: 更新可见区域（节流）
     */
    updateVisibleArea() {
        // 节流：只在滚动距离超过阈值时更新
        const threshold = 50;
        if (Math.abs(this.camera.scrollX - this.lastScrollX) > threshold) {
            this.lastScrollX = this.camera.scrollX;
            
            if (this.renderer && this.renderer.renderVisibleThumbnails) {
                this.renderer.renderVisibleThumbnails();
            }
        }
    }
    
    /**
     * 限制滚动范围
     */
    clampScroll() {
        const bounds = this.camera.getBounds();
        const maxScrollX = Math.max(0, bounds.width - this.camera.width);
        this.camera.scrollX = Phaser.Math.Clamp(
            this.camera.scrollX,
            0,
            maxScrollX
        );
    }
    
    /**
     * 滚动到指定位置
     * @param {number} x
     */
    scrollTo(x) {
        this.camera.scrollX = x;
        this.clampScroll();
    }
    
    /**
     * 获取当前滚动位置
     */
    getScrollX() {
        return this.camera.scrollX;
    }
}
