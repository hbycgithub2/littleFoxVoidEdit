// src/utils/DragResizeHelper.js
// 拖拽和缩放增强工具 - 完全遵循 Phaser 3 官方标准
// 功能：多选拖拽、Shift保持比例、视觉反馈

export default class DragResizeHelper {
    constructor(scene) {
        this.scene = scene;
        
        // 多选拖拽状态
        this.isDraggingMultiple = false;
        this.dragStartPositions = new Map();
        this.dragOffset = { x: 0, y: 0 };
        this.currentSelectedHotspots = [];
        this.draggedHotspot = null;
        
        // Shift 键状态（保持比例）
        this.isShiftPressed = false;
        
        // 视觉反馈（遵循 Phaser 官方标准）
        this.dragPreview = null;
        this.resizePreview = null;
        
        this.setupEvents();
        this.setupKeyboard();
    }
    
    /**
     * 设置事件监听（遵循 Phaser 官方标准）
     */
    setupEvents() {
        // 监听选择变化
        this.scene.events.on('selection:changed', (data) => {
            this.updateMultiDrag(data.selected);
        });
        
        // 监听热区拖拽开始
        this.scene.events.on('hotspot:dragstart', (hotspot, pointer) => {
            this.onDragStart(hotspot, pointer);
        });
        
        // 监听热区拖拽中
        this.scene.events.on('hotspot:drag', (hotspot, pointer) => {
            this.onDrag(hotspot, pointer);
        });
        
        // 监听热区拖拽结束
        this.scene.events.on('hotspot:dragend', (hotspot) => {
            this.onDragEnd(hotspot);
        });
    }
    
    /**
     * 设置键盘监听（遵循 Phaser 官方标准）
     */
    setupKeyboard() {
        // 监听 Shift 键
        this.scene.input.keyboard.on('keydown-SHIFT', () => {
            this.isShiftPressed = true;
        });
        
        this.scene.input.keyboard.on('keyup-SHIFT', () => {
            this.isShiftPressed = false;
        });
    }
    
    /**
     * 更新多选拖拽（遵循 Phaser 官方标准）
     */
    updateMultiDrag(selectedHotspots) {
        // 清除旧的拖拽监听
        this.clearMultiDrag();
        
        if (selectedHotspots.length <= 1) {
            this.currentSelectedHotspots = [];
            return;
        }
        
        // 保存当前选中的热区
        this.currentSelectedHotspots = selectedHotspots;
    }
    
    /**
     * 多选拖拽开始（遵循 Phaser 官方标准）
     */
    onMultiDragStart(selectedHotspots, draggedHotspot, pointer) {
        this.isDraggingMultiple = true;
        this.draggedHotspot = draggedHotspot;
        this.dragStartPositions.clear();
        
        // 记录所有选中热区的初始位置
        selectedHotspots.forEach(hotspot => {
            this.dragStartPositions.set(hotspot, {
                x: hotspot.x,
                y: hotspot.y
            });
        });
        
        console.log('🎯 多选拖拽开始:', {
            count: selectedHotspots.length,
            draggedId: draggedHotspot.config.id
        });
    }
    
    /**
     * 多选拖拽中（遵循 Phaser 官方标准）
     */
    onMultiDrag(selectedHotspots, draggedHotspot, dragX, dragY) {
        if (!this.isDraggingMultiple) return;
        
        // 计算拖拽偏移量
        const startPos = this.dragStartPositions.get(draggedHotspot);
        const offsetX = dragX - startPos.x;
        const offsetY = dragY - startPos.y;
        
        // 移动所有选中的热区
        selectedHotspots.forEach(hotspot => {
            const originalPos = this.dragStartPositions.get(hotspot);
            hotspot.x = originalPos.x + offsetX;
            hotspot.y = originalPos.y + offsetY;
            
            // 更新缩放手柄位置
            if (hotspot.updateHandlePositions) {
                hotspot.updateHandlePositions();
            }
        });
        
        // 更新拖拽预览
        this.updateDragPreview(offsetX, offsetY);
    }
    
    /**
     * 多选拖拽结束（遵循 Phaser 官方标准）
     */
    onMultiDragEnd(selectedHotspots) {
        if (!this.isDraggingMultiple) return;
        
        console.log('🎯 多选拖拽结束:', {
            count: selectedHotspots.length
        });
        
        // 更新所有热区的配置
        selectedHotspots.forEach(hotspot => {
            hotspot.config.x = hotspot.x;
            hotspot.config.y = hotspot.y;
        });
        
        // 发送移动事件（用于撤销/重做）
        this.scene.events.emit('hotspots:moved', {
            hotspots: selectedHotspots,
            startPositions: Array.from(this.dragStartPositions.entries()).map(([h, pos]) => ({
                id: h.config.id,
                pos: pos
            })),
            endPositions: selectedHotspots.map(h => ({
                id: h.config.id,
                pos: { x: h.x, y: h.y }
            }))
        });
        
        // 清理
        this.isDraggingMultiple = false;
        this.draggedHotspot = null;
        this.dragStartPositions.clear();
        this.destroyDragPreview();
    }
    
