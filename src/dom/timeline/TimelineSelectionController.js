// src/dom/timeline/TimelineSelectionController.js
// 时间轴选择控制器 - 管理时间条的多选功能

/**
 * 时间轴选择控制器
 * 职责：
 * 1. 管理选中的热区时间条
 * 2. 支持 Ctrl+点击多选
 * 3. 支持框选功能
 * 4. 绘制选中高亮
 * 5. 支持批量操作
 */
export default class TimelineSelectionController {
    constructor(timelinePanel) {
        this.timeline = timelinePanel;
        this.scene = timelinePanel.scene;
        
        // 选中的热区 ID 集合
        this.selectedIds = new Set();
        
        // 框选状态
        this.isBoxSelecting = false;
        this.boxStartX = 0;
        this.boxStartY = 0;
        this.boxEndX = 0;
        this.boxEndY = 0;
        
        // 监听键盘事件（Ctrl/Cmd 键）
        this.isCtrlPressed = false;
        this.setupKeyboardEvents();
    }
    
    /**
     * 设置键盘事件监听
     */
    setupKeyboardEvents() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Control' || e.key === 'Meta') {
                this.isCtrlPressed = true;
            }
        });
        
        window.addEventListener('keyup', (e) => {
            if (e.key === 'Control' || e.key === 'Meta') {
                this.isCtrlPressed = false;
            }
        });
    }
    
    /**
     * 选择热区
     * @param {string} hotspotId - 热区 ID
     * @param {boolean} isCtrlClick - 是否 Ctrl+点击
     */
    selectHotspot(hotspotId, isCtrlClick = false) {
        if (isCtrlClick) {
            // Ctrl+点击：切换选中状态
            if (this.selectedIds.has(hotspotId)) {
                this.selectedIds.delete(hotspotId);
            } else {
                this.selectedIds.add(hotspotId);
            }
        } else {
            // 普通点击：清空其他选择，只选中当前
            this.selectedIds.clear();
            this.selectedIds.add(hotspotId);
        }
        
        // 发送选择变化事件
        this.emitSelectionChanged();
        
        // 触发重绘
        this.timeline.render();
    }
    
    /**
     * 清空选择
     */
    clearSelection() {
        if (this.selectedIds.size > 0) {
            this.selectedIds.clear();
            this.emitSelectionChanged();
            this.timeline.render();
        }
    }
    
    /**
     * 检查热区是否被选中
     * @param {string} hotspotId - 热区 ID
     * @returns {boolean} 是否选中
     */
    isSelected(hotspotId) {
        return this.selectedIds.has(hotspotId);
    }
    
    /**
     * 获取选中的热区数量
     * @returns {number} 选中数量
     */
    getSelectionCount() {
        return this.selectedIds.size;
    }
    
    /**
     * 获取选中的热区 ID 数组
     * @returns {Array<string>} 热区 ID 数组
     */
    getSelectedIds() {
        return Array.from(this.selectedIds);
    }
    
    /**
     * 开始框选
     * @param {number} x - 起始 X 坐标
     * @param {number} y - 起始 Y 坐标
     */
    startBoxSelection(x, y) {
        this.isBoxSelecting = true;
        this.boxStartX = x;
        this.boxStartY = y;
        this.boxEndX = x;
        this.boxEndY = y;
    }
    
    /**
     * 更新框选区域
     * @param {number} x - 当前 X 坐标
     * @param {number} y - 当前 Y 坐标
     */
    updateBoxSelection(x, y) {
        if (!this.isBoxSelecting) return;
        
        this.boxEndX = x;
        this.boxEndY = y;
        
        // 触发重绘（显示框选框）
        this.timeline.render();
    }
    
    /**
     * 结束框选
     */
    endBoxSelection() {
        if (!this.isBoxSelecting) return;
        
        // 计算框选区域
        const minX = Math.min(this.boxStartX, this.boxEndX);
        const maxX = Math.max(this.boxStartX, this.boxEndX);
        const minY = Math.min(this.boxStartY, this.boxEndY);
        const maxY = Math.max(this.boxStartY, this.boxEndY);
        
        // 查找框选区域内的热区
        const hotspots = this.scene.registry.get('hotspots') || [];
        const selectedInBox = [];
        
        hotspots.forEach(config => {
            const barY = this.timeline.layerGroupController.getHotspotY(config);
            if (barY === null) return; // 图层折叠时跳过
            
            const x1 = config.startTime * this.timeline.scale;
            const x2 = config.endTime * this.timeline.scale;
            const barHeight = 20;
            
            // 检查时间条是否与框选区域相交
            const isIntersecting = 
                x2 >= minX && x1 <= maxX &&
                barY + barHeight >= minY && barY <= maxY;
            
            if (isIntersecting) {
                selectedInBox.push(config.id);
            }
        });
        
        // 更新选择（根据 Ctrl 键决定是追加还是替换）
        if (this.isCtrlPressed) {
            // Ctrl+框选：追加选择
            selectedInBox.forEach(id => this.selectedIds.add(id));
        } else {
            // 普通框选：替换选择
            this.selectedIds.clear();
            selectedInBox.forEach(id => this.selectedIds.add(id));
        }
        
        this.isBoxSelecting = false;
        this.emitSelectionChanged();
        this.timeline.render();
    }
    
    /**
     * 取消框选
     */
    cancelBoxSelection() {
        if (this.isBoxSelecting) {
            this.isBoxSelecting = false;
            this.timeline.render();
        }
    }
    
    /**
     * 绘制选中高亮
     * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
     */
    drawSelectionHighlight(ctx) {
        if (this.selectedIds.size === 0) return;
        
        const hotspots = this.scene.registry.get('hotspots') || [];
        const barHeight = 20;
        
        hotspots.forEach(config => {
            if (!this.isSelected(config.id)) return;
            
            const barY = this.timeline.layerGroupController.getHotspotY(config);
            if (barY === null) return; // 图层折叠时跳过
            
            const x1 = config.startTime * this.timeline.scale;
            const x2 = config.endTime * this.timeline.scale;
            const width = x2 - x1;
            
            // 绘制高亮边框（黄色）
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 3;
            ctx.strokeRect(x1 - 1, barY - 1, width + 2, barHeight + 2);
            
            // 绘制半透明黄色覆盖层
            ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
            ctx.fillRect(x1, barY, width, barHeight);
        });
    }
    
    /**
     * 绘制框选框
     * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
     */
    drawBoxSelection(ctx) {
        if (!this.isBoxSelecting) return;
        
        const x = Math.min(this.boxStartX, this.boxEndX);
        const y = Math.min(this.boxStartY, this.boxEndY);
        const width = Math.abs(this.boxEndX - this.boxStartX);
        const height = Math.abs(this.boxEndY - this.boxStartY);
        
        // 绘制半透明蓝色填充
        ctx.fillStyle = 'rgba(100, 150, 255, 0.2)';
        ctx.fillRect(x, y, width, height);
        
        // 绘制蓝色边框
        ctx.strokeStyle = '#6496ff';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(x, y, width, height);
        ctx.setLineDash([]);
    }
    
    /**
     * 批量删除选中的热区
     */
    deleteSelected() {
        if (this.selectedIds.size === 0) return;
        
        const ids = Array.from(this.selectedIds);
        
        // 使用命令模式批量删除
        ids.forEach(id => {
            this.scene.removeHotspot(id);
        });
        
        this.clearSelection();
    }
    
    /**
     * 批量移动选中的热区时间
     * @param {number} deltaTime - 时间偏移量（秒）
     */
    moveSelectedTime(deltaTime) {
        if (this.selectedIds.size === 0) return;
        
        const hotspots = this.scene.registry.get('hotspots') || [];
        
        hotspots.forEach(config => {
            if (this.isSelected(config.id)) {
                config.startTime = Math.max(0, config.startTime + deltaTime);
                config.endTime = Math.max(config.startTime + 0.1, config.endTime + deltaTime);
                
                // 更新场景中的热区
                const hotspot = this.scene.hotspots.find(h => h.config.id === config.id);
                if (hotspot) {
                    hotspot.config.startTime = config.startTime;
                    hotspot.config.endTime = config.endTime;
                }
            }
        });
        
        this.scene.syncToRegistry();
        this.timeline.render();
    }
    
    /**
     * 发送选择变化事件（遵循 Phaser 标准）
     */
    emitSelectionChanged() {
        this.scene.events.emit('timeline:selectionChanged', {
            selectedIds: Array.from(this.selectedIds),
            count: this.selectedIds.size
        });
    }
    
    /**
     * 清理资源
     */
    destroy() {
        this.selectedIds.clear();
        console.log('TimelineSelectionController destroyed');
    }
}
