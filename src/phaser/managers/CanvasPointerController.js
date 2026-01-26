// src/phaser/managers/CanvasPointerController.js
// Canvas 指针事件控制器 - 动态管理 Canvas 的 pointer-events（遵循 Phaser 3 官方标准）

export default class CanvasPointerController {
    constructor(scene) {
        this.scene = scene;
        this.canvas = null;
        
        this.init();
    }
    
    /**
     * 初始化控制器（遵循 Phaser 官方标准）
     */
    init() {
        // 获取 Phaser Canvas 元素
        this.canvas = this.scene.game.canvas;
        
        if (!this.canvas) {
            console.warn('CanvasPointerController: Canvas 元素未找到');
            return;
        }
        
        // 监听 drawMode 变化（遵循 Phaser Registry 模式）
        this.scene.registry.events.on('changedata-drawMode', this.onDrawModeChange, this);
        
        // 初始化状态
        this.updatePointerEvents(this.scene.registry.get('drawMode'));
    }
    
    /**
     * 处理 drawMode 变化
     * @param {Phaser.Data.DataManager} parent - Registry 实例
     * @param {string|null} value - 新的 drawMode 值
     * @private
     */
    onDrawModeChange(parent, value) {
        this.updatePointerEvents(value);
    }
    
    /**
     * 更新 Canvas 的 pointer-events 属性
     * @param {string|null} drawMode - 当前绘制模式
     * @private
     */
    updatePointerEvents(drawMode) {
        if (!this.canvas) return;
        
        if (drawMode) {
            // 绘制模式激活：允许 Canvas 接收事件
            this.canvas.style.pointerEvents = 'auto';
            console.log('CanvasPointerController: Canvas pointer-events = auto');
        } else {
            // 绘制模式关闭：Canvas 不拦截事件，让视频进度条可用
            this.canvas.style.pointerEvents = 'none';
            console.log('CanvasPointerController: Canvas pointer-events = none');
        }
    }
    
    /**
     * 清理资源（遵循 Phaser 官方标准）
     */
    destroy() {
        if (this.scene && this.scene.registry) {
            this.scene.registry.events.off('changedata-drawMode', this.onDrawModeChange, this);
        }
        
        this.canvas = null;
        this.scene = null;
    }
}