    /**
     * 创建拖拽预览（遵循 Phaser 官方标准）
     */
    createDragPreview(selectedHotspots) {
        if (this.dragPreview) {
            this.dragPreview.destroy();
        }
        
        // 使用 Phaser.GameObjects.Graphics 创建预览
        this.dragPreview = this.scene.add.graphics();
        this.dragPreview.setDepth(9999);
        this.dragPreview.lineStyle(2, 0x00ff00, 0.5);
        
        // 绘制所有选中热区的边界框
        selectedHotspots.forEach(hotspot => {
            if (hotspot.config.shape === 'rect') {
                const w = hotspot.config.width / 2;
                const h = hotspot.config.height / 2;
                this.dragPreview.strokeRect(
                    hotspot.x - w,
                    hotspot.y - h,
                    hotspot.config.width,
                    hotspot.config.height
                );
            } else if (hotspot.config.shape === 'circle') {
                this.dragPreview.strokeCircle(
                    hotspot.x,
                    hotspot.y,
                    hotspot.config.radius
                );
            } else if (hotspot.config.shape === 'ellipse') {
                this.dragPreview.strokeEllipse(
                    hotspot.x,
                    hotspot.y,
                    hotspot.config.radiusX,
                    hotspot.config.radiusY
                );
            }
        });
        
        console.log('🎨 创建拖拽预览:', selectedHotspots.length);
    }
    
    /**
     * 更新拖拽预览（遵循 Phaser 官方标准）
     */
    updateDragPreview(offsetX, offsetY) {
        // 多选拖拽时不需要预览，因为热区本身会移动
        // 这个方法保留用于未来可能的增强
    }
    
    /**
     * 销毁拖拽预览（遵循 Phaser 官方标准）
     */
    destroyDragPreview() {
        if (this.dragPreview) {
            this.dragPreview.destroy();
            this.dragPreview = null;
        }
    }
    
    /**
     * 清除多选拖拽（遵循 Phaser 官方标准）
     */
    clearMultiDrag() {
        this.isDraggingMultiple = false;
        this.draggedHotspot = null;
        this.dragStartPositions.clear();
        this.destroyDragPreview();
    }
    
    /**
     * 单选/多选拖拽开始（遵循 Phaser 官方标准）
     */
    onDragStart(hotspot, pointer) {
        // 检查是否是多选拖拽
        if (this.currentSelectedHotspots.length > 1 && 
            this.currentSelectedHotspots.includes(hotspot)) {
            this.onMultiDragStart(this.currentSelectedHotspots, hotspot, pointer);
        }
    }
    
    /**
     * 单选/多选拖拽中（遵循 Phaser 官方标准）
     */
    onDrag(hotspot, pointer) {
        // 检查是否是多选拖拽
        if (this.isDraggingMultiple && this.draggedHotspot === hotspot) {
            this.onMultiDrag(this.currentSelectedHotspots, hotspot, hotspot.x, hotspot.y);
        }
    }
    
    /**
     * 单选/多选拖拽结束（遵循 Phaser 官方标准）
     */
    onDragEnd(hotspot) {
        // 检查是否是多选拖拽
        if (this.isDraggingMultiple && this.draggedHotspot === hotspot) {
            this.onMultiDragEnd(this.currentSelectedHotspots);
        }
    }
    
    /**
     * 增强缩放功能 - 添加 Shift 保持比例（遵循 Phaser 官方标准）
     */
    enhanceResize(hotspot) {
        if (!hotspot.resizeHandles) return;
        
        // 为每个缩放手柄添加 Shift 保持比例功能
        hotspot.resizeHandles.forEach((handle, index) => {
            // 移除原有的拖拽事件
            handle.off('drag');
            
            // 添加新的拖拽事件（支持 Shift 保持比例）
            handle.on('drag', (pointer, dragX, dragY) => {
                this.onHandleDragWithRatio(hotspot, index, dragX, dragY, pointer);
            });
        });
    }
    
    /**
     * 处理手柄拖拽（支持 Shift 保持比例）（遵循 Phaser 官方标准）
     */
    onHandleDragWithRatio(hotspot, handleIndex, dragX, dragY, pointer) {
        // 检查是否按下 Alt 键（从中心缩放）
        const altPressed = pointer.event.altKey || this.scene.input.keyboard.addKey('ALT').isDown;
        
        if (altPressed && this.scene.advancedDragHelper) {
            // Alt 从中心缩放
            const handled = this.scene.advancedDragHelper.resizeFromCenter(
                hotspot, handleIndex, dragX, dragY, pointer
            );
            if (handled) return;
        }
        
        // 检查是否按下 Shift 键（保持比例）
        const keepRatio = pointer.event.shiftKey || this.isShiftPressed;
        
        if (keepRatio && hotspot.config.shape === 'rect') {
            // 矩形保持宽高比
            this.resizeRectWithRatio(hotspot, handleIndex, dragX, dragY);
        } else if (keepRatio && hotspot.config.shape === 'ellipse') {
            // 椭圆保持宽高比（变成圆形）
            this.resizeEllipseWithRatio(hotspot, handleIndex, dragX, dragY);
        } else {
            // 正常缩放（调用原有方法）
            hotspot.onHandleDrag(handleIndex, dragX, dragY, pointer);
        }
    }
    
