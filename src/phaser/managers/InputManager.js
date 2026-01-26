// src/phaser/managers/InputManager.js
// 输入管理器 - 处理键盘和鼠标输入（遵循 Phaser 3 官方标准）

export default class InputManager {
    constructor(scene) {
        this.scene = scene;
        this.setupInput();
    }
    
    /**
     * 设置输入监听（遵循 Phaser 官方标准）
     */
    setupInput() {
        // 场景点击（用于绘制和取消选择）
        this.scene.input.on('pointerdown', (pointer) => {
            this.handlePointerDown(pointer);
        });
        
        // 鼠标移动（绘制预览）
        this.scene.input.on('pointermove', (pointer) => {
            this.handlePointerMove(pointer);
        });
        
        // 鼠标释放（完成绘制）
        this.scene.input.on('pointerup', (pointer) => {
            this.handlePointerUp(pointer);
        });
        
        // 键盘快捷键
        this.setupKeyboard();
    }
    
    /**
     * 处理鼠标按下
     * @private
     */
    handlePointerDown(pointer) {
        const drawMode = this.scene.registry.get('drawMode');
        
        if (drawMode) {
            // 检查是否在视频控件区域（保护区）
            if (this.isInVideoControlArea(pointer)) {
                // 在控件区域，不处理绘制，让事件穿透到视频
                return;
            }
            
            // 不在控件区域，正常绘制
            if (drawMode === 'polygon') {
                // 多边形绘制：点击添加顶点
                this.scene.polygonDrawingManager.addPoint(pointer.x, pointer.y);
            } else {
                // 其他形状：开始绘制
                this.scene.drawingManager.startDrawing(pointer.x, pointer.y, drawMode);
            }
        } else {
            // 取消选择
            this.scene.selectionManager.clearSelection();
        }
    }
    
    /**
     * 处理鼠标移动
     * @private
     */
    handlePointerMove(pointer) {
        // 只在绘制模式下才更新预览
        const drawMode = this.scene.registry.get('drawMode');
        
        if (drawMode && this.scene.drawingManager.isDrawing) {
            this.scene.drawingManager.updatePreview(pointer.x, pointer.y);
        } else if (drawMode && this.scene.polygonDrawingManager.isDrawing) {
            this.scene.polygonDrawingManager.updatePreview(pointer.x, pointer.y);
        }
    }
    
    /**
     * 处理鼠标释放
     * @private
     */
    handlePointerUp(pointer) {
        if (this.scene.drawingManager.isDrawing) {
            this.scene.drawingManager.finishDrawing(pointer.x, pointer.y);
        }
    }
    
    /**
     * 设置键盘快捷键（遵循 Phaser 官方标准）
     * @private
     */
    setupKeyboard() {
        // Delete 键 - 删除选中的热区
        this.scene.input.keyboard.on('keydown-DELETE', () => {
            this.scene.deleteSelected();
        });
        
        // ESC 键 - 取消绘制模式
        this.scene.input.keyboard.on('keydown-ESC', () => {
            this.cancelDrawing();
        });
        
        // Enter 键 - 完成多边形绘制
        this.scene.input.keyboard.on('keydown-ENTER', () => {
            if (this.scene.polygonDrawingManager.isDrawing) {
                this.scene.polygonDrawingManager.finish();
            }
        });
    }
    
    /**
     * 取消绘制
     */
    cancelDrawing() {
        this.scene.registry.set('drawMode', null);
        this.scene.selectionManager.clearSelection();
        this.scene.drawingManager.cancelDrawing();
        this.scene.polygonDrawingManager.cancel();
    }
    
    /**
     * 检查指针是否在视频控件区域（遵循 Phaser 官方标准）
     * @param {Phaser.Input.Pointer} pointer - Phaser 指针对象
     * @returns {boolean} 是否在视频控件区域
     * @private
     */
    isInVideoControlArea(pointer) {
        const video = document.getElementById('video');
        if (!video) return false;
        
        const canvas = this.scene.game.canvas;
        if (!canvas) return false;
        
        // 获取视频和 Canvas 的屏幕位置
        const videoRect = video.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        
        // 将 Phaser pointer 坐标转换为屏幕坐标
        const screenX = canvasRect.left + pointer.x;
        const screenY = canvasRect.top + pointer.y;
        
        // 定义视频控件保护区高度（底部 50px）
        const controlAreaHeight = 50;
        
        // 判断是否在视频区域内
        const isInVideoX = screenX >= videoRect.left && screenX <= videoRect.right;
        const isInVideoBottomY = screenY >= (videoRect.bottom - controlAreaHeight) && screenY <= videoRect.bottom;
        
        return isInVideoX && isInVideoBottomY;
    }
    
    /**
     * 清理资源
     */
    destroy() {
        // 移除所有事件监听
        this.scene.input.off('pointerdown');
        this.scene.input.off('pointermove');
        this.scene.input.off('pointerup');
        this.scene.input.keyboard.off('keydown-DELETE');
        this.scene.input.keyboard.off('keydown-ESC');
        this.scene.input.keyboard.off('keydown-ENTER');
    }
}

