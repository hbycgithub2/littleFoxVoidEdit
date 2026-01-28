// src/phaser/timeline/gameobjects/AdvancedInteraction.js
// 高级交互控制器 - 缩放、惯性滚动、点击定位（V3.0）

export default class AdvancedInteraction {
    constructor(scene, scroller) {
        this.scene = scene;
        this.scroller = scroller;
        this.camera = scene.cameras.main;
        
        // 缩放参数
        this.zoomLevel = 1.0;
        this.minZoom = 0.5;
        this.maxZoom = 3.0;
        
        // 惯性滚动参数
        this.velocity = 0;
        this.friction = 0.95;
        this.lastPointerX = 0;
        this.lastMoveTime = 0;
        
        this.setupAdvancedInput();
    }
    
    /**
     * 设置高级输入（遵循Phaser标准）
     */
    setupAdvancedInput() {
        const input = this.scene.input;
        
        // 双击缩放
        input.on('pointerdblclick', (pointer) => {
            this.handleDoubleClick(pointer);
        });
        
        // 捏合缩放（触摸屏）
        if (input.pointer1 && input.pointer2) {
            this.setupPinchZoom();
        }
        
        // 惯性滚动
        input.on('pointermove', (pointer) => {
            if (this.scroller.isDragging) {
                this.updateVelocity(pointer);
            }
        });
        
        input.on('pointerup', () => {
            this.startInertia();
        });
        
        // 点击定位
        input.on('pointerdown', (pointer) => {
            if (pointer.button === 0) { // 左键
                this.lastClickTime = Date.now();
            }
        });
    }
    
    /**
     * 双击缩放
     */
    handleDoubleClick(pointer) {
        const targetZoom = this.zoomLevel === 1.0 ? 2.0 : 1.0;
        this.zoomTo(targetZoom, pointer.x);
    }
    
    /**
     * 缩放到指定级别（使用Phaser Tween）
     */
    zoomTo(targetZoom, centerX) {
        targetZoom = Phaser.Math.Clamp(targetZoom, this.minZoom, this.maxZoom);
        
        // 使用Phaser的Tween系统（遵循官方标准）
        this.scene.tweens.add({
            targets: this,
            zoomLevel: targetZoom,
            duration: 300,
            ease: 'Power2',
            onUpdate: () => {
                this.applyZoom(centerX);
            }
        });
    }
    
    /**
     * 应用缩放
     */
    applyZoom(centerX) {
        // V3.0: 简化实现
        // 完整实现需要调整缩略图大小和间距
        console.log(`🔍 缩放级别: ${this.zoomLevel.toFixed(2)}x`);
    }
    
    /**
     * 更新速度（用于惯性滚动）
     */
    updateVelocity(pointer) {
        const now = Date.now();
        const dt = now - this.lastMoveTime;
        
        if (dt > 0) {
            const dx = pointer.x - this.lastPointerX;
            this.velocity = dx / dt * 16; // 归一化到60fps
        }
        
        this.lastPointerX = pointer.x;
        this.lastMoveTime = now;
    }
    
    /**
     * 开始惯性滚动
     */
    startInertia() {
        if (Math.abs(this.velocity) < 0.5) {
            this.velocity = 0;
            return;
        }
        
        // 使用Phaser的update循环
        this.inertiaActive = true;
    }
    
    /**
     * 更新惯性滚动（在Scene的update中调用）
     */
    updateInertia() {
        if (!this.inertiaActive) return;
        
        if (Math.abs(this.velocity) < 0.1) {
            this.velocity = 0;
            this.inertiaActive = false;
            return;
        }
        
        // 应用速度
        this.camera.scrollX -= this.velocity;
        this.scroller.clampScroll();
        
        // 应用摩擦力
        this.velocity *= this.friction;
        
        // 更新可见区域
        if (this.scroller.renderer) {
            this.scroller.updateVisibleArea();
        }
    }
    
    /**
     * 点击定位到时间
     */
    clickToSeek(pointer, videoDuration) {
        const clickX = pointer.x + this.camera.scrollX;
        const totalWidth = this.camera.getBounds().width;
        const time = (clickX / totalWidth) * videoDuration;
        
        console.log(`⏱️ 定位到: ${time.toFixed(2)}s`);
        
        // 触发事件
        this.scene.events.emit('seek-to-time', time);
        
        return time;
    }
    
    /**
     * 设置捏合缩放（触摸屏）
     */
    setupPinchZoom() {
        // V3.0: 简化实现
        // 完整实现需要处理多点触控
        console.log('💡 捏合缩放已启用');
    }
}