    /**
     * 矩形保持宽高比缩放（遵循 Phaser 官方标准）
     */
    resizeRectWithRatio(hotspot, handleIndex, dragX, dragY) {
        const startSize = hotspot.resizeStartSize || hotspot.getCurrentSize();
        const ratio = startSize.width / startSize.height;
        
        const w = hotspot.config.width / 2;
        const h = hotspot.config.height / 2;
        
        let newWidth, newHeight, newX, newY;
        
        // 根据手柄索引计算新尺寸（保持比例）
        switch (handleIndex) {
            case 0: // 左上
                {
                    const dx = hotspot.x + w - dragX;
                    const dy = hotspot.y + h - dragY;
                    const avgDelta = Math.max(dx, dy);
                    
                    newWidth = avgDelta * 2;
                    newHeight = newWidth / ratio;
                    
                    newX = hotspot.x + w - newWidth / 2;
                    newY = hotspot.y + h - newHeight / 2;
                }
                break;
                
            case 2: // 右上
                {
                    const dx = dragX - (hotspot.x - w);
                    const dy = hotspot.y + h - dragY;
                    const avgDelta = Math.max(dx, dy);
                    
                    newWidth = avgDelta * 2;
                    newHeight = newWidth / ratio;
                    
                    newX = hotspot.x - w + newWidth / 2;
                    newY = hotspot.y + h - newHeight / 2;
                }
                break;
                
            case 4: // 右下
                {
                    const dx = dragX - (hotspot.x - w);
                    const dy = dragY - (hotspot.y - h);
                    const avgDelta = Math.max(dx, dy);
                    
                    newWidth = avgDelta * 2;
                    newHeight = newWidth / ratio;
                    
                    newX = hotspot.x - w + newWidth / 2;
                    newY = hotspot.y - h + newHeight / 2;
                }
                break;
                
            case 6: // 左下
                {
                    const dx = hotspot.x + w - dragX;
                    const dy = dragY - (hotspot.y - h);
                    const avgDelta = Math.max(dx, dy);
                    
                    newWidth = avgDelta * 2;
                    newHeight = newWidth / ratio;
                    
                    newX = hotspot.x + w - newWidth / 2;
                    newY = hotspot.y - h + newHeight / 2;
                }
                break;
                
            default:
                // 边手柄：正常缩放
                hotspot.onHandleDrag(handleIndex, dragX, dragY);
                return;
        }
        
        // 限制最小尺寸
        const minSize = 20;
        newWidth = Math.max(minSize, newWidth);
        newHeight = Math.max(minSize, newHeight);
        
        // 更新热区
        hotspot.x = newX;
        hotspot.y = newY;
        hotspot.config.x = newX;
        hotspot.config.y = newY;
        hotspot.config.width = newWidth;
        hotspot.config.height = newHeight;
        
        hotspot.markDirty();
        hotspot.updateVisual();
        hotspot.updateHandlePositions();
        
        const hitArea = hotspot.getHitArea();
        hotspot.setInteractive(hitArea.shape, hitArea.callback);
        
        console.log('📐 保持比例缩放:', {
            width: Math.round(newWidth),
            height: Math.round(newHeight),
            ratio: (newWidth / newHeight).toFixed(2)
        });
    }
    
    /**
     * 椭圆保持宽高比缩放（变成圆形）（遵循 Phaser 官方标准）
     */
    resizeEllipseWithRatio(hotspot, handleIndex, dragX, dragY) {
        // 计算到中心的距离
        const dx = dragX - hotspot.x;
        const dy = dragY - hotspot.y;
        const newRadius = Math.sqrt(dx * dx + dy * dy);
        
        // 限制最小和最大半径
        const minRadius = 10;
        const maxRadius = 500;
        const clampedRadius = Math.max(minRadius, Math.min(maxRadius, newRadius));
        
        // 同时更新 X 和 Y 半径（变成圆形）
        hotspot.config.radiusX = clampedRadius;
        hotspot.config.radiusY = clampedRadius;
        
        hotspot.markDirty();
        hotspot.updateVisual();
        hotspot.updateHandlePositions();
        
        const hitArea = hotspot.getHitArea();
        hotspot.setInteractive(hitArea.shape, hitArea.callback);
    }
    
    /**
     * 销毁（遵循 Phaser 官方标准）
     */
    destroy() {
        this.clearMultiDrag();
        
        if (this.resizePreview) {
            this.resizePreview.destroy();
            this.resizePreview = null;
        }
        
        // 移除事件监听
        this.scene.events.off('selection:changed');
        this.scene.events.off('hotspot:dragstart');
        this.scene.events.off('hotspot:drag');
        this.scene.events.off('hotspot:dragend');
        
        this.scene.input.keyboard.off('keydown-SHIFT');
        this.scene.input.keyboard.off('keyup-SHIFT');
    }
}
