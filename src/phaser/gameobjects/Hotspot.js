// src/phaser/gameobjects/Hotspot.js
// 热区抽象基类 - 完全遵循 Phaser 3 官方标准

export default class Hotspot extends Phaser.GameObjects.Graphics {
    constructor(scene, config) {
        super(scene);
        
        // 保存配置
        this.config = config;
        
        // 设置位置
        this.setPosition(config.x, config.y);
        
        // 状态
        this.isSelected = false;
        this.isHovered = false;
        
        // 性能优化：脏标记（dirty flag）
        this._isDirty = true;
        this._lastDrawnState = null;
        
        // ✅ 先设置样式，再绘制
        this.updateVisual();
        
        // 设置交互（遵循 Phaser 官方标准）
        this.setupInteractive();
        
        // 设置拖拽（遵循 Phaser 官方标准）
        this.setupDraggable();
        
        // 设置缩放手柄（遵循 Phaser 官方标准）
        this.setupResizeHandles();
        
        // ❌ 不要在这里添加到场景！
        // 应该由 EditorScene.addHotspot() 添加到 hotspotContainer
        // scene.add.existing(this);
        
        console.log('🎨 Hotspot构造完成:', {
            id: config.id,
            shape: config.shape,
            x: this.x,
            y: this.y,
            visible: this.visible,
            active: this.active
        });
    }
    
    /**
     * 抽象方法：绘制形状（子类必须实现）
     */
    draw() {
        throw new Error('draw() must be implemented by subclass');
    }
    
    /**
     * 抽象方法：获取碰撞区域（子类必须实现）
     */
    getHitArea() {
        throw new Error('getHitArea() must be implemented by subclass');
    }
    
    /**
     * 设置交互（遵循 Phaser 官方标准）
     */
    setupInteractive() {
        const hitArea = this.getHitArea();
        this.setInteractive(hitArea.shape, hitArea.callback);
        
        // 点击事件
        this.on('pointerdown', (pointer, localX, localY, event) => {
            // 阻止事件冒泡到场景
            event.stopPropagation();
            
            // 检测是否多选（Ctrl/Cmd 键）
            const multiSelect = pointer.event.ctrlKey || pointer.event.metaKey;
            
            // 发送选择事件
            this.scene.events.emit('hotspot:clicked', this, multiSelect);
        });
        
        // 悬停事件
        this.on('pointerover', () => {
            this.isHovered = true;
            this.updateVisual();
            this.scene.input.setDefaultCursor('pointer');
        });
        
        this.on('pointerout', () => {
            this.isHovered = false;
            this.updateVisual();
            this.scene.input.setDefaultCursor('default');
        });
    }
    
    /**
     * 设置拖拽（遵循 Phaser 官方标准）
     */
    setupDraggable() {
        this.scene.input.setDraggable(this);
        
        // 记录拖拽开始位置
        this.on('dragstart', () => {
            this.dragStartPos = { x: this.x, y: this.y };
        });
        
        // 拖拽中（性能优化：使用节流）
        this.on('drag', (pointer, dragX, dragY) => {
            this.x = dragX;
            this.y = dragY;
            
            // 更新缩放手柄位置
            if (this.resizeHandles) {
                this.updateHandlePositions();
            }
        });
        
        // 拖拽结束
        this.on('dragend', () => {
            // 更新配置
            this.config.x = this.x;
            this.config.y = this.y;
            
            // 发送移动事件（用于撤销/重做）
            this.scene.events.emit('hotspot:moved', {
                hotspot: this,
                oldPos: this.dragStartPos,
                newPos: { x: this.x, y: this.y }
            });
        });
    }
    
    /**
     * 设置缩放手柄（遵循 Phaser 官方标准）
     */
    setupResizeHandles() {
        this.resizeHandles = [];
        this.showHandles = false;
        
        // 创建 8 个缩放手柄
        const handleSize = 8;
        const positions = this.getHandlePositions();
        
        positions.forEach((pos, index) => {
            // 使用 Phaser.GameObjects.Circle 创建手柄
            const handle = this.scene.add.circle(0, 0, handleSize, 0xffffff, 1);
            handle.setStrokeStyle(2, 0x000000);
            
            // 设置交互（遵循 Phaser 官方标准）
            handle.setInteractive({ cursor: pos.cursor });
            
            // 设置为可拖拽（遵循 Phaser 官方标准）
            this.scene.input.setDraggable(handle);
            
            // 存储手柄信息
            handle.handleIndex = index;
            handle.hotspot = this;
            
            // 拖拽事件
            handle.on('dragstart', () => {
                this.resizeStartSize = this.getCurrentSize();
                this.resizeStartPos = { x: this.x, y: this.y };
            });
            
            handle.on('drag', (pointer, dragX, dragY) => {
                this.onHandleDrag(index, dragX, dragY);
            });
            
            handle.on('dragend', () => {
                // 发送缩放事件（用于撤销/重做）
                this.scene.events.emit('hotspot:resized', {
                    hotspot: this,
                    oldSize: this.resizeStartSize,
                    newSize: this.getCurrentSize(),
                    oldPos: this.resizeStartPos,
                    newPos: { x: this.x, y: this.y }
                });
            });
            
            // 初始隐藏
            handle.setVisible(false);
            
            this.resizeHandles.push(handle);
        });
        
        this.updateHandlePositions();
    }
    
    /**
     * 获取手柄位置（子类可重写）
     */
    getHandlePositions() {
        // 默认返回 8 个方向
        return [
            { cursor: 'nw-resize' },  // 左上
            { cursor: 'n-resize' },   // 上
            { cursor: 'ne-resize' },  // 右上
            { cursor: 'e-resize' },   // 右
            { cursor: 'se-resize' },  // 右下
            { cursor: 's-resize' },   // 下
            { cursor: 'sw-resize' },  // 左下
            { cursor: 'w-resize' }    // 左
        ];
    }
    
    /**
     * 更新手柄位置（子类必须实现）
     */
    updateHandlePositions() {
        // 子类实现
    }
    
    /**
     * 处理手柄拖拽（子类必须实现）
     */
    onHandleDrag(handleIndex, dragX, dragY) {
        // 子类实现
    }
    
    /**
     * 获取当前尺寸（子类必须实现）
     */
    getCurrentSize() {
        // 子类实现
        return {};
    }
    
    /**
     * 显示/隐藏缩放手柄
     */
    setHandlesVisible(visible) {
        if (!this.resizeHandles) return;
        
        this.showHandles = visible;
        this.resizeHandles.forEach(handle => {
            handle.setVisible(visible);
        });
    }
    
    /**
     * 设置选中状态
     */
    setSelected(selected) {
        this.isSelected = selected;
        this.updateVisual();
        
        // 显示/隐藏缩放手柄
        this.setHandlesVisible(selected);
    }
    
    /**
     * 标记为脏（需要重绘）
     */
    markDirty() {
        this._isDirty = true;
    }
    
    /**
     * 更新视觉效果（性能优化：使用脏标记减少重复绘制）
     */
    updateVisual() {
        // 性能优化：缓存颜色值避免重复转换
        if (!this._cachedColors) {
            this._cachedColors = {};
        }
        
        let color = this.config.color || '#00ff00';
        let strokeWidth = this.config.strokeWidth || 3;
        
        if (this.isSelected) {
            color = '#ff0000';      // 选中时红色
            strokeWidth = 5;
        } else if (this.isHovered) {
            color = '#ffff00';      // 悬停时黄色
            strokeWidth = 4;
        }
        
        // 性能优化：检查状态是否真的改变了
        const currentState = `${color}-${strokeWidth}`;
        if (this._lastDrawnState === currentState && !this._isDirty) {
            return; // 状态未变化，跳过重绘
        }
        
        // 使用缓存的颜色值
        if (!this._cachedColors[color]) {
            this._cachedColors[color] = Phaser.Display.Color.HexStringToColor(color).color;
        }
        const colorValue = this._cachedColors[color];
        
        console.log('🎨 updateVisual():', {
            id: this.config.id,
            color: color,
            colorValue: colorValue.toString(16),
            strokeWidth: strokeWidth,
            visible: this.visible
        });
        
        this.clear();
        this.lineStyle(strokeWidth, colorValue);
        this.draw();
        
        // 更新状态
        this._lastDrawnState = currentState;
        this._isDirty = false;
    }
    
    /**
     * 检查是否应该显示（根据视频时间）
     */
    shouldShow(videoTime) {
        const result = videoTime >= this.config.startTime && 
               videoTime <= this.config.endTime;
        
        console.log('🔍 shouldShow检查:', {
            hotspotId: this.config.id,
            shape: this.config.shape,
            videoTime: videoTime,
            startTime: this.config.startTime,
            endTime: this.config.endTime,
            result: result
        });
        
        return result;
    }
    
    /**
     * 生命周期方法（遵循 Phaser 官方标准）
     */
    preUpdate(time, delta) {
        // 子类可以重写此方法
    }
    
    /**
     * 销毁时清理
     */
    destroy(fromScene) {
        // 销毁缩放手柄
        if (this.resizeHandles) {
            this.resizeHandles.forEach(handle => handle.destroy());
            this.resizeHandles = null;
        }
        
        // 移除所有事件监听
        this.removeAllListeners();
        
        // 调用父类销毁
        super.destroy(fromScene);
    }
}
